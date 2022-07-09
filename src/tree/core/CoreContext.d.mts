import Stage from "../Stage.mjs";
import Texture from "../Texture.mjs";
import CoreRenderState from "./CoreRenderState.mjs";
import ElementCore from "./ElementCore.mjs";

export default class CoreContext {
  stage: Stage;

  constructor(stage: Stage);

  get renderState(): CoreRenderState;
  get usedMemory(): number;

  destroy(): void;
  hasRenderUpdates(): boolean;
  render(): void;

  /**
   * @see {@link Stage.update()}
   */
  update(): void;

  protected _performForcedZSorts(): void;
  protected _update(): void;
  protected _render(): void;
  protected _fillRenderState(): void;
  protected _performRender(): void;
  protected _addMemoryUsage(delta: number): void;

  allocateRenderTexture(w: number, h: number): Texture;
  releaseRenderTexture(texture: Texture): void;

  freeUnusedRenderTextures(maxAge: number): void;

  protected _createRenderTexture(w: number, h: number, pw: number, ph: number): Texture;
  protected _freeRenderTexture(nativeTexture: unknown): void;

  copyRenderTexture(renderTexture: Texture, nativeTexture: unknown, options: unknown): void;

  forceZSort(elementCore: ElementCore): void;
}
