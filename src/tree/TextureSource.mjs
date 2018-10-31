export default class TextureSource {

    constructor(manager, loader = undefined) {
        this.id = TextureSource.id++;

        this.manager = manager;

        this.stage = manager.stage;

        /**
         * All enabled textures (textures that are used by visible views).
         * @type {Set<Texture>}
         */
        this.textures = new Set();

        /**
         * The number of active textures (textures that have at least one active view).
         * @type {number}
         * @private
         */
        this._activeTextureCount = 0;

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

        this._nativeTexture = null;

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
        this._loadError = undefined;

    }

    get loadError() {
        return this._loadError;
    }

    addTexture(v) {
        if (!this.textures.has(v)) {
            this.textures.add(v);
        }
    }

    removeTexture(v) {
        this.textures.delete(v);
    }

    incActiveTextureCount() {
        this._activeTextureCount++;
        if (this._activeTextureCount === 1) {
            this.becomesUsed();
        }
    }

    decActiveTextureCount() {
        this._activeTextureCount--;
        if (this._activeTextureCount === 0) {
            this.becomesUnused();
        }
    }

    get isResultTexture() {
        return this._isResultTexture;
    }

    set isResultTexture(v) {
        this._isResultTexture = v;
    }

    forEachEnabledView(cb) {
        this.textures.forEach(texture => {
            texture.views.forEach(cb);
        });
    }

    hasEnabledViews() {
        return this.textures.size > 0;
    }

    forEachActiveView(cb) {
        this.textures.forEach(texture => {
            texture.views.forEach(view => {
                if (view.active) {
                    cb(view);
                }
            });
        });
    }

    getRenderWidth() {
        return this.w;
    }

    getRenderHeight() {
        return this.h;
    }

    allowCleanup() {
        return !this.permanent && !this.isUsed();
    }

    becomesUsed() {
        // Even while the texture is being loaded, make sure it is on the lookup map so that others can reuse it.
        this.load();
    }

    becomesUnused() {
        this.cancel();
    }

    cancel() {
        if (this.isLoading()) {
            if (this._cancelCb) {
                this._cancelCb(this);

                this.loadingSince = 0;
            }
        }

        this._checkRemoveFromLookupMap();
    }

    _checkRemoveFromLookupMap() {
        if (!this.permanent && (this.textures.size === 0)) {
            // Normally, texture sources are removed automatically upon the next garbage collection.
            // In case of manually loading textures, that are not yet uploaded to the gpu, we need to make sure to remove
            // them manually in case of cancel or error.
            this.manager.removeFromLookupMap(this);
        }
    }

    isLoaded() {
        return !!this._nativeTexture;
    }

    isLoading() {
        return this.loadingSince > 0;
    }

    isError() {
        return !!this._loadError;
    }

    reload() {
        this.free();
        if (this.isUsed()) {
            this.load();
        }
    }

    load() {
        // From the moment of loading (when a texture source becomes used by active views)
        if (this.isResultTexture) {
            // View result texture source, for which the loading is managed by the core.
            return;
        }

        if (!this._nativeTexture && !this.isLoading()) {
            this.loadingSince = (new Date()).getTime();
            this._cancelCb = this.loader((err, options) => {
                // Clear callback to avoid memory leaks.
                this._cancelCb = undefined;

                if (this.manager.stage.destroyed) {
                    // Ignore async load when stage is destroyed.
                    return;
                }
                if (err) {
                    // Emit txError.
                    this._checkRemoveFromLookupMap();
                    this.onError(err);
                } else if (options && options.source) {
                    this.loadingSince = 0;
                    this.setSource(options);
                }
            }, this);
        }
    }

    setSource(options) {
        const source = options.source;

        this.w = source.width || (options && options.w) || 0;
        this.h = source.height || (options && options.h) || 0;

        if (options && options.renderInfo) {
            // Assign to id in cache so that it can be reused.
            this.renderInfo = options.renderInfo;
        }

        this.permanent = !!options.permanent;

        if (this._isNativeTexture(source)) {
            // Texture managed by caller.
            this._nativeTexture = source;

            // Used by CoreRenderState for optimizations.
            this.w = source.w;
            this.h = source.h;

            // WebGLTexture objects are by default;
            this.permanent = options.hasOwnProperty('permanent') ? options.permanent : true;
        } else {
            this.manager.uploadTextureSource(this, options);
        }

        // Must be cleared when reload is succesful.
        this._loadError = undefined;

        this.onLoad();
    }

    isUsed() {
        return this._activeTextureCount > 0;
    }

    onLoad() {
        if (this.isUsed()) {
            this.forEachActiveView(function (view) {
                view.onTextureSourceLoaded();
            });
        }
    }

    forceRenderUpdate() {
        // Userland should call this method after changing the nativeTexture manually outside of the framework
        //  (using tex[Sub]Image2d for example).

        if (this._nativeTexture) {
            // Change 'update' flag. This is currently not used by the framework but is handy in userland.
            this._nativeTexture.update = this.stage.frameCounter;
        }

        this.forEachActiveView(function (view) {
            view.forceRenderUpdate();
        });

    }

    forceUpdateRenderCoords() {
        this.forEachActiveView(function (view) {
            view._updateTextureCoords();
        });
    }

    get nativeTexture() {
        return this._nativeTexture;
    }

    clearNativeTexture() {
        this._nativeTexture = null;
    }

    /**
     * Used for result textures.
     */
    replaceNativeTexture(newNativeTexture, w, h) {
        let prevNativeTexture = this._nativeTexture;
        // Loaded by core.
        this._nativeTexture = newNativeTexture;
        this.w = w;
        this.h = h;

        if (!prevNativeTexture && this._nativeTexture) {
            this.forEachActiveView(view => view.onTextureSourceLoaded());
        }

        if (!this._nativeTexture) {
            this.forEachActiveView(view => view._setDisplayedTexture(null));
        }

        // Dimensions must be updated also on enabled views, as it may force it to go within bounds.
        this.forEachEnabledView(view => view._updateDimensions());

        // Notice that the sprite map must never contain render textures.
    }

    onError(e) {
        this._loadError = e;
        console.error('texture load error', e, this.lookupId);
        this.forEachActiveView(view => view.onTextureSourceLoadError(e));
    }

    free() {
        this.manager.freeTextureSource(this);
    }

    _isNativeTexture(source) {
        return ((Utils.isNode ? source.constructor.name === "WebGLTexture" : source instanceof WebGLTexture));
    }

}

TextureSource.prototype.isTextureSource = true;

TextureSource.id = 1;

import Utils from "./Utils.mjs";
