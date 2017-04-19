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
    module.exports = EventEmitter;
}
var isNode = !!(((typeof module !== "undefined") && module.exports));

var Utils = {};

Utils.extendClass = function(subclass, parentclass) {
    subclass.prototype = Object.create(parentclass.prototype);
    subclass.prototype.constructor = subclass;
    subclass.prototype.parentConstructor = parentclass;
};

Utils.isFunction = function(value) {
    return typeof value === 'function';
};

Utils.isNumber = function(value) {
    return typeof value === 'number';
};

Utils.isInteger = function(value) {
    return (typeof value === 'number' && (value % 1) === 0);
};

Utils.isBoolean = function(value) {
    return value === true || value === false;
};

Utils.isString = function(value) {
    return typeof value == 'string';
};

Utils.isArray = Array.isArray;

Utils.cloneObj = function(obj) {
    var keys = Object.keys(obj);
    var clone = {};
    for (var i = 0; i < keys.length; i++) {
        clone[keys[i]] = obj[keys[i]];
    }
    return clone;
};

Utils.merge = function(obj1, obj2) {
    var keys = Object.keys(obj2);
    for (var i = 0; i < keys.length; i++) {
        obj1[keys[i]] = obj2[keys[i]];
    }
    return obj1;
};

Utils.isObject = function(value) {
    var type = typeof value;
    return !!value && (type == 'object' || type == 'function');
};

Utils.isPlainObject = function(value) {
    var type = typeof value;
    return !!value && (type == 'object');
};

Utils.getArrayIndex = function(index, arr) {
    return Utils.getModuloIndex(index, arr.length);
};

Utils.getModuloIndex = function(index, len) {
    if (len == 0) return index;
    while (index < 0) {
        index += Math.ceil(-index / len) * len;
    }
    index = index % len;
    return index;
};

Utils.getDeepClone = function(obj) {
    var i, c;
    if (Utils.isFunction(obj)) {
        // Copy functions by reference.
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
        var keys = Object.keys(obj);
        for (i = 0; i < keys.length; i++) {
            c[keys[i]] = Utils.getDeepClone(obj[keys[i]]);
        }
        return c;
    } else {
        return obj;
    }
};

Utils.setToArray = function(s) {
    var result = [];
    s.forEach(function(value) {
        result.push(value);
    });
    return result;
};

Utils.iteratorToArray = function(iterator) {
    var result = [];
    var iteratorResult = iterator.next();
    while (!iteratorResult.done) {
        result.push(iteratorResult.value);
        iteratorResult = iterator.next();
    }
    return result;
};

Utils.async = {
    parallel: function(tasks, cb) {
        var i, n  = tasks.length;
        var done = false;
        var c = n;
        var results = [];
        for (i = 0; i < n; i++) {
            (function(i) {
                tasks[i](function(err, res) {
                    results[i] = res;
                    if (err) {
                        if (!done) {
                            cb(err);
                            done = true;
                        }
                    } else {
                        c--;
                        if (c == 0 && !done) {
                            cb(null, results);
                            done = true;
                        }
                    }
                });
            })(i);
        }
    }
};


/**
 * Container for a tree structure of components.
 * @constructor
 */
function Stage(options) {
    EventEmitter.call(this);

    this.adapter = options.adapter;
    if (!this.adapter) {
                if (!isNode) {
            this.adapter = new WebAdapter();
        }
    }

    this.adapter.stage = this;

    var w = options && options.w;
    var h = options && options.h;

    if (!w || !h) {
        w = 1280;
        h = 720;
    }

    this.w = w;
    this.h = h;

    this.reuseCanvas = (options && options.reuseCanvas) || null;

    this.renderWidth = (options && options.rw) || this.w;
    this.renderHeight = (options && options.rh) || this.h;

    this.textureMemory = (options && options.textureMemory) || 12e6;

    if (options && options.hasOwnProperty('glClearColor')) {
        this.setGlClearColor(options.glClearColor);
    } else {
        this.setGlClearColor(this.adapter.glClearColor || [0, 0, 0, 0]);
    }

    this.defaultFontFace = (options && options.defaultFontFace) || "Arial";
    
    this.defaultPrecision = (options && options.defaultPrecision) || (this.h / this.renderHeight);

    this.fixedDt = (options && options.fixedDt) || 0;

    /**
     * Counts the number of drawn frames.
     * @type {number}
     */
    this.frameCounter = 0;

    /**
     * Whether or not to use a texture atlas to prevent bindTexture switching.
     */
    this.useTextureAtlas = (options && options.hasOwnProperty('useTextureAtlas')) ? options.useTextureAtlas : false;
    if (this.useTextureAtlas) {
        console.log('Using texture atlas.');
    }

    this.debugTextureAtlas = this.useTextureAtlas && (options && options.hasOwnProperty('debugTextureAtlas')) ? options.debugTextureAtlas : false;
    if (this.debugTextureAtlas) {
        console.log('Showing texture atlas for debug.');
    }

    this.renderer = new Renderer(this, w, h);

    this.textureManager = new TextureManager(this, this.renderer.gl);

    /**
     * Create a texture atlas which helps us to prevent texture switches.
     * @type {TextureAtlas}
     */
    this.textureAtlas = this.useTextureAtlas ? new TextureAtlas(this, this.renderer.gl) : null;

    /**
     * The rendering state of this stage.
     * @type {number}
     */
    this.state = Stage.STATES.IDLE;

    /**
     * @type {Component}
     */
    this.root = this.c();
    this.root.active = true;
    this.root.setAsRoot();

    /**
     * The current frame time delta.
     * @type {number}
     */
    this.dt = 0;

    /**
     * The currently active transitions.
     * @type {Set<Transition>}
     */
    this.activeTransitions = new Set();

    /**
     * The currently active animations.
     * @type {Set<Animation>}
     */
    this.activeAnimations = new Set();

    this.measure = !!options.measure;
    this.measureDetails = !!options.measureDetails;
    this.measureFrameDistribution = !!options.measureFrameDistribution;
    this.measureInnerFrameDistribution = !!options.measureInnerFrameDistribution;

    // Measurement stuff.
    this.measureStart = {};
    this.measureTotalMs = {};
    this.measureMs = {};
    this.measureLastFrameCounter = {};
    this.measureCount = {};

    this.rectangleTexture = this.texture(Stage.rectangleSource.src, Stage.rectangleSource);

    if (this.adapter.setStage) {
        this.adapter.setStage(this);
    }

    this.uComponentContext = this.adapter.getUComponentContext();

    /**
     * Counts the number of attached components that are using z-indices.
     * This is used to determine if we can use a single-pass or dual-pass update/render loop.
     * @type {number}
     */
    this.zIndexUsage = 0;

    this.profile = new Array(60);
    this.innerProfile = new Array(10);
    this.profileLast = 0;

    // Start.
    this.init();

    this.destroyed = false;

}

Utils.extendClass(Stage, EventEmitter);

Stage.prototype.destroy = function() {
    this.adapter.stopAnimationLoop();
    if (this.useTextureAtlas) {
        this.textureAtlas.destroy();
    }
    this.renderer.destroy();
    this.textureManager.destroy();
    this.destroyed = true;
};


Stage.prototype.setGlClearColor = function(clearColor) {
    if (Array.isArray(clearColor)) {
        this.glClearColor = clearColor;
    } else {
        this.glClearColor = StageUtils.getRgbaComponentsNormalized(clearColor);
    }
};

Stage.prototype.getCanvas = function() {
    return this.adapter.canvas;
};

Stage.prototype.timeStart = function(name) {
    this.measureCount[name]++;
    if (this.frameCounter != this.measureLastFrameCounter[name]) {
        this.measureLastFrameCounter[name] = this.frameCounter;
        this.measureTotalMs[name] += this.measureMs[name];
        if (this.frameCounter % 100 == 0) {
            console.log(name + ': ' + ((this.measureTotalMs[name] / 100) - (name == 'global' ? 4.5 : 0)).toFixed(3) + ' (' + (this.measureCount[name] / 100) + ')');
            this.measureTotalMs[name] = 0;
            this.measureCount[name] = 0;
        }
        this.measureMs[name] = 0;
    }
    this.measureStart[name] = this.adapter.getHrTime();
};

Stage.prototype.timeEnd = function(name) {
    var e = this.adapter.getHrTime();
    this.measureMs[name] += (e - this.measureStart[name]);
};

Stage.prototype.stop = function() {
    this.adapter.stopAnimationLoop();
};

Stage.prototype.resume = function() {
    this.adapter.startAnimationLoop();
};

Stage.prototype.init = function() {
    if (this.adapter.init) {
        this.adapter.init();
    }

    // Preload rectangle texture, so that we can skip some border checks for loading textures.
    var self = this;
    var rect = this.getRectangleTexture();
    var src = rect.source;
    src.onload = function() {
        self.adapter.startAnimationLoop(function() {self.drawFrame();});
        src.permanent = true;
        if (self.useTextureAtlas) {
            self.textureAtlas.add(src);
        }
    };
    rect.load();
};

Stage.prototype.getRectangleTexture = function() {
    return this.rectangleTexture;
};

Stage.prototype.addActiveTransition = function(transition) {
    this.activeTransitions.add(transition);
};

Stage.prototype.addActiveAnimation = function(a) {
    this.activeAnimations.add(a);
};

Stage.prototype.drawFrame = function() {
    if (this.measureFrameDistribution || this.measureInnerFrameDistribution) {
        var s = this.adapter.getHrTime();
        if (this.profileLast && this.measureFrameDistribution) {
            var f = Math.max(Math.round((s - this.profileLast)/(1*16.6667)) - 1, 0);
            if (f > 19) f = 19;
            this.profile[f]++;

            if (this.frameCounter % 100 == 0) {
                console.log('F ' + this.profile.join(" "));
                for (var i = 0; i < 20; i++) {
                    this.profile[i] = 0;
                }
            }
        }
        this.profileLast = s;
    }

    this.measure && this.timeStart('total');
    if (this.fixedDt) {
        this.dt = this.fixedDt;
    } else {
        this.dt = (!this.startTime) ? .02 : .001 * (this.currentTime - this.startTime);
    }
    this.startTime = this.currentTime;
    this.currentTime = (new Date()).getTime();

    this.measureDetails && this.timeStart('frame start');
    if (this._eventsCount) this.emit('frameStart');
    this.measureDetails && this.timeEnd('frame start');
    this.state = Stage.STATES.TRANSITIONS;

    s = this.adapter.getHrTime();
    this.measureDetails && this.timeStart('transitions');
    this.progressTransitions();
    this.measureDetails && this.timeEnd('transitions');

    // Apply animations.
    this.state = Stage.STATES.ANIMATIONS;
    this.measureDetails && this.timeStart('animations');
    this.progressAnimations();
    this.measureDetails && this.timeEnd('animations');

    this.measureDetails && this.timeStart('update');
    this.state = Stage.STATES.UPDATE;
    if (this._eventsCount) this.emit('update');
    this.measureDetails && this.timeEnd('update');

    if (this.textureManager.isFull()) {
        console.log('clean up');
        // Clean up all textures instead of those in the last frame.
        this.textureManager.freeUnusedTextureSources();
    }

    this.measureDetails && this.timeStart('perform updates');
    this.performUpdates();
    this.measureDetails && this.timeEnd('perform updates');

    if (this.renderNeeded) {
        // We will render the stage even if it's stable shortly after importing a texture in the texture atlas, to prevent out-of-syncs.
        this.measureDetails && this.timeStart('render');
        this.renderer.render();
        this.measureDetails && this.timeEnd('render');
    }

    this.state = Stage.STATES.IDLE;
    this.measureDetails && this.timeStart('frame end');
    if (this._eventsCount) this.emit('frameEnd');
    this.measureDetails && this.timeEnd('frame end');
    this.measure && this.timeEnd('total');

    this.adapter.nextFrame(this.renderNeeded);

    if (this.measureInnerFrameDistribution) {
        s = this.adapter.getHrTime() - this.profileLast;
        var f = Math.max(Math.round(s / (1 * 16.66667)) - 1, 0);
        if (f > 19) f = 19;
        this.innerProfile[f]++;

        if (this.frameCounter % 100 == 0) {
            console.log('I ' + this.innerProfile.join(" "));
            for (var i = 0; i < 20; i++) {
                this.innerProfile[i] = 0;
            }
        }
    }

    this.frameCounter++;
};

Stage.prototype.progressTransitions = function() {
    var self = this;

    if (this.activeTransitions.size) {
        this.activeTransitions.forEach(function(transition) {
            if (transition.component.attached && transition.isActive()) {
                transition.progress(self.dt);
            } else {
                self.activeTransitions.delete(transition);
            }
        });
    }
};

Stage.prototype.progressAnimations = function() {
    var self = this;
    if (this.activeAnimations.size) {
        this.activeAnimations.forEach(function (animation) {
            if (animation.subject && animation.subject.attached && animation.isActive()) {
                animation.progress(self.dt);
                animation.applyTransforms();
            } else {
                self.activeAnimations.delete(animation);
            }
        });
    }
};

/**
 * Actually perform the updates.
 */
Stage.prototype.performUpdates = function() {
    if (this.useTextureAtlas) {
        // Add new texture sources to the texture atlas.
        this.textureAtlas.flush();
    }

    var ctx = this.adapter.getUComponentContext();
    this.renderNeeded = ctx.updateAndFillVbo(this.zIndexUsage > 0);
};

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
 * @returns {Texture}
 */
Stage.prototype.texture = function(source, options) {
    return this.textureManager.getTexture(source, options);
};

/**
 * Creates a new component.
 * @returns {Component}
 */
Stage.prototype.component = function(settings) {
    var component = new Component(this);

    if (settings) {
        component.set(settings);
    }
    return component;
};

/**
 * Creates a new component.
 * @returns {Component}
 */
Stage.prototype.c = function(settings) {
    var component = new Component(this);
    if (settings) {
        component.set(settings);
    }
    return component;
};

Stage.prototype.animation = function(settings) {
    var a = new Animation(this);
    if (settings) {
        a.set(settings);
    }
    return a;
};

/**
 * The rendering loop states.
 * @type {object}
 */
Stage.STATES = {
    IDLE: 0,
    TRANSITIONS: 1,
    ANIMATIONS: 2,
    UPDATE: 3,
    RENDER: 4
};

/**
 * Auto-increment component id.
 * @type {number}
 */
Stage.componentId = 0;

Stage.rectangleSource = {src: function(cb) {
    var whitePixel = new Uint8Array([255, 255, 255, 255]);
    return cb(null, whitePixel, {w: 1, h: 1});
}, id:"__whitepix"};

Stage.W = 1280;
Stage.H = 720;




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

StageUtils.getRgbaComponentsNormalized = function(argb) {
    var r = ((argb / 65536)|0) % 256;
    var g = ((argb / 256)|0) % 256;
    var b = argb % 256;
    var a = ((argb / 16777216)|0);
    return [r*0.003921569, g*0.003921569, b*0.003921569, a*0.003921569];
};

StageUtils.getRgbaComponents = function(argb) {
    var r = ((argb / 65536)|0) % 256;
    var g = ((argb / 256)|0) % 256;
    var b = argb % 256;
    var a = ((argb / 16777216)|0);
    return [r, g, b, a];
};

StageUtils.getArgbNumber = function(rgba) {
    rgba[0] = Math.max(0, Math.min(255, rgba[0]));
    rgba[1] = Math.max(0, Math.min(255, rgba[1]));
    rgba[2] = Math.max(0, Math.min(255, rgba[2]));
    rgba[3] = Math.max(0, Math.min(255, rgba[3]));
    var v = ((rgba[3]|0) << 24) + ((rgba[0]|0) << 16) + ((rgba[1]|0) << 8) + (rgba[2]|0);
    if (v < 0) {
        v = 0xFFFFFFFF + v + 1;
    }
    return v;
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

StageUtils.getTimingFunction = function(str) {
    switch(str) {
        case "linear":
            return function(time) {return time};
        case "ease":
            return StageUtils.getTimingBezier(0.25,0.1,0.25,1.0);
        case "ease-in":
            return StageUtils.getTimingBezier(0.42,0,1.0,1.0);
        case "ease-out":
            return StageUtils.getTimingBezier(0,0,0.58,1.0);
        case "ease-in-out":
            return StageUtils.getTimingBezier(0.42,0,0.58,1.0);
        case "step-start":
            return function() {return 1};
        case "step-end":
            return function(time) {return time === 1 ? 1 : 0;};
        default:
            var s = "cubic-bezier(";
            if (str && str.indexOf(s) === 0) {
                var parts = str.substr(s.length, str.length - s.length - 1).split(",");
                if (parts.length !== 4) {
                    console.warn("Unknown timing function: " + str);

                    // Fallback: use linear.
                    return function(time) {return time};
                }
                var a = parseFloat(parts[0]);
                var b = parseFloat(parts[1]);
                var c = parseFloat(parts[2]);
                var d = parseFloat(parts[3]);
                if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d)) {
                    console.warn("Unknown timing function: " + str);
                    // Fallback: use linear.
                    return function(time) {return time};
                }

                return StageUtils.getTimingBezier(a,b,c,d);
            } else {
                console.warn("Unknown timing function: " + str);
                // Fallback: use linear.
                return function(time) {return time};
            }
    }
};

StageUtils.getSplineValueFunction = function(v1, v2, p1, p2, o1, i2, s1, s2) {
    // Normalize slopes because we use a spline that goes from 0 to 1.
    var dp = p2 - p1;
    s1 *= dp;
    s2 *= dp;

    var helpers = StageUtils.getSplineHelpers(v1, v2, o1, i2, s1, s2);
    if (!helpers) {
        return function(p) {
            if (p == 0) return v1;
            if (p == 1) return v2;

            return v2 * p + v1 * (1 - p);
        };
    } else {
        return function(p) {
            if (p == 0) return v1;
            if (p == 1) return v2;
            return StageUtils.calculateSpline(helpers, p);
        };
    }
};

StageUtils.getSplineRgbaValueFunction = function(v1, v2, p1, p2, o1, i2, s1, s2) {
    // Normalize slopes because we use a spline that goes from 0 to 1.
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

    var helpers = [
        StageUtils.getSplineHelpers(cv1[0], cv2[0], o1, i2, s1[0], s2[0]),
        StageUtils.getSplineHelpers(cv1[1], cv2[1], o1, i2, s1[1], s2[1]),
        StageUtils.getSplineHelpers(cv1[2], cv2[2], o1, i2, s1[2], s2[2]),
        StageUtils.getSplineHelpers(cv1[3], cv2[3], o1, i2, s1[3], s2[3])
    ];

    if (!helpers[0]) {
        return function(p) {
            // Linear.
            if (p == 0) return v1;
            if (p == 1) return v2;

            return StageUtils.mergeColors(v2, v1, p);
        };
    } else {
        return function(p) {
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
StageUtils.getSplineHelpers = function(v1, v2, o1, i2, s1, s2) {
    if (!o1 && !i2) {
        // Linear.
        return null;
    }

    // Cubic bezier points.
    // http://cubic-bezier.com/
    var csx = o1;
    var csy = v1 + s1 * o1;
    var cex = 1 - i2;
    var cey = v2 - s2 * i2;

    // Helper variables.
    var xa = 3 * csx - 3 * cex + 1;
    var xb = -6 * csx + 3 * cex;
    var xc = 3 * csx;

    var ya = 3 * csy - 3 * cey + v2 - v1;
    var yb = 3 * (cey + v1) -6 * csy;
    var yc = 3 * (csy - v1);
    var yd = v1;

    return [xa, xb, xc, ya, yb, yc, yd];
};

/**
 * Calculates the intermediate spline value based on the specified helpers.
 * @param {number[]} helpers
 *   Obtained from getSplineHelpers.
 * @param {number} p
 * @return {number}
 */
StageUtils.calculateSpline = function(helpers, p) {
    var xa = helpers[0];
    var xb = helpers[1];
    var xc = helpers[2];
    var ya = helpers[3];
    var yb = helpers[4];
    var yc = helpers[5];
    var yd = helpers[6];

    if (xa == -2 && ya == -2 && xc == 0 && yc == 0) {
        // Linear.
        return p;
    }

    // Find t for p.
    var t = 0.5, cbx, dx;

    for (var it = 0; it < 20; it++) {
        // Cubic bezier function: f(t)=t*(t*(t*a+b)+c).
        cbx = t*(t*(t*xa+xb)+xc);

        dx = p - cbx;
        if (dx > -1e-8 && dx < 1e-8) {
            // Solution found!
            return t*(t*(t*ya+yb)+yc)+yd;
        }

        // Cubic bezier derivative function: f'(t)=t*(t*(3*a)+2*b)+c
        var cbxd = t*(t*(3*xa)+2*xb)+xc;

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

        // Cubic bezier function: f(t)=t*(t*(t*a+b)+c)+d.
        cbx = t*(t*(t*xa+xb)+xc);

        dx = p - cbx;
        if (dx > -1e-8 && dx < 1e-8) {
            // Solution found!
            return t*(t*(t*ya+yb)+yc)+yd;
        }

        if (dx < 0) {
            maxT = t;
        } else {
            minT = t;
        }
    }

    return t;
};



var GeometryUtils = {};

GeometryUtils.dotprod = function(ux, uy, vx, vy) {
    return ux * vx + uy * vy;
};

/**
 * Returns true if the specified point lies within the convex polygon.
 * @param {number[]} a
 * @param {number} x
 * @param {number} y
 * @return {boolean}
 */
GeometryUtils.pointInConvex = function(a, x, y) {
    var i, n, ax, ay;
    n = a.length;
    for (i = 0; i <= a.length - 2; i += 2) {
        ax = a[(i + 2) % n] - a[i];
        ay = a[(i + 3) % n] - a[i + 1];

        if (GeometryUtils.dotprod(x - a[i], y - a[i+1], -ay, ax) <= 0) {
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
GeometryUtils.intersectConvex = function(a, b) {
    var i, j, n, m;

    n = a.length;

    // Intersection result. We'll slice off the invisible vertices.
    var c = b;
    var nc;

    var anyIntersections = false;

    // Traverse all edges of a.
    for (i = 0; i <= n - 2; i += 2) {
        // Get unit vector for edge of a.
        var ax = a[(i+2)%n] - a[i];
        var ay = a[(i+3)%n] - a[i + 1];
        var l = Math.sqrt(ax * ax + ay * ay);
        ax /= l;
        ay /= l;

        m = c.length;
        nc = [];

        var firstOffsetY, prevOffsetY, firstWasInside, prevWasInside, inside;
        for (j = 0; j <= m - 2; j += 2) {
            var dx = c[j] - a[i];
            var dy = c[j+1] - a[i+1];

            // Calculate offset of vertex perpendicular to a-edge.
            var offsetY = GeometryUtils.dotprod(dx, dy, -ay, ax);

            // Count as 'inside' if the point lies within the polygon or on one of the edges.
            // We need to include a small margin for rounding errors which may cause 'double' points when
            // traversing parallel edges.
            inside = (offsetY >= -1e-9);

            if (j >= 2) {
                if (prevWasInside != inside) {
                    // Add additional intersection point.

                    // Calculate intersection offset.
                    var prevOffsetX = GeometryUtils.dotprod(c[j-2] - a[i], c[j-1] - a[i+1], ax, ay);
                    var offsetX = GeometryUtils.dotprod(dx, dy, ax, ay);

                    var dxdy = (offsetX - prevOffsetX) / (offsetY - prevOffsetY);
                    var isect = (prevOffsetX - dxdy * prevOffsetY);

                    var isectX = a[i] + isect * ax;
                    var isectY = a[i+1] + isect * ay;

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
                nc.push(c[j], c[j+1]);
            }

            if (j == m - 2) {
                // Complete the polygon with the edge from last to first.
                if (inside != firstWasInside) {
                    // Add additional intersection point.
                    var firstOffsetX = GeometryUtils.dotprod(c[0] - a[i], c[1] - a[i+1], ax, ay);

                    var offsetX = GeometryUtils.dotprod(dx, dy, ax, ay);

                    var dxdy = (offsetX - firstOffsetX) / (offsetY - firstOffsetY);
                    var isect = (firstOffsetX - dxdy * firstOffsetY);

                    var isectX = a[i] + isect * ax;
                    var isectY = a[i+1] + isect * ay;

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
        var minAx = a[0];
        var maxAx = a[0];
        var minAy = a[1];
        var maxAy = a[1];

        // Get average point of a.
        var avgAx = a[0], avgAy = a[1];
        for (i = 2; i <= n - 2; i += 2) {
            avgAx += a[i];
            avgAy += a[i+1];

            if (a[i] < minAx) minAx = a[i];
            if (a[i] > maxAx) maxAx = a[i];
            if (a[i+1] < minAy) minAy = a[i+1];
            if (a[i+1] > maxAy) maxAy = a[i+1];
        }
        avgAx /= 0.5 * n;
        avgAy /= 0.5 * n;


        // Get bounding box of b.
        var minBx = b[0];
        var maxBx = b[0];
        var minBy = b[1];
        var maxBy = b[1];

        // Get average point of a.
        m = b.length;
        var avgBx = b[0], avgBy = b[1];
        for (i = 2; i <= m - 2; i += 2) {
            avgBx += b[i];
            avgBy += b[i+1];

            if (b[i] < minBx) minBx = b[i];
            if (b[i] > maxBx) maxBx = b[i];
            if (b[i+1] < minBy) minBy = b[i+1];
            if (b[i+1] > maxBy) maxBy = b[i+1];
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
                        if (!GeometryUtils.pointInConvex(b, a[i], a[i+1])) {
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
};



/**
 * The texture manager.
 * @constructor
 */
function TextureManager(stage, gl) {

    this.stage = stage;

    this.gl = gl;

    /**
     * The texture memory in pixels. After reaching this number, old unused textures will be garbage collected.
     * The actual memory usage is observed to be about 10B per pixel.
     * @type {number}
     */
    this.textureMemory = stage.textureMemory;

    /**
     * The currently used amount of texture memory.
     * @type {number}
     */
    this.usedTextureMemory = 0;

    /**
     * All uploaded texture sources.
     * @type {TextureSource[]}
     */
    this.uploadedTextureSources = [];

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

TextureManager.prototype.destroy = function() {
    for (var i = 0, n = this.uploadedTextureSources.length; i < n; i++) {
        var ts = this.uploadedTextureSources[i];
        this.gl.deleteTexture(ts.glTexture);
    }
};

/**
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
 *
 * @returns {Texture}
 */
TextureManager.prototype.getTexture = function(source, options) {
    var id = options && options.id || null;

    var x = options && options.x || 0;
    var y = options && options.y || 0;
    var w = options && options.w || 0;
    var h = options && options.h || 0;

    var texture, textureSource;
    if (Utils.isString(source)) {
        id = id || source;

        // Check if texture source is already known.
        textureSource = this.textureSourceHashmap.get(id);
        if (!textureSource) {
            // Create new texture source.
            var self = this;
            var func = function(cb) {
                self.stage.adapter.loadTextureSourceString(source, cb);
            };
            textureSource = this.getTextureSource(func, id);
        }

        // Create new texture object.
        texture = new Texture(this, textureSource);
        texture.x = x;
        texture.y = y;
        texture.w = w;
        texture.h = h;
        texture.clipping = !!(x || y || w || h);
        return texture;
    } else {
        // Check if texture source is already known.
        textureSource = id ? this.textureSourceHashmap.get(id) : null;
        if (!textureSource) {
            if (source instanceof TextureSource) {
                textureSource = source;
            } else {
                // Create new texture source.
                textureSource = this.getTextureSource(source, id);

                if (id) {
                    this.textureSourceHashmap.set(id, textureSource);
                }
            }
        }

        // Create new texture object.
        texture = new Texture(this, textureSource);
        texture.x = x;
        texture.y = y;
        texture.w = w;
        texture.h = h;
        texture.clipping = !!(x || y || w || h);

        return texture;
    }
};

TextureManager.prototype.getTextureSource = function(func, id) {
    // Check if texture source is already known.
    var textureSource = id ? this.textureSourceHashmap.get(id) : null;
    if (!textureSource) {
        // Create new texture source.
        textureSource = new TextureSource(this, func);

        if (id) {
            textureSource.lookupId = id;
            this.textureSourceHashmap.set(id, textureSource);
        }
    }

    return textureSource;
};

/**
 * Tries to prepare the specified textures for rendering ASAP.
 */
TextureManager.prototype.loadTexture = function(texture) {
    var textureSource = texture.source;

    if (textureSource.glTexture) {
        // Loaded already.
    } else {
        var now = (new Date()).getTime();
        if (textureSource.loadingSince && textureSource.loadingSince > (now - 30000)) {
            // Being loaded right now.
        } else {
            // Not yet loading or timeout on loading: load.
            textureSource.loadingSince = now;
            var self = this;
            (function(textureSource) {
                if (textureSource.glTexture) {
                    // Texture has been stored permanently. We'll reuse it.
                    textureSource.loadingSince = null;
                    return;
                }

                textureSource.loadSource(function(err, source, options) {
                    if (err) {
                        console.error('texture load error', err);
                        textureSource.hasError(err);
                        return;
                    }

                    if (self.stage.destroyed) {
                        // Ignore
                        return;
                    }

                    // Texture is no longer loading.
                    textureSource.loadingSince = null;

                    if (source instanceof TextureSource) {
                        texture.replaceTextureSource(source);

                        // Try to load texture with the new source.
                        self.loadTexture(texture);
                    } else {
                        // Source loaded!
                        if (!textureSource.glTexture) {
                            if (source.width > 2048 || source.height > 2048) {
                                console.error('Texture size too large: ' + source.width + 'x' + source.height + ' (max allowed is 2048x2048)');
                                return;
                            }

                            textureSource.w = source.width || (options && options.w) || 0;
                            textureSource.h = source.height || (options && options.h) || 0;
                            textureSource.precision = (options && options.precision) || 1;

                            if (options && options.renderInfo) {
                                // Assign to id in cache so that it can be reused.
                                textureSource.renderInfo = options.renderInfo;
                            }

                            self.uploadTextureSource(textureSource, source);

                            textureSource.isLoaded();
                        }
                    }
                });
            })(textureSource);
        }
    }
};

TextureManager.prototype.uploadTextureSource = function(textureSource, source) {
    if (textureSource.glTexture) return;

    // Load texture.
    var gl = this.gl;
    var sourceTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, sourceTexture);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    this.stage.adapter.uploadGlTexture(gl, textureSource, source);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Store texture.
    textureSource.glTexture = sourceTexture;

    this.usedTextureMemory += textureSource.w * textureSource.h;

    this.uploadedTextureSources.push(textureSource);
};

TextureManager.prototype.isFull = function() {
    return (this.usedTextureMemory >= this.textureMemory);
};

/**
 * Garbage collects all unused textures.
 */
TextureManager.prototype.freeUnusedTextureSources = function() {
    var remainingTextureSources = [];
    var usedTextureMemoryBefore = this.usedTextureMemory;
    for (var i = 0, n = this.uploadedTextureSources.length; i < n; i++) {
        var ts = this.uploadedTextureSources[i];
        if (!ts.permanent && (ts.components.size === 0)) {
            this.freeTextureSource(ts);
        } else {
            remainingTextureSources.push(ts);
        }
    }

    var self = this;
    this.textureSourceHashmap.forEach(function(textureSource) {
        if (!textureSource.permanent && (textureSource.components.size === 0)) {
            self.freeTextureSource(textureSource);
        }
    });

    this.uploadedTextureSources = remainingTextureSources;
    console.log('freed ' + ((usedTextureMemoryBefore - this.usedTextureMemory) / 1e6).toFixed(2) + 'M texture pixels from GPU memory. Remaining: ' + this.usedTextureMemory);
};

/**
 * Frees the WebGL texture from memory.
 * @param {TextureSource} textureSource
 * @pre textureSource.components.size === 0
 */
TextureManager.prototype.freeTextureSource = function(textureSource) {
    if (textureSource.glTexture) {
        this.usedTextureMemory -= textureSource.w * textureSource.h;
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
};

/**
 * Completely delete the texture source and all references to it.
 * @param {TextureSource} textureSource
 */
TextureManager.prototype.removeTextureSource = function(textureSource) {
    this.freeTextureSource(textureSource);

    textureSource.loadingSince = null;

    if (textureSource.lookupId) {
        this.textureSourceHashmap.delete(textureSource.lookupId);
    }
};


/**
 * A texture.
 * @param {TextureSource} source
 * @param {TextureManager} manager
 * @constructor
 */
function Texture(manager, source) {
    this.manager = manager;

    this.id = ++Texture.id;

    /**
     * The associated texture source.
     * Should not be changed.
     * @type {TextureSource}
     */
    this.source = source;

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
     * Indicates if this texture uses clipping.
     * @type {boolean}
     */
    this.clipping = false;

    /**
     * All active Components that are using this texture (either as texture or displayedTexture, or both).
     * @type {Set<Component>}
     */
    this.components = new Set();

}

Texture.prototype.addComponent = function(c) {
    this.components.add(c);

    if (!this.source.glTexture) {
        // Attempts to load texture (if not already loaded).
        this.manager.loadTexture(this);
    }
};

Texture.prototype.removeComponent = function(c) {
    this.components.delete(c);
};

Texture.prototype.enableClipping = function(x, y, w, h) {
    if (this._x !== x || this._y !== y || this._w !== w || this._h !== h) {
        this._x = x;
        this._y = y;
        this._w = w;
        this._h = h;

        this.updateClipping(true);
    }
};

Texture.prototype.disableClipping = function() {
    if (this._x || this._y || this._w || this._h) {
        this._x = 0;
        this._y = 0;
        this._w = 0;
        this._h = 0;

        this.updateClipping(false);
    }
};

Texture.prototype.updateClipping = function(overrule) {
    if (overrule === true || overrule === false) {
        this.clipping = overrule;
    } else {
        this.clipping = !!(this._x || this._y || this._w || this._h);
    }

    var self = this;
    this.components.forEach(function(component) {
        // Ignore if not the currently displayed texture.
        if (component.displayedTexture === self) {
            component.displayedTextureClippingChanged();
        }
    });
};

Texture.prototype.replaceTextureSource = function(newSource) {
    var components = new Set(this.components);

    var self = this;

    // Make sure that all components and component links are updated properly.
    components.forEach(function(component) {
        if (component.texture === self) {
            component.texture = null;
        } else if (component.displayedTexture === self) {
            component.displayedTexture = null;
        }
    });

    this.source = newSource;

    components.forEach(function(component) {
        if (component.texture === null) {
            component.texture = self;
        } else {
            if (newSource.glTexture) {
                component.displayedTexture = self;
            }
        }
    });
};

Texture.prototype.load = function() {
    this.manager.loadTexture(this);
};

/**
 * Frees the GL texture, and forces a reload when it is required again.
 */
Texture.prototype.free = function() {
    this.manager.freeTextureSource(this.source);
};

Texture.prototype.set = function(obj) {
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
        var value = obj[keys[i]];
        this.setSetting(keys[i], value);
    }
};

Texture.prototype.setSetting = function(name, value) {
    var setting = Texture.SETTINGS[name];
    if (setting) {
        setting.s(this, value);
    } else {
        console.warn("Unknown texture property: " + name);
    }
};

Texture.prototype.getNonDefaults = function() {
    var nonDefaults = {};
    if (this.x !== 0) nonDefaults['x'] = this.x;
    if (this.y !== 0) nonDefaults['y'] = this.x;
    if (this.w !== 0) nonDefaults['w'] = this.x;
    if (this.h !== 0) nonDefaults['h'] = this.x;
    return nonDefaults;
};

Object.defineProperty(Texture.prototype, 'x', {
    get: function() {
        return this._x;
    },
    set: function(v) {
        if (this._x !== v) {
            this._x = v;

            this.updateClipping();
        }
    }
});

Object.defineProperty(Texture.prototype, 'y', {
    get: function() {
        return this._y;
    },
    set: function(v) {
        if (this._y !== v) {
            this._y = v;

            this.updateClipping();
        }
    }
});

Object.defineProperty(Texture.prototype, 'w', {
    get: function() {
        return this._w;
    },
    set: function(v) {
        if (this._w !== v) {
            this._w = v;

            this.updateClipping();
        }
    }
});

Object.defineProperty(Texture.prototype, 'h', {
    get: function() {
        return this._h;
    },
    set: function(v) {
        if (this._h !== v) {
            this._h = v;

            this.updateClipping();
        }
    }
});

Texture.SETTINGS = {
    'x': {s: function(obj, value) {obj.x = value}, m: StageUtils.mergeNumbers},
    'y': {s: function(obj, value) {obj.y = value}, m: StageUtils.mergeNumbers},
    'w': {s: function(obj, value) {obj.w = value}, m: StageUtils.mergeNumbers},
    'h': {s: function(obj, value) {obj.h = value}, m: StageUtils.mergeNumbers}
};

Texture.id = 0;


/**
 * A texture source.
 * @constructor
 */
var TextureSource = function(manager, loadSource) {

    /**
     * @type {TextureManager}
     */
    this.manager = manager;

    this.stage = manager.stage;

    this.id = ++TextureSource.id;

    /**
     * Identifier for reusing this texture.
     * @type {String}
     */
    this.lookupId = null;

    /**
     * The factory for the source of this texture.
     * @type {Function}
     */
    this.loadSource = loadSource;

    /**
     * Loading since timestamp in millis.
     * @type {number}
     */
    this.loadingSince = null;

    /**
     * Flag that indicates if this texture source was stored in the texture atlas.
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

    // Source dimensions, after loading.
    this.w = 0;
    this.h = 0;

    /**
     * Precision (resolution, 1 = normal, 2 = twice as big as should be shown).
     * @type {number}
     */
    this._precision = 1;

    /**
     * 1 / precision.
     * @type {number}
     */
    this.iprecision = 1;

    // The WebGL loaded texture.
    this.glTexture = null;

    /**
     * If true, then this texture source is never freed from memory during garbage collection.
     * @type {boolean}
     */
    this.permanent = false;

    /**
     * All active Components that are using this texture source via a texture (either as texture or displayedTexture, or both).
     * @type {Set<Component>}
     */
    this.components = new Set();

    this.onload = null;

    /**
     * Sub-object with texture-specific rendering information.
     * For images, this contains the src property, for texts, this contains handy rendering information.
     * @type {Object}
     */
    this.renderInfo = null;

};

TextureSource.prototype.getRenderWidth = function() {
    return this.w / this.precision;
};

TextureSource.prototype.getRenderHeight = function() {
    return this.h / this.precision;
};

TextureSource.prototype.addComponent = function(c) {
    this.components.add(c);

    if (this.glTexture) {
        // If not yet loaded, wait until it is loaded until adding it to the texture atlas.
        if (this.stage.useTextureAtlas) {
            this.stage.textureAtlas.addActiveTextureSource(this);
        }
    }

    if (this.components.size === 1) {
        this.manager.textureSourceIdHashmap.set(this.id, this);
        if (this.lookupId) {
            if (!this.manager.textureSourceHashmap.has(this.lookupId)) {
                this.manager.textureSourceHashmap.set(this.lookupId, this);
            }
        }
    }
};

TextureSource.prototype.removeComponent = function(c) {
    if (this.components.size) {
        this.components.delete(c);

        if (!this.components.size) {
            if (this.stage.useTextureAtlas) {
                this.stage.textureAtlas.removeActiveTextureSource(this);
            }
            this.manager.textureSourceIdHashmap.delete(this.id);
        }
    }
};

TextureSource.prototype.isLoaded = function() {
    if (this.components.size) {
        if (this.stage.useTextureAtlas) {
            this.stage.textureAtlas.addActiveTextureSource(this);
        }
    }

    this.components.forEach(function(component) {
        component.textureSourceIsLoaded();
    });

    if (this.onload) this.onload();
    this.onload = null;
};

TextureSource.prototype.hasError = function(e) {
    this.components.forEach(function(component) {
        component.textureSourceHasLoadError(e);
    });
};

TextureSource.prototype.isAddedToTextureAtlas = function(x, y) {
    this.inTextureAtlas = true;
    this.textureAtlasX = x;
    this.textureAtlasY = y;

    this.components.forEach(function(component) {
        component.textureSourceIsAddedToTextureAtlas();
    });
};

TextureSource.prototype.isRemovedFromTextureAtlas = function() {
    this.inTextureAtlas = false;
    this.components.forEach(function(component) {
        component.textureSourceIsRemovedFromTextureAtlas();
    });
};

Object.defineProperty(TextureSource.prototype, 'precision', {
    get: function() {
        return this._precision;
    },
    set: function(v) {
        this._precision = v;
        this.iprecision = 1 / v;
    }
});

TextureSource.id = 0;


/**
 * The texture atlas which contains a single spritemap with all active textures.
 * @constructor
 */
function TextureAtlas(stage, gl) {

    this.stage = stage;

    this.w = 2048;
    this.h = 2048;

    // The structure of the active partition.
    this.activeTree = new TextureAtlasTree(this.w, this.h);

    /**
     * The texture sources that should be on to the texture atlas (active in stage, loaded and with valid dimensions).
     * @type {Set<TextureSource>}
     */
    this.activeTextureSources = new Set();

    /**
     * The texture sources that were added to the texture atlas (since the last defragment).
     * @type {Set<TextureSource>}
     */
    this.addedTextureSources = new Set();

    /**
     * The total surface of the current texture atlas that's being used by unused texture sources.
     * @type {number}
     */
    this.wastedPixels = 0;
    
    /**
     * The frame number that an import last took place.
     * This is used in order to prevent
     * @type {number}
     */
    this.lastImportFrame = 0;

    /**
     * @type {WebGLRenderingContext}
     */
    this.gl = gl;

    this.vertexShaderSrc = [
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

    this.fragmentShaderSrc = [
        "#ifdef GL_ES",
        "precision lowp float;",
        "#endif",
        "varying vec2 vTextureCoord;",
        "uniform sampler2D uSampler;",
        "void main(void){",
        "    gl_FragColor = texture2D(uSampler, vTextureCoord);",
        "}"
    ].join("\n");

    this.program = null;

    /**
     * The last render frame number that the texture atlas was defragmented on.
     * @type {number}
     */
    this.lastDefragFrame = 0;

    /**
     * Texture atlas size limit.
     * @type {number}
     */
    this.pixelsLimit = this.w * this.h / 32;

    /**
     * The minimal amount of pixels that should be able to be reclaimed when performing a defragment.
     * @type {number}
     */
    this.minWastedPixels = this.w * this.h / 8;

    this.defragNeeded = false;

    /**
     * Pending texture sources to be uploaded.
     * @type {TextureSource[]}
     */
    this.uploads = [];

    // The matrix that causes the [0,0 - w,h] box to map to [-1,-1 - 1,1] in the end results.
    this.projectionMatrix = new Float32Array([
        2/this.w, 0, 0, 0,
        0, 2/this.h, 0, 0,
        0, 0, 1, 0,
        -1, -1, 0, 1
    ]);

    this.initShaderProgram();

    var gl = this.gl;

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

    // Set transformation matrix.
    var projectionMatrixAttribute = gl.getUniformLocation(this.program, "projectionMatrix");
    gl.uniformMatrix4fv(projectionMatrixAttribute, false, this.projectionMatrix);

}

TextureAtlas.prototype.destroy = function() {
    this.gl.deleteTexture(this.texture);
    this.gl.deleteFramebuffer(this.framebuffer);
    this.gl.deleteBuffer(this.paramsGlBuffer);
    this.gl.deleteBuffer(this.indicesGlBuffer);
    this.gl.deleteProgram(this.program);
};

/**
 * @access private
 */
TextureAtlas.prototype.initShaderProgram = function() {
    var gl = this.gl;

    var glVertShader = this.glCompile(gl.VERTEX_SHADER, this.vertexShaderSrc);
    var glFragShader = this.glCompile(gl.FRAGMENT_SHADER, this.fragmentShaderSrc);

    this.program = gl.createProgram();

    gl.attachShader(this.program, glVertShader);
    gl.attachShader(this.program, glFragShader);
    gl.linkProgram(this.program);

    // if linking fails, then log and cleanup
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        console.error('Error: Could not initialize shader.');
        console.error('gl.VALIDATE_STATUS', gl.getProgramParameter(this.program, gl.VALIDATE_STATUS));
        console.error('gl.getError()', gl.getError());

        // if there is a program info log, log it
        if (gl.getProgramInfoLog(this.program) !== '') {
            console.warn('Warning: gl.getProgramInfoLog()', gl.getProgramInfoLog(this.program));
        }

        gl.deleteProgram(this.program);
        this.program = null;
    }
    gl.useProgram(this.program);

    // clean up some shaders
    gl.deleteShader(glVertShader);
    gl.deleteShader(glFragShader);

    // Bind attributes.
    this.vertexPositionAttribute = gl.getAttribLocation(this.program, "aVertexPosition");
    this.textureCoordAttribute = gl.getAttribLocation(this.program, "aTextureCoord");

    // Init webgl arrays.
    // We support up to 1000 textures per call, all consisting out of 9 elements.
    this.paramsBuffer = new ArrayBuffer(16 * 4 * 9 * 1000);
    this.allCoords = new Float32Array(this.paramsBuffer);
    this.allTexCoords = new Float32Array(this.paramsBuffer);

    this.allIndices = new Uint16Array(6 * 9 * 1000);

    // fill the indices with the quads to draw.
    for (var i = 0, j = 0; i < 1000 * 6 * 9; i += 6, j += 4) {
        this.allIndices[i] = j;
        this.allIndices[i + 1] = j + 1;
        this.allIndices[i + 2] = j + 2;
        this.allIndices[i + 3] = j;
        this.allIndices[i + 4] = j + 2;
        this.allIndices[i + 5] = j + 3;
    }

    this.indicesGlBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesGlBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.allIndices, gl.STATIC_DRAW);

    // Set transformation matrix.
    var projectionMatrixAttribute = gl.getUniformLocation(this.program, "projectionMatrix");
    gl.uniformMatrix4fv(projectionMatrixAttribute, false, this.projectionMatrix);

};

/**
 * @access private
 */
TextureAtlas.prototype.glCompile = function (type, src) {
    var shader = this.gl.createShader(type);

    this.gl.shaderSource(shader, src);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        console.log(this.gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
};

/**
 * @access private
 */
TextureAtlas.prototype.uploadTextureSources = function(textureSources) {
    var i;

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

        // Add 2px margin to avoid edge artifacts.

        // Full area.
        this.allCoords[offset + 0] = x;
        this.allCoords[offset + 1] = y;
        this.allCoords[offset + 4] = x + w;
        this.allCoords[offset + 5] = y;
        this.allCoords[offset + 8] = x + w;
        this.allCoords[offset + 9] = y + h;
        this.allCoords[offset + 12] = x;
        this.allCoords[offset + 13] = y + h;

        // Top row.
        this.allCoords[offset + 16] = x;
        this.allCoords[offset + 17] = y - 1;
        this.allCoords[offset + 20] = x + w;
        this.allCoords[offset + 21] = y - 1;
        this.allCoords[offset + 24] = x + w;
        this.allCoords[offset + 25] = y;
        this.allCoords[offset + 28] = x;
        this.allCoords[offset + 29] = y;

        // Bottom row.
        this.allCoords[offset + 32] = x;
        this.allCoords[offset + 33] = y + h;
        this.allCoords[offset + 36] = x + w;
        this.allCoords[offset + 37] = y + h;
        this.allCoords[offset + 40] = x + w;
        this.allCoords[offset + 41] = y + h + 1;
        this.allCoords[offset + 44] = x;
        this.allCoords[offset + 45] = y + h + 1;

        // Left row.
        this.allCoords[offset + 48] = x - 1;
        this.allCoords[offset + 49] = y;
        this.allCoords[offset + 52] = x;
        this.allCoords[offset + 53] = y;
        this.allCoords[offset + 56] = x;
        this.allCoords[offset + 57] = y + h;
        this.allCoords[offset + 60] = x - 1;
        this.allCoords[offset + 61] = y + h;

        // Right row.
        this.allCoords[offset + 64] = x + w;
        this.allCoords[offset + 65] = y;
        this.allCoords[offset + 68] = x + w + 1;
        this.allCoords[offset + 69] = y;
        this.allCoords[offset + 72] = x + w + 1;
        this.allCoords[offset + 73] = y + h;
        this.allCoords[offset + 76] = x + w;
        this.allCoords[offset + 77] = y + h;

        // Upper-left.
        this.allCoords[offset + 80] = x - 1;
        this.allCoords[offset + 81] = y - 1;
        this.allCoords[offset + 84] = x;
        this.allCoords[offset + 85] = y - 1;
        this.allCoords[offset + 88] = x;
        this.allCoords[offset + 89] = y;
        this.allCoords[offset + 92] = x - 1;
        this.allCoords[offset + 93] = y;

        // Upper-right.
        this.allCoords[offset + 96] = x + w;
        this.allCoords[offset + 97] = y - 1;
        this.allCoords[offset + 100] = x + w + 1;
        this.allCoords[offset + 101] = y - 1;
        this.allCoords[offset + 104] = x + w + 1;
        this.allCoords[offset + 105] = y;
        this.allCoords[offset + 108] = x + w;
        this.allCoords[offset + 109] = y;

        // Lower-right.
        this.allCoords[offset + 112] = x + w;
        this.allCoords[offset + 113] = y + h;
        this.allCoords[offset + 116] = x + w + 1;
        this.allCoords[offset + 117] = y + h;
        this.allCoords[offset + 120] = x + w + 1;
        this.allCoords[offset + 121] = y + h + 1;
        this.allCoords[offset + 124] = x + w;
        this.allCoords[offset + 125] = y + h + 1;

        // Lower-left.
        this.allCoords[offset + 128] = x - 1;
        this.allCoords[offset + 129] = y + h;
        this.allCoords[offset + 132] = x;
        this.allCoords[offset + 133] = y + h;
        this.allCoords[offset + 136] = x;
        this.allCoords[offset + 137] = y + h + 1;
        this.allCoords[offset + 140] = x - 1;
        this.allCoords[offset + 141] = y + h + 1;

        // Texture coords.
        this.allTexCoords[offset + 2] = 0;
        this.allTexCoords[offset + 3] = 0;
        this.allTexCoords[offset + 6] = 1;
        this.allTexCoords[offset + 7] = 0;
        this.allTexCoords[offset + 10] = 1;
        this.allTexCoords[offset + 11] = 1;
        this.allTexCoords[offset + 14] = 0;
        this.allTexCoords[offset + 15] = 1;

        this.allTexCoords[offset + 18] = 0;
        this.allTexCoords[offset + 19] = 0;
        this.allTexCoords[offset + 22] = 1;
        this.allTexCoords[offset + 23] = 0;
        this.allTexCoords[offset + 26] = 1;
        this.allTexCoords[offset + 27] = divH;
        this.allTexCoords[offset + 30] = 0;
        this.allTexCoords[offset + 31] = divH;

        this.allTexCoords[offset + 34] = 0;
        this.allTexCoords[offset + 35] = 1 - divH;
        this.allTexCoords[offset + 38] = 1;
        this.allTexCoords[offset + 39] = 1 - divH;
        this.allTexCoords[offset + 42] = 1;
        this.allTexCoords[offset + 43] = 1;
        this.allTexCoords[offset + 46] = 0;
        this.allTexCoords[offset + 47] = 1;

        this.allTexCoords[offset + 50] = 0;
        this.allTexCoords[offset + 51] = 0;
        this.allTexCoords[offset + 54] = divW;
        this.allTexCoords[offset + 55] = 0;
        this.allTexCoords[offset + 58] = divW;
        this.allTexCoords[offset + 59] = 1;
        this.allTexCoords[offset + 62] = 0;
        this.allTexCoords[offset + 63] = 1;

        this.allTexCoords[offset + 66] = 1 - divW;
        this.allTexCoords[offset + 67] = 0;
        this.allTexCoords[offset + 70] = 1;
        this.allTexCoords[offset + 71] = 0;
        this.allTexCoords[offset + 74] = 1;
        this.allTexCoords[offset + 75] = 1;
        this.allTexCoords[offset + 78] = 1 - divW;
        this.allTexCoords[offset + 79] = 1;

        this.allTexCoords[offset + 82] = 0;
        this.allTexCoords[offset + 83] = 0;
        this.allTexCoords[offset + 86] = divW;
        this.allTexCoords[offset + 87] = 0;
        this.allTexCoords[offset + 90] = divW;
        this.allTexCoords[offset + 91] = divH;
        this.allTexCoords[offset + 94] = 0;
        this.allTexCoords[offset + 95] = divH;

        this.allTexCoords[offset + 98] = 1 - divW;
        this.allTexCoords[offset + 99] = 0;
        this.allTexCoords[offset + 102] = 1;
        this.allTexCoords[offset + 103] = 0;
        this.allTexCoords[offset + 106] = 1;
        this.allTexCoords[offset + 107] = divH;
        this.allTexCoords[offset + 110] = 1 - divW;
        this.allTexCoords[offset + 111] = divH;

        this.allTexCoords[offset + 114] = 1 - divW;
        this.allTexCoords[offset + 115] = 1 - divH;
        this.allTexCoords[offset + 118] = 1;
        this.allTexCoords[offset + 119] = 1 - divH;
        this.allTexCoords[offset + 122] = 1;
        this.allTexCoords[offset + 123] = 1;
        this.allTexCoords[offset + 126] = 1 - divW;
        this.allTexCoords[offset + 127] = 1;

        this.allTexCoords[offset + 130] = 0;
        this.allTexCoords[offset + 131] = 1 - divH;
        this.allTexCoords[offset + 134] = divW;
        this.allTexCoords[offset + 135] = 1 - divH;
        this.allTexCoords[offset + 138] = divW;
        this.allTexCoords[offset + 139] = 1;
        this.allTexCoords[offset + 142] = 0;
        this.allTexCoords[offset + 143] = 1;
    }

    var gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.useProgram(this.program);
    gl.viewport(0,0,this.w,this.h);
    gl.blendFunc(gl.ONE, gl.ZERO);
    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);

    // Upload data.
    this.paramsGlBuffer = this.paramsGlBuffer || gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.paramsGlBuffer);

    // We want to send the first elements from the params buffer, so we allCoords in order to slice some off.
    var view = new DataView(this.paramsBuffer, 0, 16 * 9 * 4 * n);
    gl.bufferData(gl.ARRAY_BUFFER, view, gl.DYNAMIC_DRAW);

    gl.vertexAttribPointer(this.vertexPositionAttribute, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(this.textureCoordAttribute, 2, gl.FLOAT, false, 16, 2 * 4);

    gl.enableVertexAttribArray(this.vertexPositionAttribute);
    gl.enableVertexAttribArray(this.textureCoordAttribute);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesGlBuffer);

    for (i = 0; i < n; i++) {
        gl.bindTexture(gl.TEXTURE_2D, textureSources[i].glTexture);
        gl.drawElements(gl.TRIANGLES, 6 * 9, gl.UNSIGNED_SHORT, i * 6 * 9 * 2);
    }

    gl.disableVertexAttribArray(this.vertexPositionAttribute);
    gl.disableVertexAttribArray(this.textureCoordAttribute);
};

/**
 * Allocates space for a loaded texture.
 * @param texture
 * @return {{x: number, y: number}|null}
 *   The allocated position.
 */
TextureAtlas.prototype.allocate = function(texture) {
    return this.activeTree.add(texture);
};

/**
 * Registers the texture source to the texture atlas.
 * @param {TextureSource} textureSource
 * @pre TextureSource.glTexture !== null
 */
TextureAtlas.prototype.addActiveTextureSource = function(textureSource) {
    if (textureSource.id === 1) {
        // Rectangle texture is automatically added.
    } else {
        if ((textureSource.w * textureSource.h < this.pixelsLimit)) {
            // Only add if dimensions are valid.
            if (!this.activeTextureSources.has(textureSource)) {
                this.activeTextureSources.add(textureSource);

                // Add it directly (if possible).
                if (!this.addedTextureSources.has(textureSource)) {
                    this.add(textureSource);
                }
            }
        }
    }
};

TextureAtlas.prototype.removeActiveTextureSource = function(textureSource) {
    if (this.activeTextureSources.has(textureSource)) {
        this.activeTextureSources.delete(textureSource);

        var uploadsIndex = this.uploads.indexOf(textureSource);
        if (uploadsIndex >= 0) {
            // Still waiting to be uploaded.
            this.uploads.splice(uploadsIndex, 1);

            // It is not uploaded, so it's not on the texture atlas any more.
            textureSource.isRemovedFromTextureAtlas();

            this.addedTextureSources.delete(textureSource);
        }

        if (this.addedTextureSources.has(textureSource)) {
            this.wastedPixels += textureSource.w * textureSource.h;
        }
    }
};

/**
 * Adds the texture source to the texture atlas.
 * @access private
 */
TextureAtlas.prototype.add = function(textureSource) {
    var position = this.allocate(textureSource);
    if (position) {
        this.addedTextureSources.add(textureSource);

        textureSource.isAddedToTextureAtlas(position.x + 1, position.y + 1);

        this.uploads.push(textureSource);
    } else {
        this.defragNeeded = true;

        // Error.
        return false;
    }

    return true;
};


/**
 * Defragments the atlas memory.
 */
TextureAtlas.prototype.defragment = function() {
    console.log('defragment texture atlas');

    // Clear new area (necessary for semi-transparent textures).
    var gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.viewport(0,0,this.w,this.h);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    this.activeTree.reset();
    this.uploads = [];
    this.wastedPixels = 0;
    this.lastDefragFrame = this.stage.frameCounter;
    this.defragNeeded = false;

    this.addedTextureSources.forEach(function(textureSource) {
        textureSource.isRemovedFromTextureAtlas();
    });

    this.addedTextureSources.clear();

    // Automatically re-add the rectangle texture, to make sure that it is at coordinate 0,0.
    this.add(this.stage.rectangleTexture.source);

    // Then (try to) re-add all active texture sources.
    // @todo: sort by dimensions (smallest first)?
    var self = this;
    this.activeTextureSources.forEach(function(textureSource) {
        self.add(textureSource);
    });

};

/**
 * Actually uploads the previously added sources to the texture atlas.
 */
TextureAtlas.prototype.flush = function() {
    if (this.defragNeeded) {
        // Only defragment when there is something serious to gain.
        if (this.wastedPixels >= this.minWastedPixels) {
            // Limit defragmentations from happening all the time when it can't keep up.
            if (this.lastDefragFrame < this.stage.frameCounter - 300) {
                this.defragment();
            }
        }
    }

    if (this.uploads.length) {
        this.lastImportFrame = this.stage.frameCounter;
        this.uploadTextureSources(this.uploads);
        this.uploads = [];
    }
};



/**
 * The texture atlas.
 * @constructor
 */
function TextureAtlasTree(w, h) {
    this.w = w;
    this.h = h;
    this.root = {x: 0, y: 0, w: w, h: h};
    this.spaces = new Set([this.root]);

    this.maxH = h;
}

TextureAtlasTree.prototype.reset = function() {
    this.root = {x: 0, y: 0, w: this.w, h: this.h};
    this.spaces = new Set([this.root]);
    this.maxH = this.h;
};

TextureAtlasTree.prototype.add = function(texture) {
    // We need an extra border to fix linear interpolation artifacts (see TextureAtlasRenderer).
    var w = texture.w + 2;
    var h = texture.h + 2;

    if (h > this.maxH) {
        return false;
    }

    var mp = 0;
    var found = null;
    var maxH = 0;
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
};

TextureAtlasTree.prototype.findNode = function(node, w, h) {
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
};

TextureAtlasTree.prototype.useNode = function(node, texture) {
    var w = texture.w + 2, h = texture.h + 2;
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
};

/**
 * @returns {Texture[]}
 */
TextureAtlasTree.prototype.getTextures = function() {
    var n = [this.root];

    var textures = [];
    var c = 1;
    while(c) {
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
};


/**
 * An empty component that may contain other components (comparable to a div html element).
 * @constructor
 * @abstract
 */
var Component = function(stage) {
    EventEmitter.call(this);

    /**
     * The global id. May be used by c++ addons.
     * @type {number}
     */
    this.id = Stage.componentId++;

    /**
     * The update component lightweight object.
     * @type {UComponent}
     */
    this.uComponent = stage.adapter.getUComponentContext().createUComponentForComponent(this);

    /**
     * The stage that this component belongs to.
     * @type {Stage}
     */
    this.stage = stage;

    /**
     * A component is active if it is a descendant of the stage root, and if it is visible.
     * @type {boolean}
     */
    this.active = false;

    /**
     * A component is active if it is a descendant of the stage root.
     * @type {boolean}
     */
    this.attached = false;

    /**
     * @type {Component}
     */
    this.parent = null;

    /**
     * Flag to quickly check if this component has children.
     * @type {boolean}
     */
    this.hasChildren = false;

    this._clipping = false;

    this._displayedTexture = null;

    // Cache width & height, only maintained when component is active.
    this._renderWidth = 0;
    this._renderHeight = 0;

    /**
     * Flag that indicates if this component has borders at all.
     * @type {boolean}
     */
    this.hasBorders = false;

    /**
     * 'Normal' children.
     * @type {Component[]}
     */
    this._children = [];

    /**
     * Color tint of this sprite.
     * @type {number}
     */
    this._colorTopLeft = 0xffffffff;
    this._colorTopRight = 0xffffffff;
    this._colorBottomLeft = 0xffffffff;
    this._colorBottomRight = 0xffffffff;

    /**
     * The transitions (indexed by property index, null if not used).
     * @type {Transition[]}
     */
    this.transitions = null;

    /**
     * All transitions, for quick looping.
     * @type {Set<Transition>}
     */
    this.transitionSet = null;

    /**
     * All animations that have this component has subject.
     * @type {Set<Animation>}
     */
    this.animationSet = null;

    /**
     * Manages the tags for this component.
     * @type {ComponentTags}
     */
    this._tags = new ComponentTags(this);
    
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
    this._borderWidthTop = 0;
    this._borderWidthBottom = 0;
    this._borderWidthLeft = 0;
    this._borderWidthRight = 0;
    this._borderColorTop = 0xffffffff;
    this._borderColorBottom = 0xffffffff;
    this._borderColorLeft = 0xffffffff;
    this._borderColorRight = 0xffffffff;
    this._visible = true;

    /**
     * Manages text rendering for this component. Lazy loaded.
     * @type {ComponentText}
     */
    this.textRenderer = null;

    /**
     * The texture that is currently set.
     * This is changed when changing the src and should never be changed manually.
     * @type {Texture}
     */
    this._texture = null;

    /**
     * The currently displayed texture. While this.texture is loading, this one may be different.
     * @type {Texture}
     */
    this.displayedTexture = this._displayedTexture = null;

    /**
     * Image source, if set.
     * @type {String}
     * @private
     */
    this._src = null;

    /**
     * If true, this component is being 'clipped' around the edges. For non-sprite components, the width and height
     * must be explicitly set.
     * @type {boolean}
     */
    this.clipping = false;

    /**
     * The z-index, which determines the rendering order (in the same way as in HTML). 0 = no z-index.
     * @type {number}
     */
    this._zIndex = 0;

    /**
     * If true, this component always behaves as a z-index context. Z-indexed descendants will never be rendered
     * outside of this context.
     * @type {boolean}
     */
    this._forceZIndexContext = false;

    /**
     * This function is called when this component becomes active.
     * @type {Function}
     */
    this.notifyActivate = null;

    /**
     * This function is called when this component becomes inactive.
     * @type {Function}
     */
    this.notifyDeactivate = null;

    /**
     * The cached rotation value (because cos and sin are slow).
     * @type {number}
     */
    this.rotationCache = 0;
    this._sr = 0;
    this._cr = 1;

};

Utils.extendClass(Component, EventEmitter);

Component.prototype.setAsRoot = function() {
    this.updateActiveFlag();
    this.updateAttachedFlag();
    this.uComponent.setAsRoot();
};

Component.prototype.setParent = function(parent) {
    if (this.parent === parent) return;

    if (this.parent) {
        this.parent.hasChildren = (this.parent._children.length > 1);

        this._tags.unsetParent();
    }

    this.parent = parent;

    if (parent) {
        // Alpha, transform, translate.
        this.uComponent.recalc = true;

        parent.hasChildren = true;

        this._tags.setParent(parent._tags);
    }

    this.updateActiveFlag();

    this.updateAttachedFlag();
};

Component.prototype.add = function(o) {
    if (o instanceof Component) {
        this.addChild(o);
        return o;
    } else if (Utils.isArray(o)) {
        for (var i = 0, n = o.length; i < n; i++) {
            this.add(o[i]);
        }
        return null;
    } else if (Utils.isPlainObject(o)) {
        var c = this.stage.c(o);
        this.addChild(c);
        return c;
    }
};

Component.prototype.addChild = function (child) {
    if (child.parent === this && this._children.indexOf(child) >= 0) {
        return child;
    }
    this.addChildAt(child, this._children.length);
};

Component.prototype.addChildren = function (children) {
    var i, n = children.length;
    for (i = 0; i < n; i++) {
        this.addChild(children[i]);
    }
};

Component.prototype.setChildren = function (children) {
    this.removeChildren();
    this.addChildren(children);
};

Component.prototype.addChildAt = function (child, index) {
    // prevent adding self as child
    if (child === this) {
        return
    }

    if (index >= 0 && index <= this._children.length) {
        if (child.parent === this && this._children.indexOf(child) === index) {
            // Ignore.
        } else {
            if (child.parent) {
                var p = child.parent;
                p.removeChild(child);
            }

            child.setParent(this);
            this._children.splice(index, 0, child);

            // Sync.
            this.uComponent.insertChild(index, child.uComponent);
        }

        return;
    } else {
        throw new Error(child + 'addChildAt: The index '+ index +' supplied is out of bounds ' + this.children.length);
    }
};

Component.prototype.getChildIndex = function (child) {
    return this._children.indexOf(child);
};

Component.prototype.removeChild = function (child) {
    var index = this._children.indexOf(child);

    if (index !== -1) {
        this.removeChildAt(index);
    }
};

Component.prototype.removeChildAt = function (index) {
    var child = this._children[index];

    child.setParent(null);
    this._children.splice(index, 1);

    // Sync.
    this.uComponent.removeChild(index);

    return child;
};

Component.prototype.removeChildren = function() {
    var n = this._children.length;
    if (n) {
        for (var i = 0; i < n; i++) {
            var child = this._children[i];
            child.setParent(null);
        }
        this._children.splice(0, n);

        // Sync.
        this.uComponent.clearChildren();
    }
};

Component.prototype.getDepth = function() {
    var depth = 0;

    var p = this;
    do {
        depth++;
        p = p.parent;
    } while(p);

    return depth;
};

Component.prototype.getAncestor = function(l) {
    var p = this;
    while(l > 0 && p.parent) {
        p = p.parent;
        l--;
    }
    return p;
};

Component.prototype.getAncestorAtDepth = function(depth) {
    var levels = this.getDepth() - depth;
    if (levels < 0) {
        return null;
    }
    return this.getAncestor(levels);
};

Component.prototype.isAncestorOf = function(c) {
    var p = c;
    while(p.parent) {
        if (this === p) {
            return true;
        }
        p = p.parent;
    }
    return false;
};

Component.prototype.getSharedAncestor = function(c) {
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

        o1 = o1.parent;
        o2 = o2.parent;
    } while(o1 && o2);

    return null;
};

Component.prototype.isActive = function() {
    return this._visible && (this._alpha > 0) && (this.parent ? this.parent.active : (this.stage.root === this));
};

Component.prototype.isAttached = function() {
    return (this.parent ? this.parent.attached : (this.stage.root === this));
};

/**
 * Updates the 'active' flag for this branch.
 * @private
 */
Component.prototype.updateActiveFlag = function() {
    // Calculate active flag.
    var newActive = this.isActive();
    if (this.active !== newActive) {
        if (newActive) {
            if (this.zIndex != 0) {
                // Component uses z-index.
                this.stage.zIndexUsage++;
            }

            // Detect texture changes.
            var dt = null;
            if (this.texture && this.texture.source.glTexture) {
                dt = this.texture;
                this.texture.source.addComponent(this);
                this.texture.addComponent(this);
            } else if (this.displayedTexture && this.displayedTexture.source.glTexture) {
                dt = this.displayedTexture;
            }

            // Force re-check of texture because dimensions might have changed (cutting).
            this.displayedTexture = null;
            this.displayedTexture = dt;

            this.active = newActive;

            if (this.texture) {
                // It is important to add the source listener before the texture listener because that may trigger a load.
                this.texture.source.addComponent(this);
                this.texture.addComponent(this);
            }

            if (this.displayedTexture && this.displayedTexture !== this.texture) {
                this.displayedTexture.source.addComponent(this);
                this.displayedTexture.addComponent(this);
            }
        } else {
            if (this.zIndex != 0) {
                // Component uses z-index.
                this.stage.zIndexUsage--;
            }

            if (this.texture) {
                this.texture.removeComponent(this);
                this.texture.source.removeComponent(this);
            }

            if (this.displayedTexture) {
                this.displayedTexture.removeComponent(this);
                this.displayedTexture.source.removeComponent(this);
            }

            this.active = newActive;
        }

        var m = this._children.length;
        if (m > 0) {
            for (var i = 0; i < m; i++) {
                this._children[i].updateActiveFlag();
            }
        }

        // Run this after all _children because we'd like to see (de)activating a branch as an 'atomic' operation.
        if (newActive) {
            this.notifyActivate && this.notifyActivate();
        } else {
            this.notifyDeactivate && this.notifyDeactivate();
        }
    }
};

/**
 * Updates the 'attached' flag for this branch.
 * @private
 */
Component.prototype.updateAttachedFlag = function() {
    // Calculate active flag.
    var newAttached = this.isAttached();
    if (this.attached !== newAttached) {
        this.attached = newAttached;

        if (newAttached) {
            var self = this;

            // Check if there are remaining active transitions that should be re-activated.
            if (this.transitionSet) {
                this.transitionSet.forEach(function(transition) {
                    if (transition.isActive()) {
                        self.stage.addActiveTransition(transition);
                    }
                });
            }

            if (this.animationSet) {
                this.animationSet.forEach(function(animation) {
                    if (animation.isActive()) {
                        self.stage.addActiveAnimation(animation);
                    }
                });
            }
        }

        var m = this._children.length;
        if (m > 0) {
            for (var i = 0; i < m; i++) {
                this._children[i].updateAttachedFlag();
            }
        }
    }
};

Component.prototype.addAnimation = function(a) {
    if (!this.animationSet) {
        this.animationSet = new Set();
    }
    this.animationSet.add(a);
};

Component.prototype.removeAnimation = function(a) {
    this.animationSet.delete(a);
};

Component.prototype.animation = function(settings) {
    var a = this.stage.animation(settings);
    a.subject = this;
    return a;
};

Component.prototype.a = function(settings) {
    return this.animation(settings);
};

Component.prototype.transition = function(property, settings) {
    var props = Component.propAliases.get(property);
    if (settings || settings === null) {
        if (props) {
            for (var i = 0, n = props.length; i < n; i++) {
                this.setPropertyTransition(props[i], settings);
            }
            return settings ? this.getPropertyTransition(props[0]) : null;
        } else {
            return this.setPropertyTransition(property, settings);
        }
    } else {
        return this.getPropertyTransition(property, settings);
    }
};

Component.prototype.t = function(property, settings) {
    this.transition(property, settings);
};

Component.prototype.fastForward = function(property) {
    var props = Component.propAliases.get(property);
    if (!props) props = [property];
    for (var i = 0, n = props.length; i < n; i++) {
        var name = props[i];
        var setting = Component.SETTINGS[name];
        if (setting && setting.m) {
            var t = this.getPropertyTransition(name);
            if (t) {
                t.updateTargetValue(setting.g(this), setting.g(this));
            }
        } else {
            console.warn("Unknown transition property: " + name);
        }
    }
};

Component.prototype.getRenderWidth = function() {
    if (this.active) {
        return this._renderWidth;
    } else {
        return this._getRenderWidth();
    }
};

Component.prototype._getRenderWidth = function() {
    if (this._w) {
        return this._w;
    } else if (this.texture && this.texture.source.glTexture) {
        // Texture already loaded, but not yet updated (probably because it's not active).
        return (this.texture.w || (this.texture.source.w * this.texture.source.iprecision));
    } else if (this.displayedTexture) {
        return (this.displayedTexture.w || (this.displayedTexture.source.w * this.displayedTexture.source.iprecision));
    } else {
        return 0;
    }
};

Component.prototype.getRenderHeight = function() {
    if (this.active) {
        return this._renderHeight;
    } else {
        return this._getRenderHeight();
    }
};

Component.prototype._getRenderHeight = function() {
    if (this._h) {
        return this._h;
    } else if (this.texture && this.texture.source.glTexture) {
        // Texture already loaded, but not yet updated (probably because it's not active).
        return (this.texture.h || this.texture.source.h) * this.texture.source.iprecision;
    } else if (this.displayedTexture) {
        return (this.displayedTexture.h || this.displayedTexture.source.h) * this.displayedTexture.source.iprecision;
    } else {
        return 0;
    }
};

Component.prototype.setPropertyTransition = function(property, settings) {
    var propertyIndex = Component.getPropertyIndex(property);
    if (propertyIndex == -1) {
        throw new Error("Unknown transition property: " + property);
    }

    if (!settings) {
        if (this.transitions) {
            if (this.transitions[propertyIndex]) {
                var setting = Component.SETTINGS[property];
                setting.sf(this, setting.g(this));
                this.stage.activeTransitions.delete(this.transitions[propertyIndex]);
                this.transitionSet.delete(this.transitions[propertyIndex]);
                this.transitions[propertyIndex] = null;
            }
        }
    } else {
        // Only reset on change.
        if (!this.transitions) {
            this.transitions = new Array(Component.nTransitions);
            this.transitionSet = new Set();
        }
        if (!this.transitions[propertyIndex]) {
            this.transitions[propertyIndex] = new Transition(this, property);
            this.transitionSet.add(this.transitions[propertyIndex]);
        }
        this.transitions[propertyIndex].set(settings);
    }

    return this.transitions[propertyIndex];
};

Component.prototype.getPropertyTransition = function(property) {
    var propertyIndex = Component.getPropertyIndex(property);
    if (propertyIndex == -1) {
        throw new Error("Unknown transition property: " + property);
    }

    if (this.transitions && this.transitions[propertyIndex]) {
        return this.transitions[propertyIndex];
    } else {
        return null;
    }
};

Component.prototype.getCornerPoints = function() {
    return this.uComponent.getCornerPoints();
};

Component.prototype.getLocationString = function() {
    var i;
    if (this.parent) {
        i = this.parent._children.indexOf(this);
        if (i >= 0) {
            var localTags = this.getLocalTags();
            return this.parent.getLocationString() + ":" + i + "[" + this.id + "]" + (localTags.length ? "(" + localTags.join(",") + ")" : "");
        }
    }
    return "";
};

Component.prototype.getTags = function() {
    return this._tags.getLocalTags();
};

Component.prototype.setTags = function(tags) {
    this._tags.setTags(tags);
};

Component.prototype.addTag = function(tag) {
    this._tags.addTag(tag);
};

Component.prototype.removeTag = function(tag) {
    this._tags.removeTag(tag);
};

Component.prototype.hasTag = function(tag) {
    return this._tags.hasTag(tag);
};

Component.prototype.tag = function(tag) {
    return this._tags.tag(tag);
};

Component.prototype.mtag = function(tag) {
    return this._tags.mtag(tag);
};

Component.prototype.stag = function(tag, settings) {
    var t = this.mtag(tag);
    var n = t.length;
    for (var i = 0; i < n; i++) {
        t[i].set(settings);
    }
};

Component.prototype.textureSourceIsLoaded = function() {
    // Now we can start showing this texture.
    this.displayedTexture = this.texture;

    if (this._eventsCount) {
        this.emit('txLoaded', this.texture.source);
    }
};

Component.prototype.textureSourceHasLoadError = function(e) {
    if (this._eventsCount) {
        this.emit('txError', e, this.texture.source);
    }
};

Component.prototype.textureSourceIsAddedToTextureAtlas = function() {
    this._updateTextureCoords();
};

Component.prototype.textureSourceIsRemovedFromTextureAtlas = function() {
    this._updateTextureCoords();
};

Component.prototype.displayedTextureClippingChanged = function() {
    this._renderWidth = this._getRenderWidth();
    this._renderHeight = this._getRenderHeight();

    this._updateLocalDimensions();
    this._updateTextureCoords();
};

Component.prototype.set = function(obj) {
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
        var value = obj[keys[i]];
        this.setSetting(keys[i], value);
    }
};

Component.prototype.setSetting = function(name, value) {
    var aliases = Component.propAliases.get(name);
    if (aliases) {
        for (var i = 0, n = aliases.length; i < n; i++) {
            this.setSetting(aliases[i], value);
        }
        return;
    }

    switch(name) {
        case 'transitions':
            if (!Utils.isObject(value)) {
                throw new TypeError('Transitions must be object.');
            }

            for (var key in value) {
                this.transition(key, value[key]);
            }

            break;
        default:
            var setting = Component.SETTINGS[name];
            if (setting) {
                setting.s(this, value);
            } else {
                setting = Component.FINAL_SETTINGS[name];
                if (setting) {
                    setting.sf(this, value);
                } else {
                    throw new Error("Unknown component property: " + name);
                }
            }
    }
};

Component.prototype.toString = function() {
    var obj = this.getSettingsObject();
    return Component.getPrettyJsonified(obj, "");
};

Component.getPrettyJsonified = function(obj, indent) {
    var children = obj.children;
    delete obj.children;

    // Convert singular json settings object.
    var colorKeys = ["color", "colorTopLeft", "colorTopRight", "colorBottomLeft", "colorBottomRight", "borderColor", "borderColorTop", "borderColorBottom", "borderColorLeft", "borderColorRight"]
    var str = JSON.stringify(obj, function(k, v) {
        if (colorKeys.indexOf(k) !== -1) {
            return "COLOR[" + v.toString(16) + "]";
        }
        return v;
    });
    str = str.replace(/"COLOR\[([a-f0-9]{1,8})\]"/g, "0x$1");

    if (children && children.length) {
        var isEmpty = (str === "{}");
        str = str.substr(0, str.length - 1) + (isEmpty ? "" : ",") + "\"children\":[\n";
        var n = children.length;
        for (var i = 0; i < n; i++) {
            str += Component.getPrettyJsonified(children[i], indent + "  ") + (i < n - 1 ? "," : "") + "\n";
        }
        str += indent + "]}";
    }

    return indent + str;
};

Component.prototype.getSettingsObject = function() {
    var obj = this.getNonDefaults();
    if (this.hasChildren) {
        obj.children = this._children.map(function(c) {
            return c.getSettingsObject();
        });
    }
    return obj;
};

Component.prototype.getNonDefaults = function() {
    var nonDefaults = {};

    if (this._tags && this._tags.tags.size) {
        nonDefaults['tags'] = this.getLocalTags();
    }

    if (this.x !== 0) nonDefaults['x'] = this.x;
    if (this.y !== 0) nonDefaults['y'] = this.y;
    if (this.w !== 0) nonDefaults['w'] = this.w;
    if (this.h !== 0) nonDefaults['h'] = this.h;

    if (this.alpha !== 1) nonDefaults['alpha'] = this.alpha;
    if (this.rotation !== 0) nonDefaults['rotation'] = this.rotation;
    if (this.visible !== true) nonDefaults['visible'] = this.visible;
    if (this.clipping !== false) nonDefaults['clipping'] = this.clipping;
    if (this.zIndex) nonDefaults['zIndex'] = this.zIndex;
    if (this.forceZIndexContext !== false) nonDefaults['forceZIndexContext'] = this.forceZIndexContext;

    if (this.textRenderer) {
        nonDefaults['text'] = this.textRenderer.settings.getNonDefaults();
    }

    if (this.src) nonDefaults['src'] = this.src;

    if (this.rect) nonDefaults['rect'] = true;


    if (this.scaleX !== 1 && this.scaleX === this.scaleY) {
        nonDefaults['scale'] = this.scaleX;
    } else {
        if (this.scaleX !== 1) nonDefaults['scaleX'] = this.scaleX;
        if (this.scaleY !== 1) nonDefaults['scaleY'] = this.scaleY;
    }

    if (this.pivotX !== 0.5) nonDefaults['pivotX'] = this.pivotX;
    if (this.pivotY !== 0.5) nonDefaults['pivotY'] = this.pivotY;

    if (this.mountX !== 0) nonDefaults['mountX'] = this.mountX;
    if (this.mountY !== 0) nonDefaults['mountY'] = this.mountY;

    if (this.borderWidthTop !== 0 && this.borderWidthTop === this.borderWidthBottom && this.borderWidthTop === this.borderWidthLeft && this.borderWidthTop === this.borderWidthRight) {
        nonDefaults['borderWidth'] = this.borderWidthTop;
    } else {
        if (this.borderWidthTop !== 0) nonDefaults['borderWidthTop'] = this.borderWidthTop;
        if (this.borderWidthBottom !== 0) nonDefaults['borderWidthBottom'] = this.borderWidthBottom;
        if (this.borderWidthLeft !== 0) nonDefaults['borderWidthLeft'] = this.borderWidthLeft;
        if (this.borderWidthRight !== 0) nonDefaults['borderWidthRight'] = this.borderWidthRight;
    }

    if (this.borderColorTop !== 0xffffffff && this.borderColorTop === this.borderColorBottom && this.borderColorTop === this.borderColorLeft && this.borderColorTop === this.borderColorRight) {
        nonDefaults['borderColor'] = this.borderColorTop;
    } else {
        if (this.borderColorTop !== 0xffffffff) nonDefaults['borderColorTop'] = this.borderColorTop;
        if (this.borderColorBottom !== 0xffffffff) nonDefaults['borderColorBottom'] = this.borderColorBottom;
        if (this.borderColorLeft !== 0xffffffff) nonDefaults['borderColorLeft'] = this.borderColorLeft;
        if (this.borderColorRight !== 0xffffffff) nonDefaults['borderColorRight'] = this.borderColorRight;
    }

    if (this.colorTopLeft !== 0xffffffff && this.colorTopLeft === this.colorTopRight && this.colorTopLeft === this.colorBottomLeft && this.colorTopLeft === this.colorBottomRight) {
        nonDefaults['color'] = this.colorTopLeft;
    } else {
        if (this.colorTopLeft !== 0xffffffff) nonDefaults['colorTopLeft'] = this.colorTopLeft;
        if (this.colorTopRight !== 0xffffffff) nonDefaults['colorTopRight'] = this.colorTopRight;
        if (this.colorBottomLeft !== 0xffffffff) nonDefaults['colorBottomLeft'] = this.colorBottomLeft;
        if (this.colorBottomRight !== 0xffffffff) nonDefaults['colorBottomRight'] = this.colorBottomRight;
    }

    if (this.texture) {
        var tnd = this.texture.getNonDefaults();
        if (Object.keys(tnd).length) {
            nonDefaults['texture'] = tnd;
        }
    }

    return nonDefaults;
};


Component.prototype.hasEqualColors = function() {
    return (this._colorTopLeft === this._colorTopRight) && (this._colorTopLeft === this._colorBottomRight) && (this._colorTopLeft === this._colorBottomLeft);
};

/**
 * Holds the known property aliases.
 * @type {Map<string, string[]>}
 */
Component.propAliases = new Map();
Component.propAliases.set("scale", ["scaleX", "scaleY"]);
Component.propAliases.set("borderWidth", ["borderWidthTop", "borderWidthBottom", "borderWidthLeft", "borderWidthRight"]);
Component.propAliases.set("borderColor", ["borderColorTop", "borderColorBottom", "borderColorLeft", "borderColorRight"]);
Component.propAliases.set("color", ["colorTopLeft", "colorTopRight", "colorBottomLeft", "colorBottomRight"]);
Component.propAliases.set("colorTop", ["colorTopLeft", "colorTopRight"]);
Component.propAliases.set("colorBottom", ["colorBottomLeft", "colorBottomRight"]);
Component.propAliases.set("colorLeft", ["colorTopLeft", "colorBottomLeft"]);
Component.propAliases.set("colorRight", ["colorTopRight", "colorBottomRight"]);

Object.defineProperty(Component.prototype, 'renderWidth', {
    get: function () {
        return this.getRenderWidth();
    }
});

Object.defineProperty(Component.prototype, 'renderHeight', {
    get: function () {
        return this.getRenderHeight();
    }
});

Object.defineProperty(Component.prototype, 'x', {
    get: function () {
        if (this.transitions && this.transitions[0]) {
            return this.transitions[0].targetValue;
        } else {
            return this.X;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[0]) {
            this.setTransitionTargetValue(this.transitions[0], v, this.X);
        } else {
            this.X = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'X', {
    get: function () {
        return this._x;
    },
    set: function(v) {
        var pv = this._x;
        if (pv !== v) {
            this._x = v;
            this._updateLocalTranslateDelta(v - pv, 0);
        }
    }
});

Object.defineProperty(Component.prototype, 'y', {
    get: function () {
        if (this.transitions && this.transitions[1]) {
            return this.transitions[1].targetValue;
        } else {
            return this.Y;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[1]) {
            this.setTransitionTargetValue(this.transitions[1], v, this.Y);
        } else {
            this.Y = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'Y', {
    get: function () {
        return this._y;
    },
    set: function(v) {
        var pv = this._y;
        if (pv !== v) {
            this._y = v;
            this._updateLocalTranslateDelta(0, v - pv);
        }
    }
});

Object.defineProperty(Component.prototype, 'w', {
    get: function () {
        if (this.transitions && this.transitions[2]) {
            return this.transitions[2].targetValue;
        } else {
            return this.W;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[2]) {
            this.setTransitionTargetValue(this.transitions[2], v, this.W);
        } else {
            this.W = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'W', {
    get: function () {
        return this._w;
    },
    set: function(v) {
        var pv = this._w;
        if (pv !== v) {
            this._w = v;
            this._renderWidth = this._getRenderWidth();
            this._updateLocalDimensions();
        }
    }
});

Object.defineProperty(Component.prototype, 'h', {
    get: function () {
        if (this.transitions && this.transitions[3]) {
            return this.transitions[3].targetValue;
        } else {
            return this.H;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[3]) {
            this.setTransitionTargetValue(this.transitions[3], v, this.H);
        } else {
            this.H = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'H', {
    get: function () {
        return this._h;
    },
    set: function(v) {
        var pv = this._h;
        if (pv !== v) {
            this._h = v;
            this._renderHeight = this._getRenderHeight();
            this._updateLocalDimensions();
        }
    }
});

Object.defineProperty(Component.prototype, 'scaleX', {
    get: function () {
        if (this.transitions && this.transitions[4]) {
            return this.transitions[4].targetValue;
        } else {
            return this.SCALEX;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[4]) {
            this.setTransitionTargetValue(this.transitions[4], v, this.SCALEX);
        } else {
            this.SCALEX = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'SCALEX', {
    get: function () {
        return this._scaleX;
    },
    set: function(v) {
        var pv = this._scaleX;
        if (pv !== v) {
            this._scaleX = v;
            this._updateLocalTransform();
        }
    }
});

Object.defineProperty(Component.prototype, 'scaleY', {
    get: function () {
        if (this.transitions && this.transitions[5]) {
            return this.transitions[5].targetValue;
        } else {
            return this.SCALEY;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[5]) {
            this.setTransitionTargetValue(this.transitions[5], v, this.SCALEY);
        } else {
            this.SCALEY = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'SCALEY', {
    get: function () {
        return this._scaleY;
    },
    set: function(v) {
        var pv = this._scaleY;
        if (pv !== v) {
            this._scaleY = v;
            this._updateLocalTransform();
        }
    }
});

Object.defineProperty(Component.prototype, 'pivotX', {
    get: function () {
        if (this.transitions && this.transitions[6]) {
            return this.transitions.get('pivotX').targetValue;
        } else {
            return this.PIVOTX;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[6]) {
            this.setTransitionTargetValue(this.transitions[6], v, this.PIVOTX);
        } else {
            this.PIVOTX = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'PIVOTX', {
    get: function () {
        return this._pivotX;
    },
    set: function(v) {
        var pv = this._pivotX;
        if (pv !== v) {
            this._pivotX = v;
            this._updateLocalTranslate();
        }
    }
});

Object.defineProperty(Component.prototype, 'pivotY', {
    get: function () {
        if (this.transitions && this.transitions[7]) {
            return this.transitions[7].targetValue;
        } else {
            return this.PIVOTY;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[7]) {
            this.setTransitionTargetValue(this.transitions[7], v, this.PIVOTY);
        } else {
            this.PIVOTY = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'PIVOTY', {
    get: function () {
        return this._pivotY;
    },
    set: function(v) {
        var pv = this._pivotY;
        if (pv !== v) {
            this._pivotY = v;
            this._updateLocalTranslate();
        }
    }
});

Object.defineProperty(Component.prototype, 'mountX', {
    get: function () {
        if (this.transitions && this.transitions[8]) {
            return this.transitions[8].targetValue;
        } else {
            return this.MOUNTX;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[8]) {
            this.setTransitionTargetValue(this.transitions[8], v, this.MOUNTX);
        } else {
            this.MOUNTX = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'MOUNTX', {
    get: function () {
        return this._mountX;
    },
    set: function(v) {
        var pv = this._mountX;
        if (pv !== v) {
            this._mountX = v;
            this._updateLocalTranslate();
        }
    }
});

Object.defineProperty(Component.prototype, 'mountY', {
    get: function () {
        if (this.transitions && this.transitions[9]) {
            return this.transitions[9].targetValue;
        } else {
            return this.MOUNTY;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[9]) {
            this.setTransitionTargetValue(this.transitions[9], v, this.MOUNTY);
        } else {
            this.MOUNTY = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'MOUNTY', {
    get: function () {
        return this._mountY;
    },
    set: function(v) {
        var pv = this._mountY;
        if (pv !== v) {
            this._mountY = v;
            this._updateLocalTranslate();
        }
    }
});

Object.defineProperty(Component.prototype, 'alpha', {
    get: function () {
        if (this.transitions && this.transitions[10]) {
            return this.transitions[10].targetValue;
        } else {
            return this.ALPHA;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[10]) {
            this.setTransitionTargetValue(this.transitions[10], v, this.ALPHA);
        } else {
            this.ALPHA = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'ALPHA', {
    get: function () {
        return this._alpha;
    },
    set: function(v) {
        if (v > 1) {
            v = 1;
        } else if (v < 0) {
            v = 0;
        }
        var pv = this._alpha;
        if (pv !== v) {
            this._alpha = v;
            this._updateLocalAlpha();
            if ((pv === 0) !== (v === 0)) {
                this.updateActiveFlag();
            }
        }
    }
});

Object.defineProperty(Component.prototype, 'rotation', {
    get: function () {
        if (this.transitions && this.transitions[11]) {
            return this.transitions[11].targetValue;
        } else {
            return this.ROTATION;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[11]) {
            this.setTransitionTargetValue(this.transitions[11], v, this.ROTATION);
        } else {
            this.ROTATION = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'ROTATION', {
    get: function () {
        return this._rotation;
    },
    set: function(v) {
        var pv = this._rotation;
        if (pv !== v) {
            this._rotation = v;
            this._updateLocalTransform();
        }
    }
});

Object.defineProperty(Component.prototype, 'borderWidthTop', {
    get: function () {
        if (this.transitions && this.transitions[12]) {
            return this.transitions[12].targetValue;
        } else {
            return this.BORDERWIDTHTOP;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[12]) {
            this.setTransitionTargetValue(this.transitions[12], v, this.BORDERWIDTHTOP);
        } else {
            this.BORDERWIDTHTOP = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'BORDERWIDTHTOP', {
    get: function () {
        return this._borderWidthTop;
    },
    set: function(v) {
        var pv = this._borderWidthTop;
        if (pv !== v) {
            this._borderWidthTop = v;
            if ((pv === 0) !== (v === 0)) {
                this.hasBorders = this._borderWidthTop || this._borderWidthBottom || this._borderWidthLeft || this._borderWidthRight;
            }

            this.uComponent.setBorderTop(this._borderWidthTop, this._borderColorTop);
        }
    }
});

Object.defineProperty(Component.prototype, 'borderWidthBottom', {
    get: function () {
        if (this.transitions && this.transitions[13]) {
            return this.transitions[13].targetValue;
        } else {
            return this.BORDERWIDTHBOTTOM;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[13]) {
            this.setTransitionTargetValue(this.transitions[13], v, this.BORDERWIDTHBOTTOM);
        } else {
            this.BORDERWIDTHBOTTOM = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'BORDERWIDTHBOTTOM', {
    get: function () {
        return this._borderWidthBottom;
    },
    set: function(v) {
        var pv = this._borderWidthBottom;
        if (pv !== v) {
            this._borderWidthBottom = v;
            if ((pv === 0) !== (v === 0)) {
                this.hasBorders = this._borderWidthBottom || this._borderWidthBottom || this._borderWidthLeft || this._borderWidthRight;
            }

            this.uComponent.setBorderBottom(this._borderWidthBottom, this._borderColorBottom);
        }
    }
});

Object.defineProperty(Component.prototype, 'borderWidthLeft', {
    get: function () {
        if (this.transitions && this.transitions[14]) {
            return this.transitions[14].targetValue;
        } else {
            return this.BORDERWIDTHLEFT;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[14]) {
            this.setTransitionTargetValue(this.transitions[14], v, this.BORDERWIDTHLEFT);
        } else {
            this.BORDERWIDTHLEFT = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'BORDERWIDTHLEFT', {
    get: function () {
        return this._borderWidthLeft;
    },
    set: function(v) {
        var pv = this._borderWidthLeft;
        if (pv !== v) {
            this._borderWidthLeft = v;
            if ((pv === 0) !== (v === 0)) {
                this.hasBorders = this._borderWidthLeft || this._borderWidthBottom || this._borderWidthLeft || this._borderWidthRight;
            }
            this.uComponent.setBorderLeft(this._borderWidthLeft, this._borderColorLeft);
        }
    }
});

Object.defineProperty(Component.prototype, 'borderWidthRight', {
    get: function () {
        if (this.transitions && this.transitions[15]) {
            return this.transitions[15].targetValue;
        } else {
            return this.BORDERWIDTHRIGHT;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[15]) {
            this.setTransitionTargetValue(this.transitions[15], v, this.BORDERWIDTHRIGHT);
        } else {
            this.BORDERWIDTHRIGHT = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'BORDERWIDTHRIGHT', {
    get: function () {
        return this._borderWidthRight;
    },
    set: function(v) {
        var pv = this._borderWidthRight;
        if (pv !== v) {
            this._borderWidthRight = v;
            if ((pv === 0) !== (v === 0)) {
                this.hasBorders = this._borderWidthRight || this._borderWidthBottom || this._borderWidthRight || this._borderWidthRight;
            }
            this.uComponent.setBorderRight(this._borderWidthRight, this._borderColorRight);
        }
    }
});

Object.defineProperty(Component.prototype, 'borderColorTop', {
    get: function () {
        if (this.transitions && this.transitions[16]) {
            return this.transitions[16].targetValue;
        } else {
            return this.BORDERCOLORTOP;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[16]) {
            this.setTransitionTargetValue(this.transitions[16], v, this.BORDERCOLORTOP);
        } else {
            this.BORDERCOLORTOP = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'BORDERCOLORTOP', {
    get: function () {
        return this._borderColorTop;
    },
    set: function(v) {
        var pv = this._borderColorTop;
        if (pv !== v) {
            this._borderColorTop = v;
            this.uComponent.setBorderTop(this._borderWidthTop, this._borderColorTop);
        }
    }
});

Object.defineProperty(Component.prototype, 'borderColorBottom', {
    get: function () {
        if (this.transitions && this.transitions[17]) {
            return this.transitions[17].targetValue;
        } else {
            return this.BORDERCOLORBOTTOM;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[17]) {
            this.setTransitionTargetValue(this.transitions[17], v, this.BORDERCOLORBOTTOM);
        } else {
            this.BORDERCOLORBOTTOM = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'BORDERCOLORBOTTOM', {
    get: function () {
        return this._borderColorBottom;
    },
    set: function(v) {
        var pv = this._borderColorBottom;
        if (pv !== v) {
            this._borderColorBottom = v;
            this.uComponent.setBorderBottom(this._borderWidthBottom, this._borderColorBottom);
        }
    }
});

Object.defineProperty(Component.prototype, 'borderColorLeft', {
    get: function () {
        if (this.transitions && this.transitions[18]) {
            return this.transitions[18].targetValue;
        } else {
            return this.BORDERCOLORLEFT;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[18]) {
            this.setTransitionTargetValue(this.transitions[18], v, this.BORDERCOLORLEFT);
        } else {
            this.BORDERCOLORLEFT = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'BORDERCOLORLEFT', {
    get: function () {
        return this._borderColorLeft;
    },
    set: function(v) {
        var pv = this._borderColorLeft;
        if (pv !== v) {
            this._borderColorLeft = v;
            this.uComponent.setBorderLeft(this._borderWidthLeft, this._borderColorLeft);
        }
    }
});

Object.defineProperty(Component.prototype, 'borderColorRight', {
    get: function () {
        if (this.transitions && this.transitions[19]) {
            return this.transitions[19].targetValue;
        } else {
            return this.BORDERCOLORRIGHT;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[19]) {
            this.setTransitionTargetValue(this.transitions[19], v, this.BORDERCOLORRIGHT);
        } else {
            this.BORDERCOLORRIGHT = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'BORDERCOLORRIGHT', {
    get: function () {
        return this._borderColorRight;
    },
    set: function(v) {
        var pv = this._borderColorRight;
        if (pv !== v) {
            this._borderColorRight = v;
            this.uComponent.setBorderRight(this._borderWidthRight, this._borderColorRight);
        }
    }
});

Object.defineProperty(Component.prototype, 'colorTopLeft', {
    get: function () {
        if (this.transitions && this.transitions[20]) {
            return this.transitions[20].targetValue;
        } else {
            return this.COLORTOPLEFT;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[20]) {
            this.setTransitionTargetValue(this.transitions[20], v, this.COLORTOPLEFT);
        } else {
            this.COLORTOPLEFT = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'COLORTOPLEFT', {
    get: function () {
        return this._colorTopLeft;
    },
    set: function(v) {
        var pv = this._colorTopLeft;
        if (pv !== v) {
            this._colorTopLeft = v;
            this.uComponent.setColorUl(v);
        }
    }
});

Object.defineProperty(Component.prototype, 'colorTopRight', {
    get: function () {
        if (this.transitions && this.transitions[21]) {
            return this.transitions[21].targetValue;
        } else {
            return this.COLORTOPRIGHT;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[21]) {
            this.setTransitionTargetValue(this.transitions[21], v, this.COLORTOPRIGHT);
        } else {
            this.COLORTOPRIGHT = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'COLORTOPRIGHT', {
    get: function () {
        return this._colorTopRight;
    },
    set: function(v) {
        var pv = this._colorTopRight;
        if (pv !== v) {
            this._colorTopRight = v;
            this.uComponent.setColorUr(v);
        }
    }
});

Object.defineProperty(Component.prototype, 'colorBottomLeft', {
    get: function () {
        if (this.transitions && this.transitions[22]) {
            return this.transitions[22].targetValue;
        } else {
            return this.COLORBOTTOMLEFT;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[22]) {
            this.setTransitionTargetValue(this.transitions[22], v, this.COLORBOTTOMLEFT);
        } else {
            this.COLORBOTTOMLEFT = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'COLORBOTTOMLEFT', {
    get: function () {
        return this._colorBottomLeft;
    },
    set: function(v) {
        var pv = this._colorBottomLeft;
        if (pv !== v) {
            this._colorBottomLeft = v;
            this.uComponent.setColorBl(v);
        }
    }
});

Object.defineProperty(Component.prototype, 'colorBottomRight', {
    get: function () {
        if (this.transitions && this.transitions[23]) {
            return this.transitions[23].targetValue;
        } else {
            return this.COLORBOTTOMRIGHT;
        }
    },
    set: function(v) {
        if (this.transitions && this.transitions[23]) {
            this.setTransitionTargetValue(this.transitions[23], v, this.COLORBOTTOMRIGHT);
        } else {
            this.COLORBOTTOMRIGHT = v;
        }
    }
});

Object.defineProperty(Component.prototype, 'COLORBOTTOMRIGHT', {
    get: function () {
        return this._colorBottomRight;
    },
    set: function(v) {
        var pv = this._colorBottomRight;
        if (pv !== v) {
            this._colorBottomRight = v;
            this.uComponent.setColorBr(v);
        }
    }
});

Object.defineProperty(Component.prototype, 'visible', {
    get: function () {
        return this._visible;
    },
    set: function(v) {
        var pv = this._visible;
        if (pv !== v) {
            this._visible = v;
            this._updateLocalAlpha();
            this.updateActiveFlag();
        }
    }
});

Object.defineProperty(Component.prototype, 'clipping', {
    get: function () {
        return this._clipping;
    },
    set: function(v) {
        var pv = this._clipping;
        if (pv !== v) {
            this._clipping = v;
            this.uComponent.setClipping(v);
        }
    }
});

Object.defineProperty(Component.prototype, 'zIndex', {
    get: function () {
        return this._zIndex;
    },
    set: function(v) {
        var pv = this._zIndex;
        if (pv !== v) {
            this._zIndex = v;
            if (this.active) {
                if (pv !== 0 && v === 0) {
                    this.stage.zIndexUsage--;
                } else if (pv === 0 && v !== 0) {
                    this.stage.zIndexUsage++;
                }
            }
            this.uComponent.setZIndex(this.zIndex);
        }
    }
});

Object.defineProperty(Component.prototype, 'forceZIndexContext', {
    get: function () {
        return this._forceZIndexContext;
    },
    set: function(v) {
        var pv = this._forceZIndexContext;
        if (pv !== v) {
            this._forceZIndexContext = v;
            this.uComponent.setForceZIndexContext(this.forceZIndexContext);
        }
    }
});

Object.defineProperty(Component.prototype, 'scale', {
    get: function() { return this.scaleX; },
    set: function(v) {
        this.scaleX = v;
        this.scaleY = v;
    }
});

Object.defineProperty(Component.prototype, 'borderWidth', {
    get: function() { return this.borderWidthTop; },
    set: function(v) {
        this.borderWidthTop = v;
        this.borderWidthBottom = v;
        this.borderWidthLeft = v;
        this.borderWidthRight = v;
    }
});

Object.defineProperty(Component.prototype, 'borderColor', {
    get: function() { return this.borderColorTop; },
    set: function(v) {
        this.borderColorTop = v;
        this.borderColorBottom = v;
        this.borderColorLeft = v;
        this.borderColorRight = v;
    }
});

Object.defineProperty(Component.prototype, 'texture', {
    get: function() { return this._texture; },
    set: function(v) {
        if (v === null || v instanceof Texture) {
            var prevValue = this._texture;
            if (v !== prevValue) {
                if (v !== null && !(v instanceof Texture)) {
                    throw new Error('incorrect value for texture');
                }

                this._texture = v;

                if (this.active && prevValue && this.displayedTexture !== prevValue) {
                    prevValue.removeComponent(this);

                    if (!v || prevValue.source !== v.source) {
                        if (!this.displayedTexture || (this.displayedTexture.source !== prevValue.source)) {
                            prevValue.source.removeComponent(this);
                        }
                    }
                }

                if (v) {
                    if (this.active) {
                        // When the texture is changed, maintain the texture's sprite registry.
                        // While the displayed texture is different from the texture (not yet loaded), two textures are referenced.
                        v.source.addComponent(this);
                        v.addComponent(this);
                    }

                    if (v.source.glTexture) {
                        this.displayedTexture = v;
                    }
                } else {
                    // Make sure that current texture is cleared when the texture is explicitly set to null.
                    this.displayedTexture = null;
                }
            }
        } else if (Utils.isPlainObject(v)) {
            if (this._texture) {
                this._texture.set(v);
            }
        }
    }
});

Object.defineProperty(Component.prototype, 'displayedTexture', {
    get: function() { return this._displayedTexture; },
    set: function(v) {
        if (v === null || v instanceof Texture) {
            var prevValue = this._displayedTexture;
            if (v !== prevValue) {
                if (this.active && prevValue) {
                    // We can assume that this._texture === this._displayedTexture.

                    if (prevValue !== this.texture) {
                        // The old displayed texture is deprecated.
                        prevValue.removeComponent(this);
                    }

                    if (!v || (prevValue.source !== v.source)) {
                        prevValue.source.removeComponent(this);
                    }
                }

                var beforeW = this._renderWidth;
                var beforeH = this._renderHeight;
                this._displayedTexture = v;
                this._renderWidth = this._getRenderWidth();
                this._renderHeight = this._getRenderHeight();
                if (!prevValue || beforeW != this._renderWidth || beforeH != this._renderHeight) {
                    // Due to width/height change: update the translation vector and borders.
                    this._updateLocalDimensions();
                }
                if (v) {
                    // We don't need to reference the displayed texture because it was already referenced (this.texture === this.displayedTexture).
                    this._updateTextureCoords();
                    this.stage.uComponentContext.setDisplayedTextureSource(this.uComponent, v.source);
                } else {
                    this.stage.uComponentContext.setDisplayedTextureSource(this.uComponent, null);
                }
            }
        } else if (Utils.isPlainObject(v)) {
            if (this._displayedTexture) {
                this._displayedTexture.set(v);
            }
        }
    }
});

Object.defineProperty(Component.prototype, 'color', {
    get: function() { return this.colorTopLeft; },
    set: function(v) {
        this.colorTopLeft = v;
        this.colorTopRight = v;
        this.colorBottomLeft = v;
        this.colorBottomRight = v;
    }
});

Object.defineProperty(Component.prototype, 'colorTop', {
    get: function() { return this.colorTopLeft; },
    set: function(v) {
        this.colorTopLeft = v;
        this.colorTopRight = v;
    }
});

Object.defineProperty(Component.prototype, 'colorBottom', {
    get: function() { return this.colorBottomLeft; },
    set: function(v) {
        this.colorBottomLeft = v;
        this.colorBottomRight = v;
    }
});

Object.defineProperty(Component.prototype, 'colorLeft', {
    get: function() { return this.colorTopLeft; },
    set: function(v) {
        this.colorTopLeft = v;
        this.colorBottomLeft = v;
    }
});

Object.defineProperty(Component.prototype, 'colorRight', {
    get: function() { return this.colorTopRight; },
    set: function(v) {
        this.colorTopRight = v;
        this.colorBottomRight = v;
    }
});

Object.defineProperty(Component.prototype, 'src', {
    get: function() { return this._src; },
    set: function(v) {
        var prevValue = this._src;

        if (!prevValue || prevValue !== v || !this.texture || !this.texture.source.renderInfo || this.texture.source.renderInfo.src !== v) {
            if (!v) {
                if (prevValue) {
                    this.texture = null;
                }
                this._src = null;
            } else {
                this.texture = this.stage.textureManager.getTexture(v);

                this._src = v;
            }
        }
    }
});

Object.defineProperty(Component.prototype, 'text', {
    get: function() {
        if (!this.textRenderer) {
            this.textRenderer = new ComponentText(this);
        }
        return this.textRenderer;
    },
    set: function(settings) {
        if (settings === null) {
            if (this.textRenderer) {
                this.textRenderer = null;
                this.texture = null;
            }
        } else {
            if (!this.textRenderer) {
                this.textRenderer = new ComponentText(this);
            }
            if (Utils.isString(settings)) {
                this.textRenderer.text = settings;
            } else {
                this.textRenderer.set(settings);
            }
        }
    }
});

Object.defineProperty(Component.prototype, 'rect', {
    get: function() {
        return (this.texture === this.stage.getRectangleTexture());
    },
    set: function(v) {
        if (v) {
            this.texture = this.stage.getRectangleTexture();
        } else {
            this.texture = null;
        }
    }
});

Object.defineProperty(Component.prototype, 'tags', {
    get: function() {
        // Copy to make sure they aren't changed externally.
        return this.getTags();
    },
    set: function(v) {
        this.setTags(v);
    }
});

Object.defineProperty(Component.prototype, 'children', {
    get: function() {
        // Copy to make sure they aren't changed externally.
        return this._children;
    },
    set: function(v) {
        var stage = this.stage;
        if (!Utils.isArray(v)) {
            throw new TypeError('Children must be array.');
        }
        var c = [];
        for (var i = 0, n = v.length; i < n; i++) {
            if (v[i] instanceof Component) {
                c[i] = v[i];
            } else {
                c[i] = stage.c(v[i]);
            }
        }
        this.setChildren(c);
    }
});

Component.prototype.setTransitionTargetValue = function(transition, targetValue, currentValue) {
    transition.updateTargetValue(targetValue, currentValue);
};

Component.prototype._updateLocalTransform = function() {
    if (this._rotation !== 0 && this._rotation % (2 * Math.PI)) {
        // check to see if the rotation is the same as the previous render. This means we only need to use sin and cos when rotation actually changes
        if (this._rotation !== this.rotationCache) {
            this.rotationCache = this._rotation;
            this._sr = Math.sin(this._rotation);
            this._cr = Math.cos(this._rotation);
        }

        this.uComponent.setLocalTransform(
            this._cr * this._scaleX,
            -this._sr * this._scaleY,
            this._sr * this._scaleX,
            this._cr * this._scaleY
        );
    } else {
        this.uComponent.setLocalTransform(
            this._scaleX,
            0,
            0,
            this._scaleY
        );
    }
    this._updateLocalTranslate();
};

Component.prototype._updateLocalTranslate = function() {
    var pivotXMul = this._pivotX * this._renderWidth;
    var pivotYMul = this._pivotY * this._renderHeight;
    var px = this._x - (pivotXMul * this.uComponent.getLocalTa() + pivotYMul * this.uComponent.getLocalTb()) + pivotXMul;
    var py = this._y - (pivotXMul * this.uComponent.getLocalTc() + pivotYMul * this.uComponent.getLocalTd()) + pivotYMul;
    px -= this._mountX * this._renderWidth;
    py -= this._mountY * this._renderHeight;
    this.uComponent.setLocalTranslate(
        px,
        py
    );
};

Component.prototype._updateLocalTranslateDelta = function(dx, dy) {
    this.uComponent.addLocalTranslate(dx, dy);
};

Component.prototype._updateLocalAlpha = function() {
    this.uComponent.setLocalAlpha(this._visible ? this._alpha : 0);
};

Component.prototype._updateLocalDimensions = function() {
    this.uComponent.setDimensions(this._renderWidth, this._renderHeight);
    this._updateLocalTranslate();
};

Component.prototype.textureIsLoaded = function() {
    return this.texture ? !!this.texture.source.glTexture : false;
};

Component.prototype._updateTextureCoords = function() {
    if (this.displayedTexture && this.displayedTexture.source) {
        var displayedTexture = this.displayedTexture;
        var displayedTextureSource = this.displayedTexture.source;
        
        var tx1 = 0, ty1 = 0, tx2 = 1.0, ty2 = 1.0;
        if (displayedTexture.clipping) {
            // Apply texture clipping.
            var w = displayedTextureSource.getRenderWidth();
            var h = displayedTextureSource.getRenderHeight();
            var iw, ih, rw, rh;
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
            var textureAtlasI = 0.000488281;    // 1/2048.

            var tax = (displayedTextureSource.textureAtlasX * textureAtlasI);
            var tay = (displayedTextureSource.textureAtlasY * textureAtlasI);
            var dax = (displayedTextureSource.w * textureAtlasI);
            var day = (displayedTextureSource.h * textureAtlasI);

            tx1 = tax;
            ty1 = tay;

            tx2 = tx2 * dax + tax;
            ty2 = ty2 * day + tay;
        }

        this.uComponent.setTextureCoords(tx1, ty1, tx2, ty2);
        this.uComponent.setInTextureAtlas(displayedTextureSource.inTextureAtlas);
    }
};

Component.getPropertyIndex = function(name) {
    return Component.SETTINGS[name] ? Component.SETTINGS[name].i : -1;
};

Component.getPropertyIndexFinal = function(name) {
    return Component.FINAL_SETTINGS[name] ? Component.FINAL_SETTINGS[name].i : -1;
};

Component.SETTINGS = {
    'x': {i:0, s: function(obj, value) {obj.x = value}, g: function(obj) {return obj.x}, sf: function(obj, value) {obj.X = value}, gf: function(obj) {return obj.X}, m: StageUtils.mergeNumbers},
    'y': {i:1, s: function(obj, value) {obj.y = value}, g: function(obj) {return obj.y}, sf: function(obj, value) {obj.Y = value}, gf: function(obj) {return obj.Y}, m: StageUtils.mergeNumbers},
    'w': {i:2, s: function(obj, value) {obj.w = value}, g: function(obj) {return obj.w}, sf: function(obj, value) {obj.W = value}, gf: function(obj) {return obj.W}, m: StageUtils.mergeNumbers},
    'h': {i:3, s: function(obj, value) {obj.h = value}, g: function(obj) {return obj.h}, sf: function(obj, value) {obj.H = value}, gf: function(obj) {return obj.H}, m: StageUtils.mergeNumbers},
    'scaleX': {i:4, s: function(obj, value) {obj.scaleX = value}, g: function(obj) {return obj.scaleX}, sf: function(obj, value) {obj.SCALEX = value}, gf: function(obj) {return obj.SCALEX}, m: StageUtils.mergeNumbers},
    'scaleY': {i:5, s: function(obj, value) {obj.scaleY = value}, g: function(obj) {return obj.scaleY}, sf: function(obj, value) {obj.SCALEY = value}, gf: function(obj) {return obj.SCALEY}, m: StageUtils.mergeNumbers},
    'pivotX': {i:6, s: function(obj, value) {obj.pivotX = value}, g: function(obj) {return obj.pivotX}, sf: function(obj, value) {obj.PIVOTX = value}, gf: function(obj) {return obj.PIVOTX}, m: StageUtils.mergeNumbers},
    'pivotY': {i:7, s: function(obj, value) {obj.pivotY = value}, g: function(obj) {return obj.pivotY}, sf: function(obj, value) {obj.PIVOTY = value}, gf: function(obj) {return obj.PIVOTY}, m: StageUtils.mergeNumbers},
    'mountX': {i:8, s: function(obj, value) {obj.mountX = value}, g: function(obj) {return obj.mountX}, sf: function(obj, value) {obj.MOUNTX = value}, gf: function(obj) {return obj.MOUNTX}, m: StageUtils.mergeNumbers},
    'mountY': {i:9, s: function(obj, value) {obj.mountY = value}, g: function(obj) {return obj.mountY}, sf: function(obj, value) {obj.MOUNTY = value}, gf: function(obj) {return obj.MOUNTY}, m: StageUtils.mergeNumbers},
    'alpha': {i:10, s: function(obj, value) {obj.alpha = value}, g: function(obj) {return obj.alpha}, sf: function(obj, value) {obj.ALPHA = value}, gf: function(obj) {return obj.ALPHA}, m: StageUtils.mergeNumbers},
    'rotation': {i:11, s: function(obj, value) {obj.rotation = value}, g: function(obj) {return obj.rotation}, sf: function(obj, value) {obj.ROTATION = value}, gf: function(obj) {return obj.ROTATION}, m: StageUtils.mergeNumbers},
    'borderWidthTop': {i:12, s: function(obj, value) {obj.borderWidthTop = value}, g: function(obj) {return obj.borderWidthTop}, sf: function(obj, value) {obj.BORDERWIDTHTOP = value}, gf: function(obj) {return obj.BORDERWIDTHTOP}, m: StageUtils.mergeNumbers},
    'borderWidthBottom': {i:13, s: function(obj, value) {obj.borderWidthBottom = value}, g: function(obj) {return obj.borderWidthBottom}, sf: function(obj, value) {obj.BORDERWIDTHBOTTOM = value}, gf: function(obj) {return obj.BORDERWIDTHBOTTOM}, m: StageUtils.mergeNumbers},
    'borderWidthLeft': {i:14, s: function(obj, value) {obj.borderWidthLeft = value}, g: function(obj) {return obj.borderWidthLeft}, sf: function(obj, value) {obj.BORDERWIDTHLEFT = value}, gf: function(obj) {return obj.BORDERWIDTHLEFT}, m: StageUtils.mergeNumbers},
    'borderWidthRight': {i:15, s: function(obj, value) {obj.borderWidthRight = value}, g: function(obj) {return obj.borderWidthRight}, sf: function(obj, value) {obj.BORDERWIDTHRIGHT = value}, gf: function(obj) {return obj.BORDERWIDTHRIGHT}, m: StageUtils.mergeNumbers},
    'borderColorTop': {i:16, s: function(obj, value) {obj.borderColorTop = value}, g: function(obj) {return obj.borderColorTop}, sf: function(obj, value) {obj.BORDERCOLORTOP = value}, gf: function(obj) {return obj.BORDERCOLORTOP}, m: StageUtils.mergeColors},
    'borderColorBottom': {i:17, s: function(obj, value) {obj.borderColorBottom = value}, g: function(obj) {return obj.borderColorBottom}, sf: function(obj, value) {obj.BORDERCOLORBOTTOM = value}, gf: function(obj) {return obj.BORDERCOLORBOTTOM}, m: StageUtils.mergeColors},
    'borderColorLeft': {i:18, s: function(obj, value) {obj.borderColorLeft = value}, g: function(obj) {return obj.borderColorLeft}, sf: function(obj, value) {obj.BORDERCOLORLEFT = value}, gf: function(obj) {return obj.BORDERCOLORLEFT}, m: StageUtils.mergeColors},
    'borderColorRight': {i:19, s: function(obj, value) {obj.borderColorRight = value}, g: function(obj) {return obj.borderColorRight}, sf: function(obj, value) {obj.BORDERCOLORRIGHT = value}, gf: function(obj) {return obj.BORDERCOLORRIGHT}, m: StageUtils.mergeColors},
    'colorTopLeft': {i:20, s: function(obj, value) {obj.colorTopLeft = value}, g: function(obj) {return obj.colorTopLeft}, sf: function(obj, value) {obj.COLORTOPLEFT = value}, gf: function(obj) {return obj.COLORTOPLEFT}, m: StageUtils.mergeColors},
    'colorTopRight': {i:21, s: function(obj, value) {obj.colorTopRight = value}, g: function(obj) {return obj.colorTopRight}, sf: function(obj, value) {obj.COLORTOPRIGHT = value}, gf: function(obj) {return obj.COLORTOPRIGHT}, m: StageUtils.mergeColors},
    'colorBottomLeft': {i:22, s: function(obj, value) {obj.colorBottomLeft = value}, g: function(obj) {return obj.colorBottomLeft}, sf: function(obj, value) {obj.COLORBOTTOMLEFT = value}, gf: function(obj) {return obj.COLORBOTTOMLEFT}, m: StageUtils.mergeColors},
    'colorBottomRight': {i:23, s: function(obj, value) {obj.colorBottomRight = value}, g: function(obj) {return obj.colorBottomRight}, sf: function(obj, value) {obj.COLORBOTTOMRIGHT = value}, gf: function(obj) {return obj.COLORBOTTOMRIGHT}, m: StageUtils.mergeColors},
    'visible': {s: function(obj, value) {obj.visible = value}, g: function(obj) {return obj.visible}, sf: function(obj, value) {obj.VISIBLE = value}, gf: function(obj) {return obj.VISIBLE}, m: null},
    'zIndex': {s: function(obj, value) {obj.zIndex = value}, g: function(obj) {return obj.zIndex}, sf: function(obj, value) {obj.VISIBLE = value}, gf: function(obj) {return obj.VISIBLE}, m: null},
    'forceZIndexContext': {s: function(obj, value) {obj.forceZIndexContext = value}, g: function(obj) {return obj.forceZIndexContext}, sf: function(obj, value) {obj.FORCEZINDEXCONTEXT = value}, gf: function(obj) {return obj.FORCEZINDEXCONTEXT}, m: null},
    'clipping': {s: function(obj, value) {obj.clipping = value}, g: function(obj) {return obj.clipping}, sf: function(obj, value) {obj.CLIPPING = value}, gf: function(obj) {return obj.CLIPPING}, m: null},
    'rect': {s: function(obj, value) {obj.rect = value}, g: function(obj) {return obj.rect}, m: null},
    'src': {s: function(obj, value) {obj.src = value}, g: function(obj) {return obj.src}, m: null},
    'text': {s: function(obj, value) {obj.text = value}, g: function(obj) {return obj.text}, m: null},
    'texture': {s: function(obj, value) {obj.texture = value}, g: function(obj) {return obj.src}, m: null},
    'tag': {s: function(obj, value) {obj.tags = value}, g: function(obj) {return obj.tags}, m: null},
    'tags': {s: function(obj, value) {obj.tags = value}, g: function(obj) {return obj.tags}, m: null},
    'children': {s: function(obj, value) {obj.children = value}, g: function(obj) {return obj.children;}, m: null}
};

Component.FINAL_SETTINGS = {};
for (var key in Component.SETTINGS) {
    if (Component.SETTINGS.hasOwnProperty(key) && Component.SETTINGS[key]['sf']) {
        Component.FINAL_SETTINGS[key.toUpperCase()] = Component.SETTINGS[key];
    }
}

Component.nTransitions = 24;



var ComponentTags = function(component) {

    this.component = component;

    /**
     * Parent component's tag manager.
     * @type {ComponentTags}
     */
    this.parent = null;

    /**
     * Tags that can be used to identify/search for a specific component.
     * @type {String[]}
     */
    this.tags = null;

    /**
     * The tree's tags mapping.
     * This contains all components for all known tags, at all times.
     * @type {Map}
     * @private
     */
    this.treeTags = null;

    /**
     * Cache for the tag/mtag methods.
     * @type {Map<String,Component[]>}
     */
    this.cache = null;

    /**
     * Tag-to-complex cache (all tags that are part of the complex caches).
     * This maps tags to cached complex tags in the cache.
     * @type {Map<String,String[]>}
     */
    this.tagToComplex = null;

};

/**
 * Clears the cache(s) for the specified tag.
 * @param {String} tag
 */
ComponentTags.prototype.clearCache = function(tag) {
    if (this.cache) {
        this.cache.delete(tag);

        if (this.tagToComplex) {
            var s = this.tagToComplex.get(tag);
            if (s) {
                for (var i = 0, n = s.length; i < n; i++) {
                    this.cache.delete(s[i]);
                }
                this.tagToComplex.delete(tag);
            }
        }
    }
};

ComponentTags.prototype.unsetParent = function() {
    var tags = null;
    var n = 0;
    if (this.treeTags) {
        tags = Utils.iteratorToArray(this.treeTags.keys());
        n = tags.length;

        if (n > 0) {
            for (var i = 0; i < n; i++) {
                var tagSet = this.treeTags.get(tags[i]);

                // Remove from treeTags.
                var p = this;
                while (p = p.parent) {
                    var parentTreeTags = p.treeTags.get(tags[i]);

                    tagSet.forEach(function(comp) {
                        parentTreeTags.delete(comp);
                    });


                    p.clearCache(tags[i]);
                }
            }
        }
    }

};

ComponentTags.prototype.setParent = function(parent) {
    this.parent = parent;

    var tags = null;
    var n = 0;
    if (this.treeTags) {
        tags = Utils.iteratorToArray(this.treeTags.keys());
        n = tags.length;

        if (n > 0) {
            for (var i = 0; i < n; i++) {
                var tagSet = this.treeTags.get(tags[i]);

                // Add to treeTags.
                var p = this;
                while (p = p.parent) {
                    if (!p.treeTags) {
                        p.treeTags = new Map();
                    }

                    var s = p.treeTags.get(tags[i]);
                    if (!s) {
                        s = new Set();
                        p.treeTags.set(tags[i], s);
                    }

                    tagSet.forEach(function(comp) {
                        s.add(comp);
                    });

                    p.clearCache(tags[i]);
                }
            }
        }
    }
};

ComponentTags.prototype.getLocalTags = function() {
    // We clone it to make sure it's not changed externally.
    return this.tags;
};

ComponentTags.prototype.setTags = function(tags) {
    if (!Utils.isArray(tags)) {
        tags = [tags];
    }

    var i, n = tags.length;
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
};

ComponentTags.prototype.addTag = function(tag) {
    if (!this.tags) {
        this.tags = [];
    }
    if (this.tags.indexOf(tag) === -1) {
        this.tags.push(tag);

        // Add to treeTags hierarchy.
        var p = this;
        do {
            if (!p.treeTags) {
                p.treeTags = new Map();
            }

            var s = p.treeTags.get(tag);
            if (!s) {
                var s = new Set();
                p.treeTags.set(tag, s);
            }

            s.add(this.component);

            p.clearCache(tag);
        } while (p = p.parent);
    }
};

ComponentTags.prototype.removeTag = function(tag) {
    var i = this.tags.indexOf(tag);
    if (i !== -1) {
        this.tags.splice(i, 1);

        // Remove from treeTags hierarchy.
        var p = this;
        do {
            var list = p.treeTags.get(tag);
            if (list) {
                list.delete(this.component);

                p.clearCache(tag);
            }
        } while (p = p.parent);
    }
};

ComponentTags.prototype.hasTag = function(tag) {
    return (this.tags && (this.tags.indexOf(tag) !== -1));
};

/**
 * Returns one of the components from the subtree that have this tag.
 * @param {string} tag
 * @returns {Component}
 */
ComponentTags.prototype.tag = function(tag) {
    var res = this.mtag(tag);
    return res[0];
};

ComponentTags.prototype.get = function(tag) {
    if (!this.treeTags) {
        return [];
    }
    var t = this.treeTags.get(tag);
    return t ? Utils.setToArray(t) : [];
};

/**
 * Returns all components from the subtree that have this tag.
 * @param {string} tag
 * @returns {Component[]}
 */
ComponentTags.prototype.mtag = function(tag) {
    var res = null;
    if (this.cache) {
        res = this.cache.get(tag);
    }

    if (!res) {
        var idx = tag.indexOf(".");
        if (idx >= 0) {
            var parts = tag.split('.');
            res = this.get(parts[0]);
            var level = 1;
            var c = parts.length;
            while (res.length && level < c) {
                var resn = [];
                for (var j = 0, n = res.length; j < n; j++) {
                    resn = resn.concat(res[j]._tags.get(parts[level]));
                }

                res = resn;
                level++;
            }
        } else {
            res = this.get(tag);
        }

        if (!this.cache) {
            this.cache = new Map();
        }

        this.cache.set(tag, res);
    }
    return res;
};



/**
 * Renders text as a component texture.
 * @constructor
 * @abstract
 */
function ComponentText(component) {

    this.stage = component.stage;

    this.component = component;

    this.updatingTexture = false;

    this.settings = new TextRendererSettings();

    this.texture = null;

    this.updateTexture();
}

ComponentText.prototype.set = function(settings) {
    this.settings.set(settings);
    if (this.settings.hasUpdates) {
        this.updateTexture();
    }
};

ComponentText.prototype.updateTexture = function() {
    if (this.settings.text == "") {
        // Clear current displayed texture (when changing text back to empty).
        this.component.texture = null;
        return;
    }

    this.settings.hasUpdates = false;
    if (this.updatingTexture && this.component.texture === this.texture) return;

    this.updatingTexture = true;

    // Create a dummy texture that loads the actual texture.
    var self = this;
    this.component.texture = this.texture = this.stage.texture(function(cb) {
        self.updatingTexture = false;

        // Create 'real' texture and set it.
        return cb(null, self.createTextureSource());
    });
};

ComponentText.prototype.createTextureSource = function() {
    var tr = new TextRenderer(this.stage, this.settings.clone());

    // Inherit width and height from component.

    var self = this;

    if (!tr.settings.w && this.component.w) {
        tr.settings.w = this.component.w;
    }

    if (!tr.settings.h && this.component.h) {
        tr.settings.h = this.component.h;
    }

    return self.stage.textureManager.getTextureSource(function (cb) {
        // Generate the image.
        var rval = tr.draw();
        var renderInfo = rval.renderInfo;

        cb(null, rval.canvas, {renderInfo: renderInfo, precision: rval.renderInfo.precision});
    }, tr.settings.getTextureId());
};

ComponentText.prototype.measure = function() {
    var tr = new TextRenderer(this.stage, this.settings.clone());

    if (!tr.settings.w && this.component.w) {
        tr.settings.w = this.component.w;
    }

    if (!tr.settings.h && this.component.h) {
        tr.settings.h = this.component.h;
    }

    var rval = tr.draw(true);
    return rval.renderInfo;
};

Object.defineProperty(ComponentText.prototype, 'renderInfo', {
    get: function() {
        return (this.texture && this.texture.source ? this.texture.source.renderInfo : {});
    }
});

// Proxy all settable properties to the settings object.
Object.defineProperty(ComponentText.prototype, 'text', {
    get: function() {
        return this.settings.text;
    },
    set: function(v) {
        this.settings.text = v;
        if (v === null) {
            this.component.text = null;
        } else {
            if (this.settings.hasUpdates) this.updateTexture();
        }
    }
});

Object.defineProperty(ComponentText.prototype, 'w', {
    get: function() {
        return this.settings.w;
    },
    set: function(v) {
        this.settings.w = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'h', {
    get: function() {
        return this.settings.h;
    },
    set: function(v) {
        this.settings.h = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'fontStyle', {
    get: function() {
        return this.settings.fontStyle;
    },
    set: function(v) {
        this.settings.fontStyle = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'fontSize', {
    get: function() {
        return this.settings.fontSize;
    },
    set: function(v) {
        this.settings.fontSize = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'fontFace', {
    get: function() {
        return this.settings.fontFace;
    },
    set: function(v) {
        this.settings.fontFace = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'wordWrap', {
    get: function() {
        return this.settings.wordWrap;
    },
    set: function(v) {
        this.settings.wordWrap = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'wordWrapWidth', {
    get: function() {
        return this.settings.wordWrapWidth;
    },
    set: function(v) {
        this.settings.wordWrapWidth = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'lineHeight', {
    get: function() {
        return this.settings.lineHeight;
    },
    set: function(v) {
        this.settings.lineHeight = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'textBaseline', {
    get: function() {
        return this.settings.textBaseline;
    },
    set: function(v) {
        this.settings.textBaseline = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'textAlign', {
    get: function() {
        return this.settings.textAlign;
    },
    set: function(v) {
        this.settings.textAlign = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'offsetY', {
    get: function() {
        return this.settings.offsetY;
    },
    set: function(v) {
        this.settings.offsetY = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'maxLines', {
    get: function() {
        return this.settings.maxLines;
    },
    set: function(v) {
        this.settings.maxLines = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'maxLinesSuffix', {
    get: function() {
        return this.settings.maxLinesSuffix;
    },
    set: function(v) {
        this.settings.maxLinesSuffix = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'precision', {
    get: function() {
        return this.settings.precision;
    },
    set: function(v) {
        this.settings.precision = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'textColor', {
    get: function() {
        return this.settings.textColor;
    },
    set: function(v) {
        this.settings.textColor = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'paddingLeft', {
    get: function() {
        return this.settings.paddingLeft;
    },
    set: function(v) {
        this.settings.paddingLeft = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'paddingRight', {
    get: function() {
        return this.settings.paddingRight;
    },
    set: function(v) {
        this.settings.paddingRight = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'shadow', {
    get: function() {
        return this.settings.shadow;
    },
    set: function(v) {
        this.settings.shadow = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'shadowColor', {
    get: function() {
        return this.settings.shadowColor;
    },
    set: function(v) {
        this.settings.shadowColor = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'shadowOffsetX', {
    get: function() {
        return this.settings.shadowOffsetX;
    },
    set: function(v) {
        this.settings.shadowOffsetX = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'shadowOffsetY', {
    get: function() {
        return this.settings.shadowOffsetY;
    },
    set: function(v) {
        this.settings.shadowOffsetY = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'shadowBlur', {
    get: function() {
        return this.settings.shadowBlur;
    },
    set: function(v) {
        this.settings.shadowBlur = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'highlight', {
    get: function() {
        return this.settings.highlight;
    },
    set: function(v) {
        this.settings.highlight = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'highlightHeight', {
    get: function() {
        return this.settings.highlightHeight;
    },
    set: function(v) {
        this.settings.highlightHeight = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'highlightColor', {
    get: function() {
        return this.settings.highlightColor;
    },
    set: function(v) {
        this.settings.highlightColor = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'highlightOffset', {
    get: function() {
        return this.settings.highlightOffset;
    },
    set: function(v) {
        this.settings.highlightOffset = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'highlightPaddingLeft', {
    get: function() {
        return this.settings.highlightPaddingLeft;
    },
    set: function(v) {
        this.settings.highlightPaddingLeft = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'highlightPaddingRight', {
    get: function() {
        return this.settings.highlightPaddingRight;
    },
    set: function(v) {
        this.settings.highlightPaddingRight = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'cutSx', {
    get: function() {
        return this.settings.cutSx;
    },
    set: function(v) {
        this.settings.cutSx = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'cutEx', {
    get: function() {
        return this.settings.cutEx;
    },
    set: function(v) {
        this.settings.cutEx = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'cutSy', {
    get: function() {
        return this.settings.cutSy;
    },
    set: function(v) {
        this.settings.cutSy = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'cutEy', {
    get: function() {
        return this.settings.cutEy;
    },
    set: function(v) {
        this.settings.cutEy = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});



function TextRenderer(stage, settings) {
    this.stage = stage;

    this.texture = null;

    this.settings = settings;

    this.canvas = null;

    this.context = null;
}

TextRenderer.prototype.getPrecision = function() {
    return (this.settings.precision || this.stage.defaultPrecision || 1);
};

TextRenderer.prototype.setFontProperties = function(withPrecision) {
    var ff = this.settings.fontFace || this.stage.defaultFontFace;
    var fonts = '"' + (Utils.isArray(ff) ? this.settings.fontFace.join('","') : ff) + '"';
    var precision = (withPrecision ? this.getPrecision() : 1);
    this.context.font = this.settings.fontStyle + " " + (this.settings.fontSize * precision) + "px " + fonts;
    this.context.textBaseline = this.settings.textBaseline;
};

TextRenderer.prototype.createCanvas = function() {
    this.canvas = this.stage.adapter.getDrawingCanvas();
    this.context = this.canvas.getContext('2d');
};

TextRenderer.prototype.unlinkCanvas = function() {
    this.canvas = null;
    this.context = null;
};

TextRenderer.prototype.draw = function(noDraw) {
    this.createCanvas();

    var renderInfo = {};

    // Set font properties.
    this.setFontProperties(false);

    // Total width.
    var width = this.settings.w || (2048 / this.getPrecision());

    // Inner width.
    var innerWidth = width - (this.settings.paddingLeft + this.settings.paddingRight);
    if (innerWidth < 10) {
        width += (10 - innerWidth);
        innerWidth += (10 - innerWidth);
    }

    var wordWrapWidth = this.settings.wordWrapWidth || innerWidth;

    // word wrap
    // preserve original text
    var linesInfo;
    if (this.settings.wordWrap) {
        linesInfo = this.wrapText(this.settings.text, wordWrapWidth);
    } else {
        linesInfo = {l: this.settings.text.split(/(?:\r\n|\r|\n)/), n: []};
        var i, n = linesInfo.l.length;
        for (var i = 0; i < n - 1; i++) {
            linesInfo.n.push(i);
        }
    }
    var lines = linesInfo.l;

    if (this.settings.maxLines && lines.length > this.settings.maxLines) {
        var usedLines = lines.slice(0, this.settings.maxLines);

        var otherLines = null;
        if (this.settings.maxLinesSuffix) {
            // Wrap again with max lines suffix enabled.
            var al = this.wrapText(usedLines[usedLines.length - 1] + this.settings.maxLinesSuffix, wordWrapWidth);
            usedLines[usedLines.length - 1] = al.l[0];
            otherLines = [al.l.length > 1 ? al.l[1] : ''];
        } else {
            otherLines = ['']
        }

        // Re-assemble the remaining text.
        var i, n = lines.length;
        var j = 0;
        var m = linesInfo.n.length;
        for (i = this.settings.maxLines; i < n; i++) {
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
    var maxLineWidth = 0;
    var lineWidths = [];
    for (var i = 0; i < lines.length; i++) {
        var lineWidth = this.context.measureText(lines[i]).width;
        lineWidths.push(lineWidth);
        maxLineWidth = Math.max(maxLineWidth, lineWidth);
    }

    renderInfo.lineWidths = lineWidths;

    if (!this.settings.w) {
        // Auto-set width to max text length.
        width = maxLineWidth + this.settings.paddingLeft + this.settings.paddingRight;
        innerWidth = maxLineWidth;
    }

    // calculate text height
    var lineHeight = this.settings.lineHeight || (this.settings.fontSize);

    var height;
    if (this.settings.h) {
        height = this.settings.h;
    } else {
        height = lineHeight * (lines.length - 1) + 0.5 * this.settings.fontSize + Math.max(lineHeight, this.settings.fontSize) + this.settings.offsetY;
    }

    var offsetY = this.settings.offsetY === null ? this.settings.fontSize : this.settings.offsetY;

    var precision = this.getPrecision();

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

        if (this.settings.cutSx || this.settings.cutEx) {
            width = Math.min(width, this.settings.cutEx - this.settings.cutSx);
        }

        if (this.settings.cutSy || this.settings.cutEy) {
            height = Math.min(height, this.settings.cutEy - this.settings.cutSy);
        }

        // Get corrected precision so that text
        this.canvas.width = Math.ceil(width * precision);
        this.canvas.height = Math.ceil(height * precision);

        // After changing the canvas, we need to reset the properties.
        this.setFontProperties(true);

        if (this.settings.cutSx || this.settings.cutSy) {
            this.context.translate(-(this.settings.cutSx * precision), -(this.settings.cutSy * precision));
        }

        var linePositionX;
        var linePositionY;

        var drawLines = [];

        // Draw lines line by line.
        for (i = 0; i < lines.length; i++) {
            linePositionX = 0;
            linePositionY = (i * lineHeight) + offsetY;

            if (this.settings.textAlign === 'right') {
                linePositionX += (innerWidth - lineWidths[i]);
            } else if (this.settings.textAlign === 'center') {
                linePositionX += ((innerWidth - lineWidths[i]) / 2);
            }
            linePositionX += this.settings.paddingLeft;

            drawLines.push({text: lines[i], x: linePositionX * precision, y: linePositionY * precision, w: lineWidths[i] * precision});
        }

        // Highlight.
        if (this.settings.highlight) {
            var color = this.settings.highlightColor || 0x00000000;
            var hlHeight = (this.settings.highlightHeight || this.settings.fontSize * 1.5);
            var offset = (this.settings.highlightOffset !== null ? this.settings.highlightOffset : -0.5 * this.settings.fontSize);
            var paddingLeft = (this.settings.highlightPaddingLeft !== null ? this.settings.highlightPaddingLeft : this.settings.paddingLeft);
            var paddingRight = (this.settings.highlightPaddingRight !== null ? this.settings.highlightPaddingRight : this.settings.paddingRight);

            this.context.fillStyle = StageUtils.getRgbaString(color);
            for (i = 0; i < drawLines.length; i++) {
                var drawLine = drawLines[i];
                this.context.fillRect((drawLine.x - paddingLeft) * precision, (drawLine.y + offset) * precision, (drawLine.w + paddingRight + paddingLeft) * precision, hlHeight * precision);
            }
        }

        // Text shadow.
        var prevShadowSettings = null;
        if (this.settings.shadow) {
            prevShadowSettings = [this.context.shadowColor, this.context.shadowOffsetX, this.context.shadowOffsetY, this.context.shadowBlur];

            this.context.shadowColor = StageUtils.getRgbaString(this.settings.shadowColor);
            this.context.shadowOffsetX = this.settings.shadowOffsetX * precision;
            this.context.shadowOffsetY = this.settings.shadowOffsetY * precision;
            this.context.shadowBlur = this.settings.shadowBlur * precision;
        }

        this.context.fillStyle = StageUtils.getRgbaString(this.settings.textColor);
        for (i = 0; i < drawLines.length; i++) {
            var drawLine = drawLines[i];
            this.context.fillText(drawLine.text, drawLine.x, drawLine.y);
        }

        if (prevShadowSettings) {
            this.context.shadowColor = prevShadowSettings[0];
            this.context.shadowOffsetX = prevShadowSettings[1];
            this.context.shadowOffsetY = prevShadowSettings[2];
            this.context.shadowBlur = prevShadowSettings[3];
        }

        if (this.settings.cutSx || this.settings.cutSy) {
            this.context.translate(this.settings.cutSx, this.settings.cutSy);
        }
    }

    var canvas = this.canvas;
    this.unlinkCanvas();
    return {renderInfo: renderInfo, canvas: canvas};
};

/**
 * Applies newlines to a string to have it optimally fit into the horizontal
 * bounds set by the Text object's wordWrapWidth property.
 */
TextRenderer.prototype.wrapText = function(text, wordWrapWidth) {
    // Greedy wrapping algorithm that will wrap words as the line grows longer
    // than its horizontal bounds.
    var lines = text.split(/\r?\n/g);
    var allLines = [];
    var realNewlines = [];
    for (var i = 0; i < lines.length; i++) {
        var resultLines = [];
        var result = '';
        var spaceLeft = wordWrapWidth;
        var words = lines[i].split(' ');
        for (var j = 0; j < words.length; j++) {
            var wordWidth = this.context.measureText(words[j]).width;
            var wordWidthWithSpace = wordWidth + this.context.measureText(' ').width;
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



var TextRendererSettings = function() {

    // The default text options.
    this.text = this._text = "";
    this.w = this._w = 0;
    this.h = this._h = 0;
    this.fontStyle = this._fontStyle = "normal";
    this.fontSize = this._fontSize = 40;
    this.fontFace = this._fontFace = null;
    this.wordWrap = this._wordWrap = true;
    this.wordWrapWidth = this._wordWrapWidth = 0;
    this.lineHeight = this._lineHeight = null;
    this.textBaseline = this._textBaseline = "alphabetic";
    this.textAlign = this._textAlign = "left";
    this.offsetY = this._offsetY = null;
    this.maxLines = this._maxLines = 0;
    this.maxLinesSuffix = this._maxLinesSuffix = "..";
    this.precision = this._precision = null;
    this.textColor = this._textColor = 0xffffffff;
    this.paddingLeft = this._paddingLeft = 0;
    this.paddingRight = this._paddingRight = 0;
    this.shadow = this._shadow = false;
    this.shadowColor = this._shadowColor = 0xff000000;
    this.shadowOffsetX = this._shadowOffsetX = 0;
    this.shadowOffsetY = this._shadowOffsetY = 0;
    this.shadowBlur = this._shadowBlur = 5;
    this.highlight = this._highlight = false;
    this.highlightHeight = this._highlightHeight = 0;
    this.highlightColor = this._highlightColor = 0xff000000;
    this.highlightOffset = this._highlightOffset = null;
    this.highlightPaddingLeft = this._highlightPaddingLeft = null;
    this.highlightPaddingRight = this._highlightPaddingRight = null;

    // Cut the canvas.
    this.cutSx = this._cutSx = 0;
    this.cutEx = this._cutEx = 0;
    this.cutSy = this._cutSy = 0;
    this.cutEy = this._cutEy = 0;

    // Flag that indicates if any property has changed.
    this.hasUpdates = false;
};

TextRendererSettings.prototype.set = function(obj) {
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
        var value = obj[keys[i]];
        this.setSetting(keys[i], value);
    }
};

TextRendererSettings.prototype.setSetting = function(name, value) {
    var setting = TextRendererSettings.SETTINGS[name];
    if (setting) {
        setting.s(this, value);
    } else {
        console.warn("Unknown text property: " + name);
    }
};

TextRendererSettings.prototype.getNonDefaults = function() {
    var nonDefaults = {};

    if (this.text !== "") nonDefaults['text'] = this.text;
    if (this.w !== 0) nonDefaults['w'] = 0;
    if (this.h !== 0) nonDefaults['h'] = 0;
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

    return nonDefaults;
};

TextRendererSettings.prototype.getTextureId = function() {
    var parts = [];

    if (this.w !== 0) parts.push("w " + this.w);
    if (this.h !== 0) parts.push("h " + this.h);
    if (this.fontStyle !== "normal") parts.push("fS" + this.fontStyle);
    if (this.fontSize !== 40) parts.push("fs" + this.fontSize);
    if (this.fontFace !== null) parts.push("ff" + (Utils.isArray(this.fontFace) ? this.fontFace.join(",") : this.fontFace));
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

    var id = "TX$" + parts.join("|") + ":" + this.text;
    return id;
};

TextRendererSettings.prototype.clone = function() {
    var t = new TextRendererSettings();
    t.set(this.getNonDefaults());
    return t;
};

TextRendererSettings.prototype.notifyUpdate = function() {
    this.hasUpdates = true;
};

Object.defineProperty(TextRendererSettings.prototype, 'text', {
    get: function () {
        return this._text;
    },
    set: function(v) {
        var pv = this._text;
        if (pv !== v) {
            this._text = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'w', {
    get: function () {
        return this._w;
    },
    set: function(v) {
        var pv = this._w;
        if (pv !== v) {
            this._w = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'h', {
    get: function () {
        return this._h;
    },
    set: function(v) {
        var pv = this._h;
        if (pv !== v) {
            this._h = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'fontStyle', {
    get: function () {
        return this._fontStyle;
    },
    set: function(v) {
        var pv = this._fontStyle;
        if (pv !== v) {
            this._fontStyle = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'fontSize', {
    get: function () {
        return this._fontSize;
    },
    set: function(v) {
        var pv = this._fontSize;
        if (pv !== v) {
            this._fontSize = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'fontFace', {
    get: function () {
        return this._fontFace;
    },
    set: function(v) {
        var pv = this._fontFace;
        if (pv !== v) {
            this._fontFace = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'wordWrap', {
    get: function () {
        return this._wordWrap;
    },
    set: function(v) {
        var pv = this._wordWrap;
        if (pv !== v) {
            this._wordWrap = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'wordWrapWidth', {
    get: function () {
        return this._wordWrapWidth;
    },
    set: function(v) {
        var pv = this._wordWrapWidth;
        if (pv !== v) {
            this._wordWrapWidth = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'lineHeight', {
    get: function () {
        return this._lineHeight;
    },
    set: function(v) {
        var pv = this._lineHeight;
        if (pv !== v) {
            this._lineHeight = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'textBaseline', {
    get: function () {
        return this._textBaseline;
    },
    set: function(v) {
        var pv = this._textBaseline;
        if (pv !== v) {
            this._textBaseline = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'textAlign', {
    get: function () {
        return this._textAlign;
    },
    set: function(v) {
        var pv = this._textAlign;
        if (pv !== v) {
            this._textAlign = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'offsetY', {
    get: function () {
        return this._offsetY;
    },
    set: function(v) {
        var pv = this._offsetY;
        if (pv !== v) {
            this._offsetY = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'maxLines', {
    get: function () {
        return this._maxLines;
    },
    set: function(v) {
        var pv = this._maxLines;
        if (pv !== v) {
            this._maxLines = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'maxLinesSuffix', {
    get: function () {
        return this._maxLinesSuffix;
    },
    set: function(v) {
        var pv = this._maxLinesSuffix;
        if (pv !== v) {
            this._maxLinesSuffix = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'precision', {
    get: function () {
        return this._precision;
    },
    set: function(v) {
        var pv = this._precision;
        if (pv !== v) {
            this._precision = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'textColor', {
    get: function () {
        return this._textColor;
    },
    set: function(v) {
        var pv = this._textColor;
        if (pv !== v) {
            this._textColor = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'paddingLeft', {
    get: function () {
        return this._paddingLeft;
    },
    set: function(v) {
        var pv = this._paddingLeft;
        if (pv !== v) {
            this._paddingLeft = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'paddingRight', {
    get: function () {
        return this._paddingRight;
    },
    set: function(v) {
        var pv = this._paddingRight;
        if (pv !== v) {
            this._paddingRight = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'shadow', {
    get: function () {
        return this._shadow;
    },
    set: function(v) {
        var pv = this._shadow;
        if (pv !== v) {
            this._shadow = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'shadowColor', {
    get: function () {
        return this._shadowColor;
    },
    set: function(v) {
        var pv = this._shadowColor;
        if (pv !== v) {
            this._shadowColor = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'shadowOffsetX', {
    get: function () {
        return this._shadowOffsetX;
    },
    set: function(v) {
        var pv = this._shadowOffsetX;
        if (pv !== v) {
            this._shadowOffsetX = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'shadowOffsetY', {
    get: function () {
        return this._shadowOffsetY;
    },
    set: function(v) {
        var pv = this._shadowOffsetY;
        if (pv !== v) {
            this._shadowOffsetY = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'shadowBlur', {
    get: function () {
        return this._shadowBlur;
    },
    set: function(v) {
        var pv = this._shadowBlur;
        if (pv !== v) {
            this._shadowBlur = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'highlight', {
    get: function () {
        return this._highlight;
    },
    set: function(v) {
        var pv = this._highlight;
        if (pv !== v) {
            this._highlight = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'highlightHeight', {
    get: function () {
        return this._highlightHeight;
    },
    set: function(v) {
        var pv = this._highlightHeight;
        if (pv !== v) {
            this._highlightHeight = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'highlightColor', {
    get: function () {
        return this._highlightColor;
    },
    set: function(v) {
        var pv = this._highlightColor;
        if (pv !== v) {
            this._highlightColor = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'highlightOffset', {
    get: function () {
        return this._highlightOffset;
    },
    set: function(v) {
        var pv = this._highlightOffset;
        if (pv !== v) {
            this._highlightOffset = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'highlightPaddingLeft', {
    get: function () {
        return this._highlightPaddingLeft;
    },
    set: function(v) {
        var pv = this._highlightPaddingLeft;
        if (pv !== v) {
            this._highlightPaddingLeft = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'highlightPaddingRight', {
    get: function () {
        return this._highlightPaddingRight;
    },
    set: function(v) {
        var pv = this._highlightPaddingRight;
        if (pv !== v) {
            this._highlightPaddingRight = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'cutSx', {
    get: function () {
        return this._cutSx;
    },
    set: function(v) {
        var pv = this._cutSx;
        if (pv !== v) {
            this._cutSx = Math.max(0, v);
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'cutEx', {
    get: function () {
        return this._cutEx;
    },
    set: function(v) {
        var pv = this._cutEx;
        if (pv !== v) {
            this._cutEx = Math.max(0, v);
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'cutSy', {
    get: function () {
        return this._cutSy;
    },
    set: function(v) {
        var pv = this._cutSy;
        if (pv !== v) {
            this._cutSy = Math.max(0, v);
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'cutEy', {
    get: function () {
        return this._cutEy;
    },
    set: function(v) {
        var pv = this._cutEy;
        if (pv !== v) {
            this._cutEy = Math.max(0, v);
            this.notifyUpdate();
        }
    }
});

TextRendererSettings.SETTINGS = {
    'text': {s: function(obj, v) {obj.text = v;}, m: null},
    'w': {s: function(obj, v) {obj.w = v;}, m: null},
    'h': {s: function(obj, v) {obj.h = v;}, m: null},
    'fontStyle': {s: function(obj, v) {obj.fontStyle = v;}, m: null},
    'fontSize': {s: function(obj, v) {
        obj.fontSize = v;
    }, m: null},
    'fontFace': {s: function(obj, v) {obj.fontFace = v;}, m: null},
    'wordWrap': {s: function(obj, v) {obj.wordWrap = v;}, m: null},
    'wordWrapWidth': {s: function(obj, v) {obj.wordWrapWidth = v;}, m: null},
    'lineHeight': {s: function(obj, v) {obj.lineHeight = v;}, m: null},
    'textBaseline': {s: function(obj, v) {obj.textBaseline = v;}, m: null},
    'textAlign': {s: function(obj, v) {obj.textAlign = v;}, m: null},
    'offsetY': {s: function(obj, v) {obj.offsetY = v;}, m: null},
    'maxLines': {s: function(obj, v) {obj.maxLines = v;}, m: null},
    'maxLinesSuffix': {s: function(obj, v) {obj.maxLinesSuffix = v;}, m: null},
    'precision': {s: function(obj, v) {obj.precision = v;}, m: null},
    'textColor': {s: function(obj, v) {obj.textColor = v;}, m: null},
    'paddingLeft': {s: function(obj, v) {obj.paddingLeft = v;}, m: null},
    'paddingRight': {s: function(obj, v) {obj.paddingRight = v;}, m: null},
    'shadow': {s: function(obj, v) {obj.shadow = v;}, m: null},
    'shadowColor': {s: function(obj, v) {obj.shadowColor = v;}, m: null},
    'shadowOffsetX': {s: function(obj, v) {obj.shadowOffsetX = v;}, m: null},
    'shadowOffsetY': {s: function(obj, v) {obj.shadowOffsetY = v;}, m: null},
    'shadowBlur': {s: function(obj, v) {obj.shadowBlur = v;}, m: null},
    'highlight': {s: function(obj, v) {obj.highlight = v;}, m: null},
    'highlightHeight': {s: function(obj, v) {obj.highlightHeight = v;}, m: null},
    'highlightColor': {s: function(obj, v) {obj.highlightColor = v;}, m: null},
    'highlightOffset': {s: function(obj, v) {obj.highlightOffset = v;}, m: null},
    'highlightPaddingLeft': {s: function(obj, v) {obj.highlightPaddingLeft = v;}, m: null},
    'highlightPaddingRight': {s: function(obj, v) {obj.highlightPaddingRight = v;}, m: null},
    'cutSx': {s: function(obj, v) {obj.cutSx = v;}, m: null},
    'cutEx': {s: function(obj, v) {obj.cutEx = v;}, m: null},
    'cutSy': {s: function(obj, v) {obj.cutSy = v;}, m: null},
    'cutEy': {s: function(obj, v) {obj.cutEy = v;}, m: null}
};


/**
 * A transition for some element.
 * @constructor
 */
function GenericTransition(v) {
    EventEmitter.call(this);

    this._delay = 0;
    this._duration = 1;
    this.timingFunction = 'ease';

    /**
     * @access private
     */
    this.delayLeft = 0;

    /**
     * @access private
     */
    this.p = 1;

    /**
     * @access private
     */
    this.startValue = v;

    /**
     * @access private
     */
    this.targetValue = this.startValue;

}

Utils.extendClass(GenericTransition, EventEmitter);

GenericTransition.prototype.reset = function(startValue, targetValue, p) {
    this.startValue = startValue;
    this.targetValue = targetValue;
    this.p = p;

    if (this.isActive()) {
        this.activate();
    } else if (p === 1) {
        this.setValue(this.getDrawValue());

        // Immediately invoke onFinish event.
        this.invokeListeners();
    }
};

GenericTransition.prototype.isActive = function() {
    return this.p < 1.0;
};

/**
 * Updates the target value and resets the transition.
 * @param targetValue
 * @param startValue
 */
GenericTransition.prototype.updateTargetValue = function(targetValue, startValue) {
    if (targetValue === startValue) {
        this.reset(startValue, targetValue, 1);
    } else {
        this.targetValue = targetValue;

        this.startValue = startValue;

        // Reset.
        this.p = 0;

        this.delayLeft = this.delay;

        if (this._eventsCount) this.emit('start');

        if (this.isActive()) {
            this.activate();
        }
    }
};

GenericTransition.prototype.activate = function() {
};

/**
 * Progress this transition.
 */
GenericTransition.prototype.progress = function(dt) {
    if (this.p < 1) {
        if (this.delayLeft > 0) {
            this.delayLeft -= dt;

            if (this.delayLeft < 0) {
                dt = -this.delayLeft;
                this.delayLeft = 0;

                if (this._eventsCount) this.emit('delayEnd');
            } else {
                return;
            }
        }

        if (this.duration == 0) {
            this.p = 1;
        } else {
            this.p += dt / this.duration;
        }
        if (this.p >= 1) {
            // Finished!
            this.p = 1;
        }
    }

    this.setValue(this.getDrawValue());

    this.invokeListeners();
};

GenericTransition.prototype.invokeListeners = function() {
    if (this._eventsCount) this.emit('progress', this.p);
    if (this.p === 1) {
        if (this._eventsCount) this.emit('finish');
    }
};

/**
 * Change current/target values while keeping the current transition ratio.
 */
GenericTransition.prototype.setValuesDynamic = function(targetValue, currentFinalValue) {
    var v = this._timingFunctionImpl(this.p);

    if (v == 1) {
        this.targetValue = targetValue;
    } else if (v == 0) {
        this.targetValue = targetValue;
        this.startValue = currentFinalValue;
        this.targetValue = targetValue;
    } else {
        // Calculate the would-be start value.
        this.targetValue = targetValue;
        this.targetValue = targetValue;
        this.startValue = targetValue - ((targetValue - currentFinalValue) / (1 - v));
    }
};

GenericTransition.prototype.set = function(settings) {
    var propNames = Object.keys(settings);
    for (var i = 0; i < propNames.length; i++) {
        var name = propNames[i];
        var v = settings[name];
        this.setSetting(name, v);
    }
};

GenericTransition.prototype.setSetting = function(name, value) {
    if (this[name] === undefined) {
        throw new TypeError('Unknown property:' + name);
    }
    this[name] = value;
};

GenericTransition.prototype.getProgress = function() {
    return this.p;
};

GenericTransition.prototype.getDrawValue = function() {
    if (this.p >= 1) {
        return this.targetValue;
    } else {
        var v = this._timingFunctionImpl(this.p);
        return this.getMergedValue(v);
    }
};

GenericTransition.prototype.setValue = function(v) {
};

GenericTransition.prototype.getMergedValue = function(v) {
    // Numeric merge. Inline for performance.
    return this.targetValue * v + this.startValue * (1 - v);
};

Object.defineProperty(GenericTransition.prototype, 'delay', {
    get: function() { return this._delay; },
    set: function(v) {
        if (!Utils.isNumber(v)) {
            throw new TypeError('delay must be a number');
        }
        this._delay = v;
    }
});

Object.defineProperty(GenericTransition.prototype, 'duration', {
    get: function() { return this._duration; },
    set: function(v) {
        if (!Utils.isNumber(v)) {
            throw new TypeError('duration must be a number');
        }
        this._duration = v;
    }
});

Object.defineProperty(GenericTransition.prototype, 'timingFunction', {
    get: function() { return this._timingFunction; },
    set: function(v) {
        if (v !== this._timingFunction) {
            this._timingFunction = v;
            this._timingFunctionImpl = StageUtils.getTimingFunction(v);
        }
    }
});



/**
 * A transition for some component property.
 * @constructor
 */
function Transition(component, property) {
    this.component = component;

    this.property = property;

    this.setting = Component.SETTINGS[property];

    GenericTransition.call(this, this.setting.g(this.component));

    /**
     * The merge function. If null then use plain numeric interpolation merge.
     * @type {Function}
     */
    this.mergeFunction = this.setting.m;

    this.valueSetterFunction = this.setting.sf;

}

Utils.extendClass(Transition, GenericTransition);

Transition.prototype.setValue = function(v) {
    this.valueSetterFunction(this.component, v);
};

Transition.prototype.getMergedValue = function(v) {
    return this.mergeFunction(this.targetValue, this.startValue, v);
};

Transition.prototype.activate = function() {
    this.component.stage.addActiveTransition(this);
};


/**
 * An animation.
 * @constructor
 */
function GenericAnimation(stage) {

    this.stage = stage;

    /**
     * @type {Component}
     */
    this._subject = null;

    this.actions = [];

    /**
     * @access private
     */
    this.p = 0;

    /**
     * Dummy for getFrameForProgress. Causes frame to be 0 when this is not a timed animation.
     * @type {number}
     */
    this.duration = 0;

}

GenericAnimation.prototype.set = function(settings) {
    var propNames = Object.keys(settings);
    for (var i = 0; i < propNames.length; i++) {
        var name = propNames[i];
        var v = settings[name];
        this.setSetting(name, v);
    }
};

GenericAnimation.prototype.setSetting = function(name, value) {
    switch(name) {
        case 'actions':
            this.actions = [];
            for (var i = 0, n = value.length; i < n; i++) {
                this.add(value[i]);
            }
            break;
        default:
            if (this[name] === undefined) {
                throw new TypeError('Unknown property:' + name);
            }
            this[name] = value;
    }
};

GenericAnimation.prototype.add = function(settings) {
    var e = new AnimationAction(this);
    e.set(settings);
    this.actions.push(e);
    return e;
};

GenericAnimation.prototype.remove = function(element) {
    var index = this.actions.indexOf(element);
    if (index >= 0) {
        this.actions.splice(index, 1);
    }
};

GenericAnimation.prototype.get = function(index) {
    return this.actions[index];
};

GenericAnimation.prototype.getProgress = function() {
    return this.p;
};

GenericAnimation.prototype.getFrameForProgress = function(p) {
    return Math.round(p * this.duration * 60);
};

GenericAnimation.prototype.applyTransforms = function() {
    var n = this.actions.length;
    for (var i = 0; i < n; i++) {
        this.actions[i].applyTransforms(this.p, 1);
    }
};

GenericAnimation.prototype.resetTransforms = function() {
    var n = this.actions.length;
    for (var i = 0; i < n; i++) {
        this.actions[i].resetTransforms();
    }
};

Object.defineProperty(GenericAnimation.prototype, 'subject', {
    get: function() { return this._subject; },
    set: function(v) {
        this._subject = v;
    }
});


/**
 * An action within an animation.
 * @constructor
 */
function AnimationAction(animation) {

    this.animation = animation;

    /**
     * The tags to which this transformation applies.
     * @type {string[]}
     */
    this._tags = [];

    /**
     * The value items, ordered by progress offset.
     * @type {AnimationActionItems}
     * @private
     */
    this._items = new AnimationActionItems(this);

    /**
     * The affected properties (names).
     * @type {{n: String, [s]: Function, [o]: String}[]}
     * @private
     */
    this._properties = [];

    /**
     * The value to reset to when stopping the timed animation.
     * @type {*}
     * @private
     */
    this._resetValue = null;

    this.hasResetValue = false;

    /**
     * Mergable function for values.
     * @type {Function}
     * @private
     */
    this.mergeFunction = null;

    // Default.
    this.tags = '';

}

/**
 * Returns the components to be animated.
 */
AnimationAction.prototype.getAnimatedComponents = function() {
    var n = this.tags.length;
    if (!this.animation.subject || !n) {
        return [];
    }

    if (n === 1) {
        if (this.tags[0] == '') {
            return [this.animation.subject];
        } else {
            return this.animation.subject.mtag(this.tags[0]);
        }
    } else {
        return this.getAnimatedMultiComponents();
    }
};

/**
 * Returns the components to be animated.
 */
AnimationAction.prototype.getAnimatedMultiComponents = function() {
    var i, n = this.tags.length, j, m;

    var taggedComponents = [];
    for (i = 0; i < n; i++) {
        if (this.tags[i] === '') {
            taggedComponents.push(this.animation.subject);
        } else {
            var comps = this.animation.subject.mtag(this.tags[i]);
            m = comps.length;
            for (j = 0; j < m; j++) {
                taggedComponents.push(comps[j]);
            }
        }
    }

    return taggedComponents;
};

AnimationAction.prototype.setValue = function(def) {
    this._items.parseDefinition(def);
};

AnimationAction.prototype.getItem = function(p) {
    var n = this._items.length;
    if (!n) {
        return null;
    }

    if (p < this._items[0].p) {
        return null;
    }

    for (var i = 0; i < n; i++) {
        if (this._items[i].p <= p && p < this._items[i].pe) {
            return this._items[i];
        }
    }

    return this._items[n - 1];
};

AnimationAction.prototype.getResetValue = function() {
    if (this.hasResetValue) {
        return this.resetValue;
    } else {
        if (this._items.length) {
            return this._items.lv[0];
        }
    }
    return 0;
};

AnimationAction.prototype.applyTransforms = function(m) {
    if (!this._properties.length) {
        return;
    }

    var c = this.getAnimatedComponents();
    if (!c.length) {
        return;
    }

    var v = this._items.getCurrentValue();

    if (v === undefined) {
        return;
    }

    if (m !== 1) {
        var sv = this.getResetValue();
        if (this.mergeFunction) {
            v = this.mergeFunction(v, sv, m);
        }
    }

    // Apply transformation to all components.
    var n = this._properties.length;

    var tcl = c.length;
    for (var i = 0; i < n; i++) {
        for (var j = 0; j < tcl; j++) {
            if (this._properties[i].s) {
                this._properties[i].s(c[j], v);
            }
        }
    }
};

AnimationAction.prototype.resetTransforms = function() {
    if (!this._properties.length) {
        return;
    }

    var v = this.getResetValue();

    // Apply transformation to all components.
    var n = this._properties.length;

    var c = this.getAnimatedComponents();
    var tcl = c.length;
    for (var i = 0; i < n; i++) {
        for (var j = 0; j < tcl; j++) {
            if (this._properties[i].s) {
                this._properties[i].s(c[j], v);
            }
        }
    }

};

AnimationAction.prototype.set = function(settings) {
    var propNames = Object.keys(settings);
    for (var i = 0; i < propNames.length; i++) {
        var name = propNames[i];
        var v = settings[name];
        this.setSetting(name, v);
    }
};

AnimationAction.prototype.setSetting = function(name, value) {
    switch(name) {
        case 'value':
        case 'v':
            this.value = value;
            break;
        default:
            if (this[name] === undefined) {
                throw new TypeError('Unknown property:' + name);
            }
            this[name] = value;
    }
};


Object.defineProperty(AnimationAction.prototype, 'tags', {
    get: function() { return this._tags; },
    set: function(v) {
        if (!Utils.isArray(v)) {
            v = [v];
        }
        this._tags = v;
    }
});

Object.defineProperty(AnimationAction.prototype, 'tag', {
    get: function() { return this.tags; },
    set: function(v) {
        this.tags = v;
    }
});

Object.defineProperty(AnimationAction.prototype, 't', {
    get: function() { return this.tags; },
    set: function(v) {
        this.tags = v;
    }
});

Object.defineProperty(AnimationAction.prototype, 'properties', {
    get: function() { return this._properties.map(function(p) {return p.name;}); },
    set: function(v) {
        var vs = v;
        if (!Utils.isArray(v)) {
            vs = [vs];
        }

        var properties = [];
        var n = vs.length;
        for (var i = 0; i < n; i++) {
            v = vs[i];

            if (!Utils.isString(v)) {
                throw new TypeError('property must be a string');
            }

            if (Component.propAliases.has(v)) {
                var aliases = Component.propAliases.get(v);
                for (var j = 0, m = aliases.length; j < m; j++) {
                    properties.push({n: aliases[j]});
                }
            } else {
                properties.push({n: v});
            }
        }

        this.mergeFunction = null;
        var mergeFunctionConflict = false;
        for (i = 0, n = properties.length; i < n; i++) {
            var p = properties[i];

            var name = p.n;

            var index = name.indexOf('.');
            if (index >= 0) {
                // Sub object.
                p.o = name.substr(0, index);
                p.n = name.substr(index + 1);
            } else {
                p.o = 'component';
            }

            var setting = null;
            switch(p.o) {
                case 'text':
                    setting = TextRendererSettings.SETTINGS[p.n];
                    if (setting) {
                        p.s = function(c, v) {
                            setting.s(c.text, v)
                        };
                    }
                    break;
                case 'displayedTexture':
                    setting = Texture.SETTINGS[p.n];
                    if (setting) {
                        p.s = function(c, v) {if (c.displayedTexture) {setting.s(c.displayedTexture, v)}};
                    }
                    break;
                case 'texture':
                    setting = Texture.SETTINGS[p.n];
                    if (setting) {
                        p.s = function(c, v) {if (c.texture) {setting.s(c.texture, v)}};
                    }
                    break;
                case 'component':
                    setting = Component.SETTINGS[p.n];
                    if (setting) {
                        p.s = setting.s;
                    }
                    break;
                default:
            }

            if (!setting) {
                console.error("Unknown animation property:" + (p.o ? p.o + "." : "") + p.n);
                properties.splice(i, 1);
                i--;
                n--;
                continue;
            }

            if (i == 0) {
                this.mergeFunction = setting.m;
            } else {
                if (setting.m !== this.mergeFunction) {
                    mergeFunctionConflict = true;
                }
            }
        }
        if (mergeFunctionConflict) {
            console.error("You can't mix mergable and non-mergable properties in an animation action (" + (properties.map(function(p) {return (p.o ? p.o + "." : "") + p.n;})).join(",") + ")");
            this.mergeFunction = null;
        }

        this._properties = properties;
    }
});

Object.defineProperty(AnimationAction.prototype, 'property', {
    get: function() { return this.properties; },
    set: function(v) {
        this.properties = v;
    }
});

Object.defineProperty(AnimationAction.prototype, 'p', {
    get: function() { return this.properties; },
    set: function(v) {
        this.properties = v;
    }
});

Object.defineProperty(AnimationAction.prototype, 'value', {
    set: function(v) {
        this.setValue(v);
    }
});

Object.defineProperty(AnimationAction.prototype, 'v', {
    set: function(v) {
        this.value = v;
    }
});

Object.defineProperty(AnimationAction.prototype, 'resetValue', {
    get: function() { return this._resetValue; },
    set: function(v) {
        this._resetValue = v;
        this.hasResetValue = true;
    }
});

Object.defineProperty(AnimationAction.prototype, 'rv', {
    get: function() { return this.resetValue; },
    set: function(v) {
        this.resetValue = v;
    }
});


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
    this.v.push(item.v || 0);
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



/**
 * An animation that is automatically progressed by time.
 * @constructor
 */
var Animation = function(stage) {
    GenericAnimation.call(this, stage);
    EventEmitter.call(this);

    this._delay = 0;

    /**
     * The duration of the animation, in seconds. If -1, the progress value should be set manually.
     * @type {number}
     */
    this._duration = 1;

    this._repeat = 0;
    this._repeatOffset = 0;
    this._repeatDelay = 0;

    /**
     * @access private
     */
    this.delayLeft = 0;

    /**
     * @access private
     */
    this.repeatsLeft = 0;

    /**
     * Automatically calls stop after finish.
     * @type {boolean}
     */
    this._autostop = false;

    /**
     * The way that the animation 'stops'.
     * @type {number}
     */
    this._stopMethod = Animation.STOP_METHODS.FADE;

    /**
     * Advanced options regarding the stop method, such as:
     * - {number} duration
     *   This overrules this animation's duration setting.
     * - {number} delay
     *   If specified, the stop starts delayed.
     * - {Function} timingFunction
     *   This overrules this animation's timing function.
     * @type {object}
     */
    this._stopMethodOptions = {};

    this.stopDelayLeft = 0;

    this.state = Animation.STATES.IDLE;

    this.stoppingProgressTransition = new GenericTransition(0);

};

Utils.extendClass(Animation, GenericAnimation);

Animation.prototype = Object.assign(Animation.prototype, EventEmitter.prototype);

Animation.prototype.isActive = function() {
    return this.subject && (this.state == Animation.STATES.PLAYING || this.state == Animation.STATES.STOPPING);
};

Animation.prototype.activate = function() {
    this.component.stage.addActiveAnimation(this);
};

Animation.prototype.progress = function(dt) {
    if (!this.subject) {
        return;
    }

    if (this.state == Animation.STATES.STOPPING) {
        this.stopProgress(dt);
        return;
    }

    if (this.state != Animation.STATES.PLAYING) {
        return;
    }

    if (this.delayLeft > 0) {
        this.delayLeft -= dt;

        if (this.delayLeft < 0) {
            dt = -this.delayLeft;
            this.delayLeft = 0;

            if (this._eventsCount) this.emit('delayEnd');
        } else {
            return;
        }
    }

    if (this.duration === 0) {
        this.p = 1;
    } else if (this.duration > 0) {
        this.p += dt / this.duration;
    }
    if (this.p >= 1) {
        // Finished!
        if (this.repeat == -1 || this.repeatsLeft > 0) {
            if (this.repeatsLeft > 0) {
                this.repeatsLeft--;
            }
            this.p = this.repeatOffset;

            if (this.repeatDelay) {
                this.delayLeft = this.repeatDelay;
            }

            if (this._eventsCount) this.emit('repeat', this.repeatsLeft);
        } else {
            this.p = 1;
            this.state = Animation.STATES.FINISHED;
            if (this._eventsCount) this.emit('finish');
            if (this.autostop) {
                this.stop();
            }
        }
    } else {
        if (this._eventsCount) this.emit('progress', this.p);
    }
};

Animation.prototype.stopProgress = function(dt) {
    var duration = this.stopMethodOptions.duration === undefined ? this.duration : this.stopMethodOptions.duration;

    if (this.delayLeft > 0) {
        // Animation wasn't even started yet: directly finish!
        this.state = Animation.STATES.STOPPED;
        if (this._eventsCount) this.emit('stopFinish');
    }

    if (this.stopDelayLeft > 0) {
        this.stopDelayLeft -= dt;

        if (this.stopDelayLeft < 0) {
            dt = -this.stopDelayLeft;
            this.stopDelayLeft = 0;

            if (this._eventsCount) this.emit('stopDelayEnd');
        } else {
            return;
        }
    }
    if (this.stopMethod == Animation.STOP_METHODS.IMMEDIATE) {
        this.state = Animation.STATES.STOPPED;
        if (this._eventsCount) this.emit('stop');
        if (this._eventsCount) this.emit('stopFinish');
    } else if (this.stopMethod == Animation.STOP_METHODS.REVERSE) {
        if (duration === 0) {
            this.p = 0;
        } else if (duration > 0) {
            this.p -= dt / duration;
        }

        if (this.p <= 0) {
            this.p = 0;
            this.state = Animation.STATES.STOPPED;
            if (this._eventsCount) this.emit('stopFinish');
        }
    } else if (this.stopMethod == Animation.STOP_METHODS.FADE) {
        this.stoppingProgressTransition.progress(dt);
        if (this.stoppingProgressTransition.p >= 1) {
            this.state = Animation.STATES.STOPPED;
            if (this._eventsCount) this.emit('stopFinish');
        }
    } else if (this.stopMethod == Animation.STOP_METHODS.ONETOTWO) {
        if (this.p < 2) {
            if (duration === 0) {
                this.p = 2;
            } else if (duration > 0) {
                if (this.p < 1) {
                    this.p += dt / this.duration;
                } else {
                    this.p += dt / duration;
                }
            }
            if (this.p >= 2) {
                this.p = 2;
                this.state = Animation.STATES.STOPPED;
                if (this._eventsCount) this.emit('stopFinish');
            } else {
                if (this._eventsCount) this.emit('progress', this.p);
            }
        }
    } else {
        if (this.p < 1) {
            if (duration == 0) {
                this.p = 1;
            } else {
                this.p += dt / duration;
            }
            if (this.p >= 1) {
                if (this.stopMethod == Animation.STOP_METHODS.FORWARD) {
                    this.p = 1;
                    this.state = Animation.STATES.STOPPED;
                    if (this._eventsCount) this.emit('stopFinish');
                } else {
                    if (this.repeatsLeft > 0) {
                        this.repeatsLeft--;
                        this.p = 0;
                        if (this._eventsCount) this.emit('repeat', this.repeatsLeft);
                    } else {
                        this.p = 1;
                        this.state = Animation.STATES.STOPPED;
                        if (this._eventsCount) this.emit('stopFinish');
                    }
                }
            } else {
                if (this._eventsCount) this.emit('progress', this.p);
            }
        }
    }
};

Animation.prototype.start = function() {
    this.p = 0;
    this.delayLeft = this.delay;
    this.repeatsLeft = this.repeat;
    this.state = Animation.STATES.PLAYING;
    if (this._eventsCount) this.emit('start');

    if (this.subject) {
        this.stage.addActiveAnimation(this);
    }
};

Animation.prototype.fastForward = function() {
    if (this.state === Animation.STATES.PLAYING) {
        this.delayLeft = 0;
        this.p = 1;
    } else if (this.state === Animation.STATES.STOPPING) {
        this.stopDelayLeft = 0;
        this.p = 0;
    }
};

Animation.prototype.play = function() {
    if (this.state == Animation.STATES.STOPPING && this.stopMethod == Animation.STOP_METHODS.REVERSE) {
        // Continue.
        this.state = Animation.STATES.PLAYING;
        if (this._eventsCount) this.emit('stopContinue');
    } else if (this.state != Animation.STATES.PLAYING && this.state != Animation.STATES.FINISHED) {
        // Restart.
        this.start();
    }
};

Animation.prototype.replay = function() {
    if (this.state == Animation.STATES.FINISHED) {
        this.start();
    } else {
        this.play();
    }
};

Animation.prototype.isPlaying = function() {
    return this.state === Animation.STATES.PLAYING;
};

Animation.prototype.isStopping = function() {
    return this.state === Animation.STATES.STOPPING;
};

Animation.prototype.skipDelay = function() {
    this.delayLeft = 0;
    this.stopDelayLeft = 0;
};

Animation.prototype.stop = function() {
    if (this.state === Animation.STATES.STOPPED || this.state === Animation.STATES.IDLE) return;

    if (this.subject) {
        this.stage.addActiveAnimation(this);
    }

    this.stopDelayLeft = this.stopMethodOptions.delay || 0;

    if ((this.stopMethod == Animation.STOP_METHODS.IMMEDIATE && !this.stopDelayLeft) || this.delayLeft > 0) {
        // Stop upon next progress.
        this.state = Animation.STATES.STOPPING;
        if (this._eventsCount) this.emit('stop');
    } else {
        if (this.stopMethod == Animation.STOP_METHODS.FADE) {
            if (this.stopMethodOptions.duration) {
                this.stoppingProgressTransition.duration = this.stopMethodOptions.duration;
            }
            if (this.stopMethodOptions.timingFunction) {
                this.stoppingProgressTransition.timingFunction = this.stopMethodOptions.timingFunction;
            }
            this.stoppingProgressTransition.reset(0, 1, 0);
        }

        this.state = Animation.STATES.STOPPING;
        if (this._eventsCount) this.emit('stop');
    }

};

Animation.prototype.stopNow = function() {
    if (this.state !== Animation.STATES.STOPPED || this.state !== Animation.STATES.IDLE) {
        this.state = Animation.STATES.STOPPING;
        this.p = 0;
        if (this._eventsCount) this.emit('stop');
        this.resetTransforms();
        this.state = Animation.STATES.STOPPED;
        if (this._eventsCount) this.emit('stopFinish');
    }
};


Animation.prototype.applyTransforms = function() {
    if (this.state == Animation.STATES.STOPPED) {
        // After being stopped, reset all values to their start positions.
        var n = this.actions.length;
        for (var i = 0; i < n; i++) {
            this.actions[i].resetTransforms();
        }
    } else {
        // Apply possible fade out effect.
        var factor = 1;
        if (this.state == Animation.STATES.STOPPING && this.stopMethod == Animation.STOP_METHODS.FADE) {
            factor = (1 - this.stoppingProgressTransition.getDrawValue());
        }

        var n = this.actions.length;
        for (var i = 0; i < n; i++) {
            this.actions[i].applyTransforms(factor);
        }
    }
};

Object.defineProperty(Animation.prototype, 'delay', {
    get: function() { return this._delay; },
    set: function(v) {
        if (!Utils.isNumber(v)) {
            throw new TypeError('delay must be a number');
        }
        this._delay = v;
    }
});

Object.defineProperty(Animation.prototype, 'repeatDelay', {
    get: function() { return this._repeatDelay; },
    set: function(v) {
        if (!Utils.isNumber(v)) {
            throw new TypeError('repeatDelay must be a number');
        }
        this._repeatDelay = v;
    }
});

Object.defineProperty(Animation.prototype, 'duration', {
    get: function() { return this._duration; },
    set: function(v) {
        if (!Utils.isNumber(v)) {
            throw new TypeError('duration must be a number');
        }
        this._duration = v;
    }
});

Object.defineProperty(Animation.prototype, 'repeat', {
    get: function() { return this._repeat; },
    set: function(v) {
        if (!Utils.isInteger(v) || v < -1) {
            throw new TypeError('repeat must be a positive integer, 0 or -1');
        }
        this._repeat = v;
    }
});

Object.defineProperty(Animation.prototype, 'repeatOffset', {
    get: function() { return this._repeatOffset; },
    set: function(v) {
        if (!Utils.isNumber(v) || v < 0) {
            throw new TypeError('repeatOffset must be a positive number');
        }
        this._repeatOffset = v;
    }
});

Object.defineProperty(Animation.prototype, 'stopMethod', {
    get: function() { return this._stopMethod; },
    set: function(v) {
        this._stopMethod = v;
    }
});

Object.defineProperty(Animation.prototype, 'autostop', {
    get: function() { return this._autostop; },
    set: function(v) {
        if (!Utils.isBoolean(v)) {
            throw new TypeError('autostop must be a boolean');
        }
        this._autostop = v;
    }
});

Object.defineProperty(Animation.prototype, 'stopMethodOptions', {
    get: function() { return this._stopMethodOptions; },
    set: function(v) {
        if (!Utils.isObject(v)) {
            throw new TypeError('stopMethodOptions must be an object');
        }
        this._stopMethodOptions = v;
    }
});

Object.defineProperty(Animation.prototype, 'subject', {
    get: function() { return this._subject; },
    set: function(subject) {
        if (subject !== this._subject) {
            if (this._subject) {
                this._subject.removeAnimation(this);
            }
            if (subject) {
                subject.addAnimation(this);
            }

            this._subject = subject;
            if (this.isActive()) {
                this.activate();
            }
        }
    }
});

Animation.STATES = {
    IDLE: 0,
    PLAYING: 1,
    STOPPING: 2,
    STOPPED: 3,
    FINISHED: 4
};

Animation.STOP_METHODS = {
    FADE: 'fade',
    REVERSE: 'reverse',
    FORWARD: 'forward',
    IMMEDIATE: 'immediate',
    ONETOTWO: 'onetotwo'
};


/**
 * The WebGL Renderer.
 * @constructor
 */
function Renderer(stage, w, h) {

    this.stage = stage;

    this.w = w;
    this.h = h;

    /**
     * @type {WebGLRenderingContext}
     */
    this.gl = stage.adapter.getWebGLRenderingContext(w, h);

    this.program = null;

    this.vertexShaderSrc = [
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

    this.fragmentShaderSrc = [
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
    this.projectionMatrix = new Float32Array([
        2/this.stage.renderWidth, 0, 0, 0,
        0, -2/this.stage.renderHeight, 0, 0,
        0, 0, 1, 0,
        -1, 1, 0, 1
    ]);

    this.paramsGlBuffer = null;

    this.program = null;

    this.vertexPositionAttribute = null;
    this.textureCoordAttribute = null;
    this.colorAttribute = null;

    this.indicesGlBuffer = null;

    /**
     * Drawn frames get assigned a number, so that we can check if we can memcopy the previous result.
     * @type {number}
     */
    this.frameCounter = 0;

    this.initShaderProgram();

}

Renderer.prototype.destroy = function() {
    this.gl.deleteFramebuffer(this.framebuffer);
    this.gl.deleteBuffer(this.paramsGlBuffer);
    this.gl.deleteBuffer(this.indicesGlBuffer);
    this.gl.deleteProgram(this.program);
};

/**
 * @access private
 */
Renderer.prototype.initShaderProgram = function() {
    var gl = this.gl;

    var glVertShader = this.glCompile(gl.VERTEX_SHADER, this.vertexShaderSrc);
    var glFragShader = this.glCompile(gl.FRAGMENT_SHADER, this.fragmentShaderSrc);

    this.program = gl.createProgram();

    gl.attachShader(this.program, glVertShader);
    gl.attachShader(this.program, glFragShader);
    gl.linkProgram(this.program);

    // if linking fails, then log and cleanup
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        console.error('Error: Could not initialize shader.');
        console.error('gl.VALIDATE_STATUS', gl.getProgramParameter(this.program, gl.VALIDATE_STATUS));
        console.error('gl.getError()', gl.getError());

        // if there is a program info log, log it
        if (gl.getProgramInfoLog(this.program) !== '') {
            console.warn('Warning: gl.getProgramInfoLog()', gl.getProgramInfoLog(this.program));
        }

        gl.deleteProgram(this.program);
        this.program = null;
    }
    gl.useProgram(this.program);

    // clean up some shaders
    gl.deleteShader(glVertShader);
    gl.deleteShader(glFragShader);

    // Bind attributes.
    this.vertexPositionAttribute = gl.getAttribLocation(this.program, "aVertexPosition");
    this.textureCoordAttribute = gl.getAttribLocation(this.program, "aTextureCoord");
    this.colorAttribute = gl.getAttribLocation(this.program, "aColor");

    // Init webgl arrays.

    this.allIndices = new Uint16Array(100000);

    // fill the indices with the quads to draw.
    for (var i = 0, j = 0; i < Renderer.MAX_QUADS * 6; i += 6, j += 4) {
        this.allIndices[i] = j;
        this.allIndices[i + 1] = j + 1;
        this.allIndices[i + 2] = j + 2;
        this.allIndices[i + 3] = j;
        this.allIndices[i + 4] = j + 2;
        this.allIndices[i + 5] = j + 3;
    }

    this.paramsGlBuffer = gl.createBuffer();

    this.indicesGlBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesGlBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.allIndices, gl.STATIC_DRAW);

    // Set transformation matrix.
    var projectionMatrixAttribute = gl.getUniformLocation(this.program, "projectionMatrix");
    gl.uniformMatrix4fv(projectionMatrixAttribute, false, this.projectionMatrix);

};

Renderer.prototype.render = function() {
    var gl = this.gl;

    if (gl.isContextLost && gl.isContextLost()) {
        console.error('WebGL context lost');
        return;
    }

    // Draw the actual textures to screen.
    this.renderItems();
};

Renderer.prototype.renderItems = function() {
    var i, n;
    var gl = this.gl;

    var ctx = this.stage.adapter.getUComponentContext();

    this.stage.measureDetails && this.stage.timeStart('setup');
    // Set up WebGL program.
    gl.useProgram(this.program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0,0,this.w,this.h);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);

    // Clear screen.
    gl.clearColor(this.stage.glClearColor[0], this.stage.glClearColor[1], this.stage.glClearColor[2], this.stage.glClearColor[3]);
    gl.clear(gl.COLOR_BUFFER_BIT);
    this.stage.measureDetails && this.stage.timeEnd('setup');

    this.stage.measureDetails && this.stage.timeStart('buffer');
    var view = new DataView(ctx.getVboParamsBuffer(), 0, ctx.getVboIndex() * 4);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.paramsGlBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, view, gl.DYNAMIC_DRAW);
    this.stage.measureDetails && this.stage.timeEnd('buffer');
    var vboGlTextures = ctx.getVboGlTextures();
    var vboGlTextureRepeats = ctx.getVboGlTextureRepeats();
    var count = ctx.getVboGlTexturesCount();

    this.stage.measureDetails && this.stage.timeStart('renderGl');
    if (count) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.paramsGlBuffer);
        gl.vertexAttribPointer(this.vertexPositionAttribute, 2, gl.FLOAT, false, 16, 0);
        gl.vertexAttribPointer(this.textureCoordAttribute, 2, gl.UNSIGNED_SHORT, true, 16, 2 * 4);
        gl.vertexAttribPointer(this.colorAttribute, 4, gl.UNSIGNED_BYTE, true, 16, 3 * 4);

        gl.enableVertexAttribArray(this.vertexPositionAttribute);
        gl.enableVertexAttribArray(this.textureCoordAttribute);
        gl.enableVertexAttribArray(this.colorAttribute);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesGlBuffer);

        var pos = 0;
        for (i = 0; i < count; i++) {
            gl.bindTexture(gl.TEXTURE_2D, vboGlTextures[i]);
            gl.drawElements(gl.TRIANGLES, 6 * vboGlTextureRepeats[i], gl.UNSIGNED_SHORT, pos * 6 * 2);
            pos += vboGlTextureRepeats[i];
        }

        gl.disableVertexAttribArray(this.vertexPositionAttribute);
        gl.disableVertexAttribArray(this.textureCoordAttribute);
        gl.disableVertexAttribArray(this.colorAttribute);
    }
    this.stage.measureDetails && this.stage.timeEnd('renderGl');
};

/**
 * @access private
 */
Renderer.prototype.glCompile = function (type, src) {
    var shader = this.gl.createShader(type);

    this.gl.shaderSource(shader, src);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        console.log(this.gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
};

/**
 * Max number of quads that can be rendered in one frame.
 * The memory usage is 64B * Renderer.MAX_QUADS.
 * Notice that this may never be higher than (65536 / 4)|0 due to index buffer limitations.
 * @note if a sprite is being clipped or has borders, it may use more than 1 quad.
 * @type {number}
 */
Renderer.MAX_QUADS = (65536 / 4)|0;


var UComponent = function(ctx) {
    this.ctx = ctx;

    this.parent = null;

    this.hasUpdates = false;

    this.recalc = 0;

    this.worldAlpha = 1;

    this.updateTreeOrder = 0;

    this.hasBorders = false;

    this.hasChildren = false;

    // All local translation/transform updates: directly propagated from x/y/w/h/scale/whatever.
    this.worldPx = this.localPx = 0;
    this.worldPy = this.localPy = 0;

    this.worldTa = this.localTa = 1;
    this.worldTb = this.localTb = 0;
    this.worldTc = this.localTc = 0;
    this.worldTd = this.localTd = 1;

    this.isComplex = false;

    this.localAlpha = 1;

    this.children = [];

    this.w = 0;
    this.h = 0;

    this.clipping = false;
    this.clippingParent = null;

    /**
     * In case of clipping, this flag indicates if we're dealing with a square-shaped clipping area.
     * @type {boolean}
     */
    this.clippingSquare = false;

    this.clippingSquareMinX = 0;
    this.clippingSquareMaxX = 0;
    this.clippingSquareMinY = 0;
    this.clippingSquareMaxY = 0;

    /**
     * Flag that indicates that clipping area is empty.
     * @type {boolean}
     */
    this.clippingEmpty = false;

    /**
     * Flag that indicates that the clipping area are the corner points.
     * @type {boolean}
     */
    this.clippingNoEffect = false;

    /**
     * In case of complex clipping, the corner points of the clipping area.
     * @type {number[]}
     */
    this.clippingArea = null;

    /**
     * The texture source to be displayed.
     * @type {TextureSource}
     */
    this.displayedTextureSource = null;

    this.colorUl = this.colorUr = this.colorBl = this.colorBr = 0xFFFFFFFF;

    this.txCoordsUl = 0x00000000;
    this.txCoordsUr = 0x0000FFFF;
    this.txCoordsBr = 0xFFFFFFFF;
    this.txCoordsBl = 0xFFFF0000;

    this.ulx = 0;
    this.uly = 0;
    this.brx = 1;
    this.bry = 1;

    this.inTextureAtlas = false;

    this.zIndex = 0;
    this.forceZIndexContext = false;
    this.zContextUsage = 0;
    this.zParent = null;
    this.zIndexedChildren = [];
    this.zSort = false;

    this.borderTop = null;
    this.borderBottom = null;
    this.borderLeft = null;
    this.borderRight = null;

    this.isBorder = false;

    this.isRoot = false;

};

/**
 * @param {Number} type
 *   1: alpha
 *   2: translate
 *   4: transform
 *   8: clipping
 */
UComponent.prototype.setRecalc = function(type) {
    this.recalc |= type;

    if (this.worldAlpha) {
        this.ctx.staticStage = false;
        var p = this;
        do {
            p.hasUpdates = true;
        } while((p = p.parent) && !p.hasUpdates);
    } else {
        this.hasUpdates = true;
    }
};

UComponent.prototype.setRecalcForced = function(type, force) {
    this.recalc |= type;

    if (this.worldAlpha || force) {
        this.ctx.staticStage = false;
        var p = this;
        do {
            p.hasUpdates = true;
        } while((p = p.parent) && !p.hasUpdates);
    } else {
        this.hasUpdates = true;
    }
};

UComponent.prototype.setParent = function(parent) {
    if (parent !== this.parent) {
        var prevIsZContext = this.isZContext();
        var prevParent = this.parent;
        this.parent = parent;
        this.setRecalc(1 + 2 + 4);

        if (this.zIndex === 0) {
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

        var newClippingParent = parent ? (parent.clipping ? parent : parent.clippingParent) : null;
        if (this.isBorder && newClippingParent === this.parent) {
            // Borders should not be clipped by the immediate parent.
            newClippingParent = newClippingParent.clippingParent;
        }

        if (newClippingParent !== this.clippingParent) {
            this.setClippingParent(newClippingParent);
        }
    }
};

UComponent.prototype.insertChild = function(index, child) {
    this.children.splice(index, 0, child);
    this.hasChildren = true;
    child.setParent(this);
};

UComponent.prototype.removeChild = function(index) {
    var child = this.children[index];
    this.children.splice(index, 1);
    this.hasChildren = (this.children.length > 0);
    child.setParent(null);
};

UComponent.prototype.clearChildren = function() {
    for (var i = 0, n = this.children.length; i < n; i++) {
        this.children[i].setParent(null);
    }

    this.children.splice(0);
    this.zIndexedChildren.splice(0);

    this.hasChildren = false;
};

UComponent.prototype.setLocalTransform = function(a, b, c, d) {
    this.setRecalc(4);
    this.localTa = a;
    this.localTb = b;
    this.localTc = c;
    this.localTd = d;
    this.isComplex = (b != 0) || (c != 0);
};

UComponent.prototype.setLocalTranslate = function(x, y) {
    this.setRecalc(2);
    this.localPx = x;
    this.localPy = y;
};

UComponent.prototype.addLocalTranslate = function(x, y) {
    this.setRecalc(2);
    this.localPx += x;
    this.localPy += y;
};

UComponent.prototype.setLocalAlpha = function(a) {
    this.setRecalcForced(1, (this.parent && this.parent.worldAlpha) && a);
    this.localAlpha = a;
};

UComponent.prototype.setDimensions = function(w, h) {
    this.w = w;
    this.h = h;
    this.setRecalc(2);

    // Border updates.
    this.updateBorderDimensions();

};

UComponent.prototype.updateBorderDimensions = function() {
    var blw = 0, brw = 0;
    if (this.borderLeft !== null) {
        this.borderLeft.setDimensions(this.borderLeft.w, this.h);
        this.borderLeft.setLocalTranslate(-this.borderLeft.w, 0);
        blw = this.borderLeft.w;
    }

    if (this.borderRight !== null) {
        this.borderRight.setDimensions(this.borderRight.w, this.h);
        this.borderRight.setLocalTranslate(this.w, 0);
        brw = this.borderRight.w;
    }

    if (this.borderTop !== null) {
        this.borderTop.setDimensions(this.w + blw + brw, this.borderTop.h);
        this.borderTop.setLocalTranslate(0 - blw, -this.borderTop.h);
    }

    if (this.borderBottom !== null) {
        this.borderBottom.setDimensions(this.w + blw + brw, this.borderBottom.h);
        this.borderBottom.setLocalTranslate(0 - blw, this.h);
    }
};

UComponent.prototype.setTextureCoords = function(ulx, uly, brx, bry) {
    if (this.worldAlpha) this.ctx.staticStage = false;

    this.ulx = ulx;
    this.uly = uly;
    this.brx = brx;
    this.bry = bry;

    this.txCoordsUl = ((ulx * 65535 + 0.5)|0) + ((uly * 65535 + 0.5)|0) * 65536;
    this.txCoordsUr = ((brx * 65535 + 0.5)|0) + ((uly * 65535 + 0.5)|0) * 65536;
    this.txCoordsBl = ((ulx * 65535 + 0.5)|0) + ((bry * 65535 + 0.5)|0) * 65536;
    this.txCoordsBr = ((brx * 65535 + 0.5)|0) + ((bry * 65535 + 0.5)|0) * 65536;
};

UComponent.prototype.setDisplayedTextureSource = function(textureSource) {
    if (this.worldAlpha) this.ctx.staticStage = false;
    this.displayedTextureSource = textureSource;
};

UComponent.prototype.setInTextureAtlas = function(inTextureAtlas) {
    if (this.worldAlpha) this.ctx.staticStage = false;

    this.inTextureAtlas = inTextureAtlas;
};

UComponent.prototype.setAsRoot = function() {
    // Use parent dummy.
    this.parent = new UComponent();

    // Root is, and will always be, the primary zContext.
    this.isRoot = true;

    this.ctx.root = this;
};

UComponent.prototype.isAncestorOf = function(c) {
    var p = c;
    while(p = p.parent) {
        if (this === p) {
            return true;
        }
    }
    return false;
};

UComponent.prototype.isZContext = function() {
    return (this.forceZIndexContext || this.zIndex !== 0 || this.isRoot || !this.parent);
};

UComponent.prototype.findZContext = function() {
    if (this.isZContext()) {
        return this;
    } else {
        return this.parent.findZContext();
    }
};

UComponent.prototype.setZParent = function(newZParent) {
    if (this.zParent !== newZParent) {
        if (this.zParent !== null) {
            // @pre: old parent's children array has already been modified.
            if (this.zIndex !== 0) {
                this.zParent.decZContextUsage();
            }

            if (this.zParent.zContextUsage > 0) {
                var index = this.zParent.zIndexedChildren.indexOf(this);
                this.zParent.zIndexedChildren.splice(index, 1);
            }
        }

        if (newZParent !== null) {
            // @pre: new parent's children array has already been modified.
            if (this.zIndex !== 0) {
                newZParent.incZContextUsage();
            }

            if (newZParent.zContextUsage > 0) {
                newZParent.zIndexedChildren.push(this);
                newZParent.zSort = true;
            }
        }

        this.zParent = newZParent;
    }
};

UComponent.prototype.incZContextUsage = function() {
    this.zContextUsage++;
    if (this.zContextUsage === 1) {
        // Copy.
        for (var i = 0, n = this.children.length; i < n; i++) {
            this.zIndexedChildren.push(this.children[i]);
        }
    }
};

UComponent.prototype.decZContextUsage = function() {
    this.zContextUsage--;
    if (this.zContextUsage === 0) {
        this.zSort = false;
        this.zIndexedChildren.splice(0);
    }
};

UComponent.prototype.setZIndex = function(zIndex) {
    if (this.worldAlpha) this.ctx.staticStage = false;

    var newZParent = this.zParent;

    var prevIsZContext = this.isZContext();
    if (zIndex === 0 && this.zIndex !== 0) {
        if (this.parent === this.zParent) {
            this.zParent.decZContextUsage();
        } else {
            newZParent = this.parent;
        }
    } else if (zIndex !== 0 && this.zIndex === 0) {
        newZParent = this.parent ? this.parent.findZContext() : null;
        if (newZParent === this.zParent) {
            if (this.zParent) {
                this.zParent.incZContextUsage();
                this.zParent.zSort = true;
            }
        }
    } else if (zIndex !== this.zIndex) {
        this.zParent.zSort = true;
    }

    if (newZParent !== this.zParent) {
        this.setZParent(null);
    }

    this.zIndex = zIndex;

    if (newZParent !== this.zParent) {
        this.setZParent(newZParent);
    }

    if (prevIsZContext !== this.isZContext()) {
        if (!this.isZContext()) {
            this.disableZContext();
        } else {
            this.enableZContext(this.parent.findZContext());
        }
    }
};

UComponent.prototype.setForceZIndexContext = function(v) {
    if (this.worldAlpha) this.ctx.staticStage = false;

    var prevIsZContext = this.isZContext();
    this.forceZIndexContext = v;

    if (prevIsZContext !== this.isZContext()) {
        if (!this.isZContext()) {
            this.disableZContext();
        } else {
            this.enableZContext(this.parent.findZContext());
        }
    }
};

UComponent.prototype.enableZContext = function(prevZContext) {
    if (prevZContext.zContextUsage > 0) {
        var self = this;
        // Transfer from upper z context to this z context.
        prevZContext.zIndexedChildren.slice().forEach(function(c) {
            if (self.isAncestorOf(c) && c.zIndex !== 0) {
                c.setZParent(self);
            }
        });
    }
};

UComponent.prototype.disableZContext = function() {
    // Transfer from this z context to upper z context.
    if (this.zContextUsage > 0) {
        var newZParent = this.parent.findZContext();

        this.zIndexedChildren.slice().forEach(function(c) {
            if (c.zIndex !== 0) {
                c.setZParent(newZParent);
            }
        });
    }
};

UComponent.prototype.setClipping = function(clipping) {
    if (clipping !== this.clipping) {
        this.setRecalc(8);
        this.clipping = clipping;
        this.setChildrenClippingParent(clipping ? this : this.clippingParent);
    }
};

UComponent.prototype.setChildrenClippingParent = function(clippingParent) {
    for (var i = 0, n = this.children.length; i < n; i++) {
        this.children[i].setClippingParent(clippingParent);
    }
};

UComponent.prototype.setClippingParent = function(clippingParent) {
    if (this.clippingParent !== clippingParent) {
        this.setRecalc(8);

        this.clippingParent = clippingParent;
        if (!this.clipping) {
            for (var i = 0, n = this.children.length; i < n; i++) {
                this.children[i].setClippingParent(clippingParent);
            }
        }

        if (this.hasBorders) {
            if (this.borderTop) this.borderTop.setClippingParent(clippingParent);
            if (this.borderBottom) this.borderBottom.setClippingParent(clippingParent);
            if (this.borderLeft) this.borderLeft.setClippingParent(clippingParent);
            if (this.borderRight) this.borderRight.setClippingParent(clippingParent);
        }
    }
};

UComponent.prototype.setColorUl = function(color) {
    if (this.worldAlpha) this.ctx.staticStage = false;
    this.colorUl = color;
};

UComponent.prototype.setColorUr = function(color) {
    if (this.worldAlpha) this.ctx.staticStage = false;
    this.colorUr = color;
};

UComponent.prototype.setColorBl = function(color) {
    if (this.worldAlpha) this.ctx.staticStage = false;
    this.colorBl = color;
};

UComponent.prototype.setColorBr = function(color) {
    if (this.worldAlpha) this.ctx.staticStage = false;
    this.colorBr = color;
};

UComponent.prototype.setBorderTop = function(width, color) {
    if (this.worldAlpha) this.ctx.staticStage = false;
    if (this.borderTop === null) {
        this.borderTop = this.ctx.createUComponent();
        this.borderTop.isBorder = true;
        this.borderTop.setParent(this);
        this.borderTop.displayedTextureSource = this.ctx.rectangleTextureSource;

        // We assume that, if a texture atlas is being used, that the rectangle is in the upper left corner.
        this.borderTop.setTextureCoords(0, 0, 0, 0);
    }
    this.borderTop.setDimensions(this.w, width);
    this.borderTop.setLocalTranslate(0, -width);
    this.borderTop.colorUl = color;
    this.borderTop.colorUr = color;
    this.borderTop.colorBr = color;
    this.borderTop.colorBl = color;

    this.updateBorderDimensions();
    this.updateHasBorders();
};

UComponent.prototype.setBorderBottom = function(width, color) {
    if (this.worldAlpha) this.ctx.staticStage = false;
    if (this.borderBottom === null) {
        this.borderBottom = this.ctx.createUComponent();
        this.borderBottom.isBorder = true;
        this.borderBottom.setParent(this);
        this.borderBottom.displayedTextureSource = this.ctx.rectangleTextureSource;

        // We assume that, if a texture atlas is being used, that the rectangle is in the upper left corner.
        this.borderBottom.setTextureCoords(0, 0, 0, 0);
    }
    this.borderBottom.setDimensions(this.w, width);
    this.borderBottom.setLocalTranslate(0, this.h);
    this.borderBottom.colorUl = color;
    this.borderBottom.colorUr = color;
    this.borderBottom.colorBr = color;
    this.borderBottom.colorBl = color;

    this.updateBorderDimensions();
    this.updateHasBorders();
};

UComponent.prototype.setBorderLeft = function(width, color) {
    if (this.worldAlpha) this.ctx.staticStage = false;
    if (this.borderLeft === null) {
        this.borderLeft = this.ctx.createUComponent();
        this.borderLeft.isBorder = true;
        this.borderLeft.setParent(this);
        this.borderLeft.displayedTextureSource = this.ctx.rectangleTextureSource;

        // We assume that, if a texture atlas is being used, that the rectangle is in the upper left corner.
        this.borderLeft.setTextureCoords(0, 0, 0, 0);
    }
    this.borderLeft.setDimensions(width, this.h);
    this.borderLeft.setLocalTranslate(-width, 0);
    this.borderLeft.colorUl = color;
    this.borderLeft.colorUr = color;
    this.borderLeft.colorBr = color;
    this.borderLeft.colorBl = color;

    this.updateBorderDimensions();
    this.updateHasBorders();
};

UComponent.prototype.setBorderRight = function(width, color) {
    if (this.worldAlpha) this.ctx.staticStage = false;
    if (this.borderRight === null) {
        this.borderRight = this.ctx.createUComponent();
        this.borderRight.isBorder = true;
        this.borderRight.setParent(this);
        this.borderRight.displayedTextureSource = this.ctx.rectangleTextureSource;

        // We assume that, if a texture atlas is being used, that the rectangle is in the upper left corner.
        this.borderRight.setTextureCoords(0, 0, 0, 0);
    }
    this.borderRight.setDimensions(width, this.h);
    this.borderRight.setLocalTranslate(this.w, 0);
    this.borderRight.colorUl = color;
    this.borderRight.colorUr = color;
    this.borderRight.colorBr = color;
    this.borderRight.colorBl = color;

    this.updateBorderDimensions();
    this.updateHasBorders();
};

UComponent.prototype.updateHasBorders = function() {
    this.hasBorders = (this.borderTop !== null && this.borderTop.h)
        || (this.borderBottom !== null && this.borderBottom.h)
        || (this.borderLeft !== null && this.borderLeft.w)
        || (this.borderRight !== null && this.borderRight.w)
};

UComponent.prototype.update = function() {
    this.recalc |= this.parent.recalc;

    var forceUpdate = false;
    if (this.recalc & 1) {
        // If case of becoming invisible, we must update the children because they may be z-indexed.
        forceUpdate = this.worldAlpha && !(this.parent.worldAlpha && this.localAlpha);
        this.worldAlpha = this.parent.worldAlpha * this.localAlpha;

        if (this.worldAlpha < 1e-14 && this.worldAlpha > -1e-14) {
            // Due to rounding errors, the worldAlpha sometimes does not go to exactly 0. Correct this case
            // because a lot of things are dependent on the worldAlpha being 0 or not.
            this.worldAlpha = 0;
        }
    }

    if (this.worldAlpha || forceUpdate) {
        if (this.recalc & 6) {
            this.worldPx = this.parent.worldPx + this.localPx * this.parent.worldTa;
            this.worldPy = this.parent.worldPy + this.localPy * this.parent.worldTd;
        }

        if (this.recalc & 4) {
            this.worldTa = this.localTa * this.parent.worldTa;
            this.worldTb = this.localTd * this.parent.worldTb;
            this.worldTc = this.localTa * this.parent.worldTc;
            this.worldTd = this.localTd * this.parent.worldTd;

            if (this.isComplex) {
                this.worldTa += this.localTc * this.parent.worldTb;
                this.worldTb += this.localTb * this.parent.worldTa;
                this.worldTc += this.localTc * this.parent.worldTd;
                this.worldTd += this.localTb * this.parent.worldTc;
            }
        }

        if ((this.recalc & 6) && (this.parent.worldTb !== 0 || this.parent.worldTc !== 0)) {
            this.worldPx += this.localPy * this.parent.worldTb;
            this.worldPy += this.localPx * this.parent.worldTc;
        }

        if ((this.recalc & 14 /* 2 + 4 + 8 */) && (this.clippingParent || this.clipping)) {
            // We must calculate the clipping area.
            var c1x, c1y, c2x, c2y, c3x, c3y;

            var cp = this.clippingParent;
            if (cp && cp.clippingEmpty) {
                this.clippingEmpty = true;
                this.clippingArea = null;
                this.clippingNoEffect = false;
            } else {
                this.clippingNoEffect = false;
                this.clippingEmpty = false;
                this.clippingArea = null;
                if (cp) {
                    if (cp.clippingSquare && (this.worldTb === 0 && this.worldTc === 0 && this.worldTa > 0 && this.worldTd > 0)) {
                        // Special case: 'easy square clipping'.
                        this.clippingSquare = true;

                        c2x = this.worldPx + this.w * this.worldTa;
                        c2y = this.worldPy + this.h * this.worldTd;

                        this.clippingSquareMinX = this.worldPx;
                        this.clippingSquareMaxX = c2x;
                        this.clippingSquareMinY = this.worldPy;
                        this.clippingSquareMaxY = c2y;

                        if ((this.clippingSquareMinX >= cp.clippingSquareMinX) && (this.clippingSquareMaxX <= cp.clippingSquareMaxX) && (this.clippingSquareMinY >= cp.clippingSquareMinY) && (this.clippingSquareMaxY <= cp.clippingSquareMaxY)) {
                            // No effect.
                            this.clippingNoEffect = true;

                            if (this.clipping) {
                                this.clippingSquareMinX = this.worldPx;
                                this.clippingSquareMaxX = c2x;
                                this.clippingSquareMinY = this.worldPy;
                                this.clippingSquareMaxY = c2y;
                            }
                        } else {
                            this.clippingSquareMinX = Math.max(this.clippingSquareMinX, cp.clippingSquareMinX);
                            this.clippingSquareMaxX = Math.min(this.clippingSquareMaxX, cp.clippingSquareMaxX);
                            this.clippingSquareMinY = Math.max(this.clippingSquareMinY, cp.clippingSquareMinY);
                            this.clippingSquareMaxY = Math.min(this.clippingSquareMaxY, cp.clippingSquareMaxY);
                            if (this.clippingSquareMaxX < this.clippingSquareMinX || this.clippingSquareMaxY < this.clippingSquareMinY) {
                                this.clippingEmpty = true;
                            }
                        }
                    } else {
                        //c0x = this.worldPx;
                        //c0y = this.worldPy;
                        c1x = this.worldPx + this.w * this.worldTa;
                        c1y = this.worldPy + this.w * this.worldTc;
                        c2x = this.worldPx + this.w * this.worldTa + this.h * this.worldTb;
                        c2y = this.worldPy + this.w * this.worldTc + this.h * this.worldTd;
                        c3x = this.worldPx + this.h * this.worldTb;
                        c3y = this.worldPy + this.h * this.worldTd;

                        // Complex shape.
                        this.clippingSquare = false;
                        var cornerPoints = [this.worldPx, this.worldPy, c1x, c1y, c2x, c2y, c3x, c3y];

                        if (cp.clippingSquare && !cp.clippingArea) {
                            // We need a clipping area to use for intersection.
                            cp.clippingArea = [cp.clippingSquareMinX, cp.clippingSquareMinY, cp.clippingSquareMaxX, cp.clippingSquareMinY, cp.clippingSquareMaxX, cp.clippingSquareMaxY, cp.clippingSquareMinX, cp.clippingSquareMaxY];
                        }

                        this.clippingArea = GeometryUtils.intersectConvex(cp.clippingArea, cornerPoints);
                        this.clippingEmpty = (this.clippingArea.length === 0);
                        this.clippingNoEffect = (cornerPoints === this.clippingArea);
                    }
                } else {
                    c1x = this.worldPx + this.w * this.worldTa;
                    c3y = this.worldPy + this.h * this.worldTd;

                    // Just use the corner points.
                    if (this.worldTb === 0 && this.worldTc === 0 && this.worldTa > 0 && this.worldTd > 0) {
                        // Square.
                        this.clippingSquare = true;
                        if (this.clipping) {
                            this.clippingSquareMinX = this.worldPx;
                            this.clippingSquareMaxX = c1x;
                            this.clippingSquareMinY = this.worldPy;
                            this.clippingSquareMaxY = c3y;
                        }
                        this.clippingEmpty = false;
                        this.clippingNoEffect = true;
                    } else {
                        c1y = this.worldPy + this.w * this.worldTc;
                        c2x = this.worldPx + this.w * this.worldTa + this.h * this.worldTb;
                        c2y = this.worldPy + this.w * this.worldTc + this.h * this.worldTd;
                        c3x = this.worldPx + this.h * this.worldTb;

                        // Complex shape.
                        this.clippingSquare = false;
                        if (this.clipping) {
                            this.clippingArea = [this.worldPx, this.worldPy, c1x, c1y, c2x, c2y, c3x, c3y];
                        }
                        this.clippingEmpty = false;
                        this.clippingNoEffect = true;
                    }
                }
            }
        }

        if (!this.ctx.useZIndexing) {
            // Use single pass.
            if (this.displayedTextureSource) {
                this.addToVbo();
            }
        } else {
            this.updateTreeOrder = this.ctx.updateTreeOrder++;
        }

        // Clear before calling children, to allow them to reset the hasUpdates flags in case of texture atlas failure.
        this.hasUpdates = false;

        this.recalc = (this.recalc & 7); /* 1+2+4 */

        if (this.hasBorders) {
            if (this.borderTop !== null && this.borderTop.h) {
                this.borderTop.update();
            }

            if (this.borderBottom !== null && this.borderBottom.h) {
                this.borderBottom.update();
            }

            if (this.borderLeft !== null && this.borderLeft.w) {
                this.borderLeft.update();
            }

            if (this.borderRight !== null && this.borderRight.w) {
                this.borderRight.update();
            }
        }

        if (this.hasChildren) {
            for (var i = 0, n = this.children.length; i < n; i++) {
                if (this.recalc || this.children[i].hasUpdates) {
                    this.children[i].update();
                } else if (!this.ctx.useZIndexing) {
                    this.children[i].fillVbo();
                }
            }
        }

        this.recalc = 0;
    }
};

UComponent.prototype.sortZIndexedChildren = function() {
    // Insertion sort works best for almost correctly ordered arrays.
    for (var i = 1, n = this.zIndexedChildren.length; i < n; i++) {
        var a = this.zIndexedChildren[i];
        var j = i - 1;
        while (j >= 0) {
            var b = this.zIndexedChildren[j];
            if (!(a.zIndex === b.zIndex ? (a.updateTreeOrder < b.updateTreeOrder) : (a.zIndex < b.zIndex))) {
                break;
            }

            this.zIndexedChildren[j+1] = this.zIndexedChildren[j];
            j--;
        }

        this.zIndexedChildren[j+1] = a;
    }
};

UComponent.prototype.addToVbo = function() {
    var vboIndex = this.ctx.vboIndex;
    var vboBufferFloat = this.ctx.vboBufferFloat;
    var vboBufferUint = this.ctx.vboBufferUint;

    if (this.clippingParent && !this.clippingNoEffect) {
        if (!this.clippingEmpty) {
            this.addToVboClipped();
        }
    } else {
        if (this.worldTb !== 0 || this.worldTc !== 0) {
            if (vboIndex < 262144) {
                vboBufferFloat[vboIndex++] = this.worldPx;
                vboBufferFloat[vboIndex++] = this.worldPy;
                vboBufferUint[vboIndex++] = this.txCoordsUl; // Texture.
                vboBufferUint[vboIndex++] = getColorInt(this.colorUl, this.worldAlpha);
                vboBufferFloat[vboIndex++] = this.worldPx + this.w * this.worldTa;
                vboBufferFloat[vboIndex++] = this.worldPy + this.w * this.worldTc;
                vboBufferUint[vboIndex++] = this.txCoordsUr;
                vboBufferUint[vboIndex++] = getColorInt(this.colorUr, this.worldAlpha);
                vboBufferFloat[vboIndex++] = this.worldPx + this.w * this.worldTa + this.h * this.worldTb;
                vboBufferFloat[vboIndex++] = this.worldPy + this.w * this.worldTc + this.h * this.worldTd;
                vboBufferUint[vboIndex++] = this.txCoordsBr;
                vboBufferUint[vboIndex++] = getColorInt(this.colorBr, this.worldAlpha);
                vboBufferFloat[vboIndex++] = this.worldPx + this.h * this.worldTb;
                vboBufferFloat[vboIndex++] = this.worldPy + this.h * this.worldTd;
                vboBufferUint[vboIndex++] = this.txCoordsBl;
                vboBufferUint[vboIndex++] = getColorInt(this.colorBl, this.worldAlpha);
                this.ctx.addVboTextureSource(this, 1);
            }
        } else {
            // Simple.
            var cx = this.worldPx + this.w * this.worldTa;
            var cy = this.worldPy + this.h * this.worldTd;

            if (vboIndex < 262144) {
                vboBufferFloat[vboIndex++] = this.worldPx;
                vboBufferFloat[vboIndex++] = this.worldPy;
                vboBufferUint[vboIndex++] = this.txCoordsUl; // Texture.
                vboBufferUint[vboIndex++] = getColorInt(this.colorUl, this.worldAlpha);
                vboBufferFloat[vboIndex++] = cx;
                vboBufferFloat[vboIndex++] = this.worldPy;
                vboBufferUint[vboIndex++] = this.txCoordsUr;
                vboBufferUint[vboIndex++] = getColorInt(this.colorUr, this.worldAlpha);
                vboBufferFloat[vboIndex++] = cx;
                vboBufferFloat[vboIndex++] = cy;
                vboBufferUint[vboIndex++] = this.txCoordsBr;
                vboBufferUint[vboIndex++] = getColorInt(this.colorBr, this.worldAlpha);
                vboBufferFloat[vboIndex++] = this.worldPx;
                vboBufferFloat[vboIndex++] = cy;
                vboBufferUint[vboIndex++] = this.txCoordsBl;
                vboBufferUint[vboIndex++] = getColorInt(this.colorBl, this.worldAlpha);
                this.ctx.addVboTextureSource(this, 1);
            }
        }
    }
};

UComponent.prototype.addToVboClipped = function() {
    var vboIndex = this.ctx.vboIndex;
    var vboBufferFloat = this.ctx.vboBufferFloat;
    var vboBufferUint = this.ctx.vboBufferUint;

    // Gradients are not supported for clipped quads.
    var c = getColorInt(this.colorUl, this.worldAlpha);

    if (this.clippingSquare) {
        // Inverse matrix.
        var ux = this.w * this.worldTa;
        var vy = this.h * this.worldTd;

        var d = 1 / (ux * vy);
        var invTa = vy * d;
        var invTd = ux * d;

        // Get ranges from 0 to 1.
        var tx1 = invTa * (this.clippingSquareMinX - this.worldPx);
        var ty1 = invTd * (this.clippingSquareMinY - this.worldPy);
        var tx3 = invTa * (this.clippingSquareMaxX - this.worldPx);
        var ty3 = invTd * (this.clippingSquareMaxY - this.worldPy);

        // Calculate texture coordinates for clipped corner points.
        var tcx1 = this.ulx * (1 - tx1) + this.brx * tx1;
        var tcy1 = this.uly * (1 - ty1) + this.bry * ty1;
        var tcx3 = this.ulx * (1 - tx3) + this.brx * tx3;
        var tcy3 = this.uly * (1 - ty3) + this.bry * ty3;

        if (vboIndex < 262144) {
            vboBufferFloat[vboIndex++] = this.clippingSquareMinX;
            vboBufferFloat[vboIndex++] = this.clippingSquareMinY;
            vboBufferUint[vboIndex++] =  getVboTextureCoords(tcx1, tcy1);
            vboBufferUint[vboIndex++] = c;
            vboBufferFloat[vboIndex++] = this.clippingSquareMaxX;
            vboBufferFloat[vboIndex++] = this.clippingSquareMinY;
            vboBufferUint[vboIndex++] = getVboTextureCoords(tcx3, tcy1);
            vboBufferUint[vboIndex++] = c;
            vboBufferFloat[vboIndex++] = this.clippingSquareMaxX;
            vboBufferFloat[vboIndex++] = this.clippingSquareMaxY;
            vboBufferUint[vboIndex++] = getVboTextureCoords(tcx3, tcy3);
            vboBufferUint[vboIndex++] = c;
            vboBufferFloat[vboIndex++] = this.clippingSquareMinX;
            vboBufferFloat[vboIndex++] = this.clippingSquareMaxY;
            vboBufferUint[vboIndex++] = getVboTextureCoords(tcx1, tcy3);
            vboBufferUint[vboIndex++] = c;
            this.ctx.addVboTextureSource(this, 1);
        }
    } else {
        // Complex clipping.

        // Inverse matrix.
        ux = this.w * this.worldTa;
        var uy = this.w * this.worldTc;
        var vx = this.h * this.worldTb;
        vy = this.h * this.worldTd;

        d = 1 / (ux * vy - vx * uy);
        invTa = vy * d;
        var invTb = -vx * d;
        var invTc = -uy * d;
        invTd = ux * d;

        var n = Math.ceil(((this.clippingArea.length / 2) - 2) / 2);

        if (n === 1) {
            // Texture coordinates.
            tx1 = invTa * (this.clippingArea[0] - this.worldPx) + invTb * (this.clippingArea[1] - this.worldPy);
            ty1 = invTc * (this.clippingArea[0] - this.worldPx) + invTd * (this.clippingArea[1] - this.worldPy);
            var tx2 = invTa * (this.clippingArea[2] - this.worldPx) + invTb * (this.clippingArea[3] - this.worldPy);
            var ty2 = invTc * (this.clippingArea[2] - this.worldPx) + invTd * (this.clippingArea[3] - this.worldPy);
            tx3 = invTa * (this.clippingArea[4] - this.worldPx) + invTb * (this.clippingArea[5] - this.worldPy);
            ty3 = invTc * (this.clippingArea[4] - this.worldPx) + invTd * (this.clippingArea[5] - this.worldPy);

            // Check for polygon instead of quad.
            g = this.clippingArea.length <= 6 ? 4 : 6;
            var tx4 = invTa * (this.clippingArea[g] - this.worldPx) + invTb * (this.clippingArea[g + 1] - this.worldPy);
            var ty4 = invTc * (this.clippingArea[g] - this.worldPx) + invTd * (this.clippingArea[g + 1] - this.worldPy);

            if (vboIndex < 262144) {
                vboBufferFloat[vboIndex++] = this.clippingArea[0];
                vboBufferFloat[vboIndex++] = this.clippingArea[1];
                vboBufferUint[vboIndex++] =  getVboTextureCoords(this.ulx * (1 - tx1) + this.brx * tx1, this.uly * (1 - ty1) + this.bry * ty1);
                vboBufferUint[vboIndex++] = c;
                vboBufferFloat[vboIndex++] = this.clippingArea[2];
                vboBufferFloat[vboIndex++] = this.clippingArea[3];
                vboBufferUint[vboIndex++] = getVboTextureCoords(this.ulx * (1 - tx2) + this.brx * tx2, this.uly * (1 - ty2) + this.bry * ty2);
                vboBufferUint[vboIndex++] = c;
                vboBufferFloat[vboIndex++] = this.clippingArea[4];
                vboBufferFloat[vboIndex++] = this.clippingArea[5];
                vboBufferUint[vboIndex++] = getVboTextureCoords(this.ulx * (1 - tx3) + this.brx * tx3, this.uly * (1 - ty3) + this.bry * ty3);
                vboBufferUint[vboIndex++] = c;
                vboBufferFloat[vboIndex++] = this.clippingArea[g];
                vboBufferFloat[vboIndex++] = this.clippingArea[g + 1];
                vboBufferUint[vboIndex++] = getVboTextureCoords(this.ulx * (1 - tx4) + this.brx * tx4, this.uly * (1 - ty4) + this.bry * ty4);
                vboBufferUint[vboIndex++] = c;
                this.ctx.addVboTextureSource(this, 1);
            }
        } else {
            // Multiple quads.
            var g;
            for (var i = 0; i < n; i++) {
                var b = i * 4 + 2;
                g = b + 4;
                if (g >= this.clippingArea.length) {
                    // Roll-over: convert polygon to quad.
                    g -= 2;
                }

                // Texture coordinates.
                tx1 = invTa * (this.clippingArea[0] - this.worldPx) + invTb * (this.clippingArea[1] - this.worldPy);
                ty1 = invTc * (this.clippingArea[0] - this.worldPx) + invTd * (this.clippingArea[1] - this.worldPy);
                tx2 = invTa * (this.clippingArea[b] - this.worldPx) + invTb * (this.clippingArea[b+1] - this.worldPy);
                ty2 = invTc * (this.clippingArea[b] - this.worldPx) + invTd * (this.clippingArea[b+1] - this.worldPy);
                tx3 = invTa * (this.clippingArea[b+2] - this.worldPx) + invTb * (this.clippingArea[b+3] - this.worldPy);
                ty3 = invTc * (this.clippingArea[b+2] - this.worldPx) + invTd * (this.clippingArea[b+3] - this.worldPy);
                tx4 = invTa * (this.clippingArea[g] - this.worldPx) + invTb * (this.clippingArea[g+1] - this.worldPy);
                ty4 = invTc * (this.clippingArea[g] - this.worldPx) + invTd * (this.clippingArea[g+1] - this.worldPy);

                if (vboIndex < 262144) {
                    vboBufferFloat[vboIndex++] = this.clippingArea[0];
                    vboBufferFloat[vboIndex++] = this.clippingArea[1];
                    vboBufferUint[vboIndex++] =  getVboTextureCoords(this.ulx * (1 - tx1) + this.brx * tx1, this.uly * (1 - ty1) + this.bry * ty1);
                    vboBufferUint[vboIndex++] = c;
                    vboBufferFloat[vboIndex++] = this.clippingArea[b];
                    vboBufferFloat[vboIndex++] = this.clippingArea[b+1];
                    vboBufferUint[vboIndex++] = getVboTextureCoords(this.ulx * (1 - tx2) + this.brx * tx2, this.uly * (1 - ty2) + this.bry * ty2);
                    vboBufferUint[vboIndex++] = c;
                    vboBufferFloat[vboIndex++] = this.clippingArea[b+2];
                    vboBufferFloat[vboIndex++] = this.clippingArea[b+3];
                    vboBufferUint[vboIndex++] = getVboTextureCoords(this.ulx * (1 - tx3) + this.brx * tx3, this.uly * (1 - ty3) + this.bry * ty3);
                    vboBufferUint[vboIndex++] = c;
                    vboBufferFloat[vboIndex++] = this.clippingArea[g];
                    vboBufferFloat[vboIndex++] = this.clippingArea[g+1];
                    vboBufferUint[vboIndex++] = getVboTextureCoords(this.ulx * (1 - tx4) + this.brx * tx4, this.uly * (1 - ty4) + this.bry * ty4);
                    vboBufferUint[vboIndex++] = c;
                    this.ctx.addVboTextureSource(this, 1);
                }
            }
        }
    }
};

UComponent.prototype.fillVbo = function() {
    if (this.zSort) {
        this.sortZIndexedChildren();
        this.zSort = false;
    }

    if (this.worldAlpha) {
        if (this.displayedTextureSource) {
            this.addToVbo();
        }

        if (this.hasBorders) {
            if (this.borderTop !== null && this.borderTop.h) {
                this.borderTop.addToVbo();
            }

            if (this.borderBottom !== null && this.borderBottom.h) {
                this.borderBottom.addToVbo();
            }

            if (this.borderLeft !== null && this.borderLeft.w) {
                this.borderLeft.addToVbo();
            }

            if (this.borderRight !== null && this.borderRight.w) {
                this.borderRight.addToVbo();
            }
        }

        if (this.hasChildren) {
            if (this.zContextUsage) {
                for (var i = 0, n = this.zIndexedChildren.length; i < n; i++) {
                    this.zIndexedChildren[i].fillVbo();
                }
            } else {
                for (var i = 0, n = this.children.length; i < n; i++) {
                    this.children[i].fillVbo();
                }
            }
        }
    }
};

UComponent.prototype.getLocalTa = function() {
    return this.localTa;
};

UComponent.prototype.getLocalTb = function() {
    return this.localTb;
};

UComponent.prototype.getLocalTc = function() {
    return this.localTc;
};

UComponent.prototype.getLocalTd = function() {
    return this.localTd;
};

UComponent.prototype.getCornerPoints = function() {
    return [
        this.worldPx,
        this.worldPy,
        this.worldPx + this.w * this.worldTa,
        this.worldPy + this.w * this.worldTc,
        this.worldPx + this.w * this.worldTa + this.h * this.worldTb,
        this.worldPy + this.w * this.worldTc + this.h * this.worldTd,
        this.worldPx + this.h * this.worldTb,
        this.worldPy + this.h * this.worldTd
    ];
};


var getColorInt = function(c, alpha) {
    var a = ((c / 16777216 | 0) * alpha) | 0;
    return (((((c >> 16) & 0xff) * a) >> 8) & 0xff) +
        ((((c & 0xff00) * a) >> 8) & 0xff00) +
        (((((c & 0xff) << 16) * a) >> 8) & 0xff0000) +
        (a << 24);
};

var getVboTextureCoords = function(x, y) {
    return ((x * 65535 + 0.5)|0) + ((y * 65535 + 0.5)|0) * 65536;
};



var UComponentContext = function() {
    this.vboGlTextures = [];
    this.vboGlTextureRepeats = [];
    this.lastVboGlTexture = null;
    this.textureAtlasGlTexture = null;
    this.rectangleTextureSource = null;
    this.rectangleTextureSourceInTextureAtlas = false;

    this.vboParamsBuffer = new ArrayBuffer(16 * 4 * 16384 * 2);
    this.vboBufferFloat = new Float32Array(this.vboParamsBuffer);
    this.vboBufferUint = new Uint32Array(this.vboParamsBuffer);
    this.vboIndex = 0;

    this.n = 0;
    this.useZIndexing = false;

    this.root = null;

    this.updateTreeOrder = 0;

    this.staticStage = false;

    this.debugTextureAtlas = null;

};

UComponentContext.prototype.setStage = function(stage) {
    this.textureAtlasGlTexture = stage.textureAtlas ? stage.textureAtlas.texture : null;
    this.rectangleTextureSource = stage.getRectangleTexture().source;

    if (stage.debugTextureAtlas) {
        this.debugTextureAtlas = this.createUComponent();
        this.debugTextureAtlas.displayedTextureSource = this.rectangleTextureSource;
        this.debugTextureAtlas.setInTextureAtlas(true);
        var min = Math.min(stage.w, stage.h);
        this.debugTextureAtlas.setDimensions(min, min);
    }
};

UComponentContext.prototype.createUComponentForComponent = function(component) {
    return new UComponent(this);
};

UComponentContext.prototype.createUComponent = function() {
    return new UComponent(this);
};

UComponentContext.prototype.setDisplayedTextureSource = function(uComponent, textureSource) {
    uComponent.setDisplayedTextureSource(textureSource);
};

UComponentContext.prototype.reset = function() {
    this.vboIndex = 0;
    this.vboGlTextures = [];
    this.vboGlTextureRepeats = [];
    this.lastVboGlTexture = null;
    this.rectangleTextureSourceInTextureAtlas = this.rectangleTextureSource.inTextureAtlas;
    this.n = 0;
    this.updateTreeOrder = 0;
};

UComponentContext.prototype.addVboTextureSource = function(uComponent, repeat) {
    var glTexture;
    if (uComponent.isBorder) {
        glTexture = this.rectangleTextureSourceInTextureAtlas ? this.textureAtlasGlTexture : this.rectangleTextureSource.glTexture;
    } else {
        glTexture = uComponent.inTextureAtlas ? this.textureAtlasGlTexture : uComponent.displayedTextureSource.glTexture;
    }
    if (this.lastVboGlTexture !== glTexture) {
        this.vboGlTextures.push(glTexture);
        this.vboGlTextureRepeats.push(repeat);
        this.n++;
        this.lastVboGlTexture = glTexture;
    } else {
        this.vboGlTextureRepeats[this.n - 1] += repeat;
    }

    this.vboIndex += repeat * 16;
};

UComponentContext.prototype.getVboIndex = function() {
    return this.vboIndex;
};

UComponentContext.prototype.getVboParamsBuffer = function() {
    return this.vboParamsBuffer;
};

UComponentContext.prototype.getVboGlTextures = function() {
    return this.vboGlTextures;
};

UComponentContext.prototype.getVboGlTextureRepeats = function() {
    return this.vboGlTextureRepeats;
};

UComponentContext.prototype.getVboGlTexturesCount = function() {
    return this.vboGlTextures.length;
};

UComponentContext.prototype.updateAndFillVbo = function(useZIndexing) {
    var renderNeeded = !this.staticStage;
    if (!this.staticStage) {
        this.useZIndexing = useZIndexing;

        this.reset();
        this.root.update();

        if (this.useZIndexing) {
            // A secondary fill pass is required.
            this.root.fillVbo();
        }

        if (this.debugTextureAtlas) {
            this.debugTextureAtlas.addToVbo();
        }

        this.staticStage = true;
    }

    return renderNeeded;
};

Object.defineProperty(UComponentContext.prototype, 'staticStage', {
    get: function () {
        return this._staticStage;
    },
    set: function(v) {
        this._staticStage = v;
    }
});


var Tools = {};

Tools.getRoundRect = function(stage, w, h, radius, strokeWidth, strokeColor, fill, fillColor) {
    if (fill === undefined) fill = true;
    if (strokeWidth === undefined) strokeWidth = 0;

    var canvas = stage.adapter.getDrawingCanvas();
    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;

    var id = 'rect' + [w, h, radius, strokeWidth, strokeColor, fill ? 1 : 0, fillColor].join(",");
    return stage.texture(function(cb) {
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

        cb(null, canvas, {});
    }, {id: id});
};

var WebAdapter = function() {
    this.animationFunction = function() {};
    this.animationLoopStopped = false;
    this.canvas = null;

    this.uComponentContext = new UComponentContext();

    // Default: white background.
    this.glClearColor = [0, 0, 0, 0];
};

WebAdapter.prototype.init = function() {
    this.uComponentContext.setStage(this.stage);
};

WebAdapter.prototype.startAnimationLoop = function(f) {
    this.animationFunction = f || this.animationFunction;
    this.animationLoopStopped = false;
    this.loop();
};

WebAdapter.prototype.stopAnimationLoop = function() {
    this.animationLoopStopped = true;
};

WebAdapter.prototype.loop = function() {
    var self = this;
    var lp = function() {
        if (!self.animationLoopStopped) {
            self.animationFunction();
            requestAnimationFrame(lp);
        }
    };
    lp();
};

WebAdapter.prototype.uploadGlTexture = function(gl, textureSource, source) {
    if (source instanceof ImageData || source instanceof HTMLImageElement || source instanceof HTMLCanvasElement || source instanceof HTMLVideoElement) {
        // Web-specific data types.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    } else {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, textureSource.w, textureSource.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, source);
    }
};

WebAdapter.prototype.loadTextureSourceString = function(source, cb) {
    var image = new Image();
    if (!(source.substr(0,5) == "data:")) {
        // Base64.
        image.crossOrigin = "Anonymous";
    }
    image.onerror = function(err) {
        return cb(err);
    };
    image.onload = function() {
        cb(null, image, {renderInfo: {src: source}});
    };
    image.src = source;
};

WebAdapter.prototype.getHrTime = function() {
    return window.performance ? window.performance.now() : (new Date()).getTime();
};

WebAdapter.prototype.getWebGLRenderingContext = function(w, h) {
    var canvas;
    if (this.stage.reuseCanvas) {
        canvas = this.stage.reuseCanvas;
    } else {
        canvas = document.createElement('canvas');
    }

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
};

WebAdapter.prototype.getDrawingCanvas = function() {
    if (!this.textCanvas) {
        this.textCanvas = document.createElement('canvas');
    }
    return this.textCanvas;
};

WebAdapter.prototype.getUComponentContext = function() {
    return this.uComponentContext;
};

WebAdapter.prototype.nextFrame = function(swapBuffers) {
    /* WebGL blits automatically */
};

