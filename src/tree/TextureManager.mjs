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

import TextureSource from "./TextureSource.mjs";
import Stage from './Stage.mjs';

export default class TextureManager {

    constructor(stage) {
        this.stage = stage;

        /**
         * The currently used amount of texture memory.
         * @type {number}
         */
        this._usedMemory = 0;

        /**
         * All uploaded texture sources.
         * @type {TextureSource[]}
         */
        this._uploadedTextureSources = [];

        /**
         * The texture source lookup id to texture source hashmap.
         * @type {Map<String, TextureSource>}
         */
        this.textureSourceHashmap = new Map();

        /**
         * Context-loss generation. Bumped on every invalidation and on
         * destroy so in-flight loader callbacks can discard stale results.
         * @type {number}
         */
        this.contextGeneration = 0;

        /**
         * Sources with an in-flight fetch/decode.
         * @type {Set<TextureSource>}
         */
        this._loadingSources = new Set();

        /**
         * Sources awaiting reload after a context loss. Image-like sources
         * stay queued until the throttled per-frame drain picks them up;
         * cheap sources reload immediately in restoreContext().
         * @type {Set<TextureSource>}
         */
        this._restoreSources = new Set();

    }

    get usedMemory() {
        return this._usedMemory;
    }

    destroy() {
        this.contextGeneration++;
        if (this.stage && this.stage.textureThrottler) {
            this.stage.textureThrottler.clear();
        }
        // Abort in-flight decodes so they cannot upload after teardown,
        // and drop queued restores so dead sources can be collected,
        // including a teardown while the context is lost.
        for (const source of this._loadingSources) {
            source.contextGeneration++;
            source.cancel();
        }
        for (const source of this._restoreSources) {
            source.contextGeneration++;
        }
        this._loadingSources.clear();
        this._restoreSources.clear();

        for (let i = 0, n = this._uploadedTextureSources.length; i < n; i++) {
            this._nativeFreeTextureSource(this._uploadedTextureSources[i]);
        }

        this.textureSourceHashmap.clear();
        this._usedMemory = 0;
    }

    getReusableTextureSource(id) {
        return this.textureSourceHashmap.get(id);
    }

    getTextureSource(func, id) {
        // Check if texture source is already known.
        let textureSource = id ? this.textureSourceHashmap.get(id) : null;
        if (!textureSource) {
            // Create new texture source.
            textureSource = new TextureSource(this, func);

            if (id) {
                textureSource.lookupId = id;
                this.textureSourceHashmap.set(id, textureSource);
            }
        }

        return textureSource;
    }

    trackLoadingSource(textureSource) {
        this._loadingSources.add(textureSource);
    }

    untrackLoadingSource(textureSource) {
        this._loadingSources.delete(textureSource);
    }

    queueRestoreSource(textureSource) {
        this._restoreSources.add(textureSource);
    }

    notifyContextLost() {
        if (this.stage) {
            this.stage.onContextLost();
        }
    }

    _isGlContextLost() {
        const gl = this.stage ? this.stage.gl : null;
        return !!(gl && typeof gl.isContextLost === 'function' && gl.isContextLost());
    }

    /**
     * Drops all GPU-backed and in-flight texture state after a context loss.
     * Native handles are released without GL calls (the browser already
     * discarded them) and nothing is reported as a texture error. Reloadable
     * sources move to the restore queue; result (render-to-texture) sources
     * are simply cleared and re-render on demand.
     */
    invalidateContext() {
        this.contextGeneration++;
        const throttler = this.stage ? this.stage.textureThrottler : null;
        const dropped = throttler ? throttler.clear() : [];

        for (const source of [...this._loadingSources]) {
            source.invalidateContext();
            if (!source.isResultTexture) {
                this._restoreSources.add(source);
            }
        }
        this._loadingSources.clear();

        for (const source of [...this._uploadedTextureSources]) {
            if (source.isResultTexture) {
                source.clearNativeTexture();
                continue;
            }
            source.invalidateContext();
            this._restoreSources.add(source);
        }
        this._uploadedTextureSources = [];

        // Decoded but not yet uploaded: the data is dropped with the dead
        // context, the sources reload through the normal path.
        for (const source of dropped) {
            source.loadingSince = 0;
            source._cancelCb = null;
            source.contextGeneration++;
            if (!source.isResultTexture) {
                this._restoreSources.add(source);
            }
        }
    }

    /**
     * Reloads cheap (non-throttled, canvas-generated) restores immediately.
     * Image-like sources stay queued and stream in through the throttled
     * per-frame drain. Previously evicted sources are left for on-demand
     * load and genuine load errors are not retried.
     */
    restoreContext() {
        for (const source of [...this._restoreSources]) {
            if (source._throttleUploads !== false) {
                continue;
            }
            this._restoreSources.delete(source);
            if (source.loadError) {
                continue;
            }
            if (!source.isUsed() && !source.permanent) {
                continue;
            }
            source.load();
            if (this._isContextSuspended()) {
                break;
            }
        }
    }

    _isContextSuspended() {
        const state = this.stage ? this.stage.contextState : undefined;
        return state !== undefined && state !== 'running';
    }

    hasRestores() {
        return this._restoreSources.size > 0;
    }

    /**
     * Kicks a single queued restore. Returns false when the context became
     * unavailable mid-drain so the throttler stops for this frame.
     */
    processNextRestore() {
        const next = this._restoreSources.values().next();
        if (next.done) {
            return true;
        }
        const source = next.value;
        this._restoreSources.delete(source);
        if (this._isContextSuspended()) {
            this._restoreSources.add(source);
            return false;
        }
        if (source.loadError) {
            return true;
        }
        if (!source.isUsed() && !source.permanent) {
            return true;
        }
        source.load();
        return !this._isContextSuspended();
    }

    uploadTextureSource(textureSource, options) {
        if (textureSource.isLoaded()) return;

        this._addMemoryUsage(textureSource.w * textureSource.h);

        // Load texture.
        const nativeTexture = this._nativeUploadTextureSource(textureSource, options);

        if (this._isGlContextLost()) {
            // The browser discarded the context mid-upload. Drop the dead
            // handle without treating it as a texture error and requeue.
            this._addMemoryUsage(-textureSource.w * textureSource.h);
            textureSource.clearNativeTexture();
            this._restoreSources.add(textureSource);
            this.notifyContextLost();
            return;
        }

        textureSource._nativeTexture = nativeTexture;

        // We attach w and h to native texture (we need it in CoreRenderState._isRenderTextureReusable).
        nativeTexture.w = textureSource.w;
        nativeTexture.h = textureSource.h;

        nativeTexture.update = this.stage.frameCounter;

        this._uploadedTextureSources.push(textureSource);

        this.addToLookupMap(textureSource);

        // add VRAM tracking if using the webgl renderer
        this._updateVramUsage(textureSource, 1);
    }

    _addMemoryUsage(delta) {
        this._usedMemory += delta;
        this.stage.addMemoryUsage(delta);
    }

    _updateVramUsage(textureSource, sign) {
        const nativeTexture = textureSource.nativeTexture;
        var usage;

        // do nothing if webgl isn't even supported
        if (!Stage.isWebglSupported())
            return;

        // or if there is no native texture
        if (!textureSource.isLoaded())
            return;

        // or, finally, if there is no bytes per pixel specified
        if (!nativeTexture.hasOwnProperty('bytesPerPixel') || isNaN(nativeTexture.bytesPerPixel))
            return;

        usage = sign * (textureSource.w * textureSource.h * nativeTexture.bytesPerPixel);

        this.stage.addVramUsage(usage, textureSource.hasAlpha);
    }

    addToLookupMap(textureSource) {
        const lookupId = textureSource.lookupId;
        if (lookupId) {
            if (!this.textureSourceHashmap.has(lookupId)) {
                this.textureSourceHashmap.set(lookupId, textureSource);
            }
        }
    }

    gc() {
        this.freeUnusedTextureSources();
    }

    freeUnusedTextureSources() {
        let remainingTextureSources = [];
        for (let i = 0, n = this._uploadedTextureSources.length; i < n; i++) {
            let ts = this._uploadedTextureSources[i];
            if (ts.allowCleanup()) {
                this._freeManagedTextureSource(ts);
            } else {
                remainingTextureSources.push(ts);
            }
        }

        this._uploadedTextureSources = remainingTextureSources;

        this._cleanupLookupMap();
    }

    _freeManagedTextureSource(textureSource) {
        if (textureSource.isLoaded()) {
            this._nativeFreeTextureSource(textureSource);
            this._addMemoryUsage(-textureSource.w * textureSource.h);

            // add VRAM tracking if using the webgl renderer
            this._updateVramUsage(textureSource, -1);
        }

        // Should be reloaded.
        textureSource.loadingSince = null;
    }

    _cleanupLookupMap() {
        // We keep those that still have value (are being loaded or already loaded, or are likely to be reused).
        this.textureSourceHashmap.forEach((textureSource, lookupId) => {
            if (!(textureSource.isLoaded() || textureSource.isLoading()) && !textureSource.isUsed()) {
                this.textureSourceHashmap.delete(lookupId);
            }
        });
    }

    /**
     * Externally free texture source.
     * @param textureSource
     */
    freeTextureSource(textureSource) {
        const index = this._uploadedTextureSources.indexOf(textureSource);
        const managed = (index !== -1);

        if (textureSource.isLoaded()) {
            if (managed) {
                this._addMemoryUsage(-textureSource.w * textureSource.h);
                this._updateVramUsage(textureSource, -1);
                this._uploadedTextureSources.splice(index, 1);
            }
            this._nativeFreeTextureSource(textureSource);
        }

        this.textureSourceHashmap.delete(textureSource.lookupId);

        // Should be reloaded.
        textureSource.loadingSince = null;
    }

    _nativeUploadTextureSource(textureSource, options) {
        return this.stage.renderer.uploadTextureSource(textureSource, options);
    }

    _nativeFreeTextureSource(textureSource) {
        this.stage.renderer.freeTextureSource(textureSource);
        textureSource.clearNativeTexture();
    }

}
