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

    describe('resize recursion', () => {
        flexTestUtils.addMochaTestForAnnotatedStructure('simple', {
            flex: {alignItems: 'stretch', justifyContent: 'flex-start'}, r: [0, 0, 450, 200], flexItem: {},
            children: [
                {w: 100, h: 200, r: [0, 0, 100, 200]},
                {flex: {direction: 'column', wrap: true}, flexItem: {alignSelf: 'stretch'}, h: 90, r: [100, 0, 50, 200],
                    children: [
                        {w: 50, h: 50, r: [0, 0, 50, 50]},
                        {w: 50, h: 50, r: [0, 50, 50, 50]},
                        {w: 50, h: 50, r: [0, 100, 50, 50]},
                        {w: 50, h: 50, r: [0, 150, 50, 50]},
                    ]
                },
                {w: 100, h: 150, flexItem: {marginRight: 50}, r: [150, 0, 100, 150]},
            ]
        });

        // Recursive resize grow is not supported to prevent infinite loops/slow layout.
        // The horizontal resize of the column (becomes smaller) should not cause the first flex item to grow again.
        flexTestUtils.addMochaTestForAnnotatedStructure('grow', {
            flex: {alignItems: 'stretch', justifyContent: 'flex-start'}, w: 500, r: [0, 0, 500, 200], flexItem: {},
            children: [
                {w: 100, h: 200, r: [0, 0, 150, 200], flexItem: {grow: 1}},
                {flex: {direction: 'column', wrap: true}, flexItem: {alignSelf: 'stretch'}, h: 90, r: [150, 0, 50, 200],
                    children: [
                        {w: 50, h: 50, r: [0, 0, 50, 50]},
                        {w: 50, h: 50, r: [0, 50, 50, 50]},
                        {w: 50, h: 50, r: [0, 100, 50, 50]},
                        {w: 50, h: 50, r: [0, 150, 50, 50]},
                    ]
                },
                {w: 100, h: 150, flexItem: {marginRight: 50}, r: [200, 0, 100, 150]},
            ]
        });

    });

});
