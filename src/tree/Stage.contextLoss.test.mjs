import { describe, it, expect, vi } from 'vitest';
import Stage from './Stage.mjs';

function makeStage() {
    const events = [];
    const stage = Object.create(Stage.prototype);
    const renderer = {
        restoreContext: vi.fn(),
        destroy: vi.fn(),
    };
    Object.assign(stage, {
        contextState: 'running',
        contextGeneration: 0,
        contextLostAt: 0,
        pendingRestoreEvent: false,
        destroyed: false,
        _restoreTimeoutHandle: null,
        startTime: 0,
        currentTime: 0,
        dt: 0,
        frameCounter: 0,
        _options: { fixedDt: 0 },
        _updateSourceTextures: new Set(),
        _updatingFrame: false,
        platform: {
            getHrTime: () => 200,
            suspendFrameLoop: vi.fn(),
            stopLoop: vi.fn(),
            destroy: vi.fn(),
            nextFrame: vi.fn(),
        },
        _renderer: renderer,
        textureManager: {
            invalidateContext: vi.fn(),
            restoreContext: vi.fn(),
            destroy: vi.fn(),
        },
        textureThrottler: {
            processSome: vi.fn(),
        },
        ctx: {
            invalidateContext: vi.fn(),
            destroy: vi.fn(),
            hasRenderUpdates: () => false,
        },
        options: { contextRestoreTimeout: 10000 },
        gl: null,
        c2d: null,
        emit: (name, data) => events.push([name, data]),
    });
    Object.defineProperty(stage, 'root', {
        value: { core: { _parent: { setHasRenderUpdates: vi.fn() } } },
        configurable: true,
        writable: true,
    });
    stage.getOption = (name) => stage.options[name];
    return { stage, renderer, events };
}

describe('Stage WebGL context recovery', () => {
    it('invalidates once per loss and restores without replacing references', () => {
        const { stage, renderer, events } = makeStage();
        stage.onContextLost();
        stage.onContextLost();
        expect(stage.contextState).toBe('lost');
        expect(events.map(([event]) => event)).toEqual(['contextLost']);
        expect(stage.textureManager.invalidateContext).toHaveBeenCalledOnce();
        expect(stage.ctx.invalidateContext).toHaveBeenCalledOnce();

        expect(stage.onContextRestored()).toBe(true);
        expect(stage.contextState).toBe('running');
        expect(renderer.restoreContext).toHaveBeenCalledOnce();
        expect(stage.textureManager.restoreContext).toHaveBeenCalledOnce();
        // Recovery is announced only after the first recovery frame.
        expect(events.map(([event]) => event)).toEqual(['contextLost']);
        expect(stage.pendingRestoreEvent).toBe(true);
    });

    it('suspends the platform loop on loss so GL-error paths cancel stale frames', () => {
        const { stage } = makeStage();
        stage.onContextLost();
        expect(stage.platform.suspendFrameLoop).toHaveBeenCalledOnce();
        stage.onContextLost();
        expect(stage.platform.suspendFrameLoop).toHaveBeenCalledOnce();
    });

    it('submits no GPU work while not running', () => {
        const { stage, events } = makeStage();
        stage.onContextLost();
        stage.drawFrame();
        expect(events).toEqual([['contextLost', { generation: 1 }]]);
        expect(stage.textureThrottler.processSome).not.toHaveBeenCalled();
        expect(stage.renderFrame()).toBe(false);
    });

    it('forces render-texture rebuilds across the tree on restore', () => {
        const { stage, events } = makeStage();
        const grandchild = { _hasRenderUpdates: 0 };
        const child = { _hasRenderUpdates: 0, _children: [grandchild] };
        stage.ctx.root = { _hasRenderUpdates: 0, _children: [child] };
        stage.onContextLost();
        expect(stage.onContextRestored()).toBe(true);
        expect(stage.ctx.root._hasRenderUpdates).toBe(3);
        expect(child._hasRenderUpdates).toBe(3);
        expect(grandchild._hasRenderUpdates).toBe(3);
        expect(events.map(([event]) => event)).toEqual(['contextLost']);
    });

    it('reports failed reinitialisation and does not resume GPU work', () => {
        const { stage, renderer, events } = makeStage();
        renderer.restoreContext.mockImplementation(() => {
            throw new Error('no context');
        });
        stage.onContextLost();
        expect(stage.onContextRestored()).toBe(false);
        expect(stage.contextState).toBe('failed');
        expect(events.map(([event]) => event)).toEqual([
            'contextLost',
            'contextRestoreFailed',
        ]);
        expect(stage.textureManager.restoreContext).not.toHaveBeenCalled();
        expect(stage.renderFrame()).toBe(false);
    });

    it('reports an unsupported renderer instead of touching WebGL', () => {
        const { stage, events } = makeStage();
        stage._renderer = { destroy: vi.fn() };
        stage.onContextLost();
        expect(stage.onContextRestored()).toBe(false);
        expect(stage.contextState).toBe('failed');
        expect(events.map(([event]) => event)).toEqual([
            'contextLost',
            'contextRestoreFailed',
        ]);
    });

    it('reports overdue restoration but still accepts a late browser event', () => {
        vi.useFakeTimers();
        try {
            const { stage, events } = makeStage();
            stage.options.contextRestoreTimeout = 50;
            stage.onContextLost();
            vi.advanceTimersByTime(51);
            expect(stage.contextState).toBe('lost');
            expect(events.map(([event]) => event)).toEqual([
                'contextLost',
                'contextRestoreFailed',
            ]);
            expect(stage.onContextRestored()).toBe(true);
            expect(stage.contextState).toBe('running');
        } finally {
            vi.useRealTimers();
        }
    });

    it('aborts restoration when a second loss lands mid-restore', () => {
        const { stage, renderer, events } = makeStage();
        stage.onContextLost();
        renderer.restoreContext.mockImplementationOnce(() => {
            // GL work during re-init detects the context is gone again.
            stage.onContextLost();
        });
        expect(stage.onContextRestored()).toBe(false);
        expect(stage.contextState).toBe('lost');
        expect(events.map(([event]) => event)).toEqual([
            'contextLost',
            'contextLost',
        ]);
        expect(events[1][1]).toEqual({ generation: 2 });
        expect(stage.textureManager.restoreContext).not.toHaveBeenCalled();
    });

    it('announces restored only after the first recovery frame', () => {
        const { stage, events } = makeStage();
        stage.onContextLost();
        expect(stage.onContextRestored()).toBe(true);
        expect(events.map(([event]) => event)).toEqual(['contextLost']);
        stage.drawFrame();
        stage.onRecoveryFrameCompleted();
        const contextEvents = events
            .map(([event]) => event)
            .filter((event) => event.startsWith('context'));
        expect(contextEvents).toEqual(['contextLost', 'contextRestored']);
        expect(events[events.length - 1][1]).toEqual({ generation: 1, duration: 0 });
    });

    it('reports a failed first recovery frame and gates subsequent draws', () => {
        const { stage, events } = makeStage();
        stage.onContextLost();
        stage.onContextRestored();
        expect(stage.onRecoveryFrameFailed(new Error('frame failed'))).toBe(true);
        expect(stage.contextState).toBe('failed');
        expect(events.map(([event]) => event)).toEqual([
            'contextLost',
            'contextRestoreFailed',
        ]);
        expect(stage.onRecoveryFrameFailed(new Error('later'))).toBe(false);
    });

    it('tears down while lost without accepting further loss or restore', () => {
        const { stage, events } = makeStage();
        const textureManager = stage.textureManager;
        const platform = stage.platform;
        stage.onContextLost();
        stage.destroy();
        expect(stage.contextState).toBe('destroyed');
        expect(stage.destroyed).toBe(true);
        expect(textureManager.destroy).toHaveBeenCalledOnce();
        expect(platform.stopLoop).toHaveBeenCalledOnce();
        const emitted = events.length;
        stage.onContextLost();
        expect(stage.contextState).toBe('destroyed');
        expect(events.length).toBe(emitted);
        expect(stage.onContextRestored()).toBe(false);
        expect(stage.contextState).toBe('destroyed');
    });
});
