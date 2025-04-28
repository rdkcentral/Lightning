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

const reQuoteStart = /^["“”«»]/;
const reQuoteEnd = /["“”«»]$/;
const rePunctuationStart = /^[.,،:;!?\(\)"-]+/;
const rePunctuationEnd = /[.,،:;!?\(\)"-]+$/;

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
    const { levels } = bidi.getEmbeddingLevels(text);
    let prevLevel = levels[0]!;
    let rtl = (prevLevel & 1) > 0;
    let t = "";

    const spans: DirectedSpan[] = [];
    let tokens: string[] = [];
    spans.push({
      rtl,
      tokens,
    });

    const commit = () => {
      if (!t.length) return;
      if (rtl) {
        t = mirrorTokenPunctuation(t);
      }
      tokens.push(t);
      t = "";
    };

    const flip = () => {
      rtl = !rtl;
      tokens = [];
      spans.push({
        rtl,
        tokens,
      });
    };

    for (let i = 0; i < text.length; i++) {
      if (levels[i] !== prevLevel) {
        prevLevel = levels[i]!;
        commit();
        flip();
      }

      const c = text.charAt(i);
      if (c === " ") {
        commit();
        tokens.push(c);
      } else if (c === "\u200B") {
        commit();
      } else {
        t += c;
      }
    }
    commit();

    return spans;
  }

  return tokenize;
}
