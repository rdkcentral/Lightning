var isNode = !!(((typeof module !== "undefined") && module.exports));

if (isNode) {
    var Utils = require('./Utils');
}

/**
 * A texture source.
 * @constructor
 */
var TextureSource = function(manager, loadCb) {

    /**
     * @type {TextureManager}
     */
    this.manager = manager;

    this.stage = manager.stage;

    this.id = ++TextureSource.id;

    /**
     * The factory for the source of this texture.
     * @type {Function}
     */
    this.loadCb = loadCb;

    /**
     * All active Components that are using this texture source via a texture (either as texture or displayedTexture, or both).
     * @type {Set<Component>}
     */
    this.components = new Set();

};

/**
 * Identifier for reusing TextureSource.prototype.texture.
 * @type {String}
 */
TextureSource.prototype.lookupId = null;

/**
 * If set, TextureSource.prototype.is called when the texture source is no longer displayed (TextureSource.prototype.components.size becomes 0).
 * @type {Function}
 */
TextureSource.prototype.cancelCb = null;

/**
 * Loading since timestamp in millis.
 * @type {number}
 */
TextureSource.prototype.loadingSince = 0;

/**
 * Flag that indicates if TextureSource.prototype.texture source was stored in the texture atlas.
 * @type {boolean}
 */
TextureSource.prototype.inTextureAtlas = false;

/**
 * The x coordinate in the texture atlas.
 * @type {number}
 */
TextureSource.prototype.textureAtlasX = 0;

/**
 * The y coordinate in the texture atlas.
 * @type {number}
 */
TextureSource.prototype.textureAtlasY = 0;

// Source dimensions, after loading.
TextureSource.prototype.w = 0;
TextureSource.prototype.h = 0;

// The WebGL loaded texture.
TextureSource.prototype.glTexture = null;

/**
 * If true, then TextureSource.prototype.texture source is never freed from memory during garbage collection.
 * @type {boolean}
 */
TextureSource.prototype.permanent = false;

TextureSource.prototype.onload = null;

/**
 * Sub-object with texture-specific rendering information.
 * For images, TextureSource.prototype.contains the src property, for texts, TextureSource.prototype.contains handy rendering information.
 * @type {Object}
 */
TextureSource.prototype.renderInfo = null;

TextureSource.prototype.getRenderWidth = function() {
    return this.w
};

TextureSource.prototype.getRenderHeight = function() {
    return this.h;
};

TextureSource.prototype.addComponent = function(c) {
    if (!this.components.has(c)) {
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

            this.becomesVisible();
        }
    }
};

TextureSource.prototype.removeComponent = function(c) {
    if (this.components.delete(c)) {
        if (!this.components.size) {
            if (this.stage.useTextureAtlas) {
                this.stage.textureAtlas.removeActiveTextureSource(this);
            }
            this.manager.textureSourceIdHashmap.delete(this.id);

            this.becomesInvisible();
        }
    }
};

TextureSource.prototype.becomesVisible = function() {
    this.load(false);
};

TextureSource.prototype.becomesInvisible = function() {
    if (this.isLoading()) {
        if (this.cancelCb) {
            // Allow the callback to cancel loading.
            this.cancelCb(this);
        }
    }
};

TextureSource.prototype.load = function(sync) {
    if (this.isLoading() && sync) {
        // We cancel the previous one.
        if (this.cancelCb) {
            // Allow the callback to cancel loading.
            this.cancelCb(this);
        }
        this.loadingSince = 0;
    }

    if (!this.glTexture && !this.isLoading()) {
        var self = this;
        this.loadingSince = (new Date()).getTime();
        this.loadCb(function(err, source, options) {
            if (self.manager.stage.destroyed) {
                // Ignore async load when stage is destroyed.
                return;
            }
            self.loadingSince = 0;
            if (err) {
                // Emit txError.
                self.onError(err);
            } else if (source) {
                self.setSource(source, options);
            }
        }, this, !!sync);
    }
};

TextureSource.prototype.isLoading = function() {
    return this.loadingSince > 0;
};

TextureSource.prototype.setSource = function(source, options) {
    this.w = source.width || (options && options.w) || 0;
    this.h = source.height || (options && options.h) || 0;

    if (this.w > 2048 || this.h > 2048) {
        console.error('Texture size too large: ' + source.width + 'x' + source.height + ' (max allowed is 2048x2048)');
        return;
    }

    if (options && options.renderInfo) {
        // Assign to id in cache so that it can be reused.
        this.renderInfo = options.renderInfo;
    }

    var format = {
        premultiplyAlpha: true,
        flipBlueRed: false
    };

    if (options && options.hasOwnProperty('premultiplyAlpha')) {
        format.premultiplyAlpha = options.premultiplyAlpha;
    }

    if (options && options.hasOwnProperty('flipBlueRed')) {
        format.flipBlueRed = options.flipBlueRed;
    }

    this.manager.uploadTextureSource(this, source, format);

    this.onLoad();
};

TextureSource.prototype.isVisible = function() {
    return (this.components.size > 0);
};

TextureSource.prototype.onLoad = function() {
    if (this.isVisible() && this.stage.useTextureAtlas) {
        this.stage.textureAtlas.addActiveTextureSource(this);
    }

    this.components.forEach(function(component) {
        component.onTextureSourceLoaded();
    });

    if (this.onload) this.onload();
    this.onload = null;
};

TextureSource.prototype.onError = function(e) {
    console.error('texture load error', e, this.id);
    this.components.forEach(function(component) {
        component.onTextureSourceLoadError(e);
    });
};

TextureSource.prototype.onAddedToTextureAtlas = function(x, y) {
    this.inTextureAtlas = true;
    this.textureAtlasX = x;
    this.textureAtlasY = y;

    this.components.forEach(function(component) {
        component.onTextureSourceAddedToTextureAtlas();
    });
};

TextureSource.prototype.onRemovedFromTextureAtlas = function() {
    this.inTextureAtlas = false;
    this.components.forEach(function(component) {
        component.onTextureSourceRemovedFromTextureAtlas();
    });
};

TextureSource.prototype.free = function() {
    this.manager.freeTextureSource(this);
};

TextureSource.id = 0;

if (isNode) {
    module.exports = TextureSource;
}