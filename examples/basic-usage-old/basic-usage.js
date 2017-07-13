// var isNode = !!(((typeof module !== "undefined") && module.exports));
// if (isNode && !Stage) {
//     var Stage = require('../../wpe');
// }
//
var options = {w: 600, h: 600, glClearColor: 0xFFFFFFFF, defaultPrecision: 1, useTextureAtlas: false};
// if (isNode) {
//     options.window = {title: "Usage example", fullscreen: false};
// }

var stage = new Stage(options);

document.body.appendChild(stage.getCanvas());

var start = function() {
    stage.root.rect = true;
    stage.root.color = 0xFFFF0000;
    stage.root.w = 200;
    stage.root.h = 300;

    // stage.root.add([
    //     {tags: 'bg', rect: true, x: 20, y: 20, w: 560, h: 560, colorTop: 0xFFFF0000, colorBottom: 0xFFFF6666, children: [
    //         {tags: 'box', rect: true, w: 400, x: 150, y: 50, h: 100, color: 0xAAFF00FF, borderWidth: 1, borderColor: 0xFF000000, children: [
    //             {tags: 'hello', /*text: {text: "hello world", fontSize: 50, sync: true}, */x: 10, y: 20}
    //         ]}
    //     ]}
    // ]);

    setInterval(function() {
        stage.root.x += 0.001;
    }, 100);
};


start();