import LineLayout from "./line/LineLayout.mjs";

/**
 * Distributes items over layout lines.
 */
export default class LineLayouter {

    constructor(layout) {
        this._layout = layout;
    }

    get _flexContainer() {
        return this._layout._flexContainer;
    }

    get lines() {
        return this._lines;
    }

    get mainAxisMinSize() {
        if (this._mainAxisMinSize === -1) {
            this._mainAxisMinSize = this._getMainAxisMinSize();
        }
        return this._mainAxisMinSize;
    }

    get crossAxisMinSize() {
        if (this._crossAxisMinSize === -1) {
            this._crossAxisMinSize = this._getCrossAxisMinSize();
        }
        return this._crossAxisMinSize;
    }

    get mainAxisContentSize() {
        return this._mainAxisContentSize;
    }

    layoutLines() {
        this._setup();
        const items = this._layout.items;
        const wrap = this._layout.isWrapping();

        let lineItems = [];
        for (let i = 0, n = items.length; i < n; i++) {
            const item = items[i];

            this._layoutFlexItem(item);

            // Get predicted main axis size.
            const itemMainAxisSize = item.flexItem._getMainAxisLayoutSizeWithPaddingAndMargin();

            if (wrap && lineItems.length) {
                const isOverflowing = (this._curMainAxisPos + itemMainAxisSize > this._mainAxisSize);
                if (isOverflowing) {
                    this._layoutLine(lineItems);
                    this._curMainAxisPos = 0;
                    lineItems = [];
                }
            }
            lineItems.push(item);

            this._addToMainAxisPos(itemMainAxisSize);
        }

        if (lineItems.length) {
            this._layoutLine(lineItems);
        }
    }

    _layoutFlexItem(item) {
        if (item.isFlexEnabled()) {
            if (item.isFlexNotSizedByToContents()) {
                item.flexLayout.deferLayout();
            } else {
                item.flexLayout.updateTreeLayout();
            }
        } else {
            item.resetNonFlexLayout();
        }
    }

    _setup() {
        this._mainAxisSize = this._layout.mainAxisSize;
        this._curMainAxisPos = 0;
        this._maxMainAxisPos = 0;
        this._lines = [];

        this._mainAxisMinSize = -1;
        this._crossAxisMinSize = -1;
        this._mainAxisContentSize = 0;
    }

    _addToMainAxisPos(itemMainAxisSize) {
        this._curMainAxisPos += itemMainAxisSize;
        if (this._curMainAxisPos > this._maxMainAxisPos) {
            this._maxMainAxisPos = this._curMainAxisPos;
        }
    }

    _layoutLine(lineItems) {
        const availableSpace = this._getAvailableMainAxisLayoutSpace();
        const line = new LineLayout(this._layout, lineItems, availableSpace);
        line.performLayout();
        this._lines.push(line);

        if (this._mainAxisContentSize === 0 || (this._curMainAxisPos > this._mainAxisContentSize)) {
            this._mainAxisContentSize = this._curMainAxisPos;
        }

        if (line.isOnlyLine()) {
            this._mainAxisMinSize = line.getMainAxisMinSize();
        } else {
            // Wrapping lines: specified width is used as min width (in accordance to W3C flexbox).
            this._mainAxisMinSize = this._layout.mainAxisSize;
        }
    }

    _getAvailableMainAxisLayoutSpace() {
        if (!this._layout.resizingMainAxis && this._layout.isMainAxisFitToContents()) {
            return 0;
        } else {
            return this._mainAxisSize - this._curMainAxisPos;
        }
    }

    _getCrossAxisMinSize() {
        let crossAxisMinSize = 0;
        const items = this._layout.items;
        for (let i = 0, n = items.length; i < n; i++) {
            const item = items[i];
            const itemCrossAxisMinSize = item.flexItem._getCrossAxisMinSizeWithPaddingAndMargin();
            crossAxisMinSize = Math.max(crossAxisMinSize, itemCrossAxisMinSize);
        }
        return crossAxisMinSize;
    }

    _getMainAxisMinSize() {
        if (this._lines.length === 1) {
            return this._lines[0].getMainAxisMinSize();
        } else {
            // Wrapping lines: specified width is used as min width (in accordance to W3C flexbox).
            return this._layout.mainAxisSize;
        }
    }

}