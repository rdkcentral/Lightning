class Transition extends Base {

    constructor(manager, definition, view, property) {
        super();

        EventEmitter.call(this);
        
        this.manager = manager;

        this.definition = definition;

        this._view = view;
        this._getter = View.getGetter(property);
        this._setter = View.getSetter(property);
        this._merger = View.getMerger(property) || StageUtils.mergeNumbers;

        if (!this._merger) {
            throw new Error("Property does not have a merger: " + property);
        }

        this._startValue = this._getter(this._view);
        this._targetValue = this._startValue;

        this._p = 1;
        this._delayLeft = 0;
    }

    _properties() {
        this.isTransition = true;
    }

    reset(targetValue, p) {
        this._startValue = this._getter(this._view);
        this._targetValue = targetValue;
        this._p = p;

        if (p < 1) {
            this.checkActive();
        } else if (p === 1) {
            this.setValue(this.getDrawValue());

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
            this._delayLeft = this.definition.delay;
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
        return (this.p < 1.0) && this.view.isAttached();
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

            if (this.duration == 0) {
                this._p = 1;
            } else {
                this._p += dt / this.duration;
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
        let t = this.definition.timingFunctionImpl(this.p);
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
            let v = this.definition._timingFunctionImpl(this.p);
            return this._merger(this.targetValue, this.startValue, v);
        }
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

    get duration() {
        return this.definition.duration;
    }

    get delay() {
        return this.definition.delay;
    }

    get timingFunction() {
        return this.definition.timingFunction;
    }
}

Base.mixinEs5(Transition, EventEmitter);