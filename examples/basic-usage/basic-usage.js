/**
 *
 */
var start = function(wpe) {

    wpe = wpe || {};

    with(wpe) {
        var options = {w: 900, h: 900, glClearColor: 0xFF000000};

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

        const template = {
            Primary: {
                Guide: {rect: true, w: 1920, h: 1080, color: 0xFFFFAAAA, alpha: 0},
                Main: {rect: true, renderToTexture: true, w: 900, h: 900, colorLeft: 0xFF000000, colorRight: 0xFF0000FF,
                    Rect: {rect: true, color: 0xFFFF0000, w: 150, h: 300, x: 300, y: 300}
                },
                Shadow: {
                    texture: Tools.getShadowRect(stage, 100, 100, 15, 10),
                    color: 0xAA000000,
                    x: 400 - 20, y: 400 - 20
                },
                App: {alpha: 0},
                x: 10
            },
            Overlay: {}
        }

        stage.root.patch(template, true)

        stage.root.patch({
            Primary: {
                y: 11,
                Guide: {
                    w: 1000,
                    __create: true,
                    Test: {x: 10, y: 10}
                }
            }
        })

        let str = stage.root.toString()
        console.log(str)
    }
};

if (typeof window === "undefined") {
    // Nodejs: start.
    start(require('../../wpe'));
}
