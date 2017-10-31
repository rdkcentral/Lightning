/**
 *
 */
var start = function(wpe) {

    wpe = wpe || {};

    with(wpe) {
        var options = {w: 900, h: 900, glClearColor: 0xFF000000, useTextureAtlas: false, debugTextureAtlas: false};

        // Nodejs-specific options.
        if (Utils.isNode) {
            options.window = {title: "Usage example", fullscreen: false};
            options.supercharger = {localImagePath: __dirname};
        }

        var stage = new Stage(options);

        if (!Utils.isNode) {
            document.body.appendChild(stage.getCanvas());
            window.stage = stage;
        }

        stage.root.add([{src: "../fast-blur/boat.png", renderToTexture: true, w: 900, h: 900, colorLeft: 0xFF000000, colorRight: 0xFF0000FF, children: [
            {rect: true, color: 0xFFFF0000, w: 450, h: 300, x: 300, y: 300}
        ]}])
    }
};

if (typeof window === "undefined") {
    // Nodejs: start.
    start(require('../../wpe'));
}
