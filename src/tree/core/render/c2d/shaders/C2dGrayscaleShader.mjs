import C2dDefaultShader from "./C2dDefaultShader.mjs";
import WebGLGrayscaleShader from "../../webgl/shaders/WebGLGrayscaleShader.mjs";

export default class GrayscaleShader extends C2dDefaultShader {

    constructor(context) {
        super(context);
        this._amount = 1;
    }

    static getWebGL() {
        return WebGLGrayscaleShader;
    }


    set amount(v) {
        this._amount = v;
        this.redraw();
    }

    get amount() {
        return this._amount;
    }

    useDefault() {
        return this._amount === 0;
    }

    _beforeDrawEl({target}) {
        target.ctx.filter = "grayscale(" + this._amount + ")";
    }

    _afterDrawEl({target}) {
        target.ctx.filter = "";
    }

}

