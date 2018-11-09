import CoreQuadOperation from "../../tree/core/CoreQuadOperation.mjs";

export default class C2dCoreQuadOperation extends CoreQuadOperation {

    getRenderContext(index) {
        return this.quads.getRenderContext(this.index + index);
    }

    getSimpleTc(index) {
        return this.quads.getSimpleTc(this.index + index);
    }

    getWhite(index) {
        return this.quads.getWhite(this.index + index);
    }

}