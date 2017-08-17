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