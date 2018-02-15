/**
 * Copyright Metrological, 2017
 */

let Base = require('./Base');

class ViewText {

    constructor(view) {
        this.view = view;

        this.settings = new TextRendererSettings();
        this.settings.on('change', () => {
            this.updateTexture();
        });

        this.updatingTexture = null;
    }

    updateTexture() {
        if (this.updatingTexture) return;

        this.updatingTexture = true;

        if (this.view.texture !== this.texture) {
            this.view.texture = this.texture = this.createTexture()
        } else {
            // Reload.
            this.texture.replaceTextureSource(this.createTextureSource())
        }
    };

    createTexture() {
        return this.view.stage.texture((cb, ts, sync) => {
            // Ignore this texture source load.
            cb(null, null);

            // Replace with the newly generated texture source.
            const settings = this.getFinalizedSettings()
            let source = this.createTextureSource(settings);

            // Make sure that the new texture source is loaded.
            source.load(sync || settings.sync);

            this.view.texture.replaceTextureSource(source);
        });
    }

    getFinalizedSettings() {
        let settings = this.settings.clone();
        settings.finalize(this.view);
        return settings;
    };

    createTextureSource(settings = this.getFinalizedSettings()) {
        // Create 'real' texture and set it.
        this.updatingTexture = false;

        let m = this.view.stage.textureManager;

        // Inherit texture precision from text settings.
        this.view.texture.precision = settings.precision;

        let loadCb = (cb, ts, sync) => {
            m.loadTextTexture(settings, ts, sync, cb);
        };

        return this.view.stage.textureManager.getTextureSource(loadCb, settings.getTextureId());
    };

}

module.exports = ViewText;

let TextRendererSettings = require('./TextRendererSettings');