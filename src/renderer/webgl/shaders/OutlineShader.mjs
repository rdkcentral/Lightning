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

import StageUtils from "../../../tree/StageUtils.mjs";
import DefaultShader from "./DefaultShader.mjs";

export default class OutlineShader extends DefaultShader {

    constructor(ctx) {
        super(ctx);
        this._blend = 0;
        this._width = 0;
        this._c = 0xffffffff;
        this._normalizedColor = this._getNormalizedColor(this._c);
        this._stroke = [0, 0, 0, 0];
    }

    set blend(p) {
        this._blend = Math.min(Math.max(p, 0), 1);
    }

    set width(v) {
        //use setter of stroke to avoid duplicate code
        this.stroke = v;
    }

    get color() {
        return this._c;
    }

    set color(argb) {
        this._c = argb;
        this._normalizedColor = this._getNormalizedColor(argb);
        this.redraw();
    }

    set top(num) {
        this._stroke[0] = num;
        this.redraw();
    }

    get top() {
        return this._stroke[0];
    }

    set right(num) {
        this._stroke[1] = num;
        this.redraw();
    }

    get right() {
        return this._stroke[1];
    }

    set bottom(num) {
        this._stroke[2] = num;
        this.redraw();
    }

    get bottom() {
        return this._stroke[2];
    }

    set left(num) {
        this._stroke[3] = num;
        this.redraw();
    }

    get left() {
        return this._stroke[3];
    }

    set stroke(v) {
        if(Array.isArray(v)) {
            if(v.length === 2) {
                this._stroke = [v[0], v[1], v[0], v[1]];
            }
            else if(v.length === 3) {
                this._stroke = [v[0], v[1], v[2], this._stroke[3]];
            }
            else if (v.length === 4) {
                this._stroke = v;
            }
            else {
                this._stroke = [v[0], v[0], v[0], v[0]];
            }
        }
        else {
            this._stroke = [v, v, v, v];
        }
        this.redraw();
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
        const renderPrecision = this.ctx.stage.getRenderPrecision();
        const stroke = this._stroke.map((s) => s * renderPrecision)
        this._setUniform('alpha', operation.getElementCore(0).renderContext.alpha, this.gl.uniform1f);
        this._setUniform('blend', this._blend, this.gl.uniform1f);
        this._setUniform("color", this._normalizedColor, this.gl.uniform4fv);
        this._setUniform("stroke", new Float32Array(stroke), this.gl.uniform4fv);
        this._setUniform("resolution", new Float32Array([owner._w * renderPrecision, owner._h * renderPrecision]), this.gl.uniform2fv)
    }
}

OutlineShader.fragmentShaderSource = `
    #ifdef GL_ES
    # ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    # else
    precision lowp float;
    # endif
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    uniform vec2 resolution;
    uniform vec4 stroke;
    uniform vec4 color;
    uniform float alpha;
    uniform float blend;
    
    void main(void){
        vec2 p = vTextureCoord.xy * resolution.xy;
        float dist = 0.0;
        if(p.y > stroke[0] 
            && p.x < resolution.x - stroke[1] 
            && p.y < resolution.y - stroke[2]
            && p.x > stroke[3]) {
            dist = 1.0;
        }
        vec4 tex = texture2D(uSampler, vTextureCoord) * vColor;
        vec4 norm = mix(color * alpha, tex, dist);
        vec4 blended = mix(color * tex, vec4(0.0), dist);
        gl_FragColor = mix(norm, blended, blend);
    }
`;

