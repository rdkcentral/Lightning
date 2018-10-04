import lng from "../../src/lightning-node"

const Application = lng.Application
const Utils = lng.Utils

export default class RadialGradientExample extends lng.Application {

    static _template() {
        return {
            Gradient: {alpha: 1, shader: {type: lng.shaders.RadialGradient, color: 0xFFFFFFFF, x: 450, y: 450, radiusX: 500, radiusY: 300}, rect: true, color: 0xFF0000FF, y: 0, w: 900, h: 900}
        }
    }

}

const options = {stage: {w: 900, h: 900, clearColor: 0xFF000000}}
const app = new RadialGradientExample(options);



