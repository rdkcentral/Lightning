// var isNode = !!(((typeof module !== "undefined") && module.exports));
// if (isNode && !Stage) {
//     var Stage = require('../../wpe');
// }
//
var options = {w: 600, h: 600, glClearColor: 0xFF00FFFF, defaultPrecision: 1, useTextureAtlas: false};
// if (isNode) {
//     options.window = {title: "Usage example", fullscreen: false};
// }

var stage = new Stage(options);

document.body.appendChild(stage.getCanvas());

var start = function() {
    // stage.root.setSettings({tags: 'hello', text: {text: "hello world", fontSize: 50}, x: 10, y: 20});

    stage.root.add([
        {tags: 'bg', rect: true, x: 20, y: 20, w: 560, h: 560, colorUl: 0xFFFF0000, colorBr: 0xFFFF6666, children: [
            {tags: 'hello', text: {text: "hello world", fontSize: 50}, x: 10, y: 20},
            {tags: 'box', rect: true, w: 400, x: 150, y: 50, h: 100, color: 0xAAFF00FF, borderWidth: 1, borderColor: 0xFF000000, children: [
                {tags: 'hello', text: {text: "hello world", fontSize: 50}, x: 10, y: 20}
            ]}
        ]}
    ]);

    setInterval(function() {
        stage.root.x += 0.1;
    }, 100);
};


start();