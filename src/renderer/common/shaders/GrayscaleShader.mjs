import C2dDefaultShader from "../../c2d/shaders/DefaultShader.mjs";
import WebGLDefaultShader from "../../webgl/shaders/DefaultShader.mjs";

export class WebGLGrayscaleShader extends WebGLDefaultShader {

    constructor(context) {
        super(context);
        this._amount = 1;
    }

    static getC2d() {
        return C2dGrayscaleShader;
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

    setupUniforms(operation) {
        super.setupUniforms(operation);
        this._setUniform("amount", this._amount, this.gl.uniform1f);
    }

}

WebGLGrayscaleShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    uniform float amount;
    void main(void){
        vec4 color = texture2D(uSampler, vTextureCoord) * vColor;
        float grayness = 0.2 * color.r + 0.6 * color.g + 0.2 * color.b;
        gl_FragColor = vec4(amount * vec3(grayness, grayness, grayness) + (1.0 - amount) * color.rgb, color.a);
    }
`;

export class C2dGrayscaleShader extends C2dDefaultShader {

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
