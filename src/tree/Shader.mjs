/**
 * Copyright Metrological, 2017;
 */

import ShaderBase from "./ShaderBase.mjs";

export default class Shader extends ShaderBase {

    constructor(coreContext) {
        super(coreContext);
        this.isDefault = this.constructor === Shader;
    }

    enableAttribs() {
        // Enables the attribs in the shader program.
        let gl = this.ctx.gl;
        gl.vertexAttribPointer(this._attrib("aVertexPosition"), 2, gl.FLOAT, false, 20, 0);
        gl.enableVertexAttribArray(this._attrib("aVertexPosition"));

        if (this._attrib("aTextureCoord") !== -1) {
            gl.vertexAttribPointer(this._attrib("aTextureCoord"), 2, gl.FLOAT, true, 20, 2 * 4);
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
        let gl = this.ctx.gl;
        gl.disableVertexAttribArray(this._attrib("aVertexPosition"));

        if (this._attrib("aTextureCoord") !== -1) {
            gl.disableVertexAttribArray(this._attrib("aTextureCoord"));
        }

        if (this._attrib("aColor") !== -1) {
            gl.disableVertexAttribArray(this._attrib("aColor"));
        }
    }

    getExtraAttribBytesPerVertex() {
        return 0;
    }

    getVertexAttribPointerOffset(operation) {
        return operation.extraAttribsDataByteOffset - (operation.index + 1) * 4 * this.getExtraAttribBytesPerVertex();
    }

    useDefault() {
        // Should return true if this shader is configured (using it's properties) to not have any effect.
        // This may allow the render engine to avoid unnecessary shader program switches or even texture copies.
        return false;
    }

    addEmpty() {
        // Draws this shader even if there are no quads to be added.
        // This is handy for custom shaders.
        return false;
    }

    setExtraAttribsInBuffer(operation) {
        // Set extra attrib data in in operation.quads.data/floats/uints, starting from
        // operation.extraAttribsBufferByteOffset.
    }

    setupUniforms(operation) {
        // Set all shader-specific uniforms.
        // Notice that all uniforms should be set, even if they have not been changed within this shader instance.
        // The uniforms are shared by all shaders that have the same type (and shader program).
        this._setUniform("projection", this._getProjection(operation), this.ctx.gl.uniform2fv, false);
    }

    _getProjection(operation) {
        return operation.getProjection();
    }

    getFlipY(operation) {
        return this._getProjection(operation)[1] < 0;
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
                    gl.drawElements(gl.TRIANGLES, 6 * (i - pos), gl.UNSIGNED_SHORT, (pos + operation.index + 1) * 6 * 2);
                    glTexture = tx;
                    pos = i;
                }
            }
            if (pos < length) {
                gl.bindTexture(gl.TEXTURE_2D, glTexture);
                gl.drawElements(gl.TRIANGLES, 6 * (length - pos), gl.UNSIGNED_SHORT, (pos + operation.index + 1) * 6 * 2);
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

Shader.fragmentShaderSource = `
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

