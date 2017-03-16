var isNode = !!(((typeof module !== "undefined") && module.exports));

if (isNode) {
    var Utils = require('./Utils');
    var EventEmitter = require('events');
}

/**
 * A transition for some element.
 * @constructor
 */
function Transition(v) {
    EventEmitter.call(this);

    this._delay = 0;
    this._duration = 1;
    this._timingFunction = StageUtils.TIMING.EASE;

    /**
     * @access private
     */
    this.delayLeft = 0;

    /**
     * @access private
     */
    this.p = 1;

    /**
     * @access private
     */
    this.startValue = v;

    /**
     * @access private
     */
    this.targetValue = this.startValue;

}

Utils.extendClass(Transition, EventEmitter);

Transition.prototype.reset = function(startValue, targetValue, p) {
    this.startValue = startValue;
    this.targetValue = targetValue;
    this.p = p;

    if (this.isActive()) {
        this.activate();
    } else if (p === 1) {
        this.setValue(this.getDrawValue());

        // Immediately invoke onFinish event.
        this.invokeListeners();
    }
};

Transition.prototype.isActive = function() {
    return this.p < 1.0;
};

/**
 * Updates the target value and resets the transition.
 * @param targetValue
 * @param startValue
 */
Transition.prototype.updateTargetValue = function(targetValue, startValue) {
    if (targetValue === startValue) {
        this.reset(startValue, targetValue, 1);
    } else {
        this.targetValue = targetValue;

        this.startValue = startValue;

        // Reset.
        this.p = 0;

        this.delayLeft = this.delay;

        this.emit('start');

        if (this.isActive()) {
            this.activate();
        }
    }
};

Transition.prototype.activate = function() {
};

/**
 * Progress this transition.
 */
Transition.prototype.progress = function(dt) {
    if (this.p < 1) {
        if (this.delayLeft > 0) {
            this.delayLeft -= dt;

            if (this.delayLeft < 0) {
                dt = -this.delayLeft;
                this.delayLeft = 0;

                this.emit('delayEnd');
            } else {
                return;
            }
        }

        if (this.duration == 0) {
            this.p = 1;
        } else {
            this.p += dt / this.duration;
        }
        if (this.p >= 1) {
            // Finished!
            this.p = 1;
        }
    }

    this.setValue(this.getDrawValue());

    this.invokeListeners();
};

Transition.prototype.invokeListeners = function() {
    this.emit('progress', this.p);
    if (this.p === 1) {
        this.emit('finish');
    }
};

/**
 * Change current/target values while keeping the current transition ratio.
 */
Transition.prototype.setValuesDynamic = function(targetValue, currentFinalValue) {
    var v = this.timingFunction(this.p);

    if (v == 1) {
        this.targetValue = targetValue;
    } else if (v == 0) {
        this.targetValue = targetValue;
        this.startValue = currentFinalValue;
        this.targetValue = targetValue;
    } else {
        // Calculate the would-be start value.
        this.targetValue = targetValue;
        this.targetValue = targetValue;
        this.startValue = targetValue - ((targetValue - currentFinalValue) / (1 - v));
    }
};

Transition.prototype.set = function(settings) {
    var propNames = Object.keys(settings);
    for (var i = 0; i < propNames.length; i++) {
        var name = propNames[i];
        var v = settings[name];
        this.setSetting(name, v);
    }
};

Transition.prototype.setSetting = function(name, value) {
    if (this[name] === undefined) {
        throw new TypeError('Unknown property:' + name);
    }
    this[name] = value;
};

Transition.prototype.getProgress = function() {
    return this.p;
};

Transition.prototype.getDrawValue = function() {
    if (this.p >= 1) {
        return this.targetValue;
    } else {
        var v = this.timingFunction(this.p);
        return this.getMergedValue(v);
    }
};

Transition.prototype.setValue = function(v) {
};

Transition.prototype.getMergedValue = function(v) {
    // Numeric merge. Inline for performance.
    return this.targetValue * v + this.startValue * (1 - v);
};

Object.defineProperty(Transition.prototype, 'delay', {
    get: function() { return this._delay; },
    set: function(v) {
        if (!Utils.isNumber(v)) {
            throw new TypeError('delay must be a number');
        }
        this._delay = v;
    }
});

Object.defineProperty(Transition.prototype, 'duration', {
    get: function() { return this._duration; },
    set: function(v) {
        if (!Utils.isNumber(v)) {
            throw new TypeError('duration must be a number');
        }
        this._duration = v;
    }
});

Object.defineProperty(Transition.prototype, 'timingFunction', {
    get: function() { return this._timingFunction; },
    set: function(v) {
        if (!Utils.isFunction(v)) {
            throw new TypeError('timingFunction must be a function');
        }
        this._timingFunction = v;
    }
});


if (isNode) {
    module.exports = Transition;
    var StageUtils = require('./StageUtils');
}