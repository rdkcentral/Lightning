/**
 * Copyright Metrological, 2017
 */

let Filter = require('../../core/Filter');

class LinearBlurFilter extends Filter {

    constructor(ctx) {
        super(ctx)

        this._direction = new Float32Array([0, 0])
        this._kernelRadius = 1
    }

    get x() {
        return this._direction[0]
    }

    set x(v) {
        this._direction[0] = v
        this.redraw()
    }

    get y() {
        return this._direction[1]
    }

    set y(v) {
        this._direction[1] = v
        this.redraw()
    }

    get kernelRadius() {
        return this._kernelRadius
    }

    set kernelRadius(v) {
        this._kernelRadius = v
        this.redraw()
    }

    getFragmentShaderSource() {
        return LinearBlurFilter.fragmentShaderSource
    }

    setupUniforms(operation) {
        super.setupUniforms(operation)
        this._setUniform("direction", this._direction, this.gl.uniform2fv)
        this._setUniform("kernelRadius", this._kernelRadius, this.gl.uniform1i)
    }

}

LinearBlurFilter.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    uniform vec2 resolution;
    varying vec2 vTextureCoord;
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
            gl_FragColor = texture2D(uSampler, vTextureCoord);
        } else if (kernelRadius == 1) {
            gl_FragColor = blur1(uSampler, vTextureCoord, resolution, direction);
        } else if (kernelRadius == 2) {
            gl_FragColor = blur2(uSampler, vTextureCoord, resolution, direction);
        } else {
            gl_FragColor = blur3(uSampler, vTextureCoord, resolution, direction);
        }
    }
`;

module.exports = LinearBlurFilter
