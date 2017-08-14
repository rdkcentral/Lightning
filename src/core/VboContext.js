/**
 * Copyright Metrological, 2017
 */

let Shader = require('./Shader');

class VboContext {

    constructor(stage) {
        this.stage = stage;

        this.vboParamsBuffer = new ArrayBuffer(VboContext.GL_PARAMSBUFFER_MEMORY);
        this.vboBufferFloat = new Float32Array(this.vboParamsBuffer);
        this.vboBufferUint = new Uint32Array(this.vboParamsBuffer);
        this.vboIndex = 0;

        this.vboViewCores = [];
        this.vboGlTextures = [];

        this.vboParamsBufferBytesRemaining = VboContext.GL_PARAMSBUFFER_MEMORY;

        this.n = 0;

        this.updateTreeOrder = 0;
        this.updateTreeOrderForceUpdate = 0;

        this._overrideGlTexture = null;

        this._availableRenderTextures = [];

        let DefaultShader = require('./DefaultShader');
        this.defaultShader = new DefaultShader(this);

        this.initSharedShaderData();
    }

    destroy() {
        this.gl.deleteBuffer(this.paramsGlBuffer);
        this.gl.deleteBuffer(this.quadsGlBuffer);
        this._availableRenderTextures.forEach(texture => this._freeGlTexture(texture));
    }

    initSharedShaderData() {
        let gl = this.gl;

        // Create new sharable buffer for params.
        this.paramsGlBuffer = gl.createBuffer();

        let maxQuads = Math.floor(VboContext.GL_PARAMSBUFFER_MEMORY / 64);

        // Init webgl arrays.
        let allIndices = new Uint16Array(maxQuads * 6);

        // fill the indices with the quads to draw.
        for (let i = 0, j = 0; i < maxQuads; i += 6, j += 4) {
            allIndices[i] = j;
            allIndices[i + 1] = j + 1;
            allIndices[i + 2] = j + 2;
            allIndices[i + 3] = j;
            allIndices[i + 4] = j + 2;
            allIndices[i + 5] = j + 3;
        }

        // The quads buffer can be (re)used to draw a range of quads.
        this.quadsGlBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.quadsGlBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, allIndices, gl.STATIC_DRAW);

        // The matrix that causes the [0,0 - W,H] box to map to [-1,-1 - 1,1] in the end results.
        this._projectionMatrix = new Float32Array([
            2/this.stage.options.renderWidth, 0, 0, 0,
            0, -2/this.stage.options.renderHeight, 0, 0,
            0, 0, 1, 0,
            -1, 1, 0, 1
        ]);
        
        // Used for filter quads.
        this._identityProjectionMatrix = new Float32Array([
            1,0,0,0,
            0,1,0,0,
            0,0,1,0,
            0,0,0,1,
        ]);
    }

    setFilterQuadMode(sourceTexture, viewCore) {
        if (!this._filterQuadMode) {
            let f = this.vboBufferFloat;
            let u = this.vboBufferUint;
            f[0] = -1;
            f[1] = -1;
            u[2] = 0x00000000;
            u[3] = 0xFFFFFFFF;
            f[4] = 1;
            f[5] = -1;
            u[6] = 0x0000FFFF;
            u[7] = 0xFFFFFFFF;
            f[8] = 1;
            f[9] = 1;
            u[10] = 0xFFFFFFFF;
            u[11] = 0xFFFFFFFF;
            f[12] = -1;
            f[13] = 1;
            u[14] = 0xFFFF0000;
            u[15] = 0xFFFFFFFF;
            this.vboIndex = 16;
            this.vboViewCores = [];
            this.vboGlTextures = [];
            this._filterQuadModeParamsBuffered = false;
        }
        this.vboViewCores[0] = viewCore;
        this.vboGlTextures[0] = sourceTexture;
        this._filterQuadMode = true;
    }

    reset() {
        this.vboIndex = 0;
        this.vboViewCores = [];
        this.vboGlTextures = [];
        this.textureAtlasGlTexture = this.stage.textureAtlas ? this.stage.textureAtlas.texture : null;
        this.n = 0;

        this.shader = null
        this._shaderOwner = null // The view core that the current shader was defined on (if available).
        this._newShader = null
        this._newShaderOwner = null
        this._renderTarget = null
        this._newRenderTarget = null
        this._renderTargetStack = []
        this._overrideGlTexture = null;
        this._filterQuadMode = false

    }

    layout() {
        this.root.layout();
    }

    resetGl() {
        let gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0,0,this.stage.options.w,this.stage.options.h);

        let glClearColor = this.stage.options.glClearColor;
        this.gl.clearColor(glClearColor[0], glClearColor[1], glClearColor[2], glClearColor[3]);
        this.gl.clear(gl.COLOR_BUFFER_BIT);
    }

    frame() {
        if (!this.root._parent._hasRenderUpdates) {
            return false;
        }

        this.layout();

        this.updateTreeOrder = 0;
        this.update();

        this.render();

        this._freeUnusedRenderTextures();

        // Clear flag to identify if anything changes before the next frame.
        this.root._parent._hasRenderUpdates = false;

        return true;
    }

    update() {
        this.updateRttContext = null
        this.updateRttContextStack = []

        this.root.update();
    }

    setUpdateRttContext(viewCore) {
        this.updateRttContextStack.push(this.updateRttContext)
        this.updateRttContext = viewCore
    }

    restoreUpdateRttContext() {
        this.updateRttContext = this.updateRttContextStack.pop()
    }

    render() {
        this.reset();
        this.resetGl();

        this.root.render();

        this.flushQuads();
        if (this.stage.textureAtlas && this.stage.options.debugTextureAtlas) {
            this.renderDebugTextureAtlas();
        }
    }

    /**
     * Specifically for renderToTexture rendering.
     * @param texture
     */
    overrideAddVboTexture(texture) {
        this._overrideGlTexture = texture;
    }

    addVbo(viewCore) {
        if (this._filterQuadMode) {
            // Switch to quads mode automatically.
            this._clear();
            this._filterQuadMode = false;
        }

        this._commitShader()

        let glTexture = this._overrideGlTexture;
        if (!glTexture) {
            let textureSource = viewCore._displayedTextureSource;
            glTexture = textureSource.inTextureAtlas ? this.textureAtlasGlTexture : textureSource.glTexture;
        }

        this.vboGlTextures.push(glTexture);
        this.vboViewCores.push(viewCore);

        this.vboIndex += 16;

        this.vboParamsBufferBytesRemaining -= this.shader.getBytesPerVertex() * 4;

        if (this.vboParamsBufferBytesRemaining < 1000) {
            this.flushQuads();
        }

        return this.vboIndex - 16;
    }

    bindDefaultGlBuffers() {
        let gl = this.gl;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.quadsGlBuffer);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.paramsGlBuffer);
    }

    bufferGlParams(size = 0) {
        if (!size) {
            size = this.length * this.shader.getBytesPerVertex() * 4;
        }
        if (this._filterQuadMode && this._filterQuadModeParamsBuffered && size === 64) {
            // Params already buffered in memory.
        } else {
            let view = new DataView(this.vboParamsBuffer, 0, size);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.paramsGlBuffer);

            this.gl.bufferData(this.gl.ARRAY_BUFFER, view, this.gl.DYNAMIC_DRAW);

            // for (let i = 0, n = this.length; i < n; i++) {
            //     let base = i * 16;
            //     console.log(i, this.vboBufferFloat[base], this.vboBufferFloat[base+1], this.vboBufferUint[base+2], this.vboBufferUint[base+3], this.vboGlTextures[i], this.vboViewCores[i]);
            // }

            if (this._filterQuadMode) {
                this._filterQuadModeParamsBuffered = true;
            }
        }
    }

    setShader(shader, owner = null) {
        this._newShader = shader
        this._newShaderOwner = owner
    }

    _setShader(shader, owner = null) {

        if (shader.useDefault()) {
            // We can just use the default shader, which is probably faster and limits the amount of shader changes.
            shader = this.defaultShader;
            owner = null;
        }

        if (this.shader === shader && this._shaderOwner === owner) {
            return;
        }

        // Draw currently pending.
        this.flushQuads();

        if (this.shader && (this.shader.constructor === shader.constructor)) {
            // We keep using the same shader, so we are already using the same program.
        } else {
            if (this.shader) this.shader.stopProgram();
            shader.useProgram();
        }

        shader.setup();

        this.shader = shader;
        this.shaderOwner = owner;
    }

    _commitShader() {
        if (this._newShader) {
            this._setShader(this._newShader, this._newShaderOwner)
        }
    }


    drawFilterQuad(shader, sourceTexture, viewCore, targetTexture, clear = true) {
        this.flushQuads();
        this.setShader(shader, viewCore);
        this._commitShader();
        this.setRenderTarget(targetTexture);
        this._commitRenderTarget();
        if (clear) this.clearRenderTarget();
        this.setFilterQuadMode(sourceTexture, viewCore);
        shader.prepareFilterQuad();
        shader._draw();
        this.restoreRenderTarget();
    }

    _drawQuads() {
        // We must commit the shader on addVbo only, because that's when it should matter.
        if (this.shader && this.length) {
            this._commitRenderTarget()
            this.shader.prepareQuads();
            this.shader._draw();
        }
    }

    flushQuads() {
        if (!this._filterQuadMode) {

            // Flushes registered quads (only in quads mode, in filter mode the draw should be issued directly).
            this._drawQuads();
            this._clear();
        }
    }

    _clear() {
        this.vboIndex = 0;
        this.vboViewCores = [];
        this.vboGlTextures = [];
        this.vboParamsBufferBytesRemaining = VboContext.GL_PARAMSBUFFER_MEMORY;
        this._filterQuadMode = false;
    }

    get length() {
        return this.vboOffset;
    }

    renderDebugTextureAtlas() {
        this.setShader(this.defaultShader, null);
        this._commitShader();

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
        this.vboViewCores.push(null);
        this.vboIndex += 16;

        this.flushQuads();
    }


    getView(vboOffset) {
        return this.vboViewCores[vboOffset]._view;
    }

    getViewCore(vboOffset) {
        return this.vboViewCores[vboOffset];
    }

    getVboGlTexture(vboOffset) {
        return this.vboGlTextures[vboOffset];
    }

    getTextureWidth(vboOffset = 0) {
        let glTexture = this.vboGlTextures[vboOffset]
        if (glTexture.w) {
            // Render texture
            return glTexture.w
        } else if (glTexture === this.textureAtlasGlTexture) {
            return 2048
        } else {
            return this.vboViewCores[vboOffset]._displayedTextureSource.w
        }
    }

    getTextureHeight(vboOffset = 0) {
        let glTexture = this.vboGlTextures[vboOffset]
        if (glTexture.h) {
            // Render texture
            return glTexture.h
        } else if (glTexture === this.textureAtlasGlTexture) {
            return 2048
        } else {
            return this.vboViewCores[vboOffset]._displayedTextureSource.h
        }
    }

    getShaderOwner() {
        return this.shaderOwner;
    }

    get gl() {
        return this.stage.gl;
    }

    get vboOffset() {
        return this.vboIndex / 16;
    }

    setRenderTarget(glTexture) {
        this._renderTargetStack.push(this._newRenderTarget)
        this._newRenderTarget = glTexture;
        this._setRenderTarget(this._newRenderTarget)
    }

    getRenderTarget() {
        return this._newRenderTarget
    }

    restoreRenderTarget() {
        this._newRenderTarget = this._renderTargetStack.pop();
    }

    _commitRenderTarget() {
        this._setRenderTarget(this._newRenderTarget)
    }

    _setRenderTarget(glTexture) {
        if (this._renderTarget === glTexture) return

        this._renderTarget = glTexture

        let gl = this.stage.gl;
        if (!this._renderTarget) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null)
            gl.viewport(0,0,this.stage.options.w,this.stage.options.h)
        } else {
            gl.bindFramebuffer(gl.FRAMEBUFFER, this._renderTarget.framebuffer)
            gl.viewport(0,0,this._renderTarget.w, this._renderTarget.h)
        }
    }

    clearRenderTarget() {
        let gl = this.stage.gl;

        this._commitRenderTarget();

        // Clear texture.
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }


    getProjectionMatrix() {
        if (this._filterQuadMode) {
            return this._identityProjectionMatrix;
        } else if (this._renderTarget) {
            return this._renderTarget.projectionMatrix;
        } else {
            return this._projectionMatrix;
        }
    }

    getViewportWidth() {
        if (this._renderTarget) {
            return this._renderTarget.w;
        } else {
            return this.getScreenWidth();
        }
    }

    getViewportHeight() {
        if (this._renderTarget) {
            return this._renderTarget.h;
        } else {
            return this.getScreenHeight();
        }
    }

    getScreenWidth() {
        return this.stage.options.w
    }

    getScreenHeight() {
        return this.stage.options.h
    }

    allocateRenderTexture(w, h) {
        for (let i = 0, n = this._availableRenderTextures.length; i < n; i++) {
            let texture = this._availableRenderTextures[i];
            if (texture.w === w && texture.h === h) {
                texture.f = this.stage.frameCounter;
                this._availableRenderTextures.splice(i, 1);
                return texture;
            }
        }

        let texture = this._createGlTexture(w, h);
        texture.f = this.stage.frameCounter;

        return texture;
    }

    releaseRenderTexture(texture) {
        this._availableRenderTextures.push(texture);
        texture.f = this.stage.frameCounter;
    }

    _freeUnusedRenderTextures() {
        // Clean up all textures that are no longer used.
        // This cache is short-lived because it is really just meant to supply running shaders and filters that are
        // updated during a number of frames.
        let limit = this.stage.frameCounter - 60;
        this._availableRenderTextures.filter(texture => {
            if (texture.f < limit) {
                this._freeGlTexture(texture);
                return false;
            }
            return true;
        });
    }

    _createGlTexture(w, h) {
        let gl = this.gl;

        let sourceTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, sourceTexture);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // We need a specific framebuffer for every render texture.
        sourceTexture.framebuffer = gl.createFramebuffer();
        sourceTexture.w = w;
        sourceTexture.h = h;
        sourceTexture.projectionMatrix = new Float32Array([
            2/w, 0, 0, 0,
            0, 2/h, 0, 0,
            0, 0, 1, 0,
            -1, -1, 0, 1
        ]);

        this.setRenderTarget(sourceTexture)
        this._commitRenderTarget()
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sourceTexture, 0);
        this.restoreRenderTarget()

        // We do not need to worry about restoring the framebuffer: we can rely on _commitRenderTarget to do this.
        return sourceTexture;
    }

    _freeGlTexture(glTexture) {
        let gl = this.stage.gl;
        gl.deleteFramebuffer(glTexture.framebuffer);
        gl.deleteTexture(glTexture);
    }


}

VboContext.GL_PARAMSBUFFER_MEMORY = 1000000;

module.exports = VboContext;

let View = require('./View');
