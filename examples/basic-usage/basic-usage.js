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
        {tag: 'hello', text: {text: "hello world", fontSize: 100}, x: 280, y: 170, mountX: 0.5, mountY: 0.5, alpha: 0.5},
        {tag: 'bunnies', x: 30, y: 30, w: 500, h: 500, clipping: true, borderWidth: 10, borderColor: 0xFF000000, children: [
            {src: basePath + 'bunny.png', tag: ['bunny', 'bunny-left'], x: 20, y: 400, scale: 8, rotation: 0.3},
            {src: basePath + 'bunny.png', tag: ['bunny', 'bunny-right'], x: 480, y: 400, scale: 8, rotation: -0.3}
        ]}
    ]}
]);

stage.root.add({tag: 'notification-ctr', visible: false, children: [
    {tag: 'notification', x: 600, y: 0, zIndex: 9999, rect: true, color: 0xAA000000, w: 400, h: 50, clipping: true, children: [
        {tag: 'envelope', x: 8, y: 8, src: basePath + 'bunny.png'},
        {tag: 'title', x: 50, y: 10, text: {text: "Notification", fontSize: 30, fontStyle: "italic", fontFace: "Verdana"}},
        {tag: 'text', x: 8, y: 60, text: {text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dui mi, finibus ac arcu a, maximus volutpat elit. Pellentesque commodo velit eget nulla viverra posuere. Vivamus pellentesque suscipit varius.", wordWrapWidth: 380, fontSize: 16, lineHeight: 24, fontFace: "Verdana"}}
    ]},
    {tag: 'bg-overlay', x: 0, y: 0, w: 600, h: 600, color: 0xAA000000, rect: true, alpha: 0}
]});


var a = stage.root.tag('notification-ctr').animation({duration: 1, stopMethod: 'onetotwo', actions: [
    {t: '', p: 'visible', v: true, rv: false},
    {t: 'notification', p: 'x', v: {0: 600, 0.6: {v:200, s: 0}, 1: 200, 1.2: {v: 200, s: 0}, 2: 600}},
    {t: 'notification', p: 'h', v: {0.6: 50, 1: 190, 1.2: 50}},
    {t: 'bg-overlay', p: 'alpha', v: {0: 0, 0.5: 1, 1: 1, 1.2: 0}}
]});

a.start();

setTimeout(function() {
    a.stop();
}, 3000);
