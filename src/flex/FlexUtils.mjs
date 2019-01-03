export default class FlexUtils {

    static getParentAxisSizeWithPadding(item, horizontal) {
        const target = item.target;
        const parent = target.getParent();
        if (!parent) {
            return 0;
        } else {
            const flexParent = item.flexParent;
            if (flexParent) {
                // Use pending layout size.
                return this.getAxisLayoutSize(flexParent, horizontal) + this.getTotalPadding(flexParent, horizontal);
            } else {
                // Use 'absolute' size.
                return horizontal ? parent.w : parent.h;
            }
        }
    }

    static getRelAxisSize(item, horizontal) {
        if (horizontal) {
            if (item.funcW) {
                if (this._allowRelAxisSizeFunction(item, true)) {
                    return item.funcW(this.getParentAxisSizeWithPadding(item, true));
                } else {
                    return 0;
                }
            } else {
                return item.originalWidth;
            }
        } else {
            if (item.funcH) {
                if (this._allowRelAxisSizeFunction(item, false)) {
                    return item.funcH(this.getParentAxisSizeWithPadding(item, false));
                } else {
                    return 0;
                }
            } else {
                return item.originalHeight;
            }
        }
    }

    static _allowRelAxisSizeFunction(item, horizontal) {
        const flexParent = item.flexParent;
        if (flexParent && flexParent._flex._layout.isAxisFitToContents(horizontal)) {
            // We don't allow relative width on fit-to-contents because it leads to conflicts.
            return false;
        }
        return true;
    }

    static isZeroAxisSize(item, horizontal) {
        if (horizontal) {
            return !item.originalWidth && !item.funcW;
        } else {
            return !item.originalHeight && !item.funcH;
        }
    }

    static getAxisLayoutPos(item, horizontal) {
        return horizontal ? item.x : item.y;
    }

    static getAxisLayoutSize(item, horizontal) {
        return horizontal ? item.w : item.h;
    }

    static setAxisLayoutPos(item, horizontal, pos) {
        if (horizontal) {
            item.x = pos;
        } else {
            item.y = pos;
        }
    }

    static setAxisLayoutSize(item, horizontal, size) {
        if (horizontal) {
            item.w = size;
        } else {
            item.h = size;
        }
    }

    static getAxisMinSize(item, horizontal) {
        let minSize = this.getPlainAxisMinSize(item, horizontal);

        let flexItemMinSize = 0;
        if (item.isFlexItemEnabled()) {
            flexItemMinSize = item._flexItem._getMinSizeSetting(horizontal);
        }

        const hasLimitedMinSize = (flexItemMinSize > 0);
        if (hasLimitedMinSize) {
            minSize = Math.max(minSize, flexItemMinSize);
        }
        return minSize;
    }

    static getPlainAxisMinSize(item, horizontal) {
        if (item.isFlexEnabled()) {
            return item._flex._layout.getAxisMinSize(horizontal);
        } else {
            const isShrinkable = (item.flexItem.shrink !== 0);
            if (isShrinkable) {
                return 0;
            } else {
                return this.getRelAxisSize(item, horizontal);
            }
        }
    }

    static resizeAxis(item, horizontal, size) {
        if (item.isFlexEnabled()) {
            const isMainAxis = (item._flex._horizontal === horizontal);
            if (isMainAxis) {
                item._flex._layout.resizeMainAxis(size);
            } else {
                item._flex._layout.resizeCrossAxis(size);
            }
        } else {
            this.setAxisLayoutSize(item, horizontal, size);
        }
    }


    static getPaddingOffset(item, horizontal) {
        if (item.isFlexEnabled()) {
            const flex = item._flex;
            if (horizontal) {
                return flex.paddingLeft;
            } else {
                return flex.paddingTop;
            }
        } else {
            return 0;
        }
    }

    static getTotalPadding(item, horizontal) {
        if (item.isFlexEnabled()) {
            const flex = item._flex;
            if (horizontal) {
                return flex.paddingRight + flex.paddingLeft;
            } else {
                return flex.paddingTop + flex.paddingBottom;
            }
        } else {
            return 0;
        }
    }

    static getMarginOffset(item, horizontal) {
        const flexItem = item.flexItem;
        if (flexItem) {
            if (horizontal) {
                return flexItem.marginLeft;
            } else {
                return flexItem.marginTop;
            }
        } else {
            return 0;
        }
    }

    static getTotalMargin(item, horizontal) {
        const flexItem = item.flexItem;
        if (flexItem) {
            if (horizontal) {
                return flexItem.marginRight + flexItem.marginLeft;
            } else {
                return flexItem.marginTop + flexItem.marginBottom;
            }
        } else {
            return 0;
        }
    }

}