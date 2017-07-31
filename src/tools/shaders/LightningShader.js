/**
 * Copyright Metrological, 2017
 */

let DefaultShader = require('../../core/DefaultShader');

class LightningShader extends DefaultShader {
    constructor() {
        super(DefaultShader.vertexShaderSource, LightningShader.fragmentShaderSrc);
    }
}

LightningShader.fragmentShaderSrc = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    void main(void){
        gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor + 0.1;
    }
`;

module.exports = LightningShader;