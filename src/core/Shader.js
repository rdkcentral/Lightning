/**
 * Copyright Metrological, 2017
 */

let ShaderBase = require('./ShaderBase')

class Shader extends ShaderBase {

    constructor(coreContext, vertexShaderSource = Shader.vertexShaderSource, fragmentShaderSource = Shader.fragmentShaderSrc) {
        super(coreContext, vertexShaderSource, fragmentShaderSource);
    }

    enableAttribs() {
        // Enables the attribs in the shader program.
        let gl = this.ctx.gl
        gl.vertexAttribPointer(this._attrib("aVertexPosition"), 2, gl.FLOAT, false, 16, 0)
        gl.enableVertexAttribArray(this._attrib("aVertexPosition"))

        gl.vertexAttribPointer(this._attrib("aTextureCoord"), 2, gl.UNSIGNED_SHORT, true, 16, 2 * 4)
        gl.enableVertexAttribArray(this._attrib("aTextureCoord"))

        gl.vertexAttribPointer(this._attrib("aColor"), 4, gl.UNSIGNED_BYTE, true, 16, 3 * 4)
        gl.enableVertexAttribArray(this._attrib("aColor"))
    }

    disableAttribs() {
        // Disables the attribs in the shader program.
        let gl = this.ctx.gl
        gl.disableVertexAttribArray(this._attrib("aVertexPosition"));
        gl.disableVertexAttribArray(this._attrib("aTextureCoord"))
        gl.disableVertexAttribArray(this._attrib("aColor"))
    }

    getExtraAttribBytesPerVertex() {
        return 0
    }

    useDefault() {
        // Should return true if this shader is configured (using it's properties) to not have any effect.
        // This may allow the render engine to avoid unnecessary shader program switches or even texture copies.
        return false;
    }

    supportsMerging() {
        // Multiple shader instances that have the same type and same uniforms may be combined into one draw operation.
        // Notice that this causes the shaderOwner to vary within the same draw, so it is nullified in the shader options.
        return true
    }

    addEmpty() {
        // Draws this shader even if there are no quads to be added.
        // This is handy for custom shaders.
        return false
    }

    setExtraAttribsInBuffer(operation) {
        // Set extra attrib data in in operation.quads.data/floats/uints, starting from
        // operation.extraAttribsBufferByteOffset.
    }

    setupUniforms(operation) {
        // Set all shader-specific uniforms.
        this._setUniform("projectionMatrix", this._getProjectionMatrix(operation), this.ctx.gl.uniformMatrix4fv)
    }

    _getProjectionMatrix(operation) {
        if (operation.renderTexture === null) {
            return this.ctx.renderExec._projectionMatrix
        } else {
            return operation.renderTexture.projectionMatrix
        }
    }

    beforeDraw(operation) {
    }

    draw(operation) {
        let gl = this.ctx.gl;

        let length = operation.length;

        if (length) {
            let glTexture = operation.getTexture(0);
            let pos = 0;
            for (let i = 0; i < length; i++) {
                let tx = operation.getTexture(i);
                if (glTexture !== tx) {
                    gl.bindTexture(gl.TEXTURE_2D, glTexture);
                    gl.drawElements(gl.TRIANGLES, 6 * (i - pos), gl.UNSIGNED_SHORT, pos * 6 * 2);
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

    afterDraw(operation) {
    }

}

Shader.vertexShaderSource = `
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

Shader.fragmentShaderSrc = `
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

Shader.prototype.isShader = true;

module.exports = Shader;