import lng from "../../src/lightning.mjs";

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