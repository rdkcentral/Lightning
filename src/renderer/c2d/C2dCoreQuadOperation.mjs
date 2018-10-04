import CoreQuadOperation from "../../tree/core/CoreQuadOperation.mjs";

export default class C2dCoreQuadOperation extends CoreQuadOperation {

    getRenderContext(index) {
        return this.quads.getRenderContext(this.index + index);
    }

}