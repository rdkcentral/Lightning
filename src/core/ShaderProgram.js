/**
 * Base functionality for shader setup/destroy.
 * Copyright Metrological, 2017
 */
class ShaderProgram {

    constructor(vertexShaderSource, fragmentShaderSource) {

        this.vertexShaderSource = vertexShaderSource;
        this.fragmentShaderSource = fragmentShaderSource;

        this._program = null;

        this._uniformLocations = new Map();
        this._attributeLocations = new Map();
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
            console.error('Error: Could not initialize shader.');
            console.error('gl.VALIDATE_STATUS', gl.getProgramParameter(this._program, gl.VALIDATE_STATUS));
            console.error('gl.getError()', gl.getError());

            // if there is a program info log, log it
            if (gl.getProgramInfoLog(this._program) !== '') {
                console.warn('Warning: gl.getProgramInfoLog()', gl.getProgramInfoLog(this._program));
            }

            gl.deleteProgram(this._program);
            this._program = null;
        }
        gl.useProgram(this._program);

        // clean up some shaders
        gl.deleteShader(glVertShader);
        gl.deleteShader(glFragShader);
    }

    _glCompile(type, src) {
        let shader = this.gl.createShader(type);

        this.gl.shaderSource(shader, src);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.log(this.gl.getShaderInfoLog(shader));
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
            this._program = null;
        }
    }

    get glProgram() {
        return this._program;
    }

    get compiled() {
        return !!this._program;
    }

}

module.exports = ShaderProgram;