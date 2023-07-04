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

    }

    get usedMemory() {
        return this._usedMemory;
    }

    destroy() {
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

    uploadTextureSource(textureSource, options) {
        if (textureSource.isLoaded()) return;

        this._addMemoryUsage(textureSource.w * textureSource.h);

        // Load texture.
        const nativeTexture = this._nativeUploadTextureSource(textureSource, options);

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
        this._cleanupLookupMap();
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
                this._uploadedTextureSources.splice(index, 1);
            }
            this._nativeFreeTextureSource(textureSource);
        }

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
