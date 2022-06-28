import AnimationActionSettings from "./AnimationActionSettings.mjs";
import StageUtils from "../tree/StageUtils.mjs";

declare namespace AnimationSettings {
  export type StopMethod = typeof AnimationSettings['STOP_METHODS'][keyof typeof AnimationSettings['STOP_METHODS']];

  export interface Literal {
    actions: Array<AnimationActionSettings.Literal>;
    delay?: number;
    duration: number;
    repeat?: number;
    stopMethod?: StopMethod;
    timingFunction?: StageUtils.TimingFunction;
  }
}

declare class AnimationSettings implements AnimationSettings.Literal {
  constructor();

  duration: number;
  repeat: number;
  stopMethod: AnimationSettings.StopMethod;
  get actions(): Array<AnimationActionSettings>;
  set actions(v: Array<AnimationActionSettings>);

  static STOP_METHODS: {
    FADE: 'fade',
    REVERSE: 'reverse',
    FORWARD: 'forward',
    IMMEDIATE: 'immediate',
    ONETOTWO: 'onetotwo'
  };
}

export default AnimationSettings;
