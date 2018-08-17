/**
 * Copyright Metrological, 2017
 */
let View = require('../../tree/View');

class SmoothScaleView extends View {

    constructor(stage) {
        super(stage);

        this._smoothScale = 1;
        this._iterations = 0;

        this.patch({
            "ContentWrap": {
                hideResultTexture: true,
                "Content": {}
            },
            "Scale": {visible: false
            }
        }, true);

        this.sel("ContentWrap").onAfterUpdate = (view) => {
            const content = view.sel("Content")
            if (content.renderWidth !== this._w || content.renderHeight !== this._h) {
                this._update()
            }
        };
    }

    get content() {
        return this.tag('Content')
    }

    set content(v) {
        this.tag('Content').patch(v, true)
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
                const first = scalers.length === 0
                const texture = (first ? content.getTexture() : scalers.last.getTexture());
                scalers.a({renderToTexture: true, hideResultTexture: true, texture: texture});
            }

            this._update()

            const useScalers = (its > 0);
            this.patch({
                "ContentWrap": {renderToTexture: useScalers},
                "Scale": {visible: useScalers}
            });

            for (let i = 0, n = scalers.length; i < n; i++) {
                scalers.getAt(i).patch({
                    visible: i < its,
                    hideResultTexture: i !== its - 1
                });
            }
            this._iterations = its;
        }
    }

    _update() {
        let w = this.tag("Content").renderWidth;
        let h = this.tag("Content").renderHeight;

        this.sel("ContentWrap").patch({w: w, h: h});

        const scalers = this.sel("Scale").childList;
        for (let i = 0, n = scalers.length; i < n; i++) {
            w = w * 0.5;
            h = h * 0.5;
            scalers.getAt(i).patch({w: w, h: h});
        }
    }



}

module.exports = SmoothScaleView;