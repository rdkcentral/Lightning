import DefaultShader from "./DefaultShader.mjs";

/**
 * @see https://github.com/pixijs/pixi-filters/tree/master/filters/pixelate/src
 */
export default class PixelateShader extends DefaultShader {

    constructor(ctx) {
        super(ctx);

        this._size = new Float32Array([4, 4]);
    }

    get x() {
        return this._size[0];
    }

    set x(v) {
        this._size[0] = v;
        this.redraw();
    }

    get y() {
        return this._size[1];
    }

    set y(v) {
        this._size[1] = v;
        this.redraw();
    }

    get size() {
        return this._size[0];
    }

    set size(v) {
        this._size[0] = v;
        this._size[1] = v;
        this.redraw();
    }

    useDefault() {
        return ((this._size[0] === 0) && (this._size[1] === 0));
    }

    static getWebGLImpl() {
        return WebGLPixelateShaderImpl;
    }

    setupUniforms(operation) {
        super.setupUniforms(operation);
        let gl = this.gl;
        this._setUniform("size", new Float32Array(this._size), gl.uniform2fv);
    }

    getExtraAttribBytesPerVertex() {
        return 8;
    }

    enableAttribs() {
        super.enableAttribs();
        this.gl.enableVertexAttribArray(this._attrib("aTextureRes"));
    }

    disableAttribs() {
        super.disableAttribs();
        this.gl.disableVertexAttribArray(this._attrib("aTextureRes"));
    }

    setExtraAttribsInBuffer(operation) {
        let offset = operation.extraAttribsDataByteOffset / 4;
        let floats = operation.quads.floats;

        let length = operation.length;
        for (let i = 0; i < length; i++) {
            let w = operation.quads.getTextureWidth(operation.index + i);
            let h = operation.quads.getTextureHeight(operation.index + i);

            floats[offset] = w;
            floats[offset + 1] = h;
            floats[offset + 2] = w;
            floats[offset + 3] = h;
            floats[offset + 4] = w;
            floats[offset + 5] = h;
            floats[offset + 6] = w;
            floats[offset + 7] = h;

            offset += 8;
        }
    }

    beforeDraw(operation) {
        let gl = this.gl;
        gl.vertexAttribPointer(this._attrib("aTextureRes"), 2, gl.FLOAT, false, this.getExtraAttribBytesPerVertex(), this.getVertexAttribPointerOffset(operation));
    }
}

PixelateShader.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    attribute vec4 aColor;
    attribute vec2 aTextureRes;
    uniform vec2 projection;
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    varying vec2 vTextureRes;
    void main(void){
        gl_Position = vec4(aVertexPosition.x * projection.x - 1.0, aVertexPosition.y * -abs(projection.y) + 1.0, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
        vColor = aColor;
        vTextureRes = aTextureRes;
        gl_Position.y = -sign(projection.y) * gl_Position.y;
    }
`;

PixelateShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    varying vec2 vTextureRes;

    uniform vec2 size;
    uniform sampler2D uSampler;
    
    vec2 mapCoord( vec2 coord )
    {
        coord *= vTextureRes.xy;
        return coord;
    }
    
    vec2 unmapCoord( vec2 coord )
    {
        coord /= vTextureRes.xy;
        return coord;
    }
    
    vec2 pixelate(vec2 coord, vec2 size)
    {
        return floor( coord / size ) * size;
    }
    
    void main(void)
    {
        vec2 coord = mapCoord(vTextureCoord);
        coord = pixelate(coord, size);
        coord = unmapCoord(coord);
        gl_FragColor = texture2D(uSampler, coord) * vColor;
    }
`;

