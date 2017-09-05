/**
 * Copyright Metrological, 2017
 */

let Base = require('./Base')

class TextureSource extends Base {

    constructor(manager, loadCb) {
        super()

        this.id = TextureSource.id++;

        this.manager = manager;
        
        this.stage = manager.stage;

        this.id = TextureSource.id++;

        /**
         * The factory for the source of this texture.
         * @type {Function}
         */
        this.loadCb = loadCb;

        /**
         * All active views that are using this texture source via a texture (either as texture or displayedTexture, or both).
         * @type {Set<View>}
         */
        this.views = new Set();

    }

    _properties() {
        
        /**
         * Identifier for reuse.
         * @type {String}
         */
        this.lookupId = null;

        /**
         * If set, this.is called when the texture source is no longer displayed (this.components.size becomes 0).
         * @type {Function}
         */
        this.cancelCb = null;

        /**
         * Loading since timestamp in millis.
         * @type {number}
         */
        this.loadingSince = 0;

        /**
         * Flag that indicates if this.texture source was stored in the texture atlas.
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

        this.w = 0;
        this.h = 0;

        this.glTexture = null;

        /**
         * If true, then this.texture source is never freed from memory during garbage collection.
         * @type {boolean}
         */
        this.permanent = false;

        /**
         * If this texture source should ever be added to the texture atlas.
         * @type {boolean}
         */
        this.noTextureAtlas = false;

        /**
         * Sub-object with texture-specific rendering information.
         * For images, contains the src property, for texts, contains handy rendering information.
         * @type {Object}
         */
        this.renderInfo = null;        
    }
    
    getRenderWidth() {
        return this.w;
    }

    getRenderHeight() {
        return this.h;
    }

    isLoadedByCore() {
        return !this.loadCb;
    }

    addView(v) {
        if (!this.views.has(v)) {
            this.views.add(v);

            if (this.glTexture) {
                // If not yet loaded, wait until it is loaded until adding it to the texture atlas.
                if (this.stage.textureAtlas && !this.noTextureAtlas) {
                    this.stage.textureAtlas.addActiveTextureSource(this);
                }
            }

            if (this.views.size === 1) {
                if (this.lookupId) {
                    if (!this.manager.textureSourceHashmap.has(this.lookupId)) {
                        this.manager.textureSourceHashmap.set(this.lookupId, this);
                    }
                }

                this.becomesVisible();
            }
        }        
    }
    
    removeView(v) {
        if (this.views.delete(v)) {
            if (!this.views.size) {
                if (this.stage.textureAtlas) {
                    this.stage.textureAtlas.removeActiveTextureSource(this);
                }

                this.becomesInvisible();
            }
        }        
    }

    becomesVisible() {
        this.load(false);
    }

    becomesInvisible() {
        if (this.isLoading()) {
            if (this.cancelCb) {
                this.cancelCb(this);
            }
        }
    }

    load(sync) {
        if (this.isLoadedByCore()) {
            // Core texture source (View resultGlTexture), for which the loading is managed by the core.
            return;
        }

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
    }

    isLoading() {
        return this.loadingSince > 0;
    }

    setSource(source, options) {
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
            hasAlpha: true
        };

        if (options && options.hasOwnProperty('premultiplyAlpha')) {
            format.premultiplyAlpha = options.premultiplyAlpha;
        }

        if (options && options.hasOwnProperty('flipBlueRed')) {
            format.flipBlueRed = options.flipBlueRed;
        }

        if (options && options.hasOwnProperty('hasAlpha')) {
            format.hasAlpha = options.hasAlpha;
        }

        if (!format.hasAlpha) {
            format.premultiplyAlpha = false;
        }

        this.manager.uploadTextureSource(this, source, format);

        this.onLoad();
    }

    isVisible() {
        return (this.views.size > 0);
    }

    onLoad() {
        if (this.isVisible() && this.stage.textureAtlas && !this.noTextureAtlas) {
            this.stage.textureAtlas.addActiveTextureSource(this);
        }

        this.views.forEach(function(view) {
            view.onTextureSourceLoaded();
        });
    }

    _changeGlTexture(glTexture, w, h) {
        let prevGlTexture = this.glTexture;
        // Loaded by core.
        this.glTexture = glTexture;
        this.w = w;
        this.h = h;

        if (!prevGlTexture && this.glTexture) {
            this.views.forEach(view => view.onTextureSourceLoaded());
        }

        if (!this.glTexture) {
            this.views.forEach(view => {view.displayedTexture = null});
        }

        this.views.forEach(view => view._updateDimensions());
    }

    onError(e) {
        console.error('texture load error', e, this.id);
        this.views.forEach(function(view) {
            view.onTextureSourceLoadError(e);
        });
    }

    onAddedToTextureAtlas(x, y) {
        this.inTextureAtlas = true;
        this.textureAtlasX = x;
        this.textureAtlasY = y;

        this.views.forEach(function(view) {
            view.onTextureSourceAddedToTextureAtlas();
        });
    }

    onRemovedFromTextureAtlas() {
        this.inTextureAtlas = false;
        this.views.forEach(function(view) {
            view.onTextureSourceRemovedFromTextureAtlas();
        });
    }

    free() {
        this.manager.freeTextureSource(this);
    }
}

TextureSource.id = 1;

module.exports = TextureSource;
