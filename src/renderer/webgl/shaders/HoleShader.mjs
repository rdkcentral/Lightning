import DefaultShader from "./DefaultShader.mjs";

export default class HoleShader extends DefaultShader {

    constructor(context) {
        super(context);
        this._x = 0;
        this._y = 0;
        this._w = 0;
        this._h = 0;
        this._radius = 0;
    }

    get x() {
        return this._x;
    }

    set x(v) {
        this._x = v;
        this.redraw();
    }

    get y() {
        return this._y;
    }

    set y(v) {
        this._y = v;
        this.redraw();
    }

    get w() {
        return this._w;
    }

    set w(v) {
        this._w = v;
        this.redraw();
    }

    get h() {
        return this._h;
    }

    set h(v) {
        this._h = v;
        this.redraw();
    }

    get radius() {
        return this._radius;
    }

    set radius(v) {
        this._radius = v;
        this.redraw();
    }

    setupUniforms(operation) {
        super.setupUniforms(operation)
        this._setUniform("x", this._x, this.gl.uniform1f);
        this._setUniform("y", this._y, this.gl.uniform1f);
        this._setUniform("w", this._w, this.gl.uniform1f);
        this._setUniform("h", this._h, this.gl.uniform1f);
        const owner = operation.shaderOwner;
        const renderPrecision = this.ctx.stage.getRenderPrecision()
        this._setUniform('radius',  (this._radius + .5) * renderPrecision, this.gl.uniform1f);
        this._setUniform('resolution', new Float32Array([owner._w * renderPrecision, owner._h * renderPrecision]), this.gl.uniform2fv);
    }

    useDefault() {
        return (this._x === 0 && this._y === 0 && this._w === 0 && this._h === 0)
    }
}

HoleShader.vertexShaderSource = DefaultShader.vertexShaderSource;

HoleShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    uniform float x;
    uniform float y;
    uniform float w;
    uniform float h;
    uniform vec2 resolution;
    uniform float radius;

    float roundBox(vec2 p, vec2 b, float r) {
        float d = length(max(abs(p)-b+r, 0.1))-r;
        return smoothstep(1.0, 0.0, d);
    }

    void main(void){
        vec4 color = texture2D(uSampler, vTextureCoord);
        vec2 pos = vTextureCoord.xy * resolution - vec2(x, y) - vec2(w, h) / 2.0;
        vec2 size = vec2(w, h) / 2.0;
        float b = roundBox(pos, size, radius);
        gl_FragColor = mix(color, vec4(0.0), b);
    }
`;