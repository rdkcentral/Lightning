/**
 * Copyright Metrological, 2017
 */

let Base = require('./Base')

class FilterList extends Base {

    constructor(viewRenderer) {
        super();

        this._viewRenderer = viewRenderer;

        this._shaders = []

        this._renderGlTexture = null;

        this.cached = true;

        this.disableLastWithShader = false
    }

    _clear() {
        this._shaders = []
        this.cached = false
    }

    get length() {
        return this._shaders.length
    }

    hasActiveShaders() {
        for (let i = 0, n = this.length; i < n; i++) {
            if (!this._shaders[i].drawsAsDefault()) return true
        }
        return false
    }

    getActiveShaders() {
        return this._shaders.filter(shader => !shader.drawsAsDefault())
    }

    _addShader(shader) {
        this._shaders.push(shader);
    }

    get shaders() {
        return this._shaders
    }

    set shaders(v) {
        this._clear();
        v.forEach(shader => {
            if (Utils.isObjectLiteral(shader) && shader.type) {
                let s = new shader.type(this._viewRenderer.ctx)
                s.setSettings(shader)
                this._addShader(s)
            } else if (shader.isShader) {
                this._addShader(shader);
            } else {
                console.error("Please specify a shader or shader type.");
            }
        })

        this._viewRenderer._updateRenderToTextureEnabled();
        this._viewRenderer.setHasRenderUpdates(2);
    }

    updateShaderUserReferences() {
        for (let i = 0, n = this._shaders.length; i < n; i++) {
            this._shaders[i].updateUserReference(this._viewRenderer);
        }
    }

    _getRenderGlTexture() {
        if (!this._renderGlTexture) {
            this._renderGlTexture = this._viewRenderer.ctx.createGlTexture(Math.min(2048, this._viewRenderer._rw), Math.min(2048, this._viewRenderer._rh));
        }
        return this._renderGlTexture;
    }

    releaseRenderGlTexture() {
        if (this._renderGlTexture) {
            this._viewRenderer.ctx.releaseGlTexture(this._renderGlTexture);
            this._renderGlTexture = null;
        }
        this.cached = false
    }

    replaceRenderGlTexture(otherTexture) {
        if (this._renderGlTexture) {
            this._viewRenderer.ctx.releaseGlTexture(this._renderGlTexture);
        }
        this._renderGlTexture = otherTexture
    }

    get renderGlTexture() {
        return this._renderGlTexture
    }

}

let Utils = require('./Utils')

module.exports = FilterList