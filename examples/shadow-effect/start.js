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
            {tags: 'fg', w: 1280, h: 720, renderToTexture: 2, children: [
                {x: 100, y: 100, rect: true, w: 600, h: 300, color: 0xffff0000, colorRight: 0x44ff0000},
                {x: 100, y: 400, text: {text: "hello world"}}
            ]},
            {tags: 'bg', w: 1280, h: 720, color: 0xff777777, x: 0, y: 0, alpha: 1, scale: 0.5},
        ]);

        let r = stage.root

        let rst = r.tag('fg').getResultTextureSource();
        r.tag('bg').texture = rst;

        setInterval(function() {
            r.tag('fg').children[0].x+=25;
        }, 100)
        console.log(rst.glTexture)
    }
};

if (typeof window === "undefined") {
    // Nodejs: start.
    start(require('../../wpe'));
}
