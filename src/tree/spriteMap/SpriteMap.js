/**
 * Copyright Metrological, 2017
 */

let ShaderProgram = require('../ShaderProgram');

class SpriteMap {

    constructor(stage, w, h) {
        let vertexShaderSrc = `
            #ifdef GL_ES
            precision lowp float;
            #endif
            attribute vec2 aVertexPosition;
            attribute vec2 aTextureCoord;
            uniform mat4 projectionMatrix;
            varying vec2 vTextureCoord;
            void main(void){
                gl_Position = projectionMatrix * vec4(aVertexPosition, 0.0, 1.0);
                vTextureCoord = aTextureCoord;
            }
        `;

        let fragmentShaderSrc = `
            #ifdef GL_ES
            precision lowp float;
            #endif
            varying vec2 vTextureCoord;
            uniform sampler2D uSampler;
            void main(void){
                gl_FragColor = texture2D(uSampler, vTextureCoord);
            }
        `;

        this._program = new ShaderProgram(vertexShaderSrc, fragmentShaderSrc)
        this._program.compile(stage.gl);

        this.stage = stage;

        this.w = w;
        this.h = h;

        this._allocator = new SpriteMapAllocator(this.w, this.h);

        /**
         * The render frame number that the sprite map was last defragmented on.
         * @type {number}
         */
        this._lastDefragFrame = 0;

        /**
         * Flag that indicates that there was not enough room for all texture sources and a defrag/clear is needed.
         */
        this._full = false

        /**
         * The texture sources that are currently used by the stage and should ideally be on the sprite map.
         * @type {Set}
         * @private
         */
        this._activeTextureSources = new Set();

        this._uploads = []

        this._init();
    }

    _init() {
        let gl = this.gl;

        // Clear current error.
        gl.getError()

        gl.useProgram(this.glProgram);

        // Bind attributes.
        this._vertexPositionAttribute = gl.getAttribLocation(this.glProgram, "aVertexPosition");
        this._textureCoordAttribute = gl.getAttribLocation(this.glProgram, "aTextureCoord");

        // Init webgl arrays.
        // We support up to 1000 textures per call, all consisting out of 9 elements.
        this._paramsBuffer = new ArrayBuffer(16 * 4 * 9 * 1000);
        this._floats = new Float32Array(this._paramsBuffer);

        this._allIndices = new Uint16Array(6 * 9 * 1000);

        // fill the indices with the quads to draw.
        for (let i = 0, j = 0; i < 1000 * 6 * 9; i += 6, j += 4) {
            this._allIndices[i] = j;
            this._allIndices[i + 1] = j + 1;
            this._allIndices[i + 2] = j + 2;
            this._allIndices[i + 3] = j;
            this._allIndices[i + 4] = j + 2;
            this._allIndices[i + 5] = j + 3;
        }

        this._indicesGlBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indicesGlBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._allIndices, gl.STATIC_DRAW);

        // Set transformation matrix.
        // The matrix that causes the [0,0 - w,h] box to map to [-1,-1 - 1,1] in the end results.
        this._projectionMatrix = new Float32Array([
            2/this.w, 0, 0, 0,
            0, 2/this.h, 0, 0,
            0, 0, 1, 0,
            -1, -1, 0, 1
        ]);

        let projectionMatrixAttribute = gl.getUniformLocation(this.glProgram, "projectionMatrix");
        gl.uniformMatrix4fv(projectionMatrixAttribute, false, this._projectionMatrix);

        this.texture = this.gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        this.texture.w = this.w
        this.texture.h = this.h

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.w, this.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);

        // Create framebuffer which can be used to modify the texture.
        this.framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);

        const error = gl.getError()
        if (error != gl.NO_ERROR) {
            throw "Some WebGL error occurred while trying to create framebuffer: " + error;
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    }

    destroy() {
        this.gl.deleteTexture(this.texture);
        this.gl.deleteFramebuffer(this.framebuffer);
        this.gl.deleteBuffer(this.paramsGlBuffer);
        this.gl.deleteBuffer(this._indicesGlBuffer);
        this._program.destroy();
    }

    get lastDefragFrame() {
        return this._lastDefragFrame
    }

    uploadTextures(textureSources) {
        let i;

        let ctr = 0

        const frame = this.stage.frameCounter

        const n = textureSources.length

        const glTextures = []

        for (i = 0; i < n; i++) {
            const ts = textureSources[i]

            if (!ts.glTexture || !ts.smi || !ts.isUsed()) {
                // Texture source is no longer active: ignore.
                continue
            }

            const smi = ts.smi
            smi.f = frame

            let w = ts.w
            let h = ts.h

            let x = smi.x
            let y = smi.y

            let divW = 1 / w;
            let divH = 1 / h;

            let offset = glTextures.length * 16 * 9;

            // Add 2px margin to avoid edge artifacts.

            // Full area.
            const fs = this._floats
            fs[offset] = x;
            fs[offset + 1] = y;
            fs[offset + 4] = x + w;
            fs[offset + 5] = y;
            fs[offset + 8] = x + w;
            fs[offset + 9] = y + h;
            fs[offset + 12] = x;
            fs[offset + 13] = y + h;

            // Top row.
            fs[offset + 16] = x;
            fs[offset + 17] = y - 1;
            fs[offset + 20] = x + w;
            fs[offset + 21] = y - 1;
            fs[offset + 24] = x + w;
            fs[offset + 25] = y;
            fs[offset + 28] = x;
            fs[offset + 29] = y;

            // Bottom row.
            fs[offset + 32] = x;
            fs[offset + 33] = y + h;
            fs[offset + 36] = x + w;
            fs[offset + 37] = y + h;
            fs[offset + 40] = x + w;
            fs[offset + 41] = y + h + 1;
            fs[offset + 44] = x;
            fs[offset + 45] = y + h + 1;

            // Left row.
            fs[offset + 48] = x - 1;
            fs[offset + 49] = y;
            fs[offset + 52] = x;
            fs[offset + 53] = y;
            fs[offset + 56] = x;
            fs[offset + 57] = y + h;
            fs[offset + 60] = x - 1;
            fs[offset + 61] = y + h;

            // Right row.
            fs[offset + 64] = x + w;
            fs[offset + 65] = y;
            fs[offset + 68] = x + w + 1;
            fs[offset + 69] = y;
            fs[offset + 72] = x + w + 1;
            fs[offset + 73] = y + h;
            fs[offset + 76] = x + w;
            fs[offset + 77] = y + h;

            // Upper-left.
            fs[offset + 80] = x - 1;
            fs[offset + 81] = y - 1;
            fs[offset + 84] = x;
            fs[offset + 85] = y - 1;
            fs[offset + 88] = x;
            fs[offset + 89] = y;
            fs[offset + 92] = x - 1;
            fs[offset + 93] = y;

            // Upper-right.
            fs[offset + 96] = x + w;
            fs[offset + 97] = y - 1;
            fs[offset + 100] = x + w + 1;
            fs[offset + 101] = y - 1;
            fs[offset + 104] = x + w + 1;
            fs[offset + 105] = y;
            fs[offset + 108] = x + w;
            fs[offset + 109] = y;

            // Lower-right.
            fs[offset + 112] = x + w;
            fs[offset + 113] = y + h;
            fs[offset + 116] = x + w + 1;
            fs[offset + 117] = y + h;
            fs[offset + 120] = x + w + 1;
            fs[offset + 121] = y + h + 1;
            fs[offset + 124] = x + w;
            fs[offset + 125] = y + h + 1;

            // Lower-left.
            fs[offset + 128] = x - 1;
            fs[offset + 129] = y + h;
            fs[offset + 132] = x;
            fs[offset + 133] = y + h;
            fs[offset + 136] = x;
            fs[offset + 137] = y + h + 1;
            fs[offset + 140] = x - 1;
            fs[offset + 141] = y + h + 1;

            // Texture coords.
            fs[offset + 2] = 0;
            fs[offset + 3] = 0;
            fs[offset + 6] = 1;
            fs[offset + 7] = 0;
            fs[offset + 10] = 1;
            fs[offset + 11] = 1;
            fs[offset + 14] = 0;
            fs[offset + 15] = 1;

            fs[offset + 18] = 0;
            fs[offset + 19] = 0;
            fs[offset + 22] = 1;
            fs[offset + 23] = 0;
            fs[offset + 26] = 1;
            fs[offset + 27] = divH;
            fs[offset + 30] = 0;
            fs[offset + 31] = divH;

            fs[offset + 34] = 0;
            fs[offset + 35] = 1 - divH;
            fs[offset + 38] = 1;
            fs[offset + 39] = 1 - divH;
            fs[offset + 42] = 1;
            fs[offset + 43] = 1;
            fs[offset + 46] = 0;
            fs[offset + 47] = 1;

            fs[offset + 50] = 0;
            fs[offset + 51] = 0;
            fs[offset + 54] = divW;
            fs[offset + 55] = 0;
            fs[offset + 58] = divW;
            fs[offset + 59] = 1;
            fs[offset + 62] = 0;
            fs[offset + 63] = 1;

            fs[offset + 66] = 1 - divW;
            fs[offset + 67] = 0;
            fs[offset + 70] = 1;
            fs[offset + 71] = 0;
            fs[offset + 74] = 1;
            fs[offset + 75] = 1;
            fs[offset + 78] = 1 - divW;
            fs[offset + 79] = 1;

            fs[offset + 82] = 0;
            fs[offset + 83] = 0;
            fs[offset + 86] = divW;
            fs[offset + 87] = 0;
            fs[offset + 90] = divW;
            fs[offset + 91] = divH;
            fs[offset + 94] = 0;
            fs[offset + 95] = divH;

            fs[offset + 98] = 1 - divW;
            fs[offset + 99] = 0;
            fs[offset + 102] = 1;
            fs[offset + 103] = 0;
            fs[offset + 106] = 1;
            fs[offset + 107] = divH;
            fs[offset + 110] = 1 - divW;
            fs[offset + 111] = divH;

            fs[offset + 114] = 1 - divW;
            fs[offset + 115] = 1 - divH;
            fs[offset + 118] = 1;
            fs[offset + 119] = 1 - divH;
            fs[offset + 122] = 1;
            fs[offset + 123] = 1;
            fs[offset + 126] = 1 - divW;
            fs[offset + 127] = 1;

            fs[offset + 130] = 0;
            fs[offset + 131] = 1 - divH;
            fs[offset + 134] = divW;
            fs[offset + 135] = 1 - divH;
            fs[offset + 138] = divW;
            fs[offset + 139] = 1;
            fs[offset + 142] = 0;
            fs[offset + 143] = 1;

            if (smi.rotate) {
                // Rotate all points, in such a way that the upper-left point is still on (x,y).
                for (let j = 0; j < 9 * 4; j++) {
                    const o = offset + j * 4
                    const xc = fs[o] - x
                    const yc = fs[o + 1] - y
                    fs[o] = yc + x
                    fs[o + 1] = xc + y
                }
            }

            glTextures.push(ts.glTexture)

        }

        let gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.useProgram(this.glProgram);
        gl.viewport(0,0,this.w,this.h);
        gl.blendFunc(gl.ONE, gl.ZERO);
        gl.enable(gl.BLEND);
        gl.disable(gl.SCISSOR_TEST);
        gl.disable(gl.DEPTH_TEST);

        // Upload data.
        this.paramsGlBuffer = this.paramsGlBuffer || gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.paramsGlBuffer);

        // We want to send the first elements from the params buffer, so we allCoords in order to slice some off.
        let view = new DataView(this._paramsBuffer, 0, 16 * 9 * 4 * n);
        gl.bufferData(gl.ARRAY_BUFFER, view, gl.DYNAMIC_DRAW);

        gl.vertexAttribPointer(this._vertexPositionAttribute, 2, gl.FLOAT, false, 16, 0);
        gl.vertexAttribPointer(this._textureCoordAttribute, 2, gl.FLOAT, false, 16, 2 * 4);

        gl.enableVertexAttribArray(this._vertexPositionAttribute);
        gl.enableVertexAttribArray(this._textureCoordAttribute);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indicesGlBuffer);

        const m = glTextures.length
        for (i = 0; i < m; i++) {
            gl.bindTexture(gl.TEXTURE_2D, glTextures[i]);
            gl.drawElements(gl.TRIANGLES, 6 * 9, gl.UNSIGNED_SHORT, i * 6 * 9 * 2);
        }

        gl.disableVertexAttribArray(this._vertexPositionAttribute);
        gl.disableVertexAttribArray(this._textureCoordAttribute);
    }

    shouldBeAdded(textureSource) {
        // Spritemap texture should only be added/used when the texcoords are within [0,1].
        // Currently, out-of-bounds texture coords (for repeating textures) are not supported in the render engine.
        if (textureSource.w && textureSource.h && (Math.min(textureSource.w, textureSource.h) < 510 /* 512px - 2px border */) && textureSource.w * textureSource.h < 131072 /* 512x256*/) {
            const gl = this.gl
            const texture = textureSource.glTexture
            if (texture &&
                texture.params &&
                texture.params[gl.TEXTURE_WRAP_S] === gl.CLAMP_TO_EDGE &&
                texture.params[gl.TEXTURE_WRAP_T] === gl.CLAMP_TO_EDGE) {
                // Do not use spritemap for repeating textures because they rely on the [0,1] texture coords window.
                return true
            }
        }
        return false
    }

    add(textureSource) {
        this._activeTextureSources.add(textureSource)
        this._add(textureSource)
    }

    /**
     * Adds the specified texture source to the sprite map
     * @param {TextureSource} textureSource
     */
    _add(textureSource, defrag = false) {
        if (this._uploads.length >= 1000) {
            // We can't upload so many textures. Just don't put it on the sprite map.
            textureSource.smi = null
            return
        }

        if (textureSource.smi &&
            (textureSource.smi.f > 0) &&
            (textureSource.smi.f >= this._lastDefragFrame) &&
            !defrag) {
            // Reuse already known sprite map entry.
            return
        }

        // Add margin for border, needed for consistent results when using GL_LINEAR texture interpolation.
        let w = textureSource.w + 2
        let h = textureSource.h + 2
        const rotate = h > w

        if (rotate) {
            const t = h
            h = w
            w = t
        }
        const info = this._allocator.allocate(w, h);

        if (info) {
            textureSource.smi = new SpriteMapInfo(this, textureSource, info.x + 1, info.y + 1, rotate)
            this._uploads.push(textureSource)
        } else {
            textureSource.smi = null
            this._full = true
        }
    }

    has(textureSource) {
        return !!textureSource.smi
    }

    remove(textureSource) {
        this._activeTextureSources.delete(textureSource)
    }

    invalidate(textureSource) {
        // When the texture source is removed, the smi is kept so that it may be reused.
        // In case of a manual glTexture change (see TextureSource.forceRenderUpdate), this is necessary.
        textureSource.smi = null
    }

    defrag() {
        console.log('defrag sprite map');

        // Clear new area (necessary for semi-transparent textures).
        let gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.viewport(0,0,this.w,this.h);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        this._allocator.reset();
        this._uploads = [];
        this._lastDefragFrame = this.stage.frameCounter;
        this._full = false

        // Now, re-add all texture sources.
        this._activeTextureSources.forEach(textureSource => {
            this._add(textureSource, true)
            textureSource.forceUpdateRenderCoords()
        })
    }

    /**
     * Actually uploads the previously added sources to the sprite map.
     */
    flush() {
        if (this._uploads.length) {
            this.uploadTextures(this._uploads);
            this._uploads = [];
        }
    }

    mustDefrag() {
        return this._full && (this._lastDefragFrame < this.stage.frameCounter - 180)
    }

    mustFlush() {
        return this._uploads.length
    }

    mustExecute() {
        return this.mustDefrag() || this.mustFlush()
    }

    execute() {
        if (this.mustDefrag()) {
            this.defrag()
        }

        this.flush()
    }

    get glProgram() {
        return this._program.glProgram;
    }

    get gl() {
        return this._program.gl;
    }

}

class SpriteMapInfo {
    
    constructor(sm, ts, x, y, rotate) {
        this._sm = sm
        this._ts = ts
        this.f = 0  // Frame uploaded.
        this.x = x
        this.y = y
        this.rotate = rotate
    }

    getTexCoords() {
        const w = this.rotate ? this._ts.h : this._ts.w
        const h = this.rotate ? this._ts.w : this._ts.h

        return [
            (this.x / this._sm.w),
            (this.y / this._sm.h),
            ((this.x + w) / this._sm.w),
            ((this.y + h) / this._sm.h)
        ]
    }

    changeTexCoords(c) {
        if (this.rotate) {
            // ul
            let t = c[0]
            c[0] = (this.x + (this._ts.h * c[1])) / this._sm.w
            c[1] = (this.y + (this._ts.w * (1 - t))) / this._sm.h

            // br
            t = c[2]
            c[2] = (this.x + (this._ts.h * c[3])) / this._sm.w
            c[3] = (this.y + (this._ts.w * (1 - t))) / this._sm.h
        } else {
            // ul
            c[0] = (this.x + (c[0] * this._ts.w)) / this._sm.w
            c[1] = (this.y + (c[1] * this._ts.h)) / this._sm.h

            // br
            c[2] = (this.x + (c[2] * this._ts.w)) / this._sm.w
            c[3] = (this.y + (c[3] * this._ts.h)) / this._sm.h
        }
    }
    
}

module.exports = SpriteMap;

let SpriteMapAllocator = require('./SpriteMapAllocator');
