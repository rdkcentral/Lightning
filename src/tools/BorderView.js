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

        this._updateLayout = false;

        this.layoutExit = function (view, recalc) {
            if (recalc || view._updateLayout) {
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

    get BORDERWIDTH() {
        return this._getTransVal('borderWidth', this.borderWidth);
    }

    set BORDERWIDTH(v) {
        this._setTransVal('borderWidth', v)
    }

    get BORDERWIDTHTOP() {
        return this._getTransVal('borderWidthTop', this.borderWidthTop);
    }

    set BORDERWIDTHTOP(v) {
        this._setTransVal('borderWidthTop', v)
    }

    get BORDERWIDTHRIGHT() {
        return this._getTransVal('borderWidthRight', this.borderWidthRight);
    }

    set BORDERWIDTHRIGHT(v) {
        this._setTransVal('borderWidthRight', v)
    }

    get BORDERWIDTHBOTTOM() {
        return this._getTransVal('borderWidthBottom', this.borderWidthBottom);
    }

    set BORDERWIDTHBOTTOM(v) {
        this._setTransVal('borderWidthBottom', v)
    }

    get BORDERWIDTHLEFT() {
        return this._getTransVal('borderWidthLeft', this.borderWidthLeft);
    }

    set BORDERWIDTHLEFT(v) {
        this._setTransVal('borderWidthLeft', v)
    }

    get BORDERCOLOR() {
        return this._getTransVal('borderColor', this.borderColor);
    }

    set BORDERCOLOR(v) {
        this._setTransVal('borderColor', v)
    }

    get BORDERCOLORTOP() {
        return this._getTransVal('borderColorTop', this.borderColorTop);
    }

    set BORDERCOLORTOP(v) {
        this._setTransVal('borderColorTop', v)
    }

    get BORDERCOLORRIGHT() {
        return this._getTransVal('borderColorRight', this.borderColorRight);
    }

    set BORDERCOLORRIGHT(v) {
        this._setTransVal('borderColorRight', v)
    }

    get BORDERCOLORBOTTOM() {
        return this._getTransVal('borderColorBottom', this.borderColorBottom);
    }

    set BORDERCOLORBOTTOM(v) {
        this._setTransVal('borderColorBottom', v)
    }

    get BORDERCOLORLEFT() {
        return this._getTransVal('borderColorLeft', this.borderColorLeft);
    }

    set BORDERCOLORLEFT(v) {
        this._setTransVal('borderColorLeft', v)
    }
}

BorderView.NUMBER_PROPERTIES = new Set(['borderWidth', 'borderWidthTop', 'borderWidthRight', 'borderWidthBottom', 'borderWidthLeft'])
BorderView.COLOR_PROPERTIES = new Set(['borderColor', 'borderColorTop', 'borderColorRight', 'borderColorBottom', 'borderColorLeft'])


module.exports = BorderView;