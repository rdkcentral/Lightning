import lng from "../../src/lightning-node.mjs"
import WaterWaveShader from "./WaterWaveShader"

class AppExample extends lng.Application {
    static _template() {
        return {
//                    Circle: {src: "../grid.png", color: 0xFFFFFFFF, shader: {type: WaterWaveShader}, pivot: 0}
          Circle: {src: "./pebbles.jpg", color: 0xFFCCCCCC, shader: {type: WaterWaveShader}, pivot: 0, scale: 1}
        }
    }
}

const options = {stage: {w:1280, h: 960, glClearColor: 0xFF000000}}
const app = new AppExample(options);

