
export default class CoreFilterOperation {

    constructor(ctx, filter, owner, source, renderTexture, beforeQuadOperation) {

        this.ctx = ctx;
        this.filter = filter;
        this.owner = owner;
        this.source = source;
        this.renderTexture = renderTexture;
        this.beforeQuadOperation = beforeQuadOperation;

    }

    getRenderWidth() {
        if (this.renderTexture) {
            return this.renderTexture.w;
        } else {
            return this.ctx.stage.w;
        }
    }

    getRenderHeight() {
        if (this.renderTexture) {
            return this.renderTexture.h;
        } else {
            return this.ctx.stage.h;
        }
    }

}
