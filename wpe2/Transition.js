class Transition extends Base {

    constructor(definition, context, getter, setter, merger) {
        super();

        EventEmitter.call(this);

        this.definition = definition;

        this._context = context;
        this._getter = getter;
        this._setter = setter;
        this._merger = merger;

        this._startValue = this._getter(this._context);
        this._targetValue = this._startValue;

        this._p = 1;
        this._delayLeft = 0;
    }

    reset(targetValue, p) {
        this._startValue = this._getter(this._context);
        this._targetValue = targetValue;
        this._p = p;

        if (this.isActive()) {
            this.activate();
        } else if (p === 1) {
            this.setValue(this.getDrawValue());

            // Immediately invoke onFinish event.
            this.invokeListeners();
        }
    }

    start(targetValue, currentValue) {
        this._startValue = currentValue;

        if (targetValue === this._startValue) {
            this.reset(this._startValue, targetValue, 1);
        } else {
            this._targetValue = targetValue;
            this._p = 0;
            this._delayLeft = this.definition.delay;
            if (this._eventsCount) this.emit('start');
            this.activate();
        }
    }

    activate() {
    }

    isActive() {
        return this.p < 1.0;
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

        this._setter(this._context, this.getDrawValue());

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
            return this._merger(this._context, v);
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
}

Base.mixinEs5(View, EventEmitter);