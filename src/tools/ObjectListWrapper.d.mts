import ObjectListProxy from "./ObjectListProxy.mjs";
import type ObjectList from "../tree/ObjectList.mjs";

/**
 * An {@link ObjectListProxy} that wraps any new items via a `wrap` callback before adding them to the
 * `target` {@link ObjectList}
 */
export default class ObjectListWrapper<ItemType, LiteralType extends Record<string | number | symbol, unknown>> extends ObjectListProxy<ItemType, LiteralType> {
  /**
   * Constructor
   *
   * @param target Target {@link ObjectList} to mutate in sync with this one.
   * @param wrap Function, given an item, returns the item wrapped in another item.
   */
  constructor(target: ObjectList<ItemType, LiteralType>, wrap: (i: ItemType) => ItemType);
}