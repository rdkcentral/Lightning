/**
 * Copyright Metrological, 2017;
 */

export default class CoreRenderExecutor {

    constructor(ctx) {
        this.ctx = ctx;

        this.renderState = ctx.renderState;

        this.gl = this.ctx.stage.gl;

        this.init();
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
        this._projection = new Float32Array([2/this.ctx.stage.rw, -2/this.ctx.stage.rh]);

    }

    destroy() {
        this.gl.deleteBuffer(this._attribsBuffer);
        this.gl.deleteBuffer(this._quadsBuffer);
    }

    _reset() {
        this._bindRenderTexture(null);
        this._setScissor(null);
        this._clearRenderTexture();

        // Set up default settings. Shaders should, after drawing, reset these properly.
        let gl = this.gl;
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);

        this._quadOperation = null;
    }

    _setupBuffers() {
        let gl = this.gl;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._quadsBuffer);
        let view = new DataView(this.renderState.quads.data, 0, this.renderState.quads.dataLength);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._attribsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, view, gl.DYNAMIC_DRAW);
    }

    execute() {
        this._reset();

        this._setupBuffers();

        let qops = this.renderState.quadOperations;
        let fops = this.renderState.filterOperations;

        let i = 0, j = 0, n = qops.length, m = fops.length;
        while (i < n) {
            while (j < m && i === fops[j].beforeQuadOperation) {
                if (this._quadOperation) {
                    this._execQuadOperation(this._quadOperation);
                }
                this._execFilterOperation(fops[j]);
                j++;
            }

            this._processQuadOperation(qops[i]);
            i++;
        }

        if (this._quadOperation) {
            this._execQuadOperation();
        }

        while (j < m) {
            this._execFilterOperation(fops[j]);
            j++;
        }
    }

    getQuadContents() {
        return this.renderState.quads.getQuadContents();
    }

    _processQuadOperation(quadOperation) {
        if (quadOperation.renderTextureInfo && quadOperation.renderTextureInfo.ignore) {
            // Ignore quad operations when we are 're-using' another texture as the render texture result.
            return;
        }

        if (this._quadOperation) {
            this._execQuadOperation();
        }

        let shader = quadOperation.shader;
        this._useShaderProgram(shader);
        shader.setupUniforms(quadOperation);

        this._quadOperation = quadOperation;
    }

    _execQuadOperation() {
        let op = this._quadOperation;

        let shader = op.shader;

        if (op.length || shader.addEmpty()) {
            // Set render texture.
            let glTexture = op.renderTextureInfo ? op.renderTextureInfo.glTexture : null;
            if (this._renderTexture !== glTexture) {
                this._bindRenderTexture(glTexture);
            }

            if (op.renderTextureInfo && !op.renderTextureInfo.cleared) {
                this._setScissor(null);
                this._clearRenderTexture();
                op.renderTextureInfo.cleared = true;
                this._setScissor(op.scissor);
            } else if (this._scissor !== op.scissor) {
                this._setScissor(op.scissor);
            }

            shader.beforeDraw(op);
            shader.draw(op);
            shader.afterDraw(op);
        }

        this._quadOperation = null;
    }

    _execFilterOperation(filterOperation) {
        let filter = filterOperation.filter;
        this._useShaderProgram(filter);
        filter.setupUniforms(filterOperation);
        filter.beforeDraw(filterOperation);
        this._bindRenderTexture(filterOperation.renderTexture);
        if (this._scissor) {
            this._setScissor(null);
        }
        this._clearRenderTexture();
        filter.draw(filterOperation);
        filter.afterDraw(filterOperation);
    }

    /**
     * @param {Filter|Shader} owner;
     */
    _useShaderProgram(owner) {
        if (!owner.hasSameProgram(this._currentShaderProgramOwner)) {
            if (this._currentShaderProgramOwner) {
                this._currentShaderProgramOwner.stopProgram();
            }
            owner.useProgram();
            this._currentShaderProgramOwner = owner;
        }
    }

    _stopShaderProgram() {
        if (this._currentShaderProgramOwner) {
            // The currently used shader program should be stopped gracefully.
            this._currentShaderProgramOwner.stopProgram();
            this._currentShaderProgramOwner = null;
        }
    }

    _bindRenderTexture(renderTexture) {
        this._renderTexture = renderTexture;

        let gl = this.gl;
        if (!this._renderTexture) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0,0,this.ctx.stage.w,this.ctx.stage.h);
        } else {
            gl.bindFramebuffer(gl.FRAMEBUFFER, this._renderTexture.framebuffer);
            gl.viewport(0,0,this._renderTexture.w, this._renderTexture.h);
        }
    }

    _clearRenderTexture() {
        let gl = this.gl;
        if (!this._renderTexture) {
            let glClearColor = this.ctx.stage.getOption('glClearColor');
            if (glClearColor) {
                gl.clearColor(glClearColor[0] * glClearColor[3], glClearColor[1] * glClearColor[3], glClearColor[2] * glClearColor[3], glClearColor[3]);
                gl.clear(gl.COLOR_BUFFER_BIT);
            }
        } else {
            // Clear texture.
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
        }
    }

    _setScissor(area) {
        let gl = this.gl;
        if (!area) {
            gl.disable(gl.SCISSOR_TEST);
        } else {
            gl.enable(gl.SCISSOR_TEST);
            let precision = this.ctx.stage.getRenderPrecision();
            let y = area[1];
            if (this._renderTexture === null) {
                // Flip.
                y = (this.ctx.stage.h / precision - (area[1] + area[3]));
            }
            gl.scissor(Math.round(area[0] * precision), Math.round(y * precision), Math.round(area[2] * precision), Math.round(area[3] * precision));
        }
        this._scissor = area;
    }

}
