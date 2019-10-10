import lng from "../../src/lightning.mjs";

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