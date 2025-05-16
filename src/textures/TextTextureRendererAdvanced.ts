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

import {
  createLineStyle,
  extractTags,
  layoutSpans,
  type LineLayout,
} from "./TextTextureRendererAdvancedUtils.js";
import TextTextureRenderer from "./TextTextureRenderer.js";
import type {
  IDrawLineInfo,
  ILinesInfo,
  ILineWordStyle,
} from "./TextTextureRendererTypes.js";
import {
  getFontSetting,
  getSuffix,
} from "./TextTextureRendererUtils.js";
import StageUtils from "../tree/StageUtils.mjs";
import TextTokenizer from "./TextTokenizer.js";
import TextTexture from "./TextTexture.mjs";

export default class TextTextureRendererAdvanced extends TextTextureRenderer {
  override wrapText(text: string, wordWrapWidth: number): ILinesInfo {
    const styled = this._settings.advancedRenderer;

    // styled renderer' base font should not include styling
    const baseFont = getFontSetting(
      this._settings.fontFace,
      styled ? "" : this._settings.fontStyle,
      this._settings.fontSize,
      this._stage.getRenderPrecision(),
      this._stage.getOption("defaultFontFace")
    );

    const { suffix, nowrap } = getSuffix(
      this._settings.maxLinesSuffix,
      this._settings.textOverflow,
      this._settings.wordWrap
    );
    const wordBreak = this._settings.wordBreak;
    const allowTextTruncation = TextTexture.allowTextTruncation;

    let tags: string[];
    if (styled) {
      const extract = extractTags(text);
      tags = extract.tags;
      text = extract.output;
    } else {
      tags = [];
    }

    const lineStyle = createLineStyle(tags, baseFont, this._settings.textColor);
    const tokenize = TextTokenizer.getTokenizer();

    const sourceLines = text.split(/[\r\n]/g);
    const wrappedLines: LineLayout[] = [];
    let remainingLines = this._settings.maxLines;

    for (let i = 0; i < sourceLines.length; i++) {
      const line = sourceLines[i]!;
      const spans = tokenize(line);

      const lines = layoutSpans(
        this._context,
        spans,
        lineStyle,
        wordWrapWidth,
        i === 0 ? this._settings.textIndent : 0,
        nowrap ? 1 : remainingLines,
        suffix,
        wordBreak,
        allowTextTruncation
      );

      wrappedLines.push(...lines);

      if (remainingLines > 0) {
        remainingLines -= lines.length;
        if (remainingLines <= 0) break;
      }
    }

    return {
      l: wrappedLines,
      r: [],
    };
  }

  override _drawLines(drawLines: IDrawLineInfo[], letterSpacing: number) {
    // letter spacing is not supported in advanced renderer
    const ctx = this._context;
    ctx.fillStyle = StageUtils.getRgbaString(this._settings.textColor);
    let currentStyle: ILineWordStyle | undefined;

    for (let i = 0, n = drawLines.length; i < n; i++) {
      const drawLine = drawLines[i]!;
      const words = drawLine.info.words ?? [];

      const y = drawLine.y;
      let x = drawLine.x;
      for (let j = 0; j < words.length; j++) {
        const word = words[j]!;
        if (word.style !== currentStyle) {
          currentStyle = word.style;
          if (currentStyle) {
            const { font, color } = currentStyle;
            ctx.font = font;
            ctx.fillStyle = color;
          }
        }

        ctx.fillText(word.text, x, y);
        x += word.width;
      }
    }
  }
}
