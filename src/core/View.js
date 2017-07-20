/**
 * Render tree node.
 * Copyright Metrological, 2017
 */

let Base = require('./Base');
let StageUtils = require('./StageUtils');

class View extends Base {

    constructor(stage) {
        super();

        EventEmitter.call(this);

        this.id = View.id++;

        this.stage = stage;
        this.ctx = this.stage.ctx;
    }

    _properties() {

        /**
         * A view is active if it is a descendant of the stage root and it is visible (worldAlpha > 0).
         * @type {boolean}
         */
        this._active = false;

        /**
         * A view is active if it is a descendant of the stage root.
         * @type {boolean}
         */
        this._attached = false;

        /**
         * @type {View}
         */
        this._parent = null;

        /**
         * The texture that is currently set.
         * @type {Texture}
         * @protected
         */
        this._texture = null;

        /**
         * The currently displayed texture. While this.texture is loading, this one may be different.
         * @type {Texture}
         * @protected
         */
        this._displayedTexture = null;

        /**
         * Tags that can be used to identify/search for a specific view.
         * @type {String[]}
         */
        this._tags = null;

        /**
         * The tree's tags mapping.
         * This contains all views for all known tags, at all times.
         * @type {Map}
         */
        this._treeTags = null;

        /**
         * Cache for the tag/mtag methods.
         * @type {Map<String,View[]>}
         */
        this._tagsCache = null;

        /**
         * Tag-to-complex cache (all tags that are part of the complex caches).
         * This maps tags to cached complex tags in the cache.
         * @type {Map<String,String[]>}
         */
        this._tagToComplex = null;

        this._x = 0;
        this._y = 0;
        this._w = 0;
        this._h = 0;
        this._scaleX = 1;
        this._scaleY = 1;
        this._pivotX = 0.5;
        this._pivotY = 0.5;
        this._mountX = 0;
        this._mountY = 0;
        this._alpha = 1;
        this._rotation = 0;
        this._visible = true;

        this._colorUl = this._colorUr = this._colorBl = this._colorBr = 0xFFFFFFFF;

        this._clipping = false;
        this._zIndex = 0;
        this._forceZIndexContext = false;

        /**
         * The text functionality in case this view is a text view.
         * @type {ViewText}
         */
        this._viewText = null;

        /**
         * @type {View[]}
         * @protected
         */
        this._children = null;

        this._hasUpdates = false;

        this._recalc = 0;

        this._worldAlpha = 1;

        this._updateTreeOrder = 0;

        this._hasChildren = false;

        // All local translation/transform updates: directly propagated from x/y/w/h/scale/whatever.
        this._worldPx = this._localPx = 0;
        this._worldPy = this._localPy = 0;

        this._worldTa = this._localTa = 1;
        this._worldTb = this._localTb = 0;
        this._worldTc = this._localTc = 0;
        this._worldTd = this._localTd = 1;

        this._isComplex = false;

        this._localAlpha = 1;

        /**
         * Cached render width/height.
         * Only maintained if active.
         * @type {number}
         * @private
         */
        this._rw = 0;
        this._rh = 0;

        this._clippingParent = null;

        /**
         * In case of clipping, this flag indicates if we're dealing with a square-shaped clipping area.
         * @type {boolean}
         */
        this._clippingSquare = false;

        this._clippingSquareMinX = 0;
        this._clippingSquareMaxX = 0;
        this._clippingSquareMinY = 0;
        this._clippingSquareMaxY = 0;

        /**
         * Flag that indicates that clipping area is empty.
         * @type {boolean}
         */
        this._clippingEmpty = false;

        /**
         * Flag that indicates that the clipping area are the corner points.
         * @type {boolean}
         */
        this._clippingNoEffect = false;

        /**
         * In case of complex clipping, the corner points of the clipping area.
         * @type {number[]}
         */
        this._clippingArea = null;

        /**
         * The texture source to be displayed.
         * @type {TextureSource}
         */
        this._displayedTextureSource = null;

        this._txCoordsUl = 0x00000000;
        this._txCoordsUr = 0x0000FFFF;
        this._txCoordsBr = 0xFFFFFFFF;
        this._txCoordsBl = 0xFFFF0000;

        this._ulx = 0;
        this._uly = 0;
        this._brx = 1;
        this._bry = 1;

        this._zContextUsage = 0;
        this._zParent = null;
        this._zSort = false;

    }

    setAsRoot() {
        this._updateActiveFlag();
        this._updateAttachedFlag();

        // Use a dummy parent to improve update performance.
        this._parent = new View(this.stage);
        this.ctx.root = this;
    }

    isRoot() {
        return (this.ctx.root === this);
    }

    _setParent(parent) {
        if (this._parent === parent) return;

        if (this._parent) {
            this._unsetTagsParent();
        }

        let prevIsZContext = this._isZContext();
        let prevParent = this._parent;

        this._parent = parent;

        if (parent) {
            this._setTagsParent();
        }

        this._updateActiveFlag();

        this._updateAttachedFlag();

        this._setRecalc(1 + 2 + 4);

        if (this._zIndex === 0) {
            this._setZParent(parent);
        } else {
            this._setZParent(parent ? parent._findZContext() : null);
        }

        if (prevIsZContext !== this._isZContext()) {
            if (!this._isZContext()) {
                this._disableZContext();
            } else {
                this._enableZContext(prevParent._findZContext());
            }
        }

        let newClippingParent = parent ? (parent._clipping ? parent : parent._clippingParent) : null;

        if (newClippingParent !== this._clippingParent) {
            this._setClippingParent(newClippingParent);
        }

    };

    getDepth() {
        let depth = 0;

        let p = this;
        do {
            depth++;
            p = p._parent;
        } while (p);

        return depth;
    };

    getAncestor(l) {
        let p = this;
        while (l > 0 && p._parent) {
            p = p._parent;
            l--;
        }
        return p;
    };

    getAncestorAtDepth(depth) {
        let levels = this.getDepth() - depth;
        if (levels < 0) {
            return null;
        }
        return this.getAncestor(levels);
    };

    isAncestorOf(c) {
        let p = c;
        while(p = p.parent) {
            if (this === p) {
                return true;
            }
        }
        return false;
    };

    getSharedAncestor(c) {
        let o1 = this;
        let o2 = c;
        let l1 = o1.getDepth();
        let l2 = o2.getDepth();
        if (l1 > l2) {
            o1 = o1.getAncestor(l1 - l2);
        } else if (l2 > l1) {
            o2 = o2.getAncestor(l2 - l1);
        }

        do {
            if (o1 === o2) {
                return o1;
            }

            o1 = o1._parent;
            o2 = o2._parent;
        } while (o1 && o2);

        return null;
    };

    addChild(child) {
        if (!this._children) this._children = [];

        if (child._parent === this && this._children.indexOf(child) >= 0) {
            return child;
        }
        this.addChildAt(child, this._children.length);
    };

    addChildAt(child, index) {
        // prevent adding self as child
        if (child === this) {
            return
        }

        if (this._children === null) {
            this._children = [];
        }

        if (index >= 0 && index <= this._children.length) {
            if (child._parent === this && this._children.indexOf(child) === index) {
                // Ignore.
            } else {
                if (child._parent) {
                    let p = child._parent;
                    p.removeChild(child);
                }

                child._setParent(this);
                this._children.splice(index, 0, child);

                this._hasChildren = true;
            }

            return;
        } else {
            throw new Error(child + 'addChildAt: The index ' + index + ' supplied is out of bounds ' + this.children.length);
        }
    };

    getChildIndex(child) {
        return this._children && this._children.indexOf(child);
    };

    removeChild(child) {
        let index = this._children && this._children.indexOf(child);

        if (index !== -1) {
            this.removeChildAt(index);
        }
    };

    removeChildAt(index) {
        if (!this._children) return;

        let child = this._children[index];

        child._setParent(null);
        this._children.splice(index, 1);

        this._hasChildren = (this._children.length > 0);

        return child;
    };

    removeChildren() {
        if (this._children) {
            let n = this._children.length;
            if (n) {
                for (let i = 0; i < n; i++) {
                    let child = this._children[i];
                    child._setParent(null);
                }
                this._children.splice(0, n);

                this._hasChildren = false;
            }
        }
    };

    add(o) {
        if (Utils.isObjectLiteral(o)) {
            let c = this.stage.createView(o);
            c.setSettings(o);
            this.addChild(c);
            return c;
        } else if (o instanceof View) {
            this.addChild(o);
            return o;
        } else if (Array.isArray(o)) {
            for (let i = 0, n = o.length; i < n; i++) {
                this.add(o[i]);
            }
            return null;
        }
    };

    isActive() {
        return this._visible && (this._alpha > 0) && (this._parent ? this._parent._active : (this.stage.root === this));
    };

    isAttached() {
        return (this._parent ? this._parent._attached : (this.stage.root === this));
    };

    /**
     * Updates the 'active' flag for this branch.
     */
    _updateActiveFlag() {
        // Calculate active flag.
        let newActive = this.isActive();
        if (this._active !== newActive) {
            if (newActive) {
                this._setActiveFlag();
            } else {
                this._unsetActiveFlag();
            }

            if (this._children) {
                let m = this._children.length;
                if (m > 0) {
                    for (let i = 0; i < m; i++) {
                        this._children[i]._updateActiveFlag();
                    }
                }
            }

            // Run this after all _children because we'd like to see (de)activating a branch as an 'atomic' operation.
            if (this._eventsCount) {
                this.emit('active', newActive);
            }
        }
    };

    _setActiveFlag() {
        // Detect texture changes.
        let dt = null;
        if (this._texture && this._texture.source.glTexture) {
            dt = this._texture;
            this._texture.source.addView(this);
        } else if (this._displayedTexture && this._displayedTexture.source.glTexture) {
            dt = this._displayedTexture;
        }

        this.displayedTexture = dt;

        // Force re-check of texture because dimensions might have changed (cutting).
        this._updateDimensions();
        this._updateTextureCoords();

        this._active = true;

        if (this._texture) {
            // It is important to add the source listener before the texture listener because that may trigger a load.
            this._texture.source.addView(this);
        }

        if (this._displayedTexture && this._displayedTexture !== this._texture) {
            this._displayedTexture.source.addView(this);
        }

        if (this.zIndex != 0) {
            // View uses z-index.
            this.stage.zIndexUsage++;
        }
    }

    _unsetActiveFlag() {
        if (this.zIndex != 0) {
            // View uses z-index.
            this.stage.zIndexUsage--;
        }

        if (this._texture) {
            this._texture.source.removeView(this);
        }

        if (this._displayedTexture) {
            this._displayedTexture.source.removeView(this);
        }

        this._active = false;
    }

    /**
     * Updates the 'attached' flag for this branch.
     */
    _updateAttachedFlag() {
        // Calculate active flag.
        let newAttached = this.isAttached();
        if (this._attached !== newAttached) {
            this._attached = newAttached;

            if (this._children) {
                let m = this._children.length;
                if (m > 0) {
                    for (let i = 0; i < m; i++) {
                        this._children[i]._updateAttachedFlag();
                    }
                }
            }
        }
    };

    _getRenderWidth() {
        if (this._w) {
            return this._w;
        } else if (this._texture && this._texture.source.glTexture) {
            // Texture already loaded, but not yet updated (probably because it's not active).
            return (this._texture.w || (this._texture.source.w / this._texture.precision));
        } else if (this._displayedTexture) {
            return (this._displayedTexture.w || (this._displayedTexture.source.w / this._displayedTexture.precision));
        } else {
            return 0;
        }
    };

    _getRenderHeight() {
        if (this._h) {
            return this._h;
        } else if (this._texture && this._texture.source.glTexture) {
            // Texture already loaded, but not yet updated (probably because it's not active).
            return (this._texture.h || this._texture.source.h) / this._texture.precision;
        } else if (this._displayedTexture) {
            return (this._displayedTexture.h || this._displayedTexture.source.h) / this._displayedTexture.precision;
        } else {
            return 0;
        }
    };

    get renderWidth() {
        if (this._active) {
            // Render width is only maintained if this view is active.
            return this._rw;
        } else {
            return this._getRenderWidth();
        }
    }

    get renderHeight() {
        if (this._active) {
            return this._rh;
        } else {
            return this._getRenderHeight();
        }
    }

    get texture() {
        return this._texture;
    }

    textureIsLoaded() {
        return this.texture ? !!this.texture.source.glTexture : false;
    }

    loadTexture(sync) {
        if (this.texture) {
            this.texture.source.load(sync);
        }
    }

    set texture(v) {
        if (v && Utils.isObjectLiteral(v)) {
            if (this.texture) {
                Base.setObjectSettings(this.texture, v);
            } else {
                console.warn('Trying to set texture properties, but there is no texture.');
            }
            return;
        }

        let prevValue = this._texture;
        if (v !== prevValue) {
            if (v !== null && !(v instanceof Texture)) {
                throw new Error('incorrect value for texture');
            }

            this._texture = v;

            if (this._active && prevValue && this.displayedTexture !== prevValue) {
                // Keep reference to view for texture source
                if ((!v || prevValue.source !== v.source) && (!this.displayedTexture || (this.displayedTexture.source !== prevValue.source))) {
                    prevValue.source.removeView(this);
                }
            }

            if (v) {
                if (this._active) {
                    // When the texture is changed, maintain the texture's sprite registry.
                    // While the displayed texture is different from the texture (not yet loaded), two textures are referenced.
                    v.source.addView(this);
                }

                if (v.source.glTexture) {
                    this.displayedTexture = v;
                }
            } else {
                // Make sure that current texture is cleared when the texture is explicitly set to null.
                this.displayedTexture = null;
            }
        }
    }

    get displayedTexture() {
        return this._displayedTexture;
    }

    set displayedTexture(v) {
        let prevValue = this._displayedTexture;
        if (v !== prevValue) {
            if (this._active && prevValue) {
                // We can assume that this._texture === this._displayedTexture.

                if (prevValue !== this._texture) {
                    // The old displayed texture is deprecated.
                    if (!v || (prevValue.source !== v.source)) {
                        prevValue.source.removeView(this);
                    }
                }
            }

            this._displayedTexture = v;

            this._updateDimensions();

            if (v) {
                if (this._eventsCount) {
                    this.emit('txLoaded', v);
                }

                // We don't need to reference the displayed texture because it was already referenced (this.texture === this.displayedTexture).
                this._updateTextureCoords();
                this._setDisplayedTextureSource(v.source);
            } else {
                if (this._eventsCount) {
                    this.emit('txUnloaded', v);
                }

                this._setDisplayedTextureSource(null);
            }
        }
    }

    onTextureSourceLoaded() {
        // Now we can start showing this texture.
        this.displayedTexture = this._texture;
    };

    onTextureSourceLoadError(e) {
        if (this._eventsCount) {
            this.emit('txError', e, this._texture.source);
        }
    };

    onTextureSourceAddedToTextureAtlas() {
        this._updateTextureCoords();
    };

    onTextureSourceRemovedFromTextureAtlas() {
        this._updateTextureCoords();
    };

    onDisplayedTextureClippingChanged() {
        this._updateDimensions();
        this._updateTextureCoords();
    };

    onPrecisionChanged() {
        this._updateDimensions();
    };

    _updateDimensions() {
        let beforeW = this._rw;
        let beforeH = this._rh;
        let rw = this._getRenderWidth();
        let rh = this._getRenderHeight();
        if (beforeW !== rw || beforeH !== rh) {
            // Due to width/height change: update the translation vector and borders.
            this._setDimensions(this._getRenderWidth(), this._getRenderHeight());
            this._updateLocalTranslate();
        }
    }

    _updateLocalTransform() {
        if (this._rotation !== 0 && this._rotation % (2 * Math.PI)) {
            // check to see if the rotation is the same as the previous render. This means we only need to use sin and cos when rotation actually changes
            let _sr = Math.sin(this._rotation);
            let _cr = Math.cos(this._rotation);

            this._setLocalTransform(
                _cr * this._scaleX,
                -_sr * this._scaleY,
                _sr * this._scaleX,
                _cr * this._scaleY
            );
        } else {
            this._setLocalTransform(
                this._scaleX,
                0,
                0,
                this._scaleY
            );
        }
        this._updateLocalTranslate();
    };

    _updateLocalTranslate() {
        let pivotXMul = this._pivotX * this._rw;
        let pivotYMul = this._pivotY * this._rh;
        let px = this._x - (pivotXMul * this._localTa + pivotYMul * this._localTb) + pivotXMul;
        let py = this._y - (pivotXMul * this._localTc + pivotYMul * this._localTd) + pivotYMul;
        px -= this._mountX * this._rw;
        py -= this._mountY * this._rh;
        this._setLocalTranslate(
            px,
            py
        );
    };

    _updateLocalTranslateDelta(dx, dy) {
        this._addLocalTranslate(dx, dy)
    };

    _updateLocalAlpha() {
        this._setLocalAlpha(this._visible ? this._alpha : 0);
    };

    _updateTextureCoords() {
        if (this.displayedTexture && this.displayedTexture.source) {
            let displayedTexture = this.displayedTexture;
            let displayedTextureSource = this.displayedTexture.source;

            let tx1 = 0, ty1 = 0, tx2 = 1.0, ty2 = 1.0;
            if (displayedTexture.clipping) {
                // Apply texture clipping.
                let w = displayedTextureSource.getRenderWidth();
                let h = displayedTextureSource.getRenderHeight();
                let iw, ih, rw, rh;
                iw = 1 / w;
                ih = 1 / h;

                if (displayedTexture.w) {
                    rw = displayedTexture.w * iw;
                } else {
                    rw = (w - displayedTexture.x) * iw;
                }

                if (displayedTexture.h) {
                    rh = displayedTexture.h * ih;
                } else {
                    rh = (h - displayedTexture.y) * ih;
                }

                iw *= displayedTexture.x;
                ih *= displayedTexture.y;

                tx1 = Math.min(1.0, Math.max(0, iw));
                ty1 = Math.min(1.0, Math.max(ih));
                tx2 = Math.min(1.0, Math.max(tx2 * rw + iw));
                ty2 = Math.min(1.0, Math.max(ty2 * rh + ih));
            }

            if (displayedTextureSource.inTextureAtlas) {
                // Calculate texture atlas texture coordinates.
                let textureAtlasI = 0.000488281;    // 1/2048.

                let tax = (displayedTextureSource.textureAtlasX * textureAtlasI);
                let tay = (displayedTextureSource.textureAtlasY * textureAtlasI);
                let dax = (displayedTextureSource.w * textureAtlasI);
                let day = (displayedTextureSource.h * textureAtlasI);

                tx1 = tax;
                ty1 = tay;

                tx2 = tx2 * dax + tax;
                ty2 = ty2 * day + tay;
            }

            this._setTextureCoords(tx1, ty1, tx2, ty2);
            this._setInTextureAtlas(displayedTextureSource.inTextureAtlas);
        }
    }

    getCornerPoints() {
        return [
            this._worldPx,
            this._worldPy,
            this._worldPx + this._rw * this._worldTa,
            this._worldPy + this._rw * this._worldTc,
            this._worldPx + this._rw * this._worldTa + this._rh * this._worldTb,
            this._worldPy + this._rw * this._worldTc + this._rh * this._worldTd,
            this._worldPx + this._rh * this._worldTb,
            this._worldPy + this._rh * this._worldTd
        ];
    }

    /**
     * Clears the cache(s) for the specified tag.
     * @param {String} tag
     */
    _clearTagsCache(tag) {
        if (this._tagsCache) {
            this._tagsCache.delete(tag);

            if (this._tagToComplex) {
                let s = this._tagToComplex.get(tag);
                if (s) {
                    for (let i = 0, n = s.length; i < n; i++) {
                        this._tagsCache.delete(s[i]);
                    }
                    this._tagToComplex.delete(tag);
                }
            }
        }
    };

    _unsetTagsParent() {
        let tags = null;
        let n = 0;
        if (this._treeTags) {
            tags = Utils.iteratorToArray(this._treeTags.keys());
            n = tags.length;

            if (n > 0) {
                for (let i = 0; i < n; i++) {
                    let tagSet = this._treeTags.get(tags[i]);

                    // Remove from treeTags.
                    let p = this;
                    while (p = p._parent) {
                        let parentTreeTags = p._treeTags.get(tags[i]);

                        tagSet.forEach(function (comp) {
                            parentTreeTags.delete(comp);
                        });


                        p._clearTagsCache(tags[i]);
                    }
                }
            }
        }

    };

    _setTagsParent() {
        if (this._treeTags && this._treeTags.size) {
            let self = this;
            this._treeTags.forEach(function (tagSet, tag) {
                // Add to treeTags.
                let p = self;
                while (p = p._parent) {
                    if (!p._treeTags) {
                        p._treeTags = new Map();
                    }

                    let s = p._treeTags.get(tag);
                    if (!s) {
                        s = new Set();
                        p._treeTags.set(tag, s);
                    }

                    tagSet.forEach(function (comp) {
                        s.add(comp);
                    });

                    p._clearTagsCache(tag);
                }
            });
        }
    };

    _getByTag(tag) {
        if (!this._treeTags) {
            return [];
        }
        let t = this._treeTags.get(tag);
        return t ? Utils.setToArray(t) : [];
    };

    getTags() {
        return this._tags ? this._tags : [];
    };

    setTags(tags) {
        let i, n = tags.length;
        let removes = [];
        let adds = [];
        for (i = 0; i < n; i++) {
            if (!this.hasTag(tags[i])) {
                adds.push(tags[i]);
            }
        }

        let currentTags = this.tags || [];
        n = currentTags.length;
        for (i = 0; i < n; i++) {
            if (tags.indexOf(currentTags[i]) == -1) {
                removes.push(currentTags[i]);
            }
        }

        for (i = 0; i < removes.length; i++) {
            this.removeTag(removes[i]);
        }

        for (i = 0; i < adds.length; i++) {
            this.addTag(adds[i]);
        }
    };

    addTag(tag) {
        if (!this._tags) {
            this._tags = [];
        }
        if (this._tags.indexOf(tag) === -1) {
            this._tags.push(tag);

            // Add to treeTags hierarchy.
            let p = this;
            do {
                if (!p._treeTags) {
                    p._treeTags = new Map();
                }

                let s = p._treeTags.get(tag);
                if (!s) {
                    s = new Set();
                    p._treeTags.set(tag, s);
                }

                s.add(this);

                p._clearTagsCache(tag);
            } while (p = p._parent);
        }
    };

    removeTag(tag) {
        let i = this._tags.indexOf(tag);
        if (i !== -1) {
            this._tags.splice(i, 1);

            // Remove from treeTags hierarchy.
            let p = this;
            do {
                let list = p._treeTags.get(tag);
                if (list) {
                    list.delete(this);

                    p._clearTagsCache(tag);
                }
            } while (p = p._parent);
        }
    };

    hasTag(tag) {
        return (this._tags && (this._tags.indexOf(tag) !== -1));
    };

    /**
     * Returns one of the views from the subtree that have this tag.
     * @param {string} tag
     * @returns {View}
     */
    tag(tag) {
        let res = this.mtag(tag);
        return res[0];
    };

    /**
     * Returns all views from the subtree that have this tag.
     * @param {string} tag
     * @returns {View[]}
     */
    mtag(tag) {
        let res = null;
        if (this._tagsCache) {
            res = this._tagsCache.get(tag);
        }

        if (!res) {
            let idx = tag.indexOf(".");
            if (idx >= 0) {
                let parts = tag.split('.');
                res = this._getByTag(parts[0]);
                let level = 1;
                let c = parts.length;
                while (res.length && level < c) {
                    let resn = [];
                    for (let j = 0, n = res.length; j < n; j++) {
                        resn = resn.concat(res[j]._tags.get(parts[level]));
                    }

                    res = resn;
                    level++;
                }
            } else {
                res = this._getByTag(tag);
            }

            if (!this._tagsCache) {
                this._tagsCache = new Map();
            }

            this._tagsCache.set(tag, res);
        }
        return res;
    };

    stag(tag, settings) {
        let t = this.mtag(tag);
        let n = t.length;
        for (let i = 0; i < n; i++) {
            t[i].setSettings(settings);
        }
    }

    getLocationString() {
        let i;
        if (this._parent) {
            i = this._parent._children.indexOf(this);
            if (i >= 0) {
                let localTags = this.getTags();
                return this._parent.getLocationString() + ":" + i + "[" + this.id + "]" + (localTags.length ? "(" + localTags.join(",") + ")" : "");
            }
        }
        return "";
    };

    toString() {
        let obj = this.getSettings();
        return View.getPrettyString(obj, "");
    };

    static getPrettyString(obj, indent) {
        let children = obj.children;
        delete obj.children;

        // Convert singular json settings object.
        let colorKeys = ["color", "colorUl", "colorUr", "colorBl", "colorBr"]
        let str = JSON.stringify(obj, function (k, v) {
            if (colorKeys.indexOf(k) !== -1) {
                return "COLOR[" + v.toString(16) + "]";
            }
            return v;
        });
        str = str.replace(/"COLOR\[([a-f0-9]{1,8})\]"/g, "0x$1");

        if (children && children.length) {
            let isEmpty = (str === "{}");
            str = str.substr(0, str.length - 1) + (isEmpty ? "" : ",") + "\"children\":[\n";
            let n = children.length;
            for (let i = 0; i < n; i++) {
                str += View.getPrettyString(children[i], indent + "  ") + (i < n - 1 ? "," : "") + "\n";
            }
            str += indent + "]}";
        }

        return indent + str;
    }

    getSettings() {
        let settings = this.getNonDefaults();

        if (this._children) {
            let n = this._children.length;
            settings.children = [];
            for (let i = 0; i < n; i++) {
                settings.children.push(this._children[i].getSettings());
            }
        }

        return settings;
    }

    getNonDefaults() {
        let settings = {};

        if (this._tags && this._tags.length) {
            settings.tags = this._tags;
        }

        if (this._x !== 0) settings.x = this._x;
        if (this._y !== 0) settings.y = this._y;
        if (this._w !== 0) settings.w = this._w;
        if (this._h !== 0) settings.h = this._h;

        if (this._scaleX === this._scaleY) {
            if (this._scaleX !== 1) settings.scale = this._scaleX;
        } else {
            if (this._scaleX !== 1) settings.scaleX = this._scaleX;
            if (this._scaleY !== 1) settings.scaleY = this._scaleY;
        }

        if (this._pivotX === this._pivotY) {
            if (this._pivotX !== 0.5) settings.pivot = this._pivotX;
        } else {
            if (this._pivotX !== 0.5) settings.pivotX = this._pivotX;
            if (this._pivotY !== 0.5) settings.pivotY = this._pivotY;
        }

        if (this._mountX === this._mountY) {
            if (this._mountX !== 0) settings.mount = this._mountX;
        } else {
            if (this._mountX !== 0) settings.mountX = this._mountX;
            if (this._mountY !== 0) settings.mountY = this._mountY;
        }

        if (this._alpha !== 1) settings.alpha = this._alpha;

        if (this._rotation !== 0) settings.rotation = this._rotation;

        if (this._colorUl === this._colorUr && this._colorBl === this._colorBr && this._colorUl === this._colorBl) {
            if (this._colorUl !== 0xFFFFFFFF) settings.color = 0xFFFFFFFF;
        } else {
            if (this._colorUl !== 0xFFFFFFFF) settings.colorUl = 0xFFFFFFFF;
            if (this._colorUr !== 0xFFFFFFFF) settings.colorUr = 0xFFFFFFFF;
            if (this._colorBl !== 0xFFFFFFFF) settings.colorBl = 0xFFFFFFFF;
            if (this._colorBr !== 0xFFFFFFFF) settings.colorBr = 0xFFFFFFFF;
        }

        if (!this._visible) settings.visible = false;

        if (this._zIndex) settings.zIndex = this._zIndex;

        if (this._forceZIndexContext) settings.forceZIndexContext = true;

        if (this._clipping) settings.clipping = this._clipping;

        if (this.rect) {
            settings.rect = true;
        } else if (this.src) {
            settings.src = this.src;
        } else if (this.texture && this._viewText) {
            settings.text = this._viewText.settings.getNonDefaults();
        }

        let tnd = this._texture.getNonDefaults();
        if (Object.keys(tnd).length) {
            settings.texture = tnd;
        }

        return settings;
    };

    setSettings(settings) {
        Base.setObjectSettings(this, settings);
    }

    static getGetter(propertyPath) {
        let setter = View.PROP_GETTERS.has(propertyPath);
        if (!setter) {
            setter = new Function('obj', 'return obj.' + propertyPath);
            View.PROP_GETTERS.set(propertyPath, setter);
        }
        return setter;
    }

    static getSetter(propertyPath) {
        let setter = View.PROP_SETTERS.has(propertyPath);
        if (!setter) {
            setter = new Function('obj', 'v', 'obj.' + propertyPath + ' = v');
            View.PROP_SETTERS.set(propertyPath, setter);
        }
        return setter;
    }

    static getMerger(propertyPath) {
        return View.PROP_MERGERS[propertyPath];
    }

    get x() {
        return this._x
    }

    set x(v) {
        if (this._x !== v) {
            this._updateLocalTranslateDelta(v - this._x, 0)
            this._x = v
        }
    }

    get y() {
        return this._y
    }

    set y(v) {
        if (this._y !== v) {
            this._updateLocalTranslateDelta(0, v - this._y)
            this._y = v
        }
    }

    get w() {
        return this._w
    }

    set w(v) {
        if (this._w !== v) {
            this._w = v
            this._updateDimensions()
        }
    }

    get h() {
        return this._h
    }

    set h(v) {
        if (this._h !== v) {
            this._h = v
            this._updateDimensions()
        }
    }

    get scaleX() {
        return this._scaleX
    }

    set scaleX(v) {
        if (this._scaleX !== v) {
            this._scaleX = v
            this._updateLocalTransform()
        }
    }

    get scaleY() {
        return this._scaleY
    }

    set scaleY(v) {
        if (this._scaleY !== v) {
            this._scaleY = v
            this._updateLocalTransform()
        }
    }

    get scale() {
        return this._scaleX
    }

    set scale(v) {
        if (this._scaleX !== v || this._scaleY !== v) {
            this._scaleX = v
            this._scaleY = v
            this._updateLocalTransform()
        }
    }

    get pivotX() {
        return this._pivotX
    }

    set pivotX(v) {
        if (this._pivotX !== v) {
            this._pivotX = v
            this._updateLocalTranslate()
        }
    }

    get pivotY() {
        return this._pivotY
    }

    set pivotY(v) {
        if (this._pivotY !== v) {
            this._pivotY = v
            this._updateLocalTranslate()
        }
    }

    get pivot() {
        return this._pivotX
    }

    set pivot(v) {
        if (this._pivotX !== v || this._pivotY !== v) {
            this._pivotX = v;
            this._pivotY = v;
            this._updateLocalTranslate()
        }
    }

    get mountX() {
        return this._mountX
    }

    set mountX(v) {
        if (this._mountX !== v) {
            this._mountX = v
            this._updateLocalTranslate()
        }
    }

    get mountY() {
        return this._mountY
    }

    set mountY(v) {
        if (this._mountY !== v) {
            this._mountY = v
            this._updateLocalTranslate()
        }
    }

    get mount() {
        return this._mountX
    }

    set mount(v) {
        if (this._mountX !== v || this._mountY !== v) {
            this._mountX = v
            this._mountY = v
            this._updateLocalTranslate()
        }
    }

    get alpha() {
        return this._alpha
    }

    set alpha(v) {
        // Account for rounding errors.
        v = (v > 1 ? 1 : (v < 1e-14 ? 0 : v));
        if (this._alpha !== v) {
            let prev = this._alpha
            this._alpha = v
            this._updateLocalAlpha();
            if ((prev === 0) !== (v === 0)) this._updateActiveFlag()
        }
    }

    get rotation() {
        return this._rotation
    }

    set rotation(v) {
        if (this._rotation !== v) {
            this._rotation = v
            this._updateLocalTransform()
        }
    }

    get colorUl() {
        return this._colorUl;
    }

    set colorUl(color) {
        if (this._colorUl !== color) {
            if (this._worldAlpha) this.ctx.staticStage = false;
            this._colorUl = color;
        }
    }

    get colorUr() {
        return this._colorUr;
    }

    set colorUr(color) {
        if (this._colorUr !== color) {
            if (this._worldAlpha) this.ctx.staticStage = false;
            this._colorUr = color;
        }
    };

    get colorBl() {
        return this._colorUr;
    }

    set colorBl(color) {
        if (this._colorBl !== color) {
            if (this._worldAlpha) this.ctx.staticStage = false;
            this._colorBl = color;
        }
    };

    get colorBr() {
        return this._colorUr;
    }

    set colorBr(color) {
        if (this._colorBr !== color) {
            if (this._worldAlpha) this.ctx.staticStage = false;
            this._colorBr = color;
        }
    };

    get color() {
        return this._colorUl
    }

    set color(v) {
        if (this.colorUl !== v || this.colorUr !== v || this.colorBl !== v || this.colorBr !== v) {
            this.colorUl = v;
            this.colorUr = v;
            this.colorBl = v;
            this.colorBr = v;
        }
    }

    get visible() {
        return this._visible
    }

    set visible(v) {
        if (this._visible !== v) {
            this._visible = v
            this._updateLocalAlpha()
            this._updateActiveFlag()
        }
    }

    get zIndex() {
        return this._zIndex
    }

    set zIndex(zIndex) {
        if (this._zIndex !== zIndex) {
            if (this._worldAlpha) this.ctx.staticStage = false;

            let newZParent;

            let prevIsZContext = this._isZContext();
            if (zIndex === 0 && this._zIndex !== 0) {
                if (this._active) {
                    this.stage.zIndexUsage--;
                }

                if (this._parent === this._zParent) {
                    this._zParent._decZContextUsage();
                } else {
                    newZParent = this._parent;
                }

            } else if (zIndex !== 0 && this._zIndex === 0) {
                if (this._active) {
                    this.stage.zIndexUsage++;
                }

                newZParent = this._parent ? this._parent._findZContext() : null;
                if (newZParent === this._zParent) {
                    if (this._zParent) {
                        this._zParent._incZContextUsage();
                        this._zParent._zSort = true;
                    }
                }
            } else if (zIndex !== this._zIndex) {
                this._zParent._zSort = true;
            }

            if (newZParent !== this._zParent) {
                this._setZParent(null);
            }

            this._zIndex = zIndex;

            if (newZParent !== this._zParent) {
                this._setZParent(newZParent);
            }

            if (prevIsZContext !== this._isZContext()) {
                if (!this._isZContext()) {
                    this._disableZContext();
                } else {
                    this._enableZContext(this._parent._findZContext());
                }
            }
        }
    };

    get forceZIndexContext() {
        return this._forceZIndexContext;
    }

    set forceZIndexContext(v) {
        if (this._worldAlpha) this.ctx.staticStage = false;

        let prevIsZContext = this._isZContext();
        this._forceZIndexContext = v;

        if (prevIsZContext !== this._isZContext()) {
            if (!this._isZContext()) {
                this._disableZContext();
            } else {
                this._enableZContext(this._parent._findZContext());
            }
        }
    };

    get clipping() {
        return this._clipping;
    };

    set clipping(clipping) {
        if (clipping !== this._clipping) {
            this._setRecalc(8);
            this._clipping = clipping;
            this._setChildrenClippingParent(clipping ? this : this._clippingParent);
        }
    };

    get tags() {
        return this.getTags();
    }

    set tags(v) {
        if (!Array.isArray(v)) v = [v];
        this.setTags(v);
    }

    get children() {
        return this._children || [];
    }

    set children(children) {
        this.removeChildren();
        for (let i = 0, n = children.length; i < n; i++) {
            let o = children[i];
            if (Utils.isObjectLiteral(o)) {
                let c = this.stage.createView(o);
                c.setSettings(o);
                this.addChild(c);
            } else if (o instanceof View) {
                this.addChild(o);
            }
        }
    }

    get parent() {
        return this._parent;
    }

    get src() {
        if (this.texture && this.texture.source && this.texture.source.renderInfo && this.texture.source.renderInfo.src) {
            return this.texture.source.renderInfo.src;
        } else {
            return null;
        }
    }

    set src(v) {
        if (!v) {
            this.texture = null;
        } else if (!this.texture || !this.texture.source.renderInfo || this.texture.source.renderInfo.src !== v) {
            this.texture = this.stage.textureManager.getTexture(v);
        }
    }

    get rect() {
        return (this.texture === this.stage.rectangleTexture);
    }

    set rect(v) {
        if (v) {
            this.texture = this.stage.rectangleTexture;
        } else {
            this.texture = null;
        }
    }

    get text() {
        if (!this._viewText) {
            this._viewText = new ViewText(this);
        }

        // Give direct access to the settings.
        return this._viewText.settings;
    }

    set text(v) {
        if (v) {
            this.texture = this.stage.rectangleTexture;
        } else {
            if (!this._viewText) {
                this._viewText = new ViewText(this);
            }
            if (Utils.isString(v)) {
                this._viewText.settings.text = v;
            } else {
                this._viewText.settings.setSettings(v);
            }
        }
    }

    get rw() {
        return this._rw;
    }

    get rh() {
        return this._rh;
    }

    /**
     * @param {Number} type
     *   1: alpha
     *   2: translate
     *   4: transform
     *   8: clipping
     */
    _setRecalc(type) {
        this._recalc |= type;

        if (this._worldAlpha) {
            this.ctx.staticStage = false;
            let p = this;
            do {
                p._hasUpdates = true;
            } while ((p = p._parent) && !p._hasUpdates);
        } else {
            this._hasUpdates = true;
        }
    };

    _setRecalcForced(type, force) {
        this._recalc |= type;

        if (this._worldAlpha || force) {
            this.ctx.staticStage = false;
            let p = this;
            do {
                p._hasUpdates = true;
            } while ((p = p._parent) && !p._hasUpdates);
        } else {
            this._hasUpdates = true;
        }
    };

    _setLocalTransform(a, b, c, d) {
        this._setRecalc(4);
        this._localTa = a;
        this._localTb = b;
        this._localTc = c;
        this._localTd = d;
        this._isComplex = (b != 0) || (c != 0);
    };

    _setLocalTranslate(x, y) {
        this._setRecalc(2);
        this._localPx = x;
        this._localPy = y;
    };

    _addLocalTranslate(dx, dy) {
        this._setLocalTranslate(this._localPx + dx, this._localPy + dy);
    }

    _setLocalAlpha(a) {
        this._setRecalcForced(1, (this._parent && this._parent._worldAlpha) && a);

        if (a < 1e-14) {
            // Tiny rounding errors may cause failing visibility tests.
            a = 0;
        }

        this._localAlpha = a;
    };

    _setDimensions(w, h) {
        this._rw = w;
        this._rh = h;
        this._setRecalc(2);
    };

    _setTextureCoords(ulx, uly, brx, bry) {
        if (this._worldAlpha) this.ctx.staticStage = false;

        this._ulx = ulx;
        this._uly = uly;
        this._brx = brx;
        this._bry = bry;

        this._txCoordsUl = ((ulx * 65535 + 0.5) | 0) + ((uly * 65535 + 0.5) | 0) * 65536;
        this._txCoordsUr = ((brx * 65535 + 0.5) | 0) + ((uly * 65535 + 0.5) | 0) * 65536;
        this._txCoordsBl = ((ulx * 65535 + 0.5) | 0) + ((bry * 65535 + 0.5) | 0) * 65536;
        this._txCoordsBr = ((brx * 65535 + 0.5) | 0) + ((bry * 65535 + 0.5) | 0) * 65536;
    };

    _setDisplayedTextureSource(textureSource) {
        if (this._worldAlpha) this.ctx.staticStage = false;
        this._displayedTextureSource = textureSource;
    };

    _setInTextureAtlas(inTextureAtlas) {
        if (this._worldAlpha) this.ctx.staticStage = false;

        this.inTextureAtlas = inTextureAtlas;
    };

    _isZContext() {
        return (this._forceZIndexContext || this._zIndex !== 0 || this.isRoot() || !this._parent);
    };

    _findZContext() {
        if (this._isZContext()) {
            return this;
        } else {
            return this._parent._findZContext();
        }
    };

    _setZParent(newZParent) {
        if (this._zParent !== newZParent) {
            if (this._zParent !== null) {
                if (this._zIndex !== 0) {
                    this._zParent._decZContextUsage();
                }

                if (this._zParent._zContextUsage > 0) {
                    let index = this._zParent._zIndexedChildren.indexOf(this);
                    this._zParent._zIndexedChildren.splice(index, 1);
                }
            }

            if (newZParent !== null) {
                if (this._zIndex !== 0) {
                    newZParent._incZContextUsage();
                }

                if (newZParent._zContextUsage > 0) {
                    newZParent._zIndexedChildren.push(this);
                    newZParent._zSort = true;
                }
            }

            this._zParent = newZParent;
        }
    };

    _incZContextUsage() {
        this._zContextUsage++;
        if (this._zContextUsage === 1) {
            if (!this._zIndexedChildren) {
                this._zIndexedChildren = [];
            }
            if (this._hasChildren) {
                // Copy.
                for (let i = 0, n = this._children.length; i < n; i++) {
                    this._zIndexedChildren.push(this._children[i]);
                }
            }
        }
    };

    _decZContextUsage() {
        this._zContextUsage--;
        if (this._zContextUsage === 0) {
            this._zSort = false;
            this._zIndexedChildren.splice(0);
        }
    };

    _enableZContext(prevZContext) {
        if (prevZContext._zContextUsage > 0) {
            let self = this;
            // Transfer from upper z context to this z context.
            prevZContext._zIndexedChildren.slice().forEach(function (c) {
                if (self.isAncestorOf(c) && c._zIndex !== 0) {
                    c._setZParent(self);
                }
            });
        }
    };

    _disableZContext() {
        // Transfer from this z context to upper z context.
        if (this._zContextUsage > 0) {
            let newZParent = this._parent._findZContext();

            this._zIndexedChildren.slice().forEach(function (c) {
                if (c._zIndex !== 0) {
                    c._setZParent(newZParent);
                }
            });
        }
    };

    _sortZIndexedChildren() {
        // Insertion sort works best for almost correctly ordered arrays.
        for (let i = 1, n = this._zIndexedChildren.length; i < n; i++) {
            let a = this._zIndexedChildren[i];
            let j = i - 1;
            while (j >= 0) {
                let b = this._zIndexedChildren[j];
                if (!(a._zIndex === b._zIndex ? (a._updateTreeOrder < b._updateTreeOrder) : (a._zIndex < b._zIndex))) {
                    break;
                }

                this._zIndexedChildren[j + 1] = this._zIndexedChildren[j];
                j--;
            }

            this._zIndexedChildren[j + 1] = a;
        }
    };

    _setChildrenClippingParent(clippingParent) {
        if (this._children) {
            for (let i = 0, n = this._children.length; i < n; i++) {
                this._children[i]._setClippingParent(clippingParent);
            }
        }
    };

    _setClippingParent(clippingParent) {
        if (this._clippingParent !== clippingParent) {
            this._setRecalc(8);

            this._clippingParent = clippingParent;
            if (!this._clipping) {
                if (this._children) {
                    for (let i = 0, n = this._children.length; i < n; i++) {
                        this._children[i]._setClippingParent(clippingParent);
                    }
                }
            }

        }
    };

    update() {
        this._recalc |= this._parent._recalc;

        if (this._zSort) {
            // Make sure that all descendants are updated so that the updateTreeOrder flags are correctly set.
            this.ctx.updateTreeOrderForceUpdate++;
        }

        let forceUpdate = (this.ctx.updateTreeOrderForceUpdate > 0);
        if (this._recalc & 1) {
            // If case of becoming invisible, we must update the children because they may be z-indexed.
            forceUpdate = this._worldAlpha && !(this._parent._worldAlpha && this._localAlpha);

            this._worldAlpha = this._parent._worldAlpha * this._localAlpha;

            if (this._worldAlpha < 1e-14) {
                // Tiny rounding errors may cause failing visibility tests.
                this._worldAlpha = 0;
            }
        }

        if (this._worldAlpha || forceUpdate) {
            if (this._recalc & 6) {
                this._worldPx = this._parent._worldPx + this._localPx * this._parent._worldTa;
                this._worldPy = this._parent._worldPy + this._localPy * this._parent._worldTd;
            }

            if (this._recalc & 4) {
                this._worldTa = this._localTa * this._parent._worldTa;
                this._worldTb = this._localTd * this._parent._worldTb;
                this._worldTc = this._localTa * this._parent._worldTc;
                this._worldTd = this._localTd * this._parent._worldTd;

                if (this._isComplex) {
                    this._worldTa += this._localTc * this._parent._worldTb;
                    this._worldTb += this._localTb * this._parent._worldTa;
                    this._worldTc += this._localTc * this._parent._worldTd;
                    this._worldTd += this._localTb * this._parent._worldTc;
                }
            }

            if ((this._recalc & 6) && (this._parent._worldTb !== 0 || this._parent._worldTc !== 0)) {
                this._worldPx += this._localPy * this._parent._worldTb;
                this._worldPy += this._localPx * this._parent._worldTc;
            }

            if ((this._recalc & 14 /* 2 + 4 + 8 */) && (this._clippingParent || this._clipping)) {
                // We must calculate the clipping area.
                let c1x, c1y, c2x, c2y, c3x, c3y;

                let cp = this._clippingParent;
                if (cp && cp._clippingEmpty) {
                    this._clippingEmpty = true;
                    this._clippingArea = null;
                    this._clippingNoEffect = false;
                } else {
                    this._clippingNoEffect = false;
                    this._clippingEmpty = false;
                    this._clippingArea = null;
                    if (cp) {
                        if (cp._clippingSquare && (this._worldTb === 0 && this._worldTc === 0 && this._worldTa > 0 && this._worldTd > 0)) {
                            // Special case: 'easy square clipping'.
                            this._clippingSquare = true;

                            c2x = this._worldPx + this._rw * this._worldTa;
                            c2y = this._worldPy + this._rh * this._worldTd;

                            this._clippingSquareMinX = this._worldPx;
                            this._clippingSquareMaxX = c2x;
                            this._clippingSquareMinY = this._worldPy;
                            this._clippingSquareMaxY = c2y;

                            if ((this._clippingSquareMinX >= cp._clippingSquareMinX) && (this._clippingSquareMaxX <= cp._clippingSquareMaxX) && (this._clippingSquareMinY >= cp._clippingSquareMinY) && (this._clippingSquareMaxY <= cp._clippingSquareMaxY)) {
                                // No effect.
                                this._clippingNoEffect = true;

                                if (this._clipping) {
                                    this._clippingSquareMinX = this._worldPx;
                                    this._clippingSquareMaxX = c2x;
                                    this._clippingSquareMinY = this._worldPy;
                                    this._clippingSquareMaxY = c2y;
                                }
                            } else {
                                this._clippingSquareMinX = Math.max(this._clippingSquareMinX, cp._clippingSquareMinX);
                                this._clippingSquareMaxX = Math.min(this._clippingSquareMaxX, cp._clippingSquareMaxX);
                                this._clippingSquareMinY = Math.max(this._clippingSquareMinY, cp._clippingSquareMinY);
                                this._clippingSquareMaxY = Math.min(this._clippingSquareMaxY, cp._clippingSquareMaxY);
                                if (this._clippingSquareMaxX < this._clippingSquareMinX || this._clippingSquareMaxY < this._clippingSquareMinY) {
                                    this._clippingEmpty = true;
                                }
                            }
                        } else {
                            //c0x = this._worldPx;
                            //c0y = this._worldPy;
                            c1x = this._worldPx + this._rw * this._worldTa;
                            c1y = this._worldPy + this._rw * this._worldTc;
                            c2x = this._worldPx + this._rw * this._worldTa + this._rh * this._worldTb;
                            c2y = this._worldPy + this._rw * this._worldTc + this._rh * this._worldTd;
                            c3x = this._worldPx + this._rh * this._worldTb;
                            c3y = this._worldPy + this._rh * this._worldTd;

                            // Complex shape.
                            this._clippingSquare = false;
                            let cornerPoints = [this._worldPx, this._worldPy, c1x, c1y, c2x, c2y, c3x, c3y];

                            if (cp._clippingSquare && !cp._clippingArea) {
                                // We need a clipping area to use for intersection.
                                cp._clippingArea = [cp._clippingSquareMinX, cp._clippingSquareMinY, cp._clippingSquareMaxX, cp._clippingSquareMinY, cp._clippingSquareMaxX, cp._clippingSquareMaxY, cp._clippingSquareMinX, cp._clippingSquareMaxY];
                            }

                            this._clippingArea = GeometryUtils.intersectConvex(cp._clippingArea, cornerPoints);
                            this._clippingEmpty = (this._clippingArea.length === 0);
                            this._clippingNoEffect = (cornerPoints === this._clippingArea);
                        }
                    } else {
                        c1x = this._worldPx + this._rw * this._worldTa;
                        c3y = this._worldPy + this._rh * this._worldTd;

                        // Just use the corner points.
                        if (this._worldTb === 0 && this._worldTc === 0 && this._worldTa > 0 && this._worldTd > 0) {
                            // Square.
                            this._clippingSquare = true;
                            if (this._clipping) {
                                this._clippingSquareMinX = this._worldPx;
                                this._clippingSquareMaxX = c1x;
                                this._clippingSquareMinY = this._worldPy;
                                this._clippingSquareMaxY = c3y;
                            }
                            this._clippingEmpty = false;
                            this._clippingNoEffect = true;
                        } else {
                            c1y = this._worldPy + this._rw * this._worldTc;
                            c2x = this._worldPx + this._rw * this._worldTa + this._rh * this._worldTb;
                            c2y = this._worldPy + this._rw * this._worldTc + this._rh * this._worldTd;
                            c3x = this._worldPx + this._rh * this._worldTb;

                            // Complex shape.
                            this._clippingSquare = false;
                            if (this._clipping) {
                                this._clippingArea = [this._worldPx, this._worldPy, c1x, c1y, c2x, c2y, c3x, c3y];
                            }
                            this._clippingEmpty = false;
                            this._clippingNoEffect = true;
                        }
                    }
                }
            }

            if (!this.ctx.useZIndexing) {
                // Use single pass.
                if (this._displayedTextureSource) {
                    this._addToVbo();
                }
            } else {
                this._updateTreeOrder = this.ctx._updateTreeOrder++;
            }

            this._recalc = (this._recalc & 7);
            /* 1+2+4 */

            if (this._hasChildren) {
                for (let i = 0, n = this._children.length; i < n; i++) {
                    if ((this.ctx.updateTreeOrderForceUpdate > 0) || this._recalc || this._children[i]._hasUpdates) {
                        this._children[i].update();
                    } else if (!this.ctx.useZIndexing) {
                        this._children[i].fillVbo();
                    }
                }
            }

            this._recalc = 0;

            this._hasUpdates = false;

        }

        if (this._zSort) {
            this.ctx.updateTreeOrderForceUpdate--;
        }

    };

    _addToVbo() {
        let vboIndex = this.ctx.vboIndex;
        let vboBufferFloat = this.ctx.vboBufferFloat;
        let vboBufferUint = this.ctx.vboBufferUint;

        if (this._clippingParent && !this._clippingNoEffect) {
            if (!this._clippingEmpty) {
                this._addToVboClipped();
            }
        } else {
            if (this._worldTb !== 0 || this._worldTc !== 0) {
                if (vboIndex < 262144) {
                    vboBufferFloat[vboIndex++] = this._worldPx;
                    vboBufferFloat[vboIndex++] = this._worldPy;
                    vboBufferUint[vboIndex++] = this._txCoordsUl; // Texture.
                    vboBufferUint[vboIndex++] = getColorInt(this.colorUl, this._worldAlpha);
                    vboBufferFloat[vboIndex++] = this._worldPx + this._rw * this._worldTa;
                    vboBufferFloat[vboIndex++] = this._worldPy + this._rw * this._worldTc;
                    vboBufferUint[vboIndex++] = this._txCoordsUr;
                    vboBufferUint[vboIndex++] = getColorInt(this.colorUr, this._worldAlpha);
                    vboBufferFloat[vboIndex++] = this._worldPx + this._rw * this._worldTa + this._rh * this._worldTb;
                    vboBufferFloat[vboIndex++] = this._worldPy + this._rw * this._worldTc + this._rh * this._worldTd;
                    vboBufferUint[vboIndex++] = this._txCoordsBr;
                    vboBufferUint[vboIndex++] = getColorInt(this.colorBr, this._worldAlpha);
                    vboBufferFloat[vboIndex++] = this._worldPx + this._rh * this._worldTb;
                    vboBufferFloat[vboIndex++] = this._worldPy + this._rh * this._worldTd;
                    vboBufferUint[vboIndex++] = this._txCoordsBl;
                    vboBufferUint[vboIndex] = getColorInt(this.colorBl, this._worldAlpha);
                    this.ctx.addVboTextureSource(this._displayedTextureSource, 1);
                }
            } else {
                // Simple.
                let cx = this._worldPx + this._rw * this._worldTa;
                let cy = this._worldPy + this._rh * this._worldTd;

                if (vboIndex < 262144) {
                    vboBufferFloat[vboIndex++] = this._worldPx;
                    vboBufferFloat[vboIndex++] = this._worldPy;
                    vboBufferUint[vboIndex++] = this._txCoordsUl; // Texture.
                    vboBufferUint[vboIndex++] = getColorInt(this.colorUl, this._worldAlpha);
                    vboBufferFloat[vboIndex++] = cx;
                    vboBufferFloat[vboIndex++] = this._worldPy;
                    vboBufferUint[vboIndex++] = this._txCoordsUr;
                    vboBufferUint[vboIndex++] = getColorInt(this.colorUr, this._worldAlpha);
                    vboBufferFloat[vboIndex++] = cx;
                    vboBufferFloat[vboIndex++] = cy;
                    vboBufferUint[vboIndex++] = this._txCoordsBr;
                    vboBufferUint[vboIndex++] = getColorInt(this.colorBr, this._worldAlpha);
                    vboBufferFloat[vboIndex++] = this._worldPx;
                    vboBufferFloat[vboIndex++] = cy;
                    vboBufferUint[vboIndex++] = this._txCoordsBl;
                    vboBufferUint[vboIndex] = getColorInt(this.colorBl, this._worldAlpha);
                    this.ctx.addVboTextureSource(this._displayedTextureSource, 1);
                }
            }
        }
    };

    _addToVboClipped() {
        let vboIndex = this.ctx.vboIndex;
        let vboBufferFloat = this.ctx.vboBufferFloat;
        let vboBufferUint = this.ctx.vboBufferUint;

        // Gradients are not supported for clipped quads.
        let c = getColorInt(this.colorUl, this._worldAlpha);

        if (this._clippingSquare) {
            // Inverse matrix.
            let ux = this._rw * this._worldTa;
            let vy = this._rh * this._worldTd;

            let d = 1 / (ux * vy);
            let invTa = vy * d;
            let invTd = ux * d;

            // Get ranges from 0 to 1.
            let tx1 = invTa * (this._clippingSquareMinX - this._worldPx);
            let ty1 = invTd * (this._clippingSquareMinY - this._worldPy);
            let tx3 = invTa * (this._clippingSquareMaxX - this._worldPx);
            let ty3 = invTd * (this._clippingSquareMaxY - this._worldPy);

            // Calculate texture coordinates for clipped corner points.
            let tcx1 = this._ulx * (1 - tx1) + this._brx * tx1;
            let tcy1 = this._uly * (1 - ty1) + this._bry * ty1;
            let tcx3 = this._ulx * (1 - tx3) + this._brx * tx3;
            let tcy3 = this._uly * (1 - ty3) + this._bry * ty3;

            if (vboIndex < 262144) {
                vboBufferFloat[vboIndex++] = this._clippingSquareMinX;
                vboBufferFloat[vboIndex++] = this._clippingSquareMinY;
                vboBufferUint[vboIndex++] = getVboTextureCoords(tcx1, tcy1);
                vboBufferUint[vboIndex++] = c;
                vboBufferFloat[vboIndex++] = this._clippingSquareMaxX;
                vboBufferFloat[vboIndex++] = this._clippingSquareMinY;
                vboBufferUint[vboIndex++] = getVboTextureCoords(tcx3, tcy1);
                vboBufferUint[vboIndex++] = c;
                vboBufferFloat[vboIndex++] = this._clippingSquareMaxX;
                vboBufferFloat[vboIndex++] = this._clippingSquareMaxY;
                vboBufferUint[vboIndex++] = getVboTextureCoords(tcx3, tcy3);
                vboBufferUint[vboIndex++] = c;
                vboBufferFloat[vboIndex++] = this._clippingSquareMinX;
                vboBufferFloat[vboIndex++] = this._clippingSquareMaxY;
                vboBufferUint[vboIndex++] = getVboTextureCoords(tcx1, tcy3);
                vboBufferUint[vboIndex] = c;
                this.ctx.addVboTextureSource(this._displayedTextureSource, 1);
            }
        } else {
            // Complex clipping.

            // Inverse matrix.
            let ux = this._rw * this._worldTa;
            let uy = this._rw * this._worldTc;
            let vx = this._rh * this._worldTb;
            let vy = this._rh * this._worldTd;

            let d = 1 / (ux * vy - vx * uy);
            let invTa = vy * d;
            let invTb = -vx * d;
            let invTc = -uy * d;
            let invTd = ux * d;

            let n = Math.ceil(((this._clippingArea.length / 2) - 2) / 2);

            if (n === 1) {
                // Texture coordinates.
                let tx1 = invTa * (this._clippingArea[0] - this._worldPx) + invTb * (this._clippingArea[1] - this._worldPy);
                let ty1 = invTc * (this._clippingArea[0] - this._worldPx) + invTd * (this._clippingArea[1] - this._worldPy);
                let tx2 = invTa * (this._clippingArea[2] - this._worldPx) + invTb * (this._clippingArea[3] - this._worldPy);
                let ty2 = invTc * (this._clippingArea[2] - this._worldPx) + invTd * (this._clippingArea[3] - this._worldPy);
                let tx3 = invTa * (this._clippingArea[4] - this._worldPx) + invTb * (this._clippingArea[5] - this._worldPy);
                let ty3 = invTc * (this._clippingArea[4] - this._worldPx) + invTd * (this._clippingArea[5] - this._worldPy);

                // Check for polygon instead of quad.
                let g = this._clippingArea.length <= 6 ? 4 : 6;
                let tx4 = invTa * (this._clippingArea[g] - this._worldPx) + invTb * (this._clippingArea[g + 1] - this._worldPy);
                let ty4 = invTc * (this._clippingArea[g] - this._worldPx) + invTd * (this._clippingArea[g + 1] - this._worldPy);

                if (vboIndex < 262144) {
                    vboBufferFloat[vboIndex++] = this._clippingArea[0];
                    vboBufferFloat[vboIndex++] = this._clippingArea[1];
                    vboBufferUint[vboIndex++] = getVboTextureCoords(this._ulx * (1 - tx1) + this._brx * tx1, this._uly * (1 - ty1) + this._bry * ty1);
                    vboBufferUint[vboIndex++] = c;
                    vboBufferFloat[vboIndex++] = this._clippingArea[2];
                    vboBufferFloat[vboIndex++] = this._clippingArea[3];
                    vboBufferUint[vboIndex++] = getVboTextureCoords(this._ulx * (1 - tx2) + this._brx * tx2, this._uly * (1 - ty2) + this._bry * ty2);
                    vboBufferUint[vboIndex++] = c;
                    vboBufferFloat[vboIndex++] = this._clippingArea[4];
                    vboBufferFloat[vboIndex++] = this._clippingArea[5];
                    vboBufferUint[vboIndex++] = getVboTextureCoords(this._ulx * (1 - tx3) + this._brx * tx3, this._uly * (1 - ty3) + this._bry * ty3);
                    vboBufferUint[vboIndex++] = c;
                    vboBufferFloat[vboIndex++] = this._clippingArea[g];
                    vboBufferFloat[vboIndex++] = this._clippingArea[g + 1];
                    vboBufferUint[vboIndex++] = getVboTextureCoords(this._ulx * (1 - tx4) + this._brx * tx4, this._uly * (1 - ty4) + this._bry * ty4);
                    vboBufferUint[vboIndex] = c;
                    this.ctx.addVboTextureSource(this._displayedTextureSource, 1);
                }
            } else {
                // Multiple quads.
                let g;
                for (let i = 0; i < n; i++) {
                    let b = i * 4 + 2;
                    g = b + 4;
                    if (g >= this._clippingArea.length) {
                        // Roll-over: convert polygon to quad.
                        g -= 2;
                    }

                    // Texture coordinates.
                    let tx1 = invTa * (this._clippingArea[0] - this._worldPx) + invTb * (this._clippingArea[1] - this._worldPy);
                    let ty1 = invTc * (this._clippingArea[0] - this._worldPx) + invTd * (this._clippingArea[1] - this._worldPy);
                    let tx2 = invTa * (this._clippingArea[b] - this._worldPx) + invTb * (this._clippingArea[b + 1] - this._worldPy);
                    let ty2 = invTc * (this._clippingArea[b] - this._worldPx) + invTd * (this._clippingArea[b + 1] - this._worldPy);
                    let tx3 = invTa * (this._clippingArea[b + 2] - this._worldPx) + invTb * (this._clippingArea[b + 3] - this._worldPy);
                    let ty3 = invTc * (this._clippingArea[b + 2] - this._worldPx) + invTd * (this._clippingArea[b + 3] - this._worldPy);
                    let tx4 = invTa * (this._clippingArea[g] - this._worldPx) + invTb * (this._clippingArea[g + 1] - this._worldPy);
                    let ty4 = invTc * (this._clippingArea[g] - this._worldPx) + invTd * (this._clippingArea[g + 1] - this._worldPy);

                    if (vboIndex < 262144) {
                        vboBufferFloat[vboIndex++] = this._clippingArea[0];
                        vboBufferFloat[vboIndex++] = this._clippingArea[1];
                        vboBufferUint[vboIndex++] = getVboTextureCoords(this._ulx * (1 - tx1) + this._brx * tx1, this._uly * (1 - ty1) + this._bry * ty1);
                        vboBufferUint[vboIndex++] = c;
                        vboBufferFloat[vboIndex++] = this._clippingArea[b];
                        vboBufferFloat[vboIndex++] = this._clippingArea[b + 1];
                        vboBufferUint[vboIndex++] = getVboTextureCoords(this._ulx * (1 - tx2) + this._brx * tx2, this._uly * (1 - ty2) + this._bry * ty2);
                        vboBufferUint[vboIndex++] = c;
                        vboBufferFloat[vboIndex++] = this._clippingArea[b + 2];
                        vboBufferFloat[vboIndex++] = this._clippingArea[b + 3];
                        vboBufferUint[vboIndex++] = getVboTextureCoords(this._ulx * (1 - tx3) + this._brx * tx3, this._uly * (1 - ty3) + this._bry * ty3);
                        vboBufferUint[vboIndex++] = c;
                        vboBufferFloat[vboIndex++] = this._clippingArea[g];
                        vboBufferFloat[vboIndex++] = this._clippingArea[g + 1];
                        vboBufferUint[vboIndex++] = getVboTextureCoords(this._ulx * (1 - tx4) + this._brx * tx4, this._uly * (1 - ty4) + this._bry * ty4);
                        vboBufferUint[vboIndex] = c;
                        this.ctx.addVboTextureSource(this._displayedTextureSource, 1);
                    }
                }
            }
        }
    };

    fillVbo() {
        if (this._zSort) {
            this._sortZIndexedChildren();
            this._zSort = false;
        }

        if (this._worldAlpha) {
            if (this._displayedTextureSource) {
                this._addToVbo();
            }

            if (this._hasChildren) {
                if (this._zContextUsage) {
                    for (let i = 0, n = this._zIndexedChildren.length; i < n; i++) {
                        this._zIndexedChildren[i].fillVbo();
                    }
                } else {
                    for (let i = 0, n = this._children.length; i < n; i++) {
                        if (this._children[i]._zIndex === 0) {
                            // If zIndex is set, this item already belongs to a zIndexedChildren array in one of the ancestors.
                            this._children[i].fillVbo();
                        }
                    }
                }
            }
        }
    };

}

let getColorInt = function (c, alpha) {
    let a = ((c / 16777216 | 0) * alpha) | 0;
    return (((((c >> 16) & 0xff) * a) >> 8) & 0xff) +
        ((((c & 0xff00) * a) >> 8) & 0xff00) +
        (((((c & 0xff) << 16) * a) >> 8) & 0xff0000) +
        (a << 24);
};

let getVboTextureCoords = function (x, y) {
    return ((x * 65535 + 0.5) | 0) + ((y * 65535 + 0.5) | 0) * 65536;
};

View.id = 1;

// Getters reused when referencing view (subobject) properties by a property path, as used in a transition or animation ('x', 'texture.x', etc).
View.PROP_GETTERS = new Map();

// Setters reused when referencing view (subobject) properties by a property path, as used in a transition or animation ('x', 'texture.x', etc).
View.PROP_SETTERS = new Map();

let mn = StageUtils.mergeNumbers, mc = StageUtils.mergeColors;
View.PROP_MERGERS = {
    'x': mn,
    'y': mn,
    'w': mn,
    'h': mn,
    'scale': mn,
    'scaleX': mn,
    'scaleY': mn,
    'pivot': mn,
    'pivotX': mn,
    'pivotY': mn,
    'mount': mn,
    'mountX': mn,
    'mountY': mn,
    'alpha': mn,
    'rotation': mn,
    'color': mc,
    'colorUl': mc,
    'colorUr': mc,
    'colorBl': mc,
    'colorBr': mc,
    'texture.x': mn,
    'texture.y': mn,
    'texture.w': mn,
    'texture.h': mn
};

let Utils = require('../core/Utils');
/*M¬*/let EventEmitter = require(Utils.isNode ? 'events' : '../browser/EventEmitter');/*¬M*/

Base.mixinEs5(View, EventEmitter);

module.exports = View;

let GeometryUtils = require('./GeometryUtils');
let ViewText = require('./ViewText');
let Texture = require('./Texture');
