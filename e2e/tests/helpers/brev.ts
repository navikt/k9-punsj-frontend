import type { Page } from '@playwright/test';
import type { RequestHandler } from 'msw';
import type { HttpResponse, http } from 'msw/http';

import { ApiPath } from '../../../src/app/apiConfig';

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

export const installBrevHandlers = (page: Page, pdfBytes: number[]) =>
    page.evaluate(
        ({ paths, pdf }) => {
            const msw = window.msw;
            if (!msw) {
                throw new Error('MSW-testarbeideren er ikke tilgjengelig.');
            }

            let sendAttempts = 0;
            const pdfContent = new Uint8Array(pdf);
            msw.worker.use(
                msw.http.post(paths.preview, () =>
                    msw.HttpResponse.arrayBuffer(pdfContent.buffer, {
                        headers: { 'Content-Type': 'application/pdf' },
                    }),
                ),
                msw.http.post(paths.send, () => {
                    sendAttempts += 1;
                    return sendAttempts === 1
                        ? msw.HttpResponse.json({ feilmelding: 'Midlertidig feil' }, { status: 500 })
                        : new msw.HttpResponse(null, { status: 200 });
                }),
            );
        },
        {
            paths: { preview: ApiPath.BREV_FORHAANDSVIS, send: ApiPath.BREV_BESTILL },
            pdf: pdfBytes,
        },
    );
