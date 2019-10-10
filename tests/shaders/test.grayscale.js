
import lng from "../../src/lightning.mjs";

describe('Shaders', function() {
    this.timeout(0);

    let appGL;
    let app2D
    let stageGL;
    let stage2D;

    before(() => {
        class TestApp extends lng.Application {
            static _template(){
                return {
                    Image:{src: "./shaders/Lightning.png",
                        shader: {
                            type: lng.shaders.Grayscale, amount: 1
                        }
                    }
                }
            }
        }

        appGL = new TestApp({
            stage: {h:100}
        });
        app2D = new TestApp({
            stage: {h:100,canvas2d: true}
        });

        stageGL = appGL.stage;
        stage2D = app2D.stage;

        document.body.appendChild(stageGL.getCanvas());
        document.body.appendChild(stage2D.getCanvas());
    });

    describe('Image texture (WebGL)', function() {
        it('Should be gray', function(){
            const shader = appGL.tag("Image").shader;
            chai.assert(shader instanceof lng.shaders.Grayscale);
        });
    });

    describe('Image texture (C2D)', function() {
        it('Should be gray', function(){
            const shader = app2D.tag("Image").shader;
            chai.assert(shader instanceof lng.shaders.c2d.Grayscale);
        });
    });
});