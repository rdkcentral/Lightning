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
import TextureManager from './TextureManager.mjs';
import TextureSource from './TextureSource.mjs';
import TextureThrottler from './TextureThrottler.mjs';

function makeStage() {
    const stage = {
        contextState: 'running',
        destroyed: false,
        textureThrottler: null,
        frameCounter: 0,
        gl: null,
        _memory: 0,
        addMemoryUsage(delta) {
            this._memory += delta;
        },
        addVramUsage() {},
        isUpdatingFrame() {
            return false;
        },
    };
    stage.textureThrottler = new TextureThrottler(stage);
    return stage;
}

function makeSource(manager, loader) {
    const source = new TextureSource(manager, loader);
    // Pretend an active element is using the source.
    source._activeTextureCount = 1;
    return source;
}

const canvasData = (w = 100, h = 50) => ({ width: w, height: h });

describe('TextureManager context loss', () => {
    it('ignores a stale decode, never marks it failed, and throttles the image restore', () => {
        const stage = makeStage();
        const manager = new TextureManager(stage);
        manager._nativeUploadTextureSource = vi.fn(() => ({}));
        const cancel = vi.fn();
        let capturedCb;
        const loader = vi.fn((cb) => {
            capturedCb = cb;
            return cancel;
        });
        const source = makeSource(manager, loader);

        source.load();
        expect(source.isLoading()).toBe(true);

        manager.invalidateContext();
        expect(cancel).toHaveBeenCalledOnce();
        // In-flight source is queued for restore, not failed.
        expect(manager.hasRestores()).toBe(true);

        // The stale decode arrives after the loss: discarded, never failed.
        capturedCb(null, { source: canvasData() });
        expect(source.isLoaded()).toBe(false);
        expect(source.loadError).toBeFalsy();
        expect(stage.textureThrottler._sources.length).toBe(0);

        stage.contextState = 'running';
        manager.restoreContext();
        // Image-like restores stay queued for the throttled drain instead of
        // firing all decodes at once.
        expect(loader).toHaveBeenCalledOnce();
        expect(manager.hasRestores()).toBe(true);

        manager.processNextRestore();
        expect(loader).toHaveBeenCalledTimes(2);
        expect(manager.hasRestores()).toBe(false);

        // The re-driven decode flows through the throttled upload queue.
        capturedCb(null, { source: canvasData() });
        expect(stage.textureThrottler._sources.length).toBe(1);

        stage.textureThrottler.processSome();
        expect(source.isLoaded()).toBe(true);
        expect(manager._nativeUploadTextureSource).toHaveBeenCalledOnce();
    });

    it('reloads cheap restores immediately without waiting for the drain', () => {
        const stage = makeStage();
        const manager = new TextureManager(stage);
        manager._nativeUploadTextureSource = vi.fn(() => ({}));
        const loader = (cb) => {
            cb(null, { source: canvasData(10, 10), throttle: false });
        };
        const source = makeSource(manager, loader);

        source.load();
        expect(source.isLoaded()).toBe(true);
        expect(manager._nativeUploadTextureSource).toHaveBeenCalledOnce();

        manager.invalidateContext();
        expect(source.isLoaded()).toBe(false);

        manager.restoreContext();
        expect(source.isLoaded()).toBe(true);
        expect(manager._nativeUploadTextureSource).toHaveBeenCalledTimes(2);
        expect(manager.hasRestores()).toBe(false);
    });

    it('does not let a stale callback untrack a replacement load', () => {
        const stage = makeStage();
        const manager = new TextureManager(stage);
        manager._nativeUploadTextureSource = vi.fn(() => ({}));
        const callbacks = [];
        const loader = (cb) => {
            callbacks.push(cb);
        };
        const source = makeSource(manager, loader);

        source.load();
        expect(manager._loadingSources.has(source)).toBe(true);

        manager.invalidateContext();
        expect(manager._loadingSources.has(source)).toBe(false);

        stage.contextState = 'running';
        manager.processNextRestore();
        expect(manager._loadingSources.has(source)).toBe(true);
        expect(callbacks.length).toBe(2);

        // The stale pre-loss callback arrives after the replacement started:
        // it must neither untrack the replacement nor report an error.
        callbacks[0](null, { source: canvasData() });
        expect(manager._loadingSources.has(source)).toBe(true);
        expect(source.loadError).toBeFalsy();
        expect(stage.textureThrottler._sources.length).toBe(0);

        // The replacement completes normally.
        callbacks[1](null, { source: canvasData() });
        expect(stage.textureThrottler._sources.length).toBe(1);
    });

    it('routes a loss detected mid-upload to restore without a texture error', () => {
        const stage = makeStage();
        const manager = new TextureManager(stage);
        // Healthy at upload start, lost by the time it finishes.
        let lost = false;
        stage.gl = { isContextLost: () => lost };
        let nativeUploads = 0;
        manager._nativeUploadTextureSource = () => {
            lost = true;
            nativeUploads++;
            return {};
        };
        const onContextLost = vi.fn();
        stage.onContextLost = onContextLost;
        const source = makeSource(manager, (cb) => {
            cb(null, { source: canvasData(), throttle: false });
        });

        source.load();
        expect(nativeUploads).toBe(1);
        expect(source.isLoaded()).toBe(false);
        expect(source.loadError).toBeFalsy();
        expect(onContextLost).toHaveBeenCalledOnce();
        expect(manager.hasRestores()).toBe(true);
    });

    it('skips the upload when the context is already lost', () => {
        const stage = makeStage();
        stage.gl = { isContextLost: () => true };
        const manager = new TextureManager(stage);
        manager._nativeUploadTextureSource = vi.fn(() => ({}));
        const notified = [];
        stage.onContextLost = () => notified.push(true);
        const source = makeSource(manager, (cb) => {
            cb(null, { source: canvasData(), throttle: false });
        });

        source.load();
        expect(manager._nativeUploadTextureSource).not.toHaveBeenCalled();
        expect(source.isLoaded()).toBe(false);
        expect(source.loadError).toBeFalsy();
        expect(notified.length).toBe(1);
        expect(manager.hasRestores()).toBe(true);
        expect(stage._memory).toBe(0);
    });

    it('routes upload failures through recovery only when the context is lost', () => {
        const stage = makeStage();
        const manager = new TextureManager(stage);
        const boom = new Error('upload failed');
        manager._nativeUploadTextureSource = vi.fn(() => {
            throw boom;
        });
        const notified = [];
        stage.onContextLost = () => notified.push(true);

        // Healthy context: unrelated errors still throw (and leak no memory).
        const healthy = makeSource(manager, (cb) => {
            cb(null, { source: canvasData(), throttle: false });
        });
        expect(() => healthy.load()).toThrow(boom);
        expect(notified.length).toBe(0);
        expect(stage._memory).toBe(0);

        // Lost context: the same failure becomes a recovery, not an error.
        stage.gl = { isContextLost: () => true };
        const lost = makeSource(manager, (cb) => {
            cb(null, { source: canvasData(), throttle: false });
        });
        lost.load();
        expect(notified.length).toBe(1);
        expect(lost.loadError).toBeFalsy();
        expect(manager.hasRestores()).toBe(true);
        expect(stage._memory).toBe(0);
    });

    it('drops queued restores on destroy so dead textures can be collected', () => {
        const stage = makeStage();
        const manager = new TextureManager(stage);
        manager._nativeUploadTextureSource = vi.fn(() => ({}));
        const loader = vi.fn((cb) => {
            // Never resolves: stays in-flight.
        });
        const source = makeSource(manager, loader);
        source.load();

        stage.contextState = 'lost';
        manager.invalidateContext();
        expect(manager.hasRestores()).toBe(true);

        manager.destroy();
        expect(manager.hasRestores()).toBe(false);

        stage.contextState = 'running';
        expect(manager.processNextRestore()).toBe(true);
        // Destroy bumped the generation: no reload is kicked.
        expect(loader).toHaveBeenCalledOnce();
        stage.textureThrottler.processSome();
        expect(source.isLoaded()).toBe(false);
    });
});
