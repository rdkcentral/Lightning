import Component from "../application/Component.mjs";

export default class BorderComponent extends Component {

    static _template() {
        return {
            Content: {},
            Borders: {
                Top: {rect: true, visible: false, mountY: 1},
                Right: {rect: true, visible: false},
                Bottom: {rect: true, visible: false},
                Left: {rect: true, visible: false, mountX: 1}
            }
        };
    }

    get _signalProxy() {
        return true;
    }

    constructor(stage) {
        super(stage);

        this._borderTop = this.tag("Top");
        this._borderRight = this.tag("Right");
        this._borderBottom = this.tag("Bottom");
        this._borderLeft = this.tag("Left");

        this.onAfterUpdate = function (element) {
            const content = element.childList.first;
            let w = element.core.w || content.renderWidth;
            let h = element.core.h || content.renderHeight;
            element._borderTop.w = w;
            element._borderBottom.y = h;
            element._borderBottom.w = w;
            element._borderLeft.h = h + element._borderTop.h + element._borderBottom.h;
            element._borderLeft.y = -element._borderTop.h;
            element._borderRight.x = w;
            element._borderRight.h = h + element._borderTop.h + element._borderBottom.h;
            element._borderRight.y = -element._borderTop.h;
        };

        this.borderWidth = 1;
    }

    get content() {
        return this.sel('Content');
    }

    set content(v) {
        this.sel('Content').patch(v, true);
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

    get colorBorder() {
        return this.colorBorderTop;
    }

    get colorBorderTop() {
        return this._borderTop.color;
    }

    get colorBorderRight() {
        return this._borderRight.color;
    }

    get colorBorderBottom() {
        return this._borderBottom.color;
    }

    get colorBorderLeft() {
        return this._borderLeft.color;
    }

    set colorBorder(v) {
        this.colorBorderTop = v;
        this.colorBorderRight = v;
        this.colorBorderBottom = v;
        this.colorBorderLeft = v;
    }

    set colorBorderTop(v) {
        this._borderTop.color = v;
    }

    set colorBorderRight(v) {
        this._borderRight.color = v;
    }

    set colorBorderBottom(v) {
        this._borderBottom.color = v;
    }

    set colorBorderLeft(v) {
        this._borderLeft.color = v;
    }

    get borderTop() {
        return this._borderTop;
    }

    set borderTop(settings) {
        this.borderTop.patch(settings);
    }

    get borderRight() {
        return this._borderRight;
    }

    set borderRight(settings) {
        this.borderRight.patch(settings);
    }

    get borderBottom() {
        return this._borderBottom;
    }

    set borderBottom(settings) {
        this.borderBottom.patch(settings);
    }

    get borderLeft() {
        return this._borderLeft;
    }

    set borderLeft(settings) {
        this.borderLeft.patch(settings);
    }

    set borders(settings) {
        this.borderTop = settings;
        this.borderLeft = settings;
        this.borderBottom = settings;
        this.borderRight = settings;
    }

}

