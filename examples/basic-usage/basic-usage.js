const lng = require('../../dist/lightning-node')
const Application = lng.Application
const Utils = lng.Utils

class BasicUsageExample extends Application {
    static _template() {
        return {
            Primary: {
                Main: {rect: true, renderToTexture: true, w: 900, h: 900, colorLeft: 0xFF000000, colorRight: 0xFF0000FF
                },
                App: {alpha: 0.5, rect: true, w: 100, h: 100, texture: {type: lng.textures.NoiseTexture, x: 0, y: 0, w: 1000, h: 1000}},
            },
            Overlay: {}
        }
    }
}

const options = {stage: {w: 900, h: 900, clearColor: 0xFF000000}}
if (Utils.isNode) {
    options.stage.window = {title: "Border example", fullscreen: false};
}

const app = new BasicUsageExample(options);
