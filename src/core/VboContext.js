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

        this.vboViewRenderers = [];
        this.vboGlTextures = [];

        this.vboParamsBufferBytesRemaining = VboContext.GL_PARAMSBUFFER_MEMORY;

        // Current shader info.
        this.shader = null;

        // The view renderer that the current shader was defined on (if available).
        this.shaderOwner = null;

        this.bytesPerQuad = 64;

        this.n = 0;

        this.updateTreeOrder = 0;
        this.updateTreeOrderForceUpdate = 0;

        this._initialisedShaders = new Set();

        this._renderTargetStack = [];

        this._renderTarget = null;

        this._overrideGlTexture = null;

        // Used for renderAsTexture in the update/render loop to disable the world clipping context (and temporarily create a new one)
        this.ignoredClippingParent = null;

        this._availableGlTextures = [];

        let DefaultShader = require('./DefaultShader');
        this.defaultShader = new DefaultShader(this);
        this.initShader(this.defaultShader);

        this.initSharedShaderData();

        this._filterQuadMode = false;
    }

    destroy() {
        this.gl.deleteBuffer(this.paramsGlBuffer);
        this.gl.deleteBuffer(this.quadsGlBuffer);
        this._initialisedShaders.forEach(shader => this._freeShader(shader));
        this._availableGlTextures.forEach(texture => this._freeGlTexture(texture));
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

    setFilterQuadMode(sourceTexture, viewRenderer) {
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
            this.vboViewRenderers = [];
            this.vboGlTextures = [];
            this._filterQuadModeParamsBuffered = false;
        }
        this.vboViewRenderers[0] = viewRenderer;
        this.vboGlTextures[0] = sourceTexture;
        this._filterQuadMode = true;
    }

    reset() {
        this.vboIndex = 0;
        this.vboViewRenderers = [];
        this.vboGlTextures = [];
        this.textureAtlasGlTexture = this.stage.textureAtlas ? this.stage.textureAtlas.texture : null;
        this.n = 0;
        this.updateTreeOrder = 0;

        this.shader = null;
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

        this.reset();

        this.root.update();

        this.resetGl();

        this.root.render();

        this.flush();

        if (this.stage.textureAtlas && this.stage.options.debugTextureAtlas) {
            this.renderDebugTextureAtlas();
        }

        // Clear flag to identify if anything changes before the next frame.
        this.root._parent._hasRenderUpdates = false;

        this._freeUnusedGlTextures();

        this._freeUnusedShaders();

        return true;
    }

    /**
     * Specifically for renderAsTexture rendering.
     * @param texture
     */
    overrideAddVboTexture(texture) {
        this._overrideGlTexture = texture;
    }

    addVbo(viewRenderer) {
        let glTexture = this._overrideGlTexture;
        if (!glTexture) {
            let textureSource = viewRenderer._displayedTextureSource;
            glTexture = textureSource.inTextureAtlas ? this.textureAtlasGlTexture : textureSource.glTexture;
        }

        this.vboGlTextures.push(glTexture);
        this.vboViewRenderers.push(viewRenderer);

        this.vboIndex += 16;

        this.vboParamsBufferBytesRemaining -= this.shader.getBytesPerVertex() * 4;

        if (this.vboParamsBufferBytesRemaining < 1000) {
            this.flush();
        }
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
        if (this._filterQuadMode && this._filterQuadModeParamsBuffered && size === 16) {
            // Params already buffered in memory.
        } else {
            let view = new DataView(this.vboParamsBuffer, 0, size);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, view, this.gl.DYNAMIC_DRAW);
            if (this._filterQuadMode) {
                this._filterQuadModeParamsBuffered = true;
            }
        }
    }

    setViewShader(viewRenderer) {
        let shader = viewRenderer.activeShader;
        let owner = viewRenderer.activeShaderOwner;
        if (shader.drawsAsDefault()) {
            // We can just use the default shader, which is probably faster and limits the amount of shader changes.
            shader = this.defaultShader;
            owner = null;
        }

        this.setShader(shader, owner);
    }

    setShader(shader, owner = null) {
        if (this.shader === shader) {
            return;
        }

        // Draw currently pending.
        this.flush();

        if (this.shader && (this.shader.constructor === shader.constructor)) {
            // We keep using the same shader, so we don't need to setup program.
        } else {
            if (this.shader) this.shader.stopProgram();
            shader.useProgram();
        }

        this.shader = shader;
        this.shaderOwner = owner;
    }

    flush() {
        this.drawQuads();
        this.clear();
    }

    clear() {
        this.vboIndex = 0;
        this.vboViewRenderers = [];
        this.vboGlTextures = [];
        this.vboParamsBufferBytesRemaining = VboContext.GL_PARAMSBUFFER_MEMORY;
        this._filterQuadMode = false;
    }

    get length() {
        return this.vboOffset;
    }

    drawQuads() {
        if (this.shader && this.length) {
            this.shader.drawQuads();
        }
    }

    renderDebugTextureAtlas() {
        this.setShader(this.defaultShader, null);

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
        this.vboViewRenderers.push(null);
        this.vboIndex += 16;

        this.flush();
    }


    getView(vboOffset) {
        return this.vboViewRenderers[vboOffset]._view;
    }

    getViewRenderer(vboOffset) {
        return this.vboViewRenderers[vboOffset];
    }

    getVboGlTexture(vboOffset) {
        return this.vboGlTextures[vboOffset];
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
        this._renderTargetStack.push(this._renderTarget)
        this._setRenderTarget(glTexture)
    }

    restoreRenderTarget() {
        this._setRenderTarget(this._renderTargetStack.pop());
    }

    _setRenderTarget(v) {
        let gl = this.stage.gl;

        this._renderTarget = v

        if (!v) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null)
            gl.viewport(0,0,this.stage.options.w,this.stage.options.h)
        } else {
            gl.bindFramebuffer(gl.FRAMEBUFFER, this._renderTarget.framebuffer)
            gl.viewport(0,0,this._renderTarget.w, this._renderTarget.h)

            // Clear texture.
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
        }
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
            return this.stage.options.w;
        }
    }

    getViewportHeight() {
        if (this._renderTarget) {
            return this._renderTarget.h;
        } else {
            return this.stage.options.h;
        }
    }

    initShader(shader) {
        shader._init(this);
        this._initialisedShaders.add(shader);
    }

    _freeShader(shader) {
        shader._free();
        this._initialisedShaders.delete(shader);
    }

    _freeUnusedShaders() {
        this._initialisedShaders.forEach(shader => {
            shader.checkUsers();
            if (!shader.hasUsers() && shader !== this.defaultShader) {
                this._initialisedShaders.delete(shader);
            }
        });
    }

    createGlTexture(w, h, allocate) {
        for (let i = 0, n = this._availableGlTextures.length; i < n; i++) {
            let texture = this._availableGlTextures[i];
            if (texture.w === w && texture.h === h) {
                texture.f = this.stage.frameCounter;
                if (allocate) {
                    this._availableGlTextures.splice(i, 1);
                }
                return texture;
            }
        }

        let texture = this._createGlTexture(w, h);
        texture.f = this.stage.frameCounter;
        if (!allocate) {
            this._availableGlTextures.push(texture);
        }
        return texture;
    }

    releaseGlTexture(texture) {
        this._availableGlTextures.push(texture);
        texture.f = this.stage.frameCounter;
    }

    _freeUnusedGlTextures() {
        // Clean up all textures that are no longer used.
        // This cache is short-lived because it is really just mean to supply running shaders and filters.
        let limit = this.stage.frameCounter - 60;
        this._availableGlTextures.filter(texture => {
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
        sourceTexture.w = w;
        sourceTexture.h = h;
        sourceTexture.framebuffer = gl.createFramebuffer();
        sourceTexture.projectionMatrix = new Float32Array([
            2/w, 0, 0, 0,
            0, 2/h, 0, 0,
            0, 0, 1, 0,
            -1, -1, 0, 1
        ]);

        gl.bindFramebuffer(gl.FRAMEBUFFER, sourceTexture.framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sourceTexture, 0);

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
