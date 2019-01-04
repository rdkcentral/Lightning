export default class SizeGrower {

    constructor(line) {
        this._line = line;
        this._amountRemaining = 0;
        this._grownSize = 0;
    }

    grow(amount) {
        this._grownSize = 0;

        this._amountRemaining = amount;
        let totalGrowAmount = this._getTotalGrowAmount();
        if (totalGrowAmount) {
            const items = this._line.items;
            do {
                let amountPerGrow = this._amountRemaining / totalGrowAmount;
                for (let i = this._line.startIndex; i <= this._line.endIndex; i++) {
                    const item = items[i];
                    const flexItem = item.flexItem;
                    const growAmount = flexItem.grow;
                    const isGrowableItem = (growAmount > 0);
                    if (isGrowableItem) {
                        let grow = growAmount * amountPerGrow;
                        const maxSize = flexItem._getMainAxisMaxSizeSetting();
                        const size = flexItem._getMainAxisLayoutSize();
                        if (maxSize > 0) {
                            if (size >= maxSize) {
                                // Already fully grown.
                                grow = 0;
                            } else {
                                const maxGrow = maxSize - size;
                                const isFullyGrown = (grow >= maxGrow);
                                if (isFullyGrown) {
                                    grow = maxGrow;

                                    // Destribute remaining amount over the other flex items.
                                    totalGrowAmount -= growAmount;
                                }
                            }
                        }

                        if (grow > 0) {
                            const finalSize = size + grow;
                            flexItem._resizeMainAxis(finalSize);

                            this._grownSize += grow;
                            this._amountRemaining -= grow;

                            if (Math.abs(this._amountRemaining) < 10e-6) {
                                return;
                            }
                        }
                    }
                }
            } while(totalGrowAmount && (Math.abs(this._amountRemaining) > 10e-6));
        }
    }

    _getTotalGrowAmount() {
        let total = 0;
        const items = this._line.items;
        for (let i = this._line.startIndex; i <= this._line.endIndex; i++) {
            const item = items[i];
            const flexItem = item.flexItem;

            if (flexItem.grow) {
                const maxSize = flexItem._getMainAxisMaxSizeSetting();
                const size = flexItem._getMainAxisLayoutSize();

                // Exclude those already fully grown.
                if (maxSize === 0 || size < maxSize) {
                    total += flexItem.grow;
                }
            }
        }
        return total;
    }

    getGrownSize() {
        return this._grownSize;
    }

}