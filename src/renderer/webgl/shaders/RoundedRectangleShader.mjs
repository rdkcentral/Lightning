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

export default class RoundedRectangleShader extends DefaultShader {
    constructor(context) {
        super(context);
        this._radius = [1, 1, 1, 1];
        this._stroke = 0;
        this._fillColor = this._getNormalizedColor(0xffffffff);
        this._strokeColor = this._getNormalizedColor(0x00ffffff);
    }

    set radius(v) {
        if (Array.isArray(v)) {
            this._radius = v;
        } else {
            this._radius = [v, v, v, v];
        }
        this.redraw();
    }

    get radius() {
        return this._radius;
    }

    set strokeColor(argb) {
        this._strokeColor = this._getNormalizedColor(argb);
        this.redraw();
    }

    set fillColor(argb) {
        this._fillColor = this._getNormalizedColor(argb);
        this.redraw();
    }

    set stroke(num) {
        this._stroke = num;
        this.redraw();
    }

    _getNormalizedColor(color) {
        const col = StageUtils.getRgbaComponentsNormalized(color);
        col[0] *= col[3];
        col[1] *= col[3];
        col[2] *= col[3];
        return col;
    }

    setupUniforms(operation) {
        super.setupUniforms(operation);
        const owner = operation.shaderOwner;

        const renderPrecision = this.ctx.stage.getRenderPrecision();
        const _radius = this._radius.map((r) => (r + 0.5) * renderPrecision)
        this._setUniform('radius', new Float32Array(_radius), this.gl.uniform4fv);
        this._setUniform('strokeColor', new Float32Array(this._strokeColor), this.gl.uniform4fv);
        this._setUniform('fillColor', new Float32Array(this._fillColor), this.gl.uniform4fv);
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
        vec4 color = texture2D(uSampler, vTextureCoord) * vColor;
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
        vec4 tex = mix(vec4(0.0), color * fillColor, fillMask(b));
        gl_FragColor = mix(tex, vColor * strokeColor, innerBorderMask(b, stroke));
    }
`;
