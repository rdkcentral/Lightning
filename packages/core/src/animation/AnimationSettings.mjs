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

import StageUtils from "../tree/StageUtils.mjs";
import AnimationActionSettings from "./AnimationActionSettings.mjs";
import Base from "../tree/Base.mjs";

export default class AnimationSettings {
    constructor() {
        /**
         * @type {AnimationActionSettings[]}
         */
        this._actions = [];

        this.delay = 0;
        this.duration = 1;

        this.repeat = 0;
        this.repeatOffset = 0;
        this.repeatDelay = 0;

        this.autostop = false;

        this.stopMethod = AnimationSettings.STOP_METHODS.FADE;
        this._stopTimingFunction = 'ease';
        this._stopTimingFunctionImpl = StageUtils.getTimingFunction(this._stopTimingFunction);
        this.stopDuration = 0;
        this.stopDelay = 0;
    }

    get actions() {
        return this._actions;
    }

    set actions(v) {
        this._actions = [];
        for (let i = 0, n = v.length; i < n; i++) {
            const e = v[i];
            if (!e.isAnimationActionSettings) {
                const aas = new AnimationActionSettings(this);
                aas.patch(e);
                this._actions.push(aas);
            } else {
                this._actions.push(e);
            }
        }
    }

    /**
     * Applies the animation to the specified element, for the specified progress between 0 and 1.
     * @param {Element} element;
     * @param {number} p;
     * @param {number} factor;
     */
    apply(element, p, factor = 1) {
        this._actions.forEach(function(action) {
            action.apply(element, p, factor);
        });
    }

    /**
     * Resets the animation to the reset values.
     * @param {Element} element;
     */
    reset(element) {
        this._actions.forEach(function(action) {
            action.reset(element);
        });
    }

    get stopTimingFunction() {
        return this._stopTimingFunction;
    }

    set stopTimingFunction(v) {
        this._stopTimingFunction = v;
        this._stopTimingFunctionImpl = StageUtils.getTimingFunction(v);
    }

    get stopTimingFunctionImpl() {
        return this._stopTimingFunctionImpl;
    }

    patch(settings) {
        Base.patchObject(this, settings);
    }

}

AnimationSettings.STOP_METHODS = {
    FADE: 'fade',
    REVERSE: 'reverse',
    FORWARD: 'forward',
    IMMEDIATE: 'immediate',
    ONETOTWO: 'onetotwo'
};

