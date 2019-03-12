import DefaultShader from "./DefaultShader.mjs";

export default class InversionShader extends DefaultShader {
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
        color.rgb = (1.0 * color.a - color.rgb); 
        gl_FragColor = color * vColor;
    }
`;

