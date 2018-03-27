const Shader = require('../../tree/Shader');

class GrayscaleShader extends Shader {
    constructor(context) {
        super(context)
        this._amount = 0
    }

    set amount(v) {
        this._amount = v
        this.redraw()
    }

    get amount() {
        return this._amount
    }

    setupUniforms(operation) {
        super.setupUniforms(operation)
        this._setUniform("amount", this._amount, this.gl.uniform1f)
    }

    useDefault() {
        return this._amount === 0
    }

}

GrayscaleShader.fragmentShaderSource = `
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

module.exports = GrayscaleShader;
