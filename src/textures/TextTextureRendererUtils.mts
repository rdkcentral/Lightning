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

/**
 * Returns CSS font setting string for use in canvas context.
 *
 * @param fontFace
 * @param fontStyle
 * @param fontSize
 * @param precision
 * @param defaultFontFace
 * @returns
 */
export function getFontSetting(
    fontFace: string | string[],
    fontStyle: string,
    fontSize: number,
    precision: number,
    defaultFontFace: string
): string {
    let ff = fontFace;

    if (!Array.isArray(ff)) {
        ff = [ff];
    }

    let ffs = [];
    for (let i = 0, n = ff.length; i < n; i++) {
        let curFf = ff[i];
        // Replace the default font face `null` with the actual default font face set
        // on the stage.
        if (curFf == null) {
            curFf = defaultFontFace;
        }
        if (curFf.indexOf(' ') < 0) {
            ffs.push(curFf);
        } else {
            ffs.push(`"${curFf}"`);
        }
    }

    return `${fontStyle} ${fontSize * precision}px ${ffs.join(",")}`
}

/**
 * Returns true if the given character is a zero-width space.
 *
 * @param space
 */
export function isZeroWidthSpace(space: string): boolean {
    return space === '' || space === '\u200B';
}

/**
 * Returns true if the given character is a zero-width space or a regular space.
 *
 * @param space
 */
export function isSpace(space: string): boolean {
    return isZeroWidthSpace(space) || space === ' ';
}

/**
 * Converts a string into an array of tokens and the words between them.
 *
 * @param tokenRegex
 * @param text
 */
export function tokenizeString(tokenRegex: RegExp, text: string): string[] {
    const delimeters = text.match(tokenRegex) || [];
    const words = text.split(tokenRegex) || [];

    let final: string[] = [];
    for (let i = 0; i < words.length; i++) {
        final.push(words[i]!, delimeters[i]!)
    }
    final.pop()
    return final.filter((word) => word != '');
}

/**
 * Measure the width of a string accounting for letter spacing.
 *
 * @param context
 * @param word
 * @param space
 */
export function measureText(context: CanvasRenderingContext2D, word: string, space: number = 0): number {
    if (!space) {
        return context.measureText(word).width;
    }
    return word.split('').reduce((acc, char) => {
        // Zero-width spaces should not include letter spacing.
        // And since we know the width of a zero-width space is 0, we can skip
        // measuring it.
        if (isZeroWidthSpace(char)) {
            return acc;
        }
        return acc + context.measureText(char).width + space;
    }, 0);
}

export interface WrapTextResult {
    l: string[];
    n: number[];
}

/**
 * Applies newlines to a string to have it optimally fit into the horizontal
 * bounds set by the Text object's wordWrapWidth property.
 *
 * @param context
 * @param text
 * @param wordWrapWidth
 * @param letterSpacing
 * @param indent
 */
export function wrapText(
    context: CanvasRenderingContext2D,
    text: string,
    wordWrapWidth: number,
    letterSpacing: number,
    indent: number
): WrapTextResult {
    // Greedy wrapping algorithm that will wrap words as the line grows longer.
    // than its horizontal bounds.
    const spaceRegex = / |\u200B/g;
    let lines = text.split(/\r?\n/g);
    let allLines: string[] = [];
    let realNewlines: number[] = [];
    for (let i = 0; i < lines.length; i++) {
        let resultLines: string[] = [];
        let result = '';
        let spaceLeft = wordWrapWidth - indent;
        let words = lines[i]!.split(spaceRegex);
        let spaces = lines[i]!.match(spaceRegex) || [];
        for (let j = 0; j < words.length; j++) {
            const space = spaces[j - 1] || '';
            const word = words[j]!;
            const wordWidth = measureText(context, word, letterSpacing);
            const wordWidthWithSpace = wordWidth + measureText(context, space, letterSpacing);
            if (j === 0 || wordWidthWithSpace > spaceLeft) {
                // Skip printing the newline if it's the first word of the line that is.
                // greater than the word wrap width.
                if (j > 0) {
                    resultLines.push(result);
                    result = '';
                }
                result += word;
                spaceLeft = wordWrapWidth - wordWidth - (j === 0 ? indent : 0);
            }
            else {
                spaceLeft -= wordWidthWithSpace;
                result += space + word;
            }
        }

        resultLines.push(result);
        result = '';

        allLines = allLines.concat(resultLines);

        if (i < lines.length - 1) {
            realNewlines.push(allLines.length);
        }
    }

    return {l: allLines, n: realNewlines};
}
