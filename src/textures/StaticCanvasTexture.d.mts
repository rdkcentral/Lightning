import Tools from "../tools/Tools.mjs";
import Stage from "../tree/Stage.mjs";
import Texture from "../tree/Texture.mjs";

declare namespace StaticCanvasTexture {
  export interface Content {
    factory: Tools.CanvasTextureFactory;
    lookupId?: string;
  }
}

declare class StaticCanvasTexture extends Texture {
  constructor(stage: Stage);

  set content(content: StaticCanvasTexture.Content);
}

export default StaticCanvasTexture;
