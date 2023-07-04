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
import AnimationManager from "./AnimationManager.mjs";
import AnimationSettings from "./AnimationSettings.mjs";
import Element from "../tree/Element.mjs";


declare namespace Animation {
  /**
   * @see {@link Animation.STATES} for value enum
   */
  export type State = typeof Animation['STATES'][keyof typeof Animation['STATES']];

  /**
   * Animation Event Map
   *
   * See [Animations - Events](https://lightningjs.io/docs/#/lightning-core-reference/Animations/Events) for
   * more information.
   */
  export interface EventMap {
    /**
     * Animation starts
     */
    start(): void;
    /**
     * Animation finished
     */
    finish(): void;
    /**
     * Paused animation is resumed
     */
    resume(): void;
    /**
     * Paused animation that was stopping, is resumed
     */
    stopContinue(): void;
    /**
     * Animation is paused
     */
    pause(): void;
    /**
     * Animation is stopped
     */
    stop(): void;
    /**
     * Animation finished stopping
     */
    stopFinish(): void;
    /**
     * Delay has ended
     */
    delayEnd(): void;
    /**
     * Animation has progressed
     *
     * @param p progress value between 0 and 1 (or 0 and 2 in case of stopMethod onetotwo)
     */
    progress(p: number): void;
    /**
     * Animation repeats
     *
     * @param repeatsLeft number of repeats left
     */
    repeat(repeatsLeft: number): void;
    /**
     * Stop delay has ended
     */
    stopDelayEnd(): void;
  }
}

/**
 * Represents an Animation of an Element
 *
 * @remarks
 * Animations can be created by calling {@link Element.animation} on any {@link Element}.
 *
 * See [Animations](https://lightningjs.io/docs/#/lightning-core-reference/Animations/index) for
 * more information.
 */
declare class Animation extends EventEmitter<Animation.EventMap> {
  /**
   * Animation manager
   */
  readonly manager: AnimationManager;

  // _settings: any;
  // _element: any;
  // _state: any;
  // _p: any;
  // _delayLeft: any;
  // _repeatsLeft: any;
  // _stopDelayLeft: any;
  // _stopP: any;
  // - Private properties

  /**
   * Constructor
   *
   * @param manager
   * @param settings
   * @param element
   */
  constructor(manager: AnimationManager, settings: AnimationSettings, element: Element);

  /**
   * Start (or restart, if already running) the animation
   */
  start(): void;

  /**
   * If playing (or stopped) then start. If paused, continue. If playing or finished, ignored.
   */
  play(): void;

  /**
   * If playing, then stop at the current position (can be resumed by calling {@link play})
   */
  pause(): void;

  /**
   * Same as {@link play}, but if currently finished, then restart.
   */
  replay(): void;

  /**
   * If currently waiting for the {@link AnimationSettings.Literal.stopDelay stopDelay}, skip it and continue
   */
  skipDelay(): void;

  /**
   * If currently playing, fast-forward the animation to the end. If stopping, fast forward it to the end of the stop
   * animation.
   */
  finish(): void;

  /**
   * Stop the animation (effect depends on the {@link AnimationSettings.Literal.stopMethod stopMethod} and properties)
   */
  stop(): void;

  /**
   * Stop the animation immediately (as if the {@link AnimationSettings.Literal.stopMethod stopMethod} ‘immediate’ was set)
   */
  stopNow(): void;

  /**
   * Returns ‘true’ if the current state is {@link Animation.STATES.PAUSED}
   */
  isPaused(): boolean;

  /**
   * Returns ‘true’ if the current state is {@link Animation.STATES.PLAYING}
   */
  isPlaying(): boolean;

  /**
   * Returns ‘true’ if the current state is {@link Animation.STATES.STOPPING}
   */
  isStopping(): boolean;

  /**
   * Returns ‘true’ if the current state is {@link Animation.STATES.FINISHED}
   */
  isFinished(): boolean;

  // checkActive(): void;
  // - Internal use only

  /**
   * Returns ‘true’ if the animation is currently progressing (playing or stopping)
   */
  isActive(): boolean;

  /**
   * Manually progress the animation forward by `dt` seconds
   *
   * @param dt
   */
  progress(dt: number): void;
  // _progress(dt: any): void;
  // _stopProgress(dt: any): void;
  // _progressStopTransition(dt: any): void;
  // _getStopDuration(): any;
  // apply(): void;
  // reset(): void;
  // - Internal use only

  /**
   * Gets the current state of the animation
   *
   * @remarks
   * See {@link Animation.STATES} for a description of each state
   */
  get state(): Animation.State;

  /**
   * Gets the current progress point
   *
   * @remarks
   * This is always a value betwen `0.0` and `1.0`
   */
  get p(): number;

  /**
   * Gets the amount of delay left (in seconds) before the animation starts
   */
  get delayLeft(): number;

  /**
   * Gets the {@link Element} that is being animated
   */
  get element(): Element;

  /**
   * Gets the current frame number of the animation expressed in 60fps
   */
  get frame(): number;

  /**
   * Gets the settings for this animation
   */
  get settings(): AnimationSettings;

  /**
   * Animation State Enum
   */
  static STATES: {
    /**
     * Animation has never been played
     */
    IDLE: 0,
    /**
     * Animation is currently playing
     *
     * @remarks
     * Entered by a call to {@link Animation.play}
     */
    PLAYING: 1,
    /**
     * Animation is currently executing its stop animation
     *
     * @remarks
     * The stop animation is determined by {@link AnimationSettings.Literal.stopMethod stopMethod}.
     *
     * Entered by a call to {@link Animation.stop}
     */
    STOPPING: 2,
    /**
     * Animation has finished its stop animation (if there was one)
     */
    STOPPED: 3,
    /**
     * Animation has finished playing (uninterrupted from from start to finish)
     */
    FINISHED: 4,
    /**
     * Animation is paused
     *
     * @remarks
     * Entered by a call to {@link Animation.pause} while the animation is {@link PLAYING}.
     */
    PAUSED: 5
  };
}

export default Animation;