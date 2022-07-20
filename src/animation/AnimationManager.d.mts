import AnimationSettings from "./AnimationSettings.mjs";
import Stage from "../tree/Stage.mjs";
import Animation from "./Animation.mjs";
import Element from "../tree/Element.mjs";

export default class AnimationManager {
  constructor(stage: Stage);

  addActive(animation: Animation): void;
  createAnimation(
    element: Element,
    settings: AnimationSettings | AnimationSettings.Literal,
  ): Animation;
  createSettings(settings: AnimationSettings.Literal): AnimationSettings;
  progress(): void;
}
