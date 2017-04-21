var fs = require('fs');

var TextureProcessClient = function(textureProcess, conn) {
    this.textureProcess = textureProcess;

    console.log('Connection created with ' + conn.remoteAddress);
    this.conn = conn;

    this.queue = [];

    this.running = new Map();

    this.dataBuffers = [];
    this.dataBufferLength = 0;

    var self = this;
    this.conn.on('data', function(data) {
        self.receive(data);
    });

    this.conn.on('close', function() {
        console.log('Connection lost with ' + conn.remoteAddress);
    });

    this.conn.on('error', function(data) {
        // We need this to prevent the 'unhandled error event' process crash.
    });
};

/**
 * Flushes the queue.
 */
TextureProcessClient.prototype.flush = function() {
    if (this.queue.length) {
        // Handle next.
        while(this.queue.length) {
            this.handleQueueItem(this.queue.pop());
        }
    }
};

TextureProcessClient.prototype.handleQueueItem = function(item) {
    var tsId = item.id;
    var src = item.src;

    var self = this;
    this.loadTextureSourceString(tsId, src, function(err, buf, w, h) {
        self.running.delete(tsId);

        if (err) {
            console.warn(src + ': ' + err + ' (' + tsId + ')');
            self.send(tsId, 1, new Buffer("" + err, 'utf8'));
        } else {
            console.log(src + ': ' + buf.byteLength + ' (' + tsId + ')');
            self.send(tsId, 0, buf, w, h);
        }
    });
};

TextureProcessClient.prototype.send = function(tsId, code, data, w, h) {
    var out = new Buffer((code === 0 ? 20 : 12) + data.byteLength);
    out.writeUInt32LE(out.byteLength, 0);
    out.writeUInt32LE(tsId, 4);
    out.writeUInt32LE(code, 8);

    if (code === 0) {
        out.writeUInt32LE(w, 12);
        out.writeUInt32LE(h, 16);
        data.copy(out, 20, 0);
    } else {
        data.copy(out, 12, 0);
    }

    this.conn.write(out);
};

TextureProcessClient.prototype.loadTextureSourceString = function(tsId, source, cb) {
    var self = this;
    if (/^https?:\/\//i.test(source)) {
        // URL. Download first.
        var mod = null;
        if (source.toLowerCase().indexOf("https:") === 0) {
            mod = require('https');
        } else {
            mod = require('http');
        }

        var aborted = false;
        var clientRequest = mod.get(source, function(res) {
            if (res.statusCode !== 200) {
                return cb(new Error("Status code " + res.statusCode + " for " + source));
            }

            var total = [];
            res.on('data', function(d) {
                total.push(d);
            });
            res.on('end', function() {
                var buf = Buffer.concat(total);
                self.parseImage(buf, cb);
            });
        }).on('error', function(err) {
            if (!aborted) {
                cb('URL fetch error: ' + err);
            }
        });

        this.running.set(tsId, function() {
            aborted = true;
            console.log('- ' + source + " (" + tsId + ")");
            clientRequest.abort();
        });
    } else {
        if (this.textureProcess.config.allowLocal) {
            // File system.
            fs.readFile(source, function(err, res) {
                if (err) {
                    console.error('Error loading image', source, err);
                    cb('File access error');
                } else {
                    self.parseImage(res, cb);
                }
            });
        } else {
            cb('Local file access denied');
        }
    }
};

TextureProcessClient.prototype.parseImage = function(data, cb) {
    var Canvas = require('canvas');
    try {
        var img = new Canvas.Image();
        img.src = data;
        var canvas = new Canvas(img.width, img.height);
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height);

        //@todo: premultiply alpha?

        cb(null, canvas.toBuffer('raw'), img.width, img.height);
    } catch(e) {
        cb('image parse error');
    }
};

TextureProcessClient.prototype.receive = function(data) {
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

TextureProcessClient.prototype.receiveMessage = function(data) {
    var len = data.readUInt32LE(0);
    var tsId = data.readUInt32LE(4);
    if (len === 8) {
        // Cancel.
        this.queue = this.queue.filter(function(e) {
            if (e.id === tsId) {
                console.log('- ' + e.src + " (" + tsId + ")");
                return false;
            }
            return true;
        });

        var running = this.running.get(tsId);
        if (running) {
            running();
        }
    } else {
        var src = data.slice(8).toString('utf8');
        console.log('+ ' + src + " (" + tsId + ")");
        this.queue.push({id: tsId, src: src});
        this.flush();
    }
};

module.exports = TextureProcessClient;