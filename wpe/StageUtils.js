var isNode = !!(((typeof module !== "undefined") && module.exports));

if (isNode) {
    var Utils = require('./Utils');
}

var StageUtils = {};

StageUtils.mergeNumbers = function(v1, v2, p) {
    return v1 * p + v2 * (1 - p);
};

StageUtils.rgb = function(r, g, b) {
    return (r << 16) + (g << 8) + b + (255 * 16777216);
};

StageUtils.rgba = function(r, g, b, a) {
    return (r << 16) + (g << 8) + b + (((a * 255)|0) * 16777216);
};

StageUtils.getRgbaString = function(color) {
    var r = ((color / 65536)|0) % 256;
    var g = ((color / 256)|0) % 256;
    var b = color % 256;
    var a = ((color / 16777216)|0) / 255;
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a.toFixed(4) + ')';
};

StageUtils.getRgbaComponents = function(color) {
    var r = ((color / 65536)|0) % 256;
    var g = ((color / 256)|0) % 256;
    var b = color % 256;
    var a = ((color / 16777216)|0);
    return [r/255.0, g/255.0, b/255.0, a/255.0];
};

StageUtils.mergeColors = function(c1, c2, p) {
    var r1 = ((c1 / 65536)|0) % 256;
    var g1 = ((c1 / 256)|0) % 256;
    var b1 = c1 % 256;
    var a1 = ((c1 / 16777216)|0);

    var r2 = ((c2 / 65536)|0) % 256;
    var g2 = ((c2 / 256)|0) % 256;
    var b2 = c2 % 256;
    var a2 = ((c2 / 16777216)|0);

    var r = r1 * p + r2 * (1-p) | 0;
    var g = g1 * p + g2 * (1-p) | 0;
    var b = b1 * p + b2 * (1-p) | 0;
    var a = a1 * p + a2 * (1-p) | 0;

    return a * 16777216 + r * 65536 + g * 256 + b;
};

StageUtils.mergeMultiColors = function(c, p) {
    var r = 0, g = 0, b = 0, a = 0, t = 0;
    var n = c.length;
    for (var i = 0; i < n; i++) {
        var r1 = ((c[i] / 65536)|0) % 256;
        var g1 = ((c[i] / 256)|0) % 256;
        var b1 = c[i] % 256;
        var a1 = ((c[i] / 16777216)|0);
        r += r1 * p[i];
        g += g1 * p[i];
        b += b1 * p[i];
        a += a1 * p[i];
        t += p[i];
    }

    t = 1/t;
    return ((a*t)|0) * 16777216 + ((r*t)|0) * 65536 + ((g*t)|0) * 256 + ((b*t)|0);
};

StageUtils.mergeMultiColorsEqual = function(c) {
    var r = 0, g = 0, b = 0, a = 0, t = 0;
    var n = c.length;
    for (var i = 0; i < n; i++) {
        var r1 = ((c[i] / 65536)|0) % 256;
        var g1 = ((c[i] / 256)|0) % 256;
        var b1 = c[i] % 256;
        var a1 = ((c[i] / 16777216)|0);
        r += r1;
        g += g1;
        b += b1;
        a += a1;
        t += 1.0;
    }

    t = 1/t;
    return ((a*t)|0) * 16777216 + ((r*t)|0) * 65536 + ((g*t)|0) * 256 + ((b*t)|0);
};

StageUtils.rad = function(deg) {
    return deg * (Math.PI / 180);
};

StageUtils.tlFade = function(v1, v2, a) {
    return v1 * (1 - a) + v2 * a;
};

StageUtils.tlAdd = function(v1, v2, a) {
    return v1 + v2 * a;
};

StageUtils.tlMul = function(v1, v2, a) {
    return v1 * ((1 - a) + v2 * a);
};

StageUtils.tlCol = function(v1, v2, a) {
    return Utils.mergeColors(v1, v2, (1 - a));
};

StageUtils.getTimingBezier = function(a, b, c, d) {
    var xc = 3.0 * a;
    var xb = 3.0 * (c - a) - xc;
    var xa = 1.0 - xc - xb;
    var yc = 3.0 * b;
    var yb = 3.0 * (d - b) - yc;
    var ya = 1.0 - yc - yb;

    return function(time) {
        if (time >= 1.0) {
            return 1;
        }
        if (time <= 0) {
            return 0;
        }

        var t = 0.5, cbx, cbxd, dx;

        for (var it = 0; it < 20; it++) {
            cbx = t*(t*(t*xa+xb)+xc);
            dx = time - cbx;
            if (dx > -1e-8 && dx < 1e-8) {
                return t*(t*(t*ya+yb)+yc);
            }

            // Cubic bezier derivative.
            cbxd = t*(t*(3*xa)+2*xb)+xc;

            if (cbxd > 1e-10 && cbxd < 1e-10) {
                // Problematic. Fall back to binary search method.
                break;
            }

            t += dx / cbxd;
        }

        // Fallback: binary search method. This is more reliable when there are near-0 slopes.
        var minT = 0;
        var maxT = 1;
        for (it = 0; it < 20; it++) {
            t = 0.5 * (minT + maxT);

            cbx = t*(t*(t*xa+xb)+xc);

            dx = time - cbx;
            if (dx > -1e-8 && dx < 1e-8) {
                // Solution found!
                return t*(t*(t*ya+yb)+yc);
            }

            if (dx < 0) {
                maxT = t;
            } else {
                minT = t;
            }
        }

    };
};

// Timing functions.
StageUtils.TIMING = {
    LINEAR: function(time) {return time;},
    EASE: StageUtils.getTimingBezier(0.25,0.1,0.25,1.0),
    EASE_IN: StageUtils.getTimingBezier(0.42,0,1.0,1.0),
    EASE_IN_OUT: StageUtils.getTimingBezier(0.42,0,0.58,1.0),
    EASE_OUT: StageUtils.getTimingBezier(0,0,0.58,1.0),
    STEP_START: function() {return 1;},
    STEP_END: function(time) {return time === 1 ? 1 : 0;},
    BEZIER: function (a,b,c,d) {return StageUtils.getTimingBezier(a,b,c,d);}
};

// Value functions.
StageUtils.VALUE = {
    VALUE: function(elements) {
        return StageUtils.getDiscreteValueFunction(elements);
    },
    SMOOTH: function (elements) {
        return StageUtils.getSmoothValueFunction(elements);
    },
    SMOOTHCOLOR: function (elements) {
        return StageUtils.getSmoothColorValueFunction(elements);
    }
};

/**
 * Smooth value function for colors.
 */
StageUtils.getSmoothColorValueFunction = function(keyframes) {
    var i, n = keyframes.length;
    var alphaKeyframes = [];
    var redKeyframes = [];
    var greenKeyframes = [];
    var blueKeyframes = [];
    for (i = 0; i < n; i++) {
        var k = keyframes[i];
        var alpha = ((k.v & 0xFF000000) >>> 24);
        var red = (k.v & 0x00FF0000) >> 16;
        var green = (k.v & 0x0000FF00) >> 8;
        var blue = k.v & 0x000000FF;

        k = Utils.cloneObj(k);
        k.v = alpha;
        alphaKeyframes.push(k);

        k = Utils.cloneObj(k);
        k.v = red;
        redKeyframes.push(k);

        k = Utils.cloneObj(k);
        k.v = green;
        greenKeyframes.push(k);

        k = Utils.cloneObj(k);
        k.v = blue;
        blueKeyframes.push(k);
    }

    var alphaFunction = StageUtils.getSmoothValueFunction(alphaKeyframes);
    var redFunction = StageUtils.getSmoothValueFunction(redKeyframes);
    var greenFunction = StageUtils.getSmoothValueFunction(greenKeyframes);
    var blueFunction = StageUtils.getSmoothValueFunction(blueKeyframes);

    return function(p) {
        var alpha = Math.min(Math.max(alphaFunction(p), 0), 255);
        var red = Math.min(Math.max(redFunction(p), 0), 255);
        var green = Math.min(Math.max(greenFunction(p), 0), 255);
        var blue = Math.min(Math.max(blueFunction(p), 0), 255);
        var v = ((alpha|0) << 24) + ((red|0) << 16) + ((green|0) << 8) + (blue|0);
        if (v < 0) {
            v = 0xFFFFFFFF + v + 1;
        }

        return v;
    };

};

/**
 * Returns a function which returns a discrete value during time.
 * @param {{t:number, v:number}[]} keyframes
 */
StageUtils.getDiscreteValueFunction = function(keyframes) {
    // Split keyframes into different arrays.
    var values = [];
    var times = [];

    var i, n = keyframes.length;
    var lastT = -1;

    for (i = 0; i < n; i++) {
        var k = keyframes[i];
        if (k.t <= lastT) {
            throw new Error('The keyframe timings should increase.');
        }
        lastT = k.t;

        times.push(k.t);
        values.push(k.v);
    }

    return function(p) {
        for (i = 0; i < n; i++) {
            if (times[i] > p) {
                break;
            }
        }

        if (i == 0) {
            // Before first offset.
            return values[i];
        }

        if (i == n) {
            // After last offset.
            return values[n - 1];
        }

        // Get correct spline index.
        i = i - 1;

        return values[i];
    }

};

/**
 * Returns a smoothened linear interpolation function based on a cubic bezier.
 * @param {{t:number, v:number, [i]:number, [o]:number, [s]:number}[]} keyframes
 *   t is the time of the keyframe. 0 = start of animation, 1 = end of animation.
 *   v is the value at the keyframe point.
 *   i is the 'incoming smoothness'. 0 = linear, 1 = as smooth as possible.
 *   o is the 'outgoing smoothness'. 0 = linear, 1 = as smooth as possible.
 *   s is the 'slope' for the bezier curve at the specified point.
 * @return {Function}
 *   Linear value function.
 */
StageUtils.getSmoothValueFunction = function(keyframes) {
    // Split keyframes into different arrays.
    var values = [];
    var times = [];
    var incomingSmoothness = [];
    var outgoingSmoothness = [];

    var i, n = keyframes.length;
    var lastT = -1;

    for (i = 0; i < n; i++) {
        var k = keyframes[i];
        if (k.t <= lastT) {
            throw new Error('The keyframe timings should increase.');
        }
        lastT = k.t;

        times.push(k.t);
        values.push(k.v);
        incomingSmoothness.push(k.i === undefined ? 0.5 : k.i);
        outgoingSmoothness.push(k.o === undefined ? 0.5 : k.o);
    }

    // Calculate vertex spline slopes.
    var slopes = [];
    for (i = 0; i < n; i++) {
        // Find smoothness slope.
        var s;

        if (Utils.isNumber(keyframes[i].s)) {
            // User-defined slope.
            s = keyframes[i].s;
        } else if (i == 0 || i == n - 1) {
            // Start and end value 'smooth to 0'.
            s = 0;
        } else {
            // We use the slope between the next and previous point because the result feels the most 'natural'.
            s = (values[i+1] - values[i-1]) / (times[i+1] - times[i-1]);
        }
        slopes.push(s);
    }

    // Calculate spline helper valeus.
    var xa = [], xb = [], xc = [], xd = [];
    var ya = [], yb = [], yc = [], yd = [];
    var dxa = [], dxb = [], dxc = [];
    for (i = 0; i < n - 1; i++) {
        // Calculate control points for start and end.
        var td = (times[i+1]-times[i]);
        var csx = times[i] + outgoingSmoothness[i] * td;
        var csy = values[i] + slopes[i] * (outgoingSmoothness[i] * td);

        var cex = times[i+1] - incomingSmoothness[i+1] * td;
        var cey = values[i+1] - slopes[i+1] * (incomingSmoothness[i+1] * td);

        xa[i] = -times[i] + 3 * csx - 3 * cex + times[i+1];
        xb[i] = 3*times[i] - 6 * csx + 3 * cex;
        xc[i] = -3*times[i] + 3 * csx;
        xd[i] = times[i];

        ya[i] = -values[i] + 3 * csy - 3 * cey + values[i+1];
        yb[i] = 3*values[i] - 6 * csy + 3 * cey;
        yc[i] = -3*values[i] + 3 * csy;
        yd[i] = values[i];

        // Derivative.
        dxa[i] = 3*xa[i];
        dxb[i] = 2*xb[i];
        dxc[i] = 1*xc[i];
    }

    return function(p) {
        for (i = 0; i < n; i++) {
            if (times[i] == p) {
                return values[i];
            }
            if (times[i] > p) {
                break;
            }
        }

        if (i == 0) {
            // Before first offset.
            return values[i];
        }

        if (i == n) {
            // After last offset.
            return values[n - 1];
        }

        // Get correct spline index.
        i = i - 1;

        // Find t for p.

        var t = 0.5, cbx, cbxd, dx;

        for (var it = 0; it < 20; it++) {
            // Cubic bezier function: f(t)=t*(t*(t*a+b)+c)+d.
            cbx = t*(t*(t*xa[i]+xb[i])+xc[i])+xd[i];

            dx = p - cbx;
            if (dx > -1e-8 && dx < 1e-8) {
                // Solution found!
                return t*(t*(t*ya[i]+yb[i])+yc[i])+yd[i];
            }

            // Cubic bezier derivative function: f'(t)=t*(t*(3*a)+2*b)+c
            cbxd = t*(t*(3*xa[i])+2*xb[i])+xc[i];

            if (cbxd > 1e-10 && cbxd < 1e-10) {
                // Problematic. Fall back to binary search method.
                break;
            }

            t += dx / cbxd;
        }

        // Fallback: binary search method. This is more reliable when there are near-0 slopes.
        var minT = times[i];
        var maxT = times[i+1];
        for (it = 0; it < 20; it++) {
            t = 0.5 * (minT + maxT);

            // Cubic bezier function: f(t)=t*(t*(t*a+b)+c)+d.
            cbx = t*(t*(t*xa[i]+xb[i])+xc[i])+xd[i];

            dx = p - cbx;
            if (dx > -1e-8 && dx < 1e-8) {
                // Solution found!
                return t*(t*(t*ya[i]+yb[i])+yc[i])+yd[i];
            }

            if (dx < 0) {
                maxT = t;
            } else {
                minT = t;
            }
        }

        return t;
    }
};

StageUtils.getRoundRect = function(stage, w, h, radius, strokeWidth, strokeColor, fill, fillColor) {
    if (fill === undefined) fill = true;
    if (strokeWidth === undefined) strokeWidth = 0;

    var canvas = stage.adapter.getDrawingCanvas();
    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;

    var id = 'rect' + [w, h, radius, strokeWidth, strokeColor, fill ? 1 : 0, fillColor].join(",");
    return stage.getTexture(function(cb) {
        canvas.width = w + strokeWidth + 2;
        canvas.height = h + strokeWidth + 2;

        ctx.beginPath();
        var x = 0.5 * strokeWidth + 1, y = 0.5 * strokeWidth + 1;
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.arcTo(x + w, y, x + w, y + radius, radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
        ctx.lineTo(x + radius, y + h);
        ctx.arcTo(x, y + h, x, y + h - radius, radius);
        ctx.lineTo(x, y + radius);
        ctx.arcTo(x, y, x + radius, y, radius);

        if (fill) {
            if (Utils.isNumber(fillColor)) {
                fillColor = "#" + fillColor.toString(16);
            }
            ctx.fillStyle = fillColor || "white";
            ctx.fill();
        }

        if (strokeWidth) {
            if (Utils.isNumber(strokeColor)) {
                strokeColor = "#" + strokeColor.toString(16);
            }
            ctx.strokeStyle = strokeColor || "white";
            ctx.lineWidth = strokeWidth;
            ctx.stroke();
        }

        cb(canvas, {});
    }, {id: id});
};

if (isNode) {
    module.exports = StageUtils;
}