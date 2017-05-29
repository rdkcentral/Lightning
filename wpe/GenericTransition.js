var isNode = !!(((typeof module !== "undefined") && module.exports));

if (isNode) {
    var Utils = require('./Utils');
    var EventEmitter = require('events');
}

/**
 * A transition for some element.
 * @constructor
 */
function GenericTransition(v) {
    EventEmitter.call(this);

    /**
     * @access private
     */
    this.startValue = v;

    /**
     * @access private
     */
    this.targetValue = this.startValue;

    this.timingFunction = 'ease';

}

Utils.extendClass(GenericTransition, EventEmitter);

GenericTransition.prototype._delay = 0;
GenericTransition.prototype._duration = 1;

/**
 * @access private
 */
GenericTransition.prototype.delayLeft = 0;

/**
 * @access private
 */
GenericTransition.prototype.p = 1;

GenericTransition.prototype.reset = function(startValue, targetValue, p) {
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

GenericTransition.prototype.isActive = function() {
    return this.p < 1.0;
};

/**
 * Updates the target value and resets the transition.
 * @param targetValue
 * @param startValue
 */
GenericTransition.prototype.updateTargetValue = function(targetValue, startValue) {
    if (targetValue === startValue) {
        this.reset(startValue, targetValue, 1);
    } else {
        this.targetValue = targetValue;

        this.startValue = startValue;

        // Reset.
        this.p = 0;

        this.delayLeft = this.delay;

        if (this._eventsCount) this.emit('start');

        if (this.isActive()) {
            this.activate();
        }
    }
};

GenericTransition.prototype.activate = function() {
};

/**
 * Progress this transition.
 */
GenericTransition.prototype.progress = function(dt) {
    if (this.p < 1) {
        if (this.delayLeft > 0) {
            this.delayLeft -= dt;

            if (this.delayLeft < 0) {
                dt = -this.delayLeft;
                this.delayLeft = 0;

                if (this._eventsCount) this.emit('delayEnd');
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

GenericTransition.prototype.invokeListeners = function() {
    if (this._eventsCount) this.emit('progress', this.p);
    if (this.p === 1) {
        if (this._eventsCount) this.emit('finish');
    }
};

/**
 * Change current/target values while keeping the current transition ratio.
 */
GenericTransition.prototype.setValuesDynamic = function(targetValue, currentFinalValue) {
    var v = this._timingFunctionImpl(this.p);

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

GenericTransition.prototype.set = function(settings) {
    var propNames = Object.keys(settings);
    for (var i = 0; i < propNames.length; i++) {
        var name = propNames[i];
        var v = settings[name];
        this.setSetting(name, v);
    }
};

GenericTransition.prototype.setSetting = function(name, value) {
    if (this[name] === undefined) {
        throw new TypeError('Unknown property:' + name);
    }
    this[name] = value;
};

GenericTransition.prototype.getProgress = function() {
    return this.p;
};

GenericTransition.prototype.getDrawValue = function() {
    if (this.p >= 1) {
        return this.targetValue;
    } else {
        var v = this._timingFunctionImpl(this.p);
        return this.getMergedValue(v);
    }
};

GenericTransition.prototype.setValue = function(v) {
};

GenericTransition.prototype.getMergedValue = function(v) {
    // Numeric merge. Inline for performance.
    return this.targetValue * v + this.startValue * (1 - v);
};

Object.defineProperty(GenericTransition.prototype, 'delay', {
    get: function() { return this._delay; },
    set: function(v) {
        if (!Utils.isNumber(v)) {
            throw new TypeError('delay must be a number');
        }
        this._delay = v;
    }
});

Object.defineProperty(GenericTransition.prototype, 'duration', {
    get: function() { return this._duration; },
    set: function(v) {
        if (!Utils.isNumber(v)) {
            throw new TypeError('duration must be a number');
        }
        this._duration = v;
    }
});

Object.defineProperty(GenericTransition.prototype, 'timingFunction', {
    get: function() { return this._timingFunction; },
    set: function(v) {
        if (v !== this._timingFunction) {
            this._timingFunction = v;
            this._timingFunctionImpl = StageUtils.getTimingFunction(v);
        }
    }
});


if (isNode) {
    module.exports = GenericTransition;
    var StageUtils = require('./StageUtils');
}