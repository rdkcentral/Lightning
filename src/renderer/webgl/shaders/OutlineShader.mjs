import StageUtils from "../../../tree/StageUtils.mjs";
import DefaultShader from "./DefaultShader.mjs";

export default class OutlineShader extends DefaultShader {

    constructor(ctx) {
        super(ctx);
        this._width = 5;
        this._col = 0xFFFFFFFF;
        this._color = [1,1,1,1];
    }

    set width(v) {
        this._width = v;
        this.redraw();
    }

    get color() {
        return this._col;
    }

    set color(v) {
        if (this._col !== v) {
            const col = StageUtils.getRgbaComponentsNormalized(v);
            col[0] = col[0] * col[3];
            col[1] = col[1] * col[3];
            col[2] = col[2] * col[3];

            this._color = col;

            this.redraw();

            this._col = v;
        }
    }

    useDefault() {
        return (this._width === 0 || this._col[3] === 0);
    }

    setupUniforms(operation) {
        super.setupUniforms(operation);
        let gl = this.gl;
        this._setUniform("color", new Float32Array(this._color), gl.uniform4fv);
    }

    enableAttribs() {
        super.enableAttribs();
        this.gl.enableVertexAttribArray(this._attrib("aCorner"));
    }

    disableAttribs() {
        super.disableAttribs();
        this.gl.disableVertexAttribArray(this._attrib("aCorner"));
    }

    setExtraAttribsInBuffer(operation) {
        let offset = operation.extraAttribsDataByteOffset / 4;
        let floats = operation.quads.floats;

        let length = operation.length;

        for (let i = 0; i < length; i++) {

            const elementCore = operation.getElementCore(i);

            // We are setting attributes such that if the value is < 0 or > 1, a border should be drawn.
            const ddw = this._width / elementCore.w;
            const dw = ddw / (1 - 2 * ddw);
            const ddh = this._width / elementCore.h;
            const dh = ddh / (1 - 2 * ddh);

            // Specify all corner points.
            floats[offset] = -dw;
            floats[offset + 1] = -dh;

            floats[offset + 2] = 1 + dw;
            floats[offset + 3] = -dh;

            floats[offset + 4] = 1 + dw;
            floats[offset + 5] = 1 + dh;

            floats[offset + 6] = -dw;
            floats[offset + 7] = 1 + dh;

            offset += 8;
        }
    }

    beforeDraw(operation) {
        let gl = this.gl;
        gl.vertexAttribPointer(this._attrib("aCorner"), 2, gl.FLOAT, false, 8, this.getVertexAttribPointerOffset(operation));
    }

    getExtraAttribBytesPerVertex() {
        return 8;
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

