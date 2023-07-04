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

import DefaultShader from './DefaultShader.mjs';

export default class FadeOutShader extends DefaultShader {
    constructor(context) {
        super(context);
        this._fade = [0, 0, 0, 0];
    }

    set top(num) {
        this._fade[0] = num;
        this.redraw();
    }

    get top() {
        return this._fade[0];
    }

    set right(num) {
        this._fade[1] = num;
        this.redraw();
    }

    get right() {
        return this._fade[1];
    }

    set bottom(num) {
        this._fade[2] = num;
        this.redraw();
    }

    get bottom() {
        return this._fade[2];
    }

    set left(num) {
        this._fade[3] = num;
        this.redraw();
    }

    get left() {
        return this._fade[3];
    }

    set fade(v) {
        if(Array.isArray(v)) {
            if(v.length === 2) {
                this._fade = [v[0], v[1], v[0], v[1]];
            }
            else if(v.length === 3) {
                this._fade = [v[0], v[1], v[2], this._fade[3]];
            }
            else if (v.length === 4) {
                this._fade = v;
            }
            else {
                this._fade = [v[0], v[0], v[0], v[0]];
            }
        }
        else {
            this._fade = [v, v, v, v];
        }
        this.redraw();
    }

    get fade() {
        return this._fade;
    }

    setupUniforms(operation) {
        super.setupUniforms(operation);
        const owner = operation.shaderOwner;

        const renderPrecision = this.ctx.stage.getRenderPrecision();
        const fade = this._fade.map((f) => f * renderPrecision);
        this._setUniform('fade',  new Float32Array(fade), this.gl.uniform4fv);
        this._setUniform('resolution', new Float32Array([owner._w * renderPrecision, owner._h * renderPrecision]), this.gl.uniform2fv);
    }
}

FadeOutShader.fragmentShaderSource = `
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
    uniform vec4 fade;
    
    void main() {
        vec4 color = texture2D(uSampler, vTextureCoord) * vColor;
        vec2 halfRes = 0.5 * resolution.xy;
        vec2 point = vTextureCoord.xy * resolution.xy;
        
        vec2 pos1;
        vec2 pos2;
        vec2 d;
        float c;
        float t = 0.0;
             
        if(fade[0] > 0.0) {
            pos1 = vec2(point.x, point.y);
            pos2 = vec2(point.x, point.y + fade[0]);
            d = pos2 - pos1;
            c = dot(pos1, d) / dot(d, d);
            t = smoothstep(0.0, 1.0, clamp(c, 0.0, 1.0));
            color = mix(vec4(0.0), color, t);
        }
        
        if(fade[1] > 0.0) {
            vec2 pos1 = vec2(point.x - resolution.x - fade[1], vTextureCoord.y);
            vec2 pos2 = vec2(point.x - resolution.x, vTextureCoord.y);
            d = pos1 - pos2;
            c = dot(pos2, d) / dot(d, d);
            t = smoothstep(0.0, 1.0, clamp(c, 0.0, 1.0));
            color = mix(vec4(0.0), color, t);
        }
        
        if(fade[2] > 0.0) {
            vec2 pos1 = vec2(vTextureCoord.x, point.y - resolution.y - fade[2]);
            vec2 pos2 = vec2(vTextureCoord.x, point.y - resolution.y);
            d = pos1 - pos2;
            c = dot(pos2, d) / dot(d, d);
            t = smoothstep(0.0, 1.0, clamp(c, 0.0, 1.0));
            color = mix(vec4(0.0), color, t);
        }
        
        if(fade[3] > 0.0) {
            pos1 = vec2(point.x, point.y);
            pos2 = vec2(point.x + fade[3], point.y);
            d = pos2 - pos1;
            c = dot(pos1, d) / dot(d, d);
            t = smoothstep(0.0, 1.0, clamp(c, 0.0, 1.0));
            color = mix(vec4(0.0), color, t);
        }
        
        gl_FragColor = color;
    }
`;
