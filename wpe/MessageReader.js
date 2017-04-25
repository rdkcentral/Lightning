var Utils = require('./Utils');
var EventEmitter = require('events');

var MessageReader = function() {
    EventEmitter.call(this);

    this.dataBuffers = [];
    this.dataBufferLength = 0;

};

Utils.extendClass(MessageReader, EventEmitter);

MessageReader.prototype.receive = function(data) {
    var offset, len;
    if (this.dataBufferLength === 0) {
        offset = 0;
        while(offset < data.length) {
            len = data.readUInt32LE(offset);
            if (len + offset <= data.length) {
                this.receiveMessage(data.slice(offset, offset + len));
            } else {
                // Part is remaining.
                this.dataBuffers.push(data.slice(offset));
                this.dataBufferLength = (len + offset) - data.length;
            }
            offset += len;
        }
    } else {
        offset = 0;
        len = this.dataBufferLength;
        if (len + offset <= data.length) {
            this.dataBuffers.push(data.slice(offset, offset + len));
            this.receiveMessage(Buffer.concat(this.dataBuffers));
            offset += len;
            this.dataBufferLength = 0;
            this.dataBuffers = [];

            while(offset < data.length) {
                len = data.readUInt32LE(offset);
                if (len + offset <= data.length) {
                    this.receiveMessage(data.slice(offset, offset + len));
                } else {
                    // Part is remaining.
                    this.dataBuffers.push(data.slice(offset));
                    this.dataBufferLength = (len + offset) - data.length;
                }
                offset += len;
            }
        } else {
            this.dataBuffers.push(data);
            this.dataBufferLength -= data.length;
        }
    }
};

MessageReader.prototype.receiveMessage = function(data) {
    this.emit('message', data);
};

module.exports = MessageReader;