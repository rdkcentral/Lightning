let wpe = require('../../wpe');
let stage = new wpe.Stage({w: 1000, h: 800, glClearColor: 0xFF000000, useTextureAtlas: true, debugTextureAtlas: false})

stage.root.add({type: wpe.BorderView, tag: 'b', x: 200, w: 600, h: 400, rect: true, color: 0xaaff0000, clipping: true, borderWidth: 5, borderColor: 0xFFFFFFFF, children: [
    {tag: 'item', x: 5, w: 290, y: -50, h: 400, src: 'http://adn.gpupdate.net/news/297192.jpg'}
]});

let border = stage.root.tag('b');
// border.layoutEntry = function(v) {
//     v.y = Math.random() * 100;
// }

border.transition('rotation', {duration: 10})

border.transition('borderWidth', {duration: 10})
border.BORDERWIDTH = 100;

border.ROTATION = 10;
