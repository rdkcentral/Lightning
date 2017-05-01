var TextureProcess = function(workerPath) {

    // Base URL where the web worker source files should reside.
    this.workerPath = workerPath;

    // Browser supports CreateImageBitmap. This means that we can load all image types!
    this.hasNativeSupport = !!createImageBitmap;

    /**
     * Queued texture source loads, along with their load callbacks.
     * @type {Map<String, {cb: Function, ts: TextureSource}>}
     */
    this.queue = new Map();

    this.worker = null;

};

TextureProcess.prototype.init = function(cb) {
    if (!window.Worker) {
        return cb(new Error("Browser does not have Worker support."));
    }

    try {
        var workerUrl = this.workerPath + (this.hasNativeSupport ? "wpe-texture-worker-native.js" : "wpe-texture-worker-fallback.js");
        this.worker = new Worker(workerUrl);
    } catch(e) {
        return cb(e);
    }

    // Install communication channel.
    var self = this;
    this.worker.onmessage = function (e) {
        self.receiveMessage(e);
    };

    // Send base url for relative paths.
    var baseUrl = window.location.href;
    var index = baseUrl.lastIndexOf("/");
    if (index !== -1) {
        baseUrl = baseUrl.substr(0, index + 1);
    }
    this.worker.postMessage({baseUrl: baseUrl});

    if (this.hasNativeSupport) {
        console.log("Connected to texture Worker.");
    } else {
        console.log("Connected to fallback texture Worker. You browser does not support createImageBitmap. Only JPG will be supported.");
    }

    cb();
};

TextureProcess.prototype.isConnected = function() {
    return (this.worker !== null);
};

TextureProcess.prototype.destroy = function() {
    if (this.worker) {
        this.worker.terminate();
    }
};

TextureProcess.prototype.receiveMessage = function(e) {
    var info;
    var m = e.data;
    if (this.textureMetaInfo) {
        var imageData = e.data;

        var options = {
            w: this.textureMetaInfo.w,
            h: this.textureMetaInfo.h,
            premultiplyAlpha: false,
            flipBlueRed: false
        };

        if (this.textureMetaInfo.format) {
            options.format = this.textureMetaInfo.format;
        }

        if (this.textureMetaInfo.renderInfo) {
            options.renderInfo = this.textureMetaInfo.renderInfo;
        }
        var id = this.textureMetaInfo.id;
        this.textureMetaInfo = null;
        info = this.queue.get(id);
        if (info) {
            this.queue.delete(id);
            info.cb(null, imageData, options);
        }
    } else if (m.m) {
        this.textureMetaInfo = m;
    } else if (m.err) {
        info = this.queue.get(m.id);
        if (info) {
            this.queue.delete(m.id);
            info.cb(m.err);
        }
    }
};

TextureProcess.prototype.send = function(tsId, type, data) {
    this.worker.postMessage({id: tsId, type: type, data: data});
};

TextureProcess.prototype.sendCancel = function(tsId) {
    this.worker.postMessage({id: tsId, cancel: true});
};

TextureProcess.prototype.loadTextureSourceString = function(src, ts, cb) {
    // Never load data urls remotely because they're usually small and it's not worth the overhead / additional code.
    if (src.indexOf("data:") === 0) {
        return false;
    }

    if (this.hasNativeSupport) {
        this.add(0, src, ts, cb);
        ts.cancelCb = this.cancel.bind(this);
        return true;
    } else {
        if (src.toLowerCase().indexOf(".jpg") !== -1) {
            this.add(0, src, ts, cb);
            ts.cancelCb = this.cancel.bind(this);
            return true;
        } else {
            // @todo: png support?
            return false;
        }
    }
};

/**
 * Adds a load request to the queue.
 * @param {Number} type
 * @param {String} src
 * @param {TextureSource} ts
 * @param {Function} cb
 *   Will be called along with the buffer which contains the actual alpha-premultiplied RGBA data.
 */
TextureProcess.prototype.add = function(type, src, ts, cb) {
    this.send(ts.id, type, src);
    this.queue.set(ts.id, {type: type, src: src, ts: ts, cb: cb});
};

/**
 * Cancels a load request from the queue.
 * @param {TextureSource} ts
 */
TextureProcess.prototype.cancel = function(ts) {
    this.sendCancel(ts.id);
    var info = this.queue.get(ts.id);
    if (info && info.cb) {
        // Cancel loading.
        info.cb(null, null);
        this.queue.delete(ts.id);
    }
};

