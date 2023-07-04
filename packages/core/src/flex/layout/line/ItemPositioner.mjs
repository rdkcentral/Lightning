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

import SpacingCalculator from "../SpacingCalculator.mjs";

export default class ItemPositioner {

    constructor(lineLayout) {
        this._line = lineLayout;
    }

    get _layout() {
        return this._line._layout;
    }

    position() {
        const {spacingBefore, spacingBetween} = this._getSpacing();

        let currentPos = spacingBefore;

        const items = this._line.items;
        for (let i = this._line.startIndex; i <= this._line.endIndex; i++) {
            const item = items[i];

            item.flexItem._setMainAxisLayoutPos(currentPos);
            currentPos += item.flexItem._getMainAxisLayoutSizeWithPaddingAndMargin();
            currentPos += spacingBetween;
        }
    }

    _getSpacing() {
        const remainingSpace = this._line._availableSpace;
        let mode = this._layout._flexContainer.justifyContent;
        const numberOfItems = this._line.numberOfItems;

        return SpacingCalculator.getSpacing(mode, numberOfItems, remainingSpace);
    }

}
