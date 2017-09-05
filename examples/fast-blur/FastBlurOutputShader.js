/**
 * Copyright Metrological, 2017
 */

let Shader = require('../../src/core/Shader')

class FastBlurOutputShader extends Shader {

    constructor(ctx) {
        super(ctx)

        this._a = 0
        this._otherTextureSource = null
    }

    get a() {
        return this._a
    }

    set a(v) {
        this._a = v
        this.redraw()
    }

    set otherTextureSource(v) {
        this._otherTextureSource = v
        this.redraw()
    }

    getFragmentShaderSource() {
        return FastBlurOutputShader.fragmentShaderSource
    }

    draw(operation) {
        let glTexture = this._otherTextureSource ? this._otherTextureSource.glTexture : null

        let gl = this.gl
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, glTexture)
        gl.activeTexture(gl.TEXTURE0)

        super.draw(operation)
    }

    setupUniforms(operation) {
        super.setupUniforms(operation)
        this._setUniform("a", this._a, this.gl.uniform1f)
        this._setUniform("uSampler2", 1, this.gl.uniform1i)
    }

}

FastBlurOutputShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    uniform sampler2D uSampler2;
    uniform float a;
    void main(void){
        if (a == 1.0) {
            gl_FragColor = texture2D(uSampler2, vTextureCoord) * vColor;
        } else {
            gl_FragColor = ((1.0 - a) * texture2D(uSampler, vTextureCoord) + (a * texture2D(uSampler2, vTextureCoord))) * vColor;
        }
    }
`;

module.exports = FastBlurOutputShader