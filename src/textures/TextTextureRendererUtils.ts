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
  ISuffixInfo,
} from "./TextTextureRendererTypes.js";
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
  wrapWidth: number,
  letterSpacing: number,
  textIndent: number,
  maxLines: number,
  suffix: string,
  wordBreak: boolean
): ILineInfo[] {
  // Greedy wrapping algorithm that will wrap words as the line grows longer.
  // than its horizontal bounds.
  const tokenize = TextTokenizer.getTokenizer();
  const words = tokenize(text)[0]!.tokens;
  const spaceWidth = measureText(context, " ", letterSpacing);
  const resultLines: ILineInfo[] = [];
  let result = "";
  let spaceLeft = wrapWidth - textIndent;
  let word = "";
  let wordWidth = 0;
  let totalWidth = textIndent;
  let overflow = false;
  for (let j = 0; j < words.length; j++) {
    // overflow?
    if (maxLines && resultLines.length > maxLines) {
      overflow = true;
      break;
    }
    word = words[j]!;
    wordWidth =
      word === " " ? spaceWidth : measureText(context, word, letterSpacing);

    if (wordWidth > spaceLeft) {
      // last word of last line overflows
      if (maxLines && resultLines.length >= maxLines - 1) {
        result += word;
        totalWidth += wordWidth;
        overflow = true;
        break;
      }

      // commit line
      if (j > 0 && result.length > 0) {
        resultLines.push({
          text: result,
          width: totalWidth,
        });
        result = "";
      }

      // move word to next line, but drop a trailing space
      if (j > 0 && word === " ") wordWidth = 0;
      else result = word;

      // if word is too long, break it (caution: it could produce more than maxLines)
      if (wordBreak && wordWidth > wrapWidth) {
        const broken = breakWord(context, word, wrapWidth, letterSpacing);
        let last = broken.pop()!;
        for (const k of broken) {
          resultLines.push({
            text: k.text,
            width: k.width,
          });
        }
        result = last.text;
        wordWidth = last.width;
      }

      totalWidth = wordWidth;
      spaceLeft = wrapWidth - wordWidth;
    } else {
      spaceLeft -= wordWidth;
      totalWidth += wordWidth;
      result += word;
    }
  }
  
  // prevent exceeding maxLines
  if (maxLines > 0 && resultLines.length >= maxLines) {
    resultLines.length = maxLines;
  }

  // shorten and append ellipsis, if any
  if (overflow) {
    const suffixWidth = suffix
      ? measureText(context, suffix, letterSpacing)
      : 0;

    while (totalWidth + suffixWidth > wrapWidth) {
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

/**
 * Break a word into smaller parts if it exceeds the maximum width.
 *
 * @param context
 * @param word
 * @param wordWrapWidth
 * @param space
 */
export function breakWord(
  context: CanvasRenderingContext2D,
  word: string,
  wordWrapWidth: number,
  space: number = 0
): ILineWord[] {
  const result: ILineWord[] = [];
  let token = "";
  let prevWidth = 0;
  // parts of the word fitting exactly wordWrapWidth
  for (let i = 0; i < word.length; i++) {
    const c = word.charAt(i);
    token += c;
    const width = measureText(context, token, space);
    if (width > wordWrapWidth) {
      result.push({
        text: token.substring(0, token.length - 1),
        width: prevWidth,
      });
      token = c;
      prevWidth = measureText(context, token, space);
    } else {
      prevWidth = width;
    }
  }
  // remaining text
  if (token.length > 0) {
    result.push({
      text: token,
      width: prevWidth,
    });
  }
  return result;
}
