
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
        let fops = this.renderState.filterOperations;

        let i = 0, j = 0, n = qops.length, m = fops.length;
        while (i < n) {
            while (j < m && i === fops[j].beforeQuadOperation) {
                if (this._quadOperation) {
                    this._execQuadOperation(this._quadOperation);
                }
                this._execFilterOperation(fops[j]);
                j++;
            }

            this._processQuadOperation(qops[i]);
            i++;
        }

        if (this._quadOperation) {
            this._execQuadOperation(this._quadOperation);
        }

        while (j < m) {
            this._execFilterOperation(fops[j]);
            j++;
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
        let shader = quadOperation.shader;
        this._useShaderProgram(shader, quadOperation);
    }

    _execQuadOperation(op) {
        this._renderQuadOperation(op);
        this._quadOperation = null;
    }

    _renderQuadOperation(op) {
    }

    _execFilterOperation(filterOperation) {
        this._renderFilterOperation(filterOperation)
    }

    _renderFilterOperation(op) {
    }

}
