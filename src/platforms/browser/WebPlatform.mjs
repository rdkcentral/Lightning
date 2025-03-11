/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 Metrological
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Utils from "../../tree/Utils.mjs";
import ImageWorker from "./ImageWorker.mjs";

/**
 * Platform-specific functionality.
 */
export default class WebPlatform {

    init(stage) {
        this.stage = stage;
        this._looping = false;
        this._awaitingLoop = false;

        // Alternative handler to avoid RAF when idle
        this._loopHandler = null;
        this._idleLoopCounter = 0;
        this._idleLoopDelay = 60;
        this._onIdle = false;

        if (this.stage.getOption("useImageWorker")) {
            if (!window.createImageBitmap || !window.Worker) {
                console.warn("[Lightning] Can't use image worker because browser does not have createImageBitmap and Web Worker support");
            } else {
                this._imageWorker = new ImageWorker();
            }
        }

        this._registerVisibilityChangeHandler();
    }

    destroy() {
        if (this._imageWorker) {
            this._imageWorker.destroy();
        }

        clearInterval(this._loopHandler);

        this._removeKeyHandler();
        this._removeClickHandler();
        this._removeHoverHandler();
        this._removeScrollWheelHandler();
        this._removeVisibilityChangeHandler();

        this.stage = null;
        delete this.stage;
    }

    startLoop() {
        this._looping = true;
        if (!this._awaitingLoop) {
            this.loop();
        }
    }

    stopLoop() {
        this._looping = false;
    }

    switchLoop() {
        if (this._onIdle === false) {
            this._onIdle = true;
            this.stage.onIdle();
        }

        if (this._idleLoopCounter < this._idleLoopDelay) {
            this._idleLoopCounter++;
            return;
        }
        if (!this.stage.ctx.hasRenderUpdates()) {
            this.stopLoop();
            this._loopHandler = setInterval(() => {
                this.stage.updateFrame();
                this.stage.idleFrame();
                if (this.stage.ctx.hasRenderUpdates()) {
                    clearInterval(this._loopHandler);
                    this.startLoop();
                };
            }, 1000 / 60);
        } else {
            this._idleLoopCounter = 0;
        }
    }

    loop() {
        let self = this;
        let lp = function () {
            self._awaitingLoop = false;
            self._onIdle = false;
            if (self._looping) {
                self.stage.updateFrame();
                if (self.stage.getOption("pauseRafLoopOnIdle")) {
                    self.switchLoop();
                }
                self.stage.renderFrame();
                requestAnimationFrame(lp);
                self._awaitingLoop = true;
            }
        }
        requestAnimationFrame(lp);
    }

    uploadCompressedGlTexture(gl, textureSource, source, options) {
        const view = !source.pvr ? new DataView(source.mipmaps[0]) : source.mipmaps[0];
        gl.compressedTexImage2D(
            gl.TEXTURE_2D,
            0,
            source.glInternalFormat,
            source.pixelWidth,
            source.pixelHeight,
            0,
            view,
        )
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }

    uploadGlTexture(gl, textureSource, source, options) {
        if (source instanceof ImageData || source instanceof HTMLImageElement || source instanceof HTMLVideoElement || (window.ImageBitmap && source instanceof ImageBitmap)) {
            // Web-specific data types.
            gl.texImage2D(gl.TEXTURE_2D, 0, options.internalFormat, options.format, options.type, source);
        } else if (source instanceof HTMLCanvasElement) {
            if (Utils.isZiggo || this.stage.getOption("forceTxCanvasSource")) {
                // Ziggo EOS and Selene have issues with getImageData implementation causing artifacts.
                gl.texImage2D(gl.TEXTURE_2D, 0, options.internalFormat, options.format, options.type, source);
            } else if (source.width > 0 && source.height > 0) {
                // Workaround for some browsers (e.g. Tizen) as they do not convert canvas data to texture correctly, sometimes causing artifacts.
                // Width/Height check added because of https://github.com/rdkcentral/Lightning/issues/412
                const ctx = source.getContext('2d');
                gl.texImage2D(gl.TEXTURE_2D, 0, options.internalFormat, options.format, options.type, ctx.getImageData(0, 0, source.width, source.height));
            }
        } else {
            gl.texImage2D(gl.TEXTURE_2D, 0, options.internalFormat, textureSource.w, textureSource.h, 0, options.format, options.type, source);
        }
    }

    /**
     * KTX File format specification
     * https://www.khronos.org/registry/KTX/specs/1.0/ktxspec_v1.html
     **/
    handleKtxLoad(cb, src) {
        var self = this;
        return function () {
            var arraybuffer = this.response;
            var view = new DataView(arraybuffer);

            // identifier, big endian
            var targetIdentifier = 3632701469
            if (targetIdentifier !== (view.getUint32(0) + view.getUint32(4) + view.getUint32(8))) {
                cb('Parsing failed: identifier ktx mismatch:', src)
            }

            var littleEndian = (view.getUint32(12) === 16909060) ? true : false;
            var data = {
                glType: view.getUint32(16, littleEndian),
                glTypeSize: view.getUint32(20, littleEndian),
                glFormat: view.getUint32(24, littleEndian),
                glInternalFormat: view.getUint32(28, littleEndian),
                glBaseInternalFormat: view.getUint32(32, littleEndian),
                pixelWidth: view.getUint32(36, littleEndian),
                pixelHeight: view.getUint32(40, littleEndian),
                pixelDepth: view.getUint32(44, littleEndian),
                numberOfArrayElements: view.getUint32(48, littleEndian),
                numberOfFaces: view.getUint32(52, littleEndian),
                numberOfMipmapLevels: view.getUint32(56, littleEndian),
                bytesOfKeyValueData: view.getUint32(60, littleEndian),
                kvps: [],
                mipmaps: [],
                get width() { return this.pixelWidth },
                get height() { return this.pixelHeight },
            };

            const props = (obj) => {
                const p = [];
                for (let v in obj) {
                    p.push(obj[v]);
                }
                return p;
            }

            const formats = Object.values(self.stage.renderer.getCompressedTextureExtensions())
                .filter((obj) => obj != null)
                .map((obj) => props(obj))
                .reduce((prev, current) => prev.concat(current));

            if (!formats.includes(data.glInternalFormat)) {
                console.warn("[Lightning] Unrecognized texture extension format:", src, data.glInternalFormat, self.stage.renderer.getCompressedTextureExtensions());
            }

            var offset = 64
            // Key Value Pairs of data start at byte offset 64
            // But the only known kvp is the API version, so skipping parsing.
            offset += data.bytesOfKeyValueData;

            for (var i = 0; i < data.numberOfMipmapLevels; i++) {
                var imageSize = view.getUint32(offset);
                offset += 4;
                data.mipmaps.push(view.buffer.slice(offset, imageSize));
                offset += imageSize
            }

            cb(null, {
                source: data,
                renderInfo: { src: src, compressed: true },
            })
        }
    }

    handlePvrLoad(cb, src) {
        return function () {
            // pvr header length in 32 bits
            const pvrHeaderLength = 13;
            // for now only we only support: COMPRESSED_RGB_ETC1_WEBGL
            const pvrFormatEtc1 = 0x8D64;
            const pvrWidth = 7;
            const pvrHeight = 6;
            const pvrMipmapCount = 11;
            const pvrMetadata = 12;
            const arrayBuffer = this.response;
            const header = new Int32Array(arrayBuffer, 0, pvrHeaderLength);
            const dataOffset = header[pvrMetadata] + 52;
            const pvrtcData = new Uint8Array(arrayBuffer, dataOffset);

            var data = {
                glInternalFormat: pvrFormatEtc1,
                pixelWidth: header[pvrWidth],
                pixelHeight: header[pvrHeight],
                numberOfMipmapLevels: header[pvrMipmapCount],
                mipmaps: [],
                pvr: true,
                get width() { return this.pixelWidth },
                get height() { return this.pixelHeight },
            };

            let offset = 0
            let width = data.pixelWidth;
            let height = data.pixelHeight;

            for (var i = 0; i < data.numberOfMipmapLevels; i++) {
                const level = ((width + 3) >> 2) * ((height + 3) >> 2) * 8;
                const view = new Uint8Array(arrayBuffer, pvrtcData.byteOffset + offset, level);
                data.mipmaps.push(view);
                offset += level;
                width = width >> 1;
                height = height >> 1;
            }

            cb(null, {
                source: data,
                renderInfo: { src: src, compressed: true },
            })
        }
    }

    loadSrcTexture({ src, hasAlpha }, cb) {
        let cancelCb = undefined;
        let isPng = (src.toLowerCase().indexOf(".png") >= 0) || src.substr(0, 21) == 'data:image/png;base64';
        let isKtx = src.indexOf('.ktx') >= 0;
        let isPvr = src.indexOf('.pvr') >= 0;
        if (isKtx || isPvr) {
            let request = new XMLHttpRequest();
            request.addEventListener(
                "load", isKtx ? this.handleKtxLoad(cb, src) : this.handlePvrLoad(cb, src)
            );
            request.open("GET", src);
            request.responseType = "arraybuffer";
            request.send();
            cancelCb = function () {
                request.abort();
            }
        } else if (this._imageWorker) {
            // WPE-specific image parser.
            if (typeof src !== 'string') {
                return cb("Invalid image URL");
            }
            
            // URL can start with http://, https://, and //
            const separatorPos = src.indexOf('//');
            if (separatorPos !== 0 && separatorPos !== 5 && separatorPos !== 6) {
                return cb("Invalid image URL");
            }

            const image = this._imageWorker.create(src);
            image.onError = function (err) {
                return cb("Image load error");
            };
            image.onLoad = function ({ imageBitmap, hasAlphaChannel }) {
                cb(null, {
                    source: imageBitmap,
                    renderInfo: { src: src, compressed: false },
                    hasAlpha: hasAlphaChannel,
                    premultiplyAlpha: true
                });
            };
            cancelCb = function () {
                image.cancel();
            }
        } else {
            let image = new Image();

            // On the PS4 platform setting the `crossOrigin` attribute on
            // images can cause CORS failures.
            if (!(src.substr(0, 5) == "data:") && !Utils.isPS4) {
                // Base64.
                image.crossOrigin = "Anonymous";
            }
            image.onerror = function (err) {
                // Ignore error message when cancelled.
                if (image.src) {
                    return cb("Image load error");
                }
            };
            image.onload = function () {
                cb(null, {
                    source: image,
                    renderInfo: { src: src, compressed: false },
                    hasAlpha: isPng || hasAlpha
                });
            };
            image.src = src;

            cancelCb = function () {
                image.onerror = null;
                image.onload = null;
                image.removeAttribute('src');
            }
        }

        return cancelCb;
    }

    createWebGLContext(w, h) {
        let canvas = this.stage.getOption('canvas') || document.createElement('canvas');

        if (w && h) {
            canvas.width = w;
            canvas.height = h;
        }

        let opts = {
            alpha: true,
            antialias: false,
            premultipliedAlpha: true,
            stencil: true,
            preserveDrawingBuffer: false
        };

        let gl = canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl', opts) || canvas.getContext('webgl2', opts);

        if (!gl) {
            throw new Error('This browser does not support webGL.');
        }

        return gl;
    }

    createCanvasContext(w, h) {
        let canvas = this.stage.getOption('canvas') || document.createElement('canvas');

        if (w && h) {
            canvas.width = w;
            canvas.height = h;
        }

        let c2d = canvas.getContext('2d');
        if (!c2d) {
            throw new Error('This browser does not support 2d canvas.');
        }

        return c2d;
    }

    getHrTime() {
        return window.performance ? window.performance.now() : (new Date()).getTime();
    }

    getDrawingCanvas() {
        // We can't reuse this canvas because textures may load async.
        return document.createElement('canvas');
    }

    getTextureOptionsForDrawingCanvas(canvas) {
        let options = {};
        options.source = canvas;
        return options;
    }

    nextFrame(changes) {
        /* WebGL blits automatically */
    }

    registerKeydownHandler(keyhandler) {
        this._keydownListener = (e) => {
            keyhandler(e);
        };
        window.addEventListener('keydown', this._keydownListener);
    }

    registerKeyupHandler(keyhandler) {
        this._keyupListener = (e) => {
            keyhandler(e);
        };
        window.addEventListener('keyup', this._keyupListener);
    }

    _removeKeyHandler() {
        if (this._keydownListener) {
            window.removeEventListener('keydown', this._keydownListener);
        }

        if (this._keyupListener) {
            window.removeEventListener('keyup', this._keyupListener);
        }
    }

    registerClickHandler(clickHandler) {
        this._clickListener = e => {
            clickHandler(e);
        };
        window.addEventListener('mousedown', this._clickListener);
    }

    _removeClickHandler() {
        if (this._clickListener) {
            window.removeEventListener('mousedown', this._clickListener);
        }
    }

    registerHoverHandler(hoverHandler) {
        this._hoverListener = e => {
            hoverHandler(e);
        };
        window.addEventListener('mousemove', this._hoverListener);
    }

    _removeHoverHandler() {
        if (this._hoverListener) {
            window.removeEventListener('mousemove', this._hoverListener);
        }
    }

    registerScrollWheelHandler(registerScrollWheelHandler) {
        this._scrollWheelListener = e => {
            registerScrollWheelHandler(e);
        }
        window.addEventListener('wheel', this._scrollWheelListener);
    }

    _removeScrollWheelHandler() {
        if (this._scrollWheelListener) {
            window.removeEventListener('wheel', this._scrollWheelListener);
        }
    }

    /**
     * Fix for issue reported at: https://github.com/WebPlatformForEmbedded/WPEWebKit/issues/882
     */
    _registerVisibilityChangeHandler() {
        this._visibilityChangeHandler = () => {
            if (document.visibilityState === 'visible') {
                this.stage.root.core.setHasRenderUpdates(2);
                this.stage.renderFrame();
            }
        }
        document.addEventListener('visibilitychange', this._visibilityChangeHandler);
    }

    _removeVisibilityChangeHandler() {
        if (this._visibilityChangeHandler) {
            document.removeEventListener('visibilitychange', this._visibilityChangeHandler);
        }
    }
}
