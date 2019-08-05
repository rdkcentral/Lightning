import Utils from "../tree/Utils.mjs";
import StageUtils from "../tree/StageUtils.mjs";
import StaticCanvasTexture from "../textures/StaticCanvasTexture.mjs"

export default class Tools {

    static getCanvasTexture(canvasFactory, lookupId) {
        return {type: StaticCanvasTexture, content: {factory: canvasFactory, lookupId: lookupId}}
    }

    static getRoundRect(w, h, radius, strokeWidth, strokeColor, fill, fillColor) {
        if (!Array.isArray(radius)){
            // upper-left, upper-right, bottom-right, bottom-left.
            radius = [radius, radius, radius, radius];
        }

        let factory = (cb, stage) => {
            if (Utils.isSpark) {
                stage.platform.createRoundRect(cb, stage, w, h, radius, strokeWidth, strokeColor, fill, fillColor);
            } else {
                cb(null, this.createRoundRect(stage, w, h, radius, strokeWidth, strokeColor, fill, fillColor));
            }
        };
        let id = 'rect' + [w, h, strokeWidth, strokeColor, fill ? 1 : 0, fillColor].concat(radius).join(",");
        return Tools.getCanvasTexture(factory, id);
    }

    static createRoundRect(stage, w, h, radius, strokeWidth, strokeColor, fill, fillColor) {
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

        return canvas;
    }

    static getShadowRect(w, h, radius = 0, blur = 5, margin = blur * 2) {
        if (!Array.isArray(radius)){
            // upper-left, upper-right, bottom-right, bottom-left.
            radius = [radius, radius, radius, radius];
        }

        let factory = (cb, stage) => {
            if (Utils.isSpark) {
                stage.platform.createShadowRect(cb, stage, w, h, radius, blur, margin);
            } else {
                cb(null, this.createShadowRect(stage, w, h, radius, blur, margin));
            }
        };
        let id = 'shadow' + [w, h, blur, margin].concat(radius).join(",");
        return Tools.getCanvasTexture(factory, id);
    }

    static createShadowRect(stage, w, h, radius, blur, margin) {
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

        return canvas;
    }

    static getSvgTexture(url, w, h) {
        let factory = (cb, stage) => {
            if (Utils.isSpark) {
                stage.platform.createSvg(cb, stage, url, w, h);
            } else {
                this.createSvg(cb, stage, url, w, h);
            }
        };
        let id = 'svg' + [w, h, url].join(",");
        return Tools.getCanvasTexture(factory, id);
    }

    static createSvg(cb, stage, url, w, h) {
        let canvas = stage.platform.getDrawingCanvas();
        let ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;

        let img = new Image();
        img.onload = () => {
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            cb(null, canvas);
        }
        img.onError = (err) => {
            cb(err);
        }
        img.src = url;
    }

}
