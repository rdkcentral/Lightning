var lng = (function () {
    'use strict';

    class StageUtils {

        static mergeNumbers(v1, v2, p) {
            return v1 * p + v2 * (1 - p);
        };

        static rgb(r, g, b) {
            return (r << 16) + (g << 8) + b + (255 * 16777216);
        };

        static rgba(r, g, b, a) {
            return (r << 16) + (g << 8) + b + (((a * 255) | 0) * 16777216);
        };

        static getRgbString(color) {
            let r = ((color / 65536) | 0) % 256;
            let g = ((color / 256) | 0) % 256;
            let b = color % 256;
            return 'rgb(' + r + ',' + g + ',' + b + ')';
        };

        static getRgbaString(color) {
            let r = ((color / 65536) | 0) % 256;
            let g = ((color / 256) | 0) % 256;
            let b = color % 256;
            let a = ((color / 16777216) | 0) / 255;
            return 'rgba(' + r + ',' + g + ',' + b + ',' + a.toFixed(4) + ')';
        };

        static getRgbaStringFromArray(color) {
            let r = Math.floor(color[0] * 255);
            let g = Math.floor(color[1] * 255);
            let b = Math.floor(color[2] * 255);
            let a = Math.floor(color[3] * 255) / 255;
            return 'rgba(' + r + ',' + g + ',' + b + ',' + a.toFixed(4) + ')';
        };

        static getRgbaComponentsNormalized(argb) {
            let r = ((argb / 65536) | 0) % 256;
            let g = ((argb / 256) | 0) % 256;
            let b = argb % 256;
            let a = ((argb / 16777216) | 0);
            return [r / 255, g / 255, b / 255, a / 255];
        };

        static getRgbComponentsNormalized(argb) {
            let r = ((argb / 65536) | 0) % 256;
            let g = ((argb / 256) | 0) % 256;
            let b = argb % 256;
            return [r / 255, g / 255, b / 255];
        };

        static getRgbaComponents(argb) {
            let r = ((argb / 65536) | 0) % 256;
            let g = ((argb / 256) | 0) % 256;
            let b = argb % 256;
            let a = ((argb / 16777216) | 0);
            return [r, g, b, a];
        };

        static getArgbNumber(rgba) {
            rgba[0] = Math.max(0, Math.min(255, rgba[0]));
            rgba[1] = Math.max(0, Math.min(255, rgba[1]));
            rgba[2] = Math.max(0, Math.min(255, rgba[2]));
            rgba[3] = Math.max(0, Math.min(255, rgba[3]));
            let v = ((rgba[3] | 0) << 24) + ((rgba[0] | 0) << 16) + ((rgba[1] | 0) << 8) + (rgba[2] | 0);
            if (v < 0) {
                v = 0xFFFFFFFF + v + 1;
            }
            return v;
        };

        static mergeColors(c1, c2, p) {
            let r1 = ((c1 / 65536) | 0) % 256;
            let g1 = ((c1 / 256) | 0) % 256;
            let b1 = c1 % 256;
            let a1 = ((c1 / 16777216) | 0);

            let r2 = ((c2 / 65536) | 0) % 256;
            let g2 = ((c2 / 256) | 0) % 256;
            let b2 = c2 % 256;
            let a2 = ((c2 / 16777216) | 0);

            let r = r1 * p + r2 * (1 - p);
            let g = g1 * p + g2 * (1 - p);
            let b = b1 * p + b2 * (1 - p);
            let a = a1 * p + a2 * (1 - p);

            return Math.round(a) * 16777216 + Math.round(r) * 65536 + Math.round(g) * 256 + Math.round(b);
        };

        static mergeMultiColors(c, p) {
            let r = 0, g = 0, b = 0, a = 0, t = 0;
            let n = c.length;
            for (let i = 0; i < n; i++) {
                let r1 = ((c[i] / 65536) | 0) % 256;
                let g1 = ((c[i] / 256) | 0) % 256;
                let b1 = c[i] % 256;
                let a1 = ((c[i] / 16777216) | 0);
                r += r1 * p[i];
                g += g1 * p[i];
                b += b1 * p[i];
                a += a1 * p[i];
                t += p[i];
            }

            t = 1 / t;
            return Math.round(a * t) * 16777216 + Math.round(r * t) * 65536 + Math.round(g * t) * 256 + Math.round(b * t);
        };

        static mergeMultiColorsEqual(c) {
            let r = 0, g = 0, b = 0, a = 0, t = 0;
            let n = c.length;
            for (let i = 0; i < n; i++) {
                let r1 = ((c[i] / 65536) | 0) % 256;
                let g1 = ((c[i] / 256) | 0) % 256;
                let b1 = c[i] % 256;
                let a1 = ((c[i] / 16777216) | 0);
                r += r1;
                g += g1;
                b += b1;
                a += a1;
                t += 1.0;
            }

            t = 1 / t;
            return Math.round(a * t) * 16777216 + Math.round(r * t) * 65536 + Math.round(g * t) * 256 + Math.round(b * t);
        };

        static mergeColorAlpha(c, alpha) {
            let a = ((c / 16777216 | 0) * alpha) | 0;
            return (((((c >> 16) & 0xff) * a) / 255) & 0xff) +
                ((((c & 0xff00) * a) / 255) & 0xff00) +
                (((((c & 0xff) << 16) * a) / 255) & 0xff0000) +
                (a << 24);
        };

        static rad(deg) {
            return deg * (Math.PI / 180);
        };

        static getTimingBezier(a, b, c, d) {
            let xc = 3.0 * a;
            let xb = 3.0 * (c - a) - xc;
            let xa = 1.0 - xc - xb;
            let yc = 3.0 * b;
            let yb = 3.0 * (d - b) - yc;
            let ya = 1.0 - yc - yb;

            return function (time) {
                if (time >= 1.0) {
                    return 1;
                }
                if (time <= 0) {
                    return 0;
                }

                let t = 0.5, cbx, cbxd, dx;

                for (let it = 0; it < 20; it++) {
                    cbx = t * (t * (t * xa + xb) + xc);
                    dx = time - cbx;
                    if (dx > -1e-8 && dx < 1e-8) {
                        return t * (t * (t * ya + yb) + yc);
                    }

                    // Cubic bezier derivative.
                    cbxd = t * (t * (3 * xa) + 2 * xb) + xc;

                    if (cbxd > 1e-10 && cbxd < 1e-10) {
                        // Problematic. Fall back to binary search method.
                        break;
                    }

                    t += dx / cbxd;
                }

                // Fallback: binary search method. This is more reliable when there are near-0 slopes.
                let minT = 0;
                let maxT = 1;
                for (let it = 0; it < 20; it++) {
                    t = 0.5 * (minT + maxT);

                    cbx = t * (t * (t * xa + xb) + xc);

                    dx = time - cbx;
                    if (dx > -1e-8 && dx < 1e-8) {
                        // Solution found!
                        return t * (t * (t * ya + yb) + yc);
                    }

                    if (dx < 0) {
                        maxT = t;
                    } else {
                        minT = t;
                    }
                }

            };
        };

        static getTimingFunction(str) {
            switch (str) {
                case "linear":
                    return function (time) {
                        return time
                    };
                case "ease":
                    return StageUtils.getTimingBezier(0.25, 0.1, 0.25, 1.0);
                case "ease-in":
                    return StageUtils.getTimingBezier(0.42, 0, 1.0, 1.0);
                case "ease-out":
                    return StageUtils.getTimingBezier(0, 0, 0.58, 1.0);
                case "ease-in-out":
                    return StageUtils.getTimingBezier(0.42, 0, 0.58, 1.0);
                case "step-start":
                    return function () {
                        return 1
                    };
                case "step-end":
                    return function (time) {
                        return time === 1 ? 1 : 0;
                    };
                default:
                    let s = "cubic-bezier(";
                    if (str && str.indexOf(s) === 0) {
                        let parts = str.substr(s.length, str.length - s.length - 1).split(",");
                        if (parts.length !== 4) {
                            console.warn("Unknown timing function: " + str);

                            // Fallback: use linear.
                            return function (time) {
                                return time
                            };
                        }
                        let a = parseFloat(parts[0]);
                        let b = parseFloat(parts[1]);
                        let c = parseFloat(parts[2]);
                        let d = parseFloat(parts[3]);
                        if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d)) {
                            console.warn("Unknown timing function: " + str);
                            // Fallback: use linear.
                            return function (time) {
                                return time
                            };
                        }

                        return StageUtils.getTimingBezier(a, b, c, d);
                    } else {
                        console.warn("Unknown timing function: " + str);
                        // Fallback: use linear.
                        return function (time) {
                            return time
                        };
                    }
            }
        };

    }

    class Utils {

        static isFunction(value) {
            return typeof value === 'function';
        }

        static isNumber(value) {
            return typeof value === 'number';
        }

        static isInteger(value) {
            return (typeof value === 'number' && (value % 1) === 0);
        }

        static isBoolean(value) {
            return value === true || value === false;
        }

        static isString(value) {
            return typeof value === 'string';
        }

        static clone(v) {
            if (Utils.isObjectLiteral(v) || Array.isArray(v)) {
                return Utils.getDeepClone(v);
            } else {
                // Copy by value.
                return v;
            }
        }

        static cloneObjShallow(obj) {
            let keys = Object.keys(obj);
            let clone = {};
            for (let i = 0; i < keys.length; i++) {
                clone[keys[i]] = obj[keys[i]];
            }
            return clone;
        }

        static merge(obj1, obj2) {
            let keys = Object.keys(obj2);
            for (let i = 0; i < keys.length; i++) {
                obj1[keys[i]] = obj2[keys[i]];
            }
            return obj1;
        }

        static isObject(value) {
            let type = typeof value;
            return !!value && (type === 'object' || type === 'function');
        }

        static isPlainObject(value) {
            let type = typeof value;
            return !!value && (type === 'object');
        }

        static isObjectLiteral(value){
            return typeof value === 'object' && value && value.constructor === Object;
        }

        static getArrayIndex(index, arr) {
            return Utils.getModuloIndex(index, arr.length);
        }

        static getModuloIndex(index, len) {
            if (len === 0) return index;
            while (index < 0) {
                index += Math.ceil(-index / len) * len;
            }
            index = index % len;
            return index;
        }

        static getDeepClone(obj) {
            let i, c;
            if (Utils.isFunction(obj)) {
                // Copy functions by reference.
                return obj;
            }
            if (Array.isArray(obj)) {
                c = [];
                let keys = Object.keys(obj);
                for (i = 0; i < keys.length; i++) {
                    c[keys[i]] = Utils.getDeepClone(obj[keys[i]]);
                }
                return c;
            } else if (Utils.isObject(obj)) {
                c = {};
                let keys = Object.keys(obj);
                for (i = 0; i < keys.length; i++) {
                    c[keys[i]] = Utils.getDeepClone(obj[keys[i]]);
                }
                return c;
            } else {
                return obj;
            }
        }

        static equalValues(v1, v2) {
            if ((typeof v1) !== (typeof v2)) return false;
            if (Utils.isObjectLiteral(v1)) {
                return Utils.isObjectLiteral(v2) && Utils.equalObjectLiterals(v1, v2);
            } else if (Array.isArray(v1)) {
                return Array.isArray(v2) && Utils.equalArrays(v1, v2);
            } else {
                return v1 === v2;
            }
        }

        static equalObjectLiterals(obj1, obj2) {
            let keys1 = Object.keys(obj1);
            let keys2 = Object.keys(obj2);
            if (keys1.length !== keys2.length) {
                return false;
            }

            for (let i = 0, n = keys1.length; i < n; i++) {
                const k1 = keys1[i];
                const k2 = keys2[i];
                if (k1 !== k2) {
                    return false;
                }

                const v1 = obj1[k1];
                const v2 = obj2[k2];

                if (!Utils.equalValues(v1, v2)) {
                    return false;
                }
            }

            return true;
        }

        static equalArrays(v1, v2) {
            if (v1.length !== v2.length) {
                return false;
            }
            for (let i = 0, n = v1.length; i < n; i++) {
                if (!this.equalValues(v1[i], v2[i])) {
                    return false;
                }
            }

            return true;
        }

        static setToArray(s) {
            let result = [];
            s.forEach(function (value) {
                result.push(value);
            });
            return result;
        }

        static iteratorToArray(iterator) {
            let result = [];
            let iteratorResult = iterator.next();
            while (!iteratorResult.done) {
                result.push(iteratorResult.value);
                iteratorResult = iterator.next();
            }
            return result;
        }

        static isUcChar(charcode) {
            return charcode >= 65 && charcode <= 90;
        }

    }

    Utils.isNode = (typeof window === "undefined");
    Utils.isWeb = (typeof window !== "undefined");
    Utils.isWPE = Utils.isWeb && (navigator.userAgent.indexOf("WPE") !== -1);

    class Base {

        static defaultSetter(obj, name, value) {
            obj[name] = value;
        }

        static patchObject(obj, settings) {
            if (!Utils.isObjectLiteral(settings)) {
                console.error("Settings must be object literal");
            } else {
                let names = Object.keys(settings);
                for (let i = 0, n = names.length; i < n; i++) {
                    let name = names[i];

                    this.patchObjectProperty(obj, name, settings[name]);
                }
            }
        }

        static preparePatchSettings(settings, patchId) {
            if (patchId) {
                return this._preparePatchSettings(settings, "_$" + patchId);
            } else {
                return settings;
            }
        }

        static _preparePatchSettings(settings, patchId) {
            if (patchId && settings[patchId]) {
                settings = Object.assign({}, settings, settings[patchId]);
                delete settings[patchId];
            }
            return settings;
        }

        static patchObjectProperty(obj, name, value) {
            let setter = obj.setSetting || Base.defaultSetter;

            if (name.charAt(0) === "_") {
                // Disallow patching private variables.
                if (name.charAt(1) === "$") ; else if (name !== "__create") {
                    console.error("Patch of private property '" + name + "' is not allowed");
                }
            } else if (name !== "type") {
                // Type is a reserved keyword to specify the class type on creation.
                if (Utils.isFunction(value) && value.__local) {
                    // Local function (Base.local(s => s.something))
                    value = value.__local(obj);
                }

                setter(obj, name, value);
            }
        }

        static local(func) {
            // This function can be used as an object setting, which is called with the target object.
            func.__local = true;
        }


    }

    class SpacingCalculator {

        static getSpacing(mode, numberOfItems, remainingSpace) {
            const itemGaps = (numberOfItems - 1);
            let spacePerGap;

            let spacingBefore, spacingBetween;

            switch(mode) {
                case "flex-start":
                    spacingBefore = 0;
                    spacingBetween = 0;
                    break;
                case "flex-end":
                    spacingBefore = remainingSpace;
                    spacingBetween = 0;
                    break;
                case "center":
                    spacingBefore = remainingSpace / 2;
                    spacingBetween = 0;
                    break;
                case "space-between":
                    spacingBefore = 0;
                    spacingBetween = Math.max(0, remainingSpace) / itemGaps;
                    break;
                case "space-around":
                    if (remainingSpace < 0) {
                        return this.getSpacing("center", numberOfItems, remainingSpace);
                    } else {
                        spacePerGap = remainingSpace / (itemGaps + 1);
                        spacingBefore = 0.5 * spacePerGap;
                        spacingBetween = spacePerGap;
                    }
                    break;
                case "space-evenly":
                    if (remainingSpace < 0) {
                        return this.getSpacing("center", numberOfItems, remainingSpace);
                    } else {
                        spacePerGap = remainingSpace / (itemGaps + 2);
                        spacingBefore = spacePerGap;
                        spacingBetween = spacePerGap;
                    }
                    break;
                case "stretch":
                    spacingBefore = 0;
                    spacingBetween = 0;
                    break;
                default:
                    throw new Error("Unknown mode: " + mode);
            }

            return {spacingBefore, spacingBetween}
        }

    }

    class ContentAligner {

        constructor(layout) {
            this._layout = layout;
            this._totalCrossAxisSize = 0;
        }

        get _lines() {
            return this._layout._lines;
        }

        init() {
            this._totalCrossAxisSize = this._getTotalCrossAxisSize();
        }

        align() {
            const crossAxisSize = this._layout.crossAxisSize;
            const remainingSpace = crossAxisSize - this._totalCrossAxisSize;

            const {spacingBefore, spacingBetween} = this._getSpacing(remainingSpace);

            const lines = this._lines;

            const mode = this._layout._flexContainer.alignContent;
            let growSize = 0;
            if (mode === "stretch" && lines.length && (remainingSpace > 0)) {
                growSize = remainingSpace / lines.length;
            }

            let currentPos = spacingBefore;
            for (let i = 0, n = lines.length; i < n; i++) {
                const crossAxisLayoutOffset = currentPos;
                const aligner = lines[i].createItemAligner();

                let finalCrossAxisLayoutSize = lines[i].crossAxisLayoutSize + growSize;

                aligner.setCrossAxisLayoutSize(finalCrossAxisLayoutSize);
                aligner.setCrossAxisLayoutOffset(crossAxisLayoutOffset);

                aligner.align();

                if (aligner.recursiveResizeOccured) {
                    lines[i].setItemPositions();
                }

                currentPos += finalCrossAxisLayoutSize;
                currentPos += spacingBetween;
            }
        }

        get totalCrossAxisSize() {
            return this._totalCrossAxisSize;
        }

        _getTotalCrossAxisSize() {
            const lines = this._lines;
            let total = 0;
            for (let i = 0, n = lines.length; i < n; i++) {
                const line = lines[i];
                total += line.crossAxisLayoutSize;
            }
            return total;
        }

        _getSpacing(remainingSpace) {
            const mode = this._layout._flexContainer.alignContent;
            const numberOfItems = this._lines.length;
            return SpacingCalculator.getSpacing(mode, numberOfItems, remainingSpace);
        }

    }

    class FlexUtils {

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

    class SizeShrinker {

        constructor(line) {
            this._line = line;
            this._amountRemaining = 0;
            this._shrunkSize = 0;
        }

        shrink(amount) {
            this._shrunkSize = 0;

            this._amountRemaining = amount;
            let totalShrinkAmount = this._getTotalShrinkAmount();
            if (totalShrinkAmount) {
                const items = this._line.items;
                do {
                    let amountPerShrink = this._amountRemaining / totalShrinkAmount;
                    for (let i = this._line.startIndex; i <= this._line.endIndex; i++) {
                        const item = items[i];
                        const flexItem = item.flexItem;
                        const shrinkAmount = flexItem.shrink;
                        const isShrinkableItem = (shrinkAmount > 0);
                        if (isShrinkableItem) {
                            let shrink = shrinkAmount * amountPerShrink;
                            const minSize = flexItem._getMainAxisMinSize();
                            const size = flexItem._getMainAxisLayoutSize();
                            if (size > minSize) {
                                const maxShrink = size - minSize;
                                const isFullyShrunk = (shrink >= maxShrink);
                                if (isFullyShrunk) {
                                    shrink = maxShrink;

                                    // Destribute remaining amount over the other flex items.
                                    totalShrinkAmount -= shrinkAmount;
                                }

                                const finalSize = size - shrink;
                                flexItem._resizeMainAxis(finalSize);

                                this._shrunkSize += shrink;
                                this._amountRemaining -= shrink;

                                if (Math.abs(this._amountRemaining) < 10e-6) {
                                    return;
                                }
                            }
                        }
                    }
                } while(totalShrinkAmount && (Math.abs(this._amountRemaining) > 10e-6));
            }
        }

        _getTotalShrinkAmount() {
            let total = 0;
            const items = this._line.items;
            for (let i = this._line.startIndex; i <= this._line.endIndex; i++) {
                const item = items[i];
                const flexItem = item.flexItem;

                if (flexItem.shrink) {
                    const minSize = flexItem._getMainAxisMinSize();
                    const size = flexItem._getMainAxisLayoutSize();

                    // Exclude those already fully shrunk.
                    if (size > minSize) {
                        total += flexItem.shrink;
                    }
                }
            }
            return total;
        }

        getShrunkSize() {
            return this._shrunkSize;
        }

    }

    class SizeGrower {

        constructor(line) {
            this._line = line;
            this._amountRemaining = 0;
            this._grownSize = 0;
        }

        grow(amount) {
            this._grownSize = 0;

            this._amountRemaining = amount;
            let totalGrowAmount = this._getTotalGrowAmount();
            if (totalGrowAmount) {
                const items = this._line.items;
                do {
                    let amountPerGrow = this._amountRemaining / totalGrowAmount;
                    for (let i = this._line.startIndex; i <= this._line.endIndex; i++) {
                        const item = items[i];
                        const flexItem = item.flexItem;
                        const growAmount = flexItem.grow;
                        const isGrowableItem = (growAmount > 0);
                        if (isGrowableItem) {
                            let grow = growAmount * amountPerGrow;
                            const maxSize = flexItem._getMainAxisMaxSizeSetting();
                            const size = flexItem._getMainAxisLayoutSize();
                            if (maxSize > 0) {
                                if (size >= maxSize) {
                                    // Already fully grown.
                                    grow = 0;
                                } else {
                                    const maxGrow = maxSize - size;
                                    const isFullyGrown = (grow >= maxGrow);
                                    if (isFullyGrown) {
                                        grow = maxGrow;

                                        // Destribute remaining amount over the other flex items.
                                        totalGrowAmount -= growAmount;
                                    }
                                }
                            }

                            if (grow > 0) {
                                const finalSize = size + grow;
                                flexItem._resizeMainAxis(finalSize);

                                this._grownSize += grow;
                                this._amountRemaining -= grow;

                                if (Math.abs(this._amountRemaining) < 10e-6) {
                                    return;
                                }
                            }
                        }
                    }
                } while(totalGrowAmount && (Math.abs(this._amountRemaining) > 10e-6));
            }
        }

        _getTotalGrowAmount() {
            let total = 0;
            const items = this._line.items;
            for (let i = this._line.startIndex; i <= this._line.endIndex; i++) {
                const item = items[i];
                const flexItem = item.flexItem;

                if (flexItem.grow) {
                    const maxSize = flexItem._getMainAxisMaxSizeSetting();
                    const size = flexItem._getMainAxisLayoutSize();

                    // Exclude those already fully grown.
                    if (maxSize === 0 || size < maxSize) {
                        total += flexItem.grow;
                    }
                }
            }
            return total;
        }

        getGrownSize() {
            return this._grownSize;
        }

    }

    class ItemPositioner {

        constructor(lineLayout) {
            this._line = lineLayout;
        }

        get _layout() {
            return this._line._layout;
        }

        position() {
            const {spacingBefore, spacingBetween} = this._getSpacing();

            let currentPos = spacingBefore;

            const items = this._line.items;
            for (let i = this._line.startIndex; i <= this._line.endIndex; i++) {
                const item = items[i];

                item.flexItem._setMainAxisLayoutPos(currentPos);
                currentPos += item.flexItem._getMainAxisLayoutSizeWithPaddingAndMargin();
                currentPos += spacingBetween;
            }
        }

        _getSpacing() {
            const remainingSpace = this._line._availableSpace;
            let mode = this._layout._flexContainer.justifyContent;
            const numberOfItems = this._line.numberOfItems;

            return SpacingCalculator.getSpacing(mode, numberOfItems, remainingSpace);
        }

    }

    class ItemAligner {

        constructor(line) {
            this._line = line;
            this._crossAxisLayoutSize = 0;
            this._crossAxisLayoutOffset = 0;
            this._alignItemsSetting = null;
            this._recursiveResizeOccured = false;
            this._isCrossAxisFitToContents = false;
        }

        get _layout() {
            return this._line._layout;
        }

        get _flexContainer() {
            return this._layout._flexContainer;
        }

        setCrossAxisLayoutSize(size) {
            this._crossAxisLayoutSize = size;
        }

        setCrossAxisLayoutOffset(offset) {
            this._crossAxisLayoutOffset = offset;
        }

        align() {
            this._alignItemsSetting = this._flexContainer.alignItems;

            this._isCrossAxisFitToContents = this._layout.isAxisFitToContents(!this._flexContainer._horizontal);

            this._recursiveResizeOccured = false;
            const items = this._line.items;
            for (let i = this._line.startIndex; i <= this._line.endIndex; i++) {
                const item = items[i];
                this._alignItem(item);
            }
        }

        get recursiveResizeOccured() {
            return this._recursiveResizeOccured;
        }

        _alignItem(item) {
            const flexItem = item.flexItem;
            let align = flexItem.alignSelf || this._alignItemsSetting;

            if (align === "stretch" && this._preventStretch(flexItem)) {
                align = "flex-start";
            }

            if (align !== "stretch" && !this._isCrossAxisFitToContents) {
                if (flexItem._hasRelCrossAxisSize()) {
                    // As cross axis size might have changed, we need to recalc the relative flex item's size.
                    flexItem._resetCrossAxisLayoutSize();
                }
            }

            switch(align) {
                case "flex-start":
                    this._alignItemFlexStart(flexItem);
                    break;
                case "flex-end":
                    this._alignItemFlexEnd(flexItem);
                    break;
                case "center":
                    this._alignItemFlexCenter(flexItem);
                    break;
                case "stretch":
                    this._alignItemStretch(flexItem);
                    break;
            }
        }

        _alignItemFlexStart(flexItem) {
            flexItem._setCrossAxisLayoutPos(this._crossAxisLayoutOffset);
        }

        _alignItemFlexEnd(flexItem) {
            const itemCrossAxisSize = flexItem._getCrossAxisLayoutSizeWithPaddingAndMargin();
            flexItem._setCrossAxisLayoutPos(this._crossAxisLayoutOffset + (this._crossAxisLayoutSize - itemCrossAxisSize));
        }

        _alignItemFlexCenter(flexItem) {
            const itemCrossAxisSize = flexItem._getCrossAxisLayoutSizeWithPaddingAndMargin();
            const center = (this._crossAxisLayoutSize - itemCrossAxisSize) / 2;
            flexItem._setCrossAxisLayoutPos(this._crossAxisLayoutOffset + center);
        }

        _alignItemStretch(flexItem) {
            flexItem._setCrossAxisLayoutPos(this._crossAxisLayoutOffset);

            const mainAxisLayoutSizeBeforeResize = flexItem._getMainAxisLayoutSize();
            let size = this._crossAxisLayoutSize - flexItem._getCrossAxisMargin() - flexItem._getCrossAxisPadding();

            const crossAxisMinSizeSetting = flexItem._getCrossAxisMinSizeSetting();
            if (crossAxisMinSizeSetting > 0) {
                size = Math.max(size, crossAxisMinSizeSetting);
            }

            const crossAxisMaxSizeSetting = flexItem._getCrossAxisMaxSizeSetting();
            const crossAxisMaxSizeSettingEnabled = (crossAxisMaxSizeSetting > 0);
            if (crossAxisMaxSizeSettingEnabled) {
                size = Math.min(size, crossAxisMaxSizeSetting);
            }

            flexItem._resizeCrossAxis(size);
            const mainAxisLayoutSizeAfterResize = flexItem._getMainAxisLayoutSize();

            const recursiveResize = (mainAxisLayoutSizeAfterResize !== mainAxisLayoutSizeBeforeResize);
            if (recursiveResize) {
                // Recursive resize can happen when this flex item has the opposite direction than the container
                // and is wrapping and auto-sizing. Due to item/content stretching the main axis size of the flex
                // item may decrease. If it does so, we must re-justify-content the complete line.
                // Notice that we don't account for changes to the (if autosized) main axis size caused by recursive
                // resize, which may cause the container's main axis to not shrink to the contents properly.
                // This is by design, because if we had re-run the main axis layout, we could run into issues such
                // as slow layout or endless loops.
                this._recursiveResizeOccured = true;
            }
        }

        _preventStretch(flexItem) {
            const hasFixedCrossAxisSize = flexItem._hasFixedCrossAxisSize();
            const forceStretch = (flexItem.alignSelf === "stretch");
            return hasFixedCrossAxisSize && !forceStretch;
        }

    }

    class LineLayout {

        constructor(layout, startIndex, endIndex, availableSpace) {
            this._layout = layout;
            this.items = layout.items;
            this.startIndex = startIndex;
            this.endIndex = endIndex;
            this._availableSpace = availableSpace;
        }

        performLayout() {
            this._setItemSizes();
            this.setItemPositions();
            this._calcLayoutInfo();
        }

        _setItemSizes() {
            if (this._availableSpace > 0) {
                this._growItemSizes(this._availableSpace);
            } else if (this._availableSpace < 0) {
                this._shrinkItemSizes(-this._availableSpace);
            }
        }

        _growItemSizes(amount) {
            const grower = new SizeGrower(this);
            grower.grow(amount);
            this._availableSpace -= grower.getGrownSize();
        }

        _shrinkItemSizes(amount) {
            const shrinker = new SizeShrinker(this);
            shrinker.shrink(amount);
            this._availableSpace += shrinker.getShrunkSize();
        }

        setItemPositions() {
            const positioner = new ItemPositioner(this);
            positioner.position();
        }

        createItemAligner() {
            return new ItemAligner(this);
        }

        _calcLayoutInfo() {
            this._calcCrossAxisMaxLayoutSize();
        }

        getMainAxisMinSize() {
            let mainAxisMinSize = 0;
            for (let i = this.startIndex; i <= this.endIndex; i++) {
                const item = this.items[i];
                mainAxisMinSize += item.flexItem._getMainAxisMinSizeWithPaddingAndMargin();
            }
            return mainAxisMinSize;
        }
        
        get numberOfItems() {
            return this.endIndex - this.startIndex + 1;
        }

        isOnlyLine() {
            return (this._layout.numberOfItems === (1 + (this.endIndex - this.startIndex)));
        }

        get crossAxisLayoutSize() {
            const noSpecifiedCrossAxisSize = (this._layout.isCrossAxisFitToContents() && !this._layout.resizingCrossAxis);
            const shouldFitToContents = (!this.isOnlyLine() || noSpecifiedCrossAxisSize);
            if (shouldFitToContents) {
                return this._crossAxisMaxLayoutSize;
            } else {
                return this._layout.crossAxisSize;
            }
        }

        _calcCrossAxisMaxLayoutSize() {
            this._crossAxisMaxLayoutSize = this._getCrossAxisMaxLayoutSize();
        }

        _getCrossAxisMaxLayoutSize() {
            let crossAxisMaxSize = 0;
            for (let i = this.startIndex; i <= this.endIndex; i++) {
                const item = this.items[i];
                crossAxisMaxSize = Math.max(crossAxisMaxSize, item.flexItem._getCrossAxisLayoutSizeWithPaddingAndMargin());
            }
            return crossAxisMaxSize;
        }


    }

    /**
     * Distributes items over layout lines.
     */
    class LineLayouter {

        constructor(layout) {
            this._layout = layout;
            this._mainAxisMinSize = -1;
            this._crossAxisMinSize = -1;
            this._mainAxisContentSize = 0;
        }

        get lines() {
            return this._lines;
        }

        get mainAxisMinSize() {
            if (this._mainAxisMinSize === -1) {
                this._mainAxisMinSize = this._getMainAxisMinSize();
            }
            return this._mainAxisMinSize;
        }

        get crossAxisMinSize() {
            if (this._crossAxisMinSize === -1) {
                this._crossAxisMinSize = this._getCrossAxisMinSize();
            }
            return this._crossAxisMinSize;
        }

        get mainAxisContentSize() {
            return this._mainAxisContentSize;
        }

        layoutLines() {
            this._setup();
            const items = this._layout.items;
            const wrap = this._layout.isWrapping();

            let startIndex = 0;
            let i;
            const n = items.length;
            for (i = 0; i < n; i++) {
                const item = items[i];

                this._layoutFlexItem(item);

                // Get predicted main axis size.
                const itemMainAxisSize = item.flexItem._getMainAxisLayoutSizeWithPaddingAndMargin();

                if (wrap && (i > startIndex)) {
                    const isOverflowing = (this._curMainAxisPos + itemMainAxisSize > this._mainAxisSize);
                    if (isOverflowing) {
                        this._layoutLine(startIndex, i - 1);
                        this._curMainAxisPos = 0;
                        startIndex = i;
                    }
                }

                this._addToMainAxisPos(itemMainAxisSize);
            }

            if (startIndex < i) {
                this._layoutLine(startIndex, i - 1);
            }
        }

        _layoutFlexItem(item) {
            if (item.isFlexEnabled()) {
                item.flexLayout.updateTreeLayout();
            } else {
                item.flexItem._resetLayoutSize();
            }
        }

        _setup() {
            this._mainAxisSize = this._layout.mainAxisSize;
            this._curMainAxisPos = 0;
            this._maxMainAxisPos = 0;
            this._lines = [];

            this._mainAxisMinSize = -1;
            this._crossAxisMinSize = -1;
            this._mainAxisContentSize = 0;
        }

        _addToMainAxisPos(itemMainAxisSize) {
            this._curMainAxisPos += itemMainAxisSize;
            if (this._curMainAxisPos > this._maxMainAxisPos) {
                this._maxMainAxisPos = this._curMainAxisPos;
            }
        }

        _layoutLine(startIndex, endIndex) {
            const availableSpace = this._getAvailableMainAxisLayoutSpace();
            const line = new LineLayout(this._layout, startIndex, endIndex, availableSpace);
            line.performLayout();
            this._lines.push(line);

            if (this._mainAxisContentSize === 0 || (this._curMainAxisPos > this._mainAxisContentSize)) {
                this._mainAxisContentSize = this._curMainAxisPos;
            }
        }

        _getAvailableMainAxisLayoutSpace() {
            if (!this._layout.resizingMainAxis && this._layout.isMainAxisFitToContents()) {
                return 0;
            } else {
                return this._mainAxisSize - this._curMainAxisPos;
            }
        }

        _getCrossAxisMinSize() {
            let crossAxisMinSize = 0;
            const items = this._layout.items;
            for (let i = 0, n = items.length; i < n; i++) {
                const item = items[i];
                const itemCrossAxisMinSize = item.flexItem._getCrossAxisMinSizeWithPaddingAndMargin();
                crossAxisMinSize = Math.max(crossAxisMinSize, itemCrossAxisMinSize);
            }
            return crossAxisMinSize;
        }

        _getMainAxisMinSize() {
            if (this._lines.length === 1) {
                return this._lines[0].getMainAxisMinSize();
            } else {
                // Wrapping lines: specified width is used as min width (in accordance to W3C flexbox).
                return this._layout.mainAxisSize;
            }
        }

    }

    class ItemCoordinatesUpdater {

        constructor(layout) {
            this._layout = layout;
            this._isReverse = this._flexContainer._reverse;
            this._horizontalPaddingOffset = this._layout._getHorizontalPaddingOffset();
            this._verticalPaddingOffset = this._layout._getVerticalPaddingOffset();
        }

        get _flexContainer() {
            return this._layout._flexContainer;
        }

        finalize() {
            const parentFlex = this._layout.getParentFlexContainer();
            if (parentFlex) {
                // We must update it from the parent to set padding offsets and reverse position.
                const updater = new ItemCoordinatesUpdater(parentFlex._layout);
                updater._finalizeItemAndChildren(this._flexContainer.item);
            } else {
                this._finalizeRoot();
                this._finalizeItems();
            }
        }

        _finalizeRoot() {
            const item = this._flexContainer.item;
            let x = FlexUtils.getAxisLayoutPos(item, true);
            let y = FlexUtils.getAxisLayoutPos(item, false);
            let w = FlexUtils.getAxisLayoutSize(item, true);
            let h = FlexUtils.getAxisLayoutSize(item, false);

            w += this._layout._getHorizontalPadding();
            h += this._layout._getVerticalPadding();

            item.clearRecalcFlag();

            item.setLayout(x, y, w, h);
        }

        _finalizeItems() {
            const items = this._layout.items;
            for (let i = 0, n = items.length; i < n; i++) {
                const item = items[i];
                const validCache = this._validateItemCache(item);

                // Notice that we must also finalize a cached items, as it's coordinates may have changed.
                this._finalizeItem(item);

                if (!validCache) {
                    this._finalizeItemChildren(item);
                }
            }
        }

        _validateItemCache(item) {
            if (item.recalc === 0) {
                if (item.isFlexEnabled()) {
                    const layout = item._flex._layout;

                    const dimensionsMatchPreviousResult = (item.w === item.target.w && item.h === item.target.h);
                    if (dimensionsMatchPreviousResult) {
                        // Cache is valid.
                        return true;
                    } else {
                        const crossAxisSize = layout.crossAxisSize;
                        layout.performResizeMainAxis(layout.mainAxisSize);
                        layout.performResizeCrossAxis(crossAxisSize);
                    }
                }
            }
            return false;
        }

        _finalizeItemAndChildren(item) {
            this._finalizeItem(item);
            this._finalizeItemChildren(item);
        }

        _finalizeItem(item) {
            if (this._isReverse) {
                this._reverseMainAxisLayoutPos(item);
            }

            let x = FlexUtils.getAxisLayoutPos(item, true);
            let y = FlexUtils.getAxisLayoutPos(item, false);
            let w = FlexUtils.getAxisLayoutSize(item, true);
            let h = FlexUtils.getAxisLayoutSize(item, false);

            x += this._horizontalPaddingOffset;
            y += this._verticalPaddingOffset;

            const flex = item.flex;
            if (flex) {
                w += item._flex._layout._getHorizontalPadding();
                h += item._flex._layout._getVerticalPadding();
            }

            const flexItem = item.flexItem;
            if (flexItem) {
                x += flexItem._getHorizontalMarginOffset();
                y += flexItem._getVerticalMarginOffset();
            }

            item.clearRecalcFlag();
            item.setLayout(x, y, w, h);
        }

        _finalizeItemChildren(item) {
            const flex = item._flex;
            if (flex) {
                const updater = new ItemCoordinatesUpdater(flex._layout);
                updater._finalizeItems();
            }
        }

        _reverseMainAxisLayoutPos(item) {
            const endPos = (item.flexItem._getMainAxisLayoutPos() + item.flexItem._getMainAxisLayoutSizeWithPaddingAndMargin());
            const reversedPos = this._layout.mainAxisSize - endPos;
            item.flexItem._setMainAxisLayoutPos(reversedPos);
        }

    }

    /**
     * Layouts a flex container (and descendants).
     */
    class FlexLayout {

        constructor(flexContainer) {
            this._flexContainer = flexContainer;

            this._lineLayouter = new LineLayouter(this);

            this._resizingMainAxis = false;
            this._resizingCrossAxis = false;

            this._cachedMainAxisSizeAfterLayout = 0;
            this._cachedCrossAxisSizeAfterLayout = 0;

            this._shrunk = false;
        }

        get shrunk() {
            return this._shrunk;
        }

        get recalc() {
            return this.item.recalc;
        }

        layoutTree() {
            const isSubTree = (this.item.flexParent !== null);
            if (isSubTree) {
                // Use the dimensions set by the parent flex tree.
                this._updateSubTreeLayout();
            } else {
                this.updateTreeLayout();
            }
            this.updateItemCoords();
        }

        updateTreeLayout() {
            if (this.recalc) {
                this._performUpdateLayoutTree();
            } else {
                this._performUpdateLayoutTreeFromCache();
            }
        }

        _performUpdateLayoutTree() {
            this._setInitialAxisSizes();
            this._layoutAxes();
            this._refreshLayoutCache();
        }

        _refreshLayoutCache() {
            this._cachedMainAxisSizeAfterLayout = this.mainAxisSize;
            this._cachedCrossAxisSizeAfterLayout = this.crossAxisSize;
        }

        _performUpdateLayoutTreeFromCache() {
            const sizeMightHaveChanged = (this.item.funcW || this.item.funcH);
            if (sizeMightHaveChanged) {
                // Update after all.
                this.item.enableLocalRecalcFlag();
                this._performUpdateLayoutTree();
            } else {
                this.mainAxisSize = this._cachedMainAxisSizeAfterLayout;
                this.crossAxisSize = this._cachedCrossAxisSizeAfterLayout;
            }
        }

        updateItemCoords() {
            const updater = new ItemCoordinatesUpdater(this);
            updater.finalize();
        }

        _updateSubTreeLayout() {
            // The dimensions of this container are guaranteed not to have changed.
            // That's why we can safely 'reuse' those and re-layout the contents.
            const crossAxisSize = this.crossAxisSize;
            this._layoutMainAxis();
            this.performResizeCrossAxis(crossAxisSize);
        }

        _setInitialAxisSizes() {
            if (this.item.isFlexItemEnabled()) {
                this.item.flexItem._resetLayoutSize();
            } else {
                this.mainAxisSize = this._getMainAxisBasis();
                this.crossAxisSize = this._getCrossAxisBasis();
            }
            this._resizingMainAxis = false;
            this._resizingCrossAxis = false;
            this._shrunk = false;
        }

        _layoutAxes() {
            this._layoutMainAxis();
            this._layoutCrossAxis();
        }

        /**
         * @pre mainAxisSize should exclude padding.
         */
        _layoutMainAxis() {
            this._layoutLines();
            this._fitMainAxisSizeToContents();
        }

        _layoutLines() {
            this._lineLayouter.layoutLines();
        }

        get _lines() {
            return this._lineLayouter.lines;
        }

        _fitMainAxisSizeToContents() {
            if (!this._resizingMainAxis) {
                if (this.isMainAxisFitToContents()) {
                    this.mainAxisSize = this._lineLayouter.mainAxisContentSize;
                }
            }
        }

        /**
         * @pre crossAxisSize should exclude padding.
         */
        _layoutCrossAxis() {
            const aligner = new ContentAligner(this);
            aligner.init();
            this._totalCrossAxisSize = aligner.totalCrossAxisSize;
            this._fitCrossAxisSizeToContents();
            aligner.align();
        }

        _fitCrossAxisSizeToContents() {
            if (!this._resizingCrossAxis) {
                if (this.isCrossAxisFitToContents()) {
                    this.crossAxisSize = this._totalCrossAxisSize;
                }
            }
        }

        isWrapping() {
            return this._flexContainer.wrap;
        }

        isAxisFitToContents(horizontal) {
            if (this._horizontal === horizontal) {
                return this.isMainAxisFitToContents();
            } else {
                return this.isCrossAxisFitToContents();
            }
        }

        isMainAxisFitToContents() {
            return !this.isWrapping() && !this._hasFixedMainAxisBasis();
        }

        isCrossAxisFitToContents() {
            return !this._hasFixedCrossAxisBasis();
        }

        _hasFixedMainAxisBasis() {
            return !FlexUtils.isZeroAxisSize(this.item, this._horizontal);
        }

        _hasFixedCrossAxisBasis() {
            return !FlexUtils.isZeroAxisSize(this.item, !this._horizontal);
        }

        getAxisMinSize(horizontal) {
            if (this._horizontal === horizontal) {
                return this._getMainAxisMinSize();
            } else {
                return this._getCrossAxisMinSize();
            }
        }

        _getMainAxisMinSize() {
            return this._lineLayouter.mainAxisMinSize;
        }

        _getCrossAxisMinSize() {
            return this._lineLayouter.crossAxisMinSize;
        }

        resizeMainAxis(size) {
            if (this.mainAxisSize !== size) {
                if (this.recalc > 0) {
                    this.performResizeMainAxis(size);
                } else {
                    if (this._checkValidCacheMainAxisResize()) {
                        this.mainAxisSize = size;
                        this._fitCrossAxisSizeToContents();
                    } else {
                        // Cache miss.
                        this.item.enableLocalRecalcFlag();
                        this.performResizeMainAxis(size);
                    }
                }
            }
        }

        _checkValidCacheMainAxisResize(size) {
            const isFinalMainAxisSize = (size === this.targetMainAxisSize);
            if (isFinalMainAxisSize) {
                return true;
            }
            const canIgnoreCacheMiss = !this.isCrossAxisFitToContents();
            if (canIgnoreCacheMiss) {
                // Allow other main axis resizes and check if final resize matches the target main axis size
                //  (ItemCoordinatesUpdater).
                return true;
            }
            return false;
        }

        performResizeMainAxis(size) {
            const isShrinking = (size < this.mainAxisSize);
            this._shrunk = isShrinking;

            this.mainAxisSize = size;

            this._resizingMainAxis = true;
            this._layoutAxes();
            this._resizingMainAxis = false;
        }

        resizeCrossAxis(size) {
            if (this.crossAxisSize !== size) {
                if (this.recalc > 0) {
                    this.performResizeCrossAxis(size);
                } else {
                    this.crossAxisSize = size;
                }
            }
        }

        performResizeCrossAxis(size) {
            this.crossAxisSize = size;

            this._resizingCrossAxis = true;
            this._layoutCrossAxis();
            this._resizingCrossAxis = false;
        }

        get targetMainAxisSize() {
            return this._horizontal ? this.item.target.w : this.item.target.h;
        }

        get targetCrossAxisSize() {
            return this._horizontal ? this.item.target.h : this.item.target.w;
        }

        getParentFlexContainer() {
            return this.item.isFlexItemEnabled() ? this.item.flexItem.ctr : null;
        }

        _getHorizontalPadding() {
            return FlexUtils.getTotalPadding(this.item, true);
        }

        _getVerticalPadding() {
            return FlexUtils.getTotalPadding(this.item, false);
        }

        _getHorizontalPaddingOffset() {
            return FlexUtils.getPaddingOffset(this.item, true);
        }

        _getVerticalPaddingOffset() {
            return FlexUtils.getPaddingOffset(this.item, false);
        }

        _getMainAxisBasis() {
            return FlexUtils.getRelAxisSize(this.item, this._horizontal);
        }

        _getCrossAxisBasis() {
            return FlexUtils.getRelAxisSize(this.item, !this._horizontal);
        }

        get _horizontal() {
            return this._flexContainer._horizontal;
        }

        get _reverse() {
            return this._flexContainer._reverse;
        }

        get item() {
            return this._flexContainer.item;
        }

        get items() {
            return this.item.items;
        }

        get resizingMainAxis() {
            return this._resizingMainAxis;
        }

        get resizingCrossAxis() {
            return this._resizingCrossAxis;
        }

        get numberOfItems() {
            return this.items.length;
        }

        get mainAxisSize() {
            return FlexUtils.getAxisLayoutSize(this.item, this._horizontal);
        }

        get crossAxisSize() {
            return FlexUtils.getAxisLayoutSize(this.item, !this._horizontal);
        }

        set mainAxisSize(v) {
            FlexUtils.setAxisLayoutSize(this.item, this._horizontal, v);
        }

        set crossAxisSize(v) {
            FlexUtils.setAxisLayoutSize(this.item, !this._horizontal, v);
        }

    }

    class FlexContainer {


        constructor(item) {
            this._item = item;

            this._layout = new FlexLayout(this);
            this._horizontal = true;
            this._reverse = false;
            this._wrap = false;
            this._alignItems = 'stretch';
            this._justifyContent = 'flex-start';
            this._alignContent = 'flex-start';

            this._paddingLeft = 0;
            this._paddingTop = 0;
            this._paddingRight = 0;
            this._paddingBottom = 0;
        }

        get item() {
            return this._item;
        }

        _changedDimensions() {
            this._item.changedDimensions();
        }

        _changedContents() {
            this._item.changedContents();
        }

        get direction() {
            return (this._horizontal ? "row" : "column") + (this._reverse ? "-reverse" : "");
        }

        set direction(f) {
            if (this.direction === f) return;

            this._horizontal = (f === 'row' || f === 'row-reverse');
            this._reverse = (f === 'row-reverse' || f === 'column-reverse');

            this._changedContents();
        }

        set wrap(v) {
            this._wrap = v;
            this._changedContents();
        }

        get wrap() {
            return this._wrap;
        }

        get alignItems() {
            return this._alignItems;
        }

        set alignItems(v) {
            if (this._alignItems === v) return;
            if (FlexContainer.ALIGN_ITEMS.indexOf(v) === -1) {
                throw new Error("Unknown alignItems, options: " + FlexContainer.ALIGN_ITEMS.join(","));
            }
            this._alignItems = v;

            this._changedContents();
        }

        get alignContent() {
            return this._alignContent;
        }

        set alignContent(v) {
            if (this._alignContent === v) return;
            if (FlexContainer.ALIGN_CONTENT.indexOf(v) === -1) {
                throw new Error("Unknown alignContent, options: " + FlexContainer.ALIGN_CONTENT.join(","));
            }
            this._alignContent = v;

            this._changedContents();
        }

        get justifyContent() {
            return this._justifyContent;
        }

        set justifyContent(v) {
            if (this._justifyContent === v) return;

            if (FlexContainer.JUSTIFY_CONTENT.indexOf(v) === -1) {
                throw new Error("Unknown justifyContent, options: " + FlexContainer.JUSTIFY_CONTENT.join(","));
            }
            this._justifyContent = v;

            this._changedContents();
        }

        set padding(v) {
            this.paddingLeft = v;
            this.paddingTop = v;
            this.paddingRight = v;
            this.paddingBottom = v;
        }

        get padding() {
            return this.paddingLeft;
        }
        
        set paddingLeft(v) {
            this._paddingLeft = v;
            this._changedDimensions();
        }
        
        get paddingLeft() {
            return this._paddingLeft;
        }

        set paddingTop(v) {
            this._paddingTop = v;
            this._changedDimensions();
        }

        get paddingTop() {
            return this._paddingTop;
        }

        set paddingRight(v) {
            this._paddingRight = v;
            this._changedDimensions();
        }

        get paddingRight() {
            return this._paddingRight;
        }

        set paddingBottom(v) {
            this._paddingBottom = v;
            this._changedDimensions();
        }

        get paddingBottom() {
            return this._paddingBottom;
        }

        patch(settings) {
            Base.patchObject(this, settings);
        }

    }

    FlexContainer.ALIGN_ITEMS = ["flex-start", "flex-end", "center", "stretch"];
    FlexContainer.ALIGN_CONTENT = ["flex-start", "flex-end", "center", "space-between", "space-around", "space-evenly", "stretch"];
    FlexContainer.JUSTIFY_CONTENT = ["flex-start", "flex-end", "center", "space-between", "space-around", "space-evenly"];

    class FlexItem {

        constructor(item) {
            this._ctr = null;
            this._item = item;
            this._grow = 0;
            this._shrink = FlexItem.SHRINK_AUTO;
            this._alignSelf = undefined;
            this._minWidth = 0;
            this._minHeight = 0;
            this._maxWidth = 0;
            this._maxHeight = 0;

            this._marginLeft = 0;
            this._marginTop = 0;
            this._marginRight = 0;
            this._marginBottom = 0;
        }

        get item() {
            return this._item;
        }

        get grow() {
            return this._grow;
        }

        set grow(v) {
            if (this._grow === v) return;

            this._grow = parseInt(v) || 0;

            this._changed();
        }

        get shrink() {
            if (this._shrink === FlexItem.SHRINK_AUTO) {
                return this._getDefaultShrink();
            }
            return this._shrink;
        }

        _getDefaultShrink() {
            if (this.item.isFlexEnabled()) {
                return 1;
            } else {
                // All non-flex containers are absolutely positioned items with fixed dimensions, and by default not shrinkable.
                return 0;
            }
        }

        set shrink(v) {
            if (this._shrink === v) return;

            this._shrink = parseInt(v) || 0;

            this._changed();
        }

        get alignSelf() {
            return this._alignSelf;
        }

        set alignSelf(v) {
            if (this._alignSelf === v) return;

            if (v === undefined) {
                this._alignSelf = undefined;
            }
            if (FlexContainer.ALIGN_ITEMS.indexOf(v) === -1) {
                throw new Error("Unknown alignSelf, options: " + FlexContainer.ALIGN_ITEMS.join(","));
            }
            this._alignSelf = v;

            this._changed();
        }

        get minWidth() {
            return this._minWidth;
        }

        set minWidth(v) {
            this._minWidth = Math.max(0, v);
            this._item.changedDimensions(true, false);
        }

        get minHeight() {
            return this._minHeight;
        }

        set minHeight(v) {
            this._minHeight = Math.max(0, v);
            this._item.changedDimensions(false, true);
        }

        get maxWidth() {
            return this._maxWidth;
        }

        set maxWidth(v) {
            this._maxWidth = Math.max(0, v);
            this._item.changedDimensions(true, false);
        }

        get maxHeight() {
            return this._maxHeight;
        }

        set maxHeight(v) {
            this._maxHeight = Math.max(0, v);
            this._item.changedDimensions(false, true);
        }

        /**
         * @note margins behave slightly different than in HTML with regard to shrinking.
         * In HTML, (outer) margins can be removed when shrinking. In this engine, they will not shrink at all.
         */
        set margin(v) {
            this.marginLeft = v;
            this.marginTop = v;
            this.marginRight = v;
            this.marginBottom = v;
        }

        get margin() {
            return this.marginLeft;
        }

        set marginLeft(v) {
            this._marginLeft = v;
            this._changed();
        }

        get marginLeft() {
            return this._marginLeft;
        }

        set marginTop(v) {
            this._marginTop = v;
            this._changed();
        }

        get marginTop() {
            return this._marginTop;
        }

        set marginRight(v) {
            this._marginRight = v;
            this._changed();
        }

        get marginRight() {
            return this._marginRight;
        }

        set marginBottom(v) {
            this._marginBottom = v;
            this._changed();
        }

        get marginBottom() {
            return this._marginBottom;
        }
        
        _changed() {
            if (this.ctr) this.ctr._changedContents();
        }

        set ctr(v) {
            this._ctr = v;
        }

        get ctr() {
            return this._ctr;
        }

        patch(settings) {
            Base.patchObject(this, settings);
        }

        _resetLayoutSize() {
            this._resetHorizontalAxisLayoutSize();
            this._resetVerticalAxisLayoutSize();
        }

        _resetCrossAxisLayoutSize() {
            if (this.ctr._horizontal) {
                this._resetVerticalAxisLayoutSize();
            } else {
                this._resetHorizontalAxisLayoutSize();
            }
        }

        _resetHorizontalAxisLayoutSize() {
            let w = FlexUtils.getRelAxisSize(this.item, true);
            if (this._minWidth) {
                w = Math.max(this._minWidth, w);
            }
            if (this._maxWidth) {
                w = Math.min(this._maxWidth, w);
            }
            FlexUtils.setAxisLayoutSize(this.item, true, w);
        }

        _resetVerticalAxisLayoutSize() {
            let h = FlexUtils.getRelAxisSize(this.item, false);
            if (this._minHeight) {
                h = Math.max(this._minHeight, h);
            }
            if (this._maxHeight) {
                h = Math.min(this._maxHeight, h);
            }
            FlexUtils.setAxisLayoutSize(this.item, false, h);
        }

        _getCrossAxisMinSizeSetting() {
            return this._getMinSizeSetting(!this.ctr._horizontal);
        }

        _getCrossAxisMaxSizeSetting() {
            return this._getMaxSizeSetting(!this.ctr._horizontal);
        }

        _getMainAxisMaxSizeSetting() {
            return this._getMaxSizeSetting(this.ctr._horizontal);
        }

        _getMinSizeSetting(horizontal) {
            if (horizontal) {
                return this._minWidth;
            } else {
                return this._minHeight;
            }
        }

        _getMaxSizeSetting(horizontal) {
            if (horizontal) {
                return this._maxWidth;
            } else {
                return this._maxHeight;
            }
        }

        _getMainAxisMinSize() {
            return FlexUtils.getAxisMinSize(this.item, this.ctr._horizontal);
        }

        _getCrossAxisMinSize() {
            return FlexUtils.getAxisMinSize(this.item, !this.ctr._horizontal);
        }

        _getMainAxisLayoutSize() {
            return FlexUtils.getAxisLayoutSize(this.item, this.ctr._horizontal);
        }

        _getMainAxisLayoutPos() {
            return FlexUtils.getAxisLayoutPos(this.item, this.ctr._horizontal);
        }

        _setMainAxisLayoutPos(pos) {
            return FlexUtils.setAxisLayoutPos(this.item, this.ctr._horizontal, pos);
        }

        _setCrossAxisLayoutPos(pos) {
            return FlexUtils.setAxisLayoutPos(this.item, !this.ctr._horizontal, pos);
        }

        _getCrossAxisLayoutSize() {
            return FlexUtils.getAxisLayoutSize(this.item, !this.ctr._horizontal);
        }

        _resizeCrossAxis(size) {
            return FlexUtils.resizeAxis(this.item, !this.ctr._horizontal, size);
        }

        _resizeMainAxis(size) {
            return FlexUtils.resizeAxis(this.item, this.ctr._horizontal, size);
        }

        _getMainAxisPadding() {
            return FlexUtils.getTotalPadding(this.item, this.ctr._horizontal);
        }

        _getCrossAxisPadding() {
            return FlexUtils.getTotalPadding(this.item, !this.ctr._horizontal);
        }

        _getMainAxisMargin() {
            return FlexUtils.getTotalMargin(this.item, this.ctr._horizontal);
        }

        _getCrossAxisMargin() {
            return FlexUtils.getTotalMargin(this.item, !this.ctr._horizontal);
        }

        _getHorizontalMarginOffset() {
            return FlexUtils.getMarginOffset(this.item, true);
        }

        _getVerticalMarginOffset() {
            return FlexUtils.getMarginOffset(this.item, false);
        }

        _getMainAxisMinSizeWithPaddingAndMargin() {
            return this._getMainAxisMinSize() + this._getMainAxisPadding() + this._getMainAxisMargin();
        }

        _getCrossAxisMinSizeWithPaddingAndMargin() {
            return this._getCrossAxisMinSize() + this._getCrossAxisPadding() + this._getCrossAxisMargin();
        }

        _getMainAxisLayoutSizeWithPaddingAndMargin() {
            return this._getMainAxisLayoutSize() + this._getMainAxisPadding() + this._getMainAxisMargin();
        }

        _getCrossAxisLayoutSizeWithPaddingAndMargin() {
            return this._getCrossAxisLayoutSize() + this._getCrossAxisPadding() + this._getCrossAxisMargin();
        }

        _hasFixedCrossAxisSize() {
            return !FlexUtils.isZeroAxisSize(this.item, !this.ctr._horizontal);
        }

        _hasRelCrossAxisSize() {
            return !!(this.ctr._horizontal ? this.item.funcH : this.item.funcW);
        }

    }


    FlexItem.SHRINK_AUTO = -1;

    /**
     * This is the connection between the render tree with the layout tree of this flex container/item.
     */
    class FlexTarget {

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

    class TextureSource {

        constructor(manager, loader = null) {
            this.id = TextureSource.id++;

            this.manager = manager;

            this.stage = manager.stage;

            /**
             * All enabled textures (textures that are used by visible views).
             * @type {Set<Texture>}
             */
            this.textures = new Set();

            /**
             * The number of active textures (textures that have at least one active view).
             * @type {number}
             * @private
             */
            this._activeTextureCount = 0;

            /**
             * The factory for the source of this texture.
             * @type {Function}
             */
            this.loader = loader;

            /**
             * Identifier for reuse.
             * @type {String}
             */
            this.lookupId = null;

            /**
             * If set, this.is called when the texture source is no longer displayed (this.components.size becomes 0).
             * @type {Function}
             */
            this._cancelCb = null;

            /**
             * Loading since timestamp in millis.
             * @type {number}
             */
            this.loadingSince = 0;

            this.w = 0;
            this.h = 0;

            this._nativeTexture = null;

            /**
             * If true, then this.texture source is never freed from memory during garbage collection.
             * @type {boolean}
             */
            this.permanent = false;

            /**
             * Sub-object with texture-specific rendering information.
             * For images, contains the src property, for texts, contains handy rendering information.
             * @type {Object}
             */
            this.renderInfo = null;

            /**
             * Generated for 'renderToTexture'.
             * @type {boolean}
             * @private
             */
            this._isResultTexture = !this.loader;

            /**
             * Contains the load error, if the texture source could previously not be loaded.
             * @type {object}
             * @private
             */
            this._loadError = null;

        }

        get loadError() {
            return this._loadError;
        }

        addTexture(v) {
            if (!this.textures.has(v)) {
                this.textures.add(v);
            }
        }

        removeTexture(v) {
            this.textures.delete(v);
        }

        incActiveTextureCount() {
            this._activeTextureCount++;
            if (this._activeTextureCount === 1) {
                this.becomesUsed();
            }
        }

        decActiveTextureCount() {
            this._activeTextureCount--;
            if (this._activeTextureCount === 0) {
                this.becomesUnused();
            }
        }

        get isResultTexture() {
            return this._isResultTexture;
        }

        set isResultTexture(v) {
            this._isResultTexture = v;
        }

        forEachEnabledView(cb) {
            this.textures.forEach(texture => {
                texture.views.forEach(cb);
            });
        }

        hasEnabledViews() {
            return this.textures.size > 0;
        }

        forEachActiveView(cb) {
            this.textures.forEach(texture => {
                texture.views.forEach(view => {
                    if (view.active) {
                        cb(view);
                    }
                });
            });
        }

        getRenderWidth() {
            return this.w;
        }

        getRenderHeight() {
            return this.h;
        }

        allowCleanup() {
            return !this.permanent && !this.isUsed();
        }

        becomesUsed() {
            // Even while the texture is being loaded, make sure it is on the lookup map so that others can reuse it.
            this.load();
        }

        becomesUnused() {
            this.cancel();
        }

        cancel() {
            if (this.isLoading()) {
                if (this._cancelCb) {
                    this._cancelCb(this);

                    // Clear callback to avoid memory leaks.
                    this._cancelCb = null;
                }
                this.loadingSince = 0;
            }
        }

        isLoaded() {
            return !!this._nativeTexture;
        }

        isLoading() {
            return this.loadingSince > 0;
        }

        isError() {
            return !!this._loadError;
        }

        reload() {
            this.free();
            if (this.isUsed()) {
                this.load();
            }
        }

        load() {
            // From the moment of loading (when a texture source becomes used by active views)
            if (this.isResultTexture) {
                // View result texture source, for which the loading is managed by the core.
                return;
            }

            if (!this._nativeTexture && !this.isLoading()) {
                this.loadingSince = (new Date()).getTime();
                this._cancelCb = this.loader((err, options) => {
                    // Ignore loads that come in after a cancel.
                    if (this.isLoading()) {
                        // Clear callback to avoid memory leaks.
                        this._cancelCb = null;

                        if (this.manager.stage.destroyed) {
                            // Ignore async load when stage is destroyed.
                            return;
                        }
                        if (err) {
                            // Emit txError.
                            this.onError(err);
                        } else if (options && options.source) {
                            this.loadingSince = 0;
                            this.setSource(options);
                        }
                    }
                }, this);
            }
        }

        setSource(options) {
            const source = options.source;

            this.w = source.width || (options && options.w) || 0;
            this.h = source.height || (options && options.h) || 0;

            if (options && options.renderInfo) {
                // Assign to id in cache so that it can be reused.
                this.renderInfo = options.renderInfo;
            }

            this.permanent = !!options.permanent;

            if (this._isNativeTexture(source)) {
                // Texture managed by caller.
                this._nativeTexture = source;

                this.w = this.w || source.w;
                this.h = this.h || source.h;

                // WebGLTexture objects are by default;
                this.permanent = options.hasOwnProperty('permanent') ? options.permanent : true;
            } else {
                this.manager.uploadTextureSource(this, options);
            }

            // Must be cleared when reload is succesful.
            this._loadError = null;

            this.onLoad();
        }

        isUsed() {
            return this._activeTextureCount > 0;
        }

        onLoad() {
            if (this.isUsed()) {
                this.forEachActiveView(function (view) {
                    view.onTextureSourceLoaded();
                });
            }
        }

        forceRenderUpdate() {
            // Userland should call this method after changing the nativeTexture manually outside of the framework
            //  (using tex[Sub]Image2d for example).

            if (this._nativeTexture) {
                // Change 'update' flag. This is currently not used by the framework but is handy in userland.
                this._nativeTexture.update = this.stage.frameCounter;
            }

            this.forEachActiveView(function (view) {
                view.forceRenderUpdate();
            });

        }

        forceUpdateRenderCoords() {
            this.forEachActiveView(function (view) {
                view._updateTextureCoords();
            });
        }

        get nativeTexture() {
            return this._nativeTexture;
        }

        clearNativeTexture() {
            this._nativeTexture = null;
        }

        /**
         * Used for result textures.
         */
        replaceNativeTexture(newNativeTexture, w, h) {
            let prevNativeTexture = this._nativeTexture;
            // Loaded by core.
            this._nativeTexture = newNativeTexture;
            this.w = w;
            this.h = h;

            if (!prevNativeTexture && this._nativeTexture) {
                this.forEachActiveView(view => view.onTextureSourceLoaded());
            }

            if (!this._nativeTexture) {
                this.forEachActiveView(view => view._setDisplayedTexture(null));
            }

            // Dimensions must be updated also on enabled views, as it may force it to go within bounds.
            this.forEachEnabledView(view => view._updateDimensions());

            // Notice that the sprite map must never contain render textures.
        }

        onError(e) {
            this._loadError = e;
            this.loadingSince = 0;
            console.error('texture load error', e, this.lookupId);
            this.forEachActiveView(view => view.onTextureSourceLoadError(e));
        }

        free() {
            this.manager.freeTextureSource(this);
        }

        _isNativeTexture(source) {
            return ((Utils.isNode ? source.constructor.name === "WebGLTexture" : source instanceof WebGLTexture));
        }

    }

    TextureSource.prototype.isTextureSource = true;

    TextureSource.id = 1;

    class ViewTexturizer {

        constructor(viewCore) {

            this._view = viewCore.view;
            this._core = viewCore;

            this.ctx = this._core.ctx;

            this._enabled = false;
            this.lazy = false;
            this._colorize = false;

            this._renderTexture = null;

            this._renderTextureReused = false;

            this._resultTextureSource = null;

            this._renderOffscreen = false;

            this.empty = false;
        }

        get enabled() {
            return this._enabled;
        }

        set enabled(v) {
            this._enabled = v;
            this._core.updateRenderToTextureEnabled();
        }

        get renderOffscreen() {
            return this._renderOffscreen;
        }

        set renderOffscreen(v) {
            this._renderOffscreen = v;
            this._core.setHasRenderUpdates(1);

            // This enforces rechecking the 'within bounds'.
            this._core._setRecalc(6);
        }

        get colorize() {
            return this._colorize;
        }

        set colorize(v) {
            if (this._colorize !== v) {
                this._colorize = v;

                // Only affects the finally drawn quad.
                this._core.setHasRenderUpdates(1);
            }
        }

        _getTextureSource() {
            if (!this._resultTextureSource) {
                this._resultTextureSource = new TextureSource(this._view.stage.textureManager);
                this.updateResultTexture();
            }
            return this._resultTextureSource;
        }

        hasResultTexture() {
            return !!this._resultTextureSource;
        }

        resultTextureInUse() {
            return this._resultTextureSource && this._resultTextureSource.hasEnabledViews();
        }

        updateResultTexture() {
            let resultTexture = this.getResultTexture();
            if (this._resultTextureSource) {
                if (this._resultTextureSource.nativeTexture !== resultTexture) {
                    let w = resultTexture ? resultTexture.w : 0;
                    let h = resultTexture ? resultTexture.h : 0;
                    this._resultTextureSource.replaceNativeTexture(resultTexture, w, h);
                }

                // Texture will be updated: all views using the source need to be updated as well.
                this._resultTextureSource.forEachEnabledView(view => {
                    view._updateDimensions();
                    view.core.setHasRenderUpdates(3);
                });
            }
        }

        mustRenderToTexture() {
            // Check if we must really render as texture.
            if (this._enabled && !this.lazy) {
                return true;
            } else if (this._enabled && this.lazy && this._core._hasRenderUpdates < 3) {
                // Static-only: if renderToTexture did not need to update during last drawn frame, generate it as a cache.
                return true;
            }
            return false;
        }

        deactivate() {
            this.release();
        }

        get renderTextureReused() {
            return this._renderTextureReused;
        }

        release() {
            this.releaseRenderTexture();
        }

        releaseRenderTexture() {
            if (this._renderTexture) {
                if (!this._renderTextureReused) {
                    this.ctx.releaseRenderTexture(this._renderTexture);
                }
                this._renderTexture = null;
                this._renderTextureReused = false;
                this.updateResultTexture();
            }
        }

        // Reuses the specified texture as the render texture (in ancestor).
        reuseTextureAsRenderTexture(nativeTexture) {
            if (this._renderTexture !== nativeTexture) {
                this.releaseRenderTexture();
                this._renderTexture = nativeTexture;
                this._renderTextureReused = true;
            }
        }

        hasRenderTexture() {
            return !!this._renderTexture;
        }

        getRenderTexture() {
            if (!this._renderTexture) {
                this._renderTexture = this.ctx.allocateRenderTexture(this._core._w, this._core._h);
                this._renderTextureReused = false;
            }
            return this._renderTexture;
        }

        getResultTexture() {
            return this._renderTexture;
        }

    }

    class ViewCore {

        constructor(view) {
            this._view = view;

            this.ctx = view.stage.ctx;

            // The memory layout of the internal variables is affected by their position in the constructor.
            // It boosts performance to order them by usage of cpu-heavy functions (renderSimple and update).

            this._recalc = 0;

            this._parent = null;

            this._onUpdate = null;

            this._pRecalc = 0;

            this._worldContext = new ViewCoreContext();

            this._hasUpdates = false;

            this._localAlpha = 1;

            this._onAfterCalcs = null;

            this._onAfterUpdate = null;

            // All local translation/transform updates: directly propagated from x/y/w/h/scale/whatever.
            this._localPx = 0;
            this._localPy = 0;

            this._localTa = 1;
            this._localTb = 0;
            this._localTc = 0;
            this._localTd = 1;

            this._isComplex = false;

            this._dimsUnknown = false;

            this._clipping = false;

            // Used by both update and render.
            this._zSort = false;

            this._outOfBounds = 0;

            /**
             * The texture source to be displayed.
             * @type {TextureSource}
             */
            this._displayedTextureSource = null;

            this._zContextUsage = 0;

            this._children = null;

            this._hasRenderUpdates = 0;

            this._zIndexedChildren = null;

            this._renderContext = this._worldContext;

            this.renderState = this.ctx.renderState;

            this._scissor = null;

            // The ancestor ViewCore that owns the inherited shader. Null if none is active (default shader).
            this._shaderOwner = null;


            this._updateTreeOrder = 0;

            this._colorUl = this._colorUr = this._colorBl = this._colorBr = 0xFFFFFFFF;

            this._x = 0;
            this._y = 0;
            this._w = 0;
            this._h = 0;

            this._optFlags = 0;
            this._funcX = null;
            this._funcY = null;
            this._funcW = null;
            this._funcH = null;

            this._scaleX = 1;
            this._scaleY = 1;
            this._pivotX = 0.5;
            this._pivotY = 0.5;
            this._mountX = 0;
            this._mountY = 0;
            this._rotation = 0;

            this._alpha = 1;
            this._visible = true;

            this._ulx = 0;
            this._uly = 0;
            this._brx = 1;
            this._bry = 1;

            this._zIndex = 0;
            this._forceZIndexContext = false;
            this._zParent = null;

            this._isRoot = false;

            /**
             * Iff true, during zSort, this view should be 're-sorted' because either:
             * - zIndex did chang
             * - zParent did change
             * - view was moved in the render tree
             * @type {boolean}
             */
            this._zIndexResort = false;

            this._shader = null;

            // View is rendered on another texture.
            this._renderToTextureEnabled = false;

            this._texturizer = null;

            this._useRenderToTexture = false;

            this._boundsMargin = null;

            this._recBoundsMargin = null;

            this._withinBoundsMargin = false;

            this._viewport = null;

            this._clipbox = true;

            this.render = this._renderSimple;

            this._layout = null;
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
                this._updateLocalTranslateDelta(v - this._x, 0);
                this._x = v;
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
                    this.layout.forceLayout();
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
                this._updateLocalTranslateDelta(0, v - this._y);
                this._y = v;
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
                    this.layout.forceLayout();
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

        get w() {
            return this._w;
        }

        getRenderWidth() {
            if (this.hasFlexLayout()) {
                return this._layout.originalWidth;
            } else {
                return this._w;
            }
        }

        get h() {
            return this._h;
        }

        getRenderHeight() {
            if (this.hasFlexLayout()) {
                return this._layout.originalHeight;
            } else {
                return this._h;
            }
        }

        get scaleX() {
            return this._scaleX;
        }

        set scaleX(v) {
            if (this._scaleX !== v) {
                this._scaleX = v;
                this._updateLocalTransform();
            }
        }

        get scaleY() {
            return this._scaleY;
        }

        set scaleY(v) {
            if (this._scaleY !== v) {
                this._scaleY = v;
                this._updateLocalTransform();
            }
        }

        get scale() {
            return this.scaleX;
        }

        set scale(v) {
            if (this._scaleX !== v || this._scaleY !== v) {
                this._scaleX = v;
                this._scaleY = v;
                this._updateLocalTransform();
            }
        }

        get pivotX() {
            return this._pivotX;
        }

        set pivotX(v) {
            if (this._pivotX !== v) {
                this._pivotX = v;
                this._updateLocalTranslate();
            }
        }

        get pivotY() {
            return this._pivotY;
        }

        set pivotY(v) {
            if (this._pivotY !== v) {
                this._pivotY = v;
                this._updateLocalTranslate();
            }
        }

        get pivot() {
            return this._pivotX;
        }

        set pivot(v) {
            if (this._pivotX !== v || this._pivotY !== v) {
                this._pivotX = v;
                this._pivotY = v;
                this._updateLocalTranslate();
            }
        }

        get mountX() {
            return this._mountX;
        }

        set mountX(v) {
            if (this._mountX !== v) {
                this._mountX = v;
                this._updateLocalTranslate();
            }
        }

        get mountY() {
            return this._mountY;
        }

        set mountY(v) {
            if (this._mountY !== v) {
                this._mountY = v;
                this._updateLocalTranslate();
            }
        }

        get mount() {
            return this._mountX;
        }

        set mount(v) {
            if (this._mountX !== v || this._mountY !== v) {
                this._mountX = v;
                this._mountY = v;
                this._updateLocalTranslate();
            }
        }

        get rotation() {
            return this._rotation;
        }

        set rotation(v) {
            if (this._rotation !== v) {
                this._rotation = v;
                this._updateLocalTransform();
            }
        }

        get alpha() {
            return this._alpha;
        }

        set alpha(v) {
            // Account for rounding errors.
            v = (v > 1 ? 1 : (v < 1e-14 ? 0 : v));
            if (this._alpha !== v) {
                let prev = this._alpha;
                this._alpha = v;
                this._updateLocalAlpha();
                if ((prev === 0) !== (v === 0)) {
                    this._view._updateEnabledFlag();
                }
            }
        }

        get visible() {
            return this._visible;
        }

        set visible(v) {
            if (this._visible !== v) {
                this._visible = v;
                this._updateLocalAlpha();
                this._view._updateEnabledFlag();

                if (this.hasFlexLayout()) {
                    this.layout.setVisible(v);
                }
            }
        }

        _updateLocalTransform() {
            if (this._rotation !== 0 && this._rotation % (2 * Math.PI)) {
                // check to see if the rotation is the same as the previous render. This means we only need to use sin and cos when rotation actually changes
                let _sr = Math.sin(this._rotation);
                let _cr = Math.cos(this._rotation);

                this._setLocalTransform(
                    _cr * this._scaleX,
                    -_sr * this._scaleY,
                    _sr * this._scaleX,
                    _cr * this._scaleY
                );
            } else {
                this._setLocalTransform(
                    this._scaleX,
                    0,
                    0,
                    this._scaleY
                );
            }
            this._updateLocalTranslate();
        };

        _updateLocalTranslate() {
            this._recalcLocalTranslate();
            this._triggerRecalcTranslate();
        };

        _recalcLocalTranslate() {
            let pivotXMul = this._pivotX * this._w;
            let pivotYMul = this._pivotY * this._h;
            let px = this._x - (pivotXMul * this._localTa + pivotYMul * this._localTb) + pivotXMul;
            let py = this._y - (pivotXMul * this._localTc + pivotYMul * this._localTd) + pivotYMul;
            px -= this._mountX * this._w;
            py -= this._mountY * this._h;
            this._localPx = px;
            this._localPy = py;
        }

        _updateLocalTranslateDelta(dx, dy) {
            this._addLocalTranslate(dx, dy);
        };

        _updateLocalAlpha() {
            this._setLocalAlpha(this._visible ? this._alpha : 0);
        };

        /**
         * @param {number} type
         * 0: no updates
         * 1: re-invoke shader
         * 3: re-create render texture and re-invoke shader
         */
        setHasRenderUpdates(type) {
            if (this._worldContext.alpha) {
                // Ignore if 'world invisible'. Render updates will be reset to 3 for every view that becomes visible.
                let p = this;
                p._hasRenderUpdates = Math.max(type, p._hasRenderUpdates);
                while ((p = p._parent) && (p._hasRenderUpdates !== 3)) {
                    p._hasRenderUpdates = 3;
                }
            }
        }

        /**
         * @param {Number} type
         *   1: alpha
         *   2: translate
         *   4: transform
         * 128: becomes visible
         * 256: flex layout updated
         */
        _setRecalc(type) {
            this._recalc |= type;

            this._setHasUpdates();

            // Any changes in descendants should trigger texture updates.
            if (this._parent) {
                this._parent.setHasRenderUpdates(3);
            }
        }

        _setHasUpdates() {
            let p = this;
            while(p && !p._hasUpdates) {
                p._hasUpdates = true;
                p = p._parent;
            }
        }

        getParent() {
            return this._parent;
        }

        setParent(parent) {
            if (parent !== this._parent) {
                let prevIsZContext = this.isZContext();
                let prevParent = this._parent;
                this._parent = parent;

                // Notify flex layout engine.
                if (this._layout || (parent && parent.isFlexContainer())) {
                    this.layout.setParent(prevParent, parent);
                }

                if (prevParent) {
                    // When views are deleted, the render texture must be re-rendered.
                    prevParent.setHasRenderUpdates(3);
                }

                this._setRecalc(1 + 2 + 4);

                if (this._parent) {
                    // Force parent to propagate hasUpdates flag.
                    this._parent._setHasUpdates();
                }

                if (this._zIndex === 0) {
                    this.setZParent(parent);
                } else {
                    this.setZParent(parent ? parent.findZContext() : null);
                }

                if (prevIsZContext !== this.isZContext()) {
                    if (!this.isZContext()) {
                        this.disableZContext();
                    } else {
                        this.enableZContext(prevParent.findZContext());
                    }
                }

                // Tree order did change: even if zParent stays the same, we must resort.
                this._zIndexResort = true;
                if (this._zParent) {
                    this._zParent.enableZSort();
                }

                if (!this._shader) {
                    let newShaderOwner = parent && !parent._renderToTextureEnabled ? parent._shaderOwner : null;
                    if (newShaderOwner !== this._shaderOwner) {
                        this.setHasRenderUpdates(1);
                        this._setShaderOwnerRecursive(newShaderOwner);
                    }
                }
            }
        };

        enableZSort(force = false) {
            if (!this._zSort && this._zContextUsage > 0) {
                this._zSort = true;
                if (force) {
                    // ZSort must be done, even if this view is invisible.
                    // This is done to prevent memory leaks when removing views from inactive render branches.
                    this.ctx.forceZSort(this);
                }
            }
        }

        addChildAt(index, child) {
            if (!this._children) this._children = [];
            this._children.splice(index, 0, child);
            child.setParent(this);
        };

        setChildAt(index, child) {
            if (!this._children) this._children = [];
            this._children[index].setParent(null);
            this._children[index] = child;
            child.setParent(this);
        }

        removeChildAt(index) {
            let child = this._children[index];
            this._children.splice(index, 1);
            child.setParent(null);
        };

        removeChildren() {
            if (this._children) {
                for (let i = 0, n = this._children.length; i < n; i++) {
                    this._children[i].setParent(null);
                }

                this._children.splice(0);

                if (this._zIndexedChildren) {
                    this._zIndexedChildren.splice(0);
                }
            }
        };

        syncChildren(removed, added, order) {
            this._children = order;
            for (let i = 0, n = removed.length; i < n; i++) {
                removed[i].setParent(null);
            }
            for (let i = 0, n = added.length; i < n; i++) {
                added[i].setParent(this);
            }
        }

        moveChild(fromIndex, toIndex) {
            let c = this._children[fromIndex];
            this._children.splice(fromIndex, 1);
            this._children.splice(toIndex, 0, c);

            // Tree order changed: must resort!;
            this._zIndexResort = true;
            if (this._zParent) {
                this._zParent.enableZSort();
            }
        }

        _setLocalTransform(a, b, c, d) {
            this._setRecalc(4);
            this._localTa = a;
            this._localTb = b;
            this._localTc = c;
            this._localTd = d;
            
            // We also regard negative scaling as a complex case, so that we can optimize the non-complex case better.
            this._isComplex = (b !== 0) || (c !== 0) || (a < 0) || (d < 0);
        };

        _addLocalTranslate(dx, dy) {
            this._localPx += dx;
            this._localPy += dy;
            this._triggerRecalcTranslate();
        }

        _setLocalAlpha(a) {
            if (!this._worldContext.alpha && ((this._parent && this._parent._worldContext.alpha) && a)) {
                // View is becoming visible. We need to force update.
                this._setRecalc(1 + 128);
            } else {
                this._setRecalc(1);
            }

            if (a < 1e-14) {
                // Tiny rounding errors may cause failing visibility tests.
                a = 0;
            }

            this._localAlpha = a;
        };

        setDimensions(w, h, isEstimate) {
            // In case of an estimation, the update loop should perform different bound checks.
            this._dimsUnknown = isEstimate;

            if (this.hasFlexLayout()) {
                this._layout.originalWidth = w;
                this._layout.originalHeight = h;
            } else {
                if (this._w !== w || this._h !== h) {
                    this._updateDimensions(w, h);
                    return true;
                }
            }
            return false;
        };

        _updateDimensions(w, h) {
            if (this._w !== w || this._h !== h) {
                this._w = w;
                this._h = h;

                this._triggerRecalcTranslate();

                if (this._texturizer) {
                    this._texturizer.releaseRenderTexture();
                    this._texturizer.updateResultTexture();
                }
                // Due to width/height change: update the translation vector.
                this._updateLocalTranslate();
            }
        }

        setTextureCoords(ulx, uly, brx, bry) {
            this.setHasRenderUpdates(3);

            this._ulx = ulx;
            this._uly = uly;
            this._brx = brx;
            this._bry = bry;
        };

        get displayedTextureSource() {
            return this._displayedTextureSource;
        }

        setDisplayedTextureSource(textureSource) {
            this.setHasRenderUpdates(3);
            this._displayedTextureSource = textureSource;
        };

        get isRoot() {
            return this._isRoot;
        }

        setAsRoot() {
            // Use parent dummy.
            this._parent = new ViewCore(this._view);

            // After setting root, make sure it's updated.
            this._parent._hasRenderUpdates = 3;
            this._parent._hasUpdates = true;

            // Root is, and will always be, the primary zContext.
            this._isRoot = true;

            this.ctx.root = this;

            // Set scissor area of 'fake parent' to stage's viewport.
            this._parent._viewport = [0, 0, this.ctx.stage.coordsWidth, this.ctx.stage.coordsHeight];
            this._parent._scissor = this._parent._viewport;

            // When recBoundsMargin is null, the defaults are used (100 for all sides).
            this._parent._recBoundsMargin = null;

            this._setRecalc(1 + 2 + 4);
        };

        isAncestorOf(c) {
            let p = c;
            while (p = p._parent) {
                if (this === p) {
                    return true;
                }
            }
            return false;
        };

        isZContext() {
            return (this._forceZIndexContext || this._renderToTextureEnabled || this._zIndex !== 0 || this._isRoot || !this._parent);
        };

        findZContext() {
            if (this.isZContext()) {
                return this;
            } else {
                return this._parent.findZContext();
            }
        };

        setZParent(newZParent) {
            if (this._zParent !== newZParent) {
                if (this._zParent !== null) {
                    if (this._zIndex !== 0) {
                        this._zParent.decZContextUsage();
                    }

                    // We must filter out this item upon the next resort.
                    this._zParent.enableZSort();
                }

                if (newZParent !== null) {
                    let hadZContextUsage = (newZParent._zContextUsage > 0);

                    // @pre: new parent's children array has already been modified.
                    if (this._zIndex !== 0) {
                        newZParent.incZContextUsage();
                    }

                    if (newZParent._zContextUsage > 0) {
                        if (!hadZContextUsage && (this._parent === newZParent)) ; else {
                            // Add new child to array.
                            newZParent._zIndexedChildren.push(this);
                        }

                        // Order should be checked.
                        newZParent.enableZSort();
                    }
                }

                this._zParent = newZParent;

                // Newly added view must be marked for resort.
                this._zIndexResort = true;
            }
        };

        incZContextUsage() {
            this._zContextUsage++;
            if (this._zContextUsage === 1) {
                if (!this._zIndexedChildren) {
                    this._zIndexedChildren = [];
                }
                if (this._children) {
                    // Copy.
                    for (let i = 0, n = this._children.length; i < n; i++) {
                        this._zIndexedChildren.push(this._children[i]);
                    }
                    // Initially, children are already sorted properly (tree order).
                    this._zSort = false;
                }
            }
        };

        decZContextUsage() {
            this._zContextUsage--;
            if (this._zContextUsage === 0) {
                this._zSort = false;
                this._zIndexedChildren.splice(0);
            }
        };

        get zIndex() {
            return this._zIndex;
        }

        set zIndex(zIndex) {
            if (this._zIndex !== zIndex) {
                this.setHasRenderUpdates(1);

                let newZParent = this._zParent;

                let prevIsZContext = this.isZContext();
                if (zIndex === 0 && this._zIndex !== 0) {
                    if (this._parent === this._zParent) {
                        if (this._zParent) {
                            this._zParent.decZContextUsage();
                        }
                    } else {
                        newZParent = this._parent;
                    }
                } else if (zIndex !== 0 && this._zIndex === 0) {
                    newZParent = this._parent ? this._parent.findZContext() : null;
                    if (newZParent === this._zParent) {
                        if (this._zParent) {
                            this._zParent.incZContextUsage();
                            this._zParent.enableZSort();
                        }
                    }
                } else if (zIndex !== this._zIndex) {
                    if (this._zParent && this._zParent._zContextUsage) {
                        this._zParent.enableZSort();
                    }
                }

                if (newZParent !== this._zParent) {
                    this.setZParent(null);
                }

                this._zIndex = zIndex;

                if (newZParent !== this._zParent) {
                    this.setZParent(newZParent);
                }

                if (prevIsZContext !== this.isZContext()) {
                    if (!this.isZContext()) {
                        this.disableZContext();
                    } else {
                        this.enableZContext(this._parent.findZContext());
                    }
                }

                // Make sure that resort is done.
                this._zIndexResort = true;
                if (this._zParent) {
                    this._zParent.enableZSort();
                }
            }
        };

        get forceZIndexContext() {
            return this._forceZIndexContext;
        }

        set forceZIndexContext(v) {
            this.setHasRenderUpdates(1);

            let prevIsZContext = this.isZContext();
            this._forceZIndexContext = v;

            if (prevIsZContext !== this.isZContext()) {
                if (!this.isZContext()) {
                    this.disableZContext();
                } else {
                    this.enableZContext(this._parent.findZContext());
                }
            }
        };

        enableZContext(prevZContext) {
            if (prevZContext && prevZContext._zContextUsage > 0) {
                // Transfer from upper z context to this z context.
                const results = this._getZIndexedDescs();
                results.forEach((c) => {
                    if (this.isAncestorOf(c) && c._zIndex !== 0) {
                        c.setZParent(this);
                    }
                });
            }
        }

        _getZIndexedDescs() {
            const results = [];
            if (this._children) {
                for (let i = 0, n = this._children.length; i < n; i++) {
                    this._children[i]._getZIndexedDescsRec(results);
                }
            }
            return results;
        }

        _getZIndexedDescsRec(results) {
            if (this._zIndex) {
                results.push(this);
            } else if (this._children && !this.isZContext()) {
                for (let i = 0, n = this._children.length; i < n; i++) {
                    this._children[i]._getZIndexedDescsRec(results);
                }
            }
        }

        disableZContext() {
            // Transfer from this z context to upper z context.
            if (this._zContextUsage > 0) {
                let newZParent = this._parent.findZContext();

                // Make sure that z-indexed children are up to date (old ones removed).
                if (this._zSort) {
                    this.sortZIndexedChildren();
                }

                this._zIndexedChildren.slice().forEach(function (c) {
                    if (c._zIndex !== 0) {
                        c.setZParent(newZParent);
                    }
                });
            }
        };

        get colorUl() {
            return this._colorUl;
        }

        set colorUl(color) {
            if (this._colorUl !== color) {
                this.setHasRenderUpdates(this._displayedTextureSource ? 3 : 1);
                this._colorUl = color;
            }
        }

        get colorUr() {
            return this._colorUr;
        }

        set colorUr(color) {
            if (this._colorUr !== color) {
                this.setHasRenderUpdates(this._displayedTextureSource ? 3 : 1);
                this._colorUr = color;
            }
        };

        get colorBl() {
            return this._colorBl;
        }

        set colorBl(color) {
            if (this._colorBl !== color) {
                this.setHasRenderUpdates(this._displayedTextureSource ? 3 : 1);
                this._colorBl = color;
            }
        };

        get colorBr() {
            return this._colorBr;
        }

        set colorBr(color) {
            if (this._colorBr !== color) {
                this.setHasRenderUpdates(this._displayedTextureSource ? 3 : 1);
                this._colorBr = color;
            }
        };


        set onUpdate(f) {
            this._onUpdate = f;
            this._setRecalc(7);
        }

        set onAfterUpdate(f) {
            this._onAfterUpdate = f;
            this._setRecalc(7);
        }

        set onAfterCalcs(f) {
            this._onAfterCalcs = f;
            this._setRecalc(7);
        }

        get shader() {
            return this._shader;
        }

        set shader(v) {
            this.setHasRenderUpdates(1);

            let prevShader = this._shader;
            this._shader = v;
            if (!v && prevShader) {
                // Disabled shader.
                let newShaderOwner = (this._parent && !this._parent._renderToTextureEnabled ? this._parent._shaderOwner : null);
                this._setShaderOwnerRecursive(newShaderOwner);
            } else if (v) {
                // Enabled shader.
                this._setShaderOwnerRecursive(this);
            }
        }

        get activeShader() {
            return this._shaderOwner ? this._shaderOwner.shader : this.renderState.defaultShader;
        }

        get activeShaderOwner() {
            return this._shaderOwner;
        }

        get clipping() {
            return this._clipping;
        }

        set clipping(v) {
            if (this._clipping !== v) {
                this._clipping = v;

                // Force update of scissor by updating translate.
                // Alpha must also be updated because the scissor area may have been empty.
                this._setRecalc(1 + 2);
            }
        }

        get clipbox() {
            return this._clipbox;
        }

        set clipbox(v) {
            // In case of out-of-bounds view, all children will also be ignored.
            // It will save us from executing the update/render loops for those.
            // The optimization will be used immediately during the next frame.
            this._clipbox = v;
        }

        _setShaderOwnerRecursive(viewCore) {
            this._shaderOwner = viewCore;

            if (this._children && !this._renderToTextureEnabled) {
                for (let i = 0, n = this._children.length; i < n; i++) {
                    let c = this._children[i];
                    if (!c._shader) {
                        c._setShaderOwnerRecursive(viewCore);
                        c._hasRenderUpdates = 3;
                    }
                }
            }
        };

        _setShaderOwnerChildrenRecursive(viewCore) {
            if (this._children) {
                for (let i = 0, n = this._children.length; i < n; i++) {
                    let c = this._children[i];
                    if (!c._shader) {
                        c._setShaderOwnerRecursive(viewCore);
                        c._hasRenderUpdates = 3;
                    }
                }
            }
        };

        _hasRenderContext() {
            return this._renderContext !== this._worldContext;
        }

        get renderContext() {
            return this._renderContext;
        }

        updateRenderToTextureEnabled() {
            // Enforce texturizer initialisation.
            let v = this.texturizer._enabled;

            if (v) {
                this._enableRenderToTexture();
            } else {
                this._disableRenderToTexture();
                this._texturizer.releaseRenderTexture();
            }
        }

        _enableRenderToTexture() {
            if (!this._renderToTextureEnabled) {
                let prevIsZContext = this.isZContext();

                this._renderToTextureEnabled = true;

                this._renderContext = new ViewCoreContext();

                // If render to texture is active, a new shader context is started.
                this._setShaderOwnerChildrenRecursive(null);

                if (!prevIsZContext) {
                    // Render context forces z context.
                    this.enableZContext(this._parent ? this._parent.findZContext() : null);
                }

                this.setHasRenderUpdates(3);

                // Make sure that the render coordinates get updated.
                this._setRecalc(7);

                this.render = this._renderAdvanced;
            }
        }

        _disableRenderToTexture() {
            if (this._renderToTextureEnabled) {
                this._renderToTextureEnabled = false;

                this._setShaderOwnerChildrenRecursive(this._shaderOwner);

                this._renderContext = this._worldContext;

                if (!this.isZContext()) {
                    this.disableZContext();
                }

                // Make sure that the render coordinates get updated.
                this._setRecalc(7);

                this.setHasRenderUpdates(3);

                this.render = this._renderSimple;
            }
        }

        isWhite() {
            return (this._colorUl === 0xFFFFFFFF) && (this._colorUr === 0xFFFFFFFF) && (this._colorBl === 0xFFFFFFFF) && (this._colorBr === 0xFFFFFFFF);
        }

        hasSimpleTexCoords() {
            return (this._ulx === 0) && (this._uly === 0) && (this._brx === 1) && (this._bry === 1);
        }

        _stashTexCoords() {
            this._stashedTexCoords = [this._ulx, this._uly, this._brx, this._bry];
            this._ulx = 0;
            this._uly = 0;
            this._brx = 1;
            this._bry = 1;
        }

        _unstashTexCoords() {
            this._ulx = this._stashedTexCoords[0];
            this._uly = this._stashedTexCoords[1];
            this._brx = this._stashedTexCoords[2];
            this._bry = this._stashedTexCoords[3];
            this._stashedTexCoords = null;
        }

        _stashColors() {
            this._stashedColors = [this._colorUl, this._colorUr, this._colorBr, this._colorBl];
            this._colorUl = 0xFFFFFFFF;
            this._colorUr = 0xFFFFFFFF;
            this._colorBr = 0xFFFFFFFF;
            this._colorBl = 0xFFFFFFFF;
        }

        _unstashColors() {
            this._colorUl = this._stashedColors[0];
            this._colorUr = this._stashedColors[1];
            this._colorBr = this._stashedColors[2];
            this._colorBl = this._stashedColors[3];
            this._stashedColors = null;
        }

        isVisible() {
            return (this._localAlpha > 1e-14);
        };

        get outOfBounds() {
            return this._outOfBounds;
        }

        set boundsMargin(v) {

            /**
             *  null: inherit from parent.
             *  number[4]: specific margins: left, top, right, bottom.
             */
            this._boundsMargin = v ? v.slice() : null;

            // We force recalc in order to set all boundsMargin recursively during the next update.
            this._triggerRecalcTranslate();
        }

        get boundsMargin() {
            return this._boundsMargin;
        }

        update() {
            this._recalc |= this._parent._pRecalc;

            if (this._onUpdate) {
                // Block all 'upwards' updates when changing things in this branch.
                this._hasUpdates = true;
                this._onUpdate(this.view, this);
            }

            const pw = this._parent._worldContext;
            let w = this._worldContext;
            const visible = (pw.alpha && this._localAlpha);

            if (this._layout && this._layout.isEnabled()) {
                if (this._recalc & 256) {
                    this._layout.layoutFlexTree();
                }
            } else if ((this._recalc & 2) && this._optFlags) {
                this._applyRelativeDimFuncs();
            }

            /**
             * We must update if:
             * - branch contains updates (even when invisible because it may contain z-indexed descendants)
             * - there are (inherited) updates and this branch is visible
             * - this branch becomes invisible (descs may be z-indexed so we must update all alpha values)
             */
            if (this._hasUpdates || (this._recalc && visible) || (w.alpha && !visible)) {
                let recalc = this._recalc;

                // Update world coords/alpha.
                if (recalc & 1) {
                    if (!w.alpha && visible) {
                        // Becomes visible.
                        this._hasRenderUpdates = 3;
                    }
                    w.alpha = pw.alpha * this._localAlpha;

                    if (w.alpha < 1e-14) {
                        // Tiny rounding errors may cause failing visibility tests.
                        w.alpha = 0;
                    }
                }

                if (recalc & 6) {
                    w.px = pw.px + this._localPx * pw.ta;
                    w.py = pw.py + this._localPy * pw.td;
                    if (pw.tb !== 0) w.px += this._localPy * pw.tb;
                    if (pw.tc !== 0) w.py += this._localPx * pw.tc;
                }

                if (recalc & 4) {
                    w.ta = this._localTa * pw.ta;
                    w.tb = this._localTd * pw.tb;
                    w.tc = this._localTa * pw.tc;
                    w.td = this._localTd * pw.td;

                    if (this._isComplex) {
                        w.ta += this._localTc * pw.tb;
                        w.tb += this._localTb * pw.ta;
                        w.tc += this._localTc * pw.td;
                        w.td += this._localTb * pw.tc;
                    }
                }

                // Update render coords/alpha.
                const pr = this._parent._renderContext;
                if (this._parent._hasRenderContext()) {
                    const init = this._renderContext === this._worldContext;
                    if (init) {
                        // First render context build: make sure that it is fully initialized correctly.
                        // Otherwise, if we get into bounds later, the render context would not be initialized correctly.
                        this._renderContext = new ViewCoreContext();
                    }

                    const r = this._renderContext;

                    // Update world coords/alpha.
                    if (init || (recalc & 1)) {
                        r.alpha = pr.alpha * this._localAlpha;

                        if (r.alpha < 1e-14) {
                            r.alpha = 0;
                        }
                    }

                    if (init || (recalc & 6)) {
                        r.px = pr.px + this._localPx * pr.ta;
                        r.py = pr.py + this._localPy * pr.td;
                        if (pr.tb !== 0) r.px += this._localPy * pr.tb;
                        if (pr.tc !== 0) r.py += this._localPx * pr.tc;
                    }

                    if (init) {
                        // We set the recalc toggle, because we must make sure that the scissor is updated.
                        recalc |= 2;
                    }

                    if (init || (recalc & 4)) {
                        r.ta = this._localTa * pr.ta;
                        r.tb = this._localTd * pr.tb;
                        r.tc = this._localTa * pr.tc;
                        r.td = this._localTd * pr.td;

                        if (this._isComplex) {
                            r.ta += this._localTc * pr.tb;
                            r.tb += this._localTb * pr.ta;
                            r.tc += this._localTc * pr.td;
                            r.td += this._localTb * pr.tc;
                        }
                    }
                } else {
                    this._renderContext = this._worldContext;
                }

                if (this.ctx.updateTreeOrder === -1) {
                    this.ctx.updateTreeOrder = this._updateTreeOrder + 1;
                } else {
                    this._updateTreeOrder = this.ctx.updateTreeOrder++;
                }

                // Determine whether we must use a 'renderTexture'.
                const useRenderToTexture = this._renderToTextureEnabled && this._texturizer.mustRenderToTexture();
                if (this._useRenderToTexture !== useRenderToTexture) {
                    // Coords must be changed.
                    this._recalc |= 2 + 4;

                    // Scissor may change: force update.
                    recalc |= 2;

                    if (!this._useRenderToTexture) {
                        // We must release the texture.
                        this._texturizer.release();
                    }
                }
                this._useRenderToTexture = useRenderToTexture;

                const r = this._renderContext;
                
                const bboxW = this._dimsUnknown ? 2048 : this._w;
                const bboxH = this._dimsUnknown ? 2048 : this._h;
                
                // Calculate a bbox for this view.
                let sx, sy, ex, ey;
                const rComplex = (r.tb !== 0) || (r.tc !== 0) || (r.ta < 0) || (r.td < 0);
                if (rComplex) {
                    sx = Math.min(0, bboxW * r.ta, bboxW * r.ta + bboxH * r.tb, bboxH * r.tb) + r.px;
                    ex = Math.max(0, bboxW * r.ta, bboxW * r.ta + bboxH * r.tb, bboxH * r.tb) + r.px;
                    sy = Math.min(0, bboxW * r.tc, bboxW * r.tc + bboxH * r.td, bboxH * r.td) + r.py;
                    ey = Math.max(0, bboxW * r.tc, bboxW * r.tc + bboxH * r.td, bboxH * r.td) + r.py;
                } else {
                    sx = r.px;
                    ex = r.px + r.ta * bboxW;
                    sy = r.py;
                    ey = r.py + r.td * bboxH;
                }

                if (this._dimsUnknown && (rComplex || this._localTa < 1 || this._localTb < 1)) {
                    // If we are dealing with a non-identity matrix, we must extend the bbox so that withinBounds and
                    //  scissors will include the complete range of (positive) dimensions up to ,lh.
                    const nx = this._x * pr.ta + this._y * pr.tb + pr.px;
                    const ny = this._x * pr.tc + this._y * pr.td + pr.py;
                    if (nx < sx) sx = nx;
                    if (ny < sy) sy = ny;
                    if (nx > ex) ex = nx;
                    if (ny > ey) ey = ny;
                }

                if (recalc & 6 || !this._scissor /* initial */) {
                    // Determine whether we must 'clip'.
                    if (this._clipping && r.isSquare()) {
                        // If the parent renders to a texture, it's scissor should be ignored;
                        const area = this._parent._useRenderToTexture ? this._parent._viewport : this._parent._scissor;
                        if (area) {
                            // Merge scissor areas.
                            const lx = Math.max(area[0], sx);
                            const ly = Math.max(area[1], sy);
                            this._scissor = [
                                lx,
                                ly,
                                Math.min(area[2] + area[0], ex) - lx,
                                Math.min(area[3] + area[1], ey) - ly
                            ];
                        } else {
                            this._scissor = [sx, sy, ex - sx, ey - sy];
                        }
                    } else {
                        // No clipping: reuse parent scissor.
                        this._scissor = this._parent._useRenderToTexture ? this._parent._viewport : this._parent._scissor;
                    }
                }

                // Calculate the outOfBounds margin.
                if (this._boundsMargin) {
                    this._recBoundsMargin = this._boundsMargin;
                } else {
                    this._recBoundsMargin = this._parent._recBoundsMargin;
                }

                if (this._onAfterCalcs) {
                    // After calcs may change render coords, scissor and/or recBoundsMargin.
                    if (this._onAfterCalcs(this.view)) {
                        // Recalculate bbox.
                        if (rComplex) {
                            sx = Math.min(0, bboxW * r.ta, bboxW * r.ta + bboxH * r.tb, bboxH * r.tb) + r.px;
                            ex = Math.max(0, bboxW * r.ta, bboxW * r.ta + bboxH * r.tb, bboxH * r.tb) + r.px;
                            sy = Math.min(0, bboxW * r.tc, bboxW * r.tc + bboxH * r.td, bboxH * r.td) + r.py;
                            ey = Math.max(0, bboxW * r.tc, bboxW * r.tc + bboxH * r.td, bboxH * r.td) + r.py;
                        } else {
                            sx = r.px;
                            ex = r.px + r.ta * bboxW;
                            sy = r.py;
                            ey = r.py + r.td * bboxH;
                        }

                        if (this._dimsUnknown && (rComplex || this._localTa < 1 || this._localTb < 1)) {
                            const nx = this._x * pr.ta + this._y * pr.tb + pr.px;
                            const ny = this._x * pr.tc + this._y * pr.td + pr.py;
                            if (nx < sx) sx = nx;
                            if (ny < sy) sy = ny;
                            if (nx > ex) ex = nx;
                            if (ny > ey) ey = ny;
                        }
                    }
                }

                if (this._parent._outOfBounds === 2) {
                    // Inherit parent out of boundsness.
                    this._outOfBounds = 2;

                    if (this._withinBoundsMargin) {
                        this._withinBoundsMargin = false;
                        this.view._disableWithinBoundsMargin();
                    }
                } else {
                    if (recalc & 6) {
                        // Recheck if view is out-of-bounds (all settings that affect this should enable recalc bit 2 or 4).
                        this._outOfBounds = 0;
                        let withinMargin = true;

                        // Offscreens are always rendered as long as the parent is within bounds.
                        if (!this._renderToTextureEnabled || !this._texturizer || !this._texturizer.renderOffscreen) {
                            if (this._scissor && (this._scissor[2] <= 0 || this._scissor[3] <= 0)) {
                                // Empty scissor area.
                                this._outOfBounds = 2;
                            } else {
                                // Use bbox to check out-of-boundness.
                                if ((this._scissor[0] > ex) ||
                                    (this._scissor[1] > ey) ||
                                    (sx > (this._scissor[0] + this._scissor[2])) ||
                                    (sy > (this._scissor[1] + this._scissor[3]))
                                ) {
                                    this._outOfBounds = 1;
                                }

                                if (this._outOfBounds) {
                                    if (this._clipping || this._useRenderToTexture || (this._clipbox && (bboxW && bboxH))) {
                                        this._outOfBounds = 2;
                                    }
                                }
                            }

                            withinMargin = (this._outOfBounds === 0);
                            if (!withinMargin) {
                                // Re-test, now with margins.
                                if (this._recBoundsMargin) {
                                    withinMargin = !((ex < this._scissor[0] - this._recBoundsMargin[2]) ||
                                        (ey < this._scissor[1] - this._recBoundsMargin[3]) ||
                                        (sx > this._scissor[0] + this._scissor[2] + this._recBoundsMargin[0]) ||
                                        (sy > this._scissor[1] + this._scissor[3] + this._recBoundsMargin[1]));
                                } else {
                                    withinMargin = !((ex < this._scissor[0] - 100) ||
                                        (ey < this._scissor[1] - 100) ||
                                        (sx > this._scissor[0] + this._scissor[2] + 100) ||
                                        (sy > this._scissor[1] + this._scissor[3] + 100));
                                }
                                if (withinMargin && this._outOfBounds === 2) {
                                    // Children must be visited because they may contain views that are within margin, so must be visible.
                                    this._outOfBounds = 1;
                                }
                            }
                        }

                        if (this._withinBoundsMargin !== withinMargin) {
                            this._withinBoundsMargin = withinMargin;

                            if (this._withinBoundsMargin) {
                                // This may update things (txLoaded events) in the view itself, but also in descendants and ancestors.

                                // Changes in ancestors should be executed during the next call of the stage update. But we must
                                // take care that the _recalc and _hasUpdates flags are properly registered. That's why we clear
                                // both before entering the children, and use _pRecalc to transfer inherited updates instead of
                                // _recalc directly.

                                // Changes in descendants are automatically executed within the current update loop, though we must
                                // take care to not update the hasUpdates flag unnecessarily in ancestors. We achieve this by making
                                // sure that the hasUpdates flag of this view is turned on, which blocks it for ancestors.
                                this._hasUpdates = true;

                                const recalc = this._recalc;
                                this._recalc = 0;
                                this.view._enableWithinBoundsMargin();

                                if (this._recalc) {
                                    // This view needs to be re-updated now, because we want the dimensions (and other changes) to be updated.
                                    return this.update();
                                }

                                this._recalc = recalc;
                            } else {
                                this.view._disableWithinBoundsMargin();
                            }
                        }
                    }
                }

                if (this._useRenderToTexture) {
                    // Set viewport necessary for children scissor calculation.
                    if (this._viewport) {
                        this._viewport[2] = bboxW;
                        this._viewport[3] = bboxH;
                    } else {
                        this._viewport = [0, 0, bboxW, bboxH];
                    }
                }

                // Filter out bits that should not be copied to the children (currently all are).
                this._pRecalc = (this._recalc & 135);

                // Clear flags so that future updates are properly detected.
                this._recalc = 0;
                this._hasUpdates = false;

                if (this._outOfBounds < 2) {
                    if (this._useRenderToTexture) {
                        if (this._worldContext.isIdentity()) {
                            // Optimization.
                            // The world context is already identity: use the world context as render context to prevents the
                            // ancestors from having to update the render context.
                            this._renderContext = this._worldContext;
                        } else {
                            // Temporarily replace the render coord attribs by the identity matrix.
                            // This allows the children to calculate the render context.
                            this._renderContext = ViewCoreContext.IDENTITY;
                        }
                    }

                    if (this._children) {
                        for (let i = 0, n = this._children.length; i < n; i++) {
                            this._children[i].update();
                        }
                    }

                    if (this._useRenderToTexture) {
                        this._renderContext = r;
                    }
                } else {
                    if (this._children) {
                        for (let i = 0, n = this._children.length; i < n; i++) {
                            if (this._children[i]._hasUpdates) {
                                this._children[i].update();
                            } else {
                                // Make sure we don't lose the 'inherited' updates.
                                this._children[i]._recalc |= this._pRecalc;
                                this._children[i].updateOutOfBounds();
                            }
                        }
                    }
                }

                if (this._onAfterUpdate) {
                    this._onAfterUpdate(this.view);
                }
            } else {
                if (this.ctx.updateTreeOrder === -1 || this._updateTreeOrder >= this.ctx.updateTreeOrder) {
                    // If new tree order does not interfere with the current (gaps allowed) there's no need to traverse the branch.
                    this.ctx.updateTreeOrder = -1;
                } else {
                    this.updateTreeOrder();
                }
            }
        }

        _applyRelativeDimFuncs() {
            if (this._optFlags & 1) {
                const x = this._funcX(this._parent.w);
                if (x !== this._x) {
                    this._localPx += (x - this._x);
                    this._x = x;
                }
            }
            if (this._optFlags & 2) {
                const y = this._funcY(this._parent.h);
                if (y !== this._y) {
                    this._localPy += (y - this._y);
                    this._y = y;
                }
            }

            let changedDims = false;
            if (this._optFlags & 4) {
                const w = this._funcW(this._parent.w);
                if (w !== this._w) {
                    this._w = w;
                    changedDims = true;
                }
            }
            if (this._optFlags & 8) {
                const h = this._funcH(this._parent.h);
                if (h !== this._h) {
                    this._h = h;
                    changedDims = true;
                }
            }

            if (changedDims) {
                // Recalc mount, scale position.
                this._recalcLocalTranslate();
            }
        }

        updateOutOfBounds() {
            // Propagate outOfBounds flag to descendants (necessary because of z-indexing).
            // Invisible views are not drawn anyway. When alpha is updated, so will _outOfBounds.
            if (this._outOfBounds !== 2 && this._renderContext.alpha > 0) {

                // Inherit parent out of boundsness.
                this._outOfBounds = 2;

                if (this._withinBoundsMargin) {
                    this._withinBoundsMargin = false;
                    this.view._disableWithinBoundsMargin();
                }

                if (this._children) {
                    for (let i = 0, n = this._children.length; i < n; i++) {
                        this._children[i].updateOutOfBounds();
                    }
                }
            }
        }

        updateTreeOrder() {
            if (this._localAlpha && (this._outOfBounds !== 2)) {
                this._updateTreeOrder = this.ctx.updateTreeOrder++;

                if (this._children) {
                    for (let i = 0, n = this._children.length; i < n; i++) {
                        this._children[i].updateTreeOrder();
                    }
                }
            }
        }

        _renderSimple() {
            this._hasRenderUpdates = 0;

            if (this._zSort) {
                this.sortZIndexedChildren();
            }

            if (this._outOfBounds < 2 && this._renderContext.alpha) {
                let renderState = this.renderState;

                if ((this._outOfBounds === 0) && this._displayedTextureSource) {
                    renderState.setShader(this.activeShader, this._shaderOwner);
                    renderState.setScissor(this._scissor);
                    this.renderState.addQuad(this);
                }

                // Also add children to the VBO.
                if (this._children) {
                    if (this._zContextUsage) {
                        for (let i = 0, n = this._zIndexedChildren.length; i < n; i++) {
                            this._zIndexedChildren[i].render();
                        }
                    } else {
                        for (let i = 0, n = this._children.length; i < n; i++) {
                            if (this._children[i]._zIndex === 0) {
                                // If zIndex is set, this item already belongs to a zIndexedChildren array in one of the ancestors.
                                this._children[i].render();
                            }

                        }
                    }
                }
            }
        }

        _renderAdvanced() {
            const hasRenderUpdates = this._hasRenderUpdates;

            // We must clear the hasRenderUpdates flag before rendering, because updating result textures in combination
            // with z-indexing may trigger render updates on a render branch that is 'half done'.
            // We need to ensure that the full render branch is marked for render updates, not only half (leading to freeze).
            this._hasRenderUpdates = 0;

            if (this._zSort) {
                this.sortZIndexedChildren();
            }

            if (this._outOfBounds < 2 && this._renderContext.alpha) {
                let renderState = this.renderState;

                let mustRenderChildren = true;
                let renderTextureInfo;
                let prevRenderTextureInfo;
                if (this._useRenderToTexture) {
                    if (this._w === 0 || this._h === 0) {
                        // Ignore this branch and don't draw anything.
                        return;
                    } else if (!this._texturizer.hasRenderTexture() || (hasRenderUpdates >= 3)) {
                        // Switch to default shader for building up the render texture.
                        renderState.setShader(renderState.defaultShader, this);

                        prevRenderTextureInfo = renderState.renderTextureInfo;

                        renderTextureInfo = {
                            nativeTexture: null,
                            offset: 0,  // Set by CoreRenderState.
                            w: this._w,
                            h: this._h,
                            empty: true,
                            cleared: false,
                            ignore: false,
                            cache: false
                        };

                        if (this._texturizer.hasResultTexture() || (!renderState.isCachingTexturizer && (hasRenderUpdates < 3))) {
                            /**
                             * We don't always cache render textures.
                             *
                             * The rule is, that caching for a specific render texture is only enabled if:
                             * - There is a result texture to be updated.
                             * - There were no render updates -within the contents- since last frame (ViewCore.hasRenderUpdates < 3)
                             * - AND there are no ancestors that are being cached during this frame (CoreRenderState.isCachingTexturizer)
                             *   If an ancestor is cached anyway, it's probably not necessary to keep deeper caches. If the top level is to
                             *   change while a lower one is not, that lower level will be cached instead.
                             *
                             * In case of the fast blur view, this prevents having to cache all blur levels and stages, saving a huge amount
                             * of GPU memory!
                             *
                             * Especially when using multiple stacked layers of the same dimensions that are RTT this will have a very
                             * noticable effect on performance as less render textures need to be allocated.
                             */
                            renderTextureInfo.cache = true;
                            renderState.isCachingTexturizer = true;
                        }

                        if (!this._texturizer.hasResultTexture()) {
                            // We can already release the current texture to the pool, as it will be rebuild anyway.
                            // In case of multiple layers of 'filtering', this may save us from having to create one
                            //  render-to-texture layer.
                            // Notice that we don't do this when there is a result texture, as any other view may rely on
                            //  that result texture being filled.
                            this._texturizer.releaseRenderTexture();
                        }

                        renderState.setRenderTextureInfo(renderTextureInfo);
                        renderState.setScissor(null);

                        if (this._displayedTextureSource) {
                            let r = this._renderContext;

                            // Use an identity context for drawing the displayed texture to the render texture.
                            this._renderContext = ViewCoreContext.IDENTITY;

                            // Add displayed texture source in local coordinates.
                            this.renderState.addQuad(this);

                            this._renderContext = r;
                        }
                    } else {
                        mustRenderChildren = false;
                    }
                } else {
                    if ((this._outOfBounds === 0) && this._displayedTextureSource) {
                        renderState.setShader(this.activeShader, this._shaderOwner);
                        renderState.setScissor(this._scissor);
                        this.renderState.addQuad(this);
                    }
                }

                // Also add children to the VBO.
                if (mustRenderChildren && this._children) {
                    if (this._zContextUsage) {
                        for (let i = 0, n = this._zIndexedChildren.length; i < n; i++) {
                            this._zIndexedChildren[i].render();
                        }
                    } else {
                        for (let i = 0, n = this._children.length; i < n; i++) {
                            if (this._children[i]._zIndex === 0) {
                                // If zIndex is set, this item already belongs to a zIndexedChildren array in one of the ancestors.
                                this._children[i].render();
                            }
                        }
                    }
                }

                if (this._useRenderToTexture) {
                    let updateResultTexture = false;
                    if (mustRenderChildren) {
                        // Finished refreshing renderTexture.
                        renderState.finishedRenderTexture();

                        // If nothing was rendered, we store a flag in the texturizer and prevent unnecessary
                        //  render-to-texture and filtering.
                        this._texturizer.empty = renderTextureInfo.empty;

                        if (renderTextureInfo.empty) {
                            // We ignore empty render textures and do not draw the final quad.

                            // The following cleans up memory and enforces that the result texture is also cleared.
                            this._texturizer.releaseRenderTexture();
                        } else if (renderTextureInfo.nativeTexture) {
                            // If nativeTexture is set, we can reuse that directly instead of creating a new render texture.
                            this._texturizer.reuseTextureAsRenderTexture(renderTextureInfo.nativeTexture);

                            renderTextureInfo.ignore = true;
                        } else {
                            if (this._texturizer.renderTextureReused) {
                                // Quad operations must be written to a render texture actually owned.
                                this._texturizer.releaseRenderTexture();
                            }
                            // Just create the render texture.
                            renderTextureInfo.nativeTexture = this._texturizer.getRenderTexture();
                        }

                        // Restore the parent's render texture.
                        renderState.setRenderTextureInfo(prevRenderTextureInfo);

                        updateResultTexture = true;
                    }

                    if (!this._texturizer.empty) {
                        let resultTexture = this._texturizer.getResultTexture();
                        if (updateResultTexture) {
                            if (resultTexture) {
                                // Logging the update frame can be handy for userland.
                                resultTexture.update = renderState.stage.frameCounter;
                            }
                            this._texturizer.updateResultTexture();
                        }

                        if (!this._texturizer.renderOffscreen) {
                            // Render result texture to the actual render target.
                            renderState.setShader(this.activeShader, this._shaderOwner);
                            renderState.setScissor(this._scissor);

                            // If no render texture info is set, the cache can be reused.
                            const cache = !renderTextureInfo || renderTextureInfo.cache;

                            renderState.setTexturizer(this._texturizer, cache);
                            this._stashTexCoords();
                            if (!this._texturizer.colorize) this._stashColors();
                            this.renderState.addQuad(this, true);
                            if (!this._texturizer.colorize) this._unstashColors();
                            this._unstashTexCoords();
                            renderState.setTexturizer(null);
                        }
                    }
                }

                if (renderTextureInfo && renderTextureInfo.cache) {
                    // Allow siblings to cache.
                    renderState.isCachingTexturizer = false;
                }
            }
        }

        get zSort() {
            return this._zSort;
        }

        sortZIndexedChildren() {
            /**
             * We want to avoid resorting everything. Instead, we do a single pass of the full array:
             * - filtering out views with a different zParent than this (were removed)
             * - filtering out, but also gathering (in a temporary array) the views that have zIndexResort flag
             * - then, finally, we merge-sort both the new array and the 'old' one
             * - view may have been added 'double', so when merge-sorting also check for doubles.
             * - if the old one is larger (in size) than it should be, splice off the end of the array.
             */

            const n = this._zIndexedChildren.length;
            let ptr = 0;
            const a = this._zIndexedChildren;

            // Notice that items may occur multiple times due to z-index changing.
            const b = [];
            for (let i = 0; i < n; i++) {
                if (a[i]._zParent === this) {
                    if (a[i]._zIndexResort) {
                        b.push(a[i]);
                    } else {
                        if (ptr !== i) {
                            a[ptr] = a[i];
                        }
                        ptr++;
                    }
                }
            }

            const m = b.length;
            if (m) {
                for (let j = 0; j < m; j++) {
                    b[j]._zIndexResort = false;
                }

                b.sort(ViewCore.sortZIndexedChildren);
                const n = ptr;
                if (!n) {
                    ptr = 0;
                    let j = 0;
                    do {
                        a[ptr++] = b[j++];
                    } while(j < m);

                    if (a.length > ptr) {
                        // Slice old (unnecessary) part off array.
                        a.splice(ptr);
                    }
                } else {
                    // Merge-sort arrays;
                    ptr = 0;
                    let i = 0;
                    let j = 0;
                    const mergeResult = [];
                    do {
                        const v = (a[i]._zIndex === b[j]._zIndex ? a[i]._updateTreeOrder - b[j]._updateTreeOrder : a[i]._zIndex - b[j]._zIndex);

                        const add = v > 0 ? b[j++] : a[i++];

                        if (ptr === 0 || (mergeResult[ptr - 1] !== add)) {
                            mergeResult[ptr++] = add;
                        }

                        if (i >= n) {
                            do {
                                const add = b[j++];
                                if (ptr === 0 || (mergeResult[ptr - 1] !== add)) {
                                    mergeResult[ptr++] = add;
                                }
                            } while(j < m);
                            break;
                        } else if (j >= m) {
                            do {
                                const add = a[i++];
                                if (ptr === 0 || (mergeResult[ptr - 1] !== add)) {
                                    mergeResult[ptr++] = add;
                                }
                            } while(i < n);
                            break;
                        }
                    } while(true);

                    this._zIndexedChildren = mergeResult;
                }
            } else {
                if (a.length > ptr) {
                    // Slice old (unnecessary) part off array.
                    a.splice(ptr);
                }
            }

            this._zSort = false;
        };

        get localTa() {
            return this._localTa;
        };

        get localTb() {
            return this._localTb;
        };

        get localTc() {
            return this._localTc;
        };

        get localTd() {
            return this._localTd;
        };

        get view() {
            return this._view;
        }

        get renderUpdates() {
            return this._hasRenderUpdates;
        }

        get texturizer() {
            if (!this._texturizer) {
                this._texturizer = new ViewTexturizer(this);
            }
            return this._texturizer;
        }

        getCornerPoints() {
            let w = this._worldContext;

            return [
                w.px,
                w.py,
                w.px + this._w * w.ta,
                w.py + this._w * w.tc,
                w.px + this._w * w.ta + this._h * w.tb,
                w.py + this._w * w.tc + this._h * w.td,
                w.px + this._h * w.tb,
                w.py + this._h * w.td
            ]
        };

        getRenderTextureCoords(relX, relY) {
            let r = this._renderContext;
            return [
                r.px + r.ta * relX + r.tb * relY,
                r.py + r.tc * relX + r.td * relY
            ]
        }

        getAbsoluteCoords(relX, relY) {
            let w = this._renderContext;
            return [
                w.px + w.ta * relX + w.tb * relY,
                w.py + w.tc * relX + w.td * relY
            ]
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

        setLayout(x, y, w, h) {
            this.x = x;
            this.y = y;
            this._updateDimensions(w, h);
        }

        triggerLayout() {
            this._setRecalc(256);
        }

        _triggerRecalcTranslate() {
            this._setRecalc(2);
        }

    }

    class ViewCoreContext {

        constructor() {
            this.alpha = 1;

            this.px = 0;
            this.py = 0;

            this.ta = 1;
            this.tb = 0;
            this.tc = 0;
            this.td = 1;
        }

        isIdentity() {
            return this.alpha === 1 &&
                this.px === 0 &&
                this.py === 0 &&
                this.ta === 1 &&
                this.tb === 0 &&
                this.tc === 0 &&
                this.td === 1;
        }

        isSquare() {
            return this.tb === 0 && this.tc === 0;
        }

    }

    ViewCoreContext.IDENTITY = new ViewCoreContext();
    ViewCore.sortZIndexedChildren = function(a,b) {
        return (a._zIndex === b._zIndex ? a._updateTreeOrder - b._updateTreeOrder : a._zIndex - b._zIndex);
    };

    /**
     * This is a partial (and more efficient) implementation of the event emitter.
     * It attempts to maintain a one-to-one mapping between events and listeners, skipping an array lookup.
     * Only if there are multiple listeners, they are combined in an array.
     */
    class EventEmitter {

        constructor() {
            // This is set (and kept) to true when events are used at all.
            this._hasEventListeners = false;
        }

        on(name, listener) {
            if (!this._hasEventListeners) {
                this._eventFunction = {};
                this._eventListeners = {};
                this._hasEventListeners = true;
            }

            const current = this._eventFunction[name];
            if (!current) {
                this._eventFunction[name] = listener;
            } else {
                if (this._eventFunction[name] !== EventEmitter.combiner) {
                    this._eventListeners[name] = [this._eventFunction[name], listener];
                    this._eventFunction[name] = EventEmitter.combiner;
                } else {
                    this._eventListeners[name].push(listener);
                }
            }
        }

        has(name, listener) {
            if (this._hasEventListeners) {
                const current = this._eventFunction[name];
                if (current) {
                    if (current === EventEmitter.combiner) {
                        const listeners = this._eventListeners[name];
                        let index = listeners.indexOf(listener);
                        return (index >= 0);
                    } else if (this._eventFunction[name] === listener) {
                        return true;
                    }
                }
            }
            return false;
        }

        off(name, listener) {
            if (this._hasEventListeners) {
                const current = this._eventFunction[name];
                if (current) {
                    if (current === EventEmitter.combiner) {
                        const listeners = this._eventListeners[name];
                        let index = listeners.indexOf(listener);
                        if (index >= 0) {
                            listeners.splice(index, 1);
                        }
                        if (listeners.length === 1) {
                            this._eventFunction[name] = listeners[0];
                            this._eventListeners[name] = undefined;
                        }
                    } else if (this._eventFunction[name] === listener) {
                        this._eventFunction[name] = undefined;
                    }
                }
            }
        }

        removeListener(name, listener) {
            this.off(name, listener);
        }

        emit(name, arg1, arg2, arg3) {
            if (this._hasEventListeners) {
                const func = this._eventFunction[name];
                if (func) {
                    if (func === EventEmitter.combiner) {
                        func(this, name, arg1, arg2, arg3);
                    } else {
                        func(arg1, arg2, arg3);
                    }
                }
            }
        }

        listenerCount(name) {
            if (this._hasEventListeners) {
                const func = this._eventFunction[name];
                if (func) {
                    if (func === EventEmitter.combiner) {
                        return this._eventListeners[name].length;
                    } else {
                        return 1;
                    }
                }
            } else {
                return 0;
            }
        }

        removeAllListeners(name) {
            if (this._hasEventListeners) {
                delete this._eventFunction[name];
                delete this._eventListeners[name];
            }
        }

    }

    EventEmitter.combiner = function(object, name, arg1, arg2, arg3) {
        const listeners = object._eventListeners[name];
        if (listeners) {
            // Because listener may detach itself while being invoked, we use a forEach instead of for loop.
            listeners.forEach((listener) => {
                listener(arg1, arg2, arg3);
            });
        }
    };

    EventEmitter.addAsMixin = function(cls) {
        cls.prototype.on = EventEmitter.prototype.on;
        cls.prototype.has = EventEmitter.prototype.has;
        cls.prototype.off = EventEmitter.prototype.off;
        cls.prototype.removeListener = EventEmitter.prototype.removeListener;
        cls.prototype.emit = EventEmitter.prototype.emit;
        cls.prototype.listenerCount = EventEmitter.prototype.listenerCount;
    };

    class Shader {

        constructor(coreContext) {
            this._initialized = false;

            this.ctx = coreContext;

            /**
             * The (enabled) views that use this shader.
             * @type {Set<ViewCore>}
             */
            this._views = new Set();
        }

        static create(stage, v) {
            let shader;
            if (Utils.isObjectLiteral(v)) {
                if (v.type) {
                    shader = stage.renderer.createShader(stage.ctx, v);
                } else {
                    shader = this.shader;
                }

                if (shader) {
                    stage.patchObject(shader, v);
                }
            } else if (v === null) {
                shader = stage.ctx.renderState.defaultShader;
            } else if (v === undefined) {
                shader = null;
            } else {
                if (v.isShader) {
                    if (!stage.renderer.isValidShaderType(v.constructor)) {
                        console.error("Invalid shader type");
                        v = null;
                    }
                    shader = v;
                } else {
                    console.error("Please specify a shader type.");
                    return;
                }
            }

            return shader;
        }

        static getWebGL() {
            return undefined;
        }

        static getC2d() {
            return undefined;
        }

        addView(viewCore) {
            this._views.add(viewCore);
        }

        removeView(viewCore) {
            this._views.delete(viewCore);
            if (!this._views) {
                this.cleanup();
            }
        }

        redraw() {
            this._views.forEach(viewCore => {
                viewCore.setHasRenderUpdates(2);
            });
        }

        patch(settings) {
            this.ctx.stage.patchObject(this, settings);
        }

        useDefault() {
            // Should return true if this shader is configured (using it's properties) to not have any effect.
            // This may allow the render engine to avoid unnecessary shader program switches or even texture copies.
            return false;
        }

        addEmpty() {
            // Draws this shader even if there are no quads to be added.
            // This is handy for custom shaders.
            return false;
        }

        cleanup() {
            // Called when no more enabled views have this shader.
        }

        get isShader() {
            return true;
        }
    }

    class Texture {

        /**
         * @param {Stage} stage
         */
        constructor(stage) {
            this.stage = stage;

            this.manager = this.stage.textureManager;

            this.id = Texture.id++;

            /**
             * All enabled views that use this texture object (either as texture or displayedTexture).
             * @type {Set<View>}
             */
            this.views = new Set();

            /**
             * The number of enabled views that are active.
             * @type {number}
             */
            this._activeCount = 0;

            /**
             * The associated texture source.
             * Should not be changed.
             * @type {TextureSource}
             */
            this._source = null;

            /**
             * The texture clipping x-offset.
             * @type {number}
             */
            this._x = 0;

            /**
             * The texture clipping y-offset.
             * @type {number}
             */
            this._y = 0;

            /**
             * The texture clipping width. If 0 then full width.
             * @type {number}
             */
            this._w = 0;

            /**
             * The texture clipping height. If 0 then full height.
             * @type {number}
             */
            this._h = 0;

            /**
             * Render precision (0.5 = fuzzy, 1 = normal, 2 = sharp even when scaled twice, etc.).
             * @type {number}
             * @private
             */
            this._precision = 1;

            /**
             * The (maximum) expected texture source width. Used for within bounds determination while texture is not yet loaded.
             * If not set, 2048 is used by ViewCore.update.
             * @type {number}
             */
            this.mw = 0;

            /**
             * The (maximum) expected texture source height. Used for within bounds determination while texture is not yet loaded.
             * If not set, 2048 is used by ViewCore.update.
             * @type {number}
             */
            this.mh = 0;

            /**
             * Indicates if Texture.prototype.texture uses clipping.
             * @type {boolean}
             */
            this.clipping = false;

            /**
             * Indicates whether this texture must update (when it becomes used again).
             * @type {boolean}
             * @private
             */
            this._mustUpdate = true;

        }

        get source() {
            if (this._mustUpdate || this.stage.hasUpdateSourceTexture(this)) {
                this._performUpdateSource(true);
                this.stage.removeUpdateSourceTexture(this);
            }
            return this._source;
        }

        addView(v) {
            if (!this.views.has(v)) {
                this.views.add(v);

                if (this.views.size === 1) {
                    if (this._source) {
                        this._source.addTexture(this);
                    }
                }

                if (v.active) {
                    this.incActiveCount();
                }
            }
        }

        removeView(v) {
            if (this.views.delete(v)) {
                if (this.views.size === 0) {
                    if (this._source) {
                        this._source.removeTexture(this);
                    }
                }

                if (v.active) {
                    this.decActiveCount();
                }
            }
        }

        incActiveCount() {
            // Ensure that texture source's activeCount has transferred ownership.
            const source = this.source;

            if (source) {
                this._checkForNewerReusableTextureSource();
            }

            this._activeCount++;
            if (this._activeCount === 1) {
                this.becomesUsed();
            }
        }

        decActiveCount() {
            const source = this.source; // Force updating the source.
            this._activeCount--;
            if (!this._activeCount) {
                this.becomesUnused();
            }
        }

        becomesUsed() {
            if (this.source) {
                this.source.incActiveTextureCount();
            }
        }

        _checkForNewerReusableTextureSource() {
            // When this source became unused and cleaned up, it may have disappeared from the reusable texture map.
            // In the meantime another texture may have been generated loaded with the same lookup id.
            // If this is the case, use that one instead to make sure only one active texture source per lookup id exists.
            const source = this.source;
            if (!source.isLoaded()) {
                const reusable = this._getReusableTextureSource();
                if (reusable && reusable.isLoaded() && (reusable !== source)) {
                    this._replaceTextureSource(reusable);
                }
            }
        }

        becomesUnused() {
            if (this.source) {
                this.source.decActiveTextureCount();
            }
        }

        isUsed() {
            return this._activeCount > 0;
        }

        /**
         * Returns the lookup id for the current texture settings, to be able to reuse it.
         * @returns {string|null}
         */
        _getLookupId() {
            // Default: do not reuse texture.
            return null;
        }

        /**
         * Generates a loader function that is able to generate the texture for the current settings of this texture.
         * It should return a function that receives a single callback argument.
         * That callback should be called with the following arguments:
         *   - err
         *   - options: object
         *     - source: ArrayBuffer|WebGlTexture|ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|ImageBitmap
         *     - w: Number
         *     - h: Number
         *     - permanent: Boolean
         *     - hasAlpha: boolean
         *     - permultiplyAlpha: boolean
         *     - flipBlueRed: boolean
         *     - renderInfo: object
         * The loader itself may return a Function that is called when loading of the texture is cancelled. This can be used
         * to stop fetching an image when it is no longer in view, for example.
         */
        _getSourceLoader() {
            throw new Error("Texture.generate must be implemented.");
        }

        get isValid() {
            return this._getIsValid();
        }

        /**
         * If texture is not 'valid', no source can be created for it.
         * @returns {boolean}
         */
        _getIsValid() {
            return true;
        }

        /**
         * This must be called when the texture source must be re-generated.
         */
        _changed() {
            // If no view is actively using this texture, ignore it altogether.
            if (this.isUsed()) {
                this._updateSource();
            } else {
                this._mustUpdate = true;
            }
        }

        _updateSource() {
            // We delay all updateSource calls to the next drawFrame, so that we can bundle them.
            // Otherwise we may reload a texture more often than necessary, when, for example, patching multiple text
            // properties.
            this.stage.addUpdateSourceTexture(this);
        }

        _performUpdateSource(force = false) {
            // If, in the meantime, the texture was no longer used, just remember that it must update until it becomes used
            // again.
            if (force || this.isUsed()) {
                this._mustUpdate = false;
                let source = this._getTextureSource();
                this._replaceTextureSource(source);
            }
        }

        _getTextureSource() {
            let source = null;
            if (this._getIsValid()) {
                const lookupId = this._getLookupId();
                source = this._getReusableTextureSource(lookupId);
                if (!source) {
                    source = this.manager.getTextureSource(this._getSourceLoader(), lookupId);
                }
            }
            return source;
        }

        _getReusableTextureSource(lookupId = this._getLookupId()) {
            if (this._getIsValid()) {
                if (lookupId) {
                    return this.manager.getReusableTextureSource(lookupId);
                }
            }
            return null;
        }

        _replaceTextureSource(newSource = null) {
            let oldSource = this._source;

            this._source = newSource;

            if (this.views.size) {
                if (oldSource) {
                    if (this._activeCount) {
                        oldSource.decActiveTextureCount();
                    }

                    oldSource.removeTexture(this);
                }

                if (newSource) {
                    // Must happen before setDisplayedTexture to ensure sprite map texcoords are used.
                    newSource.addTexture(this);
                    if (this._activeCount) {
                        newSource.incActiveTextureCount();
                    }
                }
            }

            if (this.isUsed()) {
                if (newSource) {
                    if (newSource.isLoaded()) {
                        this.views.forEach(view => {
                            if (view.active) {
                                view._setDisplayedTexture(this);
                            }
                        });
                    } else {
                        const loadError = newSource.loadError;
                        if (loadError) {
                            this.views.forEach(view => {
                                if (view.active) {
                                    view.onTextureSourceLoadError(loadError);
                                }
                            });
                        }
                    }
                } else {
                    this.views.forEach(view => {
                        if (view.active) {
                            view._setDisplayedTexture(null);
                        }
                    });
                }
            }
        }

        load() {
            // Make sure that source is up to date.
            if (this.source) {
                if (!this.isLoaded()) {
                    this.source.load();
                }
            }
        }

        isLoaded() {
            return this._source && this._source.isLoaded();
        }

        get loadError() {
            return this._source && this._source.loadError;
        }

        free() {
            if (this._source) {
                this._source.free();
            }
        }

        enableClipping(x, y, w, h) {
            x *= this._precision;
            y *= this._precision;
            w *= this._precision;
            h *= this._precision;
            if (this._x !== x || this._y !== y || this._w !== w || this._h !== h) {
                this._x = x;
                this._y = y;
                this._w = w;
                this._h = h;

                this.updateClipping(true);
            }
        }

        disableClipping() {
            if (this._x || this._y || this._w || this._h) {
                this._x = 0;
                this._y = 0;
                this._w = 0;
                this._h = 0;

                this.updateClipping(false);
            }
        }

        updateClipping(overrule) {
            if (overrule === true || overrule === false) {
                this.clipping = overrule;
            } else {
                this.clipping = !!(this._x || this._y || this._w || this._h);
            }

            let self = this;
            this.views.forEach(function(view) {
                // Ignore if not the currently displayed texture.
                if (view.displayedTexture === self) {
                    view.onDisplayedTextureClippingChanged();
                }
            });
        }

        updatePrecision() {
            let self = this;
            this.views.forEach(function(view) {
                // Ignore if not the currently displayed texture.
                if (view.displayedTexture === self) {
                    view.onPrecisionChanged();
                }
            });
        }

        getNonDefaults() {
            let nonDefaults = {};
            nonDefaults['type'] = this.constructor.name;
            if (this.x !== 0) nonDefaults['x'] = this.x;
            if (this.y !== 0) nonDefaults['y'] = this.y;
            if (this.w !== 0) nonDefaults['w'] = this.w;
            if (this.h !== 0) nonDefaults['h'] = this.h;
            if (this.precision !== 1) nonDefaults['precision'] = this.precision;
            return nonDefaults;
        }

        get px() {
            return this._x;
        }

        get py() {
            return this._y;
        }

        get pw() {
            return this._w;
        }

        get ph() {
            return this._h;
        }

        get x() {
            return this._x / this._precision;
        }
        set x(v) {
            v = v * this._precision;
            if (this._x !== v) {
                this._x = v;
                this.updateClipping();
            }
        }

        get y() {
            return this._y / this._precision;
        }
        set y(v) {
            v = v * this._precision;
            if (this._y !== v) {
                this._y = v;
                this.updateClipping();
            }
        }

        get w() {
            return this._w / this._precision;
        }

        set w(v) {
            v = v * this._precision;
            if (this._w !== v) {
                this._w = v;
                this.updateClipping();
            }
        }

        get h() {
            return this._h / this._precision;
        }

        set h(v) {
            v = v * this._precision;
            if (this._h !== v) {
                this._h = v;
                this.updateClipping();
            }
        }

        get precision() {
            return this._precision;
        }

        set precision(v) {
            if (this._precision !== v) {
                this._precision = v;
                this.updatePrecision();
            }
        }

        isAutosizeTexture() {
            return true;
        }

        getRenderWidth() {
            if (!this.isAutosizeTexture()) {
                // In case of the rectangle texture, we'd prefer to not cause a 1x1 w,h as it would interfere with flex layout fit-to-contents.
                return 0;
            }

            // If dimensions are unknown (texture not yet loaded), use maximum width as a fallback as render width to allow proper bounds checking.
            return (this._w || (this._source ? this._source.getRenderWidth() - this._x : 0)) / this._precision;
        }

        getRenderHeight() {
            if (!this.isAutosizeTexture()) {
                // In case of the rectangle texture, we'd prefer to not cause a 1x1 w,h as it would interfere with flex layout fit-to-contents.
                return 0;
            }

            return (this._h || (this._source ? this._source.getRenderHeight() - this._y : 0)) / this._precision;
        }

        patch(settings) {
            this.stage.patchObject(this, settings);
        }

    }

    Texture.prototype.isTexture = true;

    Texture.id = 0;

    class ImageTexture extends Texture {

        constructor(stage) {
            super(stage);

            this._src = undefined;
            this._hasAlpha = false;
        }

        get src() {
            return this._src;
        }

        set src(v) {
            if (this._src !== v) {
                this._src = v;
                this._changed();
            }
        }

        get hasAlpha() {
            return this._hasAlpha;
        }

        set hasAlpha(v) {
            if (this._hasAlpha !== v) {
                this._hasAlpha = v;
                this._changed();
            }
        }

        _getIsValid() {
            return !!this._src;
        }

        _getLookupId() {
            return this._src;
        }

        _getSourceLoader() {
            let src = this._src;
            let hasAlpha = this._hasAlpha;
            if (this.stage.getOption('srcBasePath')) {
                var fc = src.charCodeAt(0);
                if ((src.indexOf("//") === -1) && ((fc >= 65 && fc <= 90) || (fc >= 97 && fc <= 122) || fc == 46)) {
                    // Alphabetical or dot: prepend base path.
                    src = this.stage.getOption('srcBasePath') + src;
                }
            }

            const platform = this.stage.platform;
            return function(cb) {
                return platform.loadSrcTexture({src: src, hasAlpha: hasAlpha}, cb);
            }
        }

        getNonDefaults() {
            const obj = super.getNonDefaults();
            if (this._src) {
                obj.src = this._src;
            }
            return obj;
        }

    }

    class TextTextureRenderer {

        constructor(stage, canvas, settings) {
            this._stage = stage;
            this._canvas = canvas;
            this._context = this._canvas.getContext('2d');
            this._settings = settings;
        }

        getPrecision() {
            return this._settings.precision;
        };

        setFontProperties() {
            this._context.font = this._getFontSetting();
            this._context.textBaseline = this._settings.textBaseline;
        };

        _getFontSetting() {
            let ff = this._settings.fontFace;

            if (!Array.isArray(ff)) {
                ff = [ff];
            }

            let ffs = [];
            for (let i = 0, n = ff.length; i < n; i++) {
                if (ff[i] === "serif" || ff[i] === "sans-serif") {
                    ffs.push(ff[i]);
                } else {
                    ffs.push(`"${ff[i]}"`);
                }
            }

            return `${this._settings.fontStyle} ${this._settings.fontSize * this.getPrecision()}px ${ffs.join(",")}`
        }

        _load() {
            if (Utils.isWeb && document.fonts) {
                const fontSetting = this._getFontSetting();
                try {
                    if (!document.fonts.check(fontSetting, this._settings.text)) {
                        // Use a promise that waits for loading.
                        return document.fonts.load(fontSetting, this._settings.text).catch(err => {
                            // Just load the fallback font.
                            console.warn('Font load error', err, fontSetting);
                        }).then(() => {
                            if (!document.fonts.check(fontSetting, this._settings.text)) {
                                console.warn('Font not found', fontSetting);
                            }
                        });
                    }
                } catch(e) {
                    console.warn("Can't check font loading for " + fontSetting);
                }
            }
        }

        draw() {
            // We do not use a promise so that loading is performed syncronous when possible.
            const loadPromise = this._load();
            if (!loadPromise) {
                this._draw();
            } else {
                return loadPromise.then(() => {
                    this._draw();
                });
            }
        }

        _draw() {
            let renderInfo = {};

            const precision = this.getPrecision();

            let paddingLeft = this._settings.paddingLeft * precision;
            let paddingRight = this._settings.paddingRight * precision;
            const fontSize = this._settings.fontSize * precision;
            let offsetY = this._settings.offsetY === null ? null : (this._settings.offsetY * precision);
            let lineHeight = this._settings.lineHeight * precision;
            const w = this._settings.w * precision;
            const h = this._settings.h * precision;
            let wordWrapWidth = this._settings.wordWrapWidth * precision;
            const cutSx = this._settings.cutSx * precision;
            const cutEx = this._settings.cutEx * precision;
            const cutSy = this._settings.cutSy * precision;
            const cutEy = this._settings.cutEy * precision;

            // Set font properties.
            this.setFontProperties();

            // Total width.
            let width = w || (2048 / this.getPrecision());

            // Inner width.
            let innerWidth = width - (paddingLeft);
            if (innerWidth < 10) {
                width += (10 - innerWidth);
                innerWidth += (10 - innerWidth);
            }

            if (!wordWrapWidth) {
                wordWrapWidth = innerWidth;
            }

            // word wrap
            // preserve original text
            let linesInfo;
            if (this._settings.wordWrap) {
                linesInfo = this.wrapText(this._settings.text, wordWrapWidth);
            } else {
                linesInfo = {l: this._settings.text.split(/(?:\r\n|\r|\n)/), n: []};
                let n = linesInfo.l.length;
                for (let i = 0; i < n - 1; i++) {
                    linesInfo.n.push(i);
                }
            }
            let lines = linesInfo.l;

            if (this._settings.maxLines && lines.length > this._settings.maxLines) {
                let usedLines = lines.slice(0, this._settings.maxLines);

                let otherLines = null;
                if (this._settings.maxLinesSuffix) {
                    // Wrap again with max lines suffix enabled.
                    let w = this._settings.maxLinesSuffix ? this._context.measureText(this._settings.maxLinesSuffix).width : 0;
                    let al = this.wrapText(usedLines[usedLines.length - 1], wordWrapWidth - w);
                    usedLines[usedLines.length - 1] = al.l[0] + this._settings.maxLinesSuffix;
                    otherLines = [al.l.length > 1 ? al.l[1] : ''];
                } else {
                    otherLines = [''];
                }

                // Re-assemble the remaining text.
                let i, n = lines.length;
                let j = 0;
                let m = linesInfo.n.length;
                for (i = this._settings.maxLines; i < n; i++) {
                    otherLines[j] += (otherLines[j] ? " " : "") + lines[i];
                    if (i + 1 < m && linesInfo.n[i + 1]) {
                        j++;
                    }
                }

                renderInfo.remainingText = otherLines.join("\n");

                renderInfo.moreTextLines = true;

                lines = usedLines;
            } else {
                renderInfo.moreTextLines = false;
                renderInfo.remainingText = "";
            }

            // calculate text width
            let maxLineWidth = 0;
            let lineWidths = [];
            for (let i = 0; i < lines.length; i++) {
                let lineWidth = this._context.measureText(lines[i]).width;
                lineWidths.push(lineWidth);
                maxLineWidth = Math.max(maxLineWidth, lineWidth);
            }

            renderInfo.lineWidths = lineWidths;

            if (!w) {
                // Auto-set width to max text length.
                width = maxLineWidth + paddingLeft + paddingRight;
                innerWidth = maxLineWidth;
            }

            // calculate text height
            lineHeight = lineHeight || fontSize;

            let height;
            if (h) {
                height = h;
            } else {
                height = lineHeight * (lines.length - 1) + 0.5 * fontSize + Math.max(lineHeight, fontSize) + offsetY;
            }

            if (offsetY === null) {
                offsetY = fontSize;
            }

            renderInfo.w = width;
            renderInfo.h = height;
            renderInfo.lines = lines;
            renderInfo.precision = precision;

            if (!width) {
                // To prevent canvas errors.
                width = 1;
            }

            if (!height) {
                // To prevent canvas errors.
                height = 1;
            }

            if (cutSx || cutEx) {
                width = Math.min(width, cutEx - cutSx);
            }

            if (cutSy || cutEy) {
                height = Math.min(height, cutEy - cutSy);
            }

            // Add extra margin to prevent issue with clipped text when scaling.
            this._canvas.width = Math.ceil(width + this._stage.getOption('textRenderIssueMargin'));
            this._canvas.height = Math.ceil(height);

            // Canvas context has been reset.
            this.setFontProperties();

            if (fontSize >= 128) {
                // WpeWebKit bug: must force compositing because cairo-traps-compositor will not work with text first.
                this._context.globalAlpha = 0.01;
                this._context.fillRect(0, 0, 0.01, 0.01);
                this._context.globalAlpha = 1.0;
            }

            if (cutSx || cutSy) {
                this._context.translate(-cutSx, -cutSy);
            }

            let linePositionX;
            let linePositionY;

            let drawLines = [];

            // Draw lines line by line.
            for (let i = 0, n = lines.length; i < n; i++) {
                linePositionX = 0;
                linePositionY = (i * lineHeight) + offsetY;

                if (this._settings.textAlign === 'right') {
                    linePositionX += (innerWidth - lineWidths[i]);
                } else if (this._settings.textAlign === 'center') {
                    linePositionX += ((innerWidth - lineWidths[i]) / 2);
                }
                linePositionX += paddingLeft;

                drawLines.push({text: lines[i], x: linePositionX, y: linePositionY, w: lineWidths[i]});
            }

            // Highlight.
            if (this._settings.highlight) {
                let color = this._settings.highlightColor || 0x00000000;

                let hlHeight = (this._settings.highlightHeight * precision || fontSize * 1.5);
                let offset = (this._settings.highlightOffset !== null ? this._settings.highlightOffset * precision : -0.5 * fontSize);
                const hlPaddingLeft = (this._settings.highlightPaddingLeft !== null ? this._settings.highlightPaddingLeft * precision : paddingLeft);
                const hlPaddingRight = (this._settings.highlightPaddingRight !== null ? this._settings.highlightPaddingRight * precision : paddingRight);

                this._context.fillStyle = StageUtils.getRgbaString(color);
                for (let i = 0; i < drawLines.length; i++) {
                    let drawLine = drawLines[i];
                    this._context.fillRect((drawLine.x - hlPaddingLeft), (drawLine.y + offset), (drawLine.w + hlPaddingRight + hlPaddingLeft), hlHeight);
                }
            }

            // Text shadow.
            let prevShadowSettings = null;
            if (this._settings.shadow) {
                prevShadowSettings = [this._context.shadowColor, this._context.shadowOffsetX, this._context.shadowOffsetY, this._context.shadowBlur];

                this._context.shadowColor = StageUtils.getRgbaString(this._settings.shadowColor);
                this._context.shadowOffsetX = this._settings.shadowOffsetX * precision;
                this._context.shadowOffsetY = this._settings.shadowOffsetY * precision;
                this._context.shadowBlur = this._settings.shadowBlur * precision;
            }

            this._context.fillStyle = StageUtils.getRgbaString(this._settings.textColor);
            for (let i = 0, n = drawLines.length; i < n; i++) {
                let drawLine = drawLines[i];
                this._context.fillText(drawLine.text, drawLine.x, drawLine.y);
            }

            if (prevShadowSettings) {
                this._context.shadowColor = prevShadowSettings[0];
                this._context.shadowOffsetX = prevShadowSettings[1];
                this._context.shadowOffsetY = prevShadowSettings[2];
                this._context.shadowBlur = prevShadowSettings[3];
            }

            if (cutSx || cutSy) {
                this._context.translate(cutSx, cutSy);
            }

            this.renderInfo = renderInfo;
        };

        /**
         * Applies newlines to a string to have it optimally fit into the horizontal
         * bounds set by the Text object's wordWrapWidth property.
         */
        wrapText(text, wordWrapWidth) {
            // Greedy wrapping algorithm that will wrap words as the line grows longer.
            // than its horizontal bounds.
            let lines = text.split(/\r?\n/g);
            let allLines = [];
            let realNewlines = [];
            for (let i = 0; i < lines.length; i++) {
                let resultLines = [];
                let result = '';
                let spaceLeft = wordWrapWidth;
                let words = lines[i].split(' ');
                for (let j = 0; j < words.length; j++) {
                    let wordWidth = this._context.measureText(words[j]).width;
                    let wordWidthWithSpace = wordWidth + this._context.measureText(' ').width;
                    if (j === 0 || wordWidthWithSpace > spaceLeft) {
                        // Skip printing the newline if it's the first word of the line that is.
                        // greater than the word wrap width.
                        if (j > 0) {
                            resultLines.push(result);
                            result = '';
                        }
                        result += words[j];
                        spaceLeft = wordWrapWidth - wordWidth;
                    }
                    else {
                        spaceLeft -= wordWidthWithSpace;
                        result += ' ' + words[j];
                    }
                }

                if (result) {
                    resultLines.push(result);
                    result = '';
                }

                allLines = allLines.concat(resultLines);

                if (i < lines.length - 1) {
                    realNewlines.push(allLines.length);
                }
            }

            return {l: allLines, n: realNewlines};
        };
        
    }

    class TextTexture extends Texture {

        constructor(stage) {
            super(stage);

            // We use the stage precision as the default precision in case of a text texture.
            this._precision = this.stage.getOption('precision');
        }

        get text() {
            return this._text;
        }

        set text(v) {
            if (this._text !== v) {
                this._text = "" + v;
                this._changed();
            }
        }

        get w() {
            return this._w;
        }

        set w(v) {
            if (this._w !== v) {
                this._w = v;
                this._changed();
            }
        }

        get h() {
            return this._h;
        }

        set h(v) {
            if (this._h !== v) {
                this._h = v;
                this._changed();
            }
        }

        get fontStyle() {
            return this._fontStyle;
        }

        set fontStyle(v) {
            if (this._fontStyle !== v) {
                this._fontStyle = v;
                this._changed();
            }
        }

        get fontSize() {
            return this._fontSize;
        }

        set fontSize(v) {
            if (this._fontSize !== v) {
                this._fontSize = v;
                this._changed();
            }
        }

        get fontFace() {
            return this._fontFace;
        }

        set fontFace(v) {
            if (this._fontFace !== v) {
                this._fontFace = v;
                this._changed();
            }
        }

        get wordWrap() {
            return this._wordWrap;
        }

        set wordWrap(v) {
            if (this._wordWrap !== v) {
                this._wordWrap = v;
                this._changed();
            }
        }

        get wordWrapWidth() {
            return this._wordWrapWidth;
        }

        set wordWrapWidth(v) {
            if (this._wordWrapWidth !== v) {
                this._wordWrapWidth = v;
                this._changed();
            }
        }

        get lineHeight() {
            return this._lineHeight;
        }

        set lineHeight(v) {
            if (this._lineHeight !== v) {
                this._lineHeight = v;
                this._changed();
            }
        }

        get textBaseline() {
            return this._textBaseline;
        }

        set textBaseline(v) {
            if (this._textBaseline !== v) {
                this._textBaseline = v;
                this._changed();
            }
        }

        get textAlign() {
            return this._textAlign;
        }

        set textAlign(v) {
            if (this._textAlign !== v) {
                this._textAlign = v;
                this._changed();
            }
        }

        get offsetY() {
            return this._offsetY;
        }

        set offsetY(v) {
            if (this._offsetY !== v) {
                this._offsetY = v;
                this._changed();
            }
        }

        get maxLines() {
            return this._maxLines;
        }

        set maxLines(v) {
            if (this._maxLines !== v) {
                this._maxLines = v;
                this._changed();
            }
        }

        get maxLinesSuffix() {
            return this._maxLinesSuffix;
        }

        set maxLinesSuffix(v) {
            if (this._maxLinesSuffix !== v) {
                this._maxLinesSuffix = v;
                this._changed();
            }
        }

        get textColor() {
            return this._textColor;
        }

        set textColor(v) {
            if (this._textColor !== v) {
                this._textColor = v;
                this._changed();
            }
        }

        get paddingLeft() {
            return this._paddingLeft;
        }

        set paddingLeft(v) {
            if (this._paddingLeft !== v) {
                this._paddingLeft = v;
                this._changed();
            }
        }

        get paddingRight() {
            return this._paddingRight;
        }

        set paddingRight(v) {
            if (this._paddingRight !== v) {
                this._paddingRight = v;
                this._changed();
            }
        }

        get shadow() {
            return this._shadow;
        }

        set shadow(v) {
            if (this._shadow !== v) {
                this._shadow = v;
                this._changed();
            }
        }

        get shadowColor() {
            return this._shadowColor;
        }

        set shadowColor(v) {
            if (this._shadowColor !== v) {
                this._shadowColor = v;
                this._changed();
            }
        }

        get shadowOffsetX() {
            return this._shadowOffsetX;
        }

        set shadowOffsetX(v) {
            if (this._shadowOffsetX !== v) {
                this._shadowOffsetX = v;
                this._changed();
            }
        }

        get shadowOffsetY() {
            return this._shadowOffsetY;
        }

        set shadowOffsetY(v) {
            if (this._shadowOffsetY !== v) {
                this._shadowOffsetY = v;
                this._changed();
            }
        }

        get shadowBlur() {
            return this._shadowBlur;
        }

        set shadowBlur(v) {
            if (this._shadowBlur !== v) {
                this._shadowBlur = v;
                this._changed();
            }
        }

        get highlight() {
            return this._highlight;
        }

        set highlight(v) {
            if (this._highlight !== v) {
                this._highlight = v;
                this._changed();
            }
        }

        get highlightHeight() {
            return this._highlightHeight;
        }

        set highlightHeight(v) {
            if (this._highlightHeight !== v) {
                this._highlightHeight = v;
                this._changed();
            }
        }

        get highlightColor() {
            return this._highlightColor;
        }

        set highlightColor(v) {
            if (this._highlightColor !== v) {
                this._highlightColor = v;
                this._changed();
            }
        }

        get highlightOffset() {
            return this._highlightOffset;
        }

        set highlightOffset(v) {
            if (this._highlightOffset !== v) {
                this._highlightOffset = v;
                this._changed();
            }
        }

        get highlightPaddingLeft() {
            return this._highlightPaddingLeft;
        }

        set highlightPaddingLeft(v) {
            if (this._highlightPaddingLeft !== v) {
                this._highlightPaddingLeft = v;
                this._changed();
            }
        }

        get highlightPaddingRight() {
            return this._highlightPaddingRight;
        }

        set highlightPaddingRight(v) {
            if (this._highlightPaddingRight !== v) {
                this._highlightPaddingRight = v;
                this._changed();
            }
        }

        get cutSx() {
            return this._cutSx;
        }

        set cutSx(v) {
            if (this._cutSx !== v) {
                this._cutSx = v;
                this._changed();
            }
        }

        get cutEx() {
            return this._cutEx;
        }

        set cutEx(v) {
            if (this._cutEx !== v) {
                this._cutEx = v;
                this._changed();
            }
        }

        get cutSy() {
            return this._cutSy;
        }

        set cutSy(v) {
            if (this._cutSy !== v) {
                this._cutSy = v;
                this._changed();
            }
        }

        get cutEy() {
            return this._cutEy;
        }

        set cutEy(v) {
            if (this._cutEy !== v) {
                this._cutEy = v;
                this._changed();
            }
        }

        get precision() {
            return super.precision;
        }

        set precision(v) {
            // We actually draw differently when the precision changes.
            if (this.precision !== v) {
                super.precision = v;
                this._changed();
            }
        }

        _getIsValid() {
            return !!this.text;
        }

        _getLookupId() {
            let parts = [];

            if (this.w !== 0) parts.push("w " + this.w);
            if (this.h !== 0) parts.push("h " + this.h);
            if (this.fontStyle !== "normal") parts.push("fS" + this.fontStyle);
            if (this.fontSize !== 40) parts.push("fs" + this.fontSize);
            if (this.fontFace !== null) parts.push("ff" + (Array.isArray(this.fontFace) ? this.fontFace.join(",") : this.fontFace));
            if (this.wordWrap !== true) parts.push("wr" + (this.wordWrap ? 1 : 0));
            if (this.wordWrapWidth !== 0) parts.push("ww" + this.wordWrapWidth);
            if (this.lineHeight !== null) parts.push("lh" + this.lineHeight);
            if (this.textBaseline !== "alphabetic") parts.push("tb" + this.textBaseline);
            if (this.textAlign !== "left") parts.push("ta" + this.textAlign);
            if (this.offsetY !== null) parts.push("oy" + this.offsetY);
            if (this.maxLines !== 0) parts.push("ml" + this.maxLines);
            if (this.maxLinesSuffix !== "..") parts.push("ms" + this.maxLinesSuffix);
            parts.push("pc" + this.precision);
            if (this.textColor !== 0xffffffff) parts.push("co" + this.textColor.toString(16));
            if (this.paddingLeft !== 0) parts.push("pl" + this.paddingLeft);
            if (this.paddingRight !== 0) parts.push("pr" + this.paddingRight);
            if (this.shadow !== false) parts.push("sh" + (this.shadow ? 1 : 0));
            if (this.shadowColor !== 0xff000000) parts.push("sc" + this.shadowColor.toString(16));
            if (this.shadowOffsetX !== 0) parts.push("sx" + this.shadowOffsetX);
            if (this.shadowOffsetY !== 0) parts.push("sy" + this.shadowOffsetY);
            if (this.shadowBlur !== 5) parts.push("sb" + this.shadowBlur);
            if (this.highlight !== false) parts.push("hL" + (this.highlight ? 1 : 0));
            if (this.highlightHeight !== 0) parts.push("hh" + this.highlightHeight);
            if (this.highlightColor !== 0xff000000) parts.push("hc" + this.highlightColor.toString(16));
            if (this.highlightOffset !== null) parts.push("ho" + this.highlightOffset);
            if (this.highlightPaddingLeft !== null) parts.push("hl" + this.highlightPaddingLeft);
            if (this.highlightPaddingRight !== null) parts.push("hr" + this.highlightPaddingRight);

            if (this.cutSx) parts.push("csx" + this.cutSx);
            if (this.cutEx) parts.push("cex" + this.cutEx);
            if (this.cutSy) parts.push("csy" + this.cutSy);
            if (this.cutEy) parts.push("cey" + this.cutEy);

            let id = "TX$" + parts.join("|") + ":" + this.text;
            return id;
        }

        _getSourceLoader() {
            const args = this.cloneArgs();

            // Inherit font face from stage.
            if (args.fontFace === null) {
                args.fontFace = this.stage.getOption('defaultFontFace');
            }

            return function(cb) {
                const canvas = this.stage.platform.getDrawingCanvas();
                const renderer = new TextTextureRenderer(this.stage, canvas, args);
                const p = renderer.draw();

                if (p) {
                    p.then(() => {
                        cb(null, Object.assign({renderInfo: renderer.renderInfo}, this.stage.platform.getTextureOptionsForDrawingCanvas(canvas)));
                    }).catch((err) => {
                        cb(err);
                    });
                } else {
                    cb(null, Object.assign({renderInfo: renderer.renderInfo}, this.stage.platform.getTextureOptionsForDrawingCanvas(canvas)));
                }
            }
        }

        getNonDefaults() {
            const nonDefaults = super.getNonDefaults();
            if (this.text !== "") nonDefaults['text'] = this.text;
            if (this.w !== 0) nonDefaults['w'] = this.w;
            if (this.h !== 0) nonDefaults['h'] = this.h;
            if (this.fontStyle !== "normal") nonDefaults['fontStyle'] = this.fontStyle;
            if (this.fontSize !== 40) nonDefaults["fontSize"] = this.fontSize;
            if (this.fontFace !== null) nonDefaults["fontFace"] = this.fontFace;
            if (this.wordWrap !== true) nonDefaults["wordWrap"] = this.wordWrap;
            if (this.wordWrapWidth !== 0) nonDefaults["wordWrapWidth"] = this.wordWrapWidth;
            if (this.lineHeight !== null) nonDefaults["lineHeight"] = this.lineHeight;
            if (this.textBaseline !== "alphabetic") nonDefaults["textBaseline"] = this.textBaseline;
            if (this.textAlign !== "left") nonDefaults["textAlign"] = this.textAlign;
            if (this.offsetY !== null) nonDefaults["offsetY"] = this.offsetY;
            if (this.maxLines !== 0) nonDefaults["maxLines"] = this.maxLines;
            if (this.maxLinesSuffix !== "..") nonDefaults["maxLinesSuffix"] = this.maxLinesSuffix;
            if (this.precision !== this.stage.getOption('precision')) nonDefaults["precision"] = this.precision;
            if (this.textColor !== 0xffffffff) nonDefaults["textColor"] = this.textColor;
            if (this.paddingLeft !== 0) nonDefaults["paddingLeft"] = this.paddingLeft;
            if (this.paddingRight !== 0) nonDefaults["paddingRight"] = this.paddingRight;
            if (this.shadow !== false) nonDefaults["shadow"] = this.shadow;
            if (this.shadowColor !== 0xff000000) nonDefaults["shadowColor"] = this.shadowColor;
            if (this.shadowOffsetX !== 0) nonDefaults["shadowOffsetX"] = this.shadowOffsetX;
            if (this.shadowOffsetY !== 0) nonDefaults["shadowOffsetY"] = this.shadowOffsetY;
            if (this.shadowBlur !== 5) nonDefaults["shadowBlur"] = this.shadowBlur;
            if (this.highlight !== false) nonDefaults["highlight"] = this.highlight;
            if (this.highlightHeight !== 0) nonDefaults["highlightHeight"] = this.highlightHeight;
            if (this.highlightColor !== 0xff000000) nonDefaults["highlightColor"] = this.highlightColor;
            if (this.highlightOffset !== 0) nonDefaults["highlightOffset"] = this.highlightOffset;
            if (this.highlightPaddingLeft !== 0) nonDefaults["highlightPaddingLeft"] = this.highlightPaddingLeft;
            if (this.highlightPaddingRight !== 0) nonDefaults["highlightPaddingRight"] = this.highlightPaddingRight;

            if (this.cutSx) nonDefaults["cutSx"] = this.cutSx;
            if (this.cutEx) nonDefaults["cutEx"] = this.cutEx;
            if (this.cutSy) nonDefaults["cutSy"] = this.cutSy;
            if (this.cutEy) nonDefaults["cutEy"] = this.cutEy;
            return nonDefaults;
        }

        cloneArgs() {
            let obj = {};
            obj.text = this._text;
            obj.w = this._w;
            obj.h = this._h;
            obj.fontStyle = this._fontStyle;
            obj.fontSize = this._fontSize;
            obj.fontFace = this._fontFace;
            obj.wordWrap = this._wordWrap;
            obj.wordWrapWidth = this._wordWrapWidth;
            obj.lineHeight = this._lineHeight;
            obj.textBaseline = this._textBaseline;
            obj.textAlign = this._textAlign;
            obj.offsetY = this._offsetY;
            obj.maxLines = this._maxLines;
            obj.maxLinesSuffix = this._maxLinesSuffix;
            obj.precision = this._precision;
            obj.textColor = this._textColor;
            obj.paddingLeft = this._paddingLeft;
            obj.paddingRight = this._paddingRight;
            obj.shadow = this._shadow;
            obj.shadowColor = this._shadowColor;
            obj.shadowOffsetX = this._shadowOffsetX;
            obj.shadowOffsetY = this._shadowOffsetY;
            obj.shadowBlur = this._shadowBlur;
            obj.highlight = this._highlight;
            obj.highlightHeight = this._highlightHeight;
            obj.highlightColor = this._highlightColor;
            obj.highlightOffset = this._highlightOffset;
            obj.highlightPaddingLeft = this._highlightPaddingLeft;
            obj.highlightPaddingRight = this._highlightPaddingRight;
            obj.cutSx = this._cutSx;
            obj.cutEx = this._cutEx;
            obj.cutSy = this._cutSy;
            obj.cutEy = this._cutEy;
            return obj;
        }


    }

    // Because there are so many properties, we prefer to use the prototype for default values.
    // This causes a decrease in performance, but also a decrease in memory usage.
    let proto = TextTexture.prototype;
    proto._text = "";
    proto._w = 0;
    proto._h = 0;
    proto._fontStyle = "normal";
    proto._fontSize = 40;
    proto._fontFace = null;
    proto._wordWrap = true;
    proto._wordWrapWidth = 0;
    proto._lineHeight = null;
    proto._textBaseline = "alphabetic";
    proto._textAlign = "left";
    proto._offsetY = null;
    proto._maxLines = 0;
    proto._maxLinesSuffix = "..";
    proto._textColor = 0xFFFFFFFF;
    proto._paddingLeft = 0;
    proto._paddingRight = 0;
    proto._shadow = false;
    proto._shadowColor = 0xFF000000;
    proto._shadowOffsetX = 0;
    proto._shadowOffsetY = 0;
    proto._shadowBlur = 5;
    proto._highlight = false;
    proto._highlightHeight = 0;
    proto._highlightColor = 0xFF000000;
    proto._highlightOffset = 0;
    proto._highlightPaddingLeft = 0;
    proto._highlightPaddingRight = 0;
    proto._cutSx = 0;
    proto._cutEx = 0;
    proto._cutSy = 0;
    proto._cutEy = 0;

    class SourceTexture extends Texture {

        constructor(stage) {
            super(stage);

            this._textureSource = undefined;
        }

        get textureSource() {
            return this._textureSource;
        }

        set textureSource(v) {
            if (v !== this._textureSource) {
                if (v.isResultTexture) {
                    // In case of a result texture, automatically inherit the precision.
                    this._precision = this.stage.getRenderPrecision();
                }
                this._textureSource = v;
                this._changed();
            }
        }

        _getTextureSource() {
            return this._textureSource;
        }

    }

    class Transition extends EventEmitter {

        constructor(manager, settings, view, property) {
            super();

            this.manager = manager;

            this._settings = settings;

            this._view = view;
            this._getter = View.getGetter(property);
            this._setter = View.getSetter(property);

            this._merger = settings.merger;

            if (!this._merger) {
                this._merger = View.getMerger(property);
            }

            this._startValue = this._getter(this._view);
            this._targetValue = this._startValue;

            this._p = 1;
            this._delayLeft = 0;
        }

        start(targetValue) {
            this._startValue = this._getter(this._view);

            if (!this.isAttached()) {
                // We don't support transitions on non-attached views. Just set value without invoking listeners.
                this._targetValue = targetValue;
                this._p = 1;
                this._updateDrawValue();
            } else {
                if (targetValue === this._startValue) {
                    this.reset(targetValue, 1);
                } else {
                    this._targetValue = targetValue;
                    this._p = 0;
                    this._delayLeft = this._settings.delay;
                    this.emit('start');
                    this.add();
                }
            }
        }

        finish() {
            if (this._p < 1) {
                // Value setting and will must be invoked (async) upon next transition cycle.
                this._p = 1;
            }
        }

        stop() {
            // Just stop where the transition is at.
            this.manager.removeActive(this);
        }

        pause() {
            this.stop();
        }

        play() {
            this.manager.addActive(this);
        }

        reset(targetValue, p) {
            if (!this.isAttached()) {
                // We don't support transitions on non-attached views. Just set value without invoking listeners.
                this._startValue = this._getter(this._view);
                this._targetValue = targetValue;
                this._p = 1;
                this._updateDrawValue();
            } else {
                this._startValue = this._getter(this._view);
                this._targetValue = targetValue;
                this._p = p;
                this.add();
            }
        }

        _updateDrawValue() {
            this._setter(this._view, this.getDrawValue());
        }

        add() {
            this.manager.addActive(this);
        }

        isAttached() {
            return this._view.attached;
        }

        isRunning() {
            return (this._p < 1.0);
        }

        progress(dt) {
            if (!this.isAttached()) {
                // Skip to end of transition so that it is removed.
                this._p = 1;
            }

            if (this.p < 1) {
                if (this.delayLeft > 0) {
                    this._delayLeft -= dt;

                    if (this.delayLeft < 0) {
                        dt = -this.delayLeft;
                        this._delayLeft = 0;

                        this.emit('delayEnd');
                    } else {
                        return;
                    }
                }

                if (this._settings.duration == 0) {
                    this._p = 1;
                } else {
                    this._p += dt / this._settings.duration;
                }
                if (this._p >= 1) {
                    // Finished!;
                    this._p = 1;
                }
            }

            this._updateDrawValue();

            this.invokeListeners();
        }

        invokeListeners() {
            this.emit('progress', this.p);
            if (this.p === 1) {
                this.emit('finish');
            }
        }

        updateTargetValue(targetValue) {
            let t = this._settings.timingFunctionImpl(this.p);
            if (t === 1) {
                this._targetValue = targetValue;
            } else if (t === 0) {
                this._startValue = this._targetValue;
                this._targetValue = targetValue;
            } else {
                this._startValue = targetValue - ((targetValue - this._targetValue) / (1 - t));
                this._targetValue = targetValue;
            }
        }

        getDrawValue() {
            if (this.p >= 1) {
                return this.targetValue;
            } else {
                let v = this._settings._timingFunctionImpl(this.p);
                return this._merger(this.targetValue, this.startValue, v);
            }
        }

        skipDelay() {
            this._delayLeft = 0;
        }

        get startValue() {
            return this._startValue;
        }

        get targetValue() {
            return this._targetValue;
        }

        get p() {
            return this._p;
        }

        get delayLeft() {
            return this._delayLeft;
        }

        get view() {
            return this._view;
        }

        get settings() {
            return this._settings;
        }

        set settings(v) {
            this._settings = v;
        }

    }

    Transition.prototype.isTransition = true;

    /**
     * Manages a list of objects.
     * Objects may be patched. Then, they can be referenced using the 'ref' (string) property.
     */
    class ObjectList {

        constructor() {
            this._items = [];
            this._refs = {};
        }

        get() {
            return this._items;
        }

        get first() {
            return this._items[0];
        }

        get last() {
            return this._items.length ? this._items[this._items.length - 1] : undefined;
        }

        add(item) {
            this.addAt(item, this._items.length);
        }

        addAt(item, index) {
            if (index >= 0 && index <= this._items.length) {
                let currentIndex = this._items.indexOf(item);
                if (currentIndex === index) {
                    return item;
                }

                if (currentIndex != -1) {
                    this.setAt(item, index);
                } else {
                    if (item.ref) {
                        this._refs[item.ref] = item;
                    }
                    this._items.splice(index, 0, item);
                    this.onAdd(item, index);
                }
            } else {
                throw new Error('addAt: The index ' + index + ' is out of bounds ' + this._items.length);
            }
        }

        replaceByRef(item) {
            if (item.ref) {
                const existingItem = this.getByRef(item.ref);
                if (!existingItem) {
                    throw new Error('replaceByRef: no item found with reference: ' + item.ref);
                }
                this.replace(item, existingItem);
            } else {
                throw new Error('replaceByRef: no ref specified in item');
            }
            this.addAt(item, this._items.length);

        }

        replace(item, prevItem) {
            const index = this.getIndex(prevItem);
            if (index === -1) {
                throw new Error('replace: The previous item does not exist');
            }
            this.setAt(item, index);
        }

        setAt(item, index) {
            if (index >= 0 && index <= this._items.length) {
                let currentIndex = this._items.indexOf(item);
                if (currentIndex != -1) {
                    if (currentIndex !== index) {
                        const fromIndex = currentIndex;
                        if (fromIndex !== index) {
                            this._items.splice(fromIndex, 1);
                            this._items.splice(index, 0, item);
                            this.onMove(item, fromIndex, index);
                        }
                    }
                } else {
                    if (index < this._items.length) {
                        if (this._items[index].ref) {
                            this._refs[this._items[index].ref] = undefined;
                        }
                    }

                    const prevItem = this._items[index];

                    // Doesn't exist yet: overwrite current.
                    this._items[index] = item;

                    if (item.ref) {
                        this._refs[item.ref] = item;
                    }

                    this.onSet(item, index, prevItem);
                }
            } else {
                throw new Error('setAt: The index ' + index + ' is out of bounds ' + this._items.length);
            }
        }

        getAt(index) {
            return this._items[index];
        }

        getIndex(item) {
            return this._items.indexOf(item);
        }

        remove(item) {
            let index = this._items.indexOf(item);

            if (index !== -1) {
                this.removeAt(index);
            }
        };

        removeAt(index) {
            let item = this._items[index];

            if (item.ref) {
                this._refs[item.ref] = undefined;
            }

            this._items.splice(index, 1);

            this.onRemove(item, index);

            return item;
        };

        clear() {
            let n = this._items.length;
            if (n) {
                let prev = this._items;
                this._items = [];
                this._refs = {};
                this.onSync(prev, [], []);
            }
        };

        a(o) {
            if (Utils.isObjectLiteral(o)) {
                let c = this.createItem(o);
                c.patch(o);
                this.add(c);
                return c;
            } else if (Array.isArray(o)) {
                for (let i = 0, n = o.length; i < n; i++) {
                    this.a(o[i]);
                }
                return null;
            } else if (this.isItem(o)) {
                this.add(o);
                return o;
            }
        };

        get length() {
            return this._items.length;
        }

        _getRefs() {
            return this._refs;
        }

        getByRef(ref) {
            return this._refs[ref];
        }

        clearRef(ref) {
            delete this._refs[ref];
        }

        setRef(ref, child) {
            this._refs[ref] = child;
        }

        patch(settings) {
            if (Utils.isObjectLiteral(settings)) {
                this._setByObject(settings);
            } else if (Array.isArray(settings)) {
                this._setByArray(settings);
            }
        }

        _setByObject(settings) {
            // Overrule settings of known referenced items.
            let refs = this._getRefs();
            let crefs = Object.keys(settings);
            for (let i = 0, n = crefs.length; i < n; i++) {
                let cref = crefs[i];
                let s = settings[cref];

                let c = refs[cref];
                if (!c) {
                    if (this.isItem(s)) {
                        // Replace previous item;
                        s.ref = cref;
                        this.add(s);
                    } else {
                        // Create new item.
                        c = this.createItem(s);
                        c.ref = cref;
                        c.patch(s);
                        this.add(c);
                    }
                } else {
                    if (this.isItem(s)) {
                        if (c !== s) {
                            // Replace previous item;
                            let idx = this.getIndex(c);
                            s.ref = cref;
                            this.setAt(s, idx);
                        }
                    } else {
                        c.patch(s);
                    }
                }
            }
        }

        _equalsArray(array) {
            let same = true;
            if (array.length === this._items.length) {
                for (let i = 0, n = this._items.length; (i < n) && same; i++) {
                    same = same && (this._items[i] === array[i]);
                }
            } else {
                same = false;
            }
            return same;
        }

        _setByArray(array) {
            // For performance reasons, first check if the arrays match exactly and bail out if they do.
            if (this._equalsArray(array)) {
                return;
            }

            for (let i = 0, n = this._items.length; i < n; i++) {
                this._items[i].marker = true;
            }

            let refs;
            let newItems = [];
            for (let i = 0, n = array.length; i < n; i++) {
                let s = array[i];
                if (this.isItem(s)) {
                    s.marker = false;
                    newItems.push(s);
                } else {
                    let cref = s.ref;
                    let c;
                    if (cref) {
                        if (!refs) refs = this._getRefs();
                        c = refs[cref];
                    }

                    if (!c) {
                        // Create new item.
                        c = this.createItem(s);
                    } else {
                        c.marker = false;
                    }

                    if (Utils.isObjectLiteral(s)) {
                        c.patch(s);
                    }

                    newItems.push(c);
                }
            }

            this._setItems(newItems);
        }

        _setItems(newItems) {
            let prevItems = this._items;
            this._items = newItems;

            // Remove the items.
            let removed = prevItems.filter(item => {let m = item.marker; delete item.marker; return m});
            let added = newItems.filter(item => (prevItems.indexOf(item) === -1));

            if (removed.length || added.length) {
                // Recalculate refs.
                this._refs = {};
                for (let i = 0, n = this._items.length; i < n; i++) {
                    let ref = this._items[i].ref;
                    if (ref) {
                        this._refs[ref] = this._items[i];
                    }
                }
            }

            this.onSync(removed, added, newItems);
        }

        sort(f) {
            const items = this._items.slice();
            items.sort(f);
            this._setByArray(items);
        }

        onAdd(item, index) {
        }

        onRemove(item, index) {
        }

        onSync(removed, added, order) {
        }

        onSet(item, index, prevItem) {
        }

        onMove(item, fromIndex, toIndex) {
        }

        createItem(object) {
            throw new Error("ObjectList.createItem must create and return a new object");
        }

        isItem(object) {
            return false;
        }

    }

    /**
     * Manages the list of children for a view.
     */

    class ViewChildList extends ObjectList {

        constructor(view) {
            super();
            this._view = view;
        }

        _connectParent(item) {
            const prevParent = item.parent;
            if (prevParent && prevParent !== this._view) {
                // Cleanup in previous child list, without
                const prevChildList = item.parent.childList;
                const index = prevChildList.getIndex(item);

                if (item.ref) {
                    prevChildList._refs[item.ref] = undefined;
                }
                prevChildList._items.splice(index, 1);

                // Also clean up view core.
                prevParent.core.removeChildAt(index);

            }

            item._setParent(this._view);

            // We are expecting the caller to sync it to the core.
        }

        onAdd(item, index) {
            this._connectParent(item);
            this._view.core.addChildAt(index, item.core);
        }

        onRemove(item, index) {
            item._setParent(null);
            this._view.core.removeChildAt(index);
        }

        onSync(removed, added, order) {
            for (let i = 0, n = removed.length; i < n; i++) {
                removed[i]._setParent(null);
            }
            for (let i = 0, n = added.length; i < n; i++) {
                this._connectParent(added[i]);
            }
            let gc = i => i.core;
            this._view.core.syncChildren(removed.map(gc), added.map(gc), order.map(gc));
        }

        onSet(item, index, prevItem) {
            prevItem._setParent(null);

            this._connectParent(item);
            this._view.core.setChildAt(index, item.core);
        }

        onMove(item, fromIndex, toIndex) {
            this._view.core.moveChild(fromIndex, toIndex);
        }

        createItem(object) {
            if (object.type) {
                return new object.type(this._view.stage);
            } else {
                return this._view.stage.createView();
            }
        }

        isItem(object) {
            return object.isView;
        }

    }

    /**
     * Render tree node.
     * Copyright Metrological, 2017
     */

    class View {

        constructor(stage) {

            // EventEmitter constructor.
            this._hasEventListeners = false;

            this.__id = View.id++;

            this.stage = stage;

            this.__core = new ViewCore(this);

            /**
             * A reference that can be used while merging trees.
             * @type {string}
             */
            this.__ref = null;

            /**
             * A view is attached if it is a descendant of the stage root.
             * @type {boolean}
             */
            this.__attached = false;

            /**
             * A view is enabled when it is attached and it is visible (worldAlpha > 0).
             * @type {boolean}
             */
            this.__enabled = false;

            /**
             * A view is active when it is enabled and it is within bounds.
             * @type {boolean}
             */
            this.__active = false;

            /**
             * @type {View}
             */
            this.__parent = null;

            /**
             * The texture that is currently set.
             * @type {Texture}
             */
            this.__texture = null;

            /**
             * The currently displayed texture. While this.texture is loading, this one may be different.
             * @type {Texture}
             */
            this.__displayedTexture = null;

            /**
             * Tags that can be used to identify/search for a specific view.
             * @type {String[]}
             */
            this.__tags = null;

            /**
             * The tree's tags mapping.
             * This contains all views for all known tags, at all times.
             * @type {Map}
             */
            this.__treeTags = null;

            /**
             * Cache for the tag/mtag methods.
             * @type {Map<String,View[]>}
             */
            this.__tagsCache = null;

            /**
             * Tag-to-complex cache (all tags that are part of the complex caches).
             * This maps tags to cached complex tags in the cache.
             * @type {Map<String,String[]>}
             */
            this.__tagToComplex = null;

            /**
             * Creates a tag context: tagged views in this branch will not be reachable from ancestors of this view.
             * @type {boolean}
             */
            this.__tagRoot = false;

            /**
             * (Lazy-initialised) list of children owned by this view.
             * @type {ViewChildList}
             */
            this.__childList = null;

            this._w = 0;

            this._h = 0;
        }

        get id() {
            return this.__id;
        }

        set ref(ref) {
            if (this.__ref !== ref) {
                const charcode = ref.charCodeAt(0);
                if (!Utils.isUcChar(charcode)) {
                    this._throwError("Ref must start with an upper case character: " + ref);
                }
                if (this.__ref !== null) {
                    this.removeTag(this.__ref);
                    if (this.__parent) {
                        this.__parent.__childList.clearRef(this.__ref);
                    }
                }

                this.__ref = ref;

                if (this.__ref) {
                    this._addTag(this.__ref);
                    if (this.__parent) {
                        this.__parent.__childList.setRef(this.__ref, this);
                    }
                }
            }
        }

        get ref() {
            return this.__ref;
        }

        get core() {
            return this.__core;
        }

        setAsRoot() {
            this.__core.setAsRoot();
            this._updateAttachedFlag();
            this._updateEnabledFlag();
        }

        get isRoot() {
            return this.__core.isRoot;
        }

        _setParent(parent) {
            if (this.__parent === parent) return;

            if (this.__parent) {
                this._unsetTagsParent();
            }

            this.__parent = parent;

            if (parent) {
                this._setTagsParent();
            }

            this._updateAttachedFlag();
            this._updateEnabledFlag();

            if (this.isRoot && parent) {
                this._throwError("Root should not be added as a child! Results are unspecified!");
            }
        };

        getDepth() {
            let depth = 0;

            let p = this.__parent;
            while(p) {
                depth++;
                p = p.__parent;
            }

            return depth;
        };

        getAncestor(l) {
            let p = this;
            while (l > 0 && p.__parent) {
                p = p.__parent;
                l--;
            }
            return p;
        };

        getAncestorAtDepth(depth) {
            let levels = this.getDepth() - depth;
            if (levels < 0) {
                return null;
            }
            return this.getAncestor(levels);
        };

        isAncestorOf(c) {
            let p = c;
            while(p = p.parent) {
                if (this === p) {
                    return true;
                }
            }
            return false;
        };

        getSharedAncestor(c) {
            let o1 = this;
            let o2 = c;
            let l1 = o1.getDepth();
            let l2 = o2.getDepth();
            if (l1 > l2) {
                o1 = o1.getAncestor(l1 - l2);
            } else if (l2 > l1) {
                o2 = o2.getAncestor(l2 - l1);
            }

            do {
                if (o1 === o2) {
                    return o1;
                }

                o1 = o1.__parent;
                o2 = o2.__parent;
            } while (o1 && o2);

            return null;
        };

        get attached() {
            return this.__attached;
        }

        get enabled() {
            return this.__enabled;
        }

        get active() {
            return this.__active;
        }

        _isAttached() {
            return (this.__parent ? this.__parent.__attached : (this.stage.root === this));
        };

        _isEnabled() {
            return this.__core.visible && (this.__core.alpha > 0) && (this.__parent ? this.__parent.__enabled : (this.stage.root === this));
        };

        _isActive() {
            return this._isEnabled() && this.withinBoundsMargin;
        };

        /**
         * Updates the 'attached' flag for this branch.
         */
        _updateAttachedFlag() {
            let newAttached = this._isAttached();
            if (this.__attached !== newAttached) {
                this.__attached = newAttached;

                if (newAttached) {
                    this._onSetup();
                }

                let children = this._children.get();
                if (children) {
                    let m = children.length;
                    if (m > 0) {
                        for (let i = 0; i < m; i++) {
                            children[i]._updateAttachedFlag();
                        }
                    }
                }

                if (newAttached) {
                    this._onAttach();
                } else {
                    this._onDetach();
                }
            }
        };

        /**
         * Updates the 'enabled' flag for this branch.
         */
        _updateEnabledFlag() {
            let newEnabled = this._isEnabled();
            if (this.__enabled !== newEnabled) {
                if (newEnabled) {
                    this._onEnabled();
                    this._setEnabledFlag();
                } else {
                    this._onDisabled();
                    this._unsetEnabledFlag();
                }

                let children = this._children.get();
                if (children) {
                    let m = children.length;
                    if (m > 0) {
                        for (let i = 0; i < m; i++) {
                            children[i]._updateEnabledFlag();
                        }
                    }
                }
            }
        };

        _setEnabledFlag() {
            this.__enabled = true;

            // Force re-check of texture because dimensions might have changed (cutting).
            this._updateDimensions();
            this._updateTextureCoords();

            if (this.__texture) {
                this.__texture.addView(this);
            }

            if (this.withinBoundsMargin) {
                this._setActiveFlag();
            }

            if (this.__core.shader) {
                this.__core.shader.addView(this.__core);
            }

        }

        _unsetEnabledFlag() {
            if (this.__active) {
                this._unsetActiveFlag();
            }

            if (this.__texture) {
                this.__texture.removeView(this);
            }

            if (this.__core.shader) {
                this.__core.shader.removeView(this.__core);
            }

            if (this._texturizer) {
                this.texturizer.filters.forEach(filter => filter.removeView(this.__core));
            }

            this.__enabled = false;
        }

        _setActiveFlag() {
            this.__active = true;

            // This must happen before enabling the texture, because it may already be loaded or load directly.
            if (this.__texture) {
                this.__texture.incActiveCount();
            }

            if (this.__texture) {
                this._enableTexture();
            }
            this._onActive();
        }

        _unsetActiveFlag() {
            if (this.__texture) {
                this.__texture.decActiveCount();
            }

            this.__active = false;
            if (this.__texture) {
                this._disableTexture();
            }

            if (this._hasTexturizer()) {
                this.texturizer.deactivate();
            }

            this._onInactive();
        }

        _onSetup() {
        }

        _onAttach() {
        }

        _onDetach() {
        }

        _onEnabled() {
        }

        _onDisabled() {
        }

        _onActive() {
        }

        _onInactive() {
        }

        _onResize() {
        }

        _getRenderWidth() {
            if (this._w) {
                return this._w;
            } else if (this.__displayedTexture) {
                return this.__displayedTexture.getRenderWidth();
            } else if (this.__texture) {
                // Texture already loaded, but not yet updated (probably because this view is not active).
                return this.__texture.getRenderWidth();
            } else {
                return 0;
            }
        };

        _getRenderHeight() {
            if (this._h) {
                return this._h;
            } else if (this.__displayedTexture) {
                return this.__displayedTexture.getRenderHeight();
            } else if (this.__texture) {
                // Texture already loaded, but not yet updated (probably because this view is not active).
                return this.__texture.getRenderHeight();
            } else {
                return 0;
            }
        };

        get renderWidth() {
            if (this.__enabled) {
                // Render width is only maintained if this view is enabled.
                return this.__core.getRenderWidth();
            } else {
                return this._getRenderWidth();
            }
        }

        get renderHeight() {
            if (this.__enabled) {
                return this.__core.getRenderHeight();
            } else {
                return this._getRenderHeight();
            }
        }

        textureIsLoaded() {
            return this.__texture && this.__texture.isLoaded();
        }

        loadTexture() {
            if (this.__texture) {
                this.__texture.load();

                if (!this.__texture.isUsed() || !this._isEnabled()) {
                    // Loading the texture will have no effect on the dimensions of this view.
                    // Manually update them, so that calcs can be performed immediately in userland.
                    this._updateDimensions();
                }
            }
        }

        _enableTextureError() {
            // txError event should automatically be re-triggered when a view becomes active.
            const loadError = this.__texture.loadError;
            if (loadError) {
                this.emit('txError', loadError, this.__texture._source);
            }
        }

        _enableTexture() {
            if (this.__texture.isLoaded()) {
                this._setDisplayedTexture(this.__texture);
            } else {
                // We don't want to retain the old 'ghost' image as it wasn't visible anyway.
                this._setDisplayedTexture(null);

                this._enableTextureError();
            }
        }

        _disableTexture() {
            // We disable the displayed texture because, when the texture changes while invisible, we should use that w, h,
            // mw, mh for checking within bounds.
            this._setDisplayedTexture(null);
        }

        get texture() {
            return this.__texture;
        }

        set texture(v) {
            let texture;
            if (Utils.isObjectLiteral(v)) {
                if (v.type) {
                    texture = new v.type(this.stage);
                } else {
                    texture = this.texture;
                }

                if (texture) {
                    this.stage.patchObject(texture, v);
                }
            } else if (!v) {
                texture = null;
            } else {
                if (v.isTexture) {
                    texture = v;
                } else if (v.isTextureSource) {
                    texture = new SourceTexture(this.stage);
                    texture.textureSource = v;
                } else {
                    console.error("Please specify a texture type.");
                    return;
                }
            }

            const prevTexture = this.__texture;
            if (texture !== prevTexture) {
                this.__texture = texture;

                if (this.__texture) {
                    if (this.__enabled) {
                        this.__texture.addView(this);

                        if (this.withinBoundsMargin) {
                            if (this.__texture.isLoaded()) {
                                this._setDisplayedTexture(this.__texture);
                            } else {
                                this._enableTextureError();
                            }
                        }
                    }
                } else {
                    // Make sure that current texture is cleared when the texture is explicitly set to null.
                    this._setDisplayedTexture(null);
                }

                if (prevTexture && prevTexture !== this.__displayedTexture) {
                    prevTexture.removeView(this);
                }

                this._updateDimensions();
            }
        }

        get displayedTexture() {
            return this.__displayedTexture;
        }

        _setDisplayedTexture(v) {
            let prevTexture = this.__displayedTexture;

            if (prevTexture && (v !== prevTexture)) {
                if (this.__texture !== prevTexture) {
                    // The old displayed texture is deprecated.
                    prevTexture.removeView(this);
                }
            }

            const prevSource = this.__core.displayedTextureSource ? this.__core.displayedTextureSource._source : null;
            const sourceChanged = (v ? v._source : null) !== prevSource;

            this.__displayedTexture = v;
            this._updateDimensions();

            if (this.__displayedTexture) {
                if (sourceChanged) {
                    // We don't need to reference the displayed texture because it was already referenced (this.texture === this.displayedTexture).
                    this._updateTextureCoords();
                    this.__core.setDisplayedTextureSource(this.__displayedTexture._source);
                }
            } else {
                this.__core.setDisplayedTextureSource(null);
            }

            if (sourceChanged) {
                if (this.__displayedTexture) {
                    this.emit('txLoaded', this.__displayedTexture);
                } else {
                    this.emit('txUnloaded', this.__displayedTexture);
                }
            }
        }

        onTextureSourceLoaded() {
            // This function is called when view is enabled, but we only want to set displayed texture for active views.
            if (this.active) {
                // We may be dealing with a texture reloading, so we must force update.
                this._setDisplayedTexture(this.__texture);
            }
        };

        onTextureSourceLoadError(e) {
            this.emit('txError', e, this.__texture._source);
        };

        forceRenderUpdate() {
            this.__core.setHasRenderUpdates(3);
        }

        onDisplayedTextureClippingChanged() {
            this._updateDimensions();
            this._updateTextureCoords();
        };

        onPrecisionChanged() {
            this._updateDimensions();
        };

        _updateDimensions() {
            let w = this._getRenderWidth();
            let h = this._getRenderHeight();

            let unknownSize = false;
            if (!w || !h) {
                if (!this.__displayedTexture && this.__texture) {
                    // We use a 'max width' replacement instead in the ViewCore calcs.
                    // This makes sure that it is able to determine withinBounds.
                    w = w || this.__texture.mw;
                    h = h || this.__texture.mh;

                    if ((!w || !h) && this.__texture.isAutosizeTexture()) {
                        unknownSize = true;
                    }
                }
            }

            if (this.__core.setDimensions(w, h, unknownSize)) {
                this._onResize();
            }
        }

        _updateTextureCoords() {
            if (this.displayedTexture && this.displayedTexture._source) {
                let displayedTexture = this.displayedTexture;
                let displayedTextureSource = this.displayedTexture._source;

                let tx1 = 0, ty1 = 0, tx2 = 1.0, ty2 = 1.0;
                if (displayedTexture.clipping) {
                    // Apply texture clipping.
                    let w = displayedTextureSource.getRenderWidth();
                    let h = displayedTextureSource.getRenderHeight();
                    let iw, ih, rw, rh;
                    iw = 1 / w;
                    ih = 1 / h;

                    if (displayedTexture.pw) {
                        rw = (displayedTexture.pw) * iw;
                    } else {
                        rw = (w - displayedTexture.px) * iw;
                    }

                    if (displayedTexture.ph) {
                        rh = displayedTexture.ph * ih;
                    } else {
                        rh = (h - displayedTexture.py) * ih;
                    }

                    iw *= (displayedTexture.px);
                    ih *= (displayedTexture.py);

                    tx1 = iw;
                    ty1 = ih;
                    tx2 = tx2 * rw + iw;
                    ty2 = ty2 * rh + ih;

                    tx1 = Math.max(0, tx1);
                    ty1 = Math.max(0, ty1);
                    tx2 = Math.min(1, tx2);
                    ty2 = Math.min(1, ty2);
                }

                this.__core.setTextureCoords(tx1, ty1, tx2, ty2);
            }
        }

        getCornerPoints() {
            return this.__core.getCornerPoints();
        }

        /**
         * Clears the cache(s) for the specified tag.
         * @param {String} tag
         */
        _clearTagsCache(tag) {
            if (this.__tagsCache) {
                this.__tagsCache.delete(tag);

                if (this.__tagToComplex) {
                    let s = this.__tagToComplex.get(tag);
                    if (s) {
                        for (let i = 0, n = s.length; i < n; i++) {
                            this.__tagsCache.delete(s[i]);
                        }
                        this.__tagToComplex.delete(tag);
                    }
                }
            }
        };

        _unsetTagsParent() {
            let tags = null;
            let n = 0;
            if (this.__treeTags) {
                if (this.__tagRoot) {
                    // Just need to remove the 'local' tags.
                    if (this.__tags) {
                        this.__tags.forEach((tag) => {
                            // Remove from treeTags.
                            let p = this;
                            while (p = p.__parent) {
                                let parentTreeTags = p.__treeTags.get(tag);
                                parentTreeTags.delete(this);
                                p._clearTagsCache(tag);

                                if (p.__tagRoot) {
                                    break;
                                }
                            }
                        });
                    }
                } else {
                    tags = Utils.iteratorToArray(this.__treeTags.keys());
                    n = tags.length;

                    if (n > 0) {
                        for (let i = 0; i < n; i++) {
                            let tagSet = this.__treeTags.get(tags[i]);

                            // Remove from treeTags.
                            let p = this;
                            while ((p = p.__parent)) {
                                let parentTreeTags = p.__treeTags.get(tags[i]);

                                tagSet.forEach(function (comp) {
                                    parentTreeTags.delete(comp);
                                });


                                p._clearTagsCache(tags[i]);

                                if (p.__tagRoot) {
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        };

        _setTagsParent() {
            if (this.__treeTags && this.__treeTags.size) {
                if (this.__tagRoot) {
                    // Just copy over the 'local' tags.
                    if (this.__tags) {
                        this.__tags.forEach((tag) => {
                            let p = this;
                            while (p = p.__parent) {
                                if (!p.__treeTags) {
                                    p.__treeTags = new Map();
                                }

                                let s = p.__treeTags.get(tag);
                                if (!s) {
                                    s = new Set();
                                    p.__treeTags.set(tag, s);
                                }

                                s.add(this);

                                p._clearTagsCache(tag);

                                if (p.__tagRoot) {
                                    break;
                                }
                            }
                        });
                    }
                } else {
                    this.__treeTags.forEach((tagSet, tag) => {
                        let p = this;
                        while (!p.__tagRoot && (p = p.__parent)) {
                            if (p.__tagRoot) ;
                            if (!p.__treeTags) {
                                p.__treeTags = new Map();
                            }

                            let s = p.__treeTags.get(tag);
                            if (!s) {
                                s = new Set();
                                p.__treeTags.set(tag, s);
                            }

                            tagSet.forEach(function (comp) {
                                s.add(comp);
                            });

                            p._clearTagsCache(tag);
                        }
                    });
                }
            }
        };


        _getByTag(tag) {
            if (!this.__treeTags) {
                return [];
            }
            let t = this.__treeTags.get(tag);
            return t ? Utils.setToArray(t) : [];
        };

        getTags() {
            return this.__tags ? this.__tags : [];
        };

        setTags(tags) {
            tags = tags.reduce((acc, tag) => {
                return acc.concat(tag.split(' '));
            }, []);

            if (this.__ref) {
                tags.push(this.__ref);
            }

            let i, n = tags.length;
            let removes = [];
            let adds = [];
            for (i = 0; i < n; i++) {
                if (!this.hasTag(tags[i])) {
                    adds.push(tags[i]);
                }
            }

            let currentTags = this.tags || [];
            n = currentTags.length;
            for (i = 0; i < n; i++) {
                if (tags.indexOf(currentTags[i]) == -1) {
                    removes.push(currentTags[i]);
                }
            }

            for (i = 0; i < removes.length; i++) {
                this.removeTag(removes[i]);
            }

            for (i = 0; i < adds.length; i++) {
                this.addTag(adds[i]);
            }
        }

        addTag(tag) {
            if (tag.indexOf(' ') === -1) {
                if (Utils.isUcChar(tag.charCodeAt(0))) {
                    this._throwError("Tag may not start with an upper case character.");
                }

                this._addTag(tag);
            } else {
                const tags = tag.split(' ');
                for (let i = 0, m = tags.length; i < m; i++) {
                    const tag = tags[i];

                    if (Utils.isUcChar(tag.charCodeAt(0))) {
                        this._throwError("Tag may not start with an upper case character.");
                    }

                    this._addTag(tag);
                }
            }
        }

        _addTag(tag) {
            if (!this.__tags) {
                this.__tags = [];
            }
            if (this.__tags.indexOf(tag) === -1) {
                this.__tags.push(tag);

                // Add to treeTags hierarchy.
                let p = this;
                do {
                    if (!p.__treeTags) {
                        p.__treeTags = new Map();
                    }

                    let s = p.__treeTags.get(tag);
                    if (!s) {
                        s = new Set();
                        p.__treeTags.set(tag, s);
                    }

                    s.add(this);

                    p._clearTagsCache(tag);
                } while (!p.__tagRoot && (p = p.__parent));
            }
        }

        removeTag(tag) {
            let i = this.__tags.indexOf(tag);
            if (i !== -1) {
                this.__tags.splice(i, 1);

                // Remove from treeTags hierarchy.
                let p = this;
                do {
                    let list = p.__treeTags.get(tag);
                    if (list) {
                        list.delete(this);

                        p._clearTagsCache(tag);
                    }
                } while (!p.__tagRoot && (p = p.__parent));
            }
        }

        hasTag(tag) {
            return (this.__tags && (this.__tags.indexOf(tag) !== -1));
        }

        /**
         * Returns one of the views from the subtree that have this tag.
         * @param {string} tag
         * @returns {View}
         */
        _tag(tag) {
            let res = this.mtag(tag);
            return res[0];
        };

        get tag() {
            return this._tag;
        }

        set tag(t) {
            this.tags = t;
        }

        /**
         * Returns all views from the subtree that have this tag.
         * @param {string} tag
         * @returns {View[]}
         */
        mtag(tag) {
            let res = null;
            if (this.__tagsCache) {
                res = this.__tagsCache.get(tag);
            }

            if (!res) {
                let idx = tag.indexOf(".");
                if (idx >= 0) {
                    let parts = tag.split('.');
                    res = this._getByTag(parts[0]);
                    let level = 1;
                    let c = parts.length;
                    while (res.length && level < c) {
                        let resn = [];
                        for (let j = 0, n = res.length; j < n; j++) {
                            resn = resn.concat(res[j]._getByTag(parts[level]));
                        }

                        res = resn;
                        level++;
                    }
                } else {
                    res = this._getByTag(tag);
                }

                if (!this.__tagsCache) {
                    this.__tagsCache = new Map();
                }

                this.__tagsCache.set(tag, res);
            }
            return res;
        };

        stag(tag, settings) {
            let t = this.mtag(tag);
            let n = t.length;
            for (let i = 0; i < n; i++) {
                this.stage.patchObject(t[i], settings);
            }
        }

        get tagRoot() {
            return this.__tagRoot;
        }

        set tagRoot(v) {
            if (this.__tagRoot !== v) {
                if (!v) {
                    this._setTagsParent();
                } else {
                    this._unsetTagsParent();
                }

                this.__tagRoot = v;
            }
        }

        sel(path) {
            const results = this.select(path);
            if (results.length) {
                return results[0];
            } else {
                return undefined;
            }
        }

        select(path) {
            if (path.indexOf(",") !== -1) {
                let selectors = path.split(',');
                let res = [];
                for (let i = 0; i < selectors.length; i++) {
                    res = res.concat(this._select(selectors[i]));
                }
                return res;
            } else {
                return this._select(path);
            }
        }

        _select(path) {
            if (path === "") return [this];


            let pointIdx = path.indexOf(".");
            let arrowIdx = path.indexOf(">");
            if (pointIdx === -1 && arrowIdx === -1) {
                // Quick case.
                if (Utils.isUcChar(path.charCodeAt(0))) {
                    const ref = this.getByRef(path);
                    return ref ? [ref] : [];
                } else {
                    return this.mtag(path);
                }
            }

            // Detect by first char.
            let isRef;
            if (arrowIdx === 0) {
                isRef = true;
                path = path.substr(1);
            } else if (pointIdx === 0) {
                isRef = false;
                path = path.substr(1);
            } else {
                const firstCharcode = path.charCodeAt(0);
                isRef = Utils.isUcChar(firstCharcode);
            }

            return this._selectChilds(path, isRef);
        }

        _selectChilds(path, isRef) {
            const pointIdx = path.indexOf(".");
            const arrowIdx = path.indexOf(">");

            if (pointIdx === -1 && arrowIdx === -1) {
                if (isRef) {
                    const ref = this.getByRef(path);
                    return ref ? [ref] : [];
                } else {
                    return this.mtag(path);
                }
            }

            if ((arrowIdx === -1) || (pointIdx !== -1 && pointIdx < arrowIdx)) {
                let next;
                const str = path.substr(0, pointIdx);
                if (isRef) {
                    const ref = this.getByRef(str);
                    next = ref ? [ref] : [];
                } else {
                    next = this.mtag(str);
                }
                let total = [];
                const subPath = path.substr(pointIdx + 1);
                for (let i = 0, n = next.length; i < n; i++) {
                    total = total.concat(next[i]._selectChilds(subPath, false));
                }
                return total;
            } else {
                let next;
                const str = path.substr(0, arrowIdx);
                if (isRef) {
                    const ref = this.getByRef(str);
                    next = ref ? [ref] : [];
                } else {
                    next = this.mtag(str);
                }
                let total = [];
                const subPath = path.substr(arrowIdx + 1);
                for (let i = 0, n = next.length; i < n; i++) {
                    total = total.concat(next[i]._selectChilds(subPath, true));
                }
                return total;
            }
        }

        getByRef(ref) {
            return this.childList.getByRef(ref);
        }

        getLocationString() {
            let i;
            i = this.__parent ? this.__parent._children.getIndex(this) : "R";
            let localTags = this.getTags();
            let str = this.__parent ? this.__parent.getLocationString(): "";
            if (this.ref) {
                str += ":[" + i + "]" + this.ref;
            } else if (localTags.length) {
                str += ":[" + i + "]" + localTags.join(",");
            } else {
                str += ":[" + i + "]#" + this.id;
            }
            return str;
        }

        toString() {
            let obj = this.getSettings();
            return View.getPrettyString(obj, "");
        };

        static getPrettyString(obj, indent) {
            let children = obj.children;
            delete obj.children;


            // Convert singular json settings object.
            let colorKeys = ["color", "colorUl", "colorUr", "colorBl", "colorBr"];
            let str = JSON.stringify(obj, function (k, v) {
                if (colorKeys.indexOf(k) !== -1) {
                    return "COLOR[" + v.toString(16) + "]";
                }
                return v;
            });
            str = str.replace(/"COLOR\[([a-f0-9]{1,8})\]"/g, "0x$1");

            if (children) {
                let childStr = "";
                if (Utils.isObjectLiteral(children)) {
                    let refs = Object.keys(children);
                    childStr = "";
                    for (let i = 0, n = refs.length; i < n; i++) {
                        childStr += `\n${indent}  "${refs[i]}":`;
                        delete children[refs[i]].ref;
                        childStr += View.getPrettyString(children[refs[i]], indent + "  ") + (i < n - 1 ? "," : "");
                    }
                    let isEmpty = (str === "{}");
                    str = str.substr(0, str.length - 1) + (isEmpty ? "" : ",") + childStr + "\n" + indent + "}";
                } else {
                    let n = children.length;
                    childStr = "[";
                    for (let i = 0; i < n; i++) {
                        childStr += View.getPrettyString(children[i], indent + "  ") + (i < n - 1 ? "," : "") + "\n";
                    }
                    childStr += indent + "]}";
                    let isEmpty = (str === "{}");
                    str = str.substr(0, str.length - 1) + (isEmpty ? "" : ",") + "\"children\":\n" + indent + childStr + "}";
                }

            }

            return str;
        }

        getSettings() {
            let settings = this.getNonDefaults();

            let children = this._children.get();
            if (children) {
                let n = children.length;
                if (n) {
                    const childArray = [];
                    let missing = false;
                    for (let i = 0; i < n; i++) {
                        childArray.push(children[i].getSettings());
                        missing = missing || !children[i].ref;
                    }

                    if (!missing) {
                        settings.children = {};
                        childArray.forEach(child => {
                            settings.children[child.ref] = child;
                        });
                    } else {
                        settings.children = childArray;
                    }
                }
            }

            settings.id = this.id;

            return settings;
        }

        getNonDefaults() {
            let settings = {};

            if (this.constructor !== View) {
                settings.type = this.constructor.name;
            }

            if (this.__ref) {
                settings.ref = this.__ref;
            }

            if (this.__tags && this.__tags.length) {
                settings.tags = this.__tags;
            }

            if (this.x !== 0) settings.x = this.x;
            if (this.y !== 0) settings.y = this.y;
            if (this.w !== 0) settings.w = this.w;
            if (this.h !== 0) settings.h = this.h;

            if (this.scaleX === this.scaleY) {
                if (this.scaleX !== 1) settings.scale = this.scaleX;
            } else {
                if (this.scaleX !== 1) settings.scaleX = this.scaleX;
                if (this.scaleY !== 1) settings.scaleY = this.scaleY;
            }

            if (this.pivotX === this.pivotY) {
                if (this.pivotX !== 0.5) settings.pivot = this.pivotX;
            } else {
                if (this.pivotX !== 0.5) settings.pivotX = this.pivotX;
                if (this.pivotY !== 0.5) settings.pivotY = this.pivotY;
            }

            if (this.mountX === this.mountY) {
                if (this.mountX !== 0) settings.mount = this.mountX;
            } else {
                if (this.mountX !== 0) settings.mountX = this.mountX;
                if (this.mountY !== 0) settings.mountY = this.mountY;
            }

            if (this.alpha !== 1) settings.alpha = this.alpha;

            if (!this.visible) settings.visible = false;

            if (this.rotation !== 0) settings.rotation = this.rotation;

            if (this.colorUl === this.colorUr && this.colorBl === this.colorBr && this.colorUl === this.colorBl) {
                if (this.colorUl !== 0xFFFFFFFF) settings.color = this.colorUl.toString(16);
            } else {
                if (this.colorUl !== 0xFFFFFFFF) settings.colorUl = this.colorUl.toString(16);
                if (this.colorUr !== 0xFFFFFFFF) settings.colorUr = this.colorUr.toString(16);
                if (this.colorBl !== 0xFFFFFFFF) settings.colorBl = this.colorBl.toString(16);
                if (this.colorBr !== 0xFFFFFFFF) settings.colorBr = this.colorBr.toString(16);
            }

            if (this.zIndex) settings.zIndex = this.zIndex;

            if (this.forceZIndexContext) settings.forceZIndexContext = true;

            if (this.clipping) settings.clipping = this.clipping;

            if (!this.clipbox) settings.clipbox = this.clipbox;

            if (this.__texture) {
                let tnd = this.__texture.getNonDefaults();
                if (Object.keys(tnd).length) {
                    settings.texture = tnd;
                }
            }

            if (this._texturizer) {
                if (this.texturizer.enabled) {
                    settings.renderToTexture = this.texturizer.enabled;
                }
                if (this.texturizer.lazy) {
                    settings.renderToTextureLazy = this._texturizer.lazy;
                }
                if (this._texturizer.colorize) {
                    settings.colorizeResultTexture = this._texturizer.colorize;
                }
                if (this._texturizer.renderOffscreen) {
                    settings.renderOffscreen = this._texturizer.renderOffscreen;
                }
            }

            return settings;
        };

        static getGetter(propertyPath) {
            let getter = View.PROP_GETTERS.get(propertyPath);
            if (!getter) {
                getter = new Function('obj', 'return obj.' + propertyPath);
                View.PROP_GETTERS.set(propertyPath, getter);
            }
            return getter;
        }

        static getSetter(propertyPath) {
            let setter = View.PROP_SETTERS.get(propertyPath);
            if (!setter) {
                setter = new Function('obj', 'v', 'obj.' + propertyPath + ' = v');
                View.PROP_SETTERS.set(propertyPath, setter);
            }
            return setter;
        }

        get withinBoundsMargin() {
            return this.__core._withinBoundsMargin;
        }

        _enableWithinBoundsMargin() {
            // Iff enabled, this toggles the active flag.
            if (this.__enabled) {
                this._setActiveFlag();
            }
        }

        _disableWithinBoundsMargin() {
            // Iff active, this toggles the active flag.
            if (this.__active) {
                this._unsetActiveFlag();
            }
        }

        set boundsMargin(v) {
            if (!Array.isArray(v) && v !== null) {
                throw new Error("boundsMargin should be an array of left-top-right-bottom values or null (inherit margin)");
            }
            this.__core.boundsMargin = v;
        }

        get boundsMargin() {
            return this.__core.boundsMargin;
        }

        get x() {
            return this.__core.offsetX;
        }

        set x(v) {
            this.__core.offsetX = v;
        }

        get y() {
            return this.__core.offsetY;
        }

        set y(v) {
            this.__core.offsetY = v;
        }

        get w() {
            return this._w;
        }

        set w(v) {
            if (Utils.isFunction(v)) {
                this._w = 0;
                this.__core.funcW = v;
            } else {
                v = Math.max(v, 0);
                if (this._w !== v) {
                    this.__core.disableFuncW();
                    this._w = v;
                    this._updateDimensions();
                }
            }
        }

        get h() {
            return this._h;
        }

        set h(v) {
            if (Utils.isFunction(v)) {
                this._h = 0;
                this.__core.funcH = v;
            } else {
                v = Math.max(v, 0);
                if (this._h !== v) {
                    this.__core.disableFuncH();
                    this._h = v;
                    this._updateDimensions();
                }
            }
        }

        get scaleX() {
            return this.__core.scaleX;
        }

        set scaleX(v) {
            this.__core.scaleX = v;
        }

        get scaleY() {
            return this.__core.scaleY;
        }

        set scaleY(v) {
            this.__core.scaleY = v;
        }

        get scale() {
            return this.__core.scale;
        }

        set scale(v) {
            this.__core.scale = v;
        }

        get pivotX() {
            return this.__core.pivotX;
        }

        set pivotX(v) {
            this.__core.pivotX = v;
        }

        get pivotY() {
            return this.__core.pivotY;
        }

        set pivotY(v) {
            this.__core.pivotY = v;
        }

        get pivot() {
            return this.__core.pivot;
        }

        set pivot(v) {
            this.__core.pivot = v;
        }

        get mountX() {
            return this.__core.mountX;
        }

        set mountX(v) {
            this.__core.mountX = v;
        }

        get mountY() {
            return this.__core.mountY;
        }

        set mountY(v) {
            this.__core.mountY = v;
        }

        get mount() {
            return this.__core.mount;
        }

        set mount(v) {
            this.__core.mount = v;
        }

        get rotation() {
            return this.__core.rotation;
        }

        set rotation(v) {
            this.__core.rotation = v;
        }

        get alpha() {
            return this.__core.alpha;
        }

        set alpha(v) {
            this.__core.alpha = v;
        }

        get visible() {
            return this.__core.visible;
        }

        set visible(v) {
            this.__core.visible = v;
        }
        
        get colorUl() {
            return this.__core.colorUl;
        }

        set colorUl(v) {
            this.__core.colorUl = v;
        }

        get colorUr() {
            return this.__core.colorUr;
        }

        set colorUr(v) {
            this.__core.colorUr = v;
        }

        get colorBl() {
            return this.__core.colorBl;
        }

        set colorBl(v) {
            this.__core.colorBl = v;
        }

        get colorBr() {
            return this.__core.colorBr;
        }

        set colorBr(v) {
            this.__core.colorBr = v;
        }

        get color() {
            return this.__core.colorUl;
        }

        set color(v) {
            if (this.colorUl !== v || this.colorUr !== v || this.colorBl !== v || this.colorBr !== v) {
                this.colorUl = v;
                this.colorUr = v;
                this.colorBl = v;
                this.colorBr = v;
            }
        }

        get colorTop() {
            return this.colorUl;
        }

        set colorTop(v) {
            if (this.colorUl !== v || this.colorUr !== v) {
                this.colorUl = v;
                this.colorUr = v;
            }
        }

        get colorBottom() {
            return this.colorBl;
        }

        set colorBottom(v) {
            if (this.colorBl !== v || this.colorBr !== v) {
                this.colorBl = v;
                this.colorBr = v;
            }
        }

        get colorLeft() {
            return this.colorUl;
        }

        set colorLeft(v) {
            if (this.colorUl !== v || this.colorBl !== v) {
                this.colorUl = v;
                this.colorBl = v;
            }
        }

        get colorRight() {
            return this.colorUr;
        }

        set colorRight(v) {
            if (this.colorUr !== v || this.colorBr !== v) {
                this.colorUr = v;
                this.colorBr = v;
            }
        }

        get zIndex() {return this.__core.zIndex}
        set zIndex(v) {
            this.__core.zIndex = v;
        }

        get forceZIndexContext() {return this.__core.forceZIndexContext}
        set forceZIndexContext(v) {
            this.__core.forceZIndexContext = v;
        }

        get clipping() {return this.__core.clipping}
        set clipping(v) {
            this.__core.clipping = v;
        }

        get clipbox() {return this.__core.clipbox}
        set clipbox(v) {
            this.__core.clipbox = v;
        }

        get tags() {
            return this.getTags();
        }

        set tags(v) {
            if (!Array.isArray(v)) v = [v];
            this.setTags(v);
        }

        set t(v) {
            this.tags = v;
        }

        get _children() {
            if (!this.__childList) {
                this.__childList = new ViewChildList(this, false);
            }
            return this.__childList;
        }

        get childList() {
            if (!this._allowChildrenAccess()) {
                this._throwError("Direct access to children is not allowed in " + this.getLocationString());
            }
            return this._children;
        }

        hasChildren() {
            return this._allowChildrenAccess() && this.__childList && (this.__childList.length > 0);
        }

        _allowChildrenAccess() {
            return true;
        }

        get children() {
            return this.childList.get();
        }

        set children(children) {
            this.childList.patch(children);
        }

        add(o) {
            return this.childList.a(o);
        }

        get p() {
            return this.__parent;
        }

        get parent() {
            return this.__parent;
        }

        get src() {
            if (this.texture && this.texture instanceof ImageTexture) {
                return this.texture._src;
            } else {
                return undefined;
            }
        }

        set src(v) {
            const texture = new ImageTexture(this.stage);
            texture.src = v;
            this.texture = texture;
        }

        set mw(v) {
            if (this.texture) {
                this.texture.mw = v;
                this._updateDimensions();
            } else {
                this._throwError('Please set mw after setting a texture.');
            }
        }

        set mh(v) {
            if (this.texture) {
                this.texture.mh = v;
                this._updateDimensions();
            } else {
                this._throwError('Please set mh after setting a texture.');
            }
        }

        get rect() {
            return (this.texture === this.stage.rectangleTexture);
        }

        set rect(v) {
            if (v) {
                this.texture = this.stage.rectangleTexture;
            } else {
                this.texture = null;
            }
        }

        enableTextTexture() {
            if (!this.texture || !(this.texture instanceof TextTexture)) {
                this.texture = new TextTexture(this.stage);

                if (!this.texture.w && !this.texture.h) {
                    // Inherit dimensions from view.
                    // This allows userland to set dimensions of the View and then later specify the text.
                    this.texture.w = this.w;
                    this.texture.h = this.h;
                }
            }
            return this.texture;
        }

        get text() {
            if (this.texture && (this.texture instanceof TextTexture)) {
                return this.texture;
            } else {
                return null;
            }
        }

        set text(v) {
            if (!this.texture || !(this.texture instanceof TextTexture)) {
                this.enableTextTexture();
            }
            if (Utils.isString(v)) {
                this.texture.text = v;
            } else {
                this.texture.patch(v);
            }
        }

        set onUpdate(f) {
            this.__core.onUpdate = f;
        }

        set onAfterCalcs(f) {
            this.__core.onAfterCalcs = f;
        }

        set onAfterUpdate(f) {
            this.__core.onAfterUpdate = f;
        }

        forceUpdate() {
            // Make sure that the update loop is run.
            this.__core._setHasUpdates();
        }

        get shader() {
            return this.__core.shader;
        }

        set shader(v) {
            const shader = Shader.create(this.stage, v);

            if (shader) {
                if (this.__enabled && this.__core.shader) {
                    this.__core.shader.removeView(this);
                }

                this.__core.shader = shader;

                if (this.__enabled && this.__core.shader) {
                    this.__core.shader.addView(this);
                }
            }
        }

        _hasTexturizer() {
            return !!this.__core._texturizer;
        }

        get renderToTexture() {
            return this.rtt
        }

        set renderToTexture(v) {
            this.rtt = v;
        }

        get rtt() {
            return this._hasTexturizer() && this.texturizer.enabled;
        }

        set rtt(v) {
            this.texturizer.enabled = v;
        }

        get rttLazy() {
            return this._hasTexturizer() && this.texturizer.lazy;
        }

        set rttLazy(v) {
            this.texturizer.lazy = v;
        }

        get renderOffscreen() {
            return this._hasTexturizer() && this.texturizer.renderOffscreen;
        }

        set renderOffscreen(v) {
            this.texturizer.renderOffscreen = v;
        }

        get colorizeResultTexture() {
            return this._hasTexturizer() && this.texturizer.colorize;
        }

        set colorizeResultTexture(v) {
            this.texturizer.colorize = v;
        }

        getTexture() {
            return this.texturizer._getTextureSource();
        }

        get texturizer() {
            return this.__core.texturizer;
        }

        patch(settings, createMode = false) {
            settings = Base.preparePatchSettings(settings, this.stage.getPatchId());

            let paths = Object.keys(settings);

            if (settings.hasOwnProperty("__create")) {
                createMode = settings["__create"];
            }

            for (let i = 0, n = paths.length; i < n; i++) {
                let path = paths[i];
                const v = settings[path];

                let pointIdx = path.indexOf(".");
                let arrowIdx = path.indexOf(">");
                if (arrowIdx === -1 && pointIdx === -1) {
                    const firstCharCode = path.charCodeAt(0);
                    if (Utils.isUcChar(firstCharCode)) {
                        // Ref.
                        const child = this.getByRef(path);
                        if (!child) {
                            if (v !== undefined) {
                                let subCreateMode = createMode;
                                if (Utils.isObjectLiteral(v)) {
                                    if (v.hasOwnProperty("__create")) {
                                        subCreateMode = v.__create;
                                    }
                                }

                                if (subCreateMode === null) ; else if (subCreateMode === true) {
                                    // Add to list immediately.
                                    let c;
                                    if (Utils.isObjectLiteral(v)) {
                                        // Catch this case to capture createMode flag.
                                        c = this.childList.createItem(v);
                                        c.patch(v, subCreateMode);
                                    } else if (Utils.isObject(v)) {
                                        c = v;
                                    }
                                    if (c.isView) {
                                        c.ref = path;
                                    }

                                    this.childList.a(c);
                                } else {
                                    this._throwError("Can't find path: " + path);
                                }
                            }
                        } else {
                            if (v === undefined) {
                                if (child.parent) {
                                    child.parent.childList.remove(child);
                                }
                            } else if (Utils.isObjectLiteral(v)) {
                                child.patch(v, createMode);
                            } else if (v.isView) {
                                // Replace view by new view.
                                v.ref = path;
                                this.childList.replace(v, child);
                            } else {
                                this._throwError("Unexpected value for path: " + path);
                            }
                        }
                    } else {
                        // Property.
                        Base.patchObjectProperty(this, path, v);
                    }
                } else {
                    // Select path.
                    const views = this.select(path);
                    if (v === undefined) {
                        for (let i = 0, n = views.length; i < n; i++) {
                            if (views[i].parent) {
                                views[i].parent.childList.remove(views[i]);
                            }
                        }
                    } else if (Utils.isObjectLiteral(v)) {
                        // Recursive path.
                        for (let i = 0, n = views.length; i < n; i++) {
                            views[i].patch(v, createMode);
                        }
                    } else {
                        this._throwError("Unexpected value for path: " + path);
                    }
                }
            }
        }

        _throwError(message) {
            throw new Error(this.constructor.name + " (" + this.getLocationString() + "): " + message);
        }


        animation(settings) {
            return this.stage.animations.createAnimation(this, settings);
        }

        transition(property, settings = null) {
            if (settings === null) {
                return this._getTransition(property);
            } else {
                this._setTransition(property, settings);
                // We do not create/return the transition, because it would undo the 'lazy transition creation' optimization.
                return null;
            }
        }

        set transitions(object) {
            object = this.stage.preparePatchSettings(object);
            let keys = Object.keys(object);
            keys.forEach(property => {
                this.transition(property, object[property]);
            });
        }

        set smooth(object) {
            object = this.stage.preparePatchSettings(object);
            let keys = Object.keys(object);
            keys.forEach(property => {
                let value = object[property];
                if (Array.isArray(value)) {
                    this.setSmooth(property, value[0], value[1]);
                } else {
                    this.setSmooth(property, value);
                }
            });
        }

        fastForward(property) {
            if (this._transitions) {
                let t = this._transitions[property];
                if (t && t.isTransition) {
                    t.finish();
                }
            }
        }

        _getTransition(property) {
            if (!this._transitions) {
                this._transitions = {};
            }
            let t = this._transitions[property];
            if (!t) {
                // Create default transition.
                t = new Transition(this.stage.transitions, this.stage.transitions.defaultTransitionSettings, this, property);
            } else if (t.isTransitionSettings) {
                // Upgrade to 'real' transition.
                t = new Transition(
                    this.stage.transitions,
                    t,
                    this,
                    property
                );
            }
            this._transitions[property] = t;
            return t;
        }

        _setTransition(property, settings) {
            if (!settings) {
                this._removeTransition(property);
            } else {
                if (Utils.isObjectLiteral(settings)) {
                    // Convert plain object to proper settings object.
                    settings = this.stage.transitions.createSettings(settings);
                }

                if (!this._transitions) {
                    this._transitions = {};
                }

                let current = this._transitions[property];
                if (current && current.isTransition) {
                    // Runtime settings change.
                    current.settings = settings;
                    return current;
                } else {
                    // Initially, only set the settings and upgrade to a 'real' transition when it is used.
                    this._transitions[property] = settings;
                }
            }
        }

        _removeTransition(property) {
            if (this._transitions) {
                delete this._transitions[property];
            }
        }

        getSmooth(property, v) {
            let t = this._getTransition(property);
            if (t && t.isAttached()) {
                return t.targetValue;
            } else {
                return v;
            }
        }

        setSmooth(property, v, settings) {
            if (settings) {
                this._setTransition(property, settings);
            }
            let t = this._getTransition(property);
            t.start(v);
            return t;
        }

        get flex() {
            return this.__core.flex;
        }

        set flex(v) {
            this.__core.flex = v;
        }

        get flexItem() {
            return this.__core.flexItem;
        }

        set flexItem(v) {
            this.__core.flexItem = v;
        }

        static isColorProperty(property) {
            return property.indexOf("color") >= 0;
        }

        static getMerger(property) {
            if (View.isColorProperty(property)) {
                return StageUtils.mergeColors;
            } else {
                return StageUtils.mergeNumbers;
            }
        }
    }

    // This gives a slight performance benefit compared to extending EventEmitter.
    EventEmitter.addAsMixin(View);

    View.prototype.isView = 1;

    View.id = 1;

    // Getters reused when referencing view (subobject) properties by a property path, as used in a transition or animation ('x', 'texture.x', etc).
    View.PROP_GETTERS = new Map();

    // Setters reused when referencing view (subobject) properties by a property path, as used in a transition or animation ('x', 'texture.x', etc).
    View.PROP_SETTERS = new Map();

    class Component extends View {

        constructor(stage, properties) {
            super(stage);

            // Encapsulate tags to prevent leaking.
            this.tagRoot = true;

            if (Utils.isObjectLiteral(properties)) {
                Object.assign(this, properties);
            }

            // Start with root state;
            this.__state = "";

            this.__initialized = false;
            this.__firstActive = false;
            this.__firstEnable = false;

            this.__signals = undefined;

            this.__passSignals = undefined;

            this.__construct();

            // Quick-apply template.
            const func = this.constructor.getTemplateFunc(stage);
            func.f(this, func.a);

        }

        /**
         * Returns a high-performance template patcher.
         */
        static getTemplateFunc(stage) {
            // We need a different template function per patch id.
            const patchId = stage.getPatchId();
            const name = "_templateFunc_" + patchId;

            // Be careful with class-based static inheritance.
            const hasName = '__has' + name;
            if (this[hasName] !== this) {
                this[hasName] = this;
                this[name] = this.parseTemplate(patchId ? "_$" + patchId : patchId, this._template());
            }
            return this[name];
        }

        static parseTemplate(patchId, obj) {
            const context = {
                patchId: patchId,
                loc: [],
                store: [],
                rid: 0
            };

            obj = Base._preparePatchSettings(obj, patchId);
            this.parseTemplateRec(obj, context, "view");

            const code = context.loc.join(";\n");
            const f = new Function("view", "store", code);
            return {f:f, a:context.store}
        }

        static parseTemplateRec(obj, context, cursor) {
            const store = context.store;
            const loc = context.loc;
            const keys = Object.keys(obj);
            keys.forEach(key => {
                let value = obj[key];
                if (Utils.isUcChar(key.charCodeAt(0))) {
                    // Value must be expanded as well.
                    if (Utils.isObjectLiteral(value)) {
                        value = Base._preparePatchSettings(value, context.patchId);

                        // Ref.
                        const childCursor = `r${key.replace(/[^a-z0-9]/gi, "") + context.rid}`;
                        let type = value.type ? value.type : View;
                        if (type === "View") {
                            loc.push(`const ${childCursor} = view.stage.createView()`);
                        } else {
                            store.push(type);
                            loc.push(`const ${childCursor} = new store[${store.length - 1}](${cursor}.stage)`);
                        }
                        loc.push(`${childCursor}.ref = "${key}"`);
                        context.rid++;

                        // Enter sub.
                        this.parseTemplateRec(value, context, childCursor);

                        loc.push(`${cursor}.childList.add(${childCursor})`);
                    } else if (Utils.isObject(value)) {
                        // Dynamic assignment.
                        store.push(value);
                        loc.push(`${cursor}.childList.add(store[${store.length - 1}])`);
                    }
                } else {
                    if (key === "text") {
                        const propKey = cursor + "__text";
                        loc.push(`${propKey} = ${cursor}.enableTextTexture()`);
                        this.parseTemplatePropRec(value, context, propKey);
                    } else if (key === "texture" && Utils.isObjectLiteral(value)) {
                        const propKey = cursor + "__texture";
                        const type = value.type;
                        if (type) {
                            store.push(type);
                            loc.push(`${propKey} = new store[${store.length - 1}](${cursor}.stage)`);
                            this.parseTemplatePropRec(value, context, propKey);
                            loc.push(`${cursor}["${key}"] = ${propKey}`);
                        } else {
                            loc.push(`${propKey} = ${cursor}.texture`);
                            this.parseTemplatePropRec(value, context, propKey);
                        }
                    } else {
                        // Property;
                        if (Utils.isNumber(value)) {
                            loc.push(`${cursor}["${key}"] = ${value}`);
                        } else if (Utils.isBoolean(value)) {
                            loc.push(`${cursor}["${key}"] = ${value ? "true" : "false"}`);
                        } else if (Utils.isObject(value) || Array.isArray(value)) {
                            // Dynamic assignment.
                            // Because literal objects may contain dynamics, we store the full object.
                            store.push(value);
                            loc.push(`${cursor}["${key}"] = store[${store.length - 1}]`);
                        } else {
                            // String etc.
                            loc.push(`${cursor}["${key}"] = ${JSON.stringify(value)}`);
                        }
                    }
                }
            });
        }

        static parseTemplatePropRec(obj, context, cursor) {
            const store = context.store;
            const loc = context.loc;
            const keys = Object.keys(obj);
            keys.forEach(key => {
                if (key !== "type") {
                    const value = obj[key];
                    if (Utils.isNumber(value)) {
                        loc.push(`${cursor}["${key}"] = ${value}`);
                    } else if (Utils.isBoolean(value)) {
                        loc.push(`${cursor}["${key}"] = ${value ? "true" : "false"}`);
                    } else if (Utils.isObject(value) || Array.isArray(value)) {
                        // Dynamic assignment.
                        // Because literal objects may contain dynamics, we store the full object.
                        store.push(value);
                        loc.push(`${cursor}["${key}"] = store[${store.length - 1}]`);
                    } else {
                        // String etc.
                        loc.push(`${cursor}["${key}"] = ${JSON.stringify(value)}`);
                    }
                }
            });
        }

        _onSetup() {
            if (!this.__initialized) {
                this.fire('_setup');
            }
        }

        _onAttach() {
            if (!this.__initialized) {
                this.__init();
                this.__initialized = true;
            }

            this.fire('_attach');
        }

        _onDetach() {
            this.fire('_detach');
        }

        _onEnabled() {
            if (!this.__firstEnable) {
                this.fire('_firstEnable');
                this.__firstEnable = true;
            }

            this.fire('_enable');
        }

        _onDisabled() {
            this.fire('_disable');
        }

        _onActive() {
            if (!this.__firstActive) {
                this.fire('_firstActive');
                this.__firstActive = true;
            }

            this.fire('_active');
        }

        _onInactive() {
            this.fire('_inactive');
        }

        get application() {
            return this.stage.application;
        }

        get state() {
            return this.__state;
        }

        __construct() {
            this.fire('_construct');
        }

        __init() {
            this.fire('_init');
        }

        __focus(newTarget, prevTarget) {
            this.fire('_focus', {newTarget: newTarget, prevTarget: prevTarget});
        }

        __unfocus(newTarget) {
            this.fire('_unfocus', {newTarget: newTarget});
        }

        __focusBranch(target) {
            this.fire('_focusBranch', {target: target});
        }

        __unfocusBranch(target, newTarget) {
            this.fire('_unfocusBranch', {target:target, newTarget:newTarget});
        }

        __focusChange(target, newTarget) {
            this.fire('_focusChange', {target:target, newTarget:newTarget});
        }

        _getFocused() {
            // Override to delegate focus to child components.
            return this;
        }

        _setFocusSettings(settings) {
            // Override to add custom settings. See Application._handleFocusSettings().
        }

        _getStates() {
            // Be careful with class-based static inheritance.
            if (this.constructor.__hasStates !== this.constructor) {
                this.constructor.__hasStates = this.constructor;

                this.constructor.__states = this.constructor._states();
                if (!Utils.isObjectLiteral(this.constructor.__states)) {
                    this._throwError("States object empty");
                }
            }

            return this.constructor.__states;
        }

        static _states() {
            return {}
        }

        _getTemplate() {
            if (this.constructor.__hasTemplate !== this.constructor) {
                this.constructor.__hasTemplate = this.constructor;

                this.constructor.__template = this.constructor._template();
                if (!Utils.isObjectLiteral(this.constructor.__template)) {
                    this._throwError("Template object empty");
                }
            }
            return this.constructor.__template;
        }

        static _template() {
            return {}
        }

        hasFinalFocus() {
            let path = this.application._focusPath;
            return path && path.length && path[path.length - 1] === this;
        }

        hasFocus() {
            let path = this.application._focusPath;
            return path && (path.indexOf(this) >= 0);
        }

        get cparent() {
            return Component.getParent(this);
        }

        seekAncestorByType(type) {
            let c = this.cparent;
            while(c) {
                if (c.constructor === type) {
                    return c;
                }
                c = c.cparent;
            }
        }

        getSharedAncestorComponent(view) {
            let ancestor = this.getSharedAncestor(view);
            while(ancestor && !ancestor.isComponent) {
                ancestor = ancestor.parent;
            }
            return ancestor;
        }

        /**
         * Fires the specified event on the state machine.
         * @param event
         * @param {object} args
         * @return {boolean}
         *   True iff the state machine could find and execute a handler for the event (event and condition matched).
         */
        fire(event, args = {}) {
            if (!Utils.isObjectLiteral(args)) {
                this._throwError("Fire: args must be object");
            }
            return this.application.stateManager.fire(this, event, args);
        }

        /**
         * Signals the parent of the specified event.
         * A parent/ancestor that wishes to handle the signal should set the 'signals' property on this component.
         * @param {string} event
         * @param {object} args
         * @param {boolean} bubble
         */
        signal(event, args = {}, bubble = false) {
            if (!Utils.isObjectLiteral(args)) {
                this._throwError("Signal: args must be object");
            }

            if (!args._source) {
                args = Object.assign({_source: this}, args);
            }

            if (this.__signals && this.cparent) {
                let fireEvent = this.__signals[event];
                if (fireEvent === false) {
                    // Ignore event, even when bubbling.
                    return;
                }
                if (fireEvent) {
                    if (fireEvent === true) {
                        fireEvent = event;
                    }

                    const handled = this.cparent.fire(fireEvent, args);
                    if (handled) return;
                }
            }

            let passSignal = (this.__passSignals && this.__passSignals[event]);
            const cparent = this.cparent;
            if (cparent && (cparent._passSignals || passSignal || bubble)) {
                // Bubble up.
                if (passSignal && passSignal !== true) {
                    // Replace signal name.
                    event = passSignal;
                }
                this.cparent.signal(event, args, bubble);
            }
        }

        get signals() {
            return this.__signals;
        }

        set signals(v) {
            if (!Utils.isObjectLiteral(v)) {
                this._throwError("Signals: specify an object with signal-to-fire mappings");
            }
            this.__signals = Object.assign(this.__signals || {}, v);
        }

        get passSignals() {
            return this.__passSignals || {};
        }

        set passSignals(v) {
            this.__passSignals = Object.assign(this.__passSignals || {}, v);
        }

        get _passSignals() {
            return false;
        }

        /**
         * Fires the specified event downwards.
         * A descendant that wishes to handle the signal should set the '_broadcasts' property on this component.
         * @warn handling a broadcast will stop it from propagating; to continue propagation return false from the state
         * event handler.
         */
        broadcast(event, args = {}) {
            if (!Utils.isObjectLiteral(args)) {
                this._throwError("Broadcast: args must be object");
            }

            if (!args._source) {
                args = Object.assign({_source: this}, args);
            }

            if (this.__broadcasts) {
                let fireEvent = this.__broadcasts[event];
                if (fireEvent === false) {
                    return;
                }
                if (fireEvent) {
                    if (fireEvent === true) {
                        fireEvent = event;
                    }

                    const handled = this.fire(fireEvent, args);
                    if (handled) {
                        // Skip propagation
                        return;
                    }
                }
            }

            // Propagate down.
            const subs = [];
            Component.collectSubComponents(subs, this);
            for (let i = 0, n = subs.length; i < n; i++) {
                subs[i].broadcast(event, args);
            }
        }

        static collectSubComponents(subs, view) {
            if (view.hasChildren()) {
                // We must use the private property because direct children access may be disallowed.
                const childList = view.__childList;
                for (let i = 0, n = childList.length; i < n; i++) {
                    const child = childList.getAt(i);
                    if (child.isComponent) {
                        subs.push(child);
                    } else {
                        Component.collectSubComponents(subs, child);
                    }
                }
            }
        }

        get broadcasts() {
            return this.__broadcasts;
        }

        set broadcasts(v) {
            if (!Utils.isObjectLiteral(v)) {
                this._throwError("Broadcasts: specify an object with broadcast-to-fire mappings");
            }
            this.__broadcasts = Object.assign(this.__broadcasts || {}, v);
        }

        static getComponent(view) {
            let parent = view;
            while (parent && !parent.isComponent) {
                parent = parent.parent;
            }
            return parent;
        }

        static getParent(view) {
            return Component.getComponent(view.parent);
        }

    }

    Component.prototype.isComponent = true;

    class CoreQuadList {

        constructor(ctx) {

            this.ctx = ctx;

            this.quadTextures = [];

            this.quadViews = [];
        }

        get length() {
            return this.quadTextures.length;
        }

        reset() {
            this.quadTextures = [];
            this.quadViews = [];
            this.dataLength = 0;
        }

        getView(index) {
            return this.quadViews[index]._view;
        }

        getViewCore(index) {
            return this.quadViews[index];
        }

        getTexture(index) {
            return this.quadTextures[index];
        }

        getTextureWidth(index) {
            let nativeTexture = this.quadTextures[index];
            if (nativeTexture.w) {
                // Render texture;
                return nativeTexture.w;
            } else {
                return this.quadViews[index]._displayedTextureSource.w;
            }
        }

        getTextureHeight(index) {
            let nativeTexture = this.quadTextures[index];
            if (nativeTexture.h) {
                // Render texture;
                return nativeTexture.h;
            } else {
                return this.quadViews[index]._displayedTextureSource.h;
            }
        }

    }

    class WebGLCoreQuadList extends CoreQuadList {

        constructor(ctx) {
            super(ctx);

            // Allocate a fairly big chunk of memory that should be enough to support ~100000 (default) quads.
            // We do not (want to) handle memory overflow.
            const byteSize = ctx.stage.getOption('bufferMemory');

            this.dataLength = 0;

            this.data = new ArrayBuffer(byteSize);
            this.floats = new Float32Array(this.data);
            this.uints = new Uint32Array(this.data);

            // Set up first quad to the identity quad (reused for filters).
            let f = this.floats;
            let u = this.uints;
            f[0] = -1;
            f[1] = -1;
            f[2] = 0;
            f[3] = 0;
            u[4] = 0xFFFFFFFF;
            f[5] = 1;
            f[6] = -1;
            f[7] = 1;
            f[8] = 0;
            u[9] = 0xFFFFFFFF;
            f[10] = 1;
            f[11] = 1;
            f[12] = 1;
            f[13] = 1;
            u[14] = 0xFFFFFFFF;
            f[15] = -1;
            f[16] = 1;
            f[17] = 0;
            f[18] = 1;
            u[19] = 0xFFFFFFFF;
        }

        getAttribsDataByteOffset(index) {
            // Where this quad can be found in the attribs buffer.
            return index * 80 + 80;
        }

        getQuadContents() {
            // Debug: log contents of quad buffer.
            let floats = this.floats;
            let uints = this.uints;
            let lines = [];
            for (let i = 1; i <= this.length; i++) {
                let str = 'entry ' + i + ': ';
                for (let j = 0; j < 4; j++) {
                    let b = i * 20 + j * 4;
                    str += floats[b] + ',' + floats[b+1] + ':' + floats[b+2] + ',' + floats[b+3] + '[' + uints[b+4].toString(16) + '] ';
                }
                lines.push(str);
            }

            return lines;
        }


    }

    class CoreQuadOperation {

        constructor(ctx, shader, shaderOwner, renderTextureInfo, scissor, index) {

            this.ctx = ctx;
            this.shader = shader;
            this.shaderOwner = shaderOwner;
            this.renderTextureInfo = renderTextureInfo;
            this.scissor = scissor;
            this.index = index;
            this.length = 0;

        }

        get quads() {
            return this.ctx.renderState.quads;
        }

        getTexture(index) {
            return this.quads.getTexture(this.index + index);
        }

        getViewCore(index) {
            return this.quads.getViewCore(this.index + index);
        }

        getView(index) {
            return this.quads.getView(this.index + index);
        }

        getViewWidth(index) {
            return this.getView(index).renderWidth;
        }

        getViewHeight(index) {
            return this.getView(index).renderHeight;
        }

        getTextureWidth(index) {
            return this.quads.getTextureWidth(this.index + index);
        }

        getTextureHeight(index) {
            return this.quads.getTextureHeight(this.index + index);
        }

        getRenderWidth() {
            if (this.renderTextureInfo) {
                return this.renderTextureInfo.w;
            } else {
                return this.ctx.stage.w;
            }
        }

        getRenderHeight() {
            if (this.renderTextureInfo) {
                return this.renderTextureInfo.h;
            } else {
                return this.ctx.stage.h;
            }
        }

    }

    class WebGLCoreQuadOperation extends CoreQuadOperation {

        constructor(ctx, shader, shaderOwner, renderTextureInfo, scissor, index) {
            super(ctx, shader, shaderOwner, renderTextureInfo, scissor, index);

            this.extraAttribsDataByteOffset = 0;
        }

        getAttribsDataByteOffset(index) {
            // Where this quad can be found in the attribs buffer.
            return this.quads.getAttribsDataByteOffset(this.index + index);
        }

        /**
         * Returns the relative pixel coordinates in the shader owner to gl position coordinates in the render texture.
         * @param x
         * @param y
         * @return {number[]}
         */
        getNormalRenderTextureCoords(x, y) {
            let coords = this.shaderOwner.getRenderTextureCoords(x, y);
            coords[0] /= this.getRenderWidth();
            coords[1] /= this.getRenderHeight();
            coords[0] = coords[0] * 2 - 1;
            coords[1] = 1 - coords[1] * 2;
            return coords;
        }

        getProjection() {
            if (this.renderTextureInfo === null) {
                return this.ctx.renderExec._projection;
            } else {
                return this.renderTextureInfo.nativeTexture.projection;
            }
        }

    }

    class CoreRenderExecutor {

        constructor(ctx) {
            this.ctx = ctx;

            this.renderState = ctx.renderState;

            this.gl = this.ctx.stage.gl;
        }

        destroy() {
        }

        _reset() {
            this._bindRenderTexture(null);
            this._setScissor(null);
            this._clearRenderTexture();
        }

        execute() {
            this._reset();

            let qops = this.renderState.quadOperations;

            let i = 0, n = qops.length;
            while (i < n) {
                this._processQuadOperation(qops[i]);
                i++;
            }
        }

        _processQuadOperation(quadOperation) {
            if (quadOperation.renderTextureInfo && quadOperation.renderTextureInfo.ignore) {
                // Ignore quad operations when we are 're-using' another texture as the render texture result.
                return;
            }

            this._setupQuadOperation(quadOperation);
            this._execQuadOperation(quadOperation);

        }

        _setupQuadOperation(quadOperation) {
        }

        _execQuadOperation(op) {
            // Set render texture.
            let nativeTexture = op.renderTextureInfo ? op.renderTextureInfo.nativeTexture : null;

            if (this._renderTexture !== nativeTexture) {
                this._bindRenderTexture(nativeTexture);
            }

            if (op.renderTextureInfo && !op.renderTextureInfo.cleared) {
                this._setScissor(null);
                this._clearRenderTexture();
                op.renderTextureInfo.cleared = true;
                this._setScissor(op.scissor);
            } else {
                this._setScissor(op.scissor);
            }

            this._renderQuadOperation(op);
        }

        _renderQuadOperation(op) {
        }

        _bindRenderTexture(renderTexture) {
            this._renderTexture = renderTexture;
        }

        _clearRenderTexture(renderTexture) {
        }

        _setScissor(area) {
        }

    }

    class WebGLCoreRenderExecutor extends CoreRenderExecutor {

        constructor(ctx) {
            super(ctx);

            this.gl = this.ctx.stage.gl;

            this.init();
        }

        init() {
            let gl = this.gl;

            // Create new sharable buffer for params.
            this._attribsBuffer = gl.createBuffer();

            let maxQuads = Math.floor(this.renderState.quads.data.byteLength / 80);

            // Init webgl arrays.
            let allIndices = new Uint16Array(maxQuads * 6);

            // fill the indices with the quads to draw.
            for (let i = 0, j = 0; i < maxQuads; i += 6, j += 4) {
                allIndices[i] = j;
                allIndices[i + 1] = j + 1;
                allIndices[i + 2] = j + 2;
                allIndices[i + 3] = j;
                allIndices[i + 4] = j + 2;
                allIndices[i + 5] = j + 3;
            }

            // The quads buffer can be (re)used to draw a range of quads.
            this._quadsBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._quadsBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, allIndices, gl.STATIC_DRAW);

            // The matrix that causes the [0,0 - W,H] box to map to [-1,-1 - 1,1] in the end results.
            this._projection = new Float32Array([2/this.ctx.stage.coordsWidth, -2/this.ctx.stage.coordsHeight]);

        }

        destroy() {
            super.destroy();
            this.gl.deleteBuffer(this._attribsBuffer);
            this.gl.deleteBuffer(this._quadsBuffer);
        }

        _reset() {
            super._reset();

            let gl = this.gl;
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            gl.enable(gl.BLEND);
            gl.disable(gl.DEPTH_TEST);

            this._stopShaderProgram();
            this._setupBuffers();
        }

        _setupBuffers() {
            let gl = this.gl;
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._quadsBuffer);
            let view = new DataView(this.renderState.quads.data, 0, this.renderState.quads.dataLength);
            gl.bindBuffer(gl.ARRAY_BUFFER, this._attribsBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, view, gl.DYNAMIC_DRAW);
        }

        _setupQuadOperation(quadOperation) {
            super._setupQuadOperation(quadOperation);
            this._useShaderProgram(quadOperation.shader, quadOperation);
        }

        _renderQuadOperation(op) {
            let shader = op.shader;

            if (op.length || op.shader.addEmpty()) {
                shader.beforeDraw(op);
                shader.draw(op);
                shader.afterDraw(op);
            }
        }

        /**
         * @param {WebGLShader} shader;
         * @param {CoreQuadOperation} operation;
         */
        _useShaderProgram(shader, operation) {
            if (!shader.hasSameProgram(this._currentShaderProgram)) {
                if (this._currentShaderProgram) {
                    this._currentShaderProgram.stopProgram();
                }
                shader.useProgram();
                this._currentShaderProgram = shader;
            }
            shader.setupUniforms(operation);
        }

        _stopShaderProgram() {
            if (this._currentShaderProgram) {
                // The currently used shader program should be stopped gracefully.
                this._currentShaderProgram.stopProgram();
                this._currentShaderProgram = null;
            }
        }

        _bindRenderTexture(renderTexture) {
            super._bindRenderTexture(renderTexture);

            let gl = this.gl;
            if (!this._renderTexture) {
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                gl.viewport(0,0,this.ctx.stage.w,this.ctx.stage.h);
            } else {
                gl.bindFramebuffer(gl.FRAMEBUFFER, this._renderTexture.framebuffer);
                gl.viewport(0,0,this._renderTexture.w, this._renderTexture.h);
            }
        }

        _clearRenderTexture() {
            super._clearRenderTexture();
            let gl = this.gl;
            if (!this._renderTexture) {
                let glClearColor = this.ctx.stage.getClearColor();
                if (glClearColor) {
                    gl.clearColor(glClearColor[0] * glClearColor[3], glClearColor[1] * glClearColor[3], glClearColor[2] * glClearColor[3], glClearColor[3]);
                    gl.clear(gl.COLOR_BUFFER_BIT);
                }
            } else {
                // Clear texture.
                gl.clearColor(0, 0, 0, 0);
                gl.clear(gl.COLOR_BUFFER_BIT);
            }
        }

        _setScissor(area) {
            super._setScissor(area);

            if (this._scissor === area) {
                return;
            }
            this._scissor = area;

            let gl = this.gl;
            if (!area) {
                gl.disable(gl.SCISSOR_TEST);
            } else {
                gl.enable(gl.SCISSOR_TEST);
                let precision = this.ctx.stage.getRenderPrecision();
                let y = area[1];
                if (this._renderTexture === null) {
                    // Flip.
                    y = (this.ctx.stage.h / precision - (area[1] + area[3]));
                }
                gl.scissor(Math.round(area[0] * precision), Math.round(y * precision), Math.round(area[2] * precision), Math.round(area[3] * precision));
            }
        }

    }

    class CoreRenderState {

        constructor(ctx) {
            this.ctx = ctx;

            this.stage = ctx.stage;

            this.defaultShader = this.stage.renderer.getDefaultShader(ctx);

            this.renderer = ctx.stage.renderer;

            this.quads = this.renderer.createCoreQuadList(ctx);

        }

        reset() {
            this._renderTextureInfo = null;

            this._scissor = null;

            this._shader = null;

            this._shaderOwner = null;

            this._realShader = null;

            this._check = false;

            this.quadOperations = [];

            this._texturizer = null;

            this._texturizerTemporary = false;

            this._quadOperation = null;

            this.quads.reset();

            this._temporaryTexturizers = [];
            
            this._isCachingTexturizer = false;

        }

        get length() {
            return this.quads.quadTextures.length;
        }

        setShader(shader, owner) {
            if (this._shaderOwner !== owner || this._realShader !== shader) {
                // Same shader owner: active shader is also the same.
                // Prevent any shader usage to save performance.

                this._realShader = shader;

                if (shader.useDefault()) {
                    // Use the default shader when possible to prevent unnecessary program changes.
                    shader = this.defaultShader;
                }
                if (this._shader !== shader || this._shaderOwner !== owner) {
                    this._shader = shader;
                    this._shaderOwner = owner;
                    this._check = true;
                }
            }
        }

        get renderTextureInfo() {
            return this._renderTextureInfo;
        }

        setScissor(area) {
            if (this._scissor !== area) {
                if (area) {
                    this._scissor = area;
                } else {
                    this._scissor = null;
                }
                this._check = true;
            }
        }

        getScissor() {
            return this._scissor;
        }

        setRenderTextureInfo(renderTextureInfo) {
            if (this._renderTextureInfo !== renderTextureInfo) {
                this._renderTextureInfo = renderTextureInfo;
                this._scissor = null;
                this._check = true;
            }
        }

        /**
         * Sets the texturizer to be drawn during subsequent addQuads.
         * @param {ViewTexturizer} texturizer
         */
        setTexturizer(texturizer, cache = false) {
            this._texturizer = texturizer;
            this._cacheTexturizer = cache;
        }

        set isCachingTexturizer(v) {
            this._isCachingTexturizer = v;
        }

        get isCachingTexturizer() {
            return this._isCachingTexturizer;
        }

        addQuad(viewCore) {
            if (!this._quadOperation) {
                this._createQuadOperation();
            } else if (this._check && this._hasChanges()) {
                this._finishQuadOperation();
                this._check = false;
            }

            let nativeTexture = null;
            if (this._texturizer) {
                nativeTexture = this._texturizer.getResultTexture();

                if (!this._cacheTexturizer) {
                    // We can release the temporary texture immediately after finalizing this quad operation.
                    this._temporaryTexturizers.push(this._texturizer);
                }
            }

            if (!nativeTexture) {
                nativeTexture = viewCore._displayedTextureSource.nativeTexture;
            }

            if (this._renderTextureInfo) {
                if (this._shader === this.defaultShader && this._renderTextureInfo.empty) {
                    // The texture might be reusable under some conditions. We will check them in ViewCore.renderer.
                    this._renderTextureInfo.nativeTexture = nativeTexture;
                    this._renderTextureInfo.offset = this.length;
                } else {
                    // It is not possible to reuse another texture when there is more than one quad.
                    this._renderTextureInfo.nativeTexture = null;
                }
                this._renderTextureInfo.empty = false;
            }

            this.quads.quadTextures.push(nativeTexture);
            this.quads.quadViews.push(viewCore);

            this._quadOperation.length++;

            this.renderer.addQuad(this, this.quads, this.length - 1);
        }

        finishedRenderTexture() {
            if (this._renderTextureInfo.nativeTexture) {
                // There was only one texture drawn in this render texture.
                // Check if we can reuse it so that we can optimize out an unnecessary render texture operation.
                // (it should exactly span this render texture).
                if (!this._isRenderTextureReusable()) {
                    this._renderTextureInfo.nativeTexture = null;
                }
            }
        }

        _isRenderTextureReusable() {
            const offset = this._renderTextureInfo.offset;
            return (this.quads.quadTextures[offset].w === this._renderTextureInfo.w) &&
                (this.quads.quadTextures[offset].h === this._renderTextureInfo.h) &&
                this.renderer.isRenderTextureReusable(this, this._renderTextureInfo)
        }

        _hasChanges() {
            let q = this._quadOperation;
            if (this._shader !== q.shader) return true;
            if (this._shaderOwner !== q.shaderOwner) return true;
            if (this._renderTextureInfo !== q.renderTextureInfo) return true;
            if (this._scissor !== q.scissor) {
                if ((this._scissor[0] !== q.scissor[0]) || (this._scissor[1] !== q.scissor[1]) || (this._scissor[2] !== q.scissor[2]) || (this._scissor[3] !== q.scissor[3])) {
                    return true;
                }
            }

            return false;
        }

        _finishQuadOperation(create = true) {
            if (this._quadOperation) {
                if (this._quadOperation.length || this._shader.addEmpty()) {
                    if (!this._quadOperation.scissor || ((this._quadOperation.scissor[2] > 0) && (this._quadOperation.scissor[3] > 0))) {
                        // Ignore empty clipping regions.
                        this.quadOperations.push(this._quadOperation);
                    }
                }

                if (this._temporaryTexturizers.length) {
                    for (let i = 0, n = this._temporaryTexturizers.length; i < n; i++) {
                        // We can now reuse these render-to-textures in subsequent stages.
                        // Huge performance benefit when filtering (fast blur).
                        this._temporaryTexturizers[i].releaseRenderTexture();
                    }
                    this._temporaryTexturizers = [];
                }

                this._quadOperation = null;
            }

            if (create) {
                this._createQuadOperation();
            }
        }

        _createQuadOperation() {
            this._quadOperation = this.renderer.createCoreQuadOperation(
                this.ctx,
                this._shader,
                this._shaderOwner,
                this._renderTextureInfo,
                this._scissor,
                this.length
            );
            this._check = false;
        }

        finish() {
            if (this._quadOperation) {
                // Add remaining.
                this._finishQuadOperation(false);
            }

            this.renderer.finishRenderState(this);
        }

    }

    /**
     * Base functionality for shader setup/destroy.
     */
    class WebGLShaderProgram {

        constructor(vertexShaderSource, fragmentShaderSource) {

            this.vertexShaderSource = vertexShaderSource;
            this.fragmentShaderSource = fragmentShaderSource;

            this._program = null;

            this._uniformLocations = new Map();
            this._attributeLocations = new Map();

            this._currentUniformValues = {};
        }

        compile(gl) {
            if (this._program) return;

            this.gl = gl;

            this._program = gl.createProgram();

            let glVertShader = this._glCompile(gl.VERTEX_SHADER, this.vertexShaderSource);
            let glFragShader = this._glCompile(gl.FRAGMENT_SHADER, this.fragmentShaderSource);

            gl.attachShader(this._program, glVertShader);
            gl.attachShader(this._program, glFragShader);
            gl.linkProgram(this._program);

            // if linking fails, then log and cleanup
            if (!gl.getProgramParameter(this._program, gl.LINK_STATUS)) {
                console.error('Error: Could not initialize shader.');
                console.error('gl.VALIDATE_STATUS', gl.getProgramParameter(this._program, gl.VALIDATE_STATUS));
                console.error('gl.getError()', gl.getError());

                // if there is a program info log, log it
                if (gl.getProgramInfoLog(this._program) !== '') {
                    console.warn('Warning: gl.getProgramInfoLog()', gl.getProgramInfoLog(this._program));
                }

                gl.deleteProgram(this._program);
                this._program = null;
            }

            // clean up some shaders
            gl.deleteShader(glVertShader);
            gl.deleteShader(glFragShader);
        }

        _glCompile(type, src) {
            let shader = this.gl.createShader(type);

            this.gl.shaderSource(shader, src);
            this.gl.compileShader(shader);

            if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
                console.log(this.constructor.name, 'Type: ' + (type === this.gl.VERTEX_SHADER ? 'vertex shader' : 'fragment shader') );
                console.log(this.gl.getShaderInfoLog(shader));
                let idx = 0;
                console.log("========== source ==========\n" + src.split("\n").map(line => "" + (++idx) + ": " + line).join("\n"));
                return null;
            }

            return shader;
        }

        getUniformLocation(name) {
            let location = this._uniformLocations.get(name);
            if (location === undefined) {
                location = this.gl.getUniformLocation(this._program, name);
                this._uniformLocations.set(name, location);
            }

            return location;
        }

        getAttribLocation(name) {
            let location = this._attributeLocations.get(name);
            if (location === undefined) {
                location = this.gl.getAttribLocation(this._program, name);
                this._attributeLocations.set(name, location);
            }

            return location;
        }

        destroy() {
            if (this._program) {
                this.gl.deleteProgram(this._program);
                this._program = null;
            }
        }

        get glProgram() {
            return this._program;
        }

        get compiled() {
            return !!this._program;
        }

        _valueEquals(v1, v2) {
            // Uniform value is either a typed array or a numeric value.
            if (v1.length && v2.length) {
                for (let i = 0, n = v1.length; i < n; i++) {
                    if (v1[i] !== v2[i]) return false;
                }
                return true;
            } else {
                return (v1 === v2);
            }
        }

        _valueClone(v) {
            if (v.length) {
                return v.slice(0);
            } else {
                return v;
            }
        }

        setUniformValue(name, value, glFunction) {
            let v = this._currentUniformValues[name];
            if (v === undefined || !this._valueEquals(v, value)) {
                let clonedValue = this._valueClone(value);
                this._currentUniformValues[name] = clonedValue;

                let loc = this.getUniformLocation(name);
                if (loc) {
                    let isMatrix = (glFunction === this.gl.uniformMatrix2fv || glFunction === this.gl.uniformMatrix3fv || glFunction === this.gl.uniformMatrix4fv);
                    if (isMatrix) {
                        glFunction.call(this.gl, loc, false, clonedValue);
                    } else {
                        glFunction.call(this.gl, loc, clonedValue);
                    }
                }
            }
        }

    }

    class WebGLShader extends Shader {

        constructor(ctx) {
            super(ctx);

            const stage = ctx.stage;

            this._program = stage.renderer.shaderPrograms.get(this.constructor);
            if (!this._program) {
                this._program = new WebGLShaderProgram(this.constructor.vertexShaderSource, this.constructor.fragmentShaderSource);

                // Let the vbo context perform garbage collection.
                stage.renderer.shaderPrograms.set(this.constructor, this._program);
            }

            this.gl = stage.gl;
        }

        get glProgram() {
            return this._program.glProgram;
        }

        _init() {
            if (!this._initialized) {
                this.initialize();
                this._initialized = true;
            }
        }

        initialize() {
            this._program.compile(this.gl);
        }

        get initialized() {
            return this._initialized;
        }

        _uniform(name) {
            return this._program.getUniformLocation(name);
        }

        _attrib(name) {
            return this._program.getAttribLocation(name);
        }

        _setUniform(name, value, glFunction) {
            this._program.setUniformValue(name, value, glFunction);
        }

        useProgram() {
            this._init();
            this.gl.useProgram(this.glProgram);
            this.beforeUsage();
            this.enableAttribs();
        }

        stopProgram() {
            this.afterUsage();
            this.disableAttribs();
        }

        hasSameProgram(other) {
            // For performance reasons, we first check for identical references.
            return (other && ((other === this) || (other._program === this._program)));
        }

        beforeUsage() {
            // Override to set settings other than the default settings (blend mode etc).
        }

        afterUsage() {
            // All settings changed in beforeUsage should be reset here.
        }

        enableAttribs() {

        }

        disableAttribs() {

        }

        getExtraAttribBytesPerVertex() {
            return 0;
        }

        getVertexAttribPointerOffset(operation) {
            return operation.extraAttribsDataByteOffset - (operation.index + 1) * 4 * this.getExtraAttribBytesPerVertex();
        }

        setExtraAttribsInBuffer(operation) {
            // Set extra attrib data in in operation.quads.data/floats/uints, starting from
            // operation.extraAttribsBufferByteOffset.
        }

        setupUniforms(operation) {
            // Set all shader-specific uniforms.
            // Notice that all uniforms should be set, even if they have not been changed within this shader instance.
            // The uniforms are shared by all shaders that have the same type (and shader program).
        }

        _getProjection(operation) {
            return operation.getProjection();
        }

        getFlipY(operation) {
            return this._getProjection(operation)[1] < 0;
        }

        beforeDraw(operation) {
        }

        draw(operation) {
        }

        afterDraw(operation) {
        }

        cleanup() {
            this._initialized = false;
            // Program takes little resources, so it is only destroyed when the full stage is destroyed.
        }

    }

    class DefaultShader$1 extends WebGLShader {

        enableAttribs() {
            // Enables the attribs in the shader program.
            let gl = this.gl;
            gl.vertexAttribPointer(this._attrib("aVertexPosition"), 2, gl.FLOAT, false, 20, 0);
            gl.enableVertexAttribArray(this._attrib("aVertexPosition"));

            if (this._attrib("aTextureCoord") !== -1) {
                gl.vertexAttribPointer(this._attrib("aTextureCoord"), 2, gl.FLOAT, false, 20, 2 * 4);
                gl.enableVertexAttribArray(this._attrib("aTextureCoord"));
            }

            if (this._attrib("aColor") !== -1) {
                // Some shaders may ignore the color.
                gl.vertexAttribPointer(this._attrib("aColor"), 4, gl.UNSIGNED_BYTE, true, 20, 4 * 4);
                gl.enableVertexAttribArray(this._attrib("aColor"));
            }
        }

        disableAttribs() {
            // Disables the attribs in the shader program.
            let gl = this.gl;
            gl.disableVertexAttribArray(this._attrib("aVertexPosition"));

            if (this._attrib("aTextureCoord") !== -1) {
                gl.disableVertexAttribArray(this._attrib("aTextureCoord"));
            }

            if (this._attrib("aColor") !== -1) {
                gl.disableVertexAttribArray(this._attrib("aColor"));
            }
        }

        setupUniforms(operation) {
            this._setUniform("projection", this._getProjection(operation), this.gl.uniform2fv, false);
        }

        draw(operation) {
            let gl = this.gl;

            let length = operation.length;

            if (length) {
                let glTexture = operation.getTexture(0);
                let pos = 0;
                for (let i = 0; i < length; i++) {
                    let tx = operation.getTexture(i);
                    if (glTexture !== tx) {
                        gl.bindTexture(gl.TEXTURE_2D, glTexture);
                        gl.drawElements(gl.TRIANGLES, 6 * (i - pos), gl.UNSIGNED_SHORT, (pos + operation.index + 1) * 6 * 2);
                        glTexture = tx;
                        pos = i;
                    }
                }
                if (pos < length) {
                    gl.bindTexture(gl.TEXTURE_2D, glTexture);
                    gl.drawElements(gl.TRIANGLES, 6 * (length - pos), gl.UNSIGNED_SHORT, (pos + operation.index + 1) * 6 * 2);
                }
            }
        }

    }

    DefaultShader$1.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    attribute vec4 aColor;
    uniform vec2 projection;
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    void main(void){
        gl_Position = vec4(aVertexPosition.x * projection.x - 1.0, aVertexPosition.y * -abs(projection.y) + 1.0, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
        vColor = aColor;
        gl_Position.y = -sign(projection.y) * gl_Position.y;
    }
`;

    DefaultShader$1.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    void main(void){
        gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor;
    }
`;

    class Renderer {

        constructor(stage) {
            this.stage = stage;
            this._defaultShader = undefined;
        }

        gc(aggressive) {
        }

        destroy() {
        }

        getDefaultShader(ctx = this.stage.ctx) {
            if (!this._defaultShader) {
                this._defaultShader = this._createDefaultShader(ctx);
            }
            return this._defaultShader;
        }

        _createDefaultShader(ctx) {
        }

        isValidShaderType(shaderType) {
            return (shaderType.prototype instanceof this._getShaderBaseType());
        }

        createShader(ctx, settings) {
            const shaderType = settings.type || DefaultShader;
            // If shader type is not correct, use a different platform.
            if (!this.isValidShaderType(shaderType)) {
                const convertedShaderType = this._getShaderAlternative(shaderType);
                if (!convertedShaderType) {
                    console.warn("Shader has no implementation for render target: " + shaderType.name);
                    return this._createDefaultShader(ctx);
                }
                return new convertedShaderType(ctx);
            } else {
                const shader = new shaderType(ctx);
                this.stage.patchObject(this, settings);
                return shader;
            }
        }

        _getShaderBaseType() {
        }

        _getShaderAlternative(shaderType) {
            return this.getDefaultShader();
        }

        getPatchId() {
        }

        copyRenderTexture(renderTexture, nativeTexture, options) {
            console.warn('copyRenderTexture not supported by renderer');
        }
    }

    class WebGLRenderer extends Renderer {

        constructor(stage) {
            super(stage);
            this.shaderPrograms = new Map();
        }

        destroy() {
            this.shaderPrograms.forEach(shaderProgram => shaderProgram.destroy());
        }

        _createDefaultShader(ctx) {
            return new DefaultShader$1(ctx);
        }

        _getShaderBaseType() {
            return WebGLShader
        }

        _getShaderAlternative(shaderType) {
            return shaderType.getWebGL && shaderType.getWebGL();
        }

        createCoreQuadList(ctx) {
            return new WebGLCoreQuadList(ctx);
        }

        createCoreQuadOperation(ctx, shader, shaderOwner, renderTextureInfo, scissor, index) {
            return new WebGLCoreQuadOperation(ctx, shader, shaderOwner, renderTextureInfo, scissor, index);
        }

        createCoreRenderExecutor(ctx) {
            return new WebGLCoreRenderExecutor(ctx);
        }
        
        createCoreRenderState(ctx) {
            return new CoreRenderState(ctx);
        }

        createRenderTexture(w, h, pw, ph) {
            const gl = this.stage.gl;
            const glTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, glTexture);

            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, pw, ph, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            glTexture.params = {};
            glTexture.params[gl.TEXTURE_MAG_FILTER] = gl.LINEAR;
            glTexture.params[gl.TEXTURE_MIN_FILTER] = gl.LINEAR;
            glTexture.params[gl.TEXTURE_WRAP_S] = gl.CLAMP_TO_EDGE;
            glTexture.params[gl.TEXTURE_WRAP_T] = gl.CLAMP_TO_EDGE;
            glTexture.options = {format: gl.RGBA, internalFormat: gl.RGBA, type: gl.UNSIGNED_BYTE};

            // We need a specific framebuffer for every render texture.
            glTexture.framebuffer = gl.createFramebuffer();
            glTexture.projection = new Float32Array([2/w, 2/h]);

            gl.bindFramebuffer(gl.FRAMEBUFFER, glTexture.framebuffer);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, glTexture, 0);

            return glTexture;
        }
        
        freeRenderTexture(glTexture) {
            let gl = this.stage.gl;
            gl.deleteFramebuffer(glTexture.framebuffer);
            gl.deleteTexture(glTexture);
        }

        uploadTextureSource(textureSource, options) {
            const gl = this.stage.gl;

            const source = options.source;

            const format = {
                premultiplyAlpha: true,
                hasAlpha: true
            };

            if (options && options.hasOwnProperty('premultiplyAlpha')) {
                format.premultiplyAlpha = options.premultiplyAlpha;
            }

            if (options && options.hasOwnProperty('flipBlueRed')) {
                format.flipBlueRed = options.flipBlueRed;
            }

            if (options && options.hasOwnProperty('hasAlpha')) {
                format.hasAlpha = options.hasAlpha;
            }

            if (!format.hasAlpha) {
                format.premultiplyAlpha = false;
            }

            format.texParams = options.texParams || {};
            format.texOptions = options.texOptions || {};

            let glTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, glTexture);

            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, format.premultiplyAlpha);

            if (Utils.isNode) {
                gl.pixelStorei(gl.UNPACK_FLIP_BLUE_RED, !!format.flipBlueRed);
            }

            const texParams = format.texParams;
            if (!texParams[gl.TEXTURE_MAG_FILTER]) texParams[gl.TEXTURE_MAG_FILTER] = gl.LINEAR;
            if (!texParams[gl.TEXTURE_MIN_FILTER]) texParams[gl.TEXTURE_MIN_FILTER] = gl.LINEAR;
            if (!texParams[gl.TEXTURE_WRAP_S]) texParams[gl.TEXTURE_WRAP_S] = gl.CLAMP_TO_EDGE;
            if (!texParams[gl.TEXTURE_WRAP_T]) texParams[gl.TEXTURE_WRAP_T] = gl.CLAMP_TO_EDGE;

            Object.keys(texParams).forEach(key => {
                const value = texParams[key];
                gl.texParameteri(gl.TEXTURE_2D, parseInt(key), value);
            });

            const texOptions = format.texOptions;
            texOptions.format = texOptions.format || (format.hasAlpha ? gl.RGBA : gl.RGB);
            texOptions.type = texOptions.type || gl.UNSIGNED_BYTE;
            texOptions.internalFormat = texOptions.internalFormat || texOptions.format;

            this.stage.platform.uploadGlTexture(gl, textureSource, source, texOptions);

            glTexture.params = Utils.cloneObjShallow(texParams);
            glTexture.options = Utils.cloneObjShallow(texOptions);

            return glTexture;
        }

        freeTextureSource(textureSource) {
            this.stage.gl.deleteTexture(textureSource.nativeTexture);
        }

        addQuad(renderState, quads, index) {
            let offset = (index * 20 + 20);
            const viewCore = quads.quadViews[index];

            let r = viewCore._renderContext;

            let floats = renderState.quads.floats;
            let uints = renderState.quads.uints;
            const mca = StageUtils.mergeColorAlpha;

            if (r.tb !== 0 || r.tc !== 0) {
                floats[offset++] = r.px;
                floats[offset++] = r.py;
                floats[offset++] = viewCore._ulx;
                floats[offset++] = viewCore._uly;
                uints[offset++] = mca(viewCore._colorUl, r.alpha);
                floats[offset++] = r.px + viewCore._w * r.ta;
                floats[offset++] = r.py + viewCore._w * r.tc;
                floats[offset++] = viewCore._brx;
                floats[offset++] = viewCore._uly;
                uints[offset++] = mca(viewCore._colorUr, r.alpha);
                floats[offset++] = r.px + viewCore._w * r.ta + viewCore._h * r.tb;
                floats[offset++] = r.py + viewCore._w * r.tc + viewCore._h * r.td;
                floats[offset++] = viewCore._brx;
                floats[offset++] = viewCore._bry;
                uints[offset++] = mca(viewCore._colorBr, r.alpha);
                floats[offset++] = r.px + viewCore._h * r.tb;
                floats[offset++] = r.py + viewCore._h * r.td;
                floats[offset++] = viewCore._ulx;
                floats[offset++] = viewCore._bry;
                uints[offset] = mca(viewCore._colorBl, r.alpha);
            } else {
                // Simple.
                let cx = r.px + viewCore._w * r.ta;
                let cy = r.py + viewCore._h * r.td;

                floats[offset++] = r.px;
                floats[offset++] = r.py;
                floats[offset++] = viewCore._ulx;
                floats[offset++] = viewCore._uly;
                uints[offset++] = mca(viewCore._colorUl, r.alpha);
                floats[offset++] = cx;
                floats[offset++] = r.py;
                floats[offset++] = viewCore._brx;
                floats[offset++] = viewCore._uly;
                uints[offset++] = mca(viewCore._colorUr, r.alpha);
                floats[offset++] = cx;
                floats[offset++] = cy;
                floats[offset++] = viewCore._brx;
                floats[offset++] = viewCore._bry;
                uints[offset++] = mca(viewCore._colorBr, r.alpha);
                floats[offset++] = r.px;
                floats[offset++] = cy;
                floats[offset++] = viewCore._ulx;
                floats[offset++] = viewCore._bry;
                uints[offset] = mca(viewCore._colorBl, r.alpha);
            }
        }

        isRenderTextureReusable(renderState, renderTextureInfo) {
            let offset = (renderState._renderTextureInfo.offset * 80 + 80) / 4;
            let floats = renderState.quads.floats;
            let uints = renderState.quads.uints;
            return ((floats[offset] === 0) &&
                (floats[offset + 1] === 0) &&
                (floats[offset + 2] === 0) &&
                (floats[offset + 3] === 0) &&
                (uints[offset + 4] === 0xFFFFFFFF) &&
                (floats[offset + 5] === renderTextureInfo.w) &&
                (floats[offset + 6] === 0) &&
                (floats[offset + 7] === 1) &&
                (floats[offset + 8] === 0) &&
                (uints[offset + 9] === 0xFFFFFFFF) &&
                (floats[offset + 10] === renderTextureInfo.w) &&
                (floats[offset + 11] === renderTextureInfo.h) &&
                (floats[offset + 12] === 1) &&
                (floats[offset + 13] === 1) &&
                (uints[offset + 14] === 0xFFFFFFFF) &&
                (floats[offset + 15] === 0) &&
                (floats[offset + 16] === renderTextureInfo.h) &&
                (floats[offset + 17] === 0) &&
                (floats[offset + 18] === 1) &&
                (uints[offset + 19] === 0xFFFFFFFF));
        }

        finishRenderState(renderState) {
            // Set extra shader attribute data.
            let offset = renderState.length * 80 + 80;
            for (let i = 0, n = renderState.quadOperations.length; i < n; i++) {
                renderState.quadOperations[i].extraAttribsDataByteOffset = offset;
                let extra = renderState.quadOperations[i].shader.getExtraAttribBytesPerVertex() * 4 * renderState.quadOperations[i].length;
                offset += extra;
                if (extra) {
                    renderState.quadOperations[i].shader.setExtraAttribsInBuffer(renderState.quadOperations[i], renderState.quads);
                }
            }
            renderState.quads.dataLength = offset;
        }

        getPatchId() {
            return "webgl";
        }

        copyRenderTexture(renderTexture, nativeTexture, options) {
            const gl = this.stage.gl;
            gl.bindTexture(gl.TEXTURE_2D, nativeTexture);
            gl.bindFramebuffer(gl.FRAMEBUFFER, renderTexture.framebuffer);
            const precision = renderTexture.precision;
            gl.copyTexSubImage2D(
                gl.TEXTURE_2D,
                0,
                precision * (options.sx || 0),
                precision * (options.sy || 0),
                precision * (options.x || 0),
                precision * (options.y || 0),
                precision * (options.w || renderTexture.ow),
                precision * (options.h || renderTexture.oh));
        }

    }

    class C2dCoreQuadList extends CoreQuadList {

        constructor(ctx) {
            super(ctx);

            this.renderContexts = [];
            this.modes = [];
        }

        setRenderContext(index, v) {
            this.renderContexts[index] = v;
        }

        setSimpleTc(index, v) {
            if (v) {
                this.modes[index] |= 1;
            } else {
                this.modes[index] -= (this.modes[index] & 1);
            }
        }

        setWhite(index, v) {
            if (v) {
                this.modes[index] |= 2;
            } else {
                this.modes[index] -= (this.modes[index] & 2);
            }
        }

        getRenderContext(index) {
            return this.renderContexts[index];
        }

        getSimpleTc(index) {
            return (this.modes[index] & 1);
        }

        getWhite(index) {
            return (this.modes[index] & 2);
        }

    }

    class C2dCoreQuadOperation extends CoreQuadOperation {

        getRenderContext(index) {
            return this.quads.getRenderContext(this.index + index);
        }

        getSimpleTc(index) {
            return this.quads.getSimpleTc(this.index + index);
        }

        getWhite(index) {
            return this.quads.getWhite(this.index + index);
        }

    }

    class C2dCoreRenderExecutor extends CoreRenderExecutor {

        init() {
            this._mainRenderTexture = this.ctx.stage.getCanvas();
        }

        _renderQuadOperation(op) {
            let shader = op.shader;

            if (op.length || op.shader.addEmpty()) {
                const target = this._renderTexture || this._mainRenderTexture;
                shader.beforeDraw(op, target);
                shader.draw(op, target);
                shader.afterDraw(op, target);
            }
        }

        _clearRenderTexture() {
            const ctx = this._getContext();

            let clearColor = [0, 0, 0, 0];
            if (this._mainRenderTexture.ctx === ctx) {
                clearColor = this.ctx.stage.getClearColor();
            }

            const renderTexture = ctx.canvas;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            if (!clearColor[0] && !clearColor[1] && !clearColor[2] && !clearColor[3]) {
                ctx.clearRect(0, 0, renderTexture.width, renderTexture.height);
            } else {
                ctx.fillStyle = StageUtils.getRgbaStringFromArray(clearColor);
                // Do not use fillRect because it produces artifacts.
                ctx.globalCompositeOperation = 'copy';
                ctx.beginPath();
                ctx.rect(0, 0, renderTexture.width, renderTexture.height);
                ctx.closePath();
                ctx.fill();
                ctx.globalCompositeOperation = 'source-over';
            }
        }
        
        _getContext() {
            if (this._renderTexture) {
                return this._renderTexture.ctx;
            } else {
                return this._mainRenderTexture.ctx;
            } 
        }

        _restoreContext() {
            const ctx = this._getContext();
            ctx.restore();
            ctx.save();
            ctx._scissor = null;
        }

        _setScissor(area) {
            const ctx = this._getContext();

            if (!C2dCoreRenderExecutor._equalScissorAreas(ctx.canvas, ctx._scissor, area)) {
                // Clipping is stored in the canvas context state.
                // We can't reset clipping alone so we need to restore the full context.
                this._restoreContext();

                let precision = this.ctx.stage.getRenderPrecision();
                if (area) {
                    ctx.beginPath();
                    ctx.rect(Math.round(area[0] * precision), Math.round(area[1] * precision), Math.round(area[2] * precision), Math.round(area[3] * precision));
                    ctx.closePath();
                    ctx.clip();
                }
                ctx._scissor = area;
            }
        }

        static _equalScissorAreas(canvas, area, current) {
            if (!area) {
                area = [0, 0, canvas.width, canvas.height];
            }
            if (!current) {
                current = [0, 0, canvas.width, canvas.height];
            }
            return Utils.equalValues(area, current)
        }

    }

    class C2dShader extends Shader {

        beforeDraw(operation) {
        }

        draw(operation) {
        }

        afterDraw(operation) {
        }

    }

    class DefaultShader$2 extends C2dShader {

        constructor(ctx) {
            super(ctx);
            this._rectangleTexture = ctx.stage.rectangleTexture.source.nativeTexture;
            this._tintManager = this.ctx.stage.renderer.tintManager;
        }

        draw(operation, target) {
            const ctx = target.ctx;
            let length = operation.length;
            for (let i = 0; i < length; i++) {
                const tx = operation.getTexture(i);
                const vc = operation.getViewCore(i);
                const rc = operation.getRenderContext(i);
                const white = operation.getWhite(i);
                const stc = operation.getSimpleTc(i);

                //@todo: try to optimize out per-draw transform setting. split translate, transform.
                const precision = this.ctx.stage.getRenderPrecision();
                ctx.setTransform(rc.ta * precision, rc.tc * precision, rc.tb * precision, rc.td * precision, rc.px * precision, rc.py * precision);

                const rect = (tx === this._rectangleTexture);
                const info = {operation, target, index: i, rect};

                if (rect) {
                    // Check for gradient.
                    if (white) {
                        ctx.fillStyle = 'white';
                    } else {
                        this._setColorGradient(ctx, vc);
                    }

                    ctx.globalAlpha = rc.alpha;
                    this._beforeDrawEl(info);
                    ctx.fillRect(0, 0, vc.w, vc.h);
                    this._afterDrawEl(info);
                    ctx.globalAlpha = 1.0;
                } else {
                    // @todo: set image smoothing based on the texture.

                    // @todo: optimize by registering whether identity texcoords are used.
                    ctx.globalAlpha = rc.alpha;
                    this._beforeDrawEl(info);

                    // @todo: test if rounding yields better performance.

                    // Notice that simple texture coords can be turned on even though vc._ulx etc are not simple, because
                    //  we are rendering a render-to-texture (texcoords were stashed). Same is true for 'white' color btw.
                    const sourceX = stc ? 0 : (vc._ulx * tx.w);
                    const sourceY = stc ? 0 : (vc._uly * tx.h);
                    const sourceW = (stc ? 1 : (vc._brx - vc._ulx)) * tx.w;
                    const sourceH = (stc ? 1 : (vc._bry - vc._uly)) * tx.h;

                    let colorize = !white;
                    if (colorize) {
                        // @todo: cache the tint texture for better performance.

                        // Draw to intermediate texture with background color/gradient.
                        // This prevents us from having to create a lot of render texture canvases.

                        // Notice that we don't support (non-rect) gradients, only color tinting for c2d. We'll just take the average color.
                        let color = vc._colorUl;
                        if (vc._colorUl !== vc._colorUr || vc._colorUr !== vc._colorBl || vc._colorBr !== vc._colorBl) {
                            color = StageUtils.mergeMultiColorsEqual([vc._colorUl, vc._colorUr, vc._colorBl, vc._colorBr]);
                        }

                        const alpha = ((color / 16777216) | 0) / 255.0;
                        ctx.globalAlpha *= alpha;

                        const rgb = color & 0x00FFFFFF;
                        const tintTexture = this._tintManager.getTintTexture(tx, rgb);

                        // Actually draw result.
                        ctx.fillStyle = 'white';
                        ctx.drawImage(tintTexture, sourceX, sourceY, sourceW, sourceH, 0, 0, vc.w, vc.h);
                    } else {
                        ctx.fillStyle = 'white';
                        ctx.drawImage(tx, sourceX, sourceY, sourceW, sourceH, 0, 0, vc.w, vc.h);
                    }
                    this._afterDrawEl(info);
                    ctx.globalAlpha = 1.0;
                }
            }
        }

        _setColorGradient(ctx, vc, w = vc.w, h = vc.h, transparency = true) {
            let color = vc._colorUl;
            let gradient;
            //@todo: quick single color check.
            //@todo: cache gradient/fill style (if possible, probably context-specific).

            if (vc._colorUl === vc._colorUr) {
                if (vc._colorBl === vc._colorBr) {
                    if (vc._colorUl === vc.colorBl) ; else {
                        // Vertical gradient.
                        gradient = ctx.createLinearGradient(0, 0, 0, h);
                        if (transparency) {
                            gradient.addColorStop(0, StageUtils.getRgbaString(vc._colorUl));
                            gradient.addColorStop(1, StageUtils.getRgbaString(vc._colorBl));
                        } else {
                            gradient.addColorStop(0, StageUtils.getRgbString(vc._colorUl));
                            gradient.addColorStop(1, StageUtils.getRgbString(vc._colorBl));

                        }
                    }
                }
            } else {
                if (vc._colorUl === vc._colorBl && vc._colorUr === vc._colorBr) {
                    // Horizontal gradient.
                    gradient = ctx.createLinearGradient(0, 0, w, 0);
                    if (transparency) {
                        gradient.addColorStop(0, StageUtils.getRgbaString(vc._colorUl));
                        gradient.addColorStop(1, StageUtils.getRgbaString(vc._colorBr));
                    } else {
                        gradient.addColorStop(0, StageUtils.getRgbString(vc._colorUl));
                        gradient.addColorStop(1, StageUtils.getRgbString(vc._colorBr));
                    }
                }
            }

            if (gradient) {
                ctx.fillStyle = gradient;
            } else {
                ctx.fillStyle = transparency ? StageUtils.getRgbaString(color) : StageUtils.getRgbString(color);
            }
        }

        _beforeDrawEl(info) {
        }

        _afterDrawEl(info) {
        }

    }

    class C2dTextureTintManager {

        constructor(stage) {
            this.stage = stage;
            this._usedMemory = 0;
            this._cachedNativeTextures = new Set();
        }

        destroy() {
            this.gc(true);
        }

        _addMemoryUsage(delta) {
            this._usedMemory += delta;

            this.stage.addMemoryUsage(delta);
        }

        delete(nativeTexture) {
            // Should be called when native texture is cleaned up.
            if (this._hasCache(nativeTexture)) {
                const cache = this._getCache(nativeTexture);
                const prevMemUsage = cache.memoryUsage;
                cache.clear();
                this._cachedNativeTextures.delete(nativeTexture);
                this._addMemoryUsage(cache.memoryUsage - prevMemUsage);
            }
        }

        getTintTexture(nativeTexture, color) {
            const frame = this.stage.frameCounter;

            this._cachedNativeTextures.add(nativeTexture);

            const cache = this._getCache(nativeTexture);

            const item = cache.get(color);
            item.lf = frame;

            if (item.tx) {
                if (nativeTexture.update > item.u) {
                    // Native texture was updated in the mean time: renew.
                    this._tintTexture(item.tx, nativeTexture, color);
                }

                return item.tx;
            } else {
                const before = cache.memoryUsage;

                // Find blanco tint texture.
                let target = cache.reuseTexture(frame);
                if (target) {
                    target.ctx.clearRect(0, 0, target.width, target.height);
                } else {
                    // Allocate new.
                    target = document.createElement('canvas');
                    target.width = nativeTexture.w;
                    target.height = nativeTexture.h;
                    target.ctx = target.getContext('2d');
                }

                this._tintTexture(target, nativeTexture, color);
                cache.set(color, target, frame);

                const after = cache.memoryUsage;

                if (after !== before) {
                    this._addMemoryUsage(after - before);
                }

                return target;
            }
        }

        _tintTexture(target, source, color) {
            let col = color.toString(16);
            while (col.length < 6) {
                col = "0" + col;
            }
            target.ctx.fillStyle = '#' + col;
            target.ctx.globalCompositeOperation = 'copy';
            target.ctx.fillRect(0, 0, source.w, source.h);
            target.ctx.globalCompositeOperation = 'multiply';
            target.ctx.drawImage(source, 0, 0, source.w, source.h, 0, 0, target.width, target.height);

            // Alpha-mix the texture.
            target.ctx.globalCompositeOperation = 'destination-in';
            target.ctx.drawImage(source, 0, 0, source.w, source.h, 0, 0, target.width, target.height);
        }

        _hasCache(nativeTexture) {
            return !!nativeTexture._tintCache;
        }

        _getCache(nativeTexture) {
            if (!nativeTexture._tintCache) {
                nativeTexture._tintCache = new C2dTintCache(nativeTexture);
            }
            return nativeTexture._tintCache;
        }

        gc(aggressive = false) {
            const frame = this.stage.frameCounter;
            let delta = 0;
            this._cachedNativeTextures.forEach(texture => {
                const cache = this._getCache(texture);
                if (aggressive) {
                    delta += cache.memoryUsage;
                    texture.clear();
                } else {
                    const before = cache.memoryUsage;
                    cache.cleanup(frame);
                    cache.releaseBlancoTextures();
                    delta += (cache.memoryUsage - before);
                }
            });

            if (aggressive) {
                this._cachedNativeTextures.clear();
            }

            if (delta) {
                this._addMemoryUsage(delta);
            }
        }

    }

    class C2dTintCache {

        constructor(nativeTexture) {
            this._tx = nativeTexture;
            this._colors = new Map();
            this._blancoTextures = null;
            this._lastCleanupFrame = 0;
            this._memTextures = 0;
        }

        get memoryUsage() {
            return this._memTextures * this._tx.w * this._tx.h;
        }

        releaseBlancoTextures() {
            this._memTextures -= this._blancoTextures.length;
            this._blancoTextures = [];
        }

        clear() {
            // Dereference the textures.
            this._blancoTextures = null;
            this._colors.clear();
            this._memTextures = 0;
        }

        get(color) {
            let item = this._colors.get(color);
            if (!item) {
                item = {lf: -1, tx: undefined, u: -1};
                this._colors.set(color, item);
            }
            return item;
        }

        set(color, texture, frame) {
            const item = this.get(color);
            item.lf = frame;
            item.tx = texture;
            item.u = frame;
            this._memTextures++;
        }

        cleanup(frame) {
            // We only need to clean up once per frame.
            if (this._lastCleanupFrame !== frame) {

                // We limit blanco textures reuse to one frame only to prevent memory usage growth.
                this._blancoTextures = [];

                this._colors.forEach((item, color) => {
                    // Clean up entries that were not used last frame.
                    if (item.lf < frame - 1) {
                        if (item.tx) {
                            // Keep as reusable blanco texture.
                            this._blancoTextures.push(item.tx);
                        }
                        this._colors.delete(color);
                    }
                });

                this._lastCleanupFrame = frame;
            }
        }

        reuseTexture(frame) {
            // Try to reuse textures, because creating them every frame is expensive.
            this.cleanup(frame);
            if (this._blancoTextures && this._blancoTextures.length) {
                this._memTextures--;
                return this._blancoTextures.pop();
            }
        }

    }

    class C2dRenderer extends Renderer {

        constructor(stage) {
            super(stage);

            this.tintManager = new C2dTextureTintManager(stage);

            this.setupC2d(this.stage.c2d.canvas);
        }

        destroy() {
            this.tintManager.destroy();
        }

        _createDefaultShader(ctx) {
            return new DefaultShader$2(ctx);
        }

        _getShaderBaseType() {
            return C2dShader
        }

        _getShaderAlternative(shaderType) {
            return shaderType.getC2d && shaderType.getC2d();
        }

        createCoreQuadList(ctx) {
            return new C2dCoreQuadList(ctx);
        }

        createCoreQuadOperation(ctx, shader, shaderOwner, renderTextureInfo, scissor, index) {
            return new C2dCoreQuadOperation(ctx, shader, shaderOwner, renderTextureInfo, scissor, index);
        }

        createCoreRenderExecutor(ctx) {
            return new C2dCoreRenderExecutor(ctx);
        }
        
        createCoreRenderState(ctx) {
            return new CoreRenderState(ctx);
        }

        createRenderTexture(w, h, pw, ph) {
            const canvas = document.createElement('canvas');
            canvas.width = pw;
            canvas.height = ph;
            this.setupC2d(canvas);
            return canvas;
        }
        
        freeRenderTexture(nativeTexture) {
            this.tintManager.delete(nativeTexture);
        }

        gc(aggressive) {
            this.tintManager.gc(aggressive);
        }

        uploadTextureSource(textureSource, options) {
            // For canvas, we do not need to upload.
            if (options.source.buffer) {
                // Convert RGBA buffer to canvas.
                const canvas = document.createElement('canvas');
                canvas.width = options.w;
                canvas.height = options.h;

                const imageData = new ImageData(new Uint8ClampedArray(options.source.buffer), options.w, options.h);
                canvas.getContext('2d').putImageData(imageData, 0, 0);
                return canvas;
            }

            return options.source;
        }

        freeTextureSource(textureSource) {
            this.tintManager.delete(textureSource.nativeTexture);
        }

        addQuad(renderState, quads, index) {
            // Render context changes while traversing so we save it by ref.
            const viewCore = quads.quadViews[index];
            quads.setRenderContext(index, viewCore._renderContext);
            quads.setWhite(index, viewCore.isWhite());
            quads.setSimpleTc(index, viewCore.hasSimpleTexCoords());
        }

        isRenderTextureReusable(renderState, renderTextureInfo) {
            // @todo: check render coords/matrix, maybe move this to core?
            return false;
        }

        finishRenderState(renderState) {
        }

        setupC2d(canvas) {
            const ctx = canvas.getContext('2d');
            canvas.ctx = ctx;

            ctx._scissor = null;

            // Save base state so we can restore the defaults later.
            canvas.ctx.save();
        }

        getPatchId() {
            return "c2d";
        }

    }

    class ImageWorker {

        constructor(options = {}) {
            this._items = new Map();
            this._id = 0;

            this._initWorker();
        }

        _initWorker() {
            const code = `(${createWorker.toString()})()`;
            const blob = new Blob([code.replace('"use strict";', '')]); // firefox adds "use strict"; to any function which might block worker execution so knock it off
            const blobURL = (window.URL ? URL : webkitURL).createObjectURL(blob, {
                type: 'application/javascript; charset=utf-8'
            });
            this._worker = new Worker(blobURL);

            this._worker.postMessage({type: 'config', config: {path: window.location.href}});

            this._worker.onmessage = (e) => {
                if (e.data && e.data.id) {
                    const id = e.data.id;
                    const item = this._items.get(id);
                    if (item) {
                        if (e.data.type == 'data') {
                            this.finish(item, e.data.info);
                        } else {
                            this.error(item, e.data.info);
                        }
                    }
                }
            };
        }

        create(src) {
            const id = ++this._id;
            const item = new ImageWorkerImage(this, id, src);
            this._items.set(id, item);
            this._worker.postMessage({type: "add", id: id, src: src});
            return item;
        }

        cancel(image) {
            this._worker.postMessage({type: "cancel", id: image.id});
            this._items.delete(image.id);
        }

        error(image, info) {
            image.error(info);
            this._items.delete(image.id);
        }

        finish(image, info) {
            image.load(info);
            this._items.delete(image.id);
        }

    }

    class ImageWorkerImage {

        constructor(manager, id, src) {
            this._manager = manager;
            this._id = id;
            this._src = src;
            this._onError = null;
            this._onLoad = null;
        }

        get id() {
            return this._id;
        }

        get src() {
            return this._src;
        }

        set onError(f) {
            this._onError = f;
        }

        set onLoad(f) {
            this._onLoad = f;
        }

        cancel() {
            this._manager.cancel(this);
        }

        load(info) {
            if (this._onLoad) {
                this._onLoad(info);
            }
        }

        error(info) {
            if (this._onError) {
                this._onError(info);
            }
        }

    }

    /**
     * Notice that, within the createWorker function, we must only use ES5 code to keep it ES5-valid after babelifying, as
     *  the converted code of this section is converted to a blob and used as the js of the web worker thread.
     */
    const createWorker = function() {

        function ImageWorkerServer() {

            this.items = new Map();

            var t = this;
            onmessage = function(e) {
                t._receiveMessage(e);
            };

        }

        ImageWorkerServer.isPathAbsolute = function(path) {
            return /^(?:\/|[a-z]+:\/\/)/.test(path);
        };

        ImageWorkerServer.prototype._receiveMessage = function(e) {
            if (e.data.type === 'config') {
                this.config = e.data.config;

                var base = this.config.path;
                var parts = base.split("/");
                parts.pop();
                this._relativeBase = parts.join("/") + "/";

            } else if (e.data.type === 'add') {
                this.add(e.data.id, e.data.src);
            } else if (e.data.type === 'cancel') {
                this.cancel(e.data.id);
            }
        };

        ImageWorkerServer.prototype.add = function(id, src) {
            // Convert relative URLs.
            if (!ImageWorkerServer.isPathAbsolute(src)) {
                src = this._relativeBase + src;
            }

            if (src.substr(0,2) === "//") {
                // This doesn't work for image workers.
                src = "http:" + src;
            }

            var item = new ImageWorkerServerItem(id, src);
            const t = this;
            item.onFinish = function(result) {
                t.finish(item, result);
            };
            item.onError = function(info) {
                t.error(item, info);
            };
            this.items.set(id, item);
            item.start();
        };

        ImageWorkerServer.prototype.cancel = function(id) {
            var item = this.items.get(id);
            if (item) {
                item.cancel();
                this.items.delete(id);
            }
        };

        ImageWorkerServer.prototype.finish = function(item, {imageBitmap, hasAlphaChannel}) {
            postMessage({
                type: "data",
                id: item.id,
                info: {
                    imageBitmap,
                    hasAlphaChannel
                }
            }, [imageBitmap]);
            this.items.delete(item.id);
        };

        ImageWorkerServer.prototype.error = function(item, {type, message}) {
            postMessage({
                type: "error",
                id: item.id,
                info: {
                    type,
                    message
                }
            });
            this.items.delete(item.id);
        };

        ImageWorkerServer.isWPEBrowser = function() {
            return (navigator.userAgent.indexOf("WPE") !== -1);
        };

        function ImageWorkerServerItem(id, src) {

            this._onError = undefined;
            this._onFinish = undefined;
            this._id = id;
            this._src = src;
            this._xhr = undefined;
            this._mimeType = undefined;
            this._canceled = false;

        }

        Object.defineProperty(ImageWorkerServerItem.prototype, 'id', {
            get: function() {
                return this._id;
            }
        });

        Object.defineProperty(ImageWorkerServerItem.prototype, 'onFinish', {
            get: function() {
                return this._onFinish;
            },
            set: function(f) {
                this._onFinish = f;
            }
        });

        Object.defineProperty(ImageWorkerServerItem.prototype, 'onError', {
            get: function() {
                return this._onError;
            },
            set: function(f) {
                this._onError = f;
            }
        });

        ImageWorkerServerItem.prototype.start = function() {
            this._xhr = new XMLHttpRequest();
            this._xhr.open("GET", this._src, true);
            this._xhr.responseType = "blob";

            var t = this;
            this._xhr.onerror = function(oEvent) {
                t.error({type: "connection", message: "Connection error"});
            };

            this._xhr.onload = function(oEvent) {
                var blob = t._xhr.response;
                t._mimeType = blob.type;

                t._createImageBitmap(blob);
            };

            this._xhr.send();
        };

        ImageWorkerServerItem.prototype._createImageBitmap = function(blob) {
            var t = this;
            createImageBitmap(blob, {premultiplyAlpha: 'premultiply', colorSpaceConversion: 'none', imageOrientation: 'none'}).then(function(imageBitmap) {
                t.finish({
                    imageBitmap,
                    hasAlphaChannel: t._hasAlphaChannel()
                });
            }).catch(function(e) {
                t.error({type: "parse", message: "Error parsing image data"});
            });
        };

        ImageWorkerServerItem.prototype._hasAlphaChannel = function() {
            if (ImageWorkerServer.isWPEBrowser()) {
                // When using unaccelerated rendering image (https://github.com/WebPlatformForEmbedded/WPEWebKit/blob/wpe-20170728/Source/WebCore/html/ImageBitmap.cpp#L52),
                // everything including JPG images are in RGBA format. Upload is way faster when using an alpha channel.
                // @todo: after hardware acceleration is fixed and re-enabled, JPG should be uploaded in RGB to get the best possible performance and memory usage.
                return true;
            } else {
                return (this._mimeType.indexOf("image/png") !== -1);
            }
        };

        ImageWorkerServerItem.prototype.cancel = function() {
            if (this._canceled) return;
            if (this._xhr) {
                this._xhr.abort();
            }
            this._canceled = true;
        };

        ImageWorkerServerItem.prototype.error = function(type, message) {
            if (!this._canceled && this._onError) {
                this._onError({type, message});
            }
        };

        ImageWorkerServerItem.prototype.finish = function(info) {
            if (!this._canceled && this._onFinish) {
                this._onFinish(info);
            }
        };

        var worker = new ImageWorkerServer();
    };

    /**
     * Platform-specific functionality.
     * Copyright Metrological, 2017;
     */
    class WebPlatform {

        init(stage) {
            this.stage = stage;
            this._looping = false;
            this._awaitingLoop = false;

            if (this.stage.getOption("useImageWorker")) {
                if (!window.createImageBitmap || !window.Worker) {
                    console.warn("Can't use image worker because browser does not have createImageBitmap and Web Worker support");
                } else {
                    console.log('Using image worker!');
                    this._imageWorker = new ImageWorker();
                }
            }
        }

        startLoop() {
            this._looping = true;
            if (!this._awaitingLoop) {
                this.loop();
            }
        }

        stopLoop() {
            this._looping = false;
        }

        loop() {
            let self = this;
            let lp = function() {
                self._awaitingLoop = false;
                if (self._looping) {
                    self.stage.drawFrame();
                    requestAnimationFrame(lp);
                    self._awaitingLoop = true;
                }
            };
            requestAnimationFrame(lp);
        }

        uploadGlTexture(gl, textureSource, source, options) {
            if (source instanceof ImageData || source instanceof HTMLImageElement || source instanceof HTMLCanvasElement || source instanceof HTMLVideoElement || (window.ImageBitmap && source instanceof ImageBitmap)) {
                // Web-specific data types.
                gl.texImage2D(gl.TEXTURE_2D, 0, options.internalFormat, options.format, options.type, source);
            } else {
                gl.texImage2D(gl.TEXTURE_2D, 0, options.internalFormat, textureSource.w, textureSource.h, 0, options.format, options.type, source);
            }
        }

        loadSrcTexture({src, hasAlpha}, cb) {
            let cancelCb = undefined;
            let isPng = (src.indexOf(".png") >= 0);
            if (this._imageWorker) {
                // WPE-specific image parser.
                const image = this._imageWorker.create(src);
                image.onError = function(err) {
                    return cb("Image load error");
                };
                image.onLoad = function({imageBitmap, hasAlphaChannel}) {
                    cb(null, {
                        source: imageBitmap,
                        renderInfo: {src: src},
                        hasAlpha: hasAlphaChannel,
                        premultiplyAlpha: true
                    });
                };
                cancelCb = function() {
                    image.cancel();
                };
            } else {
                let image = new Image();
                if (!(src.substr(0,5) == "data:")) {
                    // Base64.
                    image.crossOrigin = "Anonymous";
                }
                image.onerror = function(err) {
                    // Ignore error message when cancelled.
                    if (image.src) {
                        return cb("Image load error");
                    }
                };
                image.onload = function() {
                    cb(null, {
                        source: image,
                        renderInfo: {src: src},
                        hasAlpha: isPng || hasAlpha
                    });
                };
                image.src = src;

                cancelCb = function() {
                    image.onerror = null;
                    image.onload = null;
                    image.removeAttribute('src');
                };
            }

            return cancelCb;
        }

        createWebGLContext(w, h) {
            let canvas = this.stage.getOption('canvas') || document.createElement('canvas');

            if (w && h) {
                canvas.width = w;
                canvas.height = h;
            }

            let opts = {
                alpha: true,
                antialias: false,
                premultipliedAlpha: true,
                stencil: true,
                preserveDrawingBuffer: false
            };

            let gl = canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl', opts);
            if (!gl) {
                throw new Error('This browser does not support webGL.');
            }

            return gl;
        }

        createCanvasContext(w, h) {
            let canvas = this.stage.getOption('canvas') || document.createElement('canvas');

            if (w && h) {
                canvas.width = w;
                canvas.height = h;
            }

            let c2d = canvas.getContext('2d');
            if (!c2d) {
                throw new Error('This browser does not support 2d canvas.');
            }

            return c2d;
        }

        getHrTime() {
            return window.performance ? window.performance.now() : (new Date()).getTime();
        }

        getDrawingCanvas() {
            // We can't reuse this canvas because textures may load async.
            return document.createElement('canvas');
        }

        getTextureOptionsForDrawingCanvas(canvas) {
            let options = {};
            options.source = canvas;
            return options;
        }

        nextFrame(changes) {
            /* WebGL blits automatically */
        }

        registerKeyHandler(keyhandler) {
            window.addEventListener('keydown', e => {
                keyhandler({keyCode: e.keyCode});
            });
        }

    }

    class PlatformLoader {
        static load(options) {
            return WebPlatform;
        }
    }

    class Utils$1 {

        static isFunction(value) {
            return typeof value === 'function';
        }

        static isNumber(value) {
            return typeof value === 'number';
        }

        static isInteger(value) {
            return (typeof value === 'number' && (value % 1) === 0);
        }

        static isBoolean(value) {
            return value === true || value === false;
        }

        static isString(value) {
            return typeof value == 'string';
        }

        static isObject(value) {
            let type = typeof value;
            return !!value && (type == 'object' || type == 'function');
        }

        static isPlainObject(value) {
            let type = typeof value;
            return !!value && (type == 'object');
        }

        static isObjectLiteral(value){
            return typeof value === 'object' && value && value.constructor === Object
        }

        static getArrayIndex(index, arr) {
            return Utils$1.getModuloIndex(index, arr.length);
        }

        static equalValues(v1, v2) {
            if ((typeof v1) !== (typeof v2)) return false
            if (Utils$1.isObjectLiteral(v1)) {
                return Utils$1.isObjectLiteral(v2) && Utils$1.equalObjectLiterals(v1, v2)
            } else if (Array.isArray(v1)) {
                return Array.isArray(v2) && Utils$1.equalArrays(v1, v2)
            } else {
                return v1 === v2
            }
        }

        static equalObjectLiterals(obj1, obj2) {
            let keys1 = Object.keys(obj1);
            let keys2 = Object.keys(obj2);
            if (keys1.length !== keys2.length) {
                return false
            }

            for (let i = 0, n = keys1.length; i < n; i++) {
                const k1 = keys1[i];
                const k2 = keys2[i];
                if (k1 !== k2) {
                    return false
                }

                const v1 = obj1[k1];
                const v2 = obj2[k2];

                if (!Utils$1.equalValues(v1, v2)) {
                    return false
                }
            }

            return true;
        }

        static equalArrays(v1, v2) {
            if (v1.length !== v2.length) {
                return false
            }
            for (let i = 0, n = v1.length; i < n; i++) {
                if (!this.equalValues(v1[i], v2[i])) {
                    return false
                }
            }

            return true
        }

    }

    /**
     * Maintains the state of a WebGLRenderingContext.
     */
    class WebGLState {

        constructor(id, gl) {
            this._id = id;
            this._gl = gl;
            this._program = undefined;
            this._buffers = new Map();
            this._framebuffers = new Map();
            this._renderbuffers = new Map();

            // Contains vertex attribute definition arrays (enabled, size, type, normalized, stride, offset).
            this._vertexAttribs = new Array(16);
            this._nonDefaultFlags = new Set();
            this._settings = new Map();
            this._textures = new Array(8);
            this._maxTexture = 0;
            this._activeTexture = gl.TEXTURE0;
            this._pixelStorei = new Array(5);
        }

        _getDefaultFlag(cap) {
            return (cap === this._gl.DITHER);
        }

        setFlag(cap, v) {
            const def = this._getDefaultFlag(cap);
            if (v === def) {
                return this._nonDefaultFlags.delete(cap);
            } else {
                if (!this._nonDefaultFlags.has(cap)) {
                    this._nonDefaultFlags.add(cap);
                    return true;
                } else {
                    return false;
                }
            }
        }

        setBuffer(target, buffer) {
            const change = this._buffers.get(target) !== buffer;
            this._buffers.set(target, buffer);

            if (change && (target === this._gl.ARRAY_BUFFER)) {
                // When the array buffer is changed all attributes are cleared.
                this._vertexAttribs = [];
            }

            return change;
        }

        setFramebuffer(target, buffer) {
            const change = this._framebuffers.get(target) !== buffer;
            this._framebuffers.set(target, buffer);
            return change;
        }

        setRenderbuffer(target, buffer) {
            const change = this._renderbuffers.get(target) !== buffer;
            this._renderbuffers.set(target, buffer);
            return change;
        }

        setProgram(program) {
            const change = this._program !== program;
            this._program = program;
            return change
        }

        setSetting(func, v) {
            const s = this._settings.get(func);
            const change = !s || !Utils$1.equalValues(s, v);
            this._settings.set(func, v);
            return change
        }

        disableVertexAttribArray(index) {
            const va = this._vertexAttribs[index];
            if (va && va[5]) {
                va[5] = false;
                return true;
            }
            return false;
        }

        enableVertexAttribArray(index) {
            const va = this._vertexAttribs[index];
            if (va) {
                if (!va[0]) {
                    va[0] = true;
                    return true;
                }
            } else {
                this._vertexAttribs[index] = [0, 0, 0, 0, 0, true];
                return true;
            }
            return false;
        }

        vertexAttribPointer(index, props) {
            let va = this._vertexAttribs[index];
            let equal = false;
            if (va) {
                equal = va[0] === props[0] &&
                    va[1] === props[1] &&
                    va[2] === props[2] &&
                    va[3] === props[3] &&
                    va[4] === props[4];
            }

            if (equal) {
                return false;
            } else {
                props[5] = va ? va[5] : false;
                return true;
            }
        }

        setActiveTexture(texture) {
            const changed = this._activeTexture !== texture;
            this._activeTexture = texture;
            return changed;
        }

        bindTexture(target, texture) {
            const activeIndex = WebGLState._getTextureIndex(this._activeTexture);
            this._maxTexture = Math.max(this._maxTexture, activeIndex + 1);
            const current = this._textures[activeIndex];
            const targetIndex = WebGLState._getTextureTargetIndex(target);
            if (current) {
                if (current[targetIndex] === texture) {
                    return false;
                }
                current[targetIndex] = texture;
                return true;
            } else {
                if (texture) {
                    this._textures[activeIndex] = [];
                    this._textures[activeIndex][targetIndex] = texture;
                    return true
                } else {
                    return false
                }
            }
        }

        setPixelStorei(pname, param) {
            const i = WebGLState._getPixelStoreiIndex(pname);
            const change = !Utils$1.equalValues(this._pixelStorei[i], param);
            this._pixelStorei[i] = param;
            return change;
        }

        migrate(s) {
            const t = this;

            // Warning: migrate should call the original prototype methods directly.

            this._migrateFlags(t, s);

            // useProgram
            if (s._program !== t._program) {
                this._gl._useProgram(s._program);
            }

            this._migrateFramebuffers(t, s);
            this._migrateRenderbuffers(t, s);

            const buffersChanged = this._migrateBuffers(t, s);
            this._migrateAttributes(t, s, buffersChanged);

            this._migrateFlags(t, s);

            this._migrateSettings(t, s);

            this._migratePixelStorei(t, s);
            
            this._migrateTextures(t, s);
            
        }

        _migratePixelStorei(t, s) {
            for (let i = 0, n = t._pixelStorei.length; i < n; i++) {
                if (t._pixelStorei[i] !== s._pixelStorei[i]) {
                    const value = s._pixelStorei[i] !== undefined ? s._pixelStorei[i] : WebGLState._getDefaultPixelStoreiByIndex(i);
                    this._gl._pixelStorei(WebGLState._getPixelStoreiByIndex(i), value);
                }
            }
        }

        _migrateTextures(t, s) {
            const max = Math.max(t._maxTexture, s._maxTexture);

            let activeTexture = t._activeTexture;

            for (let i = 0; i < max; i++) {
                const sTargets = s._textures[i];
                const tTargets = t._textures[i];
                const textureNumb = WebGLState._getTextureByIndex(i);

                const targetMax = Math.max(tTargets ? tTargets.length : 0, sTargets ? sTargets.length : 0);
                for (let j = 0, n = targetMax; j < n; j++) {
                    const target = WebGLState._getTextureTargetByIndex(j);
                    if (activeTexture !== textureNumb) {
                        this._gl._activeTexture(textureNumb);
                        activeTexture = textureNumb;
                    }

                    const texture = (sTargets && sTargets[j]) || null;
                    this._gl._bindTexture(target, texture);
                }
            }

            if (s._activeTexture !== activeTexture) {
                this._gl._activeTexture(s._activeTexture);
            }
        }

        _migrateBuffers(t, s) {
            s._buffers.forEach((framebuffer, target) => {
                if (t._buffers.get(target) !== framebuffer) {
                    this._gl._bindBuffer(target, framebuffer);
                }
            });

            t._buffers.forEach((buffer, target) => {
                const b = s._buffers.get(target);
                if (b === undefined) {
                    this._gl._bindBuffer(target, null);
                }
            });
            return (s._buffers.get(this._gl.ARRAY_BUFFER) !== t._buffers.get(this._gl.ARRAY_BUFFER))
        }

        _migrateFramebuffers(t, s) {
            s._framebuffers.forEach((framebuffer, target) => {
                if (t._framebuffers.get(target) !== framebuffer) {
                    this._gl._bindFramebuffer(target, framebuffer);
                }
            });

            t._framebuffers.forEach((framebuffer, target) => {
                const fb = s._framebuffers.get(target);
                if (fb === undefined) {
                    this._gl._bindFramebuffer(target, null);
                }
            });
        }

        _migrateRenderbuffers(t, s) {
            s._renderbuffers.forEach((renderbuffer, target) => {
                if (t._renderbuffers.get(target) !== renderbuffer) {
                    this._gl._bindRenderbuffer(target, renderbuffer);
                }
            });

            t._renderbuffers.forEach((renderbuffer, target) => {
                const fb = s._renderbuffers.get(target);
                if (fb === undefined) {
                    this._gl._bindRenderbuffer(target, null);
                }
            });
        }

        _migrateAttributes(t, s, buffersChanged) {

            if (!buffersChanged) {
                t._vertexAttribs.forEach((attrib, index) => {
                    if (!s._vertexAttribs[index]) {
                        // We can't 'delete' a vertex attrib so we'll disable it.
                        this._gl._disableVertexAttribArray(index);
                    }
                });

                s._vertexAttribs.forEach((attrib, index) => {
                    this._gl._vertexAttribPointer(index, attrib[0], attrib[1], attrib[2], attrib[4]);
                    if (attrib[5]) {
                        this._gl._enableVertexAttribArray(index);
                    } else {
                        this._gl._disableVertexAttribArray(index);
                    }
                });
            } else {
                // When buffers are changed, previous attributes were reset automatically.
                s._vertexAttribs.forEach((attrib, index) => {
                    if (attrib[0]) {
                        // Do not set vertex attrib pointer when it was just the default value.
                        this._gl._vertexAttribPointer(index, attrib[0], attrib[1], attrib[2], attrib[3], attrib[4]);
                    }
                    if (attrib[5]) {
                        this._gl._enableVertexAttribArray(index);
                    }
                });
            }
        }

        _migrateSettings(t, s) {
            const defaults = this.constructor.getDefaultSettings();
            t._settings.forEach((value, func) => {
                const name = func.name || func.xname;
                if (!s._settings.has(func)) {
                    let args = defaults.get(name);
                    if (Utils$1.isFunction(args)) {
                        args = args(this._gl);
                    }
                    // We are actually setting the setting for optimization purposes.
                    s._settings.set(func, args);
                    func.apply(this._gl, args);
                }
            });
            s._settings.forEach((value, func) => {
                const tValue = t._settings.get(func);
                if (!tValue || !Utils$1.equalValues(tValue, value)) {
                    func.apply(this._gl, value);
                }
            });
        }

        _migrateFlags(t, s) {
            t._nonDefaultFlags.forEach(setting => {
                if (!s._nonDefaultFlags.has(setting)) {
                    if (this._getDefaultFlag(setting)) {
                        this._gl._enable(setting);
                    } else {
                        this._gl._disable(setting);
                    }
                }
            });
            s._nonDefaultFlags.forEach(setting => {
                if (!t._nonDefaultFlags.has(setting)) {
                    if (this._getDefaultFlag(setting)) {
                        this._gl._disable(setting);
                    } else {
                        this._gl._enable(setting);
                    }
                }
            });
        }

        static getDefaultSettings() {
            if (!this._defaultSettings) {
                this._defaultSettings = new Map();
                const d = this._defaultSettings;
                const g = WebGLRenderingContext.prototype;
                d.set("viewport", function(gl) {return [0,0,gl.canvas.width, gl.canvas.height]});
                d.set("scissor", function(gl) {return [0,0,gl.canvas.width, gl.canvas.height]});
                d.set("blendColor", [0, 0, 0, 0]);
                d.set("blendEquation", [g.FUNC_ADD]);
                d.set("blendEquationSeparate", [g.FUNC_ADD, g.FUNC_ADD]);
                d.set("blendFunc", [g.ONE, g.ZERO]);
                d.set("blendFuncSeparate", [g.ONE, g.ZERO, g.ONE, g.ZERO]);
                d.set("clearColor", [0, 0, 0, 0]);
                d.set("clearDepth", [1]);
                d.set("clearStencil", [0]);
                d.set("colorMask", [true, true, true, true]);
                d.set("cullFace", [g.BACK]);
                d.set("depthFunc", [g.LESS]);
                d.set("depthMask", [true]);
                d.set("depthRange", [0, 1]);
                d.set("frontFace", [g.CCW]);
                d.set("lineWidth", [1]);
                d.set("polygonOffset", [0, 0]);
                d.set("sampleCoverage", [1, false]);
                d.set("stencilFunc", [g.ALWAYS, 0, 1]);
                d.set("_stencilFuncSeparateFront", [g.ALWAYS, 0, 1]);
                d.set("_stencilFuncSeparateBack", [g.ALWAYS, 0, 1]);
                d.set("_stencilFuncSeparateFrontAndBack", [g.ALWAYS, 0, 1]);
                d.set("stencilMask", [1]);
                d.set("_stencilMaskSeparateFront", [1]);
                d.set("_stencilMaskSeparateBack", [1]);
                d.set("_stencilMaskSeparateFrontAndBack", [1]);
                d.set("stencilOp", [g.KEEP, g.KEEP, g.KEEP]);
                d.set("_stencilOpSeparateFront", [g.KEEP, g.KEEP, g.KEEP]);
                d.set("_stencilOpSeparateBack", [g.KEEP, g.KEEP, g.KEEP]);
                d.set("_stencilOpSeparateFrontAndBack", [g.KEEP, g.KEEP, g.KEEP]);
                d.set("vertexAttrib1f", []);
                d.set("vertexAttrib1fv", []);
                d.set("vertexAttrib2f", []);
                d.set("vertexAttrib2fv", []);
                d.set("vertexAttrib3f", []);
                d.set("vertexAttrib3fv", []);
                d.set("vertexAttrib4f", []);
                d.set("vertexAttrib4fv", []);
            }
            return this._defaultSettings
        }

        static _getTextureTargetIndex(target) {
            switch(target) {
                case 0x0DE1:
                    /* TEXTURE_2D */
                    return 0;
                case 0x8513:
                    /* TEXTURE_CUBE_MAP */
                    return 1;
                default:
                    // Shouldn't happen.
                    throw new Error('Unknown texture target: ' + target);
            }
        }

        static _getTextureTargetByIndex(index) {
            if (!this._textureTargetIndices) {
                this._textureTargetIndices = [0x0DE1, 0x8513];
            }
            return this._textureTargetIndices[index]
        }

        static _getTextureIndex(index) {
            return index - 0x84C0 /* GL_TEXTURE0 */;
        }

        static _getTextureByIndex(index) {
            return index + 0x84C0;
        }

        static _getPixelStoreiIndex(pname) {
            switch(pname) {
                case 0x0D05:
                    /* PACK_ALIGNMENT */
                    return 0;
                case 0x0CF5:
                    /* UNPACK_ALIGNMENT */
                    return 1;
                case 0x9240:
                    /* UNPACK_FLIP_Y_WEBGL */
                    return 2;
                case 0x9241:
                    /* UNPACK_PREMULTIPLY_ALPHA_WEBGL */
                    return 3;
                case 0x9243:
                    /* UNPACK_COLORSPACE_CONVERSION_WEBGL */
                    return 4;
                    //@todo: support WebGL2 properties, see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/pixelStorei
                case 0x9245:
                    /* UNPACK_FLIP_BLUE_RED */
                    return 5;
                default:
                    // Shouldn't happen.
                    throw new Error('Unknown pixelstorei: ' + pname);
            }
        }

        static _getPixelStoreiByIndex(index) {
            if (!this._pixelStoreiIndices) {
                this._pixelStoreiIndices = [0x0D05, 0x0CF5, 0x9240, 0x9241, 0x9243];
            }
            return this._pixelStoreiIndices[index]
        }

        static _getDefaultPixelStoreiByIndex(index) {
            if (!this._pixelStoreiDefaults) {
                this._pixelStoreiDefaults = [4, 4, false, false, WebGLRenderingContext.prototype.BROWSER_DEFAULT_WEBGL];
            }
            return this._pixelStoreiDefaults[index]
        }
    }

    class WebGLStateManager {

        _initStateManager(id = "default") {
            this._states = {};
            this._state = this._getState(id);
        }

        _getState(id) {
            if (!this._states[id]) {
                this._states[id] = new WebGLState(id, this);
            }
            return this._states[id];
        }

        switchState(id = "default") {
            if (this._state._id !== id) {
                const newState = this._getState(id);
                this._state.migrate(newState);
                this._state = newState;
            }
        }

        $useProgram(program) {
            if (this._state.setProgram(program))
                this._useProgram(program);
        }

        $bindBuffer(target, fb) {
            if (this._state.setBuffer(target, fb))
                this._bindBuffer(target, fb);
        }

        $bindFramebuffer(target, fb) {
            if (this._state.setFramebuffer(target, fb))
                this._bindFramebuffer(target, fb);
        }

        $bindRenderbuffer(target, fb) {
            if (this._state.setRenderbuffer(target, fb))
                this._bindRenderbuffer(target, fb);
        }

        $enable(cap) {
            if (this._state.setFlag(cap, true))
                this._enable(cap);
        }

        $disable(cap) {
            if (this._state.setFlag(cap, false))
                this._disable(cap);
        }

        $viewport(x, y, w, h) {
            if (this._state.setSetting(this._viewport, [x, y, w, h]))
                this._viewport(x, y, w, h);
        }

        $scissor(x, y, w, h) {
            if (this._state.setSetting(this._scissor, [x, y, w, h]))
                this._scissor(x, y, w, h);
        }

        $disableVertexAttribArray(index) {
            if (this._state.disableVertexAttribArray(index))
                this._disableVertexAttribArray(index);
        }

        $enableVertexAttribArray(index) {
            if (this._state.enableVertexAttribArray(index))
                this._enableVertexAttribArray(index);
        }

        $vertexAttribPointer(index, size, type, normalized, stride, offset) {
            if (this._state.vertexAttribPointer(index, [size, type, normalized, stride, offset]))
                this._vertexAttribPointer(index, size, type, normalized, stride, offset);
        }

        $activeTexture(texture) {
            if (this._state.setActiveTexture(texture))
                this._activeTexture(texture);
        }

        $bindTexture(target, texture) {
            if (this._state.bindTexture(target, texture))
                this._bindTexture(target, texture);
        }

        $pixelStorei(pname, param) {
            if (this._state.setPixelStorei(pname, param)) {
                this._pixelStorei(pname, param);
            }
        }

        $stencilFuncSeparate(face, func, ref, mask) {
            let f;
            switch(face) {
                case this.FRONT:
                    f = this._stencilFuncSeparateFront;
                    break;
                case this.BACK:
                    f = this._stencilFuncSeparateBack;
                    break;
                case this.FRONT_AND_BACK:
                    f = this._stencilFuncSeparateFrontAndBack;
                    break;
            }

            if (this._state.setSetting(f, [func, ref, mask]))
                f.apply(this, [func, ref, mask]);
        }

        _stencilFuncSeparateFront(func, ref, mask) {
            this._stencilFuncSeparate(this.FRONT, func, ref, mask);
        }

        _stencilFuncSeparateBack(func, ref, mask) {
            this._stencilFuncSeparate(this.BACK, func, ref, mask);
        }

        _stencilFuncSeparateFrontAndBack(func, ref, mask) {
            this._stencilFuncSeparate(this.FRONT_AND_BACK, func, ref, mask);
        }

        $stencilMaskSeparate(face, mask) {
            let f;
            switch(face) {
                case this.FRONT:
                    f = this._stencilMaskSeparateFront;
                    break;
                case this.BACK:
                    f = this._stencilMaskSeparateBack;
                    break;
                case this.FRONT_AND_BACK:
                    f = this._stencilMaskSeparateFrontAndBack;
                    break;
            }

            if (this._state.setSetting(f, [mask]))
                f.apply(this, [mask]);
        }

        _stencilMaskSeparateFront(mask) {
            this._stencilMaskSeparate(this.FRONT, mask);
        }

        _stencilMaskSeparateBack(mask) {
            this._stencilMaskSeparate(this.BACK, mask);
        }

        _stencilMaskSeparateFrontAndBack(mask) {
            this._stencilMaskSeparate(this.FRONT_AND_BACK, mask);
        }

        $stencilOpSeparate(face, fail, zfail, zpass) {
            let f;
            switch(face) {
                case this.FRONT:
                    f = this._stencilOpSeparateFront;
                    break;
                case this.BACK:
                    f = this._stencilOpSeparateBack;
                    break;
                case this.FRONT_AND_BACK:
                    f = this._stencilOpSeparateFrontAndBack;
                    break;
            }

            if (this._state.setSetting(f, [fail, zfail, zpass]))
                f.apply(this, [fail, zfail, zpass]);
        }

        _stencilOpSeparateFront(fail, zfail, zpass) {
            this._stencilOpSeparate(this.FRONT, fail, zfail, zpass);
        }

        _stencilOpSeparateBack(fail, zfail, zpass) {
            this._stencilOpSeparate(this.BACK, fail, zfail, zpass);
        }

        _stencilOpSeparateFrontAndBack(fail, zfail, zpass) {
            this._stencilOpSeparate(this.FRONT_AND_BACK, fail, zfail, zpass);
        }

        $blendColor(red, green, blue, alpha) {
            if (this._state.setSetting(this._blendColor, [red, green, blue, alpha]))
                this._blendColor(red, green, blue, alpha);
        }

        $blendEquation(mode) {
            if (this._state.setSetting(this._blendEquation, [mode]))
                this._blendEquation(mode);
        }

        $blendEquationSeparate(modeRGB, modeAlpha) {
            if (this._state.setSetting(this._blendEquationSeparate, [modeRGB, modeAlpha]))
                this._blendEquationSeparate(modeRGB, modeAlpha);
        }

        $blendFunc(sfactor, dfactor) {
            if (this._state.setSetting(this._blendFunc, [sfactor, dfactor]))
                this._blendFunc(sfactor, dfactor);
        }

        $blendFuncSeparate(srcRGB, dstRGB, srcAlpha, dstAlpha) {
            if (this._state.setSetting(this._blendFuncSeparate, [srcRGB, dstRGB, srcAlpha, dstAlpha]))
                this._blendFuncSeparate(srcRGB, dstRGB, srcAlpha, dstAlpha);
        }

        $clearColor(red, green, blue, alpha) {
            if (this._state.setSetting(this._clearColor, [red, green, blue, alpha]))
                this._clearColor(red, green, blue, alpha);
        }

        $clearDepth(depth) {
            if (this._state.setSetting(this._clearDepth, [depth]))
                this._clearDepth(depth);
        }

        $clearStencil(s) {
            if (this._state.setSetting(this._clearStencil, [s]))
                this._clearStencil(s);
        }

        $colorMask(red, green, blue, alpha) {
            if (this._state.setSetting(this._colorMask, [red, green, blue, alpha]))
                this._colorMask(red, green, blue, alpha);
        }

        $cullFace(mode) {
            if (this._state.setSetting(this._cullFace, [mode]))
                this._cullFace(mode);
        }

        $depthFunc(func) {
            if (this._state.setSetting(this._depthFunc, [func]))
                this._depthFunc(func);
        }

        $depthMask(flag) {
            if (this._state.setSetting(this._depthMask, [flag]))
                this._depthMask(flag);
        }

        $depthRange(zNear, zFar) {
            if (this._state.setSetting(this._depthRange, [zNear, zFar]))
                this._depthRange(zNear, zFar);
        }

        $frontFace(mode) {
            if (this._state.setSetting(this._frontFace, [mode]))
                this._frontFace(mode);
        }

        $lineWidth(width) {
            if (this._state.setSetting(this._lineWidth, [width]))
                this._lineWidth(width);
        }

        $polygonOffset(factor, units) {
            if (this._state.setSetting(this._polygonOffset, [factor, units]))
                this._polygonOffset(factor, units);
        }

        $sampleCoverage(value, invert) {
            if (this._state.setSetting(this._sampleCoverage, [value, invert]))
                this._sampleCoverage(value, invert);
        }

        $stencilFunc(func, ref, mask) {
            if (this._state.setSetting(this._stencilFunc, [func, ref, mask]))
                this._stencilFunc(func, ref, mask);
        }

        $stencilMask(mask) {
            if (this._state.setSetting(this._stencilMask, [mask]))
                this._stencilMask(mask);
        }

        $stencilOp(fail, zfail, zpass) {
            if (this._state.setSetting(this._stencilOp, [fail, zfail, zpass]))
                this._stencilOp(fail, zfail, zpass);
        }

        $vertexAttrib1f(indx, x) {
            if (this._state.setSetting(this._vertexAttrib1f, [indx, x]))
                this._vertexAttrib1f(indx, x);
        }

        $vertexAttrib1fv(indx, values) {
            if (this._state.setSetting(this._vertexAttrib1fv, [indx, values]))
                this._vertexAttrib1fv(indx, values);
        }

        $vertexAttrib2f(indx, x, y) {
            if (this._state.setSetting(this._vertexAttrib2f, [indx, x, y]))
                this._vertexAttrib2f(indx, x, y);
        }

        $vertexAttrib2fv(indx, values) {
            if (this._state.setSetting(this._vertexAttrib2fv, [indx, values]))
                this._vertexAttrib2fv(indx, values);
        }

        $vertexAttrib3f(indx, x, y, z) {
            if (this._state.setSetting(this._vertexAttrib3f, [indx, x, y, z]))
                this._vertexAttrib3f(indx, x, y, z);
        }

        $vertexAttrib3fv(indx, values) {
            if (this._state.setSetting(this._vertexAttrib3fv, [indx, values]))
                this._vertexAttrib3fv(indx, values);
        }

        $vertexAttrib4f(indx, x, y, z, w) {
            if (this._state.setSetting(this._vertexAttrib4f, [indx, x, y, z, w]))
                this._vertexAttrib4f(indx, x, y, z, w);
        }

        $vertexAttrib4fv(indx, values) {
            if (this._state.setSetting(this._vertexAttrib4fv, [indx, values]))
                this._vertexAttrib4fv(indx, values);
        }

        /**
         * Sets up the rendering context for context sharing.
         * @param {WebGLRenderingContext} gl
         * @param {string} id
         */
        static enable(gl, id = "default") {
            const names = Object.getOwnPropertyNames(WebGLStateManager.prototype);
            const WebGLRenderingContextProto = gl.__proto__;
            names.forEach(name => {
                if (name !== "constructor") {
                    const method = WebGLStateManager.prototype[name];
                    if (name.charAt(0) === "$") {
                        name = name.substr(1);
                    }
                    if (gl[name]) {
                        if (!gl[name].name) {
                            // We do this for compatibility with the Chrome WebGL Inspector plugin.
                            gl[name].xname = name;
                        }
                        gl['_' + name] = gl[name];
                    }
                    gl[name] = method;
                }
            });

            WebGLStateManager.prototype._initStateManager.call(gl, id);

            return gl;
        }

    }

    class TextureManager {

        constructor(stage) {
            this.stage = stage;

            /**
             * The currently used amount of texture memory.
             * @type {number}
             */
            this._usedMemory = 0;

            /**
             * All uploaded texture sources.
             * @type {TextureSource[]}
             */
            this._uploadedTextureSources = [];

            /**
             * The texture source lookup id to texture source hashmap.
             * @type {Map<String, TextureSource>}
             */
            this.textureSourceHashmap = new Map();

        }

        get usedMemory() {
            return this._usedMemory;
        }

        destroy() {
            for (let i = 0, n = this._uploadedTextureSources.length; i < n; i++) {
                this._nativeFreeTextureSource(this._uploadedTextureSources[i]);
            }
            
            this.textureSourceHashmap.clear();
            this._usedMemory = 0;
        }

        getReusableTextureSource(id) {
            return this.textureSourceHashmap.get(id);
        }

        getTextureSource(func, id) {
            // Check if texture source is already known.
            let textureSource = id ? this.textureSourceHashmap.get(id) : null;
            if (!textureSource) {
                // Create new texture source.
                textureSource = new TextureSource(this, func);

                if (id) {
                    textureSource.lookupId = id;
                    this.textureSourceHashmap.set(id, textureSource);
                }
            }

            return textureSource;
        }

        uploadTextureSource(textureSource, options) {
            if (textureSource.isLoaded()) return;

            this._addMemoryUsage(textureSource.w * textureSource.h);

            // Load texture.
            const nativeTexture = this._nativeUploadTextureSource(textureSource, options);

            textureSource._nativeTexture = nativeTexture;

            // We attach w and h to native texture (we need it in CoreRenderState._isRenderTextureReusable).
            nativeTexture.w = textureSource.w;
            nativeTexture.h = textureSource.h;

            nativeTexture.update = this.stage.frameCounter;

            this._uploadedTextureSources.push(textureSource);
            
            this.addToLookupMap(textureSource);
        }

        _addMemoryUsage(delta) {
            this._usedMemory += delta;
            this.stage.addMemoryUsage(delta);
        }
        
        addToLookupMap(textureSource) {
            const lookupId = textureSource.lookupId;
            if (lookupId) {
                if (!this.textureSourceHashmap.has(lookupId)) {
                    this.textureSourceHashmap.set(lookupId, textureSource);
                }
            }
        }

        gc() {
            this.freeUnusedTextureSources();
            this._cleanupLookupMap();
        }
        
        freeUnusedTextureSources() {
            let remainingTextureSources = [];
            for (let i = 0, n = this._uploadedTextureSources.length; i < n; i++) {
                let ts = this._uploadedTextureSources[i];
                if (ts.allowCleanup()) {
                    this._freeManagedTextureSource(ts);
                } else {
                    remainingTextureSources.push(ts);
                }
            }

            this._uploadedTextureSources = remainingTextureSources;

            this._cleanupLookupMap();
        }

        _freeManagedTextureSource(textureSource) {
            if (textureSource.isLoaded()) {
                this._nativeFreeTextureSource(textureSource);
                this._addMemoryUsage(-textureSource.w * textureSource.h);
            }

            // Should be reloaded.
            textureSource.loadingSince = null;
        }

        _cleanupLookupMap() {
            // We keep those that still have value (are being loaded or already loaded, or are likely to be reused).
            this.textureSourceHashmap.forEach((textureSource, lookupId) => {
                if (!(textureSource.isLoaded() || textureSource.isLoading()) && !textureSource.isUsed()) {
                    this.textureSourceHashmap.delete(lookupId);
                }
            });
        }

        /**
         * Externally free texture source.
         * @param textureSource
         */
        freeTextureSource(textureSource) {
            const index = this._uploadedTextureSources.indexOf(textureSource);
            const managed = (index !== -1);

            if (textureSource.isLoaded()) {
                if (managed) {
                    this._addMemoryUsage(-textureSource.w * textureSource.h);
                    this._uploadedTextureSources.splice(index, 1);
                }
                this._nativeFreeTextureSource(textureSource);
            }

            // Should be reloaded.
            textureSource.loadingSince = null;

            // Delete it from the texture source hashmap to allow GC to collect it.
            // If it is still referenced somewhere, we'll re-add it later.
            this.removeFromLookupMap(textureSource);
        }

        _nativeUploadTextureSource(textureSource, options) {
            return this.stage.renderer.uploadTextureSource(textureSource, options);
        }

        _nativeFreeTextureSource(textureSource) {
            this.stage.renderer.freeTextureSource(textureSource);
            textureSource.clearNativeTexture();
        }

    }

    class CoreContext {

        constructor(stage) {
            this.stage = stage;

            this.root = null;

            this.updateTreeOrder = 0;

            this.renderState = this.stage.renderer.createCoreRenderState(this);

            this.renderExec = this.stage.renderer.createCoreRenderExecutor(this);
            this.renderExec.init();

            this._usedMemory = 0;
            this._renderTexturePool = [];

            this._renderTextureId = 1;

            this._zSorts = [];
        }

        get usedMemory() {
            return this._usedMemory;
        }

        destroy() {
            this._renderTexturePool.forEach(texture => this._freeRenderTexture(texture));
            this._usedMemory = 0;
        }

        hasRenderUpdates() {
            return !!this.root._parent._hasRenderUpdates;
        }

        frame() {
            this._update();

            this._performForcedZSorts();

            // Clear flag to identify if anything changes before the next frame.
            this.root._parent._hasRenderUpdates = 0;

            this.render();

            return true;
        }

        _update() {
            this.update();

            // Due to the boundsVisibility flag feature (and onAfterUpdate hook), it is possible that other views were
            // changed during the update loop (for example due to the txLoaded event). We process these changes immediately
            // (but not recursively to prevent infinite loops).
            if (this.root._hasUpdates) {
                this.update();
            }
        }

        /**
         * Certain ViewCore items may be forced to zSort to strip out references to prevent memleaks..
         */
        _performForcedZSorts() {
            const n = this._zSorts.length;
            if (n) {
                // Forced z-sorts (ViewCore may force a z-sort in order to free memory/prevent memory leaks).
                for (let i = 0, n = this._zSorts.length; i < n; i++) {
                    if (this._zSorts[i].zSort) {
                        this._zSorts[i].sortZIndexedChildren();
                    }
                }
                this._zSorts = [];
            }
        }

        update() {
            this.updateTreeOrder = 0;

            this.root.update();
        }

        render() {
            // Obtain a sequence of the quad operations.
            this._fillRenderState();

            // Now run them with the render executor.
            this._performRender();
        }

        _fillRenderState() {
            this.renderState.reset();
            this.root.render();
            this.renderState.finish();
        }

        _performRender() {
            this.renderExec.execute();
        }

        _addMemoryUsage(delta) {
            this._usedMemory += delta;
            this.stage.addMemoryUsage(delta);
        }

        allocateRenderTexture(w, h) {
            let prec = this.stage.getRenderPrecision();
            let pw = Math.max(1, Math.round(w * prec));
            let ph = Math.max(1, Math.round(h * prec));

            // Search last item first, so that last released render texture is preferred (may cause memory cache benefits).
            const n = this._renderTexturePool.length;
            for (let i = n - 1; i >= 0; i--) {
                const texture = this._renderTexturePool[i];
                // We don't want to reuse the same render textures within the same frame because that will create gpu stalls.
                if (texture.w === pw && texture.h === ph && (texture.update !== this.stage.frameCounter)) {
                    texture.f = this.stage.frameCounter;
                    this._renderTexturePool.splice(i, 1);
                    return texture;
                }
            }

            const texture = this._createRenderTexture(w, h, pw, ph);
            texture.precision = prec;
            return texture;
        }

        releaseRenderTexture(texture) {
            this._renderTexturePool.push(texture);
        }

        freeUnusedRenderTextures(maxAge = 60) {
            // Clean up all textures that are no longer used.
            // This cache is short-lived because it is really just meant to supply running shaders that are
            // updated during a number of frames.
            let limit = this.stage.frameCounter - maxAge;

            this._renderTexturePool = this._renderTexturePool.filter(texture => {
                if (texture.f <= limit) {
                    this._freeRenderTexture(texture);
                    return false;
                }
                return true;
            });
        }

        _createRenderTexture(w, h, pw, ph) {
            this._addMemoryUsage(pw * ph);

            const texture = this.stage.renderer.createRenderTexture(w, h, pw, ph);
            texture.id = this._renderTextureId++;
            texture.f = this.stage.frameCounter;
            texture.ow = w;
            texture.oh = h;
            texture.w = pw;
            texture.h = ph;

            return texture;
        }

        _freeRenderTexture(nativeTexture) {
            this.stage.renderer.freeRenderTexture(nativeTexture);
            this._addMemoryUsage(-nativeTexture.w * nativeTexture.h);
        }

        copyRenderTexture(renderTexture, nativeTexture, options) {
            this.stage.renderer.copyRenderTexture(renderTexture, nativeTexture, options);
        }

        forceZSort(viewCore) {
            this._zSorts.push(viewCore);
        }

    }

    class TransitionSettings {
        constructor(stage) {
            this.stage = stage;
            this._timingFunction = 'ease';
            this._timingFunctionImpl = StageUtils.getTimingFunction(this._timingFunction);
            this.delay = 0;
            this.duration = 0.2;
            this.merger = null;
        }

        get timingFunction() {
            return this._timingFunction;
        }

        set timingFunction(v) {
            this._timingFunction = v;
            this._timingFunctionImpl = StageUtils.getTimingFunction(v);
        }

        get timingFunctionImpl() {
            return this._timingFunctionImpl;
        }

        patch(settings) {
            this.stage.patchObject(this, settings);
        }
    }

    TransitionSettings.prototype.isTransitionSettings = true;

    class TransitionManager {

        constructor(stage) {
            this.stage = stage;

            this.stage.on('frameStart', () => this.progress());

            /**
             * All transitions that are running and attached.
             * (we don't support transitions on un-attached views to prevent memory leaks)
             * @type {Set<Transition>}
             */
            this.active = new Set();

            this.defaultTransitionSettings = new TransitionSettings(this.stage);
        }

        progress() {
            if (this.active.size) {
                let dt = this.stage.dt;

                let filter = false;
                this.active.forEach(function(a) {
                    a.progress(dt);
                    if (!a.isRunning()) {
                        filter = true;
                    }
                });

                if (filter) {
                    this.active = new Set([...this.active].filter(t => (t.isRunning())));
                }
            }
        }

        createSettings(settings) {
            let transitionSettings = new TransitionSettings(this.stage);
            transitionSettings.patch(settings);
            return transitionSettings;
        }

        addActive(transition) {
            this.active.add(transition);
        }

        removeActive(transition) {
            this.active.delete(transition);
        }
    }

    class MultiSpline {

        constructor() {
            this._clear();
        }

        _clear() {
            this._p = [];
            this._pe = [];
            this._idp = [];
            this._f = [];
            this._v = [];
            this._lv = [];
            this._sm = [];
            this._s = [];
            this._ve = [];
            this._sme = [];
            this._se = [];

            this._length = 0;
        }

        parse(rgba, def) {
            let i, n;
            if (!Utils.isObjectLiteral(def)) {
                def = {0: def};
            }

            let defaultSmoothness = 0.5;

            let items = [];
            for (let key in def) {
                if (def.hasOwnProperty(key)) {
                    let obj = def[key];
                    if (!Utils.isObjectLiteral(obj)) {
                        obj = {v: obj};
                    }

                    let p = parseFloat(key);

                    if (key === "sm") {
                        defaultSmoothness = obj.v;
                    } else if (!isNaN(p) && p >= 0 && p <= 2) {
                        obj.p = p;

                        obj.f = Utils.isFunction(obj.v);
                        obj.lv = obj.f ? obj.v(0, 0) : obj.v;

                        items.push(obj);
                    }
                }
            }

            // Sort by progress value.
            items = items.sort(function(a, b) {return a.p - b.p});

            n = items.length;

            for (i = 0; i < n; i++) {
                let last = (i === n - 1);
                if (!items[i].hasOwnProperty('pe')) {
                    // Progress.
                    items[i].pe = last ? (items[i].p <= 1 ? 1 : 2 /* support onetotwo stop */) : items[i + 1].p;
                } else {
                    // Prevent multiple items at the same time.
                    const max = i < n - 1 ? items[i + 1].p : 1;
                    if (items[i].pe > max) {
                        items[i].pe = max;
                    }
                }
                if (items[i].pe === items[i].p) {
                    items[i].idp = 0;
                } else {
                    items[i].idp = 1 / (items[i].pe - items[i].p);
                }
            }

            // Color merger: we need to split/combine RGBA components.

            // Calculate bezier helper values.;
            for (i = 0; i < n; i++) {
                if (!items[i].hasOwnProperty('sm')) {
                    // Smoothness.;
                    items[i].sm = defaultSmoothness;
                }
                if (!items[i].hasOwnProperty('s')) {
                    // Slope.;
                    if (i === 0 || i === n - 1 || (items[i].p === 1 /* for onetotwo */)) {
                        // Horizontal slope at start and end.;
                        items[i].s = rgba ? [0, 0, 0, 0] : 0;
                    } else {
                        const pi = items[i - 1];
                        const ni = items[i + 1];
                        if (pi.p === ni.p) {
                            items[i].s = rgba ? [0, 0, 0, 0] : 0;
                        } else {
                            if (rgba) {
                                const nc = MultiSpline.getRgbaComponents(ni.lv);
                                const pc = MultiSpline.getRgbaComponents(pi.lv);
                                const d = 1 / (ni.p - pi.p);
                                items[i].s = [
                                    d * (nc[0] - pc[0]),
                                    d * (nc[1] - pc[1]),
                                    d * (nc[2] - pc[2]),
                                    d * (nc[3] - pc[3])
                                ];
                            } else {
                                items[i].s = (ni.lv - pi.lv) / (ni.p - pi.p);
                            }
                        }
                    }
                }
            }

            for (i = 0; i < n - 1; i++) {
                // Calculate value function.;
                if (!items[i].f) {

                    let last = (i === n - 1);
                    if (!items[i].hasOwnProperty('ve')) {
                        items[i].ve = last ? items[i].lv : items[i + 1].lv;
                    }

                    // We can only interpolate on numeric values. Non-numeric values are set literally when reached time.
                    if (Utils.isNumber(items[i].v) && Utils.isNumber(items[i].lv)) {
                        if (!items[i].hasOwnProperty('sme')) {
                            items[i].sme = last ? defaultSmoothness : items[i + 1].sm;
                        }
                        if (!items[i].hasOwnProperty('se')) {
                            items[i].se = last ? (rgba ? [0, 0, 0, 0] : 0) : items[i + 1].s;
                        }

                        // Generate spline.;
                        if (rgba) {
                            items[i].v = MultiSpline.getSplineRgbaValueFunction(items[i].v, items[i].ve, items[i].p, items[i].pe, items[i].sm, items[i].sme, items[i].s, items[i].se);
                        } else {
                            items[i].v = MultiSpline.getSplineValueFunction(items[i].v, items[i].ve, items[i].p, items[i].pe, items[i].sm, items[i].sme, items[i].s, items[i].se);
                        }

                        items[i].f = true;
                    }
                }
            }

            if (this.length) {
                this._clear();
            }

            for (i = 0, n = items.length; i < n; i++) {
                this._add(items[i]);
            }
        }

        _add(item) {
            this._p.push(item.p || 0);
            this._pe.push(item.pe || 0);
            this._idp.push(item.idp || 0);
            this._f.push(item.f || false);
            this._v.push(item.hasOwnProperty('v') ? item.v : 0 /* v might be false or null */ );
            this._lv.push(item.lv || 0);
            this._sm.push(item.sm || 0);
            this._s.push(item.s || 0);
            this._ve.push(item.ve || 0);
            this._sme.push(item.sme || 0);
            this._se.push(item.se || 0);
            this._length++;
        }

        _getItem(p) {
            const n = this._length;
            if (!n) {
                return -1;
            }

            if (p < this._p[0]) {
                return 0;
            }

            for (let i = 0; i < n; i++) {
                if (this._p[i] <= p && p < this._pe[i]) {
                    return i;
                }
            }

            return n - 1;
        }

        getValue(p) {
            const i = this._getItem(p);
            if (i === -1) {
                return undefined;
            } else {
                if (this._f[i]) {
                    const o = Math.min(1, Math.max(0, (p - this._p[i]) * this._idp[i]));
                    return this._v[i](o);
                } else {
                    return this._v[i];
                }
            }
        }

        get length() {
            return this._length;
        }

        static getRgbaComponents(argb) {
            let r = ((argb / 65536) | 0) % 256;
            let g = ((argb / 256) | 0) % 256;
            let b = argb % 256;
            let a = ((argb / 16777216) | 0);
            return [r, g, b, a];
        };

        static getSplineValueFunction(v1, v2, p1, p2, o1, i2, s1, s2) {
            // Normalize slopes because we use a spline that goes from 0 to 1.
            let dp = p2 - p1;
            s1 *= dp;
            s2 *= dp;

            let helpers = MultiSpline.getSplineHelpers(v1, v2, o1, i2, s1, s2);
            if (!helpers) {
                return function (p) {
                    if (p === 0) return v1;
                    if (p === 1) return v2;

                    return v2 * p + v1 * (1 - p);
                };
            } else {
                return function (p) {
                    if (p === 0) return v1;
                    if (p === 1) return v2;
                    return MultiSpline.calculateSpline(helpers, p);
                };
            }
        };

        static getSplineRgbaValueFunction(v1, v2, p1, p2, o1, i2, s1, s2) {
            // Normalize slopes because we use a spline that goes from 0 to 1.
            let dp = p2 - p1;
            s1[0] *= dp;
            s1[1] *= dp;
            s1[2] *= dp;
            s1[3] *= dp;
            s2[0] *= dp;
            s2[1] *= dp;
            s2[2] *= dp;
            s2[3] *= dp;

            let cv1 = MultiSpline.getRgbaComponents(v1);
            let cv2 = MultiSpline.getRgbaComponents(v2);

            let helpers = [
                MultiSpline.getSplineHelpers(cv1[0], cv2[0], o1, i2, s1[0], s2[0]),
                MultiSpline.getSplineHelpers(cv1[1], cv2[1], o1, i2, s1[1], s2[1]),
                MultiSpline.getSplineHelpers(cv1[2], cv2[2], o1, i2, s1[2], s2[2]),
                MultiSpline.getSplineHelpers(cv1[3], cv2[3], o1, i2, s1[3], s2[3])
            ];

            if (!helpers[0]) {
                return function (p) {
                    // Linear.
                    if (p === 0) return v1;
                    if (p === 1) return v2;

                    return MultiSpline.mergeColors(v2, v1, p);
                };
            } else {
                return function (p) {
                    if (p === 0) return v1;
                    if (p === 1) return v2;

                    return MultiSpline.getArgbNumber([
                        Math.min(255, MultiSpline.calculateSpline(helpers[0], p)),
                        Math.min(255, MultiSpline.calculateSpline(helpers[1], p)),
                        Math.min(255, MultiSpline.calculateSpline(helpers[2], p)),
                        Math.min(255, MultiSpline.calculateSpline(helpers[3], p))
                    ]);
                };
            }

        };

        /**
         * Creates helpers to be used in the spline function.
         * @param {number} v1
         *   From value.
         * @param {number} v2
         *   To value.
         * @param {number} o1
         *   From smoothness (0 = linear, 1 = smooth).
         * @param {number} s1
         *   From slope (0 = horizontal, infinite = vertical).
         * @param {number} i2
         *   To smoothness.
         * @param {number} s2
         *   To slope.
         * @returns {Number[]}
         *   The helper values to be supplied to the spline function.
         *   If the configuration is actually linear, null is returned.
         */
        static getSplineHelpers(v1, v2, o1, i2, s1, s2) {
            if (!o1 && !i2) {
                // Linear.
                return null;
            }

            // Cubic bezier points.
            // http://cubic-bezier.com/
            let csx = o1;
            let csy = v1 + s1 * o1;
            let cex = 1 - i2;
            let cey = v2 - s2 * i2;

            let xa = 3 * csx - 3 * cex + 1;
            let xb = -6 * csx + 3 * cex;
            let xc = 3 * csx;

            let ya = 3 * csy - 3 * cey + v2 - v1;
            let yb = 3 * (cey + v1) - 6 * csy;
            let yc = 3 * (csy - v1);
            let yd = v1;

            return [xa, xb, xc, ya, yb, yc, yd];
        };

        /**
         * Calculates the intermediate spline value based on the specified helpers.
         * @param {number[]} helpers
         *   Obtained from getSplineHelpers.
         * @param {number} p
         * @return {number}
         */
        static calculateSpline(helpers, p) {
            let xa = helpers[0];
            let xb = helpers[1];
            let xc = helpers[2];
            let ya = helpers[3];
            let yb = helpers[4];
            let yc = helpers[5];
            let yd = helpers[6];

            if (xa === -2 && ya === -2 && xc === 0 && yc === 0) {
                // Linear.
                return p;
            }

            // Find t for p.
            let t = 0.5, cbx, dx;

            for (let it = 0; it < 20; it++) {
                // Cubic bezier function: f(t)=t*(t*(t*a+b)+c).
                cbx = t * (t * (t * xa + xb) + xc);

                dx = p - cbx;
                if (dx > -1e-8 && dx < 1e-8) {
                    // Solution found!
                    return t * (t * (t * ya + yb) + yc) + yd;
                }

                // Cubic bezier derivative function: f'(t)=t*(t*(3*a)+2*b)+c
                let cbxd = t * (t * (3 * xa) + 2 * xb) + xc;

                if (cbxd > 1e-10 && cbxd < 1e-10) {
                    // Problematic. Fall back to binary search method.
                    break;
                }

                t += dx / cbxd;
            }

            // Fallback: binary search method. This is more reliable when there are near-0 slopes.
            let minT = 0;
            let maxT = 1;
            for (let it = 0; it < 20; it++) {
                t = 0.5 * (minT + maxT);

                // Cubic bezier function: f(t)=t*(t*(t*a+b)+c)+d.
                cbx = t * (t * (t * xa + xb) + xc);

                dx = p - cbx;
                if (dx > -1e-8 && dx < 1e-8) {
                    // Solution found!
                    return t * (t * (t * ya + yb) + yc) + yd;
                }

                if (dx < 0) {
                    maxT = t;
                } else {
                    minT = t;
                }
            }

            return t;
        };

        static mergeColors(c1, c2, p) {
            let r1 = ((c1 / 65536) | 0) % 256;
            let g1 = ((c1 / 256) | 0) % 256;
            let b1 = c1 % 256;
            let a1 = ((c1 / 16777216) | 0);

            let r2 = ((c2 / 65536) | 0) % 256;
            let g2 = ((c2 / 256) | 0) % 256;
            let b2 = c2 % 256;
            let a2 = ((c2 / 16777216) | 0);

            let r = r1 * p + r2 * (1 - p);
            let g = g1 * p + g2 * (1 - p);
            let b = b1 * p + b2 * (1 - p);
            let a = a1 * p + a2 * (1 - p);

            return Math.round(a) * 16777216 + Math.round(r) * 65536 + Math.round(g) * 256 + Math.round(b);
        };

        static getArgbNumber(rgba) {
            rgba[0] = Math.max(0, Math.min(255, rgba[0]));
            rgba[1] = Math.max(0, Math.min(255, rgba[1]));
            rgba[2] = Math.max(0, Math.min(255, rgba[2]));
            rgba[3] = Math.max(0, Math.min(255, rgba[3]));
            let v = ((rgba[3] | 0) << 24) + ((rgba[0] | 0) << 16) + ((rgba[1] | 0) << 8) + (rgba[2] | 0);
            if (v < 0) {
                v = 0xFFFFFFFF + v + 1;
            }
            return v;
        };
    }

    class AnimationActionSettings {

        constructor(animationSettings) {

            this.animationSettings = animationSettings;

            /**
             * The selector that selects the views.
             * @type {string}
             */
            this._selector = "";

            /**
             * The value items, ordered by progress offset.
             * @type {MultiSpline}
             * @private;
             */
            this._items = new MultiSpline();

            /**
             * The affected properties (paths).
             * @private;
             */
            this._props = [];

            /**
             * Property setters, indexed according to props.
             * @private;
             */
            this._propSetters = [];

            this._resetValue = undefined;
            this._hasResetValue = false;

            this._hasColorProperty = undefined;
        }

        getResetValue() {
            if (this._hasResetValue) {
                return this._resetValue;
            } else {
                return this._items.getValue(0);
            }
        }

        apply(view, p, factor) {
            const views = this.getAnimatedViews(view);

            let v = this._items.getValue(p);

            if (v === undefined || !views.length) {
                return;
            }

            if (factor !== 1) {
                // Stop factor.;
                let sv = this.getResetValue();

                if (Utils.isNumber(v) && Utils.isNumber(sv)) {
                    if (this.hasColorProperty()) {
                        v = StageUtils.mergeColors(v, sv, factor);
                    } else {
                        v = StageUtils.mergeNumbers(v, sv, factor);
                    }
                }
            }

            // Apply transformation to all components.;
            const n = this._propSetters.length;

            const m = views.length;
            for (let j = 0; j < m; j++) {
                for (let i = 0; i < n; i++) {
                    this._propSetters[i](views[j], v);
                }
            }
        }
        
        getAnimatedViews(view) {
            return view.select(this._selector);
        }

        reset(view) {
            const views = this.getAnimatedViews(view);

            let v = this.getResetValue();

            if (v === undefined || !views.length) {
                return;
            }

            // Apply transformation to all components.
            const n = this._propSetters.length;

            const m = views.length;
            for (let j = 0; j < m; j++) {
                for (let i = 0; i < n; i++) {
                    this._propSetters[i](views[j], v);
                }
            }
        }
        
        set selector(v) {
            this._selector = v;
        }

        set t(v) {
            this.selector = v;
        }

        get resetValue() {
            return this._resetValue;
        }
        
        set resetValue(v) {
            this._resetValue = v;
            this._hasResetValue = (v !== undefined);
        }

        set rv(v) {
            this.resetValue = v;
        }

        set value(v) {
            this._items.parse(this.hasColorProperty(), v);
        }

        set v(v) {
            this.value = v;
        }

        set properties(v) {
            if (!Array.isArray(v)) {
                v = [v];
            }

            this._props = [];

            v.forEach((prop) => {
                this._props.push(prop);
                this._propSetters.push(View.getSetter(prop));
            });
        }

        set property(v) {
            this._hasColorProperty = undefined;
            this.properties = v;
        }

        set p(v) {
            this.properties = v;
        }

        patch(settings) {
            this.animationSettings.stage.patchObject(this, settings);
        }

        hasColorProperty() {
            if (this._hasColorProperty === undefined) {
                this._hasColorProperty = this._props.length ? View.isColorProperty(this._props[0]) : false;
            }
            return this._hasColorProperty;
        }
    }

    AnimationActionSettings.prototype.isAnimationActionSettings = true;

    class AnimationSettings {
        constructor(stage) {
            this.stage = stage;

            /**
             * @type {AnimationActionSettings[]}
             */
            this._actions = [];

            this.delay = 0;
            this.duration = 1;

            this.repeat = 0;
            this.repeatOffset = 0;
            this.repeatDelay = 0;

            this.autostop = false;

            this.stopMethod = AnimationSettings.STOP_METHODS.FADE;
            this._stopTimingFunction = 'ease';
            this._stopTimingFunctionImpl = StageUtils.getTimingFunction(this._stopTimingFunction);
            this.stopDuration = 0;
            this.stopDelay = 0;
        }

        get actions() {
            return this._actions;
        }

        set actions(v) {
            this._actions = [];
            for (let i = 0, n = v.length; i < n; i++) {
                const e = v[i];
                if (!e.isAnimationActionSettings) {
                    const aas = new AnimationActionSettings(this);
                    aas.patch(e);
                    this._actions.push(aas);
                } else {
                    this._actions.push(e);
                }
            }
        }

        /**
         * Applies the animation to the specified view, for the specified progress between 0 and 1.
         * @param {View} view;
         * @param {number} p;
         * @param {number} factor;
         */
        apply(view, p, factor = 1) {
            this._actions.forEach(function(action) {
                action.apply(view, p, factor);
            });
        }

        /**
         * Resets the animation to the reset values.
         * @param {View} view;
         */
        reset(view) {
            this._actions.forEach(function(action) {
                action.reset(view);
            });
        }

        get stopTimingFunction() {
            return this._stopTimingFunction;
        }

        set stopTimingFunction(v) {
            this._stopTimingFunction = v;
            this._stopTimingFunctionImpl = StageUtils.getTimingFunction(v);
        }

        get stopTimingFunctionImpl() {
            return this._stopTimingFunctionImpl;
        }

        patch(settings) {
            this.stage.patchObject(this, settings);
        }
    }

    AnimationSettings.STOP_METHODS = {
        FADE: 'fade',
        REVERSE: 'reverse',
        FORWARD: 'forward',
        IMMEDIATE: 'immediate',
        ONETOTWO: 'onetotwo'
    };

    class Animation extends EventEmitter {

        constructor(manager, settings, view) {
            super();

            this.manager = manager;

            this._settings = settings;

            this._view = view;

            this._state = Animation.STATES.IDLE;

            this._p = 0;
            this._delayLeft = 0;
            this._repeatsLeft = 0;

            this._stopDelayLeft = 0;
            this._stopP = 0;
        }

        start() {
            if (this._view && this._view.attached) {
                this._p = 0;
                this._delayLeft = this.settings.delay;
                this._repeatsLeft = this.settings.repeat;
                this._state = Animation.STATES.PLAYING;
                this.emit('start');
                this.checkActive();
            } else {
                console.warn("View must be attached before starting animation");
            }
        }

        play() {
            if (this._state === Animation.STATES.PAUSED) {
                // Continue.;
                this._state = Animation.STATES.PLAYING;
                this.checkActive();
                this.emit('resume');
            } else if (this._state == Animation.STATES.STOPPING && this.settings.stopMethod == AnimationSettings.STOP_METHODS.REVERSE) {
                // Continue.;
                this._state = Animation.STATES.PLAYING;
                this.emit('stopContinue');
            } else if (this._state != Animation.STATES.PLAYING && this._state != Animation.STATES.FINISHED) {
                // Restart.;
                this.start();
            }
        }

        pause() {
            if (this._state === Animation.STATES.PLAYING) {
                this._state = Animation.STATES.PAUSED;
                this.emit('pause');
            }
        }

        replay() {
            if (this._state == Animation.STATES.FINISHED) {
                this.start();
            } else {
                this.play();
            }
        }

        skipDelay() {
            this._delayLeft = 0;
            this._stopDelayLeft = 0;
        }

        finish() {
            if (this._state === Animation.STATES.PLAYING) {
                this._delayLeft = 0;
                this._p = 1;
            } else if (this._state === Animation.STATES.STOPPING) {
                this._stopDelayLeft = 0;
                this._p = 0;
            }
        }

        stop() {
            if (this._state === Animation.STATES.STOPPED || this._state === Animation.STATES.IDLE) return;

            this._stopDelayLeft = this.settings.stopDelay || 0;

            if (((this.settings.stopMethod === AnimationSettings.STOP_METHODS.IMMEDIATE) && !this._stopDelayLeft) || this._delayLeft > 0) {
                // Stop upon next progress.;
                this._state = Animation.STATES.STOPPING;
                this.emit('stop');
            } else {
                if (this.settings.stopMethod === AnimationSettings.STOP_METHODS.FADE) {
                    this._stopP = 0;
                }

                this._state = Animation.STATES.STOPPING;
                this.emit('stop');
            }

            this.checkActive();
        }

        stopNow() {
            if (this._state !== Animation.STATES.STOPPED || this._state !== Animation.STATES.IDLE) {
                this._state = Animation.STATES.STOPPING;
                this._p = 0;
                this.emit('stop');
                this.reset();
                this._state = Animation.STATES.STOPPED;
                this.emit('stopFinish');
            }
        }

        isPaused() {
            return this._state === Animation.STATES.PAUSED;
        }

        isPlaying() {
            return this._state === Animation.STATES.PLAYING;
        }

        isStopping() {
            return this._state === Animation.STATES.STOPPING;
        }

        checkActive() {
            if (this.isActive()) {
                this.manager.addActive(this);
            }
        }

        isActive() {
            return (this._state == Animation.STATES.PLAYING || this._state == Animation.STATES.STOPPING) && this._view && this._view.attached;
        }

        progress(dt) {
            if (!this._view) return;
            this._progress(dt);
            this.apply();
        }

        _progress(dt) {
            if (this._state == Animation.STATES.STOPPING) {
                this._stopProgress(dt);
                return;
            }

            if (this._state != Animation.STATES.PLAYING) {
                return;
            }

            if (this._delayLeft > 0) {
                this._delayLeft -= dt;

                if (this._delayLeft < 0) {
                    dt = -this._delayLeft;
                    this._delayLeft = 0;

                    this.emit('delayEnd');
                } else {
                    return;
                }
            }

            if (this.settings.duration === 0) {
                this._p = 1;
            } else if (this.settings.duration > 0) {
                this._p += dt / this.settings.duration;
            }
            if (this._p >= 1) {
                // Finished!;
                if (this.settings.repeat == -1 || this._repeatsLeft > 0) {
                    if (this._repeatsLeft > 0) {
                        this._repeatsLeft--;
                    }
                    this._p = this.settings.repeatOffset;

                    if (this.settings.repeatDelay) {
                        this._delayLeft = this.settings.repeatDelay;
                    }

                    this.emit('repeat', this._repeatsLeft);
                } else {
                    this._p = 1;
                    this._state = Animation.STATES.FINISHED;
                    this.emit('finish');
                    if (this.settings.autostop) {
                        this.stop();
                    }
                }
            } else {
                this.emit('progress', this._p);
            }
        }
        
        _stopProgress(dt) {
            let duration = this._getStopDuration();

            if (this._stopDelayLeft > 0) {
                this._stopDelayLeft -= dt;

                if (this._stopDelayLeft < 0) {
                    dt = -this._stopDelayLeft;
                    this._stopDelayLeft = 0;

                    this.emit('stopDelayEnd');
                } else {
                    return;
                }
            }
            if (this.settings.stopMethod == AnimationSettings.STOP_METHODS.IMMEDIATE) {
                this._state = Animation.STATES.STOPPED;
                this.emit('stopFinish');
            } else if (this.settings.stopMethod == AnimationSettings.STOP_METHODS.REVERSE) {
                if (duration === 0) {
                    this._p = 0;
                } else if (duration > 0) {
                    this._p -= dt / duration;
                }

                if (this._p <= 0) {
                    this._p = 0;
                    this._state = Animation.STATES.STOPPED;
                    this.emit('stopFinish');
                }
            } else if (this.settings.stopMethod == AnimationSettings.STOP_METHODS.FADE) {
                this._progressStopTransition(dt);
                if (this._stopP >= 1) {
                    this._p = 0;
                    this._state = Animation.STATES.STOPPED;
                    this.emit('stopFinish');
                }
            } else if (this.settings.stopMethod == AnimationSettings.STOP_METHODS.ONETOTWO) {
                if (this._p < 2) {
                    if (duration === 0) {
                        this._p = 2;
                    } else if (duration > 0) {
                        if (this._p < 1) {
                            this._p += dt / this.settings.duration;
                        } else {
                            this._p += dt / duration;
                        }
                    }
                    if (this._p >= 2) {
                        this._p = 2;
                        this._state = Animation.STATES.STOPPED;
                        this.emit('stopFinish');
                    } else {
                        this.emit('progress', this._p);
                    }
                }
            } else if (this.settings.stopMethod == AnimationSettings.STOP_METHODS.FORWARD) {
                if (this._p < 1) {
                    if (this.settings.duration == 0) {
                        this._p = 1;
                    } else {
                        this._p += dt / this.settings.duration;
                    }
                    if (this._p >= 1) {
                        if (this.settings.stopMethod == AnimationSettings.STOP_METHODS.FORWARD) {
                            this._p = 1;
                            this._state = Animation.STATES.STOPPED;
                            this.emit('stopFinish');
                        } else {
                            if (this._repeatsLeft > 0) {
                                this._repeatsLeft--;
                                this._p = 0;
                                this.emit('repeat', this._repeatsLeft);
                            } else {
                                this._p = 1;
                                this._state = Animation.STATES.STOPPED;
                                this.emit('stopFinish');
                            }
                        }
                    } else {
                        this.emit('progress', this._p);
                    }
                }
            }
            
        }
        
        _progressStopTransition(dt) {
            if (this._stopP < 1) {
                if (this._stopDelayLeft > 0) {
                    this._stopDelayLeft -= dt;

                    if (this._stopDelayLeft < 0) {
                        dt = -this._stopDelayLeft;
                        this._stopDelayLeft = 0;

                        this.emit('delayEnd');
                    } else {
                        return;
                    }
                }
                
                const duration = this._getStopDuration();

                if (duration == 0) {
                    this._stopP = 1;
                } else {
                    this._stopP += dt / duration;
                }
                if (this._stopP >= 1) {
                    // Finished!;
                    this._stopP = 1;
                }
            }
        }

        _getStopDuration() {
            return this.settings.stopDuration || this.settings.duration;
        }

        apply() {
            if (this._state === Animation.STATES.STOPPED) {
                this.reset();
            } else {
                let factor = 1;
                if (this._state === Animation.STATES.STOPPING && this.settings.stopMethod === AnimationSettings.STOP_METHODS.FADE) {
                    factor = (1 - this.settings.stopTimingFunctionImpl(this._stopP));
                }
                this._settings.apply(this._view, this._p, factor);
            }
        }

        reset() {
            this._settings.reset(this._view);
        }

        get state() {
            return this._state;
        }

        get p() {
            return this._p;
        }

        get delayLeft() {
            return this._delayLeft;
        }

        get view() {
            return this._view;
        }

        get frame() {
            return Math.round(this._p * this._settings.duration * 60);
        }

        get settings() {
            return this._settings;
        }

    }

    Animation.STATES = {
        IDLE: 0,
        PLAYING: 1,
        STOPPING: 2,
        STOPPED: 3,
        FINISHED: 4,
        PAUSED: 5
    };

    class AnimationManager {

        constructor(stage) {
            this.stage = stage;

            this.stage.on('frameStart', () => this.progress());

            /**
             * All running animations on attached subjects.
             * @type {Set<Animation>}
             */
            this.active = new Set();
        }

        progress() {
            if (this.active.size) {
                let dt = this.stage.dt;

                let filter = false;
                this.active.forEach(function(a) {
                    if (a.isActive()) {
                        a.progress(dt);
                    } else {
                        filter = true;
                    }
                });

                if (filter) {
                    this.active = new Set([...this.active].filter(t => t.isActive()));
                }
            }
        }

        createAnimation(view, settings) {
            if (Utils.isObjectLiteral(settings)) {
                // Convert plain object to proper settings object.
                settings = this.createSettings(settings);
            }

            return new Animation(
                this,
                settings,
                view
            );
        }

        createSettings(settings) {
            const animationSettings = new AnimationSettings(this.stage);
            animationSettings.patch(settings);
            return animationSettings;
        }

        addActive(transition) {
            this.active.add(transition);
        }
    }

    class RectangleTexture extends Texture {

        _getLookupId() {
            return '__whitepix';
        }

        _getSourceLoader() {
            return function(cb) {
                var whitePixel = new Uint8Array([255, 255, 255, 255]);
                cb(null, {source: whitePixel, w: 1, h: 1, permanent: true});
            }
        }

        isAutosizeTexture() {
            return false;
        }
    }

    /**
     * Application render tree.
     * Copyright Metrological, 2017;
     */

    class Stage extends EventEmitter {

        constructor(options = {}) {
            super();
            this._setOptions(options);

            this._usedMemory = 0;
            this._lastGcFrame = 0;

            const platformType = PlatformLoader.load(options);
            this.platform = new platformType();

            if (this.platform.init) {
                this.platform.init(this);
            }

            this.gl = null;
            this.c2d = null;

            const context = this.getOption('context');
            if (context) {
                if (context.useProgram) {
                    this.gl = context;
                } else {
                    this.c2d = context;
                }
            } else {
                if (Utils.isWeb && (!Stage.isWebglSupported() || this.getOption('canvas2d'))) {
                    console.log('Using canvas2d renderer');
                    this.c2d = this.platform.createCanvasContext(this.getOption('w'), this.getOption('h'));
                } else {
                    this.gl = this.platform.createWebGLContext(this.getOption('w'), this.getOption('h'));
                }
            }

            if (this.gl) {
                // Wrap in WebGLStateManager.
                // This prevents unnecessary double WebGL commands from being executed, and allows context switching.
                // Context switching is necessary when reusing the same context for Three.js.
                // Note that the user must make sure that the WebGL context is untouched before creating the application,
                //  when manually passing over a canvas or context in the options.
                WebGLStateManager.enable(this.gl, "lightning");
            }

            this._mode = this.gl ? 0 : 1;

            // Override width and height.
            if (this.getCanvas()) {
                this._options.w = this.getCanvas().width;
                this._options.h = this.getCanvas().height;
            }

            if (this._mode === 0) {
                this._renderer = new WebGLRenderer(this);
            } else {
                this._renderer = new C2dRenderer(this);
            }

            this.setClearColor(this.getOption('clearColor'));

            this.frameCounter = 0;

            this.transitions = new TransitionManager(this);
            this.animations = new AnimationManager(this);

            this.textureManager = new TextureManager(this);

            this._destroyed = false;

            this.startTime = 0;
            this.currentTime = 0;
            this.dt = 0;

            // Preload rectangle texture, so that we can skip some border checks for loading textures.
            this.rectangleTexture = new RectangleTexture(this);
            this.rectangleTexture.load();

            // Never clean up because we use it all the time.
            this.rectangleTexture.source.permanent = true;

            this.ctx = new CoreContext(this);

            this._updateSourceTextures = new Set();
        }

        get renderer() {
            return this._renderer;
        }

        static isWebglSupported() {
            if (Utils.isNode) {
                return true;
            }

            try {
                return !!window.WebGLRenderingContext;
            } catch(e) {
                return false;
            }
        }

        /**
         * Returns the rendering mode.
         * @returns {number}
         *  0: WebGL
         *  1: Canvas2d
         */
        get mode() {
            return this._mode;
        }

        isWebgl() {
            return this.mode === 0;
        }

        isC2d() {
            return this.mode === 1;
        }

        getOption(name) {
            return this._options[name];
        }

        _setOptions(o) {
            this._options = {};

            let opt = (name, def) => {
                let value = o[name];

                if (value === undefined) {
                    this._options[name] = def;
                } else {
                    this._options[name] = value;
                }
            };

            opt('canvas', null);
            opt('context', null);
            opt('w', 1280);
            opt('h', 720);
            opt('srcBasePath', null);
            opt('memoryPressure', 24e6);
            opt('bufferMemory', 2e6);
            opt('textRenderIssueMargin', 0);
            opt('clearColor', [0, 0, 0, 0]);
            opt('defaultFontFace', 'sans-serif');
            opt('fixedDt', 0);
            opt('useTextureAtlas', false);
            opt('debugTextureAtlas', false);
            opt('useImageWorker', true);
            opt('autostart', true);
            opt('precision', 1);
            opt('canvas2d', false);
            opt('platform', null);
        }

        setApplication(app) {
            this.application = app;
        }

        init() {
            this.application.setAsRoot();
            if (this.getOption('autostart')) {
                this.platform.startLoop();
            }
        }

        destroy() {
            if (!this._destroyed) {
                this.application.destroy();
                this.platform.stopLoop();
                this.ctx.destroy();
                this.textureManager.destroy();
                this._renderer.destroy();
                this._destroyed = true;
            }
        }

        stop() {
            this.platform.stopLoop();
        }

        resume() {
            if (this._destroyed) {
                throw new Error("Already destroyed");
            }
            this.platform.startLoop();
        }

        get root() {
            return this.application;
        }

        getCanvas() {
            return this._mode ? this.c2d.canvas : this.gl.canvas;
        }

        getRenderPrecision() {
            return this._options.precision;
        }

        /**
         * Marks a texture for updating it's source upon the next drawFrame.
         * @param texture
         */
        addUpdateSourceTexture(texture) {
            if (this._updatingFrame) {
                // When called from the upload loop, we must immediately load the texture in order to avoid a 'flash'.
                texture._performUpdateSource();
            } else {
                this._updateSourceTextures.add(texture);
            }
        }

        removeUpdateSourceTexture(texture) {
            if (this._updateSourceTextures) {
                this._updateSourceTextures.delete(texture);
            }
        }

        hasUpdateSourceTexture(texture) {
            return (this._updateSourceTextures && this._updateSourceTextures.has(texture));
        }

        drawFrame() {
            this.startTime = this.currentTime;
            this.currentTime = this.platform.getHrTime();

            if (this._options.fixedDt) {
                this.dt = this._options.fixedDt;
            } else {
                this.dt = (!this.startTime) ? .02 : .001 * (this.currentTime - this.startTime);
            }

            this.emit('frameStart');

            if (this._updateSourceTextures.size) {
                this._updateSourceTextures.forEach(texture => {
                    texture._performUpdateSource();
                });
                this._updateSourceTextures = new Set();
            }

            this.emit('update');

            const changes = this.ctx.hasRenderUpdates();

            if (changes) {
                this._updatingFrame = true;
                this.ctx.frame();
                this._updatingFrame = false;
            }

            this.platform.nextFrame(changes);

            this.emit('frameEnd');

            this.frameCounter++;
        }

        renderFrame() {
            this.ctx.frame();
        }

        forceRenderUpdate() {
            // Enforce re-rendering.
            if (this.root) {
                this.root.core._parent.setHasRenderUpdates(1);
            }
        }

        setClearColor(clearColor) {
            this.forceRenderUpdate();
            if (clearColor === null) {
                // Do not clear.
                this._clearColor = null;
            } else if (Array.isArray(clearColor)) {
                this._clearColor = clearColor;
            } else {
                this._clearColor = StageUtils.getRgbaComponentsNormalized(clearColor);
            }
        }

        getClearColor() {
            return this._clearColor;
        }

        createView(settings) {
            if (settings) {
                return this.view(settings);
            } else {
                return new View(this);
            }
        }

        createShader(settings) {
            return Shader.create(this, settings);
        }

        view(settings) {
            if (settings.isView) return settings;

            let view;
            if (settings.type) {
                view = new settings.type(this);
            } else {
                view = new View(this);
            }

            view.patch(settings, true);

            return view;
        }

        c(settings) {
            return this.view(settings);
        }

        get w() {
            return this._options.w;
        }

        get h() {
            return this._options.h;
        }

        get coordsWidth() {
            return this.w / this._options.precision;
        }

        get coordsHeight() {
            return this.h / this._options.precision;
        }

        addMemoryUsage(delta) {
            this._usedMemory += delta;
            if (this._lastGcFrame !== this.frameCounter) {
                if (this._usedMemory > this.getOption('memoryPressure')) {
                    this.gc(false);
                    if (this._usedMemory > this.getOption('memoryPressure') - 2e6) {
                        // Too few released. Aggressive cleanup.
                        this.gc(true);
                    }
                }
            }
        }

        get usedMemory() {
            return this._usedMemory;
        }

        gc(aggressive) {
            if (this._lastGcFrame !== this.frameCounter) {
                this._lastGcFrame = this.frameCounter;
                const memoryUsageBefore = this._usedMemory;
                this.gcTextureMemory(aggressive);
                this.gcRenderTextureMemory(aggressive);
                this.renderer.gc(aggressive);

                console.log(`GC${aggressive ? "[aggressive]" : ""}! Frame ${this._lastGcFrame} Freed ${((memoryUsageBefore - this._usedMemory) / 1e6).toFixed(2)}MP from GPU memory. Remaining: ${(this._usedMemory / 1e6).toFixed(2)}MP`);
                const other = this._usedMemory - this.textureManager.usedMemory - this.ctx.usedMemory;
                console.log(` Textures: ${(this.textureManager.usedMemory / 1e6).toFixed(2)}MP, Render Textures: ${(this.ctx.usedMemory / 1e6).toFixed(2)}MP, Renderer caches: ${(other / 1e6).toFixed(2)}MP`);
            }
        }

        gcTextureMemory(aggressive = false) {
            if (aggressive && this.ctx.root.visible) {
                // Make sure that ALL textures are cleaned;
                this.ctx.root.visible = false;
                this.textureManager.gc();
                this.ctx.root.visible = true;
            } else {
                this.textureManager.gc();
            }
        }

        gcRenderTextureMemory(aggressive = false) {
            if (aggressive && this.root.visible) {
                // Make sure that ALL render textures are cleaned;
                this.root.visible = false;
                this.ctx.freeUnusedRenderTextures(0);
                this.root.visible = true;
            } else {
                this.ctx.freeUnusedRenderTextures(0);
            }
        }

        getDrawingCanvas() {
            return this.platform.getDrawingCanvas();
        }

        preparePatchSettings(settings) {
            return Base.preparePatchSettings(settings, this.getPatchId());
        }

        patchObject(object, settings) {
            settings = Base.preparePatchSettings(settings, this.getPatchId());
            Base.patchObject(object, settings);
        }

        getPatchId() {
            return this.renderer.getPatchId();
        }

    }

    class StateManager {

        constructor() {
            this._fireLevel = 0;
            this._logPrefix = "";
            this._debug = false;
        }

        get debug() {
            return this._debug;
        }

        set debug(v) {
            this._debug = v;
        }

        /**
         * Fires the specified event on the state machine.
         * @param {Component} component
         * @param {string|object[]} event
         *   Either a single event, or an array of events ({event: 'name', args: *}.
         *   In case of an array, the event is fired that had a match in the deepest state.
         *   If multiple events match in the deepest state, the first specified one has priority.
         * @param {*} args;
         * @return {boolean}
         *   True iff the state machine could find and execute a handler for the event (event and condition matched).
         */
        fire(component, event, args) {
            // After an event is fired (by external means), the action may cause other events to be triggered. We
            // distinguish between primary and indirect events because we have to perform some operations after primary
            // events only.

            // Purely for logging.
            const primaryEvent = (this._fireLevel === 0);
            this._fireLevel++;

            if (this.debug) {
                if (!primaryEvent) {
                    this._logPrefix += " ";
                } else {
                    this._logPrefix = "";
                }
            }

            let found;
            try {
                if (Array.isArray(event)) {
                    found = this._mfire(component, event, args);
                } else {
                    found = this._fire(component, event, args);
                }

                if (found && primaryEvent) {
                    // Update focus.
                    component.application.__updateFocus();
                }
            } catch(e) {
                console.error(`${component.constructor.name} "${component.state}".${event} ${component.getLocationString()}`);
                console.error(e.stack);
            }

            this._fireLevel--;

            if (this.debug) {
                this._logPrefix = this._logPrefix.substr(0, this._logPrefix.length - 1);
            }

            return !!found;
        }

        _fire(component, event, args) {
            if (Utils.isUcChar(event.charCodeAt(0))) {
                component._throwError("Event may not start with an upper case character: " + event);
            }

            const paths = this._getStatePaths(component, component.state);
            for (let i = 0, n = paths.length; i < n; i++) {
                const result = this._attemptFirePathEvent(component, paths[i], event, args);
                if (result) {
                    return result;
                }
            }
        }

        _mfire(component, events) {
            const paths = this._getStatePaths(component, component.state);
            for (let j = 0, m = paths.length; j < m; j++) {
                for (let i = 0, n = events.length; i < n; i++) {
                    const result = this._attemptFirePathEvent(component, paths[j], events[i].event, events[i].args);
                    if (result) {
                        return result;
                    }
                }
            }
        }

        _attemptFirePathEvent(component, path, event, args) {
            const result = StateManager._getStateAction(path, event);
            if (result) {
                let validAction = (result.s !== undefined);
                let newState = result.s;
                if (result.a) {
                    if (this.debug) {
                        console.log(`${this._logPrefix}${component.constructor.name} "${component.state}".${event} ${component.getLocationString()}`);
                    }
                    newState = result.a.call(component, args);
                    validAction = (newState !== false);
                    if (!validAction) {
                        if (this.debug) {
                            console.log(`${this._logPrefix}[PASS THROUGH]`);
                        }
                    }
                }
                if (validAction) {
                    result.event = event;
                    result.args = args;
                    result.s = newState;
                    result.p = path;

                    const prevState = component.state;

                    if (Utils.isString(newState)) {
                        this._setState(component, StateManager._ucfirst(newState), {event: event, args: args, prevState: prevState, newState: newState});
                    }

                    return result;
                }
            }
        }

        static _ucfirst(str) {
            return str.charAt(0).toUpperCase() + str.substr(1);
        }

        _getStatePaths(component, state) {
            const states = component._getStates();

            if (state == "") return [states];
            const parts = state.split(".");

            let cursor = states;
            const path = [cursor];
            for (let i = 0, n = parts.length; i < n; i++) {
                const key = StateManager._ucfirst(parts[i]);
                if (!cursor.hasOwnProperty(key)) {
                    component._throwError("State path not found: '" + state + "'");
                }
                cursor = cursor[key];
                path.push(cursor);
            }
            return path.reverse();
        }

        /**
         * Returns the active's edge action and state.
         * @param {string} state
         * @param event
         * @return {object}
         * @private;
         */
        static _getStateAction(state, event) {
            if (!state.hasOwnProperty(event)) {
                return null;
            }
            const def = state[event];

            if (Utils.isFunction(def)) {
                // Action.
                return {a: def, s: undefined}
            } else if (Utils.isString(def)) {
                // State.
                return {a: undefined, s: def}
            }

            return null;
        }


        _setState(component, newState, eargs) {
            if (this.debug) {
                console.log(`${this._logPrefix}╚>"${newState !== component.state ? newState : ""}"`);
            }

            if (newState !== component.state) {
                this._fireLevel++;
                if (this.debug) {
                    this._logPrefix += " ";
                }

                const paths = this._getStatePaths(component, component.state);

                // Switch state to new state.
                const newPaths = this._getStatePaths(component, newState);

                const info = StateManager._compareStatePaths(paths, newPaths);
                const exit = info.exit.reverse();
                const enter = info.enter;
                const state = component.state;
                for (let i = 0, n = exit.length; i < n; i++) {
                    component.__state = StateManager._getSuperState(state, i);
                    const def = StateManager._getStateAction(exit[i], "_exit");
                    if (def) {
                        if (this.debug) {
                            console.log(`${this._logPrefix}${component.constructor.name} "${component.state}"._exit ${component.getLocationString()}`);
                        }
                        let stateSwitch = StateManager._executeAction(def, component, eargs);
                        if (stateSwitch === false) {
                            if (this.debug) {
                                console.log(`${this._logPrefix}[CANCELED]`);
                            }
                        } else if (stateSwitch) {
                            const info = this._setState(
                                component,
                                stateSwitch,
                                eargs
                            );

                            this._fireLevel--;
                            if (this.debug) {
                                this._logPrefix = this._logPrefix.substr(0, this._logPrefix.length - 1);
                            }

                            return info;
                        }
                    }
                }

                component.__state = StateManager._getSuperState(state, exit.length);

                for (let i = 0, n = enter.length; i < n; i++) {
                    component.__state = StateManager._getSuperState(newState, (n - (i + 1)));
                    const def = StateManager._getStateAction(enter[i], "_enter");
                    if (def) {
                        if (this.debug) {
                            console.log(`${this._logPrefix}${component.constructor.name} "${newState}"._enter ${component.getLocationString()}`);
                        }
                        let stateSwitch = StateManager._executeAction(def, component, eargs);
                        if (stateSwitch === false) {
                            if (this.debug) {
                                console.log(`${this._logPrefix}[CANCELED]`);
                            }
                        } else if (stateSwitch) {
                            const info = this._setState(
                                component,
                                stateSwitch,
                                eargs
                            );

                            this._fireLevel--;
                            if (this.debug) {
                                this._logPrefix = this._logPrefix.substr(0, this._logPrefix.length - 1);
                            }

                            return info;
                        }
                    }
                }

                this._fireLevel--;
                if (this.debug) {
                    this._logPrefix = this._logPrefix.substr(0, this._logPrefix.length - 1);
                }
            }

        }

        static _executeAction(action, component, args) {
            let newState;
            if (action.a) {
                newState = action.a.call(component, args);
            }
            if (newState === undefined) {
                newState = action.s;
            }
            return newState;
        }

        static _getSuperState(state, levels) {
            if (levels === 0) {
                return state;
            }
            return state.split(".").slice(0, -levels).join(".");
        }

        /**
         * Returns the exit states and enter states when switching states (in natural branch order).
         */
        static _compareStatePaths(current, newPaths) {
            current = current.reverse();
            newPaths = newPaths.reverse();
            const n = Math.min(current.length, newPaths.length);
            let pos;
            for (pos = 0; pos < n; pos++) {
                if (current[pos] !== newPaths[pos]) break;
            }

            return {exit: current.slice(pos), enter: newPaths.slice(pos)}
        }

    }

    class Application extends Component {

        constructor(options = {}, properties) {
            // Save options temporarily to avoid having to pass it through the constructor.
            Application._temp_options = options;

            // Booting flag is used to postpone updateFocusSettings;
            Application.booting = true;
            const stage = new Stage(options.stage);
            super(stage, properties);
            Application.booting = false;

            // We must construct while the application is not yet attached.
            // That's why we 'init' the stage later (which actually emits the attach event).
            this.stage.init();

            // Initially, the focus settings are updated after both the stage and application are constructed.
            this.updateFocusSettings();

            this.__keymap = this.getOption('keys');
            if (this.__keymap) {
                this.stage.platform.registerKeyHandler((e) => {
                    this._receiveKeydown(e);
                });
            }
        }

        getOption(name) {
            return this.__options[name];
        }

        _setOptions(o) {
            this.__options = {};

            let opt = (name, def) => {
                let value = o[name];

                if (value === undefined) {
                    this.__options[name] = def;
                } else {
                    this.__options[name] = value;
                }
            };

            opt('debug', false);
            opt('keys', {});
        }

        __construct() {
            this.stage.setApplication(this);

            this._setOptions(Application._temp_options);
            delete Application._temp_options;

            // We must create the state manager before the first 'fire' ever: the 'construct' event.
            this.stateManager = new StateManager();
            this.stateManager.debug = this.__options.debug;

            super.__construct();
        }

        __init() {
            super.__init();
            this.__updateFocus();
        }

        updateFocusPath() {
            this.__updateFocus();
        }

        __updateFocus() {
            if (this.__updateFocusRec()) {
                // Performance optimization: do not gather settings if no handler is defined.
                if (this._handleFocusSettings !== Application.prototype._handleFocusSettings) {
                    if (!Application.booting) {
                        this.updateFocusSettings();
                    }
                }
            }
        }

        __updateFocusRec(maxRecursion = 100) {
            const newFocusPath = this.__getFocusPath();
            const newFocusedComponent = newFocusPath[newFocusPath.length - 1];
            const prevFocusedComponent = this._focusPath ? this._focusPath[this._focusPath.length - 1] : undefined;

            if (!prevFocusedComponent) {
                // First focus.
                this._focusPath = newFocusPath;

                // Focus events.
                for (let i = 0, n = this._focusPath.length; i < n; i++) {
                    this._focusPath[i].__focus(newFocusedComponent, undefined);
                }
                return true;
            } else {
                let m = Math.min(this._focusPath.length, newFocusPath.length);
                let index;
                for (index = 0; index < m; index++) {
                    if (this._focusPath[index] !== newFocusPath[index]) {
                        break;
                    }
                }

                if (this._focusPath.length !== newFocusPath.length || index !== newFocusPath.length) {
                    if (this.__options.debug) {
                        console.log(this.stateManager._logPrefix + '* FOCUS ' + newFocusedComponent.getLocationString());
                    }
                    // Unfocus events.
                    for (let i = this._focusPath.length - 1; i >= index; i--) {
                        this._focusPath[i].__unfocus(newFocusedComponent, prevFocusedComponent);
                    }

                    this._focusPath = newFocusPath;

                    // Focus events.
                    for (let i = index, n = this._focusPath.length; i < n; i++) {
                        this._focusPath[i].__focus(newFocusedComponent, prevFocusedComponent);
                    }

                    // Focus changed events.
                    for (let i = 0; i < index; i++) {
                        this._focusPath[i].__focusChange(newFocusedComponent, prevFocusedComponent);
                    }

                    // Focus events could trigger focus changes.
                    if (maxRecursion-- === 0) {
                        throw new Error("Max recursion count reached in focus update");
                    }
                    this.__updateFocus(maxRecursion);

                    return true;
                } else {
                    return false;
                }
            }
        }

        updateFocusSettings() {
            const newFocusPath = this.__getFocusPath();
            const focusedComponent = newFocusPath[newFocusPath.length - 1];

            // Get focus settings. These can be used for dynamic application-wide settings that depend on the;
            // focus directly (such as the application background).
            const focusSettings = {};
            for (let i = 0, n = this._focusPath.length; i < n; i++) {
                this._focusPath[i]._setFocusSettings(focusSettings);
            }

            this._handleFocusSettings(focusSettings, this.__prevFocusSettings, focusedComponent);

            this.__prevFocusSettings = focusSettings;
        }

        _handleFocusSettings(settings, prevSettings, focused, prevFocused) {
            // Override to handle focus-based settings.
        }

        __getFocusPath() {
            const path = [this];
            let current = this;
            do {
                const nextFocus = current._getFocused();
                if (!nextFocus || (nextFocus === current)) {
                    // Found!;
                    break;
                }


                let ptr = nextFocus.cparent;
                if (ptr === current) {
                    path.push(nextFocus);
                } else {
                    // Not an immediate child: include full path to descendant.
                    const newParts = [nextFocus];
                    do {
                        if (!ptr) {
                            current._throwError("Return value for _getFocused must be an attached descendant component but its '" + nextFocus.getLocationString() + "'");
                        }
                        newParts.push(ptr);
                        ptr = ptr.cparent;
                    } while (ptr !== current);

                    // Add them reversed.
                    for (let i = 0, n = newParts.length; i < n; i++) {
                        path.push(newParts[n - i - 1]);
                    }
                }

                current = nextFocus;
            } while(true);

            return path;
        }

        get focusPath() {
            return this._focusPath;
        }

        /**
         * Injects an event in the state machines, top-down from application to focused component.
         */
        focusTopDownEvent(event, args) {
            const path = this.focusPath;
            const n = path.length;
            if (Array.isArray(event)) {
                // Multiple events.
                for (let i = 0; i < n; i++) {
                    if (path[i].fire(event)) {
                        return true;
                    }
                }
            } else {
                // Single event.
                for (let i = 0; i < n; i++) {
                    if (path[i].fire(event, args)) {
                        return true;
                    }
                }
            }
            return false;
        }

        /**
         * Injects an event in the state machines, bottom-up from focused component to application.
         */
        focusBottomUpEvent(event, args) {
            const path = this.focusPath;
            const n = path.length;
            if (Array.isArray(event)) {
                // Multiple events.
                for (let i = n - 1; i >= 0; i--) {
                    if (path[i].fire(event)) {
                        return true;
                    }
                }
            } else {
                // Single event.
                for (let i = n - 1; i >= 0; i--) {
                    if (path[i].fire(event, args)) {
                        return true;
                    }
                }
            }
            return false;
        }

        _receiveKeydown(e) {
            const obj = {keyCode: e.keyCode};
            if (this.__keymap[e.keyCode]) {
                if (!this.stage.application.focusTopDownEvent([{event: "_capture" + this.__keymap[e.keyCode], args: obj}, {event: "_captureKey", args: obj}])) {
                    this.stage.application.focusBottomUpEvent([{event: "_handle" + this.__keymap[e.keyCode], args: obj}, {event: "_handleKey", args: obj}]);
                }
            } else {
                if (!this.stage.application.focusTopDownEvent("_captureKey", obj)) {
                    this.stage.application.focusBottomUpEvent("_handleKey", obj);
                }
            }
        }

        destroy() {
            // This forces the _detach, _disabled and _active events to be called.
            this.stage.root = undefined;
            this._updateAttachedFlag();
            this._updateEnabledFlag();
        }
    }

    class StaticCanvasTexture extends Texture {

        constructor(stage) {
            super(stage);
            this._factory = undefined;
            this._lookupId = undefined;
        }

        set content({factory, lookupId = undefined}) {
            this._factory = factory;
            this._lookupId = lookupId;
            this._changed();
        }

        _getIsValid() {
            return !!this._factory;
        }

        _getLookupId() {
            return this._lookupId;
        }

        _getSourceLoader() {
            const f = this._factory;
            return (cb) => {
                return f((err, canvas) => {
                    if (err) {
                        return cb(err);
                    }
                    cb(null, this.stage.platform.getTextureOptionsForDrawingCanvas(canvas));
                }, this.stage);
            }
        }

    }

    class Tools {

        static getCanvasTexture(canvasFactory, lookupId) {
            return {type: StaticCanvasTexture, content: {factory: canvasFactory, lookupId: lookupId}}
        }

        static getRoundRect(w, h, radius, strokeWidth, strokeColor, fill, fillColor) {
            if (!Array.isArray(radius)){
                // upper-left, upper-right, bottom-right, bottom-left.
                radius = [radius, radius, radius, radius];
            }

            let factory = (cb, stage) => {
                cb(null, this.createRoundRect(stage, w, h, radius, strokeWidth, strokeColor, fill, fillColor));
            };
            let id = 'rect' + [w, h, strokeWidth, strokeColor, fill ? 1 : 0, fillColor].concat(radius).join(",");
            return Tools.getCanvasTexture(factory, id);
        }

        static createRoundRect(stage, w, h, radius, strokeWidth, strokeColor, fill, fillColor) {
            if (fill === undefined) fill = true;
            if (strokeWidth === undefined) strokeWidth = 0;

            let canvas = stage.platform.getDrawingCanvas();
            let ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;

            canvas.width = w + strokeWidth + 2;
            canvas.height = h + strokeWidth + 2;

            ctx.beginPath();
            let x = 0.5 * strokeWidth + 1, y = 0.5 * strokeWidth + 1;

            ctx.moveTo(x + radius[0], y);
            ctx.lineTo(x + w - radius[1], y);
            ctx.arcTo(x + w, y, x + w, y + radius[1], radius[1]);
            ctx.lineTo(x + w, y + h - radius[2]);
            ctx.arcTo(x + w, y + h, x + w - radius[2], y + h, radius[2]);
            ctx.lineTo(x + radius[3], y + h);
            ctx.arcTo(x, y + h, x, y + h - radius[3], radius[3]);
            ctx.lineTo(x, y + radius[0]);
            ctx.arcTo(x, y, x + radius[0], y, radius[0]);
            ctx.closePath();

            if (fill) {
                if (Utils.isNumber(fillColor)) {
                    ctx.fillStyle = StageUtils.getRgbaString(fillColor);
                } else {
                    ctx.fillStyle = "white";
                }
                ctx.fill();
            }

            if (strokeWidth) {
                if (Utils.isNumber(strokeColor)) {
                    ctx.strokeStyle = StageUtils.getRgbaString(strokeColor);
                } else {
                    ctx.strokeStyle = "white";
                }
                ctx.lineWidth = strokeWidth;
                ctx.stroke();
            }

            return canvas;
        }

        static getShadowRect(w, h, radius = 0, blur = 5, margin = blur * 2) {
            if (!Array.isArray(radius)){
                // upper-left, upper-right, bottom-right, bottom-left.
                radius = [radius, radius, radius, radius];
            }

            let factory = (cb, stage) => {
                cb(null, this.createShadowRect(stage, w, h, radius, blur, margin));
            };
            let id = 'shadow' + [w, h, blur, margin].concat(radius).join(",");
            return Tools.getCanvasTexture(factory, id);
        }

        static createShadowRect(stage, w, h, radius, blur, margin) {
            let canvas = stage.platform.getDrawingCanvas();
            let ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;

            canvas.width = w + margin * 2;
            canvas.height = h + margin * 2;

            // WpeWebKit bug: we experienced problems without this with shadows in noncompositedwebgl mode.
            ctx.globalAlpha = 0.01;
            ctx.fillRect(0, 0, 0.01, 0.01);
            ctx.globalAlpha = 1.0;

            ctx.shadowColor = StageUtils.getRgbaString(0xFFFFFFFF);
            ctx.fillStyle = StageUtils.getRgbaString(0xFFFFFFFF);
            ctx.shadowBlur = blur;
            ctx.shadowOffsetX = (w + 10) + margin;
            ctx.shadowOffsetY = margin;

            ctx.beginPath();
            const x = -(w + 10);
            const y = 0;

            ctx.moveTo(x + radius[0], y);
            ctx.lineTo(x + w - radius[1], y);
            ctx.arcTo(x + w, y, x + w, y + radius[1], radius[1]);
            ctx.lineTo(x + w, y + h - radius[2]);
            ctx.arcTo(x + w, y + h, x + w - radius[2], y + h, radius[2]);
            ctx.lineTo(x + radius[3], y + h);
            ctx.arcTo(x, y + h, x, y + h - radius[3], radius[3]);
            ctx.lineTo(x, y + radius[0]);
            ctx.arcTo(x, y, x + radius[0], y, radius[0]);
            ctx.closePath();
            ctx.fill();

            return canvas;
        }

        static getSvgTexture(url, w, h) {
            let factory = (cb, stage) => {
                this.createSvg(cb, stage, url, w, h);
            };
            let id = 'svg' + [w, h, url].join(",");
            return Tools.getCanvasTexture(factory, id);
        }

        static createSvg(cb, stage, url, w, h) {
            let canvas = stage.platform.getDrawingCanvas();
            let ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;

            let img = new Image();
            img.onload = () => {
                canvas.width = w;
                canvas.height = h;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                cb(null, canvas);
            };
            img.onError = (err) => {
                cb(err);
            };
            img.src = url;
        }

    }

    class ObjMerger {

        static isMf(f) {
            return Utils.isFunction(f) && f.__mf;
        }

        static mf(f) {
            // Set as merge function.
            f.__mf = true;
            return f;
        }

        static merge(a, b) {
            const aks = Object.keys(a);
            const bks = Object.keys(b);

            if (!bks.length) {
                return a;
            }

            // Create index array for all elements.
            const ai = {};
            const bi = {};
            for (let i = 0, n = bks.length; i < n; i++) {
                const key = bks[i];
                ai[key] = -1;
                bi[key] = i;
            }
            for (let i = 0, n = aks.length; i < n; i++) {
                const key = aks[i];
                ai[key] = i;
                if (bi[key] === undefined) {
                    bi[key] = -1;
                }
            }

            const aksl = aks.length;

            const result = {};
            for (let i = 0, n = bks.length; i < n; i++) {
                const key = bks[i];

                // Prepend all items in a that are not in b - before the now added b attribute.
                const aIndex = ai[key];
                let curIndex = aIndex;
                while(--curIndex >= 0) {
                    const akey = aks[curIndex];
                    if (bi[akey] !== -1) {
                        // Already found? Stop processing.
                        // Not yet found but exists in b? Also stop processing: wait until we find it in b.
                        break;
                    }
                }
                while(++curIndex < aIndex) {
                    const akey = aks[curIndex];
                    result[akey] = a[akey];
                }

                const bv = b[key];
                const av = a[key];
                let r;
                if (this.isMf(bv)) {
                    r = bv(av);
                } else {
                    if (!Utils.isObjectLiteral(av) || !Utils.isObjectLiteral(bv)) {
                        r = bv;
                    } else {
                        r = ObjMerger.merge(av, bv);
                    }
                }

                // When marked as undefined, property is deleted.
                if (r !== undefined) {
                    result[key] = r;
                }
            }

            // Append remaining final items in a.
            let curIndex = aksl;
            while(--curIndex >= 0) {
                const akey = aks[curIndex];
                if (bi[akey] !== -1) {
                    break;
                }
            }
            while(++curIndex < aksl) {
                const akey = aks[curIndex];
                result[akey] = a[akey];
            }

            return result;
        }

    }

    /**
     * Manages the list of children for a view.
     */

    class ObjectListProxy extends ObjectList {

        constructor(target) {
            super();
            this._target = target;
        }

        onAdd(item, index) {
            this._target.addAt(item, index);
        }

        onRemove(item, index) {
            this._target.removeAt(index);
        }

        onSync(removed, added, order) {
            this._target._setByArray(order);
        }

        onSet(item, index) {
            this._target.setAt(item, index);
        }

        onMove(item, fromIndex, toIndex) {
            this._target.setAt(item, toIndex);
        }

        createItem(object) {
            return this._target.createItem(object);
        }

        isItem(object) {
            return this._target.isItem(object);
        }

    }

    /**
     * Manages the list of children for a view.
     */

    class ObjectListWrapper extends ObjectListProxy {

        constructor(target, wrap) {
            super(target);
            this._wrap = wrap;
        }

        wrap(item) {
            let wrapper = this._wrap(item);
            item._wrapper = wrapper;
            return wrapper;
        }

        onAdd(item, index) {
            item = this.wrap(item);
            super.onAdd(item, index);
        }

        onRemove(item, index) {
            super.onRemove(item, index);
        }

        onSync(removed, added, order) {
            added.forEach(a => this.wrap(a));
            order = order.map(a => a._wrapper);
            super.onSync(removed, added, order);
        }

        onSet(item, index) {
            item = this.wrap(item);
            super.onSet(item, index);
        }

        onMove(item, fromIndex, toIndex) {
            super.onMove(item, fromIndex, toIndex);
        }

    }

    class NoiseTexture extends Texture {

        _getLookupId() {
            return '__noise';
        }

        _getSourceLoader() {
            const gl = this.stage.gl;
            return function(cb) {
                const noise = new Uint8Array(128 * 128 * 4);
                for (let i = 0; i < 128 * 128 * 4; i+=4) {
                    const v = Math.floor(Math.random() * 256);
                    noise[i] = v;
                    noise[i+1] = v;
                    noise[i+2] = v;
                    noise[i+3] = 255;
                }
                const texParams = {};

                if (gl) {
                    texParams[gl.TEXTURE_WRAP_S] = gl.REPEAT;
                    texParams[gl.TEXTURE_WRAP_T] = gl.REPEAT;
                    texParams[gl.TEXTURE_MIN_FILTER] = gl.NEAREST;
                    texParams[gl.TEXTURE_MAG_FILTER] = gl.NEAREST;
                }

                cb(null, {source: noise, w: 128, h: 128, texParams: texParams});
            }
        }

    }

    class HtmlTexture extends Texture {

        constructor(stage) {
            super(stage);
            this._htmlElement = undefined;
            this._scale = 1;
        }

        set htmlElement(v) {
            this._htmlElement = v;
            this._changed();
        }

        get htmlElement() {
            return this._htmlElement;
        }

        set scale(v) {
            this._scale = v;
            this._changed();
        }

        get scale() {
            return this._scale;
        }

        set html(v) {
            if (!v) {
                this.htmlElement = undefined;
            } else {
                const d = document.createElement('div');
                d.innerHTML = "<div>" + v + "</div>";
                this.htmlElement = d.firstElementChild;
            }
        }

        get html() {
            return this._htmlElement.innerHTML;
        }

        _getIsValid() {
            return this.htmlElement;
        }

        _getLookupId() {
            return this._scale + ":" + this._htmlElement.innerHTML;
        }

        _getSourceLoader() {
            const htmlElement = this._htmlElement;
            const scale = this._scale;
            return function(cb) {
                if (!window.html2canvas) {
                    return cb(new Error("Please include html2canvas (https://html2canvas.hertzen.com/)"));
                }

                const area = HtmlTexture.getPreloadArea();
                area.appendChild(htmlElement);

                html2canvas(htmlElement, {backgroundColor: null, scale: scale}).then(function(canvas) {
                    area.removeChild(htmlElement);
                    if (canvas.height === 0) {
                        return cb(new Error("Canvas height is 0"));
                    }
                    cb(null, {source: canvas, width: canvas.width, height: canvas.height});
                }).catch(e => {
                    console.error(e);
                });
            }
        }

        static getPreloadArea() {
            if (!this._preloadArea) {
                // Preload area must be included in document body and must be visible to trigger html element rendering.
                this._preloadArea = document.createElement('div');
                if (this._preloadArea.attachShadow) {
                    // Use a shadow DOM if possible to prevent styling from interfering.
                    this._preloadArea.attachShadow({mode: 'closed'});
                }
                this._preloadArea.style.opacity = 0;
                this._preloadArea.style.pointerEvents = 'none';
                this._preloadArea.style.position = 'fixed';
                this._preloadArea.style.display = 'block';
                this._preloadArea.style.top = '100vh';
                this._preloadArea.style.overflow = 'hidden';
                document.body.appendChild(this._preloadArea);
            }
            return this._preloadArea;
        }
    }

    class StaticTexture extends Texture {

        constructor(stage, options) {
            super(stage);

            this._options = options;
        }

        set options(v) {
            if (this._options !== v) {
                this._options = v;
                this._changed();
            }
        }

        get options() {
            return this._options;
        }

        _getIsValid() {
            return !!this._options;
        }

        _getSourceLoader() {
            return (cb) => {
                cb(null, this._options);
            }
        }
    }

    class ListView extends Component {

        constructor(stage) {
            super(stage);

            this._wrapper = super._children.a({});

            this._reloadVisibleElements = false;

            this._visibleItems = new Set();

            this._index = 0;

            this._started = false;

            /**
             * The transition definition that is being used when scrolling the items.
             * @type TransitionSettings
             */
            this._scrollTransitionSettings = this.stage.transitions.createSettings({});

            /**
             * The scroll area size in pixels per item.
             */
            this._itemSize = 100;

            this._viewportScrollOffset = 0;

            this._itemScrollOffset = 0;

            /**
             * Should the list jump when scrolling between end to start, or should it be continuous, like a carrousel?
             */
            this._roll = false;

            /**
             * Allows restricting the start scroll position.
             */
            this._rollMin = 0;

            /**
             * Allows restricting the end scroll position.
             */
            this._rollMax = 0;

            /**
             * Definition for a custom animation that is applied when an item is (partially) selected.
             * @type AnimationSettings
             */
            this._progressAnimation = null;

            /**
             * Inverts the scrolling direction.
             * @type {boolean}
             * @private
             */
            this._invertDirection = false;

            /**
             * Layout the items horizontally or vertically?
             * @type {boolean}
             * @private
             */
            this._horizontal = true;

            this.itemList = new ListItems(this);
        }

        _allowChildrenAccess() {
            return false;
        }

        get items() {
            return this.itemList.get();
        }

        set items(children) {
            this.itemList.patch(children);
        }

        start() {
            this._wrapper.transition(this.property, this._scrollTransitionSettings);
            this._scrollTransition = this._wrapper.transition(this.property);
            this._scrollTransition.on('progress', p => this.update());

            this.setIndex(0, true, true);

            this._started = true;

            this.update();
        }

        setIndex(index, immediate = false, closest = false) {
            let nElements = this.length;
            if (!nElements) return;

            this.emit('unfocus', this.getElement(this.realIndex), this._index, this.realIndex);

            if (closest) {
                // Scroll to same offset closest to the index.
                let offset = Utils.getModuloIndex(index, nElements);
                let o = Utils.getModuloIndex(this.index, nElements);
                let diff = offset - o;
                if (diff > 0.5 * nElements) {
                    diff -= nElements;
                } else if (diff < -0.5 * nElements) {
                    diff += nElements;
                }
                this._index += diff;
            } else {
                this._index = index;
            }

            if (this._roll || (this.viewportSize > this._itemSize * nElements)) {
                this._index = Utils.getModuloIndex(this._index, nElements);
            }

            let direction = (this._horizontal ^ this._invertDirection ? -1 : 1);
            let value = direction * this._index * this._itemSize;

            if (this._roll) {
                let min, max, scrollDelta;
                if (direction == 1) {
                    max = (nElements - 1) * this._itemSize;
                    scrollDelta = this._viewportScrollOffset * this.viewportSize - this._itemScrollOffset * this._itemSize;

                    max -= scrollDelta;

                    min = this.viewportSize - (this._itemSize + scrollDelta);

                    if (this._rollMin) min -= this._rollMin;
                    if (this._rollMax) max += this._rollMax;

                    value = Math.max(Math.min(value, max), min);
                } else {
                    max = (nElements * this._itemSize - this.viewportSize);
                    scrollDelta = this._viewportScrollOffset * this.viewportSize - this._itemScrollOffset * this._itemSize;

                    max += scrollDelta;

                    let min = scrollDelta;

                    if (this._rollMin) min -= this._rollMin;
                    if (this._rollMax) max += this._rollMax;

                    value = Math.min(Math.max(-max, value), -min);
                }
            }

            this._scrollTransition.start(value);

            if (immediate) {
                this._scrollTransition.finish();
            }

            this.emit('focus', this.getElement(this.realIndex), this._index, this.realIndex);
        }

        getAxisPosition() {
            let target = -this._scrollTransition._targetValue;

            let direction = (this._horizontal ^ this._invertDirection ? -1 : 1);
            let value = -direction * this._index * this._itemSize;

            return this._viewportScrollOffset * this.viewportSize + (value - target);
        }

        update() {
            if (!this._started) return;

            let nElements = this.length;
            if (!nElements) return;

            let direction = (this._horizontal ^ this._invertDirection ? -1 : 1);

            // Map position to index value.
            let v = (this._horizontal ? this._wrapper.x : this._wrapper.y);

            let viewportSize = this.viewportSize;
            let scrollDelta = this._viewportScrollOffset * viewportSize - this._itemScrollOffset * this._itemSize;
            v += scrollDelta;

            let s, e, ps, pe;
            if (direction == -1) {
                s = Math.floor(-v / this._itemSize);
                ps = 1 - ((-v / this._itemSize) - s);
                e = Math.floor((viewportSize - v) / this._itemSize);
                pe = (((viewportSize - v) / this._itemSize) - e);
            } else {
                s = Math.ceil(v / this._itemSize);
                ps = 1 + (v / this._itemSize) - s;
                e = Math.ceil((v - viewportSize) / this._itemSize);
                pe = e - ((v - viewportSize) / this._itemSize);
            }
            if (this._roll || (viewportSize > this._itemSize * nElements)) {
                // Don't show additional items.
                if (e >= nElements) {
                    e = nElements - 1;
                    pe = 1;
                }
                if (s >= nElements) {
                    s = nElements - 1;
                    ps = 1;
                }
                if (e <= -1) {
                    e = 0;
                    pe = 1;
                }
                if (s <= -1) {
                    s = 0;
                    ps = 1;
                }
            }

            let offset = -direction * s * this._itemSize;

            let item;
            for (let index = s; (direction == -1 ? index <= e : index >= e); (direction == -1 ? index++ : index--)) {
                let realIndex = Utils.getModuloIndex(index, nElements);

                let element = this.getElement(realIndex);
                item = element.parent;
                this._visibleItems.delete(item);
                if (this._horizontal) {
                    item.x = offset + scrollDelta;
                } else {
                    item.y = offset + scrollDelta;
                }

                let wasVisible = item.visible;
                item.visible = true;

                if (!wasVisible || this._reloadVisibleElements) {
                    // Turned visible.
                    this.emit('visible', index, realIndex);
                }



                if (this._progressAnimation) {
                    let p = 1;
                    if (index == s) {
                        p = ps;
                    } else if (index == e) {
                        p = pe;
                    }

                    // Use animation to progress.
                    this._progressAnimation.apply(element, p);
                }

                offset += this._itemSize;
            }

            // Handle item visibility.
            let self = this;
            this._visibleItems.forEach(function(invisibleItem) {
                invisibleItem.visible = false;
                self._visibleItems.delete(invisibleItem);
            });

            for (let index = s; (direction == -1 ? index <= e : index >= e); (direction == -1 ? index++ : index--)) {
                let realIndex = Utils.getModuloIndex(index, nElements);
                this._visibleItems.add(this.getWrapper(realIndex));
            }

            this._reloadVisibleElements = false;
        }

        setPrevious() {
            this.setIndex(this._index - 1);
        }

        setNext() {
            this.setIndex(this._index + 1);
        }

        getWrapper(index) {
            return this._wrapper.children[index];
        }

        getElement(index) {
            let e = this._wrapper.children[index];
            return e ? e.children[0] : null;
        }

        reload() {
            this._reloadVisibleElements = true;
            this.update();
        }

        get element() {
            let e = this._wrapper.children[this.realIndex];
            return e ? e.children[0] : null;
        }

        get length() {
            return this._wrapper.children.length;
        }

        get property() {
            return this._horizontal ? 'x' : 'y';
        }

        get viewportSize() {
            return this._horizontal ? this.w : this.h;
        }

        get index() {
            return this._index;
        }

        get realIndex() {
            return Utils.getModuloIndex(this._index, this.length);
        }

        get itemSize() {
            return this._itemSize;
        }

        set itemSize(v) {
            this._itemSize = v;
            this.update();
        }

        get viewportScrollOffset() {
            return this._viewportScrollOffset;
        }

        set viewportScrollOffset(v) {
            this._viewportScrollOffset = v;
            this.update();
        }

        get itemScrollOffset() {
            return this._itemScrollOffset;
        }

        set itemScrollOffset(v) {
            this._itemScrollOffset = v;
            this.update();
        }

        get scrollTransitionSettings() {
            return this._scrollTransitionSettings;
        }

        set scrollTransitionSettings(v) {
            this._scrollTransitionSettings.patch(v);
        }

        set scrollTransition(v) {
            this._scrollTransitionSettings.patch(v);
        }

        get scrollTransition() {
            return this._scrollTransition;
        }

        get progressAnimation() {
            return this._progressAnimation;
        }

        set progressAnimation(v) {
            if (Utils.isObjectLiteral(v)) {
                this._progressAnimation = this.stage.animations.createSettings(v);
            } else {
                this._progressAnimation = v;
            }
            this.update();
        }

        get roll() {
            return this._roll;
        }

        set roll(v) {
            this._roll = v;
            this.update();
        }

        get rollMin() {
            return this._rollMin;
        }

        set rollMin(v) {
            this._rollMin = v;
            this.update();
        }

        get rollMax() {
            return this._rollMax;
        }

        set rollMax(v) {
            this._rollMax = v;
            this.update();
        }

        get invertDirection() {
            return this._invertDirection;
        }

        set invertDirection(v) {
            if (!this._started) {
                this._invertDirection = v;
            }
        }

        get horizontal() {
            return this._horizontal;
        }

        set horizontal(v) {
            if (v !== this._horizontal) {
                if (!this._started) {
                    this._horizontal = v;
                }
            }
        }

    }
    class ListItems extends ObjectListWrapper {
        constructor(list) {
            let wrap = (item => {
                let parent = item.stage.createView();
                parent.add(item);
                parent.visible = false;
                return parent;
            });

            super(list._wrapper._children, wrap);
            this.list = list;
        }

        onAdd(item, index) {
            super.onAdd(item, index);
            this.checkStarted(index);
        }

        checkStarted(index) {
            this.list._reloadVisibleElements = true;
            if (!this.list._started) {
                this.list.start();
            } else {
                if (this.list.length === 1) {
                    this.list.setIndex(0, true, true);
                } else {
                    if (this.list._index >= this.list.length) {
                        this.list.setIndex(0);
                    }
                }
                this.list.update();
            }
        }

        onRemove(item, index) {
            super.onRemove(item, index);
            let ri = this.list.realIndex;
            if (ri === index) {
                if (ri === this.list.length) {
                    ri--;
                }
                if (ri >= 0) {
                    this.list.setIndex(ri);
                }
            } else if (ri > index) {
                this.list.setIndex(ri - 1);
            }

            this.list._reloadVisibleElements = true;
        }

        onSet(item, index) {
            super.onSet(item, index);
            this.checkStarted(index);
        }

        onSync(removed, added, order) {
            super.onSync(removed, added, order);
            this.checkStarted(0);
        }

        get _passSignals() {
            return true;
        }

    }

    class LinearBlurShader extends DefaultShader$1 {

        constructor(context) {
            super(context);

            this._direction = new Float32Array([1, 0]);
            this._kernelRadius = 1;
        }

        get x() {
            return this._direction[0];
        }

        set x(v) {
            this._direction[0] = v;
            this.redraw();
        }

        get y() {
            return this._direction[1];
        }

        set y(v) {
            this._direction[1] = v;
            this.redraw();
        }

        get kernelRadius() {
            return this._kernelRadius;
        }

        set kernelRadius(v) {
            this._kernelRadius = v;
            this.redraw();
        }


        useDefault() {
            return (this._kernelRadius === 0);
        }

        setupUniforms(operation) {
            super.setupUniforms(operation);
            this._setUniform("direction", this._direction, this.gl.uniform2fv);
            this._setUniform("kernelRadius", this._kernelRadius, this.gl.uniform1i);

            const w = operation.getRenderWidth();
            const h = operation.getRenderHeight();
            this._setUniform("resolution", new Float32Array([w, h]), this.gl.uniform2fv);
        }
    }

    LinearBlurShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    uniform vec2 resolution;
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    uniform vec2 direction;
    uniform int kernelRadius;
    
    vec4 blur1(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
        vec4 color = vec4(0.0);
        vec2 off1 = vec2(1.3333333333333333) * direction;
        color += texture2D(image, uv) * 0.29411764705882354;
        color += texture2D(image, uv + (off1 / resolution)) * 0.35294117647058826;
        color += texture2D(image, uv - (off1 / resolution)) * 0.35294117647058826;
        return color; 
    }
    
    vec4 blur2(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
        vec4 color = vec4(0.0);
        vec2 off1 = vec2(1.3846153846) * direction;
        vec2 off2 = vec2(3.2307692308) * direction;
        color += texture2D(image, uv) * 0.2270270270;
        color += texture2D(image, uv + (off1 / resolution)) * 0.3162162162;
        color += texture2D(image, uv - (off1 / resolution)) * 0.3162162162;
        color += texture2D(image, uv + (off2 / resolution)) * 0.0702702703;
        color += texture2D(image, uv - (off2 / resolution)) * 0.0702702703;
        return color;
    }
    
    vec4 blur3(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
        vec4 color = vec4(0.0);
        vec2 off1 = vec2(1.411764705882353) * direction;
        vec2 off2 = vec2(3.2941176470588234) * direction;
        vec2 off3 = vec2(5.176470588235294) * direction;
        color += texture2D(image, uv) * 0.1964825501511404;
        color += texture2D(image, uv + (off1 / resolution)) * 0.2969069646728344;
        color += texture2D(image, uv - (off1 / resolution)) * 0.2969069646728344;
        color += texture2D(image, uv + (off2 / resolution)) * 0.09447039785044732;
        color += texture2D(image, uv - (off2 / resolution)) * 0.09447039785044732;
        color += texture2D(image, uv + (off3 / resolution)) * 0.010381362401148057;
        color += texture2D(image, uv - (off3 / resolution)) * 0.010381362401148057;
        return color;
    }    

    void main(void){
        if (kernelRadius == 1) {
            gl_FragColor = blur1(uSampler, vTextureCoord, resolution, direction) * vColor;
        } else if (kernelRadius == 2) {
            gl_FragColor = blur2(uSampler, vTextureCoord, resolution, direction) * vColor;
        } else {
            gl_FragColor = blur3(uSampler, vTextureCoord, resolution, direction) * vColor;
        }
    }
`;

    /**
     * 4x4 box blur shader which works in conjunction with a 50% rescale.
     */
    class BoxBlurShader extends DefaultShader$1 {

        setupUniforms(operation) {
            super.setupUniforms(operation);
            const dx = 1.0 / operation.getTextureWidth(0);
            const dy = 1.0 / operation.getTextureHeight(0);
            this._setUniform("stepTextureCoord", new Float32Array([dx, dy]), this.gl.uniform2fv);
        }

    }

    BoxBlurShader.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    uniform vec2 stepTextureCoord;
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    attribute vec4 aColor;
    uniform vec2 projection;
    varying vec4 vColor;
    varying vec2 vTextureCoordUl;
    varying vec2 vTextureCoordUr;
    varying vec2 vTextureCoordBl;
    varying vec2 vTextureCoordBr;
    void main(void){
        gl_Position = vec4(aVertexPosition.x * projection.x - 1.0, aVertexPosition.y * -abs(projection.y) + 1.0, 0.0, 1.0);
        vTextureCoordUl = aTextureCoord - stepTextureCoord;
        vTextureCoordBr = aTextureCoord + stepTextureCoord;
        vTextureCoordUr = vec2(vTextureCoordBr.x, vTextureCoordUl.y);
        vTextureCoordBl = vec2(vTextureCoordUl.x, vTextureCoordBr.y);
        vColor = aColor;
        gl_Position.y = -sign(projection.y) * gl_Position.y;
    }
`;

    BoxBlurShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoordUl;
    varying vec2 vTextureCoordUr;
    varying vec2 vTextureCoordBl;
    varying vec2 vTextureCoordBr;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    void main(void){
        vec4 color = 0.25 * (texture2D(uSampler, vTextureCoordUl) + texture2D(uSampler, vTextureCoordUr) + texture2D(uSampler, vTextureCoordBl) + texture2D(uSampler, vTextureCoordBr));
        gl_FragColor = color * vColor;
    }
`;

    class BlurShader extends DefaultShader$2 {

        constructor(context) {
            super(context);
            this._kernelRadius = 1;
        }

        get kernelRadius() {
            return this._kernelRadius;
        }

        set kernelRadius(v) {
            this._kernelRadius = v;
            this.redraw();
        }

        useDefault() {
            return this._amount === 0;
        }

        _beforeDrawEl({target}) {
            target.ctx.filter = "blur(" + this._kernelRadius + "px)";
        }

        _afterDrawEl({target}) {
            target.ctx.filter = "none";
        }

    }

    class FastBlurComponent extends Component {
        static _template() {
            return {
                passSignals: true,
                Wrap: {type: WebGLFastBlurComponent, _$c2d: {type: C2dFastBlurComponent}}
            }
        }

        get wrap() {
            return this.tag("Wrap");
        }

        set content(v) {
            return this.wrap.content = v;
        }

        get content() {
            return this.wrap.content;
        }

        set padding(v) {
            this.wrap._paddingX = v;
            this.wrap._paddingY = v;
            this.wrap._updateBlurSize();
        }

        set paddingX(v) {
            this.wrap._paddingX = v;
            this.wrap._updateBlurSize();
        }

        set paddingY(v) {
            this.wrap._paddingY = v;
            this.wrap._updateBlurSize();
        }

        set amount(v) {
            return this.wrap.amount = v;
        }

        get amount() {
            return this.wrap.amount;
        }

        _onResize() {
            this.wrap.w = this.renderWidth;
            this.wrap.h = this.renderHeight;
        }

        get _passSignals() {
            return true;
        }

    }


    class C2dFastBlurComponent extends Component {

        static _template() {
            return {
                forceZIndexContext: true,
                rtt: true,
                Textwrap: {shader: {type: BlurShader}, Content: {}}
            }
        }

        constructor(stage) {
            super(stage);
            this._textwrap = this.sel("Textwrap");
            this._wrapper = this.sel("Textwrap>Content");

            this._amount = 0;
            this._paddingX = 0;
            this._paddingY = 0;

        }

        static getSpline() {
            if (!this._multiSpline) {
                this._multiSpline = new MultiSpline();
                this._multiSpline.parse(false, {0: 0, 0.25: 1.5, 0.5: 5.5, 0.75: 18, 1: 39});
            }
            return this._multiSpline;
        }

        get content() {
            return this.sel('Textwrap>Content');
        }

        set content(v) {
            this.sel('Textwrap>Content').patch(v, true);
        }

        set padding(v) {
            this._paddingX = v;
            this._paddingY = v;
            this._updateBlurSize();
        }

        set paddingX(v) {
            this._paddingX = v;
            this._updateBlurSize();
        }

        set paddingY(v) {
            this._paddingY = v;
            this._updateBlurSize();
        }

        _updateBlurSize() {
            let w = this.renderWidth;
            let h = this.renderHeight;

            let paddingX = this._paddingX;
            let paddingY = this._paddingY;

            this._wrapper.x = paddingX;
            this._textwrap.x = -paddingX;

            this._wrapper.y = paddingY;
            this._textwrap.y = -paddingY;

            this._textwrap.w = w + paddingX * 2;
            this._textwrap.h = h + paddingY * 2;
        }

        get amount() {
            return this._amount;
        }

        /**
         * Sets the amount of blur. A value between 0 and 4. Goes up exponentially for blur.
         * Best results for non-fractional values.
         * @param v;
         */
        set amount(v) {
            this._amount = v;
            this._textwrap.shader.kernelRadius = C2dFastBlurComponent._amountToKernelRadius(v);
        }

        static _amountToKernelRadius(v) {
            return C2dFastBlurComponent.getSpline().getValue(Math.min(1, v * 0.25));
        }

        get _passSignals() {
            return true;
        }

    }

    class WebGLFastBlurComponent extends Component {

        static _template() {
            const onUpdate = function(view, viewCore) {
                if ((viewCore._recalc & (2 + 128))) {
                    const w = viewCore.w;
                    const h = viewCore.h;
                    let cur = viewCore;
                    do {
                        cur = cur._children[0];
                        cur._view.w = w;
                        cur._view.h = h;
                    } while(cur._children);
                }
            };

            return {
                Textwrap: {rtt: true, forceZIndexContext: true, renderOffscreen: true, Content: {}},
                Layers: {
                    L0: {rtt: true, onUpdate: onUpdate, renderOffscreen: true, visible: false, Content: {shader: {type: BoxBlurShader}}},
                    L1: {rtt: true, onUpdate: onUpdate, renderOffscreen: true, visible: false, Content: {shader: {type: BoxBlurShader}}},
                    L2: {rtt: true, onUpdate: onUpdate, renderOffscreen: true, visible: false, Content: {shader: {type: BoxBlurShader}}},
                    L3: {rtt: true, onUpdate: onUpdate, renderOffscreen: true, visible: false, Content: {shader: {type: BoxBlurShader}}}
                },
                Result: {shader: {type: FastBlurOutputShader}, visible: false}
            }
        }

        constructor(stage) {
            super(stage);
            this._textwrap = this.sel("Textwrap");
            this._wrapper = this.sel("Textwrap>Content");
            this._layers = this.sel("Layers");
            this._output = this.sel("Result");

            this._amount = 0;
            this._paddingX = 0;
            this._paddingY = 0;
        }

        _build() {
            const filterShaderSettings = [{x:1,y:0,kernelRadius:1},{x:0,y:1,kernelRadius:1},{x:1.5,y:0,kernelRadius:1},{x:0,y:1.5,kernelRadius:1}];
            const filterShaders = filterShaderSettings.map(s => {
                const shader = Shader.create(this.stage, Object.assign({type: LinearBlurShader}, s));
                return shader;
            });

            this._setLayerTexture(this.getLayerContents(0), this._textwrap.getTexture(), []);
            this._setLayerTexture(this.getLayerContents(1), this.getLayer(0).getTexture(), [filterShaders[0], filterShaders[1]]);

            // Notice that 1.5 filters should be applied before 1.0 filters.
            this._setLayerTexture(this.getLayerContents(2), this.getLayer(1).getTexture(), [filterShaders[0], filterShaders[1], filterShaders[2], filterShaders[3]]);
            this._setLayerTexture(this.getLayerContents(3), this.getLayer(2).getTexture(), [filterShaders[0], filterShaders[1], filterShaders[2], filterShaders[3]]);
        }

        _setLayerTexture(view, texture, steps) {
            if (!steps.length) {
                view.texture = texture;
            } else {
                const step = steps.pop();
                const child = view.stage.c({rtt: true, shader: step});

                // Recurse.
                this._setLayerTexture(child, texture, steps);

                view.childList.add(child);
            }
            return view;
        }

        get content() {
            return this.sel('Textwrap>Content');
        }

        set content(v) {
            this.sel('Textwrap>Content').patch(v, true);
        }

        set padding(v) {
            this._paddingX = v;
            this._paddingY = v;
            this._updateBlurSize();
        }

        set paddingX(v) {
            this._paddingX = v;
            this._updateBlurSize();
        }

        set paddingY(v) {
            this._paddingY = v;
            this._updateBlurSize();
        }

        getLayer(i) {
            return this._layers.sel("L" + i);
        }

        getLayerContents(i) {
            return this.getLayer(i).sel("Content");
        }

        _onResize() {
            this._updateBlurSize();
        }

        _updateBlurSize() {
            let w = this.renderWidth;
            let h = this.renderHeight;

            let paddingX = this._paddingX;
            let paddingY = this._paddingY;

            let fw = w + paddingX * 2;
            let fh = h + paddingY * 2;
            this._textwrap.w = fw;
            this._wrapper.x = paddingX;
            this.getLayer(0).w = this.getLayerContents(0).w = fw / 2;
            this.getLayer(1).w = this.getLayerContents(1).w = fw / 4;
            this.getLayer(2).w = this.getLayerContents(2).w = fw / 8;
            this.getLayer(3).w = this.getLayerContents(3).w = fw / 16;
            this._output.x = -paddingX;
            this._textwrap.x = -paddingX;
            this._output.w = fw;

            this._textwrap.h = fh;
            this._wrapper.y = paddingY;
            this.getLayer(0).h = this.getLayerContents(0).h = fh / 2;
            this.getLayer(1).h = this.getLayerContents(1).h = fh / 4;
            this.getLayer(2).h = this.getLayerContents(2).h = fh / 8;
            this.getLayer(3).h = this.getLayerContents(3).h = fh / 16;
            this._output.y = -paddingY;
            this._textwrap.y = -paddingY;
            this._output.h = fh;

            this.w = w;
            this.h = h;
        }

        /**
         * Sets the amount of blur. A value between 0 and 4. Goes up exponentially for blur.
         * Best results for non-fractional values.
         * @param v;
         */
        set amount(v) {
            this._amount = v;
            this._update();
        }

        get amount() {
            return this._amount;
        }

        _update() {
            let v = Math.min(4, Math.max(0, this._amount));
            if (v === 0) {
                this._textwrap.renderToTexture = false;
                this._output.shader.otherTextureSource = null;
                this._output.visible = false;
            } else {
                this._textwrap.renderToTexture = true;
                this._output.visible = true;

                this.getLayer(0).visible = (v > 0);
                this.getLayer(1).visible = (v > 1);
                this.getLayer(2).visible = (v > 2);
                this.getLayer(3).visible = (v > 3);

                if (v <= 1) {
                    this._output.texture = this._textwrap.getTexture();
                    this._output.shader.otherTextureSource = this.getLayer(0).getTexture();
                    this._output.shader.a = v;
                } else if (v <= 2) {
                    this._output.texture = this.getLayer(0).getTexture();
                    this._output.shader.otherTextureSource = this.getLayer(1).getTexture();
                    this._output.shader.a = v - 1;
                } else if (v <= 3) {
                    this._output.texture = this.getLayer(1).getTexture();
                    this._output.shader.otherTextureSource = this.getLayer(2).getTexture();
                    this._output.shader.a = v - 2;
                } else if (v <= 4) {
                    this._output.texture = this.getLayer(2).getTexture();
                    this._output.shader.otherTextureSource = this.getLayer(3).getTexture();
                    this._output.shader.a = v - 3;
                }
            }
        }

        set shader(s) {
            super.shader = s;
            if (!this.renderToTexture) {
                console.warn("FastBlurView: please enable renderToTexture to use with a shader.");
            }
        }

        static _states() {
            const p = WebGLFastBlurComponent.prototype;
            return {
                _firstActive: p._build
            }
        }

        get _passSignals() {
            return true;
        }

    }

    /**
     * Shader that combines two textures into one output.
     */
    class FastBlurOutputShader extends DefaultShader$1 {

        constructor(ctx) {
            super(ctx);

            this._a = 0;
            this._otherTextureSource = null;
        }

        get a() {
            return this._a;
        }

        set a(v) {
            this._a = v;
            this.redraw();
        }

        set otherTextureSource(v) {
            this._otherTextureSource = v;
            this.redraw();
        }

        setupUniforms(operation) {
            super.setupUniforms(operation);
            this._setUniform("a", this._a, this.gl.uniform1f);
            this._setUniform("uSampler2", 1, this.gl.uniform1i);
        }

        beforeDraw(operation) {
            let glTexture = this._otherTextureSource ? this._otherTextureSource.nativeTexture : null;

            let gl = this.gl;
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, glTexture);
            gl.activeTexture(gl.TEXTURE0);
        }
    }

    FastBlurOutputShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    uniform sampler2D uSampler2;
    uniform float a;
    void main(void){
        if (a == 1.0) {
            gl_FragColor = texture2D(uSampler2, vTextureCoord) * vColor;
        } else {
            gl_FragColor = ((1.0 - a) * texture2D(uSampler, vTextureCoord) + (a * texture2D(uSampler2, vTextureCoord))) * vColor;
        }
    }
`;

    class BloomComponent extends Component {

        static _template() {
            const onUpdate = function(view, viewCore) {
                if ((viewCore._recalc & (2 + 128))) {
                    const w = viewCore.w;
                    const h = viewCore.h;
                    let cur = viewCore;
                    do {
                        cur = cur._children[0];
                        cur._view.w = w;
                        cur._view.h = h;
                    } while(cur._children);
                }
            };

            return {
                Textwrap: {rtt: true, forceZIndexContext: true, renderOffscreen: true,
                    BloomBase: {shader: {type: BloomBaseShader},
                        Content: {}
                    }
                },
                Layers: {
                    L0: {rtt: true, onUpdate: onUpdate, scale: 2, pivot: 0, visible: false, Content: {shader: {type: BoxBlurShader}}},
                    L1: {rtt: true, onUpdate: onUpdate, scale: 4, pivot: 0, visible: false, Content: {shader: {type: BoxBlurShader}}},
                    L2: {rtt: true, onUpdate: onUpdate, scale: 8, pivot: 0, visible: false, Content: {shader: {type: BoxBlurShader}}},
                    L3: {rtt: true, onUpdate: onUpdate, scale: 16, pivot: 0, visible: false, Content: {shader: {type: BoxBlurShader}}}
                }
            }
        }

        constructor(stage) {
            super(stage);
            this._textwrap = this.sel("Textwrap");
            this._wrapper = this.sel("Textwrap.Content");
            this._layers = this.sel("Layers");

            this._amount = 0;
            this._paddingX = 0;
            this._paddingY = 0;
        }

        _build() {
            const filterShaderSettings = [{x:1,y:0,kernelRadius:3},{x:0,y:1,kernelRadius:3},{x:1.5,y:0,kernelRadius:3},{x:0,y:1.5,kernelRadius:3}];
            const filterShaders = filterShaderSettings.map(s => {
                const shader = this.stage.createShader(Object.assign({type: LinearBlurShader}, s));
                return shader;
            });

            this._setLayerTexture(this.getLayerContents(0), this._textwrap.getTexture(), []);
            this._setLayerTexture(this.getLayerContents(1), this.getLayer(0).getTexture(), [filterShaders[0], filterShaders[1]]);

            // Notice that 1.5 filters should be applied before 1.0 filters.
            this._setLayerTexture(this.getLayerContents(2), this.getLayer(1).getTexture(), [filterShaders[0], filterShaders[1], filterShaders[2], filterShaders[3]]);
            this._setLayerTexture(this.getLayerContents(3), this.getLayer(2).getTexture(), [filterShaders[0], filterShaders[1], filterShaders[2], filterShaders[3]]);
        }

        _setLayerTexture(view, texture, steps) {
            if (!steps.length) {
                view.texture = texture;
            } else {
                const step = steps.pop();
                const child = view.stage.c({rtt: true, shader: step});

                // Recurse.
                this._setLayerTexture(child, texture, steps);

                view.childList.add(child);
            }
            return view;
        }

        get content() {
            return this.sel('Textwrap.Content');
        }

        set content(v) {
            this.sel('Textwrap.Content').patch(v, true);
        }

        set padding(v) {
            this._paddingX = v;
            this._paddingY = v;
            this._updateBlurSize();
        }

        set paddingX(v) {
            this._paddingX = v;
            this._updateBlurSize();
        }

        set paddingY(v) {
            this._paddingY = v;
            this._updateBlurSize();
        }

        getLayer(i) {
            return this._layers.sel("L" + i);
        }

        getLayerContents(i) {
            return this.getLayer(i).sel("Content");
        }

        _onResize() {
            this._updateBlurSize();
        }

        _updateBlurSize() {
            let w = this.renderWidth;
            let h = this.renderHeight;

            let paddingX = this._paddingX;
            let paddingY = this._paddingY;

            let fw = w + paddingX * 2;
            let fh = h + paddingY * 2;
            this._textwrap.w = fw;
            this._wrapper.x = paddingX;
            this.getLayer(0).w = this.getLayerContents(0).w = fw / 2;
            this.getLayer(1).w = this.getLayerContents(1).w = fw / 4;
            this.getLayer(2).w = this.getLayerContents(2).w = fw / 8;
            this.getLayer(3).w = this.getLayerContents(3).w = fw / 16;
            this._textwrap.x = -paddingX;

            this._textwrap.h = fh;
            this._wrapper.y = paddingY;
            this.getLayer(0).h = this.getLayerContents(0).h = fh / 2;
            this.getLayer(1).h = this.getLayerContents(1).h = fh / 4;
            this.getLayer(2).h = this.getLayerContents(2).h = fh / 8;
            this.getLayer(3).h = this.getLayerContents(3).h = fh / 16;
            this._textwrap.y = -paddingY;

            this.w = w;
            this.h = h;
        }

        /**
         * Sets the amount of blur. A value between 0 and 4. Goes up exponentially for blur.
         * Best results for non-fractional values.
         * @param v;
         */
        set amount(v) {
            this._amount = v;
            this._update();
        }

        get amount() {
            return this._amount;
        }

        _update() {
            let v = Math.min(4, Math.max(0, this._amount));
            if (v > 0) {
                this.getLayer(0).visible = (v > 0);
                this.getLayer(1).visible = (v > 1);
                this.getLayer(2).visible = (v > 2);
                this.getLayer(3).visible = (v > 3);
            }
        }

        set shader(s) {
            super.shader = s;
            if (!this.renderToTexture) {
                console.warn("FastBlurView: please enable renderToTexture to use with a shader.");
            }
        }

        static _states() {
            const p = BloomComponent.prototype;
            return {
                _firstActive: p._build
            }
        }

        get _passSignals() {
            return true;
        }

    }

    class BloomBaseShader extends DefaultShader$1 {
    }

    BloomBaseShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    void main(void){
        vec4 color = texture2D(uSampler, vTextureCoord) * vColor;
        float m = max(max(color.r, color.g), color.b);
        float c = max(0.0, (m - 0.80)) * 5.0;
        color = color * c;
        gl_FragColor = color;
    }
`;

    class SmoothScaleComponent extends Component {

        static _template() {
            return {
                ContentWrap: {renderOffscreen: true, forceZIndexContext: true, onAfterUpdate: SmoothScaleComponent._updateDimensions,
                    Content: {}
                },
                Scale: {visible: false}
            }
        }

        constructor(stage) {
            super(stage);

            this._smoothScale = 1;
            this._iterations = 0;
        }

        get content() {
            return this.tag('Content');
        }

        set content(v) {
            this.tag('Content').patch(v, true);
        }

        get smoothScale() {
            return this._smoothScale;
        }

        set smoothScale(v) {
            if (this._smoothScale !== v) {
                let its = 0;
                while(v < 0.5 && its < 12) {
                    its++;
                    v = v * 2;
                }

                this.scale = v;
                this._setIterations(its);

                this._smoothScale = v;
            }
        }

        _setIterations(its) {
            if (this._iterations !== its) {
                const scalers = this.sel("Scale").childList;
                const content = this.sel("ContentWrap");
                while (scalers.length < its) {
                    const first = scalers.length === 0;
                    const texture = (first ? content.getTexture() : scalers.last.getTexture());
                    scalers.a({rtt: true, renderOffscreen: true, texture: texture});
                }

                SmoothScaleComponent._updateDimensions(this.tag("ContentWrap"), true);

                const useScalers = (its > 0);
                this.patch({
                    ContentWrap: {renderToTexture: useScalers},
                    Scale: {visible: useScalers}
                });

                for (let i = 0, n = scalers.length; i < n; i++) {
                    scalers.getAt(i).patch({
                        visible: i < its,
                        renderOffscreen: i !== its - 1
                    });
                }
                this._iterations = its;
            }
        }

        static _updateDimensions(contentWrap, force) {
            const content = contentWrap.children[0];
            let w = content.renderWidth;
            let h = content.renderHeight;
            if (w !== contentWrap.w || h !== contentWrap.h || force) {
                contentWrap.w = w;
                contentWrap.h = h;

                const scalers = contentWrap.parent.tag("Scale").children;
                for (let i = 0, n = scalers.length; i < n; i++) {
                    w = w * 0.5;
                    h = h * 0.5;
                    scalers[i].w = w;
                    scalers[i].h = h;
                }
            }
        }

        get _passSignals() {
            return true;
        }

    }

    class BorderComponent extends Component {

        static _template() {
            return {
                Content: {},
                Borders: {
                    Top: {rect: true, visible: false, mountY: 1},
                    Right: {rect: true, visible: false},
                    Bottom: {rect: true, visible: false},
                    Left: {rect: true, visible: false, mountX: 1}
                }
            };
        }

        constructor(stage) {
            super(stage);

            this._borderTop = this.tag("Top");
            this._borderRight = this.tag("Right");
            this._borderBottom = this.tag("Bottom");
            this._borderLeft = this.tag("Left");

            this.onAfterUpdate = function (view) {
                const content = view.childList.first;
                let w = view.core.w || content.renderWidth;
                let h = view.core.h || content.renderHeight;
                view._borderTop.w = w;
                view._borderBottom.y = h;
                view._borderBottom.w = w;
                view._borderLeft.h = h + view._borderTop.h + view._borderBottom.h;
                view._borderLeft.y = -view._borderTop.h;
                view._borderRight.x = w;
                view._borderRight.h = h + view._borderTop.h + view._borderBottom.h;
                view._borderRight.y = -view._borderTop.h;
            };

            this.borderWidth = 1;
        }

        get content() {
            return this.sel('Content');
        }

        set content(v) {
            this.sel('Content').patch(v, true);
        }

        get borderWidth() {
            return this.borderWidthTop;
        }

        get borderWidthTop() {
            return this._borderTop.h;
        }

        get borderWidthRight() {
            return this._borderRight.w;
        }

        get borderWidthBottom() {
            return this._borderBottom.h;
        }

        get borderWidthLeft() {
            return this._borderLeft.w;
        }

        set borderWidth(v) {
            this.borderWidthTop = v;
            this.borderWidthRight = v;
            this.borderWidthBottom = v;
            this.borderWidthLeft = v;
        }

        set borderWidthTop(v) {
            this._borderTop.h = v;
            this._borderTop.visible = (v > 0);
        }

        set borderWidthRight(v) {
            this._borderRight.w = v;
            this._borderRight.visible = (v > 0);
        }

        set borderWidthBottom(v) {
            this._borderBottom.h = v;
            this._borderBottom.visible = (v > 0);
        }

        set borderWidthLeft(v) {
            this._borderLeft.w = v;
            this._borderLeft.visible = (v > 0);
        }

        get colorBorder() {
            return this.colorBorderTop;
        }

        get colorBorderTop() {
            return this._borderTop.color;
        }

        get colorBorderRight() {
            return this._borderRight.color;
        }

        get colorBorderBottom() {
            return this._borderBottom.color;
        }

        get colorBorderLeft() {
            return this._borderLeft.color;
        }

        set colorBorder(v) {
            this.colorBorderTop = v;
            this.colorBorderRight = v;
            this.colorBorderBottom = v;
            this.colorBorderLeft = v;
        }

        set colorBorderTop(v) {
            this._borderTop.color = v;
        }

        set colorBorderRight(v) {
            this._borderRight.color = v;
        }

        set colorBorderBottom(v) {
            this._borderBottom.color = v;
        }

        set colorBorderLeft(v) {
            this._borderLeft.color = v;
        }

        get borderTop() {
            return this._borderTop;
        }

        set borderTop(settings) {
            this.borderTop.patch(settings);
        }

        get borderRight() {
            return this._borderRight;
        }

        set borderRight(settings) {
            this.borderRight.patch(settings);
        }

        get borderBottom() {
            return this._borderBottom;
        }

        set borderBottom(settings) {
            this.borderBottom.patch(settings);
        }

        get borderLeft() {
            return this._borderLeft;
        }

        set borderLeft(settings) {
            this.borderLeft.patch(settings);
        }

        set borders(settings) {
            this.borderTop = settings;
            this.borderLeft = settings;
            this.borderBottom = settings;
            this.borderRight = settings;
        }

        get _passSignals() {
            return true;
        }

    }

    class GrayscaleShader extends DefaultShader$2 {

        constructor(context) {
            super(context);
            this._amount = 1;
        }

        static getWebGL() {
            return GrayscaleShader$1;
        }


        set amount(v) {
            this._amount = v;
            this.redraw();
        }

        get amount() {
            return this._amount;
        }

        useDefault() {
            return this._amount === 0;
        }

        _beforeDrawEl({target}) {
            target.ctx.filter = "grayscale(" + this._amount + ")";
        }

        _afterDrawEl({target}) {
            target.ctx.filter = "none";
        }

    }

    class GrayscaleShader$1 extends DefaultShader$1 {

        constructor(context) {
            super(context);
            this._amount = 1;
        }

        static getC2d() {
            return GrayscaleShader;
        }


        set amount(v) {
            this._amount = v;
            this.redraw();
        }

        get amount() {
            return this._amount;
        }

        useDefault() {
            return this._amount === 0;
        }

        setupUniforms(operation) {
            super.setupUniforms(operation);
            this._setUniform("amount", this._amount, this.gl.uniform1f);
        }

    }

    GrayscaleShader$1.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    uniform float amount;
    void main(void){
        vec4 color = texture2D(uSampler, vTextureCoord) * vColor;
        float grayness = 0.2 * color.r + 0.6 * color.g + 0.2 * color.b;
        gl_FragColor = vec4(amount * vec3(grayness, grayness, grayness) + (1.0 - amount) * color.rgb, color.a);
    }
`;

    /**
     * This shader can be used to fix a problem that is known as 'gradient banding'.
     */
    class DitheringShader extends DefaultShader$1 {

        constructor(ctx) {
            super(ctx);

            this._noiseTexture = new NoiseTexture(ctx.stage);

            this._graining = 1/256;

            this._random = false;
        }

        set graining(v) {
            this._graining = v;
            this.redraw();
        }

        set random(v) {
            this._random = v;
            this.redraw();
        }

        setExtraAttribsInBuffer(operation) {
            // Make sure that the noise texture is uploaded to the GPU.
            this._noiseTexture.load();

            let offset = operation.extraAttribsDataByteOffset / 4;
            let floats = operation.quads.floats;

            let length = operation.length;

            for (let i = 0; i < length; i++) {

                // Calculate noise texture coordinates so that it spans the full view.
                let brx = operation.getViewWidth(i) / this._noiseTexture.getRenderWidth();
                let bry = operation.getViewHeight(i) / this._noiseTexture.getRenderHeight();

                let ulx = 0;
                let uly = 0;
                if (this._random) {
                    ulx = Math.random();
                    uly = Math.random();

                    brx += ulx;
                    bry += uly;

                    if (Math.random() < 0.5) {
                        // Flip for more randomness.
                        const t = ulx;
                        ulx = brx;
                        brx = t;
                    }

                    if (Math.random() < 0.5) {
                        // Flip for more randomness.
                        const t = uly;
                        uly = bry;
                        bry = t;
                    }
                }

                // Specify all corner points.
                floats[offset] = ulx;
                floats[offset + 1] = uly;

                floats[offset + 2] = brx;
                floats[offset + 3] = uly;

                floats[offset + 4] = brx;
                floats[offset + 5] = bry;

                floats[offset + 6] = ulx;
                floats[offset + 7] = bry;

                offset += 8;
            }
        }

        beforeDraw(operation) {
            let gl = this.gl;
            gl.vertexAttribPointer(this._attrib("aNoiseTextureCoord"), 2, gl.FLOAT, false, 8, this.getVertexAttribPointerOffset(operation));

            let glTexture = this._noiseTexture.source.nativeTexture;
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, glTexture);
            gl.activeTexture(gl.TEXTURE0);
        }

        getExtraAttribBytesPerVertex() {
            return 8;
        }

        setupUniforms(operation) {
            super.setupUniforms(operation);
            this._setUniform("uNoiseSampler", 1, this.gl.uniform1i);
            this._setUniform("graining", 2 * this._graining, this.gl.uniform1f);
        }

        enableAttribs() {
            super.enableAttribs();
            let gl = this.gl;
            gl.enableVertexAttribArray(this._attrib("aNoiseTextureCoord"));
        }

        disableAttribs() {
            super.disableAttribs();
            let gl = this.gl;
            gl.disableVertexAttribArray(this._attrib("aNoiseTextureCoord"));
        }

        useDefault() {
            return this._graining === 0;
        }

        afterDraw(operation) {
            if (this._random) {
                this.redraw();
            }
        }

    }

    DitheringShader.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    attribute vec2 aNoiseTextureCoord;
    attribute vec4 aColor;
    uniform vec2 projection;
    varying vec2 vTextureCoord;
    varying vec2 vNoiseTextureCoord;
    varying vec4 vColor;
    void main(void){
        gl_Position = vec4(aVertexPosition.x * projection.x - 1.0, aVertexPosition.y * -abs(projection.y) + 1.0, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
        vNoiseTextureCoord = aNoiseTextureCoord;
        vColor = aColor;
        gl_Position.y = -sign(projection.y) * gl_Position.y;
    }
`;

    DitheringShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec2 vNoiseTextureCoord;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    uniform sampler2D uNoiseSampler;
    uniform float graining;
    void main(void){
        vec4 noise = texture2D(uNoiseSampler, vNoiseTextureCoord);
        vec4 color = texture2D(uSampler, vTextureCoord);
        gl_FragColor = (color * vColor) + graining * (noise.r - 0.5);
    }
`;

    class CircularPushShader extends DefaultShader$1 {

        constructor(ctx) {
            super(ctx);

            this._inputValue = 0;

            this._maxDerivative = 0.01;

            this._normalizedValue = 0;

            // The offset between buckets. A value between 0 and 1.
            this._offset = 0;

            this._amount = 0.1;

            this._aspectRatio = 1;

            this._offsetX = 0;

            this._offsetY = 0;

            this.buckets = 100;
        }

        get aspectRatio() {
            return this._aspectRatio;
        }

        set aspectRatio(v) {
            this._aspectRatio = v;
            this.redraw();
        }

        get offsetX() {
            return this._offsetX;
        }

        set offsetX(v) {
            this._offsetX = v;
            this.redraw();
        }

        get offsetY() {
            return this._offsetY;
        }

        set offsetY(v) {
            this._offsetY = v;
            this.redraw();
        }

        set amount(v) {
            this._amount = v;
            this.redraw();
        }

        get amount() {
            return this._amount;
        }

        set inputValue(v) {
            this._inputValue = v;
        }

        get inputValue() {
            return this._inputValue;
        }

        set maxDerivative(v) {
            this._maxDerivative = v;
        }

        get maxDerivative() {
            return this._maxDerivative;
        }

        set buckets(v) {
            if (v > 100) {
                console.warn("CircularPushShader: supports max 100 buckets");
                v = 100;
            }

            // This should be set before starting.
            this._buckets = v;

            // Init values array in the correct length.
            this._values = new Uint8Array(this._getValues(v));

            this.redraw();
        }

        get buckets() {
            return this._buckets;
        }

        _getValues(n) {
            const v = [];
            for (let i = 0; i < n; i++) {
                v.push(this._inputValue);
            }
            return v;
        }

        /**
         * Progresses the shader with the specified (fractional) number of buckets.
         * @param {number} o;
         *   A number from 0 to 1 (1 = all buckets).
         */
        progress(o) {
            this._offset += o * this._buckets;
            const full = Math.floor(this._offset);
            this._offset -= full;
            this._shiftBuckets(full);
            this.redraw();
        }

        _shiftBuckets(n) {
            for (let i = this._buckets - 1; i >= 0; i--) {
                const targetIndex = i - n;
                if (targetIndex < 0) {
                    this._normalizedValue = Math.min(this._normalizedValue + this._maxDerivative, Math.max(this._normalizedValue - this._maxDerivative, this._inputValue));
                    this._values[i] = 255 * this._normalizedValue;
                } else {
                    this._values[i] = this._values[targetIndex];
                }
            }
        }

        set offset(v) {
            this._offset = v;
            this.redraw();
        }

        setupUniforms(operation) {
            super.setupUniforms(operation);
            this._setUniform("aspectRatio", this._aspectRatio, this.gl.uniform1f);
            this._setUniform("offsetX", this._offsetX, this.gl.uniform1f);
            this._setUniform("offsetY", this._offsetY, this.gl.uniform1f);
            this._setUniform("amount", this._amount, this.gl.uniform1f);
            this._setUniform("offset", this._offset, this.gl.uniform1f);
            this._setUniform("buckets", this._buckets, this.gl.uniform1f);
            this._setUniform("uValueSampler", 1, this.gl.uniform1i);
        }

        useDefault() {
            return this._amount === 0;
        }

        beforeDraw(operation) {
            const gl = this.gl;
            gl.activeTexture(gl.TEXTURE1);
            if (!this._valuesTexture) {
                this._valuesTexture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, this._valuesTexture);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                if (Utils.isNode) {
                    gl.pixelStorei(gl.UNPACK_FLIP_BLUE_RED, false);
                }
                gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
            } else {
                gl.bindTexture(gl.TEXTURE_2D, this._valuesTexture);
            }

            // Upload new values.
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, this._buckets, 1, 0, gl.ALPHA, gl.UNSIGNED_BYTE, this._values);
            gl.activeTexture(gl.TEXTURE0);
        }

        cleanup() {
            if (this._valuesTexture) {
                this.gl.deleteTexture(this._valuesTexture);
            }
        }


    }

    CircularPushShader.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    attribute vec4 aColor;
    uniform vec2 projection;
    uniform float offsetX;
    uniform float offsetY;
    uniform float aspectRatio;
    varying vec2 vTextureCoord;
    varying vec2 vPos;
    varying vec4 vColor;
    void main(void){
        gl_Position = vec4(aVertexPosition.x * projection.x - 1.0, aVertexPosition.y * -abs(projection.y) + 1.0, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
        vPos = vTextureCoord * 2.0 - 1.0;
        vPos.y = vPos.y * aspectRatio;
        vPos.y = vPos.y + offsetY;
        vPos.x = vPos.x + offsetX;
        vColor = aColor;
        gl_Position.y = -sign(projection.y) * gl_Position.y;
    }
`;

    CircularPushShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    varying vec2 vPos;
    uniform float amount;
    uniform float offset;
    uniform float values[100];
    uniform float buckets;
    uniform sampler2D uSampler;
    uniform sampler2D uValueSampler;
    void main(void){
        float l = length(vPos);
        float m = (l * buckets * 0.678 - offset) / buckets;
        float f = texture2D(uValueSampler, vec2(m, 0.0)).a * amount;
        vec2 unit = vPos / l;
        gl_FragColor = texture2D(uSampler, vTextureCoord - f * unit) * vColor;
    }
`;

    class InversionShader extends DefaultShader$1 {
    }

    InversionShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    void main(void){
        vec4 color = texture2D(uSampler, vTextureCoord);
        color.rgb = 1.0 - color.rgb; 
        gl_FragColor = color * vColor;
    }
`;

    class OutlineShader extends DefaultShader$1 {

        constructor(ctx) {
            super(ctx);
            this._width = 5;
            this._col = 0xFFFFFFFF;
            this._color = [1,1,1,1];
        }

        set width(v) {
            this._width = v;
            this.redraw();
        }

        get color() {
            return this._col;
        }

        set color(v) {
            if (this._col !== v) {
                const col = StageUtils.getRgbaComponentsNormalized(v);
                col[0] = col[0] * col[3];
                col[1] = col[1] * col[3];
                col[2] = col[2] * col[3];

                this._color = col;

                this.redraw();

                this._col = v;
            }
        }

        useDefault() {
            return (this._width === 0 || this._col[3] === 0);
        }

        setupUniforms(operation) {
            super.setupUniforms(operation);
            let gl = this.gl;
            this._setUniform("color", new Float32Array(this._color), gl.uniform4fv);
        }

        enableAttribs() {
            super.enableAttribs();
            this.gl.enableVertexAttribArray(this._attrib("aCorner"));
        }

        disableAttribs() {
            super.disableAttribs();
            this.gl.disableVertexAttribArray(this._attrib("aCorner"));
        }

        setExtraAttribsInBuffer(operation) {
            let offset = operation.extraAttribsDataByteOffset / 4;
            let floats = operation.quads.floats;

            let length = operation.length;

            for (let i = 0; i < length; i++) {

                const viewCore = operation.getViewCore(i);

                // We are setting attributes such that if the value is < 0 or > 1, a border should be drawn.
                const ddw = this._width / viewCore.w;
                const dw = ddw / (1 - 2 * ddw);
                const ddh = this._width / viewCore.h;
                const dh = ddh / (1 - 2 * ddh);

                // Specify all corner points.
                floats[offset] = -dw;
                floats[offset + 1] = -dh;

                floats[offset + 2] = 1 + dw;
                floats[offset + 3] = -dh;

                floats[offset + 4] = 1 + dw;
                floats[offset + 5] = 1 + dh;

                floats[offset + 6] = -dw;
                floats[offset + 7] = 1 + dh;

                offset += 8;
            }
        }

        beforeDraw(operation) {
            let gl = this.gl;
            gl.vertexAttribPointer(this._attrib("aCorner"), 2, gl.FLOAT, false, 8, this.getVertexAttribPointerOffset(operation));
        }

        getExtraAttribBytesPerVertex() {
            return 8;
        }

    }

    OutlineShader.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    attribute vec4 aColor;
    attribute vec2 aCorner;
    uniform vec2 projection;
    varying vec2 vTextureCoord;
    varying vec2 vCorner;
    varying vec4 vColor;
    void main(void){
        gl_Position = vec4(aVertexPosition.x * projection.x - 1.0, aVertexPosition.y * -abs(projection.y) + 1.0, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
        vCorner = aCorner;
        vColor = aColor;
        gl_Position.y = -sign(projection.y) * gl_Position.y;
    }
`;

    OutlineShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    varying vec2 vCorner;
    uniform vec4 color;
    uniform sampler2D uSampler;
    void main(void){
        vec2 m = min(vCorner, 1.0 - vCorner);
        float value = step(0.0, min(m.x, m.y));
        gl_FragColor = mix(color, texture2D(uSampler, vTextureCoord) * vColor, value);
    }
`;

    /**
     * @see https://github.com/pixijs/pixi-filters/tree/master/filters/pixelate/src
     */
    class PixelateShader extends DefaultShader$1 {

        constructor(ctx) {
            super(ctx);

            this._size = new Float32Array([4, 4]);
        }

        get x() {
            return this._size[0];
        }

        set x(v) {
            this._size[0] = v;
            this.redraw();
        }

        get y() {
            return this._size[1];
        }

        set y(v) {
            this._size[1] = v;
            this.redraw();
        }

        get size() {
            return this._size[0];
        }

        set size(v) {
            this._size[0] = v;
            this._size[1] = v;
            this.redraw();
        }

        useDefault() {
            return ((this._size[0] === 0) && (this._size[1] === 0));
        }

        static getWebGLImpl() {
            return WebGLPixelateShaderImpl;
        }

        setupUniforms(operation) {
            super.setupUniforms(operation);
            let gl = this.gl;
            this._setUniform("size", new Float32Array(this._size), gl.uniform2fv);
        }

        getExtraAttribBytesPerVertex() {
            return 8;
        }

        enableAttribs() {
            super.enableAttribs();
            this.gl.enableVertexAttribArray(this._attrib("aTextureRes"));
        }

        disableAttribs() {
            super.disableAttribs();
            this.gl.disableVertexAttribArray(this._attrib("aTextureRes"));
        }

        setExtraAttribsInBuffer(operation) {
            let offset = operation.extraAttribsDataByteOffset / 4;
            let floats = operation.quads.floats;

            let length = operation.length;
            for (let i = 0; i < length; i++) {
                let w = operation.quads.getTextureWidth(operation.index + i);
                let h = operation.quads.getTextureHeight(operation.index + i);

                floats[offset] = w;
                floats[offset + 1] = h;
                floats[offset + 2] = w;
                floats[offset + 3] = h;
                floats[offset + 4] = w;
                floats[offset + 5] = h;
                floats[offset + 6] = w;
                floats[offset + 7] = h;

                offset += 8;
            }
        }

        beforeDraw(operation) {
            let gl = this.gl;
            gl.vertexAttribPointer(this._attrib("aTextureRes"), 2, gl.FLOAT, false, this.getExtraAttribBytesPerVertex(), this.getVertexAttribPointerOffset(operation));
        }
    }

    PixelateShader.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    attribute vec4 aColor;
    attribute vec2 aTextureRes;
    uniform vec2 projection;
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    varying vec2 vTextureRes;
    void main(void){
        gl_Position = vec4(aVertexPosition.x * projection.x - 1.0, aVertexPosition.y * -abs(projection.y) + 1.0, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
        vColor = aColor;
        vTextureRes = aTextureRes;
        gl_Position.y = -sign(projection.y) * gl_Position.y;
    }
`;

    PixelateShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    varying vec2 vTextureRes;

    uniform vec2 size;
    uniform sampler2D uSampler;
    
    vec2 mapCoord( vec2 coord )
    {
        coord *= vTextureRes.xy;
        return coord;
    }
    
    vec2 unmapCoord( vec2 coord )
    {
        coord /= vTextureRes.xy;
        return coord;
    }
    
    vec2 pixelate(vec2 coord, vec2 size)
    {
        return floor( coord / size ) * size;
    }
    
    void main(void)
    {
        vec2 coord = mapCoord(vTextureCoord);
        coord = pixelate(coord, size);
        coord = unmapCoord(coord);
        gl_FragColor = texture2D(uSampler, coord) * vColor;
    }
`;

    class RadialFilterShader extends DefaultShader$1 {
        constructor(context) {
            super(context);
            this._radius = 0;
            this._cutoff = 1;
        }

        set radius(v) {
            this._radius = v;
            this.redraw();
        }

        get radius() {
            return this._radius;
        }

        set cutoff(v) {
            this._cutoff = v;
            this.redraw();
        }

        get cutoff() {
            return this._cutoff;
        }
        
        useDefault() {
            return this._radius === 0;
        }

        setupUniforms(operation) {
            super.setupUniforms(operation);
            // We substract half a pixel to get a better cutoff effect.
            this._setUniform("radius", 2 * (this._radius - 0.5) / operation.getRenderWidth(), this.gl.uniform1f);
            this._setUniform("cutoff", 0.5 * operation.getRenderWidth() / this._cutoff, this.gl.uniform1f);
        }

    }

    RadialFilterShader.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    attribute vec4 aColor;
    uniform vec2 projection;
    varying vec2 pos;
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    void main(void){
        gl_Position = vec4(aVertexPosition.x * projection.x - 1.0, aVertexPosition.y * -abs(projection.y) + 1.0, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
        vColor = aColor;
        gl_Position.y = -sign(projection.y) * gl_Position.y;
        pos = gl_Position.xy;
    }
`;

    RadialFilterShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec2 pos;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    uniform float radius;
    uniform float cutoff;
    void main(void){
        vec4 color = texture2D(uSampler, vTextureCoord);
        float f = max(0.0, min(1.0, 1.0 - (length(pos) - radius) * cutoff));
        gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor * f;
    }
`;

    class RadialGradientShader extends DefaultShader$1 {
        
        constructor(context) {
            super(context);
            
            this._x = 0;
            this._y = 0;

            this.color = 0xFFFF0000;

            this._radiusX = 100;
            this._radiusY = 100;
        }

        set x(v) {
            this._x = v;
            this.redraw();
        }

        set y(v) {
            this._y = v;
            this.redraw();
        }

        set radiusX(v) {
            this._radiusX = v;
            this.redraw();
        }

        get radiusX() {
            return this._radiusX;
        }

        set radiusY(v) {
            this._radiusY = v;
            this.redraw();
        }

        get radiusY() {
            return this._radiusY;
        }

        set radius(v) {
            this.radiusX = v;
            this.radiusY = v;
        }

        get color() {
            return this._color;
        }

        set color(v) {
            if (this._color !== v) {
                const col = StageUtils.getRgbaComponentsNormalized(v);
                col[0] = col[0] * col[3];
                col[1] = col[1] * col[3];
                col[2] = col[2] * col[3];

                this._rawColor = new Float32Array(col);

                this.redraw();

                this._color = v;
            }
        }

        setupUniforms(operation) {
            super.setupUniforms(operation);
            // We substract half a pixel to get a better cutoff effect.
            const rtc = operation.getNormalRenderTextureCoords(this._x, this._y);
            this._setUniform("center", new Float32Array(rtc), this.gl.uniform2fv);

            this._setUniform("radius", 2 * this._radiusX / operation.getRenderWidth(), this.gl.uniform1f);


            // Radial gradient shader is expected to be used on a single view. That view's alpha is used.
            this._setUniform("alpha", operation.getViewCore(0).renderContext.alpha, this.gl.uniform1f);

            this._setUniform("color", this._rawColor, this.gl.uniform4fv);
            this._setUniform("aspectRatio", (this._radiusX/this._radiusY) * operation.getRenderHeight()/operation.getRenderWidth(), this.gl.uniform1f);
        }

    }

    RadialGradientShader.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    attribute vec4 aColor;
    uniform vec2 projection;
    uniform vec2 center;
    uniform float aspectRatio;
    varying vec2 pos;
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    void main(void){
        gl_Position = vec4(aVertexPosition.x * projection.x - 1.0, aVertexPosition.y * -abs(projection.y) + 1.0, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
        vColor = aColor;
        gl_Position.y = -sign(projection.y) * gl_Position.y;
        pos = gl_Position.xy - center;
        pos.y = pos.y * aspectRatio;
    }
`;

    RadialGradientShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    varying vec2 pos;
    uniform sampler2D uSampler;
    uniform float radius;
    uniform vec4 color;
    uniform float alpha;
    void main(void){
        float dist = length(pos);
        gl_FragColor = mix(color * alpha, texture2D(uSampler, vTextureCoord) * vColor, min(1.0, dist / radius));
    }
`;

    class Light3dShader extends DefaultShader$1 {

        constructor(ctx) {
            super(ctx);

            this._strength = 0.5;
            this._ambient = 0.5;
            this._fudge = 0.4;

            this._rx = 0;
            this._ry = 0;

            this._z = 0;
            this._pivotX = NaN;
            this._pivotY = NaN;
            this._pivotZ = 0;

            this._lightY = 0;
            this._lightZ = 0;
        }

        setupUniforms(operation) {
            super.setupUniforms(operation);

            let vr = operation.shaderOwner;
            let view = vr.view;

            let pivotX = isNaN(this._pivotX) ? view.pivotX * vr.w : this._pivotX;
            let pivotY = isNaN(this._pivotY) ? view.pivotY * vr.h : this._pivotY;
            let coords = vr.getRenderTextureCoords(pivotX, pivotY);

            // Counter normal rotation.

            let rz = -Math.atan2(vr._renderContext.tc, vr._renderContext.ta);

            let gl = this.gl;
            this._setUniform("pivot", new Float32Array([coords[0], coords[1], this._pivotZ]), gl.uniform3fv);
            this._setUniform("rot", new Float32Array([this._rx, this._ry, rz]), gl.uniform3fv);

            this._setUniform("z", this._z, gl.uniform1f);
            this._setUniform("lightY", this.lightY, gl.uniform1f);
            this._setUniform("lightZ", this.lightZ, gl.uniform1f);
            this._setUniform("strength", this._strength, gl.uniform1f);
            this._setUniform("ambient", this._ambient, gl.uniform1f);
            this._setUniform("fudge", this._fudge, gl.uniform1f);
        }

        set strength(v) {
            this._strength = v;
            this.redraw();
        }

        get strength() {
            return this._strength;
        }

        set ambient(v) {
            this._ambient = v;
            this.redraw();
        }

        get ambient() {
            return this._ambient;
        }

        set fudge(v) {
            this._fudge = v;
            this.redraw();
        }

        get fudge() {
            return this._fudge;
        }

        get rx() {
            return this._rx;
        }

        set rx(v) {
            this._rx = v;
            this.redraw();
        }

        get ry() {
            return this._ry;
        }

        set ry(v) {
            this._ry = v;
            this.redraw();
        }

        get z() {
            return this._z;
        }

        set z(v) {
            this._z = v;
            this.redraw();
        }

        get pivotX() {
            return this._pivotX;
        }

        set pivotX(v) {
            this._pivotX = v + 1;
            this.redraw();
        }

        get pivotY() {
            return this._pivotY;
        }

        set pivotY(v) {
            this._pivotY = v + 1;
            this.redraw();
        }

        get lightY() {
            return this._lightY;
        }

        set lightY(v) {
            this._lightY = v;
            this.redraw();
        }

        get pivotZ() {
            return this._pivotZ;
        }

        set pivotZ(v) {
            this._pivotZ = v;
            this.redraw();
        }

        get lightZ() {
            return this._lightZ;
        }

        set lightZ(v) {
            this._lightZ = v;
            this.redraw();
        }

        useDefault() {
            return (this._rx === 0 && this._ry === 0 && this._z === 0 && this._strength === 0 && this._ambient === 1);
        }

    }

    Light3dShader.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    attribute vec4 aColor;
    uniform vec2 projection;
    varying vec2 vTextureCoord;
    varying vec4 vColor;

    uniform float fudge;
    uniform float strength;
    uniform float ambient;
    uniform float z;
    uniform float lightY;
    uniform float lightZ;
    uniform vec3 pivot;
    uniform vec3 rot;
    varying vec3 pos;

    void main(void) {
        pos = vec3(aVertexPosition.xy, z);
        
        pos -= pivot;
        
        // Undo XY rotation
        mat2 iRotXy = mat2( cos(rot.z), sin(rot.z), 
                           -sin(rot.z), cos(rot.z));
        pos.xy = iRotXy * pos.xy;
        
        // Perform 3d rotations
        gl_Position.x = cos(rot.x) * pos.x - sin(rot.x) * pos.z;
        gl_Position.y = pos.y;
        gl_Position.z = sin(rot.x) * pos.x + cos(rot.x) * pos.z;
        
        pos.x = gl_Position.x;
        pos.y = cos(rot.y) * gl_Position.y - sin(rot.y) * gl_Position.z;
        pos.z = sin(rot.y) * gl_Position.y + cos(rot.y) * gl_Position.z;
        
        // Redo XY rotation
        iRotXy[0][1] = -iRotXy[0][1];
        iRotXy[1][0] = -iRotXy[1][0];
        pos.xy = iRotXy * pos.xy; 

        // Undo translate to pivot position
        pos.xyz += pivot;

        pos = vec3(pos.x * projection.x - 1.0, pos.y * -abs(projection.y) + 1.0, pos.z * projection.x);
        
        // Set depth perspective
        float perspective = 1.0 + fudge * pos.z;

        pos.z += lightZ * projection.x;

        // Map coords to gl coordinate space.
        // Set z to 0 because we don't want to perform z-clipping
        gl_Position = vec4(pos.xy, 0.0, perspective);

        // Correct light source position.
        pos.y += lightY * abs(projection.y);

        vTextureCoord = aTextureCoord;
        vColor = aColor;
        
        gl_Position.y = -sign(projection.y) * gl_Position.y;
    }
`;

    Light3dShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    varying vec3 pos;
    uniform sampler2D uSampler;
    uniform float ambient;
    uniform float strength;
    void main(void){
        vec4 rgba = texture2D(uSampler, vTextureCoord);
        float d = length(pos);
        float n = 1.0 / max(0.1, d);
        rgba.rgb = rgba.rgb * (strength * n + ambient);
        gl_FragColor = rgba * vColor;
    }
`;

    const lightning = {
        Application,
        Component,
        Base,
        Utils,
        StageUtils,
        View,
        Tools,
        Stage,
        ViewCore,
        ViewTexturizer,
        Texture,
        EventEmitter,
        shaders: {
            Grayscale: GrayscaleShader$1,
            BoxBlur: BoxBlurShader,
            Dithering: DitheringShader,
            CircularPush: CircularPushShader,
            Inversion: InversionShader,
            LinearBlur: LinearBlurShader,
            Outline: OutlineShader,
            Pixelate: PixelateShader,
            RadialFilter: RadialFilterShader,
            RadialGradient: RadialGradientShader,
            Light3d: Light3dShader,
            WebGLShader,
            WebGLDefaultShader: DefaultShader$1,
            C2dShader,
            C2dDefaultShader: DefaultShader$2,
            c2d: {
                Grayscale: GrayscaleShader,
                Blur: BlurShader
            }
        },
        textures: {
            RectangleTexture,
            NoiseTexture,
            TextTexture,
            ImageTexture,
            HtmlTexture,
            StaticTexture,
            StaticCanvasTexture,
            SourceTexture
        },
        components: {
            FastBlurComponent,
            BloomComponent,
            SmoothScaleComponent,
            BorderComponent,
            ListComponent: ListView
        },
        tools: {
            ObjMerger,
            ObjectListProxy,
            ObjectListWrapper
        }
    };

    return lightning;

}());
