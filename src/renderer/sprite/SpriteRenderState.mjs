import CoreRenderState from "../../tree/core/CoreRenderState.mjs";

export default class SpriteRenderState extends CoreRenderState {
    constructor(ctx) {
        super(ctx);


        this.sharedTexture = null;
    }

    get length() {
        return this.quads.quadTextureIds.length;
    }

    addQuad(elementCore) {
        if (!this._quadOperation) {
            this._createQuadOperation();
        } else if (this._check && this._hasChanges()) {
            this._finishQuadOperation();
            this._check = false;
        }

        let nativeTexture = null;
        if (this._texturizer) {
            nativeTexture = this._texturizer.getResultTexture();

            if (!this._cacheTexturizer) {
                // We can release the temporary texture immediately after finalizing this quad operation.
                this._temporaryTexturizers.push(this._texturizer);
            }
        }
        let isNewTexture = false;
        if (!this.sharedTexture || this.sharedTexture != elementCore._displayedTextureSource.nativeTexture) {
            this.sharedTexture = elementCore._displayedTextureSource.nativeTexture;
            if (!elementCore._quadsList || elementCore._quadsList.id > (this.quads.quadTexture.length-1))
                this.quads.quadTextures.push(elementCore._displayedTextureSource.nativeTexture);
            
            console.log("Setting SHARED teXture");
            isNewTexture = true;
        }
        if (!nativeTexture) {
            console.log("nativeTexture:EMPTY");
            if (this.sharedTexture) {
                    nativeTexture = this.sharedTexture;
                    console.log("Using SHARABLE texture");
            }
            else
                nativeTexture = elementCore._displayedTextureSource.nativeTexture;
        }

        if (this._renderTextureInfo) {
            if (this._shader === this.defaultShader && this._renderTextureInfo.empty) {
                // The texture might be reusable under some conditions. We will check them in ElementCore.renderer.
                this._renderTextureInfo.nativeTexture = nativeTexture;
                this._renderTextureInfo.offset = this.length;
            } else {
                // It is not possible to reuse another texture when there is more than one quad.
                this._renderTextureInfo.nativeTexture = null;
            }
            this._renderTextureInfo.empty = false;
        }
        this.quads.quadTextureIds.push(elementCore._quadsList ? elementCore._quadsList.id : this.quads.quadTextures.length-1);

        this.quads.quadElements.push(elementCore);

        this._quadOperation.length++;

        this.renderer.addQuad(this, this.quads, this.length - 1);
        console.log("addQuad:quads", this.quads.length);
        console.log("addQuad:quadTexturesId:", this.quads.quadTextureIds);
        console.log("addQuad:quadTextures:", this.quads.quadTextures);
        console.log("addQuad:quads", this.quads.quadElements.length);
        console.log("Texture:", nativeTexture);
        console.log("Texture:isShared", elementCore._isSharable);
        console.log("Texture:quadsList", elementCore._quadsList);
    }

    _isRenderTextureReusable() {
        const offset = this._renderTextureInfo.offset;
        //console.log("_isRenderTextureReusable:offset", this._renderTextureInfo.offset);
        return (this.quads.quadTextures[this.quads.quadTexturesIds[offset]].w === this._renderTextureInfo.w) &&
            (this.quads.quadTextures[this.quads.quadTexturesIds[offset]].h === this._renderTextureInfo.h) &&
            this.renderer.isRenderTextureReusable(this, this._renderTextureInfo)
    }
}