/**
 * Copyright Metrological, 2017
 */

let ShaderProgram = require('./ShaderProgram');

class TextureAtlas {

    constructor(stage) {
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

        this.w = 2048;
        this.h = 2048;

        this._activeTree = new TextureAtlasTree(this.w, this.h);

        /**
         * The texture sources that should be on to the texture atlas (active in stage, loaded and with valid dimensions).
         * @type {Set<TextureSource>}
         */
        this._activeTextureSources = new Set();

        /**
         * The texture sources that were added to the texture atlas (since the last defragment).
         * @type {Set<TextureSource>}
         */
        this._addedTextureSources = new Set();

        /**
         * The total surface of the current texture atlas that's being used by unused texture sources.
         * @type {number}
         */
        this._wastedPixels = 0;

        /**
         * The last render frame number that the texture atlas was defragmented on.
         * @type {number}
         */
        this._lastDefragFrame = 0;

        /**
         * Texture atlas size limit.
         * @type {number}
         */
        this._pixelsLimit = this.w * this.h / 16;

        /**
         * The minimal amount of pixels that should be able to be reclaimed when performing a defragment.
         * @type {number}
         */
        this._minWastedPixels = this.w * this.h / 8;

        this._defragNeeded = false;

        /**
         * Pending texture sources to be uploaded.
         * @type {TextureSource[]}
         */
        this._uploads = [];

        this._init();
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
    
    uploadTextureSources(textureSources) {
        let i;

        let n = textureSources.length;
        if (n > 1000) {
            n = 1000;
        }
        for (i = 0; i < n; i++) {

            let w = textureSources[i].w;
            let h = textureSources[i].h;

            let x = textureSources[i].textureAtlasX;
            let y = textureSources[i].textureAtlasY;

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
        }

        let gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.useProgram(this.glProgram);
        gl.viewport(0,0,this.w,this.h);
        gl.blendFunc(gl.ONE, gl.ZERO);
        gl.enable(gl.BLEND);
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
            gl.bindTexture(gl.TEXTURE_2D, textureSources[i].glTexture);
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
    allocate(texture) {
        return this._activeTree.add(texture);
    }

    /**
     * Registers the texture source to the texture atlas.
     * @param {TextureSource} textureSource
     * @pre TextureSource.glTexture !== null
     */    
    addActiveTextureSource(textureSource) {
        if (textureSource.id === 1) {
            // Rectangle texture is automatically added.
        } else {
            if ((textureSource.w * textureSource.h < this._pixelsLimit)) {
                // Only add if dimensions are valid.
                if (!this._activeTextureSources.has(textureSource)) {
                    this._activeTextureSources.add(textureSource);

                    // Add it directly (if possible).
                    if (!this._addedTextureSources.has(textureSource)) {
                        this.add(textureSource);
                    }
                }
            }
        }        
    }

    removeActiveTextureSource(textureSource) {
        if (this._activeTextureSources.has(textureSource)) {
            this._activeTextureSources.delete(textureSource);

            let uploadsIndex = this._uploads.indexOf(textureSource);
            if (uploadsIndex >= 0) {
                // Still waiting to be uploaded.
                this._uploads.splice(uploadsIndex, 1);

                // It is not uploaded, so it's not on the texture atlas any more.
                textureSource.onRemovedFromTextureAtlas();

                this._addedTextureSources.delete(textureSource);
            }

            if (this._addedTextureSources.has(textureSource)) {
                this._wastedPixels += textureSource.w * textureSource.h;
            }
        }        
    }
    
    add(textureSource) {
        let position = this.allocate(textureSource);
        if (position) {
            this._addedTextureSources.add(textureSource);

            textureSource.onAddedToTextureAtlas(position.x + 1, position.y + 1);

            this._uploads.push(textureSource);
        } else {
            this._defragNeeded = true;

            // Error.
            return false;
        }

        return true;        
    }
    
    defragment() {
        console.log('defragment texture atlas');

        // Clear new area (necessary for semi-transparent textures).
        let gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.viewport(0,0,this.w,this.h);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        this._activeTree.reset();
        this._uploads = [];
        this._wastedPixels = 0;
        this._lastDefragFrame = this.stage.frameCounter;
        this._defragNeeded = false;

        this._addedTextureSources.forEach(function(textureSource) {
            textureSource.onRemovedFromTextureAtlas();
        });

        this._addedTextureSources.clear();

        // Automatically re-add the rectangle texture, to make sure that it is at coordinate 0,0.
        this.add(this.stage.rectangleTexture.source);

        // Then (try to) re-add all active texture sources.
        // @todo: sort by dimensions (smallest first)?
        let self = this;
        this._activeTextureSources.forEach(function(textureSource) {
            self.add(textureSource);
        });
    }

    /**
     * Actually uploads the previously added sources to the texture atlas.
     */
    flush() {
        if (this._defragNeeded) {
            // Only defragment when there is something serious to gain.
            if (this._wastedPixels >= this._minWastedPixels) {
                // Limit defragmentations from happening all the time when it can't keep up.
                if (this._lastDefragFrame < this.stage.frameCounter - 300) {
                    this.defragment();
                }
            }
        }

        if (this._uploads.length) {
            this.uploadTextureSources(this._uploads);
            this._uploads = [];
        }
    }

    get glProgram() {
        return this._program.glProgram;
    }

    get gl() {
        return this._program.gl;
    }

}

module.exports = TextureAtlas;

let TextureAtlasTree = require('./TextureAtlasTree');
