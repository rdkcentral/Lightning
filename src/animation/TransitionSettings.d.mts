import Stage from "../tree/Stage.mjs";

declare namespace TransitionSettings {
  export type TimingFunction =
    | 'linear'
    | 'ease'
    | 'ease-in'
    | 'ease-out'
    | 'ease-in-out'
    | 'step-start'
    | 'step-end'
    | `cubic-bezier(${string})`;

  export interface Literal {
    delay?: number;
    duration?: number;
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
