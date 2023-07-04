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

export default class SpacingCalculator {

    static getSpacing(mode, numberOfItems, remainingSpace) {
        const itemGaps = (numberOfItems - 1);
        let spacePerGap;

        let spacingBefore, spacingBetween;

        switch(mode) {
            case "flex-start":
                spacingBefore = 0;
                spacingBetween = 0;
                break;
            case "flex-end":
                spacingBefore = remainingSpace;
                spacingBetween = 0;
                break;
            case "center":
                spacingBefore = remainingSpace / 2;
                spacingBetween = 0;
                break;
            case "space-between":
                spacingBefore = 0;
                spacingBetween = Math.max(0, remainingSpace) / itemGaps;
                break;
            case "space-around":
                if (remainingSpace < 0) {
                    return this.getSpacing("center", numberOfItems, remainingSpace);
                } else {
                    spacePerGap = remainingSpace / (itemGaps + 1);
                    spacingBefore = 0.5 * spacePerGap;
                    spacingBetween = spacePerGap;
                }
                break;
            case "space-evenly":
                if (remainingSpace < 0) {
                    return this.getSpacing("center", numberOfItems, remainingSpace);
                } else {
                    spacePerGap = remainingSpace / (itemGaps + 2);
                    spacingBefore = spacePerGap;
                    spacingBetween = spacePerGap;
                }
                break;
            case "stretch":
                spacingBefore = 0;
                spacingBetween = 0;
                break;
            default:
                throw new Error("Unknown mode: " + mode);
        }

        return {spacingBefore, spacingBetween}
    }

}
