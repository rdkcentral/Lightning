/**
 * Copyright Metrological, 2017
 */

class CoreFilterOperation {

    constructor(filter, source, renderTexture, beforeQuadOperation) {

        this.filter = filter
        this.source = source
        this.renderTexture = renderTexture
        this.beforeQuadOperation = beforeQuadOperation

    }

}

module.exports = CoreFilterOperation