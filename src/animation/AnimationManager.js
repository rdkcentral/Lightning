/**
 * Copyright Metrological, 2017
 */
class AnimationManager {

    constructor(stage) {
        this.stage = stage

        this.stage.on('frameStart', () => this.progress())

        /**
         * All running animations on attached subjects.
         * @type {Set<Animation>}
         */
        this.active = new Set()
    }

    progress() {
        if (this.active.size) {
            let dt = this.stage.dt

            let filter = false
            this.active.forEach(function(a) {
                if (a.isActive()) {
                    a.progress(dt)
                } else {
                    filter = true
                }
            })

            if (filter) {
                this.active = new Set([...this.active].filter(t => t.isActive()))
            }
        }
    }

    createAnimation(view, settings) {
        if (Utils.isObjectLiteral(settings)) {
            // Convert plain object to proper settings object.
            settings = this.createSettings(settings)
        }

        return new Animation(
            this,
            settings,
            view
        )
    }

    createSettings(settings) {
        const animationSettings = new AnimationSettings()
        Base.patchObject(animationSettings, settings)
        return animationSettings
    }

    addActive(transition) {
        this.active.add(transition)
    }
}

module.exports = AnimationManager

const Base = require('../tree/Base')
const Utils = require('../tree/Utils')
const AnimationSettings = require('./AnimationSettings')
const Animation = require('./Animation')
