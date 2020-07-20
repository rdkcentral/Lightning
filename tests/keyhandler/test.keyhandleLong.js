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

describe('Longpress handling', function() {
    this.timeout(0);
    let app;
    let stage;

    before(() => {
        class TestApp extends lng.Application {
            static _template() {
                return {
                    A: {
                        type: ComponentA,
                        // Configuration how long a key should be pressed before it's longpress counterpart fires
                        longpress: {up: 700, down: 600, left: 800, right: 900}
                    }
                };
            }
            _getFocused() {
                return this.tag("A");
            }
        }

        class ComponentA extends lng.Component {
            static _template() {
                return {};
            }

            _construct() {
                this._handled = [];
            }

            _handleUpLong() {
                this._handled.push("_handleUpLong");
            }

            get handled() {
                return this._handled;
            }
        }

        app = new TestApp();
        stage = app.stage;

        document.body.appendChild(stage.getCanvas());
    });

    describe('Component', function() {
        const repeat = (iterations) => {
            return new Promise((resolve) => {
                const intervalId = setInterval(() => {
                    app.application._receiveKeydown({keyCode: 38});
                    iterations--;
                    if (!iterations) {
                        clearTimeout(intervalId);
                        resolve();
                    }
                }, 400)
            })
        };
        it('should handle _handleUpLong after long keypress', function(done) {
            const a = app.tag("A");
            repeat(4).then(() => {
                chai.assert(a.handled.indexOf("_handleUpLong") !== -1);
                done();
            });
        });
    });
});