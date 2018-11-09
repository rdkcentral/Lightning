import CoreQuadList from "../../tree/core/CoreQuadList.mjs";

export default class C2dCoreQuadList extends CoreQuadList {

    constructor(ctx) {
        super(ctx);

        this.renderContexts = [];
        this.modes = [];
    }

    setRenderContext(index, v) {
        this.renderContexts[index] = v;
    }

    setSimpleTc(index, v) {
        if (v) {
            this.modes[index] |= 1;
        } else {
            this.modes[index] -= (this.modes[index] & 1);
        }
    }

    setWhite(index, v) {
        if (v) {
            this.modes[index] |= 2;
        } else {
            this.modes[index] -= (this.modes[index] & 2);
        }
    }

    getRenderContext(index) {
        return this.renderContexts[index];
    }

    getSimpleTc(index) {
        return (this.modes[index] & 1);
    }

    getWhite(index) {
        return (this.modes[index] & 2);
    }

}