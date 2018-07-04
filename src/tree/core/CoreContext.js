/**
 * Copyright Metrological, 2017
 */

class CoreContext {

    constructor(stage) {
        this.stage = stage

        this.gl = stage.gl

        this.root = null

        this.updateTreeOrder = 0
        this.updateTreeOrderForceUpdate = 0

        this.shaderPrograms = new Map()

        this.renderState = new CoreRenderState(this)

        this.renderExec = new CoreRenderExecutor(this)
        this.renderExec.init()

        this._renderTexturePixels = 0
        this._renderTexturePool = []

        this._renderTextureId = 1

        this._zSorts = []
    }

    destroy() {
        this.shaderPrograms.forEach(shaderProgram => shaderProgram.destroy())
        this._renderTexturePool.forEach(texture => this._freeRenderTexture(texture));
    }

    hasRenderUpdates() {
        return !!this.root._parent._hasRenderUpdates
    }

    frame() {
        this.update()

        // Due to the boundsVisibility flag feature (and onAfterUpdate hook), it is possible that other views were
        // changed during the update loop (for example due to the txLoaded event). We process these changes immediately
        // (but not recursively to prevent infinite loops).
        if (this.root._hasUpdates) {
            this.update()
        }

        const n = this._zSorts.length
        if (n) {
            // Forced z-sorts (ViewCore may force a z-sort in order to free memory/prevent memory leakd).
            for (let i = 0, n = this._zSorts.length; i < n; i++) {
                if (this._zSorts[i].zSort) {
                    this._zSorts[i].sortZIndexedChildren()
                }
            }
            this._zSorts = []
        }

        // Clear flag to identify if anything changes before the next frame.
        this.root._parent._hasRenderUpdates = false

        this.render()

        return true
    }

    update() {
        this.updateTreeOrderForceUpdate = 0
        this.updateTreeOrder = 0

        this.root.update()
    }

    render() {
        // Obtain a sequence of the quad and filter operations.
        this.renderState.reset()
        this.root.render()
        this.renderState.finish()

        // Now run them with the render executor.
        this.renderExec.execute()
    }

    allocateRenderTexture(w, h) {
        let prec = this.stage.getRenderPrecision()
        let aw = Math.max(1, Math.round(w * prec))
        let ah = Math.max(1, Math.round(h * prec))

        for (let i = 0, n = this._renderTexturePool.length; i < n; i++) {
            let texture = this._renderTexturePool[i];
            if (texture.w === aw && texture.h === ah) {
                texture.f = this.stage.frameCounter;
                this._renderTexturePool.splice(i, 1);
                return texture;
            }
        }

        let texture = this._createRenderTexture(aw, ah);

        texture.f = this.stage.frameCounter;
        texture.precision = prec;
        texture.projection = new Float32Array([2/w, 2/h])

        return texture;
    }

    releaseRenderTexture(texture) {
        this._renderTexturePool.push(texture);
    }

    freeUnusedRenderTextures(maxAge = 60) {
        const prevMem = this._renderTexturePixels

        // Clean up all textures that are no longer used.
        // This cache is short-lived because it is really just meant to supply running shaders and filters that are
        // updated during a number of frames.
        let limit = this.stage.frameCounter - maxAge;

        this._renderTexturePool = this._renderTexturePool.filter(texture => {
            if (texture.f <= limit) {
                this._freeRenderTexture(texture);
                return false;
            }
            return true;
        });

        console.warn("GC render texture memory" + (maxAge ? "" : " (aggressive)") + ": " + prevMem + "px > " + this._renderTexturePixels + "px")
    }

    _createRenderTexture(w, h) {
        let gl = this.gl;
        let sourceTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, sourceTexture);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // We need a specific framebuffer for every render texture.
        sourceTexture.framebuffer = gl.createFramebuffer();
        sourceTexture.w = w;
        sourceTexture.h = h;
        sourceTexture.id = this._renderTextureId++

        this._renderTexturePixels += w * h

        if (this._renderTexturePixels > this.stage.getOption('renderTextureMemory')) {
            this.freeUnusedRenderTextures()

            if (this._renderTexturePixels > this.stage.getOption('renderTextureMemory')) {
                this.freeUnusedRenderTextures(0)
            }
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, sourceTexture.framebuffer)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sourceTexture, 0);

        return sourceTexture;
    }

    _freeRenderTexture(glTexture) {
        let gl = this.stage.gl;
        gl.deleteFramebuffer(glTexture.framebuffer);
        gl.deleteTexture(glTexture);

        this._renderTexturePixels -= glTexture.w * glTexture.h
    }

    forceZSort(viewCore) {
        this._zSorts.push(viewCore)
    }

}

module.exports = CoreContext

let CoreRenderState = require('./CoreRenderState')
let CoreRenderExecutor = require('./CoreRenderExecutor')