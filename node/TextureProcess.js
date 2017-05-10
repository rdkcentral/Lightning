var MessageReader = require('./process/texture/socket/MessageReader');

var TextureProcess = function() {

    this.connected = false;

    /**
     * Queued texture source loads, along with their load callbacks.
     * @type {Map<String, {cb: Function, ts: TextureSource}>}
     */
    this.queue = new Map();

    var self = this;
    this.messageReader = new MessageReader();
    this.messageReader.on('message', function(message) {
        self.receiveMessage(message);
    });

    this.destroyed = false;

};

TextureProcess.prototype.init = function(cb) {
    var forked = false;
    var self = this;

    // First, try reusing an existing process.
    this.connect(function(err) {
        if (err && !forked) {
            // If it does not exist, try to fork a new process.
            self.fork();
            forked = true;

            var attempts = 0;
            var check = function() {
                var done = false;
                attempts++;
                if (self.connected) {
                    done = true;
                    cb();
                } else if (attempts > 40 || self.destroyed) {
                    done = true;
                    return cb(new Error("Can't connect to texture process."));
                }

                if (!done) {
                    setTimeout(check, 50);
                }
            };
            check();
        } else {
            cb();
        }
    });

};

TextureProcess.prototype.fork = function() {
    console.log('Starting texture process (for image/text generation).');

    var self = this;
    this.textureProcess = require('child_process').fork(__dirname + "/process/texture/texture", ['--allow-local=1'], {execArgv: []});
    this.textureProcess.on('error', function(err) {
        console.error('Error while spawning texture process', err);
    });
    this.textureProcess.on('exit', function() {
        if (!self.destroyed) {
            console.error('Texture process exited unexpectedly! Try re-forking it in 5s.');
            setTimeout(function() {
                // Re-start the process.
                self.fork();
            }, 5000);
        }
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
        if (!self.destroyed) {
            if (self.connected) {
                console.error('Connection to texture process lost');

                // Clear connected flag, so that texture loads are (temporarily) done on the main thread.
                self.connected = false;
            }

            self.flushQueueOnMain();

            setTimeout(function() {
                self.connect();
            }, 1000);
        }
    });
};

TextureProcess.prototype.destroy = function() {
    if (this.textureProcess) {
        console.log('Destroying texture process');
        this.destroyed = true;
        this.textureProcess.kill('SIGINT');
    }
};

TextureProcess.prototype.receiveMessage = function(data) {
    var s = data.readUInt32LE(0);
    var tsId = data.readUInt32LE(4);
    var info = this.queue.get(tsId);
    if (info) {
        this.queue.delete(tsId);
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
            info.cb(null, imageData, options);
        } else {
            imageData = data.slice(12);

            // Get error message.
            info.cb(imageData.toString('utf8'));
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

TextureProcess.prototype.send = function(tsId, type, data) {
    var len = 8;
    var dataBuffer;
    if (data) {
        dataBuffer = Buffer.from(data, 'utf8');
        len += dataBuffer.length + 4;
    }

    var out;
    if (data) {
        out = new Buffer(12);
        out.writeUInt32LE(len, 0);
        out.writeUInt32LE(tsId, 4);
        out.writeUInt32LE(type, 8);
        out = Buffer.concat([out, dataBuffer]);
    } else {
        out = new Buffer(8);
        out.writeUInt32LE(len, 0);
        out.writeUInt32LE(tsId, 4);
    }

    this.conn.write(out);
};

TextureProcess.prototype.isConnected = function() {
    return this.connected;
};

TextureProcess.prototype.flushQueueOnMain = function() {
    if (this.queue.size) {
        console.log('Texture process failure: load all ' + this.queue.size + ' pending requests on the main thread');

        this.queue.forEach(function(info) {
            // Load sync. This leads to an automatic cancel/deletion from the main queue.
            info.ts.load(true);
        });
    }
};

TextureProcess.prototype.loadTextureSourceString = function(src, ts, cb) {
    this.add(0, src, ts, cb);
    ts.cancelCb = this.cancel.bind(this);
    return true;
};

TextureProcess.prototype.loadText = function(settings, ts, cb) {
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
    this.send(ts.id);
    var info = this.queue.get(ts.id);
    if (info && info.cb) {
        // Cancel loading.
        info.cb(null, null);
        this.queue.delete(ts.id);
    }
};

module.exports = TextureProcess;