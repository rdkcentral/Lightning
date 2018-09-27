/**
 * Copyright Metrological, 2017;
 */
import View from "../../tree/View.mjs";
import LinearBlurFilter from "../filters/LinearBlurFilter.mjs";
import Shader from "../../tree/Shader.mjs";

export default class FastBlurView extends View {

    constructor(stage) {
        super(stage);

        let fastBoxBlurShader = FastBlurView.getFastBoxBlurShader(stage.ctx);

        this.tagRoot = true;

        this.patch({
            "Textwrap": {renderToTexture: false, renderOffscreen: true, "Content": {}},
            "Layers": {
                "L0": {renderToTexture: true, renderOffscreen: true, visible: false, "Content": {shader: fastBoxBlurShader}},
                "L1": {renderToTexture: true, renderOffscreen: true, visible: false, "Content": {shader: fastBoxBlurShader}},
                "L2": {renderToTexture: true, renderOffscreen: true, visible: false, "Content": {shader: fastBoxBlurShader}},
                "L3": {renderToTexture: true, renderOffscreen: true, visible: false, "Content": {shader: fastBoxBlurShader}},
            },
            "Result": {shader: {type: FastBlurOutputShader}, visible: false}
        }, true);

        this._textwrap = this.sel("Textwrap");
        this._wrapper = this.sel("Textwrap>Content");
        this._layers = this.sel("Layers");
        this._output = this.sel("Result");

        this.getLayerContents(0).texture = this._textwrap.getTexture();
        this.getLayerContents(1).texture = this.getLayer(0).getTexture();
        this.getLayerContents(2).texture = this.getLayer(1).getTexture();
        this.getLayerContents(3).texture = this.getLayer(2).getTexture();

        let filters = FastBlurView.getLinearBlurFilters(stage.ctx);
        this.getLayer(1).filters = [filters[0], filters[1]];
        this.getLayer(2).filters = [filters[2], filters[3], filters[0], filters[1]];
        this.getLayer(3).filters = [filters[2], filters[3], filters[0], filters[1]];

        this._amount = 0;
        this._paddingX = 0;
        this._paddingY = 0;
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
        this.paddingX = v;
        this._updateBlurSize();
    }

    set paddingY(v) {
        this.paddingY = v;
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
            console.warn("FastBlurView: please enable renderToTexture to use with a shader.");
        }
    }

    static getFastBoxBlurShader(ctx) {
        if (!ctx.fastBoxBlurShader) {
            ctx.fastBoxBlurShader = new FastBoxBlurShader(ctx);
        }
        return ctx.fastBoxBlurShader;
    }

    static getLinearBlurFilters(ctx) {
        if (!ctx.linearBlurFilters) {
            ctx.linearBlurFilters = [];

            let lbf = new LinearBlurFilter(ctx);
            lbf.x = 1;
            lbf.y = 0;
            lbf.kernelRadius = 1;
            ctx.linearBlurFilters.push(lbf);

            lbf = new LinearBlurFilter(ctx);
            lbf.x = 0;
            lbf.y = 1;
            lbf.kernelRadius = 1;
            ctx.linearBlurFilters.push(lbf);

            lbf = new LinearBlurFilter(ctx);
            lbf.x = 1.5;
            lbf.y = 0;
            lbf.kernelRadius = 1;
            ctx.linearBlurFilters.push(lbf);

            lbf = new LinearBlurFilter(ctx);
            lbf.x = 0;
            lbf.y = 1.5;
            lbf.kernelRadius = 1;
            ctx.linearBlurFilters.push(lbf);
        }
        return ctx.linearBlurFilters;
    }


}

/**
 * 4x4 box blur shader which works in conjunction with a 50% rescale.
 */
class FastBoxBlurShader extends Shader {

    constructor(ctx) {
        super(ctx);
    }

    setupUniforms(operation) {
        super.setupUniforms(operation);
        const dx = 1.0 / operation.getTextureWidth(0);
        const dy = 1.0 / operation.getTextureHeight(0);
        this._setUniform("stepTextureCoord", new Float32Array([dx, dy]), this.gl.uniform2fv);
    }

}

FastBoxBlurShader.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    uniform vec2 stepTextureCoord;
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    attribute vec4 aColor;
    uniform vec2 projection;
    varying vec4 vColor;
    varying vec2 vTextureCoordUl;
    varying vec2 vTextureCoordUr;
    varying vec2 vTextureCoordBl;
    varying vec2 vTextureCoordBr;
    void main(void){
        gl_Position = vec4(aVertexPosition.x * projection.x - 1.0, aVertexPosition.y * -abs(projection.y) + 1.0, 0.0, 1.0);
        vTextureCoordUl = aTextureCoord - stepTextureCoord;
        vTextureCoordBr = aTextureCoord + stepTextureCoord;
        vTextureCoordUr = vec2(vTextureCoordBr.x, vTextureCoordUl.y);
        vTextureCoordBl = vec2(vTextureCoordUl.x, vTextureCoordBr.y);
        vColor = aColor;
        gl_Position.y = -sign(projection.y) * gl_Position.y;
    }
`;

FastBoxBlurShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoordUl;
    varying vec2 vTextureCoordUr;
    varying vec2 vTextureCoordBl;
    varying vec2 vTextureCoordBr;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    void main(void){
        vec4 color = 0.25 * (texture2D(uSampler, vTextureCoordUl) + texture2D(uSampler, vTextureCoordUr) + texture2D(uSampler, vTextureCoordBl) + texture2D(uSampler, vTextureCoordBr));
        gl_FragColor = color * vColor;
    }
`;

/**
 * Shader that combines two textures into one output.
 */
class FastBlurOutputShader extends Shader {

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

    isMergable(shader) {
        return super.isMergable(shader) && (shader._otherTextureSource === this._otherTextureSource);
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
