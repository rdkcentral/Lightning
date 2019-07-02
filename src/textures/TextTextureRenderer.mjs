import StageUtils from "../tree/StageUtils.mjs";
import Utils from "../tree/Utils.mjs";

export default class TextTextureRenderer {

    constructor(stage, canvas, settings) {
        this._stage = stage;
        this._canvas = canvas;
        this._context = this._canvas.getContext('2d');
        this._settings = settings;
    }

    getPrecision() {
        return this._settings.precision;
    };

    setFontProperties() {
        this._context.font = this._getFontSetting();
        this._context.textBaseline = this._settings.textBaseline;
    };

    _getFontSetting() {
        let ff = this._settings.fontFace;

        if (!Array.isArray(ff)) {
            ff = [ff];
        }

        let ffs = [];
        for (let i = 0, n = ff.length; i < n; i++) {
            if (ff[i] === "serif" || ff[i] === "sans-serif") {
                ffs.push(ff[i]);
            } else {
                ffs.push(`"${ff[i]}"`);
            }
        }

        return `${this._settings.fontStyle} ${this._settings.fontSize * this.getPrecision()}px ${ffs.join(",")}`
    }

    _load() {
        if (Utils.isWeb && document.fonts) {
            const fontSetting = this._getFontSetting();
            try {
                if (!document.fonts.check(fontSetting, this._settings.text)) {
                    // Use a promise that waits for loading.
                    return document.fonts.load(fontSetting, this._settings.text).catch(err => {
                        // Just load the fallback font.
                        console.warn('Font load error', err, fontSetting);
                    }).then(() => {
                        if (!document.fonts.check(fontSetting, this._settings.text)) {
                            console.warn('Font not found', fontSetting);
                        }
                    });
                }
            } catch(e) {
                console.warn("Can't check font loading for " + fontSetting);
            }
        }
    }

    draw() {
        // We do not use a promise so that loading is performed syncronous when possible.
        const loadPromise = this._load();
        if (!loadPromise) {
            return this._stage.platform.drawText(this);
        } else {
            return loadPromise.then(() => {
                return this._stage.platform.drawText(this);
            });
        }
    }
}

