var isNode = !!(((typeof module !== "undefined") && module.exports));

if (isNode) {
    var EventEmitter = require('events');
    var Utils = require('../wpe/Utils');
}

/**
 * A scrollable list (also known as a carroussel).
 * @constructor
 * @extends {Component}
 * @abstract
 */
function List(stage, settings, componentSettings) {
    EventEmitter.call(this);

    this.stage = stage;

    /**
     * The component that surrounds the wrapper.
     * @type {Object|Component}
     */
    this.component = this.stage.c();

    /**
     * The index of the currently centered item.
     * @type {number}
     */
    this.index = this._index = 0;

    /**
     * The wrapper that contains the actual list children.
     */
    this.wrapper = this.stage.c();

    // Create structure.
    this.component.addChild(this.wrapper);

    /**
     * @private
     */
    this.reloadVisibleElements = false;

    /**
     * The scroll area size in pixels per item.
     * @type {number}
     */
    this.itemSize = this._itemSize = 100;

    /**
     * The viewport target offset.
     * @type {number}
     */
    this.viewportScrollOffset = this._viewportScrollOffset = 0;

    /**
     * The selected item target offset.
     * @type {number}
     */
    this.itemScrollOffset = this._itemScrollOffset = 0;

    /**
     * Indicates if list should stop at boundary or scroll to modulo.
     * @type {number}
     */
    this.rollOver = this._rollOver = true;

    /**
     * Indicates if list should seemingly scroll forever.
     * @type {number}
     */
    this.wrap = this._wrap = true;

    /**
     * While wrapping, the minimum scroll position to the side.
     * @type {number}
     */
    this.wrapMin = this._wrapMin = 0;

    /**
     * While wrapping, the maximum scroll position to the side.
     * @type {number}
     */
    this.wrapMax = this._wrapMax = 0;

    /**
     * A custom animation. The subject is set to the element, and the progress to the element's current progress.
     * @type {Animation}
     */
    this._progressAnimation = null;

    /**
     * If set, the axis is inverted.
     * @type {boolean}
     */
    this.invertDirection = this._invertDirection = false;

    /**
     * Horizontal scrolling?
     * @type {boolean}
     * @private
     */
    this.horizontal = !!settings.horizontal;

    /**
     * The list scroll transition.
     * @type {Transition}
     */
    this.scrollTransition = this.wrapper.transition(this.horizontal ? 'x' : 'y', {});

    /**
     * The currently visible items.
     * @type {Set<Component>}
     */
    this.visibleItems = new Set();

    this.prevValue = null;

    this.prevViewportSize = null;

    if (settings) {
        this.set(settings);
    }

    if (componentSettings) {
        this.component.set(componentSettings);
    }

    this.setup();

}

Utils.extendClass(List, EventEmitter);

List.prototype.setProgressAnimation = function(settings) {
    if (settings) {
        if (!this._progressAnimation) {
            this._progressAnimation = new Animation(this.stage);
        }
        this._progressAnimation.set(settings);
    } else {
        this._progressAnimation = null;
    }
};

List.prototype.getElementsCount = function() {
    return this.wrapper.children.length;
};

List.prototype.getViewportSize = function() {
    return this.horizontal ? this.component.W : this.component.H;
};

List.prototype.update = function() {
    if (!this.wrapper.children.length) return;

    var direction = (this.horizontal ^ this.invertDirection ? -1 : 1);

    // Map position to index value.
    var v = (this.horizontal ? this.wrapper.X : this.wrapper.Y);

    var viewportSize = this.getViewportSize();
    var scrollDelta = this.viewportScrollOffset * viewportSize - this.itemScrollOffset * this.itemSize;
    v += scrollDelta;

    if (v !== this.prevValue || viewportSize !== this.prevViewportSize || this.reloadVisibleElements) {
        this.prevValue = v;
        this.prevViewportSize = viewportSize;

        var s, e, ps, pe;
        if (direction == -1) {
            s = Math.floor(-v / this.itemSize);
            ps = 1 - ((-v / this.itemSize) - s);
            e = Math.floor((viewportSize - v) / this.itemSize);
            pe = (((viewportSize - v) / this.itemSize) - e);
        } else {
            s = Math.ceil(v / this.itemSize);
            ps = 1 + (v / this.itemSize) - s;
            e = Math.ceil((v - viewportSize) / this.itemSize);
            pe = e - ((v - viewportSize) / this.itemSize);
        }
        var nElements = this.wrapper.children.length;
        if (this.wrap || (viewportSize > this.itemSize * nElements)) {
            // Don't show additional items.
            if (e >= nElements) {
                e = nElements - 1;
            }
            if (s >= nElements) {
                s = nElements - 1;
            }
            if (e <= -1) {
                e = 0;
            }
            if (s <= -1) {
                s = 0;
            }
        }

        var offset = -direction * s * this.itemSize;

        var item;
        for (var index = s; (direction == -1 ? index <= e : index >= e); (direction == -1 ? index++ : index--)) {
            var realIndex = Utils.getArrayIndex(index, this.wrapper.children);

            item = this.wrapper.children[realIndex];
            this.visibleItems.delete(item);
            if (this.horizontal) {
                item.x = offset + scrollDelta;
            } else {
                item.y = offset + scrollDelta;
            }

            if (!item.visible || this.reloadVisibleElements) {
                // Turned visible.
                this.emit('elementVisible', index, realIndex);
            }

            item.visible = true;


            if (this._progressAnimation) {
                var p = 1;
                if (index == s) {
                    p = ps;
                } else if (index == e) {
                    p = pe;
                }

                // Use animation to progress.
                this._progressAnimation.subject = item;
                this._progressAnimation.p = p;
                this._progressAnimation.applyTransforms();
            }

            offset += this.itemSize;
        }

        // Handle item visibility.
        var self = this;
        this.visibleItems.forEach(function(invisibleItem) {
            invisibleItem.visible = false;
            self.visibleItems.delete(invisibleItem);
        });

        for (index = s; (direction == -1 ? index <= e : index >= e); (direction == -1 ? index++ : index--)) {
            realIndex = Utils.getArrayIndex(index, this.wrapper.children);
            item = this.wrapper.children[realIndex];
            this.visibleItems.add(item);
        }

        this.reloadVisibleElements = false;
    }
};

List.prototype.setup = function() {
    var self = this;
    var listener = function () {
        self.update();
    };

    this.component.notifyActivate = function() {
        self.stage.on('update', listener);
    };

    this.component.notifyDeactivate = function() {
        self.stage.removeListener('update', listener);
    };
};

List.prototype.clearElements = function() {
    this.wrapper.removeChildren();
    this.reloadVisibleElements = true;
    this.index = 0;
};

List.prototype.addElement = function(component) {
    var element = this.stage.c({visible: false});
    element.addChild(component);
    this.wrapper.addChild(element);
    this.reloadVisibleElements = true;
    return element;
};

List.prototype.removeElementAt = function(index) {
    var ri = this.getRealIndex();

    this.wrapper.removeChildAt(index);

    if (ri === index) {
        if (ri === this.wrapper.children.length) {
            ri--;
        }
        if (ri >= 0) {
            this.setIndex(ri);
        }
    } else if (ri > index) {
        this.setIndex(ri - 1);
    }

    this.reloadVisibleElements = true;
};

List.prototype.setIndex = function(index, immediate, closest) {
    var nElements = this.wrapper.children.length;
    if (!nElements) return;

    this.emit('elementDeselected', this.index, this.getRealIndex());

    if (!this.rollOver) {
        if (this.index < 0) {
            this.index = 0;
        }
        if (this.index >= nElements) {
            this.index = nElements - 1;
        }
        this.index = index;
    } else {
        if (closest) {
            // Scroll to same offset closest to the index.
            var offset = Utils.getArrayIndex(index, this.wrapper.children);
            var o = Utils.getArrayIndex(this.index, this.wrapper.children);
            var diff = offset - o;
            if (diff > 0.5 * nElements) {
                diff -= nElements;
            } else if (diff < -0.5 * nElements) {
                diff += nElements;
            }
            this.index += diff;
        } else {
            this.index = index;
        }
    }
    if (this.wrap || (this.getViewportSize() > this.itemSize * nElements)) {
        this.index = Utils.getArrayIndex(this.index, this.wrapper.children);
    }

    var direction = (this.horizontal ^ this.invertDirection ? -1 : 1);
    var value = direction * this.index * this.itemSize;

    if (this.wrap) {
        var min, max, scrollDelta;
        if (direction == 1) {
            max = (nElements - 1) * this.itemSize;
            scrollDelta = this.viewportScrollOffset * this.getViewportSize() - this.itemScrollOffset * this.itemSize;

            max -= scrollDelta;

            min = this.getViewportSize() - (this.itemSize + scrollDelta);

            if (this.wrapMin) min -= this.wrapMin;
            if (this.wrapMax) max += this.wrapMax;

            value = Math.max(Math.min(value, max), min);
        } else {
            max = (nElements * this.itemSize - this.getViewportSize());
            scrollDelta = this.viewportScrollOffset * this.getViewportSize() - this.itemScrollOffset * this.itemSize;

            max += scrollDelta;

            var min = scrollDelta;

            if (this.wrapMin) min -= this.wrapMin;
            if (this.wrapMax) max += this.wrapMax;

            value = Math.min(Math.max(-max, value), -min);
        }
    }

    this.wrapper[this.horizontal ? 'x' : 'y'] = value;

    if (immediate) {
        this.scrollTransition.reset(value, value, 1);
    }

    this.emit('elementSelected', this.index, this.getRealIndex());
};

List.prototype.setPrevious = function() {
    this.setIndex(this.index - 1);
};

List.prototype.setNext = function() {
    this.setIndex(this.index + 1);
};

List.prototype.getRealIndex = function() {
    return Utils.getArrayIndex(this.index, this.wrapper.children);
};

List.prototype.getIndexItem = function() {
    return this.wrapper.children[this.getRealIndex()];
};

List.prototype.getIndexElement = function() {
    var item = this.getIndexItem();
    return item ? item.children[0] : null;
};

List.prototype.getElement = function(index) {
    var e = this.wrapper.children[index];
    return e ? e.children[0] : null;
};

List.prototype.reload = function() {
    this.reloadVisibleElements = true;
};

List.prototype.set = function(settings) {
    var propNames = Object.keys(settings);
    for (var i = 0; i < propNames.length; i++) {
        var name = propNames[i];
        var v = settings[name];
        this.setSetting(name, v);
    }
};

List.prototype.setSetting = function(name, value) {
    if (this[name] === undefined) {
        throw new TypeError('Unknown property:' + name);
    }
    this[name] = value;
};

Object.defineProperty(List.prototype, 'itemSize', {
    get: function () {
        return this._itemSize;
    },
    set: function(v) {
        if (!Utils.isNumber(v)) {
            throw new TypeError("Not a number");
        }
        var pv = this._itemSize;
        if (pv !== v) {
            this._itemSize = v;
            this.prevValue = null;
        }
    }
});

Object.defineProperty(List.prototype, 'viewportScrollOffset', {
    get: function () {
        return this._viewportScrollOffset;
    },
    set: function(v) {
        if (!Utils.isNumber(v)) {
            throw new TypeError("Not a number");
        }
        var pv = this._viewportScrollOffset;
        if (pv !== v) {
            this._viewportScrollOffset = v;
            this.prevValue = null;
        }
    }
});

Object.defineProperty(List.prototype, 'itemScrollOffset', {
    get: function () {
        return this._itemScrollOffset;
    },
    set: function(v) {
        if (!Utils.isNumber(v)) {
            throw new TypeError("Not a number");
        }
        var pv = this._itemScrollOffset;
        if (pv !== v) {
            this._itemScrollOffset = v;
            this.prevValue = null;
        }
    }
});

Object.defineProperty(List.prototype, 'rollOver', {
    get: function () {
        return this._rollOver;
    },
    set: function(v) {
        if (!Utils.isBoolean(v)) {
            throw new TypeError("Not a boolean");
        }
        var pv = this._rollOver;
        if (pv !== v) {
            this._rollOver = v;
            this.prevValue = null;
        }
    }
});

Object.defineProperty(List.prototype, 'wrap', {
    get: function () {
        return this._wrap;
    },
    set: function(v) {
        if (!Utils.isBoolean(v)) {
            throw new TypeError("Not a boolean");
        }
        var pv = this._wrap;
        if (pv !== v) {
            this._wrap = v;
            this.prevValue = null;
        }
    }
});

Object.defineProperty(List.prototype, 'index', {
    get: function () {
        return this._index;
    },
    set: function(v) {
        if (!Utils.isInteger(v)) {
            throw new TypeError("Not a number");
        }
        var pv = this._index;
        if (pv !== v) {
            this._index = v;
        }
    }
});

Object.defineProperty(List.prototype, 'invertDirection', {
    get: function () {
        return this._invertDirection;
    },
    set: function(v) {
        if (!Utils.isBoolean(v)) {
            throw new TypeError("Not a boolean");
        }
        var pv = this._invertDirection;
        if (pv !== v) {
            this._invertDirection = v;
            this.prevValue = null;
        }
    }
});

Object.defineProperty(List.prototype, 'wrapMin', {
    get: function () {
        return this._wrapMin;
    },
    set: function(v) {
        if (!Utils.isNumber(v)) {
            throw new TypeError("Not a number");
        }
        var pv = this._wrapMin;
        if (pv !== v) {
            this._wrapMin = v;
            this.prevValue = null;
        }
    }
});

Object.defineProperty(List.prototype, 'wrapMax', {
    get: function () {
        return this._wrapMax;
    },
    set: function(v) {
        if (!Utils.isNumber(v)) {
            throw new TypeError("Not a number");
        }
        var pv = this._wrapMax;
        if (pv !== v) {
            this._wrapMax = v;
            this.prevValue = null;
        }
    }
});

if (isNode) {
    module.exports = List;
    var Animation = require('../wpe/Animation');
}
