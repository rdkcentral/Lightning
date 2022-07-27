import Stage from "../tree/Stage.mjs";
import Texture from "../tree/Texture.mjs";

declare namespace ImageTexture {
  export interface Settings extends Texture.Settings {
    type?: typeof ImageTexture;
    src?: string;
    hasAlpha?: boolean;
  }
}

declare class ImageTexture extends Texture {
  constructor(stage: Stage);

  get hasAlpha(): boolean;
  set hasAlpha(hasAlpha: boolean);

  get src(): string | undefined;
  set src(src: string | undefined);
}

export default ImageTexture;
