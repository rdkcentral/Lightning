export default class Shader {

    constructor(coreContext) {
        this._initialized = false;

        this.ctx = coreContext;

        /**
         * The (enabled) views that use this shader.
         * @type {Set<ViewCore>}
         */
        this._views = new Set();
    }

    get impl() {
        if (!this._impl) {
            if (this.ctx.stage.mode === 0) {
                this._impl = new (this.constructor.getWebGLImpl())(this);
            } else {
                this._impl = new (this.constructor.getC2dImpl())(this);
            }
        }
        return this._impl;
    }

    static getWebGLImpl() {
        return undefined
    }

    static getC2dImpl() {
        return undefined
    }

    addView(viewCore) {
        this._views.add(viewCore);
    }

    removeView(viewCore) {
        this._views.delete(viewCore);
        if (!this._views) {
            this.cleanup();
        }
    }

    redraw() {
        this._views.forEach(viewCore => {
            viewCore.setHasRenderUpdates(2);
        });
    }

    patch(settings) {
        Base.patchObject(this, settings);
    }

    useDefault() {
        // Should return true if this shader is configured (using it's properties) to not have any effect.
        // This may allow the render engine to avoid unnecessary shader program switches or even texture copies.
        return false;
    }

    addEmpty() {
        // Draws this shader even if there are no quads to be added.
        // This is handy for custom shaders.
        return false;
    }

    cleanup() {
        // Called when no more enabled views have this shader.
        this.impl.cleanup();
    }

}

import Base from "./Base.mjs";
