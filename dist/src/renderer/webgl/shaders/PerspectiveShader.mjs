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

export default class PerspectiveShader extends DefaultShader {

    constructor(ctx) {
        super(ctx);

        this._fudge = 0.2;
        this._rx = 0;
        this._ry = 0;
        this._z = 1.0;
    }

    setupUniforms(operation) {
        super.setupUniforms(operation);

        const vr = operation.shaderOwner;
        const element = vr.element;

        const pivotX = element.pivotX * vr.w;
        const pivotY = element.pivotY * vr.h;
        const coords = vr.getRenderTextureCoords(pivotX, pivotY);

        // Counter normal rotation.
        const rz = -Math.atan2(vr._renderContext.tc, vr._renderContext.ta);

        const gl = this.gl;
        this._setUniform("pivot", new Float32Array([coords[0], coords[1], 0]), gl.uniform3fv);
        this._setUniform("rot", new Float32Array([this._rx, this._ry, rz]), gl.uniform3fv);
        this._setUniform("z", this._z, gl.uniform1f);
        this._setUniform("fudge", this._fudge, gl.uniform1f);
    }

    set fudge(v) {
        this._fudge = v;
        this.redraw();
    }

    get fudge() {
        return this._fudge;
    }

    get rx() {
        return this._rx;
    }

    set rx(v) {
        this._rx = v;
        this.redraw();
    }

    get ry() {
        return this._ry;
    }

    set ry(v) {
        this._ry = v;
        this.redraw();
    }

    get z() {
        return this._z;
    }

    set z(v) {
        this._z = v;
        this.redraw();
    }

    useDefault() {
        return (this._rx === 0 && this._ry === 0 && this._z === 0);
    }

}

PerspectiveShader.vertexShaderSource = `
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

    uniform float z;
    uniform vec3 pivot;
    uniform vec3 rot;
    varying vec3 pos;

    void main(void) {
        pos = vec3(aVertexPosition.xy, z);
        
        pos -= pivot;
        
        // Undo XY rotation
        mat2 iRotXy = mat2( cos(rot.z), sin(rot.z), 
                           -sin(rot.z), cos(rot.z));
        pos.xy = iRotXy * pos.xy;
        
        // Perform 3d rotations
        gl_Position.x = cos(rot.x) * pos.x - sin(rot.x) * pos.z;
        gl_Position.y = pos.y;
        gl_Position.z = sin(rot.x) * pos.x + cos(rot.x) * pos.z;
        
        pos.x = gl_Position.x;
        pos.y = cos(rot.y) * gl_Position.y - sin(rot.y) * gl_Position.z;
        pos.z = sin(rot.y) * gl_Position.y + cos(rot.y) * gl_Position.z;
        
        // Redo XY rotation
        iRotXy[0][1] = -iRotXy[0][1];
        iRotXy[1][0] = -iRotXy[1][0];
        pos.xy = iRotXy * pos.xy; 

        // Undo translate to pivot position
        pos.xyz += pivot;

        pos = vec3(pos.x * projection.x - 1.0, pos.y * -abs(projection.y) + 1.0, pos.z * projection.x);
        
        // Map coords to gl coordinate space.
        // Set z to 0 because we don't want to perform z-clipping
        gl_Position = vec4(pos.xy, 0.0, z);

        vTextureCoord = aTextureCoord;
        vColor = aColor;
        
        gl_Position.y = -sign(projection.y) * gl_Position.y;
    }
`;

PerspectiveShader.fragmentShaderSource = `
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

    uniform vec3 rot;
    uniform float fudge;

    void main(void) {
        vec2 coords = vTextureCoord;

        coords.xy -= vec2(0.5);
        coords.y = coords.y + (sign(rot[0]) * 0.5 - coords.x) * sin(rot[0]) * fudge * coords.y;
        coords.x = coords.x + (sign(rot[1]) * 0.5 - coords.y) * sin(rot[1]) * fudge * coords.x;
        coords.xy += vec2(0.5);

        if (coords.x < 0.0 || coords.x > 1.0 || coords.y < 0.0 || coords.y > 1.0) {
            gl_FragColor = vec4(0.0);
        } else {
            gl_FragColor = texture2D(uSampler, coords) * vColor;
        }
    }
`;
