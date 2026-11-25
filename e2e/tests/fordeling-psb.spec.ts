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
    await expect(info.getByText('Søkers ID:', { exact: true })).toBeVisible();
    await expect(info.getByText(SØKER_ID, { exact: true })).toBeVisible();
    await expect(info.getByText('Saksnummer:', { exact: true })).toBeVisible();
    await expect(info.getByText(caseId, { exact: true })).toBeVisible();
    await expect(info.getByText('Periode:', { exact: true })).toBeVisible();
    await expect(info).toContainText('15.04.2024');

    if (childId) {
        await expect(info.getByText('Pleietrengendes ID:', { exact: true })).toBeVisible();
        await expect(info.getByText(childId, { exact: true })).toBeVisible();
    } else {
        await expect(info.getByText('Pleietrengendes ID:', { exact: true })).toHaveCount(0);
    }

    await expect(
        dialog
            .locator('[data-test-id="klassifiserModalAlertBlokk"]')
            .getByText('Informasjonen kan ikke endres etter journalposten er journalført.'),
    ).toBeVisible();
    await expect(dialog.locator('[data-test-id="klassifiserModalGåTilLos"]')).toHaveCount(0);
    await expect(dialog.locator('[data-test-id="klassifiserModalJournalfør"]')).toBeEnabled();
    await expect(dialog.locator('[data-test-id="klassifiserModalAvbryt"]')).toBeEnabled();
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
    const documentHeading = page.getByRole('heading', { name: 'Dette gjelder:', exact: true });
    await expect(documentHeading).toBeVisible();
    const documentChoices = documentHeading.locator('../..').getByRole('radiogroup');
    const psbChoice = documentChoices.getByRole('radio', { name: 'Pleiepenger sykt barn', exact: true });
    await expect(psbChoice).toBeVisible();
    await expect(psbChoice).toBeChecked();
    for (const name of ['Omsorgspenger/omsorgsdager', 'Pleiepenger i livets sluttfase', 'Annet']) {
        await expect(documentChoices.getByRole('radio', { name, exact: true })).toBeVisible();
    }
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
    await expect(journalpostPanel).toContainText('Søkers ID');
    await expect(journalpostPanel).toContainText(SØKER_ID);
    await expect(journalpostPanel).toContainText('Sakstype');
    await expect(journalpostPanel).toContainText('Pleiepenger sykt barn');
    const caseNumber = journalpostPanel.getByText('Saksnummer:', { exact: true });
    const childId = journalpostPanel.getByText('Barnets ID:', { exact: true });

    await test.step('Velg eksisterende sak uten barn og avbryt Vent-modal', async () => {
        await confirmApplicantAndSelectCase(page, SAK_UTEN_BARN.id);
        await expect(page.getByLabel('Velg fagsak')).toHaveValue(SAK_UTEN_BARN.id);
        const selectedInfo = page.locator('.fagsakSelectedInfo');
        await expect(selectedInfo).toContainText('Barn:');
        await expect(selectedInfo).toContainText('ikke satt');
        const caseLink = selectedInfo.getByRole('link', { name: 'Se fagsak i K9' });
        await expect(caseLink).toBeVisible();
        await expect(caseLink).toHaveAttribute('href', new RegExp(`/${SAK_UTEN_BARN.id}$`));
        await expect(caseNumber).toBeVisible();
        await expect(caseNumber.locator('..').getByText(SAK_UTEN_BARN.id, { exact: true })).toBeVisible();
        await expect(childId).toHaveCount(0);
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
        await expect(page.getByLabel('Velg fagsak')).toHaveValue(SAK_MED_BARN.id);
        const selectedInfo = page.locator('.fagsakSelectedInfo');
        await expect(selectedInfo).toContainText('Barn:');
        await expect(selectedInfo).toContainText(`Navn: ${SAK_MED_BARN.barnNavn}`);
        await expect(selectedInfo).toContainText(`Id: ${SAK_MED_BARN.barnId}`);
        const caseLink = selectedInfo.getByRole('link', { name: 'Se fagsak i K9' });
        await expect(caseLink).toBeVisible();
        await expect(caseLink).toHaveAttribute('href', new RegExp(`/${SAK_MED_BARN.id}$`));
        await expect(caseNumber).toBeVisible();
        await expect(caseNumber.locator('..').getByText(SAK_MED_BARN.id, { exact: true })).toBeVisible();
        await expect(childId).toBeVisible();
        await expect(childId.locator('..').getByText(SAK_MED_BARN.barnId, { exact: true })).toBeVisible();
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

test('journalfører PSB før Vent, prøver Vent på nytt og navigerer til lokal LOS', async ({ page }) => {
    const journalpostId = FORDELING_PSB_SCENARIOS.classify;
    const classifyPath = ApiPath.JOURNALPOST_MOTTAK;
    const holdPath = ventPath(journalpostId);
    const copyPath = ApiPath.JOURNALPOST_KOPIERE.replace('{journalpostId}', journalpostId);
    const closePath = ApiPath.JOURNALPOST_LUKK_DEBUGG.replace('{journalpostId}', journalpostId);
    const mutationRequests: string[] = [];
    const closeRequests: string[] = [];
    page.on('request', (request) => {
        const path = new URL(request.url()).pathname;
        if (path.startsWith('/api/k9-punsj/') && !['GET', 'HEAD'].includes(request.method())) {
            mutationRequests.push(`${request.method()} ${path}`);
        }
        if (path === closePath) closeRequests.push(`${request.method()} ${path}`);
    });

    await openPsbJournalpost(page, journalpostId);
    await confirmApplicantAndSelectCase(page, SAK_MED_BARN.id);
    await page.evaluate(
        ({ path }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');
            let attempts = 0;
            msw.worker.use(
                msw.http.post(path, () => {
                    attempts += 1;
                    return attempts === 1
                        ? msw.HttpResponse.json({}, { status: 500 })
                        : new msw.HttpResponse(null, { status: 200 });
                }),
            );
        },
        { path: holdPath },
    );

    await page.locator('[data-test-id="journalførOgVent"]').click();
    const dialog = await expectModalCase(page, SAK_MED_BARN.id, SAK_MED_BARN.barnId);
    const classifyResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'POST', classifyPath),
    );
    const firstHoldResponsePromise = page.waitForResponse(
        (response) => isApiResponse(response, 'POST', holdPath) && response.status() === 500,
    );
    await dialog.getByRole('button', { name: 'Journalfør og sett på vent' }).click();

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
    });
    expect(await classifyResponse.json()).toEqual({ saksnummer: SAK_MED_BARN.id });

    const firstHoldResponse = await firstHoldResponsePromise;
    expect(firstHoldResponse.fromServiceWorker()).toBe(true);
    await expect(dialog.getByText('Det oppstod en feil når journalpost skulle settes på vent.', { exact: true })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Sett på vent' })).toBeEnabled();
    await expect(dialog.getByRole('button', { name: 'Gå til LOS' })).toHaveCount(0);

    const retryResponsePromise = page.waitForResponse(
        (response) => isApiResponse(response, 'POST', holdPath) && response.status() === 200,
    );
    await dialog.getByRole('button', { name: 'Sett på vent' }).click();
    const retryResponse = await retryResponsePromise;
    expect(retryResponse.fromServiceWorker()).toBe(true);
    expect(retryResponse.headers()['content-type']).toBeUndefined();
    await expect(dialog.getByRole('button', { name: 'Gå til LOS' })).toBeEnabled();
    await expect(dialog.getByRole('button', { name: 'Sett på vent' })).toHaveCount(0);

    expect(mutationRequests).toEqual([
        `POST ${classifyPath}`,
        `POST ${holdPath}`,
        `POST ${holdPath}`,
    ]);
    expect(mutationRequests).not.toContain(`POST ${copyPath}`);
    expect(mutationRequests).not.toContain(`POST ${ApiPath.PSB_SOKNAD_CREATE}`);
    expect(mutationRequests).not.toContain(`POST ${ApiPath.PSB_SOKNAD_SUBMIT}`);
    expect(closeRequests).toEqual([]);

    const destinationUrl = 'http://127.0.0.1:8081/los-test-destination';
    await page.route(destinationUrl, (route) =>
        route.fulfill({
            status: 200,
            contentType: 'text/html',
            body: '<!doctype html><title>Kontrollert LOS-destinasjon</title>',
        }),
    );
    await page.evaluate((losUrl) => {
        const appWindow = window as Window & {
            appSettings?: Record<string, string | undefined>;
        };
        if (!appWindow.appSettings) throw new Error('Appinnstillingene er ikke tilgjengelige.');
        appWindow.appSettings.K9_LOS_URL = losUrl;
    }, destinationUrl);

    const destinationRequestPromise = page.waitForRequest(
        (request) => request.isNavigationRequest() && request.url() === destinationUrl,
    );
    const destinationPromise = page.waitForURL(destinationUrl);
    await dialog.getByRole('button', { name: 'Gå til LOS' }).click();
    const destinationRequest = await destinationRequestPromise;

    expect(destinationRequest.url()).toBe(destinationUrl);
    await destinationPromise;
    expect(page.url()).toBe(destinationUrl);
});

test('journalfører valgt PSB-sak og går til riktig registreringsvalg', async ({ page }) => {
    const journalpostId = FORDELING_PSB_SCENARIOS.classify;
    const classifyPath = ApiPath.JOURNALPOST_MOTTAK;
    const lookupPath = ApiPath.PSB_EKSISTERENDE_SOKNADER_FIND;
    const createPath = ApiPath.PSB_SOKNAD_CREATE;
    const debugClosePrefix = ApiPath.JOURNALPOST_LUKK_DEBUGG.split('{journalpostId}')[0];
    const readOnlyPosts = new Set([ApiPath.JOURNALPOST_HENT, ApiPath.SAKER_PERIODER]);
    const operations: string[] = [];
    page.on('request', (request) => {
        const path = new URL(request.url()).pathname;
        const method = request.method();
        if (method === 'POST' && readOnlyPosts.has(path)) return;
        if (
            (path.startsWith('/api/') && !['GET', 'HEAD', 'OPTIONS'].includes(method)) ||
            path.startsWith(debugClosePrefix)
        ) {
            operations.push(`${method} ${path}`);
        }
    });
    page.on('response', (response) => {
        if (isApiResponse(response, 'GET', lookupPath)) operations.push(`Svar GET ${lookupPath}`);
    });

    await openPsbJournalpost(page, journalpostId);
    await confirmApplicantAndSelectCase(page, SAK_MED_BARN.id);
    const classifyResponsePromise = page.waitForResponse((response) => isApiResponse(response, 'POST', classifyPath));
    await page.locator('[data-test-id="journalførOgFortsett"]').click();
    const dialog = page.locator('[data-test-id="klassifiserModal"]');
    await expectModalCase(page, SAK_MED_BARN.id, SAK_MED_BARN.barnId);

    const refreshResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', journalpostPath(journalpostId)),
    );
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
    const journalpostPanel = page.locator('.journalpostpanel');
    for (const [label, value] of [
        ['Journalpostnummer:', journalpostId],
        ['Søkers ID:', SØKER_ID],
        ['Sakstype:', 'Pleiepenger sykt barn'],
        ['Barnets ID:', SAK_MED_BARN.barnId],
        ['Saksnummer:', SAK_MED_BARN.id],
    ]) {
        const field = journalpostPanel.getByText(label, { exact: true });
        await expect(field).toBeVisible();
        await expect(field.locator('..').getByText(value, { exact: true })).toBeVisible();
    }
    await expect(page.locator('[data-test-id="alertJournalført"]')).toContainText(
        'Journalposten er journalført. Sakstype, søker og saksnummer er lagret til journalpost.',
    );
    const registrationChoice = page.getByRole('radio', { name: 'Registrere opplysninger til K9' });
    await expect(registrationChoice).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Send brev og lukk oppgave i LOS' })).toBeVisible();
    const confirmButton = page.getByRole('button', { name: 'Bekreft' });
    await expect(confirmButton).toBeDisabled();
    await registrationChoice.check();
    await expect(confirmButton).toBeEnabled();
    expect(operations).toEqual([`POST ${classifyPath}`]);

    const lookupResponsePromise = page.waitForResponse((response) => isApiResponse(response, 'GET', lookupPath));
    const createResponsePromise = page.waitForResponse((response) => isApiResponse(response, 'POST', createPath));
    await confirmButton.click();

    const lookupResponse = await lookupResponsePromise;
    expect(lookupResponse.status()).toBe(200);
    expect(lookupResponse.fromServiceWorker()).toBe(true);
    expect(lookupResponse.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(await lookupResponse.json()).toMatchObject({ søknader: [] });

    const createResponse = await createResponsePromise;
    expect(createResponse.status()).toBe(201);
    expect(createResponse.fromServiceWorker()).toBe(true);
    expect(createResponse.request().postDataJSON()).toEqual({
        journalpostId,
        norskIdent: SØKER_ID,
        pleietrengendeIdent: SAK_MED_BARN.barnId,
        k9saksnummer: SAK_MED_BARN.id,
    });
    const { soeknadId } = await createResponse.json();
    expect(soeknadId).toEqual(expect.any(String));
    expect(soeknadId).not.toBe('');
    await expect(page).toHaveURL(
        (url) => url.pathname === `/journalpost/${journalpostId}/pleiepenger-sykt-barn/skjema/${soeknadId}/`,
    );
    await expect(page.getByTestId('PSBPunchForm')).toBeVisible();
    expect(operations).toEqual([`POST ${classifyPath}`, `Svar GET ${lookupPath}`, `POST ${createPath}`]);
});
