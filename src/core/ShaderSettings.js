let Base = require('./Base');

class ShaderSettings extends Base {

    constructor(shader, viewRenderer) {
        super();
        this._shader = shader;
        this._viewRenderer = viewRenderer;
    }

    _recalc() {
        this._shader.redraw();
        // Force hasUpdates.
        this._viewRenderer._setRecalc(64);
    }

    update() {
    }
}

module.exports = ShaderSettings;