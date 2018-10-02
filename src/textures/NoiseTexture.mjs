import Texture from "../tree/Texture.mjs";

export default class NoiseTexture extends Texture {

    _getLookupId() {
        return '__noise';
    }

    _getSourceLoader() {
        const gl = this.stage.gl;
        return function(cb) {
            const noise = new Uint8Array(128 * 128 * 4);
            for (let i = 0; i < 128 * 128 * 4; i+=4) {
                const v = Math.floor(Math.random() * 256);
                noise[i] = v;
                noise[i+1] = v;
                noise[i+2] = v;
                noise[i+3] = 255;
            }
            const texParams = {}

            if (gl) {
                texParams[gl.TEXTURE_WRAP_S] = gl.REPEAT;
                texParams[gl.TEXTURE_WRAP_T] = gl.REPEAT;
                texParams[gl.TEXTURE_MIN_FILTER] = gl.NEAREST;
                texParams[gl.TEXTURE_MAG_FILTER] = gl.NEAREST;
            }

            cb(null, {source: noise, w: 128, h: 128, texParams: texParams});
        }
    }

}
