import CoreQuadOperation from "../../tree/core/CoreQuadOperation.mjs";

export default class WebGLCoreQuadOperation extends CoreQuadOperation {

    constructor(ctx, shader, shaderOwner, renderTextureInfo, scissor, index) {
        super(ctx, shader, shaderOwner, renderTextureInfo, scissor, index);

        this.extraAttribsDataByteOffset = 0;
    }

    getAttribsDataByteOffset(index) {
        // Where this quad can be found in the attribs buffer.
        return this.quads.getAttribsDataByteOffset(this.index + index);
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

    getProjection() {
        if (this.renderTextureInfo === null) {
            return this.ctx.renderExec._projection;
        } else {
            return this.renderTextureInfo.nativeTexture.projection;
        }
    }

}