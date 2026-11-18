import { expect, test, type Page, type Response } from '@playwright/test';

import fagsaker from '../../cypress/fixtures/fagsaker.json' with { type: 'json' };
import journalpostFixture from '../../cypress/fixtures/jpPSB300.json' with { type: 'json' };
import { ApiPath } from '../../src/app/apiConfig';
import { FORDELING_PSB_SCENARIOS } from '../../src/mocks/fordelingPsbTestScenarioIds';

const SØKER_ID = journalpostFixture.norskIdent;
const BARN_ID = '18410162721';
const MANUELT_BARN_ID = '53488838241';
const EKSISTERENDE_SAK = fagsaker[2];
const RESERVERT_MED_BARN = fagsaker[3];
const RESERVERT_UTEN_BARN = fagsaker[4];
const NYTT_NUMMER = 'NYPSB12';
const KONFLIKT = {
    type: '/problem-details/post-mottak',
    status: 409,
    title: 'Konflikt ved postmottak',
    detail: 'Det finnes allerede en fagsak for barnet og ytelsen.',
    instance: '/api/journalpost/mottak',
    correlationId: 'psb-test-conflict',
};

const journalpostPath = (id: string) => ApiPath.JOURNALPOST_GET.replace('{journalpostId}', id);
const isResponse = (response: Response, method: string, path: string) =>
    response.request().method() === method && new URL(response.url()).pathname === path;
const fortsett = (page: Page) => page.locator('[data-test-id="journalførOgFortsett"]');
const vent = (page: Page) => page.locator('[data-test-id="journalførOgVent"]');
const panel = (page: Page) => page.locator('.journalpostpanel');
const panelCaseNumber = (page: Page) => panel(page).getByText('Saksnummer:', { exact: true });
const panelChildId = (page: Page) => panel(page).getByText('Barnets ID:', { exact: true });

const expectPanelChild = async (page: Page, childId: string) => {
    const label = panelChildId(page);
    await expect(label).toBeVisible();
    await expect(label.locator('..').getByText(childId, { exact: true })).toBeVisible();
};

const recordRequests = (page: Page, id: string) => {
    const mutations: string[] = [];
    const refreshes: Response[] = [];
    const paths = new Set([
        ApiPath.JOURNALPOST_MOTTAK,
        ...[
            ApiPath.JOURNALPOST_SETT_PAA_VENT,
            ApiPath.JOURNALPOST_KOPIERE,
            ApiPath.JOURNALPOST_SETT_BEHANDLINGSÅR,
            ApiPath.JOURNALPOST_LUKK_OPPGAVE,
            ApiPath.JOURNALPOST_LUKK_DEBUGG,
        ].map((path) => path.replace('{journalpostId}', id)),
        ApiPath.OPPRETT_GOSYS_OPPGAVE,
        ApiPath.PSB_SOKNAD_CREATE,
        ApiPath.PSB_SOKNAD_SUBMIT,
    ]);
    page.on('request', (request) => {
        const path = new URL(request.url()).pathname;
        if (paths.has(path)) mutations.push(`${request.method()} ${path}`);
    });
    page.on('response', (response) => {
        if (isResponse(response, 'GET', journalpostPath(id))) refreshes.push(response);
    });
    return { mutations, refreshes };
};

const openJournalpost = async (page: Page, id: string, flag = false) => {
    const initialResponse = page.waitForResponse((response) => isResponse(response, 'GET', journalpostPath(id)));
    await page.goto(`/journalpost/${id}`);
    const response = await initialResponse;
    expect(response.status()).toBe(200);
    expect(response.fromServiceWorker()).toBe(true);
    expect(await response.json()).toEqual({ ...journalpostFixture, journalpostId: id });
    await page.evaluate((value) => {
        const appWindow = window as Window & { appSettings?: Record<string, string | undefined> };
        if (!appWindow.appSettings) throw new Error('Applikasjonsinnstillingene er ikke tilgjengelige.');
        appWindow.appSettings.PSB_TILLAT_BARN_MED_FAGSAK_VIDERE = String(value);
    }, flag);
    const lookup = page.waitForResponse((result) => isResponse(result, 'GET', ApiPath.HENT_FAGSAK_PÅ_IDENT));
    await page.getByRole('radio', { name: 'Ja' }).check();
    const cases = await lookup;
    expect(cases.status()).toBe(200);
    expect(cases.fromServiceWorker()).toBe(true);
    expect(cases.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(await cases.json()).toEqual(fagsaker);
    await expect(page.getByLabel('Velg fagsak')).toBeEnabled();
};

const expectButtons = async (page: Page, continueEnabled: boolean, holdEnabled = continueEnabled) => {
    await expect(fortsett(page)).toBeEnabled({ enabled: continueEnabled });
    await expect(vent(page)).toBeEnabled({ enabled: holdEnabled });
};

const switchToNewCase = async (page: Page, previousCaseId: string) => {
    await page.getByLabel('Reserver saksnummer til ny fagsak').check();
    await expect(page.getByLabel('Velg fagsak')).toBeDisabled();
    await expect(page.getByLabel('Velg fagsak')).toHaveValue('');
    await expect(page.locator('.fagsakSelectedInfo')).toHaveCount(0);
    await expect(panelCaseNumber(page)).toHaveCount(0);
    await expect(panel(page)).not.toContainText(previousCaseId);
    await expectButtons(page, false);
    await expect(page.getByLabel('Velg hvilket barn det gjelder')).toBeVisible();
};

const enterNewMode = async (page: Page) => {
    const childId = EKSISTERENDE_SAK.pleietrengende!.identitetsnummer;
    await page.getByLabel('Velg fagsak').selectOption(EKSISTERENDE_SAK.fagsakId);
    await expect(panel(page)).toContainText(EKSISTERENDE_SAK.fagsakId);
    await expectPanelChild(page, childId);
    await switchToNewCase(page, EKSISTERENDE_SAK.fagsakId);
    await expect(panel(page)).not.toContainText(childId);
};

const expectSummary = async (page: Page, continueAction: boolean, childId?: string, caseId?: string) => {
    const dialog = page.getByRole('dialog');
    const info = dialog.locator('[data-test-id="klassifiseringInfo"]');
    await expect(
        dialog.getByRole('heading', {
            name: continueAction
                ? 'Vil du lagre følgende informasjon til journalposten?'
                : 'Vil du lagre følgende informasjon til journalposten og sett på vent?',
        }),
    ).toBeVisible();
    await expect(info.getByText('Sakstype:', { exact: true })).toBeVisible();
    await expect(info.getByText('Pleiepenger sykt barn', { exact: true })).toBeVisible();
    await expect(info.getByText('Søkers ID:', { exact: true })).toBeVisible();
    await expect(info.getByText(SØKER_ID, { exact: true })).toBeVisible();
    if (caseId) {
        await expect(info.getByText('Saksnummer:', { exact: true })).toBeVisible();
        await expect(info.getByText(caseId, { exact: true })).toBeVisible();
        await expect(info.getByText('Periode:', { exact: true })).toBeVisible();
        await expect(info).toContainText('15.04.2024');
    } else {
        await expect(info.getByText('Saksnummer:', { exact: true })).toHaveCount(0);
        await expect(info.getByText('Periode:', { exact: true })).toHaveCount(0);
        await expect(info).not.toContainText(/Saksnummer|Periode/i);
    }
    if (childId) {
        await expect(info.getByText('Pleietrengendes ID:', { exact: true })).toBeVisible();
        await expect(info.getByText(childId, { exact: true })).toBeVisible();
    } else {
        await expect(info.getByText('Pleietrengendes ID:', { exact: true })).toHaveCount(0);
        await expect(info).not.toContainText(/Pleietrengendes ID/i);
        await expect(info).not.toContainText(BARN_ID);
        await expect(info).not.toContainText(MANUELT_BARN_ID);
    }
    await expect(
        dialog
            .locator('[data-test-id="klassifiserModalAlertBlokk"]')
            .getByText('Informasjonen kan ikke endres etter journalposten er journalført.'),
    ).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Gå til LOS' })).toHaveCount(0);
    await expect(dialog.locator('[data-test-id="klassifiserModalGåTilLos"]')).toHaveCount(0);
    await expect(
        dialog.getByRole('button', {
            name: continueAction ? 'Journalfør journalposten' : 'Journalfør og sett på vent',
        }),
    ).toBeEnabled();
    await expect(dialog.getByRole('button', { name: 'Avbryt' })).toBeEnabled();
    return dialog;
};

const cancelSummary = async (page: Page, continueAction: boolean, childId?: string, caseId?: string) => {
    await (continueAction ? fortsett(page) : vent(page)).click();
    const dialog = await expectSummary(page, continueAction, childId, caseId);
    await dialog.getByRole('button', { name: 'Avbryt' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.locator('[data-test-id="klassifiserModal"]')).toHaveCount(0);
};

const expectNewChild = async (page: Page, childId: string) => {
    await expectPanelChild(page, childId);
    await expect(panel(page).getByText(/Saksnummer/)).toHaveCount(0);
    await expect(page.locator('[data-test-id="jornalførUtenFagsak"]')).toBeVisible();
    await expect(page.locator('[data-test-id="pleietrengendeHarFagsak"]')).toHaveCount(0);
    await expectButtons(page, true);
};

const expectNewRequest = (response: Response, id: string, childId: string) => {
    expect(response.fromServiceWorker()).toBe(true);
    expect(response.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    const body = response.request().postDataJSON();
    expect(body).toEqual({
        journalpostId: id,
        brukerIdent: SØKER_ID,
        pleietrengendeIdent: childId,
        fagsakYtelseTypeKode: 'PSB',
        relatertPersonIdent: '',
    });
    expect(body).not.toHaveProperty('saksnummer');
    expect(body).not.toHaveProperty('periode');
};

const confirmAndExpectDestination = async (
    page: Page,
    id: string,
    childId: string,
    caseId: string,
    reservedSelection: boolean,
) => {
    await fortsett(page).click();
    const dialog = await expectSummary(page, true, childId, reservedSelection ? caseId : undefined);
    const classification = page.waitForResponse((response) => isResponse(response, 'POST', ApiPath.JOURNALPOST_MOTTAK));
    const refresh = page.waitForResponse((response) => isResponse(response, 'GET', journalpostPath(id)));
    await dialog.getByRole('button', { name: 'Journalfør journalposten' }).click();
    const response = await classification;
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ saksnummer: caseId });
    if (reservedSelection) {
        expect(response.fromServiceWorker()).toBe(true);
        expect(response.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
        expect(response.request().postDataJSON()).toEqual({
            journalpostId: id,
            brukerIdent: SØKER_ID,
            pleietrengendeIdent: childId,
            fagsakYtelseTypeKode: 'PSB',
            saksnummer: caseId,
            periode: RESERVERT_MED_BARN.gyldigPeriode,
            relatertPersonIdent: '',
        });
    } else {
        expectNewRequest(response, id, childId);
    }
    const refreshed = await refresh;
    expect(refreshed.status()).toBe(200);
    expect(refreshed.fromServiceWorker()).toBe(true);
    expect(await refreshed.json()).toEqual({
        ...journalpostFixture,
        journalpostId: id,
        erFerdigstilt: true,
        journalpostStatus: 'JOURNALFOERT',
        sak: {
            fagsakId: caseId,
            sakstype: 'PSB',
            pleietrengendeIdent: childId,
            gyldigPeriode: reservedSelection ? RESERVERT_MED_BARN.gyldigPeriode : { fom: '', tom: '' },
            relatertPersonIdent: null,
            reservertSaksnummer: true,
        },
    });
    await expect(page).toHaveURL((url) => url.pathname === `/journalpost/${id}/pleiepenger-sykt-barn/`);
    const success = page.locator('[data-test-id="alertJournalførtReservert"]');
    await expect(success).toContainText(`Saksnummeret (${caseId}) er reservert.`);
    await expect(page.locator('[data-test-id="alertJournalført"]')).toHaveCount(0);
    await page.getByRole('radio', { name: 'Registrere opplysninger til K9' }).check();
    await expect(page.getByRole('button', { name: 'Bekreft' })).toBeEnabled();
};

test('velger reserverte saker og journalfører valgt nummer med barn til PSB', async ({ page }) => {
    const id = FORDELING_PSB_SCENARIOS.reservedCase;
    const { mutations } = recordRequests(page, id);
    await openJournalpost(page, id);
    const select = page.getByLabel('Velg fagsak');
    for (const sak of [RESERVERT_UTEN_BARN, RESERVERT_MED_BARN]) {
        await expect(
            select.getByRole('option', {
                name: `${sak.fagsakId} (K9 Pleiepenger sykt barn) (reservert)`,
                exact: true,
            }),
        ).toHaveCount(1);
        await select.selectOption(sak.fagsakId);
        await expect(select).toHaveValue(sak.fagsakId);
        const info = page.locator('.fagsakSelectedInfo');
        await expect(info).toContainText('Barn:');
        await expect(info.getByRole('link', { name: 'Se fagsak i K9' })).toHaveCount(0);
        await expect(panel(page)).toContainText(id);
        await expect(panel(page)).toContainText(SØKER_ID);
        await expect(panel(page)).toContainText('Pleiepenger sykt barn');
        const caseNumber = panelCaseNumber(page);
        await expect(caseNumber).toBeVisible();
        await expect(caseNumber.locator('..').getByText(sak.fagsakId, { exact: true })).toBeVisible();
        const child = sak.pleietrengende;
        if (child) {
            await expect(info).toContainText(`Navn: ${child.navn}`);
            await expect(info).toContainText(`Id: ${child.identitetsnummer}`);
            await expectPanelChild(page, child.identitetsnummer);
            await expectButtons(page, true);
            await cancelSummary(page, true, child.identitetsnummer, sak.fagsakId);
            await expect(select).toHaveValue(sak.fagsakId);
        } else {
            await expect(info).toContainText('ikke satt');
            await expect(panelChildId(page)).toHaveCount(0);
            await expectButtons(page, false, true);
        }
        await cancelSummary(page, false, child?.identitetsnummer, sak.fagsakId);
        await expect(select).toHaveValue(sak.fagsakId);
        expect(mutations).toEqual([]);
        if (!child) {
            await test.step('Bytt fra reservert sak uten barn til ny sak', async () => {
                await switchToNewCase(page, sak.fagsakId);
                await page.getByLabel('Reserver saksnummer til ny fagsak').uncheck();
                await expect(select).toBeEnabled();
                expect(mutations).toEqual([]);
            });
        }
    }
    await confirmAndExpectDestination(
        page,
        id,
        RESERVERT_MED_BARN.pleietrengende!.identitetsnummer,
        RESERVERT_MED_BARN.fagsakId,
        true,
    );
    expect(mutations).toEqual([`POST ${ApiPath.JOURNALPOST_MOTTAK}`]);
});

for (const flag of [false, true]) {
    test(`ny-sak-modus respekterer frontendflagget ${flag} uten mutasjoner`, async ({ page }) => {
        const id = flag ? FORDELING_PSB_SCENARIOS.newCaseFlagTrue : FORDELING_PSB_SCENARIOS.newCaseFlagFalse;
        const { mutations } = recordRequests(page, id);
        await openJournalpost(page, id, flag);
        await enterNewMode(page);
        expect(mutations).toEqual([]);
        const childSelect = page.getByLabel('Velg hvilket barn det gjelder');
        if (!flag) {
            await childSelect.selectOption(BARN_ID);
            await expect(childSelect).toHaveValue(BARN_ID);
            await expectNewChild(page, BARN_ID);
        }
        const childWithCase = EKSISTERENDE_SAK.pleietrengende!.identitetsnummer;
        await childSelect.selectOption(childWithCase);
        await expect(childSelect).toHaveValue(childWithCase);
        const warning = page.locator('[data-test-id="pleietrengendeHarFagsak"]');
        await expect(warning).toBeVisible();
        await expect(warning).toContainText(EKSISTERENDE_SAK.fagsakId);
        await expect(warning).toContainText(childWithCase);
        await expectPanelChild(page, childWithCase);
        await expectButtons(page, flag);
        if (!flag) {
            await childSelect.selectOption(BARN_ID);
            await expect(childSelect).toHaveValue(BARN_ID);
            await expectNewChild(page, BARN_ID);
            for (const action of [true, false]) {
                await cancelSummary(page, action, BARN_ID);
                await expect(childSelect).toHaveValue(BARN_ID);
                await expect(panel(page)).toContainText(BARN_ID);
            }
            await page.getByLabel('Det gjelder et annet barn').check();
            await expect(childSelect).toBeDisabled();
            await expect(panelChildId(page)).toHaveCount(0);
            await expect(panel(page)).not.toContainText(BARN_ID);
            await expectButtons(page, false);
            const manual = page.getByLabel('Pleietrengendes fødselsnummer:', { exact: true });
            await expect(manual).toBeEnabled();
            await expect(manual).toHaveValue('');
            await manual.fill(MANUELT_BARN_ID);
            await expect(page.getByText('Navn: TUNGSINDIG KAKE')).toBeVisible();
            await expectNewChild(page, MANUELT_BARN_ID);
            for (const action of [true, false]) {
                await cancelSummary(page, action, MANUELT_BARN_ID);
                await expect(page.getByLabel('Det gjelder et annet barn')).toBeChecked();
                await expect(manual).toHaveValue(MANUELT_BARN_ID);
            }
            const noId = page.getByLabel('Pleietrengende har ikke fødselsnummer', { exact: true });
            await noId.check();
            await expect(manual).toBeDisabled();
            await expect(manual).toHaveValue('');
            await expect(panelChildId(page)).toHaveCount(0);
            await expect(panel(page)).not.toContainText(MANUELT_BARN_ID);
            await expect(page.locator('[data-test-id="pleietrengendeHarIkkeFnrInformasjon"]')).toBeVisible();
            await expectButtons(page, false, true);
            await cancelSummary(page, false);
            await expect(page.getByLabel('Det gjelder et annet barn')).toBeChecked();
            await expect(noId).toBeChecked();
        }
        await expect(page.getByLabel('Reserver saksnummer til ny fagsak')).toBeChecked();
        await expect(page.getByLabel('Velg fagsak')).toHaveValue('');
        await expect(page).toHaveURL((url) => url.pathname === `/journalpost/${id}`);
        expect(mutations).toEqual([]);
    });
}

test('journalfører ny PSB-sak uten gammelt nummer og viser returnert reservasjon', async ({ page }) => {
    const id = FORDELING_PSB_SCENARIOS.newCaseSuccess;
    const { mutations } = recordRequests(page, id);
    expect(fagsaker.map((sak) => sak.fagsakId)).not.toContain(NYTT_NUMMER);
    await openJournalpost(page, id);
    await enterNewMode(page);
    const childSelect = page.getByLabel('Velg hvilket barn det gjelder');
    await childSelect.selectOption(BARN_ID);
    await expectNewChild(page, BARN_ID);
    await cancelSummary(page, true, BARN_ID);
    await expect(childSelect).toHaveValue(BARN_ID);
    await expect(page.getByLabel('Reserver saksnummer til ny fagsak')).toBeChecked();
    expect(mutations).toEqual([]);
    await confirmAndExpectDestination(page, id, BARN_ID, NYTT_NUMMER, false);
    expect(mutations).toEqual([`POST ${ApiPath.JOURNALPOST_MOTTAK}`]);
});

test('viser generisk feil ved backendkonflikt og beholder ny-sak-valgene etter avbryt', async ({ page }) => {
    const id = FORDELING_PSB_SCENARIOS.newCaseConflict;
    const { mutations, refreshes } = recordRequests(page, id);
    await openJournalpost(page, id, true);
    await page.evaluate(
        ({ path, journalpostId, problem }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');
            msw.worker.use(
                msw.http.post(path, async ({ request }) => {
                    const body = (await request.clone().json()) as { journalpostId?: string };
                    if (body.journalpostId !== journalpostId) return;
                    return msw.HttpResponse.json(problem, { status: 409 });
                }),
            );
        },
        { path: ApiPath.JOURNALPOST_MOTTAK, journalpostId: id, problem: KONFLIKT },
    );
    await enterNewMode(page);
    const childId = EKSISTERENDE_SAK.pleietrengende!.identitetsnummer;
    await page.getByLabel('Velg hvilket barn det gjelder').selectOption(childId);
    await expect(page.locator('[data-test-id="pleietrengendeHarFagsak"]')).toContainText(EKSISTERENDE_SAK.fagsakId);
    await expectButtons(page, true);
    await fortsett(page).click();
    const dialog = await expectSummary(page, true, childId);
    expect(mutations).toEqual([]);
    const previousRefreshes = [...refreshes];
    const classification = page.waitForResponse((response) => isResponse(response, 'POST', ApiPath.JOURNALPOST_MOTTAK));
    await dialog.getByRole('button', { name: 'Journalfør journalposten' }).click();
    const response = await classification;
    expect(response.status()).toBe(409);
    expectNewRequest(response, id, childId);
    expect(await response.json()).toEqual(KONFLIKT);
    await expect(dialog.getByText('Det oppstod en feil ved klassifisering.', { exact: true })).toBeVisible();
    await expect(dialog.getByText(KONFLIKT.detail, { exact: true })).toHaveCount(0);
    await expect(dialog.getByText(/Journalposten er journalført/)).toHaveCount(0);
    await expect(page.locator('[data-test-id="alertJournalførtReservert"]')).toHaveCount(0);
    await expect(page.getByRole('radio', { name: 'Registrere opplysninger til K9' })).toHaveCount(0);
    await expect(dialog.getByRole('button', { name: 'Journalfør journalposten' })).toBeEnabled();
    await dialog.getByRole('button', { name: 'Avbryt' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByLabel('Reserver saksnummer til ny fagsak')).toBeChecked();
    await expect(page.getByLabel('Velg fagsak')).toHaveValue('');
    await expect(page.getByLabel('Velg hvilket barn det gjelder')).toHaveValue(childId);
    await expect(panel(page)).toContainText(childId);
    await expect(panel(page).getByText(/Saksnummer/)).toHaveCount(0);
    await expectButtons(page, true);
    await expect(page).toHaveURL((url) => url.pathname === `/journalpost/${id}`);
    expect(refreshes).toEqual(previousRefreshes);
    expect(mutations).toEqual([`POST ${ApiPath.JOURNALPOST_MOTTAK}`]);
});
