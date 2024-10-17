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
import Element from "../tree/Element.mjs";
import Stage from "../tree/Stage.mjs";
import Component from "./Component.mjs";

declare namespace Application {
  /**
   * Constructor type for an Application
   */
  export type Constructor<C extends Application = Application> = new (...a: any[]) => C;

  /**
   * Key Map structure
   */
  export interface KeyMap {
    [s: number]: string | undefined
  }

  /**
   * Application options
   *
   * @remarks
   * See [Runtime Config](https://lightningjs.io/docs/#/lightning-core-reference/RuntimeConfig/index?id=runtime-configuration)
   * for more information.
   */
  export interface Options {
    /**
     * Stage options for the application
     *
     * @see {@link Stage.Options}
     */
    stage: Partial<Stage.Options>

    /**
     * Sets a custom keymap for use by the application
     *
     * @remarks
     * A {@link KeyMap} is just a object keyed by [key codes](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode)
     *
     * See [Key Handling - Key Mapping](https://lightningjs.io/docs/#/lightning-core-reference/HandlingInput/RemoteControl/KeyHandling?id=key-mapping)
     * for more information.
     *
     * @defaultValue
     * ```
     * {
     *      38: "Up",
     *      40: "Down",
     *      37: "Left",
     *      39: "Right",
     *      13: "Enter",
     *      8: "Back",
     *      27: "Exit"
     * }
     * ```
     */
    keys: KeyMap;

    /**
     * Enables mouse input, if set to `true`
     *
     * @remarks
     * See [Mouse Input](https://lightningjs.io/docs/#/lightning-core-reference/HandlingInput/Mouse?id=mouse-input)
     * for more information.
     *
     * @defaultValue `false`
     */
    enablePointer: boolean;

    /**
     * Enables debug mode, if set to `true`
     *
     * @remarks
     * Shows changes to the focus path for debug purposes
     *
     * See [Mouse Input](https://lightningjs.io/docs/#/lightning-core-reference/HandlingInput/Mouse?id=mouse-input)
     * for more information.
     *
     * @defaultValue `false`
     */
    debug: boolean
  }

  export interface TemplateSpec extends Component.TemplateSpec {
    // Provided empty for consistent convention and to to allow augmentation
  }

  /**
   * Loose form of lng.Application.TemplateSpec that allows any additional 'any' properties
   */
  export interface TemplateSpecLoose extends Application.TemplateSpec {
    [s: string]: any
  }

  export interface EventMap extends Element.EventMap {
    // Provided empty for consistent convention and to to allow augmentation
  }

  export interface SignalMap extends Component.SignalMap {
    // Provided empty for consistent convention and to to allow augmentation
  }

  export interface TypeConfig extends Component.TypeConfig {
    EventMapType: EventMap,
    SignalMapType: SignalMap
  }
}

declare class Application<
  // Components use loose typing TemplateSpecs by default
  TemplateSpecType extends Application.TemplateSpecLoose = Application.TemplateSpecLoose,
  TypeConfig extends Application.TypeConfig = Application.TypeConfig
> extends Component<
  TemplateSpecType,
  TypeConfig
> {

  // __updateFocusCounter: any;
  // __keypressTimers: any;
  // __hoveredChild: any;
  // __keymap: any;
  // __options: any;
  // __updateFocusId: any;
  // _focusPath: any;
  // __prevFocusSettings: any;
  // _destroyed: any;
  // - Private properties

  constructor(options?: Partial<Application.Options>, properties?: Element.PatchTemplate<TemplateSpecType>);

  /**
   * Gets an option value from the active set of {@link Application.Options}
   */
  getOption<
    T extends keyof Application.Options,
    O extends Application.Options[T]
  >(optionKey: T): O;

  // _setOptions(o: any): void;
  // __construct(): void;
  // __init(): void;
  // - Only used internally

  /**
   * Update the focus path of the application
   *
   * @remarks
   * This is method is called when calling {@link Component._refocus}
   *
   */
  updateFocusPath(): void;

  // __updateFocus(): void;
  // __updateFocusRec(): any;
  // updateFocusSettings(): void;
  // - Only used internally

  // _handleFocusSettings(settings: any, prevSettings: any, focused: any, prevFocused: any): void;
  // - Already defined on Component

  // __getFocusPath(): any;
  // - Only used internally

  /**
   * Active focus path of the application
   *
   * @remarks
   * If defined, index 0 will always be the root Application component branching hierarchically to the Component
   * with final focus at the end of the array.
   */
  get focusPath(): Component[] | undefined;

  // focusTopDownEvent(events: any, ...args: any[]): any;
  // focusBottomUpEvent(events: any, ...args: any[]): any;
  // _receiveKeydown(e: KeyboardEvent): void;
  // _receiveKeyup(e: KeyboardEvent): void;
  // _startLongpressTimer(key: any, element: any): void;
  // _recieveScrollWheel(e: any): void;
  // fireTopDownScrollWheelHandler(event: any, obj: any): any;
  // fireBottomUpScrollWheelHandler(event: any, obj: any): any;
  // _receiveClick(e: any): void;
  // fireBottomUpClickHandler(obj: any): void;
  // _receiveHover(e: any): void;
  // fireBottomUpHoverHandler(obj: any): void;
  // _getTargetChild(clientX: any, clientY: any): any;
  // _findChildren(bucket: any, children: any): any;
  // _withinClickableRange(affectedChildren: any, cursorX: any, cursorY: any): any;
  // _testCollision(px: any, py: any, cx: any, cy: any, cw: any, ch: any): any;
  // - Only used internally

  /**
   * Shuts down the Application and the Lightning Stage its rendered on.
   *
   * @remarks
   * This operation is not reversible. A new Application will need to be created.
   */
  destroy(): void;

  // _destroy(): void;
  // - Only used internally

  /**
   * Gets the active Canvas HTML Element used for rendering
   */
  getCanvas(): HTMLCanvasElement;
}

export default Application;
