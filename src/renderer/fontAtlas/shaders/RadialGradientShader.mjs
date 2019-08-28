import DefaultShader from "./DefaultShader.mjs";
import StageUtils from "../../../tree/StageUtils.mjs";

export default class RadialGradientShader extends DefaultShader {
    
    constructor(context) {
        super(context);
        
        this._x = 0;
        this._y = 0;

        this.color = 0xFFFF0000;

        this._radiusX = 100;
        this._radiusY = 100;
    }

    set x(v) {
        this._x = v;
        this.redraw();
    }

    set y(v) {
        this._y = v;
        this.redraw();
    }

    set radiusX(v) {
        this._radiusX = v;
        this.redraw();
    }

    get radiusX() {
        return this._radiusX;
    }

    set radiusY(v) {
        this._radiusY = v;
        this.redraw();
    }

    get radiusY() {
        return this._radiusY;
    }

    set radius(v) {
        this.radiusX = v;
        this.radiusY = v;
    }

    get color() {
        return this._color;
    }

    set color(v) {
        if (this._color !== v) {
            const col = StageUtils.getRgbaComponentsNormalized(v);
            col[0] = col[0] * col[3];
            col[1] = col[1] * col[3];
            col[2] = col[2] * col[3];

            this._rawColor = new Float32Array(col);

            this.redraw();

            this._color = v;
        }
    }

    setupUniforms(operation) {
        super.setupUniforms(operation);
        // We substract half a pixel to get a better cutoff effect.
        const rtc = operation.getNormalRenderTextureCoords(this._x, this._y);
        this._setUniform("center", new Float32Array(rtc), this.gl.uniform2fv);

        this._setUniform("radius", 2 * this._radiusX / operation.getRenderWidth(), this.gl.uniform1f);


        // Radial gradient shader is expected to be used on a single element. That element's alpha is used.
        this._setUniform("alpha", operation.getElementCore(0).renderContext.alpha, this.gl.uniform1f);

        this._setUniform("color", this._rawColor, this.gl.uniform4fv);
        this._setUniform("aspectRatio", (this._radiusX/this._radiusY) * operation.getRenderHeight()/operation.getRenderWidth(), this.gl.uniform1f);
    }

}

RadialGradientShader.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    attribute vec4 aColor;
    uniform vec2 projection;
    uniform vec2 center;
    uniform float aspectRatio;
    varying vec2 pos;
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    void main(void){
        gl_Position = vec4(aVertexPosition.x * projection.x - 1.0, aVertexPosition.y * -abs(projection.y) + 1.0, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
        vColor = aColor;
        gl_Position.y = -sign(projection.y) * gl_Position.y;
        pos = gl_Position.xy - center;
        pos.y = pos.y * aspectRatio;
    }
`;

RadialGradientShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    varying vec2 pos;
    uniform sampler2D uSampler;
    uniform float radius;
    uniform vec4 color;
    uniform float alpha;
    void main(void){
        float dist = length(pos);
        gl_FragColor = mix(color * alpha, texture2D(uSampler, vTextureCoord) * vColor, min(1.0, dist / radius));
    }
`;

