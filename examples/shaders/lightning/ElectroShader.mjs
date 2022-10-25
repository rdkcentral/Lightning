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
export default class ElectroShader extends lng.shaders.WebGLDefaultShader {

    constructor(context) {
        super(context);
    }

    restart() {
        this._start = Date.now()
    }
    

    set lightColor(v) {
        this._lightColor = v;
    }
    
    setupUniforms(operation) {
        super.setupUniforms(operation)
        const w = operation.getRenderWidth();
        const h = operation.getRenderHeight();
        if (!this._start) {
            this._start = Date.now()
        }

        const renderPrecision = this.ctx.stage.getRenderPrecision();
        const uTime = 0.001 * (Date.now() - this._start);

        this._setUniform("uTime", uTime, this.gl.uniform1f);
        this._setUniform('uResolution', new Float32Array([w * renderPrecision, h * renderPrecision]), this.gl.uniform2fv);
        this._setUniform('uLightcolor', this._lightColor, this.gl.uniform3fv);

        this.redraw()
    }
}
// original: https://www.shadertoy.com/view/4scGWj

ElectroShader.fragmentShaderSource = `
    #ifdef GL_ES
    # ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    # else
    precision lowp float;
    # endif
    #endif   

    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec3 uLightcolor;

    /* discontinuous pseudorandom uniformly distributed in [-0.5, +0.5]^3 */
    vec3 random3(vec3 c) {
        float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));
        vec3 r;
        r.z = fract(512.0*j);
        j *= .125;
        r.x = fract(512.0*j);
        j *= .125;
        r.y = fract(512.0*j);
        return r-0.5;
    }

    /* skew constants for 3d simplex functions */
    const float F3 =  0.3333333;
    const float G3 =  0.1666667;

    /* 3d simplex noise */
    float simplex3d(vec3 p) {
        /* 1. find current tetrahedron T and it's four vertices */
        /* s, s+i1, s+i2, s+1.0 - absolute skewed (integer) coordinates of T vertices */
        /* x, x1, x2, x3 - unskewed coordinates of p relative to each of T vertices*/
        
        /* calculate s and x */
        vec3 s = floor(p + dot(p, vec3(F3)));
        vec3 x = p - s + dot(s, vec3(G3));
        
        /* calculate i1 and i2 */
        vec3 e = step(vec3(0.0), x - x.yzx);
        vec3 i1 = e*(1.0 - e.zxy);
        vec3 i2 = 1.0 - e.zxy*(1.0 - e);
            
        /* x1, x2, x3 */
        vec3 x1 = x - i1 + G3;
        vec3 x2 = x - i2 + 2.0*G3;
        vec3 x3 = x - 1.0 + 3.0*G3;
        
        /* 2. find four surflets and store them in d */
        vec4 w, d;
        
        /* calculate surflet weights */
        w.x = dot(x, x);
        w.y = dot(x1, x1);
        w.z = dot(x2, x2);
        w.w = dot(x3, x3);
        
        /* w fades from 0.6 at the center of the surflet to 0.0 at the margin */
        w = max(0.6 - w, 0.0);
        
        /* calculate surflet components */
        d.x = dot(random3(s), x);
        d.y = dot(random3(s + i1), x1);
        d.z = dot(random3(s + i2), x2);
        d.w = dot(random3(s + 1.0), x3);
        
        /* multiply d by w^4 */
        w *= w;
        w *= w;
        d *= w;
        
        /* 3. return the sum of the four surflets */
        return dot(d, vec4(52.0));
    }

    float noise(vec3 m) {
        return   0.5333333*simplex3d(m)
                +0.2666667*simplex3d(2.0*m)
                +0.1333333*simplex3d(4.0*m)
                +0.0666667*simplex3d(8.0*m);
    }

    void main(void){
        vec2 uv = gl_FragCoord.xy / uResolution.xy;    
        uv = uv * 2. -1.;  
        
        vec2 p = gl_FragCoord.xy/uResolution.x;
        vec3 p3 = vec3(p, uTime*0.4);    
            
        float intensity = noise(vec3(p3*12.0+12.0));
                                
        float t = clamp((uv.x * -uv.x * 0.16) + 0.15, 0., 1.);                         
        float y = abs(intensity * -t + uv.y);
            
        float g = pow(y, 0.2);
                                
        vec3 col = vec3(1.70, 1.48, 1.78);
        col = col * -g + col;                    
        col = col * col;
        col = col * col;

        gl_FragColor = vec4(col, 1.); 
    }
`;
