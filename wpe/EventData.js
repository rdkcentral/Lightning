var isNode = !!(((typeof module !== "undefined") && module.exports));

if (isNode) {
    var Utils = require('./Utils');
}

/**
 * Data object sent when an event is triggered.
 * @param {object} data
 * @constructor
 */
function EventData(data) {

    this.data = data;

    /**
     * If the event supports this, it will cancel the operation (if possible).
     * @type {boolean}
     */
    this.preventDefault = false;

    /**
     * This will stop propagation of the event (if possible).
     * @type {boolean}
     */
    this.stopPropagation = false;

}

if (isNode) {
    module.exports = EventData;
}