import EventEmitter from "../EventEmitter.mjs";
import Element from "../tree/Element.mjs";
import Texture from "../tree/Texture.mjs";
import Component from "./Component.mjs";

declare namespace Application {
  interface Options {
    // !!!
  }

  export interface TemplateSpecStrong extends Component.TemplateSpecStrong {
    // No additional template spec on an Application
  }

  /**
   * Loose form of lng.Application.TemplateSpecStrong that allows any additional 'any' properties
   */
  export interface TemplateSpecLoose extends Application.TemplateSpecStrong {
    [s: string]: any
  }

  interface TemplateSpec extends Component.TemplateSpecStrong {
    // Provided empty for consistent convention and to to allow augmentation
  }

  interface EventMap extends Element.EventMap {
    // Provided empty for consistent convention and to to allow augmentation
  }

  interface SignalMap extends Component.SignalMap {
    // Provided empty for consistent convention and to to allow augmentation
  }

  export interface TypeConfig extends Component.TypeConfig {
    EventMapType?: EventMap,
    SignalMapType?: SignalMap
  }
}

declare class Application<
  // Components use loose typing TemplateSpecs by default
  TemplateSpecType extends Application.TemplateSpecLoose = Application.TemplateSpecLoose,
  TypeConfig extends Application.TypeConfig = Application.TypeConfig
> extends Component<
  TemplateSpecType,
  TypeConfig
> implements EventEmitter<Application.EventMap> {

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
   * Gets an option value from the active set of {@link Application.ApplicationOptions}
   *
   * @remarks
   * ???
   * - 'keys'
   * - 'enablePointer'
   * - 'debug'
   */
  getOption<
    T extends keyof Application.Options,
    O extends Application.Options[T]
  >(optionKey: T): O;

  // _setOptions(o: any): void;
  // __construct(): void;
  // __init(): void;
  // - Internal use only

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
  // - Internal use only

  // _handleFocusSettings(settings: any, prevSettings: any, focused: any, prevFocused: any): void;
  // - Already defined on Component

  // __getFocusPath(): any;
  // - Internal use only

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
  // - Internal use only

  /**
   * Shuts down the Application and the Lightning Stage its rendered on.
   *
   * @remarks
   * This operation is not reversible. A new Application will need to be created.
   */
  destroy(): void;

  // _destroy(): void;
  // - Internal use only

  /**
   * Gets the active Canvas HTML Element used for rendering
   */
  getCanvas(): HTMLCanvasElement;
}

export default Application;
