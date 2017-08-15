/**
 * Copyright Metrological, 2017
 */

let ShaderProgram = require('./ShaderProgram')
let Base = require('./Base')

class Shader extends Base {

    constructor(vboContext, vertexShaderSource, fragmentShaderSource) {
        super();

        this._program = vboContext.shaderPrograms.get(this.constructor);
        if (!this._program) {
            this._program = new ShaderProgram(vertexShaderSource, fragmentShaderSource);

            // Let the vbo context perform garbage collection.
            vboContext.shaderPrograms.set(this.constructor, this._program);
        }
        this._initialized = false;

        this.ctx = vboContext;

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

    useProgram() {
        this._init()
        this.ctx.gl.useProgram(this.glProgram);
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

    _uniform(name) {
        return this._program.getUniformLocation(name);
    }

    _attrib(name) {
        return this._program.getAttribLocation(name);
    }

    _setUniform(name, value, glFunction) {
        this._program.setUniformValue(name, value, glFunction)
    }

    getBytesPerVertex() {
        return 16;
    }

    getExtraBytesPerVertex() {
        return 0
    }

    setExtraAttribsInBuffer(operation) {
        // Set extra attrib data in in operation.quads.attribsBuffer.data/floats/uints, starting from
        // operation.extraAttribsBufferByteOffset.
    }

    useDefault() {
        // Should return true if this shader is configured (using it's properties) to not have any effect.
        // This may allow the render engine to avoid unnecessary shader program switches or even texture copies.
        return false;
    }

    hasCustomDraw() {
        // Returns true if this shader has a custom draw function. No attributes or uniforms are set. The framebuffer is
        // set and the _draw function is called.
    }

    setupUniforms(operation) {
        // Set all shader-specific uniforms.
    }

    hasUniformUpdates() {
        return this._program.hasUniformUpdates()
    }

    confirmUpdates() {
        this._program.commitUniformUpdates()
    }

    enableExtraAttribs() {
        // Enables the attribs in the shader program.
    }

    beforeDraw(options) {

    }

    draw(options) {
        // Override in case of custom draw.
    }

    afterDraw(options) {
        // Make sure that any non-default gl settings (blend functions etc) are undone here.
    }

    disableExtraAttribs() {
        // Disables the attribs in the shader program.
    }

    supportsCombining() {
        // Multiple shader instances that have the same type and same uniforms may be combined into one draw operation.
        // Notice that this causes the shaderOwner to very within the same draw, so it is nullified in the shader options.
        return true;
    }

    hasSameType(other) {
        if (other && other._program === this._program) {
            return true
        } else {
            return false
        }
    }

    get initialized() {
        return this._initialized;
    }

    get glProgram() {
        return this._program.glProgram;
    }

}

Shader.prototype.isShader = true;

module.exports = Shader;