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
        this._pivotZ = 0
    }

    supportsMerging() {
        // As we need the shader owner, we do not support merging.
        return false
    }

    setupUniforms(operation) {
        super.setupUniforms(operation)

        let vr = operation.shaderOwner;
        let view = vr.view;

        let coords = vr.getRenderTextureCoords(view.pivotX * vr.rw, view.pivotY * vr.rh)

        // Counter normal rotation.

        let rz = -Math.atan2(vr._renderContext.tc, vr._renderContext.ta)

        let gl = this.gl
        this._setUniform("pivot", new Float32Array([coords[0], coords[1], this._pivotZ]), gl.uniform3fv)
        this._setUniform("rot", new Float32Array([this._rx, this._ry, rz]), gl.uniform3fv)

        this._setUniform("z", this._z, gl.uniform1f)
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

    get pivotZ() {
        return this._pivotZ;
    }

    set pivotZ(v) {
        this._pivotZ = v;
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
    uniform float z;
    uniform vec3 pivot;
    uniform vec3 rot;
    varying float light;

    void main(void) {
        vec3 pos = vec3(aVertexPosition.xy, z);
        
        pos -= pivot;
        
        // Undo XY rotation
        mat2 iRotXy = mat2( cos(rot.z), sin(rot.z), 
                           -sin(rot.z), cos(rot.z));
        pos.xy = iRotXy * pos.xy;
        
        // Perform 3d rotations
        gl_Position.x = cos(rot.x) * pos.x - sin(rot.x) * pos.z;
        gl_Position.y = pos.y;
        gl_Position.z = sin(rot.x) * pos.x + cos(rot.x) * pos.z;
        
        pos.y = cos(rot.y) * gl_Position.y - sin(rot.y) * gl_Position.z;
        gl_Position.z = sin(rot.y) * gl_Position.y + cos(rot.y) * gl_Position.z;
        gl_Position.y = pos.y;
        
        // Redo XY rotation
        iRotXy[0][1] = -iRotXy[0][1];
        iRotXy[1][0] = -iRotXy[1][0];
        gl_Position.xy = iRotXy * gl_Position.xy; 

        // Undo translate to pivot position
        gl_Position.xyz += pivot;
        
        
        // Set depth perspective
        float perspective = 1.0 + fudge * gl_Position.z * projection.x;

        // Map coords to gl coordinate space.
        gl_Position = vec4(gl_Position.x * projection.x - 1.0, gl_Position.y * -abs(projection.y) + 1.0, 0.0, perspective);
        
        // Set z to 0 because we don't want to perform z-clipping
        gl_Position.z = 0.0;

        // Use texture normal to calculate light strength 
        light = ambient + strength * abs(cos(rot.y) * cos(rot.x));
        
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
    void main(void) {
        vec4 rgba = texture2D(uSampler, vTextureCoord);
        rgba.rgb = rgba.rgb * light;
        gl_FragColor = rgba * vColor;
    }
`;



module.exports = Light3dShader;