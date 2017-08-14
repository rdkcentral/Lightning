/**
 * Copyright Metrological, 2017
 */

let Shader = require('./Shader');

class DefaultShader extends Shader {

    constructor(vboContext, vertexShaderSource = DefaultShader.vertexShaderSource, fragmentShaderSource = DefaultShader.fragmentShaderSrc) {
        super(vboContext, vertexShaderSource, fragmentShaderSource);

        this._isSubShader = (this.constructor !== DefaultShader);
    }

    useProgram() {
        super.useProgram();

        let gl = this.ctx.gl;

        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);

        gl.vertexAttribPointer(this._attrib("aVertexPosition"), 2, gl.FLOAT, false, 16, 0);
        gl.enableVertexAttribArray(this._attrib("aVertexPosition"));

        if (this.usesTextureCoords()) {
            gl.vertexAttribPointer(this._attrib("aTextureCoord"), 2, gl.UNSIGNED_SHORT, true, 16, 2 * 4);
            gl.enableVertexAttribArray(this._attrib("aTextureCoord"));
        }

        if (this.usesColors()) {
            gl.vertexAttribPointer(this._attrib("aColor"), 4, gl.UNSIGNED_BYTE, true, 16, 3 * 4);
            gl.enableVertexAttribArray(this._attrib("aColor"));
        }

        this._setupPjm = null;
    }

    stopProgram() {
        super.stopProgram();

        let gl = this.ctx.gl;

        gl.disableVertexAttribArray(this._attrib("aVertexPosition"));
        if (this.usesTextureCoords()) {
            gl.disableVertexAttribArray(this._attrib("aTextureCoord"));
        }
        if (this.usesColors()) {
            gl.disableVertexAttribArray(this._attrib("aColor"));
        }
    }

    usesTextureCoords() {
        return true;
    }

    usesColors() {
        return true;
    }

    _draw() {
        let gl = this.ctx.gl;
        let ctx = this.ctx;

        let length = this.ctx.length;

        if (length) {
            this.updateProjectionMatrix();

            ctx.bufferGlParams();

            let glTexture = this.ctx.getVboGlTexture(0);
            let pos = 0;
            for (let i = 0; i < length; i++) {
                let tx = ctx.getVboGlTexture(i);
                if (glTexture !== tx) {
                    gl.bindTexture(gl.TEXTURE_2D, glTexture);
                    gl.drawElements(gl.TRIANGLES, 6 * (i - pos), gl.UNSIGNED_SHORT, pos * 6 * 2);
                    glTexture = tx;
                    pos = i;
                }
            }
            if (pos < length) {
                gl.bindTexture(gl.TEXTURE_2D, glTexture);
                gl.drawElements(gl.TRIANGLES, 6 * (length - pos), gl.UNSIGNED_SHORT, pos * 6 * 2);
            }
        }
    }

    updateProjectionMatrix() {
        let newPjm = this.ctx.getProjectionMatrix();
        if (this._program._setupPjm !== newPjm) {
            let gl = this.ctx.gl
            gl.uniformMatrix4fv(this._uniform("projectionMatrix"), false, newPjm)
            this._program._setupPjm = newPjm;
        }
    }

    getBytesPerVertex() {
        return 16 + this.getExtraBytesPerVertex();
    }

    getExtraParamsBufferOffset() {
        return this.ctx.length * 64;
    }

    getExtraBytesPerVertex() {
        return 0;
    }

    useDefault() {
        // Default for subclasses of default shader: has effect.
        return !this._isSubShader;
    }

}

DefaultShader.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    attribute vec4 aColor;
    uniform mat4 projectionMatrix;
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    void main(void){
        gl_Position = projectionMatrix * vec4(aVertexPosition, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
        vColor = aColor;
    }
`;

DefaultShader.fragmentShaderSrc = `
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

DefaultShader.prototype.isDefaultShader = true;

module.exports = DefaultShader;