var net = require('net');
var TextureProcessConnection = require('./TextureProcessConnection');
var WebSocketServer = require('websocket').server;

var TextureProcess = function(config) {
    this.config = config;
};

TextureProcess.prototype.start = function() {
    var self = this;
    var server;

    var http = require('http');
    server = http.createServer(function(request, response) {
        response.writeHead(404);
        response.end();
    });

    var wsServer = new WebSocketServer({
        httpServer: server,
        autoAcceptConnections: true
    });

    wsServer.on('request', function(request) {
        var connection = request.accept('echo-protocol', request.origin);
        new TextureProcessConnection(self, connection);
    });

    console.log('listening on TCP web socket: ' + this.config.listen.host + ':' + this.config.listen.port);

    server.listen(this.config.listen);
};

TextureProcess.prototype.isWebsocketServer = function() {
    return this.config.websocket;
};

module.exports = TextureProcess;