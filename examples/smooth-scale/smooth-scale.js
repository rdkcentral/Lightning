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
            Scaler: {type: SmoothScaleView, content: {
                text: {text: "hello", fontSize: 250}
            }}
        }

        stage.root.patch(template, true)

        const view = stage.root
        view.tag("Scaler").animation({duration: 6, repeat: -1, actions: [
            {p: 'smoothScale', v: {0: 1, 0.5: 0.1, 1.0: 1}}
        ]}).start()
        //view.tag("Scaler").setSmooth('smoothScale', 0.1, {duration: 5})
    }
};

if (typeof window === "undefined") {
    // Nodejs: start.
    start(require('../../wpe'));
}
