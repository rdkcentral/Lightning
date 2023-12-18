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
