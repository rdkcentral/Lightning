import Stage from "../tree/Stage.mjs";
import Texture from "../tree/Texture.mjs";

export default class ImageTexture extends Texture {
  constructor(stage: Stage);

  get hasAlpha(): boolean;
  set hasAlpha(hasAlpha: boolean);

  get src(): string | undefined;
  set src(src: string | undefined);
}
