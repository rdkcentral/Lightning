/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 Metrological
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


export default class CoreRenderExecutor {

    constructor(ctx) {
        this.ctx = ctx;

        this.renderState = ctx.renderState;

        this.gl = this.ctx.stage.gl;
    }

    destroy() {
        this.ctx = null;
        this.renderState = null;
        this.gl = null;

        delete this.ctx;
        delete this.renderState;
        delete this.gl;
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

