import Utils from "../tree/Utils.mjs";

export default class MultiSpline {

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
            def = {0: def}
        }

        let defaultSmoothness = 0.5;

        let items = [];
        for (let key in def) {
            if (def.hasOwnProperty(key)) {
                let obj = def[key];
                if (!Utils.isObjectLiteral(obj)) {
                    obj = {v: obj}
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
