/**
 * Copyright Metrological, 2017
 */
let Base = require('../core/Base');

class Transition extends Base {

    constructor(manager, settings, view, property) {
        super();

        EventEmitter.call(this);
        
        this.manager = manager;

        this._settings = settings;

        if (!View) {
            View = require('../core/View');
        }
        this._view = view
        this._getter = View.getGetter(property)
        this._setter = View.getSetter(property)


        this._merger = settings.merger || this._view.getMerger(property)

        if (!this._merger) {
            throw new Error("Property must be a number or a color");
        }

        this._startValue = this._getter(this._view);
        this._targetValue = this._startValue;

        this._p = 1;
        this._delayLeft = 0;
    }

    _properties() {
        this.isTransition = true;
    }

    stop() {
        if (this.isActive()) {
            this._setter(this.targetValue);
            this._p = 1;
        }
    }

    reset(targetValue, p) {
        this._startValue = this._getter(this._view);
        this._targetValue = targetValue;
        this._p = p;

        if (p < 1) {
            this.checkActive();
        } else if (p === 1) {
            this._setter(targetValue);

            // Immediately invoke onFinish event.
            this.invokeListeners();
        }
    }

    start(targetValue) {
        this._startValue = this._getter(this._view);

        if (targetValue === this._startValue) {
            this.reset(this._startValue, targetValue, 1);
        } else {
            this._targetValue = targetValue;
            this._p = 0;
            this._delayLeft = this._settings.delay;
            if (this._eventsCount) this.emit('start');
            this.checkActive();
        }
    }

    finish() {
        if (this._p < 1) {
            this._p = 1;

            this._setter(this._view, this.targetValue);

            if (this._eventsCount) {
                this.invokeListeners();
            }
        }
    }

    checkActive() {
        if (this.isActive()) {
            this.manager.addActive(this);
        }
    }

    isActive() {
        return (this._p < 1.0) && this._view.isAttached();
    }

    progress(dt) {
        if (this.p < 1) {
            if (this.delayLeft > 0) {
                this._delayLeft -= dt;

                if (this.delayLeft < 0) {
                    dt = -this.delayLeft;
                    this._delayLeft = 0;

                    if (this._eventsCount) this.emit('delayEnd');
                } else {
                    return;
                }
            }

            if (this._settings.duration == 0) {
                this._p = 1;
            } else {
                this._p += dt / this._settings.duration;
            }
            if (this._p >= 1) {
                // Finished!
                this._p = 1;
            }
        }

        this._setter(this._view, this.getDrawValue());

        if (this._eventsCount) {
            this.invokeListeners();
        }
    }

    invokeListeners() {
        this.emit('progress', this.p);
        if (this.p === 1) {
            this.emit('finish');
        }
    }

    setValuesDynamic(targetValue) {
        let t = this._settings.timingFunctionImpl(this.p);
        if (t === 1) {
            this._targetValue = targetValue;
        } else if (t === 0) {
            this._startValue = this._targetValue;
            this._targetValue = targetValue;
        } else {
            this._startValue = targetValue - ((targetValue - this._targetValue) / (1 - v));
            this._targetValue = targetValue;
        }
    }

    getDrawValue() {
        if (this.p >= 1) {
            return this.targetValue;
        } else {
            let v = this._settings._timingFunctionImpl(this.p);
            return this._merger(this.targetValue, this.startValue, v);
        }
    }

    skipDelay() {
        this._delayLeft = 0;
    }

    get startValue() {
        return this._startValue;
    }

    get targetValue() {
        return this._targetValue;
    }

    get p() {
        return this._p;
    }

    get delayLeft() {
        return this._delayLeft;
    }

    get view() {
        return this._view;
    }

    get settings() {
        return this._settings;
    }

    set settings(v) {
        this._settings = v;
    }

}

let Utils = require('../core/Utils');
/*M¬*/let EventEmitter = require(Utils.isNode ? 'events' : '../browser/EventEmitter');/*¬M*/

Base.mixinEs5(Transition, EventEmitter);

module.exports = Transition;

let StageUtils = require('../core/StageUtils');
/*M¬*/let View = null;/*¬M*/
