importScripts("wpe-texture-worker-jpeg.js");
importScripts("wpe-texture-worker-png.js");

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
        if (!err) {
            console.log('Loaded in texture worker: ' + src);
        }
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

    var self = this;
    this.loadAsUint8Array(source, function(err, encoded) {
        if (err) return cb(err);

        var encoding = self.getEncoding(encoded);
        if (encoding === 1) {
            var parser = new JpegDecoder();
            parser.parse(encoded);
            var width = parser.width;
            var height = parser.height;
            var numComponents = parser.numComponents;
            if (numComponents !== 3) {
                return cb(new Error("Not an RGB jpg image"));
            }
            var decoded = parser.getData(width, height);

            // Convert RGB to RGBA so that it's not necessary to do so later.
            var converted = new Uint8Array(width * height * 4);
            self.copyRgbToRgba(decoded, converted);

            cb(null, converted, width, height);
        } else if (encoding === 2) {
            var png = new PNG(encoded);
            var pixels = png.decode();

            cb(null, pixels, png.width, png.height);
        } else {
            return cb(new Error("Unexpected file format: " + source));
        }
    });
};

TextureWorker.prototype.copyRgbToRgba = function(source, target) {
    for (var i = 0, j = 0, n = source.length; i < n; i += 3, j += 4) {
        target[j] = source[i];
        target[j+1] = source[i+1];
        target[j+2] = source[i+2];
        target[j+3] = 255;
    }
};

TextureWorker.prototype.getEncoding = function(data) {
    // See https://en.wikipedia.org/wiki/List_of_file_signatures.
    if (data[0] === 0xFF && data[1] === 0xD8 && data[2] === 0xFF && data[3] === 0xE0) {
        return 1; // JPG
    } else if (data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4E && data[3] === 0x47) {
        return 2; // PNG
    } else {
        return 0; // Unknown
    }
};

TextureWorker.prototype.loadAsUint8Array = function(url, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function () {
        if (xhr.status !== 200) {
            return cb(new Error('Unexpected status code: ' + xhr.status));
        }
        cb(null, new Uint8Array(xhr.response));
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
            // console.log(src + ': ' + buf.length + ' (' + tsId + ')');

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
