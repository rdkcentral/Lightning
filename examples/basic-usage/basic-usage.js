var start = function(wpe) {

    var Stage = wpe.Stage;
    var Utils = wpe.Utils;
    var BorderView = wpe.BorderView;
    var StageUtils = wpe.StageUtils;

    var options = {w: 600, h: 600, glClearColor: 0xFF000000, useTextureAtlas: true, debugTextureAtlas: false};

    // Nodejs-specific options.
    if (Utils.isNode) {
        options.window = {title: "Usage example", fullscreen: false};
        options.supercharger = {localImagePath: __dirname};
    }

    //options.text2pngEndpoint = 'http://localhost:3457/';

    var stage = new Stage(options);

    if (!Utils.isNode) {
        document.body.appendChild(stage.getCanvas());
    }

    var texture = wpe.Tools.getRoundRect(stage, 400, 400, 10, 2, 0xFF000000, true, 0xFF00FF00);
    stage.root.add([
        {tags: 'bg', rect: true, x: 20, y: 20, w: 560, h: 560, colorUl: 0xFFFF0000, colorBr: 0xFFFF6666, zIndex: 1, children: [
            {tags: 'image', alpha: 1, src: 'http://adn.gpupdate.net/news/297192.jpg', zIndex: 1, scale: 0.75, y: 100},
            {tags: 'hello', texture: texture, x: 10, y: 20},
            {tag: 'borders', type: BorderView, borderWidth: 20, rect: true, w: 400, h: 200, x: 150, color: 0xAAFFFFFF, children: [
                {tags: 'hello2', text: {text: "hello world", fontSize: 80}, x: 10, y: 20}
            ]}
        ]}
    ]);

    let animdef = stage.animations.createSettings({duration: 3, autostop: true, stopTimingFunction: 'linear', stopDuration: 3, actions: [
        {property: ['y'], value: {0:0,1:100}},
        {property: ['color'], value: {0:0xFFFFFFFF,1:0xFFFF0000}},
        {property: 'borderColor', t: 'borders', merger: null, value: {0:0xFFFFFFFF,1:0xFF00FF00}},
    ]});
    let anim = stage.animations.createAnimation(stage.root.tag('bg'), animdef);
    anim.start();

    var hello2 = stage.root.tag('hello2');
    hello2.transition('x', {duration: 5});
    hello2.X = 100;

    let shader = new wpe.LightningShader();
    shader._z = 0;
    stage.root.tag('image').vboShader = shader;

    //stage.root.tag('image').setTval('vboShader.z', 3, {duration: 10, merger: StageUtils.mergeNumbers});
    let lightBouncer = stage.root.tag('image').animation({duration: 4, repeat: -1, actions: [
        {p: 'vboShader.z', merger: StageUtils.mergeNumbers, v: {0: 0, 0.5: 0.8, 1: 0}}
    ]});
    lightBouncer.start();

    //stage.root.tag('image').setTval('vboShader.strength', 5, {duration: 10, merger: StageUtils.mergeNumbers});

    setTimeout(function() {
        let anim2 = stage.animations.createAnimation(stage.root.tag('hello2'), animdef);
        anim2.start();

    }, 500);
};

if (typeof window === "undefined") {
    // Nodejs: start.
    start(require('../../wpe'));
}
