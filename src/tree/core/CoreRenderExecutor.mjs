
export default class CoreRenderExecutor {

    constructor(ctx) {
        this.ctx = ctx;

        this.renderState = ctx.renderState;

        this.gl = this.ctx.stage.gl;
    }

    destroy() {
    }

    _reset() {
        this._quadOperation = null;
    }

    execute() {
        this._reset();

        let qops = this.renderState.quadOperations;

        let i = 0, j = 0, n = qops.length;
        while (i < n) {
            this._processQuadOperation(qops[i]);
            i++;
        }

        if (this._quadOperation) {
            this._execQuadOperation(this._quadOperation);
        }
    }

    _processQuadOperation(quadOperation) {
        if (quadOperation.renderTextureInfo && quadOperation.renderTextureInfo.ignore) {
            // Ignore quad operations when we are 're-using' another texture as the render texture result.
            return;
        }

        if (this._quadOperation) {
            this._execQuadOperation(this._quadOperation);
        }

        this._setupQuadOperation(quadOperation);

        this._quadOperation = quadOperation;
    }

    _setupQuadOperation(quadOperation) {
    }

    _execQuadOperation(op) {
        this._renderQuadOperation(op);
        this._quadOperation = null;
    }

    _renderQuadOperation(op) {
    }

}
