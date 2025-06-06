import { HttpResponse, delay, http } from 'msw';

import PunsjInnsendingType from 'app/models/enums/PunsjInnsendingType';
import { ApiPath } from 'app/apiConfig';

import omsorgspengerutbetalingHandlers from './omsorgspengeutbetalingHandlers';
import midlertidigAleneHandlers from './omsorgspengerMidlertidigAleneHandlers';
import { testHandlers } from './testHandlers';
import aleneOmOmsorgenHandlers from './aleneOmOmsorgenHandlers';

let handlers = [
    http.get(ApiPath.BREV_MALER, () =>
        HttpResponse.json(
            {
                INNHEN: {
                    navn: 'Innhent dokumentasjon',
                    mottakere: [],
                    linker: [
                        {
                            type: 'GET',
                            rel: 'malinnhold',
                            href: '/k9/formidling/api/brev/maler/VARSEL_FRITEKST?sakstype=PSB&eksternReferanse=null&avsenderApplikasjon=K9PUNSJ',
                        },
                    ],
                    støtterFritekst: true,
                    støtterTittelOgFritekst: false,
                    kode: 'INNHEN',
                    støtterTredjepartsmottaker: false,
                },
                GENERELT_FRITEKSTBREV: {
                    kode: 'GENERELT_FRITEKSTBREV',
                    linker: [],
                    mottakere: [],
                    navn: 'Fritekst generelt brev',
                    støtterFritekst: false,
                    støtterTittelOgFritekst: true,
                    støtterTredjepartsmottaker: true,
                },
                GENERELT_FRITEKSTBREV_NYNORSK: {
                    navn: 'Fritekst generelt brev på nynorsk',
                    mottakere: [],
                    linker: [],
                    støtterFritekst: false,
                    støtterTittelOgFritekst: true,
                    kode: 'GENERELT_FRITEKSTBREV_NYNORSK',
                    støtterTredjepartsmottaker: true,
                },
            },
            { status: 200 },
        ),
    ),

    http.get(ApiPath.JOURNALPOST_GET.replace('{journalpostId}', '202'), () =>
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

    http.get('http://localhost:8080/api/k9-punsj/journalpost/203', () =>
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
                    pleietrengende: null,
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
                    pleietrengende: null,
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
                    pleietrengende: { navn: 'Test Testen', identitetsnummer: '15447308840', fødselsdato: '1970-08-15' },
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
                    pleietrengende: null,
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
                    pleietrengende: null,
                    reservertSaksnummer: false,
                },
            },
            { status: 200 },
        ),
    ),

    http.get('http://localhost:8080/api/k9-punsj/journalpost/216', () =>
        HttpResponse.json(
            {
                journalpostId: '216',
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
                    fagsakId: '1DQBHH0',
                    sakstype: 'PPN',
                    gyldigPeriode: null,
                    pleietrengende: null,
                    reservertSaksnummer: true,
                    relatertPerson: null,
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
                    pleietrengende: { navn: 'Test Testen', identitetsnummer: '15447308840', fødselsdato: '2020-08-15' },
                    gyldigPeriode: {
                        fom: '2022-08-01',
                        tom: '2022-08-15',
                    },
                },
                {
                    fagsakId: 'DEF456',
                    sakstype: 'PPN',
                    pleietrengende: { navn: 'Test Testen', identitetsnummer: '03091477490', fødselsdato: '1970-08-15' },
                    gyldigPeriode: {
                        fom: '2022-08-01',
                        tom: '2022-08-15',
                    },
                },
                {
                    fagsakId: '1DMU93M',
                    sakstype: 'OMP',
                    pleietrengende: null,
                    gyldigPeriode: null,
                    behandlingsAar: '2022',
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

    http.post('http://localhost:8101/api/k9-punsj/journalpost/kopier/205', () =>
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

    http.post('http://localhost:8080/api/k9-punsj/journalpost/mottak', () =>
        HttpResponse.json(
            {
                saksnummer: '1DQAW94',
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
                    pleietrengende: null,
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
                    pleietrengende: null,
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
                    pleietrengende: { navn: 'Test Testen', identitetsnummer: '15447308840', fødselsdato: '1970-08-15' },
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
                    pleietrengende: null,
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
                    pleietrengende: null,
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
                    pleietrengende: { navn: 'Test Testen', identitetsnummer: '03091477490', fødselsdato: '1970-08-15' },
                    gyldigPeriode: {
                        fom: '2022-08-01',
                        tom: '2022-08-15',
                    },
                },
                {
                    fagsakId: 'DEF456',
                    sakstype: 'PPN',
                    pleietrengende: { navn: 'Test Testen', identitetsnummer: '03091477490', fødselsdato: '1970-08-15' },
                    gyldigPeriode: {
                        fom: '2022-08-01',
                        tom: '2022-08-15',
                    },
                },
                {
                    fagsakId: '1DMU93M',
                    sakstype: 'PSB',
                    pleietrengende: null,
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

    /* This is commented out because it is causing the 'should send brev' cypress test to fail because
     * in cypress test uses intercept to check if the request is made correctly and the intercept is not
     * working as expected if msw is used for the request.
     * if app starts for development by running 'yarn test:e2eUI' and you need to test send brev visually
     * you can uncomment this, but you must comment it back before committing and running the cypress tests.
     *
     * TODO: Fix this, maybe
     */
    // http.post(ApiPath.BREV_BESTILL, () => new HttpResponse(null, { status: 400 })),

    /* http.post(
        ApiPath.JOURNALPOST_LUKK_OPPGAVE.replace('{journalpostId}', '300'),
        () => new HttpResponse(null, { status: 200 }),
    ),*/

    http.get(ApiPath.PERSON, async () => {
        await delay(2000);
        return HttpResponse.json(
            {
                etternavn: 'KAKE',
                fornavn: 'TUNGSINDIG',
                fødselsdato: '1981-12-18',
                identitetsnummer: '18128103429',
                mellomnavn: null,
                sammensattNavn: 'TUNGSINDIG KAKE',
            },
            { status: 200 },
        );
    }),

    http.get(ApiPath.JOURNALPOST_GET.replace('{journalpostId}', '409'), async () =>
        HttpResponse.json({ type: 'punsj://ikke-støttet-journalpost' }, { status: 409 }),
    ),

    http.get(ApiPath.JOURNALPOST_LUKK_DEBUGG.replace('{journalpostId}', '123456789'), async () => {
        await delay(1000);
        return HttpResponse.json({}, { status: 404 });
    }),
    http.post(ApiPath.JOURNALPOST_HENT, async () => HttpResponse.json({ poster: [] })),

    testHandlers.barn,
    http.post(ApiPath.OPPRETT_NOTAT, async () => {
        await delay(500);
        return new HttpResponse(JSON.stringify({ journalpostId: '200' }), { status: 201 });
        // return new HttpResponse(JSON.stringify({}), { status: 400 });
    }),
];

if (process.env.MSW_MODE === 'test') {
    handlers = handlers
        .concat(Object.values(testHandlers))
        .concat(Object.values(omsorgspengerutbetalingHandlers))
        .concat(Object.values(midlertidigAleneHandlers))
        .concat(Object.values(aleneOmOmsorgenHandlers));
}

export { handlers };
