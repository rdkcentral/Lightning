var Stage = require('../wpe');

var options = {w: 1280, h: 720, measureDetails: false, useTextureAtlas:true, glClearColor: [255, 255, 255, 255]};
var stage = new Stage(options);

stage.root.addChild(stage.c({tag: 'r', w:100, h: 100, rect: true, color: 0xffff0000, transitions: {x: {duration: 10}}}));
stage.root.tag('r').x = 1000;