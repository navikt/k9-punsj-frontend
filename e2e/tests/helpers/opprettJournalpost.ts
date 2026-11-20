import type { Page } from '@playwright/test';
import type { RequestHandler } from 'msw';
import type { HttpResponse, http } from 'msw/http';
import { ApiPath } from '../../../src/app/apiConfig';

export const createdJournalpost = {
    journalpostId: '920001',
    norskIdent: '08438323288',
    dokumenter: [{ dokumentId: '470164680' }],
    erFerdigstilt: true,
    venter: null,
    kanSendeInn: true,
    erSaksbehandler: true,
    journalpostStatus: 'FERDIGSTILT',
    kanOpprettesJournalføringsoppgave: false,
    kanKopieres: false,
    punsjInnsendingType: { kode: 'UKJENT', navn: 'Ukjent', erScanning: true },
    gosysoppgaveId: null,
    sak: {
        reservertSaksnummer: false,
        fagsakId: '1DQBDDC',
        gyldigPeriode: { fom: '2024-04-15', tom: '2024-04-15' },
        pleietrengendeIdent: '24420167209',
        relatertPersonIdent: null,
        barnIdenter: null,
        sakstype: 'PSB',
        behandlingsÅr: null,
    },
};

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

export const installCreationHandler = (page: Page, failFirstAttempt = false) =>
    page.evaluate(
        ({ path, journalpostId, failFirst }) => {
            const msw = window.msw;
            if (!msw) {
                throw new Error('MSW-testarbeideren er ikke tilgjengelig.');
            }

            let attempts = 0;
            msw.worker.use(
                msw.http.post(path, () => {
                    attempts += 1;
                    return failFirst && attempts === 1
                        ? msw.HttpResponse.json({}, { status: 500 })
                        : msw.HttpResponse.json({ journalpostId }, { status: 201 });
                }),
            );
        },
        { path: ApiPath.OPPRETT_NOTAT, journalpostId: createdJournalpost.journalpostId, failFirst: failFirstAttempt },
    );

export const installCreatedJournalpostHandler = (page: Page) =>
    page.evaluate(
        ({ path, journalpost }) => {
            const msw = window.msw;
            if (!msw) {
                throw new Error('MSW-testarbeideren er ikke tilgjengelig.');
            }

            msw.worker.use(msw.http.get(path, () => msw.HttpResponse.json(journalpost)));
        },
        {
            path: ApiPath.JOURNALPOST_GET.replace('{journalpostId}', createdJournalpost.journalpostId),
            journalpost: createdJournalpost,
        },
    );
