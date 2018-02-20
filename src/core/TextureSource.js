/**
 * Copyright Metrological, 2017
 */

class TextureSource {

    constructor(manager, loadCb) {
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
         * All enabled views that are using this texture source via a texture (either as texture or displayedTexture, or both).
         * @type {Set<View>}
         */
        this.views = new Set();

        /**
         * The number of enabled views that are 'within bounds'.
         * @type {number}
         */
        this._withinBoundsCount = 0

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

        /**
         * Maximum width (used for determining when view that has texture is within bounds)
         * We use the maximum texture size initially.
         */
        this._mw = 2048

        /**
         * Maximum height
         */
        this._mh = 2048

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

    }

    get mw() {
        return this._mw
    }

    set mw(v) {
        // In case multiple views set a mw, mh, we use the value which minimizes the chance of a load.
        const prev = this._mw
        this._mw = Math.min(this._mw, v)
        if (prev !== this._mw) {
            this.views.forEach((view) => {
                view._updateDimensions()
            })
        }
    }

    get mh() {
        return this._mh
    }

    set mh(v) {
        const prev = this._mh
        this._mh = Math.min(this._mh, v)
        if (prev !== this._mh) {
            this.views.forEach((view) => {
                view._updateDimensions()
            })
        }
    }

    getRenderWidth() {
        // If dimensions are unknown (texture not yet loaded), use maximum width as a fallback as render width to allow proper bounds checking.
        return this.w || this._mw;
    }

    getRenderHeight() {
        return this.h || this._mh;
    }

    isLoadedByCore() {
        return !this.loadCb;
    }

    addView(v) {
        if (!this.views.has(v)) {
            this.views.add(v);

            if (v.withinBoundsMargin) {
                this.incWithinBoundsCount()
            }
        }
    }
    
    removeView(v) {
        if (this.views.delete(v)) {
            if (v.withinBoundsMargin) {
                this.decWithinBoundsCount()
            }
        }
    }

    incWithinBoundsCount() {
        this._withinBoundsCount++

        if (this._withinBoundsCount === 1) {
            if (this.lookupId) {
                if (!this.manager.textureSourceHashmap.has(this.lookupId)) {
                    this.manager.textureSourceHashmap.set(this.lookupId, this);
                }
            }

            this.becomesVisible();
        }
    }

    decWithinBoundsCount() {
        this._withinBoundsCount--

        if (!this._withinBoundsCount) {
            this.becomesInvisible();
        }
    }

    allowCleanup() {
        return !this.permanent && (this._withinBoundsCount === 0)
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

    reload(sync) {
        this.free()
        if (this.views.size) {
            this.load(sync)
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

    isVisible() {
        return (this.views.size > 0);
    }

    onLoad() {
        this.views.forEach(function(view) {
            view.onTextureSourceLoaded();
        });
    }

    forceRenderUpdate() {
        // Call this method after manually changing updating the glTexture.
        this.views.forEach(view => {
            view.forceRenderUpdate()
        })
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
            this.views.forEach(view => {view._setDisplayedTexture(null)});
        }

        this.views.forEach(view => view._updateDimensions());
    }

    onError(e) {
        console.error('texture load error', e, this.id);
        this.views.forEach(function(view) {
            view.onTextureSourceLoadError(e);
        });
    }

    free() {
        this.manager.freeTextureSource(this);
    }
}

TextureSource.id = 1;

module.exports = TextureSource;

const Utils = require('./Utils')
