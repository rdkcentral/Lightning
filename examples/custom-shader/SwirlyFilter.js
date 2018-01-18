/**
 * Copyright Metrological, 2017
 */

let Filter = require('../../src/core/Filter');

class SwirlyFilter extends Filter {
    constructor(ctx) {
        super(ctx);
        this._rotation = 0;
        this._dist = 0;
        this._radius = 0.5;
    }

    get rotation() {
        return this._rotation
    }

    set rotation(v) {
        this._rotation = v
        this.redraw()
    }

    get dist() {
        return this._dist
    }

    set dist(v) {
        this._dist = v
        this.redraw()
    }

    get radius() {
        return this._radius
    }

    set radius(v) {
        this._radius = v
        this.redraw()
    }
    
    getFragmentShaderSource() {
        return SwirlyFilter.fragmentShaderSource
    }

    setupUniforms(operation) {
        super.setupUniforms(operation)
        this._setUniform("rot", [Math.cos(this._rotation), Math.sin(this._rotation), -Math.sin(this._rotation), Math.cos(this._rotation)], this.gl.uniformMatrix2fv);
        this._setUniform("dist", this._dist * this._dist, this.gl.uniform1f)
        this._setUniform("radius", this._radius * this._radius, this.gl.uniform1f)
    }

    useDefault() {
        return (this._rotation === 0 && this._radius > 0.71)
    }

}

SwirlyFilter.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;
    uniform float radius;
    uniform float dist;
    uniform mat2 rot;
    void main(void){
        vec2 delta = vTextureCoord - vec2(0.5, 0.5);
        float d = dot(delta, delta);
        delta = mix(delta, delta * rot, d - dist);
        delta = delta + 0.5;
        vec4 color = texture2D(uSampler, delta);
        color = color * max(0.0, min(1.0, (radius - d) * 500.0));
        gl_FragColor = color;
    }
`;


module.exports = SwirlyFilter