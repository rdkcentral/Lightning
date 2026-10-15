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

import { describe, it, expect, vi, afterEach } from 'vitest';
import WebPlatform from './WebPlatform.mjs';

function stubRaf() {
    const frames = new Map();
    let nextId = 0;
    vi.stubGlobal('requestAnimationFrame', (callback) => {
        frames.set(++nextId, callback);
        return nextId;
    });
    vi.stubGlobal('cancelAnimationFrame', (id) => {
        frames.delete(id);
    });
    const runNext = () => {
        const id = Math.min(...frames.keys());
        const callback = frames.get(id);
        frames.delete(id);
        if (callback === undefined) {
            throw new Error('Expected a scheduled frame');
        }
        return { callback, id };
    };
    return { frames, runNext, get lastId() { return nextId; } };
}

function makePlatform(canvas, stage) {
    const platform = Object.create(WebPlatform.prototype);
    Object.assign(platform, {
        stage,
        _looping: false,
        _awaitingLoop: false,
        _userStopped: false,
        _loopGeneration: 0,
        _frameHandle: null,
        _loopHandler: null,
        _detachContextListeners: null,
    });
    return platform;
}

function makeStage(canvas, glLost = false) {
    const stage = {
        contextState: 'running',
        isWebgl: () => true,
        gl: { isContextLost: vi.fn(() => glLost) },
        getCanvas: () => canvas,
        getOption: () => false,
        onContextLost: vi.fn(() => {
            stage.contextState = 'lost';
            stage.pendingRestoreEvent = false;
        }),
        onContextRestored: vi.fn(() => {
            stage.contextState = 'running';
            stage.pendingRestoreEvent = true;
            return true;
        }),
        onRecoveryFrameFailed: vi.fn(() => {
            stage.contextState = 'failed';
            stage.pendingRestoreEvent = false;
            return true;
        }),
        onRecoveryFrameCompleted: vi.fn(),
        updateFrame: vi.fn(),
        renderFrame: vi.fn(() => true),
    };
    return stage;
}

describe('WebPlatform WebGL context events', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('prevents default restoration suppression and recovers outside the normal loop', () => {
        const { frames, runNext } = stubRaf();
        const canvas = new EventTarget();
        const stage = makeStage(canvas);
        const platform = makePlatform(canvas, stage);

        platform.startLoop();
        expect(frames.size).toBe(1);
        runNext().callback(16);
        expect(stage.updateFrame).toHaveBeenCalledOnce();
        // One startup reconcile poll, no per-frame polling.
        expect(stage.gl.isContextLost).toHaveBeenCalledOnce();
        stage.gl.isContextLost.mockClear();

        const lost = new Event('webglcontextlost', { cancelable: true });
        canvas.dispatchEvent(lost);
        expect(lost.defaultPrevented).toBe(true);
        expect(stage.onContextLost).toHaveBeenCalledOnce();

        canvas.dispatchEvent(new Event('webglcontextrestored'));
        expect(stage.onContextRestored).toHaveBeenCalledOnce();
        expect(stage.onRecoveryFrameCompleted).not.toHaveBeenCalled();
        expect(frames.size).toBe(1);

        // The recovery frame runs once, outside the normal loop.
        runNext().callback(32);
        expect(stage.updateFrame).toHaveBeenCalledTimes(2);
        expect(stage.renderFrame).toHaveBeenCalledTimes(2);
        expect(stage.onRecoveryFrameCompleted).toHaveBeenCalledOnce();

        // The normal loop restarts afterwards (no further reconcile poll:
        // the recovery frame already proved the context healthy).
        expect(frames.size).toBe(1);
        expect(stage.gl.isContextLost).not.toHaveBeenCalled();

        platform.stopLoop();
        expect(frames.size).toBe(0);
        canvas.dispatchEvent(new Event('webglcontextrestored'));
        expect(stage.onContextRestored).toHaveBeenCalledOnce();
    });

    it('reports a failed recovery frame without entering the normal loop', () => {
        const { frames, runNext } = stubRaf();
        const canvas = new EventTarget();
        const stage = makeStage(canvas);
        stage.renderFrame.mockImplementation(() => {
            throw new Error('recovery failed');
        });
        const platform = makePlatform(canvas, stage);

        platform.startLoop();
        canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
        canvas.dispatchEvent(new Event('webglcontextrestored'));
        runNext().callback(16);
        expect(stage.onRecoveryFrameFailed).toHaveBeenCalledOnce();
        expect(stage.onRecoveryFrameCompleted).not.toHaveBeenCalled();
        expect(frames.size).toBe(0);
        platform.stopLoop();
    });

    it('does not report a superseded recovery frame as a current failure', () => {
        const { frames, runNext } = stubRaf();
        const canvas = new EventTarget();
        const stage = makeStage(canvas);
        stage.renderFrame.mockImplementation(() => {
            platform.stopLoop();
            throw new Error('old frame failed');
        });
        const platform = makePlatform(canvas, stage);

        platform.startLoop();
        canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
        canvas.dispatchEvent(new Event('webglcontextrestored'));
        const { callback } = runNext();
        // A callback dispatched before cancellation must not fail a newer attempt.
        callback(16);
        expect(stage.contextState).toBe('running');
        expect(stage.onRecoveryFrameFailed).not.toHaveBeenCalled();
        expect(stage.onRecoveryFrameCompleted).not.toHaveBeenCalled();
        expect(frames.size).toBe(0);
    });

    it('cancels stale loop callbacks on suspend so they submit no work', () => {
        const { frames, runNext } = stubRaf();
        const canvas = new EventTarget();
        const stage = makeStage(canvas);
        const platform = makePlatform(canvas, stage);

        platform.startLoop();
        const { callback: stale } = runNext();
        platform.suspendFrameLoop();
        expect(frames.size).toBe(0);
        stale(16);
        expect(stage.updateFrame).not.toHaveBeenCalled();
        expect(frames.size).toBe(0);
        platform.stopLoop();
    });

    it('restarts cleanly when startLoop is called while running', () => {
        const { frames, runNext } = stubRaf();
        const canvas = new EventTarget();
        const stage = makeStage(canvas);
        const platform = makePlatform(canvas, stage);

        platform.startLoop();
        platform.startLoop();
        expect(frames.size).toBe(1);
        runNext().callback(16);
        expect(stage.updateFrame).toHaveBeenCalledOnce();
        expect(frames.size).toBe(1);
        platform.stopLoop();
    });

    it('keeps loss prevention armed while stopped and parks restore', () => {
        const { frames, runNext } = stubRaf();
        const canvas = new EventTarget();
        const stage = makeStage(canvas);
        const platform = makePlatform(canvas, stage);

        platform.startLoop();
        platform.stopLoop();
        expect(frames.size).toBe(0);

        // A loss while stopped must still hit preventDefault(), or the
        // browser would never fire webglcontextrestored.
        const lost = new Event('webglcontextlost', { cancelable: true });
        canvas.dispatchEvent(lost);
        expect(lost.defaultPrevented).toBe(true);
        expect(stage.onContextLost).toHaveBeenCalledOnce();
        expect(frames.size).toBe(0);

        // Restoration runs the recovery frame but must not restart a
        // deliberately stopped loop.
        canvas.dispatchEvent(new Event('webglcontextrestored'));
        expect(stage.onContextRestored).toHaveBeenCalledOnce();
        expect(frames.size).toBe(1);
        runNext().callback(16);
        expect(stage.onRecoveryFrameCompleted).toHaveBeenCalledOnce();
        expect(frames.size).toBe(0);
        expect(stage.contextState).toBe('running');

        // An explicit resume restarts normally.
        platform.startLoop();
        expect(frames.size).toBe(1);
        platform.stopLoop();
    });

    it('arms listeners without a loop for manual rendering and parks recovery', () => {
        const { frames, runNext } = stubRaf();
        const canvas = new EventTarget();
        const stage = makeStage(canvas);
        const platform = makePlatform(canvas, stage);
        // Manual mode: init() attaches listeners, startLoop() never runs.
        platform._userStopped = true;
        platform.attachContextEvents();

        const lost = new Event('webglcontextlost', { cancelable: true });
        canvas.dispatchEvent(lost);
        expect(lost.defaultPrevented).toBe(true);
        expect(stage.onContextLost).toHaveBeenCalledOnce();
        expect(frames.size).toBe(0);

        canvas.dispatchEvent(new Event('webglcontextrestored'));
        expect(stage.onContextRestored).toHaveBeenCalledOnce();
        expect(frames.size).toBe(1);
        runNext().callback(16);
        expect(stage.onRecoveryFrameCompleted).toHaveBeenCalledOnce();
        // Parked: no automatic loop started for a manual stage.
        expect(frames.size).toBe(0);
        expect(stage.contextState).toBe('running');
        platform.stopLoop();
    });

    it('runs a canceled recovery frame on resume instead of dropping completion', () => {
        const { frames, runNext } = stubRaf();
        const canvas = new EventTarget();
        const stage = makeStage(canvas);
        const platform = makePlatform(canvas, stage);

        platform.startLoop();
        canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
        canvas.dispatchEvent(new Event('webglcontextrestored'));
        // stop() before the recovery frame runs cancels it.
        platform.stopLoop();
        expect(frames.size).toBe(0);

        // Resume must run the pending recovery first, not the normal loop.
        platform.startLoop();
        expect(frames.size).toBe(1);
        expect(stage.onRecoveryFrameCompleted).not.toHaveBeenCalled();
        runNext().callback(16);
        expect(stage.onRecoveryFrameCompleted).toHaveBeenCalledOnce();
        // ...and then the normal loop resumes.
        expect(frames.size).toBe(1);
        runNext().callback(32);
        expect(stage.updateFrame).toHaveBeenCalledTimes(2);
        platform.stopLoop();
    });

    it('reconciles a loss missed while stopped via a startup poll', () => {
        const { frames } = stubRaf();
        const canvas = new EventTarget();
        const stage = makeStage(canvas, true);
        const platform = makePlatform(canvas, stage);

        // The browser already lost the context while the loop was detached.
        platform.startLoop();
        expect(stage.gl.isContextLost).toHaveBeenCalledOnce();
        expect(stage.onContextLost).toHaveBeenCalledOnce();
        expect(stage.contextState).toBe('lost');
        // Parked: no normal loop while the context is unavailable.
        expect(frames.size).toBe(0);
        platform.stopLoop();
    });

    it('recovers immediately when starting while already lost but GL is healthy', () => {
        const { frames, runNext } = stubRaf();
        const canvas = new EventTarget();
        const stage = makeStage(canvas, false);
        stage.contextState = 'lost';
        const platform = makePlatform(canvas, stage);

        // Restore was missed while stopped; don't wait for another event.
        platform.startLoop();
        expect(stage.onContextRestored).toHaveBeenCalledOnce();
        expect(frames.size).toBe(1);
        runNext().callback(16);
        expect(stage.updateFrame).toHaveBeenCalledOnce();
        expect(stage.onRecoveryFrameCompleted).toHaveBeenCalledOnce();
        platform.stopLoop();
    });
});
