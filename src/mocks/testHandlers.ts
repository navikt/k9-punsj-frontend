// eslint-disable-next-line import/no-extraneous-dependencies
import { rest } from 'msw';
import { ApiPath } from 'app/apiConfig';
import { BACKEND_BASE_URL } from './konstanter';
import journalpost from '../../cypress/fixtures/journalpost.json';
import pleiepengerSoknad from '../../cypress/fixtures/pleiepengerSoknad.json';
import pleiepengerSoknadSomKanSendesInn from '../../cypress/fixtures/pleiepengerSoknadSomKanSendesInn.json';
import pleiepengerSoknadValidering from '../../cypress/fixtures/pleiepengerSoknadValidering.json';
import arbeidsgivere from '../../cypress/fixtures/arbeidsgivere.json';
import korrigeringAvInntektsmeldingSoknad from '../../cypress/fixtures/korrigeringAvInntektsmeldingSoknad.json';
import korrigeringAvInntektsmeldingSoknadSomKanSendesInn from '../../cypress/fixtures/korrigeringAvInntektsmeldingSoknadSomKanSendesInn.json';
import korrigeringAvInntektsmeldingSoknadValidering from '../../cypress/fixtures/korrigeringAvInntektsmeldingSoknadValidering.json';
import korrigeringAvInntektsmeldingSoknadValideringFailed from '../../cypress/fixtures/korrigeringAvInntektsmeldingSoknadValideringFailed.json';
import omsorgspengerKsSoknadSomKanSendesInn from '../../cypress/fixtures/omp_ks/soknadSomKanSendesInn.json';
import omsorgspengerKsSoknadValidering from '../../cypress/fixtures/omp_ks/soknadValidering.json';

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
    hentArbeidsgivere: rest.get(`${BACKEND_BASE_URL}/api/k9-punsj/arbeidsgivere`, (req, res, ctx) =>
        res(ctx.status(202), ctx.json(arbeidsgivere))
    ),
    hentArbeidsforholdMedIDer: rest.post(
        `${BACKEND_BASE_URL}/api/k9-punsj/omsorgspenger-soknad/k9sak/arbeidsforholdIder`,
        (req, res, ctx) => res(ctx.status(202), ctx.json([]))
    ),
    oppretteKorrigering: rest.post(`${BACKEND_BASE_URL}/api/k9-punsj/omsorgspenger-soknad`, (req, res, ctx) =>
        res(ctx.status(201), ctx.json(korrigeringAvInntektsmeldingSoknad))
    ),
    oppdaterKorrigering: rest.put(`${BACKEND_BASE_URL}/api/k9-punsj/omsorgspenger-soknad/oppdater`, (req, res, ctx) =>
        res(ctx.json(korrigeringAvInntektsmeldingSoknadSomKanSendesInn))
    ),
    validerKorrigering: rest.post(`${BACKEND_BASE_URL}/api/k9-punsj/omsorgspenger-soknad/valider`, (req, res, ctx) => {
        if (req?.body && typeof req.body === 'object' && req.body.fravaersperioder?.length === 0) {
            return res(ctx.status(400), ctx.json(korrigeringAvInntektsmeldingSoknadValideringFailed));
        }
        return res(ctx.status(202), ctx.json(korrigeringAvInntektsmeldingSoknadValidering));
    }),
    sendKorrigering: rest.post(`${BACKEND_BASE_URL}/api/k9-punsj/omsorgspenger-soknad/send`, (req, res, ctx) =>
        res(ctx.status(202), ctx.json(korrigeringAvInntektsmeldingSoknadValidering))
    ),
    aktørId: rest.get('http://localhost:8101/api/k9-punsj/brev/aktorId', (req, res, ctx) =>
        res(ctx.json(200), ctx.json(81549300))
    ),

    /**
     * Omsorgspenger kronisk sykt barn
     */
    hentOmsorgspengerKroniskSyktBarnMappe: rest.get(
        `${BACKEND_BASE_URL}/api/k9-punsj/omsorgspenger-kronisk-sykt-barn-soknad/mappe`,
        (req, res, ctx) =>
            res(
                ctx.json({
                    søker: '29099000129',
                    fagsakTypeKode: 'OMP_KS',
                    søknader: [],
                })
            )
    ),
    oppdaterOmsorgspengerKroniskSyktBarnSøknad: rest.put(
        `${BACKEND_BASE_URL}/api/k9-punsj/omsorgspenger-kronisk-sykt-barn-soknad/oppdater`,
        (req, res, ctx) => res(ctx.json(omsorgspengerKsSoknadSomKanSendesInn))
    ),
    validerOmsorgspengerKroniskSyktBarnSøknad: rest.post(
        `${BACKEND_BASE_URL}/api/k9-punsj/omsorgspenger-kronisk-sykt-barn-soknad/valider`,
        (req, res, ctx) => res(ctx.status(202), ctx.json(omsorgspengerKsSoknadValidering))
    ),
    sendOmsorgspengerKroniskSyktBarnSøknad: rest.post(
        `${BACKEND_BASE_URL}/api/k9-punsj/omsorgspenger-kronisk-sykt-barn-soknad/send`,
        (req, res, ctx) => res(ctx.status(202), ctx.json(omsorgspengerKsSoknadValidering))
    ),
    barn: rest.get(`${BACKEND_BASE_URL}/api/k9-punsj/barn`, (req, res, ctx) =>
        res(
            ctx.status(200),
            ctx.json({
                barn: [
                    { fornavn: 'Geir-Paco', etternavn: 'Gundersen', identitetsnummer: '02021477330' },
                    { fornavn: 'Hallo', etternavn: 'Hansen', identitetsnummer: '03091477490' },
                    { fornavn: 'Tom', etternavn: 'Tanks', identitetsnummer: '09081478047' },
                    
                ],
            })
        )
    ),
    sjekkSkalTilK9: rest.post(`http://localhost:8101/api/k9-punsj${ApiPath.SJEKK_OM_SKAL_TIL_K9SAK}`, (req, res, ctx) =>
        res(ctx.status(200), ctx.json({ k9sak: true }))
    ),
};
