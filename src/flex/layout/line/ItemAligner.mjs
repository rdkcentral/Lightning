export default class ItemAligner {

    constructor(line) {
        this._line = line;
        this._crossAxisLayoutSize = 0;
        this._crossAxisLayoutOffset = 0;
    }

    get _flexContainer() {
        return this._line._layout._flexContainer;
    }

    setCrossAxisLayoutSize(size) {
        this._crossAxisLayoutSize = size;
    }

    setCrossAxisLayoutOffset(offset) {
        this._crossAxisLayoutOffset = offset;
    }

    align() {
        const items = this._line._items;
        for (let i = 0, n = items.length; i < n; i++) {
            const item = items[i];
            this._alignItem(item);
        }
    }

    _preventStretch(item) {
        const isFixedCrossAxisSize = (item.flexItem._getCrossAxisBasis() > 0);
        const forceStretch = (item.flexItem.alignSelf === "stretch");
        return isFixedCrossAxisSize && !forceStretch;
    }

    _alignItem(item) {
        let align = item.flexItem.alignSelf || this._flexContainer.alignItems;

        if (align === "stretch" && this._preventStretch(item)) {
            align = "flex-start";
        }

        const flexItem = item.flexItem;

        const itemCrossAxisSize = flexItem._getCrossAxisLayoutSizeWithPaddingAndMargin();
        switch(align) {
            case "flex-start":
                flexItem._setCrossAxisLayoutPos(this._crossAxisLayoutOffset);
                break;
            case "flex-end":
                flexItem._setCrossAxisLayoutPos(this._crossAxisLayoutOffset + (this._crossAxisLayoutSize - itemCrossAxisSize));
                break;
            case "center":
                const center = (this._crossAxisLayoutSize - itemCrossAxisSize) / 2;
                flexItem._setCrossAxisLayoutPos(this._crossAxisLayoutOffset + center);
                break;
            case "stretch":
                flexItem._setCrossAxisLayoutPos(this._crossAxisLayoutOffset);

                const sizeWithoutMargin = this._crossAxisLayoutSize - flexItem._getCrossAxisMargin();
                flexItem._resizeCrossAxis(sizeWithoutMargin);
                break;
        }
    }

}