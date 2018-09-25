const lng = require('../../lightning-node')

class RadialGradientExample extends lng.Application {

    static _template() {
        return {
            Gradient: {alpha: 0.5, shader: {type: lng.shaders.RadialGradientShader, color: 0xFFFF00FF, x: 450, y: 450, radiusX: 500, radiusY: 300}, rect: true, color: 0xFF0000FF, y: 0, w: 900, h: 900}
        }
    }

}

const options = {stage: {w: 900, h: 900, glClearColor: 0xFF000000}}
const app = new RadialGradientExample(options);

