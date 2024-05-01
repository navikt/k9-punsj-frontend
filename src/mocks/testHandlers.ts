// eslint-disable-next-line import/no-extraneous-dependencies
import { http, HttpResponse, delay } from 'msw';
import { ApiPath } from 'app/apiConfig';
import arbeidsgivere from '../../cypress/fixtures/arbeidsgivere.json';
import journalpost from '../../cypress/fixtures/journalpost.json';
import korrigeringAvInntektsmeldingSoknadSomKanSendesInn from '../../cypress/fixtures/korrigeringAvInntektsmeldingSoknadSomKanSendesInn.json';
import korrigeringAvInntektsmeldingSoknadValidering from '../../cypress/fixtures/korrigeringAvInntektsmeldingSoknadValidering.json';
import korrigeringAvInntektsmeldingSoknadValideringFailed from '../../cypress/fixtures/korrigeringAvInntektsmeldingSoknadValideringFailed.json';
import omsorgspengerKsSoknadSomKanSendesInn from '../../cypress/fixtures/omp_ks/soknadSomKanSendesInn.json';
import omsorgspengerKsSoknadValidering from '../../cypress/fixtures/omp_ks/soknadValidering.json';
import pleiepengerSoknad from '../../cypress/fixtures/pleiepengerSoknad.json';
import pleiepengerSoknadSomKanSendesInn from '../../cypress/fixtures/pleiepengerSoknadSomKanSendesInn.json';
import pleiepengerSoknadValidering from '../../cypress/fixtures/pleiepengerSoknadValidering.json';
import journalpost300 from '../../cypress/fixtures/journalpost300.json';

// eslint-disable-next-line import/prefer-default-export
export const testHandlers = {
    hentJournalpost: http.get(ApiPath.JOURNALPOST_GET.replace('{journalpostId}', ':id'), ({ params }) => {
        if (params.id === '300') {
            return HttpResponse.json(journalpost300);
        }
        return HttpResponse.json({ ...journalpost, journalpostId: params.id });
    }),
    opprettePleiepengesoknad: http.post(ApiPath.PSB_SOKNAD_CREATE, () =>
        HttpResponse.json(pleiepengerSoknad, { status: 201 }),
    ),
    hentMappe: http.get(ApiPath.PSB_EKSISTERENDE_SOKNADER_FIND, () =>
        HttpResponse.json({
            søker: '29099000129',
            fagsakTypeKode: 'PSB',
            søknader: [],
        }),
    ),
    infoPleiepenger: http.post(ApiPath.PSB_K9SAK_PERIODER, () => HttpResponse.json([])),
    eksisterendePleiepengesoknad: http.get(
        ApiPath.PSB_SOKNAD_GET.replace('{id}', '0416e1a2-8d80-48b1-a56e-ab4f4b4821fe'),
        () => HttpResponse.json(journalpost),
    ),
    oppdaterPleiepengesoknad: http.put(ApiPath.PSB_SOKNAD_UPDATE, () =>
        HttpResponse.json(pleiepengerSoknadSomKanSendesInn),
    ),

    validerPleiepengesoknad: http.post(ApiPath.PSB_SOKNAD_VALIDER, () =>
        HttpResponse.json(pleiepengerSoknadValidering, { status: 202 }),
    ),
    sendPleiepengesoknad: http.post(ApiPath.PSB_SOKNAD_SUBMIT, () =>
        HttpResponse.json(pleiepengerSoknadValidering, { status: 202 }),
    ),

    hentArbeidsgivere: http.get(ApiPath.FINN_ARBEIDSGIVERE, () => HttpResponse.json(arbeidsgivere, { status: 202 })),
    hentArbeidsforholdMedIDer: http.post(ApiPath.OMS_FINN_ARBEIDSFORHOLD, () => HttpResponse.json([], { status: 202 })),

    oppdaterKorrigering: http.put(ApiPath.OMS_SOKNAD_UPDATE, () =>
        HttpResponse.json(korrigeringAvInntektsmeldingSoknadSomKanSendesInn),
    ),

    validerKorrigering: http.post(ApiPath.OMS_SOKNAD_VALIDER, async ({ request }) => {
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
    sendKorrigering: http.post(ApiPath.OMS_SOKNAD_SUBMIT, () =>
        HttpResponse.json(korrigeringAvInntektsmeldingSoknadValidering, { status: 202 }),
    ),

    aktørId: http.get(ApiPath.BREV_AKTØRID, () => HttpResponse.json(81549300, { status: 200 })),

    /**
     * Omsorgspenger kronisk sykt barn
     */
    hentOmsorgspengerKroniskSyktBarnMappe: http.get(ApiPath.OMP_KS_EKSISTERENDE_SOKNADER_FIND, () =>
        HttpResponse.json({
            søker: '29099000129',
            fagsakTypeKode: 'OMP_KS',
            søknader: [],
        }),
    ),

    oppdaterOmsorgspengerKroniskSyktBarnSøknad: http.put(ApiPath.OMP_KS_SOKNAD_UPDATE, () =>
        HttpResponse.json(omsorgspengerKsSoknadSomKanSendesInn),
    ),

    validerOmsorgspengerKroniskSyktBarnSøknad: http.post(ApiPath.OMP_KS_SOKNAD_VALIDER, () =>
        HttpResponse.json(omsorgspengerKsSoknadValidering, { status: 202 }),
    ),

    sendOmsorgspengerKroniskSyktBarnSøknad: http.post(ApiPath.OMP_KS_SOKNAD_SUBMIT, () =>
        HttpResponse.json(omsorgspengerKsSoknadValidering, { status: 202 }),
    ),

    /*
        Omsorgspenger - utbetaling
    */

    barn: http.get(ApiPath.BARN_GET, () =>
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

    gosysKategorier: http.get(ApiPath.GOSYS_GJELDER, () =>
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

    hentFagsaker: http.get(ApiPath.HENT_FAGSAK_PÅ_IDENT, async () => {
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
        ApiPath.JOURNALPOST_SETT_BEHANDLINGSÅR.replace('{journalpostId}', ':id'),
        () =>
            new HttpResponse(null, {
                status: 200,
            }),
    ),
};
