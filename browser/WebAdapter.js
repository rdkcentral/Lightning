var WebAdapter = function() {
    this.animationFunction = function() {};
    this.animationLoopStopped = false;
    this.canvas = null;

    this.uComponentContext = new UComponentContext();

    // Default: white background.
    this.glClearColor = [0, 0, 0, 0];
};

WebAdapter.prototype.init = function() {
    this.uComponentContext.setStage(this.stage);
};

WebAdapter.prototype.startAnimationLoop = function(f) {
    this.animationFunction = f || this.animationFunction;
    this.animationLoopStopped = false;
    this.loop();
};

WebAdapter.prototype.stopAnimationLoop = function() {
    this.animationLoopStopped = true;
};

WebAdapter.prototype.loop = function() {
    var self = this;
    var lp = function() {
        if (!self.animationLoopStopped) {
            self.animationFunction();
            requestAnimationFrame(lp);
        }
    };
    lp();
};

WebAdapter.prototype.uploadGlTexture = function(gl, textureSource, source) {
    if (source instanceof ImageData || source instanceof HTMLImageElement || source instanceof HTMLCanvasElement || source instanceof HTMLVideoElement || (window.ImageBitmap && source instanceof ImageBitmap)) {
        // Web-specific data types.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    } else {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, textureSource.w, textureSource.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, source);
    }
};

WebAdapter.prototype.loadTextureSourceString = function(source, ts, cb) {
    var image = new Image();
    if (!(source.substr(0,5) == "data:")) {
        // Base64.
        image.crossOrigin = "Anonymous";
    }
    image.onerror = function(err) {
        return cb("Image load error");
    };
    image.onload = function() {
        cb(null, image, {renderInfo: {src: source}});
    };
    image.src = source;
};

WebAdapter.prototype.loadText = function(settings, ts, cb) {
    // Generate the image.
    var tr = new TextRenderer(this.stage.drawingCanvasFactory, settings);
    var rval = tr.draw();
    var renderInfo = rval.renderInfo;

    var options = {renderInfo: renderInfo, precision: rval.renderInfo.precision};
    var data = rval.canvas;
    cb(null, data, options);
};

WebAdapter.prototype.getHrTime = function() {
    return window.performance ? window.performance.now() : (new Date()).getTime();
};

WebAdapter.prototype.getWebGLRenderingContext = function(w, h) {
    var canvas;
    if (this.stage.reuseCanvas) {
        canvas = this.stage.reuseCanvas;
    } else {
        canvas = document.createElement('canvas');
    }

    canvas.width = w;
    canvas.height = h;

    var opts = {
        alpha: true,
        antialias: false,
        premultipliedAlpha: true,
        stencil: true,
        preserveDrawingBuffer: false
    };

    var gl = canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl', opts);
    if (!gl) {
        throw new Error('This browser does not support webGL.');
    }

    this.canvas = canvas;

    return gl;
};

WebAdapter.prototype.getDrawingCanvas = function() {
    if (!this.textCanvas) {
        this.textCanvas = document.createElement('canvas');
    }
    return this.textCanvas;
};

WebAdapter.prototype.getUComponentContext = function() {
    return this.uComponentContext;
};

WebAdapter.prototype.nextFrame = function(swapBuffers) {
    /* WebGL blits automatically */
};

WebAdapter.prototype.getTextureProcess = function() {
    // Auto-detect worker url.
    var sc = document.getElementsByTagName("script");

    var workerPath = this.stage.textureProcessWorkerPath;

    if (!workerPath) {
        for (var idx = 0; idx < sc.length; idx++) {
            var s = sc.item(idx);

            if (s.src) {
                var match = /^(.+\/)(wpe(\.min)?|WebAdapter)\.js$/.exec(s.src);
                if (match) {
                    workerPath = match[1];
                }
            }
        }
    }

    return new TextureProcess({workerPath: workerPath, textServer: this.stage.textureProcessTextServer});
};
