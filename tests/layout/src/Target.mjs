import Utils from "../../../src/tree/Utils.mjs";
import Base from "../../../src/tree/Base.mjs";
import FlexTarget from "../../../src/flex/FlexTarget.mjs"

export default class Target {
    
    constructor() {
        this._children = [];

        this._parent = null;

        this._x = 0;
        this._y = 0;

        this._w = 0;
        this._h = 0;

        this._optFlags = 0;

        this._funcX = null;
        this._funcY = null;
        this._funcW = null;
        this._funcH = null;

        this._visible = true;

        this._layout = null;

        this._recalc = 0;
        this._hasUpdates = false;
    }

    get layout() {
        this._ensureLayout();
        return this._layout;
    }

    get flex() {
        return this._layout ? this._layout.flex : null;
    }

    set flex(v) {
        this.layout.flex = v;
    }

    get flexItem() {
        return this._layout ? this._layout.flexItem : null;
    }

    set flexItem(v) {
        this.layout.flexItem = v;
    }

    isFlexItem() {
        return !!this._layout && this._layout.isFlexItemEnabled();
    }

    isFlexContainer() {
        return !!this._layout && this._layout.isFlexEnabled();
    }

    enableFlexLayout() {
        this._ensureLayout();
    }

    _ensureLayout() {
        if (!this._layout) {
            this._layout = new FlexTarget(this);
        }
    }

    disableFlexLayout() {
        this._triggerRecalcTranslate();
    }

    hasFlexLayout() {
        return (this._layout && this._layout.isEnabled());
    }

    triggerLayout() {
        this._setRecalc(256);
    }

    _triggerRecalcTranslate() {
        this._setRecalc(2);
    }

    _setRecalc(type) {
        this._recalc |= type;
        this._setHasUpdates();
    }

    _setHasUpdates() {
        let p = this;
        while(p && !p._hasUpdates) {
            p._hasUpdates = true;
            p = p._parent;
        }
    }

    update() {
        if (this._recalc & 256) {
            this._layout.layoutFlexTree();
        }

        if (this._optFlags && !this.hasFlexLayout()) {
            if (this._optFlags & 1) {
                const x = this._funcX(this._parent.w);
                if (x !== this._x) {
                    this._x = x;
                    this._recalc |= 2;
                }
            }
            if (this._optFlags & 2) {
                const y = this._funcY(this._parent.h);
                if (y !== this._y) {
                    this._y = y;
                    this._recalc |= 2;
                }
            }
            if (this._optFlags & 4) {
                const w = this._funcW(this._parent.w);
                if (w !== this._w) {
                    this._w = w;
                    this._recalc |= 2;
                }
            }
            if (this._optFlags & 8) {
                const h = this._funcH(this._parent.h);
                if (h !== this._h) {
                    this._h = h;
                    this._recalc |= 2;
                }
            }
        }

        if (this._hasUpdates) {
            this._recalc = 0;
            this._hasUpdates = false;
            const children = this._children;
            if (children) {
                for (let i = 0, n = children.length; i < n; i++) {
                    children[i].update();
                }
            }
        }
    }

    get offsetX() {
        if (this._funcX) {
            return this._funcX;
        } else {
            if (this.hasFlexLayout()) {
                return this._layout.originalX;
            } else {
                return this._x;
            }
        }
    }

    set offsetX(v) {
        if (Utils.isFunction(v)) {
            this.funcX = v;
        } else {
            this._disableFuncX();
            if (this.hasFlexLayout()) {
                this._x += (v - this._layout.originalX);
                this._triggerRecalcTranslate();
                this._layout.setOriginalXWithoutUpdatingLayout(v);
            } else {
                this.x = v;
            }
        }
    }

    get x() {
        return this._x;
    }

    set x(v) {
        if (v !== this._x) {
            this._x = v;
            this._triggerRecalcTranslate();
        }
    }

    get funcX() {
        return (this._optFlags & 1 ? this._funcX : null);
    }

    set funcX(v) {
        if (this._funcX !== v) {
            this._optFlags |= 1;
            this._funcX = v;
            if (this.hasFlexLayout()) {
                this._layout.setOriginalXWithoutUpdatingLayout(0);
                this._layout.forceLayout();
            } else {
                this._x = 0;
                this._triggerRecalcTranslate();
            }
        }
    }

    _disableFuncX() {
        this._optFlags = this._optFlags & (0xFFFF - 1);
        this._funcX = null;
    }

    get offsetY() {
        if (this._funcY) {
            return this._funcY;
        } else {
            if (this.hasFlexLayout()) {
                return this._layout.originalY;
            } else {
                return this._y;
            }
        }
    }

    set offsetY(v) {
        if (Utils.isFunction(v)) {
            this.funcY = v;
        } else {
            this._disableFuncY();
            if (this.hasFlexLayout()) {
                this._y += (v - this._layout.originalY);
                this._triggerRecalcTranslate();
                this._layout.setOriginalYWithoutUpdatingLayout(v);
            } else {
                this.y = v;
            }
        }
    }

    get y() {
        return this._y;
    }

    set y(v) {
        if (v !== this._y) {
            this._y = v;
            this._triggerRecalcTranslate();
        }
    }

    get funcY() {
        return (this._optFlags & 2 ? this._funcY : null);
    }

    set funcY(v) {
        if (this._funcY !== v) {
            this._optFlags |= 2;
            this._funcY = v;
            if (this.hasFlexLayout()) {
                this._layout.setOriginalYWithoutUpdatingLayout(0);
                this._layout.forceLayout();
            } else {
                this._y = 0;
                this._triggerRecalcTranslate();
            }
        }
    }

    _disableFuncY() {
        this._optFlags = this._optFlags & (0xFFFF - 2);
        this._funcY = null;
    }

    get w() {
        return this._w;
    }

    set w(v) {
        if (Utils.isFunction(v)) {
            this.funcW = v;
        } else {
            this.disableFuncW();
            if (this.hasFlexLayout()) {
                this._layout.originalWidth = v;
            } else {
                this._setW(v);
            }
        }
    }

    _setW(v) {
        if (this._w !== v) {
            this._w = v;
            this._triggerRecalcTranslate();
        }
    }

    get h() {
        return this._h;
    }

    set h(v) {
        if (Utils.isFunction(v)) {
            this.funcH = v;
        } else {
            this.disableFuncH();
            if (this.hasFlexLayout()) {
                this._layout.originalHeight = v;
            } else {
                this._setH(v);
            }
        }
    }

    _setH(v) {
        if (this._h !== v) {
            this._h = v;
            this._triggerRecalcTranslate();
        }
    }

    setDimensions(w, h) {
        this._setW(w);
        this._setH(h);
    }

    get funcW() {
        return (this._optFlags & 4 ? this._funcW : null);
    }

    set funcW(v) {
        if (this._funcW !== v) {
            this._optFlags |= 4;
            this._funcW = v;
            if (this.hasFlexLayout()) {
                this._layout._originalWidth = 0;
                this.layout.changedDimensions(true, false);
            } else {
                this._w = 0;
                this._triggerRecalcTranslate();
            }
        }
    }

    disableFuncW() {
        this._optFlags = this._optFlags & (0xFFFF - 4);
        this._funcW = null;
    }

    get funcH() {
        return (this._optFlags & 8 ? this._funcH : null);
    }

    set funcH(v) {
        if (this._funcH !== v) {
            this._optFlags |= 8;
            this._funcH = v;
            if (this.hasFlexLayout()) {
                this._layout._originalHeight = 0;
                this.layout.changedDimensions(false, true);
            } else {
                this._h = 0;
                this._triggerRecalcTranslate();
            }
        }
    }

    disableFuncH() {
        this._optFlags = this._optFlags & (0xFFFF - 8);
        this._funcH = null;
    }

    getParent() {
        return this._parent;
    }

    setParent(p) {
        if (this._parent !== p) {
            const prevParent = this._parent;
            this._parent = p;
            if (this._layout || (p && p.isFlexContainer())) {
                this.layout.setParent(prevParent, p);
            }

            if (prevParent) {
                prevParent._triggerRecalcTranslate();
            }
            if (p) {
                p._triggerRecalcTranslate();
            }
        }
    }

    set children(v) {
        const children = v.map(o => {
            if (Utils.isObjectLiteral(o)) {
                const c = new Target();
                c.patch(o);
                return c;
            } else {
                return o;
            }
        });

        this._children = children;

        children.forEach(child => {
            child.setParent(this);
        });
    }

    get children() {
        return this._children;
    }

    addChildAt(index, child) {
        if (!this._children) this._children = [];
        this._children.splice(index, 0, child);
        child.setParent(this);
    };

    removeChildAt(index) {
        let child = this._children[index];
        this._children.splice(index, 1);
        child.setParent(null);
    }

    setLayout(x, y, w, h) {
        if (this._x !== x || this._y !== y || this._w !== w || this._h !== h) {
            this._x = x;
            this._y = y;
            this._w = w;
            this._h = h;
            this._triggerRecalcTranslate();
        }
    }

    set visible(v) {
        if (this._visible !== v) {
            this._visible = v;
            if (this.hasFlexLayout()) {
                this.layout.setVisible(v);
            }
        }
    }

    get visible() {
        return this._visible;
    }

    patch(settings) {
        Base.patchObject(this, settings);
    }

    toJson() {
        const json = {
            w:this.w,
            h:this.h,
            x:this.x,
            y:this.y,
            layout: [this._x, this._y, this._w, this._h].join(" "),
            r: this.r ? this.r.join(" ") : undefined,
            flex: this._layout && this._layout.flex ? Target.flexToJson(this._layout.flex):false,
            flexItem: this._layout && this._layout.flexItem ? Target.flexToJson(this._layout.flexItem):false,
            children:this._children.map(c => c.toJson())
        };
        if (!json.r) {
            delete json.r;
        }
        return json;
    }

    static flexToJson(flex) {
        return {
            direction: flex.direction,
            alignItems: flex.alignItems,
            alignContent: flex.alignContent,
            justifyContent: flex.justifyContent
        };
    }

    static flexItemToJson(flexItem) {
        return {
            grow: flexItem.grow,
            shrink: flexItem.shrink,
            alignSelf: flexItem.alignSelf
        };
    }

    toString() {
        const obj = this.toJson();
        return JSON.stringify(obj, null, 2);
    }

    getLocationString() {
        let i;
        i = this._parent ? this._parent._children.indexOf(this) : "R";
        let str = this._parent ? this._parent.getLocationString(): "";
        str += "[" + i + "]";
        return str;
    }

}