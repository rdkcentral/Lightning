import FlexContainer from "./FlexContainer.mjs";
import FlexItem from "./FlexItem.mjs";
import FlexUtils from "./FlexUtils.mjs";

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

        this._originalX = 0;
        this._originalY = 0;
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

    isLayoutRoot() {
        return this.flexParent === null;
    }

    layoutFlexTree() {
        if (this.isFlexEnabled() && this.isChanged()) {
            this.flexLayout.layoutTree();
        }
    }

    resetLayoutSize() {
        let w = FlexUtils.getRelAxisSize(this, true);
        let h = FlexUtils.getRelAxisSize(this, false);
        const flexItem = this._flexItem;
        if (flexItem._minWidth) {
            w = Math.max(flexItem._minWidth, w);
        }
        if (flexItem._maxWidth) {
            w = Math.min(flexItem._maxWidth, w);
        }
        if (flexItem._minHeight) {
            h = Math.max(flexItem._minHeight, h);
        }
        if (flexItem._maxHeight) {
            h = Math.min(flexItem._maxHeight, h);
        }
        this.w = w;
        this.h = h;
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
                const parent = this.flexParent;
                this._flexItemDisabled = true;
                this._checkEnabled();
                if (parent) {
                    parent._clearFlexItemsCache();
                    parent.mustUpdateInternal();
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
                    parent.mustUpdateInternal();
                }
            }
        }
    }

    _enableFlex() {
        this._flex = new FlexContainer(this);
        this._checkEnabled();
        this.mustUpdateExternal();
        this._enableChildrenAsFlexItems();
    }

    _disableFlex() {
        this.mustUpdateExternal();
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
        const flexParent = this._target._parent._layout;
        this._flexItem.ctr = flexParent._flex;
        flexParent.mustUpdateInternal();
        this._checkEnabled();
    }

    _disableFlexItem() {
        if (this._flexItem) {
            this._flexItem.ctr = null;
        }

        // We keep the flexItem object because it may contain custom settings.
        this._checkEnabled();

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
        return this.flexParent !== null;
    }

    _restoreTargetToNonFlex() {
        const target = this._target;
        target.x = this._originalX;
        target.y = this._originalY;
        target.w = this._originalWidth;
        target.h = this._originalHeight;
    }

    _setupTargetForFlex() {
        const target = this._target;
        this._originalX = target._x;
        this._originalY = target._y;
        this._originalWidth = target._w;
        this._originalHeight = target._h;
    }
    
    setParent(from, to) {
        if (from && from.isFlexContainer()) {
            from._layout._changedChildren();
        }

        if (to && to.isFlexContainer()) {
            this._enableFlexItem();
            to._layout._changedChildren();
        }
        this._checkEnabled();
    }

    get flexParent() {
        if (this._flexItemDisabled) {
            return null;
        }

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
        this.mustUpdateInternal();
    }

    _clearFlexItemsCache() {
        this._items = null;
    }

    setLayout(x, y, w, h) {
        let originalX = this._originalX;
        let originalY = this._originalY;
        if (this.funcX) {
            originalX = this.funcX(FlexUtils.getParentAxisSizeWithPadding(this, true));
        }
        if (this.funcY) {
            originalY = this.funcY(FlexUtils.getParentAxisSizeWithPadding(this, false));
        }

        if (this.isFlexItemEnabled()) {
            this.target.setLayout(x + originalX, y + originalY, w, h);
        } else {
            // Reuse the x,y 'settings'.
            this.target.setLayout(originalX, originalY, w, h);
        }
    }

    mustUpdateExternal() {
        const parent = this.flexParent;
        if (parent) {
            parent._setRecalc();
        }
        this._setRecalc();
    }

    mustUpdateInternal() {
        this._setRecalc();
    }

    isChanged() {
        return this._recalc > 0;
    }

    _setRecalc() {
        if (this.isFlexEnabled()) {
            const prevRecalc = this._recalc;
            this._recalc = 2;

            if (prevRecalc === 0) {
                this._setRecalcAncestorsUntilRootFound();
            }
        }
    }

    _setRecalcAncestorsUntilRootFound() {
        let cur = this;

        let newCur;
        while(newCur = cur.flexParent) {
            if (newCur._recalc) {
                // Change already known.
                return;
            }

            newCur._recalc = 1;

            cur = newCur;

            // We do not have to re-layout the upper flex tree because the content changes won't affect it.
        }

        const flexLayoutRoot = cur;
        flexLayoutRoot._target.triggerLayout();
    }

    clearRecalcFlag() {
        this._recalc = 0;
    }

    get originalX() {
        return this._originalX;
    }

    setOriginalXWithoutUpdatingLayout(v) {
        this._originalX = v;
    }

    get originalY() {
        return this._originalY;
    }

    setOriginalYWithoutUpdatingLayout(v) {
        this._originalY = v;
    }

    get originalWidth() {
        return this._originalWidth;
    }

    set originalWidth(v) {
        if (this._originalWidth !== v) {
            this._originalWidth = v;
            this.mustUpdateExternal();
        }
    }

    get originalHeight() {
        return this._originalHeight;
    }

    set originalHeight(v) {
        if (this._originalHeight !== v) {
            this._originalHeight = v;
            this.mustUpdateExternal();
        }
    }

    get funcX() {
        return this._target.funcX;
    }

    get funcY() {
        return this._target.funcY;
    }

    get funcW() {
        return this._target.funcW;
    }

    get funcH() {
        return this._target.funcH;
    }
}