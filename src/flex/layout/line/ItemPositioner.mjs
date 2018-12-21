import SpacingCalculator from "../SpacingCalculator.mjs";

export default class ItemPositioner {

    constructor(lineLayouter) {
        this._line = lineLayouter;
    }

    get _layout() {
        return this._line._layout;
    }

    position() {
        const {spacingBefore, spacingBetween} = this._getSpacing();

        let currentPos = spacingBefore;

        const items = this._line._items;
        for (let i = 0, n = items.length; i < n; i++) {
            const item = items[i];

            item.flexItem._setMainAxisLayoutPos(currentPos);
            currentPos += item.flexItem._getMainAxisLayoutSizeWithPaddingAndMargin();
            currentPos += spacingBetween;
        }
    }

    _getSpacing() {
        const remainingSpace = this._line._availableSpace;
        let mode = this._layout._flexContainer.justifyContent;
        const numberOfItems = this._line._items.length;

        return SpacingCalculator.getSpacing(mode, numberOfItems, remainingSpace);
    }

}