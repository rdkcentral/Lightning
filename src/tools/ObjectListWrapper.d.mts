/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2022 Metrological
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import ObjectListProxy from "./ObjectListProxy.mjs";
import type ObjectList from "../tree/ObjectList.mjs";

/**
 * An {@link ObjectListProxy} that wraps any new items via a `wrap` callback before adding them to the
 * `target` {@link Lightning.types.ObjectList}
 */
export default class ObjectListWrapper<ItemType, LiteralType extends Record<string | number | symbol, unknown>> extends ObjectListProxy<ItemType, LiteralType> {
  /**
   * Constructor
   *
   * @param target Target {@link Lightning.types.ObjectList} to mutate in sync with this one.
   * @param wrap Function, given an item, returns the item wrapped in another item.
   */
  constructor(target: ObjectList<ItemType, LiteralType>, wrap: (i: ItemType) => ItemType);
}