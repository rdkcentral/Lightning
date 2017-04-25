var MessageReader = require('./MessageReader');

var TextureProcess = function() {

    this.connected = false;

    /**
     * Queued texture source loads, along with their load callbacks.
     * @type {Map<String, Function>}
     */
    this.queue = new Map();

    var self = this;
    this.messageReader = new MessageReader();
    this.messageReader.on('message', function(message) {
        self.receiveMessage(message);
    });

};

TextureProcess.prototype.fork = function() {
    console.log('Starting texture process (for image/text generation).');

    var self = this;
    this.textureProcess = require('child_process').fork(__dirname + "/../process/texture/texture", ['--allow-local=1'], {execArgv: []});
    this.textureProcess.on('error', function(err) {
        console.error('Error while spawning texture process', err);
    });
    this.textureProcess.on('exit', function() {
        self.fail();

        console.error('Texture process exited unexpectedly');
        setTimeout(function() {
            // Re-start the process.
            self.fork();
        }, 2000);
    });
};

TextureProcess.prototype.connect = function(cb) {
    var net = require('net');

    var self = this;

    this.conn = new net.Socket();

    this.conn.connect(34264, '127.0.0.1', function() {
        self.connected = true;
        console.log('Connected to texture process!');
        if (cb) {
            cb();

            // Errors that happen later on should not trigger the load callback.
            cb = null;
        }
    });

    this.conn.on('data', function(data) {
        self.messageReader.receive(data);
    });

    this.conn.on('error', function(err) {
        // We need this to prevent the 'unhandled error event' process crash.
        if (cb) {
            cb(err);
        }
    });

    this.conn.on('close', function() {
        self.fail();

        self.connected = false;
        console.error('Connection to texture process lost');
        setTimeout(function() {
            self.connect();
        }, 1000);
    });
};


TextureProcess.prototype.receiveMessage = function(data) {
    var s = data.readUInt32LE(0);
    var tsId = data.readUInt32LE(4);
    var cb = this.queue.get(tsId);
    if (cb) {
        var code = data.readUInt32LE(8);
        if (code === 0) {
            // Get RGBA data.
            var w = data.readUInt32LE(12);
            var h = data.readUInt32LE(16);
            var dl = data.readUInt32LE(20);
            var imageData = data.slice(24, 24 + dl);

            var renderInfo = null;
            if (data.length > 24 + dl) {
                renderInfo = this.parseRenderInfo(data.slice(24 + dl));
            }

            var options = {w: w, h: h, premultiplyAlpha: false, flipBlueRed: false};
            if (renderInfo) {
                options.renderInfo = renderInfo;
            }
            cb(null, imageData, options);
        } else {
            imageData = data.slice(12);

            // Get error message.
            cb(imageData.toString('utf8'));
        }
    }
};

TextureProcess.prototype.parseRenderInfo = function(buf) {
    var str = null;
    try {
        str = buf.toString('utf8');
        return JSON.parse(str);
    } catch(e) {
        console.error('Parse render info: ' + str)
    }
    return null;
};

TextureProcess.prototype.send = function(tsId, type, src) {
    var len = 8;
    var srcBuffer;
    if (src) {
        srcBuffer = Buffer.from(src, 'utf8');
        len += srcBuffer.length + 4;
    }

    var data;
    if (src) {
        data = new Buffer(12);
        data.writeUInt32LE(len, 0);
        data.writeUInt32LE(tsId, 4);
        data.writeUInt32LE(type, 8);
        data = Buffer.concat([data, srcBuffer]);
    } else {
        data = new Buffer(8);
        data.writeUInt32LE(len, 0);
        data.writeUInt32LE(tsId, 4);
    }

    this.conn.write(data);
};

TextureProcess.prototype.isConnected = function() {
    return this.connected;
};

TextureProcess.prototype.fail = function(data) {
    //@todo: load all queued sources in the main thread (fallback).
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
    //@todo: send message to load it.
    this.send(ts.id, type, src);
    this.queue.set(ts.id, cb);
};

/**
 * Cancels a load request from the queue.
 * @param {TextureSource} ts
 */
TextureProcess.prototype.cancel = function(ts) {
    this.send(ts.id);
    var cb = this.queue.get(ts.id);
    if (cb) {
        // Cancel loading.
        cb(null, null);
    }
    this.queue.delete(ts.id);
};

module.exports = TextureProcess;