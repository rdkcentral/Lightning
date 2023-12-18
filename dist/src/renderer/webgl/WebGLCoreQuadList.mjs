/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 Metrological
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import CoreQuadList from "../../tree/core/CoreQuadList.mjs";

export default class WebGLCoreQuadList extends CoreQuadList {

    constructor(ctx) {
        super(ctx);

        // Allocate a fairly big chunk of memory that should be enough to support ~100000 (default) quads.
        // We do not (want to) handle memory overflow.
        const byteSize = ctx.stage.getOption('bufferMemory');

        this.dataLength = 0;

        this.data = new ArrayBuffer(byteSize);
        this.floats = new Float32Array(this.data);
        this.uints = new Uint32Array(this.data);
    }

    getAttribsDataByteOffset(index) {
        // Where this quad can be found in the attribs buffer.
        return index * 80;
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
