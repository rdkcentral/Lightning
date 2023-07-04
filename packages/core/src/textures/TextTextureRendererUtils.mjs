/**
 * Returns CSS font setting string for use in canvas context.
 *
 * @private
 * @param {string | string[]} fontFace
 * @param {string} fontStyle
 * @param {number} fontSize
 * @param {number} precision
 * @param {string} defaultFontFace
 * @returns {string}
 */
export function getFontSetting(fontFace, fontStyle, fontSize, precision, defaultFontFace) {
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
            curFf = defaultFontFace;
        }
        if (curFf === "serif" || curFf === "sans-serif") {
            ffs.push(curFf);
        } else {
            ffs.push(`"${curFf}"`);
        }
    }

    return `${fontStyle} ${fontSize * precision}px ${ffs.join(",")}`
}

/**
 * Splits a string into an array of spaces and words.
 *
 * @remarks
 * This method always returns an array with an even length.
 *
 * - The **even indices** are the group of spaces that occur before the word at the
 *   next (odd) index.
 * - The **odd indices** are the words.
 *
 * If the string does not begin with a space, the first element of the array will
 * be an empty string ("").
 *
 * @param {string} text
 * @returns
 */
export function splitWords(text) {
    const regexp = /([ \u200B]+)?([^ \u200B]+)/g;
    const arr = [];
    let match;
    while ((match = regexp.exec(text)) !== null) {
        arr.push(match[1] || '');
        arr.push(match[2]);
    }
    return arr;
}

/**
 * Returns true if the given character is a zero-width space.
 *
 * @param {string} space
 * @returns {boolean}
 */
export function isZeroWidthSpace(space) {
    return space === '' || space === '\u200B';
}

/**
 * Returns true if the given character is a zero-width space or a regular space.
 *
 * @param {string} space
 * @returns {boolean}
 */
export function isSpace(space) {
    return isZeroWidthSpace(space) || space === ' ';
}