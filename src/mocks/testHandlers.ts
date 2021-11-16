// eslint-disable-next-line import/no-extraneous-dependencies
import { rest } from 'msw';
import journalpost from '../../cypress/fixtures/journalpost.json';
import pleiepengerSoknad from '../../cypress/fixtures/pleiepengerSoknad.json';
import pleiepengerSoknadSomKanSendesInn from '../../cypress/fixtures/pleiepengerSoknadSomKanSendesInn.json';
import pleiepengerSoknadValidering from '../../cypress/fixtures/pleiepengerSoknadValidering.json';

const BACKEND_BASE_URL = 'http://localhost:8101';

// eslint-disable-next-line import/prefer-default-export
export const testHandlers = {
    me: rest.get(`${BACKEND_BASE_URL}/me`, (req, res, ctx) =>
        res(ctx.status(200), ctx.json({ name: 'Bobby Binders' }))
    ),
    hentJournalpost: rest.get(`${BACKEND_BASE_URL}/api/k9-punsj/journalpost/200`, (req, res, ctx) =>
        res(ctx.json(journalpost))
    ),
    opprettePleiepengesoknad: rest.post(
        `${BACKEND_BASE_URL}/api/k9-punsj/pleiepenger-sykt-barn-soknad`,
        (req, res, ctx) => res(ctx.status(201), ctx.json(pleiepengerSoknad))
    ),
    hentSoknader: rest.post(`${BACKEND_BASE_URL}/api/k9-punsj/journalpost/hent`, (req, res, ctx) =>
        res(ctx.json({ poster: [] }))
    ),
    hentMappe: rest.get(`${BACKEND_BASE_URL}/api/k9-punsj/pleiepenger-sykt-barn-soknad/mappe`, (req, res, ctx) =>
        res(
            ctx.json({
                søker: '29099000129',
                fagsakTypeKode: 'PSB',
                søknader: [],
            })
        )
    ),
    infoPleiepenger: rest.post(
        `${BACKEND_BASE_URL}/api/k9-punsj/pleiepenger-sykt-barn-soknad/k9sak/info`,
        (req, res, ctx) => res(ctx.json([]))
    ),
    eksisterendePleiepengesoknad: rest.get(
        `${BACKEND_BASE_URL}/api/k9-punsj/pleiepenger-sykt-barn-soknad/mappe/0416e1a2-8d80-48b1-a56e-ab4f4b4821fe`,
        (req, res, ctx) => res(ctx.json(journalpost))
    ),
    oppdaterPleiepengesoknad: rest.put(
        `${BACKEND_BASE_URL}/api/k9-punsj/pleiepenger-sykt-barn-soknad/oppdater`,
        (req, res, ctx) => res(ctx.json(pleiepengerSoknadSomKanSendesInn))
    ),
    validerPleiepengesoknad: rest.post(
        `${BACKEND_BASE_URL}/api/k9-punsj/pleiepenger-sykt-barn-soknad/valider`,
        (req, res, ctx) => res(ctx.status(202), ctx.json(pleiepengerSoknadValidering))
    ),
    sendPleiepengesoknad: rest.post(
        `${BACKEND_BASE_URL}/api/k9-punsj/pleiepenger-sykt-barn-soknad/send`,
        (req, res, ctx) => res(ctx.status(202), ctx.json(pleiepengerSoknadValidering))
    ),
};
