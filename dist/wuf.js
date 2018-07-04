window.wuf = (function() {
/**
 * This is a partial (and more efficient) implementation of the event emitter.
 * It attempts to maintain a one-to-one mapping between events and listeners, skipping an array lookup.
 * Only if there are multiple listeners, they are combined in an array.
 *
 * Copyright Metrological, 2017
 */
class EventEmitter {

    constructor() {
        // This is set (and kept) to true when events are used at all.
        this._hasEventListeners = false
    }

    on(name, listener) {
        if (!this._hasEventListeners) {
            this._eventFunction = {}
            this._eventListeners = {}
            this._hasEventListeners = true
        }

        const current = this._eventFunction[name]
        if (!current) {
            this._eventFunction[name] = listener
        } else {
            if (this._eventFunction[name] !== EventEmitter.combiner) {
                this._eventListeners[name] = [this._eventFunction[name], listener]
                this._eventFunction[name] = EventEmitter.combiner
            } else {
                this._eventListeners[name].push(listener)
            }
        }
    }

    has(name, listener) {
        if (this._hasEventListeners) {
            const current = this._eventFunction[name]
            if (current) {
                if (current === EventEmitter.combiner) {
                    const listeners = this._eventListeners[name]
                    let index = listeners.indexOf(listener)
                    return (index >= 0)
                } else if (this._eventFunction[name] === listener) {
                    return true
                }
            }
        }
        return false;
    }

    off(name, listener) {
        if (this._hasEventListeners) {
            const current = this._eventFunction[name]
            if (current) {
                if (current === EventEmitter.combiner) {
                    const listeners = this._eventListeners[name]
                    let index = listeners.indexOf(listener)
                    if (index >= 0) {
                        listeners.splice(index, 1)
                    }
                    if (listeners.length === 1) {
                        this._eventFunction[name] = listeners[0]
                        this._eventListeners[name] = undefined
                    }
                } else if (this._eventFunction[name] === listener) {
                    this._eventFunction[name] = undefined
                }
            }
        }
    }

    removeListener(name, listener) {
        this.off(name, listener)
    }

    emit(name, arg1, arg2, arg3) {
        if (this._hasEventListeners) {
            const func = this._eventFunction[name]
            if (func) {
                if (func === EventEmitter.combiner) {
                    func(this, name, arg1, arg2, arg3)
                } else {
                    func(arg1, arg2, arg3)
                }
            }
        }
    }

    listenerCount(name) {
        if (this._hasEventListeners) {
            const func = this._eventFunction[name]
            if (func) {
                if (func === EventEmitter.combiner) {
                    return this._eventListeners[name].length
                } else {
                    return 1
                }
            }
        } else {
            return 0
        }
    }

}

EventEmitter.combiner = function(object, name, arg1, arg2, arg3) {
    const listeners = object._eventListeners[name]
    if (listeners) {
        // Because listener may detach itself while being invoked, we use a forEach instead of for loop.
        listeners.forEach((listener) => {
            listener(arg1, arg2, arg3)
        })
    }
}

EventEmitter.addAsMixin = function(cls) {
    cls.prototype.on = EventEmitter.prototype.on
    cls.prototype.has = EventEmitter.prototype.has
    cls.prototype.off = EventEmitter.prototype.off
    cls.prototype.removeListener = EventEmitter.prototype.removeListener
    cls.prototype.emit = EventEmitter.prototype.emit
    cls.prototype.listenerCount = EventEmitter.prototype.listenerCount
}



/**
 * Platform-specific functionality.
 * Copyright Metrological, 2017
 */
class WebAdapter {

    init(stage) {
        this.stage = stage;
        this.canvas = null;
        this._looping = false;
        this._awaitingLoop = false;
        if (window.imageparser) {
            this.wpeImageParser = new WpeImageParser();
        } else {
            this.wpeImageParser = null;
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
        }
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
        let cancelCb = undefined
        let isPng = (src.indexOf(".png") >= 0)
        if (this.wpeImageParser) {
            // WPE-specific image parser.
            var oReq = this.wpeImageParser.add(src, function(err, width, height, memory, offset, length) {
                if (err) return cb(err);

                var options = {
                    source: new Uint8Array(memory, offset, length),
                    w: width,
                    h: height,
                    premultiplyAlpha: false,
                    flipBlueRed: false,
                    hasAlpha: true
                };
                cb(null, options);
            });
            cancelCb = function() {
                oReq.abort();
            }
        } else if (window.OffthreadImage && OffthreadImage.available) {
            // For offthread support: simply include https://github.com/GoogleChrome/offthread-image/blob/master/dist/offthread-img.js
            // Possible optimisation: do not paint on canvas, but directly pass ImageData to texImage2d.
            let element = document.createElement('DIV');
            element.setAttribute('alt', '.');
            let image = new OffthreadImage(element);
            element.addEventListener('painted', function () {
                let canvas = element.childNodes[0];
                // Because a canvas stores all in RGBA alpha-premultiplied, GPU upload is fastest with those settings.
                cb(null, {
                    source: canvas,
                    renderInfo: {src},
                    hasAlpha: true,
                    premultiplyAlpha: true
                });
            });
            image.src = src;

            cancelCb = function() {
                image.removeAttribute('src');
            }
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
                image.removeAttribute('src');
            }
        }

        return cancelCb
    }

    createWebGLContext(w, h) {
        let canvas = this.stage.getOption('canvas') || document.createElement('canvas');

        canvas.width = w;
        canvas.height = h;

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

        this.canvas = canvas;

        return gl;
    }

    getWebGLCanvas() {
        return this.canvas;
    }

    getHrTime() {
        return window.performance ? window.performance.now() : (new Date()).getTime();
    }

    getDrawingCanvas() {
        // We can't reuse this canvas because textures may load async.
        return document.createElement('canvas');
    }

    getTextureOptionsForDrawingCanvas(canvas) {
        let options = {}
        options.source = canvas
        return options
    }

    nextFrame(changes) {
        /* WebGL blits automatically */
    }

    registerKeyHandler(keyhandler) {
        window.addEventListener('keydown', e => {
            keyhandler({keyCode: e.keyCode})
        })
    }

}



class WpeImageParser {
    constructor(memory = 16777216) {
        this.memory = new ArrayBuffer(memory);

        this.init();
    }

    init() {
        this.pending = {};
        this.pendingCount = 0;
        this.session = imageparser.Init(this.memory);
        console.log('SESSION: ' + this.session);
        this.oReqs = new Set();

        this.start();
    }

    start() {
        if (this.pendingCount && !this.timeout) {
            this.timeout = setTimeout(() => {
                this.timeout = 0;
                this.process();
                this.start();
            }, 50)
        }
    }

    cleanup() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }

        this.oReqs.forEach(function(oReq) {
            oReq.abort();
        });

        imageparser.Cleanup(this.session);

        this.oReqs = null;
        this.session = null;
        this.pending = null;
        this.pendingCount = 0;
    }

    process() {
        imageparser.ProcessResults(this.session, (id, error, width, height, offset) => {
            this.pendingCount--;
            this.pending[id].cb(error, width, height, this.memory, offset, width * height * 4);
            this.pending[id] = null;
        })
    }

    add(url, cb) {
        var oReq = new XMLHttpRequest();
        oReq.open("GET", url, true);
        oReq.responseType = "arraybuffer";

        oReq.onload = oEvent => {
            this.oReqs.delete(oReq);
            var buffer = oReq.response;

            var contentTypeHeader = oReq.getResponseHeader('content-type');
            var contentType = -1;
            if (contentTypeHeader == "image/jpeg" || contentTypeHeader == "image/jpg") {
                contentType = 0;
            } else if (contentTypeHeader == "image/png") {
                contentType = 1;
            }

            if (contentType >= 0) {
                var id = imageparser.Add(this.session, contentType, buffer);
                this.pending[id] = {buffer: buffer, cb: cb}
                this.pendingCount++;

                this.start();
            } else {
                cb("Unsupported content type: " + contentTypeHeader);
            }
        };

        this.oReqs.add(oReq);

        oReq.onerror = oEvent => {
            this.oReqs.delete(oReq);
            cb(oEvent);
        };

        oReq.send(null);

        // By calling oReq.abort, the image parsing can be aborted.
        return oReq;
    }
}

/**
 * Copyright Metrological, 2017
 */
class Base {

    static defaultSetter(obj, name, value) {
        obj[name] = value
    }

    static patchObject(obj, settings) {
        if (!Utils.isObjectLiteral(settings)) {
            console.error("Settings must be object literal")
        } else {
            let names = Object.keys(settings)
            for (let i = 0, n = names.length; i < n; i++) {
                let name = names[i]

                this.patchObjectProperty(obj, name, settings[name])
            }
        }
    }

    static patchObjectProperty(obj, name, value) {
        let setter = obj.setSetting || Base.defaultSetter;

        if (name.substr(0, 1) === "_" && name !== "__create") {
            // Disallow patching private variables.
            console.error("Patch of private property '" + name + "' is not allowed")
        } else if (name !== "type") {
            // Type is a reserved keyword to specify the class type on creation.
            if (Utils.isFunction(value) && value.__local) {
                // Local function (Base.local(s => s.something))
                value = value.__local(obj)
            }

            setter(obj, name, value)
        }
    }

    static local(func) {
        // This function can be used as an object setting, which is called with the target object.
        func.__local = true
    }

}


/**
 * Copyright Metrological, 2017
 */
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
        return typeof value == 'string';
    }

    static clone(v) {
        if (Utils.isObjectLiteral(v)) {
            return Utils.getDeepClone(v)
        } else {
            // Copy by value.
            return v
        }
    }

    static cloneObjShallow(obj) {
        let keys = Object.keys(obj);
        let clone = {}
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
        return Utils.getModuloIndex(index, arr.length);
    }

    static getModuloIndex(index, len) {
        if (len == 0) return index;
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
            c = {}
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
        if ((typeof v1) !== (typeof v2)) return false
        if (Utils.isObjectLiteral(v1)) {
            return Utils.isObjectLiteral(v2) && Utils.equalObjectLiterals(v1, v2)
        } else if (Array.isArray(v1)) {
            return Array.isArray(v2) && Utils.equalArrays(v1, v2)
        } else {
            return v1 === v2
        }
    }

    static equalObjectLiterals(obj1, obj2) {
        let keys1 = Object.keys(obj1)
        let keys2 = Object.keys(obj2)
        if (keys1.length !== keys2.length) {
            return false
        }

        for (let i = 0, n = keys1.length; i < n; i++) {
            const k1 = keys1[i]
            const k2 = keys2[i]
            if (k1 !== k2) {
                return false
            }

            const v1 = obj1[k1]
            const v2 = obj2[k2]

            if (!Utils.equalValues(v1, v2)) {
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
        return charcode >= 65 && charcode <= 90
    }
}

Utils.isNode = (typeof window === "undefined");

/**
 * Copyright Metrological, 2017
 */
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
}


/**
 * Application render tree.
 * Copyright Metrological, 2017
 */



class Stage extends EventEmitter {

    constructor(options = {}) {
        super()
        this._setOptions(options);

        this.adapter = new WebAdapter();

        if (this.adapter.init) {
            this.adapter.init(this);
        }

        this.gl = this.adapter.createWebGLContext(this.getOption('w'), this.getOption('h'));

        this.setGlClearColor(this._options.glClearColor);

        this.frameCounter = 0;

        this.transitions = new TransitionManager(this);
        this.animations = new AnimationManager(this);

        this.textureManager = new TextureManager(this);

        this.ctx = new CoreContext(this);

        this._destroyed = false;

        this.startTime = 0;
        this.currentTime = 0;
        this.dt = 0;

        // Preload rectangle texture, so that we can skip some border checks for loading textures.
        this.rectangleTexture = new RectangleTexture(this)
        this.rectangleTexture.load();

        // Never clean up because we use it all the time.
        this.rectangleTexture.source.permanent = true

        this._updateSourceTextures = new Set()
    }

    getOption(name) {
        return this._options[name]
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
        }

        opt('w', 1280);
        opt('h', 720);
        opt('canvas', this._options.canvas);
        opt('srcBasePath', null);
        opt('textureMemory', 18e6);
        opt('renderTextureMemory', 12e6);
        opt('bufferMemory', 8e6);
        opt('textRenderIssueMargin', 0);
        opt('glClearColor', [0, 0, 0, 0]);
        opt('defaultFontFace', 'Sans-Serif');
        opt('fixedDt', 0);
        opt('useTextureAtlas', false);
        opt('debugTextureAtlas', false);
        opt('precision', 1);
    }
    
    setApplication(app) {
        this.application = app
    }

    init() {
        this.application.setAsRoot();
        this.adapter.startLoop()
    }

    destroy() {
        this.adapter.stopLoop();
        this.ctx.destroy();
        this.textureManager.destroy();
        this._destroyed = true;
    }

    stop() {
        this.adapter.stopLoop();
    }

    resume() {
        if (this._destroyed) {
            throw new Error("Already destroyed")
        }
        this.adapter.startLoop();
    }

    get root() {
        return this.application
    }

    getCanvas() {
        return this.adapter.getWebGLCanvas()
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
            texture._performUpdateSource()
        } else {
            this._updateSourceTextures.add(texture)
        }
    }

    removeUpdateSourceTexture(texture) {
        if (this._updateSourceTextures) {
            this._updateSourceTextures.delete(texture)
        }
    }

    drawFrame() {
        if (this._options.fixedDt) {
            this.dt = this._options.fixedDt;
        } else {
            this.dt = (!this.startTime) ? .02 : .001 * (this.currentTime - this.startTime);
        }
        this.startTime = this.currentTime;
        this.currentTime = (new Date()).getTime();

        this.emit('frameStart');

        if (this.textureManager.isFull()) {
            this.textureManager.freeUnusedTextureSources();
        }

        if (this._updateSourceTextures.size) {
            this._updateSourceTextures.forEach(texture => {
                texture._performUpdateSource()
            })
            this._updateSourceTextures = new Set()
        }

        this.emit('update');

        const changes = this.ctx.hasRenderUpdates()

        if (changes) {
            this._updatingFrame = true
            this.ctx.frame();
            this._updatingFrame = false
        }

        this.adapter.nextFrame(changes);

        this.emit('frameEnd');

        this.frameCounter++;
    }

    renderFrame() {
        this.ctx.frame()
    }

    forceRenderUpdate() {
        // Enfore re-rendering.
        if (this.root) {
            this.root.core._parent._hasRenderUpdates = true
        }
    }

    setGlClearColor(clearColor) {
        this.forceRenderUpdate()
        if (Array.isArray(clearColor)) {
            this._options.glClearColor = clearColor;
        } else {
            this._options.glClearColor = StageUtils.getRgbaComponentsNormalized(clearColor);
        }
    }

    createView() {
        return new View(this);
    }

    view(settings) {
        if (settings.isView) return settings;

        let view;
        if (settings.type) {
            view = new settings.type(this);
        } else {
            view = new View(this);
        }

        view.patch(settings, true)

        return view;
    }

    c(settings) {
        return this.view(settings);
    }

    get w() {
        return this._options.w
    }

    get h() {
        return this._options.h
    }

    get rw() {
        return this.w / this._options.precision
    }

    get rh() {
        return this.h / this._options.precision
    }

    gcTextureMemory(aggressive = false) {
        console.log("GC texture memory" + (aggressive ? " (aggressive)" : ""))
        if (aggressive && this.ctx.root.visible) {
            // Make sure that ALL textures are cleaned
            this.ctx.root.visible = false
            this.textureManager.freeUnusedTextureSources()
            this.ctx.root.visible = true
        } else {
            this.textureManager.freeUnusedTextureSources()
        }
    }

    gcRenderTextureMemory(aggressive = false) {
        console.log("GC texture render memory" + (aggressive ? " (aggressive)" : ""))
        if (aggressive && this.root.visible) {
            // Make sure that ALL render textures are cleaned
            this.root.visible = false
            this.ctx.freeUnusedRenderTextures(0)
            this.root.visible = true
        } else {
            this.ctx.freeUnusedRenderTextures(0)
        }
    }

    getDrawingCanvas() {
        return this.adapter.getDrawingCanvas()
    }

}



/**
 * Base functionality for shader setup/destroy.
 * Copyright Metrological, 2017
 */
class ShaderProgram {

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
            let idx = 0
            console.log("========== source ==========\n" + src.split("\n").map(line => "" + (++idx) + ": " + line).join("\n"))
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
                if (v1[i] !== v2[i]) return false
            }
            return true
        } else {
            return (v1 === v2)
        }
    }

    _valueClone(v) {
        if (v.length) {
            return v.slice(0)
        } else {
            return v
        }
    }

    setUniformValue(name, value, glFunction) {
        let v = this._currentUniformValues[name];
        if (v === undefined || !this._valueEquals(v, value)) {
            let clonedValue = this._valueClone(value)
            this._currentUniformValues[name] = clonedValue

            let loc = this.getUniformLocation(name)
            if (loc) {
                let isMatrix = (glFunction === this.gl.uniformMatrix2fv || glFunction === this.gl.uniformMatrix3fv || glFunction === this.gl.uniformMatrix4fv)
                if (isMatrix) {
                    glFunction.call(this.gl, loc, false, clonedValue)
                } else {
                    glFunction.call(this.gl, loc, clonedValue)
                }
            }
        }
    }

}

/**
 * Copyright Metrological, 2017
 */


class ShaderBase {

    constructor(coreContext) {
        this._program = coreContext.shaderPrograms.get(this.constructor);
        if (!this._program) {
            this._program = new ShaderProgram(this.constructor.vertexShaderSource, this.constructor.fragmentShaderSource);

            // Let the vbo context perform garbage collection.
            coreContext.shaderPrograms.set(this.constructor, this._program);
        }
        this._initialized = false

        this.ctx = coreContext

        this.gl = this.ctx.gl

        /**
         * The (enabled) views that use this shader.
         * @type {Set<ViewCore>}
         */
        this._views = new Set()
    }

    _init() {
        if (!this._initialized) {
            this._program.compile(this.ctx.gl)
            this._initialized = true
        }
    }

    _uniform(name) {
        return this._program.getUniformLocation(name);
    }

    _attrib(name) {
        return this._program.getAttribLocation(name);
    }

    _setUniform(name, value, glFunction) {
        this._program.setUniformValue(name, value, glFunction)
    }

    useProgram() {
        this._init()
        this.ctx.gl.useProgram(this.glProgram);
        this.beforeUsage()
        this.enableAttribs()
    }

    stopProgram() {
        this.afterUsage()
        this.disableAttribs()
    }

    hasSameProgram(other) {
        // For performance reasons, we first check for identical references.
        return (other && ((other === this) || (other._program === this._program)))
    }

    beforeUsage() {
        // Override to set settings other than the default settings (blend mode etc).
    }

    afterUsage() {
        // All settings changed in beforeUsage should be reset here.
    }

    get initialized() {
        return this._initialized;
    }

    get glProgram() {
        return this._program.glProgram;
    }

    addView(viewCore) {
        this._views.add(viewCore)
    }

    removeView(viewCore) {
        this._views.delete(viewCore)
        if (!this._views) {
            this.cleanup()
        }
    }

    redraw() {
        this._views.forEach(viewCore => {
            viewCore.setHasRenderUpdates(2)
        })
    }

    patch(settings) {
        Base.patchObject(this, settings)
    }

    cleanup() {

    }

}


/**
 * Copyright Metrological, 2017
 */


class Shader extends ShaderBase {

    constructor(coreContext) {
        super(coreContext);
        this.isDefault = this.constructor === Shader;
    }

    enableAttribs() {
        // Enables the attribs in the shader program.
        let gl = this.ctx.gl
        gl.vertexAttribPointer(this._attrib("aVertexPosition"), 2, gl.FLOAT, false, 16, 0)
        gl.enableVertexAttribArray(this._attrib("aVertexPosition"))

        if (this._attrib("aTextureCoord") !== -1) {
            gl.vertexAttribPointer(this._attrib("aTextureCoord"), 2, gl.UNSIGNED_SHORT, true, 16, 2 * 4)
            gl.enableVertexAttribArray(this._attrib("aTextureCoord"))
        }

        if (this._attrib("aColor") !== -1) {
            // Some shaders may ignore the color.
            gl.vertexAttribPointer(this._attrib("aColor"), 4, gl.UNSIGNED_BYTE, true, 16, 3 * 4)
            gl.enableVertexAttribArray(this._attrib("aColor"))
        }
    }

    disableAttribs() {
        // Disables the attribs in the shader program.
        let gl = this.ctx.gl
        gl.disableVertexAttribArray(this._attrib("aVertexPosition"));

        if (this._attrib("aTextureCoord") !== -1) {
            gl.disableVertexAttribArray(this._attrib("aTextureCoord"))
        }

        if (this._attrib("aColor") !== -1) {
            gl.disableVertexAttribArray(this._attrib("aColor"))
        }
    }

    getExtraAttribBytesPerVertex() {
        return 0
    }

    getVertexAttribPointerOffset(operation) {
        return operation.extraAttribsDataByteOffset - (operation.index + 1) * 4 * this.getExtraAttribBytesPerVertex()
    }

    useDefault() {
        // Should return true if this shader is configured (using it's properties) to not have any effect.
        // This may allow the render engine to avoid unnecessary shader program switches or even texture copies.
        return false;
    }

    addEmpty() {
        // Draws this shader even if there are no quads to be added.
        // This is handy for custom shaders.
        return false
    }

    setExtraAttribsInBuffer(operation) {
        // Set extra attrib data in in operation.quads.data/floats/uints, starting from
        // operation.extraAttribsBufferByteOffset.
    }

    setupUniforms(operation) {
        // Set all shader-specific uniforms.
        // Notice that all uniforms should be set, even if they have not been changed within this shader instance.
        // The uniforms are shared by all shaders that have the same type (and shader program).
        this._setUniform("projection", this._getProjection(operation), this.ctx.gl.uniform2fv, false)
    }

    _getProjection(operation) {
        return operation.getProjection()
    }

    getFlipY(operation) {
        return this._getProjection(operation)[1] < 0
    }

    beforeDraw(operation) {
    }

    draw(operation) {
        let gl = this.ctx.gl;

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

    afterDraw(operation) {
    }

}

Shader.vertexShaderSource = `
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

Shader.fragmentShaderSource = `
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

Shader.prototype.isShader = true

/**
 * Copyright Metrological, 2017
 */


class Filter extends ShaderBase {

    constructor(coreContext) {
        super(coreContext);
    }

    useDefault() {
        // Should return true if this filter is configured (using it's properties) to not have any effect.
        // This may allow the render engine to avoid unnecessary shader program switches or even texture copies.
        return false
    }

    enableAttribs() {
        // Enables the attribs in the shader program.
        let gl = this.ctx.gl
        gl.vertexAttribPointer(this._attrib("aVertexPosition"), 2, gl.FLOAT, false, 16, 0)
        gl.enableVertexAttribArray(this._attrib("aVertexPosition"))

        if (this._attrib("aTextureCoord") !== -1) {
            gl.vertexAttribPointer(this._attrib("aTextureCoord"), 2, gl.UNSIGNED_SHORT, true, 16, 2 * 4)
            gl.enableVertexAttribArray(this._attrib("aTextureCoord"))
        }
    }

    disableAttribs() {
        // Disables the attribs in the shader program.
        let gl = this.ctx.gl
        gl.disableVertexAttribArray(this._attrib("aVertexPosition"));
        if (this._attrib("aTextureCoord") !== -1) {
            gl.disableVertexAttribArray(this._attrib("aTextureCoord"))
        }
    }

    setupUniforms(operation) {
        this._setUniform("resolution", new Float32Array([operation.getRenderWidth(), operation.getRenderHeight()]), this.gl.uniform2fv)
    }

    beforeDraw(operation) {
    }

    afterDraw(operation) {
    }

    draw(operation) {
        // Draw the identity quad.
        let gl = this.gl
        gl.bindTexture(gl.TEXTURE_2D, operation.source);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }

    redraw() {
        this._views.forEach(viewCore => {
            viewCore.setHasRenderUpdates(2)

            // Changing filter settings may cause a change mustRenderToTexture for the branch:
            // we need to be sure that the update function is called for this branch.
            viewCore._setRecalc(1 + 2 + 4 + 8)
        })
    }

}

Filter.prototype.isFilter = true

Filter.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    varying vec2 vTextureCoord;
    void main(void){
        gl_Position = vec4(aVertexPosition, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
    }
`;

Filter.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;
    void main(void){
        gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
`;

/**
 * Copyright Metrological, 2017
 */
class TextureManager {

    constructor(stage) {
        this.stage = stage;

        this.gl = this.stage.gl;

        /**
         * The currently used amount of texture memory.
         * @type {number}
         */
        this._usedTextureMemory = 0;

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

    destroy() {
        for (let i = 0, n = this._uploadedTextureSources.length; i < n; i++) {
            let ts = this._uploadedTextureSources[i];
            this.gl.deleteTexture(ts.glTexture);
        }
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

    uploadTextureSource(textureSource, source, format) {
        if (textureSource.glTexture) return;

        // Load texture.
        let gl = this.gl;
        let sourceTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, sourceTexture);

        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, format.premultiplyAlpha);

        if (Utils.isNode) {
            gl.pixelStorei(gl.UNPACK_FLIP_BLUE_RED, !!format.flipBlueRed);
        }

        const texParams = format.texParams
        if (!texParams[gl.TEXTURE_MAG_FILTER]) texParams[gl.TEXTURE_MAG_FILTER] = gl.LINEAR
        if (!texParams[gl.TEXTURE_MIN_FILTER]) texParams[gl.TEXTURE_MIN_FILTER] = gl.LINEAR
        if (!texParams[gl.TEXTURE_WRAP_S]) texParams[gl.TEXTURE_WRAP_S] = gl.CLAMP_TO_EDGE
        if (!texParams[gl.TEXTURE_WRAP_T]) texParams[gl.TEXTURE_WRAP_T] = gl.CLAMP_TO_EDGE

        Object.keys(texParams).forEach(key => {
            const value = texParams[key]
            gl.texParameteri(gl.TEXTURE_2D, parseInt(key), value);
        })

        const texOptions = format.texOptions
        texOptions.format = texOptions.format || (format.hasAlpha ? gl.RGBA : gl.RGB)
        texOptions.type = texOptions.type || gl.UNSIGNED_BYTE
        texOptions.internalFormat = texOptions.internalFormat || texOptions.format

        this.stage.adapter.uploadGlTexture(gl, textureSource, source, texOptions);

        // Store texture.
        textureSource.glTexture = sourceTexture;

        // Used by CoreRenderState for optimizations.
        sourceTexture.w = textureSource.w
        sourceTexture.h = textureSource.h

        this._usedTextureMemory += textureSource.w * textureSource.h;

        this._uploadedTextureSources.push(textureSource);
    }

    isFull() {
        return this._usedTextureMemory >= this.stage.getOption('textureMemory');
    }

    freeUnusedTextureSources() {
        let remainingTextureSources = [];
        let usedTextureMemoryBefore = this._usedTextureMemory;
        for (let i = 0, n = this._uploadedTextureSources.length; i < n; i++) {
            let ts = this._uploadedTextureSources[i];
            if (ts.allowCleanup() && !ts.isResultTexture) {
                this._freeManagedTextureSource(ts);
            } else {
                remainingTextureSources.push(ts);
            }
        }

        this._uploadedTextureSources = remainingTextureSources;
        console.log('freed ' + ((usedTextureMemoryBefore - this._usedTextureMemory) / 1e6).toFixed(2) + 'M texture pixels from GPU memory. Remaining: ' + this._usedTextureMemory);
    }

    _freeManagedTextureSource(textureSource) {
        if (textureSource.glTexture) {
            this._usedTextureMemory -= textureSource.w * textureSource.h;
            this.gl.deleteTexture(textureSource.glTexture);
            textureSource.glTexture = null;
        }

        // Should be reloaded.
        textureSource.loadingSince = null;

        if (textureSource.lookupId) {
            // Delete it from the texture source hashmap to allow GC to collect it.
            // If it is still referenced somewhere, we'll re-add it later.
            this.textureSourceHashmap.delete(textureSource.lookupId);
        }
    }

    /**
     * Externally free texture source.
     * @param textureSource
     */
    freeTextureSource(textureSource) {
        const index = this._uploadedTextureSources.indexOf(textureSource)
        const managed = (index !== -1)

        if (textureSource.glTexture) {
            if (managed) {
                this._usedTextureMemory -= textureSource.w * textureSource.h;
                this._uploadedTextureSources.splice(index, 1)
            }
            this.gl.deleteTexture(textureSource.glTexture);
            textureSource.glTexture = null;
        }

        // Should be reloaded.
        textureSource.loadingSince = null;

        if (textureSource.lookupId) {
            // Delete it from the texture source hashmap to allow GC to collect it.
            // If it is still referenced somewhere, we'll re-add it later.
            this.textureSourceHashmap.delete(textureSource.lookupId);
        }
    }

}



/**
 * Copyright Metrological, 2017
 */
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
         * The number of enabled views that are 'within bounds'.
         * @type {number}
         */
        this._withinBoundsCount = 0

        /**
         * The associated texture source.
         * Should not be changed.
         * @type {TextureSource}
         */
        this._source = undefined;

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
         * @type {number}
         */
        this.mw = 2048;

        /**
         * The (maximum) expected texture source height. Used for within bounds determination while texture is not yet loaded.
         * @type {number}
         */
        this.mh = 2048;

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
        this._mustUpdate = true

    }

    get source() {
        if (this._mustUpdate) {
            this._performUpdateSource(true)
            this.stage.removeUpdateSourceTexture(this)
        }
        return this._source
    }

    addView(v) {
        if (!this.views.has(v)) {
            this.views.add(v);

            if (v.withinBoundsMargin) {
                this.incWithinBoundsCount()
            }
        }
    }

    removeView(v) {
        if (this.views.delete(v)) {
            if (v.withinBoundsMargin) {
                this.decWithinBoundsCount()
            }
        }
    }

    incWithinBoundsCount() {
        this._withinBoundsCount++

        if (this._withinBoundsCount === 1) {
            this.becomesUsed();
        }
    }

    decWithinBoundsCount() {
        this._withinBoundsCount--

        if (!this._withinBoundsCount) {
            this.becomesUnused();
        }
    }

    becomesUsed() {
        if (this._mustUpdate) {
            // Generate the source for this texture, setting the _source property.
            this._updateSource()
        }

        if (this._source) {
            this._source.addTexture(this)
        }
    }

    becomesUnused() {
        if (this._source) {
            this._source.removeTexture(this)
        }
    }

    isUsed() {
        return this._withinBoundsCount > 0
    }

    /**
     * Returns the lookup id for the current texture settings, to be able to reuse it.
     * @returns {string|undefined}
     */
    _getLookupId() {
        // Default: do not reuse texture.
        return undefined
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
        throw new Error("Texture.generate must be implemented.")
    }

    get isValid() {
        return this._getIsValid()
    }

    /**
     * If texture is not 'valid', no source can be created for it.
     * @returns {boolean}
     */
    _getIsValid() {
        return true
    }

    /**
     * This must be called when the texture source must be re-generated.
     */
    _changed() {
        // If no view is actively using this texture, ignore it altogether.
        if (this.isUsed()) {
            this._updateSource()
        } else {
            this._mustUpdate = true
        }
    }

    _updateSource() {
        // We delay all updateSource calls to the next drawFrame, so that we can bundle them.
        // Otherwise we may reload a texture more often than necessary, when, for example, patching multiple text
        // properties.
        this.stage.addUpdateSourceTexture(this)
    }

    _performUpdateSource(force = false) {
        // If, in the meantime, the texture was no longer used, just remember that it must update until it becomes used
        // again.
        if (force || this.isUsed()) {
            this._mustUpdate = false
            let source = this._getTextureSource()
            this._replaceTextureSource(source)
        }
    }

    _getTextureSource() {
        let source = undefined
        if (this._getIsValid()) {
            const lookupId = this._getLookupId()
            if (lookupId) {
                source = this.manager.getReusableTextureSource(lookupId)
            }
            if (!source) {
                source = this.manager.getTextureSource(this._getSourceLoader(), lookupId)
            }
        }
        return source
    }

    _replaceTextureSource(newSource = undefined) {
        let oldSource = this._source;

        this._source = newSource;

        if (oldSource) {
            oldSource.removeTexture(this)
        }

        if (this.isUsed()) {
            if (newSource) {
                if (newSource && newSource.glTexture) {
                    // Was already loaded: no display immediately.
                    this.views.forEach(view => {
                        if (view.isActive()) {
                            view._setDisplayedTexture(this)
                        }
                    })
                }

                newSource.addTexture(this)
            } else {
                this.views.forEach(view => {
                    if (view.isActive()) {
                        view._setDisplayedTexture(null)
                    }
                })
            }
        }
    }

    load() {
        this._performUpdateSource(true)
        this.stage.removeUpdateSourceTexture(this)
        if (this._source) {
            this._source.load()
        }
    }

    isLoaded() {
        return this._source && this._source.isLoaded()
    }

    free() {
        if (this._source) {
            this._source.free()
        }
    }

    enableClipping(x, y, w, h) {
        x *= this._precision
        y *= this._precision
        w *= this._precision
        h *= this._precision
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
        nonDefaults['type'] = this.constructor.name
        if (this.x !== 0) nonDefaults['x'] = this.x;
        if (this.y !== 0) nonDefaults['y'] = this.y;
        if (this.w !== 0) nonDefaults['w'] = this.w;
        if (this.h !== 0) nonDefaults['h'] = this.h;
        if (this.precision !== 1) nonDefaults['precision'] = this.precision;
        return nonDefaults;
    }

    get px() {
        return this._x
    }

    get py() {
        return this._y
    }

    get pw() {
        return this._w
    }

    get ph() {
        return this._h
    }

    get x() {
        return this._x / this._precision
    }
    set x(v) {
        v = v * this._precision
        if (this._x !== v) {
            this._x = v;
            this.updateClipping();
        }
    }

    get y() {
        return this._y / this._precision
    }
    set y(v) {
        v = v * this._precision
        if (this._y !== v) {
            this._y = v;
            this.updateClipping();
        }
    }

    get w() {
        return this._w / this._precision
    }

    set w(v) {
        v = v * this._precision
        if (this._w !== v) {
            this._w = v;
            this.updateClipping();
        }
    }

    get h() {
        return this._h / this._precision
    }

    set h(v) {
        v = v * this._precision
        if (this._h !== v) {
            this._h = v;
            this.updateClipping();
        }
    }

    get precision() {
        return this._precision
    }

    set precision(v) {
        if (this._precision !== v) {
            this._precision = v;
            this.updatePrecision();
        }
    }

    getRenderWidth() {
        // If dimensions are unknown (texture not yet loaded), use maximum width as a fallback as render width to allow proper bounds checking.
        return (this._w || (this._source ? this._source.getRenderWidth() : 0) || this.mw) / this._precision
    }

    getRenderHeight() {
        return (this._h || (this._source ? this._source.getRenderHeight() : 0) || this.mh) / this._precision
    }

    patch(settings) {
        Base.patchObject(this, settings)
    }

}

Texture.prototype.isTexture = true


Texture.id = 0;


/**
 * Copyright Metrological, 2017
 */

class TextureSource {

    constructor(manager, loader = undefined) {
        this.id = TextureSource.id++;

        this.manager = manager;
        
        this.stage = manager.stage;

        /**
         * All enabled textures (textures that are used by visible views).
         * @type {Set<Texture>}
         */
        this.textures = new Set()

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

        this.glTexture = null;

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

    }

    addTexture(v) {
        if (!this.textures.has(v)) {
            this.textures.add(v);

            if (this.textures.size === 1) {
                this.becomesUsed()
            }
        }
    }

    removeTexture(v) {
        if (this.textures.delete(v)) {
            if (this.textures.size === 0) {
                this.becomesUnused()
            }
        }
    }

    get isResultTexture() {
        return this._isResultTexture
    }

    set isResultTexture(v) {
        this._isResultTexture = v
    }

    forEachView(cb) {
        this.textures.forEach(texture => {
            texture.views.forEach(cb)
        })
    }

    getRenderWidth() {
        return this.w;
    }

    getRenderHeight() {
        return this.h;
    }

    allowCleanup() {
        return !this.permanent && (!this.isUsed()) && !this.isResultTexture
    }

    becomesUsed() {
        if (this.lookupId) {
            if (!this.manager.textureSourceHashmap.has(this.lookupId)) {
                this.manager.textureSourceHashmap.set(this.lookupId, this);
            }
        }

        this.load();
    }

    becomesUnused() {
        if (this.isLoading()) {
            if (this._cancelCb) {
                this._cancelCb(this);

                this.loadingSince = 0;
            }
        }
    }

    isLoaded() {
        return !!this.glTexture;
    }

    isLoading() {
        return this.loadingSince > 0;
    }

    reload() {
        this.free()
        if (this.isUsed()) {
            this.load()
        }
    }

    load() {
        if (this.isResultTexture) {
            // Core texture source (View resultGlTexture), for which the loading is managed by the core.
            return;
        }

        if (!this.glTexture && !this.isLoading()) {
            this.loadingSince = (new Date()).getTime();
            this._cancelCb = this.loader((err, options) => {
                // Clear callback to avoid memory leaks.
                this._cancelCb = undefined

                if (this.manager.stage.destroyed) {
                    // Ignore async load when stage is destroyed.
                    return;
                }
                this.loadingSince = 0;
                if (err) {
                    // Emit txError.
                    this.onError(err);
                } else if (options && options.source) {
                    this.setSource(options);
                }
            }, this);
        }
    }

    onError(e) {
        console.error('texture load error', e, this.id);
        this.forEachView(function(view) {
            view.onTextureSourceLoadError(e);
        });
    }

    setSource(options) {
        const source = options.source

        this.w = source.width || (options && options.w) || 0;
        this.h = source.height || (options && options.h) || 0;

        if (options && options.renderInfo) {
            // Assign to id in cache so that it can be reused.
            this.renderInfo = options.renderInfo;
        }

        this.permanent = !!options.permanent

        if (!Utils.isNode && source instanceof WebGLTexture) {
            // Texture managed by caller.
            this.glTexture = source;

            // Used by CoreRenderState for optimizations.
            source.w = this.w
            source.h = this.h

            // WebGLTexture objects are by default
            this.permanent = options.hasOwnProperty('permanent') ? options.permanent : true
        } else {
            var format = {
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

            format.texParams = options.texParams || {}
            format.texOptions = options.texOptions || {}

            this.manager.uploadTextureSource(this, source, format);
        }

        this.onLoad();
    }

    isUsed() {
        return (this.textures.size > 0);
    }

    onLoad() {
        this.forEachView(function(view) {
            view.onTextureSourceLoaded();
        });
    }

    forceRenderUpdate() {
        // Call this method after manually changing updating the glTexture.
        this.forEachView(function(view) {
            view.forceRenderUpdate();
        });
    }

    /**
     * Used for result textures.
     */
    replaceGlTexture(glTexture, w, h) {
        let prevGlTexture = this.glTexture;
        // Loaded by core.
        this.glTexture = glTexture;
        this.w = w;
        this.h = h;

        if (!prevGlTexture && this.glTexture) {
            this.forEachView(view => view.onTextureSourceLoaded())
        }

        if (!this.glTexture) {
            this.forEachView(view => view._setDisplayedTexture(null))
        }

        this.forEachView(view => view._updateDimensions());
    }

    onError(e) {
        console.error('texture load error', e, this.id);
        this.forEachView(view => view.onTextureSourceLoadError(e))
    }

    free() {
        this.manager.freeTextureSource(this);
    }

}

TextureSource.prototype.isTextureSource = true

TextureSource.id = 1;



/**
 * Copyright Metrological, 2017
 */


class TextureAtlas {

    constructor(stage) {
        let vertexShaderSrc = `
            #ifdef GL_ES
            precision lowp float;
            #endif
            attribute vec2 aVertexPosition;
            attribute vec2 aTextureCoord;
            uniform mat4 projectionMatrix;
            varying vec2 vTextureCoord;
            void main(void){
                gl_Position = projectionMatrix * vec4(aVertexPosition, 0.0, 1.0);
                vTextureCoord = aTextureCoord;
            }
        `;

        let fragmentShaderSrc = `
            #ifdef GL_ES
            precision lowp float;
            #endif
            varying vec2 vTextureCoord;
            uniform sampler2D uSampler;
            void main(void){
                gl_FragColor = texture2D(uSampler, vTextureCoord);
            }
        `;

        this._program = new ShaderProgram(vertexShaderSrc, fragmentShaderSrc)
        this._program.compile(stage.gl);

        this.stage = stage;

        this.w = 2048;
        this.h = 2048;

        this._activeTree = new TextureAtlasTree(this.w, this.h);

        /**
         * The texture sources that should be on to the texture atlas (active in stage, loaded and with valid dimensions).
         * @type {Set<TextureSource>}
         */
        this._activeTextureSources = new Set();

        /**
         * The texture sources that were added to the texture atlas (since the last defragment).
         * @type {Set<TextureSource>}
         */
        this._addedTextureSources = new Set();

        /**
         * The total surface of the current texture atlas that's being used by unused texture sources.
         * @type {number}
         */
        this._wastedPixels = 0;

        /**
         * The last render frame number that the texture atlas was defragmented on.
         * @type {number}
         */
        this._lastDefragFrame = 0;

        /**
         * Texture atlas size limit.
         * @type {number}
         */
        this._pixelsLimit = this.w * this.h / 16;

        /**
         * The minimal amount of pixels that should be able to be reclaimed when performing a defragment.
         * @type {number}
         */
        this._minWastedPixels = this.w * this.h / 8;

        this._defragNeeded = false;

        /**
         * Pending texture sources to be uploaded.
         * @type {TextureSource[]}
         */
        this._uploads = [];

        this._init();
    }
    
    _init() {
        let gl = this.gl;

        gl.useProgram(this.glProgram);

        // Bind attributes.
        this._vertexPositionAttribute = gl.getAttribLocation(this.glProgram, "aVertexPosition");
        this._textureCoordAttribute = gl.getAttribLocation(this.glProgram, "aTextureCoord");

        // Init webgl arrays.
        // We support up to 1000 textures per call, all consisting out of 9 elements.
        this._paramsBuffer = new ArrayBuffer(16 * 4 * 9 * 1000);
        this._allCoords = new Float32Array(this._paramsBuffer);
        this._allTexCoords = new Float32Array(this._paramsBuffer);

        this._allIndices = new Uint16Array(6 * 9 * 1000);

        // fill the indices with the quads to draw.
        for (let i = 0, j = 0; i < 1000 * 6 * 9; i += 6, j += 4) {
            this._allIndices[i] = j;
            this._allIndices[i + 1] = j + 1;
            this._allIndices[i + 2] = j + 2;
            this._allIndices[i + 3] = j;
            this._allIndices[i + 4] = j + 2;
            this._allIndices[i + 5] = j + 3;
        }

        this._indicesGlBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indicesGlBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._allIndices, gl.STATIC_DRAW);

        // Set transformation matrix.
        // The matrix that causes the [0,0 - w,h] box to map to [-1,-1 - 1,1] in the end results.
        this._projectionMatrix = new Float32Array([
            2/this.w, 0, 0, 0,
            0, 2/this.h, 0, 0,
            0, 0, 1, 0,
            -1, -1, 0, 1
        ]);

        let projectionMatrixAttribute = gl.getUniformLocation(this.glProgram, "projectionMatrix");
        gl.uniformMatrix4fv(projectionMatrixAttribute, false, this._projectionMatrix);

        this.texture = this.gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        this.texture.w = this.w
        this.texture.h = this.h

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.w, this.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);

        // Create framebuffer which can be used to modify the texture.
        this.framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
        if (gl.getError() != gl.NO_ERROR) {
            throw "Some WebGL error occurred while trying to create framebuffer.";
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    }
    
    destroy() {
        this.gl.deleteTexture(this.texture);
        this.gl.deleteFramebuffer(this.framebuffer);
        this.gl.deleteBuffer(this.paramsGlBuffer);
        this.gl.deleteBuffer(this._indicesGlBuffer);
        this._program.destroy();
    }
    
    uploadTextureSources(textureSources) {
        let i;

        let n = textureSources.length;
        if (n > 1000) {
            n = 1000;
        }
        for (i = 0; i < n; i++) {

            let w = textureSources[i].w;
            let h = textureSources[i].h;

            let x = textureSources[i].textureAtlasX;
            let y = textureSources[i].textureAtlasY;

            let divW = 1 / w;
            let divH = 1 / h;

            let offset = i * 16 * 9;

            // Add 2px margin to avoid edge artifacts.

            // Full area.
            this._allCoords[offset + 0] = x;
            this._allCoords[offset + 1] = y;
            this._allCoords[offset + 4] = x + w;
            this._allCoords[offset + 5] = y;
            this._allCoords[offset + 8] = x + w;
            this._allCoords[offset + 9] = y + h;
            this._allCoords[offset + 12] = x;
            this._allCoords[offset + 13] = y + h;

            // Top row.
            this._allCoords[offset + 16] = x;
            this._allCoords[offset + 17] = y - 1;
            this._allCoords[offset + 20] = x + w;
            this._allCoords[offset + 21] = y - 1;
            this._allCoords[offset + 24] = x + w;
            this._allCoords[offset + 25] = y;
            this._allCoords[offset + 28] = x;
            this._allCoords[offset + 29] = y;

            // Bottom row.
            this._allCoords[offset + 32] = x;
            this._allCoords[offset + 33] = y + h;
            this._allCoords[offset + 36] = x + w;
            this._allCoords[offset + 37] = y + h;
            this._allCoords[offset + 40] = x + w;
            this._allCoords[offset + 41] = y + h + 1;
            this._allCoords[offset + 44] = x;
            this._allCoords[offset + 45] = y + h + 1;

            // Left row.
            this._allCoords[offset + 48] = x - 1;
            this._allCoords[offset + 49] = y;
            this._allCoords[offset + 52] = x;
            this._allCoords[offset + 53] = y;
            this._allCoords[offset + 56] = x;
            this._allCoords[offset + 57] = y + h;
            this._allCoords[offset + 60] = x - 1;
            this._allCoords[offset + 61] = y + h;

            // Right row.
            this._allCoords[offset + 64] = x + w;
            this._allCoords[offset + 65] = y;
            this._allCoords[offset + 68] = x + w + 1;
            this._allCoords[offset + 69] = y;
            this._allCoords[offset + 72] = x + w + 1;
            this._allCoords[offset + 73] = y + h;
            this._allCoords[offset + 76] = x + w;
            this._allCoords[offset + 77] = y + h;

            // Upper-left.
            this._allCoords[offset + 80] = x - 1;
            this._allCoords[offset + 81] = y - 1;
            this._allCoords[offset + 84] = x;
            this._allCoords[offset + 85] = y - 1;
            this._allCoords[offset + 88] = x;
            this._allCoords[offset + 89] = y;
            this._allCoords[offset + 92] = x - 1;
            this._allCoords[offset + 93] = y;

            // Upper-right.
            this._allCoords[offset + 96] = x + w;
            this._allCoords[offset + 97] = y - 1;
            this._allCoords[offset + 100] = x + w + 1;
            this._allCoords[offset + 101] = y - 1;
            this._allCoords[offset + 104] = x + w + 1;
            this._allCoords[offset + 105] = y;
            this._allCoords[offset + 108] = x + w;
            this._allCoords[offset + 109] = y;

            // Lower-right.
            this._allCoords[offset + 112] = x + w;
            this._allCoords[offset + 113] = y + h;
            this._allCoords[offset + 116] = x + w + 1;
            this._allCoords[offset + 117] = y + h;
            this._allCoords[offset + 120] = x + w + 1;
            this._allCoords[offset + 121] = y + h + 1;
            this._allCoords[offset + 124] = x + w;
            this._allCoords[offset + 125] = y + h + 1;

            // Lower-left.
            this._allCoords[offset + 128] = x - 1;
            this._allCoords[offset + 129] = y + h;
            this._allCoords[offset + 132] = x;
            this._allCoords[offset + 133] = y + h;
            this._allCoords[offset + 136] = x;
            this._allCoords[offset + 137] = y + h + 1;
            this._allCoords[offset + 140] = x - 1;
            this._allCoords[offset + 141] = y + h + 1;

            // Texture coords.
            this._allTexCoords[offset + 2] = 0;
            this._allTexCoords[offset + 3] = 0;
            this._allTexCoords[offset + 6] = 1;
            this._allTexCoords[offset + 7] = 0;
            this._allTexCoords[offset + 10] = 1;
            this._allTexCoords[offset + 11] = 1;
            this._allTexCoords[offset + 14] = 0;
            this._allTexCoords[offset + 15] = 1;

            this._allTexCoords[offset + 18] = 0;
            this._allTexCoords[offset + 19] = 0;
            this._allTexCoords[offset + 22] = 1;
            this._allTexCoords[offset + 23] = 0;
            this._allTexCoords[offset + 26] = 1;
            this._allTexCoords[offset + 27] = divH;
            this._allTexCoords[offset + 30] = 0;
            this._allTexCoords[offset + 31] = divH;

            this._allTexCoords[offset + 34] = 0;
            this._allTexCoords[offset + 35] = 1 - divH;
            this._allTexCoords[offset + 38] = 1;
            this._allTexCoords[offset + 39] = 1 - divH;
            this._allTexCoords[offset + 42] = 1;
            this._allTexCoords[offset + 43] = 1;
            this._allTexCoords[offset + 46] = 0;
            this._allTexCoords[offset + 47] = 1;

            this._allTexCoords[offset + 50] = 0;
            this._allTexCoords[offset + 51] = 0;
            this._allTexCoords[offset + 54] = divW;
            this._allTexCoords[offset + 55] = 0;
            this._allTexCoords[offset + 58] = divW;
            this._allTexCoords[offset + 59] = 1;
            this._allTexCoords[offset + 62] = 0;
            this._allTexCoords[offset + 63] = 1;

            this._allTexCoords[offset + 66] = 1 - divW;
            this._allTexCoords[offset + 67] = 0;
            this._allTexCoords[offset + 70] = 1;
            this._allTexCoords[offset + 71] = 0;
            this._allTexCoords[offset + 74] = 1;
            this._allTexCoords[offset + 75] = 1;
            this._allTexCoords[offset + 78] = 1 - divW;
            this._allTexCoords[offset + 79] = 1;

            this._allTexCoords[offset + 82] = 0;
            this._allTexCoords[offset + 83] = 0;
            this._allTexCoords[offset + 86] = divW;
            this._allTexCoords[offset + 87] = 0;
            this._allTexCoords[offset + 90] = divW;
            this._allTexCoords[offset + 91] = divH;
            this._allTexCoords[offset + 94] = 0;
            this._allTexCoords[offset + 95] = divH;

            this._allTexCoords[offset + 98] = 1 - divW;
            this._allTexCoords[offset + 99] = 0;
            this._allTexCoords[offset + 102] = 1;
            this._allTexCoords[offset + 103] = 0;
            this._allTexCoords[offset + 106] = 1;
            this._allTexCoords[offset + 107] = divH;
            this._allTexCoords[offset + 110] = 1 - divW;
            this._allTexCoords[offset + 111] = divH;

            this._allTexCoords[offset + 114] = 1 - divW;
            this._allTexCoords[offset + 115] = 1 - divH;
            this._allTexCoords[offset + 118] = 1;
            this._allTexCoords[offset + 119] = 1 - divH;
            this._allTexCoords[offset + 122] = 1;
            this._allTexCoords[offset + 123] = 1;
            this._allTexCoords[offset + 126] = 1 - divW;
            this._allTexCoords[offset + 127] = 1;

            this._allTexCoords[offset + 130] = 0;
            this._allTexCoords[offset + 131] = 1 - divH;
            this._allTexCoords[offset + 134] = divW;
            this._allTexCoords[offset + 135] = 1 - divH;
            this._allTexCoords[offset + 138] = divW;
            this._allTexCoords[offset + 139] = 1;
            this._allTexCoords[offset + 142] = 0;
            this._allTexCoords[offset + 143] = 1;
        }

        let gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.useProgram(this.glProgram);
        gl.viewport(0,0,this.w,this.h);
        gl.blendFunc(gl.ONE, gl.ZERO);
        gl.enable(gl.BLEND);
        gl.disable(gl.SCISSOR_TEST);
        gl.disable(gl.DEPTH_TEST);

        // Upload data.
        this.paramsGlBuffer = this.paramsGlBuffer || gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.paramsGlBuffer);

        // We want to send the first elements from the params buffer, so we allCoords in order to slice some off.
        let view = new DataView(this._paramsBuffer, 0, 16 * 9 * 4 * n);
        gl.bufferData(gl.ARRAY_BUFFER, view, gl.DYNAMIC_DRAW);

        gl.vertexAttribPointer(this._vertexPositionAttribute, 2, gl.FLOAT, false, 16, 0);
        gl.vertexAttribPointer(this._textureCoordAttribute, 2, gl.FLOAT, false, 16, 2 * 4);

        gl.enableVertexAttribArray(this._vertexPositionAttribute);
        gl.enableVertexAttribArray(this._textureCoordAttribute);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indicesGlBuffer);

        for (i = 0; i < n; i++) {
            gl.bindTexture(gl.TEXTURE_2D, textureSources[i].glTexture);
            gl.drawElements(gl.TRIANGLES, 6 * 9, gl.UNSIGNED_SHORT, i * 6 * 9 * 2);
        }

        gl.disableVertexAttribArray(this._vertexPositionAttribute);
        gl.disableVertexAttribArray(this._textureCoordAttribute);
    }

    /**
     * Allocates space for a loaded texture.
     * @param texture
     * @return {{x: number, y: number}|null}
     *   The allocated position.
     */
    allocate(texture) {
        return this._activeTree.add(texture);
    }

    /**
     * Registers the texture source to the texture atlas.
     * @param {TextureSource} textureSource
     * @pre TextureSource.glTexture !== null
     */    
    addActiveTextureSource(textureSource) {
        if (textureSource.id === 1) {
            // Rectangle texture is automatically added.
        } else {
            if ((textureSource.w * textureSource.h < this._pixelsLimit)) {
                // Only add if dimensions are valid.
                if (!this._activeTextureSources.has(textureSource)) {
                    this._activeTextureSources.add(textureSource);

                    // Add it directly (if possible).
                    if (!this._addedTextureSources.has(textureSource)) {
                        this.add(textureSource);
                    }
                }
            }
        }        
    }

    removeActiveTextureSource(textureSource) {
        if (this._activeTextureSources.has(textureSource)) {
            this._activeTextureSources.delete(textureSource);

            let uploadsIndex = this._uploads.indexOf(textureSource);
            if (uploadsIndex >= 0) {
                // Still waiting to be uploaded.
                this._uploads.splice(uploadsIndex, 1);

                // It is not uploaded, so it's not on the texture atlas any more.
                textureSource.onRemovedFromTextureAtlas();

                this._addedTextureSources.delete(textureSource);
            }

            if (this._addedTextureSources.has(textureSource)) {
                this._wastedPixels += textureSource.w * textureSource.h;
            }
        }        
    }
    
    add(textureSource) {
        let position = this.allocate(textureSource);
        if (position) {
            this._addedTextureSources.add(textureSource);

            textureSource.onAddedToTextureAtlas(position.x + 1, position.y + 1);

            this._uploads.push(textureSource);
        } else {
            this._defragNeeded = true;

            // Error.
            return false;
        }

        return true;        
    }
    
    defragment() {
        console.log('defragment texture atlas');

        // Clear new area (necessary for semi-transparent textures).
        let gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.viewport(0,0,this.w,this.h);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        this._activeTree.reset();
        this._uploads = [];
        this._wastedPixels = 0;
        this._lastDefragFrame = this.stage.frameCounter;
        this._defragNeeded = false;

        this._addedTextureSources.forEach(function(textureSource) {
            textureSource.onRemovedFromTextureAtlas();
        });

        this._addedTextureSources.clear();

        // Automatically re-add the rectangle texture, to make sure that it is at coordinate 0,0.
        this.add(this.stage.rectangleTexture.source);

        // Then (try to) re-add all active texture sources.
        // @todo: sort by dimensions (smallest first)?
        let self = this;
        this._activeTextureSources.forEach(function(textureSource) {
            self.add(textureSource);
        });
    }

    /**
     * Actually uploads the previously added sources to the texture atlas.
     */
    flush() {
        if (this._defragNeeded) {
            // Only defragment when there is something serious to gain.
            if (this._wastedPixels >= this._minWastedPixels) {
                // Limit defragmentations from happening all the time when it can't keep up.
                if (this._lastDefragFrame < this.stage.frameCounter - 300) {
                    this.defragment();
                }
            }
        }

        if (this._uploads.length) {
            this.uploadTextureSources(this._uploads);
            this._uploads = [];
        }
    }

    get glProgram() {
        return this._program.glProgram;
    }

    get gl() {
        return this._program.gl;
    }

}



/**
 * Copyright Metrological, 2017
 */
class TextureAtlasTree {

    constructor(w, h) {
        this.w = w;
        this.h = h;

        this.reset();
    }

    reset() {
        this.root = {x: 0, y: 0, w: this.w, h: this.h};
        this.spaces = new Set([this.root]);
        this.maxH = this.h;
    }

    add(texture) {
        // We need an extra border to fix linear interpolation artifacts (see TextureAtlasRenderer).
        let w = texture.w + 2;
        let h = texture.h + 2;

        if (h > this.maxH) {
            return false;
        }

        let mp = 0;
        let found = null;
        let maxH = 0;
        this.spaces.forEach(function(n) {
            if (n.h > maxH) {
                maxH = n.h;
            }
            if (n.w >= w && n.h >= h) {
                if (!mp || mp > w * h) {
                    mp = w * h;
                    found = n;
                }
            }
        });
        this.maxH = maxH;

        // Best match.
        if (!found) {
            return false;
        }

        this.useNode(found, texture);
        return found;
    }

    findNode(node, w, h) {
        if (!node) return null;
        if (!node.o) {
            if (w <= node.w && h <= node.h) {
                return node;
            } else {
                // No space.
                return null;
            }
        } else {
            return this.findNode(node.r, w, h) || this.findNode(node.d, w, h);
        }
    }

    useNode(node, texture) {
        let w = texture.w + 2, h = texture.h + 2;
        if (node.w > w) {
            node.r = {x: node.x + w, y: node.y, w: node.w - w, h: h};
            this.spaces.add(node.r);
        }
        if (node.h > h) {
            node.d = {x: node.x, y: node.y + h, w: node.w, h: node.h - h};
            this.spaces.add(node.d);
        }
        this.spaces.delete(node);
        node.o = texture;
    }
    
    getTextures() {
        let n = [this.root];

        let textures = [];
        let c = 1;
        while(c) {
            let item = n.pop();
            c--;

            if (item.o) {
                textures.push(item.o);
                if (item.r) {
                    n.push(item.r);
                    c++;
                }
                if (item.d) {
                    n.push(item.d);
                    c++;
                }
            }
        }

        return textures;        
    }
    
}


/**
 * Render tree node.
 * Copyright Metrological, 2017
 */




class View {

    constructor(stage) {
        
        // EventEmitter constructor.
        this._hasEventListeners = false

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
         * @protected
         */
        this.__texture = null;

        /**
         * The currently displayed texture. While this.texture is loading, this one may be different.
         * @type {Texture}
         * @protected
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
         * @private
         */
        this.__tagRoot = false;

        this.__x = 0;
        this.__y = 0;
        this.__w = 0;
        this.__h = 0;
        this.__scaleX = 1;
        this.__scaleY = 1;
        this.__pivotX = 0.5;
        this.__pivotY = 0.5;
        this.__mountX = 0;
        this.__mountY = 0;
        this.__alpha = 1;
        this.__rotation = 0;
        this.__visible = true;

        /**
         * (Lazy-initialised) list of children owned by this view.
         * @type {ViewChildList}
         */
        this.__childList = null;

    }

    get id() {
        return this.__id
    }

    set ref(ref) {
        if (this.__ref !== ref) {
            const charcode = ref.charCodeAt(0)
            if (!Utils.isUcChar(charcode)) {
                this._throwError("Ref must start with an upper case character: " + ref)
            }
            if (this.__ref !== null) {
                this.removeTag(this.__ref)
                if (this.__parent) {
                    this.__parent.__childList.clearRef(this.__ref)
                }
            }

            this.__ref = ref

            if (this.__ref) {
                this._addTag(this.__ref)
                if (this.__parent) {
                    this.__parent.__childList.setRef(this.__ref, this)
                }
            }
        }
    }

    get ref() {
        return this.__ref
    }

    get core() {
        return this.__core
    }

    setAsRoot() {
        this._updateAttachedFlag();
        this._updateEnabledFlag();
        this.__core.setAsRoot();
    }

    get isRoot() {
        return this.__core.isRoot
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

        if (this.isRoot && parent) {
            this._throwError("Root should not be added as a child! Results are unspecified!")
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
        return this.__attached
    }

    get enabled() {
        return this.__enabled
    }

    get active() {
        return this.__active
    }

    isAttached() {
        return (this.__parent ? this.__parent.__attached : (this.stage.root === this));
    };

    isEnabled() {
        return this.__visible && (this.__alpha > 0) && (this.__parent ? this.__parent.__enabled : (this.stage.root === this));
    };

    isActive() {
        return this.isEnabled() && this.withinBoundsMargin;
    };

    /**
     * Updates the 'attached' flag for this branch.
     */
    _updateAttachedFlag() {
        let newAttached = this.isAttached();
        if (this.__attached !== newAttached) {
            this.__attached = newAttached;

            // No need to recurse since we are already recursing when setting the attached flags.
            this._updateEnabledLocal()

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
                // Using method instead of emit gives a performance benefit.
                this._onAttach()
            } else {
                this._onDetach()
            }
        }
    };

    _updateEnabledLocal() {
        let newEnabled = this.isEnabled();
        if (this.__enabled !== newEnabled) {
            if (newEnabled) {
                this._setEnabledFlag();
                this._onEnabled()
            } else {
                this._unsetEnabledFlag();
                this._onDisabled()
            }
        }
    }

    /**
     * Updates the 'enabled' flag for this branch.
     */
    _updateEnabledFlag() {
        let newEnabled = this.isEnabled();
        if (this.__enabled !== newEnabled) {
            if (newEnabled) {
                this._setEnabledFlag();
            } else {
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

            // Run this after all _children because we'd like to see (de)activating a branch as an 'atomic' operation.
            if (newEnabled) {
                this._onEnabled()
            } else {
                this._onDisabled()
            }
        }
    };

    _setEnabledFlag() {
        this.__enabled = true;

        // Force re-check of texture because dimensions might have changed (cutting).
        this._updateDimensions();
        this._updateTextureCoords();

        if (this.__texture) {
            this.__texture.addView(this)
        }

        if (this.withinBoundsMargin) {
            this._setActiveFlag()
        }

        if (this.__core.shader) {
            this.__core.shader.addView(this.__core);
        }

        if (this._texturizer) {
            this.texturizer.filters.forEach(filter => filter.addView(this.__core))
        }

    }

    _unsetEnabledFlag() {
        if (this.__active) {
            this._unsetActiveFlag()
        }

        if (this.__texture) {
            this.__texture.removeView(this)
        }

        if (this.__core.shader) {
            this.__core.shader.removeView(this.__core);
        }

        if (this._texturizer) {
            this.texturizer.filters.forEach(filter => filter.removeView(this.__core))
        }

        this.__enabled = false;
    }

    _setActiveFlag() {
        this.__active = true
        if (this.__texture) {
            this._enableTexture()
        }
        this._onActive()
    }

    _unsetActiveFlag() {
        this.__active = false;
        if (this.__texture) {
            this._disableTexture()
        }

        if (this._hasTexturizer()) {
            this.texturizer.deactivate();
        }

        this._onInactive()
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

    _getRenderWidth() {
        if (this.__w) {
            return this.__w;
        } else if (this.__displayedTexture) {
            return this.__displayedTexture.getRenderWidth()
        } else if (this.__texture) {
            // Texture already loaded, but not yet updated (probably because this view is not active).
            return this.__texture.getRenderWidth()
        } else {
            return 0;
        }
    };

    _getRenderHeight() {
        if (this.__h) {
            return this.__h;
        } else if (this.__displayedTexture) {
            return this.__displayedTexture.getRenderHeight()
        } else if (this.__texture) {
            // Texture already loaded, but not yet updated (probably because this view is not active).
            return this.__texture.getRenderHeight()
        } else {
            return 0;
        }
    };

    get renderWidth() {
        if (this.__enabled) {
            // Render width is only maintained if this view is enabled.
            return this.__core._rw;
        } else {
            return this._getRenderWidth();
        }
    }

    get renderHeight() {
        if (this.__enabled) {
            return this.__core._rh;
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

            if (!this.__texture.isUsed() || !this.isEnabled()) {
                // Loading the texture will have no effect on the dimensions of this view.
                // Manually update them, so that calcs can be performed immediately in userland.
                this._updateDimensions();
            }
        }
    }

    _enableTexture() {
        // Detect texture changes.
        let dt = null;
        if (this.__texture.isLoaded()) {
            dt = this.__texture;
        }

        // Note that the texture source may have been replaced while being invisible.
        this._setDisplayedTexture(dt)
    }

    _disableTexture() {
        // We disable the displayed texture because, when the texture changes while invisible, we should use that w, h,
        // mw, mh for checking within bounds.
        this._setDisplayedTexture(null)
    }

    get texture() {
        return this.__texture;
    }

    set texture(v) {
        let texture;
        if (Utils.isObjectLiteral(v)) {
            if (v.type) {
                texture = new v.type(this.stage)
            } else {
                texture = this.texture
            }

            if (texture) {
                Base.patchObject(texture, v)
            }
        } else if (!v) {
            texture = null;
        } else {
            if (v.isTexture) {
                texture = v;
            } else if (v.isTextureSource) {
                texture = new SourceTexture(this.stage)
                texture.textureSource = v
            } else {
                console.error("Please specify a texture type.");
                return
            }
        }

        const prevTexture = this.__texture;
        if (texture !== prevTexture) {
            this.__texture = texture

            if (this.__texture) {
                if (this.__enabled) {
                    this.__texture.addView(this)
                }

                if (this.__texture.isLoaded() && this.__enabled && this.withinBoundsMargin) {
                    this._setDisplayedTexture(this.__texture)
                }
            } else {
                // Make sure that current texture is cleared when the texture is explicitly set to null.
                this._setDisplayedTexture(null);
            }

            if (prevTexture && prevTexture !== this.__displayedTexture) {
                prevTexture.removeView(this)
            }

            this._updateDimensions()
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

        const prevSource = this.__core.displayedTextureSource ? this.__core.displayedTextureSource._source : undefined
        const sourceChanged = (v ? v._source : undefined) !== prevSource

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
        // We may be dealing with a texture reloading, so we must force update.
        this._setDisplayedTexture(this.__texture);
    };

    onTextureSourceLoadError(e) {
        this.emit('txError', e, this.__texture._source);
    };

    forceRenderUpdate() {
        this.__core.setHasRenderUpdates(3)
    }

    onDisplayedTextureClippingChanged() {
        this._updateDimensions();
        this._updateTextureCoords();
    };

    onPrecisionChanged() {
        this._updateDimensions();
    };

    _updateDimensions() {
        let beforeW = this.__core.rw;
        let beforeH = this.__core.rh;
        let rw = this._getRenderWidth();
        let rh = this._getRenderHeight();
        if (beforeW !== rw || beforeH !== rh) {
            // Due to width/height change: update the translation vector and borders.
            this.__core.setDimensions(rw, rh);
            this._updateLocalTranslate();

            // Returning whether there was an update is handy for extending classes.
            return true
        }
        return false
    }

    _updateLocalTransform() {
        if (this.__rotation !== 0 && this.__rotation % (2 * Math.PI)) {
            // check to see if the rotation is the same as the previous render. This means we only need to use sin and cos when rotation actually changes
            let _sr = Math.sin(this.__rotation);
            let _cr = Math.cos(this.__rotation);

            this.__core.setLocalTransform(
                _cr * this.__scaleX,
                -_sr * this.__scaleY,
                _sr * this.__scaleX,
                _cr * this.__scaleY
            );
        } else {
            this.__core.setLocalTransform(
                this.__scaleX,
                0,
                0,
                this.__scaleY
            );
        }
        this._updateLocalTranslate();
    };

    _updateLocalTranslate() {
        let pivotXMul = this.__pivotX * this.__core.rw;
        let pivotYMul = this.__pivotY * this.__core.rh;
        let px = this.__x - (pivotXMul * this.__core.localTa + pivotYMul * this.__core.localTb) + pivotXMul;
        let py = this.__y - (pivotXMul * this.__core.localTc + pivotYMul * this.__core.localTd) + pivotYMul;
        px -= this.__mountX * this.__core.rw;
        py -= this.__mountY * this.__core.rh;
        this.__core.setLocalTranslate(
            px,
            py
        );
    };

    _updateLocalTranslateDelta(dx, dy) {
        this.__core.addLocalTranslate(dx, dy)
    };

    _updateLocalAlpha() {
        this.__core.setLocalAlpha(this.__visible ? this.__alpha : 0);
    };

    _updateTextureCoords() {
        if (this.displayedTexture && this.displayedTexture.source) {
            let displayedTexture = this.displayedTexture;
            let displayedTextureSource = this.displayedTexture.source;

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
                                break
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
                                break
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
                        let p = this
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
                                break
                            }
                        }
                    });
                }
            } else {
                this.__treeTags.forEach((tagSet, tag) => {
                    let p = this
                    while (!p.__tagRoot && (p = p.__parent)) {
                        if (p.__tagRoot) {
                            // Do not copy all subs.
                        }
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
            return acc.concat(tag.split(' '))
        }, [])

        if (this.__ref) {
            tags.push(this.__ref)
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
                this._throwError("Tag may not start with an upper case character.")
            }

            this._addTag(tag)
        } else {
            const tags = tag.split(' ')
            for (let i = 0, m = tags.length; i < m; i++) {
                const tag = tags[i]

                if (Utils.isUcChar(tag.charCodeAt(0))) {
                    this._throwError("Tag may not start with an upper case character.")
                }

                this._addTag(tag)
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
            } while (p = p.__parent);
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
            } while (p = p.__parent);
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
            Base.patchObject(t[i], settings)
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
        const results = this.select(path)
        if (results.length) {
            return results[0]
        } else {
            return undefined
        }
    }

    select(path) {
        if (path.indexOf(",") !== -1) {
            let selectors = path.split(',')
            let res = []
            for (let i = 0; i < selectors.length; i++) {
                res = res.concat(this._select(selectors[i]))
            }
            return res
        } else {
            return this._select(path)
        }
    }

    _select(path) {
        if (path === "") return [this]


        let pointIdx = path.indexOf(".")
        let arrowIdx = path.indexOf(">")
        if (pointIdx === -1 && arrowIdx === -1) {
            // Quick case.
            if (Utils.isUcChar(path.charCodeAt(0))) {
                const ref = this.getByRef(path)
                return ref ? [ref] : []
            } else {
                return this.mtag(path)
            }
        }

        // Detect by first char.
        let isRef
        if (arrowIdx === 0) {
            isRef = true
            path = path.substr(1)
        } else if (pointIdx === 0) {
            isRef = false
            path = path.substr(1)
        } else {
            const firstCharcode = path.charCodeAt(0)
            isRef = Utils.isUcChar(firstCharcode)
        }

        return this._selectChilds(path, isRef)
    }

    _selectChilds(path, isRef) {
        const pointIdx = path.indexOf(".")
        const arrowIdx = path.indexOf(">")

        if (pointIdx === -1 && arrowIdx === -1) {
            if (isRef) {
                const ref = this.getByRef(path)
                return ref ? [ref] : []
            } else {
                return this.mtag(path)
            }
        }

        if ((arrowIdx === -1) || (pointIdx !== -1 && pointIdx < arrowIdx)) {
            let next
            const str = path.substr(0, pointIdx)
            if (isRef) {
                const ref = this.getByRef(str)
                next = ref ? [ref] : []
            } else {
                next = this.mtag(str)
            }
            let total = []
            const subPath = path.substr(pointIdx + 1)
            for (let i = 0, n = next.length; i < n; i++) {
                total = total.concat(next[i]._selectChilds(subPath, false))
            }
            return total
        } else {
            let next
            const str = path.substr(0, arrowIdx)
            if (isRef) {
                const ref = this.getByRef(str)
                next = ref ? [ref] : []
            } else {
                next = this.mtag(str)
            }
            let total = []
            const subPath = path.substr(arrowIdx + 1)
            for (let i = 0, n = next.length; i < n; i++) {
                total = total.concat(next[i]._selectChilds(subPath, true))
            }
            return total
        }
    }

    getByRef(ref) {
        return this.childList.getByRef(ref)
    }

    getLocationString() {
        let i;
        i = this.__parent ? this.__parent._children.getIndex(this) : "R";
        let localTags = this.getTags();
        let str = this.__parent ? this.__parent.getLocationString(): ""
        if (this.ref) {
            str += ":[" + i + "]" + this.ref
        } else if (localTags.length) {
            str += ":[" + i + "]" + localTags.join(",")
        } else {
            str += ":[" + i + "]#" + this.id
        }
        return str
    }

    toString() {
        let obj = this.getSettings();
        return View.getPrettyString(obj, "");
    };

    static getPrettyString(obj, indent) {
        let children = obj.children;
        delete obj.children;


        // Convert singular json settings object.
        let colorKeys = ["color", "colorUl", "colorUr", "colorBl", "colorBr"]
        let str = JSON.stringify(obj, function (k, v) {
            if (colorKeys.indexOf(k) !== -1) {
                return "COLOR[" + v.toString(16) + "]";
            }
            return v;
        });
        str = str.replace(/"COLOR\[([a-f0-9]{1,8})\]"/g, "0x$1");

        if (children) {
            let childStr = ""
            if (Utils.isObjectLiteral(children)) {
                let refs = Object.keys(children)
                childStr = ""
                for (let i = 0, n = refs.length; i < n; i++) {
                    childStr += `\n${indent}  "${refs[i]}":`
                    delete children[refs[i]].ref
                    childStr += View.getPrettyString(children[refs[i]], indent + "  ") + (i < n - 1 ? "," : "")
                }
                let isEmpty = (str === "{}");
                str = str.substr(0, str.length - 1) + (isEmpty ? "" : ",") + childStr + "\n" + indent + "}"
            } else {
                let n = children.length;
                childStr = "["
                for (let i = 0; i < n; i++) {
                    childStr += View.getPrettyString(children[i], indent + "  ") + (i < n - 1 ? "," : "") + "\n"
                }
                childStr += indent + "]}";
                let isEmpty = (str === "{}");
                str = str.substr(0, str.length - 1) + (isEmpty ? "" : ",") + "\"children\":\n" + indent + childStr + "}"
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
                let missing = false
                for (let i = 0; i < n; i++) {
                    childArray.push(children[i].getSettings());
                    missing = missing || !children[i].ref
                }

                if (!missing) {
                    settings.children = {}
                    childArray.forEach(child => {
                        settings.children[child.ref] = child
                    })
                } else {
                    settings.children = childArray
                }
            }
        }

        settings.id = this.id;

        return settings;
    }

    getNonDefaults() {
        let settings = {};

        if (this.constructor !== View) {
            settings.type = this.constructor.name
        }

        if (this.__ref) {
            settings.ref = this.__ref
        }

        if (this.__tags && this.__tags.length) {
            settings.tags = this.__tags;
        }

        if (this.__x !== 0) settings.x = this.__x;
        if (this.__y !== 0) settings.y = this.__y;
        if (this.__w !== 0) settings.w = this.__w;
        if (this.__h !== 0) settings.h = this.__h;

        if (this.__scaleX === this.__scaleY) {
            if (this.__scaleX !== 1) settings.scale = this.__scaleX;
        } else {
            if (this.__scaleX !== 1) settings.scaleX = this.__scaleX;
            if (this.__scaleY !== 1) settings.scaleY = this.__scaleY;
        }

        if (this.__pivotX === this.__pivotY) {
            if (this.__pivotX !== 0.5) settings.pivot = this.__pivotX;
        } else {
            if (this.__pivotX !== 0.5) settings.pivotX = this.__pivotX;
            if (this.__pivotY !== 0.5) settings.pivotY = this.__pivotY;
        }

        if (this.__mountX === this.__mountY) {
            if (this.__mountX !== 0) settings.mount = this.__mountX;
        } else {
            if (this.__mountX !== 0) settings.mountX = this.__mountX;
            if (this.__mountY !== 0) settings.mountY = this.__mountY;
        }

        if (this.__alpha !== 1) settings.alpha = this.__alpha;

        if (this.__rotation !== 0) settings.rotation = this.__rotation;

        if (this.__core.colorUl === this.__core.colorUr && this.__core.colorBl === this.__core.colorBr && this.__core.colorUl === this.__core.colorBl) {
            if (this.__core.colorUl !== 0xFFFFFFFF) settings.color = this.__core.colorUl.toString(16);
        } else {
            if (this.__core.colorUl !== 0xFFFFFFFF) settings.colorUl = this.__core.colorUl.toString(16);
            if (this.__core.colorUr !== 0xFFFFFFFF) settings.colorUr = this.__core.colorUr.toString(16);
            if (this.__core.colorBl !== 0xFFFFFFFF) settings.colorBl = this.__core.colorBl.toString(16);
            if (this.__core.colorBr !== 0xFFFFFFFF) settings.colorBr = this.__core.colorBr.toString(16);
        }

        if (!this.__visible) settings.visible = false;

        if (this.__core.zIndex) settings.zIndex = this.__core.zIndex;

        if (this.__core.forceZIndexContext) settings.forceZIndexContext = true;

        if (this.__core.clipping) settings.clipping = this.__core.clipping;

        if (this.__core.clipbox) settings.clipbox = this.__core.clipbox;

        if (this.__texture) {
            let tnd = this.__texture.getNonDefaults();
            if (Object.keys(tnd).length) {
                settings.texture = tnd;
            }
        }

        if (this._texturizer) {
            if (this.texturizer.enabled) {
                settings.renderToTexture = this.texturizer.enabled
            }
            if (this.texturizer.lazy) {
                settings.renderToTextureLazy = this._texturizer.lazy
            }
            if (this._texturizer.colorize) {
                settings.colorizeResultTexture = this._texturizer.colorize
            }
            if (this._texturizer.hideResult) {
                settings.hideResultTexture = this._texturizer.hideResult
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
        return this.__core._withinBoundsMargin
    }

    _enableWithinBoundsMargin() {
        // Iff enabled, this toggles the active flag.
        if (this.__enabled) {
            // This must happen before enabling the texture, because it may already be loaded or load directly.
            if (this.__texture) {
                this.__texture.incWithinBoundsCount()
            }

            this._setActiveFlag()
        }
    }

    _disableWithinBoundsMargin() {
        // Iff active, this toggles the active flag.
        if (this.__active) {
            this._unsetActiveFlag()

            if (this.__texture) {
                this.__texture.decWithinBoundsCount()
            }
        }
    }

    set boundsMargin(v) {
        if (!Array.isArray(v) && v !== null && v !== undefined) {
            throw new Error("boundsMargin should be an array of top-right-bottom-left values, null (no margin) or undefined (inherit margin)")
        }
        this.__core.boundsMargin = v
    }

    get boundsMargin() {
        return this.__core.boundsMargin
    }

    get x() {
        return this.__x
    }

    set x(v) {
        if (this.__x !== v) {
            this._updateLocalTranslateDelta(v - this.__x, 0)
            this.__x = v
        }
    }

    get y() {
        return this.__y
    }

    set y(v) {
        if (this.__y !== v) {
            this._updateLocalTranslateDelta(0, v - this.__y)
            this.__y = v
        }
    }

    get w() {
        return this.__w
    }

    set w(v) {
        if (this.__w !== v) {
            this.__w = v
            this._updateDimensions()
        }
    }

    get h() {
        return this.__h
    }

    set h(v) {
        if (this.__h !== v) {
            this.__h = v
            this._updateDimensions()
        }
    }

    get scaleX() {
        return this.__scaleX
    }

    set scaleX(v) {
        if (this.__scaleX !== v) {
            this.__scaleX = v
            this._updateLocalTransform()
        }
    }

    get scaleY() {
        return this.__scaleY
    }

    set scaleY(v) {
        if (this.__scaleY !== v) {
            this.__scaleY = v
            this._updateLocalTransform()
        }
    }

    get scale() {
        return this.__scaleX
    }

    set scale(v) {
        if (this.__scaleX !== v || this.__scaleY !== v) {
            this.__scaleX = v
            this.__scaleY = v
            this._updateLocalTransform()
        }
    }

    get pivotX() {
        return this.__pivotX
    }

    set pivotX(v) {
        if (this.__pivotX !== v) {
            this.__pivotX = v
            this._updateLocalTranslate()
        }
    }

    get pivotY() {
        return this.__pivotY
    }

    set pivotY(v) {
        if (this.__pivotY !== v) {
            this.__pivotY = v
            this._updateLocalTranslate()
        }
    }

    get pivot() {
        return this.__pivotX
    }

    set pivot(v) {
        if (this.__pivotX !== v || this.__pivotY !== v) {
            this.__pivotX = v;
            this.__pivotY = v;
            this._updateLocalTranslate()
        }
    }

    get mountX() {
        return this.__mountX
    }

    set mountX(v) {
        if (this.__mountX !== v) {
            this.__mountX = v
            this._updateLocalTranslate()
        }
    }

    get mountY() {
        return this.__mountY
    }

    set mountY(v) {
        if (this.__mountY !== v) {
            this.__mountY = v
            this._updateLocalTranslate()
        }
    }

    get mount() {
        return this.__mountX
    }

    set mount(v) {
        if (this.__mountX !== v || this.__mountY !== v) {
            this.__mountX = v
            this.__mountY = v
            this._updateLocalTranslate()
        }
    }

    get alpha() {
        return this.__alpha
    }

    set alpha(v) {
        // Account for rounding errors.
        v = (v > 1 ? 1 : (v < 1e-14 ? 0 : v));
        if (this.__alpha !== v) {
            let prev = this.__alpha
            this.__alpha = v
            this._updateLocalAlpha();
            if ((prev === 0) !== (v === 0)) {
                this._updateEnabledFlag()
            }
        }
    }

    get rotation() {
        return this.__rotation
    }

    set rotation(v) {
        if (this.__rotation !== v) {
            this.__rotation = v
            this._updateLocalTransform()
        }
    }

    get colorUl() {
        return this.__core.colorUl
    }

    set colorUl(v) {
        this.__core.colorUl = v;
    }

    get colorUr() {
        return this.__core.colorUr
    }

    set colorUr(v) {
        this.__core.colorUr = v;
    }

    get colorBl() {
        return this.__core.colorBl
    }

    set colorBl(v) {
        this.__core.colorBl = v;
    }

    get colorBr() {
        return this.__core.colorBr
    }

    set colorBr(v) {
        this.__core.colorBr = v;
    }

    get color() {
        return this.__core.colorUl
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
        return this.colorUl
    }

    set colorTop(v) {
        if (this.colorUl !== v || this.colorUr !== v) {
            this.colorUl = v;
            this.colorUr = v;
        }
    }

    get colorBottom() {
        return this.colorBl
    }

    set colorBottom(v) {
        if (this.colorBl !== v || this.colorBr !== v) {
            this.colorBl = v;
            this.colorBr = v;
        }
    }

    get colorLeft() {
        return this.colorUl
    }

    set colorLeft(v) {
        if (this.colorUl !== v || this.colorBl !== v) {
            this.colorUl = v;
            this.colorBl = v;
        }
    }

    get colorRight() {
        return this.colorUr
    }

    set colorRight(v) {
        if (this.colorUr !== v || this.colorBr !== v) {
            this.colorUr = v;
            this.colorBr = v;
        }
    }

    get visible() {
        return this.__visible
    }

    set visible(v) {
        if (this.__visible !== v) {
            this.__visible = v
            this._updateLocalAlpha()
            this._updateEnabledFlag()
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
            this.__childList = new ViewChildList(this, false)
        }
        return this.__childList
    }

    get childList() {
        if (!this._allowChildrenAccess()) {
            this._throwError("Direct access to children is not allowed in " + this.getLocationString())
        }
        return this._children
    }

    hasChildren() {
        return this._allowChildrenAccess() && this.__childList && (this.__childList.length > 0)
    }

    _allowChildrenAccess() {
        return true
    }

    get children() {
        return this.childList.get()
    }

    set children(children) {
        this.childList.patch(children)
    }

    add(o) {
        return this.childList.a(o);
    }

    get parent() {
        return this.__parent;
    }

    get src() {
        if (this.texture && this.texture instanceof ImageTexture) {
            return this.texture._src
        } else {
            return undefined
        }
    }

    set src(v) {
        this.texture = new ImageTexture(this.stage)
        this.texture.src = v
    }

    set mw(v) {
        if (this.texture) {
            this.texture.mw = v
        } else {
            this._throwError('Please set mw after setting a texture.')
        }
    }

    set mh(v) {
        if (this.texture) {
            this.texture.mh = v
        } else {
            this._throwError('Please set mh after setting a texture.')
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
            this.texture = new TextTexture(this.stage)

            if (!this.texture.w && !this.texture.h) {
                // Inherit dimensions from view.
                // This allows userland to set dimensions of the View and then later specify the text.
                this.texture.w = this.w
                this.texture.h = this.h
            }
        }
        return this.texture
    }

    get text() {
        if (this.texture && (this.texture instanceof TextTexture)) {
            return this.texture
        } else {
            return undefined
        }
    }

    set text(v) {
        if (!this.texture || !(this.texture instanceof TextTexture)) {
            this.enableTextTexture()
        }
        if (Utils.isString(v)) {
            this.texture.text = v
        } else {
            this.texture.patch(v)
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

    get shader() {
        return this.__core.shader;
    }

    set shader(v) {
        let shader;
        if (Utils.isObjectLiteral(v)) {
            if (v.type) {
                shader = new v.type(this.stage.ctx)
            } else {
                shader = this.shader
            }

            if (shader) {
                Base.patchObject(shader, v)
            }
        } else if (v === null) {
            shader = this.stage.ctx.renderState.defaultShader;
        } else if (v === undefined) {
            shader = null;
        } else {
            if (v.isShader) {
                shader = v;
            } else {
                console.error("Please specify a shader type.");
                return
            }
        }

        if (this.__enabled && this.__core.shader) {
            this.__core.shader.removeView(this);
        }

        this.__core.shader = shader;

        if (this.__enabled && this.__core.shader) {
            this.__core.shader.addView(this);
        }
    }

    _hasTexturizer() {
        return !!this.__core._texturizer
    }

    get renderToTexture() {
        return this._hasTexturizer() && this.texturizer.enabled
    }

    set renderToTexture(v) {
        this.texturizer.enabled = v
    }

    get renderToTextureLazy() {
        return this._hasTexturizer() && this.texturizer.lazy
    }

    set renderToTextureLazy(v) {
        this.texturizer.lazy = v
    }

    get hideResultTexture() {
        return this._hasTexturizer() && this.texturizer.hideResult
    }

    set hideResultTexture(v) {
        this.texturizer.hideResult = v
    }

    get colorizeResultTexture() {
        return this._hasTexturizer() && this.texturizer.colorize
    }

    set colorizeResultTexture(v) {
        this.texturizer.colorize = v
    }

    get filters() {
        return this._hasTexturizer() && this.texturizer.filters
    }

    set filters(v) {
        if (this.__enabled) {
            this.texturizer.filters.forEach(filter => filter.removeView(this.__core))
        }

        this.texturizer.filters = v

        if (this.__enabled) {
            this.texturizer.filters.forEach(filter => filter.addView(this.__core))
        }
    }

    getTexture() {
        return this.texturizer._getTextureSource()
    }

    get texturizer() {
        return this.__core.texturizer
    }

    patch(settings, createMode = false) {
        let paths = Object.keys(settings)

        if (settings.hasOwnProperty("__create")) {
            createMode = settings["__create"]
        }

        for (let i = 0, n = paths.length; i < n; i++) {
            let path = paths[i]
            const v = settings[path]

            let pointIdx = path.indexOf(".")
            let arrowIdx = path.indexOf(">")
            if (arrowIdx === -1 && pointIdx === -1) {
                const firstCharCode = path.charCodeAt(0)
                if (Utils.isUcChar(firstCharCode)) {
                    // Ref.
                    const child = this.getByRef(path)
                    if (!child) {
                        if (v !== undefined) {
                            let subCreateMode = createMode
                            if (Utils.isObjectLiteral(v)) {
                                if (v.hasOwnProperty("__create")) {
                                    subCreateMode = v.__create
                                }
                            }

                            if (subCreateMode === null) {
                                // Ignore.
                            } else if (subCreateMode === true) {
                                // Add to list immediately.
                                let c
                                if (Utils.isObjectLiteral(v)) {
                                    // Catch this case to capture createMode flag.
                                    c = this.childList.createItem(v);
                                    c.patch(v, subCreateMode);
                                } else if (Utils.isObject(v)) {
                                    c = v
                                }
                                if (c.isView) {
                                    c.ref = path
                                }

                                this.childList.a(c)
                            } else {
                                this._throwError("Can't find path: " + path)
                            }
                        }
                    } else {
                        if (v === undefined) {
                            if (child.parent) {
                                child.parent.childList.remove(child)
                            }
                        } else if (Utils.isObjectLiteral(v)) {
                            child.patch(v, createMode)
                        } else if (v.isView) {
                            // Replace view by new view.
                            v.ref = path
                            this.childList.replace(v, child)
                        } else {
                            this._throwError("Unexpected value for path: " + path)
                        }
                    }
                } else {
                    // Property.
                    Base.patchObjectProperty(this, path, v)
                }
            } else {
                // Select path.
                const views = this.select(path)
                if (v === undefined) {
                    for (let i = 0, n = views.length; i < n; i++) {
                        if (views[i].parent) {
                            views[i].parent.childList.remove(views[i])
                        }
                    }
                } else if (Utils.isObjectLiteral(v)) {
                    // Recursive path.
                    for (let i = 0, n = views.length; i < n; i++) {
                        views[i].patch(v, createMode)
                    }
                } else {
                    this._throwError("Unexpected value for path: " + path)
                }
            }
        }
    }

    _throwError(message) {
        throw new Error(this.constructor.name + " (" + this.getLocationString() + "): " + message)
    }


    animation(settings) {
        return this.stage.animations.createAnimation(this, settings);
    }

    transition(property, settings) {
        if (settings === undefined) {
            return this._getTransition(property);
        } else {
            this._setTransition(property, settings);
            // We do not create/return the transition, because it would undo the 'lazy transition creation' optimization.
            return null;
        }
    }

    set transitions(object) {
        let keys = Object.keys(object);
        keys.forEach(property => {
            this.transition(property, object[property]);
        });
    }

    set smooth(object) {
        let keys = Object.keys(object);
        keys.forEach(property => {
            let value = object[property]
            if (Array.isArray(value)) {
                this.setSmooth(property, value[0], value[1])
            } else {
                this.setSmooth(property, value)
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
        return t
    }

    static isColorProperty(property) {
        return property.indexOf("color") >= 0
    }

    static getMerger(property) {
        if (View.isColorProperty(property)) {
            return StageUtils.mergeColors
        } else {
            return StageUtils.mergeNumbers
        }
    }
}

// This gives a slight performance benefit compared to extending EventEmitter.
if (!Utils.isNode) {
    EventEmitter.addAsMixin(View)
}

View.prototype.isView = 1;

View.id = 1;

// Getters reused when referencing view (subobject) properties by a property path, as used in a transition or animation ('x', 'texture.x', etc).
View.PROP_GETTERS = new Map();

// Setters reused when referencing view (subobject) properties by a property path, as used in a transition or animation ('x', 'texture.x', etc).
View.PROP_SETTERS = new Map();



/**
 * Manages a list of objects.
 * Objects may be patched. Then, they can be referenced using the 'ref' (string) property.
 */
class ObjectList {

    constructor() {
        this._items = []
        this._refs = {}
    }

    get() {
        return this._items
    }

    get first() {
        return this._items[0]
    }

    get last() {
        return this._items.length ? this._items[this._items.length - 1] : undefined
    }

    add(item) {
        this.addAt(item, this._items.length);
    }

    addAt(item, index) {
        if (index >= 0 && index <= this._items.length) {
            let currentIndex = this._items.indexOf(item)
            if (currentIndex === index) {
                return item;
            }

            if (currentIndex != -1) {
                this.setAt(item, index)
            } else {
                if (item.ref) {
                    this._refs[item.ref] = item
                }
                this._items.splice(index, 0, item);
                this.onAdd(item, index)
            }
        } else {
            throw new Error('addAt: The index ' + index + ' is out of bounds ' + this._items.length);
        }
    }

    replace(item, prevItem) {
        const index = this.getIndex(prevItem)
        if (index === -1) {
            throw new Error('replace: The previous item does not exist');
        }
        this.setAt(item, index)
    }

    setAt(item, index) {
        if (index >= 0 && index <= this._items.length) {
            let currentIndex = this._items.indexOf(item)
            if (currentIndex != -1) {
                if (currentIndex !== index) {
                    const fromIndex = currentIndex
                    if (fromIndex <= index) {
                        index--
                    }
                    if (fromIndex !== index) {
                        this._items.splice(fromIndex, 1)
                        this._items.splice(index, 0, item)
                        this.onMove(item, fromIndex, index)
                    }
                }
            } else {
                if (index < this._items.length) {
                    if (this._items[index].ref) {
                        this._refs[this._items[index].ref] = undefined
                    }
                }

                const prevItem = this._items[index]

                // Doesn't exist yet: overwrite current.
                this._items[index] = item

                if (item.ref) {
                    this._refs[item.ref] = item
                }

                this.onSet(item, index, prevItem)
            }
        } else {
            throw new Error('setAt: The index ' + index + ' is out of bounds ' + this._items.length);
        }
    }

    getAt(index) {
        return this._items[index]
    }

    getIndex(item) {
        return this._items.indexOf(item)
    }

    remove(item) {
        let index = this._items.indexOf(item)

        if (index !== -1) {
            this.removeAt(index)
        }
    };

    removeAt(index) {
        let item = this._items[index]

        if (item.ref) {
            this._refs[item.ref] = undefined
        }

        this._items.splice(index, 1);

        this.onRemove(item, index)

        return item;
    };

    clear() {
        let n = this._items.length
        if (n) {
            let prev = this._items
            this._items = []
            this._refs = {}
            this.onSync(prev, [], [])
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
        return this._refs
    }

    getByRef(ref) {
        return this._refs[ref]
    }

    clearRef(ref) {
        delete this._refs[ref]
    }

    setRef(ref, child) {
        this._refs[ref] = child
    }

    patch(settings) {
        if (Utils.isObjectLiteral(settings)) {
            this._setByObject(settings)
        } else if (Array.isArray(settings)) {
            this._setByArray(settings)
        }
    }

    _setByObject(settings) {
        // Overrule settings of known referenced items.
        let refs = this._getRefs()
        let crefs = Object.keys(settings)
        for (let i = 0, n = crefs.length; i < n; i++) {
            let cref = crefs[i]
            let s = settings[cref]

            let c = refs[cref]
            if (!c) {
                if (this.isItem(s)) {
                    // Replace previous item
                    s.ref = cref
                    this.add(s)
                } else {
                    // Create new item.
                    c = this.createItem(s)
                    c.ref = cref
                    c.patch(s)
                    this.add(c)
                }
            } else {
                if (this.isItem(s)) {
                    if (c !== s) {
                        // Replace previous item
                        let idx = this.getIndex(c)
                        s.ref = cref
                        this.setAt(s, idx)
                    }
                } else {
                    c.patch(s)
                }
            }
        }
    }

    _equalsArray(array) {
        let same = true
        if (array.length === this._items.length) {
            for (let i = 0, n = this._items.length; (i < n) && same; i++) {
                same = same && (this._items[i] === array[i])
            }
        } else {
            same = false
        }
        return same
    }

    _setByArray(array) {
        // For performance reasons, first check if the arrays match exactly and bail out if they do.
        if (this._equalsArray(array)) {
            return
        }

        for (let i = 0, n = this._items.length; i < n; i++) {
            this._items[i].marker = true
        }

        let refs
        let newItems = []
        for (let i = 0, n = array.length; i < n; i++) {
            let s = array[i]
            if (this.isItem(s)) {
                s.marker = false
                newItems.push(s)
            } else {
                let cref = s.ref
                let c
                if (cref) {
                    if (!refs) refs = this._getRefs()
                    c = refs[cref]
                }

                if (!c) {
                    // Create new item.
                    c = this.createItem(s)
                } else {
                    c.marker = false
                }

                c.patch(s)
                newItems.push(c)
            }
        }

        this._setItems(newItems)
    }

    _setItems(newItems) {
        let prevItems = this._items
        this._items = newItems

        // Remove the items.
        let removed = prevItems.filter(item => {let m = item.marker; delete item.marker; return m})
        let added = newItems.filter(item => (prevItems.indexOf(item) === -1))

        if (removed.length || added.length) {
            // Recalculate refs.
            this._refs = {}
            for (let i = 0, n = this._items.length; i < n; i++) {
                let ref = this._items[i].ref
                if (ref) {
                    this._refs[ref] = this._items[i]
                }
            }
        }

        this.onSync(removed, added, newItems)
    }

    sort(f) {
        const items = this._items.slice()
        items.sort(f)
        this._setByArray(items)
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
        throw new Error("ObjectList.createItem must create and return a new object")
    }

    isItem(object) {
        return false
    }

}



/**
 * Manages the list of children for a view.
 */


class ViewChildList extends ObjectList {

    constructor(view) {
        super()
        this._view = view
    }

    _connectParent(item) {
        const prevParent = item.parent
        if (prevParent && prevParent !== this._view) {
            // Cleanup in previous child list, without
            const prevChildList = item.parent.childList
            const index = prevChildList.getIndex(item)

            if (item.ref) {
                prevChildList._refs[item.ref] = undefined
            }
            prevChildList._items.splice(index, 1);

            // Also clean up view core.
            prevParent.core.removeChildAt(index)

        }

        item._setParent(this._view)

        // We are expecting the caller to sync it to the core.
    }

    onAdd(item, index) {
        this._connectParent(item)
        this._view.core.addChildAt(index, item.core)
    }

    onRemove(item, index) {
        item._setParent(null)
        this._view.core.removeChildAt(index)
    }

    onSync(removed, added, order) {
        for (let i = 0, n = removed.length; i < n; i++) {
            removed[i]._setParent(null)
        }
        for (let i = 0, n = added.length; i < n; i++) {
            this._connectParent(added[i])
        }
        let gc = i => i.core
        this._view.core.syncChildren(removed.map(gc), added.map(gc), order.map(gc))
    }

    onSet(item, index, prevItem) {
        prevItem._setParent(null)

        this._connectParent(item)
        this._view.core.setChildAt(index, item.core)
    }

    onMove(item, fromIndex, toIndex) {
        this._view.core.moveChild(fromIndex, toIndex)
    }

    createItem(object) {
        if (object.type) {
            return new object.type(this._view.stage)
        } else {
            return this._view.stage.createView()
        }
    }

    isItem(object) {
        return object.isView
    }

}



/**
 * Copyright Metrological, 2017
 */

class ViewTexturizer {

    constructor(viewCore) {

        this._view = viewCore.view
        this._core = viewCore

        this.ctx = this._core.ctx

        this._enabled = false
        this.lazy = false
        this._colorize = false

        this._filters = []

        this._renderTexture = null

        this._renderTextureReused = false

        this._resultTexture = null

        this._resultTextureSource = null

        this._renderToTextureEnabled = false

        this._hideResult = false

        this.filterResultCached = false

        this.empty = false
    }

    get enabled() {
        return this._enabled
    }

    set enabled(v) {
        this._enabled = v
        this._core.updateRenderToTextureEnabled()
    }

    get hideResult() {
        return this._hideResult
    }

    set hideResult(v) {
        this._hideResult = v
        this._core.setHasRenderUpdates(1);
    }

    get colorize() {
        return this._colorize
    }

    set colorize(v) {
        if (this._colorize !== v) {
            this._colorize = v

            // Only affects the finally drawn quad.
            this._core.setHasRenderUpdates(1)
        }
    }

    get filters() {
        return this._filters
    }

    set filters(v) {
        this._clearFilters();
        v.forEach(filter => {
            if (Utils.isObjectLiteral(filter) && filter.type) {
                let s = new filter.type(this.ctx)
                s.patch(filter)
                filter = s
            }

            if (filter.isFilter) {
                this._addFilter(filter);
            } else {
                console.error("Please specify a filter type.");
            }
        })

        this._core.updateRenderToTextureEnabled();
        this._core.setHasRenderUpdates(2);
    }

    _clearFilters() {
        this._filters = []
        this.filterResultCached = false
    }

    _addFilter(filter) {
        this._filters.push(filter);
    }

    _hasFilters() {
        return (this._filters.length > 0);
    }

    _hasActiveFilters() {
        for (let i = 0, n = this._filters.length; i < n; i++) {
            if (!this._filters[i].useDefault()) return true
        }
        return false
    }

    getActiveFilters() {
        let activeFilters = []
        this._filters.forEach(filter => {
            if (!filter.useDefault()) {
                if (filter.getFilters) {
                    filter.getFilters().forEach(f => activeFilters.push(f))
                } else {
                    activeFilters.push(filter)
                }
            }
        })
        return activeFilters
    }

    getTexture() {
        return this.ctx.stage.texture(this._getTextureSource(), {precision: this._getTextureSource().precision});
    }

    _getTextureSource() {
        if (!this._resultTextureSource) {
            this._resultTextureSource = new TextureSource(this._view.stage.textureManager);
            this.updateResultTexture()
        }
        return this._resultTextureSource
    }

    updateResultTexture() {
        let resultTexture = this.getResultTexture()
        if (this._resultTextureSource) {
            if (this._resultTextureSource.glTexture !== resultTexture) {
                let w = resultTexture ? resultTexture.w : 0
                let h = resultTexture ? resultTexture.h : 0
                this._resultTextureSource.replaceGlTexture(resultTexture, w, h)
            }

            // Texture will be updated: all views using the source need to be updated as well.
            this._resultTextureSource.forEachView(view => {
                view._updateDimensions()
                view.core.setHasRenderUpdates(3)
            })
        }
    }

    mustRenderToTexture() {
        // Check if we must really render as texture.
        if (this._enabled && !this.lazy) {
            return true
        } else if (this._enabled && this.lazy && this._core._hasRenderUpdates < 3) {
            // Static-only: if renderToTexture did not need to update during last drawn frame, generate it as a cache.
            return true
        } else if (this._hasActiveFilters()) {
            // Only render as texture if there is at least one filter shader to be applied.
            return true
        }
        return false
    }

    deactivate() {
        this.release()
    }

    get renderTextureReused() {
        return this._renderTextureReused
    }

    release() {
        this.releaseRenderTexture()
        this.releaseFilterTexture()
    }

    releaseRenderTexture() {
        if (this._renderTexture) {
            if (!this._renderTextureReused) {
                this.ctx.releaseRenderTexture(this._renderTexture)
            }
            this._renderTexture = null
            this._renderTextureReused = false
            this.updateResultTexture()
        }
    }

    // Reuses the specified texture as the render texture.
    reuseTextureAsRenderTexture(glTexture) {
        if (this._renderTexture !== glTexture) {
            this.releaseRenderTexture()
            this._renderTexture = glTexture
            this._renderTextureReused = true
        }
    }

    hasRenderTexture() {
        return !!this._renderTexture
    }

    getRenderTexture() {
        if (!this._renderTexture) {
            this._renderTexture = this.ctx.allocateRenderTexture(this._core._rw, this._core._rh);
            this._renderTextureReused = false
        }
        return this._renderTexture;
    }

    getFilterTexture() {
        if (!this._resultTexture) {
            this._resultTexture = this.ctx.allocateRenderTexture(this._core._rw, this._core._rh);
        }
        return this._resultTexture;
    }

    releaseFilterTexture() {
        if (this._resultTexture) {
            this.ctx.releaseRenderTexture(this._resultTexture)
            this._resultTexture = null
            this.filterResultCached = false
            this.updateResultTexture()
        }
    }

    getResultTexture() {
        return this._hasActiveFilters() ? this._resultTexture : this._renderTexture
    }

}


/**
 * Graphical calculations / VBO buffer filling.
 */

class ViewCore {

    constructor(view) {
        this._view = view;

        this.ctx = view.stage.ctx;

        this.renderState = this.ctx.renderState;

        this._parent = null;

        this._hasUpdates = false

        this._hasRenderUpdates = 0;

        this._onUpdate = undefined;

        this._onAfterUpdate = undefined;

        this._onAfterCalcs = undefined;

        this._recalc = 0;

        this._pRecalc = 0;

        this._updateTreeOrder = 0;

        this._worldContext = new ViewCoreContext()

        this._renderContext = this._worldContext

        // All local translation/transform updates: directly propagated from x/y/w/h/scale/whatever.
        this._localPx = 0;
        this._localPy = 0;

        this._localTa = 1;
        this._localTb = 0;
        this._localTc = 0;
        this._localTd = 1;

        this._isComplex = false;

        this._localAlpha = 1;

        this._rw = 0;
        this._rh = 0;

        this._clipping = false;

        /**
         * The texture source to be displayed.
         * @type {TextureSource}
         */
        this._displayedTextureSource = null;

        this._colorUl = this._colorUr = this._colorBl = this._colorBr = 0xFFFFFFFF;

        this._txCoordsUl = 0x00000000;
        this._txCoordsUr = 0x0000FFFF;
        this._txCoordsBr = 0xFFFFFFFF;
        this._txCoordsBl = 0xFFFF0000;

        this._ulx = 0;
        this._uly = 0;
        this._brx = 1;
        this._bry = 1;

        this._zIndex = 0;
        this._forceZIndexContext = false;
        this._zContextUsage = 0;
        this._zParent = null;
        this._zSort = false;

        this._isRoot = false;

        this._children = null;

        this._zIndexedChildren = null;

        /**
         * Iff true, during zSort, this view should be 're-sorted' because either:
         * - zIndex did chang
         * - zParent did change
         * - view was moved in the render tree
         * @type {boolean}
         */
        this._zIndexResort = false;

        this._shader = null;

        // The ancestor ViewCore that owns the inherited shader. Null if none is active (default shader).
        this._shaderOwner = null;

        // View is rendered on another texture.
        this._renderToTextureEnabled = false;

        this._texturizer = null

        this._useRenderToTexture = false

        this._outOfBounds = 0

        this._boundsMargin = undefined

        this._recBoundsMargin = undefined

        this._withinBoundsMargin = false

        this._scissor = undefined

        this._viewport = undefined

        this._clipbox = false

        this.render = this._renderSimple
    }

    /**
     * @param {number} type
     * 0: no updates
     * 1: re-invoke shader
     * 2: re-invoke filter
     * 3: re-create render texture and re-invoke shader and filter
     */
    setHasRenderUpdates(type) {
        if (this._worldContext.alpha) {
            // Ignore if 'world invisible'. Render updates will be reset to 3 for every view that becomes visible.
            let p = this;
            p._hasRenderUpdates = Math.max(type, p._hasRenderUpdates);
            while ((p = p._parent) && (p._hasRenderUpdates != 3)) {
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
     */
    _setRecalc(type) {
        this._recalc |= type;

        this._setHasUpdates()

        // Any changes in descendants should trigger texture updates.
        if (this._parent) {
            this._parent.setHasRenderUpdates(3);
        }
    }

    _setHasUpdates() {
        let p = this
        while(p && !p._hasUpdates) {
            p._hasUpdates = true
            p = p._parent
        }
    }

    setParent(parent) {
        if (parent !== this._parent) {
            let prevIsZContext = this.isZContext();
            let prevParent = this._parent;
            this._parent = parent;

            if (prevParent) {
                // When views are deleted, the render texture must be re-rendered.
                prevParent.setHasRenderUpdates(3);
            }

            this._setRecalc(1 + 2 + 4);

            if (this._parent) {
                // Force parent to propagate hasUpdates flag.
                this._parent._setHasUpdates()
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
            this._zIndexResort = true
            if (this._zParent) {
                this._zParent.enableZSort()
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
            this._zSort = true
            if (force) {
                // ZSort must be done, even if this view is invisible.
                // This is done to prevent memory leaks when removing views from inactive render branches.
                this.ctx.forceZSort(this)
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
        this._children[index].setParent(null)
        this._children[index] = child
        child.setParent(this)
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
        this._children = order
        for (let i = 0, n = removed.length; i < n; i++) {
            removed[i].setParent(null)
        }
        for (let i = 0, n = added.length; i < n; i++) {
            added[i].setParent(this)
        }
    }

    moveChild(fromIndex, toIndex) {
        let c = this._children[fromIndex]
        this._children.splice(fromIndex, 1);
        this._children.splice(toIndex, 0, c);

        // Tree order changed: must resort!
        this._zIndexResort = true
        if (this._zParent) {
            this._zParent.enableZSort()
        }
    }

    setLocalTransform(a, b, c, d) {
        this._setRecalc(4);
        this._localTa = a;
        this._localTb = b;
        this._localTc = c;
        this._localTd = d;
        this._isComplex = (b != 0) || (c != 0);
    };

    setLocalTranslate(x, y) {
        this._setRecalc(2);
        this._localPx = x;
        this._localPy = y;
    };

    addLocalTranslate(dx, dy) {
        this.setLocalTranslate(this._localPx + dx, this._localPy + dy);
    }

    setLocalAlpha(a) {
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

    setDimensions(w, h) {
        this._rw = w;
        this._rh = h;
        this._setRecalc(2);
        if (this._texturizer) {
            this._texturizer.releaseRenderTexture();
            this._texturizer.releaseFilterTexture();
            this._texturizer.updateResultTexture()
        }
    };

    setTextureCoords(ulx, uly, brx, bry) {
        this.setHasRenderUpdates(3);

        this._ulx = ulx;
        this._uly = uly;
        this._brx = brx;
        this._bry = bry;

        ulx = Math.max(0, ulx)
        uly = Math.max(0, uly)
        brx = Math.min(1, brx)
        bry = Math.min(1, bry)

        this._txCoordsUl = ((ulx * 65535 + 0.5) | 0) + ((uly * 65535 + 0.5) | 0) * 65536;
        this._txCoordsUr = ((brx * 65535 + 0.5) | 0) + ((uly * 65535 + 0.5) | 0) * 65536;
        this._txCoordsBl = ((ulx * 65535 + 0.5) | 0) + ((bry * 65535 + 0.5) | 0) * 65536;
        this._txCoordsBr = ((brx * 65535 + 0.5) | 0) + ((bry * 65535 + 0.5) | 0) * 65536;
    };

    get displayedTextureSource() {
        return this._displayedTextureSource
    }

    setDisplayedTextureSource(textureSource) {
        this.setHasRenderUpdates(3);
        this._displayedTextureSource = textureSource;
    };

    get isRoot() {
        return this._isRoot
    }

    setAsRoot() {
        // Use parent dummy.
        this._parent = new ViewCore(this._view)

        // After setting root, make sure it's updated.
        this._parent._hasRenderUpdates = 3
        this._parent._hasUpdates = true

        // Root is, and will always be, the primary zContext.
        this._isRoot = true

        this.ctx.root = this

        // Set scissor area of 'fake parent' to stage's viewport.
        this._parent._viewport = [0, 0, this.ctx.stage.rw, this.ctx.stage.rh]
        this._parent._scissor = this._parent._viewport

        // We use a default of 100px bounds margin to detect images around the edges.
        this._parent._recBoundsMargin = [100, 100, 100, 100]

        // Default: no bounds margin.
        this._parent._boundsMargin = null

        this._setRecalc(1 + 2 + 4)
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
                this._zParent.enableZSort()
            }

            if (newZParent !== null) {
                let hadZContextUsage = (newZParent._zContextUsage > 0);

                // @pre: new parent's children array has already been modified.
                if (this._zIndex !== 0) {
                    newZParent.incZContextUsage();
                }

                if (newZParent._zContextUsage > 0) {
                    if (!hadZContextUsage && (this._parent === newZParent)) {
                        // This child was already in the children list.
                        // Do not add double.
                    } else {
                        // Add new child to array.
                        newZParent._zIndexedChildren.push(this);
                    }

                    // Order should be checked.
                    newZParent.enableZSort()
                }
            }

            this._zParent = newZParent;

            // Newly added view must be marked for resort.
            this._zIndexResort = true
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
                this._zSort = false
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
            this._zIndexResort = true
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
            const results = this._getZIndexedDescs()
            results.forEach((c) => {
                if (this.isAncestorOf(c) && c._zIndex !== 0) {
                    c.setZParent(this);
                }
            });
        }
    }

    _getZIndexedDescs() {
        const results = []
        if (this._children) {
            for (let i = 0, n = this._children.length; i < n; i++) {
                this._children[i]._getZIndexedDescsRec(results)
            }
        }
        return results
    }

    _getZIndexedDescsRec(results) {
        if (this._zIndex) {
            results.push(this)
        } else if (this._children && !this.isZContext()) {
            for (let i = 0, n = this._children.length; i < n; i++) {
                this._children[i]._getZIndexedDescsRec(results)
            }
        }
    }

    disableZContext() {
        // Transfer from this z context to upper z context.
        if (this._zContextUsage > 0) {
            let newZParent = this._parent.findZContext();

            // Make sure that z-indexed children are up to date (old ones removed).
            if (this._zSort) {
                this.sortZIndexedChildren()
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
    }

    set onAfterUpdate(f) {
        this._onAfterUpdate = f;
    }

    set onAfterCalcs(f) {
        this._onAfterCalcs = f
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
        return this._clipping
    }

    set clipping(v) {
        if (this._clipping !== v) {
            this._clipping = v

            // Force update of scissor by updating translate.
            // Alpha must also be updated because the scissor area may have been empty.
            this._setRecalc(1 + 2)
        }
    }

    get clipbox() {
        return this._clipbox
    }

    set clipbox(v) {
        // In case of out-of-bounds view, all children will also be ignored.
        // It will save us from executing the update/render loops for those.
        // The optimization will be used immediately during the next frame.
        this._clipbox = v
    }

    _setShaderOwnerRecursive(viewCore) {
        this._shaderOwner = viewCore;

        if (this._children && !this._renderToTextureEnabled) {
            for (let i = 0, n = this._children.length; i < n; i++) {
                let c = this._children[i]
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
                let c = this._children[i]
                if (!c._shader) {
                    c._setShaderOwnerRecursive(viewCore);
                    c._hasRenderUpdates = 3;
                }
            }
        }
    };

    _hasRenderContext() {
        return this._renderContext !== this._worldContext
    }

    updateRenderToTextureEnabled() {
        // Enforce texturizer initialisation.
        let v = (this.texturizer._hasFilters() || this.texturizer._enabled)

        if (v) {
            this._enableRenderToTexture()
        } else {
            this._disableRenderToTexture()
            this._texturizer.releaseRenderTexture()
        }
    }

    _enableRenderToTexture() {
        if (!this._renderToTextureEnabled) {
            let prevIsZContext = this.isZContext()

            this._renderToTextureEnabled = true

            this._renderContext = new ViewCoreContext()

            // If render to texture is active, a new shader context is started.
            this._setShaderOwnerChildrenRecursive(null)

            if (!prevIsZContext) {
                // Render context forces z context.
                this.enableZContext(this._parent ? this._parent.findZContext() : null);
            }

            this.setHasRenderUpdates(3)

            // Make sure that the render coordinates get updated.
            this._setRecalc(7)

            this.render = this._renderAdvanced
        }
    }

    _disableRenderToTexture() {
        if (this._renderToTextureEnabled) {
            this._renderToTextureEnabled = false

            this._setShaderOwnerChildrenRecursive(this._shaderOwner)

            this._renderContext = this._worldContext

            if (!this.isZContext()) {
                this.disableZContext();
            }

            // Make sure that the render coordinates get updated.
            this._setRecalc(7);

            this.setHasRenderUpdates(3)

            this.render = this._renderSimple
        }
    }

    _stashTexCoords() {
        this._stashedTexCoords = [this._txCoordsUl, this._txCoordsUr, this._txCoordsBr, this._txCoordsBl, this._ulx, this._uly, this._brx, this._bry];
        this._txCoordsUl = 0x00000000;
        this._txCoordsUr = 0x0000FFFF;
        this._txCoordsBr = 0xFFFFFFFF;
        this._txCoordsBl = 0xFFFF0000;
        this._ulx = 0;
        this._uly = 0;
        this._brx = 1;
        this._bry = 1;
    }

    _unstashTexCoords() {
        this._txCoordsUl = this._stashedTexCoords[0];
        this._txCoordsUr = this._stashedTexCoords[1];
        this._txCoordsBr = this._stashedTexCoords[2];
        this._txCoordsBl = this._stashedTexCoords[3];
        this._ulx = this._stashedTexCoords[4];
        this._uly = this._stashedTexCoords[5];
        this._brx = this._stashedTexCoords[6];
        this._bry = this._stashedTexCoords[7];
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
        return this._outOfBounds
    }

    set boundsMargin(v) {

        /**
         *  undefined: inherit
         *  null: no margin
         *  number[4]: specific margins: left, top, right, bottom.
         */
        this._boundsMargin = v ? v.slice() : undefined

        // We force recalc in order to set all boundsMargin recursively during the next update.
        this._setRecalc(2)
    }

    get boundsMargin() {
        return this._boundsMargin
    }

    update() {
        this._recalc |= this._parent._pRecalc

        if (this._onUpdate) {
            // Block all 'upwards' updates when changing things in this branch.
            this._hasUpdates = true
            this._onUpdate(this.view)
        }

        const pw = this._parent._worldContext
        let w = this._worldContext
        const visible = (pw.alpha && this._localAlpha);

        /**
         * We must update if:
         * - branch contains updates (even when invisible because it may contain z-indexed descendants)
         * - there are (inherited) updates and this branch is visible
         * - this branch becomes invisible (descs may be z-indexed so we must update all alpha values)
         */
        if (this._hasUpdates || (this._recalc && visible) || (w.alpha && !visible)) {
            if (this._zSort) {
                // Make sure that all descendants are updated so that the updateTreeOrder flags are correctly set.
                this.ctx.updateTreeOrderForceUpdate++;
            }

            let recalc = this._recalc

            // Update world coords/alpha.
            if (recalc & 1) {
                if (!w.alpha && visible) {
                    // Becomes visible.
                    this._hasRenderUpdates = 3
                }
                w.alpha = pw.alpha * this._localAlpha;

                if (w.alpha < 1e-14) {
                    // Tiny rounding errors may cause failing visibility tests.
                    w.alpha = 0
                }
            }

            if (recalc & 6) {
                w.px = pw.px + this._localPx * pw.ta
                w.py = pw.py + this._localPy * pw.td
                if (pw.tb !== 0) w.px += this._localPy * pw.tb;
                if (pw.tc !== 0) w.py += this._localPx * pw.tc;
            }

            if (recalc & 4) {
                w.ta = this._localTa * pw.ta
                w.tb = this._localTd * pw.tb
                w.tc = this._localTa * pw.tc
                w.td = this._localTd * pw.td

                if (this._isComplex) {
                    w.ta += this._localTc * pw.tb
                    w.tb += this._localTb * pw.ta
                    w.tc += this._localTc * pw.td
                    w.td += this._localTb * pw.tc
                }
            }

            // Update render coords/alpha.
            if (this._parent._hasRenderContext()) {
                const init = this._renderContext === this._worldContext
                if (init) {
                    // First render context build: make sure that it is fully initialized correctly.
                    // Otherwise, if we get into bounds later, the render context would not be initialized correctly.
                    this._renderContext = new ViewCoreContext()
                }

                let r = this._renderContext

                let pr = this._parent._renderContext

                // Update world coords/alpha.
                if (init || (recalc & 1)) {
                    r.alpha = pr.alpha * this._localAlpha;

                    if (r.alpha < 1e-14) {
                        r.alpha = 0
                    }
                }

                if (init || (recalc & 6)) {
                    r.px = pr.px + this._localPx * pr.ta
                    r.py = pr.py + this._localPy * pr.td
                    if (pr.tb !== 0) r.px += this._localPy * pr.tb;
                    if (pr.tc !== 0) r.py += this._localPx * pr.tc;
                }

                if (init) {
                    // We set the recalc toggle, because we must make sure that the scissor is updated.
                    recalc |= 2
                }

                if (init || (recalc & 4)) {
                    r.ta = this._localTa * pr.ta
                    r.tb = this._localTd * pr.tb
                    r.tc = this._localTa * pr.tc
                    r.td = this._localTd * pr.td

                    if (this._isComplex) {
                        r.ta += this._localTc * pr.tb
                        r.tb += this._localTb * pr.ta
                        r.tc += this._localTc * pr.td
                        r.td += this._localTb * pr.tc
                    }
                }
            } else {
                this._renderContext = this._worldContext
            }

            this._updateTreeOrder = this.ctx.updateTreeOrder++;

            // Determine whether we must use a 'renderTexture'.
            const useRenderToTexture = this._renderToTextureEnabled && this._texturizer.mustRenderToTexture()
            if (this._useRenderToTexture !== useRenderToTexture) {
                // Coords must be changed.
                this._recalc |= 2 + 4

                // Scissor may change: force update.
                recalc |= 2

                if (!this._useRenderToTexture) {
                    // We must release the texture.
                    this._texturizer.release()
                }
            }
            this._useRenderToTexture = useRenderToTexture

            if (recalc & 6 || !this._scissor /* initial */) {
                // Determine whether we must 'clip'.
                if (this._clipping && this._renderContext.isSquare()) {
                    // We must clip.
                    const x = this._renderContext.px
                    const y = this._renderContext.py
                    const w = this._renderContext.ta * this._rw
                    const h = this._renderContext.td * this._rh

                    // If the parent renders to a texture, it's scissor should be ignored
                    const area = this._parent._useRenderToTexture ? this._parent._viewport : this._parent._scissor
                    if (area) {
                        // Merge scissor areas.
                        let sx = Math.max(area[0], x)
                        let sy = Math.max(area[1], y)
                        let ex = Math.min(area[0] + area[2], x + w)
                        let ey = Math.min(area[1] + area[3], y + h)
                        this._scissor = [sx, sy, ex - sx, ey - sy]
                    } else {
                        this._scissor = [x, y, w, h]
                    }
                } else {
                    // No clipping: reuse parent scissor.
                    this._scissor = this._parent._useRenderToTexture ? this._parent._viewport : this._parent._scissor
                }
            }

            // Calculate the outOfBounds margin.
            if (this._boundsMargin !== undefined) {
                // Reuse parent's recBoundsMargin.
                this._recBoundsMargin = this._boundsMargin
            } else {
                this._recBoundsMargin = this._parent._recBoundsMargin
            }

            const r = this._renderContext

            if (this._onAfterCalcs) {
                this._onAfterCalcs(this.view)
            }

            if (this._parent._outOfBounds === 2) {
                // Inherit parent out of boundsness.
                this._outOfBounds = 2

                if (this._withinBoundsMargin) {
                    this._withinBoundsMargin = false
                    this.view._disableWithinBoundsMargin()
                }
            } else {
                if (recalc & 6) {
                    const rw = this._rw
                    const rh = this._rh

                    // Recheck if view is out-of-bounds (all settings that affect this should enable recalc bit 2 or 4).
                    let maxDistance = 0
                    this._outOfBounds = 0
                    if (this._scissor && (this._scissor[2] <= 0 || this._scissor[3] <= 0)) {
                        // Empty scissor area.
                        this._outOfBounds = 2
                    } else {
                        if (this._isComplex) {
                            maxDistance = Math.max(
                                0,
                                this._scissor[0] - (Math.max(0, rw * r.ta, rw * r.ta + rh * r.tb, rh * r.tb) + r.px),
                                this._scissor[1] - (Math.max(0, rw * r.tc, rw * r.tc + rh * r.td, rh * r.td) + r.py),
                                (Math.min(0, rw * r.ta, rw * r.ta + rh * r.tb, rh * r.tb) + r.px) - (this._scissor[0] + this._scissor[2]),
                                (Math.min(0, rw * r.tc, rw * r.tc + rh * r.td, rh * r.td) + r.py) - (this._scissor[1] + this._scissor[3])
                            )

                            if (maxDistance > 0) {
                                this._outOfBounds = 1
                            }
                        } else {
                            const sx = r.px + r.ta * rw
                            const sy = r.py + r.td * rh

                            maxDistance = Math.max(
                                0,
                                this._scissor[0] - Math.max(r.px, sx),
                                this._scissor[1] - Math.max(r.py, sy),
                                Math.min(r.px, sx) - (this._scissor[0] + this._scissor[2]),
                                Math.min(r.py, sy) - (this._scissor[1] + this._scissor[3])
                            )

                            if (maxDistance > 0) {
                                this._outOfBounds = 1
                            }
                        }
                        if (this._outOfBounds) {
                            if (this._clipping || this._useRenderToTexture || this._clipbox) {
                                this._outOfBounds = 2
                            }
                        }
                    }

                    let withinMargin = (this._outOfBounds === 0)
                    if (!withinMargin && !!this._recBoundsMargin) {
                        // Start with a quick retest.
                        if (this._recBoundsMargin[0] > maxDistance || this._recBoundsMargin[1] > maxDistance || this._recBoundsMargin[2] > maxDistance || this._recBoundsMargin[3] > maxDistance) {
                            // Re-test, now with bounds.
                            if (this._isComplex) {
                                withinMargin = !((Math.max(0, rw * r.ta, rw * r.ta + rh * r.tb, rh * r.tb) < this._scissor[0] - r.px - this._recBoundsMargin[2]) ||
                                (Math.max(0, rw * r.tc, rw * r.tc + rh * r.td, rh * r.td) < this._scissor[1] - r.py - this._recBoundsMargin[3]) ||
                                (Math.min(0, rw * r.ta, rw * r.ta + rh * r.tb, rh * r.tb) > this._scissor[0] + this._scissor[2] - r.px + this._recBoundsMargin[0]) ||
                                (Math.min(0, rw * r.tc, rw * r.tc + rh * r.td, rh * r.td) > this._scissor[1] + this._scissor[3] - r.py + this._recBoundsMargin[1]))
                            } else {
                                const sx = r.px + r.ta * rw
                                const sy = r.py + r.td * rh

                                withinMargin = !((r.px < this._scissor[0] && sx < this._scissor[0] - this._recBoundsMargin[2]) ||
                                (r.py < this._scissor[1] && sy < this._scissor[1] - this._recBoundsMargin[3]) ||
                                ((r.px > (this._scissor[0] + this._scissor[2] + this._recBoundsMargin[0])) && (sx > (this._scissor[0] + this._scissor[2] + this._recBoundsMargin[0]))) ||
                                ((r.py > (this._scissor[1] + this._scissor[3] + this._recBoundsMargin[1])) && (sy > (this._scissor[1] + this._scissor[3] + this._recBoundsMargin[1]))))
                            }

                            if (withinMargin && this._outOfBounds === 2) {
                                // Children must be visited because they may contain views that are within margin, so must be visible.
                                this._outOfBounds = 1
                            }
                        }
                    }

                    if (this._withinBoundsMargin !== withinMargin) {
                        this._withinBoundsMargin = withinMargin

                        if (this._withinBoundsMargin) {
                            // This may update things (txLoaded events) in the view itself, but also in descendants and ancestors.

                            // Changes in ancestors should be executed during the next call of the stage update. But we must
                            // take care that the _recalc and _hasUpdates flags are properly registered. That's why we clear
                            // both before entering the children, and use _pRecalc to transfer inherited updates instead of
                            // _recalc directly.

                            // Changes in descendants are automatically executed within the current update loop, though we must
                            // take care to not update the hasUpdates flag unnecessarily in ancestors. We achieve this by making
                            // sure that the hasUpdates flag of this view is turned on, which blocks it for ancestors.
                            this._hasUpdates = true

                            const recalc = this._recalc
                            this._recalc = 0
                            this.view._enableWithinBoundsMargin()

                            if (this._recalc) {
                                // This view needs to be re-updated now, because we want the dimensions (and other changes) to be updated.
                                return this.update()
                            }

                            this._recalc = recalc
                        } else {
                            this.view._disableWithinBoundsMargin()
                        }
                    }
                }
            }

            if (this._useRenderToTexture) {
                // Set viewport necessary for children scissor calculation.
                if (this._viewport) {
                    this._viewport[2] = this._rw
                    this._viewport[3] = this._rh
                } else {
                    this._viewport = [0, 0, this._rw, this._rh]
                }
            }

            // Filter out bits that should not be copied to the children (currently all are).
            this._pRecalc = (this._recalc & 135);

            // Clear flags so that future updates are properly detected.
            this._recalc = 0
            this._hasUpdates = false;

            if (this._outOfBounds < 2) {
                if (this._useRenderToTexture) {
                    if (this._worldContext.isIdentity()) {
                        // Optimization.
                        // The world context is already identity: use the world context as render context to prevents the
                        // ancestors from having to update the render context.
                        this._renderContext = this._worldContext
                    } else {
                        // Temporarily replace the render coord attribs by the identity matrix.
                        // This allows the children to calculate the render context.
                        this._renderContext = ViewCoreContext.IDENTITY
                    }
                }

                if (this._children) {
                    for (let i = 0, n = this._children.length; i < n; i++) {
                        this._children[i].update();
                    }
                }

                if (this._useRenderToTexture) {
                    this._renderContext = r
                }
            } else {
                if (this._children) {
                    for (let i = 0, n = this._children.length; i < n; i++) {
                        if (this._children[i]._hasUpdates) {
                            this._children[i].update()
                        } else {
                            // Make sure we don't lose the 'inherited' updates.
                            this._children[i]._recalc |= this._pRecalc
                            this._children[i].updateOutOfBounds()
                        }
                    }
                }
            }

            if (this._onAfterUpdate) {
                this._onAfterUpdate(this.view)
            }

            if (this._zSort) {
                this.ctx.updateTreeOrderForceUpdate--;
            }
        } else if (this.ctx.updateTreeOrderForceUpdate > 0) {
            // Branch is invisible, but still we want to update the tree order.
            this.updateTreeOrder();
        }
    }

    updateOutOfBounds() {
        // Propagate outOfBounds flag to descendants (necessary because of z-indexing).
        // Invisible views are not drawn anyway. When alpha is updated, so will _outOfBounds.
        if (this._outOfBounds !== 2 && this._renderContext.alpha > 0) {

            // Inherit parent out of boundsness.
            this._outOfBounds = 2

            if (this._withinBoundsMargin) {
                this._withinBoundsMargin = false
                this.view._disableWithinBoundsMargin()
            }

            if (this._children) {
                for (let i = 0, n = this._children.length; i < n; i++) {
                    this._children[i].updateOutOfBounds();
                }
            }
        }
    }

    updateTreeOrder() {
        if (this._zSort) {
            // Make sure that all descendants are updated so that the updateTreeOrder flags are correctly set.
            this.ctx.updateTreeOrderForceUpdate++;
        }

        this._updateTreeOrder = this.ctx.updateTreeOrder++;

        if (this._children) {
            for (let i = 0, n = this._children.length; i < n; i++) {
                let hasZSort = this._children[i]._zSort
                if (hasZSort) {
                    this.ctx.updateTreeOrderForceUpdate--;
                }

                this._children[i].updateTreeOrder();

                if (hasZSort) {
                    this.ctx.updateTreeOrderForceUpdate--;
                }
            }
        }

        if (this._zSort) {
            this.ctx.updateTreeOrderForceUpdate--;
        }
    }

    _renderSimple() {
        if (this._zSort) {
            this.sortZIndexedChildren();
        }

        if (this._outOfBounds < 2 && this._renderContext.alpha) {
            let renderState = this.renderState;

            if ((this._outOfBounds === 0) && this._displayedTextureSource) {
                renderState.setShader(this.activeShader, this._shaderOwner);
                renderState.setScissor(this._scissor)
                this.addQuads()
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

            this._hasRenderUpdates = 0;
        }
    }

    _renderAdvanced() {
        if (this._zSort) {
            this.sortZIndexedChildren();
        }

        if (this._outOfBounds < 2 && this._renderContext.alpha) {
            let renderState = this.renderState;

            let mustRenderChildren = true
            let renderTextureInfo
            let prevRenderTextureInfo
            if (this._useRenderToTexture) {
                if (this._rw === 0 || this._rh === 0) {
                    // Ignore this branch and don't draw anything.
                    this._hasRenderUpdates = 0;
                    return;
                } else if (!this._texturizer.hasRenderTexture() || (this._hasRenderUpdates >= 3)) {
                    // Switch to default shader for building up the render texture.
                    renderState.setShader(renderState.defaultShader, this)

                    prevRenderTextureInfo = renderState.renderTextureInfo

                    renderTextureInfo = {
                        glTexture: null,
                        offset: 0,
                        w: this._rw,
                        h: this._rh,
                        empty: true,
                        cleared: false,
                        ignore: false
                    }

                    renderState.setRenderTextureInfo(renderTextureInfo);
                    renderState.setScissor(undefined)

                    if (this._displayedTextureSource) {
                        let r = this._renderContext

                        // Use an identity context for drawing the displayed texture to the render texture.
                        this._renderContext = ViewCoreContext.IDENTITY

                        // Add displayed texture source in local coordinates.
                        this.addQuads()

                        this._renderContext = r
                    }
                } else {
                    mustRenderChildren = false;
                }
            } else {
                if ((this._outOfBounds === 0) && this._displayedTextureSource) {
                    renderState.setShader(this.activeShader, this._shaderOwner);
                    renderState.setScissor(this._scissor)
                    this.addQuads()
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
                let updateResultTexture = false
                if (mustRenderChildren) {
                    // Finish refreshing renderTexture.
                    if (renderTextureInfo.glTexture) {
                        // There was only one texture drawn in this render texture.
                        // Check if we can reuse it (it should exactly span this render texture).
                        let floats = renderState.quads.floats
                        let uints = renderState.quads.uints
                        let offset = renderTextureInfo.offset / 4
                        let reuse = ((floats[offset] === 0) &&
                        (floats[offset + 1] === 0) &&
                        (uints[offset + 2] === 0x00000000) &&
                        (uints[offset + 3] === 0xFFFFFFFF) &&
                        (floats[offset + 4] === renderTextureInfo.w) &&
                        (floats[offset + 5] === 0) &&
                        (uints[offset + 6] === 0x0000FFFF) &&
                        (uints[offset + 7] === 0xFFFFFFFF) &&
                        (floats[offset + 8] === renderTextureInfo.w) &&
                        (floats[offset + 9] === renderTextureInfo.h) &&
                        (uints[offset + 10] === 0xFFFFFFFF) &&
                        (uints[offset + 11] === 0xFFFFFFFF) &&
                        (floats[offset + 12] === 0) &&
                        (floats[offset + 13] === renderTextureInfo.h) &&
                        (uints[offset + 14] === 0xFFFF0000) &&
                        (uints[offset + 15] === 0xFFFFFFFF))
                        if (!reuse) {
                            renderTextureInfo.glTexture = null
                        }
                    }

                    // If nothing was rendered, we store a flag in the texturizer and prevent unnecessary
                    //  render-to-texture and filtering.
                    this._texturizer.empty = renderTextureInfo.empty

                    if (renderTextureInfo.empty) {
                        // We ignore empty render textures and do not draw the final quad.

                        // The following cleans up memory and enforces that the result texture is also cleared.
                        this._texturizer.releaseFilterTexture()
                        this._texturizer.releaseRenderTexture()
                    } else if (renderTextureInfo.glTexture) {
                        // If glTexture is set, we can reuse that directly instead of creating a new render texture.
                        this._texturizer.reuseTextureAsRenderTexture(renderTextureInfo.glTexture)

                        renderTextureInfo.ignore = true
                    } else {
                        if (this._texturizer.renderTextureReused) {
                            // Quad operations must be written to a render texture actually owned.
                            this._texturizer.releaseRenderTexture()
                        }
                        // Just create the render texture.
                        renderTextureInfo.glTexture = this._texturizer.getRenderTexture()
                    }

                    // Restore the parent's render texture and active scissor.
                    renderState.setRenderTextureInfo(prevRenderTextureInfo)

                    updateResultTexture = true
                }

                if (!this._texturizer.empty) {
                    let hasFilters = this._texturizer._hasActiveFilters();

                    if (hasFilters) {
                        if ((this._hasRenderUpdates >= 2 || !this._texturizer.filterResultCached)) {
                            this.applyFilters();
                            updateResultTexture = true
                        }
                    }

                    let resultTexture = this._texturizer.getResultTexture();
                    if (updateResultTexture) {
                        if (resultTexture) {
                            // Logging the update frame can be handy for userland.
                            resultTexture.update = renderState.stage.frameCounter
                        }
                        this._texturizer.updateResultTexture();
                    }

                    if (!this._texturizer.hideResult) {
                        // Render result texture to the actual render target.
                        renderState.setShader(this.activeShader, this._shaderOwner);
                        renderState.setScissor(this._scissor)

                        renderState.setOverrideQuadTexture(resultTexture);
                        this._stashTexCoords();
                        if (!this._texturizer.colorize) this._stashColors()
                        this.addQuads();
                        if (!this._texturizer.colorize) this._unstashColors();
                        this._unstashTexCoords();
                        renderState.setOverrideQuadTexture(null);
                    }
                }
            }

            this._hasRenderUpdates = 0;
        }
    }

    applyFilters() {
        let sourceTexture = this._texturizer.getRenderTexture();

        let renderState = this.renderState;
        let activeFilters = this._texturizer.getActiveFilters();

        let textureRenders = activeFilters.length;

        this._texturizer.filterResultCached = false

        if (textureRenders === 0) {
            // No filters: just render the source texture with the normal shader.
            return sourceTexture
        } else if (textureRenders === 1) {
            let targetTexture = this._texturizer.getFilterTexture();

            // No intermediate texture is needed.
            renderState.addFilter(activeFilters[0], this, sourceTexture, targetTexture);
            this._texturizer.filterResultCached = true;
        } else {
            let targetTexture = this._texturizer.getFilterTexture();
            let intermediate = this.ctx.allocateRenderTexture(this._rw, this._rh);
            let source = intermediate;
            let target = targetTexture;

            let even = ((textureRenders % 2) === 0);

            for (let i = 0; i < textureRenders; i++) {
                if (i !== 0 || even) {
                    // Finally, the target should contain targetTexture, and source the intermediate texture.
                    let tmp = source;
                    source = target;
                    target = tmp;
                }

                renderState.addFilter(activeFilters[i], this, i === 0 ? sourceTexture : source, target)
            }

            this.ctx.releaseRenderTexture(intermediate);

            this._texturizer.filterResultCached = true;
        }
    }

    get zSort() {
        return this._zSort
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

        const n = this._zIndexedChildren.length
        let ptr = 0
        const a = this._zIndexedChildren

        const b = []
        for (let i = 0; i < n; i++) {
            if (a[i]._zParent === this) {
                if (a[i]._zIndexResort) {
                    a[i]._zIndexResort = false
                    b.push(a[i])
                } else {
                    if (ptr !== i) {
                        a[ptr] = a[i]
                    }
                    ptr++
                }
            }
        }

        const m = b.length
        if (m) {
            b.sort(ViewCore.sortZIndexedChildren)
            const n = ptr
            if (!n) {
                ptr = 0
                let j = 0
                do {
                    a[ptr++] = b[j++]
                } while(j < m)

                if (a.length > ptr) {
                    // Slice old (unnecessary) part off array.
                    a.splice(ptr)
                }
            } else {
                // Merge-sort arrays
                ptr = 0
                let i = 0
                let j = 0
                const mergeResult = []
                do {
                    const v = (a[i]._zIndex === b[j]._zIndex ? a[i]._updateTreeOrder - b[j]._updateTreeOrder : a[i]._zIndex - b[j]._zIndex)

                    const add = v > 0 ? b[j++] : a[i++]

                    if (ptr === 0 || (mergeResult[ptr - 1] !== add)) {
                        mergeResult[ptr++] = add
                    }

                    if (i >= n) {
                        do {
                            const add = b[j++]
                            if (ptr === 0 || (mergeResult[ptr - 1] !== add)) {
                                mergeResult[ptr++] = add
                            }
                        } while(j < m)
                        break
                    } else if (j >= m) {
                        do {
                            const add = a[i++]
                            if (ptr === 0 || (mergeResult[ptr - 1] !== add)) {
                                mergeResult[ptr++] = add
                            }
                        } while(i < n)
                        break
                    }
                } while(true)

                this._zIndexedChildren = mergeResult
            }
        }

        this._zSort = false
    };

    addQuads() {
        let r = this._renderContext

        let floats = this.renderState.quads.floats;
        let uints = this.renderState.quads.uints;

        if (r.tb !== 0 || r.tc !== 0) {
            let offset = this.renderState.addQuad(this) / 4;
            floats[offset++] = r.px;
            floats[offset++] = r.py;
            uints[offset++] = this._txCoordsUl; // Texture.
            uints[offset++] = getColorInt(this._colorUl, r.alpha);
            floats[offset++] = r.px + this._rw * r.ta;
            floats[offset++] = r.py + this._rw * r.tc;
            uints[offset++] = this._txCoordsUr;
            uints[offset++] = getColorInt(this._colorUr, r.alpha);
            floats[offset++] = r.px + this._rw * r.ta + this._rh * r.tb;
            floats[offset++] = r.py + this._rw * r.tc + this._rh * r.td;
            uints[offset++] = this._txCoordsBr;
            uints[offset++] = getColorInt(this._colorBr, r.alpha);
            floats[offset++] = r.px + this._rh * r.tb;
            floats[offset++] = r.py + this._rh * r.td;
            uints[offset++] = this._txCoordsBl;
            uints[offset] = getColorInt(this._colorBl, r.alpha);
        } else {
            // Simple.
            let cx = r.px + this._rw * r.ta;
            let cy = r.py + this._rh * r.td;

            let offset = this.renderState.addQuad(this) / 4;
            floats[offset++] = r.px;
            floats[offset++] = r.py
            uints[offset++] = this._txCoordsUl; // Texture.
            uints[offset++] = getColorInt(this._colorUl, r.alpha);
            floats[offset++] = cx;
            floats[offset++] = r.py;
            uints[offset++] = this._txCoordsUr;
            uints[offset++] = getColorInt(this._colorUr, r.alpha);
            floats[offset++] = cx;
            floats[offset++] = cy;
            uints[offset++] = this._txCoordsBr;
            uints[offset++] = getColorInt(this._colorBr, r.alpha);
            floats[offset++] = r.px;
            floats[offset++] = cy;
            uints[offset++] = this._txCoordsBl;
            uints[offset] = getColorInt(this._colorBl, r.alpha);
        }
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

    get rw() {
        return this._rw;
    }

    get rh() {
        return this._rh;
    }

    get view() {
        return this._view;
    }

    get renderUpdates() {
        return this._hasRenderUpdates
    }

    get texturizer() {
        if (!this._texturizer) {
            this._texturizer = new ViewTexturizer(this)
        }
        return this._texturizer
    }

    getCornerPoints() {
        let w = this._worldContext

        return [
            w.px,
            w.py,
            w.px + this._rw * w.ta,
            w.py + this._rw * w.tc,
            w.px + this._rw * w.ta + this._rh * this.tb,
            w.py + this._rw * w.tc + this._rh * this.td,
            w.px + this._rh * this.tb,
            w.py + this._rh * this.td
        ]
    };

    getRenderTextureCoords(relX, relY) {
        let r = this._renderContext
        return [
            r.px + r.ta * relX + r.tb * relY,
            r.py + r.tc * relX + r.td * relY
        ]
    }

    getAbsoluteCoords(relX, relY) {
        let w = this._renderContext
        return [
            w.px + w.ta * relX + w.tb * relY,
            w.py + w.tc * relX + w.td * relY
        ]
    }
}

let getColorInt = function (c, alpha) {
    let a = ((c / 16777216 | 0) * alpha) | 0;
    return (((((c >> 16) & 0xff) * a) / 255) & 0xff) +
        ((((c & 0xff00) * a) / 255) & 0xff00) +
        (((((c & 0xff) << 16) * a) / 255) & 0xff0000) +
        (a << 24);
};

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
            this.td === 1
    }

    isSquare() {
        return this.tb === 0 && this.tc === 0
    }

}

ViewCoreContext.IDENTITY = new ViewCoreContext()

ViewCore.sortZIndexedChildren = function(a,b) {
    return (a._zIndex === b._zIndex ? a._updateTreeOrder - b._updateTreeOrder : a._zIndex - b._zIndex)
}


/**
 * Copyright Metrological, 2017
 */

class CoreContext {

    constructor(stage) {
        this.stage = stage

        this.gl = stage.gl

        this.root = null

        this.updateTreeOrder = 0
        this.updateTreeOrderForceUpdate = 0

        this.shaderPrograms = new Map()

        this.renderState = new CoreRenderState(this)

        this.renderExec = new CoreRenderExecutor(this)
        this.renderExec.init()

        this._renderTexturePixels = 0
        this._renderTexturePool = []

        this._renderTextureId = 1

        this._zSorts = []
    }

    destroy() {
        this.shaderPrograms.forEach(shaderProgram => shaderProgram.destroy())
        this._renderTexturePool.forEach(texture => this._freeRenderTexture(texture));
    }

    hasRenderUpdates() {
        return !!this.root._parent._hasRenderUpdates
    }

    frame() {
        this.update()

        // Due to the boundsVisibility flag feature (and onAfterUpdate hook), it is possible that other views were
        // changed during the update loop (for example due to the txLoaded event). We process these changes immediately
        // (but not recursively to prevent infinite loops).
        if (this.root._hasUpdates) {
            this.update()
        }

        const n = this._zSorts.length
        if (n) {
            // Forced z-sorts (ViewCore may force a z-sort in order to free memory/prevent memory leakd).
            for (let i = 0, n = this._zSorts.length; i < n; i++) {
                if (this._zSorts[i].zSort) {
                    this._zSorts[i].sortZIndexedChildren()
                }
            }
            this._zSorts = []
        }

        // Clear flag to identify if anything changes before the next frame.
        this.root._parent._hasRenderUpdates = false

        this.render()

        return true
    }

    update() {
        this.updateTreeOrderForceUpdate = 0
        this.updateTreeOrder = 0

        this.root.update()
    }

    render() {
        // Obtain a sequence of the quad and filter operations.
        this.renderState.reset()
        this.root.render()
        this.renderState.finish()

        // Now run them with the render executor.
        this.renderExec.execute()
    }

    allocateRenderTexture(w, h) {
        let prec = this.stage.getRenderPrecision()
        let aw = Math.max(1, Math.round(w * prec))
        let ah = Math.max(1, Math.round(h * prec))

        for (let i = 0, n = this._renderTexturePool.length; i < n; i++) {
            let texture = this._renderTexturePool[i];
            if (texture.w === aw && texture.h === ah) {
                texture.f = this.stage.frameCounter;
                this._renderTexturePool.splice(i, 1);
                return texture;
            }
        }

        let texture = this._createRenderTexture(aw, ah);

        texture.f = this.stage.frameCounter;
        texture.precision = prec;
        texture.projection = new Float32Array([2/w, 2/h])

        return texture;
    }

    releaseRenderTexture(texture) {
        this._renderTexturePool.push(texture);
    }

    freeUnusedRenderTextures(maxAge = 60) {
        const prevMem = this._renderTexturePixels

        // Clean up all textures that are no longer used.
        // This cache is short-lived because it is really just meant to supply running shaders and filters that are
        // updated during a number of frames.
        let limit = this.stage.frameCounter - maxAge;

        this._renderTexturePool = this._renderTexturePool.filter(texture => {
            if (texture.f <= limit) {
                this._freeRenderTexture(texture);
                return false;
            }
            return true;
        });

        console.warn("GC render texture memory" + (maxAge ? "" : " (aggressive)") + ": " + prevMem + "px > " + this._renderTexturePixels + "px")
    }

    _createRenderTexture(w, h) {
        let gl = this.gl;
        let sourceTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, sourceTexture);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // We need a specific framebuffer for every render texture.
        sourceTexture.framebuffer = gl.createFramebuffer();
        sourceTexture.w = w;
        sourceTexture.h = h;
        sourceTexture.id = this._renderTextureId++

        this._renderTexturePixels += w * h

        if (this._renderTexturePixels > this.stage.getOption('renderTextureMemory')) {
            this.freeUnusedRenderTextures()

            if (this._renderTexturePixels > this.stage.getOption('renderTextureMemory')) {
                this.freeUnusedRenderTextures(0)
            }
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, sourceTexture.framebuffer)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sourceTexture, 0);

        return sourceTexture;
    }

    _freeRenderTexture(glTexture) {
        let gl = this.stage.gl;
        gl.deleteFramebuffer(glTexture.framebuffer);
        gl.deleteTexture(glTexture);

        this._renderTexturePixels -= glTexture.w * glTexture.h
    }

    forceZSort(viewCore) {
        this._zSorts.push(viewCore)
    }

}


/**
 * Copyright Metrological, 2017
 */

class CoreRenderState {

    constructor(ctx) {
        this.ctx = ctx

        this.stage = ctx.stage

        // Allocate a fairly big chunk of memory that should be enough to support ~100000 (default) quads.
        // We do not (want to) handle memory overflow.

        // We could optimize memory usage by increasing the ArrayBuffer gradually.
        this.quads = new CoreQuadList(ctx, ctx.stage.getOption('bufferMemory'))

        this.defaultShader = new Shader(this.ctx);
    }

    reset() {
        this._renderTextureInfo = null

        this._scissor = null

        /**
         * @type {Shader}
         */
        this._shader = null

        this._shaderOwner = null

        this._realShader = null

        this._check = false

        this.quadOperations = []
        this.filterOperations = []

        this._overrideQuadTexture = null

        this._quadOperation = null

        this.quads.reset()

    }

    get length() {
        return this.quads.quadTextures.length
    }

    setShader(shader, owner) {
        if (this._shaderOwner !== owner || this._realShader !== shader) {
            // Same shader owner: active shader is also the same.
            // Prevent any shader usage to save performance.

            this._realShader = shader

            if (shader.useDefault()) {
                // Use the default shader when possible to prevent unnecessary program changes.
                shader = this.defaultShader
            }
            if (this._shader !== shader || this._shaderOwner !== owner) {
                this._shader = shader
                this._shaderOwner = owner
                this._check = true
            }
        }
    }

    get renderTextureInfo() {
        return this._renderTextureInfo
    }

    setScissor(area) {
        if (this._scissor !== area) {
            if (area) {
                this._scissor = area
            } else {
                this._scissor = null
            }
            this._check = true
        }
    }

    getScissor() {
        return this._scissor
    }

    setRenderTextureInfo(renderTextureInfo) {
        if (this._renderTextureInfo !== renderTextureInfo) {
            this._renderTextureInfo = renderTextureInfo
            this._scissor = null
            this._check = true
        }
    }

    setOverrideQuadTexture(texture) {
        this._overrideQuadTexture = texture
    }

    addQuad(viewCore) {
        if (!this._quadOperation) {
            this._createQuadOperation()
        } else if (this._check && this._hasChanges()) {
            this._addQuadOperation()
            this._check = false
        }

        let glTexture = this._overrideQuadTexture;
        if (!glTexture) {
            glTexture = viewCore._displayedTextureSource.glTexture
        }

        let offset = this.length * 64 + 64 // Skip the identity filter quad.

        if (this._renderTextureInfo) {
            if (this._shader === this.defaultShader && this._renderTextureInfo.empty && (this._renderTextureInfo.w === glTexture.w && this._renderTextureInfo.h === glTexture.h)) {
                // The texture might be reusable under some conditions. We will check them in ViewCore.renderer.
                this._renderTextureInfo.glTexture = glTexture
                this._renderTextureInfo.offset = offset
            } else {
                // It is not possible to reuse another texture when there is more than one quad.
                this._renderTextureInfo.glTexture = null
            }
            this._renderTextureInfo.empty = false
        }

        this.quads.quadTextures.push(glTexture)
        this.quads.quadViews.push(viewCore)

        this._quadOperation.length++

        return offset
    }

    _hasChanges() {
        let q = this._quadOperation
        if (this._shader !== q.shader) return true
        if (this._shaderOwner !== q.shaderOwner) return true
        if (this._renderTextureInfo !== q.renderTextureInfo) return true
        if (this._scissor !== q.scissor) {
            if ((this._scissor[0] !== q.scissor[0]) || (this._scissor[1] !== q.scissor[1]) || (this._scissor[2] !== q.scissor[2]) || (this._scissor[3] !== q.scissor[3])) {
                return true
            }
        }

        return false
    }

    _addQuadOperation(create = true) {
        if (this._quadOperation) {
            if (this._quadOperation.length || this._shader.addEmpty()) {
                if (!this._quadOperation.scissor || ((this._quadOperation.scissor[2] > 0) && (this._quadOperation.scissor[3] > 0))) {
                    // Ignore empty clipping regions.
                    this.quadOperations.push(this._quadOperation)
                }
            }

            this._quadOperation = null
        }

        if (create) {
            this._createQuadOperation()
        }
    }

    _createQuadOperation() {
        this._quadOperation = new CoreQuadOperation(
            this.ctx,
            this._shader,
            this._shaderOwner,
            this._renderTextureInfo,
            this._scissor,
            this.length
        )
        this._check = false
    }

    addFilter(filter, owner, source, target) {
        // Close current quad operation.
        this._addQuadOperation(false)

        this.filterOperations.push(new CoreFilterOperation(this.ctx, filter, owner, source, target, this.quadOperations.length))
    }

    finish() {
        if (this._quadOperation) {
            // Add remaining.
            this._addQuadOperation(false)
        }

        this._setExtraShaderAttribs()
    }

    _setExtraShaderAttribs() {
        let offset = this.length * 64 + 64
        for (let i = 0, n = this.quadOperations.length; i < n; i++) {
            this.quadOperations[i].extraAttribsDataByteOffset = offset;
            let extra = this.quadOperations[i].shader.getExtraAttribBytesPerVertex() * 4 * this.quadOperations[i].length
            offset += extra
            if (extra) {
                this.quadOperations[i].shader.setExtraAttribsInBuffer(this.quadOperations[i], this.quads)
            }
        }
        this.quads.dataLength = offset
    }

}


/**
 * Copyright Metrological, 2017
 */

class CoreQuadList {

    constructor(ctx, byteSize) {

        this.ctx = ctx

        this.textureAtlasGlTexture = this.ctx.textureAtlas ? this.ctx.textureAtlas.texture : null

        this.dataLength = 0

        this.data = new ArrayBuffer(byteSize)
        this.floats = new Float32Array(this.data)
        this.uints = new Uint32Array(this.data)

        this.quadTextures = []

        this.quadViews = []

        // Set up first quad to the identity quad (reused for filters).
        let f = this.floats;
        let u = this.uints;
        f[0] = -1;
        f[1] = -1;
        u[2] = 0x00000000;
        u[3] = 0xFFFFFFFF;
        f[4] = 1;
        f[5] = -1;
        u[6] = 0x0000FFFF;
        u[7] = 0xFFFFFFFF;
        f[8] = 1;
        f[9] = 1;
        u[10] = 0xFFFFFFFF;
        u[11] = 0xFFFFFFFF;
        f[12] = -1;
        f[13] = 1;
        u[14] = 0xFFFF0000;
        u[15] = 0xFFFFFFFF;
    }

    get length() {
        return this.quadTextures.length
    }

    reset() {
        this.quadTextures = []
        this.quadViews = []
        this.dataLength = 0
    }

    getAttribsDataByteOffset(index) {
        // Where this quad can be found in the attribs buffer.
        return (this.index + index) * 64 + 64
    }

    getView(index) {
        return this.quadViews[index]._view
    }

    getViewCore(index) {
        return this.quadViews[index]
    }

    getTexture(index) {
        return this.quadTextures[index]
    }

    getTextureWidth(index) {
        let glTexture = this.quadTextures[index]
        if (glTexture.w) {
            // Render texture
            return glTexture.w
        } else {
            return this.quadViews[index]._displayedTextureSource.w
        }
    }

    getTextureHeight(index) {
        let glTexture = this.quadTextures[index]
        if (glTexture.h) {
            // Render texture
            return glTexture.h
        } else {
            return this.quadViews[index]._displayedTextureSource.h
        }
    }

    getQuadContents() {
        // Debug: log contents of quad buffer.
        let floats = this.floats
        let uints = this.uints
        let lines = []
        for (let i = 1; i <= this.length; i++) {
            let str = 'entry ' + i + ': ';
            for (let j = 0; j < 4; j++) {
                let b = i * 16 + j * 4
                str += floats[b] + ',' + floats[b+1] + ':' + uints[b+2].toString(16) + '[' + uints[b+3].toString(16) + '] ';
            }
            lines.push(str)
        }

        return lines
    }
}

/**
 * Copyright Metrological, 2017
 */

class CoreQuadOperation {

    constructor(ctx, shader, shaderOwner, renderTextureInfo, scissor, index) {

        this.ctx = ctx
        this.shader = shader
        this.shaderOwner = shaderOwner
        this.renderTextureInfo = renderTextureInfo
        this.scissor = scissor
        this.index = index
        this.length = 0
        this.extraAttribsDataByteOffset = 0

    }

    get quads() {
        return this.ctx.renderState.quads
    }

    getAttribsDataByteOffset(index) {
        // Where this quad can be found in the attribs buffer.
        return this.quads.getAttribsDataByteOffset(this.index + index)
    }

    getTexture(index) {
        return this.quads.getTexture(this.index + index)
    }

    getViewCore(index) {
        return this.quads.getViewCore(this.index + index)
    }

    getView(index) {
        return this.quads.getView(this.index + index)
    }

    getViewWidth(index) {
        return this.getView(index).renderWidth
    }

    getViewHeight(index) {
        return this.getView(index).renderHeight
    }

    getTextureWidth(index) {
        return this.quads.getTextureWidth(this.index + index)
    }

    getTextureHeight(index) {
        return this.quads.getTextureHeight(this.index + index)
    }

    /**
     * Returns the relative pixel coordinates in the shader owner to gl position coordinates in the render texture.
     * @param x
     * @param y
     * @return {number[]}
     */
    getNormalRenderTextureCoords(x, y) {
        let coords = this.shaderOwner.getRenderTextureCoords(x, y)
        coords[0] /= this.getRenderWidth()
        coords[1] /= this.getRenderHeight()
        coords[0] = coords[0] * 2 - 1
        coords[1] = 1 - coords[1] * 2
        return coords
    }

    getRenderWidth() {
        if (this.renderTextureInfo) {
            return this.renderTextureInfo.w
        } else {
            return this.ctx.stage.w
        }
    }

    getRenderHeight() {
        if (this.renderTextureInfo) {
            return this.renderTextureInfo.h
        } else {
            return this.ctx.stage.h
        }
    }

    getProjection() {
        if (this.renderTextureInfo === null) {
            return this.ctx.renderExec._projection
        } else {
            return this.renderTextureInfo.glTexture.projection
        }
    }

}

/**
 * Copyright Metrological, 2017
 */

class CoreFilterOperation {

    constructor(ctx, filter, owner, source, renderTexture, beforeQuadOperation) {

        this.ctx = ctx
        this.filter = filter
        this.owner = owner
        this.source = source
        this.renderTexture = renderTexture
        this.beforeQuadOperation = beforeQuadOperation

    }

    getRenderWidth() {
        if (this.renderTexture) {
            return this.renderTexture.w
        } else {
            return this.ctx.stage.w
        }
    }

    getRenderHeight() {
        if (this.renderTexture) {
            return this.renderTexture.h
        } else {
            return this.ctx.stage.h
        }
    }

}

/**
 * Copyright Metrological, 2017
 */

class CoreRenderExecutor {

    constructor(ctx) {
        this.ctx = ctx

        this.renderState = ctx.renderState

        this.gl = this.ctx.stage.gl

        this.init()
    }

    init() {
        let gl = this.gl;

        // Create new sharable buffer for params.
        this._attribsBuffer = gl.createBuffer();

        let maxQuads = Math.floor(this.renderState.quads.data.byteLength / 64);

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
        this._projection = new Float32Array([2/this.ctx.stage.rw, -2/this.ctx.stage.rh])

    }

    destroy() {
        this.gl.deleteBuffer(this._attribsBuffer);
        this.gl.deleteBuffer(this._quadsBuffer);
    }

    _reset() {
        this._bindRenderTexture(null)
        this._setScissor(null)
        this._clearRenderTexture()

        // Set up default settings. Shaders should, after drawing, reset these properly.
        let gl = this.gl
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);

        this._quadOperation = null
        this._currentShaderProgramOwner = null
    }

    _setupBuffers() {
        let gl = this.gl
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._quadsBuffer);
        let view = new DataView(this.renderState.quads.data, 0, this.renderState.quads.dataLength);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._attribsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, view, gl.DYNAMIC_DRAW);
    }

    execute() {
        this._reset()
        this._setupBuffers()

        let qops = this.renderState.quadOperations
        let fops = this.renderState.filterOperations

        let i = 0, j = 0, n = qops.length, m = fops.length
        while (i < n) {
            while (j < m && i === fops[j].beforeQuadOperation) {
                if (this._quadOperation) {
                    this._execQuadOperation(this._quadOperation)
                }
                this._execFilterOperation(fops[j])
                j++
            }

            this._processQuadOperation(qops[i])
            i++
        }

        if (this._quadOperation) {
            this._execQuadOperation()
        }

        while (j < m) {
            this._execFilterOperation(fops[j])
            j++
        }

        this._stopShaderProgram()
    }

    getQuadContents() {
        return this.renderState.quads.getQuadContents()
    }

    _processQuadOperation(quadOperation) {
        if (quadOperation.renderTextureInfo && quadOperation.renderTextureInfo.ignore) {
            // Ignore quad operations when we are 're-using' another texture as the render texture result.
            return
        }

        if (this._quadOperation) {
            this._execQuadOperation()
        }

        let shader = quadOperation.shader
        this._useShaderProgram(shader)
        shader.setupUniforms(quadOperation)

        this._quadOperation = quadOperation
    }

    _execQuadOperation() {
        let op = this._quadOperation

        let shader = op.shader

        if (op.length || shader.addEmpty()) {
            // Set render texture.
            let glTexture = op.renderTextureInfo ? op.renderTextureInfo.glTexture : null;
            if (this._renderTexture !== glTexture) {
                this._bindRenderTexture(glTexture)
            }

            if (op.renderTextureInfo && !op.renderTextureInfo.cleared) {
                this._setScissor(null)
                this._clearRenderTexture()
                op.renderTextureInfo.cleared = true
                this._setScissor(op.scissor)
            } else if (this._scissor !== op.scissor) {
                this._setScissor(op.scissor)
            }

            shader.beforeDraw(op)
            shader.draw(op)
            shader.afterDraw(op)
        }

        this._quadOperation = null
    }

    _execFilterOperation(filterOperation) {
        let filter = filterOperation.filter
        this._useShaderProgram(filter)
        filter.setupUniforms(filterOperation)
        filter.beforeDraw(filterOperation)
        this._bindRenderTexture(filterOperation.renderTexture)
        if (this._scissor) {
            this._setScissor(null)
        }
        this._clearRenderTexture()
        filter.draw(filterOperation)
        filter.afterDraw(filterOperation)
    }

    /**
     * @param {Filter|Shader} owner
     */
    _useShaderProgram(owner) {
        if (!owner.hasSameProgram(this._currentShaderProgramOwner)) {
            if (this._currentShaderProgramOwner) {
                this._currentShaderProgramOwner.stopProgram()
            }
            owner.useProgram()
            this._currentShaderProgramOwner = owner
        }
    }

    _stopShaderProgram() {
        if (this._currentShaderProgramOwner) {
            // The currently used shader program should be stopped gracefully.
            this._currentShaderProgramOwner.stopProgram()
            this._currentShaderProgramOwner = null
        }
    }

    _bindRenderTexture(renderTexture) {
        this._renderTexture = renderTexture

        let gl = this.gl;
        if (!this._renderTexture) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null)
            gl.viewport(0,0,this.ctx.stage.w,this.ctx.stage.h)
        } else {
            gl.bindFramebuffer(gl.FRAMEBUFFER, this._renderTexture.framebuffer)
            gl.viewport(0,0,this._renderTexture.w, this._renderTexture.h)
        }
    }

    _clearRenderTexture() {
        let gl = this.gl
        if (!this._renderTexture) {
            let glClearColor = this.ctx.stage.getOption('glClearColor');
            gl.clearColor(glClearColor[0] * glClearColor[3], glClearColor[1] * glClearColor[3], glClearColor[2] * glClearColor[3], glClearColor[3]);
            gl.clear(gl.COLOR_BUFFER_BIT);
        } else {
            // Clear texture.
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
        }
    }

    _setScissor(area) {
        let gl = this.gl
        if (!area) {
            gl.disable(gl.SCISSOR_TEST);
        } else {
            gl.enable(gl.SCISSOR_TEST);
            let precision = this.ctx.stage.getRenderPrecision()
            let y = area[1]
            if (this._renderTexture === null) {
                // Flip.
                y = (this.ctx.stage.h / precision - (area[1] + area[3]))
            }
            gl.scissor(Math.round(area[0] * precision), Math.round(y * precision), Math.round(area[2] * precision), Math.round(area[3] * precision));
        }
        this._scissor = area
    }

}


/**
 * Copyright Metrological, 2017
 */
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

        this.defaultTransitionSettings = new TransitionSettings();
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
        let transitionSettings = new TransitionSettings();
        Base.patchObject(transitionSettings, settings);
        return transitionSettings;
    }

    addActive(transition) {
        this.active.add(transition);
    }

    removeActive(transition) {
        this.active.delete(transition);
    }
}



/**
 * Copyright Metrological, 2017
 */

class TransitionSettings {
    constructor() {
        this._timingFunction = 'ease'
        this._timingFunctionImpl = StageUtils.getTimingFunction(this._timingFunction)
        this.delay = 0
        this.duration = 0.2
        this.merger = null
    }

    get timingFunction() {
        return this._timingFunction
    }

    set timingFunction(v) {
        this._timingFunction = v
        this._timingFunctionImpl = StageUtils.getTimingFunction(v)
    }

    get timingFunctionImpl() {
        return this._timingFunctionImpl
    }

    patch(settings) {
        Base.patchObject(this, settings)
    }
}

TransitionSettings.prototype.isTransitionSettings = true



/**
 * Copyright Metrological, 2017
 */



class Transition extends EventEmitter {

    constructor(manager, settings, view, property) {
        super()

        this.manager = manager;

        this._settings = settings;

        this._view = view
        this._getter = View.getGetter(property)
        this._setter = View.getSetter(property)

        this._merger = settings.merger

        if (!this._merger) {
            this._merger = View.getMerger(property)
        }

        this._startValue = this._getter(this._view)
        this._targetValue = this._startValue

        this._p = 1
        this._delayLeft = 0
    }

    start(targetValue) {
        this._startValue = this._getter(this._view)

        if (!this.isAttached()) {
            // We don't support transitions on non-attached views. Just set value without invoking listeners.
            this._targetValue = targetValue
            this._p = 1;
            this._updateDrawValue()
        } else {
            if (targetValue === this._startValue) {
                this.reset(targetValue, 1)
            } else {
                this._targetValue = targetValue
                this._p = 0
                this._delayLeft = this._settings.delay
                this.emit('start')
                this.add()
            }
        }
    }

    finish() {
        if (this._p < 1) {
            // Value setting and will must be invoked (async) upon next transition cycle.
            this._p = 1
        }
    }

    stop() {
        // Just stop where the transition is at.
        this.manager.removeActive(this)
    }

    reset(targetValue, p) {
        if (!this.isAttached()) {
            // We don't support transitions on non-attached views. Just set value without invoking listeners.
            this._startValue = this._getter(this._view)
            this._targetValue = targetValue
            this._p = 1
            this._updateDrawValue()
        } else {
            this._startValue = this._getter(this._view)
            this._targetValue = targetValue
            this._p = p
            this.add()
        }
    }

    _updateDrawValue() {
        this._setter(this._view, this.getDrawValue())
    }

    add() {
        this.manager.addActive(this)
    }

    isAttached() {
        return this._view.isAttached()
    }

    isRunning() {
        return (this._p < 1.0)
    }

    progress(dt) {
        if (!this.isAttached()) {
            // Skip to end of transition so that it is removed.
            this._p = 1
        }

        if (this.p < 1) {
            if (this.delayLeft > 0) {
                this._delayLeft -= dt

                if (this.delayLeft < 0) {
                    dt = -this.delayLeft
                    this._delayLeft = 0

                    this.emit('delayEnd')
                } else {
                    return
                }
            }

            if (this._settings.duration == 0) {
                this._p = 1
            } else {
                this._p += dt / this._settings.duration
            }
            if (this._p >= 1) {
                // Finished!
                this._p = 1
            }
        }

        this._updateDrawValue()

        this.invokeListeners()
    }

    invokeListeners() {
        this.emit('progress', this.p)
        if (this.p === 1) {
            this.emit('finish')
        }
    }

    updateTargetValue(targetValue) {
        let t = this._settings.timingFunctionImpl(this.p)
        if (t === 1) {
            this._targetValue = targetValue
        } else if (t === 0) {
            this._startValue = this._targetValue
            this._targetValue = targetValue
        } else {
            this._startValue = targetValue - ((targetValue - this._targetValue) / (1 - t))
            this._targetValue = targetValue
        }
    }

    getDrawValue() {
        if (this.p >= 1) {
            return this.targetValue
        } else {
            let v = this._settings._timingFunctionImpl(this.p)
            return this._merger(this.targetValue, this.startValue, v)
        }
    }

    skipDelay() {
        this._delayLeft = 0
    }

    get startValue() {
        return this._startValue
    }

    get targetValue() {
        return this._targetValue
    }

    get p() {
        return this._p
    }

    get delayLeft() {
        return this._delayLeft
    }

    get view() {
        return this._view
    }

    get settings() {
        return this._settings
    }

    set settings(v) {
        this._settings = v;
    }

}

Transition.prototype.isTransition = true




/**
 * Copyright Metrological, 2017
 */
class AnimationManager {

    constructor(stage) {
        this.stage = stage

        this.stage.on('frameStart', () => this.progress())

        /**
         * All running animations on attached subjects.
         * @type {Set<Animation>}
         */
        this.active = new Set()
    }

    progress() {
        if (this.active.size) {
            let dt = this.stage.dt

            let filter = false
            this.active.forEach(function(a) {
                if (a.isActive()) {
                    a.progress(dt)
                } else {
                    filter = true
                }
            })

            if (filter) {
                this.active = new Set([...this.active].filter(t => t.isActive()))
            }
        }
    }

    createAnimation(view, settings) {
        if (Utils.isObjectLiteral(settings)) {
            // Convert plain object to proper settings object.
            settings = this.createSettings(settings)
        }

        return new Animation(
            this,
            settings,
            view
        )
    }

    createSettings(settings) {
        const animationSettings = new AnimationSettings()
        Base.patchObject(animationSettings, settings)
        return animationSettings
    }

    addActive(transition) {
        this.active.add(transition)
    }
}



/**
 * Copyright Metrological, 2017
 */

class AnimationSettings {
    constructor() {
        /**
         * @type {AnimationActionSettings[]}
         * @private
         */
        this._actions = []

        this.delay = 0
        this.duration = 1

        this.repeat = 0
        this.repeatOffset = 0
        this.repeatDelay = 0

        this.autostop = false

        this.stopMethod = AnimationSettings.STOP_METHODS.FADE
        this._stopTimingFunction = 'ease'
        this._stopTimingFunctionImpl = StageUtils.getTimingFunction(this._stopTimingFunction)
        this.stopDuration = 0
        this.stopDelay = 0
    }

    get actions() {
        return this._actions
    }

    set actions(v) {
        this._actions = []
        for (let i = 0, n = v.length; i < n; i++) {
            const e = v[i]
            if (!e.isAnimationActionSettings) {
                const aas = new AnimationActionSettings(this)
                aas.patch(e)
                this._actions.push(aas)
            } else {
                this._actions.push(e)
            }
        }
    }

    /**
     * Applies the animation to the specified view, for the specified progress between 0 and 1.
     * @param {View} view
     * @param {number} p
     * @param {number} factor
     */
    apply(view, p, factor = 1) {
        this._actions.forEach(function(action) {
            action.apply(view, p, factor)
        })
    }

    /**
     * Resets the animation to the reset values.
     * @param {View} view
     */
    reset(view) {
        this._actions.forEach(function(action) {
            action.reset(view)
        })
    }

    get stopTimingFunction() {
        return this._stopTimingFunction
    }

    set stopTimingFunction(v) {
        this._stopTimingFunction = v
        this._stopTimingFunctionImpl = StageUtils.getTimingFunction(v)
    }

    get stopTimingFunctionImpl() {
        return this._stopTimingFunctionImpl
    }

    patch(settings) {
        Base.patchObject(this, settings)
    }
}

AnimationSettings.STOP_METHODS = {
    FADE: 'fade',
    REVERSE: 'reverse',
    FORWARD: 'forward',
    IMMEDIATE: 'immediate',
    ONETOTWO: 'onetotwo'
}



/**
 * Copyright Metrological, 2017
 */

class AnimationActionSettings {

    constructor() {
        /**
         * The selector that selects the views.
         * @type {string}
         */
        this._selector = ""

        /**
         * The value items, ordered by progress offset.
         * @type {AnimationActionItems}
         * @private
         */
        this._items = new AnimationActionItems(this)

        /**
         * The affected properties (paths).
         * @private
         */
        this._props = []

        /**
         * Property setters, indexed according to props.
         * @private
         */
        this._propSetters = []

        this._resetValue = undefined
        this._hasResetValue = false

        this._hasColorProperty = undefined
    }

    getResetValue() {
        if (this._hasResetValue) {
            return this._resetValue
        } else {
            return this._items.getValue(0)
        }
    }

    apply(view, p, factor) {
        const views = this.getAnimatedViews(view)

        let v = this._items.getValue(p)

        if (v === undefined || !views.length) {
            return
        }

        if (factor !== 1) {
            // Stop factor.
            let sv = this.getResetValue()

            if (Utils.isNumber(v) && Utils.isNumber(sv)) {
                if (this.hasColorProperty()) {
                    v = StageUtils.mergeColors(v, sv, factor)
                } else {
                    v = StageUtils.mergeNumbers(v, sv, factor)
                }
            }
        }

        // Apply transformation to all components.
        const n = this._propSetters.length

        const m = views.length
        for (let j = 0; j < m; j++) {
            for (let i = 0; i < n; i++) {
                this._propSetters[i](views[j], v)
            }
        }
    }
    
    getAnimatedViews(view) {
        return view.select(this._selector)
    }

    reset(view) {
        const views = this.getAnimatedViews(view)

        let v = this.getResetValue()

        if (v === undefined || !views.length) {
            return
        }

        // Apply transformation to all components.
        const n = this._propSetters.length

        const m = views.length
        for (let j = 0; j < m; j++) {
            for (let i = 0; i < n; i++) {
                this._propSetters[i](views[j], v)
            }
        }
    }
    
    set selector(v) {
        this._selector = v
    }

    set t(v) {
        this.selector = v
    }

    get resetValue() {
        return this._resetValue
    }
    
    set resetValue(v) {
        this._resetValue = v
        this._hasResetValue = (v !== undefined)
    }

    set rv(v) {
        this.resetValue = v
    }

    set value(v) {
        this._items.parse(v)
    }

    set v(v) {
        this.value = v
    }

    set properties(v) {
        if (!Array.isArray(v)) {
            v = [v]
        }

        this._props = []

        v.forEach((prop) => {
            this._props.push(prop)
            this._propSetters.push(View.getSetter(prop))
        })
    }

    set property(v) {
        this._hasColorProperty = undefined
        this.properties = v
    }

    set p(v) {
        this.properties = v
    }

    patch(settings) {
        Base.patchObject(this, settings)
    }

    hasColorProperty() {
        if (this._hasColorProperty === undefined) {
            this._hasColorProperty = this._props.length ? View.isColorProperty(this._props[0]) : false
        }
        return this._hasColorProperty
    }
}

AnimationActionSettings.prototype.isAnimationActionSettings = true



/**
 * Copyright Metrological, 2017
 */
class AnimationActionItems {
    
    constructor(action) {
        this._action = action
        
        this._clear()
    }

    _clear() {
        this._p = []
        this._pe = []
        this._idp = []
        this._f = []
        this._v = []
        this._lv = []
        this._sm = []
        this._s = []
        this._ve = []
        this._sme = []
        this._se = []

        this._length = 0
    }
    
    parse(def) {
        let i, n
        if (!Utils.isObjectLiteral(def)) {
            def = {0: def}
        }

        let defaultSmoothness = 0.5

        let items = []
        for (let key in def) {
            if (def.hasOwnProperty(key)) {
                let obj = def[key]
                if (!Utils.isObjectLiteral(obj)) {
                    obj = {v: obj}
                }

                let p = parseFloat(key)

                if (key == "sm") {
                    defaultSmoothness = obj.v
                } else if (!isNaN(p) && p >= 0 && p <= 2) {
                    obj.p = p

                    obj.f = Utils.isFunction(obj.v)
                    obj.lv = obj.f ? obj.v(0, 0) : obj.v

                    items.push(obj)
                }
            }
        }

        // Sort by progress value.
        items = items.sort(function(a, b) {return a.p - b.p})

        n = items.length

        for (i = 0; i < n; i++) {
            let last = (i == n - 1)
            if (!items[i].hasOwnProperty('pe')) {
                // Progress.
                items[i].pe = last ? (items[i].p <= 1 ? 1 : 2 /* support onetotwo stop */) : items[i + 1].p
            } else {
                // Prevent multiple items at the same time.
                const max = i < n - 1 ? items[i + 1].p : 1
                if (items[i].pe > max) {
                    items[i].pe = max
                }
            }
            if (items[i].pe === items[i].p) {
                items[i].idp = 0
            } else {
                items[i].idp = 1 / (items[i].pe - items[i].p)
            }
        }

        // Color merger: we need to split/combine RGBA components.
        const rgba = (this._action.hasColorProperty())

        // Calculate bezier helper values.
        for (i = 0; i < n; i++) {
            if (!items[i].hasOwnProperty('sm')) {
                // Smoothness.
                items[i].sm = defaultSmoothness
            }
            if (!items[i].hasOwnProperty('s')) {
                // Slope.
                if (i === 0 || i === n - 1 || (items[i].p === 1 /* for onetotwo */)) {
                    // Horizontal slope at start and end.
                    items[i].s = rgba ? [0, 0, 0, 0] : 0
                } else {
                    const pi = items[i - 1]
                    const ni = items[i + 1]
                    if (pi.p === ni.p) {
                        items[i].s = rgba ? [0, 0, 0, 0] : 0
                    } else {
                        if (rgba) {
                            const nc = StageUtils.getRgbaComponents(ni.lv)
                            const pc = StageUtils.getRgbaComponents(pi.lv)
                            const d = 1 / (ni.p - pi.p)
                            items[i].s = [
                                d * (nc[0] - pc[0]),
                                d * (nc[1] - pc[1]),
                                d * (nc[2] - pc[2]),
                                d * (nc[3] - pc[3])
                            ]
                        } else {
                            items[i].s = (ni.lv - pi.lv) / (ni.p - pi.p)
                        }
                    }
                }
            }
        }

        for (i = 0; i < n - 1; i++) {
            // Calculate value function.
            if (!items[i].f) {

                let last = (i === n - 1)
                if (!items[i].hasOwnProperty('ve')) {
                    items[i].ve = last ? items[i].lv : items[i + 1].lv
                }

                // We can only interpolate on numeric values. Non-numeric values are set literally when reached time.
                if (Utils.isNumber(items[i].v) && Utils.isNumber(items[i].lv)) {
                    if (!items[i].hasOwnProperty('sme')) {
                        items[i].sme = last ? defaultSmoothness : items[i + 1].sm
                    }
                    if (!items[i].hasOwnProperty('se')) {
                        items[i].se = last ? (rgba ? [0, 0, 0, 0] : 0) : items[i + 1].s
                    }

                    // Generate spline.
                    if (rgba) {
                        items[i].v = StageUtils.getSplineRgbaValueFunction(items[i].v, items[i].ve, items[i].p, items[i].pe, items[i].sm, items[i].sme, items[i].s, items[i].se)
                    } else {
                        items[i].v = StageUtils.getSplineValueFunction(items[i].v, items[i].ve, items[i].p, items[i].pe, items[i].sm, items[i].sme, items[i].s, items[i].se)
                    }

                    items[i].f = true
                }
            }
        }

        if (this.length) {
            this._clear()
        }

        for (i = 0, n = items.length; i < n; i++) {
            this._add(items[i])
        }        
    }

    _add(item) {
        this._p.push(item.p || 0)
        this._pe.push(item.pe || 0)
        this._idp.push(item.idp || 0)
        this._f.push(item.f || false)
        this._v.push(item.hasOwnProperty('v') ? item.v : 0 /* v might be false or null */ )
        this._lv.push(item.lv || 0)
        this._sm.push(item.sm || 0)
        this._s.push(item.s || 0)
        this._ve.push(item.ve || 0)
        this._sme.push(item.sme || 0)
        this._se.push(item.se || 0)
        this._length++
    }
    
    _getItem(p) {
        const n = this._length
        if (!n) {
            return -1
        }

        if (p < this._p[0]) {
            return 0
        }

        for (let i = 0; i < n; i++) {
            if (this._p[i] <= p && p < this._pe[i]) {
                return i
            }
        }

        return n - 1;        
    }

    getValue(p) {
        const i = this._getItem(p)
        if (i == -1) {
            return undefined
        } else {
            if (this._f[i]) {
                const o = Math.min(1, Math.max(0, (p - this._p[i]) * this._idp[i]))
                return this._v[i](o)
            } else {
                return this._v[i]
            }
        }
    }

    get length() {
        return this._length
    }

}



/**
 * Copyright Metrological, 2017
 */



class Animation extends EventEmitter {

    constructor(manager, settings, view) {
        super()

        this.manager = manager

        this._settings = settings

        this._view = view

        this._state = Animation.STATES.IDLE

        this._p = 0
        this._delayLeft = 0
        this._repeatsLeft = 0

        this._stopDelayLeft = 0
        this._stopP = 0
    }

    start() {
        if (this._view && this._view.isAttached()) {
            this._p = 0
            this._delayLeft = this.settings.delay
            this._repeatsLeft = this.settings.repeat
            this._state = Animation.STATES.PLAYING
            this.emit('start')
            this.checkActive()
        } else {
            console.warn("View must be attached before starting animation")
        }
    }

    play() {
        if (this._state == Animation.STATES.STOPPING && this.settings.stopMethod == AnimationSettings.STOP_METHODS.REVERSE) {
            // Continue.
            this._state = Animation.STATES.PLAYING
            this.emit('stopContinue')
        } else if (this._state != Animation.STATES.PLAYING && this._state != Animation.STATES.FINISHED) {
            // Restart.
            this.start()
        }
    }

    replay() {
        if (this._state == Animation.STATES.FINISHED) {
            this.start()
        } else {
            this.play()
        }
    }

    skipDelay() {
        this._delayLeft = 0
        this._stopDelayLeft = 0
    }

    finish() {
        if (this._state === Animation.STATES.PLAYING) {
            this._delayLeft = 0
            this._p = 1
        } else if (this._state === Animation.STATES.STOPPING) {
            this._stopDelayLeft = 0
            this._p = 0
        }
    }

    stop() {
        if (this._state === Animation.STATES.STOPPED || this._state === Animation.STATES.IDLE) return

        this._stopDelayLeft = this.settings.stopDelay || 0

        if (((this.settings.stopMethod === AnimationSettings.STOP_METHODS.IMMEDIATE) && !this._stopDelayLeft) || this._delayLeft > 0) {
            // Stop upon next progress.
            this._state = Animation.STATES.STOPPING
            this.emit('stop')
        } else {
            if (this.settings.stopMethod === AnimationSettings.STOP_METHODS.FADE) {
                this._stopP = 0
            }

            this._state = Animation.STATES.STOPPING
            this.emit('stop')
        }

        this.checkActive()
    }

    stopNow() {
        if (this._state !== Animation.STATES.STOPPED || this._state !== Animation.STATES.IDLE) {
            this._state = Animation.STATES.STOPPING
            this._p = 0
            this.emit('stop')
            this.reset()
            this._state = Animation.STATES.STOPPED
            this.emit('stopFinish')
        }
    }

    isPlaying() {
        return this._state === Animation.STATES.PLAYING
    }

    isStopping() {
        return this._state === Animation.STATES.STOPPING
    }

    checkActive() {
        if (this.isActive()) {
            this.manager.addActive(this)
        }
    }

    isActive() {
        return (this._state == Animation.STATES.PLAYING || this._state == Animation.STATES.STOPPING) && this._view && this._view.isAttached()
    }

    progress(dt) {
        if (!this._view) return
        this._progress(dt)
        this.apply()
    }

    _progress(dt) {
        if (this._state == Animation.STATES.STOPPING) {
            this._stopProgress(dt)
            return
        }

        if (this._state != Animation.STATES.PLAYING) {
            return
        }

        if (this._delayLeft > 0) {
            this._delayLeft -= dt

            if (this._delayLeft < 0) {
                dt = -this._delayLeft
                this._delayLeft = 0

                this.emit('delayEnd')
            } else {
                return
            }
        }

        if (this.settings.duration === 0) {
            this._p = 1
        } else if (this.settings.duration > 0) {
            this._p += dt / this.settings.duration
        }
        if (this._p >= 1) {
            // Finished!
            if (this.settings.repeat == -1 || this._repeatsLeft > 0) {
                if (this._repeatsLeft > 0) {
                    this._repeatsLeft--
                }
                this._p = this.settings.repeatOffset

                if (this.settings.repeatDelay) {
                    this._delayLeft = this.settings.repeatDelay
                }

                this.emit('repeat', this._repeatsLeft)
            } else {
                this._p = 1
                this._state = Animation.STATES.FINISHED
                this.emit('finish')
                if (this.settings.autostop) {
                    this.stop()
                }
            }
        } else {
            this.emit('progress', this._p)
        }
    }
    
    _stopProgress(dt) {
        let duration = this._getStopDuration()

        if (this._stopDelayLeft > 0) {
            this._stopDelayLeft -= dt

            if (this._stopDelayLeft < 0) {
                dt = -this._stopDelayLeft
                this._stopDelayLeft = 0

                this.emit('stopDelayEnd')
            } else {
                return
            }
        }
        if (this.settings.stopMethod == AnimationSettings.STOP_METHODS.IMMEDIATE) {
            this._state = Animation.STATES.STOPPED
            this.emit('stopFinish')
        } else if (this.settings.stopMethod == AnimationSettings.STOP_METHODS.REVERSE) {
            if (duration === 0) {
                this._p = 0
            } else if (duration > 0) {
                this._p -= dt / duration
            }

            if (this._p <= 0) {
                this._p = 0
                this._state = Animation.STATES.STOPPED
                this.emit('stopFinish')
            }
        } else if (this.settings.stopMethod == AnimationSettings.STOP_METHODS.FADE) {
            this._progressStopTransition(dt)
            if (this._stopP >= 1) {
                this._p = 0
                this._state = Animation.STATES.STOPPED
                this.emit('stopFinish')
            }
        } else if (this.settings.stopMethod == AnimationSettings.STOP_METHODS.ONETOTWO) {
            if (this._p < 2) {
                if (duration === 0) {
                    this._p = 2
                } else if (duration > 0) {
                    if (this._p < 1) {
                        this._p += dt / this.settings.duration
                    } else {
                        this._p += dt / duration
                    }
                }
                if (this._p >= 2) {
                    this._p = 2
                    this._state = Animation.STATES.STOPPED
                    this.emit('stopFinish')
                } else {
                    this.emit('progress', this._p)
                }
            }
        } else if (this.settings.stopMethod == AnimationSettings.STOP_METHODS.FORWARD) {
            if (this._p < 1) {
                if (this.settings.duration == 0) {
                    this._p = 1
                } else {
                    this._p += dt / this.settings.duration
                }
                if (this._p >= 1) {
                    if (this.settings.stopMethod == AnimationSettings.STOP_METHODS.FORWARD) {
                        this._p = 1
                        this._state = Animation.STATES.STOPPED
                        this.emit('stopFinish')
                    } else {
                        if (this._repeatsLeft > 0) {
                            this._repeatsLeft--
                            this._p = 0
                            this.emit('repeat', this._repeatsLeft)
                        } else {
                            this._p = 1
                            this._state = Animation.STATES.STOPPED
                            this.emit('stopFinish')
                        }
                    }
                } else {
                    this.emit('progress', this._p)
                }
            }
        }
        
    }
    
    _progressStopTransition(dt) {
        if (this._stopP < 1) {
            if (this._stopDelayLeft > 0) {
                this._stopDelayLeft -= dt

                if (this._stopDelayLeft < 0) {
                    dt = -this._stopDelayLeft
                    this._stopDelayLeft = 0

                    this.emit('delayEnd')
                } else {
                    return
                }
            }
            
            const duration = this._getStopDuration()

            if (duration == 0) {
                this._stopP = 1
            } else {
                this._stopP += dt / duration
            }
            if (this._stopP >= 1) {
                // Finished!
                this._stopP = 1
            }
        }
    }

    _getStopDuration() {
        return this.settings.stopDuration || this.settings.duration
    }

    apply() {
        if (this._state == Animation.STATES.STOPPED) {
            this.reset()
        } else {
            let factor = 1
            if (this._state === Animation.STATES.STOPPING && this.settings.stopMethod === AnimationSettings.STOP_METHODS.FADE) {
                factor = (1 - this.settings.stopTimingFunctionImpl(this._stopP))
            }
            this._settings.apply(this._view, this._p, factor)
        }
    }

    reset() {
        this._settings.reset(this._view)
    }

    get state() {
        return this._state
    }

    get p() {
        return this._p
    }

    get delayLeft() {
        return this._delayLeft
    }

    get view() {
        return this._view
    }

    get frame() {
        return Math.round(this._p * this._settings.duration * 60)
    }

    get settings() {
        return this._settings
    }

}

Animation.STATES = {
    IDLE: 0,
    PLAYING: 1,
    STOPPING: 2,
    STOPPED: 3,
    FINISHED: 4
}



class RectangleTexture extends Texture {

    _getLookupId() {
        return '__whitepix'
    }

    _getSourceLoader() {
        return function(cb) {
            var whitePixel = new Uint8Array([255, 255, 255, 255]);
            cb(null, {source: whitePixel, w: 1, h: 1, permanent: true});
        }
    }

}


class NoiseTexture extends Texture {

    _getLookupId() {
        return '__noise'
    }

    _getSourceLoader() {
        const gl = this.stage.gl
        return function(cb) {
            const noise = new Uint8Array(128 * 128 * 4);
            for (let i = 0; i < 128 * 128 * 4; i+=4) {
                const v = Math.floor(Math.random() * 256)
                noise[i] = v
                noise[i+1] = v
                noise[i+2] = v
                noise[i+3] = v
            }
            const texParams = {}
            texParams[gl.TEXTURE_WRAP_S] = gl.REPEAT
            texParams[gl.TEXTURE_WRAP_T] = gl.REPEAT
            texParams[gl.TEXTURE_MIN_FILTER] = gl.NEAREST
            texParams[gl.TEXTURE_MAG_FILTER] = gl.NEAREST

            cb(null, {source: noise, w: 128, h: 128, texParams: texParams});
        }
    }

}


class ImageTexture extends Texture {

    constructor(stage) {
        super(stage)

        this._src = undefined
        this._hasAlpha = false
    }

    get src() {
        return this._src
    }

    set src(v) {
        if (this._src !== v) {
            this._src = v
            this._changed()
        }
    }

    get hasAlpha() {
        return this._hasAlpha
    }

    set hasAlpha(v) {
        if (this._hasAlpha !== v) {
            this._hasAlpha = v
            this._changed()
        }
    }

    _getIsValid() {
        return !!this._src
    }

    _getLookupId() {
        return this._src
    }

    _getSourceLoader() {
        let src = this._src
        let hasAlpha = this._hasAlpha
        if (this.stage.getOption('srcBasePath')) {
            var fc = src.charCodeAt(0)
            if ((src.indexOf("//") === -1) && ((fc >= 65 && fc <= 90) || (fc >= 97 && fc <= 122) || fc == 46)) {
                // Alphabetical or dot: prepend base path.
                src = this.stage.getOption('srcBasePath') + src
            }
        }

        const adapter = this.stage.adapter
        return function(cb) {
            return adapter.loadSrcTexture({src: src, hasAlpha: hasAlpha}, cb)
        }
    }

    getNonDefaults() {
        const obj = super.getNonDefaults()
        if (this._src) {
            obj.src = this._src
        }
        return obj
    }

}


class SourceTexture extends Texture {

    constructor(stage) {
        super(stage)

        this._textureSource = undefined
    }

    get textureSource() {
        return this._textureSource
    }

    set textureSource(v) {
        if (v !== this._textureSource) {
            this._textureSource = v
            this._changed()
        }
    }

    _getTextureSource() {
        return this._textureSource
    }

}


class TextTexture extends Texture {

    constructor(stage) {
        super(stage)

        // We use the stage precision as the default precision in case of a text texture.
        this._precision = this.stage.getOption('precision')
    }

    get text() {
        return this._text
    }

    set text(v) {
        if (this._text !== v) {
            this._text = "" + v;
            this._changed();
        }
    }

    get w() {
        return this._w
    }

    set w(v) {
        if (this._w !== v) {
            this._w = v;
            this._changed();
        }
    }

    get h() {
        return this._h
    }

    set h(v) {
        if (this._h !== v) {
            this._h = v;
            this._changed();
        }
    }

    get fontStyle() {
        return this._fontStyle
    }

    set fontStyle(v) {
        if (this._fontStyle !== v) {
            this._fontStyle = v;
            this._changed();
        }
    }

    get fontSize() {
        return this._fontSize
    }

    set fontSize(v) {
        if (this._fontSize !== v) {
            this._fontSize = v;
            this._changed();
        }
    }

    get fontFace() {
        return this._fontFace
    }

    set fontFace(v) {
        if (this._fontFace !== v) {
            this._fontFace = v;
            this._changed();
        }
    }

    get wordWrap() {
        return this._wordWrap
    }

    set wordWrap(v) {
        if (this._wordWrap !== v) {
            this._wordWrap = v;
            this._changed();
        }
    }

    get wordWrapWidth() {
        return this._wordWrapWidth
    }

    set wordWrapWidth(v) {
        if (this._wordWrapWidth !== v) {
            this._wordWrapWidth = v;
            this._changed();
        }
    }

    get lineHeight() {
        return this._lineHeight
    }

    set lineHeight(v) {
        if (this._lineHeight !== v) {
            this._lineHeight = v;
            this._changed();
        }
    }

    get textBaseline() {
        return this._textBaseline
    }

    set textBaseline(v) {
        if (this._textBaseline !== v) {
            this._textBaseline = v;
            this._changed();
        }
    }

    get textAlign() {
        return this._textAlign
    }

    set textAlign(v) {
        if (this._textAlign !== v) {
            this._textAlign = v;
            this._changed();
        }
    }

    get offsetY() {
        return this._offsetY
    }

    set offsetY(v) {
        if (this._offsetY !== v) {
            this._offsetY = v;
            this._changed();
        }
    }

    get maxLines() {
        return this._maxLines
    }

    set maxLines(v) {
        if (this._maxLines !== v) {
            this._maxLines = v;
            this._changed();
        }
    }

    get maxLinesSuffix() {
        return this._maxLinesSuffix
    }

    set maxLinesSuffix(v) {
        if (this._maxLinesSuffix !== v) {
            this._maxLinesSuffix = v;
            this._changed();
        }
    }

    get textColor() {
        return this._textColor
    }

    set textColor(v) {
        if (this._textColor !== v) {
            this._textColor = v;
            this._changed();
        }
    }

    get paddingLeft() {
        return this._paddingLeft
    }

    set paddingLeft(v) {
        if (this._paddingLeft !== v) {
            this._paddingLeft = v;
            this._changed();
        }
    }

    get paddingRight() {
        return this._paddingRight
    }

    set paddingRight(v) {
        if (this._paddingRight !== v) {
            this._paddingRight = v;
            this._changed();
        }
    }

    get shadow() {
        return this._shadow
    }

    set shadow(v) {
        if (this._shadow !== v) {
            this._shadow = v;
            this._changed();
        }
    }

    get shadowColor() {
        return this._shadowColor
    }

    set shadowColor(v) {
        if (this._shadowColor !== v) {
            this._shadowColor = v;
            this._changed();
        }
    }

    get shadowOffsetX() {
        return this._shadowOffsetX
    }

    set shadowOffsetX(v) {
        if (this._shadowOffsetX !== v) {
            this._shadowOffsetX = v;
            this._changed();
        }
    }

    get shadowOffsetY() {
        return this._shadowOffsetY
    }

    set shadowOffsetY(v) {
        if (this._shadowOffsetY !== v) {
            this._shadowOffsetY = v;
            this._changed();
        }
    }

    get shadowBlur() {
        return this._shadowBlur
    }

    set shadowBlur(v) {
        if (this._shadowBlur !== v) {
            this._shadowBlur = v;
            this._changed();
        }
    }

    get highlight() {
        return this._highlight
    }

    set highlight(v) {
        if (this._highlight !== v) {
            this._highlight = v;
            this._changed();
        }
    }

    get highlightHeight() {
        return this._highlightHeight
    }

    set highlightHeight(v) {
        if (this._highlightHeight !== v) {
            this._highlightHeight = v;
            this._changed();
        }
    }

    get highlightColor() {
        return this._highlightColor
    }

    set highlightColor(v) {
        if (this._highlightColor !== v) {
            this._highlightColor = v;
            this._changed();
        }
    }

    get highlightOffset() {
        return this._highlightOffset
    }

    set highlightOffset(v) {
        if (this._highlightOffset !== v) {
            this._highlightOffset = v;
            this._changed();
        }
    }

    get highlightPaddingLeft() {
        return this._highlightPaddingLeft
    }

    set highlightPaddingLeft(v) {
        if (this._highlightPaddingLeft !== v) {
            this._highlightPaddingLeft = v;
            this._changed();
        }
    }

    get highlightPaddingRight() {
        return this._highlightPaddingRight
    }

    set highlightPaddingRight(v) {
        if (this._highlightPaddingRight !== v) {
            this._highlightPaddingRight = v;
            this._changed();
        }
    }

    get cutSx() {
        return this._cutSx
    }

    set cutSx(v) {
        if (this._cutSx !== v) {
            this._cutSx = v;
            this._changed();
        }
    }

    get cutEx() {
        return this._cutEx
    }

    set cutEx(v) {
        if (this._cutEx !== v) {
            this._cutEx = v;
            this._changed();
        }
    }

    get cutSy() {
        return this._cutSy
    }

    set cutSy(v) {
        if (this._cutSy !== v) {
            this._cutSy = v;
            this._changed();
        }
    }

    get cutEy() {
        return this._cutEy
    }

    set cutEy(v) {
        if (this._cutEy !== v) {
            this._cutEy = v;
            this._changed();
        }
    }

    get precision() {
        return super.precision
    }

    set precision(v) {
        // We actually draw differently when the precision changes.
        if (this.precision !== v) {
            super.precision = v
            this._changed()
        }
    }

    _getIsValid() {
        return !!this.text
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
        const args = this.cloneArgs()

        // Inherit font face from stage.
        if (args.fontFace === null) {
            args.fontFace = this.stage.getOption('defaultFontFace');
        }

        const canvas = this.stage.adapter.getDrawingCanvas()
        return function(cb) {
            const renderer = new TextTextureRenderer(this.stage, canvas, args)
            renderer.draw()
            cb(null, this.stage.adapter.getTextureOptionsForDrawingCanvas(canvas))
        }
    }

    getNonDefaults() {
        const nonDefaults = super.getNonDefaults()
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
        return nonDefaults
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
let proto = TextTexture.prototype
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



/**
 * Copyright Metrological, 2017
 */
class TextTextureRenderer {

    constructor(stage, canvas, settings) {
        this._stage = stage
        this._canvas = canvas;
        this._context = this._canvas.getContext('2d');
        this._settings = settings;
    }

    getPrecision() {
        return this._settings.precision;
    };

    setFontProperties(withPrecision) {
        let ff = this._settings.fontFace;
        let fonts = '"' + (Array.isArray(ff) ? this._settings.fontFace.join('","') : ff) + '"';
        let precision = (withPrecision ? this.getPrecision() : 1);
        this._context.font = this._settings.fontStyle + " " + Math.floor(this._settings.fontSize * precision) + "px " + fonts;
        this._context.textBaseline = this._settings.textBaseline;
    };

    draw(noDraw = false) {
        let renderInfo = {};

        // Set font properties.
        this.setFontProperties(false);

        // Total width.
        let width = this._settings.w || (2048 / this.getPrecision());

        // Inner width.
        let innerWidth = width - (this._settings.paddingLeft + this._settings.paddingRight);
        if (innerWidth < 10) {
            width += (10 - innerWidth);
            innerWidth += (10 - innerWidth);
        }

        let wordWrapWidth = this._settings.wordWrapWidth || innerWidth;

        // word wrap
        // preserve original text
        let linesInfo;
        if (this._settings.wordWrap) {
            linesInfo = this.wrapText(this._settings.text, wordWrapWidth);
        } else {
            linesInfo = {l: this._settings.text.split(/(?:\r\n|\r|\n)/), n: []};
            let i, n = linesInfo.l.length;
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
                let w = this._settings.maxLinesSuffix ? this._context.measureText(this._settings.maxLinesSuffix).width : 0
                let al = this.wrapText(usedLines[usedLines.length - 1], wordWrapWidth - w);
                usedLines[usedLines.length - 1] = al.l[0] + this._settings.maxLinesSuffix;
                otherLines = [al.l.length > 1 ? al.l[1] : ''];
            } else {
                otherLines = ['']
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

        if (!this._settings.w) {
            // Auto-set width to max text length.
            width = maxLineWidth + this._settings.paddingLeft + this._settings.paddingRight;
            innerWidth = maxLineWidth;
        }

        // calculate text height
        let lineHeight = this._settings.lineHeight || (this._settings.fontSize);

        let height;
        if (this._settings.h) {
            height = this._settings.h;
        } else {
            height = lineHeight * (lines.length - 1) + 0.5 * this._settings.fontSize + Math.max(lineHeight, this._settings.fontSize) + this._settings.offsetY;
        }

        let offsetY = this._settings.offsetY === null ? this._settings.fontSize : this._settings.offsetY;

        let precision = this.getPrecision();

        renderInfo.w = width * precision;
        renderInfo.h = height * precision;
        renderInfo.lines = lines;
        renderInfo.precision = precision;

        if (!noDraw) {
            if (!width) {
                // To prevent canvas errors.
                width = 1;
            }

            if (!height) {
                // To prevent canvas errors.
                height = 1;
            }

            if (this._settings.cutSx || this._settings.cutEx) {
                width = Math.min(width, this._settings.cutEx - this._settings.cutSx);
            }

            if (this._settings.cutSy || this._settings.cutEy) {
                height = Math.min(height, this._settings.cutEy - this._settings.cutSy);
            }

            // Add extra margin to prevent issue with clipped text when scaling.
            this._canvas.width = Math.ceil(width * precision + this._stage.getOption('textRenderIssueMargin'));
            this._canvas.height = Math.ceil(height * precision);

            // After changing the canvas, we need to reset the properties.
            this.setFontProperties(true);

            if (this._settings.cutSx || this._settings.cutSy) {
                this._context.translate(-(this._settings.cutSx * precision), -(this._settings.cutSy * precision));
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
                linePositionX += this._settings.paddingLeft;

                drawLines.push({text: lines[i], x: linePositionX * precision, y: linePositionY * precision, w: lineWidths[i] * precision});
            }

            // Highlight.
            if (this._settings.highlight) {
                let color = this._settings.highlightColor || 0x00000000;
                let hlHeight = (this._settings.highlightHeight || this._settings.fontSize * 1.5);
                let offset = (this._settings.highlightOffset !== null ? this._settings.highlightOffset : -0.5 * this._settings.fontSize);
                let paddingLeft = (this._settings.highlightPaddingLeft !== null ? this._settings.highlightPaddingLeft : this._settings.paddingLeft);
                let paddingRight = (this._settings.highlightPaddingRight !== null ? this._settings.highlightPaddingRight : this._settings.paddingRight);

                this._context.fillStyle = StageUtils.getRgbaString(color);
                for (i = 0; i < drawLines.length; i++) {
                    let drawLine = drawLines[i];
                    this._context.fillRect((drawLine.x - paddingLeft) * precision, (drawLine.y + offset) * precision, (drawLine.w + paddingRight + paddingLeft) * precision, hlHeight * precision);
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

            if (this._settings.cutSx || this._settings.cutSy) {
                this._context.translate(this._settings.cutSx, this._settings.cutSy);
            }
        }

        let canvas = this._canvas;
        return {renderInfo: renderInfo, canvas: canvas};
    };

    /**
     * Applies newlines to a string to have it optimally fit into the horizontal
     * bounds set by the Text object's wordWrapWidth property.
     */
    wrapText(text, wordWrapWidth) {
        // Greedy wrapping algorithm that will wrap words as the line grows longer
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
                    // Skip printing the newline if it's the first word of the line that is
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



class StaticCanvasTexture extends Texture {

    constructor(stage) {
        super(stage)
        this._factory = undefined
        this._lookupId = undefined
    }

    set content({factory, lookupId = undefined}) {
        this._factory = factory
        this._lookupId = lookupId
        this._changed()
    }

    _getIsValid() {
        return !!this._factory
    }

    _getLookupId() {
        return this._lookupId
    }

    _getSourceLoader() {
        const f = this._factory
        return (cb) => {
            return f((err, canvas) => {
                if (err) {
                    return cb(err)
                }
                cb(null, this.stage.adapter.getTextureOptionsForDrawingCanvas(canvas))
            }, this.stage)
        }
    }

}


class StaticTexture extends Texture {

    constructor(stage, options) {
        super(stage)

        this._options = options
    }

    set options(v) {
        if (this._options !== v) {
            this._options = v
            this._changed()
        }
    }

    _getIsValid() {
        return !!this._options
    }

    _getSourceLoader() {
        return (cb) => {
            cb(null, this._options)
        }
    }

}


class HtmlTexture extends Texture {

    constructor(stage) {
        super(stage)
        this._htmlElement = undefined
        this._scale = 1
    }

    set htmlElement(v) {
        this._htmlElement = v
        this._changed()
    }

    get htmlElement() {
        return this._htmlElement
    }

    set scale(v) {
        this._scale = v
        this._changed()
    }

    get scale() {
        return this._scale
    }

    set html(v) {
        if (!v) {
            this.htmlElement = undefined
        } else {
            const d = document.createElement('div')
            d.innerHTML = "<div>" + v + "</div>"
            this.htmlElement = d.firstElementChild
        }
    }

    get html() {
        return this._htmlElement.innerHTML
    }

    _getIsValid() {
        return this.htmlElement
    }

    _getLookupId() {
        return this._scale + ":" + this._htmlElement.innerHTML
    }

    _getSourceLoader() {
        const htmlElement = this._htmlElement
        const scale = this._scale
        return function(cb) {
            if (!window.html2canvas) {
                return cb(new Error("Please include html2canvas (https://html2canvas.hertzen.com/)"))
            }

            const area = HtmlTexture.getPreloadArea()
            area.appendChild(htmlElement)

            html2canvas(htmlElement, {backgroundColor: null, scale: scale}).then(function(canvas) {
                area.removeChild(htmlElement)
                if (canvas.height === 0) {
                    return cb(new Error("Canvas height is 0"))
                }
                cb(null, {source: canvas, width: canvas.width, height: canvas.height})
            }).catch(e => {
                console.error(e)
            });
        }
    }

    static getPreloadArea() {
        if (!this._preloadArea) {
            // Preload area must be included in document body and must be visible to trigger html element rendering.
            this._preloadArea = document.createElement('div')
            if (this._preloadArea.attachShadow) {
                // Use a shadow DOM if possible to prevent styling from interfering.
                this._preloadArea.attachShadow({mode: 'closed'});
            }
            this._preloadArea.style.opacity = 0
            this._preloadArea.style.pointerEvents = 'none'
            this._preloadArea.style.position = 'fixed'
            this._preloadArea.style.display = 'block'
            this._preloadArea.style.top = '100vh'
            this._preloadArea.style.overflow = 'hidden'
            document.body.appendChild(this._preloadArea)
        }
        return this._preloadArea
    }
}

/**
 * Copyright Metrological, 2017
 */

class Tools {

    static getCanvasTexture(canvasFactory, lookupId) {
        return {type: StaticCanvasTexture, content: {factory: canvasFactory, lookupId: lookupId}}
    }

    static getRoundRect(w, h, radius, strokeWidth, strokeColor, fill, fillColor) {
        if (!Array.isArray(radius)){
            // upper-left, upper-right, bottom-right, bottom-left.
            radius = [radius, radius, radius, radius]
        }

        let factory = (cb, stage) => {
            cb(null, this.createRoundRect(stage, w, h, radius, strokeWidth, strokeColor, fill, fillColor))
        }
        let id = 'rect' + [w, h, strokeWidth, strokeColor, fill ? 1 : 0, fillColor].concat(radius).join(",");
        return Tools.getCanvasTexture(factory, id);
    }

    static createRoundRect(stage, w, h, radius, strokeWidth, strokeColor, fill, fillColor) {
        if (fill === undefined) fill = true;
        if (strokeWidth === undefined) strokeWidth = 0;

        let canvas = stage.adapter.getDrawingCanvas();
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
            radius = [radius, radius, radius, radius]
        }

        let factory = (cb, stage) => {
            cb(null, this.createShadowRect(stage, w, h, radius, blur, margin))
        }
        let id = 'shadow' + [w, h, blur, margin].concat(radius).join(",");
        return Tools.getCanvasTexture(factory, id);
    }

    static createShadowRect(stage, w, h, radius, blur, margin) {
        let canvas = stage.adapter.getDrawingCanvas();
        let ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;

        canvas.width = w + margin * 2;
        canvas.height = h + margin * 2;

        ctx.shadowColor = StageUtils.getRgbaString(0xFFFFFFFF)
        ctx.fillStyle = StageUtils.getRgbaString(0xFFFFFFFF)
        ctx.shadowBlur = blur
        ctx.shadowOffsetX = (w + 10) + margin
        ctx.shadowOffsetY = margin

        ctx.beginPath();
        const x = -(w + 10)
        const y = 0

        ctx.moveTo(x + radius[0], y);
        ctx.lineTo(x + w - radius[1], y);
        ctx.arcTo(x + w, y, x + w, y + radius[1], radius[1]);
        ctx.lineTo(x + w, y + h - radius[2]);
        ctx.arcTo(x + w, y + h, x + w - radius[2], y + h, radius[2]);
        ctx.lineTo(x + radius[3], y + h);
        ctx.arcTo(x, y + h, x, y + h - radius[3], radius[3]);
        ctx.lineTo(x, y + radius[0]);
        ctx.arcTo(x, y, x + radius[0], y, radius[0]);
        ctx.fill()

        return canvas;
    }

    static getSvgTexture(url, w, h) {
        let factory = (cb, stage) => {
            this.createSvg(cb, stage, url, w, h)
        }
        let id = 'svg' + [w, h, url].join(",");
        return Tools.getCanvasTexture(factory, id);
    }

    static createSvg(cb, stage, url, w, h) {
        let canvas = stage.adapter.getDrawingCanvas();
        let ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;

        let img = new Image()
        img.onload = () => {
            canvas.width = w
            canvas.height = h
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            cb(null, canvas)
        }
        img.onError = (err) => {
            cb(err)
        }
        img.src = url
    }

}


/**
 * Manages the list of children for a view.
 */


class ObjectListProxy extends ObjectList {

    constructor(target) {
        super()
        this._target = target
    }

    onAdd(item, index) {
        this._target.addAt(item, index)
    }

    onRemove(item, index) {
        this._target.removeAt(index)
    }

    onSync(removed, added, order) {
        this._target._setByArray(order)
    }

    onSet(item, index) {
        this._target.setAt(item, index)
    }

    onMove(item, fromIndex, toIndex) {
        this._target.setAt(item, toIndex)
    }

    createItem(object) {
        return this._target.createItem(object)
    }

    isItem(object) {
        return this._target.isItem(object)
    }

}



/**
 * Manages the list of children for a view.
 */


class ObjectListWrapper extends ObjectListProxy {

    constructor(target, wrap) {
        super(target)
        this._wrap = wrap
    }

    wrap(item) {
        let wrapper = this._wrap(item)
        item._wrapper = wrapper
        return wrapper
    }

    onAdd(item, index) {
        item = this.wrap(item)
        super.onAdd(item, index)
    }

    onRemove(item, index) {
        super.onRemove(item, index)
    }

    onSync(removed, added, order) {
        added.forEach(a => this.wrap(a))
        order = order.map(a => a._wrapper)
        super.onSync(removed, added, order)
    }

    onSet(item, index) {
        item = this.wrap(item)
        super.onSet(item, index)
    }

    onMove(item, fromIndex, toIndex) {
        super.onMove(item, fromIndex, toIndex)
    }

}



/**
 * Copyright Metrological, 2017
 */

class ListView extends View {

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

        this.itemList = new ListItems(this)
    }

    _allowChildrenAccess() {
        return false
    }

    get items() {
        return this.itemList.get()
    }

    set items(children) {
        this.itemList.patch(children)
    }

    start() {
        this._wrapper.transition(this.property, this._scrollTransitionSettings)
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
            let parent = item.stage.createView()
            parent.add(item)
            parent.visible = false
            return parent
        })

        super(list._wrapper._children, wrap);
        this.list = list;
    }

    onAdd(item, index) {
        super.onAdd(item, index)
        this.checkStarted(index)
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
        super.onRemove(item, index)
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
        super.onSet(item, index)
        this.checkStarted(index)
    }

    onSync(removed, added, order) {
        super.onSync(removed, added, order)
        this.checkStarted(0)
    }

}



/**
 * Copyright Metrological, 2017
 */

class BorderView extends View {

    constructor(stage) {
        super(stage);

        this.patch({
            "Content": {},
            "Borders": {
                "Top": {rect: true, visible: false, mountY: 1},
                "Right": {rect: true, visible: false},
                "Bottom": {rect: true, visible: false},
                "Left": {rect: true, visible: false, mountX: 1}
            }
        }, true)

        this._borderTop = this.tag("Top")
        this._borderRight = this.tag("Right")
        this._borderBottom = this.tag("Bottom")
        this._borderLeft = this.tag("Left")

        this.onAfterUpdate = function (view) {
            const content = view.childList.first
            let rw = view.core.rw || content.renderWidth;
            let rh = view.core.rh || content.renderHeight;
            view._borderTop.w = rw;
            view._borderBottom.y = rh;
            view._borderBottom.w = rw;
            view._borderLeft.h = rh + view._borderTop.h + view._borderBottom.h;
            view._borderLeft.y = -view._borderTop.h;
            view._borderRight.x = rw;
            view._borderRight.h = rh + view._borderTop.h + view._borderBottom.h;
            view._borderRight.y = -view._borderTop.h;
        }
    }

    get content() {
        return this.sel('Content')
    }

    set content(v) {
        this.sel('Content').patch(v, true)
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

}

/**
 * Copyright Metrological, 2017
 */


class FastBlurView extends View {

    constructor(stage) {
        super(stage)

        let fastBoxBlurShader = FastBlurView.getFastBoxBlurShader(stage.ctx)

        this.tagRoot = true

        this.patch({
            "Textwrap": {renderToTexture: false, hideResultTexture: true, "Content": {}},
            "Layers": {
                "L0": {renderToTexture: true, hideResultTexture: true, visible: false, "Content": {shader: fastBoxBlurShader}},
                "L1": {renderToTexture: true, hideResultTexture: true, visible: false, "Content": {shader: fastBoxBlurShader}},
                "L2": {renderToTexture: true, hideResultTexture: true, visible: false, "Content": {shader: fastBoxBlurShader}},
                "L3": {renderToTexture: true, hideResultTexture: true, visible: false, "Content": {shader: fastBoxBlurShader}},
            },
            "Result": {shader: {type: FastBlurOutputShader}, visible: false}
        }, true)

        this._textwrap = this.sel("Textwrap")
        this._wrapper = this.sel("Textwrap>Content")
        this._layers = this.sel("Layers")
        this._output = this.sel("Result")

        this.getLayerContents(0).texture = this._textwrap.getTexture()
        this.getLayerContents(1).texture = this.getLayer(0).getTexture()
        this.getLayerContents(2).texture = this.getLayer(1).getTexture()
        this.getLayerContents(3).texture = this.getLayer(2).getTexture()

        let filters = FastBlurView.getLinearBlurFilters(stage.ctx)
        this.getLayer(1).filters = [filters[0], filters[1]]
        this.getLayer(2).filters = [filters[2], filters[3], filters[0], filters[1]]
        this.getLayer(3).filters = [filters[2], filters[3], filters[0], filters[1]]

        this._amount = 0
        this._paddingX = 0
        this._paddingY = 0
    }

    get content() {
        return this.sel('Textwrap>Content')
    }

    set content(v) {
        this.sel('Textwrap>Content').patch(v, true)
    }

    set padding(v) {
        this._paddingX = v
        this._paddingY = v
        this._updateBlurSize()
    }

    set paddingX(v) {
        this.paddingX = v
        this._updateBlurSize()
    }

    set paddingY(v) {
        this.paddingY = v
        this._updateBlurSize()
    }

    getLayer(i) {
        return this._layers.sel("L" + i)
    }

    getLayerContents(i) {
        return this.getLayer(i).sel("Content")
    }

    _updateDimensions() {
        if (super._updateDimensions()) {
            this._updateBlurSize()
        }
    }

    _updateBlurSize() {
        let w = this.renderWidth
        let h = this.renderHeight

        let paddingX = this._paddingX
        let paddingY = this._paddingY

        let fw = w + paddingX * 2
        let fh = h + paddingY * 2
        this._textwrap.w = fw
        this._wrapper.x = paddingX
        this.getLayer(0).w = this.getLayerContents(0).w = fw / 2
        this.getLayer(1).w = this.getLayerContents(1).w = fw / 4
        this.getLayer(2).w = this.getLayerContents(2).w = fw / 8
        this.getLayer(3).w = this.getLayerContents(3).w = fw / 16
        this._output.x = -paddingX
        this._textwrap.x = -paddingX
        this._output.w = fw

        this._textwrap.h = fh
        this._wrapper.y = paddingY
        this.getLayer(0).h = this.getLayerContents(0).h = fh / 2
        this.getLayer(1).h = this.getLayerContents(1).h = fh / 4
        this.getLayer(2).h = this.getLayerContents(2).h = fh / 8
        this.getLayer(3).h = this.getLayerContents(3).h = fh / 16
        this._output.y = -paddingY
        this._textwrap.y = -paddingY
        this._output.h = fh

        this.w = w
        this.h = h
    }

    /**
     * Sets the amount of blur. A value between 0 and 4. Goes up exponentially for blur.
     * Best results for non-fractional values.
     * @param v
     */
    set amount(v) {
        this._amount = v
        this._update()
    }

    get amount() {
        return this._amount
    }

    _update() {
        let v = Math.min(4, Math.max(0, this._amount))
        if (v === 0) {
            this._textwrap.renderToTexture = false
            this._output.shader.otherTextureSource = null
            this._output.visible = false
        } else {
            this._textwrap.renderToTexture = true
            this._output.visible = true

            this.getLayer(0).visible = (v > 0);
            this.getLayer(1).visible = (v > 1);
            this.getLayer(2).visible = (v > 2);
            this.getLayer(3).visible = (v > 3);

            if (v <= 1) {
                this._output.texture = this._textwrap.getTexture()
                this._output.shader.otherTextureSource = this.getLayer(0).getTexture()
                this._output.shader.a = v
            } else if (v <= 2) {
                this._output.texture = this.getLayer(0).getTexture()
                this._output.shader.otherTextureSource = this.getLayer(1).getTexture()
                this._output.shader.a = v - 1
            } else if (v <= 3) {
                this._output.texture = this.getLayer(1).getTexture()
                this._output.shader.otherTextureSource = this.getLayer(2).getTexture()
                this._output.shader.a = v - 2
            } else if (v <= 4) {
                this._output.texture = this.getLayer(2).getTexture()
                this._output.shader.otherTextureSource = this.getLayer(3).getTexture()
                this._output.shader.a = v - 3
            }
        }
    }

    set shader(s) {
        super.shader = s
        if (!this.renderToTexture) {
            console.warn("FastBlurView: please enable renderToTexture to use with a shader.")
        }
    }

    static getFastBoxBlurShader(ctx) {
        if (!ctx.fastBoxBlurShader) {
            ctx.fastBoxBlurShader = new FastBoxBlurShader(ctx)
        }
        return ctx.fastBoxBlurShader
    }

    static getLinearBlurFilters(ctx) {
        if (!ctx.linearBlurFilters) {
            ctx.linearBlurFilters = []

            let lbf = new LinearBlurFilter(ctx)
            lbf.x = 1
            lbf.y = 0
            lbf.kernelRadius = 1
            ctx.linearBlurFilters.push(lbf)

            lbf = new LinearBlurFilter(ctx)
            lbf.x = 0
            lbf.y = 1
            lbf.kernelRadius = 1
            ctx.linearBlurFilters.push(lbf)

            lbf = new LinearBlurFilter(ctx)
            lbf.x = 1.5
            lbf.y = 0
            lbf.kernelRadius = 1
            ctx.linearBlurFilters.push(lbf)

            lbf = new LinearBlurFilter(ctx)
            lbf.x = 0
            lbf.y = 1.5
            lbf.kernelRadius = 1
            ctx.linearBlurFilters.push(lbf)
        }
        return ctx.linearBlurFilters
    }


}

/**
 * 4x4 box blur shader which works in conjunction with a 50% rescale.
 */
class FastBoxBlurShader extends Shader {

    constructor(ctx) {
        super(ctx)
    }

    setupUniforms(operation) {
        super.setupUniforms(operation)
        var dx = 1.0 / operation.getTextureWidth(0);
        var dy = 1.0 / operation.getTextureHeight(0);
        this._setUniform("stepTextureCoord", new Float32Array([dx, dy]), this.gl.uniform2fv)
    }

}

FastBoxBlurShader.vertexShaderSource = `
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

FastBoxBlurShader.fragmentShaderSource = `
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

/**
 * Shader that combines two textures into one output.
 */
class FastBlurOutputShader extends Shader {

    constructor(ctx) {
        super(ctx)

        this._a = 0
        this._otherTextureSource = null
    }

    get a() {
        return this._a
    }

    set a(v) {
        this._a = v
        this.redraw()
    }

    set otherTextureSource(v) {
        this._otherTextureSource = v
        this.redraw()
    }

    setupUniforms(operation) {
        super.setupUniforms(operation)
        this._setUniform("a", this._a, this.gl.uniform1f)
        this._setUniform("uSampler2", 1, this.gl.uniform1i)
    }

    beforeDraw(operation) {
        let glTexture = this._otherTextureSource ? this._otherTextureSource.glTexture : null

        let gl = this.gl
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, glTexture)
        gl.activeTexture(gl.TEXTURE0)
    }

    isMergable(shader) {
        return super.isMergable(shader) && (shader._otherTextureSource === this._otherTextureSource)
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



/**
 * Copyright Metrological, 2017
 */

class SmoothScaleView extends View {

    constructor(stage) {
        super(stage);

        this._smoothScale = 1;
        this._iterations = 0;

        this.patch({
            "ContentWrap": {
                hideResultTexture: true,
                "Content": {}
            },
            "Scale": {visible: false
            }
        }, true);

        this.sel("ContentWrap").onAfterUpdate = (view) => {
            const content = view.sel("Content")
            if (content.renderWidth !== this._w || content.renderHeight !== this._h) {
                this._updateDimensions()
            }
        };
    }

    get content() {
        return this.tag('Content')
    }

    set content(v) {
        this.tag('Content').patch(v, true)
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
                const first = scalers.length === 0
                const texture = (first ? content.getTexture() : scalers.last.getTexture());
                scalers.a({renderToTexture: true, hideResultTexture: true, texture: texture});
            }

            this._updateDimensions()

            const useScalers = (its > 0);
            this.patch({
                "ContentWrap": {renderToTexture: useScalers},
                "Scale": {visible: useScalers}
            });

            for (let i = 0, n = scalers.length; i < n; i++) {
                scalers.getAt(i).patch({
                    visible: i < its,
                    hideResultTexture: i !== its - 1
                });
            }
            this._iterations = its;
        }
    }

    _updateDimensions() {
        let w = this.tag("Content").renderWidth;
        let h = this.tag("Content").renderHeight;

        this.sel("ContentWrap").patch({w: w, h: h});

        const scalers = this.sel("Scale").childList;
        for (let i = 0, n = scalers.length; i < n; i++) {
            w = w * 0.5;
            h = h * 0.5;
            scalers.getAt(i).patch({w: w, h: h});
        }
    }



}


/**
 * This shader can be used to fix a problem that is known as 'gradient banding'.
 */
class DitheringShader extends Shader {

    constructor(ctx) {
        super(ctx)

        this._noiseTexture = new NoiseTexture(ctx.stage)

        this._graining = 1/256

        this._random = false
    }

    set graining(v) {
        this._graining = v
        this.redraw()
    }

    set random(v) {
        this._random = v
        this.redraw()
    }

    setExtraAttribsInBuffer(operation) {
        // Make sure that the noise texture is uploaded to the GPU.
        this._noiseTexture.load()

        let offset = operation.extraAttribsDataByteOffset / 4
        let floats = operation.quads.floats

        let length = operation.length

        for (let i = 0; i < length; i++) {

            // Calculate ǹoise texture coordinates so that it spans the full view.
            let brx = operation.getViewWidth(i) / this._noiseTexture.getRenderWidth()
            let bry = operation.getViewHeight(i) / this._noiseTexture.getRenderHeight()

            let ulx = 0
            let uly = 0
            if (this._random) {
                ulx = Math.random()
                uly = Math.random()

                brx += ulx
                bry += uly

                if (Math.random() < 0.5) {
                    // Flip for more randomness.
                    const t = ulx
                    ulx = brx
                    brx = t
                }

                if (Math.random() < 0.5) {
                    // Flip for more randomness.
                    const t = uly
                    uly = bry
                    bry = t
                }
            }

            // Specify all corner points.
            floats[offset] = ulx
            floats[offset + 1] = uly

            floats[offset + 2] = brx
            floats[offset + 3] = uly

            floats[offset + 4] = brx
            floats[offset + 5] = bry

            floats[offset + 6] = ulx
            floats[offset + 7] = bry

            offset += 8
        }
    }

    beforeDraw(operation) {
        let gl = this.gl
        gl.vertexAttribPointer(this._attrib("aNoiseTextureCoord"), 2, gl.FLOAT, false, 8, this.getVertexAttribPointerOffset(operation))

        let glTexture = this._noiseTexture.source.glTexture
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, glTexture)
        gl.activeTexture(gl.TEXTURE0)
    }

    getExtraAttribBytesPerVertex() {
        return 8
    }

    setupUniforms(operation) {
        super.setupUniforms(operation)
        this._setUniform("uNoiseSampler", 1, this.gl.uniform1i)
        this._setUniform("graining", 2 * this._graining, this.gl.uniform1f)
    }

    enableAttribs() {
        super.enableAttribs()
        let gl = this.ctx.gl
        gl.enableVertexAttribArray(this._attrib("aNoiseTextureCoord"))
    }

    disableAttribs() {
        super.disableAttribs()
        let gl = this.ctx.gl
        gl.disableVertexAttribArray(this._attrib("aNoiseTextureCoord"))
    }

    useDefault() {
        return this._graining === 0
    }

    afterDraw(operation) {
        if (this._random) {
            this.redraw()
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



/**
 * @see https://github.com/pixijs/pixi-filters/tree/master/filters/pixelate/src
 */
class PixelateShader extends Shader {

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

    setupUniforms(operation) {
        super.setupUniforms(operation)
        let gl = this.gl
        this._setUniform("size", new Float32Array(this._size), gl.uniform2fv)
    }

    getExtraAttribBytesPerVertex() {
        return 8;
    }

    enableAttribs() {
        super.enableAttribs()
        this.gl.enableVertexAttribArray(this._attrib("aTextureRes"))
    }

    disableAttribs() {
        super.disableAttribs()
        this.gl.disableVertexAttribArray(this._attrib("aTextureRes"))
    }

    setExtraAttribsInBuffer(operation) {
        let offset = operation.extraAttribsDataByteOffset / 4
        let floats = operation.quads.floats

        let length = operation.length
        for (let i = 0; i < length; i++) {
            let w = operation.quads.getTextureWidth(operation.index + i)
            let h = operation.quads.getTextureHeight(operation.index + i)

            floats[offset] = w
            floats[offset + 1] = h
            floats[offset + 2] = w
            floats[offset + 3] = h
            floats[offset + 4] = w
            floats[offset + 5] = h
            floats[offset + 6] = w
            floats[offset + 7] = h

            offset += 8
        }
    }

    beforeDraw(operation) {
        let gl = this.gl
        gl.vertexAttribPointer(this._attrib("aTextureRes"), 2, gl.FLOAT, false, this.getExtraAttribBytesPerVertex(), this.getVertexAttribPointerOffset(operation))
    }

    useDefault() {
        return ((this._size[0] === 0) && (this._size[1] === 0))
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

/**
 * Copyright Metrological, 2017
 */


class InversionShader extends Shader {
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


class GrayscaleShader extends Shader {
    constructor(context) {
        super(context)
        this._amount = 0
    }

    set amount(v) {
        this._amount = v
        this.redraw()
    }

    get amount() {
        return this._amount
    }

    setupUniforms(operation) {
        super.setupUniforms(operation)
        this._setUniform("amount", this._amount, this.gl.uniform1f)
    }

    useDefault() {
        return this._amount === 0
    }

}

GrayscaleShader.fragmentShaderSource = `
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



class OutlineShader extends Shader {

    constructor(ctx) {
        super(ctx)
        this._width = 5
        this._color = 0xFFFFFFFF
        this._col = [1,1,1,1]
    }

    set width(v) {
        this._width = v
        this.redraw()
    }

    get color() {
        return this._col
    }

    set color(v) {
        if (this._col !== v) {
            const col = StageUtils.getRgbaComponentsNormalized(v)
            col[0] = col[0] * col[3]
            col[1] = col[1] * col[3]
            col[2] = col[2] * col[3]

            this._color = col

            this.redraw()

            this._col = v
        }
    }

    setupUniforms(operation) {
        super.setupUniforms(operation)
        let gl = this.gl
        console.log(this._color.join(','))
        this._setUniform("color", new Float32Array(this._color), gl.uniform4fv)
    }

    enableAttribs() {
        super.enableAttribs()
        this.gl.enableVertexAttribArray(this._attrib("aCorner"))
    }

    disableAttribs() {
        super.disableAttribs()
        this.gl.disableVertexAttribArray(this._attrib("aCorner"))
    }

    setExtraAttribsInBuffer(operation) {
        let offset = operation.extraAttribsDataByteOffset / 4
        let floats = operation.quads.floats

        let length = operation.length

        for (let i = 0; i < length; i++) {

            const viewCore = operation.getViewCore(i)

            // We are setting attributes such that if the value is < 0 or > 1, a border should be drawn.
            const ddw = this._width / viewCore.rw
            const dw = ddw / (1 - 2 * ddw)
            const ddh = this._width / viewCore.rh
            const dh = ddh / (1 - 2 * ddh)

            // Specify all corner points.
            floats[offset] = -dw
            floats[offset + 1] = -dh

            floats[offset + 2] = 1 + dw
            floats[offset + 3] = -dh

            floats[offset + 4] = 1 + dw
            floats[offset + 5] = 1 + dh

            floats[offset + 6] = -dw
            floats[offset + 7] = 1 + dh

            offset += 8
        }
    }

    beforeDraw(operation) {
        let gl = this.gl
        gl.vertexAttribPointer(this._attrib("aCorner"), 2, gl.FLOAT, false, 8, this.getVertexAttribPointerOffset(operation))
    }

    getExtraAttribBytesPerVertex() {
        return 8
    }

    useDefault() {
        return (this._width === 0 || this._col[3] === 0)
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




class CircularPushShader extends Shader {
    constructor(context) {
        super(context)

        this._inputValue = 0

        this._maxDerivative = 0.01

        this._normalizedValue = 0

        // The offset between buckets. A value between 0 and 1.
        this._offset = 0

        this._amount = 0.1

        this._aspectRatio = 1

        this._offsetX = 0

        this._offsetY = 0

        this.buckets = 100
    }

    get aspectRatio() {
        return this._aspectRatio
    }

    set aspectRatio(v) {
        this._aspectRatio = v
        this.redraw()
    }

    get offsetX() {
        return this._offsetX
    }

    set offsetX(v) {
        this._offsetX = v
        this.redraw()
    }

    get offsetY() {
        return this._offsetY
    }

    set offsetY(v) {
        this._offsetY = v
        this.redraw()
    }

    set amount(v) {
        this._amount = v
        this.redraw()
    }

    get amount() {
        return this._amount
    }

    set inputValue(v) {
        this._inputValue = v
    }

    get inputValue() {
        return this._inputValue
    }

    set maxDerivative(v) {
        this._maxDerivative = v
    }

    get maxDerivative() {
        return this._maxDerivative
    }

    set buckets(v) {
        if (v > 100) {
            console.warn("CircularPushShader: supports max 100 buckets")
            v = 100
        }

        // This should be set before starting.
        this._buckets = v

        // Init values array in the correct length.
        this._values = new Uint8Array(this._getValues(v))

        this.redraw()
    }

    get buckets() {
        return this._buckets
    }

    _getValues(n) {
        const v = []
        for (let i = 0; i < n; i++) {
            v.push(this._inputValue)
        }
        return v
    }

    /**
     * Progresses the shader with the specified (fractional) number of buckets.
     * @param {number} o
     *   A number from 0 to 1 (1 = all buckets).
     */
    progress(o) {
        this._offset += o * this._buckets
        const full = Math.floor(this._offset)
        this._offset -= full
        this._shiftBuckets(full)
        this.redraw()
    }

    _shiftBuckets(n) {
        for (let i = this._buckets - 1; i >= 0; i--) {
            const targetIndex = i - n
            if (targetIndex < 0) {
                this._normalizedValue = Math.min(this._normalizedValue + this._maxDerivative, Math.max(this._normalizedValue - this._maxDerivative, this._inputValue))
                this._values[i] = 255 * this._normalizedValue
            } else {
                this._values[i] = this._values[targetIndex]
            }
        }
    }

    set offset(v) {
        this._offset = v
        this.redraw()
    }

    setupUniforms(operation) {
        super.setupUniforms(operation)
        this._setUniform("aspectRatio", this._aspectRatio, this.gl.uniform1f)
        this._setUniform("offsetX", this._offsetX, this.gl.uniform1f)
        this._setUniform("offsetY", this._offsetY, this.gl.uniform1f)
        this._setUniform("amount", this._amount, this.gl.uniform1f)
        this._setUniform("offset", this._offset, this.gl.uniform1f)
        this._setUniform("buckets", this._buckets, this.gl.uniform1f)
        this._setUniform("uValueSampler", 1, this.gl.uniform1i)
    }

    useDefault() {
        return this._amount === 0
    }

    beforeDraw(operation) {
        const gl = this.gl
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
            this.gl.deleteTexture(this._valuesTexture)
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





class RadialFilterShader extends Shader {
    constructor(context) {
        super(context)
        this._radius = 0
        this._cutoff = 1
    }

    set radius(v) {
        this._radius = v
        this.redraw()
    }

    get radius() {
        return this._radius
    }

    set cutoff(v) {
        this._cutoff = v
        this.redraw()
    }

    get cutoff() {
        return this._cutoff
    }
    
    setupUniforms(operation) {
        super.setupUniforms(operation)
        // We substract half a pixel to get a better cutoff effect.
        this._setUniform("radius", 2 * (this._radius - 0.5) / operation.getRenderWidth(), this.gl.uniform1f)
        this._setUniform("cutoff", 0.5 * operation.getRenderWidth() / this._cutoff, this.gl.uniform1f)
    }

    useDefault() {
        return this._radius === 0
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


class RadialGradientShader extends Shader {
    
    constructor(context) {
        super(context)
        
        this._x = 0
        this._y = 0

        this.color = 0xFFFF0000

        this._radiusX = 100
        this._radiusY = 100
    }

    set x(v) {
        this._x = v
        this.redraw()
    }

    set y(v) {
        this._y = v
        this.redraw()
    }

    set radiusX(v) {
        this._radiusX = v
        this.redraw()
    }

    get radiusX() {
        return this._radiusX
    }

    set radiusY(v) {
        this._radiusY = v
        this.redraw()
    }

    get radiusY() {
        return this._radiusY
    }

    set radius(v) {
        this.radiusX = v
        this.radiusY = v
    }

    get color() {
        return this._color
    }

    set color(v) {
        if (this._color !== v) {
            const col = StageUtils.getRgbaComponentsNormalized(v)
            col[0] = col[0] * col[3]
            col[1] = col[1] * col[3]
            col[2] = col[2] * col[3]

            this._rawColor = new Float32Array(col)

            this.redraw()

            this._color = v
        }
    }

    setupUniforms(operation) {
        super.setupUniforms(operation)
        // We substract half a pixel to get a better cutoff effect.
        const rtc = operation.getNormalRenderTextureCoords(this._x, this._y)
        this._setUniform("center", new Float32Array(rtc), this.gl.uniform2fv)

        this._setUniform("radius", 2 * this._radiusX / operation.getRenderWidth(), this.gl.uniform1f)
        this._setUniform("color", this._rawColor, this.gl.uniform4fv)
        this._setUniform("aspectRatio", (this._radiusX/this._radiusY) * operation.getRenderHeight()/operation.getRenderWidth(), this.gl.uniform1f)
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
    void main(void){
        float dist = length(pos);
        gl_FragColor = mix(color, texture2D(uSampler, vTextureCoord) * vColor, min(1.0, dist / radius));
    }
`;



/**
 * Copyright Metrological, 2017
 */


/**
 * @see https://github.com/mattdesl/glsl-fxaa
 */
class FxaaFilter extends Filter {
    constructor(ctx) {
        super(ctx);
    }

}

FxaaFilter.fxaa = `
    #ifndef FXAA_REDUCE_MIN
        #define FXAA_REDUCE_MIN   (1.0/ 128.0)
    #endif
    #ifndef FXAA_REDUCE_MUL
        #define FXAA_REDUCE_MUL   (1.0 / 8.0)
    #endif
    #ifndef FXAA_SPAN_MAX
        #define FXAA_SPAN_MAX     8.0
    #endif
    
    //optimized version for mobile, where dependent 
    //texture reads can be a bottleneck
    vec4 fxaa(sampler2D tex, vec2 fragCoord, vec2 resolution,
            vec2 v_rgbNW, vec2 v_rgbNE, 
            vec2 v_rgbSW, vec2 v_rgbSE, 
            vec2 v_rgbM) {
            
        vec4 color;
        vec2 inverseVP = vec2(1.0 / resolution.x, 1.0 / resolution.y);
        vec3 rgbNW = texture2D(tex, v_rgbNW).xyz;
        vec3 rgbNE = texture2D(tex, v_rgbNE).xyz;
        vec3 rgbSW = texture2D(tex, v_rgbSW).xyz;
        vec3 rgbSE = texture2D(tex, v_rgbSE).xyz;
        vec4 texColor = texture2D(tex, v_rgbM);
        vec3 rgbM  = texColor.xyz;
        vec3 luma = vec3(0.299, 0.587, 0.114);
        float lumaNW = dot(rgbNW, luma);
        float lumaNE = dot(rgbNE, luma);
        float lumaSW = dot(rgbSW, luma);
        float lumaSE = dot(rgbSE, luma);
        float lumaM  = dot(rgbM,  luma);
        float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
        float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));
        
        vec2 dir;
        dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
        dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));
        
        float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) *
                              (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);
        
        float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
        dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),
                  max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),
                  dir * rcpDirMin)) * inverseVP;
        
        vec3 rgbA = 0.5 * (
            texture2D(tex, fragCoord * inverseVP + dir * (1.0 / 3.0 - 0.5)).xyz +
            texture2D(tex, fragCoord * inverseVP + dir * (2.0 / 3.0 - 0.5)).xyz);
        vec3 rgbB = rgbA * 0.5 + 0.25 * (
            texture2D(tex, fragCoord * inverseVP + dir * -0.5).xyz +
            texture2D(tex, fragCoord * inverseVP + dir * 0.5).xyz);
    
        float lumaB = dot(rgbB, luma);
        if ((lumaB < lumaMin) || (lumaB > lumaMax))
            color = vec4(rgbA, texColor.a);
        else
            color = vec4(rgbB, texColor.a);
        return color;
    }
    
    void texcoords(vec2 fragCoord, vec2 resolution,
            out vec2 v_rgbNW, out vec2 v_rgbNE,
            out vec2 v_rgbSW, out vec2 v_rgbSE,
            out vec2 v_rgbM) {
        
        vec2 inverseVP = 1.0 / resolution.xy;
        v_rgbNW = (fragCoord + vec2(-1.0, -1.0)) * inverseVP;
        v_rgbNE = (fragCoord + vec2(1.0, -1.0)) * inverseVP;
        v_rgbSW = (fragCoord + vec2(-1.0, 1.0)) * inverseVP;
        v_rgbSE = (fragCoord + vec2(1.0, 1.0)) * inverseVP;
        v_rgbM = vec2(fragCoord * inverseVP);
    }
    vec4 apply(sampler2D tex, vec2 fragCoord, vec2 resolution) {
        vec2 v_rgbNW;
        vec2 v_rgbNE;
        vec2 v_rgbSW;
        vec2 v_rgbSE;
        vec2 v_rgbM;
    
        //compute the texture coords
        texcoords(fragCoord, resolution, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);
        
        //compute FXAA
        return fxaa(tex, fragCoord, resolution, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);
    }    
`

FxaaFilter.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    
    ${FxaaFilter.fxaa}
    
    uniform vec2 resolution;
    uniform sampler2D uSampler;
    void main(void){
        gl_FragColor = apply(uSampler, gl_FragCoord.xy, resolution);
    }
    
`;


/**
 * Copyright Metrological, 2017
 */


class InversionFilter extends Filter {
}

InversionFilter.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;
    void main(void){
        vec4 color = texture2D(uSampler, vTextureCoord);
        color.rgb = 1.0 - color.rgb; 
        gl_FragColor = color;
    }
`;


/**
 * Copyright Metrological, 2017
 */


/**
 * @see https://github.com/Jam3/glsl-fast-gaussian-blur
 */
class BlurFilter extends Filter {

    constructor(ctx) {
        super(ctx);

        this.ctx = ctx

        this._kernelRadius = 1

        this._steps = []

        this.steps = 1
    }

    get kernelRadius() {
        return this._kernelRadius
    }

    set kernelRadius(v) {
        this._kernelRadius = v
        this._steps.forEach(step => step._kernelRadius = v)
        this.redraw()
    }

    get steps() {
        return this._size
    }

    set steps(v) {
        this._size = Math.round(v)

        let currentSteps = this._steps.length / 2
        // Try to reuse objects.
        if (currentSteps < this._size) {
            let add = [];
            for (let i = currentSteps + 1; i <= this._size; i++) {
                let lbf = new LinearBlurFilter(this.ctx)
                lbf._direction[0] = i
                lbf._kernelRadius = this._kernelRadius
                add.push(lbf)

                lbf = new LinearBlurFilter(this.ctx)
                lbf._kernelRadius = this._kernelRadius
                lbf._direction[1] = i
                add.push(lbf)
            }
            this._steps = this._steps.concat(add)
            this.redraw();
        } else if (currentSteps > this._size) {
            let r = currentSteps - this._size
            this._steps.splice(-r * 2)
            this.redraw();
        }
    }

    useDefault() {
        return (this._size === 0 || this._kernelRadius === 0)
    }

    getFilters() {
        return this._steps
    }

}

/**
 * Copyright Metrological, 2017
 */


class LinearBlurFilter extends Filter {

    constructor(ctx) {
        super(ctx)

        this._direction = new Float32Array([0, 0])
        this._kernelRadius = 1
    }

    get x() {
        return this._direction[0]
    }

    set x(v) {
        this._direction[0] = v
        this.redraw()
    }

    get y() {
        return this._direction[1]
    }

    set y(v) {
        this._direction[1] = v
        this.redraw()
    }

    get kernelRadius() {
        return this._kernelRadius
    }

    set kernelRadius(v) {
        this._kernelRadius = v
        this.redraw()
    }

    setupUniforms(operation) {
        super.setupUniforms(operation)
        this._setUniform("direction", this._direction, this.gl.uniform2fv)
        this._setUniform("kernelRadius", this._kernelRadius, this.gl.uniform1i)
    }

}

LinearBlurFilter.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    uniform vec2 resolution;
    varying vec2 vTextureCoord;
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
        if (kernelRadius == 0) {
            gl_FragColor = texture2D(uSampler, vTextureCoord);
        } else if (kernelRadius == 1) {
            gl_FragColor = blur1(uSampler, vTextureCoord, resolution, direction);
        } else if (kernelRadius == 2) {
            gl_FragColor = blur2(uSampler, vTextureCoord, resolution, direction);
        } else {
            gl_FragColor = blur3(uSampler, vTextureCoord, resolution, direction);
        }
    }
`;



class GrayscaleFilter extends Filter {
    constructor(context) {
        super(context)
        this._amount = 0
    }

    set amount(v) {
        this._amount = v
        this.redraw()
    }

    get amount() {
        return this._amount
    }

    setupUniforms(operation) {
        super.setupUniforms(operation)
        this._setUniform("amount", this._amount, this.gl.uniform1f)
    }

    useDefault() {
        return this._amount === 0
    }

}

GrayscaleFilter.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;
    uniform float amount;
    void main(void){
        vec4 color = texture2D(uSampler, vTextureCoord);
        float grayness = 0.2 * color.r + 0.6 * color.g + 0.2 * color.b;
        gl_FragColor = (amount * vec4(grayness, grayness, grayness, 1.0) + (1.0 - amount) * color);
    }
`;


class Component extends View {

    constructor(stage, properties) {
        super(stage)

        // Encapsulate tags to prevent leaking.
        this.tagRoot = true;

        if (Utils.isObjectLiteral(properties)) {
            Object.assign(this, properties)
        }

        // Start with root state
        this.__state = ""

        this.__initialized = false
        this.__firstActive = false
        this.__firstEnable = false

        this.__construct()

        // Quick-apply template.
        const func = this.constructor.getTemplateFunc()
        func.f(this, func.a)

        this.__signals = undefined
    }

    /**
     * Returns a high-performance template patcher.
     */
    static getTemplateFunc() {
        if (!this._templateFunc) {
            this._templateFunc = this.parseTemplate(this._template())
        }
        return this._templateFunc
    }

    static parseTemplate(obj) {
        const context = {
            loc: [],
            store: [],
            rid: 0
        }

        this.parseTemplateRec(obj, context, "view")

        const code = context.loc.join(";\n")
        const f = new Function("view", "store", code)
        return {f:f, a:context.store}
    }

    static parseTemplateRec(obj, context, cursor) {
        const store = context.store
        const loc = context.loc
        const keys = Object.keys(obj)
        keys.forEach(key => {
            const value = obj[key]
            if (Utils.isUcChar(key.charCodeAt(0))) {
                // Value must be expanded as well.
                if (Utils.isObjectLiteral(value)) {
                    // Ref.
                    const childCursor = `r${key.replace(/[^a-z0-9]/gi, "") + context.rid}`
                    let type = value.type ? value.type : View
                    if (type === "View") {
                        loc.push(`const ${childCursor} = view.stage.createView()`)
                    } else {
                        store.push(type)
                        loc.push(`const ${childCursor} = new store[${store.length - 1}](${cursor}.stage)`)
                    }
                    loc.push(`${childCursor}.ref = "${key}"`)
                    context.rid++

                    // Enter sub.
                    this.parseTemplateRec(value, context, childCursor)

                    loc.push(`${cursor}.childList.add(${childCursor})`)
                } else if (Utils.isObject(value)) {
                    // Dynamic assignment.
                    store.push(value)
                    loc.push(`${cursor}.childList.add(store[${store.length - 1}])`)
                }
            } else {
                if (key === "text") {
                    const propKey = cursor + "__text"
                    loc.push(`${propKey} = ${cursor}.enableTextTexture()`)
                    this.parseTemplatePropRec(value, context, propKey)
                } else if (key === "texture" && Utils.isObjectLiteral(value)) {
                    const propKey = cursor + "__texture"
                    const type = value.type
                    if (type) {
                        store.push(type)
                        loc.push(`${propKey} = new store[${store.length - 1}](${cursor}.stage)`)
                        this.parseTemplatePropRec(value, context, propKey)
                        loc.push(`${cursor}["${key}"] = ${propKey}`)
                    } else {
                        loc.push(`${propKey} = ${cursor}.texture`)
                        this.parseTemplatePropRec(value, context, propKey)
                    }
                } else {
                    // Property
                    if (Utils.isNumber(value)) {
                        loc.push(`${cursor}["${key}"] = ${value}`)
                    } else if (Utils.isBoolean(value)) {
                        loc.push(`${cursor}["${key}"] = ${value ? "true" : "false"}`)
                    } else if (Utils.isObject(value) || Array.isArray(value)) {
                        // Dynamic assignment.
                        // Because literal objects may contain dynamics, we store the full object.
                        store.push(value)
                        loc.push(`${cursor}["${key}"] = store[${store.length - 1}]`)
                    } else {
                        // String etc.
                        loc.push(`${cursor}["${key}"] = ${JSON.stringify(value)}`)
                    }
                }
            }
        })
    }

    static parseTemplatePropRec(obj, context, cursor) {
        const store = context.store
        const loc = context.loc
        const keys = Object.keys(obj)
        keys.forEach(key => {
            if (key !== "type") {
                const value = obj[key]
                if (Utils.isNumber(value)) {
                    loc.push(`${cursor}["${key}"] = ${value}`)
                } else if (Utils.isBoolean(value)) {
                    loc.push(`${cursor}["${key}"] = ${value ? "true" : "false"}`)
                } else if (Utils.isObject(value) || Array.isArray(value)) {
                    // Dynamic assignment.
                    // Because literal objects may contain dynamics, we store the full object.
                    store.push(value)
                    loc.push(`${cursor}["${key}"] = store[${store.length - 1}]`)
                } else {
                    // String etc.
                    loc.push(`${cursor}["${key}"] = ${JSON.stringify(value)}`)
                }
            }
        })
    }

    _onAttach() {
        if (!this.__initialized) {
            this.__init()
            this.__initialized = true
        }

        this.fire('_attach')
    }

    _onDetach() {
        this.fire('_detach')
    }

    _onEnabled() {
        if (!this.__firstEnable) {
            this.fire('_firstEnable')
            this.__firstEnable = true
        }

        this.fire('_enable')
    }

    _onDisabled() {
        this.fire('_disable')
    }

    _onActive() {
        if (!this.__firstActive) {
            this.fire('_firstActive')
            this.__firstActive = true
        }

        this.fire('_active')
    }

    _onInactive() {
        this.fire('_inactive')
    }

    get application() {
        return this.stage.application
    }

    get state() {
        return this.__state
    }

    __construct() {
        this.fire('_construct')
    }

    __init() {
        this.fire('_init')
    }

    __focus(newTarget, prevTarget) {
        this.fire('_focus', {newTarget: newTarget, prevTarget: prevTarget})
    }

    __unfocus(newTarget) {
        this.fire('_unfocus', {newTarget: newTarget})
    }

    __focusBranch(target) {
        this.fire('_focusBranch', {target: target})
    }

    __unfocusBranch(target, newTarget) {
        this.fire('_unfocusBranch', {target:target, newTarget:newTarget})
    }

    __focusChange(target, newTarget) {
        this.fire('_focusChange', {target:target, newTarget:newTarget})
    }

    _getFocused() {
        // Override to delegate focus to child components.
        return this
    }

    _setFocusSettings(settings) {
        // Override to add custom settings. See Application._handleFocusSettings().
    }

    _getStates() {
        if (!this.constructor.__states) {
            this.constructor.__states = this.constructor._states()
            if (!Utils.isObjectLiteral(this.constructor.__states)) {
                this._throwError("States object empty")
            }
        }
        return this.constructor.__states
    }

    static _states() {
        return {}
    }

    _getTemplate() {
        if (!this.constructor.__template) {
            this.constructor.__template = this.constructor._template()
            if (!Utils.isObjectLiteral(this.constructor.__template)) {
                this._throwError("Template object empty")
            }
        }
        return this.constructor.__template
    }

    static _template() {
        return {}
    }

    hasFocus() {
        let path = this.application._focusPath
        return path && path.length && path[path.length - 1] === this
    }

    hasFinalFocus() {
        let path = this.application._focusPath
        return path && (path.indexOf(this) >= 0)
    }

    get cparent() {
        return Component.getParent(this)
    }

    getSharedAncestorComponent(view) {
        let ancestor = this.getSharedAncestor(view)
        while(ancestor && !ancestor.isComponent) {
            ancestor = ancestor.parent
        }
        return ancestor
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
            this._throwError("Fire: args must be object")
        }
        return this.application.stateManager.fire(this, event, args)
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
            this._throwError("Signal: args must be object")
        }

        if (!args._source) {
            args = Object.assign({_source: this}, args)
        }

        if (this.__signals && this.cparent) {
            let fireEvent = this.__signals[event]
            if (fireEvent === false) {
                // Ignore event, even when bubbling.
                return
            }
            if (fireEvent) {
                if (fireEvent === true) {
                    fireEvent = event
                }

                const handled = this.cparent.fire(fireEvent, args)
                if (handled) return
            }
        }
        if (bubble && this.cparent) {
            // Bubble up.
            this.cparent.signal(event, args, bubble)
        }
    }

    get signals() {
        return this.__signals
    }

    set signals(v) {
        if (!Utils.isObjectLiteral(v)) {
            this._throwError("Signals: specify an object with signal-to-fire mappings")
        }
        this.__signals = Object.assign(this.__signals || {}, v)
    }

    /**
     * Fires the specified event downwards.
     * A descendant that wishes to handle the signal should set the '_broadcasts' property on this component.
     * @warn handling a broadcast will stop it from propagating; to continue propagation return false from the state
     * event handler.
     */
    broadcast(event, args = {}) {
        if (!Utils.isObjectLiteral(args)) {
            this._throwError("Broadcast: args must be object")
        }

        if (!args._source) {
            args = Object.assign({_source: this}, args)
        }

        if (this.__broadcasts) {
            let fireEvent = this.__broadcasts[event]
            if (fireEvent === false) {
                return
            }
            if (fireEvent) {
                if (fireEvent === true) {
                    fireEvent = event
                }

                const handled = this.fire(fireEvent, args)
                if (handled) {
                    // Skip propagation
                    return
                }
            }
        }

        // Propagate down.
        const subs = []
        Component.collectSubComponents(subs, this)
        for (let i = 0, n = subs.length; i < n; i++) {
            subs[i].broadcast(event, args)
        }
    }

    static collectSubComponents(subs, view) {
        if (view.hasChildren()) {
            // We must use the private property because direct children access may be disallowed.
            const childList = view.__childList
            for (let i = 0, n = childList.length; i < n; i++) {
                const child = childList.getAt(i)
                if (child.isComponent) {
                    subs.push(child)
                } else {
                    Component.collectSubComponents(subs, child)
                }
            }
        }
    }

    get _broadcasts() {
        return this.__broadcasts
    }

    set _broadcasts(v) {
        if (!Utils.isObjectLiteral(v)) {
            this._throwError("Broadcasts: specify an object with broadcast-to-fire mappings")
        }
        this.__broadcasts = Object.assign(this.__broadcasts || {}, v)
    }

    static getComponent(view) {
        let parent = view
        while (parent && !parent.isComponent) {
            parent = parent.parent
        }
        return parent
    }

    static getParent(view) {
        return Component.getComponent(view.parent)
    }

}

Component.prototype.isComponent = true


class Application extends Component {

    constructor(options = {}, properties) {
        // Save options temporarily to avoid having to pass it through the constructor.
        Application._temp_options = options

        const stage = new Stage(options.stage)
        super(stage, properties)

        // We must construct while the application is not yet attached.
        // That's why we 'init' the stage later (which actually emits the attach event).
        this.stage.init()

        this.__keymap = this.getOption('keys')
        if (this.__keymap) {
            this.stage.adapter.registerKeyHandler((e) => {
                this._receiveKeydown(e)
            })
        }
    }

    getOption(name) {
        return this.__options[name]
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
        }

        opt('debug', false);
        opt('keys', {});
    }

    __construct() {
        this.stage.setApplication(this)

        this._setOptions(Application._temp_options)
        delete Application._temp_options

        // We must create the state manager before the first 'fire' ever: the 'construct' event.
        this.stateManager = new StateManager()
        this.stateManager.debug = this.__options.debug

        super.__construct()
    }

    __init() {
        super.__init()
        this.__updateFocus()
    }

    updateFocusPath() {
        this.__updateFocus()
    }

    __updateFocus(maxRecursion = 100) {
        const newFocusPath = this.__getFocusPath()
        const newFocusedComponent = newFocusPath[newFocusPath.length - 1]
        const prevFocusedComponent = this._focusPath ? this._focusPath[this._focusPath.length - 1] : undefined

        if (!prevFocusedComponent) {
            // First focus.
            this._focusPath = newFocusPath

            // Focus events.
            for (let i = 0, n = this._focusPath.length; i < n; i++) {
                this._focusPath[i].__focus(newFocusedComponent, undefined)
            }
        } else {
            let m = Math.min(this._focusPath.length, newFocusPath.length)
            let index
            for (index = 0; index < m; index++) {
                if (this._focusPath[index] !== newFocusPath[index]) {
                    break
                }
            }

            if (this._focusPath.length !== newFocusPath.length || index !== newFocusPath.length) {
                if (this.__options.debug) {
                    console.log(this.stateManager._logPrefix + '* FOCUS ' + newFocusedComponent.getLocationString())
                }
                // Unfocus events.
                for (let i = this._focusPath.length - 1; i >= index; i--) {
                    this._focusPath[i].__unfocus(newFocusedComponent, prevFocusedComponent)
                }

                this._focusPath = newFocusPath

                // Focus events.
                for (let i = index, n = this._focusPath.length; i < n; i++) {
                    this._focusPath[i].__focus(newFocusedComponent, prevFocusedComponent)
                }

                // Focus changed events.
                for (let i = 0; i < index; i++) {
                    this._focusPath[i].__focusChange(newFocusedComponent, prevFocusedComponent)
                }

                // Focus events could trigger focus changes.
                if (maxRecursion-- === 0) {
                    throw new Error("Max recursion count reached in focus update")
                }
                this.__updateFocus(maxRecursion)
            }
        }

        // Performance optimization: do not gather settings if no handler is defined.
        if (this.__initialized && this._handleFocusSettings !== Application.prototype._handleFocusSettings) {
            this.updateFocusSettings()
        }
    }

    updateFocusSettings() {
        const newFocusPath = this.__getFocusPath()
        const focusedComponent = newFocusPath[newFocusPath.length - 1]

        // Get focus settings. These can be used for dynamic application-wide settings the depend on the
        // focus directly (such as the application background).
        const focusSettings = {}
        for (let i = 0, n = this._focusPath.length; i < n; i++) {
            this._focusPath[i]._setFocusSettings(focusSettings)
        }

        this._handleFocusSettings(focusSettings, this.__prevFocusSettings, focusedComponent)

        this.__prevFocusSettings = focusSettings
    }

    _handleFocusSettings(settings, prevSettings, focused, prevFocused) {
        // Override to handle focus-based settings.
    }

    __getFocusPath() {
        const path = [this]
        let current = this
        do {
            const nextFocus = current._getFocused()
            if (!nextFocus || (nextFocus === current)) {
                // Found!
                break
            }


            let ptr = nextFocus.cparent
            if (ptr === current) {
                path.push(nextFocus)
            } else {
                // Not an immediate child: include full path to descendant.
                const newParts = [nextFocus]
                do {
                    if (!ptr) {
                        current._throwError("Return value for _getFocused must be an attached descendant component but its '" + nextFocus.getLocationString() + "'")
                    }
                    newParts.push(ptr)
                    ptr = ptr.cparent
                } while (ptr !== current)

                // Add them reversed.
                for (let i = 0, n = newParts.length; i < n; i++) {
                    path.push(newParts[n - i - 1])
                }
            }

            current = nextFocus
        } while(true)

        return path
    }

    get focusPath() {
        return this._focusPath
    }

    /**
     * Injects an event in the state machines, top-down from application to focused component.
     */
    focusTopDownEvent(event, args) {
        const path = this.focusPath
        const n = path.length
        if (Array.isArray(event)) {
            // Multiple events.
            for (let i = 0; i < n; i++) {
                if (path[i].fire(event)) {
                    return true
                }
            }
        } else {
            // Single event.
            for (let i = 0; i < n; i++) {
                if (path[i].fire(event, args)) {
                    return true
                }
            }
        }
        return false
    }

    /**
     * Injects an event in the state machines, bottom-up from focused component to application.
     */
    focusBottomUpEvent(event, args) {
        const path = this.focusPath
        const n = path.length
        if (Array.isArray(event)) {
            // Multiple events.
            for (let i = n - 1; i >= 0; i--) {
                if (path[i].fire(event)) {
                    return true
                }
            }
        } else {
            // Single event.
            for (let i = n - 1; i >= 0; i--) {
                if (path[i].fire(event, args)) {
                    return true
                }
            }
        }
        return false
    }

    _receiveKeydown(e) {
        const obj = {keyCode: e.keyCode}
        if (this.__keymap[e.keyCode]) {
            if (!this.stage.application.focusTopDownEvent([{event: "_capture" + this.__keymap[e.keyCode], args: obj}, {event: "_captureKey", args: obj}])) {
                this.stage.application.focusBottomUpEvent([{event: "_handle" + this.__keymap[e.keyCode], args: obj}, {event: "_handleKey", args: obj}])
            }
        } else {
            if (!this.stage.application.focusTopDownEvent("_captureKey", obj)) {
                this.stage.application.focusBottomUpEvent("_handleKey", obj)
            }
        }
    }

}


class StateManager {

    constructor() {
        this._fireLevel = 0
        this._logPrefix = ""
        this._debug = false
    }

    get debug() {
        return this._debug
    }

    set debug(v) {
        this._debug = v
    }

    /**
     * Fires the specified event on the state machine.
     * @param {Component} component
     * @param {string|object[]} event
     *   Either a single event, or an array of events ({event: 'name', args: *}.
     *   In case of an array, the event is fired that had a match in the deepest state.
     *   If multiple events match in the deepest state, the first specified one has priority.
     * @param {*} args
     * @return {boolean}
     *   True iff the state machine could find and execute a handler for the event (event and condition matched).
     */
    fire(component, event, args) {
        // After an event is fired (by external means), the action may cause other events to be triggered. We
        // distinguish between primary and indirect events because we have to perform some operations after primary
        // events only.

        // Purely for logging.
        const primaryEvent = (this._fireLevel === 0)
        this._fireLevel++

        if (this.debug) {
            if (!primaryEvent) {
                this._logPrefix += " "
            } else {
                this._logPrefix = ""
            }
        }

        let found
        if (Array.isArray(event)) {
            found = this._mfire(component, event, args)
        } else {
            found = this._fire(component, event, args)
        }

        if (found && primaryEvent) {
            // Update focus.
            component.application.__updateFocus()
        }

        this._fireLevel--

        if (this.debug) {
            this._logPrefix = this._logPrefix.substr(0, this._logPrefix.length - 1)
        }

        return !!found
    }

    _fire(component, event, args) {
        if (Utils.isUcChar(event.charCodeAt(0))) {
            component._throwError("Event may not start with an upper case character: " + event)
        }

        const paths = this._getStatePaths(component, component.state)
        for (let i = 0, n = paths.length; i < n; i++) {
            const result = this._attemptFirePathEvent(component, paths[i], event, args)
            if (result) {
                return result
            }
        }
    }

    _mfire(component, events) {
        const paths = this._getStatePaths(component, component.state)
        for (let j = 0, m = paths.length; j < m; j++) {
            for (let i = 0, n = events.length; i < n; i++) {
                const result = this._attemptFirePathEvent(component, paths[j], events[i].event, events[i].args)
                if (result) {
                    return result
                }
            }
        }
    }

    _attemptFirePathEvent(component, path, event, args) {
        const result = StateManager._getStateAction(path, event)
        if (result) {
            let validAction = (result.s !== undefined)
            let newState = result.s
            if (result.a) {
                try {
                    if (this.debug) {
                        console.log(`${this._logPrefix}${component.constructor.name} "${component.state}".${event} ${component.getLocationString()}`)
                    }
                    newState = result.a.call(component, args)
                    validAction = (newState !== false)
                    if (!validAction) {
                        if (this.debug) {
                            console.log(`${this._logPrefix}[PASS THROUGH]`)
                        }
                    }
                } catch(e) {
                    console.error(e)
                }
            }
            if (validAction) {
                result.event = event
                result.args = args
                result.s = newState
                result.p = path

                const prevState = component.state

                if (Utils.isString(newState)) {
                    this._setState(component, StateManager._ucfirst(newState), {event: event, args: args, prevState: prevState, newState: newState})
                }

                return result
            }
        }
    }

    static _ucfirst(str) {
        return str.charAt(0).toUpperCase() + str.substr(1)
    }

    _getStatePaths(component, state) {
        const states = component._getStates()

        if (state == "") return [states]
        const parts = state.split(".")

        let cursor = states
        const path = [cursor]
        for (let i = 0, n = parts.length; i < n; i++) {
            const key = StateManager._ucfirst(parts[i])
            if (!cursor.hasOwnProperty(key)) {
                component._throwError("State path not found: '" + state + "'")
            }
            cursor = cursor[key]
            path.push(cursor)
        }
        return path.reverse()
    }

    /**
     * Returns the active's edge action and state.
     * @param {string} state
     * @param event
     * @return {object}
     * @private
     */
    static _getStateAction(state, event) {
        if (!state.hasOwnProperty(event)) {
            return null
        }
        const def = state[event]

        if (Utils.isFunction(def)) {
            // Action.
            return {a: def, s: undefined}
        } else if (Utils.isString(def)) {
            // State.
            return {a: undefined, s: def}
        }

        return null
    }


    _setState(component, newState, eargs) {
        if (this.debug) {
            console.log(`${this._logPrefix}╚>"${newState !== component.state ? newState : ""}"`)
        }

        if (newState !== component.state) {
            this._fireLevel++
            if (this.debug) {
                this._logPrefix += " "
            }

            const paths = this._getStatePaths(component, component.state)

            // Switch state to new state.
            const newPaths = this._getStatePaths(component, newState)

            const info = StateManager._compareStatePaths(paths, newPaths)
            const exit = info.exit.reverse()
            const enter = info.enter
            const state = component.state
            for (let i = 0, n = exit.length; i < n; i++) {
                component.__state = StateManager._getSuperState(state, i)
                const def = StateManager._getStateAction(exit[i], "_exit")
                if (def) {
                    if (this.debug) {
                        console.log(`${this._logPrefix}${component.constructor.name} "${component.state}"._exit ${component.getLocationString()}`)
                    }
                    let stateSwitch = StateManager._executeAction(def, component, eargs)
                    if (stateSwitch === false) {
                        if (this.debug) {
                            console.log(`${this._logPrefix}[CANCELED]`)
                        }
                    } else if (stateSwitch) {
                        const info = this._setState(
                            component,
                            stateSwitch,
                            eargs
                        )

                        this._fireLevel--
                        if (this.debug) {
                            this._logPrefix = this._logPrefix.substr(0, this._logPrefix.length - 1)
                        }

                        return info
                    }
                }
            }

            component.__state = StateManager._getSuperState(state, exit.length)

            for (let i = 0, n = enter.length; i < n; i++) {
                component.__state = StateManager._getSuperState(newState, (n - (i + 1)))
                const def = StateManager._getStateAction(enter[i], "_enter")
                if (def) {
                    if (this.debug) {
                        console.log(`${this._logPrefix}${component.constructor.name} "${newState}"._enter ${component.getLocationString()}`)
                    }
                    let stateSwitch = StateManager._executeAction(def, component, eargs)
                    if (stateSwitch === false) {
                        if (this.debug) {
                            console.log(`${this._logPrefix}[CANCELED]`)
                        }
                    } else if (stateSwitch) {
                        const info = this._setState(
                            component,
                            stateSwitch,
                            eargs
                        )

                        this._fireLevel--
                        if (this.debug) {
                            this._logPrefix = this._logPrefix.substr(0, this._logPrefix.length - 1)
                        }

                        return info
                    }
                }
            }

            this._fireLevel--
            if (this.debug) {
                this._logPrefix = this._logPrefix.substr(0, this._logPrefix.length - 1)
            }
        }

    }

    static _executeAction(action, component, args) {
        let newState
        if (action.a) {
            newState = action.a.call(component, args)
        }
        if (newState === undefined) {
            newState = action.s
        }
        return newState
    }

    static _getSuperState(state, levels) {
        if (levels === 0) {
            return state
        }
        return state.split(".").slice(0, -levels).join(".")
    }

    /**
     * Returns the exit states and enter states when switching states (in natural branch order).
     */
    static _compareStatePaths(current, newPaths) {
        current = current.reverse()
        newPaths = newPaths.reverse()
        const n = Math.min(current.length, newPaths.length)
        let pos
        for (pos = 0; pos < n; pos++) {
            if (current[pos] !== newPaths[pos]) break
        }

        return {exit: current.slice(pos), enter: newPaths.slice(pos)}
    }

}


return {
    Application: Application,
    Component: Component,
    Base: Base,
    Utils: Utils,
    StageUtils: StageUtils,
    Shader: Shader,
    Filter: Filter,
    View: View,
    Tools: Tools,
    Texture: Texture,
    textures: {
        SourceTexture: SourceTexture,
        RectangleTexture: RectangleTexture,
        NoiseTexture: NoiseTexture,
        TextTexture: TextTexture,
        ImageTexture: ImageTexture,
        HtmlTexture: HtmlTexture,
        StaticTexture: StaticTexture,
        StaticCanvasTexture: StaticCanvasTexture
    },
    misc: {
        ObjectListProxy: ObjectListProxy,
        ObjectListWrapper: ObjectListWrapper
    },
    views: {
        ListView: ListView,
        BorderView: BorderView,
        FastBlurView: FastBlurView,
        SmoothScaleView: SmoothScaleView
    },
    shaders: {
        DitheringShader: DitheringShader,
        PixelateShader: PixelateShader,
        InversionShader: InversionShader,
        GrayscaleShader: GrayscaleShader,
        OutlineShader: OutlineShader,
        CircularPushShader: CircularPushShader,
        RadialFilterShader: RadialFilterShader,
        RadialGradientShader: RadialGradientShader
    },
    filters: {
        FxaaFilter: FxaaFilter,
        InversionFilter: InversionFilter,
        BlurFilter: BlurFilter,
        LinearBlurFilter: LinearBlurFilter,
        GrayscaleFilter: GrayscaleFilter
    },
    _internal: { /* Required for inspect.js */
        Stage: Stage,
        ViewCore: ViewCore,
        ViewTexturizer: ViewTexturizer
    },
    EventEmitter: EventEmitter
}
})();