export default class ImageWorker {

    constructor(options = {}) {
        this._items = new Map();
        this._id = 0;

        this._initWorker();
    }

    destroy() {
        if (this._worker) {
            this._worker.terminate();
        }
    }

    _initWorker() {
        const code = `(${createWorker.toString()})()`;
        const blob = new Blob([code.replace('"use strict";', '')]); // firefox adds "use strict"; to any function which might block worker execution so knock it off
        const blobURL = (window.URL ? URL : webkitURL).createObjectURL(blob, {
            type: 'application/javascript; charset=utf-8'
        });
        this._worker = new Worker(blobURL);

        this._worker.postMessage({type: 'config', config: {path: window.location.href}});

        this._worker.onmessage = (e) => {
            if (e.data && e.data.id) {
                const id = e.data.id;
                const item = this._items.get(id);
                if (item) {
                    if (e.data.type == 'data') {
                        this.finish(item, e.data.info);
                    } else {
                        this.error(item, e.data.info);
                    }
                }
            }
        }
    }

    create(src) {
        const id = ++this._id;
        const item = new ImageWorkerImage(this, id, src);
        this._items.set(id, item);
        this._worker.postMessage({type: "add", id: id, src: src});
        return item;
    }

    cancel(image) {
        this._worker.postMessage({type: "cancel", id: image.id});
        this._items.delete(image.id);
    }

    error(image, info) {
        image.error(info);
        this._items.delete(image.id);
    }

    finish(image, info) {
        image.load(info);
        this._items.delete(image.id);
    }

}

class ImageWorkerImage {

    constructor(manager, id, src) {
        this._manager = manager;
        this._id = id;
        this._src = src;
        this._onError = null;
        this._onLoad = null;
    }

    get id() {
        return this._id;
    }

    get src() {
        return this._src;
    }

    set onError(f) {
        this._onError = f;
    }

    set onLoad(f) {
        this._onLoad = f;
    }

    cancel() {
        this._manager.cancel(this);
    }

    load(info) {
        if (this._onLoad) {
            this._onLoad(info);
        }
    }

    error(info) {
        if (this._onError) {
            this._onError(info);
        }
    }

}

/**
 * Notice that, within the createWorker function, we must only use ES5 code to keep it ES5-valid after babelifying, as
 *  the converted code of this section is converted to a blob and used as the js of the web worker thread.
 */
const createWorker = function() {

    function ImageWorkerServer() {

        this.items = new Map();

        var t = this;
        onmessage = function(e) {
            t._receiveMessage(e);
        }

    }

    ImageWorkerServer.isPathAbsolute = function(path) {
        return /^(?:\/|[a-z]+:\/\/)/.test(path);
    };

    ImageWorkerServer.prototype._receiveMessage = function(e) {
        if (e.data.type === 'config') {
            this.config = e.data.config;

            var base = this.config.path;
            var parts = base.split("/");
            parts.pop();
            this._relativeBase = parts.join("/") + "/";

        } else if (e.data.type === 'add') {
            this.add(e.data.id, e.data.src);
        } else if (e.data.type === 'cancel') {
            this.cancel(e.data.id);
        }
    };

    ImageWorkerServer.prototype.add = function(id, src) {
        // Convert relative URLs.
        if (!ImageWorkerServer.isPathAbsolute(src)) {
            src = this._relativeBase + src;
        }

        if (src.substr(0,2) === "//") {
            // This doesn't work for image workers.
            src = "http:" + src;
        }

        var item = new ImageWorkerServerItem(id, src);
        var t = this;
        item.onFinish = function(result) {
            t.finish(item, result);
        };
        item.onError = function(info) {
            t.error(item, info);
        };
        this.items.set(id, item);
        item.start();
    };

    ImageWorkerServer.prototype.cancel = function(id) {
        var item = this.items.get(id);
        if (item) {
            item.cancel();
            this.items.delete(id);
        }
    }

    ImageWorkerServer.prototype.finish = function(item, {imageBitmap, hasAlphaChannel}) {
        postMessage({
            type: "data",
            id: item.id,
            info: {
                imageBitmap,
                hasAlphaChannel
            }
        }, [imageBitmap]);
        this.items.delete(item.id);
    };

    ImageWorkerServer.prototype.error = function(item, {type, message}) {
        postMessage({
            type: "error",
            id: item.id,
            info: {
                type,
                message
            }
        });
        this.items.delete(item.id);
    };

    ImageWorkerServer.isWPEBrowser = function() {
        return (navigator.userAgent.indexOf("WPE") !== -1);
    };

    function ImageWorkerServerItem(id, src) {

        this._onError = undefined;
        this._onFinish = undefined;
        this._id = id;
        this._src = src;
        this._xhr = undefined;
        this._mimeType = undefined;
        this._canceled = false;

    }

    Object.defineProperty(ImageWorkerServerItem.prototype, 'id', {
        get: function() {
            return this._id;
        }
    });

    Object.defineProperty(ImageWorkerServerItem.prototype, 'onFinish', {
        get: function() {
            return this._onFinish;
        },
        set: function(f) {
            this._onFinish = f;
        }
    });

    Object.defineProperty(ImageWorkerServerItem.prototype, 'onError', {
        get: function() {
            return this._onError;
        },
        set: function(f) {
            this._onError = f;
        }
    });

    ImageWorkerServerItem.prototype.start = function() {
        this._xhr = new XMLHttpRequest();
        this._xhr.open("GET", this._src, true);
        this._xhr.responseType = "blob";

        var t = this;
        this._xhr.onerror = function(oEvent) {
            t.error({type: "connection", message: "Connection error"});
        };

        this._xhr.onload = function(oEvent) {
            var blob = t._xhr.response;
            t._mimeType = blob.type;

            t._createImageBitmap(blob);
        };

        this._xhr.send();
    };

    ImageWorkerServerItem.prototype._createImageBitmap = function(blob) {
        var t = this;
        createImageBitmap(blob, {premultiplyAlpha: 'premultiply', colorSpaceConversion: 'none', imageOrientation: 'none'}).then(function(imageBitmap) {
            t.finish({
                imageBitmap,
                hasAlphaChannel: t._hasAlphaChannel()
            });
        }).catch(function(e) {
            t.error({type: "parse", message: "Error parsing image data"});
        });
    };

    ImageWorkerServerItem.prototype._hasAlphaChannel = function() {
        if (ImageWorkerServer.isWPEBrowser()) {
            // When using unaccelerated rendering image (https://github.com/WebPlatformForEmbedded/WPEWebKit/blob/wpe-20170728/Source/WebCore/html/ImageBitmap.cpp#L52),
            // everything including JPG images are in RGBA format. Upload is way faster when using an alpha channel.
            // @todo: after hardware acceleration is fixed and re-enabled, JPG should be uploaded in RGB to get the best possible performance and memory usage.
            return true;
        } else {
            return (this._mimeType.indexOf("image/png") !== -1);
        }
    };

    ImageWorkerServerItem.prototype.cancel = function() {
        if (this._canceled) return;
        if (this._xhr) {
            this._xhr.abort();
        }
        this._canceled = true;
    };

    ImageWorkerServerItem.prototype.error = function(type, message) {
        if (!this._canceled && this._onError) {
            this._onError({type, message});
        }
    };

    ImageWorkerServerItem.prototype.finish = function(info) {
        if (!this._canceled && this._onFinish) {
            this._onFinish(info);
        }
    };

    var worker = new ImageWorkerServer();
};