export default class Texture {

    /**
     * @param {Stage} stage
     */
    constructor(stage) {
        this.stage = stage;

        this.manager = this.stage.textureManager;

        this.id = Texture.id++;

        /**
         * All enabled elements that use this texture object (either as texture or displayedTexture).
         * @type {Set<Element>}
         */
        this.elements = new Set();

        /**
         * The number of enabled elements that are active.
         * @type {number}
         */
        this._activeCount = 0;

        /**
         * The associated texture source.
         * Should not be changed.
         * @type {TextureSource}
         */
        this._source = null;

        /**
         * A resize mode can be set to cover or contain a certain area.
         * It will reset the texture clipping settings.
         * When manual texture clipping is performed, the resizeMode is reset.
         * @type {{type: string, width: number, height: number}}
         * @private
         */
        this._resizeMode = null;

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
         * Render precision (0.5 = fuzzy, 1 = normal, 2 = sharp even when scaled twice, etc.).
         * @type {number}
         * @private
         */
        this._precision = 1;

        /**
         * The (maximum) expected texture source width. Used for within bounds determination while texture is not yet loaded.
         * If not set, 2048 is used by ElementCore.update.
         * @type {number}
         */
        this.mw = 0;

        /**
         * The (maximum) expected texture source height. Used for within bounds determination while texture is not yet loaded.
         * If not set, 2048 is used by ElementCore.update.
         * @type {number}
         */
        this.mh = 0;

        /**
         * Indicates if Texture.prototype.texture uses clipping.
         * @type {boolean}
         */
        this.clipping = false;

        /**
         * Indicates whether this texture must update (when it becomes used again).
         * @type {boolean}
         * @private
         */
        this._mustUpdate = true;

    }

    get source() {
        if (this._mustUpdate || this.stage.hasUpdateSourceTexture(this)) {
            this._performUpdateSource(true);
            this.stage.removeUpdateSourceTexture(this);
        }
        return this._source;
    }

    addElement(v) {
        if (!this.elements.has(v)) {
            this.elements.add(v);

            if (this.elements.size === 1) {
                if (this._source) {
                    this._source.addTexture(this);
                }
            }

            if (v.active) {
                this.incActiveCount();
            }
        }
    }

    removeElement(v) {
        if (this.elements.delete(v)) {
            if (this.elements.size === 0) {
                if (this._source) {
                    this._source.removeTexture(this);
                }
            }

            if (v.active) {
                this.decActiveCount();
            }
        }
    }

    incActiveCount() {
        // Ensure that texture source's activeCount has transferred ownership.
        const source = this.source;

        if (source) {
            this._checkForNewerReusableTextureSource();
        }

        this._activeCount++;
        if (this._activeCount === 1) {
            this.becomesUsed();
        }
    }

    decActiveCount() {
        const source = this.source; // Force updating the source.
        this._activeCount--;
        if (!this._activeCount) {
            this.becomesUnused();
        }
    }

    becomesUsed() {
        if (this.source) {
            this.source.incActiveTextureCount();
        }
    }

    onLoad() {
        if (this._resizeMode) {
            this._applyResizeMode();
        }

        this.elements.forEach(element => {
            if (element.active) {
                element.onTextureSourceLoaded();
            }
        });
    }

    _checkForNewerReusableTextureSource() {
        // When this source became unused and cleaned up, it may have disappeared from the reusable texture map.
        // In the meantime another texture may have been generated loaded with the same lookup id.
        // If this is the case, use that one instead to make sure only one active texture source per lookup id exists.
        const source = this.source;
        if (!source.isLoaded()) {
            const reusable = this._getReusableTextureSource();
            if (reusable && reusable.isLoaded() && (reusable !== source)) {
                this._replaceTextureSource(reusable);
            }
        } else {
            if (this._resizeMode) {
                this._applyResizeMode();
            }
        }
    }

    becomesUnused() {
        if (this.source) {
            this.source.decActiveTextureCount();
        }
    }

    isUsed() {
        return this._activeCount > 0;
    }

    /**
     * Returns the lookup id for the current texture settings, to be able to reuse it.
     * @returns {string|null}
     */
    _getLookupId() {
        // Default: do not reuse texture.
        return null;
    }

    /**
     * Generates a loader function that is able to generate the texture for the current settings of this texture.
     * It should return a function that receives a single callback argument.
     * That callback should be called with the following arguments:
     *   - err
     *   - options: object
     *     - source: ArrayBuffer|WebGlTexture|ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|ImageBitmap
     *     - w: Number
     *     - h: Number
     *     - permanent: Boolean
     *     - hasAlpha: boolean
     *     - permultiplyAlpha: boolean
     *     - flipBlueRed: boolean
     *     - renderInfo: object
     * The loader itself may return a Function that is called when loading of the texture is cancelled. This can be used
     * to stop fetching an image when it is no longer in element, for example.
     */
    _getSourceLoader() {
        throw new Error("Texture.generate must be implemented.");
    }

    get isValid() {
        return this._getIsValid();
    }

    /**
     * If texture is not 'valid', no source can be created for it.
     * @returns {boolean}
     */
    _getIsValid() {
        return true;
    }

    /**
     * This must be called when the texture source must be re-generated.
     */
    _changed() {
        // If no element is actively using this texture, ignore it altogether.
        if (this.isUsed()) {
            this._updateSource();
        } else {
            this._mustUpdate = true;
        }
    }

    _updateSource() {
        // We delay all updateSource calls to the next drawFrame, so that we can bundle them.
        // Otherwise we may reload a texture more often than necessary, when, for example, patching multiple text
        // properties.
        this.stage.addUpdateSourceTexture(this);
    }

    _performUpdateSource(force = false) {
        // If, in the meantime, the texture was no longer used, just remember that it must update until it becomes used
        // again.
        if (force || this.isUsed()) {
            this._mustUpdate = false;
            let source = this._getTextureSource();
            this._replaceTextureSource(source);
        }
    }

    _getTextureSource() {
        let source = null;
        if (this._getIsValid()) {
            const lookupId = this._getLookupId();
            source = this._getReusableTextureSource(lookupId);
            if (!source) {
                source = this.manager.getTextureSource(this._getSourceLoader(), lookupId);
            }
        }
        return source;
    }

    _getReusableTextureSource(lookupId = this._getLookupId()) {
        if (this._getIsValid()) {
            if (lookupId) {
                return this.manager.getReusableTextureSource(lookupId);
            }
        }
        return null;
    }

    _replaceTextureSource(newSource = null) {
        let oldSource = this._source;

        this._source = newSource;

        if (this.elements.size) {
            if (oldSource) {
                if (this._activeCount) {
                    oldSource.decActiveTextureCount();
                }

                oldSource.removeTexture(this);
            }

            if (newSource) {
                // Must happen before setDisplayedTexture to ensure sprite map texcoords are used.
                newSource.addTexture(this);
                if (this._activeCount) {
                    newSource.incActiveTextureCount();
                }
            }
        }

        if (this.isUsed()) {
            if (newSource) {
                if (newSource.isLoaded()) {

                    // Apply resizeMode
                    if (this._resizeMode) {
                        this._applyResizeMode();
                    }

                    this.elements.forEach(element => {
                        if (element.active) {
                            element._setDisplayedTexture(this);
                        }
                    });
                } else {
                    const loadError = newSource.loadError;
                    if (loadError) {
                        this.elements.forEach(element => {
                            if (element.active) {
                                element.onTextureSourceLoadError(loadError);
                            }
                        });
                    }
                }
            } else {
                this.elements.forEach(element => {
                    if (element.active) {
                        element._setDisplayedTexture(null);
                    }
                });
            }
        }
    }

    load() {
        // Make sure that source is up to date.
        if (this.source) {
            if (!this.isLoaded()) {
                this.source.load(true);
            }
        }
    }

    isLoaded() {
        return this._source && this._source.isLoaded();
    }

    get loadError() {
        return this._source && this._source.loadError;
    }

    free() {
        if (this._source) {
            this._source.free();
        }
    }

    set resizeMode({type = "cover", w = 0, h = 0, clipX = 0.5, clipY = 0.5}) {
        this._resizeMode = {type, w, h, clipX, clipY};
        if (this.isLoaded()) {
            this._applyResizeMode();
        }
    }

    get resizeMode() {
        return this._resizeMode;
    }

    _clearResizeMode() {
        this._resizeMode = null;
    }

    _applyResizeMode() {
        if (this._resizeMode.type === "cover") {
            this._applyResizeCover();
        } else if (this._resizeMode.type === "contain") {
            this._applyResizeContain();
        }
        this._updatePrecision();
        this._updateClipping();
    }

    _applyResizeCover() {
        const scaleX = this._resizeMode.w / this._source.w;
        const scaleY = this._resizeMode.h / this._source.h;
        let scale = Math.max(scaleX, scaleY);
        if (!scale) return;
        this._precision = 1/scale;
        if (scaleX && scaleX < scale) {
            const desiredSize = this._precision * this._resizeMode.w;
            const choppedOffPixels = this._source.w - desiredSize;
            this._x = choppedOffPixels * this._resizeMode.clipX;
            this._w = this._source.w - choppedOffPixels;
        }
        if (scaleY && scaleY < scale) {
            const desiredSize = this._precision * this._resizeMode.h;
            const choppedOffPixels = this._source.h - desiredSize;
            this._y = choppedOffPixels * this._resizeMode.clipY;
            this._h = this._source.h - choppedOffPixels;
        }
    }

    _applyResizeContain() {
        const scaleX = this._resizeMode.w / this._source.w;
        const scaleY = this._resizeMode.h / this._source.h;
        let scale = scaleX;
        if (!scale || scaleY < scale) {
            scale = scaleY;
        }
        if (!scale) return;
        this._precision = 1/scale;
    }

    enableClipping(x, y, w, h) {
        this._clearResizeMode();

        x *= this._precision;
        y *= this._precision;
        w *= this._precision;
        h *= this._precision;
        if (this._x !== x || this._y !== y || this._w !== w || this._h !== h) {
            this._x = x;
            this._y = y;
            this._w = w;
            this._h = h;

            this._updateClipping(true);
        }
    }

    disableClipping() {
        this._clearResizeMode();

        if (this._x || this._y || this._w || this._h) {
            this._x = 0;
            this._y = 0;
            this._w = 0;
            this._h = 0;

            this._updateClipping();
        }
    }

    _updateClipping() {
        this.clipping = !!(this._x || this._y || this._w || this._h);

        let self = this;
        this.elements.forEach(function(element) {
            // Ignore if not the currently displayed texture.
            if (element.displayedTexture === self) {
                element.onDisplayedTextureClippingChanged();
            }
        });
    }

    _updatePrecision() {
        let self = this;
        this.elements.forEach(function(element) {
            // Ignore if not the currently displayed texture.
            if (element.displayedTexture === self) {
                element.onPrecisionChanged();
            }
        });
    }

    getNonDefaults() {
        let nonDefaults = {};
        nonDefaults['type'] = this.constructor.name;
        if (this.x !== 0) nonDefaults['x'] = this.x;
        if (this.y !== 0) nonDefaults['y'] = this.y;
        if (this.w !== 0) nonDefaults['w'] = this.w;
        if (this.h !== 0) nonDefaults['h'] = this.h;
        if (this.precision !== 1) nonDefaults['precision'] = this.precision;
        return nonDefaults;
    }

    get px() {
        return this._x;
    }

    get py() {
        return this._y;
    }

    get pw() {
        return this._w;
    }

    get ph() {
        return this._h;
    }

    get x() {
        return this._x / this._precision;
    }
    set x(v) {
        this._clearResizeMode();
        v = v * this._precision;
        if (this._x !== v) {
            this._x = v;
            this._updateClipping();
        }
    }

    get y() {
        return this._y / this._precision;
    }
    set y(v) {
        this._clearResizeMode();
        v = v * this._precision;
        if (this._y !== v) {
            this._y = v;
            this._updateClipping();
        }
    }

    get w() {
        return this._w / this._precision;
    }

    set w(v) {
        this._clearResizeMode();
        v = v * this._precision;
        if (this._w !== v) {
            this._w = v;
            this._updateClipping();
        }
    }

    get h() {
        return this._h / this._precision;
    }

    set h(v) {
        this._clearResizeMode();
        v = v * this._precision;
        if (this._h !== v) {
            this._h = v;
            this._updateClipping();
        }
    }

    get precision() {
        return this._precision;
    }

    set precision(v) {
        this._clearResizeMode();
        if (this._precision !== v) {
            this._precision = v;
            this._updatePrecision();
        }
    }

    isAutosizeTexture() {
        return true;
    }

    getRenderWidth() {
        if (!this.isAutosizeTexture()) {
            // In case of the rectangle texture, we'd prefer to not cause a 1x1 w,h as it would interfere with flex layout fit-to-contents.
            return 0;
        }

        // If dimensions are unknown (texture not yet loaded), use maximum width as a fallback as render width to allow proper bounds checking.
        return (this._w || (this._source ? this._source.getRenderWidth() - this._x : 0)) / this._precision;
    }

    getRenderHeight() {
        if (!this.isAutosizeTexture()) {
            // In case of the rectangle texture, we'd prefer to not cause a 1x1 w,h as it would interfere with flex layout fit-to-contents.
            return 0;
        }

        return (this._h || (this._source ? this._source.getRenderHeight() - this._y : 0)) / this._precision;
    }

    patch(settings) {
        Base.patchObject(this, settings);
    }

}

Texture.prototype.isTexture = true;

Texture.id = 0;

import Base from "./Base.mjs";
