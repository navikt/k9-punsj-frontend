import { expect, test, type Page, type Response } from '@playwright/test';

import barnFixture from '../../cypress/fixtures/barn.json' with { type: 'json' };
import fagsaker from '../../cypress/fixtures/fagsaker.json' with { type: 'json' };
import jpOMPAO303 from '../../cypress/fixtures/jpOMPAO303.json' with { type: 'json' };
import { ApiPath } from '../../src/app/apiConfig';

const JOURNALPOST_ID = jpOMPAO303.journalpostId;
const SØKER_ID = jpOMPAO303.norskIdent;
const DOKUMENTTYPE = 'Alene om omsorgen';
const OMPAO_UNDERTYPE = 'Ekstra omsorgsdager når du er alene om omsorgen';
const ORDINÆR_SAK_UTEN_BARN = fagsaker[14];
const ORDINÆR_SAK_MED_BARN = fagsaker[15];
const RESERVERT_SAK_MED_BARN = fagsaker[16];
const RESERVERT_SAK_UTEN_BARN = fagsaker[17];
const OMPAO_BARN = ORDINÆR_SAK_MED_BARN.pleietrengende!;
const OMPAO_SAKER = [
    ORDINÆR_SAK_UTEN_BARN,
    ORDINÆR_SAK_MED_BARN,
    RESERVERT_SAK_MED_BARN,
    RESERVERT_SAK_UTEN_BARN,
];
const BARNELISTE = barnFixture.barn;
const BARN_MED_FAGSAK = BARNELISTE[2];
const BARN_UTEN_FAGSAK = BARNELISTE[0];
const SAK_FOR_BARN = OMPAO_SAKER.find(
    (sak) => sak.pleietrengende?.identitetsnummer === BARN_MED_FAGSAK.identitetsnummer,
);
if (!SAK_FOR_BARN) throw new Error('Fant ikke OMPAO-saken som tilhører barnet i barn.json.');
const PERIODE = '31.12.2021 - 31.12.2039';
const JOURNALPOST_PATH = ApiPath.JOURNALPOST_GET.replace('{journalpostId}', JOURNALPOST_ID);
const MUTATION_PATHS = new Set([
    ApiPath.JOURNALPOST_MOTTAK,
    ApiPath.JOURNALPOST_SETT_PAA_VENT.replace('{journalpostId}', JOURNALPOST_ID),
    ApiPath.JOURNALPOST_KOPIERE.replace('{journalpostId}', JOURNALPOST_ID),
    ApiPath.JOURNALPOST_SETT_BEHANDLINGSÅR.replace('{journalpostId}', JOURNALPOST_ID),
    ApiPath.OMP_AO_SOKNAD_CREATE,
    ApiPath.OMP_AO_SOKNAD_UPDATE,
    ApiPath.OMP_AO_SOKNAD_VALIDER,
    ApiPath.OMP_AO_SOKNAD_SUBMIT,
]);

type OMPAOSak = (typeof OMPAO_SAKER)[number];
type CaseModalScenario = { kind: 'case'; action: 'Fortsett' | 'Vent'; sak: OMPAOSak };
type ModalScenario =
    | CaseModalScenario
    | { kind: 'new-case'; action: 'Fortsett' | 'Vent'; barn: (typeof BARNELISTE)[number] };

const isResponse = (response: Response, method: string, path: string) =>
    response.request().method() === method && new URL(response.url()).pathname === path;

const journalpostpanel = (page: Page) => page.locator('.journalpostpanel');
const selectedInfo = (page: Page) => page.locator('.fagsakSelectedInfo');
const fortsett = (page: Page) => page.locator('[data-test-id="journalførOgFortsett"]');
const vent = (page: Page) => page.locator('[data-test-id="journalførOgVent"]');

const recordMutations = (page: Page) => {
    const mutations: string[] = [];

    page.on('request', (request) => {
        const path = new URL(request.url()).pathname;
        if (MUTATION_PATHS.has(path) && !['GET', 'HEAD', 'OPTIONS'].includes(request.method())) {
            mutations.push(`${request.method()} ${path}`);
        }
    });

    return mutations;
};

const openJournalpost = async (page: Page) => {
    const responsePromise = page.waitForResponse((response) =>
        isResponse(response, 'GET', JOURNALPOST_PATH),
    );
    await page.goto(`/journalpost/${JOURNALPOST_ID}`);
    const response = await responsePromise;

    await expect(page).toHaveURL((url) => url.pathname === `/journalpost/${JOURNALPOST_ID}`);
    expect(response.status()).toBe(201);
    expect(response.fromServiceWorker()).toBe(true);
    expect(await response.json()).toEqual(jpOMPAO303);
    await expect(
        page.getByRole('radio', { name: OMPAO_UNDERTYPE, exact: true }),
    ).toBeChecked();
};

const selectApplicantAndLoadCases = async (page: Page) => {
    await page.evaluate(
        ({ casesPath, applicantId, cases }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');

            msw.worker.use(
                msw.http.get(casesPath, ({ request }) => {
                    if (request.headers.get('X-Nav-NorskIdent') !== applicantId) return;
                    return msw.HttpResponse.json(cases, { status: 200 });
                }),
            );
        },
        {
            casesPath: ApiPath.HENT_FAGSAK_PÅ_IDENT,
            applicantId: SØKER_ID,
            cases: OMPAO_SAKER,
        },
    );

    const lookupPromise = page.waitForResponse(
        (response) =>
            isResponse(response, 'GET', ApiPath.HENT_FAGSAK_PÅ_IDENT) &&
            response.request().headers()['x-nav-norskident'] === SØKER_ID,
    );
    await page.getByRole('radio', { name: 'Ja', exact: true }).check();
    const response = await lookupPromise;

    expect(response.status()).toBe(200);
    expect(response.fromServiceWorker()).toBe(true);
    expect(response.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(await response.json()).toEqual(OMPAO_SAKER);
    await expect(page.getByLabel('Velg fagsak')).toBeEnabled();
};

const installChildrenLookupHandler = async (page: Page) => {
    await page.evaluate(
        ({ childPath, applicantId, children }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');

            msw.worker.use(
                msw.http.get(childPath, ({ request }) => {
                    if (request.headers.get('X-Nav-NorskIdent') !== applicantId) return;
                    return msw.HttpResponse.json(children, { status: 200 });
                }),
            );
        },
        {
            childPath: ApiPath.BARN_GET,
            applicantId: SØKER_ID,
            children: barnFixture,
        },
    );
};

const expectChildrenLookupResponse = async (response: Response) => {
    expect(response.status()).toBe(200);
    expect(response.fromServiceWorker()).toBe(true);
    expect(response.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(await response.json()).toEqual(barnFixture);
};

const waitForChildrenLookup = (page: Page) =>
    page.waitForResponse(
        (response) =>
            isResponse(response, 'GET', ApiPath.BARN_GET) &&
            response.request().headers()['x-nav-norskident'] === SØKER_ID,
    );

const expectPanelField = async (page: Page, label: string, value: string) => {
    const field = journalpostpanel(page).getByText(label, { exact: true });
    await expect(field).toBeVisible();
    await expect(field.locator('..').getByText(value, { exact: true })).toBeVisible();
};

const expectSelectedCase = async (
    page: Page,
    sak: OMPAOSak,
    staleCase?: OMPAOSak,
    staleChildId?: string,
) => {
    await expect(page.getByLabel('Velg fagsak')).toHaveValue(sak.fagsakId);
    await expect(selectedInfo(page).getByText('Barn:', { exact: true })).toBeVisible();

    if (sak.pleietrengende) {
        await expect(
            selectedInfo(page).getByText(`Navn: ${sak.pleietrengende.navn}`, { exact: true }),
        ).toBeVisible();
        await expect(
            selectedInfo(page).getByText(
                `Id: ${sak.pleietrengende.identitetsnummer}`,
                { exact: true },
            ),
        ).toBeVisible();
    } else {
        await expect(selectedInfo(page).getByText('ikke satt', { exact: true })).toBeVisible();
        await expect(selectedInfo(page)).not.toContainText(OMPAO_BARN.navn);
        await expect(selectedInfo(page)).not.toContainText(OMPAO_BARN.identitetsnummer);
    }

    const k9Link = selectedInfo(page).getByRole('link', { name: /Se fagsak i K9/ });
    if (sak.reservert) {
        await expect(k9Link).toHaveCount(0);
    } else {
        await expect(k9Link).toHaveAttribute('href', expect.stringContaining(sak.fagsakId));
    }

    await expectPanelField(page, 'Journalpostnummer:', JOURNALPOST_ID);
    await expectPanelField(page, 'Søkers ID:', SØKER_ID);
    await expectPanelField(page, 'Sakstype:', DOKUMENTTYPE);
    await expectPanelField(page, 'Saksnummer:', sak.fagsakId);
    if (sak.pleietrengende) {
        await expectPanelField(page, 'Barnets ID:', sak.pleietrengende.identitetsnummer);
    } else {
        await expect(journalpostpanel(page).getByText('Barnets ID:', { exact: true })).toHaveCount(
            0,
        );
        await expect(journalpostpanel(page)).not.toContainText(OMPAO_BARN.identitetsnummer);
    }

    if (staleCase) {
        await expect(selectedInfo(page)).not.toContainText(staleCase.fagsakId);
        await expect(journalpostpanel(page)).not.toContainText(staleCase.fagsakId);
    }
    if (staleChildId) {
        await expect(selectedInfo(page)).not.toContainText(staleChildId);
        await expect(journalpostpanel(page)).not.toContainText(staleChildId);
    }

    if (sak.pleietrengende) {
        await expect(fortsett(page)).toBeEnabled();
    } else {
        await expect(fortsett(page)).toBeDisabled();
    }
    await expect(vent(page)).toBeEnabled();
};

const selectCase = async (
    page: Page,
    sak: OMPAOSak,
    staleCase?: OMPAOSak,
    staleChildId?: string,
) => {
    await page.getByLabel('Velg fagsak').selectOption(sak.fagsakId);
    await expectSelectedCase(page, sak, staleCase, staleChildId);
};

const expectNewCaseWithListedChild = async (
    page: Page,
    barn: (typeof BARNELISTE)[number],
) => {
    await expect(page.getByLabel('Reserver saksnummer til ny fagsak')).toBeChecked();
    await expect(page.getByLabel('Velg fagsak')).toBeDisabled();
    await expect(page.getByLabel('Velg fagsak')).toHaveValue('');
    await expect(page.getByLabel('Velg hvilket barn det gjelder')).toHaveValue(
        barn.identitetsnummer,
    );
    await expectPanelField(page, 'Søkers ID:', SØKER_ID);
    await expectPanelField(page, 'Sakstype:', DOKUMENTTYPE);
    await expectPanelField(page, 'Barnets ID:', barn.identitetsnummer);
    await expect(journalpostpanel(page).getByText('Saksnummer:', { exact: true })).toHaveCount(0);
    await expect(journalpostpanel(page)).not.toContainText(RESERVERT_SAK_UTEN_BARN.fagsakId);
    await expect(journalpostpanel(page)).not.toContainText(SAK_FOR_BARN.fagsakId);
    await expect(journalpostpanel(page)).not.toContainText(BARN_MED_FAGSAK.identitetsnummer);
    await expect(page.locator('[data-test-id="pleietrengendeHarFagsak"]')).toHaveCount(0);
    await expect(page.locator('[data-test-id="jornalførUtenFagsak"]')).toBeVisible();
    await expect(fortsett(page)).toBeEnabled();
    await expect(vent(page)).toBeEnabled();
};

const modalScenarios: CaseModalScenario[] = [
    { kind: 'case', action: 'Vent', sak: ORDINÆR_SAK_UTEN_BARN },
    { kind: 'case', action: 'Fortsett', sak: ORDINÆR_SAK_MED_BARN },
    { kind: 'case', action: 'Vent', sak: ORDINÆR_SAK_MED_BARN },
    { kind: 'case', action: 'Fortsett', sak: RESERVERT_SAK_MED_BARN },
    { kind: 'case', action: 'Vent', sak: RESERVERT_SAK_MED_BARN },
    { kind: 'case', action: 'Vent', sak: RESERVERT_SAK_UTEN_BARN },
];

const expectAndCancelModal = async (
    page: Page,
    scenario: ModalScenario,
    mutations: string[],
) => {
    const isFortsett = scenario.action === 'Fortsett';
    await (isFortsett ? fortsett(page) : vent(page)).click();

    const dialog = page.locator('[data-test-id="klassifiserModal"]');
    const info = dialog.locator('[data-test-id="klassifiseringInfo"]');
    const heading = isFortsett
        ? 'Vil du lagre følgende informasjon til journalposten?'
        : 'Vil du lagre følgende informasjon til journalposten og sett på vent?';
    const confirmLabel = isFortsett ? 'Journalfør journalposten' : 'Journalfør og sett på vent';

    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    await expect(info.getByText('Sakstype:', { exact: true })).toBeVisible();
    await expect(info.getByText(DOKUMENTTYPE, { exact: true })).toBeVisible();
    await expect(info.getByText('Søkers ID:', { exact: true })).toBeVisible();
    await expect(info.getByText(SØKER_ID, { exact: true })).toBeVisible();

    if (scenario.kind === 'case') {
        await expect(info.getByText('Saksnummer:', { exact: true })).toBeVisible();
        await expect(info.getByText(scenario.sak.fagsakId, { exact: true })).toBeVisible();
        await expect(info.getByText('Periode:', { exact: true })).toBeVisible();
        await expect(info.getByText(PERIODE, { exact: true })).toBeVisible();
    } else {
        await expect(info.getByText('Saksnummer:', { exact: true })).toHaveCount(0);
        await expect(info.getByText('Periode:', { exact: true })).toHaveCount(0);
    }

    const barn = scenario.kind === 'case' ? scenario.sak.pleietrengende : scenario.barn;
    if (barn) {
        await expect(info.getByText('Pleietrengendes ID:', { exact: true })).toBeVisible();
        await expect(info.getByText(barn.identitetsnummer, { exact: true })).toBeVisible();
    } else {
        await expect(info.getByText('Pleietrengendes ID:', { exact: true })).toHaveCount(0);
        await expect(info).not.toContainText(
            ORDINÆR_SAK_MED_BARN.pleietrengende!.identitetsnummer,
        );
    }
    await expect(
        dialog
            .locator('[data-test-id="klassifiserModalAlertBlokk"]')
            .getByText('Informasjonen kan ikke endres etter journalposten er journalført.', {
                exact: true,
            }),
    ).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Gå til LOS', exact: true })).toHaveCount(0);
    await expect(dialog.locator('[data-test-id="klassifiserModalGåTilLos"]')).toHaveCount(0);
    await expect(dialog.getByRole('button', { name: confirmLabel, exact: true })).toBeEnabled();
    await expect(dialog.getByRole('button', { name: 'Avbryt', exact: true })).toBeEnabled();

    await dialog.getByRole('button', { name: 'Avbryt', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    if (scenario.kind === 'case') {
        await expectSelectedCase(page, scenario.sak);
    } else {
        await expectNewCaseWithListedChild(page, scenario.barn);
    }
    expect(mutations).toEqual([]);
};

test('velger OMPAO-saker med og uten barn og fjerner foreldede detaljer', async ({ page }) => {
    const mutations = recordMutations(page);
    await openJournalpost(page);
    await expectPanelField(page, 'Journalpostnummer:', JOURNALPOST_ID);
    await expectPanelField(page, 'Søkers ID:', SØKER_ID);
    await expectPanelField(page, 'Sakstype:', DOKUMENTTYPE);
    await selectApplicantAndLoadCases(page);

    await selectCase(page, ORDINÆR_SAK_MED_BARN);
    await selectCase(
        page,
        ORDINÆR_SAK_UTEN_BARN,
        ORDINÆR_SAK_MED_BARN,
        ORDINÆR_SAK_MED_BARN.pleietrengende!.identitetsnummer,
    );
    await selectCase(page, RESERVERT_SAK_MED_BARN, ORDINÆR_SAK_UTEN_BARN);
    await selectCase(
        page,
        RESERVERT_SAK_UTEN_BARN,
        RESERVERT_SAK_MED_BARN,
        RESERVERT_SAK_MED_BARN.pleietrengende!.identitetsnummer,
    );

    expect(mutations).toEqual([]);
});

test('reserverer ny OMPAO-sak, velger barn fra listen og avbryter modalene uten sak', async ({
    page,
}) => {
    const mutations = recordMutations(page);
    await openJournalpost(page);
    await installChildrenLookupHandler(page);
    await selectApplicantAndLoadCases(page);
    await selectCase(page, RESERVERT_SAK_UTEN_BARN);

    const childrenResponsePromise = waitForChildrenLookup(page);
    await page.getByLabel('Reserver saksnummer til ny fagsak').check();
    await expectChildrenLookupResponse(await childrenResponsePromise);
    await expect(page.getByLabel('Velg fagsak')).toBeDisabled();
    await expect(page.getByLabel('Velg fagsak')).toHaveValue('');
    await expect(journalpostpanel(page).getByText('Saksnummer:', { exact: true })).toHaveCount(0);
    await expect(journalpostpanel(page)).not.toContainText(RESERVERT_SAK_UTEN_BARN.fagsakId);
    await expect(fortsett(page)).toBeDisabled();
    await expect(vent(page)).toBeDisabled();

    const childSelect = page.getByLabel('Velg hvilket barn det gjelder');
    await childSelect.selectOption(BARN_MED_FAGSAK.identitetsnummer);
    await expect(childSelect).toHaveValue(BARN_MED_FAGSAK.identitetsnummer);
    await expectPanelField(page, 'Barnets ID:', BARN_MED_FAGSAK.identitetsnummer);
    const conflictWarning = page.locator('[data-test-id="pleietrengendeHarFagsak"]');
    await expect(conflictWarning).toBeVisible();
    await expect(conflictWarning).toContainText(SAK_FOR_BARN.fagsakId);
    await expect(conflictWarning).toContainText(BARN_MED_FAGSAK.identitetsnummer);
    await expect(fortsett(page)).toBeDisabled();
    await expect(vent(page)).toBeDisabled();

    await childSelect.selectOption(BARN_UTEN_FAGSAK.identitetsnummer);
    await expectNewCaseWithListedChild(page, BARN_UTEN_FAGSAK);

    for (const action of ['Fortsett', 'Vent'] as const) {
        await expectAndCancelModal(
            page,
            { kind: 'new-case', action, barn: BARN_UTEN_FAGSAK },
            mutations,
        );
    }

    expect(mutations).toEqual([]);
});

for (const scenario of modalScenarios) {
    test(`avbryter ${scenario.action} for ${scenario.sak.reservert ? 'reservert' : 'ordinær'} OMPAO-sak ${scenario.sak.pleietrengende ? 'med barn' : 'uten barn'}`, async ({
        page,
    }) => {
        const mutations = recordMutations(page);
        await openJournalpost(page);
        await selectApplicantAndLoadCases(page);
        await selectCase(page, scenario.sak);
        await expectAndCancelModal(page, scenario, mutations);
    });
}
