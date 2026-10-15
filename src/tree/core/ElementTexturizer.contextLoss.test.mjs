/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 Metrological
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
