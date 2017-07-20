let wpe = require('../../wpe');
let stage = new wpe.Stage({w: 1280, h: 7200, glClearColor: 0xFF000000, useTextureAtlas: true, debugTextureAtlas: false})

let list = new wpe.List(stage);

stage.root.add(list.view);