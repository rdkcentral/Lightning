import Element from "./Element.mjs";
import ObjectList from "./ObjectList.mjs";

/**
 * Manages the list of children for an element.
 */
export default class ElementChildList extends ObjectList<Element, Element.PatchTemplate> {
  constructor(element: Element);

  /**
   * Add `object` to the end of the ElementChildList, transforming it to Element instances if necessary.
   *
   * @remarks
   * If `object` is:
   * - A {@link Element.PatchTemplate PatchTemplate}...
   *   - It will be tranformed into an instantiated Element before
   *     being added to the ElementChildList.
   * - An array...
   *   - Each item of the Array will be recursively sent to {@link a}.
   * - An {@link Element}...
   *   - It will be added directly to the ElementChildList
   * @param object
   * @returns
   * Returns the Element instance that was added to the ElementChildList, except if `object` is an
   * array in which it will return `null`
   */
   a(object: Element.PatchTemplate | Array<Element.PatchTemplate | Element>): Element | null;
   /**
    * Add `element` to the end of the ElementChildList.
    *
    * @remarks
    * `element` must be an instantiated Element instance.
    *
    * @param element
    */
   add(element: Element): void;
   /**
    * Insert `element` at `index`
    *
    * @remarks
    * `element` must be an instantiated Element instance.
    *
    * @param element
    * @param index
    */
   addAt(element: Element, index: number): void;
   /**
    * Empty the ElementChildList
    */
   clear(): void;
   /**
    * Execute `callback` for each Element in the ElementChildList
    *
    * @param callback
    */
   forEach(callback: (item: Element, index: number, array: Element[]) => void): void;
   /**
    * Returns the array of element
    *
    * @remarks
    * The array returned is the same used internally by the ElementChildList. Do not modify.
    */
   get(): Element[];
   /**
    * Get Element by `index`
    *
    * @param index
    * @returns Item if `index` is greather than/equal to 0 and less than {@link length}, otherwise undefined.
    */
   getAt(index: number): Element | undefined;
   /**
    * Get Element by ref string
    *
    * @param ref
    * @returns Element with ref string, or `undefined` if not found.
    */
   getByRef(ref: string): Element | undefined;

   /**
    * Patch `settings` into the ElementChildList
    *
    * @remarks
    * If `settings` is:
    * - An Object Literal (See: {@link lng.Utils.isObjectLiteral})...
    *   - The keys of the Object Literal are treated as ref strings. Each key is looked up in the
    *     set of existing items:
    *     - If an Element with the ref key already exists in the ElementChildList:
    *       - If the new object is an instantiated Element:
    *         - The existing Element is replaced with the new Element.
    *       - If the new object is an {@link Element.PatchTemplate PatchTemplate}
    *         - The new PatchTemplate is patched into the existing Element.
    *     - If an Element does not exist with the ref key:
    *       - The new object is added to the end of the ElementChildList, transforming any PatchTemplates
    *         into Elements beforehand.
    * - An array:
    *   - The Elements of the ElementChildList are replaced by the array:
    *     - Instantiated Element instances are used directly.
    *     - PatchTemplates are patched into any existing Elements (matched by their `ref` values)
    *     - PatchTemplates that don't match existing items are transformed into Elements.
    * @param settings
    */
   patch(settings: Record<string, Element | Element.PatchTemplate> | Array<Element | Element.PatchTemplate>): void;
   /**
    * Remove `element` from the ElementChildList by strict equality
    *
    * @param object
    */
   remove(element: Element): void;
   /**
    * Remove the Element from the ElementChildList at `index`
    *
    * @param index
    * @returns The object removed
    */
   removeAt(index: number): Element;
   /**
    * Transforms a `Element.PatchTemplate` instance into an instantiated `Element`.
    *
    * @remarks
    * Used internally by {@link ObjectList}. Not meant to be called directly.
    *
    * @param object
    */
   createItem(object: Element.PatchTemplate): Element;
   /**
    * Returns a truthy value if the object is an instantiated Element.
    *
    * @remarks
    * Used internally by {@link ObjectList}. Not meant to be called directly.
    *
    * @param object
    */
   isItem(object: Record<string, unknown>): boolean | 1 | undefined;
   /**
    * Number of items in the ElementChildList
    */
   get length(): number;
}
