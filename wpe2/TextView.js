class TextView extends View {

    constructor(stage) {
        super(stage);

        this.text = new TextRendererSettings();

        this.updateTexture();
    }

    _properties() {
        this.updatingTexture = null;
    }

    updateTexture() {
        if (this.text.text == "") {
            // Clear current displayed texture (when changing text back to empty).
            this.texture = null;
            return;
        }

        this.text.hasUpdates = false;

        if (this.updatingTexture) return;

        this.updatingTexture = true;

        // Create a dummy texture that loads the actual texture.
        let self = this;

        this.texture = this.stage.texture(function(cb, ts, sync) {
            // Create 'real' texture and set it.
            self.updatingTexture = false;

            // Ignore this texture source load.
            cb(null, null);

            // Replace with the newly generated texture source.
            let settings = self.getFinalizedSettings();
            let source = self.createTextureSource(settings);

            // Inherit texture precision from text settings.
            self.texture.precision = settings.precision;

            // Make sure that the new texture source is loaded.
            source.load(sync || settings.sync);

            self.texture.replaceTextureSource(source);
        });
    };

    getFinalizedSettings() {
        let settings = this.text.clone();
        settings.finalize(this);
        return settings;
    };

    createTextureSource(settings) {
        let self = this;
        let m = this.stage.textureManager;

        let loadCb = function (cb, ts, sync) {
            m.loadText(settings, ts, sync, cb);
        };

        return self.stage.textureManager.getTextureSource(loadCb, settings.getTextureId());
    };

}