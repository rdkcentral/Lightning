import { describe, it, expect, vi, afterEach } from 'vitest';
import WebPlatform from './WebPlatform.mjs';

// stub stage for now
const stage = {
    getOption: () => {
        return false;
    }
}

// WebPlatform expects certain browser based globals to be present
// lets stub them and just run our functionality
global.document = {
    addEventListener: (type, listener) => { return; },
    removeEventListener: (type, listener) => { return; }
}

class ImageStub {
    static loadBehaviour = 'success';

    set crossOrigin(s) { this._crossOrigin = s; }
    get crossOrigin() { return this._crossOrigin; }

    set onload(o) { this._onload = o; }
    set onerror(r) { this._onerror = r; }

    set src(s) {
        this._src = s;

        setTimeout(() => {
            if (ImageStub.loadBehaviour === 'success' && this._onload && typeof this._onload === 'function') {
                return this._onload();
            }

            return this._onerror();
        }, 20);
    }

    get src() { return this._src; }

    removeAttribute(a) { 
        // idk about this
        if (this[a] !== undefined)
            delete this[a];
    }

    static setLoadBehaviour(t) { 
        ImageStub.loadBehaviour = t;
    }
}

global.Image = ImageStub;

describe('WebPlatform', () => {
    let webPlatform = null;

    describe('init', () => {
        it('WebPlatform should init properly', () => {
            webPlatform = new WebPlatform(stage);

            expect(webPlatform.init).toBeTypeOf('function');
            expect(webPlatform.destroy).toBeTypeOf('function');
            expect(webPlatform.loop).toBeTypeOf('function');
            expect(webPlatform.loadSrcTexture).toBeTypeOf('function');
            expect(webPlatform.createWebGLContext).toBeTypeOf('function');
        });

        it('should initialize', () => {
            webPlatform.init(stage);

            //we're expecting to not run with the image worker for this particular test
            expect(webPlatform._imageWorker).toBeUndefined();
        })
    });

    describe('loadSrcTexture', () => {
        it('should allow for loading a png', () => new Promise(done => {
            const opts = {
                src: 'https://lightningjs.io/cool.png'
            }

            const cancelCb = webPlatform.loadSrcTexture(opts, (err, image) => {
                expect(err).toBeFalsy();
                expect(image).toBeDefined();
                expect(image).toBeTypeOf('object');
                expect(image.hasAlpha).toBeTruthy();
                expect(image.renderInfo).toBeDefined();
                expect(image.renderInfo.src).toBe(opts.src);
                expect(image.renderInfo.compressed).toBeFalsy();
                done();
            });

            expect(cancelCb).toBeTypeOf('function');
        }));

        it('should set hasAlpha to True with uppercase extension', () => new Promise(done => {
            const opts = {
                src: 'https://lightningjs.io/cool.PNG'
            }

            const cancelCb = webPlatform.loadSrcTexture(opts, (err, image) => {
                expect(err).toBeFalsy();
                expect(image).toBeDefined();
                expect(image).toBeTypeOf('object');
                expect(image.hasAlpha).toBeTruthy();
                expect(image.renderInfo).toBeDefined();
                expect(image.renderInfo.src).toBe(opts.src);
                expect(image.renderInfo.compressed).toBeFalsy();
                done();
            });

            expect(cancelCb).toBeTypeOf('function');
        }));

        it('should set hasAlpha with a png blob', () => new Promise(done => {
            const opts = {
                src: 'data:image/png;base64;1234567890ABCDEFcoolPNGdude'
            }

            const cancelCb = webPlatform.loadSrcTexture(opts, (err, image) => {
                expect(err).toBeFalsy();
                expect(image).toBeDefined();
                expect(image).toBeTypeOf('object');
                expect(image.hasAlpha).toBeTruthy();
                expect(image.renderInfo).toBeDefined();
                expect(image.renderInfo.src).toBe(opts.src);
                expect(image.renderInfo.compressed).toBeFalsy();
                done();
            });

            expect(cancelCb).toBeTypeOf('function');
        }));

        it('should handle a load error', () => new Promise(done => {
            const opts = {
                src: 'https://lightningjs.io/cool.PNG'
            }

            ImageStub.setLoadBehaviour('error');

            const cancelCb = webPlatform.loadSrcTexture(opts, (err, image) => {
                expect(err).toBeTruthy();
                expect(image).toBeUndefined();
                done();
            });

            expect(cancelCb).toBeTypeOf('function');
        }));
    });

    describe('ImageWorker', () => {
        afterEach( ()=> {
            webPlatform._imageWorker = undefined;
        });

        it('loads well formed URLs', () => {
            const mockImage = {
                cancel: vi.fn()
            };

            webPlatform._imageWorker = {
                create: vi.fn().mockReturnValue(mockImage)
            };
            
            const opts = {
                src: 'https://lightningjs.io/cool.PNG'
            }

            const cancelCb = webPlatform.loadSrcTexture(opts, () => {
                throw 'Should not happen'
            });

            expect(webPlatform._imageWorker.create).toHaveBeenCalledWith(opts.src);
            expect(typeof mockImage.onLoad).toBe('function');
            expect(typeof mockImage.onError).toBe('function');
            expect(mockImage.cancel).toHaveBeenCalledTimes(0);

            cancelCb();

            expect(mockImage.cancel).toHaveBeenCalledTimes(1);
        });

        it('fails with relative URLs', () => {
            const mockImage = {
                cancel: vi.fn()
            };

            webPlatform._imageWorker = {
                create: vi.fn().mockReturnValue(mockImage)
            };
            
            const opts = {
                src: '/cool.PNG'
            }

            let gotError = undefined;
            const cancelCb = webPlatform.loadSrcTexture(opts, (err, result) => {
                gotError = err;
                expect(result).toBeUndefined();
            });

            expect(gotError).toBe("Invalid image URL");
            expect(webPlatform._imageWorker.create).toHaveBeenCalledTimes(0);
            expect(mockImage.onLoad).toBeUndefined();
            expect(mockImage.onError).toBeUndefined();
            expect(mockImage.cancel).toHaveBeenCalledTimes(0);

            expect(cancelCb).toBeUndefined();
        });
    });
});

