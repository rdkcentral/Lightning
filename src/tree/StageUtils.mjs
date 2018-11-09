export default class StageUtils {

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