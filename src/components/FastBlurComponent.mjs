import Component from "../application/Component.mjs";
import LinearBlurShader from "../renderer/webgl/shaders/LinearBlurShader.mjs";
import BoxBlurShader from "../renderer/webgl/shaders/BoxBlurShader.mjs";
import DefaultShader from "../renderer/webgl/shaders/DefaultShader.mjs";
import C2dBlurShader from "../renderer/c2d/shaders/BlurShader.mjs";
import Shader from "../tree/Shader.mjs";
import MultiSpline from "../tools/MultiSpline.mjs";

export default class FastBlurComponent extends Component {
    static _template() {
        return {}
    }

    get wrap() {
        return this.tag("Wrap");
    }

    set content(v) {
        return this.wrap.content = v;
    }

    get content() {
        return this.wrap.content;
    }

    set padding(v) {
        this.wrap._paddingX = v;
        this.wrap._paddingY = v;
        this.wrap._updateBlurSize();
    }

    set paddingX(v) {
        this.wrap._paddingX = v;
        this.wrap._updateBlurSize();
    }

    set paddingY(v) {
        this.wrap._paddingY = v;
        this.wrap._updateBlurSize();
    }

    set amount(v) {
        return this.wrap.amount = v;
    }

    get amount() {
        return this.wrap.amount;
    }

    _onResize() {
        this.wrap.w = this.renderWidth;
        this.wrap.h = this.renderHeight;
    }

    get _signalProxy() {
        return true;
    }

    _build() {
        this.patch({
            Wrap: {type: this.stage.gl ? WebGLFastBlurComponent : C2dFastBlurComponent}
        });
    }

}


class C2dFastBlurComponent extends Component {

    static _template() {
        return {
            forceZIndexContext: true,
            rtt: true,
            Textwrap: {shader: {type: C2dBlurShader}, Content: {}}
        }
    }

    constructor(stage) {
        super(stage);
        this._textwrap = this.sel("Textwrap");
        this._wrapper = this.sel("Textwrap>Content");

        this._amount = 0;
        this._paddingX = 0;
        this._paddingY = 0;

    }

    static getSpline() {
        if (!this._multiSpline) {
            this._multiSpline = new MultiSpline();
            this._multiSpline.parse(false, {0: 0, 0.25: 1.5, 0.5: 5.5, 0.75: 18, 1: 39});
        }
        return this._multiSpline;
    }

    get content() {
        return this.sel('Textwrap>Content');
    }

    set content(v) {
        this.sel('Textwrap>Content').patch(v, true);
    }

    set padding(v) {
        this._paddingX = v;
        this._paddingY = v;
        this._updateBlurSize();
    }

    set paddingX(v) {
        this._paddingX = v;
        this._updateBlurSize();
    }

    set paddingY(v) {
        this._paddingY = v;
        this._updateBlurSize();
    }

    _updateBlurSize() {
        let w = this.renderWidth;
        let h = this.renderHeight;

        let paddingX = this._paddingX;
        let paddingY = this._paddingY;

        this._wrapper.x = paddingX;
        this._textwrap.x = -paddingX;

        this._wrapper.y = paddingY;
        this._textwrap.y = -paddingY;

        this._textwrap.w = w + paddingX * 2;
        this._textwrap.h = h + paddingY * 2;
    }

    get amount() {
        return this._amount;
    }

    /**
     * Sets the amount of blur. A value between 0 and 4. Goes up exponentially for blur.
     * Best results for non-fractional values.
     * @param v;
     */
    set amount(v) {
        this._amount = v;
        this._textwrap.shader.kernelRadius = C2dFastBlurComponent._amountToKernelRadius(v);
    }

    static _amountToKernelRadius(v) {
        return C2dFastBlurComponent.getSpline().getValue(Math.min(1, v * 0.25));
    }

    get _signalProxy() {
        return true;
    }

}

class WebGLFastBlurComponent extends Component {

    static _template() {
        const onUpdate = function(element, elementCore) {
            if ((elementCore._recalc & (2 + 128))) {
                const w = elementCore.w;
                const h = elementCore.h;
                let cur = elementCore;
                do {
                    cur = cur._children[0];
                    cur._element.w = w;
                    cur._element.h = h;
                } while(cur._children);
            }
        };

        return {
            Textwrap: {rtt: true, forceZIndexContext: true, renderOffscreen: true, Content: {}},
            Layers: {
                L0: {rtt: true, onUpdate: onUpdate, renderOffscreen: true, visible: false, Content: {shader: {type: BoxBlurShader}}},
                L1: {rtt: true, onUpdate: onUpdate, renderOffscreen: true, visible: false, Content: {shader: {type: BoxBlurShader}}},
                L2: {rtt: true, onUpdate: onUpdate, renderOffscreen: true, visible: false, Content: {shader: {type: BoxBlurShader}}},
                L3: {rtt: true, onUpdate: onUpdate, renderOffscreen: true, visible: false, Content: {shader: {type: BoxBlurShader}}}
            },
            Result: {shader: {type: FastBlurOutputShader}, visible: false}
        }
    }

    get _signalProxy() {
        return true;
    }

    constructor(stage) {
        super(stage);
        this._textwrap = this.sel("Textwrap");
        this._wrapper = this.sel("Textwrap>Content");
        this._layers = this.sel("Layers");
        this._output = this.sel("Result");

        this._amount = 0;
        this._paddingX = 0;
        this._paddingY = 0;
    }

    _buildLayers() {
        const filterShaderSettings = [{x:1,y:0,kernelRadius:1},{x:0,y:1,kernelRadius:1},{x:1.5,y:0,kernelRadius:1},{x:0,y:1.5,kernelRadius:1}];
        const filterShaders = filterShaderSettings.map(s => {
            const shader = Shader.create(this.stage, Object.assign({type: LinearBlurShader}, s));
            return shader;
        });

        this._setLayerTexture(this.getLayerContents(0), this._textwrap.getTexture(), []);
        this._setLayerTexture(this.getLayerContents(1), this.getLayer(0).getTexture(), [filterShaders[0], filterShaders[1]]);

        // Notice that 1.5 filters should be applied before 1.0 filters.
        this._setLayerTexture(this.getLayerContents(2), this.getLayer(1).getTexture(), [filterShaders[0], filterShaders[1], filterShaders[2], filterShaders[3]]);
        this._setLayerTexture(this.getLayerContents(3), this.getLayer(2).getTexture(), [filterShaders[0], filterShaders[1], filterShaders[2], filterShaders[3]]);
    }

    _setLayerTexture(element, texture, steps) {
        if (!steps.length) {
            element.texture = texture;
        } else {
            const step = steps.pop();
            const child = element.stage.c({rtt: true, shader: step});

            // Recurse.
            this._setLayerTexture(child, texture, steps);

            element.childList.add(child);
        }
        return element;
    }

    get content() {
        return this.sel('Textwrap>Content');
    }

    set content(v) {
        this.sel('Textwrap>Content').patch(v, true);
    }

    set padding(v) {
        this._paddingX = v;
        this._paddingY = v;
        this._updateBlurSize();
    }

    set paddingX(v) {
        this._paddingX = v;
        this._updateBlurSize();
    }

    set paddingY(v) {
        this._paddingY = v;
        this._updateBlurSize();
    }

    getLayer(i) {
        return this._layers.sel("L" + i);
    }

    getLayerContents(i) {
        return this.getLayer(i).sel("Content");
    }

    _onResize() {
        this._updateBlurSize();
    }

    _updateBlurSize() {
        let w = this.renderWidth;
        let h = this.renderHeight;

        let paddingX = this._paddingX;
        let paddingY = this._paddingY;

        let fw = w + paddingX * 2;
        let fh = h + paddingY * 2;
        this._textwrap.w = fw;
        this._wrapper.x = paddingX;
        this.getLayer(0).w = this.getLayerContents(0).w = fw / 2;
        this.getLayer(1).w = this.getLayerContents(1).w = fw / 4;
        this.getLayer(2).w = this.getLayerContents(2).w = fw / 8;
        this.getLayer(3).w = this.getLayerContents(3).w = fw / 16;
        this._output.x = -paddingX;
        this._textwrap.x = -paddingX;
        this._output.w = fw;

        this._textwrap.h = fh;
        this._wrapper.y = paddingY;
        this.getLayer(0).h = this.getLayerContents(0).h = fh / 2;
        this.getLayer(1).h = this.getLayerContents(1).h = fh / 4;
        this.getLayer(2).h = this.getLayerContents(2).h = fh / 8;
        this.getLayer(3).h = this.getLayerContents(3).h = fh / 16;
        this._output.y = -paddingY;
        this._textwrap.y = -paddingY;
        this._output.h = fh;

        this.w = w;
        this.h = h;
    }

    /**
     * Sets the amount of blur. A value between 0 and 4. Goes up exponentially for blur.
     * Best results for non-fractional values.
     * @param v;
     */
    set amount(v) {
        this._amount = v;
        this._update();
    }

    get amount() {
        return this._amount;
    }

    _update() {
        let v = Math.min(4, Math.max(0, this._amount));
        if (v === 0) {
            this._textwrap.renderToTexture = false;
            this._output.shader.otherTextureSource = null;
            this._output.visible = false;
        } else {
            this._textwrap.renderToTexture = true;
            this._output.visible = true;

            this.getLayer(0).visible = (v > 0);
            this.getLayer(1).visible = (v > 1);
            this.getLayer(2).visible = (v > 2);
            this.getLayer(3).visible = (v > 3);

            if (v <= 1) {
                this._output.texture = this._textwrap.getTexture();
                this._output.shader.otherTextureSource = this.getLayer(0).getTexture();
                this._output.shader.a = v;
            } else if (v <= 2) {
                this._output.texture = this.getLayer(0).getTexture();
                this._output.shader.otherTextureSource = this.getLayer(1).getTexture();
                this._output.shader.a = v - 1;
            } else if (v <= 3) {
                this._output.texture = this.getLayer(1).getTexture();
                this._output.shader.otherTextureSource = this.getLayer(2).getTexture();
                this._output.shader.a = v - 2;
            } else if (v <= 4) {
                this._output.texture = this.getLayer(2).getTexture();
                this._output.shader.otherTextureSource = this.getLayer(3).getTexture();
                this._output.shader.a = v - 3;
            }
        }
    }

    set shader(s) {
        super.shader = s;
        if (!this.renderToTexture) {
            console.warn("Please enable renderToTexture to use with a shader.");
        }
    }

    _firstActive() {
        this._buildLayers();
    }

}

/**
 * Shader that combines two textures into one output.
 */
class FastBlurOutputShader extends DefaultShader {

    constructor(ctx) {
        super(ctx);

        this._a = 0;
        this._otherTextureSource = null;
    }

    get a() {
        return this._a;
    }

    set a(v) {
        this._a = v;
        this.redraw();
    }

    set otherTextureSource(v) {
        this._otherTextureSource = v;
        this.redraw();
    }

    setupUniforms(operation) {
        super.setupUniforms(operation);
        this._setUniform("a", this._a, this.gl.uniform1f);
        this._setUniform("uSampler2", 1, this.gl.uniform1i);
    }

    beforeDraw(operation) {
        let glTexture = this._otherTextureSource ? this._otherTextureSource.nativeTexture : null;

        let gl = this.gl;
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, glTexture);
        gl.activeTexture(gl.TEXTURE0);
    }
}

FastBlurOutputShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    uniform sampler2D uSampler2;
    uniform float a;
    void main(void){
        if (a == 1.0) {
            gl_FragColor = texture2D(uSampler2, vTextureCoord) * vColor;
        } else {
            gl_FragColor = ((1.0 - a) * texture2D(uSampler, vTextureCoord) + (a * texture2D(uSampler2, vTextureCoord))) * vColor;
        }
    }
`;
