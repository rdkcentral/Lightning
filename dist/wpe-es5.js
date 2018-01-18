'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var has = Object.prototype.hasOwnProperty;
var prefix = '~';

function Events() {}

if (Object.create) {
    Events.prototype = Object.create(null);

    if (!new Events().__proto__) prefix = false;
}

function EE(fn, context, once) {
    this.fn = fn;
    this.context = context;
    this.once = once || false;
}

function EventEmitter() {
    this._events = new Events();
    this._eventsCount = 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
    var names = [],
        events,
        name;

    if (this._eventsCount === 0) return names;

    for (name in events = this._events) {
        if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
    }

    if (Object.getOwnPropertySymbols) {
        return names.concat(Object.getOwnPropertySymbols(events));
    }

    return names;
};

EventEmitter.prototype.listeners = function listeners(event, exists) {
    var evt = prefix ? prefix + event : event,
        available = this._events[evt];

    if (exists) return !!available;
    if (!available) return [];
    if (available.fn) return [available.fn];

    for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
        ee[i] = available[i].fn;
    }

    return ee;
};

EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
    var evt = prefix ? prefix + event : event;

    if (!this._events[evt]) return false;

    var listeners = this._events[evt],
        len = arguments.length,
        args,
        i;

    if (listeners.fn) {
        if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

        switch (len) {
            case 1:
                return listeners.fn.call(listeners.context), true;
            case 2:
                return listeners.fn.call(listeners.context, a1), true;
            case 3:
                return listeners.fn.call(listeners.context, a1, a2), true;
            case 4:
                return listeners.fn.call(listeners.context, a1, a2, a3), true;
            case 5:
                return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
            case 6:
                return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
        }

        for (i = 1, args = new Array(len - 1); i < len; i++) {
            args[i - 1] = arguments[i];
        }

        listeners.fn.apply(listeners.context, args);
    } else {
        var length = listeners.length,
            j;

        for (i = 0; i < length; i++) {
            if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

            switch (len) {
                case 1:
                    listeners[i].fn.call(listeners[i].context);break;
                case 2:
                    listeners[i].fn.call(listeners[i].context, a1);break;
                case 3:
                    listeners[i].fn.call(listeners[i].context, a1, a2);break;
                case 4:
                    listeners[i].fn.call(listeners[i].context, a1, a2, a3);break;
                default:
                    if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) {
                        args[j - 1] = arguments[j];
                    }

                    listeners[i].fn.apply(listeners[i].context, args);
            }
        }
    }

    return true;
};

EventEmitter.prototype.on = function on(event, fn, context) {
    var listener = new EE(fn, context || this),
        evt = prefix ? prefix + event : event;

    if (!this._events[evt]) this._events[evt] = listener, this._eventsCount++;else if (!this._events[evt].fn) this._events[evt].push(listener);else this._events[evt] = [this._events[evt], listener];

    return this;
};

EventEmitter.prototype.once = function once(event, fn, context) {
    var listener = new EE(fn, context || this, true),
        evt = prefix ? prefix + event : event;

    if (!this._events[evt]) this._events[evt] = listener, this._eventsCount++;else if (!this._events[evt].fn) this._events[evt].push(listener);else this._events[evt] = [this._events[evt], listener];

    return this;
};

EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
    var evt = prefix ? prefix + event : event;

    if (!this._events[evt]) return this;
    if (!fn) {
        if (--this._eventsCount === 0) this._events = new Events();else delete this._events[evt];
        return this;
    }

    var listeners = this._events[evt];

    if (listeners.fn) {
        if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
            if (--this._eventsCount === 0) this._events = new Events();else delete this._events[evt];
        }
    } else {
        for (var i = 0, events = [], length = listeners.length; i < length; i++) {
            if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
                events.push(listeners[i]);
            }
        }

        if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;else if (--this._eventsCount === 0) this._events = new Events();else delete this._events[evt];
    }

    return this;
};

EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
    var evt;

    if (event) {
        evt = prefix ? prefix + event : event;
        if (this._events[evt]) {
            if (--this._eventsCount === 0) this._events = new Events();else delete this._events[evt];
        }
    } else {
        this._events = new Events();
        this._eventsCount = 0;
    }

    return this;
};

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
    return this;
};

EventEmitter.prefixed = prefix;

EventEmitter.EventEmitter = EventEmitter;

if ('undefined' !== typeof module) {}

var WebAdapter = function () {
    function WebAdapter() {
        _classCallCheck(this, WebAdapter);
    }

    _createClass(WebAdapter, [{
        key: 'init',
        value: function init(stage) {
            this.stage = stage;
            this.canvas = null;
            this._looping = false;
            this._awaitingLoop = false;
        }
    }, {
        key: 'startLoop',
        value: function startLoop() {
            this._looping = true;
            if (!this._awaitingLoop) {
                this.loop();
            }
        }
    }, {
        key: 'stopLoop',
        value: function stopLoop() {
            this._looping = false;
        }
    }, {
        key: 'loop',
        value: function loop() {
            var self = this;
            var lp = function lp() {
                self._awaitingLoop = false;
                if (self._looping) {
                    self.stage.drawFrame();
                    requestAnimationFrame(lp);
                    self._awaitingLoop = true;
                }
            };
            lp();
        }
    }, {
        key: 'uploadGlTexture',
        value: function uploadGlTexture(gl, textureSource, source, hasAlpha) {
            var format = hasAlpha ? gl.RGBA : gl.RGB;

            if (source instanceof ImageData || source instanceof HTMLImageElement || source instanceof HTMLCanvasElement || source instanceof HTMLVideoElement || window.ImageBitmap && source instanceof ImageBitmap) {
                gl.texImage2D(gl.TEXTURE_2D, 0, format, format, gl.UNSIGNED_BYTE, source);
            } else {
                gl.texImage2D(gl.TEXTURE_2D, 0, format, textureSource.w, textureSource.h, 0, format, gl.UNSIGNED_BYTE, source);
            }
        }
    }, {
        key: 'loadSrcTexture',
        value: function loadSrcTexture(src, ts, sync, cb) {
            var isPng = src.indexOf(".png") >= 0;
            if (window.OffthreadImage && OffthreadImage.available) {
                var element = document.createElement('DIV');
                element.setAttribute('alt', '.');
                var image = new OffthreadImage(element);
                element.addEventListener('painted', function () {
                    var canvas = element.childNodes[0];

                    cb(null, canvas, { renderInfo: { src: src }, hasAlpha: true, premultiplyAlpha: true });
                });
                image.src = src;
            } else {
                var _image = new Image();
                if (!(src.substr(0, 5) == "data:")) {
                    _image.crossOrigin = "Anonymous";
                }
                _image.onerror = function (err) {
                    return cb("Image load error");
                };
                _image.onload = function () {
                    cb(null, _image, { renderInfo: { src: src }, hasAlpha: isPng });
                };
                _image.src = src;
            }
        }
    }, {
        key: 'loadTextTexture',
        value: function loadTextTexture(settings, ts, sync, cb) {
            var tr = new TextRenderer(this.getDrawingCanvas(), settings);
            var rval = tr.draw();
            var renderInfo = rval.renderInfo;

            var options = { renderInfo: renderInfo, precision: rval.renderInfo.precision };
            var data = rval.canvas;
            cb(null, data, options);
        }
    }, {
        key: 'createWebGLContext',
        value: function createWebGLContext(w, h) {
            var canvas = this.stage.options.canvas || document.createElement('canvas');

            canvas.width = w;
            canvas.height = h;

            var opts = {
                alpha: true,
                antialias: false,
                premultipliedAlpha: true,
                stencil: true,
                preserveDrawingBuffer: false
            };

            var gl = canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl', opts);
            if (!gl) {
                throw new Error('This browser does not support webGL.');
            }

            this.canvas = canvas;

            return gl;
        }
    }, {
        key: 'getWebGLCanvas',
        value: function getWebGLCanvas() {
            return this.canvas;
        }
    }, {
        key: 'getHrTime',
        value: function getHrTime() {
            return window.performance ? window.performance.now() : new Date().getTime();
        }
    }, {
        key: 'getDrawingCanvas',
        value: function getDrawingCanvas() {
            return document.createElement('canvas');
        }
    }, {
        key: 'nextFrame',
        value: function nextFrame(changes) {}
    }]);

    return WebAdapter;
}();

var Base = function () {
    function Base() {
        _classCallCheck(this, Base);

        var proto = Object.getPrototypeOf(this);
        if (!Base.protoReady.has(proto)) {
            Base.initPrototype(proto);
        }
    }

    _createClass(Base, [{
        key: '_properties',
        value: function _properties() {}
    }, {
        key: 'setSettings',
        value: function setSettings(settings) {
            Base.setObjectSettings(this, settings);
        }
    }], [{
        key: 'initPrototype',
        value: function initPrototype(proto) {
            if (!Base.protoReady.has(proto)) {
                var stack = [];

                while (proto) {
                    if (!Base.protoReady.has(proto)) {
                        stack.push(proto);
                    }
                    Base.protoReady.add(proto);
                    proto = Object.getPrototypeOf(proto);
                }

                for (var _i = stack.length - 1; _i >= 0; _i--) {
                    proto = stack[_i];

                    if (proto.hasOwnProperty('_properties')) {
                        proto._properties();
                    }
                }
            }
        }
    }, {
        key: 'mixinEs5',
        value: function mixinEs5(superclass, extra) {
            var proto = extra.prototype;

            var props = Object.getOwnPropertyNames(proto);
            for (var _i2 = 0; _i2 < props.length; _i2++) {
                var key = props[_i2];
                var desc = Object.getOwnPropertyDescriptor(proto, key);
                if (key !== 'constructor' && desc.configurable) {
                    if (superclass.prototype[key]) {
                        console.warn('Mixin overwrites ' + key);
                    } else {
                        Object.defineProperty(superclass.prototype, key, desc);
                    }
                }
            }

            return superclass;
        }
    }, {
        key: 'setObjectSettings',
        value: function setObjectSettings(obj, settings) {
            for (var name in settings) {
                if (settings.hasOwnProperty(name) && name != 'type') {
                    var _v = settings[name];
                    if (Utils.isObjectLiteral(_v) && Utils.isObject(obj[name])) {
                        var p = obj[name];
                        if (p.setSettings) {
                            p.setSettings(_v);
                        } else {
                            Base.setObjectSettings(p, _v);
                        }
                    } else {
                        obj[name] = _v;
                    }
                }
            }
        }
    }]);

    return Base;
}();

Base.protoReady = new WeakSet();

var Utils = function () {
    function Utils() {
        _classCallCheck(this, Utils);
    }

    _createClass(Utils, null, [{
        key: 'isFunction',
        value: function isFunction(value) {
            return typeof value === 'function';
        }
    }, {
        key: 'isNumber',
        value: function isNumber(value) {
            return typeof value === 'number';
        }
    }, {
        key: 'isInteger',
        value: function isInteger(value) {
            return typeof value === 'number' && value % 1 === 0;
        }
    }, {
        key: 'isBoolean',
        value: function isBoolean(value) {
            return value === true || value === false;
        }
    }, {
        key: 'isString',
        value: function isString(value) {
            return typeof value == 'string';
        }
    }, {
        key: 'cloneObj',
        value: function cloneObj(obj) {
            var keys = Object.keys(obj);
            var clone = {};
            for (var _i3 = 0; _i3 < keys.length; _i3++) {
                clone[keys[_i3]] = obj[keys[_i3]];
            }
            return clone;
        }
    }, {
        key: 'merge',
        value: function merge(obj1, obj2) {
            var keys = Object.keys(obj2);
            for (var _i4 = 0; _i4 < keys.length; _i4++) {
                obj1[keys[_i4]] = obj2[keys[_i4]];
            }
            return obj1;
        }
    }, {
        key: 'isObject',
        value: function isObject(value) {
            var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
            return !!value && (type == 'object' || type == 'function');
        }
    }, {
        key: 'isPlainObject',
        value: function isPlainObject(value) {
            var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
            return !!value && type == 'object';
        }
    }, {
        key: 'isObjectLiteral',
        value: function isObjectLiteral(value) {
            return (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value && value.constructor === Object;
        }
    }, {
        key: 'getArrayIndex',
        value: function getArrayIndex(index, arr) {
            return Utils.getModuloIndex(index, arr.length);
        }
    }, {
        key: 'getModuloIndex',
        value: function getModuloIndex(index, len) {
            if (len == 0) return index;
            while (index < 0) {
                index += Math.ceil(-index / len) * len;
            }
            index = index % len;
            return index;
        }
    }, {
        key: 'getDeepClone',
        value: function getDeepClone(obj) {
            var i = void 0,
                c = void 0;
            if (Utils.isFunction(obj)) {
                return obj;
            }
            if (Utils.isArray(obj)) {
                c = [];
                var keys = Object.keys(obj);
                for (i = 0; i < keys.length; i++) {
                    c[keys[i]] = Utils.getDeepClone(obj[keys[i]]);
                }
                return c;
            } else if (Utils.isObject(obj)) {
                c = {};
                var _keys = Object.keys(obj);
                for (i = 0; i < _keys.length; i++) {
                    c[_keys[i]] = Utils.getDeepClone(obj[_keys[i]]);
                }
                return c;
            } else {
                return obj;
            }
        }
    }, {
        key: 'setToArray',
        value: function setToArray(s) {
            var result = [];
            s.forEach(function (value) {
                result.push(value);
            });
            return result;
        }
    }, {
        key: 'iteratorToArray',
        value: function iteratorToArray(iterator) {
            var result = [];
            var iteratorResult = iterator.next();
            while (!iteratorResult.done) {
                result.push(iteratorResult.value);
                iteratorResult = iterator.next();
            }
            return result;
        }
    }]);

    return Utils;
}();

Utils.isNode = typeof window === "undefined";

var StageUtils = function () {
    function StageUtils() {
        _classCallCheck(this, StageUtils);
    }

    _createClass(StageUtils, null, [{
        key: 'mergeNumbers',
        value: function mergeNumbers(v1, v2, p) {
            return v1 * p + v2 * (1 - p);
        }
    }, {
        key: 'rgb',
        value: function rgb(r, g, b) {
            return (r << 16) + (g << 8) + b + 255 * 16777216;
        }
    }, {
        key: 'rgba',
        value: function rgba(r, g, b, a) {
            return (r << 16) + (g << 8) + b + (a * 255 | 0) * 16777216;
        }
    }, {
        key: 'getRgbaString',
        value: function getRgbaString(color) {
            var r = (color / 65536 | 0) % 256;
            var g = (color / 256 | 0) % 256;
            var b = color % 256;
            var a = (color / 16777216 | 0) / 255;
            return 'rgba(' + r + ',' + g + ',' + b + ',' + a.toFixed(4) + ')';
        }
    }, {
        key: 'getRgbaComponentsNormalized',
        value: function getRgbaComponentsNormalized(argb) {
            var r = (argb / 65536 | 0) % 256;
            var g = (argb / 256 | 0) % 256;
            var b = argb % 256;
            var a = argb / 16777216 | 0;
            return [r / 255, g / 255, b / 255, a / 255];
        }
    }, {
        key: 'getRgbaComponents',
        value: function getRgbaComponents(argb) {
            var r = (argb / 65536 | 0) % 256;
            var g = (argb / 256 | 0) % 256;
            var b = argb % 256;
            var a = argb / 16777216 | 0;
            return [r, g, b, a];
        }
    }, {
        key: 'getArgbNumber',
        value: function getArgbNumber(rgba) {
            rgba[0] = Math.max(0, Math.min(255, rgba[0]));
            rgba[1] = Math.max(0, Math.min(255, rgba[1]));
            rgba[2] = Math.max(0, Math.min(255, rgba[2]));
            rgba[3] = Math.max(0, Math.min(255, rgba[3]));
            var v = ((rgba[3] | 0) << 24) + ((rgba[0] | 0) << 16) + ((rgba[1] | 0) << 8) + (rgba[2] | 0);
            if (v < 0) {
                v = 0xFFFFFFFF + v + 1;
            }
            return v;
        }
    }, {
        key: 'mergeColors',
        value: function mergeColors(c1, c2, p) {
            var r1 = (c1 / 65536 | 0) % 256;
            var g1 = (c1 / 256 | 0) % 256;
            var b1 = c1 % 256;
            var a1 = c1 / 16777216 | 0;

            var r2 = (c2 / 65536 | 0) % 256;
            var g2 = (c2 / 256 | 0) % 256;
            var b2 = c2 % 256;
            var a2 = c2 / 16777216 | 0;

            var r = r1 * p + r2 * (1 - p) | 0;
            var g = g1 * p + g2 * (1 - p) | 0;
            var b = b1 * p + b2 * (1 - p) | 0;
            var a = a1 * p + a2 * (1 - p) | 0;

            return a * 16777216 + r * 65536 + g * 256 + b;
        }
    }, {
        key: 'mergeMultiColors',
        value: function mergeMultiColors(c, p) {
            var r = 0,
                g = 0,
                b = 0,
                a = 0,
                t = 0;
            var n = c.length;
            for (var _i5 = 0; _i5 < n; _i5++) {
                var r1 = (c[_i5] / 65536 | 0) % 256;
                var g1 = (c[_i5] / 256 | 0) % 256;
                var b1 = c[_i5] % 256;
                var a1 = c[_i5] / 16777216 | 0;
                r += r1 * p[_i5];
                g += g1 * p[_i5];
                b += b1 * p[_i5];
                a += a1 * p[_i5];
                t += p[_i5];
            }

            t = 1 / t;
            return (a * t | 0) * 16777216 + (r * t | 0) * 65536 + (g * t | 0) * 256 + (b * t | 0);
        }
    }, {
        key: 'mergeMultiColorsEqual',
        value: function mergeMultiColorsEqual(c) {
            var r = 0,
                g = 0,
                b = 0,
                a = 0,
                t = 0;
            var n = c.length;
            for (var _i6 = 0; _i6 < n; _i6++) {
                var r1 = (c[_i6] / 65536 | 0) % 256;
                var g1 = (c[_i6] / 256 | 0) % 256;
                var b1 = c[_i6] % 256;
                var a1 = c[_i6] / 16777216 | 0;
                r += r1;
                g += g1;
                b += b1;
                a += a1;
                t += 1.0;
            }

            t = 1 / t;
            return (a * t | 0) * 16777216 + (r * t | 0) * 65536 + (g * t | 0) * 256 + (b * t | 0);
        }
    }, {
        key: 'rad',
        value: function rad(deg) {
            return deg * (Math.PI / 180);
        }
    }, {
        key: 'getTimingBezier',
        value: function getTimingBezier(a, b, c, d) {
            var xc = 3.0 * a;
            var xb = 3.0 * (c - a) - xc;
            var xa = 1.0 - xc - xb;
            var yc = 3.0 * b;
            var yb = 3.0 * (d - b) - yc;
            var ya = 1.0 - yc - yb;

            return function (time) {
                if (time >= 1.0) {
                    return 1;
                }
                if (time <= 0) {
                    return 0;
                }

                var t = 0.5,
                    cbx = void 0,
                    cbxd = void 0,
                    dx = void 0;

                for (var _it = 0; _it < 20; _it++) {
                    cbx = t * (t * (t * xa + xb) + xc);
                    dx = time - cbx;
                    if (dx > -1e-8 && dx < 1e-8) {
                        return t * (t * (t * ya + yb) + yc);
                    }

                    cbxd = t * (t * (3 * xa) + 2 * xb) + xc;

                    if (cbxd > 1e-10 && cbxd < 1e-10) {
                        break;
                    }

                    t += dx / cbxd;
                }

                var minT = 0;
                var maxT = 1;
                for (it = 0; it < 20; it++) {
                    t = 0.5 * (minT + maxT);

                    cbx = t * (t * (t * xa + xb) + xc);

                    dx = time - cbx;
                    if (dx > -1e-8 && dx < 1e-8) {
                        return t * (t * (t * ya + yb) + yc);
                    }

                    if (dx < 0) {
                        maxT = t;
                    } else {
                        minT = t;
                    }
                }
            };
        }
    }, {
        key: 'getTimingFunction',
        value: function getTimingFunction(str) {
            switch (str) {
                case "linear":
                    return function (time) {
                        return time;
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
                        return 1;
                    };
                case "step-end":
                    return function (time) {
                        return time === 1 ? 1 : 0;
                    };
                default:
                    var s = "cubic-bezier(";
                    if (str && str.indexOf(s) === 0) {
                        var parts = str.substr(s.length, str.length - s.length - 1).split(",");
                        if (parts.length !== 4) {
                            console.warn("Unknown timing function: " + str);

                            return function (time) {
                                return time;
                            };
                        }
                        var a = parseFloat(parts[0]);
                        var b = parseFloat(parts[1]);
                        var c = parseFloat(parts[2]);
                        var d = parseFloat(parts[3]);
                        if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d)) {
                            console.warn("Unknown timing function: " + str);

                            return function (time) {
                                return time;
                            };
                        }

                        return StageUtils.getTimingBezier(a, b, c, d);
                    } else {
                        console.warn("Unknown timing function: " + str);

                        return function (time) {
                            return time;
                        };
                    }
            }
        }
    }, {
        key: 'getSplineValueFunction',
        value: function getSplineValueFunction(v1, v2, p1, p2, o1, i2, s1, s2) {
            var dp = p2 - p1;
            s1 *= dp;
            s2 *= dp;

            var helpers = StageUtils.getSplineHelpers(v1, v2, o1, i2, s1, s2);
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
        }
    }, {
        key: 'getSplineRgbaValueFunction',
        value: function getSplineRgbaValueFunction(v1, v2, p1, p2, o1, i2, s1, s2) {
            var dp = p2 - p1;
            s1[0] *= dp;
            s1[1] *= dp;
            s1[2] *= dp;
            s1[3] *= dp;
            s2[0] *= dp;
            s2[1] *= dp;
            s2[2] *= dp;
            s2[3] *= dp;

            var cv1 = StageUtils.getRgbaComponents(v1);
            var cv2 = StageUtils.getRgbaComponents(v2);

            var helpers = [StageUtils.getSplineHelpers(cv1[0], cv2[0], o1, i2, s1[0], s2[0]), StageUtils.getSplineHelpers(cv1[1], cv2[1], o1, i2, s1[1], s2[1]), StageUtils.getSplineHelpers(cv1[2], cv2[2], o1, i2, s1[2], s2[2]), StageUtils.getSplineHelpers(cv1[3], cv2[3], o1, i2, s1[3], s2[3])];

            if (!helpers[0]) {
                return function (p) {
                    if (p == 0) return v1;
                    if (p == 1) return v2;

                    return StageUtils.mergeColors(v2, v1, p);
                };
            } else {
                return function (p) {
                    if (p == 0) return v1;
                    if (p == 1) return v2;

                    return StageUtils.getArgbNumber([Math.min(255, StageUtils.calculateSpline(helpers[0], p)), Math.min(255, StageUtils.calculateSpline(helpers[1], p)), Math.min(255, StageUtils.calculateSpline(helpers[2], p)), Math.min(255, StageUtils.calculateSpline(helpers[3], p))]);
                };
            }
        }
    }, {
        key: 'getSplineHelpers',
        value: function getSplineHelpers(v1, v2, o1, i2, s1, s2) {
            if (!o1 && !i2) {
                return null;
            }

            var csx = o1;
            var csy = v1 + s1 * o1;
            var cex = 1 - i2;
            var cey = v2 - s2 * i2;

            var xa = 3 * csx - 3 * cex + 1;
            var xb = -6 * csx + 3 * cex;
            var xc = 3 * csx;

            var ya = 3 * csy - 3 * cey + v2 - v1;
            var yb = 3 * (cey + v1) - 6 * csy;
            var yc = 3 * (csy - v1);
            var yd = v1;

            return [xa, xb, xc, ya, yb, yc, yd];
        }
    }, {
        key: 'calculateSpline',
        value: function calculateSpline(helpers, p) {
            var xa = helpers[0];
            var xb = helpers[1];
            var xc = helpers[2];
            var ya = helpers[3];
            var yb = helpers[4];
            var yc = helpers[5];
            var yd = helpers[6];

            if (xa == -2 && ya == -2 && xc == 0 && yc == 0) {
                return p;
            }

            var t = 0.5,
                cbx = void 0,
                dx = void 0;

            for (var _it2 = 0; _it2 < 20; _it2++) {
                cbx = t * (t * (t * xa + xb) + xc);

                dx = p - cbx;
                if (dx > -1e-8 && dx < 1e-8) {
                    return t * (t * (t * ya + yb) + yc) + yd;
                }

                var cbxd = t * (t * (3 * xa) + 2 * xb) + xc;

                if (cbxd > 1e-10 && cbxd < 1e-10) {
                    break;
                }

                t += dx / cbxd;
            }

            var minT = 0;
            var maxT = 1;
            for (it = 0; it < 20; it++) {
                t = 0.5 * (minT + maxT);

                cbx = t * (t * (t * xa + xb) + xc);

                dx = p - cbx;
                if (dx > -1e-8 && dx < 1e-8) {
                    return t * (t * (t * ya + yb) + yc) + yd;
                }

                if (dx < 0) {
                    maxT = t;
                } else {
                    minT = t;
                }
            }

            return t;
        }
    }]);

    return StageUtils;
}();

var Stage = function (_Base) {
    _inherits(Stage, _Base);

    function Stage(options) {
        _classCallCheck(this, Stage);

        var _this = _possibleConstructorReturn(this, (Stage.__proto__ || Object.getPrototypeOf(Stage)).call(this));

        EventEmitter.call(_this);

        _this.setOptions(options);

        _this.init();
        return _this;
    }

    _createClass(Stage, [{
        key: 'setOptions',
        value: function setOptions(o) {
            var _this2 = this;

            this.options = o;

            var opt = function opt(name, def) {
                var value = o[name];

                if (value === undefined) {
                    _this2.options[name] = def;
                } else {
                    _this2.options[name] = value;
                }
            };

            opt('w', 1280);
            opt('h', 720);
            opt('canvas', this.options.canvas);
            opt('renderWidth', this.options.w);
            opt('renderHeight', this.options.h);
            opt('srcBasePath', null);
            opt('textureMemory', 12e6);
            opt('renderTexturePoolPixels', 12e6);
            opt('glClearColor', [0, 0, 0, 0]);
            opt('defaultFontFace', 'Sans-Serif');
            opt('defaultPrecision', this.options.h / this.options.renderHeight);
            opt('fixedDt', 0);
            opt('useTextureAtlas', false);
            opt('debugTextureAtlas', false);
        }
    }, {
        key: 'init',
        value: function init() {
            this.adapter = new WebAdapter();

            if (this.adapter.init) {
                this.adapter.init(this);
            }

            this.gl = this.adapter.createWebGLContext(this.options.w, this.options.h);

            this.setGlClearColor(this.options.glClearColor);

            this.frameCounter = 0;

            this.transitions = new TransitionManager(this);
            this.animations = new AnimationManager(this);

            this.textureManager = new TextureManager(this);

            if (this.options.useTextureAtlas) {
                this.textureAtlas = new TextureAtlas(this);
            }

            this.ctx = new CoreContext(this);

            this.root = new View(this);
            this.root.w = this.options.w;
            this.root.h = this.options.h;

            this.root.setAsRoot();

            this.startTime = 0;
            this.currentTime = 0;
            this.dt = 0;

            this._destroyed = false;

            var self = this;

            this.rectangleTexture = this.texture(function (cb) {
                var whitePixel = new Uint8Array([255, 255, 255, 255]);
                return cb(null, whitePixel, { w: 1, h: 1 });
            }, { id: '__whitepix' });

            var source = this.rectangleTexture.source;
            this.rectangleTexture.source.load(true);

            source.permanent = true;
            if (self.textureAtlas) {
                self.textureAtlas.add(source);
            }

            self.adapter.startLoop();
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            this.adapter.stopLoop();
            if (this.textureAtlas) {
                this.textureAtlas.destroy();
            }
            this.ctx.destroy();
            this.textureManager.destroy();
            this._destroyed = true;
        }
    }, {
        key: 'stop',
        value: function stop() {
            this.adapter.stopLoop();
        }
    }, {
        key: 'resume',
        value: function resume() {
            if (this._destroyed) {
                throw new Error("Already destroyed");
            }
            this.adapter.startLoop();
        }
    }, {
        key: 'getCanvas',
        value: function getCanvas() {
            return this.adapter.getWebGLCanvas();
        }
    }, {
        key: 'drawFrame',
        value: function drawFrame() {
            if (this.options.fixedDt) {
                this.dt = this.options.fixedDt;
            } else {
                this.dt = !this.startTime ? .02 : .001 * (this.currentTime - this.startTime);
            }
            this.startTime = this.currentTime;
            this.currentTime = new Date().getTime();

            this.emit('frameStart');

            if (this.textureManager.isFull()) {
                console.log('clean up');
                this.textureManager.freeUnusedTextureSources();
            }

            this.emit('update');

            if (this.textureAtlas) {
                this.textureAtlas.flush();
            }

            var changes = this.ctx.frame();

            this.adapter.nextFrame(changes);

            this.frameCounter++;
        }
    }, {
        key: 'setGlClearColor',
        value: function setGlClearColor(clearColor) {
            if (Array.isArray(clearColor)) {
                this.options.glClearColor = clearColor;
            } else {
                this.options.glClearColor = StageUtils.getRgbaComponentsNormalized(clearColor);
            }
        }
    }, {
        key: 'createView',
        value: function createView() {
            return new View(this);
        }
    }, {
        key: 'view',
        value: function view(settings) {
            if (settings.isView) return settings;

            var view = void 0;
            if (settings.type) {
                view = new settings.type(this);
            } else {
                view = new View(this);
            }
            view.setSettings(settings);
            return view;
        }
    }, {
        key: 'c',
        value: function c(settings) {
            return this.view(settings);
        }
    }, {
        key: 'texture',
        value: function texture(source, options) {
            return this.textureManager.getTexture(source, options);
        }
    }, {
        key: 'w',
        get: function get() {
            return this.options.w;
        }
    }, {
        key: 'h',
        get: function get() {
            return this.options.h;
        }
    }, {
        key: 'rw',
        get: function get() {
            return this.options.renderWidth;
        }
    }, {
        key: 'rh',
        get: function get() {
            return this.options.renderHeight;
        }
    }]);

    return Stage;
}(Base);

Base.mixinEs5(Stage, EventEmitter);

var ShaderProgram = function () {
    function ShaderProgram(vertexShaderSource, fragmentShaderSource) {
        _classCallCheck(this, ShaderProgram);

        this.vertexShaderSource = vertexShaderSource;
        this.fragmentShaderSource = fragmentShaderSource;

        this._program = null;

        this._uniformLocations = new Map();
        this._attributeLocations = new Map();

        this._currentUniformValues = {};

        this._pendingUniformValues = {};
        this._pendingUniformFunctions = {};
        this._pendingUniformCount = 0;
    }

    _createClass(ShaderProgram, [{
        key: 'compile',
        value: function compile(gl) {
            if (this._program) return;

            this.gl = gl;

            this._program = gl.createProgram();

            var glVertShader = this._glCompile(gl.VERTEX_SHADER, this.vertexShaderSource);
            var glFragShader = this._glCompile(gl.FRAGMENT_SHADER, this.fragmentShaderSource);

            gl.attachShader(this._program, glVertShader);
            gl.attachShader(this._program, glFragShader);
            gl.linkProgram(this._program);

            if (!gl.getProgramParameter(this._program, gl.LINK_STATUS)) {
                console.error('Error: Could not initialize shader.');
                console.error('gl.VALIDATE_STATUS', gl.getProgramParameter(this._program, gl.VALIDATE_STATUS));
                console.error('gl.getError()', gl.getError());

                if (gl.getProgramInfoLog(this._program) !== '') {
                    console.warn('Warning: gl.getProgramInfoLog()', gl.getProgramInfoLog(this._program));
                }

                gl.deleteProgram(this._program);
                this._program = null;
            }

            gl.deleteShader(glVertShader);
            gl.deleteShader(glFragShader);
        }
    }, {
        key: '_glCompile',
        value: function _glCompile(type, src) {
            var shader = this.gl.createShader(type);

            this.gl.shaderSource(shader, src);
            this.gl.compileShader(shader);

            if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
                console.log(this.constructor.name, 'Type: ' + (type === this.gl.VERTEX_SHADER ? 'vertex shader' : 'fragment shader'));
                console.log(this.gl.getShaderInfoLog(shader));
                var idx = 0;
                console.log("========== source ==========\n" + src.split("\n").map(function (line) {
                    return "" + ++idx + ": " + line;
                }).join("\n"));
                return null;
            }

            return shader;
        }
    }, {
        key: 'getUniformLocation',
        value: function getUniformLocation(name) {
            var location = this._uniformLocations.get(name);
            if (location === undefined) {
                location = this.gl.getUniformLocation(this._program, name);
                this._uniformLocations.set(name, location);
            }

            return location;
        }
    }, {
        key: 'getAttribLocation',
        value: function getAttribLocation(name) {
            var location = this._attributeLocations.get(name);
            if (location === undefined) {
                location = this.gl.getAttribLocation(this._program, name);
                this._attributeLocations.set(name, location);
            }

            return location;
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            if (this._program) {
                this.gl.deleteProgram(this._program);
                this._program = null;
            }
        }
    }, {
        key: '_valueEquals',
        value: function _valueEquals(v1, v2) {
            if (v1.length && v2.length) {
                for (var _i7 = 0, n = v1.length; _i7 < n; _i7++) {
                    if (v1[_i7] !== v2[_i7]) return false;
                }
                return true;
            } else {
                return v1 === v2;
            }
        }
    }, {
        key: '_valueClone',
        value: function _valueClone(v) {
            if (v.length) {
                return v.slice(0);
            } else {
                return v;
            }
        }
    }, {
        key: 'setUniformValue',
        value: function setUniformValue(name, value, glFunction) {
            var v = this._currentUniformValues[name];
            if (v === undefined || !this._valueEquals(v, value)) {
                this._pendingUniformValues[name] = this._valueClone(value);
                this._pendingUniformFunctions[name] = glFunction;
                this._pendingUniformCount++;
            } else {
                if (v !== undefined) {
                    if (this._pendingUniformValues[name]) {
                        delete this._pendingUniformValues[name];
                        delete this._pendingUniformFunctions[name];
                        this._pendingUniformCount--;
                    }
                }
            }
        }
    }, {
        key: 'hasUniformUpdates',
        value: function hasUniformUpdates() {
            return this._pendingUniformCount > 0;
        }
    }, {
        key: 'commitUniformUpdates',
        value: function commitUniformUpdates() {
            var _this3 = this;

            var names = Object.keys(this._pendingUniformValues);
            names.forEach(function (name) {
                _this3._currentUniformValues[name] = _this3._pendingUniformValues[name];

                var loc = _this3.getUniformLocation(name);
                if (loc) {
                    var matrix = _this3._pendingUniformFunctions[name] === _this3.gl.uniformMatrix2fv || _this3._pendingUniformFunctions[name] === _this3.gl.uniformMatrix3fv || _this3._pendingUniformFunctions[name] === _this3.gl.uniformMatrix4fv;
                    if (matrix) {
                        _this3._pendingUniformFunctions[name].call(_this3.gl, loc, false, _this3._pendingUniformValues[name]);
                    } else {
                        _this3._pendingUniformFunctions[name].call(_this3.gl, loc, _this3._pendingUniformValues[name]);
                    }
                }
            });
            this._pendingUniformValues = {};
            this._pendingUniformFunctions = {};
            this._pendingUniformCount = 0;
        }
    }, {
        key: 'glProgram',
        get: function get() {
            return this._program;
        }
    }, {
        key: 'compiled',
        get: function get() {
            return !!this._program;
        }
    }]);

    return ShaderProgram;
}();

var ShaderBase = function (_Base2) {
    _inherits(ShaderBase, _Base2);

    function ShaderBase(coreContext) {
        _classCallCheck(this, ShaderBase);

        var _this4 = _possibleConstructorReturn(this, (ShaderBase.__proto__ || Object.getPrototypeOf(ShaderBase)).call(this));

        _this4._program = coreContext.shaderPrograms.get(_this4.constructor);
        if (!_this4._program) {
            _this4._program = new ShaderProgram(_this4.getVertexShaderSource(), _this4.getFragmentShaderSource());

            coreContext.shaderPrograms.set(_this4.constructor, _this4._program);
        }
        _this4._initialized = false;

        _this4.ctx = coreContext;

        _this4.gl = _this4.ctx.gl;

        _this4._views = new Set();
        return _this4;
    }

    _createClass(ShaderBase, [{
        key: 'getVertexShaderSource',
        value: function getVertexShaderSource() {
            return "";
        }
    }, {
        key: 'getFragmentShaderSource',
        value: function getFragmentShaderSource() {
            return "";
        }
    }, {
        key: '_init',
        value: function _init() {
            if (!this._initialized) {
                this._program.compile(this.ctx.gl);
                this._initialized = true;
            }
        }
    }, {
        key: '_uniform',
        value: function _uniform(name) {
            return this._program.getUniformLocation(name);
        }
    }, {
        key: '_attrib',
        value: function _attrib(name) {
            return this._program.getAttribLocation(name);
        }
    }, {
        key: '_setUniform',
        value: function _setUniform(name, value, glFunction) {
            this._program.setUniformValue(name, value, glFunction);
        }
    }, {
        key: 'useProgram',
        value: function useProgram() {
            this._init();
            this.ctx.gl.useProgram(this.glProgram);
            this.beforeUsage();
            this.enableAttribs();
        }
    }, {
        key: 'stopProgram',
        value: function stopProgram() {
            this.afterUsage();
            this.disableAttribs();
        }
    }, {
        key: 'hasSameProgram',
        value: function hasSameProgram(other) {
            return other && (other === this || other._program === this._program);
        }
    }, {
        key: 'beforeUsage',
        value: function beforeUsage() {}
    }, {
        key: 'afterUsage',
        value: function afterUsage() {}
    }, {
        key: 'hasUniformUpdates',
        value: function hasUniformUpdates() {
            return this._program.hasUniformUpdates();
        }
    }, {
        key: 'commitUniformUpdates',
        value: function commitUniformUpdates() {
            this._program.commitUniformUpdates();
        }
    }, {
        key: 'addView',
        value: function addView(viewCore) {
            this._views.add(viewCore);
        }
    }, {
        key: 'removeView',
        value: function removeView(viewCore) {
            this._views.delete(viewCore);
        }
    }, {
        key: 'redraw',
        value: function redraw() {
            this._views.forEach(function (viewCore) {
                viewCore.setHasRenderUpdates(2);
            });
        }
    }, {
        key: 'initialized',
        get: function get() {
            return this._initialized;
        }
    }, {
        key: 'glProgram',
        get: function get() {
            return this._program.glProgram;
        }
    }]);

    return ShaderBase;
}(Base);

var Shader = function (_ShaderBase) {
    _inherits(Shader, _ShaderBase);

    function Shader(coreContext) {
        _classCallCheck(this, Shader);

        var _this5 = _possibleConstructorReturn(this, (Shader.__proto__ || Object.getPrototypeOf(Shader)).call(this, coreContext));

        _this5.isDefault = _this5.constructor === Shader;
        return _this5;
    }

    _createClass(Shader, [{
        key: 'getVertexShaderSource',
        value: function getVertexShaderSource() {
            return Shader.vertexShaderSource;
        }
    }, {
        key: 'getFragmentShaderSource',
        value: function getFragmentShaderSource() {
            return Shader.fragmentShaderSource;
        }
    }, {
        key: 'supportsTextureAtlas',
        value: function supportsTextureAtlas() {
            return this.isDefault;
        }
    }, {
        key: 'enableAttribs',
        value: function enableAttribs() {
            var gl = this.ctx.gl;
            gl.vertexAttribPointer(this._attrib("aVertexPosition"), 2, gl.FLOAT, false, 16, 0);
            gl.enableVertexAttribArray(this._attrib("aVertexPosition"));

            if (this._attrib("aTextureCoord") !== -1) {
                gl.vertexAttribPointer(this._attrib("aTextureCoord"), 2, gl.UNSIGNED_SHORT, true, 16, 2 * 4);
                gl.enableVertexAttribArray(this._attrib("aTextureCoord"));
            }

            if (this._attrib("aColor") !== -1) {
                gl.vertexAttribPointer(this._attrib("aColor"), 4, gl.UNSIGNED_BYTE, true, 16, 3 * 4);
                gl.enableVertexAttribArray(this._attrib("aColor"));
            }
        }
    }, {
        key: 'disableAttribs',
        value: function disableAttribs() {
            var gl = this.ctx.gl;
            gl.disableVertexAttribArray(this._attrib("aVertexPosition"));

            if (this._attrib("aTextureCoord") !== -1) {
                gl.disableVertexAttribArray(this._attrib("aTextureCoord"));
            }

            if (this._attrib("aColor") !== -1) {
                gl.disableVertexAttribArray(this._attrib("aColor"));
            }
        }
    }, {
        key: 'getExtraAttribBytesPerVertex',
        value: function getExtraAttribBytesPerVertex() {
            return 0;
        }
    }, {
        key: 'getVertexAttribPointerOffset',
        value: function getVertexAttribPointerOffset(operation) {
            return operation.extraAttribsDataByteOffset - (operation.index + 1) * 4 * this.getExtraAttribBytesPerVertex();
        }
    }, {
        key: 'useDefault',
        value: function useDefault() {
            return false;
        }
    }, {
        key: 'supportsMerging',
        value: function supportsMerging() {
            return true;
        }
    }, {
        key: 'addEmpty',
        value: function addEmpty() {
            return false;
        }
    }, {
        key: 'setExtraAttribsInBuffer',
        value: function setExtraAttribsInBuffer(operation) {}
    }, {
        key: 'setupUniforms',
        value: function setupUniforms(operation) {
            this._setUniform("projection", this._getProjection(operation), this.ctx.gl.uniform2fv, false);
        }
    }, {
        key: 'isMergable',
        value: function isMergable(shader) {
            return this.hasUniformUpdates();
        }
    }, {
        key: '_getProjection',
        value: function _getProjection(operation) {
            return operation.getProjection();
        }
    }, {
        key: 'getFlipY',
        value: function getFlipY(operation) {
            return this._getProjection()[1] < 0;
        }
    }, {
        key: 'beforeDraw',
        value: function beforeDraw(operation) {}
    }, {
        key: 'draw',
        value: function draw(operation) {
            var gl = this.ctx.gl;

            var length = operation.length;

            if (length) {
                var glTexture = operation.getTexture(0);
                var pos = 0;
                for (var _i8 = 0; _i8 < length; _i8++) {
                    var tx = operation.getTexture(_i8);
                    if (glTexture !== tx) {
                        gl.bindTexture(gl.TEXTURE_2D, glTexture);
                        gl.drawElements(gl.TRIANGLES, 6 * (_i8 - pos), gl.UNSIGNED_SHORT, (pos + operation.index + 1) * 6 * 2);
                        glTexture = tx;
                        pos = _i8;
                    }
                }
                if (pos < length) {
                    gl.bindTexture(gl.TEXTURE_2D, glTexture);
                    gl.drawElements(gl.TRIANGLES, 6 * (length - pos), gl.UNSIGNED_SHORT, (pos + operation.index + 1) * 6 * 2);
                }
            }
        }
    }, {
        key: 'afterDraw',
        value: function afterDraw(operation) {}
    }]);

    return Shader;
}(ShaderBase);

Shader.vertexShaderSource = '\n    #ifdef GL_ES\n    precision lowp float;\n    #endif\n    attribute vec2 aVertexPosition;\n    attribute vec2 aTextureCoord;\n    attribute vec4 aColor;\n    uniform vec2 projection;\n    varying vec2 vTextureCoord;\n    varying vec4 vColor;\n    void main(void){\n        gl_Position = vec4(aVertexPosition.x * projection.x - 1.0, aVertexPosition.y * -abs(projection.y) + 1.0, 0.0, 1.0);\n        vTextureCoord = aTextureCoord;\n        vColor = aColor;\n        gl_Position.y = -sign(projection.y) * gl_Position.y;\n    }\n';

Shader.fragmentShaderSource = '\n    #ifdef GL_ES\n    precision lowp float;\n    #endif\n    varying vec2 vTextureCoord;\n    varying vec4 vColor;\n    uniform sampler2D uSampler;\n    void main(void){\n        gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor;\n    }\n';

Shader.prototype.isShader = true;

var Filter = function (_ShaderBase2) {
    _inherits(Filter, _ShaderBase2);

    function Filter(coreContext) {
        _classCallCheck(this, Filter);

        return _possibleConstructorReturn(this, (Filter.__proto__ || Object.getPrototypeOf(Filter)).call(this, coreContext));
    }

    _createClass(Filter, [{
        key: 'getVertexShaderSource',
        value: function getVertexShaderSource() {
            return Filter.vertexShaderSource;
        }
    }, {
        key: 'getFragmentShaderSource',
        value: function getFragmentShaderSource() {
            return Filter.fragmentShaderSource;
        }
    }, {
        key: 'useDefault',
        value: function useDefault() {
            return false;
        }
    }, {
        key: 'enableAttribs',
        value: function enableAttribs() {
            var gl = this.ctx.gl;
            gl.vertexAttribPointer(this._attrib("aVertexPosition"), 2, gl.FLOAT, false, 16, 0);
            gl.enableVertexAttribArray(this._attrib("aVertexPosition"));

            if (this._attrib("aTextureCoord") !== -1) {
                gl.vertexAttribPointer(this._attrib("aTextureCoord"), 2, gl.UNSIGNED_SHORT, true, 16, 2 * 4);
                gl.enableVertexAttribArray(this._attrib("aTextureCoord"));
            }
        }
    }, {
        key: 'disableAttribs',
        value: function disableAttribs() {
            var gl = this.ctx.gl;
            gl.disableVertexAttribArray(this._attrib("aVertexPosition"));
            if (this._attrib("aTextureCoord") !== -1) {
                gl.disableVertexAttribArray(this._attrib("aTextureCoord"));
            }
        }
    }, {
        key: 'setupUniforms',
        value: function setupUniforms(operation) {
            this._setUniform("resolution", new Float32Array([operation.getRenderWidth(), operation.getRenderHeight()]), this.gl.uniform2fv);
        }
    }, {
        key: 'beforeDraw',
        value: function beforeDraw(operation) {}
    }, {
        key: 'afterDraw',
        value: function afterDraw(operation) {}
    }, {
        key: 'draw',
        value: function draw(operation) {
            var gl = this.gl;
            gl.bindTexture(gl.TEXTURE_2D, operation.source);
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        }
    }, {
        key: 'redraw',
        value: function redraw() {
            this._views.forEach(function (viewCore) {
                viewCore.setHasRenderUpdates(2);

                viewCore._setRecalc(1 + 2 + 4 + 8);
            });
        }
    }]);

    return Filter;
}(ShaderBase);

Filter.prototype.isFilter = true;

Filter.vertexShaderSource = '\n    #ifdef GL_ES\n    precision lowp float;\n    #endif\n    attribute vec2 aVertexPosition;\n    attribute vec2 aTextureCoord;\n    varying vec2 vTextureCoord;\n    void main(void){\n        gl_Position = vec4(aVertexPosition, 0.0, 1.0);\n        vTextureCoord = aTextureCoord;\n    }\n';

Filter.fragmentShaderSource = '\n    #ifdef GL_ES\n    precision lowp float;\n    #endif\n    varying vec2 vTextureCoord;\n    uniform sampler2D uSampler;\n    void main(void){\n        gl_FragColor = texture2D(uSampler, vTextureCoord);\n    }\n';

Filter.prototype.isFilter = true;

var TextureManager = function () {
    function TextureManager(stage) {
        _classCallCheck(this, TextureManager);

        this.stage = stage;

        this.gl = this.stage.gl;

        this._usedTextureMemory = 0;

        this._uploadedTextureSources = [];

        this.textureSourceHashmap = new Map();
    }

    _createClass(TextureManager, [{
        key: 'destroy',
        value: function destroy() {
            for (var _i9 = 0, n = this._uploadedTextureSources.length; _i9 < n; _i9++) {
                var ts = this._uploadedTextureSources[_i9];
                this.gl.deleteTexture(ts.glTexture);
            }
        }
    }, {
        key: 'loadSrcTexture',
        value: function loadSrcTexture(src, ts, sync, cb) {
            if (this.stage.options.srcBasePath) {
                var fc = src.charCodeAt(0);
                if (src.indexOf("//") === -1 && (fc >= 65 && fc <= 90 || fc >= 97 && fc <= 122 || fc == 46)) {
                    src = this.stage.options.srcBasePath + src;
                }
            }
            this.stage.adapter.loadSrcTexture(src, ts, sync, cb);
        }
    }, {
        key: 'loadTextTexture',
        value: function loadTextTexture(settings, ts, sync, cb) {
            if (this.stage.options.text2pngEndpoint && !sync) {
                var src = this.stage.options.text2pngEndpoint + "?q=" + encodeURIComponent(JSON.stringify(settings.getNonDefaults()));
                this.loadSrcTexture(src, ts, sync, cb);
            } else {
                this.stage.adapter.loadTextTexture(settings, ts, sync, cb);
            }
        }
    }, {
        key: 'getTexture',
        value: function getTexture(source, options) {
            var id = options && options.id || null;

            var texture = void 0,
                textureSource = void 0;
            if (Utils.isString(source)) {
                id = id || source;

                textureSource = this.textureSourceHashmap.get(id);
                if (!textureSource) {
                    var self = this;
                    var func = function func(cb, ts, sync) {
                        self.loadSrcTexture(source, ts, sync, cb);
                    };
                    textureSource = this.getTextureSource(func, id);
                    if (!textureSource.renderInfo) {
                        textureSource.renderInfo = { src: source };
                    }
                }
            } else if (source instanceof TextureSource) {
                textureSource = source;
            } else {
                textureSource = this.getTextureSource(source, id);
            }

            texture = new Texture(this, textureSource);
            texture.x = options && options.x || 0;
            texture.y = options && options.y || 0;
            texture.w = options && options.w || 0;
            texture.h = options && options.h || 0;
            texture.clipping = !!(texture.x || texture.y || texture.w || texture.h);
            texture.precision = options && options.precision || 1;
            return texture;
        }
    }, {
        key: 'getTextureSource',
        value: function getTextureSource(func, id) {
            var textureSource = id ? this.textureSourceHashmap.get(id) : null;
            if (!textureSource) {
                textureSource = new TextureSource(this, func);

                if (id) {
                    textureSource.lookupId = id;
                    this.textureSourceHashmap.set(id, textureSource);
                }
            }

            return textureSource;
        }
    }, {
        key: 'uploadTextureSource',
        value: function uploadTextureSource(textureSource, source, format) {
            if (textureSource.glTexture) return;

            var gl = this.gl;
            var sourceTexture = gl.createTexture();
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

            textureSource.glTexture = sourceTexture;

            sourceTexture.w = textureSource.w;
            sourceTexture.h = textureSource.h;

            this._usedTextureMemory += textureSource.w * textureSource.h;

            this._uploadedTextureSources.push(textureSource);
        }
    }, {
        key: 'isFull',
        value: function isFull() {
            return this._usedTextureMemory >= this.stage.options.textureMemory;
        }
    }, {
        key: 'freeUnusedTextureSources',
        value: function freeUnusedTextureSources() {
            var remainingTextureSources = [];
            var usedTextureMemoryBefore = this._usedTextureMemory;
            for (var _i10 = 0, n = this._uploadedTextureSources.length; _i10 < n; _i10++) {
                var ts = this._uploadedTextureSources[_i10];
                if (!ts.permanent && ts.views.size === 0) {
                    this.freeTextureSource(ts);
                } else {
                    remainingTextureSources.push(ts);
                }
            }

            var self = this;
            this.textureSourceHashmap.forEach(function (textureSource) {
                if (textureSource.views.size === 0) {
                    self.freeTextureSource(textureSource);
                }
            });

            this._uploadedTextureSources = remainingTextureSources;
            console.log('freed ' + ((usedTextureMemoryBefore - this._usedTextureMemory) / 1e6).toFixed(2) + 'M texture pixels from GPU memory. Remaining: ' + this._usedTextureMemory);
        }
    }, {
        key: 'freeTextureSource',
        value: function freeTextureSource(textureSource) {
            if (!textureSource.isLoadedByCore()) {
                if (textureSource.glTexture) {
                    this._usedTextureMemory -= textureSource.w * textureSource.h;
                    this.gl.deleteTexture(textureSource.glTexture);
                    textureSource.glTexture = null;
                }

                textureSource.loadingSince = null;

                if (textureSource.lookupId) {
                    this.textureSourceHashmap.delete(textureSource.lookupId);
                }
            }
        }
    }]);

    return TextureManager;
}();

var Texture = function () {
    function Texture(manager, source) {
        _classCallCheck(this, Texture);

        this.manager = manager;

        this.id = Texture.id++;

        this.source = source;
    }

    _createClass(Texture, [{
        key: '_properties',
        value: function _properties() {
            this._x = 0;

            this._y = 0;

            this._w = 0;

            this._h = 0;

            this._precision = 1;

            this.clipping = false;
        }
    }, {
        key: 'enableClipping',
        value: function enableClipping(x, y, w, h) {
            if (this._x !== x || this._y !== y || this._w !== w || this._h !== h) {
                this._x = x;
                this._y = y;
                this._w = w;
                this._h = h;

                this.updateClipping(true);
            }
        }
    }, {
        key: 'disableClipping',
        value: function disableClipping() {
            if (this._x || this._y || this._w || this._h) {
                this._x = 0;
                this._y = 0;
                this._w = 0;
                this._h = 0;

                this.updateClipping(false);
            }
        }
    }, {
        key: 'updateClipping',
        value: function updateClipping(overrule) {
            if (overrule === true || overrule === false) {
                this.clipping = overrule;
            } else {
                this.clipping = !!(this._x || this._y || this._w || this._h);
            }

            var self = this;
            this.source.views.forEach(function (view) {
                if (view.displayedTexture === self) {
                    view.onDisplayedTextureClippingChanged();
                }
            });
        }
    }, {
        key: 'updatePrecision',
        value: function updatePrecision() {
            var self = this;
            this.source.views.forEach(function (view) {
                if (view.displayedTexture === self) {
                    view.onPrecisionChanged();
                }
            });
        }
    }, {
        key: 'replaceTextureSource',
        value: function replaceTextureSource(newSource) {
            var _this7 = this;

            var oldSource = this.source;

            this.source = newSource;

            oldSource.views.forEach(function (view) {
                if (view.texture === _this7 || view.displayedTexture === _this7) {
                    var keep = view.displayedTexture && view.displayedTexture !== _this7 && view.displayedTexture.source === oldSource;
                    keep = keep || view.texture && view.texture !== _this7 && view.texture.source === oldSource;

                    if (!keep) {
                        oldSource.removeView(view);
                    }

                    newSource.addView(view);

                    if (newSource.glTexture) {
                        view.displayedTexture = _this7;
                    }
                }
            });
        }
    }, {
        key: 'getNonDefaults',
        value: function getNonDefaults() {
            var nonDefaults = {};
            if (this.x !== 0) nonDefaults['x'] = this.x;
            if (this.y !== 0) nonDefaults['y'] = this.y;
            if (this.w !== 0) nonDefaults['w'] = this.w;
            if (this.h !== 0) nonDefaults['h'] = this.h;
            if (this.precision !== 1) nonDefaults['precision'] = this.precision;
            return nonDefaults;
        }
    }, {
        key: 'x',
        get: function get() {
            return this._x;
        },
        set: function set(v) {
            if (this._x !== v) {
                this._x = v;
                this.updateClipping();
            }
        }
    }, {
        key: 'y',
        get: function get() {
            return this._y;
        },
        set: function set(v) {
            if (this._y !== v) {
                this._y = v;
                this.updateClipping();
            }
        }
    }, {
        key: 'w',
        get: function get() {
            return this._w;
        },
        set: function set(v) {
            if (this._w !== v) {
                this._w = v;
                this.updateClipping();
            }
        }
    }, {
        key: 'h',
        get: function get() {
            return this._h;
        },
        set: function set(v) {
            if (this._h !== v) {
                this._h = v;
                this.updateClipping();
            }
        }
    }, {
        key: 'precision',
        get: function get() {
            return this._precision;
        },
        set: function set(v) {
            if (this._precision !== v) {
                this._precision = v;
                this.updatePrecision();
            }
        }
    }]);

    return Texture;
}();

Texture.id = 0;

var TextureSource = function (_Base3) {
    _inherits(TextureSource, _Base3);

    function TextureSource(manager, loadCb) {
        _classCallCheck(this, TextureSource);

        var _this8 = _possibleConstructorReturn(this, (TextureSource.__proto__ || Object.getPrototypeOf(TextureSource)).call(this));

        _this8.id = TextureSource.id++;

        _this8.manager = manager;

        _this8.stage = manager.stage;

        _this8.id = TextureSource.id++;

        _this8.loadCb = loadCb;

        _this8.views = new Set();

        return _this8;
    }

    _createClass(TextureSource, [{
        key: '_properties',
        value: function _properties() {
            this.lookupId = null;

            this.cancelCb = null;

            this.loadingSince = 0;

            this.inTextureAtlas = false;

            this.textureAtlasX = 0;

            this.textureAtlasY = 0;

            this.w = 0;
            this.h = 0;

            this.glTexture = null;

            this.permanent = false;

            this.noTextureAtlas = false;

            this.renderInfo = null;
        }
    }, {
        key: 'getRenderWidth',
        value: function getRenderWidth() {
            return this.w;
        }
    }, {
        key: 'getRenderHeight',
        value: function getRenderHeight() {
            return this.h;
        }
    }, {
        key: 'isLoadedByCore',
        value: function isLoadedByCore() {
            return !this.loadCb;
        }
    }, {
        key: 'addView',
        value: function addView(v) {
            if (!this.views.has(v)) {
                this.views.add(v);

                if (this.glTexture) {
                    if (this.stage.textureAtlas && !this.noTextureAtlas) {
                        this.stage.textureAtlas.addActiveTextureSource(this);
                    }
                }

                if (this.views.size === 1) {
                    if (this.lookupId) {
                        if (!this.manager.textureSourceHashmap.has(this.lookupId)) {
                            this.manager.textureSourceHashmap.set(this.lookupId, this);
                        }
                    }

                    this.becomesVisible();
                }
            }
        }
    }, {
        key: 'removeView',
        value: function removeView(v) {
            if (this.views.delete(v)) {
                if (!this.views.size) {
                    if (this.stage.textureAtlas) {
                        this.stage.textureAtlas.removeActiveTextureSource(this);
                    }

                    this.becomesInvisible();
                }
            }
        }
    }, {
        key: 'becomesVisible',
        value: function becomesVisible() {
            this.load(false);
        }
    }, {
        key: 'becomesInvisible',
        value: function becomesInvisible() {
            if (this.isLoading()) {
                if (this.cancelCb) {
                    this.cancelCb(this);
                }
            }
        }
    }, {
        key: 'load',
        value: function load(sync) {
            if (this.isLoadedByCore()) {
                return;
            }

            if (this.isLoading() && sync) {
                if (this.cancelCb) {
                    this.cancelCb(this);
                }
                this.loadingSince = 0;
            }

            if (!this.glTexture && !this.isLoading()) {
                var self = this;
                this.loadingSince = new Date().getTime();
                this.loadCb(function (err, source, options) {
                    if (self.manager.stage.destroyed) {
                        return;
                    }
                    self.loadingSince = 0;
                    if (err) {
                        self.onError(err);
                    } else if (source) {
                        self.setSource(source, options);
                    }
                }, this, !!sync);
            }
        }
    }, {
        key: 'isLoading',
        value: function isLoading() {
            return this.loadingSince > 0;
        }
    }, {
        key: 'setSource',
        value: function setSource(source, options) {
            this.w = source.width || options && options.w || 0;
            this.h = source.height || options && options.h || 0;

            if (this.w > 2048 || this.h > 2048) {
                console.error('Texture size too large: ' + source.width + 'x' + source.height + ' (max allowed is 2048x2048)');
                return;
            }

            if (options && options.renderInfo) {
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
    }, {
        key: 'isVisible',
        value: function isVisible() {
            return this.views.size > 0;
        }
    }, {
        key: 'onLoad',
        value: function onLoad() {
            if (this.isVisible() && this.stage.textureAtlas && !this.noTextureAtlas) {
                this.stage.textureAtlas.addActiveTextureSource(this);
            }

            this.views.forEach(function (view) {
                view.onTextureSourceLoaded();
            });
        }
    }, {
        key: '_changeGlTexture',
        value: function _changeGlTexture(glTexture, w, h) {
            var prevGlTexture = this.glTexture;

            this.glTexture = glTexture;
            this.w = w;
            this.h = h;

            if (!prevGlTexture && this.glTexture) {
                this.views.forEach(function (view) {
                    return view.onTextureSourceLoaded();
                });
            }

            if (!this.glTexture) {
                this.views.forEach(function (view) {
                    view.displayedTexture = null;
                });
            }

            this.views.forEach(function (view) {
                return view._updateDimensions();
            });
        }
    }, {
        key: 'onError',
        value: function onError(e) {
            console.error('texture load error', e, this.id);
            this.views.forEach(function (view) {
                view.onTextureSourceLoadError(e);
            });
        }
    }, {
        key: 'onAddedToTextureAtlas',
        value: function onAddedToTextureAtlas(x, y) {
            this.inTextureAtlas = true;
            this.textureAtlasX = x;
            this.textureAtlasY = y;

            this.views.forEach(function (view) {
                view.onTextureSourceAddedToTextureAtlas();
            });
        }
    }, {
        key: 'onRemovedFromTextureAtlas',
        value: function onRemovedFromTextureAtlas() {
            this.inTextureAtlas = false;
            this.views.forEach(function (view) {
                view.onTextureSourceRemovedFromTextureAtlas();
            });
        }
    }, {
        key: 'free',
        value: function free() {
            this.manager.freeTextureSource(this);
        }
    }]);

    return TextureSource;
}(Base);

TextureSource.id = 1;

var TextureAtlas = function () {
    function TextureAtlas(stage) {
        _classCallCheck(this, TextureAtlas);

        var vertexShaderSrc = '\n            #ifdef GL_ES\n            precision lowp float;\n            #endif\n            attribute vec2 aVertexPosition;\n            attribute vec2 aTextureCoord;\n            uniform mat4 projectionMatrix;\n            varying vec2 vTextureCoord;\n            void main(void){\n                gl_Position = projectionMatrix * vec4(aVertexPosition, 0.0, 1.0);\n                vTextureCoord = aTextureCoord;\n            }\n        ';

        var fragmentShaderSrc = '\n            #ifdef GL_ES\n            precision lowp float;\n            #endif\n            varying vec2 vTextureCoord;\n            uniform sampler2D uSampler;\n            void main(void){\n                gl_FragColor = texture2D(uSampler, vTextureCoord);\n            }\n        ';

        this._program = new ShaderProgram(vertexShaderSrc, fragmentShaderSrc);
        this._program.compile(stage.gl);

        this.stage = stage;

        this.w = 2048;
        this.h = 2048;

        this._activeTree = new TextureAtlasTree(this.w, this.h);

        this._activeTextureSources = new Set();

        this._addedTextureSources = new Set();

        this._wastedPixels = 0;

        this._lastDefragFrame = 0;

        this._pixelsLimit = this.w * this.h / 16;

        this._minWastedPixels = this.w * this.h / 8;

        this._defragNeeded = false;

        this._uploads = [];

        this._init();
    }

    _createClass(TextureAtlas, [{
        key: '_init',
        value: function _init() {
            var gl = this.gl;

            gl.useProgram(this.glProgram);

            this._vertexPositionAttribute = gl.getAttribLocation(this.glProgram, "aVertexPosition");
            this._textureCoordAttribute = gl.getAttribLocation(this.glProgram, "aTextureCoord");

            this._paramsBuffer = new ArrayBuffer(16 * 4 * 9 * 1000);
            this._allCoords = new Float32Array(this._paramsBuffer);
            this._allTexCoords = new Float32Array(this._paramsBuffer);

            this._allIndices = new Uint16Array(6 * 9 * 1000);

            for (var _i11 = 0, j = 0; _i11 < 1000 * 6 * 9; _i11 += 6, j += 4) {
                this._allIndices[_i11] = j;
                this._allIndices[_i11 + 1] = j + 1;
                this._allIndices[_i11 + 2] = j + 2;
                this._allIndices[_i11 + 3] = j;
                this._allIndices[_i11 + 4] = j + 2;
                this._allIndices[_i11 + 5] = j + 3;
            }

            this._indicesGlBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indicesGlBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._allIndices, gl.STATIC_DRAW);

            this._projectionMatrix = new Float32Array([2 / this.w, 0, 0, 0, 0, 2 / this.h, 0, 0, 0, 0, 1, 0, -1, -1, 0, 1]);

            var projectionMatrixAttribute = gl.getUniformLocation(this.glProgram, "projectionMatrix");
            gl.uniformMatrix4fv(projectionMatrixAttribute, false, this._projectionMatrix);

            this.texture = this.gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.texture);

            this.texture.w = this.w;
            this.texture.h = this.h;

            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.w, this.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.bindTexture(gl.TEXTURE_2D, null);

            this.framebuffer = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
            if (gl.getError() != gl.NO_ERROR) {
                throw "Some WebGL error occurred while trying to create framebuffer.";
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            this.gl.deleteTexture(this.texture);
            this.gl.deleteFramebuffer(this.framebuffer);
            this.gl.deleteBuffer(this.paramsGlBuffer);
            this.gl.deleteBuffer(this._indicesGlBuffer);
            this._program.destroy();
        }
    }, {
        key: 'uploadTextureSources',
        value: function uploadTextureSources(textureSources) {
            var i = void 0;

            var n = textureSources.length;
            if (n > 1000) {
                n = 1000;
            }
            for (i = 0; i < n; i++) {

                var w = textureSources[i].w;
                var h = textureSources[i].h;

                var x = textureSources[i].textureAtlasX;
                var y = textureSources[i].textureAtlasY;

                var divW = 1 / w;
                var divH = 1 / h;

                var offset = i * 16 * 9;

                this._allCoords[offset + 0] = x;
                this._allCoords[offset + 1] = y;
                this._allCoords[offset + 4] = x + w;
                this._allCoords[offset + 5] = y;
                this._allCoords[offset + 8] = x + w;
                this._allCoords[offset + 9] = y + h;
                this._allCoords[offset + 12] = x;
                this._allCoords[offset + 13] = y + h;

                this._allCoords[offset + 16] = x;
                this._allCoords[offset + 17] = y - 1;
                this._allCoords[offset + 20] = x + w;
                this._allCoords[offset + 21] = y - 1;
                this._allCoords[offset + 24] = x + w;
                this._allCoords[offset + 25] = y;
                this._allCoords[offset + 28] = x;
                this._allCoords[offset + 29] = y;

                this._allCoords[offset + 32] = x;
                this._allCoords[offset + 33] = y + h;
                this._allCoords[offset + 36] = x + w;
                this._allCoords[offset + 37] = y + h;
                this._allCoords[offset + 40] = x + w;
                this._allCoords[offset + 41] = y + h + 1;
                this._allCoords[offset + 44] = x;
                this._allCoords[offset + 45] = y + h + 1;

                this._allCoords[offset + 48] = x - 1;
                this._allCoords[offset + 49] = y;
                this._allCoords[offset + 52] = x;
                this._allCoords[offset + 53] = y;
                this._allCoords[offset + 56] = x;
                this._allCoords[offset + 57] = y + h;
                this._allCoords[offset + 60] = x - 1;
                this._allCoords[offset + 61] = y + h;

                this._allCoords[offset + 64] = x + w;
                this._allCoords[offset + 65] = y;
                this._allCoords[offset + 68] = x + w + 1;
                this._allCoords[offset + 69] = y;
                this._allCoords[offset + 72] = x + w + 1;
                this._allCoords[offset + 73] = y + h;
                this._allCoords[offset + 76] = x + w;
                this._allCoords[offset + 77] = y + h;

                this._allCoords[offset + 80] = x - 1;
                this._allCoords[offset + 81] = y - 1;
                this._allCoords[offset + 84] = x;
                this._allCoords[offset + 85] = y - 1;
                this._allCoords[offset + 88] = x;
                this._allCoords[offset + 89] = y;
                this._allCoords[offset + 92] = x - 1;
                this._allCoords[offset + 93] = y;

                this._allCoords[offset + 96] = x + w;
                this._allCoords[offset + 97] = y - 1;
                this._allCoords[offset + 100] = x + w + 1;
                this._allCoords[offset + 101] = y - 1;
                this._allCoords[offset + 104] = x + w + 1;
                this._allCoords[offset + 105] = y;
                this._allCoords[offset + 108] = x + w;
                this._allCoords[offset + 109] = y;

                this._allCoords[offset + 112] = x + w;
                this._allCoords[offset + 113] = y + h;
                this._allCoords[offset + 116] = x + w + 1;
                this._allCoords[offset + 117] = y + h;
                this._allCoords[offset + 120] = x + w + 1;
                this._allCoords[offset + 121] = y + h + 1;
                this._allCoords[offset + 124] = x + w;
                this._allCoords[offset + 125] = y + h + 1;

                this._allCoords[offset + 128] = x - 1;
                this._allCoords[offset + 129] = y + h;
                this._allCoords[offset + 132] = x;
                this._allCoords[offset + 133] = y + h;
                this._allCoords[offset + 136] = x;
                this._allCoords[offset + 137] = y + h + 1;
                this._allCoords[offset + 140] = x - 1;
                this._allCoords[offset + 141] = y + h + 1;

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

            var gl = this.gl;
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
            gl.useProgram(this.glProgram);
            gl.viewport(0, 0, this.w, this.h);
            gl.blendFunc(gl.ONE, gl.ZERO);
            gl.enable(gl.BLEND);
            gl.disable(gl.DEPTH_TEST);

            this.paramsGlBuffer = this.paramsGlBuffer || gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.paramsGlBuffer);

            var view = new DataView(this._paramsBuffer, 0, 16 * 9 * 4 * n);
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
    }, {
        key: 'allocate',
        value: function allocate(texture) {
            return this._activeTree.add(texture);
        }
    }, {
        key: 'addActiveTextureSource',
        value: function addActiveTextureSource(textureSource) {
            if (textureSource.id === 1) {} else {
                if (textureSource.w * textureSource.h < this._pixelsLimit) {
                    if (!this._activeTextureSources.has(textureSource)) {
                        this._activeTextureSources.add(textureSource);

                        if (!this._addedTextureSources.has(textureSource)) {
                            this.add(textureSource);
                        }
                    }
                }
            }
        }
    }, {
        key: 'removeActiveTextureSource',
        value: function removeActiveTextureSource(textureSource) {
            if (this._activeTextureSources.has(textureSource)) {
                this._activeTextureSources.delete(textureSource);

                var uploadsIndex = this._uploads.indexOf(textureSource);
                if (uploadsIndex >= 0) {
                    this._uploads.splice(uploadsIndex, 1);

                    textureSource.onRemovedFromTextureAtlas();

                    this._addedTextureSources.delete(textureSource);
                }

                if (this._addedTextureSources.has(textureSource)) {
                    this._wastedPixels += textureSource.w * textureSource.h;
                }
            }
        }
    }, {
        key: 'add',
        value: function add(textureSource) {
            var position = this.allocate(textureSource);
            if (position) {
                this._addedTextureSources.add(textureSource);

                textureSource.onAddedToTextureAtlas(position.x + 1, position.y + 1);

                this._uploads.push(textureSource);
            } else {
                this._defragNeeded = true;

                return false;
            }

            return true;
        }
    }, {
        key: 'defragment',
        value: function defragment() {
            console.log('defragment texture atlas');

            var gl = this.gl;
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
            gl.viewport(0, 0, this.w, this.h);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            this._activeTree.reset();
            this._uploads = [];
            this._wastedPixels = 0;
            this._lastDefragFrame = this.stage.frameCounter;
            this._defragNeeded = false;

            this._addedTextureSources.forEach(function (textureSource) {
                textureSource.onRemovedFromTextureAtlas();
            });

            this._addedTextureSources.clear();

            this.add(this.stage.rectangleTexture.source);

            var self = this;
            this._activeTextureSources.forEach(function (textureSource) {
                self.add(textureSource);
            });
        }
    }, {
        key: 'flush',
        value: function flush() {
            if (this._defragNeeded) {
                if (this._wastedPixels >= this._minWastedPixels) {
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
    }, {
        key: 'glProgram',
        get: function get() {
            return this._program.glProgram;
        }
    }, {
        key: 'gl',
        get: function get() {
            return this._program.gl;
        }
    }]);

    return TextureAtlas;
}();

var TextureAtlasTree = function () {
    function TextureAtlasTree(w, h) {
        _classCallCheck(this, TextureAtlasTree);

        this.w = w;
        this.h = h;

        this.reset();
    }

    _createClass(TextureAtlasTree, [{
        key: 'reset',
        value: function reset() {
            this.root = { x: 0, y: 0, w: this.w, h: this.h };
            this.spaces = new Set([this.root]);
            this.maxH = this.h;
        }
    }, {
        key: 'add',
        value: function add(texture) {
            var w = texture.w + 2;
            var h = texture.h + 2;

            if (h > this.maxH) {
                return false;
            }

            var mp = 0;
            var found = null;
            var maxH = 0;
            this.spaces.forEach(function (n) {
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

            if (!found) {
                return false;
            }

            this.useNode(found, texture);
            return found;
        }
    }, {
        key: 'findNode',
        value: function findNode(node, w, h) {
            if (!node) return null;
            if (!node.o) {
                if (w <= node.w && h <= node.h) {
                    return node;
                } else {
                    return null;
                }
            } else {
                return this.findNode(node.r, w, h) || this.findNode(node.d, w, h);
            }
        }
    }, {
        key: 'useNode',
        value: function useNode(node, texture) {
            var w = texture.w + 2,
                h = texture.h + 2;
            if (node.w > w) {
                node.r = { x: node.x + w, y: node.y, w: node.w - w, h: h };
                this.spaces.add(node.r);
            }
            if (node.h > h) {
                node.d = { x: node.x, y: node.y + h, w: node.w, h: node.h - h };
                this.spaces.add(node.d);
            }
            this.spaces.delete(node);
            node.o = texture;
        }
    }, {
        key: 'getTextures',
        value: function getTextures() {
            var n = [this.root];

            var textures = [];
            var c = 1;
            while (c) {
                var item = n.pop();
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
    }]);

    return TextureAtlasTree;
}();

var View = function () {
    function View(stage) {
        _classCallCheck(this, View);

        EventEmitter.call(this);

        this.id = View.id++;

        this.stage = stage;

        this._core = new ViewCore(this);

        this._texturizer = null;

        this._active = false;

        this._attached = false;

        this._parent = null;

        this._texture = null;

        this._displayedTexture = null;

        this._tags = null;

        this._treeTags = null;

        this._tagsCache = null;

        this._tagToComplex = null;

        this._tagRoot = false;

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

        this._viewText = null;

        this._childList = null;

        this._exposedChildList = null;
    }

    _createClass(View, [{
        key: 'setAsRoot',
        value: function setAsRoot() {
            this._updateActiveFlag();
            this._updateAttachedFlag();
            this._core.setAsRoot();
        }
    }, {
        key: '_setParent',
        value: function _setParent(parent) {
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
        }
    }, {
        key: 'getDepth',
        value: function getDepth() {
            var depth = 0;

            var p = this;
            do {
                depth++;
                p = p._parent;
            } while (p);

            return depth;
        }
    }, {
        key: 'getAncestor',
        value: function getAncestor(l) {
            var p = this;
            while (l > 0 && p._parent) {
                p = p._parent;
                l--;
            }
            return p;
        }
    }, {
        key: 'getAncestorAtDepth',
        value: function getAncestorAtDepth(depth) {
            var levels = this.getDepth() - depth;
            if (levels < 0) {
                return null;
            }
            return this.getAncestor(levels);
        }
    }, {
        key: 'isAncestorOf',
        value: function isAncestorOf(c) {
            var p = c;
            while (p = p.parent) {
                if (this === p) {
                    return true;
                }
            }
            return false;
        }
    }, {
        key: 'getSharedAncestor',
        value: function getSharedAncestor(c) {
            var o1 = this;
            var o2 = c;
            var l1 = o1.getDepth();
            var l2 = o2.getDepth();
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
        }
    }, {
        key: 'isActive',
        value: function isActive() {
            return this._visible && this._alpha > 0 && (this._parent ? this._parent._active : this.stage.root === this);
        }
    }, {
        key: 'isAttached',
        value: function isAttached() {
            return this._parent ? this._parent._attached : this.stage.root === this;
        }
    }, {
        key: '_updateActiveFlag',
        value: function _updateActiveFlag() {
            var newActive = this.isActive();
            if (this._active !== newActive) {
                if (newActive) {
                    this._setActiveFlag();
                } else {
                    this._unsetActiveFlag();
                }

                var children = this._children.get();
                if (children) {
                    var m = children.length;
                    if (m > 0) {
                        for (var _i12 = 0; _i12 < m; _i12++) {
                            children[_i12]._updateActiveFlag();
                        }
                    }
                }

                if (this._eventsCount) {
                    this.emit('active', newActive);
                }
            }
        }
    }, {
        key: '_setActiveFlag',
        value: function _setActiveFlag() {
            var dt = null;
            if (this._texture && this._texture.source.glTexture) {
                dt = this._texture;
                this._texture.source.addView(this);
            } else if (this._displayedTexture && this._displayedTexture.source.glTexture) {
                dt = this._displayedTexture;
            }

            this.displayedTexture = dt;

            this._updateDimensions();
            this._updateTextureCoords();

            this._active = true;

            if (this._texture) {
                this._texture.source.addView(this);
            }

            if (this._displayedTexture && this._displayedTexture !== this._texture) {
                this._displayedTexture.source.addView(this);
            }
        }
    }, {
        key: '_unsetActiveFlag',
        value: function _unsetActiveFlag() {
            if (this._texture) {
                this._texture.source.removeView(this);
            }

            if (this._displayedTexture) {
                this._displayedTexture.source.removeView(this);
            }

            if (this._texturizer) {
                this._texturizer.deactivate();
            }

            this._active = false;
        }
    }, {
        key: '_updateAttachedFlag',
        value: function _updateAttachedFlag() {
            var newAttached = this.isAttached();
            if (this._attached !== newAttached) {
                this._attached = newAttached;

                var children = this._children.get();
                if (children) {
                    var m = children.length;
                    if (m > 0) {
                        for (var _i13 = 0; _i13 < m; _i13++) {
                            children[_i13]._updateAttachedFlag();
                        }
                    }
                }
            }
        }
    }, {
        key: '_getRenderWidth',
        value: function _getRenderWidth() {
            if (this._w) {
                return this._w;
            } else if (this._texture && this._texture.source.glTexture) {
                return this._texture.w || this._texture.source.w / this._texture.precision;
            } else if (this._displayedTexture) {
                return this._displayedTexture.w || this._displayedTexture.source.w / this._displayedTexture.precision;
            } else {
                return 0;
            }
        }
    }, {
        key: '_getRenderHeight',
        value: function _getRenderHeight() {
            if (this._h) {
                return this._h;
            } else if (this._texture && this._texture.source.glTexture) {
                return (this._texture.h || this._texture.source.h) / this._texture.precision;
            } else if (this._displayedTexture) {
                return (this._displayedTexture.h || this._displayedTexture.source.h) / this._displayedTexture.precision;
            } else {
                return 0;
            }
        }
    }, {
        key: 'textureIsLoaded',
        value: function textureIsLoaded() {
            return this.texture ? !!this.texture.source.glTexture : false;
        }
    }, {
        key: 'loadTexture',
        value: function loadTexture(sync) {
            if (this.texture) {
                this.texture.source.load(sync);
            }
        }
    }, {
        key: 'onTextureSourceLoaded',
        value: function onTextureSourceLoaded() {
            this.displayedTexture = this._texture;
        }
    }, {
        key: 'onTextureSourceLoadError',
        value: function onTextureSourceLoadError(e) {
            if (this._eventsCount) {
                this.emit('txError', e, this._texture.source);
            }
        }
    }, {
        key: 'onTextureSourceAddedToTextureAtlas',
        value: function onTextureSourceAddedToTextureAtlas() {
            this._updateTextureCoords();
        }
    }, {
        key: 'onTextureSourceRemovedFromTextureAtlas',
        value: function onTextureSourceRemovedFromTextureAtlas() {
            this._updateTextureCoords();
        }
    }, {
        key: 'onDisplayedTextureClippingChanged',
        value: function onDisplayedTextureClippingChanged() {
            this._updateDimensions();
            this._updateTextureCoords();
        }
    }, {
        key: 'onPrecisionChanged',
        value: function onPrecisionChanged() {
            this._updateDimensions();
        }
    }, {
        key: '_updateDimensions',
        value: function _updateDimensions() {
            var beforeW = this._core.rw;
            var beforeH = this._core.rh;
            var rw = this._getRenderWidth();
            var rh = this._getRenderHeight();
            if (beforeW !== rw || beforeH !== rh) {
                this._core.setDimensions(this._getRenderWidth(), this._getRenderHeight());
                this._updateLocalTranslate();
                return true;
            }
            return false;
        }
    }, {
        key: '_updateLocalTransform',
        value: function _updateLocalTransform() {
            if (this._rotation !== 0 && this._rotation % (2 * Math.PI)) {
                var _sr = Math.sin(this._rotation);
                var _cr = Math.cos(this._rotation);

                this._core.setLocalTransform(_cr * this._scaleX, -_sr * this._scaleY, _sr * this._scaleX, _cr * this._scaleY);
            } else {
                this._core.setLocalTransform(this._scaleX, 0, 0, this._scaleY);
            }
            this._updateLocalTranslate();
        }
    }, {
        key: '_updateLocalTranslate',
        value: function _updateLocalTranslate() {
            var pivotXMul = this._pivotX * this._core.rw;
            var pivotYMul = this._pivotY * this._core.rh;
            var px = this._x - (pivotXMul * this._core.localTa + pivotYMul * this._core.localTb) + pivotXMul;
            var py = this._y - (pivotXMul * this._core.localTc + pivotYMul * this._core.localTd) + pivotYMul;
            px -= this._mountX * this.renderWidth;
            py -= this._mountY * this.renderHeight;
            this._core.setLocalTranslate(px, py);
        }
    }, {
        key: '_updateLocalTranslateDelta',
        value: function _updateLocalTranslateDelta(dx, dy) {
            this._core.addLocalTranslate(dx, dy);
        }
    }, {
        key: '_updateLocalAlpha',
        value: function _updateLocalAlpha() {
            this._core.setLocalAlpha(this._visible ? this._alpha : 0);
        }
    }, {
        key: '_updateTextureCoords',
        value: function _updateTextureCoords() {
            if (this.displayedTexture && this.displayedTexture.source) {
                var displayedTexture = this.displayedTexture;
                var displayedTextureSource = this.displayedTexture.source;

                var tx1 = 0,
                    ty1 = 0,
                    tx2 = 1.0,
                    ty2 = 1.0;
                if (displayedTexture.clipping) {
                    var w = displayedTextureSource.getRenderWidth();
                    var h = displayedTextureSource.getRenderHeight();
                    var iw = void 0,
                        ih = void 0,
                        rw = void 0,
                        rh = void 0;
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

                var inTextureAtlas = this._core.allowTextureAtlas() && displayedTextureSource.inTextureAtlas;
                if (inTextureAtlas) {
                    var textureAtlasI = 0.000488281;

                    var tax = displayedTextureSource.textureAtlasX * textureAtlasI;
                    var tay = displayedTextureSource.textureAtlasY * textureAtlasI;
                    var dax = displayedTextureSource.w * textureAtlasI;
                    var day = displayedTextureSource.h * textureAtlasI;

                    tx1 = tx1 * dax + tax;
                    ty1 = ty1 * dax + tay;

                    tx2 = tx2 * dax + tax;
                    ty2 = ty2 * day + tay;
                }

                this._core.setTextureCoords(tx1, ty1, tx2, ty2);
                this._core.setInTextureAtlas(inTextureAtlas);
            }
        }
    }, {
        key: 'getCornerPoints',
        value: function getCornerPoints() {
            return this._core.getCornerPoints();
        }
    }, {
        key: '_clearTagsCache',
        value: function _clearTagsCache(tag) {
            if (this._tagsCache) {
                this._tagsCache.delete(tag);

                if (this._tagToComplex) {
                    var s = this._tagToComplex.get(tag);
                    if (s) {
                        for (var _i14 = 0, n = s.length; _i14 < n; _i14++) {
                            this._tagsCache.delete(s[_i14]);
                        }
                        this._tagToComplex.delete(tag);
                    }
                }
            }
        }
    }, {
        key: '_unsetTagsParent',
        value: function _unsetTagsParent() {
            var tags = null;
            var n = 0;
            if (!this._tagRoot && this._treeTags) {
                tags = Utils.iteratorToArray(this._treeTags.keys());
                n = tags.length;

                if (n > 0) {
                    for (var _i15 = 0; _i15 < n; _i15++) {
                        var tagSet = this._treeTags.get(tags[_i15]);

                        var _p = this;

                        var _loop = function _loop() {
                            var parentTreeTags = _p._treeTags.get(tags[_i15]);

                            tagSet.forEach(function (comp) {
                                parentTreeTags.delete(comp);
                            });

                            _p._clearTagsCache(tags[_i15]);
                        };

                        while ((_p = _p._parent) && !_p._tagRoot) {
                            _loop();
                        }
                    }
                }
            }
        }
    }, {
        key: '_setTagsParent',
        value: function _setTagsParent() {
            if (!this._tagRoot && this._treeTags && this._treeTags.size) {
                var self = this;
                this._treeTags.forEach(function (tagSet, tag) {
                    var p = self;

                    var _loop2 = function _loop2() {
                        if (!p._treeTags) {
                            p._treeTags = new Map();
                        }

                        var s = p._treeTags.get(tag);
                        if (!s) {
                            s = new Set();
                            p._treeTags.set(tag, s);
                        }

                        tagSet.forEach(function (comp) {
                            s.add(comp);
                        });

                        p._clearTagsCache(tag);
                    };

                    while ((p = p._parent) && !p._tagRoot) {
                        _loop2();
                    }
                });
            }
        }
    }, {
        key: '_getByTag',
        value: function _getByTag(tag) {
            if (!this._treeTags) {
                return [];
            }
            var t = this._treeTags.get(tag);
            return t ? Utils.setToArray(t) : [];
        }
    }, {
        key: 'getTags',
        value: function getTags() {
            return this._tags ? this._tags : [];
        }
    }, {
        key: 'setTags',
        value: function setTags(tags) {
            var i = void 0,
                n = tags.length;
            var removes = [];
            var adds = [];
            for (i = 0; i < n; i++) {
                if (!this.hasTag(tags[i])) {
                    adds.push(tags[i]);
                }
            }

            var currentTags = this.tags || [];
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
    }, {
        key: 'addTag',
        value: function addTag(tag) {
            if (!this._tags) {
                this._tags = [];
            }
            if (this._tags.indexOf(tag) === -1) {
                this._tags.push(tag);

                var _p2 = this;
                do {
                    if (!_p2._treeTags) {
                        _p2._treeTags = new Map();
                    }

                    var _s = _p2._treeTags.get(tag);
                    if (!_s) {
                        _s = new Set();
                        _p2._treeTags.set(tag, _s);
                    }

                    _s.add(this);

                    _p2._clearTagsCache(tag);
                } while (_p2 = _p2._parent);
            }
        }
    }, {
        key: 'removeTag',
        value: function removeTag(tag) {
            var i = this._tags.indexOf(tag);
            if (i !== -1) {
                this._tags.splice(i, 1);

                var _p3 = this;
                do {
                    var list = _p3._treeTags.get(tag);
                    if (list) {
                        list.delete(this);

                        _p3._clearTagsCache(tag);
                    }
                } while (_p3 = _p3._parent);
            }
        }
    }, {
        key: 'hasTag',
        value: function hasTag(tag) {
            return this._tags && this._tags.indexOf(tag) !== -1;
        }
    }, {
        key: '_tag',
        value: function _tag(tag) {
            var res = this.mtag(tag);
            return res[0];
        }
    }, {
        key: 'mtag',
        value: function mtag(tag) {
            var res = null;
            if (this._tagsCache) {
                res = this._tagsCache.get(tag);
            }

            if (!res) {
                var idx = tag.indexOf(".");
                if (idx >= 0) {
                    var parts = tag.split('.');
                    res = this._getByTag(parts[0]);
                    var level = 1;
                    var c = parts.length;
                    while (res.length && level < c) {
                        var resn = [];
                        for (var j = 0, n = res.length; j < n; j++) {
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
        }
    }, {
        key: 'stag',
        value: function stag(tag, settings) {
            var t = this.mtag(tag);
            var n = t.length;
            for (var _i16 = 0; _i16 < n; _i16++) {
                t[_i16].setSettings(settings);
            }
        }
    }, {
        key: 'getLocationString',
        value: function getLocationString() {
            var i = void 0;
            if (this._parent) {
                i = this._parent._children.getIndex(this);
                if (i >= 0) {
                    var localTags = this.getTags();
                    return this._parent.getLocationString() + ":" + i + "[" + this.id + "]" + (localTags.length ? "(" + localTags.join(",") + ")" : "");
                }
            }
            return "";
        }
    }, {
        key: 'toString',
        value: function toString() {
            var obj = this.getSettings();
            return View.getPrettyString(obj, "");
        }
    }, {
        key: 'getSettings',
        value: function getSettings() {
            var settings = this.getNonDefaults();

            var children = this._children.get();
            if (children) {
                var n = children.length;
                settings.children = [];
                for (var _i17 = 0; _i17 < n; _i17++) {
                    settings.children.push(children[_i17].getSettings());
                }
            }

            return settings;
        }
    }, {
        key: 'getNonDefaults',
        value: function getNonDefaults() {
            var settings = {};

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

            if (this._core.colorUl === this._core.colorUr && this._core.colorBl === this._core.colorBr && this._core.colorUl === this._core.colorBl) {
                if (this._core.colorUl !== 0xFFFFFFFF) settings.color = 0xFFFFFFFF;
            } else {
                if (this._core.colorUl !== 0xFFFFFFFF) settings.colorUl = 0xFFFFFFFF;
                if (this._core.colorUr !== 0xFFFFFFFF) settings.colorUr = 0xFFFFFFFF;
                if (this._core.colorBl !== 0xFFFFFFFF) settings.colorBl = 0xFFFFFFFF;
                if (this._core.colorBr !== 0xFFFFFFFF) settings.colorBr = 0xFFFFFFFF;
            }

            if (!this._visible) settings.visible = false;

            if (this._core.zIndex) settings.zIndex = this._core.zIndex;

            if (this._core.forceZIndexContext) settings.forceZIndexContext = true;

            if (this._core.clipping) settings.clipping = this._core.clipping;

            if (this.rect) {
                settings.rect = true;
            } else if (this.src) {
                settings.src = this.src;
            } else if (this.texture && this._viewText) {
                settings.text = this._viewText.settings.getNonDefaults();
            }

            if (this._texture) {
                var tnd = this._texture.getNonDefaults();
                if (Object.keys(tnd).length) {
                    settings.texture = tnd;
                }
            }

            if (this._texturizer) {
                if (this._texturizer.enabled) {
                    settings.renderToTexture = this._texturizer.enabled;
                }
                if (this._texturizer.lazy) {
                    settings.renderToTextureLazy = this._texturizer.lazy;
                }
                if (this._texturizer.colorize) {
                    settings.colorizeResultTexture = this._texturizer.colorize;
                }
                if (this._texturizer.hideResult) {
                    settings.hideResultTexture = this._texturizer.hideResult;
                }
            }

            return settings;
        }
    }, {
        key: 'setSettings',
        value: function setSettings(settings) {
            Base.setObjectSettings(this, settings);
        }
    }, {
        key: '_getExposedChildList',
        value: function _getExposedChildList() {
            return this._children;
        }
    }, {
        key: 'getChildren',
        value: function getChildren() {
            return this.childList.get();
        }
    }, {
        key: 'addChild',
        value: function addChild(child) {
            return this.childList.add(child);
        }
    }, {
        key: 'addChildAt',
        value: function addChildAt(child, index) {
            return this.childList.addAt(child, index);
        }
    }, {
        key: 'getChildIndex',
        value: function getChildIndex(child) {
            return this.childList.getIndex(child);
        }
    }, {
        key: 'removeChild',
        value: function removeChild(child) {
            return this.childList.remove(child);
        }
    }, {
        key: 'removeChildAt',
        value: function removeChildAt(index) {
            return this.childList.removeAt(index);
        }
    }, {
        key: 'removeChildren',
        value: function removeChildren() {
            return this.childList.clear();
        }
    }, {
        key: 'add',
        value: function add(o) {
            return this.childList.a(o);
        }
    }, {
        key: 'getResultTextureSource',
        value: function getResultTextureSource() {
            return this.texturizer.getResultTextureSource();
        }
    }, {
        key: 'animation',
        value: function animation(settings) {
            return this.stage.animations.createAnimation(this, settings);
        }
    }, {
        key: 'transition',
        value: function transition(property, settings) {
            if (settings === undefined) {
                return this._getTransition(property);
            } else {
                this._setTransition(property, settings);
                return null;
            }
        }
    }, {
        key: 'fastForward',
        value: function fastForward(property) {
            if (this._transitions) {
                var t = this._transitions[property];
                if (t && t.isTransition) {
                    t.finish();
                }
            }
        }
    }, {
        key: '_getTransition',
        value: function _getTransition(property) {
            if (!this._transitions) {
                this._transitions = {};
            }
            var t = this._transitions[property];
            if (!t) {
                t = new Transition(this.stage.transitions, this.stage.transitions.defaultTransitionSettings, this, property);
            } else if (t.isTransitionSettings) {
                t = new Transition(this.stage.transitions, t, this, property);
            }
            this._transitions[property] = t;
            return t;
        }
    }, {
        key: '_setTransition',
        value: function _setTransition(property, settings) {
            if (!settings) {
                this._removeTransition(property);
            }
            if (Utils.isObjectLiteral(settings)) {
                settings = this.stage.transitions.createSettings(settings);
            }

            if (!this._transitions) {
                this._transitions = {};
            }

            var current = this._transitions[property];
            if (current && current.isTransition) {
                current.settings = settings;
                return current;
            } else {
                this._transitions[property] = settings;
            }
        }
    }, {
        key: '_removeTransition',
        value: function _removeTransition(property) {
            if (this._transitions) {
                delete this._transitions[property];
            }
        }
    }, {
        key: 'getSmooth',
        value: function getSmooth(property, v) {
            var t = this._getTransition(property);
            if (t && t.isActive()) {
                return t.targetValue;
            } else {
                return v;
            }
        }
    }, {
        key: 'setSmooth',
        value: function setSmooth(property, v, settings) {
            if (settings) {
                this._setTransition(property, settings);
            }
            var t = this._getTransition(property);
            t.start(v);
            return t;
        }
    }, {
        key: 'isNumberProperty',
        value: function isNumberProperty(property) {
            return View.isNumberProperty(property, this.constructor);
        }
    }, {
        key: 'isColorProperty',
        value: function isColorProperty(property) {
            return View.isColorProperty(property, this.constructor);
        }
    }, {
        key: 'active',
        get: function get() {
            return this._active;
        }
    }, {
        key: 'attached',
        get: function get() {
            return this._attached;
        }
    }, {
        key: 'renderWidth',
        get: function get() {
            if (this._active) {
                return this._core._rw;
            } else {
                return this._getRenderWidth();
            }
        }
    }, {
        key: 'renderHeight',
        get: function get() {
            if (this._active) {
                return this._core._rh;
            } else {
                return this._getRenderHeight();
            }
        }
    }, {
        key: 'texture',
        get: function get() {
            return this._texture;
        },
        set: function set(v) {
            if (v && Utils.isObjectLiteral(v)) {
                if (this.texture) {
                    Base.setObjectSettings(this.texture, v);
                } else {
                    console.warn('Trying to set texture properties, but there is no texture.');
                }
                return;
            }

            var prevValue = this._texture;
            if (v !== prevValue) {
                if (v !== null) {
                    if (v instanceof TextureSource) {
                        v = this.stage.texture(v);
                    } else if (!v instanceof Texture) {
                        console.error('incorrect value for texture');
                        return;
                    }
                }

                this._texture = v;

                if (this._active && prevValue && this.displayedTexture !== prevValue) {
                    if ((!v || prevValue.source !== v.source) && (!this.displayedTexture || this.displayedTexture.source !== prevValue.source)) {
                        prevValue.source.removeView(this);
                    }
                }

                if (v) {
                    if (this._active) {
                        v.source.addView(this);
                    }

                    if (v.source.glTexture) {
                        this.displayedTexture = v;
                    }
                } else {
                    this.displayedTexture = null;
                }
            }
        }
    }, {
        key: 'displayedTexture',
        get: function get() {
            return this._displayedTexture;
        },
        set: function set(v) {
            var prevValue = this._displayedTexture;
            if (v !== prevValue) {
                if (this._active && prevValue) {

                    if (prevValue !== this._texture) {
                        if (!v || prevValue.source !== v.source) {
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

                    this._updateTextureCoords();
                    this._core.setDisplayedTextureSource(v.source);
                } else {
                    if (this._eventsCount) {
                        this.emit('txUnloaded', v);
                    }

                    this._core.setDisplayedTextureSource(null);
                }
            }
        }
    }, {
        key: 'tag',
        get: function get() {
            return this._tag;
        },
        set: function set(t) {
            this.tags = t;
        }
    }, {
        key: 'tagRoot',
        get: function get() {
            return this._tagRoot;
        },
        set: function set(v) {
            if (this._tagRoot !== v) {
                if (!v) {
                    this._setTagsParent();
                } else {
                    this._unsetTagsParent();
                }

                this._tagRoot = v;
            }
        }
    }, {
        key: 'x',
        get: function get() {
            return this._x;
        },
        set: function set(v) {
            if (this._x !== v) {
                this._updateLocalTranslateDelta(v - this._x, 0);
                this._x = v;
            }
        }
    }, {
        key: 'y',
        get: function get() {
            return this._y;
        },
        set: function set(v) {
            if (this._y !== v) {
                this._updateLocalTranslateDelta(0, v - this._y);
                this._y = v;
            }
        }
    }, {
        key: 'w',
        get: function get() {
            return this._w;
        },
        set: function set(v) {
            if (this._w !== v) {
                this._w = v;
                this._updateDimensions();
            }
        }
    }, {
        key: 'h',
        get: function get() {
            return this._h;
        },
        set: function set(v) {
            if (this._h !== v) {
                this._h = v;
                this._updateDimensions();
            }
        }
    }, {
        key: 'scaleX',
        get: function get() {
            return this._scaleX;
        },
        set: function set(v) {
            if (this._scaleX !== v) {
                this._scaleX = v;
                this._updateLocalTransform();
            }
        }
    }, {
        key: 'scaleY',
        get: function get() {
            return this._scaleY;
        },
        set: function set(v) {
            if (this._scaleY !== v) {
                this._scaleY = v;
                this._updateLocalTransform();
            }
        }
    }, {
        key: 'scale',
        get: function get() {
            return this._scaleX;
        },
        set: function set(v) {
            if (this._scaleX !== v || this._scaleY !== v) {
                this._scaleX = v;
                this._scaleY = v;
                this._updateLocalTransform();
            }
        }
    }, {
        key: 'pivotX',
        get: function get() {
            return this._pivotX;
        },
        set: function set(v) {
            if (this._pivotX !== v) {
                this._pivotX = v;
                this._updateLocalTranslate();
            }
        }
    }, {
        key: 'pivotY',
        get: function get() {
            return this._pivotY;
        },
        set: function set(v) {
            if (this._pivotY !== v) {
                this._pivotY = v;
                this._updateLocalTranslate();
            }
        }
    }, {
        key: 'pivot',
        get: function get() {
            return this._pivotX;
        },
        set: function set(v) {
            if (this._pivotX !== v || this._pivotY !== v) {
                this._pivotX = v;
                this._pivotY = v;
                this._updateLocalTranslate();
            }
        }
    }, {
        key: 'mountX',
        get: function get() {
            return this._mountX;
        },
        set: function set(v) {
            if (this._mountX !== v) {
                this._mountX = v;
                this._updateLocalTranslate();
            }
        }
    }, {
        key: 'mountY',
        get: function get() {
            return this._mountY;
        },
        set: function set(v) {
            if (this._mountY !== v) {
                this._mountY = v;
                this._updateLocalTranslate();
            }
        }
    }, {
        key: 'mount',
        get: function get() {
            return this._mountX;
        },
        set: function set(v) {
            if (this._mountX !== v || this._mountY !== v) {
                this._mountX = v;
                this._mountY = v;
                this._updateLocalTranslate();
            }
        }
    }, {
        key: 'alpha',
        get: function get() {
            return this._alpha;
        },
        set: function set(v) {
            v = v > 1 ? 1 : v < 1e-14 ? 0 : v;
            if (this._alpha !== v) {
                var prev = this._alpha;
                this._alpha = v;
                this._updateLocalAlpha();
                if (prev === 0 !== (v === 0)) this._updateActiveFlag();
            }
        }
    }, {
        key: 'rotation',
        get: function get() {
            return this._rotation;
        },
        set: function set(v) {
            if (this._rotation !== v) {
                this._rotation = v;
                this._updateLocalTransform();
            }
        }
    }, {
        key: 'colorUl',
        get: function get() {
            return this._core.colorUl;
        },
        set: function set(v) {
            this._core.colorUl = v;
        }
    }, {
        key: 'colorUr',
        get: function get() {
            return this._core.colorUr;
        },
        set: function set(v) {
            this._core.colorUr = v;
        }
    }, {
        key: 'colorBl',
        get: function get() {
            return this._core.colorBl;
        },
        set: function set(v) {
            this._core.colorBl = v;
        }
    }, {
        key: 'colorBr',
        get: function get() {
            return this._core.colorBr;
        },
        set: function set(v) {
            this._core.colorBr = v;
        }
    }, {
        key: 'color',
        get: function get() {
            return this._core.colorUl;
        },
        set: function set(v) {
            if (this.colorUl !== v || this.colorUr !== v || this.colorBl !== v || this.colorBr !== v) {
                this.colorUl = v;
                this.colorUr = v;
                this.colorBl = v;
                this.colorBr = v;
            }
        }
    }, {
        key: 'colorTop',
        get: function get() {
            return this.colorUl;
        },
        set: function set(v) {
            if (this.colorUl !== v || this.colorUr !== v) {
                this.colorUl = v;
                this.colorUr = v;
            }
        }
    }, {
        key: 'colorBottom',
        get: function get() {
            return this.colorBl;
        },
        set: function set(v) {
            if (this.colorBl !== v || this.colorBr !== v) {
                this.colorBl = v;
                this.colorBr = v;
            }
        }
    }, {
        key: 'colorLeft',
        get: function get() {
            return this.colorUl;
        },
        set: function set(v) {
            if (this.colorUl !== v || this.colorBl !== v) {
                this.colorUl = v;
                this.colorBl = v;
            }
        }
    }, {
        key: 'colorRight',
        get: function get() {
            return this.colorUr;
        },
        set: function set(v) {
            if (this.colorUr !== v || this.colorBr !== v) {
                this.colorUr = v;
                this.colorBr = v;
            }
        }
    }, {
        key: 'visible',
        get: function get() {
            return this._visible;
        },
        set: function set(v) {
            if (this._visible !== v) {
                this._visible = v;
                this._updateLocalAlpha();
                this._updateActiveFlag();
            }
        }
    }, {
        key: 'zIndex',
        get: function get() {
            return this._core.zIndex;
        },
        set: function set(v) {
            var prev = this._core.zIndex;
            this._core.zIndex = v;
        }
    }, {
        key: 'forceZIndexContext',
        get: function get() {
            return this._core.forceZIndexContext;
        },
        set: function set(v) {
            this._core.forceZIndexContext = v;
        }
    }, {
        key: 'clipping',
        get: function get() {
            return this._core.clipping;
        },
        set: function set(v) {
            this._core.clipping = v;
        }
    }, {
        key: 'tags',
        get: function get() {
            return this.getTags();
        },
        set: function set(v) {
            if (!Array.isArray(v)) v = [v];
            this.setTags(v);
        }
    }, {
        key: 't',
        set: function set(v) {
            this.tags = v;
        }
    }, {
        key: '_children',
        get: function get() {
            if (!this._childList) {
                this._childList = new ViewChildList(this, false);
            }
            return this._childList;
        }
    }, {
        key: '_lchildren',
        get: function get() {
            return this._childList.get();
        }
    }, {
        key: 'childList',
        get: function get() {
            if (!this._exposedChildList) {
                this._exposedChildList = this._getExposedChildList();
            }
            return this._exposedChildList;
        }
    }, {
        key: 'children',
        get: function get() {
            return this.childList.get();
        },
        set: function set(children) {
            this.childList.set(children);
        }
    }, {
        key: 'parent',
        get: function get() {
            return this._parent;
        }
    }, {
        key: 'src',
        get: function get() {
            if (this.texture && this.texture.source && this.texture.source.renderInfo && this.texture.source.renderInfo.src) {
                return this.texture.source.renderInfo.src;
            } else {
                return null;
            }
        },
        set: function set(v) {
            if (!v) {
                this.texture = null;
            } else if (!this.texture || !this.texture.source.renderInfo || this.texture.source.renderInfo.src !== v) {
                this.texture = this.stage.textureManager.getTexture(v);
            }
        }
    }, {
        key: 'rect',
        get: function get() {
            return this.texture === this.stage.rectangleTexture;
        },
        set: function set(v) {
            if (v) {
                this.texture = this.stage.rectangleTexture;
            } else {
                this.texture = null;
            }
        }
    }, {
        key: 'text',
        get: function get() {
            if (!this._viewText) {
                this._viewText = new ViewText(this);
            }

            return this._viewText.settings;
        },
        set: function set(v) {
            if (!this._viewText) {
                this._viewText = new ViewText(this);
            }
            if (Utils.isString(v)) {
                this._viewText.settings.text = v;
            } else {
                this._viewText.settings.setSettings(v);
            }
        }
    }, {
        key: 'visitEntry',
        set: function set(f) {
            this._core.visitEntry = f;
        }
    }, {
        key: 'visitExit',
        set: function set(f) {
            this._core.visitExit = f;
        }
    }, {
        key: 'shader',
        get: function get() {
            return this._core.shader;
        },
        set: function set(v) {
            var shader = void 0;
            if (Utils.isObjectLiteral(v)) {
                if (v.type) {
                    shader = new v.type(this.stage.ctx);
                } else {
                    shader = this.shader;
                }

                if (shader) {
                    shader.setSettings(v);
                }
            } else if (v === null) {
                shader = this.stage.ctx.renderState.defaultShader;
            } else {
                if (v.isShader) {
                    shader = v;
                } else {
                    console.error("Please specify a shader type.");
                    return;
                }
            }
            this._core.shader = shader;
        }
    }, {
        key: 'renderToTexture',
        get: function get() {
            return this._texturizer && this.texturizer.enabled;
        },
        set: function set(v) {
            this.texturizer.enabled = v;
        }
    }, {
        key: 'renderToTextureLazy',
        get: function get() {
            return this._texturizer && this.texturizer.lazy;
        },
        set: function set(v) {
            this.texturizer.lazy = v;
        }
    }, {
        key: 'hideResultTexture',
        get: function get() {
            return this._texturizer && this.texturizer.hideResult;
        },
        set: function set(v) {
            this.texturizer.hideResult = v;
        }
    }, {
        key: 'colorizeResultTexture',
        get: function get() {
            return this._texturizer && this.texturizer.colorize;
        },
        set: function set(v) {
            this.texturizer.colorize = v;
        }
    }, {
        key: 'filters',
        get: function get() {
            return this.texturizer.filters;
        },
        set: function set(v) {
            this.texturizer.filters = v;
        }
    }, {
        key: 'texturizer',
        get: function get() {
            return this._core.texturizer;
        }
    }, {
        key: 'transitions',
        set: function set(object) {
            var _this9 = this;

            var keys = Object.keys(object);
            keys.forEach(function (property) {
                _this9.transition(property, object[property]);
            });
        }
    }, {
        key: 'X',
        get: function get() {
            return this.getSmooth('x', this.x);
        },
        set: function set(v) {
            this.setSmooth('x', v);
        }
    }, {
        key: 'Y',
        get: function get() {
            return this.getSmooth('y', this.y);
        },
        set: function set(v) {
            this.setSmooth('y', v);
        }
    }, {
        key: 'W',
        get: function get() {
            return this.getSmooth('w', this.w);
        },
        set: function set(v) {
            return this.setSmooth('w', v);
        }
    }, {
        key: 'H',
        get: function get() {
            return this.getSmooth('h', this.h);
        },
        set: function set(v) {
            this.setSmooth('h', v);
        }
    }, {
        key: 'SCALE',
        get: function get() {
            return this.getSmooth('scale', this.scale);
        },
        set: function set(v) {
            this.setSmooth('scale', v);
        }
    }, {
        key: 'SCALEX',
        get: function get() {
            return this.getSmooth('scaleX', this.scaleX);
        },
        set: function set(v) {
            this.setSmooth('scaleX', v);
        }
    }, {
        key: 'PIVOT',
        get: function get() {
            return this.getSmooth('pivot', this.pivot);
        },
        set: function set(v) {
            this.setSmooth('pivot', v);
        }
    }, {
        key: 'PIVOTX',
        get: function get() {
            return this.getSmooth('pivotX', this.pivotX);
        },
        set: function set(v) {
            this.setSmooth('pivotX', v);
        }
    }, {
        key: 'MOUNT',
        get: function get() {
            return this.getSmooth('mount', this.mount);
        },
        set: function set(v) {
            this.setSmooth('mount', v);
        }
    }, {
        key: 'MOUNTX',
        get: function get() {
            return this.getSmooth('mountX', this.mountX);
        },
        set: function set(v) {
            this.setSmooth('mountX', v);
        }
    }, {
        key: 'ALPHA',
        get: function get() {
            return this.getSmooth('alpha', this.alpha);
        },
        set: function set(v) {
            this.setSmooth('alpha', v);
        }
    }, {
        key: 'ROTATION',
        get: function get() {
            return this.getSmooth('rotation', this.rotation);
        },
        set: function set(v) {
            this.setSmooth('rotation', v);
        }
    }, {
        key: 'COLOR',
        get: function get() {
            return this.getSmooth('color', this.color);
        },
        set: function set(v) {
            this.setSmooth('color', v);
        }
    }, {
        key: 'COLORTOP',
        set: function set(v) {
            this.setSmooth('colorTop', v);
        }
    }, {
        key: 'COLORBOTTOM',
        set: function set(v) {
            this.setSmooth('colorBottom', v);
        }
    }, {
        key: 'COLORLEFT',
        set: function set(v) {
            this.setSmooth('colorLeft', v);
        }
    }, {
        key: 'COLORRIGHT',
        set: function set(v) {
            this.setSmooth('colorRight', v);
        }
    }, {
        key: 'COLORUL',
        get: function get() {
            return this.getSmooth('colorUl', this.colorUl);
        },
        set: function set(v) {
            this.setSmooth('colorUl', v);
        }
    }, {
        key: 'COLORUR',
        get: function get() {
            return this.getSmooth('colorUr', this.colorUr);
        },
        set: function set(v) {
            this.setSmooth('colorUr', v);
        }
    }, {
        key: 'COLORBL',
        get: function get() {
            return this.getSmooth('colorBl', this.colorBl);
        },
        set: function set(v) {
            this.setSmooth('colorBl', v);
        }
    }, {
        key: 'COLORBR',
        get: function get() {
            return this.getSmooth('colorBr', this.colorBr);
        },
        set: function set(v) {
            this.setSmooth('colorBr', v);
        }
    }], [{
        key: 'getPrettyString',
        value: function getPrettyString(obj, indent) {
            var children = obj.children;
            delete obj.children;

            var colorKeys = ["color", "colorUl", "colorUr", "colorBl", "colorBr"];
            var str = JSON.stringify(obj, function (k, v) {
                if (colorKeys.indexOf(k) !== -1) {
                    return "COLOR[" + v.toString(16) + "]";
                }
                return v;
            });
            str = str.replace(/"COLOR\[([a-f0-9]{1,8})\]"/g, "0x$1");

            if (children && children.length) {
                var isEmpty = str === "{}";
                str = str.substr(0, str.length - 1) + (isEmpty ? "" : ",") + "\"children\":[\n";
                var n = children.length;
                for (var _i18 = 0; _i18 < n; _i18++) {
                    str += View.getPrettyString(children[_i18], indent + "  ") + (_i18 < n - 1 ? "," : "") + "\n";
                }
                str += indent + "]}";
            }

            return indent + str;
        }
    }, {
        key: 'getGetter',
        value: function getGetter(propertyPath) {
            var getter = View.PROP_GETTERS.get(propertyPath);
            if (!getter) {
                getter = new Function('obj', 'return obj.' + propertyPath);
                View.PROP_GETTERS.set(propertyPath, getter);
            }
            return getter;
        }
    }, {
        key: 'getSetter',
        value: function getSetter(propertyPath) {
            var setter = View.PROP_SETTERS.get(propertyPath);
            if (!setter) {
                setter = new Function('obj', 'v', 'obj.' + propertyPath + ' = v');
                View.PROP_SETTERS.set(propertyPath, setter);
            }
            return setter;
        }
    }]);

    return View;
}();

View.isNumberProperty = function (property) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : View;

    do {
        if (type.NUMBER_PROPERTIES && type.NUMBER_PROPERTIES.has(property)) {
            return true;
        }
    } while (type !== View && (type = Object.getPrototypeOf(type)));

    return false;
};

View.isColorProperty = function (property) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : View;

    do {
        if (type.COLOR_PROPERTIES && type.COLOR_PROPERTIES.has(property)) {
            return true;
        }
    } while (type !== View && (type = Object.getPrototypeOf(type)));

    return false;
};

View.getMerger = function (property) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : View;

    if (View.isNumberProperty(property, type)) {
        return StageUtils.mergeNumbers;
    } else if (View.isColorProperty(property, type)) {
        return StageUtils.mergeColors;
    } else {
        return undefined;
    }
};

View.NUMBER_PROPERTIES = new Set(['x', 'y', 'w', 'h', 'scale', 'scaleX', 'scaleY', 'pivot', 'pivotX', 'pivotY', 'mount', 'mountX', 'mountY', 'alpha', 'rotation', 'texture.x', 'texture.y', 'texture.w', 'texture.h']);
View.COLOR_PROPERTIES = new Set(['color', 'colorTop', 'colorBottom', 'colorLeft', 'colorRight', 'colorUl', 'colorUr', 'colorBl', 'colorBr']);

View.prototype.isView = 1;

View.id = 1;

View.PROP_GETTERS = new Map();

View.PROP_SETTERS = new Map();

Base.mixinEs5(View, EventEmitter);

var ViewChildList = function () {
    function ViewChildList(view) {
        var isProxy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        _classCallCheck(this, ViewChildList);

        this._view = view;

        this._children = isProxy ? this._view._children._children : [];
    }

    _createClass(ViewChildList, [{
        key: 'get',
        value: function get() {
            return this._children;
        }
    }, {
        key: 'add',
        value: function add(view) {
            if (view._parent === this && this._children.indexOf(view) >= 0) {
                return view;
            }
            this.addAt(view, this._children.length);
        }
    }, {
        key: 'addAt',
        value: function addAt(view, index) {
            if (view === this._view) {
                return;
            }

            if (index >= 0 && index <= this._children.length) {
                if (view._parent === this._view && this._children.indexOf(view) === index) {} else {
                    if (view._parent) {
                        var _p4 = view._parent;
                        _p4._children.remove(view);
                    }

                    view._setParent(this._view);
                    this._children.splice(index, 0, view);

                    this._view._core.addChildAt(index, view._core);
                }

                return;
            } else {
                throw new Error(view + 'addChildAt: The index ' + index + ' supplied is out of bounds ' + this._children.length);
            }
        }
    }, {
        key: 'getIndex',
        value: function getIndex(view) {
            return this._children.indexOf(view);
        }
    }, {
        key: 'remove',
        value: function remove(view) {
            var index = this.getIndex(view);

            if (index !== -1) {
                this.removeAt(index);
            }
        }
    }, {
        key: 'removeAt',
        value: function removeAt(index) {
            var view = this._children[index];

            view._setParent(null);
            this._children.splice(index, 1);

            this._view._core.removeChildAt(index);

            return view;
        }
    }, {
        key: 'clear',
        value: function clear() {
            var n = this._children.length;
            if (n) {
                for (var _i19 = 0; _i19 < n; _i19++) {
                    var view = this._children[_i19];
                    view._setParent(null);
                }
                this._children.splice(0, n);

                this._view._core.removeChildren();
            }
        }
    }, {
        key: 'a',
        value: function a(o) {
            if (Utils.isObjectLiteral(o)) {
                var c = void 0;
                if (o.type) {
                    c = new o.type(this._view.stage);
                } else {
                    c = this._view.stage.createView();
                }
                this.add(c);
                c.setSettings(o);
                return c;
            } else if (Array.isArray(o)) {
                for (var _i20 = 0, n = o.length; _i20 < n; _i20++) {
                    this.a(o[_i20]);
                }
                return null;
            } else if (o.isView) {
                this.add(o);
                return o;
            }
        }
    }, {
        key: 'set',
        value: function set(views) {
            this.clear();
            for (var _i21 = 0, n = views.length; _i21 < n; _i21++) {
                var o = views[_i21];
                if (Utils.isObjectLiteral(o)) {
                    var c = void 0;
                    if (o.type) {
                        c = new o.type(this._view.stage);
                    } else {
                        c = this._view.stage.createView();
                    }
                    this.add(c);
                    c.setSettings(o);
                } else if (o.isView) {
                    this.add(o);
                }
            }
        }
    }, {
        key: 'length',
        get: function get() {
            return this._children.length;
        }
    }]);

    return ViewChildList;
}();

var ViewTexturizer = function () {
    function ViewTexturizer(viewCore) {
        _classCallCheck(this, ViewTexturizer);

        this._view = viewCore.view;
        this._core = viewCore;

        this.ctx = this._core.ctx;

        this._enabled = false;
        this.lazy = false;
        this._colorize = false;

        this._filters = [];

        this._renderTexture = null;

        this._renderTextureReused = false;

        this._resultTexture = null;

        this._resultTextureSource = null;

        this._renderToTextureEnabled = false;

        this._hideResult = false;

        this.filterResultCached = false;
    }

    _createClass(ViewTexturizer, [{
        key: '_clearFilters',
        value: function _clearFilters() {
            var _this10 = this;

            this._filters.forEach(function (filter) {
                return filter.removeView(_this10._core);
            });
            this._filters = [];
            this.filterResultCached = false;
        }
    }, {
        key: '_addFilter',
        value: function _addFilter(filter) {
            filter.addView(this._core);
            this._filters.push(filter);
        }
    }, {
        key: '_hasFilters',
        value: function _hasFilters() {
            return this._filters.length > 0;
        }
    }, {
        key: '_hasActiveFilters',
        value: function _hasActiveFilters() {
            for (var _i22 = 0, n = this._filters.length; _i22 < n; _i22++) {
                if (!this._filters[_i22].useDefault()) return true;
            }
            return false;
        }
    }, {
        key: 'getActiveFilters',
        value: function getActiveFilters() {
            var activeFilters = [];
            this._filters.forEach(function (filter) {
                if (!filter.useDefault()) {
                    if (filter.getFilters) {
                        filter.getFilters().forEach(function (f) {
                            return activeFilters.push(f);
                        });
                    } else {
                        activeFilters.push(filter);
                    }
                }
            });
            return activeFilters;
        }
    }, {
        key: 'getResultTextureSource',
        value: function getResultTextureSource() {
            if (!this._resultTextureSource) {
                this._resultTextureSource = new TextureSource(this._view.stage.textureManager, null);

                this.updateResultTexture();
            }
            return this._resultTextureSource;
        }
    }, {
        key: 'updateResultTexture',
        value: function updateResultTexture() {
            var resultTexture = this.getResultTexture();
            if (this._resultTextureSource) {
                if (this._resultTextureSource.glTexture !== resultTexture) {
                    var w = resultTexture ? resultTexture.w : 0;
                    var h = resultTexture ? resultTexture.h : 0;
                    this._resultTextureSource._changeGlTexture(resultTexture, w, h);
                }

                this._resultTextureSource.views.forEach(function (view) {
                    return view._core.setHasRenderUpdates(3);
                });
            }
        }
    }, {
        key: 'mustRenderToTexture',
        value: function mustRenderToTexture() {
            if (this._enabled && !this.lazy) {
                return true;
            } else if (this._enabled && this.lazy && this._hasRenderUpdates < 3) {
                return true;
            } else if (this._hasActiveFilters()) {
                return true;
            }
            return false;
        }
    }, {
        key: 'deactivate',
        value: function deactivate() {
            this.releaseRenderTexture();
            this.releaseFilterTexture();
        }
    }, {
        key: 'releaseRenderTexture',
        value: function releaseRenderTexture() {
            if (this._renderTexture) {
                if (!this._renderTextureReused) {
                    this.ctx.releaseRenderTexture(this._renderTexture);
                }
                this._renderTexture = null;
                this._renderTextureReused = false;
                this.updateResultTexture();
            }
        }
    }, {
        key: 'reuseTextureAsRenderTexture',
        value: function reuseTextureAsRenderTexture(glTexture) {
            if (this._renderTexture !== glTexture) {
                this.releaseRenderTexture();
                this._renderTexture = glTexture;
                this._renderTextureReused = true;
            }
        }
    }, {
        key: 'hasRenderTexture',
        value: function hasRenderTexture() {
            return !!this._renderTexture;
        }
    }, {
        key: 'getRenderTexture',
        value: function getRenderTexture() {
            if (!this._renderTexture) {
                this._renderTexture = this.ctx.allocateRenderTexture(Math.min(2048, this._core._rw), Math.min(2048, this._core._rh));
                this._renderTextureReused = false;
            }
            return this._renderTexture;
        }
    }, {
        key: 'getFilterTexture',
        value: function getFilterTexture() {
            if (!this._resultTexture) {
                this._resultTexture = this.ctx.allocateRenderTexture(Math.min(2048, this._core._rw), Math.min(2048, this._core._rh));
            }
            return this._resultTexture;
        }
    }, {
        key: 'releaseFilterTexture',
        value: function releaseFilterTexture() {
            if (this._resultTexture) {
                this.ctx.releaseRenderTexture(this._resultTexture);
                this._resultTexture = null;
                this.filterResultCached = false;
                this.updateResultTexture();
            }
        }
    }, {
        key: 'getResultTexture',
        value: function getResultTexture() {
            return this._hasActiveFilters() ? this._resultTexture : this._renderTexture;
        }
    }, {
        key: 'enabled',
        get: function get() {
            return this._enabled;
        },
        set: function set(v) {
            this._enabled = v;
            this._core.updateRenderToTextureEnabled();
        }
    }, {
        key: 'hideResult',
        get: function get() {
            return this._hideResult;
        },
        set: function set(v) {
            this._hideResult = v;
            this._core.setHasRenderUpdates(1);
        }
    }, {
        key: 'colorize',
        get: function get() {
            return this._colorize;
        },
        set: function set(v) {
            if (this._colorize !== v) {
                this._colorize = v;

                this._core.setHasRenderUpdates(1);
            }
        }
    }, {
        key: 'filters',
        get: function get() {
            return this._filters;
        },
        set: function set(v) {
            var _this11 = this;

            this._clearFilters();
            v.forEach(function (filter) {
                if (Utils.isObjectLiteral(filter) && filter.type) {
                    var _s2 = new filter.type(_this11.ctx);
                    _s2.setSettings(filter);
                    filter = _s2;
                }

                if (filter.isFilter) {
                    _this11._addFilter(filter);
                } else {
                    console.error("Please specify a filter type.");
                }
            });

            this._core.updateRenderToTextureEnabled();
            this._core.setHasRenderUpdates(2);
        }
    }, {
        key: 'renderTextureReused',
        get: function get() {
            return this._renderTextureReused;
        }
    }]);

    return ViewTexturizer;
}();

var ViewCore = function () {
    function ViewCore(view) {
        _classCallCheck(this, ViewCore);

        this._view = view;

        this.ctx = view.stage.ctx;

        this.renderState = this.ctx.renderState;

        this._parent = null;

        this._hasUpdates = false;

        this._hasRenderUpdates = 0;

        this._visitEntry = null;

        this._visitExit = null;

        this._recalc = 0;

        this._updateTreeOrder = 0;

        this._worldContext = new ViewCoreContext();

        this._renderContext = this._worldContext;

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

        this._displayedTextureSource = null;

        this.inTextureAtlas = false;

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

        this._shader = null;

        this._shaderOwner = null;

        this._renderToTextureEnabled = false;

        this._texturizer = null;

        this._useRenderToTexture = false;

        this._useViewportClipping = false;

        this.render = this._renderSimple;
    }

    _createClass(ViewCore, [{
        key: 'setHasRenderUpdates',
        value: function setHasRenderUpdates(type) {
            var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            if (this._worldContext.alpha || force) {
                var _p5 = this;
                _p5._hasRenderUpdates = Math.max(type, _p5._hasRenderUpdates);
                while ((_p5 = _p5._parent) && _p5._hasRenderUpdates != 3) {
                    _p5._hasRenderUpdates = 3;
                }
            }
        }
    }, {
        key: '_setRecalc',
        value: function _setRecalc(type) {
            this._recalc |= type;

            if (this._worldContext.alpha) {
                var _p6 = this;
                do {
                    _p6._hasUpdates = true;
                } while ((_p6 = _p6._parent) && !_p6._hasUpdates);

                if (this._parent) this._parent.setHasRenderUpdates(3);
            } else {
                this._hasUpdates = true;
            }
        }
    }, {
        key: '_setRecalcForced',
        value: function _setRecalcForced(type) {
            this._recalc |= type;

            var p = this;
            do {
                p._hasUpdates = true;
            } while ((p = p._parent) && !p._hasUpdates);

            if (this._parent) {
                this._parent.setHasRenderUpdates(3);
            }
        }
    }, {
        key: 'setParent',
        value: function setParent(parent) {
            if (parent !== this._parent) {
                var prevIsZContext = this.isZContext();
                var prevParent = this._parent;
                this._parent = parent;

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

                if (!this._shader) {
                    var newShaderOwner = parent ? parent._shaderOwner : null;
                    if (newShaderOwner !== this._shaderOwner) {
                        this.setHasRenderUpdates(1);
                        this._setShaderOwnerRecursive(newShaderOwner);
                    }
                }
            }
        }
    }, {
        key: 'addChildAt',
        value: function addChildAt(index, child) {
            if (!this._children) this._children = [];
            this._children.splice(index, 0, child);
            child.setParent(this);
        }
    }, {
        key: 'removeChildAt',
        value: function removeChildAt(index) {
            var child = this._children[index];
            this._children.splice(index, 1);
            child.setParent(null);
        }
    }, {
        key: 'removeChildren',
        value: function removeChildren() {
            if (this._children) {
                for (var _i23 = 0, n = this._children.length; _i23 < n; _i23++) {
                    this._children[_i23].setParent(null);
                }

                this._children.splice(0);

                if (this._zIndexedChildren) {
                    this._zIndexedChildren.splice(0);
                }
            }
        }
    }, {
        key: 'setLocalTransform',
        value: function setLocalTransform(a, b, c, d) {
            this._setRecalc(4);
            this._localTa = a;
            this._localTb = b;
            this._localTc = c;
            this._localTd = d;
            this._isComplex = b != 0 || c != 0;
        }
    }, {
        key: 'setLocalTranslate',
        value: function setLocalTranslate(x, y) {
            this._setRecalc(2);
            this._localPx = x;
            this._localPy = y;
        }
    }, {
        key: 'addLocalTranslate',
        value: function addLocalTranslate(dx, dy) {
            this.setLocalTranslate(this._localPx + dx, this._localPy + dy);
        }
    }, {
        key: 'setLocalAlpha',
        value: function setLocalAlpha(a) {
            if (!this._worldContext.alpha && this._parent && this._parent._worldContext.alpha && a) {
                this._setRecalcForced(1 + 128);

                this.setHasRenderUpdates(3, true);
            } else {
                this._setRecalc(1);
            }

            if (a < 1e-14) {
                a = 0;
            }

            this._localAlpha = a;
        }
    }, {
        key: 'setDimensions',
        value: function setDimensions(w, h) {
            this._rw = w;
            this._rh = h;
            this._setRecalc(2);
            if (this._texturizer) {
                this._texturizer.releaseRenderTexture();
                this._texturizer.releaseFilterTexture();
                this._texturizer.updateResultTexture();
            }
        }
    }, {
        key: 'setTextureCoords',
        value: function setTextureCoords(ulx, uly, brx, bry) {
            this.setHasRenderUpdates(3);

            this._ulx = ulx;
            this._uly = uly;
            this._brx = brx;
            this._bry = bry;

            this._txCoordsUl = (ulx * 65535 + 0.5 | 0) + (uly * 65535 + 0.5 | 0) * 65536;
            this._txCoordsUr = (brx * 65535 + 0.5 | 0) + (uly * 65535 + 0.5 | 0) * 65536;
            this._txCoordsBl = (ulx * 65535 + 0.5 | 0) + (bry * 65535 + 0.5 | 0) * 65536;
            this._txCoordsBr = (brx * 65535 + 0.5 | 0) + (bry * 65535 + 0.5 | 0) * 65536;
        }
    }, {
        key: 'setDisplayedTextureSource',
        value: function setDisplayedTextureSource(textureSource) {
            this.setHasRenderUpdates(3);
            this._displayedTextureSource = textureSource;
        }
    }, {
        key: 'allowTextureAtlas',
        value: function allowTextureAtlas() {
            return this.activeShader.supportsTextureAtlas();
        }
    }, {
        key: 'setInTextureAtlas',
        value: function setInTextureAtlas(inTextureAtlas) {
            this.inTextureAtlas = inTextureAtlas;
        }
    }, {
        key: 'setAsRoot',
        value: function setAsRoot() {
            this._parent = new ViewCore(this._view);

            this._isRoot = true;

            this.ctx.root = this;
        }
    }, {
        key: 'isAncestorOf',
        value: function isAncestorOf(c) {
            var p = c;
            while (p = p._parent) {
                if (this === p) {
                    return true;
                }
            }
            return false;
        }
    }, {
        key: 'isZContext',
        value: function isZContext() {
            return this._forceZIndexContext || this._renderToTextureEnabled || this._zIndex !== 0 || this._isRoot || !this._parent;
        }
    }, {
        key: 'findZContext',
        value: function findZContext() {
            if (this.isZContext()) {
                return this;
            } else {
                return this._parent.findZContext();
            }
        }
    }, {
        key: 'setZParent',
        value: function setZParent(newZParent) {
            if (this._zParent !== newZParent) {
                if (this._zParent !== null) {
                    if (this._zIndex !== 0) {
                        this._zParent.decZContextUsage();
                    }

                    if (this._zParent._zContextUsage > 0) {
                        var index = this._zParent._zIndexedChildren.indexOf(this);
                        this._zParent._zIndexedChildren.splice(index, 1);
                    }
                }

                if (newZParent !== null) {
                    var hadZContextUsage = newZParent._zContextUsage > 0;

                    if (this._zIndex !== 0) {
                        newZParent.incZContextUsage();
                    }

                    if (newZParent._zContextUsage > 0) {
                        if (!hadZContextUsage && this._parent === newZParent) {} else {
                            newZParent._zIndexedChildren.push(this);
                        }
                        newZParent._zSort = true;
                    }
                }

                this._zParent = newZParent;
            }
        }
    }, {
        key: 'incZContextUsage',
        value: function incZContextUsage() {
            this._zContextUsage++;
            if (this._zContextUsage === 1) {
                if (!this._zIndexedChildren) {
                    this._zIndexedChildren = [];
                }
                if (this._children) {
                    for (var _i24 = 0, n = this._children.length; _i24 < n; _i24++) {
                        this._zIndexedChildren.push(this._children[_i24]);
                    }
                }
            }
        }
    }, {
        key: 'decZContextUsage',
        value: function decZContextUsage() {
            this._zContextUsage--;
            if (this._zContextUsage === 0) {
                this._zSort = false;
                this._zIndexedChildren.splice(0);
            }
        }
    }, {
        key: 'enableZContext',
        value: function enableZContext(prevZContext) {
            if (prevZContext && prevZContext._zContextUsage > 0) {
                var self = this;

                prevZContext._zIndexedChildren.slice().forEach(function (c) {
                    if (self.isAncestorOf(c) && c._zIndex !== 0) {
                        c.setZParent(self);
                    }
                });
            }
        }
    }, {
        key: 'disableZContext',
        value: function disableZContext() {
            if (this._zContextUsage > 0) {
                var newZParent = this._parent.findZContext();

                this._zIndexedChildren.slice().forEach(function (c) {
                    if (c._zIndex !== 0) {
                        c.setZParent(newZParent);
                    }
                });
            }
        }
    }, {
        key: '_setShaderOwnerRecursive',
        value: function _setShaderOwnerRecursive(viewCore) {
            var support = this.activeShader.supportsTextureAtlas();
            this._shaderOwner = viewCore;
            if (support !== this.activeShader.supportsTextureAtlas()) {
                this._view._updateTextureCoords();
            }

            if (this._children && !this._renderToTextureEnabled) {
                for (var _i25 = 0, n = this._children.length; _i25 < n; _i25++) {
                    var c = this._children[_i25];
                    if (!c._shader) {
                        c._setShaderOwnerRecursive(viewCore);
                        c._hasRenderUpdates = 3;
                    }
                }
            }
        }
    }, {
        key: '_setShaderOwnerChildrenRecursive',
        value: function _setShaderOwnerChildrenRecursive(viewCore) {
            if (this._children) {
                for (var _i26 = 0, n = this._children.length; _i26 < n; _i26++) {
                    var c = this._children[_i26];
                    if (!c._shader) {
                        c._setShaderOwnerRecursive(viewCore);
                        c._hasRenderUpdates = 3;
                    }
                }
            }
        }
    }, {
        key: '_hasRenderContext',
        value: function _hasRenderContext() {
            return this._renderContext !== this._worldContext;
        }
    }, {
        key: 'updateRenderToTextureEnabled',
        value: function updateRenderToTextureEnabled() {
            var v = this.texturizer._hasFilters() || this.texturizer._enabled || this._clipping;

            if (v) {
                this._enableRenderToTexture();
            } else {
                this._disableRenderToTexture();
                this._texturizer.releaseRenderTexture();
            }
        }
    }, {
        key: '_enableRenderToTexture',
        value: function _enableRenderToTexture() {
            if (!this._renderToTextureEnabled) {
                var prevIsZContext = this.isZContext();

                this._renderToTextureEnabled = true;

                this._renderContext = new ViewCoreContext();

                this._setShaderOwnerChildrenRecursive(null);

                if (!prevIsZContext) {
                    this.enableZContext(this._parent ? this._parent.findZContext() : null);
                }

                this.setHasRenderUpdates(3);

                this._setRecalc(7);

                this.render = this._renderAdvanced;
            }
        }
    }, {
        key: '_disableRenderToTexture',
        value: function _disableRenderToTexture() {
            if (this._renderToTextureEnabled) {
                this._renderToTextureEnabled = false;

                this._setShaderOwnerChildrenRecursive(this._shaderOwner);

                this._renderContext = this._worldContext;

                if (!this.isZContext()) {
                    this.disableZContext();
                }

                this._setRecalc(7);

                this.setHasRenderUpdates(3);

                this.render = this._renderSimple;
            }
        }
    }, {
        key: '_stashTexCoords',
        value: function _stashTexCoords() {
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
    }, {
        key: '_unstashTexCoords',
        value: function _unstashTexCoords() {
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
    }, {
        key: '_stashColors',
        value: function _stashColors() {
            this._stashedColors = [this._colorUl, this._colorUr, this._colorBr, this._colorBl];
            this._colorUl = 0xFFFFFFFF;
            this._colorUr = 0xFFFFFFFF;
            this._colorBr = 0xFFFFFFFF;
            this._colorBl = 0xFFFFFFFF;
        }
    }, {
        key: '_unstashColors',
        value: function _unstashColors() {
            this._colorUl = this._stashedColors[0];
            this._colorUr = this._stashedColors[1];
            this._colorBr = this._stashedColors[2];
            this._colorBl = this._stashedColors[3];
            this._stashedColors = null;
        }
    }, {
        key: 'isVisible',
        value: function isVisible() {
            return this._localAlpha > 1e-14;
        }
    }, {
        key: 'visit',
        value: function visit() {
            if (this.isVisible()) {
                var changed = this._recalc > 0 || this._hasRenderUpdates > 0 || this._hasUpdates;

                if (changed) {
                    if (this._visitEntry) {
                        this._visitEntry(this._view);
                    }

                    if (this._children) {
                        var recalc = this._recalc;

                        this._recalc |= this._parent._recalc & 6;

                        for (var _i27 = 0, n = this._children.length; _i27 < n; _i27++) {
                            this._children[_i27].visit();
                        }

                        this._recalc = recalc;
                    }

                    if (this._visitExit) {
                        this._visitExit(this._view);
                    }
                }
            }
        }
    }, {
        key: 'update',
        value: function update() {
            this._recalc |= this._parent._recalc;

            var pw = this._parent._worldContext;
            var w = this._worldContext;

            var visible = pw.alpha && this._localAlpha;
            var forceUpdate = w.alpha && !visible;

            if (visible || forceUpdate) {
                if (this._zSort) {
                    this.ctx.updateTreeOrderForceUpdate++;
                }

                var recalc = this._recalc;

                if (recalc & 1) {
                    w.alpha = pw.alpha * this._localAlpha;

                    if (w.alpha < 1e-14) {
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

                if (this._parent._hasRenderContext()) {
                    if (this._renderContext === this._worldContext) {
                        this._renderContext = new ViewCoreContext();
                    }

                    var _r = this._renderContext;

                    var pr = this._parent._renderContext;

                    if (recalc & 1) {
                        _r.alpha = pr.alpha * this._localAlpha;

                        if (_r.alpha < 1e-14) {
                            _r.alpha = 0;
                        }
                    }

                    if (recalc & 6) {
                        _r.px = pr.px + this._localPx * pr.ta;
                        _r.py = pr.py + this._localPy * pr.td;
                        if (pr.tb !== 0) _r.px += this._localPy * pr.tb;
                        if (pr.tc !== 0) _r.py += this._localPx * pr.tc;
                    }

                    if (recalc & 4) {
                        _r.ta = this._localTa * pr.ta;
                        _r.tb = this._localTd * pr.tb;
                        _r.tc = this._localTa * pr.tc;
                        _r.td = this._localTd * pr.td;

                        if (this._isComplex) {
                            _r.ta += this._localTc * pr.tb;
                            _r.tb += this._localTb * pr.ta;
                            _r.tc += this._localTc * pr.td;
                            _r.td += this._localTb * pr.tc;
                        }
                    }
                } else {
                    this._renderContext = this._worldContext;
                }

                this._updateTreeOrder = this.ctx.updateTreeOrder++;

                this._recalc = this._recalc & 135;

                this._useRenderToTexture = this._renderToTextureEnabled && this._texturizer.mustRenderToTexture();

                this._useViewportClipping = false;
                if (!this._useRenderToTexture && this._clipping) {
                    if (this._renderContext.isSquare()) {
                        this._useViewportClipping = true;
                    } else {
                        this._useRenderToTexture = true;
                    }
                }

                var r = void 0;
                if (this._useRenderToTexture) {
                    r = this._renderContext;

                    if (this._worldContext.isIdentity()) {
                        this._renderContext = this._worldContext;
                    } else {
                        this._renderContext = ViewCoreContext.IDENTITY;
                    }
                }

                if (this._children) {
                    for (var _i28 = 0, n = this._children.length; _i28 < n; _i28++) {
                        if (this._recalc || this._children[_i28]._hasUpdates) {
                            this._children[_i28].update();
                        } else if (this.ctx.updateTreeOrderForceUpdate > 0) {
                            this._children[_i28].updateTreeOrder();
                        }
                    }
                }

                if (this._useRenderToTexture) {
                    this._renderContext = r;
                }

                this._recalc = 0;

                this._hasUpdates = false;

                if (this._zSort) {
                    this.ctx.updateTreeOrderForceUpdate--;
                }
            } else if (this.ctx.updateTreeOrderForceUpdate > 0) {
                this.updateTreeOrder();
            }
        }
    }, {
        key: 'updateTreeOrder',
        value: function updateTreeOrder() {
            if (this._zSort) {
                this.ctx.updateTreeOrderForceUpdate++;
            }

            this._updateTreeOrder = this.ctx.updateTreeOrder++;

            if (this._children) {
                for (var _i29 = 0, n = this._children.length; _i29 < n; _i29++) {
                    var hasZSort = this._children[_i29]._zSort;
                    if (hasZSort) {
                        this.ctx.updateTreeOrderForceUpdate--;
                    }

                    this._children[_i29].updateTreeOrder();

                    if (hasZSort) {
                        this.ctx.updateTreeOrderForceUpdate--;
                    }
                }
            }

            if (this._zSort) {
                this.ctx.updateTreeOrderForceUpdate--;
            }
        }
    }, {
        key: '_renderSimple',
        value: function _renderSimple() {
            if (this._zSort) {
                this.sortZIndexedChildren();
                this._zSort = false;
            }

            if (this._renderContext.alpha) {
                var renderState = this.renderState;

                renderState.setShader(this.activeShader, this._shaderOwner);

                if (this._displayedTextureSource) {
                    this.addQuads();
                }

                if (this._children) {
                    if (this._zContextUsage) {
                        for (var _i30 = 0, n = this._zIndexedChildren.length; _i30 < n; _i30++) {
                            this._zIndexedChildren[_i30].render();
                        }
                    } else {
                        for (var _i31 = 0, _n = this._children.length; _i31 < _n; _i31++) {
                            if (this._children[_i31]._zIndex === 0) {
                                this._children[_i31].render();
                            }
                        }
                    }
                }

                this._hasRenderUpdates = 0;
            }
        }
    }, {
        key: '_renderAdvanced',
        value: function _renderAdvanced() {
            if (this._zSort) {
                this.sortZIndexedChildren();
                this._zSort = false;
            }

            if (this._renderContext.alpha) {
                var renderState = this.renderState;

                renderState.setShader(this.activeShader, this._shaderOwner);

                var mustRenderChildren = true;
                var renderTextureInfo = void 0;
                var prevRenderTextureInfo = void 0;
                var prevScissor = void 0;
                if (this._useRenderToTexture) {
                    if (this._rw === 0 || this._rh === 0) {
                        this._hasRenderUpdates = 0;
                        return;
                    } else if (!this._texturizer.hasRenderTexture() || this._hasRenderUpdates >= 3) {
                        renderState.setShader(renderState.defaultShader, this);

                        prevRenderTextureInfo = renderState.renderTextureInfo;

                        renderTextureInfo = {
                            glTexture: null,
                            offset: 0,
                            w: this._rw,
                            h: this._rh,
                            empty: true,
                            cleared: false,
                            ignore: false
                        };

                        renderState.setRenderTextureInfo(renderTextureInfo);

                        if (this._displayedTextureSource) {
                            var r = this._renderContext;

                            this._renderContext = ViewCoreContext.IDENTITY;

                            this.addQuads();

                            this._renderContext = r;
                        }
                    } else {
                        mustRenderChildren = false;
                    }
                } else {
                    if (this._useViewportClipping) {
                        var x = Math.round(this._renderContext.px);
                        var y = Math.round(this._renderContext.py);
                        var w = Math.round(this._renderContext.ta * this._rw);
                        var h = Math.round(this._renderContext.td * this._rh);
                        prevScissor = renderState.getScissor();
                        renderState.setScissor([x, y, w, h]);
                    }

                    if (this._displayedTextureSource) {
                        this.addQuads();
                    }
                }

                if (mustRenderChildren && this._children) {
                    if (this._zContextUsage) {
                        for (var _i32 = 0, n = this._zIndexedChildren.length; _i32 < n; _i32++) {
                            this._zIndexedChildren[_i32].render();
                        }
                    } else {
                        for (var _i33 = 0, _n2 = this._children.length; _i33 < _n2; _i33++) {
                            if (this._children[_i33]._zIndex === 0) {
                                this._children[_i33].render();
                            }
                        }
                    }
                }

                if (this._useRenderToTexture) {
                    var updateResultTexture = false;
                    if (mustRenderChildren) {
                        if (renderTextureInfo.glTexture) {
                            var floats = renderState.quads.floats;
                            var uints = renderState.quads.uints;
                            var offset = renderTextureInfo.offset / 4;
                            var reuse = floats[offset] === 0 && floats[offset + 1] === 0 && uints[offset + 2] === 0x00000000 && uints[offset + 3] === 0xFFFFFFFF && floats[offset + 4] === renderTextureInfo.w && floats[offset + 5] === 0 && uints[offset + 6] === 0x0000FFFF && uints[offset + 7] === 0xFFFFFFFF && floats[offset + 8] === renderTextureInfo.w && floats[offset + 9] === renderTextureInfo.h && uints[offset + 10] === 0xFFFFFFFF && uints[offset + 11] === 0xFFFFFFFF && floats[offset + 12] === 0 && floats[offset + 13] === renderTextureInfo.h && uints[offset + 14] === 0xFFFF0000 && uints[offset + 15] === 0xFFFFFFFF;
                            if (!reuse) {
                                renderTextureInfo.glTexture = null;
                            }
                        }

                        if (renderTextureInfo.empty) {} else if (renderTextureInfo.glTexture) {
                            this._texturizer.reuseTextureAsRenderTexture(renderTextureInfo.glTexture);

                            renderTextureInfo.ignore = true;
                        } else {
                            if (this._texturizer.renderTextureReused) {
                                this._texturizer.releaseRenderTexture();
                            }

                            renderTextureInfo.glTexture = this._texturizer.getRenderTexture();
                        }

                        renderState.setRenderTextureInfo(prevRenderTextureInfo);

                        updateResultTexture = true;
                    }

                    var hasFilters = this._texturizer._hasActiveFilters();

                    if (hasFilters) {
                        if (this._hasRenderUpdates >= 2 || !this._texturizer.filterResultCached) {
                            this.applyFilters();
                            updateResultTexture = true;
                        }
                    }

                    var resultTexture = this._texturizer.getResultTexture();
                    if (updateResultTexture) {
                        this._texturizer.updateResultTexture();
                    }

                    if ((!mustRenderChildren || !renderTextureInfo.empty) && !this._texturizer.hideResult) {
                        renderState.setShader(this.activeShader, this._shaderOwner);

                        renderState.setOverrideQuadTexture(resultTexture);
                        this._stashTexCoords();
                        if (!this._texturizer.colorize) this._stashColors();
                        this.addQuads();
                        if (!this._texturizer.colorize) this._unstashColors();
                        this._unstashTexCoords();
                        renderState.setOverrideQuadTexture(null);
                    }
                } else if (this._useViewportClipping) {
                    renderState.setScissor(prevScissor);
                }

                this._hasRenderUpdates = 0;
            }
        }
    }, {
        key: 'applyFilters',
        value: function applyFilters() {
            var sourceTexture = this._texturizer.getRenderTexture();

            var renderState = this.renderState;
            var activeFilters = this._texturizer.getActiveFilters();

            var textureRenders = activeFilters.length;

            this._texturizer.filterResultCached = false;

            if (textureRenders === 0) {
                return sourceTexture;
            } else if (textureRenders === 1) {
                var targetTexture = this._texturizer.getFilterTexture();

                renderState.addFilter(activeFilters[0], this, sourceTexture, targetTexture);
                this._texturizer.filterResultCached = true;
            } else {
                var _targetTexture = this._texturizer.getFilterTexture();
                var intermediate = this.ctx.allocateRenderTexture(Math.min(2048, this._rw), Math.min(2048, this._rh));
                var source = intermediate;
                var target = _targetTexture;

                var even = textureRenders % 2 === 0;

                for (var _i34 = 0; _i34 < textureRenders; _i34++) {
                    if (_i34 !== 0 || even) {
                        var tmp = source;
                        source = target;
                        target = tmp;
                    }

                    renderState.addFilter(activeFilters[_i34], this, _i34 === 0 ? sourceTexture : source, target);
                }

                this.ctx.releaseRenderTexture(intermediate);

                this._texturizer.filterResultCached = true;
            }
        }
    }, {
        key: 'sortZIndexedChildren',
        value: function sortZIndexedChildren() {
            for (var _i35 = 1, n = this._zIndexedChildren.length; _i35 < n; _i35++) {
                var a = this._zIndexedChildren[_i35];
                var j = _i35 - 1;
                while (j >= 0) {
                    var b = this._zIndexedChildren[j];
                    if (!(a._zIndex === b._zIndex ? a._updateTreeOrder < b._updateTreeOrder : a._zIndex < b._zIndex)) {
                        break;
                    }

                    this._zIndexedChildren[j + 1] = this._zIndexedChildren[j];
                    j--;
                }

                this._zIndexedChildren[j + 1] = a;
            }
        }
    }, {
        key: 'addQuads',
        value: function addQuads() {
            var r = this._renderContext;

            var floats = this.renderState.quads.floats;
            var uints = this.renderState.quads.uints;

            if (r.tb !== 0 || this.tb !== 0) {
                var offset = this.renderState.addQuad(this) / 4;
                floats[offset++] = r.px;
                floats[offset++] = r.py;
                uints[offset++] = this._txCoordsUl;
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
                var cx = r.px + this._rw * r.ta;
                var cy = r.py + this._rh * r.td;

                var _offset = this.renderState.addQuad(this) / 4;
                floats[_offset++] = r.px;
                floats[_offset++] = r.py;
                uints[_offset++] = this._txCoordsUl;
                uints[_offset++] = getColorInt(this._colorUl, r.alpha);
                floats[_offset++] = cx;
                floats[_offset++] = r.py;
                uints[_offset++] = this._txCoordsUr;
                uints[_offset++] = getColorInt(this._colorUr, r.alpha);
                floats[_offset++] = cx;
                floats[_offset++] = cy;
                uints[_offset++] = this._txCoordsBr;
                uints[_offset++] = getColorInt(this._colorBr, r.alpha);
                floats[_offset++] = r.px;
                floats[_offset++] = cy;
                uints[_offset++] = this._txCoordsBl;
                uints[_offset] = getColorInt(this._colorBl, r.alpha);
            }
        }
    }, {
        key: 'getCornerPoints',
        value: function getCornerPoints() {
            var w = this._worldContext;

            return [w.px, w.py, w.px + this._rw * w.ta, w.py + this._rw * w.tc, w.px + this._rw * w.ta + this._rh * this.tb, w.py + this._rw * w.tc + this._rh * this.td, w.px + this._rh * this.tb, w.py + this._rh * this.td];
        }
    }, {
        key: 'getRenderTextureCoords',
        value: function getRenderTextureCoords(relX, relY) {
            var r = this._renderContext;
            return [r.px + r.ta * relX + r.tb * relY, r.py + r.tc * relX + r.td * relY];
        }
    }, {
        key: 'getAbsoluteCoords',
        value: function getAbsoluteCoords(relX, relY) {
            var w = this._renderContext;
            return [w.px + w.ta * relX + w.tb * relY, w.py + w.tc * relX + w.td * relY];
        }
    }, {
        key: 'zIndex',
        get: function get() {
            return this._zIndex;
        },
        set: function set(zIndex) {
            if (this._zIndex !== zIndex) {
                this.setHasRenderUpdates(1);

                var newZParent = this._zParent;

                var prevIsZContext = this.isZContext();
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
        }
    }, {
        key: 'forceZIndexContext',
        get: function get() {
            return this._forceZIndexContext;
        },
        set: function set(v) {
            this.setHasRenderUpdates(1);

            var prevIsZContext = this.isZContext();
            this._forceZIndexContext = v;

            if (prevIsZContext !== this.isZContext()) {
                if (!this.isZContext()) {
                    this.disableZContext();
                } else {
                    this.enableZContext(this._parent.findZContext());
                }
            }
        }
    }, {
        key: 'colorUl',
        get: function get() {
            return this._colorUl;
        },
        set: function set(color) {
            if (this._colorUl !== color) {
                this.setHasRenderUpdates(this._displayedTextureSource ? 3 : 1);
                this._colorUl = color;
            }
        }
    }, {
        key: 'colorUr',
        get: function get() {
            return this._colorUr;
        },
        set: function set(color) {
            if (this._colorUr !== color) {
                this.setHasRenderUpdates(this._displayedTextureSource ? 3 : 1);
                this._colorUr = color;
            }
        }
    }, {
        key: 'colorBl',
        get: function get() {
            return this._colorBl;
        },
        set: function set(color) {
            if (this._colorBl !== color) {
                this.setHasRenderUpdates(this._displayedTextureSource ? 3 : 1);
                this._colorBl = color;
            }
        }
    }, {
        key: 'colorBr',
        get: function get() {
            return this._colorBr;
        },
        set: function set(color) {
            if (this._colorBr !== color) {
                this.setHasRenderUpdates(this._displayedTextureSource ? 3 : 1);
                this._colorBr = color;
            }
        }
    }, {
        key: 'visitEntry',
        set: function set(f) {
            this._visitEntry = f;
        }
    }, {
        key: 'visitExit',
        set: function set(f) {
            this._visitExit = f;
        }
    }, {
        key: 'shader',
        get: function get() {
            return this._shader;
        },
        set: function set(v) {
            this.setHasRenderUpdates(1);

            var prevShader = this._shader;
            this._shader = v;
            if (!v && prevShader) {
                var newShaderOwner = this._parent && !this._parent._renderToTextureEnabled ? this._parent._shaderOwner : null;
                this._setShaderOwnerRecursive(newShaderOwner);
            } else {
                this._setShaderOwnerRecursive(this);
            }

            if (prevShader) {
                prevShader.removeView(this);
            }

            if (this._shader) {
                this._shader.addView(this);
            }
        }
    }, {
        key: 'activeShader',
        get: function get() {
            return this._shaderOwner ? this._shaderOwner.shader : this.renderState.defaultShader;
        }
    }, {
        key: 'activeShaderOwner',
        get: function get() {
            return this._shaderOwner;
        }
    }, {
        key: 'clipping',
        get: function get() {
            return this._clipping;
        },
        set: function set(v) {
            this._clipping = v;
            this.updateRenderToTextureEnabled();
        }
    }, {
        key: 'localTa',
        get: function get() {
            return this._localTa;
        }
    }, {
        key: 'localTb',
        get: function get() {
            return this._localTb;
        }
    }, {
        key: 'localTc',
        get: function get() {
            return this._localTc;
        }
    }, {
        key: 'localTd',
        get: function get() {
            return this._localTd;
        }
    }, {
        key: 'rw',
        get: function get() {
            return this._rw;
        }
    }, {
        key: 'rh',
        get: function get() {
            return this._rh;
        }
    }, {
        key: 'view',
        get: function get() {
            return this._view;
        }
    }, {
        key: 'renderUpdates',
        get: function get() {
            return this._hasRenderUpdates;
        }
    }, {
        key: 'texturizer',
        get: function get() {
            if (!this._texturizer) {
                this._texturizer = new ViewTexturizer(this);
            }
            return this._texturizer;
        }
    }]);

    return ViewCore;
}();

var getColorInt = function getColorInt(c, alpha) {
    var a = (c / 16777216 | 0) * alpha | 0;
    return ((c >> 16 & 0xff) * a / 255 & 0xff) + ((c & 0xff00) * a / 255 & 0xff00) + (((c & 0xff) << 16) * a / 255 & 0xff0000) + (a << 24);
};

var ViewCoreContext = function () {
    function ViewCoreContext() {
        _classCallCheck(this, ViewCoreContext);

        this.alpha = 1;

        this.px = 0;
        this.py = 0;

        this.ta = 1;
        this.tb = 0;
        this.tc = 0;
        this.td = 1;
    }

    _createClass(ViewCoreContext, [{
        key: 'isIdentity',
        value: function isIdentity() {
            return this.alpha === 1 && this.px === 0 && this.py === 0 && this.ta === 1 && this.tb === 0 && this.tc === 0 && this.td === 1;
        }
    }, {
        key: 'isSquare',
        value: function isSquare() {
            return this.tb === 0 && this.tc === 0;
        }
    }]);

    return ViewCoreContext;
}();

ViewCoreContext.IDENTITY = new ViewCoreContext();

var CoreContext = function () {
    function CoreContext(stage) {
        _classCallCheck(this, CoreContext);

        this.stage = stage;

        this.gl = stage.gl;

        this.root = null;

        this.updateTreeOrder = 0;
        this.updateTreeOrderForceUpdate = 0;

        this.shaderPrograms = new Map();

        this.renderState = new CoreRenderState(this);

        this.renderExec = new CoreRenderExecutor(this);
        this.renderExec.init();

        this._renderTexturePool = [];
        this._renderTexturePoolPixels = 0;

        this._renderTextureId = 1;
    }

    _createClass(CoreContext, [{
        key: 'destroy',
        value: function destroy() {
            var _this12 = this;

            this.shaderPrograms.forEach(function (shaderProgram) {
                return shaderProgram.destroy();
            });
            this._renderTexturePool.forEach(function (texture) {
                return _this12._freeRenderTexture(texture);
            });
        }
    }, {
        key: 'visit',
        value: function visit() {
            this.root.visit();
        }
    }, {
        key: 'frame',
        value: function frame() {
            if (!this.root._parent._hasRenderUpdates) {
                return false;
            }

            this.visit();

            this.update();

            this.render();

            this.root._parent._hasRenderUpdates = false;

            this._freeUnusedRenderTextures(6000);

            return true;
        }
    }, {
        key: 'update',
        value: function update() {
            this.updateTreeOrderForceUpdate = 0;
            this.updateTreeOrder = 0;

            this.root.update();
        }
    }, {
        key: 'render',
        value: function render() {
            this.renderState.reset();
            this.root.render();
            this.renderState.finish();

            this.renderExec.execute();
        }
    }, {
        key: 'allocateRenderTexture',
        value: function allocateRenderTexture(w, h) {
            w = Math.round(w);
            h = Math.round(h);
            for (var _i36 = 0, n = this._renderTexturePool.length; _i36 < n; _i36++) {
                var _texture = this._renderTexturePool[_i36];
                if (_texture.w === w && _texture.h === h) {
                    _texture.f = this.stage.frameCounter;
                    this._renderTexturePool.splice(_i36, 1);
                    return _texture;
                }
            }
            var texture = this._createRenderTexture(w, h);
            texture.f = this.stage.frameCounter;

            return texture;
        }
    }, {
        key: 'releaseRenderTexture',
        value: function releaseRenderTexture(texture) {
            this._renderTexturePool.push(texture);
        }
    }, {
        key: '_freeUnusedRenderTextures',
        value: function _freeUnusedRenderTextures() {
            var _this13 = this;

            var maxAge = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 60;

            var limit = this.stage.frameCounter - maxAge;

            this._renderTexturePool = this._renderTexturePool.filter(function (texture) {
                if (texture.f < limit) {
                    _this13._freeRenderTexture(texture);
                    _this13._renderTexturePoolPixels -= texture.w * texture.h;
                    return false;
                }
                return true;
            });
        }
    }, {
        key: '_createRenderTexture',
        value: function _createRenderTexture(w, h) {
            if (this._renderTexturePoolPixels > this.stage.options.renderTexturePoolPixels) {
                this._freeUnusedRenderTextures();
                if (this._renderTexturePoolPixels > this.stage.options.renderTexturePoolPixels) {
                    console.warn("Render texture pool overflow: " + this._renderTexturePoolPixels + "px");
                }
            }

            var gl = this.gl;
            var sourceTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, sourceTexture);

            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            sourceTexture.framebuffer = gl.createFramebuffer();
            sourceTexture.w = w;
            sourceTexture.h = h;
            sourceTexture.id = this._renderTextureId++;
            sourceTexture.projection = new Float32Array([2 / w, 2 / h]);

            gl.bindFramebuffer(gl.FRAMEBUFFER, sourceTexture.framebuffer);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sourceTexture, 0);

            return sourceTexture;
        }
    }, {
        key: '_freeRenderTexture',
        value: function _freeRenderTexture(glTexture) {
            var gl = this.stage.gl;
            this._renderTexturePoolPixels -= glTexture.w * glTexture.h;
            gl.deleteFramebuffer(glTexture.framebuffer);
            gl.deleteTexture(glTexture);
        }
    }]);

    return CoreContext;
}();

var CoreRenderState = function () {
    function CoreRenderState(ctx) {
        _classCallCheck(this, CoreRenderState);

        this.ctx = ctx;

        this.stage = ctx.stage;

        this.textureAtlasGlTexture = this.stage.textureAtlas ? this.stage.textureAtlas.texture : null;

        this.quads = new CoreQuadList(ctx, 8e6);

        this.defaultShader = new Shader(this.ctx);
    }

    _createClass(CoreRenderState, [{
        key: 'reset',
        value: function reset() {
            this._renderTextureInfo = null;

            this._scissor = null;

            this._shader = null;

            this._shaderOwner = null;

            this._realShader = null;

            this._check = false;

            this.quadOperations = [];
            this.filterOperations = [];

            this._overrideQuadTexture = null;

            this._quadOperation = null;

            this.quads.reset();
        }
    }, {
        key: 'setShader',
        value: function setShader(shader, owner) {
            if (this._shaderOwner !== owner || this._realShader !== shader) {

                this._realShader = shader;

                if (shader.useDefault()) {
                    shader = this.defaultShader;
                }
                if (this._shader !== shader || this._shaderOwner !== owner) {
                    this._shader = shader;
                    this._shaderOwner = owner;
                    this._check = true;
                }
            }
        }
    }, {
        key: 'setScissor',
        value: function setScissor(area) {
            if (area) {
                if (this._scissor) {
                    var sx = Math.max(area[0], this._scissor[0]);
                    var sy = Math.max(area[1], this._scissor[1]);
                    var ex = Math.min(area[0] + area[2], this._scissor[0] + this._scissor[2]);
                    var ey = Math.min(area[1] + area[3], this._scissor[1] + this._scissor[3]);
                    this._scissor = [sx, sy, ex - sx, ey - sy];
                } else {
                    this._scissor = area;
                }
            } else {
                this._scissor = null;
            }
            this._check = true;
        }
    }, {
        key: 'getScissor',
        value: function getScissor() {
            return this._scissor;
        }
    }, {
        key: 'setRenderTextureInfo',
        value: function setRenderTextureInfo(renderTextureInfo) {
            if (this._renderTextureInfo !== renderTextureInfo) {
                this._renderTextureInfo = renderTextureInfo;
                this._scissor = null;
                this._check = true;
            }
        }
    }, {
        key: 'setOverrideQuadTexture',
        value: function setOverrideQuadTexture(texture) {
            this._overrideQuadTexture = texture;
        }
    }, {
        key: 'addQuad',
        value: function addQuad(viewCore) {
            if (!this._quadOperation) {
                this._createQuadOperation();
            } else if (this._check && this._hasChanges()) {
                this._addQuadOperation();
                this._check = false;
            }

            var glTexture = this._overrideQuadTexture;
            if (!glTexture) {
                if (viewCore.inTextureAtlas) {
                    glTexture = this.textureAtlasGlTexture;
                } else {
                    glTexture = viewCore._displayedTextureSource.glTexture;
                }
            }

            var offset = this.length * 64 + 64;

            if (this._renderTextureInfo) {
                if (this._shader === this.defaultShader && this._renderTextureInfo.empty && this._renderTextureInfo.w === glTexture.w && this._renderTextureInfo.h === glTexture.h) {
                    this._renderTextureInfo.glTexture = glTexture;
                    this._renderTextureInfo.offset = offset;
                } else {
                    this._renderTextureInfo.glTexture = null;
                }
                this._renderTextureInfo.empty = false;
            }

            this.quads.quadTextures.push(glTexture);
            this.quads.quadViews.push(viewCore);

            this._quadOperation.length++;

            return offset;
        }
    }, {
        key: '_hasChanges',
        value: function _hasChanges() {
            var q = this._quadOperation;
            if (this._shader !== q.shader) return true;
            if (this._shaderOwner !== q.shaderOwner) return true;
            if (this._renderTextureInfo !== q.renderTextureInfo) return true;
            if (this._scissor !== q.scissor) return true;

            return false;
        }
    }, {
        key: '_addQuadOperation',
        value: function _addQuadOperation() {
            var create = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            if (this._quadOperation) {
                if (this._quadOperation.length || this._shader.addEmpty()) {
                    this.quadOperations.push(this._quadOperation);
                }

                this._quadOperation = null;
            }

            if (create) {
                this._createQuadOperation();
            }
        }
    }, {
        key: '_createQuadOperation',
        value: function _createQuadOperation() {
            this._quadOperation = new CoreQuadOperation(this.ctx, this._shader, this._shaderOwner, this._renderTextureInfo, this._scissor, this.length);
            this._check = false;
        }
    }, {
        key: 'addFilter',
        value: function addFilter(filter, owner, source, target) {
            this._addQuadOperation(false);

            this.filterOperations.push(new CoreFilterOperation(this.ctx, filter, owner, source, target, this.quadOperations.length));
        }
    }, {
        key: 'finish',
        value: function finish() {
            if (this.ctx.stage.textureAtlas && this.ctx.stage.options.debugTextureAtlas) {
                this._renderDebugTextureAtlas();
            }

            if (this._quadOperation) {
                this._addQuadOperation(false);
            }

            this._setExtraShaderAttribs();
        }
    }, {
        key: '_renderDebugTextureAtlas',
        value: function _renderDebugTextureAtlas() {
            this.setShader(this.defaultShader, this.ctx.root);
            this.setRenderTextureInfo(null);
            this.setOverrideQuadTexture(this.textureAtlasGlTexture);

            var size = Math.min(this.ctx.stage.w, this.ctx.stage.h);

            var offset = this.addQuad(this.ctx.root) / 4;
            var f = this.quads.floats;
            var u = this.quads.uints;
            f[offset++] = 0;
            f[offset++] = 0;
            u[offset++] = 0x00000000;
            u[offset++] = 0xFFFFFFFF;
            f[offset++] = size;
            f[offset++] = 0;
            u[offset++] = 0x0000FFFF;
            u[offset++] = 0xFFFFFFFF;
            f[offset++] = size;
            f[offset++] = size;
            u[offset++] = 0xFFFFFFFF;
            u[offset++] = 0xFFFFFFFF;
            f[offset++] = 0;
            f[offset++] = size;
            u[offset++] = 0xFFFF0000;
            u[offset] = 0xFFFFFFFF;

            this.setOverrideQuadTexture(null);
        }
    }, {
        key: '_setExtraShaderAttribs',
        value: function _setExtraShaderAttribs() {
            var offset = this.length * 64 + 64;
            for (var _i37 = 0, n = this.quadOperations.length; _i37 < n; _i37++) {
                this.quadOperations[_i37].extraAttribsDataByteOffset = offset;
                var extra = this.quadOperations[_i37].shader.getExtraAttribBytesPerVertex() * 4 * this.quadOperations[_i37].length;
                offset += extra;
                if (extra) {
                    this.quadOperations[_i37].shader.setExtraAttribsInBuffer(this.quadOperations[_i37], this.quads);
                }
            }
            this.quads.dataLength = offset;
        }
    }, {
        key: 'length',
        get: function get() {
            return this.quads.quadTextures.length;
        }
    }, {
        key: 'renderTextureInfo',
        get: function get() {
            return this._renderTextureInfo;
        }
    }]);

    return CoreRenderState;
}();

var CoreQuadList = function () {
    function CoreQuadList(ctx, byteSize) {
        _classCallCheck(this, CoreQuadList);

        this.ctx = ctx;

        this.textureAtlasGlTexture = this.ctx.textureAtlas ? this.ctx.textureAtlas.texture : null;

        this.dataLength = 0;

        this.data = new ArrayBuffer(byteSize);
        this.floats = new Float32Array(this.data);
        this.uints = new Uint32Array(this.data);

        this.quadTextures = [];

        this.quadViews = [];

        var f = this.floats;
        var u = this.uints;
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

    _createClass(CoreQuadList, [{
        key: 'reset',
        value: function reset() {
            this.quadTextures = [];
            this.quadViews = [];
            this.dataLength = 0;
        }
    }, {
        key: 'getView',
        value: function getView(index) {
            return this.quadViews[index]._view;
        }
    }, {
        key: 'getViewCore',
        value: function getViewCore(index) {
            return this.quadViews[index];
        }
    }, {
        key: 'getTexture',
        value: function getTexture(index) {
            return this.quadTextures[index];
        }
    }, {
        key: 'getTextureWidth',
        value: function getTextureWidth(index) {
            var glTexture = this.quadTextures[index];
            if (glTexture.w) {
                return glTexture.w;
            } else if (glTexture === this.textureAtlasGlTexture) {
                return 2048;
            } else {
                return this.quadViews[index]._displayedTextureSource.w;
            }
        }
    }, {
        key: 'getTextureHeight',
        value: function getTextureHeight(index) {
            var glTexture = this.quadTextures[index];
            if (glTexture.h) {
                return glTexture.h;
            } else if (glTexture === this.textureAtlasGlTexture) {
                return 2048;
            } else {
                return this.quadViews[index]._displayedTextureSource.h;
            }
        }
    }, {
        key: 'getQuadContents',
        value: function getQuadContents() {
            var floats = this.floats;
            var uints = this.uints;
            var lines = [];
            for (var _i38 = 1; _i38 <= this.length; _i38++) {
                var str = 'entry ' + _i38 + ': ';
                for (var j = 0; j < 4; j++) {
                    var b = _i38 * 16 + j * 4;
                    str += floats[b] + ',' + floats[b + 1] + ':' + uints[b + 2].toString(16) + '[' + uints[b + 3].toString(16) + '] ';
                }
                lines.push(str);
            }

            return lines;
        }
    }, {
        key: 'length',
        get: function get() {
            return this.quadTextures.length;
        }
    }]);

    return CoreQuadList;
}();

var CoreQuadOperation = function () {
    function CoreQuadOperation(ctx, shader, shaderOwner, renderTextureInfo, scissor, index) {
        _classCallCheck(this, CoreQuadOperation);

        this.ctx = ctx;
        this.shader = shader;
        this.shaderOwner = shaderOwner;
        this.renderTextureInfo = renderTextureInfo;
        this.scissor = scissor;
        this.index = index;
        this.length = 0;
        this.extraAttribsDataByteOffset = 0;
    }

    _createClass(CoreQuadOperation, [{
        key: 'getTexture',
        value: function getTexture(index) {
            return this.quads.getTexture(this.index + index);
        }
    }, {
        key: 'getViewCore',
        value: function getViewCore(index) {
            return this.quads.getViewCore(this.index + index);
        }
    }, {
        key: 'getView',
        value: function getView(index) {
            return this.quads.getView(this.index + index);
        }
    }, {
        key: 'getTextureWidth',
        value: function getTextureWidth(index) {
            return this.quads.getTextureWidth(this.index + index);
        }
    }, {
        key: 'getTextureHeight',
        value: function getTextureHeight(index) {
            return this.quads.getTextureHeight(this.index + index);
        }
    }, {
        key: 'getNormalRenderTextureCoords',
        value: function getNormalRenderTextureCoords(x, y) {
            var coords = this.shaderOwner.getRenderTextureCoords(x, y);
            coords[0] /= this.getRenderWidth();
            coords[1] /= this.getRenderHeight();
            coords[0] = coords[0] * 2 - 1;
            coords[1] = 1 - coords[1] * 2;
            return coords;
        }
    }, {
        key: 'getRenderWidth',
        value: function getRenderWidth() {
            if (this.renderTexture) {
                return this.renderTexture.w;
            } else {
                return this.ctx.stage.w;
            }
        }
    }, {
        key: 'getRenderHeight',
        value: function getRenderHeight() {
            if (this.renderTexture) {
                return this.renderTexture.h;
            } else {
                return this.ctx.stage.h;
            }
        }
    }, {
        key: 'getProjection',
        value: function getProjection() {
            if (this.renderTextureInfo === null) {
                return this.ctx.renderExec._projection;
            } else {
                return this.renderTextureInfo.glTexture.projection;
            }
        }
    }, {
        key: 'quads',
        get: function get() {
            return this.ctx.renderState.quads;
        }
    }]);

    return CoreQuadOperation;
}();

var CoreFilterOperation = function () {
    function CoreFilterOperation(ctx, filter, owner, source, renderTexture, beforeQuadOperation) {
        _classCallCheck(this, CoreFilterOperation);

        this.ctx = ctx;
        this.filter = filter;
        this.owner = owner;
        this.source = source;
        this.renderTexture = renderTexture;
        this.beforeQuadOperation = beforeQuadOperation;
    }

    _createClass(CoreFilterOperation, [{
        key: 'getRenderWidth',
        value: function getRenderWidth() {
            if (this.renderTexture) {
                return this.renderTexture.w;
            } else {
                return this.ctx.stage.w;
            }
        }
    }, {
        key: 'getRenderHeight',
        value: function getRenderHeight() {
            if (this.renderTexture) {
                return this.renderTexture.h;
            } else {
                return this.ctx.stage.h;
            }
        }
    }]);

    return CoreFilterOperation;
}();

var CoreRenderExecutor = function () {
    function CoreRenderExecutor(ctx) {
        _classCallCheck(this, CoreRenderExecutor);

        this.ctx = ctx;

        this.renderState = ctx.renderState;

        this.gl = this.ctx.stage.gl;

        this.init();
    }

    _createClass(CoreRenderExecutor, [{
        key: 'init',
        value: function init() {
            var gl = this.gl;

            this._attribsBuffer = gl.createBuffer();

            var maxQuads = Math.floor(this.renderState.quads.data.byteLength / 64);

            var allIndices = new Uint16Array(maxQuads * 6);

            for (var _i39 = 0, j = 0; _i39 < maxQuads; _i39 += 6, j += 4) {
                allIndices[_i39] = j;
                allIndices[_i39 + 1] = j + 1;
                allIndices[_i39 + 2] = j + 2;
                allIndices[_i39 + 3] = j;
                allIndices[_i39 + 4] = j + 2;
                allIndices[_i39 + 5] = j + 3;
            }

            this._quadsBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._quadsBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, allIndices, gl.STATIC_DRAW);

            this._projection = new Float32Array([2 / this.ctx.stage.rw, -2 / this.ctx.stage.rh]);
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            this.gl.deleteBuffer(this._attribsBuffer);
            this.gl.deleteBuffer(this._quadsBuffer);
        }
    }, {
        key: '_reset',
        value: function _reset() {
            this._bindRenderTexture(null);
            this._setScissor(null);
            this._clearRenderTexture();

            var gl = this.gl;
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            gl.enable(gl.BLEND);
            gl.disable(gl.DEPTH_TEST);

            this._quadOperation = null;
            this._currentShaderProgramOwner = null;
        }
    }, {
        key: '_setupBuffers',
        value: function _setupBuffers() {
            var gl = this.gl;
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._quadsBuffer);
            var view = new DataView(this.renderState.quads.data, 0, this.renderState.quads.dataLength);
            gl.bindBuffer(gl.ARRAY_BUFFER, this._attribsBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, view, gl.DYNAMIC_DRAW);
        }
    }, {
        key: 'execute',
        value: function execute() {
            this._reset();
            this._setupBuffers();

            var qops = this.renderState.quadOperations;
            var fops = this.renderState.filterOperations;

            var i = 0,
                j = 0,
                n = qops.length,
                m = fops.length;
            while (i < n) {
                while (j < m && i === fops[j].beforeQuadOperation) {
                    if (this._quadOperation) {
                        this._execQuadOperation(this._quadOperation);
                    }
                    this._execFilterOperation(fops[j]);
                    j++;
                }

                this._processQuadOperation(qops[i]);
                i++;
            }

            if (this._quadOperation) {
                this._execQuadOperation();
            }

            while (j < m) {
                this._execFilterOperation(fops[j]);
                j++;
            }

            this._stopShaderProgram();
        }
    }, {
        key: 'getQuadContents',
        value: function getQuadContents() {
            return this.renderState.quads.getQuadContents();
        }
    }, {
        key: '_mergeQuadOperation',
        value: function _mergeQuadOperation(quadOperation) {
            if (this._quadOperation) {
                this._quadOperation.length += quadOperation.length;

                this._quadOperation.shaderOwner = null;
            }
        }
    }, {
        key: '_processQuadOperation',
        value: function _processQuadOperation(quadOperation) {
            if (quadOperation.renderTextureInfo && quadOperation.renderTextureInfo.ignore) {
                return;
            }

            var shader = quadOperation.shader;

            var merged = false;
            if (this._quadOperation && this._quadOperation.renderTextureInfo === quadOperation.renderTextureInfo && this._quadOperation.scissor === quadOperation.scissor && this._quadOperation.shader.supportsMerging() && quadOperation.shader.supportsMerging()) {
                if (this._quadOperation.shader === shader) {
                    this._mergeQuadOperation(quadOperation);
                    merged = true;
                } else if (shader.hasSameProgram(this._quadOperation.shader)) {
                    shader.setupUniforms(quadOperation);
                    if (shader.isMergable(this._quadOperation.shader)) {
                        this._mergeQuadOperation(quadOperation);
                        merged = true;
                    }
                }
            }

            if (!merged) {
                if (this._quadOperation) {
                    this._execQuadOperation();
                }

                shader.setupUniforms(quadOperation);
                this._quadOperation = quadOperation;
            }
        }
    }, {
        key: '_execQuadOperation',
        value: function _execQuadOperation() {
            var op = this._quadOperation;

            var shader = op.shader;

            if (op.length || shader.addEmpty()) {
                var glTexture = op.renderTextureInfo ? op.renderTextureInfo.glTexture : null;
                if (this._renderTexture !== glTexture) {
                    this._bindRenderTexture(glTexture);
                }

                this._setScissor(op.scissor);

                if (op.renderTextureInfo && !op.renderTextureInfo.cleared) {
                    this._clearRenderTexture();
                    op.renderTextureInfo.cleared = true;
                }

                this._useShaderProgram(shader);

                shader.commitUniformUpdates();

                shader.beforeDraw(op);
                shader.draw(op);
                shader.afterDraw(op);
            }

            this._quadOperation = null;
        }
    }, {
        key: '_execFilterOperation',
        value: function _execFilterOperation(filterOperation) {
            var filter = filterOperation.filter;
            this._useShaderProgram(filter);
            filter.setupUniforms(filterOperation);
            filter.commitUniformUpdates();
            filter.beforeDraw(filterOperation);
            this._bindRenderTexture(filterOperation.renderTexture);
            this._clearRenderTexture();
            this._setScissor(null);
            filter.draw(filterOperation);
            filter.afterDraw(filterOperation);
        }
    }, {
        key: '_useShaderProgram',
        value: function _useShaderProgram(owner) {
            if (!owner.hasSameProgram(this._currentShaderProgramOwner)) {
                if (this._currentShaderProgramOwner) {
                    this._currentShaderProgramOwner.stopProgram();
                }
                owner.useProgram();
                this._currentShaderProgramOwner = owner;
            }
        }
    }, {
        key: '_stopShaderProgram',
        value: function _stopShaderProgram() {
            if (this._currentShaderProgramOwner) {
                this._currentShaderProgramOwner.stopProgram();
                this._currentShaderProgramOwner = null;
            }
        }
    }, {
        key: '_bindRenderTexture',
        value: function _bindRenderTexture(renderTexture) {
            this._renderTexture = renderTexture;

            var gl = this.gl;
            if (!this._renderTexture) {
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                gl.viewport(0, 0, this.ctx.stage.w, this.ctx.stage.h);
            } else {
                gl.bindFramebuffer(gl.FRAMEBUFFER, this._renderTexture.framebuffer);
                gl.viewport(0, 0, this._renderTexture.w, this._renderTexture.h);
            }
        }
    }, {
        key: '_clearRenderTexture',
        value: function _clearRenderTexture() {
            var gl = this.gl;
            if (!this._renderTexture) {
                var glClearColor = this.ctx.stage.options.glClearColor;
                gl.clearColor(glClearColor[0], glClearColor[1], glClearColor[2], glClearColor[3]);
                gl.clear(gl.COLOR_BUFFER_BIT);
            } else {
                gl.clearColor(0, 0, 0, 0);
                gl.clear(gl.COLOR_BUFFER_BIT);
            }
        }
    }, {
        key: '_setScissor',
        value: function _setScissor(area) {
            if (this._scissor !== area) {
                var gl = this.gl;
                if (!area) {
                    gl.disable(gl.SCISSOR_TEST);
                } else {
                    gl.enable(gl.SCISSOR_TEST);
                    if (this._renderTexture === null) {
                        area[1] = this.ctx.stage.h - (area[1] + area[3]);
                    }
                    gl.scissor(area[0], area[1], area[2], area[3]);
                }
                this._scissor = area;
            }
        }
    }]);

    return CoreRenderExecutor;
}();

var ViewText = function (_Base4) {
    _inherits(ViewText, _Base4);

    function ViewText(view) {
        _classCallCheck(this, ViewText);

        var _this14 = _possibleConstructorReturn(this, (ViewText.__proto__ || Object.getPrototypeOf(ViewText)).call(this));

        _this14.view = view;

        _this14.settings = new TextRendererSettings();
        _this14.settings.on('change', function () {
            _this14.updateTexture();
        });
        return _this14;
    }

    _createClass(ViewText, [{
        key: '_properties',
        value: function _properties() {
            this.updatingTexture = null;
        }
    }, {
        key: 'updateTexture',
        value: function updateTexture() {
            var _this15 = this;

            if (this.settings.text == "") {
                this.view.texture = null;
                return;
            }

            if (this.updatingTexture) return;

            this.updatingTexture = true;

            this.view.texture = this.view.stage.texture(function (cb, ts, sync) {
                _this15.updatingTexture = false;

                cb(null, null);

                var settings = _this15.getFinalizedSettings();
                var source = _this15.createTextureSource(settings);

                _this15.view.texture.precision = settings.precision;

                source.load(sync || settings.sync);

                _this15.view.texture.replaceTextureSource(source);
            });
        }
    }, {
        key: 'getFinalizedSettings',
        value: function getFinalizedSettings() {
            var settings = this.settings.clone();
            settings.finalize(this.view);
            return settings;
        }
    }, {
        key: 'createTextureSource',
        value: function createTextureSource(settings) {
            var m = this.view.stage.textureManager;

            var loadCb = function loadCb(cb, ts, sync) {
                m.loadTextTexture(settings, ts, sync, cb);
            };

            return this.view.stage.textureManager.getTextureSource(loadCb, settings.getTextureId());
        }
    }]);

    return ViewText;
}(Base);

var TextRenderer = function () {
    function TextRenderer(canvas, settings) {
        _classCallCheck(this, TextRenderer);

        this._canvas = canvas;
        this._context = this._canvas.getContext('2d');
        this._settings = settings;
    }

    _createClass(TextRenderer, [{
        key: 'getPrecision',
        value: function getPrecision() {
            return this._settings.precision;
        }
    }, {
        key: 'setFontProperties',
        value: function setFontProperties(withPrecision) {
            var ff = this._settings.fontFace;
            var fonts = '"' + (Array.isArray(ff) ? this._settings.fontFace.join('","') : ff) + '"';
            var precision = withPrecision ? this.getPrecision() : 1;
            this._context.font = this._settings.fontStyle + " " + this._settings.fontSize * precision + "px " + fonts;
            this._context.textBaseline = this._settings.textBaseline;
        }
    }, {
        key: 'draw',
        value: function draw() {
            var noDraw = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            var renderInfo = {};

            this.setFontProperties(false);

            var width = this._settings.w || 2048 / this.getPrecision();

            var innerWidth = width - (this._settings.paddingLeft + this._settings.paddingRight);
            if (innerWidth < 10) {
                width += 10 - innerWidth;
                innerWidth += 10 - innerWidth;
            }

            var wordWrapWidth = this._settings.wordWrapWidth || innerWidth;

            var linesInfo = void 0;
            if (this._settings.wordWrap) {
                linesInfo = this.wrapText(this._settings.text, wordWrapWidth);
            } else {
                linesInfo = { l: this._settings.text.split(/(?:\r\n|\r|\n)/), n: [] };
                var _i40 = void 0,
                    n = linesInfo.l.length;
                for (var _i41 = 0; _i41 < n - 1; _i41++) {
                    linesInfo.n.push(_i41);
                }
            }
            var lines = linesInfo.l;

            if (this._settings.maxLines && lines.length > this._settings.maxLines) {
                var usedLines = lines.slice(0, this._settings.maxLines);

                var otherLines = null;
                if (this._settings.maxLinesSuffix) {
                    var al = this.wrapText(usedLines[usedLines.length - 1] + this._settings.maxLinesSuffix, wordWrapWidth);
                    usedLines[usedLines.length - 1] = al.l[0];
                    otherLines = [al.l.length > 1 ? al.l[1] : ''];
                } else {
                    otherLines = [''];
                }

                var _i42 = void 0,
                    _n3 = lines.length;
                var j = 0;
                var m = linesInfo.n.length;
                for (_i42 = this._settings.maxLines; _i42 < _n3; _i42++) {
                    otherLines[j] += (otherLines[j] ? " " : "") + lines[_i42];
                    if (_i42 + 1 < m && linesInfo.n[_i42 + 1]) {
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

            var maxLineWidth = 0;
            var lineWidths = [];
            for (var _i43 = 0; _i43 < lines.length; _i43++) {
                var lineWidth = this._context.measureText(lines[_i43]).width;
                lineWidths.push(lineWidth);
                maxLineWidth = Math.max(maxLineWidth, lineWidth);
            }

            renderInfo.lineWidths = lineWidths;

            if (!this._settings.w) {
                width = maxLineWidth + this._settings.paddingLeft + this._settings.paddingRight;
                innerWidth = maxLineWidth;
            }

            var lineHeight = this._settings.lineHeight || this._settings.fontSize;

            var height = void 0;
            if (this._settings.h) {
                height = this._settings.h;
            } else {
                height = lineHeight * (lines.length - 1) + 0.5 * this._settings.fontSize + Math.max(lineHeight, this._settings.fontSize) + this._settings.offsetY;
            }

            var offsetY = this._settings.offsetY === null ? this._settings.fontSize : this._settings.offsetY;

            var precision = this.getPrecision();

            renderInfo.w = width * precision;
            renderInfo.h = height * precision;
            renderInfo.lines = lines;
            renderInfo.precision = precision;

            if (!noDraw) {
                if (!width) {
                    width = 1;
                }

                if (!height) {
                    height = 1;
                }

                if (this._settings.cutSx || this._settings.cutEx) {
                    width = Math.min(width, this._settings.cutEx - this._settings.cutSx);
                }

                if (this._settings.cutSy || this._settings.cutEy) {
                    height = Math.min(height, this._settings.cutEy - this._settings.cutSy);
                }

                this._canvas.width = Math.ceil(width * precision);
                this._canvas.height = Math.ceil(height * precision);

                this.setFontProperties(true);

                if (this._settings.cutSx || this._settings.cutSy) {
                    this._context.translate(-(this._settings.cutSx * precision), -(this._settings.cutSy * precision));
                }

                var linePositionX = void 0;
                var linePositionY = void 0;

                var drawLines = [];

                for (var _i44 = 0, _n4 = lines.length; _i44 < _n4; _i44++) {
                    linePositionX = 0;
                    linePositionY = _i44 * lineHeight + offsetY;

                    if (this._settings.textAlign === 'right') {
                        linePositionX += innerWidth - lineWidths[_i44];
                    } else if (this._settings.textAlign === 'center') {
                        linePositionX += (innerWidth - lineWidths[_i44]) / 2;
                    }
                    linePositionX += this._settings.paddingLeft;

                    drawLines.push({ text: lines[_i44], x: linePositionX * precision, y: linePositionY * precision, w: lineWidths[_i44] * precision });
                }

                if (this._settings.highlight) {
                    var color = this._settings.highlightColor || 0x00000000;
                    var hlHeight = this._settings.highlightHeight || this._settings.fontSize * 1.5;
                    var offset = this._settings.highlightOffset !== null ? this._settings.highlightOffset : -0.5 * this._settings.fontSize;
                    var paddingLeft = this._settings.highlightPaddingLeft !== null ? this._settings.highlightPaddingLeft : this._settings.paddingLeft;
                    var paddingRight = this._settings.highlightPaddingRight !== null ? this._settings.highlightPaddingRight : this._settings.paddingRight;

                    this._context.fillStyle = StageUtils.getRgbaString(color);
                    for (i = 0; i < drawLines.length; i++) {
                        var drawLine = drawLines[i];
                        this._context.fillRect((drawLine.x - paddingLeft) * precision, (drawLine.y + offset) * precision, (drawLine.w + paddingRight + paddingLeft) * precision, hlHeight * precision);
                    }
                }

                var prevShadowSettings = null;
                if (this._settings.shadow) {
                    prevShadowSettings = [this._context.shadowColor, this._context.shadowOffsetX, this._context.shadowOffsetY, this._context.shadowBlur];

                    this._context.shadowColor = StageUtils.getRgbaString(this._settings.shadowColor);
                    this._context.shadowOffsetX = this._settings.shadowOffsetX * precision;
                    this._context.shadowOffsetY = this._settings.shadowOffsetY * precision;
                    this._context.shadowBlur = this._settings.shadowBlur * precision;
                }

                this._context.fillStyle = StageUtils.getRgbaString(this._settings.textColor);
                for (var _i45 = 0, _n5 = drawLines.length; _i45 < _n5; _i45++) {
                    var _drawLine = drawLines[_i45];
                    this._context.fillText(_drawLine.text, _drawLine.x, _drawLine.y);
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

            var canvas = this._canvas;
            return { renderInfo: renderInfo, canvas: canvas };
        }
    }, {
        key: 'wrapText',
        value: function wrapText(text, wordWrapWidth) {
            var lines = text.split(/\r?\n/g);
            var allLines = [];
            var realNewlines = [];
            for (var _i46 = 0; _i46 < lines.length; _i46++) {
                var resultLines = [];
                var result = '';
                var spaceLeft = wordWrapWidth;
                var words = lines[_i46].split(' ');
                for (var j = 0; j < words.length; j++) {
                    var wordWidth = this._context.measureText(words[j]).width;
                    var wordWidthWithSpace = wordWidth + this._context.measureText(' ').width;
                    if (j === 0 || wordWidthWithSpace > spaceLeft) {
                        if (j > 0) {
                            resultLines.push(result);
                            result = '';
                        }
                        result += words[j];
                        spaceLeft = wordWrapWidth - wordWidth;
                    } else {
                        spaceLeft -= wordWidthWithSpace;
                        result += ' ' + words[j];
                    }
                }

                if (result) {
                    resultLines.push(result);
                    result = '';
                }

                allLines = allLines.concat(resultLines);

                if (_i46 < lines.length - 1) {
                    realNewlines.push(allLines.length);
                }
            }

            return { l: allLines, n: realNewlines };
        }
    }]);

    return TextRenderer;
}();

var TextRendererSettings = function (_Base5) {
    _inherits(TextRendererSettings, _Base5);

    function TextRendererSettings() {
        _classCallCheck(this, TextRendererSettings);

        var _this16 = _possibleConstructorReturn(this, (TextRendererSettings.__proto__ || Object.getPrototypeOf(TextRendererSettings)).call(this));

        EventEmitter.call(_this16);
        return _this16;
    }

    _createClass(TextRendererSettings, [{
        key: '_properties',
        value: function _properties() {
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
    }, {
        key: 'finalize',
        value: function finalize(view) {
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
        }
    }, {
        key: 'getTextureId',
        value: function getTextureId() {
            var parts = [];

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

            var id = "TX$" + parts.join("|") + ":" + this.text;
            return id;
        }
    }, {
        key: 'getNonDefaults',
        value: function getNonDefaults() {
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
    }, {
        key: 'clone',
        value: function clone() {
            var obj = new TextRendererSettings();
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
    }, {
        key: 'text',
        get: function get() {
            return this._text;
        },
        set: function set(v) {
            if (this._text !== v) {
                this._text = v;
                this.emit('change');
            }
        }
    }, {
        key: 'w',
        get: function get() {
            return this._w;
        },
        set: function set(v) {
            if (this._w !== v) {
                this._w = v;
                this.emit('change');
            }
        }
    }, {
        key: 'h',
        get: function get() {
            return this._h;
        },
        set: function set(v) {
            if (this._h !== v) {
                this._h = v;
                this.emit('change');
            }
        }
    }, {
        key: 'fontStyle',
        get: function get() {
            return this._fontStyle;
        },
        set: function set(v) {
            if (this._fontStyle !== v) {
                this._fontStyle = v;
                this.emit('change');
            }
        }
    }, {
        key: 'fontSize',
        get: function get() {
            return this._fontSize;
        },
        set: function set(v) {
            if (this._fontSize !== v) {
                this._fontSize = v;
                this.emit('change');
            }
        }
    }, {
        key: 'fontFace',
        get: function get() {
            return this._fontFace;
        },
        set: function set(v) {
            if (this._fontFace !== v) {
                this._fontFace = v;
                this.emit('change');
            }
        }
    }, {
        key: 'wordWrap',
        get: function get() {
            return this._wordWrap;
        },
        set: function set(v) {
            if (this._wordWrap !== v) {
                this._wordWrap = v;
                this.emit('change');
            }
        }
    }, {
        key: 'wordWrapWidth',
        get: function get() {
            return this._wordWrapWidth;
        },
        set: function set(v) {
            if (this._wordWrapWidth !== v) {
                this._wordWrapWidth = v;
                this.emit('change');
            }
        }
    }, {
        key: 'lineHeight',
        get: function get() {
            return this._lineHeight;
        },
        set: function set(v) {
            if (this._lineHeight !== v) {
                this._lineHeight = v;
                this.emit('change');
            }
        }
    }, {
        key: 'textBaseline',
        get: function get() {
            return this._textBaseline;
        },
        set: function set(v) {
            if (this._textBaseline !== v) {
                this._textBaseline = v;
                this.emit('change');
            }
        }
    }, {
        key: 'textAlign',
        get: function get() {
            return this._textAlign;
        },
        set: function set(v) {
            if (this._textAlign !== v) {
                this._textAlign = v;
                this.emit('change');
            }
        }
    }, {
        key: 'offsetY',
        get: function get() {
            return this._offsetY;
        },
        set: function set(v) {
            if (this._offsetY !== v) {
                this._offsetY = v;
                this.emit('change');
            }
        }
    }, {
        key: 'maxLines',
        get: function get() {
            return this._maxLines;
        },
        set: function set(v) {
            if (this._maxLines !== v) {
                this._maxLines = v;
                this.emit('change');
            }
        }
    }, {
        key: 'maxLinesSuffix',
        get: function get() {
            return this._maxLinesSuffix;
        },
        set: function set(v) {
            if (this._maxLinesSuffix !== v) {
                this._maxLinesSuffix = v;
                this.emit('change');
            }
        }
    }, {
        key: 'precision',
        get: function get() {
            return this._precision;
        },
        set: function set(v) {
            if (this._precision !== v) {
                this._precision = v;
                this.emit('change');
            }
        }
    }, {
        key: 'textColor',
        get: function get() {
            return this._textColor;
        },
        set: function set(v) {
            if (this._textColor !== v) {
                this._textColor = v;
                this.emit('change');
            }
        }
    }, {
        key: 'paddingLeft',
        get: function get() {
            return this._paddingLeft;
        },
        set: function set(v) {
            if (this._paddingLeft !== v) {
                this._paddingLeft = v;
                this.emit('change');
            }
        }
    }, {
        key: 'paddingRight',
        get: function get() {
            return this._paddingRight;
        },
        set: function set(v) {
            if (this._paddingRight !== v) {
                this._paddingRight = v;
                this.emit('change');
            }
        }
    }, {
        key: 'shadow',
        get: function get() {
            return this._shadow;
        },
        set: function set(v) {
            if (this._shadow !== v) {
                this._shadow = v;
                this.emit('change');
            }
        }
    }, {
        key: 'shadowColor',
        get: function get() {
            return this._shadowColor;
        },
        set: function set(v) {
            if (this._shadowColor !== v) {
                this._shadowColor = v;
                this.emit('change');
            }
        }
    }, {
        key: 'shadowOffsetX',
        get: function get() {
            return this._shadowOffsetX;
        },
        set: function set(v) {
            if (this._shadowOffsetX !== v) {
                this._shadowOffsetX = v;
                this.emit('change');
            }
        }
    }, {
        key: 'shadowOffsetY',
        get: function get() {
            return this._shadowOffsetY;
        },
        set: function set(v) {
            if (this._shadowOffsetY !== v) {
                this._shadowOffsetY = v;
                this.emit('change');
            }
        }
    }, {
        key: 'shadowBlur',
        get: function get() {
            return this._shadowBlur;
        },
        set: function set(v) {
            if (this._shadowBlur !== v) {
                this._shadowBlur = v;
                this.emit('change');
            }
        }
    }, {
        key: 'highlight',
        get: function get() {
            return this._highlight;
        },
        set: function set(v) {
            if (this._highlight !== v) {
                this._highlight = v;
                this.emit('change');
            }
        }
    }, {
        key: 'highlightHeight',
        get: function get() {
            return this._highlightHeight;
        },
        set: function set(v) {
            if (this._highlightHeight !== v) {
                this._highlightHeight = v;
                this.emit('change');
            }
        }
    }, {
        key: 'highlightColor',
        get: function get() {
            return this._highlightColor;
        },
        set: function set(v) {
            if (this._highlightColor !== v) {
                this._highlightColor = v;
                this.emit('change');
            }
        }
    }, {
        key: 'highlightOffset',
        get: function get() {
            return this._highlightOffset;
        },
        set: function set(v) {
            if (this._highlightOffset !== v) {
                this._highlightOffset = v;
                this.emit('change');
            }
        }
    }, {
        key: 'highlightPaddingLeft',
        get: function get() {
            return this._highlightPaddingLeft;
        },
        set: function set(v) {
            if (this._highlightPaddingLeft !== v) {
                this._highlightPaddingLeft = v;
                this.emit('change');
            }
        }
    }, {
        key: 'highlightPaddingRight',
        get: function get() {
            return this._highlightPaddingRight;
        },
        set: function set(v) {
            if (this._highlightPaddingRight !== v) {
                this._highlightPaddingRight = v;
                this.emit('change');
            }
        }
    }, {
        key: 'cutSx',
        get: function get() {
            return this._cutSx;
        },
        set: function set(v) {
            if (this._cutSx !== v) {
                this._cutSx = v;
                this.emit('change');
            }
        }
    }, {
        key: 'cutEx',
        get: function get() {
            return this._cutEx;
        },
        set: function set(v) {
            if (this._cutEx !== v) {
                this._cutEx = v;
                this.emit('change');
            }
        }
    }, {
        key: 'cutSy',
        get: function get() {
            return this._cutSy;
        },
        set: function set(v) {
            if (this._cutSy !== v) {
                this._cutSy = v;
                this.emit('change');
            }
        }
    }, {
        key: 'cutEy',
        get: function get() {
            return this._cutEy;
        },
        set: function set(v) {
            if (this._cutEy !== v) {
                this._cutEy = v;
                this.emit('change');
            }
        }
    }]);

    return TextRendererSettings;
}(Base);

Base.mixinEs5(TextRendererSettings, EventEmitter);

var TransitionManager = function () {
    function TransitionManager(stage) {
        var _this17 = this;

        _classCallCheck(this, TransitionManager);

        this.stage = stage;

        this.stage.on('frameStart', function () {
            return _this17.progress();
        });

        this.active = new Set();

        this.defaultTransitionSettings = new TransitionSettings();
    }

    _createClass(TransitionManager, [{
        key: 'progress',
        value: function progress() {
            if (this.active.size) {
                var dt = this.stage.dt;

                var filter = false;
                this.active.forEach(function (a) {
                    if (a.isActive()) {
                        a.progress(dt);
                    } else {
                        filter = true;
                    }
                });

                if (filter) {
                    this.active = new Set([].concat(_toConsumableArray(this.active)).filter(function (t) {
                        return t.isActive();
                    }));
                }
            }
        }
    }, {
        key: 'createSettings',
        value: function createSettings(settings) {
            var transitionSettings = new TransitionSettings();
            Base.setObjectSettings(transitionSettings, settings);
            return transitionSettings;
        }
    }, {
        key: 'addActive',
        value: function addActive(transition) {
            this.active.add(transition);
        }
    }]);

    return TransitionManager;
}();

var TransitionSettings = function (_Base6) {
    _inherits(TransitionSettings, _Base6);

    function TransitionSettings() {
        _classCallCheck(this, TransitionSettings);

        return _possibleConstructorReturn(this, (TransitionSettings.__proto__ || Object.getPrototypeOf(TransitionSettings)).call(this));
    }

    _createClass(TransitionSettings, [{
        key: '_properties',
        value: function _properties() {
            this._timingFunction = 'ease';
            this._timingFunctionImpl = StageUtils.getTimingFunction(this._timingFunction);
            this.delay = 0;
            this.duration = 0.2;
            this.isTransitionSettings = true;
            this.merger = null;
        }
    }, {
        key: 'timingFunction',
        get: function get() {
            return this._timingFunction;
        },
        set: function set(v) {
            this._timingFunction = v;
            this._timingFunctionImpl = StageUtils.getTimingFunction(v);
        }
    }, {
        key: 'timingFunctionImpl',
        get: function get() {
            return this._timingFunctionImpl;
        }
    }]);

    return TransitionSettings;
}(Base);

var Transition = function (_Base7) {
    _inherits(Transition, _Base7);

    function Transition(manager, settings, view, property) {
        _classCallCheck(this, Transition);

        var _this19 = _possibleConstructorReturn(this, (Transition.__proto__ || Object.getPrototypeOf(Transition)).call(this));

        EventEmitter.call(_this19);

        _this19.manager = manager;

        _this19._settings = settings;

        if (!View) {
            View = require('../core/View');
        }
        _this19._view = view;
        _this19._getter = View.getGetter(property);
        _this19._setter = View.getSetter(property);

        _this19._merger = settings.merger;

        if (!_this19._merger) {
            if (view.isColorProperty(property)) {
                _this19._merger = StageUtils.mergeColors;
            } else {
                _this19._merger = StageUtils.mergeNumbers;
            }
        }

        _this19._startValue = _this19._getter(_this19._view);
        _this19._targetValue = _this19._startValue;

        _this19._p = 1;
        _this19._delayLeft = 0;
        return _this19;
    }

    _createClass(Transition, [{
        key: '_properties',
        value: function _properties() {
            this.isTransition = true;
        }
    }, {
        key: 'stop',
        value: function stop() {
            if (this.isActive()) {
                this._setter(this.targetValue);
                this._p = 1;
            }
        }
    }, {
        key: 'reset',
        value: function reset(targetValue, p) {
            this._startValue = this._getter(this._view);
            this._targetValue = targetValue;
            this._p = p;

            if (p < 1) {
                this.checkActive();
            } else if (p === 1) {
                this._setter(targetValue);

                this.invokeListeners();
            }
        }
    }, {
        key: 'start',
        value: function start(targetValue) {
            this._startValue = this._getter(this._view);

            if (targetValue === this._startValue) {
                this.reset(this._startValue, targetValue, 1);
            } else {
                this._targetValue = targetValue;
                this._p = 0;
                this._delayLeft = this._settings.delay;
                if (this._eventsCount) this.emit('start');
                this.checkActive();

                if (!this._view.isAttached()) {
                    this.finish();
                }
            }
        }
    }, {
        key: 'finish',
        value: function finish() {
            if (this._p < 1) {
                this._p = 1;

                this._setter(this._view, this.targetValue);

                if (this._eventsCount) {
                    this.invokeListeners();
                }
            }
        }
    }, {
        key: 'checkActive',
        value: function checkActive() {
            if (this.isActive()) {
                this.manager.addActive(this);
            }
        }
    }, {
        key: 'isActive',
        value: function isActive() {
            return this._p < 1.0 && this._view.isAttached();
        }
    }, {
        key: 'progress',
        value: function progress(dt) {
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
                    this._p = 1;
                }
            }

            this._setter(this._view, this.getDrawValue());

            if (this._eventsCount) {
                this.invokeListeners();
            }
        }
    }, {
        key: 'invokeListeners',
        value: function invokeListeners() {
            this.emit('progress', this.p);
            if (this.p === 1) {
                this.emit('finish');
            }
        }
    }, {
        key: 'setValuesDynamic',
        value: function setValuesDynamic(targetValue) {
            var t = this._settings.timingFunctionImpl(this.p);
            if (t === 1) {
                this._targetValue = targetValue;
            } else if (t === 0) {
                this._startValue = this._targetValue;
                this._targetValue = targetValue;
            } else {
                this._startValue = targetValue - (targetValue - this._targetValue) / (1 - v);
                this._targetValue = targetValue;
            }
        }
    }, {
        key: 'getDrawValue',
        value: function getDrawValue() {
            if (this.p >= 1) {
                return this.targetValue;
            } else {
                var _v2 = this._settings._timingFunctionImpl(this.p);
                return this._merger(this.targetValue, this.startValue, _v2);
            }
        }
    }, {
        key: 'skipDelay',
        value: function skipDelay() {
            this._delayLeft = 0;
        }
    }, {
        key: 'startValue',
        get: function get() {
            return this._startValue;
        }
    }, {
        key: 'targetValue',
        get: function get() {
            return this._targetValue;
        }
    }, {
        key: 'p',
        get: function get() {
            return this._p;
        }
    }, {
        key: 'delayLeft',
        get: function get() {
            return this._delayLeft;
        }
    }, {
        key: 'view',
        get: function get() {
            return this._view;
        }
    }, {
        key: 'settings',
        get: function get() {
            return this._settings;
        },
        set: function set(v) {
            this._settings = v;
        }
    }]);

    return Transition;
}(Base);

Base.mixinEs5(Transition, EventEmitter);

var AnimationManager = function () {
    function AnimationManager(stage) {
        var _this20 = this;

        _classCallCheck(this, AnimationManager);

        this.stage = stage;

        this.stage.on('frameStart', function () {
            return _this20.progress();
        });

        this.active = new Set();
    }

    _createClass(AnimationManager, [{
        key: 'progress',
        value: function progress() {
            if (this.active.size) {
                var dt = this.stage.dt;

                var filter = false;
                this.active.forEach(function (a) {
                    if (a.isActive()) {
                        a.progress(dt);
                    } else {
                        filter = true;
                    }
                });

                if (filter) {
                    this.active = new Set([].concat(_toConsumableArray(this.active)).filter(function (t) {
                        return t.isActive();
                    }));
                }
            }
        }
    }, {
        key: 'createAnimation',
        value: function createAnimation(view, settings) {
            if (Utils.isObjectLiteral(settings)) {
                settings = this.createSettings(settings);
            }

            return new Animation(this, settings, view);
        }
    }, {
        key: 'createSettings',
        value: function createSettings(settings) {
            var animationSettings = new AnimationSettings();
            Base.setObjectSettings(animationSettings, settings);
            return animationSettings;
        }
    }, {
        key: 'addActive',
        value: function addActive(transition) {
            this.active.add(transition);
        }
    }]);

    return AnimationManager;
}();

var AnimationSettings = function (_Base8) {
    _inherits(AnimationSettings, _Base8);

    function AnimationSettings() {
        _classCallCheck(this, AnimationSettings);

        var _this21 = _possibleConstructorReturn(this, (AnimationSettings.__proto__ || Object.getPrototypeOf(AnimationSettings)).call(this));

        _this21._actions = [];
        return _this21;
    }

    _createClass(AnimationSettings, [{
        key: '_properties',
        value: function _properties() {
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
    }, {
        key: 'apply',
        value: function apply(view, p) {
            var factor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

            this._actions.forEach(function (action) {
                action.apply(view, p, factor);
            });
        }
    }, {
        key: 'reset',
        value: function reset(view) {
            this._actions.forEach(function (action) {
                action.reset(view);
            });
        }
    }, {
        key: 'actions',
        get: function get() {
            return this._actions;
        },
        set: function set(v) {
            this._actions = [];
            for (var _i47 = 0, n = v.length; _i47 < n; _i47++) {
                var e = v[_i47];
                if (!e.isAnimationActionSettings) {
                    var aas = new AnimationActionSettings(this);
                    aas.setSettings(e);
                    this._actions.push(aas);
                } else {
                    this._actions.push(e);
                }
            }
        }
    }, {
        key: 'stopTimingFunction',
        get: function get() {
            return this._stopTimingFunction;
        },
        set: function set(v) {
            this._stopTimingFunction = v;
            this._stopTimingFunctionImpl = StageUtils.getTimingFunction(v);
        }
    }, {
        key: 'stopTimingFunctionImpl',
        get: function get() {
            return this._stopTimingFunctionImpl;
        }
    }]);

    return AnimationSettings;
}(Base);

AnimationSettings.STOP_METHODS = {
    FADE: 'fade',
    REVERSE: 'reverse',
    FORWARD: 'forward',
    IMMEDIATE: 'immediate',
    ONETOTWO: 'onetotwo'
};

var AnimationActionSettings = function (_Base9) {
    _inherits(AnimationActionSettings, _Base9);

    function AnimationActionSettings() {
        _classCallCheck(this, AnimationActionSettings);

        var _this22 = _possibleConstructorReturn(this, (AnimationActionSettings.__proto__ || Object.getPrototypeOf(AnimationActionSettings)).call(this));

        _this22._tags = null;

        _this22._items = new AnimationActionItems(_this22);

        _this22._props = [];

        _this22._propSetters = [];

        _this22._merger = undefined;
        return _this22;
    }

    _createClass(AnimationActionSettings, [{
        key: '_properties',
        value: function _properties() {
            this._resetValue = undefined;
            this._hasResetValue = false;

            this.isAnimationActionSettings = true;
        }
    }, {
        key: 'getResetValue',
        value: function getResetValue() {
            if (this._hasResetValue) {
                return this._resetValue;
            } else {
                return this._items.getValue(0);
            }
            return 0;
        }
    }, {
        key: 'apply',
        value: function apply(view, p, factor) {
            var views = this.getAnimatedViews(view);

            var v = this._items.getValue(p);

            if (v === undefined || !views.length) {
                return;
            }

            if (factor !== 1) {
                var sv = this.getResetValue();
                if (this._merger) {
                    v = this._merger(v, sv, factor);
                }
            }

            var n = this._propSetters.length;

            var m = views.length;
            for (var j = 0; j < m; j++) {
                for (var _i48 = 0; _i48 < n; _i48++) {
                    this._propSetters[_i48](views[j], v);
                }
            }
        }
    }, {
        key: 'getAnimatedViews',
        value: function getAnimatedViews(view) {
            if (!this._tags) {
                return [view];
            }

            var n = this._tags.length;

            if (n === 1) {
                if (this._tags[0] == '') {
                    return [view];
                } else {
                    return view.mtag(this._tags[0]);
                }
            } else {
                var views = [];
                for (var _i49 = 0; _i49 < n; _i49++) {
                    if (this._tags[_i49] === '') {
                        views.push(view);
                    } else {
                        var vs = view.mtag(this._tags[_i49]);
                        views = views.concat(vs);
                    }
                }
                return views;
            }
        }
    }, {
        key: 'reset',
        value: function reset(view) {
            var views = this.getAnimatedViews(view);

            var v = this.getResetValue();

            if (v === undefined || !views.length) {
                return;
            }

            var n = this._propSetters.length;

            var m = views.length;
            for (var j = 0; j < m; j++) {
                for (var _i50 = 0; _i50 < n; _i50++) {
                    this._propSetters[_i50](views[j], v);
                }
            }
        }
    }, {
        key: 'tags',
        get: function get() {
            return this._tags;
        },
        set: function set(v) {
            if (!Array.isArray(v)) {
                v = [v];
            }
            this._tags = v;
        }
    }, {
        key: 't',
        set: function set(v) {
            this.tags = v;
        }
    }, {
        key: 'resetValue',
        get: function get() {
            return this._resetValue;
        },
        set: function set(v) {
            this._resetValue = v;
            this._hasResetValue = v !== undefined;
        }
    }, {
        key: 'rv',
        set: function set(v) {
            this.resetValue = v;
        }
    }, {
        key: 'value',
        set: function set(v) {
            this._items.parse(v);
        }
    }, {
        key: 'v',
        set: function set(v) {
            this.value = v;
        }
    }, {
        key: 'properties',
        set: function set(v) {
            var _this23 = this;

            if (!Array.isArray(v)) {
                v = [v];
            }

            this._props = [];

            var detectMerger = this._merger === undefined;

            var first = true;
            v.forEach(function (prop) {
                _this23._props.push(prop);
                _this23._propSetters.push(View.getSetter(prop));

                if (detectMerger) {
                    var merger = View.getMerger(prop);
                    if (first) {
                        _this23._merger = merger;
                        first = false;
                    } else {
                        if (_this23._merger !== merger) {
                            console.warn('Merger conflicts for animation action properties: ' + v.join(','));
                            _this23._merger = undefined;
                        }
                    }
                }
            });
        }
    }, {
        key: 'property',
        set: function set(v) {
            this.properties = v;
        }
    }, {
        key: 'p',
        set: function set(v) {
            this.properties = v;
        }
    }, {
        key: 'merger',
        set: function set(f) {
            if (this._items.length) {
                console.trace('You should specify the merger before the values');
            }

            if (f === 'numbers') {
                f = StageUtils.mergeNumbers;
            } else if (f === 'colors') {
                f = StageUtils.mergeColors;
            }

            this._merger = f;
        }
    }]);

    return AnimationActionSettings;
}(Base);

var AnimationActionItems = function (_Base10) {
    _inherits(AnimationActionItems, _Base10);

    function AnimationActionItems(action) {
        _classCallCheck(this, AnimationActionItems);

        var _this24 = _possibleConstructorReturn(this, (AnimationActionItems.__proto__ || Object.getPrototypeOf(AnimationActionItems)).call(this));

        _this24._action = action;

        _this24._clear();
        return _this24;
    }

    _createClass(AnimationActionItems, [{
        key: '_clear',
        value: function _clear() {
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
    }, {
        key: 'parse',
        value: function parse(def) {
            var i = void 0,
                n = void 0;
            if (!Utils.isObjectLiteral(def)) {
                def = { 0: def };
            }

            var items = [];
            for (var key in def) {
                if (def.hasOwnProperty(key)) {
                    var obj = def[key];
                    if (!Utils.isObjectLiteral(obj)) {
                        obj = { v: obj };
                    }

                    var _p7 = parseFloat(key);
                    if (!isNaN(_p7) && _p7 >= 0 && _p7 <= 2) {
                        obj.p = _p7;

                        obj.f = Utils.isFunction(obj.v);
                        obj.lv = obj.f ? obj.v(0, 0) : obj.v;

                        items.push(obj);
                    }
                }
            }

            items = items.sort(function (a, b) {
                return a.p - b.p;
            });

            n = items.length;

            for (i = 0; i < n; i++) {
                var last = i == n - 1;
                if (!items[i].hasOwnProperty('pe')) {
                    items[i].pe = last ? items[i].p <= 1 ? 1 : 2 : items[i + 1].p;
                } else {
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

            if (this._action._merger) {
                var rgba = this._action._merger === StageUtils.mergeColors;

                for (i = 0; i < n; i++) {
                    if (!items[i].hasOwnProperty('sm')) {
                        items[i].sm = 0.5;
                    }
                    if (!items[i].hasOwnProperty('s')) {
                        if (i === 0 || i === n - 1 || items[i].p === 1) {
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
                                    items[i].s = [d * (nc[0] - pc[0]), d * (nc[1] - pc[1]), d * (nc[2] - pc[2]), d * (nc[3] - pc[3])];
                                } else {
                                    items[i].s = (ni.lv - pi.lv) / (ni.p - pi.p);
                                }
                            }
                        }
                    }
                }

                for (i = 0; i < n - 1; i++) {
                    if (!items[i].f) {
                        var _last = i === n - 1;
                        if (!items[i].hasOwnProperty('sme')) {
                            items[i].sme = _last ? 0.5 : items[i + 1].sm;
                        }
                        if (!items[i].hasOwnProperty('se')) {
                            items[i].se = _last ? rgba ? [0, 0, 0, 0] : 0 : items[i + 1].s;
                        }
                        if (!items[i].hasOwnProperty('ve')) {
                            items[i].ve = _last ? items[i].lv : items[i + 1].lv;
                        }

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
    }, {
        key: '_add',
        value: function _add(item) {
            this._p.push(item.p || 0);
            this._pe.push(item.pe || 0);
            this._idp.push(item.idp || 0);
            this._f.push(item.f || false);
            this._v.push(item.hasOwnProperty('v') ? item.v : 0);
            this._lv.push(item.lv || 0);
            this._sm.push(item.sm || 0);
            this._s.push(item.s || 0);
            this._ve.push(item.ve || 0);
            this._sme.push(item.sme || 0);
            this._se.push(item.se || 0);
            this._length++;
        }
    }, {
        key: '_getItem',
        value: function _getItem(p) {
            var n = this._length;
            if (!n) {
                return -1;
            }

            if (p < this._p[0]) {
                return -1;
            }

            for (var _i51 = 0; _i51 < n; _i51++) {
                if (this._p[_i51] <= p && p < this._pe[_i51]) {
                    return _i51;
                }
            }

            return n - 1;
        }
    }, {
        key: 'getValue',
        value: function getValue(p) {
            var i = this._getItem(p);
            if (i == -1) {
                return undefined;
            } else {
                if (this._f[i]) {
                    var o = (p - this._p[i]) * this._idp[i];
                    return this._v[i](o);
                } else {
                    return this._v[i];
                }
            }
        }
    }, {
        key: 'length',
        get: function get() {
            return this._length;
        }
    }]);

    return AnimationActionItems;
}(Base);

var Animation = function (_Base11) {
    _inherits(Animation, _Base11);

    function Animation(manager, settings, view) {
        _classCallCheck(this, Animation);

        var _this25 = _possibleConstructorReturn(this, (Animation.__proto__ || Object.getPrototypeOf(Animation)).call(this));

        EventEmitter.call(_this25);

        _this25.manager = manager;

        _this25._settings = settings;

        _this25._view = view;

        _this25._state = Animation.STATES.IDLE;
        return _this25;
    }

    _createClass(Animation, [{
        key: '_properties',
        value: function _properties() {
            this._p = 0;
            this._delayLeft = 0;
            this._repeatsLeft = 0;

            this._stopDelayLeft = 0;
            this._stopP = 0;
        }
    }, {
        key: 'start',
        value: function start() {
            if (this._view && this._view.isAttached()) {
                this._p = 0;
                this._delayLeft = this.settings.delay;
                this._repeatsLeft = this.settings.repeat;
                this._state = Animation.STATES.PLAYING;
                if (this._eventsCount) this.emit('start');
                this.checkActive();
            } else {
                console.warn("View must be attached before starting animation");
            }
        }
    }, {
        key: 'play',
        value: function play() {
            if (this._state == Animation.STATES.STOPPING && this.settings.stopMethod == AnimationSettings.STOP_METHODS.REVERSE) {
                this._state = Animation.STATES.PLAYING;
                if (this._eventsCount) this.emit('stopContinue');
            } else if (this._state != Animation.STATES.PLAYING && this._state != Animation.STATES.FINISHED) {
                this.start();
            }
        }
    }, {
        key: 'replay',
        value: function replay() {
            if (this._state == Animation.STATES.FINISHED) {
                this.start();
            } else {
                this.play();
            }
        }
    }, {
        key: 'skipDelay',
        value: function skipDelay() {
            this._delayLeft = 0;
            this._stopDelayLeft = 0;
        }
    }, {
        key: 'finish',
        value: function finish() {
            if (this._state === Animation.STATES.PLAYING) {
                this._delayLeft = 0;
                this._p = 1;
            } else if (this._state === Animation.STATES.STOPPING) {
                this._stopDelayLeft = 0;
                this._p = 0;
            }
        }
    }, {
        key: 'stop',
        value: function stop() {
            if (this._state === Animation.STATES.STOPPED || this._state === Animation.STATES.IDLE) return;

            this._stopDelayLeft = this.settings.stopDelay || 0;

            if (this.settings.stopMethod === AnimationSettings.STOP_METHODS.IMMEDIATE && !this._stopDelayLeft || this._delayLeft > 0) {
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
    }, {
        key: 'stopNow',
        value: function stopNow() {
            if (this._state !== Animation.STATES.STOPPED || this._state !== Animation.STATES.IDLE) {
                this._state = Animation.STATES.STOPPING;
                this._p = 0;
                if (this._eventsCount) this.emit('stop');
                this.reset();
                this._state = Animation.STATES.STOPPED;
                if (this._eventsCount) this.emit('stopFinish');
            }
        }
    }, {
        key: 'isPlaying',
        value: function isPlaying() {
            return this._state === Animation.STATES.PLAYING;
        }
    }, {
        key: 'isStopping',
        value: function isStopping() {
            return this._state === Animation.STATES.STOPPING;
        }
    }, {
        key: 'checkActive',
        value: function checkActive() {
            if (this.isActive()) {
                this.manager.addActive(this);
            }
        }
    }, {
        key: 'isActive',
        value: function isActive() {
            return (this._state == Animation.STATES.PLAYING || this._state == Animation.STATES.STOPPING) && this._view && this._view.isAttached();
        }
    }, {
        key: 'progress',
        value: function progress(dt) {
            if (!this._view) return;
            this._progress(dt);
            this.apply();
        }
    }, {
        key: '_progress',
        value: function _progress(dt) {
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
    }, {
        key: '_stopProgress',
        value: function _stopProgress(dt) {
            var duration = this._getStopDuration();

            if (this._stopDelayLeft > 0) {
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
    }, {
        key: '_progressStopTransition',
        value: function _progressStopTransition(dt) {
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

                var duration = this._getStopDuration();

                if (duration == 0) {
                    this._stopP = 1;
                } else {
                    this._stopP += dt / duration;
                }
                if (this._stopP >= 1) {
                    this._stopP = 1;
                }
            }
        }
    }, {
        key: '_getStopDuration',
        value: function _getStopDuration() {
            return this.settings.stopDuration || this.settings.duration;
        }
    }, {
        key: 'apply',
        value: function apply() {
            if (this._state == Animation.STATES.STOPPED) {
                this.reset();
            } else {
                var factor = 1;
                if (this._state === Animation.STATES.STOPPING && this.settings.stopMethod === AnimationSettings.STOP_METHODS.FADE) {
                    factor = 1 - this.settings.stopTimingFunctionImpl(this._stopP);
                }
                this._settings.apply(this._view, this._p, factor);
            }
        }
    }, {
        key: 'reset',
        value: function reset() {
            this._settings.reset(this._view);
        }
    }, {
        key: 'state',
        get: function get() {
            return this._state;
        }
    }, {
        key: 'p',
        get: function get() {
            return this._p;
        }
    }, {
        key: 'delayLeft',
        get: function get() {
            return this._delayLeft;
        }
    }, {
        key: 'view',
        get: function get() {
            return this._view;
        }
    }, {
        key: 'frame',
        get: function get() {
            return Math.round(p * this._settings.duration * 60);
        }
    }, {
        key: 'settings',
        get: function get() {
            return this._settings;
        }
    }]);

    return Animation;
}(Base);

Base.mixinEs5(Animation, EventEmitter);

Animation.STATES = {
    IDLE: 0,
    PLAYING: 1,
    STOPPING: 2,
    STOPPED: 3,
    FINISHED: 4
};

var Tools = function () {
    function Tools() {
        _classCallCheck(this, Tools);
    }

    _createClass(Tools, null, [{
        key: 'getCanvasTexture',
        value: function getCanvasTexture(stage, canvas) {
            var texOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
            var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

            return stage.texture(function (cb) {
                var data = canvas;
                var options = {};
                if (Utils.isNode) {
                    data = canvas.toBuffer('raw');
                    options.w = canvas.width;
                    options.h = canvas.height;
                    options.premultiplyAlpha = false;
                    options.flipBlueRed = true;
                }
                cb(null, data, options);
            }, texOptions);
        }
    }, {
        key: 'getRoundRect',
        value: function getRoundRect(stage, w, h, radius, strokeWidth, strokeColor, fill, fillColor) {
            var canvas = this.createRoundRect(stage, w, h, radius, strokeWidth, strokeColor, fill, fillColor);
            var id = 'rect' + [w, h, radius, strokeWidth, strokeColor, fill ? 1 : 0, fillColor].join(",");
            return Tools.getCanvasTexture(stage, canvas, { id: id });
        }
    }, {
        key: 'createRoundRect',
        value: function createRoundRect(stage, w, h, radius, strokeWidth, strokeColor, fill, fillColor) {
            if (fill === undefined) fill = true;
            if (strokeWidth === undefined) strokeWidth = 0;

            var canvas = stage.adapter.getDrawingCanvas();
            var ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;

            var id = 'rect' + [w, h, radius, strokeWidth, strokeColor, fill ? 1 : 0, fillColor].join(",");
            canvas.width = w + strokeWidth + 2;
            canvas.height = h + strokeWidth + 2;

            ctx.beginPath();
            var x = 0.5 * strokeWidth + 1,
                y = 0.5 * strokeWidth + 1;
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
    }]);

    return Tools;
}();

var ListView = function (_View) {
    _inherits(ListView, _View);

    function ListView(stage) {
        _classCallCheck(this, ListView);

        var _this26 = _possibleConstructorReturn(this, (ListView.__proto__ || Object.getPrototypeOf(ListView)).call(this, stage));

        _this26._wrapper = _get(ListView.prototype.__proto__ || Object.getPrototypeOf(ListView.prototype), '_children', _this26).a({});

        _this26._reloadVisibleElements = false;

        _this26._visibleItems = new Set();

        _this26._index = 0;

        _this26._started = false;

        _this26._scrollTransitionSettings = _this26.stage.transitions.createSettings({});

        _this26._itemSize = 100;

        _this26._viewportScrollOffset = 0;

        _this26._itemScrollOffset = 0;

        _this26._roll = false;

        _this26._rollMin = 0;

        _this26._rollMax = 0;

        _this26._progressAnimation = null;

        _this26._invertDirection = false;

        _this26._horizontal = true;

        return _this26;
    }

    _createClass(ListView, [{
        key: '_getExposedChildList',
        value: function _getExposedChildList() {
            return new (function (_ViewChildList) {
                _inherits(_class, _ViewChildList);

                function _class(view, list) {
                    _classCallCheck(this, _class);

                    var _this27 = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, view));

                    _this27.list = list;
                    return _this27;
                }

                _createClass(_class, [{
                    key: 'addAt',
                    value: function addAt(view, index) {
                        var encaps = view.stage.createView();
                        encaps.add(view);
                        encaps.visible = false;
                        _get(_class.prototype.__proto__ || Object.getPrototypeOf(_class.prototype), 'addAt', this).call(this, encaps, index);

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
                }, {
                    key: 'getIndex',
                    value: function getIndex(view) {
                        return _get(_class.prototype.__proto__ || Object.getPrototypeOf(_class.prototype), 'getIndex', this).call(this, view.parent);
                    }
                }, {
                    key: 'removeAt',
                    value: function removeAt(index) {
                        var ri = this.list.realIndex;

                        var view = _get(_class.prototype.__proto__ || Object.getPrototypeOf(_class.prototype), 'removeAt', this).call(this, index);

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
                }, {
                    key: 'get',
                    value: function get() {
                        return _get(_class.prototype.__proto__ || Object.getPrototypeOf(_class.prototype), 'get', this).call(this).map(function (view) {
                            return view._children.get()[0];
                        });
                    }
                }, {
                    key: 'clear',
                    value: function clear() {
                        _get(_class.prototype.__proto__ || Object.getPrototypeOf(_class.prototype), 'clear', this).call(this);
                        this.list._reloadVisibleElements = true;
                        this.list._index = 0;
                    }
                }]);

                return _class;
            }(ViewChildList))(this._wrapper, this);
        }
    }, {
        key: 'start',
        value: function start() {
            var _this28 = this;

            this._wrapper.transition(this.property, this._scrollTransitionSettings);
            this._scrollTransition = this._wrapper.transition(this.property);
            this._scrollTransition.on('progress', function (p) {
                return _this28.update();
            });

            this.setIndex(0, true, true);
            this.update();

            this._started = true;
        }
    }, {
        key: 'setIndex',
        value: function setIndex(index) {
            var immediate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
            var closest = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var nElements = this.length;
            if (!nElements) return;

            this.emit('unfocus', this.getElement(this.realIndex), this._index, this.realIndex);

            if (closest) {
                var offset = Utils.getModuloIndex(index, nElements);
                var o = Utils.getModuloIndex(this.index, nElements);
                var diff = offset - o;
                if (diff > 0.5 * nElements) {
                    diff -= nElements;
                } else if (diff < -0.5 * nElements) {
                    diff += nElements;
                }
                this._index += diff;
            } else {
                this._index = index;
            }

            if (this._roll || this.viewportSize > this._itemSize * nElements) {
                this._index = Utils.getModuloIndex(this._index, nElements);
            }

            var direction = this._horizontal ^ this._invertDirection ? -1 : 1;
            var value = direction * this._index * this._itemSize;

            if (this._roll) {
                var min = void 0,
                    max = void 0,
                    scrollDelta = void 0;
                if (direction == 1) {
                    max = (nElements - 1) * this._itemSize;
                    scrollDelta = this._viewportScrollOffset * this.viewportSize - this._itemScrollOffset * this._itemSize;

                    max -= scrollDelta;

                    min = this.viewportSize - (this._itemSize + scrollDelta);

                    if (this._rollMin) min -= this._rollMin;
                    if (this._rollMax) max += this._rollMax;

                    value = Math.max(Math.min(value, max), min);
                } else {
                    max = nElements * this._itemSize - this.viewportSize;
                    scrollDelta = this._viewportScrollOffset * this.viewportSize - this._itemScrollOffset * this._itemSize;

                    max += scrollDelta;

                    var _min = scrollDelta;

                    if (this._rollMin) _min -= this._rollMin;
                    if (this._rollMax) max += this._rollMax;

                    value = Math.min(Math.max(-max, value), -_min);
                }
            }

            this._scrollTransition.start(value);

            if (immediate) {
                this._scrollTransition.finish();
            }

            this.emit('focus', this.getElement(this.realIndex), this._index, this.realIndex);
        }
    }, {
        key: 'update',
        value: function update() {
            if (!this._started) return;

            var nElements = this.length;
            if (!nElements) return;

            var direction = this._horizontal ^ this._invertDirection ? -1 : 1;

            var v = this._horizontal ? this._wrapper.x : this._wrapper.y;

            var viewportSize = this.viewportSize;
            var scrollDelta = this._viewportScrollOffset * viewportSize - this._itemScrollOffset * this._itemSize;
            v += scrollDelta;

            var s = void 0,
                e = void 0,
                ps = void 0,
                pe = void 0;
            if (direction == -1) {
                s = Math.floor(-v / this._itemSize);
                ps = 1 - (-v / this._itemSize - s);
                e = Math.floor((viewportSize - v) / this._itemSize);
                pe = (viewportSize - v) / this._itemSize - e;
            } else {
                s = Math.ceil(v / this._itemSize);
                ps = 1 + v / this._itemSize - s;
                e = Math.ceil((v - viewportSize) / this._itemSize);
                pe = e - (v - viewportSize) / this._itemSize;
            }
            if (this._roll || viewportSize > this._itemSize * nElements) {
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

            var offset = -direction * s * this._itemSize;

            var item = void 0;
            for (var index = s; direction == -1 ? index <= e : index >= e; direction == -1 ? index++ : index--) {
                var realIndex = Utils.getModuloIndex(index, nElements);

                var element = this.getElement(realIndex);
                item = element.parent;
                this._visibleItems.delete(item);
                if (this._horizontal) {
                    item.x = offset + scrollDelta;
                } else {
                    item.y = offset + scrollDelta;
                }

                var wasVisible = item.visible;
                item.visible = true;

                if (!wasVisible || this._reloadVisibleElements) {
                    this.emit('visible', index, realIndex);
                }

                if (this._progressAnimation) {
                    var _p8 = 1;
                    if (index == s) {
                        _p8 = ps;
                    } else if (index == e) {
                        _p8 = pe;
                    }

                    this._progressAnimation.apply(element, _p8);
                }

                offset += this._itemSize;
            }

            var self = this;
            this._visibleItems.forEach(function (invisibleItem) {
                invisibleItem.visible = false;
                self._visibleItems.delete(invisibleItem);
            });

            for (var _index = s; direction == -1 ? _index <= e : _index >= e; direction == -1 ? _index++ : _index--) {
                var _realIndex = Utils.getModuloIndex(_index, nElements);
                this._visibleItems.add(this.getWrapper(_realIndex));
            }

            this._reloadVisibleElements = false;
        }
    }, {
        key: 'setPrevious',
        value: function setPrevious() {
            this.setIndex(this._index - 1);
        }
    }, {
        key: 'setNext',
        value: function setNext() {
            this.setIndex(this._index + 1);
        }
    }, {
        key: 'getWrapper',
        value: function getWrapper(index) {
            return this._wrapper.children[index];
        }
    }, {
        key: 'getElement',
        value: function getElement(index) {
            var e = this._wrapper.children[index];
            return e ? e.children[0] : null;
        }
    }, {
        key: 'reload',
        value: function reload() {
            this._reloadVisibleElements = true;
            this.update();
        }
    }, {
        key: 'element',
        get: function get() {
            var e = this._wrapper.children[this.realIndex];
            return e ? e.children[0] : null;
        }
    }, {
        key: 'length',
        get: function get() {
            return this._wrapper.children.length;
        }
    }, {
        key: 'property',
        get: function get() {
            return this._horizontal ? 'x' : 'y';
        }
    }, {
        key: 'viewportSize',
        get: function get() {
            return this._horizontal ? this.w : this.h;
        }
    }, {
        key: 'index',
        get: function get() {
            return this._index;
        }
    }, {
        key: 'realIndex',
        get: function get() {
            return Utils.getModuloIndex(this._index, this.length);
        }
    }, {
        key: 'itemSize',
        get: function get() {
            return this._itemSize;
        },
        set: function set(v) {
            this._itemSize = v;
            this.update();
        }
    }, {
        key: 'viewportScrollOffset',
        get: function get() {
            return this._viewportScrollOffset;
        },
        set: function set(v) {
            this._viewportScrollOffset = v;
            this.update();
        }
    }, {
        key: 'itemScrollOffset',
        get: function get() {
            return this._itemScrollOffset;
        },
        set: function set(v) {
            this._itemScrollOffset = v;
            this.update();
        }
    }, {
        key: 'scrollTransitionSettings',
        get: function get() {
            return this._scrollTransitionSettings;
        },
        set: function set(v) {
            this._scrollTransitionSettings.setSettings(v);
        }
    }, {
        key: 'scrollTransition',
        set: function set(v) {
            this._scrollTransitionSettings.setSettings(v);
        },
        get: function get() {
            return this._scrollTransition;
        }
    }, {
        key: 'progressAnimation',
        get: function get() {
            return this._progressAnimation;
        },
        set: function set(v) {
            if (Utils.isObjectLiteral(v)) {
                this._progressAnimation = this.stage.animations.createSettings(v);
            } else {
                this._progressAnimation = v;
            }
            this.update();
        }
    }, {
        key: 'roll',
        get: function get() {
            return this._roll;
        },
        set: function set(v) {
            this._roll = v;
            this.update();
        }
    }, {
        key: 'rollMin',
        get: function get() {
            return this._rollMin;
        },
        set: function set(v) {
            this._rollMin = v;
            this.update();
        }
    }, {
        key: 'rollMax',
        get: function get() {
            return this._rollMax;
        },
        set: function set(v) {
            this._rollMax = v;
            this.update();
        }
    }, {
        key: 'invertDirection',
        get: function get() {
            return this._invertDirection;
        },
        set: function set(v) {
            if (!this._started) {
                this._invertDirection = v;
            }
        }
    }, {
        key: 'horizontal',
        get: function get() {
            return this._horizontal;
        },
        set: function set(v) {
            if (v !== this._horizontal) {
                if (!this._started) {
                    this._horizontal = v;
                }
            }
        }
    }]);

    return ListView;
}(View);

ListView.NUMBER_PROPERTIES = new Set(['viewportScrollOffset', 'itemScrollOffset']);

var BorderView = function (_View2) {
    _inherits(BorderView, _View2);

    function BorderView(stage) {
        _classCallCheck(this, BorderView);

        var _this29 = _possibleConstructorReturn(this, (BorderView.__proto__ || Object.getPrototypeOf(BorderView)).call(this, stage));

        _this29._wrapper = _get(BorderView.prototype.__proto__ || Object.getPrototypeOf(BorderView.prototype), '_children', _this29).a({});

        _this29._borderTop = _get(BorderView.prototype.__proto__ || Object.getPrototypeOf(BorderView.prototype), '_children', _this29).a({ rect: true, visible: false, mountY: 1 });
        _this29._borderRight = _get(BorderView.prototype.__proto__ || Object.getPrototypeOf(BorderView.prototype), '_children', _this29).a({ rect: true, visible: false });
        _this29._borderBottom = _get(BorderView.prototype.__proto__ || Object.getPrototypeOf(BorderView.prototype), '_children', _this29).a({ rect: true, visible: false });
        _this29._borderLeft = _get(BorderView.prototype.__proto__ || Object.getPrototypeOf(BorderView.prototype), '_children', _this29).a({ rect: true, visible: false, mountX: 1 });

        _this29._updateLayout = false;

        _this29.visitExit = function (view, recalc) {
            var hasSingleChild = view.children.length === 1;
            var refresh = hasSingleChild && view.children[0]._core._recalc & 2 || recalc || view._updateLayout;
            if (refresh) {
                if (view.children.length === 1) {
                    view.w = view.children[0].renderWidth;
                    view.h = view.children[0].renderHeight;
                }
                var rw = view.renderWidth;
                var rh = view.renderHeight;
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
        };
        return _this29;
    }

    _createClass(BorderView, [{
        key: '_getExposedChildList',
        value: function _getExposedChildList() {
            return this._wrapper._children;
        }
    }, {
        key: 'borderWidth',
        get: function get() {
            return this.borderWidthTop;
        },
        set: function set(v) {
            this.borderWidthTop = v;
            this.borderWidthRight = v;
            this.borderWidthBottom = v;
            this.borderWidthLeft = v;
        }
    }, {
        key: 'borderWidthTop',
        get: function get() {
            return this._borderTop.h;
        },
        set: function set(v) {
            this._borderTop.h = v;
            this._borderTop.visible = v > 0;
            this._updateLayout = true;
        }
    }, {
        key: 'borderWidthRight',
        get: function get() {
            return this._borderRight.w;
        },
        set: function set(v) {
            this._borderRight.w = v;
            this._borderRight.visible = v > 0;
            this._updateLayout = true;
        }
    }, {
        key: 'borderWidthBottom',
        get: function get() {
            return this._borderBottom.h;
        },
        set: function set(v) {
            this._borderBottom.h = v;
            this._borderBottom.visible = v > 0;
            this._updateLayout = true;
        }
    }, {
        key: 'borderWidthLeft',
        get: function get() {
            return this._borderLeft.w;
        },
        set: function set(v) {
            this._borderLeft.w = v;
            this._borderLeft.visible = v > 0;
            this._updateLayout = true;
        }
    }, {
        key: 'borderColor',
        get: function get() {
            return this.borderColorTop;
        },
        set: function set(v) {
            this.borderColorTop = v;
            this.borderColorRight = v;
            this.borderColorBottom = v;
            this.borderColorLeft = v;
        }
    }, {
        key: 'borderColorTop',
        get: function get() {
            return this._borderTop.color;
        },
        set: function set(v) {
            this._borderTop.color = v;
        }
    }, {
        key: 'borderColorRight',
        get: function get() {
            return this._borderRight.color;
        },
        set: function set(v) {
            this._borderRight.color = v;
        }
    }, {
        key: 'borderColorBottom',
        get: function get() {
            return this._borderBottom.color;
        },
        set: function set(v) {
            this._borderBottom.color = v;
        }
    }, {
        key: 'borderColorLeft',
        get: function get() {
            return this._borderLeft.color;
        },
        set: function set(v) {
            this._borderLeft.color = v;
        }
    }, {
        key: 'borderTop',
        get: function get() {
            return this._borderTop;
        },
        set: function set(settings) {
            this.borderTop.setSettings(settings);
        }
    }, {
        key: 'borderRight',
        get: function get() {
            return this._borderRight;
        },
        set: function set(settings) {
            this.borderRight.setSettings(settings);
        }
    }, {
        key: 'borderBottom',
        get: function get() {
            return this._borderBottom;
        },
        set: function set(settings) {
            this.borderBottom.setSettings(settings);
        }
    }, {
        key: 'borderLeft',
        get: function get() {
            return this._borderLeft;
        },
        set: function set(settings) {
            this.borderLeft.setSettings(settings);
        }
    }, {
        key: 'borders',
        set: function set(settings) {
            this.borderTop = settings;
            this.borderLeft = settings;
            this.borderBottom = settings;
            this.borderRight = settings;
        }
    }, {
        key: 'clipping',
        get: function get() {
            return this._wrapper.clipping;
        },
        set: function set(v) {
            this._wrapper.clipping = v;
        }
    }]);

    return BorderView;
}(View);

BorderView.NUMBER_PROPERTIES = new Set(['borderWidth', 'borderWidthTop', 'borderWidthRight', 'borderWidthBottom', 'borderWidthLeft']);
BorderView.COLOR_PROPERTIES = new Set(['borderColor', 'borderColorTop', 'borderColorRight', 'borderColorBottom', 'borderColorLeft']);

var FastBlurView = function (_View3) {
    _inherits(FastBlurView, _View3);

    function FastBlurView(stage) {
        _classCallCheck(this, FastBlurView);

        var _this30 = _possibleConstructorReturn(this, (FastBlurView.__proto__ || Object.getPrototypeOf(FastBlurView)).call(this, stage));

        var fastBoxBlurShader = FastBlurView.getFastBoxBlurShader(stage.ctx);

        var c = _this30._children;
        c.a([{ renderToTexture: false, hideResultTexture: true, children: [{}] }, { children: [{ renderToTexture: true, hideResultTexture: true, visible: false, children: [{ shader: fastBoxBlurShader }] }, { renderToTexture: true, hideResultTexture: true, visible: false, children: [{ shader: fastBoxBlurShader }] }, { renderToTexture: true, hideResultTexture: true, visible: false, children: [{ shader: fastBoxBlurShader }] }, { renderToTexture: true, hideResultTexture: true, visible: false, children: [{ shader: fastBoxBlurShader }] }] }, { shader: { type: FastBlurOutputShader }, visible: false }]);

        _this30._textwrap = c.get()[0];
        _this30._wrapper = _this30._textwrap.children[0];
        _this30._layers = c.get()[1].children;
        _this30._output = c.get()[2];

        _this30.getLayerContents(0).texture = _this30._textwrap.getResultTextureSource();
        _this30.getLayerContents(1).texture = _this30.getLayer(0).getResultTextureSource();
        _this30.getLayerContents(2).texture = _this30.getLayer(1).getResultTextureSource();
        _this30.getLayerContents(3).texture = _this30.getLayer(2).getResultTextureSource();

        var filters = FastBlurView.getLinearBlurFilters(stage.ctx);
        _this30.getLayer(1).filters = [filters[0], filters[1]];
        _this30.getLayer(2).filters = [filters[2], filters[3], filters[0], filters[1]];
        _this30.getLayer(3).filters = [filters[2], filters[3], filters[0], filters[1]];

        _this30._amount = 0;
        _this30._paddingX = 0;
        _this30._paddingY = 0;
        return _this30;
    }

    _createClass(FastBlurView, [{
        key: '_getExposedChildList',
        value: function _getExposedChildList() {
            return this._wrapper._children;
        }
    }, {
        key: 'getLayer',
        value: function getLayer(i) {
            return this._layers[i];
        }
    }, {
        key: 'getLayerContents',
        value: function getLayerContents(i) {
            return this.getLayer(i).children[0];
        }
    }, {
        key: '_updateDimensions',
        value: function _updateDimensions() {
            if (_get(FastBlurView.prototype.__proto__ || Object.getPrototypeOf(FastBlurView.prototype), '_updateDimensions', this).call(this)) {
                this._updateBlurSize();
            }
        }
    }, {
        key: '_updateBlurSize',
        value: function _updateBlurSize() {
            var w = this.renderWidth;
            var h = this.renderHeight;

            var paddingX = this._paddingX;
            var paddingY = this._paddingY;

            var fw = w + paddingX * 2;
            var fh = h + paddingY * 2;
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
    }, {
        key: '_update',
        value: function _update() {
            var v = Math.min(4, Math.max(0, this._amount));
            if (v === 0) {
                this._textwrap.renderToTexture = false;
                this._output.shader.otherTextureSource = null;
                this._output.visible = false;
            } else {
                this._textwrap.renderToTexture = true;
                this._output.visible = true;

                this.getLayer(0).visible = v > 0;
                this.getLayer(1).visible = v > 1;
                this.getLayer(2).visible = v > 2;
                this.getLayer(3).visible = v > 3;

                if (v <= 1) {
                    this._output.texture = this._textwrap.getResultTextureSource();
                    this._output.shader.otherTextureSource = this.getLayer(0).getResultTextureSource();
                    this._output.shader.a = v;
                } else if (v <= 2) {
                    this._output.texture = this.getLayer(0).getResultTextureSource();
                    this._output.shader.otherTextureSource = this.getLayer(1).getResultTextureSource();
                    this._output.shader.a = v - 1;
                } else if (v <= 3) {
                    this._output.texture = this.getLayer(1).getResultTextureSource();
                    this._output.shader.otherTextureSource = this.getLayer(2).getResultTextureSource();
                    this._output.shader.a = v - 2;
                } else if (v <= 4) {
                    this._output.texture = this.getLayer(2).getResultTextureSource();
                    this._output.shader.otherTextureSource = this.getLayer(3).getResultTextureSource();
                    this._output.shader.a = v - 3;
                }
            }
        }
    }, {
        key: 'padding',
        set: function set(v) {
            this._paddingX = v;
            this._paddingY = v;
            this._updateBlurSize();
        }
    }, {
        key: 'paddingX',
        set: function set(v) {
            this.paddingX = v;
            this._updateBlurSize();
        }
    }, {
        key: 'paddingY',
        set: function set(v) {
            this.paddingY = v;
            this._updateBlurSize();
        }
    }, {
        key: 'amount',
        set: function set(v) {
            this._amount = v;
            this._update();
        },
        get: function get() {
            return this._amount;
        }
    }], [{
        key: 'getFastBoxBlurShader',
        value: function getFastBoxBlurShader(ctx) {
            if (!ctx.fastBoxBlurShader) {
                ctx.fastBoxBlurShader = new FastBoxBlurShader(ctx);
            }
            return ctx.fastBoxBlurShader;
        }
    }, {
        key: 'getLinearBlurFilters',
        value: function getLinearBlurFilters(ctx) {
            if (!ctx.linearBlurFilters) {
                ctx.linearBlurFilters = [];

                var lbf = new LinearBlurFilter(ctx);
                lbf.x = 1;
                lbf.y = 0;
                lbf.kernelRadius = 1;
                ctx.linearBlurFilters.push(lbf);

                lbf = new LinearBlurFilter(ctx);
                lbf.x = 0;
                lbf.y = 1;
                lbf.kernelRadius = 1;
                ctx.linearBlurFilters.push(lbf);

                lbf = new LinearBlurFilter(ctx);
                lbf.x = 1.5;
                lbf.y = 0;
                lbf.kernelRadius = 1;
                ctx.linearBlurFilters.push(lbf);

                lbf = new LinearBlurFilter(ctx);
                lbf.x = 0;
                lbf.y = 1.5;
                lbf.kernelRadius = 1;
                ctx.linearBlurFilters.push(lbf);
            }
            return ctx.linearBlurFilters;
        }
    }]);

    return FastBlurView;
}(View);

FastBlurView.NUMBER_PROPERTIES = new Set(['amount']);

var FastBoxBlurShader = function (_Shader) {
    _inherits(FastBoxBlurShader, _Shader);

    function FastBoxBlurShader(ctx) {
        _classCallCheck(this, FastBoxBlurShader);

        return _possibleConstructorReturn(this, (FastBoxBlurShader.__proto__ || Object.getPrototypeOf(FastBoxBlurShader)).call(this, ctx));
    }

    _createClass(FastBoxBlurShader, [{
        key: 'getVertexShaderSource',
        value: function getVertexShaderSource() {
            return FastBoxBlurShader.vertexShaderSource;
        }
    }, {
        key: 'getFragmentShaderSource',
        value: function getFragmentShaderSource() {
            return FastBoxBlurShader.fragmentShaderSource;
        }
    }, {
        key: 'setupUniforms',
        value: function setupUniforms(operation) {
            _get(FastBoxBlurShader.prototype.__proto__ || Object.getPrototypeOf(FastBoxBlurShader.prototype), 'setupUniforms', this).call(this, operation);
            var dx = 1.0 / operation.getTextureWidth(0);
            var dy = 1.0 / operation.getTextureHeight(0);
            this._setUniform("stepTextureCoord", new Float32Array([dx, dy]), this.gl.uniform2fv);
        }
    }]);

    return FastBoxBlurShader;
}(Shader);

FastBoxBlurShader.vertexShaderSource = '\n    #ifdef GL_ES\n    precision lowp float;\n    #endif\n    uniform vec2 stepTextureCoord;\n    attribute vec2 aVertexPosition;\n    attribute vec2 aTextureCoord;\n    attribute vec4 aColor;\n    uniform vec2 projection;\n    varying vec4 vColor;\n    varying vec2 vTextureCoordUl;\n    varying vec2 vTextureCoordUr;\n    varying vec2 vTextureCoordBl;\n    varying vec2 vTextureCoordBr;\n    void main(void){\n        gl_Position = vec4(aVertexPosition.x * projection.x - 1.0, aVertexPosition.y * -abs(projection.y) + 1.0, 0.0, 1.0);\n        vTextureCoordUl = aTextureCoord - stepTextureCoord;\n        vTextureCoordBr = aTextureCoord + stepTextureCoord;\n        vTextureCoordUr = vec2(vTextureCoordBr.x, vTextureCoordUl.y);\n        vTextureCoordBl = vec2(vTextureCoordUl.x, vTextureCoordBr.y);\n        vColor = aColor;\n        gl_Position.y = -sign(projection.y) * gl_Position.y;\n    }\n';

FastBoxBlurShader.fragmentShaderSource = '\n    #ifdef GL_ES\n    precision lowp float;\n    #endif\n    varying vec2 vTextureCoordUl;\n    varying vec2 vTextureCoordUr;\n    varying vec2 vTextureCoordBl;\n    varying vec2 vTextureCoordBr;\n    varying vec4 vColor;\n    uniform sampler2D uSampler;\n    void main(void){\n        vec4 color = 0.25 * (texture2D(uSampler, vTextureCoordUl) + texture2D(uSampler, vTextureCoordUr) + texture2D(uSampler, vTextureCoordBl) + texture2D(uSampler, vTextureCoordBr));\n        gl_FragColor = color * vColor;\n    }\n';

var FastBlurOutputShader = function (_Shader2) {
    _inherits(FastBlurOutputShader, _Shader2);

    function FastBlurOutputShader(ctx) {
        _classCallCheck(this, FastBlurOutputShader);

        var _this32 = _possibleConstructorReturn(this, (FastBlurOutputShader.__proto__ || Object.getPrototypeOf(FastBlurOutputShader)).call(this, ctx));

        _this32._a = 0;
        _this32._otherTextureSource = null;
        return _this32;
    }

    _createClass(FastBlurOutputShader, [{
        key: 'getFragmentShaderSource',
        value: function getFragmentShaderSource() {
            return FastBlurOutputShader.fragmentShaderSource;
        }
    }, {
        key: 'setupUniforms',
        value: function setupUniforms(operation) {
            _get(FastBlurOutputShader.prototype.__proto__ || Object.getPrototypeOf(FastBlurOutputShader.prototype), 'setupUniforms', this).call(this, operation);
            this._setUniform("a", this._a, this.gl.uniform1f);
            this._setUniform("uSampler2", 1, this.gl.uniform1i);
        }
    }, {
        key: 'beforeDraw',
        value: function beforeDraw(operation) {
            var glTexture = this._otherTextureSource ? this._otherTextureSource.glTexture : null;

            var gl = this.gl;
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, glTexture);
            gl.activeTexture(gl.TEXTURE0);
        }
    }, {
        key: 'isMergable',
        value: function isMergable(shader) {
            return _get(FastBlurOutputShader.prototype.__proto__ || Object.getPrototypeOf(FastBlurOutputShader.prototype), 'isMergable', this).call(this, shader) && shader._otherTextureSource === this._otherTextureSource;
        }
    }, {
        key: 'a',
        get: function get() {
            return this._a;
        },
        set: function set(v) {
            this._a = v;
            this.redraw();
        }
    }, {
        key: 'otherTextureSource',
        set: function set(v) {
            this._otherTextureSource = v;
            this.redraw();
        }
    }]);

    return FastBlurOutputShader;
}(Shader);

FastBlurOutputShader.fragmentShaderSource = '\n    #ifdef GL_ES\n    precision lowp float;\n    #endif\n    varying vec2 vTextureCoord;\n    varying vec4 vColor;\n    uniform sampler2D uSampler;\n    uniform sampler2D uSampler2;\n    uniform float a;\n    void main(void){\n        if (a == 1.0) {\n            gl_FragColor = texture2D(uSampler2, vTextureCoord) * vColor;\n        } else {\n            gl_FragColor = ((1.0 - a) * texture2D(uSampler, vTextureCoord) + (a * texture2D(uSampler2, vTextureCoord))) * vColor;\n        }\n    }\n';

var Light3dShader = function (_Shader3) {
    _inherits(Light3dShader, _Shader3);

    function Light3dShader(ctx) {
        _classCallCheck(this, Light3dShader);

        var _this33 = _possibleConstructorReturn(this, (Light3dShader.__proto__ || Object.getPrototypeOf(Light3dShader)).call(this, ctx));

        _this33._strength = 0.5;
        _this33._ambient = 0.5;
        _this33._fudge = 0.4;

        _this33._rx = 0;
        _this33._ry = 0;

        _this33._z = 0;
        return _this33;
    }

    _createClass(Light3dShader, [{
        key: 'getVertexShaderSource',
        value: function getVertexShaderSource() {
            return Light3dShader.vertexShaderSource;
        }
    }, {
        key: 'getFragmentShaderSource',
        value: function getFragmentShaderSource() {
            return Light3dShader.fragmentShaderSource;
        }
    }, {
        key: 'supportsTextureAtlas',
        value: function supportsTextureAtlas() {
            return true;
        }
    }, {
        key: 'supportsMerging',
        value: function supportsMerging() {
            return false;
        }
    }, {
        key: 'setupUniforms',
        value: function setupUniforms(operation) {
            _get(Light3dShader.prototype.__proto__ || Object.getPrototypeOf(Light3dShader.prototype), 'setupUniforms', this).call(this, operation);

            var vr = operation.shaderOwner;
            var view = vr.view;

            var coords = vr.getRenderTextureCoords(view.pivotX * vr.rw, view.pivotY * vr.rh);

            var rz = -Math.atan2(vr._renderContext.tc, vr._renderContext.ta);

            var gl = this.gl;
            this._setUniform("pivot", new Float32Array([coords[0], coords[1], this._z]), gl.uniform3fv);
            this._setUniform("rot", new Float32Array([this._rx, this._ry, rz]), gl.uniform3fv);

            this._setUniform("strength", this._strength, gl.uniform1f);
            this._setUniform("ambient", this._ambient, gl.uniform1f);
            this._setUniform("fudge", this._fudge, gl.uniform1f);
        }
    }, {
        key: 'strength',
        set: function set(v) {
            this._strength = v;
            this.redraw();
        },
        get: function get() {
            return this._strength;
        }
    }, {
        key: 'ambient',
        set: function set(v) {
            this._ambient = v;
            this.redraw();
        },
        get: function get() {
            return this._ambient;
        }
    }, {
        key: 'fudge',
        set: function set(v) {
            this._fudge = v;
            this.redraw();
        },
        get: function get() {
            return this._fudge;
        }
    }, {
        key: 'rx',
        get: function get() {
            return this._rx;
        },
        set: function set(v) {
            this._rx = v;
            this.redraw();
        }
    }, {
        key: 'ry',
        get: function get() {
            return this._ry;
        },
        set: function set(v) {
            this._ry = v;
            this.redraw();
        }
    }, {
        key: 'z',
        get: function get() {
            return this._z;
        },
        set: function set(v) {
            this._z = v;
            this.redraw();
        }
    }]);

    return Light3dShader;
}(Shader);

Light3dShader.vertexShaderSource = '\n    #ifdef GL_ES\n    precision lowp float;\n    #endif\n    attribute vec2 aVertexPosition;\n    attribute vec2 aTextureCoord;\n    attribute vec4 aColor;\n    uniform vec2 projection;\n    varying vec2 vTextureCoord;\n    varying vec4 vColor;\n\n    uniform float fudge;\n    uniform float strength;\n    uniform float ambient;\n    uniform vec3 pivot;\n    uniform vec3 rot;\n    varying float light;\n\n    void main(void) {\n        vec3 pos = vec3(aVertexPosition.xy, pivot.z);\n        \n        pos -= pivot;\n\n        /* Undo XY rotation */\n        mat2 iRotXy = mat2( cos(rot.z), sin(rot.z), \n                           -sin(rot.z), cos(rot.z));\n        pos.xy = iRotXy * pos.xy;\n        \n        /* Perform 3d rotations */\n        gl_Position.x = cos(rot.x) * pos.x - sin(rot.x) * pos.z;\n        gl_Position.y = pos.y;\n        gl_Position.z = sin(rot.x) * pos.x + cos(rot.x) * pos.z;\n        \n        pos.y = cos(rot.y) * gl_Position.y - sin(rot.y) * gl_Position.z;\n        gl_Position.z = sin(rot.y) * gl_Position.y + cos(rot.y) * gl_Position.z;\n        gl_Position.y = pos.y;\n        \n        /* Redo XY rotation */\n        iRotXy[0][1] = -iRotXy[0][1];\n        iRotXy[1][0] = -iRotXy[1][0];\n        gl_Position.xy = iRotXy * gl_Position.xy; \n\n        /* Undo translate to pivot position */\n        gl_Position.xyz += pivot;\n        \n        /* Set depth perspective */\n        float perspective = 1.0 + fudge * gl_Position.z * projection.x;\n\n        /* Map coords to gl coordinate space. */\n        gl_Position = vec4(gl_Position.x * projection.x - 1.0, gl_Position.y * -abs(projection.y) + 1.0, 0.0, perspective);\n        \n        /* Set z to 0 because we don\'t want to perform z-clipping */\n        gl_Position.z = 0.0;\n\n        /* Use texture normal to calculate light strength */ \n        light = ambient + strength * abs(cos(rot.y) * cos(rot.x));\n        \n        vTextureCoord = aTextureCoord;\n        vColor = aColor;\n        \n        gl_Position.y = -sign(projection.y) * gl_Position.y;\n    }\n';

Light3dShader.fragmentShaderSource = '\n    #ifdef GL_ES\n    precision lowp float;\n    #endif\n    varying vec2 vTextureCoord;\n    varying vec4 vColor;\n    varying float light;\n    uniform sampler2D uSampler;\n    void main(void){\n        vec4 rgba = texture2D(uSampler, vTextureCoord);\n        rgba.rgb = rgba.rgb * light;\n        gl_FragColor = rgba * vColor;\n    }\n';

var PixelateShader = function (_Shader4) {
    _inherits(PixelateShader, _Shader4);

    function PixelateShader(ctx) {
        _classCallCheck(this, PixelateShader);

        var _this34 = _possibleConstructorReturn(this, (PixelateShader.__proto__ || Object.getPrototypeOf(PixelateShader)).call(this, ctx));

        _this34._size = new Float32Array([4, 4]);
        return _this34;
    }

    _createClass(PixelateShader, [{
        key: 'getVertexShaderSource',
        value: function getVertexShaderSource() {
            return PixelateShader.vertexShaderSource;
        }
    }, {
        key: 'getFragmentShaderSource',
        value: function getFragmentShaderSource() {
            return PixelateShader.fragmentShaderSource;
        }
    }, {
        key: 'setupUniforms',
        value: function setupUniforms(operation) {
            _get(PixelateShader.prototype.__proto__ || Object.getPrototypeOf(PixelateShader.prototype), 'setupUniforms', this).call(this, operation);
            var gl = this.gl;
            this._setUniform("size", new Float32Array(this._size), gl.uniform2fv);
        }
    }, {
        key: 'getExtraAttribBytesPerVertex',
        value: function getExtraAttribBytesPerVertex() {
            return 8;
        }
    }, {
        key: 'enableAttribs',
        value: function enableAttribs() {
            _get(PixelateShader.prototype.__proto__ || Object.getPrototypeOf(PixelateShader.prototype), 'enableAttribs', this).call(this);
            this.gl.enableVertexAttribArray(this._attrib("aTextureRes"));
        }
    }, {
        key: 'disableAttribs',
        value: function disableAttribs() {
            _get(PixelateShader.prototype.__proto__ || Object.getPrototypeOf(PixelateShader.prototype), 'disableAttribs', this).call(this);
            this.gl.disableVertexAttribArray(this._attrib("aTextureRes"));
        }
    }, {
        key: 'setExtraAttribsInBuffer',
        value: function setExtraAttribsInBuffer(operation) {
            var offset = operation.extraAttribsDataByteOffset / 4;
            var floats = operation.quads.floats;

            var length = operation.length;
            for (var _i52 = 0; _i52 < length; _i52++) {
                var w = operation.quads.getTextureWidth(operation.index + _i52);
                var h = operation.quads.getTextureHeight(operation.index + _i52);

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
    }, {
        key: 'beforeDraw',
        value: function beforeDraw(operation) {
            var gl = this.gl;
            gl.vertexAttribPointer(this._attrib("aTextureRes"), 2, gl.FLOAT, false, this.getExtraAttribBytesPerVertex(), this.getVertexAttribPointerOffset(operation));
        }
    }, {
        key: 'useDefault',
        value: function useDefault() {
            return this._size[0] === 0 && this._size[1] === 0;
        }
    }, {
        key: 'x',
        get: function get() {
            return this._size[0];
        },
        set: function set(v) {
            this._size[0] = v;
            this.redraw();
        }
    }, {
        key: 'y',
        get: function get() {
            return this._size[1];
        },
        set: function set(v) {
            this._size[1] = v;
            this.redraw();
        }
    }, {
        key: 'size',
        get: function get() {
            return this._size[0];
        },
        set: function set(v) {
            this._size[0] = v;
            this._size[1] = v;
            this.redraw();
        }
    }]);

    return PixelateShader;
}(Shader);

PixelateShader.vertexShaderSource = '\n    #ifdef GL_ES\n    precision lowp float;\n    #endif\n    attribute vec2 aVertexPosition;\n    attribute vec2 aTextureCoord;\n    attribute vec4 aColor;\n    attribute vec2 aTextureRes;\n    uniform vec2 projection;\n    varying vec2 vTextureCoord;\n    varying vec4 vColor;\n    varying vec2 vTextureRes;\n    void main(void){\n        gl_Position = vec4(aVertexPosition.x * projection.x - 1.0, aVertexPosition.y * -abs(projection.y) + 1.0, 0.0, 1.0);\n        vTextureCoord = aTextureCoord;\n        vColor = aColor;\n        vTextureRes = aTextureRes;\n        gl_Position.y = -sign(projection.y) * gl_Position.y;\n    }\n';

PixelateShader.fragmentShaderSource = '\n    #ifdef GL_ES\n    precision lowp float;\n    #endif\n    varying vec2 vTextureCoord;\n    varying vec4 vColor;\n    varying vec2 vTextureRes;\n\n    uniform vec2 size;\n    uniform sampler2D uSampler;\n    \n    vec2 mapCoord( vec2 coord )\n    {\n        coord *= vTextureRes.xy;\n        return coord;\n    }\n    \n    vec2 unmapCoord( vec2 coord )\n    {\n        coord /= vTextureRes.xy;\n        return coord;\n    }\n    \n    vec2 pixelate(vec2 coord, vec2 size)\n    {\n        return floor( coord / size ) * size;\n    }\n    \n    void main(void)\n    {\n        vec2 coord = mapCoord(vTextureCoord);\n        coord = pixelate(coord, size);\n        coord = unmapCoord(coord);\n        gl_FragColor = texture2D(uSampler, coord) * vColor;\n    }\n';

var InversionShader = function (_Shader5) {
    _inherits(InversionShader, _Shader5);

    function InversionShader() {
        _classCallCheck(this, InversionShader);

        return _possibleConstructorReturn(this, (InversionShader.__proto__ || Object.getPrototypeOf(InversionShader)).apply(this, arguments));
    }

    _createClass(InversionShader, [{
        key: 'getFragmentShaderSource',
        value: function getFragmentShaderSource() {
            return InversionShader.fragmentShaderSource;
        }
    }]);

    return InversionShader;
}(Shader);

InversionShader.fragmentShaderSource = '\n    #ifdef GL_ES\n    precision lowp float;\n    #endif\n    varying vec2 vTextureCoord;\n    varying vec4 vColor;\n    uniform sampler2D uSampler;\n    void main(void){\n        vec4 color = texture2D(uSampler, vTextureCoord);\n        color.rgb = 1.0 - color.rgb; \n        gl_FragColor = color * vColor;\n    }\n';

var FxaaFilter = function (_Filter) {
    _inherits(FxaaFilter, _Filter);

    function FxaaFilter(ctx) {
        _classCallCheck(this, FxaaFilter);

        return _possibleConstructorReturn(this, (FxaaFilter.__proto__ || Object.getPrototypeOf(FxaaFilter)).call(this, ctx));
    }

    _createClass(FxaaFilter, [{
        key: 'getVertexShaderSource',
        value: function getVertexShaderSource() {
            return Filter.vertexShaderSource;
        }
    }, {
        key: 'getFragmentShaderSource',
        value: function getFragmentShaderSource() {
            return FxaaFilter.fragmentShaderSource;
        }
    }]);

    return FxaaFilter;
}(Filter);

FxaaFilter.fxaa = '\n    #ifndef FXAA_REDUCE_MIN\n        #define FXAA_REDUCE_MIN   (1.0/ 128.0)\n    #endif\n    #ifndef FXAA_REDUCE_MUL\n        #define FXAA_REDUCE_MUL   (1.0 / 8.0)\n    #endif\n    #ifndef FXAA_SPAN_MAX\n        #define FXAA_SPAN_MAX     8.0\n    #endif\n    \n    //optimized version for mobile, where dependent \n    //texture reads can be a bottleneck\n    vec4 fxaa(sampler2D tex, vec2 fragCoord, vec2 resolution,\n            vec2 v_rgbNW, vec2 v_rgbNE, \n            vec2 v_rgbSW, vec2 v_rgbSE, \n            vec2 v_rgbM) {\n            \n        vec4 color;\n        vec2 inverseVP = vec2(1.0 / resolution.x, 1.0 / resolution.y);\n        vec3 rgbNW = texture2D(tex, v_rgbNW).xyz;\n        vec3 rgbNE = texture2D(tex, v_rgbNE).xyz;\n        vec3 rgbSW = texture2D(tex, v_rgbSW).xyz;\n        vec3 rgbSE = texture2D(tex, v_rgbSE).xyz;\n        vec4 texColor = texture2D(tex, v_rgbM);\n        vec3 rgbM  = texColor.xyz;\n        vec3 luma = vec3(0.299, 0.587, 0.114);\n        float lumaNW = dot(rgbNW, luma);\n        float lumaNE = dot(rgbNE, luma);\n        float lumaSW = dot(rgbSW, luma);\n        float lumaSE = dot(rgbSE, luma);\n        float lumaM  = dot(rgbM,  luma);\n        float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));\n        float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));\n        \n        vec2 dir;\n        dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));\n        dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));\n        \n        float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) *\n                              (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);\n        \n        float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);\n        dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),\n                  max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),\n                  dir * rcpDirMin)) * inverseVP;\n        \n        vec3 rgbA = 0.5 * (\n            texture2D(tex, fragCoord * inverseVP + dir * (1.0 / 3.0 - 0.5)).xyz +\n            texture2D(tex, fragCoord * inverseVP + dir * (2.0 / 3.0 - 0.5)).xyz);\n        vec3 rgbB = rgbA * 0.5 + 0.25 * (\n            texture2D(tex, fragCoord * inverseVP + dir * -0.5).xyz +\n            texture2D(tex, fragCoord * inverseVP + dir * 0.5).xyz);\n    \n        float lumaB = dot(rgbB, luma);\n        if ((lumaB < lumaMin) || (lumaB > lumaMax))\n            color = vec4(rgbA, texColor.a);\n        else\n            color = vec4(rgbB, texColor.a);\n        return color;\n    }\n    \n    void texcoords(vec2 fragCoord, vec2 resolution,\n            out vec2 v_rgbNW, out vec2 v_rgbNE,\n            out vec2 v_rgbSW, out vec2 v_rgbSE,\n            out vec2 v_rgbM) {\n        \n        vec2 inverseVP = 1.0 / resolution.xy;\n        v_rgbNW = (fragCoord + vec2(-1.0, -1.0)) * inverseVP;\n        v_rgbNE = (fragCoord + vec2(1.0, -1.0)) * inverseVP;\n        v_rgbSW = (fragCoord + vec2(-1.0, 1.0)) * inverseVP;\n        v_rgbSE = (fragCoord + vec2(1.0, 1.0)) * inverseVP;\n        v_rgbM = vec2(fragCoord * inverseVP);\n    }\n    vec4 apply(sampler2D tex, vec2 fragCoord, vec2 resolution) {\n        vec2 v_rgbNW;\n        vec2 v_rgbNE;\n        vec2 v_rgbSW;\n        vec2 v_rgbSE;\n        vec2 v_rgbM;\n    \n        //compute the texture coords\n        texcoords(fragCoord, resolution, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);\n        \n        //compute FXAA\n        return fxaa(tex, fragCoord, resolution, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);\n    }    \n';

FxaaFilter.fragmentShaderSource = '\n    #ifdef GL_ES\n    precision lowp float;\n    #endif\n    \n    ' + FxaaFilter.fxaa + '\n    \n    uniform vec2 resolution;\n    uniform sampler2D uSampler;\n    void main(void){\n        gl_FragColor = apply(uSampler, gl_FragCoord.xy, resolution);\n    }\n    \n';

var InversionFilter = function (_Filter2) {
    _inherits(InversionFilter, _Filter2);

    function InversionFilter(ctx) {
        _classCallCheck(this, InversionFilter);

        return _possibleConstructorReturn(this, (InversionFilter.__proto__ || Object.getPrototypeOf(InversionFilter)).call(this, ctx));
    }

    _createClass(InversionFilter, [{
        key: 'getFragmentShaderSource',
        value: function getFragmentShaderSource() {
            return InversionFilter.fragmentShaderSource;
        }
    }]);

    return InversionFilter;
}(Filter);

InversionFilter.fragmentShaderSource = '\n    #ifdef GL_ES\n    precision lowp float;\n    #endif\n    varying vec2 vTextureCoord;\n    uniform sampler2D uSampler;\n    void main(void){\n        vec4 color = texture2D(uSampler, vTextureCoord);\n        color.rgb = 1.0 - color.rgb; \n        gl_FragColor = color;\n    }\n';

var BlurFilter = function (_Filter3) {
    _inherits(BlurFilter, _Filter3);

    function BlurFilter(ctx) {
        _classCallCheck(this, BlurFilter);

        var _this38 = _possibleConstructorReturn(this, (BlurFilter.__proto__ || Object.getPrototypeOf(BlurFilter)).call(this, ctx));

        _this38.ctx = ctx;

        _this38._kernelRadius = 1;

        _this38._steps = [];

        _this38.steps = 1;
        return _this38;
    }

    _createClass(BlurFilter, [{
        key: 'useDefault',
        value: function useDefault() {
            return this._size === 0 || this._kernelRadius === 0;
        }
    }, {
        key: 'getFilters',
        value: function getFilters() {
            return this._steps;
        }
    }, {
        key: 'kernelRadius',
        get: function get() {
            return this._kernelRadius;
        },
        set: function set(v) {
            this._kernelRadius = v;
            this._steps.forEach(function (step) {
                return step._kernelRadius = v;
            });
            this.redraw();
        }
    }, {
        key: 'steps',
        get: function get() {
            return this._size;
        },
        set: function set(v) {
            this._size = Math.round(v);

            var currentSteps = this._steps.length / 2;

            if (currentSteps < this._size) {
                var add = [];
                for (var _i53 = currentSteps + 1; _i53 <= this._size; _i53++) {
                    var lbf = new LinearBlurFilter(this.ctx);
                    lbf._direction[0] = _i53;
                    lbf._kernelRadius = this._kernelRadius;
                    add.push(lbf);

                    lbf = new LinearBlurFilter(this.ctx);
                    lbf._kernelRadius = this._kernelRadius;
                    lbf._direction[1] = _i53;
                    add.push(lbf);
                }
                this._steps = this._steps.concat(add);
                this.redraw();
            } else if (currentSteps > this._size) {
                var r = currentSteps - this._size;
                this._steps.splice(-r * 2);
                this.redraw();
            }
        }
    }]);

    return BlurFilter;
}(Filter);

var LinearBlurFilter = function (_Filter4) {
    _inherits(LinearBlurFilter, _Filter4);

    function LinearBlurFilter(ctx) {
        _classCallCheck(this, LinearBlurFilter);

        var _this39 = _possibleConstructorReturn(this, (LinearBlurFilter.__proto__ || Object.getPrototypeOf(LinearBlurFilter)).call(this, ctx));

        _this39._direction = new Float32Array([0, 0]);
        _this39._kernelRadius = 1;
        return _this39;
    }

    _createClass(LinearBlurFilter, [{
        key: 'getFragmentShaderSource',
        value: function getFragmentShaderSource() {
            return LinearBlurFilter.fragmentShaderSource;
        }
    }, {
        key: 'setupUniforms',
        value: function setupUniforms(operation) {
            _get(LinearBlurFilter.prototype.__proto__ || Object.getPrototypeOf(LinearBlurFilter.prototype), 'setupUniforms', this).call(this, operation);
            this._setUniform("direction", this._direction, this.gl.uniform2fv);
            this._setUniform("kernelRadius", this._kernelRadius, this.gl.uniform1i);
        }
    }, {
        key: 'x',
        get: function get() {
            return this._direction[0];
        },
        set: function set(v) {
            this._direction[0] = v;
            this.redraw();
        }
    }, {
        key: 'y',
        get: function get() {
            return this._direction[1];
        },
        set: function set(v) {
            this._direction[1] = v;
            this.redraw();
        }
    }, {
        key: 'kernelRadius',
        get: function get() {
            return this._kernelRadius;
        },
        set: function set(v) {
            this._kernelRadius = v;
            this.redraw();
        }
    }]);

    return LinearBlurFilter;
}(Filter);

LinearBlurFilter.fragmentShaderSource = '\n    #ifdef GL_ES\n    precision lowp float;\n    #endif\n    uniform vec2 resolution;\n    varying vec2 vTextureCoord;\n    uniform sampler2D uSampler;\n    uniform vec2 direction;\n    uniform int kernelRadius;\n    \n    vec4 blur1(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {\n        vec4 color = vec4(0.0);\n        vec2 off1 = vec2(1.3333333333333333) * direction;\n        color += texture2D(image, uv) * 0.29411764705882354;\n        color += texture2D(image, uv + (off1 / resolution)) * 0.35294117647058826;\n        color += texture2D(image, uv - (off1 / resolution)) * 0.35294117647058826;\n        return color; \n    }\n    \n    vec4 blur2(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {\n        vec4 color = vec4(0.0);\n        vec2 off1 = vec2(1.3846153846) * direction;\n        vec2 off2 = vec2(3.2307692308) * direction;\n        color += texture2D(image, uv) * 0.2270270270;\n        color += texture2D(image, uv + (off1 / resolution)) * 0.3162162162;\n        color += texture2D(image, uv - (off1 / resolution)) * 0.3162162162;\n        color += texture2D(image, uv + (off2 / resolution)) * 0.0702702703;\n        color += texture2D(image, uv - (off2 / resolution)) * 0.0702702703;\n        return color;\n    }\n    \n    vec4 blur3(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {\n        vec4 color = vec4(0.0);\n        vec2 off1 = vec2(1.411764705882353) * direction;\n        vec2 off2 = vec2(3.2941176470588234) * direction;\n        vec2 off3 = vec2(5.176470588235294) * direction;\n        color += texture2D(image, uv) * 0.1964825501511404;\n        color += texture2D(image, uv + (off1 / resolution)) * 0.2969069646728344;\n        color += texture2D(image, uv - (off1 / resolution)) * 0.2969069646728344;\n        color += texture2D(image, uv + (off2 / resolution)) * 0.09447039785044732;\n        color += texture2D(image, uv - (off2 / resolution)) * 0.09447039785044732;\n        color += texture2D(image, uv + (off3 / resolution)) * 0.010381362401148057;\n        color += texture2D(image, uv - (off3 / resolution)) * 0.010381362401148057;\n        return color;\n    }    \n\n    void main(void){\n        if (kernelRadius == 0) {\n            gl_FragColor = texture2D(uSampler, vTextureCoord);\n        } else if (kernelRadius == 1) {\n            gl_FragColor = blur1(uSampler, vTextureCoord, resolution, direction);\n        } else if (kernelRadius == 2) {\n            gl_FragColor = blur2(uSampler, vTextureCoord, resolution, direction);\n        } else {\n            gl_FragColor = blur3(uSampler, vTextureCoord, resolution, direction);\n        }\n    }\n';
