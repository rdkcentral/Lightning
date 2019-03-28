import Player from "./Player.js";

export default class PlayerProgress extends lng.Component {

    static _template() {
        return {
            Progress: {
                forceZIndexContext: true,
                Total: {
                    x: -1, y: -1, texture: lng.Tools.getRoundRect(1720, 10, 4), color: 0xFF606060,
                    Scroller: {
                        x: 0, y: 6, mount: 0.5, w: 16, h: 16, zIndex: 2,
                        Shadow: {
                            texture: lng.Tools.getShadowRect(16, 16, 8),
                            mount: 0.5,
                            x: 8,
                            y: 8,
                            color: 0xFF000000
                        },
                        Main: {texture: lng.Tools.getRoundRect(16, 16, 8), mount: 0.5, x: 8, y: 8, color: 0xFFF1F1F1}
                    }
                },
                Active: {x: -1, y: -1, color: 0xFFF1F1F1},
                CurrentTime: {
                    x: 0,
                    y: 21,
                    text: {fontSize: 28, lineHeight: 34, maxLines: 1, shadow: true, text: "00:00"}
                },
                Duration: {
                    x: 1720,
                    mountX: 1,
                    y: 21,
                    text: {fontSize: 28, lineHeight: 34, maxLines: 1, shadow: true, text: "00:00"}
                }
            }
        };
    }

    set _progress(v) {
        const now = Date.now();
        let estimation = 0;
        if (!this._last || (this._last < now - 1000)) {
            estimation = 500;
        } else {
            estimation = now - this._last;
        }
        this._last = now;
        const x = v * 1720;

        estimation *= 0.001;
        this.tag("Total").setSmooth('x', x, {timingFunction: 'linear', duration: estimation});
        this.tag("Total").setSmooth('texture.x', x, {timingFunction: 'linear', duration: estimation});
        this.tag("Active").setSmooth('texture.w', Math.max(x, 0.0001) /* force clipping */, {
            timingFunction: 'linear',
            duration: estimation
        });
    }

    setProgress(currentTime, duration) {
        this._progress = currentTime / Math.max(duration, 1);
        this.tag("CurrentTime").text = Player.formatTime(currentTime);
        this.tag("Duration").text = Player.formatTime(duration);
    }

    static formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        seconds -= hours * 3600;
        const minutes = Math.floor(seconds / 60);
        seconds -= minutes * 60;
        seconds = Math.floor(seconds);
        const parts = [];
        if (hours) parts.push(hours);
        parts.push(minutes);
        parts.push(seconds);
        return parts.map(number => (number < 10 ? "0" + number : "" + number)).join(":");
    }

    _alter() {
    }

    _setup() {
        this._alter();
    }

    _init() {
        this.tag("Active").texture = {
            type: lng.textures.SourceTexture,
            textureSource: this.tag("Total").texture.source
        };
    }

}

