/**
 * Application render tree.
 * Copyright Metrological, 2017;
 */

import EventEmitter from "../EventEmitter.mjs";
import Utils from "./Utils.mjs";
import WebGLRenderer from "../renderer/webgl/WebGLRenderer.mjs";
import C2dRenderer from "../renderer/c2d/C2dRenderer.mjs";
import SparkRenderer from "../renderer/spark/SparkRenderer.mjs";
import PlatformLoader from "../platforms/PlatformLoader.mjs";
import WebGLStateManager from "../tools/WebGLStateManager.mjs";
import Shader from "./Shader.mjs";

export default class Stage extends EventEmitter {

    constructor(options = {}) {
        super();
        this._setOptions(options);

        this._usedMemory = 0;
        this._lastGcFrame = 0;

        const platformType = Stage.platform ? Stage.platform : PlatformLoader.load(options);
        this.platform = new platformType();

        if (this.platform.init) {
            this.platform.init(this);
        }

        this.gl = null;
        this.c2d = null;

        const context = this.getOption('context');
        if (context) {
            if (context.useProgram) {
                this.gl = context;
            } else {
                this.c2d = context;
            }
        } else {
            if (Utils.isWeb && (!Stage.isWebglSupported() || this.getOption('canvas2d'))) {
                console.log('Using canvas2d renderer');
                this.c2d = this.platform.createCanvasContext(this.getOption('w'), this.getOption('h'));
            } else {
                this.gl = this.platform.createWebGLContext(this.getOption('w'), this.getOption('h'));
            }
        }

        if (this.gl) {
            // Wrap in WebGLStateManager.
            // This prevents unnecessary double WebGL commands from being executed, and allows context switching.
            // Context switching is necessary when reusing the same context for Three.js.
            // Note that the user must make sure that the WebGL context is untouched before creating the application,
            //  when manually passing over a canvas or context in the options.
            WebGLStateManager.enable(this.gl, "lightning")
        }

        this._mode = this.gl ? 0 : 1;

        // Override width and height.
        if (this.getCanvas()) {
            this._options.w = this.getCanvas().width;
            this._options.h = this.getCanvas().height;
        }

        if (this._mode === 0) {
            if (Utils.isSpark) {
                this._renderer = new SparkRenderer(this);
            } else {
                this._renderer = new WebGLRenderer(this);
            }
        } else {
            this._renderer = new C2dRenderer(this);
        }

        this.setClearColor(this.getOption('clearColor'));

        this.frameCounter = 0;

        this.transitions = new TransitionManager(this);
        this.animations = new AnimationManager(this);

        this.textureManager = new TextureManager(this);
        this.textureThrottler = new TextureThrottler(this);

        this.startTime = 0;
        this.currentTime = 0;
        this.dt = 0;

        // Preload rectangle texture, so that we can skip some border checks for loading textures.
        this.rectangleTexture = new RectangleTexture(this);
        this.rectangleTexture.load();

        // Never clean up because we use it all the time.
        this.rectangleTexture.source.permanent = true;

        this.ctx = new CoreContext(this);

        this._updateSourceTextures = new Set();
    }

    get renderer() {
        return this._renderer;
    }

    static isWebglSupported() {
        if (Utils.isNode) {
            return true;
        }

        try {
            return !!window.WebGLRenderingContext;
        } catch(e) {
            return false;
        }
    }

    /**
     * Returns the rendering mode.
     * @returns {number}
     *  0: WebGL
     *  1: Canvas2d
     */
    get mode() {
        return this._mode;
    }

    isWebgl() {
        return this.mode === 0;
    }

    isC2d() {
        return this.mode === 1;
    }

    getOption(name) {
        return this._options[name];
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

        opt('canvas', null);
        opt('context', null);
        opt('w', 1920);
        opt('h', 1080);
        opt('srcBasePath', null);
        opt('memoryPressure', 24e6);
        opt('bufferMemory', 2e6);
        opt('textRenderIssueMargin', 0);
        opt('clearColor', [0, 0, 0, 0]);
        opt('defaultFontFace', 'sans-serif');
        opt('fixedDt', 0);
        opt('useImageWorker', true);
        opt('autostart', true);
        opt('precision', 1);
        opt('canvas2d', false);
        opt('platform', null);
        opt('readPixelsBeforeDraw', false);
    }

    setApplication(app) {
        this.application = app;
    }

    init() {
        this.application.setAsRoot();
        if (this.getOption('autostart')) {
            this.platform.startLoop();
        }
    }

    destroy() {
        this.platform.stopLoop();
        this.platform.destroy();
        this.ctx.destroy();
        this.textureManager.destroy();
        this._renderer.destroy();
    }

    stop() {
        this.platform.stopLoop();
    }

    resume() {
        this.platform.startLoop();
    }

    get root() {
        return this.application;
    }

    getCanvas() {
        return this._mode ? this.c2d.canvas : this.gl.canvas;
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
            texture._performUpdateSource();
        } else {
            this._updateSourceTextures.add(texture);
        }
    }

    removeUpdateSourceTexture(texture) {
        if (this._updateSourceTextures) {
            this._updateSourceTextures.delete(texture);
        }
    }

    hasUpdateSourceTexture(texture) {
        return (this._updateSourceTextures && this._updateSourceTextures.has(texture));
    }

    drawFrame() {
        this.startTime = this.currentTime;
        this.currentTime = this.platform.getHrTime();

        if (this._options.fixedDt) {
            this.dt = this._options.fixedDt;
        } else {
            this.dt = (!this.startTime) ? .02 : .001 * (this.currentTime - this.startTime);
        }

        this.emit('frameStart');

        if (this._updateSourceTextures.size) {
            this._updateSourceTextures.forEach(texture => {
                texture._performUpdateSource();
            });
            this._updateSourceTextures = new Set();
        }

        this.emit('update');

        const changes = this.ctx.hasRenderUpdates();

        // Update may cause textures to be loaded in sync, so by processing them here we may be able to show them
        // during the current frame already.
        this.textureThrottler.processSome();

        if (changes) {
            this._updatingFrame = true;
            this.ctx.update();
            this.ctx.render();
            this._updatingFrame = false;
        }

        this.platform.nextFrame(changes);

        this.emit('frameEnd');

        this.frameCounter++;
    }

    isUpdatingFrame() {
        return this._updatingFrame;
    }

    renderFrame() {
        this.ctx.frame();
    }

    forceRenderUpdate() {
        // Enforce re-rendering.
        if (this.root) {
            this.root.core._parent.setHasRenderUpdates(1);
        }
    }

    setClearColor(clearColor) {
        this.forceRenderUpdate();
        if (clearColor === null) {
            // Do not clear.
            this._clearColor = null;
        } else if (Array.isArray(clearColor)) {
            this._clearColor = clearColor;
        } else {
            this._clearColor = StageUtils.getRgbaComponentsNormalized(clearColor);
        }
    }

    getClearColor() {
        return this._clearColor;
    }

    createElement(settings) {
        if (settings) {
            return this.element(settings);
        } else {
            return new Element(this);
        }
    }

    createShader(settings) {
        return Shader.create(this, settings);
    }

    element(settings) {
        if (settings.isElement) return settings;

        let element;
        if (settings.type) {
            element = new settings.type(this);
        } else {
            element = new Element(this);
        }

        element.patch(settings);

        return element;
    }

    c(settings) {
        return this.element(settings);
    }

    get w() {
        return this._options.w;
    }

    get h() {
        return this._options.h;
    }

    get coordsWidth() {
        return this.w / this._options.precision;
    }

    get coordsHeight() {
        return this.h / this._options.precision;
    }

    addMemoryUsage(delta) {
        this._usedMemory += delta;
        if (this._lastGcFrame !== this.frameCounter) {
            if (this._usedMemory > this.getOption('memoryPressure')) {
                this.gc(false);
                if (this._usedMemory > this.getOption('memoryPressure') - 2e6) {
                    // Too few released. Aggressive cleanup.
                    this.gc(true);
                }
            }
        }
    }

    get usedMemory() {
        return this._usedMemory;
    }

    gc(aggressive) {
        if (this._lastGcFrame !== this.frameCounter) {
            this._lastGcFrame = this.frameCounter;
            const memoryUsageBefore = this._usedMemory;
            this.gcTextureMemory(aggressive);
            this.gcRenderTextureMemory(aggressive);
            this.renderer.gc(aggressive);

            console.log(`GC${aggressive ? "[aggressive]" : ""}! Frame ${this._lastGcFrame} Freed ${((memoryUsageBefore - this._usedMemory) / 1e6).toFixed(2)}MP from GPU memory. Remaining: ${(this._usedMemory / 1e6).toFixed(2)}MP`);
            const other = this._usedMemory - this.textureManager.usedMemory - this.ctx.usedMemory;
            console.log(` Textures: ${(this.textureManager.usedMemory / 1e6).toFixed(2)}MP, Render Textures: ${(this.ctx.usedMemory / 1e6).toFixed(2)}MP, Renderer caches: ${(other / 1e6).toFixed(2)}MP`);
        }
    }

    gcTextureMemory(aggressive = false) {
        if (aggressive && this.ctx.root.visible) {
            // Make sure that ALL textures are cleaned;
            this.ctx.root.visible = false;
            this.textureManager.gc();
            this.ctx.root.visible = true;
        } else {
            this.textureManager.gc();
        }
    }

    gcRenderTextureMemory(aggressive = false) {
        if (aggressive && this.root.visible) {
            // Make sure that ALL render textures are cleaned;
            this.root.visible = false;
            this.ctx.freeUnusedRenderTextures(0);
            this.root.visible = true;
        } else {
            this.ctx.freeUnusedRenderTextures(0);
        }
    }

    getDrawingCanvas() {
        return this.platform.getDrawingCanvas();
    }

    update() {
        this.ctx.update()
    }

    addServiceProvider(serviceprovider) {
        if (Utils.isSpark) {
            this.platform.addServiceProvider(serviceprovider);
        }
    }
}

import Element from "./Element.mjs";
import StageUtils from "./StageUtils.mjs";
import TextureManager from "./TextureManager.mjs";
import TextureThrottler from "./TextureThrottler.mjs";
import CoreContext from "./core/CoreContext.mjs";
import TransitionManager from "../animation/TransitionManager.mjs";
import AnimationManager from "../animation/AnimationManager.mjs";
import RectangleTexture from "../textures/RectangleTexture.mjs";
