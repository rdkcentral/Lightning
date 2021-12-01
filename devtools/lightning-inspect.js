/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 Metrological
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

window.attachInspector = function({Application, Element, ElementCore, Stage, Component, ElementTexturizer, Texture}) {

    const isAlreadyAttached = window.hasOwnProperty('mutationCounter');
    if (isAlreadyAttached) {
        return;
    }

    window.mutationCounter = 0;
    window.mutatingChildren = false;
    var observer = new MutationObserver(function(mutations) {
        var fa = ["x", "y", "w", "h", "alpha", "mountX", "mountY", "pivotX", "pivotY", "scaleX", "scaleY", "rotation", "visible", "clipping", "rect", "colorUl", "colorUr", "colorBl", "colorBr", "color", "borderWidthLeft", "borderWidthRight", "borderWidthTop", "borderWidthBottom", "borderWidth", "borderColorLeft", "borderColorRight", "borderColorTop", "borderColorBottom", "borderColor", "zIndex", "forceZIndexContext", "renderToTexture", "renderToTextureLazy", "renderOffscreen", "colorizeResultTexture", "texture"];
        var fac = fa.map(function(v) {return v.toLowerCase()});

        mutations.forEach(function(mutation) {
            if (mutation.type == 'childList') {

                var node = mutation.target;
                var c = mutation.target.element;
            }

            if (mutation.type == 'attributes' && mutation.attributeName !== 'style' && mutation.attributeName !== 'class') {
                var n = mutation.attributeName.toLowerCase();
                var c = mutation.target.element;

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

    ElementCore.prototype.dhtml = function() {
        return this._element.dhtml();
    }

    Element.prototype.dhtml = function() {
        if (!this.debugElement) {
            this.debugElement = document.createElement('DIV');
            this.debugElement.setAttribute('type', this.constructor.name);
            this.debugElement.element = this;
            this.debugElement.style.position = 'absolute';

            this.debugElement.id = "" + this.id;
            observer.observe(this.debugElement, {attributes: true});
        }
        if (this.stage.root === this && !this.dhtml_root) {
            // Root element.
            var root = document.createElement('DIV');
            document.body.appendChild(root);
            var self = this;
            let updateRootStyleFromCanvas = function (bcr) {
                root.style.left = bcr.left + 'px';
                root.style.top = bcr.top + 'px';
                root.style.width = Math.ceil(bcr.width / self.stage.getRenderPrecision()) + 'px';
                root.style.height = Math.ceil(bcr.height / self.stage.getRenderPrecision()) + 'px';
                root.style.transformOrigin = '0 0 0';
                root.style.transform = 'scale(' + self.stage.getRenderPrecision() + ',' + self.stage.getRenderPrecision() + ')';
            }

            if (ResizeObserver != null) {
                const resize_ob = new ResizeObserver(function (entries) {
                    updateRootStyleFromCanvas(entries[0].contentRect);
                });
                // start observing for resize
                resize_ob.observe(this.stage.getCanvas());
            } else {
                setTimeout(function () {
                    updateRootStyleFromCanvas(self.stage.getCanvas().getBoundingClientRect());
                }, 1000);
            }

            root.style.position = 'absolute';
            root.style.overflow = 'hidden';
            root.style.zIndex = '65535';
            root.appendChild(this.debugElement);

            this.dhtml_root = root;
        }
        return this.debugElement;
    };

    var oElement = Element;

    var oSetParent = oElement.prototype._setParent;
    Element.prototype._setParent = function(parent) {
        var prevParent = this.parent;
        oSetParent.apply(this, arguments);

        if (!window.mutatingChildren) {
            if (parent && parent.dhtml) {
                var index = parent._children.getIndex(this);
                if (index == parent._children.get().length - 1) {
                    parent.dhtml().appendChild(this.dhtml());
                } else {
                    parent.dhtml().insertBefore(this.dhtml(), parent.dhtml().children[index]);
                }
            } else {
                if (prevParent && prevParent.dhtml) {
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

    var oAddTag = oElement.prototype.addTag;
    Element.prototype.addTag = function(tag) {
        oAddTag.apply(this, arguments);

        if (tag) {
            this.dhtml().classList.add(tag);
        }
    };

    var oRemoveTag = oElement.prototype.removeTag;
    Element.prototype.removeTag = function(tag) {
        oRemoveTag.apply(this, arguments);

        if (tag) {
            this.dhtml().classList.remove(tag);
        }
    };

// Change an attribute due to new value inputs.
    var val = function(c, n, v, dv) {
        if (c._element) {
            c = c._element;
        }
        if (v == dv) {
            if (c.dhtmlRemoveAttribute) {
                c.dhtmlRemoveAttribute(n);
            }
        } else {
            if (c.dhtmlSetAttribute) {
                c.dhtmlSetAttribute(n, v);
            }
        }
    };

    var valStrict = function(c, n, v, dv) {
        if (c._element) {
            c = c._element;
        }
        if (v === dv) {
            if (c.dhtmlRemoveAttribute) {
                c.dhtmlRemoveAttribute(n);
            }
        } else {
            if (c.dhtmlSetAttribute) {
                c.dhtmlSetAttribute(n, v);
            }
        }
    };

    Element.prototype.dhtmlRemoveAttribute = function() {
        // We don't want the attribute listeners to be called during the next observer cycle.
        this.__ignore_attrib_changes = window.mutationCounter;
        this.dhtml().removeAttribute.apply(this.dhtml(), arguments);
    };

    Element.prototype.dhtmlSetAttribute = function() {
        this.__ignore_attrib_changes = window.mutationCounter;
        this.dhtml().setAttribute.apply(this.dhtml(), arguments);
    };

    if (typeof Component !== "undefined") {
        Object.defineProperty(Component.prototype, '_state', {
            get: function() {
                return this.__state;
            },
            set: function(v) {
                if (this.__state !== v) {
                    if (this.__state !== null) { // Ignore initial.
                        val(this, 'state', v ? v.__path : "", "");
                    }
                    this.__state = v;
                }
            }
        });
    }

    Element.prototype.$ref = Element.prototype.__ref;
    Object.defineProperty(Element.prototype, '__ref', {
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

    ElementCore.prototype.$x = ElementCore.prototype._x;
    Object.defineProperty(ElementCore.prototype, '_x', {
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

    ElementCore.prototype.$y = ElementCore.prototype._y;
    Object.defineProperty(ElementCore.prototype, '_y', {
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

    Element.prototype.$w = Element.prototype._w;
    Object.defineProperty(Element.prototype, '_w', {
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

    Element.prototype.$h = Element.prototype._h;
    Object.defineProperty(Element.prototype, '_h', {
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

    ElementCore.prototype.updateLeft = function() {
        var mx = this._mountX * this._w;
        var x = this._x - mx;
        this.dhtml().style.left = x + 'px';
    };

    ElementCore.prototype.updateTop = function() {
        var my = this._mountY * this._h;
        var y = this._y - my;
        this.dhtml().style.top = y + 'px';
    };

    ElementCore.prototype.__w = 0;
    Object.defineProperty(ElementCore.prototype, '_w', {
        get: function() {
            return this.__w;
        },
        set: function(v) {
            this.__w = v;
            this.dhtml().style.width = v + 'px';
            this.updateLeft();
        }
    });

    ElementCore.prototype.__h = 0;
    Object.defineProperty(ElementCore.prototype, '_h', {
        get: function() {
            return this.__h;
        },
        set: function(v) {
            this.__h = v;
            this.dhtml().style.height = v + 'px';
            this.updateTop();
        }
    });

    ElementCore.prototype.$alpha = 1;
    Object.defineProperty(ElementCore.prototype, '_alpha', {
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

    ElementCore.prototype.$visible = true;
    Object.defineProperty(ElementCore.prototype, '_visible', {
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

    ElementCore.prototype.$rotation = 0;
    Object.defineProperty(ElementCore.prototype, '_rotation', {
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


    ElementCore.prototype.$scaleX = 1;
    Object.defineProperty(ElementCore.prototype, '_scaleX', {
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

    ElementCore.prototype.$scaleY = 1;
    Object.defineProperty(ElementCore.prototype, '_scaleY', {
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

    ElementCore.prototype.$pivotX = 0.5;
    Object.defineProperty(ElementCore.prototype, '_pivotX', {
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

    ElementCore.prototype.$pivotY = 0.5;
    Object.defineProperty(ElementCore.prototype, '_pivotY', {
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

    ElementCore.prototype.$mountX = 0;
    Object.defineProperty(ElementCore.prototype, '_mountX', {
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

    ElementCore.prototype.$mountY = 0;
    Object.defineProperty(ElementCore.prototype, '_mountY', {
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

    ElementCore.prototype.__zIndex = 0;
    Object.defineProperty(ElementCore.prototype, '_zIndex', {
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

    ElementCore.prototype.__forceZIndexContext = false;
    Object.defineProperty(ElementCore.prototype, '_forceZIndexContext', {
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

    ElementCore.prototype.__clipping = false;
    Object.defineProperty(ElementCore.prototype, '_clipping', {
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

    ElementCore.prototype.__withinBoundsMargin = false;
    Object.defineProperty(ElementCore.prototype, '_withinBoundsMargin', {
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

    ElementCore.prototype.__colorUl = 0xFFFFFFFF;
    Object.defineProperty(ElementCore.prototype, '_colorUl', {
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

    ElementCore.prototype.__colorUr = 0xFFFFFFFF;
    Object.defineProperty(ElementCore.prototype, '_colorUr', {
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

    ElementCore.prototype.__colorBl = 0xFFFFFFFF;
    Object.defineProperty(ElementCore.prototype, '_colorBl', {
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

    ElementCore.prototype.__colorBr = 0xFFFFFFFF;
    Object.defineProperty(ElementCore.prototype, '_colorBr', {
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

    Element.prototype.$texture = null;
    Object.defineProperty(Element.prototype, '__texture', {
        get: function() {
            return this.$texture;
        },
        set: function(v) {
            this.$texture = v;

            val(this, 'rect', this.rect, false);
            val(this, 'src', this.src, null);
        }
    });

    Element.prototype.$testId = null;
    Object.defineProperty(Element.prototype, 'testId', {
        get: function() {
            return this.$testId;
        },
        set: function(v) {
            if (this.$testId !== v) {
                this.$testId = v;
                val(this, 'data-testid', v, null);
            }
        }
    });

    var checkColors = function(elementRenderer) {
        let element = elementRenderer._element;
        if (elementRenderer._colorBr === undefined) {
            // Element initialization.
            return;
        }

        if (elementRenderer._colorUl === elementRenderer._colorUr && elementRenderer._colorUl === elementRenderer._colorBl && elementRenderer._colorUl === elementRenderer._colorBr) {
            if (elementRenderer._colorUl !== 0xffffffff) {
                element.dhtmlSetAttribute('color', elementRenderer._colorUl.toString(16));
            } else {
                element.dhtmlRemoveAttribute('color');
            }
            element.dhtmlRemoveAttribute('colorul');
            element.dhtmlRemoveAttribute('colorur');
            element.dhtmlRemoveAttribute('colorbl');
            element.dhtmlRemoveAttribute('colorbr');
        } else {
            val(element, 'colorUr', elementRenderer.colorUr.toString(16), "ffffffff");
            val(element, 'colorUl', elementRenderer.colorUl.toString(16), "ffffffff");
            val(element, 'colorBr', elementRenderer.colorBr.toString(16), "ffffffff");
            val(element, 'colorBl', elementRenderer.colorBl.toString(16), "ffffffff");
            element.dhtmlRemoveAttribute('color');
        }
    };

    ElementTexturizer.prototype.__enabled = false;
    Object.defineProperty(ElementTexturizer.prototype, '_enabled', {
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

    ElementTexturizer.prototype.__lazy = false;
    Object.defineProperty(ElementTexturizer.prototype, '_lazy', {
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

    ElementTexturizer.prototype.__colorize = false;
    Object.defineProperty(ElementTexturizer.prototype, '_colorize', {
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

    ElementTexturizer.prototype.__renderOffscreen = false;
    Object.defineProperty(ElementTexturizer.prototype, '_renderOffscreen', {
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

    ElementCore.prototype.updateDebugTransforms = function() {
        const stage = this._element.stage

        if (this._pivotX !== 0.5 || this._pivotY !== 0.5) {
            this.dhtml().style.transformOrigin = (this._pivotX * 100) + '% '  + (this._pivotY * 100) + '%';
        } else if (this.dhtml().style.transformOrigin) {
            this.dhtml().style.transformOrigin = '50% 50%';
        }

        var r = this._rotation;
        var sx = this._scaleX;
        var sy = this._scaleY;

        if ((sx !== undefined && sy !== undefined) && (this._element.id === 0)) {
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

    var updateTextureAttribs = function(element) {
        if (element.texture) {
            const nonDefaults = element.texture.getNonDefaults()
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
                valStrict(element, `texture-${f}`, nonDefaults[key], false);
            })
        }
    }

    const _performUpdateSource = Texture.prototype._performUpdateSource
    Texture.prototype._performUpdateSource = function() {
        _performUpdateSource.apply(this, arguments)
        this.elements.forEach(v => {
            updateTextureAttribs(v)
        })
    }

    const _setDisplayedTexture = Element.prototype._setDisplayedTexture
    Element.prototype._setDisplayedTexture = function() {
        _setDisplayedTexture.apply(this, arguments)
        updateTextureAttribs(this)
    }

    const _updateFocus = Application.prototype.__updateFocus
    Application.prototype.__updateFocus = function() {
        const prev = this._focusPath && this._focusPath.length ? this._focusPath[this._focusPath.length - 1] : null;
        _updateFocus.apply(this, arguments)
        const focused = this._focusPath && this._focusPath.length ? this._focusPath[this._focusPath.length - 1] : null;

        if (prev != focused) {
            if (prev) {
                val(prev, 'focused', false, false);
            }
            if (focused) {
                val(focused, 'focused', true, false);
            }
        }
    }
};

if (window.lng) {
    // Automatically attach inspector if lng was already loaded.
    attachInspector(lng);
}
