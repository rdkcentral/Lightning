var Base = require('./Base');

/**
 * Graphical calculations / VBO buffer filling.
 */
function ViewRenderer(view) {

    this.view = view;

    this.ctx = view.stage.ctx;

    this._children = [];

    this._zIndexedChildren = [];
}

ViewRenderer.prototype.getCornerPoints = function() {
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

/**
 * @param {Number} type
 *   1: alpha
 *   2: translate
 *   4: transform
 *   8: clipping
 * @private
 */
ViewRenderer.prototype._setRecalc = function(type) {
    this._recalc |= type;

    if (this._worldAlpha) {
        this.ctx.staticStage = false;
        var p = this;
        do {
            p._hasUpdates = true;
        } while ((p = p._parent) && !p._hasUpdates);
    } else {
        this._hasUpdates = true;
    }
};

/**
 * @private
 */
ViewRenderer.prototype._setRecalcForced = function(type, force) {
    this._recalc |= type;

    if (this._worldAlpha || force) {
        this.ctx.staticStage = false;
        var p = this;
        do {
            p._hasUpdates = true;
        } while ((p = p._parent) && !p._hasUpdates);
    } else {
        this._hasUpdates = true;
    }
};

ViewRenderer.prototype.setParent = function(parent) {
    if (parent !== this._parent) {
        var prevIsZContext = this.isZContext();
        var prevParent = this._parent;
        this._parent = parent;

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

        var newClippingParent = parent ? (parent._clipping ? parent : parent._clippingParent) : null;

        if (newClippingParent !== this._clippingParent) {
            this.setClippingParent(newClippingParent);
        }
    }
};

ViewRenderer.prototype.addChildAt = function(index, child) {
    if (!this._children) this._children = [];
    this._children.splice(index, 0, child);
    child.setParent(this);
};

ViewRenderer.prototype.removeChildAt = function(index) {
    var child = this._children[index];
    this._children.splice(index, 1);
    child.setParent(null);
};

ViewRenderer.prototype.removeChildren = function() {
    if (this._children) {
        for (var i = 0, n = this._children.length; i < n; i++) {
            this._children[i].setParent(null);
        }

        this._children.splice(0);
        this._zIndexedChildren.splice(0);
    }
};

ViewRenderer.prototype.setLocalTransform = function(a, b, c, d) {
    this._setRecalc(4);
    this._localTa = a;
    this._localTb = b;
    this._localTc = c;
    this._localTd = d;
    this._isComplex = (b != 0) || (c != 0);
};

ViewRenderer.prototype.setLocalTranslate = function(x, y) {
    this._setRecalc(2);
    this._localPx = x;
    this._localPy = y;
};

ViewRenderer.prototype.addLocalTranslate = function(dx, dy) {
    this.setLocalTranslate(this._localPx + dx, this._localPy + dy);
}

ViewRenderer.prototype.setLocalAlpha = function(a) {
    this._setRecalcForced(1, (this._parent && this._parent._worldAlpha) && a);

    if (a < 1e-14) {
        // Tiny rounding errors may cause failing visibility tests.
        a = 0;
    }

    this._localAlpha = a;
};

ViewRenderer.prototype.setDimensions = function(w, h) {
    this._rw = w;
    this._rh = h;
    this._setRecalc(2);
};

ViewRenderer.prototype.setTextureCoords = function(ulx, uly, brx, bry) {
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

ViewRenderer.prototype.setDisplayedTextureSource = function(textureSource) {
    if (this._worldAlpha) this.ctx.staticStage = false;
    this._displayedTextureSource = textureSource;
};

ViewRenderer.prototype.setInTextureAtlas = function(inTextureAtlas) {
    if (this._worldAlpha) this.ctx.staticStage = false;

    this.inTextureAtlas = inTextureAtlas;
};

ViewRenderer.prototype.setAsRoot = function() {
    // Use parent dummy.
    this._parent = new ViewRenderer(this.view);

    // Root is, and will always be, the primary zContext.
    this._isRoot = true;

    this.ctx.root = this;
};

ViewRenderer.prototype.isAncestorOf = function(c) {
    var p = c;
    while (p = p._parent) {
        if (this === p) {
            return true;
        }
    }
    return false;
};

ViewRenderer.prototype.isZContext = function() {
    return (this._forceZIndexContext || this._zIndex !== 0 || this._isRoot || !this._parent);
};

ViewRenderer.prototype.findZContext = function() {
    if (this.isZContext()) {
        return this;
    } else {
        return this._parent.findZContext();
    }
};

ViewRenderer.prototype.setZParent = function(newZParent) {
    if (this._zParent !== newZParent) {
        if (this._zParent !== null) {
            if (this._zIndex !== 0) {
                this._zParent.decZContextUsage();
            }

            if (this._zParent._zContextUsage > 0) {
                var index = this._zParent._zIndexedChildren.indexOf(this);
                this._zParent._zIndexedChildren.splice(index, 1);
            }
        }

        if (newZParent !== null) {
            var hadZContextUsage = (newZParent._zContextUsage > 0);

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

ViewRenderer.prototype.incZContextUsage = function() {
    this._zContextUsage++;
    if (this._zContextUsage === 1) {
        if (!this._zIndexedChildren) {
            this._zIndexedChildren = [];
        }
        if (this._children) {
            // Copy.
            for (var i = 0, n = this._children.length; i < n; i++) {
                this._zIndexedChildren.push(this._children[i]);
            }
        }
    }
};

ViewRenderer.prototype.decZContextUsage = function() {
    this._zContextUsage--;
    if (this._zContextUsage === 0) {
        this._zSort = false;
        this._zIndexedChildren.splice(0);
    }
};

ViewRenderer.prototype.enableZContext = function(prevZContext) {
    if (prevZContext._zContextUsage > 0) {
        var self = this;
        // Transfer from upper z context to this z context.
        prevZContext._zIndexedChildren.slice().forEach(function (c) {
            if (self.isAncestorOf(c) && c._zIndex !== 0) {
                c.setZParent(self);
            }
        });
    }
};

ViewRenderer.prototype.disableZContext = function() {
    // Transfer from this z context to upper z context.
    if (this._zContextUsage > 0) {
        var newZParent = this._parent.findZContext();

        this._zIndexedChildren.slice().forEach(function (c) {
            if (c._zIndex !== 0) {
                c.setZParent(newZParent);
            }
        });
    }
};

ViewRenderer.prototype.setChildrenClippingParent = function(clippingParent) {
    if (this._children) {
        for (var i = 0, n = this._children.length; i < n; i++) {
            this._children[i].setClippingParent(clippingParent);
        }
    }
};

ViewRenderer.prototype.setClippingParent = function(clippingParent) {
    if (this._clippingParent !== clippingParent) {
        this._setRecalc(8);

        this._clippingParent = clippingParent;
        if (!this._clipping) {
            if (this._children) {
                for (var i = 0, n = this._children.length; i < n; i++) {
                    this._children[i].setClippingParent(clippingParent);
                }
            }
        }

    }
};

ViewRenderer.prototype.isVisible = function() {
    return (this._localAlpha > 1e-14);
};

ViewRenderer.prototype.update = function() {
    this._recalc |= this._parent._recalc;

    if (this._zSort) {
        // Make sure that all descendants are updated so that the updateTreeOrder flags are correctly set.
        this.ctx.updateTreeOrderForceUpdate++;
    }

    var forceUpdate = (this.ctx.updateTreeOrderForceUpdate > 0);
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
            var c1x, c1y, c2x, c2y, c3x, c3y;

            var cp = this._clippingParent;
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
                        var cornerPoints = [this._worldPx, this._worldPy, c1x, c1y, c2x, c2y, c3x, c3y];

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
            for (var i = 0, n = this._children.length; i < n; i++) {
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

ViewRenderer.prototype.sortZIndexedChildren = function() {
    // Insertion sort works best for almost correctly ordered arrays.
    for (var i = 1, n = this._zIndexedChildren.length; i < n; i++) {
        var a = this._zIndexedChildren[i];
        var j = i - 1;
        while (j >= 0) {
            var b = this._zIndexedChildren[j];
            if (!(a._zIndex === b._zIndex ? (a._updateTreeOrder < b._updateTreeOrder) : (a._zIndex < b._zIndex))) {
                break;
            }

            this._zIndexedChildren[j + 1] = this._zIndexedChildren[j];
            j--;
        }

        this._zIndexedChildren[j + 1] = a;
    }
};

ViewRenderer.prototype.addToVbo = function() {
    var vboIndex = this.ctx.vboIndex;
    var vboBufferFloat = this.ctx.vboBufferFloat;
    var vboBufferUint = this.ctx.vboBufferUint;

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
                vboBufferUint[vboIndex++] = getColorInt(this._colorBl, this._worldAlpha);
                this.ctx.addVboTextureSource(this._displayedTextureSource, 1);
            }
        } else {
            // Simple.
            var cx = this._worldPx + this._rw * this._worldTa;
            var cy = this._worldPy + this._rh * this._worldTd;

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
                vboBufferUint[vboIndex++] = getColorInt(this._colorBl, this._worldAlpha);
                this.ctx.addVboTextureSource(this._displayedTextureSource, 1);
            }
        }
    }
};

ViewRenderer.prototype.addToVboClipped = function() {
    var vboIndex = this.ctx.vboIndex;
    var vboBufferFloat = this.ctx.vboBufferFloat;
    var vboBufferUint = this.ctx.vboBufferUint;

    // Gradients are not supported for clipped quads.
    var c = getColorInt(this._colorUl, this._worldAlpha);

    if (this._clippingSquare) {
        // Inverse matrix.
        var ux = this._rw * this._worldTa;
        var vy = this._rh * this._worldTd;

        var d = 1 / (ux * vy);
        var invTa = vy * d;
        var invTd = ux * d;

        // Get ranges from 0 to 1.
        var tx1 = invTa * (this._clippingSquareMinX - this._worldPx);
        var ty1 = invTd * (this._clippingSquareMinY - this._worldPy);
        var tx3 = invTa * (this._clippingSquareMaxX - this._worldPx);
        var ty3 = invTd * (this._clippingSquareMaxY - this._worldPy);

        // Calculate texture coordinates for clipped corner points.
        var tcx1 = this._ulx * (1 - tx1) + this._brx * tx1;
        var tcy1 = this._uly * (1 - ty1) + this._bry * ty1;
        var tcx3 = this._ulx * (1 - tx3) + this._brx * tx3;
        var tcy3 = this._uly * (1 - ty3) + this._bry * ty3;

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
            vboBufferUint[vboIndex++] = c;
            this.ctx.addVboTextureSource(this._displayedTextureSource, 1);
        }
    } else {
        // Complex clipping.

        // Inverse matrix.
        var ux = this._rw * this._worldTa;
        var uy = this._rw * this._worldTc;
        var vx = this._rh * this._worldTb;
        var vy = this._rh * this._worldTd;

        var d = 1 / (ux * vy - vx * uy);
        var invTa = vy * d;
        var invTb = -vx * d;
        var invTc = -uy * d;
        var invTd = ux * d;

        var n = Math.ceil(((this._clippingArea.length / 2) - 2) / 2);

        if (n === 1) {
            // Texture coordinates.
            var tx1 = invTa * (this._clippingArea[0] - this._worldPx) + invTb * (this._clippingArea[1] - this._worldPy);
            var ty1 = invTc * (this._clippingArea[0] - this._worldPx) + invTd * (this._clippingArea[1] - this._worldPy);
            var tx2 = invTa * (this._clippingArea[2] - this._worldPx) + invTb * (this._clippingArea[3] - this._worldPy);
            var ty2 = invTc * (this._clippingArea[2] - this._worldPx) + invTd * (this._clippingArea[3] - this._worldPy);
            var tx3 = invTa * (this._clippingArea[4] - this._worldPx) + invTb * (this._clippingArea[5] - this._worldPy);
            var ty3 = invTc * (this._clippingArea[4] - this._worldPx) + invTd * (this._clippingArea[5] - this._worldPy);

            // Check for polygon instead of quad.
            var g = this._clippingArea.length <= 6 ? 4 : 6;
            var tx4 = invTa * (this._clippingArea[g] - this._worldPx) + invTb * (this._clippingArea[g + 1] - this._worldPy);
            var ty4 = invTc * (this._clippingArea[g] - this._worldPx) + invTd * (this._clippingArea[g + 1] - this._worldPy);

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
            var g;
            for (var i = 0; i < n; i++) {
                var b = i * 4 + 2;
                g = b + 4;
                if (g >= this._clippingArea.length) {
                    // Roll-over: convert polygon to quad.
                    g -= 2;
                }

                // Texture coordinates.
                var tx1 = invTa * (this._clippingArea[0] - this._worldPx) + invTb * (this._clippingArea[1] - this._worldPy);
                var ty1 = invTc * (this._clippingArea[0] - this._worldPx) + invTd * (this._clippingArea[1] - this._worldPy);
                var tx2 = invTa * (this._clippingArea[b] - this._worldPx) + invTb * (this._clippingArea[b + 1] - this._worldPy);
                var ty2 = invTc * (this._clippingArea[b] - this._worldPx) + invTd * (this._clippingArea[b + 1] - this._worldPy);
                var tx3 = invTa * (this._clippingArea[b + 2] - this._worldPx) + invTb * (this._clippingArea[b + 3] - this._worldPy);
                var ty3 = invTc * (this._clippingArea[b + 2] - this._worldPx) + invTd * (this._clippingArea[b + 3] - this._worldPy);
                var tx4 = invTa * (this._clippingArea[g] - this._worldPx) + invTb * (this._clippingArea[g + 1] - this._worldPy);
                var ty4 = invTc * (this._clippingArea[g] - this._worldPx) + invTd * (this._clippingArea[g + 1] - this._worldPy);

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

ViewRenderer.prototype.fillVbo = function() {
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
                for (var i = 0, n = this._zIndexedChildren.length; i < n; i++) {
                    this._zIndexedChildren[i].fillVbo();
                }
            } else {
                for (var i = 0, n = this._children.length; i < n; i++) {
                    if (this._children[i]._zIndex === 0) {
                        // If zIndex is set, this item already belongs to a zIndexedChildren array in one of the ancestors.
                        this._children[i].fillVbo();
                    }
                }
            }
        }
    }
};

Object.defineProperty(ViewRenderer.prototype, 'zIndex', {
    get: function () {
        return this._zIndex;
    },
    set: function(zIndex) {
        if (this._zIndex !== zIndex) {
            if (this._worldAlpha) this.ctx.staticStage = false;

            var newZParent = this._zParent;

            var prevIsZContext = this.isZContext();
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
    }
});

Object.defineProperty(ViewRenderer.prototype, 'forceZIndexContext', {
    get: function () {
        return this._forceZIndexContext;
    },
    set: function(v) {
        if (this._worldAlpha) this.ctx.staticStage = false;

        var prevIsZContext = this.isZContext();
        this._forceZIndexContext = v;

        if (prevIsZContext !== this.isZContext()) {
            if (!this.isZContext()) {
                this.disableZContext();
            } else {
                this.enableZContext(this._parent.findZContext());
            }
        }
    }
});

Object.defineProperty(ViewRenderer.prototype, 'colorUl', {
    get: function () {
        return this._colorUl;
    },
    set: function(color) {
        if (this._colorUl !== color) {
            if (this._worldAlpha) this.ctx.staticStage = false;
            this._colorUl = color;
        }
    }
});

Object.defineProperty(ViewRenderer.prototype, 'colorUr', {
    get: function () {
        return this._colorUr;
    },
    set: function(color) {
        if (this._colorUr !== color) {
            if (this._worldAlpha) this.ctx.staticStage = false;
            this._colorUr = color;
        }
    }
});

Object.defineProperty(ViewRenderer.prototype, 'colorBl', {
    get: function () {
        return this._colorBl;
    },
    set: function(color) {
        if (this._colorBl !== color) {
            if (this._worldAlpha) this.ctx.staticStage = false;
            this._colorBl = color;
        }
    }
});

Object.defineProperty(ViewRenderer.prototype, 'colorBr', {
    get: function () {
        return this._colorBr;
    },
    set: function(color) {
        if (this._colorBr !== color) {
            if (this._worldAlpha) this.ctx.staticStage = false;
            this._colorBr = color;
        }
    }
});

Object.defineProperty(ViewRenderer.prototype, 'localTa', {
    get: function () {
        return this._localTa;
    }
});

Object.defineProperty(ViewRenderer.prototype, 'localTb', {
    get: function () {
        return this._localTb;
    }
});

Object.defineProperty(ViewRenderer.prototype, 'localTc', {
    get: function () {
        return this._localTc;
    }
});

Object.defineProperty(ViewRenderer.prototype, 'localTd', {
    get: function () {
        return this._localTd;
    }
});

Object.defineProperty(ViewRenderer.prototype, 'rw', {
    get: function () {
        return this._rw;
    }
});

Object.defineProperty(ViewRenderer.prototype, 'rh', {
    get: function () {
        return this._rh;
    }
});

Object.defineProperty(ViewRenderer.prototype, 'clipping', {
    get: function () {
        return this._clipping;
    },
    set: function(clipping) {
        if (clipping !== this._clipping) {
            this._setRecalc(8);
            this._clipping = clipping;
            this.setChildrenClippingParent(clipping ? this : this._clippingParent);
        }
    }
});

ViewRenderer.prototype._parent = null;

ViewRenderer.prototype._hasUpdates = false;

ViewRenderer.prototype._recalc = 0;

ViewRenderer.prototype._worldAlpha = 1;

ViewRenderer.prototype._updateTreeOrder = 0;

// All local translation/transform updates: directly propagated from x/y/w/h/scale/whatever.
ViewRenderer.prototype._worldPx = ViewRenderer.prototype._localPx = 0;
ViewRenderer.prototype._worldPy = ViewRenderer.prototype._localPy = 0;

ViewRenderer.prototype._worldTa = ViewRenderer.prototype._localTa = 1;
ViewRenderer.prototype._worldTb = ViewRenderer.prototype._localTb = 0;
ViewRenderer.prototype._worldTc = ViewRenderer.prototype._localTc = 0;
ViewRenderer.prototype._worldTd = ViewRenderer.prototype._localTd = 1;

ViewRenderer.prototype._isComplex = false;

ViewRenderer.prototype._localAlpha = 1;

ViewRenderer.prototype._rw = 0;
ViewRenderer.prototype._rh = 0;

ViewRenderer.prototype._clipping = false;
ViewRenderer.prototype._clippingParent = null;

/**
 * In case of clipping, this flag indicates if we're dealing with a square-shaped clipping area.
 * @type {boolean}
 */
ViewRenderer.prototype._clippingSquare = false;

ViewRenderer.prototype._clippingSquareMinX = 0;
ViewRenderer.prototype._clippingSquareMaxX = 0;
ViewRenderer.prototype._clippingSquareMinY = 0;
ViewRenderer.prototype._clippingSquareMaxY = 0;

/**
 * Flag that indicates that clipping area is empty.
 * @type {boolean}
 */
ViewRenderer.prototype._clippingEmpty = false;

/**
 * Flag that indicates that the clipping area are the corner points.
 * @type {boolean}
 */
ViewRenderer.prototype._clippingNoEffect = false;

/**
 * In case of complex clipping, the corner points of the clipping area.
 * @type {number[]}
 */
ViewRenderer.prototype._clippingArea = null;

/**
 * The texture source to be displayed.
 * @type {TextureSource}
 */
ViewRenderer.prototype._displayedTextureSource = null;

ViewRenderer.prototype._colorUl = ViewRenderer.prototype._colorUr = ViewRenderer.prototype._colorBl = ViewRenderer.prototype._colorBr = 0xFFFFFFFF;

ViewRenderer.prototype._txCoordsUl = 0x00000000;
ViewRenderer.prototype._txCoordsUr = 0x0000FFFF;
ViewRenderer.prototype._txCoordsBr = 0xFFFFFFFF;
ViewRenderer.prototype._txCoordsBl = 0xFFFF0000;

ViewRenderer.prototype._ulx = 0;
ViewRenderer.prototype._uly = 0;
ViewRenderer.prototype._brx = 1;
ViewRenderer.prototype._bry = 1;

ViewRenderer.prototype._zIndex = 0;
ViewRenderer.prototype._forceZIndexContext = false;
ViewRenderer.prototype._zContextUsage = 0;
ViewRenderer.prototype._zParent = null;
ViewRenderer.prototype._zSort = false;

ViewRenderer.prototype._isRoot = false;

ViewRenderer.prototype._children = null;

ViewRenderer.prototype._zIndexedChildren = null;

var getColorInt = function (c, alpha) {
    var a = ((c / 16777216 | 0) * alpha) | 0;
    return (((((c >> 16) & 0xff) * a) >> 8) & 0xff) +
        ((((c & 0xff00) * a) >> 8) & 0xff00) +
        (((((c & 0xff) << 16) * a) >> 8) & 0xff0000) +
        (a << 24);
};

var getVboTextureCoords = function (x, y) {
    return ((x * 65535 + 0.5) | 0) + ((y * 65535 + 0.5) | 0) * 65536;
};

var GeometryUtils = require('./GeometryUtils');

module.exports = ViewRenderer;