import lng from "../../lightning.mjs"
import WaterWaveShader from "./WaterWaveShader"

class AppExample extends lng.Application {
    static _template() {
        return {
          Circle: {src: "./pebbles.jpg", color: 0xFFAAAAAA, shader: {type: WaterWaveShader}, pivot: 0, scale: 1, w: 1280, h: 720}
        }
    }
}

import NodePlatform from "../../src/platforms/node/NodePlatform.mjs";
const options = {stage: {w:1280, h: 720, clearColor: 0xFF000000, platform: NodePlatform}}
const app = new AppExample(options);

