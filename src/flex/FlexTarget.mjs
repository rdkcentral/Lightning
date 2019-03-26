import FlexContainer from "./FlexContainer.mjs";
import FlexItem from "./FlexItem.mjs";
import FlexUtils from "./FlexUtils.mjs";

/**
 * This is the connection between the render tree with the layout tree of this flex container/item.
 */
export default class FlexTarget {

    constructor(target) {
        this._target = target;

        /**
         * Possible values (only in case of container):
         * bit 0: has changed or contains items with changes
         * bit 1: width changed
         * bit 2: height changed
         */
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

    layoutFlexTree() {
        if (this.isFlexEnabled() && this.isChanged()) {
            this.flexLayout.layoutTree();
        }
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
        if (this._flexItemDisabled) {
            return false;
        }
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
                    parent.changedContents();
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
                    parent.changedContents();
                }
            }
        }
    }

    _enableFlex() {
        this._flex = new FlexContainer(this);
        this._checkEnabled();
        this.changedDimensions();
        this._enableChildrenAsFlexItems();
    }

    _disableFlex() {
        this.changedDimensions();
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
        flexParent.changedContents();
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
        target.setDimensions(this._originalWidth, this._originalHeight);
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
        this.changedContents();
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

    changedDimensions(changeWidth = true, changeHeight = true) {
        this._updateRecalc(changeWidth, changeHeight);
    }

    changedContents() {
        this._updateRecalc();
    }

    forceLayout() {
        this._updateRecalc();
    }

    isChanged() {
        return this._recalc > 0;
    }

    _updateRecalc(changeExternalWidth = false, changeExternalHeight = false) {
        if (this.isFlexEnabled()) {
            const layout = this._flex._layout;

            // When something internal changes, it can have effect on the external dimensions.
            changeExternalWidth = changeExternalWidth || layout.isAxisFitToContents(true);
            changeExternalHeight = changeExternalHeight || layout.isAxisFitToContents(false);
        }

        const recalc = 1 + (changeExternalWidth ? 2 : 0) + (changeExternalHeight ? 4 : 0);
        const newRecalcFlags = this.getNewRecalcFlags(recalc);
        this._recalc |= recalc;
        if (newRecalcFlags > 1) {
            if (this.flexParent) {
                this.flexParent._updateRecalcBottomUp(recalc);
            } else {
                this._target.triggerLayout();
            }
        } else {
            this._target.triggerLayout();
        }
    }

    getNewRecalcFlags(flags) {
        return (7 - this._recalc) & flags;
    }

    _updateRecalcBottomUp(childRecalc) {
        const newRecalc = this._getRecalcFromChangedChildRecalc(childRecalc);
        const newRecalcFlags = this.getNewRecalcFlags(newRecalc);
        this._recalc |= newRecalc;
        if (newRecalcFlags > 1) {
            const flexParent = this.flexParent;
            if (flexParent) {
                flexParent._updateRecalcBottomUp(newRecalc);
            } else {
                this._target.triggerLayout();
            }
        } else {
            this._target.triggerLayout();
        }
    }

    _getRecalcFromChangedChildRecalc(childRecalc) {
        const layout = this._flex._layout;

        const mainAxisRecalcFlag = layout._horizontal ? 1 : 2;
        const crossAxisRecalcFlag = layout._horizontal ? 2 : 1;

        const crossAxisDimensionsChangedInChild = (childRecalc & crossAxisRecalcFlag);
        if (!crossAxisDimensionsChangedInChild) {
            const mainAxisDimensionsChangedInChild = (childRecalc & mainAxisRecalcFlag);
            if (mainAxisDimensionsChangedInChild) {
                const mainAxisIsWrapping = layout.isWrapping();
                if (mainAxisIsWrapping) {
                    const crossAxisIsFitToContents = layout.isCrossAxisFitToContents();
                    if (crossAxisIsFitToContents) {
                        // Special case: due to wrapping, the cross axis size may be changed.
                        childRecalc += crossAxisRecalcFlag;
                    }
                }
            }
        }

        let isWidthDynamic = layout.isAxisFitToContents(true);
        let isHeightDynamic = layout.isAxisFitToContents(false);

        if (layout.shrunk) {
            // If during previous layout this container was 'shrunk', any changes may change the 'min axis size' of the
            // contents, leading to a different axis size on this container even when it was not 'fit to contents'.
            if (layout._horizontal) {
                isWidthDynamic = true;
            } else {
                isHeightDynamic = true;
            }
        }

        const localRecalc = 1 + (isWidthDynamic ? 2 : 0) + (isHeightDynamic ? 4 : 0);

        const combinedRecalc = childRecalc & localRecalc;
        return combinedRecalc;
    }

    get recalc() {
        return this._recalc;
    }

    clearRecalcFlag() {
        this._recalc = 0;
    }

    enableLocalRecalcFlag() {
        this._recalc = 1;
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
            this.changedDimensions(true, false);
        }
    }

    get originalHeight() {
        return this._originalHeight;
    }

    set originalHeight(v) {
        if (this._originalHeight !== v) {
            this._originalHeight = v;
            this.changedDimensions(false, true);
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