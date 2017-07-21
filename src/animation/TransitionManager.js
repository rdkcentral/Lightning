/**
 * Copyright Metrological, 2017
 */
class TransitionManager {

    constructor(stage) {
        this.stage = stage;

        this.stage.on('frameStart', () => this.progress());

        /**
         * All transitions that are running and have
         * @type {Set<Transition>}
         */
        this.active = new Set();

        this.defaultTransitionSettings = new TransitionSettings();
    }

    progress() {
        if (this.active.size) {
            let dt = this.stage.dt;

            let filter = false;
            this.active.forEach(function(a) {
                if (a.isActive()) {
                    a.progress(dt);
                } else {
                    filter = true;
                }
            });

            if (filter) {
                this.active = new Set([...this.active].filter(t => (t.isActive())));
            }
        }
    }

    createSettings(settings) {
        let transitionSettings = new TransitionSettings();
        Base.setObjectSettings(transitionSettings, settings);
        return transitionSettings;
    }

    addActive(transition) {
        this.active.add(transition);
    }
}

module.exports = TransitionManager;

let Base = require('../core/Base');
let Utils = require('../core/Utils');
let TransitionSettings = require('./TransitionSettings');
let Transition = require('./Transition');
