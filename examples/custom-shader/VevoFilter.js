/**
 * Copyright Metrological, 2017
 */

let Filter = require('../../src/core/Filter');

class VevoFilter extends Filter {
    constructor(ctx) {
        super(ctx);
        this._rotation = 0;
        this._dist = 0;
        this._rotation2 = 0;
        this._dist2 = 0;
        this._radius = 0.5;
        this._hardness = 1000;
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

    get rotation2() {
        return this._rotation2
    }

    set rotation2(v) {
        this._rotation2 = v
        this.redraw()
    }

    get dist2() {
        return this._dist2
    }

    set dist2(v) {
        this._dist2 = v
        this.redraw()
    }
    
    get radius() {
        return this._radius
    }

    set radius(v) {
        this._radius = v
        this.redraw()
    }

    get hardness() {
        return this._hardness
    }

    set hardness(v) {
        this._hardness = v
        this.redraw()
    }

    getFragmentShaderSource() {
        return VevoFilter.fragmentShaderSource
    }

    setupUniforms(operation) {
        super.setupUniforms(operation)
        this._setUniform("rot", [Math.cos(this._rotation), Math.sin(this._rotation), -Math.sin(this._rotation), Math.cos(this._rotation)], this.gl.uniformMatrix2fv);
        this._setUniform("dist", this._dist * this._dist, this.gl.uniform1f)
        this._setUniform("radius", this._radius * this._radius, this.gl.uniform1f)
        this._setUniform("hardness", this._hardness, this.gl.uniform1f)

        this._setUniform("rot2", [Math.cos(this.rotation2), Math.sin(this.rotation2), -Math.sin(this.rotation2), Math.cos(this.rotation2)], this.gl.uniformMatrix2fv);
        this._setUniform("dist2", this._dist2 * this._dist2, this.gl.uniform1f)
    }

    useDefault() {
        return (this._rotation === 0 && this._radius > 0.71)
    }

}

VevoFilter.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;
    uniform float radius;
    uniform float dist;
    uniform mat2 rot;
    uniform float dist2;
    uniform mat2 rot2;
    uniform float hardness;
    void main(void){
        vec2 delta = vTextureCoord - vec2(0.5, 0.5);
        float d = dot(delta, delta);
        vec4 color = mix(texture2D(uSampler, delta * rot + 0.5), texture2D(uSampler, vTextureCoord), max(0.0, min(1.0, (dist - d) * hardness)));
        
        color = mix(texture2D(uSampler, delta * rot2 + 0.5), color, max(0.0, min(1.0, (dist2 - d) * hardness)));
        
        color = color * max(0.0, min(1.0, (radius - d) * 500.0));
        gl_FragColor = color;
    }
`;


module.exports = VevoFilter