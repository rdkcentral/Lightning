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

/**
 * Base functionality for shader setup/destroy.
 */
export default class WebGLShaderProgram {

    constructor(vertexShaderSource, fragmentShaderSource) {

        this.vertexShaderSource = vertexShaderSource;
        this.fragmentShaderSource = fragmentShaderSource;

        this._program = null;
        this.gl = null;

        this._uniformLocations = new Map();
        this._attributeLocations = new Map();

        this._currentUniformValues = {};
    }

    compile(gl) {
        if (this._program) return;

        this.gl = gl;

        this._program = gl.createProgram();

        let glVertShader = this._glCompile(gl.VERTEX_SHADER, this.vertexShaderSource);
        let glFragShader = this._glCompile(gl.FRAGMENT_SHADER, this.fragmentShaderSource);

        gl.attachShader(this._program, glVertShader);
        gl.attachShader(this._program, glFragShader);
        gl.linkProgram(this._program);

        // if linking fails, then log and cleanup
        if (!gl.getProgramParameter(this._program, gl.LINK_STATUS)) {
            console.error('[Lightning] Error: Could not initialize shader.');
            console.error('[Lightning] gl.VALIDATE_STATUS', gl.getProgramParameter(this._program, gl.VALIDATE_STATUS));
            console.error('[Lightning] gl.getError()', gl.getError());

            // if there is a program info log, log it
            if (gl.getProgramInfoLog(this._program) !== '') {
                console.warn('[Lightning] Warning: gl.getProgramInfoLog()', gl.getProgramInfoLog(this._program));
            }

            gl.deleteProgram(this._program);
            this._program = null;
        }

        // clean up some shaders
        gl.deleteShader(glVertShader);
        gl.deleteShader(glFragShader);
    }

    _glCompile(type, src) {
        let shader = this.gl.createShader(type);

        this.gl.shaderSource(shader, src);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('[Lightning]', this.constructor.name, 'Type: ' + (type === this.gl.VERTEX_SHADER ? 'vertex shader' : 'fragment shader') );
            console.error('[Lightning]', this.gl.getShaderInfoLog(shader));
            let idx = 0;
            console.error('[Lightning]', "========== source ==========\n" + src.split("\n").map(line => "" + (++idx) + ": " + line).join("\n"));
            return null;
        }

        return shader;
    }

    getUniformLocation(name) {
        let location = this._uniformLocations.get(name);
        if (location === undefined) {
            location = this.gl.getUniformLocation(this._program, name);
            this._uniformLocations.set(name, location);
        }

        return location;
    }

    getAttribLocation(name) {
        let location = this._attributeLocations.get(name);
        if (location === undefined) {
            location = this.gl.getAttribLocation(this._program, name);
            this._attributeLocations.set(name, location);
        }

        return location;
    }

    destroy() {
        if (this._program) {
            this.gl.deleteProgram(this._program);
        }

        this._attributeLocations = null;
        this._currentUniformValues = null;
        this.fragmentShaderSource = null;
        this._program = null;
        this.gl = null;
        this._uniformLocations = null;
        this.vertexShaderSource = null;  

        delete this.vertexShaderSource;
        delete this._program;        
        delete this._currentUniformValues;
        delete this.fragmentShaderSource;
        delete this.gl;
        delete this._uniformLocations;
        delete this._attributeLocations;

    }

    get glProgram() {
        return this._program;
    }

    get compiled() {
        return !!this._program;
    }

    _valueEquals(v1, v2) {
        // Uniform value is either a typed array or a numeric value.
        if (v1.length && v2.length) {
            for (let i = 0, n = v1.length; i < n; i++) {
                if (v1[i] !== v2[i]) return false;
            }
            return true;
        } else {
            return (v1 === v2);
        }
    }

    _valueClone(v) {
        if (v.length) {
            return v.slice(0);
        } else {
            return v;
        }
    }

    setUniformValue(name, value, glFunction) {
        let v = this._currentUniformValues[name];
        if (v === undefined || !this._valueEquals(v, value)) {
            let clonedValue = this._valueClone(value);
            this._currentUniformValues[name] = clonedValue;

            let loc = this.getUniformLocation(name);
            if (loc) {
                let isMatrix = (glFunction === this.gl.uniformMatrix2fv || glFunction === this.gl.uniformMatrix3fv || glFunction === this.gl.uniformMatrix4fv);
                if (isMatrix) {
                    glFunction.call(this.gl, loc, false, clonedValue);
                } else {
                    glFunction.call(this.gl, loc, clonedValue);
                }
            }
        }
    }

}
