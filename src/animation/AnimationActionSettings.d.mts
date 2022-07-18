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
   * Note: If the animation's {@link AnimationSettings.Literal.StopMethod} is `onetotwo`
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
    // selector?: string;
    // - Removed for same reasons as `properties` below

    /**
     * Tag selector (see {@link Element.tag} function) on which the animation will be applied
     *
     * @remarks
     * - If you specify this:
     *   - The child Elements (of the Element you're calling {@link Element.animation} on) that
     *     match the selector string will be animated.
     * - Otherwise:
     *   - The Element you are calling `animation()` on will be animated.
     *
     * WARNING: Because it's impossible to make tag selection type-safe it is recommended
     * you do not use `t` when using TypeScript. Instead, call `animation()` directly on
     * each Element you wish to animate.
     *
     * @see {@link selector}
     * @deprecated See note about type-safety in the Remarks section.
     */
    t?: string;

    // properties?: Key | Array<Key>;
    // - Removed because its duplicative and potentially error prone
    // - Also cannot safely type an array of keys to animate at once, seems less useful too
    // - `p` was chosen as this is what is documented. Documentation also never shows the array
    //   of "properties" form

    /**
     * Property to animate
     *
     * @remarks
     * See [Action Value](https://lightningjs.io/docs/#/lightning-core-reference/Animations/ActionValue?id=action-value)
     * for more information.
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
    rv?: AnimationActionSettings.AnimationActionValue<ValueType>;
  }
}


declare class AnimationActionSettings {
  // !!!! Remove this body and mark as internal use only? (simplifies our setup)
  // set selector(v: string);
  // set value(v: AnimationActionSettings.AnimationActionPointMap);
  // set properties(v: string | Array<string>);
}

export default AnimationActionSettings;
