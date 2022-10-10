/* eslint-disable import/no-mutable-exports */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/prefer-default-export */
import PunsjInnsendingType from 'app/models/enums/PunsjInnsendingType';
import { rest } from 'msw';
import omsorgspengerutbetalingHandlers from './omsorgspengeutbetalingHandlers';
import { testHandlers } from './testHandlers';

let handlers = [
    rest.get('/api/test', (req, res, ctx) => res(ctx.status(200), ctx.json({ name: 'Bobby Binders' }))),
    rest.get(
        'http://localhost:8101/api/k9-formidling/brev/maler?sakstype=OMP&avsenderApplikasjon=K9PUNSJ',
        (req, res, ctx) =>
            res(
                ctx.status(200),
                ctx.json({
                    INNHEN: { navn: 'Innhent dokumentasjon', mottakere: [] },
                    GENERELT_FRITEKSTBREV: { navn: 'Fritekst generelt brev', mottakere: [] },
                })
            )
    ),
    rest.get('http://localhost:8101/api/k9-punsj/journalpost/202', (req, res, ctx) =>
        res(
            ctx.status(200),
            ctx.json({
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
            })
        )
    ),
    rest.post('http://localhost:8101/api/k9-punsj/brev/bestill', (req, res, ctx) => res(ctx.status(200))),
    rest.get('http://localhost:8101/api/k9-punsj/person', (req, res, ctx) =>
        res(
            ctx.status(200),
            ctx.json({
                etternavn: 'KAKE',
                fornavn: 'TUNGSINDIG',
                fødselsdato: '1981-12-18',
                identitetsnummer: '18128103429',
                mellomnavn: null,
                sammensattNavn: 'TUNGSINDIG KAKE',
            })
        )
    ),
    testHandlers.barn,
    rest.get('http://localhost:8101/api/k9-punsj/saker/hent', (req, res, ctx) =>
        res(
            ctx.status(200),
            ctx.delay(500),
            ctx.json([
                {
                    fagsakId: '1DMU93M',
                    sakstype: 'PSB',
                },
                {
                    fagsakId: '1DMUDF6',
                    sakstype: 'OMP',
                },
            ])
        )
    ),
    rest.post('http://localhost:8101/api/k9-punsj/notat/opprett', (req, res, ctx) =>
        res(ctx.status(201), ctx.delay(500), ctx.json({ journalpostId: '200' }))
    ),
];

if (process.env.MSW_MODE === 'test') {
    handlers = handlers
        .concat(Object.values(testHandlers))
        .concat([omsorgspengerutbetalingHandlers.eksisterendePerioderOmsorgspengeutbetaling]);
}

export { handlers };
