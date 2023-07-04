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
import AnimationActionSettings from "./AnimationActionSettings.mjs";
import Element from "../tree/Element.mjs";
import { AnimatableValueTypes, ExtractAnimatableValueTypes } from "../commonTypes.mjs";
import TransitionSettings from "../animation/TransitionSettings.mjs"; // Documenation

declare namespace AnimationSettings {
  /**
   * @see {@link AnimationSettings.STOP_METHODS}
   */
  export type StopMethod = typeof AnimationSettings['STOP_METHODS'][keyof typeof AnimationSettings['STOP_METHODS']];

  /**
   * Animation Settings object literal
   *
   * @remarks
   * See [Animation Attributes](https://lightningjs.io/docs/#/lightning-core-reference/Animations/Attributes) for more
   * information.
   */
  export interface Literal<
    TemplateSpecType = Element.TemplateSpec,
    Key = keyof TemplateSpecType | AnimationForceLiteral,
  > {
    /**
     * Animation Actions
     *
     * @remarks
     * Each member of this array defines how a particular property will animate during
     * the animation's {@link duration}. Any number of properties may be animated at
     * the same time.
     *
     * @defaultValue `[]`
     */
    actions: Array<
      Key extends AnimationForceLiteral
        ?
          AnimationActionSettings.Literal<Key, AnimationForceType<Key>>
        :
          Key extends keyof TemplateSpecType // This splits up the individual string literal union of Key (if it is a union)
            ?
              AnimationActionSettings.Literal<Key, ExtractAnimatableValueTypes<TemplateSpecType[Key]>>
            :
              never
    >;

    /**
     * Delay (in seconds)
     *
     * @remarks
     * Number of seconds to delay an animation from actually beginning after
     * it's triggered to start.
     *
     * @defaultValue `0`
     */
    delay?: number;

    /**
     * Duration (in seconds)
     *
     * @remarks
     * Number of seconds to run the animation after any {@link delay}.
     *
     * @defaultValue `1`
     */
    duration: number;

    /**
     * Repeat Count
     *
     * @remarks
     * Number of times to repeat the animation after it finishes for the first
     * time.
     *
     * - `-1` = Repeat infinitely
     * - `0` = Animate once, but do not repeat
     * - `>= 1` = Repeat animation this number of times
     *
     * @defaultValue `0`
     */
    repeat?: number;

    /**
     * Repeat Offset
     *
     * @remarks
     * A progress value between `0` and `1.0` where the animation will restart before
     * each repeat.
     *
     * @defaultValue `0`
     */
    repeatOffset?: number;

    /**
     * Repeat Delay (in seconds)
     *
     * @remarks
     * Number of seconds to delay every repeat of an animation.
     *
     * @defaultValue `0`
     */
    repeatDelay?: number;

    /**
     * Stop Method
     *
     * @remarks
     * Method that defines the behavior of the animation when it is stopped.
     *
     * @defaultValue `fade`
     *
     * @see {@link AnimationSettings.STOP_METHODS}
     */
    stopMethod?: StopMethod;

    /**
     * Stop Duration
     *
     * @remarks
     * Duration in seconds of stopping
     *
     * @defaultValue `0` (use {@link duration})
     */
    stopDuration?: number;

    /**
     * Stop Delay
     *
     * @remarks
     * Delay in seconds before stopping.
     *
     * @defaultValue `0`
     */
    stopDelay?: number;

    /**
     * Automatic Stop
     *
     * @remarks
     * If `true`, after the animation is finished, it is automatically stopped.
     *
     * @defaultValue `false`
     */
    autostop?: boolean;
  }
}

export type AnimationForceLiteral = '$$number' | '$$string' | '$$boolean';

export type AnimationForceType<T extends AnimationForceLiteral> =
  T extends '$$number'
    ?
      number
    :
      T extends '$$string'
        ?
          string
        :
          T extends '$$boolean'
            ?
              boolean
            :
              never;


declare class AnimationSettings {
  // STUB

  /**
   * Stop Methods
   */
  static STOP_METHODS: {
    /**
     * Transitions the animating properties using the {@link TransitionSettings.Literal.timingFunction `"ease"` timing function}
     * to their {@link AnimationActionSettings.Literal.rv reset values} using the {@link AnimationSettings.Literal.stopDuration stopDuration}.
     *
     * @remarks
     * If the reset value is not set for a property, the starting value is used instead.
     *
     * If the stopDuration is not provided, the regular {@link AnimationSettings.Literal.duration duration} is used instead.
     */
    FADE: 'fade',
    /**
     * Reverses animation back to its starting point using the {@link AnimationSettings.Literal.stopDuration stopDuration}.
     *
     * @remarks
     * If the stopDuration is not provided, the regular {@link AnimationSettings.Literal.duration duration} is used instead.
     *
     * Note: If any of the animating properties have a {@link AnimationActionSettings.Literal.rv reset value} set the
     * they will be set immediately to those values after the stop animation completes. If you do not want this, make
     * sure not to set them.
     */
    REVERSE: 'reverse',
    /**
     * Animation continues forward to its normal finish state and then immediately sets the animating properties
     * to their {@link AnimationActionSettings.Literal.rv reset values}.
     *
     * @remarks
     * If the reset value is not set for a property, the starting value is used instead.
     */
    FORWARD: 'forward',
    /**
     * Animation immediately stops and sets the animating properties to their
     * {@link AnimationActionSettings.Literal.rv reset values}.
     *
     * @remarks
     * If the reset value is not set for a property, the starting value is used instead.
     */
    IMMEDIATE: 'immediate',
    /**
     * A special stop method. It's action ranges are defined from progress `0.0` to `2.0`,
     * instead of `0.0` to `1.0`. When stopping, the current animation is continued normally
     * (up to progress 1), then the progress is continued up to value 2, and then the animating properties
     * are immediately set to their {@link AnimationActionSettings.Literal.rv reset values}.
     *
     * @remarks
     * If the reset value is not set for a property, the starting value is used instead.
     */
    ONETOTWO: 'onetotwo'
  };
}

export default AnimationSettings;
