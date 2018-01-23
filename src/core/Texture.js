/**
 * Copyright Metrological, 2017
 */
class Texture {

    /**
     * @param {TextureManager} manager
     * @param {TextureSource} source
     */
    constructor(manager, source) {
        this.manager = manager;

        this.id = Texture.id++;

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
         * Render precision (0.5 = fuzzy, 1 = normal, 2 = sharp even when scaled twice, etc.).
         * @type {number}
         * @private
         */
        this._precision = 1;

        /**
         * Indicates if Texture.prototype.texture uses clipping.
         * @type {boolean}
         */
        this.clipping = false;

    }

    enableClipping(x, y, w, h) {
        if (this._x !== x || this._y !== y || this._w !== w || this._h !== h) {
            this._x = x;
            this._y = y;
            this._w = w;
            this._h = h;

            this.updateClipping(true);
        }
    }

    disableClipping() {
        if (this._x || this._y || this._w || this._h) {
            this._x = 0;
            this._y = 0;
            this._w = 0;
            this._h = 0;

            this.updateClipping(false);
        }
    }

    updateClipping(overrule) {
        if (overrule === true || overrule === false) {
            this.clipping = overrule;
        } else {
            this.clipping = !!(this._x || this._y || this._w || this._h);
        }

        let self = this;
        this.source.views.forEach(function(view) {
            // Ignore if not the currently displayed texture.
            if (view.displayedTexture === self) {
                view.onDisplayedTextureClippingChanged();
            }
        });
    }

    updatePrecision() {
        let self = this;
        this.source.views.forEach(function(view) {
            // Ignore if not the currently displayed texture.
            if (view.displayedTexture === self) {
                view.onPrecisionChanged();
            }
        });
    }

    replaceTextureSource(newSource) {
        let oldSource = this.source;

        this.source = newSource;

        oldSource.views.forEach(view => {
            if (view.texture === this || view.displayedTexture === this) {
                // Remove links from previous source, but only if there is no reason for it any more.
                let keep = (view.displayedTexture && view.displayedTexture !== this && view.displayedTexture.source === oldSource);
                keep = keep || (view.texture && view.texture !== this && view.texture.source === oldSource);

                if (!keep) {
                    oldSource.removeView(view);
                }

                newSource.addView(view);

                if (newSource.glTexture) {
                    // We may update the source within the same texture as previous, so we need to force update.
                    view._setDisplayedTexture(this, true)
                } else {
                    view._setDisplayedTexture(null, true)
                }
            }
        });
    }

    getNonDefaults() {
        let nonDefaults = {};
        if (this.x !== 0) nonDefaults['x'] = this.x;
        if (this.y !== 0) nonDefaults['y'] = this.y;
        if (this.w !== 0) nonDefaults['w'] = this.w;
        if (this.h !== 0) nonDefaults['h'] = this.h;
        if (this.precision !== 1) nonDefaults['precision'] = this.precision;
        return nonDefaults;        
    }
    
    get x() {return this._x}
    set x(v) {if (this._x !== v) {
        this._x = v;
        this.updateClipping();
    }}

    get y() {return this._y}
    set y(v) {if (this._y !== v) {
        this._y = v;
        this.updateClipping();
    }}

    get w() {return this._w}
    set w(v) {if (this._w !== v) {
        this._w = v;
        this.updateClipping();
    }}

    get h() {return this._h}
    set h(v) {if (this._h !== v) {
        this._h = v;
        this.updateClipping();
    }}

    get precision() {return this._precision}
    set precision(v) {if (this._precision !== v) {
        this._precision = v;
        this.updatePrecision();
    }}

    patch(settings) {
        Base.patchObject(this, settings)
    }

}

let Base = require('./Base')

Texture.id = 0;

module.exports = Texture;
