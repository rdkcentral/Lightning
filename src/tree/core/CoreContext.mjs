
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
    }

    get usedMemory() {
        return this._usedMemory;
    }

    destroy() {
        this._renderTexturePool.forEach(texture => this._freeRenderTexture(texture));
        this._usedMemory = 0;
    }

    hasRenderUpdates() {
        return !!this.root._parent._hasRenderUpdates;
    }

    frame() {
        this.update();

        // Due to the boundsVisibility flag feature (and onAfterUpdate hook), it is possible that other views were
        // changed during the update loop (for example due to the txLoaded event). We process these changes immediately
        // (but not recursively to prevent infinite loops).
        if (this.root._hasUpdates) {
            this.update();
        }

        const n = this._zSorts.length;
        if (n) {
            // Forced z-sorts (ViewCore may force a z-sort in order to free memory/prevent memory leakd).
            for (let i = 0, n = this._zSorts.length; i < n; i++) {
                if (this._zSorts[i].zSort) {
                    this._zSorts[i].sortZIndexedChildren();
                }
            }
            this._zSorts = [];
        }

        // Clear flag to identify if anything changes before the next frame.
        this.root._parent._hasRenderUpdates = 0;

        this.render();

        return true;
    }

    update() {
        this.updateTreeOrder = 0;

        this.root.update();
    }

    render() {
        // Obtain a sequence of the quad operations.
        this.renderState.reset();
        this.root.render();
        this.renderState.finish();

        // Now run them with the render executor.
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

    forceZSort(viewCore) {
        this._zSorts.push(viewCore);
    }

}
