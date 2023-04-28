/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2022 Metrological
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
import type TextTexture from "../textures/TextTexture.mjs";

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
   * See the [Runtime Configuration](https://lightningjs.io/docs/#/lightning-core-reference/RuntimeConfig/index) for more
   * information.
   *
   * @privateRemarks
   * All options in this interface should be required.
   */
  export interface Options {
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
     * Base path used by the `ImageTexture`
     *
     * @defaultValue `null`
     */
    srcBasePath: string | null;
    /**
     * Maximum GPU memory usage in pixels
     *
     * @remarks
     * See [Runtime Config - GPU Memory Tweak](https://lightningjs.io/docs/#/lightning-core-reference/RuntimeConfig/index?id=gpu-memory-tweak)
     * for more information.
     *
     * @defaultValue `24e6`
     */
    memoryPressure: number;
    /**
     * Memory size of quad buffer (in bytes)
     *
     * @defaultValue `2e6`
     */
    bufferMemory: number;
    /**
     * Number of additional pixels to add to the width of every text texture
     *
     * @remarks
     * WARNING: This can distort text.
     *
     * @defaultValue `0`
     */
    textRenderIssueMargin: number;
    /**
     * FontSharp settings
     *
     * @remarks
     * See [Runtime Config - FontSharp](https://lightningjs.io/docs/#/lightning-core-reference/RuntimeConfig/index?id=fontsharp)
     * for more information.
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
     * Default font family to use for text
     *
     * @remarks
     * See {@link TextTexture.Settings.fontFace} for how this value ends up being used.
     *
     * The special [CSS defined font family values](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family#values)
     * of "serif" and "sans-serif" may be used as well.
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
     * See [Runtime Config - Downscaling](https://lightningjs.io/docs/#/lightning-core-reference/RuntimeConfig/index?id=downscaling) for more
     * information.
     *
     * @defaultValue `1`
     */
    precision: number;
    /**
     * If set to `true`, the Lightning uses a canvas2d
     * instead of WebGL for rendering.
     *
     * @remarks
     * See [Runtime Config - Limitations of Canvas2D](https://lightningjs.io/docs/#/lightning-core-reference/RuntimeConfig/index?id=limitations-of-canvas2d)
     * for information about the limitations of using Canvas2D.
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
     * If set to `true`, forces the Render Engine to readPixels **before** drawing, turning the Render pipeline
     * synchronous.
     *
     * @remarks
     * This option helps with flickering artifacts on certain devices.
     *
     * Note: This will affect performance!
     *
     * @defaultValue `false`
     * @see {@link readPixelsAfterDraw}
     */
    readPixelsBeforeDraw: boolean;

    /**
     * If set to `true`, forces the Render Engine to readPixels **after** drawing, turning the Render pipeline
     * synchronous.
     *
     * @remarks
     * This option helps with flickering artifacts on certain devices.
     *
     * Note: This will affect performance!
     *

     * You may set {@link readPixelsAfterDrawThreshold} to control the number of render-to-texture element re-renders
     * that trigger the syncronous pipeline.
     *
     * See [PR #393](https://github.com/rdkcentral/Lightning/pull/393) for more information about this option.
     *
     * @defaultValue `false`
     * @see {@link readPixelsBeforeDraw}
     */
    readPixelsAfterDraw: boolean;
    /**
     * If {@link readPixelsAfterDraw} is set to `true`, this is the number of render-to-texture element re-renders
     * in a frame that will trigger the synchronous Render pipeline.
     *
     * @remarks
     * This can enable full performance on frames that would not normally suffer from the flickering artifacts
     * exhibited on certain devices.

     * @defaultValue `0`
     */
    readPixelsAfterDrawThreshold: number;

    /**
     * If set to `true`, logs debug information about each frame including
     * how many render-to-texture elements were re-rendered.
     *
     * @remarks
     * This may impact performance and should not be turned on in production.
     *
     * @defaultValue `false`
     */
    debugFrame: boolean;

    /**
     * If set to `true`, forces the Render Engine to use the canvasSource over getImageData for text
     *
     * @remarks
     * This helps with text generation on certain devices.
     *
     * See [PR #393](https://github.com/rdkcentral/Lightning/pull/393) for more information about this option.
     *
     * @defaultValue `false`
     */
    forceTxCanvasSource: boolean;
    /**
     * If set to `true`, will stop the Render Engine from calling `RequestAnimationFrame` when there are no
     * stage updates.
     *
     * @remarks
     * See [Issue #380](https://github.com/rdkcentral/Lightning/issues/380) for more information about this option.
     *
     * @defaultValue `false`
     */
    pauseRafLoopOnIdle: boolean;
    /**
     * The Device Pixel Ratio (DPR) affects how touch events are registered and handled on a device,
     * including the conversion of physical pixel coordinates to logical pixel coordinates and the adjustment
     * of element size and layout based on the device's pixel density.
     *
     * @defaultValue `1`
     */
    devicePixelRatio: number;
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
  constructor(options?: Partial<Stage.Options>);

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
   * Gets an option value from the active set of {@link Stage.Options}
   */
  getOption<
    T extends keyof Stage.Options,
    O extends Stage.Options[T]
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
   * This will halt all frame rendering until {@link resume} is called.
   */
  stop(): void;

  /**
   * Resumes the rendering loop
   *
   * @remarks
   * This must be called after {@link stop} to resume frame rendering.
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
   * Gets the {@link Stage.Options.precision} option.
   */
  getRenderPrecision(): number;

  // addUpdateSourceTexture(texture: any): void;
  // - Internal Use Only

  // removeUpdateSourceTexture(texture: any): void;
  // - Internal Use Only

  // hasUpdateSourceTexture(texture: any): any;
  // - Internal Use Only

  /**
   * Updates and renders a new frame
   */
  drawFrame(): void;

  /**
   * Returns `true` if the frame is currently updating
   */
  isUpdatingFrame(): boolean;

  // renderFrame(): void;
  // - Internal Use Only

  /**
   * Force a re-render
   */
  forceRenderUpdate(): void;

  /**
   * Sets the Stage's Clear Color
   *
   * @see {@link Stage.Options.clearColor} for details
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
   *   - Calls/returns {@link element} with the provided `settings`.
   * - Otherwise:
   *   - Creates/returns a plain {@link Element} instance.
   *
   * Note: This method does NOT construct Components. For that, see
   * {@link element}
   */
  createElement(settings?: Element.PatchTemplate): Element;

  /**
   * Create a Shader instance from its settings
   */
  createShader(settings: Shader.SettingsLoose): Shader;

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
  element<T extends Component.Constructor>(settings: Element.NewPatchTemplate<T>): InstanceType<T>;
  element(settings: Element): Element;
  element(settings: Element.PatchTemplate): Element;
  element(settings: Element.PatchTemplate | Element): Element;

  /**
   * Alias for {@link element}
   *
   * @see {@link element}
   */
  c<T extends Component.Constructor>(settings: Element.NewPatchTemplate<T>): InstanceType<T>;
  c(settings: Element): Element;
  c(settings: Element.PatchTemplate): Element;
  c(settings: Element.PatchTemplate | Element): Element;

  /**
   * Gets the width of the rendered Stage
   *
   * @remarks
   * This comes directly from the `w` Stage option ({@link Stage.Options.w}).
   */
  get w(): number;

  /**
   * Gets the height of the rendered Stage
   *
   * @remarks
   * This comes directly from the `h` Stage option ({@link Stage.Options.w}).
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
   * Amount of memory used (in pixels)
   */
  get usedMemory(): number;

  /**
   * Amount of memory used by textures (in bytes)
   */
  get usedVram(): number;

  /**
   * Amount of memory used by textures with alpha channel (in bytes)
   */
  get usedVramAlpha(): number;

   /**
   * Amount of memory used by textures without alpha channel (in bytes)
   */
  get usedVramNonAlpha(): number;

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
  getDrawingCanvas(): HTMLCanvasElement;

  /**
   * Force update of the render tree layout
   *
   * @remarks
   * Call this to ensure the `finalX`, `finalY`, `finalW`, `finalH` properties
   * of {@link Element}s are updated appropriately without waiting for a frame to render.
   *
   * See [Flexbox](https://lightningjs.io/docs/#/lightning-core-reference/Templates/Flexbox?id=flexbox)
   * for more information.
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
