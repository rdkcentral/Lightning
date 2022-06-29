import Stage from "../../tree/Stage.mjs";
import TextureSource from "../../tree/TextureSource.mjs";

export default class WebPlatform {
  destroy(): void;
  getDrawingCanvas(): HTMLCanvasElement;
  getTextureOptionsForDrawingCanvas(
    canvas: HTMLCanvasElement,
  ): TextureSource.LoadOptions;
  init(stage: Stage): void;
  loadSrcTexture(
    options: { hasAlpha: boolean; src: string },
    cb: TextureSource.LoaderCallback,
  ): TextureSource.LoadCancelCallback;
  loop(): void;
  nextFrame(changes: boolean): void;
  startLoop(): void;
  stopLoop(): void;
  uploadGlTexture(
    gl: WebGLRenderingContext,
    textureSource: TextureSource,
    source: TextureSource.NativeTexture,
    options: unknown,
  ): void;
  getHrTime(): number;
  // TODO the above is not an exhaustive list of this class !!!
}
