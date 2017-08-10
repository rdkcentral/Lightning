let gles2 = require('wpe-webgl');
let fs = require('fs');
let Canvas = require('canvas');
let http = require('http');
let https = require('https');

class NodeAdapter {
    
    init(stage) {
        this.stage = stage;
        this.canvas = null;
        this._looping = false;
        this._awaitingLoop = false;

        if (this.stage.options.supercharger) {
            try {
                // Images are downloaded, parsed and pre-processed off-thread.
                this._supercharger = require('wpe-uiframework-supercharger');
                console.log('Using WPEUIFramework supercharger.');
            } catch(e) {
                console.warn('WPEUIFramework supercharger not found. Images will be downloaded and parsed on-thread.');
            }

            if (this._supercharger) {
                let localImagePath = this.stage.options.supercharger.localImagePath;
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
        lp();
    }

    uploadGlTexture(gl, textureSource, source, hasAlpha) {
        let format = hasAlpha ? gl.RGBA : gl.RGB;
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, textureSource.w, textureSource.h, 0, format, gl.UNSIGNED_BYTE, source);
    }

    loadSrcTexture(src, ts, sync, cb) {
        if (this._supercharger && !sync) {
            this._supercharger.loadSrcTexture(src, ts, cb)
            return;
        }

        let self = this;
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
                res.on('data', function(d) {
                    total.push(d);
                });
                res.on('end', function() {
                    let buf = Buffer.concat(total);
                    self.parseImage(buf, cb);
                });
            }).on('error', function(err) {
                cb(err);
            });
        } else {
            // File system.
            fs.readFile(src, function(err, res) {
                if (err) {
                    console.error('Error loading image', src, err);
                } else {
                    self.parseImage(res, cb);
                }
            });
        }        
    }
    
    parseImage(data, cb) {
        let Canvas = require('canvas');
        let img = new Canvas.Image();
        img.src = data;
        let buf = img.getRawData();
        cb(null, buf, {w: img.width, h: img.height, premultiplyAlpha: false, flipBlueRed: true});
    }

    loadTextTexture(settings, ts, sync, cb) {
        // Generate the image.
        let tr = new TextRenderer(this.getDrawingCanvas(), settings);
        let rval = tr.draw();
        let renderInfo = rval.renderInfo;

        let options = {renderInfo: renderInfo, precision: rval.renderInfo.precision};

        let data = rval.canvas.toBuffer('raw');
        options.w = rval.canvas.width;
        options.h = rval.canvas.height;
        options.premultiplyAlpha = false;
        options.flipBlueRed = true;

        cb(null, data, options);
    }

    createWebGLContext(w, h) {
        let options = {width: w, height: h, title: "WebGL"};
        if (this.stage.options.window) {
            options = Object.assign(options, this.stage.options.window);
        }
        let gl = gles2.init(options);
        return gl;
    }

    getWebGLCanvas() {
        return;
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

}

let TextRenderer = require('../core/TextRenderer');

module.exports = NodeAdapter;
