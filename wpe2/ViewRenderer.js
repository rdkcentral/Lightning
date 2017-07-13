/**
 * Graphical calculations / VBO buffer filling.
 */
class ViewRenderer extends Base {
    constructor(view) {
        super();

        this.view = view;

        this.ctx = view.stage.ctx;
    }

    _properties() {
        this.parent = null;

        this.hasUpdates = false;

        this.recalc = 0;

        this.worldAlpha = 1;

        this.updateTreeOrder = 0;

        this.hasChildren = false;

        // All local translation/transform updates: directly propagated from x/y/w/h/scale/whatever.
        this.worldPx = this.localPx = 0;
        this.worldPy = this.localPy = 0;

        this.worldTa = this.localTa = 1;
        this.worldTb = this.localTb = 0;
        this.worldTc = this.localTc = 0;
        this.worldTd = this.localTd = 1;

        this.isComplex = false;

        this.localAlpha = 1;

        this.rw = 0;
        this.rh = 0;

        this._clipping = false;
        this.clippingParent = null;

        /**
         * In case of clipping, this flag indicates if we're dealing with a square-shaped clipping area.
         * @type {boolean}
         */
        this.clippingSquare = false;

        this.clippingSquareMinX = 0;
        this.clippingSquareMaxX = 0;
        this.clippingSquareMinY = 0;
        this.clippingSquareMaxY = 0;

        /**
         * Flag that indicates that clipping area is empty.
         * @type {boolean}
         */
        this.clippingEmpty = false;

        /**
         * Flag that indicates that the clipping area are the corner points.
         * @type {boolean}
         */
        this.clippingNoEffect = false;

        /**
         * In case of complex clipping, the corner points of the clipping area.
         * @type {number[]}
         */
        this.clippingArea = null;

        /**
         * The texture source to be displayed.
         * @type {TextureSource}
         */
        this.displayedTextureSource = null;

        this._colorUl = this._colorUr = this._colorBl = this._colorBr = 0xFFFFFFFF;

        this.txCoordsUl = 0x00000000;
        this.txCoordsUr = 0x0000FFFF;
        this.txCoordsBr = 0xFFFFFFFF;
        this.txCoordsBl = 0xFFFF0000;

        this.ulx = 0;
        this.uly = 0;
        this.brx = 1;
        this.bry = 1;

        this._zIndex = 0;
        this._forceZIndexContext = false;
        this.zContextUsage = 0;
        this.zParent = null;
        this.zSort = false;

        this.isRoot = false;

        this._children = null;

        this.zIndexedChildren = null;
    }

    /**
     * @param {Number} type
     *   1: alpha
     *   2: translate
     *   4: transform
     *   8: clipping
     * @private
     */
    setRecalc(type) {
        this.recalc |= type;

        if (this.worldAlpha) {
            this.ctx.staticStage = false;
            let p = this;
            do {
                p.hasUpdates = true;
            } while ((p = p.parent) && !p.hasUpdates);
        } else {
            this.hasUpdates = true;
        }
    };

    /**
     * @private
     */
    setRecalcForced(type, force) {
        this.recalc |= type;

        if (this.worldAlpha || force) {
            this.ctx.staticStage = false;
            let p = this;
            do {
                p.hasUpdates = true;
            } while ((p = p.parent) && !p.hasUpdates);
        } else {
            this.hasUpdates = true;
        }
    };

    setParent(parent) {
        if (parent !== this.parent) {
            let prevIsZContext = this.isZContext();
            let prevParent = this.parent;
            this.parent = parent;

            this.setRecalc(1 + 2 + 4);

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

            let newClippingParent = parent ? (parent._clipping ? parent : parent.clippingParent) : null;

            if (newClippingParent !== this.clippingParent) {
                this.setClippingParent(newClippingParent);
            }
        }
    };

    addChildAt(index, child) {
        if (!this._children) this._children = [];

        if (index >= 0 && index <= this._children.length) {
            if (child.parent) {
                child.parent.removeChild(child);
            }

            child.setParent(this);
            this._children.splice(index, 0, child);
        }

        this.hasChildren = true;
    };

    removeChildAt(index) {
        let child = this._children[index];
        child.setParent(null);
        this._children.splice(index, 1);
        this.hasChildren = (this._children.length > 0);
    };

    removeChildren() {
        for (let i = 0, n = this._children.length; i < n; i++) {
            this._children[i].setParent(null);
        }

        this._children.splice(0);
        this.zIndexedChildren.splice(0);

        this.hasChildren = false;
    };

    setLocalTransform(a, b, c, d) {
        this.setRecalc(4);
        this.localTa = a;
        this.localTb = b;
        this.localTc = c;
        this.localTd = d;
        this.isComplex = (b != 0) || (c != 0);
    };

    setLocalTranslate(x, y) {
        this.setRecalc(2);
        this.localPx = x;
        this.localPy = y;
    };

    addLocalTranslate(dx, dy) {
        this.setLocalTranslate(this.localPx + dx, this.localPy + dy);
    }

    setLocalAlpha(a) {
        this.setRecalcForced(1, (this.parent && this.parent.worldAlpha) && a);

        if (a < 1e-14) {
            // Tiny rounding errors may cause failing visibility tests.
            a = 0;
        }

        this.localAlpha = a;
    };

    setDimensions(w, h) {
        this.rw = w;
        this.rh = h;
        this.setRecalc(2);
    };

    setTextureCoords(ulx, uly, brx, bry) {
        if (this.worldAlpha) this.ctx.staticStage = false;

        this.ulx = ulx;
        this.uly = uly;
        this.brx = brx;
        this.bry = bry;

        this.txCoordsUl = ((ulx * 65535 + 0.5) | 0) + ((uly * 65535 + 0.5) | 0) * 65536;
        this.txCoordsUr = ((brx * 65535 + 0.5) | 0) + ((uly * 65535 + 0.5) | 0) * 65536;
        this.txCoordsBl = ((ulx * 65535 + 0.5) | 0) + ((bry * 65535 + 0.5) | 0) * 65536;
        this.txCoordsBr = ((brx * 65535 + 0.5) | 0) + ((bry * 65535 + 0.5) | 0) * 65536;
    };

    setDisplayedTextureSource(textureSource) {
        if (this.worldAlpha) this.ctx.staticStage = false;
        this.displayedTextureSource = textureSource;
    };

    setInTextureAtlas(inTextureAtlas) {
        if (this.worldAlpha) this.ctx.staticStage = false;

        this.inTextureAtlas = inTextureAtlas;
    };

    setAsRoot() {
        // Use parent dummy.
        this.parent = new ViewRenderer(this.view);

        // Root is, and will always be, the primary zContext.
        this.isRoot = true;

        this.ctx.root = this;
    };

    isAncestorOf(c) {
        let p = c;
        while (p = p.parent) {
            if (this === p) {
                return true;
            }
        }
        return false;
    };

    isZContext() {
        return (this._forceZIndexContext || this._zIndex !== 0 || this.isRoot || !this.parent);
    };

    findZContext() {
        if (this.isZContext()) {
            return this;
        } else {
            return this.parent.findZContext();
        }
    };

    setZParent(newZParent) {
        if (this.zParent !== newZParent) {
            if (this.zParent !== null) {
                // @pre: old parent's children array has already been modified.
                if (this._zIndex !== 0) {
                    this.zParent.decZContextUsage();
                }

                if (this.zParent.zContextUsage > 0) {
                    let index = this.zParent.zIndexedChildren.indexOf(this);
                    this.zParent.zIndexedChildren.splice(index, 1);
                }
            }

            if (newZParent !== null) {
                let hadZContextUsage = (newZParent.zContextUsage > 0);

                // @pre: new parent's children array has already been modified.
                if (this._zIndex !== 0) {
                    newZParent.incZContextUsage();
                }

                if (newZParent.zContextUsage > 0) {
                    if (!hadZContextUsage && (this.parent === newZParent)) {
                        // This child was already in the children list.
                        // Do not add double.
                    } else {
                        newZParent.zIndexedChildren.push(this);
                    }
                    newZParent.zSort = true;
                }
            }

            this.zParent = newZParent;
        }
    };

    incZContextUsage() {
        this.zContextUsage++;
        if (this.zContextUsage === 1) {
            if (!this.zIndexedChildren) {
                this.zIndexedChildren = [];
            }
            if (this._children) {
                // Copy.
                for (let i = 0, n = this._children.length; i < n; i++) {
                    this.zIndexedChildren.push(this._children[i]);
                }
            }
        }
    };

    decZContextUsage() {
        this.zContextUsage--;
        if (this.zContextUsage === 0) {
            this.zSort = false;
            this.zIndexedChildren.splice(0);
        }
    };

    get zIndex() {
        return this._zIndex;
    }

    set zIndex(zIndex) {
        if (this._zIndex !== zIndex) {
            if (this.worldAlpha) this.ctx.staticStage = false;

            let newZParent = this.zParent;

            let prevIsZContext = this.isZContext();
            if (zIndex === 0 && this._zIndex !== 0) {
                if (this.parent === this.zParent) {
                    this.zParent.decZContextUsage();
                } else {
                    newZParent = this.parent;
                }
            } else if (zIndex !== 0 && this._zIndex === 0) {
                newZParent = this.parent ? this.parent.findZContext() : null;
                if (newZParent === this.zParent) {
                    if (this.zParent) {
                        this.zParent.incZContextUsage();
                        this.zParent.zSort = true;
                    }
                }
            } else if (zIndex !== this._zIndex) {
                this.zParent.zSort = true;
            }

            if (newZParent !== this.zParent) {
                this.setZParent(null);
            }

            this._zIndex = zIndex;

            if (newZParent !== this.zParent) {
                this.setZParent(newZParent);
            }

            if (prevIsZContext !== this.isZContext()) {
                if (!this.isZContext()) {
                    this.disableZContext();
                } else {
                    this.enableZContext(this.parent.findZContext());
                }
            }
        }
    };

    get forceZIndexContext() {
        return this._forceZIndexContext;
    }

    set forceZIndexContext(v) {
        if (this.worldAlpha) this.ctx.staticStage = false;

        let prevIsZContext = this.isZContext();
        this._forceZIndexContext = v;

        if (prevIsZContext !== this.isZContext()) {
            if (!this.isZContext()) {
                this.disableZContext();
            } else {
                this.enableZContext(this.parent.findZContext());
            }
        }
    };

    enableZContext(prevZContext) {
        if (prevZContext.zContextUsage > 0) {
            let self = this;
            // Transfer from upper z context to this z context.
            prevZContext.zIndexedChildren.slice().forEach(function (c) {
                if (self.isAncestorOf(c) && c._zIndex !== 0) {
                    c.setZParent(self);
                }
            });
        }
    };

    disableZContext() {
        // Transfer from this z context to upper z context.
        if (this.zContextUsage > 0) {
            let newZParent = this.parent.findZContext();

            this.zIndexedChildren.slice().forEach(function (c) {
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
            this.setRecalc(8);
            this._clipping = clipping;
            this.setChildrenClippingParent(clipping ? this : this.clippingParent);
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
        if (this.clippingParent !== clippingParent) {
            this.setRecalc(8);

            this.clippingParent = clippingParent;
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
            if (this.worldAlpha) this.ctx.staticStage = false;
            this._colorUl = color;
        }
    }

    get colorUr() {
        return this._colorUr;
    }

    set colorUr(color) {
        if (this._colorUr !== color) {
            if (this.worldAlpha) this.ctx.staticStage = false;
            this._colorUr = color;
        }
    };

    get colorBl() {
        return this._colorUr;
    }

    set colorBl(color) {
        if (this._colorBl !== color) {
            if (this.worldAlpha) this.ctx.staticStage = false;
            this._colorBl = color;
        }
    };

    get colorBr() {
        return this._colorUr;
    }

    set colorBr(color) {
        if (this._colorBr !== color) {
            if (this.worldAlpha) this.ctx.staticStage = false;
            this._colorBr = color;
        }
    };

    isVisible() {
        return (this.localAlpha > 1e-14);
    };

    update() {
        this.recalc |= this.parent.recalc;

        if (this.zSort) {
            // Make sure that all descendants are updated so that the updateTreeOrder flags are correctly set.
            this.ctx.updateTreeOrderForceUpdate++;
        }

        let forceUpdate = (this.ctx.updateTreeOrderForceUpdate > 0);
        if (this.recalc & 1) {
            // If case of becoming invisible, we must update the children because they may be z-indexed.
            forceUpdate = this.worldAlpha && !(this.parent.worldAlpha && this.localAlpha);

            this.worldAlpha = this.parent.worldAlpha * this.localAlpha;

            if (this.worldAlpha < 1e-14) {
                // Tiny rounding errors may cause failing visibility tests.
                this.worldAlpha = 0;
            }
        }

        if (this.worldAlpha || forceUpdate) {
            if (this.recalc & 6) {
                this.worldPx = this.parent.worldPx + this.localPx * this.parent.worldTa;
                this.worldPy = this.parent.worldPy + this.localPy * this.parent.worldTd;
            }

            if (this.recalc & 4) {
                this.worldTa = this.localTa * this.parent.worldTa;
                this.worldTb = this.localTd * this.parent.worldTb;
                this.worldTc = this.localTa * this.parent.worldTc;
                this.worldTd = this.localTd * this.parent.worldTd;

                if (this.isComplex) {
                    this.worldTa += this.localTc * this.parent.worldTb;
                    this.worldTb += this.localTb * this.parent.worldTa;
                    this.worldTc += this.localTc * this.parent.worldTd;
                    this.worldTd += this.localTb * this.parent.worldTc;
                }
            }

            if ((this.recalc & 6) && (this.parent.worldTb !== 0 || this.parent.worldTc !== 0)) {
                this.worldPx += this.localPy * this.parent.worldTb;
                this.worldPy += this.localPx * this.parent.worldTc;
            }

            if ((this.recalc & 14 /* 2 + 4 + 8 */) && (this.clippingParent || this._clipping)) {
                // We must calculate the clipping area.
                let c1x, c1y, c2x, c2y, c3x, c3y;

                let cp = this.clippingParent;
                if (cp && cp.clippingEmpty) {
                    this.clippingEmpty = true;
                    this.clippingArea = null;
                    this.clippingNoEffect = false;
                } else {
                    this.clippingNoEffect = false;
                    this.clippingEmpty = false;
                    this.clippingArea = null;
                    if (cp) {
                        if (cp.clippingSquare && (this.worldTb === 0 && this.worldTc === 0 && this.worldTa > 0 && this.worldTd > 0)) {
                            // Special case: 'easy square clipping'.
                            this.clippingSquare = true;

                            c2x = this.worldPx + this.rw * this.worldTa;
                            c2y = this.worldPy + this.rh * this.worldTd;

                            this.clippingSquareMinX = this.worldPx;
                            this.clippingSquareMaxX = c2x;
                            this.clippingSquareMinY = this.worldPy;
                            this.clippingSquareMaxY = c2y;

                            if ((this.clippingSquareMinX >= cp.clippingSquareMinX) && (this.clippingSquareMaxX <= cp.clippingSquareMaxX) && (this.clippingSquareMinY >= cp.clippingSquareMinY) && (this.clippingSquareMaxY <= cp.clippingSquareMaxY)) {
                                // No effect.
                                this.clippingNoEffect = true;

                                if (this._clipping) {
                                    this.clippingSquareMinX = this.worldPx;
                                    this.clippingSquareMaxX = c2x;
                                    this.clippingSquareMinY = this.worldPy;
                                    this.clippingSquareMaxY = c2y;
                                }
                            } else {
                                this.clippingSquareMinX = Math.max(this.clippingSquareMinX, cp.clippingSquareMinX);
                                this.clippingSquareMaxX = Math.min(this.clippingSquareMaxX, cp.clippingSquareMaxX);
                                this.clippingSquareMinY = Math.max(this.clippingSquareMinY, cp.clippingSquareMinY);
                                this.clippingSquareMaxY = Math.min(this.clippingSquareMaxY, cp.clippingSquareMaxY);
                                if (this.clippingSquareMaxX < this.clippingSquareMinX || this.clippingSquareMaxY < this.clippingSquareMinY) {
                                    this.clippingEmpty = true;
                                }
                            }
                        } else {
                            //c0x = this.worldPx;
                            //c0y = this.worldPy;
                            c1x = this.worldPx + this.rw * this.worldTa;
                            c1y = this.worldPy + this.rw * this.worldTc;
                            c2x = this.worldPx + this.rw * this.worldTa + this.rh * this.worldTb;
                            c2y = this.worldPy + this.rw * this.worldTc + this.rh * this.worldTd;
                            c3x = this.worldPx + this.rh * this.worldTb;
                            c3y = this.worldPy + this.rh * this.worldTd;

                            // Complex shape.
                            this.clippingSquare = false;
                            let cornerPoints = [this.worldPx, this.worldPy, c1x, c1y, c2x, c2y, c3x, c3y];

                            if (cp.clippingSquare && !cp.clippingArea) {
                                // We need a clipping area to use for intersection.
                                cp.clippingArea = [cp.clippingSquareMinX, cp.clippingSquareMinY, cp.clippingSquareMaxX, cp.clippingSquareMinY, cp.clippingSquareMaxX, cp.clippingSquareMaxY, cp.clippingSquareMinX, cp.clippingSquareMaxY];
                            }

                            this.clippingArea = GeometryUtils.intersectConvex(cp.clippingArea, cornerPoints);
                            this.clippingEmpty = (this.clippingArea.length === 0);
                            this.clippingNoEffect = (cornerPoints === this.clippingArea);
                        }
                    } else {
                        c1x = this.worldPx + this.rw * this.worldTa;
                        c3y = this.worldPy + this.rh * this.worldTd;

                        // Just use the corner points.
                        if (this.worldTb === 0 && this.worldTc === 0 && this.worldTa > 0 && this.worldTd > 0) {
                            // Square.
                            this.clippingSquare = true;
                            if (this._clipping) {
                                this.clippingSquareMinX = this.worldPx;
                                this.clippingSquareMaxX = c1x;
                                this.clippingSquareMinY = this.worldPy;
                                this.clippingSquareMaxY = c3y;
                            }
                            this.clippingEmpty = false;
                            this.clippingNoEffect = true;
                        } else {
                            c1y = this.worldPy + this.rw * this.worldTc;
                            c2x = this.worldPx + this.rw * this.worldTa + this.rh * this.worldTb;
                            c2y = this.worldPy + this.rw * this.worldTc + this.rh * this.worldTd;
                            c3x = this.worldPx + this.rh * this.worldTb;

                            // Complex shape.
                            this.clippingSquare = false;
                            if (this._clipping) {
                                this.clippingArea = [this.worldPx, this.worldPy, c1x, c1y, c2x, c2y, c3x, c3y];
                            }
                            this.clippingEmpty = false;
                            this.clippingNoEffect = true;
                        }
                    }
                }
            }

            if (!this.ctx.useZIndexing) {
                // Use single pass.
                if (this.displayedTextureSource) {
                    this.addToVbo();
                }
            } else {
                this.updateTreeOrder = this.ctx.updateTreeOrder++;
            }

            this.recalc = (this.recalc & 7);
            /* 1+2+4 */

            if (this.hasChildren) {
                for (let i = 0, n = this._children.length; i < n; i++) {
                    if ((this.ctx.updateTreeOrderForceUpdate > 0) || this.recalc || this.children[i].hasUpdates) {
                        this._children[i].update();
                    } else if (!this.ctx.useZIndexing) {
                        this._children[i].fillVbo();
                    }
                }
            }

            this.recalc = 0;

            this.hasUpdates = false;

        }

        if (this.zSort) {
            this.ctx.updateTreeOrderForceUpdate--;
        }

    };

    sortZIndexedChildren() {
        // Insertion sort works best for almost correctly ordered arrays.
        for (let i = 1, n = this.zIndexedChildren.length; i < n; i++) {
            let a = this.zIndexedChildren[i];
            let j = i - 1;
            while (j >= 0) {
                let b = this.zIndexedChildren[j];
                if (!(a._zIndex === b._zIndex ? (a.updateTreeOrder < b.updateTreeOrder) : (a._zIndex < b._zIndex))) {
                    break;
                }

                this.zIndexedChildren[j + 1] = this.zIndexedChildren[j];
                j--;
            }

            this.zIndexedChildren[j + 1] = a;
        }
    };

    addToVbo() {
        let vboIndex = this.ctx.vboIndex;
        let vboBufferFloat = this.ctx.vboBufferFloat;
        let vboBufferUint = this.ctx.vboBufferUint;

        if (this.clippingParent && !this.clippingNoEffect) {
            if (!this.clippingEmpty) {
                this.addToVboClipped();
            }
        } else {
            if (this.worldTb !== 0 || this.worldTc !== 0) {
                if (vboIndex < 262144) {
                    vboBufferFloat[vboIndex++] = this.worldPx;
                    vboBufferFloat[vboIndex++] = this.worldPy;
                    vboBufferUint[vboIndex++] = this.txCoordsUl; // Texture.
                    vboBufferUint[vboIndex++] = getColorInt(this.colorUl, this.worldAlpha);
                    vboBufferFloat[vboIndex++] = this.worldPx + this.rw * this.worldTa;
                    vboBufferFloat[vboIndex++] = this.worldPy + this.rw * this.worldTc;
                    vboBufferUint[vboIndex++] = this.txCoordsUr;
                    vboBufferUint[vboIndex++] = getColorInt(this.colorUr, this.worldAlpha);
                    vboBufferFloat[vboIndex++] = this.worldPx + this.rw * this.worldTa + this.rh * this.worldTb;
                    vboBufferFloat[vboIndex++] = this.worldPy + this.rw * this.worldTc + this.rh * this.worldTd;
                    vboBufferUint[vboIndex++] = this.txCoordsBr;
                    vboBufferUint[vboIndex++] = getColorInt(this.colorBr, this.worldAlpha);
                    vboBufferFloat[vboIndex++] = this.worldPx + this.rh * this.worldTb;
                    vboBufferFloat[vboIndex++] = this.worldPy + this.rh * this.worldTd;
                    vboBufferUint[vboIndex++] = this.txCoordsBl;
                    vboBufferUint[vboIndex++] = getColorInt(this.colorBl, this.worldAlpha);
                    this.ctx.addVboTextureSource(this, 1);
                }
            } else {
                // Simple.
                let cx = this.worldPx + this.rw * this.worldTa;
                let cy = this.worldPy + this.rh * this.worldTd;

                if (vboIndex < 262144) {
                    vboBufferFloat[vboIndex++] = this.worldPx;
                    vboBufferFloat[vboIndex++] = this.worldPy;
                    vboBufferUint[vboIndex++] = this.txCoordsUl; // Texture.
                    vboBufferUint[vboIndex++] = getColorInt(this.colorUl, this.worldAlpha);
                    vboBufferFloat[vboIndex++] = cx;
                    vboBufferFloat[vboIndex++] = this.worldPy;
                    vboBufferUint[vboIndex++] = this.txCoordsUr;
                    vboBufferUint[vboIndex++] = getColorInt(this.colorUr, this.worldAlpha);
                    vboBufferFloat[vboIndex++] = cx;
                    vboBufferFloat[vboIndex++] = cy;
                    vboBufferUint[vboIndex++] = this.txCoordsBr;
                    vboBufferUint[vboIndex++] = getColorInt(this.colorBr, this.worldAlpha);
                    vboBufferFloat[vboIndex++] = this.worldPx;
                    vboBufferFloat[vboIndex++] = cy;
                    vboBufferUint[vboIndex++] = this.txCoordsBl;
                    vboBufferUint[vboIndex++] = getColorInt(this.colorBl, this.worldAlpha);
                    this.ctx.addVboTextureSource(this, 1);
                }
            }
        }
    };

    addToVboClipped() {
        let vboIndex = this.ctx.vboIndex;
        let vboBufferFloat = this.ctx.vboBufferFloat;
        let vboBufferUint = this.ctx.vboBufferUint;

        // Gradients are not supported for clipped quads.
        let c = getColorInt(this.colorUl, this.worldAlpha);

        if (this.clippingSquare) {
            // Inverse matrix.
            let ux = this.rw * this.worldTa;
            let vy = this.rh * this.worldTd;

            let d = 1 / (ux * vy);
            let invTa = vy * d;
            let invTd = ux * d;

            // Get ranges from 0 to 1.
            let tx1 = invTa * (this.clippingSquareMinX - this.worldPx);
            let ty1 = invTd * (this.clippingSquareMinY - this.worldPy);
            let tx3 = invTa * (this.clippingSquareMaxX - this.worldPx);
            let ty3 = invTd * (this.clippingSquareMaxY - this.worldPy);

            // Calculate texture coordinates for clipped corner points.
            let tcx1 = this.ulx * (1 - tx1) + this.brx * tx1;
            let tcy1 = this.uly * (1 - ty1) + this.bry * ty1;
            let tcx3 = this.ulx * (1 - tx3) + this.brx * tx3;
            let tcy3 = this.uly * (1 - ty3) + this.bry * ty3;

            if (vboIndex < 262144) {
                vboBufferFloat[vboIndex++] = this.clippingSquareMinX;
                vboBufferFloat[vboIndex++] = this.clippingSquareMinY;
                vboBufferUint[vboIndex++] = getVboTextureCoords(tcx1, tcy1);
                vboBufferUint[vboIndex++] = c;
                vboBufferFloat[vboIndex++] = this.clippingSquareMaxX;
                vboBufferFloat[vboIndex++] = this.clippingSquareMinY;
                vboBufferUint[vboIndex++] = getVboTextureCoords(tcx3, tcy1);
                vboBufferUint[vboIndex++] = c;
                vboBufferFloat[vboIndex++] = this.clippingSquareMaxX;
                vboBufferFloat[vboIndex++] = this.clippingSquareMaxY;
                vboBufferUint[vboIndex++] = getVboTextureCoords(tcx3, tcy3);
                vboBufferUint[vboIndex++] = c;
                vboBufferFloat[vboIndex++] = this.clippingSquareMinX;
                vboBufferFloat[vboIndex++] = this.clippingSquareMaxY;
                vboBufferUint[vboIndex++] = getVboTextureCoords(tcx1, tcy3);
                vboBufferUint[vboIndex++] = c;
                this.ctx.addVboTextureSource(this, 1);
            }
        } else {
            // Complex clipping.

            // Inverse matrix.
            let ux = this.rw * this.worldTa;
            let uy = this.rw * this.worldTc;
            let vx = this.rh * this.worldTb;
            let vy = this.rh * this.worldTd;

            let d = 1 / (ux * vy - vx * uy);
            let invTa = vy * d;
            let invTb = -vx * d;
            let invTc = -uy * d;
            let invTd = ux * d;

            let n = Math.ceil(((this.clippingArea.length / 2) - 2) / 2);

            if (n === 1) {
                // Texture coordinates.
                let tx1 = invTa * (this.clippingArea[0] - this.worldPx) + invTb * (this.clippingArea[1] - this.worldPy);
                let ty1 = invTc * (this.clippingArea[0] - this.worldPx) + invTd * (this.clippingArea[1] - this.worldPy);
                let tx2 = invTa * (this.clippingArea[2] - this.worldPx) + invTb * (this.clippingArea[3] - this.worldPy);
                let ty2 = invTc * (this.clippingArea[2] - this.worldPx) + invTd * (this.clippingArea[3] - this.worldPy);
                let tx3 = invTa * (this.clippingArea[4] - this.worldPx) + invTb * (this.clippingArea[5] - this.worldPy);
                let ty3 = invTc * (this.clippingArea[4] - this.worldPx) + invTd * (this.clippingArea[5] - this.worldPy);

                // Check for polygon instead of quad.
                let g = this.clippingArea.length <= 6 ? 4 : 6;
                let tx4 = invTa * (this.clippingArea[g] - this.worldPx) + invTb * (this.clippingArea[g + 1] - this.worldPy);
                let ty4 = invTc * (this.clippingArea[g] - this.worldPx) + invTd * (this.clippingArea[g + 1] - this.worldPy);

                if (vboIndex < 262144) {
                    vboBufferFloat[vboIndex++] = this.clippingArea[0];
                    vboBufferFloat[vboIndex++] = this.clippingArea[1];
                    vboBufferUint[vboIndex++] = getVboTextureCoords(this.ulx * (1 - tx1) + this.brx * tx1, this.uly * (1 - ty1) + this.bry * ty1);
                    vboBufferUint[vboIndex++] = c;
                    vboBufferFloat[vboIndex++] = this.clippingArea[2];
                    vboBufferFloat[vboIndex++] = this.clippingArea[3];
                    vboBufferUint[vboIndex++] = getVboTextureCoords(this.ulx * (1 - tx2) + this.brx * tx2, this.uly * (1 - ty2) + this.bry * ty2);
                    vboBufferUint[vboIndex++] = c;
                    vboBufferFloat[vboIndex++] = this.clippingArea[4];
                    vboBufferFloat[vboIndex++] = this.clippingArea[5];
                    vboBufferUint[vboIndex++] = getVboTextureCoords(this.ulx * (1 - tx3) + this.brx * tx3, this.uly * (1 - ty3) + this.bry * ty3);
                    vboBufferUint[vboIndex++] = c;
                    vboBufferFloat[vboIndex++] = this.clippingArea[g];
                    vboBufferFloat[vboIndex++] = this.clippingArea[g + 1];
                    vboBufferUint[vboIndex++] = getVboTextureCoords(this.ulx * (1 - tx4) + this.brx * tx4, this.uly * (1 - ty4) + this.bry * ty4);
                    vboBufferUint[vboIndex] = c;
                    this.ctx.addVboTextureSource(this, 1);
                }
            } else {
                // Multiple quads.
                let g;
                for (let i = 0; i < n; i++) {
                    let b = i * 4 + 2;
                    g = b + 4;
                    if (g >= this.clippingArea.length) {
                        // Roll-over: convert polygon to quad.
                        g -= 2;
                    }

                    // Texture coordinates.
                    let tx1 = invTa * (this.clippingArea[0] - this.worldPx) + invTb * (this.clippingArea[1] - this.worldPy);
                    let ty1 = invTc * (this.clippingArea[0] - this.worldPx) + invTd * (this.clippingArea[1] - this.worldPy);
                    let tx2 = invTa * (this.clippingArea[b] - this.worldPx) + invTb * (this.clippingArea[b + 1] - this.worldPy);
                    let ty2 = invTc * (this.clippingArea[b] - this.worldPx) + invTd * (this.clippingArea[b + 1] - this.worldPy);
                    let tx3 = invTa * (this.clippingArea[b + 2] - this.worldPx) + invTb * (this.clippingArea[b + 3] - this.worldPy);
                    let ty3 = invTc * (this.clippingArea[b + 2] - this.worldPx) + invTd * (this.clippingArea[b + 3] - this.worldPy);
                    let tx4 = invTa * (this.clippingArea[g] - this.worldPx) + invTb * (this.clippingArea[g + 1] - this.worldPy);
                    let ty4 = invTc * (this.clippingArea[g] - this.worldPx) + invTd * (this.clippingArea[g + 1] - this.worldPy);

                    if (vboIndex < 262144) {
                        vboBufferFloat[vboIndex++] = this.clippingArea[0];
                        vboBufferFloat[vboIndex++] = this.clippingArea[1];
                        vboBufferUint[vboIndex++] = getVboTextureCoords(this.ulx * (1 - tx1) + this.brx * tx1, this.uly * (1 - ty1) + this.bry * ty1);
                        vboBufferUint[vboIndex++] = c;
                        vboBufferFloat[vboIndex++] = this.clippingArea[b];
                        vboBufferFloat[vboIndex++] = this.clippingArea[b + 1];
                        vboBufferUint[vboIndex++] = getVboTextureCoords(this.ulx * (1 - tx2) + this.brx * tx2, this.uly * (1 - ty2) + this.bry * ty2);
                        vboBufferUint[vboIndex++] = c;
                        vboBufferFloat[vboIndex++] = this.clippingArea[b + 2];
                        vboBufferFloat[vboIndex++] = this.clippingArea[b + 3];
                        vboBufferUint[vboIndex++] = getVboTextureCoords(this.ulx * (1 - tx3) + this.brx * tx3, this.uly * (1 - ty3) + this.bry * ty3);
                        vboBufferUint[vboIndex++] = c;
                        vboBufferFloat[vboIndex++] = this.clippingArea[g];
                        vboBufferFloat[vboIndex++] = this.clippingArea[g + 1];
                        vboBufferUint[vboIndex++] = getVboTextureCoords(this.ulx * (1 - tx4) + this.brx * tx4, this.uly * (1 - ty4) + this.bry * ty4);
                        vboBufferUint[vboIndex++] = c;
                        this.ctx.addVboTextureSource(this, 1);
                    }
                }
            }
        }
    };

    fillVbo() {
        if (this.zSort) {
            this.sortZIndexedChildren();
            this.zSort = false;
        }

        if (this.worldAlpha) {
            if (this.displayedTextureSource) {
                this.addToVbo();
            }

            if (this.hasChildren) {
                if (this.zContextUsage) {
                    for (let i = 0, n = this.zIndexedChildren.length; i < n; i++) {
                        this.zIndexedChildren[i].fillVbo();
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

    getLocalTa() {
        return this.localTa;
    };

    getLocalTb() {
        return this.localTb;
    };

    getLocalTc() {
        return this.localTc;
    };

    getLocalTd() {
        return this.localTd;
    };

    getCornerPoints() {
        return [
            this.worldPx,
            this.worldPy,
            this.worldPx + this.rw * this.worldTa,
            this.worldPy + this.rw * this.worldTc,
            this.worldPx + this.rw * this.worldTa + this.rh * this.worldTb,
            this.worldPy + this.rw * this.worldTc + this.rh * this.worldTd,
            this.worldPx + this.rh * this.worldTb,
            this.worldPy + this.rh * this.worldTd
        ];
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
