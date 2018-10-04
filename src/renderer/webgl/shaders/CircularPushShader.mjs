import Utils from "../../../tree/Utils.mjs";
import DefaultShader from "./DefaultShader.mjs";

export default class CircularPushShader extends DefaultShader {

    constructor(ctx) {
        super(ctx);

        this._inputValue = 0;

        this._maxDerivative = 0.01;

        this._normalizedValue = 0;

        // The offset between buckets. A value between 0 and 1.
        this._offset = 0;

        this._amount = 0.1;

        this._aspectRatio = 1;

        this._offsetX = 0;

        this._offsetY = 0;

        this.buckets = 100;
    }

    get aspectRatio() {
        return this._aspectRatio;
    }

    set aspectRatio(v) {
        this._aspectRatio = v;
        this.redraw();
    }

    get offsetX() {
        return this._offsetX;
    }

    set offsetX(v) {
        this._offsetX = v;
        this.redraw();
    }

    get offsetY() {
        return this._offsetY;
    }

    set offsetY(v) {
        this._offsetY = v;
        this.redraw();
    }

    set amount(v) {
        this._amount = v;
        this.redraw();
    }

    get amount() {
        return this._amount;
    }

    set inputValue(v) {
        this._inputValue = v;
    }

    get inputValue() {
        return this._inputValue;
    }

    set maxDerivative(v) {
        this._maxDerivative = v;
    }

    get maxDerivative() {
        return this._maxDerivative;
    }

    set buckets(v) {
        if (v > 100) {
            console.warn("CircularPushShader: supports max 100 buckets");
            v = 100;
        }

        // This should be set before starting.
        this._buckets = v;

        // Init values array in the correct length.
        this._values = new Uint8Array(this._getValues(v));

        this.redraw();
    }

    get buckets() {
        return this._buckets;
    }

    _getValues(n) {
        const v = [];
        for (let i = 0; i < n; i++) {
            v.push(this._inputValue);
        }
        return v;
    }

    /**
     * Progresses the shader with the specified (fractional) number of buckets.
     * @param {number} o;
     *   A number from 0 to 1 (1 = all buckets).
     */
    progress(o) {
        this._offset += o * this._buckets;
        const full = Math.floor(this._offset);
        this._offset -= full;
        this._shiftBuckets(full);
        this.redraw();
    }

    _shiftBuckets(n) {
        for (let i = this._buckets - 1; i >= 0; i--) {
            const targetIndex = i - n;
            if (targetIndex < 0) {
                this._normalizedValue = Math.min(this._normalizedValue + this._maxDerivative, Math.max(this._normalizedValue - this._maxDerivative, this._inputValue));
                this._values[i] = 255 * this._normalizedValue;
            } else {
                this._values[i] = this._values[targetIndex];
            }
        }
    }

    set offset(v) {
        this._offset = v;
        this.redraw();
    }

    setupUniforms(operation) {
        super.setupUniforms(operation);
        this._setUniform("aspectRatio", this._aspectRatio, this.gl.uniform1f);
        this._setUniform("offsetX", this._offsetX, this.gl.uniform1f);
        this._setUniform("offsetY", this._offsetY, this.gl.uniform1f);
        this._setUniform("amount", this._amount, this.gl.uniform1f);
        this._setUniform("offset", this._offset, this.gl.uniform1f);
        this._setUniform("buckets", this._buckets, this.gl.uniform1f);
        this._setUniform("uValueSampler", 1, this.gl.uniform1i);
    }

    useDefault() {
        return this._amount === 0;
    }

    beforeDraw(operation) {
        const gl = this.gl;
        gl.activeTexture(gl.TEXTURE1);
        if (!this._valuesTexture) {
            this._valuesTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this._valuesTexture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            if (Utils.isNode) {
                gl.pixelStorei(gl.UNPACK_FLIP_BLUE_RED, false);
            }
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        } else {
            gl.bindTexture(gl.TEXTURE_2D, this._valuesTexture);
        }

        // Upload new values.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, this._buckets, 1, 0, gl.ALPHA, gl.UNSIGNED_BYTE, this._values);
        gl.activeTexture(gl.TEXTURE0);
    }

    cleanup() {
        if (this._valuesTexture) {
            this.gl.deleteTexture(this._valuesTexture);
        }
    }


}

CircularPushShader.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    attribute vec4 aColor;
    uniform vec2 projection;
    uniform float offsetX;
    uniform float offsetY;
    uniform float aspectRatio;
    varying vec2 vTextureCoord;
    varying vec2 vPos;
    varying vec4 vColor;
    void main(void){
        gl_Position = vec4(aVertexPosition.x * projection.x - 1.0, aVertexPosition.y * -abs(projection.y) + 1.0, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
        vPos = vTextureCoord * 2.0 - 1.0;
        vPos.y = vPos.y * aspectRatio;
        vPos.y = vPos.y + offsetY;
        vPos.x = vPos.x + offsetX;
        vColor = aColor;
        gl_Position.y = -sign(projection.y) * gl_Position.y;
    }
`;

CircularPushShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    varying vec2 vPos;
    uniform float amount;
    uniform float offset;
    uniform float values[100];
    uniform float buckets;
    uniform sampler2D uSampler;
    uniform sampler2D uValueSampler;
    void main(void){
        float l = length(vPos);
        float m = (l * buckets * 0.678 - offset) / buckets;
        float f = texture2D(uValueSampler, vec2(m, 0.0)).a * amount;
        vec2 unit = vPos / l;
        gl_FragColor = texture2D(uSampler, vTextureCoord - f * unit) * vColor;
    }
`;


