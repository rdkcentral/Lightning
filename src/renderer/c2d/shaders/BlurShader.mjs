import DefaultShader from "./DefaultShader.mjs";

export default class BlurShader extends DefaultShader {

    constructor(context) {
        super(context);
        this._kernelRadius = 1;
    }

    get kernelRadius() {
        return this._kernelRadius;
    }

    set kernelRadius(v) {
        this._kernelRadius = v;
        this.redraw();
    }

    useDefault() {
        return this._amount === 0;
    }

    _beforeDrawEl({target}) {
        target.ctx.filter = "blur(" + this._kernelRadius + "px)";
    }

    _afterDrawEl({target}) {
        target.ctx.filter = "none";
    }

}

