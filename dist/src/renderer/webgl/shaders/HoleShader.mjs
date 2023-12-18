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

export default class HoleShader extends DefaultShader {

    constructor(context) {
        super(context);
        this._x = 0;
        this._y = 0;
        this._w = 0;
        this._h = 0;
        this._radius = 0;
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
        this._radius = v;
        this.redraw();
    }

    setupUniforms(operation) {
        super.setupUniforms(operation);

        const owner = operation.shaderOwner;
        const renderPrecision = this.ctx.stage.getRenderPrecision()

        this._setUniform("x", this._x * renderPrecision, this.gl.uniform1f);
        this._setUniform("y", this._y * renderPrecision, this.gl.uniform1f);
        this._setUniform("w", this._w * renderPrecision, this.gl.uniform1f);
        this._setUniform("h", this._h * renderPrecision, this.gl.uniform1f);
        this._setUniform('radius',  (this._radius + .5) * renderPrecision, this.gl.uniform1f);
        this._setUniform('resolution', new Float32Array([owner._w * renderPrecision, owner._h * renderPrecision]), this.gl.uniform2fv);
    }

    useDefault() {
        return (this._x === 0 && this._y === 0 && this._w === 0 && this._h === 0)
    }
}

HoleShader.vertexShaderSource = DefaultShader.vertexShaderSource;

HoleShader.fragmentShaderSource = `
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
    uniform float radius;

    float roundBox(vec2 p, vec2 b, float r) {
        float d = length(max(abs(p)-b+r, 0.1))-r;
        return smoothstep(1.0, 0.0, d);
    }

    void main(void){
        vec4 color = texture2D(uSampler, vTextureCoord);
        vec2 pos = vTextureCoord.xy * resolution - vec2(x, y) - vec2(w, h) / 2.0;
        vec2 size = vec2(w, h) / 2.0;
        float b = roundBox(pos, size, radius);
        gl_FragColor = mix(color, vec4(0.0), b) * vColor;
    }
`;
