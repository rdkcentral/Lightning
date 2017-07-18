class AnimationManager {

    constructor(stage) {
        this.stage = stage;

        this.stage.on('frameStart', () => this.progress());

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
                this.active = new Set([...this.active].filter(t => t.isActive()));
            }
        }
    }

    createAnimation(view, settings) {
        if (Utils.isObjectLiteral(settings)) {
            // Convert plain object to proper settings object.
            settings = this.createSettings(settings);
        }

        return new Animation(
            this,
            settings,
            view
        );
    }

    createSettings(settings) {
        let animationSettings = new AnimationSettings();
        Base.setObjectSettings(animationSettings, settings);
        return animationSettings;
    }

    addActive(transition) {
        this.active.add(transition);
    }
}