import { describe, it, expect, vi } from 'vitest';
import ElementTexturizer from './ElementTexturizer.mjs';

function makeTexturizer() {
    const ctx = {
        renderTextureGeneration: 0,
        allocateRenderTexture: vi.fn((w, h) => ({ w, h, f: 0 })),
        releaseRenderTexture: vi.fn(),
    };
    const core = { _w: 100, _h: 50, ctx };
    const texturizer = new ElementTexturizer({ element: {}, ctx });
    texturizer._core = core;
    return { texturizer, ctx };
}

describe('ElementTexturizer context loss', () => {
    it('reallocates render textures from a new generation after a loss', () => {
        const { texturizer, ctx } = makeTexturizer();
        const before = texturizer.getRenderTexture();
        expect(ctx.allocateRenderTexture).toHaveBeenCalledOnce();

        ctx.renderTextureGeneration++;
        const after = texturizer.getRenderTexture();
        expect(after).not.toBe(before);
        expect(ctx.allocateRenderTexture).toHaveBeenCalledTimes(2);
    });

    it('never returns a dead handle to the fresh pool', () => {
        const { texturizer, ctx } = makeTexturizer();
        texturizer.getRenderTexture();
        ctx.renderTextureGeneration++;
        texturizer.releaseRenderTexture();
        expect(ctx.releaseRenderTexture).not.toHaveBeenCalled();
        // Dropped, so the next render allocates fresh.
        texturizer.getRenderTexture();
        expect(ctx.allocateRenderTexture).toHaveBeenCalledTimes(2);
    });

    it('pools same-generation textures as before', () => {
        const { texturizer, ctx } = makeTexturizer();
        texturizer.getRenderTexture();
        texturizer.releaseRenderTexture();
        expect(ctx.releaseRenderTexture).toHaveBeenCalledOnce();
    });
});
