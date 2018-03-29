const Texture = require('../tree/Texture');

class SourceTexture extends Texture {

    constructor(stage) {
        super(stage)

        this._textureSource = undefined
    }

    get textureSource() {
        return this._textureSource
    }

    set textureSource(v) {
        if (v !== this._textureSource) {
            this._textureSource = v
            this._changed()
        }
    }

    _getTextureSource() {
        return this._textureSource
    }

}

module.exports = SourceTexture