import DefaultShader from "./DefaultShader.mjs";

export default class RoundedRectangleShader extends DefaultShader {
    constructor(context) {
        super(context);
        this._radius = 1;
    }

    set radius(v) {
        if (v < 1) {
            v = 1;
        }
        this._radius = v;
        this.redraw();
    }

    setupUniforms(operation) {
        super.setupUniforms(operation);
        const owner = operation.shaderOwner;

        const renderPrecision = this.ctx.stage.getRenderPrecision();
        this._setUniform('radius',  (this._radius + .5) * renderPrecision, this.gl.uniform1f);
        this._setUniform('resolution', new Float32Array([owner._w * renderPrecision, owner._h * renderPrecision]), this.gl.uniform2fv);
    }
}

RoundedRectangleShader.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    
    attribute vec4 aColor;
    uniform vec2 projection;
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    
    void main(void){
        gl_Position = vec4(aVertexPosition.x * projection.x - 1.0, aVertexPosition.y * -abs(projection.y) + 1.0, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
        vColor = aColor;
        gl_Position.y = -sign(projection.y) * gl_Position.y;
    }
`;

RoundedRectangleShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    #define PI 3.14159265359
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    uniform vec2 resolution;
    uniform float radius;
    float roundBox(vec2 p, vec2 b, float r) {
        float d = length(max(abs(p)-b+r, 0.1))-r;
        return smoothstep(0.0, 1.0, d);
    }
    void main() {
        vec4 color = texture2D(uSampler, vTextureCoord) * vColor;
        vec2 halfRes = 0.5 * resolution.xy;
        float b = roundBox(vTextureCoord.xy * resolution - halfRes, halfRes, radius);
        gl_FragColor = mix(color, vec4(0.0), b);
    }
`;
