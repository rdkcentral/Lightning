import lng from "../../src/lightning.mjs";

describe('text', function() {
    this.timeout(0);

    let app;
    let stage;

    class TestTexture extends lng.textures.TextTexture {}

    before(() => {
        class TestApplication extends lng.Application {}
        app = new TestApplication({stage: {w: 1000, h: 1000, clearColor: 0xFFFF0000, autostart: true}});
        stage = app.stage;
        document.body.appendChild(stage.getCanvas());
    });

    describe('regression', function() {

        afterEach(() => {
            app.children = [];
        })

        it('should apply dim function to texture [all]', function() {
            class TestComponent extends lng.Component {
                static _template() {
                    return {
                        w: 500,
                        h: 150,
                        Item: {
                            w: w => w,
                            h: h => h,
                            texture: {
                                type: TestTexture,
                                text: 'hello'
                            }
                        }
                    }
                }
            }

            const comp = stage.c({type: TestComponent});
            comp.tag = 'testComp';
            app.children = [comp]

            stage.drawFrame();
            const elem = app.tag("testComp").tag('Item');
            chai.assert(elem.texture.text == 'hello');
            chai.assert(elem.texture.w === 500);
            chai.assert(elem.texture.h === 150);
            chai.assert(elem.core.w === 500);
            chai.assert(elem.core.h === 150);
        });

        it('should apply dim function to texture [single]', function() {
            class TestComponent extends lng.Component {
                static _template() {
                    return {
                        w: 500,
                        h: 150,
                        Item: {
                            w: w => w,
                            texture: {
                                type: TestTexture,
                                text: 'hello'
                            }
                        }
                    }
                }
            }

            const comp = stage.c({type: TestComponent});
            comp.tag = 'testComp';
            app.children = [comp]

            stage.drawFrame();
            const elem = app.tag("testComp").tag('Item');
            chai.assert(elem.texture.text == 'hello');
            chai.assert(elem.texture.w === 500);
            chai.assert(elem.texture.h !== 150);
            chai.assert(elem.core.w === 500);
            chai.assert(elem.core.h !== 150);
        });

        it('should ignore dim funcs for "x" and "y" ', function() {
            class TestComponent extends lng.Component {
                static _template() {
                    return {
                        w: 500,
                        h: 150,
                        x: 200,
                        y: 300,
                        Item: {
                            x: x => x,
                            y: y => y,
                            texture: {
                                type: TestTexture,
                                text: 'hello'
                            }
                        }
                    }
                }
            }

            const comp = stage.c({type: TestComponent});
            comp.tag = 'testComp';
            app.children = [comp]

            stage.drawFrame();
            const elem = app.tag("testComp").tag('Item');
            chai.assert(elem.texture.text == 'hello');
            chai.assert(elem.texture.w !== 500);
            chai.assert(elem.texture.h !== 150);
            chai.assert(elem.core.w !== 500);
            chai.assert(elem.core.h !== 150);

        })

    });

});