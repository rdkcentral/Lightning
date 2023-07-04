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

import Utils from "../../tree/Utils.mjs";
import StageUtils from "../../tree/StageUtils.mjs";
import WebGLCoreQuadList from "./WebGLCoreQuadList.mjs";
import WebGLCoreQuadOperation from "./WebGLCoreQuadOperation.mjs";
import WebGLCoreRenderExecutor from "./WebGLCoreRenderExecutor.mjs";
import CoreRenderState from "../../tree/core/CoreRenderState.mjs";
import DefaultShader from "./shaders/DefaultShader.mjs";
import WebGLShader from "./WebGLShader.mjs";
import Renderer from "../Renderer.mjs";

export default class WebGLRenderer extends Renderer {

    constructor(stage) {
        super(stage);
        this.shaderPrograms = new Map();
        this._compressedTextureExtensions = {
            astc: stage.gl.getExtension('WEBGL_compressed_texture_astc'),
            etc1: stage.gl.getExtension('WEBGL_compressed_texture_etc1'),
            s3tc: stage.gl.getExtension('WEBGL_compressed_texture_s3tc'),
            pvrtc: stage.gl.getExtension('WEBGL_compressed_texture_pvrtc'),
        }
    }

    getCompressedTextureExtensions() {
        return this._compressedTextureExtensions
    }

    destroy() {
        this.shaderPrograms.forEach(shaderProgram => shaderProgram.destroy());

        this.shaderPrograms = null;
        this._compressedTextureExtensions = null;

        delete this.shaderPrograms;
        delete this._compressedTextureExtensions;
    }

    _createDefaultShader(ctx) {
        return new DefaultShader(ctx);
    }

    _getShaderBaseType() {
        return WebGLShader
    }

    _getShaderAlternative(shaderType) {
        return shaderType.getWebGL && shaderType.getWebGL();
    }

    createCoreQuadList(ctx) {
        return new WebGLCoreQuadList(ctx);
    }

    createCoreQuadOperation(ctx, shader, shaderOwner, renderTextureInfo, scissor, index) {
        return new WebGLCoreQuadOperation(ctx, shader, shaderOwner, renderTextureInfo, scissor, index);
    }

    createCoreRenderExecutor(ctx) {
        return new WebGLCoreRenderExecutor(ctx);
    }

    createCoreRenderState(ctx) {
        return new CoreRenderState(ctx);
    }

    createRenderTexture(w, h, pw, ph) {
        const gl = this.stage.gl;
        const glTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, glTexture);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, pw, ph, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        glTexture.params = {};
        glTexture.params[gl.TEXTURE_MAG_FILTER] = gl.LINEAR;
        glTexture.params[gl.TEXTURE_MIN_FILTER] = gl.LINEAR;
        glTexture.params[gl.TEXTURE_WRAP_S] = gl.CLAMP_TO_EDGE;
        glTexture.params[gl.TEXTURE_WRAP_T] = gl.CLAMP_TO_EDGE;
        glTexture.options = { format: gl.RGBA, internalFormat: gl.RGBA, type: gl.UNSIGNED_BYTE };

        // We need a specific framebuffer for every render texture.
        glTexture.framebuffer = gl.createFramebuffer();
        glTexture.projection = new Float32Array([2 / w, 2 / h]);

        gl.bindFramebuffer(gl.FRAMEBUFFER, glTexture.framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, glTexture, 0);

        return glTexture;
    }

    freeRenderTexture(glTexture) {
        let gl = this.stage.gl;
        gl.deleteFramebuffer(glTexture.framebuffer);
        gl.deleteTexture(glTexture);
    }

    _getBytesPerPixel(fmt, type) {
        const gl = this.stage.gl;

        if (fmt === gl.RGBA) {
            switch (type) {
                case gl.UNSIGNED_BYTE:
                    return 4;

                case gl.UNSIGNED_SHORT_4_4_4_4:
                    return 2;

                case gl.UNSIGNED_SHORT_5_5_5_1:
                    return 2;

                default:
                    throw new Error('Invalid type specified for GL_RGBA format');
            }
        }
        else if (fmt === gl.RGB) {
            switch (type) {
                case gl.UNSIGNED_BYTE:
                    return 3;

                case gl.UNSIGNED_BYTE_5_6_5:
                    return 2;

                default:
                    throw new Error('Invalid type specified for GL_RGB format');
            }
        }
        else {
            throw new Error('Invalid format specified in call to _getBytesPerPixel()');
        }
    }

    uploadTextureSource(textureSource, options) {
        const gl = this.stage.gl;

        const source = options.source;
        let compressed = false;
        if (options.renderInfo) {
            compressed = options.renderInfo.compressed || false
        }

        const format = {
            premultiplyAlpha: true,
            hasAlpha: true
        };

        if (options && options.hasOwnProperty('premultiplyAlpha')) {
            format.premultiplyAlpha = options.premultiplyAlpha;
        }

        if (options && options.hasOwnProperty('flipBlueRed')) {
            format.flipBlueRed = options.flipBlueRed;
        }

        if (options && options.hasOwnProperty('hasAlpha')) {
            format.hasAlpha = options.hasAlpha;
        }

        if (!format.hasAlpha) {
            format.premultiplyAlpha = false;
        }

        format.texParams = options.texParams || {}
        format.texOptions = options.texOptions || {}

        let glTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, glTexture);

        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, format.premultiplyAlpha);

        if (Utils.isNode) {
            gl.pixelStorei(gl.UNPACK_FLIP_BLUE_RED, !!format.flipBlueRed);
        }

        const texParams = format.texParams;
        if (!texParams[gl.TEXTURE_MAG_FILTER]) texParams[gl.TEXTURE_MAG_FILTER] = gl.LINEAR;
        if (!texParams[gl.TEXTURE_MIN_FILTER]) texParams[gl.TEXTURE_MIN_FILTER] = gl.LINEAR;
        if (!texParams[gl.TEXTURE_WRAP_S]) texParams[gl.TEXTURE_WRAP_S] = gl.CLAMP_TO_EDGE;
        if (!texParams[gl.TEXTURE_WRAP_T]) texParams[gl.TEXTURE_WRAP_T] = gl.CLAMP_TO_EDGE;

        Object.keys(texParams).forEach(key => {
            const value = texParams[key];
            gl.texParameteri(gl.TEXTURE_2D, parseInt(key), value);
        });

        if (compressed) {
            this.stage.platform.uploadCompressedGlTexture(gl, textureSource, source);
            return glTexture;
        }
         
        const texOptions = format.texOptions;
        texOptions.format = texOptions.format || (format.hasAlpha ? gl.RGBA : gl.RGB);
        texOptions.type = texOptions.type || gl.UNSIGNED_BYTE;
        texOptions.internalFormat = texOptions.internalFormat || texOptions.format;
        if (options && options.imageRef) {
            texOptions.imageRef = options.imageRef;
        }
        
        this.stage.platform.uploadGlTexture(gl, textureSource, source, texOptions);
        
        glTexture.params = Utils.cloneObjShallow(texParams);
        glTexture.options = Utils.cloneObjShallow(texOptions);

        // calculate bytes per pixel for vram usage tracking
        glTexture.bytesPerPixel = this._getBytesPerPixel(texOptions.format, texOptions.type);

        return glTexture;
    }

    freeTextureSource(textureSource) {
        this.stage.gl.deleteTexture(textureSource.nativeTexture);
    }

    addQuad(renderState, quads, index) {
        let offset = (index * 20);
        const elementCore = quads.quadElements[index];

        let r = elementCore._renderContext;

        let floats = renderState.quads.floats;
        let uints = renderState.quads.uints;
        const mca = StageUtils.mergeColorAlpha;

        if (r.tb !== 0 || r.tc !== 0) {
            floats[offset++] = r.px;
            floats[offset++] = r.py;
            floats[offset++] = elementCore._ulx;
            floats[offset++] = elementCore._uly;
            uints[offset++] = mca(elementCore._colorUl, r.alpha);
            floats[offset++] = r.px + elementCore._w * r.ta;
            floats[offset++] = r.py + elementCore._w * r.tc;
            floats[offset++] = elementCore._brx;
            floats[offset++] = elementCore._uly;
            uints[offset++] = mca(elementCore._colorUr, r.alpha);
            floats[offset++] = r.px + elementCore._w * r.ta + elementCore._h * r.tb;
            floats[offset++] = r.py + elementCore._w * r.tc + elementCore._h * r.td;
            floats[offset++] = elementCore._brx;
            floats[offset++] = elementCore._bry;
            uints[offset++] = mca(elementCore._colorBr, r.alpha);
            floats[offset++] = r.px + elementCore._h * r.tb;
            floats[offset++] = r.py + elementCore._h * r.td;
            floats[offset++] = elementCore._ulx;
            floats[offset++] = elementCore._bry;
            uints[offset] = mca(elementCore._colorBl, r.alpha);
        } else {
            // Simple.
            let cx = r.px + elementCore._w * r.ta;
            let cy = r.py + elementCore._h * r.td;

            floats[offset++] = r.px;
            floats[offset++] = r.py;
            floats[offset++] = elementCore._ulx;
            floats[offset++] = elementCore._uly;
            uints[offset++] = mca(elementCore._colorUl, r.alpha);
            floats[offset++] = cx;
            floats[offset++] = r.py;
            floats[offset++] = elementCore._brx;
            floats[offset++] = elementCore._uly;
            uints[offset++] = mca(elementCore._colorUr, r.alpha);
            floats[offset++] = cx;
            floats[offset++] = cy;
            floats[offset++] = elementCore._brx;
            floats[offset++] = elementCore._bry;
            uints[offset++] = mca(elementCore._colorBr, r.alpha);
            floats[offset++] = r.px;
            floats[offset++] = cy;
            floats[offset++] = elementCore._ulx;
            floats[offset++] = elementCore._bry;
            uints[offset] = mca(elementCore._colorBl, r.alpha);
        }
    }

    isRenderTextureReusable(renderState, renderTextureInfo) {
        let offset = (renderState._renderTextureInfo.offset * 80) / 4;
        let floats = renderState.quads.floats;
        let uints = renderState.quads.uints;
        return ((floats[offset] === 0) &&
            (floats[offset + 1] === 0) &&
            (floats[offset + 2] === 0) &&
            (floats[offset + 3] === 0) &&
            (uints[offset + 4] === 0xFFFFFFFF) &&
            (floats[offset + 5] === renderTextureInfo.w) &&
            (floats[offset + 6] === 0) &&
            (floats[offset + 7] === 1) &&
            (floats[offset + 8] === 0) &&
            (uints[offset + 9] === 0xFFFFFFFF) &&
            (floats[offset + 10] === renderTextureInfo.w) &&
            (floats[offset + 11] === renderTextureInfo.h) &&
            (floats[offset + 12] === 1) &&
            (floats[offset + 13] === 1) &&
            (uints[offset + 14] === 0xFFFFFFFF) &&
            (floats[offset + 15] === 0) &&
            (floats[offset + 16] === renderTextureInfo.h) &&
            (floats[offset + 17] === 0) &&
            (floats[offset + 18] === 1) &&
            (uints[offset + 19] === 0xFFFFFFFF));
    }

    finishRenderState(renderState) {
        // Set extra shader attribute data.
        let offset = renderState.length * 80;
        for (let i = 0, n = renderState.quadOperations.length; i < n; i++) {
            renderState.quadOperations[i].extraAttribsDataByteOffset = offset;
            let extra = renderState.quadOperations[i].shader.getExtraAttribBytesPerVertex() * 4 * renderState.quadOperations[i].length;
            offset += extra;
            if (extra) {
                renderState.quadOperations[i].shader.setExtraAttribsInBuffer(renderState.quadOperations[i], renderState.quads);
            }
        }
        renderState.quads.dataLength = offset;
    }

    copyRenderTexture(renderTexture, nativeTexture, options) {
        const gl = this.stage.gl;
        gl.bindTexture(gl.TEXTURE_2D, nativeTexture);
        gl.bindFramebuffer(gl.FRAMEBUFFER, renderTexture.framebuffer);
        const precision = renderTexture.precision;
        gl.copyTexSubImage2D(
            gl.TEXTURE_2D,
            0,
            precision * (options.sx || 0),
            precision * (options.sy || 0),
            precision * (options.x || 0),
            precision * (options.y || 0),
            precision * (options.w || renderTexture.ow),
            precision * (options.h || renderTexture.oh));
    }

}
