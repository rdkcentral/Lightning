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
import Utils from "../tree/Utils.mjs";

export default class TextTextureRendererAdvanced {

    constructor(stage, canvas, settings) {
        this._stage = stage;
        this._canvas = canvas;
        this._context = this._canvas.getContext('2d');
        this._settings = settings;
    }

    getPrecision() {
        return this._settings.precision;
    };

    setFontProperties() {
        const font = Utils.isSpark ? this._stage.platform.getFontSetting(this) : this._getFontSetting();
        this._context.font = font;
        this._context.textBaseline = this._settings.textBaseline;
        return font;
    };

    _getFontSetting() {
        let ff = this._settings.fontFace;

        if (!Array.isArray(ff)) {
            ff = [ff];
        }

        let ffs = [];
        for (let i = 0, n = ff.length; i < n; i++) {
            if (ff[i] === "serif" || ff[i] === "sans-serif") {
                ffs.push(ff[i]);
            } else {
                ffs.push(`"${ff[i]}"`);
            }
        }

        return `${this._settings.fontStyle} ${this._settings.fontSize * this.getPrecision()}px ${ffs.join(",")}`
    }

    _load() {
        if (Utils.isWeb && document.fonts) {
            const fontSetting = this._getFontSetting();
            try {
                if (!document.fonts.check(fontSetting, this._settings.text)) {
                    // Use a promise that waits for loading.
                    return document.fonts.load(fontSetting, this._settings.text).catch(err => {
                        // Just load the fallback font.
                        console.warn('Font load error', err, fontSetting);
                    }).then(() => {
                        if (!document.fonts.check(fontSetting, this._settings.text)) {
                            console.warn('Font not found', fontSetting);
                        }
                    });
                }
            } catch(e) {
                console.warn("Can't check font loading for " + fontSetting);
            }
        }
    }

    draw() {
        // We do not use a promise so that loading is performed syncronous when possible.
        const loadPromise = this._load();
        if (!loadPromise) {
            return Utils.isSpark ? this._stage.platform.drawText(this) : this._draw();
        } else {
            return loadPromise.then(() => {
                return Utils.isSpark ? this._stage.platform.drawText(this) : this._draw();
            });
        }
    }

    _calculateRenderInfo() {
        let renderInfo = {};

        const precision = this.getPrecision();

        const paddingLeft = this._settings.paddingLeft * precision;
        const paddingRight = this._settings.paddingRight * precision;
        const fontSize = this._settings.fontSize * precision;
        // const offsetY = this._settings.offsetY === null ? null : (this._settings.offsetY * precision);
        const lineHeight = this._settings.lineHeight * precision || fontSize;
        const w = this._settings.w != 0 ? this._settings.w * precision : 2048 / precision;
        // const h = this._settings.h * precision;
        const wordWrapWidth = this._settings.wordWrapWidth * precision;
        const cutSx = this._settings.cutSx * precision;
        const cutEx = this._settings.cutEx * precision;
        const cutSy = this._settings.cutSy * precision;
        const cutEy = this._settings.cutEy * precision;
        const letterSpacing = this._settings.letterSpacing || 0;

        // Set font properties.
        renderInfo.baseFont = this.setFontProperties();

        renderInfo.w = w;
        renderInfo.width = w;
        renderInfo.text = this._settings.text;
        renderInfo.precision = precision;
        renderInfo.fontSize = fontSize;
        renderInfo.lineHeight = lineHeight;
        renderInfo.letterSpacing = letterSpacing;
        renderInfo.textAlign = this._settings.textAlign;
        renderInfo.textColor = this._settings.textColor;
        renderInfo.verticalAlign = this._settings.verticalAlign;
        renderInfo.highlight = this._settings.highlight;
        renderInfo.highlightColor = this._settings.highlightColor;
        renderInfo.highlightHeight = this._settings.highlightHeight;
        renderInfo.highlightPaddingLeft = this._settings.highlightPaddingLeft;
        renderInfo.highlightPaddingRight = this._settings.highlightPaddingRight;
        renderInfo.highlightOffset = this._settings.highlightOffset;
        renderInfo.paddingLeft = this._settings.paddingLeft;
        renderInfo.paddingRight = this._settings.paddingRight;
        renderInfo.maxLines = this._settings.maxLines;
        renderInfo.maxLinesSuffix = this._settings.maxLinesSuffix;
        renderInfo.textOverflow = this._settings.textOverflow;
        renderInfo.wordWrap = this._settings.wordWrap;
        renderInfo.wordWrapWidth = wordWrapWidth;
        renderInfo.shadow = this._settings.shadow;
        renderInfo.shadowColor = this._settings.shadowColor;
        renderInfo.shadowOffsetX = this._settings.shadowOffsetX;
        renderInfo.shadowOffsetY = this._settings.shadowOffsetY;
        renderInfo.shadowBlur = this._settings.shadowBlur;
        renderInfo.cutSx = cutSx;
        renderInfo.cutEx = cutEx;
        renderInfo.cutSy = cutSy;
        renderInfo.cutEy = cutEy;
        renderInfo.textIndent = this._settings.textIndent * precision;
        renderInfo.wordBreak = this._settings.wordBreak;

        let text = renderInfo.text;
        let wrapWidth = renderInfo.wordWrap ? (renderInfo.wordWrapWidth || renderInfo.width) : renderInfo.width;

        // Text overflow
        if (renderInfo.textOverflow && !renderInfo.wordWrap) {
            let suffix;
            switch (this._settings.textOverflow) {
                case 'clip':
                    suffix = '';
                    break;
                case 'ellipsis':
                    suffix = this._settings.maxLinesSuffix;
                    break;
                default:
                    suffix = this._settings.textOverflow;
            }
            text = this.wrapWord(text, wordWrapWidth || renderInfo.w, suffix);
        }

        text = this.tokenize(text);
        text = this.parse(text);
        text = this.measure(text, letterSpacing);

        if (renderInfo.textIndent) {
            text = this.indent(text, renderInfo.textIndent);
        }

        if (renderInfo.wordBreak) {
            text = text.reduce((acc, t) => acc.concat(this.wordBreak(t, wrapWidth, renderInfo.baseFont)), [])
            this.resetFontStyle()
        }

        // Calculate detailed drawing information
        let x = paddingLeft;
        let lineNo = 0;

        for (const t of text) {
            // Wrap text
            if (renderInfo.wordWrap && x + t.width > wrapWidth || t.text == '\n') {
                x = paddingLeft;
                lineNo += 1;
            }
            t.lineNo = lineNo;

            if (t.text == '\n') {
                continue;
            }

            t.x = x;
            x += t.width;
        }
        renderInfo.lineNum = lineNo + 1;

        // Vertical align
        let vaOffset = 0;
        if (renderInfo.verticalAlign == 'middle') {
            vaOffset += (renderInfo.lineHeight - renderInfo.fontSize) / 2;
        } else if (this._settings.verticalAlign == 'bottom') {
            vaOffset += renderInfo.lineHeight - renderInfo.fontSize;
        }

        // Calculate lines information
        renderInfo.lines = []
        for (let i = 0; i < renderInfo.lineNum; i++) {
            renderInfo.lines[i] = {
                width: 0,
                x: 0,
                y: renderInfo.lineHeight * i + vaOffset,
                text: [],
            }
        }

        for (let t of text) {
            renderInfo.lines[t.lineNo].text.push(t);
        }

        // Filter out white spaces at beginning and end of each line
        for (const l of renderInfo.lines) {
            if (l.text.length == 0) {
                continue;
            }

            const firstWord = l.text[0].text;
            const lastWord = l.text[l.text.length - 1].text;

            if (firstWord == '\n') {
                l.text.shift();
            }
            if (lastWord == ' ' || lastWord == '\n') {
                l.text.pop();
            }
        }


        // Calculate line width
        for (let l of renderInfo.lines) {
            l.width = l.text.reduce((acc, t) => acc + t.width, 0);
        }

        renderInfo.width = this._settings.w != 0 ? this._settings.w * precision : Math.max(...renderInfo.lines.map((l) => l.width)) + paddingRight;
        renderInfo.w = renderInfo.width;

        // Apply maxLinesSuffix
        if (renderInfo.maxLines && renderInfo.lineNum > renderInfo.maxLines && renderInfo.maxLinesSuffix) {
            const index = renderInfo.maxLines - 1;
            let lastLineText = text.filter((t) => t.lineNo == index);
            let suffix = renderInfo.maxLinesSuffix;
            suffix = this.tokenize(suffix);
            suffix = this.parse(suffix);
            suffix = this.measure(suffix, renderInfo.letterSpacing)[0];
            suffix.lineNo = index;
            lastLineText.push(suffix)

            let _w = lastLineText.reduce((acc, t) => acc + t.width, 0);
            while (_w > renderInfo.width || lastLineText[lastLineText.length - 2].text == ' ') {
                lastLineText.splice(lastLineText.length - 2, 1);
                _w = lastLineText.reduce((acc, t) => acc + t.width, 0);
                const prev = lastLineText[lastLineText.length - 2]
                suffix.x = prev.x + prev.width;
            }

            renderInfo.lines[index].text = lastLineText;
            renderInfo.lines[index].width = _w;
        }

        if (this._settings.h) {
            renderInfo.h = this._settings.h;
        } else if (renderInfo.maxLines && renderInfo.maxLines < renderInfo.lineNum) {
            renderInfo.h = renderInfo.maxLines * renderInfo.lineHeight + fontSize / 2;
        } else {
            renderInfo.h = renderInfo.lineNum * renderInfo.lineHeight + fontSize / 2;
        }

        // Horizontal alignment offset
        if (renderInfo.textAlign == 'center') {
            for (let l of renderInfo.lines) {
                l.x = (renderInfo.width - l.width - paddingLeft) / 2;
            }
        } else if (renderInfo.textAlign == 'right') {
            for (let l of renderInfo.lines) {
                l.x = renderInfo.width - l.width - paddingLeft;
            }
        }

        return renderInfo;
    }

    _draw() {
        const renderInfo = this._calculateRenderInfo();
        const precision = this.getPrecision();
        const paddingLeft = renderInfo.paddingLeft * precision;

        // Set canvas dimensions
        let canvasWidth = renderInfo.w || renderInfo.width;
        if (renderInfo.cutSx || renderInfo.cutEx) {
            canvasWidth = Math.min(renderInfo.w, renderInfo.cutEx - renderInfo.cutSx);
        }

        let canvasHeight = renderInfo.h;
        if (renderInfo.cutSy || renderInfo.cutEy) {
            canvasHeight = Math.min(renderInfo.h, renderInfo.cutEy - renderInfo.cutSy);
        }

        this._canvas.width = Math.ceil(canvasWidth + this._stage.getOption('textRenderIssueMargin'));
        this._canvas.height = Math.ceil(canvasHeight);

        // Canvas context has been reset.
        this.setFontProperties();

        if (renderInfo.fontSize >= 128) {
            // WpeWebKit bug: must force compositing because cairo-traps-compositor will not work with text first.
            this._context.globalAlpha = 0.01;
            this._context.fillRect(0, 0, 0.01, 0.01);
            this._context.globalAlpha = 1.0;
        }

        // Cut
        if (renderInfo.cutSx || renderInfo.cutSy) {
            this._context.translate(-renderInfo.cutSx, -renderInfo.cutSy);
        }

        // Highlight
        if (renderInfo.highlight) {
            const hlColor = renderInfo.highlightColor || 0x00000000;
            const hlHeight = renderInfo.highlightHeight ? renderInfo.highlightHeight * precision :  renderInfo.fontSize * 1.5;
            const hlOffset = renderInfo.highlightOffset ? renderInfo.highlightOffset * precision : 0;
            const hlPaddingLeft = (renderInfo.highlightPaddingLeft !== null ? renderInfo.highlightPaddingLeft * precision : renderInfo.paddingLeft);
            const hlPaddingRight = (renderInfo.highlightPaddingRight !== null ? renderInfo.highlightPaddingRight * precision : renderInfo.paddingRight);

            this._context.fillStyle = StageUtils.getRgbaString(hlColor);
            const lineNum = renderInfo.maxLines ? Math.min(renderInfo.maxLines, renderInfo.lineNum) : renderInfo.lineNum; 
            for (let i = 0; i < lineNum; i++) {
                const l = renderInfo.lines[i];
                this._context.fillRect(l.x - hlPaddingLeft + paddingLeft, l.y + hlOffset, l.width + hlPaddingLeft + hlPaddingRight, hlHeight);
            }
        }

        // Text shadow.
        let prevShadowSettings = null;
        if (this._settings.shadow) {
            prevShadowSettings = [this._context.shadowColor, this._context.shadowOffsetX, this._context.shadowOffsetY, this._context.shadowBlur];

            this._context.shadowColor = StageUtils.getRgbaString(this._settings.shadowColor);
            this._context.shadowOffsetX = this._settings.shadowOffsetX * precision;
            this._context.shadowOffsetY = this._settings.shadowOffsetY * precision;
            this._context.shadowBlur = this._settings.shadowBlur * precision;
        }

        // Draw text
        const defaultColor = StageUtils.getRgbaString(this._settings.textColor);
        let currentColor = defaultColor;
        this._context.fillStyle = defaultColor;
        for (const line of renderInfo.lines) {
            for (const t of line.text) {
                let lx = 0;

                if (t.text == '\n') {
                    continue;
                }

                if (renderInfo.maxLines && t.lineNo >= renderInfo.maxLines) {
                    continue;
                }

                if (t.color != currentColor) {
                    currentColor = t.color;
                    this._context.fillStyle = currentColor;
                }

                this._context.font = t.fontStyle;

                // Draw with letter spacing
                if (t.letters) {
                    for (let l of t.letters) {
                        const _x = renderInfo.lines[t.lineNo].x + t.x + lx;
                        this._context.fillText(l.text, _x, renderInfo.lines[t.lineNo].y + renderInfo.fontSize);
                        lx += l.width;
                    }
                // Standard drawing
                } else {
                    const _x = renderInfo.lines[t.lineNo].x + t.x;
                    this._context.fillText(t.text, _x, renderInfo.lines[t.lineNo].y + renderInfo.fontSize);
                }
            }
        }

        // Reset text shadow
        if (prevShadowSettings) {
            this._context.shadowColor = prevShadowSettings[0];
            this._context.shadowOffsetX = prevShadowSettings[1];
            this._context.shadowOffsetY = prevShadowSettings[2];
            this._context.shadowBlur = prevShadowSettings[3];
        }

        // Reset cut translation
        if (renderInfo.cutSx || renderInfo.cutSy) {
            this._context.translate(renderInfo.cutSx, renderInfo.cutSy);
        }
 
        // Postprocess renderInfo.lines to be compatible with standard version
        renderInfo.lines = renderInfo.lines.map((l) => l.text.reduce((acc, v) => acc + v.text, ''));
        if (renderInfo.maxLines) {
            renderInfo.lines = renderInfo.lines.slice(0, renderInfo.maxLines);
        }


        this.renderInfo = renderInfo;

    };

    measureText(word, space = 0) {
        if (!space) {
            return this._context.measureText(word).width;
        }
        return word.split('').reduce((acc, char) => {
            return acc + this._context.measureText(char).width + space;
        }, 0);
    }

    tokenize(text) {
        const re =/ |\n|<i>|<\/i>|<b>|<\/b>|<color=0[xX][0-9a-fA-F]{8}>|<\/color>/g
    
        const delimeters = text.match(re) || [];
        const words = text.split(re) || [];
    
        let final = [];
        for (let i = 0; i < words.length; i++) {
            final.push(words[i], delimeters[i])
        }
        final.pop()
        return final.filter((word) => word != '');
    
    }
    
    parse(tokens) {
        let italic = 0;
        let bold = 0;
        let colorStack = [StageUtils.getRgbaString(this._settings.textColor)];
        let color = 0;

        const colorRegexp = /<color=(?<color>0[xX][0-9a-fA-F]{8})/;
    
        return tokens.map((t) => {
            if (t == '<i>') {
                italic += 1;
                t = '';
            } else if (t == '</i>' && italic > 0) {
                italic -= 1;
                t = '';
            } else if (t == '<b>') {
                bold += 1;
                t = '';
            } else if (t == '</b>' && bold > 0) {
                bold -= 1;
                t = '';
            } else if (t == '</color>') {
                if (colorStack.length > 1) {
                    color -= 1;
                    colorStack.pop();
                }
                t = '';
            } else if (colorRegexp.test(t)) {
                colorStack.push(StageUtils.getRgbaString(parseInt(colorRegexp.exec(t).groups['color'])));
                color += 1;
                t = '';
            }

            return {
                text: t,
                italic: italic,
                bold: bold,
                color: colorStack[color],
            }
        })
        .filter((o) => o.text != '');
    }

    applyFontStyle(word, baseFont) {
        let font = baseFont;
        if (word.bold) {
            font = 'bold ' + font;
        }
        if (word.italic) {
            font = 'italic ' + font;
        }
        this._context.font = font
        word.fontStyle = font;
    }

    resetFontStyle(baseFont) {
        this._context.font = baseFont;
    }

    measure(parsed, letterSpacing = 0, baseFont) {
        const ctx = this._context;
        for (const p of parsed) {
            this.applyFontStyle(p, baseFont);
            p.width = this.measureText(p.text, letterSpacing);

            // Letter by letter detail for letter spacing
            if (letterSpacing > 0) {
                p.letters = p.text.split('').map((l) => {return {text: l}});
                for (let l of p.letters) {
                    l.width = this.measureText(l.text, letterSpacing);
                }
            }

        }
        this.resetFontStyle(baseFont);
        return parsed;
    }

    indent(parsed, textIndent) {
        parsed.splice(0, 0, {text: "", width: textIndent});
        return parsed;
    }

    wrapWord(word, wordWrapWidth, suffix) {
        const suffixWidth = this._context.measureText(suffix).width;
        const wordLen = word.length
        const wordWidth = this._context.measureText(word).width;

        /* If word fits wrapWidth, do nothing */
        if (wordWidth <= wordWrapWidth) {
            return word;
        }

        /* Make initial guess for text cuttoff */
        let cutoffIndex = Math.floor((wordWrapWidth * wordLen) / wordWidth);
        let truncWordWidth = this._context.measureText(word.substring(0, cutoffIndex)).width + suffixWidth;

        /* In case guess was overestimated, shrink it letter by letter. */
        if (truncWordWidth > wordWrapWidth) {
            while (cutoffIndex > 0) {
                truncWordWidth = this._context.measureText(word.substring(0, cutoffIndex)).width + suffixWidth;
                if (truncWordWidth > wordWrapWidth) {
                    cutoffIndex -= 1;
                } else {
                    break;
                }
            }

        /* In case guess was underestimated, extend it letter by letter. */
        } else {
            while (cutoffIndex < wordLen) {
                truncWordWidth = this._context.measureText(word.substring(0, cutoffIndex)).width + suffixWidth;
                if (truncWordWidth < wordWrapWidth) {
                    cutoffIndex += 1;
                } else {
                    // Finally, when bound is crossed, retract last letter.
                    cutoffIndex -=1;
                    break;
                }
            }
        }

        /* If wrapWidth is too short to even contain suffix alone, return empty string */
        return word.substring(0, cutoffIndex) + (wordWrapWidth >= suffixWidth ? suffix : '')
    }

    _getBreakIndex(word, width) {
        const wordLen = word.length;
        const wordWidth = this.measureText(word);

        if (wordWidth <= width) {
            return {breakIndex: word.length, truncWordWidth: wordWidth};
        }

        let breakIndex = Math.floor((width * wordLen) / wordWidth);
        let truncWordWidth = this.measureText(word.substring(0, breakIndex))

        /* In case guess was overestimated, shrink it letter by letter. */
        if (truncWordWidth > width) {
            while (breakIndex > 0) {
                truncWordWidth = this.measureText(word.substring(0, breakIndex));
                if (truncWordWidth > width) {
                    breakIndex -= 1;
                } else {
                    break;
                }
            }

        /* In case guess was underestimated, extend it letter by letter. */
        } else {
            while (breakIndex < wordLen) {
                truncWordWidth = this.measureText(word.substring(0, breakIndex));
                if (truncWordWidth < width) {
                    breakIndex += 1;
                } else {
                    // Finally, when bound is crossed, retract last letter.
                    breakIndex -=1;
                    break;
                }
            }
        }
        return {breakIndex, truncWordWidth};

    }

    wordBreak(word, width, baseFont) {
        if (!word.text) {
            return word
        }
        this.applyFontStyle(word, baseFont)
        const parts = [];
        let text = word.text;
        if (!word.letters) {
            while (true) {
                const {breakIndex, truncWordWidth} = this._getBreakIndex(text, width);
                parts.push({...word});
                parts[parts.length - 1].text = text.slice(0, breakIndex);
                parts[parts.length - 1].width = truncWordWidth;

                if (breakIndex === text.length) {
                    break;
                }

                text = text.slice(breakIndex);
            }
        } else {
            let totalWidth = 0;
            let letters = [];
            let breakIndex = 0;
            for (const l of word.letters) {
                if (totalWidth + l.width >= width) {
                    parts.push({...word});
                    parts[parts.length - 1].text = text.slice(0, breakIndex);
                    parts[parts.length - 1].width = totalWidth;
                    parts[parts.length - 1].letters = letters;
                    text = text.slice(breakIndex);
                    totalWidth = 0;
                    letters = [];
                    breakIndex = 0;

                } else {
                    breakIndex += 1;
                    letters.push(l);
                    totalWidth += l.width;
                }
            }

            if (totalWidth > 0) {
                parts.push({...word});
                parts[parts.length - 1].text = text.slice(0, breakIndex);
                parts[parts.length - 1].width = totalWidth;
                parts[parts.length - 1].letters = letters;
            }
        }

        return parts;
    }
}