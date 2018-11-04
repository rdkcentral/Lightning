import DefaultShader from "./DefaultShader.mjs";
import WebGLGrayscaleShader from "../../webgl/shaders/GrayscaleShader.mjs";

export default class GrayscaleShader extends DefaultShader {

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
        target.ctx.filter = "none";
    }

}

