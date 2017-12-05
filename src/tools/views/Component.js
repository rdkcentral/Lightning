/**
 * Copyright Metrological, 2017
 */
let View = require('../../core/View');

class Component extends View {

    constructor(stage) {
        super(stage);

        // Encapsulate tags.
        this.tagRoot = true;
    }

    _allowChildrenAccess() {
        return false
    }

}

module.exports = Component;