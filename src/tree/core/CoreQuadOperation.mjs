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


export default class CoreQuadOperation {

    constructor(ctx, shader, shaderOwner, renderTextureInfo, scissor, index) {

        this.ctx = ctx;
        this.shader = shader;
        this.shaderOwner = shaderOwner;
        this.renderTextureInfo = renderTextureInfo;
        this.scissor = scissor;
        this.index = index;
        this.length = 0;

    }

    get quads() {
        return this.ctx.renderState.quads;
    }

    getTexture(index) {
        return this.quads.getTexture(this.index + index);
    }

    getElementCore(index) {
        return this.quads.getElementCore(this.index + index);
    }

    getElement(index) {
        return this.quads.getElement(this.index + index);
    }

    getElementWidth(index) {
        return this.getElement(index).renderWidth;
    }

    getElementHeight(index) {
        return this.getElement(index).renderHeight;
    }

    getTextureWidth(index) {
        return this.quads.getTextureWidth(this.index + index);
    }

    getTextureHeight(index) {
        return this.quads.getTextureHeight(this.index + index);
    }

    getRenderWidth() {
        if (this.renderTextureInfo) {
            return this.renderTextureInfo.w;
        } else {
            return this.ctx.stage.w;
        }
    }

    getRenderHeight() {
        if (this.renderTextureInfo) {
            return this.renderTextureInfo.h;
        } else {
            return this.ctx.stage.h;
        }
    }

}
