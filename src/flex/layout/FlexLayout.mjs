import ContentAligner from "./ContentAligner.mjs";
import FlexUtils from "../FlexUtils.mjs";
import LineLayouter from "./LineLayouter.mjs";
import ItemCoordinatesUpdater from "./ItemCoordinatesUpdater.mjs";

/**
 * Layouts a flex container (and descendants).
 */
export default class FlexLayout {

    constructor(flexContainer) {
        this._flexContainer = flexContainer;

        this._lines = null;

        this._mainAxisMinSize = 0;
        this._crossAxisMinSize = 0;

        this._resizingMainAxis = false;
        this._resizingCrossAxis = false;
    }

    updateLayoutTree() {
        this.item.clearRecalcFlag();
        this._setInitialAxisSizes();
        this._layoutAxes();
    }

    updateItemCoords() {
        const updater = new ItemCoordinatesUpdater(this);
        updater.finalize();
    }

    _setInitialAxisSizes() {
        this.mainAxisSize = this._getMainAxisBasis();
        this.crossAxisSize = this._getCrossAxisBasis();
        this._resizingMainAxis = false;
        this._resizingCrossAxis = false;
    }

    _layoutAxes() {
        this._layoutMainAxis();
        this._layoutCrossAxis();
    }

    /**
     * @pre mainAxisSize should exclude padding.
     */
    _layoutMainAxis() {
        this._layoutLines();
        this._fitMainAxisSizeToContents();
    }

    _layoutLines() {
        const lineLayouter = new LineLayouter(this);
        lineLayouter.layoutLines();

        this._lines = lineLayouter.lines;
        this._mainAxisMinSize = lineLayouter.mainAxisMinSize;
        this._crossAxisMinSize = lineLayouter.crossAxisMinSize;
        this._mainAxisContentSize = lineLayouter.mainAxisContentSize;
    }

    _fitMainAxisSizeToContents() {
        if (!this._resizingMainAxis) {
            if (this.isMainAxisFitToContents()) {
                this.mainAxisSize = this._mainAxisContentSize;
            }
        }
    }

    /**
     * @pre crossAxisSize should exclude padding.
     */
    _layoutCrossAxis() {
        const aligner = new ContentAligner(this);
        aligner.init();
        this._totalCrossAxisSize = aligner.totalCrossAxisSize;
        this._fitCrossAxisSizeToContents();
        aligner.align();
    }

    _fitCrossAxisSizeToContents() {
        if (!this._resizingCrossAxis) {
            if (this.isCrossAxisFitToContents()) {
                this.crossAxisSize = this._totalCrossAxisSize;
            }
        }
    }

    isWrapping() {
        return this._flexContainer.wrap;
    }

    isMainAxisFitToContents() {
        return !this.isWrapping() && !this._hasFixedMainAxisBasis();
    }

    isCrossAxisFitToContents() {
        return !this._hasFixedCrossAxisBasis();
    }

    _hasFixedMainAxisBasis() {
        return (this._getMainAxisBasis() !== 0);
    }

    _hasFixedCrossAxisBasis() {
        return (this._getCrossAxisBasis() !== 0);
    }

    getAxisMinSize(horizontal) {
        if (this._horizontal === horizontal) {
            return this._mainAxisMinSize;
        } else {
            return this._getCrossAxisMinSize();
        }
    }

    _getCrossAxisMinSize() {
        return this._crossAxisMinSize;
    }

    resizeMainAxis(sizeWithPadding) {
        this._resizingMainAxis = true;

        const size = sizeWithPadding - this._getMainAxisPadding();

        if (this.mainAxisSize !== size) {
            this.mainAxisSize = size;

            this._layoutAxes();
        }
        this._resizingMainAxis = false;
    }

    resizeCrossAxis(sizeWithPadding) {
        this._resizingCrossAxis = true;

        const size = sizeWithPadding - this._getCrossAxisPadding();

        if (this.crossAxisSize !== size) {
            this.crossAxisSize = size;

            this._layoutCrossAxis();
        }
        this._resizingCrossAxis = false;
    }

    getParentFlexContainer() {
        return this.item.isFlexItemEnabled() ? this.item.flexItem.ctr : null;
    }

    _getMainAxisPadding() {
        return FlexUtils.getTotalPadding(this.item, this._horizontal);
    }

    _getCrossAxisPadding() {
        return FlexUtils.getTotalPadding(this.item, !this._horizontal);
    }

    _getHorizontalPadding() {
        return FlexUtils.getTotalPadding(this.item, true);
    }

    _getVerticalPadding() {
        return FlexUtils.getTotalPadding(this.item, false);
    }

    _getHorizontalPaddingOffset() {
        return FlexUtils.getPaddingOffset(this.item, true);
    }

    _getVerticalPaddingOffset() {
        return FlexUtils.getPaddingOffset(this.item, false);
    }

    _getMainAxisBasis() {
        return FlexUtils.getAxisSize(this.item, this._horizontal);
    }

    _getCrossAxisBasis() {
        return FlexUtils.getAxisSize(this.item, !this._horizontal);
    }

    get _horizontal() {
        return this._flexContainer._horizontal;
    }

    get _reverse() {
        return this._flexContainer._reverse;
    }

    get item() {
        return this._flexContainer.item;
    }

    get items() {
        return this.item.items;
    }

    get resizingMainAxis() {
        return this._resizingMainAxis;
    }

    get resizingCrossAxis() {
        return this._resizingCrossAxis;
    }

    get numberOfItems() {
        return this.items.length;
    }

    get mainAxisSize() {
        return FlexUtils.getAxisLayoutSize(this.item, this._horizontal);
    }

    get crossAxisSize() {
        return FlexUtils.getAxisLayoutSize(this.item, !this._horizontal);
    }

    set mainAxisSize(v) {
        FlexUtils.setAxisLayoutSize(this.item, this._horizontal, v);
    }

    set crossAxisSize(v) {
        FlexUtils.setAxisLayoutSize(this.item, !this._horizontal, v);
    }

}
