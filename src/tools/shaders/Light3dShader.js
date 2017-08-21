/**
 * Copyright Metrological, 2017
 */

let Shader = require('../../core/Shader');

class Light3dShader extends Shader {

    constructor(ctx) {
        super(ctx)

        this._strength = 0.5
        this._ambient = 0.5
        this._fudge = 0.4

        this._rx = 0
        this._ry = 0

        this._z = 0
    }

    getVertexShaderSource() {
        return Light3dShader.vertexShaderSource
    }

    getFragmentShaderSource() {
        return Light3dShader.fragmentShaderSource
    }

    supportsTextureAtlas() {
        return true
    }

    supportsMerging() {
        // As we need the shader owner, we do not support merging.
        return false
    }

    setupUniforms(operation) {
        super.setupUniforms(operation)

        let vr = operation.shaderOwner;
        let view = vr.view;

        let coords = operation.getNormalRenderTextureCoords(view.pivotX * vr.rw, view.pivotY * vr.rh);

        // Counter normal rotation.
        vr.setRenderCoordAttribsMode()
        let rz = Math.atan2(vr._worldTc, vr._worldTa)
        vr.setWorldCoordAttribsMode()

        let gl = this.gl
        this._setUniform("pivot", new Float32Array([coords[0], coords[1], this._z]), gl.uniform3fv)
        this._setUniform("rot", new Float32Array([this._rx, this._ry, rz]), gl.uniform3fv)

        this._setUniform("strength", this._strength, gl.uniform1f)
        this._setUniform("ambient", this._ambient, gl.uniform1f)
        this._setUniform("fudge", this._fudge, gl.uniform1f)
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

    get z() {
        return this._z;
    }

    set z(v) {
        this._z = v;
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
    uniform vec2 projection;
    varying vec2 vTextureCoord;
    varying vec4 vColor;

    uniform float fudge;
    uniform float strength;
    uniform float ambient;
    uniform vec3 pivot;
    uniform vec3 rot;
    varying float light;

    void main(void) {
        vec4 pos = vec4(aVertexPosition.x * projection.x - 1.0, aVertexPosition.y * -abs(projection.y) + 1.0, 0.0, 1.0);
        
        float z = pivot.z;
        
        pos.z = z;

        float rx = rot.x;
        float ry = rot.y;
        float rz = rot.z;

        /* Translate to pivot position */
        vec4 pivotPos = vec4(pivot, 1);
        
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
        
        /* Redo XY rotation */
        iRotXy[0][1] = -iRotXy[0][1];
        iRotXy[1][0] = -iRotXy[1][0];
        gl_Position.xy = iRotXy * gl_Position.xy; 

        /* Undo translate to pivot position */
        gl_Position += pivotPos;

        /* Set z to 0 because we don't want to perform z-clipping */
        gl_Position.z = 0.0;
        
        /* Use texture normal to calculate light strength */ 
        light = ambient + strength * abs(cos(ry) * cos(rx));
        
        vTextureCoord = aTextureCoord;
        vColor = aColor;
        
        gl_Position.y = -sign(projection.y) * gl_Position.y;
    }
`;

Light3dShader.fragmentShaderSource = `
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