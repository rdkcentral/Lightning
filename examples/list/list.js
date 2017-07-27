let wpe = require('../../wpe');
let stage = new wpe.Stage({w: 1000, h: 800, glClearColor: 0xFF000000, useTextureAtlas: true, debugTextureAtlas: false})

let s = stage.transitions.createSettings({duration: 0.2});
stage.root.add({type: wpe.List, tag: 'list', x: 200, w: 600, h: 400, clipping: false, itemSize: 100, scrollTransition: {duration: 0.3}, invertDirection: false, roll: true, viewportScrollOffset: 0.5, itemScrollOffset: 0.5, children: [
    {tag: 'item', x: 5, w: 90, y: 0, h: 400},
    {tag: 'item', x: 5, w: 90, y: 10, h: 380},
    {tag: 'item', x: 5, w: 90, y: 20, h: 360},
    {tag: 'item', x: 5, w: 90, y: 30, h: 340},
    {tag: 'item', x: 5, w: 90, y: 40, h: 320},
    {tag: 'item', x: 5, w: 90, y: 50, h: 300},
    {tag: 'item', x: 5, w: 90, y: 60, h: 280},
    {tag: 'item', x: 5, w: 90, y: 70, h: 260},
    {tag: 'item', x: 5, w: 90, y: 80, h: 240},
]});

stage.root.stag('list.item', {rect: true, colorUl: 0xFFFF0000, colorUr: 0xFFFF0000, colorBl: 0xFF00FF00, colorBr: 0xFF00FF00, transitions: {rotation: s}});

let list = stage.root.tag('list');

list.add({tag: 'item', x: 5, w: 90, y: 80, h: 240, rect: true, color: 0xFFFF0000});
list.progressAnimation = {duration: 0.3, actions: [
    {t: '', p: 'scale', v: {0: 0.2, 1: 1}},
    {t: '', p: 'alpha', v: {0: 0.5, 1: 1.2}}
]};

list.on('focus', function(v) {
    v.ROTATION = 0.1;
});

list.on('unfocus', function(v) {
    v.ROTATION = 0;
});

var c = 40;
setInterval(function() {
    c--;
    if (c >0) {
        list.setNext();
        list.update();
    } else if (c == 0) {
        list.setNext();
    }
}, 150);
