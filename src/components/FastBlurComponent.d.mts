import Component from "../application/Component.mjs";
import Element from "../tree/Element.mjs";

declare namespace FastBlurComponent {
  export interface Literal extends Component.Literal {
    /**
     * Content can be any Element / Component
     *
     * It is patched into the FastBlurComponent
     */
    content: Element.PatchTemplate<Element.LooseLiteral>;

    paddingX: number;

    paddingY: number;

    /**
     * Sets the amount of blur. A value between 0 and 4. Goes up exponentially for blur.
     * Best results for non-fractional values.
     */
    amount: number;
  }
}

declare class FastBlurComponent
  extends Component<FastBlurComponent.Literal>
  implements Component.ImplementLiteral<FastBlurComponent.Literal>
{
  get content(): Element;
  set content(v: Element.PatchTemplate<Element.LooseLiteral>);

  /**
   * {@inheritDoc FastBlurComponent.Literal.paddingX}
   *
   * WARNING: DO NOT read from this property. It is WRITE-ONLY. It will return `undefined`.
   *
   * @see {@link FastBlurComponent.Literal.paddingX}
   */
  paddingX: number;

  /**
   * {@inheritDoc FastBlurComponent.Literal.paddingY}
   *
   * WARNING: DO NOT read from this property. It is WRITE-ONLY. It will return `undefined`.
   *
   * @see {@link FastBlurComponent.Literal.paddingY}
   */
  paddingY: number;

  amount: number;

  // Purposely not exposed:
  // readonly wrap: C2dFastBlurComponent | WebGLFastBlurComponent;
  // - Used only internally
}

export default FastBlurComponent;
