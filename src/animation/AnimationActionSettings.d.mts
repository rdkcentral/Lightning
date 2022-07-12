import AnimationSettings from "./AnimationSettings.mjs";

declare namespace AnimationActionSettings {
  /**
   * Types animations are allowed on
   */
  export type AnimatableValueTypes = number | boolean | string;

  export type AnimationActionValue =
    AnimatableValueTypes |
    AnimationActionSettings.AnimationActionPointMap |
    ((progress: number) => AnimatableValueTypes);

  export interface AnimationActionPoint {
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
    v: AnimatableValueTypes | ((progress: number) => AnimatableValueTypes);
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
   */
  export interface AnimationActionPointMap {
    [index: number]: number | AnimationActionPoint;
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

  export interface Literal {
    /**
     * Selector
     *
     * @remarks
     * ???
     */
    selector?: string;
    /**
     * Alias for {@link selector}
     *
     * @see {@link selector}
     */
    t?: string;
    /**
     * Properties to Animate
     *
     * @remarks
     * ???
     */
    properties?: string | Array<string>;
    /**
     * Alias for {@link properties}
     *
     * @see {@link properties}
     */
    p?: string | Array<string>;
    /**
     * Value
     *
     * @remarks
     * ???
     */
    value?: AnimationActionValue;
    /**
     * Alias for {@link value}
     *
     * @see {@link value}
     */
    v?: AnimationActionValue;
    /**
     * Reset Value
     *
     * @remarks
     * ???
     */
    resetValue?: AnimatableValueTypes;
    /**
     * Alias for {@link resetValue}
     *
     * @see {@link resetValue}
     */
    rv?: AnimatableValueTypes;
  }
}


declare class AnimationActionSettings implements AnimationActionSettings.Literal {
  constructor(animationSettings: AnimationSettings);

  set selector(v: string);
  set value(v: AnimationActionSettings.AnimationActionPointMap);
  set properties(v: string | Array<string>);
}

export default AnimationActionSettings;
