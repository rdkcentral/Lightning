import Element, { InlineElement, ValidRef } from "../tree/Element.mjs";
import Stage from "../tree/Stage.mjs";
import Texture from "../tree/Texture.mjs";
import Application from "./Application.mjs";

declare namespace Component {
  export type Constructor<C extends Component = Component> = new (...a: any[]) => C;

  /**
   * Base strongly-typed TemplateSpec for a Component
   *
   * @example
   * If you inherit from this, follow this example closely:
   * ```
   * export interface MyComponentTemplateSpec extends lng.Component.TemplateSpecStrong {
   *   myProperty1: number;
   *   myProperty2: string;
   *   // ^----- Your properties should not be optional (so TS can enforce that they are implemented in your Component)
   *   MyChildComponent: typeof MyChildComponent
   *   // ^----- Child components should be typed by their `typeof` types
   *   MyChildElement: {}
   *   // ^----- Child elements should inserted with `{}`
   *   MyChildInlineElementType: {
   *     ElementChild1: {};
   *     ElementChild2: typeof MyCoolComponent;
   *   };
   *   // ^----- Example of nested Elements/Components
   *   content: Element.PatchTemplate<Element.TemplateSpecLoose>;
   *   // ^----- If your Component has a property that when set, patches
   *   //        the value into itself, use `PatchTemplate<ComponentTemplateSpecType>`
   * }
   * ```
   */
  export interface TemplateSpecStrong extends Element.TemplateSpecStrong {
    // !!! Insert component specific things
  }

  /**
   * Loose form of lng.Component.TemplateSpecStrong that allows any additional 'any' properties
   */
  export interface TemplateSpecLoose extends Component.TemplateSpecStrong {
    [s: string]: any
  }

  /**
   * Patch object for new Components (requires 'type' key because object hasn't been created yet)
   */
  export type NewPatchTemplate<T extends Component.Constructor> = { type: T } & Element.PatchTemplate<InstanceType<T>['__$type_TemplateSpec']>;

  /**
   * Forces nested TemplateSpecTypes in a _template() Template to define their 'type'
   */
  type TemplateRequireType<T extends Component.Constructor> = {
    type: T
  } & {
    [P in keyof InstanceType<T>['__$type_TemplateSpec']]?:
      InstanceType<T>['__$type_TemplateSpec'][P] extends Component.Constructor
        ?
          TemplateRequireType<InstanceType<T>['__$type_TemplateSpec'][P]>
        :
          InstanceType<T>['__$type_TemplateSpec'][P] extends Element.Constructor
            ?
              Template<InstanceType<InstanceType<T>['__$type_TemplateSpec'][P]>['__$type_TemplateSpec']>
            :
              InstanceType<T>['__$type_TemplateSpec'][P]
  };

  /**
   * Type used for the return result of _template().
   *
   * All TemplateSpec properties are made optional. Nested TemplateSpec properties are also made
   * optional, except for the `type` propety which is made required.
   */
   export type Template<TemplateSpecType extends Element.TemplateSpecStrong = Component.TemplateSpecLoose> = {
    [P in keyof TemplateSpecType]?:
      P extends ValidRef
        ?
          TemplateSpecType[P] extends Component.Constructor
            ?
              TemplateRequireType<TemplateSpecType[P]>
            :
              TemplateSpecType[P] extends Element.Constructor
                ?
                  Template<InstanceType<TemplateSpecType[P]>['__$type_TemplateSpec']>
                :
                  Template<Element<InlineElement<TemplateSpecType[P]>>['__$type_TemplateSpec']>
        :
          P extends keyof Element.TemplateSpecStrong
            ?
              TemplateSpecType[P] // P is a Element property key
            :
              string extends P
                ?
                  any // Support Loose Elements: keyof loose Elements `P` will always be a `string`, so let anything go
                :
                  undefined // Otherwise allow the property to only be undefined
  };

  /**
   * Converts a TemplateSpec into an interface that is implemented by a Component class
   *
   * @remarks
   * This transforms the TemplateSpec type in the following ways:
   * - Any `Element` / `Component` constructor type values are replaced with the corresponding instance type.
   *
   * @example
   * ```ts
   * namespace Container {
   *   export interface TemplateSpec extends lng.Component.TemplateSpecStrong {
   *     BloomComponent: typeof lng.components.BloomComponent;
   *   }
   * }
   *
   * class Container
   *   extends lng.Component<Container.TemplateSpec>
   *   implements lng.Component.ImplementTemplateSpec<Container.TemplateSpec> {
   *   // Component Implementation
   * }
   * ```
   */
  export type ImplementTemplateSpec<TemplateSpecType extends Component.TemplateSpecStrong> = {
    [P in keyof TemplateSpecType as P extends keyof Component.TemplateSpecStrong ? never : P]:
      Element.TransformPossibleElement<P, TemplateSpecType[P]>
  };
  /**
   * Extracts the input Component's TemplateSpec value
   */
  export type ExtractTemplateSpec<T extends Component> = T['__$type_TemplateSpec'];

  export interface ParsedTemplate {
    a: any;
    f: (...args: any) => any;
  }

  export interface Font {
    descriptors?: {
      [prop: string]: any;
    };
    family: string;
    url: string;
  }

  export interface StateMachineEvent {
    newState: string;
    prevState: string;
    sharedState: string;
  }

  export type Signals = Record<string, boolean | string | ((...args: unknown[]) => unknown)>;
  export type PassSignals = Record<string, string | true | undefined>;
  // eslint-disable-next-line prettier/prettier
  export type FireAncestorsEvent = `$${string}`;
}

declare class Component<
  // Components use loose typing TemplateSpecs by default
  TemplateSpecType extends Component.TemplateSpecLoose = Component.TemplateSpecLoose,
  EventMap extends Element.EventMap = Element.EventMap
> extends Element<
  TemplateSpecType,
  Texture,
  EventMap
> {
  // SDK ??? !!!
  static getFonts(): Component.Font[]; // Should be app only?
  _onDataProvided(): void;
  _onMounted(): void;
  _onChanged(): void;

  // !!! Do these handlers more universally if possible
  _captureKey?(e: KeyboardEvent): boolean | void;
  _captureBack?(e: KeyboardEvent): boolean | void;
  _handleKey?(e: KeyboardEvent): boolean | void;
  _handleLeft?(e: KeyboardEvent): boolean | void;
  _handleRight?(e: KeyboardEvent): boolean | void;
  _handleUp?(e: KeyboardEvent): boolean | void;
  _handleDown?(e: KeyboardEvent): boolean | void;
  /**
   * Handle Enter
   * @param e
   */
  _handleEnter?(e: KeyboardEvent): boolean | void;
  _handleBack?(e: KeyboardEvent): boolean | void;

  // Added by the StateMachine !!! Can we pull from statemachine?
  static _states(): typeof Component[];
  _setState(state: string, args?: unknown[]): void;
  _getState(): string;
  $enter(event: Component.StateMachineEvent, ...extraArgs: unknown[]): void;
  $exit(event: Component.StateMachineEvent, ...extraArgs: unknown[]): void;
  get _routedType(): Component<Component.TemplateSpecStrong> | undefined;

  /**
   * Internal property that is set to `true` after {@link _init} is called.
   *
   * @remarks
   * See [Lifecycle Events](https://lightningjs.io/docs/#/lightning-core-reference/Components/LifecycleEvents) for
   * more information.
   *
   * This is exposed to prevent accidental overrides. See {@link _init} for the override.
   */
  readonly __initialized: boolean;

  /**
   * Internal property that is set to `true` after {@link _firstActive} is called.
   *
   * @remarks
   * See [Lifecycle Events](https://lightningjs.io/docs/#/lightning-core-reference/Components/LifecycleEvents) for
   * more information.
   *
   * This is exposed to prevent accidental overrides. See {@link _firstActive} for the override.
   */
  readonly __firstActive: boolean;

  /**
   * Internal property that is set to `true` after {@link _firstEnable} is called.
   *
   * @remarks
   * See [Lifecycle Events](https://lightningjs.io/docs/#/lightning-core-reference/Components/LifecycleEvents) for
   * more information.
   *
   * This is exposed to prevent accidental overrides. See {@link _firstEnable} for the override.
   */
  readonly __firstEnable: boolean;

  // __signals: any;
  // - Internal propery holding signals

  // __passSignals: any;
  // - Internal property holding pass signals

  // _onStateChange: any;
  // - Is set in __start(), but should not be modified/called

  /**
   * Construct a Component
   *
   * @remarks
   * You should use {@link Stage.element this.stage.element} to create Component instances if
   * you need to.
   *
   * @param stage
   * @param properties
   */
  constructor(stage: Stage, properties?: Element.PatchTemplate<TemplateSpecType>);

  // __start(): void;
  // - Internal. Sets up state machine

  /**
   * Current state
   *
   * @remarks
   * See [Component States](https://lightningjs.io/docs/#/lightning-core-reference/Components/CompStates/index) for
   * more information.
   */
  get state(): string;

  // __onStateChange(): void;
  // - Internal state machine usage

  /**
   * Force a focus recalculation
   *
   * @remarks
   * See [Focus](https://lightningjs.io/docs/#/lightning-core-reference/HandlingInput/RemoteControl/Focus?id=focus) for
   * more information.
   *
   * This is NOT an overridable method. See {@link _focus} and {@link _unfocus} for related overridable event methods.
   */
  _refocus(): void;

  /**
   * bindProp
   *
   * @remarks
   * ???
   *
   * @param name
   * @param func
   */
  static bindProp(name: any, func?: any): any;

  // __bindProperty(propObj: any, targetObj: any, targetProp: any): void;
  // - Internal

  // static getTemplateFunc(ctx: any): any;
  // - Internal template parsing stuff

  // static parseTemplate(template: Component.Template): Component.ParsedTemplate;
  // - Internal template parsing stuff

  // static parseTemplateRec(obj: any, context: any, cursor: any): void;
  // - Internal template parsing stuff

  // static parseTemplatePropRec(obj: any, context: any, cursor: any): void;
  // - Internal template parsing stuff


  // static parsePropertyBindings(obj: any, context: any, cursor: any): void;
  // - Internal template parsing stuff

  // _onSetup(): void;
  // - Internal

  /**
   * Overridable method called during the `setup` lifecycle event:
   * - Component Attached to the Render Tree, for the first time (called top-down)
   *
   * @remarks
   * See [Lifecycle Events](https://lightningjs.io/docs/#/lightning-core-reference/Components/LifecycleEvents) for
   * more information.
   *
   * - Called after: {@link _build}
   * - Called before: {@link _init}
   *
   * @see {@link _init} for first time attach (called bottom-up)
   * @see {@link _attach} for anytime attach (called bottom-up)
   */
  _setup(): void;

  // _onAttach(): void;
  // - Internal

  /**
   * Overridable method called during the `attach` lifecycle event:
   * - Component Attached (called bottom-up)
   *
   * @remarks
   * See [Lifecycle Events](https://lightningjs.io/docs/#/lightning-core-reference/Components/LifecycleEvents) for
   * more information.
   *
   * When attached:
   * - Called after: {@link _init} (first time), none (after first time)
   * - Called before: {@link _firstEnable} (first time), {@link _enable} (after first time)
   *
   * @see {@link _setup} for first time attach (called top-down)
   * @see {@link _init} for first time attach (called bottom-up)
   * @see {@link _detach} for the opposite lifecycle event
   */
  _attach(): void;

  // _onDetach(): void;
  // - Internal

  /**
   * Overridable method called during the `detach` lifecycle event:
   * - Component Detached (called bottom-up)
   *
   * @remarks
   * See [Lifecycle Events](https://lightningjs.io/docs/#/lightning-core-reference/Components/LifecycleEvents) for
   * more information.
   *
   * When detached:
   * - Called before: {@link _disable}
   *
   * @see {@link _attach}
   */
  _detach(): void;

  // _onEnabled(): void;
  // - Internal

  /**
   * Overridable method called during the `firstEnable` lifecycle event:
   * - Component Enabled, for the first time
   *
   * @remarks
   * See [Lifecycle Events](https://lightningjs.io/docs/#/lightning-core-reference/Components/LifecycleEvents) for
   * more information.
   *
   * When enabled (first time):
   * - Called after: {@link _attach}
   * - Called before: {@link _enable}
   *
   * @see {@link _enable}
   */
  _firstEnable(): void;

  /**
   * Overridable method called during the `enable` lifecycle event:
   * - Component Enabled (both attached and visible: true and alpha > 0)
   *
   * @remarks
   * See [Lifecycle Events](https://lightningjs.io/docs/#/lightning-core-reference/Components/LifecycleEvents) for
   * more information.
   *
   * When enabled:
   * - Called after: {@link _firstEnable} (first time), {@link _attach} (when also attached after first time)
   * - Called before: {@link _firstActive} (first time), {@link _active} (after first time)
   *
   * @see {@link _firstEnable}
   * @see {@link _disable}
   */
  _enable(): void;


  // _onDisabled(): void;
  // - Internal

  /**
   * Overridable method called during the `disable` lifecycle event:
   * - Component Disabled (either detached or invisible or both)
   *
   * @remarks
   * See [Lifecycle Events](https://lightningjs.io/docs/#/lightning-core-reference/Components/LifecycleEvents) for
   * more information.
   *
   * When disabled:
   * - Called after: {@link _detach} (if also detached)
   * - Called before: {@link _inactive}
   *
   * @see {@link _enable}
   */
  _disable(): void;

  // _onActive(): void;
  // - Internal

  /**
   * Overridable method called during the `firstActive` lifecycle event:
   * - Component Activated, for the first time
   *
   * @remarks
   * See [Lifecycle Events](https://lightningjs.io/docs/#/lightning-core-reference/Components/LifecycleEvents) for
   * more information.
   *
   * When activated (first time):
   * - Called after: {@link _enable}
   * - Called before: {@link _active}
   *
   * @see {@link _active}
   */
  _firstActive(): void;

  /**
   * Overridable method called during the `active` lifecycle event:
   * - Component Activated (both enabled and on-screen)
   *
   * @remarks
   * See [Lifecycle Events](https://lightningjs.io/docs/#/lightning-core-reference/Components/LifecycleEvents) for
   * more information.
   *
   * When activated:
   * - Called after: {@link _firstActive} (first time), {@link _enable} (when also enabled after first time)
   * - Called before: None
   *
   * @see {@link _firstActive}
   * @see {@link _inactive}
   */
  _active(): void;

  // _onInactive(): void;
  // - Internal

  /**
   * Overridable method called during the `inactive` lifecycle event:
   * - Component inactive (either detached, invisible or off-screen)
   *
   * @remarks
   * See [Lifecycle Events](https://lightningjs.io/docs/#/lightning-core-reference/Components/LifecycleEvents) for
   * more information.
   *
   * When inactivated:
   * - Called after: {@link _disable} (if also disabled)
   * - Called before: None
   *
   * @see {@link _active}
   */
  _inactive(): void;

  /**
   * Gets the root {@link Application} Component
   */
  get application(): Application;

  // __construct(): void;
  // - Internal

  /**
   * Overridable method called during the `construct` lifecycle event:
   * - Component instance created, before spawning the template
   *
   * @remarks
   * See [Lifecycle Events](https://lightningjs.io/docs/#/lightning-core-reference/Components/LifecycleEvents) for
   * more information.
   *
   * - Called after: n/a (first lifecycle method)
   * - Called before: {@link _build}
   */
  _construct(): void;

  /**
   * Overridable method called during the `build` lifecycle event:
   * - Component instance created, and after template is spawned
   *
   * @remarks
   * See [Lifecycle Events](https://lightningjs.io/docs/#/lightning-core-reference/Components/LifecycleEvents) for
   * more information.
   *
   * - Called after: {@link _construct}
   * - Called before: {@link _setup}
   */
  _build(): void;

  // __init(): void;
  // - Internal

  /**
   * Overridable method called during the `init` lifecycle event:
   * - Component Attached to the Render Tree, for the first time (called bottom-up)
   *
   * @remarks
   * See [Lifecycle Events](https://lightningjs.io/docs/#/lightning-core-reference/Components/LifecycleEvents) for
   * more information.
   *
   * - Called after: {@link _setup}
   * - Called before: {@link _attach}
   *
   * @see {@link _setup} for first time attach (called top-down)
   * @see {@link _attach} for anytime attach (called bottom-up)
   */
  _init(): void;

  /**
   * Override to react to when this Component is brought into focus
   *
   * @remarks
   * This is called on every Component that is being *added* to the focus path whenever focus changes.
   *
   * See [Focus](https://lightningjs.io/docs/#/lightning-core-reference/HandlingInput/RemoteControl/Focus?id=focus) for
   * more information.
   *
   * @param newFocusedComponent Component that now has final focus
   * @param prevFocusedComponent Component that previously had final focus
   */
  _focus(newFocusedComponent: Component | undefined, prevFocusedComponent: Component | undefined): void;

  /**
   * Override to react to when this Component is brought out of focus
   *
   * @remarks
   * This is called on every Component that is being *removed* from the focus path whenever focus changes.
   *
   * See [Focus](https://lightningjs.io/docs/#/lightning-core-reference/HandlingInput/RemoteControl/Focus?id=focus) for
   * more information.
   *
   * @param newFocusedComponent Component that now has final focus
   * @param prevFocusedComponent Component that previously had final focus
   */
  _unfocus(newFocusedComponent: Component | undefined, prevFocusedComponent: Component | undefined): void;

  /**
   * Override to react to focus changes
   *
   * @remarks
   * This is called on every Component in the focus path whenever focus changes but it is NOT called on the Components that
   * were just brought out of focus.
   *
   * See [Focus](https://lightningjs.io/docs/#/lightning-core-reference/HandlingInput/RemoteControl/Focus?id=focus) for
   * more information.
   *
   * @param newFocusedComponent Component that now has final focus
   * @param prevFocusedComponent Component that previously had final focus
   */
  _focusChange(newFocusedComponent: Component | undefined, prevFocusedComponent: Component | undefined): void;

  /**
   * Override to delegate focus to child components.
   *
   * @remarks
   * Return the child Component that this Component wishes to receive focus. Returning `null` or `undefined` tells the
   * focus engine to not set focus on this Component at all.
   *
   * By default, this Component's own instance is returned.
   *
   * See [Focus](https://lightningjs.io/docs/#/lightning-core-reference/HandlingInput/RemoteControl/Focus?id=focus) for
   * more information.
   *
   */
  _getFocused(): Component | null | undefined;

  /**
   * Override to add custom settings. See Application._handleFocusSettings().
   *
   * @remarks
   * This is called whenever a change to the focus path occurs for each Component in the focus path. The `settings`
   * object may be modified at will by the Component.
   *
   * @param settings
   */
  _setFocusSettings(settings: Record<string | number | symbol, unknown>): void;

  /**
   * Override to react on custom settings. See Application._handleFocusSettings().
   *
   * @remarks
   * This is called whenever a change to the focus path occurs for each Component in the focus path. This is called
   * after all of the Components have had a chance to set settings in the {@link _setFocusSettings} override.
   *
   * @param settings
   */
  _handleFocusSettings(settings: Record<string | number | symbol, unknown>, prevSettings: Record<string | number | symbol, unknown>, focusedComponent: Component): void;

  /**
   * Override to provide your own Component's template
   *
   * @example
   * ```ts
   * export class App
   *   extends Lightning.Component<App.TemplateSpec>
   *   implements Lightning.Component.ImplementTemplateSpec<App.TemplateSpec>
   * {
   *   readonly Logo = this.getByRef('Logo')!;
   *
   *   static _template(): Lightning.Component.Template<App.TemplateSpec> {
   *     return {
   *       Logo: {
   *         x: 960,
   *         y: 600,
   *         src: Utils.asset('images/logo.png') as string,
   *       },
   *     }
   *   }
   * }
   * ```
   */
  static _template(): Component.Template;

  /**
   * Returns `true` if this Component is the deepest Component in the Application's active focus *focus path* and
   * will be the *first* Component to receive input events.
   *
   * @remarks
   * See [Focus](https://lightningjs.io/docs/#/lightning-core-reference/HandlingInput/RemoteControl/Focus?id=focus) for
   * more information.
   *
   * @see {@link hasFocus}
   *
   */
  hasFinalFocus(): boolean;

  /**
   * Returns `true` if this Component is anywhere in the Application's active *focus path*.
   *
   * @remarks
   * If this Component has any descendent Component children, even if this method returns `true`, its descendents
   * may receive input events first before any are bubbled up to it.
   *
   * See [Focus](https://lightningjs.io/docs/#/lightning-core-reference/HandlingInput/RemoteControl/Focus?id=focus) for
   * more information.
   *
   * @see {@link hasFinalFocus}
   *
   */
  hasFocus(): boolean;

  /**
   * Gets this Component's Component Parent (cparent)
   *
   * @remarks
   * A Component Parent is the nearest ancestor to a Component that is also a Component.
   *
   * For example if the render tree is like this:
   * ```
   * ComponentA
   *     |
   *  ElementA
   *     |
   *  ElementB
   *     |
   * ComponentB
   * ```
   * The `cparent` of ComponentB is ComponentA, while its {@link Element.parent parent} is ElementB.
   *
   */
  get cparent(): Component | null;

  /**
   * Returns the first ancestor of this Component that is an instance of `type`
   *
   * @param type
   */
  seekAncestorByType<T extends Component.Constructor>(type: T): InstanceType<T> | null;

  /**
   * Gets the first common ancestor Component that this Component and `element` share.
   *
   * @remarks
   * - Returns `null` if there are no common ancestors
   *
   * Related to {@link Element.getSharedAncestor}
   *
   * @param c Element to find common ancestor with
   */
  getSharedAncestorComponent(element: Element): Component | null;

  /**
   * Gets/sets the Signals for this Component.
   *
   * @remarks
   * See (Signals)[https://lightningjs.io/docs/#/lightning-core-reference/Communication/Signal?id=signal] for more
   * information.
   *
   * @param v
   */
  get signals(): Component.Signals;
  set signals(v: Component.Signals);

  // get alterSignals(): undefined;
  // set alterSignals(v: any);
  // - This isn't documented anywhere, it's recommended usage isn't clear, and also seems erroneously implemented
  //   Same with set alterPassSignals

  /**
   * Gets/sets the Pass Signals for this Component.
   *
   * @remarks
   * See [Pass Signals](https://lightningjs.io/docs/#/lightning-core-reference/Communication/Signal?id=pass-signals)
   * for more information.
   *
   * @param v
   */
  get passSignals(): Component.PassSignals;
  set passSignals(v: Component.PassSignals);

  /**
   * Alter the Pass Signals for this Component
   *
   * @remarks
   * **WARNING:** DO NOT read from this property. It is WRITE-ONLY. It will always return `undefined`.
   *
   * @param v
   */
  // get alterPassSignals(): undefined;
  // set alterPassSignals(v: Record<string, unknown>);
  // - This isn't documented anywhere, it's recommended usage isn't clear, and also seems erroneously implemented
  //   Same with set alterSignals

  /**
   * Signals the parent of the specified event.
   *
   * @remarks
   * A parent/ancestor that wishes to handle the signal should set the 'signals' property on this component.
   *
   * See [Signals](https://lightningjs.io/docs/#/lightning-core-reference/Communication/Signal) for more information.
   *
   * @param event
   * @param args
   */
  signal(event: string, ...args: unknown[]): unknown;
  // !!!!!

  // _signal(event: any, args: any): any;
  // _getParentSignalHandler(): any;
  // _getSignalHandler(): any;
  // - Internal

  /**
   * Override this to determine how a Component handles signals passed to it.
   *
   * @remarks
   * - If this returns `false` (default):
   *   - This Component handles signals received from sub-Components.
   * - If this returns `true`:
   *   - This Component forwards signals received from sub-Components to it's {@link cparent}.
   */
  get _signalProxy(): boolean;

  /**
   * Sends a signal to a distant parent component, without propagating it to all the parents.
   *
   * @remarks
   * See [Fire Ancestors](https://lightningjs.io/docs/#/lightning-core-reference/Communication/FireAncestors?id=fire-ancestors)
   * for more information.
   *
   * @param name
   * @param args
   */
  fireAncestors(name: Component.FireAncestorsEvent, ...args: unknown[]): any;

  // _doFireAncestors(name: any, args: any): any;
  // - Internal

  /**
   * Recursively collects all of the child Components of an Element into `subs`.
   *
   * @remarks
   * Child Components of Components added to `subs` are not traversed.
   *
   * @param subs
   * @param element
   */
  static collectSubComponents(subs: Component[], element: Element): void;

  /**
   * Given any `element`, returns the nearest ancestor (including the posibility of itself) that
   * is a {@link Component}. If none is found: returns `null`.
   *
   * @param element
   */
  static getComponent(element: Element): Component | null;

  /**
   * Given any `element`, returns the nearest ancestor (not including itself) that
   * is a {@link Component}. If none is found: returns `null`.
   *
   * @param element
   */
  static getParent(element: Element): Component | null;

}

export default Component;
