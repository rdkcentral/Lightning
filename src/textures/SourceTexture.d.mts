import Stage from "../tree/Stage.mjs";
import Texture from "../tree/Texture.mjs";
import TextureSource from "../tree/TextureSource.mjs";

export default class SourceTexture extends Texture {
  constructor(stage: Stage);

  get textureSource(): TextureSource;
  set textureSource(v: TextureSource);

  // Same as the getter above
  _getTextureSource(): TextureSource;
}
