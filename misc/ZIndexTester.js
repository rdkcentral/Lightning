var ZIndexTester = function(stage) {
    this.stage = stage;
};

ZIndexTester.prototype.test = function() {
    this.ctr = 0;
    this.markPosition(this.stage.root);

    var ref = this.getZIndexedMain(this.stage.root);

    var res = this.getZIndexedFastMain(this.stage.root);

    if (ref.length != res.length) {
        console.error('Difference in ref length: ' + res.length + ' should be ' + ref.length);
    } else {
        for (var i = 0, n = ref.length; i < n; i++) {
            if (ref[i] !== res[i]) {
                console.error('Difference at pos ' + i);
                for (var i = 0, n = ref.length; i < n; i++) {
                    var zc = res[i].uComponent.parent.findZContext();
                    console.log(i + '.res: ' + res[i].getLocationString() + ' ' + res[i].zIndex + (res[i].uComponent.forceZIndexContext ? ' C ' : '') + ' ' + zc.c.getLocationString() + ' ' + zc.c.zIndex + (zc.forceZIndexContext ? ' C ' : '') + ' o:' + zc.updateTreeOrder);
                }
                for (var i = 0, n = ref.length; i < n; i++) {
                    var zc = ref[i].uComponent.parent.findZContext();
                    console.log(i + '.ref: ' + ref[i].getLocationString() + ' ' + ref[i].zIndex + (ref[i].uComponent.forceZIndexContext ? ' C ' : '') + ' ' + zc.c.getLocationString() + ' ' + zc.c.zIndex + (zc.forceZIndexContext ? ' C ' : '') + ' o:' + zc.updateTreeOrder);
                }
                debugger;
                return;
            }
        }
    }
};

ZIndexTester.prototype.markPosition = function(c) {
    c.ctr = this.ctr++;
    var n = c.children.length;
    for (var i = 0; i < n; i++) {
        this.markPosition(c.children[i]);
    }
};

ZIndexTester.prototype.dbg = function(set) {
    return set.map(function(c) {
        var zc = c.uComponent.parent.findZContext();
        return c.getLocationString() + ' ' + c.zIndex + (c.uComponent.forceZIndexContext ? ' C ' : '') + ' ' + zc.c.getLocationString() + ' ' + zc.c.zIndex + (zc.forceZIndexContext ? ' C ' : '') + ' o:' + zc.updateTreeOrder;
    });
};

ZIndexTester.prototype.getZIndexedMain = function(c) {
    var all = [];
    var zs = [];

    if (c.displayedTexture || c.uComponent.hasBorders) {
        all.push(c);
    }
    var n = c.children.length;
    for (var i = 0; i < n; i++) {
        this.getZIndexed(c.children[i], all, zs);
    }

    if (zs.length) {
        zs = zs.sort(function(a, b) {return a.zIndex == b.zIndex ? a.ctr - b.ctr : a.zIndex - b.zIndex});
        for (i = 0, n = zs.length; i < n; i++) {
            all = all.concat(this.getZIndexedMain(zs[i]));
        }
    }

    return all;
};

ZIndexTester.prototype.getZIndexed = function(c, all, zs) {
    if (c.uComponent.worldAlpha > 0) {
        if (!c.parent || c.forceZIndexContext || c.zIndex) {
            // Z-index context.
            zs.push(c);
        } else {
            if (c.displayedTexture || c.uComponent.hasBorders) {
                all.push(c);
            }
            var n = c.children.length;
            for (var i = 0; i < n; i++) {
                this.getZIndexed(c.children[i], all, zs);
            }
        }
    }
};

ZIndexTester.prototype.getZIndexedFastMain = function(c) {
    var vbo = [];
    this.getZIndexedFast(c, vbo);
    return vbo;
};

ZIndexTester.prototype.getZIndexedFast = function(c, vbo) {
    var uc = c.uComponent;
    if (uc.zSort) {
        uc.sortZIndexedChildren();
        uc.zSort = false;
    }

    if (uc.worldAlpha) {
        if (uc.displayedTextureSource || uc.hasBorders) {
            vbo.push(c);
        }

        if (uc.hasChildren) {
            if (uc.zContextUsage) {
                for (var i = 0, n = uc.zIndexedChildren.length; i < n; i++) {
                    this.getZIndexedFast(uc.zIndexedChildren[i].c, vbo);
                }
            } else {
                for (var i = 0, n = uc.children.length; i < n; i++) {
                    if (uc.children[i].zIndex === 0) {
                        // If zIndex is set, uc item already belongs to a zIndexedChildren array in one of the ancestors.
                        this.getZIndexedFast(uc.children[i].c, vbo);
                    }
                }
            }
        }
    }
};

UComponentContext.prototype.createUComponentForComponent = function(component) {
    // We need the original component for testing/debugging.
    var uc = new UComponent(this);
    uc.c = component;
    return uc;
};