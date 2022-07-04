import Element from "./Element.mjs";
import ObjectList from "./ObjectList.mjs";

export default class ElementChildList extends ObjectList<Element, Element.PatchTemplate> {
  constructor(element: Element);
}
