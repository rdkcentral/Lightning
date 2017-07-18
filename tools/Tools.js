let Utils = require('../src/core/Utils');

class Tools {
    
    static getRoundRect(stage, w, h, radius, strokeWidth, strokeColor, fill, fillColor) {
        if (fill === undefined) fill = true;
        if (strokeWidth === undefined) strokeWidth = 0;

        let canvas = stage.adapter.getDrawingCanvas();
        let ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;

        let id = 'rect' + [w, h, radius, strokeWidth, strokeColor, fill ? 1 : 0, fillColor].join(",");
        return stage.texture(function(cb) {
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
                    fillColor = "#" + fillColor.toString(16);
                }
                ctx.fillStyle = fillColor || "white";
                ctx.fill();
            }

            if (strokeWidth) {
                if (Utils.isNumber(strokeColor)) {
                    strokeColor = "#" + strokeColor.toString(16);
                }
                ctx.strokeStyle = strokeColor || "white";
                ctx.lineWidth = strokeWidth;
                ctx.stroke();
            }

            let options = {};
            let data = canvas;
            if (Utils.isNode) {
                data = canvas.toBuffer('raw');
                options.w = canvas.width;
                options.h = canvas.height;
                options.premultiplyAlpha = false;
                options.flipBlueRed = true;
            }
            cb(null, data, options);
        }, {id: id});
    }
}

module.exports = Tools;
