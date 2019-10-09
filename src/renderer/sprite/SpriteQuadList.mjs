import WebGLCoreQuadList from "./../webgl/WebGLCoreQuadList.mjs";

export default class SpriteQuadList extends WebGLCoreQuadList {

    constructor(ctx) {
        super(ctx);

        this.quadTextureIds = [];
    }

    reset() {
        super.reset();
        this.quadTextureIds = [];
    }

    get length() {
        return this.quadTextureIds.length;
    }

    getTexture(index) {
        //console.log("getTexture", this.quadTextures[index], this.quadTextures[this.quadTextureIds[index]])
        return this.quadTextures[this.quadTextureIds[index]];
    }

    getTextureWidth(index) {
        //console.log("getTextureWidth");
        let nativeTexture = this.quadTextures[this.quadTextureIds[index]];
        if (nativeTexture.w) {
            // Render texture;
            return nativeTexture.w;
        } else {
            return this.quadElements[index]._displayedTextureSource.w;
        }
    }

    getTextureHeight(index) {
       // console.log("getTextureHeight");
        let nativeTexture = this.quadTextures[this.quadTextureIds[index]];
        if (nativeTexture.h) {
            // Render texture;
            return nativeTexture.h;
        } else {
            return this.quadElements[index]._displayedTextureSource.h;
        }
    }
}