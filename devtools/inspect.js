var defaultTextAttributes = {
    text: "",
    w: 0,
    h: 0,
    fontStyle: "normal",
    fontSize: 40,
    fontFace: null,
    wordWrap: true,
    wordWrapWidth: 0,
    lineHeight: null,
    textBaseline: "alphabetic",
    textAlign: "left",
    offsetY: null,
    maxLines: 0,
    maxLinesSuffix: "..",
    precision: null,
    textColor: 0xffffffff,
    paddingLeft: 0,
    paddingRight: 0,
    shadow: false,
    shadowColor: 0xff000000,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 5,
    highlight: false,
    highlightHeight: 0,
    highlightColor: 0xff000000,
    highlightOffset: 0,
    highlightPaddingLeft: 0,
    highlightPaddingRight: 0,
    cutSx: 0,
    cutEx: 0,
    cutSy: 0,
    cutEy: 0
};

// _properties must have been called already to prevent init mayhem.
Base.initPrototype(View.prototype);
Base.initPrototype(ViewText.prototype);

window.mutationCounter = 0;
window.mutatingChildren = false;
var observer = new MutationObserver(function(mutations) {
    var fa = ["x", "y", "w", "h", "alpha", "mountX", "mountY", "pivotX", "pivotY", "scaleX", "scaleY", "rotation", "visible", "clipping", "rect", "colorUl", "colorUr", "colorBl", "colorBr", "color", "borderWidthLeft", "borderWidthRight", "borderWidthTop", "borderWidthBottom", "borderWidth", "borderColorLeft", "borderColorRight", "borderColorTop", "borderColorBottom", "borderColor", "zIndex", "forceZIndexContext"];
    var fac = fa.map(function(v) {return v.toLowerCase()});

    var ta = ["text", "fontStyle", "fontSize", "fontFace", "wordWrap", "wordWrapWidth", "lineHeight", "textBaseline", "textAlign", "offsetY", "maxLines", "maxLinesSuffix", "precision", "paddingLeft", "paddingRight", "shadow", "shadowOffsetX", "shadowOffsetY", "shadowBlur", "highlight", "highlightHeight", "highlightOffset", "highlightPaddingLeft", "highlightPaddingRight", "cutSx", "cutEx", "cutSy", "cutEy", "textColor", "shadowColor", "highlightColor"];
    var tac = ta.map(function(v) {return v.toLowerCase()});

    mutations.forEach(function(mutation) {
        if (mutation.type == 'childList') {

            var node = mutation.target;
            var c = mutation.target.view;

            if (c.__ignore_child_list_changes === window.mutationCounter) {
                // Ignore child node changes that were caused by actual value modifications by js.
                return;
            }

            window.mutatingChildren = true;

            var removedNodes = mutation.removedNodes;
            for (var i = 0, n = removedNodes.length; i < n; i++) {
                if (removedNodes[i].view) {
                    c.removeChild(removedNodes[i].view);
                }
            }

            window.mutatingChildren = false;
        }

        if (mutation.type == 'attributes' && mutation.attributeName !== 'style' && mutation.attributeName !== 'class') {
            var n = mutation.attributeName.toLowerCase();
            var c = mutation.target.view;

            if (c.__ignore_attrib_changes === window.mutationCounter) {
                // Ignore attribute changes that were caused by actual value modifications by js.
                return;
            }

            var v = mutation.target.getAttribute(mutation.attributeName);
            var index = fac.indexOf(n);
            if (index !== -1) {
                var rn = fa[index];
                var pv;
                try {
                    if (v === null) {
                        switch(rn) {
                            case "pivotX":
                            case "pivotY":
                                pv = 0.5;
                                break;
                            case "alpha":
                            case "scaleX":
                            case "scaleY":
                                pv = 1;
                                break;
                            case "visible":
                                pv = true;
                                break;
                            case "clipping":
                                pv = false;
                                break;
                            case "rect":
                                pv = false;
                                break;
                            case "zIndex":
                                pv = 0;
                                break;
                            case "forceZIndexContext":
                                pv = false;
                                break;
                            case "color":
                                pv = 0xffffffff;
                                break;
                            case "colorUl":
                            case "colorUr":
                            case "colorBl":
                            case "colorBr":
                                if (mutation.target.hasAttribute("color")) {
                                    // This may happen when the separate values are combined.
                                    return;
                                }
                                pv = 0xffffffff;
                                break;
                            default:
                                pv = 0;
                        }
                    } else {
                        switch(rn) {
                            case "color":
                            case "colorUl":
                            case "colorUr":
                            case "colorBl":
                            case "colorBr":
                                pv = parseInt(v, 16);
                                break;
                            case "visible":
                                pv = (v === "true");
                                break;
                            case "clipping":
                                pv = (v === "true");
                                break;
                            case "rect":
                                pv = (v === "true");
                                break;
                            case "forceZIndexContext":
                                pv = (v === "false");
                                break;
                            default:
                                pv = parseFloat(v);
                                if (isNaN(pv)) throw "e";
                        }
                    }

                    var fv;
                    switch(rn) {
                        case "clipping":
                            c.clipping = pv;
                            break;
                        case "visible":
                            c.visible = pv;
                            break;
                        case "rect":
                            c.rect = pv;
                            break;
                        case "zIndex":
                            c.zIndex = pv;
                            break;
                        case "forceZIndexContext":
                            c.forceZIndexContext = pv;
                            break;
                        case "color":
                            var f = ['colorUl','colorUr','colorBl','colorBr'].map(function(q) {
                                return mutation.target.hasAttribute(q);
                            });
                            
                            if (!f[0]) c["colorUl"] = pv;
                            if (!f[1]) c["colorUr"] = pv;
                            if (!f[2]) c["colorBl"] = pv;
                            if (!f[3]) c["colorBr"] = pv;
                            break;
                        default:
                            c[rn] = pv;
                    }

                    // Set final value, not the transitioned value.
                } catch(e) {
                    console.error('Bad (ignored) attribute value', rn);
                }
            } else {
                if (mutation.attributeName.indexOf("text-") !== -1) {
                    n = mutation.attributeName.substring(5);
                    index = tac.indexOf(n);
                    if (index == -1) {
                        return;
                    }
                    var rn = ta[index];
                    if (v === null) {
                        // Deleted.
                        pv = defaultTextAttributes[rn];
                    } else {
                        switch(rn) {
                            case "fontStyle":
                            case "textBaseline":
                            case "textAlign":
                            case "maxLinesSuffix":
                            case "text":
                                pv = v;
                                break;
                            case "wordWrap":
                            case "shadow":
                            case "highlight":
                                pv = (v === "true");
                                break;
                            case "textColor":
                            case "shadowColor":
                            case "highlightColor":
                                pv = parseInt(v, 16);
                                break;
                            case "fontFace":
                                if (v.indexOf(",") == -1) {
                                    pv = v;
                                } else {
                                    pv = v.split(",");
                                }
                                break;
                            default:
                                pv = parseFloat(v);
                        }
                    }

                    try {
                        c.text[rn] = pv;
                    } catch(e) {
                        console.error('Bad (ignored) text attribute value', rn, pv);
                    }
                }
            }
        }
    });

    window.mutationCounter++;
});

View.prototype.dhtml = function() {
    if (!this.debugElement) {
        this.debugElement = document.createElement('DIV');
        this.debugElement.view = this;
        this.debugElement.style.position = 'absolute';

        this.debugElement.id = "" + this.id;
        observer.observe(this.debugElement, {attributes: true, childList: true});
    }
    if (this.stage.root === this && !this.dhtml_root) {
        // Root element.
        var root = document.createElement('DIV');
        document.body.appendChild(root);
        var self = this;
        setTimeout(function() {
            var bcr = self.stage.adapter.canvas.getBoundingClientRect();
            root.style.left = bcr.left + 'px';
            root.style.top = bcr.top + 'px';
            root.style.width = bcr.width + 'px';
            root.style.height = bcr.height + 'px';
        }, 1000);

        root.style.position = 'absolute';
        root.style.overflow = 'hidden';
        root.style.zIndex = '65535';
        root.appendChild(this.debugElement);

        this.dhtml_root = root;
    }
    return this.debugElement;
};

var oView = View;

var oSetParent = oView.prototype._setParent;
View.prototype._setParent = function(parent) {
    var prevParent = this.parent;

    oSetParent.apply(this, arguments);

    if (!window.mutatingChildren) {
        if (parent) {
            var index = parent.getChildIndex(this);
            parent.__ignore_child_list_changes = window.mutationCounter;
            if (index == parent.children.length - 1) {
                parent.dhtml().appendChild(this.dhtml());
            } else {
                parent.dhtml().insertBefore(this.dhtml(), parent.dhtml().children[index]);
            }
        } else {
            if (prevParent) {
                prevParent.__ignore_child_list_changes = window.mutationCounter;
                prevParent.dhtml().removeChild(this.dhtml());
            }
        }
    }
};

var oInit = Stage.prototype.init;
Stage.prototype.init = function() {
    oInit.apply(this, arguments);

    // Apply stage scaling.
    this.root.updateDebugTransforms();
};

var oAddTag = oView.prototype.addTag;
View.prototype.addTag = function(tag) {
    oAddTag.apply(this, arguments);

    if (tag) {
        this.dhtml().classList.add(tag);
    }
};

var oRemoveTag = oView.prototype.removeTag;
View.prototype.removeTag = function(tag) {
    oRemoveTag(this, arguments);

    if (tag) {
        this.view.dhtml().classList.remove(tag);
    }
};

// Change an attribute due to new value inputs.
var val = function(c, n, v, dv) {
    if (v == dv) {
        c.dhtmlRemoveAttribute(n);
    } else {
        c.dhtmlSetAttribute(n, v);
    }
};

View.prototype.dhtmlRemoveAttribute = function() {
    // We don't want the attribute listeners to be called during the next observer cycle.
    this.__ignore_attrib_changes = window.mutationCounter;
    this.dhtml().removeAttribute.apply(this.dhtml(), arguments);
};

View.prototype.dhtmlSetAttribute = function() {
    this.__ignore_attrib_changes = window.mutationCounter;
    this.dhtml().setAttribute.apply(this.dhtml(), arguments);
};

View.prototype.__x = View.prototype._x;
Object.defineProperty(View.prototype, '_x', {
    get: function() {
        return this.__x;
    },
    set: function(v) {
        if (this.__x !== v) {
            val(this, 'x', v, 0);
            this.__x = v;
            this.updateLeft();
        }
    }
});

View.prototype.__y = View.prototype._y;
Object.defineProperty(View.prototype, '_y', {
    get: function() {
        return this.__y;
    },
    set: function(v) {
        if (this.__y !== v) {
            val(this, 'y', v, 0);
            this.__y = v;
            this.updateTop();
        }
    }
});

View.prototype.__w = View.prototype._w;
Object.defineProperty(View.prototype, '_w', {
    get: function() {
        return this.__w;
    },
    set: function(v) {
        if (this.__w !== v) {
            val(this, 'w', v, 0);
            this.__w = v;
        }
    }
});

View.prototype.__h = View.prototype._h;
Object.defineProperty(View.prototype, '_h', {
    get: function() {
        return this.__h;
    },
    set: function(v) {
        if (this.__h !== v) {
            val(this, 'h', v, 0);
            this.__h = v;
        }
    }
});

View.prototype.updateLeft = function() {
    var mx = this.mountX * this.renderWidth;
    var x = this._x - mx;
    this.dhtml().style.left = x + 'px';
};

View.prototype.updateTop = function() {
    var my = this.mountY * this.renderHeight;
    var y = this._y - my;
    this.dhtml().style.top = y + 'px';
};

View.prototype.__rw = View.prototype._rw;
Object.defineProperty(View.prototype, '_rw', {
    get: function() {
        return this.__rw;
    },
    set: function(v) {
        this.__rw = v;
        this.dhtml().style.width = v + 'px';
        this.updateLeft();
    }
});

View.prototype.__rh = View.prototype._rh;
Object.defineProperty(View.prototype, '_rh', {
    get: function() {
        return this.__rh;
    },
    set: function(v) {
        this.__rh = v;
        this.dhtml().style.height = v + 'px';
        this.updateTop();
    }
});

View.prototype.__alpha = View.prototype._alpha;
Object.defineProperty(View.prototype, '_alpha', {
    get: function() {
        return this.__alpha;
    },
    set: function(v) {
        if (this.__alpha !== v) {
            val(this, 'alpha', v, 1);
            this.__alpha = v;
            this.dhtml().style.opacity = v;
            this.dhtml().style.display = this.__visible && this.__alpha ? 'block' : 'none';
        }
    }
});

View.prototype.__visible = View.prototype._visible;
Object.defineProperty(View.prototype, '_visible', {
    get: function() {
        return this.__visible;
    },
    set: function(v) {
        if (this.__visible !== v) {
            val(this, 'visible', v, true);
            this.__visible = v;
            this.dhtml().style.visibility = v ? 'visible' : 'hidden';
            this.dhtml().style.display = this.__visible && this.__alpha ? 'block' : 'none';
        }
    }
});

View.prototype.__texture = View.prototype._texture;
Object.defineProperty(View.prototype, '_texture', {
    get: function() {
        return this.__texture;
    },
    set: function(v) {
        this.__texture = v;

        val(this, 'rect', this.rect, false);
        val(this, 'src', this.src, null);
    }
});

View.prototype.__rotation = View.prototype._rotation;
Object.defineProperty(View.prototype, '_rotation', {
    get: function() {
        return this.__rotation;
    },
    set: function(v) {
        if (this.__rotation !== v) {
            val(this, 'rotation', v, 0);
            this.__rotation = v;
            this.updateDebugTransforms();
        }
    }
});


View.prototype.__scaleX = View.prototype._scaleX;
Object.defineProperty(View.prototype, '_scaleX', {
    get: function() {
        return this.__scaleX;
    },
    set: function(v) {
        if (this.__scaleX !== v) {
            val(this, 'scaleX', v, 1);
            this.__scaleX = v;
            this.updateDebugTransforms();
        }
    }
});

View.prototype.__scaleY = View.prototype._scaleY;
Object.defineProperty(View.prototype, '_scaleY', {
    get: function() {
        return this.__scaleY;
    },
    set: function(v) {
        if (this.__scaleY !== v) {
            val(this, 'scaleY', v, 1);
            this.__scaleY = v;
            this.updateDebugTransforms();
        }
    }
});

View.prototype.__pivotX = View.prototype._pivotX;
Object.defineProperty(View.prototype, '_pivotX', {
    get: function() {
        return this.__pivotX;
    },
    set: function(v) {
        if (this.__pivotX !== v) {
            val(this, 'pivotX', v, 0.5);
            this.__pivotX = v;
            this.updateDebugTransforms();
        }
    }
});

View.prototype.__pivotY = View.prototype._pivotY;
Object.defineProperty(View.prototype, '_pivotY', {
    get: function() {
        return this.__pivotY;
    },
    set: function(v) {
        if (this.__pivotY !== v) {
            val(this, 'pivotY', v, 0.5);
            this.__pivotY = v;
            this.updateDebugTransforms();
        }
    }
});

View.prototype.__mountX = View.prototype._mountX;
Object.defineProperty(View.prototype, '_mountX', {
    get: function() {
        return this.__mountX;
    },
    set: function(v) {
        if (this.__mountX !== v) {
            val(this, 'mountX', v, 0);
            this.__mountX = v;
            this.updateLeft();
        }
    }
});

View.prototype.__mountY = View.prototype._mountY;
Object.defineProperty(View.prototype, '_mountY', {
    get: function() {
        return this.__mountY;
    },
    set: function(v) {
        if (this.__mountY !== v) {
            val(this, 'mountY', v, 0);
            this.__mountY = v;
            this.updateTop();
        }
    }
});

View.prototype.__zIndex = View.prototype._zIndex;
Object.defineProperty(View.prototype, '_zIndex', {
    get: function() {
        return this.__zIndex;
    },
    set: function(v) {
        if (this.__zIndex !== v) {
            val(this, 'zIndex', v, 0);
            this.__zIndex = v;
            if (this.__zIndex || v) {
                this.dhtml().style.zIndex = v;
            }
        }
    }
});

View.prototype.__forceZIndexContext = View.prototype._forceZIndexContext;
Object.defineProperty(View.prototype, '_forceZIndexContext', {
    get: function() {
        return this.__forceZIndexContext;
    },
    set: function(v) {
        if (this.__forceZIndexContext !== v) {
            val(this, 'forceZIndexContext', v, false);
            this.__forceZIndexContext = v;
        }
    }
});

View.prototype.__clipping = View.prototype._clipping;
Object.defineProperty(View.prototype, '_clipping', {
    get: function() {
        return this.__clipping;
    },
    set: function(v) {
        if (this.__clipping !== v) {
            val(this, 'clipping', v, false);
            this.__clipping = v;
            var nv = v ? 'hidden' : 'visible';
            if (v || !v && (this.dhtml().style.overflow == 'hidden')) {
                this.dhtml().style.overflow = nv;
            }
        }
    }
});

View.prototype.__colorUl = View.prototype._colorUl;
Object.defineProperty(View.prototype, '_colorUl', {
    get: function() {
        return this.__colorUl;
    },
    set: function(v) {
        if (this.__colorUl !== v) {
            val(this, 'colorUl', v.toString(16), "ffffffff");
            this.__colorUl = v;
            checkColors(this);
        }
    }
});

View.prototype.__colorUr = View.prototype._colorUr;
Object.defineProperty(View.prototype, '_colorUr', {
    get: function() {
        return this.__colorUr;
    },
    set: function(v) {
        if (this.__colorUr !== v) {
            val(this, 'colorUr', v.toString(16), "ffffffff");
            this.__colorUr = v;
            checkColors(this);
        }
    }
});

View.prototype.__colorBl = View.prototype._colorBl;
Object.defineProperty(View.prototype, '_colorBl', {
    get: function() {
        return this.__colorBl;
    },
    set: function(v) {
        if (this.__colorBl !== v) {
            val(this, 'colorBl', v.toString(16), "ffffffff");
            this.__colorBl = v;
            checkColors(this);
        }
    }
});

View.prototype.__colorBr = View.prototype._colorBr;
Object.defineProperty(View.prototype, '_colorBr', {
    get: function() {
        return this.__colorBr;
    },
    set: function(v) {
        if (this.__colorBr !== v) {
            val(this, 'colorBr', v.toString(16), "ffffffff");
            this.__colorBr = v;
            checkColors(this);
        }
    }
});

var checkColors = function(view) {
    if (view._colorBr === undefined) {
        // View initialization.
        return;
    }

    if (view._colorUl === view._colorUr && view._colorUl === view._colorBl && view._colorUl === view._colorBr) {
        if (view._colorUl !== 0xffffffff) {
            view.dhtmlSetAttribute('color', view._colorUl.toString(16));
        } else {
            view.dhtmlRemoveAttribute('color');
        }
        view.dhtmlRemoveAttribute('colorul');
        view.dhtmlRemoveAttribute('colorur');
        view.dhtmlRemoveAttribute('colorbl');
        view.dhtmlRemoveAttribute('colorbr');
    } else {
        val(view, 'colorUr', view._colorUr.toString(16), "ffffffff");
        val(view, 'colorUl', view._colorUl.toString(16), "ffffffff");
        val(view, 'colorBr', view._colorBr.toString(16), "ffffffff");
        val(view, 'colorBl', view._colorBl.toString(16), "ffffffff");
        view.dhtmlRemoveAttribute('color');
    }
};

var dtaKeys = Object.keys(defaultTextAttributes);
var dtaValues = dtaKeys.map(function(k) {return defaultTextAttributes[k];});

var oOpdateTexture = ViewText.prototype.updateTexture;
ViewText.prototype.updateTexture = function(v) {
    oOpdateTexture.apply(this, arguments);

    var tr = this.settings;
    var c = this.view;
    var i, n = dtaKeys.length;
    for (i = 0; i < n; i++) {
        var key = dtaKeys[i];
        var dvalue = dtaValues[i];
        var value = tr[key];
        var attKey = "text-" + key.toLowerCase();

        if (dvalue === value) {
            c.dhtmlRemoveAttribute(attKey);
        } else {
            var pv;
            switch(key) {
                case "fontStyle":
                case "textBaseline":
                case "textAlign":
                case "maxLinesSuffix":
                    pv = value;
                    break;
                case "wordWrap":
                case "shadow":
                case "highlight":
                    pv = value ? "true" : "false";
                    break;
                case "textColor":
                case "shadowColor":
                case "highlightColor":
                    pv = "0x" + value.toString(16);
                    break;
                case "fontFace":
                    pv = Array.isArray(value) ? value.join(",") : value;
                    break;
                default:
                    pv = "" + value;
            }

            c.dhtmlSetAttribute(attKey, pv);
        }
    }
};

View.prototype.updateDebugTransforms = function() {
    if (this._pivotX !== 0.5 || this._pivotY !== 0.5) {
        this.dhtml().style.transformOrigin = (this._pivotX * 100) + '% '  + (this._pivotY * 100) + '%';
    } else if (this.dhtml().style.transformOrigin) {
        this.dhtml().style.transformOrigin = '50% 50%';
    }

    var r = this._rotation;
    var sx = this._scaleX;
    var sy = this._scaleY;

    if ((sx !== undefined && sy !== undefined) && (this.id === 0)) {
        // Root element: must be scaled.
        if (this.stage.options.w !== this.stage.options.renderWidth || this.stage.options.h !== this.stage.options.renderHeight) {
            sx *= (this.stage.options.w / this.stage.options.renderWidth);
            sy *= (this.stage.options.h / this.stage.options.renderHeight);
        }
    }
    var parts = [];
    if (r) parts.push('rotate(' + r + 'rad)');
    if ((sx !== undefined && sy !== undefined) && (sx !== 1 || sy !== 1)) parts.push('scale(' + sx + ', ' + sy + ')');

    this.dhtml().style.transform = parts.join(' ');
};

