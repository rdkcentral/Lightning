/**
 * Copyright Metrological, 2017
 */
let View = require('../core/View');
let ViewChildList = require('../core/ViewChildList');

class BorderView extends View {

    constructor(stage) {
        super(stage);

        this._wrapper = super._children.a({});

        this._borderTop = super._children.a({rect: true, visible: false, mountY: 1});
        this._borderRight = super._children.a({rect: true, visible: false});
        this._borderBottom = super._children.a({rect: true, visible: false});
        this._borderLeft = super._children.a({rect: true, visible: false, mountX: 1});

        this.layoutExit = function (view, recalc) {
            if (recalc) {
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
    }

    set borderWidthRight(v) {
        this._borderRight.w = v;
        this._borderRight.visible = (v > 0);
    }

    set borderWidthBottom(v) {
        this._borderBottom.h = v;
        this._borderBottom.visible = (v > 0);
    }

    set borderWidthLeft(v) {
        this._borderLeft.w = v;
        this._borderLeft.visible = (v > 0);
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

    get BORDERWIDTH() {
        return this._getTransVal('borderWidth', this.borderWidth);
    }

    set BORDERWIDTH(v) {
        this._setTransVal('borderWidth', v) || (this.borderWidth = v);
    }

    get BORDERWIDTHTOP() {
        return this._getTransVal('borderWidthTop', this.borderWidthTop);
    }

    set BORDERWIDTHTOP(v) {
        this._setTransVal('borderWidthTop', v) || (this.borderWidthTop = v);
    }

    get BORDERWIDTHRIGHT() {
        return this._getTransVal('borderWidthRight', this.borderWidthRight);
    }

    set BORDERWIDTHRIGHT(v) {
        this._setTransVal('borderWidthRight', v) || (this.borderWidthRight = v);
    }

    get BORDERWIDTHBOTTOM() {
        return this._getTransVal('borderWidthBottom', this.borderWidthBottom);
    }

    set BORDERWIDTHBOTTOM(v) {
        this._setTransVal('borderWidthBottom', v) || (this.borderWidthBottom = v);
    }

    get BORDERWIDTHLEFT() {
        return this._getTransVal('borderWidthLeft', this.borderWidthLeft);
    }

    set BORDERWIDTHLEFT(v) {
        this._setTransVal('borderWidthLeft', v) || (this.borderWidthLeft = v);
    }

}

module.exports = BorderView;