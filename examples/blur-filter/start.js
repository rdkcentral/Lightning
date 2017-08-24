/**
 *
 */
var start = function(wpe) {

    wpe = wpe || {};

    with(wpe) {
        var options = {w: 1280, h: 720, glClearColor: 0xFF000000, useTextureAtlas: false, debugTextureAtlas: false};

        var stage = new Stage(options);

        if (!Utils.isNode) {
            document.body.appendChild(stage.getCanvas());
        }

        stage.root.add([
            {tags: 'image', rect: true, src: './boat.png', colorLeft: 0xffff0000, colorRight: 0xff00ff00, renderToTexture: 0, y: 95, x: 10}
        ]);

        stage.root.tag('image').filters = [{type: BlurFilter}]

        stage.root.tag('image').setSmooth('filters[0].steps', 4, {duration: 0.2, delay: 1, timingFunction: 'linear'});

        stage.root.tag('image').setSmooth('x', 300, {duration: 3});

    }
};

if (typeof window === "undefined") {
    // Nodejs: start.
    start(require('../../wpe'));
}
