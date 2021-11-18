/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/prefer-default-export */
import PunsjInnsendingType from 'app/models/enums/PunsjInnsendingType';
import { rest } from 'msw';

export const handlers = [
    rest.get('http://localhost:8101/api/k9-punsj/journalpost/001115578', (req, res, ctx) =>
        res(
            ctx.status(200),
            ctx.json({
                journalpostId: '001115578',
                norskIdent: '001115578',
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
];
