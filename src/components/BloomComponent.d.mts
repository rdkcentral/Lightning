import Component from "../application/Component.mjs";
import Element from "../tree/Element.mjs";

declare namespace BloomComponent {
  export interface TemplateSpec extends Component.TemplateSpecStrong {
    /**
     * Content can be any Element / Component
     *
     * It is patched into the BloomComponent
     */
    content: Element.PatchTemplate<Element.TemplateSpecLoose>;

    /**
     * X Padding
     */
    paddingX: number;

    /**
     * Y Padding
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
  extends Component<BloomComponent.TemplateSpec>
  implements Component.ImplementTemplateSpec<BloomComponent.TemplateSpec>
{
  get content(): Element;
  set content(v: Element.PatchTemplate<Element.TemplateSpecLoose>);

  /**
   * X Padding
   *
   * WARNING: DO NOT read from this property. It is WRITE-ONLY. It will return `undefined`.
   *
   * @see {@link BloomComponent.TemplateSpec.paddingX}
   */
  paddingX: number;

  /**
   * Y Padding
   *
   * WARNING: DO NOT read from this property. It is WRITE-ONLY. It will return `undefined`.
   *
   * @see {@link BloomComponent.TemplateSpec.paddingY}
   */
  paddingY: number;

  amount: number;
}

export default BloomComponent;
