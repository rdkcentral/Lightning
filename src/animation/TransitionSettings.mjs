/**
 * Copyright Metrological, 2017;
 */

export default class TransitionSettings {
    constructor() {
        this._timingFunction = 'ease';
        this._timingFunctionImpl = StageUtils.getTimingFunction(this._timingFunction);
        this.delay = 0;
        this.duration = 0.2;
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

    patch(settings) {
        Base.patchObject(this, settings);
    }
}

TransitionSettings.prototype.isTransitionSettings = true;

import Base from "../tree/Base.mjs";
import StageUtils from "../tree/StageUtils.mjs";
