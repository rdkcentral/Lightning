/**
 * Copyright Metrological, 2017
 */

class AnimationActionSettings {

    constructor() {
        /**
         * The tags to which this transformation applies.
         * @type {string[]}
         */
        this._tags = null;

        /**
         * The value items, ordered by progress offset.
         * @type {AnimationActionItems}
         * @private
         */
        this._items = new AnimationActionItems(this);

        /**
         * The affected properties (paths).
         * @private
         */
        this._props = [];

        /**
         * Property setters, indexed according to props.
         * @private
         */
        this._propSetters = [];

        /**
         * The way that values should be interpolated.
         * @type {Function}
         * @private
         */
        this._merger = undefined;

        this._resetValue = undefined;
        this._hasResetValue = false;

    }

    getResetValue() {
        if (this._hasResetValue) {
            return this._resetValue;
        } else {
            return this._items.getValue(0);
        }
    }

    apply(view, p, factor) {
        let views = this.getAnimatedViews(view);

        let v = this._items.getValue(p);

        if (v === undefined || !views.length) {
            return;
        }

        if (factor !== 1) {
            // Stop factor.
            let sv = this.getResetValue();
            if (this._merger) {
                v = this._merger(v, sv, factor);
            }
        }

        // Apply transformation to all components.
        let n = this._propSetters.length;

        let m = views.length;
        for (let j = 0; j < m; j++) {
            for (let i = 0; i < n; i++) {
                this._propSetters[i](views[j], v);
            }
        }
    }
    
    getAnimatedViews(view) {
        if (!this._tags) {
            return [view];
        }

        let n = this._tags.length;

        if (n === 1) {
            if (this._tags[0] == '') {
                return [view];
            } else {
                return view.mtag(this._tags[0]);
            }
        } else {
            let views = [];
            for (let i = 0; i < n; i++) {
                if (this._tags[i] === '') {
                    views.push(view);
                } else {
                    let vs = view.mtag(this._tags[i]);
                    views = views.concat(vs);
                }
            }
            return views;
        }        
    }

    reset(view) {
        let views = this.getAnimatedViews(view);

        let v = this.getResetValue();

        if (v === undefined || !views.length) {
            return;
        }

        // Apply transformation to all components.
        let n = this._propSetters.length;

        let m = views.length;
        for (let j = 0; j < m; j++) {
            for (let i = 0; i < n; i++) {
                this._propSetters[i](views[j], v);
            }
        }
    }
    
    get tags() {
        return this._tags;
    }

    set tags(v) {
        if (!Array.isArray(v)) {
            v = [v];
        }
        this._tags = v;
    }

    set t(v) {
        this.tags = v;
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

        let detectMerger = (this._merger === undefined);

        let first = true;
        v.forEach((prop) => {
            this._props.push(prop);
            this._propSetters.push(View.getSetter(prop));

            if (detectMerger) {
                let merger = View.getMerger(prop);
                if (first) {
                    this._merger = merger;
                    first = false;
                } else {
                    if (this._merger !== merger) {
                        // Do not use a merger in case of merger conflicts.
                        console.warn('Merger conflicts for animation action properties: ' + v.join(','));
                        this._merger = undefined;
                    }
                }
            }
        });
    }

    set property(v) {
        this.properties = v;
    }

    set p(v) {
        this.properties = v;
    }

    set merger(f) {
        if (this._items.length) {
            console.trace('You should specify the merger before the values');
        }

        if (f === 'numbers') {
            f = StageUtils.mergeNumbers
        } else if (f === 'colors') {
            f = StageUtils.mergeColors
        }

        this._merger = f;
    }

    patch(settings) {
        Base.patchObject(this, settings)
    }
}

AnimationActionSettings.prototype.isAnimationActionSettings = true;

module.exports = AnimationActionSettings;

let Base = require('../core/Base')
let AnimationActionItems = require('./AnimationActionItems');
let View = require('../core/View');
let StageUtils = require('../core/StageUtils');
