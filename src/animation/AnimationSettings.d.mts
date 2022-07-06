import AnimationActionSettings from "./AnimationActionSettings.mjs";

declare namespace AnimationSettings {
  /**
   * @see {@link AnimationSettings.STOP_METHODS}
   */
  export type StopMethod = typeof AnimationSettings['STOP_METHODS'][keyof typeof AnimationSettings['STOP_METHODS']];

  export interface Literal {
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
    actions: Array<AnimationActionSettings.Literal>;

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
     */
    stopMethod?: StopMethod;

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

declare class AnimationSettings implements AnimationSettings.Literal {
  constructor();

  duration: number;
  repeat: number;
  stopMethod: AnimationSettings.StopMethod;
  get actions(): Array<AnimationActionSettings>;
  set actions(v: Array<AnimationActionSettings>);

  /**
   * Stop Methods
   */
  static STOP_METHODS: {
    /**
     * Fade
     *
     * @remarks
     * ???
     */
    FADE: 'fade',
    /**
     * Reverse
     *
     * @remarks
     * ???
     */
    REVERSE: 'reverse',
    /**
     * Forward
     *
     * @remarks
     * ???
     */
    FORWARD: 'forward',
    /**
     * Immediate
     *
     * @remarks
     * ???
     */
    IMMEDIATE: 'immediate',
    /**
     * One-to-Two
     *
     * @remarks
     * A special stop method. Its action ranges are defined from progress 0 to 2,
     * instead of 0 to 1. When stopping, the current animation is continued normally
     * (up to progress 1), and then the progress is continued up to value 2.
     */
    ONETOTWO: 'onetotwo'
  };
}

export default AnimationSettings;
