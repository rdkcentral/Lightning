export default class TextureManager {

    constructor(stage) {
        this.stage = stage;

        /**
         * The currently used amount of texture memory.
         * @type {number}
         */
        this._usedTextureMemory = 0;

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

    destroy() {
        for (let i = 0, n = this._uploadedTextureSources.length; i < n; i++) {
            this._nativeFreeTextureSource(this._uploadedTextureSources[i]);
        }
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

        // Load texture.
        const nativeTexture = this._nativeUploadTextureSource(textureSource, options);

        textureSource._nativeTexture = nativeTexture;

        // We attach w and h to native texture (see CoreQuadOperation.getTextureWidth()).
        nativeTexture.w = textureSource.w;
        nativeTexture.h = textureSource.h;

        nativeTexture.update = this.stage.frameCounter;

        this._usedTextureMemory += textureSource.w * textureSource.h;

        this._uploadedTextureSources.push(textureSource);
    }

    isFull() {
        return this._usedTextureMemory >= this.stage.getOption('textureMemory');
    }

    freeUnusedTextureSources() {
        let remainingTextureSources = [];
        let usedTextureMemoryBefore = this._usedTextureMemory;
        for (let i = 0, n = this._uploadedTextureSources.length; i < n; i++) {
            let ts = this._uploadedTextureSources[i];
            if (ts.allowCleanup() && !ts.isResultTexture) {
                this._freeManagedTextureSource(ts);
            } else {
                remainingTextureSources.push(ts);
            }
        }

        this._uploadedTextureSources = remainingTextureSources;
        console.log('freed ' + ((usedTextureMemoryBefore - this._usedTextureMemory) / 1e6).toFixed(2) + 'M texture pixels from GPU memory. Remaining: ' + this._usedTextureMemory);
    }

    _freeManagedTextureSource(textureSource) {
        if (textureSource.isLoaded()) {
            this._usedTextureMemory -= textureSource.w * textureSource.h;
            this._nativeFreeTextureSource(textureSource);
        }

        // Should be reloaded.
        textureSource.loadingSince = null;

        if (textureSource.lookupId) {
            // Delete it from the texture source hashmap to allow GC to collect it.
            // If it is still referenced somewhere, we'll re-add it later.
            this.textureSourceHashmap.delete(textureSource.lookupId);
        }
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
                this._usedTextureMemory -= textureSource.w * textureSource.h;
                this._uploadedTextureSources.splice(index, 1);
            }
            this._nativeFreeTextureSource(textureSource);
        }

        // Should be reloaded.
        textureSource.loadingSince = null;

        if (textureSource.lookupId) {
            // Delete it from the texture source hashmap to allow GC to collect it.
            // If it is still referenced somewhere, we'll re-add it later.
            this.textureSourceHashmap.delete(textureSource.lookupId);
        }
    }

    _nativeUploadTextureSource(textureSource, options) {
        let gl = this.stage.gl;

        const source = options.source;

        const format = {
            premultiplyAlpha: true,
            hasAlpha: true
        };

        if (options && options.hasOwnProperty('premultiplyAlpha')) {
            format.premultiplyAlpha = options.premultiplyAlpha;
        }

        if (options && options.hasOwnProperty('flipBlueRed')) {
            format.flipBlueRed = options.flipBlueRed;
        }

        if (options && options.hasOwnProperty('hasAlpha')) {
            format.hasAlpha = options.hasAlpha;
        }

        if (!format.hasAlpha) {
            format.premultiplyAlpha = false;
        }

        format.texParams = options.texParams || {}
        format.texOptions = options.texOptions || {}

        let glTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, glTexture);

        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, format.premultiplyAlpha);

        if (Utils.isNode) {
            gl.pixelStorei(gl.UNPACK_FLIP_BLUE_RED, !!format.flipBlueRed);
        }

        const texParams = format.texParams;
        if (!texParams[gl.TEXTURE_MAG_FILTER]) texParams[gl.TEXTURE_MAG_FILTER] = gl.LINEAR;
        if (!texParams[gl.TEXTURE_MIN_FILTER]) texParams[gl.TEXTURE_MIN_FILTER] = gl.LINEAR;
        if (!texParams[gl.TEXTURE_WRAP_S]) texParams[gl.TEXTURE_WRAP_S] = gl.CLAMP_TO_EDGE;
        if (!texParams[gl.TEXTURE_WRAP_T]) texParams[gl.TEXTURE_WRAP_T] = gl.CLAMP_TO_EDGE;

        Object.keys(texParams).forEach(key => {
            const value = texParams[key];
            gl.texParameteri(gl.TEXTURE_2D, parseInt(key), value);
        });

        const texOptions = format.texOptions;
        texOptions.format = texOptions.format || (format.hasAlpha ? gl.RGBA : gl.RGB);
        texOptions.type = texOptions.type || gl.UNSIGNED_BYTE;
        texOptions.internalFormat = texOptions.internalFormat || texOptions.format;

        this.stage.adapter.uploadGlTexture(gl, textureSource, source, texOptions);

        glTexture.params = Utils.cloneObjShallow(texParams);
        glTexture.options = Utils.cloneObjShallow(texOptions);
        
        return glTexture;
    }

    _nativeFreeTextureSource(textureSource) {
        this.stage.gl.deleteTexture(textureSource.nativeTexture);
        textureSource.nativeTexture = null;
    }

}

import Utils from "./Utils.mjs";
import TextureSource from "./TextureSource.mjs";
