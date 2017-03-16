var isNode = !!(((typeof module !== "undefined") && module.exports));

if (isNode) {
    var Utils = require('./Utils');
}

/**
 * The texture atlas which contains a single spritemap with all active textures.
 * @constructor
 */
function TextureAtlas(stage, gl) {

    this.stage = stage;

    this.w = 2048;
    this.h = 2048;

    // The structure of the active partition.
    this.activeTree = new TextureAtlasTree(this.w, this.h);

    /**
     * The texture sources that should be on to the texture atlas (active in stage, loaded and with valid dimensions).
     * @type {Set<TextureSource>}
     */
    this.activeTextureSources = new Set();

    /**
     * The texture sources that were added to the texture atlas (since the last defragment).
     * @type {Set<TextureSource>}
     */
    this.addedTextureSources = new Set();

    /**
     * The total surface of the current texture atlas that's being used by unused texture sources.
     * @type {number}
     */
    this.wastedPixels = 0;
    
    /**
     * The frame number that an import last took place.
     * This is used in order to prevent
     * @type {number}
     */
    this.lastImportFrame = 0;

    /**
     * @type {WebGLRenderingContext}
     */
    this.gl = gl;

    this.vertexShaderSrc = [
        "#ifdef GL_ES",
        "precision lowp float;",
        "#endif",
        "attribute vec2 aVertexPosition;",
        "attribute vec2 aTextureCoord;",
        "uniform mat4 projectionMatrix;",
        "varying vec2 vTextureCoord;",
        "void main(void){",
        "    gl_Position = projectionMatrix * vec4(aVertexPosition, 0.0, 1.0);",
        "    vTextureCoord = aTextureCoord;",
        "}"
    ].join("\n");

    this.fragmentShaderSrc = [
        "#ifdef GL_ES",
        "precision lowp float;",
        "#endif",
        "varying vec2 vTextureCoord;",
        "uniform sampler2D uSampler;",
        "void main(void){",
        "    gl_FragColor = texture2D(uSampler, vTextureCoord);",
        "}"
    ].join("\n");

    this.program = null;

    /**
     * The last render frame number that the texture atlas was defragmented on.
     * @type {number}
     */
    this.lastDefragFrame = 0;

    /**
     * Texture atlas size limit.
     * @type {number}
     */
    this.pixelsLimit = this.w * this.h / 32;

    /**
     * The minimal amount of pixels that should be able to be reclaimed when performing a defragment.
     * @type {number}
     */
    this.minWastedPixels = this.w * this.h / 8;

    this.defragNeeded = false;

    /**
     * Pending texture sources to be uploaded.
     * @type {TextureSource[]}
     */
    this.uploads = [];

    // The matrix that causes the [0,0 - w,h] box to map to [-1,-1 - 1,1] in the end results.
    this.projectionMatrix = new Float32Array([
        2/this.w, 0, 0, 0,
        0, 2/this.h, 0, 0,
        0, 0, 1, 0,
        -1, -1, 0, 1
    ]);

    this.initShaderProgram();

    var gl = this.gl;

    this.texture = this.gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.w, this.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(this.w * this.h * 4));
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

    // Set transformation matrix.
    var projectionMatrixAttribute = gl.getUniformLocation(this.program, "projectionMatrix");
    gl.uniformMatrix4fv(projectionMatrixAttribute, false, this.projectionMatrix);

}

TextureAtlas.prototype.destroy = function() {
    this.gl.deleteTexture(this.texture);
    this.gl.deleteFramebuffer(this.framebuffer);
    this.gl.deleteBuffer(this.paramsGlBuffer);
    this.gl.deleteBuffer(this.indicesGlBuffer);
    this.gl.deleteProgram(this.program);
};

/**
 * @access private
 */
TextureAtlas.prototype.initShaderProgram = function() {
    var gl = this.gl;

    var glVertShader = this.glCompile(gl.VERTEX_SHADER, this.vertexShaderSrc);
    var glFragShader = this.glCompile(gl.FRAGMENT_SHADER, this.fragmentShaderSrc);

    this.program = gl.createProgram();

    gl.attachShader(this.program, glVertShader);
    gl.attachShader(this.program, glFragShader);
    gl.linkProgram(this.program);

    // if linking fails, then log and cleanup
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        console.error('Error: Could not initialize shader.');
        console.error('gl.VALIDATE_STATUS', gl.getProgramParameter(this.program, gl.VALIDATE_STATUS));
        console.error('gl.getError()', gl.getError());

        // if there is a program info log, log it
        if (gl.getProgramInfoLog(this.program) !== '') {
            console.warn('Warning: gl.getProgramInfoLog()', gl.getProgramInfoLog(this.program));
        }

        gl.deleteProgram(this.program);
        this.program = null;
    }
    gl.useProgram(this.program);

    // clean up some shaders
    gl.deleteShader(glVertShader);
    gl.deleteShader(glFragShader);

    // Bind attributes.
    this.vertexPositionAttribute = gl.getAttribLocation(this.program, "aVertexPosition");
    this.textureCoordAttribute = gl.getAttribLocation(this.program, "aTextureCoord");

    // Init webgl arrays.
    // We support up to 1000 textures per call, all consisting out of 9 elements.
    this.paramsBuffer = new ArrayBuffer(16 * 4 * 9 * 1000);
    this.allCoords = new Float32Array(this.paramsBuffer);
    this.allTexCoords = new Float32Array(this.paramsBuffer);

    this.allIndices = new Uint16Array(6 * 9 * 1000);

    // fill the indices with the quads to draw.
    for (var i = 0, j = 0; i < 1000 * 6 * 9; i += 6, j += 4) {
        this.allIndices[i] = j;
        this.allIndices[i + 1] = j + 1;
        this.allIndices[i + 2] = j + 2;
        this.allIndices[i + 3] = j;
        this.allIndices[i + 4] = j + 2;
        this.allIndices[i + 5] = j + 3;
    }

    this.indicesGlBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesGlBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.allIndices, gl.STATIC_DRAW);

    // Set transformation matrix.
    var projectionMatrixAttribute = gl.getUniformLocation(this.program, "projectionMatrix");
    gl.uniformMatrix4fv(projectionMatrixAttribute, false, this.projectionMatrix);

};

/**
 * @access private
 */
TextureAtlas.prototype.glCompile = function (type, src) {
    var shader = this.gl.createShader(type);

    this.gl.shaderSource(shader, src);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        console.log(this.gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
};

/**
 * @access private
 */
TextureAtlas.prototype.uploadTextureSources = function(textureSources) {
    var i;

    var n = textureSources.length;
    if (n > 1000) {
        n = 1000;
    }
    for (i = 0; i < n; i++) {

        var w = textureSources[i].w;
        var h = textureSources[i].h;

        var x = textureSources[i].textureAtlasX;
        var y = textureSources[i].textureAtlasY;

        var divW = 1 / w;
        var divH = 1 / h;

        var offset = i * 16 * 9;

        // Add 2px margin to avoid edge artifacts.

        // Full area.
        this.allCoords[offset + 0] = x;
        this.allCoords[offset + 1] = y;
        this.allCoords[offset + 4] = x + w;
        this.allCoords[offset + 5] = y;
        this.allCoords[offset + 8] = x + w;
        this.allCoords[offset + 9] = y + h;
        this.allCoords[offset + 12] = x;
        this.allCoords[offset + 13] = y + h;

        // Top row.
        this.allCoords[offset + 16] = x;
        this.allCoords[offset + 17] = y - 1;
        this.allCoords[offset + 20] = x + w;
        this.allCoords[offset + 21] = y - 1;
        this.allCoords[offset + 24] = x + w;
        this.allCoords[offset + 25] = y;
        this.allCoords[offset + 28] = x;
        this.allCoords[offset + 29] = y;

        // Bottom row.
        this.allCoords[offset + 32] = x;
        this.allCoords[offset + 33] = y + h;
        this.allCoords[offset + 36] = x + w;
        this.allCoords[offset + 37] = y + h;
        this.allCoords[offset + 40] = x + w;
        this.allCoords[offset + 41] = y + h + 1;
        this.allCoords[offset + 44] = x;
        this.allCoords[offset + 45] = y + h + 1;

        // Left row.
        this.allCoords[offset + 48] = x - 1;
        this.allCoords[offset + 49] = y;
        this.allCoords[offset + 52] = x;
        this.allCoords[offset + 53] = y;
        this.allCoords[offset + 56] = x;
        this.allCoords[offset + 57] = y + h;
        this.allCoords[offset + 60] = x - 1;
        this.allCoords[offset + 61] = y + h;

        // Right row.
        this.allCoords[offset + 64] = x + w;
        this.allCoords[offset + 65] = y;
        this.allCoords[offset + 68] = x + w + 1;
        this.allCoords[offset + 69] = y;
        this.allCoords[offset + 72] = x + w + 1;
        this.allCoords[offset + 73] = y + h;
        this.allCoords[offset + 76] = x + w;
        this.allCoords[offset + 77] = y + h;

        // Upper-left.
        this.allCoords[offset + 80] = x - 1;
        this.allCoords[offset + 81] = y - 1;
        this.allCoords[offset + 84] = x;
        this.allCoords[offset + 85] = y - 1;
        this.allCoords[offset + 88] = x;
        this.allCoords[offset + 89] = y;
        this.allCoords[offset + 92] = x - 1;
        this.allCoords[offset + 93] = y;

        // Upper-right.
        this.allCoords[offset + 96] = x + w;
        this.allCoords[offset + 97] = y - 1;
        this.allCoords[offset + 100] = x + w + 1;
        this.allCoords[offset + 101] = y - 1;
        this.allCoords[offset + 104] = x + w + 1;
        this.allCoords[offset + 105] = y;
        this.allCoords[offset + 108] = x + w;
        this.allCoords[offset + 109] = y;

        // Lower-right.
        this.allCoords[offset + 112] = x + w;
        this.allCoords[offset + 113] = y + h;
        this.allCoords[offset + 116] = x + w + 1;
        this.allCoords[offset + 117] = y + h;
        this.allCoords[offset + 120] = x + w + 1;
        this.allCoords[offset + 121] = y + h + 1;
        this.allCoords[offset + 124] = x + w;
        this.allCoords[offset + 125] = y + h + 1;

        // Lower-left.
        this.allCoords[offset + 128] = x - 1;
        this.allCoords[offset + 129] = y + h;
        this.allCoords[offset + 132] = x;
        this.allCoords[offset + 133] = y + h;
        this.allCoords[offset + 136] = x;
        this.allCoords[offset + 137] = y + h + 1;
        this.allCoords[offset + 140] = x - 1;
        this.allCoords[offset + 141] = y + h + 1;

        // Texture coords.
        this.allTexCoords[offset + 2] = 0;
        this.allTexCoords[offset + 3] = 0;
        this.allTexCoords[offset + 6] = 1;
        this.allTexCoords[offset + 7] = 0;
        this.allTexCoords[offset + 10] = 1;
        this.allTexCoords[offset + 11] = 1;
        this.allTexCoords[offset + 14] = 0;
        this.allTexCoords[offset + 15] = 1;

        this.allTexCoords[offset + 18] = 0;
        this.allTexCoords[offset + 19] = 0;
        this.allTexCoords[offset + 22] = 1;
        this.allTexCoords[offset + 23] = 0;
        this.allTexCoords[offset + 26] = 1;
        this.allTexCoords[offset + 27] = divH;
        this.allTexCoords[offset + 30] = 0;
        this.allTexCoords[offset + 31] = divH;

        this.allTexCoords[offset + 34] = 0;
        this.allTexCoords[offset + 35] = 1 - divH;
        this.allTexCoords[offset + 38] = 1;
        this.allTexCoords[offset + 39] = 1 - divH;
        this.allTexCoords[offset + 42] = 1;
        this.allTexCoords[offset + 43] = 1;
        this.allTexCoords[offset + 46] = 0;
        this.allTexCoords[offset + 47] = 1;

        this.allTexCoords[offset + 50] = 0;
        this.allTexCoords[offset + 51] = 0;
        this.allTexCoords[offset + 54] = divW;
        this.allTexCoords[offset + 55] = 0;
        this.allTexCoords[offset + 58] = divW;
        this.allTexCoords[offset + 59] = 1;
        this.allTexCoords[offset + 62] = 0;
        this.allTexCoords[offset + 63] = 1;

        this.allTexCoords[offset + 66] = 1 - divW;
        this.allTexCoords[offset + 67] = 0;
        this.allTexCoords[offset + 70] = 1;
        this.allTexCoords[offset + 71] = 0;
        this.allTexCoords[offset + 74] = 1;
        this.allTexCoords[offset + 75] = 1;
        this.allTexCoords[offset + 78] = 1 - divW;
        this.allTexCoords[offset + 79] = 1;

        this.allTexCoords[offset + 82] = 0;
        this.allTexCoords[offset + 83] = 0;
        this.allTexCoords[offset + 86] = divW;
        this.allTexCoords[offset + 87] = 0;
        this.allTexCoords[offset + 90] = divW;
        this.allTexCoords[offset + 91] = divH;
        this.allTexCoords[offset + 94] = 0;
        this.allTexCoords[offset + 95] = divH;

        this.allTexCoords[offset + 98] = 1 - divW;
        this.allTexCoords[offset + 99] = 0;
        this.allTexCoords[offset + 102] = 1;
        this.allTexCoords[offset + 103] = 0;
        this.allTexCoords[offset + 106] = 1;
        this.allTexCoords[offset + 107] = divH;
        this.allTexCoords[offset + 110] = 1 - divW;
        this.allTexCoords[offset + 111] = divH;

        this.allTexCoords[offset + 114] = 1 - divW;
        this.allTexCoords[offset + 115] = 1 - divH;
        this.allTexCoords[offset + 118] = 1;
        this.allTexCoords[offset + 119] = 1 - divH;
        this.allTexCoords[offset + 122] = 1;
        this.allTexCoords[offset + 123] = 1;
        this.allTexCoords[offset + 126] = 1 - divW;
        this.allTexCoords[offset + 127] = 1;

        this.allTexCoords[offset + 130] = 0;
        this.allTexCoords[offset + 131] = 1 - divH;
        this.allTexCoords[offset + 134] = divW;
        this.allTexCoords[offset + 135] = 1 - divH;
        this.allTexCoords[offset + 138] = divW;
        this.allTexCoords[offset + 139] = 1;
        this.allTexCoords[offset + 142] = 0;
        this.allTexCoords[offset + 143] = 1;
    }

    var gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.useProgram(this.program);
    gl.viewport(0,0,this.w,this.h);
    gl.blendFunc(gl.ONE, gl.ZERO);
    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);

    // Upload data.
    this.paramsGlBuffer = this.paramsGlBuffer || gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.paramsGlBuffer);

    // We want to send the first elements from the params buffer, so we allCoords in order to slice some off.
    var view = new DataView(this.paramsBuffer, 0, 16 * 9 * 4 * n);
    gl.bufferData(gl.ARRAY_BUFFER, view, gl.DYNAMIC_DRAW);

    gl.vertexAttribPointer(this.vertexPositionAttribute, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(this.textureCoordAttribute, 2, gl.FLOAT, false, 16, 2 * 4);

    gl.enableVertexAttribArray(this.vertexPositionAttribute);
    gl.enableVertexAttribArray(this.textureCoordAttribute);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesGlBuffer);

    for (i = 0; i < n; i++) {
        gl.bindTexture(gl.TEXTURE_2D, textureSources[i].glTexture);
        gl.drawElements(gl.TRIANGLES, 6 * 9, gl.UNSIGNED_SHORT, i * 6 * 9 * 2);
    }

    gl.disableVertexAttribArray(this.vertexPositionAttribute);
    gl.disableVertexAttribArray(this.textureCoordAttribute);
};

/**
 * Allocates space for a loaded texture.
 * @param texture
 * @return {{x: number, y: number}|null}
 *   The allocated position.
 */
TextureAtlas.prototype.allocate = function(texture) {
    return this.activeTree.add(texture);
};

/**
 * Registers the texture source to the texture atlas.
 * @param {TextureSource} textureSource
 * @pre TextureSource.glTexture !== null
 */
TextureAtlas.prototype.addActiveTextureSource = function(textureSource) {
    if (textureSource.id === 1) {
        // Rectangle texture is automatically added.
    } else {
        if ((textureSource.w * textureSource.h < this.pixelsLimit)) {
            // Only add if dimensions are valid.
            if (!this.activeTextureSources.has(textureSource)) {
                this.activeTextureSources.add(textureSource);

                // Add it directly (if possible).
                if (!this.addedTextureSources.has(textureSource)) {
                    this.add(textureSource);
                }
            }
        }
    }
};

TextureAtlas.prototype.removeActiveTextureSource = function(textureSource) {
    if (this.activeTextureSources.has(textureSource)) {
        this.activeTextureSources.delete(textureSource);

        var uploadsIndex = this.uploads.indexOf(textureSource);
        if (uploadsIndex >= 0) {
            // Still waiting to be uploaded.
            this.uploads.splice(uploadsIndex, 1);

            // It is not uploaded, so it's not on the texture atlas any more.
            textureSource.isRemovedFromTextureAtlas();

            this.addedTextureSources.delete(textureSource);
        }

        if (this.addedTextureSources.has(textureSource)) {
            this.wastedPixels += textureSource.w * textureSource.h;
        }
    }
};

/**
 * Adds the texture source to the texture atlas.
 * @access private
 */
TextureAtlas.prototype.add = function(textureSource) {
    var position = this.allocate(textureSource);
    if (position) {
        this.addedTextureSources.add(textureSource);

        textureSource.isAddedToTextureAtlas(position.x + 1, position.y + 1);

        this.uploads.push(textureSource);
    } else {
        this.defragNeeded = true;

        // Error.
        return false;
    }

    return true;
};


/**
 * Defragments the atlas memory.
 */
TextureAtlas.prototype.defragment = function() {
    console.log('defragment texture atlas');

    // Clear new area (necessary for semi-transparent textures).
    var gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.viewport(0,0,this.w,this.h);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    this.activeTree.reset();
    this.uploads = [];
    this.wastedPixels = 0;
    this.lastDefragFrame = this.stage.frameCounter;
    this.defragNeeded = false;

    this.addedTextureSources.forEach(function(textureSource) {
        textureSource.isRemovedFromTextureAtlas();
    });

    this.addedTextureSources.clear();

    // Automatically re-add the rectangle texture, to make sure that it is at coordinate 0,0.
    this.add(this.stage.rectangleTexture.source);

    // Then (try to) re-add all active texture sources.
    // @todo: sort by dimensions (smallest first)?
    var self = this;
    this.activeTextureSources.forEach(function(textureSource) {
        self.add(textureSource);
    });

};

/**
 * Actually uploads the previously added sources to the texture atlas.
 */
TextureAtlas.prototype.flush = function() {
    if (this.defragNeeded) {
        // Only defragment when there is something serious to gain.
        if (this.wastedPixels >= this.minWastedPixels) {
            // Limit defragmentations from happening all the time when it can't keep up.
            if (this.lastDefragFrame < this.stage.frameCounter - 300) {
                this.defragment();
            }
        }
    }

    if (this.uploads.length) {
        this.lastImportFrame = this.stage.frameCounter;
        this.uploadTextureSources(this.uploads);
        this.uploads = [];
    }
};


if (isNode) {
    module.exports = TextureAtlas;
    var TextureAtlasTree = require('./TextureAtlasTree');
}