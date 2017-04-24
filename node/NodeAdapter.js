var gles2 = require('wpe-webgl');
var fs = require('fs');

var UComponentContext = require('../wpe/UComponentContext');
var TextRenderer = require('../wpe/TextRenderer');

var NodeAdapter = function(options) {
    this.animationFunction = function() {};
    this.animationLoopStopped = false;

    this.uComponentContext = new UComponentContext();

    // Default: black background.
    this.glClearColor = [0, 0, 0, 1];

    this.stage = null;

    this.options = options || {title: "WebGL"};
};

NodeAdapter.prototype.setStage = function(stage) {
    this.stage = stage;
    this.uComponentContext.setStage(stage);
};

NodeAdapter.prototype.startAnimationLoop = function(f) {
    this.animationFunction = f || this.animationFunction;
    this.animationLoopStopped = false;
    this.loop();
};

NodeAdapter.prototype.stopAnimationLoop = function() {
    this.animationLoopStopped = true;
};

NodeAdapter.prototype.loop = function() {
    if (!this.animationLoopStopped) {
        var self = this;

        if (this.stage.renderNeeded) {
            // We depend on blit to limit to 60fps.
            setImmediate(function() {
                self.animationFunction();
                self.loop();
            });
        } else {
            // We depend on blit to limit to 60fps.
            setTimeout(function() {
                self.animationFunction();
                self.loop();
            }, 16);
        }
    }
};

NodeAdapter.prototype.uploadGlTexture = function(gl, textureSource, source) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, textureSource.w, textureSource.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, source);
};

NodeAdapter.prototype.loadTextureSourceString = function(source, cb) {
    var self = this;
    if (/^https?:\/\//i.test(source)) {
        // URL. Download first.
        var mod = null;
        if (source.toLowerCase().indexOf("https:") === 0) {
            mod = require('https');
        } else {
            mod = require('http');
        }

        mod.get(source, function(res) {
            if (res.statusCode !== 200) {
                return cb(new Error("Status code " + res.statusCode + " for " + source));
            }

            var total = [];
            res.on('data', function(d) {
                total.push(d);
            });
            res.on('end', function() {
                var buf = Buffer.concat(total);
                self.parseImage(buf, cb);
            });
        }).on('error', function(err) {
            cb(err);
        });
    } else {
        // File system.
        fs.readFile(source, function(err, res) {
            if (err) {
                console.error('Error loading image', source, err);
            } else {
                self.parseImage(res, cb);
            }
        });
    }
};

NodeAdapter.prototype.parseImage = function(data, cb) {
    var Canvas = require('canvas');
    var img = new Canvas.Image();
    img.src = data;
    var buf = img.getRawData();
    cb(null, buf, {w: img.width, h: img.height, premultiplyAlpha: false, flipBlueRed: true});
};

NodeAdapter.prototype.loadText = function(settings, cb) {
    // Generate the image.
    var tr = new TextRenderer(this.stage.getTextRendererAdapter(), settings);
    var rval = tr.draw();
    var renderInfo = rval.renderInfo;

    var options = {renderInfo: renderInfo, precision: rval.renderInfo.precision};
    var data = rval.canvas.toBuffer('raw');
    options.w = rval.canvas.width;
    options.h = rval.canvas.height;
    options.premultiplyAlpha = false;
    options.flipBlueRed = true;
    cb(null, data, options);
};

NodeAdapter.prototype.getHrTime = function() {
    var hrTime = process.hrtime();
    return 1e3 * hrTime[0] + (hrTime[1] / 1e6);
};

NodeAdapter.prototype.getWebGLRenderingContext = function(w, h) {

    var options = {width: w, height: h};
    for (var key in this.options) {
        if (this.options.hasOwnProperty(key)) {
            options[key] = this.options[key];
        }
    }
    var gl = gles2.init(options);

    return gl;
};

NodeAdapter.prototype.getDrawingCanvas = function() {
    var Canvas = require('canvas');
    return new Canvas(0, 0);
};

NodeAdapter.prototype.getUComponentContext = function() {
    return this.uComponentContext;
};

NodeAdapter.prototype.nextFrame = function(swapBuffers) {
    gles2.nextFrame(swapBuffers);
};

module.exports = NodeAdapter;

