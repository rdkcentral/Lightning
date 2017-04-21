var isNode = !!(((typeof module !== "undefined") && module.exports));

//@todo: use websocket for HTML context?

var TextureProcess = function() {

    this.connected = false;

    /**
     * Queued texture source loads, along with their load callbacks.
     * @type {Map<String, Function>}
     */
    this.queue = new Map();

    this.dataBuffers = [];
    this.dataBufferLength = 0;

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

TextureProcess.prototype.connect = function() {
    var net = require('net');

    var self = this;

    this.conn = new net.Socket();

    this.conn.connect(34264, '127.0.0.1', function() {
        self.connected = true;
        console.log('Connected to texture process!');
    });

    this.conn.on('data', function(data) {
        self.receive(data);
    });

    this.conn.on('error', function(data) {
        // We need this to prevent the 'unhandled error event' process crash.
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

TextureProcess.prototype.receive = function(data) {
    console.log('received ' + data.byteLength);
    if (this.partialMessageSizeRemaining > 0) {
        this.partialMessage.chunks.push(data);
        this.partialMessageSizeRemaining -= data.byteLength;
        var cb = this.queue.get(this.partialMessage.tsId);
        if (cb) {
            if (this.partialMessageSizeRemaining < 0) {
                cb('Bad message size!');
            } else if (this.partialMessageSizeRemaining === 0) {
                var data = Buffer.concat(this.partialMessage.chunks);
                console.log('received');
                if (this.partialMessage.code === 0) {
                    cb(null, data, this.partialMessage.options);
                } else {
                    cb(data.toString('utf8'));
                }
            }
        }
    } else {
        var tsId = data.readUInt32LE(0);
        var cb = this.queue.get(tsId);
        if (cb) {
            var code = data.readUInt32LE(4);
            if (code === 0) {
                // Get RGBA data.
                var w = data.readUInt32LE(8);
                var h = data.readUInt32LE(12);
                var s = data.readUInt32LE(16);
                data = data.slice(20);

                var options = {w: w, h: h, nodeCanvas: true};
                if (data.byteLength === s) {
                    cb(null, data, options);
                } else {
                    this.partialMessage = {tsId: tsId, code: code, chunks: [data], options: options};
                    this.partialMessageSizeRemaining = s - data.byteLength;
                }
            } else {
                s = data.readUInt32LE(8);
                data = data.slice(12);

                if (data.byteLength === s) {
                    // Get error message.
                    cb(data.toString('utf8'));
                } else {
                    this.partialMessage = {tsId: tsId, code: code, chunks: [data]};
                    this.partialMessageSizeRemaining = s - data.byteLength;
                }
            }
        }
    }
};

TextureProcess.prototype.receive = function(data) {
    var offset, len;
    if (this.dataBufferLength === 0) {
        offset = 0;
        while(offset < data.byteLength) {
            len = data.readUInt32LE(offset);
            if (len + offset <= data.byteLength) {
                this.receiveMessage(data.slice(offset, offset + len));
            } else {
                // Part is remaining.
                this.dataBuffers.push(data.slice(offset));
                this.dataBufferLength = (len + offset) - data.byteLength;
            }
            offset += len;
        }
    } else {
        offset = 0;
        len = this.dataBufferLength;
        if (len + offset <= data.byteLength) {
            this.dataBuffers.push(data.slice(offset, offset + len));
            this.receiveMessage(Buffer.concat(this.dataBuffers));
            offset += len;
            this.dataBufferLength = 0;
            this.dataBuffers = [];

            while(offset < data.byteLength) {
                len = data.readUInt32LE(offset);
                if (len + offset <= data.byteLength) {
                    this.receiveMessage(data.slice(offset, offset + len));
                } else {
                    // Part is remaining.
                    this.dataBuffers.push(data.slice(offset));
                    this.dataBufferLength = (len + offset) - data.byteLength;
                }
                offset += len;
            }
        } else {
            this.dataBuffers.push(data);
            this.dataBufferLength -= data.byteLength;
        }
    }
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
            data = data.slice(20);

            var options = {w: w, h: h, nodeCanvas: true};
            cb(null, data, options);
        } else {
            data = data.slice(12);

            // Get error message.
            cb(data.toString('utf8'));
        }
    }
};

TextureProcess.prototype.send = function(tsId, src) {
    var len = 8;
    var srcBuffer;
    if (src) {
        srcBuffer = Buffer.from(src, 'utf8');
        len += srcBuffer.length;
    }

    var data = new Buffer(8);
    data.writeUInt32LE(len, 0);
    data.writeUInt32LE(tsId, 4);

    if (src) {
        data = Buffer.concat([data, srcBuffer]);
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
 * @param {String} src
 * @param {TextureSource} ts
 * @param {Function} cb
 *   Will be called along with the buffer which contains the actual alpha-premultiplied RGBA data.
 */
TextureProcess.prototype.add = function(src, ts, cb) {
    //@todo: send message to process to load it.
    this.send(ts.id, src);
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