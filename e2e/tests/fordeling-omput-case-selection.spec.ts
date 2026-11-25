import { expect, test, type Page, type Response } from '@playwright/test';

import fagsaker from '../../cypress/fixtures/fagsaker.json' with { type: 'json' };
import jpOMPUT305 from '../../cypress/fixtures/jpOMPUT305.json' with { type: 'json' };
import { ApiPath } from '../../src/app/apiConfig';

const JOURNALPOST_ID = jpOMPUT305.journalpostId;
const SØKER_ID = jpOMPUT305.norskIdent;
const NY_SØKER_ID = '12448325820';
const DOKUMENTTYPE = 'Omsorgspenger';
const SAKSTYPEVALG = 'Omsorgspenger: direkte utbetaling av omsorgspenger';
const ORDINÆR_SAK = fagsaker[1];
const RESERVERT_SAK = fagsaker[9];
type OmputSak = { fagsakId: string; reservert: boolean; behandlingsår?: number | null };
const OMPUT_SAKER: OmputSak[] = [ORDINÆR_SAK, RESERVERT_SAK];
const JOURNALPOST_PATH = ApiPath.JOURNALPOST_GET.replace('{journalpostId}', JOURNALPOST_ID);
const VENT_PATH = ApiPath.JOURNALPOST_SETT_PAA_VENT.replace('{journalpostId}', JOURNALPOST_ID);
const BEHANDLINGSÅR_PATH = ApiPath.JOURNALPOST_SETT_BEHANDLINGSÅR.replace(
    '{journalpostId}',
    JOURNALPOST_ID,
);
const MUTATION_PATHS = new Set([
    ApiPath.JOURNALPOST_MOTTAK,
    VENT_PATH,
    BEHANDLINGSÅR_PATH,
    ApiPath.OMP_UT_SOKNAD_CREATE,
    ApiPath.OMP_UT_SOKNAD_UPDATE,
    ApiPath.OMP_UT_SOKNAD_VALIDER,
    ApiPath.OMP_UT_SOKNAD_SUBMIT,
]);

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

    expect(response.status()).toBe(201);
    expect(response.fromServiceWorker()).toBe(true);
    expect(await response.json()).toEqual(jpOMPUT305);

    await page.getByRole('radio', { name: 'Omsorgspenger/omsorgsdager', exact: true }).check();
    const subtype = page.getByRole('radio', { name: SAKSTYPEVALG, exact: true });
    await subtype.check();
    await expect(subtype).toBeChecked();
};

const installCaseLookupHandler = async (
    page: Page,
    fagsakerForOppslag = OMPUT_SAKER,
    lookupApplicantId = SØKER_ID,
) => {
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
            applicantId: lookupApplicantId,
            cases: fagsakerForOppslag,
        },
    );
};

const selectApplicantAndLoadCases = async (
    page: Page,
    cases = OMPUT_SAKER,
    applicantId = SØKER_ID,
) => {
    await installCaseLookupHandler(page, cases, applicantId);
    const lookupPromise = page.waitForResponse(
        (response) =>
            isResponse(response, 'GET', ApiPath.HENT_FAGSAK_PÅ_IDENT) &&
            response.request().headers()['x-nav-norskident'] === applicantId,
    );
    await page.getByRole('radio', { name: 'Ja', exact: true }).check();
    const response = await lookupPromise;

    expect(response.status()).toBe(200);
    expect(response.fromServiceWorker()).toBe(true);
    expect(await response.json()).toEqual(cases);
    await expect(page.getByLabel('Velg fagsak')).toBeEnabled();
};

const expectPanelField = async (page: Page, label: string, value: string) => {
    const field = journalpostpanel(page).getByText(label, { exact: true });
    await expect(field).toBeVisible();
    await expect(field.locator('..').getByText(value, { exact: true })).toBeVisible();
};

const expectSelectedCase = async (
    page: Page,
    sak: OmputSak,
    staleCaseId?: string,
    applicantId = SØKER_ID,
) => {
    const caseSelect = page.getByLabel('Velg fagsak');
    await expect(caseSelect).toHaveValue(sak.fagsakId);
    await expect(
        selectedInfo(page).getByText(`Behandlings år: ${sak.behandlingsår}`, { exact: true }),
    ).toBeVisible();

    const k9Link = selectedInfo(page).getByRole('link', { name: /Se fagsak i K9/ });
    if (sak.reservert) {
        await expect(k9Link).toHaveCount(0);
    } else {
        await expect(k9Link).toHaveAttribute('href', expect.stringContaining(sak.fagsakId));
    }

    await expectPanelField(page, 'Journalpostnummer:', JOURNALPOST_ID);
    await expectPanelField(page, 'Søkers ID:', applicantId);
    await expectPanelField(page, 'Sakstype:', DOKUMENTTYPE);
    await expectPanelField(page, 'Saksnummer:', sak.fagsakId);
    if (staleCaseId) {
        await expect(selectedInfo(page)).not.toContainText(staleCaseId);
        await expect(journalpostpanel(page)).not.toContainText(staleCaseId);
    }

    await expect(fortsett(page)).toBeEnabled();
    await expect(vent(page)).toBeEnabled();
};

type ModalScenario = {
    action: 'Fortsett' | 'Vent';
    sak: OmputSak;
};

const modalScenarios: ModalScenario[] = [
    { action: 'Fortsett', sak: ORDINÆR_SAK },
    { action: 'Vent', sak: ORDINÆR_SAK },
    { action: 'Fortsett', sak: RESERVERT_SAK },
    { action: 'Vent', sak: RESERVERT_SAK },
];

const selectCase = async (page: Page, sak: OmputSak) => {
    const caseSelect = page.getByLabel('Velg fagsak');
    await caseSelect.selectOption(sak.fagsakId);
    await expectSelectedCase(page, sak);
};

const prepareNewCase = async (page: Page) => {
    const currentYear = await page.evaluate(() => new Date().getFullYear());
    const cases = OMPUT_SAKER.map((sak) => ({ ...sak, behandlingsår: currentYear }));
    await selectApplicantAndLoadCases(page, cases);

    const reservedCase = cases.find((sak) => sak.reservert);
    if (!reservedCase) throw new Error('En reservert OMPUT-sak mangler i testdataene.');
    await selectCase(page, reservedCase);
    await page.getByLabel('Reserver saksnummer til ny fagsak').check();

    const yearSelect = page.getByLabel('Hvilket år gjelder dokumentet?');
    await expect(yearSelect).toBeVisible();
    const availableYears = await yearSelect.locator('option').evaluateAll((options) =>
        options.map((option) => (option as HTMLOptionElement).value).filter(Boolean),
    );
    const occupiedYear = String(currentYear);
    expect(availableYears).toContain(occupiedYear);
    const freeYear = availableYears.find((year) => year !== occupiedYear);
    if (!freeYear) throw new Error('Et ledig behandlingsår mangler i valgene.');

    return { reservedCase, yearSelect, occupiedYear, freeYear };
};

const expectNoCaseReady = async (
    page: Page,
    year: string,
    applicantId = SØKER_ID,
    previousApplicantId?: string,
    previousCaseId?: string,
) => {
    const yearSelect = page.getByLabel('Hvilket år gjelder dokumentet?');
    await expect(yearSelect).toHaveValue(year);
    await expect(page.getByLabel('Velg fagsak')).toBeDisabled();
    await expect(page.getByLabel('Reserver saksnummer til ny fagsak')).toBeChecked();
    await expectPanelField(page, 'Søkers ID:', applicantId);
    if (previousApplicantId) {
        await expect(journalpostpanel(page)).not.toContainText(previousApplicantId);
    }
    if (previousCaseId) {
        await expect(journalpostpanel(page)).not.toContainText(previousCaseId);
    }
    await expect(page.locator('[data-test-id="jornalførUtenFagsak"]')).toBeVisible();
    await expect(fortsett(page)).toBeEnabled();
    await expect(vent(page)).toBeEnabled();
};

const expectAndCancelNoCaseModal = async (
    page: Page,
    action: 'Fortsett' | 'Vent',
    year: string,
    mutations: string[],
    applicantId = SØKER_ID,
    previousApplicantId?: string,
    previousCaseId?: string,
) => {
    const continueAction = action === 'Fortsett';
    await (continueAction ? fortsett(page) : vent(page)).click();

    const dialog = page.locator('[data-test-id="klassifiserModal"]');
    const info = dialog.locator('[data-test-id="klassifiseringInfo"]');
    const heading = continueAction
        ? 'Vil du lagre følgende informasjon til journalposten?'
        : 'Vil du lagre følgende informasjon til journalposten og sett på vent?';
    const confirmLabel = continueAction ? 'Journalfør journalposten' : 'Journalfør og sett på vent';

    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    await expect(info.getByText('Sakstype:', { exact: true })).toBeVisible();
    await expect(info.getByText(DOKUMENTTYPE, { exact: true })).toBeVisible();
    await expect(info.getByText('Søkers ID:', { exact: true })).toBeVisible();
    await expect(info.getByText(applicantId, { exact: true })).toBeVisible();
    if (previousApplicantId) {
        await expect(info.getByText(previousApplicantId, { exact: true })).toHaveCount(0);
    }
    await expect(info.getByText('Saksnummer:', { exact: true })).toHaveCount(0);
    await expect(info.getByText('Periode:', { exact: true })).toHaveCount(0);
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
    await expectNoCaseReady(page, year, applicantId, previousApplicantId, previousCaseId);
    expect(mutations).toEqual([]);
};

const expectAndCancelModal = async (
    page: Page,
    scenario: ModalScenario,
    mutations: string[],
) => {
    const continueAction = scenario.action === 'Fortsett';
    await (continueAction ? fortsett(page) : vent(page)).click();

    const dialog = page.locator('[data-test-id="klassifiserModal"]');
    const info = dialog.locator('[data-test-id="klassifiseringInfo"]');
    const heading =
        scenario.action === 'Fortsett'
            ? 'Vil du lagre følgende informasjon til journalposten?'
            : 'Vil du lagre følgende informasjon til journalposten og sett på vent?';
    const confirmLabel = continueAction ? 'Journalfør journalposten' : 'Journalfør og sett på vent';

    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    await expect(info.getByText('Sakstype:', { exact: true })).toBeVisible();
    await expect(info.getByText(DOKUMENTTYPE, { exact: true })).toBeVisible();
    await expect(info.getByText('Søkers ID:', { exact: true })).toBeVisible();
    await expect(info.getByText(SØKER_ID, { exact: true })).toBeVisible();
    await expect(info.getByText('Saksnummer:', { exact: true })).toBeVisible();
    await expect(info.getByText(scenario.sak.fagsakId, { exact: true })).toBeVisible();
    await expect(info.getByText('Periode:', { exact: true })).toBeVisible();
    await expect(info).toContainText('15.04.2024');
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
    await expectSelectedCase(page, scenario.sak);
    expect(mutations).toEqual([]);
};

test('velger ordinær og reservert OMPUT-sak uten foreldede detaljer', async ({ page }) => {
    await openJournalpost(page);
    await selectApplicantAndLoadCases(page);

    await selectCase(page, ORDINÆR_SAK);
    await selectCase(page, RESERVERT_SAK);
    await expectSelectedCase(page, RESERVERT_SAK, ORDINÆR_SAK.fagsakId);
});

test('reserverer ny OMPUT-sak med ledig behandlingsår', async ({ page }) => {
    await openJournalpost(page);
    const { reservedCase, yearSelect, occupiedYear, freeYear } = await prepareNewCase(page);

    await expect(journalpostpanel(page).getByText('Saksnummer:', { exact: true })).toHaveCount(0);
    await expect(journalpostpanel(page)).not.toContainText(reservedCase.fagsakId);
    await expect(fortsett(page)).toBeDisabled();
    await expect(vent(page)).toBeDisabled();

    await yearSelect.selectOption(occupiedYear);
    await expect(page.locator('[data-test-id="alertFagsakMedValgtBehandlingsår"]')).toBeVisible();
    await expect(page.locator('[data-test-id="jornalførUtenFagsak"]')).toHaveCount(0);
    await expect(fortsett(page)).toBeDisabled();
    await expect(vent(page)).toBeDisabled();

    await yearSelect.selectOption(freeYear);
    await expect(page.locator('[data-test-id="alertFagsakMedValgtBehandlingsår"]')).toHaveCount(0);
    await expectNoCaseReady(page, freeYear);
});

test('avbryter Fortsett og Vent for ny OMPUT-sak uten fagsak', async ({ page }) => {
    const mutations = recordMutations(page);
    await openJournalpost(page);
    const { yearSelect, freeYear } = await prepareNewCase(page);
    await yearSelect.selectOption(freeYear);
    await expectNoCaseReady(page, freeYear);

    await expectAndCancelNoCaseModal(page, 'Fortsett', freeYear, mutations);
    await expectAndCancelNoCaseModal(page, 'Vent', freeYear, mutations);
});

test('nullstiller OMPUT-valg og avbryter begge modalene for ny søker', async ({ page }) => {
    const mutations = recordMutations(page);
    await openJournalpost(page);
    const { reservedCase, yearSelect, freeYear } = await prepareNewCase(page);
    await yearSelect.selectOption(freeYear);
    await expectNoCaseReady(page, freeYear);

    await page.getByRole('radio', { name: 'Nei', exact: true }).check();
    await expect(page.getByLabel('Velg fagsak')).toHaveCount(0);
    await expect(page.getByLabel('Reserver saksnummer til ny fagsak')).toHaveCount(0);
    await expect(fortsett(page)).toBeDisabled();
    await expect(vent(page)).toBeDisabled();

    const currentYear = await page.evaluate(() => new Date().getFullYear());
    const newApplicantCases = [{ ...RESERVERT_SAK, behandlingsår: currentYear }];
    await installCaseLookupHandler(page, newApplicantCases, NY_SØKER_ID);
    const lookupPromise = page.waitForResponse(
        (response) =>
            isResponse(response, 'GET', ApiPath.HENT_FAGSAK_PÅ_IDENT) &&
            response.request().headers()['x-nav-norskident'] === NY_SØKER_ID,
    );
    await page.getByLabel('Søkers fødselsnummer eller D-nummer:').fill(NY_SØKER_ID);
    const response = await lookupPromise;
    expect(response.status()).toBe(200);
    expect(response.fromServiceWorker()).toBe(true);
    expect(await response.json()).toEqual(newApplicantCases);

    await expectNoCaseReady(page, freeYear, NY_SØKER_ID, SØKER_ID, reservedCase.fagsakId);

    await expectAndCancelNoCaseModal(
        page,
        'Fortsett',
        freeYear,
        mutations,
        NY_SØKER_ID,
        SØKER_ID,
        reservedCase.fagsakId,
    );
    await expectAndCancelNoCaseModal(
        page,
        'Vent',
        freeYear,
        mutations,
        NY_SØKER_ID,
        SØKER_ID,
        reservedCase.fagsakId,
    );
});

for (const scenario of modalScenarios) {
    test(`avbryter ${scenario.action} for ${scenario.sak.reservert ? 'reservert' : 'ordinær'} OMPUT-sak`, async ({
        page,
    }) => {
        const mutations = recordMutations(page);
        await openJournalpost(page);
        await selectApplicantAndLoadCases(page);
        await selectCase(page, scenario.sak);

        await expectAndCancelModal(page, scenario, mutations);
    });
}
