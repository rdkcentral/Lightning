import SizeShrinker from "./SizeShrinker.mjs";
import SizeGrower from "./SizeGrower.mjs";
import ItemPositioner from "./ItemPositioner.mjs";
import ItemAligner from "./ItemAligner.mjs";

export default class LineLayout {

    constructor(layout, startIndex, endIndex, availableSpace) {
        this._layout = layout;
        this.items = layout.items;
        this.startIndex = startIndex;
        this.endIndex = endIndex;
        this._availableSpace = availableSpace;
    }

    performLayout() {
        this._setItemSizes();
        this.setItemPositions();
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

    setItemPositions() {
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
        for (let i = this.startIndex; i <= this.endIndex; i++) {
            const item = this.items[i];
            mainAxisMinSize += item.flexItem._getMainAxisMinSizeWithPaddingAndMargin();
        }
        return mainAxisMinSize;
    }
    
    get numberOfItems() {
        return this.endIndex - this.startIndex + 1;
    }

    get crossAxisLayoutSize() {
        const noSpecifiedCrossAxisSize = (this._layout.isCrossAxisFitToContents() && !this._layout.resizingCrossAxis);
        const shouldFitToContents = (this._layout.isWrapping() || noSpecifiedCrossAxisSize);
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
        for (let i = this.startIndex; i <= this.endIndex; i++) {
            const item = this.items[i];
            crossAxisMaxSize = Math.max(crossAxisMaxSize, item.flexItem._getCrossAxisLayoutSizeWithPaddingAndMargin());
        }
        return crossAxisMaxSize;
    }


}
