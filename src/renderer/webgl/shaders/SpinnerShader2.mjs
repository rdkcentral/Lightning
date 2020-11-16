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
import StageUtils from "../../../tree/StageUtils.mjs";

export default class SpinnerShader2 extends DefaultShader {
    constructor(context) {
        super(context);
        this._stroke = 4;
        this._clockwise = false;
        this._sc = 0x00000000;
        this._normalizedSC = this._getNormalizedColor(this._sc);
        this._pc = 0xffffffff;
        this._normalizedPC = this._getNormalizedColor(this._pc);
    }

    set radius(v) {
        if(v === 0) {
            v = 1;
        }
        this._radius = v;
    }

    set stroke(value) {
        this._stroke = Math.abs(value);
    }

    get stroke() {
        return this._stroke;
    }

    set time(ts) {
        this._time = ts;
    }

    set primaryColor(argb) {
        this._pc = argb;
        this._normalizedPC = this._getNormalizedColor(argb);
    }

    get primaryColor() {
        return this._pc;
    }

    set secondaryColor(argb) {
        this._sc = argb;
        this._normalizedSC = this._getNormalizedColor(argb);
    }

    get secondaryColor() {
        return this._sc;
    }

    set clockwise(bool) {
        this._clockwise = bool;
    }

    get clockwise() {
        return this._clockwise;
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
        if(!this._time) {
            this._time = new Date().getTime();
        }
        const owner = operation.shaderOwner;
        const now = new Date().getTime();
        const radius = this._radius || (owner._w / 2);

        this._setUniform('resolution', new Float32Array([owner._w, owner._h]),  this.gl.uniform2fv);
        this._setUniform('primaryColor', this._normalizedPC, this.gl.uniform4fv);
        this._setUniform('secondaryColor', this._normalizedSC, this.gl.uniform4fv);
        this._setUniform('stroke',  this._stroke, this.gl.uniform1f);
        this._setUniform('radius',  radius, this.gl.uniform1f);
        this._setUniform('direction',  this._clockwise ? -1 : 1, this.gl.uniform1f);
        this._setUniform('time', (now - this._time) / 1000, this.gl.uniform1f);

        if(this._sc !== this._pc || this._stroke !== radius * 0.5) {
            this.redraw();
        }
    }
}

SpinnerShader2.fragmentShaderSource = `
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
    uniform vec4 primaryColor;
    uniform vec4 secondaryColor;
    uniform float direction;
    uniform float radius;
    uniform float time;
    uniform float stroke;
    
    float circleDist(vec2 p, float radius){
        return length(p) - radius;
    }
    
    float fillMask(float dist){
        return clamp(-dist, 0.0, 1.0);
    }
    
    void main() {
        vec2 halfRes = 0.5 * resolution.xy;
        vec2 center = vTextureCoord.xy * resolution - halfRes;
        
        float c = max(-circleDist(center, radius - stroke), circleDist(center, radius));
        float rot = -time * 4.0 * direction;
        center *= mat2(cos(rot), sin(rot), -sin(rot), cos(rot));
        
        float a = direction * atan(center.x,center.y) * PI * 0.05 + 0.45;
        
        float strokeRad = stroke * 0.5;
        a = max(a, fillMask(circleDist(vec2(center.x, center.y + (radius - strokeRad)), strokeRad)));
        
        vec4 base = mix(vec4(0.0), secondaryColor * vColor, fillMask(c));
        gl_FragColor = mix(base, primaryColor * vColor, fillMask(c) * a);
    }
`;