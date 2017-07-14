class TransitionDefinition extends Base {
    constructor() {
        super();
    }

    _properties() {
        this._timingFunction = 'ease';
        this._timingFunctionImpl = StageUtils.getTimingFunction(this._timingFunction);
        this._delay = 0;
        this._duration = 1;
        this._delay = 0;
        this.isTransitionDefinition = true;
    }

    get delay() {
        return this._delay;
    }
    
    set delay(v) {
        this._delay = v;
    }

    get duration() {
        return this._duration;
    }

    set duration(v) {
        this._duration = v;
    }

    get timingFunction() {
        return this._timingFunction;
    }

    set timingFunction(v) {
        this._timingFunction = v;
        this._timingFunctionImpl = StageUtils.getTimingFunction(v);
    }

    get timingFunctionImpl() {
        return this._timingFunctionImpl;
    }
}