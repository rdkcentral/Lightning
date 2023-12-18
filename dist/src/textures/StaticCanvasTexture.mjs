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

export default class StaticCanvasTexture extends Texture {

    constructor(stage) {
        super(stage);
        this._factory = undefined;
        this._lookupId = undefined;
    }

    set content({factory, lookupId = undefined}) {
        this._factory = factory;
        this._lookupId = lookupId;
        this._changed();
    }

    _getIsValid() {
        return !!this._factory;
    }

    _getLookupId() {
        return this._lookupId;
    }

    _getSourceLoader() {
        const f = this._factory;
        return (cb) => {
            return f((err, canvas) => {
                if (err) {
                    return cb(err);
                }
                cb(null, this.stage.platform.getTextureOptionsForDrawingCanvas(canvas));
            }, this.stage);
        }
    }

}
