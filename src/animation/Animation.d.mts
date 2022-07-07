import AnimationSettings from "./AnimationSettings.mjs";

declare namespace Animation {
  /**
   * @see {@link Animation.STATES} for value enum
   */
  type State = typeof Animation['STATES'][keyof typeof Animation['STATES']];
}

declare class Animation {
  start(): void;
  play(): void;
  pause(): void;
  replay(): void;
  skipDelay(): void;
  finish(): void;
  stop(): void;
  stopNow(): void;
  isPaused(): boolean;
  isPlaying(): boolean;
  isStopping(): boolean;
  isFinished(): boolean;
  checkActive(): void;
  isActive(): boolean;
  progress(dt: number): void;
  on(event: string, handler: () => void): void;

  get settings(): AnimationSettings;
  get state(): Animation.State;

  static STATES: {
    IDLE: 0,
    PLAYING: 1,
    STOPPING: 2,
    STOPPED: 3,
    FINISHED: 4,
    PAUSED: 5
  };
}

export default Animation;