import lng from "../../../lightning.mjs"

class BasicUsageExample extends lng.Application {
    static _template() {
        return {
            Bg: {
                src: "../../rockies.jpeg", scale: 1,
            },
            Primary: {
                Main: {rect: true, renderToTexture: true, w: 900, h: 900, colorLeft: 0x000000FF, colorRight: 0xFF0000FF
                },
                App: {alpha: 0.5, rect: true, w: 100, h: 100, scale: 1, texture: {type: lng.textures.NoiseTexture, x: 0, y: 0, w: 1000, h: 1000}}
            },
            Overlay: {}
        }
    }
}

import NodePlatform from "../../../src/platforms/node/NodePlatform.mjs";

const options = {stage: {w: 900, h: 900, clearColor: 0xFF000000, platform: NodePlatform}};

options.stage.window = {title: "Border example", fullscreen: false};

const app = new BasicUsageExample(options);
