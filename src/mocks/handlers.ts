/* eslint-disable import/no-mutable-exports */

/* eslint-disable import/no-extraneous-dependencies */

/* eslint-disable import/prefer-default-export */
import { HttpResponse, delay, http } from 'msw';

import PunsjInnsendingType from 'app/models/enums/PunsjInnsendingType';

import omsorgspengerutbetalingHandlers from './omsorgspengeutbetalingHandlers';
import midlertidigAleneHandlers from './omsorgspengerMidlertidigAleneHandlers';
import { testHandlers } from './testHandlers';

let handlers = [
    http.get('/api/test', () => HttpResponse.json({ name: 'Bobby Binders' }, { status: 200 })),
    http.get('http://localhost:8101/api/k9-formidling/brev/maler', () =>
        HttpResponse.json(
            {
                INNHEN: { navn: 'Innhent dokumentasjon', mottakere: [] },
                GENERELT_FRITEKSTBREV: { navn: 'Fritekst generelt brev', mottakere: [] },
            },
            { status: 200 },
        ),
    ),

    http.get('http://localhost:8101/api/k9-punsj/journalpost/202', () =>
        HttpResponse.json(
            {
                journalpostId: '202',
                norskIdent: '29099000129',
                dokumenter: [{ dokumentId: '470164680' }, { dokumentId: '470164681' }],
                venter: null,
                punsjInnsendingType: {
                    kode: PunsjInnsendingType.INNTEKTSMELDING_UTGÅTT,
                    navn: 'inntektsmelding utgått',
                    erScanning: false,
                },
                kanSendeInn: true,
                erSaksbehandler: true,
                journalpostStatus: 'MOTTATT',
                kanOpprettesJournalføringsoppgave: true,
                kanKopieres: true,
            },
            { status: 200 },
        ),
    ),

    http.get('http://localhost:8101/api/k9-punsj/journalpost/203', () =>
        HttpResponse.json(
            {
                journalpostId: '203',
                erFerdigstilt: true,
                norskIdent: '29099000129',
                dokumenter: [{ dokumentId: '470164680' }, { dokumentId: '470164681' }],
                venter: null,
                kanSendeInn: true,
                erSaksbehandler: true,
                journalpostStatus: 'JOURNALFOERT',
                kanOpprettesJournalføringsoppgave: true,
                kanKopieres: true,
                sak: {
                    fagsakId: '1DQAW94',
                    sakstype: 'PSB',
                    gyldigPeriode: null,
                    pleietrengendeIdent: null,
                    reservertSaksnummer: true,
                },
            },
            { status: 200 },
        ),
    ),

    // PILS Uten pleietrengende
    http.get('http://localhost:8101/api/k9-punsj/journalpost/204', () =>
        HttpResponse.json(
            {
                journalpostId: '204',
                erFerdigstilt: false,
                norskIdent: '29099000129',
                dokumenter: [{ dokumentId: '470164680' }, { dokumentId: '470164681' }],
                venter: null,
                kanSendeInn: true,
                erSaksbehandler: true,
                journalpostStatus: 'MOTTATT',
                kanOpprettesJournalføringsoppgave: true,
                kanKopieres: true,
                sak: {
                    fagsakId: null,
                    sakstype: null,
                    gyldigPeriode: null,
                    pleietrengendeIdent: null,
                    reservertSaksnummer: false,
                },
            },
            { status: 200 },
        ),
    ),

    // PILS Med pleietrengende
    http.get('http://localhost:8101/api/k9-punsj/journalpost/205', () =>
        HttpResponse.json(
            {
                journalpostId: '205',
                erFerdigstilt: false,
                norskIdent: '29099000129',
                dokumenter: [{ dokumentId: '470164680' }, { dokumentId: '470164681' }],
                venter: null,
                kanSendeInn: true,
                erSaksbehandler: true,
                journalpostStatus: 'JOURNALFOERT',
                kanOpprettesJournalføringsoppgave: true,
                kanKopieres: true,
                sak: {
                    fagsakId: '1DQAW97',
                    sakstype: 'PPN',
                    gyldigPeriode: null,
                    pleietrengendeIdent: '15447308840',
                    reservertSaksnummer: true,
                },
            },
            { status: 200 },
        ),
    ),

    http.get('http://localhost:8101/api/k9-punsj/journalpost/207', () =>
        HttpResponse.json(
            {
                journalpostId: '207',
                erFerdigstilt: true,
                norskIdent: '29099000129',
                dokumenter: [{ dokumentId: '470164680' }, { dokumentId: '470164681' }],
                venter: null,
                kanSendeInn: true,
                erSaksbehandler: true,
                journalpostStatus: 'JOURNALFOERT',
                kanOpprettesJournalføringsoppgave: true,
                kanKopieres: true,
                sak: {
                    fagsakId: '1DQAW94',
                    sakstype: 'OMP_KS',
                    gyldigPeriode: null,
                    pleietrengendeIdent: null,
                    reservertSaksnummer: true,
                },
            },
            { status: 200 },
        ),
    ),

    // Tomt
    http.get('http://localhost:8101/api/k9-punsj/journalpost/206', () =>
        HttpResponse.json(
            {
                journalpostId: '206',
                erFerdigstilt: false,
                norskIdent: '29099000129',
                dokumenter: [{ dokumentId: '470164680' }, { dokumentId: '470164681' }],
                venter: null,
                kanSendeInn: true,
                erSaksbehandler: true,
                journalpostStatus: 'MOTTATT',
                kanOpprettesJournalføringsoppgave: true,
                kanKopieres: true,
                sak: {
                    fagsakId: null,
                    sakstype: null,
                    gyldigPeriode: null,
                    pleietrengendeIdent: null,
                    reservertSaksnummer: false,
                },
            },
            { status: 200 },
        ),
    ),

    http.get('http://localhost:8101/api/k9-punsj/saker/hent', async () => {
        await delay(500);
        return HttpResponse.json(
            [
                {
                    fagsakId: 'ABC123',
                    sakstype: 'PSB',
                    pleietrengendeIdent: '03091477490',
                    gyldigPeriode: {
                        fom: '2022-08-01',
                        tom: '2022-08-15',
                    },
                },
                {
                    fagsakId: 'DEF456',
                    sakstype: 'PPN',
                    pleietrengendeIdent: '03091477490',
                    gyldigPeriode: {
                        fom: '2022-08-01',
                        tom: '2022-08-15',
                    },
                },
                {
                    fagsakId: '1DMU93M',
                    sakstype: 'PSB',
                    pleietrengendeIdent: null,
                    gyldigPeriode: null,
                },
            ],
            { status: 200 },
        );
    }),

    http.post('http://localhost:8101/api/k9-punsj/journalpost/kopier/203', () =>
        HttpResponse.json(
            {
                saksnummer: '1DQAW94',
            },
            { status: 202 },
        ),
    ),

    http.post('http://localhost:8101/api/k9-punsj/journalpost/lukk/203', () =>
        HttpResponse.json(
            {
                saksnummer: '1DQAW94',
            },
            { status: 200 },
        ),
    ),

    http.post('http://localhost:8101/api/k9-punsj/journalpost/mottak', () =>
        HttpResponse.json(
            {
                saksnummer: '1DQAW94',
            },
            { status: 200 },
        ),
    ),

    /* http.post('http://localhost:8101/api/k9-punsj/journalpost/mottak', () =>
        HttpResponse.json(
            {
                feil: 'Kunne ikke reservere saksnummer. Fagsak (1DQAU8W) finnes allerede for pleietrengende.',
            },
            { status: 500 },
        ),
    ), */

    http.post('http://localhost:8101/api/k9-punsj/brev/bestill', () => new HttpResponse(null, { status: 200 })),
    http.get('http://localhost:8101/api/k9-punsj/person', () =>
        HttpResponse.json(
            {
                etternavn: 'KAKE',
                fornavn: 'TUNGSINDIG',
                fødselsdato: '1981-12-18',
                identitetsnummer: '18128103429',
                mellomnavn: null,
                sammensattNavn: 'TUNGSINDIG KAKE',
            },
            { status: 200 },
        ),
    ),
    http.get('http://localhost:8101/api/k9-punsj/journalpost/123456789', async () =>
        HttpResponse.json({ type: 'punsj://ikke-støttet-journalpost' }, { status: 409 }),
    ),

    http.get('http://localhost:8101/api/k9-punsj/journalpost/lukkDebugg/123456789', async () => {
        await delay(1000);
        return HttpResponse.json({}, { status: 404 });
    }),

    testHandlers.barn,
    http.post('http://localhost:8101/api/k9-punsj/notat/opprett', async () => {
        await delay(500);
        return new HttpResponse(JSON.stringify({ journalpostId: '200' }), { status: 201 });
    }),
];

if (process.env.MSW_MODE === 'test') {
    handlers = handlers
        .concat(Object.values(testHandlers))
        .concat(Object.values(omsorgspengerutbetalingHandlers))
        .concat(Object.values(midlertidigAleneHandlers));
}

export { handlers };
