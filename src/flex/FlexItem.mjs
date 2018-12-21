import Base from "../tree/Base.mjs";
import FlexUtils from "./FlexUtils.mjs";
import FlexContainer from "./FlexContainer.mjs";

export default class FlexItem {

    constructor(item) {
        this._item = item;
        this._grow = 0;
        this._shrink = FlexItem.SHRINK_AUTO;
        this._alignSelf = undefined;
        this._minSize = 0;

        this._marginLeft = 0;
        this._marginTop = 0;
        this._marginRight = 0;
        this._marginBottom = 0;
    }

    get item() {
        return this._item;
    }

    get grow() {
        return this._grow;
    }

    set grow(v) {
        if (this._grow === v) return;

        this._grow = parseInt(v) || 0;

        this._changed();
    }

    get shrink() {
        if (this._shrink === FlexItem.SHRINK_AUTO) {
            return this._getDefaultShrink();
        }
        return this._shrink;
    }

    _getDefaultShrink() {
        if (this.item.isFlexEnabled()) {
            return 1;
        } else {
            // All non-flex containers are absolutely positioned items with fixed dimensions, and by default not shrinkable.
            return 0;
        }
    }

    set shrink(v) {
        if (this._shrink === v) return;

        this._shrink = parseInt(v) || 0;

        this._changed();
    }

    get alignSelf() {
        return this._alignSelf;
    }

    set alignSelf(v) {
        if (this._alignSelf === v) return;

        if (v === undefined) {
            this._alignSelf = undefined;
        }
        if (FlexContainer.ALIGN_ITEMS.indexOf(v) === -1) {
            throw new Error("Unknown alignSelf, options: " + FlexContainer.ALIGN_ITEMS.join(","));
        }
        this._alignSelf = v;

        this._changed();
    }

    get minSize() {
        return this._minSize;
    }

    set minSize(v) {
        this._minSize = v;
        this._changed();
    }

    /**
     * @note margins behave slightly different than in HTML with regard to shrinking.
     * In HTML, (outer) margins can be removed when shrinking. In this engine, they will not shrink at all.
     */
    set margin(v) {
        this.marginLeft = v;
        this.marginTop = v;
        this.marginRight = v;
        this.marginBottom = v;
    }

    get margin() {
        return this.marginLeft;
    }

    set marginLeft(v) {
        this._marginLeft = v;
        this._changed();
    }

    get marginLeft() {
        return this._marginLeft;
    }

    set marginTop(v) {
        this._marginTop = v;
        this._changed();
    }

    get marginTop() {
        return this._marginTop;
    }

    set marginRight(v) {
        this._marginRight = v;
        this._changed();
    }

    get marginRight() {
        return this._marginRight;
    }

    set marginBottom(v) {
        this._marginBottom = v;
        this._changed();
    }

    get marginBottom() {
        return this._marginBottom;
    }
    
    _changed() {
        if (this.ctr) this.ctr._mustUpdate();
    }

    get ctr() {
        return this._item.target._parent ? this._item.target._parent.layout._flex : undefined;
    }

    patch(settings) {
        Base.patchObject(this, settings);
    }

    _getMainAxisMinSize() {
        return FlexUtils.getAxisMinSize(this.item, this.ctr._horizontal);
    }

    _getCrossAxisMinSize() {
        return FlexUtils.getAxisMinSize(this.item, !this.ctr._horizontal);
    }

    _getMainAxisLayoutSize() {
        return FlexUtils.getAxisLayoutSize(this.item, this.ctr._horizontal);
    }

    _getMainAxisLayoutPos() {
        return FlexUtils.getAxisLayoutPos(this.item, this.ctr._horizontal);
    }

    _setMainAxisLayoutPos(pos) {
        return FlexUtils.setAxisLayoutPos(this.item, this.ctr._horizontal, pos);
    }

    _getCrossAxisLayoutPos() {
        return FlexUtils.getAxisLayoutPos(this.item, !this.ctr._horizontal);
    }

    _setCrossAxisLayoutPos(pos) {
        return FlexUtils.setAxisLayoutPos(this.item, !this.ctr._horizontal, pos);
    }

    _getCrossAxisLayoutSize() {
        return FlexUtils.getAxisLayoutSize(this.item, !this.ctr._horizontal);
    }

    _getCrossAxisBasis() {
        return FlexUtils.getAxisSize(this.item, !this.ctr._horizontal);
    }

    _resizeCrossAxis(size) {
        return FlexUtils.resizeAxis(this.item, !this.ctr._horizontal, size);
    }

    _resizeMainAxis(size) {
        return FlexUtils.resizeAxis(this.item, this.ctr._horizontal, size);
    }

    _getMainAxisPadding() {
        return FlexUtils.getTotalPadding(this.item, this.ctr._horizontal);
    }

    _getCrossAxisPadding() {
        return FlexUtils.getTotalPadding(this.item, !this.ctr._horizontal);
    }

    _getMainAxisMargin() {
        return FlexUtils.getTotalMargin(this.item, this.ctr._horizontal);
    }

    _getCrossAxisMargin() {
        return FlexUtils.getTotalMargin(this.item, !this.ctr._horizontal);
    }

    _getHorizontalMarginOffset() {
        return FlexUtils.getMarginOffset(this.item, true);
    }

    _getVerticalMarginOffset() {
        return FlexUtils.getMarginOffset(this.item, false);
    }

    _getMainAxisMinSizeWithPaddingAndMargin() {
        return this._getMainAxisMinSize() + this._getMainAxisPadding() + this._getMainAxisMargin();
    }

    _getCrossAxisMinSizeWithPaddingAndMargin() {
        return this._getCrossAxisMinSize() + this._getCrossAxisPadding() + this._getCrossAxisMargin();
    }

    _getMainAxisLayoutSizeWithPaddingAndMargin() {
        return this._getMainAxisLayoutSize() + this._getMainAxisPadding() + this._getMainAxisMargin();
    }

    _getCrossAxisLayoutSizeWithPaddingAndMargin() {
        return this._getCrossAxisLayoutSize() + this._getCrossAxisPadding() + this._getCrossAxisMargin();
    }

}


FlexItem.SHRINK_AUTO = -1;