/**
 * Copyright Metrological, 2017
 */

let DefaultShader = require('../../core/DefaultShader');

class Light3dShader extends DefaultShader {
    constructor(stage) {
        super(stage, Light3dShader.vertexShaderSource, Light3dShader.fragmentShaderSrc);

        this._strength = 1;
        this._ambient = 0;
        this._fudge = 0.4;

        this._rx = 0;
        this._ry = 0;
    }

    init(vboContext) {
        super.init(vboContext)

        let gl = vboContext.gl;
        this._strengthUniform = gl.getUniformLocation(this.glProgram, "strength");
        this._ambientUniform = gl.getUniformLocation(this.glProgram, "ambient");
        this._fudgeUniform = gl.getUniformLocation(this.glProgram, "fudge");
        this._pivotUniform = gl.getUniformLocation(this.glProgram, "pivot");
        this._rotUniform = gl.getUniformLocation(this.glProgram, "rot");

        this._zAttribute = gl.getAttribLocation(this.glProgram, "z");

    }

    drawElements(vboContext, offset, length) {
        let gl = vboContext.gl;

        let byteOffset = (offset + length) * vboContext.bytesPerQuad;

        gl.vertexAttribPointer(this._zAttribute, 1, gl.FLOAT, false, 4, byteOffset - (offset * this.getExtraBufferSizePerQuad()));
        gl.enableVertexAttribArray(this._zAttribute);

        gl.uniform1f(this._strengthUniform, this._strength)
        gl.uniform1f(this._ambientUniform, this._ambient)
        gl.uniform1f(this._fudgeUniform, this._fudge)

        let vr = vboContext.shaderOwner;
        let view = vr.view;
        let coords = vr.getAbsoluteCoords(vr.rw * view.pivotX, vr.rh * view.pivotY);
        coords.push(vr.shaderSettings.z / vboContext.getViewportWidth());
        gl.uniform3fv(this._pivotUniform, new Float32Array(coords));

        let rotZ = Math.atan2(vr._worldTc, vr._worldTa);
        gl.uniform3fv(this._rotUniform, new Float32Array([this._rx, this._ry, rotZ]));

        let base = byteOffset / 4;
        for (let i = 0; i < length; i++) {
            let viewRenderer = vboContext.getViewRenderer(i);
            let s = viewRenderer.shaderSettings;
            let z = s.totalZ / vboContext.getViewportWidth();

            vboContext.vboBufferFloat[base + i * 4] = z
            vboContext.vboBufferFloat[base + i * 4 + 1] = z
            vboContext.vboBufferFloat[base + i * 4 + 2] = z
            vboContext.vboBufferFloat[base + i * 4 + 3] = z
        }

        super.drawElements(vboContext, offset, length);

        gl.disableVertexAttribArray(this._zAttribute);
    }

    getExtraBufferSizePerQuad() {
        return 4 * 4; // 4 bytes * 4 vertices.
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

    hasViewSettings() {
        return true;
    }

    createViewSettings(view) {
        return new Light3dShaderViewSettings(this, view);
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
        gl_Position.w = 1.0 + fudge * (z + gl_Position.z);
        
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

let ShaderSettings = require('../../core/ShaderSettings');

class Light3dShaderViewSettings extends ShaderSettings {

    constructor(shader, viewRenderer) {
        super(shader, viewRenderer);

        this._z = 0;
        this._totalZ = 0;
    }

    get z() {
        return this._z;
    }

    set z(v) {
        if (this._z !== v) {
            this._z = v;
            
            this._recalc();
        }
    }

    get totalZ() {
        return this._totalZ;
    }

    update() {
        this._totalZ = this._z;
        let parent = this._viewRenderer._parent;
        if (parent && parent.activeShader === this._shader) {
            this._totalZ += parent.shaderSettings._totalZ;
        }
    }

}


module.exports = Light3dShader;