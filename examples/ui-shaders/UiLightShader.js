/**
 * Copyright Metrological, 2017
 */

let Shader = require('../../src/core/Shader')

// @see https://www.tomdalling.com/blog/modern-opengl/07-more-lighting-ambient-specular-attenuation-gamma/

class UiLightShader extends Shader {

    constructor(ctx) {
        super(ctx)
        this._color = 0xFFFFFF
        this._intensity = 1
        this._x = 0
        this._y = 0
        this._z = 1000
        this._amount = 0.5
        this._shadowBlur = 0.3
        this._shadowScale = 1
        this._shaderUniformsCache = new WeakMap();
    }

    getExtraAttribBytesPerVertex() {
        return 4
    }

    get color() {
        return this._color
    }

    set color(v) {
        this._color = v
        this.redraw()
    }

    get amount() {
        return this._amount
    }

    set amount(v) {
        this._amount = v
        this.redraw()
    }

    get intensity() {
        return this._intensity
    }

    set intensity(v) {
        this._intensity = v
        this.redraw()
    }

    get x() {
        return this._x
    }

    set x(v) {
        this._x = v
        this.redraw()
    }

    get y() {
        return this._y
    }

    set y(v) {
        this._y = v
        this.redraw()
    }

    get z() {
        return this._z
    }

    set z(v) {
        this._z = v
        this.redraw()
    }

    get shadowScale() {
        return this._shadowScale
    }

    set shadowScale(v) {
        this._shadowScale = v
        this.redraw()
    }

    get shadowBlur() {
        return this._shadowBlur
    }

    set shadowBlur(v) {
        this._shadowBlur = v
        this.redraw()
    }

    useDefault() {
        return this._amount === 0
    }

    enableAttribs() {
        super.enableAttribs()
        if (this._attrib("aZ") != -1) {
            this.gl.enableVertexAttribArray(this._attrib("aZ"))
        }
    }

    disableAttribs() {
        super.disableAttribs()
        if (this._attrib("aZ") != -1) {
            this.gl.disableVertexAttribArray(this._attrib("aZ"))
        }
    }

    setExtraAttribsInBuffer(operation) {
        let offset = operation.extraAttribsDataByteOffset / 4
        let floats = operation.quads.floats

        let length = operation.length
        for (let i = 0; i < length; i++) {
            let z = operation.getView(i).zIndex
            floats[offset] = z
            floats[offset + 1] = z
            floats[offset + 2] = z
            floats[offset + 3] = z
            offset += 4
        }
    }

    beforeDraw(operation) {
        let gl = this.gl
        if (this._attrib("aZ") != -1) {
            gl.vertexAttribPointer(this._attrib("aZ"), 1, gl.FLOAT, false, this.getExtraAttribBytesPerVertex(), this.getVertexAttribPointerOffset(operation))
        }
    }

    supportsMerging() {
        // Merging may cause problems because we are selecting the closest views of the operation for shadows using uniforms.
        return false
    }

    getShadowView(view, info) {
        if (view.zIndex > info.maxZ) {
            info.maxZ = view.zIndex
            info.shadowView = view
        }

        let children = view._children.get()
        for (let i = 0, n = children.length; i < n; i++) {
            if (children[i]._core._shaderOwner === info.shaderOwner) {
                this.getShadowView(children[i], info)
            }
        }
    }

    setupUniforms(operation) {
        super.setupUniforms(operation)

        let info = this._shaderUniformsCache.get(operation.shaderOwner)
        if (!info || info.frame !== this.ctx.stage.frameCounter) {
            info = {frame: this.ctx.stage.frameCounter, maxZ: 0, shaderOwner: operation.shaderOwner, shadowView: null}

            this.getShadowView(operation.shaderOwner.view, info)

            let shadowView = info.shadowView
            if (shadowView) {
                let coords = shadowView._core.getRenderTextureCoords(0, 0);
                info.s = new Float32Array([coords[0], coords[1]])
                coords = shadowView._core.getRenderTextureCoords(shadowView.renderWidth, shadowView.renderHeight);
                info.e = new Float32Array([coords[0], coords[1]])
            } else {
                info.s = new Float32Array([0, 0])
                info.e = new Float32Array([0, 0])
            }
            this._shaderUniformsCache.set(operation.shaderOwner, info)
        }

        this._setUniform("light", new Float32Array([this._x, this._y, this._z]), this.gl.uniform3fv)
        let col = StageUtils.getRgbComponentsNormalized(this._color);
        col = col.map(v => this._intensity * v);
        this._setUniform("lightColor", new Float32Array(col), this.gl.uniform3fv)
        this._setUniform("amount", this._amount, this.gl.uniform1f)
        this._setUniform("shadowScale", this._shadowScale, this.gl.uniform1f)
        this._setUniform("shadowBlur", this._shadowBlur, this.gl.uniform1f)

        // Get shadow view from operation.
        this._setUniform("s", info.s, this.gl.uniform2fv)
        this._setUniform("e", info.e, this.gl.uniform2fv)
        this._setUniform("shadowZ", info.maxZ, this.gl.uniform1f)

    }

}

UiLightShader.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    attribute vec4 aColor;
    attribute float aZ;
    uniform vec2 projection;
    uniform vec3 light;
    uniform float shadowZ;
    uniform float shadowScale;
    varying vec2 vTextureCoord;
    varying vec3 lightToPixel;
    varying vec4 vColor;
    varying vec2 vShadowLayerCoord;
    varying float vShadowEnabled;
    void main(void){
        lightToPixel = vec3(aVertexPosition, aZ) - light;
        float sm = (shadowZ - light.z) / lightToPixel.z;
        vShadowEnabled = (sm < 0.99 ? 1.0 : 0.0);
        sm = sm * shadowScale + (1.0 - shadowScale);
        vShadowLayerCoord = (lightToPixel.xy * sm + light.xy);
        gl_Position = vec4(aVertexPosition.x * projection.x - 1.0, aVertexPosition.y * -abs(projection.y) + 1.0, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
        vColor = aColor;
        gl_Position.y = -sign(projection.y) * gl_Position.y;
    }
`;

UiLightShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec3 lightToPixel;
    varying vec4 vColor;
    varying vec2 vShadowLayerCoord;
    varying float vShadowEnabled;

    uniform sampler2D uSampler;
    uniform vec3 lightColor;
    uniform vec2 s;
    uniform vec2 e;
    uniform float amount;
    uniform float shadowBlur;

    void main(void){
        float d = dot(lightToPixel, lightToPixel);
        vec3 multiColor = (vColor.rgb * lightColor) / (1.0 + 0.0001 * d);

        vec2 delta = min((vShadowLayerCoord - s), (e - vShadowLayerCoord));
        float dm = max(0.0, 1.0 - max(0.0, shadowBlur * min(delta.x, delta.y)));
        dm = (dm * dm) * vShadowEnabled + (1.0 - vShadowEnabled);
        multiColor.rgb = multiColor.rgb * dm;

        multiColor = mix(vColor.rgb, multiColor, amount);
        gl_FragColor = texture2D(uSampler, vTextureCoord) * vec4(multiColor, vColor.a);
    }
`;

let StageUtils = require('../../src/core/StageUtils');

module.exports = UiLightShader