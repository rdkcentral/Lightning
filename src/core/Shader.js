let ShaderProgram = require('./ShaderProgram');

class Shader {

    constructor(vertexShaderSource, fragmentShaderSource) {
        this._program = new ShaderProgram(vertexShaderSource, fragmentShaderSource);
    }

    compile(gl) {
        if (!this._program.compiled) {
            this._program.compile(gl);
        }
    }

    render(vboContext, offset, length) {
        // Set up shader attributes, unforms, draw elements and disable attributes.
    }

}

module.exports = Shader;