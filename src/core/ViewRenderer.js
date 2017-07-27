/**
 * Graphical calculations / VBO buffer filling.
 */
class ViewRenderer {

    constructor(view) {
        this._view = view;

        this.ctx = view.stage.ctx;

        this._parent = null;

        this._hasUpdates = false;

        this._layoutEntry = null;

        this._layoutExit = null;

        this._hasLayoutHooks = 0;

        this._recalc = 128;

        this._worldAlpha = 1;

        this._updateTreeOrder = 0;

        // All local translation/transform updates: directly propagated from x/y/w/h/scale/whatever.
        this._worldPx = this._localPx = 0;
        this._worldPy = this._localPy = 0;

        this._worldTa = this._localTa = 1;
        this._worldTb = this._localTb = 0;
        this._worldTc = this._localTc = 0;
        this._worldTd = this._localTd = 1;

        this._isComplex = false;

        this._localAlpha = 1;

        this._rw = 0;
        this._rh = 0;

        this._clipping = false;
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

        this._colorUl = this._colorUr = this._colorBl = this._colorBr = 0xFFFFFFFF;

        this._txCoordsUl = 0x00000000;
        this._txCoordsUr = 0x0000FFFF;
        this._txCoordsBr = 0xFFFFFFFF;
        this._txCoordsBl = 0xFFFF0000;

        this._ulx = 0;
        this._uly = 0;
        this._brx = 1;
        this._bry = 1;

        this._zIndex = 0;
        this._forceZIndexContext = false;
        this._zContextUsage = 0;
        this._zParent = null;
        this._zSort = false;

        this._isRoot = false;

        this._children = null;

        this._zIndexedChildren = null;

    }

    /**
     * @param {Number} type
     *   1: alpha
     *   2: translate
     *   4: transform
     *   8: clipping
     * 128: force layout when becoming visible
     * @private
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

    _setHasLayoutHooks() {
        if (this._hasLayoutHooks !== 1) {
            let p = this;
            do {
                p._hasLayoutHooks = 1;
            } while ((p = p._parent) && p._hasLayoutHooks !== 1);
        }
    }

    _setHasLayoutHooksCheck() {
        if (this._hasLayoutHooks !== -1) {
            let p = this;
            do {
                p._hasLayoutHooks = -1;
            } while ((p = p._parent) && p._hasLayoutHooks === 0);
        }
    }

    setParent(parent) {
        if (parent !== this._parent) {
            let prevIsZContext = this.isZContext();
            let prevParent = this._parent;
            this._parent = parent;

            if (prevParent && prevParent._hasLayoutHooks === 1) {
                prevParent._setHasLayoutHooksCheck(); // Unknown.
            }

            if (parent) {
                if (this._hasLayoutHooks === 1) {
                    parent._setHasLayoutHooks();
                } else if (this._hasLayoutHooks === -1) {
                    parent._setHasLayoutHooksCheck();
                }
            }

            this._setRecalc(1 + 2 + 4);

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

            let newClippingParent = parent ? (parent._clipping ? parent : parent._clippingParent) : null;

            if (newClippingParent !== this._clippingParent) {
                this.setClippingParent(newClippingParent);
            }
        }
    };

    addChildAt(index, child) {
        if (!this._children) this._children = [];
        this._children.splice(index, 0, child);
        child.setParent(this);
    };

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

    setLocalTransform(a, b, c, d) {
        this._setRecalc(4);
        this._localTa = a;
        this._localTb = b;
        this._localTc = c;
        this._localTd = d;
        this._isComplex = (b != 0) || (c != 0);
    };

    setLocalTranslate(x, y) {
        this._setRecalc(2);
        this._localPx = x;
        this._localPy = y;
    };

    addLocalTranslate(dx, dy) {
        this.setLocalTranslate(this._localPx + dx, this._localPy + dy);
    }

    setLocalAlpha(a) {
        this._setRecalcForced(1, (this._parent && this._parent._worldAlpha) && a);

        if (a < 1e-14) {
            // Tiny rounding errors may cause failing visibility tests.
            a = 0;
        }

        this._localAlpha = a;
    };

    setDimensions(w, h) {
        this._rw = w;
        this._rh = h;
        this._setRecalc(2);
    };

    setTextureCoords(ulx, uly, brx, bry) {
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

    setDisplayedTextureSource(textureSource) {
        if (this._worldAlpha) this.ctx.staticStage = false;
        this._displayedTextureSource = textureSource;
    };

    setInTextureAtlas(inTextureAtlas) {
        if (this._worldAlpha) this.ctx.staticStage = false;

        this.inTextureAtlas = inTextureAtlas;
    };

    setAsRoot() {
        // Use parent dummy.
        this._parent = new ViewRenderer(this._view);

        // Root is, and will always be, the primary zContext.
        this._isRoot = true;

        this.ctx.root = this;
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
        return (this._forceZIndexContext || this._zIndex !== 0 || this._isRoot || !this._parent);
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

                if (this._zParent._zContextUsage > 0) {
                    let index = this._zParent._zIndexedChildren.indexOf(this);
                    this._zParent._zIndexedChildren.splice(index, 1);
                }
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
                        newZParent._zIndexedChildren.push(this);
                    }
                    newZParent._zSort = true;
                }
            }

            this._zParent = newZParent;
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
            if (this._worldAlpha) this.ctx.staticStage = false;

            let newZParent = this._zParent;

            let prevIsZContext = this.isZContext();
            if (zIndex === 0 && this._zIndex !== 0) {
                if (this._parent === this._zParent) {
                    this._zParent.decZContextUsage();
                } else {
                    newZParent = this._parent;
                }
            } else if (zIndex !== 0 && this._zIndex === 0) {
                newZParent = this._parent ? this._parent.findZContext() : null;
                if (newZParent === this._zParent) {
                    if (this._zParent) {
                        this._zParent.incZContextUsage();
                        this._zParent._zSort = true;
                    }
                }
            } else if (zIndex !== this._zIndex) {
                this._zParent._zSort = true;
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
        }
    };

    get forceZIndexContext() {
        return this._forceZIndexContext;
    }

    set forceZIndexContext(v) {
        if (this._worldAlpha) this.ctx.staticStage = false;

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
        if (prevZContext._zContextUsage > 0) {
            let self = this;
            // Transfer from upper z context to this z context.
            prevZContext._zIndexedChildren.slice().forEach(function (c) {
                if (self.isAncestorOf(c) && c._zIndex !== 0) {
                    c.setZParent(self);
                }
            });
        }
    };

    disableZContext() {
        // Transfer from this z context to upper z context.
        if (this._zContextUsage > 0) {
            let newZParent = this._parent.findZContext();

            this._zIndexedChildren.slice().forEach(function (c) {
                if (c._zIndex !== 0) {
                    c.setZParent(newZParent);
                }
            });
        }
    };

    get clipping() {
        return this._clipping;
    };

    set clipping(clipping) {
        if (clipping !== this._clipping) {
            this._setRecalc(8);
            this._clipping = clipping;
            this.setChildrenClippingParent(clipping ? this : this._clippingParent);
        }
    };

    setChildrenClippingParent(clippingParent) {
        if (this._children) {
            for (let i = 0, n = this._children.length; i < n; i++) {
                this._children[i].setClippingParent(clippingParent);
            }
        }
    };

    setClippingParent(clippingParent) {
        if (this._clippingParent !== clippingParent) {
            this._setRecalc(8);

            this._clippingParent = clippingParent;
            if (!this._clipping) {
                if (this._children) {
                    for (let i = 0, n = this._children.length; i < n; i++) {
                        this._children[i].setClippingParent(clippingParent);
                    }
                }
            }

        }
    };

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
        return this._colorBl;
    }

    set colorBl(color) {
        if (this._colorBl !== color) {
            if (this._worldAlpha) this.ctx.staticStage = false;
            this._colorBl = color;
        }
    };

    get colorBr() {
        return this._colorBr;
    }

    set colorBr(color) {
        if (this._colorBr !== color) {
            if (this._worldAlpha) this.ctx.staticStage = false;
            this._colorBr = color;
        }
    };

    isVisible() {
        return (this._localAlpha > 1e-14);
    };

    layout() {
        if (this._hasLayoutHooks !== 0) {
            // Carry positioning changes downwards to ensure re-layout.
            let origRecalc = this._recalc;

            if (this.isVisible()) {
                this._recalc |= (this._parent._recalc & 6);
                let layoutChanged = (this._recalc & 6);

                if (this._layoutEntry) {
                    this._layoutEntry(this._view, origRecalc);
                }
                if (this._children) {
                    if (this._hasLayoutHooks === -1) {
                        let hasLayoutHooks = false;
                        for (let i = 0, n = this._children.length; i < n; i++) {
                            this._children[i].layout();
                            hasLayoutHooks = hasLayoutHooks || (this._children[i]._hasLayoutHooks === 1);
                        }
                        this._hasLayoutHooks = hasLayoutHooks ? 1 : 0;
                    } else {
                        for (let i = 0, n = this._children.length; i < n; i++) {
                            if (this._children[i]._hasUpdates || layoutChanged) {
                                this._children[i].layout();
                            }
                        }
                    }
                }
                if (this._layoutExit) {
                    this._layoutExit(this._view, origRecalc);
                }

                if ((this._recalc & 128)) {
                    // Clear 'force layout' flag.
                    this._recalc -= 128;
                }
            }

        }
    }

    update() {
        this._recalc |= this._parent._recalc;

        if (this._zSort) {
            // Make sure that all descendants are updated so that the updateTreeOrder flags are correctly set.
            this.ctx.updateTreeOrderForceUpdate++;
        }

        let forceUpdate = (this.ctx.updateTreeOrderForceUpdate > 0);
        if (this._recalc & 1) {
            // In case of becoming invisible, we must update the children because they may be z-indexed.
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
                    this.addToVbo();
                }
            } else {
                this._updateTreeOrder = this.ctx.updateTreeOrder++;
            }

            this._recalc = (this._recalc & 7);
            /* 1+2+4 */

            if (this._children) {
                for (let i = 0, n = this._children.length; i < n; i++) {
                    if ((this.ctx.updateTreeOrderForceUpdate > 0) || this._recalc || this._children[i]._hasUpdates) {
                        this._children[i].update();
                    } else if (!this.ctx.useZIndexing) {
                        this._children[i].fillVbo();
                    }
                }
            }

            if (this._worldAlpha === 0) {
                // Layout must be run when this view becomes visible.
                this._recalc = 128;
            } else {
                this._recalc = 0;
            }

            this._hasUpdates = false;

        }

        if (this._zSort) {
            this.ctx.updateTreeOrderForceUpdate--;
        }

    };

    sortZIndexedChildren() {
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

    addToVbo() {
        let vboIndex = this.ctx.vboIndex;
        let vboBufferFloat = this.ctx.vboBufferFloat;
        let vboBufferUint = this.ctx.vboBufferUint;

        if (this._clippingParent && !this._clippingNoEffect) {
            if (!this._clippingEmpty) {
                this.addToVboClipped();
            }
        } else {
            if (this._worldTb !== 0 || this._worldTc !== 0) {
                if (vboIndex < 262144) {
                    vboBufferFloat[vboIndex++] = this._worldPx;
                    vboBufferFloat[vboIndex++] = this._worldPy;
                    vboBufferUint[vboIndex++] = this._txCoordsUl; // Texture.
                    vboBufferUint[vboIndex++] = getColorInt(this._colorUl, this._worldAlpha);
                    vboBufferFloat[vboIndex++] = this._worldPx + this._rw * this._worldTa;
                    vboBufferFloat[vboIndex++] = this._worldPy + this._rw * this._worldTc;
                    vboBufferUint[vboIndex++] = this._txCoordsUr;
                    vboBufferUint[vboIndex++] = getColorInt(this._colorUr, this._worldAlpha);
                    vboBufferFloat[vboIndex++] = this._worldPx + this._rw * this._worldTa + this._rh * this._worldTb;
                    vboBufferFloat[vboIndex++] = this._worldPy + this._rw * this._worldTc + this._rh * this._worldTd;
                    vboBufferUint[vboIndex++] = this._txCoordsBr;
                    vboBufferUint[vboIndex++] = getColorInt(this._colorBr, this._worldAlpha);
                    vboBufferFloat[vboIndex++] = this._worldPx + this._rh * this._worldTb;
                    vboBufferFloat[vboIndex++] = this._worldPy + this._rh * this._worldTd;
                    vboBufferUint[vboIndex++] = this._txCoordsBl;
                    vboBufferUint[vboIndex] = getColorInt(this._colorBl, this._worldAlpha);
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
                    vboBufferUint[vboIndex++] = getColorInt(this._colorUl, this._worldAlpha);
                    vboBufferFloat[vboIndex++] = cx;
                    vboBufferFloat[vboIndex++] = this._worldPy;
                    vboBufferUint[vboIndex++] = this._txCoordsUr;
                    vboBufferUint[vboIndex++] = getColorInt(this._colorUr, this._worldAlpha);
                    vboBufferFloat[vboIndex++] = cx;
                    vboBufferFloat[vboIndex++] = cy;
                    vboBufferUint[vboIndex++] = this._txCoordsBr;
                    vboBufferUint[vboIndex++] = getColorInt(this._colorBr, this._worldAlpha);
                    vboBufferFloat[vboIndex++] = this._worldPx;
                    vboBufferFloat[vboIndex++] = cy;
                    vboBufferUint[vboIndex++] = this._txCoordsBl;
                    vboBufferUint[vboIndex] = getColorInt(this._colorBl, this._worldAlpha);
                    this.ctx.addVboTextureSource(this._displayedTextureSource, 1);
                }
            }
        }
    };

    addToVboClipped() {
        let vboIndex = this.ctx.vboIndex;
        let vboBufferFloat = this.ctx.vboBufferFloat;
        let vboBufferUint = this.ctx.vboBufferUint;

        // Gradients are not supported for clipped quads.
        let c = getColorInt(this._colorUl, this._worldAlpha);

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
                        vboBufferUint[vboIndex++] = c;
                        this.ctx.addVboTextureSource(this._displayedTextureSource, 1);
                    }
                }
            }
        }
    };

    fillVbo() {
        if (this._zSort) {
            this.sortZIndexedChildren();
            this._zSort = false;
        }

        if (this._worldAlpha) {
            if (this._displayedTextureSource) {
                this.addToVbo();
            }

            if (this._children) {
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

    get rw() {
        return this._rw;
    }

    get rh() {
        return this._rh;
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
    };

    set layoutEntry(f) {
        this._layoutEntry = f;

        if (f) {
            this._setHasLayoutHooks();
        } else if (this._hasLayoutHooks === 1 && !this._layoutExit) {
            this._setHasLayoutHooksCheck();
        }
    }

    set layoutExit(f) {
        this._layoutExit = f;

        if (f) {
            this._setHasLayoutHooks();
        } else if (this._hasLayoutHooks === 1 && !this._layoutEntry) {
            this._setHasLayoutHooksCheck();
        }
    }

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

let GeometryUtils = require('./GeometryUtils');

module.exports = ViewRenderer;