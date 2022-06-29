import TextureManager from "./TextureManager.mjs";

declare namespace TextureSource {
  export type LoadCancelCallback = (source: TextureSource) => void;

  export type NativeTexture =
    | ArrayBuffer
    | WebGLTexture
    | ImageData
    | HTMLImageElement
    | HTMLCanvasElement
    | HTMLVideoElement
    | ImageBitmap;

  export interface LoadOptions {
    flipBlueRed: boolean;
    h: number;
    hasAlpha: boolean;
    permanent: boolean;
    premultiplyAlpha: boolean;
    renderInfo: RenderInfo;
    source: NativeTexture;
    w: number;
  }

  export type LoaderCallback = (
    err: Error | null,
    options?: LoadOptions,
  ) => LoadCancelCallback;

  export type Loader = (
    callback: LoaderCallback,
    source: TextureSource,
  ) => void;

  export interface RenderInfo<T = string[]> {
    bbH?: number; // Custom value added by the Peacock team to improve text layout
    cutEx: number;
    cutEy: number;
    cutSx: number;
    cutSy: number;
    fontSize: number;
    h: number;
    height: number;
    innerWidth: number;
    letterSpacing: number;
    lineHeight: number;
    lines: T;
    lineWidths: number[];
    moreTextLines: boolean;
    offsetY: number;
    paddingLeft: number;
    paddingRight: number;
    precision: number;
    remainingText: string;
    textIndent: number;
    w: number;
    width: number;
  }
}



declare class TextureSource {
  constructor(manager: TextureManager, loader?: TextureSource.Loader);

  _flipTextureY: boolean;
  _loadError: unknown;
  loadingSince: number | null;
  permanent: boolean;
  renderInfo: TextureSource.RenderInfo;

  // TODO fix this when a definite solution is provided by Metrological to access image headers
  get dominantColors(): number[] | undefined;
  get lookupId(): string | undefined;

  cancel(): void;
  forEachActiveElement(callback: (element: Element) => void): void;
  getRenderWidth(): number;
  getRenderHeight(): number;
  isError(): boolean;
  isLoaded(): boolean;
  isLoading(): boolean;
  isUsed(): boolean;

  // Function called when there is an error loading a texture.
  onError(e: unknown): void;

  get nativeTexture(): TextureSource.NativeTexture | null;
}

export default TextureSource;