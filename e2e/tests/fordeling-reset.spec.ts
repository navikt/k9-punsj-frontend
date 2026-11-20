import { expect, test, type Page, type Response } from '@playwright/test';

import barnFixture from '../../cypress/fixtures/barn.json' with { type: 'json' };
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

const waitForLookup = (page: Page, path: string, norskIdent: string) =>
    page.waitForResponse(
        (response) =>
            isApiResponse(response, 'GET', path) &&
            response.request().headers()['x-nav-norskident'] === norskIdent,
    );

const waitForSakerLookup = (page: Page, norskIdent: string) =>
    waitForLookup(page, ApiPath.HENT_FAGSAK_PÅ_IDENT, norskIdent);

const expectLookup = (response: Response, norskIdent: string) => {
    expect(response.status()).toBe(200);
    expect(response.fromServiceWorker()).toBe(true);
    expect(response.request().headers()['x-nav-norskident']).toBe(norskIdent);
};

const expectSakerLookup = async (response: Response, norskIdent: string, fagsakIds: string[]) => {
    expectLookup(response, norskIdent);
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

const recordSideEffects = (page: Page) => {
    const debugClosePrefix = ApiPath.JOURNALPOST_LUKK_DEBUGG.replace('{journalpostId}', '');
    const sideEffects: string[] = [];

    page.context().on('request', (request) => {
        const path = new URL(request.url()).pathname;
        const method = request.method();
        if (
            ((path === '/api/k9-punsj' || path.startsWith('/api/k9-punsj/')) && !['GET', 'HEAD'].includes(method)) ||
            (method === 'GET' && path.startsWith(debugClosePrefix))
        ) {
            sideEffects.push(`${method} ${path}`);
        }
    });

    return sideEffects;
};

const installLookupOverrides = async (
    page: Page,
    søkerIdent: string,
    fagsakliste: typeof fagsaker,
    barneliste?: typeof barnFixture,
) => {
    await page.evaluate(
        ({ casePath, childPath, norskIdent, saker, barn }) => {
            const msw = window.msw;
            if (!msw) {
                throw new Error('MSW-testarbeideren er ikke tilgjengelig.');
            }

            msw.worker.use(
                msw.http.get(casePath, ({ request }) => {
                    if (request.headers.get('X-Nav-NorskIdent') === norskIdent) {
                        return msw.HttpResponse.json(saker, { status: 200 });
                    }
                    return;
                }),
            );
            if (barn) {
                msw.worker.use(
                    msw.http.get(childPath, ({ request }) => {
                        if (request.headers.get('X-Nav-NorskIdent') === norskIdent) {
                            return msw.HttpResponse.json(barn, { status: 200 });
                        }
                        return;
                    }),
                );
            }
        },
        {
            casePath: ApiPath.HENT_FAGSAK_PÅ_IDENT,
            childPath: ApiPath.BARN_GET,
            norskIdent: søkerIdent,
            saker: fagsakliste,
            barn: barneliste,
        },
    );
};

const getHoldButton = (page: Page) => page.locator('[data-test-id="journalførOgVent"]');
const getContinueButton = (page: Page) => page.locator('[data-test-id="journalførOgFortsett"]');
const noChildIdCheckbox = (page: Page) => page.getByLabel('Pleietrengende har ikke fødselsnummer', { exact: true });
const childIdField = (page: Page) => page.getByLabel('Pleietrengendes fødselsnummer:', { exact: true });
const noChildIdInfo = (page: Page) => page.locator('[data-test-id="pleietrengendeHarIkkeFnrInformasjon"]');
const reserveCase = (page: Page) => page.getByLabel('Reserver saksnummer til ny fagsak');
const otherChildCheckbox = (page: Page) => page.getByLabel('Det gjelder et annet barn');

const selectCaseWithChild = async (page: Page) => {
    const lookupPromise = waitForSakerLookup(page, SØKER_ID);
    await page.getByRole('radio', { name: 'Ja' }).check();
    await expectSakerLookup(await lookupPromise, SØKER_ID, [GAMMEL_FAGSAK_ID]);
    const caseSelect = page.getByLabel('Velg fagsak');
    await caseSelect.selectOption(GAMMEL_FAGSAK_ID);
    await expect(caseSelect).toHaveValue(GAMMEL_FAGSAK_ID);
    await expect(page.locator('.fagsakSelectedInfo')).toContainText(GAMMELT_BARN_ID);
};

const selectNoChildId = async (page: Page) => {
    await noChildIdCheckbox(page).check();
    await expect(noChildIdCheckbox(page)).toBeChecked();
    await expect(childIdField(page)).toBeDisabled();
    await expect(noChildIdInfo(page)).toBeVisible();
};

const expectChildIdReset = async (page: Page) => {
    await expect(noChildIdCheckbox(page)).toBeVisible();
    await expect(noChildIdCheckbox(page)).not.toBeChecked();
    await expect(childIdField(page)).toBeEnabled();
    await expect(noChildIdInfo(page)).toHaveCount(0);
};

const expectApplicantModal = async (page: Page, applicantId: string, childId: string) => {
    const dialog = page.locator('[data-test-id="klassifiserModal"]');
    const info = dialog.locator('[data-test-id="klassifiseringInfo"]');

    await expect(dialog).toBeVisible();
    await expect(info.getByText('Sakstype:', { exact: true })).toBeVisible();
    await expect(info.getByText('Pleiepenger sykt barn', { exact: true })).toBeVisible();
    await expect(info.getByText('Søkers ID:', { exact: true })).toBeVisible();
    await expect(info.getByText(applicantId, { exact: true })).toBeVisible();
    await expect(info.getByText('Pleietrengendes ID:', { exact: true })).toBeVisible();
    await expect(info.getByText(childId, { exact: true })).toBeVisible();
    await expect(info.getByText(/Saksnummer/i)).toHaveCount(0);
    await expect(info.getByText(/Periode/i)).toHaveCount(0);
    await expect(info).not.toContainText(GAMMEL_FAGSAK_ID);
    await expect(info).not.toContainText(GAMMELT_BARN_ID);
    await expect(
        dialog
            .locator('[data-test-id="klassifiserModalAlertBlokk"]')
            .getByText('Informasjonen kan ikke endres etter journalposten er journalført.'),
    ).toBeVisible();
    await expect(dialog.locator('[data-test-id="klassifiserModalGåTilLos"]')).toHaveCount(0);
    await expect(dialog.locator('[data-test-id="klassifiserModalJournalfør"]')).toBeEnabled();
    await expect(dialog.getByRole('button', { name: 'Avbryt', exact: true })).toBeEnabled();

    return dialog;
};

test('nullstiller søker og barn når søkeridenten endres', async ({ page }) => {
    const journalpostId = FORDELING_PSB_SCENARIOS.resetApplicant;
    const sideEffects = recordSideEffects(page);

    await openPsbJournalpost(page, journalpostId);
    await installLookupOverrides(page, NY_SØKER_ID, [fagsaker[0]]);

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
        await expect(childSelect).toHaveValue(BARN_ID);

        const journalpostPanel = page.locator('.journalpostpanel');
        const continueButton = page.locator('[data-test-id="journalførOgFortsett"]');
        const holdButton = page.locator('[data-test-id="journalførOgVent"]');
        await expect(journalpostPanel.getByText('Søkers ID:', { exact: true })).toBeVisible();
        await expect(journalpostPanel).toContainText(NY_SØKER_ID);
        await expect(journalpostPanel.getByText('Barnets ID:', { exact: true })).toBeVisible();
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
        await expect(continueDialog.locator('[data-test-id="klassifiserModalJournalfør"]')).toHaveText(
            'Journalfør journalposten',
        );
        await continueDialog.getByRole('button', { name: 'Avbryt' }).click();
        await expect(continueDialog).toHaveCount(0);
        await expect(journalpostPanel).toContainText(NY_SØKER_ID);
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
        await expect(holdDialog.locator('[data-test-id="klassifiserModalJournalfør"]')).toHaveText(
            'Journalfør og sett på vent',
        );
        await holdDialog.getByRole('button', { name: 'Avbryt' }).click();
        await expect(holdDialog).toHaveCount(0);
        await expect(journalpostPanel).toContainText(NY_SØKER_ID);
        await expect(journalpostPanel).toContainText(BARN_ID);
        await expect(childSelect).toHaveValue(BARN_ID);
        await expect(page.getByLabel('Søkers fødselsnummer eller D-nummer:')).toHaveValue(NY_SØKER_ID);
    });

    await test.step('Bekreft opprinnelig søker på nytt', async () => {
        const lookupPromise = waitForSakerLookup(page, SØKER_ID);
        await page.getByRole('radio', { name: 'Ja' }).check();
        await expectSakerLookup(await lookupPromise, SØKER_ID, [FAGSAK_UTEN_BARN_ID, GAMMEL_FAGSAK_ID]);

        await expect(page.locator('[data-test-id="journalførOgVent"]')).toBeDisabled();
        const journalpostPanel = page.locator('.journalpostpanel');
        await expect(journalpostPanel.getByText('Søkers ID:', { exact: true })).toBeVisible();
        await expect(journalpostPanel).toContainText(SØKER_ID);
        await expect(journalpostPanel).not.toContainText(NY_SØKER_ID);
        await expect(journalpostPanel.getByText('Barnets ID:', { exact: true })).toHaveCount(0);
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
        await expect(page.locator('[data-test-id="journalførOgVent"]')).toBeVisible();
        await expect(page.locator('[data-test-id="journalførOgVent"]')).toBeDisabled();
    });

    expect(sideEffects).toEqual([]);
});

test('nullstiller sak og barn ved bytte av dokumenttype', async ({ page }) => {
    const journalpostId = FORDELING_PSB_SCENARIOS.resetDocumentType;
    const sideEffects = recordSideEffects(page);

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

    expect(sideEffects).toEqual([]);
});

test('nullstiller manglende fødselsnummer ved søkerbytte med tomt saksoppslag', async ({ page }) => {
    const sideEffects = recordSideEffects(page);
    await openPsbJournalpost(page, FORDELING_PSB_SCENARIOS.resetApplicant);
    await installLookupOverrides(page, NY_SØKER_ID, [], barnFixture);

    await test.step('Velg ny sak uten fødselsnummer og avbryt Vent', async () => {
        await selectCaseWithChild(page);
        await reserveCase(page).check();
        await otherChildCheckbox(page).check();
        await selectNoChildId(page);
        await expect(getContinueButton(page)).toBeDisabled();

        await noChildIdCheckbox(page).uncheck();
        await expect(getHoldButton(page)).toBeDisabled();
        await noChildIdCheckbox(page).check();
        await expect(getHoldButton(page)).toBeEnabled();
        await getHoldButton(page).click();
        const dialog = page.locator('[data-test-id="klassifiserModal"]');
        await expect(dialog).toBeVisible();
        await dialog.getByRole('button', { name: 'Avbryt' }).click();
        await expect(dialog).toHaveCount(0);
    });

    await test.step('Bytt søker og tilbake uten å velge barn fra listen', async () => {
        await page.getByRole('radio', { name: 'Nei' }).check();
        const saker = waitForSakerLookup(page, NY_SØKER_ID);
        const barn = waitForLookup(page, ApiPath.BARN_GET, NY_SØKER_ID);
        await page.getByLabel('Søkers fødselsnummer eller D-nummer:').fill(NY_SØKER_ID);
        await expectSakerLookup(await saker, NY_SØKER_ID, []);
        const barnResponse = await barn;
        expectLookup(barnResponse, NY_SØKER_ID);
        expect(await barnResponse.json()).toEqual(barnFixture);
        await expect(page.getByLabel('Velg hvilket barn det gjelder')).toBeVisible();
        await expect(getHoldButton(page)).toBeVisible();
        await expect(getHoldButton(page)).toBeDisabled();

        const panel = page.locator('.journalpostpanel');
        await expect(panel).toContainText(NY_SØKER_ID);
        const originalSaker = waitForSakerLookup(page, SØKER_ID);
        await page.getByRole('radio', { name: 'Ja' }).check();
        await expectSakerLookup(await originalSaker, SØKER_ID, [GAMMEL_FAGSAK_ID]);
        await expect(page.getByLabel('Velg fagsak')).toBeVisible();
        await expect(panel).toContainText(SØKER_ID);
        await expect(panel).not.toContainText(NY_SØKER_ID);
        await expect(panel).not.toContainText(/Barnets ID/i);
        await expect(panel).not.toContainText(BARN_ID);
        await expect(panel).not.toContainText(GAMMELT_BARN_ID);
        await expect(getContinueButton(page)).toBeDisabled();
        await expect(getHoldButton(page)).toBeDisabled();

        await expect(otherChildCheckbox(page)).not.toBeChecked();
        await otherChildCheckbox(page).check();
        await expectChildIdReset(page);
        await expect(getHoldButton(page)).toBeDisabled();
    });

    expect(sideEffects).toEqual([]);
});

test('nullstiller manglende fødselsnummer ved bytte fra PSB til Omsorgspenger og tilbake', async ({ page }) => {
    const sideEffects = recordSideEffects(page);
    await openPsbJournalpost(page, FORDELING_PSB_SCENARIOS.resetDocumentType);
    const tomBarneliste = { ...barnFixture, barn: [] };
    await installLookupOverrides(page, SØKER_ID, [], tomBarneliste);

    const saker = waitForSakerLookup(page, SØKER_ID);
    const barn = waitForLookup(page, ApiPath.BARN_GET, SØKER_ID);
    await page.getByRole('radio', { name: 'Ja' }).check();
    await expectSakerLookup(await saker, SØKER_ID, []);
    const barnResponse = await barn;
    expectLookup(barnResponse, SØKER_ID);
    expect(await barnResponse.json()).toEqual(tomBarneliste);
    await selectNoChildId(page);
    await expect(getHoldButton(page)).toBeEnabled();

    const omsorgspenger = page.getByRole('radio', { name: 'Omsorgspenger/omsorgsdager', exact: true });
    await omsorgspenger.check();
    await expect(omsorgspenger).toBeChecked();
    await page.getByRole('radio', { name: 'Pleiepenger sykt barn', exact: true }).check();

    await expectChildIdReset(page);
    await expect(getHoldButton(page)).toBeDisabled();
    expect(sideEffects).toEqual([]);
});

test('nullstiller manglende fødselsnummer ved bytte mellom ny og eksisterende sak', async ({ page }) => {
    const sideEffects = recordSideEffects(page);
    await openPsbJournalpost(page, FORDELING_PSB_SCENARIOS.resetApplicant);
    await selectCaseWithChild(page);
    await reserveCase(page).check();
    await otherChildCheckbox(page).check();
    await selectNoChildId(page);
    await expect(getHoldButton(page)).toBeEnabled();

    await reserveCase(page).uncheck();
    await expect(page.getByLabel('Velg fagsak')).toBeEnabled();
    await reserveCase(page).check();
    await expect(getHoldButton(page)).toBeDisabled();

    await otherChildCheckbox(page).check();
    await expectChildIdReset(page);
    expect(sideEffects).toEqual([]);
});
