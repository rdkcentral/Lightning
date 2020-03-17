import DefaultShader from "./DefaultShader.mjs";

export default class RoundedRectangleShader extends DefaultShader {

    constructor(context) {
        super(context);
        this._radius = [1, 1, 1, 1];
    }

    set radius(v) {
        if (Array.isArray(v)) {
            this._radius = v;
        } else {
            this._radius = [v, v, v, v];
        }
        this.redraw();
    }

    set r0(v) {
        this._radius[0] = v;
        this.redraw();
    }

    set r1(v) {
        this._radius[1] = v;
        this.redraw();
    }

    set r2(v) {
        this._radius[2] = v;
        this.redraw();
    }

    set r3(v) {
        this._radius[3] = v;
        this.redraw();
    }

    setupUniforms(operation) {
        super.setupUniforms(operation);
        const owner = operation.shaderOwner;

        const renderPrecision = this.ctx.stage.getRenderPrecision();
        const _radius = this._radius.map((r) => (r + 0.5) * renderPrecision)
        this._setUniform('radius', new Float32Array(_radius), this.gl.uniform4fv);
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
    uniform vec4 radius;

    float roundBox(vec2 p, vec2 b, float r) {
        float d = length(max(abs(p)-b+r, 0.1))-r;
        return smoothstep(0.0, 1.0, d);
    }

    void main() {
        vec4 color = texture2D(uSampler, vTextureCoord) * vColor;
        vec2 halfRes = 0.5 * resolution.xy;
        float r = 0.0;
        if (vTextureCoord.x < 0.5 && vTextureCoord.y < 0.5) {
            r = radius[0];
        } else if (vTextureCoord.x >= 0.5 && vTextureCoord.y < 0.5) {
            r = radius[1];
        } else if (vTextureCoord.x >= 0.5 && vTextureCoord.y >= 0.5) {
            r = radius[2];
        } else {
            r = radius[3];
        }
        float b = roundBox(vTextureCoord.xy * resolution - halfRes, halfRes, r);
        gl_FragColor = mix(color, vec4(0.0), b);
    }
`;
