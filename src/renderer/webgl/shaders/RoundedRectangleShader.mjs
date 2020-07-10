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

export default class RoundedRectangleShader extends DefaultShader {
    constructor(context) {
        super(context);
        this._radius = 1;

        this._stroke = 0;
        this._fillColor = this._getNormalizedColor(0xffffffff);
        this._strokeColor = this._getNormalizedColor(0x00ffffff);
    }

    set radius(v) {
        if(v < 1) {
            v = 1;
        }
        this._radius = v;
        this.redraw();
    }

    set strokeColor(argb) {
        this._strokeColor = this._getNormalizedColor(argb);
    }

    set fillColor(argb) {
        this._fillColor = this._getNormalizedColor(argb);
    }

    set stroke(num) {
        this._stroke = num;
    }

    _getNormalizedColor(color) {
        const utils = Lightning.StageUtils;
        const col = utils.getRgbaComponentsNormalized(color);
        col[0] *= col[3];
        col[1] *= col[3];
        col[2] *= col[3];
        return col;
    }

    setupUniforms(operation) {
        super.setupUniforms(operation);
        const owner = operation.shaderOwner;

        const renderPrecision = this.ctx.stage.getRenderPrecision();
        this._setUniform('strokeColor', this._strokeColor, this.gl.uniform4fv);
        this._setUniform('fillColor', this._fillColor, this.gl.uniform4fv);
        this._setUniform('radius',  this._radius * renderPrecision, this.gl.uniform1f);
        this._setUniform('stroke',  this._stroke * renderPrecision, this.gl.uniform1f);
        this._setUniform('resolution', new Float32Array([owner._w * renderPrecision, owner._h * renderPrecision]), this.gl.uniform2fv);
    }
}

RoundedRectangleShader.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
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
    precision lowp float;
    #endif

    #define PI 3.14159265359

    varying vec2 vTextureCoord;
    varying vec4 vColor;

    uniform sampler2D uSampler;
    uniform vec2 resolution;
    uniform float radius;
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

        float b = boxDist(vTextureCoord.xy * resolution - halfRes, halfRes - 0.005, radius);
        vec4 tex = mix(vec4(0.0), color * fillColor, fillMask(b));
        gl_FragColor = mix(tex, vColor * strokeColor, innerBorderMask(b, stroke));
    }
`;
