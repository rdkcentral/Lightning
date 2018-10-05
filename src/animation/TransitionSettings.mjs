import StageUtils from "../tree/StageUtils.mjs";

export default class TransitionSettings {
    constructor(stage) {
        this.stage = stage;
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
        this.stage.patchObject(this, settings);
    }
}

TransitionSettings.prototype.isTransitionSettings = true;

