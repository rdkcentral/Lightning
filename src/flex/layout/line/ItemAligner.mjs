export default class ItemAligner {

    constructor(line) {
        this._line = line;
        this._crossAxisLayoutSize = 0;
        this._crossAxisLayoutOffset = 0;
        this._alignItemsSetting = null;
        this._recursiveResizeOccured = false;
        this._isCrossAxisFitToContents = false;
    }

    get _layout() {
        return this._line._layout;
    }

    get _flexContainer() {
        return this._layout._flexContainer;
    }

    setCrossAxisLayoutSize(size) {
        this._crossAxisLayoutSize = size;
    }

    setCrossAxisLayoutOffset(offset) {
        this._crossAxisLayoutOffset = offset;
    }

    align() {
        this._alignItemsSetting = this._flexContainer.alignItems;

        this._isCrossAxisFitToContents = this._layout.isAxisFitToContents(!this._flexContainer._horizontal);

        this._recursiveResizeOccured = false;
        const items = this._line.items;
        for (let i = this._line.startIndex; i <= this._line.endIndex; i++) {
            const item = items[i];
            this._alignItem(item);
        }
    }

    get recursiveResizeOccured() {
        return this._recursiveResizeOccured;
    }

    _alignItem(item) {
        const flexItem = item.flexItem;
        let align = flexItem.alignSelf || this._alignItemsSetting;

        if (align === "stretch" && this._preventStretch(flexItem)) {
            align = "flex-start";
        }

        if (align !== "stretch" && !this._isCrossAxisFitToContents) {
            if (flexItem._hasRelCrossAxisSize()) {
                // As cross axis size might have changed, we need to recalc the relative flex item's size.
                flexItem._resetCrossAxisLayoutSize();
            }
        }

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
        let size = this._crossAxisLayoutSize - flexItem._getCrossAxisMargin() - flexItem._getCrossAxisPadding();

        const crossAxisMinSizeSetting = flexItem._getCrossAxisMinSizeSetting();
        if (crossAxisMinSizeSetting > 0) {
            size = Math.max(size, crossAxisMinSizeSetting);
        }

        const crossAxisMaxSizeSetting = flexItem._getCrossAxisMaxSizeSetting();
        const crossAxisMaxSizeSettingEnabled = (crossAxisMaxSizeSetting > 0);
        if (crossAxisMaxSizeSettingEnabled) {
            size = Math.min(size, crossAxisMaxSizeSetting);
        }

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

    _preventStretch(flexItem) {
        const hasFixedCrossAxisSize = flexItem._hasFixedCrossAxisSize();
        const forceStretch = (flexItem.alignSelf === "stretch");
        return hasFixedCrossAxisSize && !forceStretch;
    }

}