var TextureProcess = function() {

    /**
     * Queued texture source loads, along with their load callbacks.
     * @type {Map<String, {cb: Function, ts: TextureSource}>}
     */
    this.queue = new Map();

};

TextureProcess.prototype.init = function(cb) {

    //@todo: start worker and call cb when it is available (err out when exception).

    //@todo: start listening for messages.

};

TextureProcess.prototype.receiveMessage = function(data) {
    var tsId = 0; //@todo: get tsId.
    var info = this.queue.get(tsId);
    if (info) {
        this.queue.delete(tsId);

        var code = 0; //@todo: get error or ok response.
        if (code === 0) {
            // Get RGBA data.

            //@todo: load w,h,imagedata and renderinfo (utf8 ?).
            var w = 0;
            var h = 0;
            var imageData = 0;

            var renderInfo = null;

            var options = {w: w, h: h, premultiplyAlpha: false, flipBlueRed: false};
            if (renderInfo) {
                options.renderInfo = renderInfo;
            }
            info.cb(null, imageData, options);
        } else {

            //@todo: load error message.
            var error = 'todo';

            // Get error message.
            info.cb(error);
        }
    }
};

TextureProcess.prototype.send = function(tsId, type, src) {
    //@todo: implement.
};

TextureProcess.prototype.loadTextureSourceString = function(src, ts, cb) {
    this.add(0, src, ts, cb);
    ts.cancelCb = this.cancel.bind(this);
};

TextureProcess.prototype.loadText = function(settings, ts, cb) {
    this.add(1, JSON.stringify(settings.getRenderNonDefaults()), ts, cb);
    ts.cancelCb = this.cancel.bind(this);
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
    this.send(ts.id);
    var info = this.queue.get(ts.id);
    if (info && info.cb) {
        // Cancel loading.
        info.cb(null, null);
        this.queue.delete(ts.id);
    }
};

module.exports = TextureProcess;