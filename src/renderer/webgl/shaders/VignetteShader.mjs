/**
 * WIP
 */

import DefaultShader from "./DefaultShader.mjs";

export default class VignetteShader extends DefaultShader {
    constructor(context) {
        super(context);
        this._magnitude = 1.3;
        this._intensity = 0.7;
        this._mountX = 0.0;
        this._mountY = 0.0;
    }

    setupUniforms(operation) {
        super.setupUniforms(operation);

        this._setUniform("magnitude", this._magnitude , this.gl.uniform1f);
        this._setUniform("intensity", this._intensity, this.gl.uniform1f);
        this._setUniform("mountX", this._mountX, this.gl.uniform1f);
        this._setUniform("mountY", this._mountY, this.gl.uniform1f);
        this.redraw()
    }
    get mountX() {
        return this._mountX;
    }

    set mountX(v) {
        this._mountX = v;
        this.redraw();
    }

    get mountY() {
        return this._mountY;
    }

    set mountY(v) {
        this._mountY = v;
        this.redraw();
    }

    get intensity() {
        return this._intensity;
    }

    set intensity(v) {
        this._intensity = v;
        this.redraw();
    }

    get magnitude() {
        return this._magnitude;

    }

    set magnitude(v) {
        this._magnitude = v;
        this.redraw();
    }
}

VignetteShader.vertexShaderSource = DefaultShader.vertexShaderSource;

VignetteShader.fragmentShaderSource = `

    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    uniform sampler2D uSampler;

    uniform float magnitude;
    uniform float intensity;
    uniform float mountX;
    uniform float mountY;

    void main() {
        vec2 mount = vec2(mountX, mountY);
        vec2 uv = vTextureCoord.xy - mount;
        uv.x = clamp(uv.x, 0.0, 1.0);
        uv.y = clamp(uv.y, 0.0, 1.0);
   
        uv *=  1.00 - uv.yx;
        float vig = uv.x * uv.y * 25.0 * intensity;
        vig = pow(vig, 0.45 * magnitude);
        vec4 fragColor = vec4(vig) * vColor;
        gl_FragColor = texture2D(uSampler, vTextureCoord) * fragColor;

    }
`