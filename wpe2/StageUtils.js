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

    static getRgbaString(color) {
        let r = ((color / 65536) | 0) % 256;
        let g = ((color / 256) | 0) % 256;
        let b = color % 256;
        let a = ((color / 16777216) | 0) / 255;
        return 'rgba(' + r + ',' + g + ',' + b + ',' + a.toFixed(4) + ')';
    };

    static getRgbaComponentsNormalized(argb) {
        let r = ((argb / 65536) | 0) % 256;
        let g = ((argb / 256) | 0) % 256;
        let b = argb % 256;
        let a = ((argb / 16777216) | 0);
        return [r * 0.003921569, g * 0.003921569, b * 0.003921569, a * 0.003921569];
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

        let r = r1 * p + r2 * (1 - p) | 0;
        let g = g1 * p + g2 * (1 - p) | 0;
        let b = b1 * p + b2 * (1 - p) | 0;
        let a = a1 * p + a2 * (1 - p) | 0;

        return a * 16777216 + r * 65536 + g * 256 + b;
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
        return ((a * t) | 0) * 16777216 + ((r * t) | 0) * 65536 + ((g * t) | 0) * 256 + ((b * t) | 0);
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
        return ((a * t) | 0) * 16777216 + ((r * t) | 0) * 65536 + ((g * t) | 0) * 256 + ((b * t) | 0);
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
            for (it = 0; it < 20; it++) {
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

    static getSplineValueFunction(v1, v2, p1, p2, o1, i2, s1, s2) {
        // Normalize slopes because we use a spline that goes from 0 to 1.
        let dp = p2 - p1;
        s1 *= dp;
        s2 *= dp;

        let helpers = StageUtils.getSplineHelpers(v1, v2, o1, i2, s1, s2);
        if (!helpers) {
            return function (p) {
                if (p == 0) return v1;
                if (p == 1) return v2;

                return v2 * p + v1 * (1 - p);
            };
        } else {
            return function (p) {
                if (p == 0) return v1;
                if (p == 1) return v2;
                return StageUtils.calculateSpline(helpers, p);
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

        let cv1 = StageUtils.getRgbaComponents(v1);
        let cv2 = StageUtils.getRgbaComponents(v2);

        let helpers = [
            StageUtils.getSplineHelpers(cv1[0], cv2[0], o1, i2, s1[0], s2[0]),
            StageUtils.getSplineHelpers(cv1[1], cv2[1], o1, i2, s1[1], s2[1]),
            StageUtils.getSplineHelpers(cv1[2], cv2[2], o1, i2, s1[2], s2[2]),
            StageUtils.getSplineHelpers(cv1[3], cv2[3], o1, i2, s1[3], s2[3])
        ];

        if (!helpers[0]) {
            return function (p) {
                // Linear.
                if (p == 0) return v1;
                if (p == 1) return v2;

                return StageUtils.mergeColors(v2, v1, p);
            };
        } else {
            return function (p) {
                if (p == 0) return v1;
                if (p == 1) return v2;

                return StageUtils.getArgbNumber([
                    Math.min(255, StageUtils.calculateSpline(helpers[0], p)),
                    Math.min(255, StageUtils.calculateSpline(helpers[1], p)),
                    Math.min(255, StageUtils.calculateSpline(helpers[2], p)),
                    Math.min(255, StageUtils.calculateSpline(helpers[3], p))
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

        // Helper letiables.
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

        if (xa == -2 && ya == -2 && xc == 0 && yc == 0) {
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
        for (it = 0; it < 20; it++) {
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
}
