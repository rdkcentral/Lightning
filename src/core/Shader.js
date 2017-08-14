/**
 * Copyright Metrological, 2017
 */

let ShaderProgram = require('./ShaderProgram')
let Base = require('./Base')

class Shader extends Base {

    constructor(vboContext, vertexShaderSource, fragmentShaderSource) {
        super();

        this._program = Shader.programs.get(this.constructor);
        if (!this._program) {
            this._program = new ShaderProgram(vertexShaderSource, fragmentShaderSource);
            Shader.programs.set(this.constructor, this._program);
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

    _attrib(name) {
        return this._program.getAttribLocation(name);
    }

    _init() {
        if (!this._initialized) {
            this._program.compile(this.ctx.gl);
            this._initialized = true;
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

        this.ctx.bindDefaultGlBuffers();
    }

    /**
     * Sets up this shader instance.
     * Normally, you apply any uniforms here.
     */
    setup() {
    }

    stopProgram() {
    }

    /**
     * Set up params buffer for filtering.
     */
    prepareFilterQuad() {
    }

    /**
     * Set up params buffer based on shader settings in context.
     */
    prepareQuads() {
    }

    _draw() {
    }

    get initialized() {
        return this._initialized;
    }

    get glProgram() {
        return this._program.glProgram;
    }

    hasViewSettings() {
        return false;
    }

    createViewSettings() {
        // Return a dummy object to prevent userland errors.
        return {};
    }

    getBytesPerVertex() {
        return 0;
    }

    redraw() {
        this._views.forEach(viewCore => viewCore._setHasRenderUpdates(2))
    }

    useDefault() {
        // Should return true if this shader is configured (using it's properties) to not have any effect.
        // This may allow the shader engine to avoid unnecessary shader program switches or even texture copies.
        // Warning: the return value may only depend on the Shader's properties.
        return false;
    }

    supportsDirectDrawMode() {
        // Some filters, such as FXAA, rely on the texture size being equal to the render target size. Such filters
        // can't be used as multiquad shaders.
        return true
    }

}

Shader.prototype.isShader = true;

Shader.programs = new Map();
Shader.destroyPrograms = function() {
    Shader.programs.forEach(program => program.destroy());
}

module.exports = Shader;