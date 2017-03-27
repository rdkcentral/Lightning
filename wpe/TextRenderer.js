var isNode = !!(((typeof module !== "undefined") && module.exports));

if (isNode) {
    var Utils = require('./Utils');
}

function TextRenderer(stage, settings) {
    this.stage = stage;

    this.texture = null;

    this.settings = settings;

    this.canvas = null;

    this.context = null;
}

TextRenderer.prototype.getPrecision = function() {
    return (this.settings.precision || this.stage.defaultPrecision || 1);
};

TextRenderer.prototype.setFontProperties = function(withPrecision) {
    var ff = this.settings.fontFace || this.stage.defaultFontFace;
    var fonts = '"' + (Utils.isArray(ff) ? this.settings.fontFace.join('","') : ff) + '"';
    var precision = (withPrecision ? this.getPrecision() : 1);
    this.context.font = this.settings.fontStyle + " " + (this.settings.fontSize * precision) + "px " + fonts;
    this.context.textBaseline = this.settings.textBaseline;
};

TextRenderer.prototype.createCanvas = function() {
    this.canvas = this.stage.adapter.getDrawingCanvas();
    this.context = this.canvas.getContext('2d');
};

TextRenderer.prototype.unlinkCanvas = function() {
    this.canvas = null;
    this.context = null;
};

TextRenderer.prototype.draw = function(noDraw) {
    this.createCanvas();

    var renderInfo = {};

    // Set font properties.
    this.setFontProperties(false);

    // Total width.
    var width = this.settings.w || (2048 / this.getPrecision());

    // Inner width.
    var innerWidth = width - (this.settings.paddingLeft + this.settings.paddingRight);
    if (innerWidth < 10) {
        width += (10 - innerWidth);
        innerWidth += (10 - innerWidth);
    }

    var wordWrapWidth = this.settings.wordWrapWidth || innerWidth;

    // word wrap
    // preserve original text
    var linesInfo;
    if (this.settings.wordWrap) {
        linesInfo = this.wrapText(this.settings.text, wordWrapWidth);
    } else {
        linesInfo = {l: this.settings.text.split(/(?:\r\n|\r|\n)/), n: []};
        var i, n = linesInfo.l.length;
        for (var i = 0; i < n - 1; i++) {
            linesInfo.n.push(i);
        }
    }
    var lines = linesInfo.l;

    if (this.settings.maxLines && lines.length > this.settings.maxLines) {
        var usedLines = lines.slice(0, this.settings.maxLines);

        var otherLines = null;
        if (this.settings.maxLinesSuffix) {
            // Wrap again with max lines suffix enabled.
            var al = this.wrapText(usedLines[usedLines.length - 1] + this.settings.maxLinesSuffix, wordWrapWidth);
            usedLines[usedLines.length - 1] = al.l[0];
            otherLines = [al.l.length > 1 ? al.l[1] : ''];
        } else {
            otherLines = ['']
        }

        // Re-assemble the remaining text.
        var i, n = lines.length;
        var j = 0;
        var m = linesInfo.n.length;
        for (i = this.settings.maxLines; i < n; i++) {
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
    var maxLineWidth = 0;
    var lineWidths = [];
    for (var i = 0; i < lines.length; i++) {
        var lineWidth = this.context.measureText(lines[i]).width;
        lineWidths.push(lineWidth);
        maxLineWidth = Math.max(maxLineWidth, lineWidth);
    }

    renderInfo.lineWidths = lineWidths;

    if (!this.settings.w) {
        // Auto-set width to max text length.
        width = maxLineWidth + this.settings.paddingLeft + this.settings.paddingRight;
        innerWidth = maxLineWidth;
    }

    // calculate text height
    var lineHeight = this.settings.lineHeight || (this.settings.fontSize);

    var height;
    if (this.settings.h) {
        height = this.settings.h;
    } else {
        height = lineHeight * (lines.length - 1) + 0.5 * this.settings.fontSize + Math.max(lineHeight, this.settings.fontSize) + this.settings.offsetY;
    }

    var offsetY = this.settings.offsetY === null ? this.settings.fontSize : this.settings.offsetY;

    var precision = this.getPrecision();

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

        if (this.settings.cutSx || this.settings.cutEx) {
            width = Math.min(width, this.settings.cutEx - this.settings.cutSx);
        }

        if (this.settings.cutSy || this.settings.cutEy) {
            height = Math.min(height, this.settings.cutEy - this.settings.cutSy);
        }

        // Get corrected precision so that text
        this.canvas.width = Math.ceil(width * precision);
        this.canvas.height = Math.ceil(height * precision);

        // After changing the canvas, we need to reset the properties.
        this.setFontProperties(true);

        if (this.settings.cutSx || this.settings.cutSy) {
            this.context.translate(-(this.settings.cutSx * precision), -(this.settings.cutSy * precision));
        }

        var linePositionX;
        var linePositionY;

        var drawLines = [];

        // Draw lines line by line.
        for (i = 0; i < lines.length; i++) {
            linePositionX = 0;
            linePositionY = (i * lineHeight) + offsetY;

            if (this.settings.textAlign === 'right') {
                linePositionX += (innerWidth - lineWidths[i]);
            } else if (this.settings.textAlign === 'center') {
                linePositionX += ((innerWidth - lineWidths[i]) / 2);
            }
            linePositionX += this.settings.paddingLeft;

            drawLines.push({text: lines[i], x: linePositionX * precision, y: linePositionY * precision, w: lineWidths[i] * precision});
        }

        // Highlight.
        if (this.settings.highlight) {
            var color = this.settings.highlightColor || 0x00000000;
            var hlHeight = (this.settings.highlightHeight || this.settings.fontSize * 1.5);
            var offset = (this.settings.highlightOffset !== null ? this.settings.highlightOffset : -0.5 * this.settings.fontSize);
            var paddingLeft = (this.settings.highlightPaddingLeft !== null ? this.settings.highlightPaddingLeft : this.settings.paddingLeft);
            var paddingRight = (this.settings.highlightPaddingRight !== null ? this.settings.highlightPaddingRight : this.settings.paddingRight);

            this.context.fillStyle = StageUtils.getRgbaString(color);
            for (i = 0; i < drawLines.length; i++) {
                var drawLine = drawLines[i];
                this.context.fillRect((drawLine.x - paddingLeft) * precision, (drawLine.y + offset) * precision, (drawLine.w + paddingRight + paddingLeft) * precision, hlHeight * precision);
            }
        }

        // Text shadow.
        var prevShadowSettings = null;
        if (this.settings.shadow) {
            prevShadowSettings = [this.context.shadowColor, this.context.shadowOffsetX, this.context.shadowOffsetY, this.context.shadowBlur];

            this.context.shadowColor = StageUtils.getRgbaString(this.settings.shadowColor);
            this.context.shadowOffsetX = this.settings.shadowOffsetX * precision;
            this.context.shadowOffsetY = this.settings.shadowOffsetY * precision;
            this.context.shadowBlur = this.settings.shadowBlur * precision;
        }

        this.context.fillStyle = StageUtils.getRgbaString(this.settings.textColor);
        for (i = 0; i < drawLines.length; i++) {
            var drawLine = drawLines[i];
            this.context.fillText(drawLine.text, drawLine.x, drawLine.y);
        }

        if (prevShadowSettings) {
            this.context.shadowColor = prevShadowSettings[0];
            this.context.shadowOffsetX = prevShadowSettings[1];
            this.context.shadowOffsetY = prevShadowSettings[2];
            this.context.shadowBlur = prevShadowSettings[3];
        }

        if (this.settings.cutSx || this.settings.cutSy) {
            this.context.translate(this.settings.cutSx, this.settings.cutSy);
        }
    }

    var canvas = this.canvas;
    this.unlinkCanvas();
    return {renderInfo: renderInfo, canvas: canvas};
};

/**
 * Applies newlines to a string to have it optimally fit into the horizontal
 * bounds set by the Text object's wordWrapWidth property.
 */
TextRenderer.prototype.wrapText = function(text, wordWrapWidth) {
    // Greedy wrapping algorithm that will wrap words as the line grows longer
    // than its horizontal bounds.
    var lines = text.split(/\r?\n/g);
    var allLines = [];
    var realNewlines = [];
    for (var i = 0; i < lines.length; i++) {
        var resultLines = [];
        var result = '';
        var spaceLeft = wordWrapWidth;
        var words = lines[i].split(' ');
        for (var j = 0; j < words.length; j++) {
            var wordWidth = this.context.measureText(words[j]).width;
            var wordWidthWithSpace = wordWidth + this.context.measureText(' ').width;
            if (j === 0 || wordWidthWithSpace > spaceLeft) {
                // Skip printing the newline if it's the first word of the line that is
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


if (isNode) {
    module.exports = TextRenderer;
    var StageUtils = require('./StageUtils');
}