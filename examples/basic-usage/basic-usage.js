var isNode = !!(((typeof module !== "undefined") && module.exports));
if (isNode) {
    var Stage = require('../../wpe');
}

var options = {w: 600, h: 600, glClearColor: 0xFF000000, window: {title: "Usage example", fullscreen: false}};
if (isNode) {
    options.window = {title: "Usage example", fullscreen: false};
}
var stage = new Stage(options);

if (!isNode) {
    document.body.appendChild(stage.getCanvas());
}

var basePath = 'https://cdn.metrological.com/storage/wpe-ui-framework/examples/images/';

stage.root.add([
    {tag: 'bg', rect: true, x: 20, y: 20, w: 560, h: 560, colorTop: 0xFFFF0000, colorBottom: 0xFFFF6666, children: [
        {tag: 'box', rect: true, w: 400, x: 150, y: 50, h: 100, color: 0xAAFF00FF, borderWidth: 1, borderColor: 0xFF000000, children: [
            {tag: 'hello', text: {text: "hello world", fontSize: 50}, x: 10, y: 20},
        ]}
    ]}
]);

var t = stage.root.tag('box').transition('x', {delay: 0.5, duration: 2, timingFunction: 'ease'});
stage.root.tag('box').x = -300;
t.on('progress', function(p) {
    var x = stage.root.tag('box').X;
    if (x < 0) {
        stage.root.tag('hello').x = Math.min(150, 10 - x);
    } else {
        stage.root.tag('hello').x = 10;
    }
});

t.on('finish', function() {
    stage.root.tag('box').x = Math.random() * 1000 - 500;
});