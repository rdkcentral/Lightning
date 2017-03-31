var isNode = !!(((typeof module !== "undefined") && module.exports));

if (isNode) {
    var Utils = require('./Utils');
}

/**
 * An animation.
 * @constructor
 */
function GenericAnimation(stage) {

    this.stage = stage;

    /**
     * @type {Component}
     */
    this._subject = null;

    this.actions = [];

    /**
     * @access private
     */
    this.p = 0;

    /**
     * Dummy for getFrameForProgress. Causes frame to be 0 when this is not a timed animation.
     * @type {number}
     */
    this.duration = 0;

}

GenericAnimation.prototype.set = function(settings) {
    var propNames = Object.keys(settings);
    for (var i = 0; i < propNames.length; i++) {
        var name = propNames[i];
        var v = settings[name];
        this.setSetting(name, v);
    }
};

GenericAnimation.prototype.setSetting = function(name, value) {
    switch(name) {
        case 'actions':
            this.actions = [];
            for (var i = 0, n = value.length; i < n; i++) {
                this.add(value[i]);
            }
            break;
        default:
            if (this[name] === undefined) {
                throw new TypeError('Unknown property:' + name);
            }
            this[name] = value;
    }
};

GenericAnimation.prototype.add = function(settings) {
    var e = new AnimationAction(this);
    e.set(settings);
    this.actions.push(e);
    return e;
};

GenericAnimation.prototype.remove = function(element) {
    var index = this.actions.indexOf(element);
    if (index >= 0) {
        this.actions.splice(index, 1);
    }
};

GenericAnimation.prototype.get = function(index) {
    return this.actions[index];
};

GenericAnimation.prototype.getProgress = function() {
    return this.p;
};

GenericAnimation.prototype.getFrameForProgress = function(p) {
    return Math.round(p * this.duration * 60);
};

GenericAnimation.prototype.applyTransforms = function() {
    var n = this.actions.length;
    for (var i = 0; i < n; i++) {
        this.actions[i].applyTransforms(this.p, 1);
    }
};

GenericAnimation.prototype.resetTransforms = function() {
    var n = this.actions.length;
    for (var i = 0; i < n; i++) {
        this.actions[i].resetTransforms();
    }
};

Object.defineProperty(GenericAnimation.prototype, 'subject', {
    get: function() { return this._subject; },
    set: function(v) {
        this._subject = v;
    }
});

if (isNode) {
    module.exports = GenericAnimation;
    var StageUtils = require('./StageUtils');
    var AnimationAction = require('./AnimationAction');
}