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

export default class RectangleTexture extends Texture {

    _getLookupId() {
        return '__whitepix';
    }

    _getSourceLoader() {
        return function(cb) {
            var whitePixel = new Uint8Array([255, 255, 255, 255]);
            cb(null, {source: whitePixel, w: 1, h: 1, permanent: true});
        }
    }

    isAutosizeTexture() {
        return false;
    }
}
