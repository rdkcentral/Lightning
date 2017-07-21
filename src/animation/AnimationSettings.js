/**
 * Copyright Metrological, 2017
 */
let Base = require('../core/Base');

class AnimationSettings extends Base {
    constructor() {
        super();

        /**
         * @type {AnimationActionSettings[]}
         * @private
         */
        this._actions = [];
    }

    _properties() {
        this.delay = 0;
        this.duration = 1;
        
        this.repeat = 0;
        this.repeatOffset = 0;
        this.repeatDelay = 0;

        this.autostop = false;

        this.stopMethod = AnimationSettings.STOP_METHODS.FADE;
        this._stopTimingFunction = 'ease';
        this._stopTimingFunctionImpl = StageUtils.getTimingFunction(this._stopTimingFunction);
        this.stopDuration = 0;
        this.stopDelay = 0;
    }

    get actions() {
        return this._actions;
    }

    set actions(v) {
        this._actions = [];
        for (let i = 0, n = v.length; i < n; i++) {
            let e = v[i];
            if (!e.isAnimationActionSettings) {
                let aas = new AnimationActionSettings(this);
                Base.setObjectSettings(aas, e);
                this._actions.push(aas);
            } else {
                this._actions.push(e);
            }
        }
    }

    /**
     * Applies the animation to the specified view, for the specified progress between 0 and 1.
     * @param {View} view
     * @param {number} p
     * @param {number} factor
     */
    apply(view, p, factor = 1) {
        this._actions.forEach(function(action) {
            action.apply(view, p, factor);
        });
    }

    /**
     * Resets the animation to the reset values.
     * @param {View} view
     */
    reset(view) {
        this._actions.forEach(function(action) {
            action.reset(view);
        });
    }

    get stopTimingFunction() {
        return this._stopTimingFunction;
    }

    set stopTimingFunction(v) {
        this._stopTimingFunction = v;
        this._stopTimingFunctionImpl = StageUtils.getTimingFunction(v);
    }

    get stopTimingFunctionImpl() {
        return this._stopTimingFunctionImpl;
    }

}

AnimationSettings.STOP_METHODS = {
    FADE: 'fade',
    REVERSE: 'reverse',
    FORWARD: 'forward',
    IMMEDIATE: 'immediate',
    ONETOTWO: 'onetotwo'
};

module.exports = AnimationSettings;

let StageUtils = require('../core/StageUtils');
let AnimationActionSettings = require('./AnimationActionSettings');
