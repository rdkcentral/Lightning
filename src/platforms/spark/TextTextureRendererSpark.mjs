import TextTextureRenderer from "../../textures/TextTextureRenderer.mjs";

export default class TextTextureRendererSpark extends TextTextureRenderer {
    _draw() {
        let textTextureRender = this;
        let sparkText = sparkscene.create({ t: "text", text:textTextureRender._settings.text, pixelSize:textTextureRender._settings.fontSize*textTextureRender.getPrecision()});

        let drawPromise = new Promise((resolve, reject) => {
            sparkText.ready.then( function(obj) {
                let renderInfo = {};
                renderInfo.w = sparkText.w;
                renderInfo.h = sparkText.h;
                textTextureRender._canvas.width = sparkText.w;
                textTextureRender._canvas.height = sparkText.h;
                textTextureRender._canvas.internal = sparkText;
                textTextureRender.renderInfo = renderInfo;
                resolve();
            });
        });
        return drawPromise;
    };
}