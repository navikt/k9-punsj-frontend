import { expect, test } from '@playwright/test';

import { ApiPath } from '../../src/app/apiConfig';
import { createMockPdfBytes } from '../../src/mocks/mockPdf.js';
import { installBrevHandlers } from './helpers/brev';

const TEST_IDENT = '08438323288';
const AKTØR_ID = '81549300';
const FAGSAK_ID = '1DMU93A';
const ORGNUMMER = '889640782';
const TEST_TITTEL = 'Eksempel på tittel';
const TEST_INNHOLD = 'Eksempel på brevtekst';

const requestPath = (url: string) => new URL(url).pathname;

test('bestiller brev fra hovedsiden med PDF-forhåndsvisning og nytt forsøk', async ({ page }) => {
    const bestillinger: Array<{ body: Record<string, unknown> }> = [];
    const bestillingsresponser: number[] = [];

    page.on('request', (request) => {
        if (requestPath(request.url()) === ApiPath.BREV_BESTILL) {
            bestillinger.push({ body: request.postDataJSON() });
        }
    });
    page.on('response', (response) => {
        if (requestPath(response.url()) === ApiPath.BREV_BESTILL) {
            bestillingsresponser.push(response.status());
        }
    });

    await page.goto('/');
    await installBrevHandlers(page, Array.from(createMockPdfBytes('Test letter preview')));
    await page.evaluate(() => {
        const browserWindow = window as Window & { __openedWindowUrls?: string[] };
        const nativeOpen = window.open.bind(window);
        browserWindow.__openedWindowUrls = [];
        window.open = (...args: Parameters<typeof window.open>) => {
            browserWindow.__openedWindowUrls?.push(String(args[0]));
            return nativeOpen(...args);
        };
    });

    await test.step('Åpne brev i avsluttet sak og velge fagsak', async () => {
        await page.getByTestId('brev-avsluttet-sak-inngang').click();
        await expect(page).toHaveURL(/\/brev-avsluttet-sak/);

        const fagsakRequest = page.waitForRequest(
            (request) =>
                request.method() === 'GET' &&
                requestPath(request.url()) === ApiPath.HENT_FAGSAK_PÅ_IDENT &&
                request.headers()['x-nav-norskident'] === TEST_IDENT,
        );
        const fagsakResponse = page.waitForResponse(
            (response) =>
                requestPath(response.url()) === ApiPath.HENT_FAGSAK_PÅ_IDENT &&
                response.request().headers()['x-nav-norskident'] === TEST_IDENT,
        );
        await page.getByRole('textbox', { name: 'Søkers fødselsnummer' }).fill(TEST_IDENT);
        const [request, response] = await Promise.all([fagsakRequest, fagsakResponse]);
        expect(response.status()).toBe(200);
        expect(request.headers()['x-nav-norskident']).toBe(TEST_IDENT);

        const templateRequestPromise = page.waitForRequest(
            (templateRequest) =>
                templateRequest.method() === 'GET' &&
                requestPath(templateRequest.url()) === ApiPath.BREV_MALER,
        );
        await page.getByRole('combobox', { name: 'Velg fagsak' }).selectOption(FAGSAK_ID);
        const templateRequest = await templateRequestPromise;
        const templateUrl = new URL(templateRequest.url());
        expect(templateUrl.searchParams.get('sakstype')).toBe('PSB');
        expect(templateUrl.searchParams.get('avsenderApplikasjon')).toBe('K9PUNSJ');
        await page.getByRole('combobox', { name: 'Velg mal' }).selectOption('GENERELT_FRITEKSTBREV');
    });

    await test.step('Slå opp tredjepart og forhåndsvise brev som PDF', async () => {
        const organizationRequest = page.waitForRequest(
            (request) =>
                request.method() === 'GET' &&
                requestPath(request.url()) === ApiPath.SØK_ORGNUMMER &&
                request.url().includes(`organisasjonsnummer=${ORGNUMMER}`),
        );
        const organizationResponse = page.waitForResponse(
            (response) =>
                requestPath(response.url()) === ApiPath.SØK_ORGNUMMER &&
                response.url().includes(`organisasjonsnummer=${ORGNUMMER}`),
        );
        await page.getByRole('checkbox', { name: 'Send til tredjepart' }).check();
        await page.getByRole('textbox', { name: 'Organisasjonsnummer' }).fill(ORGNUMMER);
        const [orgRequest, orgResponse] = await Promise.all([organizationRequest, organizationResponse]);
        expect(orgResponse.status()).toBe(200);
        expect(orgRequest.headers()['x-nav-norskident']).toBe(AKTØR_ID);
        await expect(page.getByText('Test Navn')).toBeVisible();

        await page.getByRole('textbox', { name: 'Tittel' }).fill(TEST_TITTEL);
        await page.getByRole('textbox', { name: 'Innhold i brev' }).fill(TEST_INNHOLD);
        const previewResponsePromise = page.waitForResponse(
            (response) =>
                requestPath(response.url()) === ApiPath.BREV_FORHAANDSVIS &&
                response.request().method() === 'POST',
        );
        const previewPopupPromise = page.waitForEvent('popup');
        await page.getByRole('button', { name: 'Forhåndsvis brev' }).click();
        const [previewResponse, previewPopup] = await Promise.all([previewResponsePromise, previewPopupPromise]);
        expect(previewResponse.status()).toBe(200);
        expect(previewResponse.headers()['content-type']).toContain('application/pdf');
        expect(previewResponse.request().postDataJSON()).toEqual({
            aktørId: AKTØR_ID,
            eksternReferanse: FAGSAK_ID,
            ytelseType: { kode: 'PSB', kodeverk: 'FAGSAK_YTELSE' },
            saksnummer: FAGSAK_ID,
            avsenderApplikasjon: 'K9PUNSJ',
            overstyrtMottaker: { type: 'ORGNR', id: ORGNUMMER },
            dokumentMal: 'GENERELT_FRITEKSTBREV',
            dokumentdata: { fritekstbrev: { overskrift: TEST_TITTEL, brødtekst: TEST_INNHOLD } },
        });
        const openedPreviewUrl = await page.evaluate(() => {
            const openedWindowUrls = (window as Window & { __openedWindowUrls?: string[] }).__openedWindowUrls;
            return openedWindowUrls?.[openedWindowUrls.length - 1];
        });
        expect(openedPreviewUrl).toMatch(/^blob:/);
        expect(previewPopup.isClosed()).toBe(false);
        await previewPopup.close();
        expect(bestillinger).toHaveLength(0);
    });

    await test.step('Beholde skjemaet ved feil og bestille brevet på nytt', async () => {
        await page.getByRole('button', { name: 'Send brev' }).click();
        await expect(page.getByText('Er du sikker på at du vil sende brevet?')).toBeVisible();
        const firstResponsePromise = page.waitForResponse(
            (response) => requestPath(response.url()) === ApiPath.BREV_BESTILL,
        );
        await page.getByRole('button', { name: 'Fortsett' }).click();
        const firstResponse = await firstResponsePromise;
        expect(firstResponse.status()).toBe(500);
        await expect(page.getByText('Sending av brev feilet.')).toBeVisible();
        await expect(page.getByRole('combobox', { name: 'Velg mal' })).toHaveValue('GENERELT_FRITEKSTBREV');
        await expect(page.getByRole('textbox', { name: 'Organisasjonsnummer' })).toHaveValue('889 640 782');
        await expect(page.getByRole('textbox', { name: 'Tittel' })).toHaveValue(TEST_TITTEL);
        await expect(page.getByRole('textbox', { name: 'Innhold i brev' })).toHaveValue(TEST_INNHOLD);

        const secondResponsePromise = page.waitForResponse(
            (response) => requestPath(response.url()) === ApiPath.BREV_BESTILL,
        );
        await page.getByRole('button', { name: 'Send brev' }).click();
        await page.getByRole('button', { name: 'Fortsett' }).click();
        const secondResponse = await secondResponsePromise;
        expect(secondResponse.status()).toBe(200);
        await expect(page.getByText('Brevet er sendt. Du blir nå tatt til LOS.')).toBeVisible();
    });

    expect(bestillinger).toHaveLength(2);
    expect(bestillingsresponser).toEqual([500, 200]);
    expect(bestillinger[0]?.body).toEqual(bestillinger[1]?.body);
    expect(bestillinger[0]?.body).toEqual({
        soekerId: TEST_IDENT,
        mottaker: { type: 'ORGNR', id: ORGNUMMER },
        fagsakYtelseType: 'PSB',
        dokumentMal: 'GENERELT_FRITEKSTBREV',
        dokumentdata: { fritekstbrev: { overskrift: TEST_TITTEL, brødtekst: TEST_INNHOLD } },
        saksnummer: FAGSAK_ID,
    });
});
