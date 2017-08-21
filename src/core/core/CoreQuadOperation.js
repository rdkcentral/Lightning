/**
 * Copyright Metrological, 2017
 */

class CoreQuadOperation {

    constructor(ctx, shader, shaderOwner, renderTexture, clearRenderTexture, index) {

        this.ctx = ctx
        this.shader = shader
        this.shaderOwner = shaderOwner
        this.renderTexture = renderTexture
        this.clearRenderTexture = clearRenderTexture
        this.index = index
        this.length = 0
        this.extraAttribsDataByteOffset = 0

    }

    get quads() {
        return this.ctx.renderState.quads
    }

    getTexture(index) {
        return this.quads.getTexture(this.index + index)
    }

    getViewCore(index) {
        return this.quads.getViewCore(this.index + index)
    }

    getView(index) {
        return this.quads.getView(this.index + index)
    }

    getTextureWidth(index) {
        return this.quads.getTextureWidth(this.index + index)
    }

    getTextureHeight(index) {
        return this.quads.getTextureHeight(this.index + index)
    }

    /**
     * Returns the relative pixel coordinates in the shader owner to gl position coordinates in the render texture.
     * @param x
     * @param y
     * @return {number[]}
     */
    getNormalRenderTextureCoords(x, y) {
        let coords = this.shaderOwner.getRenderTextureCoords(x, y)
        coords[0] /= this.getRenderWidth()
        coords[1] /= this.getRenderHeight()
        coords[0] = coords[0] * 2 - 1
        coords[1] = 1 - coords[1] * 2
        return coords
    }

    getRenderWidth() {
        if (this.renderTexture) {
            return this.renderTexture.w
        } else {
            return this.ctx.stage.w
        }
    }

    getRenderHeight() {
        if (this.renderTexture) {
            return this.renderTexture.h
        } else {
            return this.ctx.stage.h
        }
    }

}

module.exports = CoreQuadOperation