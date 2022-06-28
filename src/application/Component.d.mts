import Element from "../tree/Element.mjs";
import Texture from "../tree/Texture.mjs";
import Application from "./Application.mjs";

declare namespace Component {
  export type Constructor<C extends Component<Literal>> = new (...a: any[]) => C;

  /**
   * Base strongly-typed Literal for a Component
   *
   * If you inherit from this, follow this example closely:
   * ```
   * export interface MyComponentLiteral extends lng.Component.Literal {
   *   type: typeof MyComponent;
   *   //  ^---- `type` must be the `typeof` your component
   *   myProperty1: number;
   *   myProperty2: string;
   *   // ^----- Your properties should not be optional (so TS can enforce that they are implemented in your Component)
   *   MyChildComponent: lng.Element.ExtractLiteral<MyChildComponent>
   *   // ^----- Child components should be typed by their literals.
   *   //        Use `ExtractLiteral<Component>` for these.
   *   content: Component.PatchTemplate<Element.LooseLiteral>;
   *   // ^----- If your Component has a property that when set, patches
   *   //        the value into itself, use `PatchTemplate<Element.LooseLiteral>`
   * }
   * ```
   */
  export interface Literal extends Element.Literal {
    type: Constructor<Component<Literal>>// new (...a: any[]) => Component<Literal>;
  }

  /**
   * Loose form of lng.Component.Literal that allows any additional 'any' properties
   */
  export interface LooseLiteral extends Component.Literal {
    type: Constructor<Component<LooseLiteral>>
    [s: string]: any
  }

  /**
   * Forces nested Literals in a _template() Template to define their 'type'
   */
  type TemplateRequireType<LT extends Component.Literal> = {
    type: NonNullable<LT['type']>
  } & {
    [P in keyof LT]?:
      LT[P] extends Component.Literal
        ?
          TemplateRequireType<LT[P]>
        :
          LT[P] extends Element.Literal
            ?
              TemplateLiteral<LT[P]>
            :
              LT[P]
  };

  /**
   * Type used for the return result of _template().
   *
   * All Literal properties are made optional. Nested Literal properties are also made
   * optional, except for the `type` propety which is made requred.
   */
   export type TemplateLiteral<LT extends Element.Literal = Element.LooseLiteral> = {
    [P in keyof LT]?:
      LT[P] extends Component.Literal
        ?
          TemplateRequireType<LT[P]>
        :
          LT[P] extends Element.Literal
            ?
              TemplateLiteral<LT[P]>
            :
              LT[P]
  };

  /**
   * Type used for the return result of _template().
   *
   * All Literal properties are made optional. Nested Literal properties are also made
   * optional, except for the `type` propety which is made requred.
   */
  export type Template<T extends Element = Element> = TemplateLiteral<T['__$type_Literal']>;

  /**
   * Duplicate of {@link Element.ImplementLiteral} for convenience
   *
   * @see {@link Element.ImplementLiteral}
   */
  export type ImplementLiteral<LiteralType extends Element.Literal> = Element.ImplementLiteral<LiteralType>

  /**
   * Extracts the input Component's Literal value
   */
  export type ExtractLiteral<T extends Component> = T['__$type_Literal'];

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
  // Components use loose typing Literals by default
  LiteralType extends Component.Literal = Component.LooseLiteral
> extends Element<
  LiteralType
> implements Element.ImplementLiteral<Component.Literal> {
  /**
   * @deprecated !!! remove?
   * You should avoid using templates
   */
  static _template(): Component.Template;
  static _states(): typeof Component[];
  static _getLookupId(): string;
  static _getSourceLoader(): any;
  static getFonts(): Component.Font[];
  static parseTemplate(template: Component.Template): Component.ParsedTemplate;
  static getParent(element: Element): Component<Component.Literal>;
  _construct(): void;
  _build(): void;
  _setup(): void;
  _init(): void;
  _attach(): void;
  _detach(): void;
  _firstEnable(): void;
  _enable(): void;
  _disable(): void;
  _firstActive(): void;
  _active(): void;
  _inactive(): void;
  _onDataProvided(): void;
  _onMounted(): void;
  _onChanged(): void;
  _focus(newTarget: Element, prevTarget: Element): void;
  _unfocus(newTarget: Element): void;
  _focusChange(newTarget: Element, prevTarget: Element): void;
  _getFocused(): Component<Component.Literal> | undefined;
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
  get cparent(): Component<Component.Literal>;

  // Added by the StateMachine !!! Can we pull from statemachine?
  get state(): string;
  get _routedType(): Component<Component.Literal> | undefined;
}

export default Component;
