import { expect, test, type ConsoleMessage } from '@playwright/test';
import type { RequestHandler } from 'msw';
import type { HttpResponse, http } from 'msw/http';

import { ApiPath } from '../../src/app/apiConfig';

type BrowserMsw = {
    worker: { use: (...handlers: RequestHandler[]) => void };
    http: typeof http;
    HttpResponse: typeof HttpResponse;
};

declare global {
    interface Window {
        msw?: BrowserMsw;
    }
}

const getPathname = (url: string) => new URL(url).pathname;

test('avviser ubehandlede API-kall og beholder håndterte API-svar og ressurser', async ({ page }) => {
    const consoleErrors: string[] = [];
    const onConsole = (message: ConsoleMessage) => {
        if (message.type() === 'error') consoleErrors.push(message.text());
    };
    page.on('console', onConsole);

    let localHandlersInstalled = false;
    try {
        const userResponsePromise = page.waitForResponse(
            (response) => getPathname(response.url()) === ApiPath.USER,
        );
        await page.goto('/');
        const userResponse = await userResponsePromise;
        expect(userResponse.status()).toBe(200);
        expect(userResponse.fromServiceWorker()).toBe(true);

        const handled403Path = '/api/__strict-policy/handled-403';
        const handled500Path = '/api/__strict-policy/handled-500';
        await page.evaluate(({ handled403Path: local403Path, handled500Path: local500Path }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW test worker is not available.');

            msw.worker.use(
                msw.http.get(local403Path, () => msw.HttpResponse.json({ reason: 'denied' }, { status: 403 })),
                msw.http.get(local500Path, () => msw.HttpResponse.json({ reason: 'failed' }, { status: 500 })),
            );
        }, { handled403Path, handled500Path });
        localHandlersInstalled = true;

        const handled403ResponsePromise = page.waitForResponse(
            (response) => getPathname(response.url()) === handled403Path,
        );
        const handled403 = await page.evaluate(async (path) => {
            const response = await fetch(path);
            return { status: response.status, body: await response.json() };
        }, handled403Path);
        const handled403Response = await handled403ResponsePromise;
        expect(handled403).toEqual({ status: 403, body: { reason: 'denied' } });
        expect(handled403Response.fromServiceWorker()).toBe(true);

        const handled500ResponsePromise = page.waitForResponse(
            (response) => getPathname(response.url()) === handled500Path,
        );
        const handled500 = await page.evaluate(async (path) => {
            const response = await fetch(path);
            return { status: response.status, body: await response.json() };
        }, handled500Path);
        const handled500Response = await handled500ResponsePromise;
        expect(handled500).toEqual({ status: 500, body: { reason: 'failed' } });
        expect(handled500Response.fromServiceWorker()).toBe(true);

        const pdfPath = '/api/k9-punsj/journalpost/123/dokument/456';
        const assetResponses = await page.evaluate(async (requestedPdfPath) => {
            const module = await fetch('/apiConfig.ts');
            const moduleText = await module.text();
            const pdf = await fetch(requestedPdfPath);
            const pdfBytes = await pdf.arrayBuffer();

            return {
                moduleStatus: module.status,
                moduleContainsApiConfig: moduleText.includes('K9_PUNSJ'),
                pdfStatus: pdf.status,
                pdfContentType: pdf.headers.get('content-type'),
                pdfSignature: new TextDecoder().decode(pdfBytes.slice(0, 5)),
            };
        }, pdfPath);
        expect(assetResponses).toEqual({
            moduleStatus: 200,
            moduleContainsApiConfig: true,
            pdfStatus: 200,
            pdfContentType: 'application/pdf',
            pdfSignature: '%PDF-',
        });

        const pdfPostFailurePromise = page.waitForEvent(
            'requestfailed',
            (request) => request.method() === 'POST' && getPathname(request.url()) === pdfPath,
        );
        const pdfPostResult = await page.evaluate(async (path) => {
            try {
                const response = await fetch(path, { method: 'POST' });
                return { rejected: false, status: response.status };
            } catch (error) {
                return { rejected: true, name: error instanceof Error ? error.name : String(error) };
            }
        }, pdfPath);
        const failedPdfPost = await pdfPostFailurePromise;
        expect(pdfPostResult).toEqual({ rejected: true, name: 'TypeError' });
        expect(failedPdfPost.failure()?.errorText).toContain('ERR_FAILED');

        const unhandledPath = '/api/__strict-policy/unhandled';
        const requestFailurePromise = page.waitForEvent(
            'requestfailed',
            (request) => request.method() === 'POST' && getPathname(request.url()) === unhandledPath,
        );
        const fetchResult = await page.evaluate(async (path) => {
            try {
                const response = await fetch(path, { method: 'POST' });
                return { rejected: false, status: response.status };
            } catch (error) {
                return { rejected: true, name: error instanceof Error ? error.name : String(error) };
            }
        }, unhandledPath);
        const failedRequest = await requestFailurePromise;

        expect(fetchResult).toEqual({ rejected: true, name: 'TypeError' });
        expect(failedRequest.failure()?.errorText).toContain('ERR_FAILED');
        expect(consoleErrors.join('\n')).toContain(`POST ${pdfPath}`);
        expect(consoleErrors.join('\n')).toContain(`POST ${unhandledPath}`);
        expect(consoleErrors.join('\n')).not.toContain(handled403Path);
        expect(consoleErrors.join('\n')).not.toContain(handled500Path);
    } finally {
        try {
            if (localHandlersInstalled) {
                await page.evaluate(() => {
                    const msw = window.msw;
                    if (!msw) throw new Error('MSW test worker disappeared before handler cleanup.');
                    const worker = msw.worker;
                    if (!('resetHandlers' in worker) || typeof worker.resetHandlers !== 'function') {
                        throw new Error('MSW test worker cannot reset page-local handlers.');
                    }
                    worker.resetHandlers();
                });
            }
        } finally {
            page.off('console', onConsole);
        }
    }
});
