/**
 * Copyright Metrological, 2017;
 */

export default class CoreQuadList {

    constructor(ctx, byteSize) {

        this.ctx = ctx;

        this.dataLength = 0;

        this.data = new ArrayBuffer(byteSize);
        this.floats = new Float32Array(this.data);
        this.uints = new Uint32Array(this.data);

        this.quadTextures = [];

        this.quadViews = [];

        // Set up first quad to the identity quad (reused for filters).
        let f = this.floats;
        let u = this.uints;
        f[0] = -1;
        f[1] = -1;
        f[2] = 0;
        f[3] = 0;
        u[4] = 0xFFFFFFFF;
        f[5] = 1;
        f[6] = -1;
        f[7] = 1;
        f[8] = 0;
        u[9] = 0xFFFFFFFF;
        f[10] = 1;
        f[11] = 1;
        f[12] = 1;
        f[13] = 1;
        u[14] = 0xFFFFFFFF;
        f[15] = -1;
        f[16] = 1;
        f[17] = 0;
        f[18] = 1;
        u[19] = 0xFFFFFFFF;
    }

    get length() {
        return this.quadTextures.length;
    }

    reset() {
        this.quadTextures = [];
        this.quadViews = [];
        this.dataLength = 0;
    }

    getAttribsDataByteOffset(index) {
        // Where this quad can be found in the attribs buffer.
        return index * 80 + 80;
    }

    getView(index) {
        return this.quadViews[index]._view;
    }

    getViewCore(index) {
        return this.quadViews[index];
    }

    getTexture(index) {
        return this.quadTextures[index];
    }

    getTextureWidth(index) {
        let nativeTexture = this.quadTextures[index];
        if (nativeTexture.w) {
            // Render texture;
            return nativeTexture.w;
        } else {
            return this.quadViews[index]._displayedTextureSource.w;
        }
    }

    getTextureHeight(index) {
        let nativeTexture = this.quadTextures[index];
        if (nativeTexture.h) {
            // Render texture;
            return nativeTexture.h;
        } else {
            return this.quadViews[index]._displayedTextureSource.h;
        }
    }

    getQuadContents() {
        // Debug: log contents of quad buffer.
        let floats = this.floats;
        let uints = this.uints;
        let lines = [];
        for (let i = 1; i <= this.length; i++) {
            let str = 'entry ' + i + ': ';
            for (let j = 0; j < 4; j++) {
                let b = i * 16 + j * 4;
                str += floats[b] + ',' + floats[b+1] + ':' + uints[b+2].toString(16) + '[' + uints[b+3].toString(16) + '] ';
            }
            lines.push(str);
        }

        return lines;
    }
}
