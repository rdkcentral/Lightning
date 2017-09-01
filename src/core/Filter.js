/**
 * Copyright Metrological, 2017
 */

let ShaderProgram = require('./ShaderProgram')
let ShaderBase = require('./ShaderBase')

class Filter extends ShaderBase {

    constructor(coreContext) {
        super(coreContext);
    }

    getVertexShaderSource() {
        return Filter.vertexShaderSource
    }

    getFragmentShaderSource() {
        return Filter.fragmentShaderSource
    }

    useDefault() {
        // Should return true if this filter is configured (using it's properties) to not have any effect.
        // This may allow the render engine to avoid unnecessary shader program switches or even texture copies.
        return false
    }

    enableAttribs() {
        // Enables the attribs in the shader program.
        let gl = this.ctx.gl
        gl.vertexAttribPointer(this._attrib("aVertexPosition"), 2, gl.FLOAT, false, 16, 0)
        gl.enableVertexAttribArray(this._attrib("aVertexPosition"))

        if (this._attrib("aTextureCoord") !== -1) {
            gl.vertexAttribPointer(this._attrib("aTextureCoord"), 2, gl.UNSIGNED_SHORT, true, 16, 2 * 4)
            gl.enableVertexAttribArray(this._attrib("aTextureCoord"))
        }
    }

    disableAttribs() {
        // Disables the attribs in the shader program.
        let gl = this.ctx.gl
        gl.disableVertexAttribArray(this._attrib("aVertexPosition"));
        if (this._attrib("aTextureCoord") !== -1) {
            gl.disableVertexAttribArray(this._attrib("aTextureCoord"))
        }
    }

    setupUniforms(operation) {
        this._setUniform("resolution", new Float32Array([operation.getRenderWidth(), operation.getRenderHeight()]), this.gl.uniform2fv)
    }

    beforeDraw(operation) {
    }

    afterDraw(operation) {
    }

    draw(operation) {
        // Draw the identity quad.
        let gl = this.gl
        gl.bindTexture(gl.TEXTURE_2D, operation.source);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }

    redraw() {
        this._views.forEach(viewCore => {
            viewCore.setHasRenderUpdates(2)

            // Changing filter settings may cause a change mustRenderToTexture for the branch:
            // we need to be sure that the update function is called for this branch.
            viewCore._setRecalc(1 + 2 + 4 + 8)
        })
    }

}

Filter.prototype.isFilter = true

Filter.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    varying vec2 vTextureCoord;
    void main(void){
        gl_Position = vec4(aVertexPosition, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
    }
`;

Filter.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;
    void main(void){
        gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
`;

Filter.prototype.isFilter = true

module.exports = Filter