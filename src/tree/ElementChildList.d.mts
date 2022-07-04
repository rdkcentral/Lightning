import Element from "./Element.mjs";
import ObjectList from "./ObjectList.mjs";

/**
 * Manages the list of children for an element.
 */
export default class ElementChildList extends ObjectList<Element, Element.PatchTemplate> {
  constructor(element: Element);

  a(object: Element.PatchTemplate | Array<Element.PatchTemplate | Element>): Element | null;
}
