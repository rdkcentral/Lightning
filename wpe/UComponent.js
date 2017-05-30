var isNode = !!(((typeof module !== "undefined") && module.exports));

if (isNode) {
    var Utils = require('./Utils');
}

var UComponent = function(ctx) {

    this.ctx = ctx;

    this.children = [];

    this.zIndexedChildren = [];

};

UComponent.prototype.component = null;

UComponent.prototype.hasTurtler = false;

UComponent.prototype.branchHasTurtlers = false;

UComponent.prototype.parent = null;

UComponent.prototype.hasUpdates = false;

UComponent.prototype.recalc = 0;

UComponent.prototype.worldAlpha = 1;

UComponent.prototype.updateTreeOrder = 0;

UComponent.prototype.hasBorders = false;

UComponent.prototype.hasChildren = false;

// All local translation/transform updates: directly propagated from x/y/w/h/scale/whatever.
UComponent.prototype.worldPx = UComponent.prototype.localPx = 0;
UComponent.prototype.worldPy = UComponent.prototype.localPy = 0;

UComponent.prototype.worldTa = UComponent.prototype.localTa = 1;
UComponent.prototype.worldTb = UComponent.prototype.localTb = 0;
UComponent.prototype.worldTc = UComponent.prototype.localTc = 0;
UComponent.prototype.worldTd = UComponent.prototype.localTd = 1;

UComponent.prototype.isComplex = false;

UComponent.prototype.localAlpha = 1;

UComponent.prototype.w = 0;
UComponent.prototype.h = 0;

UComponent.prototype.clipping = false;
UComponent.prototype.clippingParent = null;

/**
 * In case of clipping, this flag indicates if we're dealing with a square-shaped clipping area.
 * @type {boolean}
 */
UComponent.prototype.clippingSquare = false;

UComponent.prototype.clippingSquareMinX = 0;
UComponent.prototype.clippingSquareMaxX = 0;
UComponent.prototype.clippingSquareMinY = 0;
UComponent.prototype.clippingSquareMaxY = 0;

/**
 * Flag that indicates that clipping area is empty.
 * @type {boolean}
 */
UComponent.prototype.clippingEmpty = false;

/**
 * Flag that indicates that the clipping area are the corner points.
 * @type {boolean}
 */
UComponent.prototype.clippingNoEffect = false;

/**
 * In case of complex clipping, the corner points of the clipping area.
 * @type {number[]}
 */
UComponent.prototype.clippingArea = null;

/**
 * The texture source to be displayed.
 * @type {TextureSource}
 */
UComponent.prototype.displayedTextureSource = null;

UComponent.prototype.colorUl = UComponent.prototype.colorUr = UComponent.prototype.colorBl = UComponent.prototype.colorBr = 0xFFFFFFFF;

UComponent.prototype.txCoordsUl = 0x00000000;
UComponent.prototype.txCoordsUr = 0x0000FFFF;
UComponent.prototype.txCoordsBr = 0xFFFFFFFF;
UComponent.prototype.txCoordsBl = 0xFFFF0000;

UComponent.prototype.ulx = 0;
UComponent.prototype.uly = 0;
UComponent.prototype.brx = 1;
UComponent.prototype.bry = 1;

UComponent.prototype.inTextureAtlas = false;

UComponent.prototype.zIndex = 0;
UComponent.prototype.forceZIndexContext = false;
UComponent.prototype.zContextUsage = 0;
UComponent.prototype.zParent = null;
UComponent.prototype.zSort = false;

UComponent.prototype.borderTop = null;
UComponent.prototype.borderBottom = null;
UComponent.prototype.borderLeft = null;
UComponent.prototype.borderRight = null;

UComponent.prototype.isBorder = false;

UComponent.prototype.isRoot = false;


/**
 * @param {Number} type
 *   1: alpha
 *   2: translate
 *   4: transform
 *   8: clipping
 */
UComponent.prototype.setRecalc = function(type) {
    this.recalc |= type;

    if (this.worldAlpha) {
        this.ctx.staticStage = false;
        var p = this;
        do {
            p.hasUpdates = true;
        } while((p = p.parent) && !p.hasUpdates);
    } else {
        this.hasUpdates = true;
    }
};

UComponent.prototype.setRecalcForced = function(type, force) {
    this.recalc |= type;

    if (this.worldAlpha || force) {
        this.ctx.staticStage = false;
        var p = this;
        do {
            p.hasUpdates = true;
        } while((p = p.parent) && !p.hasUpdates);
    } else {
        this.hasUpdates = true;
    }
};

UComponent.prototype.setParent = function(parent) {
    if (parent !== this.parent) {
        var prevIsZContext = this.isZContext();
        var prevParent = this.parent;
        this.parent = parent;
        
        this.setRecalc(1 + 2 + 4);

        if (this.zIndex === 0) {
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

        var newClippingParent = parent ? (parent.clipping ? parent : parent.clippingParent) : null;
        if (this.isBorder && newClippingParent === this.parent) {
            // Borders should not be clipped by the immediate parent.
            newClippingParent = newClippingParent.clippingParent;
        }

        if (newClippingParent !== this.clippingParent) {
            this.setClippingParent(newClippingParent);
        }

        if (this.branchHasTurtlers) {
            if (parent) {
                parent.setBranchHasTurtlers();
            }
            if (prevParent) {
                prevParent.checkBranchHasTurtlers();
            }
        }
    }
};

UComponent.prototype.insertChild = function(index, child) {
    this.children.splice(index, 0, child);
    this.hasChildren = true;
    child.setParent(this);
};

UComponent.prototype.removeChild = function(index) {
    var child = this.children[index];
    this.children.splice(index, 1);
    this.hasChildren = (this.children.length > 0);
    child.setParent(null);
};

UComponent.prototype.clearChildren = function() {
    for (var i = 0, n = this.children.length; i < n; i++) {
        this.children[i].setParent(null);
    }

    this.children.splice(0);
    this.zIndexedChildren.splice(0);

    this.hasChildren = false;
};

UComponent.prototype.setLocalTransform = function(a, b, c, d) {
    this.setRecalc(4);
    this.localTa = a;
    this.localTb = b;
    this.localTc = c;
    this.localTd = d;
    this.isComplex = (b != 0) || (c != 0);
};

UComponent.prototype.setLocalTranslate = function(x, y) {
    this.setRecalc(2);
    if (this.turtle) {
        if (this.localPx !== x) {
            this.turtle.x = x;
        }
        if (this.localPy !== y) {
            this.turtle.y = y;
        }
    }

    this.localPx = x;
    this.localPy = y;
};

UComponent.prototype.addLocalTranslate = function(x, y) {
    this.setLocalTranslate(this.localPx + x, this.localPy + y);
};

UComponent.prototype.setLocalAlpha = function(a) {
    this.setRecalcForced(1, (this.parent && this.parent.worldAlpha) && a);

    if (a < 1e-14) {
        // Tiny rounding errors may cause failing visibility tests.
        a = 0;
    }

    this.localAlpha = a;
};

UComponent.prototype.setTurtleInvisible = function(v) {
    // Specifies whether to run turtle on this component + branch, even when this component is invisible.
    if (!this.parent || this.parent.shouldRunTurtle()) {
        var prev = this.shouldRunTurtle();
        this.turtleInvisible = v;
        if (this.shouldRunTurtle() !== prev) {
            // Force re-rendering because the turtles may cause a different positioning.
            // We need to force a re-render so that the turtle will be checked.
            this.ctx.staticStage = false;
        }
    } else {
        this.turtleInvisible = v;
    }

};

UComponent.prototype.setDimensions = function(w, h) {
    if (this.turtle) {
        if (this.w !== w) {
            this.turtle.w = w;
        }
        if (this.h !== h) {
            this.turtle.h = h;
        }
    }

    this.w = w;
    this.h = h;
    this.setRecalc(2);

    // Border updates.
    this.updateBorderDimensions();

};

UComponent.prototype.updateBorderDimensions = function() {
    var w = this.w;
    var h = this.h;

    var blw = 0, brw = 0;
    if (this.borderLeft !== null) {
        this.borderLeft.setDimensions(this.borderLeft.w, h);
        this.borderLeft.setLocalTranslate(-this.borderLeft.w, 0);
        blw = this.borderLeft.w;
    }

    if (this.borderRight !== null) {
        this.borderRight.setDimensions(this.borderRight.w, h);
        this.borderRight.setLocalTranslate(w, 0);
        brw = this.borderRight.w;
    }

    if (this.borderTop !== null) {
        this.borderTop.setDimensions(w + blw + brw, this.borderTop.h);
        this.borderTop.setLocalTranslate(0 - blw, -this.borderTop.h);
    }

    if (this.borderBottom !== null) {
        this.borderBottom.setDimensions(w + blw + brw, this.borderBottom.h);
        this.borderBottom.setLocalTranslate(0 - blw, h);
    }
};

UComponent.prototype.setTextureCoords = function(ulx, uly, brx, bry) {
    if (this.worldAlpha) this.ctx.staticStage = false;

    this.ulx = ulx;
    this.uly = uly;
    this.brx = brx;
    this.bry = bry;

    this.txCoordsUl = ((ulx * 65535 + 0.5)|0) + ((uly * 65535 + 0.5)|0) * 65536;
    this.txCoordsUr = ((brx * 65535 + 0.5)|0) + ((uly * 65535 + 0.5)|0) * 65536;
    this.txCoordsBl = ((ulx * 65535 + 0.5)|0) + ((bry * 65535 + 0.5)|0) * 65536;
    this.txCoordsBr = ((brx * 65535 + 0.5)|0) + ((bry * 65535 + 0.5)|0) * 65536;
};

UComponent.prototype.setDisplayedTextureSource = function(textureSource) {
    if (this.worldAlpha) this.ctx.staticStage = false;
    this.displayedTextureSource = textureSource;
};

UComponent.prototype.setInTextureAtlas = function(inTextureAtlas) {
    if (this.worldAlpha) this.ctx.staticStage = false;

    this.inTextureAtlas = inTextureAtlas;
};

UComponent.prototype.setAsRoot = function() {
    // Use parent dummy.
    this.parent = new UComponent();

    // Root is, and will always be, the primary zContext.
    this.isRoot = true;

    this.ctx.root = this;
};

UComponent.prototype.isAncestorOf = function(c) {
    var p = c;
    while(p = p.parent) {
        if (this === p) {
            return true;
        }
    }
    return false;
};

UComponent.prototype.isZContext = function() {
    return (this.forceZIndexContext || this.zIndex !== 0 || this.isRoot || !this.parent);
};

UComponent.prototype.findZContext = function() {
    if (this.isZContext()) {
        return this;
    } else {
        return this.parent.findZContext();
    }
};

UComponent.prototype.setZParent = function(newZParent) {
    if (this.zParent !== newZParent) {
        if (this.zParent !== null) {
            // @pre: old parent's children array has already been modified.
            if (this.zIndex !== 0) {
                this.zParent.decZContextUsage();
            }

            if (this.zParent.zContextUsage > 0) {
                var index = this.zParent.zIndexedChildren.indexOf(this);
                this.zParent.zIndexedChildren.splice(index, 1);
            }
        }

        if (newZParent !== null) {
            var hadZContextUsage = (newZParent.zContextUsage > 0);

            // @pre: new parent's children array has already been modified.
            if (this.zIndex !== 0) {
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

UComponent.prototype.incZContextUsage = function() {
    this.zContextUsage++;
    if (this.zContextUsage === 1) {
        // Copy.
        for (var i = 0, n = this.children.length; i < n; i++) {
            this.zIndexedChildren.push(this.children[i]);
        }
    }
};

UComponent.prototype.decZContextUsage = function() {
    this.zContextUsage--;
    if (this.zContextUsage === 0) {
        this.zSort = false;
        this.zIndexedChildren.splice(0);
    }
};

UComponent.prototype.setZIndex = function(zIndex) {
    if (this.worldAlpha) this.ctx.staticStage = false;

    var newZParent = this.zParent;

    var prevIsZContext = this.isZContext();
    if (zIndex === 0 && this.zIndex !== 0) {
        if (this.parent === this.zParent) {
            this.zParent.decZContextUsage();
        } else {
            newZParent = this.parent;
        }
    } else if (zIndex !== 0 && this.zIndex === 0) {
        newZParent = this.parent ? this.parent.findZContext() : null;
        if (newZParent === this.zParent) {
            if (this.zParent) {
                this.zParent.incZContextUsage();
                this.zParent.zSort = true;
            }
        }
    } else if (zIndex !== this.zIndex) {
        this.zParent.zSort = true;
    }

    if (newZParent !== this.zParent) {
        this.setZParent(null);
    }

    this.zIndex = zIndex;

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
};

UComponent.prototype.setForceZIndexContext = function(v) {
    if (this.worldAlpha) this.ctx.staticStage = false;

    var prevIsZContext = this.isZContext();
    this.forceZIndexContext = v;

    if (prevIsZContext !== this.isZContext()) {
        if (!this.isZContext()) {
            this.disableZContext();
        } else {
            this.enableZContext(this.parent.findZContext());
        }
    }
};

UComponent.prototype.enableZContext = function(prevZContext) {
    if (prevZContext.zContextUsage > 0) {
        var self = this;
        // Transfer from upper z context to this z context.
        prevZContext.zIndexedChildren.slice().forEach(function(c) {
            if (self.isAncestorOf(c) && c.zIndex !== 0) {
                c.setZParent(self);
            }
        });
    }
};

UComponent.prototype.disableZContext = function() {
    // Transfer from this z context to upper z context.
    if (this.zContextUsage > 0) {
        var newZParent = this.parent.findZContext();

        this.zIndexedChildren.slice().forEach(function(c) {
            if (c.zIndex !== 0) {
                c.setZParent(newZParent);
            }
        });
    }
};

UComponent.prototype.setClipping = function(clipping) {
    if (clipping !== this.clipping) {
        this.setRecalc(8);
        this.clipping = clipping;
        this.setChildrenClippingParent(clipping ? this : this.clippingParent);
    }
};

UComponent.prototype.setChildrenClippingParent = function(clippingParent) {
    for (var i = 0, n = this.children.length; i < n; i++) {
        this.children[i].setClippingParent(clippingParent);
    }
};

UComponent.prototype.setClippingParent = function(clippingParent) {
    if (this.clippingParent !== clippingParent) {
        this.setRecalc(8);

        this.clippingParent = clippingParent;
        if (!this.clipping) {
            for (var i = 0, n = this.children.length; i < n; i++) {
                this.children[i].setClippingParent(clippingParent);
            }
        }

        if (this.hasBorders) {
            if (this.borderTop) this.borderTop.setClippingParent(clippingParent);
            if (this.borderBottom) this.borderBottom.setClippingParent(clippingParent);
            if (this.borderLeft) this.borderLeft.setClippingParent(clippingParent);
            if (this.borderRight) this.borderRight.setClippingParent(clippingParent);
        }
    }
};

UComponent.prototype.setColorUl = function(color) {
    if (this.worldAlpha) this.ctx.staticStage = false;
    this.colorUl = color;
};

UComponent.prototype.setColorUr = function(color) {
    if (this.worldAlpha) this.ctx.staticStage = false;
    this.colorUr = color;
};

UComponent.prototype.setColorBl = function(color) {
    if (this.worldAlpha) this.ctx.staticStage = false;
    this.colorBl = color;
};

UComponent.prototype.setColorBr = function(color) {
    if (this.worldAlpha) this.ctx.staticStage = false;
    this.colorBr = color;
};

UComponent.prototype.setBorderTop = function(width, color) {
    if (this.worldAlpha) this.ctx.staticStage = false;
    if (this.borderTop === null) {
        this.borderTop = this.ctx.createUComponent();
        this.borderTop.isBorder = true;
        this.borderTop.setParent(this);
        this.borderTop.displayedTextureSource = this.ctx.rectangleTextureSource;

        // We assume that, if a texture atlas is being used, that the rectangle is in the upper left corner.
        this.borderTop.setTextureCoords(0, 0, 0, 0);
    }
    this.borderTop.setDimensions(this.w, width);
    this.borderTop.setLocalTranslate(0, -width);
    this.borderTop.colorUl = color;
    this.borderTop.colorUr = color;
    this.borderTop.colorBr = color;
    this.borderTop.colorBl = color;

    this.updateBorderDimensions();
    this.updateHasBorders();
};

UComponent.prototype.setBorderBottom = function(width, color) {
    if (this.worldAlpha) this.ctx.staticStage = false;
    if (this.borderBottom === null) {
        this.borderBottom = this.ctx.createUComponent();
        this.borderBottom.isBorder = true;
        this.borderBottom.setParent(this);
        this.borderBottom.displayedTextureSource = this.ctx.rectangleTextureSource;

        // We assume that, if a texture atlas is being used, that the rectangle is in the upper left corner.
        this.borderBottom.setTextureCoords(0, 0, 0, 0);
    }
    this.borderBottom.setDimensions(this.w, width);
    this.borderBottom.setLocalTranslate(0, this.h);
    this.borderBottom.colorUl = color;
    this.borderBottom.colorUr = color;
    this.borderBottom.colorBr = color;
    this.borderBottom.colorBl = color;

    this.updateBorderDimensions();
    this.updateHasBorders();
};

UComponent.prototype.setBorderLeft = function(width, color) {
    if (this.worldAlpha) this.ctx.staticStage = false;
    if (this.borderLeft === null) {
        this.borderLeft = this.ctx.createUComponent();
        this.borderLeft.isBorder = true;
        this.borderLeft.setParent(this);
        this.borderLeft.displayedTextureSource = this.ctx.rectangleTextureSource;

        // We assume that, if a texture atlas is being used, that the rectangle is in the upper left corner.
        this.borderLeft.setTextureCoords(0, 0, 0, 0);
    }
    this.borderLeft.setDimensions(width, this.h);
    this.borderLeft.setLocalTranslate(-width, 0);
    this.borderLeft.colorUl = color;
    this.borderLeft.colorUr = color;
    this.borderLeft.colorBr = color;
    this.borderLeft.colorBl = color;

    this.updateBorderDimensions();
    this.updateHasBorders();
};

UComponent.prototype.setBorderRight = function(width, color) {
    if (this.worldAlpha) this.ctx.staticStage = false;
    if (this.borderRight === null) {
        this.borderRight = this.ctx.createUComponent();
        this.borderRight.isBorder = true;
        this.borderRight.setParent(this);
        this.borderRight.displayedTextureSource = this.ctx.rectangleTextureSource;

        // We assume that, if a texture atlas is being used, that the rectangle is in the upper left corner.
        this.borderRight.setTextureCoords(0, 0, 0, 0);
    }
    this.borderRight.setDimensions(width, this.h);
    this.borderRight.setLocalTranslate(this.w, 0);
    this.borderRight.colorUl = color;
    this.borderRight.colorUr = color;
    this.borderRight.colorBr = color;
    this.borderRight.colorBl = color;

    this.updateBorderDimensions();
    this.updateHasBorders();
};

UComponent.prototype.updateHasBorders = function() {
    this.hasBorders = (this.borderTop !== null && this.borderTop.h)
        || (this.borderBottom !== null && this.borderBottom.h)
        || (this.borderLeft !== null && this.borderLeft.w)
        || (this.borderRight !== null && this.borderRight.w)
};

/**
 * Returns an object that can be used to customize the positioning.
 */
UComponent.prototype.getTurtle = function() {
    if (!this.turtle) {
        this.turtle = new Turtle(this);
    }
    return this.turtle;
};

UComponent.prototype.isVisible = function() {
    return (this.localAlpha > 1e-14);
};

UComponent.prototype.shouldRunTurtle = function() {
    return this.isVisible() || this.turtleInvisible;
};


UComponent.prototype.runTurtles = function() {
    if (this.shouldRunTurtle()) {
        if (this.turtle) {
            this.turtle.fresh = false;
        }

        if (this.hasTurtler) {
            // Custom positioning function.
            // Warning: do not add/remove children on already visited components because of the recursiveness.
            var turtle = this.getTurtle();
            if (turtle.altered) {
                // This can happen if the component with an altered turtle became invisible during a previous runTurtles.
                turtle.update();
                turtle.altered = false;
            }
            this.component.turtler(turtle);
            if (turtle.altered) {
                // Dimensions and/or position have been changed.
                // Make sure that the component is re-calculated.
                this.setRecalc(2);
            }
        }

        if (this.hasChildren) {
            for (var i = 0, n = this.children.length; i < n; i++) {
                if (this.children[i].branchHasTurtlers) {
                    this.children[i].runTurtles();
                }
            }
        }
    }
};

UComponent.prototype.update = function() {
    this.recalc |= this.parent.recalc;

    if (this.zSort) {
        // Make sure that all descendants are updated so that the updateTreeOrder flags are correctly set.
        this.ctx.updateTreeOrderForceUpdate++;
    }

    var forceUpdate = (this.ctx.updateTreeOrderForceUpdate > 0);
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
        if (this.turtle && this.turtle.altered) {
            this.turtle.swapRealValues();
        }

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

        if ((this.recalc & 14 /* 2 + 4 + 8 */) && (this.clippingParent || this.clipping)) {
            // We must calculate the clipping area.
            var c1x, c1y, c2x, c2y, c3x, c3y;

            var cp = this.clippingParent;
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

                        c2x = this.worldPx + this.w * this.worldTa;
                        c2y = this.worldPy + this.h * this.worldTd;

                        this.clippingSquareMinX = this.worldPx;
                        this.clippingSquareMaxX = c2x;
                        this.clippingSquareMinY = this.worldPy;
                        this.clippingSquareMaxY = c2y;

                        if ((this.clippingSquareMinX >= cp.clippingSquareMinX) && (this.clippingSquareMaxX <= cp.clippingSquareMaxX) && (this.clippingSquareMinY >= cp.clippingSquareMinY) && (this.clippingSquareMaxY <= cp.clippingSquareMaxY)) {
                            // No effect.
                            this.clippingNoEffect = true;

                            if (this.clipping) {
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
                        c1x = this.worldPx + this.w * this.worldTa;
                        c1y = this.worldPy + this.w * this.worldTc;
                        c2x = this.worldPx + this.w * this.worldTa + this.h * this.worldTb;
                        c2y = this.worldPy + this.w * this.worldTc + this.h * this.worldTd;
                        c3x = this.worldPx + this.h * this.worldTb;
                        c3y = this.worldPy + this.h * this.worldTd;

                        // Complex shape.
                        this.clippingSquare = false;
                        var cornerPoints = [this.worldPx, this.worldPy, c1x, c1y, c2x, c2y, c3x, c3y];

                        if (cp.clippingSquare && !cp.clippingArea) {
                            // We need a clipping area to use for intersection.
                            cp.clippingArea = [cp.clippingSquareMinX, cp.clippingSquareMinY, cp.clippingSquareMaxX, cp.clippingSquareMinY, cp.clippingSquareMaxX, cp.clippingSquareMaxY, cp.clippingSquareMinX, cp.clippingSquareMaxY];
                        }

                        this.clippingArea = GeometryUtils.intersectConvex(cp.clippingArea, cornerPoints);
                        this.clippingEmpty = (this.clippingArea.length === 0);
                        this.clippingNoEffect = (cornerPoints === this.clippingArea);
                    }
                } else {
                    c1x = this.worldPx + this.w * this.worldTa;
                    c3y = this.worldPy + this.h * this.worldTd;

                    // Just use the corner points.
                    if (this.worldTb === 0 && this.worldTc === 0 && this.worldTa > 0 && this.worldTd > 0) {
                        // Square.
                        this.clippingSquare = true;
                        if (this.clipping) {
                            this.clippingSquareMinX = this.worldPx;
                            this.clippingSquareMaxX = c1x;
                            this.clippingSquareMinY = this.worldPy;
                            this.clippingSquareMaxY = c3y;
                        }
                        this.clippingEmpty = false;
                        this.clippingNoEffect = true;
                    } else {
                        c1y = this.worldPy + this.w * this.worldTc;
                        c2x = this.worldPx + this.w * this.worldTa + this.h * this.worldTb;
                        c2y = this.worldPy + this.w * this.worldTc + this.h * this.worldTd;
                        c3x = this.worldPx + this.h * this.worldTb;

                        // Complex shape.
                        this.clippingSquare = false;
                        if (this.clipping) {
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

        this.recalc = (this.recalc & 7); /* 1+2+4 */

        if (this.hasBorders) {
            if (this.turtle && this.turtle.altered) {
                // Turtle has modified dimensions: we should update border dimensions.
                this.updateBorderDimensions();
            }

            if (this.borderTop !== null && this.borderTop.h) {
                this.borderTop.update();
            }

            if (this.borderBottom !== null && this.borderBottom.h) {
                this.borderBottom.update();
            }

            if (this.borderLeft !== null && this.borderLeft.w) {
                this.borderLeft.update();
            }

            if (this.borderRight !== null && this.borderRight.w) {
                this.borderRight.update();
            }
        }

        if (!this.ctx.useZIndexing) {
            // When using z-indexing, restore is done in fillVbo().
            if (this.turtle && this.turtle.altered) {
                this.turtle.restoreRealValues();
            }
        }

        if (this.hasChildren) {
            for (var i = 0, n = this.children.length; i < n; i++) {
                if ((this.ctx.updateTreeOrderForceUpdate > 0) || this.recalc || this.children[i].hasUpdates) {
                    this.children[i].update();
                } else if (!this.ctx.useZIndexing) {
                    this.children[i].fillVbo();
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

UComponent.prototype.sortZIndexedChildren = function() {
    // Insertion sort works best for almost correctly ordered arrays.
    for (var i = 1, n = this.zIndexedChildren.length; i < n; i++) {
        var a = this.zIndexedChildren[i];
        var j = i - 1;
        while (j >= 0) {
            var b = this.zIndexedChildren[j];
            if (!(a.zIndex === b.zIndex ? (a.updateTreeOrder < b.updateTreeOrder) : (a.zIndex < b.zIndex))) {
                break;
            }

            this.zIndexedChildren[j+1] = this.zIndexedChildren[j];
            j--;
        }

        this.zIndexedChildren[j+1] = a;
    }
};

UComponent.prototype.addToVbo = function() {
    var vboIndex = this.ctx.vboIndex;
    var vboBufferFloat = this.ctx.vboBufferFloat;
    var vboBufferUint = this.ctx.vboBufferUint;

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
                vboBufferFloat[vboIndex++] = this.worldPx + this.w * this.worldTa;
                vboBufferFloat[vboIndex++] = this.worldPy + this.w * this.worldTc;
                vboBufferUint[vboIndex++] = this.txCoordsUr;
                vboBufferUint[vboIndex++] = getColorInt(this.colorUr, this.worldAlpha);
                vboBufferFloat[vboIndex++] = this.worldPx + this.w * this.worldTa + this.h * this.worldTb;
                vboBufferFloat[vboIndex++] = this.worldPy + this.w * this.worldTc + this.h * this.worldTd;
                vboBufferUint[vboIndex++] = this.txCoordsBr;
                vboBufferUint[vboIndex++] = getColorInt(this.colorBr, this.worldAlpha);
                vboBufferFloat[vboIndex++] = this.worldPx + this.h * this.worldTb;
                vboBufferFloat[vboIndex++] = this.worldPy + this.h * this.worldTd;
                vboBufferUint[vboIndex++] = this.txCoordsBl;
                vboBufferUint[vboIndex++] = getColorInt(this.colorBl, this.worldAlpha);
                this.ctx.addVboTextureSource(this, 1);
            }
        } else {
            // Simple.
            var cx = this.worldPx + this.w * this.worldTa;
            var cy = this.worldPy + this.h * this.worldTd;

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

UComponent.prototype.addToVboClipped = function() {
    var vboIndex = this.ctx.vboIndex;
    var vboBufferFloat = this.ctx.vboBufferFloat;
    var vboBufferUint = this.ctx.vboBufferUint;

    // Gradients are not supported for clipped quads.
    var c = getColorInt(this.colorUl, this.worldAlpha);

    if (this.clippingSquare) {
        // Inverse matrix.
        var ux = this.w * this.worldTa;
        var vy = this.h * this.worldTd;

        var d = 1 / (ux * vy);
        var invTa = vy * d;
        var invTd = ux * d;

        // Get ranges from 0 to 1.
        var tx1 = invTa * (this.clippingSquareMinX - this.worldPx);
        var ty1 = invTd * (this.clippingSquareMinY - this.worldPy);
        var tx3 = invTa * (this.clippingSquareMaxX - this.worldPx);
        var ty3 = invTd * (this.clippingSquareMaxY - this.worldPy);

        // Calculate texture coordinates for clipped corner points.
        var tcx1 = this.ulx * (1 - tx1) + this.brx * tx1;
        var tcy1 = this.uly * (1 - ty1) + this.bry * ty1;
        var tcx3 = this.ulx * (1 - tx3) + this.brx * tx3;
        var tcy3 = this.uly * (1 - ty3) + this.bry * ty3;

        if (vboIndex < 262144) {
            vboBufferFloat[vboIndex++] = this.clippingSquareMinX;
            vboBufferFloat[vboIndex++] = this.clippingSquareMinY;
            vboBufferUint[vboIndex++] =  getVboTextureCoords(tcx1, tcy1);
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
        ux = this.w * this.worldTa;
        var uy = this.w * this.worldTc;
        var vx = this.h * this.worldTb;
        vy = this.h * this.worldTd;

        d = 1 / (ux * vy - vx * uy);
        invTa = vy * d;
        var invTb = -vx * d;
        var invTc = -uy * d;
        invTd = ux * d;

        var n = Math.ceil(((this.clippingArea.length / 2) - 2) / 2);

        if (n === 1) {
            // Texture coordinates.
            tx1 = invTa * (this.clippingArea[0] - this.worldPx) + invTb * (this.clippingArea[1] - this.worldPy);
            ty1 = invTc * (this.clippingArea[0] - this.worldPx) + invTd * (this.clippingArea[1] - this.worldPy);
            var tx2 = invTa * (this.clippingArea[2] - this.worldPx) + invTb * (this.clippingArea[3] - this.worldPy);
            var ty2 = invTc * (this.clippingArea[2] - this.worldPx) + invTd * (this.clippingArea[3] - this.worldPy);
            tx3 = invTa * (this.clippingArea[4] - this.worldPx) + invTb * (this.clippingArea[5] - this.worldPy);
            ty3 = invTc * (this.clippingArea[4] - this.worldPx) + invTd * (this.clippingArea[5] - this.worldPy);

            // Check for polygon instead of quad.
            g = this.clippingArea.length <= 6 ? 4 : 6;
            var tx4 = invTa * (this.clippingArea[g] - this.worldPx) + invTb * (this.clippingArea[g + 1] - this.worldPy);
            var ty4 = invTc * (this.clippingArea[g] - this.worldPx) + invTd * (this.clippingArea[g + 1] - this.worldPy);

            if (vboIndex < 262144) {
                vboBufferFloat[vboIndex++] = this.clippingArea[0];
                vboBufferFloat[vboIndex++] = this.clippingArea[1];
                vboBufferUint[vboIndex++] =  getVboTextureCoords(this.ulx * (1 - tx1) + this.brx * tx1, this.uly * (1 - ty1) + this.bry * ty1);
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
                vboBufferUint[vboIndex++] = c;
                this.ctx.addVboTextureSource(this, 1);
            }
        } else {
            // Multiple quads.
            var g;
            for (var i = 0; i < n; i++) {
                var b = i * 4 + 2;
                g = b + 4;
                if (g >= this.clippingArea.length) {
                    // Roll-over: convert polygon to quad.
                    g -= 2;
                }

                // Texture coordinates.
                tx1 = invTa * (this.clippingArea[0] - this.worldPx) + invTb * (this.clippingArea[1] - this.worldPy);
                ty1 = invTc * (this.clippingArea[0] - this.worldPx) + invTd * (this.clippingArea[1] - this.worldPy);
                tx2 = invTa * (this.clippingArea[b] - this.worldPx) + invTb * (this.clippingArea[b+1] - this.worldPy);
                ty2 = invTc * (this.clippingArea[b] - this.worldPx) + invTd * (this.clippingArea[b+1] - this.worldPy);
                tx3 = invTa * (this.clippingArea[b+2] - this.worldPx) + invTb * (this.clippingArea[b+3] - this.worldPy);
                ty3 = invTc * (this.clippingArea[b+2] - this.worldPx) + invTd * (this.clippingArea[b+3] - this.worldPy);
                tx4 = invTa * (this.clippingArea[g] - this.worldPx) + invTb * (this.clippingArea[g+1] - this.worldPy);
                ty4 = invTc * (this.clippingArea[g] - this.worldPx) + invTd * (this.clippingArea[g+1] - this.worldPy);

                if (vboIndex < 262144) {
                    vboBufferFloat[vboIndex++] = this.clippingArea[0];
                    vboBufferFloat[vboIndex++] = this.clippingArea[1];
                    vboBufferUint[vboIndex++] =  getVboTextureCoords(this.ulx * (1 - tx1) + this.brx * tx1, this.uly * (1 - ty1) + this.bry * ty1);
                    vboBufferUint[vboIndex++] = c;
                    vboBufferFloat[vboIndex++] = this.clippingArea[b];
                    vboBufferFloat[vboIndex++] = this.clippingArea[b+1];
                    vboBufferUint[vboIndex++] = getVboTextureCoords(this.ulx * (1 - tx2) + this.brx * tx2, this.uly * (1 - ty2) + this.bry * ty2);
                    vboBufferUint[vboIndex++] = c;
                    vboBufferFloat[vboIndex++] = this.clippingArea[b+2];
                    vboBufferFloat[vboIndex++] = this.clippingArea[b+3];
                    vboBufferUint[vboIndex++] = getVboTextureCoords(this.ulx * (1 - tx3) + this.brx * tx3, this.uly * (1 - ty3) + this.bry * ty3);
                    vboBufferUint[vboIndex++] = c;
                    vboBufferFloat[vboIndex++] = this.clippingArea[g];
                    vboBufferFloat[vboIndex++] = this.clippingArea[g+1];
                    vboBufferUint[vboIndex++] = getVboTextureCoords(this.ulx * (1 - tx4) + this.brx * tx4, this.uly * (1 - ty4) + this.bry * ty4);
                    vboBufferUint[vboIndex++] = c;
                    this.ctx.addVboTextureSource(this, 1);
                }
            }
        }
    }
};

UComponent.prototype.fillVbo = function() {
    if (this.zSort) {
        this.sortZIndexedChildren();
        this.zSort = false;
    }

    if (this.worldAlpha) {
        if (this.displayedTextureSource) {
            this.addToVbo();
        }

        if (this.hasBorders) {
            if (this.borderTop !== null && this.borderTop.h) {
                this.borderTop.addToVbo();
            }

            if (this.borderBottom !== null && this.borderBottom.h) {
                this.borderBottom.addToVbo();
            }

            if (this.borderLeft !== null && this.borderLeft.w) {
                this.borderLeft.addToVbo();
            }

            if (this.borderRight !== null && this.borderRight.w) {
                this.borderRight.addToVbo();
            }
        }

        if (this.turtle && this.turtle.altered) {
            this.turtle.restoreRealValues();
        }

        if (this.hasChildren) {
            if (this.zContextUsage) {
                for (var i = 0, n = this.zIndexedChildren.length; i < n; i++) {
                    this.zIndexedChildren[i].fillVbo();
                }
            } else {
                for (var i = 0, n = this.children.length; i < n; i++) {
                    if (this.children[i].zIndex === 0) {
                        // If zIndex is set, this item already belongs to a zIndexedChildren array in one of the ancestors.
                        this.children[i].fillVbo();
                    }
                }
            }
        }
    }
};

UComponent.prototype.getLocalTa = function() {
    return this.localTa;
};

UComponent.prototype.getLocalTb = function() {
    return this.localTb;
};

UComponent.prototype.getLocalTc = function() {
    return this.localTc;
};

UComponent.prototype.getLocalTd = function() {
    return this.localTd;
};

UComponent.prototype.getCornerPoints = function() {
    return [
        this.worldPx,
        this.worldPy,
        this.worldPx + this.w * this.worldTa,
        this.worldPy + this.w * this.worldTc,
        this.worldPx + this.w * this.worldTa + this.h * this.worldTb,
        this.worldPy + this.w * this.worldTc + this.h * this.worldTd,
        this.worldPx + this.h * this.worldTb,
        this.worldPy + this.h * this.worldTd
    ];
};

UComponent.prototype.setHasTurtler = function(v) {
    this.hasTurtler = v;

    // Turtler has changed, so we need to recalc the translation vector.
    this.setRecalc(2);
    
    if (this.hasTurtler) {
        this.setBranchHasTurtlers();
    } else {
        // Check if any child has turtlers.
        this.checkBranchHasTurtlers();
    }
};

UComponent.prototype.setBranchHasTurtlers = function() {
    var p = this;
    do {
        p.branchHasTurtlers = true;
    } while((p = p.parent) && !p.branchHasTurtlers);
};

UComponent.prototype.checkBranchHasTurtlers = function() {
    var branchHasTurtlers = false;
    for (var i = 0, n = this.children.length; i < n; i++) {
        branchHasTurtlers = branchHasTurtlers || this.children[i].branchHasTurtlers;
    }
    if (branchHasTurtlers) {
        this.setBranchHasTurtlers();
    } else {
        this.branchHasTurtlers = false;
    }
};

var getColorInt = function(c, alpha) {
    var a = ((c / 16777216 | 0) * alpha) | 0;
    return (((((c >> 16) & 0xff) * a) >> 8) & 0xff) +
        ((((c & 0xff00) * a) >> 8) & 0xff00) +
        (((((c & 0xff) << 16) * a) >> 8) & 0xff0000) +
        (a << 24);
};

var getVboTextureCoords = function(x, y) {
    return ((x * 65535 + 0.5)|0) + ((y * 65535 + 0.5)|0) * 65536;
};


if (isNode) {
    module.exports = UComponent;
    var GeometryUtils = require('./GeometryUtils');
    var Turtle = require('./Turtle');
}