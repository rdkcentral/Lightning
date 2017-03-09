var isNode = !!(((typeof module !== "undefined") && module.exports));

if (isNode) {
    var NodeAdapter = require('../node/NodeAdapter');

    var Component = require('./Component');
    var TimedAnimation = require('./TimedAnimation');
    var Utils = require('./Utils');
    var Renderer = require('./Renderer');
    var TextureManager = require('./TextureManager');
    var TextureAtlas = require('./TextureAtlas');
    var EventType = require('./EventType');
    var StageUtils = require('./StageUtils');
    var CustomAnimation = require('./CustomAnimation');
}

/**
 * Container for a tree structure of components.
 * @constructor
 */
function Stage(options) {
    this.adapter = options.adapter;
    if (!this.adapter) {
        if (isNode) {
            this.adapter = new NodeAdapter();
        } else {
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

    this.onFrameStart = new EventType();
    this.onUpdate = new EventType();
    this.onFrameEnd = new EventType();

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
     * @type {{c : Component, p : Number}[]}
     */
    this.activeTransitions = [];

    /**
     * The currently active animations.
     * @type {Set<TimedAnimation>}
     */
    this.activeAnimations = new Set();

    this.measure = !!options.measure;
    this.measureDetails = !!options.measureDetails;

    // Measurement stuff.
    this.measureStart = {};
    this.measureTotalMs = {};
    this.measureMs = {};
    this.measureLastFrameCounter = {};
    this.measureCount = {};

    this.rectangleTexture = this.getTexture(Stage.rectangleSource.src, Stage.rectangleSource);

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

    // Start.
    this.init();

    this.destroyed = false;

}

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
        this.glClearColor = StageUtils.getRgbaComponents(clearColor);
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

Stage.prototype.pause = function() {
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

Stage.prototype.addActiveTransition = function(component, propertyIndex) {
    this.activeTransitions.push({c: component, p: propertyIndex});
};

Stage.prototype.removeActiveTransition = function(component, propertyIndex) {
    for (var i = 0, n = this.activeTransitions.length; i < n; i++) {
        if (this.activeTransitions[i].c === component && this.activeTransitions[i].p === propertyIndex) {
            var info = this.activeTransitions[i];
            info.c.transitions[info.p].setInactive();
            break;
        }
    }
    if (i < n) {
        this.activeTransitions.splice(i, 1);
    }
};

Stage.prototype.addActiveAnimation = function(a) {
    this.activeAnimations.add(a);
};

Stage.prototype.removeActiveAnimation = function(a) {
    this.activeAnimations.delete(a);

    // Clear tagged components to prevent memory leaks.
    a.taggedComponents = [];
    a.taggedComponentsForceRefresh = true;
};

Stage.prototype.drawFrame = function() {
    this.measure && this.timeStart('total');
    if (this.fixedDt) {
        this.dt = this.fixedDt;
    } else {
        this.dt = (!this.startTime) ? .02 : .001 * (this.currentTime - this.startTime);
    }
    this.startTime = this.currentTime;
    this.currentTime = (new Date()).getTime();

    this.measureDetails && this.timeStart('frame start');
    this.onFrameStart.trigger();
    this.measureDetails && this.timeEnd('frame start');
    this.state = Stage.STATES.TRANSITIONS;

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
    this.onUpdate.trigger();
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
    this.onFrameEnd.trigger();
    this.measureDetails && this.timeEnd('frame end');
    this.measure && this.timeEnd('total');

    this.frameCounter++;
};

Stage.prototype.progressTransitions = function() {
    var self = this;

    if (this.activeTransitions.length) {
        var renew = false;

        // Use clone to prevent event changes in the activeTransitions caused by event listeners to cause problems.
        for (var j = 0, m = this.activeTransitions.length; j < m; j++) {
            var info = this.activeTransitions[j];
            var component = info.c;
            var propertyIndex = info.p;
            var t = component.transitions[propertyIndex];
            if (t) {
                t.progress(self.dt);
                Component.propertySettersFinal[propertyIndex](component, t.lastResultValue);
                t.invokeListeners();

                if (!t.isActive()) {
                    t.setInactive();
                }
            }

            if (!t || !t.isActive()) {
                renew = true;
            }
        }

        if (renew) {
            var arr = [];
            for (j = 0, m = this.activeTransitions.length; j < m; j++) {
                info = this.activeTransitions[j];
                component = info.c;
                propertyIndex = info.p;
                t = component.transitions[propertyIndex];

                if (t && t.isActive()) {
                    arr.push(this.activeTransitions[j]);
                }
            }
            this.activeTransitions = arr;
        }
    }
};

Stage.prototype.progressAnimations = function() {
    var self = this;
    if (this.activeAnimations.size) {
        this.activeAnimations.forEach(function (animation) {
            animation.progress(self.dt);
            animation.updateComponents();
            animation.applyTransforms();
            if (!animation.isActive()) {
                animation.cleanUpCachedTaggedComponents();
                self.removeActiveAnimation(animation);
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
Stage.prototype.getTexture = function(source, options) {
    return this.textureManager.getTexture(source, options);
};

Stage.prototype.hasTexture = function(id) {
    return this.textureManager.hasTexture(id);
};

/**
 * Creates a new component.
 * @returns {Component}
 */
Stage.prototype.create = function(settings, children) {
    var component = new Component(this);

    if (children) {
        for (var i = 0; i < children.length; i++) {
            component.addChild(children[i]);
        }
    }
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

Stage.prototype.timedAnimation = function(settings, actions) {
    var a = new TimedAnimation(this);
    if (settings) {
        a.set(settings);
    }

    if (actions) {
        var n = actions.length;
        for (var i = 0; i < n; i++) {
            a.add(actions[i]);
        }
    }

    return a;
};

Stage.prototype.customAnimation = function(settings, actions) {
    var a = new CustomAnimation(this);
    if (settings) {
        a.set(settings);
    }

    if (actions) {
        var n = actions.length;
        for (var i = 0; i < n; i++) {
            a.add(actions[i]);
        }
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
    return cb(whitePixel, {w: 1, h: 1});
}, id:"__whitepix"};

Stage.W = 1280;
Stage.H = 720;

if (isNode) {
    module.exports = Stage;
}