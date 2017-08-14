/**
 * Copyright Metrological, 2017
 */

let ShaderProgram = require('./ShaderProgram')
let Base = require('./Base')

class Filter extends Base {

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

    _uniform(name) {
        return this._program.getUniformLocation(name);
    }

    _init() {
        if (!this._initialized) {
            this._program.compile(this.ctx.gl)
            this._initialized = true
        }
    }

    addView(viewCore) {
        this._views.add(viewCore)
    }

    removeView(viewCore) {
        this._views.delete(viewCore)
    }

    useProgram() {
        this._init()
        this.ctx.gl.useProgram(this.glProgram);
    }

    _setUniform(name, value, glFunction) {
        this._program.setUniformValue(name, value, glFunction)
    }

    setupUniforms(options) {
        //@todo: set up projection matrix and/or render texture dimensions
    }

    beforeDraw(options) {

    }

    afterDraw(options) {
        // Make sure that any non-default gl settings (blend functions etc) are undone here.
    }

    supportsDirectDrawMode() {
        return true
    }

    get initialized() {
        return this._initialized;
    }

    get glProgram() {
        return this._program.glProgram;
    }

    redraw() {
        this._views.forEach(viewCore => viewCore._setHasRenderUpdates(2))
    }

    useDefault() {
        // Should return true if this filter is configured (using it's properties) to not have any effect.
        // This may allow the render engine to avoid unnecessary shader program switches or even texture copies.
        return false
    }

    supportsDirectDrawMode() {
        // Some filters, such as FXAA, rely on the texture size being equal to the render target size. Such filters
        // can't be drawn directly and must be drawn on an intermediate texture.
        return true
    }

}

Filter.prototype.isFilter = true;

module.exports = Shader;