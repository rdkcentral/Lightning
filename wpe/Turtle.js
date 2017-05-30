var isNode = !!(((typeof module !== "undefined") && module.exports));

/**
 * A turtle can be used to customize positioning/dimensions of a rendered object.
 * @param {UComponent} c
 * @constructor
 */
var Turtle = function(c) {
    this.c = c;
    this.update();
};


// Upper-left corner position (relative to container).
Turtle.prototype._x = 0;
Turtle.prototype._y = 0;

// Width and height (relative to container).
Turtle.prototype._w = 0;
Turtle.prototype._h = 0;

Turtle.prototype.altered = false;

Turtle.prototype.swapRealValues = function() {
    var t;

    t = this.c.localPx;
    this.c.localPx = this._x;
    this._x = t;

    t = this.c.localPy;
    this.c.localPy = this._y;
    this._y = t;

    t = this.c.w;
    this.c.w = this._w;
    this._w = t;

    t = this.c.h;
    this.c.h = this._h;
    this._h = t;
};

Turtle.prototype.restoreRealValues = function() {
    this.c.localPx = this._x;
    this.c.localPy = this._y;
    this.c.w = this._w;
    this.c.h = this._h;
};

Turtle.prototype.update = function() {
    this._x = this.c.localPx;
    this._y = this.c.localPy;

    this._w = this.c.w;
    this._h = this.c.h;
};

Object.defineProperty(Turtle.prototype, 'x', {
    get: function () {
        return this._x;
    },
    set: function(x) {
        if (this._x !== x) {
            this.altered = true;
            this._x = x;
        }
    }
});

Object.defineProperty(Turtle.prototype, 'y', {
    get: function () {
        return this._y;
    },
    set: function(y) {
        if (this._y !== y) {
            this.altered = true;
            this._y = y;
        }
    }
});


Object.defineProperty(Turtle.prototype, 'w', {
    get: function () {
        return this._w;
    },
    set: function(w) {
        if (this._w !== w) {
            this.altered = true;
            this._w = w;
        }
    }
});

Object.defineProperty(Turtle.prototype, 'h', {
    get: function () {
        return this._h;
    },
    set: function(h) {
        if (this._h !== h) {
            this.altered = true;
            this._h = h;
        }
    }
});

Object.defineProperty(Turtle.prototype, 'parent', {
    get: function () {
        if (this.c.parent) {
            return this.c.parent.getTurtle();
        }
    }
});

Object.defineProperty(Turtle.prototype, 'sw', {
    get: function () {
        return this.c.component.stage.w;
    }
});

Object.defineProperty(Turtle.prototype, 'sh', {
    get: function () {
        return this.c.component.stage.h;
    }
});

Object.defineProperty(Turtle.prototype, 'index', {
    get: function() {
        return this.c.parent.children.indexOf(this.c);
    }
});

Object.defineProperty(Turtle.prototype, 'visible', {
    get: function() {
        return this.c.isVisible();
    }
});

Object.defineProperty(Turtle.prototype, 'last', {
    get: function() {
        if (!this.c.parent) return true;

        var children = this.c.parent.children;
        var i = children.length - 1;
        do {
            if (children[i] === this.c) {
                return true;
            } else if (children[i].shouldRunTurtle()) {
                return false;
            }
        } while(--i > 0);
        return true;
    }
});

Object.defineProperty(Turtle.prototype, 'prev', {
    get: function () {
        if (this.c.parent) {
            var i = this.index;
            if (i > 0) {
                while(--i >= 0) {
                    if (this.c.parent.children[i].shouldRunTurtle()) {
                        return this.c.parent.children[i].getTurtle();
                    }
                }
            }
        }
        return null;
    }
});

Object.defineProperty(Turtle.prototype, 'prevs', {
    get: function () {
        if (this.c.parent) {
            var i = this.c.parent.children.indexOf(this.c);
            if (i > 0) {
                var arr = [];
                while(i-- >= 0) {
                    var s = this.c.parent.children[i];
                    if (s.shouldRunTurtle()) {
                        arr.push(s.getTurtle());
                    }
                }
                return arr;
            } else {
                return [];
            }
        } else {
            return [];
        }
    }
});

/**
 * Warning: do not add/remove children on already visited components.
 */
Object.defineProperty(Turtle.prototype, 'component', {
    get: function() {
        return this.c.component;
    }
});

if (isNode) {
    module.exports = Turtle;
}