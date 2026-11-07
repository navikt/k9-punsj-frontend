import { expect, test } from '@playwright/test';

import { ApiPath } from '../../src/app/apiConfig';
import { JOURNALPOST_LOADER_TEST_SCENARIOS } from '../../src/mocks/journalpostLoaderTestScenarios';

const isJournalpostResponse = (response: import('@playwright/test').Response, journalpostId: string) =>
    response.request().method() === 'GET' &&
    new URL(response.url()).pathname === ApiPath.JOURNALPOST_GET.replace('{journalpostId}', journalpostId);

test('søker opp journalpost fra Home', async ({ page }) => {
    const journalpostId = JOURNALPOST_LOADER_TEST_SCENARIOS.valid;
    await page.goto('/');

    const responsePromise = page.waitForResponse((response) => isJournalpostResponse(response, journalpostId));
    await page.getByRole('textbox', { name: 'Journalpost-ID' }).fill(journalpostId);
    await page.getByRole('button', { name: 'Søk' }).click();
    const response = await responsePromise;

    expect(response.status()).toBe(200);
    expect(response.fromServiceWorker()).toBe(true);
    expect(await response.json()).toMatchObject({ journalpostId });
    await expect(page).toHaveURL(new RegExp(`/journalpost/${journalpostId}$`));

    const journalpostNumber = page.getByText('Journalpostnummer:', { exact: true }).locator('..');
    await expect(journalpostNumber.getByText(journalpostId, { exact: true })).toBeVisible();
});
