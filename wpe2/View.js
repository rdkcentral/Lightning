class View extends Base {

    constructor(stage) {

        super();

        EventEmitter.call(this);

        this.stage = stage;
        this.renderer = new ViewRenderer(this);
        this.id = View.id++;
    }

    _properties() {

        /**
         * A view is active if it is a descendant of the stage root and it is visible (worldAlpha > 0).
         * @type {boolean}
         */
        this.active = false;

        /**
         * A view is active if it is a descendant of the stage root.
         * @type {boolean}
         */
        this.attached = false;

        /**
         * @type {View}
         */
        this.parent = null;

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
         * The cached rotation value (because cos and sin are slow).
         * @type {number}
         */
        this.rotationCache = 0;
        this._sr = 0;
        this._cr = 1;

        /**
         * Tags that can be used to identify/search for a specific component.
         * @type {String[]}
         */
        this._tags = null;

        /**
         * The tree's tags mapping.
         * This contains all components for all known tags, at all times.
         * @type {Map}
         * @private
         */
        this.treeTags = null;

        /**
         * Cache for the tag/mtag methods.
         * @type {Map<String,Component[]>}
         */
        this.tagsCache = null;

        /**
         * Tag-to-complex cache (all tags that are part of the complex caches).
         * This maps tags to cached complex tags in the cache.
         * @type {Map<String,String[]>}
         */
        this.tagToComplex = null;

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
        this.viewText = null;

        /**
         * @type {View[]}
         * @protected
         */
        this._children = null;

    }

    setAsRoot() {
        this.updateActiveFlag();
        this.updateAttachedFlag();
        this.renderer.setAsRoot();
    }

    setParent(parent) {
        if (this.parent === parent) return;

        if (this.parent) {
            this._unsetTagsParent();
        }

        this.parent = parent;
        
        if (parent) {
            this._setTagsParent();
        }

        this.updateActiveFlag();

        this.updateAttachedFlag();
    };

    getDepth() {
        let depth = 0;

        let p = this;
        do {
            depth++;
            p = p.parent;
        } while(p);

        return depth;
    };

    getAncestor(l) {
        let p = this;
        while(l > 0 && p.parent) {
            p = p.parent;
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
        while(p.parent) {
            if (this === p) {
                return true;
            }
            p = p.parent;
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

            o1 = o1.parent;
            o2 = o2.parent;
        } while(o1 && o2);

        return null;
    };

    addChild(child) {
        if (!this._children) this._children = [];

        if (child.parent === this && this._children.indexOf(child) >= 0) {
            return child;
        }
        this.addChildAt(child, this._children.length);
    };

    addChildAt (child, index) {
        // prevent adding self as child
        if (child === this) {
            return
        }

        if (this._children === null) {
            this._children = [];
        }

        if (index >= 0 && index <= this._children.length) {
            if (child.parent === this && this._children.indexOf(child) === index) {
                // Ignore.
            } else {
                if (child.parent) {
                    let p = child.parent;
                    p.removeChild(child);
                }

                child.setParent(this);
                this._children.splice(index, 0, child);

                // Sync.
                this.renderer.addChildAt(index, child.renderer);
            }

            return;
        } else {
            throw new Error(child + 'addChildAt: The index '+ index +' supplied is out of bounds ' + this.children.length);
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

    removeChildAt (index) {
        if (!this._children) return;

        let child = this._children[index];

        child.setParent(null);
        this._children.splice(index, 1);

        // Sync.
        this.renderer.removeChildAt(index);

        return child;
    };

    removeChildren() {
        if (this._children) {
            let n = this._children.length;
            if (n) {
                for (let i = 0; i < n; i++) {
                    let child = this._children[i];
                    child.setParent(null);
                }
                this._children.splice(0, n);

                // Sync.
                this.renderer.removeChildren();
            }
        }
    };

    setChildren(children) {
        this.removeChildren();
        for (let i = 0, n = children.length; i < n; i++) {
            let o = children[i];
            if (Utils.isObjectLiteral(o)) {
                let c = this.stage.createView(o);
                c.setSettings(o);
                this.addChild(c);
                return c;
            } else if (o instanceof View) {
                this.addChild(o);
                return o;
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
        return this._visible && (this._alpha > 0) && (this.parent ? this.parent.active : (this.stage.root === this));
    };

    isAttached() {
        return (this.parent ? this.parent.attached : (this.stage.root === this));
    };

    /**
     * Updates the 'active' flag for this branch.
     * @private
     */
    updateActiveFlag() {
        // Calculate active flag.
        let newActive = this.isActive();
        if (this.active !== newActive) {
            if (newActive) {
                this.setActiveFlag();
            } else {
                this.unsetActiveFlag();
            }

            if (this._children) {
                let m = this._children.length;
                if (m > 0) {
                    for (let i = 0; i < m; i++) {
                        this._children[i].updateActiveFlag();
                    }
                }
            }

            // Run this after all _children because we'd like to see (de)activating a branch as an 'atomic' operation.
            if (newActive) {
                this.notifyActivate && this.notifyActivate();
            } else {
                this.notifyDeactivate && this.notifyDeactivate();
            }
        }
    };

    setActiveFlag() {
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

        this.active = true;

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

    unsetActiveFlag() {
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

        this.active = false;
    }

    /**
     * Updates the 'attached' flag for this branch.
     * @private
     */
    updateAttachedFlag() {
        // Calculate active flag.
        let newAttached = this.isAttached();
        if (this.attached !== newAttached) {
            this.attached = newAttached;

            if (newAttached) {
                this.setAttached();
            }

            if (this._children) {
                let m = this._children.length;
                if (m > 0) {
                    for (let i = 0; i < m; i++) {
                        this._children[i].updateAttachedFlag();
                    }
                }
            }
        }
    };

    setAttached() {
        //@todo: trigger event for transitions/animations?
    }

    getRenderWidth() {
        if (this.active) {
            // Render width is only maintained if this view is active.
            return this.renderer.rw;
        } else {
            return this._getRenderWidth();
        }
    };

    getRenderHeight() {
        if (this.active) {
            return this.renderer.rh;
        } else {
            return this._getRenderHeight();
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
        return this.getRenderWidth();
    }

    get renderHeight() {
        return this.getRenderHeight();
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
        let prevValue = this._texture;
        if (v !== prevValue) {
            if (v !== null && !(v instanceof Texture)) {
                throw new Error('incorrect value for texture');
            }

            this._texture = v;

            if (this.active && prevValue && this.displayedTexture !== prevValue) {
                // Keep reference to component for texture source
                if ((!v || prevValue.source !== v.source) && (!this.displayedTexture || (this.displayedTexture.source !== prevValue.source))) {
                    prevValue.source.removeView(this);
                }
            }

            if (v) {
                if (this.active) {
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
            if (this.active && prevValue) {
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
                this.renderer.setDisplayedTextureSource(v.source);
            } else {
                if (this._eventsCount) {
                    this.emit('txUnloaded', v);
                }

                this.renderer.setDisplayedTextureSource(null);
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
        let beforeW = this.renderer.rw;
        let beforeH = this.renderer.rh;
        let rw = this._getRenderWidth();
        let rh = this._getRenderHeight();
        if (beforeW !== rw || beforeH !== rh) {
            // Due to width/height change: update the translation vector and borders.
            this.renderer.setDimensions(this._getRenderWidth(), this._getRenderHeight());
            this._updateLocalTranslate();
        }
    }

    _updateLocalTransform() {
        if (this._rotation !== 0 && this._rotation % (2 * Math.PI)) {
            // check to see if the rotation is the same as the previous render. This means we only need to use sin and cos when rotation actually changes
            if (this._rotation !== this.rotationCache) {
                this.rotationCache = this._rotation;
                this._sr = Math.sin(this._rotation);
                this._cr = Math.cos(this._rotation);
            }

            this.renderer.setLocalTransform(
                this._cr * this._scaleX,
                -this._sr * this._scaleY,
                this._sr * this._scaleX,
                this._cr * this._scaleY
            );
        } else {
            this.renderer.setLocalTransform(
                this._scaleX,
                0,
                0,
                this._scaleY
            );
        }
        this._updateLocalTranslate();
    };

    _updateLocalTranslate() {
        let pivotXMul = this._pivotX * this.renderer.rw;
        let pivotYMul = this._pivotY * this.renderer.rh;
        let px = this._x - (pivotXMul * this.renderer.localTa + pivotYMul * this.renderer.localTb) + pivotXMul;
        let py = this._y - (pivotXMul * this.renderer.localTc + pivotYMul * this.renderer.localTd) + pivotYMul;
        px -= this._mountX * this.renderWidth;
        py -= this._mountY * this.renderHeight;
        this.renderer.setLocalTranslate(
            px,
            py
        );
    };

    _updateLocalTranslateDelta(dx, dy) {
        this.renderer.addLocalTranslate(dx, dy)
    };    
    
    _updateLocalAlpha() {
        this.renderer.setLocalAlpha(this._visible ? this._alpha : 0);
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

            this.renderer.setTextureCoords(tx1, ty1, tx2, ty2);
            this.renderer.setInTextureAtlas(displayedTextureSource.inTextureAtlas);
        }
    }

    getCornerPoints() {
        return this.renderer.getCornerPoints();
    }

    /**
     * Clears the cache(s) for the specified tag.
     * @param {String} tag
     * @private
     */
    _clearTagsCache(tag) {
        if (this.tagsCache) {
            this.tagsCache.delete(tag);

            if (this.tagToComplex) {
                let s = this.tagToComplex.get(tag);
                if (s) {
                    for (let i = 0, n = s.length; i < n; i++) {
                        this.tagsCache.delete(s[i]);
                    }
                    this.tagToComplex.delete(tag);
                }
            }
        }
    };

    /**
     * @private
     */
    _unsetTagsParent() {
        let tags = null;
        let n = 0;
        if (this.treeTags) {
            tags = Utils.iteratorToArray(this.treeTags.keys());
            n = tags.length;

            if (n > 0) {
                for (let i = 0; i < n; i++) {
                    let tagSet = this.treeTags.get(tags[i]);

                    // Remove from treeTags.
                    let p = this;
                    while (p = p.parent) {
                        let parentTreeTags = p.treeTags.get(tags[i]);

                        tagSet.forEach(function(comp) {
                            parentTreeTags.delete(comp);
                        });


                        p._clearTagsCache(tags[i]);
                    }
                }
            }
        }

    };

    /**
     * @private
     */
    _setTagsParent() {
        if (this.treeTags && this.treeTags.size) {
            let self = this;
            this.treeTags.forEach(function(tagSet, tag) {
                // Add to treeTags.
                let p = self;
                while (p = p.parent) {
                    if (!p.treeTags) {
                        p.treeTags = new Map();
                    }

                    let s = p.treeTags.get(tag);
                    if (!s) {
                        s = new Set();
                        p.treeTags.set(tag, s);
                    }

                    tagSet.forEach(function(comp) {
                        s.add(comp);
                    });

                    p._clearTagsCache(tag);
                }
            });
        }
    };

    /**
     * @private
     */
    _getByTag(tag) {
        if (!this.treeTags) {
            return [];
        }
        let t = this.treeTags.get(tag);
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
                if (!p.treeTags) {
                    p.treeTags = new Map();
                }

                let s = p.treeTags.get(tag);
                if (!s) {
                    s = new Set();
                    p.treeTags.set(tag, s);
                }

                s.add(this);

                p._clearTagsCache(tag);
            } while (p = p.parent);
        }
    };

    removeTag(tag) {
        let i = this._tags.indexOf(tag);
        if (i !== -1) {
            this._tags.splice(i, 1);

            // Remove from treeTags hierarchy.
            let p = this;
            do {
                let list = p.treeTags.get(tag);
                if (list) {
                    list.delete(this);

                    p._clearTagsCache(tag);
                }
            } while (p = p.parent);
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
        if (this.tagsCache) {
            res = this.tagsCache.get(tag);
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

            if (!this.tagsCache) {
                this.tagsCache = new Map();
            }

            this.tagsCache.set(tag, res);
        }
        return res;
    };

    stag(tag, settings) {
        let t = this.mtag(tag);
        let n = t.length;
        for (let i = 0; i < n; i++) {
            t[i].set(settings);
        }
    }

    getLocationString() {
        let i;
        if (this.parent) {
            i = this.parent._children.indexOf(this);
            if (i >= 0) {
                let localTags = this.getTags();
                return this.parent.getLocationString() + ":" + i + "[" + this.id + "]" + (localTags.length ? "(" + localTags.join(",") + ")" : "");
            }
        }
        return "";
    };

    toString() {
        let obj = this.getSettings();
        return View.getPrettyString(obj, "");
    };
    
    static getPrettyString(obj, indent) {
        var children = obj.children;
        delete obj.children;

        // Convert singular json settings object.
        var colorKeys = ["color", "colorUl", "colorUr", "colorBl", "colorBr"]
        var str = JSON.stringify(obj, function(k, v) {
            if (colorKeys.indexOf(k) !== -1) {
                return "COLOR[" + v.toString(16) + "]";
            }
            return v;
        });
        str = str.replace(/"COLOR\[([a-f0-9]{1,8})\]"/g, "0x$1");

        if (children && children.length) {
            var isEmpty = (str === "{}");
            str = str.substr(0, str.length - 1) + (isEmpty ? "" : ",") + "\"children\":[\n";
            var n = children.length;
            for (var i = 0; i < n; i++) {
                str += View.getPrettyString(children[i], indent + "  ") + (i < n - 1 ? "," : "") + "\n";
            }
            str += indent + "]}";
        }

        return indent + str;
    }

    getSettings() {
        var settings = this.getNonDefaults();
        
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
        var settings = {};

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

        if (this.renderer.zIndex) settings.zIndex = this.renderer.zIndex;

        if (this.renderer.forceZIndexContext) settings.forceZIndexContext = true;

        if (this.renderer.clipping) settings.clipping = this.renderer.clipping;

        if (this.rect) {
            settings.rect = true;
        } else if (this.src) {
            settings.src = this.src;
        } else if (this.texture && this.viewText) {
            settings.text = this.viewText.settings.getNonDefaults();
        }

        var tnd = this._texture.getNonDefaults();
        if (Object.keys(tnd).length) {
            settings.texture = tnd;
        }
        
        return settings;
    };

    setSettings(settings) {
        View.setObjectSettings(this, settings);
    }

    static setObjectSettings(obj, settings) {
        for (let name in settings) {
            let v = settings[name];
            if (settings.hasOwnProperty(name)) {
                if (Utils.isObjectLiteral(v) && Utils.isObject(obj[name])) {
                    // Sub object.
                    var p = obj[name];
                    if (p.setSettings) {
                        // Custom setSettings method.
                        p.setSettings(p, v);
                    } else {
                        View.setObjectSettings(p, v);
                    }
                } else {
                    obj[name] = v;
                }
            }
        }
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

    get x() {return this._x}
    set x(v) {if (this._x !== v) {
        this._updateLocalTranslateDelta(v - this._x, 0)
        this._x = v
    }}

    get y() {return this._y}
    set y(v) {if (this._y !== v) {
        this._updateLocalTranslateDelta(0, v - this._y)
        this._y = v
    }}

    get w() {return this._w}
    set w(v) {if (this._w !== v) {
        this._w = v
        this._renderWidth = this._getRenderWidth()
        this._updateDimensions()
    }}

    get h() {return this._h}
    set h(v) {if (this._h !== v) {
        this._h = v
        this._renderHeight = this._getRenderHeight()
        this._updateDimensions()
    }}

    get scaleX() {return this._scaleX}
    set scaleX(v) {if (this._scaleX !== v) {
        this._scaleX = v
        this._updateLocalTransform()
    }}

    get scaleY() {return this._scaleY}
    set scaleY(v) {if (this._scaleY !== v) {
        this._scaleY = v
        this._updateLocalTransform()
    }}

    get scale() {return this._scaleX}
    set scale(v) {if (this._scaleX !== v || this._scaleY !== v) {
        this._scaleX = v
        this._scaleY = v
        this._updateLocalTransform()
    }}

    get pivotX() {return this._pivotX}
    set pivotX(v) {if (this._pivotX !== v) {
        this._pivotX = v
        this._updateLocalTranslate()
    }}

    get pivotY() {return this._pivotY}
    set pivotY(v) {if (this._pivotY !== v) {
        this._pivotY = v
        this._updateLocalTranslate()
    }}

    get pivot() {return this._pivotX}
    set pivot(v) {if (this._pivotX !== v || this._pivotY !== v) {
        this._pivotX = v;
        this._pivotY = v;
        this._updateLocalTranslate()
    }}

    get mountX() {return this._mountX}
    set mountX(v) {if (this._mountX !== v) {
        this._mountX = v
        this._updateLocalTranslate()
    }}

    get mountY() {return this._mountY}
    set mountY(v) {if (this._mountY !== v) {
        this._mountY = v
        this._updateLocalTranslate()
    }}

    get mount() {return this._mountX}
    set mount(v) {if (this._mountX !== v || this._mountY !== v) {
        this._mountX = v
        this._mountY = v
        this._updateLocalTranslate()
    }}

    get alpha() {return this._alpha}
    set alpha(v) {
        // Account for rounding errors.
        v = (v > 1 ? 1 : (v < 1e-14 ? 0 : v));
        if (this._alpha !== v) {
            let prev = this._alpha
            this._alpha = v
            this._updateLocalAlpha();
            if ((prev === 0) !== (v === 0)) this.updateActiveFlag()
        }
    }

    get rotation() {return this._rotation}
    set rotation(v) {if (this._rotation !== v) {
        this._rotation = v
        this._updateLocalTransform()
    }}

    get colorUl() {return this.renderer.colorUl}
    set colorUl(v) {this.renderer.colorUl = v;}

    get colorUr() {return this.renderer.colorUr}
    set colorUr(v) {this.renderer.colorUr = v;}

    get colorBl() {return this.renderer.colorBl}
    set colorBl(v) {this.renderer.colorBl = v;}

    get colorBr() {return this.renderer.colorBr}
    set colorBr(v) {this.renderer.colorBr = v;}

    get color() {return this.renderer.colorUl}
    set color(v) {if (this.colorUl !== v || this.colorUr !== v || this.colorBl !== v || this.colorBr !== v) {
        this.colorUl = v;
        this.colorUr = v;
        this.colorBl = v;
        this.colorBr = v;
    }}

    get visible() {return this._visible}
    set visible(v) {if (this._visible !== v) {
        this._visible = v
        this._updateLocalAlpha()
        this.updateActiveFlag()
    }}

    get zIndex() {return this.renderer.zIndex}
    set zIndex(v) {
        let prev = this.renderer.zIndex;
        this.renderer.zIndex = v;
        if (this.active) {
            if (prev !== 0 && v === 0) {
                this.stage.zIndexUsage--
            } else if (prev === 0 && v !== 0) {
                this.stage.zIndexUsage++
            }
        }
    }

    get forceZIndexContext() {return this.renderer.forceZIndexContext}
    set forceZIndexContext(v) {
        this.renderer.forceZIndexContext = v;
    }

    get clipping() {return this.renderer.clipping}
    set clipping(v) {
        this.renderer.clipping = v;
    }

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

    set children(c) {
        this.setChildren(c);
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
        if (!this.viewText) {
            this.viewText = new ViewText(this);
        }

        // Give direct access to the settings.
        return this.viewText.settings;
    }

    set text(v) {
        if (v) {
            this.texture = this.stage.rectangleTexture;
        } else {
            if (!this.viewText) {
                this.viewText = new ViewText(this);
            }
            if (Utils.isString(v)) {
                this.viewText.settings.text = v;
            } else {
                this.viewText.settings.setSettings(v);
            }
        }
    }

}

View.id = 1;

// Setters reused when referencing view (subobject) properties by a property path, as used in a transition or animation ('x', 'texture.x', etc).
// Reusing these saves memory and allows better optimization.
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

Base.mixinEs5(View, EventEmitter);