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
        if (this.hasFlexLayout()) {
            return this._layout.originalX;
        } else {
            return this._x;
        }
    }

    set offsetX(v) {
        if (this.hasFlexLayout()) {
            this._x += (v - this._layout.originalX);
            this._triggerRecalcTranslate();
            this._layout.setOriginalXWithoutUpdatingLayout(v);
        } else {
            this.x = v;
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

    get offsetY() {
        if (this.hasFlexLayout()) {
            return this._layout.originalY;
        } else {
            return this._y;
        }
    }

    set offsetY(v) {
        if (this.hasFlexLayout()) {
            this._y += (v - this._layout.originalY);
            this._triggerRecalcTranslate();
            this._layout.setOriginalYWithoutUpdatingLayout(v);
        } else {
            this.y = v;
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

    get w() {
        return this._w;
    }

    set w(v) {
        if (this.hasFlexLayout()) {
            this._layout.originalWidth = v;
        } else {
            this._w = v;
            this._triggerRecalcTranslate();
        }
    }

    get h() {
        return this._h;
    }

    set h(v) {
        if (this.hasFlexLayout()) {
            this._layout.originalHeight = v;
        }
        this._h = v;
        this._triggerRecalcTranslate();
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

}