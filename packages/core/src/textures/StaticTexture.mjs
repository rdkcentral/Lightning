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

import Texture from "../tree/Texture.mjs";

export default class StaticTexture extends Texture {

    constructor(stage, options) {
        super(stage);

        this._options = options;
    }

    set options(v) {
        if (this._options !== v) {
            this._options = v;
            this._changed();
        }
    }

    get options() {
        return this._options;
    }

    _getIsValid() {
        return !!this._options;
    }

    _getSourceLoader() {
        return (cb) => {
            cb(null, this._options);
        }
    }
}
