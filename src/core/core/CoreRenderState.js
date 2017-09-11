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
        this.defaultShader = new Shader(this.ctx);
    }

    reset() {
        this._renderTextureInfo = null

        this._scissor = null

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

        this.quads.reset()

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

    get renderTextureInfo() {
        return this._renderTextureInfo
    }

    setScissor(area) {
        if (area) {
            if (this._scissor) {
                // Merge scissor areas.
                let sx = Math.max(area[0], this._scissor[0])
                let sy = Math.max(area[1], this._scissor[1])
                let ex = Math.min(area[0] + area[2], this._scissor[0] + this._scissor[2])
                let ey = Math.min(area[1] + area[3], this._scissor[1] + this._scissor[3])
                this._scissor = [sx, sy, ex - sx, ey - sy]
            } else {
                this._scissor = area
            }
        } else {
            this._scissor = null
        }
        this._check = true
    }

    getScissor() {
        return this._scissor
    }

    setRenderTextureInfo(renderTextureInfo) {
        if (this._renderTextureInfo !== renderTextureInfo) {
            this._renderTextureInfo = renderTextureInfo
            this._scissor = null
            this._check = true
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
            if (viewCore.inTextureAtlas) {
                glTexture = this.textureAtlasGlTexture
            } else {
                glTexture = viewCore._displayedTextureSource.glTexture
            }
        }

        let offset = this.length * 64 + 64 // Skip the identity filter quad.

        if (this._renderTextureInfo) {
            if (this._shader === this.defaultShader && this._renderTextureInfo.empty && (this._renderTextureInfo.w === glTexture.w && this._renderTextureInfo.h === glTexture.h)) {
                // The texture might be reusable under some conditions. We will check them in ViewCore.renderer.
                this._renderTextureInfo.glTexture = glTexture
                this._renderTextureInfo.offset = offset
            } else {
                // It is not possible to reuse another texture when there is more than one quad.
                this._renderTextureInfo.glTexture = null
            }
            this._renderTextureInfo.empty = false
        }

        this.quads.quadTextures.push(glTexture)
        this.quads.quadViews.push(viewCore)

        this._quadOperation.length++

        return offset
    }

    _hasChanges() {
        let q = this._quadOperation
        if (this._shader !== q.shader) return true
        if (this._shaderOwner !== q.shaderOwner) return true
        if (this._renderTextureInfo !== q.renderTextureInfo) return true
        if (this._scissor !== q.scissor) return true

        return false
    }
    
    _addQuadOperation(create = true) {
        if (this._quadOperation) {
            if (this._quadOperation.length || this._shader.addEmpty()) {
                this.quadOperations.push(this._quadOperation)
            }

            this._quadOperation = null
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
            this._renderTextureInfo,
            this._scissor,
            this.length
        )
        this._check = false
    }

    addFilter(filter, owner, source, target) {
        // Close current quad operation.
        this._addQuadOperation(false)

        this.filterOperations.push(new CoreFilterOperation(this.ctx, filter, owner, source, target, this.quadOperations.length))
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
        this.setShader(this.defaultShader, this.ctx.root)
        this.setRenderTextureInfo(null)
        this.setOverrideQuadTexture(this.textureAtlasGlTexture)

        let size = Math.min(this.ctx.stage.w, this.ctx.stage.h)

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
            let extra = this.quadOperations[i].shader.getExtraAttribBytesPerVertex() * 4 * this.quadOperations[i].length
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