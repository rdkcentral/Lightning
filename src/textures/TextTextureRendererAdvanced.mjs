/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 RDK Management
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
        this._context.font = Utils.isSpark ? this._stage.platform.getFontSetting(this) : this._getFontSetting();
        this._context.textBaseline = this._settings.textBaseline;
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
        const offsetY = this._settings.offsetY === null ? null : (this._settings.offsetY * precision);
        const lineHeight = this._settings.lineHeight * precision || fontSize;
        const w = this._settings.w != 0 ? this._settings.w * precision : 2048 / precision;
        const h = this._settings.h * precision;
        const wordWrapWidth = this._settings.wordWrapWidth * precision;
        const cutSx = this._settings.cutSx * precision;
        const cutEx = this._settings.cutEx * precision;
        const cutSy = this._settings.cutSy * precision;
        const cutEy = this._settings.cutEy * precision;
        const letterSpacing = this._settings.letterSpacing || 0;

        // Set font properties.
        this.setFontProperties();

        // calculate text width
        // for (let i = 0; i < lines.length; i++) {
        //     let lineWidth = this.measureText(lines[i], letterSpacing);
        // }

 
        let text = this._settings.text;
        console.log('text_internal', text);
        text = this.tokenize(text);
        text = this.parse(text);
        text = this.measure(text, letterSpacing);

        renderInfo.text = text;
        renderInfo.w = w;
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

        // Calculate detailed drawing information
        let x = paddingLeft;

        // Vertical align
        let vaOffset = 0;
        if (renderInfo.verticalAlign == 'middle') {
            vaOffset += (renderInfo.lineHeight - renderInfo.fontSize * precision) / 2;
        } else if (this._settings.verticalAlign == 'bottom') {
            vaOffset += renderInfo.lineHeight - renderInfo.fontSize * precision;
        }

        let lineNo = 0;
        for (const t of renderInfo.text) {
            // Wrap text
            if (x + t.width > renderInfo.w || t.text == '\n') {
                x = paddingLeft;
                lineNo += 1;
            }
            t.lineNo = lineNo;

            if (t.text == '\n') {
                continue;
            }

            t.x = x;

            // Letter by letter detail for letter spacing
            if (renderInfo.letterSpacing) {
                t.letters = t.text.split('').map((l) => {return {text: l}});
                let _x = x;
                for (let l of t.letters) {
                    l.x = _x;
                    _x += this.measureText(l.text, renderInfo.letterSpacing);
                }
            }
            x += t.width;
        }
        renderInfo.lineNum = lineNo + 1;

        // Calculate lines information
        renderInfo.lines = []
        for (let i = 0; i < renderInfo.lineNum; i++) {
            renderInfo.lines[i] = {
                width: 0,
                x: 0,
                y: renderInfo.lineHeight * i + vaOffset,
            }
        }

        for (let t of renderInfo.text) {
            renderInfo.lines[t.lineNo].width += t.width;
        }

        // Horizontal alignment offset
        if (renderInfo.textAlign == 'center') {
            for (let l of renderInfo.lines) {
                l.x = (renderInfo.w - l.width) / 2 - paddingLeft;
            }
        } else if (renderInfo.textAlign == 'right') {
            for (let l of renderInfo.lines) {
                l.x = renderInfo.w - l.width - paddingLeft;
            }
        }

        renderInfo.h = (renderInfo.maxLines ? renderInfo.maxLines : renderInfo.lineNum)  * renderInfo.lineHeight;
        renderInfo.w = this._settings.w != 0 ? this._settings.w : Math.max(...renderInfo.lines.map((l) => l.width)) + paddingRight;

        return renderInfo;
    }

    _draw() {
        const renderInfo = this._calculateRenderInfo();
        const precision = this.getPrecision();
        const paddingLeft = renderInfo.paddingLeft * precision;

        // Set canvas dimension
        this._canvas.width = Math.ceil(renderInfo.w + this._stage.getOption('textRenderIssueMargin'));
        this._canvas.height = Math.ceil(renderInfo.h);

        // Canvas context has been reset.
        this.setFontProperties();

        this._context.fillStyle = StageUtils.getRgbaString(this._settings.textColor);

        // Highlight
        if (renderInfo.highlight) {
            const hlColor = renderInfo.highlightColor || 0x00000000;
            const hlHeight = renderInfo.highlightHeight ? renderInfo.highlightHeight * precision :  renderInfo.fontSize * 1.5;
            const hlOffset = renderInfo.highlightOffset ? renderInfo.highlightOffset * precision : 0;
            const hlPaddingLeft = (renderInfo.highlightPaddingLeft !== null ? renderInfo.highlightPaddingLeft * precision : renderInfo.paddingLeft);
            const hlPaddingRight = (renderInfo.highlightPaddingRight !== null ? renderInfo.highlightPaddingRight * precision : renderInfo.paddingRight);

            this._context.fillStyle = StageUtils.getRgbaString(hlColor);
            for (let i = 0; i < renderInfo.lines.length; i++) {
                const l = renderInfo.lines[i];
                if (renderInfo.maxLines && i >= renderInfo.maxLines) {
                    continue;
                }
                this._context.fillRect(l.x - hlPaddingLeft + paddingLeft, l.y + hlOffset, l.width + hlPaddingLeft + hlPaddingRight, hlHeight);
            }
        }

        for (const t of renderInfo.text) {

            if (t.text == '\n') {
                continue;
            }

            if (renderInfo.maxLines && t.lineNo >= renderInfo.maxLines) {
                continue;
            }

            this._context.font = t.fontStyle;

            // Draw with letter spacing
            this._context.fillStyle = StageUtils.getRgbaString(renderInfo.textColor);
            if (t.letters) {
                for (let l of t.letters) {
                    const _x = renderInfo.lines[t.lineNo].x + l.x;
                    this._context.fillText(l.text, _x, renderInfo.lines[t.lineNo].y + renderInfo.fontSize);
                }
            // Standard drawing
            } else {
                const _x = renderInfo.lines[t.lineNo].x + t.x;
                this._context.fillText(t.text, _x, renderInfo.lines[t.lineNo].y + renderInfo.fontSize);
            }
        }

        console.log('render_info', renderInfo);
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
        const re =/ |\n|<i>|<\/i>|<b>|<\/b>/g
    
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
            }
            return {
                'text': t,
                'italic': italic,
                'bold': bold,
            }
        })
        .filter((o) => o.text != '');
    }

    measure(parsed, letterSpacing = 0) {
        const ctx = this._context;
        const baseFont = ctx.font;
        for (const p of parsed) {
            ctx.font = baseFont;
            if (p.bold) {
                ctx.font = 'bold '+ ctx.font;
            }
            if (p.italic) {
                ctx.font = 'italic ' + ctx.font;
            }
            p.width = this.measureText(p.text, letterSpacing);
            p.fontStyle = ctx.font;
        }
        return parsed;
    }
}