import C2dShader from "../C2dShader.mjs";
import StageUtils from "../../../tree/StageUtils.mjs";

export default class DefaultShader extends C2dShader {

    constructor(ctx) {
        super(ctx);
        this._rectangleTexture = ctx.stage.rectangleTexture.source.nativeTexture
    }

    draw(operation, target) {
        const ctx = target.ctx;
        let length = operation.length;
        for (let i = 0; i < length; i++) {
            const tx = operation.getTexture(i);
            const vc = operation.getViewCore(i);
            const rc = operation.getRenderContext(i);

            //@todo: try to optimize out per-draw transform setting. split translate, transform.
            const precision = this.ctx.stage.getRenderPrecision();
            ctx.setTransform(rc.ta * precision, rc.tc * precision, rc.tb * precision, rc.td * precision, rc.px * precision, rc.py * precision);

            const rect = (tx === this._rectangleTexture);
            const info = {operation, target, index: i, rect};

            if (rect) {
                // Check for gradient.
                let color = vc._colorUl;
                let gradient;
                //@todo: quick single color check.
                //@todo: cache gradient/fill style (if possible, probably context-specific).

                if (vc._colorUl === vc._colorUr) {
                    if (vc._colorBl === vc._colorBr) {
                        if (vc._colorUl === vc.colorBl) {
                            // Single color.
                        } else {
                            // Vertical gradient.
                            gradient = ctx.createLinearGradient(0, 0, 0, vc.rh);
                            gradient.addColorStop(0, StageUtils.getRgbaString(vc._colorUl));
                            gradient.addColorStop(1, StageUtils.getRgbaString(vc._colorBl));
                        }
                    } else {
                        // Not supported gradient.
                    }
                } else {
                    if (vc._colorUl === vc._colorBl && vc._colorUr === vc._colorBr) {
                        // Horizontal gradient.
                        gradient = ctx.createLinearGradient(0, 0, vc.rw, 0);
                        gradient.addColorStop(0, StageUtils.getRgbaString(vc._colorUl));
                        gradient.addColorStop(1, StageUtils.getRgbaString(vc._colorBr));
                    }
                }

                ctx.fillStyle = (gradient || StageUtils.getRgbaString(color));

                info.gradient = gradient;
                info.color = color;
                ctx.globalAlpha = rc.alpha;
                this._beforeDrawEl(info);
                ctx.fillRect(0, 0, vc.rw, vc.rh);
                this._afterDrawEl(info);
                ctx.globalAlpha = 1.0;
            } else {
                // @todo: set image smoothing based on the texture.

                //@todo: optimize by registering whether identity texcoords are used.
                ctx.globalAlpha = rc.alpha;
                this._beforeDrawEl(info);
                //@todo: test if rounding works better.
                ctx.drawImage(tx, vc._ulx * tx.w, vc._uly * tx.h, (vc._brx - vc._ulx) * tx.w, (vc._bry - vc._uly) * tx.h, 0, 0, vc.rw, vc.rh);
                this._afterDrawEl(info);
                ctx.globalAlpha = 1.0;

                //@todo: colorize does not really work the way we want it to.
                // if (vc._colorUl !== 0xFFFFFFFF) {
                //     ctx.globalCompositeOperation = 'multiply';
                //     ctx.fillStyle = StageUtils.getRgbaString(vc._colorUl);
                //     ctx.fillRect(0, 0, vc.rw, vc.rh);
                //     ctx.globalCompositeOperation = 'source-over';
                // }

            }
        }
    }

    _beforeDrawEl(info) {
    }

    _afterDrawEl(info) {
    }

}
