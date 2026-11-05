import { expect, test } from '@playwright/test';

import { ApiPath } from '../../src/app/apiConfig';
import { JOURNALPOST_LOADER_TEST_SCENARIOS } from '../../src/mocks/journalpostLoaderTestScenarios';

const unsupportedMessage =
    'Journalposten har blitt feilregistrert, avbrutt, utgått eller har endret tema via Gosys/annet system. Lukk oppgaven i Punsj og søk opp journalposten i Gosys for å vurdere eventuell videre håndtering derfra.';

const isApiResponse = (response: import('@playwright/test').Response, method: string, path: string) =>
    response.request().method() === method && new URL(response.url()).pathname === path;

const getJournalpostPath = (journalpostId: string) =>
    ApiPath.JOURNALPOST_GET.replace('{journalpostId}', journalpostId);
const getClosePath = (journalpostId: string) =>
    ApiPath.JOURNALPOST_LUKK_DEBUGG.replace('{journalpostId}', journalpostId);

const expectJournalpostResponse = (
    response: import('@playwright/test').Response,
    journalpostId: string,
    status: number,
) => {
    expect(response.request().method()).toBe('GET');
    expect(new URL(response.url()).pathname).toBe(getJournalpostPath(journalpostId));
    expect(response.status()).toBe(status);
    expect(response.fromServiceWorker()).toBe(true);
};

const openJournalpost = async (page: import('@playwright/test').Page, journalpostId: string) => {
    const responsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', getJournalpostPath(journalpostId)),
    );
    await page.goto(`/journalpost/${journalpostId}`);
    return responsePromise;
};

test('åpner gyldig journalpost direkte og beholder Skjul-handlingen ved omlasting', async ({ page }) => {
    const journalpostId = JOURNALPOST_LOADER_TEST_SCENARIOS.valid;
    const response = await openJournalpost(page, journalpostId);

    expectJournalpostResponse(response, journalpostId, 200);
    expect(await response.json()).toMatchObject({ journalpostId });

    const journalpostNumber = page.getByText('Journalpostnummer:', { exact: true }).locator('..');
    await expect(journalpostNumber.getByText(journalpostId, { exact: true })).toBeVisible();
    const pdf = page.getByTitle('pdf');
    await expect(pdf).toBeVisible();
    await page.getByRole('button', { name: 'Skjul', exact: true }).click();
    await expect(pdf).toBeHidden();
    await expect(journalpostNumber.getByText(journalpostId, { exact: true })).toBeVisible();

    const reloadResponsePromise = page.waitForResponse((reloadResponse) =>
        isApiResponse(reloadResponse, 'GET', getJournalpostPath(journalpostId)),
    );
    await page.reload();
    const reloadResponse = await reloadResponsePromise;
    expectJournalpostResponse(reloadResponse, journalpostId, 200);
    await expect(journalpostNumber.getByText(journalpostId, { exact: true })).toBeVisible();
    await expect(pdf).toBeVisible();
    const skjulAfterReload = page.getByRole('button', { name: 'Skjul', exact: true });
    await expect(skjulAfterReload).toBeEnabled();
    await skjulAfterReload.click();
    await expect(pdf).toBeHidden();
});

test('viser generell feil for ukjent 409 gjennom loaderens Redux-flyt', async ({ page }) => {
    const journalpostId = JOURNALPOST_LOADER_TEST_SCENARIOS.unknownConflict;
    const response = await openJournalpost(page, journalpostId);

    expectJournalpostResponse(response, journalpostId, 409);
    expect(await response.json()).toEqual({ type: 'punsj://ukjent-type' });
    await expect(page.getByText('Noe gikk galt', { exact: true })).toBeVisible();
    await expect(page.getByText('Journalpostnummer:', { exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Skjul', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Lukk oppgaven i punsj', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Gå til LOS', exact: true })).toHaveCount(0);
});

test('lukker kjent 409 og navigerer til kontrollert lokal LOS-destinasjon', async ({ page }) => {
    const journalpostId = JOURNALPOST_LOADER_TEST_SCENARIOS.closeSuccess;
    const conflictResponse = await openJournalpost(page, journalpostId);

    expectJournalpostResponse(conflictResponse, journalpostId, 409);
    expect(await conflictResponse.json()).toEqual({ type: 'punsj://ikke-støttet-journalpost' });
    await expect(page.getByTestId('conflict-error-alert')).toContainText(unsupportedMessage);

    const closeResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', getClosePath(journalpostId)),
    );
    await page.getByRole('button', { name: 'Lukk oppgaven i punsj', exact: true }).click();
    const closeResponse = await closeResponsePromise;

    expect(closeResponse.request().method()).toBe('GET');
    expect(new URL(closeResponse.url()).pathname).toBe(getClosePath(journalpostId));
    expect(closeResponse.request().postData()).toBeNull();
    expect(closeResponse.status()).toBe(200);
    expect(closeResponse.fromServiceWorker()).toBe(true);
    await expect(page.getByTestId('conflict-error-alert')).toContainText(
        `Journalposten ${journalpostId} har blitt lukket.`,
    );
    const goToLos = page.getByRole('button', { name: 'Gå til LOS', exact: true });
    await expect(goToLos).toBeEnabled();

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
        if (!appWindow.appSettings) {
            throw new Error('Appinnstillingene er ikke tilgjengelige.');
        }
        appWindow.appSettings.K9_LOS_URL = losUrl;
    }, destinationUrl);

    const destinationRequestPromise = page.waitForRequest(
        (request) => request.isNavigationRequest() && request.url() === destinationUrl,
    );
    const destinationPromise = page.waitForURL(destinationUrl);
    await goToLos.click();
    const destinationRequest = await destinationRequestPromise;

    expect(destinationRequest.url()).toBe(destinationUrl);
    await destinationPromise;
    expect(page.url()).toBe(destinationUrl);
});
