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
        return this.flex ? this.flex._layout : null;
    }

    layoutFlexTree() {
        if (this.isFlexEnabled() && this.isChanged()) {
            this.flexLayout.layoutTree();
        }
    }

    resetNonFlexLayout() {
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

    _enableFlex() {
        this._flex = new FlexContainer(this);
        this._checkEnabled();
        this._setRecalc();
        this._enableChildrenAsFlexItems();
    }

    _disableFlex() {
        this._flex = null;
        this._checkEnabled();
        this._setRecalc();
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
        this._setRecalc();
    }

    _disableFlexItem() {
        // We leave the flexItem object because it may contain custom settings.
        this._checkEnabled();
        this._setRecalc();

        // Offsets have been changed. We can't recover them, so we'll just clear them instead.
        this._resetOffsets();
    }

    _resetOffsets() {
        this.x = 0;
        this.y = 0;
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
        target.w = this._originalWidth;
        target.h = this._originalHeight;
    }

    _setupTargetForFlex() {
        const target = this._target;
        this._originalWidth = target.w;
        this._originalHeight = target.h;
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
        if (this.isFlexItemEnabled()) {
            this.target.setLayout(x, y, w, h);
        } else {
            // Reuse the x,y 'settings'.
            this.target.setLayoutDims(w, h);
        }
    }

    mustUpdateDeferred() {
        this._recalc = 2;
        this._target.triggerLayout();
    }

    mustUpdate() {
        this._setRecalc();
    }

    isChanged() {
        return this._recalc > 0;
    }

    _setRecalc() {
        if (this.isEnabled() && (this._recalc !== 2)) {
            this._recalc = 2;
            let cur = this;
            do {
                const newCur = cur.flexParent;
                if (!newCur) {
                    break;
                }

                if (newCur._recalc) {
                    // Change already known.
                    return;
                }

                newCur._recalc = 1;

                cur = newCur;

                // We do not have to re-layout the upper flex tree because the content changes won't affect it.
            } while(!cur.isFlexNotSizedByToContents());

            const flexLayoutRoot = cur;
            flexLayoutRoot._target.triggerLayout();
        }
    }

    clearRecalcFlag() {
        this._recalc = 0;
    }

    isFlexNotSizedByToContents() {
        return !this._flex._isFitToContents();
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