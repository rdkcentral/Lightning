import Element from "../tree/Element.mjs";
import Texture from "../tree/Texture.mjs";
import Application from "./Application.mjs";

declare namespace Component {
  export type Constructor<C extends Component = Component> = new (...a: any[]) => C;

  /**
   * Base strongly-typed TemplateSpec for a Component
   *
   * If you inherit from this, follow this example closely:
   * ```
   * export interface MyComponentTemplateSpec extends lng.Component.TemplateSpecStrong {
   *   myProperty1: number;
   *   myProperty2: string;
   *   // ^----- Your properties should not be optional (so TS can enforce that they are implemented in your Component)
   *   MyChildComponent: typeof MyChildComponent
   *   // ^----- Child components should be typed by their `typeof` types
   *   MyChildElement: typeof lng.Element
   *   // ^----- Child elements should be typed by `typeof lng.Element`
   *   MyChildInlineElementType: typeof lng.Element<{
   *     ElementChild1: typeof lng.Element;
   *     ElementChild2: typeof MyCoolComponent;
   *   } & lng.Element.TemplateSpec>;
   *   // ^----- Child elements should be typed by `typeof lng.Element`
   *   content: Component.PatchTemplate<Element.TemplateSpecLoose>;
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
   * optional, except for the `type` propety which is made requred.
   */
   export type Template<TemplateSpecType extends Component.TemplateSpecStrong = Component.TemplateSpecLoose> = {
    [P in keyof TemplateSpecType]?:
      TemplateSpecType[P] extends Component.Constructor
        ?
          TemplateRequireType<TemplateSpecType[P]>
        :
          TemplateSpecType[P] extends Element.Constructor
            ?
              Template<InstanceType<TemplateSpecType[P]>['__$type_TemplateSpec']>
            :
              TemplateSpecType[P]
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
        Element.TransformPossibleElement<TemplateSpecType[P]>
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

  // eslint-disable-next-line prettier/prettier
  export type FireAncestorsEvent = `$${string}`;
}


declare class Component<
  // Components use loose typing TemplateSpecs by default
  TemplateSpecType extends Component.TemplateSpecLoose = Component.TemplateSpecLoose
> extends Element<
  TemplateSpecType
> {
  /**
   * Override to provide your own Component's template
   *
   * @example
   * ```ts
   * export class App extends lng.Component<App.TemplateSpec> implements lng.Component.ImplementTemplateSpec<App.TemplateSpec> {
   *   readonly Logo = this.getByRef('Logo')!;
   *
   *   static _template(): lng.Component.Template<App.TemplateSpec> {
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
  static _states(): typeof Component[];
  static _getLookupId(): string;
  static _getSourceLoader(): any;
  static getFonts(): Component.Font[];
  static parseTemplate(template: Component.Template): Component.ParsedTemplate;
  static getParent(element: Element): Component<Component.TemplateSpecStrong>;
  /**
   * Overridable method called during the `construct` lifecycle phase
   *
   * @see {@link ??? link to lightning lifecycle docs}
   */
  _construct(): void;
  /**
   * Overridable method called during the `build` lifecycle phase
   *
   * @see {@link ??? link to lightning lifecycle docs}
   */
  _build(): void;
  /**
   * Overridable method called during the `setup` lifecycle phase
   *
   * @see {@link ??? link to lightning lifecycle docs}
   */
  _setup(): void;
  /**
   * Overridable method called during the `init` lifecycle phase
   *
   * @see {@link ??? link to lightning lifecycle docs}
   */
  _init(): void;
  /**
   * Overridable method called when the Component is attached
   *
   * @see {@link ??? link to lightning lifecycle docs}
   */
  _attach(): void;
  /**
   * Overridable method called when the Component is detached
   *
   * @see {@link ??? link to lightning lifecycle docs}
   */
  _detach(): void;
  /**
   * Overridable method called only during the first `enable` lifecycle phase
   *
   * @see {@link ??? link to lightning lifecycle docs}
   */
  _firstEnable(): void;
  /**
   * Overridable method called during the `enable` lifecycle phase
   *
   * @see {@link ??? link to lightning lifecycle docs}
   */
  _enable(): void;
  /**
   * Overridable method called during the `disable` lifecycle phase
   *
   * @see {@link ??? link to lightning lifecycle docs}
   */
  _disable(): void;
  /**
   * Overridable method called only during the first `active` lifecycle phase
   *
   * @see {@link ??? link to lightning lifecycle docs}
   */
  _firstActive(): void;
  /**
   * Overridable method called during the `active` lifecycle phase
   *
   * @see {@link ??? link to lightning lifecycle docs}
   */
  _active(): void;
  /**
   * Overridable method called during the `inactive` lifecycle phase
   *
   * @see {@link ??? link to lightning lifecycle docs}
   */
  _inactive(): void;
  _onDataProvided(): void;
  _onMounted(): void;
  _onChanged(): void;
  _focus(newTarget: Element, prevTarget: Element): void;
  _unfocus(newTarget: Element): void;
  _focusChange(newTarget: Element, prevTarget: Element): void;
  _getFocused(): Component<Component.TemplateSpecStrong> | undefined;
  _signal(): void;

  // !!! Do these handlers more universally if possible
  _captureKey?(e: KeyboardEvent): boolean | void;
  _captureBack?(e: KeyboardEvent): boolean | void;
  _handleKey?(e: KeyboardEvent): boolean | void;
  _handleLeft?(e: KeyboardEvent): boolean | void;
  _handleRight?(e: KeyboardEvent): boolean | void;
  _handleUp?(e: KeyboardEvent): boolean | void;
  _handleDown?(e: KeyboardEvent): boolean | void;
  _handleEnter?(e: KeyboardEvent): boolean | void;
  _handleBack?(e: KeyboardEvent): boolean | void;
  _setState(state: string, args?: unknown[]): void;
  _getState(): string;
  hasFocus(): boolean;
  hasFinalFocus(): boolean;
  signal(event: string, ...args: unknown[]): void;
  fireAncestors(event: Component.FireAncestorsEvent, ...args: unknown[]): void;
  _refocus(): void;
  $enter(event: Component.StateMachineEvent, ...extraArgs: unknown[]): void;
  $exit(event: Component.StateMachineEvent, ...extraArgs: unknown[]): void;

  get application(): Application;
  get cparent(): Component<Component.TemplateSpecStrong>;

  // Added by the StateMachine !!! Can we pull from statemachine?
  get state(): string;
  get _routedType(): Component<Component.TemplateSpecStrong> | undefined;
}

export default Component;
