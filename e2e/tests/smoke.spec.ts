import { expect, test } from '@playwright/test';
import { ApiPath } from '../../src/app/apiConfig';

test('viser inngangen til oppretting av journalpost og brukerdata fra MSW', async ({ page }) => {
    const userResponsePromise = page.waitForResponse(
        (response) => new URL(response.url()).pathname === ApiPath.USER,
    );

    await page.goto('/');

    const userResponse = await userResponsePromise;
    expect(userResponse.status()).toBe(200);
    expect(userResponse.fromServiceWorker()).toBe(true);
    await expect(page.getByRole('button', { name: 'Opprett journalpost' })).toBeVisible();
});
