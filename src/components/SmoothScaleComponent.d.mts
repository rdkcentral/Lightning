import Component from "../application/Component.mjs";
import Element from "../tree/Element.mjs";

declare namespace SmoothScaleComponent { // !!! Go back and make all other components ContentType changable
  interface Literal<ContentType extends Element = Element> extends Component.Literal {
    type: Component.Constructor<SmoothScaleComponent>;
    /**
     * Content patched into SmoothScaleComponent
     */
    content: Element.PatchTemplate<Element.ExtractLiteral<ContentType>>;
    /**
     * Smooth scale factor
     */
    smoothScale: number;
  }
}

declare class SmoothScaleComponent<
  ContentType extends Element = Element
>
  extends Component<SmoothScaleComponent.Literal<ContentType>>
  implements Component.ImplementLiteral<SmoothScaleComponent.Literal<ContentType>>
{
  // @ts-expect-error
  content: ContentType; // !!! Solve this problem
  //content: ContentType | Element.PatchTemplate<Element.ExtractLiteral<ContentType>>;
  // get content(): Element.PatchTemplate<Element.ExtractLiteral<ContentType>>;
  // set content(v: Element.PatchTemplate<Element.ExtractLiteral<ContentType>>);

  smoothScale: number;
}

export default SmoothScaleComponent;
