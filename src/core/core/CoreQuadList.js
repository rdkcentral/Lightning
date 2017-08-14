/**
 * Copyright Metrological, 2017
 */

class CoreQuadList {

    constructor(ctx, byteSize) {

        this.ctx = ctx

        this.textureAtlasGlTexture = this.ctx.textureAtlas ? this.ctx.textureAtlas.texture : null

        this.byteSize = byteSize

        this.data = new ArrayBuffer(byteSize)
        this.floats = new Float32Array(this.data)
        this.uints = new Uint32Array(this.data)

        this.bytesRemaining = this.byteSize

        this.quadTextures = []

        this.quadViews = []

    }

    reset() {
        this.bytesRemaining = this.byteSize
        this.quadTextures = []
        this.quadViews = []
    }

    getView(index) {
        return this.quadViews[index]._view
    }

    getViewCore(index) {
        return this.quadViews[index]
    }

    getTexture(index) {
        return this.quadTextures[index]
    }

    getTextureWidth(index) {
        let glTexture = this.quadTextures[index]
        if (glTexture.w) {
            // Render texture
            return glTexture.w
        } else if (glTexture === this.textureAtlasGlTexture) {
            return 2048
        } else {
            return this.quadViews[index]._displayedTextureSource.w
        }
    }

    getTextureHeight(index) {
        let glTexture = this.quadTextures[index]
        if (glTexture.h) {
            // Render texture
            return glTexture.h
        } else if (glTexture === this.textureAtlasGlTexture) {
            return 2048
        } else {
            return this.quadViews[index]._displayedTextureSource.h
        }
    }
}

module.exports = CoreQuadList