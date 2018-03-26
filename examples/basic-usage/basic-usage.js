const Application = require('../../wpe').Application
const Utils = require('../../wpe').Utils

class BasicUsageExample extends Application {
    static _template() {
        return {
            Primary: {
                Guide: {color: 0xFFFFAAAA, alpha: 1},
                Main: {rect: true, renderToTexture: true, w: 900, h: 900, colorLeft: 0xFF000000, colorRight: 0xFF0000FF
                },
                App: {alpha: 0.5, rect: true, w: 100, h: 100},
            },
            Overlay: {}
        }
    }
}

const options = {stage: {w: 900, h: 900, glClearColor: 0xFF000000}}
if (Utils.isNode) {
    options.stage.window = {title: "Border example", fullscreen: false};
    options.stage.supercharger = {localImagePath: __dirname};
}

const app = new BasicUsageExample(options);
