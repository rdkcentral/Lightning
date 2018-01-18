/**
 * Graphical calculations / VBO buffer filling.
 */

class ViewCore {

    constructor(view) {
        this._view = view;

        this.ctx = view.stage.ctx;
        
        this.renderState = this.ctx.renderState;

        this._parent = null;

        this._hasUpdates = false;

        this._hasRenderUpdates = 0;

        this._visitEntry = null;

        this._visitExit = null;

        this._recalc = 0;

        this._updateTreeOrder = 0;

        this._worldContext = new ViewCoreContext()

        this._renderContext = this._worldContext

        // All local translation/transform updates: directly propagated from x/y/w/h/scale/whatever.
        this._localPx = 0;
        this._localPy = 0;

        this._localTa = 1;
        this._localTb = 0;
        this._localTc = 0;
        this._localTd = 1;

        this._isComplex = false;

        this._localAlpha = 1;

        this._rw = 0;
        this._rh = 0;

        this._clipping = false;

        /**
         * The texture source to be displayed.
         * @type {TextureSource}
         */
        this._displayedTextureSource = null;

        /**
         * If the current coordinates are stored for the texture atlas.
         * @type {boolean}
         */
        this.inTextureAtlas = false

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

        this._shader = null;

        // The ViewCore that owns the shader that's active in this branch. Null if none is active (default shader).
        this._shaderOwner = null;

        // View is rendered on another texture.
        this._renderToTextureEnabled = false;

        this._texturizer = null

        this._useRenderToTexture = false

        this._scissor = undefined

        this.render = this._renderSimple
    }

    /**
     * @param {number} type
     * 0: no updates
     * 1: re-invoke shader
     * 2: re-invoke filter
     * 3: re-create render texture and re-invoke shader and filter
     */
    setHasRenderUpdates(type) {
        let p = this;
        p._hasRenderUpdates = Math.max(type, p._hasRenderUpdates);
        while ((p = p._parent) && (p._hasRenderUpdates != 3)) {
            p._hasRenderUpdates = 3;
        }
    }

    /**
     * @param {Number} type
     *   1: alpha
     *   2: translate
     *   4: transform
     * 128: becomes visible
     */
    _setRecalc(type) {
        this._recalc |= type;

        let p = this;
        do {
            p._hasUpdates = true;
        } while ((p = p._parent) && !p._hasUpdates);

        // Any changes in descendants should trigger texture updates.
        if (this._parent) this._parent.setHasRenderUpdates(3);
    }

    setParent(parent) {
        if (parent !== this._parent) {
            let prevIsZContext = this.isZContext();
            let prevParent = this._parent;
            this._parent = parent;

            if (prevParent) {
                // When views are deleted, the render texture must be re-rendered.
                prevParent.setHasRenderUpdates(3);
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

            if (!this._shader) {
                let newShaderOwner = parent && !parent._renderToTextureEnabled ? parent._shaderOwner : null;
                if (newShaderOwner !== this._shaderOwner) {
                    this.setHasRenderUpdates(1);
                    this._setShaderOwnerRecursive(newShaderOwner);
                }
            }
        }
    };

    addChildAt(index, child) {
        if (!this._children) this._children = [];
        this._children.splice(index, 0, child);
        child.setParent(this);
    };

    setChildAt(index, child) {
        if (!this._children) this._children = [];
        this._children[index].setParent(null)
        this._children[index] = child
        child.setParent(this)
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
        this._children = order
        for (let i = 0, n = removed.length; i < n; i++) {
            removed[i].setParent(null)
        }
        for (let i = 0, n = added.length; i < n; i++) {
            added[i].setParent(this)
        }
    }

    moveChild(fromIndex, toIndex) {
        let c = this._children[fromIndex]
        this._children.splice(fromIndex, 1);
        this._children.splice(toIndex, 0, c);
    }

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
        if (!this._worldContext.alpha && ((this._parent && this._parent._worldContext.alpha) && a)) {
            // View is becoming visible.
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

    setDimensions(w, h) {
        this._rw = w;
        this._rh = h;
        this._setRecalc(2);
        if (this._texturizer) {
            this._texturizer.releaseRenderTexture();
            this._texturizer.releaseFilterTexture();
            this._texturizer.updateResultTexture()
        }
    };

    setTextureCoords(ulx, uly, brx, bry) {
        this.setHasRenderUpdates(3);

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
        this.setHasRenderUpdates(3);
        this._displayedTextureSource = textureSource;
    };

    allowTextureAtlas() {
        return this.activeShader.supportsTextureAtlas()
    }

    setInTextureAtlas(inTextureAtlas) {
        this.inTextureAtlas = inTextureAtlas;
    };

    setAsRoot() {
        // Use parent dummy.
        this._parent = new ViewCore(this._view);

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
            this.setHasRenderUpdates(1);

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


    set visitEntry(f) {
        this._visitEntry = f;
    }

    set visitExit(f) {
        this._visitExit = f;
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
        return this._clipping
    }

    set clipping(v) {
        if (this._clipping !== v) {
            this._clipping = v

            // Force update of scissor by updating translate.
            // Alpha must also be updated because the scissor area may have been empty.
            this._setRecalc(1 + 2)
        }
    }

    _setShaderOwnerRecursive(viewCore) {
        let support = this.activeShader && this.activeShader.supportsTextureAtlas()
        this._shaderOwner = viewCore;
        if (support !== this.activeShader.supportsTextureAtlas()) {
            this._view._updateTextureCoords()
        }

        if (this._children && !this._renderToTextureEnabled) {
            for (let i = 0, n = this._children.length; i < n; i++) {
                let c = this._children[i]
                if (!c._shader) {
                    c._setShaderOwnerRecursive(viewCore);
                    c._hasRenderUpdates = 3;
                }
            }
        }
    };

    _setShaderOwnerChildrenRecursive(viewCore) {
        if (this._children) {
            for (let i = 0, n = this._children.length; i < n; i++) {
                let c = this._children[i]
                if (!c._shader) {
                    c._setShaderOwnerRecursive(viewCore);
                    c._hasRenderUpdates = 3;
                }
            }
        }
    };

    _hasRenderContext() {
        return this._renderContext !== this._worldContext
    }

    updateRenderToTextureEnabled() {
        // Enforce texturizer initialisation.
        let v = (this.texturizer._hasFilters() || this.texturizer._enabled)

        if (v) {
            this._enableRenderToTexture()
        } else {
            this._disableRenderToTexture()
            this._texturizer.releaseRenderTexture()
        }
    }

    _enableRenderToTexture() {
        if (!this._renderToTextureEnabled) {
            let prevIsZContext = this.isZContext()

            this._renderToTextureEnabled = true

            this._renderContext = new ViewCoreContext()

            // If render to texture is active, a new shader context is started.
            this._setShaderOwnerChildrenRecursive(null)

            if (!prevIsZContext) {
                // Render context forces z context.
                this.enableZContext(this._parent ? this._parent.findZContext() : null);
            }

            this.setHasRenderUpdates(3)

            // Make sure that the render coordinates get updated.
            this._setRecalc(7)

            this.render = this._renderAdvanced
        }
    }

    _disableRenderToTexture() {
        if (this._renderToTextureEnabled) {
            this._renderToTextureEnabled = false

            this._setShaderOwnerChildrenRecursive(this._shaderOwner)

            this._renderContext = this._worldContext

            if (!this.isZContext()) {
                this.disableZContext();
            }

            // Make sure that the render coordinates get updated.
            this._setRecalc(7);

            this.setHasRenderUpdates(3)

            this.render = this._renderSimple
        }
    }

    _stashTexCoords() {
        this._stashedTexCoords = [this._txCoordsUl, this._txCoordsUr, this._txCoordsBr, this._txCoordsBl, this._ulx, this._uly, this._brx, this._bry];
        this._txCoordsUl = 0x00000000;
        this._txCoordsUr = 0x0000FFFF;
        this._txCoordsBr = 0xFFFFFFFF;
        this._txCoordsBl = 0xFFFF0000;
        this._ulx = 0;
        this._uly = 0;
        this._brx = 1;
        this._bry = 1;
    }

    _unstashTexCoords() {
        this._txCoordsUl = this._stashedTexCoords[0];
        this._txCoordsUr = this._stashedTexCoords[1];
        this._txCoordsBr = this._stashedTexCoords[2];
        this._txCoordsBl = this._stashedTexCoords[3];
        this._ulx = this._stashedTexCoords[4];
        this._uly = this._stashedTexCoords[5];
        this._brx = this._stashedTexCoords[6];
        this._bry = this._stashedTexCoords[7];
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

    visit() {
        if (this.isVisible()) {
            this._recalc |= (this._parent._recalc & 6)

            let changed = (this._recalc > 0) || (this._hasRenderUpdates > 0) || this._hasUpdates

            if (changed) {
                if (this._visitEntry) {
                    this._visitEntry(this._view);
                }

                if (this._children) {
                    // Positioning changes are propagated downwards.
                    let recalc = this._recalc

                    for (let i = 0, n = this._children.length; i < n; i++) {
                        this._children[i].visit()
                    }

                    // Reset recalc so that visitExit is able to distinguish between a local positioning change and a
                    // positioning changed forced by the ancestor.
                    this._recalc = recalc
                }

                if (this._visitExit) {
                    this._visitExit(this._view);
                }
            }
        }
    }

    update() {
        this._recalc |= this._parent._recalc

        const pw = this._parent._worldContext
        let w = this._worldContext
        const visible = (pw.alpha && this._localAlpha);

        /**
         * We must update if:
         * - branch contains updates (even when invisible because it may contain z-indexed descendants)
         * - there are (inherited) updates and this branch is visible
         * - this branch becomes invisible (descs may be z-indexed so we must update all alpha values)
         */
        if (this._hasUpdates || (this._recalc && visible) || (w.alpha && !visible)) {
            if (this._zSort) {
                // Make sure that all descendants are updated so that the updateTreeOrder flags are correctly set.
                this.ctx.updateTreeOrderForceUpdate++;
            }

            const recalc = this._recalc

            // Update world coords/alpha.
            if (recalc & 1) {
                w.alpha = pw.alpha * this._localAlpha;

                if (w.alpha < 1e-14) {
                    // Tiny rounding errors may cause failing visibility tests.
                    w.alpha = 0
                }
            }

            if (recalc & 6) {
                w.px = pw.px + this._localPx * pw.ta
                w.py = pw.py + this._localPy * pw.td
                if (pw.tb !== 0) w.px += this._localPy * pw.tb;
                if (pw.tc !== 0) w.py += this._localPx * pw.tc;
            }

            if (recalc & 4) {
                w.ta = this._localTa * pw.ta
                w.tb = this._localTd * pw.tb
                w.tc = this._localTa * pw.tc
                w.td = this._localTd * pw.td

                if (this._isComplex) {
                    w.ta += this._localTc * pw.tb
                    w.tb += this._localTb * pw.ta
                    w.tc += this._localTc * pw.td
                    w.td += this._localTb * pw.tc
                }
            }

            // Update render coords/alpha.
            if (this._parent._hasRenderContext()) {
                if (this._renderContext === this._worldContext) {
                    this._renderContext = new ViewCoreContext()
                }

                let r = this._renderContext

                let pr = this._parent._renderContext

                // Update world coords/alpha.
                if (recalc & 1) {
                    r.alpha = pr.alpha * this._localAlpha;

                    if (r.alpha < 1e-14) {
                        r.alpha = 0
                    }
                }

                if (recalc & 6) {
                    r.px = pr.px + this._localPx * pr.ta
                    r.py = pr.py + this._localPy * pr.td
                    if (pr.tb !== 0) r.px += this._localPy * pr.tb;
                    if (pr.tc !== 0) r.py += this._localPx * pr.tc;
                }

                if (recalc & 4) {
                    r.ta = this._localTa * pr.ta
                    r.tb = this._localTd * pr.tb
                    r.tc = this._localTa * pr.tc
                    r.td = this._localTd * pr.td

                    if (this._isComplex) {
                        r.ta += this._localTc * pr.tb
                        r.tb += this._localTb * pr.ta
                        r.tc += this._localTc * pr.td
                        r.td += this._localTb * pr.tc
                    }
                }
            } else {
                this._renderContext = this._worldContext
            }

            this._updateTreeOrder = this.ctx.updateTreeOrder++;

            this._recalc = (this._recalc & 135);
            /* 1+2+4+128 */

            // Determine whether we must use a 'renderTexture'.
            this._useRenderToTexture = this._renderToTextureEnabled && this._texturizer.mustRenderToTexture()

            // Determine whether we must 'clip'.
            if (this._clipping && this._renderContext.isSquare()) {
                // We must clip.
                const x = this._renderContext.px
                const y = this._renderContext.py
                const w = this._renderContext.ta * this._rw
                const h = this._renderContext.td * this._rh

                // If the parent renders to a texture, parent scissor is undefined.
                const area = this._parent._useRenderToTexture ? undefined : this._parent._scissor
                if (area) {
                    // Merge scissor areas.
                    let sx = Math.max(area[0], x)
                    let sy = Math.max(area[1], y)
                    let ex = Math.min(area[0] + area[2], x + w)
                    let ey = Math.min(area[1] + area[3], y + h)
                    this._scissor = [sx, sy, ex - sx, ey - sy]

                    // Optimization: if scissor area is empty: worldAlpha is set to 0 to prevent rendering the
                    // full branch.
                    if (this._scissor[2] <= 0 || this._scissor[3] <= 0) {
                        this._renderContext.alpha = 0
                    }
                } else {
                    this._scissor = [x, y, w, h]
                }
            } else {
                // No clipping: reuse parent scissor.
                this._scissor = this._parent._useRenderToTexture ? undefined : this._parent._scissor
            }

            let r
            if (this._useRenderToTexture) {
                r = this._renderContext

                if (this._worldContext.isIdentity()) {
                    // Optimization.
                    // The world context is already identity: use the world context as render context to prevents the
                    // ancestors from having to update the render context.
                    this._renderContext = this._worldContext
                } else {
                    // Temporarily replace the render coord attribs by the identity matrix.
                    // This allows the children to calculate the render context.
                    this._renderContext = ViewCoreContext.IDENTITY
                }
            }

            if (this._children) {
                for (let i = 0, n = this._children.length; i < n; i++) {
                    this._children[i].update();
                }
            }

            if (this._useRenderToTexture) {
                this._renderContext = r
            }

            this._recalc = 0

            this._hasUpdates = false;

            if (this._zSort) {
                this.ctx.updateTreeOrderForceUpdate--;
            }
        } else if (this.ctx.updateTreeOrderForceUpdate > 0) {
            // Branch is invisible, but still we want to update the tree order.
            this.updateTreeOrder();
        }
    }

    updateTreeOrder() {
        if (this._zSort) {
            // Make sure that all descendants are updated so that the updateTreeOrder flags are correctly set.
            this.ctx.updateTreeOrderForceUpdate++;
        }

        this._updateTreeOrder = this.ctx.updateTreeOrder++;

        if (this._children) {
            for (let i = 0, n = this._children.length; i < n; i++) {
                let hasZSort = this._children[i]._zSort
                if (hasZSort) {
                    this.ctx.updateTreeOrderForceUpdate--;
                }

                this._children[i].updateTreeOrder();

                if (hasZSort) {
                    this.ctx.updateTreeOrderForceUpdate--;
                }
            }
        }

        if (this._zSort) {
            this.ctx.updateTreeOrderForceUpdate--;
        }
    }

    _renderSimple() {
        if (this._zSort) {
            this.sortZIndexedChildren();
            this._zSort = false;
        }

        if (this._renderContext.alpha) {
            let renderState = this.renderState;

            renderState.setShader(this.activeShader, this._shaderOwner);

            renderState.setScissor(this._scissor)

            if (this._displayedTextureSource) {
                this.addQuads()
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

            this._hasRenderUpdates = 0;
        }
    }

    _renderAdvanced() {
        if (this._zSort) {
            this.sortZIndexedChildren();
            this._zSort = false;
        }

        if (this._renderContext.alpha) {
            let renderState = this.renderState;

            let mustRenderChildren = true
            let renderTextureInfo
            let prevRenderTextureInfo
            if (this._useRenderToTexture) {
                if (this._rw === 0 || this._rh === 0) {
                    // Ignore this branch and don't draw anything.
                    this._hasRenderUpdates = 0;
                    return;
                } else if (!this._texturizer.hasRenderTexture() || (this._hasRenderUpdates >= 3)) {
                    // Switch to default shader for building up the render texture.
                    renderState.setShader(renderState.defaultShader, this)

                    prevRenderTextureInfo = renderState.renderTextureInfo

                    renderTextureInfo = {
                        glTexture: null,
                        offset: 0,
                        w: this._rw,
                        h: this._rh,
                        empty: true,
                        cleared: false,
                        ignore: false
                    }

                    renderState.setRenderTextureInfo(renderTextureInfo);
                    renderState.setScissor(undefined)

                    if (this._displayedTextureSource) {
                        let r = this._renderContext

                        // Use an identity context for drawing the displayed texture to the render texture.
                        this._renderContext = ViewCoreContext.IDENTITY

                        // Add displayed texture source in local coordinates.
                        this.addQuads()

                        this._renderContext = r
                    }
                } else {
                    mustRenderChildren = false;
                }
            } else {
                if (this._displayedTextureSource) {
                    renderState.setShader(this.activeShader, this._shaderOwner);
                    renderState.setScissor(this._scissor)
                    this.addQuads()
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
                let updateResultTexture = false
                if (mustRenderChildren) {
                    // Finish refreshing renderTexture.
                    if (renderTextureInfo.glTexture) {
                        // There was only one texture drawn in this render texture.
                        // Check if we can reuse it (it should exactly span this render texture).
                        let floats = renderState.quads.floats
                        let uints = renderState.quads.uints
                        let offset = renderTextureInfo.offset / 4
                        let reuse = ((floats[offset] === 0) &&
                        (floats[offset + 1] === 0) &&
                        (uints[offset + 2] === 0x00000000) &&
                        (uints[offset + 3] === 0xFFFFFFFF) &&
                        (floats[offset + 4] === renderTextureInfo.w) &&
                        (floats[offset + 5] === 0) &&
                        (uints[offset + 6] === 0x0000FFFF) &&
                        (uints[offset + 7] === 0xFFFFFFFF) &&
                        (floats[offset + 8] === renderTextureInfo.w) &&
                        (floats[offset + 9] === renderTextureInfo.h) &&
                        (uints[offset + 10] === 0xFFFFFFFF) &&
                        (uints[offset + 11] === 0xFFFFFFFF) &&
                        (floats[offset + 12] === 0) &&
                        (floats[offset + 13] === renderTextureInfo.h) &&
                        (uints[offset + 14] === 0xFFFF0000) &&
                        (uints[offset + 15] === 0xFFFFFFFF))
                        if (!reuse) {
                            renderTextureInfo.glTexture = null
                        }
                    }

                    if (renderTextureInfo.empty) {
                        // We ignore empty render textures and do not draw the final quad.
                    } else if (renderTextureInfo.glTexture) {
                        // If glTexture is set, we can reuse that directly instead of creating a new render texture.
                        this._texturizer.reuseTextureAsRenderTexture(renderTextureInfo.glTexture)

                        renderTextureInfo.ignore = true
                    } else {
                        if (this._texturizer.renderTextureReused) {
                            // Quad operations must be written to a render texture actually owned.
                            this._texturizer.releaseRenderTexture()
                        }
                        // Just create the render texture.
                        renderTextureInfo.glTexture = this._texturizer.getRenderTexture()
                    }

                    // Restore the parent's render texture and active scissor.
                    renderState.setRenderTextureInfo(prevRenderTextureInfo)

                    updateResultTexture = true
                }

                let hasFilters = this._texturizer._hasActiveFilters();

                if (hasFilters) {
                    if ((this._hasRenderUpdates >= 2 || !this._texturizer.filterResultCached)) {
                        this.applyFilters();
                        updateResultTexture = true
                    }
                }

                let resultTexture = this._texturizer.getResultTexture();
                if (updateResultTexture) {
                    if (resultTexture) {
                        // Logging the update frame can be handy for userland.
                        resultTexture.update = renderState.stage.frameCounter
                    }
                    this._texturizer.updateResultTexture();
                }

                // Do not draw textures that do not have any contents.
                if ((!mustRenderChildren || !renderTextureInfo.empty) && !this._texturizer.hideResult) {
                    // Render result texture to the actual render target.
                    renderState.setShader(this.activeShader, this._shaderOwner);
                    renderState.setScissor(this._scissor)

                    renderState.setOverrideQuadTexture(resultTexture);
                    this._stashTexCoords();
                    if (!this._texturizer.colorize) this._stashColors()
                    this.addQuads();
                    if (!this._texturizer.colorize) this._unstashColors();
                    this._unstashTexCoords();
                    renderState.setOverrideQuadTexture(null);
                }
            }

            this._hasRenderUpdates = 0;
        }
    }

    applyFilters() {
        let sourceTexture = this._texturizer.getRenderTexture();

        let renderState = this.renderState;
        let activeFilters = this._texturizer.getActiveFilters();

        let textureRenders = activeFilters.length;

        this._texturizer.filterResultCached = false

        if (textureRenders === 0) {
            // No filters: just render the source texture with the normal shader.
            return sourceTexture
        } else if (textureRenders === 1) {
            let targetTexture = this._texturizer.getFilterTexture();

            // No intermediate texture is needed.
            renderState.addFilter(activeFilters[0], this, sourceTexture, targetTexture);
            this._texturizer.filterResultCached = true;
        } else {
            let targetTexture = this._texturizer.getFilterTexture();
            let intermediate = this.ctx.allocateRenderTexture(this._rw, this._rh);
            let source = intermediate;
            let target = targetTexture;

            let even = ((textureRenders % 2) === 0);

            for (let i = 0; i < textureRenders; i++) {
                if (i !== 0 || even) {
                    // Finally, the target should contain targetTexture, and source the intermediate texture.
                    let tmp = source;
                    source = target;
                    target = tmp;
                }

                renderState.addFilter(activeFilters[i], this, i === 0 ? sourceTexture : source, target)
            }

            this.ctx.releaseRenderTexture(intermediate);

            this._texturizer.filterResultCached = true;
        }
    }

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

    addQuads() {
        let r = this._renderContext

        let floats = this.renderState.quads.floats;
        let uints = this.renderState.quads.uints;

        if (r.tb !== 0 || this.tb !== 0) {
            let offset = this.renderState.addQuad(this) / 4;
            floats[offset++] = r.px;
            floats[offset++] = r.py;
            uints[offset++] = this._txCoordsUl; // Texture.
            uints[offset++] = getColorInt(this._colorUl, r.alpha);
            floats[offset++] = r.px + this._rw * r.ta;
            floats[offset++] = r.py + this._rw * r.tc;
            uints[offset++] = this._txCoordsUr;
            uints[offset++] = getColorInt(this._colorUr, r.alpha);
            floats[offset++] = r.px + this._rw * r.ta + this._rh * r.tb;
            floats[offset++] = r.py + this._rw * r.tc + this._rh * r.td;
            uints[offset++] = this._txCoordsBr;
            uints[offset++] = getColorInt(this._colorBr, r.alpha);
            floats[offset++] = r.px + this._rh * r.tb;
            floats[offset++] = r.py + this._rh * r.td;
            uints[offset++] = this._txCoordsBl;
            uints[offset] = getColorInt(this._colorBl, r.alpha);
        } else {
            // Simple.
            let cx = r.px + this._rw * r.ta;
            let cy = r.py + this._rh * r.td;

            let offset = this.renderState.addQuad(this) / 4;
            floats[offset++] = r.px;
            floats[offset++] = r.py
            uints[offset++] = this._txCoordsUl; // Texture.
            uints[offset++] = getColorInt(this._colorUl, r.alpha);
            floats[offset++] = cx;
            floats[offset++] = r.py;
            uints[offset++] = this._txCoordsUr;
            uints[offset++] = getColorInt(this._colorUr, r.alpha);
            floats[offset++] = cx;
            floats[offset++] = cy;
            uints[offset++] = this._txCoordsBr;
            uints[offset++] = getColorInt(this._colorBr, r.alpha);
            floats[offset++] = r.px;
            floats[offset++] = cy;
            uints[offset++] = this._txCoordsBl;
            uints[offset] = getColorInt(this._colorBl, r.alpha);
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

    get view() {
        return this._view;
    }

    get renderUpdates() {
        return this._hasRenderUpdates
    }

    get texturizer() {
        if (!this._texturizer) {
            this._texturizer = new ViewTexturizer(this)
        }
        return this._texturizer
    }

    getCornerPoints() {
        let w = this._worldContext

        return [
            w.px,
            w.py,
            w.px + this._rw * w.ta,
            w.py + this._rw * w.tc,
            w.px + this._rw * w.ta + this._rh * this.tb,
            w.py + this._rw * w.tc + this._rh * this.td,
            w.px + this._rh * this.tb,
            w.py + this._rh * this.td
        ]
    };

    getRenderTextureCoords(relX, relY) {
        let r = this._renderContext
        return [
            r.px + r.ta * relX + r.tb * relY,
            r.py + r.tc * relX + r.td * relY
        ]
    }

    getAbsoluteCoords(relX, relY) {
        let w = this._renderContext
        return [
            w.px + w.ta * relX + w.tb * relY,
            w.py + w.tc * relX + w.td * relY
        ]
    }
}

let getColorInt = function (c, alpha) {
    let a = ((c / 16777216 | 0) * alpha) | 0;
    return (((((c >> 16) & 0xff) * a) / 255) & 0xff) +
        ((((c & 0xff00) * a) / 255) & 0xff00) +
        (((((c & 0xff) << 16) * a) / 255) & 0xff0000) +
        (a << 24);
};

class ViewCoreContext {
    
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
            this.td === 1
    }

    isSquare() {
        return this.tb === 0 && this.tc === 0
    }

}

ViewCoreContext.IDENTITY = new ViewCoreContext()

module.exports = ViewCore;

let ViewTexturizer = require('./ViewTexturizer')