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
import AnimationSettings from "../animation/AnimationSettings.mjs";
import TransitionSettings from "../animation/TransitionSettings.mjs";
import Component from "../application/Component.mjs";
import { Documentation } from "../internalTypes.mjs";
import ObjectListWrapper from "../tools/ObjectListWrapper.mjs";
import Element from "../tree/Element.mjs";

declare namespace ListComponent {
  export interface TemplateSpec<ItemType extends Element.Constructor = Element.Constructor> extends Component.TemplateSpec {
    /**
     * Items patched into the ListComponent
     */
    items: Element.PatchTemplateArray<ItemType>;

    /**
     * The scroll area size in pixels per item
     */
    itemSize: number;

    viewportScrollOffset: number;

    itemScrollOffset: number;

    /**
     * The transition definition used when scrolling between items
     */
    scrollTransitionSettings: TransitionSettings.Literal;

    /**
     * Alias for {@link scrollTransitionSettings}
     *
     * @see {@link scrollTransitionSettings}
     */
    scrollTransition: TransitionSettings.Literal;

    /**
     * Definition for a custom animation that is applied when an item is
     * (partially) selected.
     */
    progressAnimation: AnimationSettings.Literal | AnimationSettings | null;

    /**
     * Should the list jump when scrolling between end to start, or
     * should it be continuous, like a carrousel?
     */
    roll: boolean;

    /**
     * Allows restricting the start scroll position
     */
    rollMin: number;

    /**
     * Allows restricting the end scroll position
     */
    rollMax: number;

    /**
     * Inverts the scrolling direction.
     *
     * WARNING: Can only be set on creation of the component
     */
    invertDirection: boolean;

    /**
     * Layout the items horizontally or vertically
     *
     * false, undefined = vertical
     * true = horizontal
     *
     * WARNING: Can only be set on creation of the component
     */
    horizontal: boolean;
  }
}

declare class ListComponent<
  ItemType extends Element.Constructor = Element.Constructor
>
  extends Component<ListComponent.TemplateSpec<ItemType>>
  implements Documentation<ListComponent.TemplateSpec>
{
  readonly itemList: ListItems<InstanceType<ItemType>>;

  /**
   * Items patched into the ListComponent
   *
   * @remarks
   * WARNING: You may ONLY set `Element.PatchTemplateArray<ItemType>[]`
   * to this property
   *
   * Note: This property will always return `InstanceType<ItemType>[]` when read.
   *
   * @see {@link ListComponent.TemplateSpec.items}
   */
  // @ts-ignore-error: Prevent ts(2380)
  get items(): InstanceType<ItemType>[];
  set items(items: Element.PatchTemplateArray<ItemType>);

  /**
   * Select a specific item by index
   *
   * @param index
   * @param immediate Skip animation, if true
   * @param closest Scroll to same offset closest to the index, if true
   */
  setIndex(index: number, immediate?: boolean, closest?: boolean): void;

  getAxisPosition(): number;

  /**
   * Select the previous item
   */
  setPrevious(): void;

  /**
   * Select the next item
   */
  setNext(): void;

  /**
   * Get wrapper Element around the item by an index
   * @param index
   */
  getWrapper(index: number): Element | undefined;

  /**
   * Get item Element by an index
   * @param index
   */
  getElement(index: number): InstanceType<ItemType> | null;

  /**
   * Re-render the list
   */
  reload(): void;

  /**
   * Currently selected item Element
   */
  readonly element: InstanceType<ItemType> | null;

  /**
   * Number of items
   */
  readonly length: number;

  /**
   * Property name used for positioning
   *
   * 'x' if horizontal list
   * 'y' if vertical
   */
  readonly property: 'x' | 'y';

  /**
   * Size of viewport in pixels
   *
   * Width, if horizonal.
   * Height, if vertical.
   */
  readonly viewportSize: number;

  /**
   * Raw index
   */
  readonly index: number;

  /**
   * Raw index modulo length (i.e. guaranteed to be within the length of the list)
   */
  readonly realIndex: number;

  itemSize: number;

  viewportScrollOffset: number;

  itemScrollOffset: number;

  /**
   * The transition definition used when scrolling between items
   *
   * @see {@link ListComponent.TemplateSpec.scrollTransitionSettings}
   */
  get scrollTransitionSettings(): TransitionSettings;
  set scrollTransitionSettings(v: TransitionSettings.Literal);

  /**
   * Alias for {@link scrollTransitionSettings}
   *
   * @see {@link ListComponent.TemplateSpec.scrollTransitionSettings}
   */
  get scrollTransition(): TransitionSettings;
  set scrollTransition(v: TransitionSettings.Literal);

  /**
   * Definition for a custom animation that is applied when an item is
   * (partially) selected.
   *
   * @see {@link ListComponent.TemplateSpec.progressAnimation}
   */
  get progressAnimation(): AnimationSettings | null;
  set progressAnimation(v: AnimationSettings | AnimationSettings.Literal | null);

  roll: boolean;

  rollMin: number;

  rollMax: number;

  invertDirection: boolean;

  horizontal: boolean;

  // Purposely not exposed:
  // start()
  // - Seems to be called internally only by ListItems
  // update()
  // - Seems to be internal
}

export default ListComponent;

declare class ListItems<T extends Element = Element> extends ObjectListWrapper<T, Element.PatchTemplate<T['__$type_TemplateSpec']>> {
  // Purposely not exposed:
  // onAdd(item, index)
  // checkStarted(index)
  // onRemove(item, index)
  // onSet(item, index)
  // onSync(removed, added, order)
  // - All of these are event handling overrides. The interface is not changed
  //   for the user
}
