var attachInspector = function(wuf) {
    with(wuf) {
        const Stage = _internal.Stage
        const ViewCore = _internal.ViewCore
        const ViewTexturizer = _internal.ViewTexturizer

// _properties must have been called already to prevent init mayhem.
        window.mutationCounter = 0;
        window.mutatingChildren = false;
        var observer = new MutationObserver(function(mutations) {
            var fa = ["x", "y", "w", "h", "alpha", "mountX", "mountY", "pivotX", "pivotY", "scaleX", "scaleY", "rotation", "visible", "clipping", "rect", "colorUl", "colorUr", "colorBl", "colorBr", "color", "borderWidthLeft", "borderWidthRight", "borderWidthTop", "borderWidthBottom", "borderWidth", "borderColorLeft", "borderColorRight", "borderColorTop", "borderColorBottom", "borderColor", "zIndex", "forceZIndexContext", "renderToTexture", "renderToTextureLazy", "renderOffscreen", "colorizeResultTexture", "texture"];
            var fac = fa.map(function(v) {return v.toLowerCase()});

            mutations.forEach(function(mutation) {
                if (mutation.type == 'childList') {

                    var node = mutation.target;
                    var c = mutation.target.view;
                }

                if (mutation.type == 'attributes' && mutation.attributeName !== 'style' && mutation.attributeName !== 'class') {
                    var n = mutation.attributeName.toLowerCase();
                    var c = mutation.target.view;

                    if (c.__ignore_attrib_changes === window.mutationCounter) {
                        // Ignore attribute changes that were caused by actual value modifications by js.
                        return;
                    }

                    var v = mutation.target.getAttribute(mutation.attributeName);

                    if (n.startsWith("texture-")) {
                        if (c.displayedTexture) {
                            const att = n.substr(8).split("_")
                            const camelCaseAtt = att[0] + att.slice(1).map(a => {
                                return a.substr(0,1).toUpperCase() + a.substr(1).toLowerCase()
                            }).join()

                            c.displayedTexture[camelCaseAtt] = v
                        }
                        return
                    }

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
                                    case "renderToTexture":
                                        pv = false
                                        break;
                                    case "renderToTextureLazy":
                                        pv = false
                                        break;
                                    case "renderOffscreen":
                                        pv = false
                                        break;
                                    case "colorizeResultTexture":
                                        pv = false
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
                                    case "clipping":
                                    case "rect":
                                    case "forceZIndexContext":
                                    case "renderToTexture":
                                    case "renderToTextureLazy":
                                    case "renderOffscreen":
                                    case "colorizeResultTexture":
                                        pv = (v === "true");
                                        break;
                                    case "texture":
                                        pv = JSON.parse(v)
                                        break
                                    default:
                                        pv = parseFloat(v);
                                        if (isNaN(pv)) throw "e";
                                }
                            }

                            var fv;
                            switch(rn) {
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
                    }
                }
            });

            window.mutationCounter++;
        });

        ViewCore.prototype.dhtml = function() {
            return this._view.dhtml();
        }

        View.prototype.dhtml = function() {
            if (!this.debugElement) {
                this.debugElement = document.createElement('DIV');
                this.debugElement.view = this;
                this.debugElement.style.position = 'absolute';

                this.debugElement.id = "" + this.id;
                observer.observe(this.debugElement, {attributes: true});
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
                    root.style.width = Math.ceil(bcr.width / self.stage.getRenderPrecision()) + 'px';
                    root.style.height = Math.ceil(bcr.height / self.stage.getRenderPrecision()) + 'px';
                    root.style.transformOrigin = '0 0 0';
                    root.style.transform = 'scale(' + self.stage.getRenderPrecision() + ',' + self.stage.getRenderPrecision() + ')';
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
                    var index = parent._children.getIndex(this);
                    if (index == parent._children.get().length - 1) {
                        parent.dhtml().appendChild(this.dhtml());
                    } else {
                        parent.dhtml().insertBefore(this.dhtml(), parent.dhtml().children[index]);
                    }
                } else {
                    if (prevParent) {
                        prevParent.dhtml().removeChild(this.dhtml());
                    }
                }
            }
        };

        var oInit = Stage.prototype.init;
        Stage.prototype.init = function() {
            oInit.apply(this, arguments);

            // Apply stage scaling.
            this.root.core.updateDebugTransforms();
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
            oRemoveTag.apply(this, arguments);

            if (tag) {
                this.dhtml().classList.remove(tag);
            }
        };

// Change an attribute due to new value inputs.
        var val = function(c, n, v, dv) {
            if (c._view) {
                c = c._view;
            }
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

        if (typeof Component !== "undefined") {
            Component.prototype.___state = Component.prototype.__state;
            Object.defineProperty(View.prototype, '__state', {
                get: function() {
                    return this.___state;
                },
                set: function(v) {
                    if (this.___state !== v) {
                        val(this, 'state', v, "");
                        this.___state = v;
                    }
                }
            });
        }

        View.prototype.$ref = View.prototype.__ref;
        Object.defineProperty(View.prototype, '__ref', {
            get: function() {
                return this.$ref;
            },
            set: function(v) {
                if (this.$ref !== v) {
                    val(this, 'ref', v, null);
                    this.$ref = v;
                }
            }
        });

        ViewCore.prototype.$x = ViewCore.prototype._x;
        Object.defineProperty(ViewCore.prototype, '_x', {
            get: function() {
                return this.$x;
            },
            set: function(v) {
                if (this.$x !== v) {
                    val(this, 'x', v, 0);
                    this.$x = v;
                    this.updateLeft();
                }
            }
        });

        ViewCore.prototype.$y = ViewCore.prototype._y;
        Object.defineProperty(ViewCore.prototype, '_y', {
            get: function() {
                return this.$y;
            },
            set: function(v) {
                if (this.$y !== v) {
                    val(this, 'y', v, 0);
                    this.$y = v;
                    this.updateTop();
                }
            }
        });

        ViewCore.prototype.$w = ViewCore.prototype._w;
        Object.defineProperty(ViewCore.prototype, '_w', {
            get: function() {
                return this.$w;
            },
            set: function(v) {
                if (this.$w !== v) {
                    val(this, 'w', v, 0);
                    this.$w = v;
                }
            }
        });

        ViewCore.prototype.$h = ViewCore.prototype._h;
        Object.defineProperty(ViewCore.prototype, '_h', {
            get: function() {
                return this.$h;
            },
            set: function(v) {
                if (this.$h !== v) {
                    val(this, 'h', v, 0);
                    this.$h = v;
                }
            }
        });

        ViewCore.prototype.updateLeft = function() {
            var mx = this._mountX * this._rw;
            var x = this._x - mx;
            this.dhtml().style.left = x + 'px';
        };

        ViewCore.prototype.updateTop = function() {
            var my = this._mountY * this._rh;
            var y = this._y - my;
            this.dhtml().style.top = y + 'px';
        };

        ViewCore.prototype.__rw = 0;
        Object.defineProperty(ViewCore.prototype, '_rw', {
            get: function() {
                return this.__rw;
            },
            set: function(v) {
                this.__rw = v;
                this.dhtml().style.width = v + 'px';
                this.updateLeft();
            }
        });

        ViewCore.prototype.__rh = 0;
        Object.defineProperty(ViewCore.prototype, '_rh', {
            get: function() {
                return this.__rh;
            },
            set: function(v) {
                this.__rh = v;
                this.dhtml().style.height = v + 'px';
                this.updateTop();
            }
        });

        ViewCore.prototype.$alpha = 1;
        Object.defineProperty(ViewCore.prototype, '_alpha', {
            get: function() {
                return this.$alpha;
            },
            set: function(v) {
                if (this.$alpha !== v) {
                    val(this, 'alpha', v, 1);
                    this.$alpha = v;
                    this.dhtml().style.opacity = v;
                    this.dhtml().style.display = this.$visible && this.$alpha ? 'block' : 'none';
                }
            }
        });

        ViewCore.prototype.$visible = true;
        Object.defineProperty(ViewCore.prototype, '_visible', {
            get: function() {
                return this.$visible;
            },
            set: function(v) {
                if (this.$visible !== v) {
                    val(this, 'visible', v, true);
                    this.$visible = v;
                    this.dhtml().style.visibility = v ? 'visible' : 'hidden';
                    this.dhtml().style.display = this.$visible && this.$alpha ? 'block' : 'none';
                }
            }
        });

        ViewCore.prototype.$rotation = 0;
        Object.defineProperty(ViewCore.prototype, '_rotation', {
            get: function() {
                return this.$rotation;
            },
            set: function(v) {
                if (this.$rotation !== v) {
                    val(this, 'rotation', v, 0);
                    this.$rotation = v;
                    this.updateDebugTransforms();
                }
            }
        });


        ViewCore.prototype.$scaleX = 1;
        Object.defineProperty(ViewCore.prototype, '_scaleX', {
            get: function() {
                return this.$scaleX;
            },
            set: function(v) {
                if (this.$scaleX !== v) {
                    val(this, 'scaleX', v, 1);
                    this.$scaleX = v;
                    this.updateDebugTransforms();
                }
            }
        });

        ViewCore.prototype.$scaleY = 1;
        Object.defineProperty(ViewCore.prototype, '_scaleY', {
            get: function() {
                return this.$scaleY;
            },
            set: function(v) {
                if (this.$scaleY !== v) {
                    val(this, 'scaleY', v, 1);
                    this.$scaleY = v;
                    this.updateDebugTransforms();
                }
            }
        });

        ViewCore.prototype.$pivotX = 0.5;
        Object.defineProperty(ViewCore.prototype, '_pivotX', {
            get: function() {
                return this.$pivotX;
            },
            set: function(v) {
                if (this.$pivotX !== v) {
                    val(this, 'pivotX', v, 0.5);
                    this.$pivotX = v;
                    this.updateDebugTransforms();
                }
            }
        });

        ViewCore.prototype.$pivotY = 0.5;
        Object.defineProperty(ViewCore.prototype, '_pivotY', {
            get: function() {
                return this.$pivotY;
            },
            set: function(v) {
                if (this.$pivotY !== v) {
                    val(this, 'pivotY', v, 0.5);
                    this.$pivotY = v;
                    this.updateDebugTransforms();
                }
            }
        });

        ViewCore.prototype.$mountX = 0;
        Object.defineProperty(ViewCore.prototype, '_mountX', {
            get: function() {
                return this.$mountX;
            },
            set: function(v) {
                if (this.$mountX !== v) {
                    val(this, 'mountX', v, 0);
                    this.$mountX = v;
                    this.updateLeft();
                }
            }
        });

        ViewCore.prototype.$mountY = 0;
        Object.defineProperty(ViewCore.prototype, '_mountY', {
            get: function() {
                return this.$mountY;
            },
            set: function(v) {
                if (this.$mountY !== v) {
                    val(this, 'mountY', v, 0);
                    this.$mountY = v;
                    this.updateTop();
                }
            }
        });

        ViewCore.prototype.__zIndex = 0;
        Object.defineProperty(ViewCore.prototype, '_zIndex', {
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

        ViewCore.prototype.__forceZIndexContext = false;
        Object.defineProperty(ViewCore.prototype, '_forceZIndexContext', {
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

        ViewCore.prototype.__clipping = false;
        Object.defineProperty(ViewCore.prototype, '_clipping', {
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

        ViewCore.prototype.__withinBoundsMargin = false;
        Object.defineProperty(ViewCore.prototype, '_withinBoundsMargin', {
            get: function() {
                return this.__withinBoundsMargin;
            },
            set: function(v) {
                if (this.__withinBoundsMargin !== v) {
                    val(this, 'withinBoundsMargin', v, false);
                    this.__withinBoundsMargin = v;
                }
            }
        });

        ViewCore.prototype.__colorUl = 0xFFFFFFFF;
        Object.defineProperty(ViewCore.prototype, '_colorUl', {
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

        ViewCore.prototype.__colorUr = 0xFFFFFFFF;
        Object.defineProperty(ViewCore.prototype, '_colorUr', {
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

        ViewCore.prototype.__colorBl = 0xFFFFFFFF;
        Object.defineProperty(ViewCore.prototype, '_colorBl', {
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

        ViewCore.prototype.__colorBr = 0xFFFFFFFF;
        Object.defineProperty(ViewCore.prototype, '_colorBr', {
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

        View.prototype.$texture = null;
        Object.defineProperty(View.prototype, '__texture', {
            get: function() {
                return this.$texture;
            },
            set: function(v) {
                this.$texture = v;

                val(this, 'rect', this.rect, false);
                val(this, 'src', this.src, null);
            }
        });


        var checkColors = function(viewRenderer) {
            let view = viewRenderer._view;
            if (viewRenderer._colorBr === undefined) {
                // View initialization.
                return;
            }

            if (viewRenderer._colorUl === viewRenderer._colorUr && viewRenderer._colorUl === viewRenderer._colorBl && viewRenderer._colorUl === viewRenderer._colorBr) {
                if (viewRenderer._colorUl !== 0xffffffff) {
                    view.dhtmlSetAttribute('color', viewRenderer._colorUl.toString(16));
                } else {
                    view.dhtmlRemoveAttribute('color');
                }
                view.dhtmlRemoveAttribute('colorul');
                view.dhtmlRemoveAttribute('colorur');
                view.dhtmlRemoveAttribute('colorbl');
                view.dhtmlRemoveAttribute('colorbr');
            } else {
                val(view, 'colorUr', viewRenderer.colorUr.toString(16), "ffffffff");
                val(view, 'colorUl', viewRenderer.colorUl.toString(16), "ffffffff");
                val(view, 'colorBr', viewRenderer.colorBr.toString(16), "ffffffff");
                val(view, 'colorBl', viewRenderer.colorBl.toString(16), "ffffffff");
                view.dhtmlRemoveAttribute('color');
            }
        };

        ViewTexturizer.prototype.__enabled = false;
        Object.defineProperty(ViewTexturizer.prototype, '_enabled', {
            get: function() {
                return this.__enabled;
            },
            set: function(v) {
                if (this.__enabled !== v) {
                    val(this, 'renderToTexture', v, false);
                    this.__enabled = v;
                }
            }
        });

        ViewTexturizer.prototype.__lazy = false;
        Object.defineProperty(ViewTexturizer.prototype, '_lazy', {
            get: function() {
                return this.__lazy;
            },
            set: function(v) {
                if (this.__lazy !== v) {
                    val(this, 'renderToTextureLazy', v, false);
                    this.__lazy = v;
                }
            }
        });

        ViewTexturizer.prototype.__colorize = false;
        Object.defineProperty(ViewTexturizer.prototype, '_colorize', {
            get: function() {
                return this.__colorize;
            },
            set: function(v) {
                if (this.__colorize !== v) {
                    val(this, 'colorizeResultTexture', v, false);
                    this.__colorize = v;
                }
            }
        });

        ViewTexturizer.prototype.__renderOffscreen = false;
        Object.defineProperty(ViewTexturizer.prototype, '_renderOffscreen', {
            get: function() {
                return this.__renderOffscreen;
            },
            set: function(v) {
                if (this.__renderOffscreen !== v) {
                    val(this, 'renderOffscreen', v, false);
                    this.__renderOffscreen = v;
                }
            }
        });

        ViewCore.prototype.updateDebugTransforms = function() {
            const stage = this._view.stage
            
            if (this._pivotX !== 0.5 || this._pivotY !== 0.5) {
                this.dhtml().style.transformOrigin = (this._pivotX * 100) + '% '  + (this._pivotY * 100) + '%';
            } else if (this.dhtml().style.transformOrigin) {
                this.dhtml().style.transformOrigin = '50% 50%';
            }

            var r = this._rotation;
            var sx = this._scaleX;
            var sy = this._scaleY;

            if ((sx !== undefined && sy !== undefined) && (this._view.id === 0)) {
                // Root element: must be scaled.
                if (stage.options.w !== stage.options.renderWidth || stage.options.h !== stage.options.renderHeight) {
                    sx *= (stage.options.w / stage.options.renderWidth);
                    sy *= (stage.options.h / stage.options.renderHeight);
                }
            }
            var parts = [];
            if (r) parts.push('rotate(' + r + 'rad)');
            if ((sx !== undefined && sy !== undefined) && (sx !== 1 || sy !== 1)) parts.push('scale(' + sx + ', ' + sy + ')');

            this.dhtml().style.transform = parts.join(' ');
        };

        var updateTextureAttribs = function(view) {
            if (view.texture) {
                const nonDefaults = view.texture.getNonDefaults()
                const keys = Object.keys(nonDefaults)
                keys.forEach(key => {
                    let f = ""
                    for (let i = 0, n = key.length; i < n; i++) {
                        const c = key.charAt(i)
                        if (c !== c.toLowerCase()) {
                            f += "_" + c.toLowerCase()
                        } else {
                            f += c
                        }
                    }
                    val(view, `texture-${f}`, nonDefaults[key], false);
                })
            }
        }

        const _performUpdateSource = Texture.prototype._performUpdateSource
        Texture.prototype._performUpdateSource = function() {
            _performUpdateSource.apply(this, arguments)
            const nonDefaults = this.getNonDefaults()
            this.views.forEach(v => {
                updateTextureAttribs(v)
            })
        }

        const _setDisplayedTexture = View.prototype._setDisplayedTexture
        View.prototype._setDisplayedTexture = function() {
            _setDisplayedTexture.apply(this, arguments)
            updateTextureAttribs(this)
        }

    }
}

if (typeof wuf !== "undefined") {
    // Sync loading. Auto attach immediately.
    attachInspector(wuf);
}
