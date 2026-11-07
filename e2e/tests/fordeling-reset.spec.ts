import { expect, test, type Page, type Response } from '@playwright/test';

import fagsaker from '../../cypress/fixtures/fagsaker.json' with { type: 'json' };
import { ApiPath } from '../../src/app/apiConfig';
import { FORDELING_PSB_SCENARIOS } from '../../src/mocks/fordelingPsbTestScenarioIds';

const SØKER_ID = '17420373147';
const NY_SØKER_ID = '12448325820';
const BARN_ID = '18410162721';
const GAMMELT_BARN_ID = '24420167209';
const GAMMEL_FAGSAK_ID = '1DQBDDC';
const FAGSAK_UTEN_BARN_ID = '1DMU93A';
const PLS_FAGSAK_ID = '1DQBBHF';

const isApiResponse = (response: Response, method: string, path: string) =>
    response.request().method() === method && new URL(response.url()).pathname === path;

const journalpostPath = (journalpostId: string) => ApiPath.JOURNALPOST_GET.replace('{journalpostId}', journalpostId);
const ventPath = (journalpostId: string) => ApiPath.JOURNALPOST_SETT_PAA_VENT.replace('{journalpostId}', journalpostId);
const behandlingAarPath = (journalpostId: string) =>
    ApiPath.JOURNALPOST_SETT_BEHANDLINGSÅR.replace('{journalpostId}', journalpostId);
const copyPath = (journalpostId: string) => ApiPath.JOURNALPOST_KOPIERE.replace('{journalpostId}', journalpostId);
const closePath = (journalpostId: string) => ApiPath.JOURNALPOST_LUKK_OPPGAVE.replace('{journalpostId}', journalpostId);

const waitForSakerLookup = (page: Page, norskIdent: string) =>
    page.waitForResponse(
        (response) =>
            isApiResponse(response, 'GET', ApiPath.HENT_FAGSAK_PÅ_IDENT) &&
            response.request().headers()['x-nav-norskident'] === norskIdent,
    );

const expectSakerLookup = async (response: Response, norskIdent: string, fagsakIds: string[]) => {
    expect(response.status()).toBe(200);
    expect(response.fromServiceWorker()).toBe(true);
    expect(response.request().headers()['x-nav-norskident']).toBe(norskIdent);

    const data = await response.json();
    if (fagsakIds.length === 0) {
        expect(data).toEqual([]);
    } else {
        expect(data).toEqual(
            expect.arrayContaining(fagsakIds.map((fagsakId) => expect.objectContaining({ fagsakId }))),
        );
    }
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
        const path = new URL(request.url()).pathname;
        if (paths.has(path)) {
            mutations.push(`${request.method()} ${path}`);
        }
    });

    return mutations;
};

const expectApplicantModal = async (page: Page, applicantId: string, childId: string) => {
    const dialog = page.locator('[data-test-id="klassifiserModal"]');
    const info = dialog.locator('[data-test-id="klassifiseringInfo"]');

    await expect(dialog).toBeVisible();
    await expect(info).toContainText(applicantId);
    await expect(info).toContainText(childId);
    await expect(info.getByText(/Saksnummer/i)).toHaveCount(0);
    await expect(info.getByText(/Periode/i)).toHaveCount(0);
    await expect(info).not.toContainText(GAMMEL_FAGSAK_ID);
    await expect(info).not.toContainText(GAMMELT_BARN_ID);

    return dialog;
};

test('nullstiller søker og barn når søkeridenten endres', async ({ page }) => {
    const journalpostId = FORDELING_PSB_SCENARIOS.resetApplicant;
    const mutations = recordMutationRequests(page, journalpostId);

    await openPsbJournalpost(page, journalpostId);
    await page.evaluate(
        ({ path, applicantId, cases }) => {
            const msw = window.msw;
            if (!msw) {
                throw new Error('MSW-testarbeideren er ikke tilgjengelig.');
            }

            msw.worker.use(
                msw.http.get(path, ({ request }) => {
                    if (request.headers.get('X-Nav-NorskIdent') === applicantId) {
                        return msw.HttpResponse.json(cases);
                    }
                    return;
                }),
            );
        },
        { path: ApiPath.HENT_FAGSAK_PÅ_IDENT, applicantId: NY_SØKER_ID, cases: [fagsaker[0]] },
    );

    await test.step('Velg opprinnelig søker og sak med barn', async () => {
        const lookupPromise = waitForSakerLookup(page, SØKER_ID);
        await page.getByRole('radio', { name: 'Ja' }).check();
        await expectSakerLookup(await lookupPromise, SØKER_ID, [FAGSAK_UTEN_BARN_ID, GAMMEL_FAGSAK_ID]);

        const caseSelect = page.getByLabel('Velg fagsak');
        await expect(caseSelect).toBeVisible();
        await caseSelect.selectOption(GAMMEL_FAGSAK_ID);
        await expect(page.locator('.fagsakSelectedInfo')).toContainText(GAMMELT_BARN_ID);
        await expect(page.locator('.journalpostpanel')).toContainText(GAMMEL_FAGSAK_ID);
    });

    await test.step('Bytt til ny fagsak og fjern tidligere valg', async () => {
        await page.getByLabel('Reserver saksnummer til ny fagsak').check();

        const caseSelect = page.getByLabel('Velg fagsak');
        await expect(caseSelect).toBeDisabled();
        await expect(caseSelect).toHaveValue('');
        await expect(page.locator('.fagsakSelectedInfo')).toHaveCount(0);
        await expect(page.locator('.journalpostpanel')).not.toContainText(GAMMEL_FAGSAK_ID);
        await expect(page.locator('.journalpostpanel')).not.toContainText(GAMMELT_BARN_ID);
        await expect(page.locator('[data-test-id="journalførOgFortsett"]')).toBeDisabled();
        await expect(page.locator('[data-test-id="journalførOgVent"]')).toBeDisabled();
        await expect(page).toHaveURL((url) => url.pathname === `/journalpost/${journalpostId}`);

        const otherChild = page.getByLabel('Det gjelder et annet barn');
        await expect(otherChild).toBeVisible();
        await otherChild.check();
        await expect(otherChild).toBeChecked();
        const noChildId = page.getByLabel('Pleietrengende har ikke fødselsnummer', { exact: true });
        await expect(noChildId).toBeVisible();
        await noChildId.check();
        await expect(noChildId).toBeChecked();
        await expect(page.getByLabel('Pleietrengendes fødselsnummer:', { exact: true })).toBeDisabled();
        await expect(page.locator('[data-test-id="pleietrengendeHarIkkeFnrInformasjon"]')).toBeVisible();
        await page.getByRole('radio', { name: 'Nei' }).check();

        await expect(page.getByLabel('Velg fagsak')).toHaveCount(0);
        await expect(page.getByLabel('Reserver saksnummer til ny fagsak')).toHaveCount(0);
        await expect(page.getByLabel('Pleietrengendes fødselsnummer:')).toHaveCount(0);
        await expect(page.getByLabel('Pleietrengende har ikke fødselsnummer')).toHaveCount(0);
        await expect(page.locator('[data-test-id="pleietrengendeHarIkkeFnrInformasjon"]')).toHaveCount(0);
        await expect(page.locator('[data-test-id="journalførOgFortsett"]')).toBeDisabled();
        await expect(page.locator('[data-test-id="journalførOgVent"]')).toBeDisabled();
    });

    await test.step('Velg ny søker og barn, og avbryt begge modalene', async () => {
        const lookupPromise = waitForSakerLookup(page, NY_SØKER_ID);
        await page.getByLabel('Søkers fødselsnummer eller D-nummer:').fill(NY_SØKER_ID);
        const lookupResponse = await lookupPromise;
        await expectSakerLookup(lookupResponse, NY_SØKER_ID, [FAGSAK_UTEN_BARN_ID]);
        expect(await lookupResponse.json()).toEqual([fagsaker[0]]);

        await expect(page.getByLabel('Velg fagsak')).toBeDisabled();
        await expect(page.locator('.fagsakSelectedInfo')).toHaveCount(0);
        const childSelect = page.getByLabel('Velg hvilket barn det gjelder');
        await expect(childSelect).toBeVisible();
        await expect(page.locator('[data-test-id="journalførOgVent"]')).toBeDisabled();
        await childSelect.selectOption({ label: `Geir-Paco Gundersen - ${BARN_ID}` });

        const journalpostPanel = page.locator('.journalpostpanel');
        const continueButton = page.locator('[data-test-id="journalførOgFortsett"]');
        const holdButton = page.locator('[data-test-id="journalførOgVent"]');
        await expect(journalpostPanel).toContainText(NY_SØKER_ID);
        await expect(journalpostPanel).toContainText(BARN_ID);
        await expect(journalpostPanel).not.toContainText(GAMMEL_FAGSAK_ID);
        await expect(journalpostPanel).not.toContainText(GAMMELT_BARN_ID);
        await expect(page.locator('[data-test-id="jornalførUtenFagsak"]')).toBeVisible();
        await expect(continueButton).toBeEnabled();
        await expect(holdButton).toBeEnabled();

        await continueButton.click();
        const continueDialog = await expectApplicantModal(page, NY_SØKER_ID, BARN_ID);
        await expect(continueDialog.getByRole('heading', { name: 'Vil du lagre følgende informasjon til journalposten?' }))
            .toBeVisible();
        await continueDialog.getByRole('button', { name: 'Avbryt' }).click();
        await expect(continueDialog).toBeHidden();
        await expect(journalpostPanel).toContainText(BARN_ID);
        await expect(childSelect).toHaveValue(BARN_ID);
        await expect(page.getByLabel('Søkers fødselsnummer eller D-nummer:')).toHaveValue(NY_SØKER_ID);

        await holdButton.click();
        const holdDialog = await expectApplicantModal(page, NY_SØKER_ID, BARN_ID);
        await expect(
            holdDialog.getByRole('heading', {
                name: 'Vil du lagre følgende informasjon til journalposten og sett på vent?',
            }),
        ).toBeVisible();
        await holdDialog.getByRole('button', { name: 'Avbryt' }).click();
        await expect(holdDialog).toBeHidden();
        await expect(journalpostPanel).toContainText(BARN_ID);
        await expect(childSelect).toHaveValue(BARN_ID);
    });

    await test.step('Bekreft opprinnelig søker på nytt', async () => {
        const lookupPromise = waitForSakerLookup(page, SØKER_ID);
        await page.getByRole('radio', { name: 'Ja' }).check();
        await expectSakerLookup(await lookupPromise, SØKER_ID, [FAGSAK_UTEN_BARN_ID, GAMMEL_FAGSAK_ID]);

        await expect(page.locator('[data-test-id="journalførOgVent"]')).toBeDisabled();
        const journalpostPanel = page.locator('.journalpostpanel');
        await expect(journalpostPanel).toContainText(SØKER_ID);
        await expect(journalpostPanel).not.toContainText(NY_SØKER_ID);
        await expect(journalpostPanel).not.toContainText(BARN_ID);
        await expect(journalpostPanel).not.toContainText(GAMMELT_BARN_ID);
        await expect(page.locator('.fagsakSelectedInfo')).toHaveCount(0);
        await expect(page.getByLabel('Reserver saksnummer til ny fagsak')).toBeChecked();
        await expect(page.getByLabel('Velg fagsak')).toHaveValue('');
        await expect(page.getByLabel('Velg hvilket barn det gjelder')).toHaveValue('');
        await expect(page.locator('[data-test-id="journalførOgFortsett"]')).toBeDisabled();

        const otherChild = page.getByLabel('Det gjelder et annet barn');
        await expect(otherChild).not.toBeChecked();
        await otherChild.check();
        const noChildId = page.getByLabel('Pleietrengende har ikke fødselsnummer', { exact: true });
        await expect(noChildId).toBeVisible();
        await expect(noChildId).not.toBeChecked();
        await expect(page.getByLabel('Pleietrengendes fødselsnummer:', { exact: true })).toBeEnabled();
        await expect(page.locator('[data-test-id="pleietrengendeHarIkkeFnrInformasjon"]')).toHaveCount(0);
        expect(mutations).toEqual([]);
        await expect(page.locator('[data-test-id="journalførOgVent"]')).toBeVisible();
        await expect(page.locator('[data-test-id="journalførOgVent"]')).toBeDisabled();
    });
});

test('nullstiller sak og barn ved bytte av dokumenttype', async ({ page }) => {
    const journalpostId = FORDELING_PSB_SCENARIOS.resetDocumentType;
    const mutations = recordMutationRequests(page, journalpostId);

    await openPsbJournalpost(page, journalpostId);

    await test.step('Velg PSB-sak med barn', async () => {
        const lookupPromise = waitForSakerLookup(page, SØKER_ID);
        await page.getByRole('radio', { name: 'Ja' }).check();
        await expectSakerLookup(await lookupPromise, SØKER_ID, [FAGSAK_UTEN_BARN_ID, GAMMEL_FAGSAK_ID]);

        const caseSelect = page.getByLabel('Velg fagsak');
        await expect(caseSelect).toBeVisible();
        await expect(caseSelect).toHaveValue('');
        await caseSelect.selectOption(GAMMEL_FAGSAK_ID);
        await expect(page.locator('.fagsakSelectedInfo')).toContainText(GAMMELT_BARN_ID);
        await expect(page.locator('.journalpostpanel')).toContainText(GAMMEL_FAGSAK_ID);
    });

    await test.step('Bytt midlertidig til PLS og kontroller at PSB-valget fjernes', async () => {
        const lookupPromise = waitForSakerLookup(page, SØKER_ID);
        await page.getByRole('radio', { name: 'Pleiepenger i livets sluttfase' }).check();
        await expectSakerLookup(await lookupPromise, SØKER_ID, [PLS_FAGSAK_ID]);

        const caseSelect = page.getByLabel('Velg fagsak');
        await expect(caseSelect).toBeVisible();
        await expect(caseSelect).toHaveValue('');
        await expect(caseSelect.locator(`option[value="${PLS_FAGSAK_ID}"]`)).toHaveCount(1);
        await expect(caseSelect.locator(`option[value="${GAMMEL_FAGSAK_ID}"]`)).toHaveCount(0);
        await expect(page.locator('.fagsakSelectedInfo')).toHaveCount(0);
        await expect(page.locator('.journalpostpanel')).not.toContainText(GAMMEL_FAGSAK_ID);
        await expect(page.locator('.journalpostpanel')).not.toContainText(GAMMELT_BARN_ID);
        await expect(page.locator('[data-test-id="journalførOgFortsett"]')).toBeDisabled();
        await expect(page.locator('[data-test-id="journalførOgVent"]')).toBeDisabled();
        await expect(page.getByRole('radio', { name: 'Ja' })).not.toBeChecked();
        await expect(page.getByRole('radio', { name: 'Nei' })).not.toBeChecked();
        await expect(page).toHaveURL((url) => url.pathname === `/journalpost/${journalpostId}`);
    });

    await test.step('Velg PSB og sak uten barn på nytt', async () => {
        const lookupPromise = waitForSakerLookup(page, SØKER_ID);
        await page.getByRole('radio', { name: 'Pleiepenger sykt barn' }).check();
        await expectSakerLookup(await lookupPromise, SØKER_ID, [FAGSAK_UTEN_BARN_ID, GAMMEL_FAGSAK_ID]);

        const caseSelect = page.getByLabel('Velg fagsak');
        await expect(caseSelect).toBeVisible();
        await expect(caseSelect).toHaveValue('');
        await expect(page.locator('.fagsakSelectedInfo')).toHaveCount(0);
        await expect(page.locator('.journalpostpanel')).not.toContainText(GAMMEL_FAGSAK_ID);
        await expect(page.locator('.journalpostpanel')).not.toContainText(GAMMELT_BARN_ID);
        await expect(page.getByRole('radio', { name: 'Ja' })).not.toBeChecked();
        await expect(page.locator('[data-test-id="journalførOgFortsett"]')).toBeDisabled();
        await expect(page.locator('[data-test-id="journalførOgVent"]')).toBeDisabled();

        await page.getByRole('radio', { name: 'Ja' }).check();
        await expect(page.getByRole('radio', { name: 'Ja' })).toBeChecked();
        await expect(caseSelect).toBeEnabled();
        await caseSelect.selectOption(FAGSAK_UTEN_BARN_ID);
        await expect(caseSelect).toHaveValue(FAGSAK_UTEN_BARN_ID);

        const journalpostPanel = page.locator('.journalpostpanel');
        await expect(page.locator('.fagsakSelectedInfo')).toContainText('ikke satt');
        await expect(journalpostPanel).toContainText(FAGSAK_UTEN_BARN_ID);
        await expect(journalpostPanel).not.toContainText(GAMMEL_FAGSAK_ID);
        await expect(journalpostPanel).not.toContainText(GAMMELT_BARN_ID);
        await expect(page.locator('[data-test-id="journalførOgFortsett"]')).toBeDisabled();
        await expect(page.locator('[data-test-id="journalførOgVent"]')).toBeEnabled();

        await page.locator('[data-test-id="journalførOgVent"]').click();
        const dialog = page.locator('[data-test-id="klassifiserModal"]');
        const info = dialog.locator('[data-test-id="klassifiseringInfo"]');
        await expect(dialog).toBeVisible();
        await expect(info).toContainText(SØKER_ID);
        await expect(info).toContainText(FAGSAK_UTEN_BARN_ID);
        await expect(info.getByText(/Pleietrengendes ID/i)).toHaveCount(0);
        await expect(info).not.toContainText(GAMMEL_FAGSAK_ID);
        await expect(info).not.toContainText(GAMMELT_BARN_ID);
        await dialog.getByRole('button', { name: 'Avbryt' }).click();
        await expect(dialog).toBeHidden();
        await expect(journalpostPanel).not.toContainText(GAMMELT_BARN_ID);
    });

    expect(mutations).toEqual([]);
});
