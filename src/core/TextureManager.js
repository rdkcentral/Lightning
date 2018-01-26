/**
 * Copyright Metrological, 2017
 */
class TextureManager {

    constructor(stage) {
        this.stage = stage;

        this.gl = this.stage.gl;

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
            let ts = this._uploadedTextureSources[i];
            this.gl.deleteTexture(ts.glTexture);
        }
    }

    loadSrcTexture(src, ts, sync, cb) {
        if (this.stage.options.srcBasePath) {
            var fc = src.charCodeAt(0)
            if ((src.indexOf("//") === -1) && ((fc >= 65 && fc <= 90) || (fc >= 97 && fc <= 122) || fc == 46)) {
                // Alphabetical or dot: prepend base path.
                src = this.stage.options.srcBasePath + src
            }
        }
        this.stage.adapter.loadSrcTexture(src, ts, sync, cb);
    }

    loadTextTexture(settings, ts, sync, cb) {
        this.stage.adapter.loadTextTexture(settings, ts, sync, cb);
    }

    getTexture(source, options) {
        let id = options && options.id || null;

        let texture, textureSource;
        if (Utils.isString(source)) {
            id = id || source;

            // Check if texture source is already known.
            textureSource = this.textureSourceHashmap.get(id);
            if (!textureSource) {
                // Create new texture source.
                let self = this;
                let func = function (cb, ts, sync) {
                    self.loadSrcTexture(source, ts, sync, cb);
                };
                textureSource = this.getTextureSource(func, id);
                if (!textureSource.renderInfo) {
                    textureSource.renderInfo = {src: source};
                }
            }
        } else if (source instanceof TextureSource) {
            textureSource = source;
        } else if (!Utils.isNode && source instanceof WebGLTexture) {
            textureSource = this.getTextureSource((cb) => {

            }, id);
        } else {
            // Create new texture source.
            textureSource = this.getTextureSource(source, id);
        }

        // Create new texture object.
        texture = new Texture(this, textureSource);
        texture.x = options && options.x || 0;
        texture.y = options && options.y || 0;
        texture.w = options && options.w || 0;
        texture.h = options && options.h || 0;
        texture.clipping = !!(texture.x || texture.y || texture.w || texture.h);
        texture.precision = options && options.precision || 1;
        return texture;
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

    uploadTextureSource(textureSource, source, format) {
        if (textureSource.glTexture) return;

        // Load texture.
        let gl = this.gl;
        let sourceTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, sourceTexture);

        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, format.premultiplyAlpha);

        if (Utils.isNode) {
            gl.pixelStorei(gl.UNPACK_FLIP_BLUE_RED, !!format.flipBlueRed);
        }

        this.stage.adapter.uploadGlTexture(gl, textureSource, source, format.hasAlpha);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // Store texture.
        textureSource.glTexture = sourceTexture;

        // Used by CoreRenderState for optimizations.
        sourceTexture.w = textureSource.w
        sourceTexture.h = textureSource.h

        this._usedTextureMemory += textureSource.w * textureSource.h;

        this._uploadedTextureSources.push(textureSource);
    }

    isFull() {
        return this._usedTextureMemory >= this.stage.options.textureMemory;
    }

    freeUnusedTextureSources() {
        let remainingTextureSources = [];
        let usedTextureMemoryBefore = this._usedTextureMemory;
        for (let i = 0, n = this._uploadedTextureSources.length; i < n; i++) {
            let ts = this._uploadedTextureSources[i];
            if (!ts.permanent && (ts.views.size === 0)) {
                this.freeTextureSource(ts);
            } else {
                remainingTextureSources.push(ts);
            }
        }

        this._uploadedTextureSources = remainingTextureSources;
        console.log('freed ' + ((usedTextureMemoryBefore - this._usedTextureMemory) / 1e6).toFixed(2) + 'M texture pixels from GPU memory. Remaining: ' + this._usedTextureMemory);
    }
    
    freeTextureSource(textureSource) {
        if (!textureSource.isLoadedByCore()) {
            if (textureSource.glTexture) {
                this._usedTextureMemory -= textureSource.w * textureSource.h;
                this.gl.deleteTexture(textureSource.glTexture);
                textureSource.glTexture = null;
            }

            // Should be reloaded.
            textureSource.loadingSince = null;

            if (textureSource.lookupId) {
                // Delete it from the texture source hashmap to allow GC to collect it.
                // If it is still referenced somewhere, we'll re-add it later.
                this.textureSourceHashmap.delete(textureSource.lookupId);
            }
        }
    }

}

module.exports = TextureManager;

let Utils = require('./Utils');
let Texture = require('./Texture');
let TextureSource = require('./TextureSource');
