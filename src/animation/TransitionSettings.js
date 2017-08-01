/**
 * Copyright Metrological, 2017
 */
let Base = require('../core/Base');

class TransitionSettings extends Base {
    constructor() {
        super();
    }

    _properties() {
        this._timingFunction = 'ease';
        this._timingFunctionImpl = StageUtils.getTimingFunction(this._timingFunction);
        this.delay = 0;
        this.duration = 0.2;
        this.isTransitionSettings = true;
        this.merger = null;
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
