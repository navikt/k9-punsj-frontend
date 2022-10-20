// eslint-disable-next-line import/no-extraneous-dependencies
import { rest } from 'msw';
import { ApiPath } from 'app/apiConfig';
import { BACKEND_BASE_URL, LOCAL_API_URL } from './konstanter';
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
    hentJournalpost: rest.get(`${LOCAL_API_URL}/journalpost/200`, (req, res, ctx) => res(ctx.json(journalpost))),
    opprettePleiepengesoknad: rest.post(`${LOCAL_API_URL}/pleiepenger-sykt-barn-soknad`, (req, res, ctx) =>
        res(ctx.status(201), ctx.json(pleiepengerSoknad))
    ),
    hentSoknader: rest.post(`${LOCAL_API_URL}/journalpost/hent`, (req, res, ctx) => res(ctx.json({ poster: [] }))),
    hentMappe: rest.get(`${LOCAL_API_URL}/pleiepenger-sykt-barn-soknad/mappe`, (req, res, ctx) =>
        res(
            ctx.json({
                søker: '29099000129',
                fagsakTypeKode: 'PSB',
                søknader: [],
            })
        )
    ),
    infoPleiepenger: rest.post(`${LOCAL_API_URL}/pleiepenger-sykt-barn-soknad/k9sak/info`, (req, res, ctx) =>
        res(ctx.json([]))
    ),
    eksisterendePleiepengesoknad: rest.get(
        `${LOCAL_API_URL}/pleiepenger-sykt-barn-soknad/mappe/0416e1a2-8d80-48b1-a56e-ab4f4b4821fe`,
        (req, res, ctx) => res(ctx.json(journalpost))
    ),
    oppdaterPleiepengesoknad: rest.put(`${LOCAL_API_URL}/pleiepenger-sykt-barn-soknad/oppdater`, (req, res, ctx) =>
        res(ctx.json(pleiepengerSoknadSomKanSendesInn))
    ),
    validerPleiepengesoknad: rest.post(`${LOCAL_API_URL}/pleiepenger-sykt-barn-soknad/valider`, (req, res, ctx) =>
        res(ctx.status(202), ctx.json(pleiepengerSoknadValidering))
    ),
    sendPleiepengesoknad: rest.post(`${LOCAL_API_URL}/pleiepenger-sykt-barn-soknad/send`, (req, res, ctx) =>
        res(ctx.status(202), ctx.json(pleiepengerSoknadValidering))
    ),
    hentArbeidsgivere: rest.get(`${LOCAL_API_URL}/arbeidsgivere`, (req, res, ctx) =>
        res(ctx.status(202), ctx.json(arbeidsgivere))
    ),
    hentArbeidsforholdMedIDer: rest.post(
        `${LOCAL_API_URL}/omsorgspenger-soknad/k9sak/arbeidsforholdIder`,
        (req, res, ctx) => res(ctx.status(202), ctx.json([]))
    ),
    oppretteKorrigering: rest.post(`${LOCAL_API_URL}/omsorgspenger-soknad`, (req, res, ctx) =>
        res(ctx.status(201), ctx.json(korrigeringAvInntektsmeldingSoknad))
    ),
    oppdaterKorrigering: rest.put(`${LOCAL_API_URL}/omsorgspenger-soknad/oppdater`, (req, res, ctx) =>
        res(ctx.json(korrigeringAvInntektsmeldingSoknadSomKanSendesInn))
    ),
    validerKorrigering: rest.post(`${LOCAL_API_URL}/omsorgspenger-soknad/valider`, (req, res, ctx) => {
        if (req?.body && typeof req.body === 'object' && req.body.fravaersperioder?.length === 0) {
            return res(ctx.status(400), ctx.json(korrigeringAvInntektsmeldingSoknadValideringFailed));
        }
        return res(ctx.status(202), ctx.json(korrigeringAvInntektsmeldingSoknadValidering));
    }),
    sendKorrigering: rest.post(`${LOCAL_API_URL}/omsorgspenger-soknad/send`, (req, res, ctx) =>
        res(ctx.status(202), ctx.json(korrigeringAvInntektsmeldingSoknadValidering))
    ),
    aktørId: rest.get('http://localhost:8101/api/k9-punsj/brev/aktorId', (req, res, ctx) =>
        res(ctx.json(200), ctx.json(81549300))
    ),

    /**
     * Omsorgspenger kronisk sykt barn
     */
    hentOmsorgspengerKroniskSyktBarnMappe: rest.get(
        `${LOCAL_API_URL}/omsorgspenger-kronisk-sykt-barn-soknad/mappe`,
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
        `${LOCAL_API_URL}/omsorgspenger-kronisk-sykt-barn-soknad/oppdater`,
        (req, res, ctx) => res(ctx.json(omsorgspengerKsSoknadSomKanSendesInn))
    ),
    validerOmsorgspengerKroniskSyktBarnSøknad: rest.post(
        `${LOCAL_API_URL}/omsorgspenger-kronisk-sykt-barn-soknad/valider`,
        (req, res, ctx) => res(ctx.status(202), ctx.json(omsorgspengerKsSoknadValidering))
    ),
    sendOmsorgspengerKroniskSyktBarnSøknad: rest.post(
        `${LOCAL_API_URL}/omsorgspenger-kronisk-sykt-barn-soknad/send`,
        (req, res, ctx) => res(ctx.status(202), ctx.json(omsorgspengerKsSoknadValidering))
    ),
    barn: rest.get(`${LOCAL_API_URL}/barn`, (req, res, ctx) =>
        res(
            ctx.status(200),
            ctx.json({
                barn: [
                    { fornavn: 'Preben', etternavn: 'Figenschou Ferd', identitetsnummer: '02021477330' },
                    { fornavn: 'Hallo', etternavn: 'Hansen', identitetsnummer: '03091477490' },
                    { fornavn: 'Tom', etternavn: 'Tanks', identitetsnummer: '09081478047' },
                ],
            })
        )
    ),
    gosysKategorier: rest.get(`${LOCAL_API_URL}/gosys/gjelder`, (req, res, ctx) =>
        res(
            ctx.json({
                Anke: 'Anke',
                Annet: 'Gjelder noe annet, må velges i Gosys',
                Klage: 'Klage',
                Omsorgspenger: 'Omsorgspenger',
                Opplæringspenger: 'Opplæringspenger',
                PleiepengerPårørende: 'Pleiepenger pårørende',
                PleiepengerSyktBarn: 'Pleiepenger ny ordning',
            })
        )
    ),
    skalTilK9Sak: rest.post(`${LOCAL_API_URL}${ApiPath.SJEKK_OM_SKAL_TIL_K9SAK}`, (req, res, ctx) =>
        res(
            ctx.json({
                k9sak: true,
            })
        )
    ),
    hentFagsaker: rest.get('http://localhost:8101/api/k9-punsj/saker/hent', (req, res, ctx) =>
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
};
