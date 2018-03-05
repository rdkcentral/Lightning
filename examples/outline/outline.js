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
            Primary: {
                Rect: {rect: true, rotation: 1, w: 300, h: 500, x: 400, y: 200, color: 0xFFFF0000, shader: {type: OutlineShader, width: 5, color: 0xFF0000FF},
                    Inner: {shader: null, text: {text: "hello world"}}
                }
            },
            Overlay: {}
        }

        stage.root.patch(template, true)
    }
};

if (typeof window === "undefined") {
    // Nodejs: start.
    start(require('../../wpe'));
}
