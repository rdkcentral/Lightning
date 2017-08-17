/**
 * Copyright Metrological, 2017
 */

class CoreRenderState {

    constructor(ctx) {
        this.ctx = ctx

        this.stage = ctx.stage

        this.textureAtlasGlTexture = this.stage.textureAtlas ? this.stage.textureAtlas.texture : null;

        // Allocate a fairly big chunk of memory that should be enough to support ~100000 (default) quads.
        // We do not (want to) handle memory overflow.

        // We could optimize memory usage by increasing the ArrayBuffer gradually.
        this.quads = new CoreQuadList(ctx, 8e6)

        let Shader = require('../Shader');
        this.defaultShader = new Shader(this);
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

        this.quadOperations = []
        this.filterOperations = []

        this._overrideQuadTexture = null

        this._quadOperation = null

    }

    get length() {
        return this.quads.quadTextures.length
    }

    setShader(shader, owner) {
        if (this._shaderOwner === owner && this._realShader === shader) {
            // Same shader owner: active shader is also the same.
            // Prevent any shader usage to save performance.
            return
        }

        if (shader.useDefault()) {
            // Use the default shader when possible to prevent unnecessary program changes.
            this._realShader = shader
            shader = this.defaultShader
        }
        if (this._shader !== shader || this._shaderOwner !== owner) {
            this._shader = shader
            this._shaderOwner = owner
            this._check = true
        }
    }

    setRenderTexture(renderTexture, clear = false) {
        this._renderTextureStack.push(this._renderTexture)

        this._setRenderTexture(renderTexture, clear)
    }

    restoreRenderTexture() {
        this.setRenderTexture(this._renderTextureStack.pop(), false);
    }

    _setRenderTexture(renderTexture, clear = false) {
        if (this._renderTexture !== renderTexture || clear) {
            this._renderTexture = renderTexture
            this._clearRenderTexture = clear

            if (clear) {
                // We must close off the current quad operation and then add a new one,
                // to make sure that (even if there are no quads) the 'clear render texture'
                // is added in an empty quad operation.
                this._addQuadOperation()
            } else {
                this._check = true
            }
        }
    }

    setOverrideQuadTexture(texture) {
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

        let offset = this.length * 64 + 64 // Skip the identity filter quad.

        this.quads.quadTextures.push(glTexture)
        this.quads.quadViews.push(viewCore)

        this._quadOperation.length++

        return offset
    }

    _hasChanges() {
        let q = this._quadOperation
        if (this._shader !== q.shader) return true
        if (this._shaderOwner !== q.shaderOwner) return true
        if (this._renderTexture !== q.renderTexture) return true

        return false
    }
    
    _addQuadOperation(create = true) {
        if (this._quadOperation) {
            if (this._clearRenderTexture || this._quadOperation.length || this._shader.addEmpty()) {
                this.quadOperations.push(this._quadOperation)
            }
        }
        if (create) {
            this._createQuadOperation()
        }
    }

    _createQuadOperation() {
        this._quadOperation = new CoreQuadOperation(
            this.ctx,
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
            this._addQuadOperation(false)
        }

        this._setExtraShaderAttribs()
    }
    
    _renderDebugTextureAtlas() {
        this.setShader(this.ctx.defaultShader, this.ctx.root)
        this.setRenderTexture(null)
        this.setOverrideQuadTexture(this.ctx.textureAtlasGlTexture)
        
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

        this.setOverrideQuadTexture(null)
    }
    
    _setExtraShaderAttribs() {
        let offset = this.length * 64 + 64
        for (let i = 0, n = this.quadOperations.length; i < n; i++) {
            this.quadOperations[i].extraAttribsDataByteOffset = offset;
            let extra = this.quadOperations[i].shader.getExtraBytesPerVertex() * 4
            offset += extra
            if (extra) {
                this.quadOperations[i].shader.setExtraAttribsInBuffer(this.quadOperations[i], this.quads)
            }
        }
        this.quads.dataLength = offset
    }

}


module.exports = CoreRenderState

let CoreQuadOperation = require('./CoreQuadOperation')
let CoreQuadList = require('./CoreQuadList')
let CoreFilterOperation = require('./CoreFilterOperation')