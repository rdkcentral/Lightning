// var isNode = !!(((typeof module !== "undefined") && module.exports));
// if (isNode && !Stage) {
//     var Stage = require('../../wpe');
// }
//
var options = {w: 600, h: 600, glClearColor: 0xFF000000, useTextureAtlas: true, debugTextureAtlas: false};
// if (isNode) {
//     options.window = {title: "Usage example", fullscreen: false};
// }

var stage = new Stage(options);

document.body.appendChild(stage.getCanvas());

var start = function() {
    // stage.root.setSettings({tags: 'hello', text: {text: "hello world", fontSize: 50}, x: 10, y: 20});

    stage.root.add([
        {tags: 'bg', rect: true, x: 20, y: 20, w: 560, h: 560, colorUl: 0xFFFF0000, colorBr: 0xFFFF6666, zIndex: 1, children: [
           {tags: 'hello', text: {text: "hello world", fontSize: 50}, x: 10, y: 20},
           {tags: 'box', src: '../clipping/remote.jpg', w: 400, x: 150, color: 0xAAFF00FF, borderWidth: 1, borderColor: 0xFF000000, children: [
               {tags: 'hello2', text: {text: "hello world", fontSize: 50}, x: 10, y: 20}
           ]}
        ]}
    ]);

    setTimeout(function() {
        stage.root.tag('hello').zIndex = 10;
    }, 1000);


    // var hello2 = stage.root.tag('hello2');
    //
    // stage.transitions.set(hello2, 'texture.x', {duration: 2});
    // stage.transitions.start(hello2, 'texture.x', 100);
    //
    // let animdef = stage.animations.createSettings({duration: 3, autostop: true, stopTimingFunction: 'linear', stopDuration: 3, actions: [
    //     {property: ['y'], value: {0:0,1:100}},
    //     {property: ['color'], value: {0:0xFFFFFFFF,1:0xFFFF0000}},
    // ]});
    // let anim = stage.animations.createAnimation(stage.root.tag('bg'), animdef);
    // anim.start();
    //
    // setTimeout(function() {
    //     let anim2 = stage.animations.createAnimation(stage.root.tag('hello2'), animdef);
    //     anim2.start();
    // }, 500);

    let i = 1;
    // let def = stage.transitions.createSettings({duration: 2});
    // stage.transitions.set(hello2, 'texture.x', def);
    // stage.transitions.set(hello2, 'texture.y', def);
    //
    // var xt = stage.transitions.get(hello2, 'texture.x');
    // xt.start(100);
    //
    // var tm = stage.transitions;
    // tm.start(hello2, 'texture.y', 50);
    //
    // setTimeout(function() {
    //     tm.get(hello2, 'texture.x').finish();
    // }, 2000);

};


start();