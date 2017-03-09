var isNode = !!(((typeof module !== "undefined") && module.exports));

if (isNode) {
    var Utils = require('./Utils');
    var EventData = require('./EventData');
}

var EventType = function() {
    this.listeners = [];
    this.hasListeners = false;
};

EventType.prototype.listen = function(f) {
    this.listeners.push(f);
    this.hasListeners = true;
};

EventType.prototype.removeListener = function(f) {
    var index = this.listeners.indexOf(f);
    if (index >= 0) {
        this.listeners.splice(index, 1);
    }

    this.hasListeners = (this.listeners.length > 0);
};

EventType.prototype.trigger = function(data) {
    if (!this.hasListeners) return;

    var eventData = (data && data instanceof EventData) ? data : new EventData(data || {});
    var i;
    for (i = 0; i < this.listeners.length; i++) {
        this.listeners[i](eventData);
    }

    return eventData;
};


if (isNode) {
    module.exports = EventType;
}