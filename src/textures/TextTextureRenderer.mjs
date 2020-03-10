import StageUtils from "../tree/StageUtils.mjs";
import Utils from "../tree/Utils.mjs";

export default class TextTextureRenderer {

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

    _draw() {
        let renderInfo = {};

        const precision = this.getPrecision();

        let paddingLeft = this._settings.paddingLeft * precision;
        let paddingRight = this._settings.paddingRight * precision;
        const fontSize = this._settings.fontSize * precision;
        let offsetY = this._settings.offsetY === null ? null : (this._settings.offsetY * precision);
        let lineHeight = this._settings.lineHeight * precision;
        const w = this._settings.w * precision;
        const h = this._settings.h * precision;
        let wordWrapWidth = this._settings.wordWrapWidth * precision;
        const cutSx = this._settings.cutSx * precision;
        const cutEx = this._settings.cutEx * precision;
        const cutSy = this._settings.cutSy * precision;
        const cutEy = this._settings.cutEy * precision;
        const letterSpacing = this._settings.letterSpacing || 0;

        // Set font properties.
        this.setFontProperties();

        // Total width.
        let width = w || (2048 / this.getPrecision());

        // Inner width.
        let innerWidth = width - (paddingLeft);
        if (innerWidth < 10) {
            width += (10 - innerWidth);
            innerWidth += (10 - innerWidth);
        }

        if (!wordWrapWidth) {
            wordWrapWidth = innerWidth
        }

        // Text overflow
        if (this._settings.textOverflow && !this._settings.wordWrap) {
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
            this._settings.text = this.wrapWord(this._settings.text, wordWrapWidth, suffix)
        }

        // word wrap
        // preserve original text
        let linesInfo;
        if (this._settings.wordWrap) {
            linesInfo = this.wrapText(this._settings.text, wordWrapWidth, letterSpacing);
        } else {
            linesInfo = {l: this._settings.text.split(/(?:\r\n|\r|\n)/), n: []};
            let i, n = linesInfo.l.length;
            for (let i = 0; i < n - 1; i++) {
                linesInfo.n.push(i);
            }
        }
        let lines = linesInfo.l;

        if (this._settings.maxLines && lines.length > this._settings.maxLines) {
            let usedLines = lines.slice(0, this._settings.maxLines);

            let otherLines = null;
            if (this._settings.maxLinesSuffix) {
                // Wrap again with max lines suffix enabled.
                let w = this._settings.maxLinesSuffix ? this._context.measureText(this._settings.maxLinesSuffix).width : 0;
                let al = this.wrapText(usedLines[usedLines.length - 1], wordWrapWidth - w, letterSpacing);
                usedLines[usedLines.length - 1] = al.l[0] + this._settings.maxLinesSuffix;
                otherLines = [al.l.length > 1 ? al.l[1] : ''];
            } else {
                otherLines = [''];
            }

            // Re-assemble the remaining text.
            let i, n = lines.length;
            let j = 0;
            let m = linesInfo.n.length;
            for (i = this._settings.maxLines; i < n; i++) {
                otherLines[j] += (otherLines[j] ? " " : "") + lines[i];
                if (i + 1 < m && linesInfo.n[i + 1]) {
                    j++;
                }
            }

            renderInfo.remainingText = otherLines.join("\n");

            renderInfo.moreTextLines = true;

            lines = usedLines;
        } else {
            renderInfo.moreTextLines = false;
            renderInfo.remainingText = "";
        }

        // calculate text width
        let maxLineWidth = 0;
        let lineWidths = [];
        for (let i = 0; i < lines.length; i++) {
            let lineWidth = this.measureText(lines[i], letterSpacing);
            lineWidths.push(lineWidth);
            maxLineWidth = Math.max(maxLineWidth, lineWidth);
        }

        renderInfo.lineWidths = lineWidths;

        if (!w) {
            // Auto-set width to max text length.
            width = maxLineWidth + paddingLeft + paddingRight;
            innerWidth = maxLineWidth;
        }

        // calculate text height
        lineHeight = lineHeight || fontSize;

        let height;
        if (h) {
            height = h;
        } else {
            height = lineHeight * (lines.length - 1) + 0.5 * fontSize + Math.max(lineHeight, fontSize) + offsetY;
        }

        if (offsetY === null) {
            offsetY = fontSize;
        }

        renderInfo.w = width;
        renderInfo.h = height;
        renderInfo.lines = lines;
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

        // Add extra margin to prevent issue with clipped text when scaling.
        this._canvas.width = Math.ceil(width + this._stage.getOption('textRenderIssueMargin'));
        this._canvas.height = Math.ceil(height);

        // Canvas context has been reset.
        this.setFontProperties();

        if (fontSize >= 128) {
            // WpeWebKit bug: must force compositing because cairo-traps-compositor will not work with text first.
            this._context.globalAlpha = 0.01;
            this._context.fillRect(0, 0, 0.01, 0.01);
            this._context.globalAlpha = 1.0;
        }

        if (cutSx || cutSy) {
            this._context.translate(-cutSx, -cutSy);
        }

        let linePositionX;
        let linePositionY;

        let drawLines = [];

        // Draw lines line by line.
        for (let i = 0, n = lines.length; i < n; i++) {
            linePositionX = 0;
            linePositionY = (i * lineHeight) + offsetY;

            if (this._settings.textAlign === 'right') {
                linePositionX += (innerWidth - lineWidths[i]);
            } else if (this._settings.textAlign === 'center') {
                linePositionX += ((innerWidth - lineWidths[i]) / 2);
            }
            linePositionX += paddingLeft;

            drawLines.push({text: lines[i], x: linePositionX, y: linePositionY, w: lineWidths[i]});
        }

        // Highlight.
        if (this._settings.highlight) {
            let color = this._settings.highlightColor || 0x00000000;

            let hlHeight = (this._settings.highlightHeight * precision || fontSize * 1.5);
            const offset = this._settings.highlightOffset * precision;
            const hlPaddingLeft = (this._settings.highlightPaddingLeft !== null ? this._settings.highlightPaddingLeft * precision : paddingLeft);
            const hlPaddingRight = (this._settings.highlightPaddingRight !== null ? this._settings.highlightPaddingRight * precision : paddingRight);

            this._context.fillStyle = StageUtils.getRgbaString(color);
            for (let i = 0; i < drawLines.length; i++) {
                let drawLine = drawLines[i];
                this._context.fillRect((drawLine.x - hlPaddingLeft), (drawLine.y - offsetY + offset), (drawLine.w + hlPaddingRight + hlPaddingLeft), hlHeight);
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

        this._context.fillStyle = StageUtils.getRgbaString(this._settings.textColor);
        for (let i = 0, n = drawLines.length; i < n; i++) {
            let drawLine = drawLines[i];

            if (letterSpacing === 0) {
                this._context.fillText(drawLine.text, drawLine.x, drawLine.y);
            } else {
                const textSplit = drawLine.text.split('');
                let x = drawLine.x;
                for (let i = 0, j = textSplit.length; i < j; i++) {
                    this._context.fillText(textSplit[i], x, drawLine.y);
                    x += this.measureText(textSplit[i], letterSpacing);
                }
            }
        }

        if (prevShadowSettings) {
            this._context.shadowColor = prevShadowSettings[0];
            this._context.shadowOffsetX = prevShadowSettings[1];
            this._context.shadowOffsetY = prevShadowSettings[2];
            this._context.shadowBlur = prevShadowSettings[3];
        }

        if (cutSx || cutSy) {
            this._context.translate(cutSx, cutSy);
        }

        this.renderInfo = renderInfo;
    };

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
        return word.substring(0, cutoffIndex) + (wordWrapWidth >= suffixWidth ? suffix : '');
    }

    /**
     * Applies newlines to a string to have it optimally fit into the horizontal
     * bounds set by the Text object's wordWrapWidth property.
     */
    wrapText(text, wordWrapWidth, letterSpacing) {
        // Greedy wrapping algorithm that will wrap words as the line grows longer.
        // than its horizontal bounds.
        let lines = text.split(/\r?\n/g);
        let allLines = [];
        let realNewlines = [];
        for (let i = 0; i < lines.length; i++) {
            let resultLines = [];
            let result = '';
            let spaceLeft = wordWrapWidth;
            let words = lines[i].split(' ');
            for (let j = 0; j < words.length; j++) {
                const wordWidth = this.measureText(words[j], letterSpacing);
                const wordWidthWithSpace = wordWidth + this.measureText(' ',letterSpacing);
                if (j === 0 || wordWidthWithSpace > spaceLeft) {
                    // Skip printing the newline if it's the first word of the line that is.
                    // greater than the word wrap width.
                    if (j > 0) {
                        resultLines.push(result);
                        result = '';
                    }
                    result += words[j];
                    spaceLeft = wordWrapWidth - wordWidth;
                }
                else {
                    spaceLeft -= wordWidthWithSpace;
                    result += ' ' + words[j];
                }
            }

            if (result) {
                resultLines.push(result);
                result = '';
            }

            allLines = allLines.concat(resultLines);

            if (i < lines.length - 1) {
                realNewlines.push(allLines.length);
            }
        }

        return {l: allLines, n: realNewlines};
    };

    measureText(word, space = 0) {
        if (!space) {
            return this._context.measureText(word).width;
        }
        return word.split('').reduce((acc, char) => {
            return acc + this._context.measureText(char).width + space;
        }, 0);
    }
    
}