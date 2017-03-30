var isNode = !!(((typeof module !== "undefined") && module.exports));

if (isNode) {
    var Utils = require('./Utils');
}

/**
 * Renders text as a component texture.
 * @constructor
 * @abstract
 */
function ComponentText(component) {

    this.stage = component.stage;

    this.component = component;

    this.updatingTexture = false;

    this.settings = new TextRendererSettings();

    this.texture = null;

    this.updateTexture();
}

ComponentText.prototype.set = function(settings) {
    this.settings.set(settings);
    if (this.settings.hasUpdates) {
        this.updateTexture();
    }
};

ComponentText.prototype.updateTexture = function() {
    if (this.settings.text == "") {
        // Clear current displayed texture (when changing text back to empty).
        this.component.texture = null;
        return;
    }

    this.settings.hasUpdates = false;
    if (this.updatingTexture && this.component.texture === this.texture) return;

    this.updatingTexture = true;

    // Create a dummy texture that loads the actual texture.
    var self = this;
    this.component.texture = this.texture = this.stage.texture(function(cb) {
        self.updatingTexture = false;

        // Create 'real' texture and set it.
        return cb(self.createTextureSource());
    });
};

ComponentText.prototype.createTextureSource = function() {
    var tr = new TextRenderer(this.stage, this.settings.clone());

    // Inherit width and height from component.

    var self = this;

    if (!tr.settings.w && this.component.w) {
        tr.settings.w = this.component.w;
    }

    if (!tr.settings.h && this.component.h) {
        tr.settings.h = this.component.h;
    }

    return self.stage.textureManager.getTextureSource(function (cb) {
        // Generate the image.
        var rval = tr.draw();
        var renderInfo = rval.renderInfo;

        cb(rval.canvas, {renderInfo: renderInfo, precision: rval.renderInfo.precision});
    }, tr.settings.getTextureId());
};

ComponentText.prototype.measure = function() {
    var tr = new TextRenderer(this.stage, this.settings.clone());

    if (!tr.settings.w && this.component.w) {
        tr.settings.w = this.component.w;
    }

    if (!tr.settings.h && this.component.h) {
        tr.settings.h = this.component.h;
    }

    var rval = tr.draw(true);
    return rval.renderInfo;
};

Object.defineProperty(ComponentText.prototype, 'renderInfo', {
    get: function() {
        return (this.texture && this.texture.source ? this.texture.source.renderInfo : {});
    }
});

// Proxy all settable properties to the settings object.
Object.defineProperty(ComponentText.prototype, 'text', {
    get: function() {
        return this.settings.text;
    },
    set: function(v) {
        this.settings.text = v;
        if (v === null) {
            this.component.text = null;
        } else {
            if (this.settings.hasUpdates) this.updateTexture();
        }
    }
});

Object.defineProperty(ComponentText.prototype, 'w', {
    get: function() {
        return this.settings.w;
    },
    set: function(v) {
        this.settings.w = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'h', {
    get: function() {
        return this.settings.h;
    },
    set: function(v) {
        this.settings.h = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'fontStyle', {
    get: function() {
        return this.settings.fontStyle;
    },
    set: function(v) {
        this.settings.fontStyle = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'fontSize', {
    get: function() {
        return this.settings.fontSize;
    },
    set: function(v) {
        this.settings.fontSize = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'fontFace', {
    get: function() {
        return this.settings.fontFace;
    },
    set: function(v) {
        this.settings.fontFace = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'wordWrap', {
    get: function() {
        return this.settings.wordWrap;
    },
    set: function(v) {
        this.settings.wordWrap = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'wordWrapWidth', {
    get: function() {
        return this.settings.wordWrapWidth;
    },
    set: function(v) {
        this.settings.wordWrapWidth = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'lineHeight', {
    get: function() {
        return this.settings.lineHeight;
    },
    set: function(v) {
        this.settings.lineHeight = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'textBaseline', {
    get: function() {
        return this.settings.textBaseline;
    },
    set: function(v) {
        this.settings.textBaseline = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'textAlign', {
    get: function() {
        return this.settings.textAlign;
    },
    set: function(v) {
        this.settings.textAlign = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'offsetY', {
    get: function() {
        return this.settings.offsetY;
    },
    set: function(v) {
        this.settings.offsetY = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'maxLines', {
    get: function() {
        return this.settings.maxLines;
    },
    set: function(v) {
        this.settings.maxLines = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'maxLinesSuffix', {
    get: function() {
        return this.settings.maxLinesSuffix;
    },
    set: function(v) {
        this.settings.maxLinesSuffix = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'precision', {
    get: function() {
        return this.settings.precision;
    },
    set: function(v) {
        this.settings.precision = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'textColor', {
    get: function() {
        return this.settings.textColor;
    },
    set: function(v) {
        this.settings.textColor = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'paddingLeft', {
    get: function() {
        return this.settings.paddingLeft;
    },
    set: function(v) {
        this.settings.paddingLeft = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'paddingRight', {
    get: function() {
        return this.settings.paddingRight;
    },
    set: function(v) {
        this.settings.paddingRight = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'shadow', {
    get: function() {
        return this.settings.shadow;
    },
    set: function(v) {
        this.settings.shadow = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'shadowColor', {
    get: function() {
        return this.settings.shadowColor;
    },
    set: function(v) {
        this.settings.shadowColor = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'shadowOffsetX', {
    get: function() {
        return this.settings.shadowOffsetX;
    },
    set: function(v) {
        this.settings.shadowOffsetX = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'shadowOffsetY', {
    get: function() {
        return this.settings.shadowOffsetY;
    },
    set: function(v) {
        this.settings.shadowOffsetY = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'shadowBlur', {
    get: function() {
        return this.settings.shadowBlur;
    },
    set: function(v) {
        this.settings.shadowBlur = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'highlight', {
    get: function() {
        return this.settings.highlight;
    },
    set: function(v) {
        this.settings.highlight = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'highlightHeight', {
    get: function() {
        return this.settings.highlightHeight;
    },
    set: function(v) {
        this.settings.highlightHeight = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'highlightColor', {
    get: function() {
        return this.settings.highlightColor;
    },
    set: function(v) {
        this.settings.highlightColor = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'highlightOffset', {
    get: function() {
        return this.settings.highlightOffset;
    },
    set: function(v) {
        this.settings.highlightOffset = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'highlightPaddingLeft', {
    get: function() {
        return this.settings.highlightPaddingLeft;
    },
    set: function(v) {
        this.settings.highlightPaddingLeft = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'highlightPaddingRight', {
    get: function() {
        return this.settings.highlightPaddingRight;
    },
    set: function(v) {
        this.settings.highlightPaddingRight = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'cutSx', {
    get: function() {
        return this.settings.cutSx;
    },
    set: function(v) {
        this.settings.cutSx = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'cutEx', {
    get: function() {
        return this.settings.cutEx;
    },
    set: function(v) {
        this.settings.cutEx = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'cutSy', {
    get: function() {
        return this.settings.cutSy;
    },
    set: function(v) {
        this.settings.cutSy = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});

Object.defineProperty(ComponentText.prototype, 'cutEy', {
    get: function() {
        return this.settings.cutEy;
    },
    set: function(v) {
        this.settings.cutEy = v;
        if (this.settings.hasUpdates) this.updateTexture();
    }
});


if (isNode) {
    module.exports = ComponentText;
    var TextRendererSettings = require('./TextRendererSettings');
    var TextRenderer = require('./TextRenderer');
}