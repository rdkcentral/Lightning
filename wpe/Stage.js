var isNode = !!(((typeof module !== "undefined") && module.exports));

if (isNode) {
    var EventEmitter = require('events');
    var Utils = require('./Utils');
}

/**
 * Container for a tree structure of components.
 * @constructor
 */
function Stage(options, cb) {
    EventEmitter.call(this);

    this.adapter = options.adapter;
    if (!this.adapter) {
        if (isNode) {
            this.adapter = new NodeAdapter(options.window);
        }
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
    this.measureLongFrames = !!options.measureLongFrames;

    this.textureProcessWorkerPath = options.textureProcessWorkerPath || "";

    this.textureProcessTextServer = options.textureProcessTextServer || "";

    this.useTextureProcess = !!options.useTextureProcess && !!this.adapter.getTextureProcess;
    if (this.useTextureProcess) {
        this.textureProcess = this.adapter.getTextureProcess();
    }

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

    this.longFrameComponents = {lastFrameStart: 0, lastFrameEnd: 0, text: 0, uploadRaw: 0, uploadImage: 0};

    var self = this;

    // Adapter for text rendering for this stage.
    this.drawingCanvasFactory = function() {
        return self.adapter.getDrawingCanvas();
    };

    this.destroyed = false;

    // Start.
    this.init(cb);

}

Utils.extendClass(Stage, EventEmitter);

Stage.prototype.destroy = function() {
    this.adapter.stopAnimationLoop();
    if (this.useTextureAtlas) {
        this.textureAtlas.destroy();
    }
    if (this.textureProcess) {
        this.textureProcess.destroy();
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

Stage.prototype.getTextRendererAdapter = function() {
    return this.textRendererAdapter;
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

Stage.prototype.init = function(cb) {
    if (this.adapter.init) {
        this.adapter.init();
    }

    var self = this;

    // Preload rectangle texture, so that we can skip some border checks for loading textures.
    var rect = this.getRectangleTexture();
    var src = rect.source;
    src.onload = function() {
        src.permanent = true;
        if (self.useTextureAtlas) {
            self.textureAtlas.add(src);
        }

        if (self.useTextureProcess) {
            self.textureProcess.init(function(err) {
                if (err) {
                    console.warn('Error connecting to texture process. Textures will be loaded on the main thread.');
                }

                self.adapter.startAnimationLoop(function() {self.drawFrame();});
                if (cb) cb(self);
            });
        } else {
            self.adapter.startAnimationLoop(function() {self.drawFrame();});
            if (cb) cb(self);
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
    if (this.measureLongFrames) {
        this.logMeasureLongFrames();
    }

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

    if (this.measureLongFrames) {
        this.longFrameComponents.lastFrameEnd = this.getHrTime();
    }

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

Stage.prototype.logMeasureLongFrames = function() {
    // Wait between frames.

    var wait = 0;
    var total = 0;
    if (this.longFrameComponents.lastFrameEnd) {
        total = this.longFrameComponents.lastFrameEnd - this.longFrameComponents.lastFrameStart;

        this.longFrameComponents.lastFrameStart = this.getHrTime();
        wait = this.longFrameComponents.lastFrameStart - this.longFrameComponents.lastFrameEnd;
    } else {
        this.longFrameComponents.lastFrameStart = this.getHrTime();
    }

    var other = total - (this.longFrameComponents.text + this.longFrameComponents.uploadRaw + this.longFrameComponents.uploadImage);

    var amounts = ' [' + this.longFrameComponents.nText + ',' + this.longFrameComponents.nUploadRaw + ',' + this.longFrameComponents.nUploadImage + ']';
    console.log(
        amounts + this.repeatChar(' ', (12 - amounts.length)) +
        this.repeatChar("T", Math.round(this.longFrameComponents.text)) +
        this.repeatChar("R", Math.round(this.longFrameComponents.uploadRaw)) +
        this.repeatChar("I", Math.round(this.longFrameComponents.uploadImage)) +
        this.repeatChar("O", Math.round(other)) +
        this.repeatChar(".", Math.round(wait))
    );

    this.longFrameComponents.text = 0;
    this.longFrameComponents.uploadRaw = 0;
    this.longFrameComponents.uploadImage = 0;
    this.longFrameComponents.nText = 0;
    this.longFrameComponents.nUploadRaw = 0;
    this.longFrameComponents.nUploadImage = 0;
};

Stage.prototype.repeatChar = function(c, n) {
    str = "";
    for (var i = 0; i < n; i++) {
        str += c;
    }
    return str;
};

Stage.prototype.getHrTime = function() {
    return this.adapter.getHrTime();
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
 *   - precision: number
 *     Render precision (0.5 = fuzzy, 1 = normal, 2 = sharp even when scaled twice, etc.).
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

if (isNode) {
    module.exports = Stage;

    var NodeAdapter = require('../node/NodeAdapter');
    var Animation = require('./Animation');
    var Renderer = require('./Renderer');
    var TextureManager = require('./TextureManager');
    var TextureAtlas = require('./TextureAtlas');
    var StageUtils = require('./StageUtils');
    var Component = require('./Component');
}

