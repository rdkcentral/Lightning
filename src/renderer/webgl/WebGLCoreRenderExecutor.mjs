import CoreRenderExecutor from "../../tree/core/CoreRenderExecutor.mjs";

export default class WebGLCoreRenderExecutor extends CoreRenderExecutor {

    constructor(ctx) {
        super(ctx)

        this.gl = this.ctx.stage.gl;

        this.init();
    }

    init() {
        let gl = this.gl;

        // Create new sharable buffer for params.
        this._attribsBuffer = gl.createBuffer();

        let maxQuads = Math.floor(this.renderState.quads.data.byteLength / 80);

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
        this._projection = new Float32Array([2/this.ctx.stage.coordsWidth, -2/this.ctx.stage.coordsHeight]);

    }

    destroy() {
        super.destroy();
        this.gl.deleteBuffer(this._attribsBuffer);
        this.gl.deleteBuffer(this._quadsBuffer);
    }

    _reset() {
        super._reset();

        let gl = this.gl;
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);

        this._stopShaderProgram();
        this._setupBuffers();
    }

    _setupBuffers() {
        let gl = this.gl;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._quadsBuffer);
        let element = new Float32Array(this.renderState.quads.data, 0, this.renderState.quads.dataLength);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._attribsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, element, gl.DYNAMIC_DRAW);
    }

    _setupQuadOperation(quadOperation) {
        super._setupQuadOperation(quadOperation);
        this._useShaderProgram(quadOperation.shader, quadOperation);
    }

    _renderQuadOperation(op) {
        let shader = op.shader;

        if (op.length || op.shader.addEmpty()) {
            shader.beforeDraw(op);
            shader.draw(op);
            shader.afterDraw(op);
        }
    }

    /**
     * @param {WebGLShader} shader;
     * @param {CoreQuadOperation} operation;
     */
    _useShaderProgram(shader, operation) {
        if (!shader.hasSameProgram(this._currentShaderProgram)) {
            if (this._currentShaderProgram) {
                this._currentShaderProgram.stopProgram();
            }
            shader.useProgram();
            this._currentShaderProgram = shader;
        }
        shader.setupUniforms(operation);
    }

    _stopShaderProgram() {
        if (this._currentShaderProgram) {
            // The currently used shader program should be stopped gracefully.
            this._currentShaderProgram.stopProgram();
            this._currentShaderProgram = null;
        }
    }

    _bindRenderTexture(renderTexture) {
        super._bindRenderTexture(renderTexture);

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
        super._clearRenderTexture();
        let gl = this.gl;
        if (!this._renderTexture) {
            let glClearColor = this.ctx.stage.getClearColor();
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
        super._setScissor(area);

        if (this._scissor === area) {
            return;
        }
        this._scissor = area;

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
    }

}
