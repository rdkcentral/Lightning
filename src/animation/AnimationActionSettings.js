/**
 * Copyright Metrological, 2017
 */
let Base = require('../core/Base');

class AnimationActionSettings extends Base {

    constructor() {
        super();

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
         * The view type to determine the property mergers.
         * @type {class}
         * @private
         */
        this._type = undefined;
    }

    _properties() {
        this._resetValue = undefined;
        this._hasResetValue = false;
        this._merger = undefined;

        this.isAnimationActionSettings = true;
    }

    getResetValue() {
        if (this._hasResetValue) {
            return this._resetValue;
        } else {
            return this._items.getValue(0);
        }
        return 0;
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

        this._merger = undefined;
        let first = true;
        v.forEach((prop) => {
            this._props.push(prop);
            this._propSetters.push(View.getSetter(prop));


            let merger = View.getMerger(prop, this._type);
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
        });
    }

    set property(v) {
        this.properties = v;
    }

    set p(v) {
        this.properties = v;
    }

    setSettings(settings) {
        if (settings.type) {
            // Make sure that type is known before settings properties.
            this._type = settings.type;
        }
        Base.setObjectSettings(this, settings);
    }

}

module.exports = AnimationActionSettings;

let AnimationActionItems = require('./AnimationActionItems');
let View = require('../core/View');
