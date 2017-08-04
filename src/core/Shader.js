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
        this._stage.ctx.root._setHasRenderUpdates();
        //@todo: make sure that renderAsTextures that contain this shader are not reused.
    }

    init(vboContext) {
        this._program.compile(vboContext.gl);
        this._initialized = true;
    }

    drawElements(vboContext, offset, length, multisample = 0) {
        // Set up shader attributes, uniforms, draw elements and disable attributes.
    }

    drawMultisample(vboContext, viewRenderer) {
        // Draws a renderAsTexture in a multisampled way.
        let amount = this.getMultisamples(viewRenderer)

        let origSource = vboContext.vboGlTextures[0]
        let target = null;
        for (let i = 0; i < amount; i++) {
            target = i % 2 === 0 ? vboContext.getMultisampleTextureA() : vboContext.getMultisampleTextureB();

            vboContext.setRenderTarget(target);

            // Limit viewport to texture dimensions.
            vboContext.gl.viewport(0, 0, origSource.w, origSource.h);

            if (i !== 0) {
                vboContext.vboGlTextures[0] = (i % 2 === 0 ? vboContext.getMultisampleTextureB() : vboContext.getMultisampleTextureA());
            }

            this.drawElements(vboContext, 0, vboContext.vboOffset, i + 1);

            vboContext.restoreRenderTarget();
        }

        // Actually render to the real render target.
        vboContext.vboGlTextures[0] = target;
        this.drawElements(vboContext, 0, vboContext.vboOffset, 0)
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

    getBufferSizePerQuad() {
        return 0;
    }

    getMultisamples(viewRenderer) {
        return 0;
    }

}

Shader.programs = new Map();
Shader.destroyPrograms = function() {
    Shader.programs.forEach(program => program.destroy());
}

module.exports = Shader;