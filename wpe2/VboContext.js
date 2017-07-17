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
            let size = Math.min(this.stage.options.w, this.stage.options.h);
            let vboIndex = this.vboIndex;
            this.vboBufferFloat[vboIndex++] = 0;
            this.vboBufferFloat[vboIndex++] = 0;
            this.vboBufferUint[vboIndex++] = getVboTextureCoords(0, 0);
            this.vboBufferUint[vboIndex++] = 0xFFFFFFFF;
            this.vboBufferFloat[vboIndex++] = size;
            this.vboBufferFloat[vboIndex++] = 0;
            this.vboBufferUint[vboIndex++] = getVboTextureCoords(1, 0);
            this.vboBufferUint[vboIndex++] = 0xFFFFFFFF;
            this.vboBufferFloat[vboIndex++] = size;
            this.vboBufferFloat[vboIndex++] = size;
            this.vboBufferUint[vboIndex++] = getVboTextureCoords(1, 1);
            this.vboBufferUint[vboIndex++] = 0xFFFFFFFF;
            this.vboBufferFloat[vboIndex++] = 0;
            this.vboBufferFloat[vboIndex++] = size;
            this.vboBufferUint[vboIndex++] = getVboTextureCoords(0, 1);
            this.vboBufferUint[vboIndex] = 0xFFFFFFFF;
            this.vboGlTextures.push(this.textureAtlasGlTexture);
            this.vboGlTextureRepeats.push(1);
            this.vboIndex += 16;

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

let getColorInt = function (c, alpha) {
    let a = ((c / 16777216 | 0) * alpha) | 0;
    return (((((c >> 16) & 0xff) * a) >> 8) & 0xff) +
        ((((c & 0xff00) * a) >> 8) & 0xff00) +
        (((((c & 0xff) << 16) * a) >> 8) & 0xff0000) +
        (a << 24);
};

let getVboTextureCoords = function (x, y) {
    return ((x * 65535 + 0.5) | 0) + ((y * 65535 + 0.5) | 0) * 65536;
};