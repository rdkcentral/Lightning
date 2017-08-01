/**
 * Copyright Metrological, 2017
 */

let ShaderProgram = require('./ShaderProgram')
let Base = require('./Base')

class Shader extends Base {

    constructor(stage, vertexShaderSource, fragmentShaderSource) {
        super();
        this._program = new ShaderProgram(vertexShaderSource, fragmentShaderSource);
        this._initialized = false;

        this._stage = stage;
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

    }

    cleanup(vboContext) {
    }

    get initialized() {
        return this._initialized;
    }

    destroy() {
        this._program.destroy();
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

module.exports = Shader;