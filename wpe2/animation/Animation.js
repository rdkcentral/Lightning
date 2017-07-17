class Animation extends Base {

    constructor(manager, settings, view) {
        super();

        EventEmitter.call(this);

        this.manager = manager;

        this._settings = settings;

        this._view = view;

        this._state = Animation.STATES.IDLE;
    }

    _properties() {
        this._p = 0;
        this._delayLeft = 0;
        this._repeatsLeft = 0;
        
        this._stopDelayLeft = 0;
        this._stopP = 0;
    }

    start() {
        this._p = 0;
        this._delayLeft = this.settings.delay;
        this._repeatsLeft = this.settings.repeat;
        this._state = Animation.STATES.PLAYING;
        if (this._eventsCount) this.emit('start');
        if (this._view) {
            this.checkActive();
        }
    }

    play() {
        if (this._state == Animation.STATES.STOPPING && this.settings.stopMethod == AnimationSettings.STOP_METHODS.REVERSE) {
            // Continue.
            this._state = Animation.STATES.PLAYING;
            if (this._eventsCount) this.emit('stopContinue');
        } else if (this._state != Animation.STATES.PLAYING && this._state != Animation.STATES.FINISHED) {
            // Restart.
            this.start();
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

        if (this._view) {
            this.checkActive();
        }

        this._stopDelayLeft = this.settings.stopDelay || 0;

        if (((this.settings.stopMethod === AnimationSettings.STOP_METHODS.IMMEDIATE) && !this._stopDelayLeft) || this._delayLeft > 0) {
            // Stop upon next progress.
            this._state = Animation.STATES.STOPPING;
            if (this._eventsCount) this.emit('stop');
        } else {
            if (this.settings.stopMethod === AnimationSettings.STOP_METHODS.FADE) {
                this._stopP = 0;
            }

            this._state = Animation.STATES.STOPPING;
            if (this._eventsCount) this.emit('stop');
        }
    }

    stopNow() {
        if (this._state !== Animation.STATES.STOPPED || this._state !== Animation.STATES.IDLE) {
            this._state = Animation.STATES.STOPPING;
            this._p = 0;
            if (this._eventsCount) this.emit('stop');
            this.reset();
            this._state = Animation.STATES.STOPPED;
            if (this._eventsCount) this.emit('stopFinish');
        }
    }

    isPlaying() {
        return this._state === Animation.STATES.PLAYING;
    }

    isStopping() {
        return this._state === Animation.STATES.STOPPING;
    }

    checkActive() {
        if (this.isActive()) {
            this.manager.addActive(this);
        }
    }

    isActive() {
        return (this._state == Animation.STATES.PLAYING || this._state == Animation.STATES.STOPPING) && this._view && this._view.isAttached();
    }

    progress(dt) {
        if (!this._view) return;
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

                if (this._eventsCount) this.emit('delayEnd');
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
            // Finished!
            if (this.settings.repeat == -1 || this._repeatsLeft > 0) {
                if (this._repeatsLeft > 0) {
                    this._repeatsLeft--;
                }
                this._p = this._repeatOffset;

                if (this.settings.repeatDelay) {
                    this._delayLeft = this.settings.repeatDelay;
                }

                if (this._eventsCount) this.emit('repeat', this._repeatsLeft);
            } else {
                this._p = 1;
                this._state = Animation.STATES.FINISHED;
                if (this._eventsCount) this.emit('finish');
                if (this.settings.autostop) {
                    this.stop();
                }
            }
        } else {
            if (this._eventsCount) this.emit('progress', this._p);
        }
    }
    
    _stopProgress(dt) {
        let duration = this._getStopDuration();

        if (this._stopDelayLeft > 0) {
            // Animation wasn't even started yet: directly finish!
            this._state = Animation.STATES.STOPPED;
            if (this._eventsCount) this.emit('stopFinish');
        }

        if (this._stopDelayLeft > 0) {
            this._stopDelayLeft -= dt;

            if (this._stopDelayLeft < 0) {
                dt = -this._stopDelayLeft;
                this._stopDelayLeft = 0;

                if (this._eventsCount) this.emit('stopDelayEnd');
            } else {
                return;
            }
        }
        if (this.settings.stopMethod == AnimationSettings.STOP_METHODS.IMMEDIATE) {
            this._state = Animation.STATES.STOPPED;
            if (this._eventsCount) this.emit('stop');
            if (this._eventsCount) this.emit('stopFinish');
        } else if (this.settings.stopMethod == AnimationSettings.STOP_METHODS.REVERSE) {
            if (duration === 0) {
                this._p = 0;
            } else if (duration > 0) {
                this._p -= dt / duration;
            }

            if (this._p <= 0) {
                this._p = 0;
                this._state = Animation.STATES.STOPPED;
                if (this._eventsCount) this.emit('stopFinish');
            }
        } else if (this.settings.stopMethod == AnimationSettings.STOP_METHODS.FADE) {
            this._progressStopTransition(dt);
            if (this._stopP >= 1) {
                this._p = 0;
                this._state = Animation.STATES.STOPPED;
                if (this._eventsCount) this.emit('stopFinish');
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
                    if (this._eventsCount) this.emit('stopFinish');
                } else {
                    if (this._eventsCount) this.emit('progress', this._p);
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
                        if (this._eventsCount) this.emit('stopFinish');
                    } else {
                        if (this._repeatsLeft > 0) {
                            this._repeatsLeft--;
                            this._p = 0;
                            if (this._eventsCount) this.emit('repeat', this._repeatsLeft);
                        } else {
                            this._p = 1;
                            this._state = Animation.STATES.STOPPED;
                            if (this._eventsCount) this.emit('stopFinish');
                        }
                    }
                } else {
                    if (this._eventsCount) this.emit('progress', this._p);
                }
            }
        }
        
    }
    
    _progressStopTransition(dt) {
        if (this._stopP < 1) {
            if (this._stopDelayLeft > 0) {
                this._stopDelayLeft -= dt;

                if (this._stopDelayLeft < 0) {
                    dt = -this.stopDelayLeft;
                    this._stopDelayLeft = 0;

                    if (this._eventsCount) this.emit('delayEnd');
                } else {
                    return;
                }
            }
            
            let duration = this._getStopDuration();

            if (duration == 0) {
                this._stopP = 1;
            } else {
                this._stopP += dt / duration;
            }
            if (this._stopP >= 1) {
                // Finished!
                this._stopP = 1;
            }
        }
    }

    _getStopDuration() {
        return this.settings.stopDuration || this.settings.duration;
    }

    apply() {
        if (this._state == Animation.STATES.STOPPED) {
            this.reset();
        } else {
            let factor = 1;
            if (this._state === Animation.STATES.STOPPING && this.settings.stopMethod === AnimationSettings.STOP_METHODS.FADE) {
                factor = (1 - this.settings.stopTimingFunctionImpl(this._stopP));
            }
            this._settings.apply(this._view, this._p, factor);
        }
    }

    reset() {
        this._settings.reset(this._view);
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

    get view() {
        return this._view;
    }

    get frame() {
        return Math.round(p * this._settings.duration * 60);
    }

    get settings() {
        return this._settings;
    }

}

Base.mixinEs5(Animation, EventEmitter);

Animation.STATES = {
    IDLE: 0,
    PLAYING: 1,
    STOPPING: 2,
    STOPPED: 3,
    FINISHED: 4
};

