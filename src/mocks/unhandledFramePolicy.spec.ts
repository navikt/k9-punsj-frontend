import { HttpNetworkFrame } from 'msw/experimental';
import { describe, expect, it, vi } from 'vitest';

import { createUnhandledFramePolicy } from './unhandledFramePolicy';

class TestHttpNetworkFrame extends HttpNetworkFrame {
    wasPassedThrough = false;
    errorReason?: unknown;

    respondWith(): void {}

    passthrough(): void {
        this.wasPassedThrough = true;
    }

    errorWith(reason?: unknown): void {
        this.errorReason = reason;
    }
}

const createFrame = (path: string, method = 'GET') =>
    new TestHttpNetworkFrame({
        request: new Request(`http://localhost${path}`, { method }),
    });

const runTestPolicy = (frame: TestHttpNetworkFrame) => {
    const policy = createUnhandledFramePolicy('test');
    if (typeof policy !== 'function') throw new Error('Test-mode policy must be a callback.');

    const defaults = { warn: vi.fn(), error: vi.fn() };
    policy({ frame, defaults });
    return defaults;
};

describe('Policy for ubehandlede forespørsler', () => {
    it('avviser ubehandlede API-forespørsler og skriver standarddiagnostikken', () => {
        const frame = createFrame('/api/k9-punsj/unmapped?source=test', 'POST');
        const defaults = runTestPolicy(frame);

        expect(defaults.error).toHaveBeenCalledOnce();
        expect(defaults.warn).not.toHaveBeenCalled();
        expect(frame.wasPassedThrough).toBe(false);
        expect(frame.errorReason).toBeInstanceOf(Response);
        if (!(frame.errorReason instanceof Response)) throw new Error('Expected a network-error response.');
        expect(frame.errorReason.type).toBe('error');
    });

    it.each(['/apiConfig.ts', '/assets/app.js', '/api'])('sender ikke-API-ressurser videre: %s', (path) => {
        const frame = createFrame(path);
        const defaults = runTestPolicy(frame);

        expect(frame.wasPassedThrough).toBe(true);
        expect(frame.errorReason).toBeUndefined();
        expect(defaults.error).not.toHaveBeenCalled();
    });

    it.each(['GET', 'HEAD'])('sender GET/HEAD-mock-PDF-forespørsler videre: %s', (method) => {
        const frame = createFrame('/api/k9-punsj/journalpost/123/dokument/456?download=1', method);
        const defaults = runTestPolicy(frame);

        expect(frame.wasPassedThrough).toBe(true);
        expect(frame.errorReason).toBeUndefined();
        expect(defaults.error).not.toHaveBeenCalled();
    });

    it('avviser POST til mock-PDF-ruten', () => {
        const frame = createFrame('/api/k9-punsj/journalpost/123/dokument/456', 'POST');
        const defaults = runTestPolicy(frame);

        expect(defaults.error).toHaveBeenCalledOnce();
        expect(frame.wasPassedThrough).toBe(false);
        expect(frame.errorReason).toBeInstanceOf(Response);
        if (!(frame.errorReason instanceof Response)) throw new Error('Expected a network-error response.');
        expect(frame.errorReason.type).toBe('error');
    });

    it('beholder bypass i utviklings- og produksjonsmodus', () => {
        expect(createUnhandledFramePolicy('development')).toBe('bypass');
        expect(createUnhandledFramePolicy('production')).toBe('bypass');
        expect(createUnhandledFramePolicy(undefined)).toBe('bypass');
    });
});
