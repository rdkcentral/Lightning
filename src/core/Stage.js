/**
 * Maintains and renders a tree structure of views.
 * Copyright Metrological, 2017
 */

let Utils = require('./Utils');
/*M¬*/let EventEmitter = require(Utils.isNode ? 'events' : '../browser/EventEmitter');/*¬M*/

class Stage extends EventEmitter {
    constructor(options) {
        super()

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
        opt('srcBasePath', null);
        opt('textureMemory', 18e6);
        opt('renderTextureMemory', 12e6);
        opt('glClearColor', [0, 0, 0, 0]);
        opt('defaultFontFace', 'Sans-Serif');
        opt('fixedDt', 0);
        opt('useTextureAtlas', false);
        opt('debugTextureAtlas', false);
        opt('precision', 1);
    }

    getRenderPrecision() {
        return this.options.precision;
    }

    init() {
        /*M¬*/if (!Utils.isNode) {/*¬M*/this.adapter = new WebAdapter();/*M¬*/}
        if (Utils.isNode) {this.adapter = new NodeAdapter();}/*¬M*/

        if (this.adapter.init) {
            this.adapter.init(this);
        }

        this.gl = this.adapter.createWebGLContext(this.options.w, this.options.h);

        this.setGlClearColor(this.options.glClearColor);

        this.frameCounter = 0;

        /*A¬*/
        this.transitions = new TransitionManager(this);
        this.animations = new AnimationManager(this);
        /*¬A*/

        this.textureManager = new TextureManager(this);

        this.ctx = new CoreContext(this);

        this.root = new View(this);
        this.root.w = this.options.w
        this.root.h = this.options.h

        this.root.setAsRoot();

        this.startTime = 0;
        this.currentTime = 0;
        this.dt = 0;

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

        self.adapter.startLoop();
    }

    destroy() {
        this.adapter.stopLoop();
        if (this.textureAtlas) {
            this.textureAtlas.destroy();
        }
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

    getCanvas() {
        return this.adapter.getWebGLCanvas()
    }

    getDrawingCanvas() {
        return this.adapter.getDrawingCanvas()
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
            this.textureManager.freeUnusedTextureSources();
        }

        this.emit('update');

        let changes = this.ctx.frame();

        this.adapter.nextFrame(changes);

        this.emit('frameEnd');

        this.frameCounter++;
    }

    forceRenderUpdate() {
        // Enfore re-rendering.
        if (this.root) {
            this.root._core._parent._hasRenderUpdates = true
        }
    }

    setGlClearColor(clearColor) {
        this.forceRenderUpdate()
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
        } else {
            view = new View(this);
        }

        view.patch(settings, true)

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
     *   - mw: number
     *     Max width (for within bounds texture loading)
     *   - mh: number
     *     Max height (for within bounds texture loading)
     *   - precision: number
     *     Render precision (0.5 = fuzzy, 1 = normal, 2 = sharp even when scaled twice, etc.).
     * @returns {Texture}
     */
    texture(source, options) {
        return this.textureManager.getTexture(source, options);
    }

    get w() {
        return this.options.w
    }

    get h() {
        return this.options.h
    }

    get rw() {
        return this.w / this.options.precision
    }

    get rh() {
        return this.h / this.options.precision
    }

}

let View = require('./View');
let StageUtils = require('./StageUtils');
let TextureManager = require('./TextureManager');
let CoreContext = require('./core/CoreContext');
/*A¬*/
let TransitionManager = require('../animation/TransitionManager');
let AnimationManager = require('../animation/AnimationManager');
/*¬A*//*M¬*/
let WebAdapter = Utils.isNode ? undefined : require('../browser/WebAdapter');
let NodeAdapter = Utils.isNode ? require('../node/NodeAdapter') : null;
/*¬M*/
module.exports = Stage;
