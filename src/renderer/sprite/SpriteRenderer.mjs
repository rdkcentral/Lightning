import WebGLRenderer from "./../sprite/WebGLRenderer.mjs";

class SpriteRenderer extends WebGLRenderer {

    constructor(stage) {
        super(stage);
    }

    destroy() {
        super.destroy();
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