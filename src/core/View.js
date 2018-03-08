/**
 * Render tree node.
 * Copyright Metrological, 2017
 */

let StageUtils = require('./StageUtils');
let ViewCore = require('./core/ViewCore');
let Base = require('./Base');

let Utils = require('./Utils');
/*M¬*/let EventEmitter = require(Utils.isNode ? 'events' : '../browser/EventEmitter');/*¬M*/

class View extends EventEmitter {

    constructor(stage) {
        super()

        this.id = View.id++;

        this.stage = stage;

        this._core = new ViewCore(this);

        /**
         * A reference that can be used while merging trees.
         * @type {string}
         */
        this._ref = null;

        /**
         * A view is attached if it is a descendant of the stage root.
         * @type {boolean}
         */
        this._attached = false;

        /**
         * A view is enabled when it is attached and it is visible (worldAlpha > 0).
         * @type {boolean}
         */
        this._enabled = false;

        /**
         * A view is active when it is enabled and it is within bounds.
         * @type {boolean}
         */
        this._active = false;

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

        /**
         * Creates a tag context: tagged views in this branch will not be reachable from ancestors of this view.
         * @type {boolean}
         * @private
         */
        this._tagRoot = false;

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

        /**
         * The text functionality in case this view is a text view.
         * @type {ViewText}
         */
        this._viewText = null;

        /**
         * (Lazy-initialised) list of children owned by this view.
         * @type {ViewChildList}
         */
        this._childList = null;

    }

    set ref(ref) {
        if (this._ref !== ref) {
            const charcode = ref.charCodeAt(0)
            if (!Utils.isUcChar(charcode)) {
                this._throwError("Ref must start with an upper case character: " + ref)
            }
            if (this._ref !== null) {
                this.removeTag(this._ref)
            }
            this._ref = ref
            this._addTag(this._ref)
        }
    }

    get ref() {
        return this._ref
    }

    setAsRoot() {
        this._updateAttachedFlag();
        this._updateEnabledFlag();
        this._core.setAsRoot();
    }

    _setParent(parent) {
        if (this._parent === parent) return;

        if (this._parent) {
            this._unsetTagsParent();
        }

        this._parent = parent;

        if (parent) {
            this._setTagsParent();
        }

        this._updateAttachedFlag();
        this._updateEnabledFlag();
    };

    getDepth() {
        let depth = 0;

        let p = this._parent;
        while(p) {
            depth++;
            p = p._parent;
        }

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

    get attached() {
        return this._attached
    }

    get enabled() {
        return this._enabled
    }

    get active() {
        return this._active
    }

    isAttached() {
        return (this._parent ? this._parent._attached : (this.stage.root === this));
    };

    isEnabled() {
        return this._visible && (this._alpha > 0) && (this._parent ? this._parent._enabled : (this.stage.root === this));
    };

    isActive() {
        return this.isEnabled() && this.withinBoundsMargin;
    };

    /**
     * Updates the 'attached' flag for this branch.
     */
    _updateAttachedFlag() {
        let newAttached = this.isAttached();
        if (this._attached !== newAttached) {
            this._attached = newAttached;

            let children = this._children.get();
            if (children) {
                let m = children.length;
                if (m > 0) {
                    for (let i = 0; i < m; i++) {
                        children[i]._updateAttachedFlag();
                    }
                }
            }

            if (newAttached) {
                this.emit('attach');
            } else {
                this.emit('detach');
            }
        }
    };

    /**
     * Updates the 'enabled' flag for this branch.
     */
    _updateEnabledFlag() {
        let newEnabled = this.isEnabled();
        if (this._enabled !== newEnabled) {
            if (newEnabled) {
                this._setEnabledFlag();
            } else {
                this._unsetEnabledFlag();
            }

            let children = this._children.get();
            if (children) {
                let m = children.length;
                if (m > 0) {
                    for (let i = 0; i < m; i++) {
                        children[i]._updateEnabledFlag();
                    }
                }
            }

            // Run this after all _children because we'd like to see (de)activating a branch as an 'atomic' operation.
            if (newEnabled) {
                this.emit('enabled');
            } else {
                this.emit('disabled');
            }
        }
    };

    _setEnabledFlag() {
        // Force re-check of texture because dimensions might have changed (cutting).
        this._updateDimensions();
        this._updateTextureCoords();

        this._enabled = true;

        if (this._texture) {
            // It is important to add the source listener before the texture listener because that may trigger a load.
            this._texture.source.addView(this)
        }

        if (this.withinBoundsMargin) {
            this._setActiveFlag()
        }

        if (this._core.shader) {
            this._core.shader.addView(this._core);
        }

        if (this._texturizer) {
            this.texturizer.filters.forEach(filter => filter.addView(this._core))
        }

    }

    _unsetEnabledFlag() {
        if (this._active) {
            this._unsetActiveFlag()
        }

        if (this._texture) {
            this._texture.source.removeView(this)
        }

        if (this._hasTexturizer()) {
            this.texturizer.deactivate();
        }

        if (this._core.shader) {
            this._core.shader.removeView(this._core);
        }

        if (this._texturizer) {
            this.texturizer.filters.forEach(filter => filter.removeView(this._core))
        }

        this._enabled = false;
    }

    _setActiveFlag() {
        this._active = true
        if (this._texture) {
            this._enableTexture()
        }
        this.emit('active')
    }

    _unsetActiveFlag() {
        this._active = false;
        if (this._texture) {
            this._disableTexture()
        }
        this.emit('inactive')
    }

    _getRenderWidth() {
        if (this._w) {
            return this._w;
        } else if (this._displayedTexture) {
            return this._displayedTexture.getRenderWidth() / this._displayedTexture.precision;
        } else if (this._texture) {
            // Texture already loaded, but not yet updated (probably because this view is not active).
            return this._texture.getRenderWidth() / this._texture.precision;
        } else {
            return 0;
        }
    };

    _getRenderHeight() {
        if (this._h) {
            return this._h;
        } else if (this._displayedTexture) {
            return this._displayedTexture.getRenderHeight() / this._displayedTexture.precision;
        } else if (this._texture) {
            // Texture already loaded, but not yet updated (probably because this view is not active).
            return this._texture.getRenderHeight() / this._texture.precision;
        } else {
            return 0;
        }
    };

    get renderWidth() {
        if (this._enabled) {
            // Render width is only maintained if this view is enabled.
            return this._core._rw;
        } else {
            return this._getRenderWidth();
        }
    }

    get renderHeight() {
        if (this._enabled) {
            return this._core._rh;
        } else {
            return this._getRenderHeight();
        }
    }

    textureIsLoaded() {
        return this.texture ? !!this.texture.source.glTexture : false;
    }

    loadTexture(sync) {
        if (this.texture) {
            this.texture.source.load(sync);
        }
    }

    _enableTexture() {
        // Detect texture changes.
        let dt = null;
        if (this._texture && this._texture.source.glTexture) {
            dt = this._texture;
        }

        // We must force because the texture source may have been replaced while being invisible.
        this._setDisplayedTexture(dt)
    }

    _disableTexture() {
        // We disable the displayed texture because, when the texture changes while invisible, we should use that w, h,
        // mw, mh for checking within bounds.
        this._setDisplayedTexture(null)
    }

    get texture() {
        return this._texture;
    }

    set texture(v) {
        if (v && Utils.isObjectLiteral(v)) {
            if (this.texture) {
                this.texture.patch(v);
            } else {
                console.warn('Trying to set texture properties, but there is no texture.');
            }
            return;
        }

        let prevValue = this._texture;
        if (v !== prevValue) {
            if (v !== null) {
                if (v instanceof TextureSource) {
                    v = this.stage.texture(v);
                } else if (!(v instanceof Texture)) {
                    console.error('incorrect value for texture');
                    return;
                }
            }

            this._texture = v;

            if (this._enabled) {
                if (prevValue && (!v || prevValue.source !== v.source) && (!this.displayedTexture || (this.displayedTexture.source !== prevValue.source))) {
                    prevValue.source.removeView(this);
                }

                if (v) {
                    // When the texture is changed, maintain the texture's sprite registry.
                    // While the displayed texture is different from the texture (not yet loaded), two textures are referenced.
                    v.source.addView(this);
                }
            }

            if (v) {
                if (v.source.glTexture && this._enabled && this.withinBoundsMargin) {
                    this._setDisplayedTexture(v);
                }
            } else {
                // Make sure that current texture is cleared when the texture is explicitly set to null.
                // This also makes sure that dimensions are updated.
                this._setDisplayedTexture(null);
            }

            this._updateDimensions()
        }
    }

    get displayedTexture() {
        return this._displayedTexture;
    }

    _setDisplayedTexture(v) {
        let prevValue = this._displayedTexture;

        const changed = (v !== prevValue || (v && v.source !== prevValue.source))

        if (prevValue && (prevValue !== this._texture)) {
            if (!v || (prevValue.source !== v.source)) {
                // The old displayed texture is deprecated.
                prevValue.source.removeView(this);
            }
        }

        this._displayedTexture = v;

        if (this._displayedTexture) {
            // We can manage views here because we know for sure that the view is both visible and within bounds.
            this._displayedTexture.source.addView(this)
        }

        this._updateDimensions();

        if (v) {
            // We don't need to reference the displayed texture because it was already referenced (this.texture === this.displayedTexture).
            this._updateTextureCoords();
            this._core.setDisplayedTextureSource(v.source);
        } else {
            this._core.setDisplayedTextureSource(null);
        }

        if (changed) {
            if (v) {
                this.emit('txLoaded', v);
            } else {
                this.emit('txUnloaded', v);
            }
        }
    }

    onTextureSourceLoaded() {
        // We may be dealing with a texture reloading, so we must force update.
        this._setDisplayedTexture(this._texture);
    };

    onTextureSourceLoadError(e) {
        this.emit('txError', e, this._texture.source);
    };

    forceRenderUpdate() {
        this._core.setHasRenderUpdates(3)
    }

    onDisplayedTextureClippingChanged() {
        this._updateDimensions();
        this._updateTextureCoords();
    };

    onPrecisionChanged() {
        this._updateDimensions();
    };

    _updateDimensions() {
        let beforeW = this._core.rw;
        let beforeH = this._core.rh;
        let rw = this._getRenderWidth();
        let rh = this._getRenderHeight();
        if (beforeW !== rw || beforeH !== rh) {
            // Due to width/height change: update the translation vector and borders.
            this._core.setDimensions(rw, rh);
            this._updateLocalTranslate();

            // Returning whether there was an update is handy for extending classes.
            return true
        }
        return false
    }

    _updateLocalTransform() {
        if (this._rotation !== 0 && this._rotation % (2 * Math.PI)) {
            // check to see if the rotation is the same as the previous render. This means we only need to use sin and cos when rotation actually changes
            let _sr = Math.sin(this._rotation);
            let _cr = Math.cos(this._rotation);

            this._core.setLocalTransform(
                _cr * this._scaleX,
                -_sr * this._scaleY,
                _sr * this._scaleX,
                _cr * this._scaleY
            );
        } else {
            this._core.setLocalTransform(
                this._scaleX,
                0,
                0,
                this._scaleY
            );
        }
        this._updateLocalTranslate();
    };

    _updateLocalTranslate() {
        let pivotXMul = this._pivotX * this._core.rw;
        let pivotYMul = this._pivotY * this._core.rh;
        let px = this._x - (pivotXMul * this._core.localTa + pivotYMul * this._core.localTb) + pivotXMul;
        let py = this._y - (pivotXMul * this._core.localTc + pivotYMul * this._core.localTd) + pivotYMul;
        px -= this._mountX * this.renderWidth;
        py -= this._mountY * this.renderHeight;
        this._core.setLocalTranslate(
            px,
            py
        );
    };

    _updateLocalTranslateDelta(dx, dy) {
        this._core.addLocalTranslate(dx, dy)
    };

    _updateLocalAlpha() {
        this._core.setLocalAlpha(this._visible ? this._alpha : 0);
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

                let prec = displayedTexture.precision;

                if (displayedTexture.w) {
                    rw = (displayedTexture.w * prec) * iw;
                } else {
                    rw = (w - (displayedTexture.x * prec)) * iw;
                }

                if (displayedTexture.h) {
                    rh = (displayedTexture.h * prec) * ih;
                } else {
                    rh = (h - (displayedTexture.y * prec)) * ih;
                }

                iw *= (displayedTexture.x * prec);
                ih *= (displayedTexture.y * prec);

                tx1 = Math.min(1.0, Math.max(0, iw));
                ty1 = Math.min(1.0, Math.max(ih));
                tx2 = Math.min(1.0, Math.max(tx2 * rw + iw));
                ty2 = Math.min(1.0, Math.max(ty2 * rh + ih));
            }

            this._core.setTextureCoords(tx1, ty1, tx2, ty2);
        }
    }

    getCornerPoints() {
        return this._core.getCornerPoints();
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
            if (this._tagRoot) {
                // Just need to remove the 'local' tags.
                if (this._tags) {
                    this._tags.forEach((tag) => {
                        // Remove from treeTags.
                        let p = this;
                        while (p = p._parent) {
                            let parentTreeTags = p._treeTags.get(tag);
                            parentTreeTags.delete(this);
                            p._clearTagsCache(tag);

                            if (p._tagRoot) {
                                break
                            }
                        }
                    });
                }
            } else {
                tags = Utils.iteratorToArray(this._treeTags.keys());
                n = tags.length;

                if (n > 0) {
                    for (let i = 0; i < n; i++) {
                        let tagSet = this._treeTags.get(tags[i]);

                        // Remove from treeTags.
                        let p = this;
                        while ((p = p._parent) && !p._tagRoot) {
                            let parentTreeTags = p._treeTags.get(tags[i]);

                            tagSet.forEach(function (comp) {
                                parentTreeTags.delete(comp);
                            });


                            p._clearTagsCache(tags[i]);
                        }
                    }
                }
            }
        }
    };

    _setTagsParent() {
        if (this._treeTags && this._treeTags.size) {
            if (this._tagRoot) {
                // Just copy over the 'local' tags.
                if (this._tags) {
                    this._tags.forEach((tag) => {
                        let p = this
                        while (p = p._parent) {
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

                            if (p._tagRoot) {
                                break
                            }
                        }
                    });
                }
            } else {
                this._treeTags.forEach((tagSet, tag) => {
                    let p = this
                    while (!p._tagRoot && (p = p._parent)) {
                        if (p._tagRoot) {
                            // Do not copy all subs.
                        }
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
        tags = tags.reduce((acc, tag) => {
            return acc.concat(tag.split(' '))
        }, [])

        if (this._ref) {
            tags.push(this._ref)
        }

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
    }

    addTag(tag) {
        if (tag.indexOf(' ') === -1) {
            if (Utils.isUcChar(tag.charCodeAt(0))) {
                this._throwError("Tag may not start with an upper case character.")
            }

            this._addTag(tag)
        } else {
            const tags = tag.split(' ')
            for (let i = 0, m = tags.length; i < m; i++) {
                const tag = tags[i]

                if (Utils.isUcChar(tag.charCodeAt(0))) {
                    this._throwError("Tag may not start with an upper case character.")
                }

                this._addTag(tag)
            }
        }
    }

    _addTag(tag) {
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
    }

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
    }

    hasTag(tag) {
        return (this._tags && (this._tags.indexOf(tag) !== -1));
    }

    /**
     * Returns one of the views from the subtree that have this tag.
     * @param {string} tag
     * @returns {View}
     */
    _tag(tag) {
        let res = this.mtag(tag);
        return res[0];
    };

    get tag() {
        return this._tag;
    }

    set tag(t) {
        this.tags = t;
    }

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
                        resn = resn.concat(res[j]._getByTag(parts[level]));
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
            Base.patchObject(t[i], settings)
        }
    }

    get tagRoot() {
        return this._tagRoot;
    }

    set tagRoot(v) {
        if (this._tagRoot !== v) {
            if (!v) {
                this._setTagsParent();
            } else {
                this._unsetTagsParent();
            }

            this._tagRoot = v;
        }
    }

    sel(path) {
        const results = this.select(path)
        if (results.length) {
            return results[0]
        } else {
            return undefined
        }
    }

    select(path) {
        if (path.indexOf(",") !== -1) {
            let selectors = path.split(',')
            let res = []
            for (let i = 0; i < selectors.length; i++) {
                res = res.concat(this._select(selectors[i]))
            }
            return res
        } else {
            return this._select(path)
        }
    }

    _select(path) {
        if (path === "") return [this]
        let pointIdx = path.indexOf(".")
        let arrowIdx = path.indexOf(">")
        if (pointIdx === -1 && arrowIdx === -1) {
            // Quick case.
            if (Utils.isUcChar(path.charCodeAt(0))) {
                const ref = this.getByRef(path)
                return ref ? [ref] : []
            } else {
                return this.mtag(path)
            }
        }

        // Detect by first char.
        let isChild
        if (arrowIdx === 0) {
            isChild = true
            path = path.substr(1)
        } else if (pointIdx === 0) {
            isChild = false
            path = path.substr(1)
        } else {
            const firstCharcode = path.charCodeAt(0)
            isChild = Utils.isUcChar(firstCharcode)
        }

        if (isChild) {
            // ">"
            return this._selectChilds(path)
        } else {
            // "."
            return this._selectDescs(path)
        }
    }

    _selectChilds(path) {
        const pointIdx = path.indexOf(".")
        const arrowIdx = path.indexOf(">")

        let isRef = Utils.isUcChar(path.charCodeAt(0))

        if (pointIdx === -1 && arrowIdx === -1) {
            if (isRef) {
                const ref = this.getByRef(path)
                return ref ? [ref] : []
            } else {
                return this.mtag(path)
            }
        }

        if ((arrowIdx === -1) || (pointIdx !== -1 && pointIdx < arrowIdx)) {
            let next
            const str = path.substr(0, pointIdx)
            if (isRef) {
                const ref = this.getByRef(str)
                next = ref ? [ref] : []
            } else {
                next = this.mtag(str)
            }
            let total = []
            const subPath = path.substr(pointIdx + 1)
            for (let i = 0, n = next.length; i < n; i++) {
                total = total.concat(next[i]._selectDescs(subPath))
            }
            return total
        } else {
            let next
            const str = path.substr(0, arrowIdx)
            if (isRef) {
                const ref = this.getByRef(str)
                next = ref ? [ref] : []
            } else {
                next = this.mtag(str)
            }
            let total = []
            const subPath = path.substr(arrowIdx + 1)
            for (let i = 0, n = next.length; i < n; i++) {
                total = total.concat(next[i]._selectChilds(subPath))
            }
            return total
        }
    }

    _selectDescs(path) {
        const arrowIdx = path.indexOf(">")
        if (arrowIdx === -1) {
            // Use multi-tag path directly.
            return this.mtag(path)
        } else {
            const str = path.substr(0, arrowIdx)
            let next = this.mtag(str)

            let total = []
            const subPath = path.substr(arrowIdx + 1)
            for (let i = 0, n = next.length; i < n; i++) {
                total = total.concat(next[i]._selectChilds(subPath))
            }
            return total
        }
    }

    getByRef(ref) {
        return this.childList.getByRef(ref)
    }

    getLocationString() {
        let i;
        i = this._parent ? this._parent._children.getIndex(this) : "R";
        let localTags = this.getTags();
        let str = this._parent ? this._parent.getLocationString(): ""
        if (this.ref) {
            str += ":[" + i + "]" + this.ref
        } else if (localTags.length) {
            str += ":[" + i + "]" + localTags.join(",")
        } else {
            str += ":[" + i + "]#" + this.id
        }
        return str
    }

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

        if (children) {
            let childStr = ""
            if (Utils.isObjectLiteral(children)) {
                let refs = Object.keys(children)
                childStr = ""
                for (let i = 0, n = refs.length; i < n; i++) {
                    childStr += `\n${indent}  "${refs[i]}":`
                    delete children[refs[i]].ref
                    childStr += View.getPrettyString(children[refs[i]], indent + "  ") + (i < n - 1 ? "," : "")
                }
                let isEmpty = (str === "{}");
                str = str.substr(0, str.length - 1) + (isEmpty ? "" : ",") + childStr + "\n" + indent + "}"
            } else {
                let n = children.length;
                childStr = "["
                for (let i = 0; i < n; i++) {
                    childStr += View.getPrettyString(children[i], indent + "  ") + (i < n - 1 ? "," : "") + "\n"
                }
                childStr += indent + "]}";
                let isEmpty = (str === "{}");
                str = str.substr(0, str.length - 1) + (isEmpty ? "" : ",") + "\"children\":\n" + indent + childStr + "}"
            }

        }

        return str;
    }

    getSettings() {
        let settings = this.getNonDefaults();

        let children = this._children.get();
        if (children) {
            let n = children.length;
            if (n) {
                const childArray = [];
                let missing = false
                for (let i = 0; i < n; i++) {
                    childArray.push(children[i].getSettings());
                    missing = missing || !children[i].ref
                }

                if (!missing) {
                    settings.children = {}
                    childArray.forEach(child => {
                        settings.children[child.ref] = child
                    })
                } else {
                    settings.children = childArray
                }
            }
        }

        settings.id = this.id;

        return settings;
    }

    getNonDefaults() {
        let settings = {};

        if (this.constructor !== View) {
            settings.type = this.constructor.name
        }

        if (this._ref) {
            settings.ref = this._ref
        }

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

        if (this._core.colorUl === this._core.colorUr && this._core.colorBl === this._core.colorBr && this._core.colorUl === this._core.colorBl) {
            if (this._core.colorUl !== 0xFFFFFFFF) settings.color = this._core.colorUl.toString(16);
        } else {
            if (this._core.colorUl !== 0xFFFFFFFF) settings.colorUl = this._core.colorUl.toString(16);
            if (this._core.colorUr !== 0xFFFFFFFF) settings.colorUr = this._core.colorUr.toString(16);
            if (this._core.colorBl !== 0xFFFFFFFF) settings.colorBl = this._core.colorBl.toString(16);
            if (this._core.colorBr !== 0xFFFFFFFF) settings.colorBr = this._core.colorBr.toString(16);
        }

        if (!this._visible) settings.visible = false;

        if (this._core.zIndex) settings.zIndex = this._core.zIndex;

        if (this._core.forceZIndexContext) settings.forceZIndexContext = true;

        if (this._core.clipping) settings.clipping = this._core.clipping;

        if (this._core.clipbox) settings.clipbox = this._core.clipbox;

        if (this.rect) {
            settings.rect = true;
        } else if (this.src) {
            settings.src = this.src;
        } else if (this.texture && this._viewText) {
            settings.text = this._viewText.settings.getNonDefaults();
        }

        if (this._texture) {
            let tnd = this._texture.getNonDefaults();
            if (Object.keys(tnd).length) {
                settings.texture = tnd;
            }
        }

        if (this._texturizer) {
            if (this.texturizer.enabled) {
                settings.renderToTexture = this.texturizer.enabled
            }
            if (this.texturizer.lazy) {
                settings.renderToTextureLazy = this._texturizer.lazy
            }
            if (this._texturizer.colorize) {
                settings.colorizeResultTexture = this._texturizer.colorize
            }
            if (this._texturizer.hideResult) {
                settings.hideResultTexture = this._texturizer.hideResult
            }
        }

        return settings;
    };

    static getGetter(propertyPath) {
        let getter = View.PROP_GETTERS.get(propertyPath);
        if (!getter) {
            getter = new Function('obj', 'return obj.' + propertyPath);
            View.PROP_GETTERS.set(propertyPath, getter);
        }
        return getter;
    }

    static getSetter(propertyPath) {
        let setter = View.PROP_SETTERS.get(propertyPath);
        if (!setter) {
            setter = new Function('obj', 'v', 'obj.' + propertyPath + ' = v');
            View.PROP_SETTERS.set(propertyPath, setter);
        }
        return setter;
    }

    get withinBoundsMargin() {
        return this._core._withinBoundsMargin
    }

    _enableWithinBoundsMargin() {
        // Iff enabled, this toggles the active flag.
        if (this._enabled) {
            this._setActiveFlag()

            if (this._texture) {
                this._texture.source.incWithinBoundsCount()
            }
        }
    }

    _disableWithinBoundsMargin() {
        // Iff active, this toggles the active flag.
        if (this._active) {
            this._unsetActiveFlag()

            if (this._texture) {
                this._texture.source.decWithinBoundsCount()
            }
        }
    }

    set boundsMargin(v) {
        if (!Array.isArray(v) && v !== null && v !== undefined) {
            throw new Error("boundsMargin should be an array of top-right-bottom-left values, null (no margin) or undefined (inherit margin)")
        }
        this._core.boundsMargin = v
    }

    get boundsMargin() {
        return this._core.boundsMargin
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
            if ((prev === 0) !== (v === 0)) {
                this._updateEnabledFlag()
            }
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
        return this._core.colorUl
    }

    set colorUl(v) {
        this._core.colorUl = v;
    }

    get colorUr() {
        return this._core.colorUr
    }

    set colorUr(v) {
        this._core.colorUr = v;
    }

    get colorBl() {
        return this._core.colorBl
    }

    set colorBl(v) {
        this._core.colorBl = v;
    }

    get colorBr() {
        return this._core.colorBr
    }

    set colorBr(v) {
        this._core.colorBr = v;
    }

    get color() {
        return this._core.colorUl
    }

    set color(v) {
        if (this.colorUl !== v || this.colorUr !== v || this.colorBl !== v || this.colorBr !== v) {
            this.colorUl = v;
            this.colorUr = v;
            this.colorBl = v;
            this.colorBr = v;
        }
    }

    get colorTop() {
        return this.colorUl
    }

    set colorTop(v) {
        if (this.colorUl !== v || this.colorUr !== v) {
            this.colorUl = v;
            this.colorUr = v;
        }
    }

    get colorBottom() {
        return this.colorBl
    }

    set colorBottom(v) {
        if (this.colorBl !== v || this.colorBr !== v) {
            this.colorBl = v;
            this.colorBr = v;
        }
    }

    get colorLeft() {
        return this.colorUl
    }

    set colorLeft(v) {
        if (this.colorUl !== v || this.colorBl !== v) {
            this.colorUl = v;
            this.colorBl = v;
        }
    }

    get colorRight() {
        return this.colorUr
    }

    set colorRight(v) {
        if (this.colorUr !== v || this.colorBr !== v) {
            this.colorUr = v;
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
            this._updateEnabledFlag()
        }
    }

    get zIndex() {return this._core.zIndex}
    set zIndex(v) {
        let prev = this._core.zIndex;
        this._core.zIndex = v;
    }

    get forceZIndexContext() {return this._core.forceZIndexContext}
    set forceZIndexContext(v) {
        this._core.forceZIndexContext = v;
    }

    get clipping() {return this._core.clipping}
    set clipping(v) {
        this._core.clipping = v;
    }

    get clipbox() {return this._core.clipbox}
    set clipbox(v) {
        this._core.clipbox = v;
    }

    get tags() {
        return this.getTags();
    }

    set tags(v) {
        if (!Array.isArray(v)) v = [v];
        this.setTags(v);
    }

    set t(v) {
        this.tags = v;
    }

    get _children() {
        if (!this._childList) {
            this._childList = new ViewChildList(this, false)
        }
        return this._childList
    }

    get childList() {
        if (!this._allowChildrenAccess()) {
            this._throwError("Direct access to children is not allowed in " + this.getLocationString())
        }
        return this._children
    }

    _allowChildrenAccess() {
        return true
    }

    get children() {
        return this.childList.get()
    }

    set children(children) {
        this.childList.patch(children)
    }

    add(o) {
        return this.childList.a(o);
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

    set mw(v) {
        if (this.texture) {
            this.texture.source.mw = v
        } else {
            this._throwError('Please set mw after setting a texture.')
        }
    }

    set mh(v) {
        if (this.texture) {
            this.texture.source.mh = v
        } else {
            this._throwError('Please set mh after setting a texture.')
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
        if (!this._viewText) {
            this._viewText = new ViewText(this);
        }
        if (Utils.isString(v)) {
            this._viewText.settings.text = v;
        } else {
            this._viewText.settings.patch(v);
        }
    }

    set onUpdate(f) {
        this._core.onUpdate = f;
    }

    set onAfterUpdate(f) {
        this._core.onAfterUpdate = f;
    }

    get shader() {
        return this._core.shader;
    }

    set shader(v) {
        let shader;
        if (Utils.isObjectLiteral(v)) {
            if (v.type) {
                shader = new v.type(this.stage.ctx)
            } else {
                shader = this.shader
            }

            if (shader) {
                Base.patchObject(shader, v)
            }
        } else if (v === null) {
            shader = this.stage.ctx.renderState.defaultShader;
        } else if (v === undefined) {
            shader = null;
        } else {
            if (v.isShader) {
                shader = v;
            } else {
                console.error("Please specify a shader type.");
                return
            }
        }

        if (this._enabled && this._core.shader) {
            this._core.shader.removeView(this);
        }

        this._core.shader = shader;

        if (this._enabled && this._core.shader) {
            this._core.shader.addView(this);
        }
    }

    _hasTexturizer() {
        return !!this._core._texturizer
    }

    get renderToTexture() {
        return this._hasTexturizer() && this.texturizer.enabled
    }

    set renderToTexture(v) {
        this.texturizer.enabled = v
    }

    get renderToTextureLazy() {
        return this._hasTexturizer() && this.texturizer.lazy
    }

    set renderToTextureLazy(v) {
        this.texturizer.lazy = v
    }

    get hideResultTexture() {
        return this._hasTexturizer() && this.texturizer.hideResult
    }

    set hideResultTexture(v) {
        this.texturizer.hideResult = v
    }

    get colorizeResultTexture() {
        return this._hasTexturizer() && this.texturizer.colorize
    }

    set colorizeResultTexture(v) {
        this.texturizer.colorize = v
    }

    get filters() {
        return this._hasTexturizer() && this.texturizer.filters
    }

    set filters(v) {
        if (this._enabled) {
            this.texturizer.filters.forEach(filter => filter.removeView(this._core))
        }

        this.texturizer.filters = v

        if (this._enabled) {
            this.texturizer.filters.forEach(filter => filter.addView(this._core))
        }
    }

    getTexture() {
        return this.texturizer._getTextureSource()
    }

    get texturizer() {
        return this._core.texturizer
    }

    patch(settings, createMode = false) {
        let paths = Object.keys(settings)

        if (settings.hasOwnProperty("__create")) {
            createMode = settings["__create"]
        }

        for (let i = 0, n = paths.length; i < n; i++) {
            let path = paths[i]
            const v = settings[path]

            let pointIdx = path.indexOf(".")
            let arrowIdx = path.indexOf(">")
            if (arrowIdx === -1 && pointIdx === -1) {
                const firstCharCode = path.charCodeAt(0)
                if (Utils.isUcChar(firstCharCode)) {
                    // Ref.
                    const child = this.getByRef(path)
                    if (!child) {
                        if (v !== undefined) {
                            let subCreateMode = createMode
                            if (Utils.isObjectLiteral(v)) {
                                if (v.hasOwnProperty("__create")) {
                                    subCreateMode = v.__create
                                }
                            }

                            if (subCreateMode === null) {
                                // Ignore.
                            } else if (subCreateMode === true) {
                                // Add to list immediately.
                                let c
                                if (Utils.isObjectLiteral(v)) {
                                    // Catch this case to capture createMode flag.
                                    c = this.childList.createItem(v);
                                    c.patch(v, subCreateMode);
                                } else if (Utils.isObject(v)) {
                                    c = v
                                }
                                if (c.isView) {
                                    c.ref = path
                                }

                                this.childList.a(c)
                            } else {
                                this._throwError("Can't find path: " + path)
                            }
                        }
                    } else {
                        if (v === undefined) {
                            if (child.parent) {
                                child.parent.childList.remove(child)
                            }
                        } else if (Utils.isObjectLiteral(v)) {
                            child.patch(v, createMode)
                        } else if (v.isView) {
                            // Replace view by new view.
                            v.ref = path
                            this.childList.replace(v, child)
                        } else {
                            this._throwError("Unexpected value for path: " + path)
                        }
                    }
                } else {
                    // Property.
                    Base.patchObjectProperty(this, path, v)
                }
            } else {
                // Select path.
                const views = this.select(path)
                if (v === undefined) {
                    for (let i = 0, n = views.length; i < n; i++) {
                        if (views[i].parent) {
                            views[i].parent.childList.remove(views[i])
                        }
                    }
                } else if (Utils.isObjectLiteral(v)) {
                    // Recursive path.
                    for (let i = 0, n = views.length; i < n; i++) {
                        views[i].patch(v, createMode)
                    }
                } else {
                    this._throwError("Unexpected value for path: " + path)
                }
            }
        }
    }

    _throwError(message) {
        throw new Error(this.constructor.name + " (" + this.getLocationString() + "): " + message)
    }


    /*A¬*/
    animation(settings) {
        return this.stage.animations.createAnimation(this, settings);
    }

    transition(property, settings) {
        if (settings === undefined) {
            return this._getTransition(property);
        } else {
            this._setTransition(property, settings);
            // We do not create/return the transition, because it would undo the 'lazy transition creation' optimization.
            return null;
        }
    }

    set transitions(object) {
        let keys = Object.keys(object);
        keys.forEach(property => {
            this.transition(property, object[property]);
        });
    }

    set smooth(object) {
        let keys = Object.keys(object);
        keys.forEach(property => {
            let value = object[property]
            if (Array.isArray(value)) {
                this.setSmooth(property, value[0], value[1])
            } else {
                this.setSmooth(property, value)
            }
        });
    }

    fastForward(property) {
        if (this._transitions) {
            let t = this._transitions[property];
            if (t && t.isTransition) {
                t.finish();
            }
        }
    }

    _getTransition(property) {
        if (!this._transitions) {
            this._transitions = {};
        }
        let t = this._transitions[property];
        if (!t) {
            // Create default transition.
            t = new Transition(this.stage.transitions, this.stage.transitions.defaultTransitionSettings, this, property);
        } else if (t.isTransitionSettings) {
            // Upgrade to 'real' transition.
            t = new Transition(
                this.stage.transitions,
                t,
                this,
                property
            );
        }
        this._transitions[property] = t;
        return t;
    }

    _setTransition(property, settings) {
        if (!settings) {
            this._removeTransition(property);
        } else {
            if (Utils.isObjectLiteral(settings)) {
                // Convert plain object to proper settings object.
                settings = this.stage.transitions.createSettings(settings);
            }

            if (!this._transitions) {
                this._transitions = {};
            }

            let current = this._transitions[property];
            if (current && current.isTransition) {
                // Runtime settings change.
                current.settings = settings;
                return current;
            } else {
                // Initially, only set the settings and upgrade to a 'real' transition when it is used.
                this._transitions[property] = settings;
            }
        }
    }

    _removeTransition(property) {
        if (this._transitions) {
            delete this._transitions[property];
        }
    }

    getSmooth(property, v) {
        let t = this._getTransition(property);
        if (t && t.isAttached()) {
            return t.targetValue;
        } else {
            return v;
        }
    }

    setSmooth(property, v, settings) {
        if (settings) {
            this._setTransition(property, settings);
        }
        let t = this._getTransition(property);
        t.start(v);
        return t
    }
    /*¬A*/

    static isColorProperty(property) {
        return property.startsWith("color")
    }

    static getMerger(property) {
        if (View.isColorProperty(property)) {
            return StageUtils.mergeColors
        } else {
            return StageUtils.mergeNumbers
        }
    }
}


View.prototype.isView = 1;

View.id = 1;

// Getters reused when referencing view (subobject) properties by a property path, as used in a transition or animation ('x', 'texture.x', etc).
View.PROP_GETTERS = new Map();

// Setters reused when referencing view (subobject) properties by a property path, as used in a transition or animation ('x', 'texture.x', etc).
View.PROP_SETTERS = new Map();

module.exports = View;

let ViewText = require('./ViewText');
let Texture = require('./Texture');
let TextureSource = require('./TextureSource')
/*A¬*/let Transition = require('../animation/Transition')
let TransitionSettings = require('../animation/TransitionSettings')/*¬A*/
let ViewChildList = require('./ViewChildList');
