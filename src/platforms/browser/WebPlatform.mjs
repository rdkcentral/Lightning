import ImageWorker from "./ImageWorker.mjs";

/**
 * Platform-specific functionality.
 * Copyright Metrological, 2017;
 */
export default class WebPlatform {

    init(stage) {
        this.stage = stage;
        this._looping = false;
        this._awaitingLoop = false;

        if (this.stage.getOption("useImageWorker")) {
            if (!window.createImageBitmap || !window.Worker) {
                console.warn("Can't use image worker because browser does not have createImageBitmap and Web Worker support");
            } else {
                console.log('Using image worker!');
                this._imageWorker = new ImageWorker();
            }
        }
    }

    destroy() {
        if (this._imageWorker) {
            this._imageWorker.destroy();
        }
        this._removeKeyHandler();
    }

    startLoop() {
        this._looping = true;
        if (!this._awaitingLoop) {
            this.loop();
        }
    }

    stopLoop() {
        this._looping = false;
    }

    loop() {
        let self = this;
        let lp = function() {
            self._awaitingLoop = false;
            if (self._looping) {
                self.stage.drawFrame();
                requestAnimationFrame(lp);
                self._awaitingLoop = true;
            }
        }
        requestAnimationFrame(lp);
    }

    uploadGlTexture(gl, textureSource, source, options) {
        if (source instanceof ImageData || source instanceof HTMLImageElement || source instanceof HTMLCanvasElement || source instanceof HTMLVideoElement || (window.ImageBitmap && source instanceof ImageBitmap)) {
            // Web-specific data types.
            gl.texImage2D(gl.TEXTURE_2D, 0, options.internalFormat, options.format, options.type, source);
        } else {
            gl.texImage2D(gl.TEXTURE_2D, 0, options.internalFormat, textureSource.w, textureSource.h, 0, options.format, options.type, source);
        }
    }

    loadSrcTexture({src, hasAlpha}, cb) {
        let cancelCb = undefined;
        let isPng = (src.indexOf(".png") >= 0);
        if (this._imageWorker) {
            // WPE-specific image parser.
            const image = this._imageWorker.create(src);
            image.onError = function(err) {
                return cb("Image load error");
            };
            image.onLoad = function({imageBitmap, hasAlphaChannel}) {
                cb(null, {
                    source: imageBitmap,
                    renderInfo: {src: src},
                    hasAlpha: hasAlphaChannel,
                    premultiplyAlpha: true
                });
            };
            cancelCb = function() {
                image.cancel();
            }
        } else {
            let image = new Image();
            if (!(src.substr(0,5) == "data:")) {
                // Base64.
                image.crossOrigin = "Anonymous";
            }
            image.onerror = function(err) {
                // Ignore error message when cancelled.
                if (image.src) {
                    return cb("Image load error");
                }
            };
            image.onload = function() {
                cb(null, {
                    source: image,
                    renderInfo: {src: src},
                    hasAlpha: isPng || hasAlpha
                });
            };
            image.src = src;

            cancelCb = function() {
                image.onerror = null;
                image.onload = null;
                image.removeAttribute('src');
            }
        }

        return cancelCb;
    }

    createRoundRect(cb, stage, w, h, radius, strokeWidth, strokeColor, fill, fillColor) {
        if (fill === undefined) fill = true;
        if (strokeWidth === undefined) strokeWidth = 0;

        let canvas = stage.platform.getDrawingCanvas();
        let ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;

        canvas.width = w + strokeWidth + 2;
        canvas.height = h + strokeWidth + 2;

        ctx.beginPath();
        let x = 0.5 * strokeWidth + 1, y = 0.5 * strokeWidth + 1;

        ctx.moveTo(x + radius[0], y);
        ctx.lineTo(x + w - radius[1], y);
        ctx.arcTo(x + w, y, x + w, y + radius[1], radius[1]);
        ctx.lineTo(x + w, y + h - radius[2]);
        ctx.arcTo(x + w, y + h, x + w - radius[2], y + h, radius[2]);
        ctx.lineTo(x + radius[3], y + h);
        ctx.arcTo(x, y + h, x, y + h - radius[3], radius[3]);
        ctx.lineTo(x, y + radius[0]);
        ctx.arcTo(x, y, x + radius[0], y, radius[0]);
        ctx.closePath();

        if (fill) {
            if (Utils.isNumber(fillColor)) {
                ctx.fillStyle = StageUtils.getRgbaString(fillColor);
            } else {
                ctx.fillStyle = "white";
            }
            ctx.fill();
        }

        if (strokeWidth) {
            if (Utils.isNumber(strokeColor)) {
                ctx.strokeStyle = StageUtils.getRgbaString(strokeColor);
            } else {
                ctx.strokeStyle = "white";
            }
            ctx.lineWidth = strokeWidth;
            ctx.stroke();
        }

        cb(null, canvas);
    }

    createShadowRect(cb, stage, w, h, radius, blur, margin) {
        let canvas = stage.platform.getDrawingCanvas();
        let ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;

        canvas.width = w + margin * 2;
        canvas.height = h + margin * 2;

        // WpeWebKit bug: we experienced problems without this with shadows in noncompositedwebgl mode.
        ctx.globalAlpha = 0.01;
        ctx.fillRect(0, 0, 0.01, 0.01);
        ctx.globalAlpha = 1.0;

        ctx.shadowColor = StageUtils.getRgbaString(0xFFFFFFFF);
        ctx.fillStyle = StageUtils.getRgbaString(0xFFFFFFFF);
        ctx.shadowBlur = blur;
        ctx.shadowOffsetX = (w + 10) + margin;
        ctx.shadowOffsetY = margin;

        ctx.beginPath();
        const x = -(w + 10);
        const y = 0;

        ctx.moveTo(x + radius[0], y);
        ctx.lineTo(x + w - radius[1], y);
        ctx.arcTo(x + w, y, x + w, y + radius[1], radius[1]);
        ctx.lineTo(x + w, y + h - radius[2]);
        ctx.arcTo(x + w, y + h, x + w - radius[2], y + h, radius[2]);
        ctx.lineTo(x + radius[3], y + h);
        ctx.arcTo(x, y + h, x, y + h - radius[3], radius[3]);
        ctx.lineTo(x, y + radius[0]);
        ctx.arcTo(x, y, x + radius[0], y, radius[0]);
        ctx.closePath();
        ctx.fill();

        cb(null, canvas);
    }

    createSvg(cb, stage, url, w, h) {
        let canvas = stage.platform.getDrawingCanvas();
        let ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;

        let img = new Image();
        img.onload = () => {
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            cb(null, canvas);
        };
        img.onError = (err) => {
            cb(err);
        };
        img.src = url;
    }

    createWebGLContext(w, h) {
        let canvas = this.stage.getOption('canvas') || document.createElement('canvas');

        if (w && h) {
            canvas.width = w;
            canvas.height = h;
        }

        let opts = {
            alpha: true,
            antialias: false,
            premultipliedAlpha: true,
            stencil: true,
            preserveDrawingBuffer: false
        };

        let gl = canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl', opts);
        if (!gl) {
            throw new Error('This browser does not support webGL.');
        }

        return gl;
    }

    createCanvasContext(w, h) {
        let canvas = this.stage.getOption('canvas') || document.createElement('canvas');

        if (w && h) {
            canvas.width = w;
            canvas.height = h;
        }

        let c2d = canvas.getContext('2d');
        if (!c2d) {
            throw new Error('This browser does not support 2d canvas.');
        }

        return c2d;
    }

    getHrTime() {
        return window.performance ? window.performance.now() : (new Date()).getTime();
    }

    getDrawingCanvas() {
        // We can't reuse this canvas because textures may load async.
        return document.createElement('canvas');
    }

    getTextureOptionsForDrawingCanvas(canvas) {
        let options = {};
        options.source = canvas;
        return options;
    }

    nextFrame(changes) {
        /* WebGL blits automatically */
    }

    registerKeyHandler(keyhandler) {
        this._keyListener = e => {
            keyhandler(e);
        };
        window.addEventListener('keydown', this._keyListener);
    }

    _removeKeyHandler() {
        if (this._keyListener) {
            window.removeEventListener('keydown', this._keyListener);
        }
    }

    drawText(textTextureRender) {
        let renderInfo = {};

        const precision = textTextureRender.getPrecision();

        let paddingLeft = textTextureRender._settings.paddingLeft * precision;
        let paddingRight = textTextureRender._settings.paddingRight * precision;
        const fontSize = textTextureRender._settings.fontSize * precision;
        let offsetY = textTextureRender._settings.offsetY === null ? null : (textTextureRender._settings.offsetY * precision);
        let lineHeight = textTextureRender._settings.lineHeight * precision;
        const w = textTextureRender._settings.w * precision;
        const h = textTextureRender._settings.h * precision;
        let wordWrapWidth = textTextureRender._settings.wordWrapWidth * precision;
        const cutSx = textTextureRender._settings.cutSx * precision;
        const cutEx = textTextureRender._settings.cutEx * precision;
        const cutSy = textTextureRender._settings.cutSy * precision;
        const cutEy = textTextureRender._settings.cutEy * precision;

        // Set font properties.
        textTextureRender.setFontProperties();

        // Total width.
        let width = w || (2048 / textTextureRender.getPrecision());

        // Inner width.
        let innerWidth = width - (paddingLeft);
        if (innerWidth < 10) {
            width += (10 - innerWidth);
            innerWidth += (10 - innerWidth);
        }

        if (!wordWrapWidth) {
            wordWrapWidth = innerWidth
        }

        // word wrap
        // preserve original text
        let linesInfo;
        if (textTextureRender._settings.wordWrap) {
            linesInfo = this.wrapText(textTextureRender, textTextureRender._settings.text, wordWrapWidth);
        } else {
            linesInfo = {l: textTextureRender._settings.text.split(/(?:\r\n|\r|\n)/), n: []};
            let i, n = linesInfo.l.length;
            for (let i = 0; i < n - 1; i++) {
                linesInfo.n.push(i);
            }
        }
        let lines = linesInfo.l;

        if (textTextureRender._settings.maxLines && lines.length > textTextureRender._settings.maxLines) {
            let usedLines = lines.slice(0, textTextureRender._settings.maxLines);

            let otherLines = null;
            if (textTextureRender._settings.maxLinesSuffix) {
                // Wrap again with max lines suffix enabled.
                let w = textTextureRender._settings.maxLinesSuffix ? textTextureRender._context.measureText(textTextureRender._settings.maxLinesSuffix).width : 0;
                let al = this.wrapText(textTextureRender, usedLines[usedLines.length - 1], wordWrapWidth - w);
                usedLines[usedLines.length - 1] = al.l[0] + textTextureRender._settings.maxLinesSuffix;
                otherLines = [al.l.length > 1 ? al.l[1] : ''];
            } else {
                otherLines = [''];
            }

            // Re-assemble the remaining text.
            let i, n = lines.length;
            let j = 0;
            let m = linesInfo.n.length;
            for (i = textTextureRender._settings.maxLines; i < n; i++) {
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
            let lineWidth = textTextureRender._context.measureText(lines[i]).width;
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
        textTextureRender._canvas.width = Math.ceil(width + textTextureRender._stage.getOption('textRenderIssueMargin'));
        textTextureRender._canvas.height = Math.ceil(height);

        // Canvas context has been reset.
        textTextureRender.setFontProperties();

        if (fontSize >= 128) {
            // WpeWebKit bug: must force compositing because cairo-traps-compositor will not work with text first.
            textTextureRender._context.globalAlpha = 0.01;
            textTextureRender._context.fillRect(0, 0, 0.01, 0.01);
            textTextureRender._context.globalAlpha = 1.0;
        }

        if (cutSx || cutSy) {
            textTextureRender._context.translate(-cutSx, -cutSy);
        }

        let linePositionX;
        let linePositionY;

        let drawLines = [];

        // Draw lines line by line.
        for (let i = 0, n = lines.length; i < n; i++) {
            linePositionX = 0;
            linePositionY = (i * lineHeight) + offsetY;

            if (textTextureRender._settings.textAlign === 'right') {
                linePositionX += (innerWidth - lineWidths[i]);
            } else if (textTextureRender._settings.textAlign === 'center') {
                linePositionX += ((innerWidth - lineWidths[i]) / 2);
            }
            linePositionX += paddingLeft;

            drawLines.push({text: lines[i], x: linePositionX, y: linePositionY, w: lineWidths[i]});
        }

        // Highlight.
        if (textTextureRender._settings.highlight) {
            let color = textTextureRender._settings.highlightColor || 0x00000000;

            let hlHeight = (textTextureRender._settings.highlightHeight * precision || fontSize * 1.5);
            let offset = (textTextureRender._settings.highlightOffset !== null ? textTextureRender._settings.highlightOffset * precision : -0.5 * fontSize);
            const hlPaddingLeft = (textTextureRender._settings.highlightPaddingLeft !== null ? textTextureRender._settings.highlightPaddingLeft * precision : paddingLeft);
            const hlPaddingRight = (textTextureRender._settings.highlightPaddingRight !== null ? textTextureRender._settings.highlightPaddingRight * precision : paddingRight);

            textTextureRender._context.fillStyle = StageUtils.getRgbaString(color);
            for (let i = 0; i < drawLines.length; i++) {
                let drawLine = drawLines[i];
                textTextureRender._context.fillRect((drawLine.x - hlPaddingLeft), (drawLine.y + offset), (drawLine.w + hlPaddingRight + hlPaddingLeft), hlHeight);
            }
        }

        // Text shadow.
        let prevShadowSettings = null;
        if (textTextureRender._settings.shadow) {
            prevShadowSettings = [textTextureRender._context.shadowColor, textTextureRender._context.shadowOffsetX, textTextureRender._context.shadowOffsetY, textTextureRender._context.shadowBlur];

            textTextureRender._context.shadowColor = StageUtils.getRgbaString(textTextureRender._settings.shadowColor);
            textTextureRender._context.shadowOffsetX = textTextureRender._settings.shadowOffsetX * precision;
            textTextureRender._context.shadowOffsetY = textTextureRender._settings.shadowOffsetY * precision;
            textTextureRender._context.shadowBlur = textTextureRender._settings.shadowBlur * precision;
        }

        textTextureRender._context.fillStyle = StageUtils.getRgbaString(textTextureRender._settings.textColor);
        for (let i = 0, n = drawLines.length; i < n; i++) {
            let drawLine = drawLines[i];
            textTextureRender._context.fillText(drawLine.text, drawLine.x, drawLine.y);
        }

        if (prevShadowSettings) {
            textTextureRender._context.shadowColor = prevShadowSettings[0];
            textTextureRender._context.shadowOffsetX = prevShadowSettings[1];
            textTextureRender._context.shadowOffsetY = prevShadowSettings[2];
            textTextureRender._context.shadowBlur = prevShadowSettings[3];
        }

        if (cutSx || cutSy) {
            textTextureRender._context.translate(cutSx, cutSy);
        }

        textTextureRender.renderInfo = renderInfo;
    }

    /**
     * Applies newlines to a string to have it optimally fit into the horizontal
     * bounds set by the Text object's wordWrapWidth property.
     */
    wrapText(textTextureRender, text, wordWrapWidth) {
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
                let wordWidth = textTextureRender._context.measureText(words[j]).width;
                let wordWidthWithSpace = wordWidth + textTextureRender._context.measureText(' ').width;
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

