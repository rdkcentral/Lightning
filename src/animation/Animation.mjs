import EventEmitter from "../EventEmitter.mjs";
import AnimationSettings from "./AnimationSettings.mjs";

export default class Animation extends EventEmitter {

    constructor(manager, settings, element) {
        super();

        this.manager = manager;

        this._settings = settings;

        this._element = element;

        this._state = Animation.STATES.IDLE;

        this._p = 0;
        this._delayLeft = 0;
        this._repeatsLeft = 0;

        this._stopDelayLeft = 0;
        this._stopP = 0;
    }

    start() {
        if (this._element && this._element.attached) {
            this._p = 0;
            this._delayLeft = this.settings.delay;
            this._repeatsLeft = this.settings.repeat;
            this._state = Animation.STATES.PLAYING;
            this.emit('start');
            this.checkActive();
        } else {
            console.warn("Element must be attached before starting animation");
        }
    }

    play() {
        if (this._state === Animation.STATES.PAUSED) {
            // Continue.;
            this._state = Animation.STATES.PLAYING;
            this.checkActive();
            this.emit('resume');
        } else if (this._state == Animation.STATES.STOPPING && this.settings.stopMethod == AnimationSettings.STOP_METHODS.REVERSE) {
            // Continue.;
            this._state = Animation.STATES.PLAYING;
            this.emit('stopContinue');
        } else if (this._state != Animation.STATES.PLAYING && this._state != Animation.STATES.FINISHED) {
            // Restart.;
            this.start();
        }
    }

    pause() {
        if (this._state === Animation.STATES.PLAYING) {
            this._state = Animation.STATES.PAUSED;
            this.emit('pause');
        }
    }

    replay() {
        if (this._state == Animation.STATES.FINISHED) {
            this.start();
        } else {
            this.play();
        }
    }

    skipDelay() {
        this._delayLeft = 0;
        this._stopDelayLeft = 0;
    }

    finish() {
        if (this._state === Animation.STATES.PLAYING) {
            this._delayLeft = 0;
            this._p = 1;
        } else if (this._state === Animation.STATES.STOPPING) {
            this._stopDelayLeft = 0;
            this._p = 0;
        }
    }

    stop() {
        if (this._state === Animation.STATES.STOPPED || this._state === Animation.STATES.IDLE) return;

        this._stopDelayLeft = this.settings.stopDelay || 0;

        if (((this.settings.stopMethod === AnimationSettings.STOP_METHODS.IMMEDIATE) && !this._stopDelayLeft) || this._delayLeft > 0) {
            // Stop upon next progress.;
            this._state = Animation.STATES.STOPPING;
            this.emit('stop');
        } else {
            if (this.settings.stopMethod === AnimationSettings.STOP_METHODS.FADE) {
                this._stopP = 0;
            }

            this._state = Animation.STATES.STOPPING;
            this.emit('stop');
        }

        this.checkActive();
    }

    stopNow() {
        if (this._state !== Animation.STATES.STOPPED || this._state !== Animation.STATES.IDLE) {
            this._state = Animation.STATES.STOPPING;
            this._p = 0;
            this.emit('stop');
            this.reset();
            this._state = Animation.STATES.STOPPED;
            this.emit('stopFinish');
        }
    }

    isPaused() {
        return this._state === Animation.STATES.PAUSED;
    }

    isPlaying() {
        return this._state === Animation.STATES.PLAYING;
    }

    isStopping() {
        return this._state === Animation.STATES.STOPPING;
    }

    isFinished() {
        return this._state === Animation.STATES.FINISHED;
    }

    checkActive() {
        if (this.isActive()) {
            this.manager.addActive(this);
        }
    }

    isActive() {
        return (this._state == Animation.STATES.PLAYING || this._state == Animation.STATES.STOPPING) && this._element && this._element.attached;
    }

    progress(dt) {
        if (!this._element) return;
        this._progress(dt);
        this.apply();
    }

    _progress(dt) {
        if (this._state == Animation.STATES.STOPPING) {
            this._stopProgress(dt);
            return;
        }

        if (this._state != Animation.STATES.PLAYING) {
            return;
        }

        if (this._delayLeft > 0) {
            this._delayLeft -= dt;

            if (this._delayLeft < 0) {
                dt = -this._delayLeft;
                this._delayLeft = 0;

                this.emit('delayEnd');
            } else {
                return;
            }
        }

        if (this.settings.duration === 0) {
            this._p = 1;
        } else if (this.settings.duration > 0) {
            this._p += dt / this.settings.duration;
        }
        if (this._p >= 1) {
            // Finished!;
            if (this.settings.repeat == -1 || this._repeatsLeft > 0) {
                if (this._repeatsLeft > 0) {
                    this._repeatsLeft--;
                }
                this._p = this.settings.repeatOffset;

                if (this.settings.repeatDelay) {
                    this._delayLeft = this.settings.repeatDelay;
                }

                this.emit('repeat', this._repeatsLeft);
            } else {
                this._p = 1;
                this._state = Animation.STATES.FINISHED;
                this.emit('finish');
                if (this.settings.autostop) {
                    this.stop();
                }
            }
        } else {
            this.emit('progress', this._p);
        }
    }
    
    _stopProgress(dt) {
        let duration = this._getStopDuration();

        if (this._stopDelayLeft > 0) {
            this._stopDelayLeft -= dt;

            if (this._stopDelayLeft < 0) {
                dt = -this._stopDelayLeft;
                this._stopDelayLeft = 0;

                this.emit('stopDelayEnd');
            } else {
                return;
            }
        }
        if (this.settings.stopMethod == AnimationSettings.STOP_METHODS.IMMEDIATE) {
            this._state = Animation.STATES.STOPPED;
            this.emit('stopFinish');
        } else if (this.settings.stopMethod == AnimationSettings.STOP_METHODS.REVERSE) {
            if (duration === 0) {
                this._p = 0;
            } else if (duration > 0) {
                this._p -= dt / duration;
            }

            if (this._p <= 0) {
                this._p = 0;
                this._state = Animation.STATES.STOPPED;
                this.emit('stopFinish');
            }
        } else if (this.settings.stopMethod == AnimationSettings.STOP_METHODS.FADE) {
            this._progressStopTransition(dt);
            if (this._stopP >= 1) {
                this._p = 0;
                this._state = Animation.STATES.STOPPED;
                this.emit('stopFinish');
            }
        } else if (this.settings.stopMethod == AnimationSettings.STOP_METHODS.ONETOTWO) {
            if (this._p < 2) {
                if (duration === 0) {
                    this._p = 2;
                } else if (duration > 0) {
                    if (this._p < 1) {
                        this._p += dt / this.settings.duration;
                    } else {
                        this._p += dt / duration;
                    }
                }
                if (this._p >= 2) {
                    this._p = 2;
                    this._state = Animation.STATES.STOPPED;
                    this.emit('stopFinish');
                } else {
                    this.emit('progress', this._p);
                }
            }
        } else if (this.settings.stopMethod == AnimationSettings.STOP_METHODS.FORWARD) {
            if (this._p < 1) {
                if (this.settings.duration == 0) {
                    this._p = 1;
                } else {
                    this._p += dt / this.settings.duration;
                }
                if (this._p >= 1) {
                    if (this.settings.stopMethod == AnimationSettings.STOP_METHODS.FORWARD) {
                        this._p = 1;
                        this._state = Animation.STATES.STOPPED;
                        this.emit('stopFinish');
                    } else {
                        if (this._repeatsLeft > 0) {
                            this._repeatsLeft--;
                            this._p = 0;
                            this.emit('repeat', this._repeatsLeft);
                        } else {
                            this._p = 1;
                            this._state = Animation.STATES.STOPPED;
                            this.emit('stopFinish');
                        }
                    }
                } else {
                    this.emit('progress', this._p);
                }
            }
        }
        
    }
    
    _progressStopTransition(dt) {
        if (this._stopP < 1) {
            if (this._stopDelayLeft > 0) {
                this._stopDelayLeft -= dt;

                if (this._stopDelayLeft < 0) {
                    dt = -this._stopDelayLeft;
                    this._stopDelayLeft = 0;

                    this.emit('delayEnd');
                } else {
                    return;
                }
            }
            
            const duration = this._getStopDuration();

            if (duration == 0) {
                this._stopP = 1;
            } else {
                this._stopP += dt / duration;
            }
            if (this._stopP >= 1) {
                // Finished!;
                this._stopP = 1;
            }
        }
    }

    _getStopDuration() {
        return this.settings.stopDuration || this.settings.duration;
    }

    apply() {
        if (this._state === Animation.STATES.STOPPED) {
            this.reset();
        } else {
            let factor = 1;
            if (this._state === Animation.STATES.STOPPING && this.settings.stopMethod === AnimationSettings.STOP_METHODS.FADE) {
                factor = (1 - this.settings.stopTimingFunctionImpl(this._stopP));
            }
            this._settings.apply(this._element, this._p, factor);
        }
    }

    reset() {
        this._settings.reset(this._element);
    }

    get state() {
        return this._state;
    }

    get p() {
        return this._p;
    }

    get delayLeft() {
        return this._delayLeft;
    }

    get element() {
        return this._element;
    }

    get frame() {
        return Math.round(this._p * this._settings.duration * 60);
    }

    get settings() {
        return this._settings;
    }

}

Animation.STATES = {
    IDLE: 0,
    PLAYING: 1,
    STOPPING: 2,
    STOPPED: 3,
    FINISHED: 4,
    PAUSED: 5
}