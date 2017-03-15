var isNode = !!(((typeof module !== "undefined") && module.exports));

if (isNode) {
    var Utils = require('./Utils');
    var Component = require('./Component');
}

/**
 * An action within an animation.
 * @constructor
 */
function AnimationAction(animation) {

    this.animation = animation;

    /**
     * The tags to which this transformation applies.
     * @type {string[]}
     */
    this._tags = [];

    /**
     * If a function, then it is evaluated with the progress argument. If a literal value, it is used directly.
     * @type {*}
     * @private
     */
    this._value = null;

    /**
     * The affected properties (names).
     * @type {string[]}
     * @private
     */
    this._properties = [];

    /**
     * The value to reset to when stopping the timed animation.
     * @type {*}
     * @private
     */
    this._resetValue = null;

    /**
     * Whether or not a reset value was specified.
     * @type {boolean}
     */
    this.hasResetValue = false;

    /**
     * Whether or not this action has complex tags (if not, we can choose a more performant path).
     * @type {boolean}
     */
    this.hasComplexTags = false;

    /**
     * In case of hasComplexTags, the pre-split tags.
     * @type {string[][]}
     */
    this.complexTags = null;

}

/**
 * Returns the components to be animated.
 */
AnimationAction.prototype.getAnimatedComponents = function() {
    if (!this.animation.subject) {
        return false;
    }
    var i, n = this.tags.length, j, m, k, l;

    var taggedComponents = [];
    for (i = 0; i < n; i++) {
        if (this.tags[i] === '') {
            taggedComponents.push(this.animation.subject);
        } else {
            if (!this.hasComplexTags || (this.complexTags[i].length === 1)) {
                var comps = this.animation.subject.mtag(this.tags[i]);
                if (n === 1) {
                    taggedComponents = comps;
                } else {
                    m = comps.length;
                    for (j = 0; j < m; j++) {
                        taggedComponents.push(comps[j]);
                    }
                }
            } else {
                // Complex path: check hierarchically.
                tagPath = this.complexTags[i];
                l = tagPath.length;
                var finalComps = [this.animation.subject];
                for (k = 0; k < l; k++) {
                    m = finalComps.length;
                    var newFinalComps = [];
                    for (j = 0; j < m; j++) {
                        newFinalComps = newFinalComps.concat(finalComps[j].mtag(tagPath[k]));
                    }
                    finalComps = newFinalComps;
                }

                m = finalComps.length;
                for (j = 0; j < m; j++) {
                    taggedComponents.push(finalComps[j]);
                }
            }
        }
    }

    return taggedComponents;
};

AnimationAction.prototype.set = function(settings) {
    var propNames = Object.keys(settings);
    for (var i = 0; i < propNames.length; i++) {
        var name = propNames[i];
        var v = settings[name];
        this.setSetting(name, v);
    }
};

AnimationAction.prototype.setSetting = function(name, value) {
    if (this[name] === undefined) {
        throw new TypeError('Unknown property:' + name);
    }
    this[name] = value;
};

AnimationAction.prototype.applyTransforms = function(p, f, a, m) {
    var v = 0;

    if (!this._properties.length) {
        return;
    }

    if (Utils.isFunction(this.value)) {
        v = this.value(p, f);
    } else {
        v = this.value;
    }

    // Apply amplitude.
    if (a !== 1 && Utils.isNumber(v)) {
        v = v * a;
    }

    var sv = 0;
    if (m !== 1) {
        if (Utils.isFunction(this.value)) {
            sv = this.value(0, 0);
        } else {
            sv = this.value;
        }
    }

    // Apply transformation to all components.
    var self = this;
    var n = this._properties.length;

    var fv = v;

    var c = this.getAnimatedComponents();
    var tcl = c.length;
    for (var i = 0; i < n; i++) {
        if (m !== 1) {
            var mf = Component.getMergeFunction(this._properties[i]);
            if (!mf) {
                // Unmergable property.
                fv = v;
            } else {
                fv = mf(v, sv, m);
            }
        }

        for (var j = 0; j < tcl; j++) {
            c[j][self._properties[i]] = fv;
        }
    }

};

AnimationAction.prototype.resetTransforms = function(a) {
    var v = 0;

    if (!this._properties.length) {
        return;
    }

    if (this.hasResetValue) {
        v = this.resetValue;
    } else if (Utils.isFunction(this.value)) {
        v = this.value(0, 0);
    } else {
        v = this.value;
    }

    // Apply amplitude.
    if (a !== 1 && Utils.isNumber(v)) {
        v = v * a;
    }

    // Apply transformation to all components.
    var self = this;
    var n = this._properties.length;

    var c = this.getAnimatedComponents();
    var tcl = c.length;
    for (var i = 0; i < n; i++) {
        for (var j = 0; j < tcl; j++) {
            c[j][self._properties[i]] = v;
        }
    }

};

Object.defineProperty(AnimationAction.prototype, 'tags', {
    get: function() { return this._tags; },
    set: function(v) {
        if (!Utils.isArray(v)) {
            throw new TypeError('tags must be an array of strings');
        }
        this._tags = v;

        this.hasComplexTags = false;
        var i, n = v.length;
        for (i = 0; i < n; i++) {
            if (v[i].indexOf('.') !== -1) {
                this.hasComplexTags = true;
                break;
            }
        }

        if (this.hasComplexTags) {
            this.complexTags = new Array(n);
            for (i = 0; i < n; i++) {
                this.complexTags[i] = v[i].split('.');
            }
        } else {
            this.complexTags = null;
        }
    }
});

Object.defineProperty(AnimationAction.prototype, 'property', {
    get: function() { return this._properties; },
    set: function(v) {

        var vs = v;
        if (!Utils.isArray(v)) {
            vs = [vs];
        }

        var names = [];
        var n = vs.length;
        for (var i = 0; i < n; i++) {
            v = vs[i];

            if (!Utils.isString(v)) {
                throw new TypeError('property must be a string');
            }

            if (Component.propAliases.has(v)) {
                names = names.concat(Component.propAliases.get(v));
            } else {
                names.push(v);
            }
        }

        this._properties = names;
    }
});

Object.defineProperty(AnimationAction.prototype, 'value', {
    get: function() { return this._value; },
    set: function(v) {
        this._value = v;
    }
});

Object.defineProperty(AnimationAction.prototype, 'resetValue', {
    get: function() { return this._resetValue; },
    set: function(v) {
        this._resetValue = v;
        this.hasResetValue = true;
    }
});

if (isNode) {
    module.exports = AnimationAction;
}