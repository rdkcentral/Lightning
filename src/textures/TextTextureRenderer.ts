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

import StageUtils from "../tree/StageUtils.mjs";
import type Stage from "../tree/Stage.mjs";
import type TextTexture from "./TextTexture.mjs";
import type {
  IRenderInfo,
  ILinesInfo,
  ILineInfo,
  IDrawLineInfo,
} from "./TextTextureRendererTypes.js";
import {
  getFontSetting,
  getSuffix,
  measureText,
  wrapText,
} from "./TextTextureRendererUtils.js";

export default class TextTextureRenderer {
  protected _stage: Stage;
  protected _canvas: HTMLCanvasElement;
  protected _context: CanvasRenderingContext2D;
  protected _settings: Required<TextTexture.Settings>;
  protected prevShadowSettings: [string, number, number, number] | null = null;
  public renderInfo: IRenderInfo | undefined;

  constructor(
    stage: Stage,
    canvas: HTMLCanvasElement,
    settings: Required<TextTexture.Settings>
  ) {
    this._stage = stage;
    this._canvas = canvas;
    this._context = this._canvas.getContext("2d")!;
    this._settings = settings;
  }

  setFontProperties() {
    this._context.font = getFontSetting(
      this._settings.fontFace,
      this._settings.fontStyle,
      this._settings.fontSize,
      this._stage.getRenderPrecision(),
      this._stage.getOption("defaultFontFace")
    );
    this._context.textBaseline = this._settings.textBaseline;
  }

  _load() {
    if (/*Utils.isWeb &&*/ document.fonts) {
      const fontSetting = getFontSetting(
        this._settings.fontFace,
        this._settings.fontStyle,
        this._settings.fontSize,
        this._stage.getRenderPrecision(),
        this._stage.getOption("defaultFontFace")
      );
      try {
        if (!document.fonts.check(fontSetting, this._settings.text)) {
          // Use a promise that waits for loading.
          return document.fonts
            .load(fontSetting, this._settings.text)
            .catch((err) => {
              // Just load the fallback font.
              console.warn("[Lightning] Font load error", err, fontSetting);
            })
            .then(() => {
              if (!document.fonts.check(fontSetting, this._settings.text)) {
                console.warn("[Lightning] Font not found", fontSetting);
              }
            });
        }
      } catch (e) {
        console.warn("[Lightning] Can't check font loading for " + fontSetting);
      }
    }
  }

  draw() {
    // We do not use a promise so that loading is performed syncronous when possible.
    const loadPromise = this._load();
    if (!loadPromise) {
      return /*Utils.isSpark ? this._stage.platform.drawText(this) :*/ this._draw();
    } else {
      return loadPromise.then(() => {
        return /*Utils.isSpark ? this._stage.platform.drawText(this) :*/ this._draw();
      });
    }
  }

  _calculateRenderInfo(): IRenderInfo {
    const renderInfo: Partial<IRenderInfo> = {};

    const precision = this._stage.getRenderPrecision();
    const paddingLeft = this._settings.paddingLeft * precision;
    const paddingRight = this._settings.paddingRight * precision;
    const fontSize = this._settings.fontSize * precision;
    let offsetY =
      this._settings.offsetY === null
        ? null
        : this._settings.offsetY * precision;
    let lineHeight = (this._settings.lineHeight || fontSize) * precision;
    const w = this._settings.w * precision;
    const h = this._settings.h * precision;
    let wordWrapWidth = this._settings.wordWrapWidth * precision;
    const cutSx = this._settings.cutSx * precision;
    const cutEx = this._settings.cutEx * precision;
    const cutSy = this._settings.cutSy * precision;
    const cutEy = this._settings.cutEy * precision;
    const letterSpacing = (this._settings.letterSpacing || 0) * precision;
    const textIndent = this._settings.textIndent * precision;
    const text = this._settings.text;
    const maxLines = this._settings.maxLines;

    // Set font properties.
    this.setFontProperties();

    // Total width.
    let width = w || this._stage.getOption("w");

    // Inner width.
    let innerWidth = width - paddingLeft;
    if (innerWidth < 10) {
      width += 10 - innerWidth;
      innerWidth = 10;
    }

    if (!wordWrapWidth) {
      wordWrapWidth = innerWidth;
    }

    // shape text
    let linesInfo: ILinesInfo;
    if (this._settings.wordWrap || this._settings.textOverflow) {
      linesInfo = this.wrapText(text, wordWrapWidth);
    } else {
      const textLines = text.split(/(?:\r\n|\r|\n)/);
      if (maxLines && textLines.length > maxLines) {
        linesInfo = {
          l: this.measureLines(textLines.slice(0, maxLines)),
          r: textLines.slice(maxLines),
        };
      } else {
        linesInfo = {
          l: this.measureLines(textLines),
          r: [],
        };
      }
    }

    if (linesInfo.r?.length) {
      renderInfo.remainingText = linesInfo.r.join("\n");
      renderInfo.moreTextLines = true;
    } else {
      renderInfo.remainingText = "";
      renderInfo.moreTextLines = false;
    }

    // calculate text width
    const lines = linesInfo.l;
    let maxLineWidth = 0;
    let lineWidths = [];
    for (let i = 0; i < lines.length; i++) {
      const width = lines[i]!.width;
      lineWidths.push(width);
      maxLineWidth = Math.max(maxLineWidth, width);
    }

    renderInfo.lineWidths = lineWidths;

    if (!w) {
      // Auto-set width to max text length.
      width = Math.min(maxLineWidth + paddingLeft + paddingRight, 2048);
      innerWidth = maxLineWidth;
    }

    // calculate canvas height
    const textBaseline = this._settings.textBaseline;
    const verticalAlign = this._settings.verticalAlign;
    let height;
    if (h) {
      height = h;
    } else {
      const baselineOffset =
        this._settings.textBaseline !== "bottom" ? fontSize * 0.5 : 0;
      height =
        lineHeight * (lines.length - 1) +
        baselineOffset +
        Math.max(lineHeight, fontSize) +
        (offsetY || 0);
    }

    // calculate vertical draw offset
    if (offsetY === null) {
      if (textBaseline === "top") offsetY = 0;
      else if (textBaseline === "alphabetic") offsetY = fontSize;
      else offsetY = fontSize;
    }
    if (verticalAlign === "middle") {
      offsetY += (lineHeight - fontSize) / 2;
    } else if (verticalAlign === "bottom") {
      offsetY += lineHeight - fontSize;
    }

    const rtl = this._settings.rtl;
    let textAlign = this._settings.textAlign;
    if (rtl) {
      if (textAlign === "left") textAlign = "right";
      else if (textAlign === "right") textAlign = "left";
    }

    let linePositionX;
    let linePositionY;
    const drawLines: IDrawLineInfo[] = [];

    // Layout lines
    for (let i = 0, n = lines.length; i < n; i++) {
      const lineWidth = lineWidths[i] || 0;

      linePositionX = rtl ? paddingRight : paddingLeft;
      if (i === 0 && !rtl) {
        linePositionX += textIndent;
      }

      if (textAlign === "right") {
        linePositionX += innerWidth - lineWidth;
      } else if (textAlign === "center") {
        linePositionX += (innerWidth - lineWidth) / 2;
      }

      linePositionY = i * lineHeight + offsetY;

      drawLines.push({
        info: lines[i]!,
        x: linePositionX,
        y: linePositionY,
        w: lineWidth,
      });
    }

    renderInfo.w = width;
    renderInfo.h = height;
    renderInfo.lines = drawLines;
    renderInfo.precision = precision;

    if (!width) {
      // To prevent canvas errors.
      width = 1;
    }

    if (!height) {
      // To prevent canvas errors.
      height = 1;
    }

    if (cutSx || cutEx) {
      width = Math.min(width, cutEx - cutSx);
    }

    if (cutSy || cutEy) {
      height = Math.min(height, cutEy - cutSy);
    }

    renderInfo.width = width;
    renderInfo.innerWidth = innerWidth;
    renderInfo.height = height;
    renderInfo.fontSize = fontSize;
    renderInfo.cutSx = cutSx;
    renderInfo.cutSy = cutSy;
    renderInfo.cutEx = cutEx;
    renderInfo.cutEy = cutEy;
    renderInfo.lineHeight = lineHeight;
    renderInfo.lineWidths = lineWidths;
    renderInfo.offsetY = offsetY;
    renderInfo.paddingLeft = paddingLeft;
    renderInfo.paddingRight = paddingRight;
    renderInfo.letterSpacing = letterSpacing;
    renderInfo.textIndent = textIndent;

    return renderInfo as IRenderInfo;
  }

  _draw() {
    const renderInfo = this._calculateRenderInfo();
    const precision = renderInfo.precision;

    // Add extra margin to prevent issue with clipped text when scaling.
    this._canvas.width = Math.ceil(
      renderInfo.width + this._stage.getOption("textRenderIssueMargin")
    );
    this._canvas.height = Math.ceil(renderInfo.height);

    // Canvas context has been reset.
    this.setFontProperties();

    if (renderInfo.fontSize >= 128) {
      // WpeWebKit bug: must force compositing because cairo-traps-compositor will not work with text first.
      this._context.globalAlpha = 0.01;
      this._context.fillRect(0, 0, 0.01, 0.01);
      this._context.globalAlpha = 1.0;
    }

    if (renderInfo.cutSx || renderInfo.cutSy) {
      this._context.translate(-renderInfo.cutSx, -renderInfo.cutSy);
    }


    if (this._settings.highlight) {
      this._drawHighlight(precision, renderInfo);
    }

    if (this._settings.shadow) {
      this._drawShadow(precision);
    }

    this._drawLines(renderInfo.lines, renderInfo.letterSpacing);

    if (this._settings.shadow) {
      this._restoreShadow();
    }

    if (renderInfo.cutSx || renderInfo.cutSy) {
      this._context.translate(renderInfo.cutSx, renderInfo.cutSy);
    }

    this.renderInfo = renderInfo;
  }

  protected _drawLines(drawLines: IDrawLineInfo[], letterSpacing: number) {
    const ctx = this._context;
    ctx.fillStyle = StageUtils.getRgbaString(this._settings.textColor);

    for (let i = 0, n = drawLines.length; i < n; i++) {
      const drawLine = drawLines[i]!;
      const y = drawLine.y;
      let x = drawLine.x;
      const text = drawLine.info.text;

      if (letterSpacing === 0) {
        ctx.fillText(text, x, y);
      } else {
        this._fillTextWithLetterSpacing(ctx, text, x, y, letterSpacing);
      }
    }
  }

  protected _fillTextWithLetterSpacing(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    letterSpacing: number
  ) {
    for (let i = 0; i < text.length; i++) {
      const c = text[i]!;
      ctx.fillText(c, x, y);
      x += measureText(ctx, c, letterSpacing);
    }
  }

  protected _restoreShadow() {
    const settings = this.prevShadowSettings!;
    const ctx = this._context;
    ctx.shadowColor = settings[0];
    ctx.shadowOffsetX = settings[1];
    ctx.shadowOffsetY = settings[2];
    ctx.shadowBlur = settings[3];
    this.prevShadowSettings = null;
  }

  protected _drawShadow(precision: number) {
    const ctx = this._context;
    this.prevShadowSettings = [
      ctx.shadowColor,
      ctx.shadowOffsetX,
      ctx.shadowOffsetY,
      ctx.shadowBlur,
    ];

    ctx.shadowColor = StageUtils.getRgbaString(this._settings.shadowColor);
    ctx.shadowOffsetX = this._settings.shadowOffsetX * precision;
    ctx.shadowOffsetY = this._settings.shadowOffsetY * precision;
    ctx.shadowBlur = this._settings.shadowBlur * precision;
  }

  protected _drawHighlight(
    precision: number,
    renderInfo: IRenderInfo
  ) {
    let color = this._settings.highlightColor || 0x00000000;

    let hlHeight =
      this._settings.highlightHeight * precision || renderInfo.fontSize * 1.5;
    const offset = this._settings.highlightOffset * precision;
    const hlPaddingLeft =
      this._settings.highlightPaddingLeft !== null
        ? this._settings.highlightPaddingLeft * precision
        : renderInfo.paddingLeft;
    const hlPaddingRight =
      this._settings.highlightPaddingRight !== null
        ? this._settings.highlightPaddingRight * precision
        : renderInfo.paddingRight;

    this._context.fillStyle = StageUtils.getRgbaString(color);
    for (let i = 0; i < renderInfo.lines.length; i++) {
      const drawLine = renderInfo.lines[i]!;
      this._context.fillRect(
        drawLine.x - hlPaddingLeft,
        drawLine.y - renderInfo.offsetY + offset,
        drawLine.w + hlPaddingRight + hlPaddingLeft,
        hlHeight
      );
    }
  }

  /**
   * Simple line measurement
   */
  measureLines(lines: string[]): ILineInfo[] {
    return lines.map((line) => ({
      text: line,
      width: measureText(this._context, line),
    }));
  }

  /**
   * Simple text wrapping
   */
  wrapText(text: string, wordWrapWidth: number): ILinesInfo {
    const lines = text.split(/(?:\r\n|\r|\n)/);

    const renderLines: ILineInfo[] = [];
    let maxLines = this._settings.maxLines;
    const { suffix, nowrap } = getSuffix(
      this._settings.maxLinesSuffix,
      this._settings.textOverflow,
      this._settings.wordWrap
    );
    const wordBreak = this._settings.wordBreak;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const tempLines = wrapText(
        this._context,
        line,
        wordWrapWidth,
        this._settings.letterSpacing,
        i === 0 ? this._settings.textIndent : 0,
        nowrap ? 1 : maxLines,
        suffix,
        wordBreak
      );

      if (maxLines === 0) {
        // add all
        renderLines.push(...tempLines);
      } else {
        // add up to
        while (maxLines > 0 && tempLines.length > 0) {
          renderLines.push(tempLines.shift()!);
          maxLines--;
        }
        if (maxLines === 0) {
          if (i < lines.length - 1) {
            const lastLine = renderLines[renderLines.length - 1]!;
            if (suffix && !lastLine.text.endsWith(suffix)) {
              lastLine.text += suffix;
            }
          }
          break;
        }
      }
    }

    return {
      l: renderLines,
      r: [],
    };
  }
}
