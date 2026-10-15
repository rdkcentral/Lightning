/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 Metrological
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Application render tree.
 */

import EventEmitter from "../EventEmitter.mjs";
import ElementCore from "./core/ElementCore.mjs";
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

        // attempt to track VRAM usage more accurately by accounting for different color channels
        this._usedVramAlpha = 0;
        this._usedVramNonAlpha = 0;

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
            if (this.getOption('devicePixelRatio') !== 1) {
                const ratio = this.getOption('devicePixelRatio');
                // set correct display sie
                this.getCanvas().style.width = this._options['w'] / ratio  + 'px';
                this.getCanvas().style.height = this._options['h'] / ratio + 'px';
            }

            // set display buffer size
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

        // WebGL context-loss recovery state. See onContextLost().
        // running: GPU work is accepted. lost: context gone, loop suspended.
        // restoring: transient re-init inside onContextRestored(). failed:
        // re-init or the recovery frame failed, loop stays suspended.
        // destroyed: stage torn down, no further transitions accepted.
        this.contextState = 'running';
        this.contextGeneration = 0;
        this.contextLostAt = 0;
        this.pendingRestoreEvent = false;
        this.destroyed = false;
        this._restoreTimeoutHandle = null;
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
        } catch (e) {
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

        const opt = (name, def) => {
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
        opt('fontSharp', { precision: 0.6666666667, fontSize: 24 })
        opt('clearColor', [0, 0, 0, 0]);
        opt('defaultFontFace', 'sans-serif');
        opt('fixedDt', 0);
        opt('useImageWorker', true);
        opt('autostart', true);
        opt('precision', 1);
        opt('canvas2d', false);
        opt('platform', null);
        opt('readPixelsBeforeDraw', false);
        opt('devicePixelRatio', 1)       
        opt('readPixelsAfterDraw', false);
        opt('readPixelsAfterDrawThreshold', 0);
        opt('debugFrame', false);
        opt('forceTxCanvasSource', false);
        opt('pauseRafLoopOnIdle', false);
        opt('contextRestoreTimeout', 10000);

        if (o['devicePixelRatio'] != null && o['devicePixelRatio'] !== 1) {
            this._options['precision'] *= o['devicePixelRatio']
            this._options['w'] *= o['devicePixelRatio']
            this._options['h'] *= o['devicePixelRatio']
        }
    }

    setApplication(app) {
        this.application = app;
    }

    init() {

        if (this.application.getOption('debug') && this.platform._imageWorker) {
            console.log('[Lightning] Using image worker!');
        }

        if (this.application.getOption('debug') && this.c2d) {
            console.log('[Lightning] Using canvas2d renderer');
        }

        this.application.setAsRoot();
        if (this.platform && typeof this.platform.attachContextEvents === 'function') {
            // Arm loss prevention even when the automatic loop is not started
            // (manual rendering): recovery listeners must exist before any
            // frame runs, independent of the loop.
            this.platform.attachContextEvents();
        }
        if (this.getOption('autostart')) {
            this.platform.startLoop();
        }
    }

    destroy() {
        this._clearRestoreTimeout();
        this.contextState = 'destroyed';
        this.destroyed = true;
        this.contextGeneration++;
        if (this.platform && this.platform.suspendFrameLoop) {
            this.platform.suspendFrameLoop();
        }
        this.platform.stopLoop();
        // Cancel pending loads while the image worker is still alive, but
        // preserve the normal teardown order for GPU resource cleanup.
        this.textureManager.cancelPendingLoads();
        this.platform.destroy();
        this.ctx.destroy();
        this.textureManager.destroy();
        this._renderer.destroy();

        // clear last rendered frame
        if (this.gl) {
            this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        } else if (this.c2d) {
            this.c2d.clearRect(
                0, 0, this.c2d.canvas.width, this.c2d.canvas.height
            );
        }

        this.gl = null;
        this.c2d = null;
        this.ctx = null;
        this._options = null;
        this.platform = null;
        this.textureManager = null;
        this._renderer = null;

        delete this.gl;
        delete this.c2d;
        delete this.ctx;
        delete this._options;
        delete this.platform;
        delete this.textureManager;
        delete this._renderer;
    }

    stop() {
        this.platform.stopLoop();
    }

    resume() {
        this.platform.startLoop();
    }

    _getTimeStamp() {
        if (this.platform && this.platform.getHrTime) {
            return this.platform.getHrTime();
        }
        return Date.now();
    }

    _clearRestoreTimeout() {
        if (this._restoreTimeoutHandle !== null && this._restoreTimeoutHandle !== undefined) {
            clearTimeout(this._restoreTimeoutHandle);
        }
        this._restoreTimeoutHandle = null;
    }

    /**
     * Marks the WebGL context as lost and suspends all GPU submission.
     *
     * Called from the canvas `webglcontextlost` handler and from GL-error
     * detection paths (failed texture uploads). Safe to call repeatedly:
     * only the first call per loss takes effect.
     *
     * Emits `contextLost` (`{generation}`). If the browser does not restore
     * the context within `contextRestoreTimeout` ms, emits
     * `contextRestoreFailed` but stays `lost` (non-terminal): a late browser
     * restoration is still accepted.
     */
    onContextLost() {
        if (this.contextState === 'destroyed' || this.contextState === 'lost') {
            return;
        }
        // Invalidate stale loop callbacks first: GL-error detection paths
        // call this directly and bypass the canvas event handler.
        if (this.platform && this.platform.suspendFrameLoop) {
            this.platform.suspendFrameLoop();
        }
        this.contextState = 'lost';
        this.contextGeneration++;
        this.contextLostAt = this._getTimeStamp();
        this.pendingRestoreEvent = false;
        if (this.textureManager && this.textureManager.invalidateContext) {
            this.textureManager.invalidateContext();
        }
        if (this.ctx && this.ctx.invalidateContext) {
            this.ctx.invalidateContext();
        }
        this._clearRestoreTimeout();
        const generation = this.contextGeneration;
        const timeout = this.getOption ? this.getOption('contextRestoreTimeout') : 10000;
        const timeoutMs = (timeout === undefined || timeout === null) ? 10000 : timeout;
        if (timeoutMs > 0) {
            this._restoreTimeoutHandle = setTimeout(() => {
                if (this.contextState !== 'lost' || this.contextGeneration !== generation) {
                    return;
                }
                this._restoreTimeoutHandle = null;
                this.emit('contextRestoreFailed', {
                    generation,
                    error: new Error('WebGL context restoration timed out')
                });
                // Non-terminal: a late browser restoration remains valid.
            }, timeoutMs);
        }
        this.emit('contextLost', { generation: this.contextGeneration });
    }

    /**
     * Reinitializes renderer-owned GPU state after the browser restored the
     * context. Returns true when recovery can proceed with a recovery frame.
     *
     * Reinitialisation failure is terminal: the stage moves to `failed` and
     * emits `contextRestoreFailed`. A second loss landing mid-restore aborts
     * cleanly (returns false, stays `lost`).
     */
    onContextRestored() {
        if (this.contextState !== 'lost' && this.contextState !== 'failed') {
            return false;
        }
        const generation = this.contextGeneration;
        this.contextState = 'restoring';
        this._clearRestoreTimeout();
        try {
            const renderer = this._renderer;
            if (!renderer || typeof renderer.restoreContext !== 'function') {
                throw new Error('Renderer does not support context restoration');
            }
            renderer.restoreContext();
            if (this.contextGeneration !== generation || this.contextState !== 'restoring') {
                return false;
            }
            this.contextState = 'running';
            if (this.textureManager && this.textureManager.restoreContext) {
                this.textureManager.restoreContext();
            }
            if (this.contextGeneration !== generation || this.contextState !== 'running') {
                return false;
            }
            // Reset frame timing so the recovery frame gets a sane dt.
            this.startTime = 0;
            this.currentTime = 0;
            this.dt = 0;
            // Rebuild everything including render-to-texture caches: their
            // GPU handles died with the context, and a plain type-1 update
            // would keep reusing the dead result textures.
            const rootCore = (this.ctx && this.ctx.root) || (this.root && this.root.core);
            if (rootCore) {
                this._markRenderUpdatesRecursive(rootCore, 3);
            }
            // The recursive mark bypasses setHasRenderUpdates propagation, so
            // it never reaches the dummy parent that hasRenderUpdates()
            // reads: without this, an idle scene would skip the recovery
            // render yet still emit contextRestored.
            this.forceRenderUpdate();
            this.pendingRestoreEvent = true;
            return true;
        } catch (error) {
            if (this.contextGeneration !== generation) {
                return false;
            }
            this.contextState = 'failed';
            this.emit('contextRestoreFailed', { generation, error });
            return false;
        }
    }

    /**
     * Reports a failed recovery frame. Returns true when the error was
     * claimed as the terminal restore failure (emits `contextRestoreFailed`,
     * moves to `failed`); false when there is no pending restore, in which
     * case the caller must rethrow to preserve fail-fast behavior.
     */
    onRecoveryFrameFailed(error) {
        if (this.pendingRestoreEvent === false || this.contextState !== 'running') {
            return false;
        }
        this.pendingRestoreEvent = false;
        this.contextState = 'failed';
        if (this.platform && this.platform.suspendFrameLoop) {
            this.platform.suspendFrameLoop();
        }
        this.emit('contextRestoreFailed', { generation: this.contextGeneration, error });
        return true;
    }

    onRecoveryFrameCompleted() {
        if (this.pendingRestoreEvent === false || this.contextState !== 'running') {
            return;
        }
        this.pendingRestoreEvent = false;
        this.emit('contextRestored', {
            generation: this.contextGeneration,
            duration: this._getTimeStamp() - this.contextLostAt
        });
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


    _performUpdateSource() {
        if (this._updateSourceTextures.size) {
            this._updateSourceTextures.forEach(texture => {
                texture._performUpdateSource();
            });
            this._updateSourceTextures.clear();
        }
    }

    _calculateDt() {
        this.startTime = this.currentTime;
        this.currentTime = this.platform.getHrTime();

        if (this._options.fixedDt) {
            this.dt = this._options.fixedDt;
        } else {
            this.dt = (!this.startTime) ? .02 : .001 * (this.currentTime - this.startTime);
        }
    }

    updateFrame() {
        if (this.contextState !== 'running') {
            return;
        }
        this._calculateDt();
        this.emit('frameStart');
        this._performUpdateSource();
        this.emit('update');
    }

    onIdle() {
        this.emit('idle');
    }

    renderFrame() {
        if (this.contextState !== 'running') {
            return false;
        }
        const changes = this.ctx.hasRenderUpdates();

        // Update may cause textures to be loaded in sync, so by processing them here we may be able to show them
        // during the current frame already.
        this.textureThrottler.processSome();

        // Uploads above run synchronously and may have detected a context
        // loss; never submit a dirty frame on a dead context.
        if (this.contextState !== 'running') {
            return false;
        }

        if (changes) {
            this._updatingFrame = true;
            try {
                this.ctx.update();
                // Scene traversal runs synchronous canvas-texture uploads
                // that can equally detect a loss; skip the render then.
                if (this.contextState !== 'running') {
                    return false;
                }
                this.ctx.render();
            } finally {
                this._updatingFrame = false;
            }
        }

        this.platform.nextFrame(changes);

        this.emit('frameEnd');

        this.frameCounter++;

        return changes;
    }

    isUpdatingFrame() {
        return this._updatingFrame;
    }

    drawFrame() {
        // Maintain original functionality of `drawFrame()` while retaining the
        // RAF mitigration feature from: https://github.com/rdkcentral/Lightning/pull/402
        // The full functionality of this method is relied directly by our own unit tests and
        // the unit tests of third party users
        this.updateFrame();
        this.renderFrame();
    }

    forceRenderUpdate() {
        // Enforce re-rendering.
        if (this.root) {
            this.root.core._parent.setHasRenderUpdates(1);
        }
    }

    _markRenderUpdatesRecursive(core, type) {
        core._hasRenderUpdates = Math.max(type, core._hasRenderUpdates || 0);
        const children = core._children;
        if (children) {
            for (let i = 0, n = children.length; i < n; i++) {
                this._markRenderUpdatesRecursive(children[i], type);
            }
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
        if (delta > 0 && this._lastGcFrame !== this.frameCounter) {
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

    addVramUsage(delta, alpha) {
        if (alpha) {
            this._usedVramAlpha += delta;
        }
        else {
            this._usedVramNonAlpha += delta;
        }
    }

    get usedVramAlpha() {
        return this._usedVramAlpha;
    }

    get usedVramNonAlpha() {
        return this._usedVramNonAlpha;
    }

    get usedVram() {
        return this._usedVramAlpha + this._usedVramNonAlpha;
    }

    gc(aggressive) {
        if (this._lastGcFrame !== this.frameCounter) {
            this._lastGcFrame = this.frameCounter;
            const memoryUsageBefore = this._usedMemory;
            this.gcTextureMemory(aggressive);
            this.gcRenderTextureMemory(aggressive);
            this.renderer.gc(aggressive);

            if (this.application.getOption('debug')) {
                console.log(`[Lightning] GC${aggressive ? "[aggressive]" : ""}! Frame ${this._lastGcFrame} Freed ${((memoryUsageBefore - this._usedMemory) / 1e6).toFixed(2)}MP from GPU memory. Remaining: ${(this._usedMemory / 1e6).toFixed(2)}MP`);
                const other = this._usedMemory - this.textureManager.usedMemory - this.ctx.usedMemory;
                console.log(`[Lightning] Textures: ${(this.textureManager.usedMemory / 1e6).toFixed(2)}MP, Render Textures: ${(this.ctx.usedMemory / 1e6).toFixed(2)}MP, Renderer caches: ${(other / 1e6).toFixed(2)}MP`);
            }
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

    getChildrenByPosition(x, y) {
        const children = [];
        this.ctx.updateTreeOrder = 0;
        this.root.core.updateTreeOrder();
        this.root.core.collectAtCoord(x, y, children);

        children.sort(ElementCore.sortZIndexedChildren);
        return children;
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
