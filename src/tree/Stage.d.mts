import AnimationManager from "../animation/AnimationManager.mjs";
import TransitionManager from "../animation/TransitionManager.mjs";
import Application from "../application/Application.mjs";
import Component from "../application/Component.mjs";
import EventEmitter from "../EventEmitter.mjs";
import WebPlatform from "../platforms/browser/WebPlatform.mjs";
import C2dRenderer from "../renderer/c2d/C2dRenderer.mjs";
import WebGLRenderer from "../renderer/webgl/WebGLRenderer.mjs";
import RectangleTexture from "../textures/RectangleTexture.mjs";
import CoreContext from "./core/CoreContext.mjs";
import ElementCore from "./core/ElementCore.mjs";
import TextureManager from "./TextureManager.mjs";
import Element from "./Element.mjs";
import Shader from "./Shader.mjs";

declare namespace Stage {
  /**
   * RGBA Color Array Tuple
   *
   * @remarks
   * Normalized components (varying between 0.0 and 1.0)
   * ```
   * [Red, Green, Blue, Alpha]
   * ```
   */
  export type RGBA = [number, number, number, number];

  /**
   * Options used to configure the Lightning Stage
   *
   * @remarks
   * See the "Runtime Configuration" page of the Lightning Docs for detailed
   * information.
   */
  export interface StageOptions {
    /**
     * If specified, an existing Canvas to be used for rendering
     * by Lightning
     *
     * @defaultValue `null` (create new canvas)
     */
    canvas: HTMLCanvasElement | null;
    /**
     * If specified, an existing WebGL / Canvas2D context to be used
     *
     * @defaultValue `null` (create a new context)
     */
    context: WebGLRenderingContext | CanvasRenderingContext2D | null;
    /**
     * Width of the rendered Stage
     *
     * @defaultValue `1920`
     */
    w: number;
    /**
     * Height of the rendered Stage
     *
     * @defaultValue `1080`
     */
    h: number;
    /**
     * ???
     *
     * @defaultValue `null`
     */
    srcBasePath: string | null;
    /**
     * Maximum GPU memory usage in pixels
     *
     * @remarks
     * See note on "GPU Memory Tweak" in the Lightning Docs
     *
     * @defaultValue `24e6`
     */
    memoryPressure: number;
    /**
     * ???
     *
     * @defaultValue `2e6`
     */
    bufferMemory: number;
    /**
     * ???
     *
     * @defaultValue `0`
     */
    textRenderIssueMargin: number;
    /**
     * ???
     *
     * @remarks
     * See note on "FontSharp" in the Lightning Docs
     *
     * @defaultValue `{precision:0.6666666667, fontSize: 24}`
     */
    fontSharp: boolean | { precision: number, fontSize: number };
    /**
     * Color to clear the Stage with before each frame
     *
     * @remarks
     * Value can be one of 3 types:
     * - `number` representing an ARGB color (i.e. `0xfffefdfc`)
     * - {@link RGBA} color array tuple
     * - null
     *   - Causes the stage buffer to not be cleared before each frame
     *
     * @defaultValue `[0, 0, 0, 0]` (transparent)
     */
    clearColor: number | RGBA | null;
    /**
     * Default font-face to use for text
     *
     * @defaultValue `'sans-serif'`
     */
    defaultFontFace: string;
    /**
     * Use fixed time step per frame (in ms)
     *
     * @defaultValue `0` (use auto dt)
     */
    fixedDt: number;
    /**
     * Use image web workers, if web works are supported on the platform,
     * for fetching and processing images off-thread (web only)
     *
     * @defaultValue `true`
     */
    useImageWorker: boolean;
    /**
     * If set to `false`, no automatic binding to `requestAnimationFrame`
     *
     * @defaultValue `true`
     */
    autostart: boolean;
    /**
     * Global stage scaling
     *
     * @remarks
     * See note on "Downscaling" in the Lightning docs.
     *
     * @defaultValue `1`
     */
    precision: number;
    /**
     * If set to `true`, the Lightning uses a canvas2d
     * instead of WebGL for rendering.
     *
     * @remarks
     * See note on "Limitations of `Canvas2D`" in the Lightning Docs.
     *
     * @defaultValue `false`
     */
    canvas2d: boolean;
    /**
     * Set an alternative `platform` class type
     *
     * @defaultValue `null` (WebPlatform will be used)
     */
    platform: typeof WebPlatform | null;
    /**
     * ???
     *
     * @defaultValue `false`
     */
    readPixelsBeforeDraw: boolean;
    /**
     * ???
     *
     * @defaultValue `false`
     */
    readPixelsAfterDraw: boolean;
  }

  /**
   * Events produced by Stage along with their handler signatures
   */
  export interface EventMap {
    frameStart: () => void;
    update: () => void;
    frameEnd: () => void;
  }
}

/**
 * Application render tree
 */
declare class Stage extends EventEmitter<Stage.EventMap> {
  animations: AnimationManager;
  /**
   * The root Application Element
   */
  application: Application;
  c2d?: CanvasRenderingContext2D;
  ctx: CoreContext;
  dt: number;
  /**
   * Number of frames rendered since App launch
   */
  frameCounter: number;
  gl?: WebGLRenderingContext;
  platform: WebPlatform;
  rectangleTexture: RectangleTexture;
  textureManager: TextureManager;
  transitions: TransitionManager;

  /**
   * Constructor for Stage
   */
  constructor(options?: Partial<Stage.StageOptions>);

  /**
   * Gets the Renderer that is being utilized
   */
  get renderer(): WebGLRenderer | C2dRenderer;

  /**
   * Returns `true` if WebGL is supported by the platform.
   */
  static isWebglSupported(): boolean;

  /**
   * Returns the rendering mode.
   *
   * @returns
   * - `0` = WebGL
   * - `1` = Canvas2D
   */
  get mode(): 0 | 1;

  /**
   * Returns `true` if the rendering mode is WebGL.
   */
  isWebgl(): boolean;

  /**
   * Returns `true` if the rendering mode is Canvas2d.
   */
  isC2d(): boolean;

  /**
   * Gets an option value from the active set of {@link Stage.StageOptions}
   */
  getOption<
    T extends keyof Stage.StageOptions,
    O extends Stage.StageOptions[T]
  >(optionKey: T): O;

  // _setOptions(o: Partial<Stage.StageOptions>): void;
  // - Internal use only

  /**
   * Sets the active application root for the stage
   */
  // setApplication(app: Application): void;
  // - Internal Use Only

  /**
   * Initializes the Stage
   */
  // init(): void;
  // Internal Use Only

  /**
   * Destroy's the Stage
   */
  // destroy(): void;
  // - Internal Use Only

  /**
   * Stops the rendering loop
   *
   * @remarks
   * This will halt all frame rendering until {@link resume()} is called.
   */
  stop(): void;

  /**
   * Resumes the rendering loop
   *
   * @remarks
   * This must be called after {@link stop()} to resume frame rendering.
   */
  resume(): void;

  /**
   * Gets the root Application Element
   *
   * @remarks
   * Alias for {@link application}
   */
  get root(): Application;

  /**
   * Gets the active Canvas HTML Element used for rendering
   */
  getCanvas(): HTMLCanvasElement;

  /**
   * Gets the {@link Stage.StageOptions.precision} option.
   */
  getRenderPrecision(): number;

  // addUpdateSourceTexture(texture: any): void;
  // - Internal Use Only

  // removeUpdateSourceTexture(texture: any): void;
  // - Internal Use Only

  // hasUpdateSourceTexture(texture: any): any;
  // - Internal Use Only

  /**
   * Draws a new frame
   */
  // drawFrame(): void;
  // - Internal Use Only

  /**
   * Returns `true` if the frame is currently updating
   */
  isUpdatingFrame(): boolean;

  // renderFrame(): void;
  // - Dead code

  /**
   * Force a re-render
   */
  forceRenderUpdate(): void;

  /**
   * Sets the Stage's Clear Color
   *
   * @see {@link Stage.StageOptions.clearColor} for details
   */
  setClearColor(clearColor: number | Stage.RGBA | null): void;

  /**
   * Gets the Stage's Clear Color
   */
  getClearColor(): Stage.RGBA | null;

  /**
   * Creates and returns a new Element from `settings`
   *
   * @remarks
   *
   * - If `settings` are provided:
   *   - Calls/returns {@link element()} with the provided `settings`.
   * - Otherwise:
   *   - Creates/returns a plain {@link Element} instance.
   *
   * Note: This method does NOT construct Components. For that, see
   * {@link element()}
   */
  createElement(settings?: Element.PatchTemplate): Element;

  /**
   * Create a Shader instance from its settings
   */
  createShader(settings: Shader.Literal): Shader;

  /**
   * Creates and returns a new {@link Element} / {@link Component} instance
   * from `settings`
   *
   * @remarks
   * - If `settings` is already an instantiated Element:
   *   - Simply returns back the `settings` value.
   * - If `settings` includes `type` (i.e. type of Component):
   *   - Creates the Component instance, patches `settings` into it and returns it.
   * - Otherwise:
   *   - Creates an Element instance, patches `settings` into it and returns it.
   *
   * @example
   * ```ts
   * // Type-safe Component Creation
   * const myListComponent = stage.element<typeof lng.components.ListComponent>({
   *   type: lng.components.ListComponent,
   *   viewportScrollOffset: 100
   * });
   *
   * // Type-safe Element Creation
   * const myListComponent = stage.element({
   *   x: 100,
   *   y: 200,
   *   text: 'My Text'
   * });
   * ```
   */
  element<T extends Component.Constructor>(settings: Component.NewPatchTemplate<T>): InstanceType<T>;
  element(settings: Element): Element;
  element(settings: Element.PatchTemplate): Element;
  element(settings: Element.PatchTemplate | Element): Element;

  /**
   * Alias for {@link element()}
   *
   * @see {@link element()}
   */
  c<T extends Component.Constructor>(settings: Component.NewPatchTemplate<T>): InstanceType<T>;
  c(settings: Element): Element;
  c(settings: Element.PatchTemplate): Element;
  c(settings: Element.PatchTemplate | Element): Element;

  /**
   * Gets the width of the rendered Stage
   *
   * @remarks
   * This comes directly from the `w` Stage option ({@link Stage.StageOptions.w}).
   */
  get w(): number;

  /**
   * Gets the height of the rendered Stage
   *
   * @remarks
   * This comes directly from the `h` Stage option ({@link Stage.StageOptions.w}).
   */
  get h(): number;

  /**
   * Gets the width of the internal coordinate system of the Stage
   *
   * @remarks
   * Same as this expression:
   * ```
   * this.w / this.getOption('precision')
   * ```
   */
  get coordsWidth(): number;

  /**
   * Gets the height of the internal coordinate system of the Stage
   *
   * @remarks
   * Same as this expression:
   * ```
   * this.h / this.getOption('precision')
   * ```
   */
  get coordsHeight(): number;

  // addMemoryUsage(delta: any): void;
  // - Internal use only.
  /**
   * Amount of texture memory used (in bytes)
   */
  get usedMemory(): number;

  /**
   * Runs the texture memory garbage collector.
   *
   * @remarks
   * By default this will clean up all currently unused textures from the
   * application.
   *
   * If `agressive` is set to `true`, it will clean up ALL textures regardless
   * of if they are in use.
   */
  gc(aggressive?: boolean): void;

  // gcTextureMemory(aggressive?: any): void;
  // gcRenderTextureMemory(aggressive?: any): void;
  // - Internal use only by `gc()`

  /**
   * Creates a new Canvas Element for use for offscreen drawing
   */
  // getDrawingCanvas(): HTMLCanvasElement;
  // - Internal use only

  /**
   * Force update of the render tree layout
   *
   * @remarks
   * Call this to ensure the `finalX`, `finalY`, `finalW`, `finalH` properties
   * of {@link Element}s are updated appropriately without waiting for a frame to render.
   *
   * See the "Flexbox" page in the Lightning docs.
   */
  update(): void;

  // addServiceProvider(serviceprovider: any): void;
  // - Seems to be only related to the obsolete Spark integration

  /**
   * Gets all of the ElementCore instances that interesect the point
   * (`x`, `y`).
   *
   * @remarks
   * Used for touch functionality.
   */
  getChildrenByPosition(x: number, y: number): ElementCore[];
}

export default Stage;
