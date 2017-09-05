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
            var FastBoxBlurShader = require('./FastBoxBlurShader')
            var FastBlurOutputShader = require('./FastBlurOutputShader')
        }

        stage.root.add([
            {tags: 'l0', renderToTexture: 2, hideResultTexture: true, w: 1280, h: 720, children: [{tag: 'mountains', src: './mountains.jpg', alpha: 1}, {tag: 'mountains2', scale: 0.75, src: './mountains.jpg', alpha: 1}]},
            {tags: 'l1', renderToTexture: 2, hideResultTexture: true, w: 1280/2, h: 720/2, scale: 2, pivot: 0, children: [{tag: 'l1c', w: 1280/2, h: 720/2, shader: {type: FastBoxBlurShader}}]},
            {tags: 'l2', renderToTexture: 2, hideResultTexture: true, w: 1280/4, h: 720/4, scale: 4, pivot: 0, children: [{tag: 'l2c', w: 1280/4, h: 720/4, shader: {type: FastBoxBlurShader}}]},
            {tags: 'l3', renderToTexture: 2, hideResultTexture: true, w: 1280/8, h: 720/8, scale: 8, pivot: 0, children: [{tag: 'l3c', w: 1280/8, h: 720/8, shader: {type: FastBoxBlurShader}}]},
            {tags: 'l4', renderToTexture: 2, hideResultTexture: true, w: 1280/16, h: 720/16, scale: 16, pivot: 0, children: [{tag: 'l4c', w: 1280/16, h: 720/16, shader: {type: FastBoxBlurShader}}]},
            {tags: 'output', w: 1280, h : 720, shader: {type: FastBlurOutputShader}}
        ]);

        let r = stage.root
        //r.setSmooth('rotation', 8, {duration : 10})
        r.tag('mountains').setSmooth('rotation', 8, {duration: 20})
        r.tag('mountains2').setSmooth('rotation', -8, {duration: 20})

        r.tag('l1c').texture = r.tag('l0').getResultTextureSource()
        r.tag('l2c').texture = r.tag('l1').getResultTextureSource()
        r.tag('l3c').texture = r.tag('l2').getResultTextureSource()
        r.tag('l4c').texture = r.tag('l3').getResultTextureSource()

        r.tag('l2').filters = [{type: LinearBlurFilter, x: 1, y: 0, kernelRadius: 1}, {type: LinearBlurFilter, x: 0, y: 1, kernelRadius: 1}]
        r.tag('l3').filters = [{type: LinearBlurFilter, x: 1.5, y: 0, kernelRadius: 1}, {type: LinearBlurFilter, x: 0, y: 1.5, kernelRadius: 1}, {type: LinearBlurFilter, x: 1, y: 0, kernelRadius: 1}, {type: LinearBlurFilter, x: 0, y: 1, kernelRadius: 1}]
        r.tag('l4').filters = [{type: LinearBlurFilter, x: 1.5, y: 0, kernelRadius: 1}, {type: LinearBlurFilter, x: 0, y: 1.5, kernelRadius: 1}, {type: LinearBlurFilter, x: 1, y: 0, kernelRadius: 1}, {type: LinearBlurFilter, x: 0, y: 1, kernelRadius: 1}]

        let o = r.tag('output')
        o.texture = r.tag('l2').getResultTextureSource()
        o.shader.otherTextureSource = r.tag('l3').getResultTextureSource()
        o.shader.a = 0.1

        //r.tag('l1').setSmooth('alpha', 1, {timingFunction: 'linear', delay: 1, duration: 0.2});
        //r.tag('l2').setSmooth('alpha', 1, {timingFunction: 'linear', delay: 1.2, duration: 0.4});
        // r.tag('l3').setSmooth('alpha', 1, {timingFunction: 'linear', delay: 1.6, duration: 1.0});
        // r.tag('l4').setSmooth('alpha', 1, {timingFunction: 'linear', delay: 2.6, duration: 0.8});


    }
};

if (typeof window === "undefined") {
    // Nodejs: start.
    start(require('../../wpe'));
}
