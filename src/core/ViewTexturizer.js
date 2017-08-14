/**
 * Copyright Metrological, 2017
 */

class ViewTexturizer {

    constructor(view) {

        this._view = view
        this._core = view._core
        
        this.ctx = this._core.ctx
        
        this._enabled = false
        this.lazy = false
        this._colorize = false

        this._filters = []

        this._renderTexture = null
        
        this._resultTexture = null

        this.disableResultShading = false

        this._resultTextureSource = null
        
        this._renderToTextureEnabled = false

        this.filterResultCached = false
    }

    get enabled() {
        return this._enabled
    }

    set enabled(v) {
        this._enabled = v
        this._updateRenderToTextureEnabled()
    }
    
    get colorize() {
        return this._colorize
    }
    
    set colorize(v) {
        if (this._colorize !== v) {
            this._colorize = v
            
            // Only affects the finally drawn quad.
            this._core._setHasRenderUpdates(1)
        }
    }

    get filters() {
        return this._filters
    }

    set filters(v) {
        this._clearFilters();
        v.forEach(filter => {
            if (Utils.isObjectLiteral(filter) && filter.type) {
                let s = new filter.type(this.ctx)
                s.setSettings(filter)
                this._addFilter(s)
            } else if (filter.isFilter) {
                this._addFilter(filter);
            } else {
                console.error("Please specify a shader or shader type.");
            }
        })

        this._updateRenderToTextureEnabled();
        this._core.setHasRenderUpdates(2);
    }

    _clearFilters() {
        this._filters.forEach(filter => filter.removeView(this._core))
        this._filters = []
        this.filterResultCached = false
    }

    _addFilter(filter) {
        filter.addView(this._core)
        this._filters.push(filter);
    }

    _hasFilters() {
        return (this._filters.length > 0);
    }

    _hasActiveFilters() {
        for (let i = 0, n = this._filters.length; i < n; i++) {
            if (!this._filters[i].useDefault()) return true
        }
        return false
    }

    getActiveFilters() {
        return this._filters.filter(filter => !filter.useDefault())
    }

    _updateRenderToTextureEnabled() {
        let v = (this._hasFilters() || (this._enabled))
        this._core._setRenderToTextureEnabled(v)
        
        if (!v) {
            this.releaseRenderTexture()
        }
    }
    
    
    getResultTextureSource() {
        if (!this._resultTextureSource) {
            this._resultTextureSource = new TextureSource(this._view.stage.textureManager, null);

            this.updateResultTexture()

            // Forces filters to always generate a full result texture.
            this.disableResultShading = true

            // For convenience: you'll want to force the existence of a render texture.
            this.enabled = true
            this.lazy = false
        }
        return this._resultTextureSource
    }

    updateResultTexture() {
        let resultTexture = this.getResultTexture()
        if (this._resultTextureSource) {
            if (this._resultTextureSource.glTexture !== resultTexture) {
                let w = resultTexture ? resultTexture.w : 0
                let h = resultTexture ? resultTexture.h : 0
                this._resultTextureSource._changeGlTexture(resultTexture, w, h)
            }
        }
    }

    mustRenderToTexture() {
        // Check if we must really render as texture.
        if (this._enabled && !this.lazy) {
            return true
        } else if (this._enabled && this.lazy && this._hasRenderUpdates < 3) {
            // Static-only: if renderToTexture did not need to update during last drawn frame, generate it as a cache.
            return true
        } else if (this._hasActiveFilters()) {
            // Only render as texture if there is at least one filter shader to be applied.
            return true
        }
        return false
    }

    deactivate() {
        this.releaseRenderTexture()
        this.releaseFilterTexture()
        this.updateResultTexture()
    }

    releaseRenderTexture() {
        if (this._renderTexture) {
            //@todo: replace to coreRenderer
            this.ctx.releaseRenderTexture(this._renderTexture);
            this._renderTexture = null;
        }
    }

    hasRenderTexture() {
        return !!this._renderTexture
    }

    getRenderTexture() {
        if (!this._renderTexture) {
            //@todo: replace to coreRenderer
            this._renderTexture = this.ctx.allocateRenderTexture(Math.min(2048, this._core._rw), Math.min(2048, this._core._rh));
        }
        return this._renderTexture;
    }

    getFilterTexture() {
        if (!this._resultTexture) {
            //@todo: replace to coreRenderer
            this._resultTexture = this.ctx.allocateRenderTexture(Math.min(2048, this._core._rw), Math.min(2048, this._core._rh));
        }
        return this._resultTexture;
    }

    replaceFilterTexture(otherTexture) {
        if (this._resultTexture) {
            this.ctx.releaseRenderTexture(this._resultTexture);
        }
        this._resultTexture = otherTexture
    }

    releaseFilterTexture() {
        if (this._resultTexture) {
            this.ctx.releaseRenderTexture(this._resultTexture)
            this._resultTexture = null
        }
    }

    getResultTexture() {
        return this._hasFilters() ? this._resultTexture : this._renderTexture
    }

}

let Utils = require('./Utils')
let TextureSource = require('./TextureSource')

module.exports = ViewTexturizer