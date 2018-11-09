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
            const white = operation.getWhite(i);
            const stc = operation.getSimpleTc(i);

            //@todo: try to optimize out per-draw transform setting. split translate, transform.
            const precision = this.ctx.stage.getRenderPrecision();
            ctx.setTransform(rc.ta * precision, rc.tc * precision, rc.tb * precision, rc.td * precision, rc.px * precision, rc.py * precision);

            const rect = (tx === this._rectangleTexture);
            const info = {operation, target, index: i, rect};

            if (rect) {
                // Check for gradient.
                if (white) {
                    ctx.fillStyle = 'white';
                } else {
                    this._setColorGradient(ctx, vc);
                }

                ctx.globalAlpha = rc.alpha;
                this._beforeDrawEl(info);
                ctx.fillRect(0, 0, vc.rw, vc.rh);
                this._afterDrawEl(info);
                ctx.globalAlpha = 1.0;
            } else {
                // @todo: set image smoothing based on the texture.

                // @todo: optimize by registering whether identity texcoords are used.
                ctx.globalAlpha = rc.alpha;
                this._beforeDrawEl(info);

                // @todo: test if rounding yields better performance.

                // Notice that simple texture coords can be turned on even though vc._ulx etc are not simple, because
                //  we are rendering a render-to-texture (texcoords were stashed). Same is true for 'white' color btw.
                const sourceX = stc ? 0 : (vc._ulx * tx.w);
                const sourceY = stc ? 0 : (vc._uly * tx.h);
                const sourceW = (stc ? 1 : (vc._brx - vc._ulx)) * tx.w;
                const sourceH = (stc ? 1 : (vc._bry - vc._uly)) * tx.h;

                if (!white) {
                    // @todo: cache the tint texture for better performance.
                    // Use 'tag' and 'retainFrame' for auto-caching without problems.
                    // Tag is a string identifying the texture situation (id, update, sourceW, sourceH, fill gradient).

                    // Draw to intermediate texture with background color/gradient.

                    const tempTexture = this.ctx.allocateRenderTexture(Math.ceil(sourceW), Math.ceil(sourceH), 1);
                    tempTexture.ctx.clearRect(0, 0, tempTexture.w, tempTexture.h);

                    const alphaMixRect = (vc._colorUl < 0xFF000000) || (vc._colorUr < 0xFF000000) || (vc._colorBl < 0xFF000000) || (vc._colorBr < 0xFF000000);

                    if (alphaMixRect) {
                        // The background image must be fully opacit for consistent results.
                        // Semi-transparent tinting over a semi-transparent texture is NOT supported.
                        // It would only be possible using per-pixel manipulation and that's simply too slow.

                        tempTexture.ctx.drawImage(tx, sourceX, sourceY, sourceW, sourceH, 0, 0, sourceW, sourceH);
                        tempTexture.ctx.globalCompositeOperation = 'multiply';
                        this._setColorGradient(tempTexture.ctx, vc, sourceW, sourceH, false);
                        tempTexture.ctx.fillRect(0, 0, sourceW, sourceH);

                        // Alpha-mix the texture.
                        this._setColorGradient(tempTexture.ctx, vc, sourceW, sourceH, true);
                        tempTexture.ctx.globalCompositeOperation = 'destination-in';
                        tempTexture.ctx.fillRect(0, 0, sourceW, sourceH);
                    } else {
                        this._setColorGradient(tempTexture.ctx, vc, sourceW, sourceH, false);
                        tempTexture.ctx.fillRect(0, 0, sourceW, sourceH);
                        tempTexture.ctx.globalCompositeOperation = 'multiply';
                        tempTexture.ctx.drawImage(tx, sourceX, sourceY, sourceW, sourceH, 0, 0, sourceW, sourceH);

                        // Alpha-mix the texture.
                        tempTexture.ctx.globalCompositeOperation = 'destination-in';
                        tempTexture.ctx.drawImage(tx, sourceX, sourceY, sourceW, sourceH, 0, 0, sourceW, sourceH);
                    }

                    // Actually draw result.
                    tempTexture.ctx.globalCompositeOperation = 'source-over';
                    ctx.fillStyle = 'white';
                    ctx.drawImage(tempTexture, 0, 0, sourceW, sourceH, 0, 0, vc.rw, vc.rh);

                    this.ctx.releaseRenderTexture(tempTexture);
                } else {
                    ctx.drawImage(tx, sourceX, sourceY, sourceW, sourceH, 0, 0, vc.rw, vc.rh);
                }
                this._afterDrawEl(info);
                ctx.globalAlpha = 1.0;
            }
        }
    }

    _setColorGradient(ctx, vc, w = vc.rw, h = vc.rh, transparency = true) {
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
                    gradient = ctx.createLinearGradient(0, 0, 0, h);
                    if (transparency) {
                        gradient.addColorStop(0, StageUtils.getRgbaString(vc._colorUl));
                        gradient.addColorStop(1, StageUtils.getRgbaString(vc._colorBl));
                    } else {
                        gradient.addColorStop(0, StageUtils.getRgbString(vc._colorUl));
                        gradient.addColorStop(1, StageUtils.getRgbString(vc._colorBl));

                    }
                }
            } else {
                // Not supported gradient.
            }
        } else {
            if (vc._colorUl === vc._colorBl && vc._colorUr === vc._colorBr) {
                // Horizontal gradient.
                gradient = ctx.createLinearGradient(0, 0, w, 0);
                if (transparency) {
                    gradient.addColorStop(0, StageUtils.getRgbaString(vc._colorUl));
                    gradient.addColorStop(1, StageUtils.getRgbaString(vc._colorBr));
                } else {
                    gradient.addColorStop(0, StageUtils.getRgbString(vc._colorUl));
                    gradient.addColorStop(1, StageUtils.getRgbString(vc._colorBr));
                }
            }
        }

        ctx.fillStyle = (gradient || StageUtils.getRgbaString(color));
    }

    _beforeDrawEl(info) {
    }

    _afterDrawEl(info) {
    }

}
