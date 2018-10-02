import CoreQuadList from "../../CoreQuadList.mjs";

export default class C2dCoreQuadList extends CoreQuadList {

    constructor(ctx) {
        super(ctx);

        this.renderContexts = [];
    }

    getRenderContext(index) {
        return this.renderContexts[index];
    }
}