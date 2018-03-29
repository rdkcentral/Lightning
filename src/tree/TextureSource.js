/**
 * Copyright Metrological, 2017
 */

class TextureSource {

    constructor(manager, loader = undefined) {
        this.id = TextureSource.id++;

        this.manager = manager;
        
        this.stage = manager.stage;

        /**
         * All enabled textures (textures that are used by visible views).
         * @type {Set<Texture>}
         */
        this.textures = new Set()

        /**
         * The factory for the source of this texture.
         * @type {Function}
         */
        this.loader = loader;

        /**
         * Identifier for reuse.
         * @type {String}
         */
        this.lookupId = null;

        /**
         * If set, this.is called when the texture source is no longer displayed (this.components.size becomes 0).
         * @type {Function}
         */
        this._cancelCb = null;

        /**
         * Loading since timestamp in millis.
         * @type {number}
         */
        this.loadingSince = 0;

        this.w = 0;
        this.h = 0;

        this.glTexture = null;

        /**
         * If true, then this.texture source is never freed from memory during garbage collection.
         * @type {boolean}
         */
        this.permanent = false;

        /**
         * Sub-object with texture-specific rendering information.
         * For images, contains the src property, for texts, contains handy rendering information.
         * @type {Object}
         */
        this.renderInfo = null;

        /**
         * Generated for 'renderToTexture'.
         * @type {boolean}
         * @private
         */
        this._isResultTexture = !this.loader;

    }

    addTexture(v) {
        if (!this.textures.has(v)) {
            this.textures.add(v);

            if (this.textures.size === 1) {
                this.becomesUsed()
            }
        }
    }

    removeTexture(v) {
        if (this.textures.delete(v)) {
            if (this.textures.size === 0) {
                this.becomesUnused()
            }
        }
    }

    get isResultTexture() {
        return this._isResultTexture
    }

    set isResultTexture(v) {
        this._isResultTexture = v
    }

    forEachView(cb) {
        this.textures.forEach(texture => {
            texture.views.forEach(cb)
        })
    }

    getRenderWidth() {
        return this.w;
    }

    getRenderHeight() {
        return this.h;
    }

    allowCleanup() {
        return !this.permanent && (!this.isUsed())
    }

    becomesUsed() {
        if (this.lookupId) {
            if (!this.manager.textureSourceHashmap.has(this.lookupId)) {
                this.manager.textureSourceHashmap.set(this.lookupId, this);
            }
        }

        this.load();
    }

    becomesUnused() {
        if (this.isLoading()) {
            if (this._cancelCb) {
                this._cancelCb(this);
            }
        }
    }

    isLoaded() {
        return !!this.glTexture;
    }

    isLoading() {
        return this.loadingSince > 0;
    }

    reload() {
        this.free()
        if (this.isUsed()) {
            this.load()
        }
    }

    load() {
        if (this.isResultTexture) {
            // Core texture source (View resultGlTexture), for which the loading is managed by the core.
            return;
        }

        if (!this.glTexture && !this.isLoading()) {
            this.loadingSince = (new Date()).getTime();
            this._cancelCb = this.loader((err, options) => {
                // Clear callback to avoid memory leaks.
                this._cancelCb = undefined

                if (this.manager.stage.destroyed) {
                    // Ignore async load when stage is destroyed.
                    return;
                }
                this.loadingSince = 0;
                if (err) {
                    // Emit txError.
                    this.onError(err);
                } else if (options && options.source) {
                    this.setSource(options);
                }
            }, this);
        }
    }

    onError(e) {
        console.error('texture load error', e, this.id);
        this.forEachView(function(view) {
            view.onTextureSourceLoadError(e);
        });
    }

    setSource(options) {
        const source = options.source

        this.w = source.width || (options && options.w) || 0;
        this.h = source.height || (options && options.h) || 0;

        if (options && options.renderInfo) {
            // Assign to id in cache so that it can be reused.
            this.renderInfo = options.renderInfo;
        }

        if (!Utils.isNode && source instanceof WebGLTexture) {
            // Texture managed by caller.
            this.glTexture = source;

            // Used by CoreRenderState for optimizations.
            source.w = this.w
            source.h = this.h
        } else {
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
        }

        this.onLoad();
    }

    isUsed() {
        return (this.textures.length);
    }

    onLoad() {
        this.forEachView(function(view) {
            view.onTextureSourceLoaded();
        });
    }

    forceRenderUpdate() {
        // Call this method after manually changing updating the glTexture.
        this.forEachView(function(view) {
            view.forceRenderUpdate();
        });
    }

    /**
     * Used for result textures.
     */
    replaceGlTexture(glTexture, w, h) {
        let prevGlTexture = this.glTexture;
        // Loaded by core.
        this.glTexture = glTexture;
        this.w = w;
        this.h = h;

        if (!prevGlTexture && this.glTexture) {
            this.forEachView(view => view.onTextureSourceLoaded())
        }

        if (!this.glTexture) {
            this.forEachView(view => view._setDisplayedTexture(null))
        }

        this.forEachView(view => view._updateDimensions());
    }

    onError(e) {
        console.error('texture load error', e, this.id);
        this.forEachView(view => view.onTextureSourceLoadError(e))
    }

    free() {
        this.manager.freeTextureSource(this);
    }

}

TextureSource.prototype.isTextureSource = true

TextureSource.id = 1;

module.exports = TextureSource;

const Utils = require('./Utils')
