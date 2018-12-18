export default class SizeGrower {

    constructor(line) {
        this._line = line;
        this. _items = this._getGrowableItems();
        this._grownSize = 0;
    }

    grow(amount) {
        this._grownSize = 0;

        const totalGrow = this._getTotalGrowAmount();
        if (totalGrow) {
            const amountPerGrow = amount / totalGrow;

            for (let i = 0, n = this._items.length; i < n; i++) {
                const item = this._items[i];
                const flexItem = item.flexItem;
                const actualGrow = flexItem.grow * amountPerGrow;
                this._grownSize += actualGrow;
                const finalSize = item.flexItem._getMainAxisLayoutSizeWithPaddingAndMargin() + actualGrow;
                item.flexItem._resizeMainAxis(finalSize);
            }
        }
    }

    _getGrowableItems() {
        return this._line._items.filter(item => {
            return this._isGrowableItem(item);
        });
    }

    _isGrowableItem(item) {
        return (item.flexItem.grow > 0);
    }

    _getTotalGrowAmount() {
        let total = 0;
        for (let i = 0, n = this._line._items.length; i < n; i++) {
            const flexItem = this._line._items[i].flexItem;
            total += flexItem.grow;
        }
        return total;
    }

    getGrownSize() {
        return this._grownSize;
    }

}