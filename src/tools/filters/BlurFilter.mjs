/**
 * Copyright Metrological, 2017;
 */

import Filter from "../../tree/Filter.mjs";
import LinearBlurFilter from "./LinearBlurFilter.mjs";

/**
 * @see https://github.com/Jam3/glsl-fast-gaussian-blur
 */
export default class BlurFilter extends Filter {

    constructor(ctx) {
        super(ctx);

        this.ctx = ctx;

        this._kernelRadius = 1;

        this._steps = [];

        this.steps = 1;
    }

    get kernelRadius() {
        return this._kernelRadius;
    }

    set kernelRadius(v) {
        this._kernelRadius = v;
        this._steps.forEach(step => step._kernelRadius = v);
        this.redraw();
    }

    get steps() {
        return this._size;
    }

    set steps(v) {
        this._size = Math.round(v);

        let currentSteps = this._steps.length / 2;
        // Try to reuse objects.
        if (currentSteps < this._size) {
            let add = [];
            for (let i = currentSteps + 1; i <= this._size; i++) {
                let lbf = new LinearBlurFilter(this.ctx);
                lbf._direction[0] = i;
                lbf._kernelRadius = this._kernelRadius;
                add.push(lbf);

                lbf = new LinearBlurFilter(this.ctx);
                lbf._kernelRadius = this._kernelRadius;
                lbf._direction[1] = i;
                add.push(lbf);
            }
            this._steps = this._steps.concat(add);
            this.redraw();
        } else if (currentSteps > this._size) {
            let r = currentSteps - this._size;
            this._steps.splice(-r * 2);
            this.redraw();
        }
    }

    useDefault() {
        return (this._size === 0 || this._kernelRadius === 0);
    }

    getFilters() {
        return this._steps;
    }

}
