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