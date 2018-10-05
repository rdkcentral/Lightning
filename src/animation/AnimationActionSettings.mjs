export default class AnimationActionSettings {

    constructor(animationSettings) {

        this.animationSettings = animationSettings;

        /**
         * The selector that selects the views.
         * @type {string}
         */
        this._selector = "";

        /**
         * The value items, ordered by progress offset.
         * @type {AnimationActionItems}
         * @private;
         */
        this._items = new AnimationActionItems(this);

        /**
         * The affected properties (paths).
         * @private;
         */
        this._props = [];

        /**
         * Property setters, indexed according to props.
         * @private;
         */
        this._propSetters = [];

        this._resetValue = undefined;
        this._hasResetValue = false;

        this._hasColorProperty = undefined;
    }

    getResetValue() {
        if (this._hasResetValue) {
            return this._resetValue;
        } else {
            return this._items.getValue(0);
        }
    }

    apply(view, p, factor) {
        const views = this.getAnimatedViews(view);

        let v = this._items.getValue(p);

        if (v === undefined || !views.length) {
            return;
        }

        if (factor !== 1) {
            // Stop factor.;
            let sv = this.getResetValue();

            if (Utils.isNumber(v) && Utils.isNumber(sv)) {
                if (this.hasColorProperty()) {
                    v = StageUtils.mergeColors(v, sv, factor);
                } else {
                    v = StageUtils.mergeNumbers(v, sv, factor);
                }
            }
        }

        // Apply transformation to all components.;
        const n = this._propSetters.length;

        const m = views.length;
        for (let j = 0; j < m; j++) {
            for (let i = 0; i < n; i++) {
                this._propSetters[i](views[j], v);
            }
        }
    }
    
    getAnimatedViews(view) {
        return view.select(this._selector);
    }

    reset(view) {
        const views = this.getAnimatedViews(view);

        let v = this.getResetValue();

        if (v === undefined || !views.length) {
            return;
        }

        // Apply transformation to all components.
        const n = this._propSetters.length;

        const m = views.length;
        for (let j = 0; j < m; j++) {
            for (let i = 0; i < n; i++) {
                this._propSetters[i](views[j], v);
            }
        }
    }
    
    set selector(v) {
        this._selector = v;
    }

    set t(v) {
        this.selector = v;
    }

    get resetValue() {
        return this._resetValue;
    }
    
    set resetValue(v) {
        this._resetValue = v;
        this._hasResetValue = (v !== undefined);
    }

    set rv(v) {
        this.resetValue = v;
    }

    set value(v) {
        this._items.parse(v);
    }

    set v(v) {
        this.value = v;
    }

    set properties(v) {
        if (!Array.isArray(v)) {
            v = [v];
        }

        this._props = [];

        v.forEach((prop) => {
            this._props.push(prop);
            this._propSetters.push(View.getSetter(prop));
        });
    }

    set property(v) {
        this._hasColorProperty = undefined;
        this.properties = v;
    }

    set p(v) {
        this.properties = v;
    }

    patch(settings) {
        this.animationSettings.stage.patchObject(this, settings);
    }

    hasColorProperty() {
        if (this._hasColorProperty === undefined) {
            this._hasColorProperty = this._props.length ? View.isColorProperty(this._props[0]) : false;
        }
        return this._hasColorProperty;
    }
}

AnimationActionSettings.prototype.isAnimationActionSettings = true;

import Base from "../tree/Base.mjs";
import AnimationActionItems from "./AnimationActionItems.mjs";
import View from "../tree/View.mjs";
import StageUtils from "../tree/StageUtils.mjs";
import Utils from "../tree/Utils.mjs";
