import FlexUtils from "../FlexUtils.mjs";

export default class ItemCoordinatesUpdater {

    constructor(layout) {
        this._layout = layout;
        this._isReverse = this._flexContainer._reverse;
        this._horizontalPaddingOffset = this._layout._getHorizontalPaddingOffset();
        this._verticalPaddingOffset = this._layout._getVerticalPaddingOffset();
    }

    get _flexContainer() {
        return this._layout._flexContainer;
    }

    finalize() {
        const parentFlex = this._layout.getParentFlexContainer();
        if (parentFlex) {
            // We must update it from the parent to set padding offsets and reverse position.
            const updater = new ItemCoordinatesUpdater(parentFlex._layout);
            updater._finalizeItemAndChildren(this._flexContainer.item);
        } else {
            this._finalizeRoot();
            this._finalizeItems();
        }
    }

    _finalizeRoot() {
        const item = this._flexContainer.item;
        let x = FlexUtils.getAxisLayoutPos(item, true);
        let y = FlexUtils.getAxisLayoutPos(item, false);
        let w = FlexUtils.getAxisLayoutSize(item, true);
        let h = FlexUtils.getAxisLayoutSize(item, false);

        w += this._layout._getHorizontalPadding();
        h += this._layout._getVerticalPadding();

        item.clearRecalcFlag();

        item.setLayout(x, y, w, h);
    }

    _finalizeItems() {
        const items = this._layout.items;
        for (let i = 0, n = items.length; i < n; i++) {
            const item = items[i];
            const validCache = this._validateItemCache(item);

            // Notice that we must also finalize a cached items, as it's coordinates may have changed.
            this._finalizeItem(item);

            if (!validCache) {
                this._finalizeItemChildren(item);
            }
        }
    }

    _validateItemCache(item) {
        if (item.recalc === 0) {
            if (item.isFlexEnabled()) {
                const layout = item._flex._layout;

                const dimensionsMatchPreviousResult = (item.w === item.target.w && item.h === item.target.h);
                if (dimensionsMatchPreviousResult) {
                    // Cache is valid.
                    return true;
                } else {
                    const crossAxisSize = layout.crossAxisSize;
                    layout.performResizeMainAxis(layout.mainAxisSize);
                    layout.performResizeCrossAxis(crossAxisSize);
                }
            }
        }
        return false;
    }

    _finalizeItemAndChildren(item) {
        this._finalizeItem(item);
        this._finalizeItemChildren(item);
    }

    _finalizeItem(item) {
        if (this._isReverse) {
            this._reverseMainAxisLayoutPos(item);
        }

        let x = FlexUtils.getAxisLayoutPos(item, true);
        let y = FlexUtils.getAxisLayoutPos(item, false);
        let w = FlexUtils.getAxisLayoutSize(item, true);
        let h = FlexUtils.getAxisLayoutSize(item, false);

        x += this._horizontalPaddingOffset;
        y += this._verticalPaddingOffset;

        const flex = item.flex;
        if (flex) {
            w += item._flex._layout._getHorizontalPadding();
            h += item._flex._layout._getVerticalPadding();
        }

        const flexItem = item.flexItem;
        if (flexItem) {
            x += flexItem._getHorizontalMarginOffset();
            y += flexItem._getVerticalMarginOffset();
        }

        item.clearRecalcFlag();
        item.setLayout(x, y, w, h);
    }

    _finalizeItemChildren(item) {
        const flex = item._flex;
        if (flex) {
            const updater = new ItemCoordinatesUpdater(flex._layout);
            updater._finalizeItems();
        }
    }

    _reverseMainAxisLayoutPos(item) {
        const endPos = (item.flexItem._getMainAxisLayoutPos() + item.flexItem._getMainAxisLayoutSizeWithPaddingAndMargin());
        const reversedPos = this._layout.mainAxisSize - endPos;
        item.flexItem._setMainAxisLayoutPos(reversedPos);
    }

}