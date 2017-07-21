/**
 * Maintains and renders a tree structure of views.
 * Copyright Metrological, 2017
 */

let Base = require('./Base');

/**
 * @todo:
 * - convert UI(?)
 * - convert Bunnyhopper(?)
 * - convert TMDB(?)
 * - list subclasses View?
 * - quick clone
 * - hasAlpha in format, and try to prepare images for upload (so that we get buffer performance).
 * - borders
 * - change documentation
 *   - text2pngEndpoint
 *   - supercharger?
 *   - transition changes
 *   -getRenderWidth
 * - encapsulate tags branches (for isolating widgets)
 * - merger: isRgba? isNumeric?
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
        let view = this.createView();
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

let Utils = require('./Utils');

/*M¬*/let EventEmitter = require(Utils.isNode ? 'events' : '../browser/EventEmitter');/*¬M*/
Base.mixinEs5(Stage, EventEmitter);

let View = require('./View');
let StageUtils = require('./StageUtils');
let TextureManager = require('./TextureManager');
let Renderer = require('./Renderer');
let TextureAtlas = require('./TextureAtlas');
let VboContext = require('./VboContext');
/*A¬*/
let TransitionManager = require('../animation/TransitionManager');
let AnimationManager = require('../animation/AnimationManager');
/*¬A*//*M¬*/
let WebAdapter = Utils.isNode ? undefined : require('../browser/WebAdapter');
let NodeAdapter = Utils.isNode ? require('../node/NodeAdapter') : null;
/*¬M*/
module.exports = Stage;
