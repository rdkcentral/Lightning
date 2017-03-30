var isNode = !!(((typeof module !== "undefined") && module.exports));
if (isNode) {
    var Stage = require('../../wpe');
}

var options = {w: 1280, h: 720, glClearColor: 0xFF000000, window: {title: "Usage example", fullscreen: false}};
if (isNode) {
    options.window = {title: "Usage example", fullscreen: false};
}
var stage = new Stage(options);

if (!isNode) {
    document.body.appendChild(stage.getCanvas());
}

var basePath = (isNode ? __dirname + '/' : './');

stage.root.add([
    {tag: 'bg', rect: true, x: 20, y: 20, w: 560, h: 560, colorTop: 0xFFFF0000, colorBottom: 0xFFFF6666, children: [
        {tag: 'hello', text: {text: "hello world", fontSize: 100}, x: 280, y: 170, mountX: 0.5, mountY: 0.5, alpha: 0.5},
        {tag: 'bunnies', x: 30, y: 30, w: 500, h: 500, clipping: true, borderWidth: 10, borderColor: 0xFF000000, children: [
            {src: basePath + 'bunny.png', x: 20, y: 400, scale: 8, rotation: 0.3},
            {src: basePath + 'bunny.png', x: 480, y: 400, scale: 8, rotation: -0.3}
        ]}
    ]}
]);

var t = stage.root.tag('bunnies').transition('rotation', {delay: 2, duration: 8, timingFunction: 'ease'});
t.on('finish', function() {
    stage.root.tag('bunnies').x = 400;
});
stage.root.tag('bunnies').transition('x', {delay: 2, duration: 5, timingFunction: 'linear'});
stage.root.tag('bunnies').rotation = 2 * Math.PI * 8;

if (isNode) {
    setTimeout(function() {
        stage.stop();
    }, 20000);
}

