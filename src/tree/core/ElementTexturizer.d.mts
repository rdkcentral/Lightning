import TextureSource from "../TextureSource.mjs";
import ElementCore from "./ElementCore.mjs";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface NativeTexture {}

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

  reuseTextureAsRenderTexture(nativeTexture: NativeTexture): void;
  hasRenderTexture(): boolean;
  getRenderTexture(): NativeTexture;
  getResultTexture(): NativeTexture;
}
