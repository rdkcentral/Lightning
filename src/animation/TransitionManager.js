/**
 * Copyright Metrological, 2017
 */
class TransitionManager {

    constructor(stage) {
        this.stage = stage;

        this.stage.on('frameStart', () => this.progress());

        this.viewMap = new WeakMap();

        /**
         * All transitions that are running and have
         * @type {Set<Transition>}
         */
        this.active = new Set();
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

    _get(view, property) {
        let viewTransitions = this.viewMap.get(view);
        if (!viewTransitions) {
            return;
        } else {
            return viewTransitions.get(property);
        }
    }

    _set(view, property, value) {
        let viewTransitions = this.viewMap.get(view);
        if (!viewTransitions) {
            viewTransitions = new Map();
            this.viewMap.set(view, viewTransitions);
        }
        viewTransitions.set(property, value);
    }

    _remove(view, property) {
        let t = this._get(view, property);
        if (t) t.stop();
        let viewTransitions = this.viewMap.get(view);
        if (viewTransitions) {
            viewTransitions.delete(property);
        }
    }

    set(view, property, settings) {
        if (!settings) {
            this._remove(view, property);
        }
        if (Utils.isObjectLiteral(settings)) {
            // Convert plain object to proper settings object.
            settings = this.createSettings(settings);
        }

        let current = this._get(view, property);
        if (current && current.isTransition) {
            // Runtime settings change.
            current.settings = settings;
            return current;
        } else {
            // Transition not yet created; simply replace previous settings declaration.
            this._set(view, property, settings);
        }
    }

    createSettings(settings) {
        let transitionSettings = new TransitionSettings();
        Base.setObjectSettings(transitionSettings, settings);
        return transitionSettings;
    }

    /**
     * @returns {Transition}
     */
    get(view, property, settings) {
        if (settings) {
            this.set(view, property, settings);
        }

        let transition = this._get(view, property);
        if (!transition) {
            return;
        }

        if (transition.isTransitionSettings) {
            // Upgrade to 'real' transition.
            transition = new Transition(
                this,
                transition,
                view,
                property
            );
            this._set(view, property, transition)
        }

        return transition;
    }

    start(view, property, targetValue) {
        let transition = this.get(view, property);
        if (transition) {
            transition.start(targetValue);
        } else {
            console.error('Property does not have a transition: ' + property);
        }
    }

    stop(view, property) {
        let transition = this.get(view, property);
        if (transition) {
            transition.stop();
        }
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
