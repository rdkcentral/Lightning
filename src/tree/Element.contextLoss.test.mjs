import { describe, it, expect, vi } from 'vitest';
import Element from './Element.mjs';

describe('Element texture reload', () => {
    it('forces a render update when an already-displayed source reloads', () => {
        // Same-source reloads (e.g. after a context-loss restore) change
        // nothing observable in _setDisplayedTexture, so without an explicit
        // update the fresh pixels would never paint in a static scene.
        const element = {
            active: true,
            __texture: { id: 1 },
            _setDisplayedTexture: vi.fn(),
            forceRenderUpdate: vi.fn(),
        };
        Element.prototype.onTextureSourceLoaded.call(element);
        expect(element._setDisplayedTexture).toHaveBeenCalledWith(element.__texture);
        expect(element.forceRenderUpdate).toHaveBeenCalledOnce();
    });

    it('ignores loads for inactive elements', () => {
        const element = {
            active: false,
            _setDisplayedTexture: vi.fn(),
            forceRenderUpdate: vi.fn(),
        };
        Element.prototype.onTextureSourceLoaded.call(element);
        expect(element._setDisplayedTexture).not.toHaveBeenCalled();
        expect(element.forceRenderUpdate).not.toHaveBeenCalled();
    });
});
