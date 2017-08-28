/**
 *
 */
var start = function(wpe) {

    wpe = wpe || {};

    with(wpe) {
        var options = {w: 1280, h: 720, glClearColor: 0xFF000000, useTextureAtlas: false, debugTextureAtlas: false};

        var stage = new Stage(options);

        document.body.appendChild(stage.getCanvas());

        stage.root.add([
            {tags: 'main-wrap', w: 1280, h: 720, scale: 1, children: [
                {tags: 'main', shader: {type: PhongShader}, rect: true, w: 1280, h: 720}
            ]}
        ]);

        stage.root.tag('main').setSmooth('shader.time', 1000, {duration: 1000, timingFunction: 'linear'})

        let a = stage.root.tag('main').animation({duration: 2, repeat: -1, actions: [
            {p: 'shader.radius', merger: StageUtils.mergeNumbers, v: {0: 10, 0.5: 30, 1: 10}}
        ]});
        a.start();
    }
};

if (typeof window === "undefined") {
    // Nodejs: start.
    start(require('../../wpe'));
}
