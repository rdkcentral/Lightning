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


export default class CoreContext {

    constructor(stage) {
        this.stage = stage;

        this.root = null;

        this.updateTreeOrder = 0;

        this.renderState = this.stage.renderer.createCoreRenderState(this);

        this.renderExec = this.stage.renderer.createCoreRenderExecutor(this);
        this.renderExec.init();

        this._usedMemory = 0;
        this._renderTexturePool = [];

        this._renderTextureId = 1;

        this._zSorts = [];

        this.renderToTextureCount = 0;
    }

    get usedMemory() {
        return this._usedMemory;
    }

    destroy() {
        this._renderTexturePool.forEach(texture => this._freeRenderTexture(texture));
        this._usedMemory = 0;

        this.stage = null;
        this.root = null;

        this.renderState = null;
        this.renderExec = null;
        this._renderTexturePool = null;
        this._zSorts = null;

        delete this.stage;
        delete this.root;
        delete this.renderState;
        delete this.renderExec;
        delete this._renderTexturePool;
        delete this._zSorts;
    }

    hasRenderUpdates() {
        return !!this.root._parent._hasRenderUpdates;
    }

    render() {
        // Clear flag to identify if anything changes before the next frame.
        this.root._parent._hasRenderUpdates = 0;

        this._render();
    }

    update() {
        this._update();

        // Due to the boundsVisibility flag feature (and onAfterUpdate hook), it is possible that other elements were
        // changed during the update loop (for example due to the txLoaded event). We process these changes immediately
        // (but not recursively to prevent infinite loops).
        if (this.root._hasUpdates) {
            this._update();
        }

        this._performForcedZSorts();
    }

    /**
     * Certain ElementCore items may be forced to zSort to strip out references to prevent memleaks..
     */
    _performForcedZSorts() {
        const n = this._zSorts.length;
        if (n) {
            // Forced z-sorts (ElementCore may force a z-sort in order to free memory/prevent memory leaks).
            for (let i = 0, n = this._zSorts.length; i < n; i++) {
                if (this._zSorts[i].zSort) {
                    this._zSorts[i].sortZIndexedChildren();
                }
            }
            this._zSorts = [];
        }
    }

    _update() {
        this.updateTreeOrder = 0;

        this.root.update();
    }

    _render() {
        const debugFrame = this.stage.getOption('debugFrame');
        // Obtain a sequence of the quad operations.
        this._fillRenderState();

        if (this.stage.getOption('readPixelsBeforeDraw')) {
            this._readPixels();
        }

        // Now run them with the render executor.
        this._performRender();

        if (debugFrame) {
            console.log(`[Lightning] RTT Renders in frame: ${this.renderToTextureCount}`)
        }

        // Block OpenGL pipeline to prevent framebuffer flickering
        // on certain devices
        if (this.stage.getOption('readPixelsAfterDraw') &&
            this.renderToTextureCount >= this.stage.getOption('readPixelsAfterDrawThreshold')
        ) {
            if (debugFrame) {
                console.log(`[Lightning] readPixelsAfterDraw behavior triggered`)
            }
            this._readPixels();
        }

        this.renderToTextureCount = 0;
    }

    _readPixels() {
        const pixels = new Uint8Array(4);
        const gl = this.stage.gl;
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    }

    _fillRenderState() {
        this.renderState.reset();
        this.root.render();
        this.renderState.finish();
    }

    _performRender() {
        this.renderExec.execute();
    }

    _addMemoryUsage(delta) {
        this._usedMemory += delta;
        this.stage.addMemoryUsage(delta);
    }

    allocateRenderTexture(w, h) {
        let prec = this.stage.getRenderPrecision();
        let pw = Math.max(1, Math.round(w * prec));
        let ph = Math.max(1, Math.round(h * prec));

        // Search last item first, so that last released render texture is preferred (may cause memory cache benefits).
        const n = this._renderTexturePool.length;
        for (let i = n - 1; i >= 0; i--) {
            const texture = this._renderTexturePool[i];
            // We don't want to reuse the same render textures within the same frame because that will create gpu stalls.
            if (texture.w === pw && texture.h === ph && (texture.update !== this.stage.frameCounter)) {
                texture.f = this.stage.frameCounter;
                this._renderTexturePool.splice(i, 1);
                return texture;
            }
        }

        const texture = this._createRenderTexture(w, h, pw, ph);
        texture.precision = prec;
        return texture;
    }

    releaseRenderTexture(texture) {
        this._renderTexturePool.push(texture);
    }

    freeUnusedRenderTextures(maxAge = 60) {
        // Clean up all textures that are no longer used.
        // This cache is short-lived because it is really just meant to supply running shaders that are
        // updated during a number of frames.
        let limit = this.stage.frameCounter - maxAge;

        this._renderTexturePool = this._renderTexturePool.filter(texture => {
            if (texture.f <= limit) {
                this._freeRenderTexture(texture);
                return false;
            }
            return true;
        });
    }

    _createRenderTexture(w, h, pw, ph) {
        this._addMemoryUsage(pw * ph);

        const texture = this.stage.renderer.createRenderTexture(w, h, pw, ph);
        texture.id = this._renderTextureId++;
        texture.f = this.stage.frameCounter;
        texture.ow = w;
        texture.oh = h;
        texture.w = pw;
        texture.h = ph;

        return texture;
    }

    _freeRenderTexture(nativeTexture) {
        this.stage.renderer.freeRenderTexture(nativeTexture);
        this._addMemoryUsage(-nativeTexture.w * nativeTexture.h);
    }

    copyRenderTexture(renderTexture, nativeTexture, options) {
        this.stage.renderer.copyRenderTexture(renderTexture, nativeTexture, options);
    }

    forceZSort(elementCore) {
        this._zSorts.push(elementCore);
    }

}
