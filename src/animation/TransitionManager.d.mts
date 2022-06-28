import Stage from "../tree/Stage.mjs";
import Transition from "./Transition.mjs";
import TransitionSettings from "./TransitionSettings.mjs";

export default class TransitionManager {
  defaultTransitionSettings: TransitionSettings;

  constructor(stage: Stage);

  active: Set<Transition>;

  progress(): void;
  createSettings(settings: TransitionSettings.Literal): TransitionSettings;
  addActive(transition: Transition): void;
  removeActive(transition: Transition): void;
}