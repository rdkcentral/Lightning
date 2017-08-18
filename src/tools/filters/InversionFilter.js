/**
 * Copyright Metrological, 2017
 */

let Filter = require('../../core/Filter');

/**
 * @see https://github.com/mattdesl/glsl-fxaa
 */
class InversionFilter extends Filter {
    constructor(ctx) {
        super(ctx);
    }

    getFragmentShaderSource() {
        return InversionFilter.fragmentShaderSource
    }

}

InversionFilter.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;
    void main(void){
        vec4 color = texture2D(uSampler, vTextureCoord);
        color.rgb = 1.0 - color.rgb; 
        gl_FragColor = color;
    }
`;


module.exports = InversionFilter