/**
 * Copyright Metrological, 2017
 */

class CoreQuadOperation {

    constructor(quads, shader, shaderOwner, renderTexture, clearRenderTexture, index) {

        this.quads = quads
        this.shader = shader
        this.shaderOwner = shaderOwner
        this.renderTexture = renderTexture
        this.clearRenderTexture = clearRenderTexture
        this.index = index
        this.length = 0
        this.extraAttribsDataByteOffset = 0

    }

}

module.exports = CoreQuadOperation