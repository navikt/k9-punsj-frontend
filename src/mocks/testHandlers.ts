// eslint-disable-next-line import/no-extraneous-dependencies
import { http, HttpResponse, delay } from 'msw';
import arbeidsgivere from '../../cypress/fixtures/arbeidsgivere.json';
import journalpost from '../../cypress/fixtures/journalpost.json';
import korrigeringAvInntektsmeldingSoknad from '../../cypress/fixtures/korrigeringAvInntektsmeldingSoknad.json';
import korrigeringAvInntektsmeldingSoknadSomKanSendesInn from '../../cypress/fixtures/korrigeringAvInntektsmeldingSoknadSomKanSendesInn.json';
import korrigeringAvInntektsmeldingSoknadValidering from '../../cypress/fixtures/korrigeringAvInntektsmeldingSoknadValidering.json';
import korrigeringAvInntektsmeldingSoknadValideringFailed from '../../cypress/fixtures/korrigeringAvInntektsmeldingSoknadValideringFailed.json';
import omsorgspengerKsSoknadSomKanSendesInn from '../../cypress/fixtures/omp_ks/soknadSomKanSendesInn.json';
import omsorgspengerKsSoknadValidering from '../../cypress/fixtures/omp_ks/soknadValidering.json';
import pleiepengerSoknad from '../../cypress/fixtures/pleiepengerSoknad.json';
import pleiepengerSoknadSomKanSendesInn from '../../cypress/fixtures/pleiepengerSoknadSomKanSendesInn.json';
import pleiepengerSoknadValidering from '../../cypress/fixtures/pleiepengerSoknadValidering.json';
import { BACKEND_BASE_URL, LOCAL_API_URL } from './konstanter';

// eslint-disable-next-line import/prefer-default-export
export const testHandlers = {
    me: http.get(`${BACKEND_BASE_URL}/me`, () => HttpResponse.json({ name: 'Bobby Binders' }, { status: 200 })),
    hentJournalpost: http.get(`${LOCAL_API_URL}/journalpost/:id`, ({ params }) =>
        HttpResponse.json({ ...journalpost, journalpostId: params.id }),
    ),
    opprettePleiepengesoknad: http.post(`${LOCAL_API_URL}/pleiepenger-sykt-barn-soknad`, () =>
        HttpResponse.json(pleiepengerSoknad, { status: 201 }),
    ),
    hentSoknader: http.post(`${LOCAL_API_URL}/journalpost/hent`, () => HttpResponse.json({ poster: [] })),
    hentMappe: http.get(`${LOCAL_API_URL}/pleiepenger-sykt-barn-soknad/mappe`, () =>
        HttpResponse.json({
            søker: '29099000129',
            fagsakTypeKode: 'PSB',
            søknader: [],
        }),
    ),
    infoPleiepenger: http.post(`${LOCAL_API_URL}/pleiepenger-sykt-barn-soknad/k9sak/info`, () => HttpResponse.json([])),
    eksisterendePleiepengesoknad: http.get(
        `${LOCAL_API_URL}/pleiepenger-sykt-barn-soknad/mappe/0416e1a2-8d80-48b1-a56e-ab4f4b4821fe`,
        () => HttpResponse.json(journalpost),
    ),
    oppdaterPleiepengesoknad: http.put(`${LOCAL_API_URL}/pleiepenger-sykt-barn-soknad/oppdater`, () =>
        HttpResponse.json(pleiepengerSoknadSomKanSendesInn),
    ),

    validerPleiepengesoknad: http.post(`${LOCAL_API_URL}/pleiepenger-sykt-barn-soknad/valider`, () =>
        HttpResponse.json(pleiepengerSoknadValidering, { status: 202 }),
    ),
    sendPleiepengesoknad: http.post(`${LOCAL_API_URL}/pleiepenger-sykt-barn-soknad/send`, () =>
        HttpResponse.json(pleiepengerSoknadValidering, { status: 202 }),
    ),

    hentArbeidsgivere: http.get(`${LOCAL_API_URL}/arbeidsgivere`, () =>
        HttpResponse.json(arbeidsgivere, { status: 202 }),
    ),
    hentArbeidsforholdMedIDer: http.post(`${LOCAL_API_URL}/omsorgspenger-soknad/k9sak/arbeidsforholdIder`, () =>
        HttpResponse.json([], { status: 202 }),
    ),

    oppretteKorrigering: http.post(`${LOCAL_API_URL}/omsorgspenger-soknad`, () =>
        HttpResponse.json(korrigeringAvInntektsmeldingSoknad, { status: 201 }),
    ),

    oppdaterKorrigering: http.put(`${LOCAL_API_URL}/omsorgspenger-soknad/oppdater`, () =>
        HttpResponse.json(korrigeringAvInntektsmeldingSoknadSomKanSendesInn),
    ),

    validerKorrigering: http.post(`${LOCAL_API_URL}/omsorgspenger-soknad/valider`, async ({ request }) => {
        const body = await request.json();

        if (
            body !== null &&
            typeof body === 'object' &&
            Object.prototype.hasOwnProperty.call(body, 'fravaersperioder') &&
            Array.isArray(body.fravaersperioder) &&
            body.fravaersperioder.length === 0
        ) {
            const jsonData = JSON.parse(JSON.stringify(korrigeringAvInntektsmeldingSoknadValideringFailed));
            return HttpResponse.json(jsonData, { status: 400 });
        }

        return HttpResponse.json(korrigeringAvInntektsmeldingSoknadValidering, { status: 202 });
    }),
    sendKorrigering: http.post(`${LOCAL_API_URL}/omsorgspenger-soknad/send`, () =>
        HttpResponse.json(korrigeringAvInntektsmeldingSoknadValidering, { status: 202 }),
    ),

    aktørId: http.get('http://localhost:8101/api/k9-punsj/brev/aktorId', () =>
        HttpResponse.json(81549300, { status: 200 }),
    ),

    /**
     * Omsorgspenger kronisk sykt barn
     */
    hentOmsorgspengerKroniskSyktBarnMappe: http.get(
        `${LOCAL_API_URL}/omsorgspenger-kronisk-sykt-barn-soknad/mappe`,
        () =>
            HttpResponse.json({
                søker: '29099000129',
                fagsakTypeKode: 'OMP_KS',
                søknader: [],
            }),
    ),

    oppdaterOmsorgspengerKroniskSyktBarnSøknad: http.put(
        `${LOCAL_API_URL}/omsorgspenger-kronisk-sykt-barn-soknad/oppdater`,
        () => HttpResponse.json(omsorgspengerKsSoknadSomKanSendesInn),
    ),

    validerOmsorgspengerKroniskSyktBarnSøknad: http.post(
        `${LOCAL_API_URL}/omsorgspenger-kronisk-sykt-barn-soknad/valider`,
        () => HttpResponse.json(omsorgspengerKsSoknadValidering, { status: 202 }),
    ),

    sendOmsorgspengerKroniskSyktBarnSøknad: http.post(
        `${LOCAL_API_URL}/omsorgspenger-kronisk-sykt-barn-soknad/send`,
        () => HttpResponse.json(omsorgspengerKsSoknadValidering, { status: 202 }),
    ),

    /*
        Omsorgspenger - utbetaling
    */

    barn: http.get(`${LOCAL_API_URL}/barn`, () =>
        HttpResponse.json(
            {
                barn: [
                    { fornavn: 'Geir-Paco', etternavn: 'Gundersen', identitetsnummer: '02021477330' },
                    { fornavn: 'Hallo', etternavn: 'Hansen', identitetsnummer: '03091477490' },
                    { fornavn: 'Tom', etternavn: 'Tanks', identitetsnummer: '09081478047' },
                ],
            },
            { status: 200 },
        ),
    ),

    gosysKategorier: http.get(`${LOCAL_API_URL}/gosys/gjelder`, () =>
        HttpResponse.json({
            Anke: 'Anke',
            Annet: 'Gjelder noe annet, må velges i Gosys',
            Klage: 'Klage',
            Omsorgspenger: 'Omsorgspenger',
            Opplæringspenger: 'Opplæringspenger',
            PleiepengerPårørende: 'Pleiepenger pårørende',
            PleiepengerSyktBarn: 'Pleiepenger ny ordning',
        }),
    ),

    hentFagsaker: http.get('http://localhost:8101/api/k9-punsj/saker/hent', async () => {
        await delay(500);
        return HttpResponse.json(
            [
                {
                    fagsakId: '1DMU93M',
                    sakstype: 'PSB',
                },
                {
                    fagsakId: '1DMUDF6',
                    sakstype: 'OMP',
                },
            ],
            { status: 200 },
        );
    }),

    settBehandlingsaar: http.post(
        `${LOCAL_API_URL}/journalpost/settBehandlingsAar/:journalpost`,
        () =>
            new HttpResponse(null, {
                status: 200,
            }),
    ),
};
