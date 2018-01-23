/**
 * Copyright Metrological, 2017
 */
class AnimationActionItems {
    
    constructor(action) {
        this._action = action;
        
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
    
    parse(def) {
        let i, n;
        if (!Utils.isObjectLiteral(def)) {
            def = {0: def};
        }

        let items = [];
        for (let key in def) {
            if (def.hasOwnProperty(key)) {
                let obj = def[key];
                if (!Utils.isObjectLiteral(obj)) {
                    obj = {v: obj};
                }

                let p = parseFloat(key);
                if (!isNaN(p) && p >= 0 && p <= 2) {
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
            let last = (i == n - 1);
            if (!items[i].hasOwnProperty('pe')) {
                // Progress.
                items[i].pe = last ? (items[i].p <= 1 ? 1 : 2 /* support onetotwo stop */) : items[i + 1].p;
            } else {
                // Prevent multiple items at the same time.
                let max = i < n - 1 ? items[i + 1].p : 1;
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
        let rgba = (this._action.hasColorProperty());

        // Calculate bezier helper values.
        for (i = 0; i < n; i++) {
            if (!items[i].hasOwnProperty('sm')) {
                // Smoothness.
                items[i].sm = 0.5;
            }
            if (!items[i].hasOwnProperty('s')) {
                // Slope.
                if (i === 0 || i === n - 1 || (items[i].p === 1 /* for onetotwo */)) {
                    // Horizontal slope at start and end.
                    items[i].s = rgba ? [0, 0, 0, 0] : 0;
                } else {
                    let pi = items[i - 1];
                    let ni = items[i + 1];
                    if (pi.p === ni.p) {
                        items[i].s = rgba ? [0, 0, 0, 0] : 0;
                    } else {
                        if (rgba) {
                            let nc = StageUtils.getRgbaComponents(ni.lv);
                            let pc = StageUtils.getRgbaComponents(pi.lv);
                            let d = 1 / (ni.p - pi.p);
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
            // Calculate value function.
            if (!items[i].f) {
                let last = (i === n - 1);
                if (!items[i].hasOwnProperty('sme')) {
                    items[i].sme = last ? 0.5 : items[i + 1].sm;
                }
                if (!items[i].hasOwnProperty('se')) {
                    items[i].se = last ? (rgba ? [0, 0, 0, 0] : 0) : items[i + 1].s;
                }
                if (!items[i].hasOwnProperty('ve')) {
                    items[i].ve = last ? items[i].lv : items[i + 1].lv;
                }

                // Generate spline.
                if (rgba) {
                    items[i].v = StageUtils.getSplineRgbaValueFunction(items[i].v, items[i].ve, items[i].p, items[i].pe, items[i].sm, items[i].sme, items[i].s, items[i].se);
                } else {
                    items[i].v = StageUtils.getSplineValueFunction(items[i].v, items[i].ve, items[i].p, items[i].pe, items[i].sm, items[i].sme, items[i].s, items[i].se);
                }

                items[i].f = true;
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
        let n = this._length;
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
        let i = this._getItem(p);
        if (i == -1) {
            return undefined;
        } else {
            if (this._f[i]) {
                let o = Math.min(1, Math.max(0, (p - this._p[i]) * this._idp[i]));
                return this._v[i](o);
            } else {
                return this._v[i];
            }
        }
    }

    get length() {
        return this._length;
    }

}

module.exports = AnimationActionItems;

let Utils = require('../core/Utils');
let StageUtils = require('../core/StageUtils');
