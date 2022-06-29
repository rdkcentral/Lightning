import AnimationManager from "../animation/AnimationManager.mjs";
import TransitionManager from "../animation/TransitionManager.mjs";
import Application from "../application/Application.mjs";
import Component from "../application/Component.mjs";
import EventEmitter from "../EventEmitter.mjs";
import WebPlatform from "../platforms/browser/WebPlatform.mjs";
import C2dRenderer from "../renderer/c2d/C2dRenderer.mjs";
import WebGLRenderer from "../renderer/webgl/WebGLRenderer.mjs";
import RectangleTexture from "../textures/RectangleTexture.mjs";
import TextTextureRenderer from "../textures/TextTextureRenderer.mjs";
import CoreContext from "./core/CoreContext.mjs";
import ElementCore from "./core/ElementCore.mjs";
import TextureManager from "./TextureManager.mjs";



declare namespace Stage {
  /**
   * Normalized components (varying between 0.0 and 1.0)
   */
  export type RGBA = [number, number, number, number];

  export interface StageOptions {
    canvas2d: boolean;
    clearColor: [number, number, number, number];
    defaultFontFace: string;
    fixedDt: number | undefined;
    h: number;
    memoryPressure: number;
    precision: number;
    textRenderIssueMargin: string;
    textRenderSharpFontSize: number;
    textRenderSharpPrecision: number;
    useImageWorker: boolean;
    w: number;
  }
}
declare class Stage extends EventEmitter {
  animations: AnimationManager;
  application: Application;
  c2d?: CanvasRenderingContext2D;
  ctx: CoreContext;
  dt: number;
  /**
   * Bit flags:
   * 0 - device requires flush workaround
   * 1 - frame requires flush workaround
   */
  flushFlags: number;
  frameCounter: number;
  gl?: WebGLRenderingContext;
  platform: WebPlatform;
  rectangleTexture: RectangleTexture;
  renderer: WebGLRenderer | C2dRenderer;
  textureManager: TextureManager;
  transitions: TransitionManager;
  _options: Stage.StageOptions;

  get root(): Element;
  get usedMemory(): number;

  createElement(settings?: Component.Template): Element;
  forceRenderUpdate(): void;
  gc(aggressive?: boolean): void;
  getCanvas(): HTMLCanvasElement;
  getChildrenByPosition(x: number, y: number): ElementCore[];
  getDrawingCanvas(): HTMLCanvasElement;
  getRenderPrecision(): number;

  /**
   * Value can be one of 3 types:
   * - number, an hexadecimal number (so it must begin with 0x)
   * - RGBA, an array of normalized components (varying between 0.0 and 1.0)
   * - null, which causes the stage to not be cleared before each frame
   */
  setClearColor(value: number | Stage.RGBA | null): void;
  getClearColor(): Stage.RGBA | null;
  getOption<
    T extends keyof Stage.StageOptions,
    O extends Stage.StageOptions[T]
  >(optionKey: T): O;

  drawFrame(): void;
  drawText(renderer: TextTextureRenderer): void;
}

export default Stage;
