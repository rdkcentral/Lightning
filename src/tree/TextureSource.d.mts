/* eslint-disable no-use-before-define */
type LoadCancelCallback = (source: TextureSource) => void;

type TextureSourceData =
  | ArrayBuffer
  | WebGLTexture
  | ImageData
  | HTMLImageElement
  | HTMLCanvasElement
  | HTMLVideoElement
  | ImageBitmap;

interface TextureSourceLoadOptions {
  flipBlueRed: boolean;
  h: number;
  hasAlpha: boolean;
  permanent: boolean;
  premultiplyAlpha: boolean;
  renderInfo: RenderInfo;
  source: TextureSourceData;
  w: number;
}

type TextureSourceLoaderCallback = (
  err: Error | null,
  options?: TextureSourceLoadOptions,
) => LoadCancelCallback;

type TextureSourceLoader = (
  callback: TextureSourceLoaderCallback,
  source: TextureSource,
) => void;

interface RenderInfo<T = string[]> {
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

export default class TextureSource {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(manager: any, loader?: TextureSourceLoader);

  _flipTextureY: boolean;
  _loadError: unknown;
  loadingSince: number | null;
  permanent: boolean;
  renderInfo: RenderInfo;

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

  get nativeTexture(): WebGLTexture; // This may not be entirely accurate
}
