var fs = require('fs');
var TextRendererSettings = require('../../wpe/TextRendererSettings');
var TextRenderer = require('../../wpe/TextRenderer');

var MessageReader = require('../../wpe/MessageReader');

var TextureProcessClient = function(textureProcess, conn) {
    this.textureProcess = textureProcess;

    console.log('Connection created with ' + conn.remoteAddress);
    this.conn = conn;

    this.queue = [];

    // Adapter for text rendering for this stage.
    this.textRendererAdapter = {
        getDefaultPrecision: function() {
            return 1;
        },
        getDefaultFontFace: function() {
            return 'Arial';
        },
        getDrawingCanvas: function() {
            var Canvas = require('canvas');
            return new Canvas(0, 0);
        }
    };

    // The running texture source loads (texture source ids).
    this.running = new Set();

    // Callbacks that are called, per texture source id, when that texture source load is canceled.
    this.cancelCbs = new Map();

    var self = this;
    this.messageReader = new MessageReader();
    this.messageReader.on('message', function(message) {
        self.receiveMessage(message);
    });

    this.conn.on('data', function(data) {
        self.messageReader.receive(data);
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
    var type = item.type;
    var src = item.src;

    var self = this;

    var handleResult = function(err, buf, w, h, renderInfo) {
        self.handleResult(err, tsId, src, buf, w, h, renderInfo);
    };

    this.running.add(tsId);

    if (type === 0) {
        this.loadTextureSourceString(tsId, src, handleResult);
    } else if (type === 1) {
        var settings = this.parseSettings(src);
        if (!settings) {
            handleResult('Settings parse error');
        } else {
            this.loadText(tsId, settings, handleResult);
        }
    }
};

TextureProcessClient.prototype.parseSettings = function(src) {
    var trs = null;
    try {
        var settings = JSON.parse(src);
        var trs = new TextRendererSettings();
        trs.set(settings);
    } catch(e) {
        console.error('Settings parse error', src);
    }
    return trs;
};


TextureProcessClient.prototype.handleResult = function(err, tsId, src, buf, w, h, renderInfo) {
    if (this.running.has(tsId)) {
        this.running.delete(tsId);
        this.cancelCbs.delete(tsId);

        if (err) {
            console.warn(src + ': ' + err + ' (' + tsId + ')');
            this.send(tsId, 1, new Buffer("" + err, 'utf8'));
        } else {
            // console.log(src + ': ' + buf.length + ' (' + tsId + ')');

            // Flip blue/red.
            this.flipBlueRed(buf);

            this.send(tsId, 0, buf, w, h, renderInfo);
        }
    }
};

TextureProcessClient.prototype.flipBlueRed = function(buf) {
    var r;
    for (var i = 0, n = buf.length; i < n; i += 4) {
        r = buf[i];
        buf[i] = buf[i + 2];
        buf[i + 2] = r;
    }
};

TextureProcessClient.prototype.send = function(tsId, code, data, w, h, renderInfo) {
    var out;

    if (code === 0) {
        var infoBuf = null;
        if (renderInfo) {
            var infoStr = JSON.stringify(renderInfo);
            infoBuf = new Buffer(infoStr, 'utf8');
        }
        out = new Buffer(24 + data.length + (infoBuf ? infoBuf.length : 0));
        out.writeUInt32LE(out.length, 0);
        out.writeUInt32LE(tsId, 4);
        out.writeUInt32LE(code, 8);
        out.writeUInt32LE(w, 12);
        out.writeUInt32LE(h, 16);
        out.writeUInt32LE(data.length, 20);
        data.copy(out, 24, 0);
        if (infoBuf) {
            infoBuf.copy(out, 24 + data.length, 0);
        }
    } else {
        out = new Buffer(12 + data.length);
        out.writeUInt32LE(out.length, 0);
        out.writeUInt32LE(tsId, 4);
        out.writeUInt32LE(code, 8);
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
                return cb("Status code " + res.statusCode + " for " + source);
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

        this.cancelCbs.set(tsId, function() {
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

TextureProcessClient.prototype.loadText = function(tsId, settings, cb) {
    // Generate the image.
    var tr = new TextRenderer(this.textRendererAdapter, settings);
    var rval = tr.draw();
    var renderInfo = rval.renderInfo;

    var data = rval.canvas.toBuffer('raw');
    cb(null, data, rval.canvas.width, rval.canvas.height, renderInfo);
};

TextureProcessClient.prototype.parseImage = function(data, cb) {
    var Canvas = require('canvas');
    try {
        var img = new Canvas.Image();
        img.src = data;
        var buf = img.getRawData();
        cb(null, buf, img.width, img.height);
    } catch(e) {
        cb('image parse error');
    }
};

TextureProcessClient.prototype.receiveMessage = function(data) {
    var len = data.readUInt32LE(0);
    var tsId = data.readUInt32LE(4);
    if (len === 8) {
        this.cancel(tsId);
    } else {
        var type = data.readUInt32LE(8);
        var src = data.slice(12).toString('utf8');
//        console.log('+ ' + src + " (" + tsId + ")");
        this.queue.push({id: tsId, type: type, src: src});
        this.flush();
    }
};

TextureProcessClient.prototype.cancel = function(tsId) {
    // Cancel.
    this.queue = this.queue.filter(function(e) {
        if (e.id === tsId) {
            return false;
        }
        return true;
    });

    if (this.running.has(tsId)) {
        // Delete from running list so that eventual callbacks aren't sent.
        this.running.delete(tsId);

        // Invoke cancel callback.
        var cancelCb = this.cancelCbs.get(tsId);
        if (cancelCb) {
            cancelCb();
            this.cancelCbs.delete(tsId);
        }
    }
};

module.exports = TextureProcessClient;