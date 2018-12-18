export default class SizeShrinker {

    constructor(line) {
        this._line = line;
        this._items = this._getShrinkableItems();
        this._toBeShrunk = 0;
        this._shrunkSize = 0;
    }

    shrink(amount) {
        this._shrunkSize = 0;

        this._toBeShrunk = amount;
        let items = this._items.concat([]);
        if (items.length) {
            let totalShrink = this._getTotalShrinkAmount();
            let shrinkFullyHandled = false;
            do {
                const amountPerShrink = this._toBeShrunk / totalShrink;
                let remainingShrinkableItemsPointer = 0;
                const prevItemCount = items.length;
                for (let i = 0, n = items.length; i < n; i++) {
                    const item = items[i];
                    const remainingShrink = this._shrinkItemAndGetRemainingShrink(item, amountPerShrink);
                    if (remainingShrink > 0) {
                        // Strip out items that are no longer shrinkable.
                        items[remainingShrinkableItemsPointer++] = item;
                    } else {
                        totalShrink -= items[i].flexItem.shrink;
                    }
                }
                items.splice(remainingShrinkableItemsPointer);
                shrinkFullyHandled = (items.length === prevItemCount);
            } while(!shrinkFullyHandled && items.length);
        }
    }

    _shrinkItemAndGetRemainingShrink(item, amountPerShrink) {
        const remainingShrink = this._getItemShrinkableSize(item);
        if (remainingShrink > 0) {
            const flexItem = item.flexItem;
            const desiredShrink = flexItem.shrink * amountPerShrink;
            const actualShrink = Math.min(remainingShrink, desiredShrink);

            flexItem._resizeMainAxis(flexItem._getMainAxisLayoutSizeWithPaddingAndMargin() - actualShrink);

            this._shrunkSize += actualShrink;
            this._toBeShrunk -= actualShrink;

            return remainingShrink - actualShrink;
        }
    }

    _getItemShrinkableSize(item) {
        return item.flexItem._getMainAxisLayoutSizeWithPaddingAndMargin() - item.flexItem._getMainAxisMinSizeWithPaddingAndMargin();
    }

    _getShrinkableItems() {
        return this._line._items.filter(item => {
            return this._isShrinkableItem(item);
        });
    }

    _isShrinkableItem(item) {
        const size = item.flexItem._getMainAxisLayoutSizeWithPaddingAndMargin();
        const minSize = item.flexItem._getMainAxisMinSizeWithPaddingAndMargin();
        const canShrinkFurther = (size > minSize);
        const isShrinkable = (item.flexItem.shrink > 0);
        return canShrinkFurther && isShrinkable;
    }

    _getTotalShrinkAmount() {
        let total = 0;
        for (let i = 0, n = this._items.length; i < n; i++) {
            const flexItem = this._items[i].flexItem;
            total += flexItem.shrink;
        }
        return total;
    }

    getShrunkSize() {
        return this._shrunkSize;
    }

}