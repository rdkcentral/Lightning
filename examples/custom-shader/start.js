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
            {tags: 'main-wrap', colorTop: 0xFFFF55FF, colorBottom: 0xFFFF0000, colorizeResultTexture: true, renderToTexture: 2, w: 1280, h: 720, scale: 1, children: [
                {tags: 'main', shader: {type: BeatShader}, rect: true, w: 1280, h: 720}
            ]}
        ]);

        //stage.root.renderToTexture = 2
        stage.root.filters = [{type: FxaaFilter}]

        let ts = stage.root.tag('main-wrap').getResultTextureSource();
        stage.root.add({tag: 'replica', colorTop: 0xFFCCAAFF, colorBottom: 0xFF00AAFF, rotation: 0.5, shader: {type: Light3dShader, ry: 0, z: 0.0, ambient: 0.8, fudge: 0.4, strength: 0.2}, pivotY: 0.5, y: 300, mountY: 0, mountX: 0.5, x: 1280/2, texture: ts, alpha: 1})
        stage.root.tag('replica').texture.y = (720 - 400) / 2
        stage.root.tag('replica').texture.h = 400
        stage.root.tag('replica').texture.x = (1280 - 400) / 2
        stage.root.tag('replica').texture.w = 400
        stage.root.tag('main').setSmooth('shader.time', 1000, {duration: 1000, timingFunction: 'linear'})
        stage.root.tag('replica').setSmooth('shader.z', 4000, {duration: 5, timingFunction: 'linear'})
        stage.root.tag('replica').setSmooth('shader.rx', 10 * 0.5 * Math.PI, {duration: 15})
        // stage.root.tag('replica').setSmooth('shader.ry', 10 * 0.5 * Math.PI, {duration: 15})
    }
};

if (typeof window === "undefined") {
    // Nodejs: start.
    start(require('../../wpe'));
}
