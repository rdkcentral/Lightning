import Component from "../application/Component.mjs";
import Element from "../tree/Element.mjs";

declare namespace BloomComponent {
  export interface Literal extends Component.Literal {
    /**
     * Content can be any Element / Component
     *
     * It is patched into the BloomComponent
     */
    content: Element.PatchTemplate<Element.LooseLiteral>;

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

    /**
     * Sets the amount of blur. A value between 0 and 4. Goes up exponentially for blur.
     * Best results for non-fractional values.
     */
    amount: number;
  }
}

declare class BloomComponent
  extends Component<BloomComponent.Literal>
  implements Component.ImplementLiteral<BloomComponent.Literal>
{
  get content(): Element;
  set content(v: Element.PatchTemplate<Element.LooseLiteral>);

  /**
   * {@inheritDoc BloomComponent.Literal.paddingX}
   *
   * WARNING: DO NOT read from this property. It is WRITE-ONLY. It will return `undefined`.
   *
   * @see {@link BloomComponent.Literal.paddingX}
   */
  paddingX: number;

  /**
   * {@inheritDoc BloomComponent.Literal.paddingY}
   *
   * WARNING: DO NOT read from this property. It is WRITE-ONLY. It will return `undefined`.
   *
   * @see {@link BloomComponent.Literal.paddingY}
   */
  paddingY: number;

  amount: number;
}

export default BloomComponent;
