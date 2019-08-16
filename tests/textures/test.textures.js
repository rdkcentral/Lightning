import lng from "../../src/lightning.mjs";

describe('textures', function() {
    this.timeout(0);

    let app;
    let stage;

    class TestTexture extends lng.Texture {

        _getLookupId() {
            return this._lookupId;
        }

        set lookupId(id) {
            this._lookupId = id;
        }

        set error(e) {
            this._error = e;
        }

        set async(t) {
            this._async = t;
        }

        set invalid(v) {
            this._invalid = v;
        }

        set throttle(bool) {
            this._throttle = bool;
        }

        _getIsValid() {
            return !this._invalid;
        }

        _getSourceLoader() {
            return (cb) => {
                const canvas = lng.Tools.createRoundRect(this.stage, 100, 100, [30, 30, 30, 30]);
                const opts = Object.assign({throttle: this._throttle}, this.stage.platform.getTextureOptionsForDrawingCanvas(canvas));
                if (this._async) {
                    this.asyncLoad = () => {
                        if (this._error) {
                            return cb(this._error);
                        }
                        cb(null, opts);
                    }
                } else {
                    if (this._error) {
                        return cb(this._error);
                    }
                    cb(null, opts);
                }
            }
        }
    }

    before(() => {
        class TestApplication extends lng.Application {}
        app = new TestApplication({stage: {w: 500, h: 500, clearColor: 0xFFFF0000, autostart: false}});
        stage = app.stage;
        document.body.appendChild(stage.getCanvas());
    });

    describe('load', () => {
        describe('visible:false', () => {
            it('should not be loaded', () => {
                const element = app.stage.createElement({
                    Item: {texture: {type: TestTexture, async: false}, visible: false}
                });
                app.children = [element];
                const texture = app.tag("Item").texture;

                stage.drawFrame();
                chai.assert(!texture.isLoaded(), "Texture must not be loaded");
            });
        });

        describe('alpha:0', () => {
            it('should not be loaded', () => {
                const element = app.stage.createElement({
                    Item: {texture: {type: TestTexture, async: false}, alpha: 0}
                });
                app.children = [element];
                const texture = app.tag("Item").texture;

                stage.drawFrame();
                chai.assert(!texture.isLoaded(), "Texture must not be loaded");
            });
        });

        describe('invalid', () => {
            it('should not be loaded', () => {
                const element = app.stage.createElement({
                    Item: {texture: {type: TestTexture, invalid: true, async: false}, alpha: 0}
                });
                app.children = [element];
                const texture = app.tag("Item").texture;

                stage.drawFrame();
                chai.assert(!texture.isLoaded(), "Texture must not be loaded");
                chai.assert(!texture.source, "Texture should not have source");
            });
        });

        describe('out of bounds', () => {
            it('should not be loaded', () => {
                const element = app.stage.createElement({
                    Item: {x: 700, texture: {type: TestTexture, async: false}}
                });

                app.children = [element];
                const texture = app.tag("Item").texture;

                stage.drawFrame();
                chai.assert(!texture.isLoaded(), "Texture must not be loaded");
            });
        });

        describe('within bounds margin', () => {
            it('should be loaded', () => {
                const element = app.stage.createElement({
                    Item: {x: 550, texture: {type: TestTexture, async: false}}
                });

                app.children = [element];
                const texture = app.tag("Item").texture;

                stage.drawFrame();
                chai.assert(texture.isLoaded(), "Texture must be loaded");
            });
        });

        describe('within viewport', () => {
            it('should be loaded', () => {
                const element = app.stage.createElement({
                    Item: {x: 550, texture: {type: TestTexture, async: false}}
                });

                app.children = [element];
                const texture = app.tag("Item").texture;

                stage.drawFrame();
                chai.assert(texture.isLoaded(), "Texture must be loaded");
            });
        });

        describe('async', () => {
            it('should load after async [without throttling]', () => {
                const element = app.stage.createElement({
                    Item: {x: 550, texture: {type: TestTexture, async: true}}
                });

                app.children = [element];
                const texture = app.tag("Item").texture;
                texture.throttle = false;

                stage.drawFrame();
                chai.assert(!texture.isLoaded(), "Texture must not be loaded");

                chai.assert(app.tag("Item").texture.source.isLoading(), "texture loading");
                chai.assert(!app.tag("Item").texture.source.isLoaded(), "texture not loaded");

                texture.asyncLoad();

                chai.assert(!app.tag("Item").texture.source.isLoading(), "texture not loading");
                chai.assert(app.tag("Item").texture.source.isLoaded(), "texture loaded");

                stage.drawFrame();
                chai.assert(texture.isLoaded(), "Texture must be loaded");
            });

            it('should load after async during first frame [with throttling]', () => {
                const element = app.stage.createElement({
                    Item: {x: 550, texture: {type: TestTexture, async: true}}
                });

                app.children = [element];
                const texture = app.tag("Item").texture;

                stage.drawFrame();
                chai.assert(!texture.isLoaded(), "Texture must not be loaded");

                chai.assert(app.tag("Item").texture.source.isLoading(), "texture loading");
                chai.assert(!app.tag("Item").texture.source.isLoaded(), "texture not loaded");

                texture.asyncLoad();
                stage.drawFrame();

                chai.assert(!app.tag("Item").texture.source.isLoading(), "texture not loading");
                chai.assert(app.tag("Item").texture.source.isLoaded(), "texture loaded");
                chai.assert(texture.isLoaded(), "Texture must be loaded");
            });
        });

        describe('regression', () => {

            /* FIXME: use chai-spies instead of prototype manipulation,
               chai needs to be added as node package first */
            const wrapped = TestTexture.prototype._applyResizeMode;
            let applyCalls = 0;
            before(() => {
                TestTexture.prototype._applyResizeMode = function() {
                    applyCalls += 1;
                    wrapped.apply(this);
                }
            });
            after(() => {
                TestTexture.prototype._applyResizeMode = wrapped;
            });

            it('should apply resize mode for newly created texture with existing source', () => {
                const element = app.stage.createElement({
                    Item: {x: 550, visible: true, texture: {type: TestTexture, resizeMode: {type: 'cover', w: 200, h: 200, clipY: 0}, lookupId: 1}}
                });
                app.children = [element]
                const sourceId = app.tag("Item").texture.source.id

                stage.drawFrame();
                chai.assert(app.tag("Item").texture.source.isLoaded(), "texture loaded");

                app.tag('Item').patch({texture: {type: TestTexture, resizeMode: {type: 'cover', w: 100, h: 100, clipY: 0}, lookupId: 1}});
                chai.assert(app.tag("Item").texture._resizeMode.w === 100);
                chai.assert(app.tag("Item").texture._resizeMode.h === 100);
                chai.assert(app.tag("Item").texture.source.id === sourceId, 'sources should be the same');
                chai.assert(applyCalls === 2, 'applyResizeMode apply should have been called for new texture');
            });
        });

    });

    describe('cancel', () => {
        describe('trigger visibility while loading', () => {
            it('should cancel', () => {
                const element = app.stage.createElement({
                    Item: {x: 550, texture: {type: TestTexture, async: true}}
                });

                app.children = [element];
                const texture = app.tag("Item").texture;

                stage.drawFrame();
                chai.assert(!texture.isLoaded(), "Texture must not yet be loaded");

                app.tag("Item").visible = false;
                stage.drawFrame();

                texture.asyncLoad();
                chai.assert(!texture.isLoaded(), "Texture load callback must be ignored");
            });
        });

        describe('visible after cancel', () => {
            it('should recover load [without throttling]', () => {
                const element = app.stage.createElement({
                    Item: {x: 550, texture: {type: TestTexture, async: true}}
                });

                app.children = [element];
                const texture = app.tag("Item").texture;
                texture.throttle = false;

                stage.drawFrame();
                chai.assert(!texture.isLoaded(), "Texture must not yet be loaded");

                app.tag("Item").visible = false;
                stage.drawFrame();

                texture.asyncLoad();
                chai.assert(!texture.isLoaded(), "Texture load callback must be ignored");

                app.tag("Item").visible = true;
                stage.drawFrame();
                texture.asyncLoad();

                chai.assert(texture.isLoaded(), "Texture must be loaded");
            });
            it('should recover load [with throttling]', () => {
                const element = app.stage.createElement({
                    Item: {x: 550, texture: {type: TestTexture, async: true}}
                });

                app.children = [element];
                const texture = app.tag("Item").texture;

                stage.drawFrame();
                chai.assert(!texture.isLoaded(), "Texture must not yet be loaded");

                app.tag("Item").visible = false;
                stage.drawFrame();

                texture.asyncLoad();
                chai.assert(!texture.isLoaded(), "Texture load callback must be ignored");

                app.tag("Item").visible = true;
                texture.asyncLoad();
                stage.drawFrame();

                chai.assert(texture.isLoaded(), "Texture must be loaded");
            });


        });

        describe('visible after cancel (previous load fired)', () => {
            it('should recover load [without throttling]', () => {
                const element = app.stage.createElement({
                    Item: {x: 550, texture: {type: TestTexture, async: true}}
                });

                app.children = [element];
                const texture = app.tag("Item").texture;
                texture.throttle = false;

                stage.drawFrame();
                chai.assert(!texture.isLoaded(), "Texture must not yet be loaded");

                app.tag("Item").visible = false;
                stage.drawFrame();

                const prevAsyncLoad = texture.asyncLoad;
                chai.assert(!texture.isLoaded(), "Texture load callback must be ignored");

                app.tag("Item").visible = true;
                stage.drawFrame();
                prevAsyncLoad();

                chai.assert(texture.isLoaded(), "Texture must be loaded");
            });

            it('should recover load [with throttling]', () => {
                const element = app.stage.createElement({
                    Item: {x: 550, texture: {type: TestTexture, async: true}}
                });

                app.children = [element];
                const texture = app.tag("Item").texture;

                stage.drawFrame();
                chai.assert(!texture.isLoaded(), "Texture must not yet be loaded");

                app.tag("Item").visible = false;
                stage.drawFrame();

                const prevAsyncLoad = texture.asyncLoad;
                chai.assert(!texture.isLoaded(), "Texture load callback must be ignored");

                app.tag("Item").visible = true;
                prevAsyncLoad();
                stage.drawFrame();

                chai.assert(texture.isLoaded(), "Texture must be loaded");
            });

        });

        describe('visible after cancel (both loads fired)', () => {
            it('should recover load [without throttling]', () => {
                const element = app.stage.createElement({
                    Item: {x: 550, texture: {type: TestTexture, async: true}}
                });

                app.children = [element];
                const texture = app.tag("Item").texture;
                texture.throttle = false;

                stage.drawFrame();
                chai.assert(!texture.isLoaded(), "Texture must not yet be loaded");

                app.tag("Item").visible = false;
                stage.drawFrame();

                const prevAsyncLoad = texture.asyncLoad;
                chai.assert(!texture.isLoaded(), "Texture load callback must be ignored");

                app.tag("Item").visible = true;
                stage.drawFrame();
                prevAsyncLoad();
                texture.asyncLoad();

                chai.assert(texture.isLoaded(), "Texture must be loaded");
            });
            it('should recover load [with throttling]', () => {
                const element = app.stage.createElement({
                    Item: {x: 550, texture: {type: TestTexture, async: true}}
                });

                app.children = [element];
                const texture = app.tag("Item").texture;

                stage.drawFrame();
                chai.assert(!texture.isLoaded(), "Texture must not yet be loaded");

                app.tag("Item").visible = false;
                stage.drawFrame();

                const prevAsyncLoad = texture.asyncLoad;
                chai.assert(!texture.isLoaded(), "Texture load callback must be ignored");

                app.tag("Item").visible = true;
                prevAsyncLoad();
                texture.asyncLoad();
                stage.drawFrame();

                chai.assert(texture.isLoaded(), "Texture must be loaded");
            });

        });

        describe('becomes invisible', () => {
            it('should *not* clean up texture automatically(unconfirmed performance bottleneck)', () => {
                /* Reason:
                   https://github.com/WebPlatformForEmbedded/Lightning/commit/c7688785a4430026f3bcc9da5ed77a80ca9f9ab0
                 */

                app.tag("Item").visible = false;
                const texture = app.tag("Item").texture;
                chai.assert(texture.isLoaded(), "Texture must still be loaded");
            });
            it('should clean up texture manually', () => {
                app.tag("Item").visible = false;
                const texture = app.tag("Item").texture;
                texture.free();
                chai.assert(!texture.isLoaded(), "Texture must no longer be loaded");
            });

        });
    });

    describe('lookup id', () => {
        describe('not active', () => {
            it('should not be added to reusable sources', () => {
                const element = app.stage.createElement({
                    Item: {texture: {type: TestTexture, lookupId: "test1"}, visible: false}
                });
                app.children = [element];

                stage.drawFrame();
                chai.assert(!stage.textureManager.getReusableTextureSource("test1"), "lookup id should not be known");
            });
        });

        describe('active', () => {
            it('should be added to reusable sources', () => {
                const element = app.stage.createElement({
                    Item: {texture: {type: TestTexture, lookupId: "test1"}, visible: true}
                });

                app.children = [element];

                stage.drawFrame();
                chai.assert(!!stage.textureManager.getReusableTextureSource("test1"), "lookup id should be known");
            });
        });

        describe('becomes invisible', () => {
            it('should keep texture', () => {
                app.tag("Item").visible = false;
                const texture = app.tag("Item").texture;
                chai.assert(texture.isLoaded(), "Texture must still be loaded");
            });
        });

        describe('on GC', () => {
            before(() => {
                // Clean up.
                stage.textureManager.textureSourceHashmap.clear();
            });

            it ('should clear lookup id', () => {
                const element = app.stage.createElement({
                    Item: {texture: {type: TestTexture, lookupId: "test1"}, visible: true}
                });

                app.children = [element];

                stage.drawFrame();

                chai.assert(!!stage.textureManager.getReusableTextureSource("test1"), "lookup id should be known");

                app.tag("Item").visible = false;
                stage.drawFrame();

                chai.assert(!!stage.textureManager.getReusableTextureSource("test1"), "lookup id should be known");

                // Clean up.
                stage.textureManager.gc();

                chai.assert(!stage.textureManager.getReusableTextureSource("test1"), "lookup id should be removed");
            });
        });

        describe('previously removed texture source', () => {
            it ('should reuse newer texture source with new lookup id', () => {
                const element = app.stage.createElement({
                    Item: {texture: {type: TestTexture, lookupId: "test1"}, visible: true}
                });

                app.children = [element];

                stage.drawFrame();

                chai.assert(!!stage.textureManager.getReusableTextureSource("test1"), "lookup id should be known");
                chai.assert(app.tag("Item").texture.source.isLoaded(), "texture loaded");

                app.tag("Item").visible = false;
                stage.drawFrame();

                // Clean up.
                stage.textureManager.gc();

                chai.assert(!app.tag("Item").texture.source.isLoaded(), "texture no longer loaded");

                // Now create new texture source.
                const newElement = app.stage.createElement({ref: "NewItem", texture: {type: TestTexture, lookupId: "test1"}, visible: true});
                app.childList.a(newElement);
                stage.drawFrame();

                const prevSource = app.tag("Item").texture.source;
                chai.assert(app.tag("NewItem").texture.source !== app.tag("Item").texture.source, "texture sources should be different");

                chai.assert(app.tag("NewItem").texture.source._activeTextureCount === 1, "Active count of new texture source should be 1");

                // When making the original item visible, the texture source should be replaced width the newly loaded one.
                app.tag("Item").visible = true;
                stage.drawFrame();
                chai.assert(app.tag("NewItem").texture.source === app.tag("Item").texture.source, "texture sources should be equal");

                chai.assert(app.tag("NewItem").texture.source._activeTextureCount === 2, "Active count of new texture source should be 2");
                chai.assert(prevSource._activeTextureCount === 0, "Active count of old texture source should be 0");

                app.children = [];
                stage.drawFrame();
                stage.textureManager.gc();

                chai.assert(!stage.textureManager.getReusableTextureSource("test1"), "lookup id should be removed");
            });
        });

    });

    describe('error', () => {
        it('should not load', () => {
            const element = app.stage.createElement({
                Item: {texture: {type: TestTexture, lookupId: "test1", async: true, error: new Error("Texture Error")}, visible: true}
            });

            app.children = [element];
            stage.drawFrame();

            const texture = app.tag("Item").texture;

            chai.assert(!texture.source.isLoaded(), "texture not loaded");
            chai.assert(texture.source.isLoading(), "texture loading");

            texture.asyncLoad();

            chai.assert(!texture.source.isLoaded(), "texture not loaded");
            chai.assert(!texture.source.isLoading(), "texture not loading");
            chai.assert(texture.source.isError(), "texture error");
        });

        it('should retry loading after inactive/active',() => {
            const texture = app.tag("Item").texture;
            app.children[0].visible = false;
            texture.error = false;
            app.children[0].visible = true;
            chai.assert(!texture.source.isLoaded(), "texture not loaded");
            chai.assert(texture.source.isLoading(), "texture loading");
            chai.assert(texture.source.isError(), "texture error");
            texture.asyncLoad();
            stage.drawFrame();
            chai.assert(texture.source.isLoaded(), "texture loaded");
            chai.assert(!texture.source.isLoading(), "texture not loading");
            chai.assert(!texture.source.isError(), "texture not error");
        });
    })
});