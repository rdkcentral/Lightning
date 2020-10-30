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

export default class RadialGradientShader extends DefaultShader {
    constructor(context) {
        super(context);
        this._anchor = [0, 0];
        this._ic = 0xffffffff;
        this._normalizedIC = this._getNormalizedColor(this._ic);
        this._oc = 0x00ffffff;
        this._normalizedOC = this._getNormalizedColor(this._oc);
        this._radius = 0;
    }

    set radius(v) {
        this._radius = v;
        this.redraw();
    }

    set innerColor(argb) {
        this._ic = argb;
        this._normalizedIC = this._getNormalizedColor(argb);
        this.redraw();
    }

    get innerColor() {
        return this._ic;
    }

    set outerColor(argb) {
        this._oc = argb;
        this._normalizedOC = this._getNormalizedColor(argb);
        this.redraw();
    }

    set color(argb) {
        this.innerColor = argb;
    }

    get color() {
        return this.innerColor;
    }

    get outerColor() {
        return this._ic;
    }

    set x(f) {
        this._x = f;
        this.redraw();
    }

    set y(f) {
        this._y = f;
        this.redraw();
    }

    set anchor(v) {
        if(Array.isArray(v) && v.length === 2) {
            this._anchor = v;
        }
        else if(Array.isArray(v)) {
            this._anchor = [v[0], v[1] || v[0]];
        }
        else {
            this._anchor = [v, v];
        }
        this.redraw();
    }

    get anchor() {
        return this._anchor[0];
    }

    set anchorY(f) {
        this._anchor[1] = f;
        this.redraw();
    }

    get anchorY() {
        return this._anchor[1];
    }

    set anchorX(f) {
        this._anchor[0] = f;
        this.redraw();
    }

    get anchorX() {
        return this._anchor[0];
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

        if(this._x) {
            this._anchor[0] = this._x / owner.w;
        }
        if(this._y) {
            this._anchor[1] = this._y / owner.h;
        }

        if(this._radius === 0) {
            this._radius = owner.w * 0.5;
        }

        this._setUniform('innerColor', this._normalizedIC, this.gl.uniform4fv);
        this._setUniform('fill', StageUtils.getRgbaComponentsNormalized(this._oc)[3], this.gl.uniform1f);
        this._setUniform('outerColor', this._normalizedOC, this.gl.uniform4fv);

        this._setUniform('anchor', new Float32Array(this._anchor),  this.gl.uniform2fv);
        this._setUniform('resolution', new Float32Array([owner._w, owner._h]),  this.gl.uniform2fv);
        this._setUniform('alpha', operation.getElementCore(0).renderContext.alpha, this.gl.uniform1f);

        this._setUniform('radius',  (this._radius + .5), this.gl.uniform1f);
    }
}

RadialGradientShader.fragmentShaderSource = `
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
    uniform sampler2D uSampler;
    uniform vec2 resolution;
    uniform vec2 anchor;
    uniform vec4 innerColor;
    uniform vec4 outerColor;
    uniform float radius;
    uniform float alpha;
    uniform float fill;
    
    void main() {
        vec2 pos = anchor * resolution.xy;
        vec2 point = vTextureCoord.xy * resolution;
        float d = length((point - (anchor  * resolution)) / (radius * 2.0));
        vec4 color = mix(texture2D(uSampler, vTextureCoord) * vColor, outerColor * alpha, fill);
        gl_FragColor = mix(innerColor * alpha, color, smoothstep(0.0, 1.0, d));
    }
`;

