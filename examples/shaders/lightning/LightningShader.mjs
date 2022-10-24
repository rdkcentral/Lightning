/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 Metrological
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import StageUtils from "../../../src/tree/StageUtils.mjs";
import lng from '../../../src/lightning.mjs'
export default class LightningShader extends lng.shaders.WebGLDefaultShader {

    constructor(context) {
        super(context);
    }

    restart() {
        this._start = Date.now()
    }

    set lightColor(v) {
        this._lightColor = StageUtils.getRgbaComponentsNormalized(v);
    }

    set flash(v) {
        this._flash = v ? 1 : 0;
        setTimeout(() => {
            this._flash = 0;
        }, 400)
    }

    set onFlash(fn) {
        this._onFlash = fn;
    }


    setupUniforms(operation) {
        super.setupUniforms(operation)
        const w = operation.getRenderWidth();
        const h = operation.getRenderHeight();
        if (!this._start) {
            this._start = Date.now()

        }
        const renderPrecision = this.ctx.stage.getRenderPrecision();
        const frame = this.ctx.stage.frameCounter;
        const uTime = 0.001 * (Date.now() - this._start);

        if (this._onFlash) {
            const time = uTime * 5;
            const index = Math.floor(time);
            const p = this.step(0.9, this.hash11(index));
            const flash = p > 0.01 || this._flash;
            if (flash) {
                this._onFlash();
            }
        }


        this._setUniform("uTime", uTime, this.gl.uniform1f);
        this._setUniform('uResolution', new Float32Array([w * renderPrecision, h * renderPrecision]), this.gl.uniform2fv);
        this._setUniform('uFrame', frame, this.gl.uniform1f);
        this._setUniform('uLightcolor', this._lightColor, this.gl.uniform4fv);
        this._setUniform('uFlash', this._flash || 0, this.gl.uniform1f);

        this.redraw()
    }

    step(edge, input) {
        return edge > input ? 0.0 : 1.0;
    }

    hash11(p) {
        p = this.fract(p * .1031);
        p *= p + 33.33;
        p *= p + p;
        return this.fract(p);
    }

    fract(p) {
        let sign = 0;
        let num = Number(p);
        if (isNaN(num) || Math.abs(num) === Infinity) {
            return num;
        } else if (num < 0) {
            num = -num;
            sign = 1;
        }
        if (String(num).includes('.') && !String(num).includes('e')) {
            let toFract = String(num);
            toFract = Number('0' + toFract.slice(toFract.indexOf('.')));
            return Math.abs(sign - toFract);
        } else if (num < 1) {
            return Math.abs(sign - num);
        } else {
            return 0;
        }
    }

}

LightningShader.fragmentShaderSource = `
    #ifdef GL_ES
    # ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    # else
    precision lowp float;
    # endif
    #endif
    uniform float uTime;
    uniform vec2 uResolution;
    uniform float uFrame;
    uniform vec4 uLightcolor;
    uniform bool uFlash;

    const vec3 cloudColor = vec3(0.702,0.776,1.000);
    const vec3 lightColor = vec3(1.000,0.812,0.400);
    float glow, cycle, noise, columns, index;

    vec3 target;
    bool flash;

    float hash11(float p) {
        p = fract(p * .1031);
        p *= p + 33.33;
        p *= p + p;
        return fract(p);
    }
    vec3 hash33(vec3 p3) {
        p3 = fract(p3 * vec3(.1031, .1030, .0973));
        p3 += dot(p3, p3.yxz+33.33);
        return fract((p3.xxy + p3.yxx)*p3.zyx);
    }
    float hash12(vec2 p) {
        vec3 p3  = fract(vec3(p.xyx) * .1031);
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.x + p3.y) * p3.z);
    }
    
    // Mercury
    // https://mercury.sexy/hg_sdf/
    float pModPolar(inout vec2 p, float repetitions) {
        float angle = 6.28/repetitions;
        float a = atan(p.y, p.x) + angle/2.;
        float r = length(p);
        float c = floor(a/angle);
        a = mod(a,angle) - angle/2.;
        p = vec2(cos(a), sin(a))*r;
        // For an odd number of repetitions, fix cell index of the cell in -x direction
        // (cell index would be e.g. -5 and 5 in the two halves of the cell):
        if (abs(c) >= (repetitions/2.)) c = abs(c);
        return c;
    }
    
    mat2 rot(float a) {
        float c = cos(a), s = sin(a);
        return mat2(c,-s,s,c);
    }
    
    vec3 lookAt (vec3 from, vec3 at, vec2 uv, float fov)
    {
      vec3 z = normalize(at-from);
      vec3 x = normalize(cross(z, vec3(0,1,0)));
      vec3 y = normalize(cross(x, z));
      return normalize(z * fov + uv.x * x + uv.y * y);
    }
    
    // fbm gyroid noise
    float gyroid (vec3 seed) { return dot(sin(seed),cos(seed.yzx)); }
    float fbm (vec3 seed) {
        float result = 0.;
        float a = .5;
        for (int i = 0; i < 4; ++i) {
            result += pow(abs(gyroid(seed/a)),3.)*a;
            a /= 2.;
        }
        return result;
    }
    
    // signed distance function
    float map(vec3 p)
    {
        noise = fbm(p+vec3(0,0,uTime*.2));
        
        // cloud
        float dist = length(p*vec3(1,2,1))-1.;
        dist -= noise*.5;
        dist *= .3;
        
        if (uFlash || flash) {
            // lightning
            float fade = smoothstep(3.,0.,p.y);
            p -= fbm(p+cycle)*.3*fade;
            float c = pModPolar(p.xz, columns);
            p.x += .5*min(0.,max(-p.y,0.)-2.);
            float shape = max(p.y+1., length(p.xz)*2.);
            glow += .02/shape;
            dist = min(dist, shape);
        }        
        return dist;
    }

    void main(void){
        // salt
        vec3 rng = hash33(vec3(gl_FragCoord.xy, uFrame));
        
        // coordinates
        vec2 uv = (gl_FragCoord.xy - uResolution.xy/2.)/uResolution.y;
        vec3 color = vec3(0);
        vec3 pos = vec3(0,-1,5);
        vec3 ray = lookAt(pos, vec3(0), uv, 1.);
        
        
        // timeline
        float time = uTime*5.;
        float anim = fract(time);
        index = floor(time);
        float alea = step(.9, hash11(index));
        cycle = index;
        columns = 1.+floor(6.*hash11(index+186.));
        glow = 0.;
        flash = alea > .01;
        
        // raymarch
        float maxDist = 10.;
        const float count = 30.;
        // float steps = 0.;
        float total = 0.;
        float dense = 0.;

        for (float steps = 30.; steps > 0.; --steps) {
            float dist = map(pos);
            dist *= 0.7+0.3*rng.x;
            // sort of volumetric march
            if (dist < .1) {
                dense += .02;
                dist = .02;
            }
            total += dist;
            if (dense >= 1. || total > maxDist) break;
            pos += ray * dist;
        }
        
        // cloud color
        color = cloudColor;
        #define getAO(dir,k) smoothstep(-k,k,map(pos+dir*k)-map(pos-dir*k))
        color *= .5+.5*getAO(vec3(0,1,0),.5);
        color *= .5+.5*getAO(vec3(0,1,0),2.);
        color *= dense;
        
        // lightning color
        color += uLightcolor.xyz * pow(glow, 2.) * (1.-anim);
        color = clamp(color, 0., 1.);
        
        gl_FragColor = vec4(color, 1.);
    }
`;

