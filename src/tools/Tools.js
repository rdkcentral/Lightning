/**
 * Copyright Metrological, 2017
 */
let Utils = require('../core/Utils');
let StageUtils = require('../core/StageUtils');

class Tools {

    static getCanvasTexture(stage, canvas, texOptions = {}, options = {}) {
        return stage.texture(function(cb) {
            let data = canvas;
            let options = {};
            if (Utils.isNode) {
                data = canvas.toBuffer('raw');
                options.w = canvas.width;
                options.h = canvas.height;
                options.premultiplyAlpha = false;
                options.flipBlueRed = true;
            }
            cb(null, data, options);
        }, texOptions);
    }

    static getRoundRect(stage, w, h, radius, strokeWidth, strokeColor, fill, fillColor) {
        let canvas = this.createRoundRect(stage, w, h, radius, strokeWidth, strokeColor, fill, fillColor)
        let id = 'rect' + [w, h, radius, strokeWidth, strokeColor, fill ? 1 : 0, fillColor].join(",");
        return Tools.getCanvasTexture(stage, canvas, {id: id});
    }

    static createRoundRect(stage, w, h, radius, strokeWidth, strokeColor, fill, fillColor) {
        if (fill === undefined) fill = true;
        if (strokeWidth === undefined) strokeWidth = 0;

        let canvas = stage.adapter.getDrawingCanvas();
        let ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;

        let id = 'rect' + [w, h, radius, strokeWidth, strokeColor, fill ? 1 : 0, fillColor].join(",");
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
}

module.exports = Tools;
