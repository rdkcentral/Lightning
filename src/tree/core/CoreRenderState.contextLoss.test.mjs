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
import CoreRenderState from './CoreRenderState.mjs';
import CoreQuadList from './CoreQuadList.mjs';

function makeRenderState() {
    const renderer = {
        createCoreQuadList: (ctx) => new CoreQuadList(ctx),
        createCoreQuadOperation: () => ({}),
        getDefaultShader: () => ({}),
        addQuad: vi.fn(),
    };
    const ctx = { stage: { renderer } };
    return { state: new CoreRenderState(ctx), renderer };
}

const unloadedSource = { nativeTexture: null, w: 100, h: 50 };
const loadedSource = { nativeTexture: { w: 100, h: 50 }, w: 100, h: 50 };

describe('CoreRenderState context loss', () => {
    it('skips quads whose source has no native texture yet', () => {
        const { state, renderer } = makeRenderState();
        state.reset();

        // As queued on the recovery frame while an image restore is still
        // decoding: must not submit a null handle that texture-size
        // dependent shaders (Pixelate, BoxBlur) would dereference.
        state.addQuad({ _displayedTextureSource: unloadedSource });
        expect(state.quads.quadTextures.length).toBe(0);
        expect(renderer.addQuad).not.toHaveBeenCalled();

        // A PixelateShader-style dimensions read over the list cannot crash.
        state.addQuad({ _displayedTextureSource: loadedSource });
        expect(state.quads.quadTextures.length).toBe(1);
        expect(state.quads.getTextureWidth(0)).toBe(100);
        expect(state.quads.getTextureHeight(0)).toBe(50);
        expect(renderer.addQuad).toHaveBeenCalledOnce();
    });

    it('falls back to source dimensions for null entries', () => {
        const list = new CoreQuadList({});
        list.quadTextures.push(null);
        list.quadElements.push({ _displayedTextureSource: { w: 7, h: 8 } });
        expect(list.getTextureWidth(0)).toBe(7);
        expect(list.getTextureHeight(0)).toBe(8);
    });
});
