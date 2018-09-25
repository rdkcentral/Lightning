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

        /**
         * Contains the load error, if the texture source could previously not be loaded.
         * @type {object}
         * @private
         */
        this._loadError = undefined

    }

    get loadError() {
        return this._loadError
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

    forEachEnabledView(cb) {
        this.textures.forEach(texture => {
            texture.views.forEach(cb)
        })
    }

    forEachActiveView(cb) {
        this.textures.forEach(texture => {
            texture.views.forEach(view => {
                if (view.active) {
                    cb(view)
                }
            })
        })
    }

    getRenderWidth() {
        return this.w;
    }

    getRenderHeight() {
        return this.h;
    }

    allowCleanup() {
        return !this.permanent && (!this.isUsed()) && !this.isResultTexture
    }

    becomesUsed() {
        if (this.lookupId) {
            if (!this.manager.textureSourceHashmap.has(this.lookupId)) {
                this.manager.textureSourceHashmap.set(this.lookupId, this);
            }
        }

        if (!this.isLoaded()) {
            this.load();
        }
    }

    becomesUnused() {
        if (this.isLoading()) {
            if (this._cancelCb) {
                this._cancelCb(this);

                this.loadingSince = 0;
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
                if (err) {
                    // Emit txError.
                    this.onError(err);
                } else if (options && options.source) {
                    this.loadingSince = 0;
                    this.setSource(options);
                }
            }, this);
        }
    }

    setSource(options) {
        const source = options.source

        this.w = source.width || (options && options.w) || 0;
        this.h = source.height || (options && options.h) || 0;

        if (options && options.renderInfo) {
            // Assign to id in cache so that it can be reused.
            this.renderInfo = options.renderInfo;
        }

        this.permanent = !!options.permanent

        if ((Utils.isNode ? source.constructor.name === "WebGLTexture" : source instanceof WebGLTexture)) {
            // Texture managed by caller.
            this.glTexture = source;

            // Used by CoreRenderState for optimizations.
            this.w = source.w
            this.h = source.h

            // WebGLTexture objects are by default
            this.permanent = options.hasOwnProperty('permanent') ? options.permanent : true
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

            format.texParams = options.texParams || {}
            format.texOptions = options.texOptions || {}

            this.manager.uploadTextureSource(this, source, format);
        }

        // Must be cleared when reload is succesful.
        this._loadError = undefined

        this.onLoad();
    }

    isUsed() {
        return (this.textures.size > 0);
    }

    onLoad() {
        if (this.isUsed()) {
            this.forEachActiveView(function(view) {
                view.onTextureSourceLoaded();
            });
        }
    }
    
    forceRenderUpdate() {
        // Userland should call this method after changing the glTexture manually outside of the framework
        //  (using tex[Sub]Image2d for example).

        if (this.glTexture) {
            // Change 'update' flag. This is currently not used by the framework but is handy in userland.
            this.glTexture.update = this.stage.frameCounter
        }

        this.forEachActiveView(function(view) {
            view.forceRenderUpdate();
        });

    }

    forceUpdateRenderCoords() {
        this.forEachActiveView(function(view) {
            view._updateTextureCoords()
        })
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
            this.forEachActiveView(view => view.onTextureSourceLoaded())
        }

        if (!this.glTexture) {
            this.forEachActiveView(view => view._setDisplayedTexture(null))
        }

        // Dimensions must be updated also on enabled views, as it may force it to go within bounds.
        this.forEachEnabledView(view => view._updateDimensions());

        // Notice that the sprite map must never contain render textures.
    }

    onError(e) {
        this._loadError = e
        console.error('texture load error', e, this.lookupId);
        this.forEachActiveView(view => view.onTextureSourceLoadError(e))
    }

    free() {
        this.manager.freeTextureSource(this);
    }

}

TextureSource.prototype.isTextureSource = true

TextureSource.id = 1;

module.exports = TextureSource;

const Utils = require('./Utils')
