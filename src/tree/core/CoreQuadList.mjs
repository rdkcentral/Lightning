export default class CoreQuadList {

    constructor(ctx) {

        this.ctx = ctx;

        this.quadTextures = [];

        this.quadViews = [];
    }

    get length() {
        return this.quadTextures.length;
    }

    reset() {
        this.quadTextures = [];
        this.quadViews = [];
        this.dataLength = 0;
    }

    getView(index) {
        return this.quadViews[index]._view;
    }

    getViewCore(index) {
        return this.quadViews[index];
    }

    getTexture(index) {
        return this.quadTextures[index];
    }

    getTextureWidth(index) {
        let nativeTexture = this.quadTextures[index];
        if (nativeTexture.w) {
            // Render texture;
            return nativeTexture.w;
        } else {
            return this.quadViews[index]._displayedTextureSource.w;
        }
    }

    getTextureHeight(index) {
        let nativeTexture = this.quadTextures[index];
        if (nativeTexture.h) {
            // Render texture;
            return nativeTexture.h;
        } else {
            return this.quadViews[index]._displayedTextureSource.h;
        }
    }

}
