import WebGLRenderer from "./../webgl/WebGLRenderer.mjs";

class SpriteRenderer extends WebGLRenderer {

    constructor(stage) {
        super(stage);
    }

    destroy() {
        super.destroy();
    }
    
    _createDefaultShader(ctx) {
        return new DefaultShader(ctx);
    }

    _getShaderBaseType() {
        return WebGLShader
    }

    _getShaderAlternative(shaderType) {
        return shaderType.getWebGL && shaderType.getWebGL();
    }

    _getShaderAlternative(shaderType) {
        return shaderType.getWebGL && shaderType.getWebGL();
    }

    createCoreQuadList(ctx) {
        //console.log("Mode", this.mode);
        return new SpriteQuadList(ctx);
    }

    
    createCoreRenderState(ctx) {
        return new SpriteRenderState(ctx);
    }
}