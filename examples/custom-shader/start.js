/**
 *
 */
var start = function(wpe) {

    wpe = wpe || {};

    with(wpe) {
        var options = {w: 900, h: 900, glClearColor: 0xFF000000, useTextureAtlas: false, debugTextureAtlas: false};

        var stage = new Stage(options);

        document.body.appendChild(stage.getCanvas());

        stage.root.add([
            {tags: 'main-wrap', colorTop: 0xFFFF55FF, colorBottom: 0xFFFF0000, colorizeResultTexture: true, renderToTexture: 2, w: 900, h: 900, scale: 1, children: [
                {tags: 'main', shader: {type: BeatShader}, rect: true, w: 900, h: 800}
            ]}
        ]);

        let ts = stage.root.tag('main-wrap').getResultTextureSource();
        stage.root.add({tag: 'replica', colorTop: 0xFFCCAAFF, colorBottom: 0xFF00AAFF, shader: {type: Light3dShader, ry: 1.2, ambient: 0.8, fudge: 0.6, strength: 0.2}, pivotY: 450/900, y: 450, mountY: 0, texture: ts, alpha: 1})

        stage.root.tag('replica').texture.y = 450
        stage.root.tag('replica').texture.h = 450

        stage.root.tag('main').setSmooth('shader.time', 1000, {duration: 1000, timingFunction: 'linear'})
//        stage.root.tag('replica').setSmooth('shader.ry', 2, {duration: 10, timingFunction: 'linear'})
    }
};

if (typeof window === "undefined") {
    // Nodejs: start.
    start(require('../../wpe'));
}
