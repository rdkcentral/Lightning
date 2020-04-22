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

import Utils from "../../../src/tree/Utils.mjs";
import FlexTestUtils from "./FlexTestUtils.mjs";

export default class FlexHtmlTester {

    constructor(structure) {
        this._flexTestUtils = new FlexTestUtils();

        this._specificTests = [];
        this._structure = structure;
        this._aspects = [];
    }

    set aspects(aspects) {
        this._aspects = aspects;
    }

    set specificTests(paths) {
        this._specificTests = paths;
    }

    addMochaTests() {
        const aspects = this._aspects.concat([]).reverse();
        this._addTestsForAspects(aspects, this._structure);
    }

    _addTestsForAspects(remainingAspects, structure, path) {
        if (!remainingAspects.length) {
            if (!this._specificTests.length || (this._specificTests.indexOf(path) !== -1)) {
                it('layouts', () => {
                    return this._flexTestUtils.layoutFlexAndValidate(structure, {resultVisible: this._specificTests.length}).catch(err => {
                        throw new Error(err.message + "\n" + path + "");
                    })
                });
            }
        } else {
            const aspect = remainingAspects.pop();
            const tests = aspect.getTests(structure);
            const testNames = Object.keys(tests);
            testNames.forEach(testName => {
                const key = aspect.name + ":" + testName;
                const newPath = (path ? path + " " : "") + key;
                describe(key, () => {
                    this._addTestsForAspects(remainingAspects, tests[testName], newPath);
                })
            });
            remainingAspects.push(aspect);
        }
    }

    static addMochaTestsFromAspects(name, structure, aspects, tests = []) {
        const generator = new FlexHtmlTester(structure);
        generator.aspects = aspects;
        generator.specificTests = tests;
        describe(name, () => {
            generator.addMochaTests();
        });
    }

    static createAspect(name, func) {
        return new TestableFlexAspect(name, func);
    }

    static createAspectFromFlexProperty(name, options, select) {
        return TestableFlexAspect.createFromFlexProperty(name, options, select);
    }

}

class TestableFlexAspect {
    constructor(name, func) {
        this._name = name;
        this._func = func;
    }

    get name() {
        return this._name;
    }

    getTests(structure) {
        return this._func(structure);
    }

    static createFromFlexProperty(name, options, select) {
        const func = function(structure) {
            const results = {};
            options.forEach(option => {
                const cloned = Utils.getDeepClone(structure);
                const subject = select ? select(cloned) : cloned;
                subject.flex[name] = option;
                results[option] = cloned;
            });
            return results;
        };
        return new TestableFlexAspect(name, func);
    }
}
