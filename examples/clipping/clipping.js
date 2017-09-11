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
        }

        stage.root.add([
            {rect: true, clipping: true, x: 200, y: 200, w: 500, h: 500, colorLeft: 0xFFAA0000, colorRight: 0xFF0000FF, children: [
                {tag: 't', rect: true, color: 0xFFFF0000, w: 300, h: 300, x: -100, y: 300}
            ]}
        ])

    }
};

if (typeof window === "undefined") {
    // Nodejs: start.
    start(require('../../wpe'));
}
