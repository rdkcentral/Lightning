let Base = require('../core/Base');

class TransitionSettings extends Base {
    constructor() {
        super();
    }

    _properties() {
        this._timingFunction = 'ease';
        this._timingFunctionImpl = StageUtils.getTimingFunction(this._timingFunction);
        this.delay = 0;
        this.duration = 1;
        this.isTransitionSettings = true;
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

module.exports = TransitionSettings;

let StageUtils = require('../core/StageUtils');
