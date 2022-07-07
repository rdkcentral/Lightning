import ObjectList from "../tree/ObjectList.mjs";

/**
 * An {@link ObjectList} that, when mutated, also mutates it's `target` in the same way.
 */
export default class ObjectListProxy<ItemType, LiteralType extends Record<string | number | symbol, unknown>> extends ObjectList<ItemType, LiteralType> {
  /**
   * Constructor
   *
   * @param target Target {@link ObjectList} to mutate in sync with this one.
   */
  constructor(target: ObjectList<ItemType, LiteralType>);
}