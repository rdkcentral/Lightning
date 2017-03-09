var isNode = !!(((typeof module !== "undefined") && module.exports));

if (isNode) {
    var Utils = require('./Utils');
    var StageUtils = require('./StageUtils');
    var EventType = require('./EventType');
    var AnimationAction = require('./AnimationAction');
}

/**
 * An animation.
 * @constructor
 */
function Animation(stage) {

    this.stage = stage;

    /**
     * @type {Component}
     */
    this.subject = null;

    this.actions = [];

    this._progressFunction = StageUtils.TIMING.LINEAR;

    /**
     * @access private
     */
    this.p = 0;

    this.onAttach = new EventType();
    this.onDetach = new EventType();

    /**
     * This value can be used to increase or decrease all changes that this animation makes to the subjects.
     * @type {number}
     */
    this._amplitude = 1;

    /**
     * Dummy for getFrameForProgress. Causes frame to be 0 when this is not a timed animation.
     * @type {number}
     */
    this.duration = 0;

}

Animation.prototype.setSubject = function(subject) {
    var prevSubject = this.subject;

    if (this.subject) {
        // Detach animation from previous subject.
        if (this.onDetach.hasListeners) {
            this.onDetach.trigger({subject: prevSubject, newSubject: subject});
        }
    }

    this.subject = subject;

    if (this.subject) {
        // Attach animation to this subject.
        if (this.onAttach.hasListeners) {
            this.onAttach.trigger({subject: subject, prevSubject: prevSubject});
        }
    }

    // Make sure that the tags are all reloaded next frame.
    var m = this.actions.length;
    for (var j = 0; j < m; j++) {
        this.actions[j].taggedComponentsForceRefresh = true;
    }
};

Animation.prototype.set = function(settings) {
    var propNames = Object.keys(settings);
    for (var i = 0; i < propNames.length; i++) {
        var name = propNames[i];
        var v = settings[name];
        this.setSetting(name, v);
    }
};

Animation.prototype.setSetting = function(name, value) {
    if (this[name] === undefined) {
        throw new TypeError('Unknown property:' + name);
    }
    this[name] = value;
};

Animation.prototype.add = function(settings) {
    var e = new AnimationAction(this);
    e.set(settings);
    this.actions.push(e);
    return e;
};

Animation.prototype.remove = function(element) {
    var index = this.actions.indexOf(element);
    if (index >= 0) {
        this.actions.splice(index, 1);
    }
};

Animation.prototype.get = function(index) {
    return this.actions[index];
};

Animation.prototype.getProgress = function() {
    return this.p;
};

Animation.prototype.getFrameForProgress = function(p) {
    return Math.round(p * this.duration * 60);
};

Animation.prototype.applyTransforms = function() {
    var p = this.progressFunction(this.p);

    var n = this.actions.length;
    for (var i = 0; i < n; i++) {
        this.actions[i].applyTransforms(p, this.getFrameForProgress(p), this.amplitude, 1);
    }
};

Animation.prototype.resetTransforms = function() {
    var n = this.actions.length;
    for (var i = 0; i < n; i++) {
        this.actions[i].resetTransforms(this.amplitude);
    }
};

/**
 * Cleans up this animation so that memory leaks are prevented.
 */
Animation.prototype.cleanUpCachedTaggedComponents = function() {
    var m = this.actions.length;
    for (var j = 0; j < m; j++) {
        this.actions[j].taggedComponents = [];
        this.actions[j].taggedComponentsForceRefresh = true;
    }
};

Object.defineProperty(Animation.prototype, 'progressFunction', {
    get: function() { return this._progressFunction; },
    set: function(v) {
        if (!Utils.isFunction(v)) {
            throw new TypeError('progressFunction must be a function');
        }
        this._progressFunction = v;
    }
});

Object.defineProperty(Animation.prototype, 'amplitude', {
    get: function() { return this._amplitude; },
    set: function(v) {
        if (!Utils.isNumber(v)) {
            throw new TypeError('amplitude must be a number');
        }
        this._amplitude = v;
    }
});

if (isNode) {
    module.exports = Animation;
}