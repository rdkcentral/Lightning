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
import { AnimatableValueTypes, ExtractAnimatableValueTypes } from "../commonTypes.mjs";
import AnimationSettings from "./AnimationSettings.mjs";
import type Element from "../tree/Element.mjs";


declare namespace AnimationActionSettings {
  export type AnimationActionValue<ValueType extends AnimatableValueTypes> =
    ValueType |
    AnimationActionSettings.AnimationActionPointMap<ValueType> |
    ((progress: number) => ValueType);

  export interface AnimationActionPoint<ValueType extends AnimatableValueTypes> {
    /**
     * Slope
     *
     * @remarks
     * The slope (value per progress unit, 0 means flat, positive means 'curving upwards', negative means 'curving downwards' )
     *
     * @defaultValue `0`
     */
    s?: number;
    /**
     * Slope end
     *
     * @remarks
     * Outgoing curve sloop, if different from (incoming) slope (s)
     *
     * @defaultValue `0`
     */
    se?: number;
    /**
     * Smoothness
     *
     * @remarks
     * Smoothness of the curve around the point
     *
     * @defaultValue {@link AnimationActionPointMap.sm} if provided, otherwise `0.5`
     */
    sm?: number;
    /**
     * Smooth end
     *
     * @remarks
     * Outgoing curve smoothness, if different from (incoming) smoothness ({@link sm})
     *
     * @defaultValue
     * - If value is not last:
     *   - {@link sm} from the next value is used
     * - If {@link AnimationActionPointMap.sm} is set:
     *   - {@link AnimationActionPointMap.sm} is used
     * - Otherwise:
     *   - `0.5`
     */
    sme?: number;
    /**
     * Value
     *
     * Exact value at control point
     *
     * @defaultValue 0
     */
    v: ValueType | ((progress: number) => ValueType);
  }

  /**
   * Animation Action Control Point Map
   *
   * @remarks
   * This structure defines each control point in an animation.
   *
   * A numeric index defines each progress control point **P** of the animation curve.
   *
   * **P** can be any fraction between `0` and `1.0`. An animation will smoothly
   * alter its property value between these progress points during its set
   * {@link AnimationSettings.Literal.duration}.
   *
   * The value for each **P** index key defines a key frame value **V** of the property
   * that is being animated. **V** can be a {@link AnimationActionPoint} object which gives
   * you minute control over the curve of the animation at progress control point **P**. If
   * **V** is a `number` it's interpreted as {@link AnimationActionPoint.v} with default
   * values used all other animation settings.
   *
   * Note: If the animation's {@link AnimationSettings.Literal.stopMethod} is `onetotwo`
   * then **P** may also range to `2`. See {@link AnimationSettings.STOP_METHODS.ONETOTWO}.
   *
   * @example
   * ```ts
   * {
   *   // Value starts at 0 with default settings
   *   0: 0,
   *   // Value smoothly transitions midway to 250
   *   0.5: {
   *     v: 250,
   *     sm: 0.2
   *   }
   *   // Value ends at 500 with default settings
   *   1: 500
   * }
   * ```
   *
   * See [Action Value](https://lightningjs.io/docs/#/lightning-core-reference/Animations/ActionValue)
   * for more information.
   */
  export interface AnimationActionPointMap<ValueType extends AnimatableValueTypes> {
    [index: number]: ValueType | AnimationActionPoint<ValueType>;
    /**
     * Default Smoothness
     *
     * @remark
     * Default smoothness for each {@link AnimationActionPoint} value that does not
     * explicitly provide one.
     *
     * @defaultValue `0.5`
     */
    sm?: number;
  }

  /**
   * Animation Action Settings object literal
   *
   * @remarks
   * See [Animation Actions](https://lightningjs.io/docs/#/lightning-core-reference/Animations/Actions)
   * for more information.
   */
  export interface Literal<Key, ValueType extends AnimatableValueTypes> {
    // selector?: string | Element;
    // - Removed for same reasons as `properties` below

    /**
     * Tag selector (see {@link Element.tag} function) on which the animation will be applied
     *
     * @remarks
     * - If you specify this:
     *   - The child Elements (of the Element you're calling {@link Element.animation} on) that
     *     match the selector string will be animated.
     * - Otherwise:
     *   - The Element (or object) you are calling `animation()` on will be animated.
     *
     * WARNING: Because it's impossible to make tag selection type-safe it is recommended
     * to use a reference when using TypeScript, or call `animation()` directly on
     * each Element you wish to animate.
     */
    t?: string | Element;

    // properties?: Key | Array<Key>;
    // - Removed because its duplicative and potentially error prone
    // - Also cannot safely type an array of keys to animate at once, seems less useful too
    // - `p` was chosen as this is what is documented. Documentation also never shows the array
    //   of "properties" form

    /**
     * Property to animate
     *
     * @remarks
     * **IMPORTANT**: If you'd like to animate nested properties (i.e. 'texture.x', 'shader.angle', 'text.text'),
     * you will need to suffix them with "Force Assertions", since it is not possible to derive their types
     * in the type system:
     * - number: `as '$$number'`
     * - string: `as '$$string'`
     * - boolean: `as '$$boolean'`
     *
     * See the examples below to see how to use them.
     *
     * See [Action Value](https://lightningjs.io/docs/#/lightning-core-reference/Animations/ActionValue?id=action-value)
     * for more information.
     *
     * @example
     * ```ts
     * this.MyStrongElement.animation({
     *   duration: 10,
     *   actions: [
     *     { p: 'x', v: 100 },
     *     { p: 'x', v: { 0: 100, 0.25: { v: 200 }, 0.75: { v: 300 }, 1: 400 } },
     *     { p: 'x', v: (p) => 100 * p },
     *     { p: 'rtt', v: false },
     *     { p: 'rtt', v: { 0: false, 0.25: { v: true }, 0.75: { v: false }, 1: true, sm: 0.5 } },
     *     { p: 'rtt', v: (p) => true },
     *     { p: 'texture.x' as '$$number', v: 123 },
     *     { p: 'text.text' as '$$string', v: 'some string' },
     *     { p: 'text.wordWrap' as '$$boolean', v: true }
     *   ]
     * })
     * ```
     */
    p?: Key;

    // value?: AnimationActionSettings.AnimationActionValue<ValueType>
    // - Removed for same reasons as `properties` above

    /**
     * Value object decribing animation
     *
     * @remarks
     * See [Action Value](https://lightningjs.io/docs/#/lightning-core-reference/Animations/ActionValue?id=action-value)
     * for more information.
     */
    v?:
      // Square brackets opt-out of of "distributive behavior" in conditioanl type
      // (https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types)
      [ValueType] extends [never]
        ?
          never
        :
          AnimationActionSettings.AnimationActionValue<ValueType>
    // resetValue?: AnimatableValueTypes;
    // - Removed for same reasons as `properties` above

    /**
     * Reset value
     *
     * @remarks
     * After manually stopping the animation, the defined value `v` at progress 0 is used.
     * If another value is desired, `rv` can be used.
     *
     * See [Action Value](https://lightningjs.io/docs/#/lightning-core-reference/Animations/ActionValue?id=action-value)
     * for more information.
     */
    rv?: ValueType;
  }
}


declare class AnimationActionSettings {
  // STUB
}

export default AnimationActionSettings;
