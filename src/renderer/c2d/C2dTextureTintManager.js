export default class C2dTextureTintManager {

    constructor(stage) {
        this.stage = stage;
        this._usedMemory = 0;
        this._cachedNativeTextures = new Set();
    }

    destroy() {
        this.gc(true);
    }

    _addMemoryUsage(delta) {
        this._usedMemory += delta;

        this.stage.addMemoryUsage(delta);
    }

    delete(nativeTexture) {
        // Should be called when native texture is cleaned up.
        if (this._hasCache(nativeTexture)) {
            const cache = this._getCache(nativeTexture);
            const prevMemUsage = cache.memoryUsage;
            cache.clear();
            this._cachedNativeTextures.delete(nativeTexture);
            this._addMemoryUsage(cache.memoryUsage - prevMemUsage);
        }
    }

    getTintTexture(nativeTexture, color) {
        const frame = this.stage.frameCounter;

        this._cachedNativeTextures.add(nativeTexture);

        const cache = this._getCache(nativeTexture);

        const item = cache.get(color);
        item.lf = frame;

        if (item.tx) {
            if (nativeTexture.update > item.u) {
                // Native texture was updated in the mean time: renew.
                this._tintTexture(item.tx, nativeTexture, color)
            }

            return item.tx;
        } else {
            const before = cache.memoryUsage;

            // Find blanco tint texture.
            let target = cache.reuseTexture(frame);
            if (target) {
                target.ctx.clearRect(0, 0, target.width, target.height);
            } else {
                // Allocate new.
                target = document.createElement('canvas');
                target.width = nativeTexture.w;
                target.height = nativeTexture.h;
                target.ctx = target.getContext('2d');
            }

            this._tintTexture(target, nativeTexture, color);
            cache.set(color, target, frame);

            const after = cache.memoryUsage;

            if (after !== before) {
                this._addMemoryUsage(after - before);
            }

            return target;
        }
    }

    _tintTexture(target, source, color) {
        let col = color.toString(16);
        while (col.length < 6) {
            col = "0" + col;
        }
        target.ctx.fillStyle = '#' + col;
        target.ctx.globalCompositeOperation = 'copy';
        target.ctx.fillRect(0, 0, source.w, source.h);
        target.ctx.globalCompositeOperation = 'multiply';
        target.ctx.drawImage(source, 0, 0, source.w, source.h, 0, 0, target.width, target.height);

        // Alpha-mix the texture.
        target.ctx.globalCompositeOperation = 'destination-in';
        target.ctx.drawImage(source, 0, 0, source.w, source.h, 0, 0, target.width, target.height);
    }

    _hasCache(nativeTexture) {
        return !!nativeTexture._tintCache;
    }

    _getCache(nativeTexture) {
        if (!nativeTexture._tintCache) {
            nativeTexture._tintCache = new C2dTintCache(nativeTexture);
        }
        return nativeTexture._tintCache;
    }

    gc(aggressive = false) {
        const frame = this.stage.frameCounter;
        let delta = 0;
        this._cachedNativeTextures.forEach(texture => {
            const cache = this._getCache(texture);
            if (aggressive) {
                delta += cache.memoryUsage;
                texture.clear();
            } else {
                const before = cache.memoryUsage;
                cache.cleanup(frame);
                cache.releaseBlancoTextures();
                delta += (cache.memoryUsage - before);
            }
        });

        if (aggressive) {
            this._cachedNativeTextures.clear();
        }

        if (delta) {
            this._addMemoryUsage(delta);
        }
    }

}

class C2dTintCache {

    constructor(nativeTexture) {
        this._tx = nativeTexture;
        this._colors = new Map();
        this._blancoTextures = null;
        this._lastCleanupFrame = 0;
        this._memTextures = 0;
    }

    get memoryUsage() {
        return this._memTextures * this._tx.w * this._tx.h;
    }

    releaseBlancoTextures() {
        this._memTextures -= this._blancoTextures.length;
        this._blancoTextures = [];
    }

    clear() {
        // Dereference the textures.
        this._blancoTextures = null;
        this._colors.clear();
        this._memTextures = 0;
    }

    get(color) {
        let item = this._colors.get(color);
        if (!item) {
            item = {lf: -1, tx: undefined, u: -1};
            this._colors.set(color, item);
        }
        return item;
    }

    set(color, texture, frame) {
        const item = this.get(color);
        item.lf = frame;
        item.tx = texture;
        item.u = frame;
        this._memTextures++;
    }

    cleanup(frame) {
        // We only need to clean up once per frame.
        if (this._lastCleanupFrame !== frame) {

            // We limit blanco textures reuse to one frame only to prevent memory usage growth.
            this._blancoTextures = [];

            this._colors.forEach((item, color) => {
                // Clean up entries that were not used last frame.
                if (item.lf < frame - 1) {
                    if (item.tx) {
                        // Keep as reusable blanco texture.
                        this._blancoTextures.push(item.tx);
                    }
                    this._colors.delete(color);
                }
            });

            this._lastCleanupFrame = frame;
        }
    }

    reuseTexture(frame) {
        // Try to reuse textures, because creating them every frame is expensive.
        this.cleanup(frame);
        if (this._blancoTextures && this._blancoTextures.length) {
            this._memTextures--;
            return this._blancoTextures.pop();
        }
    }

}

