import TextureSource from "../TextureSource.mjs";
import ElementCore from "./ElementCore.mjs";

export default class ElementTexturizer {
  constructor(elementCore: ElementCore);
  get enabled(): boolean;
  set enabled(v: boolean);

  get colorize(): boolean;
  set colorize(v: boolean);
  get lazy(): boolean;
  set lazy(v: boolean);
  get renderOffscreen(): boolean;
  set renderOffscreen(v: boolean);
  get renderTextureReused(): boolean;

  _getTextureSource(): TextureSource;

  hasResultTexture(): boolean;
  resultTextureInUse(): boolean;
  updateResultTexture(): void;
  mustRenderToTexture(): boolean;
  deactivate(): void;
  release(): void;
  releaseRenderTexture(): void;

  reuseTextureAsRenderTexture(nativeTexture: TextureSource.NativeTexture): void;
  hasRenderTexture(): boolean;
  getRenderTexture(): TextureSource.NativeTexture | null;
  getResultTexture(): TextureSource.NativeTexture | null;
}
