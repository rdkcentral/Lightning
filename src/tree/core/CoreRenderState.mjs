/**
 * Copyright Metrological, 2017;
 */

export default class CoreRenderState {

    constructor(ctx) {
        this.ctx = ctx;

        this.stage = ctx.stage;

        // Allocate a fairly big chunk of memory that should be enough to support ~100000 (default) quads.
        // We do not (want to) handle memory overflow.

        // We could optimize memory usage by increasing the ArrayBuffer gradually.
        this.quads = new CoreQuadList(ctx, ctx.stage.getOption('bufferMemory'));

        this.defaultShader = new Shader(this.ctx);
    }

    reset() {
        this._renderTextureInfo = null;

        this._scissor = null;

        /**
         * @type {Shader}
         */
        this._shader = null;

        this._shaderOwner = null;

        this._realShader = null;

        this._check = false;

        this.quadOperations = [];
        this.filterOperations = [];

        this._overrideQuadTexture = null;

        this._quadOperation = null;

        this.quads.reset();

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

    setOverrideQuadTexture(texture) {
        this._overrideQuadTexture = texture;
    }

    addQuad(viewCore) {
        if (!this._quadOperation) {
            this._createQuadOperation();
        } else if (this._check && this._hasChanges()) {
            this._addQuadOperation();
            this._check = false;
        }

        let nativeTexture = this._overrideQuadTexture;
        if (!nativeTexture) {
            nativeTexture = viewCore._displayedTextureSource.nativeTexture;
        }

        let offset = this.length * 64 + 64 // Skip the identity filter quad.

        if (this._renderTextureInfo) {
            if (this._shader === this.defaultShader && this._renderTextureInfo.empty) {
                // The texture might be reusable under some conditions. We will check them in ViewCore.renderer.
                this._renderTextureInfo.nativeTexture = nativeTexture;
                this._renderTextureInfo.offset = offset;
            } else {
                // It is not possible to reuse another texture when there is more than one quad.
                this._renderTextureInfo.nativeTexture = null;
            }
            this._renderTextureInfo.empty = false;
        }

        this.quads.quadTextures.push(nativeTexture);
        this.quads.quadViews.push(viewCore);

        this._quadOperation.length++;

        return offset;
    }

    finishedRenderTexture() {
        if (this._renderTextureInfo.nativeTexture) {
            // There was only one texture drawn in this render texture.
            // Check if we can reuse it (it should exactly span this render texture).
            let floats = this.quads.floats;
            let uints = this.quads.uints;
            let offset = this._renderTextureInfo.offset / 4;
            let reuse = ((floats[offset] === 0) &&
            (floats[offset + 1] === 0) &&
            (uints[offset + 2] === 0x00000000) &&
            (uints[offset + 3] === 0xFFFFFFFF) &&
            (floats[offset + 4] === this._renderTextureInfo.w) &&
            (floats[offset + 5] === 0) &&
            (uints[offset + 6] === 0x0000FFFF) &&
            (uints[offset + 7] === 0xFFFFFFFF) &&
            (floats[offset + 8] === this._renderTextureInfo.w) &&
            (floats[offset + 9] === this._renderTextureInfo.h) &&
            (uints[offset + 10] === 0xFFFFFFFF) &&
            (uints[offset + 11] === 0xFFFFFFFF) &&
            (floats[offset + 12] === 0) &&
            (floats[offset + 13] === this._renderTextureInfo.h) &&
            (uints[offset + 14] === 0xFFFF0000) &&
            (uints[offset + 15] === 0xFFFFFFFF));
            if (!reuse) {
                // We'll have to render-to-texture.
                this._renderTextureInfo.nativeTexture = null;
            }
        }
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

    _addQuadOperation(create = true) {
        if (this._quadOperation) {
            if (this._quadOperation.length || this._shader.addEmpty()) {
                if (!this._quadOperation.scissor || ((this._quadOperation.scissor[2] > 0) && (this._quadOperation.scissor[3] > 0))) {
                    // Ignore empty clipping regions.
                    this.quadOperations.push(this._quadOperation);
                }
            }

            this._quadOperation = null;
        }

        if (create) {
            this._createQuadOperation();
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
        );
        this._check = false;
    }

    addFilter(filter, owner, source, target) {
        // Close current quad operation.
        this._addQuadOperation(false);

        this.filterOperations.push(new CoreFilterOperation(this.ctx, filter, owner, source, target, this.quadOperations.length));
    }

    finish() {
        if (this._quadOperation) {
            // Add remaining.
            this._addQuadOperation(false);
        }

        this._setExtraShaderAttribs();
    }

    _setExtraShaderAttribs() {
        let offset = this.length * 64 + 64;
        for (let i = 0, n = this.quadOperations.length; i < n; i++) {
            this.quadOperations[i].extraAttribsDataByteOffset = offset;
            let extra = this.quadOperations[i].shader.getExtraAttribBytesPerVertex() * 4 * this.quadOperations[i].length;
            offset += extra;
            if (extra) {
                this.quadOperations[i].shader.setExtraAttribsInBuffer(this.quadOperations[i], this.quads);
            }
        }
        this.quads.dataLength = offset;
    }

}

import CoreQuadOperation from "./CoreQuadOperation.mjs";
import CoreQuadList from "./CoreQuadList.mjs";
import CoreFilterOperation from "./CoreFilterOperation.mjs";
import Shader from "../Shader.mjs";
