import CoreQuadList from "../../tree/core/CoreQuadList.mjs";


class SpriteQuadList extends CoreQuadList {

    constructor(ctx) {
        super(ctx);
        //console.log("SpriteQuadList");
        // Allocate a fairly big chunk of memory that should be enough to support ~100000 (default) quads.
        // We do not (want to) handle memory overflow.
        const byteSize = ctx.stage.getOption('bufferMemory');

        this.dataLength = 0;

        this.data = new ArrayBuffer(byteSize);
        this.floats = new Float32Array(this.data);
        this.uints = new Uint32Array(this.data);

        this.sharedTextures = [];
    }

    getAttribsDataByteOffset(index) {
        // Where this quad can be found in the attribs buffer.
        return index * 80;
    }

    getQuadContents() {
       // console.log("SpriteQuadList:getQuadContents");
        // Debug: log contents of quad buffer.
        let floats = this.floats;
        let uints = this.uints;
        let lines = [];
        for (let i = 1; i <= this.length; i++) {
            let str = 'entry ' + i + ': ';
            for (let j = 0; j < 4; j++) {
                let b = i * 20 + j * 4;
                str += floats[b] + ',' + floats[b+1] + ':' + floats[b+2] + ',' + floats[b+3] + '[' + uints[b+4].toString(16) + '] ';
            }
            lines.push(str);
        }

        return lines;
    }

    reset() {
        super.reset();
        this.sharedTextures = [];
    }

    getTexture(index) {
        //console.log("getTexture", this.quadTextures[index], this.sharedTextures[this.quadTextures[index]])
        return this.sharedTextures[this.quadTextures[index]];
    }

    getTextureWidth(index) {
        //console.log("getTextureWidth");
        let nativeTexture = this.sharedTextures[this.quadTextures[index]];
        if (nativeTexture.w) {
            // Render texture;
            return nativeTexture.w;
        } else {
            return this.quadElements[index]._displayedTextureSource.w;
        }
    }

    getTextureHeight(index) {
       // console.log("getTextureHeight");
        let nativeTexture = this.sharedTextures[this.quadTextures[index]];
        if (nativeTexture.h) {
            // Render texture;
            return nativeTexture.h;
        } else {
            return this.quadElements[index]._displayedTextureSource.h;
        }
    }
}