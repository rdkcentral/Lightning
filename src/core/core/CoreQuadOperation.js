/**
 * Copyright Metrological, 2017
 */

class CoreQuadOperation {

    constructor(shader, shaderOwner, renderTexture, clearRenderTexture) {

        this.shader = shader
        this.shaderOwner = shaderOwner
        this.renderTexture = renderTexture
        this.clearRenderTexture = clearRenderTexture
        this.length = 0
        this.extraAttribsDataByteOffset = 0

    }

}

module.exports = CoreQuadOperation