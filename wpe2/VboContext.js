class VboContext {

    constructor(stage) {
        this.stage = stage;

        this.vboGlTextures = [];
        this.vboGlTextureRepeats = [];
        this.lastVboGlTexture = null;

        this.vboParamsBuffer = new ArrayBuffer(16 * 4 * 16384 * 2);
        this.vboBufferFloat = new Float32Array(this.vboParamsBuffer);
        this.vboBufferUint = new Uint32Array(this.vboParamsBuffer);
        this.vboIndex = 0;

        this.n = 0;

        this.updateTreeOrder = 0;
        this.updateTreeOrderForceUpdate = 0;

        this.staticStage = false;

        this.useZIndexing = false;
    }

    reset() {
        this.vboIndex = 0;
        this.vboGlTextures = [];
        this.vboGlTextureRepeats = [];
        this.textureAtlasGlTexture = this.stage.textureAtlas ? this.stage.textureAtlas.texture : null;
        this.rectangleTextureSource = this.stage.rectangleTexture.source;
        this.lastVboGlTexture = null;
        this.n = 0;
        this.updateTreeOrder = 0;
    }

    updateAndFillVbo() {
        this.useZIndexing = (this.stage.zIndexUsage > 0);

        this.reset();

        // The root parent is used when updating the transform matrix, because it saves us from having several branches.
        if (!this.rootParent) {
            this.rootParent = new View(this.stage);
        }

        this.root._parent = this.rootParent;
        this.root.update();
        this.root._parent = null;

        if (this.useZIndexing) {
            // A secondary fill pass is required.
            this.root.fillVbo();
        }

        if (this.stage.textureAtlas && this.stage.options.debugTextureAtlas) {
            //@todo: add item for gl texture and add to vbo.
        }

        this.staticStage = true;
    }

    addVboTextureSource(textureSource, repeat) {
        let glTexture = textureSource.inTextureAtlas ? this.textureAtlasGlTexture : textureSource.glTexture;
        if (this.lastVboGlTexture !== glTexture) {
            this.vboGlTextures.push(glTexture);
            this.vboGlTextureRepeats.push(repeat);
            this.n++;
            this.lastVboGlTexture = glTexture;
        } else {
            this.vboGlTextureRepeats[this.n - 1] += repeat;
        }

        this.vboIndex += repeat * 16;
    }

}