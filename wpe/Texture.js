var isNode = !!(((typeof module !== "undefined") && module.exports));

if (isNode) {
    var Utils = require('./Utils');
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
    this.x = 0;

    /**
     * The texture clipping y-offset.
     * @type {number}
     */
    this.y = 0;

    /**
     * The texture clipping width. If 0 then full width.
     * @type {number}
     */
    this.w = 0;

    /**
     * The texture clipping height. If 0 then full height.
     * @type {number}
     */
    this.h = 0;

    /**
     * Indicates if this texture uses clipping.
     * @type {boolean}
     */
    this.clipping = false;

    /**
     * Precision (resolution, 1 = normal, 2 = twice as big as should be shown).
     * @type {number}
     */
    this.precision = 1;

    /**
     * All active Components that are using this texture (either as texture or displayedTexture, or both).
     * @type {Set<Component>}
     */
    this.components = new Set();

}

Texture.prototype.addComponent = function(c) {
    this.components.add(c);

    if (!this.source.glTexture) {
        // Attempts to load texture (if not already loaded).
        this.manager.loadTexture(this);
    }
};

Texture.prototype.removeComponent = function(c) {
    this.components.delete(c);
};

Texture.prototype.enableClipping = function(x, y, w, h) {
    this.clipping = true;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    var self = this;
    this.components.forEach(function(component) {
        // Ignore if not the currently displayed texture.
        if (component.displayedTexture === self) {
            component.displayedTextureClippingChanged();
        }
    });
};

Texture.prototype.disableClipping = function() {
    this.clipping = false;
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;

    var self = this;
    this.components.forEach(function(component) {
        // Ignore if not the currently displayed texture.
        if (component.displayedTexture === self) {
            component.displayedTextureClippingChanged();
        }
    });
};

Texture.prototype.replaceTextureSource = function(newSource) {
    var components = new Set(this.components);

    var self = this;

    // Make sure that all components and component links are updated properly.
    components.forEach(function(component) {
        if (component.texture === self) {
            component.texture = null;
        } else if (component.displayedTexture === self) {
            component.displayedTexture = null;
        }
    });

    this.source = newSource;

    components.forEach(function(component) {
        if (component.texture === null) {
            component.texture = self;
        } else {
            if (newSource.glTexture) {
                component.displayedTexture = self;
            }
        }
    });
};

Texture.prototype.load = function() {
    this.manager.loadTexture(this);
};

/**
 * Frees the GL texture, and forces a reload when it is required again.
 */
Texture.prototype.free = function() {
    this.manager.freeTextureSource(this.source);
};

Texture.id = 0;

if (isNode) {
    module.exports = Texture;
}