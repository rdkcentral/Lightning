/**
 * Copyright Metrological, 2017
 */
let Utils = require('../core/Utils');
let StageUtils = require('../core/StageUtils');

class Tools {

    static getSvgTexture(stage, url, w, h, texOptions = {}) {
        texOptions.id = texOptions.id || 'svg' + [w, h, url].join(",");

        return stage.texture(function(cb) {
            let canvas = stage.adapter.getDrawingCanvas();
            let ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;

            let img = new Image()
            img.onload = () => {
                canvas.width = w
                canvas.height = h
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                let info = Tools.convertCanvas(canvas)
                cb(null, info.data, info.options)
            }
            img.onError = (err) => {
                cb(err)
            }
            img.src = url
        }, texOptions)
    }

    static convertCanvas(canvas) {
        let data = canvas
        let options = {}
        if (Utils.isNode) {
            data = canvas.toBuffer('raw');
            options.w = canvas.width;
            options.h = canvas.height;
            options.premultiplyAlpha = false;
            options.flipBlueRed = true;
        }
        return {data: data, options: options}
    }

    static getCanvasTexture(stage, canvasFactory, texOptions = {}) {
        return stage.texture(function(cb) {
            const info = Tools.convertCanvas(canvasFactory())
            cb(null, info.data, info.options);
        }, texOptions);
    }

    static getRoundRect(stage, w, h, radius, strokeWidth, strokeColor, fill, fillColor) {
        let factory = () => {
            return this.createRoundRect(stage, w, h, radius, strokeWidth, strokeColor, fill, fillColor)
        }
        let id = 'rect' + [w, h, radius, strokeWidth, strokeColor, fill ? 1 : 0, fillColor].join(",");
        return Tools.getCanvasTexture(stage, factory, {id: id});
    }

    static createRoundRect(stage, w, h, radius, strokeWidth, strokeColor, fill, fillColor) {
        if (fill === undefined) fill = true;
        if (strokeWidth === undefined) strokeWidth = 0;

        let canvas = stage.adapter.getDrawingCanvas();
        let ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;

        canvas.width = w + strokeWidth + 2;
        canvas.height = h + strokeWidth + 2;

        ctx.beginPath();
        let x = 0.5 * strokeWidth + 1, y = 0.5 * strokeWidth + 1;
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.arcTo(x + w, y, x + w, y + radius, radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
        ctx.lineTo(x + radius, y + h);
        ctx.arcTo(x, y + h, x, y + h - radius, radius);
        ctx.lineTo(x, y + radius);
        ctx.arcTo(x, y, x + radius, y, radius);

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

        return canvas;
    }

    static getShadowRect(stage, w, h, blur = 5, margin = blur * 2) {
        let factory = () => {
            return this.createShadowRect(stage, w, h, blur, margin)
        }
        let id = 'rect' + [w, h, blur, margin].join(",");
        return Tools.getCanvasTexture(stage, factory, {id: id});
    }

    static createShadowRect(stage, w, h, blur, margin) {
        let canvas = stage.adapter.getDrawingCanvas();
        let ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;

        canvas.width = w + margin * 2;
        canvas.height = h + margin * 2;

        ctx.shadowColor = StageUtils.getRgbaString(0xFFFFFFFF)
        ctx.fillStyle = StageUtils.getRgbaString(0xFFFFFFFF)
        ctx.shadowBlur = blur
        ctx.shadowOffsetX = (w + 10) + margin
        ctx.shadowOffsetY = margin
        ctx.fillRect(-(w + 10), 0, w, h)

        return canvas;
    }

}

module.exports = Tools;
