var isNode = !!(((typeof module !== "undefined") && module.exports));

if (isNode) {
    var Utils = require('./Utils');
}

/**
 * A texture source.
 * @constructor
 */
var TextureSource = function(manager, loadSource) {

    /**
     * @type {TextureManager}
     */
    this.manager = manager;

    this.stage = manager.stage;

    this.id = ++TextureSource.id;

    /**
     * Identifier for reusing this texture.
     * @type {String}
     */
    this.lookupId = null;

    /**
     * The factory for the source of this texture.
     * @type {Function}
     */
    this.loadSource = loadSource;

    /**
     * Loading since timestamp in millis.
     * @type {number}
     */
    this.loadingSince = null;

    /**
     * Flag that indicates if this texture source was stored in the texture atlas.
     * @type {boolean}
     */
    this.inTextureAtlas = false;

    /**
     * The x coordinate in the texture atlas.
     * @type {number}
     */
    this.textureAtlasX = 0;

    /**
     * The y coordinate in the texture atlas.
     * @type {number}
     */
    this.textureAtlasY = 0;

    // Source dimensions, after loading.
    this.w = 0;
    this.h = 0;

    /**
     * Precision (resolution, 1 = normal, 2 = twice as big as should be shown).
     * @type {number}
     */
    this._precision = 1;

    /**
     * 1 / precision.
     * @type {number}
     */
    this.iprecision = 1;

    // The WebGL loaded texture.
    this.glTexture = null;

    /**
     * If true, then this texture source is never freed from memory during garbage collection.
     * @type {boolean}
     */
    this.permanent = false;

    /**
     * All active Components that are using this texture source via a texture (either as texture or displayedTexture, or both).
     * @type {Set<Component>}
     */
    this.components = new Set();

    this.onload = null;

    /**
     * Sub-object with texture-specific rendering information.
     * For images, this contains the src property, for texts, this contains handy rendering information.
     * @type {Object}
     */
    this.renderInfo = null;

};

TextureSource.prototype.getRenderWidth = function() {
    return this.w / this.precision;
};

TextureSource.prototype.getRenderHeight = function() {
    return this.h / this.precision;
};

TextureSource.prototype.addComponent = function(c) {
    this.components.add(c);

    if (this.glTexture) {
        // If not yet loaded, wait until it is loaded until adding it to the texture atlas.
        if (this.stage.useTextureAtlas) {
            this.stage.textureAtlas.addActiveTextureSource(this);
        }
    }

    if (this.components.size === 1) {
        this.manager.textureSourceIdHashmap.set(this.id, this);
        if (this.lookupId) {
            if (!this.manager.textureSourceHashmap.has(this.lookupId)) {
                this.manager.textureSourceHashmap.set(this.lookupId, this);
            }
        }
    }
};

TextureSource.prototype.removeComponent = function(c) {
    if (this.components.size) {
        this.components.delete(c);

        if (!this.components.size) {
            if (this.stage.useTextureAtlas) {
                this.stage.textureAtlas.removeActiveTextureSource(this);
            }
            this.manager.textureSourceIdHashmap.delete(this.id);
        }
    }
};

TextureSource.prototype.isLoaded = function() {
    if (this.components.size) {
        if (this.stage.useTextureAtlas) {
            this.stage.textureAtlas.addActiveTextureSource(this);
        }
    }

    this.components.forEach(function(component) {
        component.textureSourceIsLoaded();
    });

    if (this.onload) this.onload();
    this.onload = null;
};

TextureSource.prototype.isAddedToTextureAtlas = function(x, y) {
    this.inTextureAtlas = true;
    this.textureAtlasX = x;
    this.textureAtlasY = y;

    this.components.forEach(function(component) {
        component.textureSourceIsAddedToTextureAtlas();
    });
};

TextureSource.prototype.isRemovedFromTextureAtlas = function() {
    this.inTextureAtlas = false;
    this.components.forEach(function(component) {
        component.textureSourceIsRemovedFromTextureAtlas();
    });
};

Object.defineProperty(TextureSource.prototype, 'precision', {
    get: function() {
        return this._precision;
    },
    set: function(v) {
        this._precision = v;
        this.iprecision = 1 / v;
    }
});

TextureSource.id = 0;

if (isNode) {
    module.exports = TextureSource;
}