/**
 *
 */
var start = function(wpe) {

    wpe = wpe || {};

    with(wpe) {
        var options = {w: 1920, h: 1080, glClearColor: 0xFF000000, useTextureAtlas: false, debugTextureAtlas: false};

        var stage = new Stage(options);

        if (!Utils.isNode) {
            document.body.appendChild(stage.getCanvas());
        }

        stage.root.add([
            {tags: 'image', rect: true, src: './boat.png', w: 640, h: 480, colorLeft: 0xffff0000, colorRight: 0xff00ff00, renderToTexture: 2, y: 0, x: 0}
        ]);

        stage.root.tag('image').filters = [{type: BlurFilter, steps: 1, kernelRadius: 2}]

        let i = 0
        setInterval(function() {
            i++
            stage.root.tag('image').filters[0].steps = (i % 2 == 0 ? 4 : 0)
        }, 200)

        stage.root.tag('image').setSmooth('x', 600, {duration: 10});

    }
};

if (typeof window === "undefined") {
    // Nodejs: start.
    start(require('../../wpe'));
}
