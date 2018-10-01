import Shader from "./Shader.mjs";
import WebGLDefaultShaderImpl from "./core/render/webgl/WebGLDefaultShaderImpl.mjs";

export default class DefaultShader extends Shader {

    constructor(coreContext) {
        super(coreContext);
        this.isDefault = this.constructor === DefaultShader;
    }

    static getWebGLImpl() {
        return WebGLDefaultShaderImpl;
    }

    static getC2dImpl() {
        //@todo: implement
    }

}

DefaultShader.prototype.isShader = true;

