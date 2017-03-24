var isNode = !!(((typeof module !== "undefined") && module.exports));

if (isNode) {
    var Utils = require('./Utils');
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
     * The value items, ordered by progress offset.
     * @type {{f: boolean, v: *, ..}[]}
     * @private
     */
    this._items = [];

    /**
     * The affected properties (names).
     * @type {{n: String, [s]: Function, [o]: String}[]}
     * @private
     */
    this._properties = [];

    /**
     * The value to reset to when stopping the timed animation.
     * @type {*}
     * @private
     */
    this._resetValue = null;

    this.hasResetValue = false;

    /**
     * Mergable function for values.
     * @type {Function}
     * @private
     */
    this.mergeFunction = null;

    // Default.
    this.tags = '';
}

/**
 * Returns the components to be animated.
 */
AnimationAction.prototype.getAnimatedComponents = function() {
    var n = this.tags.length;
    if (!this.animation.subject || !n) {
        return [];
    }

    if (n === 1) {
        if (this.tags[0] == '') {
            return [this.animation.subject];
        } else {
            return this.animation.subject.mtag(this.tags[0]);
        }
    } else {
        return this.getAnimatedMultiComponents();
    }
};

/**
 * Returns the components to be animated.
 */
AnimationAction.prototype.getAnimatedMultiComponents = function() {
    var i, n = this.tags.length, j, m, k, l;

    var taggedComponents = [];
    for (i = 0; i < n; i++) {
        if (this.tags[i] === '') {
            taggedComponents.push(this.animation.subject);
        } else {
            var comps = this.animation.subject.mtag(this.tags[i]);
            m = comps.length;
            for (j = 0; j < m; j++) {
                taggedComponents.push(comps[j]);
            }
        }
    }

    return taggedComponents;
};

AnimationAction.prototype.setValue = function(def) {
    var i, n;
    if (!Utils.isPlainObject(def)) {
        def = {0: def};
    }

    var items = [];
    for (var key in def) {
        if (def.hasOwnProperty(key)) {
            var obj = def[key];
            if (!Utils.isPlainObject(obj)) {
                obj = {v: obj};
            }

            var p = parseFloat(key);
            if (!isNaN(p) && p >= 0 && p <= 1) {
                obj.p = p;

                obj.f = Utils.isFunction(obj.v);
                obj.lv = obj.f ? obj.v(0, 0) : obj.v;

                items.push(obj);
            }
        }
    }

    // Sort by progress value.
    items = items.sort(function(a, b) {return a.p - b.p});

    n = items.length;

    for (i = 0; i < n; i++) {
        var last = (i == n - 1);
        if (!items[i].hasOwnProperty('pe')) {
            // Progress.
            items[i].pe = last ? 1 : items[i + 1].p;
        } else {
            // Prevent multiple items at the same time.
            var max = i < n - 1 ? items[i + 1].p : 1;
            if (items[i].pe > max) {
                items[i].pe = max;
            }
        }
        if (items[i].pe === items[i].p) {
            items[i].idp = 0;
        } else {
            items[i].idp = 1 / (items[i].pe - items[i].p);
        }
    }

    if (this.mergeFunction) {
        var rgba = (this.mergeFunction === StageUtils.mergeColors);

        // Calculate bezier helper values.
        for (i = 0; i < n; i++) {
            if (!items[i].hasOwnProperty('sm')) {
                // Smoothness.
                items[i].sm = 0.5;
            }
            if (!items[i].hasOwnProperty('s')) {
                // Slope.
                if (i === 0 || i === n - 1) {
                    // Horizontal slope at start and end.
                    items[i].s = rgba ? [0, 0, 0, 0] : 0;
                } else {
                    var pi = items[i - 1];
                    var ni = items[i + 1];
                    if (pi.p === ni.p) {
                        items[i].s = rgba ? [0, 0, 0, 0] : 0;
                    } else {
                        if (rgba) {
                            var nc = StageUtils.getRgbaComponents(ni.lv);
                            var pc = StageUtils.getRgbaComponents(pi.lv);
                            var d = 1 / (ni.p - pi.p);
                            items[i].s = [
                                d * (nc[0] - pc[0]),
                                d * (nc[1] - pc[1]),
                                d * (nc[2] - pc[2]),
                                d * (nc[3] - pc[3])
                            ];
                        } else {
                            items[i].s = (ni.lv - pi.lv) / (ni.p - pi.p);
                        }
                    }
                }
            }
        }

        for (i = 0; i < n - 1; i++) {
            // Calculate value function.
            if (!items[i].f) {
                var last = (i === n - 1);
                if (!items[i].hasOwnProperty('sme')) {
                    items[i].sme = last ? 0.5 : items[i + 1].sm;
                }
                if (!items[i].hasOwnProperty('se')) {
                    items[i].se = last ? (rgba ? [0, 0, 0, 0] : 0) : items[i + 1].s;
                }
                if (!items[i].hasOwnProperty('ve')) {
                    items[i].ve = last ? items[i].lv : items[i + 1].lv;
                }

                // Generate spline.
                if (rgba) {
                    items[i].v = StageUtils.getSplineRgbaValueFunction(items[i].v, items[i].ve, items[i].p, items[i].pe, items[i].sm, items[i].sme, items[i].s, items[i].se);
                } else {
                    items[i].v = StageUtils.getSplineValueFunction(items[i].v, items[i].ve, items[i].p, items[i].pe, items[i].sm, items[i].sme, items[i].s, items[i].se);
                }
                items[i].f = true;
            }
        }
    }

    this._items = items;
};

AnimationAction.prototype.getItem = function(p) {
    var n = this._items.length;
    if (!n) {
        return null;
    }

    if (p < this._items[0].p) {
        return null;
    }

    for (var i = 0; i < n; i++) {
        if (this._items[i].p <= p && p < this._items[i].pe) {
            return this._items[i];
        }
    }

    return this._items[n - 1];
};

AnimationAction.prototype.getValue = function(item, p) {
    // Found it.
    if (item.f) {
        var o = (p - item.p) * item.idp;

        return item.v(o, p, this.animation.getFrameForProgress(p));
    } else {
        return item.v;
    }
};

AnimationAction.prototype.getResetValue = function() {
    if (this.hasResetValue) {
        return this.resetValue;
    } else {
        if (this._items.length) {
            return this._items[0].lv;
        }
    }
    return 0;
};

AnimationAction.prototype.applyTransforms = function(p, m) {
    if (!this._properties.length) {
        return;
    }

    var c = this.getAnimatedComponents();
    if (!c.length) {
        return;
    }

    var item = this.getItem(p);
    if (!item) {
        return;
    }

    var v = this.getValue(item, p);

    if (m !== 1) {
        var sv = this.getResetValue();
        if (this.mergeFunction) {
            v = this.mergeFunction(v, sv, m);
        }
    }

    // Apply transformation to all components.
    var n = this._properties.length;

    var tcl = c.length;
    for (var i = 0; i < n; i++) {
        for (var j = 0; j < tcl; j++) {
            if (this._properties[i].s) {
                this._properties[i].s(c[j], v);
            }
        }
    }

};

AnimationAction.prototype.resetTransforms = function() {
    if (!this._properties.length) {
        return;
    }

    var v = this.getResetValue();

    // Apply transformation to all components.
    var n = this._properties.length;

    var c = this.getAnimatedComponents();
    var tcl = c.length;
    for (var i = 0; i < n; i++) {
        for (var j = 0; j < tcl; j++) {
            if (this._properties[i].s) {
                this._properties[i].s(c[j], v);
            }
        }
    }

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
    switch(name) {
        case 'value':
        case 'v':
            this.value = value;
            break;
        default:
            if (this[name] === undefined) {
                throw new TypeError('Unknown property:' + name);
            }
            this[name] = value;
    }
};


Object.defineProperty(AnimationAction.prototype, 'tags', {
    get: function() { return this._tags; },
    set: function(v) {
        if (!Utils.isArray(v)) {
            v = [v];
        }
        this._tags = v;
    }
});

Object.defineProperty(AnimationAction.prototype, 'tag', {
    get: function() { return this.tags; },
    set: function(v) {
        this.tags = v;
    }
});

Object.defineProperty(AnimationAction.prototype, 't', {
    get: function() { return this.tags; },
    set: function(v) {
        this.tags = v;
    }
});

Object.defineProperty(AnimationAction.prototype, 'properties', {
    get: function() { return this._properties; },
    set: function(v) {
        var vs = v;
        if (!Utils.isArray(v)) {
            vs = [vs];
        }

        var properties = [];
        var n = vs.length;
        for (var i = 0; i < n; i++) {
            v = vs[i];

            if (!Utils.isString(v)) {
                throw new TypeError('property must be a string');
            }

            if (Component.propAliases.has(v)) {
                var aliases = Component.propAliases.get(v);
                for (var j = 0, m = aliases.length; j < m; j++) {
                    properties.push({n: aliases[j]});
                }
            } else {
                properties.push({n: v});
            }
        }

        this.mergeFunction = null;
        var mergeFunctionConflict = false;
        for (i = 0, n = properties.length; i < n; i++) {
            var p = properties[i];

            var name = p.n;

            var index = name.indexOf('.');
            if (index >= 0) {
                // Sub object.
                p.o = name.substr(0, index);
                p.n = name.substr(index + 1);
            } else {
                p.o = 'component';
            }

            var setting = null;
            switch(p.o) {
                case 'text':
                    setting = TextRendererSettings.SETTINGS[p.n];
                    if (setting) {
                        p.s = function(c, v) {
                            setting.s(c.text, v)
                        };
                    }
                    break;
                case 'displayedTexture':
                    setting = Texture.SETTINGS[p.n];
                    if (setting) {
                        p.s = function(c, v) {if (c.displayedTexture) {setting.s(c.displayedTexture, v)}};
                    }
                    break;
                case 'texture':
                    setting = Texture.SETTINGS[p.n];
                    if (setting) {
                        p.s = function(c, v) {if (c.texture) {setting.s(c.texture, v)}};
                    }
                    break;
                case 'component':
                    setting = Component.SETTINGS[p.n];
                    if (setting) {
                        p.s = setting.s;
                    }
                    break;
                default:
            }

            if (!setting) {
                console.error("Unknown animation property:" + (p.o ? p.o + "." : "") + p.n);
                properties.splice(i, 1);
                i--;
                n--;
                continue;
            }

            if (i == 0) {
                this.mergeFunction = setting.m;
            } else {
                if (setting.m !== this.mergeFunction) {
                    mergeFunctionConflict = true;
                }
            }
        }
        if (mergeFunctionConflict) {
            console.error("You can't mix mergable and non-mergable properties in an animation action (" + (properties.map(function(p) {return (p.o ? p.o + "." : "") + p.n;})).join(",") + ")");
            this.mergeFunction = null;
        }

        this._properties = properties;
    }
});

Object.defineProperty(AnimationAction.prototype, 'property', {
    get: function() { return this.properties; },
    set: function(v) {
        this.properties = v;
    }
});

Object.defineProperty(AnimationAction.prototype, 'p', {
    get: function() { return this.properties; },
    set: function(v) {
        this.properties = v;
    }
});

Object.defineProperty(AnimationAction.prototype, 'value', {
    set: function(v) {
        this.setValue(v);
    }
});

Object.defineProperty(AnimationAction.prototype, 'v', {
    set: function(v) {
        this.value = v;
    }
});

Object.defineProperty(AnimationAction.prototype, 'resetValue', {
    get: function() { return this._resetValue; },
    set: function(v) {
        this._resetValue = v;
        this.hasResetValue = true;
    }
});

Object.defineProperty(AnimationAction.prototype, 'rv', {
    get: function() { return this.resetValue; },
    set: function(v) {
        this.resetValue = v;
    }
});

if (isNode) {
    module.exports = AnimationAction;
    var Component = require('./Component');
    var Texture = require('./Texture');
    var TextRendererSettings = require('./TextRendererSettings');
    var StageUtils = require('./StageUtils');
}