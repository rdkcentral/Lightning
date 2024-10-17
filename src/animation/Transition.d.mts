/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2022 Metrological
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import EventEmitter from "../EventEmitter.mjs";
import Element from "../tree/Element.mjs";
import TransitionManager from "./TransitionManager.mjs";
import TransitionSettings from "./TransitionSettings.mjs";

declare namespace Transition {
  /**
   * Transition Event Map
   *
   * See [Transitions - Events](https://lightningjs.io/docs/#/lightning-core-reference/Transitions/Events) for
   * more information.
   */
   export interface EventMap {
    /**
     * Transition starts
     */
    start(): void;
    /**
     * Transition finished
     */
    finish(): void;
    /**
     * Transition is stopped
     */
    stop(): void;
    /**
     * Transition delay has ended
     */
    delayEnd(): void;
    /**
     * Transition has progressed
     *
     * @param p progress value between 0 and 1
     */
    progress(p: number): void;
  }
}

declare class Transition extends EventEmitter<Transition.EventMap> {
  isTransition: true;

  /**
   * Constructor
   *
   * @param manager
   * @param settings
   * @param element
   * @param property
   */
  constructor(
    manager: TransitionManager,
    settings: TransitionSettings,
    element: Element,
    property: string,
  );

  /**
   * Starts the transition
   *
   * @param targetValue
   */
  start(targetValue: number): void;

  /**
   * Fast-forwards the transition (to the target value)
   */
  finish(): void;

  /**
   * Stops the transition (at the current value)
   */
  stop(): void;

  /**
   * Alias for {@link stop}
   */
  pause(): void;

  /**
   * Resumes the paused transition
   */
  play(): void;

  /**
   * Sets the transition at a specific point in time
   *
   * @param targetValue
   * @param p Progress value between 0 and 1
   */
  reset(targetValue: number, p: number): void;

  // _updateDrawValue(): void;
  // add(): void;
  // - Private

  /**
   * Returns `true` if the {@link Element} associated to the transition
   * is attached to the [Render Tree](https://lightningjs.io/docs/#/lightning-core-reference/RenderEngine/RenderTree?id=render-tree).
   */
  isAttached(): boolean;

  /**
   * Returns `true` if the transition is running
   */
  isRunning(): boolean;

  // progress(dt: any): void;
  // - Only used internally, called by TransitionManager
  // invokeListeners(): void;
  // - Private

  /**
   * Update the target value while keeping the current progress and value
   *
   * @param targetValue
   */
  updateTargetValue(targetValue: number): void;

  // getDrawValue(): any;
  // - Private

  /**
   * Skips the delay of an already started transition
   */
  skipDelay(): void;

  /**
   * Start value of the in-progress transition
   *
   * @remarks
   * Valid only while transition is in-progress.
   */
  get startValue(): number;

  /**
   * Target value of the in-progress transition
   *
   * @remarks
   * Valid only while transition is in-progress.
   */
  get targetValue(): number;

  /**
   * Current progress of transition
   *
   * @remarks
   * This is a value between `0` (start of transition) and `1` (end of transition)
   */
  get p(): number;

  /**
   * Delay left of in-progress transition (in seconds)
   *
   * @remarks
   * Valid only while transition is in-progress.
   */
  get delayLeft(): number;

  /**
   * Element associated with the transition
   */
  get element(): Element;

  /**
   * Gets/sets the settings associated with the transition
   */
  get settings(): TransitionSettings;
  set settings(v: TransitionSettings);
}

export default Transition;
