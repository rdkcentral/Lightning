/**
 *
 */
var stage;
var w;
var start = function(wpe) {
    w = wpe
    wpe = wpe || {};

    with(wpe) {
        var options = {w: 1280, h: 720, glClearColor: 0xFF000000, useTextureAtlas: false, debugTextureAtlas: false};

        stage = new Stage(options);

        if (!Utils.isNode) {
            document.body.appendChild(stage.getCanvas());
        }

        stage.root.add([
            {tag: 'blur', type: FastBlurView, amount: 0, w: 1280, h: 720, padding: 0}
        ]);

        stage.root.tag('blur').children = [{tag: 'mountains', src: './boat.png', alpha: 1, w: 1280, h: 720}]

        let r = stage.root
        //r.setSmooth('rotation', 8, {duration : 10})
//        r.tag('mountains').setSmooth('rotation', 8, {duration: 20})

        // r.animation({duration: 3, repeat: -1, actions: [
        //     {t: 'blur', p: 'amount', merger: 'numbers', v: {0:0.0, 1:2}}
        // ]}).start();


        r.tag('blur').setSmooth('amount', 4, {delay: 2, duration: 3, timingFunction: 'ease'})
        // r.animation({duration: 3, repeat: -1, actions: [
        //     {t: 'blur', p: 'amount', merger: 'numbers', v: {0:0.0, 0.5:5, 1: 0.0}}
        // ]}).start();

//        r.setSmooth('x', 300, {duration: 10})

        if (!Utils.isNode) {
            window.stage = stage
        }
    }
};

if (typeof window === "undefined") {
    // Nodejs: start.
    start(require('../../wpe'));

}

// setInterval(function() {
//     // Memory leak test.
//     stage.destroy();
//     stage = null
//     start(w)
// }, 3000)
