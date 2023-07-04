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

import CoreQuadOperation from "../../tree/core/CoreQuadOperation.mjs";

export default class WebGLCoreQuadOperation extends CoreQuadOperation {

    constructor(ctx, shader, shaderOwner, renderTextureInfo, scissor, index) {
        super(ctx, shader, shaderOwner, renderTextureInfo, scissor, index);

        this.extraAttribsDataByteOffset = 0;
    }

    getAttribsDataByteOffset(index) {
        // Where this quad can be found in the attribs buffer.
        return this.quads.getAttribsDataByteOffset(this.index + index);
    }

    /**
     * Returns the relative pixel coordinates in the shader owner to gl position coordinates in the render texture.
     * @param x
     * @param y
     * @return {number[]}
     */
    getNormalRenderTextureCoords(x, y) {
        let coords = this.shaderOwner.getRenderTextureCoords(x, y);
        coords[0] /= this.getRenderWidth();
        coords[1] /= this.getRenderHeight();
        coords[0] = coords[0] * 2 - 1;
        coords[1] = 1 - coords[1] * 2;
        return coords;
    }

    getProjection() {
        if (this.renderTextureInfo === null) {
            return this.ctx.renderExec._projection;
        } else {
            return this.renderTextureInfo.nativeTexture.projection;
        }
    }

}
