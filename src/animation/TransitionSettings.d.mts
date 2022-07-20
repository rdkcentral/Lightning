import Stage from "../tree/Stage.mjs";

declare namespace TransitionSettings {
  /**
   * Timing function types
   *
   * @remarks
   * Values
   * - `"ease"`
   *   - Transition starts at a constant speed and ends slowing down
   * - `"linear"`
   *   - Straight point-to-point animation
   * - `"ease-in"`
   *   - Transition starts slow and continues in a constant speed
   * - `"ease-out"`
   *   - Transition starts at a constant speed and ends slowing down
   * - `"ease-in-out"`
   *   - Transition starts slow, continues at a constant speed, and ends slowing down
   * - `"step-start"`
   *   - Transition steps to start position
   * - `"step-end"`
   *   - Transition steps to end position
   * - `"cubic-bezier(a,b,c,d)"`
   *   - Custom bezier curve (See: [cubic-bezier.com](https://cubic-bezier.com/))
   *
   * See [Timing Function Settings](https://lightningjs.io/docs/#/lightning-core-reference/Transitions/Attributes?id=timing-function-settings)
   * for more information.
   */
  export type TimingFunction =
    | 'linear'
    | 'ease'
    | 'ease-in'
    | 'ease-out'
    | 'ease-in-out'
    | 'step-start'
    | 'step-end'
    | `cubic-bezier(${string})`;

  /**
   * Transition Settings object literal
   *
   * @remarks
   * See [Transitions](https://lightningjs.io/docs/#/lightning-core-reference/Transitions/index) for more
   * information.
   */
  export interface Literal {
    /**
     * Delay in seconds before transition starts
     *
     * @defaultValue `0`
     */
    delay?: number;
    /**
     * Duration in seconds of the transition from start to end
     *
     * @defaultValue `0`
     */
    duration?: number;
    /**
     * Timing function to use for animation
     *
     * @remarks
     * Values
     * - `"ease"`
     *   - Transition starts at a constant speed and ends slowing down
     * - `"linear"`
     *   - Straight point-to-point animation
     * - `"ease-in"`
     *   - Transition starts slow and continues in a constant speed
     * - `"ease-out"`
     *   - Transition starts at a constant speed and ends slowing down
     * - `"ease-in-out"`
     *   - Transition starts slow, continues at a constant speed, and ends slowing down
     * - `"step-start"`
     *   - Transition steps to start position
     * - `"step-end"`
     *   - Transition steps to end position
     * - `"cubic-bezier(a,b,c,d)"`
     *   - Custom bezier curve (See: [cubic-bezier.com](https://cubic-bezier.com/))
     *
     * See [Timing Function Settings](https://lightningjs.io/docs/#/lightning-core-reference/Transitions/Attributes?id=timing-function-settings)
     * for more information.
     *
     * @defaultValue `"ease"`
     */
    timingFunction?: TimingFunction;
  }
}



declare class TransitionSettings implements TransitionSettings.Literal {
  constructor(stage: Stage);
  delay: number;
  duration: number;
  isTransitionSettings: boolean;

  get timingFunction(): TransitionSettings.TimingFunction;
  set timingFunction(timingFunction: TransitionSettings.TimingFunction);
}

export default TransitionSettings;
