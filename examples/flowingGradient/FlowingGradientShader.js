(function(wuf) {

class FlowingGradientShader extends wuf.DefaultShader {
    constructor(context) {
        super(context)

        this._pos = new Float32Array([0,0,0,0])

        this._colors = [0xFFFF0000, 0xFF0000FF]
        this._updateColors()

        this._graining = 1/256

        this._random = false
    }

    set random(v) {
        this._random = v
        this.redraw()
    }

    set graining(v) {
        this._graining = v
        this.redraw()
    }

    set banding(v) {
        this._banding = v
        this.redraw()
    }

    setPos1(x, y) {
        this._pos[0] = x
        this._pos[1] = y
        this.redraw()
    }

    setPos2(x, y) {
        this._pos[2] = x
        this._pos[3] = y
        this.redraw()
    }

    set color1(v) {
        this._colors[0] = v
        this._updateColors()
    }

    set color2(v) {
        this._colors[1] = v
        this._updateColors()
    }

    _updateColors() {
        let arr = []
        this._colors.forEach(color => {
            const col = wuf.StageUtils.getRgbaComponentsNormalized(color)
            col[0] *= col[3]
            col[1] *= col[3]
            col[2] *= col[3]
            arr = arr.concat(col)
        })
        this._rawColors = new Float32Array(arr)
        this.redraw()
    }

    setExtraAttribsInBuffer(operation) {
        let offset = operation.extraAttribsDataByteOffset / 4
        let floats = operation.quads.floats

        let length = operation.length

        for (let i = 0; i < length; i++) {

            let brx = operation.getViewWidth(i) / operation.getTextureWidth(i)
            let bry = operation.getViewHeight(i) / operation.getTextureHeight(i)

            let ulx = 0
            let uly = 0
            if (this._random) {
                ulx = Math.random()
                uly = Math.random()

                brx += ulx
                bry += uly

                if (Math.random() < 0.5) {
                    // Flip for more randomness.
                    const t = ulx
                    ulx = brx
                    brx = t
                }

                if (Math.random() < 0.5) {
                    // Flip for more randomness.
                    const t = uly
                    uly = bry
                    bry = t
                }
            }


            // Specify all corner points.
            floats[offset] = ulx
            floats[offset + 1] = uly

            floats[offset + 2] = brx
            floats[offset + 3] = uly

            floats[offset + 4] = brx
            floats[offset + 5] = bry

            floats[offset + 6] = ulx
            floats[offset + 7] = bry

            offset += 8
        }
    }

    beforeDraw(operation) {
        let gl = this.gl
        gl.vertexAttribPointer(this._attrib("aTextureCoord"), 2, gl.FLOAT, false, 8, this.getVertexAttribPointerOffset(operation))
    }

    getExtraAttribBytesPerVertex() {
        return 8
    }

    setupUniforms(operation) {
        super.setupUniforms(operation)
        // We substract half a pixel to get a better cutoff effect.
        this._setUniform("positions", this._pos, this.gl.uniform2fv)
        this._setUniform("colors", this._rawColors, this.gl.uniform4fv)
        this._setUniform("graining", 2 * this._graining, this.gl.uniform1f)
        this._setUniform("banding", this._banding, this.gl.uniform1f)
        this._setUniform("aspectRatio", operation.getRenderHeight()/operation.getRenderWidth(), this.gl.uniform1f)
    }

    afterDraw(operation) {
        if (this._random) {
            this.redraw()
        }
    }

}

FlowingGradientShader.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    attribute vec4 aColor;
    uniform vec2 projection;
    varying vec2 pos;
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    uniform float aspectRatio;
    void main(void){
        gl_Position = vec4(aVertexPosition.x * projection.x - 1.0, aVertexPosition.y * -abs(projection.y) + 1.0, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
        vColor = aColor;
        gl_Position.y = -sign(projection.y) * gl_Position.y;
        pos = gl_Position.xy;
        pos.y = pos.y * aspectRatio;
    }
`;

FlowingGradientShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec2 pos;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    uniform vec2 positions[2];
    uniform vec4 colors[2];
    uniform float graining;
    uniform float banding;
    void main(void){
        vec4 noise = texture2D(uSampler, vTextureCoord);
        
        vec2 delta = pos - positions[0];
        float p1 = dot(delta, delta); 
        delta = pos - positions[1];
        float p2 = dot(delta, delta);
        float t = p1 + p2;
        
        float c1 = p1/t;
        float c2 = p2/t;
        
        // Banding.
        if (banding > 0.0) {
            float v = max(4.0, 255.0 * (1.0 - banding));
            c1 = floor(c1 * v) / v; 
            c2 = floor(c2 * v) / v;
        }
        
        vec4 addColor = (colors[0] * c1 + colors[1] * c2);
        
        // Graining.
        if (graining > 0.0) {
            addColor += graining * (noise.r - 0.5);
        }
        
        gl_FragColor = addColor * vColor;
    }
`;

try {
    module.exports = FlowingGradientShader
} catch(e) {
    window.FlowingGradientShader = FlowingGradientShader
}
})(
    typeof window === 'undefined' ? require('../../wuf') : wuf
)


