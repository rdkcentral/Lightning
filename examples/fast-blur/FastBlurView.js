/**
 * Copyright Metrological, 2017
 */
let View = require('../../src/core/View');

var LinearBlurFilter = require('../../src/tools/filters/LinearBlurFilter')
var FastBoxBlurShader = require('./FastBoxBlurShader')
var FastBlurOutputShader = require('./FastBlurOutputShader')

class FastBlurView extends View {

    constructor(stage) {
        super(stage)

        let fastBoxBlurShader = FastBlurView.getFastBoxBlurShader(stage.ctx)

        let c = this._children
        c.a([
            {renderToTexture: false, hideResultTexture: true, children: [{}]},
            {children: [
                {renderToTexture: true, hideResultTexture: true, visible: false, children: [{shader: fastBoxBlurShader}]},
                {renderToTexture: true, hideResultTexture: true, visible: false, children: [{shader: fastBoxBlurShader}]},
                {renderToTexture: true, hideResultTexture: true, visible: false, children: [{shader: fastBoxBlurShader}]},
                {renderToTexture: true, hideResultTexture: true, visible: false, children: [{shader: fastBoxBlurShader}]},
            ]},
            {shader: {type: FastBlurOutputShader}, visible: false}
        ])

        this._textwrap = c.get()[0]
        this._wrapper = this._textwrap.children[0]
        this._layers = c.get()[1].children
        this._output = c.get()[2]

        this.getLayerContents(0).texture = this._textwrap.getResultTextureSource()
        this.getLayerContents(1).texture = this.getLayer(0).getResultTextureSource()
        this.getLayerContents(2).texture = this.getLayer(1).getResultTextureSource()
        this.getLayerContents(3).texture = this.getLayer(2).getResultTextureSource()

        let filters = FastBlurView.getLinearBlurFilters(stage.ctx)
        this.getLayer(1).filters = [filters[0], filters[1]]
        this.getLayer(2).filters = [filters[2], filters[3], filters[0], filters[1]]
        this.getLayer(3).filters = [filters[2], filters[3], filters[0], filters[1]]

        this._amount = 0
        this._paddingX = 48
        this._paddingY = 48
    }

    set padding(v) {
        this._paddingX = v
        this._paddingY = v
        this._updateBlurSize()
    }

    set paddingX(v) {
        this.paddingX = v
        this._updateBlurSize()
    }

    set paddingY(v) {
        this.paddingY = v
        this._updateBlurSize()
    }

    _getExposedChildList() {
        // Proxy children to wrapper.
        return this._wrapper._children;
    }

    getLayer(i) {
        return this._layers[i]
    }

    getLayerContents(i) {
        return this.getLayer(i).children[0]
    }

    _updateDimensions() {
        if (super._updateDimensions()) {
            this._updateBlurSize()
        }
    }

    _updateBlurSize() {
        let w = this.renderWidth
        let h = this.renderHeight
        
        let paddingX = this._paddingX
        let paddingY = this._paddingY

        let fw = w + paddingX * 2
        let fh = h + paddingY * 2
        this._textwrap.w = fw
        this._wrapper.x = paddingX
        this.getLayer(0).w = this.getLayerContents(0).w = fw / 2
        this.getLayer(1).w = this.getLayerContents(1).w = fw / 4
        this.getLayer(2).w = this.getLayerContents(2).w = fw / 8
        this.getLayer(3).w = this.getLayerContents(3).w = fw / 16
        this._output.x = -paddingX
        this._textwrap.x = -paddingX
        this._output.w = fw

        this._textwrap.h = fh
        this._wrapper.y = paddingY
        this.getLayer(0).h = this.getLayerContents(0).h = fh / 2
        this.getLayer(1).h = this.getLayerContents(1).h = fh / 4
        this.getLayer(2).h = this.getLayerContents(2).h = fh / 8
        this.getLayer(3).h = this.getLayerContents(3).h = fh / 16
        this._output.y = -paddingY
        this._textwrap.y = -paddingY
        this._output.h = fh

        this.w = w
        this.h = h
    }

    /**
     * Sets the amount of blur. A value between 0 and 4.
     * @param v
     */
    set amount(v) {
        this._amount = v
        this._update()
    }

    get amount() {
        return this._amount
    }

    _update() {
        let v = Math.min(4, Math.max(0, this._amount))
        if (v === 0) {
            this._textwrap.renderToTexture = false
            this._output.shader.otherTextureSource = null
            this._output.visible = false
        } else {
            this._textwrap.renderToTexture = true
            this._output.visible = true

            this.getLayer(0).visible = (v > 0);
            this.getLayer(1).visible = (v > 1);
            this.getLayer(2).visible = (v > 2);
            this.getLayer(3).visible = (v > 3);

            if (v <= 1) {
                this._output.texture = this._textwrap.getResultTextureSource()
                this._output.shader.otherTextureSource = this.getLayer(0).getResultTextureSource()
                this._output.shader.a = v
            } else if (v <= 2) {
                this._output.texture = this.getLayer(0).getResultTextureSource()
                this._output.shader.otherTextureSource = this.getLayer(1).getResultTextureSource()
                this._output.shader.a = v - 1
            } else if (v <= 3) {
                this._output.texture = this.getLayer(1).getResultTextureSource()
                this._output.shader.otherTextureSource = this.getLayer(2).getResultTextureSource()
                this._output.shader.a = v - 2
            } else if (v <= 4) {
                this._output.texture = this.getLayer(2).getResultTextureSource()
                this._output.shader.otherTextureSource = this.getLayer(3).getResultTextureSource()
                this._output.shader.a = v - 3
            }
        }
    }

    static getFastBoxBlurShader(ctx) {
        if (!FastBlurView.fastBoxBlurShader) {
            FastBlurView.fastBoxBlurShader = new FastBoxBlurShader(ctx)
        }
        return FastBlurView.fastBoxBlurShader
    }

    static getLinearBlurFilters(ctx) {
        if (!FastBlurView.linearBlurFilters) {
            FastBlurView.linearBlurFilters = []

            let lbf = new LinearBlurFilter(ctx)
            lbf.x = 1
            lbf.y = 0
            lbf.kernelRadius = 1
            FastBlurView.linearBlurFilters.push(lbf)

            lbf = new LinearBlurFilter(ctx)
            lbf.x = 0
            lbf.y = 1
            lbf.kernelRadius = 1
            FastBlurView.linearBlurFilters.push(lbf)

            lbf = new LinearBlurFilter(ctx)
            lbf.x = 1.5
            lbf.y = 0
            lbf.kernelRadius = 1
            FastBlurView.linearBlurFilters.push(lbf)

            lbf = new LinearBlurFilter(ctx)
            lbf.x = 0
            lbf.y = 1.5
            lbf.kernelRadius = 1
            FastBlurView.linearBlurFilters.push(lbf)
        }
        return FastBlurView.linearBlurFilters
    }


}

FastBlurView.NUMBER_PROPERTIES = new Set(['amount'])

let Utils = require('../../src/core/Utils');
/*M¬*/let EventEmitter = require(Utils.isNode ? 'events' : '../../src/browser/EventEmitter');/*¬M*/

module.exports = FastBlurView