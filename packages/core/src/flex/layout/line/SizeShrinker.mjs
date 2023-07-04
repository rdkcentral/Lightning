/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 Metrological
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export default class SizeShrinker {

    constructor(line) {
        this._line = line;
        this._amountRemaining = 0;
        this._shrunkSize = 0;
    }

    shrink(amount) {
        this._shrunkSize = 0;

        this._amountRemaining = amount;
        let totalShrinkAmount = this._getTotalShrinkAmount();
        if (totalShrinkAmount) {
            const items = this._line.items;
            do {
                let amountPerShrink = this._amountRemaining / totalShrinkAmount;
                for (let i = this._line.startIndex; i <= this._line.endIndex; i++) {
                    const item = items[i];
                    const flexItem = item.flexItem;
                    const shrinkAmount = flexItem.shrink;
                    const isShrinkableItem = (shrinkAmount > 0);
                    if (isShrinkableItem) {
                        let shrink = shrinkAmount * amountPerShrink;
                        const minSize = flexItem._getMainAxisMinSize();
                        const size = flexItem._getMainAxisLayoutSize();
                        if (size > minSize) {
                            const maxShrink = size - minSize;
                            const isFullyShrunk = (shrink >= maxShrink);
                            if (isFullyShrunk) {
                                shrink = maxShrink;

                                // Destribute remaining amount over the other flex items.
                                totalShrinkAmount -= shrinkAmount;
                            }

                            const finalSize = size - shrink;
                            flexItem._resizeMainAxis(finalSize);

                            this._shrunkSize += shrink;
                            this._amountRemaining -= shrink;

                            if (Math.abs(this._amountRemaining) < 10e-6) {
                                return;
                            }
                        }
                    }
                }
            } while(totalShrinkAmount && (Math.abs(this._amountRemaining) > 10e-6));
        }
    }

    _getTotalShrinkAmount() {
        let total = 0;
        const items = this._line.items;
        for (let i = this._line.startIndex; i <= this._line.endIndex; i++) {
            const item = items[i];
            const flexItem = item.flexItem;

            if (flexItem.shrink) {
                const minSize = flexItem._getMainAxisMinSize();
                const size = flexItem._getMainAxisLayoutSize();

                // Exclude those already fully shrunk.
                if (size > minSize) {
                    total += flexItem.shrink;
                }
            }
        }
        return total;
    }

    getShrunkSize() {
        return this._shrunkSize;
    }

}
