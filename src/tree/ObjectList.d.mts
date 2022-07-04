export default class ObjectList<ItemType, LiteralType extends Record<string | number | symbol, unknown>> {
  /**
   * Add `object` to the end of the ObjectList, transforming it to `ItemType` instances if necessary.
   *
   * @remarks
   * If `object` is:
   * - An Object Literal (See: {@link lng.Utils.isObjectLiteral})...
   *   - It will be tranformed into an instantiated `ItemType` via {@link createItem()} before
   *     being added to the ObjectList.
   * - An array...
   *   - Each item of the Array will be recursively sent to {@link a()}.
   * - An `ItemType`...
   *   - It will be added directly to the ObjectList
   * @param object
   * @returns
   * Returns the `ItemType` instance that was added to the ObjectList, except if `object` is an
   * array in which it will return `null`
   */
  a(object: LiteralType | LiteralType[] | ItemType[]): ItemType | null;
  /**
   * Add `object` to the end of the ObjectList
   *
   * @param object
   */
  add(object: ItemType): void;
  /**
   * Insert `object` at `index`
   *
   * @param object
   * @param index
   */
  addAt(object: ItemType, index: number): void;
  /**
   * Empty the ObjectList
   */
  clear(): void;
  forEach(callback: (item: ItemType, index: number, array: ItemType[]) => void): void;
  get(): ItemType[];
  getAt(index: number): ItemType | undefined;
  getByRef(ref: string): ItemType | undefined;

  /**
   * Patch `settings` into the ObjectList
   *
   * @remarks
   * If `settings` is:
   * - An Object Literal (See: {@link lng.Utils.isObjectLiteral})...
   *   - The keys of the Object Literal are treated as ref strings. Each key is looked up in the
   *     set of existing items:
   *     - If the object at the ref key already exists in the ObjectList:
   *       - If the new object is an instantiated `ItemType`
   *         - The existing object is replaced with the new object.
   *       - If the new object is an Object Literal
   *         - The new Object Literal is patched into the existing object
   *     - If it does not:
   *       - The new object is added to the end of the ObjectList, transforming any Object Literals
   *         with {@link createItem()} beforehand.
   * - An array:
   *   - The items of the ObjectList are replaced by the array:
   *     - Instantiated `ItemList` objects are used directly.
   *     - Object Literals are patched into any existing items (matched by their `ref` values)
   *     - Object Literals that don't match existing items are created via {@link createItem()}.
   * @param settings
   */
  patch(settings: Record<string, ItemType | LiteralType> | Array<ItemType | LiteralType>): void;
  /**
   * Remove `object` from the ObjectList by strict equality
   *
   * @param object
   */
  remove(object: ItemType): void;
  /**
   * Remove the object from the ObjectList at `index
   *
   * @param index
   * @returns The object removed
   */
  removeAt(index: number): ItemType;
  /**
   * Overridable method that transforms a `LiteralType` instance into an
   * instantiated `ItemType`.
   * @param literal
   */
  createItem(object: LiteralType): ItemType;
  /**
   * Overridable method that returns `true` (or `1`) if `object` is a directly insertable
   * item.
   *
   * @remarks
   * For example, `ElementChildList` overrides this to return `true` if the object
   * is an instantiated `Element`.
   *
   * `1` and `undefined` are included in the type union because of how
   * `ElementChildList` already implemnents this.
   *
   * @param object
   */
  isItem(object: Record<string, unknown>): boolean | 1 | undefined;
  get length(): number;
}
