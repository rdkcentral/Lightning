/**
 * Copyright Metrological, 2017
 */

class CoreFilterOperation {

    constructor(ctx, filter, owner, source, renderTexture, beforeQuadOperation) {

        this.ctx = ctx
        this.filter = filter
        this.owner = owner
        this.source = source
        this.renderTexture = renderTexture
        this.beforeQuadOperation = beforeQuadOperation

    }

}

module.exports = CoreFilterOperation