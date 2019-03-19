import Component from "../application/Component.mjs";
import LinearBlurShader from "../renderer/webgl/shaders/LinearBlurShader.mjs";
import BoxBlurShader from "../renderer/webgl/shaders/BoxBlurShader.mjs";
import DefaultShader from "../renderer/webgl/shaders/DefaultShader.mjs";

export default class BloomComponent extends Component {

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
            Textwrap: {rtt: true, forceZIndexContext: true, renderOffscreen: true,
                BloomBase: {shader: {type: BloomBaseShader},
                    Content: {}
                }
            },
            Layers: {
                L0: {rtt: true, onUpdate: onUpdate, scale: 2, pivot: 0, visible: false, Content: {shader: {type: BoxBlurShader}}},
                L1: {rtt: true, onUpdate: onUpdate, scale: 4, pivot: 0, visible: false, Content: {shader: {type: BoxBlurShader}}},
                L2: {rtt: true, onUpdate: onUpdate, scale: 8, pivot: 0, visible: false, Content: {shader: {type: BoxBlurShader}}},
                L3: {rtt: true, onUpdate: onUpdate, scale: 16, pivot: 0, visible: false, Content: {shader: {type: BoxBlurShader}}}
            }
        }
    }

    get _signalProxy() {
        return true;
    }

    constructor(stage) {
        super(stage);
        this._textwrap = this.sel("Textwrap");
        this._wrapper = this.sel("Textwrap.Content");
        this._layers = this.sel("Layers");

        this._amount = 0;
        this._paddingX = 0;
        this._paddingY = 0;
    }

    _build() {
        const filterShaderSettings = [{x:1,y:0,kernelRadius:3},{x:0,y:1,kernelRadius:3},{x:1.5,y:0,kernelRadius:3},{x:0,y:1.5,kernelRadius:3}];
        const filterShaders = filterShaderSettings.map(s => {
            const shader = this.stage.createShader(Object.assign({type: LinearBlurShader}, s));
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
        return this.sel('Textwrap.Content');
    }

    set content(v) {
        this.sel('Textwrap.Content').patch(v);
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
        this._textwrap.x = -paddingX;

        this._textwrap.h = fh;
        this._wrapper.y = paddingY;
        this.getLayer(0).h = this.getLayerContents(0).h = fh / 2;
        this.getLayer(1).h = this.getLayerContents(1).h = fh / 4;
        this.getLayer(2).h = this.getLayerContents(2).h = fh / 8;
        this.getLayer(3).h = this.getLayerContents(3).h = fh / 16;
        this._textwrap.y = -paddingY;

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
        if (v > 0) {
            this.getLayer(0).visible = (v > 0);
            this.getLayer(1).visible = (v > 1);
            this.getLayer(2).visible = (v > 2);
            this.getLayer(3).visible = (v > 3);
        }
    }

    set shader(s) {
        super.shader = s;
        if (!this.renderToTexture) {
            console.warn("Please enable renderToTexture to use with a shader.");
        }
    }

    _firstActive() {
        this._build();
    }

}

class BloomBaseShader extends DefaultShader {
}

BloomBaseShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    void main(void){
        vec4 color = texture2D(uSampler, vTextureCoord) * vColor;
        float m = max(max(color.r, color.g), color.b);
        float c = max(0.0, (m - 0.80)) * 5.0;
        color = color * c;
        gl_FragColor = color;
    }
`;
