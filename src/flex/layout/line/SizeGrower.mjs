export default class SizeGrower {

    constructor(line) {
        this._line = line;
        this._grownSize = 0;
    }

    grow(amount) {
        this._grownSize = 0;

        const totalGrow = this._getTotalGrowAmount();
        if (totalGrow) {
            const amountPerGrow = amount / totalGrow;

            const items = this._line.items;
            for (let i = this._line.startIndex; i <= this._line.endIndex; i++) {
                const item = items[i];
                if (this._isGrowableItem(item)) {
                    const flexItem = item.flexItem;
                    const actualGrow = flexItem.grow * amountPerGrow;
                    this._grownSize += actualGrow;
                    const finalSize = item.flexItem._getMainAxisLayoutSize() + actualGrow;
                    item.flexItem._resizeMainAxis(finalSize);
                }
            }
        }
    }

    _isGrowableItem(item) {
        return (item.flexItem.grow > 0);
    }

    _getTotalGrowAmount() {
        let total = 0;
        const items = this._line.items;
        for (let i = this._line.startIndex; i <= this._line.endIndex; i++) {
            const item = items[i];
            total += item.flexItem.grow;
        }
        return total;
    }

    getGrownSize() {
        return this._grownSize;
    }

}