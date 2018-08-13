const wuf = require('../../wuf')
const Utils = wuf.Utils

class BasicUsageExample extends wuf.Application {
    static _template() {
        return {
            Primary: {
                Main: {w: 1000, h: 1000, texture: {type: wuf.textures.StaticTexture}, visible: true},
                // Text1: {text: {text: "hello"}},
                // Text2: {y:100,text: {text: "world"}},
                Text3: {y: 200, src: "spritemap.png", texture: {x: 30, y: 0, w: 123}},
                // Text4: {y: 400, src: "spritemap2.png"}
            },
            Overlay: {}
        }
    }
}

const options = {stage: {w: 900, h: 900, glClearColor: 0xFF000000, useSpriteMap: true}}
if (Utils.isNode) {
    options.stage.window = {title: "Border example", fullscreen: false};
    options.stage.supercharger = {localImagePath: __dirname};
}

const app = new BasicUsageExample(options);

setTimeout(() => {
    if (app.stage.spriteMap) {
        // app.tag("Main").texture.options = {source: app.stage.spriteMap.texture}
    }
}, 100)