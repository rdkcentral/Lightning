var isNode = !!(((typeof module !== "undefined") && module.exports));

if (isNode) {
    var Utils = require('./Utils');
}

var TextRendererSettings = function() {

    // The default text options.
    this.text = this._text = "";
    this.w = this._w = 0;
    this.h = this._h = 0;
    this.fontStyle = this._fontStyle = "normal";
    this.fontSize = this._fontSize = 40;
    this.fontFace = this._fontFace = null;
    this.wordWrap = this._wordWrap = true;
    this.wordWrapWidth = this._wordWrapWidth = 0;
    this.lineHeight = this._lineHeight = null;
    this.textBaseline = this._textBaseline = "alphabetic";
    this.textAlign = this._textAlign = "left";
    this.offsetY = this._offsetY = null;
    this.maxLines = this._maxLines = 0;
    this.maxLinesSuffix = this._maxLinesSuffix = "..";
    this.precision = this._precision = null;
    this.textColor = this._textColor = 0xffffffff;
    this.paddingLeft = this._paddingLeft = 0;
    this.paddingRight = this._paddingRight = 0;
    this.shadow = this._shadow = false;
    this.shadowColor = this._shadowColor = 0xff000000;
    this.shadowOffsetX = this._shadowOffsetX = 0;
    this.shadowOffsetY = this._shadowOffsetY = 0;
    this.shadowBlur = this._shadowBlur = 5;
    this.highlight = this._highlight = false;
    this.highlightHeight = this._highlightHeight = 0;
    this.highlightColor = this._highlightColor = 0xff000000;
    this.highlightOffset = this._highlightOffset = null;
    this.highlightPaddingLeft = this._highlightPaddingLeft = null;
    this.highlightPaddingRight = this._highlightPaddingRight = null;

    // Cut the canvas.
    this.cutSx = this._cutSx = 0;
    this.cutEx = this._cutEx = 0;
    this.cutSy = this._cutSy = 0;
    this.cutEy = this._cutEy = 0;

    // Flag that indicates if any property has changed.
    this.hasUpdates = false;
};

TextRendererSettings.prototype.set = function(obj) {
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
        var value = obj[keys[i]];
        this.setSetting(keys[i], value);
    }
};

TextRendererSettings.prototype.setSetting = function(name, value) {
    var setting = TextRendererSettings.SETTINGS[name];
    if (setting) {
        setting.s(this, value);
    } else {
        console.warn("Unknown text property: " + name);
    }
};

TextRendererSettings.prototype.getNonDefaults = function() {
    var nonDefaults = {};

    if (this.text !== "") nonDefaults['text'] = this.text;
    if (this.w !== 0) nonDefaults['w'] = 0;
    if (this.h !== 0) nonDefaults['h'] = 0;
    if (this.fontStyle !== "normal") nonDefaults['fontStyle'] = this.fontStyle;
    if (this.fontSize !== 40) nonDefaults["fontSize"] = this.fontSize;
    if (this.fontFace !== null) nonDefaults["fontFace"] = this.fontFace;
    if (this.wordWrap !== true) nonDefaults["wordWrap"] = this.wordWrap;
    if (this.wordWrapWidth !== 0) nonDefaults["wordWrapWidth"] = this.wordWrapWidth;
    if (this.lineHeight !== null) nonDefaults["lineHeight"] = this.lineHeight;
    if (this.textBaseline !== "alphabetic") nonDefaults["textBaseline"] = this.textBaseline;
    if (this.textAlign !== "left") nonDefaults["textAlign"] = this.textAlign;
    if (this.offsetY !== null) nonDefaults["offsetY"] = this.offsetY;
    if (this.maxLines !== 0) nonDefaults["maxLines"] = this.maxLines;
    if (this.maxLinesSuffix !== "..") nonDefaults["maxLinesSuffix"] = this.maxLinesSuffix;
    if (this.precision !== null) nonDefaults["precision"] = this.precision;
    if (this.textColor !== 0xffffffff) nonDefaults["textColor"] = this.textColor;
    if (this.paddingLeft !== 0) nonDefaults["paddingLeft"] = this.paddingLeft;
    if (this.paddingRight !== 0) nonDefaults["paddingRight"] = this.paddingRight;
    if (this.shadow !== false) nonDefaults["shadow"] = this.shadow;
    if (this.shadowColor !== 0xff000000) nonDefaults["shadowColor"] = this.shadowColor;
    if (this.shadowOffsetX !== 0) nonDefaults["shadowOffsetX"] = this.shadowOffsetX;
    if (this.shadowOffsetY !== 0) nonDefaults["shadowOffsetY"] = this.shadowOffsetY;
    if (this.shadowBlur !== 5) nonDefaults["shadowBlur"] = this.shadowBlur;
    if (this.highlight !== false) nonDefaults["highlight"] = this.highlight;
    if (this.highlightHeight !== 0) nonDefaults["highlightHeight"] = this.highlightHeight;
    if (this.highlightColor !== 0xff000000) nonDefaults["highlightColor"] = this.highlightColor;
    if (this.highlightOffset !== null) nonDefaults["highlightOffset"] = this.highlightOffset;
    if (this.highlightPaddingLeft !== null) nonDefaults["highlightPaddingLeft"] = this.highlightPaddingLeft;
    if (this.highlightPaddingRight !== null) nonDefaults["highlightPaddingRight"] = this.highlightPaddingRight;

    if (this.cutSx) nonDefaults["cutSx"] = this.cutSx;
    if (this.cutEx) nonDefaults["cutEx"] = this.cutEx;
    if (this.cutSy) nonDefaults["cutSy"] = this.cutSy;
    if (this.cutEy) nonDefaults["cutEy"] = this.cutEy;

    return nonDefaults;
};

TextRendererSettings.prototype.getTextureId = function() {
    var parts = [];

    if (this.w !== 0) parts.push("w " + this.w);
    if (this.h !== 0) parts.push("h " + this.h);
    if (this.fontStyle !== "normal") parts.push("fS" + this.fontStyle);
    if (this.fontSize !== 40) parts.push("fs" + this.fontSize);
    if (this.fontFace !== null) parts.push("ff" + (Utils.isArray(this.fontFace) ? this.fontFace.join(",") : this.fontFace));
    if (this.wordWrap !== true) parts.push("wr" + (this.wordWrap ? 1 : 0));
    if (this.wordWrapWidth !== 0) parts.push("ww" + this.wordWrapWidth);
    if (this.lineHeight !== null) parts.push("lh" + this.lineHeight);
    if (this.textBaseline !== "alphabetic") parts.push("tb" + this.textBaseline);
    if (this.textAlign !== "left") parts.push("ta" + this.textAlign);
    if (this.offsetY !== null) parts.push("oy" + this.offsetY);
    if (this.maxLines !== 0) parts.push("ml" + this.maxLines);
    if (this.maxLinesSuffix !== "..") parts.push("ms" + this.maxLinesSuffix);
    if (this.precision !== null) parts.push("pc" + this.precision);
    if (this.textColor !== 0xffffffff) parts.push("co" + this.textColor.toString(16));
    if (this.paddingLeft !== 0) parts.push("pl" + this.paddingLeft);
    if (this.paddingRight !== 0) parts.push("pr" + this.paddingRight);
    if (this.shadow !== false) parts.push("sh" + (this.shadow ? 1 : 0));
    if (this.shadowColor !== 0xff000000) parts.push("sc" + this.shadowColor.toString(16));
    if (this.shadowOffsetX !== 0) parts.push("sx" + this.shadowOffsetX);
    if (this.shadowOffsetY !== 0) parts.push("sy" + this.shadowOffsetY);
    if (this.shadowBlur !== 5) parts.push("sb" + this.shadowBlur);
    if (this.highlight !== false) parts.push("hL" + (this.highlight ? 1 : 0));
    if (this.highlightHeight !== 0) parts.push("hh" + this.highlightHeight);
    if (this.highlightColor !== 0xff000000) parts.push("hc" + this.highlightColor.toString(16));
    if (this.highlightOffset !== null) parts.push("ho" + this.highlightOffset);
    if (this.highlightPaddingLeft !== null) parts.push("hl" + this.highlightPaddingLeft);
    if (this.highlightPaddingRight !== null) parts.push("hr" + this.highlightPaddingRight);

    if (this.cutSx) parts.push("csx" + this.cutSx);
    if (this.cutEx) parts.push("cex" + this.cutEx);
    if (this.cutSy) parts.push("csy" + this.cutSy);
    if (this.cutEy) parts.push("cey" + this.cutEy);

    var id = "TX$" + parts.join("|") + ":" + this.text;
    return id;
};

TextRendererSettings.prototype.clone = function() {
    var t = new TextRendererSettings();
    t.set(this.getNonDefaults());
    return t;
};

TextRendererSettings.prototype.notifyUpdate = function() {
    this.hasUpdates = true;
};

Object.defineProperty(TextRendererSettings.prototype, 'text', {
    get: function () {
        return this._text;
    },
    set: function(v) {
        var pv = this._text;
        if (pv !== v) {
            this._text = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'w', {
    get: function () {
        return this._w;
    },
    set: function(v) {
        var pv = this._w;
        if (pv !== v) {
            this._w = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'h', {
    get: function () {
        return this._h;
    },
    set: function(v) {
        var pv = this._h;
        if (pv !== v) {
            this._h = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'fontStyle', {
    get: function () {
        return this._fontStyle;
    },
    set: function(v) {
        var pv = this._fontStyle;
        if (pv !== v) {
            this._fontStyle = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'fontSize', {
    get: function () {
        return this._fontSize;
    },
    set: function(v) {
        var pv = this._fontSize;
        if (pv !== v) {
            this._fontSize = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'fontFace', {
    get: function () {
        return this._fontFace;
    },
    set: function(v) {
        var pv = this._fontFace;
        if (pv !== v) {
            this._fontFace = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'wordWrap', {
    get: function () {
        return this._wordWrap;
    },
    set: function(v) {
        var pv = this._wordWrap;
        if (pv !== v) {
            this._wordWrap = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'wordWrapWidth', {
    get: function () {
        return this._wordWrapWidth;
    },
    set: function(v) {
        var pv = this._wordWrapWidth;
        if (pv !== v) {
            this._wordWrapWidth = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'lineHeight', {
    get: function () {
        return this._lineHeight;
    },
    set: function(v) {
        var pv = this._lineHeight;
        if (pv !== v) {
            this._lineHeight = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'textBaseline', {
    get: function () {
        return this._textBaseline;
    },
    set: function(v) {
        var pv = this._textBaseline;
        if (pv !== v) {
            this._textBaseline = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'textAlign', {
    get: function () {
        return this._textAlign;
    },
    set: function(v) {
        var pv = this._textAlign;
        if (pv !== v) {
            this._textAlign = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'offsetY', {
    get: function () {
        return this._offsetY;
    },
    set: function(v) {
        var pv = this._offsetY;
        if (pv !== v) {
            this._offsetY = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'maxLines', {
    get: function () {
        return this._maxLines;
    },
    set: function(v) {
        var pv = this._maxLines;
        if (pv !== v) {
            this._maxLines = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'maxLinesSuffix', {
    get: function () {
        return this._maxLinesSuffix;
    },
    set: function(v) {
        var pv = this._maxLinesSuffix;
        if (pv !== v) {
            this._maxLinesSuffix = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'precision', {
    get: function () {
        return this._precision;
    },
    set: function(v) {
        var pv = this._precision;
        if (pv !== v) {
            this._precision = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'textColor', {
    get: function () {
        return this._textColor;
    },
    set: function(v) {
        var pv = this._textColor;
        if (pv !== v) {
            this._textColor = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'paddingLeft', {
    get: function () {
        return this._paddingLeft;
    },
    set: function(v) {
        var pv = this._paddingLeft;
        if (pv !== v) {
            this._paddingLeft = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'paddingRight', {
    get: function () {
        return this._paddingRight;
    },
    set: function(v) {
        var pv = this._paddingRight;
        if (pv !== v) {
            this._paddingRight = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'shadow', {
    get: function () {
        return this._shadow;
    },
    set: function(v) {
        var pv = this._shadow;
        if (pv !== v) {
            this._shadow = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'shadowColor', {
    get: function () {
        return this._shadowColor;
    },
    set: function(v) {
        var pv = this._shadowColor;
        if (pv !== v) {
            this._shadowColor = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'shadowOffsetX', {
    get: function () {
        return this._shadowOffsetX;
    },
    set: function(v) {
        var pv = this._shadowOffsetX;
        if (pv !== v) {
            this._shadowOffsetX = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'shadowOffsetY', {
    get: function () {
        return this._shadowOffsetY;
    },
    set: function(v) {
        var pv = this._shadowOffsetY;
        if (pv !== v) {
            this._shadowOffsetY = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'shadowBlur', {
    get: function () {
        return this._shadowBlur;
    },
    set: function(v) {
        var pv = this._shadowBlur;
        if (pv !== v) {
            this._shadowBlur = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'highlight', {
    get: function () {
        return this._highlight;
    },
    set: function(v) {
        var pv = this._highlight;
        if (pv !== v) {
            this._highlight = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'highlightHeight', {
    get: function () {
        return this._highlightHeight;
    },
    set: function(v) {
        var pv = this._highlightHeight;
        if (pv !== v) {
            this._highlightHeight = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'highlightColor', {
    get: function () {
        return this._highlightColor;
    },
    set: function(v) {
        var pv = this._highlightColor;
        if (pv !== v) {
            this._highlightColor = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'highlightOffset', {
    get: function () {
        return this._highlightOffset;
    },
    set: function(v) {
        var pv = this._highlightOffset;
        if (pv !== v) {
            this._highlightOffset = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'highlightPaddingLeft', {
    get: function () {
        return this._highlightPaddingLeft;
    },
    set: function(v) {
        var pv = this._highlightPaddingLeft;
        if (pv !== v) {
            this._highlightPaddingLeft = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'highlightPaddingRight', {
    get: function () {
        return this._highlightPaddingRight;
    },
    set: function(v) {
        var pv = this._highlightPaddingRight;
        if (pv !== v) {
            this._highlightPaddingRight = v;
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'cutSx', {
    get: function () {
        return this._cutSx;
    },
    set: function(v) {
        var pv = this._cutSx;
        if (pv !== v) {
            this._cutSx = Math.max(0, v);
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'cutEx', {
    get: function () {
        return this._cutEx;
    },
    set: function(v) {
        var pv = this._cutEx;
        if (pv !== v) {
            this._cutEx = Math.max(0, v);
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'cutSy', {
    get: function () {
        return this._cutSy;
    },
    set: function(v) {
        var pv = this._cutSy;
        if (pv !== v) {
            this._cutSy = Math.max(0, v);
            this.notifyUpdate();
        }
    }
});

Object.defineProperty(TextRendererSettings.prototype, 'cutEy', {
    get: function () {
        return this._cutEy;
    },
    set: function(v) {
        var pv = this._cutEy;
        if (pv !== v) {
            this._cutEy = Math.max(0, v);
            this.notifyUpdate();
        }
    }
});

TextRendererSettings.SETTINGS = {
    'text': {s: function(obj, v) {obj.text = v;}, m: null},
    'w': {s: function(obj, v) {obj.w = v;}, m: null},
    'h': {s: function(obj, v) {obj.h = v;}, m: null},
    'fontStyle': {s: function(obj, v) {obj.fontStyle = v;}, m: null},
    'fontSize': {s: function(obj, v) {
        obj.fontSize = v;
    }, m: null},
    'fontFace': {s: function(obj, v) {obj.fontFace = v;}, m: null},
    'wordWrap': {s: function(obj, v) {obj.wordWrap = v;}, m: null},
    'wordWrapWidth': {s: function(obj, v) {obj.wordWrapWidth = v;}, m: null},
    'lineHeight': {s: function(obj, v) {obj.lineHeight = v;}, m: null},
    'textBaseline': {s: function(obj, v) {obj.textBaseline = v;}, m: null},
    'textAlign': {s: function(obj, v) {obj.textAlign = v;}, m: null},
    'offsetY': {s: function(obj, v) {obj.offsetY = v;}, m: null},
    'maxLines': {s: function(obj, v) {obj.maxLines = v;}, m: null},
    'maxLinesSuffix': {s: function(obj, v) {obj.maxLinesSuffix = v;}, m: null},
    'precision': {s: function(obj, v) {obj.precision = v;}, m: null},
    'textColor': {s: function(obj, v) {obj.textColor = v;}, m: null},
    'paddingLeft': {s: function(obj, v) {obj.paddingLeft = v;}, m: null},
    'paddingRight': {s: function(obj, v) {obj.paddingRight = v;}, m: null},
    'shadow': {s: function(obj, v) {obj.shadow = v;}, m: null},
    'shadowColor': {s: function(obj, v) {obj.shadowColor = v;}, m: null},
    'shadowOffsetX': {s: function(obj, v) {obj.shadowOffsetX = v;}, m: null},
    'shadowOffsetY': {s: function(obj, v) {obj.shadowOffsetY = v;}, m: null},
    'shadowBlur': {s: function(obj, v) {obj.shadowBlur = v;}, m: null},
    'highlight': {s: function(obj, v) {obj.highlight = v;}, m: null},
    'highlightHeight': {s: function(obj, v) {obj.highlightHeight = v;}, m: null},
    'highlightColor': {s: function(obj, v) {obj.highlightColor = v;}, m: null},
    'highlightOffset': {s: function(obj, v) {obj.highlightOffset = v;}, m: null},
    'highlightPaddingLeft': {s: function(obj, v) {obj.highlightPaddingLeft = v;}, m: null},
    'highlightPaddingRight': {s: function(obj, v) {obj.highlightPaddingRight = v;}, m: null},
    'cutSx': {s: function(obj, v) {obj.cutSx = v;}, m: null},
    'cutEx': {s: function(obj, v) {obj.cutEx = v;}, m: null},
    'cutSy': {s: function(obj, v) {obj.cutSy = v;}, m: null},
    'cutEy': {s: function(obj, v) {obj.cutEy = v;}, m: null}
};

if (isNode) {
    module.exports = TextRendererSettings;
}