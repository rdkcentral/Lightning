import lng from '../../lightning.mjs';

export default class TestShader extends lng.shaders.WebGLShader {

    initialize() {
        super.initialize();

        // Set up buffers.
        const gl = this.gl;
        this._attribsBuffer = gl.createBuffer();

        const data = new Float32Array(100*100*4*4);
        for (let i = 0; i < 100*100; i++) {
            const o = i * 4 * 4;
            let y = Math.floor(i / 100);
            let x = i - y * 100;

            y -= 50;
            x -= 50;

            data[o] = x;
            data[o+1] = y;
            data[o+2] = -0.5;
            data[o+3] = -0.5;

            data[o+4] = x;
            data[o+5] = y;
            data[o+6] = 0.5;
            data[o+7] = -0.5;

            data[o+8] = x;
            data[o+9] = y;
            data[o+10] = 0.5;
            data[o+11] = 0.5;

            data[o+12] = x;
            data[o+13] = y;
            data[o+14] = -0.5;
            data[o+15] = 0.5;
        }

        // fill the indices with the quads to draw.
        const indices = new Uint16Array(100 * 100 * 6);
        for (let y = 0; y < 100; y++) {
            for (let x = 0; x < 100; x++) {
                const offset = (x + y * 100) * 6;
                const pi = (x + y * 100) * 4;
                indices[offset] = pi;
                indices[offset+1] = pi+1;
                indices[offset+2] = pi+2;
                indices[offset+3] = pi;
                indices[offset+4] = pi+2;
                indices[offset+5] = pi+3;
            }
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this._attribsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

        // The quads buffer can be (re)used to draw a range of quads.
        this._quadsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._quadsBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    }

    cleanup() {
        super.cleanup();
        const gl = this.gl;
        gl.deleteBuffer(this._attribsBuffer);
        gl.deleteBuffer(this._quadsBuffer);
    }

    beforeUsage() {
        // Override to set settings other than the default settings (blend mode etc).
        const gl = this.gl;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._quadsBuffer);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._attribsBuffer);
    }

    afterUsage() {
        // All settings changed in beforeUsage should be reset here.
        const gl = this.gl;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ctx.renderExec._quadsBuffer);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.ctx.renderExec._attribsBuffer);
    }

    enableAttribs() {
        // Enables the attribs in the shader program.
        let gl = this.gl;
        gl.vertexAttribPointer(this._attrib("aIndex"), 4, gl.FLOAT, false, 16, 0);
        gl.enableVertexAttribArray(this._attrib("aIndex"));
    }

    disableAttribs() {
        // Disables the attribs in the shader program.
        let gl = this.gl;
        gl.disableVertexAttribArray(this._attrib("aIndex"));
    }

    setupUniforms(operation) {
        super.setupUniforms(operation);
    }

    draw(operation) {
        let gl = this.gl;
        let glTexture = operation.getTexture(0);
        gl.bindTexture(gl.TEXTURE_2D, glTexture);
        gl.drawElements(gl.TRIANGLES, 100*100*6, gl.UNSIGNED_SHORT, 0);
    }

}

TestShader.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    attribute vec4 aIndex;
    uniform sampler2D uSampler;
    varying lowp vec4 color;
    void main(void){
        vec2 xy = aIndex.xy * 0.04 + aIndex.zw * 0.02;
        vec2 texCoord = (aIndex.xy + 50.0 + 0.5) * 0.01;
        color = texture2D(uSampler, texCoord);
        gl_Position = vec4(xy.x, -xy.y, 0.0, 1.0);
    }
`;

TestShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec4 color;
    void main(void){
        gl_FragColor = color;
    }
`;

