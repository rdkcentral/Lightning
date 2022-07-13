import Stage from "../tree/Stage.mjs";

declare namespace TransitionSettings {
  /**
   * Timing function types
   *
   * @remarks
   * See [Timing Function Settings](https://lightningjs.io/docs/#/lightning-core-reference/Transitions/Attributes?id=timing-function-settings)
   * for more information
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
     * See [Timing Function Settings](https://lightningjs.io/docs/#/lightning-core-reference/Transitions/Attributes?id=timing-function-settings)
     * for more information
     *
     * @defaultValue `'ease'`
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
