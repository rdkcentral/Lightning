/**
 * Copyright Metrological, 2017
 */
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

        this.root.update();

        if (this.useZIndexing) {
            // A secondary fill pass is required.
            this.root.fillVbo();
        }

        if (this.stage.textureAtlas && this.stage.options.debugTextureAtlas) {
            let size = Math.min(this.stage.options.w, this.stage.options.h);
            let vboIndex = this.vboIndex;
            this.vboBufferFloat[vboIndex++] = 0;
            this.vboBufferFloat[vboIndex++] = 0;
            this.vboBufferUint[vboIndex++] = 0x00000000;
            this.vboBufferUint[vboIndex++] = 0xFFFFFFFF;
            this.vboBufferFloat[vboIndex++] = size;
            this.vboBufferFloat[vboIndex++] = 0;
            this.vboBufferUint[vboIndex++] = 0x0000FFFF;
            this.vboBufferUint[vboIndex++] = 0xFFFFFFFF;
            this.vboBufferFloat[vboIndex++] = size;
            this.vboBufferFloat[vboIndex++] = size;
            this.vboBufferUint[vboIndex++] = 0xFFFFFFFF;
            this.vboBufferUint[vboIndex++] = 0xFFFFFFFF;
            this.vboBufferFloat[vboIndex++] = 0;
            this.vboBufferFloat[vboIndex++] = size;
            this.vboBufferUint[vboIndex++] = 0xFFFF0000;
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

module.exports = VboContext;

let View = require('./View');
