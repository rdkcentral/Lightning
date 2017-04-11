var isNode = !!(((typeof module !== "undefined") && module.exports));
if (isNode) {
    var Stage = require('../../wpe');
}

var options = {w: 1280, h: 720, rw: 1280, rh: 720, precision: 1, measureDetails: false, useTextureAtlas:true, glClearColor: [0, 0, 0, 1], window: {title: "Clipping demo", fullscreen: false}};
var stage = new Stage(options);

if (!isNode) {
    document.body.appendChild(stage.getCanvas());
}

stage.root.x = 100;
stage.root.y = 100;
stage.root.w = 1080;
stage.root.h = 500;
stage.root.clipping = true;
stage.root.borderWidth = 5;
stage.root.rect = true;
stage.root.color = 0xff00ff00;
stage.root.borderColor = 0xff000000;

var bunny = stage.root.add({src: 'https://www.metrological.com/images/logo2x.png', x: 200, y: 200, rotation: 0.2, tag: 'bunny'});
bunny.on('txLoaded', function(textureSource) {
    console.log('loaded');
});

bunny.on('txError', function(err, textureSource) {
    console.log('error');
});

bunny.t('x',{duration: 10, delay: 2});
// bunny.x = 1050;
bunny.rotation = 4;
bunny.scale = 1;
bunny.t('rotation',{duration: 5, delay: 2, timingFunction: 'cubic-bezier(0,1,2.3,1.2)'});
bunny.t('scale',{duration: 5, delay: 2});
// bunny.rotation = 11;
// bunny.scale = 30;

var a = stage.root.tag('bunny').animation({duration: 3, autostop: true, stopMethodOptions: {timingFunction: 'linear', duration: 3}, actions: [
    {property: ['y'], value: {0:0,1:400}},
    {property: ['color'], value: {0:0xFFFFFFFF,1:0xFFFF0000}},

    // {property: ['texture.w'], value: {0.5:26, 1: 0.001}}
]});

a.start();

if (isNode) {
    setTimeout(function() {
        stage.stop();
    }, 6000);
}

