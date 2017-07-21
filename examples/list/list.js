let wpe = require('../../wpe');
let stage = new wpe.Stage({w: 1000, h: 800, glClearColor: 0xFF000000, useTextureAtlas: true, debugTextureAtlas: false})

let view = stage.view({x: 200, w: 600, h: 400, color: 0xFF777777, rect: true});
let list = new wpe.List(view);
list.setSettings({itemSize: 100, scrollTransition: {duration: 0.3}, invertDirection: false, roll: true, viewportScrollOffset: 0.5, itemScrollOffset: 0.5});
list.progressAnimation = {duration: 0.3, actions: [
    {t: '', p: 'scale', v: {0: 0.2, 1: 1}},
    {t: '', p: 'alpha', v: {0: 0.5, 1: 1.2}}
]};
list.start();

for (let i = 0, n = 10; i < n; i++) {
    list.addElement(stage.view({x: 5, w: 90, y: i * 10, h: 400 - i * 20, rect: true, colorUl: 0xFFFF0000, colorUr: 0xFFFF0000, colorBl: 0xFF00FF00, colorBr: 0xFF00FF00}));
}

list.update();

list.on('focus', function(v) {
    v.rotation = 0.1;
});

list.on('unfocus', function(v) {
    v.rotation = 0;
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

stage.root.add(list.view);