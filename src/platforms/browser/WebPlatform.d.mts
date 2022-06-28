import Stage from "../../tree/Stage.mjs";
import TextureSource, { LoadCancelCallback, TextureSourceData, TextureSourceLoadOptions } from "../../tree/TextureSource.mjs";

export default class WebPlatform {
  destroy(): void;
  getDrawingCanvas(): HTMLCanvasElement;
  getTextureOptionsForDrawingCanvas(
    canvas: HTMLCanvasElement,
  ): TextureSourceLoadOptions;
  init(stage: Stage): void;
  loadSrcTexture(
    options: { hasAlpha: boolean; src: string },
    cb: unknown,
  ): LoadCancelCallback;
  loop(): void;
  nextFrame(changes: boolean): void;
  startLoop(): void;
  stopLoop(): void;
  uploadGlTexture(
    gl: WebGLRenderingContext,
    textureSource: TextureSource,
    source: TextureSourceData,
    options: unknown,
  ): void;
  getHrTime(): number;
  // TODO the above is not an exhaustive list of this class !!!
}
