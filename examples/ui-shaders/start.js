/**
 *
 */
var start = function(wpe) {

    wpe = wpe || {};

    with(wpe) {
//        var options = {w: 1920, h: 1080, precision: 1, glClearColor: 0xFF000000, useTextureAtlas: false, debugTextureAtlas: false};
        var options = {w: 1280, h: 720, precision: 720 / 1080, glClearColor: 0xFF000000, useTextureAtlas: false, debugTextureAtlas: false};

        // Nodejs-specific options.
        if (Utils.isNode) {
            options.window = {title: "Usage example", fullscreen: false};
            options.supercharger = {localImagePath: __dirname};
            var UiLightShader = require('./UiLightShader');
        }

        var stage = new Stage(options);

        if (!Utils.isNode) {
            document.body.appendChild(stage.getCanvas());
        }

        let shader = new UiLightShader(stage.ctx);
        shader.x = 1920/2;
        shader.y = 460;
        shader.z = 800;
        shader.intensity = 50;
        shader.shadowScale = 0.1;
        shader.shadowBlur = 0.05;
        //shader.color = 0xf4bc42;

        stage.root.add([
            {tags: 'main', w: 1920, h: 1080, clipping: true, scale: 1, children: [
                {tag: 'shader', shader: shader, children: [
                    // {rect: true, x: 0, y: 0, w: 1920, h: 1080, color: 0xFF555555, zIndex: 0},
                    {type: ListView, y: 200, tag: 'list', w: 1920, h: 510, itemSize: 780, invertDirection: false, roll: true, viewportScrollOffset: 0.5, itemScrollOffset: 0.5, children: [
                        { x: -1, y: -1, w: 758 + 2, h: 506 + 2, visitExit: function(view) {view.w = view.children[0].renderWidth + 2}, renderToTexture: true, children: [{src: "./rocky-highres.jpg", x: 1, y: 1}]},
                        { x: -1, y: -1, w: 758 + 2, h: 506 + 2, renderToTexture: true, children: [{src: "./rocky-highres2.jpg", x: 1, y: 1}, {text: {text: "hello world", fontSize: 60}, texture: {x: 100, w: 100}, x: 10, y: 400}]},
                        { x: -1, y: -1, w: 758 + 2, h: 506 + 2, renderToTexture: true, children: [{src: "./rocky-highres2.jpg", x: 1, y: 1}]},
                        { x: -1, y: -1, w: 758 + 2, h: 506 + 2, renderToTexture: true, children: [{src: "./rocky-highres.jpg", x: 1, y: 1}]},
                        { x: -1, y: -1, w: 758 + 2, h: 506 + 2, renderToTexture: true, children: [{src: "./rocky-highres2.jpg", x: 1, y: 1}]},
                        { x: -1, y: -1, w: 758 + 2, h: 506 + 2, renderToTexture: true, children: [{src: "./rocky-highres.jpg", x: 1, y: 1}]},
                        { x: -1, y: -1, w: 758 + 2, h: 506 + 2, renderToTexture: true, children: [{src: "./rocky-highres2.jpg", x: 1, y: 1}]},
                        { x: -1, y: -1, w: 758 + 2, h: 506 + 2, renderToTexture: true, children: [{src: "./rocky-highres.jpg", x: 1, y: 1}]},
                        { x: -1, y: -1, w: 758 + 2, h: 506 + 2, renderToTexture: true, children: [{src: "./rocky-highres2.jpg", x: 1, y: 1}]},
                        { x: -1, y: -1, w: 758 + 2, h: 506 + 2, renderToTexture: true, children: [{src: "./rocky-highres.jpg", x: 1, y: 1}]},
                    ]}
                ]}
            ]}
        ]);
        setTimeout(function() {
            stage.root.tag('list').addChildAt(
                stage.c({ x: -1, y: -1, w: 758 + 2, h: 506 + 2, renderToTexture: true, children: [{src: "./rocky-highres.jpg", color: 0x77FFFF00, x: 1, y: 1}]}),
                2
            );
        }, 5000);

        let main = stage.root.tag('shader');

        if (!Utils.isNode) {
            // window.onmousemove = function (e) {
            //     shader.x = e.clientX / stage.getRenderPrecision()
            //     shader.y = e.clientY / stage.getRenderPrecision()
            // }
        }

        let list = stage.root.tag('list');
        list.on('focus', function(v) {
            v.setSmooth('zIndex', 200, {duration: .5});
            v.setSmooth('scale', 1.1, {duration: .5, timingFunction: 'ease'});
            //@todo: allow different widths in list
            //@todo: explain

            main.setSmooth('shader.x', list.getAxisPosition(), {duration: 0.5});
        });
        list.scrollTransition = {duration: 1, timingFunction: 'ease'};
        list.progressAnimation = {duration: 0.5};

        list.on('unfocus', function(v) {
            v.setSmooth('zIndex', 0, {duration: 0.2});
            v.setSmooth('scale', 1.0, {duration: 0.2});
        });


        shader.amount = 0;
        main.setSmooth('shader.amount', 0.8, {duration: 2, delay: 0});

        // var c = 30;
        // setInterval(function() {
        //     var s = stage;
        //     c--;
        //     if (c >0) {
        //         list.setNext();
        //         list.update();
        //     } else if (c == 0) {
        //         list.setNext();
        //     }
        // },3000);

        list.setIndex(0);

        // stage.root.animation({duration: 3, repeat: -1, actions: [
        //     {t: ['main'], p: 'shader.x', merger: 'numbers', v: {0:0.0, 1:900}},
        //     {t: ['selected'], p: 'shader.x', merger: 'numbers', v: {0:0.0, 1:900}}
        // ]}).start();
    }
};

if (typeof window === "undefined") {
    // Nodejs: start.
    start(require('../../wpe'));
}
