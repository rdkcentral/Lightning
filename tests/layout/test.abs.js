/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 RDK Management
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

import FlexTestUtils from "./src/FlexTestUtils.mjs";

const flexTestUtils = new FlexTestUtils();

describe('layout', () => {

    describe('absolute', () => {

        // flexItem: false should cause the item to be ignored.
        flexTestUtils.addMochaTestForAnnotatedStructure('simple', {
            flex: {}, r: [0, 0, 770, 315], flexItem: {},
            children: [
                {w: 200, h: 300, flexItem: {marginLeft: 100, marginRight: 70, marginTop: 5, marginBottom: 10}, r: [100, 5, 200, 300]},
                {w: 100, h: 100, flexItem: {margin: 50}, r: [420, 50, 100, 100]},
                {w: 150, h: 150, flexItem: {marginRight: 50}, r: [570, 0, 150, 150]},
            ]
        });

    });

});
