import lng from "../../src/lightning-node.mjs"
import WaterWaveShader from "./WaterWaveShader"

class AppExample extends lng.Application {
    static _template() {
        return {
//                    Circle: {src: "../grid.png", color: 0xFFFFFFFF, shader: {type: WaterWaveShader}, pivot: 0}
          Circle: {src: "../frog.jpeg", color: 0xFFFFFFFF, shader: {type: WaterWaveShader}, pivot: 0, scale: 0.8}
        }
    }
}

const options = {stage: {w:1600, h: 1080, glClearColor: 0xFFFFFFFF}}
const app = new AppExample(options);

app.tag("Circle").setSmooth("shader.t", 10000, {duration: 100, timingFunction: 'linear'});
