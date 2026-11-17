import { ApiPath } from 'app/apiConfig';
import { http, HttpResponse } from 'msw/http';
import journalpostFixture from '../../cypress/fixtures/jpPSB300.json';
import fagsaker from '../../cypress/fixtures/fagsaker.json';
import { FORDELING_PSB_SCENARIOS } from './fordelingPsbTestScenarioIds';

type TestJournalpost = {
    [property: string]: unknown;
    journalpostId: string;
    erFerdigstilt: boolean;
    journalpostStatus: string;
    sak: {
        [property: string]: unknown;
        fagsakId: string | null;
        sakstype: string;
        gyldigPeriode: unknown;
        pleietrengendeIdent: string | null;
    };
};

const scenario = (journalpostId: string, fagsakIndex: 0 | 2) => {
    const fagsak = fagsaker[fagsakIndex];
    let journalpost: TestJournalpost = { ...journalpostFixture, journalpostId };

    return [
        http.get(ApiPath.JOURNALPOST_GET.replace('{journalpostId}', journalpostId), () =>
            HttpResponse.json(journalpost),
        ),
        http.post(ApiPath.JOURNALPOST_MOTTAK, async ({ request }) => {
            const body = (await request.clone().json()) as { journalpostId?: string };
            if (body.journalpostId !== journalpostId) return;

            journalpost = {
                ...journalpost,
                erFerdigstilt: true,
                journalpostStatus: 'JOURNALFOERT',
                sak: {
                    fagsakId: fagsak.fagsakId,
                    sakstype: fagsak.sakstype,
                    gyldigPeriode: fagsak.gyldigPeriode,
                    pleietrengendeIdent: fagsak.pleietrengende?.identitetsnummer ?? null,
                    relatertPersonIdent: null,
                    reservertSaksnummer: false,
                },
            };

            return HttpResponse.json({ saksnummer: fagsak.fagsakId }, { status: 200 });
        }),
        http.post(
            ApiPath.JOURNALPOST_SETT_PAA_VENT.replace('{journalpostId}', journalpostId),
            () => new HttpResponse(null, { status: 200 }),
        ),
    ];
};

const reservedNumberScenario = (
    journalpostId: string,
    saksnummer: string,
    pleietrengendeIdent: string,
    gyldigPeriode: { fom: string; tom: string },
) => {
    let journalpost: TestJournalpost = { ...journalpostFixture, journalpostId };
    return [
        http.get(ApiPath.JOURNALPOST_GET.replace('{journalpostId}', journalpostId), () =>
            HttpResponse.json(journalpost),
        ),
        http.post(ApiPath.JOURNALPOST_MOTTAK, async ({ request }) => {
            const body = (await request.clone().json()) as { journalpostId?: string };
            if (body.journalpostId !== journalpostId) return;
            journalpost = {
                ...journalpostFixture,
                journalpostId,
                erFerdigstilt: true,
                journalpostStatus: 'JOURNALFOERT',
                sak: {
                    fagsakId: saksnummer,
                    sakstype: 'PSB',
                    pleietrengendeIdent,
                    gyldigPeriode,
                    relatertPersonIdent: null,
                    reservertSaksnummer: true,
                },
            };
            return HttpResponse.json({ saksnummer }, { status: 200 });
        }),
    ];
};

const mockHandlersFordelingPsb = [
    ...scenario(FORDELING_PSB_SCENARIOS.selection, 0),
    ...scenario(FORDELING_PSB_SCENARIOS.classify, 2),
    ...scenario(FORDELING_PSB_SCENARIOS.resetApplicant, 0),
    ...scenario(FORDELING_PSB_SCENARIOS.resetDocumentType, 0),
    ...scenario(FORDELING_PSB_SCENARIOS.emptyCasesWithChildren, 0),
    ...scenario(FORDELING_PSB_SCENARIOS.emptyCasesWithoutChildren, 0),
    ...scenario(FORDELING_PSB_SCENARIOS.matchingCasesWithoutChildren, 0),
    ...scenario(FORDELING_PSB_SCENARIOS.otherBenefitCases, 0),
    ...scenario(FORDELING_PSB_SCENARIOS.caseLookupForbidden, 0),
    ...scenario(FORDELING_PSB_SCENARIOS.caseLookupError, 0),
    ...scenario(FORDELING_PSB_SCENARIOS.childLookupForbidden, 0),
    ...scenario(FORDELING_PSB_SCENARIOS.childLookupError, 0),
    ...reservedNumberScenario(
        FORDELING_PSB_SCENARIOS.reservedCase,
        fagsaker[3].fagsakId,
        fagsaker[3].pleietrengende!.identitetsnummer,
        fagsaker[3].gyldigPeriode,
    ),
    ...scenario(FORDELING_PSB_SCENARIOS.newCaseFlagFalse, 0),
    ...scenario(FORDELING_PSB_SCENARIOS.newCaseFlagTrue, 0),
    ...reservedNumberScenario(FORDELING_PSB_SCENARIOS.newCaseSuccess, 'NYPSB12', '18410162721', { fom: '', tom: '' }),
    ...scenario(FORDELING_PSB_SCENARIOS.newCaseConflict, 0),
    ...scenario(FORDELING_PSB_SCENARIOS.twoApplicants, 2),
    http.post(ApiPath.JOURNALPOST_KOPIERE.replace('{journalpostId}', FORDELING_PSB_SCENARIOS.twoApplicants), () =>
        HttpResponse.json(
            {
                nyJournalpostId: '9303171',
                saksnummer: 'KOPI123',
                til: '02918496664',
                pleietrengende: fagsaker[2].pleietrengende!.identitetsnummer,
                annenPart: null,
                ytelse: 'PSB',
            },
            { status: 201 },
        ),
    ),
];

export default mockHandlersFordelingPsb;
