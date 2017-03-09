var isNode = !!(((typeof module !== "undefined") && module.exports));

if (isNode) {
    var Utils = require('./Utils');
    var StageUtils = require('./StageUtils');
    var EventType = require('./EventType');
}

/**
 * A transition for some element.
 * @constructor
 */
function Transition(value, mergeFunction) {

    /**
     * The merge function. If null then use plain numeric interpolation merge.
     * @type {Function}
     */
    this.mergeFunction = mergeFunction;

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
    this.startValue = value;

    /**
     * @access private
     */
    this.targetValue = value;

    /**
     * @access private
     */
    this.lastResultValue = value;

    this.onStart = new EventType();
    this.onDelayEnd = new EventType();
    this.onProgress = new EventType();
    this.onFinish = new EventType();

    this.onActivate = null;

    this.active = false;

}

Transition.prototype.getChangeSpeed = function() {
    if ((this.delayLeft > 0) || (this.p >= 1)) {
        return 0;
    }

    var dv = this.getDrawValue();
    this.p += 1e-2;
    var v = this.getDrawValue();
    this.p -= 1e-2;

    return (v - dv) * 1e2 / this.duration;
};

Transition.prototype.reset = function(startValue, targetValue, p) {
    this.startValue = startValue;
    this.lastResultValue = startValue;
    this.targetValue = targetValue;
    this.p = p;

    if (!this.active && this.isActive()) {
        this.active = true;
        if (this.onActivate) {
            this.onActivate();
        }
    }
};

Transition.prototype.isActive = function() {
    return this.p < 1.0;
};

Transition.prototype.setInactive = function() {
    this.active = false;
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

        this.onStart.trigger(null);

        if (!this.active && this.isActive()) {
            this.active = true;
            this.onActivate();
        }
    }

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

                this.onDelayEnd.trigger(null);
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

    this.lastResultValue = this.getDrawValue();
};

Transition.prototype.invokeListeners = function() {
    if (this.onProgress.hasListeners) {
        this.onProgress.trigger({p: this.p});
    }
    if (this.p === 1) {
        if (this.onFinish.hasListeners) {
            this.onFinish.trigger(null);
        }
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
        if (!this.mergeFunction) {
            // Numeric merge. Inline for performance.
            return this.targetValue * v + this.startValue * (1 - v);
        } else {
            return this.mergeFunction(this.targetValue, this.startValue, v);
        }
    }
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
}