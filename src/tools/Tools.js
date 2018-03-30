/**
 * Copyright Metrological, 2017
 */
let Utils = require('../tree/Utils');
let StageUtils = require('../tree/StageUtils');
const RoundRectTexture = require('../textures/RoundRectTexture')
const CanvasTexture = require('../textures/CanvasTexture')

class Tools {

    static getRoundRect(w, h, radius, strokeWidth, strokeColor, fill, fillColor) {
        return {type: RoundRectTexture, w: w, h: h, radius: radius, strokeWidth: strokeWidth, strokeColor: strokeColor, fill: fill, fillColor: fillColor}
    }

    static getSvgTexture(stage, url, w, h) {
        //@todo: replace
        const id = 'svg' + [w, h, url].join(",");

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
        })
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

    static getCanvasTexture(canvasFactory, lookupId) {
        return {type: CanvasTexture, factory: canvasFactory, lookupId: lookupId}
    }

    static getShadowRect(w, h, radius = 0, blur = 5, margin = blur * 2) {
        if (!Array.isArray(radius)){
            // upper-left, upper-right, bottom-right, bottom-left.
            radius = [radius, radius, radius, radius]
        }

        let factory = (stage) => {
            return this.createShadowRect(stage, w, h, radius, blur, margin)
        }
        let id = 'shadow' + [w, h, blur, margin].concat(radius).join(",");
        return Tools.getCanvasTexture(factory, id);
    }

    static createShadowRect(stage, w, h, radius, blur, margin) {
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

        ctx.beginPath();
        const x = -(w + 10)
        const y = 0

        ctx.moveTo(x + radius[0], y);
        ctx.lineTo(x + w - radius[1], y);
        ctx.arcTo(x + w, y, x + w, y + radius[1], radius[1]);
        ctx.lineTo(x + w, y + h - radius[2]);
        ctx.arcTo(x + w, y + h, x + w - radius[2], y + h, radius[2]);
        ctx.lineTo(x + radius[3], y + h);
        ctx.arcTo(x, y + h, x, y + h - radius[3], radius[3]);
        ctx.lineTo(x, y + radius[0]);
        ctx.arcTo(x, y, x + radius[0], y, radius[0]);
        ctx.fill()

        return canvas;
    }

}

module.exports = Tools;
