/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 RDK Management
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

import DefaultShader from "./DefaultShader.mjs";
import StageUtils from '../../../tree/StageUtils.mjs';

export default class LinearGradientShader extends DefaultShader {
    constructor(context) {
        super(context);
        this._from = [0.5, 1.0];
        this._to = [0.5, 0];
        this._degrees = 0;
        this._calcByAngle = 0;
        this._fromColor = this._getNormalizedColor(0xffffffff);
        this._toColor = this._getNormalizedColor(0xff000000);
    }

    set from(v) {
        this._from = this._normalizePoint(v);
        this.redraw();
    }

    get from() {
        return this._from;
    }

    set fromX(num) {
        this._from[0] = num;
        this.redraw();
    }

    get fromX() {
        return this._from[0];
    }

    set fromY(num) {
        this._from[1] = num;
    }

    get fromY() {
        return this._from[1];
    }

    set to(v) {
        this._to = this._normalizePoint(v);
        this.redraw();
    }

    get to() {
        return this._to;
    }

    set toX(num) {
        this._to[0] = num;
        this.redraw();
    }

    get toX() {
        return this._to[0];
    }

    set toY(num) {
        this._to[1] = num;
    }

    get toY() {
        return this._to[1];
    }

    set fromColor(argb) {
        this._fc = argb;
        this._fromColor = this._getNormalizedColor(argb);
        this.redraw();
    }

    get fromColor() {
        return this._fc;
    }

    set toColor(argb) {
        this._tc = argb;
        this._toColor = this._getNormalizedColor(argb);
        this.redraw();
    }

    get toColor() {
        return this._tc;
    }

    set degrees(num) {
        this._degrees = num;
        this._calcByAngle = 1;
        this.redraw();
    }

    get degrees() {
        return this._degrees;
    }

    _normalizePoint(v) {
        const isArr = Array.isArray(v);
        if(isArr && v.length !== 2) {
            return [v[0], v[0]];
        }
        else if(isArr && v.length === 0) {
            return [0, 0];
        }
        else if(isArr) {
            return v;
        }
        else if(!isArr) {
            const p = parseFloat(v);
            return [p, p];
        }
    }

    _getNormalizedColor(color) {
        const col = StageUtils.getRgbaComponentsNormalized(color);
        col[0] *= col[3];
        col[1] *= col[3];
        col[2] *= col[3];
        return new Float32Array(col);
    }


    setupUniforms(operation) {
        super.setupUniforms(operation);
        const owner = operation.shaderOwner;
        this._setUniform('resolution', new Float32Array([owner._w, owner._h]), this.gl.uniform2fv);
        this._setUniform('from', new Float32Array(this._from), this.gl.uniform2fv);
        this._setUniform('to', new Float32Array(this._to), this.gl.uniform2fv);
        this._setUniform('fromColor', this._fromColor, this.gl.uniform4fv);
        this._setUniform('toColor', this._toColor, this.gl.uniform4fv);

        this._setUniform('degrees',  this._degrees, this.gl.uniform1f);
        this._setUniform('calcByAngle', this._calcByAngle, this.gl.uniform1f);
    }
}

LinearGradientShader.fragmentShaderSource = `
    #ifdef GL_ES
    # ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    # else
    precision lowp float;
    # endif
    #endif
    
    #define PI 3.14159265359
    
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    uniform vec2 resolution;
    uniform vec2 from;
    uniform vec2 to;
    
    uniform vec4 fromColor;
    uniform vec4 toColor;
    
    uniform float degrees;
    uniform float calcByAngle;
    
    vec4 fromLinear(vec4 linearRGB) {
        vec4 higher = vec4(1.055)*pow(linearRGB, vec4(1.0/2.4)) - vec4(0.055);
        vec4 lower = linearRGB * vec4(12.92);
        return mix(higher, lower, 1.0);
    }
    
    vec4 toLinear(vec4 sRGB) {
        vec4 higher = pow((sRGB + vec4(0.055))/vec4(1.055), vec4(2.4));
        vec4 lower = sRGB/vec4(12.92);
        return mix(higher, lower, 1.0);
    }
    
    float degToRad(float d) {
        return d * PI / 180.0;
    }
    
    vec2 calcPoint(float d) {        
        if(d >= 315.0 || d <= 45.0) {
            return vec2(0.5 - (tan(degToRad(d)) * 0.5), 1.0);
        }
        if(d > 45.0 && d <= 135.0) {
            return vec2(0.0, 0.5 + (tan(degToRad(90.0) - degToRad(d)) * 0.5));
        }
        if(d > 135.0 && d <= 225.0) {
            return vec2(0.5 - (tan(degToRad(180.0) - degToRad(d)) * 0.5), 0.0);
        }
        if(d > 225.0 && d < 315.0) {
            return vec2(1.0, 0.5 - (tan(degToRad(270.0) - degToRad(d)) * 0.5));
        }
    }
 
    void main() {
        vec2 f = from;
        vec2 t = to;
        vec2 center = vTextureCoord.xy * resolution - (resolution * 0.5);
        if(calcByAngle > 0.0) {
            f = calcPoint(degrees);
            t = 1.0 - f;
        }
        f *= resolution;
        t *= resolution;
        
        vec2 gradVec = t - f;
        float value = dot(vTextureCoord.xy * resolution - f, gradVec) / dot(gradVec, gradVec);
        
        gl_FragColor = mix(fromColor, toColor, clamp(t, 0.0, 1.0));
        // value = clamp(value, 0.0, 1.0);
        // gl_FragColor = fromLinear(mix(toLinear(fromColor * vColor), toLinear(toColor * vColor), value));
    }
`;