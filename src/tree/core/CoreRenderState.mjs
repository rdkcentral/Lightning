export default class CoreRenderState {

    constructor(ctx) {
        this.ctx = ctx;

        this.stage = ctx.stage;

        this.defaultShader = this.stage.renderer.getDefaultShader(ctx);

        this.renderer = ctx.stage.renderer;

        this.quads = this.renderer.createCoreQuadList(ctx);

    }

    reset() {
        this._renderTextureInfo = null;

        this._scissor = null;

        this._shader = null;

        this._shaderOwner = null;

        this._realShader = null;

        this._check = false;

        this.quadOperations = [];

        this._texturizer = null;

        this._texturizerTemporary = false;

        this._quadOperation = null;

        this.quads.reset();

        this._temporaryTexturizers = [];
        
        this._isCachingTexturizer = false;

    }

    get length() {
        return this.quads.quadTextures.length;
    }

    setShader(shader, owner) {
        if (this._shaderOwner !== owner || this._realShader !== shader) {
            // Same shader owner: active shader is also the same.
            // Prevent any shader usage to save performance.

            this._realShader = shader;

            if (shader.useDefault()) {
                // Use the default shader when possible to prevent unnecessary program changes.
                shader = this.defaultShader;
            }
            if (this._shader !== shader || this._shaderOwner !== owner) {
                this._shader = shader;
                this._shaderOwner = owner;
                this._check = true;
            }
        }
    }

    get renderTextureInfo() {
        return this._renderTextureInfo;
    }

    setScissor(area) {
        if (this._scissor !== area) {
            if (area) {
                this._scissor = area;
            } else {
                this._scissor = null;
            }
            this._check = true;
        }
    }

    getScissor() {
        return this._scissor;
    }

    setRenderTextureInfo(renderTextureInfo) {
        if (this._renderTextureInfo !== renderTextureInfo) {
            this._renderTextureInfo = renderTextureInfo;
            this._scissor = null;
            this._check = true;
        }
    }

    /**
     * Sets the texturizer to be drawn during subsequent addQuads.
     * @param {ElementTexturizer} texturizer
     */
    setTexturizer(texturizer, cache = false) {
        this._texturizer = texturizer;
        this._cacheTexturizer = cache;
    }

    set isCachingTexturizer(v) {
        this._isCachingTexturizer = v;
    }

    get isCachingTexturizer() {
        return this._isCachingTexturizer;
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

        if (!nativeTexture) {
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

        this.quads.quadTextures.push(nativeTexture);
        this.quads.quadElements.push(elementCore);

        this._quadOperation.length++;

        this.renderer.addQuad(this, this.quads, this.length - 1)
    }

    finishedRenderTexture() {
        if (this._renderTextureInfo.nativeTexture) {
            // There was only one texture drawn in this render texture.
            // Check if we can reuse it so that we can optimize out an unnecessary render texture operation.
            // (it should exactly span this render texture).
            if (!this._isRenderTextureReusable()) {
                this._renderTextureInfo.nativeTexture = null;
            }
        }
    }

    _isRenderTextureReusable() {
        const offset = this._renderTextureInfo.offset;
        return (this.quads.quadTextures[offset].w === this._renderTextureInfo.w) &&
            (this.quads.quadTextures[offset].h === this._renderTextureInfo.h) &&
            this.renderer.isRenderTextureReusable(this, this._renderTextureInfo)
    }

    _hasChanges() {
        let q = this._quadOperation;
        if (this._shader !== q.shader) return true;
        if (this._shaderOwner !== q.shaderOwner) return true;
        if (this._renderTextureInfo !== q.renderTextureInfo) return true;
        if (this._scissor !== q.scissor) {
            if ((this._scissor[0] !== q.scissor[0]) || (this._scissor[1] !== q.scissor[1]) || (this._scissor[2] !== q.scissor[2]) || (this._scissor[3] !== q.scissor[3])) {
                return true;
            }
        }

        return false;
    }

    _finishQuadOperation(create = true) {
        if (this._quadOperation) {
            if (this._quadOperation.length || this._shader.addEmpty()) {
                if (!this._quadOperation.scissor || ((this._quadOperation.scissor[2] > 0) && (this._quadOperation.scissor[3] > 0))) {
                    // Ignore empty clipping regions.
                    this.quadOperations.push(this._quadOperation);
                }
            }

            if (this._temporaryTexturizers.length) {
                for (let i = 0, n = this._temporaryTexturizers.length; i < n; i++) {
                    // We can now reuse these render-to-textures in subsequent stages.
                    // Huge performance benefit when filtering (fast blur).
                    this._temporaryTexturizers[i].releaseRenderTexture();
                }
                this._temporaryTexturizers = [];
            }

            this._quadOperation = null;
        }

        if (create) {
            this._createQuadOperation();
        }
    }

    _createQuadOperation() {
        this._quadOperation = this.renderer.createCoreQuadOperation(
            this.ctx,
            this._shader,
            this._shaderOwner,
            this._renderTextureInfo,
            this._scissor,
            this.length
        );
        this._check = false;
    }

    finish() {
        if (this._quadOperation) {
            // Add remaining.
            this._finishQuadOperation(false);
        }

        this.renderer.finishRenderState(this);
    }

}

