import WebGLShaderProgram from "./WebGLShaderProgram.mjs";

export default class WebGLShaderImpl {

    constructor(shader) {
        this._shader = shader;

        const stage = this._shader.ctx.stage;

        this._program = stage.renderer.shaderPrograms.get(this.constructor);
        if (!this._program) {
            this._program = new WebGLShaderProgram(this.constructor.vertexShaderSource, this.constructor.fragmentShaderSource);

            // Let the vbo context perform garbage collection.
            stage.renderer.shaderPrograms.set(this.constructor, this._program);
        }

        this.gl = stage.gl;
    }

    get shader() {
        return this._shader;
    }

    _init() {
        if (!this._initialized) {
            this.initialize();
            this._initialized = true;
        }
    }

    initialize() {
        this._program.compile(this.gl);
    }

    get initialized() {
        return this._initialized;
    }

    _uniform(name) {
        return this._program.getUniformLocation(name);
    }

    _attrib(name) {
        return this._program.getAttribLocation(name);
    }

    _setUniform(name, value, glFunction) {
        this._program.setUniformValue(name, value, glFunction);
    }

    useProgram() {
        this._init();
        this.gl.useProgram(this.glProgram);
        this.beforeUsage();
        this.enableAttribs();
    }

    stopProgram() {
        this.afterUsage();
        this.disableAttribs();
    }

    hasSameProgram(other) {
        // For performance reasons, we first check for identical references.
        return (other && ((other === this) || (other._program === this._program)));
    }

    beforeUsage() {
        // Override to set settings other than the default settings (blend mode etc).
    }

    afterUsage() {
        // All settings changed in beforeUsage should be reset here.
    }

    enableAttribs() {

    }

    disableAttribs() {

    }

    get glProgram() {
        return this._program.glProgram;
    }

    cleanup() {
        this._initialized = false;
        // Program takes little resources, so it is only destroyed when the full stage is destroyed.
    }

}
