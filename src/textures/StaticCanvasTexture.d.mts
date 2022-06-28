import { CanvasTextureFactory } from "../tools/Tools.mjs";
import Stage from "../tree/Stage.mjs";
import Texture from "../tree/Texture.mjs";

export interface StaticCanvasTextureContent {
  factory: CanvasTextureFactory;
  lookupId?: string;
}

export default class StaticCanvasTexture extends Texture {
  constructor(stage: Stage);

  set content(content: StaticCanvasTextureContent);
}
