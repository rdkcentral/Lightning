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

import DefaultShader from "./DefaultShader.mjs";

export default class BlurShader extends DefaultShader {

    constructor(context) {
        super(context);
        this._kernelRadius = 1;
    }

    get kernelRadius() {
        return this._kernelRadius;
    }

    set kernelRadius(v) {
        this._kernelRadius = v;
        this.redraw();
    }

    useDefault() {
        return this._amount === 0;
    }

    _beforeDrawEl({target}) {
        target.ctx.filter = "blur(" + this._kernelRadius + "px)";
    }

    _afterDrawEl({target}) {
        target.ctx.filter = "none";
    }

}

