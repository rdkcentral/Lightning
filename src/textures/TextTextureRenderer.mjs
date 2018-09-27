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

    setFontProperties(withPrecision) {
        let ff = this._settings.fontFace;
        let fonts = '"' + (Array.isArray(ff) ? this._settings.fontFace.join('","') : ff) + '"';
        let precision = (withPrecision ? this.getPrecision() : 1);

        this._realFontSize = Math.floor(this._settings.fontSize * precision);
        this._context.font = this._settings.fontStyle + " " + this._realFontSize + "px " + fonts;
        this._context.textBaseline = this._settings.textBaseline;
    };

    draw(noDraw = false) {
        let renderInfo = {};

        // Set font properties.
        this.setFontProperties(false);

        // Total width.
        let width = this._settings.w || (2048 / this.getPrecision());

        // Inner width.
        let innerWidth = width - (this._settings.paddingLeft + this._settings.paddingRight);
        if (innerWidth < 10) {
            width += (10 - innerWidth);
            innerWidth += (10 - innerWidth);
        }

        let wordWrapWidth = this._settings.wordWrapWidth || innerWidth;

        // word wrap
        // preserve original text
        let linesInfo;
        if (this._settings.wordWrap) {
            linesInfo = this.wrapText(this._settings.text, wordWrapWidth);
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
                let al = this.wrapText(usedLines[usedLines.length - 1], wordWrapWidth - w);
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
            let lineWidth = this._context.measureText(lines[i]).width;
            lineWidths.push(lineWidth);
            maxLineWidth = Math.max(maxLineWidth, lineWidth);
        }

        renderInfo.lineWidths = lineWidths;

        if (!this._settings.w) {
            // Auto-set width to max text length.
            width = maxLineWidth + this._settings.paddingLeft + this._settings.paddingRight;
            innerWidth = maxLineWidth;
        }

        // calculate text height
        let lineHeight = this._settings.lineHeight || (this._settings.fontSize);

        let height;
        if (this._settings.h) {
            height = this._settings.h;
        } else {
            height = lineHeight * (lines.length - 1) + 0.5 * this._settings.fontSize + Math.max(lineHeight, this._settings.fontSize) + this._settings.offsetY;
        }

        let offsetY = this._settings.offsetY === null ? this._settings.fontSize : this._settings.offsetY;

        let precision = this.getPrecision();

        renderInfo.w = width * precision;
        renderInfo.h = height * precision;
        renderInfo.lines = lines;
        renderInfo.precision = precision;

        if (!noDraw) {
            if (!width) {
                // To prevent canvas errors.
                width = 1;
            }

            if (!height) {
                // To prevent canvas errors.
                height = 1;
            }

            if (this._settings.cutSx || this._settings.cutEx) {
                width = Math.min(width, this._settings.cutEx - this._settings.cutSx);
            }

            if (this._settings.cutSy || this._settings.cutEy) {
                height = Math.min(height, this._settings.cutEy - this._settings.cutSy);
            }

            // Add extra margin to prevent issue with clipped text when scaling.
            this._canvas.width = Math.ceil(width * precision + this._stage.getOption('textRenderIssueMargin'));
            this._canvas.height = Math.ceil(height * precision);

            // After changing the canvas, we need to reset the properties.
            this.setFontProperties(true);

            if (this._realFontSize >= 128) {
                // WpeWebKit bug: must force compositing because cairo-traps-compositor will not work with text first.
                this._context.globalAlpha = 0.01;
                this._context.fillRect(0, 0, 0.01, 0.01);
                this._context.globalAlpha = 1.0;
            }

            if (this._settings.cutSx || this._settings.cutSy) {
                this._context.translate(-(this._settings.cutSx * precision), -(this._settings.cutSy * precision));
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
                linePositionX += this._settings.paddingLeft;

                drawLines.push({text: lines[i], x: linePositionX * precision, y: linePositionY * precision, w: lineWidths[i] * precision});
            }

            // Highlight.
            if (this._settings.highlight) {
                let color = this._settings.highlightColor || 0x00000000;
                let hlHeight = (this._settings.highlightHeight || this._settings.fontSize * 1.5);
                let offset = (this._settings.highlightOffset !== null ? this._settings.highlightOffset : -0.5 * this._settings.fontSize);
                let paddingLeft = (this._settings.highlightPaddingLeft !== null ? this._settings.highlightPaddingLeft : this._settings.paddingLeft);
                let paddingRight = (this._settings.highlightPaddingRight !== null ? this._settings.highlightPaddingRight : this._settings.paddingRight);

                this._context.fillStyle = StageUtils.getRgbaString(color);
                for (let i = 0; i < drawLines.length; i++) {
                    let drawLine = drawLines[i];
                    this._context.fillRect((drawLine.x - paddingLeft) * precision, (drawLine.y + offset) * precision, (drawLine.w + paddingRight + paddingLeft) * precision, hlHeight * precision);
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
                this._context.fillText(drawLine.text, drawLine.x, drawLine.y);
            }

            if (prevShadowSettings) {
                this._context.shadowColor = prevShadowSettings[0];
                this._context.shadowOffsetX = prevShadowSettings[1];
                this._context.shadowOffsetY = prevShadowSettings[2];
                this._context.shadowBlur = prevShadowSettings[3];
            }

            if (this._settings.cutSx || this._settings.cutSy) {
                this._context.translate(this._settings.cutSx, this._settings.cutSy);
            }
        }

        let canvas = this._canvas;
        return {renderInfo: renderInfo, canvas: canvas};
    };

    /**
     * Applies newlines to a string to have it optimally fit into the horizontal
     * bounds set by the Text object's wordWrapWidth property.
     */
    wrapText(text, wordWrapWidth) {
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
                let wordWidth = this._context.measureText(words[j]).width;
                let wordWidthWithSpace = wordWidth + this._context.measureText(' ').width;
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
    
}

import StageUtils from "../tree/StageUtils.mjs";