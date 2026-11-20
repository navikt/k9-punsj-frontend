import { expect, test } from '@playwright/test';

import fagsaker from '../../cypress/fixtures/fagsaker.json' with { type: 'json' };
import journalpost from '../../cypress/fixtures/jpPSB300.json' with { type: 'json' };
import journalpostUavklart from '../../cypress/fixtures/jpUavklartSakstype315.json' with { type: 'json' };
import { ApiPath } from '../../src/app/apiConfig';
import { createMockPdfBytes } from '../../src/mocks/mockPdf.js';
import { installBrevHandlers } from './helpers/brev';

const TEST_IDENT = '08438323288';
const AKTØR_ID = '81549300';
const FAGSAK_ID = '1DMU93A';
const ORGNUMMER = '889640782';
const TEST_TITTEL = 'Eksempel på tittel';
const TEST_INNHOLD = 'Eksempel på brevtekst';
const JOURNALPOST_ID = journalpost.journalpostId;
const SØKER_ID = journalpost.norskIdent;
const FAGSAK = fagsaker[2];
const ARBEIDSGIVER_ID = '979312059';

const requestPath = (url: string) => new URL(url).pathname;

test('hindrer brev for uavklart ytelse til PSB er valgt på journalposten', async ({ page }) => {
    const journalpostId = journalpostUavklart.journalpostId;
    const journalpostPath = ApiPath.JOURNALPOST_GET.replace('{journalpostId}', journalpostId);
    const initialJournalpostPromise = page.waitForResponse(
        (response) => response.request().method() === 'GET' && requestPath(response.url()) === journalpostPath,
    );

    await page.goto(`/journalpost/${journalpostId}/brev-behandlet-journalpost/`);

    const initialJournalpost = await initialJournalpostPromise;
    expect(initialJournalpost.status()).toBe(201);
    expect(initialJournalpost.fromServiceWorker()).toBe(true);
    expect(await initialJournalpost.json()).toEqual(journalpostUavklart);
    await expect(page.getByText(/Journalposten mangler avklart ytelsestype/i)).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Velg mal' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Tilbake' }).click();
    await expect(page).toHaveURL(new RegExp(`/journalpost/${journalpostId}/?$`));

    await expect(page.getByText(/Ytelsestypen på journalposten er ikke avklart/i)).toBeVisible();
    const sendBrevButton = page.getByRole('button', { name: 'Send brev', exact: true });
    await expect(sendBrevButton).toBeDisabled();
    await page.getByRole('radio', { name: 'Pleiepenger sykt barn', exact: true }).check();
    await expect(sendBrevButton).toBeEnabled();

    const templateRequestPromise = page.waitForRequest(
        (request) => request.method() === 'GET' && requestPath(request.url()) === ApiPath.BREV_MALER,
    );
    await sendBrevButton.click();
    await expect(page).toHaveURL(new RegExp(`/journalpost/${journalpostId}/brev-behandlet-journalpost/?$`));
    await expect(page.getByRole('combobox', { name: 'Velg mal' })).toBeVisible();

    const templateRequest = await templateRequestPromise;
    const templateUrl = new URL(templateRequest.url());
    expect(templateUrl.searchParams.get('sakstype')).toBe('PSB');
    expect(templateUrl.searchParams.get('avsenderApplikasjon')).toBe('K9PUNSJ');
});

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
        await expect(page.getByRole('heading', { name: 'Send brev i avsluttet sak' })).toBeVisible();

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
                templateRequest.method() === 'GET' && requestPath(templateRequest.url()) === ApiPath.BREV_MALER,
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
                requestPath(response.url()) === ApiPath.BREV_FORHAANDSVIS && response.request().method() === 'POST',
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

test('sender brev på valgt fagsak, hindrer duplikat og lukker oppgaven etter nytt forsøk', async ({ page }) => {
    const journalpostPath = ApiPath.JOURNALPOST_GET.replace('{journalpostId}', JOURNALPOST_ID);
    const classifyPath = ApiPath.JOURNALPOST_MOTTAK;
    const sendPath = ApiPath.BREV_BESTILL;
    const closePath = ApiPath.JOURNALPOST_LUKK_OPPGAVE.replace('{journalpostId}', JOURNALPOST_ID);
    const bestillinger: Array<Record<string, unknown>> = [];
    const lukkeforspørsler: Array<Record<string, unknown>> = [];

    page.on('request', (request) => {
        const path = requestPath(request.url());
        if (path === sendPath) bestillinger.push(request.postDataJSON());
        if (path === closePath) lukkeforspørsler.push(request.postDataJSON());
    });

    await test.step('Åpne journalpost 300, bekreft søker og journalfør valgt PSB-sak', async () => {
        const initialJournalpostPromise = page.waitForResponse(
            (response) => response.request().method() === 'GET' && requestPath(response.url()) === journalpostPath,
        );
        await page.goto(`/journalpost/${JOURNALPOST_ID}`);
        const initialJournalpost = await initialJournalpostPromise;
        expect(initialJournalpost.status()).toBe(201);
        expect(initialJournalpost.fromServiceWorker()).toBe(true);
        expect(await initialJournalpost.json()).toEqual(journalpost);

        await page.getByText('Skjul', { exact: true }).click();
        await page.getByRole('radio', { name: 'Ja' }).check();
        const caseSelect = page.getByLabel('Velg fagsak');
        await caseSelect.selectOption(FAGSAK.fagsakId);
        await expect(caseSelect).toHaveValue(FAGSAK.fagsakId);

        await page.evaluate(
            ({ paths, sourceJournalpost, selectedCase }) => {
                const msw = window.msw;
                if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');

                let classificationSucceeded = false;
                let closeAttempts = 0;
                const refreshedJournalpost = {
                    ...sourceJournalpost,
                    erFerdigstilt: true,
                    journalpostStatus: 'JOURNALFOERT',
                    sak: {
                        ...sourceJournalpost.sak,
                        fagsakId: selectedCase.fagsakId,
                        sakstype: selectedCase.sakstype,
                        pleietrengendeIdent: selectedCase.pleietrengende?.identitetsnummer ?? null,
                    },
                };

                msw.worker.use(
                    msw.http.post(paths.classify, () => {
                        classificationSucceeded = true;
                        return msw.HttpResponse.json({ saksnummer: selectedCase.fagsakId }, { status: 200 });
                    }),
                    msw.http.get(paths.journalpost, () => {
                        if (!classificationSucceeded) return;
                        return msw.HttpResponse.json(refreshedJournalpost, { status: 200 });
                    }),
                    msw.http.post(paths.send, () => new msw.HttpResponse(null, { status: 200 })),
                    msw.http.post(paths.close, () => {
                        closeAttempts += 1;
                        return new msw.HttpResponse(null, { status: closeAttempts === 1 ? 500 : 200 });
                    }),
                );
            },
            {
                paths: { classify: classifyPath, journalpost: journalpostPath, send: sendPath, close: closePath },
                sourceJournalpost: journalpost,
                selectedCase: FAGSAK,
            },
        );

        await page.locator('[data-test-id="journalførOgFortsett"]').click();
        const classificationDialog = page.locator('[data-test-id="klassifiserModal"]');
        await expect(classificationDialog).toBeVisible();
        const classificationResponsePromise = page.waitForResponse(
            (response) => response.request().method() === 'POST' && requestPath(response.url()) === classifyPath,
        );
        const refreshedJournalpostPromise = page.waitForResponse(
            (response) =>
                response.request().method() === 'GET' && requestPath(response.url()) === journalpostPath,
        );
        await classificationDialog.locator('[data-test-id="klassifiserModalJournalfør"]').click();

        const classificationResponse = await classificationResponsePromise;
        expect(classificationResponse.status()).toBe(200);
        expect(classificationResponse.fromServiceWorker()).toBe(true);
        expect(classificationResponse.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
        expect(classificationResponse.request().postDataJSON()).toEqual({
            journalpostId: JOURNALPOST_ID,
            brukerIdent: SØKER_ID,
            pleietrengendeIdent: FAGSAK.pleietrengende?.identitetsnummer,
            relatertPersonIdent: '',
            fagsakYtelseTypeKode: FAGSAK.sakstype,
            periode: FAGSAK.gyldigPeriode,
            saksnummer: FAGSAK.fagsakId,
        });
        expect(await classificationResponse.json()).toEqual({ saksnummer: FAGSAK.fagsakId });

        const refreshedJournalpost = await refreshedJournalpostPromise;
        expect(refreshedJournalpost.status()).toBe(200);
        expect(refreshedJournalpost.fromServiceWorker()).toBe(true);
        expect(await refreshedJournalpost.json()).toMatchObject({
            journalpostId: JOURNALPOST_ID,
            erFerdigstilt: true,
            sak: {
                fagsakId: FAGSAK.fagsakId,
                sakstype: FAGSAK.sakstype,
                pleietrengendeIdent: FAGSAK.pleietrengende?.identitetsnummer,
            },
        });

        await page.getByRole('radio', { name: 'Send brev og lukk oppgave i LOS', exact: true }).check();
        await page.locator('[data-test-id="bekreftKnapp"]').click();
        await expect(page).toHaveURL(
            new RegExp(`/journalpost/${JOURNALPOST_ID}/pleiepenger-sykt-barn/send-brev-fagsak/?$`),
        );
    });

    await test.step('Kontroller brevskjemaet og velg arbeidsgiver og fritekstmal', async () => {
        await expect(page.getByRole('heading', { name: 'Send brev og lukk oppgave i LOS' })).toBeVisible();
        const templateSelect = page.getByRole('combobox', { name: 'Velg mal' });
        const recipientSelect = page.getByRole('combobox', { name: 'Velg mottaker' });
        await expect(templateSelect).toBeVisible();
        await expect(recipientSelect).toBeVisible();
        await expect(page.getByRole('checkbox', { name: 'Send til tredjepart' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Send brev' })).toBeVisible();

        await recipientSelect.selectOption(ARBEIDSGIVER_ID);
        await templateSelect.selectOption('GENERELT_FRITEKSTBREV');
        await expect(recipientSelect).toHaveValue(ARBEIDSGIVER_ID);
        await expect(templateSelect).toHaveValue('GENERELT_FRITEKSTBREV');
        await page.getByRole('textbox', { name: 'Tittel' }).fill(TEST_TITTEL);
        await page.getByRole('textbox', { name: 'Innhold i brev' }).fill(TEST_INNHOLD);
    });

    await test.step('Send brevet og kontroller én vellykket forespørsel for valgt sak', async () => {
        const sendResponsePromise = page.waitForResponse(
            (response) => requestPath(response.url()) === sendPath && response.request().method() === 'POST',
        );
        await page.getByRole('button', { name: 'Send brev' }).click();
        await expect(page.getByText('Er du sikker på at du vil sende brevet?')).toBeVisible();
        await page.getByRole('button', { name: 'Fortsett' }).click();

        const sendResponse = await sendResponsePromise;
        expect(sendResponse.status()).toBe(200);
        expect(sendResponse.fromServiceWorker()).toBe(true);
        expect(sendResponse.request().postDataJSON()).toEqual({
            soekerId: SØKER_ID,
            mottaker: { type: 'ORGNR', id: ARBEIDSGIVER_ID },
            fagsakYtelseType: 'PSB',
            dokumentMal: 'GENERELT_FRITEKSTBREV',
            dokumentdata: { fritekstbrev: { overskrift: TEST_TITTEL, brødtekst: TEST_INNHOLD } },
            journalpostId: JOURNALPOST_ID,
            saksnummer: FAGSAK.fagsakId,
        });
        await expect(page.getByText('Brev sendt! Du kan nå sende nytt brev til annen mottaker.')).toBeVisible();
        expect(bestillinger).toHaveLength(1);
    });

    await test.step('Blokker identisk brev uten en ny bestillingsforespørsel', async () => {
        await page.getByRole('button', { name: 'Send brev' }).click();
        await expect(page.getByText('Er du sikker på at du vil sende brevet?')).toBeVisible();
        await page.getByRole('button', { name: 'Fortsett' }).click();
        await expect(
            page.getByText('Brevet er sendt. Du må endre mottaker eller innhold for å sende nytt brev.'),
        ).toBeVisible();
        expect(bestillinger).toHaveLength(1);
    });

    await test.step('Vis feil når første forsøk på å lukke oppgaven gir HTTP 500', async () => {
        await page.getByRole('button', { name: 'Lukk oppgave i LOS' }).click();
        await expect(page.getByText('Er du sikker på at du vil lukke oppgaven?')).toBeVisible();
        const closeResponsePromise = page.waitForResponse(
            (response) =>
                response.request().method() === 'POST' &&
                requestPath(response.url()) === closePath &&
                response.status() === 500,
        );
        await page.getByRole('button', { name: 'Fortsett' }).click();

        const closeResponse = await closeResponsePromise;
        expect(closeResponse.fromServiceWorker()).toBe(true);
        expect(closeResponse.request().postDataJSON()).toEqual({
            norskIdent: SØKER_ID,
            sak: { fagsakId: FAGSAK.fagsakId, sakstype: 'FAGSAK' },
        });
        await expect(page.getByText('Noe gikk galt ved lukking av oppgave')).toBeVisible();
        expect(lukkeforspørsler).toHaveLength(1);
        expect(bestillinger).toHaveLength(1);
    });

    await test.step('Prøv lukking på nytt og kontroller HTTP 200 med tomt svar', async () => {
        await page.getByRole('button', { name: 'Lukk oppgave i LOS' }).click();
        await expect(page.getByText('Er du sikker på at du vil lukke oppgaven?')).toBeVisible();
        const closeResponsePromise = page.waitForResponse(
            (response) =>
                response.request().method() === 'POST' &&
                requestPath(response.url()) === closePath &&
                response.status() === 200,
        );
        await page.getByRole('button', { name: 'Fortsett' }).click();

        const closeResponse = await closeResponsePromise;
        expect(closeResponse.fromServiceWorker()).toBe(true);
        expect(closeResponse.request().postDataJSON()).toEqual({
            norskIdent: SØKER_ID,
            sak: { fagsakId: FAGSAK.fagsakId, sakstype: 'FAGSAK' },
        });
        expect(await closeResponse.text()).toBe('');
        await expect(page.getByText('Oppgaven er lukket')).toBeVisible();
        await expect(page.getByText('Du blir nå tatt tilbake til oppgavekøen i LOS')).toBeVisible();
        expect(lukkeforspørsler).toHaveLength(2);
        expect(lukkeforspørsler[0]).toEqual(lukkeforspørsler[1]);
        expect(bestillinger).toHaveLength(1);
    });

    await test.step('Naviger til den konfigurerte lokale LOS-destinasjonen', async () => {
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
        await page.getByRole('button', { name: 'OK' }).click();
        const destinationRequest = await destinationRequestPromise;

        expect(destinationRequest.url()).toBe(destinationUrl);
        await destinationPromise;
        expect(page.url()).toBe(destinationUrl);
    });
});
