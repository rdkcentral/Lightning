import DefaultShader from "./DefaultShader.mjs";

/**
 * 4x4 box blur shader which works in conjunction with a 50% rescale.
 */
export default class BoxBlurShader extends DefaultShader {

    setupUniforms(operation) {
        super.setupUniforms(operation);
        const dx = 1.0 / operation.getTextureWidth(0);
        const dy = 1.0 / operation.getTextureHeight(0);
        this._setUniform("stepTextureCoord", new Float32Array([dx, dy]), this.gl.uniform2fv);
    }

}

BoxBlurShader.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    uniform vec2 stepTextureCoord;
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    attribute vec4 aColor;
    uniform vec2 projection;
    varying vec4 vColor;
    varying vec2 vTextureCoordUl;
    varying vec2 vTextureCoordUr;
    varying vec2 vTextureCoordBl;
    varying vec2 vTextureCoordBr;
    void main(void){
        gl_Position = vec4(aVertexPosition.x * projection.x - 1.0, aVertexPosition.y * -abs(projection.y) + 1.0, 0.0, 1.0);
        vTextureCoordUl = aTextureCoord - stepTextureCoord;
        vTextureCoordBr = aTextureCoord + stepTextureCoord;
        vTextureCoordUr = vec2(vTextureCoordBr.x, vTextureCoordUl.y);
        vTextureCoordBl = vec2(vTextureCoordUl.x, vTextureCoordBr.y);
        vColor = aColor;
        gl_Position.y = -sign(projection.y) * gl_Position.y;
    }
`;

BoxBlurShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoordUl;
    varying vec2 vTextureCoordUr;
    varying vec2 vTextureCoordBl;
    varying vec2 vTextureCoordBr;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    void main(void){
        vec4 color = 0.25 * (texture2D(uSampler, vTextureCoordUl) + texture2D(uSampler, vTextureCoordUr) + texture2D(uSampler, vTextureCoordBl) + texture2D(uSampler, vTextureCoordBr));
        gl_FragColor = color * vColor;
    }
`;

