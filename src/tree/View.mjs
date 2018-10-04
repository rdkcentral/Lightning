/**
 * Render tree node.
 * Copyright Metrological, 2017
 */

import StageUtils from "./StageUtils.mjs";
import ViewCore from "./core/ViewCore.mjs";
import Base from "./Base.mjs";

import Utils from "./Utils.mjs";
import EventEmitter from "../EventEmitter.mjs";
import Shader from "./Shader.mjs";

export default class View {

    constructor(stage) {

        // EventEmitter constructor.
        this._hasEventListeners = false;

        this.__id = View.id++;

        this.stage = stage;

        this.__core = new ViewCore(this);

        /**
         * A reference that can be used while merging trees.
         * @type {string}
         */
        this.__ref = null;

        /**
         * A view is attached if it is a descendant of the stage root.
         * @type {boolean}
         */
        this.__attached = false;

        /**
         * A view is enabled when it is attached and it is visible (worldAlpha > 0).
         * @type {boolean}
         */
        this.__enabled = false;

        /**
         * A view is active when it is enabled and it is within bounds.
         * @type {boolean}
         */
        this.__active = false;

        /**
         * @type {View}
         */
        this.__parent = null;

        /**
         * The texture that is currently set.
         * @type {Texture}
         */
        this.__texture = null;

        /**
         * The currently displayed texture. While this.texture is loading, this one may be different.
         * @type {Texture}
         */
        this.__displayedTexture = null;

        /**
         * Tags that can be used to identify/search for a specific view.
         * @type {String[]}
         */
        this.__tags = null;

        /**
         * The tree's tags mapping.
         * This contains all views for all known tags, at all times.
         * @type {Map}
         */
        this.__treeTags = null;

        /**
         * Cache for the tag/mtag methods.
         * @type {Map<String,View[]>}
         */
        this.__tagsCache = null;

        /**
         * Tag-to-complex cache (all tags that are part of the complex caches).
         * This maps tags to cached complex tags in the cache.
         * @type {Map<String,String[]>}
         */
        this.__tagToComplex = null;

        /**
         * Creates a tag context: tagged views in this branch will not be reachable from ancestors of this view.
         * @type {boolean}
         */
        this.__tagRoot = false;

        /**
         * (Lazy-initialised) list of children owned by this view.
         * @type {ViewChildList}
         */
        this.__childList = null;

    }

    get id() {
        return this.__id;
    }

    set ref(ref) {
        if (this.__ref !== ref) {
            const charcode = ref.charCodeAt(0);
            if (!Utils.isUcChar(charcode)) {
                this._throwError("Ref must start with an upper case character: " + ref);
            }
            if (this.__ref !== null) {
                this.removeTag(this.__ref);
                if (this.__parent) {
                    this.__parent.__childList.clearRef(this.__ref);
                }
            }

            this.__ref = ref;

            if (this.__ref) {
                this._addTag(this.__ref);
                if (this.__parent) {
                    this.__parent.__childList.setRef(this.__ref, this);
                }
            }
        }
    }

    get ref() {
        return this.__ref;
    }

    get core() {
        return this.__core;
    }

    setAsRoot() {
        this.__core.setAsRoot();
        this._updateAttachedFlag();
        this._updateEnabledFlag();
    }

    get isRoot() {
        return this.__core.isRoot;
    }

    _setParent(parent) {
        if (this.__parent === parent) return;

        if (this.__parent) {
            this._unsetTagsParent();
        }

        this.__parent = parent;

        if (parent) {
            this._setTagsParent();
        }

        this._updateAttachedFlag();
        this._updateEnabledFlag();

        if (this.isRoot && parent) {
            this._throwError("Root should not be added as a child! Results are unspecified!");
        }
    };

    getDepth() {
        let depth = 0;

        let p = this.__parent;
        while(p) {
            depth++;
            p = p.__parent;
        }

        return depth;
    };

    getAncestor(l) {
        let p = this;
        while (l > 0 && p.__parent) {
            p = p.__parent;
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

            o1 = o1.__parent;
            o2 = o2.__parent;
        } while (o1 && o2);

        return null;
    };

    get attached() {
        return this.__attached;
    }

    get enabled() {
        return this.__enabled;
    }

    get active() {
        return this.__active;
    }

    _isAttached() {
        return (this.__parent ? this.__parent.__attached : (this.stage.root === this));
    };

    _isEnabled() {
        return this.__core.visible && (this.__core.alpha > 0) && (this.__parent ? this.__parent.__enabled : (this.stage.root === this));
    };

    _isActive() {
        return this._isEnabled() && this.withinBoundsMargin;
    };

    /**
     * Updates the 'attached' flag for this branch.
     */
    _updateAttachedFlag() {
        let newAttached = this._isAttached();
        if (this.__attached !== newAttached) {
            this.__attached = newAttached;

            if (newAttached) {
                this._onSetup();
            }

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
                this._onAttach();
            } else {
                this._onDetach();
            }
        }
    };

    /**
     * Updates the 'enabled' flag for this branch.
     */
    _updateEnabledFlag() {
        let newEnabled = this._isEnabled();
        if (this.__enabled !== newEnabled) {
            if (newEnabled) {
                this._onEnabled();
                this._setEnabledFlag();
            } else {
                this._onDisabled();
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
        }
    };

    _setEnabledFlag() {
        this.__enabled = true;

        // Force re-check of texture because dimensions might have changed (cutting).
        this._updateDimensions();
        this._updateTextureCoords();

        if (this.__texture) {
            this.__texture.addView(this);
        }

        if (this.withinBoundsMargin) {
            this._setActiveFlag();
        }

        if (this.__core.shader) {
            this.__core.shader.addView(this.__core);
        }

    }

    _unsetEnabledFlag() {
        if (this.__active) {
            this._unsetActiveFlag();
        }

        if (this.__texture) {
            this.__texture.removeView(this);
        }

        if (this.__core.shader) {
            this.__core.shader.removeView(this.__core);
        }

        if (this._texturizer) {
            this.texturizer.filters.forEach(filter => filter.removeView(this.__core));
        }

        this.__enabled = false;
    }

    _setActiveFlag() {
        this.__active = true;
        if (this.__texture) {
            this._enableTexture();
        }
        this._onActive();
    }

    _unsetActiveFlag() {
        this.__active = false;
        if (this.__texture) {
            this._disableTexture();
        }

        if (this._hasTexturizer()) {
            this.texturizer.deactivate();
        }

        this._onInactive();
    }

    _onSetup() {
    }

    _onAttach() {
    }

    _onDetach() {
    }

    _onEnabled() {
    }

    _onDisabled() {
    }

    _onActive() {
    }

    _onInactive() {
    }

    _onResize() {
    }

    _getRenderWidth() {
        if (this.__core.w) {
            return this.__core.w;
        } else if (this.__displayedTexture) {
            return this.__displayedTexture.getRenderWidth();
        } else if (this.__texture) {
            // Texture already loaded, but not yet updated (probably because this view is not active).
            return this.__texture.getRenderWidth();
        } else {
            return 0;
        }
    };

    _getRenderHeight() {
        if (this.__core.h) {
            return this.__core.h;
        } else if (this.__displayedTexture) {
            return this.__displayedTexture.getRenderHeight();
        } else if (this.__texture) {
            // Texture already loaded, but not yet updated (probably because this view is not active).
            return this.__texture.getRenderHeight();
        } else {
            return 0;
        }
    };

    get renderWidth() {
        if (this.__enabled) {
            // Render width is only maintained if this view is enabled.
            return this.__core._rw;
        } else {
            return this._getRenderWidth();
        }
    }

    get renderHeight() {
        if (this.__enabled) {
            return this.__core._rh;
        } else {
            return this._getRenderHeight();
        }
    }

    textureIsLoaded() {
        return this.__texture && this.__texture.isLoaded();
    }

    loadTexture() {
        if (this.__texture) {
            this.__texture.load();

            if (!this.__texture.isUsed() || !this._isEnabled()) {
                // Loading the texture will have no effect on the dimensions of this view.
                // Manually update them, so that calcs can be performed immediately in userland.
                this._updateDimensions();
            }
        }
    }

    _enableTextureError() {
        // txError event should automatically be re-triggered when a view becomes active.
        const loadError = this.__texture.loadError;
        if (loadError) {
            this.emit('txError', loadError, this.__texture._source);
        }
    }

    _enableTexture() {
        if (this.__texture.isLoaded()) {
            this._setDisplayedTexture(this.__texture);
        } else {
            // We don't want to retain the old 'ghost' image as it wasn't visible anyway.
            this._setDisplayedTexture(null);

            this._enableTextureError();
        }
    }

    _disableTexture() {
        // We disable the displayed texture because, when the texture changes while invisible, we should use that w, h,
        // mw, mh for checking within bounds.
        this._setDisplayedTexture(null);
    }

    get texture() {
        return this.__texture;
    }

    set texture(v) {
        let texture;
        if (Utils.isObjectLiteral(v)) {
            if (v.type) {
                texture = new v.type(this.stage);
            } else {
                texture = this.texture;
            }

            if (texture) {
                Base.patchObject(texture, v);
            }
        } else if (!v) {
            texture = null;
        } else {
            if (v.isTexture) {
                texture = v;
            } else if (v.isTextureSource) {
                texture = new SourceTexture(this.stage);
                texture.textureSource = v;
            } else {
                console.error("Please specify a texture type.");
                return;
            }
        }

        const prevTexture = this.__texture;
        if (texture !== prevTexture) {
            this.__texture = texture;

            if (this.__texture) {
                if (this.__enabled) {
                    this.__texture.addView(this);

                    if (this.withinBoundsMargin) {
                        if (this.__texture.isLoaded()) {
                            this._setDisplayedTexture(this.__texture);
                        } else {
                            this._enableTextureError();
                        }
                    }
                }
            } else {
                // Make sure that current texture is cleared when the texture is explicitly set to null.
                this._setDisplayedTexture(null);
            }

            if (prevTexture && prevTexture !== this.__displayedTexture) {
                prevTexture.removeView(this);
            }

            this._updateDimensions();
        }
    }

    get displayedTexture() {
        return this.__displayedTexture;
    }

    _setDisplayedTexture(v) {
        let prevTexture = this.__displayedTexture;

        if (prevTexture && (v !== prevTexture)) {
            if (this.__texture !== prevTexture) {
                // The old displayed texture is deprecated.
                prevTexture.removeView(this);
            }
        }

        const prevSource = this.__core.displayedTextureSource ? this.__core.displayedTextureSource._source : undefined;
        const sourceChanged = (v ? v._source : undefined) !== prevSource;

        this.__displayedTexture = v;
        this._updateDimensions();

        if (this.__displayedTexture) {
            if (sourceChanged) {
                // We don't need to reference the displayed texture because it was already referenced (this.texture === this.displayedTexture).
                this._updateTextureCoords();
                this.__core.setDisplayedTextureSource(this.__displayedTexture._source);
            }
        } else {
            this.__core.setDisplayedTextureSource(null);
        }

        if (sourceChanged) {
            if (this.__displayedTexture) {
                this.emit('txLoaded', this.__displayedTexture);
            } else {
                this.emit('txUnloaded', this.__displayedTexture);
            }
        }
    }

    onTextureSourceLoaded() {
        // This function is called when view is enabled, but we only want to set displayed texture for active views.
        if (this.active) {
            // We may be dealing with a texture reloading, so we must force update.
            this._setDisplayedTexture(this.__texture);
        }
    };

    onTextureSourceLoadError(e) {
        this.emit('txError', e, this.__texture._source);
    };

    forceRenderUpdate() {
        this.__core.setHasRenderUpdates(3);
    }

    onDisplayedTextureClippingChanged() {
        this._updateDimensions();
        this._updateTextureCoords();
    };

    onPrecisionChanged() {
        this._updateDimensions();
    };

    _updateDimensions() {
        let rw = this._getRenderWidth();
        let rh = this._getRenderHeight();

        let unknownSize = false;
        if (!rw || !rh) {
            if (!this.__displayedTexture && this.__texture) {
                // Texture size unknown.
                unknownSize = true;

                // We use a 'max width' replacement instead in the ViewCore calcs.
                // This makes sure that it is able to determine withinBounds.
                rw = rw || this.__texture.mw;
                rh = rh || this.__texture.mh;
            }
        }

        if (this.__core.setDimensions(rw, rh, unknownSize)) {
            this._onResize();
        }
    }

    _updateTextureCoords() {
        if (this.displayedTexture && this.displayedTexture._source) {
            let displayedTexture = this.displayedTexture;
            let displayedTextureSource = this.displayedTexture._source;

            let tx1 = 0, ty1 = 0, tx2 = 1.0, ty2 = 1.0;
            if (displayedTexture.clipping) {
                // Apply texture clipping.
                let w = displayedTextureSource.getRenderWidth();
                let h = displayedTextureSource.getRenderHeight();
                let iw, ih, rw, rh;
                iw = 1 / w;
                ih = 1 / h;

                if (displayedTexture.pw) {
                    rw = (displayedTexture.pw) * iw;
                } else {
                    rw = (w - displayedTexture.px) * iw;
                }

                if (displayedTexture.ph) {
                    rh = displayedTexture.ph * ih;
                } else {
                    rh = (h - displayedTexture.py) * ih;
                }

                iw *= (displayedTexture.px);
                ih *= (displayedTexture.py);

                tx1 = iw;
                ty1 = ih;
                tx2 = tx2 * rw + iw;
                ty2 = ty2 * rh + ih;

                tx1 = Math.max(0, tx1);
                ty1 = Math.max(0, ty1);
                tx2 = Math.min(1, tx2);
                ty2 = Math.min(1, ty2);
            }

            this.__core.setTextureCoords(tx1, ty1, tx2, ty2);
        }
    }

    getCornerPoints() {
        return this.__core.getCornerPoints();
    }

    /**
     * Clears the cache(s) for the specified tag.
     * @param {String} tag
     */
    _clearTagsCache(tag) {
        if (this.__tagsCache) {
            this.__tagsCache.delete(tag);

            if (this.__tagToComplex) {
                let s = this.__tagToComplex.get(tag);
                if (s) {
                    for (let i = 0, n = s.length; i < n; i++) {
                        this.__tagsCache.delete(s[i]);
                    }
                    this.__tagToComplex.delete(tag);
                }
            }
        }
    };

    _unsetTagsParent() {
        let tags = null;
        let n = 0;
        if (this.__treeTags) {
            if (this.__tagRoot) {
                // Just need to remove the 'local' tags.
                if (this.__tags) {
                    this.__tags.forEach((tag) => {
                        // Remove from treeTags.
                        let p = this;
                        while (p = p.__parent) {
                            let parentTreeTags = p.__treeTags.get(tag);
                            parentTreeTags.delete(this);
                            p._clearTagsCache(tag);

                            if (p.__tagRoot) {
                                break;
                            }
                        }
                    });
                }
            } else {
                tags = Utils.iteratorToArray(this.__treeTags.keys());
                n = tags.length;

                if (n > 0) {
                    for (let i = 0; i < n; i++) {
                        let tagSet = this.__treeTags.get(tags[i]);

                        // Remove from treeTags.
                        let p = this;
                        while ((p = p.__parent)) {
                            let parentTreeTags = p.__treeTags.get(tags[i]);

                            tagSet.forEach(function (comp) {
                                parentTreeTags.delete(comp);
                            });


                            p._clearTagsCache(tags[i]);

                            if (p.__tagRoot) {
                                break;
                            }
                        }
                    }
                }
            }
        }
    };

    _setTagsParent() {
        if (this.__treeTags && this.__treeTags.size) {
            if (this.__tagRoot) {
                // Just copy over the 'local' tags.
                if (this.__tags) {
                    this.__tags.forEach((tag) => {
                        let p = this;
                        while (p = p.__parent) {
                            if (!p.__treeTags) {
                                p.__treeTags = new Map();
                            }

                            let s = p.__treeTags.get(tag);
                            if (!s) {
                                s = new Set();
                                p.__treeTags.set(tag, s);
                            }

                            s.add(this);

                            p._clearTagsCache(tag);

                            if (p.__tagRoot) {
                                break;
                            }
                        }
                    });
                }
            } else {
                this.__treeTags.forEach((tagSet, tag) => {
                    let p = this;
                    while (!p.__tagRoot && (p = p.__parent)) {
                        if (p.__tagRoot) {
                            // Do not copy all subs.
                        }
                        if (!p.__treeTags) {
                            p.__treeTags = new Map();
                        }

                        let s = p.__treeTags.get(tag);
                        if (!s) {
                            s = new Set();
                            p.__treeTags.set(tag, s);
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
        if (!this.__treeTags) {
            return [];
        }
        let t = this.__treeTags.get(tag);
        return t ? Utils.setToArray(t) : [];
    };

    getTags() {
        return this.__tags ? this.__tags : [];
    };

    setTags(tags) {
        tags = tags.reduce((acc, tag) => {
            return acc.concat(tag.split(' '));
        }, []);

        if (this.__ref) {
            tags.push(this.__ref);
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
                this._throwError("Tag may not start with an upper case character.");
            }

            this._addTag(tag);
        } else {
            const tags = tag.split(' ');
            for (let i = 0, m = tags.length; i < m; i++) {
                const tag = tags[i];

                if (Utils.isUcChar(tag.charCodeAt(0))) {
                    this._throwError("Tag may not start with an upper case character.");
                }

                this._addTag(tag);
            }
        }
    }

    _addTag(tag) {
        if (!this.__tags) {
            this.__tags = [];
        }
        if (this.__tags.indexOf(tag) === -1) {
            this.__tags.push(tag);

            // Add to treeTags hierarchy.
            let p = this;
            do {
                if (!p.__treeTags) {
                    p.__treeTags = new Map();
                }

                let s = p.__treeTags.get(tag);
                if (!s) {
                    s = new Set();
                    p.__treeTags.set(tag, s);
                }

                s.add(this);

                p._clearTagsCache(tag);
            } while (!p.__tagRoot && (p = p.__parent));
        }
    }

    removeTag(tag) {
        let i = this.__tags.indexOf(tag);
        if (i !== -1) {
            this.__tags.splice(i, 1);

            // Remove from treeTags hierarchy.
            let p = this;
            do {
                let list = p.__treeTags.get(tag);
                if (list) {
                    list.delete(this);

                    p._clearTagsCache(tag);
                }
            } while (!p.__tagRoot && (p = p.__parent));
        }
    }

    hasTag(tag) {
        return (this.__tags && (this.__tags.indexOf(tag) !== -1));
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
        if (this.__tagsCache) {
            res = this.__tagsCache.get(tag);
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

            if (!this.__tagsCache) {
                this.__tagsCache = new Map();
            }

            this.__tagsCache.set(tag, res);
        }
        return res;
    };

    stag(tag, settings) {
        let t = this.mtag(tag);
        let n = t.length;
        for (let i = 0; i < n; i++) {
            Base.patchObject(t[i], settings);
        }
    }

    get tagRoot() {
        return this.__tagRoot;
    }

    set tagRoot(v) {
        if (this.__tagRoot !== v) {
            if (!v) {
                this._setTagsParent();
            } else {
                this._unsetTagsParent();
            }

            this.__tagRoot = v;
        }
    }

    sel(path) {
        const results = this.select(path);
        if (results.length) {
            return results[0];
        } else {
            return undefined;
        }
    }

    select(path) {
        if (path.indexOf(",") !== -1) {
            let selectors = path.split(',');
            let res = [];
            for (let i = 0; i < selectors.length; i++) {
                res = res.concat(this._select(selectors[i]));
            }
            return res;
        } else {
            return this._select(path);
        }
    }

    _select(path) {
        if (path === "") return [this];


        let pointIdx = path.indexOf(".");
        let arrowIdx = path.indexOf(">");
        if (pointIdx === -1 && arrowIdx === -1) {
            // Quick case.
            if (Utils.isUcChar(path.charCodeAt(0))) {
                const ref = this.getByRef(path);
                return ref ? [ref] : [];
            } else {
                return this.mtag(path);
            }
        }

        // Detect by first char.
        let isRef;
        if (arrowIdx === 0) {
            isRef = true;
            path = path.substr(1);
        } else if (pointIdx === 0) {
            isRef = false;
            path = path.substr(1);
        } else {
            const firstCharcode = path.charCodeAt(0);
            isRef = Utils.isUcChar(firstCharcode);
        }

        return this._selectChilds(path, isRef);
    }

    _selectChilds(path, isRef) {
        const pointIdx = path.indexOf(".");
        const arrowIdx = path.indexOf(">");

        if (pointIdx === -1 && arrowIdx === -1) {
            if (isRef) {
                const ref = this.getByRef(path);
                return ref ? [ref] : [];
            } else {
                return this.mtag(path);
            }
        }

        if ((arrowIdx === -1) || (pointIdx !== -1 && pointIdx < arrowIdx)) {
            let next;
            const str = path.substr(0, pointIdx);
            if (isRef) {
                const ref = this.getByRef(str);
                next = ref ? [ref] : [];
            } else {
                next = this.mtag(str);
            }
            let total = [];
            const subPath = path.substr(pointIdx + 1);
            for (let i = 0, n = next.length; i < n; i++) {
                total = total.concat(next[i]._selectChilds(subPath, false));
            }
            return total;
        } else {
            let next;
            const str = path.substr(0, arrowIdx);
            if (isRef) {
                const ref = this.getByRef(str);
                next = ref ? [ref] : [];
            } else {
                next = this.mtag(str);
            }
            let total = [];
            const subPath = path.substr(arrowIdx + 1);
            for (let i = 0, n = next.length; i < n; i++) {
                total = total.concat(next[i]._selectChilds(subPath, true));
            }
            return total;
        }
    }

    getByRef(ref) {
        return this.childList.getByRef(ref);
    }

    getLocationString() {
        let i;
        i = this.__parent ? this.__parent._children.getIndex(this) : "R";
        let localTags = this.getTags();
        let str = this.__parent ? this.__parent.getLocationString(): "";
        if (this.ref) {
            str += ":[" + i + "]" + this.ref;
        } else if (localTags.length) {
            str += ":[" + i + "]" + localTags.join(",");
        } else {
            str += ":[" + i + "]#" + this.id;
        }
        return str;
    }

    toString() {
        let obj = this.getSettings();
        return View.getPrettyString(obj, "");
    };

    static getPrettyString(obj, indent) {
        let children = obj.children;
        delete obj.children;


        // Convert singular json settings object.
        let colorKeys = ["color", "colorUl", "colorUr", "colorBl", "colorBr"];
        let str = JSON.stringify(obj, function (k, v) {
            if (colorKeys.indexOf(k) !== -1) {
                return "COLOR[" + v.toString(16) + "]";
            }
            return v;
        });
        str = str.replace(/"COLOR\[([a-f0-9]{1,8})\]"/g, "0x$1");

        if (children) {
            let childStr = "";
            if (Utils.isObjectLiteral(children)) {
                let refs = Object.keys(children);
                childStr = "";
                for (let i = 0, n = refs.length; i < n; i++) {
                    childStr += `\n${indent}  "${refs[i]}":`
                    delete children[refs[i]].ref;
                    childStr += View.getPrettyString(children[refs[i]], indent + "  ") + (i < n - 1 ? "," : "");
                }
                let isEmpty = (str === "{}");
                str = str.substr(0, str.length - 1) + (isEmpty ? "" : ",") + childStr + "\n" + indent + "}";
            } else {
                let n = children.length;
                childStr = "[";
                for (let i = 0; i < n; i++) {
                    childStr += View.getPrettyString(children[i], indent + "  ") + (i < n - 1 ? "," : "") + "\n";
                }
                childStr += indent + "]}";
                let isEmpty = (str === "{}");
                str = str.substr(0, str.length - 1) + (isEmpty ? "" : ",") + "\"children\":\n" + indent + childStr + "}";
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
                let missing = false;
                for (let i = 0; i < n; i++) {
                    childArray.push(children[i].getSettings());
                    missing = missing || !children[i].ref;
                }

                if (!missing) {
                    settings.children = {}
                    childArray.forEach(child => {
                        settings.children[child.ref] = child;
                    });
                } else {
                    settings.children = childArray;
                }
            }
        }

        settings.id = this.id;

        return settings;
    }

    getNonDefaults() {
        let settings = {};

        if (this.constructor !== View) {
            settings.type = this.constructor.name;
        }

        if (this.__ref) {
            settings.ref = this.__ref;
        }

        if (this.__tags && this.__tags.length) {
            settings.tags = this.__tags;
        }

        if (this.x !== 0) settings.x = this.x;
        if (this.y !== 0) settings.y = this.y;
        if (this.w !== 0) settings.w = this.w;
        if (this.h !== 0) settings.h = this.h;

        if (this.scaleX === this.scaleY) {
            if (this.scaleX !== 1) settings.scale = this.scaleX;
        } else {
            if (this.scaleX !== 1) settings.scaleX = this.scaleX;
            if (this.scaleY !== 1) settings.scaleY = this.scaleY;
        }

        if (this.pivotX === this.pivotY) {
            if (this.pivotX !== 0.5) settings.pivot = this.pivotX;
        } else {
            if (this.pivotX !== 0.5) settings.pivotX = this.pivotX;
            if (this.pivotY !== 0.5) settings.pivotY = this.pivotY;
        }

        if (this.mountX === this.mountY) {
            if (this.mountX !== 0) settings.mount = this.mountX;
        } else {
            if (this.mountX !== 0) settings.mountX = this.mountX;
            if (this.mountY !== 0) settings.mountY = this.mountY;
        }

        if (this.alpha !== 1) settings.alpha = this.alpha;

        if (!this.visible) settings.visible = false;

        if (this.rotation !== 0) settings.rotation = this.rotation;

        if (this.colorUl === this.colorUr && this.colorBl === this.colorBr && this.colorUl === this.colorBl) {
            if (this.colorUl !== 0xFFFFFFFF) settings.color = this.colorUl.toString(16);
        } else {
            if (this.colorUl !== 0xFFFFFFFF) settings.colorUl = this.colorUl.toString(16);
            if (this.colorUr !== 0xFFFFFFFF) settings.colorUr = this.colorUr.toString(16);
            if (this.colorBl !== 0xFFFFFFFF) settings.colorBl = this.colorBl.toString(16);
            if (this.colorBr !== 0xFFFFFFFF) settings.colorBr = this.colorBr.toString(16);
        }

        if (this.zIndex) settings.zIndex = this.zIndex;

        if (this.forceZIndexContext) settings.forceZIndexContext = true;

        if (this.clipping) settings.clipping = this.clipping;

        if (this.clipbox) settings.clipbox = this.clipbox;

        if (this.__texture) {
            let tnd = this.__texture.getNonDefaults();
            if (Object.keys(tnd).length) {
                settings.texture = tnd;
            }
        }

        if (this._texturizer) {
            if (this.texturizer.enabled) {
                settings.renderToTexture = this.texturizer.enabled;
            }
            if (this.texturizer.lazy) {
                settings.renderToTextureLazy = this._texturizer.lazy;
            }
            if (this._texturizer.colorize) {
                settings.colorizeResultTexture = this._texturizer.colorize;
            }
            if (this._texturizer.renderOffscreen) {
                settings.renderOffscreen = this._texturizer.renderOffscreen;
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
        return this.__core._withinBoundsMargin;
    }

    _enableWithinBoundsMargin() {
        // Iff enabled, this toggles the active flag.
        if (this.__enabled) {
            // This must happen before enabling the texture, because it may already be loaded or load directly.
            if (this.__texture) {
                this.__texture.incWithinBoundsCount();
            }

            this._setActiveFlag();
        }
    }

    _disableWithinBoundsMargin() {
        // Iff active, this toggles the active flag.
        if (this.__active) {
            this._unsetActiveFlag();

            if (this.__texture) {
                this.__texture.decWithinBoundsCount();
            }
        }
    }

    set boundsMargin(v) {
        if (!Array.isArray(v) && v !== null && v !== undefined) {
            throw new Error("boundsMargin should be an array of left-top-right-bottom values, null (no margin) or undefined (inherit margin)");
        }
        this.__core.boundsMargin = v;
    }

    get boundsMargin() {
        return this.__core.boundsMargin;
    }

    get x() {
        return this.__core.x;
    }

    set x(v) {
        this.__core.x = v;
    }

    get y() {
        return this.__core.y;
    }

    set y(v) {
        this.__core.y = v;
    }

    get w() {
        return this.__core.w;
    }

    set w(v) {
        this.__core.w = v;
    }

    get h() {
        return this.__core.h;
    }

    set h(v) {
        this.__core.h = v;
    }

    get scaleX() {
        return this.__core.scaleX;
    }

    set scaleX(v) {
        this.__core.scaleX = v;
    }

    get scaleY() {
        return this.__core.scaleY;
    }

    set scaleY(v) {
        this.__core.scaleY = v;
    }

    get scale() {
        return this.__core.scale;
    }

    set scale(v) {
        this.__core.scale = v;
    }

    get pivotX() {
        return this.__core.pivotX;
    }

    set pivotX(v) {
        this.__core.pivotX = v;
    }

    get pivotY() {
        return this.__core.pivotY;
    }

    set pivotY(v) {
        this.__core.pivotY = v;
    }

    get pivot() {
        return this.__core.pivot;
    }

    set pivot(v) {
        this.__core.pivot = v;
    }

    get mountX() {
        return this.__core.mountX;
    }

    set mountX(v) {
        this.__core.mountX = v;
    }

    get mountY() {
        return this.__core.mountY;
    }

    set mountY(v) {
        this.__core.mountY = v;
    }

    get mount() {
        return this.__core.mount;
    }

    set mount(v) {
        this.__core.mount = v;
    }

    get rotation() {
        return this.__core.rotation;
    }

    set rotation(v) {
        this.__core.rotation = v;
    }

    get alpha() {
        return this.__core.alpha;
    }

    set alpha(v) {
        this.__core.alpha = v;
    }

    get visible() {
        return this.__core.visible;
    }

    set visible(v) {
        this.__core.visible = v;
    }
    
    get colorUl() {
        return this.__core.colorUl;
    }

    set colorUl(v) {
        this.__core.colorUl = v;
    }

    get colorUr() {
        return this.__core.colorUr;
    }

    set colorUr(v) {
        this.__core.colorUr = v;
    }

    get colorBl() {
        return this.__core.colorBl;
    }

    set colorBl(v) {
        this.__core.colorBl = v;
    }

    get colorBr() {
        return this.__core.colorBr;
    }

    set colorBr(v) {
        this.__core.colorBr = v;
    }

    get color() {
        return this.__core.colorUl;
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
        return this.colorUl;
    }

    set colorTop(v) {
        if (this.colorUl !== v || this.colorUr !== v) {
            this.colorUl = v;
            this.colorUr = v;
        }
    }

    get colorBottom() {
        return this.colorBl;
    }

    set colorBottom(v) {
        if (this.colorBl !== v || this.colorBr !== v) {
            this.colorBl = v;
            this.colorBr = v;
        }
    }

    get colorLeft() {
        return this.colorUl;
    }

    set colorLeft(v) {
        if (this.colorUl !== v || this.colorBl !== v) {
            this.colorUl = v;
            this.colorBl = v;
        }
    }

    get colorRight() {
        return this.colorUr;
    }

    set colorRight(v) {
        if (this.colorUr !== v || this.colorBr !== v) {
            this.colorUr = v;
            this.colorBr = v;
        }
    }

    get zIndex() {return this.__core.zIndex}
    set zIndex(v) {
        this.__core.zIndex = v;
    }

    get forceZIndexContext() {return this.__core.forceZIndexContext}
    set forceZIndexContext(v) {
        this.__core.forceZIndexContext = v;
    }

    get clipping() {return this.__core.clipping}
    set clipping(v) {
        this.__core.clipping = v;
    }

    get clipbox() {return this.__core.clipbox}
    set clipbox(v) {
        this.__core.clipbox = v;
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
        if (!this.__childList) {
            this.__childList = new ViewChildList(this, false);
        }
        return this.__childList;
    }

    get childList() {
        if (!this._allowChildrenAccess()) {
            this._throwError("Direct access to children is not allowed in " + this.getLocationString());
        }
        return this._children;
    }

    hasChildren() {
        return this._allowChildrenAccess() && this.__childList && (this.__childList.length > 0);
    }

    _allowChildrenAccess() {
        return true;
    }

    get children() {
        return this.childList.get();
    }

    set children(children) {
        this.childList.patch(children);
    }

    add(o) {
        return this.childList.a(o);
    }

    get parent() {
        return this.__parent;
    }

    get src() {
        if (this.texture && this.texture instanceof ImageTexture) {
            return this.texture._src;
        } else {
            return undefined;
        }
    }

    set src(v) {
        this.texture = new ImageTexture(this.stage);
        this.texture.src = v;
    }

    set mw(v) {
        if (this.texture) {
            this.texture.mw = v;
        } else {
            this._throwError('Please set mw after setting a texture.');
        }
    }

    set mh(v) {
        if (this.texture) {
            this.texture.mh = v;
        } else {
            this._throwError('Please set mh after setting a texture.');
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

    enableTextTexture() {
        if (!this.texture || !(this.texture instanceof TextTexture)) {
            this.texture = new TextTexture(this.stage);

            if (!this.texture.w && !this.texture.h) {
                // Inherit dimensions from view.
                // This allows userland to set dimensions of the View and then later specify the text.
                this.texture.w = this.w;
                this.texture.h = this.h;
            }
        }
        return this.texture;
    }

    get text() {
        if (this.texture && (this.texture instanceof TextTexture)) {
            return this.texture;
        } else {
            return undefined;
        }
    }

    set text(v) {
        if (!this.texture || !(this.texture instanceof TextTexture)) {
            this.enableTextTexture();
        }
        if (Utils.isString(v)) {
            this.texture.text = v;
        } else {
            this.texture.patch(v);
        }
    }

    set onUpdate(f) {
        this.__core.onUpdate = f;
    }

    set onAfterCalcs(f) {
        this.__core.onAfterCalcs = f;
    }

    set onAfterUpdate(f) {
        this.__core.onAfterUpdate = f;
    }

    get shader() {
        return this.__core.shader;
    }

    set shader(v) {
        const shader = Shader.create(this.stage, v);

        if (shader) {
            if (this.__enabled && this.__core.shader) {
                this.__core.shader.removeView(this);
            }

            this.__core.shader = shader;

            if (this.__enabled && this.__core.shader) {
                this.__core.shader.addView(this);
            }
        }
    }

    _hasTexturizer() {
        return !!this.__core._texturizer;
    }

    get renderToTexture() {
        return this.rtt
    }

    set renderToTexture(v) {
        this.rtt = v
    }

    get rtt() {
        return this._hasTexturizer() && this.texturizer.enabled;
    }

    set rtt(v) {
        this.texturizer.enabled = v;
    }

    get rttLazy() {
        return this._hasTexturizer() && this.texturizer.lazy;
    }

    set rttLazy(v) {
        this.texturizer.lazy = v;
    }

    get renderOffscreen() {
        return this._hasTexturizer() && this.texturizer.renderOffscreen;
    }

    set renderOffscreen(v) {
        this.texturizer.renderOffscreen = v;
    }

    get colorizeResultTexture() {
        return this._hasTexturizer() && this.texturizer.colorize;
    }

    set colorizeResultTexture(v) {
        this.texturizer.colorize = v;
    }

    getTexture() {
        return this.texturizer._getTextureSource();
    }

    get texturizer() {
        return this.__core.texturizer;
    }

    patch(settings, createMode = false) {
        let paths = Object.keys(settings);

        if (settings.hasOwnProperty("__create")) {
            createMode = settings["__create"];
        }

        for (let i = 0, n = paths.length; i < n; i++) {
            let path = paths[i];
            const v = settings[path];

            let pointIdx = path.indexOf(".");
            let arrowIdx = path.indexOf(">");
            if (arrowIdx === -1 && pointIdx === -1) {
                const firstCharCode = path.charCodeAt(0);
                if (Utils.isUcChar(firstCharCode)) {
                    // Ref.
                    const child = this.getByRef(path);
                    if (!child) {
                        if (v !== undefined) {
                            let subCreateMode = createMode;
                            if (Utils.isObjectLiteral(v)) {
                                if (v.hasOwnProperty("__create")) {
                                    subCreateMode = v.__create;
                                }
                            }

                            if (subCreateMode === null) {
                                // Ignore.
                            } else if (subCreateMode === true) {
                                // Add to list immediately.
                                let c;
                                if (Utils.isObjectLiteral(v)) {
                                    // Catch this case to capture createMode flag.
                                    c = this.childList.createItem(v);
                                    c.patch(v, subCreateMode);
                                } else if (Utils.isObject(v)) {
                                    c = v;
                                }
                                if (c.isView) {
                                    c.ref = path;
                                }

                                this.childList.a(c);
                            } else {
                                this._throwError("Can't find path: " + path);
                            }
                        }
                    } else {
                        if (v === undefined) {
                            if (child.parent) {
                                child.parent.childList.remove(child);
                            }
                        } else if (Utils.isObjectLiteral(v)) {
                            child.patch(v, createMode);
                        } else if (v.isView) {
                            // Replace view by new view.
                            v.ref = path;
                            this.childList.replace(v, child);
                        } else {
                            this._throwError("Unexpected value for path: " + path);
                        }
                    }
                } else {
                    // Property.
                    Base.patchObjectProperty(this, path, v);
                }
            } else {
                // Select path.
                const views = this.select(path);
                if (v === undefined) {
                    for (let i = 0, n = views.length; i < n; i++) {
                        if (views[i].parent) {
                            views[i].parent.childList.remove(views[i]);
                        }
                    }
                } else if (Utils.isObjectLiteral(v)) {
                    // Recursive path.
                    for (let i = 0, n = views.length; i < n; i++) {
                        views[i].patch(v, createMode);
                    }
                } else {
                    this._throwError("Unexpected value for path: " + path);
                }
            }
        }
    }

    _throwError(message) {
        throw new Error(this.constructor.name + " (" + this.getLocationString() + "): " + message);
    }


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
            let value = object[property];
            if (Array.isArray(value)) {
                this.setSmooth(property, value[0], value[1]);
            } else {
                this.setSmooth(property, value);
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
        return t;
    }

    static isColorProperty(property) {
        return property.indexOf("color") >= 0;
    }

    static getMerger(property) {
        if (View.isColorProperty(property)) {
            return StageUtils.mergeColors;
        } else {
            return StageUtils.mergeNumbers;
        }
    }
}

// This gives a slight performance benefit compared to extending EventEmitter.
EventEmitter.addAsMixin(View);

View.prototype.isView = 1;

View.id = 1;

// Getters reused when referencing view (subobject) properties by a property path, as used in a transition or animation ('x', 'texture.x', etc).
View.PROP_GETTERS = new Map();

// Setters reused when referencing view (subobject) properties by a property path, as used in a transition or animation ('x', 'texture.x', etc).
View.PROP_SETTERS = new Map();

import Texture from "./Texture.mjs";
import ImageTexture from "../textures/ImageTexture.mjs";
import TextTexture from "../textures/TextTexture.mjs";
import SourceTexture from "../textures/SourceTexture.mjs";
import Transition from "../animation/Transition.mjs";
import ViewChildList from "./ViewChildList.mjs";
