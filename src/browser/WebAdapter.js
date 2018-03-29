/**
 * Platform-specific functionality.
 * Copyright Metrological, 2017
 */
class WebAdapter {

    init(stage) {
        this.stage = stage;
        this.canvas = null;
        this._looping = false;
        this._awaitingLoop = false;
        if (window.imageparser) {
            let WpeImageParser = require('./WpeImageParser');
            this.wpeImageParser = new WpeImageParser();
        } else {
            this.wpeImageParser = null;
        }
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

    loop() {
        let self = this;
        let lp = function() {
            self._awaitingLoop = false;
            if (self._looping) {
                self.stage.drawFrame();
                requestAnimationFrame(lp);
                self._awaitingLoop = true;
            }
        }
        requestAnimationFrame(lp);
    }

    uploadGlTexture(gl, textureSource, source, hasAlpha) {
        let format = hasAlpha ? gl.RGBA : gl.RGB;
        if (source instanceof ImageData || source instanceof HTMLImageElement || source instanceof HTMLCanvasElement || source instanceof HTMLVideoElement || (window.ImageBitmap && source instanceof ImageBitmap)) {
            // Web-specific data types.
            gl.texImage2D(gl.TEXTURE_2D, 0, format, format, gl.UNSIGNED_BYTE, source);
        } else {
            gl.texImage2D(gl.TEXTURE_2D, 0, format, textureSource.w, textureSource.h, 0, format, gl.UNSIGNED_BYTE, source);
        }
    }

    loadSrcTexture(src, cb) {
        let cancelCb = undefined
        let isPng = (src.indexOf(".png") >= 0)
        if (this.wpeImageParser) {
            // WPE-specific image parser.
            var oReq = this.wpeImageParser.add(src, function(err, width, height, memory, offset, length) {
                if (err) return cb(err);

                var options = {
                    source: new Uint8Array(memory, offset, length),
                    w: width,
                    h: height,
                    premultiplyAlpha: false,
                    flipBlueRed: false,
                    hasAlpha: true
                };
                cb(null, options);
            });
            cancelCb = function() {
                oReq.abort();
            }
        } else if (window.OffthreadImage && OffthreadImage.available) {
            // For offthread support: simply include https://github.com/GoogleChrome/offthread-image/blob/master/dist/offthread-img.js
            // Possible optimisation: do not paint on canvas, but directly pass ImageData to texImage2d.
            let element = document.createElement('DIV');
            element.setAttribute('alt', '.');
            let image = new OffthreadImage(element);
            element.addEventListener('painted', function () {
                let canvas = element.childNodes[0];
                // Because a canvas stores all in RGBA alpha-premultiplied, GPU upload is fastest with those settings.
                cb(null, {
                    source: canvas,
                    renderInfo: {src},
                    hasAlpha: true,
                    premultiplyAlpha: true
                });
            });
            image.src = src;
        } else {
            let image = new Image();
            if (!(src.substr(0,5) == "data:")) {
                // Base64.
                image.crossOrigin = "Anonymous";
            }
            image.onerror = function(err) {
                return cb("Image load error");
            };
            image.onload = function() {
                cb(null, {
                    source: image,
                    renderInfo: {src: src},
                    hasAlpha: isPng
                });
            };
            image.src = src;
        }

        return cancelCb
    }

    createWebGLContext(w, h) {
        let canvas = this.stage.getOption('canvas') || document.createElement('canvas');

        canvas.width = w;
        canvas.height = h;

        let opts = {
            alpha: true,
            antialias: false,
            premultipliedAlpha: true,
            stencil: true,
            preserveDrawingBuffer: false
        };

        let gl = canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl', opts);
        if (!gl) {
            throw new Error('This browser does not support webGL.');
        }

        this.canvas = canvas;

        return gl;
    }

    getWebGLCanvas() {
        return this.canvas;
    }

    getHrTime() {
        return window.performance ? window.performance.now() : (new Date()).getTime();
    }

    getDrawingCanvas() {
        // We can't reuse this canvas because textures may load async.
        return document.createElement('canvas');
    }

    nextFrame(changes) {
        /* WebGL blits automatically */
    }

    registerKeyHandler(keyhandler) {
        window.addEventListener('keydown', e => {
            keyhandler({keyCode: e.keyCode})
        })
    }

}

module.exports = WebAdapter;

let TextRenderer = require('../tree/TextRenderer');
