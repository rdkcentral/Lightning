import Component from "../application/Component.mjs";

export default class SmoothScaleComponent extends Component {

    static _template() {
        return {
            ContentWrap: {renderOffscreen: true, forceZIndexContext: true, onAfterUpdate: SmoothScaleComponent._updateDimensions,
                Content: {}
            },
            Scale: {visible: false}
        }
    }

    constructor(stage) {
        super(stage);

        this._smoothScale = 1;
        this._iterations = 0;
    }

    get content() {
        return this.tag('Content');
    }

    set content(v) {
        this.tag('Content').patch(v, true);
    }

    get smoothScale() {
        return this._smoothScale;
    }

    set smoothScale(v) {
        if (this._smoothScale !== v) {
            let its = 0;
            while(v < 0.5 && its < 12) {
                its++;
                v = v * 2;
            }

            this.scale = v;
            this._setIterations(its);

            this._smoothScale = v;
        }
    }

    _setIterations(its) {
        if (this._iterations !== its) {
            const scalers = this.sel("Scale").childList;
            const content = this.sel("ContentWrap");
            while (scalers.length < its) {
                const first = scalers.length === 0;
                const texture = (first ? content.getTexture() : scalers.last.getTexture());
                scalers.a({rtt: true, renderOffscreen: true, texture: texture});
            }

            SmoothScaleComponent._updateDimensions(this.tag("ContentWrap"), true);

            const useScalers = (its > 0);
            this.patch({
                ContentWrap: {renderToTexture: useScalers},
                Scale: {visible: useScalers}
            });

            for (let i = 0, n = scalers.length; i < n; i++) {
                scalers.getAt(i).patch({
                    visible: i < its,
                    renderOffscreen: i !== its - 1
                });
            }
            this._iterations = its;
        }
    }

    static _updateDimensions(contentWrap, force) {
        const content = contentWrap.children[0];
        let w = content.renderWidth;
        let h = content.renderHeight;
        if (w !== contentWrap.w || h !== contentWrap.h || force) {
            contentWrap.w = w;
            contentWrap.h = h;

            const scalers = contentWrap.parent.tag("Scale").children;
            for (let i = 0, n = scalers.length; i < n; i++) {
                w = w * 0.5;
                h = h * 0.5;
                scalers[i].w = w;
                scalers[i].h = h;
            }
        }
    }

    get _signalProxy() {
        return true;
    }

}
