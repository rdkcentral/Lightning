import Stage from "./Stage.mjs";
import TextureSource, { TextureSourceLoader } from "./TextureSource.mjs";

type UploadTextureSourceOptions = unknown;

interface TextureParams {
  [key: number]: GLenum;
}

interface TextureOptions {
  format: GLenum;
  type: GLenum;
}

export default class TextureManager {
  constructor(stage: Stage);

  textureSourceHashmap: Map<string, TextureSource>;

  get usedMemory(): number;

  addToLookupMap(textureSource: TextureSource): void;

  destroy(): void;

  freeTextureSource(textureSource: TextureSource): void;
  freeUnusedTextureSources(): void;

  /**
   * Do not call this method directly! Use `Stage.gc()` instead.
   */
  gc(): void;
  getReusableTextureSource(id: string): TextureSource;
  getTextureSource(func: TextureSourceLoader, id: string): TextureSource;

  uploadTextureSource(
    textureSource: TextureSource,
    options: UploadTextureSourceOptions,
  ): void;
}
