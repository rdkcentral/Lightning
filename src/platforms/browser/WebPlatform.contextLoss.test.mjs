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
        }),
        onContextRestored: vi.fn(() => {
            stage.contextState = 'running';
            return true;
        }),
        onRecoveryFrameFailed: vi.fn(() => {
            stage.contextState = 'failed';
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

        // The normal loop restarts afterwards (with a single reconcile poll).
        expect(frames.size).toBe(1);
        expect(stage.gl.isContextLost).toHaveBeenCalledOnce();

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
