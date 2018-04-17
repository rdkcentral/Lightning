const Shader = require('../../tree/Shader');

class OutlineShader extends Shader {

    constructor(ctx) {
        super(ctx)
        this._width = 5
        this._color = 0xFFFFFFFF
    }

    set width(v) {
        this._width = v
        this.redraw()
    }

    set color(v) {
        this._color = v
        this.redraw()
    }

    setupUniforms(operation) {
        super.setupUniforms(operation)
        let gl = this.gl

        this._setUniform("color", new Float32Array(StageUtils.getRgbaComponentsNormalized(this._color)), gl.uniform4fv)
    }

    enableAttribs() {
        super.enableAttribs()
        this.gl.enableVertexAttribArray(this._attrib("aCorner"))
    }

    disableAttribs() {
        super.disableAttribs()
        this.gl.disableVertexAttribArray(this._attrib("aCorner"))
    }

    setExtraAttribsInBuffer(operation) {
        let offset = operation.extraAttribsDataByteOffset / 4
        let floats = operation.quads.floats

        let length = operation.length

        for (let i = 0; i < length; i++) {

            const viewCore = operation.getViewCore(i)

            // We are setting attributes such that if the value is < 0 or > 1, a border should be drawn.
            const ddw = this._width / viewCore.rw
            const dw = ddw / (1 - 2 * ddw)
            const ddh = this._width / viewCore.rh
            const dh = ddh / (1 - 2 * ddh)

            // Specify all corner points.
            floats[offset] = -dw
            floats[offset + 1] = -dh

            floats[offset + 2] = 1 + dw
            floats[offset + 3] = -dh

            floats[offset + 4] = 1 + dw
            floats[offset + 5] = 1 + dh

            floats[offset + 6] = -dw
            floats[offset + 7] = 1 + dh

            offset += 8
        }
    }

    beforeDraw(operation) {
        let gl = this.gl
        gl.vertexAttribPointer(this._attrib("aCorner"), 2, gl.FLOAT, false, 8, this.getVertexAttribPointerOffset(operation))
    }

    getExtraAttribBytesPerVertex() {
        return 8
    }

    useDefault() {
        return (this._width === 0)
    }
}

OutlineShader.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    attribute vec4 aColor;
    attribute vec2 aCorner;
    uniform vec2 projection;
    varying vec2 vTextureCoord;
    varying vec2 vCorner;
    varying vec4 vColor;
    void main(void){
        gl_Position = vec4(aVertexPosition.x * projection.x - 1.0, aVertexPosition.y * -abs(projection.y) + 1.0, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
        vCorner = aCorner;
        vColor = aColor;
        gl_Position.y = -sign(projection.y) * gl_Position.y;
    }
`;

OutlineShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    varying vec2 vCorner;
    uniform vec4 color;
    uniform sampler2D uSampler;
    void main(void){
        vec2 m = min(vCorner, 1.0 - vCorner);
        float value = step(0.0, min(m.x, m.y));
        gl_FragColor = mix(color, texture2D(uSampler, vTextureCoord) * vColor, value);
    }
`;

module.exports = OutlineShader;

const StageUtils = require('../../tree/StageUtils');
