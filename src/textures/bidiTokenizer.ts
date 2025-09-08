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

import bidiFactory, { type BidiAPI } from "bidi-js";
import type { DirectedSpan } from "./TextTextureRendererAdvancedUtils.js";

let bidi: BidiAPI;

type Direction = 'lri' | 'rli' | 'fsi' | 'default';

// https://www.unicode.org/reports/tr9/
const reZeroWidthSpace = /[\u200B\u200E\u200F\u061C]/;
const reDirectionalFormat = /[\u202A\u202B\u202C\u202D\u202E\u202E\u2066\u2067\u2068\u2069]/;

const LRI = '\u2066'; // Left-to-Right Isolate ('ltr')
const RLI = '\u2067'; // Right-to-Left Isolate ('rtl')
const FSI = '\u2068'; // First Strong Isolate ('auto')
const PDI = '\u2069'; // Pop Directional Isolate

const reQuoteStart = /^["“”«»]/;
const reQuoteEnd = /["“”«»]$/;
const rePunctuationStart = /^[.,،:;!?()"-]+/;
const rePunctuationEnd = /[.,،:;!?()"-]+$/;

/**
 * Reverse punctuation characters, mirroring braces
 */
function mirrorPunctuation(punctuation: string): string {
  let result = "";
  for (let i = 0; i < punctuation.length; i++) {
    let c = punctuation.charAt(i);
    if (c === "(") c = ")";
    else if (c === ")") c = "(";
    result = c + result;
  }
  return result;
}

/**
 * Mirror directional single character
 */
function mirrorSingle(char: string): string {
  if (char === '"') return '"';
  else if (char === "(") return ")";
  else if (char === ")") return "(";
  else if (char === "“") return "”";
  else if (char === "”") return "“";
  else if (char === "«") return "»";
  else if (char === "»") return "«";
  return char;
}

/**
 * Reverse punctuation surrounding a token
 */
function mirrorTokenPunctuation(token: string): string {
  // single character could be a punctuation
  if (token.length <= 1) {
    return mirrorSingle(token);
  }

  // extract quotes
  const startQuote = token.match(reQuoteStart);
  const endQuote = token.match(reQuoteEnd);
  if (startQuote) {
    token = token.substring(1);
  }
  if (endQuote) {
    token = token.substring(0, token.length - 1);
  }

  // has punctuation at the start
  const start = token.match(rePunctuationStart);
  if (start) {
    token = token.substring(start[0].length);
  }

  if (token.length > 1) {
    // has punctuation at the end
    const end = token.match(rePunctuationEnd);
    if (end) {
      token = token.substring(0, token.length - end[0].length);
      token = mirrorPunctuation(end[0]) + token;
    }
  }

  if (start) {
    token = token + mirrorPunctuation(start[0]);
  }

  // add quotes back
  if (startQuote) {
    token = token + mirrorSingle(startQuote[0]);
  }
  if (endQuote) {
    token = mirrorSingle(endQuote[0]) + token;
  }
  return token;
}

/**
 * RTL aware tokenizer
 */
export function getBidiTokenizer() {
  if (!bidi) {
    bidi = bidiFactory();
  }

  function tokenize(text: string): DirectedSpan[] {
    // initial direction
    const dir = text.startsWith(LRI) ? 'ltr' : text.startsWith(RLI) ? 'rtl' : undefined;
    const { levels } = bidi.getEmbeddingLevels(text, dir);
    let prevLevel = levels[0]!;
    let rtl = (prevLevel & 1) > 0;
    
    const dirs: Direction[] = ['fsi'];
    const spans: (DirectedSpan & { dir?: Direction })[] = [];
    let tokens: string[] = [];
    let span: DirectedSpan & { dir?: Direction } = {
      dir: dir === undefined ? 'fsi' : dir === 'ltr' ? 'lri' : 'rli',
      rtl,
      tokens,
    };
    spans.push(span);
    let t = "";

    // test whether the token has a strong direction
    const detectDirection = (token: string): void => {
      for (let i = 0; i < token.length; i++) {
        const type = bidi.getBidiCharTypeName(token.charAt(i));
        if (type === 'L') {
          dirs[dirs.length - 1] = 'lri';
          span.dir = 'lri';
          span.rtl = false;
          rtl = false;
          break;
        }
        if (type === 'R' || type === 'AL') {
          dirs[dirs.length - 1] = 'rli';
          span.dir = 'rli';
          span.rtl = true;
          rtl = true;
          break;
        }
      }
    }

    const commit = () => {
      if (!t.length) return;

      // auto direction
      if (span.dir === 'fsi') {
        detectDirection(t);
      }

      if (rtl) {
        t = mirrorTokenPunctuation(t);
      }
      tokens.push(t);
      t = "";
    };

    // start new span
    const flip = () => {
      tokens = [];
      span = {
        dir: dirs[dirs.length - 1]!,
        rtl,
        tokens: tokens,
      };
      spans.push(span);
    };

    const enterIsolate = (dir: Direction) => {
      dirs.push(dir);
      if (!tokens.length) {
        if (dir !== 'fsi') span.dir = dir;
      } else {
        flip();
      }
    };

    const endIsolate = () => {
      dirs.pop();
      if (dirs.length === 0) {
        dirs.push('fsi');
      }
    };

    for (let i = 0; i < text.length; i++) {
      const c = text.charAt(i);

      // control characters
      if (reDirectionalFormat.test(c)) {
        commit();
        // direction isolates create an isolated span of text
        if (c === LRI) {
          enterIsolate('lri');
        } else if (c === RLI) {
          enterIsolate('rli');
        } else if (c === FSI) {
          enterIsolate('fsi');
        } else if (c === PDI) {
          endIsolate();
        }
        continue;
      }

      // level change means direction change
      if (levels[i] !== prevLevel) {
        commit();
        prevLevel = levels[i]!;
        const _rtl = (prevLevel & 1) > 0;
        if (rtl !== _rtl) {
          rtl = _rtl;
          if (span.dir === 'fsi') {
            // append to auto-direction span
            span.rtl = rtl;
          } else {
            flip();
          }
        }
      }

      if (c === " ") {
        commit();
        tokens.push(c);
      } else if (reZeroWidthSpace.test(c)) {
        commit();
      } else  {
        t += c;
      }
    }
    commit();

    // remove dir, not needed
    spans.forEach((span) => {
      delete span.dir;
    });

    return spans;
  }

  return tokenize;
}
