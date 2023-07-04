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

import SizeShrinker from "./SizeShrinker.mjs";
import SizeGrower from "./SizeGrower.mjs";
import ItemPositioner from "./ItemPositioner.mjs";
import ItemAligner from "./ItemAligner.mjs";

export default class LineLayout {

    constructor(layout, startIndex, endIndex, availableSpace) {
        this._layout = layout;
        this.items = layout.items;
        this.startIndex = startIndex;
        this.endIndex = endIndex;
        this._availableSpace = availableSpace;
    }

    performLayout() {
        this._setItemSizes();
        this.setItemPositions();
        this._calcLayoutInfo();
    }

    _setItemSizes() {
        if (this._availableSpace > 0) {
            this._growItemSizes(this._availableSpace);
        } else if (this._availableSpace < 0) {
            this._shrinkItemSizes(-this._availableSpace);
        }
    }

    _growItemSizes(amount) {
        const grower = new SizeGrower(this);
        grower.grow(amount);
        this._availableSpace -= grower.getGrownSize();
    }

    _shrinkItemSizes(amount) {
        const shrinker = new SizeShrinker(this);
        shrinker.shrink(amount);
        this._availableSpace += shrinker.getShrunkSize();
    }

    setItemPositions() {
        const positioner = new ItemPositioner(this);
        positioner.position();
    }

    createItemAligner() {
        return new ItemAligner(this);
    }

    _calcLayoutInfo() {
        this._calcCrossAxisMaxLayoutSize();
    }

    getMainAxisMinSize() {
        let mainAxisMinSize = 0;
        for (let i = this.startIndex; i <= this.endIndex; i++) {
            const item = this.items[i];
            mainAxisMinSize += item.flexItem._getMainAxisMinSizeWithPaddingAndMargin();
        }
        return mainAxisMinSize;
    }
    
    get numberOfItems() {
        return this.endIndex - this.startIndex + 1;
    }

    get crossAxisLayoutSize() {
        const noSpecifiedCrossAxisSize = (this._layout.isCrossAxisFitToContents() && !this._layout.resizingCrossAxis);
        const shouldFitToContents = (this._layout.isWrapping() || noSpecifiedCrossAxisSize);
        if (shouldFitToContents) {
            return this._crossAxisMaxLayoutSize;
        } else {
            return this._layout.crossAxisSize;
        }
    }

    _calcCrossAxisMaxLayoutSize() {
        this._crossAxisMaxLayoutSize = this._getCrossAxisMaxLayoutSize();
    }

    _getCrossAxisMaxLayoutSize() {
        let crossAxisMaxSize = 0;
        for (let i = this.startIndex; i <= this.endIndex; i++) {
            const item = this.items[i];
            crossAxisMaxSize = Math.max(crossAxisMaxSize, item.flexItem._getCrossAxisLayoutSizeWithPaddingAndMargin());
        }
        return crossAxisMaxSize;
    }


}
