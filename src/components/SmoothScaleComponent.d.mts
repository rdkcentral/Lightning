import Component from "../application/Component.mjs";
import Element from "../tree/Element.mjs";

declare namespace SmoothScaleComponent { // !!! Go back and make all other components ContentType changable
  interface TemplateSpec<ContentType extends Element = Element> extends Component.TemplateSpecStrong {
    /**
     * Content patched into SmoothScaleComponent
     */
    content: Element.PatchTemplate<Element.ExtractTemplateSpec<ContentType>>;
    /**
     * Smooth scale factor
     */
    smoothScale: number;
  }
}

declare class SmoothScaleComponent<
  ContentType extends Element = Element
>
  extends Component<SmoothScaleComponent.TemplateSpec<ContentType>>
{
  // @ts-expect-error Prevent ts(2380)
  get content(): ContentType;
  set content(content: Element.PatchTemplate<Element.ExtractTemplateSpec<ContentType>>);
  smoothScale: number;
}

export default SmoothScaleComponent;
