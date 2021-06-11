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

export default class CoreQuadList {

    constructor(ctx) {

        this.ctx = ctx;

        this.quadTextures = [];

        this.quadElements = [];
    }

    get length() {
        return this.quadTextures.length;
    }

    reset() {
        this.quadTextures = [];
        this.quadElements = [];
        this.dataLength = 0;
    }

    getElement(index) {
        return this.quadElements[index]._element;
    }

    getElementCore(index) {
        return this.quadElements[index];
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
            return this.quadElements[index]._displayedTextureSource.w;
        }
    }

    getTextureHeight(index) {
        let nativeTexture = this.quadTextures[index];
        if (nativeTexture.h) {
            // Render texture;
            return nativeTexture.h;
        } else {
            return this.quadElements[index]._displayedTextureSource.h;
        }
    }

}
