/**
 * Copyright Metrological, 2017
 */

let Shader = require('../../src/core/Shader')

class PhongShader extends Shader {

    constructor(ctx) {
        super(ctx)
        this._radius = 20
    }

    getFragmentShaderSource() {
        return PhongShader.fragmentShaderSource
    }

    get radius() {
        return this._radius
    }

    set radius(v) {
        this._radius = v
        this.redraw()
    }

    setupUniforms(operation) {
        super.setupUniforms(operation)
        this._setUniform("radius", this._radius, this.gl.uniform1f)
        this._setUniform("modulo", 80, this.gl.uniform1f)
    }

}

PhongShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    uniform float radius;
    uniform float modulo;
    void main(void){
        vec2 p = gl_FragCoord.xy;
        p = mod(p, modulo);
        p = p - 0.5 * modulo;
        float h2 = max(0.0, sqrt(radius * radius - dot(p, p)));
        gl_FragColor = texture2D(uSampler, vTextureCoord);
        gl_FragColor.r = h2 / radius;
    }
`;

module.exports = PhongShader