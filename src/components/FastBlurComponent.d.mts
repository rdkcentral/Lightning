import Component from "../application/Component.mjs";
import Element from "../tree/Element.mjs";

declare namespace FastBlurComponent {
  export interface TemplateSpec extends Component.TemplateSpecStrong {
    /**
     * Content can be any Element / Component
     *
     * It is patched into the FastBlurComponent
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

declare class FastBlurComponent
  extends Component<FastBlurComponent.TemplateSpec>
  implements Component.ImplementTemplateSpec<FastBlurComponent.TemplateSpec>
{
  get content(): Element;
  set content(v: Element.PatchTemplate<Element.TemplateSpecLoose>);

  /**
   * X Padding
   *
   * @remarks
   * WARNING: DO NOT read from this property. It is WRITE-ONLY. It will return `undefined`.
   *
   * @see {@link FastBlurComponent.TemplateSpec.paddingX}
   */
  paddingX: number;

  /**
   * Y Padding
   *
   * @remarks
   * WARNING: DO NOT read from this property. It is WRITE-ONLY. It will return `undefined`.
   *
   * @see {@link FastBlurComponent.TemplateSpec.paddingY}
   */
  paddingY: number;

  amount: number;

  // Purposely not exposed:
  // readonly wrap: C2dFastBlurComponent | WebGLFastBlurComponent;
  // - Used only internally
}

export default FastBlurComponent;
