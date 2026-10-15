import { describe, it, expect, vi } from 'vitest';
import WebGLShaderProgram from './WebGLShaderProgram.mjs';

function makeGl({ linkOk = true, compileOk = true } = {}) {
    return {
        VERTEX_SHADER: 'vertex',
        FRAGMENT_SHADER: 'fragment',
        COMPILE_STATUS: 'compile-status',
        LINK_STATUS: 'link-status',
        VALIDATE_STATUS: 'validate-status',
        createProgram: vi.fn(() => ({})),
        createShader: vi.fn((type) => ({ type })),
        shaderSource: vi.fn(),
        compileShader: vi.fn(),
        getShaderParameter: vi.fn(() => compileOk),
        getShaderInfoLog: vi.fn(() => ''),
        attachShader: vi.fn(),
        linkProgram: vi.fn(),
        getProgramParameter: vi.fn(() => linkOk),
        getProgramInfoLog: vi.fn(() => ''),
        getError: vi.fn(() => 0),
        deleteShader: vi.fn(),
        deleteProgram: vi.fn(),
    };
}

describe('WebGLShaderProgram context restore', () => {
    it('recompiles against the new context while keeping the wrapper stable', () => {
        const gl = makeGl();
        const program = new WebGLShaderProgram('vertex-src', 'fragment-src');
        program.compile(gl);
        const oldNative = program.glProgram;
        expect(oldNative).toBeTruthy();

        const restoredGl = makeGl();
        program.restoreContext(restoredGl);

        expect(restoredGl.createProgram).toHaveBeenCalledOnce();
        expect(program.gl).toBe(restoredGl);
        expect(program.glProgram).toBeTruthy();
        expect(program.glProgram).not.toBe(oldNative);
        // Location caches are reset for the new program.
        expect(program._uniformLocations.size).toBe(0);
        expect(program._attributeLocations.size).toBe(0);
    });

    it('throws when the recompile fails so the restore is reported terminal', () => {
        const gl = makeGl();
        const program = new WebGLShaderProgram('vertex-src', 'fragment-src');
        program.compile(gl);
        expect(program.compiled).toBe(true);

        const failingGl = makeGl({ linkOk: false });
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        try {
            expect(() => program.restoreContext(failingGl)).toThrow();
        } finally {
            errorSpy.mockRestore();
        }
        // Shaders are still cleaned up on the failed attempt.
        expect(failingGl.deleteShader).toHaveBeenCalledTimes(2);
        expect(program.compiled).toBe(false);
    });

    it('skips programs destroyed before the restore', () => {
        const gl = makeGl();
        const program = new WebGLShaderProgram('vertex-src', 'fragment-src');
        program.compile(gl);
        program.destroy();

        const restoredGl = makeGl();
        program.restoreContext(restoredGl);
        expect(restoredGl.createProgram).not.toHaveBeenCalled();
    });
});
