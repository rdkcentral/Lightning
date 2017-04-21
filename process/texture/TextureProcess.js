var net = require('net');
var TextureProcessClient = require('./TextureProcessClient');

var TextureProcess = function(config) {
    this.config = config;
};

TextureProcess.prototype.start = function() {
    var self = this;
    var server = net.createServer(function(socket) {
        var client = new TextureProcessClient(self, socket);
    });

    if (this.config.listen.path) {
        console.log('listening on Unix socket: ' + this.config.path);
    } else {
        console.log('listening on TCP socket: ' + this.config.listen.host + ':' + this.config.listen.port);
    }
    server.listen(this.config.listen);
};

module.exports = TextureProcess;