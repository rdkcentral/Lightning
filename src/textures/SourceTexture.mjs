import Texture from "../tree/Texture.mjs";

export default class SourceTexture extends Texture {

    constructor(stage) {
        super(stage);

        this._textureSource = undefined;
    }

    get textureSource() {
        return this._textureSource;
    }

    set textureSource(v) {
        if (v !== this._textureSource) {
            if (v.isResultTexture) {
                // In case of a result texture, automatically inherit the precision.
                this._precision = this.stage.getRenderPrecision();
            }
            this._textureSource = v;
            this._changed();
        }
    }

    _getTextureSource() {
        return this._textureSource;
    }

}
