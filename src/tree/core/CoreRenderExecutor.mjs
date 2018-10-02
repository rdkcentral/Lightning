
export default class CoreRenderExecutor {

    constructor(ctx) {
        this.ctx = ctx;

        this.renderState = ctx.renderState;

        this.gl = this.ctx.stage.gl;
    }

    destroy() {
    }

    _reset() {
        this._bindRenderTexture(null);
        this._setScissor(null);
        this._clearRenderTexture();
    }

    execute() {
        this._reset();

        let qops = this.renderState.quadOperations;

        let i = 0, j = 0, n = qops.length;
        while (i < n) {
            this._processQuadOperation(qops[i]);
            i++;
        }
    }

    _processQuadOperation(quadOperation) {
        if (quadOperation.renderTextureInfo && quadOperation.renderTextureInfo.ignore) {
            // Ignore quad operations when we are 're-using' another texture as the render texture result.
            return;
        }

        this._setupQuadOperation(quadOperation);
        this._execQuadOperation(quadOperation);

    }

    _setupQuadOperation(quadOperation) {
    }

    _execQuadOperation(op) {
        // Set render texture.
        let nativeTexture = op.renderTextureInfo ? op.renderTextureInfo.nativeTexture : null;

        if (this._renderTexture !== nativeTexture) {
            this._bindRenderTexture(nativeTexture);
        }

        if (op.renderTextureInfo && !op.renderTextureInfo.cleared) {
            this._setScissor(null);
            this._clearRenderTexture();
            op.renderTextureInfo.cleared = true;
            this._setScissor(op.scissor);
        } else {
            this._setScissor(op.scissor);
        }

        this._renderQuadOperation(op);
    }

    _renderQuadOperation(op) {
    }

    _bindRenderTexture(renderTexture) {
        this._renderTexture = renderTexture;
    }

    _clearRenderTexture(renderTexture) {
    }

    _setScissor(area) {
    }

}

