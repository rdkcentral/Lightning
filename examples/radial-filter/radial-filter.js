/**
 *
 */
var start = function(wpe) {

    wpe = wpe || {};

    with(wpe) {
        var options = {w: 900, h: 900, glClearColor: 0xFF000000};

        // Nodejs-specific options.
        if (Utils.isNode) {
            options.window = {title: "Border example", fullscreen: false};
            options.supercharger = {localImagePath: __dirname};
        }

        var stage = new Stage(options);

        if (!Utils.isNode) {
            document.body.appendChild(stage.getCanvas());
            window.stage = stage;
        }

        const template = {
            Test: {shader: {type: RadialFilterShader, radius: 400},
                Rect: {rect: true, w: 600, h: 600, color: 0xFFFF0000}
            }
        }

        stage.root.patch(template, true)


    }
};

if (typeof window === "undefined") {
    // Nodejs: start.
    start(require('../../wpe'));
}
