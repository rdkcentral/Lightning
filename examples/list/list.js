let wpe = require('../../wpe');
let stage = new wpe.Stage({w: 1000, h: 800, glClearColor: 0xFF000000, useTextureAtlas: true, debugTextureAtlas: false})

stage.root.add({type: wpe.BorderView, borderWidth: 1, x: 200, w: 600, h: 400, children: [
    {type: wpe.ListView, tag: 'list', w: 600, h: 400, clipping: true, itemSize: 100, scrollTransition: {duration: 1.3}, invertDirection: false, roll: false, viewportScrollOffset: 0.5, itemScrollOffset: 0.5, children: [
        {tag: 'item', x: 5, w: 90, y: 0, h: 400},
        {tag: 'item', x: 5, w: 90, y: 10, h: 380},
        {tag: 'item', x: 5, w: 90, y: 20, h: 360},
        {tag: 'item', x: 5, w: 90, y: 30, h: 340},
        {tag: 'item', x: 5, w: 90, y: 40, h: 320},
        {tag: 'item', x: 5, w: 90, y: 50, h: 300},
        {tag: 'item', x: 5, w: 90, y: 60, h: 280},
        {tag: 'item', x: 5, w: 90, y: 70, h: 260},
        {tag: 'item', x: 5, w: 90, y: 80, h: 240}
    ]}
]});

let s = stage.transitions.createSettings({duration: 0.5});
stage.root.stag('list.item', {rect: true, color: 0xFFFF0000, transitions: {scale: s, color: s}});

let list = stage.root.tag('list');

list.add({tag: 'item', x: 5, w: 90, y: 80, h: 240, rect: true, color: 0xFFFF0000});
list.progressAnimation = {duration: 0.3, actions: [
    {t: '', p: 'alpha', v: {0: 0.5, 1: 1.2}}
]};

list.on('focus', function(v) {
    v.SCALE = 1.2;
    v.COLOR = 0xFF00FF00;
});

list.on('unfocus', function(v) {
    v.SCALE = 1;
    v.COLOR = 0xFFFF0000;
});

var c = 10;
setInterval(function() {
    c--;
    if (c >0) {
        list.setNext();
        list.update();
    } else if (c == 0) {
        list.setNext();
    }
}, 1500);
