var isNode = !!(((typeof module !== "undefined") && module.exports));

if (isNode) {
    var Utils = require('./Utils');
}

/**
 * The texture manager.
 * @constructor
 */
function TextureManager(stage, gl) {

    this.stage = stage;

    this.gl = gl;

    /**
     * The texture memory in pixels. After reaching this number, old unused textures will be garbage collected.
     * The actual memory usage is observed to be about 10B per pixel.
     * @type {number}
     */
    this.textureMemory = stage.textureMemory;

    /**
     * The currently used amount of texture memory.
     * @type {number}
     */
    this.usedTextureMemory = 0;

    /**
     * All uploaded texture sources.
     * @type {TextureSource[]}
     */
    this.uploadedTextureSources = [];

    /**
     * The texture source lookup id to texture source hashmap.
     * @type {Map<String, TextureSource>}
     */
    this.textureSourceHashmap = new Map();

    /**
     * The texture source id to texture source hashmap.
     * (only the texture sources that are referenced by one or more active components).
     * @type {Map<Number, TextureSource>}
     */
    this.textureSourceIdHashmap = new Map();

}

TextureManager.prototype.destroy = function() {
    for (var i = 0, n = this.uploadedTextureSources.length; i < n; i++) {
        var ts = this.uploadedTextureSources[i];
        this.gl.deleteTexture(ts.glTexture);
    }
};

/**
 * Loads a texture source from a source reference (.src property).
 */
TextureManager.prototype.loadTextureSourceString = function(src, ts, sync, cb) {
    if (!sync && this.stage.useTextureProcess && this.stage.textureProcess.isConnected()) {
        if (!this.stage.textureProcess.loadTextureSourceString(src, ts, cb)) {
            // Cannot be loaded remotely. Fallback: load sync.
            this.stage.adapter.loadTextureSourceString(src, cb);
        }
    } else {
        this.stage.adapter.loadTextureSourceString(src, cb);
    }
};

/**
 * Loads a text from the finalized text settings.
 */
TextureManager.prototype.loadText = function(settings, ts, sync, cb) {
    if (!sync && this.stage.useTextureProcess && this.stage.textureProcess.isConnected() && this.stage.useTextureProcessTextGeneration) {
        if (!this.stage.textureProcess.loadText(settings, ts, cb)) {
            // Cannot be loaded remotely. Fallback: load sync.
            this.stage.adapter.loadText(settings, cb);
        }
    } else {
        this.stage.adapter.loadText(settings, cb);
    }
};

/**
 * @param {string|function} source
 * @param {object} [options]
 *   - id: number
 *     Fixed id. Handy when using base64 strings or when using canvas textures.
 *   - x: number
 *     Clipping offset x.
 *   - y: number
 *     Clipping offset y.
 *   - w: number
 *     Clipping offset w.
 *   - h: number
 *     Clipping offset h.
 *   - precision: number
 *     Render precision (0.5 = fuzzy, 1 = normal, 2 = sharp even when scaled twice, etc.).
 *
 * @returns {Texture}
 */
TextureManager.prototype.getTexture = function(source, options) {
    var id = options && options.id || null;

    var texture, textureSource;
    if (Utils.isString(source)) {
        id = id || source;

        // Check if texture source is already known.
        textureSource = this.textureSourceHashmap.get(id);
        if (!textureSource) {
            // Create new texture source.
            var self = this;
            var func = function(cb, ts, sync) {
                self.loadTextureSourceString(source, ts, sync, cb);
            };
            textureSource = this.getTextureSource(func, id);
        }
    } else {
        // Check if texture source is already known.
        textureSource = id ? this.textureSourceHashmap.get(id) : null;
        if (!textureSource) {
            if (source instanceof TextureSource) {
                textureSource = source;
            } else {
                // Create new texture source.
                textureSource = this.getTextureSource(source, id);

                if (id) {
                    this.textureSourceHashmap.set(id, textureSource);
                }
            }
        }
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
};

TextureManager.prototype.getTextureSource = function(func, id) {
    // Check if texture source is already known.
    var textureSource = id ? this.textureSourceHashmap.get(id) : null;
    if (!textureSource) {
        // Create new texture source.
        textureSource = new TextureSource(this, func);

        if (id) {
            textureSource.lookupId = id;
            this.textureSourceHashmap.set(id, textureSource);
        }
    }

    return textureSource;
};

TextureManager.prototype.uploadTextureSource = function(textureSource, source, format) {
    if (textureSource.glTexture) return;

    // Load texture.
    var gl = this.gl;
    var sourceTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, sourceTexture);

    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, format.premultiplyAlpha);

    if (isNode) {
        gl.pixelStorei(gl.UNPACK_FLIP_BLUE_RED, format.flipBlueRed);
    }

    if (this.stage.measureLongFrames) {
        var s = this.stage.getHrTime();
    }
    this.stage.adapter.uploadGlTexture(gl, textureSource, source);
    if (this.stage.measureLongFrames) {
        if (!isNode && (source instanceof ImageData || source instanceof HTMLImageElement || source instanceof HTMLCanvasElement || source instanceof HTMLVideoElement || (window.ImageBitmap && source instanceof ImageBitmap))) {
            this.stage.longFrameComponents.uploadImage += (this.stage.getHrTime() - s);
            this.stage.longFrameComponents.nUploadImage++;
        } else {
            this.stage.longFrameComponents.uploadRaw += (this.stage.getHrTime() - s);
            this.stage.longFrameComponents.nUploadRaw++;
        }
    }

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Store texture.
    textureSource.glTexture = sourceTexture;

    this.usedTextureMemory += textureSource.w * textureSource.h;

    this.uploadedTextureSources.push(textureSource);
};

TextureManager.prototype.isFull = function() {
    return (this.usedTextureMemory >= this.textureMemory);
};

/**
 * Garbage collects all unused textures.
 */
TextureManager.prototype.freeUnusedTextureSources = function() {
    var remainingTextureSources = [];
    var usedTextureMemoryBefore = this.usedTextureMemory;
    for (var i = 0, n = this.uploadedTextureSources.length; i < n; i++) {
        var ts = this.uploadedTextureSources[i];
        if (!ts.permanent && (ts.components.size === 0)) {
            this.freeTextureSource(ts);
        } else {
            remainingTextureSources.push(ts);
        }
    }

    var self = this;
    this.textureSourceHashmap.forEach(function(textureSource) {
        if (!textureSource.permanent && (textureSource.components.size === 0)) {
            self.freeTextureSource(textureSource);
        }
    });

    this.uploadedTextureSources = remainingTextureSources;
    console.log('freed ' + ((usedTextureMemoryBefore - this.usedTextureMemory) / 1e6).toFixed(2) + 'M texture pixels from GPU memory. Remaining: ' + this.usedTextureMemory);
};

/**
 * Frees the WebGL texture from memory.
 * @param {TextureSource} textureSource
 * @pre textureSource.components.size === 0
 */
TextureManager.prototype.freeTextureSource = function(textureSource) {
    if (textureSource.glTexture) {
        this.usedTextureMemory -= textureSource.w * textureSource.h;
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
};

/**
 * Completely delete the texture source and all references to it.
 * @param {TextureSource} textureSource
 */
TextureManager.prototype.removeTextureSource = function(textureSource) {
    this.freeTextureSource(textureSource);

    textureSource.loadingSince = null;

    if (textureSource.lookupId) {
        this.textureSourceHashmap.delete(textureSource.lookupId);
    }
};

if (isNode) {
    module.exports = TextureManager;
    var TextureSource = require('./TextureSource');
    var Texture = require('./Texture');
}