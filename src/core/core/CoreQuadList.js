/**
 * Copyright Metrological, 2017
 */

class CoreQuadList {

    constructor(ctx, byteSize) {

        this.ctx = ctx

        this.textureAtlasGlTexture = this.ctx.textureAtlas ? this.ctx.textureAtlas.texture : null

        this.dataLength = 0

        this.data = new ArrayBuffer(byteSize)
        this.floats = new Float32Array(this.data)
        this.uints = new Uint32Array(this.data)

        this.quadTextures = []

        this.quadViews = []

        // Set up first quad to the identity quad (reused for filters).
        let f = this.floats;
        let u = this.uints;
        f[0] = -1;
        f[1] = -1;
        u[2] = 0x00000000;
        u[3] = 0xFFFFFFFF;
        f[4] = 1;
        f[5] = -1;
        u[6] = 0x0000FFFF;
        u[7] = 0xFFFFFFFF;
        f[8] = 1;
        f[9] = 1;
        u[10] = 0xFFFFFFFF;
        u[11] = 0xFFFFFFFF;
        f[12] = -1;
        f[13] = 1;
        u[14] = 0xFFFF0000;
        u[15] = 0xFFFFFFFF;
    }

    reset() {
        this.quadTextures = []
        this.quadViews = []
        this.dataLength = 0
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