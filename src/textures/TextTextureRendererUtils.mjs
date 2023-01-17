/**
 * Returns CSS font setting string for use in canvas context.
 *
 * @private
 * @param {Stage} stage
 * @param {string | string[]} fontFace
 * @param {string} fontStyle
 * @param {number} fontSize
 * @param {number} precision
 * @returns {string}
 */
export function getFontSetting(stage, fontFace, fontStyle, fontSize, precision) {
    let ff = fontFace;

    if (!Array.isArray(ff)) {
        ff = [ff];
    }

    let ffs = [];
    for (let i = 0, n = ff.length; i < n; i++) {
        let curFf = ff[i];
        // Replace the default font face `null` with the actual default font face set
        // on the stage.
        if (curFf === null) {
            curFf = stage.getOption('defaultFontFace');
        }
        if (curFf === "serif" || curFf === "sans-serif") {
            ffs.push(curFf);
        } else {
            ffs.push(`"${curFf}"`);
        }
    }

    return `${fontStyle} ${fontSize * precision}px ${ffs.join(",")}`
}
