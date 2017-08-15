/**
 * Copyright Metrological, 2017
 */

class CoreRenderState {

    constructor(ctx) {
        this.ctx = ctx

        this.stage = ctx.stage

        this.textureAtlasGlTexture = this.stage.textureAtlas ? this.stage.textureAtlas.texture : null;

        // Allocate a fairly big chunk of memory that should be enough to support ~100000 quads.
        // We do not handle memory overflow.
        this.quads = new CoreQuadList(ctx, 8e6)

        let DefaultShader = require('../DefaultShader')
        this.defaultShader = new DefaultShader(this)
    }

    reset() {
        this._renderTexture = null
        this._clearRenderTexture = false

        this._renderTextureStack = []

        /**
         * @type {Shader}
         */
        this._shader = null
        
        this._shaderOwner = null

        this._check = false
        this._forceChange = false

        this.quadOperations = []
        this.filterOperations = []

        this._overrideQuadTexture = null

        this._quadOperation = null

        // Total number of quads.
        this.length = 0
    }

    setShader(shader, owner) {
        if (shader.useDefault()) {
            // Use the default shader when possible to prevent unnecessary program changes.
            shader = this.defaultShader
        }
        this._shader = shader
        this._shaderOwner = owner
        this._check = true
    }

    setRenderTexture(renderTexture, clear = false) {
        this._renderTextureStack.push(this._renderTarget)

        this._renderTexture = renderTexture
        this._clearRenderTexture = clear
        this._check = true

        if (clear) {
            this._forceChange = true
        }
    }

    restoreRenderTexture() {
        this._renderTexture = this._renderTextureStack.pop();
    }

    overrideQuadTexture(texture) {
        this._overrideQuadTexture = texture
    }

    addQuad(viewCore) {
        if (!this._quadOperation) {
            this._createQuadOperation()
        } else if (this._check && this._hasChanges()) {
            this._addQuadOperation()
            this._check = false
        }

        let glTexture = this._overrideQuadTexture;
        if (!glTexture) {
            let textureSource = viewCore._displayedTextureSource;
            glTexture = textureSource.inTextureAtlas ? this.textureAtlasGlTexture : textureSource.glTexture;
        }
        
        this.quads.quadTextures.push(glTexture)
        this.quads.quadViews.push(viewCore)

        let offset = this.length * 64
        
        this.length++
        this._quadOperation.length++

        return offset + 64 // Skip the identity filter quad.
    }

    _hasChanges() {
        if (this._forceChange) return true

        let q = this._quadOperation
        if (this._shader !== q.shader) return true
        if (this._shaderOwner !== q.shaderOwner) return true
        if (this._renderTexture !== q.renderTexture) return true

        return false
    }
    
    _addQuadOperation() {
        if (this._quadOperation.length || this._shader.hasCustomDraw()) {
            this.quadOperations.push(this._quadOperation)
        }
        this._createQuadOperation()
    }
    
    _createQuadOperation() {
        this._quadOperation = new CoreQuadOperation(
            this.quads,
            this._shader,
            this._shaderOwner,
            this._renderTexture,
            this._clearRenderTexture,
            this.length
        )
        this._check = false
    }

    addFilter(filter, source, renderTexture) {
        this.filterOperations.push(new CoreFilterOperation(filter, source, renderTexture, this.quadOperations.length))
    }

    finish() {
        if (this.ctx.stage.textureAtlas && this.ctx.stage.options.debugTextureAtlas) {
            this._renderDebugTextureAtlas()
        }

        if (this._quadOperation) {
            // Add remaining.
            this._addQuadOperation()
        }

        this._setExtraShaderAttribs()
    }
    
    _renderDebugTextureAtlas() {
        this.setShader(this.ctx.defaultShader, this.ctx.root)
        this.setRenderTexture(null)
        this.overrideQuadTexture(this.ctx.textureAtlasGlTexture)
        
        let offset = this.addQuad(this.ctx.root) / 4
        let f = this.quads.floats
        let u = this.quads.uints
        f[offset++] = 0;
        f[offset++] = 0;
        u[offset++] = 0x00000000;
        u[offset++] = 0xFFFFFFFF;
        f[offset++] = size;
        f[offset++] = 0;
        u[offset++] = 0x0000FFFF;
        u[offset++] = 0xFFFFFFFF;
        f[offset++] = size;
        f[offset++] = size;
        u[offset++] = 0xFFFFFFFF;
        u[offset++] = 0xFFFFFFFF;
        f[offset++] = 0;
        f[offset++] = size;
        u[offset++] = 0xFFFF0000;
        u[offset] = 0xFFFFFFFF;

        this.overrideQuadTexture(null)
    }
    
    _setExtraShaderAttribs() {
        let offset = this.quadOperations.length * 64 + 64
        for (let i = 0, n = this.quadOperations.length; i < n; i++) {
            this.quadOperations[i].extraAttribsDataByteOffset = offset;
            let extra = this.quadOperations[i].shader.getExtraBytesPerVertex() * 4
            offset += extra
            if (extra) {
                this.quadOperations[i].shader.setExtraAttribsInBuffer(this.quadOperations[i], this.quads)
            }
        }
        this.quads.bytesUsed = offset
    }

}


module.exports = CoreRenderState

let CoreQuadOperation = require('./CoreQuadOperation')
let CoreQuadList = require('./CoreQuadList')
let CoreFilterOperation = require('./CoreFilterOperation')