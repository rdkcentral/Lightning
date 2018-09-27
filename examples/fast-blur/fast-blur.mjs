import lng from "../../src/lightning-node.mjs"

class AppExample extends lng.Application {
    static _template() {
        return {
            Blur: {type: lng.views.FastBlurView, amount: 2, w: 900, h: 900, content: {
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
const options = {stage: {clearColor: 0xFF000000}}
const app = new AppExample(options);
