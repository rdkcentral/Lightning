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

describe('Key handling', function() {
    this.timeout(0);
    let app;
    let stage;

    before(() => {
        class TestApp extends lng.Application {
            static _template() {
                return {
                    A: {type: ComponentA}
                };
            }

            _getFocused() {
                return this.tag("A");
            }
        }

        class ComponentA extends lng.Component {
            _construct() {
                this._handled = [];
            }

            _handleUp() {
                this._handled.push("_handleUp");
            }

            _handleUpRelease() {
                this._handled.push("_handleUpRelease");
            }

            _captureKey() {
                this._handled.push("_captureKey");
                // bubble
                return false;
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
        it('should handle keydown', function() {
            const a = app.tag("A");
            stage.application.focusTopDownEvent(["_handleUp"]);
            chai.assert(a.handled.indexOf("_handleUp") !== -1);
        });

        it('should handle keyup', function() {
            const a = app.tag("A");
            stage.application.focusTopDownEvent(["_handleUpRelease"]);
            chai.assert(a.handled.indexOf("_handleUpRelease") !== -1);
        });

        it('should handle captureKey', function() {
            const a = app.tag("A");
            stage.application.focusTopDownEvent(["_captureKey"]);
            chai.assert(a.handled.indexOf("_captureKey") !== -1);
        });
    });
});