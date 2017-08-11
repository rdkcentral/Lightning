/**
 * Copyright Metrological, 2017
 */

let DefaultShader = require('../../core/DefaultShader');

/**
 * @see https://github.com/Jam3/glsl-fast-gaussian-blur
 */
class LinearBlurShader extends DefaultShader {
    constructor(ctx) {
        super(ctx, LinearBlurShader.vertexShaderSource, LinearBlurShader.fragmentShaderSrc);

        this._direction = new Float32Array([1, 0]);
        this._kernelRadius = 1;
    }

    get x() {
        return this._direction[0];
    }

    set x(v) {
        this._direction[0] = v;
        this.redraw();
    }

    get y() {
        return this._direction[1];
    }

    set y(v) {
        this._direction[1] = v;
        this.redraw();
    }

    get kernelRadius() {
        return this._kernelRadius[0];
    }

    set kernelRadius(v) {
        this._kernelRadius = v;
        this.redraw();
    }

    setup() {
        super.setup()

        let ctx = this.ctx
        let gl = ctx.gl

        gl.uniform2fv(this._uniform("direction"), this._direction)
        gl.uniform1i(this._uniform("kernelRadius"), this._kernelRadius)
    }

    drawsAsDefault() {
        return (this._kernelRadius === 0)
    }

    getExtraBytesPerVertex() {
        return 8;
    }

    prepareFilterQuad() {
        let ctx = this.ctx;

        let byteOffset = this.getExtraParamsBufferOffset();

        let w = ctx.getTextureWidth()
        let h = ctx.getTextureHeight()

        let base = byteOffset / 4;
        ctx.vboBufferFloat[base] = w
        ctx.vboBufferFloat[base + 1] = h
        ctx.vboBufferFloat[base + 2] = w
        ctx.vboBufferFloat[base + 3] = h
        ctx.vboBufferFloat[base + 4] = w
        ctx.vboBufferFloat[base + 5] = h
        ctx.vboBufferFloat[base + 6] = w
        ctx.vboBufferFloat[base + 7] = h
    }

    prepareQuads() {
        let ctx = this.ctx;

        let byteOffset = this.getExtraParamsBufferOffset();

        let length = ctx.length
        for (let i = 0; i < length; i++) {
            let w = ctx.getTextureWidth(i)
            let h = ctx.getTextureHeight(i)

            let base = (byteOffset / 4) + i * 8;

            ctx.vboBufferFloat[base] = w
            ctx.vboBufferFloat[base + 1] = h
            ctx.vboBufferFloat[base + 2] = w
            ctx.vboBufferFloat[base + 3] = h
            ctx.vboBufferFloat[base + 4] = w
            ctx.vboBufferFloat[base + 5] = h
            ctx.vboBufferFloat[base + 6] = w
            ctx.vboBufferFloat[base + 7] = h
        }
    }

    _draw() {
        let gl = this.ctx.gl
        gl.vertexAttribPointer(this._attrib("aTextureRes"), 2, gl.FLOAT, false, 8, this.getExtraParamsBufferOffset())
        gl.enableVertexAttribArray(this._attrib("aTextureRes"))

        super._draw();
    }

}

LinearBlurShader.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    attribute vec4 aColor;
    attribute vec2 aTextureRes;
    uniform mat4 projectionMatrix;
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    varying vec2 vTextureRes;
    void main(void){
        gl_Position = projectionMatrix * vec4(aVertexPosition, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
        vColor = aColor;
        vTextureRes = aTextureRes;
    }
`;

LinearBlurShader.fragmentShaderSrc = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureRes;
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    uniform vec2 direction;
    uniform int kernelRadius;
    
    vec4 blur1(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
        vec4 color = vec4(0.0);
        vec2 off1 = vec2(1.3333333333333333) * direction;
        color += texture2D(image, uv) * 0.29411764705882354;
        color += texture2D(image, uv + (off1 / resolution)) * 0.35294117647058826;
        color += texture2D(image, uv - (off1 / resolution)) * 0.35294117647058826;
        return color; 
    }
    
    vec4 blur2(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
        vec4 color = vec4(0.0);
        vec2 off1 = vec2(1.3846153846) * direction;
        vec2 off2 = vec2(3.2307692308) * direction;
        color += texture2D(image, uv) * 0.2270270270;
        color += texture2D(image, uv + (off1 / resolution)) * 0.3162162162;
        color += texture2D(image, uv - (off1 / resolution)) * 0.3162162162;
        color += texture2D(image, uv + (off2 / resolution)) * 0.0702702703;
        color += texture2D(image, uv - (off2 / resolution)) * 0.0702702703;
        return color;
    }
    
    vec4 blur3(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
        vec4 color = vec4(0.0);
        vec2 off1 = vec2(1.411764705882353) * direction;
        vec2 off2 = vec2(3.2941176470588234) * direction;
        vec2 off3 = vec2(5.176470588235294) * direction;
        color += texture2D(image, uv) * 0.1964825501511404;
        color += texture2D(image, uv + (off1 / resolution)) * 0.2969069646728344;
        color += texture2D(image, uv - (off1 / resolution)) * 0.2969069646728344;
        color += texture2D(image, uv + (off2 / resolution)) * 0.09447039785044732;
        color += texture2D(image, uv - (off2 / resolution)) * 0.09447039785044732;
        color += texture2D(image, uv + (off3 / resolution)) * 0.010381362401148057;
        color += texture2D(image, uv - (off3 / resolution)) * 0.010381362401148057;
        return color;
    }    

    void main(void){
        if (kernelRadius == 0) {
            gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor;
        } else if (kernelRadius == 1) {
            gl_FragColor = blur1(uSampler, vTextureCoord, vTextureRes, direction) * vColor;
        } else if (kernelRadius == 2) {
            gl_FragColor = blur2(uSampler, vTextureCoord, vTextureRes, direction) * vColor;
        } else {
            gl_FragColor = blur3(uSampler, vTextureCoord, vTextureRes, direction) * vColor;
        }
    }
`;

module.exports = LinearBlurShader;