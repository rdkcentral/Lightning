import WebGLShader from "../WebGLShader.mjs";

export default class DefaultShader extends WebGLShader {

    enableAttribs() {
        // Enables the attribs in the shader program.
        let gl = this.gl;
        gl.vertexAttribPointer(this._attrib("aVertexPosition"), 2, gl.FLOAT, false, 20, 0);
        gl.enableVertexAttribArray(this._attrib("aVertexPosition"));

        if (this._attrib("aTextureCoord") !== -1) {
            gl.vertexAttribPointer(this._attrib("aTextureCoord"), 2, gl.FLOAT, false, 20, 2 * 4);
            gl.enableVertexAttribArray(this._attrib("aTextureCoord"));
        }

        if (this._attrib("aColor") !== -1) {
            // Some shaders may ignore the color.
            gl.vertexAttribPointer(this._attrib("aColor"), 4, gl.UNSIGNED_BYTE, true, 20, 4 * 4);
            gl.enableVertexAttribArray(this._attrib("aColor"));
        }
    }

    disableAttribs() {
        // Disables the attribs in the shader program.
        let gl = this.gl;
        gl.disableVertexAttribArray(this._attrib("aVertexPosition"));

        if (this._attrib("aTextureCoord") !== -1) {
            gl.disableVertexAttribArray(this._attrib("aTextureCoord"));
        }

        if (this._attrib("aColor") !== -1) {
            gl.disableVertexAttribArray(this._attrib("aColor"));
        }
    }

    setupUniforms(operation) {
        this._setUniform("projection", this._getProjection(operation), this.gl.uniform2fv, false);
    }

    draw(operation) {
        let gl = this.gl;

        let length = operation.length;

        if (length) {
            let glTexture = operation.getTexture(0);
            let pos = 0;
            for (let i = 0; i < length; i++) {
                let tx = operation.getTexture(i);
                if (glTexture !== tx) {
                    gl.bindTexture(gl.TEXTURE_2D, glTexture);
                    gl.drawElements(gl.TRIANGLES, 6 * (i - pos), gl.UNSIGNED_SHORT, (pos + operation.index) * 6 * 2);
                    glTexture = tx;
                    pos = i;
                }
            }
            if (pos < length) {
                gl.bindTexture(gl.TEXTURE_2D, glTexture);
                gl.drawElements(gl.TRIANGLES, 6 * (length - pos), gl.UNSIGNED_SHORT, (pos + operation.index) * 6 * 2);
            }
        }
    }

}

DefaultShader.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    attribute vec4 aColor;
    uniform vec2 projection;
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    void main(void){
        gl_Position = vec4(aVertexPosition.x * projection.x - 1.0, aVertexPosition.y * -abs(projection.y) + 1.0, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
        vColor = aColor;
        gl_Position.y = -sign(projection.y) * gl_Position.y;
    }
`;

DefaultShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    void main(void){
        gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor;
    }
`;

