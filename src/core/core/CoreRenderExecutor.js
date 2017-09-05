/**
 * Copyright Metrological, 2017
 */

class CoreRenderExecutor {

    constructor(ctx) {
        this.ctx = ctx

        this.renderState = ctx.renderState

        this.gl = this.ctx.stage.gl

        this.init()
    }

    init() {
        let gl = this.gl;

        // Create new sharable buffer for params.
        this._attribsBuffer = gl.createBuffer();

        let maxQuads = Math.floor(this.renderState.quads.data.byteLength / 64);

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
        this._projection = new Float32Array([2/this.ctx.stage.rw, -2/this.ctx.stage.rh])

    }

    destroy() {
        this.gl.deleteBuffer(this._attribsBuffer);
        this.gl.deleteBuffer(this._quadsBuffer);
    }

    _reset() {
        this._bindRenderTexture(null, true)

        // Set up default settings. Shaders should, after drawing, reset these properly.
        let gl = this.gl
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);

        this._quadOperation = null
        this._currentShaderProgramOwner = null
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

        let qops = this.renderState.quadOperations
        let fops = this.renderState.filterOperations

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

        this._stopShaderProgram()
    }

    _mergeQuadOperation(quadOperation) {
        if (this._quadOperation) {
            this._quadOperation.length += quadOperation.length

            // We remove the shader owner, because the shader should not rely on it.
            this._quadOperation.shaderOwner = null
        }
    }

    _processQuadOperation(quadOperation) {
        // Check if quad operation can be merged; uniforms are set lazily in the process.
        let shader = quadOperation.shader

        let merged = false
        if (this._quadOperation && (this._quadOperation.renderTexture === quadOperation.renderTexture) && this._quadOperation.shader.supportsMerging() && quadOperation.shader.supportsMerging()) {
            if (this._quadOperation.shader === shader) {
                this._mergeQuadOperation(quadOperation)
                merged = true
            } else if (shader.hasSameProgram(this._quadOperation.shader)) {
                shader.setupUniforms(quadOperation)
                if (shader.isMergable(this._quadOperation.shader)) {
                    this._mergeQuadOperation(quadOperation)
                    merged = true
                }
            }
        }

        if (!merged) {
            if (this._quadOperation) {
                this._execQuadOperation()
            }

            shader.setupUniforms(quadOperation)
            this._quadOperation = quadOperation
        }
    }

    _execQuadOperation() {
        let op = this._quadOperation

        let shader = op.shader

        // Set render texture.
        if (this._renderTexture !== op.renderTexture || op.clearRenderTexture) {
            this._bindRenderTexture(op.renderTexture, op.clearRenderTexture)
        }

        if (op.length || shader.addEmpty()) {
            this._useShaderProgram(shader)

            // Set the prepared updates.
            shader.commitUniformUpdates()

            shader.beforeDraw(op)
            shader.draw(op)
            shader.afterDraw(op)
        }

        this._quadOperation = null
    }

    _execFilterOperation(filterOperation) {
        let filter = filterOperation.filter
        this._useShaderProgram(filter)
        filter.setupUniforms(filterOperation)
        filter.commitUniformUpdates()
        filter.beforeDraw(filterOperation)
        this._bindRenderTexture(filterOperation.renderTexture, true)
        filter.draw(filterOperation)
        filter.afterDraw(filterOperation)
    }

    /**
     * @param {Filter|Shader} owner
     */
    _useShaderProgram(owner) {
        if (!owner.hasSameProgram(this._currentShaderProgramOwner)) {
            if (this._currentShaderProgramOwner) {
                this._currentShaderProgramOwner.stopProgram()
            }
            owner.useProgram()
            this._currentShaderProgramOwner = owner
        }
    }

    _stopShaderProgram() {
        if (this._currentShaderProgramOwner) {
            // The currently used shader program should be stopped gracefully.
            this._currentShaderProgramOwner.stopProgram()
            this._currentShaderProgramOwner = null
        }
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

}

module.exports = CoreRenderExecutor
