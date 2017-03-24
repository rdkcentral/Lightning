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
     * @type {AnimationActionItems}
     * @private
     */
    this._items = new AnimationActionItems(this);

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
    this._items.parseDefinition(def);
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

AnimationAction.prototype.getResetValue = function() {
    if (this.hasResetValue) {
        return this.resetValue;
    } else {
        if (this._items.length) {
            return this._items.lv[0];
        }
    }
    return 0;
};

AnimationAction.prototype.applyTransforms = function(m) {
    if (!this._properties.length) {
        return;
    }

    var c = this.getAnimatedComponents();
    if (!c.length) {
        return;
    }

    var v = this._items.getCurrentValue();

    if (v === undefined) {
        return;
    }

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
    var AnimationActionItems = require('./AnimationActionItems');
}