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

import CoreQuadList from "../../tree/core/CoreQuadList.mjs";

export default class C2dCoreQuadList extends CoreQuadList {

    constructor(ctx) {
        super(ctx);

        this.renderContexts = [];
        this.modes = [];
    }

    setRenderContext(index, v) {
        this.renderContexts[index] = v;
    }

    setSimpleTc(index, v) {
        if (v) {
            this.modes[index] |= 1;
        } else {
            this.modes[index] -= (this.modes[index] & 1);
        }
    }

    setWhite(index, v) {
        if (v) {
            this.modes[index] |= 2;
        } else {
            this.modes[index] -= (this.modes[index] & 2);
        }
    }

    getRenderContext(index) {
        return this.renderContexts[index];
    }

    getSimpleTc(index) {
        return (this.modes[index] & 1);
    }

    getWhite(index) {
        return (this.modes[index] & 2);
    }

}
