/**
 *
 */
var start = function(wpe) {

    wpe = wpe || {};

    with(wpe) {
        var options = {w: 1280, h: 720, glClearColor: 0xFF000000, useTextureAtlas: false, debugTextureAtlas: false};

        var stage = new Stage(options);

        document.body.appendChild(stage.getCanvas());

        let selectedShader = new UiLightShader(stage.ctx);
        selectedShader.x = 640;
        selectedShader.y = 360;
        selectedShader.z = -100;
        selectedShader.intensity = 1.5;


        stage.root.add([
            {tags: 'main', w: 1280, h: 720, scale: 1, shader: {type: UiLightShader}, children: [
                {type: ListView, tag: 'list', w: 1280, h: 400, clipping: false, itemSize: 300, scrollTransition: {duration: 0.5}, invertDirection: false, roll: true, viewportScrollOffset: 0.5, itemScrollOffset: 0.5, children: [
                    {y: 200, w: 290, h: 300, src: "../blur-filter/boat.png"},
                    {y: 200, w: 290, h: 300, src: "../blur-filter/boat.png"},
                    {y: 200, w: 290, h: 300, src: "../blur-filter/boat.png"},
                    {y: 200, w: 290, h: 300, src: "../blur-filter/boat.png"},
                    {y: 200, w: 290, h: 300, src: "../blur-filter/boat.png"},
                    {y: 200, w: 290, h: 300, src: "../blur-filter/boat.png"},
                    {y: 200, w: 290, h: 300, src: "../blur-filter/boat.png"},
                    {y: 200, w: 290, h: 300, src: "../blur-filter/boat.png"},
                    {y: 200, w: 290, h: 300, src: "../blur-filter/boat.png"},
                ]}
            ]}
        ]);

        let main = stage.root.tag('main')
        let selected = stage.root.tag('selected')

        main.shader.x = 640;
        main.shader.y = 360;
        main.shader.z = -110;
        main.shader.intensity = 1.5;

        let shader = stage.root.tag('main').shader
        window.onmousemove = function(e) {
            shader.x = e.clientX
            shader.y = e.clientY

            selectedShader.x = e.clientX
            selectedShader.y = e.clientY
        }

        let list = stage.root.tag('list');
        list.on('focus', function(v) {
            v.SCALE = 1.1;
            v.zIndex = 1;
            v.shader = selectedShader;
            main.shader.shadowViewZ = -100;
            main.shader.shadowView = v;
        });

        list.on('unfocus', function(v) {
            v.SCALE = 1;
            v.zIndex = 0;
            v.shader = undefined;
        });


        list.setNext();
        // var c = 30;
        // setInterval(function() {
        //     c--;
        //     if (c >0) {
        //         list.setNext();
        //         list.update();
        //     } else if (c == 0) {
        //         list.setNext();
        //     }
        // }, 500);

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
