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
import CircularPushShader from './CircularPushShader.mjs';

function makeShader() {
    const gl = {
        TEXTURE1: 1,
        TEXTURE0: 0,
        TEXTURE_2D: 2,
        TEXTURE_MAG_FILTER: 3,
        TEXTURE_MIN_FILTER: 4,
        TEXTURE_WRAP_S: 5,
        TEXTURE_WRAP_T: 6,
        LINEAR: 7,
        CLAMP_TO_EDGE: 8,
        UNPACK_FLIP_BLUE_RED: 9,
        UNPACK_PREMULTIPLY_ALPHA_WEBGL: 10,
        ALPHA: 11,
        UNSIGNED_BYTE: 12,
        activeTexture: vi.fn(),
        createTexture: vi.fn(() => ({})),
        bindTexture: vi.fn(),
        texParameteri: vi.fn(),
        pixelStorei: vi.fn(),
        texImage2D: vi.fn(),
        deleteTexture: vi.fn(),
    };
    const stage = {
        contextState: 'running',
        contextGeneration: 0,
        gl,
        renderer: { shaderPrograms: new Map() },
    };
    const ctx = { stage };
    const shader = new CircularPushShader(ctx);
    shader.gl = gl;
    return { shader, gl, stage };
}

describe('CircularPushShader context loss', () => {
    it('recreates its values texture after a context loss', () => {
        const { shader, gl, stage } = makeShader();
        shader.beforeDraw({});
        const first = shader._valuesTexture;
        expect(first).toBeTruthy();
        expect(gl.createTexture).toHaveBeenCalledOnce();
        expect(gl.deleteTexture).not.toHaveBeenCalled();

        // Steady state reuses the texture without reallocating.
        shader.beforeDraw({});
        expect(gl.createTexture).toHaveBeenCalledOnce();

        // A new context generation drops the dead handle (no delete call:
        // the browser already discarded it) and rebuilds.
        stage.contextGeneration++;
        shader.beforeDraw({});
        expect(gl.createTexture).toHaveBeenCalledTimes(2);
        expect(shader._valuesTexture).not.toBe(first);
        expect(gl.deleteTexture).not.toHaveBeenCalled();
    });
});
