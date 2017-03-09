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
    precision: 1,
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
    highlightOffset: null,
    highlightPaddingLeft: null,
    highlightPaddingRight: null,
    cutSx: 0,
    cutEx: 0,
    cutSy: 0,
    cutEy: 0
};

window.mutationCounter = 0;
window.mutatingChildren = false;
var observer = new MutationObserver(function(mutations) {
    var fa = ["x", "y", "w", "h", "alpha", "mountX", "mountY", "pivotX", "pivotY", "scaleX", "scaleY", "rotation", "visible", "clipping", "rect", "colorTopLeft", "colorTopRight", "colorBottomLeft", "colorBottomRight", "color", "borderWidthLeft", "borderWidthRight", "borderWidthTop", "borderWidthBottom", "borderWidth", "borderColorLeft", "borderColorRight", "borderColorTop", "borderColorBottom", "borderColor", "zIndex", "forceZIndexContext"];
    var fac = fa.map(function(v) {return v.toLowerCase()});

    var ta = ["text", "fontStyle", "fontSize", "fontFace", "wordWrap", "wordWrapWidth", "lineHeight", "textBaseline", "textAlign", "offsetY", "maxLines", "maxLinesSuffix", "precision", "paddingLeft", "paddingRight", "shadow", "shadowOffsetX", "shadowOffsetY", "shadowBlur", "highlight", "highlightHeight", "highlightOffset", "highlightPaddingLeft", "highlightPaddingRight", "cutSx", "cutEx", "cutSy", "cutEy", "textColor", "shadowColor", "highlightColor"];
    var tac = ta.map(function(v) {return v.toLowerCase()});

    mutations.forEach(function(mutation) {
        if (mutation.type == 'childList') {

            var node = mutation.target;
            var c = mutation.target.component;

            if (c.__ignore_child_list_changes === window.mutationCounter) {
                // Ignore child node changes that were caused by actual value modifications by js.
                return;
            }

            window.mutatingChildren = true;

            var removedNodes = mutation.removedNodes;
            for (var i = 0, n = removedNodes.length; i < n; i++) {
                if (removedNodes[i].component) {
                    c.removeChild(removedNodes[i].component);
                }
            }

            window.mutatingChildren = false;
        }

        if (mutation.type == 'attributes' && mutation.attributeName !== 'style' && mutation.attributeName !== 'class') {
            var n = mutation.attributeName.toLowerCase();
            var c = mutation.target.component;

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
                            case "borderWidth":
                                pv = 0;
                                break;
                            case "borderWidthLeft":
                            case "borderWidthRight":
                            case "borderWidthTop":
                            case "borderWidthBottom":
                                if (mutation.target.hasAttribute("borderWidth")) {
                                    // This may happen when the separate values are combined.
                                    return;
                                }
                                pv = 0;
                                break;
                            case "borderColor":
                                pv = 0xffffffff;
                                break;
                            case "borderColorLeft":
                            case "borderColorRight":
                            case "borderColorTop":
                            case "borderColorBottom":
                                if (mutation.target.hasAttribute("borderColor")) {
                                    // This may happen when the separate values are combined.
                                    return;
                                }
                                pv = 0xffffffff;
                                break;
                            case "color":
                                pv = 0xffffffff;
                                break;
                            case "colorTopLeft":
                            case "colorTopRight":
                            case "colorBottomLeft":
                            case "colorBottomRight":
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
                            case "colorTopLeft":
                            case "colorTopRight":
                            case "colorBottomLeft":
                            case "colorBottomRight":
                            case "borderColor":
                            case "borderColorLeft":
                            case "borderColorRight":
                            case "borderColorTop":
                            case "borderColorBottom":
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
                            var f = ['colorTopLeft','colorTopRight','colorBottomLeft','colorBottomRight'].map(function(q) {
                                return mutation.target.hasAttribute(q);
                            });
                            
                            if (!f[0]) c["COLORTOPLEFT"] = pv;
                            if (!f[1]) c["COLORTOPRIGHT"] = pv;
                            if (!f[2]) c["COLORBOTTOMLEFT"] = pv;
                            if (!f[3]) c["COLORBOTTOMRIGHT"] = pv;
                            break;
                        case "borderWidth":
                            var f = ['borderWidthLeft','borderWidthRight','borderWidthTop','borderWidthBottom'].map(function(q) {
                                return mutation.target.hasAttribute(q);
                            });

                            if (!f[0]) c["BORDERWIDTHLEFT"] = pv;
                            if (!f[1]) c["BORDERWIDTHRIGHT"] = pv;
                            if (!f[2]) c["BORDERWIDTHTOP"] = pv;
                            if (!f[3]) c["BORDERWIDTHBOTTOM"] = pv;
                            break;
                        case "borderColor":
                            var f = ['borderColorLeft','borderColorRight','borderColorTop','borderColorBottom'].map(function(q) {
                                return mutation.target.hasAttribute(q);
                            });

                            if (!f[0]) c["BORDERCOLORLEFT"] = pv;
                            if (!f[1]) c["BORDERCOLORRIGHT"] = pv;
                            if (!f[2]) c["BORDERCOLORTOP"] = pv;
                            if (!f[3]) c["BORDERCOLORBOTTOM"] = pv;
                            break;
                        default:
                            fv = rn.toUpperCase();
                            c[fv] = pv;
                    }

                    // Set final value, not the transitioned value.
                } catch(e) {
                    console.error('Bad (ignored) attribute value', rn, pv);
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

Component.prototype.dhtml = function() {
    if (!this.debugElement) {
        this.debugElement = document.createElement('DIV');
        this.debugElement.component = this;
        this.debugElement.style.position = 'absolute';

        this.debugElement.id = "" + this.id;
        observer.observe(this.debugElement, {attributes: true, childList: true});
    }
    if (!this.id && !this.dhtml_root) {
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

var oComponent = Component;

var oSetParent = oComponent.prototype.setParent;
Component.prototype.setParent = function(parent) {
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
    // Apply stage scaling.
    this.root.updateDebugTransforms();

    oInit.apply(this, arguments);
};

var oAddTag = oComponent.prototype.addTag;
Component.prototype.addTag = function(tag) {
    oAddTag.apply(this, arguments);

    this.dhtml().classList.add(tag);
};

var oRemoveTag = oComponent.prototype.removeTag;
Component.prototype.removeTag = function(tag) {
    oRemoveTag.apply(this, arguments);

    this.dhtml().classList.remove(tag);
};

// Change an attribute due to new value inputs.
var val = function(c, n, v, dv) {
    if (v == dv) {
        c.dhtmlRemoveAttribute(n);
    } else {
        c.dhtmlSetAttribute(n, v);
    }
};

Component.prototype.dhtmlRemoveAttribute = function() {
    // We don't want the attribute listeners to be called during the next observer cycle.
    this.__ignore_attrib_changes = window.mutationCounter;
    this.dhtml().removeAttribute.apply(this.dhtml(), arguments);
};

Component.prototype.dhtmlSetAttribute = function() {
    this.__ignore_attrib_changes = window.mutationCounter;
    this.dhtml().setAttribute.apply(this.dhtml(), arguments);
};

Object.defineProperty(Component.prototype, '_x', {
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

Object.defineProperty(Component.prototype, '_y', {
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

Object.defineProperty(Component.prototype, '_w', {
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

Object.defineProperty(Component.prototype, '_h', {
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

Component.prototype.updateLeft = function() {
    var mx = this.mountX * this._renderWidth;
    var x = this._x - mx;
    this.dhtml().style.left = x + 'px';
};

Component.prototype.updateTop = function() {
    var my = this.mountY * this._renderHeight;
    var y = this._y - my;
    this.dhtml().style.top = y + 'px';
};

Object.defineProperty(Component.prototype, '_renderWidth', {
    get: function() {
        return this.__renderWidth;
    },
    set: function(v) {
        this.__renderWidth = v;
        this.dhtml().style.width = v + 'px';
        this.updateLeft();
    }
});

Object.defineProperty(Component.prototype, '_renderHeight', {
    get: function() {
        return this.__renderHeight;
    },
    set: function(v) {
        this.__renderHeight = v;
        this.dhtml().style.height = v + 'px';
        this.updateTop();
    }
});

Object.defineProperty(Component.prototype, '_alpha', {
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

Object.defineProperty(Component.prototype, '_visible', {
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

Object.defineProperty(Component.prototype, '_texture', {
    get: function() {
        return this.__texture;
    },
    set: function(v) {
        this.__texture = v;

        val(this, 'rect', this.rect, false);
    }
});

Object.defineProperty(Component.prototype, '_rotation', {
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


Object.defineProperty(Component.prototype, '_scaleX', {
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

Object.defineProperty(Component.prototype, '_scaleY', {
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

Object.defineProperty(Component.prototype, '_pivotX', {
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

Object.defineProperty(Component.prototype, '_pivotY', {
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

Object.defineProperty(Component.prototype, '_mountX', {
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

Object.defineProperty(Component.prototype, '_mountY', {
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

Object.defineProperty(Component.prototype, '_zIndex', {
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

Object.defineProperty(Component.prototype, '_forceZIndexContext', {
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

Object.defineProperty(Component.prototype, '_clipping', {
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

Object.defineProperty(Component.prototype, '_src', {
    get: function() {
        return this.__src;
    },
    set: function(v) {
        if (v !== this.__src) {
            var nv = v ? v.src : null;
            this.__src = v;

            val(this, 'src', nv, null);
        }
    }
});

Object.defineProperty(Component.prototype, '_colorTopLeft', {
    get: function() {
        return this.__colorTopLeft;
    },
    set: function(v) {
        if (this.__colorTopLeft !== v) {
            val(this, 'colorTopLeft', v.toString(16), "ffffffff");
            this.__colorTopLeft = v;
            checkColors(this);
        }
    }
});

Object.defineProperty(Component.prototype, '_colorTopRight', {
    get: function() {
        return this.__colorTopRight;
    },
    set: function(v) {
        if (this.__colorTopRight !== v) {
            val(this, 'colorTopRight', v.toString(16), "ffffffff");
            this.__colorTopRight = v;
            checkColors(this);
        }
    }
});

Object.defineProperty(Component.prototype, '_colorBottomLeft', {
    get: function() {
        return this.__colorBottomLeft;
    },
    set: function(v) {
        if (this.__colorBottomLeft !== v) {
            val(this, 'colorBottomLeft', v.toString(16), "ffffffff");
            this.__colorBottomLeft = v;
            checkColors(this);
        }
    }
});

Object.defineProperty(Component.prototype, '_colorBottomRight', {
    get: function() {
        return this.__colorBottomRight;
    },
    set: function(v) {
        if (this.__colorBottomRight !== v) {
            val(this, 'colorBottomRight', v.toString(16), "ffffffff");
            this.__colorBottomRight = v;
            checkColors(this);
        }
    }
});

var checkColors = function(component) {
    if (component.COLORBOTTOMRIGHT === undefined) {
        // Component initialization.
        return;
    }

    if (component.COLORTOPLEFT === component.COLORTOPRIGHT && component.COLORTOPLEFT === component.COLORBOTTOMLEFT && component.COLORTOPLEFT === component.COLORBOTTOMRIGHT) {
        if (component.COLORTOPLEFT !== 0xffffffff) {
            component.dhtmlSetAttribute('color', component.COLORTOPLEFT.toString(16));
        } else {
            component.dhtmlRemoveAttribute('color');
        }
        component.dhtmlRemoveAttribute('colortopleft');
        component.dhtmlRemoveAttribute('colortopright');
        component.dhtmlRemoveAttribute('colorbottomleft');
        component.dhtmlRemoveAttribute('colorbottomright');
    } else {
        val(component, 'colorTopRight', component.COLORTOPRIGHT.toString(16), "ffffffff");
        val(component, 'colorTopLeft', component.COLORTOPLEFT.toString(16), "ffffffff");
        val(component, 'colorBottomRight', component.COLORBOTTOMRIGHT.toString(16), "ffffffff");
        val(component, 'colorBottomLeft', component.COLORBOTTOMLEFT.toString(16), "ffffffff");
        component.dhtmlRemoveAttribute('color');
    }
};

Object.defineProperty(Component.prototype, '_borderWidthTop', {
    get: function() {
        return this.__borderWidthTop;
    },
    set: function(v) {
        if (this.__borderWidthTop !== v) {
            val(this, 'borderWidthTop', v, 0);
            this.__borderWidthTop = v;
            checkBorderWidths(this);
        }
    }
});

Object.defineProperty(Component.prototype, '_borderWidthBottom', {
    get: function() {
        return this.__borderWidthBottom;
    },
    set: function(v) {
        if (this.__borderWidthBottom !== v) {
            val(this, 'borderWidthBottom', v, 0);
            this.__borderWidthBottom = v;
            checkBorderWidths(this);
        }
    }
});

Object.defineProperty(Component.prototype, '_borderWidthLeft', {
    get: function() {
        return this.__borderWidthLeft;
    },
    set: function(v) {
        if (this.__borderWidthLeft !== v) {
            val(this, 'borderWidthLeft', v, 0);
            this.__borderWidthLeft = v;
            checkBorderWidths(this);
        }
    }
});

Object.defineProperty(Component.prototype, '_borderWidthRight', {
    get: function() {
        return this.__borderWidthRight;
    },
    set: function(v) {
        if (this.__borderWidthRight !== v) {
            val(this, 'borderWidthRight', v, 0);
            this.__borderWidthRight = v;
            checkBorderWidths(this);
        }
    }
});

var checkBorderWidths = function(component) {
    if (component.BORDERWIDTHRIGHT === undefined) {
        // Component initialization.
        return;
    }

    if (component.BORDERWIDTHLEFT === component.BORDERWIDTHRIGHT && component.BORDERWIDTHLEFT === component.BORDERWIDTHTOP && component.BORDERWIDTHLEFT === component.BORDERWIDTHBOTTOM) {
        if (component.BORDERWIDTHLEFT !== 0) {
            component.dhtmlSetAttribute('borderwidth', component.BORDERWIDTHLEFT);
        } else {
            component.dhtmlRemoveAttribute('borderwidth');
        }
        component.dhtmlRemoveAttribute('borderwidthleft');
        component.dhtmlRemoveAttribute('borderwidthright');
        component.dhtmlRemoveAttribute('borderwidthtop');
        component.dhtmlRemoveAttribute('borderwidthbottom');
    } else {
        val(component, 'borderWidthLeft', component.BORDERWIDTHLEFT, 0);
        val(component, 'borderWidthRight', component.BORDERWIDTHRIGHT, 0);
        val(component, 'borderWidthTop', component.BORDERWIDTHTOP, 0);
        val(component, 'borderWidthBottom', component.BORDERWIDTHBOTTOM, 0);
        component.dhtmlRemoveAttribute('borderwidth');
    }
    
};

Object.defineProperty(Component.prototype, '_borderColorTop', {
    get: function() {
        return this.__borderColorTop;
    },
    set: function(v) {
        if (this.__borderColorTop !== v) {
            val(this, 'borderColorTop', v.toString(16), "ffffffff");
            this.__borderColorTop = v;
            checkBorderColors(this);
        }
    }
});

Object.defineProperty(Component.prototype, '_borderColorBottom', {
    get: function() {
        return this.__borderColorBottom;
    },
    set: function(v) {
        if (this.__borderColorBottom !== v) {
            val(this, 'borderColorBottom', v.toString(16), "ffffffff");
            this.__borderColorBottom = v;
            checkBorderColors(this);
        }
    }
});

Object.defineProperty(Component.prototype, '_borderColorLeft', {
    get: function() {
        return this.__borderColorLeft;
    },
    set: function(v) {
        if (this.__borderColorLeft !== v) {
            val(this, 'borderColorLeft', v.toString(16), "ffffffff");
            this.__borderColorLeft = v;
            checkBorderColors(this);
        }
    }
});

Object.defineProperty(Component.prototype, '_borderColorRight', {
    get: function() {
        return this.__borderColorRight;
    },
    set: function(v) {
        if (this.__borderColorRight !== v) {
            val(this, 'borderColorRight', v.toString(16), "ffffffff");
            this.__borderColorRight = v;
            checkBorderColors(this);
        }
    }
});

var checkBorderColors = function(component) {
    if (component.BORDERCOLORRIGHT === undefined) {
        // Component initialization.
        return;
    }

    if (component.BORDERCOLORLEFT === component.BORDERCOLORRIGHT && component.BORDERCOLORLEFT === component.BORDERCOLORTOP && component.BORDERCOLORLEFT === component.BORDERCOLORBOTTOM) {
        if (component.BORDERCOLORLEFT !== 0xffffffff) {
            component.dhtmlSetAttribute('bordercolor', component.BORDERCOLORLEFT.toString(16));
        } else {
            component.dhtmlRemoveAttribute('bordercolor');
        }
        component.dhtmlRemoveAttribute('bordercolorleft');
        component.dhtmlRemoveAttribute('bordercolorright');
        component.dhtmlRemoveAttribute('bordercolortop');
        component.dhtmlRemoveAttribute('bordercolorbottom');
    } else {
        val(component, 'borderColorLeft', component.BORDERCOLORLEFT.toString(16), "ffffffff");
        val(component, 'borderColorRight', component.BORDERCOLORRIGHT.toString(16), "ffffffff");
        val(component, 'borderColorTop', component.BORDERCOLORTOP.toString(16), "ffffffff");
        val(component, 'borderColorBottom', component.BORDERCOLORBOTTOM.toString(16), "ffffffff");
        component.dhtmlRemoveAttribute('bordercolor');
    }
};

var dtaKeys = Object.keys(defaultTextAttributes);
var dtaValues = dtaKeys.map(function(k) {return defaultTextAttributes[k];});

var oOpdateTexture = ComponentText.prototype.updateTexture;
ComponentText.prototype.updateTexture = function(v) {
    oOpdateTexture.apply(this, arguments);

    var tr = this;
    var c = this.component;
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
                    pv = Utils.isArray(value) ? value.join(",") : value;
                    break;
                default:
                    pv = "" + value;
            }

            c.dhtmlSetAttribute(attKey, pv);
        }
    }
};

Component.prototype.updateDebugTransforms = function() {
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
        if (this.stage.w !== this.stage.renderWidth || this.stage.h !== this.stage.renderHeight) {
            sx *= (this.stage.w / this.stage.renderWidth);
            sy *= (this.stage.h / this.stage.renderHeight);
        }
    }
    var parts = [];
    if (r) parts.push('rotate(' + r + 'rad)');
    if ((sx !== undefined && sy !== undefined) && (sx !== 1 || sy !== 1)) parts.push('scale(' + sx + ', ' + sy + ')');

    this.dhtml().style.transform = parts.join(' ');
};

