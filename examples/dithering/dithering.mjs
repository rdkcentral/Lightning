import lng from '../../lightning.mjs';

class DitheringExample extends lng.Application {

    static _template() {
        return {
            Plain: {rect: true, colorLeft: 0xFF000000, colorRight: 0xFF444444, w: 900, h: 450},
            Dithering: {shader: {type: lng.shaders.Dithering}, rect: true, colorLeft: 0xFF000000, colorRight: 0xFF444444, y: 450, w: 900, h: 450}
        }
    }

}

import NodePlatform from "../../src/platforms/node/NodePlatform.mjs";
const options = {stage: {w: 900, h: 900, clearColor: 0xFF000000, platform: NodePlatform}}
const app = new DitheringExample(options);

