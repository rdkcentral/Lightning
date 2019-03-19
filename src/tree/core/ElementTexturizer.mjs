import TextureSource from '../TextureSource.mjs';

export default class ElementTexturizer {

    constructor(elementCore) {

        this._element = elementCore.element;
        this._core = elementCore;

        this.ctx = this._core.ctx;

        this._enabled = false;
        this.lazy = false;
        this._colorize = false;

        this._renderTexture = null;

        this._renderTextureReused = false;

        this._resultTextureSource = null;

        this._renderOffscreen = false;

        this.empty = false;
    }

    get enabled() {
        return this._enabled;
    }

    set enabled(v) {
        this._enabled = v;
        this._core.updateRenderToTextureEnabled();
    }

    get renderOffscreen() {
        return this._renderOffscreen;
    }

    set renderOffscreen(v) {
        this._renderOffscreen = v;
        this._core.setHasRenderUpdates(1);

        // This enforces rechecking the 'within bounds'.
        this._core._setRecalc(6);
    }

    get colorize() {
        return this._colorize;
    }

    set colorize(v) {
        if (this._colorize !== v) {
            this._colorize = v;

            // Only affects the finally drawn quad.
            this._core.setHasRenderUpdates(1);
        }
    }

    _getTextureSource() {
        if (!this._resultTextureSource) {
            this._resultTextureSource = new TextureSource(this._element.stage.textureManager);
            this.updateResultTexture();
        }
        return this._resultTextureSource;
    }

    hasResultTexture() {
        return !!this._resultTextureSource;
    }

    resultTextureInUse() {
        return this._resultTextureSource && this._resultTextureSource.hasEnabledElements();
    }

    updateResultTexture() {
        let resultTexture = this.getResultTexture();
        if (this._resultTextureSource) {
            if (this._resultTextureSource.nativeTexture !== resultTexture) {
                let w = resultTexture ? resultTexture.w : 0;
                let h = resultTexture ? resultTexture.h : 0;
                this._resultTextureSource.replaceNativeTexture(resultTexture, w, h);
            }

            // Texture will be updated: all elements using the source need to be updated as well.
            this._resultTextureSource.forEachEnabledElement(element => {
                element._updateDimensions();
                element.core.setHasRenderUpdates(3);
            });
        }
    }

    mustRenderToTexture() {
        // Check if we must really render as texture.
        if (this._enabled && !this.lazy) {
            return true;
        } else if (this._enabled && this.lazy && this._core._hasRenderUpdates < 3) {
            // Static-only: if renderToTexture did not need to update during last drawn frame, generate it as a cache.
            return true;
        }
        return false;
    }

    deactivate() {
        this.release();
    }

    get renderTextureReused() {
        return this._renderTextureReused;
    }

    release() {
        this.releaseRenderTexture();
    }

    releaseRenderTexture() {
        if (this._renderTexture) {
            if (!this._renderTextureReused) {
                this.ctx.releaseRenderTexture(this._renderTexture);
            }
            this._renderTexture = null;
            this._renderTextureReused = false;
            this.updateResultTexture();
        }
    }

    // Reuses the specified texture as the render texture (in ancestor).
    reuseTextureAsRenderTexture(nativeTexture) {
        if (this._renderTexture !== nativeTexture) {
            this.releaseRenderTexture();
            this._renderTexture = nativeTexture;
            this._renderTextureReused = true;
        }
    }

    hasRenderTexture() {
        return !!this._renderTexture;
    }

    getRenderTexture() {
        if (!this._renderTexture) {
            this._renderTexture = this.ctx.allocateRenderTexture(this._core._w, this._core._h);
            this._renderTextureReused = false;
        }
        return this._renderTexture;
    }

    getResultTexture() {
        return this._renderTexture;
    }

}

