import FlexTarget from "../../flex/FlexTarget.mjs";

export default class ElementCore {

    constructor(element) {
        this._element = element;

        this.ctx = element.stage.ctx;

        // The memory layout of the internal variables is affected by their position in the constructor.
        // It boosts performance to order them by usage of cpu-heavy functions (renderSimple and update).

        this._recalc = 0;

        this._parent = null;

        this._onUpdate = null;

        this._pRecalc = 0;

        this._worldContext = new ElementCoreContext();

        this._hasUpdates = false;

        this._localAlpha = 1;

        this._onAfterCalcs = null;

        this._onAfterUpdate = null;

        // All local translation/transform updates: directly propagated from x/y/w/h/scale/whatever.
        this._localPx = 0;
        this._localPy = 0;

        this._localTa = 1;
        this._localTb = 0;
        this._localTc = 0;
        this._localTd = 1;

        this._isComplex = false;

        this._dimsUnknown = false;

        this._clipping = false;

        // Used by both update and render.
        this._zSort = false;

        this._outOfBounds = 0;

        /**
         * The texture source to be displayed.
         * @type {TextureSource}
         */
        this._displayedTextureSource = null;

        this._zContextUsage = 0;

        this._children = null;

        this._hasRenderUpdates = 0;

        this._zIndexedChildren = null;

        this._renderContext = this._worldContext;

        this.renderState = this.ctx.renderState;

        this._scissor = null;

        // The ancestor ElementCore that owns the inherited shader. Null if none is active (default shader).
        this._shaderOwner = null;


        this._updateTreeOrder = 0;

        this._colorUl = this._colorUr = this._colorBl = this._colorBr = 0xFFFFFFFF;

        this._x = 0;
        this._y = 0;
        this._w = 0;
        this._h = 0;

        this._optFlags = 0;
        this._funcX = null;
        this._funcY = null;
        this._funcW = null;
        this._funcH = null;

        this._scaleX = 1;
        this._scaleY = 1;
        this._pivotX = 0.5;
        this._pivotY = 0.5;
        this._mountX = 0;
        this._mountY = 0;
        this._rotation = 0;

        this._alpha = 1;
        this._visible = true;

        this._ulx = 0;
        this._uly = 0;
        this._brx = 1;
        this._bry = 1;

        this._zIndex = 0;
        this._forceZIndexContext = false;
        this._zParent = null;

        this._isRoot = false;

        /**
         * Iff true, during zSort, this element should be 're-sorted' because either:
         * - zIndex did chang
         * - zParent did change
         * - element was moved in the render tree
         * @type {boolean}
         */
        this._zIndexResort = false;

        this._shader = null;

        // Element is rendered on another texture.
        this._renderToTextureEnabled = false;

        this._texturizer = null;

        this._useRenderToTexture = false;

        this._boundsMargin = null;

        this._recBoundsMargin = null;

        this._withinBoundsMargin = false;

        this._viewport = null;

        this._clipbox = true;

        this.render = this._renderSimple;

        this._layout = null;
    }

    get offsetX() {
        if (this._funcX) {
            return this._funcX;
        } else {
            if (this.hasFlexLayout()) {
                return this._layout.originalX;
            } else {
                return this._x;
            }
        }
    }

    set offsetX(v) {
        if (Utils.isFunction(v)) {
            this.funcX = v;
        } else {
            this._disableFuncX();
            if (this.hasFlexLayout()) {
                this.x += (v - this._layout.originalX);
                this._layout.setOriginalXWithoutUpdatingLayout(v);
            } else {
                this.x = v;
            }
        }
    }

    get x() {
        return this._x;
    }

    set x(v) {
        if (v !== this._x) {
            this._updateLocalTranslateDelta(v - this._x, 0);
            this._x = v;
        }
    }

    get funcX() {
        return (this._optFlags & 1 ? this._funcX : null);
    }

    set funcX(v) {
        if (this._funcX !== v) {
            this._optFlags |= 1;
            this._funcX = v;
            if (this.hasFlexLayout()) {
                this._layout.setOriginalXWithoutUpdatingLayout(0);
                this.layout.forceLayout();
            } else {
                this._x = 0;
                this._triggerRecalcTranslate();
            }
        }
    }

    _disableFuncX() {
        this._optFlags = this._optFlags & (0xFFFF - 1);
        this._funcX = null;
    }

    get offsetY() {
        if (this._funcY) {
            return this._funcY;
        } else {
            if (this.hasFlexLayout()) {
                return this._layout.originalY;
            } else {
                return this._y;
            }
        }
    }

    set offsetY(v) {
        if (Utils.isFunction(v)) {
            this.funcY = v;
        } else {
            this._disableFuncY();
            if (this.hasFlexLayout()) {
                this.y += (v - this._layout.originalY);
                this._layout.setOriginalYWithoutUpdatingLayout(v);
            } else {
                this.y = v;
            }
        }
    }

    get y() {
        return this._y;
    }

    set y(v) {
        if (v !== this._y) {
            this._updateLocalTranslateDelta(0, v - this._y);
            this._y = v;
        }
    }

    get funcY() {
        return (this._optFlags & 2 ? this._funcY : null);
    }

    set funcY(v) {
        if (this._funcY !== v) {
            this._optFlags |= 2;
            this._funcY = v;
            if (this.hasFlexLayout()) {
                this._layout.setOriginalYWithoutUpdatingLayout(0);
                this.layout.forceLayout();
            } else {
                this._y = 0;
                this._triggerRecalcTranslate();
            }
        }
    }

    _disableFuncY() {
        this._optFlags = this._optFlags & (0xFFFF - 2);
        this._funcY = null;
    }

    get funcW() {
        return (this._optFlags & 4 ? this._funcW : null);
    }

    set funcW(v) {
        if (this._funcW !== v) {
            this._optFlags |= 4;
            this._funcW = v;
            if (this.hasFlexLayout()) {
                this._layout._originalWidth = 0;
                this.layout.changedDimensions(true, false);
            } else {
                this._w = 0;
                this._triggerRecalcTranslate();
            }
        }
    }

    disableFuncW() {
        this._optFlags = this._optFlags & (0xFFFF - 4);
        this._funcW = null;
    }

    get funcH() {
        return (this._optFlags & 8 ? this._funcH : null);
    }

    set funcH(v) {
        if (this._funcH !== v) {
            this._optFlags |= 8;
            this._funcH = v;
            if (this.hasFlexLayout()) {
                this._layout._originalHeight = 0;
                this.layout.changedDimensions(false, true);
            } else {
                this._h = 0;
                this._triggerRecalcTranslate();
            }
        }
    }

    disableFuncH() {
        this._optFlags = this._optFlags & (0xFFFF - 8);
        this._funcH = null;
    }

    get w() {
        return this._w;
    }

    getRenderWidth() {
        if (this.hasFlexLayout()) {
            return this._layout.originalWidth;
        } else {
            return this._w;
        }
    }

    get h() {
        return this._h;
    }

    getRenderHeight() {
        if (this.hasFlexLayout()) {
            return this._layout.originalHeight;
        } else {
            return this._h;
        }
    }

    get scaleX() {
        return this._scaleX;
    }

    set scaleX(v) {
        if (this._scaleX !== v) {
            this._scaleX = v;
            this._updateLocalTransform();
        }
    }

    get scaleY() {
        return this._scaleY;
    }

    set scaleY(v) {
        if (this._scaleY !== v) {
            this._scaleY = v;
            this._updateLocalTransform();
        }
    }

    get scale() {
        return this.scaleX;
    }

    set scale(v) {
        if (this._scaleX !== v || this._scaleY !== v) {
            this._scaleX = v;
            this._scaleY = v;
            this._updateLocalTransform();
        }
    }

    get pivotX() {
        return this._pivotX;
    }

    set pivotX(v) {
        if (this._pivotX !== v) {
            this._pivotX = v;
            this._updateLocalTranslate();
        }
    }

    get pivotY() {
        return this._pivotY;
    }

    set pivotY(v) {
        if (this._pivotY !== v) {
            this._pivotY = v;
            this._updateLocalTranslate();
        }
    }

    get pivot() {
        return this._pivotX;
    }

    set pivot(v) {
        if (this._pivotX !== v || this._pivotY !== v) {
            this._pivotX = v;
            this._pivotY = v;
            this._updateLocalTranslate();
        }
    }

    get mountX() {
        return this._mountX;
    }

    set mountX(v) {
        if (this._mountX !== v) {
            this._mountX = v;
            this._updateLocalTranslate();
        }
    }

    get mountY() {
        return this._mountY;
    }

    set mountY(v) {
        if (this._mountY !== v) {
            this._mountY = v;
            this._updateLocalTranslate();
        }
    }

    get mount() {
        return this._mountX;
    }

    set mount(v) {
        if (this._mountX !== v || this._mountY !== v) {
            this._mountX = v;
            this._mountY = v;
            this._updateLocalTranslate();
        }
    }

    get rotation() {
        return this._rotation;
    }

    set rotation(v) {
        if (this._rotation !== v) {
            this._rotation = v;
            this._updateLocalTransform();
        }
    }

    get alpha() {
        return this._alpha;
    }

    set alpha(v) {
        // Account for rounding errors.
        v = (v > 1 ? 1 : (v < 1e-14 ? 0 : v));
        if (this._alpha !== v) {
            let prev = this._alpha;
            this._alpha = v;
            this._updateLocalAlpha();
            if ((prev === 0) !== (v === 0)) {
                this._element._updateEnabledFlag();
            }
        }
    }

    get visible() {
        return this._visible;
    }

    set visible(v) {
        if (this._visible !== v) {
            this._visible = v;
            this._updateLocalAlpha();
            this._element._updateEnabledFlag();

            if (this.hasFlexLayout()) {
                this.layout.setVisible(v);
            }
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
        this._recalcLocalTranslate();
        this._triggerRecalcTranslate();
    };

    _recalcLocalTranslate() {
        let pivotXMul = this._pivotX * this._w;
        let pivotYMul = this._pivotY * this._h;
        let px = this._x - (pivotXMul * this._localTa + pivotYMul * this._localTb) + pivotXMul;
        let py = this._y - (pivotXMul * this._localTc + pivotYMul * this._localTd) + pivotYMul;
        px -= this._mountX * this._w;
        py -= this._mountY * this._h;
        this._localPx = px;
        this._localPy = py;
    }

    _updateLocalTranslateDelta(dx, dy) {
        this._addLocalTranslate(dx, dy);
    };

    _updateLocalAlpha() {
        this._setLocalAlpha(this._visible ? this._alpha : 0);
    };

    /**
     * @param {number} type
     * 0: no updates
     * 1: re-invoke shader
     * 3: re-create render texture and re-invoke shader
     */
    setHasRenderUpdates(type) {
        if (this._worldContext.alpha) {
            // Ignore if 'world invisible'. Render updates will be reset to 3 for every element that becomes visible.
            let p = this;
            p._hasRenderUpdates = Math.max(type, p._hasRenderUpdates);
            while ((p = p._parent) && (p._hasRenderUpdates !== 3)) {
                p._hasRenderUpdates = 3;
            }
        }
    }

    /**
     * @param {Number} type
     *   1: alpha
     *   2: translate
     *   4: transform
     * 128: becomes visible
     * 256: flex layout updated
     */
    _setRecalc(type) {
        this._recalc |= type;

        this._setHasUpdates();

        // Any changes in descendants should trigger texture updates.
        if (this._parent) {
            this._parent.setHasRenderUpdates(3);
        }
    }

    _setHasUpdates() {
        let p = this;
        while(p && !p._hasUpdates) {
            p._hasUpdates = true;
            p = p._parent;
        }
    }

    getParent() {
        return this._parent;
    }

    setParent(parent) {
        if (parent !== this._parent) {
            let prevIsZContext = this.isZContext();
            let prevParent = this._parent;
            this._parent = parent;

            // Notify flex layout engine.
            if (this._layout || (parent && parent.isFlexContainer())) {
                this.layout.setParent(prevParent, parent);
            }

            if (prevParent) {
                // When elements are deleted, the render texture must be re-rendered.
                prevParent.setHasRenderUpdates(3);
            }

            this._setRecalc(1 + 2 + 4);

            if (this._parent) {
                // Force parent to propagate hasUpdates flag.
                this._parent._setHasUpdates();
            }

            if (this._zIndex === 0) {
                this.setZParent(parent);
            } else {
                this.setZParent(parent ? parent.findZContext() : null);
            }

            if (prevIsZContext !== this.isZContext()) {
                if (!this.isZContext()) {
                    this.disableZContext();
                } else {
                    this.enableZContext(prevParent.findZContext());
                }
            }

            // Tree order did change: even if zParent stays the same, we must resort.
            this._zIndexResort = true;
            if (this._zParent) {
                this._zParent.enableZSort();
            }

            if (!this._shader) {
                let newShaderOwner = parent && !parent._renderToTextureEnabled ? parent._shaderOwner : null;
                if (newShaderOwner !== this._shaderOwner) {
                    this.setHasRenderUpdates(1);
                    this._setShaderOwnerRecursive(newShaderOwner);
                }
            }
        }
    };

    enableZSort(force = false) {
        if (!this._zSort && this._zContextUsage > 0) {
            this._zSort = true;
            if (force) {
                // ZSort must be done, even if this element is invisible.
                // This is done to prevent memory leaks when removing element from inactive render branches.
                this.ctx.forceZSort(this);
            }
        }
    }

    addChildAt(index, child) {
        if (!this._children) this._children = [];
        this._children.splice(index, 0, child);
        child.setParent(this);
    };

    setChildAt(index, child) {
        if (!this._children) this._children = [];
        this._children[index].setParent(null);
        this._children[index] = child;
        child.setParent(this);
    }

    removeChildAt(index) {
        let child = this._children[index];
        this._children.splice(index, 1);
        child.setParent(null);
    };

    removeChildren() {
        if (this._children) {
            for (let i = 0, n = this._children.length; i < n; i++) {
                this._children[i].setParent(null);
            }

            this._children.splice(0);

            if (this._zIndexedChildren) {
                this._zIndexedChildren.splice(0);
            }
        }
    };

    syncChildren(removed, added, order) {
        this._children = order;
        for (let i = 0, n = removed.length; i < n; i++) {
            removed[i].setParent(null);
        }
        for (let i = 0, n = added.length; i < n; i++) {
            added[i].setParent(this);
        }
    }

    moveChild(fromIndex, toIndex) {
        let c = this._children[fromIndex];
        this._children.splice(fromIndex, 1);
        this._children.splice(toIndex, 0, c);

        // Tree order changed: must resort!;
        this._zIndexResort = true;
        if (this._zParent) {
            this._zParent.enableZSort();
        }
    }

    _setLocalTransform(a, b, c, d) {
        this._setRecalc(4);
        this._localTa = a;
        this._localTb = b;
        this._localTc = c;
        this._localTd = d;
        
        // We also regard negative scaling as a complex case, so that we can optimize the non-complex case better.
        this._isComplex = (b !== 0) || (c !== 0) || (a < 0) || (d < 0);
    };

    _addLocalTranslate(dx, dy) {
        this._localPx += dx;
        this._localPy += dy;
        this._triggerRecalcTranslate();
    }

    _setLocalAlpha(a) {
        if (!this._worldContext.alpha && ((this._parent && this._parent._worldContext.alpha) && a)) {
            // Element is becoming visible. We need to force update.
            this._setRecalc(1 + 128);
        } else {
            this._setRecalc(1);
        }

        if (a < 1e-14) {
            // Tiny rounding errors may cause failing visibility tests.
            a = 0;
        }

        this._localAlpha = a;
    };

    setDimensions(w, h, isEstimate = this._dimsUnknown) {
        // In case of an estimation, the update loop should perform different bound checks.
        this._dimsUnknown = isEstimate;

        if (this.hasFlexLayout()) {
            this._layout.originalWidth = w;
            this._layout.originalHeight = h;
        } else {
            if (this._w !== w || this._h !== h) {
                this._updateDimensions(w, h);
                return true;
            }
        }
        return false;
    };

    _updateDimensions(w, h) {
        if (this._w !== w || this._h !== h) {
            this._w = w;
            this._h = h;

            this._triggerRecalcTranslate();

            if (this._texturizer) {
                this._texturizer.releaseRenderTexture();
                this._texturizer.updateResultTexture();
            }
            // Due to width/height change: update the translation vector.
            this._updateLocalTranslate();
        }
    }

    setTextureCoords(ulx, uly, brx, bry) {
        this.setHasRenderUpdates(3);

        this._ulx = ulx;
        this._uly = uly;
        this._brx = brx;
        this._bry = bry;
    };

    get displayedTextureSource() {
        return this._displayedTextureSource;
    }

    setDisplayedTextureSource(textureSource) {
        this.setHasRenderUpdates(3);
        this._displayedTextureSource = textureSource;
    };

    get isRoot() {
        return this._isRoot;
    }

    setAsRoot() {
        // Use parent dummy.
        this._parent = new ElementCore(this._element);

        // After setting root, make sure it's updated.
        this._parent._hasRenderUpdates = 3;
        this._parent._hasUpdates = true;

        // Root is, and will always be, the primary zContext.
        this._isRoot = true;

        this.ctx.root = this;

        // Set scissor area of 'fake parent' to stage's viewport.
        this._parent._viewport = [0, 0, this.ctx.stage.coordsWidth, this.ctx.stage.coordsHeight];
        this._parent._scissor = this._parent._viewport;

        // When recBoundsMargin is null, the defaults are used (100 for all sides).
        this._parent._recBoundsMargin = null;

        this._setRecalc(1 + 2 + 4);
    };

    isAncestorOf(c) {
        let p = c;
        while (p = p._parent) {
            if (this === p) {
                return true;
            }
        }
        return false;
    };

    isZContext() {
        return (this._forceZIndexContext || this._renderToTextureEnabled || this._zIndex !== 0 || this._isRoot || !this._parent);
    };

    findZContext() {
        if (this.isZContext()) {
            return this;
        } else {
            return this._parent.findZContext();
        }
    };

    setZParent(newZParent) {
        if (this._zParent !== newZParent) {
            if (this._zParent !== null) {
                if (this._zIndex !== 0) {
                    this._zParent.decZContextUsage();
                }

                // We must filter out this item upon the next resort.
                this._zParent.enableZSort();
            }

            if (newZParent !== null) {
                let hadZContextUsage = (newZParent._zContextUsage > 0);

                // @pre: new parent's children array has already been modified.
                if (this._zIndex !== 0) {
                    newZParent.incZContextUsage();
                }

                if (newZParent._zContextUsage > 0) {
                    if (!hadZContextUsage && (this._parent === newZParent)) {
                        // This child was already in the children list.
                        // Do not add double.
                    } else {
                        // Add new child to array.
                        newZParent._zIndexedChildren.push(this);
                    }

                    // Order should be checked.
                    newZParent.enableZSort();
                }
            }

            this._zParent = newZParent;

            // Newly added element must be marked for resort.
            this._zIndexResort = true;
        }
    };

    incZContextUsage() {
        this._zContextUsage++;
        if (this._zContextUsage === 1) {
            if (!this._zIndexedChildren) {
                this._zIndexedChildren = [];
            }
            if (this._children) {
                // Copy.
                for (let i = 0, n = this._children.length; i < n; i++) {
                    this._zIndexedChildren.push(this._children[i]);
                }
                // Initially, children are already sorted properly (tree order).
                this._zSort = false;
            }
        }
    };

    decZContextUsage() {
        this._zContextUsage--;
        if (this._zContextUsage === 0) {
            this._zSort = false;
            this._zIndexedChildren.splice(0);
        }
    };

    get zIndex() {
        return this._zIndex;
    }

    set zIndex(zIndex) {
        if (this._zIndex !== zIndex) {
            this.setHasRenderUpdates(1);

            let newZParent = this._zParent;

            let prevIsZContext = this.isZContext();
            if (zIndex === 0 && this._zIndex !== 0) {
                if (this._parent === this._zParent) {
                    if (this._zParent) {
                        this._zParent.decZContextUsage();
                    }
                } else {
                    newZParent = this._parent;
                }
            } else if (zIndex !== 0 && this._zIndex === 0) {
                newZParent = this._parent ? this._parent.findZContext() : null;
                if (newZParent === this._zParent) {
                    if (this._zParent) {
                        this._zParent.incZContextUsage();
                        this._zParent.enableZSort();
                    }
                }
            } else if (zIndex !== this._zIndex) {
                if (this._zParent && this._zParent._zContextUsage) {
                    this._zParent.enableZSort();
                }
            }

            if (newZParent !== this._zParent) {
                this.setZParent(null);
            }

            this._zIndex = zIndex;

            if (newZParent !== this._zParent) {
                this.setZParent(newZParent);
            }

            if (prevIsZContext !== this.isZContext()) {
                if (!this.isZContext()) {
                    this.disableZContext();
                } else {
                    this.enableZContext(this._parent.findZContext());
                }
            }

            // Make sure that resort is done.
            this._zIndexResort = true;
            if (this._zParent) {
                this._zParent.enableZSort();
            }
        }
    };

    get forceZIndexContext() {
        return this._forceZIndexContext;
    }

    set forceZIndexContext(v) {
        this.setHasRenderUpdates(1);

        let prevIsZContext = this.isZContext();
        this._forceZIndexContext = v;

        if (prevIsZContext !== this.isZContext()) {
            if (!this.isZContext()) {
                this.disableZContext();
            } else {
                this.enableZContext(this._parent.findZContext());
            }
        }
    };

    enableZContext(prevZContext) {
        if (prevZContext && prevZContext._zContextUsage > 0) {
            // Transfer from upper z context to this z context.
            const results = this._getZIndexedDescs();
            results.forEach((c) => {
                if (this.isAncestorOf(c) && c._zIndex !== 0) {
                    c.setZParent(this);
                }
            });
        }
    }

    _getZIndexedDescs() {
        const results = [];
        if (this._children) {
            for (let i = 0, n = this._children.length; i < n; i++) {
                this._children[i]._getZIndexedDescsRec(results);
            }
        }
        return results;
    }

    _getZIndexedDescsRec(results) {
        if (this._zIndex) {
            results.push(this);
        } else if (this._children && !this.isZContext()) {
            for (let i = 0, n = this._children.length; i < n; i++) {
                this._children[i]._getZIndexedDescsRec(results);
            }
        }
    }

    disableZContext() {
        // Transfer from this z context to upper z context.
        if (this._zContextUsage > 0) {
            let newZParent = this._parent.findZContext();

            // Make sure that z-indexed children are up to date (old ones removed).
            if (this._zSort) {
                this.sortZIndexedChildren();
            }

            this._zIndexedChildren.slice().forEach(function (c) {
                if (c._zIndex !== 0) {
                    c.setZParent(newZParent);
                }
            });
        }
    };

    get colorUl() {
        return this._colorUl;
    }

    set colorUl(color) {
        if (this._colorUl !== color) {
            this.setHasRenderUpdates(this._displayedTextureSource ? 3 : 1);
            this._colorUl = color;
        }
    }

    get colorUr() {
        return this._colorUr;
    }

    set colorUr(color) {
        if (this._colorUr !== color) {
            this.setHasRenderUpdates(this._displayedTextureSource ? 3 : 1);
            this._colorUr = color;
        }
    };

    get colorBl() {
        return this._colorBl;
    }

    set colorBl(color) {
        if (this._colorBl !== color) {
            this.setHasRenderUpdates(this._displayedTextureSource ? 3 : 1);
            this._colorBl = color;
        }
    };

    get colorBr() {
        return this._colorBr;
    }

    set colorBr(color) {
        if (this._colorBr !== color) {
            this.setHasRenderUpdates(this._displayedTextureSource ? 3 : 1);
            this._colorBr = color;
        }
    };


    set onUpdate(f) {
        this._onUpdate = f;
        this._setRecalc(7);
    }

    set onAfterUpdate(f) {
        this._onAfterUpdate = f;
        this._setRecalc(7);
    }

    set onAfterCalcs(f) {
        this._onAfterCalcs = f;
        this._setRecalc(7);
    }

    get shader() {
        return this._shader;
    }

    set shader(v) {
        this.setHasRenderUpdates(1);

        let prevShader = this._shader;
        this._shader = v;
        if (!v && prevShader) {
            // Disabled shader.
            let newShaderOwner = (this._parent && !this._parent._renderToTextureEnabled ? this._parent._shaderOwner : null);
            this._setShaderOwnerRecursive(newShaderOwner);
        } else if (v) {
            // Enabled shader.
            this._setShaderOwnerRecursive(this);
        }
    }

    get activeShader() {
        return this._shaderOwner ? this._shaderOwner.shader : this.renderState.defaultShader;
    }

    get activeShaderOwner() {
        return this._shaderOwner;
    }

    get clipping() {
        return this._clipping;
    }

    set clipping(v) {
        if (this._clipping !== v) {
            this._clipping = v;

            // Force update of scissor by updating translate.
            // Alpha must also be updated because the scissor area may have been empty.
            this._setRecalc(1 + 2);
        }
    }

    get clipbox() {
        return this._clipbox;
    }

    set clipbox(v) {
        // In case of out-of-bounds element, all children will also be ignored.
        // It will save us from executing the update/render loops for those.
        // The optimization will be used immediately during the next frame.
        this._clipbox = v;
    }

    _setShaderOwnerRecursive(elementCore) {
        this._shaderOwner = elementCore;

        if (this._children && !this._renderToTextureEnabled) {
            for (let i = 0, n = this._children.length; i < n; i++) {
                let c = this._children[i];
                if (!c._shader) {
                    c._setShaderOwnerRecursive(elementCore);
                    c._hasRenderUpdates = 3;
                }
            }
        }
    };

    _setShaderOwnerChildrenRecursive(elementCore) {
        if (this._children) {
            for (let i = 0, n = this._children.length; i < n; i++) {
                let c = this._children[i];
                if (!c._shader) {
                    c._setShaderOwnerRecursive(elementCore);
                    c._hasRenderUpdates = 3;
                }
            }
        }
    };

    _hasRenderContext() {
        return this._renderContext !== this._worldContext;
    }

    get renderContext() {
        return this._renderContext;
    }

    updateRenderToTextureEnabled() {
        // Enforce texturizer initialisation.
        let v = this.texturizer._enabled;

        if (v) {
            this._enableRenderToTexture();
        } else {
            this._disableRenderToTexture();
            this._texturizer.releaseRenderTexture();
        }
    }

    _enableRenderToTexture() {
        if (!this._renderToTextureEnabled) {
            let prevIsZContext = this.isZContext();

            this._renderToTextureEnabled = true;

            this._renderContext = new ElementCoreContext();

            // If render to texture is active, a new shader context is started.
            this._setShaderOwnerChildrenRecursive(null);

            if (!prevIsZContext) {
                // Render context forces z context.
                this.enableZContext(this._parent ? this._parent.findZContext() : null);
            }

            this.setHasRenderUpdates(3);

            // Make sure that the render coordinates get updated.
            this._setRecalc(7);

            this.render = this._renderAdvanced;
        }
    }

    _disableRenderToTexture() {
        if (this._renderToTextureEnabled) {
            this._renderToTextureEnabled = false;

            this._setShaderOwnerChildrenRecursive(this._shaderOwner);

            this._renderContext = this._worldContext;

            if (!this.isZContext()) {
                this.disableZContext();
            }

            // Make sure that the render coordinates get updated.
            this._setRecalc(7);

            this.setHasRenderUpdates(3);

            this.render = this._renderSimple;
        }
    }

    isWhite() {
        return (this._colorUl === 0xFFFFFFFF) && (this._colorUr === 0xFFFFFFFF) && (this._colorBl === 0xFFFFFFFF) && (this._colorBr === 0xFFFFFFFF);
    }

    hasSimpleTexCoords() {
        return (this._ulx === 0) && (this._uly === 0) && (this._brx === 1) && (this._bry === 1);
    }

    _stashTexCoords() {
        this._stashedTexCoords = [this._ulx, this._uly, this._brx, this._bry];
        this._ulx = 0;
        this._uly = 0;
        this._brx = 1;
        this._bry = 1;
    }

    _unstashTexCoords() {
        this._ulx = this._stashedTexCoords[0];
        this._uly = this._stashedTexCoords[1];
        this._brx = this._stashedTexCoords[2];
        this._bry = this._stashedTexCoords[3];
        this._stashedTexCoords = null;
    }

    _stashColors() {
        this._stashedColors = [this._colorUl, this._colorUr, this._colorBr, this._colorBl];
        this._colorUl = 0xFFFFFFFF;
        this._colorUr = 0xFFFFFFFF;
        this._colorBr = 0xFFFFFFFF;
        this._colorBl = 0xFFFFFFFF;
    }

    _unstashColors() {
        this._colorUl = this._stashedColors[0];
        this._colorUr = this._stashedColors[1];
        this._colorBr = this._stashedColors[2];
        this._colorBl = this._stashedColors[3];
        this._stashedColors = null;
    }

    isVisible() {
        return (this._localAlpha > 1e-14);
    };

    get outOfBounds() {
        return this._outOfBounds;
    }

    set boundsMargin(v) {

        /**
         *  null: inherit from parent.
         *  number[4]: specific margins: left, top, right, bottom.
         */
        this._boundsMargin = v ? v.slice() : null;

        // We force recalc in order to set all boundsMargin recursively during the next update.
        this._triggerRecalcTranslate();
    }

    get boundsMargin() {
        return this._boundsMargin;
    }

    update() {
        this._recalc |= this._parent._pRecalc;

        if (this._layout && this._layout.isEnabled()) {
            if (this._recalc & 256) {
                this._layout.layoutFlexTree();
            }
        } else if ((this._recalc & 2) && this._optFlags) {
            this._applyRelativeDimFuncs();
        }

        if (this._onUpdate) {
            // Block all 'upwards' updates when changing things in this branch.
            this._hasUpdates = true;
            this._onUpdate(this.element, this);
        }

        const pw = this._parent._worldContext;
        let w = this._worldContext;
        const visible = (pw.alpha && this._localAlpha);

        /**
         * We must update if:
         * - branch contains updates (even when invisible because it may contain z-indexed descendants)
         * - there are (inherited) updates and this branch is visible
         * - this branch becomes invisible (descs may be z-indexed so we must update all alpha values)
         */
        if (this._hasUpdates || (this._recalc && visible) || (w.alpha && !visible)) {
            let recalc = this._recalc;

            // Update world coords/alpha.
            if (recalc & 1) {
                if (!w.alpha && visible) {
                    // Becomes visible.
                    this._hasRenderUpdates = 3;
                }
                w.alpha = pw.alpha * this._localAlpha;

                if (w.alpha < 1e-14) {
                    // Tiny rounding errors may cause failing visibility tests.
                    w.alpha = 0;
                }
            }

            if (recalc & 6) {
                w.px = pw.px + this._localPx * pw.ta;
                w.py = pw.py + this._localPy * pw.td;
                if (pw.tb !== 0) w.px += this._localPy * pw.tb;
                if (pw.tc !== 0) w.py += this._localPx * pw.tc;
            }

            if (recalc & 4) {
                w.ta = this._localTa * pw.ta;
                w.tb = this._localTd * pw.tb;
                w.tc = this._localTa * pw.tc;
                w.td = this._localTd * pw.td;

                if (this._isComplex) {
                    w.ta += this._localTc * pw.tb;
                    w.tb += this._localTb * pw.ta;
                    w.tc += this._localTc * pw.td;
                    w.td += this._localTb * pw.tc;
                }
            }

            // Update render coords/alpha.
            const pr = this._parent._renderContext;
            if (this._parent._hasRenderContext()) {
                const init = this._renderContext === this._worldContext;
                if (init) {
                    // First render context build: make sure that it is fully initialized correctly.
                    // Otherwise, if we get into bounds later, the render context would not be initialized correctly.
                    this._renderContext = new ElementCoreContext();
                }

                const r = this._renderContext;

                // Update world coords/alpha.
                if (init || (recalc & 1)) {
                    r.alpha = pr.alpha * this._localAlpha;

                    if (r.alpha < 1e-14) {
                        r.alpha = 0;
                    }
                }

                if (init || (recalc & 6)) {
                    r.px = pr.px + this._localPx * pr.ta;
                    r.py = pr.py + this._localPy * pr.td;
                    if (pr.tb !== 0) r.px += this._localPy * pr.tb;
                    if (pr.tc !== 0) r.py += this._localPx * pr.tc;
                }

                if (init) {
                    // We set the recalc toggle, because we must make sure that the scissor is updated.
                    recalc |= 2;
                }

                if (init || (recalc & 4)) {
                    r.ta = this._localTa * pr.ta;
                    r.tb = this._localTd * pr.tb;
                    r.tc = this._localTa * pr.tc;
                    r.td = this._localTd * pr.td;

                    if (this._isComplex) {
                        r.ta += this._localTc * pr.tb;
                        r.tb += this._localTb * pr.ta;
                        r.tc += this._localTc * pr.td;
                        r.td += this._localTb * pr.tc;
                    }
                }
            } else {
                this._renderContext = this._worldContext;
            }

            if (this.ctx.updateTreeOrder === -1) {
                this.ctx.updateTreeOrder = this._updateTreeOrder + 1;
            } else {
                this._updateTreeOrder = this.ctx.updateTreeOrder++;
            }

            // Determine whether we must use a 'renderTexture'.
            const useRenderToTexture = this._renderToTextureEnabled && this._texturizer.mustRenderToTexture();
            if (this._useRenderToTexture !== useRenderToTexture) {
                // Coords must be changed.
                this._recalc |= 2 + 4;

                // Scissor may change: force update.
                recalc |= 2;

                if (!this._useRenderToTexture) {
                    // We must release the texture.
                    this._texturizer.release();
                }
            }
            this._useRenderToTexture = useRenderToTexture;

            const r = this._renderContext;
            
            const bboxW = this._dimsUnknown ? 2048 : this._w;
            const bboxH = this._dimsUnknown ? 2048 : this._h;
            
            // Calculate a bbox for this element.
            let sx, sy, ex, ey;
            const rComplex = (r.tb !== 0) || (r.tc !== 0) || (r.ta < 0) || (r.td < 0);
            if (rComplex) {
                sx = Math.min(0, bboxW * r.ta, bboxW * r.ta + bboxH * r.tb, bboxH * r.tb) + r.px;
                ex = Math.max(0, bboxW * r.ta, bboxW * r.ta + bboxH * r.tb, bboxH * r.tb) + r.px;
                sy = Math.min(0, bboxW * r.tc, bboxW * r.tc + bboxH * r.td, bboxH * r.td) + r.py;
                ey = Math.max(0, bboxW * r.tc, bboxW * r.tc + bboxH * r.td, bboxH * r.td) + r.py;
            } else {
                sx = r.px;
                ex = r.px + r.ta * bboxW;
                sy = r.py;
                ey = r.py + r.td * bboxH;
            }

            if (this._dimsUnknown && (rComplex || this._localTa < 1 || this._localTb < 1)) {
                // If we are dealing with a non-identity matrix, we must extend the bbox so that withinBounds and
                //  scissors will include the complete range of (positive) dimensions up to ,lh.
                const nx = this._x * pr.ta + this._y * pr.tb + pr.px;
                const ny = this._x * pr.tc + this._y * pr.td + pr.py;
                if (nx < sx) sx = nx;
                if (ny < sy) sy = ny;
                if (nx > ex) ex = nx;
                if (ny > ey) ey = ny;
            }

            if (recalc & 6 || !this._scissor /* initial */) {
                // Determine whether we must 'clip'.
                if (this._clipping && r.isSquare()) {
                    // If the parent renders to a texture, it's scissor should be ignored;
                    const area = this._parent._useRenderToTexture ? this._parent._viewport : this._parent._scissor;
                    if (area) {
                        // Merge scissor areas.
                        const lx = Math.max(area[0], sx);
                        const ly = Math.max(area[1], sy);
                        this._scissor = [
                            lx,
                            ly,
                            Math.min(area[2] + area[0], ex) - lx,
                            Math.min(area[3] + area[1], ey) - ly
                        ];
                    } else {
                        this._scissor = [sx, sy, ex - sx, ey - sy];
                    }
                } else {
                    // No clipping: reuse parent scissor.
                    this._scissor = this._parent._useRenderToTexture ? this._parent._viewport : this._parent._scissor;
                }
            }

            // Calculate the outOfBounds margin.
            if (this._boundsMargin) {
                this._recBoundsMargin = this._boundsMargin;
            } else {
                this._recBoundsMargin = this._parent._recBoundsMargin;
            }

            if (this._onAfterCalcs) {
                // After calcs may change render coords, scissor and/or recBoundsMargin.
                if (this._onAfterCalcs(this.element)) {
                    // Recalculate bbox.
                    if (rComplex) {
                        sx = Math.min(0, bboxW * r.ta, bboxW * r.ta + bboxH * r.tb, bboxH * r.tb) + r.px;
                        ex = Math.max(0, bboxW * r.ta, bboxW * r.ta + bboxH * r.tb, bboxH * r.tb) + r.px;
                        sy = Math.min(0, bboxW * r.tc, bboxW * r.tc + bboxH * r.td, bboxH * r.td) + r.py;
                        ey = Math.max(0, bboxW * r.tc, bboxW * r.tc + bboxH * r.td, bboxH * r.td) + r.py;
                    } else {
                        sx = r.px;
                        ex = r.px + r.ta * bboxW;
                        sy = r.py;
                        ey = r.py + r.td * bboxH;
                    }

                    if (this._dimsUnknown && (rComplex || this._localTa < 1 || this._localTb < 1)) {
                        const nx = this._x * pr.ta + this._y * pr.tb + pr.px;
                        const ny = this._x * pr.tc + this._y * pr.td + pr.py;
                        if (nx < sx) sx = nx;
                        if (ny < sy) sy = ny;
                        if (nx > ex) ex = nx;
                        if (ny > ey) ey = ny;
                    }
                }
            }

            if (this._parent._outOfBounds === 2) {
                // Inherit parent out of boundsness.
                this._outOfBounds = 2;

                if (this._withinBoundsMargin) {
                    this._withinBoundsMargin = false;
                    this.element._disableWithinBoundsMargin();
                }
            } else {
                if (recalc & 6) {
                    // Recheck if element is out-of-bounds (all settings that affect this should enable recalc bit 2 or 4).
                    this._outOfBounds = 0;
                    let withinMargin = true;

                    // Offscreens are always rendered as long as the parent is within bounds.
                    if (!this._renderToTextureEnabled || !this._texturizer || !this._texturizer.renderOffscreen) {
                        if (this._scissor && (this._scissor[2] <= 0 || this._scissor[3] <= 0)) {
                            // Empty scissor area.
                            this._outOfBounds = 2;
                        } else {
                            // Use bbox to check out-of-boundness.
                            if ((this._scissor[0] > ex) ||
                                (this._scissor[1] > ey) ||
                                (sx > (this._scissor[0] + this._scissor[2])) ||
                                (sy > (this._scissor[1] + this._scissor[3]))
                            ) {
                                this._outOfBounds = 1;
                            }

                            if (this._outOfBounds) {
                                if (this._clipping || this._useRenderToTexture || (this._clipbox && (bboxW && bboxH))) {
                                    this._outOfBounds = 2;
                                }
                            }
                        }

                        withinMargin = (this._outOfBounds === 0);
                        if (!withinMargin) {
                            // Re-test, now with margins.
                            if (this._recBoundsMargin) {
                                withinMargin = !((ex < this._scissor[0] - this._recBoundsMargin[2]) ||
                                    (ey < this._scissor[1] - this._recBoundsMargin[3]) ||
                                    (sx > this._scissor[0] + this._scissor[2] + this._recBoundsMargin[0]) ||
                                    (sy > this._scissor[1] + this._scissor[3] + this._recBoundsMargin[1]))
                            } else {
                                withinMargin = !((ex < this._scissor[0] - 100) ||
                                    (ey < this._scissor[1] - 100) ||
                                    (sx > this._scissor[0] + this._scissor[2] + 100) ||
                                    (sy > this._scissor[1] + this._scissor[3] + 100))
                            }
                            if (withinMargin && this._outOfBounds === 2) {
                                // Children must be visited because they may contain elements that are within margin, so must be visible.
                                this._outOfBounds = 1;
                            }
                        }
                    }

                    if (this._withinBoundsMargin !== withinMargin) {
                        this._withinBoundsMargin = withinMargin;

                        if (this._withinBoundsMargin) {
                            // This may update things (txLoaded events) in the element itself, but also in descendants and ancestors.

                            // Changes in ancestors should be executed during the next call of the stage update. But we must
                            // take care that the _recalc and _hasUpdates flags are properly registered. That's why we clear
                            // both before entering the children, and use _pRecalc to transfer inherited updates instead of
                            // _recalc directly.

                            // Changes in descendants are automatically executed within the current update loop, though we must
                            // take care to not update the hasUpdates flag unnecessarily in ancestors. We achieve this by making
                            // sure that the hasUpdates flag of this element is turned on, which blocks it for ancestors.
                            this._hasUpdates = true;

                            const recalc = this._recalc;
                            this._recalc = 0;
                            this.element._enableWithinBoundsMargin();

                            if (this._recalc) {
                                // This element needs to be re-updated now, because we want the dimensions (and other changes) to be updated.
                                return this.update();
                            }

                            this._recalc = recalc;
                        } else {
                            this.element._disableWithinBoundsMargin();
                        }
                    }
                }
            }

            if (this._useRenderToTexture) {
                // Set viewport necessary for children scissor calculation.
                if (this._viewport) {
                    this._viewport[2] = bboxW;
                    this._viewport[3] = bboxH;
                } else {
                    this._viewport = [0, 0, bboxW, bboxH];
                }
            }

            // Filter out bits that should not be copied to the children (currently all are).
            this._pRecalc = (this._recalc & 135);

            // Clear flags so that future updates are properly detected.
            this._recalc = 0;
            this._hasUpdates = false;

            if (this._outOfBounds < 2) {
                if (this._useRenderToTexture) {
                    if (this._worldContext.isIdentity()) {
                        // Optimization.
                        // The world context is already identity: use the world context as render context to prevents the
                        // ancestors from having to update the render context.
                        this._renderContext = this._worldContext
                    } else {
                        // Temporarily replace the render coord attribs by the identity matrix.
                        // This allows the children to calculate the render context.
                        this._renderContext = ElementCoreContext.IDENTITY;
                    }
                }

                if (this._children) {
                    for (let i = 0, n = this._children.length; i < n; i++) {
                        this._children[i].update();
                    }
                }

                if (this._useRenderToTexture) {
                    this._renderContext = r;
                }
            } else {
                if (this._children) {
                    for (let i = 0, n = this._children.length; i < n; i++) {
                        if (this._children[i]._hasUpdates) {
                            this._children[i].update();
                        } else {
                            // Make sure we don't lose the 'inherited' updates.
                            this._children[i]._recalc |= this._pRecalc;
                            this._children[i].updateOutOfBounds();
                        }
                    }
                }
            }

            if (this._onAfterUpdate) {
                this._onAfterUpdate(this.element);
            }
        } else {
            if (this.ctx.updateTreeOrder === -1 || this._updateTreeOrder >= this.ctx.updateTreeOrder) {
                // If new tree order does not interfere with the current (gaps allowed) there's no need to traverse the branch.
                this.ctx.updateTreeOrder = -1;
            } else {
                this.updateTreeOrder();
            }
        }
    }

    _applyRelativeDimFuncs() {
        if (this._optFlags & 1) {
            const x = this._funcX(this._parent.w);
            if (x !== this._x) {
                this._localPx += (x - this._x);
                this._x = x;
            }
        }
        if (this._optFlags & 2) {
            const y = this._funcY(this._parent.h);
            if (y !== this._y) {
                this._localPy += (y - this._y);
                this._y = y;
            }
        }

        let changedDims = false;
        if (this._optFlags & 4) {
            const w = this._funcW(this._parent.w);
            if (w !== this._w) {
                this._w = w;
                changedDims = true;
            }
        }
        if (this._optFlags & 8) {
            const h = this._funcH(this._parent.h);
            if (h !== this._h) {
                this._h = h;
                changedDims = true;
            }
        }

        if (changedDims) {
            // Recalc mount, scale position.
            this._recalcLocalTranslate();

            this.element.onDimensionsChanged(this._w, this._h);
        }
    }

    updateOutOfBounds() {
        // Propagate outOfBounds flag to descendants (necessary because of z-indexing).
        // Invisible elements are not drawn anyway. When alpha is updated, so will _outOfBounds.
        if (this._outOfBounds !== 2 && this._renderContext.alpha > 0) {

            // Inherit parent out of boundsness.
            this._outOfBounds = 2;

            if (this._withinBoundsMargin) {
                this._withinBoundsMargin = false;
                this.element._disableWithinBoundsMargin();
            }

            if (this._children) {
                for (let i = 0, n = this._children.length; i < n; i++) {
                    this._children[i].updateOutOfBounds();
                }
            }
        }
    }

    updateTreeOrder() {
        if (this._localAlpha && (this._outOfBounds !== 2)) {
            this._updateTreeOrder = this.ctx.updateTreeOrder++;

            if (this._children) {
                for (let i = 0, n = this._children.length; i < n; i++) {
                    this._children[i].updateTreeOrder();
                }
            }
        }
    }

    _renderSimple() {
        this._hasRenderUpdates = 0;

        if (this._zSort) {
            this.sortZIndexedChildren();
        }

        if (this._outOfBounds < 2 && this._renderContext.alpha) {
            let renderState = this.renderState;

            if ((this._outOfBounds === 0) && this._displayedTextureSource) {
                renderState.setShader(this.activeShader, this._shaderOwner);
                renderState.setScissor(this._scissor);
                this.renderState.addQuad(this);
            }

            // Also add children to the VBO.
            if (this._children) {
                if (this._zContextUsage) {
                    for (let i = 0, n = this._zIndexedChildren.length; i < n; i++) {
                        this._zIndexedChildren[i].render();
                    }
                } else {
                    for (let i = 0, n = this._children.length; i < n; i++) {
                        if (this._children[i]._zIndex === 0) {
                            // If zIndex is set, this item already belongs to a zIndexedChildren array in one of the ancestors.
                            this._children[i].render();
                        }

                    }
                }
            }
        }
    }

    _renderAdvanced() {
        const hasRenderUpdates = this._hasRenderUpdates;

        // We must clear the hasRenderUpdates flag before rendering, because updating result textures in combination
        // with z-indexing may trigger render updates on a render branch that is 'half done'.
        // We need to ensure that the full render branch is marked for render updates, not only half (leading to freeze).
        this._hasRenderUpdates = 0;

        if (this._zSort) {
            this.sortZIndexedChildren();
        }

        if (this._outOfBounds < 2 && this._renderContext.alpha) {
            let renderState = this.renderState;

            let mustRenderChildren = true;
            let renderTextureInfo;
            let prevRenderTextureInfo;
            if (this._useRenderToTexture) {
                if (this._w === 0 || this._h === 0) {
                    // Ignore this branch and don't draw anything.
                    return;
                } else if (!this._texturizer.hasRenderTexture() || (hasRenderUpdates >= 3)) {
                    // Switch to default shader for building up the render texture.
                    renderState.setShader(renderState.defaultShader, this);

                    prevRenderTextureInfo = renderState.renderTextureInfo;

                    renderTextureInfo = {
                        nativeTexture: null,
                        offset: 0,  // Set by CoreRenderState.
                        w: this._w,
                        h: this._h,
                        empty: true,
                        cleared: false,
                        ignore: false,
                        cache: false
                    };

                    if (this._texturizer.hasResultTexture() || (!renderState.isCachingTexturizer && (hasRenderUpdates < 3))) {
                        /**
                         * We don't always cache render textures.
                         *
                         * The rule is, that caching for a specific render texture is only enabled if:
                         * - There is a result texture to be updated.
                         * - There were no render updates -within the contents- since last frame (ElementCore.hasRenderUpdates < 3)
                         * - AND there are no ancestors that are being cached during this frame (CoreRenderState.isCachingTexturizer)
                         *   If an ancestor is cached anyway, it's probably not necessary to keep deeper caches. If the top level is to
                         *   change while a lower one is not, that lower level will be cached instead.
                         *
                         * In case of the fast blur element, this prevents having to cache all blur levels and stages, saving a huge amount
                         * of GPU memory!
                         *
                         * Especially when using multiple stacked layers of the same dimensions that are RTT this will have a very
                         * noticable effect on performance as less render textures need to be allocated.
                         */
                        renderTextureInfo.cache = true;
                        renderState.isCachingTexturizer = true;
                    }

                    if (!this._texturizer.hasResultTexture()) {
                        // We can already release the current texture to the pool, as it will be rebuild anyway.
                        // In case of multiple layers of 'filtering', this may save us from having to create one
                        //  render-to-texture layer.
                        // Notice that we don't do this when there is a result texture, as any other element may rely on
                        //  that result texture being filled.
                        this._texturizer.releaseRenderTexture();
                    }

                    renderState.setRenderTextureInfo(renderTextureInfo);
                    renderState.setScissor(null);

                    if (this._displayedTextureSource) {
                        let r = this._renderContext;

                        // Use an identity context for drawing the displayed texture to the render texture.
                        this._renderContext = ElementCoreContext.IDENTITY;

                        // Add displayed texture source in local coordinates.
                        this.renderState.addQuad(this);

                        this._renderContext = r;
                    }
                } else {
                    mustRenderChildren = false;
                }
            } else {
                if ((this._outOfBounds === 0) && this._displayedTextureSource) {
                    renderState.setShader(this.activeShader, this._shaderOwner);
                    renderState.setScissor(this._scissor);
                    this.renderState.addQuad(this);
                }
            }

            // Also add children to the VBO.
            if (mustRenderChildren && this._children) {
                if (this._zContextUsage) {
                    for (let i = 0, n = this._zIndexedChildren.length; i < n; i++) {
                        this._zIndexedChildren[i].render();
                    }
                } else {
                    for (let i = 0, n = this._children.length; i < n; i++) {
                        if (this._children[i]._zIndex === 0) {
                            // If zIndex is set, this item already belongs to a zIndexedChildren array in one of the ancestors.
                            this._children[i].render();
                        }
                    }
                }
            }

            if (this._useRenderToTexture) {
                let updateResultTexture = false;
                if (mustRenderChildren) {
                    // Finished refreshing renderTexture.
                    renderState.finishedRenderTexture();

                    // If nothing was rendered, we store a flag in the texturizer and prevent unnecessary
                    //  render-to-texture and filtering.
                    this._texturizer.empty = renderTextureInfo.empty;

                    if (renderTextureInfo.empty) {
                        // We ignore empty render textures and do not draw the final quad.

                        // The following cleans up memory and enforces that the result texture is also cleared.
                        this._texturizer.releaseRenderTexture();
                    } else if (renderTextureInfo.nativeTexture) {
                        // If nativeTexture is set, we can reuse that directly instead of creating a new render texture.
                        this._texturizer.reuseTextureAsRenderTexture(renderTextureInfo.nativeTexture);

                        renderTextureInfo.ignore = true;
                    } else {
                        if (this._texturizer.renderTextureReused) {
                            // Quad operations must be written to a render texture actually owned.
                            this._texturizer.releaseRenderTexture();
                        }
                        // Just create the render texture.
                        renderTextureInfo.nativeTexture = this._texturizer.getRenderTexture();
                    }

                    // Restore the parent's render texture.
                    renderState.setRenderTextureInfo(prevRenderTextureInfo);

                    updateResultTexture = true;
                }

                if (!this._texturizer.empty) {
                    let resultTexture = this._texturizer.getResultTexture();
                    if (updateResultTexture) {
                        if (resultTexture) {
                            // Logging the update frame can be handy for userland.
                            resultTexture.update = renderState.stage.frameCounter;
                        }
                        this._texturizer.updateResultTexture();
                    }

                    if (!this._texturizer.renderOffscreen) {
                        // Render result texture to the actual render target.
                        renderState.setShader(this.activeShader, this._shaderOwner);
                        renderState.setScissor(this._scissor);

                        // If no render texture info is set, the cache can be reused.
                        const cache = !renderTextureInfo || renderTextureInfo.cache;

                        renderState.setTexturizer(this._texturizer, cache);
                        this._stashTexCoords();
                        if (!this._texturizer.colorize) this._stashColors();
                        this.renderState.addQuad(this, true);
                        if (!this._texturizer.colorize) this._unstashColors();
                        this._unstashTexCoords();
                        renderState.setTexturizer(null);
                    }
                }
            }

            if (renderTextureInfo && renderTextureInfo.cache) {
                // Allow siblings to cache.
                renderState.isCachingTexturizer = false;
            }
        }
    }

    get zSort() {
        return this._zSort;
    }

    sortZIndexedChildren() {
        /**
         * We want to avoid resorting everything. Instead, we do a single pass of the full array:
         * - filtering out elements with a different zParent than this (were removed)
         * - filtering out, but also gathering (in a temporary array) the elements that have zIndexResort flag
         * - then, finally, we merge-sort both the new array and the 'old' one
         * - element may have been added 'double', so when merge-sorting also check for doubles.
         * - if the old one is larger (in size) than it should be, splice off the end of the array.
         */

        const n = this._zIndexedChildren.length;
        let ptr = 0;
        const a = this._zIndexedChildren;

        // Notice that items may occur multiple times due to z-index changing.
        const b = [];
        for (let i = 0; i < n; i++) {
            if (a[i]._zParent === this) {
                if (a[i]._zIndexResort) {
                    b.push(a[i]);
                } else {
                    if (ptr !== i) {
                        a[ptr] = a[i];
                    }
                    ptr++;
                }
            }
        }

        const m = b.length;
        if (m) {
            for (let j = 0; j < m; j++) {
                b[j]._zIndexResort = false;
            }

            b.sort(ElementCore.sortZIndexedChildren);
            const n = ptr;
            if (!n) {
                ptr = 0;
                let j = 0;
                do {
                    a[ptr++] = b[j++];
                } while(j < m);

                if (a.length > ptr) {
                    // Slice old (unnecessary) part off array.
                    a.splice(ptr);
                }
            } else {
                // Merge-sort arrays;
                ptr = 0;
                let i = 0;
                let j = 0;
                const mergeResult = [];
                do {
                    const v = (a[i]._zIndex === b[j]._zIndex ? a[i]._updateTreeOrder - b[j]._updateTreeOrder : a[i]._zIndex - b[j]._zIndex);

                    const add = v > 0 ? b[j++] : a[i++];

                    if (ptr === 0 || (mergeResult[ptr - 1] !== add)) {
                        mergeResult[ptr++] = add;
                    }

                    if (i >= n) {
                        do {
                            const add = b[j++];
                            if (ptr === 0 || (mergeResult[ptr - 1] !== add)) {
                                mergeResult[ptr++] = add;
                            }
                        } while(j < m);
                        break;
                    } else if (j >= m) {
                        do {
                            const add = a[i++];
                            if (ptr === 0 || (mergeResult[ptr - 1] !== add)) {
                                mergeResult[ptr++] = add;
                            }
                        } while(i < n);
                        break;
                    }
                } while(true);

                this._zIndexedChildren = mergeResult;
            }
        } else {
            if (a.length > ptr) {
                // Slice old (unnecessary) part off array.
                a.splice(ptr);
            }
        }

        this._zSort = false;
    };

    get localTa() {
        return this._localTa;
    };

    get localTb() {
        return this._localTb;
    };

    get localTc() {
        return this._localTc;
    };

    get localTd() {
        return this._localTd;
    };

    get element() {
        return this._element;
    }

    get renderUpdates() {
        return this._hasRenderUpdates;
    }

    get texturizer() {
        if (!this._texturizer) {
            this._texturizer = new ElementTexturizer(this);
        }
        return this._texturizer;
    }

    getCornerPoints() {
        let w = this._worldContext;

        return [
            w.px,
            w.py,
            w.px + this._w * w.ta,
            w.py + this._w * w.tc,
            w.px + this._w * w.ta + this._h * w.tb,
            w.py + this._w * w.tc + this._h * w.td,
            w.px + this._h * w.tb,
            w.py + this._h * w.td
        ]
    };

    getRenderTextureCoords(relX, relY) {
        let r = this._renderContext;
        return [
            r.px + r.ta * relX + r.tb * relY,
            r.py + r.tc * relX + r.td * relY
        ]
    }

    getAbsoluteCoords(relX, relY) {
        let w = this._renderContext;
        return [
            w.px + w.ta * relX + w.tb * relY,
            w.py + w.tc * relX + w.td * relY
        ]
    }


    get layout() {
        this._ensureLayout();
        return this._layout;
    }

    get flex() {
        return this._layout ? this._layout.flex : null;
    }

    set flex(v) {
        this.layout.flex = v;
    }

    get flexItem() {
        return this._layout ? this._layout.flexItem : null;
    }

    set flexItem(v) {
        this.layout.flexItem = v;
    }

    isFlexItem() {
        return !!this._layout && this._layout.isFlexItemEnabled();
    }

    isFlexContainer() {
        return !!this._layout && this._layout.isFlexEnabled();
    }

    enableFlexLayout() {
        this._ensureLayout();
    }

    _ensureLayout() {
        if (!this._layout) {
            this._layout = new FlexTarget(this);
        }
    }

    disableFlexLayout() {
        this._triggerRecalcTranslate();
    }

    hasFlexLayout() {
        return (this._layout && this._layout.isEnabled());
    }

    setLayout(x, y, w, h) {
        this.x = x;
        this.y = y;
        this._updateDimensions(w, h);
    }

    triggerLayout() {
        this._setRecalc(256);
    }

    _triggerRecalcTranslate() {
        this._setRecalc(2);
    }

}

class ElementCoreContext {

    constructor() {
        this.alpha = 1;

        this.px = 0;
        this.py = 0;

        this.ta = 1;
        this.tb = 0;
        this.tc = 0;
        this.td = 1;
    }

    isIdentity() {
        return this.alpha === 1 &&
            this.px === 0 &&
            this.py === 0 &&
            this.ta === 1 &&
            this.tb === 0 &&
            this.tc === 0 &&
            this.td === 1;
    }

    isSquare() {
        return this.tb === 0 && this.tc === 0;
    }

}

ElementCoreContext.IDENTITY = new ElementCoreContext();
ElementCore.sortZIndexedChildren = function(a, b) {
    return (a._zIndex === b._zIndex ? a._updateTreeOrder - b._updateTreeOrder : a._zIndex - b._zIndex);
}

import ElementTexturizer from "./ElementTexturizer.mjs";
import Utils from "../Utils.mjs";