import SizeShrinker from "./SizeShrinker.mjs";
import SizeGrower from "./SizeGrower.mjs";
import ItemPositioner from "./ItemPositioner.mjs";
import ItemAligner from "./ItemAligner.mjs";

export default class LineLayout {

    constructor(layout, items, availableSpace) {
        this._layout = layout;
        this._items = items;
        this._availableSpace = availableSpace;
    }

    performLayout() {
        this._setItemSizes();
        this._setItemPositions();

        this._calcLayoutInfo();
    }

    _setItemSizes() {
        if (this._availableSpace > 0) {
            this._growItemSizes(this._availableSpace);
        } else if (this._availableSpace < 0) {
            this._shrinkItemSizes(-this._availableSpace);
        }
    }

    _growItemSizes(amount) {
        const grower = new SizeGrower(this);
        grower.grow(amount);
        this._availableSpace -= grower.getGrownSize();
    }

    _shrinkItemSizes(amount) {
        const shrinker = new SizeShrinker(this);
        shrinker.shrink(amount);
        this._availableSpace += shrinker.getShrunkSize();
    }

    _setItemPositions() {
        const positioner = new ItemPositioner(this);
        positioner.position();
    }

    createItemAligner() {
        return new ItemAligner(this);
    }

    _calcLayoutInfo() {
        this._calcCrossAxisMaxLayoutSize();
    }

    getMainAxisMinSize() {
        let mainAxisMinSize = 0;
        for (let i = 0, n = this._items.length; i < n; i++) {
            const item = this._items[i];
            mainAxisMinSize += item.flexItem._getMainAxisMinSizeWithPaddingAndMargin();
        }
        return mainAxisMinSize;
    }

    isOnlyLine() {
        return (this._layout.numberOfItems === this._items.length);
    }

    get crossAxisLayoutSize() {
        const noSpecifiedCrossAxisSize = (this._layout.isCrossAxisFitToContents() && !this._layout.resizingCrossAxis);
        const shouldFitToContents = (!this.isOnlyLine() || noSpecifiedCrossAxisSize);
        if (shouldFitToContents) {
            return this._crossAxisMaxLayoutSize;
        } else {
            return this._layout.crossAxisSize;
        }
    }

    _calcCrossAxisMaxLayoutSize() {
        this._crossAxisMaxLayoutSize = this._getCrossAxisMaxLayoutSize();
    }

    _getCrossAxisMaxLayoutSize() {
        let crossAxisMaxSize = 0;
        for (let i = 0, n = this._items.length; i < n; i++) {
            const item = this._items[i];
            crossAxisMaxSize = Math.max(crossAxisMaxSize, item.flexItem._getCrossAxisLayoutSizeWithPaddingAndMargin());
        }
        return crossAxisMaxSize;
    }


}
