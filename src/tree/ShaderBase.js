/**
 * Copyright Metrological, 2017
 */

let ShaderProgram = require('./ShaderProgram')

class ShaderBase {

    constructor(coreContext) {
        this._program = coreContext.shaderPrograms.get(this.constructor);
        if (!this._program) {
            this._program = new ShaderProgram(this.constructor.vertexShaderSource, this.constructor.fragmentShaderSource);

            // Let the vbo context perform garbage collection.
            coreContext.shaderPrograms.set(this.constructor, this._program);
        }
        this._initialized = false

        this.ctx = coreContext

        this.gl = this.ctx.gl

        /**
         * The (enabled) views that use this shader.
         * @type {Set<ViewCore>}
         */
        this._views = new Set()
    }

    _init() {
        if (!this._initialized) {
            this._program.compile(this.ctx.gl)
            this.initialize()
            this._initialized = true
        }
    }

    initialize() {

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
        this.beforeUsage()
        this.enableAttribs()
    }

    stopProgram() {
        this.afterUsage()
        this.disableAttribs()
    }

    hasSameProgram(other) {
        // For performance reasons, we first check for identical references.
        return (other && ((other === this) || (other._program === this._program)))
    }

    beforeUsage() {
        // Override to set settings other than the default settings (blend mode etc).
    }

    afterUsage() {
        // All settings changed in beforeUsage should be reset here.
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
        if (!this._views) {
            this.cleanup()
        }
    }

    redraw() {
        this._views.forEach(viewCore => {
            viewCore.setHasRenderUpdates(2)
        })
    }

    patch(settings) {
        Base.patchObject(this, settings)
    }

    cleanup() {
        this._initialized = false
    }

}

let Base = require('./Base')

module.exports = ShaderBase