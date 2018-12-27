import Texture from "../tree/Texture.mjs";

export default class RectangleTexture extends Texture {

    _getLookupId() {
        return '__whitepix';
    }

    _getSourceLoader() {
        return function(cb) {
            var whitePixel = new Uint8Array([255, 255, 255, 255]);
            cb(null, {source: whitePixel, w: 1, h: 1, permanent: true});
        }
    }

    isAutosizeTexture() {
        return false;
    }
}
