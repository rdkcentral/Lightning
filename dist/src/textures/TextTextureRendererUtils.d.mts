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
export declare function getFontSetting(fontFace: string | string[], fontStyle: string, fontSize: number, precision: number, defaultFontFace: string): string;
/**
 * Returns true if the given character is a zero-width space.
 *
 * @param space
 */
export declare function isZeroWidthSpace(space: string): boolean;
/**
 * Returns true if the given character is a zero-width space or a regular space.
 *
 * @param space
 */
export declare function isSpace(space: string): boolean;
/**
 * Converts a string into an array of tokens and the words between them.
 *
 * @param tokenRegex
 * @param text
 */
export declare function tokenizeString(tokenRegex: RegExp, text: string): string[];
/**
 * Measure the width of a string accounting for letter spacing.
 *
 * @param context
 * @param word
 * @param space
 */
export declare function measureText(context: CanvasRenderingContext2D, word: string, space?: number): number;
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
export declare function wrapText(context: CanvasRenderingContext2D, text: string, wordWrapWidth: number, letterSpacing: number, indent: number): WrapTextResult;
//# sourceMappingURL=TextTextureRendererUtils.d.mts.map