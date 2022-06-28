import Stage from "../tree/Stage.mjs";
import Texture from "../tree/Texture.mjs";
import { UploadTextureSourceOptions } from "../tree/TextureManager.mjs";

export default class StaticTexture extends Texture {
  constructor(stage: Stage, options: UploadTextureSourceOptions);

  public options: UploadTextureSourceOptions;
}
