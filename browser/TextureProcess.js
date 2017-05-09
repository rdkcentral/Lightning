var TextureProcess = function(options) {

    this.options = options;

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
        var workerUrl = this.options.workerPath + "wpe-texture-worker.js";
        this.worker = new Worker(workerUrl);
    } catch(e) {
        console.error('Error starting web worker', e);
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

    this.worker.postMessage({baseUrl: baseUrl, textServer: this.options.textServer});

    console.log("Connected to texture Worker. Support: JPG and PNG.");

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
        if (src.toLowerCase().indexOf(".jpg") !== -1 || src.toLowerCase().indexOf(".png") !== -1) {
            this.add(0, src, ts, cb);
            ts.cancelCb = this.cancel.bind(this);
            return true;
        } else {
            // Other file formats are currently not supported and are downloaded syncronously.
            return false;
        }
    }
};

TextureProcess.prototype.loadText = function(settings, ts, cb) {
    if (!this.options.textServer) return false;
    this.add(1, JSON.stringify(settings.getRenderNonDefaults()), ts, cb);
    ts.cancelCb = this.cancel.bind(this);
    return true;
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

