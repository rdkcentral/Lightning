import DefaultShader from "./DefaultShader.mjs";

export default class InversionShader extends DefaultShader {

    constructor(context) {
        super(context);
        this._amount = 1;
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

InversionShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    uniform float amount;
    void main(void){
        vec4 color = texture2D(uSampler, vTextureCoord);
        color.rgb = color.rgb * (1.0 - amount) + amount * (1.0 * color.a - color.rgb); 
        gl_FragColor = color * vColor;
    }
`;

