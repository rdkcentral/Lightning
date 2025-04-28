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

import type { ILineInfo, ISuffixInfo } from "./TextTextureRendererTypes.js";
import TextTokenizer from "./TextTokenizer.js";

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
  fontFace: string | (string | null)[] | null,
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
    if (curFf.indexOf(" ") < 0) {
      ffs.push(curFf);
    } else {
      ffs.push(`"${curFf}"`);
    }
  }

  return `${fontStyle} ${fontSize * precision}px ${ffs.join(",")}`;
}

/**
 * Wrap a single line of text
 */
export function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  wordWrapWidth: number,
  letterSpacing: number,
  textIndent: number,
  maxLines: number,
  suffix: string
): ILineInfo[] {
  // Greedy wrapping algorithm that will wrap words as the line grows longer.
  // than its horizontal bounds.
  const tokenize = TextTokenizer.getTokenizer();
  const words = tokenize(text)[0]!.tokens;
  const spaceWidth = measureText(context, " ", letterSpacing);
  const resultLines: ILineInfo[] = [];
  let result = "";
  let spaceLeft = wordWrapWidth - textIndent;
  let word = "";
  let wordWidth = 0;
  let totalWidth = textIndent;
  let overflow = false;
  for (let j = 0; j < words.length; j++) {
    word = words[j]!;
    wordWidth =
      word === " " ? spaceWidth : measureText(context, word, letterSpacing);
    if (wordWidth > spaceLeft) {
      // early stop?
      if (maxLines > 0 && resultLines.length >= maxLines - 1) {
        result += word;
        totalWidth += wordWidth;
        overflow = true;
        break;
      }
      // Skip printing the newline if it's the first word of the line that is.
      // greater than the word wrap width.
      if (j > 0 && result.length > 0) {
        resultLines.push({
          text: result,
          width: totalWidth,
        });
        result = "";
      }
      if (j > 0 && word === " ") wordWidth = 0;
      else result += word;
      totalWidth = wordWidth;
      spaceLeft = wordWrapWidth - wordWidth;
    } else {
      spaceLeft -= wordWidth;
      totalWidth += wordWidth;
      result += word;
    }
  }

  // shorten and append ellipsis, if any
  if (overflow) {
    const suffixWidth = suffix
      ? measureText(context, suffix, letterSpacing)
      : 0;

    while (totalWidth + suffixWidth > wordWrapWidth) {
      result = result.substring(0, result.length - 1);
      totalWidth = measureText(context, result, letterSpacing);
    }

    if (suffix) {
      while (result.endsWith(" ")) {
        result = result.substring(0, result.length - 1);
        totalWidth -= spaceWidth;
      }
      result += suffix;
      totalWidth += suffixWidth;
    }
  }

  resultLines.push({
    text: result,
    width: totalWidth,
  });

  return resultLines;
}

/**
 * Determine how to handle overflow, and what suffix (e.g. ellipsis) to render
 */
export function getSuffix(
  maxLinesSuffix: string,
  textOverflow: string | null,
  wordWrap: boolean
): ISuffixInfo {
  if (wordWrap) {
    return {
      suffix: maxLinesSuffix,
      nowrap: false,
    };
  }
  
  if (!textOverflow) {
    return {
      suffix: "",
      nowrap: false,
    };
  }

  switch (textOverflow) {
    case "clip":
      return {
        suffix: "",
        nowrap: true,
      };
    case "ellipsis":
      return {
        suffix: maxLinesSuffix,
        nowrap: true,
      };
    default:
      return {
        suffix: textOverflow || maxLinesSuffix,
        nowrap: true,
      };
  }
}

/**
 * Measure the width of a string accounting for letter spacing.
 *
 * @param context
 * @param word
 * @param space
 */
export function measureText(
  context: CanvasRenderingContext2D,
  word: string,
  space: number = 0
): number {
  const { width } = context.measureText(word);
  return space > 0 ? width + word.length * space : width;
}
