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
     * The updated frame numbers for the tags.
     * @type {Map<string, number>}
     */
    this.tagUpdatedFrameNumbers = new Map();

    /**
     * The latest found (and cached) components for this animation.
     * Notice that this really needs to be cleared when an animation becomes inactive, because it could lead to memory
     * leaks.
     * @type {Component[]}
     */
    this.taggedComponents = [];

    /**
     * Forces an update of the tagged components.
     * @type {boolean}
     */
    this.taggedComponentsForceRefresh = false;

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
 * Updates the subject components if necessary.
 * @returns {boolean}
 */
AnimationAction.prototype.updateComponents = function() {
    if (!this.animation.subject) {
        return false;
    }
    var i, n = this.tags.length, j, m, k, l, uf, cf, tagPath, frame;
    var needsUpdate = this.taggedComponentsForceRefresh;
    if (!needsUpdate) {
        for (i = 0; i < n; i++) {
            if (this.tags[i]) { // Ignore 'empty' tag (means: subject itself).
                if (!this.hasComplexTags || (this.complexTags[i].length === 1)) {
                    uf = this.animation.subject.treeTagsUpdatedFrame.get(this.tags[i]);
                    if (uf === undefined) {
                        needsUpdate = true;
                        break;
                    } else {
                        cf = this.tagUpdatedFrameNumbers.get(this.tags[i]);
                        if (cf === undefined || cf < uf) {
                            needsUpdate = true;
                            break;
                        }
                    }
                } else {
                    // Complex path.
                    tagPath = this.complexTags[i];
                    l = tagPath.length;
                    cf = this.tagUpdatedFrameNumbers.get(this.tags[i]);
                    for (k = 0; k < l; k++) {
                        uf = this.animation.subject.treeTagsUpdatedFrame.get(tagPath[k]);
                        if (uf === undefined) {
                            needsUpdate = true;
                            break;
                        } else {
                            if (cf === undefined || cf < uf) {
                                needsUpdate = true;
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
    if (needsUpdate) {
        this.taggedComponents = [];

        for (i = 0; i < n; i++) {
            if (this.tags[i] === '') {
                this.taggedComponents.push(this.animation.subject);
            } else {
                if (!this.hasComplexTags || (this.complexTags[i].length === 1)) {
                    // Set frame number to be able to detect changes later.
                    frame = this.animation.subject.treeTagsUpdatedFrame.get(this.tags[i]);
                    if (frame === undefined) {
                        frame = 0;
                        this.animation.subject.treeTagsUpdatedFrame.set(this.tags[i], frame);
                    }
                    this.tagUpdatedFrameNumbers.set(this.tags[i], frame);

                    var comps = this.animation.subject.getByTag(this.tags[i]);
                    m = comps.length;
                    for (j = 0; j < m; j++) {
                        this.taggedComponents.push(comps[j]);
                    }
                } else {
                    // Complex path: check hierarchically.
                    tagPath = this.complexTags[i];
                    l = tagPath.length;
                    var maxFrame = 0;
                    var finalComps = [this.animation.subject];
                    for (k = 0; k < l; k++) {
                        // Set frame number to be able to detect changes later.
                        frame = this.animation.subject.treeTagsUpdatedFrame.get(tagPath[k]);
                        if (frame !== undefined) {
                            maxFrame = Math.max(frame, maxFrame);
                        } else {
                            this.animation.subject.treeTagsUpdatedFrame.set(tagPath[k], 0);
                        }

                        m = finalComps.length;
                        var newFinalComps = [];
                        for (j = 0; j < m; j++) {
                            newFinalComps = newFinalComps.concat(finalComps[j].getByTag(tagPath[k]));
                        }
                        finalComps = newFinalComps;
                    }

                    m = finalComps.length;
                    for (j = 0; j < m; j++) {
                        this.taggedComponents.push(finalComps[j]);
                    }

                    this.tagUpdatedFrameNumbers.set(this.tags[i], maxFrame);
                }
            }
        }

        // Make array unique, so that no animation action is applied twice to the same item because it matches in multiple tags.
        this.taggedComponents = this.taggedComponents.sort(function(a, b) {return a.id == b.id}).filter(function(item, pos, ary) {
            return !pos || item !== ary[pos - 1];
        });

        this.taggedComponentsForceRefresh = false;
    }

    return needsUpdate;
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

    this.updateComponents();

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

AnimationAction.prototype.getAnimatedComponents = function() {
    return this.taggedComponents;
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

    this.updateComponents();

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

        this.taggedComponentsForceRefresh = true;
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