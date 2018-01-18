/**
 * Copyright Metrological, 2017
 */

let Shader = require('../../src/core/Shader')

//@see https://www.shadertoy.com/view/MdXSDj
class BeatShader extends Shader {

    constructor(ctx) {
        super(ctx)
        this._time = 0
    }

    getFragmentShaderSource() {
        return BeatShader.fragmentShaderSource
    }

    get time() {
        return this._time
    }

    set time(v) {
        this._time = v
        this.redraw()
    }

    setupUniforms(operation) {
        super.setupUniforms(operation)
        this._setUniform("iResolution", new Float32Array([operation.getRenderWidth(), operation.getRenderHeight(), 0]), this.gl.uniform3fv)
        this._setUniform("iTime", this._time, this.gl.uniform1f)
    }

}

BeatShader.toyShaderSource = `
vec3 saturate(vec3 a)
{
	return clamp(a, 0.0, 1.0);
}
vec2 saturate(vec2 a)
{
	return clamp(a, 0.0, 1.0);
}
float saturate(float a)
{
	return clamp(a, 0.0, 1.0);
}

float rand(float a)
{
	return fract(sin(a*87654.321)*54321.123);
}

float pulse(float a)
{
	return sin(saturate(a)*3.14159);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = fragCoord.xy / iResolution.xy;
	uv -= 0.5;
	uv.x *= iResolution.x/iResolution.y;

	float bpm = 80.0;
	float beatH2 = fract(iTime*0.5*bpm/60.0)*2.0;
	float beat4 = fract(iTime*4.0*bpm/60.0)*0.25;
	float measure4 = floor(iTime*2.0*bpm/60.0);
	float measure8 = floor(iTime*4.0*bpm/60.0);

	vec2 waveUV = uv;
	if (rand(measure8) >= 0.5)
		waveUV += pulse(sin(uv.y*18.0 + iTime*70.0))*0.02;
	else
		waveUV += pulse(sin(uv.x*8.0 + iTime*10.0))*0.005;
	float a = atan(uv.x, uv.y) + iTime;
	if (rand(measure4+0.2) > 0.5) 
		waveUV -= sin(a*1.0)*0.5*pulse(beatH2);
	if (rand(measure4+0.1) > 0.5) 
		waveUV -= sin(a*32.0)*0.01*pulse(beat4);
	float dist = pow(length(waveUV) - 0.2 - pulse(beatH2*8.0)*0.02, 0.2);
	
	float noiseWave = texture2D(iChannel0, waveUV * (length(waveUV))+iTime*7.5973).x;
	noiseWave *= 1.0-saturate(pow(length(waveUV) - beatH2, 0.3));
	dist -= noiseWave*0.2;
	fragColor = vec4(dist, dist, dist, 1.0);
}`

BeatShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    
    uniform vec3 iResolution;
    uniform float iTime;
    uniform sampler2D iChannel0;
    varying vec4 vColor;

    ${BeatShader.toyShaderSource}
    
    void main(void){
        vec4 color;
        mainImage(color, gl_FragCoord.xy);
        gl_FragColor = color * vColor;
    }
    
`;

module.exports = BeatShader