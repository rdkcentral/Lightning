import AnimationSettings from "./AnimationSettings.mjs";
import AnimationActionSettings from "./AnimationActionSettings.mjs";
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
  createSettings(settings: AnimationActionSettings.Literal): AnimationSettings;
  progress(): void;
}
