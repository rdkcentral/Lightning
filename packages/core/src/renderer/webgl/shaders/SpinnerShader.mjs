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
import StageUtils from '../../../tree/StageUtils.mjs'

export default class SpinnerShader extends DefaultShader {

    constructor(ctx) {
        super(ctx);
        this._radius = 100;
        this._width = 50;
        this._period = 1;
        this._angle = 0.5;
        this._smooth = 0.005;
        this._color = 0xffffffff;
        this._backgroundColor = 0xff000000;
        this._time = Date.now();
    }

    set radius(v) {
        this._radius = v;
        this.redraw();
    }

    set width(v) {
        this._width = v;
        this.redraw();
    }

    set period(v) {
        this._period = v;
        this.redraw();
    }

    set angle(v) {
        this._angle = v
        this.redraw();
    }

    set smooth(v) {
        this._smooth = v;
        this.redraw();
    }

    set color(v) {
        this._color = v;
        this.redraw();
    }

    set backgroundColor(v) {
        this._backgroundColor = v;
        this.redraw();
    }

    setupUniforms(operation) {
        super.setupUniforms(operation);
        const owner = operation.shaderOwner

        this._setUniform("iTime", Date.now() - this._time, this.gl.uniform1f);

        const renderPrecision = this.ctx.stage.getRenderPrecision();
        this._setUniform('radius', this._radius * renderPrecision, this.gl.uniform1f);
        this._setUniform('width', this._width * renderPrecision, this.gl.uniform1f);
        this._setUniform('period', this._period, this.gl.uniform1f);
        this._setUniform('angle', this._angle, this.gl.uniform1f);
        this._setUniform('smooth', this._smooth, this.gl.uniform1f);
        this._setUniform('color', new Float32Array(StageUtils.getRgbaComponentsNormalized(this._color)), this.gl.uniform4fv);
        this._setUniform('backgroundColor', new Float32Array(StageUtils.getRgbaComponentsNormalized(this._backgroundColor)), this.gl.uniform4fv);
        this._setUniform('resolution', new Float32Array([owner._w * renderPrecision, owner._h * renderPrecision]), this.gl.uniform2fv)

        this.redraw()
    }
}

SpinnerShader.vertexShaderSource = DefaultShader.vertexShaderSource;

SpinnerShader.fragmentShaderSource = `
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

    uniform float iTime;
    uniform float radius;
    uniform float width;
    uniform float period;
    uniform float angle;
    uniform float smooth;
    uniform vec2 resolution;

    uniform vec4 color;
    uniform vec4 backgroundColor;

    float ratio = resolution.y / resolution.x;

    vec2 transpose_pos(vec2 pos) {
        if (ratio < 1.) {
            float diff = 0.5 - pos.x;
            pos.x = 0.5 - diff / ratio;
        } else {
            float diff = 0.5 - pos.y;
            pos.y = 0.5 - diff * ratio;
        }
        return pos;
    }

    float get_angle(vec2 pos) {
        pos = transpose_pos(pos);
        float a = atan(pos.y - 0.5, pos.x - 0.5);
        a = (1.0+a/3.14159)/2.0;
        
        return a;
    }

    float dist(vec2 pos1, vec2 pos2) {
        pos1 = transpose_pos(pos1);
        return distance(pos1, pos2);
    }

    void main()
    {
        vec2 fragCoord = vTextureCoord;
        vec4 fragColor = vColor;
        
        vec2 st = vTextureCoord;
        float pct = dist(st, vec2(0.5));

        float a = get_angle(st);
        float t = iTime / 1000.0 / period;

        float inner = max((radius - width) / resolution.x, (radius - width) / resolution.y);
        float outer = max(radius / resolution.x, radius / resolution.y);

        float x1 = mod(t, 1.0);
        float x2 = mod(t + angle, 1.0);

        if (x1 < x2) {
            if (a > x1 && a < x2) {
                float val = (1.0 - (x2 - a) / angle) * smoothstep(0.0, 3. * smooth, (x2 - a));
                fragColor = mix(backgroundColor, color, val);
            } else {
                fragColor = backgroundColor;
            }
        } else {
            if (a < x2) {
                float val = (1.0 - (x2 - a) / angle) * smoothstep(0.0, 3. * smooth, (x2 - a));
                fragColor = mix(backgroundColor, color, val);
            } else if (a > x1) {
                float val = (1.0 - (1.0 + x2 - a) / angle) * smoothstep(0.0, 3. * smooth, (1.0 + x2 - a));
                fragColor = mix(backgroundColor, color, val);
            } else {
                fragColor = backgroundColor;
            }
        }

        float s = smoothstep(inner, inner + smooth + 0.00001, pct) * (1.0 - smoothstep(outer, outer + smooth + 0.00001, pct));
        gl_FragColor = texture2D(uSampler, fragCoord) * vColor * (1. - s * fragColor.a) + fragColor * s;
    }
`;
