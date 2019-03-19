export default class TransitionManager {

    constructor(stage) {
        this.stage = stage;

        this.stage.on('frameStart', () => this.progress());

        /**
         * All transitions that are running and attached.
         * (we don't support transitions on un-attached elements to prevent memory leaks)
         * @type {Set<Transition>}
         */
        this.active = new Set();

        this.defaultTransitionSettings = new TransitionSettings(this.stage);
    }

    progress() {
        if (this.active.size) {
            let dt = this.stage.dt;

            let filter = false;
            this.active.forEach(function(a) {
                a.progress(dt);
                if (!a.isRunning()) {
                    filter = true;
                }
            });

            if (filter) {
                this.active = new Set([...this.active].filter(t => (t.isRunning())));
            }
        }
    }

    createSettings(settings) {
        const transitionSettings = new TransitionSettings();
        Base.patchObject(transitionSettings, settings);
        return transitionSettings;
    }

    addActive(transition) {
        this.active.add(transition);
    }

    removeActive(transition) {
        this.active.delete(transition);
    }
}

import Base from "../tree/Base.mjs";
import TransitionSettings from "./TransitionSettings.mjs";
import Transition from "./Transition.mjs";
