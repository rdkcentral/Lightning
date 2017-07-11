var isNode = !!(((typeof module !== "undefined") && module.exports));

if (isNode) {
    var Utils = require('./Utils');
    var StageUtils = require('./StageUtils');
    var EventEmitter = require('events');
}

/**
 * An empty component that may contain other components (comparable to a div html element).
 * @constructor
 * @abstract
 */
var Component = function(stage) {
    EventEmitter.call(this);

    /**
     * The global id. May be used by c++ addons.
     * @type {number}
     */
    this.id = Stage.componentId++;

    /**
     * The update component lightweight object.
     * @type {UComponent}
     */
    this.uComponent = stage.adapter.getUComponentContext().createUComponentForComponent(this);

    /**
     * The stage that this component belongs to.
     * @type {Stage}
     */
    this.stage = stage;

    /**
     * 'Normal' children.
     * @type {Component[]}
     */
    this._children = [];

    /**
     * Manages the tags for this component.
     * @type {ComponentTags}
     */
    this._tags = new ComponentTags(this);
    
};

Utils.extendClass(Component, EventEmitter);

/**
 * A component is active if it is a descendant of the stage root, and if it is visible.
 * @type {boolean}
 */
Component.prototype.active = false;

/**
 * A component is active if it is a descendant of the stage root.
 * @type {boolean}
 */
Component.prototype.attached = false;

/**
 * @type {Component}
 */
Component.prototype.parent = null;

/**
 * Flag to quickly check if this component has children.
 * @type {boolean}
 */
Component.prototype.hasChildren = false;

Component.prototype._clipping = false;

Component.prototype._displayedTexture = null;

// Cache width & height, only maintained when component is active.
Component.prototype._renderWidth = 0;
Component.prototype._renderHeight = 0;

/**
 * Flag that indicates if this component has borders at all.
 * @type {boolean}
 */
Component.prototype.hasBorders = false;

/**
 * Color tint of this sprite.
 * @type {number}
 */
Component.prototype._colorUl = 0xffffffff;
Component.prototype._colorUr = 0xffffffff;
Component.prototype._colorBl = 0xffffffff;
Component.prototype._colorBr = 0xffffffff;

/**
 * The transitions (indexed by property index, null if not used).
 * @type {Transition[]}
 */
Component.prototype.transitions = null;

/**
 * All transitions, for quick looping.
 * @type {Set<Transition>}
 */
Component.prototype.transitionSet = null;

/**
 * All animations that have this component has subject.
 * @type {Set<Animation>}
 */
Component.prototype.animationSet = null;

Component.prototype._x = 0;
Component.prototype._y = 0;
Component.prototype._w = 0;
Component.prototype._h = 0;
Component.prototype._scaleX = 1;
Component.prototype._scaleY = 1;
Component.prototype._pivotX = 0.5;
Component.prototype._pivotY = 0.5;
Component.prototype._mountX = 0;
Component.prototype._mountY = 0;
Component.prototype._alpha = 1;
Component.prototype._rotation = 0;
Component.prototype._borderWidthTop = 0;
Component.prototype._borderWidthBottom = 0;
Component.prototype._borderWidthLeft = 0;
Component.prototype._borderWidthRight = 0;
Component.prototype._borderColorTop = 0xffffffff;
Component.prototype._borderColorBottom = 0xffffffff;
Component.prototype._borderColorLeft = 0xffffffff;
Component.prototype._borderColorRight = 0xffffffff;
Component.prototype._visible = true;

/**
 * Manages text rendering for this component. Lazy loaded.
 * @type {ComponentText}
 */
Component.prototype.textRenderer = null;

/**
 * The texture that is currently set.
 * This is changed when changing the src and should never be changed manually.
 * @type {Texture}
 */
Component.prototype._texture = null;

/**
 * The currently displayed texture. While Component.prototype.texture is loading, this one may be different.
 * @type {Texture}
 */
Component.prototype._displayedTexture = null;

/**
 * Image source, if set.
 * @type {String}
 * @private
 */
Component.prototype._src = null;

/**
 * If true, this component is being 'clipped' around the edges. For non-sprite components, the width and height
 * must be explicitly set.
 * @type {boolean}
 */
Component.prototype.clipping = false;

/**
 * The z-index, which determines the rendering order (in the same way as in HTML). 0 = no z-index.
 * @type {number}
 */
Component.prototype._zIndex = 0;

/**
 * If true, this component always behaves as a z-index context. Z-indexed descendants will never be rendered
 * outside of this context.
 * @type {boolean}
 */
Component.prototype._forceZIndexContext = false;

/**
 * A custom function which is called with a turtle to allow custom positioning.
 * @type {Function}
 */
Component.prototype._turtler = null;

/**
 * In case that this component is no longer visible, should it still be turtled?
 * This is roughly equivalent to setting hidden:false instead of display:none in CSS.
 * It can be used to still take space while not actually showing anything.
 * @type {boolean}
 * @private
 */
Component.prototype._turtleInvisible = false;

/**
 * This function is called when this component becomes active.
 * @type {Function}
 */
Component.prototype.notifyActivate = null;

/**
 * This function is called when this component becomes inactive.
 * @type {Function}
 */
Component.prototype.notifyDeactivate = null;

/**
 * The cached rotation value (because cos and sin are slow).
 * @type {number}
 */
Component.prototype.rotationCache = 0;
Component.prototype._sr = 0;
Component.prototype._cr = 1;


Component.prototype.setAsRoot = function() {
    this.active = true;
    this.updateActiveFlag();
    this.updateAttachedFlag();
    this.uComponent.setAsRoot();
};

Component.prototype.setParent = function(parent) {
    if (this.parent === parent) return;

    if (this.parent) {
        this.parent.hasChildren = (this.parent._children.length > 1);

        this._tags.unsetParent();
    }

    this.parent = parent;

    if (parent) {
        // Alpha, transform, translate.
        parent.hasChildren = true;

        this._tags.setParent(parent._tags);
    }

    this.updateActiveFlag();

    this.updateAttachedFlag();
};

Component.prototype.add = function(o) {
    if (o instanceof Component) {
        this.addChild(o);
        return o;
    } else if (Utils.isArray(o)) {
        for (var i = 0, n = o.length; i < n; i++) {
            this.add(o[i]);
        }
        return null;
    } else if (Utils.isPlainObject(o)) {
        var c = this.stage.c(o);
        this.addChild(c);
        return c;
    }
};

Component.prototype.addChild = function (child) {
    if (child.parent === this && this._children.indexOf(child) >= 0) {
        return child;
    }
    this.addChildAt(child, this._children.length);
};

Component.prototype.addChildren = function (children) {
    var i, n = children.length;
    for (i = 0; i < n; i++) {
        this.addChild(children[i]);
    }
};

Component.prototype.setChildren = function (children) {
    this.removeChildren();
    this.addChildren(children);
};

Component.prototype.addChildAt = function (child, index) {
    // prevent adding self as child
    if (child === this) {
        return
    }

    if (index >= 0 && index <= this._children.length) {
        if (child.parent === this && this._children.indexOf(child) === index) {
            // Ignore.
        } else {
            if (child.parent) {
                var p = child.parent;
                p.removeChild(child);
            }

            child.setParent(this);
            this._children.splice(index, 0, child);

            // Sync.
            this.uComponent.insertChild(index, child.uComponent);
        }

        return;
    } else {
        throw new Error(child + 'addChildAt: The index '+ index +' supplied is out of bounds ' + this.children.length);
    }
};

Component.prototype.getChildIndex = function (child) {
    return this._children.indexOf(child);
};

Component.prototype.removeChild = function (child) {
    var index = this._children.indexOf(child);

    if (index !== -1) {
        this.removeChildAt(index);
    }
};

Component.prototype.removeChildAt = function (index) {
    var child = this._children[index];

    child.setParent(null);
    this._children.splice(index, 1);

    // Sync.
    this.uComponent.removeChild(index);

    return child;
};

Component.prototype.removeChildren = function() {
    var n = this._children.length;
    if (n) {
        for (var i = 0; i < n; i++) {
            var child = this._children[i];
            child.setParent(null);
        }
        this._children.splice(0, n);

        // Sync.
        this.uComponent.clearChildren();
    }
};

Component.prototype.getDepth = function() {
    var depth = 0;

    var p = this;
    do {
        depth++;
        p = p.parent;
    } while(p);

    return depth;
};

Component.prototype.getAncestor = function(l) {
    var p = this;
    while(l > 0 && p.parent) {
        p = p.parent;
        l--;
    }
    return p;
};

Component.prototype.getAncestorAtDepth = function(depth) {
    var levels = this.getDepth() - depth;
    if (levels < 0) {
        return null;
    }
    return this.getAncestor(levels);
};

Component.prototype.isAncestorOf = function(c) {
    var p = c;
    while(p.parent) {
        if (this === p) {
            return true;
        }
        p = p.parent;
    }
    return false;
};

Component.prototype.getSharedAncestor = function(c) {
    var o1 = this;
    var o2 = c;
    var l1 = o1.getDepth();
    var l2 = o2.getDepth();
    if (l1 > l2) {
        o1 = o1.getAncestor(l1 - l2);
    } else if (l2 > l1) {
        o2 = o2.getAncestor(l2 - l1);
    }

    do {
        if (o1 === o2) {
            return o1;
        }

        o1 = o1.parent;
        o2 = o2.parent;
    } while(o1 && o2);

    return null;
};

Component.prototype.isActive = function() {
    return this._visible && (this._alpha > 0) && (this.parent ? this.parent.active : (this.stage.root === this));
};

Component.prototype.isAttached = function() {
    return (this.parent ? this.parent.attached : (this.stage.root === this));
};

/**
 * Updates the 'active' flag for this branch.
 * @private
 */
Component.prototype.updateActiveFlag = function() {
    // Calculate active flag.
    var newActive = this.isActive();
    if (this.active !== newActive) {
        if (newActive) {
            if (this.zIndex != 0) {
                // Component uses z-index.
                this.stage.zIndexUsage++;
            }

            // Detect texture changes.
            var dt = null;
            if (this.texture && this.texture.source.glTexture) {
                dt = this.texture;
                this.texture.addComponent(this);
            } else if (this.displayedTexture && this.displayedTexture.source.glTexture) {
                dt = this.displayedTexture;
            }

            this.displayedTexture = dt;

            // Force re-check of texture because dimensions might have changed (cutting).
            this.checkForResize();
            this._updateTextureCoords();

            this.active = newActive;

            if (this.texture) {
                // It is important to add the source listener before the texture listener because that may trigger a load.
                this.texture.addComponent(this);
            }

            if (this.displayedTexture && this.displayedTexture !== this.texture) {
                this.displayedTexture.addComponent(this);
            }
        } else {
            if (this.zIndex != 0) {
                // Component uses z-index.
                this.stage.zIndexUsage--;
            }

            if (this.texture) {
                this.texture.removeComponent(this, true);
            }

            if (this.displayedTexture) {
                this.displayedTexture.removeComponent(this, true);
            }

            this.active = newActive;
        }

        var m = this._children.length;
        if (m > 0) {
            for (var i = 0; i < m; i++) {
                this._children[i].updateActiveFlag();
            }
        }

        // Run this after all _children because we'd like to see (de)activating a branch as an 'atomic' operation.
        if (newActive) {
            this.notifyActivate && this.notifyActivate();
        } else {
            this.notifyDeactivate && this.notifyDeactivate();
        }
    }
};

/**
 * Updates the 'attached' flag for this branch.
 * @private
 */
Component.prototype.updateAttachedFlag = function() {
    // Calculate active flag.
    var newAttached = this.isAttached();
    if (this.attached !== newAttached) {
        this.attached = newAttached;

        if (newAttached) {
            var self = this;

            // Check if there are remaining active transitions that should be re-activated.
            if (this.transitionSet) {
                this.transitionSet.forEach(function(transition) {
                    if (transition.isActive()) {
                        self.stage.addActiveTransition(transition);
                    }
                });
            }

            if (this.animationSet) {
                this.animationSet.forEach(function(animation) {
                    if (animation.isActive()) {
                        self.stage.addActiveAnimation(animation);
                    }
                });
            }
        }

        var m = this._children.length;
        if (m > 0) {
            for (var i = 0; i < m; i++) {
                this._children[i].updateAttachedFlag();
            }
        }
    }
};

Component.prototype.addAnimation = function(a) {
    if (!this.animationSet) {
        this.animationSet = new Set();
    }
    this.animationSet.add(a);
};

Component.prototype.removeAnimation = function(a) {
    this.animationSet.delete(a);
};

Component.prototype.animation = function(settings) {
    var a = this.stage.animation(settings);
    a.subject = this;
    return a;
};

Component.prototype.a = function(settings) {
    return this.animation(settings);
};

Component.prototype.transition = function(property, settings) {
    var props = Component.propAliases.get(property);
    if (settings || settings === null) {
        if (props) {
            for (var i = 0, n = props.length; i < n; i++) {
                this.setPropertyTransition(props[i], settings);
            }
            return settings ? this.getPropertyTransition(props[0]) : null;
        } else {
            return this.setPropertyTransition(property, settings);
        }
    } else {
        return this.getPropertyTransition(property, settings);
    }
};

Component.prototype.t = function(property, settings) {
    this.transition(property, settings);
};

Component.prototype.fastForward = function(property) {
    var props = Component.propAliases.get(property);
    if (!props) props = [property];
    for (var i = 0, n = props.length; i < n; i++) {
        var name = props[i];
        var setting = Component.SETTINGS[name];
        if (setting && setting.m) {
            var t = this.getPropertyTransition(name);
            if (t) {
                t.updateTargetValue(setting.g(this), setting.g(this));
            }
        } else {
            console.warn("Unknown transition property: " + name);
        }
    }
};

Component.prototype.getRenderWidth = function() {
    if (this.active) {
        return this._renderWidth;
    } else {
        return this._getRenderWidth();
    }
};

Component.prototype._getRenderWidth = function() {
    if (this._w) {
        return this._w;
    } else if (this.texture && this.texture.source.glTexture) {
        // Texture already loaded, but not yet updated (probably because it's not active).
        return (this.texture.w || (this.texture.source.w / this.texture.precision));
    } else if (this.displayedTexture) {
        return (this.displayedTexture.w || (this.displayedTexture.source.w / this.displayedTexture.precision));
    } else {
        return 0;
    }
};

Component.prototype.getRenderHeight = function() {
    if (this.active) {
        return this._renderHeight;
    } else {
        return this._getRenderHeight();
    }
};

Component.prototype._getRenderHeight = function() {
    if (this._h) {
        return this._h;
    } else if (this.texture && this.texture.source.glTexture) {
        // Texture already loaded, but not yet updated (probably because it's not active).
        return (this.texture.h || this.texture.source.h) / this.texture.precision;
    } else if (this.displayedTexture) {
        return (this.displayedTexture.h || this.displayedTexture.source.h) / this.displayedTexture.precision;
    } else {
        return 0;
    }
};

Component.prototype.setPropertyTransition = function(property, settings) {
    var propertyIndex = Component.getPropertyIndex(property);
    if (propertyIndex == -1) {
        throw new Error("Unknown transition property: " + property);
    }

    if (!settings) {
        if (this.transitions) {
            if (this.transitions[propertyIndex]) {
                var setting = Component.SETTINGS[property];
                setting.sf(this, setting.g(this));
                this.stage.activeTransitions.delete(this.transitions[propertyIndex]);
                this.transitionSet.delete(this.transitions[propertyIndex]);
                this.transitions[propertyIndex] = null;
            }
        }
    } else {
        // Only reset on change.
        if (!this.transitions) {
            this.transitions = new Array(Component.nTransitions);
            this.transitionSet = new Set();
        }
        if (!this.transitions[propertyIndex]) {
            this.transitions[propertyIndex] = new Transition(this, property);
            this.transitionSet.add(this.transitions[propertyIndex]);
        }
        this.transitions[propertyIndex].set(settings);
    }

    return this.transitions[propertyIndex];
};

Component.prototype.getPropertyTransition = function(property) {
    var propertyIndex = Component.getPropertyIndex(property);
    if (propertyIndex == -1) {
        throw new Error("Unknown transition property: " + property);
    }

    if (this.transitions && this.transitions[propertyIndex]) {
        return this.transitions[propertyIndex];
    } else {
        return null;
    }
};

Component.prototype.getCornerPoints = function() {
    return this.uComponent.getCornerPoints();
};

Component.prototype.getLocationString = function() {
    var i;
    if (this.parent) {
        i = this.parent._children.indexOf(this);
        if (i >= 0) {
            var localTags = this.getTags();
            return this.parent.getLocationString() + ":" + i + "[" + this.id + "]" + (localTags.length ? "(" + localTags.join(",") + ")" : "");
        }
    }
    return "";
};

Component.prototype.getTags = function() {
    return this._tags.getLocalTags();
};

Component.prototype.setTags = function(tags) {
    this._tags.setTags(tags);
};

Component.prototype.addTag = function(tag) {
    this._tags.addTag(tag);
};

Component.prototype.removeTag = function(tag) {
    this._tags.removeTag(tag);
};

Component.prototype.hasTag = function(tag) {
    return this._tags.hasTag(tag);
};

Component.prototype.tag = function(tag) {
    return this._tags.tag(tag);
};

Component.prototype.mtag = function(tag) {
    return this._tags.mtag(tag);
};

Component.prototype.stag = function(tag, settings) {
    var t = this.mtag(tag);
    var n = t.length;
    for (var i = 0; i < n; i++) {
        t[i].set(settings);
    }
};

Component.prototype.onTextureSourceLoaded = function() {
    // Now we can start showing this texture.
    this.displayedTexture = this.texture;
};

Component.prototype.onTextureSourceLoadError = function(e) {
    if (this._eventsCount) {
        this.emit('txError', e, this.texture.source);
    }
};

Component.prototype.onTextureSourceAddedToTextureAtlas = function() {
    this._updateTextureCoords();
};

Component.prototype.onTextureSourceRemovedFromTextureAtlas = function() {
    this._updateTextureCoords();
};

Component.prototype.onDisplayedTextureClippingChanged = function() {
    this._renderWidth = this._getRenderWidth();
    this._renderHeight = this._getRenderHeight();

    this._updateLocalDimensions();
    this._updateTextureCoords();
};

Component.prototype.onPrecisionChanged = function() {
    this._renderWidth = this._getRenderWidth();
    this._renderHeight = this._getRenderHeight();

    this._updateLocalDimensions();
};

Component.prototype.set = function(obj) {
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
        var value = obj[keys[i]];
        this.setSetting(keys[i], value);
    }
};

Component.prototype.setSetting = function(name, value) {
    var aliases = Component.propAliases.get(name);
    if (aliases) {
        for (var i = 0, n = aliases.length; i < n; i++) {
            this.setSetting(aliases[i], value);
        }
        return;
    }

    switch(name) {
        case 'transitions':
            if (!Utils.isObject(value)) {
                throw new TypeError('Transitions must be object.');
            }

            for (var key in value) {
                this.transition(key, value[key]);
            }

            break;
        default:
            var setting = Component.SETTINGS[name];
            if (setting) {
                setting.s(this, value);
            } else {
                setting = Component.FINAL_SETTINGS[name];
                if (setting) {
                    setting.sf(this, value);
                } else {
                    throw new Error("Unknown component property: " + name);
                }
            }
    }
};

Component.prototype.toString = function() {
    var obj = this.getSettingsObject();
    return Component.getPrettyJsonified(obj, "");
};

Component.getPrettyJsonified = function(obj, indent) {
    var children = obj.children;
    delete obj.children;

    // Convert singular json settings object.
    var colorKeys = ["color", "colorUl", "colorUr", "colorBl", "colorBr", "borderColor", "borderColorTop", "borderColorBottom", "borderColorLeft", "borderColorRight"]
    var str = JSON.stringify(obj, function(k, v) {
        if (colorKeys.indexOf(k) !== -1) {
            return "COLOR[" + v.toString(16) + "]";
        }
        return v;
    });
    str = str.replace(/"COLOR\[([a-f0-9]{1,8})\]"/g, "0x$1");

    if (children && children.length) {
        var isEmpty = (str === "{}");
        str = str.substr(0, str.length - 1) + (isEmpty ? "" : ",") + "\"children\":[\n";
        var n = children.length;
        for (var i = 0; i < n; i++) {
            str += Component.getPrettyJsonified(children[i], indent + "  ") + (i < n - 1 ? "," : "") + "\n";
        }
        str += indent + "]}";
    }

    return indent + str;
};

Component.prototype.getSettingsObject = function() {
    var obj = this.getNonDefaults();
    if (this.hasChildren) {
        obj.children = this._children.map(function(c) {
            return c.getSettingsObject();
        });
    }
    return obj;
};

Component.prototype.getNonDefaults = function() {
    var nonDefaults = {};

    if (this._tags && this._tags.tags) {
        nonDefaults['tags'] = this.getTags();
    }

    if (this.x !== 0) nonDefaults['x'] = this.x;
    if (this.y !== 0) nonDefaults['y'] = this.y;
    if (this.w !== 0) nonDefaults['w'] = this.w;
    if (this.h !== 0) nonDefaults['h'] = this.h;

    if (this.alpha !== 1) nonDefaults['alpha'] = this.alpha;
    if (this.rotation !== 0) nonDefaults['rotation'] = this.rotation;
    if (this.visible !== true) nonDefaults['visible'] = this.visible;
    if (this.clipping !== false) nonDefaults['clipping'] = this.clipping;
    if (this.zIndex) nonDefaults['zIndex'] = this.zIndex;
    if (this.forceZIndexContext !== false) nonDefaults['forceZIndexContext'] = this.forceZIndexContext;

    if (this.textRenderer) {
        nonDefaults['text'] = this.textRenderer.settings.getNonDefaults();
    }

    if (this.src) nonDefaults['src'] = this.src;

    if (this.rect) nonDefaults['rect'] = true;


    if (this.scaleX !== 1 && this.scaleX === this.scaleY) {
        nonDefaults['scale'] = this.scaleX;
    } else {
        if (this.scaleX !== 1) nonDefaults['scaleX'] = this.scaleX;
        if (this.scaleY !== 1) nonDefaults['scaleY'] = this.scaleY;
    }

    if (this.pivotX !== 0.5) nonDefaults['pivotX'] = this.pivotX;
    if (this.pivotY !== 0.5) nonDefaults['pivotY'] = this.pivotY;

    if (this.mountX !== 0) nonDefaults['mountX'] = this.mountX;
    if (this.mountY !== 0) nonDefaults['mountY'] = this.mountY;

    if (this.borderWidthTop !== 0 && this.borderWidthTop === this.borderWidthBottom && this.borderWidthTop === this.borderWidthLeft && this.borderWidthTop === this.borderWidthRight) {
        nonDefaults['borderWidth'] = this.borderWidthTop;
    } else {
        if (this.borderWidthTop !== 0) nonDefaults['borderWidthTop'] = this.borderWidthTop;
        if (this.borderWidthBottom !== 0) nonDefaults['borderWidthBottom'] = this.borderWidthBottom;
        if (this.borderWidthLeft !== 0) nonDefaults['borderWidthLeft'] = this.borderWidthLeft;
        if (this.borderWidthRight !== 0) nonDefaults['borderWidthRight'] = this.borderWidthRight;
    }

    if (this.borderColorTop !== 0xffffffff && this.borderColorTop === this.borderColorBottom && this.borderColorTop === this.borderColorLeft && this.borderColorTop === this.borderColorRight) {
        nonDefaults['borderColor'] = this.borderColorTop;
    } else {
        if (this.borderColorTop !== 0xffffffff) nonDefaults['borderColorTop'] = this.borderColorTop;
        if (this.borderColorBottom !== 0xffffffff) nonDefaults['borderColorBottom'] = this.borderColorBottom;
        if (this.borderColorLeft !== 0xffffffff) nonDefaults['borderColorLeft'] = this.borderColorLeft;
        if (this.borderColorRight !== 0xffffffff) nonDefaults['borderColorRight'] = this.borderColorRight;
    }

    if (this.colorUl !== 0xffffffff && this.colorUl === this.colorUr && this.colorUl === this.colorBl && this.colorUl === this.colorBr) {
        nonDefaults['color'] = this.colorUl;
    } else {
        if (this.colorUl !== 0xffffffff) nonDefaults['colorUl'] = this.colorUl;
        if (this.colorUr !== 0xffffffff) nonDefaults['colorUr'] = this.colorUr;
        if (this.colorBl !== 0xffffffff) nonDefaults['colorBl'] = this.colorBl;
        if (this.colorBr !== 0xffffffff) nonDefaults['colorBr'] = this.colorBr;
    }

    if (this.texture) {
        var tnd = this.texture.getNonDefaults();
        if (Object.keys(tnd).length) {
            nonDefaults['texture'] = tnd;
        }
    }

    return nonDefaults;
};


Component.prototype.hasEqualColors = function() {
    return (this._colorUl === this._colorUr) && (this._colorUl === this._colorBr) && (this._colorUl === this._colorBl);
};

Component.prototype.checkForResize = function() {
    var beforeW = this._renderWidth;
    var beforeH = this._renderHeight;
    this._renderWidth = this._getRenderWidth();
    this._renderHeight = this._getRenderHeight();
    if (beforeW !== this._renderWidth || beforeH !== this._renderHeight) {
        // Due to width/height change: update the translation vector and borders.
        this._updateLocalDimensions();
    }
};

/**
 * Holds the known property aliases.
 * @type {Map<string, string[]>}
 */
Component.propAliases = new Map();
Component.propAliases.set("scale", ["scaleX", "scaleY"]);
Component.propAliases.set("borderWidth", ["borderWidthTop", "borderWidthBottom", "borderWidthLeft", "borderWidthRight"]);
Component.propAliases.set("borderColor", ["borderColorTop", "borderColorBottom", "borderColorLeft", "borderColorRight"]);
Component.propAliases.set("color", ["colorUl", "colorUr", "colorBl", "colorBr"]);
Component.propAliases.set("colorTop", ["colorUl", "colorUr"]);
Component.propAliases.set("colorBottom", ["colorBl", "colorBr"]);
Component.propAliases.set("colorLeft", ["colorUl", "colorBl"]);
Component.propAliases.set("colorRight", ["colorUr", "colorBr"]);

Object.defineProperty(Component.prototype, 'renderWidth', {
    get: function () {
        return this.getRenderWidth();
    }
});

Object.defineProperty(Component.prototype, 'renderHeight', {
    get: function () {
        return this.getRenderHeight();
    }
});

Object.defineProperty(Component.prototype, 'x', {
    get: function () {
        if (this.transitions && this.transitions[0]) {
            return this.transitions[0].targetValue;
        } else {
            return this.X;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[0]) {
            this.setTransitionTargetValue(this.transitions[0], v, this.X);
        } else {
            this.X = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'X', {
    get: function () {
        return this._x;
    },
    set: function(v) {
        var pv = this._x;
        if (pv !== v) {
            this._x = v;
            this._updateLocalTranslateDelta(v - pv, 0);
        }
    }
});

Object.defineProperty(Component.prototype, 'y', {
    get: function () {
        if (this.transitions && this.transitions[1]) {
            return this.transitions[1].targetValue;
        } else {
            return this.Y;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[1]) {
            this.setTransitionTargetValue(this.transitions[1], v, this.Y);
        } else {
            this.Y = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'Y', {
    get: function () {
        return this._y;
    },
    set: function(v) {
        var pv = this._y;
        if (pv !== v) {
            this._y = v;
            this._updateLocalTranslateDelta(0, v - pv);
        }
    }
});

Object.defineProperty(Component.prototype, 'w', {
    get: function () {
        if (this.transitions && this.transitions[2]) {
            return this.transitions[2].targetValue;
        } else {
            return this.W;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[2]) {
            this.setTransitionTargetValue(this.transitions[2], v, this.W);
        } else {
            this.W = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'W', {
    get: function () {
        return this._w;
    },
    set: function(v) {
        var pv = this._w;
        if (pv !== v) {
            this._w = v;
            this._renderWidth = this._getRenderWidth();
            this._updateLocalDimensions();
        }
    }
});

Object.defineProperty(Component.prototype, 'h', {
    get: function () {
        if (this.transitions && this.transitions[3]) {
            return this.transitions[3].targetValue;
        } else {
            return this.H;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[3]) {
            this.setTransitionTargetValue(this.transitions[3], v, this.H);
        } else {
            this.H = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'H', {
    get: function () {
        return this._h;
    },
    set: function(v) {
        var pv = this._h;
        if (pv !== v) {
            this._h = v;
            this._renderHeight = this._getRenderHeight();
            this._updateLocalDimensions();
        }
    }
});

Object.defineProperty(Component.prototype, 'scaleX', {
    get: function () {
        if (this.transitions && this.transitions[4]) {
            return this.transitions[4].targetValue;
        } else {
            return this.SCALEX;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[4]) {
            this.setTransitionTargetValue(this.transitions[4], v, this.SCALEX);
        } else {
            this.SCALEX = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'SCALEX', {
    get: function () {
        return this._scaleX;
    },
    set: function(v) {
        var pv = this._scaleX;
        if (pv !== v) {
            this._scaleX = v;
            this._updateLocalTransform();
        }
    }
});

Object.defineProperty(Component.prototype, 'scaleY', {
    get: function () {
        if (this.transitions && this.transitions[5]) {
            return this.transitions[5].targetValue;
        } else {
            return this.SCALEY;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[5]) {
            this.setTransitionTargetValue(this.transitions[5], v, this.SCALEY);
        } else {
            this.SCALEY = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'SCALEY', {
    get: function () {
        return this._scaleY;
    },
    set: function(v) {
        var pv = this._scaleY;
        if (pv !== v) {
            this._scaleY = v;
            this._updateLocalTransform();
        }
    }
});

Object.defineProperty(Component.prototype, 'pivotX', {
    get: function () {
        if (this.transitions && this.transitions[6]) {
            return this.transitions.get('pivotX').targetValue;
        } else {
            return this.PIVOTX;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[6]) {
            this.setTransitionTargetValue(this.transitions[6], v, this.PIVOTX);
        } else {
            this.PIVOTX = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'PIVOTX', {
    get: function () {
        return this._pivotX;
    },
    set: function(v) {
        var pv = this._pivotX;
        if (pv !== v) {
            this._pivotX = v;
            this._updateLocalTranslate();
        }
    }
});

Object.defineProperty(Component.prototype, 'pivotY', {
    get: function () {
        if (this.transitions && this.transitions[7]) {
            return this.transitions[7].targetValue;
        } else {
            return this.PIVOTY;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[7]) {
            this.setTransitionTargetValue(this.transitions[7], v, this.PIVOTY);
        } else {
            this.PIVOTY = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'PIVOTY', {
    get: function () {
        return this._pivotY;
    },
    set: function(v) {
        var pv = this._pivotY;
        if (pv !== v) {
            this._pivotY = v;
            this._updateLocalTranslate();
        }
    }
});

Object.defineProperty(Component.prototype, 'mountX', {
    get: function () {
        if (this.transitions && this.transitions[8]) {
            return this.transitions[8].targetValue;
        } else {
            return this.MOUNTX;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[8]) {
            this.setTransitionTargetValue(this.transitions[8], v, this.MOUNTX);
        } else {
            this.MOUNTX = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'MOUNTX', {
    get: function () {
        return this._mountX;
    },
    set: function(v) {
        var pv = this._mountX;
        if (pv !== v) {
            this._mountX = v;
            this._updateLocalTranslate();
        }
    }
});

Object.defineProperty(Component.prototype, 'mountY', {
    get: function () {
        if (this.transitions && this.transitions[9]) {
            return this.transitions[9].targetValue;
        } else {
            return this.MOUNTY;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[9]) {
            this.setTransitionTargetValue(this.transitions[9], v, this.MOUNTY);
        } else {
            this.MOUNTY = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'MOUNTY', {
    get: function () {
        return this._mountY;
    },
    set: function(v) {
        var pv = this._mountY;
        if (pv !== v) {
            this._mountY = v;
            this._updateLocalTranslate();
        }
    }
});

Object.defineProperty(Component.prototype, 'alpha', {
    get: function () {
        if (this.transitions && this.transitions[10]) {
            return this.transitions[10].targetValue;
        } else {
            return this.ALPHA;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[10]) {
            this.setTransitionTargetValue(this.transitions[10], v, this.ALPHA);
        } else {
            this.ALPHA = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'ALPHA', {
    get: function () {
        return this._alpha;
    },
    set: function(v) {
        if (v > 1) {
            v = 1;
        } else if (v < 0) {
            v = 0;
        }

        if (v < 1e-14) {
            // Tiny rounding errors may cause failing visibility tests.
            v = 0;
        }

        var pv = this._alpha;
        if (pv !== v) {
            this._alpha = v;
            this._updateLocalAlpha();
            if ((pv === 0) !== (v === 0)) {
                this.updateActiveFlag();
            }
        }
    }
});

Object.defineProperty(Component.prototype, 'rotation', {
    get: function () {
        if (this.transitions && this.transitions[11]) {
            return this.transitions[11].targetValue;
        } else {
            return this.ROTATION;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[11]) {
            this.setTransitionTargetValue(this.transitions[11], v, this.ROTATION);
        } else {
            this.ROTATION = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'ROTATION', {
    get: function () {
        return this._rotation;
    },
    set: function(v) {
        var pv = this._rotation;
        if (pv !== v) {
            this._rotation = v;
            this._updateLocalTransform();
        }
    }
});

Object.defineProperty(Component.prototype, 'borderWidthTop', {
    get: function () {
        if (this.transitions && this.transitions[12]) {
            return this.transitions[12].targetValue;
        } else {
            return this.BORDERWIDTHTOP;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[12]) {
            this.setTransitionTargetValue(this.transitions[12], v, this.BORDERWIDTHTOP);
        } else {
            this.BORDERWIDTHTOP = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'BORDERWIDTHTOP', {
    get: function () {
        return this._borderWidthTop;
    },
    set: function(v) {
        var pv = this._borderWidthTop;
        if (pv !== v) {
            this._borderWidthTop = v;
            if ((pv === 0) !== (v === 0)) {
                this.hasBorders = this._borderWidthTop || this._borderWidthBottom || this._borderWidthLeft || this._borderWidthRight;
            }

            this.uComponent.setBorderTop(this._borderWidthTop, this._borderColorTop);
        }
    }
});

Object.defineProperty(Component.prototype, 'borderWidthBottom', {
    get: function () {
        if (this.transitions && this.transitions[13]) {
            return this.transitions[13].targetValue;
        } else {
            return this.BORDERWIDTHBOTTOM;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[13]) {
            this.setTransitionTargetValue(this.transitions[13], v, this.BORDERWIDTHBOTTOM);
        } else {
            this.BORDERWIDTHBOTTOM = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'BORDERWIDTHBOTTOM', {
    get: function () {
        return this._borderWidthBottom;
    },
    set: function(v) {
        var pv = this._borderWidthBottom;
        if (pv !== v) {
            this._borderWidthBottom = v;
            if ((pv === 0) !== (v === 0)) {
                this.hasBorders = this._borderWidthBottom || this._borderWidthBottom || this._borderWidthLeft || this._borderWidthRight;
            }

            this.uComponent.setBorderBottom(this._borderWidthBottom, this._borderColorBottom);
        }
    }
});

Object.defineProperty(Component.prototype, 'borderWidthLeft', {
    get: function () {
        if (this.transitions && this.transitions[14]) {
            return this.transitions[14].targetValue;
        } else {
            return this.BORDERWIDTHLEFT;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[14]) {
            this.setTransitionTargetValue(this.transitions[14], v, this.BORDERWIDTHLEFT);
        } else {
            this.BORDERWIDTHLEFT = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'BORDERWIDTHLEFT', {
    get: function () {
        return this._borderWidthLeft;
    },
    set: function(v) {
        var pv = this._borderWidthLeft;
        if (pv !== v) {
            this._borderWidthLeft = v;
            if ((pv === 0) !== (v === 0)) {
                this.hasBorders = this._borderWidthLeft || this._borderWidthBottom || this._borderWidthLeft || this._borderWidthRight;
            }
            this.uComponent.setBorderLeft(this._borderWidthLeft, this._borderColorLeft);
        }
    }
});

Object.defineProperty(Component.prototype, 'borderWidthRight', {
    get: function () {
        if (this.transitions && this.transitions[15]) {
            return this.transitions[15].targetValue;
        } else {
            return this.BORDERWIDTHRIGHT;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[15]) {
            this.setTransitionTargetValue(this.transitions[15], v, this.BORDERWIDTHRIGHT);
        } else {
            this.BORDERWIDTHRIGHT = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'BORDERWIDTHRIGHT', {
    get: function () {
        return this._borderWidthRight;
    },
    set: function(v) {
        var pv = this._borderWidthRight;
        if (pv !== v) {
            this._borderWidthRight = v;
            if ((pv === 0) !== (v === 0)) {
                this.hasBorders = this._borderWidthRight || this._borderWidthBottom || this._borderWidthRight || this._borderWidthRight;
            }
            this.uComponent.setBorderRight(this._borderWidthRight, this._borderColorRight);
        }
    }
});

Object.defineProperty(Component.prototype, 'borderColorTop', {
    get: function () {
        if (this.transitions && this.transitions[16]) {
            return this.transitions[16].targetValue;
        } else {
            return this.BORDERCOLORTOP;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[16]) {
            this.setTransitionTargetValue(this.transitions[16], v, this.BORDERCOLORTOP);
        } else {
            this.BORDERCOLORTOP = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'BORDERCOLORTOP', {
    get: function () {
        return this._borderColorTop;
    },
    set: function(v) {
        var pv = this._borderColorTop;
        if (pv !== v) {
            this._borderColorTop = v;
            this.uComponent.setBorderTop(this._borderWidthTop, this._borderColorTop);
        }
    }
});

Object.defineProperty(Component.prototype, 'borderColorBottom', {
    get: function () {
        if (this.transitions && this.transitions[17]) {
            return this.transitions[17].targetValue;
        } else {
            return this.BORDERCOLORBOTTOM;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[17]) {
            this.setTransitionTargetValue(this.transitions[17], v, this.BORDERCOLORBOTTOM);
        } else {
            this.BORDERCOLORBOTTOM = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'BORDERCOLORBOTTOM', {
    get: function () {
        return this._borderColorBottom;
    },
    set: function(v) {
        var pv = this._borderColorBottom;
        if (pv !== v) {
            this._borderColorBottom = v;
            this.uComponent.setBorderBottom(this._borderWidthBottom, this._borderColorBottom);
        }
    }
});

Object.defineProperty(Component.prototype, 'borderColorLeft', {
    get: function () {
        if (this.transitions && this.transitions[18]) {
            return this.transitions[18].targetValue;
        } else {
            return this.BORDERCOLORLEFT;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[18]) {
            this.setTransitionTargetValue(this.transitions[18], v, this.BORDERCOLORLEFT);
        } else {
            this.BORDERCOLORLEFT = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'BORDERCOLORLEFT', {
    get: function () {
        return this._borderColorLeft;
    },
    set: function(v) {
        var pv = this._borderColorLeft;
        if (pv !== v) {
            this._borderColorLeft = v;
            this.uComponent.setBorderLeft(this._borderWidthLeft, this._borderColorLeft);
        }
    }
});

Object.defineProperty(Component.prototype, 'borderColorRight', {
    get: function () {
        if (this.transitions && this.transitions[19]) {
            return this.transitions[19].targetValue;
        } else {
            return this.BORDERCOLORRIGHT;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[19]) {
            this.setTransitionTargetValue(this.transitions[19], v, this.BORDERCOLORRIGHT);
        } else {
            this.BORDERCOLORRIGHT = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'BORDERCOLORRIGHT', {
    get: function () {
        return this._borderColorRight;
    },
    set: function(v) {
        var pv = this._borderColorRight;
        if (pv !== v) {
            this._borderColorRight = v;
            this.uComponent.setBorderRight(this._borderWidthRight, this._borderColorRight);
        }
    }
});

Object.defineProperty(Component.prototype, 'colorUl', {
    get: function () {
        if (this.transitions && this.transitions[20]) {
            return this.transitions[20].targetValue;
        } else {
            return this.COLORTOPLEFT;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[20]) {
            this.setTransitionTargetValue(this.transitions[20], v, this.COLORTOPLEFT);
        } else {
            this.COLORTOPLEFT = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'COLORTOPLEFT', {
    get: function () {
        return this._colorUl;
    },
    set: function(v) {
        var pv = this._colorUl;
        if (pv !== v) {
            this._colorUl = v;
            this.uComponent.setColorUl(v);
        }
    }
});

Object.defineProperty(Component.prototype, 'colorUr', {
    get: function () {
        if (this.transitions && this.transitions[21]) {
            return this.transitions[21].targetValue;
        } else {
            return this.COLORTOPRIGHT;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[21]) {
            this.setTransitionTargetValue(this.transitions[21], v, this.COLORTOPRIGHT);
        } else {
            this.COLORTOPRIGHT = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'COLORTOPRIGHT', {
    get: function () {
        return this._colorUr;
    },
    set: function(v) {
        var pv = this._colorUr;
        if (pv !== v) {
            this._colorUr = v;
            this.uComponent.setColorUr(v);
        }
    }
});

Object.defineProperty(Component.prototype, 'colorBl', {
    get: function () {
        if (this.transitions && this.transitions[22]) {
            return this.transitions[22].targetValue;
        } else {
            return this.COLORBOTTOMLEFT;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[22]) {
            this.setTransitionTargetValue(this.transitions[22], v, this.COLORBOTTOMLEFT);
        } else {
            this.COLORBOTTOMLEFT = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'COLORBOTTOMLEFT', {
    get: function () {
        return this._colorBl;
    },
    set: function(v) {
        var pv = this._colorBl;
        if (pv !== v) {
            this._colorBl = v;
            this.uComponent.setColorBl(v);
        }
    }
});

Object.defineProperty(Component.prototype, 'colorBr', {
    get: function () {
        if (this.transitions && this.transitions[23]) {
            return this.transitions[23].targetValue;
        } else {
            return this.COLORBOTTOMRIGHT;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[23]) {
            this.setTransitionTargetValue(this.transitions[23], v, this.COLORBOTTOMRIGHT);
        } else {
            this.COLORBOTTOMRIGHT = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'COLORBOTTOMRIGHT', {
    get: function () {
        return this._colorBr;
    },
    set: function(v) {
        var pv = this._colorBr;
        if (pv !== v) {
            this._colorBr = v;
            this.uComponent.setColorBr(v);
        }
    }
});

Object.defineProperty(Component.prototype, 'visible', {
    get: function () {
        return this._visible;
    },
    set: function(v) {
        var pv = this._visible;
        if (pv !== v) {
            this._visible = !!v;
            this._updateLocalAlpha();
            this.updateActiveFlag();
        }
    }
});

Object.defineProperty(Component.prototype, 'clipping', {
    get: function () {
        return this._clipping;
    },
    set: function(v) {
        var pv = this._clipping;
        if (pv !== v) {
            this._clipping = v;
            this.uComponent.setClipping(v);
        }
    }
});

Object.defineProperty(Component.prototype, 'zIndex', {
    get: function () {
        return this._zIndex;
    },
    set: function(v) {
        var pv = this._zIndex;
        if (pv !== v) {
            this._zIndex = v;
            if (this.active) {
                if (pv !== 0 && v === 0) {
                    this.stage.zIndexUsage--;
                } else if (pv === 0 && v !== 0) {
                    this.stage.zIndexUsage++;
                }
            }
            this.uComponent.setZIndex(this.zIndex);
        }
    }
});

Object.defineProperty(Component.prototype, 'forceZIndexContext', {
    get: function () {
        return this._forceZIndexContext;
    },
    set: function(v) {
        var pv = this._forceZIndexContext;
        if (pv !== v) {
            this._forceZIndexContext = v;
            this.uComponent.setForceZIndexContext(this.forceZIndexContext);
        }
    }
});

Object.defineProperty(Component.prototype, 'scale', {
    get: function() { return this.scaleX; },
    set: function(v) {
        this.scaleX = v;
        this.scaleY = v;
    }
});

Object.defineProperty(Component.prototype, 'borderWidth', {
    get: function() { return this.borderWidthTop; },
    set: function(v) {
        this.borderWidthTop = v;
        this.borderWidthBottom = v;
        this.borderWidthLeft = v;
        this.borderWidthRight = v;
    }
});

Object.defineProperty(Component.prototype, 'borderColor', {
    get: function() { return this.borderColorTop; },
    set: function(v) {
        this.borderColorTop = v;
        this.borderColorBottom = v;
        this.borderColorLeft = v;
        this.borderColorRight = v;
    }
});

Object.defineProperty(Component.prototype, 'texture', {
    get: function() { return this._texture; },
    set: function(v) {
        if (v === null || v instanceof Texture) {
            var prevValue = this._texture;
            if (v !== prevValue) {
                if (v !== null && !(v instanceof Texture)) {
                    throw new Error('incorrect value for texture');
                }

                this._texture = v;

                if (this.active && prevValue && this.displayedTexture !== prevValue) {
                    // Keep reference to component for texture source
                    prevValue.removeComponent(this, (!v || prevValue.source !== v.source) && (!this.displayedTexture || (this.displayedTexture.source !== prevValue.source)));
                }

                if (v) {
                    if (this.active) {
                        // When the texture is changed, maintain the texture's sprite registry.
                        // While the displayed texture is different from the texture (not yet loaded), two textures are referenced.
                        v.addComponent(this);
                    }

                    if (v.source.glTexture) {
                        this.displayedTexture = v;
                    }
                } else {
                    // Make sure that current texture is cleared when the texture is explicitly set to null.
                    this.displayedTexture = null;
                }
            }
        } else if (Utils.isPlainObject(v)) {
            if (this._texture) {
                this._texture.set(v);
            }
        }
    }
});

Object.defineProperty(Component.prototype, 'displayedTexture', {
    get: function() { return this._displayedTexture; },
    set: function(v) {
        if (v === null || v instanceof Texture) {
            var prevValue = this._displayedTexture;
            if (v !== prevValue) {
                if (this.active && prevValue) {
                    // We can assume that this._texture === this._displayedTexture.

                    if (prevValue !== this.texture) {
                        // The old displayed texture is deprecated.
                        prevValue.removeComponent(this, (!v || (prevValue.source !== v.source)));
                    }
                }

                this._displayedTexture = v;

                this.checkForResize();

                if (v) {
                    if (this._eventsCount) {
                        this.emit('txLoaded', v);
                    }

                    // We don't need to reference the displayed texture because it was already referenced (this.texture === this.displayedTexture).
                    this._updateTextureCoords();
                    this.stage.uComponentContext.setDisplayedTextureSource(this.uComponent, v.source);
                } else {
                    if (this._eventsCount) {
                        this.emit('txUnloaded', v);
                    }

                    this.stage.uComponentContext.setDisplayedTextureSource(this.uComponent, null);
                }
            }
        } else if (Utils.isPlainObject(v)) {
            if (this._displayedTexture) {
                this._displayedTexture.set(v);
            }
        }
    }
});

Object.defineProperty(Component.prototype, 'color', {
    get: function() { return this.colorUl; },
    set: function(v) {
        this.colorUl = v;
        this.colorUr = v;
        this.colorBl = v;
        this.colorBr = v;
    }
});

Object.defineProperty(Component.prototype, 'colorTop', {
    get: function() { return this.colorUl; },
    set: function(v) {
        this.colorUl = v;
        this.colorUr = v;
    }
});

Object.defineProperty(Component.prototype, 'colorBottom', {
    get: function() { return this.colorBl; },
    set: function(v) {
        this.colorBl = v;
        this.colorBr = v;
    }
});

Object.defineProperty(Component.prototype, 'colorLeft', {
    get: function() { return this.colorUl; },
    set: function(v) {
        this.colorUl = v;
        this.colorBl = v;
    }
});

Object.defineProperty(Component.prototype, 'colorRight', {
    get: function() { return this.colorUr; },
    set: function(v) {
        this.colorUr = v;
        this.colorBr = v;
    }
});

Object.defineProperty(Component.prototype, 'src', {
    get: function() { return this._src; },
    set: function(v) {
        var prevValue = this._src;

        if (!prevValue || prevValue !== v || !this.texture || !this.texture.source.renderInfo || this.texture.source.renderInfo.src !== v) {
            if (!v) {
                if (prevValue) {
                    this.texture = null;
                }
                this._src = null;
            } else {
                this.texture = this.stage.textureManager.getTexture(v);

                this._src = v;
            }
        }
    }
});

Object.defineProperty(Component.prototype, 'text', {
    get: function() {
        if (!this.textRenderer) {
            this.textRenderer = new ComponentText(this);
        }
        return this.textRenderer;
    },
    set: function(settings) {
        if (settings === null) {
            if (this.textRenderer) {
                this.textRenderer = null;
                this.texture = null;
            }
        } else {
            if (!this.textRenderer) {
                this.textRenderer = new ComponentText(this);
            }
            if (Utils.isString(settings)) {
                this.textRenderer.text = settings;
            } else {
                this.textRenderer.set(settings);
            }
        }
    }
});

Object.defineProperty(Component.prototype, 'rect', {
    get: function() {
        return (this.texture === this.stage.getRectangleTexture());
    },
    set: function(v) {
        if (v) {
            this.texture = this.stage.getRectangleTexture();
        } else {
            this.texture = null;
        }
    }
});

Object.defineProperty(Component.prototype, 'tags', {
    get: function() {
        // Copy to make sure they aren't changed externally.
        return this.getTags();
    },
    set: function(v) {
        this.setTags(v);
    }
});

Object.defineProperty(Component.prototype, 'children', {
    get: function() {
        // Copy to make sure they aren't changed externally.
        return this._children;
    },
    set: function(v) {
        var stage = this.stage;
        if (!Utils.isArray(v)) {
            throw new TypeError('Children must be array.');
        }
        var c = [];
        for (var i = 0, n = v.length; i < n; i++) {
            if (v[i] instanceof Component) {
                c[i] = v[i];
            } else {
                c[i] = stage.c(v[i]);
            }
        }
        this.setChildren(c);
    }
});

Object.defineProperty(Component.prototype, 'turtler', {
    get: function () {
        return this._turtler;
    },
    set: function(v) {
        var pv = this._turtler;
        if (pv !== v) {
            this._turtler = v;
            this.uComponent.setHasTurtler(!!v);
        }
    }
});

Object.defineProperty(Component.prototype, 'turtleInvisible', {
    get: function () {
        return this._turtleInvisible;
    },
    set: function(v) {
        var pv = this._turtleInvisible;
        if (pv !== v) {
            this._turtleInvisible = v;
            this.uComponent.setTurtleInvisible(!!v);
        }
    }
});

Component.prototype.setTransitionTargetValue = function(transition, targetValue, currentValue) {
    transition.updateTargetValue(targetValue, currentValue);
};

Component.prototype._updateLocalTransform = function() {
    if (this._rotation !== 0 && this._rotation % (2 * Math.PI)) {
        // check to see if the rotation is the same as the previous render. This means we only need to use sin and cos when rotation actually changes
        if (this._rotation !== this.rotationCache) {
            this.rotationCache = this._rotation;
            this._sr = Math.sin(this._rotation);
            this._cr = Math.cos(this._rotation);
        }

        this.uComponent.setLocalTransform(
            this._cr * this._scaleX,
            -this._sr * this._scaleY,
            this._sr * this._scaleX,
            this._cr * this._scaleY
        );
    } else {
        this.uComponent.setLocalTransform(
            this._scaleX,
            0,
            0,
            this._scaleY
        );
    }
    this._updateLocalTranslate();
};

Component.prototype._updateLocalTranslate = function() {
    var pivotXMul = this._pivotX * this._renderWidth;
    var pivotYMul = this._pivotY * this._renderHeight;
    var px = this._x - (pivotXMul * this.uComponent.getLocalTa() + pivotYMul * this.uComponent.getLocalTb()) + pivotXMul;
    var py = this._y - (pivotXMul * this.uComponent.getLocalTc() + pivotYMul * this.uComponent.getLocalTd()) + pivotYMul;
    px -= this._mountX * this._renderWidth;
    py -= this._mountY * this._renderHeight;
    this.uComponent.setLocalTranslate(
        px,
        py
    );
};

Component.prototype._updateLocalTranslateDelta = function(dx, dy) {
    this.uComponent.addLocalTranslate(dx, dy);
};

Component.prototype._updateLocalAlpha = function() {
    this.uComponent.setLocalAlpha(this._visible ? this._alpha : 0);
};

Component.prototype._updateLocalDimensions = function() {
    this.uComponent.setDimensions(this._renderWidth, this._renderHeight);
    this._updateLocalTranslate();
};

Component.prototype.textureIsLoaded = function() {
    return this.texture ? !!this.texture.source.glTexture : false;
};

Component.prototype.loadTexture = function(sync) {
    if (this.texture) {
        this.texture.load(sync);
    }
};

Component.prototype._updateTextureCoords = function() {
    if (this.displayedTexture && this.displayedTexture.source) {
        var displayedTexture = this.displayedTexture;
        var displayedTextureSource = this.displayedTexture.source;
        
        var tx1 = 0, ty1 = 0, tx2 = 1.0, ty2 = 1.0;
        if (displayedTexture.clipping) {
            // Apply texture clipping.
            var w = displayedTextureSource.getRenderWidth();
            var h = displayedTextureSource.getRenderHeight();
            var iw, ih, rw, rh;
            iw = 1 / w;
            ih = 1 / h;

            if (displayedTexture.w) {
                rw = displayedTexture.w * iw;
            } else {
                rw = (w - displayedTexture.x) * iw;
            }

            if (displayedTexture.h) {
                rh = displayedTexture.h * ih;
            } else {
                rh = (h - displayedTexture.y) * ih;
            }

            iw *= displayedTexture.x;
            ih *= displayedTexture.y;

            tx1 = Math.min(1.0, Math.max(0, iw));
            ty1 = Math.min(1.0, Math.max(ih));
            tx2 = Math.min(1.0, Math.max(tx2 * rw + iw));
            ty2 = Math.min(1.0, Math.max(ty2 * rh + ih));
        }

        if (displayedTextureSource.inTextureAtlas) {
            // Calculate texture atlas texture coordinates.
            var textureAtlasI = 0.000488281;    // 1/2048.

            var tax = (displayedTextureSource.textureAtlasX * textureAtlasI);
            var tay = (displayedTextureSource.textureAtlasY * textureAtlasI);
            var dax = (displayedTextureSource.w * textureAtlasI);
            var day = (displayedTextureSource.h * textureAtlasI);

            tx1 = tax;
            ty1 = tay;

            tx2 = tx2 * dax + tax;
            ty2 = ty2 * day + tay;
        }

        this.uComponent.setTextureCoords(tx1, ty1, tx2, ty2);
        this.uComponent.setInTextureAtlas(displayedTextureSource.inTextureAtlas);
    }
};

Component.getPropertyIndex = function(name) {
    return Component.SETTINGS[name] ? Component.SETTINGS[name].i : -1;
};

Component.getPropertyIndexFinal = function(name) {
    return Component.FINAL_SETTINGS[name] ? Component.FINAL_SETTINGS[name].i : -1;
};

Component.SETTINGS = {
    'x': {i:0, s: function(obj, value) {obj.x = value}, g: function(obj) {return obj.x}, sf: function(obj, value) {obj.X = value}, gf: function(obj) {return obj.X}, m: StageUtils.mergeNumbers},
    'y': {i:1, s: function(obj, value) {obj.y = value}, g: function(obj) {return obj.y}, sf: function(obj, value) {obj.Y = value}, gf: function(obj) {return obj.Y}, m: StageUtils.mergeNumbers},
    'w': {i:2, s: function(obj, value) {obj.w = value}, g: function(obj) {return obj.w}, sf: function(obj, value) {obj.W = value}, gf: function(obj) {return obj.W}, m: StageUtils.mergeNumbers},
    'h': {i:3, s: function(obj, value) {obj.h = value}, g: function(obj) {return obj.h}, sf: function(obj, value) {obj.H = value}, gf: function(obj) {return obj.H}, m: StageUtils.mergeNumbers},
    'scaleX': {i:4, s: function(obj, value) {obj.scaleX = value}, g: function(obj) {return obj.scaleX}, sf: function(obj, value) {obj.SCALEX = value}, gf: function(obj) {return obj.SCALEX}, m: StageUtils.mergeNumbers},
    'scaleY': {i:5, s: function(obj, value) {obj.scaleY = value}, g: function(obj) {return obj.scaleY}, sf: function(obj, value) {obj.SCALEY = value}, gf: function(obj) {return obj.SCALEY}, m: StageUtils.mergeNumbers},
    'pivotX': {i:6, s: function(obj, value) {obj.pivotX = value}, g: function(obj) {return obj.pivotX}, sf: function(obj, value) {obj.PIVOTX = value}, gf: function(obj) {return obj.PIVOTX}, m: StageUtils.mergeNumbers},
    'pivotY': {i:7, s: function(obj, value) {obj.pivotY = value}, g: function(obj) {return obj.pivotY}, sf: function(obj, value) {obj.PIVOTY = value}, gf: function(obj) {return obj.PIVOTY}, m: StageUtils.mergeNumbers},
    'mountX': {i:8, s: function(obj, value) {obj.mountX = value}, g: function(obj) {return obj.mountX}, sf: function(obj, value) {obj.MOUNTX = value}, gf: function(obj) {return obj.MOUNTX}, m: StageUtils.mergeNumbers},
    'mountY': {i:9, s: function(obj, value) {obj.mountY = value}, g: function(obj) {return obj.mountY}, sf: function(obj, value) {obj.MOUNTY = value}, gf: function(obj) {return obj.MOUNTY}, m: StageUtils.mergeNumbers},
    'alpha': {i:10, s: function(obj, value) {obj.alpha = value}, g: function(obj) {return obj.alpha}, sf: function(obj, value) {obj.ALPHA = value}, gf: function(obj) {return obj.ALPHA}, m: StageUtils.mergeNumbers},
    'rotation': {i:11, s: function(obj, value) {obj.rotation = value}, g: function(obj) {return obj.rotation}, sf: function(obj, value) {obj.ROTATION = value}, gf: function(obj) {return obj.ROTATION}, m: StageUtils.mergeNumbers},
    'borderWidthTop': {i:12, s: function(obj, value) {obj.borderWidthTop = value}, g: function(obj) {return obj.borderWidthTop}, sf: function(obj, value) {obj.BORDERWIDTHTOP = value}, gf: function(obj) {return obj.BORDERWIDTHTOP}, m: StageUtils.mergeNumbers},
    'borderWidthBottom': {i:13, s: function(obj, value) {obj.borderWidthBottom = value}, g: function(obj) {return obj.borderWidthBottom}, sf: function(obj, value) {obj.BORDERWIDTHBOTTOM = value}, gf: function(obj) {return obj.BORDERWIDTHBOTTOM}, m: StageUtils.mergeNumbers},
    'borderWidthLeft': {i:14, s: function(obj, value) {obj.borderWidthLeft = value}, g: function(obj) {return obj.borderWidthLeft}, sf: function(obj, value) {obj.BORDERWIDTHLEFT = value}, gf: function(obj) {return obj.BORDERWIDTHLEFT}, m: StageUtils.mergeNumbers},
    'borderWidthRight': {i:15, s: function(obj, value) {obj.borderWidthRight = value}, g: function(obj) {return obj.borderWidthRight}, sf: function(obj, value) {obj.BORDERWIDTHRIGHT = value}, gf: function(obj) {return obj.BORDERWIDTHRIGHT}, m: StageUtils.mergeNumbers},
    'borderColorTop': {i:16, s: function(obj, value) {obj.borderColorTop = value}, g: function(obj) {return obj.borderColorTop}, sf: function(obj, value) {obj.BORDERCOLORTOP = value}, gf: function(obj) {return obj.BORDERCOLORTOP}, m: StageUtils.mergeColors},
    'borderColorBottom': {i:17, s: function(obj, value) {obj.borderColorBottom = value}, g: function(obj) {return obj.borderColorBottom}, sf: function(obj, value) {obj.BORDERCOLORBOTTOM = value}, gf: function(obj) {return obj.BORDERCOLORBOTTOM}, m: StageUtils.mergeColors},
    'borderColorLeft': {i:18, s: function(obj, value) {obj.borderColorLeft = value}, g: function(obj) {return obj.borderColorLeft}, sf: function(obj, value) {obj.BORDERCOLORLEFT = value}, gf: function(obj) {return obj.BORDERCOLORLEFT}, m: StageUtils.mergeColors},
    'borderColorRight': {i:19, s: function(obj, value) {obj.borderColorRight = value}, g: function(obj) {return obj.borderColorRight}, sf: function(obj, value) {obj.BORDERCOLORRIGHT = value}, gf: function(obj) {return obj.BORDERCOLORRIGHT}, m: StageUtils.mergeColors},
    'colorUl': {i:20, s: function(obj, value) {obj.colorUl = value}, g: function(obj) {return obj.colorUl}, sf: function(obj, value) {obj.COLORTOPLEFT = value}, gf: function(obj) {return obj.COLORTOPLEFT}, m: StageUtils.mergeColors},
    'colorUr': {i:21, s: function(obj, value) {obj.colorUr = value}, g: function(obj) {return obj.colorUr}, sf: function(obj, value) {obj.COLORTOPRIGHT = value}, gf: function(obj) {return obj.COLORTOPRIGHT}, m: StageUtils.mergeColors},
    'colorBl': {i:22, s: function(obj, value) {obj.colorBl = value}, g: function(obj) {return obj.colorBl}, sf: function(obj, value) {obj.COLORBOTTOMLEFT = value}, gf: function(obj) {return obj.COLORBOTTOMLEFT}, m: StageUtils.mergeColors},
    'colorBr': {i:23, s: function(obj, value) {obj.colorBr = value}, g: function(obj) {return obj.colorBr}, sf: function(obj, value) {obj.COLORBOTTOMRIGHT = value}, gf: function(obj) {return obj.COLORBOTTOMRIGHT}, m: StageUtils.mergeColors},
    'visible': {s: function(obj, value) {obj.visible = value}, g: function(obj) {return obj.visible}, sf: function(obj, value) {obj.VISIBLE = value}, gf: function(obj) {return obj.VISIBLE}, m: null},
    'zIndex': {s: function(obj, value) {obj.zIndex = value}, g: function(obj) {return obj.zIndex}, sf: function(obj, value) {obj.VISIBLE = value}, gf: function(obj) {return obj.VISIBLE}, m: null},
    'forceZIndexContext': {s: function(obj, value) {obj.forceZIndexContext = value}, g: function(obj) {return obj.forceZIndexContext}, sf: function(obj, value) {obj.FORCEZINDEXCONTEXT = value}, gf: function(obj) {return obj.FORCEZINDEXCONTEXT}, m: null},
    'clipping': {s: function(obj, value) {obj.clipping = value}, g: function(obj) {return obj.clipping}, sf: function(obj, value) {obj.CLIPPING = value}, gf: function(obj) {return obj.CLIPPING}, m: null},
    'rect': {s: function(obj, value) {obj.rect = value}, g: function(obj) {return obj.rect}, m: null},
    'src': {s: function(obj, value) {obj.src = value}, g: function(obj) {return obj.src}, m: null},
    'text': {s: function(obj, value) {obj.text = value}, g: function(obj) {return obj.text}, m: null},
    'texture': {s: function(obj, value) {obj.texture = value}, g: function(obj) {return obj.src}, m: null},
    'tag': {s: function(obj, value) {obj.tags = value}, g: function(obj) {return obj.tags}, m: null},
    'tags': {s: function(obj, value) {obj.tags = value}, g: function(obj) {return obj.tags}, m: null},
    'children': {s: function(obj, value) {obj.children = value}, g: function(obj) {return obj.children;}, m: null},
    'turtler': {s: function(obj, value) {obj.turtler = value}, g: function(obj) {return obj.turtler;}, m: null},
    'turtleInvisible': {s: function(obj, value) {obj.turtleInvisible = value}, g: function(obj) {return obj.turtleInvisible}, m: null}
};

Component.FINAL_SETTINGS = {};
for (var key in Component.SETTINGS) {
    if (Component.SETTINGS.hasOwnProperty(key) && Component.SETTINGS[key]['sf']) {
        Component.FINAL_SETTINGS[key.toUpperCase()] = Component.SETTINGS[key];
    }
}

Component.nTransitions = 24;

if (isNode) {
    module.exports = Component;
    var Stage = require('./Stage');
    var Transition = require('./Transition');
    var Texture = require('./Texture');
    var ComponentText = require('./ComponentText');
    var ComponentTags = require('./ComponentTags');
}
