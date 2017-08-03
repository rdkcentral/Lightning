/**
 * Copyright Metrological, 2017
 */

let ShaderProgram = require('./ShaderProgram')
let Base = require('./Base')

class Shader extends Base {

    constructor(stage, vertexShaderSource, fragmentShaderSource) {
        super();

        this._program = Shader.programs.get(this.constructor);
        if (!this._program) {
            this._program = new ShaderProgram(vertexShaderSource, fragmentShaderSource);
            Shader.programs.set(this.constructor, this._program);
        }
        this._initialized = false;

        this._stage = stage;

        this._lastFrameUsed = 0;
    }

    redraw() {
        this._stage.ctx.staticStage = false;
    }

    init(vboContext) {
        this._program.compile(vboContext.gl);
        this._initialized = true;
    }

    drawElements(vboContext, offset, length) {
        // Set up shader attributes, uniforms, draw elements and disable attributes.
    }

    setup(vboContext) {
        vboContext.gl.useProgram(this.glProgram);
    }

    cleanup(vboContext) {
    }

    get initialized() {
        return this._initialized;
    }

    destroy() {
        this._initialized = false;
    }

    get glProgram() {
        return this._program.glProgram;
    }

    hasViewSettings() {
        return false;
    }

    createViewSettings() {
        return null;
    }

}

Shader.programs = new Map();
Shader.destroyPrograms = function() {
    Shader.programs.forEach(program => program.destroy());
}

module.exports = Shader;