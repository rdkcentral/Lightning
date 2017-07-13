// var isNode = !!(((typeof module !== "undefined") && module.exports));
// if (isNode && !Stage) {
//     var Stage = require('../../wpe');
// }
//
var options = {w: 600, h: 600, glClearColor: 0xFF000000, defaultPrecision: 1};
// if (isNode) {
//     options.window = {title: "Usage example", fullscreen: false};
// }

var stage = new Stage(options);

document.body.appendChild(stage.getCanvas());

var start = function() {
    stage.root.add([
        {tag: 'bg', rect: true, x: 20, y: 20, w: 560, h: 560, colorTop: 0xFFFF0000, colorBottom: 0xFFFF6666, children: [
            {tag: 'box', rect: true, w: 400, x: 150, y: 50, h: 100, color: 0xAAFF00FF, borderWidth: 1, borderColor: 0xFF000000, children: [
                {tag: 'hello', /*text: {text: "hello world", fontSize: 50, sync: true}, */x: 10, y: 20}
            ]}
        ]}
    ]);

};

start();