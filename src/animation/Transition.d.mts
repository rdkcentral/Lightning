import EventEmitter from "../EventEmitter.mjs";
import Element from "../tree/Element.mjs";
import TransitionManager from "./TransitionManager.mjs";
import TransitionSettings from "./TransitionSettings.mjs";

export default class Transition extends EventEmitter {
  isTransition: boolean;

  constructor(
    manager: TransitionManager,
    settings: TransitionSettings,
    element: Element,
    property: string,
  );

  start(v: number): void;
  finish(): void;
  stop(): void;
  pause(): void;
  /**
   * We should be careful:
   * If for any reason we start playing the transition but we haven't reset the transition value of,
   * we will end up using the previous transition value
   */
  play(): void;
  // reset()

  isAttached(): boolean;
  isRunning(): boolean;

  /**
   * @deprecated
   * This should not be used as it may affect the settings on other components when using the defaults
   get settings(): TransitionSettings;
    */

  set settings(v: TransitionSettings);

  get targetValue(): number;
}
