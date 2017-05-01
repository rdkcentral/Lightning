var TextureWorker = function() {
    this.baseUrl = "";

    // The running texture source loads (texture source ids).
    this.running = new Set();

    // Callbacks that are called, per texture source id, when that texture source load is canceled.
    this.cancelCbs = new Map();

    var self = this;
    onmessage = function(e) {
        self.handleMessage(e);
    };

};

TextureWorker.prototype.handleMessage = function(e) {
    var m = e.data;
    if (m.baseUrl) {
        // Set base url.
        this.baseUrl = m.baseUrl;
    } else {
        // Handle message;
        if (m.cancel) {
            // Cancel.
            this.cancel(m);
        } else {
            this.load(m);
        }
    }
};

TextureWorker.prototype.cancel = function(item) {
    var id = item.id;
    if (this.running.has(id)) {
        // Delete from running list so that eventual callbacks aren't sent.
        this.running.delete(id);

        // Invoke cancel callback.
        var cancelCb = this.cancelCbs.get(id);
        if (cancelCb) {
            cancelCb();
            this.cancelCbs.delete(id);
        }
    }
};

TextureWorker.prototype.load = function(item) {
    var tsId = item.id;
    var type = item.type;
    var src = item.data;

    var self = this;

    var handleResult = function(err, buf, w, h, renderInfo) {
        self.handleResult(err, tsId, src, buf, w, h, renderInfo);
    };

    this.running.add(tsId);

    if (type === 0) {
        this.loadTextureSourceString(tsId, src, handleResult);
    } else if (type === 1) {
        // No support for text rendering (yet).
        handleResult('Not supported');
    }
};

TextureWorker.prototype.loadTextureSourceString = function(tsId, source, cb) {
    if (source.indexOf("://") === -1) {
        // Relative url.
        source = this.baseUrl + source;
    }

    this.loadAsBlob(source, function(err, encoded) {
        if (err) return cb(err);

        createImageBitmap(encoded, {premultiplyAlpha: 'premultiply'}).then(function(imageBitmap) {
            return cb(null, imageBitmap, imageBitmap.width, imageBitmap.height, 'RGBA');
        }, function(err) {
            return cb(err);
        });
    });
};

TextureWorker.prototype.loadAsBlob = function(url, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.onload = function () {
        if (xhr.status !== 200) {
            return cb(new Error('Unexpected status code: ' + xhr.status));
        }
        cb(null, xhr.response);
    };
    xhr.onerror = function(e) {
        cb(e);
    };
    xhr.send();
};

TextureWorker.prototype.handleResult = function(err, tsId, src, buf, w, h, renderInfo) {
    if (this.running.has(tsId)) {
        this.running.delete(tsId);
        this.cancelCbs.delete(tsId);

        if (err) {
            this.send({id: tsId, err: "" + err});
        } else {
            this.send({id: tsId, m: true, w: w, h: h, renderInfo: renderInfo});
            this.sendBuffer(buf);
        }
    }
};


TextureWorker.prototype.send = function(n) {
    postMessage(n);
};

TextureWorker.prototype.sendBuffer = function(buf) {
    postMessage(buf);
};

var textureWorker = new TextureWorker();
