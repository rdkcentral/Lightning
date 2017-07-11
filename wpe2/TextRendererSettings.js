class TextRendererSettings extends Base {
    constructor() {
        
    }
    
    _properties() {
        this.hasUpdates = false;

        this.text = "";
        this.w = 0;
        this.h = 0;
        this.fontStyle = "normal";
        this.fontSize = 40;
        this.fontFace = null;
        this.wordWrap = true;
        this.wordWrapWidth = 0;
        this.lineHeight = null;
        this.textBaseline = "alphabetic";
        this.textAlign = "left";
        this.offsetY = null;
        this.maxLines = 0;
        this.maxLinesSuffix = "..";
        this.precision = null;
        this.textColor = 0xFFFFFFFF;
        this.paddingLeft = 0;
        this.paddingRight = 0;
        this.shadow = false;
        this.shadowColor = 0xFF000000;
        this.shadowOffsetX = 0;
        this.shadowOffsetY = 0;
        this.shadowBlur = 5;
        this.highlight = false;
        this.highlightHeight = 0;
        this.highlightColor = 0xFF000000;
        this.highlightOffset = 0;
        this.highlightPaddingLeft = 0;
        this.highlightPaddingRight = 0;
        this.cutSx = 0;
        this.cutEx = 0;
        this.cutSy = 0;
        this.cutEy = 0;

        this.sync = false;
    }

    static _annotations() {
        return {
            'text': {value: ""},
            'w': {value: 0, idp: "w "},
            'h': {value: 0, idp: "h "},
            'fontStyle': {value: "normal", idp: "fS"},
            'fontSize': {value: 40, idp: "fs"},
            'fontFace': {value: null, idp: "ff"},
            'wordWrap': {value: true, idp: "wr"},
            'wordWrapWidth': {value: 0, idp: "ww"},
            'lineHeight': {value: null, idp: "lh"},
            'textBaseline': {value: "alphabetic", idp: "tb"},
            'textAlign': {value: "left", idp: "ta"},
            'offsetY': {value: null, idp: "oy"},
            'maxLines': {value: 0, idp: "ml"},
            'maxLinesSuffix': {value: "..", idp: "ms"},
            'precision': {value: null, idp: "oc"},
            'textColor': {value: 0xffffffff, idp: "co"},
            'paddingLeft': {value: 0, idp: "pl"},
            'paddingRight': {value: 0, idp: "pr"},
            'shadow': {value: false, idp: "sh"},
            'shadowColor': {value: 0xff000000, idp: "sc", v: (t, v) => {
                return v
            }},
            'shadowOffsetX': {value: 0, idp: "sx"},
            'shadowOffsetY': {value: 0, idp: "sy"},
            'shadowBlur': {value: 5, idp: "sb"},
            'highlight': {value: false, idp: "hL"},
            'highlightHeight': {value: 0, idp: "hh"},
            'highlightColor': {value: 0xff000000, idp: "hc"},
            'highlightOffset': {value: null, idp: "ho"},
            'highlightPaddingLeft': {value: null, idp: "hl"},
            'highlightPaddingRight': {value: null, idp: "hr"},
            'cutSx': {value: 0, idp: "csx"},
            'cutEx': {value: 0, idp: "cex"},
            'cutSy': {value: 0, idp: "csy"},
            'cutEy': {value: 0, idp: "cey"},
            'sync': {value: false, idp: "syn"}
        };
    }

    /**
     * Finalize this settings object so that it is no longer dependent on possibly changing defaults.
     */
    finalize(view) {
        // Inherit width and height from component.
        if (!this.w && view.w) {
            this.w = view.w;
        }

        if (!this.h && view.h) {
            this.h = view.h;
        }

        if (this.fontFace === null) {
            this.fontFace = view.stage.defaultFontFace;
        }

        if (this.precision === null) {
            this.precision = view.stage.defaultPrecision;
        }
    };

    getTextureId() {
        let nonDefaults = this.getSettings();
        let id = "TX$";
        for (let key in nonDefaults) {
            if (nonDefaults.hasOwnProperty(key)) {
                let v = nonDefaults[key];
                let info = this.getPropertyAnnotations(key);
                if (info && info.idp) {
                    id += info.idp + (Array.isArray(v) ? v.join(",") : v);
                }
            }
        }
        id += ":" + this.text;
        return id;
    }

    clone() {
        let nonDefaults = this.getSettings();
        let obj = new TextRendererSettings();
        obj.setSettings(nonDefaults);
        return obj;
    }

    _constructPropertyAnnotations(name, info) {
        if (!info.hasOwnProperty('gset')) {
            // Default.
            info.gset = {code: 'this.hasUpdates = true;'};
        }

        if (!info.hasOwnProperty('exp')) {
            info.exp = true;
        }

        super._constructPropertyAnnotations(name, info);
    }
    
}