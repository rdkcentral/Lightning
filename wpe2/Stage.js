/**
 * @todo:
 * - combine renderer & view
 * - use dummy parent? check performance.
 * - inspect.js
 * - hasAlpha in format, and try to prepare images for upload (so that we get buffer performance).
 * - nodejs
 * - nodejs texture loading
 * - encapsulate tags branches (for isolating widgets)
 * - merger: isRgba? isNumeric?
 * - debug texture atlas
 * - quick clone
 */
class Stage extends Base {
    constructor(options) {
        super();

        EventEmitter.call(this);

        this.setOptions(options);

        this.init();
    }

    setOptions(o) {
        this.options = {};

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
    }

    init() {
        this.adapter = new WebAdapter();

        if (this.adapter.init) {
            this.adapter.init(this);
        }

        this.canvas = this.options.canvas || this.adapter.createWebGLCanvas(this.options.w, this.options.h);

        this.gl = this.adapter.getWebGLRenderingContext(this.canvas);

        this.setGlClearColor(this.options.glClearColor);

        this.frameCounter = 0;

        try {
            // Animations are optional.
            this.transitions = new TransitionManager(this);
            this.animations = new AnimationManager(this);
            console.log('Animation subsystem enabled');
        } catch(e) { }

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
        return this.adapter.canvas;
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

        this.progressTransitions();
        this.progressAnimations();

        if (this.textureManager.isFull()) {
            console.log('clean up');
            this.textureManager.freeUnusedTextureSources();
        }

        this.emit('update');

        if (this.textureAtlas) {
            // Add new texture sources to the texture atlas.
            this.textureAtlas.flush();
        }

        if (!this.ctx.staticStage) {
            this.ctx.updateAndFillVbo(this.zIndexUsage > 0);

            // We will render the stage even if it's stable shortly after importing a texture in the texture atlas, to prevent out-of-syncs.
            this.measureDetails && this.timeStart('render');
            this.renderer.render();
            this.measureDetails && this.timeEnd('render');
        }

        this.frameCounter++;
    }

    progressTransitions() {
        //@todo: remove transitions that belong to unattached components.
        //@todo: progress and apply them.
        //@todo: transition/animation merge functions
    }

    addRunningTransition(transition) {
        this.runningTransitions.add(transition);
    }

    progressAnimations() {
        //@todo: remove animations that belong to unattached components.
        //@todo: progress and apply them.
    }

    addRunningAnimation(animation) {
        this.runningAnimations.add(animation);
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