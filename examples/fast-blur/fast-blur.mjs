import lng from "../../lightning.mjs"

class AppExample extends lng.Application {
    static _template() {
        return {
            Blur: {type: lng.components.FastBlurComponent, amount: 2, w: 900, h: 900, content: {
                Texture: {
                    src: "../rockies.jpeg"
                },
                Hello: {
                    text: {text: "Hello world", fontSize: 100}
                }
            }}
        }
    }
}
import NodePlatform from "../../src/platforms/node/NodePlatform.mjs";
const options = {stage: {clearColor: 0xFF000000, platform: NodePlatform}};
const app = new AppExample(options);
