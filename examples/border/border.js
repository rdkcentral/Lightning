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
                Rect: {x: 50, y: 50, type: BorderView, borderWidth: 10, colorBorder: 0xFFFF0000, content: {
                    text: {text: "hello world"}
                }}
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
