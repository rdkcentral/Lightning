
export default class CoreQuadOperation {

    constructor(ctx, shader, shaderOwner, renderTextureInfo, scissor, index) {

        this.ctx = ctx;
        this.shader = shader;
        this.shaderOwner = shaderOwner;
        this.renderTextureInfo = renderTextureInfo;
        this.scissor = scissor;
        this.index = index;
        this.length = 0;

    }

    get quads() {
        return this.ctx.renderState.quads;
    }

    getTexture(index) {
        return this.quads.getTexture(this.index + index);
    }

    getViewCore(index) {
        return this.quads.getViewCore(this.index + index);
    }

    getView(index) {
        return this.quads.getView(this.index + index);
    }

    getViewWidth(index) {
        return this.getView(index).renderWidth;
    }

    getViewHeight(index) {
        return this.getView(index).renderHeight;
    }

    getTextureWidth(index) {
        return this.quads.getTextureWidth(this.index + index);
    }

    getTextureHeight(index) {
        return this.quads.getTextureHeight(this.index + index);
    }

    getRenderWidth() {
        if (this.renderTextureInfo) {
            return this.renderTextureInfo.w;
        } else {
            return this.ctx.stage.w;
        }
    }

    getRenderHeight() {
        if (this.renderTextureInfo) {
            return this.renderTextureInfo.h;
        } else {
            return this.ctx.stage.h;
        }
    }

}
