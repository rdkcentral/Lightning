/**
 * Copyright Metrological, 2017
 */

class CoreRenderExecutor {

    constructor(ctx) {
        this.ctx = ctx

        this.state = ctx._renderState

        this.gl = this.ctx.stage.gl

        this.init()
    }

    init() {
        let gl = this.gl;

        // Create new sharable buffer for params.
        this._attribsBuffer = gl.createBuffer();

        let maxQuads = Math.floor(this.ctx.renderState.quads.data.byteLength / 64);

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
        this._quadsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._quadsBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, allIndices, gl.STATIC_DRAW);

        // The matrix that causes the [0,0 - W,H] box to map to [-1,-1 - 1,1] in the end results.
        this._projectionMatrix = new Float32Array([
            2/this.ctx.stage.rw, 0, 0, 0,
            0, -2/this.ctx.stage.rw, 0, 0,
            0, 0, 1, 0,
            -1, 1, 0, 1
        ]);

    }

    destroy() {
        this.gl.deleteBuffer(this._attribsBuffer);
        this.gl.deleteBuffer(this._quadsBuffer);
    }

    _reset() {
        this._bindRenderTexture(null, true)

        this._quadOperation = null
        this._shader = null
        this._shaderOwner = null
    }

    _setupBuffers() {
        let gl = this.gl
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._quadsBuffer);
        let view = new DataView(this.renderState.quads.data, 0, this.renderState.quads.dataLength);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._attribsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, view, gl.DYNAMIC_DRAW);
    }

    execute() {
        this._reset()
        this._setupBuffers()


        // Call exec quad/filter operation in the correct order

        // Finally, run flushQuads.
    }

    _processQuadOperation(quadOperation) {
        this._quadOperation = quadOperation

        //@todo: check if quad operation can be merged or not.
        // if not, execute previous. If so, make sure that length is extended.

        this._quadOperation = null
    }

    _execQuadOperation() {
        // if (this._renderTexture !== op.renderTexture || op.clearRenderTexture) {
        //     this._bindRenderTexture(renderTexture, op.clearRenderTexture)
        // }

    }

    _processFilterOperation(quadOperation) {
        // Execute pending quad operation (if one).
        // Then execute filter.
    }

    _bindRenderTexture(renderTexture, clear) {
        this._renderTexture = renderTexture

        let gl = this.gl;
        if (!this._renderTexture) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null)
            gl.viewport(0,0,this.ctx.stage.w,this.ctx.stage.h)

            if (clear) {
                let glClearColor = this.ctx.stage.options.glClearColor;
                gl.clearColor(glClearColor[0], glClearColor[1], glClearColor[2], glClearColor[3]);
                gl.clear(gl.COLOR_BUFFER_BIT);
            }
        } else {
            gl.bindFramebuffer(gl.FRAMEBUFFER, this._renderTexture.framebuffer)
            gl.viewport(0,0,this._renderTexture.w, this._renderTexture.h)

            if (clear) {
                // Clear texture.
                gl.clearColor(0, 0, 0, 0);
                gl.clear(gl.COLOR_BUFFER_BIT);
            }
        }
    }

    _getProjectionMatrix() {
        if (this._renderTexture === null) {
            return this._projectionMatrix
        } else {
            return this._renderTexture.projectionMatrix
        }
    }

    _flushQuads() {
        this._shader.enableExtraAttribs()
        this._shader.beforeDraw()
        if (this._shaderOwner.hasCustomDraw()) {
            this._shader.draw()
        } else {
            this._drawQuads()
        }
        this._shader.afterDraw()
        this._shader.disableExtraAttribs()
    }

    _drawQuads() {
        //check current operation, get length, invoke drawElements.
    }

}

module.exports = CoreRenderExecutor
