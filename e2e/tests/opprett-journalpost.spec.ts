import { expect, test } from '@playwright/test';

import { ApiPath } from '../../src/app/apiConfig';
import type { IOpprettJournalpostResponse } from '../../src/app/opprett-journalpost/types';
import { createdJournalpost, installCreatedJournalpostHandler, installCreationHandler } from './helpers/opprettJournalpost';

const TEST_FNR = '08438323288';
const TEST_FAGSAK_ID = '1DQBDDC';
const TEST_TITTEL = 'Eksempel på tittel';
const TEST_NOTAT = 'Eksempel på notat';

const isApiResponse = (response: import('@playwright/test').Response, method: string, path: string) =>
    response.request().method() === method && new URL(response.url()).pathname === path;

test('oppretter journalpost fra hovedsiden etter feil og nytt forsøk, og åpner den opprettede journalposten', async ({
    page,
}) => {
    const expectedRequest = {
        søkerIdentitetsnummer: TEST_FNR,
        fagsakId: TEST_FAGSAK_ID,
        tittel: TEST_TITTEL,
        notat: TEST_NOTAT,
    };

    await page.goto('/');
    await page.getByRole('button', { name: 'Opprett journalpost' }).click();
    await expect(page).toHaveURL(/\/opprett-journalpost$/);

    const lookupResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', ApiPath.HENT_FAGSAK_PÅ_IDENT),
    );
    await page.getByRole('textbox', { name: 'Søkers fødselsnummer' }).fill(TEST_FNR);

    const lookupResponse = await lookupResponsePromise;
    expect(lookupResponse.status()).toBe(200);
    expect(lookupResponse.request().headers()['x-nav-norskident']).toBe(TEST_FNR);
    await page
        .getByLabel('Velg fagsak')
        .locator(`option[value="${TEST_FAGSAK_ID}"]`)
        .waitFor({ state: 'attached' });

    await page.getByLabel('Velg fagsak').selectOption(TEST_FAGSAK_ID);
    await page.getByRole('textbox', { name: 'Tittel' }).fill(TEST_TITTEL);
    await page.getByRole('textbox', { name: 'Notat' }).fill(TEST_NOTAT);

    await installCreationHandler(page, true);

    const firstAttemptPromise = page.waitForResponse((response) =>
        isApiResponse(response, 'POST', ApiPath.OPPRETT_NOTAT),
    );
    await page.getByRole('button', { name: 'Opprett journalpost' }).click();
    const firstAttempt = await firstAttemptPromise;

    expect(firstAttempt.status()).toBe(500);
    expect(firstAttempt.fromServiceWorker()).toBe(true);
    expect(firstAttempt.request().postDataJSON()).toEqual(expectedRequest);
    await expect(page.getByText('Kunne ikke opprette journalpost')).toBeVisible();
    await expect(page.getByText('Opprettet. Journalpost-ID:', { exact: false })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Gå til journalpost' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Opprett journalpost', exact: true })).toBeEnabled();
    await expect(page.getByRole('textbox', { name: 'Søkers fødselsnummer' })).toHaveValue(TEST_FNR);
    await expect(page.getByLabel('Velg fagsak')).toHaveValue(TEST_FAGSAK_ID);
    await expect(page.getByRole('textbox', { name: 'Tittel' })).toHaveValue(TEST_TITTEL);
    await expect(page.getByRole('textbox', { name: 'Notat' })).toHaveValue(TEST_NOTAT);

    const secondAttemptPromise = page.waitForResponse((response) =>
        isApiResponse(response, 'POST', ApiPath.OPPRETT_NOTAT),
    );
    await page.getByRole('button', { name: 'Opprett journalpost' }).click();
    const secondAttempt = await secondAttemptPromise;

    expect(secondAttempt.status()).toBe(201);
    expect(secondAttempt.fromServiceWorker()).toBe(true);
    expect(secondAttempt.request().postDataJSON()).toEqual(expectedRequest);

    const { journalpostId }: IOpprettJournalpostResponse = await secondAttempt.json();
    expect(journalpostId).toEqual(expect.any(String));
    expect(journalpostId).not.toBe('');
    expect(await secondAttempt.json()).toEqual({ journalpostId: createdJournalpost.journalpostId });
    await expect(page.getByText(`Opprettet. Journalpost-ID: ${journalpostId}`)).toBeVisible();
    await expect(page.getByText('Kunne ikke opprette journalpost')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Opprett journalpost', exact: true })).toHaveCount(0);
    const openJournalpostButton = page.getByRole('button', { name: 'Gå til journalpost' });
    await expect(openJournalpostButton).toBeVisible();

    await installCreatedJournalpostHandler(page);
    const journalpostResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', ApiPath.JOURNALPOST_GET.replace('{journalpostId}', journalpostId)),
    );
    await openJournalpostButton.click();
    const journalpostResponse = await journalpostResponsePromise;
    expect(journalpostResponse.status()).toBe(200);
    expect(journalpostResponse.fromServiceWorker()).toBe(true);
    expect(await journalpostResponse.json()).toEqual(createdJournalpost);
    await expect(page).toHaveURL(
        (url) => url.pathname.replace(/\/$/, '') === `/journalpost/${journalpostId}/pleiepenger-sykt-barn`,
    );
    await expect(
        page.getByText('Journalposten er journalført. Sakstype, søker og saksnummer er lagret til journalpost.', {
            exact: true,
        }),
    ).toBeVisible();
    await expect(page.getByRole('radiogroup', { name: 'Hva ønsker du å gjøre med dokumentet?' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Registrere opplysninger til K9', exact: true })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Send brev og lukk oppgave i LOS', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sett på vent', exact: true })).toBeVisible();
    const journalpostNumber = page.getByText('Journalpostnummer:', { exact: true }).locator('..');
    await expect(journalpostNumber.getByText(journalpostId, { exact: true })).toBeVisible();
});
