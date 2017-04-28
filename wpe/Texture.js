var isNode = !!(((typeof module !== "undefined") && module.exports));

if (isNode) {
    var Utils = require('./Utils');
    var StageUtils = require('./StageUtils');
}

/**
 * A texture.
 * @param {TextureSource} source
 * @param {TextureManager} manager
 * @constructor
 */
function Texture(manager, source) {
    this.manager = manager;

    this.id = ++Texture.id;

    /**
     * The associated texture source.
     * Should not be changed.
     * @type {TextureSource}
     */
    this.source = source;

    /**
     * The texture clipping x-offset.
     * @type {number}
     */
    this._x = 0;

    /**
     * The texture clipping y-offset.
     * @type {number}
     */
    this._y = 0;

    /**
     * The texture clipping width. If 0 then full width.
     * @type {number}
     */
    this._w = 0;

    /**
     * The texture clipping height. If 0 then full height.
     * @type {number}
     */
    this._h = 0;

    /**
     * Indicates if this texture uses clipping.
     * @type {boolean}
     */
    this.clipping = false;

    /**
     * All active Components that are using this texture (either as texture or displayedTexture, or both).
     * @type {Set<Component>}
     */
    this.components = new Set();

}

Texture.prototype.addComponent = function(c) {
    this.components.add(c);
    this.source.addComponent(c);
};

Texture.prototype.removeComponent = function(c, d) {
    this.components.delete(c);
    if (d) {
        this.source.removeComponent(c);
    }
};

Texture.prototype.enableClipping = function(x, y, w, h) {
    if (this._x !== x || this._y !== y || this._w !== w || this._h !== h) {
        this._x = x;
        this._y = y;
        this._w = w;
        this._h = h;

        this.updateClipping(true);
    }
};

Texture.prototype.disableClipping = function() {
    if (this._x || this._y || this._w || this._h) {
        this._x = 0;
        this._y = 0;
        this._w = 0;
        this._h = 0;

        this.updateClipping(false);
    }
};

Texture.prototype.updateClipping = function(overrule) {
    if (overrule === true || overrule === false) {
        this.clipping = overrule;
    } else {
        this.clipping = !!(this._x || this._y || this._w || this._h);
    }

    var self = this;
    this.components.forEach(function(component) {
        // Ignore if not the currently displayed texture.
        if (component.displayedTexture === self) {
            component.onDisplayedTextureClippingChanged();
        }
    });
};

Texture.prototype.replaceTextureSource = function(newSource) {
    var components = new Set(this.components);

    var self = this;

    this.source = newSource;

    // Make sure that all components and component links are updated properly.
    var oldSource = this.source;
    components.forEach(function(component) {
        // Remove links from previous source, but only if there is no reason for it any more.
        var keep = (components.displayedTexture && components.displayedTexture !== self && components.displayedTexture.source === oldSource);
        keep = keep || (components.texture && components.texture !== self && components.texture.source === oldSource);

        if (!keep) {
            oldSource.removeComponent(component);
        }

        newSource.addComponent(component);

        if (newSource.glTexture) {
            component.displayedTexture = self;
        }
    });

};

Texture.prototype.load = function(sync) {
    this.source.load((sync !== false));
};

/**
 * Frees the GL texture, and forces a reload when it is required again.
 */
Texture.prototype.free = function() {
    this.source.free();
};

Texture.prototype.set = function(obj) {
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
        var value = obj[keys[i]];
        this.setSetting(keys[i], value);
    }
};

Texture.prototype.setSetting = function(name, value) {
    var setting = Texture.SETTINGS[name];
    if (setting) {
        setting.s(this, value);
    } else {
        console.warn("Unknown texture property: " + name);
    }
};

Texture.prototype.getNonDefaults = function() {
    var nonDefaults = {};
    if (this.x !== 0) nonDefaults['x'] = this.x;
    if (this.y !== 0) nonDefaults['y'] = this.x;
    if (this.w !== 0) nonDefaults['w'] = this.x;
    if (this.h !== 0) nonDefaults['h'] = this.x;
    return nonDefaults;
};

Object.defineProperty(Texture.prototype, 'x', {
    get: function() {
        return this._x;
    },
    set: function(v) {
        if (this._x !== v) {
            this._x = v;

            this.updateClipping();
        }
    }
});

Object.defineProperty(Texture.prototype, 'y', {
    get: function() {
        return this._y;
    },
    set: function(v) {
        if (this._y !== v) {
            this._y = v;

            this.updateClipping();
        }
    }
});

Object.defineProperty(Texture.prototype, 'w', {
    get: function() {
        return this._w;
    },
    set: function(v) {
        if (this._w !== v) {
            this._w = v;

            this.updateClipping();
        }
    }
});

Object.defineProperty(Texture.prototype, 'h', {
    get: function() {
        return this._h;
    },
    set: function(v) {
        if (this._h !== v) {
            this._h = v;

            this.updateClipping();
        }
    }
});

Texture.SETTINGS = {
    'x': {s: function(obj, value) {obj.x = value}, m: StageUtils.mergeNumbers},
    'y': {s: function(obj, value) {obj.y = value}, m: StageUtils.mergeNumbers},
    'w': {s: function(obj, value) {obj.w = value}, m: StageUtils.mergeNumbers},
    'h': {s: function(obj, value) {obj.h = value}, m: StageUtils.mergeNumbers}
};

Texture.id = 0;

if (isNode) {
    module.exports = Texture;
}