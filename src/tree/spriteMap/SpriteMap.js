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
         * The render frame number that the sprite map was last cleared on.
         * @type {number}
         */
        this._lastClearFrame = 0;

        /**
         * Pending texture sources to be uploaded.
         * @type {{x: number, y: number, texture: WebGLTexture}[]}
         */
        this._uploads = [];

        this._init();
    }

    get lastClearFrame() {
        return this._lastClearFrame
    }

    _init() {
        let gl = this.gl;

        gl.useProgram(this.glProgram);

        // Bind attributes.
        this._vertexPositionAttribute = gl.getAttribLocation(this.glProgram, "aVertexPosition");
        this._textureCoordAttribute = gl.getAttribLocation(this.glProgram, "aTextureCoord");

        // Init webgl arrays.
        // We support up to 1000 textures per call, all consisting out of 9 elements.
        this._paramsBuffer = new ArrayBuffer(16 * 4 * 9 * 1000);
        this._allCoords = new Float32Array(this._paramsBuffer);
        this._allTexCoords = new Float32Array(this._paramsBuffer);

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
        if (gl.getError() != gl.NO_ERROR) {
            throw "Some WebGL error occurred while trying to create framebuffer.";
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
    
    uploadTextures(textures) {
        let i;

        let n = textures.length;
        if (n > 1000) {
            // Max upload space.
            n = 1000;
        }

        const frame = this.stage.frameCounter

        for (i = 0; i < n; i++) {

            const texture = textures[i]
            const smi = texture.smi
            smi._f = frame

            let w = texture.w
            let h = texture.h

            let x = smi.x
            let y = smi.y

            let divW = 1 / w;
            let divH = 1 / h;

            let offset = i * 16 * 9;

            // Add 2px margin to avoid edge artifacts.

            // Full area.
            this._allCoords[offset + 0] = x;
            this._allCoords[offset + 1] = y;
            this._allCoords[offset + 4] = x + w;
            this._allCoords[offset + 5] = y;
            this._allCoords[offset + 8] = x + w;
            this._allCoords[offset + 9] = y + h;
            this._allCoords[offset + 12] = x;
            this._allCoords[offset + 13] = y + h;

            // Top row.
            this._allCoords[offset + 16] = x;
            this._allCoords[offset + 17] = y - 1;
            this._allCoords[offset + 20] = x + w;
            this._allCoords[offset + 21] = y - 1;
            this._allCoords[offset + 24] = x + w;
            this._allCoords[offset + 25] = y;
            this._allCoords[offset + 28] = x;
            this._allCoords[offset + 29] = y;

            // Bottom row.
            this._allCoords[offset + 32] = x;
            this._allCoords[offset + 33] = y + h;
            this._allCoords[offset + 36] = x + w;
            this._allCoords[offset + 37] = y + h;
            this._allCoords[offset + 40] = x + w;
            this._allCoords[offset + 41] = y + h + 1;
            this._allCoords[offset + 44] = x;
            this._allCoords[offset + 45] = y + h + 1;

            // Left row.
            this._allCoords[offset + 48] = x - 1;
            this._allCoords[offset + 49] = y;
            this._allCoords[offset + 52] = x;
            this._allCoords[offset + 53] = y;
            this._allCoords[offset + 56] = x;
            this._allCoords[offset + 57] = y + h;
            this._allCoords[offset + 60] = x - 1;
            this._allCoords[offset + 61] = y + h;

            // Right row.
            this._allCoords[offset + 64] = x + w;
            this._allCoords[offset + 65] = y;
            this._allCoords[offset + 68] = x + w + 1;
            this._allCoords[offset + 69] = y;
            this._allCoords[offset + 72] = x + w + 1;
            this._allCoords[offset + 73] = y + h;
            this._allCoords[offset + 76] = x + w;
            this._allCoords[offset + 77] = y + h;

            // Upper-left.
            this._allCoords[offset + 80] = x - 1;
            this._allCoords[offset + 81] = y - 1;
            this._allCoords[offset + 84] = x;
            this._allCoords[offset + 85] = y - 1;
            this._allCoords[offset + 88] = x;
            this._allCoords[offset + 89] = y;
            this._allCoords[offset + 92] = x - 1;
            this._allCoords[offset + 93] = y;

            // Upper-right.
            this._allCoords[offset + 96] = x + w;
            this._allCoords[offset + 97] = y - 1;
            this._allCoords[offset + 100] = x + w + 1;
            this._allCoords[offset + 101] = y - 1;
            this._allCoords[offset + 104] = x + w + 1;
            this._allCoords[offset + 105] = y;
            this._allCoords[offset + 108] = x + w;
            this._allCoords[offset + 109] = y;

            // Lower-right.
            this._allCoords[offset + 112] = x + w;
            this._allCoords[offset + 113] = y + h;
            this._allCoords[offset + 116] = x + w + 1;
            this._allCoords[offset + 117] = y + h;
            this._allCoords[offset + 120] = x + w + 1;
            this._allCoords[offset + 121] = y + h + 1;
            this._allCoords[offset + 124] = x + w;
            this._allCoords[offset + 125] = y + h + 1;

            // Lower-left.
            this._allCoords[offset + 128] = x - 1;
            this._allCoords[offset + 129] = y + h;
            this._allCoords[offset + 132] = x;
            this._allCoords[offset + 133] = y + h;
            this._allCoords[offset + 136] = x;
            this._allCoords[offset + 137] = y + h + 1;
            this._allCoords[offset + 140] = x - 1;
            this._allCoords[offset + 141] = y + h + 1;

            // Texture coords.
            this._allTexCoords[offset + 2] = 0;
            this._allTexCoords[offset + 3] = 0;
            this._allTexCoords[offset + 6] = 1;
            this._allTexCoords[offset + 7] = 0;
            this._allTexCoords[offset + 10] = 1;
            this._allTexCoords[offset + 11] = 1;
            this._allTexCoords[offset + 14] = 0;
            this._allTexCoords[offset + 15] = 1;

            this._allTexCoords[offset + 18] = 0;
            this._allTexCoords[offset + 19] = 0;
            this._allTexCoords[offset + 22] = 1;
            this._allTexCoords[offset + 23] = 0;
            this._allTexCoords[offset + 26] = 1;
            this._allTexCoords[offset + 27] = divH;
            this._allTexCoords[offset + 30] = 0;
            this._allTexCoords[offset + 31] = divH;

            this._allTexCoords[offset + 34] = 0;
            this._allTexCoords[offset + 35] = 1 - divH;
            this._allTexCoords[offset + 38] = 1;
            this._allTexCoords[offset + 39] = 1 - divH;
            this._allTexCoords[offset + 42] = 1;
            this._allTexCoords[offset + 43] = 1;
            this._allTexCoords[offset + 46] = 0;
            this._allTexCoords[offset + 47] = 1;

            this._allTexCoords[offset + 50] = 0;
            this._allTexCoords[offset + 51] = 0;
            this._allTexCoords[offset + 54] = divW;
            this._allTexCoords[offset + 55] = 0;
            this._allTexCoords[offset + 58] = divW;
            this._allTexCoords[offset + 59] = 1;
            this._allTexCoords[offset + 62] = 0;
            this._allTexCoords[offset + 63] = 1;

            this._allTexCoords[offset + 66] = 1 - divW;
            this._allTexCoords[offset + 67] = 0;
            this._allTexCoords[offset + 70] = 1;
            this._allTexCoords[offset + 71] = 0;
            this._allTexCoords[offset + 74] = 1;
            this._allTexCoords[offset + 75] = 1;
            this._allTexCoords[offset + 78] = 1 - divW;
            this._allTexCoords[offset + 79] = 1;

            this._allTexCoords[offset + 82] = 0;
            this._allTexCoords[offset + 83] = 0;
            this._allTexCoords[offset + 86] = divW;
            this._allTexCoords[offset + 87] = 0;
            this._allTexCoords[offset + 90] = divW;
            this._allTexCoords[offset + 91] = divH;
            this._allTexCoords[offset + 94] = 0;
            this._allTexCoords[offset + 95] = divH;

            this._allTexCoords[offset + 98] = 1 - divW;
            this._allTexCoords[offset + 99] = 0;
            this._allTexCoords[offset + 102] = 1;
            this._allTexCoords[offset + 103] = 0;
            this._allTexCoords[offset + 106] = 1;
            this._allTexCoords[offset + 107] = divH;
            this._allTexCoords[offset + 110] = 1 - divW;
            this._allTexCoords[offset + 111] = divH;

            this._allTexCoords[offset + 114] = 1 - divW;
            this._allTexCoords[offset + 115] = 1 - divH;
            this._allTexCoords[offset + 118] = 1;
            this._allTexCoords[offset + 119] = 1 - divH;
            this._allTexCoords[offset + 122] = 1;
            this._allTexCoords[offset + 123] = 1;
            this._allTexCoords[offset + 126] = 1 - divW;
            this._allTexCoords[offset + 127] = 1;

            this._allTexCoords[offset + 130] = 0;
            this._allTexCoords[offset + 131] = 1 - divH;
            this._allTexCoords[offset + 134] = divW;
            this._allTexCoords[offset + 135] = 1 - divH;
            this._allTexCoords[offset + 138] = divW;
            this._allTexCoords[offset + 139] = 1;
            this._allTexCoords[offset + 142] = 0;
            this._allTexCoords[offset + 143] = 1;

            if (smi.rotate) {
                // Rotate all points, in such a way that the upper-left point is still on (x,y).
                for (let j = 0; j < 9 * 4; j++) {
                    const o = offset + j * 4
                    const xc = this._allCoords[o] - x
                    const yc = this._allCoords[o + 1] - y
                    this._allCoords[o] = yc + x
                    this._allCoords[o + 1] = xc + y
                }
            }
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

        for (i = 0; i < n; i++) {
            gl.bindTexture(gl.TEXTURE_2D, textures[i]);
            gl.drawElements(gl.TRIANGLES, 6 * 9, gl.UNSIGNED_SHORT, i * 6 * 9 * 2);
        }

        gl.disableVertexAttribArray(this._vertexPositionAttribute);
        gl.disableVertexAttribArray(this._textureCoordAttribute);
    }

    /**
     * Allocates space for a loaded texture.
     * @param texture
     * @return {{x: number, y: number}|null}
     *   The allocated position.
     */
    _allocate(texture) {
        if (texture.smi && texture.smi._f >= this._lastClearFrame) {
            // We can reuse the same position!
            return true
        }

        // Add margin for border, needed for consistent results when using GL_LINEAR texture interpolation.
        let w = texture.w + 2
        let h = texture.h + 2
        const rotate = h > w

        if (rotate) {
            const t = h
            h = w
            w = t
        }
        const info = this._allocator.allocate(w, h);

        if (info) {
            texture.smi = new SpriteMapInfo(this, texture, info.x + 1, info.y + 1, rotate)
            return true
        }
        return false
    }

    shouldBeAdded(texture) {
        // Spritemap texture should only be added/used when the texcoords are within [0,1].
        // Currently, out-of-bounds texture coords (for repeating textures) are not supported in the render engine.
        if (texture.w && texture.h && (Math.min(texture.w, texture.h) < 510 /* 512px - 2px border */) && texture.w * texture.h < 131072) {
            const gl = this.gl
            if (texture.params && texture.params[gl.TEXTURE_WRAP_S] === gl.CLAMP_TO_EDGE && texture.params[gl.TEXTURE_WRAP_T] === gl.CLAMP_TO_EDGE) {
                return true
            }
        }
        return false
    }

    add(texture) {
        if (this._allocate(texture)) {
            this._uploads.push(texture)
            return true
        } else {
            // Does not fit!
            return false
        }
    }
    
    clear() {
        console.log('clear sprite map');

        // Clear new area (necessary for semi-transparent textures).
        let gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.viewport(0,0,this.w,this.h);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        this._allocator.reset();
        this._uploads = [];
        this._lastClearFrame = this.stage.frameCounter;
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

    mustFlush() {
        return this._uploads.length
    }

    get glProgram() {
        return this._program.glProgram;
    }

    get gl() {
        return this._program.gl;
    }

}

class SpriteMapInfo {
    
    constructor(spriteMap, texture, x, y, rotate) {
        this._spriteMap = spriteMap
        this._texture = texture
        this._x = x
        this._y = y
        this._rotate = rotate

        this._precalcTexCoords()
    }

    get x() {
        return this._x
    }

    get y() {
        return this._y
    }

    get rotate() {
        return this._rotate
    }

    _precalcTexCoords() {
        const w = this._rotate ? this._texture.h : this._texture.w
        const h = this._rotate ? this._texture.w : this._texture.h

        // Add border margin.
        const x = this._x
        const y = this._y

        const ulx = x / this._spriteMap.w
        const uly = y / this._spriteMap.h
        const brx = (x + w) / this._spriteMap.w
        const bry = (y + h) / this._spriteMap.h
        this.txCoordUl = ((ulx * 65535 + 0.5) | 0) + ((uly * 65535 + 0.5) | 0) * 65536;

        this.txCoordBr = ((brx * 65535 + 0.5) | 0) + ((bry * 65535 + 0.5) | 0) * 65536;
        if (this._rotate) {
            this.txCoordUr = ((ulx * 65535 + 0.5) | 0) + ((bry * 65535 + 0.5) | 0) * 65536;
            this.txCoordBl = ((brx * 65535 + 0.5) | 0) + ((uly * 65535 + 0.5) | 0) * 65536;
        } else {
            this.txCoordUr = ((brx * 65535 + 0.5) | 0) + ((uly * 65535 + 0.5) | 0) * 65536;
            this.txCoordBl = ((ulx * 65535 + 0.5) | 0) + ((bry * 65535 + 0.5) | 0) * 65536;
        }
    }

    isInSpriteMap() {
        return (this._f >= this._spriteMap._lastClearFrame) && (this._texture.update <= this._f)
    }
    
}

module.exports = SpriteMap;

let SpriteMapAllocator = require('./SpriteMapAllocator');
