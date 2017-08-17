/**
 * Copyright Metrological, 2017
 */

let Shader = require('../../core/Shader');

class Light3dShader extends Shader {

    constructor(ctx) {
        super(ctx, Light3dShader.vertexShaderSource, Light3dShader.fragmentShaderSrc);

        this._strength = 1;
        this._ambient = 0.2;
        this._fudge = 0.4;

        this._rx = 0;
        this._ry = 0;
    }

    supportsMerging() {
        // As we need the shader owner, we do not support merging.
        return false
    }

    getExtraBytesPerVertex() {
        return 4
    }

    enableAttribs() {
        super.enableAttribs()
        this.gl.enableVertexAttribArray(this._attrib("z"))
    }

    disableAttribs() {
        super.disableAttribs()
        this.gl.disableVertexAttribArray(this._attrib("z"))
    }

    setExtraAttribsInBuffer(operation) {
        let offset = operation.extraAttribsDataByteOffset / 4
        let floats = operation.quads.floats

        let length = operation.length
        let w = operation.getRenderWidth()
        for (let i = 0; i < length; i++) {

            //@todo: set z for view (View.shaderSettings => active shader.getViewSettings(view))
            let z = 0 / w;

            floats[offset] = z
            floats[offset + 1] = z
            floats[offset + 2] = z
            floats[offset + 3] = z

            offset += 4
        }
    }

    setupUniforms(operation) {
        super.setupUniforms(operation)

        let view = operation.shaderOwner.view;
        let x = view.pivotX * 2 - 1;
        let y = view.pivotY * 2 - 1;

        //@todo: grab from view settings.
        let z = 0;

        this._setUniform("pivot", new Float32Array([x, y, 0]), gl.uniform3fv)
        this._setUniform("rot", new Float32Array([this._rx, this._ry, 0]), gl.uniform3fv)

        this._setUniform("strength", this._strength, gl.uniform1f)
        this._setUniform("ambient", this._ambient, gl.uniform1f)
        this._setUniform("fudge", this._fudge, gl.uniform1f)
    }

    beforeDraw(operation) {
        let gl = this.gl
        gl.vertexAttribPointer(this._attrib("z"), 1, gl.FLOAT, false, 4, operation.extraAttribsDataByteOffset)
    }

    set strength(v) {
        this._strength = v;
        this.redraw();
    }

    get strength() {
        return this._strength;
    }

    set ambient(v) {
        this._ambient = v;
        this.redraw();
    }

    get ambient() {
        return this._ambient;
    }

    set fudge(v) {
        this._fudge = v;
        this.redraw();
    }

    get fudge() {
        return this._fudge;
    }

    get rx() {
        return this._rx;
    }

    set rx(v) {
        this._rx = v;
        this.redraw();
    }

    get ry() {
        return this._ry;
    }

    set ry(v) {
        this._ry = v;
        this.redraw();
    }

}

Light3dShader.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    attribute vec4 aColor;
    uniform mat4 projectionMatrix;
    varying vec2 vTextureCoord;
    varying vec4 vColor;

    attribute float z;
    uniform float fudge;
    uniform float strength;
    uniform float ambient;
    uniform vec3 pivot;
    uniform vec3 rot;
    varying float light;

    void main(void){
        vec4 pos = projectionMatrix * vec4(aVertexPosition, 0, 1);
        
        pos.z = z;

        float rx = rot.x;
        float ry = rot.y;
        float rz = rot.z;

        /* Translate to pivot position */
        vec4 pivotPos = projectionMatrix * vec4(pivot, 1);
        pivotPos.w = 0.0;
        
        pos -= pivotPos;
        
        /* Undo XY rotation */
        mat2 iRotXy = mat2( cos(rz), sin(rz), 
                           -sin(rz), cos(rz));
        pos.xy = iRotXy * pos.xy;

        /* Perform rotations */
        gl_Position.x = cos(rx) * pos.x - sin(rx) * pos.z;
        gl_Position.y = pos.y;
        gl_Position.z = sin(rx) * pos.x + cos(rx) * pos.z;
        
        pos.y = cos(ry) * gl_Position.y - sin(ry) * gl_Position.z;
        gl_Position.z = sin(ry) * gl_Position.y + cos(ry) * gl_Position.z;
        gl_Position.y = pos.y;
        
        /* Set depth perspective */
        float perspective = 1.0 + fudge * (z + gl_Position.z);
        gl_Position.w = perspective;
        
        /* Set z to 0 because we don't want to perform z-clipping */
        gl_Position.z = 0.0;
        
        /* Redo XY rotation */
        iRotXy[0][1] = -iRotXy[0][1];
        iRotXy[1][0] = -iRotXy[1][0];
        gl_Position.xy = iRotXy * gl_Position.xy; 

        /* Undo translate to pivot position */
        gl_Position += pivotPos;

        /* Use texture normal to calculate light strength */ 
        light = ambient + strength * abs(cos(ry) * cos(rx));
        
        vTextureCoord = aTextureCoord;
        vColor = aColor;
    }
`;

Light3dShader.fragmentShaderSrc = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    varying float light;
    uniform sampler2D uSampler;
    void main(void){
        vec4 rgba = texture2D(uSampler, vTextureCoord);
        rgba.rgb = rgba.rgb * light;
        gl_FragColor = rgba * vColor;
    }
`;



module.exports = Light3dShader;