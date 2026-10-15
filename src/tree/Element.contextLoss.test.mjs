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
