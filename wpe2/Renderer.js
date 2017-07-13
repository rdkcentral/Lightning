class Renderer {

    constructor(stage) {
        this.stage = stage;

        this.gl = stage.gl;

        this.program = null;

        this.vertexShaderSrc = [
            "#ifdef GL_ES",
            "precision lowp float;",
            "#endif",
            "attribute vec2 aVertexPosition;",
            "attribute vec2 aTextureCoord;",
            "attribute vec4 aColor;",
            "uniform mat4 projectionMatrix;",
            "varying vec2 vTextureCoord;",
            "varying vec4 vColor;",
            "void main(void){",
            "    gl_Position = projectionMatrix * vec4(aVertexPosition, 0.0, 1.0);",
            "    vTextureCoord = aTextureCoord;",
            "    vColor = aColor;",
            "}"
        ].join("\n");

        this.fragmentShaderSrc = [
            "#ifdef GL_ES",
            "precision lowp float;",
            "#endif",
            "varying vec2 vTextureCoord;",
            "varying vec4 vColor;",
            "uniform sampler2D uSampler;",
            "void main(void){",
            "    gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor;",
            "}"
        ].join("\n");

        // The matrix that causes the [0,0 - W,H] box to map to [-1,-1 - 1,1] in the end results.
        this.projectionMatrix = new Float32Array([
            2/this.stage.options.renderWidth, 0, 0, 0,
            0, -2/this.stage.options.renderHeight, 0, 0,
            0, 0, 1, 0,
            -1, 1, 0, 1
        ]);

        this.paramsGlBuffer = null;

        this.program = null;

        this.vertexPositionAttribute = null;
        this.textureCoordAttribute = null;
        this.colorAttribute = null;

        this.indicesGlBuffer = null;

        /**
         * Drawn frames get assigned a number, so that we can check if we can memcopy the previous result.
         * @type {number}
         */
        this.frameCounter = 0;

        this.initShaderProgram();

    }

    initShaderProgram() {
        let gl = this.gl;

        let glVertShader = this.glCompile(gl.VERTEX_SHADER, this.vertexShaderSrc);
        let glFragShader = this.glCompile(gl.FRAGMENT_SHADER, this.fragmentShaderSrc);

        this.program = gl.createProgram();

        gl.attachShader(this.program, glVertShader);
        gl.attachShader(this.program, glFragShader);
        gl.linkProgram(this.program);

        // if linking fails, then log and cleanup
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            console.error('Error: Could not initialize shader.');
            console.error('gl.VALIDATE_STATUS', gl.getProgramParameter(this.program, gl.VALIDATE_STATUS));
            console.error('gl.getError()', gl.getError());

            // if there is a program info log, log it
            if (gl.getProgramInfoLog(this.program) !== '') {
                console.warn('Warning: gl.getProgramInfoLog()', gl.getProgramInfoLog(this.program));
            }

            gl.deleteProgram(this.program);
            this.program = null;
        }
        gl.useProgram(this.program);

        // clean up some shaders
        gl.deleteShader(glVertShader);
        gl.deleteShader(glFragShader);

        // Bind attributes.
        this.vertexPositionAttribute = gl.getAttribLocation(this.program, "aVertexPosition");
        this.textureCoordAttribute = gl.getAttribLocation(this.program, "aTextureCoord");
        this.colorAttribute = gl.getAttribLocation(this.program, "aColor");

        // Init webgl arrays.

        this.allIndices = new Uint16Array(100000);

        // fill the indices with the quads to draw.
        for (let i = 0, j = 0; i < Renderer.MAX_QUADS * 6; i += 6, j += 4) {
            this.allIndices[i] = j;
            this.allIndices[i + 1] = j + 1;
            this.allIndices[i + 2] = j + 2;
            this.allIndices[i + 3] = j;
            this.allIndices[i + 4] = j + 2;
            this.allIndices[i + 5] = j + 3;
        }

        this.paramsGlBuffer = gl.createBuffer();

        this.indicesGlBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesGlBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.allIndices, gl.STATIC_DRAW);

        // Set transformation matrix.
        let projectionMatrixAttribute = gl.getUniformLocation(this.program, "projectionMatrix");
        gl.uniformMatrix4fv(projectionMatrixAttribute, false, this.projectionMatrix);
    }
    
    glCompile(type, src) {
        let shader = this.gl.createShader(type);

        this.gl.shaderSource(shader, src);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.log(this.gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    destroy() {
        this.gl.deleteBuffer(this.paramsGlBuffer);
        this.gl.deleteBuffer(this.indicesGlBuffer);
        this.gl.deleteProgram(this.program);
    }
    
    render() {
        if (this.gl.isContextLost && this.gl.isContextLost()) {
            console.error('WebGL context lost');
            return;
        }

        // Draw the actual textures to screen.
        this.renderItems();
    }
    
    renderItems() {
        let i, n;
        let gl = this.gl;

        let ctx = this.stage.ctx;

        // Set up WebGL program.
        gl.useProgram(this.program);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0,0,this.stage.options.w,this.stage.options.h);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);

        // Clear screen.
        let glClearColor = this.stage.options.glClearColor;
        gl.clearColor(glClearColor[0], glClearColor[1], glClearColor[2], glClearColor[3]);
        gl.clear(gl.COLOR_BUFFER_BIT);

        let view = new DataView(ctx.vboParamsBuffer, 0, ctx.vboIndex * 4);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.paramsGlBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, view, gl.DYNAMIC_DRAW);
        let vboGlTextures = ctx.vboGlTextures;
        let vboGlTextureRepeats = ctx.vboGlTextureRepeats;
        let count = ctx.vboGlTextures.length;

        if (count) {
            gl.vertexAttribPointer(this.vertexPositionAttribute, 2, gl.FLOAT, false, 16, 0);
            gl.vertexAttribPointer(this.textureCoordAttribute, 2, gl.UNSIGNED_SHORT, true, 16, 2 * 4);
            gl.vertexAttribPointer(this.colorAttribute, 4, gl.UNSIGNED_BYTE, true, 16, 3 * 4);

            gl.enableVertexAttribArray(this.vertexPositionAttribute);
            gl.enableVertexAttribArray(this.textureCoordAttribute);
            gl.enableVertexAttribArray(this.colorAttribute);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesGlBuffer);

            let pos = 0;
            for (i = 0; i < count; i++) {
                gl.bindTexture(gl.TEXTURE_2D, vboGlTextures[i]);
                gl.drawElements(gl.TRIANGLES, 6 * vboGlTextureRepeats[i], gl.UNSIGNED_SHORT, pos * 6 * 2);
                pos += vboGlTextureRepeats[i];
            }
            gl.disableVertexAttribArray(this.vertexPositionAttribute);
            gl.disableVertexAttribArray(this.textureCoordAttribute);
            gl.disableVertexAttribArray(this.colorAttribute);
        }

    }
    
}

/**
 * Max number of quads that can be rendered in one frame.
 * The memory usage is 64B * Renderer.MAX_QUADS.
 * Notice that this may never be higher than (65536 / 4)|0 due to index buffer limitations.
 * @note if a sprite is being clipped or has borders, it may use more than 1 quad.
 * @type {number}
 */
Renderer.MAX_QUADS = (65536 / 4)|0;