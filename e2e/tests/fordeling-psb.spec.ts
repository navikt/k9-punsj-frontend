import { expect, test } from '@playwright/test';

import { ApiPath } from '../../src/app/apiConfig';
import { FORDELING_PSB_SCENARIOS } from '../../src/mocks/fordelingPsbTestScenarioIds';

const SØKER_ID = '17420373147';
const SAK_UTEN_BARN = { id: '1DMU93A' };
const SAK_MED_BARN = {
    id: '1DQBDDC',
    barnId: '24420167209',
    barnNavn: 'JUSTERBAR HALS',
};

const isApiResponse = (response: import('@playwright/test').Response, method: string, path: string) =>
    response.request().method() === method && new URL(response.url()).pathname === path;

const journalpostPath = (journalpostId: string) => ApiPath.JOURNALPOST_GET.replace('{journalpostId}', journalpostId);
const ventPath = (journalpostId: string) => ApiPath.JOURNALPOST_SETT_PAA_VENT.replace('{journalpostId}', journalpostId);

const openPsbJournalpost = async (page: import('@playwright/test').Page, journalpostId: string) => {
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

const confirmApplicantAndSelectCase = async (page: import('@playwright/test').Page, caseId: string) => {
    await page.getByRole('radio', { name: 'Ja' }).check();
    const caseSelect = page.getByLabel('Velg fagsak');
    await expect(caseSelect).toBeVisible();
    await caseSelect.selectOption(caseId);
};

const expectModalCase = async (page: import('@playwright/test').Page, caseId: string, childId?: string) => {
    const dialog = page.locator('[data-test-id="klassifiserModal"]');
    const info = dialog.locator('[data-test-id="klassifiseringInfo"]');
    await expect(info.getByText('Sakstype:', { exact: true })).toBeVisible();
    await expect(info.getByText('Pleiepenger sykt barn', { exact: true })).toBeVisible();
    await expect(info.getByText(SØKER_ID, { exact: true })).toBeVisible();
    await expect(info.getByText(caseId, { exact: true })).toBeVisible();
    await expect(info.getByText('Periode:', { exact: true })).toBeVisible();
    await expect(info).toContainText('15.04.2024');

    if (childId) {
        await expect(info.getByText(childId, { exact: true })).toBeVisible();
    } else {
        await expect(info.getByText('Pleietrengendes ID:', { exact: true })).toHaveCount(0);
    }

    await expect(dialog.getByText('Informasjonen kan ikke endres etter journalposten er journalført.')).toBeVisible();
    await expect(dialog.locator('[data-test-id="klassifiserModalGåTilLos"]')).toHaveCount(0);
    return dialog;
};

test('velger saker med og uten barn, og åpner riktig modal uten å utføre handlingen', async ({ page }) => {
    const operations: string[] = [];
    page.on('request', (request) => {
        const path = new URL(request.url()).pathname;
        if (path === ApiPath.JOURNALPOST_MOTTAK || path === ventPath(FORDELING_PSB_SCENARIOS.selection)) {
            operations.push(`${request.method()} ${path}`);
        }
    });

    await openPsbJournalpost(page, FORDELING_PSB_SCENARIOS.selection);
    await expect(page.locator('input[value="PLEIEPENGER"]')).toBeChecked();
    const toApplicants = page.locator('input[data-test-id="toSokereCheckbox"]');
    await expect(toApplicants).toBeVisible();
    await expect(toApplicants).not.toBeChecked();

    const continueButton = page.locator('[data-test-id="journalførOgFortsett"]');
    const holdButton = page.locator('[data-test-id="journalførOgVent"]');
    await expect(continueButton).toBeDisabled();
    await expect(holdButton).toBeDisabled();

    const journalpostPanel = page.locator('.journalpostpanel');
    await expect(journalpostPanel).toContainText('Journalpostnummer');
    await expect(journalpostPanel).toContainText(FORDELING_PSB_SCENARIOS.selection);
    await expect(journalpostPanel).toContainText(SØKER_ID);
    await expect(journalpostPanel).toContainText('Pleiepenger sykt barn');

    await test.step('Velg eksisterende sak uten barn og avbryt Vent-modal', async () => {
        await confirmApplicantAndSelectCase(page, SAK_UTEN_BARN.id);
        const selectedInfo = page.locator('.fagsakSelectedInfo');
        await expect(selectedInfo).toContainText('Barn:');
        await expect(selectedInfo).toContainText('ikke satt');
        const caseLink = selectedInfo.getByRole('link', { name: 'Se fagsak i K9' });
        await expect(caseLink).toHaveAttribute('href', new RegExp(SAK_UTEN_BARN.id));
        await expect(journalpostPanel).toContainText(SAK_UTEN_BARN.id);
        await expect(journalpostPanel.getByText('Barnets ID', { exact: false })).toHaveCount(0);
        await expect(continueButton).toBeDisabled();
        await expect(holdButton).toBeEnabled();

        await holdButton.click();
        const dialog = await expectModalCase(page, SAK_UTEN_BARN.id);
        await expect(
            dialog.getByRole('heading', {
                name: 'Vil du lagre følgende informasjon til journalposten og sett på vent?',
            }),
        ).toBeVisible();
        await expect(dialog.locator('[data-test-id="klassifiserModalJournalfør"]')).toHaveText(
            'Journalfør og sett på vent',
        );
        await dialog.getByRole('button', { name: 'Avbryt' }).click();
        await expect(dialog).toBeHidden();
        await expect(page.getByLabel('Velg fagsak')).toHaveValue(SAK_UTEN_BARN.id);
    });

    await test.step('Bytt til sak med barn og åpne Fortsett- og Vent-modalene', async () => {
        await page.getByLabel('Velg fagsak').selectOption(SAK_MED_BARN.id);
        const selectedInfo = page.locator('.fagsakSelectedInfo');
        await expect(selectedInfo).toContainText(`Navn: ${SAK_MED_BARN.barnNavn}`);
        await expect(selectedInfo).toContainText(`Id: ${SAK_MED_BARN.barnId}`);
        await expect(journalpostPanel).toContainText(SAK_MED_BARN.id);
        await expect(journalpostPanel).toContainText(SAK_MED_BARN.barnId);
        await expect(continueButton).toBeEnabled();
        await expect(holdButton).toBeEnabled();

        await continueButton.click();
        const continueDialog = await expectModalCase(page, SAK_MED_BARN.id, SAK_MED_BARN.barnId);
        await expect(
            continueDialog.getByRole('heading', { name: 'Vil du lagre følgende informasjon til journalposten?' }),
        ).toBeVisible();
        await expect(continueDialog.locator('[data-test-id="klassifiserModalJournalfør"]')).toHaveText(
            'Journalfør journalposten',
        );
        await continueDialog.getByRole('button', { name: 'Avbryt' }).click();
        await expect(continueDialog).toBeHidden();

        await holdButton.click();
        const holdDialog = await expectModalCase(page, SAK_MED_BARN.id, SAK_MED_BARN.barnId);
        await expect(
            holdDialog.getByRole('heading', {
                name: 'Vil du lagre følgende informasjon til journalposten og sett på vent?',
            }),
        ).toBeVisible();
        await expect(holdDialog.locator('[data-test-id="klassifiserModalJournalfør"]')).toHaveText(
            'Journalfør og sett på vent',
        );
        await holdDialog.getByRole('button', { name: 'Avbryt' }).click();
        await expect(holdDialog).toBeHidden();
        await expect(page.getByLabel('Velg fagsak')).toHaveValue(SAK_MED_BARN.id);
    });

    expect(operations).toEqual([]);
});

test('journalfører valgt PSB-sak og går til riktig registreringsvalg', async ({ page }) => {
    const journalpostId = FORDELING_PSB_SCENARIOS.classify;
    await openPsbJournalpost(page, journalpostId);
    await confirmApplicantAndSelectCase(page, SAK_MED_BARN.id);

    const classifyPath = ApiPath.JOURNALPOST_MOTTAK;
    const classifyResponsePromise = page.waitForResponse((response) => isApiResponse(response, 'POST', classifyPath));
    await page.locator('[data-test-id="journalførOgFortsett"]').click();
    const dialog = page.locator('[data-test-id="klassifiserModal"]');
    await expectModalCase(page, SAK_MED_BARN.id, SAK_MED_BARN.barnId);

    const refreshResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', journalpostPath(journalpostId)),
    );
    const requestPaths: string[] = [];
    page.on('request', (request) => requestPaths.push(new URL(request.url()).pathname));

    await dialog.getByRole('button', { name: 'Journalfør journalposten' }).click();
    const classifyResponse = await classifyResponsePromise;
    expect(classifyResponse.status()).toBe(200);
    expect(classifyResponse.fromServiceWorker()).toBe(true);
    expect(classifyResponse.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(classifyResponse.request().postDataJSON()).toMatchObject({
        journalpostId,
        brukerIdent: SØKER_ID,
        fagsakYtelseTypeKode: 'PSB',
        saksnummer: SAK_MED_BARN.id,
        pleietrengendeIdent: SAK_MED_BARN.barnId,
        periode: { fom: '2024-04-15', tom: '2024-04-15' },
    });
    expect(await classifyResponse.json()).toEqual({ saksnummer: SAK_MED_BARN.id });

    const refreshResponse = await refreshResponsePromise;
    expect(refreshResponse.status()).toBe(200);
    expect(refreshResponse.fromServiceWorker()).toBe(true);
    expect(await refreshResponse.json()).toMatchObject({
        journalpostId,
        erFerdigstilt: true,
        journalpostStatus: 'JOURNALFOERT',
        sak: {
            fagsakId: SAK_MED_BARN.id,
            sakstype: 'PSB',
            pleietrengendeIdent: SAK_MED_BARN.barnId,
            gyldigPeriode: { fom: '2024-04-15', tom: '2024-04-15' },
        },
    });

    await expect(page).toHaveURL(new RegExp(`/journalpost/${journalpostId}/pleiepenger-sykt-barn/?$`));
    const registrationChoice = page.getByRole('radio', { name: 'Registrere opplysninger til K9' });
    await expect(registrationChoice).toBeVisible();
    await registrationChoice.check();
    await expect(page.getByRole('button', { name: 'Bekreft' })).toBeEnabled();
    expect(requestPaths).not.toContain(ventPath(journalpostId));
    expect(requestPaths).not.toContain(ApiPath.JOURNALPOST_KOPIERE.replace('{journalpostId}', journalpostId));
    expect(requestPaths).not.toContain(
        ApiPath.JOURNALPOST_SETT_BEHANDLINGSÅR.replace('{journalpostId}', journalpostId),
    );
    expect(requestPaths).not.toContain(ApiPath.PSB_SOKNAD_CREATE);
    expect(requestPaths).not.toContain(ApiPath.PSB_SOKNAD_SUBMIT);
});
