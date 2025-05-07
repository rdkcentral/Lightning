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

import type {
  ILineInfo,
  ILineWord,
  ILineWordStyle,
} from "./TextTextureRendererTypes.js";
import StageUtils from "../tree/StageUtils.mjs";

export interface DirectedSpan {
  rtl?: boolean;
  tokens: string[];
}
export interface WordLayout extends ILineWord {
  rtl: boolean;
}
export interface LineLayout extends ILineInfo {
  rtl: boolean;
  words: WordLayout[];
}

const TAG_DEFAULTS: Record<string, number | undefined> = {
  "<i>": 0x2460,
  "</i>": 0x2461,
  "<b>": 0x2462,
  "</b>": 0x2463,
  "</color>": 0x2464,
};

/**
 * Extract HTML tags, replacing them with direction-weak characters, so they don't affect bidi parsing
 */
export function extractTags(source: string): {
  tags: string[];
  output: string;
} {
  const tags: string[] = ["<i>", "</i>", "<b>", "</b>", "</color>"];
  const reTag = /<i>|<\/i>|<b>|<\/b>|<color=0[xX][0-9a-fA-F]{6,8}>|<\/color>/g;
  let output = "";
  let m: RegExpMatchArray | null;
  let lastIndex = 0;
  while ((m = reTag.exec(source))) {
    output += source.substring(lastIndex, m.index);
    let code = TAG_DEFAULTS[m[0]];
    if (code === undefined) {
      code = 0x2460 + tags.length;
      tags.push(m[0]);
    }
    output += `\u200B${String.fromCharCode(code)}\u200B`;
    lastIndex = m.index! + m[0].length;
  }
  output += source.substring(lastIndex);
  return { tags, output };
}

/**
 * Drop trailing space and measure total line width
 */
function measureLine(line: LineLayout): void {
  if (line.words[line.words.length - 1]?.text === " ") {
    line.words.pop();
  }
  line.words.forEach((token) => (line.width += token.width));
}

/**
 * Style helper
 */
export function createLineStyle(
  tags: string[],
  baseFont: string,
  color: number
) {
  const isStyled = tags.length > 0;
  let bold = 0;
  let italic = 0;
  const colors = [StageUtils.getRgbaString(color)];

  const updateStyle = (code: number): boolean => {
    const tag = tags[code - 0x2460];
    if (!tag) return false;

    if (tag === "<b>") {
      bold++;
    } else if (tag === "</b>") {
      if (bold > 0) bold--;
    } else if (tag === "<i>") {
      italic++;
    } else if (tag === "</i>") {
      if (italic > 0) italic--;
    } else if (tag === "</color>") {
      if (colors.length > 0) colors.pop();
    } else if (tag.startsWith("<color=")) {
      let hex = tag.substring(9, tag.length - 1);
      if (hex.length === 6) hex = "ff" + hex;
      colors.push(StageUtils.getRgbaString(parseInt(hex, 16)));
    } else {
      return false; // invalid tag
    }
    return true;
  };

  const getStyle = (): ILineWordStyle => ({
    font: (bold ? "bold " : "") + (italic ? "italic " : "") + baseFont,
    color: colors[colors.length - 1]!,
  });

  const baseStyle = getStyle();

  return { isStyled, baseStyle, updateStyle, getStyle };
}

/**
 * Layout text into lines
 */
export function layoutSpans(
  ctx: CanvasRenderingContext2D,
  spans: DirectedSpan[],
  lineStyle: ReturnType<typeof createLineStyle>,
  wrapWidth: number,
  textIndent: number,
  maxLines: number,
  suffix: string,
  allowTruncation = false
): LineLayout[] {
  // styling
  const { isStyled, baseStyle, updateStyle, getStyle } = lineStyle;
  const initialStyle = getStyle();
  ctx.font = initialStyle.font;
  let style: ILineWordStyle | undefined = isStyled ? initialStyle : undefined;

  // cached metrics
  const spaceWidth = ctx.measureText(" ").width;
  const suffixWidth = ctx.measureText(suffix).width;

  // layout state
  let rtl = Boolean(spans[0]?.rtl);
  const primaryRtl = rtl;
  let line: LineLayout = {
    rtl,
    width: textIndent,
    text: "",
    words: [],
  };
  const lines: LineLayout[] = [line];
  let lineN = 1;
  let endReached = false;
  let addEllipsis = false;
  let x = textIndent;

  // concatenate words
  const appendWords = (words: WordLayout[]): void => {
    if (rtl !== primaryRtl) {
      words.reverse();
    }
    // drop double space when changing direction
    if (line.words.length > 1) {
      if (
        words[0]?.text === " " &&
        line.words[line.words.length - 1]?.text === " "
      ) {
        words.shift();
      }
    }
    line.words.push(...words);
  };

  // process tokens
  for (let si = 0; si < spans.length; si++) {
    const span = spans[si]!;
    rtl = Boolean(span.rtl);
    const tokens = span.tokens;
    let words: WordLayout[] = [];

    for (let ti = 0; ti < tokens.length; ti++) {
      let text = tokens[ti]!;
      const isSpace = text === " ";

      // update style?
      if (isStyled && !isSpace) {
        const c = text.charCodeAt(0);
        if (c >= 0x2460 && c <= 0x2473) {
          // word is a style tag
          if (updateStyle(c)) {
            style = getStyle();
            ctx.font = style!.font;
          }
          continue;
        }
      }

      // measure word
      const width = isSpace ? spaceWidth : ctx.measureText(text).width;
      x += width;

      // end of line
      if (x > wrapWidth) {
        // single word longer than max size
        if (words.length === 0 && line.words.length === 0) {
          words.push({ text, width, style, rtl });
          if (lineN === maxLines) {
            addEllipsis = true;
            endReached = true;
            break;
          }
          // else TODO break word
          continue;
        }

        // last word of last line - ellipsis will be applied later
        if (lineN === maxLines) {
          words.push({ text, width, style, rtl });
          addEllipsis = true;
          endReached = true;
          break;
        }

        // finalize line
        appendWords(words);
        measureLine(line);

        // new line
        x = width;
        words = [];
        line = {
          rtl,
          width: 0,
          text: "",
          words: [],
        };
        lines.push(line);
        lineN++;
        if (text === " ") {
          // don't insert trailing space
          continue;
        }
      }

      words.push({ text, width, style, rtl });
    }

    // append and continue?
    appendWords(words);
    if (endReached) break;
  }
  // finalize
  measureLine(line);

  // ellipsis
  if (addEllipsis) {
    line = lines[lines.length - 1]!;
    const maxLineWidth = wrapWidth - suffixWidth;

    if (line.width > maxLineWidth) {
      // if we have a sub-expression (suite of words) not in the primary direction (embedded RTL in LTR or vice versa),
      // remove the first word of this sequence, to ensure we don't lose the meaningful last word, unless it can be truncated
      let lastIndex = line.words.length - 1;
      let word = line.words[lastIndex]!;
      let index = lastIndex;

      // TODO: this works well for English but not for embedded RTL
      if (primaryRtl && !word.rtl) {
        let removeOppositeEnd = true;
        while (word.rtl !== primaryRtl && removeOppositeEnd) {
          removeOppositeEnd = false;
          // find direction change
          while (index > 0 && word.rtl !== primaryRtl) {
            word = line.words[--index]!;
          }
          ++index;
          if (index < 0 || index === lastIndex) {
            break;
          }
          // remove word
          word = line.words[index]!;
          line.words.splice(index, 1);
          line.width -= word.width;
          // remove extra space
          word = line.words[index]!;
          if (word.text === " ") {
            line.words.splice(index, 1);
            line.width -= word.width;
          }
          // repeat?
          lastIndex = line.words.length - 1;
          word = line.words[lastIndex]!;
          index = lastIndex;
          removeOppositeEnd = allowTruncation && word.width < suffixWidth * 2;
        }
      }

      // shorten last word to fit ellipsis
      while (line.width > maxLineWidth) {
        let last = line.words.pop()!;
        line.width -= last.width;
        const maxWidth = maxLineWidth - line.width;

        if (allowTruncation && maxWidth > 0) {
          let { text, width, style, rtl } = last;
          if (style) {
            ctx.font = style.font;
          }
          const reversed = primaryRtl !== rtl;
          do {
            text = reversed
              ? trimWordStart(text, rtl)
              : trimWordEnd(text, rtl);
            width = ctx.measureText(text).width;
          } while (width > maxWidth);
          if (width > suffixWidth) {
            last = {
              ...last,
              text,
              width,
            };
            line.words.push(last);
            line.width += width;
            break;
          }
        }
      }
    }

    // drop space before ellipsis
    if (line.words[line.words.length - 1]!.text === " ") {
      line.words.pop();
      line.width -= spaceWidth;
    }

    // add ellipsis
    line.words.push({
      text: suffix,
      width: suffixWidth,
      style: baseStyle,
      rtl: false,
    });
    line.width += suffixWidth;
  }

  // reverse words of RTL text because we render left to right
  if (primaryRtl) {
    for (const line of lines) {
      line.words.reverse();
    }
  }
  return lines;
}

const rePunctuationStart = /^[.,،:;!?؟()"“”«»-]+/
const rePunctuationEnd = /[.,،:;!?؟()"“”«»-]+$/

export function trimWordEnd(text: string, rtl: boolean): string {
  if (rtl) {
    return trimRtlWordEnd(text);
  }
  return text.substring(0, text.length - 1);
}

export function trimWordStart(text: string, rtl: boolean): string {
  if (rtl) {
    return trimRtlWordStart(text);
  }
  return text.substring(1);
}

/**
 * Trim RTL word end, preserving end punctuation
 * @param text
 * @returns
 */
function trimRtlWordEnd(text: string): string {
  let match = text.match(rePunctuationStart);
  if (match) {
    const punctuation = match[0];
    text = text.substring(punctuation.length);
    return punctuation.substring(1) + text;
  }
  match = text.match(rePunctuationEnd);
  if (match) {
    const punctuation = match[0];
    text = text.substring(0, text.length - punctuation.length);
    if (text.length > 0) {
      return text.substring(0, text.length - 1) + punctuation;
    } else {
      return punctuation.substring(1);
    }
  }
  return text.substring(0, text.length - 1);
}

/**
 * Trim RTL word start, preserving start punctuation
 * @param text
 * @returns
 */
function trimRtlWordStart(text: string): string {
  const match = text.match(rePunctuationStart);
  if (match) {
    const punctuation = match[0];
    text = text.substring(punctuation.length);
    if (text.length > 0) {
      return punctuation + text.substring(1);
    } else {
      return punctuation.substring(1);
    }
  }
  return text.substring(1);
}

/**
 * Render text lines
 */
export function renderLines(
  ctx: CanvasRenderingContext2D,
  lines: LineLayout[],
  lineStyle: ReturnType<typeof createLineStyle>,
  align: "left" | "right" | "center",
  lineHeight: number,
  wrapWidth: number,
  indent: number
) {
  const { baseStyle } = lineStyle;
  ctx.font = baseStyle.font;
  ctx.fillStyle = baseStyle.color;
  let currentStyle: ILineWordStyle | undefined = baseStyle;

  // get text metrics for vertical layout
  const metrics = ctx.measureText(" ");
  const fontLineHeight =
    metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
  const leading = lineHeight - fontLineHeight;
  let y = leading / 2 + metrics.fontBoundingBoxAscent;

  for (const line of lines) {
    let x =
      align === "left"
        ? indent
        : align === "right"
        ? wrapWidth - indent - line.width
        : (wrapWidth - line.width) / 2;

    for (const word of line.words) {
      if (word.style !== currentStyle) {
        currentStyle = word.style;
        if (currentStyle) {
          const { font, color } = currentStyle;
          ctx.font = font;
          ctx.fillStyle = color;
        }
      }
      if (word.text !== " ") {
        ctx.fillText(word.text, x, y);
      }
      x += word.width;
    }
    y += lineHeight;
  }
}
