import gles2 from "wpe-webgl.mjs";
import fs from "fs.mjs";
import Canvas from "canvas.mjs";
import http from "http.mjs";
import https from "https.mjs";

export default class NodeAdapter {
    
    init(stage) {
        this.stage = stage;
        this._looping = false;
        this._awaitingLoop = false;

        if (this.stage.getOption('supercharger')) {
            try {
                // Images are downloaded, parsed and pre-processed off-thread.
                this._supercharger = require('wpe-uiframework-supercharger');
                console.log('Using WPEUIFramework supercharger.');
            } catch(e) {
                console.warn('WPEUIFramework supercharger not found. Images will be downloaded and parsed on-thread.');
            }

            if (this._supercharger) {
                let localImagePath = this.stage.getOption('supercharger').localImagePath;
                let options = {allowFiles: (!!localImagePath)};
                if (localImagePath !== true) {
                    options.allowedFilePath = localImagePath;
                }
                this._supercharger.init(options);
            }
        } else {
            console.warn('Specify supercharger option to enable off-thread (supercharged) image loading.');
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
                if (self._supercharger) {
                    self._supercharger.process();
                }
                self.stage.drawFrame();
                if (self.changes) {
                    // We depend on blit to limit to 60fps.
                    setImmediate(lp);
                } else {
                    setTimeout(lp, 16);
                }
                self._awaitingLoop = true;
            }
        }
        setTimeout(lp, 16);
    }

    uploadGlTexture(gl, textureSource, source, options) {
        gl.texImage2D(gl.TEXTURE_2D, 0, options.internalFormat, textureSource.w, textureSource.h, 0, options.format, options.type, source);
    }

    loadSrcTexture({src}, cb) {
        if (this._supercharger) {
            //@todo: fix supercharger to new args/return value.
            // this._supercharger.loadSrcTexture(src, cb);
            // return;
        }

        if (/^https?:\/\//i.test(src)) {
            // URL. Download first.
            let mod = null;
            if (src.toLowerCase().indexOf("https:") === 0) {
                mod = https;
            } else {
                mod = http;
            }

            mod.get(src, function(res) {
                if (res.statusCode !== 200) {
                    return cb(new Error("Status code " + res.statusCode + " for " + src));
                }

                let total = [];
                res.on('data', (d) => {
                    total.push(d);
                });
                res.on('end', () => {
                    let buf = Buffer.concat(total);
                    this.parseImage(buf, cb);
                });
            }).on('error', function(err) {
                cb(err);
            });
        } else {
            // File system.
            fs.readFile(src, (err, res) => {
                if (err) {
                    console.error('Error loading image', src, err);
                } else {
                    this.parseImage(res, cb);
                }
            });
        }
    }
    
    parseImage(data, cb) {
        import Canvas from "canvas.mjs";
        let img = new Canvas.Image();
        img.src = data;
        let buf = img.rawData;
        cb(null, {source: buf, w: img.width, h: img.height, premultiplyAlpha: false, flipBlueRed: true});
    }

    createWebGLContext(w, h) {
        let options = {width: w, height: h, title: "WebGL"};
        const windowOptions = this.stage.getOption('window');
        if (windowOptions) {
            options = Object.assign(options, windowOptions);
        }
        let gl = gles2.init(options);
        return gl;
    }

    getWebGLCanvas() {
        return;
    }

    getTextureOptionsForDrawingCanvas(canvas) {
        let options = {}
        options.source = canvas.toBuffer('raw');
        options.w = canvas.width;
        options.h = canvas.height;
        options.premultiplyAlpha = false;
        options.flipBlueRed = true;
        return options;
    }

    getHrTime() {
        let hrTime = process.hrtime();
        return 1e3 * hrTime[0] + (hrTime[1] / 1e6);
    }

    getDrawingCanvas() {
        // We can't reuse this canvas because textures may load async.
        return new Canvas(0, 0);
    }

    nextFrame(changes) {
        this.changes = changes;
        gles2.nextFrame(changes);
    }

    registerKeyHandler(keyhandler) {
        console.warn("No support for key handling");
    }

}

