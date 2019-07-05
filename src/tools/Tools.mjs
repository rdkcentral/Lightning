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
            stage.platform.createRoundRect(cb, stage, w, h, radius, strokeWidth, strokeColor, fill, fillColor);
        };
        let id = 'rect' + [w, h, strokeWidth, strokeColor, fill ? 1 : 0, fillColor].concat(radius).join(",");
        return Tools.getCanvasTexture(factory, id);
    }

    static getShadowRect(w, h, radius = 0, blur = 5, margin = blur * 2) {
        if (!Array.isArray(radius)){
            // upper-left, upper-right, bottom-right, bottom-left.
            radius = [radius, radius, radius, radius];
        }

        let factory = (cb, stage) => {
            stage.platform.createShadowRect(cb, stage, w, h, radius, blur, margin);
        };
        let id = 'shadow' + [w, h, blur, margin].concat(radius).join(",");
        return Tools.getCanvasTexture(factory, id);
    }

    static getSvgTexture(url, w, h) {
        let factory = (cb, stage) => {
            stage.platform.createSvg(cb, stage, url, w, h);
        };
        let id = 'svg' + [w, h, url].join(",");
        return Tools.getCanvasTexture(factory, id);
    }
}
