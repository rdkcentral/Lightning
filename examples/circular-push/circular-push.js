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
                Rect: {renderToTexture: true, x: 0, y: 0, w: 900, h: 900, shader: {type: CircularPushShader, amount: 0.2},
                    Inner: {rect: true, x: 100, y: 100, w: 650, h: 600, colorLeft: 0xFFFF0000, colorRight: 0xFF0000FF},
                    Background: {text: {text: "hello world", fontSize: 40}}
                }
            }
        }

        stage.root.patch(template, true)

        const shader = stage.root.tag("Rect").shader
        let t = 0
        stage.on('frameStart', () => {
            t = 0.9 * t + 0.1 * Math.random()
            shader.inputValue = t
            shader.progress(0.005)
        })

    }
};

if (typeof window === "undefined") {
    // Nodejs: start.
    start(require('../../wpe'));
}
