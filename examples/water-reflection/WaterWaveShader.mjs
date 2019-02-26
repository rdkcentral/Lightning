import lng from '../../src/lightning.mjs'
export default class WaterWaveShader extends lng.shaders.WebGLDefaultShader {

    constructor(context) {
        super(context);
        this._horizon = 500;
    }

    restart() {
        this._start = Date.now()
    }

    get horizon() {
        return this._horizon;
    }

    set horizon(v) {
        this._horizon = v;
        this.redraw();
    }

    setupUniforms(operation) {
        super.setupUniforms(operation)

        // We substract half a pixel to get a better cutoff effect.
        if (!this._start) {
            this._start = Date.now()
        }
        this._setUniform("t", 0.001 * (Date.now() - this._start), this.gl.uniform1f);

        const tw = operation.getTextureWidth(0);
        const th = operation.getTextureHeight(0);
        this._setUniform("texDims", new Float32Array([tw, th, tw/th]), this.gl.uniform3fv);

        const w = operation.getRenderWidth();
        const h = operation.getRenderHeight();
        this._setUniform("dims", new Float32Array([w, h, w/h]), this.gl.uniform3fv);

        this._setUniform("horizon", this._horizon, this.gl.uniform1f);

        this.redraw()
    }

}

WaterWaveShader.vertexShaderSource = `
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

WaterWaveShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    #define M_PI 3.14159265359
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    uniform vec2 projection;
    uniform sampler2D uSampler;
    uniform sampler2D uSamplerSky;
    uniform float t;
    uniform vec3 texDims;
    uniform vec3 dims;
    uniform float horizon;

    void addNormal(in vec2 xy, in float amplitude, in float t, in float v, in float wavelength, in float angle, inout vec2 delta) {
        vec2 dir = vec2(cos(angle), sin(angle));
        float dist = dot(xy, dir);
        float dz = cos(2.0*M_PI * (v * t - dist) / wavelength) * (amplitude / wavelength);
        delta.x -= dz * dir.x;
        delta.y += dz * dir.y;
    }

    void addRipple(in vec2 xy, in float amplitude, in vec2 pos, in float v, in float wavelength, in float fadeout, in float t0, in float t, inout vec2 delta) {
        vec2 dir = xy - pos;
        float dist = length(dir);
        dir = dir / dist;
        if (t > t0) {
            float outerEdge = (t - t0) * v;
            float iteration = (outerEdge - dist)/wavelength;
            
            if (iteration > 0.25 && iteration < 15.25) {
                float q = 2.0*M_PI * (outerEdge-dist) / wavelength;
                float w = 1.0 + fadeout*dist;
                
                float decrease = (1.0 + 0.5 * max(0.0, (t - t0 - 5.0)));
                if (decrease < 6.0) {
                    amplitude = amplitude / decrease;
                    float dz = amplitude * ((cos(q)/-wavelength)*w - fadeout*sin(q))/(w*w); 
                    delta.x -= dz * dir.x;
                    delta.y += dz * dir.y;
                }
            }
            
        }
    }

    void main(void){
        // Calculate water position.
        vec2 pos = gl_FragCoord.xy;
        pos.x -= dims.x * 0.5;
        if (projection.y > 0.0) {
            pos.y = horizon - pos.y;
        } else {
            pos.y = horizon - (dims.y - pos.y);
        }
                
        float h = 20.0;
        float k = 500.0;

        float mz = h * k / 50.0;
        float z = -((h * k) / pos.y);
        float x = pos.x * z / k;
        
        float mx = dims.x * mz / k;  

        // Calculate top-down normal.
        vec2 delta = vec2(0.0, 0.0);
        vec2 xy = vec2(x, z);
        addNormal(xy, 0.0125, t, 6., 5.0, 1.85*M_PI, delta);
        addNormal(xy, 0.0225, t, 8., 6.0, -0.4*M_PI, delta);
        addNormal(xy, 0.0125, t, 5., 4.0, 0.4*M_PI, delta);

        addRipple(xy, 0.5, vec2(0.0, 50.0), 10.0, 3.0, 0.35, 1.0, t, delta);
        vec3 normal = normalize(vec3(delta.x, -1.0, delta.y));
        
        // Reflection.
        vec3 v = normalize(vec3(x, 100.0, z));
        vec3 r = (v - 2.0 * normal * dot(normal, v));
        
        vec2 reflect = r.xy * ((mz - z) / r.z) + vec2(x, 0.0);
        
        reflect.y = -reflect.y;
        
        vec4 color = texture2D(uSampler, vec2(reflect.x / mx + 0.5, 1.0 - (reflect.y / mx)));
        
        gl_FragColor = color * vColor;
    }
`;

/**
 addRipple mathematics:
 z(x) = sin(2pi*((outerEdge-x) / wavelength)) * (amplitude/(1+cx))
 z(x) = (sin(a+bx)/(1+cx))*amplitude
 with:
 a = 2pi * (outerEdge / wavelength)
 b = -2pi / wavelength
 c = fadeout

 z'(x) = (b*cos(q)*w - c*sin(q))/(w*w) * amplitude

 stel: fadeout = 0, dan:
 z'(x) = b*cos(q) * amplitude =
with:
 q = a+bx = 2pi*(outerEdge/wavelength + (-2pi/wavelength)x) = 2pi*(outerEdge - x)/wavelength
 w = 1+cx = 1+fadeout*x
*/