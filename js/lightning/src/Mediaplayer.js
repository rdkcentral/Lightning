export default class Mediaplayer extends lng.Component {

    static _template() {
        return {
            Video: {
                VideoWrap: {
                    VideoTexture: {
                        visible: false,
                        pivot: 0.5,
                        texture: {type: lng.textures.StaticTexture, options: {}}
                    }
                }
            }
        };
    }

    set textureMode(v) {
        return this._textureMode = v;
    }

    get textureMode() {
        return this._textureMode;
    }

    get videoView() {
        return this.tag("Video");
    }

    _init() {
        this.videoEl = document.createElement('video');
        this.videoEl.setAttribute('id', 'video-player');
        this.videoEl.style.position = 'absolute';
        this.videoEl.style.zIndex = '1';
        this.videoEl.setAttribute('width', '100%');
        this.videoEl.setAttribute('height', '100%');

        this.videoEl.style.visibility = (this.textureMode) ? 'hidden' : 'visible';
        if (this.textureMode) {
            this._createVideoTexture();
        }

        const events = ['timeupdate', 'error', 'ended', 'loadeddata', 'canplay', 'play', 'playing', 'pause', 'loadstart', 'seeking', 'seeked', 'encrypted'];
        events.forEach(event => {
            this.videoEl.addEventListener(event, (e) => {
                this.fire(event, {videoElement: this.videoEl, event: e});
            });
        });

        document.body.appendChild(this.videoEl);
    }

    _createVideoTexture() {
        const stage = this.stage;

        const gl = stage.gl;
        const glTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, glTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        this.videoTexture.options = {source: glTexture, w: this.videoEl.width, h: this.videoEl.height};
    }

    _startUpdatingVideoTexture() {
        if (this.textureMode) {
            const stage = this.stage;
            if (!this._updateVideoTexture) {
                this._updateVideoTexture = () => {
                    if (this.videoTexture.options.source && this.videoEl.videoWidth && this.active) {
                        const gl = stage.gl;

                        const currentTime = (new Date()).getTime();

                        // When BR2_PACKAGE_GST1_PLUGINS_BAD_PLUGIN_DEBUGUTILS is not set in WPE, webkitDecodedFrameCount will not be available.
                        // We'll fallback to fixed 30fps in this case.
                        const frameCount = this.videoEl.webkitDecodedFrameCount;

                        const mustUpdate = (frameCount ? (this._lastFrame !== frameCount) : (this._lastTime < currentTime - 30));

                        if (mustUpdate) {
                            this._lastTime = currentTime;
                            this._lastFrame = frameCount;
                            try {
                                gl.bindTexture(gl.TEXTURE_2D, this.videoTexture.options.source);
                                gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
                                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.videoEl);
                                this._lastFrame = this.videoEl.webkitDecodedFrameCount;
                                this.videoTextureView.visible = true;

                                this.videoTexture.options.w = this.videoEl.videoWidth;
                                this.videoTexture.options.h = this.videoEl.videoHeight;
                                const expectedAspectRatio = this.videoTextureView.w / this.videoTextureView.h;
                                const realAspectRatio = this.videoEl.videoWidth / this.videoEl.videoHeight;
                                if (expectedAspectRatio > realAspectRatio) {
                                    this.videoTextureView.scaleX = (realAspectRatio / expectedAspectRatio);
                                    this.videoTextureView.scaleY = 1;
                                } else {
                                    this.videoTextureView.scaleY = expectedAspectRatio / realAspectRatio;
                                    this.videoTextureView.scaleX = 1;
                                }
                            } catch (e) {
                                console.error('texImage2d video', e);
                                this._stopUpdatingVideoTexture();
                                this.videoTextureView.visible = false;
                            }
                            this.videoTexture.source.forceRenderUpdate();
                        }
                    }
                };
            }
            if (!this._updatingVideoTexture) {
                stage.on('frameStart', this._updateVideoTexture);
                this._updatingVideoTexture = true;
            }
        }
    }

    _stopUpdatingVideoTexture() {
        if (this.textureMode) {
            const stage = this.stage;
            stage.removeListener('frameStart', this._updateVideoTexture);
            this._updatingVideoTexture = false;
            this.videoTextureView.visible = false;

            if (this.videoTexture.options.source) {
                const gl = stage.gl;
                gl.bindTexture(gl.TEXTURE_2D, this.videoTexture.options.source);
                gl.clearColor(0, 0, 0, 1);
                gl.clear(gl.COLOR_BUFFER_BIT);
            }
        }
    }

    updateSettings(settings = {}) {
        // The Component that 'consumes' the media player.
        this._consumer = settings.consumer;

        if (this._consumer && this._consumer.getMediaplayerSettings) {
            // Allow consumer to add settings.
            settings = Object.assign(settings, this._consumer.getMediaplayerSettings());
        }

        if (!lng.Utils.equalValues(this._stream, settings.stream)) {
            if (settings.stream && settings.stream.keySystem) {
                navigator.requestMediaKeySystemAccess(settings.stream.keySystem.id, settings.stream.keySystem.config).then((keySystemAccess) => {
                    return keySystemAccess.createMediaKeys();
                }).then((createdMediaKeys) => {
                    return this.videoEl.setMediaKeys(createdMediaKeys);
                }).then(() => {
                    if (settings.stream && settings.stream.src)
                        this.open(settings.stream.src);
                }).catch(() => {
                    console.error('Failed to set up MediaKeys');
                });
            } else if (settings.stream && settings.stream.src) {
                this.open(settings.stream.src);
            } else {
                this.close();
            }
            this._stream = settings.stream;
        }

        this._setHide(settings.hide);
        this._setVideoArea(settings.videoPos);
    }

    _setHide(hide) {
        if (this.textureMode) {
            this.tag("Video").setSmooth('alpha', hide ? 0 : 1);
        } else {
            this.videoEl.style.visibility = hide ? 'hidden' : 'visible';
        }
    }

    open(url) {
        console.log('Playing stream', url);
        if (this.application.noVideo) {
            console.log('noVideo option set, so ignoring: ' + url);
            return;
        }
        if (this.videoEl.getAttribute('src') === url) return this.reload();
        this.videoEl.setAttribute('src', url);
    }

    close() {
        // We need to pause first in order to stop sound.
        this.videoEl.pause();
        this.videoEl.removeAttribute('src');

        // force load to reset everything without errors
        this.videoEl.load();

        this._clearSrc();
    }

    playPause() {
        if (this.isPlaying()) {
            this.doPause();
        } else {
            this.doPlay();
        }
    }

    isPlaying() {
        return (this._getState() === "Playing");
    }

    doPlay() {
        this.videoEl.play();
    }

    doPause() {
        this.videoEl.pause();
    }

    reload() {
        var url = this.videoEl.getAttribute('src');
        this.close();
        this.videoEl.src = url;
    }

    getPosition() {
        return Promise.resolve(this.videoEl.currentTime);
    }

    setPosition(pos) {
        this.videoEl.currentTime = pos;
    }

    getDuration() {
        return Promise.resolve(this.videoEl.duration);
    }

    seek(time, absolute = false) {
        if(absolute) {
            this.videoEl.currentTime = time;
        }
        else {
            this.videoEl.currentTime += time;
        }
    }

    get videoTextureView() {
        return this.tag("Video").tag("VideoTexture");
    }

    get videoTexture() {
        return this.videoTextureView.texture;
    }

    _setVideoArea(videoPos) {
        if (lng.Utils.equalValues(this._videoPos, videoPos)) {
            return;
        }

        this._videoPos = videoPos;

        if (this.textureMode) {
            this.videoTextureView.patch({
                smooth: {
                    x: videoPos[0],
                    y: videoPos[1],
                    w: videoPos[2] - videoPos[0],
                    h: videoPos[3] - videoPos[1]
                }
            });
        } else {
            const precision = this.stage.getRenderPrecision();
            this.videoEl.style.left = Math.round(videoPos[0] * precision) + 'px';
            this.videoEl.style.top = Math.round(videoPos[1] * precision) + 'px';
            this.videoEl.style.width = Math.round((videoPos[2] - videoPos[0]) * precision) + 'px';
            this.videoEl.style.height = Math.round((videoPos[3] - videoPos[1]) * precision) + 'px';
        }
    }

    _fireConsumer(event, args) {
        if (this._consumer) {
            this._consumer.fire(event, args);
        }
    }

    _equalInitData(buf1, buf2) {
        if (!buf1 || !buf2) return false;
        if (buf1.byteLength != buf2.byteLength) return false;
        const dv1 = new Int8Array(buf1);
        const dv2 = new Int8Array(buf2);
        for (let i = 0 ; i != buf1.byteLength ; i++)
            if (dv1[i] != dv2[i]) return false;
        return true;
    }

    error(args) {
        this._fireConsumer('$mediaplayerError', args);
        this._setState("");
        return "";
    }

    loadeddata(args) {
        this._fireConsumer('$mediaplayerLoadedData', args);
    }

    play(args) {
        this._fireConsumer('$mediaplayerPlay', args);
    }

    playing(args) {
        this._fireConsumer('$mediaplayerPlaying', args);
        this._setState("Playing");
    }

    canplay(args) {
        this.videoEl.play();
        this._fireConsumer('$mediaplayerStart', args);
    }

    loadstart(args) {
        this._fireConsumer('$mediaplayerLoad', args);
    }

    seeked(args) {
        this._fireConsumer('$mediaplayerSeeked', {
            currentTime: this.videoEl.currentTime,
            duration: this.videoEl.duration || 1
        });
    }

    seeking(args) {
        this._fireConsumer('$mediaplayerSeeking', {
            currentTime: this.videoEl.currentTime,
            duration: this.videoEl.duration || 1
        });
    }

    durationchange(args) {
        this._fireConsumer('$mediaplayerDurationChange', args);
    }

    encrypted(args) {
        const video = args.videoElement;
        const event = args.event;
        // FIXME: Double encrypted events need to be properly filtered by Gstreamer
        if (video.mediaKeys && !this._equalInitData(this._previousInitData, event.initData)) {
            this._previousInitData = event.initData;
            this._fireConsumer('$mediaplayerEncrypted', args);
        }
    }

    static _states() {
        return [
            class Playing extends this {
                $enter() {
                    this._startUpdatingVideoTexture();
                }
                $exit() {
                    this._stopUpdatingVideoTexture();
                }
                timeupdate() {
                    this._fireConsumer('$mediaplayerProgress', {
                        currentTime: this.videoEl.currentTime,
                        duration: this.videoEl.duration || 1
                    });
                }
                ended(args) {
                    this._fireConsumer('$mediaplayerEnded', args);
                    this._setState("");
                }
                pause(args) {
                    this._fireConsumer('$mediaplayerPause', args);
                    this._setState("Playing.Paused");
                }
                _clearSrc() {
                    this._fireConsumer('$mediaplayerStop', {});
                    this._setState("");
                }
                static _states() {
                    return [
                        class Paused extends this {
                        }
                    ]
                }
            }
        ]
    }

}