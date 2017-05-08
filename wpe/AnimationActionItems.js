var isNode = !!(((typeof module !== "undefined") && module.exports));

if (isNode) {
    var Utils = require('./Utils');
}

var AnimationActionItems = function(animationAction) {
    this.animationAction = animationAction;
    this.clear();
};

AnimationActionItems.prototype.clear = function() {
    this.p = [];
    this.pe = [];
    this.idp = [];
    this.f = [];
    this.v = [];
    this.lv = [];
    this.sm = [];
    this.s = [];
    this.ve = [];
    this.sme = [];
    this.se = [];

    this.length = 0;
};

AnimationActionItems.prototype.push = function(item) {
    this.p.push(item.p || 0);
    this.pe.push(item.pe || 0);
    this.idp.push(item.idp || 0);
    this.f.push(item.f || false);
    this.v.push(item.hasOwnProperty('v') ? item.v : 0 /* v might be false or null */ );
    this.lv.push(item.lv || 0);
    this.sm.push(item.sm || 0);
    this.s.push(item.s || 0);
    this.ve.push(item.ve || 0);
    this.sme.push(item.sme || 0);
    this.se.push(item.se || 0);
    this.length++;
};

AnimationActionItems.prototype.parseDefinition = function(def) {
    var i, n;
    if (!Utils.isPlainObject(def)) {
        def = {0: def};
    }

    var items = [];
    for (var key in def) {
        if (def.hasOwnProperty(key)) {
            var obj = def[key];
            if (!Utils.isPlainObject(obj)) {
                obj = {v: obj};
            }

            var p = parseFloat(key);
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
        var last = (i == n - 1);
        if (!items[i].hasOwnProperty('pe')) {
            // Progress.
            items[i].pe = last ? (items[i].p <= 1 ? 1 : 2 /* support onetotwo stop */) : items[i + 1].p;
        } else {
            // Prevent multiple items at the same time.
            var max = i < n - 1 ? items[i + 1].p : 1;
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

    if (this.animationAction.mergeFunction) {
        var rgba = (this.animationAction.mergeFunction === StageUtils.mergeColors);

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
                    var pi = items[i - 1];
                    var ni = items[i + 1];
                    if (pi.p === ni.p) {
                        items[i].s = rgba ? [0, 0, 0, 0] : 0;
                    } else {
                        if (rgba) {
                            var nc = StageUtils.getRgbaComponents(ni.lv);
                            var pc = StageUtils.getRgbaComponents(pi.lv);
                            var d = 1 / (ni.p - pi.p);
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
                var last = (i === n - 1);
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
    }

    if (this.length) {
        this.clear();
    }

    for (i = 0, n = items.length; i < n; i++) {
        this.push(items[i]);
    }
};

AnimationActionItems.prototype.getCurrentItem = function() {
    var p = this.animationAction.animation.p;

    var n = this.length;
    if (!n) {
        return -1;
    }

    if (p < this.p[0]) {
        return -1;
    }

    for (var i = 0; i < n; i++) {
        if (this.p[i] <= p && p < this.pe[i]) {
            return i;
        }
    }

    return n - 1;
};

AnimationActionItems.prototype.getCurrentValue = function() {
    var p = this.animationAction.animation.p;

    var i = this.getCurrentItem();
    if (i == -1) {
        return undefined;
    } else {
        if (this.f[i]) {
            var o = (p - this.p[i]) * this.idp[i];
            return this.v[i](o);
        } else {
            return this.v[i];
        }
    }
};

if (isNode) {
    module.exports = AnimationActionItems;
    var StageUtils = require('./StageUtils');
}
