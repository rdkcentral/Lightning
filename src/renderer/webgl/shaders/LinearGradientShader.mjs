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
        this._from = [0.5, 0.0];
        this._to = [0.5, 1.0];
        this._angle = 0;
        this._calcByAngle = 0;
        this._stops = [];
        this._colors = [];
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

    set colors(arr) {
        this._colors = arr.map((color) => this._getNormalizedColor(color));
        this.redraw();
    }

    set color1(argb) {
        this._colors[0] = this._getNormalizedColor(argb);
        this.redraw();
    }

    set color2(argb) {
        this._colors[1] = this._getNormalizedColor(argb);
        this.redraw();
    }

    set color3(argb) {
        this._colors[2] = this._getNormalizedColor(argb);
        this.redraw();
    }

    set color4(argb) {
        this._colors[3] = this._getNormalizedColor(argb);
        this.redraw();
    }

    set color5(argb) {
        this._colors[4] = this._getNormalizedColor(argb);
        this.redraw();
    }

    set stops(arr) {
        this._stops = arr;
        this.redraw();
    }

    set stop1(f) {
        this._stops[0] = f;
        this.redraw();
    }

    set stop2(f) {
        this._stops[1] = f;
        this.redraw();
    }

    set stop3(f) {
        this._stops[2] = f;
        this.redraw();
    }

    set stop4(f) {
        this._stops[3] = f;
        this.redraw();
    }

    set stop5(f) {
        this._stops[4] = f;
        this.redraw();
    }

    set angle(num) {
        this._angle = num;
        this._calcByAngle = 1;
        this.redraw();
    }

    get degrees() {
        return this._angle;
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
        let stops = this._stops;
        if(stops.length === 0 || (stops && stops.length !== this._colors.length)) {
            const tmp = [];
            for(let i = 0; i < this._colors.length; i++) {
                if(stops[i]) {
                    tmp[i] = stops[i];
                    if(stops[i - 1] === undefined && tmp[i - 2] !== undefined) {
                        tmp[i - 1] = tmp[i - 2] + ((stops[i] - tmp[i - 2]) / 2);
                    }
                }
                else {
                    tmp[i] = i * (1 / (this._colors.length - 1));
                }
            }
            stops = tmp;
        }

        this._setUniform('resolution', new Float32Array([owner._w, owner._h]), this.gl.uniform2fv);
        this._setUniform('alpha', operation.getElementCore(0).renderContext.alpha, this.gl.uniform1f);
        this._setUniform('from', new Float32Array(this._from), this.gl.uniform2fv);
        this._setUniform('to', new Float32Array(this._to), this.gl.uniform2fv);

        this._setUniform('stops', new Float32Array(stops), this.gl.uniform1fv);
        this._setUniform('colorStops', stops.length, this.gl.uniform1i);
        this._setUniform('angle',  this._angle, this.gl.uniform1f);
        this._setUniform('calcByAngle', this._calcByAngle, this.gl.uniform1f);

        this._colors.forEach((color, index) => {
            this._setUniform(`color${index+1}`, color, this.gl.uniform4fv);
        });
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
    uniform float alpha;
    uniform vec2 from;
    uniform vec2 to;
    
    uniform vec4 color1;
    uniform vec4 color2;
    uniform vec4 color3;
    uniform vec4 color4;
    uniform vec4 color5;
    
    uniform float stops[16];
    uniform int colorStops;
    
    uniform float angle;
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
        return d * (PI / 180.0);
    }
    
    vec2 calcPoint(float d, float angle) {
        return d * vec2(cos(angle), sin(angle)) + (resolution * 0.5);
    }
 
    void main() {
        vec2 f = from;
        vec2 t = to;
        vec2 center = vTextureCoord.xy * resolution - (resolution * 0.5);
        
        if(calcByAngle > 0.0) {
            float d = angle + 90.0;
            float a = degToRad(d);
            float lineDist = abs(resolution.x * cos(a)) + abs(resolution.y * sin(a));
            f = calcPoint(lineDist * 0.5, a);
            t = calcPoint(lineDist * 0.5, degToRad(d + 180.0));
        }
        else {
            f *= resolution;
            t *= resolution;
        }
        
        vec2 gradVec = t - f;
        float dist = dot(vTextureCoord.xy * resolution - f, gradVec) / dot(gradVec, gradVec);
        
        vec4 colors[16];
        colors[0] = color1;
        colors[1] = color2;
        colors[2] = color3;
        colors[3] = color4;
        colors[4] = color5;
        
        //start with blank canvas
        vec4 colorOut = vec4(1.0);
        
        if(colorStops == 1) {
            colorOut = colors[0];
        }
        else if(colorStops > 1) {
            float stopCalc = (dist - stops[0]) / (stops[1] - stops[0]);
            colorOut = fromLinear(mix(toLinear(colors[0]), toLinear(colors[1]), stopCalc));
            //max 16 colors?
            for(int i = 1; i < 16-1; i++) {
                if(i < colorStops - 1) {
                    float stopCalc = (dist - stops[i]) / (stops[i + 1] - stops[i]);
                    colorOut = mix(colorOut, colors[i + 1], clamp(stopCalc, 0.0, 1.0));  
                }
                else {break;}
            } 
        }
        
        gl_FragColor = colorOut * alpha;
    }
`;