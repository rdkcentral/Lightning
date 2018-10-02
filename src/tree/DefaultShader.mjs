import Shader from "./Shader.mjs";
import WebGLDefaultShaderImpl from "./core/render/webgl/WebGLDefaultShaderImpl.mjs";
import C2dDefaultShaderImpl from "./core/render/c2d/C2dDefaultShaderImpl.mjs";

export default class DefaultShader extends Shader {

    constructor(coreContext) {
        super(coreContext);
        this.isDefault = this.constructor === DefaultShader;
    }

    static getWebGLImpl() {
        return WebGLDefaultShaderImpl;
    }

    static getC2dImpl() {
        return C2dDefaultShaderImpl;
    }

}

DefaultShader.prototype.isShader = true;

