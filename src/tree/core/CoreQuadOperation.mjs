/**
 * Copyright Metrological, 2017;
 */

export default class CoreQuadOperation {

    constructor(ctx, shader, shaderOwner, renderTextureInfo, scissor, index) {

        this.ctx = ctx;
        this.shader = shader;
        this.shaderOwner = shaderOwner;
        this.renderTextureInfo = renderTextureInfo;
        this.scissor = scissor;
        this.index = index;
        this.length = 0;
        this.extraAttribsDataByteOffset = 0;

    }

    get quads() {
        return this.ctx.renderState.quads;
    }

    getAttribsDataByteOffset(index) {
        // Where this quad can be found in the attribs buffer.
        return this.quads.getAttribsDataByteOffset(this.index + index);
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

    /**
     * Returns the relative pixel coordinates in the shader owner to gl position coordinates in the render texture.
     * @param x
     * @param y
     * @return {number[]}
     */
    getNormalRenderTextureCoords(x, y) {
        let coords = this.shaderOwner.getRenderTextureCoords(x, y);
        coords[0] /= this.getRenderWidth();
        coords[1] /= this.getRenderHeight();
        coords[0] = coords[0] * 2 - 1;
        coords[1] = 1 - coords[1] * 2;
        return coords;
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

    getProjection() {
        if (this.renderTextureInfo === null) {
            return this.ctx.renderExec._projection;
        } else {
            return this.renderTextureInfo.nativeTexture.projection;
        }
    }

}
