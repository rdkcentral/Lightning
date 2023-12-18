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

export default class VignetteShader extends DefaultShader {
    constructor(context) {
        super(context);
        this._magnitude = 1.3;
        this._intensity = 0.7;
        this._pivot = [0.5, 0.5];
    }

    setupUniforms(operation) {
        super.setupUniforms(operation);

        this._setUniform("magnitude", this._magnitude , this.gl.uniform1f);
        this._setUniform("intensity", this._intensity, this.gl.uniform1f);
        this._setUniform('pivot', new Float32Array(this._pivot), this.gl.uniform2fv);
        this.redraw()
    }

    set pivot(v) {
        if(Array.isArray(v)) {
            this._pivot = v;
        }
        else {
            this._pivot = [v, v];
        }
        this.redraw();
    }

    get pivotX() {
        return this._pivot[0];
    }

    set pivotX(v) {
        this._pivot[0] = v;
        this.redraw();
    }

    get pivotY() {
        return this._pivot[1];
    }

    set pivotY(v) {
        this._pivot[1] = v;
        this.redraw();
    }

    get intensity() {
        return this._intensity;
    }

    set intensity(v) {
        this._intensity = v;
        this.redraw();
    }

    get magnitude() {
        return this._magnitude;

    }

    set magnitude(v) {
        this._magnitude = v;
        this.redraw();
    }
}

VignetteShader.vertexShaderSource = DefaultShader.vertexShaderSource;

VignetteShader.fragmentShaderSource = `
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

    uniform float magnitude;
    uniform float intensity;
    uniform vec2 pivot;

    void main() {
        vec2 uv = vTextureCoord.xy - pivot + vec2(0.5);
        uv.x = clamp(uv.x, 0.0, 1.0);
        uv.y = clamp(uv.y, 0.0, 1.0);
   
        uv *=  1.00 - uv.yx;
        float vig = uv.x * uv.y * 25.0 * intensity;
        vig = pow(vig, 0.45 * magnitude);
        vec4 fragColor = vec4(vig) * vColor;
        gl_FragColor = texture2D(uSampler, vTextureCoord) * fragColor;

    }
`
