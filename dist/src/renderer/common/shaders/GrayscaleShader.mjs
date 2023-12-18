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

import C2dDefaultShader from "../../c2d/shaders/DefaultShader.mjs";
import WebGLDefaultShader from "../../webgl/shaders/DefaultShader.mjs";

export class WebGLGrayscaleShader extends WebGLDefaultShader {

    constructor(context) {
        super(context);
        this._amount = 1;
    }

    static getC2d() {
        return C2dGrayscaleShader;
    }


    set amount(v) {
        this._amount = v;
        this.redraw();
    }

    get amount() {
        return this._amount;
    }

    useDefault() {
        return this._amount === 0;
    }

    setupUniforms(operation) {
        super.setupUniforms(operation);
        this._setUniform("amount", this._amount, this.gl.uniform1f);
    }

}

WebGLGrayscaleShader.fragmentShaderSource = `
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
    uniform float amount;
    void main(void){
        vec4 color = texture2D(uSampler, vTextureCoord) * vColor;
        float grayness = 0.2 * color.r + 0.6 * color.g + 0.2 * color.b;
        gl_FragColor = vec4(amount * vec3(grayness, grayness, grayness) + (1.0 - amount) * color.rgb, color.a);
    }
`;

export class C2dGrayscaleShader extends C2dDefaultShader {

    constructor(context) {
        super(context);
        this._amount = 1;
    }

    static getWebGL() {
        return WebGLGrayscaleShader;
    }


    set amount(v) {
        this._amount = v;
        this.redraw();
    }

    get amount() {
        return this._amount;
    }

    useDefault() {
        return this._amount === 0;
    }

    _beforeDrawEl({target}) {
        target.ctx.filter = "grayscale(" + this._amount + ")";
    }

    _afterDrawEl({target}) {
        target.ctx.filter = "none";
    }

}
