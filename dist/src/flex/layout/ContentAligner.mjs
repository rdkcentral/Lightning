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

import SpacingCalculator from "./SpacingCalculator.mjs";

export default class ContentAligner {

    constructor(layout) {
        this._layout = layout;
        this._totalCrossAxisSize = 0;
    }

    get _lines() {
        return this._layout._lines;
    }

    init() {
        this._totalCrossAxisSize = this._getTotalCrossAxisSize();
    }

    align() {
        const crossAxisSize = this._layout.crossAxisSize;
        const remainingSpace = crossAxisSize - this._totalCrossAxisSize;

        const {spacingBefore, spacingBetween} = this._getSpacing(remainingSpace);

        const lines = this._lines;

        const mode = this._layout._flexContainer.alignContent;
        let growSize = 0;
        if (mode === "stretch" && lines.length && (remainingSpace > 0)) {
            growSize = remainingSpace / lines.length;
        }

        let currentPos = spacingBefore;
        for (let i = 0, n = lines.length; i < n; i++) {
            const crossAxisLayoutOffset = currentPos;
            const aligner = lines[i].createItemAligner();

            let finalCrossAxisLayoutSize = lines[i].crossAxisLayoutSize + growSize;

            aligner.setCrossAxisLayoutSize(finalCrossAxisLayoutSize);
            aligner.setCrossAxisLayoutOffset(crossAxisLayoutOffset);

            aligner.align();

            if (aligner.recursiveResizeOccured) {
                lines[i].setItemPositions();
            }

            currentPos += finalCrossAxisLayoutSize;
            currentPos += spacingBetween;
        }
    }

    get totalCrossAxisSize() {
        return this._totalCrossAxisSize;
    }

    _getTotalCrossAxisSize() {
        const lines = this._lines;
        let total = 0;
        for (let i = 0, n = lines.length; i < n; i++) {
            const line = lines[i];
            total += line.crossAxisLayoutSize;
        }
        return total;
    }

    _getSpacing(remainingSpace) {
        const mode = this._layout._flexContainer.alignContent;
        const numberOfItems = this._lines.length;
        return SpacingCalculator.getSpacing(mode, numberOfItems, remainingSpace);
    }

}
