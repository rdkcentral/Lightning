var isNode = !!(((typeof module !== "undefined") && module.exports));

if (isNode) {
    var Utils = require('./Utils');
}

var UComponentContext = function() {
    this.vboGlTextures = [];
    this.vboGlTextureRepeats = [];
    this.lastVboGlTexture = null;
    this.textureAtlasGlTexture = null;
    this.rectangleTextureSource = null;
    this.rectangleTextureSourceInTextureAtlas = false;

    this.vboParamsBuffer = new ArrayBuffer(16 * 4 * 16384 * 2);
    this.vboBufferFloat = new Float32Array(this.vboParamsBuffer);
    this.vboBufferUint = new Uint32Array(this.vboParamsBuffer);
    this.vboIndex = 0;

    this.n = 0;
    this.useZIndexing = false;

    this.root = null;

    this.updateTreeOrder = 0;

    this.staticStage = false;

    this.debugTextureAtlas = null;

};

UComponentContext.prototype.setStage = function(stage) {
    this.textureAtlasGlTexture = stage.textureAtlas.texture;
    this.rectangleTextureSource = stage.getRectangleTexture().source;

    if (stage.debugTextureAtlas) {
        this.debugTextureAtlas = this.createUComponent();
        this.debugTextureAtlas.displayedTextureSource = this.rectangleTextureSource;
        this.debugTextureAtlas.setInTextureAtlas(true);
        var min = Math.min(stage.w, stage.h);
        this.debugTextureAtlas.setDimensions(min, min);
    }
};

UComponentContext.prototype.createUComponentForComponent = function(component) {
    return new UComponent(this);
};

UComponentContext.prototype.createUComponent = function() {
    return new UComponent(this);
};

UComponentContext.prototype.setDisplayedTextureSource = function(uComponent, textureSource) {
    uComponent.setDisplayedTextureSource(textureSource);
};

UComponentContext.prototype.reset = function() {
    this.vboIndex = 0;
    this.vboGlTextures = [];
    this.vboGlTextureRepeats = [];
    this.lastVboGlTexture = null;
    this.rectangleTextureSourceInTextureAtlas = this.rectangleTextureSource.inTextureAtlas;
    this.n = 0;
    this.updateTreeOrder = 0;
};

UComponentContext.prototype.addVboTextureSource = function(uComponent, repeat) {
    var glTexture;
    if (uComponent.isBorder) {
        glTexture = this.rectangleTextureSourceInTextureAtlas ? this.textureAtlasGlTexture : this.rectangleTextureSource.glTexture;
    } else {
        glTexture = uComponent.inTextureAtlas ? this.textureAtlasGlTexture : uComponent.displayedTextureSource.glTexture;
    }
    if (this.lastVboGlTexture !== glTexture) {
        this.vboGlTextures.push(glTexture);
        this.vboGlTextureRepeats.push(repeat);
        this.n++;
        this.lastVboGlTexture = glTexture;
    } else {
        this.vboGlTextureRepeats[this.n - 1] += repeat;
    }

    this.vboIndex += repeat * 16;
};

UComponentContext.prototype.getVboIndex = function() {
    return this.vboIndex;
};

UComponentContext.prototype.getVboParamsBuffer = function() {
    return this.vboParamsBuffer;
};

UComponentContext.prototype.getVboGlTextures = function() {
    return this.vboGlTextures;
};

UComponentContext.prototype.getVboGlTextureRepeats = function() {
    return this.vboGlTextureRepeats;
};

UComponentContext.prototype.getVboGlTexturesCount = function() {
    return this.vboGlTextures.length;
};

UComponentContext.prototype.updateAndFillVbo = function(useZIndexing) {
    var renderNeeded = !this.staticStage;
    if (!this.staticStage) {
        this.useZIndexing = useZIndexing;

        this.reset();
        this.root.update();

        if (this.useZIndexing) {
            // A secondary fill pass is required.
            this.root.fillVbo();
        }

        if (this.debugTextureAtlas) {
            this.debugTextureAtlas.addToVbo();
        }

        this.staticStage = true;
    }

    return renderNeeded;
};

Object.defineProperty(UComponentContext.prototype, 'staticStage', {
    get: function () {
        return this._staticStage;
    },
    set: function(v) {
        this._staticStage = v;
    }
});

if (isNode) {
    module.exports = UComponentContext;
    var UComponent = require('./UComponent');
}