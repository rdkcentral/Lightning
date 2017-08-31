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
            {tags: 'main-wrap', w: 1280, h: 720, scale: 1/*, filters: [{type: FxaaFilter}]*/, children: [
                {tags: 'main', shader: {type: BeatShader}, rect: true, w: 1280, h: 720},
                // {tags: 'main', shader: {type: PhongShader}, rect: true, w: 1280, h: 720},
                // {tags: 'main', shader: {type: PhongShader}, rect: true, w: 1280, h: 720},
                // {tags: 'main', shader: {type: PhongShader}, rect: true, w: 1280, h: 720},
                // {tags: 'main', shader: {type: PhongShader}, rect: true, w: 1280, h: 720},
                // {tags: 'main', shader: {type: PhongShader}, rect: true, w: 1280, h: 720},
                // {tags: 'main', shader: {type: PhongShader}, rect: true, w: 1280, h: 720},
                // {tags: 'main', shader: {type: PhongShader}, rect: true, w: 1280, h: 720},
                // {tags: 'main', shader: {type: PhongShader}, rect: true, w: 1280, h: 720},
                // {tags: 'main', shader: {type: PhongShader}, rect: true, w: 1280, h: 720},
                // {tags: 'main', shader: {type: PhongShader}, rect: true, w: 1280, h: 720},
                // {tags: 'main', shader: {type: PhongShader}, rect: true, w: 1280, h: 720},
                // {tags: 'main', shader: {type: PhongShader}, rect: true, w: 1280, h: 720},
                // {tags: 'main', shader: {type: PhongShader}, rect: true, w: 1280, h: 720},
                // {tags: 'main', shader: {type: PhongShader}, rect: true, w: 1280, h: 720},
                // {tags: 'main', shader: {type: PhongShader}, rect: true, w: 1280, h: 720},
            ]}
        ]);

        //stage.root.tag('main').setSmooth('shader.time', 1000, {duration: 1000, timingFunction: 'linear'})

        // let a = stage.root.animation({duration: 5, repeat: -1, actions: [
        //     //{t: 'main', p: 'shader.radius', merger: StageUtils.mergeNumbers, v: {0: 10, 0.5: 30, 1: 10}},
        //     {t: 'main', p: 'shader.x', merger: StageUtils.mergeNumbers, v: {0: 0, 0.5: 1280, 1: 10}}
        // ]});
        // a.start();
        //
        // let b = stage.root.animation({duration: 7, repeat: -1, actions: [
        //     //{t: 'main', p: 'shader.radius', merger: StageUtils.mergeNumbers, v: {0: 10, 0.5: 30, 1: 10}},
        //     {t: 'main', p: 'shader.y', merger: StageUtils.mergeNumbers, v: {0: 0, 0.5: 720, 1: 10}}
        // ]});
        // b.start();

        let shader = stage.root.tag('main').shader
        window.onmousemove = function(e) {
            shader.x = e.clientX
            shader.y = 720 - e.clientY
            shader.redraw()
        }

    }
};

if (typeof window === "undefined") {
    // Nodejs: start.
    start(require('../../wpe'));
}
