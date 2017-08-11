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
         * The view renders that use this shader, either as a shader owner or as a filter.
         * @type {Set<ViewRenderer>}
         */
        this._users = new Set();
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

    _free() {
        if (!this._initialized) {
            this._program.destroy();
            this._initialized = false;
        }
    }

    useProgram() {
        this.ctx.initShader(this);
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

    /**
     * This function should be called for every shader owner or filter owner that runs this shader.
     */
    updateUserReference(viewRenderer) {
        this._users.add(viewRenderer);
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
        this._users.forEach((viewRenderer) => {
            viewRenderer.redrawShader(this);
        });
    }

    checkUsers() {
        this._users.forEach((viewRenderer) => {
            if (!viewRenderer.usesShader(this)) {
                this._users.delete(viewRenderer)
            }
        });
    }

    hasUsers() {
        return this._users.size > 0;
    }

    drawsAsDefault() {
        // Should return true if this shader is configured (using it's properties) to not have any effect.
        // This may allow the shader engine to avoid unnecessary shader program switches or even texture copies.
        // Warning: the return value may only depend on the Shader's properties.
        return false;
    }

    allowAsMultiquadShader() {
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