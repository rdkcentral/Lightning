import WebGLShaderProgram from "./WebGLShaderProgram.mjs";
import Shader from "../../tree/Shader.mjs";

export default class WebGLShader extends Shader {

    constructor(ctx) {
        super(ctx);

        const stage = ctx.stage;

        this._program = stage.renderer.shaderPrograms.get(this.constructor);
        if (!this._program) {
            this._program = new WebGLShaderProgram(this.constructor.vertexShaderSource, this.constructor.fragmentShaderSource);

            // Let the vbo context perform garbage collection.
            stage.renderer.shaderPrograms.set(this.constructor, this._program);
        }

        this.gl = stage.gl;
    }

    get glProgram() {
        return this._program.glProgram;
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

    getExtraAttribBytesPerVertex() {
        return 0;
    }

    getVertexAttribPointerOffset(operation) {
        return operation.extraAttribsDataByteOffset - (operation.index + 1) * 4 * this.getExtraAttribBytesPerVertex();
    }

    setExtraAttribsInBuffer(operation) {
        // Set extra attrib data in in operation.quads.data/floats/uints, starting from
        // operation.extraAttribsBufferByteOffset.
    }

    setupUniforms(operation) {
        // Set all shader-specific uniforms.
        // Notice that all uniforms should be set, even if they have not been changed within this shader instance.
        // The uniforms are shared by all shaders that have the same type (and shader program).
    }

    _getProjection(operation) {
        return operation.getProjection();
    }

    getFlipY(operation) {
        return this._getProjection(operation)[1] < 0;
    }

    beforeDraw(operation) {
    }

    draw(operation) {
    }

    afterDraw(operation) {
    }

    cleanup() {
        this._initialized = false;
        // Program takes little resources, so it is only destroyed when the full stage is destroyed.
    }

}
