/**
 * Copyright Metrological, 2017
 */
let View = require('../../core/View');
let ViewChildList = require('../../core/ViewChildList');

class BorderView extends View {

    constructor(stage) {
        super(stage);

        this._wrapper = super._children.a({});

        this._borderTop = super._children.a({rect: true, visible: false, mountY: 1});
        this._borderRight = super._children.a({rect: true, visible: false});
        this._borderBottom = super._children.a({rect: true, visible: false});
        this._borderLeft = super._children.a({rect: true, visible: false, mountX: 1});

        this._updateLayout = false;

        this.layoutExit = function (view, recalc) {
            let hasSingleChild = view.children.length === 1;
            let refresh = (hasSingleChild && (view.children[0]._core._recalc & 2)) || recalc || view._updateLayout;
            if (refresh) {
                if (view.children.length === 1) {
                    view.w = view.children[0].renderWidth;
                    view.h = view.children[0].renderHeight;
                }
                let rw = view.renderWidth;
                let rh = view.renderHeight;
                view._borderTop.w = rw;
                view._borderBottom.y = rh;
                view._borderBottom.w = rw;
                view._borderLeft.h = rh + view._borderTop.h + view._borderBottom.h;
                view._borderLeft.y = -view._borderTop.h;
                view._borderRight.x = rw;
                view._borderRight.h = rh + view._borderTop.h + view._borderBottom.h;
                view._borderRight.y = -view._borderTop.h;
                view._wrapper.w = rw;
                view._wrapper.h = rh;
                view._updateLayout = false;
            }
        }
    }

    _getExposedChildList() {
        // Proxy children to wrapper.
        return this._wrapper._children;
    }

    get borderWidth() {
        return this.borderWidthTop;
    }

    get borderWidthTop() {
        return this._borderTop.h;
    }

    get borderWidthRight() {
        return this._borderRight.w;
    }

    get borderWidthBottom() {
        return this._borderBottom.h;
    }

    get borderWidthLeft() {
        return this._borderLeft.w;
    }

    set borderWidth(v) {
        this.borderWidthTop = v;
        this.borderWidthRight = v;
        this.borderWidthBottom = v;
        this.borderWidthLeft = v;
    }

    set borderWidthTop(v) {
        this._borderTop.h = v;
        this._borderTop.visible = (v > 0);
        this._updateLayout = true;
    }

    set borderWidthRight(v) {
        this._borderRight.w = v;
        this._borderRight.visible = (v > 0);
        this._updateLayout = true;
    }

    set borderWidthBottom(v) {
        this._borderBottom.h = v;
        this._borderBottom.visible = (v > 0);
        this._updateLayout = true;
    }

    set borderWidthLeft(v) {
        this._borderLeft.w = v;
        this._borderLeft.visible = (v > 0);
        this._updateLayout = true;
    }

    get borderColor() {
        return this.borderColorTop;
    }

    get borderColorTop() {
        return this._borderTop.color;
    }

    get borderColorRight() {
        return this._borderRight.color;
    }

    get borderColorBottom() {
        return this._borderBottom.color;
    }

    get borderColorLeft() {
        return this._borderLeft.color;
    }
    
    set borderColor(v) {
        this.borderColorTop = v;
        this.borderColorRight = v;
        this.borderColorBottom = v;
        this.borderColorLeft = v;
    }

    set borderColorTop(v) {
        this._borderTop.color = v;
    }

    set borderColorRight(v) {
        this._borderRight.color = v;
    }

    set borderColorBottom(v) {
        this._borderBottom.color = v;
    }

    set borderColorLeft(v) {
        this._borderLeft.color = v;
    }

    get borderTop() {
        return this._borderTop;
    }

    set borderTop(settings) {
        this.borderTop.setSettings(settings);
    }

    get borderRight() {
        return this._borderRight;
    }

    set borderRight(settings) {
        this.borderRight.setSettings(settings);
    }

    get borderBottom() {
        return this._borderBottom;
    }

    set borderBottom(settings) {
        this.borderBottom.setSettings(settings);
    }

    get borderLeft() {
        return this._borderLeft;
    }

    set borderLeft(settings) {
        this.borderLeft.setSettings(settings);
    }    

    set borders(settings) {
        this.borderTop = settings;
        this.borderLeft = settings;
        this.borderBottom = settings;
        this.borderRight = settings;
    }

    get clipping() {
        return this._wrapper.clipping;
    }

    set clipping(v) {
        this._wrapper.clipping = v;
    }

}

BorderView.NUMBER_PROPERTIES = new Set(['borderWidth', 'borderWidthTop', 'borderWidthRight', 'borderWidthBottom', 'borderWidthLeft'])
BorderView.COLOR_PROPERTIES = new Set(['borderColor', 'borderColorTop', 'borderColorRight', 'borderColorBottom', 'borderColorLeft'])


module.exports = BorderView;