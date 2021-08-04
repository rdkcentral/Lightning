/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 Metrological
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
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
export default class PlayerButton extends lng.Component {

    static _template() {
        const o = this.options;
        return {
            w: o.w, h: o.h,
            Background: {x: -1, y: -1, texture: lng.Tools.getRoundRect(o.w, o.h, 4, 0, 0, true), color: o.colors.deselected},
            Icon: {x: o.w/2, y: o.h/2, mount: 0.5, color: o.colors.selected}
        };
    }

    set icon(source) {
        this.tag("Icon").src = `static/tools/player/img/${source}`;
    }

    set active(v) {
        this.alpha = v ? 1 : 0.3;
    }

    get active() {
        return this.alpha === 1;
    }

    static _states() {
        return [
            class Selected extends this {
                $enter() {
                    this.tag("Background").color = this.constructor.options.colors.selected;
                    this.tag("Icon").color = this.constructor.options.colors.deselected;
                }
                $exit() {
                    this.tag("Background").color = this.constructor.options.colors.deselected;
                    this.tag("Icon").color = this.constructor.options.colors.selected;
                }
            }
        ]
    }

    _focus() {
        this._setState("Selected");
    }

    _unfocus() {
        this._setState("");
    }

    static get options() {
        if (!this._options) {
            this._options = this._buildOptions();
        }
        return this._options;
    }

    static _buildOptions() {
        return {
            colors: {
                selected: 0xFFFFFFFF,
                deselected: 0xFF606060
            },
            w: 60,
            h: 60
        };
    }

}
