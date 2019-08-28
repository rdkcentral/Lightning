import CoreQuadList from "../../src/renderer/webgl/WebGLCoreQuadList.mjs";

export default class WebGLCoreQuadListExample extends WebGLCoreQuadList {

    constructor(ctx) {
        super(ctx);

    }

    getQuadContents() {
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


}