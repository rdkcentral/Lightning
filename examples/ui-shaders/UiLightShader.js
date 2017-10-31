/**
 * Copyright Metrological, 2017
 */

let Shader = require('../../src/core/Shader')

// @see https://www.tomdalling.com/blog/modern-opengl/07-more-lighting-ambient-specular-attenuation-gamma/

class UiLightShader extends Shader {

    constructor(ctx) {
        super(ctx)
        this._color = 0xf4d942
        this._intensity = 1
        this._x = 0
        this._y = 0
        this._z = -150

        this._shadowView = null
        this._shadowViewZ = 0
    }

    get shadowView() {
        return this._shadowView
    }

    set shadowView(v) {
        if (this._shadowView) {
            this._shadowView.visitExit = null;
        }

        this._shadowView = v
        if (v) {
            this._shadowView.visitExit = (view, recalc) => {
                if (recalc) {
                    this.redraw();
                }
            }
        }
        this.redraw()
    }

    get shadowViewZ() {
        return this._shadowViewZ
    }

    set shadowViewZ(z) {
        this._shadowViewZ = z
        this.redraw()
    }

    get color() {
        return this._color
    }

    set color(v) {
        this._color = v
        this.redraw()
    }

    get intensity() {
        return this._intensity
    }

    set intensity(v) {
        this._intensity = v
        this.redraw()
    }

    get x() {
        return this._x
    }

    set x(v) {
        this._x = v
        this.redraw()
    }

    get y() {
        return this._y
    }

    set y(v) {
        this._y = v
        this.redraw()
    }

    get z() {
        return this._z
    }

    set z(v) {
        this._z = v
        this.redraw()
    }

    setupUniforms(operation) {
        super.setupUniforms(operation)
        this._setUniform("light", new Float32Array([this._x, this._y, this._z]), this.gl.uniform3fv)
        let col = StageUtils.getRgbComponentsNormalized(this._color);
        col = col.map(v => this._intensity * v);
        this._setUniform("lightColor", new Float32Array(col), this.gl.uniform3fv)

        if (this._shadowView) {
            let coords = this._shadowView._core.getRenderTextureCoords(0, 0);
            let sx = coords[0];
            let sy = coords[1];
            coords = this._shadowView._core.getRenderTextureCoords(this._shadowView.renderWidth, this._shadowView.renderHeight);
            let ex = coords[0];
            let ey = coords[1];

            this._setUniform("s", new Float32Array([sx, sy]), this.gl.uniform2fv)
            this._setUniform("e", new Float32Array([ex, ey]), this.gl.uniform2fv)
            this._setUniform("sm", (this._z != 0) ? (this._shadowViewZ / this._z) : 0, this.gl.uniform1f)
        } else {
            this._setUniform("sm", 0, this.gl.uniform1f)
        }

    }

}

UiLightShader.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    attribute vec4 aColor;
    uniform vec2 projection;
    uniform vec3 light;
    uniform vec3 eye;
    uniform float sm;
    varying vec2 vTextureCoord;
    varying vec3 distLight;
    varying vec4 vColor;
    varying vec2 vShadowLayerCoord;
    void main(void){
        distLight = vec3(aVertexPosition, 0.0) - light;
        vShadowLayerCoord = (distLight.xy * sm + light.xy);
        gl_Position = vec4(aVertexPosition.x * projection.x - 1.0, aVertexPosition.y * -abs(projection.y) + 1.0, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
        vColor = aColor;
        gl_Position.y = -sign(projection.y) * gl_Position.y;
    }
`;

UiLightShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec3 distLight;
    varying vec4 vColor;
    varying vec2 vShadowLayerCoord;

    uniform sampler2D uSampler;
    uniform vec3 lightColor;
    uniform vec2 s;
    uniform vec2 e;
    uniform float sm;

    void main(void){
        float d = length(distLight);
        vec3 normDistLight = distLight / d;
        vec3 multiColor = (0.8 * vColor.rgb * lightColor * normDistLight.z);
        if (sm > 0.0) {
            vec2 delta = min((vShadowLayerCoord - s), (e - vShadowLayerCoord));
            float dm = 0.8 * max(0.0, 1.0 - max(0.0, 0.03 * min(delta.x, delta.y)));
            multiColor.rgb = multiColor.rgb * dm * dm;
        }
        multiColor = multiColor + 0.2 * vColor.rgb;
        gl_FragColor = texture2D(uSampler, vTextureCoord) * vec4(multiColor, vColor.a);
    }
`;

let StageUtils = require('../../src/core/StageUtils');

module.exports = UiLightShader