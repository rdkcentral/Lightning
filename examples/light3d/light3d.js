/**
 *
 */
var start = function(wpe) {

    wpe = wpe || {};

    with(wpe) {
        var options = {w: 900, h: 900, glClearColor: 0xFF000000, useTextureAtlas: false, debugTextureAtlas: false};

        // Nodejs-specific options.
        if (Utils.isNode) {
            options.window = {title: "Usage example", fullscreen: false};
            options.supercharger = {localImagePath: __dirname};
        }

        var stage = new Stage(options);

        if (!Utils.isNode) {
            document.body.appendChild(stage.getCanvas());
        }

        stage.root.add([{rect: true, w: 900, h: 900, colorLeft: 0xFF000000, colorRight: 0xFF0000FF, children: [
            {rect: true, tag:'l1', color: 0xFFFF0000, shader: {type: Light3dShader, rx: 0, z: 400, pivotZ: 0}, w: 450, h: 300, x: 450, y: 450, mount: 0.5},
            {rect: true, tag:'l2', color: 0xFF00FF00, shader: {type: Light3dShader, rx: 0, z: 0, pivotZ: 0}, alpha: 0.5, w: 450, h: 300, x: 450, y: 450, mount: 0.5}
        ]}])

        stage.root.tag('l1').animation({repeat: -1, duration: 40, actions: [
            {p: 'shader.rx', merger: StageUtils.mergeNumbers, v: {0:0, 1: -30}}
        ]}).start()

        stage.root.tag('l2').animation({repeat: -1, duration: 40, actions: [
            {p: 'shader.rx', merger: StageUtils.mergeNumbers, v: {0:0, 1: 30}}
        ]}).start()

    }
};

if (typeof window === "undefined") {
    // Nodejs: start.
    start(require('../../wpe'));
}
