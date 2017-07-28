/*
 The MIT License (MIT)

 https://github.com/primus/eventemitter3
 Copyright (c) 2014 Arnout Kazemier

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

var has = Object.prototype.hasOwnProperty;
var prefix = '~';

/**
 * Constructor to create a storage for our `EE` objects.
 * An `Events` instance is a plain object whose properties are event names.
 *
 * @constructor
 * @api private
 */
function Events() {}

//
// We try to not inherit from `Object.prototype`. In some engines creating an
// instance in this way is faster than calling `Object.create(null)` directly.
// If `Object.create(null)` is not supported we prefix the event names with a
// character to make sure that the built-in object properties are not
// overridden or used as an attack vector.
//
if (Object.create) {
    Events.prototype = Object.create(null);

    //
    // This hack is needed because the `__proto__` property is still inherited in
    // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
    //
    if (!new Events().__proto__) prefix = false;
}

/**
 * Representation of a single event listener.
 *
 * @param {Function} fn The listener function.
 * @param {Mixed} context The context to invoke the listener with.
 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
 * @constructor
 * @api private
 */
function EE(fn, context, once) {
    this.fn = fn;
    this.context = context;
    this.once = once || false;
}

/**
 * Minimal `EventEmitter` interface that is molded against the Node.js
 * `EventEmitter` interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() {
    this._events = new Events();
    this._eventsCount = 0;
}

/**
 * Return an array listing the events for which the emitter has registered
 * listeners.
 *
 * @returns {Array}
 * @api public
 */
EventEmitter.prototype.eventNames = function eventNames() {
    var names = []
        , events
        , name;

    if (this._eventsCount === 0) return names;

    for (name in (events = this._events)) {
        if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
    }

    if (Object.getOwnPropertySymbols) {
        return names.concat(Object.getOwnPropertySymbols(events));
    }

    return names;
};

/**
 * Return the listeners registered for a given event.
 *
 * @param {String|Symbol} event The event name.
 * @param {Boolean} exists Only check if there are listeners.
 * @returns {Array|Boolean}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event, exists) {
    var evt = prefix ? prefix + event : event
        , available = this._events[evt];

    if (exists) return !!available;
    if (!available) return [];
    if (available.fn) return [available.fn];

    for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
        ee[i] = available[i].fn;
    }

    return ee;
};

/**
 * Calls each of the listeners registered for a given event.
 *
 * @param {String|Symbol} event The event name.
 * @returns {Boolean} `true` if the event had listeners, else `false`.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
    var evt = prefix ? prefix + event : event;

    if (!this._events[evt]) return false;

    var listeners = this._events[evt]
        , len = arguments.length
        , args
        , i;

    if (listeners.fn) {
        if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

        switch (len) {
            case 1: return listeners.fn.call(listeners.context), true;
            case 2: return listeners.fn.call(listeners.context, a1), true;
            case 3: return listeners.fn.call(listeners.context, a1, a2), true;
            case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
            case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
            case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
        }

        for (i = 1, args = new Array(len -1); i < len; i++) {
            args[i - 1] = arguments[i];
        }

        listeners.fn.apply(listeners.context, args);
    } else {
        var length = listeners.length
            , j;

        for (i = 0; i < length; i++) {
            if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

            switch (len) {
                case 1: listeners[i].fn.call(listeners[i].context); break;
                case 2: listeners[i].fn.call(listeners[i].context, a1); break;
                case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
                case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
                default:
                    if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
                        args[j - 1] = arguments[j];
                    }

                    listeners[i].fn.apply(listeners[i].context, args);
            }
        }
    }

    return true;
};

/**
 * Add a listener for a given event.
 *
 * @param {String|Symbol} event The event name.
 * @param {Function} fn The listener function.
 * @param {Mixed} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
    var listener = new EE(fn, context || this)
        , evt = prefix ? prefix + event : event;

    if (!this._events[evt]) this._events[evt] = listener, this._eventsCount++;
    else if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [this._events[evt], listener];

    return this;
};

/**
 * Add a one-time listener for a given event.
 *
 * @param {String|Symbol} event The event name.
 * @param {Function} fn The listener function.
 * @param {Mixed} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
    var listener = new EE(fn, context || this, true)
        , evt = prefix ? prefix + event : event;

    if (!this._events[evt]) this._events[evt] = listener, this._eventsCount++;
    else if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [this._events[evt], listener];

    return this;
};

/**
 * Remove the listeners of a given event.
 *
 * @param {String|Symbol} event The event name.
 * @param {Function} fn Only remove the listeners that match this function.
 * @param {Mixed} context Only remove the listeners that have this context.
 * @param {Boolean} once Only remove one-time listeners.
 * @returns {EventEmitter} `this`.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
    var evt = prefix ? prefix + event : event;

    if (!this._events[evt]) return this;
    if (!fn) {
        if (--this._eventsCount === 0) this._events = new Events();
        else delete this._events[evt];
        return this;
    }

    var listeners = this._events[evt];

    if (listeners.fn) {
        if (
            listeners.fn === fn
            && (!once || listeners.once)
            && (!context || listeners.context === context)
        ) {
            if (--this._eventsCount === 0) this._events = new Events();
            else delete this._events[evt];
        }
    } else {
        for (var i = 0, events = [], length = listeners.length; i < length; i++) {
            if (
                listeners[i].fn !== fn
                || (once && !listeners[i].once)
                || (context && listeners[i].context !== context)
            ) {
                events.push(listeners[i]);
            }
        }

        //
        // Reset the array, or remove it completely if we have no more listeners.
        //
        if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
        else if (--this._eventsCount === 0) this._events = new Events();
        else delete this._events[evt];
    }

    return this;
};

/**
 * Remove all listeners, or those of the specified event.
 *
 * @param {String|Symbol} [event] The event name.
 * @returns {EventEmitter} `this`.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
    var evt;

    if (event) {
        evt = prefix ? prefix + event : event;
        if (this._events[evt]) {
            if (--this._eventsCount === 0) this._events = new Events();
            else delete this._events[evt];
        }
    } else {
        this._events = new Events();
        this._eventsCount = 0;
    }

    return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
    return this;
};

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Allow `EventEmitter` to be imported as module namespace.
//
EventEmitter.EventEmitter = EventEmitter;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
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
        lp();
    }

    uploadGlTexture(gl, textureSource, source, hasAlpha) {
        let format = hasAlpha ? gl.RGBA : gl.RGB;

        if (source instanceof ImageData || source instanceof HTMLImageElement || source instanceof HTMLCanvasElement || source instanceof HTMLVideoElement || (window.ImageBitmap && source instanceof ImageBitmap)) {
            // Web-specific data types.
            gl.texImage2D(gl.TEXTURE_2D, 0, format, format, gl.UNSIGNED_BYTE, source);
        } else {
            gl.texImage2D(gl.TEXTURE_2D, 0, format, textureSource.w, textureSource.h, 0, format, gl.UNSIGNED_BYTE, source);
        }
    }

    loadSrcTexture(src, ts, sync, cb) {
        let isPng = (src.indexOf(".png") >= 0)
        if (window.OffthreadImage && OffthreadImage.available) {
            // For offthread support: simply include https://github.com/GoogleChrome/offthread-image/blob/master/dist/offthread-img.js
            // Possible optimisation: do not paint on canvas, but directly pass ImageData to texImage2d.
            let element = document.createElement('DIV');
            element.setAttribute('alt', '.');
            let image = new OffthreadImage(element);
            element.addEventListener('painted', function () {
                let canvas = element.childNodes[0];
                // Because a canvas stores all in RGBA alpha-premultiplied, GPU upload is fastest with those settings.
                cb(null, canvas, {renderInfo: {src}, hasAlpha: true, premultiplyAlpha: true});
            });
            image.src = src;
        } else {
            let image = new Image();
            if (!(src.substr(0,5) == "data:")) {
                // Base64.
                image.crossOrigin = "Anonymous";
            }
            image.onerror = function(err) {
                return cb("Image load error");
            };
            image.onload = function() {
                cb(null, image, {renderInfo: {src: src}, hasAlpha: isPng});
            };
            image.src = src;
        }
    }

    loadTextTexture(settings, ts, sync, cb) {
        // Generate the image.
        let tr = new TextRenderer(this.getDrawingCanvas(), settings);
        let rval = tr.draw();
        let renderInfo = rval.renderInfo;

        let options = {renderInfo: renderInfo, precision: rval.renderInfo.precision};
        let data = rval.canvas;
        cb(null, data, options);
    }

    createWebGLContext(w, h) {
        let canvas = this.stage.options.canvas || document.createElement('canvas');

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
        if (!this.drawingCanvas) {
            this.drawingCanvas = document.createElement('canvas');
        }
        return this.drawingCanvas;
    }

    nextFrame(changes) {
        /* WebGL blits automatically */
    }

}


/**
 * Copyright Metrological, 2017
 */
class Base {
    constructor() {
        let proto = Object.getPrototypeOf(this);
        if (!Base.protoReady.has(proto)) {
            Base.initPrototype(proto);
        }
    }

    /**
     * @protected
     */
    _properties() {
    }

    static initPrototype(proto) {
        if (!Base.protoReady.has(proto)) {
            const stack = [];

            // run prototype functions
            while(proto){
                if(!Base.protoReady.has(proto)) {
                    stack.push(proto);
                }
                Base.protoReady.add(proto);
                proto = Object.getPrototypeOf(proto);
            }

            for(let i = stack.length - 1; i >= 0; i--) {
                proto = stack[i];

                 // Initialize properties.
                if (proto.hasOwnProperty('_properties')) {
                    proto._properties();
                }
            }
        }
    }

    /**
     * Mixes an ES5 class and the specified superclass.
     * @param superclass
     * @param extra
     *   An ES5 class constructor.
     */
    static mixinEs5(superclass, extra) {
        let proto = extra.prototype;

        let props = Object.getOwnPropertyNames(proto);
        for(let i = 0; i < props.length; i++) {
            let key = props[i];
            let desc = Object.getOwnPropertyDescriptor(proto, key);
            if (key !== 'constructor' && desc.configurable) {
                if (superclass.prototype[key]) {
                    // Mixin may not overwrite prototype methods.
                    console.warn('Mixin overwrites ' + key);
                } else {
                    Object.defineProperty(superclass.prototype, key, desc);
                }
            }
        }

        return superclass;
    };

    setSettings(settings) {
        Base.setObjectSettings(this, settings);
    }

    static setObjectSettings(obj, settings) {
        for (let name in settings) {
            if (settings.hasOwnProperty(name)) {
                let v = settings[name];
                if (Utils.isObjectLiteral(v) && Utils.isObject(obj[name])) {
                    // Sub object.
                    var p = obj[name];
                    if (p.setSettings) {
                        // Custom setSettings method.
                        p.setSettings(v);
                    } else {
                        Base.setObjectSettings(p, v);
                    }
                } else {
                    obj[name] = v;
                }
            }
        }
    }

}

Base.protoReady = new WeakSet();


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

    static cloneObj(obj) {
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
        if (Utils.isArray(obj)) {
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


/**
 * Copyright Metrological, 2017
 */
class GeometryUtils {

    static dotprod(ux, uy, vx, vy) {
        return ux * vx + uy * vy;
    };

    /**
     * Returns true if the specified point lies within the convex polygon.
     * @param {number[]} a
     * @param {number} x
     * @param {number} y
     * @return {boolean}
     */
    static pointInConvex(a, x, y) {
        let i, n, ax, ay;
        n = a.length;
        for (i = 0; i <= a.length - 2; i += 2) {
            ax = a[(i + 2) % n] - a[i];
            ay = a[(i + 3) % n] - a[i + 1];

            if (GeometryUtils.dotprod(x - a[i], y - a[i + 1], -ay, ax) <= 0) {
                return false;
            }
        }
        return true;
    };

    /**
     * Returns the (convex) intersection of 2 convex polygons.
     * @see Suther-Hodgman algorithm
     * @param {number[]} a
     * @param {number[]} b
     * @return {number[]}
     *   The intersection polygon. Empty if there is no intersection polygon.
     */
    static intersectConvex(a, b) {
        let i, j, n, m;

        n = a.length;

        // Intersection result. We'll slice off the invisible vertices.
        let c = b;
        let nc;

        let anyIntersections = false;

        // Traverse all edges of a.
        for (i = 0; i <= n - 2; i += 2) {
            // Get unit vector for edge of a.
            let ax = a[(i + 2) % n] - a[i];
            let ay = a[(i + 3) % n] - a[i + 1];
            let l = Math.sqrt(ax * ax + ay * ay);
            ax /= l;
            ay /= l;

            m = c.length;
            nc = [];

            let firstOffsetY, prevOffsetY, firstWasInside, prevWasInside, inside;
            for (j = 0; j <= m - 2; j += 2) {
                let dx = c[j] - a[i];
                let dy = c[j + 1] - a[i + 1];

                // Calculate offset of vertex perpendicular to a-edge.
                let offsetY = GeometryUtils.dotprod(dx, dy, -ay, ax);

                // Count as 'inside' if the point lies within the polygon or on one of the edges.
                // We need to include a small margin for rounding errors which may cause 'double' points when
                // traversing parallel edges.
                inside = (offsetY >= -1e-9);

                if (j >= 2) {
                    if (prevWasInside != inside) {
                        // Add additional intersection point.

                        // Calculate intersection offset.
                        let prevOffsetX = GeometryUtils.dotprod(c[j - 2] - a[i], c[j - 1] - a[i + 1], ax, ay);
                        let offsetX = GeometryUtils.dotprod(dx, dy, ax, ay);

                        let dxdy = (offsetX - prevOffsetX) / (offsetY - prevOffsetY);
                        let isect = (prevOffsetX - dxdy * prevOffsetY);

                        let isectX = a[i] + isect * ax;
                        let isectY = a[i + 1] + isect * ay;

                        nc.push(isectX, isectY);

                        anyIntersections = true;
                    }
                } else {
                    // Remember for last vertex.
                    firstWasInside = inside;
                    firstOffsetY = offsetY;
                }

                if (inside) {
                    // Add vertex.
                    nc.push(c[j], c[j + 1]);
                }

                if (j == m - 2) {
                    // Complete the polygon with the edge from last to first.
                    if (inside != firstWasInside) {
                        // Add additional intersection point.
                        let firstOffsetX = GeometryUtils.dotprod(c[0] - a[i], c[1] - a[i + 1], ax, ay);

                        let offsetX = GeometryUtils.dotprod(dx, dy, ax, ay);

                        let dxdy = (offsetX - firstOffsetX) / (offsetY - firstOffsetY);
                        let isect = (firstOffsetX - dxdy * firstOffsetY);

                        let isectX = a[i] + isect * ax;
                        let isectY = a[i + 1] + isect * ay;

                        nc.push(isectX, isectY);

                        anyIntersections = true;
                    }
                }

                prevWasInside = inside;
                prevOffsetY = offsetY;
            }

            c = nc;
        }

        if (c.length) {
            if (!anyIntersections) {
                // The output polygon matches b. Return it by reference so that we can check for clipping activity.
                return b;
            } else {
                return c;
            }
        } else {
            // This is a special case which occurs if there are no intersections of any of the edges.

            // Check which polygon lies inside the other.

            // Get bounding box of a.
            let minAx = a[0];
            let maxAx = a[0];
            let minAy = a[1];
            let maxAy = a[1];

            // Get average point of a.
            let avgAx = a[0], avgAy = a[1];
            for (i = 2; i <= n - 2; i += 2) {
                avgAx += a[i];
                avgAy += a[i + 1];

                if (a[i] < minAx) minAx = a[i];
                if (a[i] > maxAx) maxAx = a[i];
                if (a[i + 1] < minAy) minAy = a[i + 1];
                if (a[i + 1] > maxAy) maxAy = a[i + 1];
            }
            avgAx /= 0.5 * n;
            avgAy /= 0.5 * n;


            // Get bounding box of b.
            let minBx = b[0];
            let maxBx = b[0];
            let minBy = b[1];
            let maxBy = b[1];

            // Get average point of a.
            m = b.length;
            let avgBx = b[0], avgBy = b[1];
            for (i = 2; i <= m - 2; i += 2) {
                avgBx += b[i];
                avgBy += b[i + 1];

                if (b[i] < minBx) minBx = b[i];
                if (b[i] > maxBx) maxBx = b[i];
                if (b[i + 1] < minBy) minBy = b[i + 1];
                if (b[i + 1] > maxBy) maxBy = b[i + 1];
            }
            avgBx /= 0.5 * m;
            avgBy /= 0.5 * m;

            if (GeometryUtils.pointInConvex(b, avgAx, avgAy)) {
                if (GeometryUtils.pointInConvex(a, avgBx, avgBy)) {
                    // Average points both within other polygon: we must check the bbox.
                    if (minBx < minAx || minBy < minAy || maxBx > maxAx || maxBy > maxAy) {
                        // Polygon b encapsulates polygon a.
                        return a;
                    } else if (minBx > minAx || minBy > minAy || maxBx < maxAx || maxBy < maxAy) {
                        // Polygon a encapsulates polygon b.
                        return b;
                    } else {
                        // Identical bounds. We must test all corner points individually.
                        for (i = 0; i <= n - 2; i += 2) {
                            if (!GeometryUtils.pointInConvex(b, a[i], a[i + 1])) {
                                return b;
                            }
                        }
                        return a;
                    }
                } else {
                    return a;
                }
            } else {
                if (GeometryUtils.pointInConvex(a, avgBx, avgBy)) {
                    return b;
                } else {
                    // No intersection: empty result.
                    return [];
                }
            }
        }
    }
}


/**
 * Maintains and renders a tree structure of views.
 * Copyright Metrological, 2017
 */


/**
 * @todo:
 * - hasAlpha in format, and try to prepare images for upload (so that we get buffer performance).
 * - encapsulate tags branches (for isolating widgets)
 * - quick clone
 *   - text texture problems or not?
 * - change documentation
 *   - text2pngEndpoint
 *   - supercharger?
 *   - transition changes
 *   - animation mergers: native vs non-native
 *   - type extensions
 *   - list/borders
 *   - layout
 *   - getRenderWidth
 *   - quick clone
 *   - offthread-image for better image loading performance
 * - merge es6 to master
 * - shaders (VAOs)
 *
 * - convert UI(?)
 * - convert Bunnyhopper(?)
 * - convert TMDB(?)
 */
class Stage extends Base {
    constructor(options) {
        super();

        EventEmitter.call(this);

        this.setOptions(options);

        this.init();
    }

    setOptions(o) {
        this.options = o;

        let opt = (name, def) => {
            let value = o[name];

            if (value === undefined) {
                this.options[name] = def;
            } else {
                this.options[name] = value;
            }
        }

        opt('w', 1280);
        opt('h', 720);
        opt('canvas', this.options.canvas);
        opt('renderWidth', this.options.w);
        opt('renderHeight', this.options.h);
        opt('textureMemory', 12e6);
        opt('glClearColor', [0, 0, 0, 0]);
        opt('defaultFontFace', 'Sans-Serif');
        opt('defaultPrecision', (this.options.h / this.options.renderHeight));
        opt('fixedDt', 0);
        opt('useTextureAtlas', true);
        opt('debugTextureAtlas', false);
    }

    init() {
        this.adapter = new WebAdapter();

        if (this.adapter.init) {
            this.adapter.init(this);
        }

        this.gl = this.adapter.createWebGLContext(this.options.w, this.options.h);

        this.setGlClearColor(this.options.glClearColor);

        this.frameCounter = 0;

        
        this.transitions = new TransitionManager(this);
        this.animations = new AnimationManager(this);
        

        this.renderer = new Renderer(this);

        this.textureManager = new TextureManager(this);

        if (this.options.useTextureAtlas) {
            this.textureAtlas = new TextureAtlas(this);
        }

        this.ctx = new VboContext(this);

        this.root = this.createView();

        this.root.setAsRoot();

        this.startTime = 0;
        this.currentTime = 0;
        this.dt = 0;

        /**
         * Counts the number of attached components that are using z-indices.
         * This is used to determine if we can use a single-pass or dual-pass update/render loop.
         * @type {number}
         */
        this.zIndexUsage = 0;

        this._destroyed = false;

        let self = this;

        // Preload rectangle texture, so that we can skip some border checks for loading textures.
        this.rectangleTexture = this.texture(function(cb) {
            var whitePixel = new Uint8Array([255, 255, 255, 255]);
            return cb(null, whitePixel, {w: 1, h: 1});
        }, {id: '__whitepix'});

        let source = this.rectangleTexture.source;
        this.rectangleTexture.source.load(true);

        source.permanent = true;
        if (self.textureAtlas) {
            self.textureAtlas.add(source);
        }

        self.adapter.startLoop();
    }

    destroy() {
        this.adapter.stopLoop();
        if (this.textureAtlas) {
            this.textureAtlas.destroy();
        }
        this.renderer.destroy();
        this.textureManager.destroy();
        this._destroyed = true;
    }

    stop() {
        this.adapter.stopLoop();
    }

    resume() {
        if (this._destroyed) {
            throw new Error("Already destroyed");
        }
        this.adapter.startLoop();
    }

    getCanvas() {
        return this.adapter.getWebGLCanvas();
    }

    drawFrame() {
        if (this.options.fixedDt) {
            this.dt = this.options.fixedDt;
        } else {
            this.dt = (!this.startTime) ? .02 : .001 * (this.currentTime - this.startTime);
        }
        this.startTime = this.currentTime;
        this.currentTime = (new Date()).getTime();

        this.emit('frameStart');

        if (this.textureManager.isFull()) {
            console.log('clean up');
            this.textureManager.freeUnusedTextureSources();
        }

        this.emit('update');

        if (this.textureAtlas) {
            // Add new texture sources to the texture atlas.
            this.textureAtlas.flush();
        }

        let changes = !this.ctx.staticStage;
        if (changes) {
            this.ctx.layout();

            this.ctx.updateAndFillVbo(this.zIndexUsage > 0);

            // We will render the stage even if it's stable shortly after importing a texture in the texture atlas, to prevent out-of-syncs.
            this.renderer.render();
        }

        this.adapter.nextFrame(changes);

        this.frameCounter++;
    }

    setGlClearColor(clearColor) {
        if (Array.isArray(clearColor)) {
            this.options.glClearColor = clearColor;
        } else {
            this.options.glClearColor = StageUtils.getRgbaComponentsNormalized(clearColor);
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
            delete settings.type;
        } else {
            view = this.createView();
        }
        view.setSettings(settings);
        return view;
    }

    c(settings) {
        return this.view(settings);
    }

    /**
     * Returns the specified texture.
     * @param {string|function} source
     * @param {object} options
     *   - id: number
     *     Fixed id. Handy when using base64 strings or when using canvas textures.
     *   - x: number
     *     Clipping offset x.
     *   - y: number
     *     Clipping offset y.
     *   - w: number
     *     Clipping offset w.
     *   - h: number
     *     Clipping offset h.
     *   - precision: number
     *     Render precision (0.5 = fuzzy, 1 = normal, 2 = sharp even when scaled twice, etc.).
     * @returns {Texture}
     */
    texture(source, options) {
        return this.textureManager.getTexture(source, options);
    }
}



Base.mixinEs5(Stage, EventEmitter);




/**
 * Copyright Metrological, 2017
 */
class Renderer {

    constructor(stage) {
        this.stage = stage;

        this.gl = stage.gl;

        this._program = null;

        this._vertexShaderSrc = [
            "#ifdef GL_ES",
            "precision lowp float;",
            "#endif",
            "attribute vec2 aVertexPosition;",
            "attribute vec2 aTextureCoord;",
            "attribute vec4 aColor;",
            "uniform mat4 projectionMatrix;",
            "varying vec2 vTextureCoord;",
            "varying vec4 vColor;",
            "void main(void){",
            "    gl_Position = projectionMatrix * vec4(aVertexPosition, 0.0, 1.0);",
            "    vTextureCoord = aTextureCoord;",
            "    vColor = aColor;",
            "}"
        ].join("\n");

        this._fragmentShaderSrc = [
            "#ifdef GL_ES",
            "precision lowp float;",
            "#endif",
            "varying vec2 vTextureCoord;",
            "varying vec4 vColor;",
            "uniform sampler2D uSampler;",
            "void main(void){",
            "    gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor;",
            "}"
        ].join("\n");

        // The matrix that causes the [0,0 - W,H] box to map to [-1,-1 - 1,1] in the end results.
        this._projectionMatrix = new Float32Array([
            2/this.stage.options.renderWidth, 0, 0, 0,
            0, -2/this.stage.options.renderHeight, 0, 0,
            0, 0, 1, 0,
            -1, 1, 0, 1
        ]);

        this._paramsGlBuffer = null;

        this._program = null;

        this._vertexPositionAttribute = null;
        this._textureCoordAttribute = null;
        this._colorAttribute = null;

        this._indicesGlBuffer = null;

        this._initShaderProgram();

    }

    _initShaderProgram() {
        let gl = this.gl;

        let glVertShader = this._glCompile(gl.VERTEX_SHADER, this._vertexShaderSrc);
        let glFragShader = this._glCompile(gl.FRAGMENT_SHADER, this._fragmentShaderSrc);

        this._program = gl.createProgram();

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
        gl.useProgram(this._program);

        // clean up some shaders
        gl.deleteShader(glVertShader);
        gl.deleteShader(glFragShader);

        // Bind attributes.
        this._vertexPositionAttribute = gl.getAttribLocation(this._program, "aVertexPosition");
        this._textureCoordAttribute = gl.getAttribLocation(this._program, "aTextureCoord");
        this._colorAttribute = gl.getAttribLocation(this._program, "aColor");

        // Init webgl arrays.

        this.allIndices = new Uint16Array(100000);

        // fill the indices with the quads to draw.
        for (let i = 0, j = 0; i < Renderer.MAX_QUADS * 6; i += 6, j += 4) {
            this.allIndices[i] = j;
            this.allIndices[i + 1] = j + 1;
            this.allIndices[i + 2] = j + 2;
            this.allIndices[i + 3] = j;
            this.allIndices[i + 4] = j + 2;
            this.allIndices[i + 5] = j + 3;
        }

        this._paramsGlBuffer = gl.createBuffer();

        this._indicesGlBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indicesGlBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.allIndices, gl.STATIC_DRAW);

        // Set transformation matrix.
        let projectionMatrixAttribute = gl.getUniformLocation(this._program, "projectionMatrix");
        gl.uniformMatrix4fv(projectionMatrixAttribute, false, this._projectionMatrix);
    }
    
    _glCompile(type, src) {
        let shader = this.gl.createShader(type);

        this.gl.shaderSource(shader, src);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.log(this.gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    destroy() {
        this.gl.deleteBuffer(this._paramsGlBuffer);
        this.gl.deleteBuffer(this._indicesGlBuffer);
        this.gl.deleteProgram(this._program);
    }
    
    render() {
        if (this.gl.isContextLost && this.gl.isContextLost()) {
            console.error('WebGL context lost');
            return;
        }

        // Draw the actual textures to screen.
        this.renderItems();
    }
    
    renderItems() {
        let i;
        let gl = this.gl;

        let ctx = this.stage.ctx;

        // Set up WebGL program.
        gl.useProgram(this._program);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0,0,this.stage.options.w,this.stage.options.h);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);

        // Clear screen.
        let glClearColor = this.stage.options.glClearColor;
        gl.clearColor(glClearColor[0], glClearColor[1], glClearColor[2], glClearColor[3]);
        gl.clear(gl.COLOR_BUFFER_BIT);

        let view = new DataView(ctx.vboParamsBuffer, 0, ctx.vboIndex * 4);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._paramsGlBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, view, gl.DYNAMIC_DRAW);
        let vboGlTextures = ctx.vboGlTextures;
        let vboGlTextureRepeats = ctx.vboGlTextureRepeats;
        let count = ctx.vboGlTextures.length;

        if (count) {
            gl.vertexAttribPointer(this._vertexPositionAttribute, 2, gl.FLOAT, false, 16, 0);
            gl.vertexAttribPointer(this._textureCoordAttribute, 2, gl.UNSIGNED_SHORT, true, 16, 2 * 4);
            gl.vertexAttribPointer(this._colorAttribute, 4, gl.UNSIGNED_BYTE, true, 16, 3 * 4);

            gl.enableVertexAttribArray(this._vertexPositionAttribute);
            gl.enableVertexAttribArray(this._textureCoordAttribute);
            gl.enableVertexAttribArray(this._colorAttribute);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indicesGlBuffer);

            let pos = 0;
            for (i = 0; i < count; i++) {
                gl.bindTexture(gl.TEXTURE_2D, vboGlTextures[i]);
                gl.drawElements(gl.TRIANGLES, 6 * vboGlTextureRepeats[i], gl.UNSIGNED_SHORT, pos * 6 * 2);
                pos += vboGlTextureRepeats[i];
            }
            gl.disableVertexAttribArray(this._vertexPositionAttribute);
            gl.disableVertexAttribArray(this._textureCoordAttribute);
            gl.disableVertexAttribArray(this._colorAttribute);
        }

    }
    
}

/**
 * Max number of quads that can be rendered in one frame.
 * The memory usage is 64B * Renderer.MAX_QUADS.
 * Notice that this may never be higher than (65536 / 4)|0 due to index buffer limitations.
 * @note if a sprite is being clipped or has borders, it may use more than 1 quad.
 * @type {number}
 */
Renderer.MAX_QUADS = (65536 / 4)|0;



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

        /**
         * The texture source id to texture source hashmap.
         * (only the texture sources that are referenced by one or more active components).
         * @type {Map<Number, TextureSource>}
         */
        this.textureSourceIdHashmap = new Map();
    }

    destroy() {
        for (let i = 0, n = this._uploadedTextureSources.length; i < n; i++) {
            let ts = this._uploadedTextureSources[i];
            this.gl.deleteTexture(ts.glTexture);
        }
    }

    loadSrcTexture(src, ts, sync, cb) {
        this.stage.adapter.loadSrcTexture(src, ts, sync, cb);
    }

    loadTextTexture(settings, ts, sync, cb) {
        if (this.stage.options.text2pngEndpoint && !sync) {
            var src = this.stage.options.text2pngEndpoint + "?q=" + encodeURIComponent(JSON.stringify(settings.getNonDefaults()));
            this.loadSrcTexture(src, ts, sync, cb);
        } else {
            this.stage.adapter.loadTextTexture(settings, ts, sync, cb);
        }
    }

    getTexture(source, options) {
        let id = options && options.id || null;

        let texture, textureSource;
        if (Utils.isString(source)) {
            id = id || source;

            // Check if texture source is already known.
            textureSource = this.textureSourceHashmap.get(id);
            if (!textureSource) {
                // Create new texture source.
                let self = this;
                let func = function (cb, ts, sync) {
                    self.loadSrcTexture(source, ts, sync, cb);
                };
                textureSource = this.getTextureSource(func, id);
                if (!textureSource.renderInfo) {
                    textureSource.renderInfo = {src: source};
                }
            }
        } else if (source instanceof TextureSource) {
            textureSource = source;
        } else {
            // Create new texture source.
            textureSource = this.getTextureSource(source, id);
        }

        // Create new texture object.
        texture = new Texture(this, textureSource);
        texture.x = options && options.x || 0;
        texture.y = options && options.y || 0;
        texture.w = options && options.w || 0;
        texture.h = options && options.h || 0;
        texture.clipping = !!(texture.x || texture.y || texture.w || texture.h);
        texture.precision = options && options.precision || 1;
        return texture;
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

        this.stage.adapter.uploadGlTexture(gl, textureSource, source, format.hasAlpha);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // Store texture.
        textureSource.glTexture = sourceTexture;

        this._usedTextureMemory += textureSource.w * textureSource.h;

        this._uploadedTextureSources.push(textureSource);
    }

    isFull() {
        return this._usedTextureMemory >= this.stage.options.textureMemory;
    }

    freeUnusedTextureSources() {
        let remainingTextureSources = [];
        let usedTextureMemoryBefore = this._usedTextureMemory;
        for (let i = 0, n = this._uploadedTextureSources.length; i < n; i++) {
            let ts = this._uploadedTextureSources[i];
            if (!ts.permanent && (ts.views.size === 0)) {
                this.freeTextureSource(ts);
            } else {
                remainingTextureSources.push(ts);
            }
        }

        let self = this;
        this.textureSourceHashmap.forEach(function(textureSource) {
            if (!textureSource.permanent && (textureSource.views.size === 0)) {
                self.freeTextureSource(textureSource);
            }
        });

        this._uploadedTextureSources = remainingTextureSources;
        console.log('freed ' + ((usedTextureMemoryBefore - this._usedTextureMemory) / 1e6).toFixed(2) + 'M texture pixels from GPU memory. Remaining: ' + this._usedTextureMemory);
    }
    
    freeTextureSource(textureSource) {
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

}



/**
 * Copyright Metrological, 2017
 */
class Texture {

    /**
     * @param {TextureManager} manager
     * @param {TextureSource} source
     */
    constructor(manager, source) {
        this.manager = manager;

        this.id = Texture.id++;

        /**
         * The associated texture source.
         * Should not be changed.
         * @type {TextureSource}
         */
        this.source = source;

    }

    _properties() {

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
         * Indicates if Texture.prototype.texture uses clipping.
         * @type {boolean}
         */
        this.clipping = false;

    }

    enableClipping(x, y, w, h) {
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
        this.source.views.forEach(function(view) {
            // Ignore if not the currently displayed texture.
            if (view.displayedTexture === self) {
                view.onDisplayedTextureClippingChanged();
            }
        });
    }

    updatePrecision() {
        let self = this;
        this.source.views.forEach(function(view) {
            // Ignore if not the currently displayed texture.
            if (view.displayedTexture === self) {
                view.onPrecisionChanged();
            }
        });
    }

    replaceTextureSource(newSource) {
        let oldSource = this.source;

        this.source = newSource;

        oldSource.views.forEach(view => {
            if (view.texture === this || view.displayedTexture === this) {
                // Remove links from previous source, but only if there is no reason for it any more.
                let keep = (view.displayedTexture && view.displayedTexture !== this && view.displayedTexture.source === oldSource);
                keep = keep || (view.texture && view.texture !== this && view.texture.source === oldSource);

                if (!keep) {
                    oldSource.removeView(view);
                }

                newSource.addView(view);

                if (newSource.glTexture) {
                    view.displayedTexture = this;
                }
            }
        });
    }

    getNonDefaults() {
        let nonDefaults = {};
        if (this.x !== 0) nonDefaults['x'] = this.x;
        if (this.y !== 0) nonDefaults['y'] = this.y;
        if (this.w !== 0) nonDefaults['w'] = this.w;
        if (this.h !== 0) nonDefaults['h'] = this.h;
        if (this.precision !== 1) nonDefaults['precision'] = this.precision;
        return nonDefaults;        
    }
    
    get x() {return this._x}
    set x(v) {if (this._x !== v) {
        this._x = v;
        this.updateClipping();
    }}

    get y() {return this._y}
    set y(v) {if (this._y !== v) {
        this._y = v;
        this.updateClipping();
    }}

    get w() {return this._w}
    set w(v) {if (this._w !== v) {
        this._w = v;
        this.updateClipping();
    }}

    get h() {return this._h}
    set h(v) {if (this._h !== v) {
        this._h = v;
        this.updateClipping();
    }}

    get precision() {return this._precision}
    set precision(v) {if (this._precision !== v) {
        this._precision = v;
        this.updatePrecision();
    }}
    
}

Texture.id = 0;


/**
 * Copyright Metrological, 2017
 */
class TextureSource {

    constructor(manager, loadCb) {
        this.id = TextureSource.id++;

        this.manager = manager;
        
        this.stage = manager.stage;

        this.id = TextureSource.id++;

        /**
         * The factory for the source of this texture.
         * @type {Function}
         */
        this.loadCb = loadCb;

        /**
         * All active views that are using this texture source via a texture (either as texture or displayedTexture, or both).
         * @type {Set<View>}
         */
        this.views = new Set();
        
    }

    _properties() {
        
        /**
         * Identifier for reuse.
         * @type {String}
         */
        this.lookupId = null;

        /**
         * If set, this.is called when the texture source is no longer displayed (this.components.size becomes 0).
         * @type {Function}
         */
        this.cancelCb = null;

        /**
         * Loading since timestamp in millis.
         * @type {number}
         */
        this.loadingSince = 0;

        /**
         * Flag that indicates if this.texture source was stored in the texture atlas.
         * @type {boolean}
         */
        this.inTextureAtlas = false;

        /**
         * The x coordinate in the texture atlas.
         * @type {number}
         */
        this.textureAtlasX = 0;

        /**
         * The y coordinate in the texture atlas.
         * @type {number}
         */
        this.textureAtlasY = 0;

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
    }
    
    getRenderWidth() {
        return this.w;
    }

    getRenderHeight() {
        return this.h;
    }
    
    addView(v) {
        if (!this.views.has(v)) {
            this.views.add(v);

            if (this.glTexture) {
                // If not yet loaded, wait until it is loaded until adding it to the texture atlas.
                if (this.stage.textureAtlas) {
                    this.stage.textureAtlas.addActiveTextureSource(this);
                }
            }

            if (this.views.size === 1) {
                this.manager.textureSourceIdHashmap.set(this.id, this);
                if (this.lookupId) {
                    if (!this.manager.textureSourceHashmap.has(this.lookupId)) {
                        this.manager.textureSourceHashmap.set(this.lookupId, this);
                    }
                }

                this.becomesVisible();
            }
        }        
    }
    
    removeView(v) {
        if (this.views.delete(v)) {
            if (!this.views.size) {
                if (this.stage.textureAtlas) {
                    this.stage.textureAtlas.removeActiveTextureSource(this);
                }
                this.manager.textureSourceIdHashmap.delete(this.id);

                this.becomesInvisible();
            }
        }        
    }

    becomesVisible() {
        this.load(false);
    }

    becomesInvisible() {
        if (this.isLoading()) {
            if (this.cancelCb) {
                this.cancelCb(this);
            }
        }
    }

    load(sync) {
        if (this.isLoading() && sync) {
            // We cancel the previous one.
            if (this.cancelCb) {
                // Allow the callback to cancel loading.
                this.cancelCb(this);
            }
            this.loadingSince = 0;
        }

        if (!this.glTexture && !this.isLoading()) {
            var self = this;
            this.loadingSince = (new Date()).getTime();
            this.loadCb(function(err, source, options) {
                if (self.manager.stage.destroyed) {
                    // Ignore async load when stage is destroyed.
                    return;
                }
                self.loadingSince = 0;
                if (err) {
                    // Emit txError.
                    self.onError(err);
                } else if (source) {
                    self.setSource(source, options);
                }
            }, this, !!sync);
        }
    }

    isLoading() {
        return this.loadingSince > 0;
    }

    setSource(source, options) {
        this.w = source.width || (options && options.w) || 0;
        this.h = source.height || (options && options.h) || 0;

        if (this.w > 2048 || this.h > 2048) {
            console.error('Texture size too large: ' + source.width + 'x' + source.height + ' (max allowed is 2048x2048)');
            return;
        }

        if (options && options.renderInfo) {
            // Assign to id in cache so that it can be reused.
            this.renderInfo = options.renderInfo;
        }

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

        this.manager.uploadTextureSource(this, source, format);

        this.onLoad();
    }

    isVisible() {
        return (this.views.size > 0);
    }

    onLoad() {
        if (this.isVisible() && this.stage.textureAtlas) {
            this.stage.textureAtlas.addActiveTextureSource(this);
        }

        this.views.forEach(function(view) {
            view.onTextureSourceLoaded();
        });
    }

    onError(e) {
        console.error('texture load error', e, this.id);
        this.views.forEach(function(view) {
            view.onTextureSourceLoadError(e);
        });
    }

    onAddedToTextureAtlas(x, y) {
        this.inTextureAtlas = true;
        this.textureAtlasX = x;
        this.textureAtlasY = y;

        this.views.forEach(function(view) {
            view.onTextureSourceAddedToTextureAtlas();
        });
    }

    onRemovedFromTextureAtlas() {
        this.inTextureAtlas = false;
        this.views.forEach(function(view) {
            view.onTextureSourceRemovedFromTextureAtlas();
        });
    }

    free() {
        this.manager.freeTextureSource(this);
    }
}

TextureSource.id = 1;


/**
 * Copyright Metrological, 2017
 */
class TextureAtlas {

    constructor(stage) {
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
         * @type {WebGLRenderingContext}
         */
        this.gl = this.stage.gl;

        this._vertexShaderSrc = [
            "#ifdef GL_ES",
            "precision lowp float;",
            "#endif",
            "attribute vec2 aVertexPosition;",
            "attribute vec2 aTextureCoord;",
            "uniform mat4 projectionMatrix;",
            "varying vec2 vTextureCoord;",
            "void main(void){",
            "    gl_Position = projectionMatrix * vec4(aVertexPosition, 0.0, 1.0);",
            "    vTextureCoord = aTextureCoord;",
            "}"
        ].join("\n");

        this._fragmentShaderSrc = [
            "#ifdef GL_ES",
            "precision lowp float;",
            "#endif",
            "varying vec2 vTextureCoord;",
            "uniform sampler2D uSampler;",
            "void main(void){",
            "    gl_FragColor = texture2D(uSampler, vTextureCoord);",
            "}"
        ].join("\n");

        this._program = null;

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

        // The matrix that causes the [0,0 - w,h] box to map to [-1,-1 - 1,1] in the end results.
        this._projectionMatrix = new Float32Array([
            2/this.w, 0, 0, 0,
            0, 2/this.h, 0, 0,
            0, 0, 1, 0,
            -1, -1, 0, 1
        ]);

        this._initShaderProgram();
        
    }
    
    _initShaderProgram() {
        let gl = this.gl;

        let glVertShader = this._glCompile(gl.VERTEX_SHADER, this._vertexShaderSrc);
        let glFragShader = this._glCompile(gl.FRAGMENT_SHADER, this._fragmentShaderSrc);

        this._program = gl.createProgram();

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
        gl.useProgram(this._program);

        // clean up some shaders
        gl.deleteShader(glVertShader);
        gl.deleteShader(glFragShader);

        // Bind attributes.
        this._vertexPositionAttribute = gl.getAttribLocation(this._program, "aVertexPosition");
        this._textureCoordAttribute = gl.getAttribLocation(this._program, "aTextureCoord");

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
        let projectionMatrixAttribute = gl.getUniformLocation(this._program, "projectionMatrix");
        gl.uniformMatrix4fv(projectionMatrixAttribute, false, this._projectionMatrix);

        this.texture = this.gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.w, this.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(this.w * this.h * 4));
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
    
    _glCompile(type, src) {
        let shader = this.gl.createShader(type);

        this.gl.shaderSource(shader, src);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.log(this.gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }
    
    destroy() {
        this.gl.deleteTexture(this.texture);
        this.gl.deleteFramebuffer(this.framebuffer);
        this.gl.deleteBuffer(this.paramsGlBuffer);
        this.gl.deleteBuffer(this._indicesGlBuffer);
        this.gl.deleteProgram(this._program);        
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
        gl.useProgram(this._program);
        gl.viewport(0,0,this.w,this.h);
        gl.blendFunc(gl.ONE, gl.ZERO);
        gl.enable(gl.BLEND);
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
        EventEmitter.call(this);

        this.id = View.id++;

        this.stage = stage;

        this.renderer = new ViewRenderer(this);

        /**
         * A view is active if it is a descendant of the stage root and it is visible (worldAlpha > 0).
         * @type {boolean}
         */
        this._active = false;

        /**
         * A view is active if it is a descendant of the stage root.
         * @type {boolean}
         */
        this._attached = false;

        /**
         * @type {View}
         */
        this._parent = null;

        /**
         * The texture that is currently set.
         * @type {Texture}
         * @protected
         */
        this._texture = null;

        /**
         * The currently displayed texture. While this.texture is loading, this one may be different.
         * @type {Texture}
         * @protected
         */
        this._displayedTexture = null;

        /**
         * Tags that can be used to identify/search for a specific view.
         * @type {String[]}
         */
        this._tags = null;

        /**
         * The tree's tags mapping.
         * This contains all views for all known tags, at all times.
         * @type {Map}
         */
        this._treeTags = null;

        /**
         * Cache for the tag/mtag methods.
         * @type {Map<String,View[]>}
         */
        this._tagsCache = null;

        /**
         * Tag-to-complex cache (all tags that are part of the complex caches).
         * This maps tags to cached complex tags in the cache.
         * @type {Map<String,String[]>}
         */
        this._tagToComplex = null;

        this._x = 0;
        this._y = 0;
        this._w = 0;
        this._h = 0;
        this._scaleX = 1;
        this._scaleY = 1;
        this._pivotX = 0.5;
        this._pivotY = 0.5;
        this._mountX = 0;
        this._mountY = 0;
        this._alpha = 1;
        this._rotation = 0;
        this._visible = true;

        /**
         * The text functionality in case this view is a text view.
         * @type {ViewText}
         */
        this._viewText = null;

        /**
         * (Lazy-initialised) list of children owned by this view.
         * @type {ViewChildList}
         */
        this._childList = null;

        /**
         * (Lazy-initialised) exposed (public) list of children for this view.
         * This is normally the same as _childList except for complex views such as Lists.
         * @type {ViewChildList}
         */
        this._exposedChildList = null;

    }

    setAsRoot() {
        this._updateActiveFlag();
        this._updateAttachedFlag();
        this.renderer.setAsRoot();
    }

    _setParent(parent) {
        if (this._parent === parent) return;

        if (this._parent) {
            this._unsetTagsParent();
        }

        this._parent = parent;

        if (parent) {
            this._setTagsParent();
        }

        this._updateActiveFlag();

        this._updateAttachedFlag();
    };

    getDepth() {
        let depth = 0;

        let p = this;
        do {
            depth++;
            p = p._parent;
        } while (p);

        return depth;
    };

    getAncestor(l) {
        let p = this;
        while (l > 0 && p._parent) {
            p = p._parent;
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

            o1 = o1._parent;
            o2 = o2._parent;
        } while (o1 && o2);

        return null;
    };

    isActive() {
        return this._visible && (this._alpha > 0) && (this._parent ? this._parent._active : (this.stage.root === this));
    };

    isAttached() {
        return (this._parent ? this._parent._attached : (this.stage.root === this));
    };

    /**
     * Updates the 'active' flag for this branch.
     */
    _updateActiveFlag() {
        // Calculate active flag.
        let newActive = this.isActive();
        if (this._active !== newActive) {
            if (newActive) {
                this._setActiveFlag();
            } else {
                this._unsetActiveFlag();
            }

            let children = this._children.get();
            if (children) {
                let m = children.length;
                if (m > 0) {
                    for (let i = 0; i < m; i++) {
                        children[i]._updateActiveFlag();
                    }
                }
            }

            // Run this after all _children because we'd like to see (de)activating a branch as an 'atomic' operation.
            if (this._eventsCount) {
                this.emit('active', newActive);
            }
        }
    };

    _setActiveFlag() {
        // Detect texture changes.
        let dt = null;
        if (this._texture && this._texture.source.glTexture) {
            dt = this._texture;
            this._texture.source.addView(this);
        } else if (this._displayedTexture && this._displayedTexture.source.glTexture) {
            dt = this._displayedTexture;
        }

        this.displayedTexture = dt;

        // Force re-check of texture because dimensions might have changed (cutting).
        this._updateDimensions();
        this._updateTextureCoords();

        this._active = true;

        if (this._texture) {
            // It is important to add the source listener before the texture listener because that may trigger a load.
            this._texture.source.addView(this);
        }

        if (this._displayedTexture && this._displayedTexture !== this._texture) {
            this._displayedTexture.source.addView(this);
        }

        if (this.zIndex != 0) {
            // View uses z-index.
            this.stage.zIndexUsage++;
        }
    }

    _unsetActiveFlag() {
        if (this.zIndex != 0) {
            // View uses z-index.
            this.stage.zIndexUsage--;
        }

        if (this._texture) {
            this._texture.source.removeView(this);
        }

        if (this._displayedTexture) {
            this._displayedTexture.source.removeView(this);
        }

        this._active = false;
    }

    /**
     * Updates the 'attached' flag for this branch.
     */
    _updateAttachedFlag() {
        // Calculate active flag.
        let newAttached = this.isAttached();
        if (this._attached !== newAttached) {
            this._attached = newAttached;

            let children = this._children.get();
            if (children) {
                let m = children.length;
                if (m > 0) {
                    for (let i = 0; i < m; i++) {
                        children[i]._updateAttachedFlag();
                    }
                }
            }
        }
    };

    _getRenderWidth() {
        if (this._w) {
            return this._w;
        } else if (this._texture && this._texture.source.glTexture) {
            // Texture already loaded, but not yet updated (probably because it's not active).
            return (this._texture.w || (this._texture.source.w / this._texture.precision));
        } else if (this._displayedTexture) {
            return (this._displayedTexture.w || (this._displayedTexture.source.w / this._displayedTexture.precision));
        } else {
            return 0;
        }
    };

    _getRenderHeight() {
        if (this._h) {
            return this._h;
        } else if (this._texture && this._texture.source.glTexture) {
            // Texture already loaded, but not yet updated (probably because it's not active).
            return (this._texture.h || this._texture.source.h) / this._texture.precision;
        } else if (this._displayedTexture) {
            return (this._displayedTexture.h || this._displayedTexture.source.h) / this._displayedTexture.precision;
        } else {
            return 0;
        }
    };

    get renderWidth() {
        if (this._active) {
            // Render width is only maintained if this view is active.
            return this.renderer._rw;
        } else {
            return this._getRenderWidth();
        }
    }

    get renderHeight() {
        if (this._active) {
            return this.renderer._rh;
        } else {
            return this._getRenderHeight();
        }
    }

    get texture() {
        return this._texture;
    }

    textureIsLoaded() {
        return this.texture ? !!this.texture.source.glTexture : false;
    }

    loadTexture(sync) {
        if (this.texture) {
            this.texture.source.load(sync);
        }
    }

    set texture(v) {
        if (v && Utils.isObjectLiteral(v)) {
            if (this.texture) {
                Base.setObjectSettings(this.texture, v);
            } else {
                console.warn('Trying to set texture properties, but there is no texture.');
            }
            return;
        }

        let prevValue = this._texture;
        if (v !== prevValue) {
            if (v !== null && !(v instanceof Texture)) {
                throw new Error('incorrect value for texture');
            }

            this._texture = v;

            if (this._active && prevValue && this.displayedTexture !== prevValue) {
                // Keep reference to view for texture source
                if ((!v || prevValue.source !== v.source) && (!this.displayedTexture || (this.displayedTexture.source !== prevValue.source))) {
                    prevValue.source.removeView(this);
                }
            }

            if (v) {
                if (this._active) {
                    // When the texture is changed, maintain the texture's sprite registry.
                    // While the displayed texture is different from the texture (not yet loaded), two textures are referenced.
                    v.source.addView(this);
                }

                if (v.source.glTexture) {
                    this.displayedTexture = v;
                }
            } else {
                // Make sure that current texture is cleared when the texture is explicitly set to null.
                this.displayedTexture = null;
            }
        }
    }

    get displayedTexture() {
        return this._displayedTexture;
    }

    set displayedTexture(v) {
        let prevValue = this._displayedTexture;
        if (v !== prevValue) {
            if (this._active && prevValue) {
                // We can assume that this._texture === this._displayedTexture.

                if (prevValue !== this._texture) {
                    // The old displayed texture is deprecated.
                    if (!v || (prevValue.source !== v.source)) {
                        prevValue.source.removeView(this);
                    }
                }
            }

            this._displayedTexture = v;

            this._updateDimensions();

            if (v) {
                if (this._eventsCount) {
                    this.emit('txLoaded', v);
                }

                // We don't need to reference the displayed texture because it was already referenced (this.texture === this.displayedTexture).
                this._updateTextureCoords();
                this.renderer.setDisplayedTextureSource(v.source);
            } else {
                if (this._eventsCount) {
                    this.emit('txUnloaded', v);
                }

                this.renderer.setDisplayedTextureSource(null);
            }
        }
    }

    onTextureSourceLoaded() {
        // Now we can start showing this texture.
        this.displayedTexture = this._texture;
    };

    onTextureSourceLoadError(e) {
        if (this._eventsCount) {
            this.emit('txError', e, this._texture.source);
        }
    };

    onTextureSourceAddedToTextureAtlas() {
        this._updateTextureCoords();
    };

    onTextureSourceRemovedFromTextureAtlas() {
        this._updateTextureCoords();
    };

    onDisplayedTextureClippingChanged() {
        this._updateDimensions();
        this._updateTextureCoords();
    };

    onPrecisionChanged() {
        this._updateDimensions();
    };

    _updateDimensions() {
        let beforeW = this.renderer.rw;
        let beforeH = this.renderer.rh;
        let rw = this._getRenderWidth();
        let rh = this._getRenderHeight();
        if (beforeW !== rw || beforeH !== rh) {
            // Due to width/height change: update the translation vector and borders.
            this.renderer.setDimensions(this._getRenderWidth(), this._getRenderHeight());
            this._updateLocalTranslate();
        }
    }

    _updateLocalTransform() {
        if (this._rotation !== 0 && this._rotation % (2 * Math.PI)) {
            // check to see if the rotation is the same as the previous render. This means we only need to use sin and cos when rotation actually changes
            let _sr = Math.sin(this._rotation);
            let _cr = Math.cos(this._rotation);

            this.renderer.setLocalTransform(
                _cr * this._scaleX,
                -_sr * this._scaleY,
                _sr * this._scaleX,
                _cr * this._scaleY
            );
        } else {
            this.renderer.setLocalTransform(
                this._scaleX,
                0,
                0,
                this._scaleY
            );
        }
        this._updateLocalTranslate();
    };

    _updateLocalTranslate() {
        let pivotXMul = this._pivotX * this.renderer.rw;
        let pivotYMul = this._pivotY * this.renderer.rh;
        let px = this._x - (pivotXMul * this.renderer.localTa + pivotYMul * this.renderer.localTb) + pivotXMul;
        let py = this._y - (pivotXMul * this.renderer.localTc + pivotYMul * this.renderer.localTd) + pivotYMul;
        px -= this._mountX * this.renderWidth;
        py -= this._mountY * this.renderHeight;
        this.renderer.setLocalTranslate(
            px,
            py
        );
    };

    _updateLocalTranslateDelta(dx, dy) {
        this.renderer.addLocalTranslate(dx, dy)
    };

    _updateLocalAlpha() {
        this.renderer.setLocalAlpha(this._visible ? this._alpha : 0);
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

                if (displayedTexture.w) {
                    rw = displayedTexture.w * iw;
                } else {
                    rw = (w - displayedTexture.x) * iw;
                }

                if (displayedTexture.h) {
                    rh = displayedTexture.h * ih;
                } else {
                    rh = (h - displayedTexture.y) * ih;
                }

                iw *= displayedTexture.x;
                ih *= displayedTexture.y;

                tx1 = Math.min(1.0, Math.max(0, iw));
                ty1 = Math.min(1.0, Math.max(ih));
                tx2 = Math.min(1.0, Math.max(tx2 * rw + iw));
                ty2 = Math.min(1.0, Math.max(ty2 * rh + ih));
            }

            if (displayedTextureSource.inTextureAtlas) {
                // Calculate texture atlas texture coordinates.
                let textureAtlasI = 0.000488281;    // 1/2048.

                let tax = (displayedTextureSource.textureAtlasX * textureAtlasI);
                let tay = (displayedTextureSource.textureAtlasY * textureAtlasI);
                let dax = (displayedTextureSource.w * textureAtlasI);
                let day = (displayedTextureSource.h * textureAtlasI);

                tx1 = tx1 * dax + tax;
                ty1 = ty1 * dax + tay;

                tx2 = tx2 * dax + tax;
                ty2 = ty2 * day + tay;
            }

            this.renderer.setTextureCoords(tx1, ty1, tx2, ty2);
            this.renderer.setInTextureAtlas(displayedTextureSource.inTextureAtlas);
        }
    }

    getCornerPoints() {
        return this.renderer.getCornerPoints();
    }

    /**
     * Clears the cache(s) for the specified tag.
     * @param {String} tag
     */
    _clearTagsCache(tag) {
        if (this._tagsCache) {
            this._tagsCache.delete(tag);

            if (this._tagToComplex) {
                let s = this._tagToComplex.get(tag);
                if (s) {
                    for (let i = 0, n = s.length; i < n; i++) {
                        this._tagsCache.delete(s[i]);
                    }
                    this._tagToComplex.delete(tag);
                }
            }
        }
    };

    _unsetTagsParent() {
        let tags = null;
        let n = 0;
        if (this._treeTags) {
            tags = Utils.iteratorToArray(this._treeTags.keys());
            n = tags.length;

            if (n > 0) {
                for (let i = 0; i < n; i++) {
                    let tagSet = this._treeTags.get(tags[i]);

                    // Remove from treeTags.
                    let p = this;
                    while (p = p._parent) {
                        let parentTreeTags = p._treeTags.get(tags[i]);

                        tagSet.forEach(function (comp) {
                            parentTreeTags.delete(comp);
                        });


                        p._clearTagsCache(tags[i]);
                    }
                }
            }
        }

    };

    _setTagsParent() {
        if (this._treeTags && this._treeTags.size) {
            let self = this;
            this._treeTags.forEach(function (tagSet, tag) {
                // Add to treeTags.
                let p = self;
                while (p = p._parent) {
                    if (!p._treeTags) {
                        p._treeTags = new Map();
                    }

                    let s = p._treeTags.get(tag);
                    if (!s) {
                        s = new Set();
                        p._treeTags.set(tag, s);
                    }

                    tagSet.forEach(function (comp) {
                        s.add(comp);
                    });

                    p._clearTagsCache(tag);
                }
            });
        }
    };

    _getByTag(tag) {
        if (!this._treeTags) {
            return [];
        }
        let t = this._treeTags.get(tag);
        return t ? Utils.setToArray(t) : [];
    };

    getTags() {
        return this._tags ? this._tags : [];
    };

    setTags(tags) {
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
    };

    addTag(tag) {
        if (!this._tags) {
            this._tags = [];
        }
        if (this._tags.indexOf(tag) === -1) {
            this._tags.push(tag);

            // Add to treeTags hierarchy.
            let p = this;
            do {
                if (!p._treeTags) {
                    p._treeTags = new Map();
                }

                let s = p._treeTags.get(tag);
                if (!s) {
                    s = new Set();
                    p._treeTags.set(tag, s);
                }

                s.add(this);

                p._clearTagsCache(tag);
            } while (p = p._parent);
        }
    };

    removeTag(tag) {
        let i = this._tags.indexOf(tag);
        if (i !== -1) {
            this._tags.splice(i, 1);

            // Remove from treeTags hierarchy.
            let p = this;
            do {
                let list = p._treeTags.get(tag);
                if (list) {
                    list.delete(this);

                    p._clearTagsCache(tag);
                }
            } while (p = p._parent);
        }
    };

    hasTag(tag) {
        return (this._tags && (this._tags.indexOf(tag) !== -1));
    };

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
        if (this._tagsCache) {
            res = this._tagsCache.get(tag);
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

            if (!this._tagsCache) {
                this._tagsCache = new Map();
            }

            this._tagsCache.set(tag, res);
        }
        return res;
    };

    stag(tag, settings) {
        let t = this.mtag(tag);
        let n = t.length;
        for (let i = 0; i < n; i++) {
            t[i].setSettings(settings);
        }
    }

    getLocationString() {
        let i;
        if (this._parent) {
            i = this._parent._children.getIndex(this);
            if (i >= 0) {
                let localTags = this.getTags();
                return this._parent.getLocationString() + ":" + i + "[" + this.id + "]" + (localTags.length ? "(" + localTags.join(",") + ")" : "");
            }
        }
        return "";
    };

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

        if (children && children.length) {
            let isEmpty = (str === "{}");
            str = str.substr(0, str.length - 1) + (isEmpty ? "" : ",") + "\"children\":[\n";
            let n = children.length;
            for (let i = 0; i < n; i++) {
                str += View.getPrettyString(children[i], indent + "  ") + (i < n - 1 ? "," : "") + "\n";
            }
            str += indent + "]}";
        }

        return indent + str;
    }

    getSettings() {
        let settings = this.getNonDefaults();

        let children = this._children.get();
        if (children) {
            let n = children.length;
            settings.children = [];
            for (let i = 0; i < n; i++) {
                settings.children.push(children[i].getSettings());
            }
        }

        return settings;
    }

    getNonDefaults() {
        let settings = {};

        if (this._tags && this._tags.length) {
            settings.tags = this._tags;
        }

        if (this._x !== 0) settings.x = this._x;
        if (this._y !== 0) settings.y = this._y;
        if (this._w !== 0) settings.w = this._w;
        if (this._h !== 0) settings.h = this._h;

        if (this._scaleX === this._scaleY) {
            if (this._scaleX !== 1) settings.scale = this._scaleX;
        } else {
            if (this._scaleX !== 1) settings.scaleX = this._scaleX;
            if (this._scaleY !== 1) settings.scaleY = this._scaleY;
        }

        if (this._pivotX === this._pivotY) {
            if (this._pivotX !== 0.5) settings.pivot = this._pivotX;
        } else {
            if (this._pivotX !== 0.5) settings.pivotX = this._pivotX;
            if (this._pivotY !== 0.5) settings.pivotY = this._pivotY;
        }

        if (this._mountX === this._mountY) {
            if (this._mountX !== 0) settings.mount = this._mountX;
        } else {
            if (this._mountX !== 0) settings.mountX = this._mountX;
            if (this._mountY !== 0) settings.mountY = this._mountY;
        }

        if (this._alpha !== 1) settings.alpha = this._alpha;

        if (this._rotation !== 0) settings.rotation = this._rotation;

        if (this._colorUl === this._colorUr && this._colorBl === this._colorBr && this._colorUl === this._colorBl) {
            if (this._colorUl !== 0xFFFFFFFF) settings.color = 0xFFFFFFFF;
        } else {
            if (this._colorUl !== 0xFFFFFFFF) settings.colorUl = 0xFFFFFFFF;
            if (this._colorUr !== 0xFFFFFFFF) settings.colorUr = 0xFFFFFFFF;
            if (this._colorBl !== 0xFFFFFFFF) settings.colorBl = 0xFFFFFFFF;
            if (this._colorBr !== 0xFFFFFFFF) settings.colorBr = 0xFFFFFFFF;
        }

        if (!this._visible) settings.visible = false;

        if (this.renderer.zIndex) settings.zIndex = this.renderer.zIndex;

        if (this.renderer.forceZIndexContext) settings.forceZIndexContext = true;

        if (this.renderer.clipping) settings.clipping = this.renderer.clipping;

        if (this.rect) {
            settings.rect = true;
        } else if (this.src) {
            settings.src = this.src;
        } else if (this.texture && this._viewText) {
            settings.text = this._viewText.settings.getNonDefaults();
        }

        if (this._texture) {
            let tnd = this._texture.getNonDefaults();
            if (Object.keys(tnd).length) {
                settings.texture = tnd;
            }
        }

        return settings;
    };

    setSettings(settings) {
        Base.setObjectSettings(this, settings);
    }

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

    get x() {
        return this._x
    }

    set x(v) {
        if (this._x !== v) {
            this._updateLocalTranslateDelta(v - this._x, 0)
            this._x = v
        }
    }

    get y() {
        return this._y
    }

    set y(v) {
        if (this._y !== v) {
            this._updateLocalTranslateDelta(0, v - this._y)
            this._y = v
        }
    }

    get w() {
        return this._w
    }

    set w(v) {
        if (this._w !== v) {
            this._w = v
            this._updateDimensions()
        }
    }

    get h() {
        return this._h
    }

    set h(v) {
        if (this._h !== v) {
            this._h = v
            this._updateDimensions()
        }
    }

    get scaleX() {
        return this._scaleX
    }

    set scaleX(v) {
        if (this._scaleX !== v) {
            this._scaleX = v
            this._updateLocalTransform()
        }
    }

    get scaleY() {
        return this._scaleY
    }

    set scaleY(v) {
        if (this._scaleY !== v) {
            this._scaleY = v
            this._updateLocalTransform()
        }
    }

    get scale() {
        return this._scaleX
    }

    set scale(v) {
        if (this._scaleX !== v || this._scaleY !== v) {
            this._scaleX = v
            this._scaleY = v
            this._updateLocalTransform()
        }
    }

    get pivotX() {
        return this._pivotX
    }

    set pivotX(v) {
        if (this._pivotX !== v) {
            this._pivotX = v
            this._updateLocalTranslate()
        }
    }

    get pivotY() {
        return this._pivotY
    }

    set pivotY(v) {
        if (this._pivotY !== v) {
            this._pivotY = v
            this._updateLocalTranslate()
        }
    }

    get pivot() {
        return this._pivotX
    }

    set pivot(v) {
        if (this._pivotX !== v || this._pivotY !== v) {
            this._pivotX = v;
            this._pivotY = v;
            this._updateLocalTranslate()
        }
    }

    get mountX() {
        return this._mountX
    }

    set mountX(v) {
        if (this._mountX !== v) {
            this._mountX = v
            this._updateLocalTranslate()
        }
    }

    get mountY() {
        return this._mountY
    }

    set mountY(v) {
        if (this._mountY !== v) {
            this._mountY = v
            this._updateLocalTranslate()
        }
    }

    get mount() {
        return this._mountX
    }

    set mount(v) {
        if (this._mountX !== v || this._mountY !== v) {
            this._mountX = v
            this._mountY = v
            this._updateLocalTranslate()
        }
    }

    get alpha() {
        return this._alpha
    }

    set alpha(v) {
        // Account for rounding errors.
        v = (v > 1 ? 1 : (v < 1e-14 ? 0 : v));
        if (this._alpha !== v) {
            let prev = this._alpha
            this._alpha = v
            this._updateLocalAlpha();
            if ((prev === 0) !== (v === 0)) this._updateActiveFlag()
        }
    }

    get rotation() {
        return this._rotation
    }

    set rotation(v) {
        if (this._rotation !== v) {
            this._rotation = v
            this._updateLocalTransform()
        }
    }

    get colorUl() {
        return this.renderer.colorUl
    }

    set colorUl(v) {
        this.renderer.colorUl = v;
    }

    get colorUr() {
        return this.renderer.colorUr
    }

    set colorUr(v) {
        this.renderer.colorUr = v;
    }

    get colorBl() {
        return this.renderer.colorBl
    }

    set colorBl(v) {
        this.renderer.colorBl = v;
    }

    get colorBr() {
        return this.renderer.colorBr
    }

    set colorBr(v) {
        this.renderer.colorBr = v;
    }

    get color() {
        return this.renderer.colorUl
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
        return this._visible
    }

    set visible(v) {
        if (this._visible !== v) {
            this._visible = v
            this._updateLocalAlpha()
            this._updateActiveFlag()
        }
    }

    get zIndex() {return this.renderer.zIndex}
    set zIndex(v) {
        let prev = this.renderer.zIndex;
        this.renderer.zIndex = v;
        if (this._active) {
            if (prev !== 0 && v === 0) {
                this.stage.zIndexUsage--
            } else if (prev === 0 && v !== 0) {
                this.stage.zIndexUsage++
            }
        }
    }

    get forceZIndexContext() {return this.renderer.forceZIndexContext}
    set forceZIndexContext(v) {
        this.renderer.forceZIndexContext = v;
    }

    get clipping() {return this.renderer.clipping}
    set clipping(v) {
        this.renderer.clipping = v;
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
        if (!this._childList) {
            this._childList = new ViewChildList(this, false)
        }
        return this._childList
    }

    get childList() {
        if (!this._exposedChildList) {
            this._exposedChildList = this._getExposedChildList()
        }
        return this._exposedChildList
    }

    _getExposedChildList() {
        return this._children
    }

    get children() {
        return this.childList.get()
    }

    set children(children) {
        this.childList.set(children)
    }

    getChildren() {
        return this.childList.get();
    }

    addChild(child) {
        return this.childList.add(child);
    }

    addChildAt(child, index) {
        return this.childList.addAt(child, index);
    }

    getChildIndex(child) {
        return this.childList.getIndex(child);
    }

    removeChild(child) {
        return this.childList.remove(child);
    }

    removeChildAt(index) {
        return this.childList.removeAt(index);
    }

    removeChildren() {
        return this.childList.clear();
    }

    add(o) {
        return this.childList.a(o);
    }

    get parent() {
        return this._parent;
    }

    get src() {
        if (this.texture && this.texture.source && this.texture.source.renderInfo && this.texture.source.renderInfo.src) {
            return this.texture.source.renderInfo.src;
        } else {
            return null;
        }
    }

    set src(v) {
        if (!v) {
            this.texture = null;
        } else if (!this.texture || !this.texture.source.renderInfo || this.texture.source.renderInfo.src !== v) {
            this.texture = this.stage.textureManager.getTexture(v);
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

    get text() {
        if (!this._viewText) {
            this._viewText = new ViewText(this);
        }

        // Give direct access to the settings.
        return this._viewText.settings;
    }

    set text(v) {
        if (!this._viewText) {
            this._viewText = new ViewText(this);
        }
        if (Utils.isString(v)) {
            this._viewText.settings.text = v;
        } else {
            this._viewText.settings.setSettings(v);
        }
    }

    set layoutEntry(f) {
        this.renderer.layoutEntry = f;
    }

    set layoutExit(f) {
        this.renderer.layoutExit = f;
    }

    
    animation(settings) {
        return this.stage.animations.createAnimation(this, settings);
    }

    transition(property, settings) {
        if (settings === undefined) {
            return this._getTransition(property);
        } else {
            this._setTransition(property, settings);
            return null;
        }
    }

    set transitions(object) {
        let keys = Object.keys(object);
        keys.forEach(property => {
            this.transition(property, object[property]);
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
        }
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

    _removeTransition(property) {
        if (this._transitions) {
            delete this._transitions[property];
        }
    }

    _getTransVal(property, v) {
        let t = this._getTransition(property);
        if (t && t.isActive()) {
            return t.targetValue;
        } else {
            return v;
        }
    }

    _setTransVal(property, v) {
        let t = this._getTransition(property);
        t.start(v);
    }

    get X() {
        return this._getTransVal('x', this.x);
    }
    
    set X(v) {
        this._setTransVal('x', v)
    }

    get Y() {
        return this._getTransVal('y', this.y);
    }

    set Y(v) {
        this._setTransVal('y', v)
    }

    get W() {
        return this._getTransVal('w', this.w);
    }

    set H(v) {
        this._setTransVal('h', v)
    }

    get SCALE() {
        return this._getTransVal('scale', this.scale);
    }

    set SCALE(v) {
        this._setTransVal('scale', v)
    }

    get SCALEX() {
        return this._getTransVal('scaleX', this.scaleX);
    }

    set SCALEX(v) {
        this._setTransVal('scaleX', v)
    }

    get PIVOT() {
        return this._getTransVal('pivot', this.pivot);
    }

    set PIVOT(v) {
        this._setTransVal('pivot', v)
    }

    get PIVOTX() {
        return this._getTransVal('pivotX', this.pivotX);
    }

    set PIVOTX(v) {
        this._setTransVal('pivotX', v)
    }
    
    get MOUNT() {
        return this._getTransVal('mount', this.mount);
    }

    set MOUNT(v) {
        this._setTransVal('mount', v)
    }

    get MOUNTX() {
        return this._getTransVal('mountX', this.mountX);
    }

    set MOUNTX(v) {
        this._setTransVal('mountX', v)
    }

    get ALPHA() {
        return this._getTransVal('alpha', this.alpha);
    }

    set ALPHA(v) {
        this._setTransVal('alpha', v)
    }

    get ROTATION() {
        return this._getTransVal('rotation', this.rotation);
    }

    set ROTATION(v) {
        this._setTransVal('rotation', v)
    }

    get COLOR() {
        return this._getTransVal('color', this.color);
    }

    set COLOR(v) {
        this._setTransVal('color', v)
    }

    set COLORTOP(v) {
        this._setTransVal('colorTop', v)
    }

    set COLORBOTTOM(v) {
        this._setTransVal('colorBottom', v)
    }

    set COLORLEFT(v) {
        this._setTransVal('colorLeft', v)
    }

    set COLORRIGHT(v) {
        this._setTransVal('colorRight', v)
    }

    get COLORUL() {
        return this._getTransVal('colorUl', this.colorUl);
    }

    set COLORUL(v) {
        this._setTransVal('colorUl', v)
    }

    get COLORUR() {
        return this._getTransVal('colorUr', this.colorUr);
    }

    set COLORUR(v) {
        this._setTransVal('colorUr', v)
    }

    get COLORBL() {
        return this._getTransVal('colorBl', this.colorBl);
    }

    set COLORBL(v) {
        this._setTransVal('colorBl', v)
    }

    get COLORBR() {
        return this._getTransVal('colorBr', this.colorBr);
    }

    set COLORBR(v) {
        this._setTransVal('colorBr', v)
    }
    

    isNumberProperty(property) {
        return View.isNumberProperty(property, this.constructor);
    }

    isColorProperty(property) {
        return View.isColorProperty(property, this.constructor);
    }

    getMerger(property) {
        return View.getMerger(property, this.constructor);
    }
}

View.isNumberProperty = function(property, type = View) {
    do {
        if (type.NUMBER_PROPERTIES && type.NUMBER_PROPERTIES.has(property)) {
            return true
        }
    } while((type !== View) && (type = Object.getPrototypeOf(type)));

    return false
}

View.isColorProperty = function(property, type = View) {
    do {
        if (type.COLOR_PROPERTIES && type.COLOR_PROPERTIES.has(property)) {
            return true
        }
    } while((type !== View) && (type = Object.getPrototypeOf(type)));

    return false
}

View.getMerger = function(property, type = View) {
    if (View.isNumberProperty(property, type)) {
        return StageUtils.mergeNumbers
    } else if (View.isColorProperty(property, type)) {
        return StageUtils.mergeColors
    } else {
        return undefined
    }
}

View.NUMBER_PROPERTIES = new Set(['x', 'y', 'w', 'h', 'scale', 'scaleX', 'scaleY', 'pivot', 'pivotX', 'pivotY', 'mount', 'mountX', 'mountY', 'alpha', 'rotation', 'texture.x', 'texture.y', 'texture.w', 'texture.h'])
View.COLOR_PROPERTIES = new Set(['color', 'colorTop', 'colorBottom', 'colorLeft', 'colorRight', 'colorUl', 'colorUr', 'colorBl', 'colorBr'])

View.prototype.isView = 1;

View.id = 1;

// Getters reused when referencing view (subobject) properties by a property path, as used in a transition or animation ('x', 'texture.x', etc).
View.PROP_GETTERS = new Map();

// Setters reused when referencing view (subobject) properties by a property path, as used in a transition or animation ('x', 'texture.x', etc).
View.PROP_SETTERS = new Map();



Base.mixinEs5(View, EventEmitter);




/**
 * Manages the list of children for a view.
 */
class ViewChildList {

    /**
     * @param view
     * @param isProxy
     *   A proxy mutates the children of another view. It is not used in core but is handy for extensions that extend
     *   the View class and wish to provide an alternative children implementation or other view collections.
     */
    constructor(view, isProxy = true) {

        this._view = view;

        /**
         * @type {View[]}
         */
        this._children = isProxy ? this._view._children._children : [];

    }

    get() {
        return this._children;
    }

    add(view) {
        if (view._parent === this && this._children.indexOf(view) >= 0) {
            return view;
        }
        this.addAt(view, this._children.length);
    };

    addAt(view, index) {
        // prevent adding self as view
        if (view === this._view) {
            return
        }

        if (index >= 0 && index <= this._children.length) {
            if (view._parent === this._view && this._children.indexOf(view) === index) {
                // Ignore.
            } else {
                if (view._parent) {
                    let p = view._parent;
                    p._children.remove(view);
                }

                view._setParent(this._view);
                this._children.splice(index, 0, view);

                // Sync.
                this._view.renderer.addChildAt(index, view.renderer);
            }

            return;
        } else {
            throw new Error(view + 'addChildAt: The index ' + index + ' supplied is out of bounds ' + this._children.length);
        }
    };

    getIndex(view) {
        return this._children.indexOf(view);
    };

    remove(view) {
        let index = this.getIndex(view);

        if (index !== -1) {
            this.removeAt(index);
        }
    };

    removeAt(index) {
        let view = this._children[index];

        view._setParent(null);
        this._children.splice(index, 1);

        // Sync.
        this._view.renderer.removeAt(index);

        return view;
    };

    clear() {
        let n = this._children.length;
        if (n) {
            for (let i = 0; i < n; i++) {
                let view = this._children[i];
                view._setParent(null);
            }
            this._children.splice(0, n);

            // Sync.
            this._view.renderer.removeChildren();
        }
    };

    a(o) {
        if (Utils.isObjectLiteral(o)) {
            let c = this._view.stage.view(o);
            this.add(c);
            return c;
        } else if (Array.isArray(o)) {
            for (let i = 0, n = o.length; i < n; i++) {
                this.a(o[i]);
            }
            return null;
        } else if (o.isView) {
            this.add(o);
            return o;
        }
    };
    
    set(views) {
        this.clear();
        for (let i = 0, n = views.length; i < n; i++) {
            let o = views[i];
            if (Utils.isObjectLiteral(o)) {
                let c = this._view.stage.view(o);
                this.add(c);
            } else if (o.isView) {
                this.add(o);
            }
        }
    }

    get length() {
        return this._children.length;
    }
}



/**
 * Graphical calculations / VBO buffer filling.
 */
class ViewRenderer {

    constructor(view) {
        this._view = view;

        this.ctx = view.stage.ctx;

        this._parent = null;

        this._hasUpdates = false;

        this._layoutEntry = null;

        this._layoutExit = null;

        this._hasLayoutHooks = 0;

        this._recalc = 128;

        this._worldAlpha = 1;

        this._updateTreeOrder = 0;

        // All local translation/transform updates: directly propagated from x/y/w/h/scale/whatever.
        this._worldPx = this._localPx = 0;
        this._worldPy = this._localPy = 0;

        this._worldTa = this._localTa = 1;
        this._worldTb = this._localTb = 0;
        this._worldTc = this._localTc = 0;
        this._worldTd = this._localTd = 1;

        this._isComplex = false;

        this._localAlpha = 1;

        this._rw = 0;
        this._rh = 0;

        this._clipping = false;
        this._clippingParent = null;

        /**
         * In case of clipping, this flag indicates if we're dealing with a square-shaped clipping area.
         * @type {boolean}
         */
        this._clippingSquare = false;

        this._clippingSquareMinX = 0;
        this._clippingSquareMaxX = 0;
        this._clippingSquareMinY = 0;
        this._clippingSquareMaxY = 0;

        /**
         * Flag that indicates that clipping area is empty.
         * @type {boolean}
         */
        this._clippingEmpty = false;

        /**
         * Flag that indicates that the clipping area are the corner points.
         * @type {boolean}
         */
        this._clippingNoEffect = false;

        /**
         * In case of complex clipping, the corner points of the clipping area.
         * @type {number[]}
         */
        this._clippingArea = null;

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

    }

    /**
     * @param {Number} type
     *   1: alpha
     *   2: translate
     *   4: transform
     *   8: clipping
     * 128: force layout when becoming visible
     * @private
     */
    _setRecalc(type) {
        this._recalc |= type;

        if (this._worldAlpha) {
            this.ctx.staticStage = false;
            let p = this;
            do {
                p._hasUpdates = true;
            } while ((p = p._parent) && !p._hasUpdates);
        } else {
            this._hasUpdates = true;
        }
    };

    _setRecalcForced(type, force) {
        this._recalc |= type;

        if (this._worldAlpha || force) {
            this.ctx.staticStage = false;
            let p = this;
            do {
                p._hasUpdates = true;
            } while ((p = p._parent) && !p._hasUpdates);
        } else {
            this._hasUpdates = true;
        }
    };

    _setHasLayoutHooks() {
        if (this._hasLayoutHooks !== 1) {
            let p = this;
            do {
                p._hasLayoutHooks = 1;
            } while ((p = p._parent) && p._hasLayoutHooks !== 1);
        }
    }

    _setHasLayoutHooksCheck() {
        if (this._hasLayoutHooks !== -1) {
            let p = this;
            do {
                p._hasLayoutHooks = -1;
            } while ((p = p._parent) && p._hasLayoutHooks === 0);
        }
    }

    setParent(parent) {
        if (parent !== this._parent) {
            let prevIsZContext = this.isZContext();
            let prevParent = this._parent;
            this._parent = parent;

            if (prevParent && prevParent._hasLayoutHooks === 1) {
                prevParent._setHasLayoutHooksCheck(); // Unknown.
            }

            if (parent) {
                if (this._hasLayoutHooks === 1) {
                    parent._setHasLayoutHooks();
                } else if (this._hasLayoutHooks === -1) {
                    parent._setHasLayoutHooksCheck();
                }
            }

            this._setRecalc(1 + 2 + 4);

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

            let newClippingParent = parent ? (parent._clipping ? parent : parent._clippingParent) : null;

            if (newClippingParent !== this._clippingParent) {
                this.setClippingParent(newClippingParent);
            }
        }
    };

    addChildAt(index, child) {
        if (!this._children) this._children = [];
        this._children.splice(index, 0, child);
        child.setParent(this);
    };

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
        this._setRecalcForced(1, (this._parent && this._parent._worldAlpha) && a);

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
    };

    setTextureCoords(ulx, uly, brx, bry) {
        if (this._worldAlpha) this.ctx.staticStage = false;

        this._ulx = ulx;
        this._uly = uly;
        this._brx = brx;
        this._bry = bry;

        this._txCoordsUl = ((ulx * 65535 + 0.5) | 0) + ((uly * 65535 + 0.5) | 0) * 65536;
        this._txCoordsUr = ((brx * 65535 + 0.5) | 0) + ((uly * 65535 + 0.5) | 0) * 65536;
        this._txCoordsBl = ((ulx * 65535 + 0.5) | 0) + ((bry * 65535 + 0.5) | 0) * 65536;
        this._txCoordsBr = ((brx * 65535 + 0.5) | 0) + ((bry * 65535 + 0.5) | 0) * 65536;
    };

    setDisplayedTextureSource(textureSource) {
        if (this._worldAlpha) this.ctx.staticStage = false;
        this._displayedTextureSource = textureSource;
    };

    setInTextureAtlas(inTextureAtlas) {
        if (this._worldAlpha) this.ctx.staticStage = false;

        this.inTextureAtlas = inTextureAtlas;
    };

    setAsRoot() {
        // Use parent dummy.
        this._parent = new ViewRenderer(this._view);

        // Root is, and will always be, the primary zContext.
        this._isRoot = true;

        this.ctx.root = this;
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
        return (this._forceZIndexContext || this._zIndex !== 0 || this._isRoot || !this._parent);
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

                if (this._zParent._zContextUsage > 0) {
                    let index = this._zParent._zIndexedChildren.indexOf(this);
                    this._zParent._zIndexedChildren.splice(index, 1);
                }
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
                        newZParent._zIndexedChildren.push(this);
                    }
                    newZParent._zSort = true;
                }
            }

            this._zParent = newZParent;
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
            if (this._worldAlpha) this.ctx.staticStage = false;

            let newZParent = this._zParent;

            let prevIsZContext = this.isZContext();
            if (zIndex === 0 && this._zIndex !== 0) {
                if (this._parent === this._zParent) {
                    this._zParent.decZContextUsage();
                } else {
                    newZParent = this._parent;
                }
            } else if (zIndex !== 0 && this._zIndex === 0) {
                newZParent = this._parent ? this._parent.findZContext() : null;
                if (newZParent === this._zParent) {
                    if (this._zParent) {
                        this._zParent.incZContextUsage();
                        this._zParent._zSort = true;
                    }
                }
            } else if (zIndex !== this._zIndex) {
                this._zParent._zSort = true;
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
        }
    };

    get forceZIndexContext() {
        return this._forceZIndexContext;
    }

    set forceZIndexContext(v) {
        if (this._worldAlpha) this.ctx.staticStage = false;

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
        if (prevZContext._zContextUsage > 0) {
            let self = this;
            // Transfer from upper z context to this z context.
            prevZContext._zIndexedChildren.slice().forEach(function (c) {
                if (self.isAncestorOf(c) && c._zIndex !== 0) {
                    c.setZParent(self);
                }
            });
        }
    };

    disableZContext() {
        // Transfer from this z context to upper z context.
        if (this._zContextUsage > 0) {
            let newZParent = this._parent.findZContext();

            this._zIndexedChildren.slice().forEach(function (c) {
                if (c._zIndex !== 0) {
                    c.setZParent(newZParent);
                }
            });
        }
    };

    get clipping() {
        return this._clipping;
    };

    set clipping(clipping) {
        if (clipping !== this._clipping) {
            this._setRecalc(8);
            this._clipping = clipping;
            this.setChildrenClippingParent(clipping ? this : this._clippingParent);
        }
    };

    setChildrenClippingParent(clippingParent) {
        if (this._children) {
            for (let i = 0, n = this._children.length; i < n; i++) {
                this._children[i].setClippingParent(clippingParent);
            }
        }
    };

    setClippingParent(clippingParent) {
        if (this._clippingParent !== clippingParent) {
            this._setRecalc(8);

            this._clippingParent = clippingParent;
            if (!this._clipping) {
                if (this._children) {
                    for (let i = 0, n = this._children.length; i < n; i++) {
                        this._children[i].setClippingParent(clippingParent);
                    }
                }
            }

        }
    };

    get colorUl() {
        return this._colorUl;
    }

    set colorUl(color) {
        if (this._colorUl !== color) {
            if (this._worldAlpha) this.ctx.staticStage = false;
            this._colorUl = color;
        }
    }

    get colorUr() {
        return this._colorUr;
    }

    set colorUr(color) {
        if (this._colorUr !== color) {
            if (this._worldAlpha) this.ctx.staticStage = false;
            this._colorUr = color;
        }
    };

    get colorBl() {
        return this._colorBl;
    }

    set colorBl(color) {
        if (this._colorBl !== color) {
            if (this._worldAlpha) this.ctx.staticStage = false;
            this._colorBl = color;
        }
    };

    get colorBr() {
        return this._colorBr;
    }

    set colorBr(color) {
        if (this._colorBr !== color) {
            if (this._worldAlpha) this.ctx.staticStage = false;
            this._colorBr = color;
        }
    };

    isVisible() {
        return (this._localAlpha > 1e-14);
    };

    layout() {
        if (this._hasLayoutHooks !== 0) {
            // Carry positioning changes downwards to ensure re-layout.
            let origRecalc = this._recalc;

            if (this.isVisible()) {
                this._recalc |= (this._parent._recalc & 6);
                let layoutChanged = (this._recalc & 6);

                if (this._layoutEntry && layoutChanged) {
                    this._layoutEntry(this._view, origRecalc);
                }
                if (this._children) {
                    if (this._hasLayoutHooks === -1) {
                        let hasLayoutHooks = false;
                        for (let i = 0, n = this._children.length; i < n; i++) {
                            this._children[i].layout();
                            hasLayoutHooks = hasLayoutHooks || (this._children[i]._hasLayoutHooks === 1);
                        }
                        this._hasLayoutHooks = hasLayoutHooks ? 1 : 0;
                    } else {
                        for (let i = 0, n = this._children.length; i < n; i++) {
                            if (this._children[i]._hasUpdates || layoutChanged) {
                                this._children[i].layout();
                            }
                        }
                    }
                }
                if (this._layoutExit && this._hasUpdates) {
                    this._layoutExit(this._view, origRecalc);
                }

                if ((this._recalc & 128)) {
                    // Clear 'force layout' flag.
                    this._recalc -= 128;
                }
            }

        }
    }

    update() {
        this._recalc |= this._parent._recalc;

        if (this._zSort) {
            // Make sure that all descendants are updated so that the updateTreeOrder flags are correctly set.
            this.ctx.updateTreeOrderForceUpdate++;
        }

        let forceUpdate = (this.ctx.updateTreeOrderForceUpdate > 0);
        if (this._recalc & 1) {
            // In case of becoming invisible, we must update the children because they may be z-indexed.
            forceUpdate = this._worldAlpha && !(this._parent._worldAlpha && this._localAlpha);

            this._worldAlpha = this._parent._worldAlpha * this._localAlpha;

            if (this._worldAlpha < 1e-14) {
                // Tiny rounding errors may cause failing visibility tests.
                this._worldAlpha = 0;
            }
        }

        if (this._worldAlpha || forceUpdate) {
            if (this._recalc & 6) {
                this._worldPx = this._parent._worldPx + this._localPx * this._parent._worldTa;
                this._worldPy = this._parent._worldPy + this._localPy * this._parent._worldTd;
            }

            if (this._recalc & 4) {
                this._worldTa = this._localTa * this._parent._worldTa;
                this._worldTb = this._localTd * this._parent._worldTb;
                this._worldTc = this._localTa * this._parent._worldTc;
                this._worldTd = this._localTd * this._parent._worldTd;

                if (this._isComplex) {
                    this._worldTa += this._localTc * this._parent._worldTb;
                    this._worldTb += this._localTb * this._parent._worldTa;
                    this._worldTc += this._localTc * this._parent._worldTd;
                    this._worldTd += this._localTb * this._parent._worldTc;
                }
            }

            if ((this._recalc & 6) && (this._parent._worldTb !== 0 || this._parent._worldTc !== 0)) {
                this._worldPx += this._localPy * this._parent._worldTb;
                this._worldPy += this._localPx * this._parent._worldTc;
            }

            if ((this._recalc & 14 /* 2 + 4 + 8 */) && (this._clippingParent || this._clipping)) {
                // We must calculate the clipping area.
                let c1x, c1y, c2x, c2y, c3x, c3y;

                let cp = this._clippingParent;
                if (cp && cp._clippingEmpty) {
                    this._clippingEmpty = true;
                    this._clippingArea = null;
                    this._clippingNoEffect = false;
                } else {
                    this._clippingNoEffect = false;
                    this._clippingEmpty = false;
                    this._clippingArea = null;
                    if (cp) {
                        if (cp._clippingSquare && (this._worldTb === 0 && this._worldTc === 0 && this._worldTa > 0 && this._worldTd > 0)) {
                            // Special case: 'easy square clipping'.
                            this._clippingSquare = true;

                            c2x = this._worldPx + this._rw * this._worldTa;
                            c2y = this._worldPy + this._rh * this._worldTd;

                            this._clippingSquareMinX = this._worldPx;
                            this._clippingSquareMaxX = c2x;
                            this._clippingSquareMinY = this._worldPy;
                            this._clippingSquareMaxY = c2y;

                            if ((this._clippingSquareMinX >= cp._clippingSquareMinX) && (this._clippingSquareMaxX <= cp._clippingSquareMaxX) && (this._clippingSquareMinY >= cp._clippingSquareMinY) && (this._clippingSquareMaxY <= cp._clippingSquareMaxY)) {
                                // No effect.
                                this._clippingNoEffect = true;

                                if (this._clipping) {
                                    this._clippingSquareMinX = this._worldPx;
                                    this._clippingSquareMaxX = c2x;
                                    this._clippingSquareMinY = this._worldPy;
                                    this._clippingSquareMaxY = c2y;
                                }
                            } else {
                                this._clippingSquareMinX = Math.max(this._clippingSquareMinX, cp._clippingSquareMinX);
                                this._clippingSquareMaxX = Math.min(this._clippingSquareMaxX, cp._clippingSquareMaxX);
                                this._clippingSquareMinY = Math.max(this._clippingSquareMinY, cp._clippingSquareMinY);
                                this._clippingSquareMaxY = Math.min(this._clippingSquareMaxY, cp._clippingSquareMaxY);
                                if (this._clippingSquareMaxX < this._clippingSquareMinX || this._clippingSquareMaxY < this._clippingSquareMinY) {
                                    this._clippingEmpty = true;
                                }
                            }
                        } else {
                            //c0x = this._worldPx;
                            //c0y = this._worldPy;
                            c1x = this._worldPx + this._rw * this._worldTa;
                            c1y = this._worldPy + this._rw * this._worldTc;
                            c2x = this._worldPx + this._rw * this._worldTa + this._rh * this._worldTb;
                            c2y = this._worldPy + this._rw * this._worldTc + this._rh * this._worldTd;
                            c3x = this._worldPx + this._rh * this._worldTb;
                            c3y = this._worldPy + this._rh * this._worldTd;

                            // Complex shape.
                            this._clippingSquare = false;
                            let cornerPoints = [this._worldPx, this._worldPy, c1x, c1y, c2x, c2y, c3x, c3y];

                            if (cp._clippingSquare && !cp._clippingArea) {
                                // We need a clipping area to use for intersection.
                                cp._clippingArea = [cp._clippingSquareMinX, cp._clippingSquareMinY, cp._clippingSquareMaxX, cp._clippingSquareMinY, cp._clippingSquareMaxX, cp._clippingSquareMaxY, cp._clippingSquareMinX, cp._clippingSquareMaxY];
                            }

                            this._clippingArea = GeometryUtils.intersectConvex(cp._clippingArea, cornerPoints);
                            this._clippingEmpty = (this._clippingArea.length === 0);
                            this._clippingNoEffect = (cornerPoints === this._clippingArea);
                        }
                    } else {
                        c1x = this._worldPx + this._rw * this._worldTa;
                        c3y = this._worldPy + this._rh * this._worldTd;

                        // Just use the corner points.
                        if (this._worldTb === 0 && this._worldTc === 0 && this._worldTa > 0 && this._worldTd > 0) {
                            // Square.
                            this._clippingSquare = true;
                            if (this._clipping) {
                                this._clippingSquareMinX = this._worldPx;
                                this._clippingSquareMaxX = c1x;
                                this._clippingSquareMinY = this._worldPy;
                                this._clippingSquareMaxY = c3y;
                            }
                            this._clippingEmpty = false;
                            this._clippingNoEffect = true;
                        } else {
                            c1y = this._worldPy + this._rw * this._worldTc;
                            c2x = this._worldPx + this._rw * this._worldTa + this._rh * this._worldTb;
                            c2y = this._worldPy + this._rw * this._worldTc + this._rh * this._worldTd;
                            c3x = this._worldPx + this._rh * this._worldTb;

                            // Complex shape.
                            this._clippingSquare = false;
                            if (this._clipping) {
                                this._clippingArea = [this._worldPx, this._worldPy, c1x, c1y, c2x, c2y, c3x, c3y];
                            }
                            this._clippingEmpty = false;
                            this._clippingNoEffect = true;
                        }
                    }
                }
            }

            if (!this.ctx.useZIndexing) {
                // Use single pass.
                if (this._displayedTextureSource) {
                    this.addToVbo();
                }
            } else {
                this._updateTreeOrder = this.ctx.updateTreeOrder++;
            }

            this._recalc = (this._recalc & 7);
            /* 1+2+4 */

            if (this._children) {
                for (let i = 0, n = this._children.length; i < n; i++) {
                    if ((this.ctx.updateTreeOrderForceUpdate > 0) || this._recalc || this._children[i]._hasUpdates) {
                        this._children[i].update();
                    } else if (!this.ctx.useZIndexing) {
                        this._children[i].fillVbo();
                    }
                }
            }

            if (this._worldAlpha === 0) {
                // Layout must be run when this view becomes visible.
                this._recalc = 128;
            } else {
                this._recalc = 0;
            }

            this._hasUpdates = false;

        }

        if (this._zSort) {
            this.ctx.updateTreeOrderForceUpdate--;
        }

    };

    sortZIndexedChildren() {
        // Insertion sort works best for almost correctly ordered arrays.
        for (let i = 1, n = this._zIndexedChildren.length; i < n; i++) {
            let a = this._zIndexedChildren[i];
            let j = i - 1;
            while (j >= 0) {
                let b = this._zIndexedChildren[j];
                if (!(a._zIndex === b._zIndex ? (a._updateTreeOrder < b._updateTreeOrder) : (a._zIndex < b._zIndex))) {
                    break;
                }

                this._zIndexedChildren[j + 1] = this._zIndexedChildren[j];
                j--;
            }

            this._zIndexedChildren[j + 1] = a;
        }
    };

    addToVbo() {
        let vboIndex = this.ctx.vboIndex;
        let vboBufferFloat = this.ctx.vboBufferFloat;
        let vboBufferUint = this.ctx.vboBufferUint;

        if (this._clippingParent && !this._clippingNoEffect) {
            if (!this._clippingEmpty) {
                this.addToVboClipped();
            }
        } else {
            if (this._worldTb !== 0 || this._worldTc !== 0) {
                if (vboIndex < 262144) {
                    vboBufferFloat[vboIndex++] = this._worldPx;
                    vboBufferFloat[vboIndex++] = this._worldPy;
                    vboBufferUint[vboIndex++] = this._txCoordsUl; // Texture.
                    vboBufferUint[vboIndex++] = getColorInt(this._colorUl, this._worldAlpha);
                    vboBufferFloat[vboIndex++] = this._worldPx + this._rw * this._worldTa;
                    vboBufferFloat[vboIndex++] = this._worldPy + this._rw * this._worldTc;
                    vboBufferUint[vboIndex++] = this._txCoordsUr;
                    vboBufferUint[vboIndex++] = getColorInt(this._colorUr, this._worldAlpha);
                    vboBufferFloat[vboIndex++] = this._worldPx + this._rw * this._worldTa + this._rh * this._worldTb;
                    vboBufferFloat[vboIndex++] = this._worldPy + this._rw * this._worldTc + this._rh * this._worldTd;
                    vboBufferUint[vboIndex++] = this._txCoordsBr;
                    vboBufferUint[vboIndex++] = getColorInt(this._colorBr, this._worldAlpha);
                    vboBufferFloat[vboIndex++] = this._worldPx + this._rh * this._worldTb;
                    vboBufferFloat[vboIndex++] = this._worldPy + this._rh * this._worldTd;
                    vboBufferUint[vboIndex++] = this._txCoordsBl;
                    vboBufferUint[vboIndex] = getColorInt(this._colorBl, this._worldAlpha);
                    this.ctx.addVboTextureSource(this._displayedTextureSource, 1);
                }
            } else {
                // Simple.
                let cx = this._worldPx + this._rw * this._worldTa;
                let cy = this._worldPy + this._rh * this._worldTd;

                if (vboIndex < 262144) {
                    vboBufferFloat[vboIndex++] = this._worldPx;
                    vboBufferFloat[vboIndex++] = this._worldPy;
                    vboBufferUint[vboIndex++] = this._txCoordsUl; // Texture.
                    vboBufferUint[vboIndex++] = getColorInt(this._colorUl, this._worldAlpha);
                    vboBufferFloat[vboIndex++] = cx;
                    vboBufferFloat[vboIndex++] = this._worldPy;
                    vboBufferUint[vboIndex++] = this._txCoordsUr;
                    vboBufferUint[vboIndex++] = getColorInt(this._colorUr, this._worldAlpha);
                    vboBufferFloat[vboIndex++] = cx;
                    vboBufferFloat[vboIndex++] = cy;
                    vboBufferUint[vboIndex++] = this._txCoordsBr;
                    vboBufferUint[vboIndex++] = getColorInt(this._colorBr, this._worldAlpha);
                    vboBufferFloat[vboIndex++] = this._worldPx;
                    vboBufferFloat[vboIndex++] = cy;
                    vboBufferUint[vboIndex++] = this._txCoordsBl;
                    vboBufferUint[vboIndex] = getColorInt(this._colorBl, this._worldAlpha);
                    this.ctx.addVboTextureSource(this._displayedTextureSource, 1);
                }
            }
        }
    };

    addToVboClipped() {
        let vboIndex = this.ctx.vboIndex;
        let vboBufferFloat = this.ctx.vboBufferFloat;
        let vboBufferUint = this.ctx.vboBufferUint;

        // Gradients are not supported for clipped quads.
        let c = getColorInt(this._colorUl, this._worldAlpha);

        if (this._clippingSquare) {
            // Inverse matrix.
            let ux = this._rw * this._worldTa;
            let vy = this._rh * this._worldTd;

            let d = 1 / (ux * vy);
            let invTa = vy * d;
            let invTd = ux * d;

            // Get ranges from 0 to 1.
            let tx1 = invTa * (this._clippingSquareMinX - this._worldPx);
            let ty1 = invTd * (this._clippingSquareMinY - this._worldPy);
            let tx3 = invTa * (this._clippingSquareMaxX - this._worldPx);
            let ty3 = invTd * (this._clippingSquareMaxY - this._worldPy);

            // Calculate texture coordinates for clipped corner points.
            let tcx1 = this._ulx * (1 - tx1) + this._brx * tx1;
            let tcy1 = this._uly * (1 - ty1) + this._bry * ty1;
            let tcx3 = this._ulx * (1 - tx3) + this._brx * tx3;
            let tcy3 = this._uly * (1 - ty3) + this._bry * ty3;

            if (vboIndex < 262144) {
                vboBufferFloat[vboIndex++] = this._clippingSquareMinX;
                vboBufferFloat[vboIndex++] = this._clippingSquareMinY;
                vboBufferUint[vboIndex++] = getVboTextureCoords(tcx1, tcy1);
                vboBufferUint[vboIndex++] = c;
                vboBufferFloat[vboIndex++] = this._clippingSquareMaxX;
                vboBufferFloat[vboIndex++] = this._clippingSquareMinY;
                vboBufferUint[vboIndex++] = getVboTextureCoords(tcx3, tcy1);
                vboBufferUint[vboIndex++] = c;
                vboBufferFloat[vboIndex++] = this._clippingSquareMaxX;
                vboBufferFloat[vboIndex++] = this._clippingSquareMaxY;
                vboBufferUint[vboIndex++] = getVboTextureCoords(tcx3, tcy3);
                vboBufferUint[vboIndex++] = c;
                vboBufferFloat[vboIndex++] = this._clippingSquareMinX;
                vboBufferFloat[vboIndex++] = this._clippingSquareMaxY;
                vboBufferUint[vboIndex++] = getVboTextureCoords(tcx1, tcy3);
                vboBufferUint[vboIndex] = c;
                this.ctx.addVboTextureSource(this._displayedTextureSource, 1);
            }
        } else {
            // Complex clipping.

            // Inverse matrix.
            let ux = this._rw * this._worldTa;
            let uy = this._rw * this._worldTc;
            let vx = this._rh * this._worldTb;
            let vy = this._rh * this._worldTd;

            let d = 1 / (ux * vy - vx * uy);
            let invTa = vy * d;
            let invTb = -vx * d;
            let invTc = -uy * d;
            let invTd = ux * d;

            let n = Math.ceil(((this._clippingArea.length / 2) - 2) / 2);

            if (n === 1) {
                // Texture coordinates.
                let tx1 = invTa * (this._clippingArea[0] - this._worldPx) + invTb * (this._clippingArea[1] - this._worldPy);
                let ty1 = invTc * (this._clippingArea[0] - this._worldPx) + invTd * (this._clippingArea[1] - this._worldPy);
                let tx2 = invTa * (this._clippingArea[2] - this._worldPx) + invTb * (this._clippingArea[3] - this._worldPy);
                let ty2 = invTc * (this._clippingArea[2] - this._worldPx) + invTd * (this._clippingArea[3] - this._worldPy);
                let tx3 = invTa * (this._clippingArea[4] - this._worldPx) + invTb * (this._clippingArea[5] - this._worldPy);
                let ty3 = invTc * (this._clippingArea[4] - this._worldPx) + invTd * (this._clippingArea[5] - this._worldPy);

                // Check for polygon instead of quad.
                let g = this._clippingArea.length <= 6 ? 4 : 6;
                let tx4 = invTa * (this._clippingArea[g] - this._worldPx) + invTb * (this._clippingArea[g + 1] - this._worldPy);
                let ty4 = invTc * (this._clippingArea[g] - this._worldPx) + invTd * (this._clippingArea[g + 1] - this._worldPy);

                if (vboIndex < 262144) {
                    vboBufferFloat[vboIndex++] = this._clippingArea[0];
                    vboBufferFloat[vboIndex++] = this._clippingArea[1];
                    vboBufferUint[vboIndex++] = getVboTextureCoords(this._ulx * (1 - tx1) + this._brx * tx1, this._uly * (1 - ty1) + this._bry * ty1);
                    vboBufferUint[vboIndex++] = c;
                    vboBufferFloat[vboIndex++] = this._clippingArea[2];
                    vboBufferFloat[vboIndex++] = this._clippingArea[3];
                    vboBufferUint[vboIndex++] = getVboTextureCoords(this._ulx * (1 - tx2) + this._brx * tx2, this._uly * (1 - ty2) + this._bry * ty2);
                    vboBufferUint[vboIndex++] = c;
                    vboBufferFloat[vboIndex++] = this._clippingArea[4];
                    vboBufferFloat[vboIndex++] = this._clippingArea[5];
                    vboBufferUint[vboIndex++] = getVboTextureCoords(this._ulx * (1 - tx3) + this._brx * tx3, this._uly * (1 - ty3) + this._bry * ty3);
                    vboBufferUint[vboIndex++] = c;
                    vboBufferFloat[vboIndex++] = this._clippingArea[g];
                    vboBufferFloat[vboIndex++] = this._clippingArea[g + 1];
                    vboBufferUint[vboIndex++] = getVboTextureCoords(this._ulx * (1 - tx4) + this._brx * tx4, this._uly * (1 - ty4) + this._bry * ty4);
                    vboBufferUint[vboIndex] = c;
                    this.ctx.addVboTextureSource(this._displayedTextureSource, 1);
                }
            } else {
                // Multiple quads.
                let g;
                for (let i = 0; i < n; i++) {
                    let b = i * 4 + 2;
                    g = b + 4;
                    if (g >= this._clippingArea.length) {
                        // Roll-over: convert polygon to quad.
                        g -= 2;
                    }

                    // Texture coordinates.
                    let tx1 = invTa * (this._clippingArea[0] - this._worldPx) + invTb * (this._clippingArea[1] - this._worldPy);
                    let ty1 = invTc * (this._clippingArea[0] - this._worldPx) + invTd * (this._clippingArea[1] - this._worldPy);
                    let tx2 = invTa * (this._clippingArea[b] - this._worldPx) + invTb * (this._clippingArea[b + 1] - this._worldPy);
                    let ty2 = invTc * (this._clippingArea[b] - this._worldPx) + invTd * (this._clippingArea[b + 1] - this._worldPy);
                    let tx3 = invTa * (this._clippingArea[b + 2] - this._worldPx) + invTb * (this._clippingArea[b + 3] - this._worldPy);
                    let ty3 = invTc * (this._clippingArea[b + 2] - this._worldPx) + invTd * (this._clippingArea[b + 3] - this._worldPy);
                    let tx4 = invTa * (this._clippingArea[g] - this._worldPx) + invTb * (this._clippingArea[g + 1] - this._worldPy);
                    let ty4 = invTc * (this._clippingArea[g] - this._worldPx) + invTd * (this._clippingArea[g + 1] - this._worldPy);

                    if (vboIndex < 262144) {
                        vboBufferFloat[vboIndex++] = this._clippingArea[0];
                        vboBufferFloat[vboIndex++] = this._clippingArea[1];
                        vboBufferUint[vboIndex++] = getVboTextureCoords(this._ulx * (1 - tx1) + this._brx * tx1, this._uly * (1 - ty1) + this._bry * ty1);
                        vboBufferUint[vboIndex++] = c;
                        vboBufferFloat[vboIndex++] = this._clippingArea[b];
                        vboBufferFloat[vboIndex++] = this._clippingArea[b + 1];
                        vboBufferUint[vboIndex++] = getVboTextureCoords(this._ulx * (1 - tx2) + this._brx * tx2, this._uly * (1 - ty2) + this._bry * ty2);
                        vboBufferUint[vboIndex++] = c;
                        vboBufferFloat[vboIndex++] = this._clippingArea[b + 2];
                        vboBufferFloat[vboIndex++] = this._clippingArea[b + 3];
                        vboBufferUint[vboIndex++] = getVboTextureCoords(this._ulx * (1 - tx3) + this._brx * tx3, this._uly * (1 - ty3) + this._bry * ty3);
                        vboBufferUint[vboIndex++] = c;
                        vboBufferFloat[vboIndex++] = this._clippingArea[g];
                        vboBufferFloat[vboIndex++] = this._clippingArea[g + 1];
                        vboBufferUint[vboIndex++] = getVboTextureCoords(this._ulx * (1 - tx4) + this._brx * tx4, this._uly * (1 - ty4) + this._bry * ty4);
                        vboBufferUint[vboIndex++] = c;
                        this.ctx.addVboTextureSource(this._displayedTextureSource, 1);
                    }
                }
            }
        }
    };

    fillVbo() {
        if (this._zSort) {
            this.sortZIndexedChildren();
            this._zSort = false;
        }

        if (this._worldAlpha) {
            if (this._displayedTextureSource) {
                this.addToVbo();
            }

            if (this._children) {
                if (this._zContextUsage) {
                    for (let i = 0, n = this._zIndexedChildren.length; i < n; i++) {
                        this._zIndexedChildren[i].fillVbo();
                    }
                } else {
                    for (let i = 0, n = this._children.length; i < n; i++) {
                        if (this._children[i]._zIndex === 0) {
                            // If zIndex is set, this item already belongs to a zIndexedChildren array in one of the ancestors.
                            this._children[i].fillVbo();
                        }
                    }
                }
            }
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

    getCornerPoints() {
        return [
            this._worldPx,
            this._worldPy,
            this._worldPx + this._rw * this._worldTa,
            this._worldPy + this._rw * this._worldTc,
            this._worldPx + this._rw * this._worldTa + this._rh * this._worldTb,
            this._worldPy + this._rw * this._worldTc + this._rh * this._worldTd,
            this._worldPx + this._rh * this._worldTb,
            this._worldPy + this._rh * this._worldTd
        ];
    };

    set layoutEntry(f) {
        this._layoutEntry = f;

        if (f) {
            this._setHasLayoutHooks();
        } else if (this._hasLayoutHooks === 1 && !this._layoutExit) {
            this._setHasLayoutHooksCheck();
        }
    }

    set layoutExit(f) {
        this._layoutExit = f;

        if (f) {
            this._setHasLayoutHooks();
        } else if (this._hasLayoutHooks === 1 && !this._layoutEntry) {
            this._setHasLayoutHooksCheck();
        }
    }

}

let getColorInt = function (c, alpha) {
    let a = ((c / 16777216 | 0) * alpha) | 0;
    return (((((c >> 16) & 0xff) * a) >> 8) & 0xff) +
        ((((c & 0xff00) * a) >> 8) & 0xff00) +
        (((((c & 0xff) << 16) * a) >> 8) & 0xff0000) +
        (a << 24);
};

let getVboTextureCoords = function (x, y) {
    return ((x * 65535 + 0.5) | 0) + ((y * 65535 + 0.5) | 0) * 65536;
};


/**
 * Copyright Metrological, 2017
 */
class VboContext {

    constructor(stage) {
        this.stage = stage;

        this.vboGlTextures = [];
        this.vboGlTextureRepeats = [];
        this.lastVboGlTexture = null;

        this.vboParamsBuffer = new ArrayBuffer(16 * 4 * 16384 * 2);
        this.vboBufferFloat = new Float32Array(this.vboParamsBuffer);
        this.vboBufferUint = new Uint32Array(this.vboParamsBuffer);
        this.vboIndex = 0;

        this.n = 0;

        this.updateTreeOrder = 0;
        this.updateTreeOrderForceUpdate = 0;

        this.staticStage = false;

        this.useZIndexing = false;
    }

    reset() {
        this.vboIndex = 0;
        this.vboGlTextures = [];
        this.vboGlTextureRepeats = [];
        this.textureAtlasGlTexture = this.stage.textureAtlas ? this.stage.textureAtlas.texture : null;
        this.rectangleTextureSource = this.stage.rectangleTexture.source;
        this.lastVboGlTexture = null;
        this.n = 0;
        this.updateTreeOrder = 0;
    }

    layout() {
        this.root.layout();
    }

    updateAndFillVbo() {
        this.useZIndexing = (this.stage.zIndexUsage > 0);

        this.reset();

        this.root.update();

        if (this.useZIndexing) {
            // A secondary fill pass is required.
            this.root.fillVbo();
        }

        if (this.stage.textureAtlas && this.stage.options.debugTextureAtlas) {
            let size = Math.min(this.stage.options.w, this.stage.options.h);
            let vboIndex = this.vboIndex;
            this.vboBufferFloat[vboIndex++] = 0;
            this.vboBufferFloat[vboIndex++] = 0;
            this.vboBufferUint[vboIndex++] = 0x00000000;
            this.vboBufferUint[vboIndex++] = 0xFFFFFFFF;
            this.vboBufferFloat[vboIndex++] = size;
            this.vboBufferFloat[vboIndex++] = 0;
            this.vboBufferUint[vboIndex++] = 0x0000FFFF;
            this.vboBufferUint[vboIndex++] = 0xFFFFFFFF;
            this.vboBufferFloat[vboIndex++] = size;
            this.vboBufferFloat[vboIndex++] = size;
            this.vboBufferUint[vboIndex++] = 0xFFFFFFFF;
            this.vboBufferUint[vboIndex++] = 0xFFFFFFFF;
            this.vboBufferFloat[vboIndex++] = 0;
            this.vboBufferFloat[vboIndex++] = size;
            this.vboBufferUint[vboIndex++] = 0xFFFF0000;
            this.vboBufferUint[vboIndex] = 0xFFFFFFFF;
            this.vboGlTextures.push(this.textureAtlasGlTexture);
            this.vboGlTextureRepeats.push(1);
            this.vboIndex += 16;

        }

        this.staticStage = true;
    }

    addVboTextureSource(textureSource, repeat) {
        let glTexture = textureSource.inTextureAtlas ? this.textureAtlasGlTexture : textureSource.glTexture;
        if (this.lastVboGlTexture !== glTexture) {
            this.vboGlTextures.push(glTexture);
            this.vboGlTextureRepeats.push(repeat);
            this.n++;
            this.lastVboGlTexture = glTexture;
        } else {
            this.vboGlTextureRepeats[this.n - 1] += repeat;
        }

        this.vboIndex += repeat * 16;
    }

}



/**
 * Copyright Metrological, 2017
 */


class ViewText extends Base {

    constructor(view) {
        super();

        this.view = view;

        this.settings = new TextRendererSettings();
        this.settings.on('change', () => {
            this.updateTexture();
        });
    }

    _properties() {
        this.updatingTexture = null;
    }

    updateTexture() {
        if (this.settings.text == "") {
            // Clear current displayed texture (when changing text back to empty).
            this.view.texture = null;
            return;
        }

        if (this.updatingTexture) return;

        this.updatingTexture = true;

        // Create a dummy texture that loads the actual texture.
        this.view.texture = this.view.stage.texture((cb, ts, sync) => {
            // Create 'real' texture and set it.
            this.updatingTexture = false;

            // Ignore this texture source load.
            cb(null, null);

            // Replace with the newly generated texture source.
            let settings = this.getFinalizedSettings();
            let source = this.createTextureSource(settings);

            // Inherit texture precision from text settings.
            this.view.texture.precision = settings.precision;

            // Make sure that the new texture source is loaded.
            source.load(sync || settings.sync);

            this.view.texture.replaceTextureSource(source);
        });
    };

    getFinalizedSettings() {
        let settings = this.settings.clone();
        settings.finalize(this.view);
        return settings;
    };

    createTextureSource(settings) {
        let m = this.view.stage.textureManager;

        let loadCb = function(cb, ts, sync) {
            m.loadTextTexture(settings, ts, sync, cb);
        };

        return this.view.stage.textureManager.getTextureSource(loadCb, settings.getTextureId());
    };

}


/**
 * Copyright Metrological, 2017
 */
class TextRenderer {

    constructor(canvas, settings) {
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
        this._context.font = this._settings.fontStyle + " " + (this._settings.fontSize * precision) + "px " + fonts;
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
                let al = this.wrapText(usedLines[usedLines.length - 1] + this._settings.maxLinesSuffix, wordWrapWidth);
                usedLines[usedLines.length - 1] = al.l[0];
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

            // Get corrected precision so that text
            this._canvas.width = Math.ceil(width * precision);
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



/**
 * Copyright Metrological, 2017
 */
class TextRendererSettings extends Base {
    constructor() {
        super();

        EventEmitter.call(this);
    }

    _properties() {
        this._text = "";
        this._w = 0;
        this._h = 0;
        this._fontStyle = "normal";
        this._fontSize = 40;
        this._fontFace = null;
        this._wordWrap = true;
        this._wordWrapWidth = 0;
        this._lineHeight = null;
        this._textBaseline = "alphabetic";
        this._textAlign = "left";
        this._offsetY = null;
        this._maxLines = 0;
        this._maxLinesSuffix = "..";
        this._precision = null;
        this._textColor = 0xFFFFFFFF;
        this._paddingLeft = 0;
        this._paddingRight = 0;
        this._shadow = false;
        this._shadowColor = 0xFF000000;
        this._shadowOffsetX = 0;
        this._shadowOffsetY = 0;
        this._shadowBlur = 5;
        this._highlight = false;
        this._highlightHeight = 0;
        this._highlightColor = 0xFF000000;
        this._highlightOffset = 0;
        this._highlightPaddingLeft = 0;
        this._highlightPaddingRight = 0;
        this._cutSx = 0;
        this._cutEx = 0;
        this._cutSy = 0;
        this._cutEy = 0;

        this.sync = false;
    }

    /**
     * Finalize this settings object so that it is no longer dependent on possibly changing defaults.
     */
    finalize(view) {
        // Inherit width and height from component.
        if (!this.w && view.w) {
            this.w = view.w;
        }

        if (!this.h && view.h) {
            this.h = view.h;
        }

        if (this.fontFace === null) {
            this.fontFace = view.stage.options.defaultFontFace;
        }

        if (this.precision === null) {
            this.precision = view.stage.options.defaultPrecision;
        }
    };

    getTextureId() {
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
        if (this.precision !== null) parts.push("pc" + this.precision);
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

        if (this.sync) parts.push("sync");

        let id = "TX$" + parts.join("|") + ":" + this.text;
        return id;
    }

    getNonDefaults() {
        var nonDefaults = {};

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
        if (this.precision !== null) nonDefaults["precision"] = this.precision;
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
        if (this.highlightOffset !== null) nonDefaults["highlightOffset"] = this.highlightOffset;
        if (this.highlightPaddingLeft !== null) nonDefaults["highlightPaddingLeft"] = this.highlightPaddingLeft;
        if (this.highlightPaddingRight !== null) nonDefaults["highlightPaddingRight"] = this.highlightPaddingRight;

        if (this.cutSx) nonDefaults["cutSx"] = this.cutSx;
        if (this.cutEx) nonDefaults["cutEx"] = this.cutEx;
        if (this.cutSy) nonDefaults["cutSy"] = this.cutSy;
        if (this.cutEy) nonDefaults["cutEy"] = this.cutEy;

        if (this.sync) nonDefaults["sync"] = this.sync;

        return nonDefaults;
    }

    clone() {
        let obj = new TextRendererSettings();
        obj._text = this._text;
        obj._w = this._w;
        obj._h = this._h;
        obj._fontStyle = this._fontStyle;
        obj._fontSize = this._fontSize;
        obj._fontFace = this._fontFace;
        obj._wordWrap = this._wordWrap;
        obj._wordWrapWidth = this._wordWrapWidth;
        obj._lineHeight = this._lineHeight;
        obj._textBaseline = this._textBaseline;
        obj._textAlign = this._textAlign;
        obj._offsetY = this._offsetY;
        obj._maxLines = this._maxLines;
        obj._maxLinesSuffix = this._maxLinesSuffix;
        obj._precision = this._precision;
        obj._textColor = this._textColor;
        obj._paddingLeft = this._paddingLeft;
        obj._paddingRight = this._paddingRight;
        obj._shadow = this._shadow;
        obj._shadowColor = this._shadowColor;
        obj._shadowOffsetX = this._shadowOffsetX;
        obj._shadowOffsetY = this._shadowOffsetY;
        obj._shadowBlur = this._shadowBlur;
        obj._highlight = this._highlight;
        obj._highlightHeight = this._highlightHeight;
        obj._highlightColor = this._highlightColor;
        obj._highlightOffset = this._highlightOffset;
        obj._highlightPaddingLeft = this._highlightPaddingLeft;
        obj._highlightPaddingRight = this._highlightPaddingRight;
        obj._cutSx = this._cutSx;
        obj._cutEx = this._cutEx;
        obj._cutSy = this._cutSy;
        obj._cutEy = this._cutEy;
        obj.sync = this.sync;
        return obj;
    }

    get text() {
        return this._text
    }

    set text(v) {
        if (this._text !== v) {
            this._text = v;
            this.emit('change');
        }
    }

    get w() {
        return this._w
    }

    set w(v) {
        if (this._w !== v) {
            this._w = v;
            this.emit('change');
        }
    }

    get h() {
        return this._h
    }

    set h(v) {
        if (this._h !== v) {
            this._h = v;
            this.emit('change');
        }
    }

    get fontStyle() {
        return this._fontStyle
    }

    set fontStyle(v) {
        if (this._fontStyle !== v) {
            this._fontStyle = v;
            this.emit('change');
        }
    }

    get fontSize() {
        return this._fontSize
    }

    set fontSize(v) {
        if (this._fontSize !== v) {
            this._fontSize = v;
            this.emit('change');
        }
    }

    get fontFace() {
        return this._fontFace
    }

    set fontFace(v) {
        if (this._fontFace !== v) {
            this._fontFace = v;
            this.emit('change');
        }
    }

    get wordWrap() {
        return this._wordWrap
    }

    set wordWrap(v) {
        if (this._wordWrap !== v) {
            this._wordWrap = v;
            this.emit('change');
        }
    }

    get wordWrapWidth() {
        return this._wordWrapWidth
    }

    set wordWrapWidth(v) {
        if (this._wordWrapWidth !== v) {
            this._wordWrapWidth = v;
            this.emit('change');
        }
    }

    get lineHeight() {
        return this._lineHeight
    }

    set lineHeight(v) {
        if (this._lineHeight !== v) {
            this._lineHeight = v;
            this.emit('change');
        }
    }

    get textBaseline() {
        return this._textBaseline
    }

    set textBaseline(v) {
        if (this._textBaseline !== v) {
            this._textBaseline = v;
            this.emit('change');
        }
    }

    get textAlign() {
        return this._textAlign
    }

    set textAlign(v) {
        if (this._textAlign !== v) {
            this._textAlign = v;
            this.emit('change');
        }
    }

    get offsetY() {
        return this._offsetY
    }

    set offsetY(v) {
        if (this._offsetY !== v) {
            this._offsetY = v;
            this.emit('change');
        }
    }

    get maxLines() {
        return this._maxLines
    }

    set maxLines(v) {
        if (this._maxLines !== v) {
            this._maxLines = v;
            this.emit('change');
        }
    }

    get maxLinesSuffix() {
        return this._maxLinesSuffix
    }

    set maxLinesSuffix(v) {
        if (this._maxLinesSuffix !== v) {
            this._maxLinesSuffix = v;
            this.emit('change');
        }
    }

    get precision() {
        return this._precision
    }

    set precision(v) {
        if (this._precision !== v) {
            this._precision = v;
            this.emit('change');
        }
    }

    get textColor() {
        return this._textColor
    }

    set textColor(v) {
        if (this._textColor !== v) {
            this._textColor = v;
            this.emit('change');
        }
    }

    get paddingLeft() {
        return this._paddingLeft
    }

    set paddingLeft(v) {
        if (this._paddingLeft !== v) {
            this._paddingLeft = v;
            this.emit('change');
        }
    }

    get paddingRight() {
        return this._paddingRight
    }

    set paddingRight(v) {
        if (this._paddingRight !== v) {
            this._paddingRight = v;
            this.emit('change');
        }
    }

    get shadow() {
        return this._shadow
    }

    set shadow(v) {
        if (this._shadow !== v) {
            this._shadow = v;
            this.emit('change');
        }
    }

    get shadowColor() {
        return this._shadowColor
    }

    set shadowColor(v) {
        if (this._shadowColor !== v) {
            this._shadowColor = v;
            this.emit('change');
        }
    }

    get shadowOffsetX() {
        return this._shadowOffsetX
    }

    set shadowOffsetX(v) {
        if (this._shadowOffsetX !== v) {
            this._shadowOffsetX = v;
            this.emit('change');
        }
    }

    get shadowOffsetY() {
        return this._shadowOffsetY
    }

    set shadowOffsetY(v) {
        if (this._shadowOffsetY !== v) {
            this._shadowOffsetY = v;
            this.emit('change');
        }
    }

    get shadowBlur() {
        return this._shadowBlur
    }

    set shadowBlur(v) {
        if (this._shadowBlur !== v) {
            this._shadowBlur = v;
            this.emit('change');
        }
    }

    get highlight() {
        return this._highlight
    }

    set highlight(v) {
        if (this._highlight !== v) {
            this._highlight = v;
            this.emit('change');
        }
    }

    get highlightHeight() {
        return this._highlightHeight
    }

    set highlightHeight(v) {
        if (this._highlightHeight !== v) {
            this._highlightHeight = v;
            this.emit('change');
        }
    }

    get highlightColor() {
        return this._highlightColor
    }

    set highlightColor(v) {
        if (this._highlightColor !== v) {
            this._highlightColor = v;
            this.emit('change');
        }
    }

    get highlightOffset() {
        return this._highlightOffset
    }

    set highlightOffset(v) {
        if (this._highlightOffset !== v) {
            this._highlightOffset = v;
            this.emit('change');
        }
    }

    get highlightPaddingLeft() {
        return this._highlightPaddingLeft
    }

    set highlightPaddingLeft(v) {
        if (this._highlightPaddingLeft !== v) {
            this._highlightPaddingLeft = v;
            this.emit('change');
        }
    }

    get highlightPaddingRight() {
        return this._highlightPaddingRight
    }

    set highlightPaddingRight(v) {
        if (this._highlightPaddingRight !== v) {
            this._highlightPaddingRight = v;
            this.emit('change');
        }
    }

    get cutSx() {
        return this._cutSx
    }

    set cutSx(v) {
        if (this._cutSx !== v) {
            this._cutSx = v;
            this.emit('change');
        }
    }

    get cutEx() {
        return this._cutEx
    }

    set cutEx(v) {
        if (this._cutEx !== v) {
            this._cutEx = v;
            this.emit('change');
        }
    }

    get cutSy() {
        return this._cutSy
    }

    set cutSy(v) {
        if (this._cutSy !== v) {
            this._cutSy = v;
            this.emit('change');
        }
    }

    get cutEy() {
        return this._cutEy
    }

    set cutEy(v) {
        if (this._cutEy !== v) {
            this._cutEy = v;
            this.emit('change');
        }
    }
}



Base.mixinEs5(TextRendererSettings, EventEmitter);


/**
 * Copyright Metrological, 2017
 */
class TransitionManager {

    constructor(stage) {
        this.stage = stage;

        this.stage.on('frameStart', () => this.progress());

        /**
         * All transitions that are running and have
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
                if (a.isActive()) {
                    a.progress(dt);
                } else {
                    filter = true;
                }
            });

            if (filter) {
                this.active = new Set([...this.active].filter(t => (t.isActive())));
            }
        }
    }

    createSettings(settings) {
        let transitionSettings = new TransitionSettings();
        Base.setObjectSettings(transitionSettings, settings);
        return transitionSettings;
    }

    addActive(transition) {
        this.active.add(transition);
    }
}



/**
 * Copyright Metrological, 2017
 */

class TransitionSettings extends Base {
    constructor() {
        super();
    }

    _properties() {
        this._timingFunction = 'ease';
        this._timingFunctionImpl = StageUtils.getTimingFunction(this._timingFunction);
        this.delay = 0;
        this.duration = 0.2;
        this.isTransitionSettings = true;
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
}



/**
 * Copyright Metrological, 2017
 */

class Transition extends Base {

    constructor(manager, settings, view, property) {
        super();

        EventEmitter.call(this);
        
        this.manager = manager;

        this._settings = settings;

        if (!View) {
            View = require('../core/View');
        }
        this._view = view
        this._getter = View.getGetter(property)
        this._setter = View.getSetter(property)


        this._merger = this._view.getMerger(property)

        if (!this._merger) {
            throw new Error("Property must be a number or a color");
        }

        this._startValue = this._getter(this._view);
        this._targetValue = this._startValue;

        this._p = 1;
        this._delayLeft = 0;
    }

    _properties() {
        this.isTransition = true;
    }

    stop() {
        if (this.isActive()) {
            this._setter(this.targetValue);
            this._p = 1;
        }
    }

    reset(targetValue, p) {
        this._startValue = this._getter(this._view);
        this._targetValue = targetValue;
        this._p = p;

        if (p < 1) {
            this.checkActive();
        } else if (p === 1) {
            this._setter(targetValue);

            // Immediately invoke onFinish event.
            this.invokeListeners();
        }
    }

    start(targetValue) {
        this._startValue = this._getter(this._view);

        if (targetValue === this._startValue) {
            this.reset(this._startValue, targetValue, 1);
        } else {
            this._targetValue = targetValue;
            this._p = 0;
            this._delayLeft = this._settings.delay;
            if (this._eventsCount) this.emit('start');
            this.checkActive();
        }
    }

    finish() {
        if (this._p < 1) {
            this._p = 1;

            this._setter(this._view, this.targetValue);

            if (this._eventsCount) {
                this.invokeListeners();
            }
        }
    }

    checkActive() {
        if (this.isActive()) {
            this.manager.addActive(this);
        }
    }

    isActive() {
        return (this._p < 1.0) && this._view.isAttached();
    }

    progress(dt) {
        if (this.p < 1) {
            if (this.delayLeft > 0) {
                this._delayLeft -= dt;

                if (this.delayLeft < 0) {
                    dt = -this.delayLeft;
                    this._delayLeft = 0;

                    if (this._eventsCount) this.emit('delayEnd');
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
                // Finished!
                this._p = 1;
            }
        }

        this._setter(this._view, this.getDrawValue());

        if (this._eventsCount) {
            this.invokeListeners();
        }
    }

    invokeListeners() {
        this.emit('progress', this.p);
        if (this.p === 1) {
            this.emit('finish');
        }
    }

    setValuesDynamic(targetValue) {
        let t = this._settings.timingFunctionImpl(this.p);
        if (t === 1) {
            this._targetValue = targetValue;
        } else if (t === 0) {
            this._startValue = this._targetValue;
            this._targetValue = targetValue;
        } else {
            this._startValue = targetValue - ((targetValue - this._targetValue) / (1 - v));
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



Base.mixinEs5(Transition, EventEmitter);




/**
 * Copyright Metrological, 2017
 */
class AnimationManager {

    constructor(stage) {
        this.stage = stage;

        this.stage.on('frameStart', () => this.progress());

        /**
         * All transitions that are running and have
         * @type {Set<Transition>}
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
        let animationSettings = new AnimationSettings();
        Base.setObjectSettings(animationSettings, settings);
        return animationSettings;
    }

    addActive(transition) {
        this.active.add(transition);
    }
}



/**
 * Copyright Metrological, 2017
 */

class AnimationSettings extends Base {
    constructor() {
        super();

        /**
         * @type {AnimationActionSettings[]}
         * @private
         */
        this._actions = [];
    }

    _properties() {
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
            let e = v[i];
            if (!e.isAnimationActionSettings) {
                let aas = new AnimationActionSettings(this);
                aas.setSettings(e);
                this._actions.push(aas);
            } else {
                this._actions.push(e);
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
            action.apply(view, p, factor);
        });
    }

    /**
     * Resets the animation to the reset values.
     * @param {View} view
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

}

AnimationSettings.STOP_METHODS = {
    FADE: 'fade',
    REVERSE: 'reverse',
    FORWARD: 'forward',
    IMMEDIATE: 'immediate',
    ONETOTWO: 'onetotwo'
};



/**
 * Copyright Metrological, 2017
 */

class AnimationActionSettings extends Base {

    constructor() {
        super();

        /**
         * The tags to which this transformation applies.
         * @type {string[]}
         */
        this._tags = null;

        /**
         * The value items, ordered by progress offset.
         * @type {AnimationActionItems}
         * @private
         */
        this._items = new AnimationActionItems(this);

        /**
         * The affected properties (paths).
         * @private
         */
        this._props = [];

        /**
         * Property setters, indexed according to props.
         * @private
         */
        this._propSetters = [];

        /**
         * The way that values should be interpolated.
         * @type {Function}
         * @private
         */
        this._merger = undefined;
    }

    _properties() {
        this._resetValue = undefined;
        this._hasResetValue = false;

        this.isAnimationActionSettings = true;
    }

    getResetValue() {
        if (this._hasResetValue) {
            return this._resetValue;
        } else {
            return this._items.getValue(0);
        }
        return 0;
    }

    apply(view, p, factor) {
        let views = this.getAnimatedViews(view);

        let v = this._items.getValue(p);

        if (v === undefined || !views.length) {
            return;
        }

        if (factor !== 1) {
            // Stop factor.
            let sv = this.getResetValue();
            if (this._merger) {
                v = this._merger(v, sv, factor);
            }
        }

        // Apply transformation to all components.
        let n = this._propSetters.length;

        let m = views.length;
        for (let j = 0; j < m; j++) {
            for (let i = 0; i < n; i++) {
                this._propSetters[i](views[j], v);
            }
        }
    }
    
    getAnimatedViews(view) {
        if (!this._tags) {
            return [view];
        }

        let n = this._tags.length;

        if (n === 1) {
            if (this._tags[0] == '') {
                return [view];
            } else {
                return view.mtag(this._tags[0]);
            }
        } else {
            let views = [];
            for (let i = 0; i < n; i++) {
                if (this._tags[i] === '') {
                    views.push(view);
                } else {
                    let vs = view.mtag(this._tags[i]);
                    views = views.concat(vs);
                }
            }
            return views;
        }        
    }

    reset(view) {
        let views = this.getAnimatedViews(view);

        let v = this.getResetValue();

        if (v === undefined || !views.length) {
            return;
        }

        // Apply transformation to all components.
        let n = this._propSetters.length;

        let m = views.length;
        for (let j = 0; j < m; j++) {
            for (let i = 0; i < n; i++) {
                this._propSetters[i](views[j], v);
            }
        }
    }
    
    get tags() {
        return this._tags;
    }

    set tags(v) {
        if (!Array.isArray(v)) {
            v = [v];
        }
        this._tags = v;
    }

    set t(v) {
        this.tags = v;
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
        this._items.parse(v);
    }

    set v(v) {
        this.value = v;
    }

    set properties(v) {
        if (!Array.isArray(v)) {
            v = [v];
        }

        this._props = [];

        let detectMerger = (this._merger === undefined);

        let first = true;
        v.forEach((prop) => {
            this._props.push(prop);
            this._propSetters.push(View.getSetter(prop));

            if (detectMerger) {
                let merger = View.getMerger(prop);
                if (first) {
                    this._merger = merger;
                    first = false;
                } else {
                    if (this._merger !== merger) {
                        // Do not use a merger in case of merger conflicts.
                        console.warn('Merger conflicts for animation action properties: ' + v.join(','));
                        this._merger = undefined;
                    }
                }
            }
        });
    }

    set property(v) {
        this.properties = v;
    }

    set p(v) {
        this.properties = v;
    }

    set merger(f) {
        if (this._items.length) {
            console.trace('You should specify the merger before the values');
        }
        this._merger = f;
    }

}



/**
 * Copyright Metrological, 2017
 */

class AnimationActionItems extends Base {
    
    constructor(action) {
        super();
        
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

        if (this._action._merger) {
            // Color merger: we need to split/combine RGBA components.
            let rgba = (this._action._merger === StageUtils.mergeColors);

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
            return -1;
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
                let o = (p - this._p[i]) * this._idp[i];
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



/**
 * Copyright Metrological, 2017
 */

class Animation extends Base {

    constructor(manager, settings, view) {
        super();

        EventEmitter.call(this);

        this.manager = manager;

        this._settings = settings;

        this._view = view;

        this._state = Animation.STATES.IDLE;
    }

    _properties() {
        this._p = 0;
        this._delayLeft = 0;
        this._repeatsLeft = 0;
        
        this._stopDelayLeft = 0;
        this._stopP = 0;
    }

    start() {
        this._p = 0;
        this._delayLeft = this.settings.delay;
        this._repeatsLeft = this.settings.repeat;
        this._state = Animation.STATES.PLAYING;
        if (this._eventsCount) this.emit('start');
        if (this._view) {
            this.checkActive();
        }
    }

    play() {
        if (this._state == Animation.STATES.STOPPING && this.settings.stopMethod == AnimationSettings.STOP_METHODS.REVERSE) {
            // Continue.
            this._state = Animation.STATES.PLAYING;
            if (this._eventsCount) this.emit('stopContinue');
        } else if (this._state != Animation.STATES.PLAYING && this._state != Animation.STATES.FINISHED) {
            // Restart.
            this.start();
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
            // Stop upon next progress.
            this._state = Animation.STATES.STOPPING;
            if (this._eventsCount) this.emit('stop');
        } else {
            if (this.settings.stopMethod === AnimationSettings.STOP_METHODS.FADE) {
                this._stopP = 0;
            }

            this._state = Animation.STATES.STOPPING;
            if (this._eventsCount) this.emit('stop');
        }

        this.checkActive();
    }

    stopNow() {
        if (this._state !== Animation.STATES.STOPPED || this._state !== Animation.STATES.IDLE) {
            this._state = Animation.STATES.STOPPING;
            this._p = 0;
            if (this._eventsCount) this.emit('stop');
            this.reset();
            this._state = Animation.STATES.STOPPED;
            if (this._eventsCount) this.emit('stopFinish');
        }
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
        return (this._state == Animation.STATES.PLAYING || this._state == Animation.STATES.STOPPING) && this._view && this._view.isAttached();
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

                if (this._eventsCount) this.emit('delayEnd');
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
            // Finished!
            if (this.settings.repeat == -1 || this._repeatsLeft > 0) {
                if (this._repeatsLeft > 0) {
                    this._repeatsLeft--;
                }
                this._p = this.settings.repeatOffset;

                if (this.settings.repeatDelay) {
                    this._delayLeft = this.settings.repeatDelay;
                }

                if (this._eventsCount) this.emit('repeat', this._repeatsLeft);
            } else {
                this._p = 1;
                this._state = Animation.STATES.FINISHED;
                if (this._eventsCount) this.emit('finish');
                if (this.settings.autostop) {
                    this.stop();
                }
            }
        } else {
            if (this._eventsCount) this.emit('progress', this._p);
        }
    }
    
    _stopProgress(dt) {
        let duration = this._getStopDuration();

        if (this._stopDelayLeft > 0) {
            // Animation wasn't even started yet: directly finish!
            this._state = Animation.STATES.STOPPED;
            if (this._eventsCount) this.emit('stopFinish');
        }

        if (this._stopDelayLeft > 0) {
            this._stopDelayLeft -= dt;

            if (this._stopDelayLeft < 0) {
                dt = -this._stopDelayLeft;
                this._stopDelayLeft = 0;

                if (this._eventsCount) this.emit('stopDelayEnd');
            } else {
                return;
            }
        }
        if (this.settings.stopMethod == AnimationSettings.STOP_METHODS.IMMEDIATE) {
            this._state = Animation.STATES.STOPPED;
            if (this._eventsCount) this.emit('stop');
            if (this._eventsCount) this.emit('stopFinish');
        } else if (this.settings.stopMethod == AnimationSettings.STOP_METHODS.REVERSE) {
            if (duration === 0) {
                this._p = 0;
            } else if (duration > 0) {
                this._p -= dt / duration;
            }

            if (this._p <= 0) {
                this._p = 0;
                this._state = Animation.STATES.STOPPED;
                if (this._eventsCount) this.emit('stopFinish');
            }
        } else if (this.settings.stopMethod == AnimationSettings.STOP_METHODS.FADE) {
            this._progressStopTransition(dt);
            if (this._stopP >= 1) {
                this._p = 0;
                this._state = Animation.STATES.STOPPED;
                if (this._eventsCount) this.emit('stopFinish');
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
                    if (this._eventsCount) this.emit('stopFinish');
                } else {
                    if (this._eventsCount) this.emit('progress', this._p);
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
                        if (this._eventsCount) this.emit('stopFinish');
                    } else {
                        if (this._repeatsLeft > 0) {
                            this._repeatsLeft--;
                            this._p = 0;
                            if (this._eventsCount) this.emit('repeat', this._repeatsLeft);
                        } else {
                            this._p = 1;
                            this._state = Animation.STATES.STOPPED;
                            if (this._eventsCount) this.emit('stopFinish');
                        }
                    }
                } else {
                    if (this._eventsCount) this.emit('progress', this._p);
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

                    if (this._eventsCount) this.emit('delayEnd');
                } else {
                    return;
                }
            }
            
            let duration = this._getStopDuration();

            if (duration == 0) {
                this._stopP = 1;
            } else {
                this._stopP += dt / duration;
            }
            if (this._stopP >= 1) {
                // Finished!
                this._stopP = 1;
            }
        }
    }

    _getStopDuration() {
        return this.settings.stopDuration || this.settings.duration;
    }

    apply() {
        if (this._state == Animation.STATES.STOPPED) {
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
        return Math.round(p * this._settings.duration * 60);
    }

    get settings() {
        return this._settings;
    }

}



Base.mixinEs5(Animation, EventEmitter);

Animation.STATES = {
    IDLE: 0,
    PLAYING: 1,
    STOPPING: 2,
    STOPPED: 3,
    FINISHED: 4
};


/**
 * Copyright Metrological, 2017
 */

class Tools {
    
    static getRoundRect(stage, w, h, radius, strokeWidth, strokeColor, fill, fillColor) {
        if (fill === undefined) fill = true;
        if (strokeWidth === undefined) strokeWidth = 0;

        let canvas = stage.adapter.getDrawingCanvas();
        let ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;

        let id = 'rect' + [w, h, radius, strokeWidth, strokeColor, fill ? 1 : 0, fillColor].join(",");
        return stage.texture(function(cb) {
            let canvas = Tools.createRoundRect(stage, w, h, radius, strokeWidth, strokeColor, fill, fillColor);

            let data = canvas;
            if (Utils.isNode) {
                data = canvas.toBuffer('raw');
                options.w = canvas.width;
                options.h = canvas.height;
                options.premultiplyAlpha = false;
                options.flipBlueRed = true;
            }
            cb(null, data, options);
        }, {id: id});
    }

    static createRoundRect(stage, w, h, radius, strokeWidth, strokeColor, fill, fillColor) {
        if (fill === undefined) fill = true;
        if (strokeWidth === undefined) strokeWidth = 0;

        let canvas = stage.adapter.getDrawingCanvas();
        let ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;

        let id = 'rect' + [w, h, radius, strokeWidth, strokeColor, fill ? 1 : 0, fillColor].join(",");
        canvas.width = w + strokeWidth + 2;
        canvas.height = h + strokeWidth + 2;

        ctx.beginPath();
        let x = 0.5 * strokeWidth + 1, y = 0.5 * strokeWidth + 1;
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

        return canvas;
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

    }

    _getExposedChildList() {
        // Proxy children to wrapper and encapsulate for positioning purposes.
        return new (class extends ViewChildList {
            constructor(view, list) {
                super(view);
                this.list = list;
            }

            addAt(view, index) {
                let encaps = view.stage.createView();
                encaps.add(view);
                encaps.visible = false;
                super.addAt(encaps, index);

                this.list._reloadVisibleElements = true;
                if (!this.list._started) {
                    this.list.start();
                } else {
                    if (this.list.length === 1) {
                        this.list.setIndex(0, true, true);
                    }
                    this.list.update();
                }
            }

            getIndex(view) {
                return super.getIndex(view.parent);
            }

            removeAt(index) {
                let ri = this.list.realIndex;

                let view = super.removeAt(index);

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

                return view._children.get()[0];
            }

            get() {
                return super.get().map(function(view) {return view._children.get()[0]})
            }

            clear() {
                super.clear();
                this.list._reloadVisibleElements = true;
                this.list._index = 0;
            }
        })(this._wrapper, this);
    }

    start() {
        this._wrapper.transition(this.property, this._scrollTransitionSettings)
        this._scrollTransition = this._wrapper.transition(this.property);
        this._scrollTransition.on('progress', p => this.update());

        this.setIndex(0, true, true);
        this.update();

        this._started = true;
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

    get VIEWPORTSCROLLOFFSET() {
        return this._getTransVal('viewportScrollOffset', this.viewportScrollOffset);
    }

    set VIEWPORTSCROLLOFFSET(v) {
        this._setTransVal('viewportScrollOffset', v)
    }
    
    get itemScrollOffset() {
        return this._itemScrollOffset;
    }

    set itemScrollOffset(v) {
        this._itemScrollOffset = v;
        this.update();
    }

    get ITEMSCROLLOFFSET() {
        return this._getTransVal('itemScrollOffset', this.itemScrollOffset);
    }

    set ITEMSCROLLOFFSET(v) {
        this._setTransVal('itemScrollOffset', v)
    }

    get scrollTransitionSettings() {
        return this._scrollTransitionSettings;
    }

    set scrollTransitionSettings(v) {
        this._scrollTransitionSettings.setSettings(v);
    }

    set scrollTransition(v) {
        this._scrollTransitionSettings.setSettings(v);
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

ListView.NUMBER_PROPERTIES = new Set(['viewportScrollOffset', 'itemScrollOffset'])



/**
 * Copyright Metrological, 2017
 */

class BorderView extends View {

    constructor(stage) {
        super(stage);

        this._wrapper = super._children.a({});

        this._borderTop = super._children.a({rect: true, visible: false, mountY: 1});
        this._borderRight = super._children.a({rect: true, visible: false});
        this._borderBottom = super._children.a({rect: true, visible: false});
        this._borderLeft = super._children.a({rect: true, visible: false, mountX: 1});

        this._updateLayout = false;

        this.layoutExit = function (view, recalc) {
            if (recalc || view._updateLayout) {
                let rw = view.renderWidth;
                let rh = view.renderHeight;
                view._borderTop.w = rw;
                view._borderBottom.y = rh;
                view._borderBottom.w = rw;
                view._borderLeft.h = rh + view._borderTop.h + view._borderBottom.h;
                view._borderLeft.y = -view._borderTop.h;
                view._borderRight.x = rw;
                view._borderRight.h = rh + view._borderTop.h + view._borderBottom.h;
                view._borderRight.y = -view._borderTop.h;
                view._wrapper.w = rw;
                view._wrapper.h = rh;
                view._updateLayout = false;
            }
        }
    }

    _getExposedChildList() {
        // Proxy children to wrapper.
        return this._wrapper._children;
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
        this._updateLayout = true;
    }

    set borderWidthRight(v) {
        this._borderRight.w = v;
        this._borderRight.visible = (v > 0);
        this._updateLayout = true;
    }

    set borderWidthBottom(v) {
        this._borderBottom.h = v;
        this._borderBottom.visible = (v > 0);
        this._updateLayout = true;
    }

    set borderWidthLeft(v) {
        this._borderLeft.w = v;
        this._borderLeft.visible = (v > 0);
        this._updateLayout = true;
    }

    get borderColor() {
        return this.borderColorTop;
    }

    get borderColorTop() {
        return this._borderTop.color;
    }

    get borderColorRight() {
        return this._borderRight.color;
    }

    get borderColorBottom() {
        return this._borderBottom.color;
    }

    get borderColorLeft() {
        return this._borderLeft.color;
    }
    
    set borderColor(v) {
        this.borderColorTop = v;
        this.borderColorRight = v;
        this.borderColorBottom = v;
        this.borderColorLeft = v;
    }

    set borderColorTop(v) {
        this._borderTop.color = v;
    }

    set borderColorRight(v) {
        this._borderRight.color = v;
    }

    set borderColorBottom(v) {
        this._borderBottom.color = v;
    }

    set borderColorLeft(v) {
        this._borderLeft.color = v;
    }

    get borderTop() {
        return this._borderTop;
    }

    set borderTop(settings) {
        this.borderTop.setSettings(settings);
    }

    get borderRight() {
        return this._borderRight;
    }

    set borderRight(settings) {
        this.borderRight.setSettings(settings);
    }

    get borderBottom() {
        return this._borderBottom;
    }

    set borderBottom(settings) {
        this.borderBottom.setSettings(settings);
    }

    get borderLeft() {
        return this._borderLeft;
    }

    set borderLeft(settings) {
        this.borderLeft.setSettings(settings);
    }    

    set borders(settings) {
        this.borderTop = settings;
        this.borderLeft = settings;
        this.borderBottom = settings;
        this.borderRight = settings;
    }

    get clipping() {
        return this._wrapper.clipping;
    }

    set clipping(v) {
        this._wrapper.clipping = v;
    }

    get BORDERWIDTH() {
        return this._getTransVal('borderWidth', this.borderWidth);
    }

    set BORDERWIDTH(v) {
        this._setTransVal('borderWidth', v)
    }

    get BORDERWIDTHTOP() {
        return this._getTransVal('borderWidthTop', this.borderWidthTop);
    }

    set BORDERWIDTHTOP(v) {
        this._setTransVal('borderWidthTop', v)
    }

    get BORDERWIDTHRIGHT() {
        return this._getTransVal('borderWidthRight', this.borderWidthRight);
    }

    set BORDERWIDTHRIGHT(v) {
        this._setTransVal('borderWidthRight', v)
    }

    get BORDERWIDTHBOTTOM() {
        return this._getTransVal('borderWidthBottom', this.borderWidthBottom);
    }

    set BORDERWIDTHBOTTOM(v) {
        this._setTransVal('borderWidthBottom', v)
    }

    get BORDERWIDTHLEFT() {
        return this._getTransVal('borderWidthLeft', this.borderWidthLeft);
    }

    set BORDERWIDTHLEFT(v) {
        this._setTransVal('borderWidthLeft', v)
    }

    get BORDERCOLOR() {
        return this._getTransVal('borderColor', this.borderColor);
    }

    set BORDERCOLOR(v) {
        this._setTransVal('borderColor', v)
    }

    get BORDERCOLORTOP() {
        return this._getTransVal('borderColorTop', this.borderColorTop);
    }

    set BORDERCOLORTOP(v) {
        this._setTransVal('borderColorTop', v)
    }

    get BORDERCOLORRIGHT() {
        return this._getTransVal('borderColorRight', this.borderColorRight);
    }

    set BORDERCOLORRIGHT(v) {
        this._setTransVal('borderColorRight', v)
    }

    get BORDERCOLORBOTTOM() {
        return this._getTransVal('borderColorBottom', this.borderColorBottom);
    }

    set BORDERCOLORBOTTOM(v) {
        this._setTransVal('borderColorBottom', v)
    }

    get BORDERCOLORLEFT() {
        return this._getTransVal('borderColorLeft', this.borderColorLeft);
    }

    set BORDERCOLORLEFT(v) {
        this._setTransVal('borderColorLeft', v)
    }
}

BorderView.NUMBER_PROPERTIES = new Set(['borderWidth', 'borderWidthTop', 'borderWidthRight', 'borderWidthBottom', 'borderWidthLeft'])
BorderView.COLOR_PROPERTIES = new Set(['borderColor', 'borderColorTop', 'borderColorRight', 'borderColorBottom', 'borderColorLeft'])


