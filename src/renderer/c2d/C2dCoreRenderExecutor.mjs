import CoreRenderExecutor from "../../tree/core/CoreRenderExecutor.mjs";
import StageUtils from "../../tree/StageUtils.mjs";
import Utils from "../../tree/Utils.mjs";

export default class C2dCoreRenderExecutor extends CoreRenderExecutor {

    init() {
        this._mainRenderTexture = this.ctx.stage.getCanvas();
    }

    _renderQuadOperation(op) {
        let shader = op.shader;

        if (op.length || op.shader.addEmpty()) {
            const target = this._renderTexture || this._mainRenderTexture;
            shader.beforeDraw(op, target);
            shader.draw(op, target);
            shader.afterDraw(op, target);
        }
    }

    _clearRenderTexture() {
        const ctx = this._getContext();

        let clearColor = [0, 0, 0, 0];
        if (this._mainRenderTexture.ctx === ctx) {
            clearColor = this.ctx.stage.getClearColor();
        }

        const renderTexture = ctx.canvas;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        if (!clearColor[0] && !clearColor[1] && !clearColor[2] && !clearColor[3]) {
            ctx.clearRect(0, 0, renderTexture.width, renderTexture.height);
        } else {
            ctx.fillStyle = StageUtils.getRgbaStringFromArray(clearColor);
            // Do not use fillRect because it produces artifacts.
            ctx.globalCompositeOperation = 'copy';
            ctx.beginPath();
            ctx.rect(0, 0, renderTexture.width, renderTexture.height);
            ctx.closePath();
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
        }
    }
    
    _getContext() {
        if (this._renderTexture) {
            return this._renderTexture.ctx;
        } else {
            return this._mainRenderTexture.ctx;
        } 
    }

    _restoreContext() {
        const ctx = this._getContext();
        ctx.restore();
        ctx.save();
        ctx._scissor = null;
    }

    _setScissor(area) {
        const ctx = this._getContext();

        if (!C2dCoreRenderExecutor._equalScissorAreas(ctx.canvas, ctx._scissor, area)) {
            // Clipping is stored in the canvas context state.
            // We can't reset clipping alone so we need to restore the full context.
            this._restoreContext();

            let precision = this.ctx.stage.getRenderPrecision();
            if (area) {
                ctx.beginPath();
                ctx.rect(Math.round(area[0] * precision), Math.round(area[1] * precision), Math.round(area[2] * precision), Math.round(area[3] * precision));
                ctx.closePath();
                ctx.clip();
            }
            ctx._scissor = area;
        }
    }

    static _equalScissorAreas(canvas, area, current) {
        if (!area) {
            area = [0, 0, canvas.width, canvas.height]
        }
        if (!current) {
            current = [0, 0, canvas.width, canvas.height]
        }
        return Utils.equalValues(area, current)
    }

}
