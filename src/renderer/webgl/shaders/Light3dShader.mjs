import DefaultShader from "./DefaultShader.mjs";

export default class Light3dShader extends DefaultShader {

    constructor(ctx) {
        super(ctx);

        this._strength = 0.5;
        this._ambient = 0.5;
        this._fudge = 0.4;

        this._rx = 0;
        this._ry = 0;

        this._z = 0;
        this._pivotX = NaN;
        this._pivotY = NaN;
        this._pivotZ = 0;

        this._lightY = 0;
        this._lightZ = 0;
    }

    setupUniforms(operation) {
        super.setupUniforms(operation);

        let vr = operation.shaderOwner;
        let element = vr.element;

        let pivotX = isNaN(this._pivotX) ? element.pivotX * vr.w : this._pivotX;
        let pivotY = isNaN(this._pivotY) ? element.pivotY * vr.h : this._pivotY;
        let coords = vr.getRenderTextureCoords(pivotX, pivotY);

        // Counter normal rotation.

        let rz = -Math.atan2(vr._renderContext.tc, vr._renderContext.ta);

        let gl = this.gl;
        this._setUniform("pivot", new Float32Array([coords[0], coords[1], this._pivotZ]), gl.uniform3fv);
        this._setUniform("rot", new Float32Array([this._rx, this._ry, rz]), gl.uniform3fv);

        this._setUniform("z", this._z, gl.uniform1f);
        this._setUniform("lightY", this.lightY, gl.uniform1f);
        this._setUniform("lightZ", this.lightZ, gl.uniform1f);
        this._setUniform("strength", this._strength, gl.uniform1f);
        this._setUniform("ambient", this._ambient, gl.uniform1f);
        this._setUniform("fudge", this._fudge, gl.uniform1f);
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

    get pivotX() {
        return this._pivotX;
    }

    set pivotX(v) {
        this._pivotX = v + 1;
        this.redraw();
    }

    get pivotY() {
        return this._pivotY;
    }

    set pivotY(v) {
        this._pivotY = v + 1;
        this.redraw();
    }

    get lightY() {
        return this._lightY;
    }

    set lightY(v) {
        this._lightY = v;
        this.redraw();
    }

    get pivotZ() {
        return this._pivotZ;
    }

    set pivotZ(v) {
        this._pivotZ = v;
        this.redraw();
    }

    get lightZ() {
        return this._lightZ;
    }

    set lightZ(v) {
        this._lightZ = v;
        this.redraw();
    }

    useDefault() {
        return (this._rx === 0 && this._ry === 0 && this._z === 0 && this._strength === 0 && this._ambient === 1);
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
    uniform float lightY;
    uniform float lightZ;
    uniform vec3 pivot;
    uniform vec3 rot;
    varying vec3 pos;

    void main(void) {
        pos = vec3(aVertexPosition.xy, z);
        
        pos -= pivot;
        
        // Undo XY rotation
        mat2 iRotXy = mat2( cos(rot.z), sin(rot.z), 
                           -sin(rot.z), cos(rot.z));
        pos.xy = iRotXy * pos.xy;
        
        // Perform 3d rotations
        gl_Position.x = cos(rot.x) * pos.x - sin(rot.x) * pos.z;
        gl_Position.y = pos.y;
        gl_Position.z = sin(rot.x) * pos.x + cos(rot.x) * pos.z;
        
        pos.x = gl_Position.x;
        pos.y = cos(rot.y) * gl_Position.y - sin(rot.y) * gl_Position.z;
        pos.z = sin(rot.y) * gl_Position.y + cos(rot.y) * gl_Position.z;
        
        // Redo XY rotation
        iRotXy[0][1] = -iRotXy[0][1];
        iRotXy[1][0] = -iRotXy[1][0];
        pos.xy = iRotXy * pos.xy; 

        // Undo translate to pivot position
        pos.xyz += pivot;

        pos = vec3(pos.x * projection.x - 1.0, pos.y * -abs(projection.y) + 1.0, pos.z * projection.x);
        
        // Set depth perspective
        float perspective = 1.0 + fudge * pos.z;

        pos.z += lightZ * projection.x;

        // Map coords to gl coordinate space.
        // Set z to 0 because we don't want to perform z-clipping
        gl_Position = vec4(pos.xy, 0.0, perspective);

        // Correct light source position.
        pos.y += lightY * abs(projection.y);

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
    varying vec3 pos;
    uniform sampler2D uSampler;
    uniform float ambient;
    uniform float strength;
    void main(void){
        vec4 rgba = texture2D(uSampler, vTextureCoord);
        float d = length(pos);
        float n = 1.0 / max(0.1, d);
        rgba.rgb = rgba.rgb * (strength * n + ambient);
        gl_FragColor = rgba * vColor;
    }
`;

