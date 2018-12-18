export default class ImageWorker {

    constructor(options = {}) {
        this._items = new Map();
        this._id = 0;

        this._initWorker();
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
        };
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

const createWorker = function() {
    class ImageWorkerServer {

        constructor() {
            this.items = new Map();

            onmessage = (e) => {
                if (e.data.type == 'config') {
                    this.config = e.data.config;

                    const base = this.config.path;
                    const parts = base.split("/");
                    parts.pop();
                    this._relativeBase = parts.join("/") + "/";

                } else if (e.data.type == 'add') {
                    this.add(e.data.id, e.data.src);
                } else if (e.data.type == 'cancel') {
                    this.cancel(e.data.id);
                }
            };
        }

        static isPathAbsolute(path) {
            return /^(?:\/|[a-z]+:\/\/)/.test(path);
        }

        add(id, src) {
            // Convert relative URLs.
            if (!ImageWorkerServer.isPathAbsolute(src)) {
                src = this._relativeBase + src;
                console.log('convert to relative: ' + src);
            }

            if (src.substr(0,2) === "//") {
                // This doesn't work for image workers.
                src = "http:" + src;
            }

            const item = new ImageWorkerServerItem(id, src);
            item.onFinish = (result) => {
                console.log('finish', item._src);
                this.finish(item, result);
                this.next();
            };
            item.onError = (info) => {
                console.log('error', item._src);
                this.error(item, info);
                this.next();
            };
            this.items.set(id, item);

            if (!this._running) {
                this.next();
            }
        }

        next() {
            if (this.items.size) {
                const item = this.items.values().next().value;
                this._running = item;
                item.start();
            } else {
                this._running = null;
            }
        }

        cancel(id) {
            const item = this.items.get(id);
            if (item) {
                item.cancel();
                this.items.delete(id);
                if (this._running === item) {
                    this.next()
                }
            }
        }

        finish(item, {imageBitmap, hasAlphaChannel}) {
            postMessage({
                type: "data",
                id: item.id,
                info: {
                    imageBitmap,
                    hasAlphaChannel
                }
            }, [imageBitmap]);
            this.items.delete(item.id);
        }

        error(item, {type, message}) {
            postMessage({
                type: "error",
                id: item.id,
                info: {
                    type,
                    message
                }
            });
            this.items.delete(item.id);
        }
    }

    class ImageWorkerServerItem {

        constructor(id, src) {
            this._onError = undefined;
            this._onFinish = undefined;
            this._id = id;
            this._src = src;
            this._xhr = undefined;
            this._mimeType = undefined;
            this._canceled = false;
        }

        get id() {
            return this._id;
        }

        set onFinish(f) {
            this._onFinish = f;
        }

        set onError(f) {
            this._onError = f;
        }

        start() {
            console.log('start', this._src);
            this._xhr = new XMLHttpRequest();
            this._xhr.open("GET", this._src, true);
            this._xhr.responseType = "blob";

            this._xhr.onerror = oEvent => {
                this.error({type: "connection", message: "Connection error"});
            };

            this._xhr.onload = oEvent => {
                const blob = this._xhr.response;
                this._mimeType = blob.type;

                this._createImageBitmap(blob);
            };

            this._xhr.send();

        }

        _createImageBitmap(blob) {
            createImageBitmap(blob, {premultiplyAlpha: 'premultiply', colorSpaceConversion: 'none', imageOrientation: 'none'}).then(imageBitmap => {
                this.finish({
                    imageBitmap,
                    hasAlphaChannel: this._hasAlphaChannel()
                });
            }).catch(e => {
                this.error({type: "parse", message: "Error parsing image data"});
            });
        }

        _hasAlphaChannel() {
            // When using unaccelerated rendering image (https://github.com/WebPlatformForEmbedded/WPEWebKit/blob/wpe-20170728/Source/WebCore/html/ImageBitmap.cpp#L52),
            // everything including JPG images are in RGBA format. Upload is way faster when using an alpha channel.
            return true;

            // @todo: after hardware acceleration is fixed and re-enabled, JPG should be uploaded in RGB to get the best possible performance and memory usage.
            // return (this._mimeType.indexOf("image/png") !== -1);
        }

        cancel() {
            if (this._canceled) return;
            if (this._xhr) {
                this._xhr.abort();
            }
            this._canceled = true;
        }

        error(type, message) {
            if (!this._canceled && this._onError) {
                this._onError({type, message});
            }
        }

        finish(info) {
            if (!this._canceled && this._onFinish) {
                this._onFinish(info);
            }
        }

    }

    const worker = new ImageWorkerServer();
}