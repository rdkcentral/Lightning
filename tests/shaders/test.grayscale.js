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