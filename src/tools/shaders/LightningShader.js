/**
 * Copyright Metrological, 2017
 */

let DefaultShader = require('../../core/DefaultShader');

class LightningShader extends DefaultShader {
    constructor() {
        super(LightningShader.vertexShaderSource, LightningShader.fragmentShaderSrc);

        this._x = 0;
        this._y = 0;
        this._z = 0.5;
        this._strength = 1;
        this._ambient = 0;
    }

    init(vboContext) {
        super.init(vboContext)

        let gl = vboContext.gl;
        this._lightPosAttribute = gl.getUniformLocation(this.glProgram, "lightPos");
        this._strengthAttribute = gl.getUniformLocation(this.glProgram, "strength");
        this._ambientAttribute = gl.getUniformLocation(this.glProgram, "ambient");
    }

    setupUniforms(vboContext) {
        super.setupUniforms(vboContext)
        let gl = vboContext.gl
        gl.uniform3fv(this._lightPosAttribute, new Float32Array([this._x, this._y, this._z]))
        gl.uniform1f(this._strengthAttribute, this._strength)
        gl.uniform1f(this._ambientAttribute, this._ambient)
    }

    set strength(v) {
        this._strength = v;
    }

    get strength() {
        return this._strength;
    }

    set ambient(v) {
        this._ambient = v;
    }

    get ambient() {
        return this._ambient;
    }

    set x(v) {
        this._x = v;
    }

    get x() {
        return this._x;
    }

    set y(v) {
        this._y = v;
    }

    get y() {
        return this._y;
    }

    set z(v) {
        this._z = v;
    }

    get z() {
        return this._z;
    }
}

LightningShader.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    attribute vec4 aColor;
    uniform mat4 projectionMatrix;
    uniform vec3 lightPos;
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    varying vec3 diff;
    void main(void){
        gl_Position = projectionMatrix * vec4(aVertexPosition, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
        vColor = aColor;
        diff = lightPos - gl_Position.xyz;
    }
`;

LightningShader.fragmentShaderSrc = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    varying vec3 diff;
    uniform float strength;
    uniform float ambient;
    uniform sampler2D uSampler;
    void main(void){
        float light = ambient + normalize(diff).z * strength;
        vec4 rgba = texture2D(uSampler, vTextureCoord);
        rgba.rgb = rgba.rgb * light;
        gl_FragColor = rgba * vColor;
    }
`;


module.exports = LightningShader;