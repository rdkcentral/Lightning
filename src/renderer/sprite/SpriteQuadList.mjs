import WebGLCoreQuadList from "./../webgl/WebGLCoreQuadList.mjs";

export default class SpriteQuadList extends WebGLCoreQuadList {

    constructor(ctx) {
        super(ctx);

        this.sharedTextures = [];
    }

    reset() {
        super.reset();
        this.sharedTextures = [];
    }

    getTexture(index) {
        //console.log("getTexture", this.quadTextures[index], this.sharedTextures[this.quadTextures[index]])
        return this.sharedTextures[this.quadTextures[index]];
    }

    getTextureWidth(index) {
        //console.log("getTextureWidth");
        let nativeTexture = this.sharedTextures[this.quadTextures[index]];
        if (nativeTexture.w) {
            // Render texture;
            return nativeTexture.w;
        } else {
            return this.quadElements[index]._displayedTextureSource.w;
        }
    }

    getTextureHeight(index) {
       // console.log("getTextureHeight");
        let nativeTexture = this.sharedTextures[this.quadTextures[index]];
        if (nativeTexture.h) {
            // Render texture;
            return nativeTexture.h;
        } else {
            return this.quadElements[index]._displayedTextureSource.h;
        }
    }
}