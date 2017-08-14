/**
 * Copyright Metrological, 2017
 */

class CoreRenderState {

    constructor(ctx) {
        this.ctx = ctx

        this.stage = ctx.stage

        this.textureAtlasGlTexture = this.stage.textureAtlas ? this.stage.textureAtlas.texture : null;

        this.quads = new CoreQuadList(ctx)

        let DefaultShader = require('../DefaultShader');
        this.defaultShader = new DefaultShader(this);

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

    _addQuad(viewCore) {
        if (!this._quadOperation) {
            this._createQuadOperation()
        }

        if (this._check && this._hasChanges()) {
            this._addQuadOperation();
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

        return offset
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
            this._shader,
            this._shaderOwner,
            this._renderTexture,
            this._clearRenderTexture
        )
        this._check = false
    }
    
    filter(filter, source, renderTexture) {
        this.filterOperations.push(new CoreFilterOperation(filter, source, renderTexture, this.quadOperations.length))
    }

    finish() {
        if (this.ctx.stage.textureAtlas && this.ctx.stage.options.debugTextureAtlas) {
            this._renderDebugTextureAtlas()
        }

        if (this._quadOperation) {
            this._addQuadOperation()
        }

        this._setExtraShaderAttribOffsets()
        this._setExtraShaderAttribs()
    }
    
    _renderDebugTextureAtlas() {
        this.setShader(this.ctx.defaultShader, this.ctx.root)
        this.setRenderTexture(null)
        this.overrideQuadTexture(this.ctx.textureAtlasGlTexture)
        
        let offset = this._addQuad(this.ctx.root) / 4
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
    
    _setExtraShaderAttribOffsets() {
        //@todo: calculate offsets.
    }

    _setExtraShaderAttribs() {
        //@todo: call Shader.setExtraAttribsInBuffer(options)
    }
}


module.exports = CoreRenderState

let CoreQuadOperation = require('./CoreQuadOperation')
let CoreQuadList = require('./CoreQuadList')
let CoreFilterOperation = require('./CoreFilterOperation')