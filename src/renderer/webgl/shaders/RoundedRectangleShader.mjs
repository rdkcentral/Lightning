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

import DefaultShader from "./DefaultShader.mjs";
import StageUtils from "../../../tree/StageUtils.mjs";

export default class RoundedRectangleShader extends DefaultShader {
    constructor(context) {
        super(context);
        this._blend = 0;
        this._radius = [1, 1, 1, 1];
        this._stroke = 0;
        this._fc = 0x00ffffff;
        this._fillColor = this._getNormalizedColor(0xffffffff);
        this._strokeColor = this._getNormalizedColor(0x00ffffff);
    }

    set blend(p) {
        this._blend = Math.min(Math.max(p, 0), 1);
    }

    get blend() {
        return this._blend;
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

    get radius() {
        return this._radius;
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
        return this._radius[3];
    }

    set strokeColor(argb) {
        this._sc = argb;
        this._strokeColor = this._getNormalizedColor(argb);
        this.redraw();
    }

    get strokeColor() {
        return this._sc;
    }

    set fillColor(argb) {
        this._fc = argb;
        this._fillColor = this._getNormalizedColor(argb);
        this.redraw();
    }

    get fillColor() {
        return this._fc;
    }

    set stroke(num) {
        this._stroke = num;
        this.redraw();
    }

    get stroke() {
        return this._stroke;
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
        const _radius = this._radius.map((r) => (r + 0.5) * renderPrecision)
        this._setUniform('radius', new Float32Array(_radius), this.gl.uniform4fv);
        this._setUniform('alpha', operation.getElementCore(0).renderContext.alpha, this.gl.uniform1f);
        this._setUniform('blend', this._blend, this.gl.uniform1f);
        this._setUniform('strokeColor', this._strokeColor, this.gl.uniform4fv);
        this._setUniform('fillColor', this._fillColor, this.gl.uniform4fv);
        this._setUniform('stroke',  this._stroke * renderPrecision, this.gl.uniform1f);
        this._setUniform('resolution', new Float32Array([owner._w * renderPrecision, owner._h * renderPrecision]), this.gl.uniform2fv);
    }
}

RoundedRectangleShader.vertexShaderSource = `
    #ifdef GL_ES
    # ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    # else
    precision lowp float;
    # endif
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

RoundedRectangleShader.fragmentShaderSource = `
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
    uniform vec4 radius;
    uniform float stroke;
    uniform vec4 strokeColor;
    uniform vec4 fillColor;
    uniform float alpha;
    uniform float fill;
    uniform float blend;
    
    float boxDist(vec2 p, vec2 size, float radius){
        size -= vec2(radius);
        vec2 d = abs(p) - size;
        return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - radius;
    }
    
    float fillMask(float dist){
        return clamp(-dist, 0.0, 1.0);
    }
    
    float innerBorderMask(float dist, float width){
        float alpha1 = clamp(dist + width, 0.0, 1.0);
        float alpha2 = clamp(dist, 0.0, 1.0);
        return alpha1 - alpha2;
    }

    void main() {
        vec2 halfRes = 0.5 * resolution.xy;
        float r = 0.0;
        if (vTextureCoord.x < 0.5 && vTextureCoord.y < 0.5) {
            r = radius[0];
        } else if (vTextureCoord.x >= 0.5 && vTextureCoord.y < 0.5) {
            r = radius[1];
        } else if (vTextureCoord.x >= 0.5 && vTextureCoord.y >= 0.5) {
            r = radius[2];
        } else {
            r = radius[3];
        }
        
        float b = boxDist(vTextureCoord.xy * resolution - halfRes, halfRes - 0.005, r);
        vec4 tex = texture2D(uSampler, vTextureCoord) * vColor;
        vec4 blend = mix(vec4(1.0) * alpha, tex, blend);     
        vec4 layer1 = mix(vec4(0.0), tex * fillColor, fillMask(b));
        gl_FragColor = mix(layer1, blend * strokeColor, innerBorderMask(b + 1.0, stroke));
    }
`;
