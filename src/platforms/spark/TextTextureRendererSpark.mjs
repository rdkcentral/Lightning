import TextTextureRenderer from "../../textures/TextTextureRenderer.mjs";

export default class TextTextureRendererSpark extends TextTextureRenderer {
    _draw() {
        return this._stage.platform.drawText(this);
    };
}