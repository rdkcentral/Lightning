/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 Metrological
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export default class AnimationManager {

    constructor(stage) {
        this.stage = stage;

        this.stage.on('frameStart', () => this.progress());

        /**
         * All running animations on attached subjects.
         * @type {Set<Animation>}
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

    createAnimation(element, settings) {
        if (Utils.isObjectLiteral(settings)) {
            // Convert plain object to proper settings object.
            settings = this.createSettings(settings);
        }

        return new Animation(
            this,
            settings,
            element
        );
    }

    createSettings(settings) {
        const animationSettings = new AnimationSettings();
        Base.patchObject(animationSettings, settings);
        return animationSettings;
    }

    addActive(transition) {
        this.active.add(transition);
    }
}

import Base from "../tree/Base.mjs";
import Utils from "../tree/Utils.mjs";
import AnimationSettings from "./AnimationSettings.mjs";
import Animation from "./Animation.mjs";
