let Base = require('./Base');

/**
 * Copyright Metrological, 2017
 */

class ViewText extends Base {

    constructor(view) {
        super();

        this.view = view;

        this.settings = new TextRendererSettings();
        this.settings.on('change', () => {
            this.updateTexture();
        });
    }

    _properties() {
        this.updatingTexture = null;
    }

    updateTexture() {
        if (this.settings.text == "") {
            // Clear current displayed texture (when changing text back to empty).
            this.texture = null;
            return;
        }

        if (this.updatingTexture) return;

        this.updatingTexture = true;

        // Create a dummy texture that loads the actual texture.
        this.view.texture = this.view.stage.texture((cb, ts, sync) => {
            // Create 'real' texture and set it.
            this.updatingTexture = false;

            // Ignore this texture source load.
            cb(null, null);

            // Replace with the newly generated texture source.
            let settings = this.getFinalizedSettings();
            let source = this.createTextureSource(settings);

            // Inherit texture precision from text settings.
            this.view.texture.precision = settings.precision;

            // Make sure that the new texture source is loaded.
            source.load(sync || settings.sync);

            this.view.texture.replaceTextureSource(source);
        });
    };

    setSettings(settings) {
        // Proxy to the settings object.
        Base.setObjectSettings(this.settings, settings);
    }

    getFinalizedSettings() {
        let settings = this.settings.clone();
        settings.finalize(this.view);
        return settings;
    };

    createTextureSource(settings) {
        let m = this.view.stage.textureManager;

        let loadCb = function(cb, ts, sync) {
            m.loadTextTexture(settings, ts, sync, cb);
        };

        return this.view.stage.textureManager.getTextureSource(loadCb, settings.getTextureId());
    };

}

module.exports = ViewText;

let TextRendererSettings = require('./TextRendererSettings');