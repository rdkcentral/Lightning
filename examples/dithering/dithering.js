const wuf = require('../../wuf')

class DitheringExample extends wuf.Application {

    static _template() {
        return {
            Plain: {rect: true, colorLeft: 0xFF000000, colorRight: 0xFF444444, w: 900, h: 450},
            Dithering: {shader: {type: wuf.shaders.DitheringShader}, rect: true, colorLeft: 0xFF000000, colorRight: 0xFF444444, y: 450, w: 900, h: 450}
        }
    }

}

const options = {stage: {w: 900, h: 900, glClearColor: 0xFF000000}}
const app = new DitheringExample(options);

