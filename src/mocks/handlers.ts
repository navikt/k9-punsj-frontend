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
