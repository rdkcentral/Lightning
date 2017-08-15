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

        let qops = this.state.quadOperations
        let fops = this.state.filterOperations

        let i = 0, j = 0, n = qops.length, m = fops.length
        while (i < n) {
            while (j < m && i === fops[j].beforeQuadOperation) {
                if (this._quadOperation) {
                    this._execQuadOperation(this._quadOperation)
                }
                this._execFilterOperation(fops[j])
                j++
            }

            this._processQuadOperation(qops[i])
            i++
        }

        if (this._quadOperation) {
            this._execQuadOperation()
        }

        while (j < m) {
            this._execFilterOperation(fops[j])
            j++
        }
    }

    _mergeQuadOperation(quadOperation) {
        if (!this._quadOperation) {
            this._quadOperation.length += quadOperation.length

            // We remove the shader owner, because the shader should not rely on it.
            this._quadOperation.shaderOwner = null
        }
    }

    _processQuadOperation(quadOperation) {
        // Check if quad operation can be merged; uniforms are set lazily in the process.
        let shader = quadOperation.shader
        if (shader.hasSameType(this._quadOperation.shader)) {
            shader.setupUniforms(quadOperation)
            if (shader.hasUniformUpdates()) {
                this._execQuadOperation()
                this._quadOperation = quadOperation
            } else {
                this._mergeQuadOperation(quadOperation)
            }
        } else {
            if (this._quadOperation.shader === shader) {
                this._mergeQuadOperation(quadOperation)
            } else {
                this._execQuadOperation()
                shader.setupUniforms(quadOperation)
                this._quadOperation = quadOperation
            }
        }
    }

    _execQuadOperation() {
        let op = this._quadOperation

        let shader = op.shader

        if (this._shader !== shader) {
            shader.useProgram()
            shader.enableAttribs()
            this._shader = shader
        }

        // Set the prepared updates.
        shader.commitUniformUpdates()

        // Set render texture.
        if (this._renderTexture !== op.renderTexture || op.clearRenderTexture) {
            this._bindRenderTexture(op.renderTexture, op.clearRenderTexture)
        }

        shader.beforeDraw()
        if (shader.hasCustomDraw()) {
            shader.draw()
        } else {
            this._drawQuads()
        }
        shader.afterDraw()

        this._quadOperation = null
    }

    _execFilterOperation(filterOperation) {
        let filter = filterOperation.filter
        filter.useProgram()
        filter.setupUniforms(filterOperation)
        filter.commitUniformUpdates()
        filter.beforeDraw()
        this._bindRenderTexture(filterOperation.renderTexture, true)

        let gl = this.gl
        gl.bindTexture(gl.TEXTURE_2D, filterOperation.source);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

        filter.afterDraw()
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

    _drawQuads() {
        //check current operation, get length, invoke drawElements.
    }

}

module.exports = CoreRenderExecutor
