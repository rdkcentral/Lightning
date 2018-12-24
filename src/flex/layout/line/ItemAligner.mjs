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
        this._recursiveResizeOccured = false;
        const items = this._line._items;
        for (let i = 0, n = items.length; i < n; i++) {
            const item = items[i];
            this._alignItem(item);
        }
    }

    get recursiveResizeOccured() {
        return this._recursiveResizeOccured;
    }

    _preventStretch(item) {
        const hasFixedCrossAxisSize = item.flexItem._hasFixedCrossAxisSize();
        const forceStretch = (item.flexItem.alignSelf === "stretch");
        return hasFixedCrossAxisSize && !forceStretch;
    }

    _alignItem(item) {
        let align = item.flexItem.alignSelf || this._flexContainer.alignItems;

        if (align === "stretch" && this._preventStretch(item)) {
            align = "flex-start";
        }

        const flexItem = item.flexItem;
        switch(align) {
            case "flex-start":
                this._alignItemFlexStart(flexItem);
                break;
            case "flex-end":
                this._alignItemFlexEnd(flexItem);
                break;
            case "center":
                this._alignItemFlexCenter(flexItem);
                break;
            case "stretch":
                this._alignItemStretch(flexItem);
                break;
        }
    }

    _alignItemFlexStart(flexItem) {
        flexItem._setCrossAxisLayoutPos(this._crossAxisLayoutOffset);
    }

    _alignItemFlexEnd(flexItem) {
        const itemCrossAxisSize = flexItem._getCrossAxisLayoutSizeWithPaddingAndMargin();
        flexItem._setCrossAxisLayoutPos(this._crossAxisLayoutOffset + (this._crossAxisLayoutSize - itemCrossAxisSize));
    }

    _alignItemFlexCenter(flexItem) {
        const itemCrossAxisSize = flexItem._getCrossAxisLayoutSizeWithPaddingAndMargin();
        const center = (this._crossAxisLayoutSize - itemCrossAxisSize) / 2;
        flexItem._setCrossAxisLayoutPos(this._crossAxisLayoutOffset + center);
    }

    _alignItemStretch(flexItem) {
        flexItem._setCrossAxisLayoutPos(this._crossAxisLayoutOffset);

        const mainAxisLayoutSizeBeforeResize = flexItem._getMainAxisLayoutSize();
        const size = this._crossAxisLayoutSize - flexItem._getCrossAxisMargin() - flexItem._getCrossAxisPadding();
        flexItem._resizeCrossAxis(size);
        const mainAxisLayoutSizeAfterResize = flexItem._getMainAxisLayoutSize();

        const recursiveResize = (mainAxisLayoutSizeAfterResize !== mainAxisLayoutSizeBeforeResize);
        if (recursiveResize) {
            // Recursive resize can happen when this flex item has the opposite direction than the container
            // and is wrapping and auto-sizing. Due to item/content stretching the main axis size of the flex
            // item may decrease. If it does so, we must re-justify-content the complete line.
            // Notice that we don't account for changes to the (if autosized) main axis size caused by recursive
            // resize, which may cause the container's main axis to not shrink to the contents properly.
            // This is by design, because if we had re-run the main axis layout, we could run into issues such
            // as slow layout or endless loops.
            this._recursiveResizeOccured = true;
        }
    }
}