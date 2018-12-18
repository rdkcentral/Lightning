import FlexContainer from "./FlexContainer.mjs";
import FlexItem from "./FlexItem.mjs";

/**
 * This is the connection between the render tree with the layout tree of this flex container/item.
 */
export default class FlexTarget {

    constructor(target) {
        this._target = target;

        this._recalc = 0;
        
        this._enabled = false;

        this.x = 0;
        this.y = 0;
        this.w = 0;
        this.h = 0;

        this._originalWidth = 0;
        this._originalHeight = 0;

        this._flex = null;
        this._flexItem = null;
        this._flexItemDisabled = false;

        this._items = null;
    }

    get flexLayout() {
        return this.flex._layout;
    }

    layoutFlexTree() {
        this.flexLayout.updateLayoutTree();
        this.flexLayout.updateItemCoords();
    }

    resetNonFlexLayout() {
        this.x = 0;
        this.y = 0;
        this.w = this.originalWidth;
        this.h = this.originalHeight;
    }

    get target() {
        return this._target;
    }

    get flex() {
        return this._flex;
    }

    set flex(v) {
        if (!v) {
            if (this.isFlexEnabled()) {
                this._disableFlex();
            }
        } else {
            if (!this.isFlexEnabled()) {
                this._enableFlex();
            }
            this._flex.patch(v);
        }
    }

    get flexItem() {
        this._ensureFlexItem();
        return this._flexItem;
    }

    set flexItem(v) {
        if (v === false) {
            if (!this._flexItemDisabled) {
                this._flexItemDisabled = true;
                this._checkEnabled();
                const parent = this.flexParent;
                if (parent) {
                    parent._clearFlexItemsCache();
                    parent._setRecalc();
                }
            }
        } else {
            this._ensureFlexItem();

            this._flexItem.patch(v);

            if (this._flexItemDisabled) {
                this._flexItemDisabled = false;
                this._checkEnabled();
                const parent = this.flexParent;
                if (parent) {
                    parent._clearFlexItemsCache();
                    parent._setRecalc();
                }
            }
        }
    }

    get flexItemDisabled() {
        return this._flexItemDisabled;
    }

    _enableFlex() {
        this._flex = new FlexContainer(this);
        this._checkEnabled();

        this._enableChildrenAsFlexItems();
    }

    _disableFlex() {
        this._flex = null;
        this._checkEnabled();
        this._disableChildrenAsFlexItems();
    }

    _enableChildrenAsFlexItems() {
        const children = this._target._children;
        if (children) {
            for (let i = 0, n = children.length; i < n; i++) {
                const child = children[i];
                child.layout._enableFlexItem();
            }
        }
    }

    _disableChildrenAsFlexItems() {
        const children = this._target._children;
        if (children) {
            for (let i = 0, n = children.length; i < n; i++) {
                const child = children[i];
                child.layout._disableFlexItem();
            }
        }
    }

    _enableFlexItem() {
        this._ensureFlexItem();
        this._checkEnabled();
    }

    _disableFlexItem() {
        // We leave the flexItem object because it may contain custom settings.
        this._checkEnabled();
    }

    _ensureFlexItem() {
        if (!this._flexItem) {
            this._flexItem = new FlexItem(this);
        }
    }

    _checkEnabled() {
        const enabled = this.isEnabled();
        if (this._enabled !== enabled) {
            if (enabled) {
                this._enable();
            } else {
                this._disable();
            }
            this._enabled = enabled;
        }
    }
    
    _enable() {
        this._setupTargetForFlex();
        this._target.enableFlexLayout();
    }

    _disable() {
        this._restoreTargetToNonFlex();
        this._target.disableFlexLayout();
    }

    isEnabled() {
        return this.isFlexEnabled() || this.isFlexItemEnabled();
    }

    isFlexEnabled() {
        return this._flex !== null;
    }

    isFlexItemEnabled() {
        return (this.flexParent !== null) && !this._flexItemDisabled;
    }

    _restoreTargetToNonFlex() {
        const target = this._target;
        target.x = 0;
        target.y = 0;
        target.w = this.originalWidth;
        target.h = this.originalHeight;
    }

    _setupTargetForFlex() {
        const target = this._target;
        this.originalWidth = target.w;
        this.originalHeight = target.h;
    }
    
    setParent(from, to) {
        if (from && from.isFlexContainer()) {
            from._layout._changedChildren();
        }

        if (to && to.isFlexContainer()) {
            this._ensureFlexItem();
            to._layout._changedChildren();
        }
        this._checkEnabled();
    }

    get flexParent() {
        const parent = this._target._parent;
        if (parent && parent.isFlexContainer()) {
            return parent._layout;
        }
        return null;
    }

    setVisible(v) {
        const parent = this.flexParent;
        if (parent) {
            parent._changedChildren();
        }
    }

    get items() {
        if (!this._items) {
            this._items = this._getFlexItems();
        }
        return this._items;
    }

    _getFlexItems() {
        const items = [];
        const children = this._target._children;
        if (children) {
            for (let i = 0, n = children.length; i < n; i++) {
                const item = children[i];
                if (item.visible) {
                    if (item.isFlexItem()) {
                        items.push(item.layout);
                    }
                }
            }
        }
        return items;
    }

    _changedChildren() {
        this._clearFlexItemsCache();
        this.mustUpdate();
    }

    _clearFlexItemsCache() {
        this._items = null;
    }

    setLayout(x, y, w, h) {
        this.target.setLayout(x, y, w, h);
    }

    mustUpdate() {
        this._setRecalc();
    }

    _setRecalc() {
        this._recalc = 2;
        let cur = this;
        while(true) {
            const newCur = cur.flexParent;
            if (!newCur || newCur._recalc) {
                break;
            }
            cur = newCur;
            cur._recalc = 1;
        }
        const flexTreeRoot = cur;
        flexTreeRoot._target.triggerLayout();
    }

    clearRecalcFlag() {
        this._recalc = 0;
    }

    /**
     * @pre target is a flex item.
     */
    isFlexTreeRoot() {
        return !this.flexParent;
    }

    get originalWidth() {
        return this._originalWidth;
    }

    get originalHeight() {
        return this._originalHeight;
    }

    set originalWidth(v) {
        this._originalWidth = v;
        this._setRecalc();
    }

    set originalHeight(v) {
        this._originalHeight = v;
        this._setRecalc();
    }
}