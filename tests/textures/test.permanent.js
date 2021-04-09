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

describe('Texture permanency', function() {
    this.timeout(0);

    let app;
    let stage;

    before(() => {
        class TestApplication extends lng.Application {}
        app = new TestApplication({stage: {w: 500, h: 500, clearColor: 0xFFFF0000, autostart: true}});
        stage = app.stage;
        document.body.appendChild(stage.getCanvas());
    });

    describe('on GC', () => {

        const TEXTURES = {
            noise: {type: lng.textures.NoiseTexture},
            text: {type: lng.textures.TextTexture, text: 'non_default'},
            image: {type: lng.textures.ImageTexture, src: './shaders/Lightning.png'},
            staticCanvas: lng.Tools.getRoundRect(50, 50, 10, null, null, null, null)
        }

        for (const [name, texture] of Object.entries(TEXTURES)) {
            describe(`${name} texture`, () => {
            beforeEach(() => {
                // Clean up.
                stage.textureManager.textureSourceHashmap.clear();
            });

                it(`should not load texture [always invisible] [perm] [${name}]`, () => {
                    const element = app.stage.createElement({
                        Item: {
                            texture: {...texture, permanent: true},
                            visible: false
                        }
                    });

                    app.children = [element];

                    const promise = Promise.race([
                        new Promise((resolve, reject) => {
                            app.tag('Item').on("txLoaded", () => {
                                reject('Texture should not have been loaded');
                            });
                        }),
                        new Promise((resolve) => {
                            setTimeout(() => {
                                chai.assert(true, 'Texture load timed out');
                                resolve();
                            }, 500);
                        })
                    ]);

                    stage.drawFrame();

                    return promise;

                });

                it(`should load texture [initially invisible] [perm] [${name}]`, () => {
                    const element = app.stage.createElement({
                        Item: {
                            texture: {...texture, permanent: true},
                            visible: false
                        }
                    });

                    app.children = [element];

                    let loaded = false;
                    const promise = Promise.race([
                        new Promise((resolve) => {
                            app.tag('Item').on("txLoaded", () => {
                                loaded = true;
                                chai.assert(stage.textureManager.textureSourceHashmap.size === 1, "texture should be registered");
                                stage.textureManager.gc();
                                chai.assert(stage.textureManager.textureSourceHashmap.size === 1, "texture should not have been freed");
                                resolve();
                            });
                        }),
                        new Promise((resolve) => {
                            setTimeout(() => {
                                if (!loaded) chai.assert(false, 'Texture load timeout');
                            }, 500);
                        })
                    ]);

                    app.tag('Item').visible = true;
                    stage.drawFrame();

                    return promise;

                });

                it(`should load and clear texture [initially visible] [volatile] [${name}]`, () => {
                    const element = app.stage.createElement({
                        Item: {
                            texture: {...texture},
                            visible: true
                        }
                    });

                    app.children = [element];

                    let loaded = false;
                    const promise = Promise.race([
                        new Promise((resolve) => {
                            app.tag('Item').on("txLoaded", () => {
                                loaded = true;
                                chai.assert(stage.textureManager.textureSourceHashmap.size === 1, "texture should be registered");
                                app.tag('Item').visible = false;
                                stage.textureManager.gc();
                                chai.assert(stage.textureManager.textureSourceHashmap.size === 0, "texture should have been freed");
                                resolve();
                            });
                        }),
                        new Promise(() => {
                            setTimeout(() => {
                                if (!loaded) chai.assert(false, 'Texture load timeout');
                            }, 500);
                        })
                    ]);

                    stage.drawFrame();

                    return promise;

                });

                it (`should load and not clear texture [initially visible] [perm] [${name}]`, () => {
                    const element = app.stage.createElement({
                        Item: {
                            texture: {...texture, permanent: true},
                            visible: true
                        }
                    });

                    app.children = [element];

                    let loaded = false;
                    const promise = Promise.race([
                        new Promise((resolve) => {
                            app.tag('Item').on("txLoaded", () => {
                                loaded = true;
                                chai.assert(stage.textureManager.textureSourceHashmap.size === 1, "texture should be registered");
                                app.tag('Item').visible = false;
                                stage.gc();
                                chai.assert(stage.textureManager.textureSourceHashmap.size === 1, "texture should not have been freed");
                                resolve();
                            });
                        }),
                        new Promise(() => {
                            setTimeout(() => {
                                if (!loaded) chai.assert(false, 'Texture load timeout')
                            }, 500);
                        })
                    ]);

                    stage.drawFrame();

                    return promise;

                });
            });

        }
    });


});