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

        var texture = Tools.getRoundRect(stage, 400, 200, 10, 2, 0xFFFFFF00, true, 0xFF00FF00);
        // stage.root.add([
        //     {tags: 'bg', clipping: false, rect: true, zIndex: 1, x: 20, y: 20, w: 600, rotation: 0.0, h: 600, colorUl: 0xFFFF0000, colorBr: 0xFFFF6666, children: [
        //         {tag: 'image-3d', clipping: false, renderAsTexture: false, rotation: 0, w: 700, h: 700, y: 100, x: 10, scale: 1.0, children: [
        //             {tags: 'hello', shader: {type: BlurShader, rx: 0.5, ry: 0.8}, renderAsTexture: false, texture: texture, x: 10, y: 20, w: 400, h: 200},
        //             {tags: 'image', colorUl: 0xFFFF0000, shader: {type: Light3dShader, rx: 0.5, ry: 0.8}, shaderSettings: {z: 10}, rotation: 0.0, pivotX: 0.5, pivotY: 0.5, alpha: 1, mountX: 0.5, mountY:0.5, x: 450, y: 450, src: 'http://adn.gpupdate.net/news/297192.jpg', scale: 1, children: [
        //                 {tag: 'border', type: BorderView, shaderSettings: {z: -100}, borderWidth: 20, rect: false, color: 0xFFFF0000, w: 100, h: 10, x: 150, y: 100, children: [
        //                     {tags: 'hello', zIndex: 0, texture: texture, shaderSettings: {z: 50}}
        //                 ]}
        //             ]},
        //         ]},
        //     ]}
        // ]);
        //
        // stage.root.add([
        //     {tags: 'bg', clipping: false, rect: true, zIndex: 1, x: 20, y: 20, w: 600, rotation: 0.0, h: 600, colorUl: 0xFFFF0000, colorBr: 0xFFFF6666, children: [
        //         {tags: 'image', colorUl: 0xFFFF0000, shader: {type: Light3dShader, rx: 0.5, ry: 0.8, ambient: 0.2}, shaderSettings: {z: 10}, rotation: 0.0, pivotX: 0.5, pivotY: 0.5, alpha: 1, mountX: 0.5, mountY:0.5, x: 450, y: 450, rect: true, w: 400, h: 400, scale: 1, children: [
        //             {tag: 'border', type: BorderView, shaderSettings: {z: -100}, borderWidth: 20, rect: false, color: 0xFFFF0000, w: 100, h: 10, x: 150, y: 100, children: [
        //                 {tags: 'hello', zIndex: 0, shader: null, texture: texture, shaderSettings: {z: 50}}
        //             ]}
        //         ]}
        //     ]}
        // ])

        // stage.root.add([
        //     {tags: 'bg', clipping: false, rect: true, zIndex: 1, x: 20, y: 20, w: 600, rotation: 0.0, h: 600, colorUl: 0xFFFF0000, colorBr: 0xFFFF6666, children: [
        //         //{tags: 'image', src: 'http://adn.gpupdate.net/news/297192.jpg'/*, rect: false*/, colorLeft: 0xffff0000, colorRight: 0xff00ff00, renderAsTexture: 1, rotation: 0.0, pivotX: 0.5, pivotY: 0.5, alpha: 1, x: 10, y: 10, scale: 1, children: [
        //         {tags: 'image', src: 'http://adn.gpupdate.net/news/297192.jpg'/*, rect: false*/, colorLeft: 0xffff0000, colorRight: 0xff00ff00, renderToTexture:2,/*, shader: {type: Light3dShader, rx: 0.0}, */fislters: {shaders: [{type: LinearBlurShader, kernelRadius: 3}, {type: LinearBlurShader, kernelRadius: 3, x: 0, y: 1}, {type: LinearBlurShader, kernelRadius: 3, x: -1} ,{type: LinearBlurShader, kernelRadius: 3, x: 0, y: -1}]}, rotation: 0.0, pivotX: 0.5, pivotY: 0.5, alpha: 1, x: 10, y: 10, scale: 1, children: [
        //         //{tags: 'image', src: 'http://adn.gpupdate.net/news/297192.jpg'/*, rect: false*/, colorLeft: 0xffff0000, colorRight: 0xff00ff00, filters: {shaders: [{type: LinearBlurShader, kernelRadius: 3}, {type: LinearBlurShader, kernelRadius: 3}, {type: LinearBlurShader, kernelRadius: 3}, {type: LinearBlurShader, kernelRadius: 3}]}/*, renderAsTexture: 1, shader: {type: Light3dShader, rx: 0.5}*/, rotation: 0.0, pivotX: 0.5, pivotY: 0.5, alpha: 1, x: 10, y: 10, scale: 1, children: [
        //             {tag: 'border', scale: 0.5, type: BorderView, borderWidth: 20, rect: false, shaderSettings: {z: 100}, color: 0xFFFF0000, w: 100, h: 10, x: 150, y: 0, children: [
        //                 {tags: 'hello', src: 'http://adn.gpupdate.net/news/297192.jpg', zIndex: 0/*, texture: texture*/, shaderSettings: {z: 50}}
        //             ]}
        //         ]}
        //     ]}
        // ])

        stage.root.add([
//            {filters: [{type: Light3dShader, rx: 0.2}], w: 710, h: 355, children: [
                {tags: 'image', src: 'http://adn.gpupdate.net/news/297192.jpg'/*, rect: false*/, shader: null, colorLeft: 0xffff0000, colorRight: 0xff00ff00, renderAsTexture: 2, filters: {shaders: [{type: LinearBlurShader, kernelRadius: 3}]}, rotation: 0.0, y: 95, mountY: 0, pivotX: 0.5, pivotY: 0.5, alpha: 1, x: 10, scale: 1, children: [
                    {tags: 'hello', src: 'http://adn.gpupdate.net/news/297192.jpg', y: 100}
                    // {tag: 'border', scale: 1, type: BorderView, borderWidth: 20, rect: false, shaderSettings: {z: 0}, color: 0xFFFF0000, x: 0, y: 100, children: [
                    //     {tags: 'hello', src: 'http://adn.gpupdate.net/news/297192.jpg', zIndex: 0/*, texture: texture*/, shaderSettings: {z: 0}}
                    // ]}
                ]}
//            ]}
        ])

        // stage.root.add([
        //     {x: 10, y: 10, w: 500, h: 500, rect: true, renderToTexture: 0, color: 0xFFFF0000, children: [
        //         {tag: 'bad', x: 50, y: 50, w: 300, h: 300, rect: true, renderToTexture: 0, color: 0xFF00FF00, children: [
        //              {tag: 't', x: 25, y: 25, w: 100, h: 100, rect: true, color: 0xFF0000FF, renderAsTexture: 2, children: [
        //              ]}
        //         ]}
        //     ]}
        // ])

        //stage.root.tag('border').setSmooth('x', 400, {duration:2});

        stage.root.setSmooth('y', 1.1, {duration: 1000});

        // setTimeout(function() {
        //     stage.root.x = 5;
        //     stage.root.setSmooth('x', 1000, {duration: 10});
        // }, 3000)
//        stage.root.tag('image').setSmooth('shader.rx', 10, {duration: 10});

        //stage.root.tag('border').setSmooth('x', 300, {duration: 3});

        //stage.root.tag('image').setSmooth('rotation', 3, {duration: 10});

    }
};

if (typeof window === "undefined") {
    // Nodejs: start.
    start(require('../../wpe'));
}
