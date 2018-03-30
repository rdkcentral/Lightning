const Texture = require('../tree/Texture');

class StaticCanvasTexture extends Texture {

    constructor(stage) {
        super(stage)
        this._factory = undefined
        this._lookupId = undefined
    }

    set content({factory, id = undefined}) {
        this._factory = factory
        this._lookupId = id
        this._changed()
    }

    _getIsValid() {
        return !!this._factory
    }

    _getLookupId() {
        return this._lookupId
    }

    _getSourceLoader() {
        const f = this._factory
        return (cb) => {
            return f((err, canvas) => {
                if (err) {
                    return cb(err)
                }
                cb(null, this.stage.adapter.getTextureOptionsForDrawingCanvas(canvas))
            }, this.stage)
        }
    }

}

module.exports = StaticCanvasTexture