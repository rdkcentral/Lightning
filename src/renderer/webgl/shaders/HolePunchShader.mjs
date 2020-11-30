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

export default class HolePunchShader extends DefaultShader {

    constructor(context) {
        super(context);
        this._x = 0;
        this._y = 0;
        this._w = 0;
        this._h = 0;
        this._radius = [0, 0, 0, 0];
    }

    get x() {
        return this._x;
    }

    set x(v) {
        this._x = v;
        this.redraw();
    }

    get y() {
        return this._y;
    }

    set y(v) {
        this._y = v;
        this.redraw();
    }

    get w() {
        return this._w;
    }

    set w(v) {
        this._w = v;
        this.redraw();
    }

    get h() {
        return this._h;
    }

    set h(v) {
        this._h = v;
        this.redraw();
    }

    get radius() {
        return this._radius;
    }

    set radius(v) {
        if(Array.isArray(v)) {
            if(v.length === 2) {
                this._radius = [v[0], v[1], v[0], v[1]];
            }
            else if(v.length === 3) {
                this._radius = [v[0], v[1], v[2], this._radius[3]];
            }
            else if (v.length === 4) {
                this._radius = v;
            }
            else {
                this._radius = [v[0], v[0], v[0], v[0]];
            }
        }
        else {
            this._radius = [v, v, v, v];
        }
        this.redraw();
    }

    set topLeft(num) {
        this._radius[0] = num;
        this.redraw();
    }

    get topLeft() {
        return this._radius[0];
    }

    set topRight(num) {
        this._radius[1] = num;
        this.redraw();
    }

    get topRight() {
        return this._radius[1];
    }

    set bottomRight(num) {
        this._radius[2] = num;
        this.redraw();
    }

    get bottomRight() {
        return this._radius[2];
    }

    set bottomLeft(num) {
        this._radius[3] = num;
        this.redraw();
    }

    get bottomLeft() {
        return this._radius[4];
    }

    setupUniforms(operation) {
        super.setupUniforms(operation);

        const owner = operation.shaderOwner;
        const renderPrecision = this.ctx.stage.getRenderPrecision()
        const _radius = this._radius.map((r) => (r + 0.5) * renderPrecision);
        this._setUniform('radius', new Float32Array(_radius), this.gl.uniform4fv);
        this._setUniform("x", this._x * renderPrecision, this.gl.uniform1f);
        this._setUniform("y", this._y * renderPrecision, this.gl.uniform1f);
        this._setUniform("w", this._w * renderPrecision, this.gl.uniform1f);
        this._setUniform("h", this._h * renderPrecision, this.gl.uniform1f);
        this._setUniform('resolution', new Float32Array([owner._w * renderPrecision, owner._h * renderPrecision]), this.gl.uniform2fv);
    }

    useDefault() {
        return (this._x === 0 && this._y === 0 && this._w === 0 && this._h === 0)
    }
}

HolePunchShader.vertexShaderSource = DefaultShader.vertexShaderSource;

HolePunchShader.fragmentShaderSource = `
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
    uniform float x;
    uniform float y;
    uniform float w;
    uniform float h;
    uniform vec2 resolution;
    uniform vec4 radius;

    float boxDist(vec2 p, vec2 size, float radius){
        size -= vec2(radius);
        vec2 d = abs(p) - floor(size);
        return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - radius;
    }
    
    float fillMask(float dist){
        return clamp(-dist, 0.0, 1.0);
    }

    void main(void){
        float r = 0.0; 
        vec2 pos = vTextureCoord.xy * resolution - vec2(x, y) - vec2(w, h) / 2.0;
        vec2 size = vec2(w, h);
        vec2 halfSize = size * 0.5;
        vec2 pSize = size / resolution;
        vec2 pPivot = vec2(x, y) / resolution;
        
        if( vTextureCoord.x >= pPivot.x && vTextureCoord.x <= pPivot.x + pSize.x * 0.5
            && vTextureCoord.y >= pPivot.y && vTextureCoord.y <= pPivot.y + pSize.y * 0.5) {
            r = radius[0];
        }
        else if(vTextureCoord.x >= pPivot.x + pSize.x * 0.5 && vTextureCoord.x <= pPivot.x + pSize.x
            && vTextureCoord.y >= pPivot.y && vTextureCoord.y <= pPivot.y + pSize.y * 0.5) {
            r = radius[1];
        }
        else if(vTextureCoord.x >= pPivot.x + pSize.x * 0.5 && vTextureCoord.x <= pPivot.x + pSize.x
            && vTextureCoord.y >= pPivot.y + pSize.y * 0.5 && vTextureCoord.y <= pPivot.y + pSize.y) {
            r = radius[2];
        }
        else if(vTextureCoord.x >= pPivot.x && vTextureCoord.x <= pPivot.x + pSize.x * 0.5
            && vTextureCoord.y >= pPivot.y + pSize.y * 0.5 && vTextureCoord.y <= pPivot.y + pSize.y) {
            r = radius[3];
        }
        
        float b = boxDist(pos, halfSize, r);
        vec4 color = texture2D(uSampler, vTextureCoord) * vColor;
        gl_FragColor = mix(color, vec4(0.0), fillMask(b));
    }
`;