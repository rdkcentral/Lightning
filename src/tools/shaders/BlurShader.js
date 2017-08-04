/**
 * Copyright Metrological, 2017
 */

let DefaultShader = require('../../core/DefaultShader');

class BlurShader extends DefaultShader {
    constructor(stage) {
        super(stage, BlurShader.vertexShaderSource, BlurShader.fragmentShaderSrc);
    }

    init(vboContext) {
        super.init(vboContext)

        let gl = vboContext.gl;
        this._iResolutionUniform = gl.getUniformLocation(this.glProgram, "iResolution");
        this._directionUniform = gl.getUniformLocation(this.glProgram, "direction");

    }

    drawElements(vboContext, offset, length, multisample = -1) {
        let gl = vboContext.gl;

        gl.uniform2fv(this._iResolutionUniform, new Float32Array([vboContext.getViewportWidth(), vboContext.getViewportHeight()]));
        gl.uniform2fv(this._directionUniform, new Float32Array([1, 0]));

        super.drawElements(vboContext, offset, length);
    }

    getMultisamples(viewRenderer) {
        return 5;
    }

}

BlurShader.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    attribute vec4 aColor;
    uniform mat4 projectionMatrix;
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    void main(void){
        gl_Position = projectionMatrix * vec4(aVertexPosition, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
        vColor = aColor;
    }
`;

BlurShader.fragmentShaderSrc = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    uniform vec2 iResolution;
    uniform vec2 direction;
    
    vec4 blur(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
        vec4 color = vec4(0.0);
        vec2 off1 = vec2(1.3333333333333333) * direction;
        color += texture2D(image, uv) * 0.29411764705882354;
        color += texture2D(image, uv + (off1 / resolution)) * 0.35294117647058826;
        color += texture2D(image, uv - (off1 / resolution)) * 0.35294117647058826;
        return color; 
    }
    
    void main(void){
        gl_FragColor = blur(uSampler, vTextureCoord, iResolution, direction) * vColor;
    }
`;

module.exports = BlurShader;