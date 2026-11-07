import { expect, test, type Page, type Response } from '@playwright/test';

import barnFixture from '../../cypress/fixtures/barn.json' with { type: 'json' };
import fagsaker from '../../cypress/fixtures/fagsaker.json' with { type: 'json' };
import { ApiPath } from '../../src/app/apiConfig';
import { FORDELING_PSB_SCENARIOS } from '../../src/mocks/fordelingPsbTestScenarioIds';

const SØKER_ID = '17420373147';
const BARN_FRA_LISTE_ID = '18410162721';
const MANUELL_BARN_ID = '53488838241';
const GAMMEL_FAGSAK_ID = '1DQBDDC';
const GAMMELT_BARN_ID = '24420167209';
const FAGSAK_UTEN_BARN_ID = '1DMU93A';
const ANNEN_YTELSE_FAGSAK_ID = '1DMUDFB';
const PSB_FAGSAKER = [fagsaker[0], fagsaker[2]];

type LookupOverrides = {
    cases: unknown[];
    caseStatus?: number;
    children?: { barn: unknown[] };
    childStatus?: number;
};

const isApiResponse = (response: Response, method: string, path: string) =>
    response.request().method() === method && new URL(response.url()).pathname === path;

const journalpostPath = (journalpostId: string) => ApiPath.JOURNALPOST_GET.replace('{journalpostId}', journalpostId);
const ventPath = (journalpostId: string) => ApiPath.JOURNALPOST_SETT_PAA_VENT.replace('{journalpostId}', journalpostId);
const behandlingAarPath = (journalpostId: string) =>
    ApiPath.JOURNALPOST_SETT_BEHANDLINGSÅR.replace('{journalpostId}', journalpostId);
const copyPath = (journalpostId: string) => ApiPath.JOURNALPOST_KOPIERE.replace('{journalpostId}', journalpostId);
const closePath = (journalpostId: string) => ApiPath.JOURNALPOST_LUKK_OPPGAVE.replace('{journalpostId}', journalpostId);

const waitForLookup = (page: Page, path: string) =>
    page.waitForResponse(
        (response) =>
            isApiResponse(response, 'GET', path) &&
            response.request().headers()['x-nav-norskident'] === SØKER_ID,
    );

const expectLookupResponse = async (
    response: Response | undefined,
    path: string,
    status: number,
    expectedData?: unknown,
) => {
    if (!response) {
        throw new Error(`Oppslaget ${path} ble ikke sendt.`);
    }

    expect(response.request().method()).toBe('GET');
    expect(new URL(response.url()).pathname).toBe(path);
    expect(response.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(response.status()).toBe(status);
    expect(response.fromServiceWorker()).toBe(true);

    if (expectedData !== undefined) {
        expect(await response.json()).toEqual(expectedData);
    }
};

const installLookupOverrides = async (page: Page, overrides: LookupOverrides) => {
    await page.evaluate(
        ({ applicantId, casesPath, childPath, cases, caseStatus, children, childStatus }) => {
            const msw = window.msw;
            if (!msw) {
                throw new Error('MSW-testarbeideren er ikke tilgjengelig.');
            }

            const caseHandler = msw.http.get(casesPath, ({ request }) => {
                if (request.headers.get('X-Nav-NorskIdent') !== applicantId) return;
                if (caseStatus === 200) return msw.HttpResponse.json(cases);
                return new msw.HttpResponse(null, { status: caseStatus });
            });

            if (childStatus === undefined && children === undefined) {
                msw.worker.use(caseHandler);
                return;
            }

            msw.worker.use(
                caseHandler,
                msw.http.get(childPath, ({ request }) => {
                    if (request.headers.get('X-Nav-NorskIdent') !== applicantId) return;
                    const responseStatus = childStatus ?? 200;
                    if (responseStatus === 200) return msw.HttpResponse.json(children);
                    return new msw.HttpResponse(null, { status: responseStatus });
                }),
            );
        },
        {
            applicantId: SØKER_ID,
            casesPath: ApiPath.HENT_FAGSAK_PÅ_IDENT,
            childPath: ApiPath.BARN_GET,
            cases: overrides.cases,
            caseStatus: overrides.caseStatus ?? 200,
            children: overrides.children,
            childStatus: overrides.childStatus,
        },
    );
};

const installChildLookupRecoveryOverrides = async (page: Page, failureStatus: number) => {
    await page.evaluate(
        ({ applicantId, casesPath, childPath, children, failureStatus: initialFailureStatus }) => {
            const msw = window.msw;
            if (!msw) {
                throw new Error('MSW-testarbeideren er ikke tilgjengelig.');
            }

            let childRequestCount = 0;
            msw.worker.use(
                msw.http.get(casesPath, ({ request }) => {
                    if (request.headers.get('X-Nav-NorskIdent') !== applicantId) return;
                    return msw.HttpResponse.json([]);
                }),
                msw.http.get(childPath, ({ request }) => {
                    if (request.headers.get('X-Nav-NorskIdent') !== applicantId) return;
                    childRequestCount += 1;
                    if (childRequestCount === 1) {
                        return msw.HttpResponse.json(
                            { error: 'Child lookup failed' },
                            { status: initialFailureStatus },
                        );
                    }
                    return msw.HttpResponse.json(children);
                }),
            );
        },
        {
            applicantId: SØKER_ID,
            casesPath: ApiPath.HENT_FAGSAK_PÅ_IDENT,
            childPath: ApiPath.BARN_GET,
            children: barnFixture,
            failureStatus,
        },
    );
};

const openPsbJournalpost = async (page: Page, journalpostId: string) => {
    const responsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', journalpostPath(journalpostId)),
    );
    await page.goto(`/journalpost/${journalpostId}`);
    const response = await responsePromise;

    expect(response.status()).toBe(200);
    expect(response.fromServiceWorker()).toBe(true);
    expect(await response.json()).toMatchObject({
        journalpostId,
        erFerdigstilt: false,
        sak: { sakstype: 'PSB', fagsakId: null },
    });
};

const confirmApplicant = async (page: Page, journalpostId: string, expectsChildLookup = true) => {
    const casesResponsePromise = waitForLookup(page, ApiPath.HENT_FAGSAK_PÅ_IDENT);
    const childrenResponsePromise = expectsChildLookup ? waitForLookup(page, ApiPath.BARN_GET) : undefined;
    await page.getByRole('radio', { name: 'Ja' }).check();
    const [casesResponse, childrenResponse] = await Promise.all([
        casesResponsePromise,
        childrenResponsePromise ?? Promise.resolve(undefined),
    ]);
    await expect(page).toHaveURL((url) => url.pathname === `/journalpost/${journalpostId}`);
    return { casesResponse, childrenResponse };
};

const recordMutationRequests = (page: Page, journalpostId: string) => {
    const paths = new Set([
        ApiPath.JOURNALPOST_MOTTAK,
        ventPath(journalpostId),
        copyPath(journalpostId),
        behandlingAarPath(journalpostId),
        ApiPath.OPPRETT_GOSYS_OPPGAVE,
        closePath(journalpostId),
        ApiPath.JOURNALPOST_LUKK_DEBUGG.replace('{journalpostId}', journalpostId),
    ]);
    const mutations: string[] = [];

    page.on('request', (request) => {
        if (paths.has(new URL(request.url()).pathname)) {
            mutations.push(`${request.method()} ${new URL(request.url()).pathname}`);
        }
    });

    return mutations;
};

const expectNoCaseModal = async (page: Page, fortsett: boolean, childId?: string) => {
    const dialog = page.locator('[data-test-id="klassifiserModal"]');
    const info = dialog.locator('[data-test-id="klassifiseringInfo"]');

    await expect(dialog).toBeVisible();
    await expect(
        dialog.getByRole('heading', {
            name: fortsett
                ? 'Vil du lagre følgende informasjon til journalposten?'
                : 'Vil du lagre følgende informasjon til journalposten og sett på vent?',
        }),
    ).toBeVisible();
    await expect(info.getByText('Sakstype:', { exact: true })).toBeVisible();
    await expect(info.getByText('Pleiepenger sykt barn', { exact: true })).toBeVisible();
    await expect(info.getByText('Søkers ID:', { exact: true })).toBeVisible();
    await expect(info.getByText(SØKER_ID, { exact: true })).toBeVisible();
    await expect(info.getByText('Saksnummer:', { exact: true })).toHaveCount(0);
    await expect(info.getByText('Periode:', { exact: true })).toHaveCount(0);

    if (childId) {
        await expect(info.getByText('Pleietrengendes ID:', { exact: true })).toBeVisible();
        await expect(info.getByText(childId, { exact: true })).toBeVisible();
    } else {
        await expect(info.getByText('Pleietrengendes ID:', { exact: true })).toHaveCount(0);
    }

    await expect(dialog.getByText('Informasjonen kan ikke endres etter journalposten er journalført.')).toBeVisible();
    await expect(dialog.locator('[data-test-id="klassifiserModalGåTilLos"]')).toHaveCount(0);
    await expect(dialog.locator('[data-test-id="klassifiserModalJournalfør"]')).toHaveText(
        fortsett ? 'Journalfør journalposten' : 'Journalfør og sett på vent',
    );
    return dialog;
};

const cancelModal = async (dialog: ReturnType<Page['locator']>) => {
    await dialog.getByRole('button', { name: 'Avbryt' }).click();
    await expect(dialog).toBeHidden();
};

const expectPersonInfo = async (page: Page) => {
    await expect(page.getByText('Navn: TUNGSINDIG KAKE')).toBeVisible();
};

const expectNoMutations = (mutations: string[]) => {
    expect(mutations).toEqual([]);
};

test('håndterer tomt saksoppslag med barn fra listen og manuell ident', async ({ page }) => {
    const journalpostId = FORDELING_PSB_SCENARIOS.emptyCasesWithChildren;
    const mutations = recordMutationRequests(page, journalpostId);

    await openPsbJournalpost(page, journalpostId);
    await installLookupOverrides(page, { cases: [] });
    const { casesResponse, childrenResponse } = await confirmApplicant(page, journalpostId);
    await expectLookupResponse(casesResponse, ApiPath.HENT_FAGSAK_PÅ_IDENT, 200, []);
    await expectLookupResponse(childrenResponse, ApiPath.BARN_GET, 200, barnFixture);

    const caseSelect = page.getByLabel('Velg fagsak');
    const childSelect = page.getByLabel('Velg hvilket barn det gjelder');
    const panel = page.locator('.journalpostpanel');
    const continueButton = page.locator('[data-test-id="journalførOgFortsett"]');
    const holdButton = page.locator('[data-test-id="journalførOgVent"]');

    await test.step('Vis tomt saksvalg og velg barn fra listen', async () => {
        await expect(caseSelect).toHaveCount(0);
        await expect(page.getByLabel('Reserver saksnummer til ny fagsak')).toHaveCount(0);
        await expect(childSelect).toBeVisible();
        await expect(continueButton).toBeDisabled();
        await expect(holdButton).toBeDisabled();

        await childSelect.selectOption(BARN_FRA_LISTE_ID);
        await expect(childSelect).toHaveValue(BARN_FRA_LISTE_ID);
        await expect(panel).toContainText('Barnets ID');
        await expect(panel).toContainText(BARN_FRA_LISTE_ID);
        await expect(page.locator('[data-test-id="jornalførUtenFagsak"]')).toBeVisible();
        await expect(page.locator('[data-test-id="jornalførUtenFagsak"]').getByRole('button')).toHaveCount(0);
        await expect(continueButton).toBeEnabled();
        await expect(holdButton).toBeEnabled();
    });

    await test.step('Åpne og avbryt Fortsett- og Vent-modal uten saksinformasjon', async () => {
        await continueButton.click();
        const continueDialog = await expectNoCaseModal(page, true, BARN_FRA_LISTE_ID);
        await cancelModal(continueDialog);
        await expect(childSelect).toHaveValue(BARN_FRA_LISTE_ID);
        await expect(panel).toContainText(BARN_FRA_LISTE_ID);

        await holdButton.click();
        const holdDialog = await expectNoCaseModal(page, false, BARN_FRA_LISTE_ID);
        await cancelModal(holdDialog);
        await expect(childSelect).toHaveValue(BARN_FRA_LISTE_ID);
        await expect(panel).toContainText(BARN_FRA_LISTE_ID);
    });

    await test.step('Bytt til annet barn og oppgi gyldig ident', async () => {
        const otherChild = page.getByLabel('Det gjelder et annet barn');
        await otherChild.check();
        await expect(childSelect).toBeDisabled();
        const manualChild = page.getByLabel('Pleietrengendes fødselsnummer:', { exact: true });
        await expect(manualChild).toBeVisible();
        await expect(manualChild).toHaveValue('');
        await expect(continueButton).toBeDisabled();
        await expect(holdButton).toBeDisabled();

        await manualChild.fill(MANUELL_BARN_ID);
        await expectPersonInfo(page);
        await expect(panel).toContainText(MANUELL_BARN_ID);
        await expect(panel).not.toContainText(BARN_FRA_LISTE_ID);
        await expect(page.locator('[data-test-id="jornalførUtenFagsak"]')).toBeVisible();
        await expect(continueButton).toBeEnabled();
        await expect(holdButton).toBeEnabled();

        await continueButton.click();
        const dialog = await expectNoCaseModal(page, true, MANUELL_BARN_ID);
        await cancelModal(dialog);
        await expect(manualChild).toHaveValue(MANUELL_BARN_ID);
        await expect(panel).toContainText(MANUELL_BARN_ID);
    });

    await test.step('Fjern barnets ident og gjenopprett gyldig manuell verdi', async () => {
        const noChildId = page.getByLabel('Pleietrengende har ikke fødselsnummer', { exact: true });
        const manualChild = page.getByLabel('Pleietrengendes fødselsnummer:', { exact: true });
        await noChildId.check();
        await expect(manualChild).toBeDisabled();
        await expect(manualChild).toHaveValue('');
        await expect(panel.getByText('Barnets ID', { exact: true })).toHaveCount(0);
        await expect(panel.getByText(MANUELL_BARN_ID, { exact: true })).toHaveCount(0);
        await expect(page.locator('[data-test-id="pleietrengendeHarIkkeFnrInformasjon"]')).toBeVisible();
        await expect(continueButton).toBeDisabled();
        await expect(holdButton).toBeEnabled();

        await holdButton.click();
        const holdDialog = await expectNoCaseModal(page, false);
        await cancelModal(holdDialog);
        await expect(noChildId).toBeChecked();
        await expect(holdButton).toBeEnabled();

        await noChildId.uncheck();
        await expect(manualChild).toBeEnabled();
        await expect(manualChild).toHaveValue('');
        await expect(continueButton).toBeDisabled();
        await expect(holdButton).toBeDisabled();

        await manualChild.fill('12345678901');
        await expect(continueButton).toBeDisabled();
        await expect(holdButton).toBeDisabled();
        await manualChild.fill(MANUELL_BARN_ID);
        await expectPersonInfo(page);
        await expect(panel).toContainText(MANUELL_BARN_ID);
        await expect(continueButton).toBeEnabled();
        await expect(holdButton).toBeEnabled();
    });

    expectNoMutations(mutations);
    await expect(page).toHaveURL((url) => url.pathname === `/journalpost/${journalpostId}`);
});

test('håndterer tomme saks- og barnelister uten å be om annet barn', async ({ page }) => {
    const journalpostId = FORDELING_PSB_SCENARIOS.emptyCasesWithoutChildren;
    const mutations = recordMutationRequests(page, journalpostId);

    await openPsbJournalpost(page, journalpostId);
    await installLookupOverrides(page, { cases: [], children: { barn: [] } });
    const { casesResponse, childrenResponse } = await confirmApplicant(page, journalpostId);
    await expectLookupResponse(casesResponse, ApiPath.HENT_FAGSAK_PÅ_IDENT, 200, []);
    await expectLookupResponse(childrenResponse, ApiPath.BARN_GET, 200, { barn: [] });

    const panel = page.locator('.journalpostpanel');
    const manualChild = page.getByLabel('Pleietrengendes fødselsnummer:', { exact: true });
    const continueButton = page.locator('[data-test-id="journalførOgFortsett"]');
    const holdButton = page.locator('[data-test-id="journalførOgVent"]');

    await test.step('Vis manuell ident uten barneliste eller valg for annet barn', async () => {
        await expect(page.getByLabel('Velg fagsak')).toHaveCount(0);
        await expect(page.getByLabel('Reserver saksnummer til ny fagsak')).toHaveCount(0);
        await expect(page.getByLabel('Velg hvilket barn det gjelder')).toHaveCount(0);
        await expect(page.getByLabel('Det gjelder et annet barn')).toHaveCount(0);
        await expect(manualChild).toBeVisible();
        await expect(continueButton).toBeDisabled();
        await expect(holdButton).toBeDisabled();
    });

    await test.step('Oppgi gyldig ident, åpne modal og avbryt uten mutasjon', async () => {
        await manualChild.fill(MANUELL_BARN_ID);
        await expectPersonInfo(page);
        await expect(panel).toContainText(MANUELL_BARN_ID);
        await expect(page.locator('[data-test-id="jornalførUtenFagsak"]')).toBeVisible();
        await expect(continueButton).toBeEnabled();
        await expect(holdButton).toBeEnabled();

        await continueButton.click();
        const dialog = await expectNoCaseModal(page, true, MANUELL_BARN_ID);
        await cancelModal(dialog);
        await expect(manualChild).toHaveValue(MANUELL_BARN_ID);
        await expect(panel).toContainText(MANUELL_BARN_ID);
    });

    await test.step('Kontroller alternativet uten fødselsnummer', async () => {
        const noChildId = page.getByLabel('Pleietrengende har ikke fødselsnummer', { exact: true });
        await noChildId.check();
        await expect(manualChild).toBeDisabled();
        await expect(manualChild).toHaveValue('');
        await expect(panel.getByText('Barnets ID', { exact: true })).toHaveCount(0);
        await expect(continueButton).toBeDisabled();
        await expect(holdButton).toBeEnabled();
        await noChildId.uncheck();
        await expect(manualChild).toBeEnabled();
        await expect(continueButton).toBeDisabled();
        await expect(holdButton).toBeDisabled();
    });

    expectNoMutations(mutations);
    await expect(page).toHaveURL((url) => url.pathname === `/journalpost/${journalpostId}`);
});

test('bytter fra eksisterende sak til ny sak når barnelisten er tom', async ({ page }) => {
    const journalpostId = FORDELING_PSB_SCENARIOS.matchingCasesWithoutChildren;
    const mutations = recordMutationRequests(page, journalpostId);

    await openPsbJournalpost(page, journalpostId);
    await installLookupOverrides(page, { cases: PSB_FAGSAKER, children: { barn: [] } });
    const { casesResponse } = await confirmApplicant(page, journalpostId, false);
    await expectLookupResponse(casesResponse, ApiPath.HENT_FAGSAK_PÅ_IDENT, 200, PSB_FAGSAKER);

    const caseSelect = page.getByLabel('Velg fagsak');
    const reserveCase = page.getByLabel('Reserver saksnummer til ny fagsak');
    const manualChild = page.getByLabel('Pleietrengendes fødselsnummer:', { exact: true });
    const panel = page.locator('.journalpostpanel');
    const continueButton = page.locator('[data-test-id="journalførOgFortsett"]');
    const holdButton = page.locator('[data-test-id="journalførOgVent"]');

    await test.step('Velg eksisterende sak før ny-sak-modus', async () => {
        await expect(caseSelect).toBeVisible();
        await expect(reserveCase).toBeVisible();
        await caseSelect.selectOption(GAMMEL_FAGSAK_ID);
        await expect(page.locator('.fagsakSelectedInfo')).toContainText('JUSTERBAR HALS');
        await expect(page.locator('.fagsakSelectedInfo')).toContainText(GAMMELT_BARN_ID);
        await expect(panel).toContainText(GAMMEL_FAGSAK_ID);
        await expect(panel).toContainText(GAMMELT_BARN_ID);
    });

    await test.step('Fjern eksisterende sak og bruk manuell ident', async () => {
        const childrenResponsePromise = waitForLookup(page, ApiPath.BARN_GET);
        await reserveCase.check();
        await expectLookupResponse(await childrenResponsePromise, ApiPath.BARN_GET, 200, { barn: [] });
        await expect(caseSelect).toBeDisabled();
        await expect(caseSelect).toHaveValue('');
        await expect(page.locator('.fagsakSelectedInfo')).toHaveCount(0);
        await expect(panel).not.toContainText(GAMMEL_FAGSAK_ID);
        await expect(panel).not.toContainText(GAMMELT_BARN_ID);
        await expect(page.getByLabel('Velg hvilket barn det gjelder')).toHaveCount(0);
        await expect(page.getByLabel('Det gjelder et annet barn')).toHaveCount(0);
        await expect(manualChild).toBeVisible();
        await expect(continueButton).toBeDisabled();
        await expect(holdButton).toBeDisabled();

        await manualChild.fill(MANUELL_BARN_ID);
        await expectPersonInfo(page);
        await expect(panel).toContainText(MANUELL_BARN_ID);
        await expect(continueButton).toBeEnabled();
        await expect(holdButton).toBeEnabled();

        await continueButton.click();
        const dialog = await expectNoCaseModal(page, true, MANUELL_BARN_ID);
        await cancelModal(dialog);
        await expect(manualChild).toHaveValue(MANUELL_BARN_ID);
        await expect(caseSelect).toBeDisabled();
        await expect(caseSelect).toHaveValue('');
        await expect(panel).toContainText(MANUELL_BARN_ID);
        await expect(panel).not.toContainText(GAMMEL_FAGSAK_ID);
        await expect(panel).not.toContainText(GAMMELT_BARN_ID);
    });

    await test.step('Fjern ident og kontroller Fortsett/Vent', async () => {
        await page.getByLabel('Pleietrengende har ikke fødselsnummer', { exact: true }).check();
        await expect(manualChild).toBeDisabled();
        await expect(manualChild).toHaveValue('');
        await expect(panel.getByText('Barnets ID', { exact: true })).toHaveCount(0);
        await expect(page.locator('[data-test-id="pleietrengendeHarIkkeFnrInformasjon"]')).toBeVisible();
        await expect(continueButton).toBeDisabled();
        await expect(holdButton).toBeEnabled();
    });

    expectNoMutations(mutations);
    await expect(page).toHaveURL((url) => url.pathname === `/journalpost/${journalpostId}`);
});

test('filtrerer bort saker fra andre ytelser i tomt PSB-saksoppslag', async ({ page }) => {
    const journalpostId = FORDELING_PSB_SCENARIOS.otherBenefitCases;
    const mutations = recordMutationRequests(page, journalpostId);
    const otherBenefitCases = [fagsaker[1]];

    await openPsbJournalpost(page, journalpostId);
    await installLookupOverrides(page, { cases: otherBenefitCases });
    const { casesResponse, childrenResponse } = await confirmApplicant(page, journalpostId);
    await expectLookupResponse(casesResponse, ApiPath.HENT_FAGSAK_PÅ_IDENT, 200, otherBenefitCases);
    await expectLookupResponse(childrenResponse, ApiPath.BARN_GET, 200, barnFixture);

    const childSelect = page.getByLabel('Velg hvilket barn det gjelder');
    const panel = page.locator('.journalpostpanel');
    const continueButton = page.locator('[data-test-id="journalførOgFortsett"]');
    const holdButton = page.locator('[data-test-id="journalførOgVent"]');

    await expect(page.getByLabel('Velg fagsak')).toHaveCount(0);
    await expect(page.getByLabel('Reserver saksnummer til ny fagsak')).toHaveCount(0);
    await expect(panel).not.toContainText(ANNEN_YTELSE_FAGSAK_ID);
    await expect(childSelect).toBeVisible();
    await expect(continueButton).toBeDisabled();
    await expect(holdButton).toBeDisabled();

    await childSelect.selectOption(BARN_FRA_LISTE_ID);
    await expect(panel).toContainText(BARN_FRA_LISTE_ID);
    await expect(panel).not.toContainText(ANNEN_YTELSE_FAGSAK_ID);
    await expect(page.locator('[data-test-id="jornalførUtenFagsak"]')).toBeVisible();
    await expect(continueButton).toBeEnabled();
    await expect(holdButton).toBeEnabled();

    expectNoMutations(mutations);
    await expect(page).toHaveURL((url) => url.pathname === `/journalpost/${journalpostId}`);
});

for (const { journalpostId, status } of [
    { journalpostId: FORDELING_PSB_SCENARIOS.caseLookupForbidden, status: 403 },
    { journalpostId: FORDELING_PSB_SCENARIOS.caseLookupError, status: 500 },
]) {
    test(`viser fagsakoppslagsfeil ved status ${status} uten å starte ny sak`, async ({ page }) => {
        const mutations = recordMutationRequests(page, journalpostId);

        await openPsbJournalpost(page, journalpostId);
        await installLookupOverrides(page, { cases: [], caseStatus: status });
        const { casesResponse } = await confirmApplicant(page, journalpostId, false);
        await expectLookupResponse(casesResponse, ApiPath.HENT_FAGSAK_PÅ_IDENT, status);

        const panel = page.locator('.journalpostpanel');
        await expect(page.getByText('Henting av fagsak feilet', { exact: true })).toBeVisible();
        await expect(page.getByLabel('Velg fagsak')).toHaveCount(0);
        await expect(page.getByLabel('Reserver saksnummer til ny fagsak')).toHaveCount(0);
        await expect(panel).not.toContainText(FAGSAK_UTEN_BARN_ID);
        await expect(panel).not.toContainText(GAMMEL_FAGSAK_ID);
        await expect(panel).not.toContainText(BARN_FRA_LISTE_ID);
        await expect(panel).not.toContainText(GAMMELT_BARN_ID);
        await expect(page.locator('[data-test-id="journalførOgFortsett"]')).toBeDisabled();
        await expect(page.locator('[data-test-id="journalførOgVent"]')).toBeDisabled();
        expectNoMutations(mutations);
        await expect(page).toHaveURL((url) => url.pathname === `/journalpost/${journalpostId}`);
    });
}

for (const { journalpostId, status } of [
    { journalpostId: FORDELING_PSB_SCENARIOS.childLookupForbidden, status: 403 },
    { journalpostId: FORDELING_PSB_SCENARIOS.childLookupError, status: 500 },
]) {
    test(`gjenoppretter barnelisten etter barnesøk med status ${status}`, async ({ page }) => {
        const mutations = recordMutationRequests(page, journalpostId);

        await openPsbJournalpost(page, journalpostId);
        await installChildLookupRecoveryOverrides(page, status);

        const firstCasesResponsePromise = waitForLookup(page, ApiPath.HENT_FAGSAK_PÅ_IDENT);
        const firstChildrenResponsePromise = waitForLookup(page, ApiPath.BARN_GET);
        await page.getByRole('radio', { name: 'Ja' }).check();
        const [firstCasesResponse, firstChildrenResponse] = await Promise.all([
            firstCasesResponsePromise,
            firstChildrenResponsePromise,
        ]);
        await expectLookupResponse(firstCasesResponse, ApiPath.HENT_FAGSAK_PÅ_IDENT, 200, []);
        await expectLookupResponse(firstChildrenResponse, ApiPath.BARN_GET, status, {
            error: 'Child lookup failed',
        });

        const manualChild = page.getByLabel('Pleietrengendes fødselsnummer:', { exact: true });
        const panel = page.locator('.journalpostpanel');
        const continueButton = page.locator('[data-test-id="journalførOgFortsett"]');
        const holdButton = page.locator('[data-test-id="journalførOgVent"]');
        const childSelect = page.getByLabel('Velg hvilket barn det gjelder');
        const otherChild = page.getByLabel('Det gjelder et annet barn');
        const noChildId = page.getByLabel('Pleietrengende har ikke fødselsnummer', { exact: true });

        await expect(manualChild).toBeVisible();
        await expect(childSelect).toHaveCount(0);
        await expect(continueButton).toBeDisabled();
        await expect(holdButton).toBeDisabled();

        await manualChild.fill(MANUELL_BARN_ID);
        await expectPersonInfo(page);
        await expect(panel).toContainText(MANUELL_BARN_ID);
        await expect(continueButton).toBeEnabled();
        await expect(holdButton).toBeEnabled();

        await holdButton.click();
        const holdDialog = await expectNoCaseModal(page, false, MANUELL_BARN_ID);
        await cancelModal(holdDialog);
        await expect(manualChild).toHaveValue(MANUELL_BARN_ID);
        await expect(panel).toContainText(MANUELL_BARN_ID);
        await expect(continueButton).toBeEnabled();
        await expect(holdButton).toBeEnabled();

        await page.getByRole('radio', { name: 'Nei' }).check();
        const recoveryCasesResponsePromise = waitForLookup(page, ApiPath.HENT_FAGSAK_PÅ_IDENT);
        const recoveryChildrenResponsePromise = waitForLookup(page, ApiPath.BARN_GET);
        await page.getByRole('radio', { name: 'Ja' }).check();
        const [recoveryCasesResponse, recoveryChildrenResponse] = await Promise.all([
            recoveryCasesResponsePromise,
            recoveryChildrenResponsePromise,
        ]);
        await expectLookupResponse(recoveryCasesResponse, ApiPath.HENT_FAGSAK_PÅ_IDENT, 200, []);
        await expectLookupResponse(recoveryChildrenResponse, ApiPath.BARN_GET, 200, barnFixture);

        await expect(childSelect).toBeVisible();
        await expect(otherChild).not.toBeChecked();
        await expect(manualChild).toHaveCount(0);
        await expect(noChildId).toHaveCount(0);
        await expect(continueButton).toBeDisabled();
        await expect(holdButton).toBeDisabled();

        await childSelect.selectOption(BARN_FRA_LISTE_ID);
        await expect(childSelect).toHaveValue(BARN_FRA_LISTE_ID);
        await expect(panel).toContainText('Barnets ID');
        await expect(panel).toContainText(BARN_FRA_LISTE_ID);
        await expect(continueButton).toBeEnabled();
        await expect(holdButton).toBeEnabled();

        await childSelect.selectOption(GAMMELT_BARN_ID);
        await expect(childSelect).toHaveValue(GAMMELT_BARN_ID);
        await expect(panel).toContainText(GAMMELT_BARN_ID);
        await expect(panel).not.toContainText(BARN_FRA_LISTE_ID);
        await expect(continueButton).toBeEnabled();
        await expect(holdButton).toBeEnabled();

        await otherChild.check();
        await expect(childSelect).toBeDisabled();
        await expect(manualChild).toBeVisible();
        await manualChild.fill(MANUELL_BARN_ID);
        await expectPersonInfo(page);
        await expect(panel).toContainText(MANUELL_BARN_ID);
        await expect(continueButton).toBeEnabled();
        await expect(holdButton).toBeEnabled();

        expectNoMutations(mutations);
        await expect(page).toHaveURL((url) => url.pathname === `/journalpost/${journalpostId}`);
    });
}
