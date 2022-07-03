import Component from "../application/Component.mjs";
import Element from "../tree/Element.mjs";

declare namespace BorderComponent {
  export interface TemplateSpec extends Component.TemplateSpecStrong {
    /**
     * Content can be any Element / Component
     *
     * It is patched into the BorderComponent
     */
    content: Element.PatchTemplate<Element.TemplateSpecLoose>;

    /**
     * Border width
     *
     * @remarks
     * When patched, this sets the width of all borders
     */
    borderWidth: number;

    /**
     * Width of top border
     */
    borderWidthTop: number;

    /**
     * Width of right border
     */
    borderWidthRight: number;

    /**
     * Width of bottom border
     */
    borderWidthBottom: number;

    /**
     * Width of left border
     */
    borderWidthLeft: number;

    /**
     * Border color
     *
     * When patched, this sets the width of all borders
     */
    colorBorder: number;

    /**
     * Color of top border
     */
    colorBorderTop: number;

    /**
     * Color of right border
     */
    colorBorderRight: number;

    /**
     * Color of bottom border
     */
    colorBorderBottom: number;

    /**
     * Color of left border
     */
    colorBorderLeft: number;

    /**
     * Top border element / template
     *
     * @remarks
     * Use to customize the border beyond color/width
     */
    borderTop: Element.PatchTemplate<Element.TemplateSpecLoose>;

    /**
     * Top border element / template
     *
     * @remarks
     * Use to customize the border beyond color/width
     */
    borderRight: Element.PatchTemplate<Element.TemplateSpecLoose>;

    /**
     * Top border element / template
     *
     * @remarks
     * Use to customize the border beyond color/width
     */
    borderBottom: Element.PatchTemplate<Element.TemplateSpecLoose>;

    /**
     * Top border element / template
     *
     * @remarks
     * Use to customize the border beyond color/width
     */
    borderLeft: Element.PatchTemplate<Element.TemplateSpecLoose>;

    /**
     * Border template
     *
     * @remarks
     * When patched, applies the patch template to all borders
     */
    borders: Element.PatchTemplate<Element.TemplateSpecLoose>;
  }
}

declare class BorderComponent
  extends Component<BorderComponent.TemplateSpec>
  implements Component.ImplementTemplateSpec<BorderComponent.TemplateSpec>
{
  get content(): Element;
  set content(v: Element.PatchTemplate<Element.TemplateSpecLoose>);

  borderWidth: number;
  borderWidthTop: number;
  borderWidthRight: number;
  borderWidthBottom: number;
  borderWidthLeft: number;

  colorBorder: number;
  colorBorderTop: number;
  colorBorderRight: number;
  colorBorderBottom: number;
  colorBorderLeft: number;

  get borderTop(): Element;
  set borderTop(v: Element.PatchTemplate<Element.TemplateSpecLoose>);

  get borderRight(): Element;
  set borderRight(v: Element.PatchTemplate<Element.TemplateSpecLoose>);

  get borderBottom(): Element;
  set borderBottom(v: Element.PatchTemplate<Element.TemplateSpecLoose>);

  get borderLeft(): Element;
  set borderLeft(v: Element.PatchTemplate<Element.TemplateSpecLoose>);

  /**
   * Border template
   *
   * @remarks
   * WARNING: DO NOT read from this property. It is WRITE-ONLY. It will return `undefined`.
   *
   * @see {@link BorderComponent.TemplateSpec.borders}
   */
  borders: Element.PatchTemplate<Element.TemplateSpecLoose>;
}

export default BorderComponent;
