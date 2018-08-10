/**
 * Allocates the space of the sprite map as efficiently as possible to textures.
 */
class SpriteMapAllocator {
    
    constructor(w, h) {
        this._w = w
        this._h = h
        this.reset()
    }

    reset() {
        this.areas = [new SpriteMapArea(0,0,this._w,this._h)]
    }

    allocate(w, h) {
        if (h > 512) {
            return null
        }

        const result = this._allocate(w, h)

        return result
    }

    _allocate(w, h) {
        const hGroup = SpriteMapAllocator.getHeightGroup(h)

        const n = this.areas.length

        // Try to allocate in already existing regions.
        for (let i = n - 1; i >= 0; i--) {
            const area = this.areas[i]
            const result = area.allocate(hGroup, w)
            if (result) {
                return result
            }
        }

        // Create new height group in remaining map space.
        for (let i = n - 1; i >= 0; i--) {
            const area = this.areas[i]
            const result = area.create(hGroup, w)
            if (result) {
                return result
            }
        }

        // Really running low on space. Try to reuse a remainder of an existing region.
        const region = this._getReusableRegion(hGroup, w)
        if (region) {
            const area = region.split()
            this.areas.push(area)
            return area.create(hGroup, w)
        }

        return null
    }

    _getReusableRegion(hGroup, w) {
        let bestFit = 0
        let bestGroup = null
        for (let i = 0, n = this.areas.length; i < n; i++) {
            const area = this.areas[i]
            const region = area.getReusableRegion(hGroup, w)
            if (region && (region.hGroup > hGroup)) {
                if (bestFit === 0 || (region.hGroup < bestFit)) {
                    bestFit = region.hGroup
                    bestGroup = region
                }
            }
        }
        return bestGroup
    }

    static getHeightGroup(h) {
        if (h >= 384) {
            return 512
        } else if (h >= 256) {
            return 384
        } else if (h >= 128) {
            return 256
        } else if (h >= 64) {
            return 128
        } else if (h >= 32) {
            return 64
        } else if (h >= 16) {
            return 32
        } else {
            return 16
        }
    }

}

class SpriteMapArea {
    constructor(x, y, w, h) {
        this._x = x
        this._y = y
        this._w = w
        this._h = h
        this._regions = []
        this._usedH = 0
    }

    get remaining() {
        return this._h - this._usedH
    }

    /**
     * Allocates the requested space if such a region already exists.
     */
    allocate(hGroup, w) {
        if (this._w >= w && this._h >= hGroup) {
            for (let i = 0, n = this._regions.length; i < n; i++) {
                const region = this._regions[i]
                if (region.hGroup === hGroup) {
                    const result = region.allocate(w)
                    if (result) {
                        return result
                    }
                }
            }
        }

        // No such height group region exists.
        return null
    }

    /**
     * Creates a new map group for the required space if possible.
     */
    create(hGroup, w) {
        if (this._w >= w && this.remaining >= hGroup) {
            const region = new SpriteMapRegion(this._x, this._usedH, hGroup, this._w)
            this._regions.push(region)
            this._usedH += hGroup
            return region.allocate(w)
        }
    }

    /**
     * Returns the best reusable region.
     */
    getReusableRegion(hGroup, w) {
        let bestFit = 0
        let bestGroup = null
        if (this._w >= w && this._h >= hGroup) {
            for (let i = 0, n = this._regions.length; i < n; i++) {
                const region = this._regions[i]
                if (region.hGroup > hGroup) {
                    if (bestFit === 0 || (region.hGroup < bestFit)) {
                        bestFit = region.hGroup
                        bestGroup = region
                    }
                }
            }
        }
        return bestGroup
    }

}

class SpriteMapRegion {
    constructor(x, y, hGroup, w) {
        this._x = x
        this._y = y
        this._hGroup = hGroup
        this._w = w
        this._usedW = 0
    }

    get hGroup() {
        return this._hGroup
    }

    get remaining() {
        return this._w - this._usedW
    }

    allocate(w) {
        if (w < this.remaining) {
            const result = {x: this._x + this._usedW, y: this._y}
            this._usedW += w
            return result
        }

        // Not enough space.
        return null
    }

    split() {
        const newArea = new SpriteMapArea(this._x + this._usedW, this._y, this._hGroup, this.remaining)
        this._w = this._usedW
        return newArea
    }
}

module.exports = SpriteMapAllocator;
