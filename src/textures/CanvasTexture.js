const Texture = require('../tree/Texture');

class CanvasTexture extends Texture {

    set lookupId(v) {
        this._lookupId = v
    }

    set factory(v) {
        this._factory = v
    }

    _getLookupId() {
        return this._lookupId
    }

    _getSourceLoader() {
        const f = this._factory
        return (cb) => {
            const canvas = f(this.stage)
            cb(null, this.stage.adapter.getTextureOptionsForDrawingCanvas(canvas))
        }
    }

}

module.exports = CanvasTexture