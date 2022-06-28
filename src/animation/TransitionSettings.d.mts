import Stage from "../tree/Stage.mjs";
import StageUtils from "../tree/StageUtils.mjs";

declare namespace TransitionSettings {
  export interface Literal {  // !!! Rename
    delay?: number;
    duration?: number;
    timingFunction?: StageUtils.TimingFunction;
  }
}



declare class TransitionSettings implements TransitionSettings.Literal {
  constructor(stage: Stage);
  delay: number;
  duration: number;
  isTransitionSettings: boolean;

  get timingFunction(): StageUtils.TimingFunction;
  set timingFunction(timingFunction: StageUtils.TimingFunction);
}

export default TransitionSettings;
