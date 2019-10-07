import WebGLRenderer from "./../webgl/WebGLRenderer.mjs";
import SpriteQuadList from "./SpriteQuadList.mjs";
import SpriteRenderState from "./SpriteRenderState.mjs";

export default class SpriteRenderer extends WebGLRenderer {

    constructor(stage) {
        super(stage);
    }

    destroy() {
        super.destroy();
    }

    createCoreQuadList(ctx) {
        return new SpriteQuadList(ctx);
    }

    
    createCoreRenderState(ctx) {
        return new SpriteRenderState(ctx);
    }
}