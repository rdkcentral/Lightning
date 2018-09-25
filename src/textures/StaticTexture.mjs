import Texture from "../tree/Texture.mjs";

export default class StaticTexture extends Texture {

    constructor(stage, options) {
        super(stage);

        this._options = options;
    }

    set options(v) {
        if (this._options !== v) {
            this._options = v;
            this._changed();
        }
    }

    get options() {
        return this._options;
    }

    _getIsValid() {
        return !!this._options;
    }

    _getSourceLoader() {
        return (cb) => {
            cb(null, this._options);
        }
    }
}
