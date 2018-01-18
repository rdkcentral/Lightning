/**
 * Copyright Metrological, 2017
 */

let Shader = require('../../core/Shader');

class InversionShader extends Shader {
}

InversionShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    void main(void){
        vec4 color = texture2D(uSampler, vTextureCoord);
        color.rgb = 1.0 - color.rgb; 
        gl_FragColor = color * vColor;
    }
`;

module.exports = InversionShader