var isNode = !!(((typeof module !== "undefined") && module.exports));

if (isNode) {
    var Utils = require('./Utils');
    var EventEmitter = require('events');
    var GenericAnimation = require('./GenericAnimation');
}

/**
 * An animation that is automatically progressed by time.
 * @constructor
 */
var Animation = function(stage) {
    GenericAnimation.call(this, stage);
    EventEmitter.call(this);

    this._delay = 0;

    /**
     * The duration of the animation, in seconds. If -1, the progress value should be set manually.
     * @type {number}
     */
    this._duration = 1;

    this._repeat = 0;
    this._repeatOffset = 0;
    this._repeatDelay = 0;

    /**
     * @access private
     */
    this.delayLeft = 0;

    /**
     * @access private
     */
    this.repeatsLeft = 0;

    /**
     * Automatically calls stop after finish.
     * @type {boolean}
     */
    this._autostop = false;

    /**
     * The way that the animation 'stops'.
     * @type {number}
     */
    this._stopMethod = Animation.STOP_METHODS.FADE;

    /**
     * Advanced options regarding the stop method, such as:
     * - {number} duration
     *   This overrules this animation's duration setting.
     * - {number} delay
     *   If specified, the stop starts delayed.
     * - {Function} timingFunction
     *   This overrules this animation's timing function.
     * @type {object}
     */
    this._stopMethodOptions = {};

    this.stopDelayLeft = 0;

    this.state = Animation.STATES.IDLE;

    this.stoppingProgressTransition = new GenericTransition(0);

};

Utils.extendClass(Animation, GenericAnimation);

Animation.prototype = Object.assign(Animation.prototype, EventEmitter.prototype);

Animation.prototype.isActive = function() {
    return this.subject && (this.state == Animation.STATES.PLAYING || this.state == Animation.STATES.STOPPING);
};

Animation.prototype.activate = function() {
    this.component.stage.addActiveAnimation(this);
};

Animation.prototype.progress = function(dt) {
    if (!this.subject) {
        return;
    }

    if (this.state == Animation.STATES.STOPPING) {
        this.stopProgress(dt);
        return;
    }

    if (this.state != Animation.STATES.PLAYING) {
        return;
    }

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

    if (this.duration === 0) {
        this.p = 1;
    } else if (this.duration > 0) {
        this.p += dt / this.duration;
    }
    if (this.p >= 1) {
        // Finished!
        if (this.repeat == -1 || this.repeatsLeft > 0) {
            if (this.repeatsLeft > 0) {
                this.repeatsLeft--;
            }
            this.p = this.repeatOffset;

            if (this.repeatDelay) {
                this.delayLeft = this.repeatDelay;
            }

            if (this._eventsCount) this.emit('repeat', this.repeatsLeft);
        } else {
            this.p = 1;
            this.state = Animation.STATES.FINISHED;
            if (this._eventsCount) this.emit('finish');
            if (this.autostop) {
                this.stop();
            }
        }
    } else {
        if (this._eventsCount) this.emit('progress', this.p);
    }
};

Animation.prototype.stopProgress = function(dt) {
    var duration = this.stopMethodOptions.duration === undefined ? this.duration : this.stopMethodOptions.duration;

    if (this.delayLeft > 0) {
        // Animation wasn't even started yet: directly finish!
        this.state = Animation.STATES.STOPPED;
        if (this._eventsCount) this.emit('stopFinish');
    }

    if (this.stopDelayLeft > 0) {
        this.stopDelayLeft -= dt;

        if (this.stopDelayLeft < 0) {
            dt = -this.stopDelayLeft;
            this.stopDelayLeft = 0;

            if (this._eventsCount) this.emit('stopDelayEnd');
        } else {
            return;
        }
    }
    if (this.stopMethod == Animation.STOP_METHODS.IMMEDIATE) {
        this.state = Animation.STATES.STOPPED;
        if (this._eventsCount) this.emit('stop');
        if (this._eventsCount) this.emit('stopFinish');
    } else if (this.stopMethod == Animation.STOP_METHODS.REVERSE) {
        if (duration === 0) {
            this.p = 0;
        } else if (duration > 0) {
            this.p -= dt / duration;
        }

        if (this.p <= 0) {
            this.p = 0;
            this.state = Animation.STATES.STOPPED;
            if (this._eventsCount) this.emit('stopFinish');
        }
    } else if (this.stopMethod == Animation.STOP_METHODS.FADE) {
        this.stoppingProgressTransition.progress(dt);
        if (this.stoppingProgressTransition.p >= 1) {
            this.state = Animation.STATES.STOPPED;
            if (this._eventsCount) this.emit('stopFinish');
        }
    } else if (this.stopMethod == Animation.STOP_METHODS.ONETOTWO) {
        if (this.p < 2) {
            if (duration === 0) {
                this.p = 2;
            } else if (duration > 0) {
                if (this.p < 1) {
                    this.p += dt / this.duration;
                } else {
                    this.p += dt / duration;
                }
            }
            if (this.p >= 2) {
                this.p = 2;
                this.state = Animation.STATES.STOPPED;
                if (this._eventsCount) this.emit('stopFinish');
            } else {
                if (this._eventsCount) this.emit('progress', this.p);
            }
        }
    } else {
        if (this.p < 1) {
            if (duration == 0) {
                this.p = 1;
            } else {
                this.p += dt / duration;
            }
            if (this.p >= 1) {
                if (this.stopMethod == Animation.STOP_METHODS.FORWARD) {
                    this.p = 1;
                    this.state = Animation.STATES.STOPPED;
                    if (this._eventsCount) this.emit('stopFinish');
                } else {
                    if (this.repeatsLeft > 0) {
                        this.repeatsLeft--;
                        this.p = 0;
                        if (this._eventsCount) this.emit('repeat', this.repeatsLeft);
                    } else {
                        this.p = 1;
                        this.state = Animation.STATES.STOPPED;
                        if (this._eventsCount) this.emit('stopFinish');
                    }
                }
            } else {
                if (this._eventsCount) this.emit('progress', this.p);
            }
        }
    }
};

Animation.prototype.start = function() {
    this.p = 0;
    this.delayLeft = this.delay;
    this.repeatsLeft = this.repeat;
    this.state = Animation.STATES.PLAYING;
    if (this._eventsCount) this.emit('start');

    if (this.subject) {
        this.stage.addActiveAnimation(this);
    }
};

Animation.prototype.fastForward = function() {
    if (this.state === Animation.STATES.PLAYING) {
        this.delayLeft = 0;
        this.p = 1;
    } else if (this.state === Animation.STATES.STOPPING) {
        this.stopDelayLeft = 0;
        this.p = 0;
    }
};

Animation.prototype.play = function() {
    if (this.state == Animation.STATES.STOPPING && this.stopMethod == Animation.STOP_METHODS.REVERSE) {
        // Continue.
        this.state = Animation.STATES.PLAYING;
        if (this._eventsCount) this.emit('stopContinue');
    } else if (this.state != Animation.STATES.PLAYING && this.state != Animation.STATES.FINISHED) {
        // Restart.
        this.start();
    }
};

Animation.prototype.replay = function() {
    if (this.state == Animation.STATES.FINISHED) {
        this.start();
    } else {
        this.play();
    }
};

Animation.prototype.isPlaying = function() {
    return this.state === Animation.STATES.PLAYING;
};

Animation.prototype.skipDelay = function() {
    this.delayLeft = 0;
    this.stopDelayLeft = 0;
};

Animation.prototype.stop = function() {
    if (this.state === Animation.STATES.STOPPED || this.state === Animation.STATES.IDLE) return;

    if (this.subject) {
        this.stage.addActiveAnimation(this);
    }

    this.stopDelayLeft = this.stopMethodOptions.delay || 0;

    if ((this.stopMethod == Animation.STOP_METHODS.IMMEDIATE && !this.stopDelayLeft) || this.delayLeft > 0) {
        // Stop upon next progress.
        this.state = Animation.STATES.STOPPING;
        if (this._eventsCount) this.emit('stop');
    } else {
        if (this.stopMethod == Animation.STOP_METHODS.FADE) {
            if (this.stopMethodOptions.duration) {
                this.stoppingProgressTransition.duration = this.stopMethodOptions.duration;
            }
            if (this.stopMethodOptions.timingFunction) {
                this.stoppingProgressTransition.timingFunction = this.stopMethodOptions.timingFunction;
            }
            this.stoppingProgressTransition.reset(0, 1, 0);
        }

        this.state = Animation.STATES.STOPPING;
        if (this._eventsCount) this.emit('stop');
    }

};

Animation.prototype.stopNow = function() {
    if (this.state !== Animation.STATES.STOPPED || this.state !== Animation.STATES.IDLE) {
        this.state = Animation.STATES.STOPPING;
        this.p = 0;
        if (this._eventsCount) this.emit('stop');
        this.resetTransforms();
        this.state = Animation.STATES.STOPPED;
        if (this._eventsCount) this.emit('stopFinish');
    }
};


Animation.prototype.applyTransforms = function() {
    if (this.state == Animation.STATES.STOPPED) {
        // After being stopped, reset all values to their start positions.
        var n = this.actions.length;
        for (var i = 0; i < n; i++) {
            this.actions[i].resetTransforms();
        }
    } else {
        // Apply possible fade out effect.
        var factor = 1;
        if (this.state == Animation.STATES.STOPPING && this.stopMethod == Animation.STOP_METHODS.FADE) {
            factor = (1 - this.stoppingProgressTransition.getDrawValue());
        }

        var n = this.actions.length;
        for (var i = 0; i < n; i++) {
            this.actions[i].applyTransforms(factor);
        }
    }
};

Object.defineProperty(Animation.prototype, 'delay', {
    get: function() { return this._delay; },
    set: function(v) {
        if (!Utils.isNumber(v)) {
            throw new TypeError('delay must be a number');
        }
        this._delay = v;
    }
});

Object.defineProperty(Animation.prototype, 'repeatDelay', {
    get: function() { return this._repeatDelay; },
    set: function(v) {
        if (!Utils.isNumber(v)) {
            throw new TypeError('repeatDelay must be a number');
        }
        this._repeatDelay = v;
    }
});

Object.defineProperty(Animation.prototype, 'duration', {
    get: function() { return this._duration; },
    set: function(v) {
        if (!Utils.isNumber(v)) {
            throw new TypeError('duration must be a number');
        }
        this._duration = v;
    }
});

Object.defineProperty(Animation.prototype, 'repeat', {
    get: function() { return this._repeat; },
    set: function(v) {
        if (!Utils.isInteger(v) || v < -1) {
            throw new TypeError('repeat must be a positive integer, 0 or -1');
        }
        this._repeat = v;
    }
});

Object.defineProperty(Animation.prototype, 'repeatOffset', {
    get: function() { return this._repeatOffset; },
    set: function(v) {
        if (!Utils.isNumber(v) || v < 0) {
            throw new TypeError('repeatOffset must be a positive number');
        }
        this._repeatOffset = v;
    }
});

Object.defineProperty(Animation.prototype, 'stopMethod', {
    get: function() { return this._stopMethod; },
    set: function(v) {
        this._stopMethod = v;
    }
});

Object.defineProperty(Animation.prototype, 'autostop', {
    get: function() { return this._autostop; },
    set: function(v) {
        if (!Utils.isBoolean(v)) {
            throw new TypeError('autostop must be a boolean');
        }
        this._autostop = v;
    }
});

Object.defineProperty(Animation.prototype, 'stopMethodOptions', {
    get: function() { return this._stopMethodOptions; },
    set: function(v) {
        if (!Utils.isObject(v)) {
            throw new TypeError('stopMethodOptions must be an object');
        }
        this._stopMethodOptions = v;
    }
});

Object.defineProperty(Animation.prototype, 'subject', {
    get: function() { return this._subject; },
    set: function(subject) {
        if (subject !== this._subject) {
            if (this._subject) {
                this._subject.removeAnimation(this);
            }
            if (subject) {
                subject.addAnimation(this);
            }

            this._subject = subject;
            if (this.isActive()) {
                this.activate();
            }
        }
    }
});

Animation.STATES = {
    IDLE: 0,
    PLAYING: 1,
    STOPPING: 2,
    STOPPED: 3,
    FINISHED: 4
};

Animation.STOP_METHODS = {
    FADE: 'fade',
    REVERSE: 'reverse',
    FORWARD: 'forward',
    IMMEDIATE: 'immediate',
    ONETOTWO: 'onetotwo'
};

if (isNode) {
    module.exports = Animation;
    var GenericTransition = require('./GenericTransition');
    var StageUtils = require('./StageUtils');
}