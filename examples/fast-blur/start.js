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
        } else {
            var FastBlurView = require('./FastBlurView')
        }

        stage.root.add([
            {tag: 'blur', type: FastBlurView, amount: 1, w: 1280, h: 720}
        ]);

        stage.root.tag('blur').children = [{tag: 'mountains', src: './mountains.jpg', alpha: 1}]
        console.log(stage.root._lchildren[0]._lchildren.length)

        let r = stage.root
        //r.setSmooth('rotation', 8, {duration : 10})
        //r.tag('mountains').setSmooth('rotation', 8, {duration: 20})
        //r.tag('blur').setSmooth('amount', 4, {duration: 20})

        r.tag('mountains').setSmooth('x', 200, {duration: 20})

        if (!Utils.isNode)
            window.stage = stage

        setTimeout(function() {
            console.log(r._lchildren[0]._lchildren.length)
        }, 1000)
    }
};

if (typeof window === "undefined") {
    // Nodejs: start.
    start(require('../../wpe'));
}
