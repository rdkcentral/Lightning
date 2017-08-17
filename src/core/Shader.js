/**
 * Copyright Metrological, 2017
 */

let ShaderProgram = require('./ShaderProgram')
let Base = require('./Base')

class Shader extends Base {

    constructor(vboContext, vertexShaderSource = Shader.vertexShaderSource, fragmentShaderSource = Shader.fragmentShaderSrc) {
        super();

        this._program = vboContext.shaderPrograms.get(this.constructor);
        if (!this._program) {
            this._program = new ShaderProgram(vertexShaderSource, fragmentShaderSource);

            // Let the vbo context perform garbage collection.
            vboContext.shaderPrograms.set(this.constructor, this._program);
        }
        this._initialized = false

        this.ctx = vboContext

        this.gl = this.ctx.gl

        /**
         * The (active) views that use this shader.
         * @type {Set<ViewCore>}
         */
        this._views = new Set();
    }

    _init() {
        if (!this._initialized) {
            this._program.compile(this.ctx.gl)
            this._initialized = true
        }
    }

    _uniform(name) {
        return this._program.getUniformLocation(name);
    }

    _attrib(name) {
        return this._program.getAttribLocation(name);
    }

    _setUniform(name, value, glFunction) {
        this._program.setUniformValue(name, value, glFunction)
    }

    useProgram() {
        this._init()
        this.ctx.gl.useProgram(this.glProgram);
        this.enableAttribs()
        this.beforeUsage()
    }

    stopProgram() {
        this.afterUsage()
        this.disableAttribs()
    }

    hasSameProgram(other) {
        // For performance reasons, we first check for identical references.
        return (other && ((other === this) || (other._program === this._program)))
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

    beforeUsage() {
        // Override to set settings other than the default settings (blend mode etc).
    }

    afterUsage() {
        // All settings changed in beforeUsage should be reset here.
    }

    getBytesPerVertex() {
        return 16;
    }

    getExtraBytesPerVertex() {
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

    hasUniformUpdates() {
        return this._program.hasUniformUpdates()
    }

    confirmUpdates() {
        this._program.commitUniformUpdates()
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
                gl.drawElements(gl.TRIANGLES, 6 * (length - pos), gl.UNSIGNED_SHORT, pos * 6 * 2);
            }
        }
    }

    afterDraw(operation) {
    }

    get initialized() {
        return this._initialized;
    }

    get glProgram() {
        return this._program.glProgram;
    }

    addView(viewCore) {
        this._views.add(viewCore)
    }

    removeView(viewCore) {
        this._views.delete(viewCore)
    }

    redraw() {
        this._views.forEach(viewCore => viewCore._setHasRenderUpdates(1))
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