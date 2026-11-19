import { expect, test, type Page, type Response } from '@playwright/test';

import fagsaker from '../../cypress/fixtures/fagsaker.json' with { type: 'json' };
import journalpostFixture from '../../cypress/fixtures/jpPILS301.json' with { type: 'json' };
import { ApiPath } from '../../src/app/apiConfig';

const JOURNALPOST_ID = journalpostFixture.journalpostId;
const SØKER_ID = journalpostFixture.norskIdent;
const ALTERNATIV_SØKER_ID = '12448325820';
const MANUELL_PLEIETRENGENDES_ID = '24420167209';
const FAGSAK = fagsaker[5];
const PLEIETRENGENDES_ID = FAGSAK.pleietrengende!.identitetsnummer;
const JOURNALPOST_PATH = ApiPath.JOURNALPOST_GET.replace('{journalpostId}', JOURNALPOST_ID);
const MOTTAK_PATH = ApiPath.JOURNALPOST_MOTTAK;
const VENT_PATH = ApiPath.JOURNALPOST_SETT_PAA_VENT.replace('{journalpostId}', JOURNALPOST_ID);
const PLS_LOOKUP_PATH = ApiPath.PLS_EKSISTERENDE_SOKNADER_FIND;
const PLS_CREATE_PATH = ApiPath.PLS_SOKNAD_CREATE;

const isResponse = (response: Response, method: string, path: string) =>
    response.request().method() === method && new URL(response.url()).pathname === path;

const waitForCasesLookup = (page: Page, applicantId: string) =>
    page.waitForResponse(
        (response) =>
            isResponse(response, 'GET', ApiPath.HENT_FAGSAK_PÅ_IDENT) &&
            response.request().headers()['x-nav-norskident'] === applicantId,
    );

type NetworkEvent = {
    kind: 'request' | 'response';
    method: string;
    path: string;
    status?: number;
};

const openPilsJournalpost = async (page: Page) => {
    const responsePromise = page.waitForResponse((response) => isResponse(response, 'GET', JOURNALPOST_PATH));
    await page.goto(`/journalpost/${JOURNALPOST_ID}`);
    const response = await responsePromise;

    expect(response.status()).toBe(201);
    expect(response.fromServiceWorker()).toBe(true);
    expect(await response.json()).toEqual(journalpostFixture);
};

const selectPpnCase = async (page: Page) => {
    await page.getByRole('radio', { name: 'Ja' }).check();
    const caseSelect = page.getByLabel('Velg fagsak');
    await expect(caseSelect).toBeVisible();
    await caseSelect.selectOption(FAGSAK.fagsakId);
    await expect(caseSelect).toHaveValue(FAGSAK.fagsakId);
};

type ClassificationModalScenario = {
    title: string;
    action: 'Fortsett' | 'Vent';
    fagsak?: (typeof fagsaker)[number];
    newCase?: 'manual-care-recipient' | 'no-care-recipient-id';
};

const classificationModalScenarios: ClassificationModalScenario[] = [
    { title: 'eksisterende sak uten pleietrengende, Vent', action: 'Vent', fagsak: fagsaker[6] },
    { title: 'eksisterende sak med pleietrengende, Fortsett', action: 'Fortsett', fagsak: FAGSAK },
    { title: 'eksisterende sak med pleietrengende, Vent', action: 'Vent', fagsak: FAGSAK },
    { title: 'reservert sak med pleietrengende, Fortsett', action: 'Fortsett', fagsak: fagsaker[7] },
    { title: 'reservert sak med pleietrengende, Vent', action: 'Vent', fagsak: fagsaker[7] },
    { title: 'reservert sak uten pleietrengende, Vent', action: 'Vent', fagsak: fagsaker[8] },
    { title: 'ny sak med manuelt registrert pleietrengende, Fortsett', action: 'Fortsett', newCase: 'manual-care-recipient' },
    { title: 'ny sak med manuelt registrert pleietrengende, Vent', action: 'Vent', newCase: 'manual-care-recipient' },
    { title: 'ny sak uten fødselsnummer for pleietrengende, Vent', action: 'Vent', newCase: 'no-care-recipient-id' },
];

const recordMutations = (page: Page) => {
    const mutations: string[] = [];
    const closeRequests: string[] = [];
    const events: NetworkEvent[] = [];
    const readOnlyPosts = new Set([ApiPath.JOURNALPOST_HENT, ApiPath.SAKER_PERIODER]);
    const closePath = ApiPath.JOURNALPOST_LUKK_DEBUGG.replace('{journalpostId}', JOURNALPOST_ID);
    const relevantPaths = new Set([JOURNALPOST_PATH, MOTTAK_PATH, VENT_PATH, PLS_LOOKUP_PATH, PLS_CREATE_PATH]);

    page.on('request', (request) => {
        const path = new URL(request.url()).pathname;
        const method = request.method();
        if (relevantPaths.has(path)) events.push({ kind: 'request', method, path });
        if (path === closePath) closeRequests.push(`${method} ${path}`);
        if (
            path.startsWith('/api/k9-punsj/') &&
            !['GET', 'HEAD', 'OPTIONS'].includes(method) &&
            !(method === 'POST' && readOnlyPosts.has(path))
        ) {
            mutations.push(`${method} ${path}`);
        }
    });
    page.on('response', (response) => {
        const path = new URL(response.url()).pathname;
        if (relevantPaths.has(path)) {
            events.push({
                kind: 'response',
                method: response.request().method(),
                path,
                status: response.status(),
            });
        }
    });

    return { mutations, closeRequests, events };
};

test.describe('PLS-klassifiseringsmodaler for én søker', () => {
    test('bytter til alternativ søker for PLS og nullstiller panelet ved retur', async ({ page }) => {
        const { mutations, closeRequests } = recordMutations(page);
        await openPilsJournalpost(page);

        const originalApplicantLookup = waitForCasesLookup(page, SØKER_ID);
        await page.getByRole('radio', { name: 'Ja', exact: true }).check();
        const originalApplicantResponse = await originalApplicantLookup;
        expect(originalApplicantResponse.status()).toBe(200);
        expect(originalApplicantResponse.fromServiceWorker()).toBe(true);
        expect(originalApplicantResponse.request().headers()['x-nav-norskident']).toBe(SØKER_ID);

        await page.getByLabel('Reserver saksnummer til ny fagsak').check();
        await page.getByLabel('Pleietrengende har ikke fødselsnummer', { exact: true }).check();
        await expect(page.locator('[data-test-id="pleietrengendeHarIkkeFnrInformasjon"]')).toBeVisible();
        await page.getByRole('radio', { name: 'Nei', exact: true }).check();

        await expect(page.getByLabel('Velg fagsak')).toHaveCount(0);
        await expect(page.getByLabel('Reserver saksnummer til ny fagsak')).toHaveCount(0);
        await expect(page.getByLabel('Pleietrengendes fødselsnummer:')).toHaveCount(0);
        await expect(page.getByLabel('Pleietrengende har ikke fødselsnummer')).toHaveCount(0);
        await expect(page.locator('[data-test-id="pleietrengendeHarIkkeFnrInformasjon"]')).toHaveCount(0);
        await expect(page.locator('[data-test-id="journalførOgFortsett"]')).toBeDisabled();
        await expect(page.locator('[data-test-id="journalførOgVent"]')).toBeDisabled();

        const alternateApplicantLookup = waitForCasesLookup(page, ALTERNATIV_SØKER_ID);
        await page.getByLabel('Søkers fødselsnummer eller D-nummer:').fill(ALTERNATIV_SØKER_ID);
        const alternateApplicantResponse = await alternateApplicantLookup;
        expect(alternateApplicantResponse.status()).toBe(200);
        expect(alternateApplicantResponse.fromServiceWorker()).toBe(true);
        expect(alternateApplicantResponse.request().headers()['x-nav-norskident']).toBe(ALTERNATIV_SØKER_ID);
        expect(await alternateApplicantResponse.json()).toEqual(
            expect.arrayContaining([expect.objectContaining({ fagsakId: FAGSAK.fagsakId })]),
        );

        const reserveCase = page.getByLabel('Reserver saksnummer til ny fagsak');
        await reserveCase.check();
        await expect(reserveCase).toBeChecked();
        await reserveCase.uncheck();
        const caseSelect = page.getByLabel('Velg fagsak');
        await expect(caseSelect).toBeVisible();
        await caseSelect.selectOption(FAGSAK.fagsakId);
        await expect(caseSelect).toHaveValue(FAGSAK.fagsakId);

        const panel = page.locator('.journalpostpanel');
        await expect(panel.getByText('Søkers ID:', { exact: true })).toBeVisible();
        await expect(panel).toContainText(ALTERNATIV_SØKER_ID);
        await expect(panel.getByText('Saksnummer:', { exact: true })).toBeVisible();
        await expect(panel).toContainText(FAGSAK.fagsakId);
        await expect(panel.getByText('Pleietrengendes ID:', { exact: true })).toBeVisible();
        await expect(panel).toContainText(PLEIETRENGENDES_ID);
        await expect(page.locator('[data-test-id="journalførOgFortsett"]')).toBeEnabled();
        await expect(page.locator('[data-test-id="journalførOgVent"]')).toBeEnabled();

        for (const [action, header, confirmButton] of [
            [
                'Fortsett',
                'Vil du lagre følgende informasjon til journalposten?',
                'Journalfør journalposten',
            ],
            [
                'Vent',
                'Vil du lagre følgende informasjon til journalposten og sett på vent?',
                'Journalfør og sett på vent',
            ],
        ]) {
            await page.locator(`[data-test-id="journalførOg${action}"]`).click();
            const dialog = page.locator('[data-test-id="klassifiserModal"]');
            const info = dialog.locator('[data-test-id="klassifiseringInfo"]');
            await expect(dialog).toBeVisible();
            await expect(dialog.locator('[data-test-id="klassifiserModalHeader"]')).toContainText(header);
            await expect(info.getByText('Sakstype:', { exact: true })).toBeVisible();
            await expect(info.getByText('Pleiepenger i livets sluttfase', { exact: true })).toBeVisible();
            await expect(info.getByText('Søkers ID:', { exact: true })).toBeVisible();
            await expect(info.getByText(ALTERNATIV_SØKER_ID, { exact: true })).toBeVisible();
            await expect(info.getByText('Saksnummer:', { exact: true })).toBeVisible();
            await expect(info.getByText(FAGSAK.fagsakId, { exact: true })).toBeVisible();
            await expect(info.getByText('Periode:', { exact: true })).toBeVisible();
            await expect(info).toContainText('15.04.2024');
            await expect(info.getByText('Pleietrengendes ID:', { exact: true })).toBeVisible();
            await expect(info.getByText(PLEIETRENGENDES_ID, { exact: true })).toBeVisible();
            await expect(dialog.getByRole('button', { name: confirmButton, exact: true })).toBeEnabled();
            await dialog.getByRole('button', { name: 'Avbryt', exact: true }).click();
            await expect(dialog).toHaveCount(0);
            expect(mutations).toEqual([]);
            expect(closeRequests).toEqual([]);
        }

        const returnLookup = waitForCasesLookup(page, SØKER_ID);
        await page.getByRole('radio', { name: 'Ja', exact: true }).check();
        const returnResponse = await returnLookup;
        expect(returnResponse.status()).toBe(200);
        expect(returnResponse.fromServiceWorker()).toBe(true);
        expect(returnResponse.request().headers()['x-nav-norskident']).toBe(SØKER_ID);

        await expect(panel).toContainText(SØKER_ID);
        await expect(panel).not.toContainText(ALTERNATIV_SØKER_ID);
        await expect(panel.getByText('Saksnummer:', { exact: true })).toHaveCount(0);
        await expect(panel).not.toContainText(FAGSAK.fagsakId);
        await expect(panel.getByText('Pleietrengendes ID:', { exact: true })).toHaveCount(0);
        await expect(panel).not.toContainText(PLEIETRENGENDES_ID);
        await expect(page.getByLabel('Reserver saksnummer til ny fagsak')).not.toBeChecked();
        await expect(page.locator('[data-test-id="journalførOgFortsett"]')).toBeDisabled();
        await expect(page.locator('[data-test-id="journalførOgVent"]')).toBeDisabled();
        expect(mutations).toEqual([]);
        expect(closeRequests).toEqual([]);
    });

    for (const scenario of classificationModalScenarios) {
        test(`viser og avbryter modal for ${scenario.title}`, async ({ page }) => {
            const { mutations, closeRequests } = recordMutations(page);
            await openPilsJournalpost(page);
            await page.getByRole('radio', { name: 'Ja' }).check();

            if (scenario.fagsak) {
                const caseSelect = page.getByLabel('Velg fagsak');
                await caseSelect.selectOption(scenario.fagsak.fagsakId);
                await expect(caseSelect).toHaveValue(scenario.fagsak.fagsakId);
            } else {
                await page.getByLabel('Reserver saksnummer til ny fagsak').check();
                if (scenario.newCase === 'manual-care-recipient') {
                    await page
                        .getByLabel('Pleietrengendes fødselsnummer:', { exact: true })
                        .fill(MANUELL_PLEIETRENGENDES_ID);
                } else {
                    await page.getByLabel('Pleietrengende har ikke fødselsnummer', { exact: true }).check();
                }
            }

            const actionButton =
                scenario.action === 'Fortsett'
                    ? page.locator('[data-test-id="journalførOgFortsett"]')
                    : page.locator('[data-test-id="journalførOgVent"]');
            await actionButton.click();

            const dialog = page.locator('[data-test-id="klassifiserModal"]');
            const info = dialog.locator('[data-test-id="klassifiseringInfo"]');
            await expect(dialog).toBeVisible();
            await expect(dialog.locator('[data-test-id="klassifiserModalHeader"]')).toContainText(
                scenario.action === 'Fortsett'
                    ? 'Vil du lagre følgende informasjon til journalposten?'
                    : 'Vil du lagre følgende informasjon til journalposten og sett på vent?',
            );
            await expect(info.getByText('Sakstype:', { exact: true })).toBeVisible();
            await expect(info.getByText('Pleiepenger i livets sluttfase', { exact: true })).toBeVisible();
            await expect(info.getByText('Søkers ID:', { exact: true })).toBeVisible();
            await expect(info.getByText(SØKER_ID, { exact: true })).toBeVisible();

            const caseNumber = info.getByText('Saksnummer:', { exact: true });
            const period = info.getByText('Periode:', { exact: true });
            if (scenario.fagsak) {
                await expect(caseNumber).toBeVisible();
                await expect(info.getByText(scenario.fagsak.fagsakId, { exact: true })).toBeVisible();
                await expect(period).toBeVisible();
                await expect(info).toContainText('15.04.2024');
            } else {
                await expect(caseNumber).toHaveCount(0);
                await expect(period).toHaveCount(0);
            }

            const careRecipientId =
                scenario.fagsak?.pleietrengende?.identitetsnummer ??
                (scenario.newCase === 'manual-care-recipient' ? MANUELL_PLEIETRENGENDES_ID : undefined);
            const careRecipientLabel = info.getByText('Pleietrengendes ID:', { exact: true });
            if (careRecipientId) {
                await expect(careRecipientLabel).toBeVisible();
                await expect(info.getByText(careRecipientId, { exact: true })).toBeVisible();
            } else {
                await expect(careRecipientLabel).toHaveCount(0);
            }

            const confirmButtonName =
                scenario.action === 'Fortsett' ? 'Journalfør journalposten' : 'Journalfør og sett på vent';
            await expect(dialog.getByRole('button', { name: confirmButtonName, exact: true })).toBeEnabled();
            await dialog.getByRole('button', { name: 'Avbryt', exact: true }).click();
            await expect(dialog).toHaveCount(0);
            expect(mutations).toEqual([]);
            expect(closeRequests).toEqual([]);
        });
    }
});

const installVentHandlers = async (page: Page) => {
    await page.evaluate(
        ({ mottakPath, ventPath, journalpostId, saksnummer }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');
            let ventAttempts = 0;
            msw.worker.use(
                msw.http.post(mottakPath, async ({ request }) => {
                    const body = await request.json();
                    if (!body || typeof body !== 'object' || !('journalpostId' in body)) return;
                    if (body.journalpostId !== journalpostId) return;
                    return msw.HttpResponse.json({ saksnummer }, { status: 200 });
                }),
                msw.http.post(ventPath, () => {
                    ventAttempts += 1;
                    return ventAttempts === 1
                        ? msw.HttpResponse.json({ detail: 'Midlertidig feil' }, { status: 500 })
                        : new msw.HttpResponse(null, { status: 200 });
                }),
            );
        },
        { mottakPath: MOTTAK_PATH, ventPath: VENT_PATH, journalpostId: JOURNALPOST_ID, saksnummer: FAGSAK.fagsakId },
    );
};

const installFortsettHandlers = async (page: Page) => {
    const refreshedJournalpost = {
        ...journalpostFixture,
        erFerdigstilt: true,
        journalpostStatus: 'JOURNALFOERT',
        sak: {
            ...journalpostFixture.sak,
            fagsakId: FAGSAK.fagsakId,
            sakstype: 'PPN',
            gyldigPeriode: FAGSAK.gyldigPeriode,
            pleietrengendeIdent: PLEIETRENGENDES_ID,
            reservertSaksnummer: false,
        },
    };

    await page.evaluate(
        ({ mottakPath, journalpostPath, journalpostId, saksnummer, originalJournalpost, updatedJournalpost }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');
            let classificationSucceeded = false;
            msw.worker.use(
                msw.http.post(mottakPath, async ({ request }) => {
                    const body = await request.json();
                    if (!body || typeof body !== 'object' || !('journalpostId' in body)) return;
                    if (body.journalpostId !== journalpostId) return;
                    const response = msw.HttpResponse.json({ saksnummer }, { status: 200 });
                    classificationSucceeded = true;
                    return response;
                }),
                msw.http.get(journalpostPath, () =>
                    classificationSucceeded
                        ? msw.HttpResponse.json(updatedJournalpost, { status: 200 })
                        : msw.HttpResponse.json(originalJournalpost, { status: 201 }),
                ),
            );
        },
        {
            mottakPath: MOTTAK_PATH,
            journalpostPath: JOURNALPOST_PATH,
            journalpostId: JOURNALPOST_ID,
            saksnummer: FAGSAK.fagsakId,
            originalJournalpost: journalpostFixture,
            updatedJournalpost: refreshedJournalpost,
        },
    );
};

test('journalfører PLS, prøver Vent på nytt og navigerer til lokal LOS', async ({ page }) => {
    const { mutations, closeRequests, events } = recordMutations(page);
    await openPilsJournalpost(page);
    await selectPpnCase(page);
    await installVentHandlers(page);

    await page.locator('[data-test-id="journalførOgVent"]').click();
    const dialog = page.locator('[data-test-id="klassifiserModal"]');
    await expect(dialog).toBeVisible();
    const classifyResponsePromise = page.waitForResponse((response) =>
        isResponse(response, 'POST', MOTTAK_PATH),
    );
    const firstVentResponsePromise = page.waitForResponse(
        (response) => isResponse(response, 'POST', VENT_PATH) && response.status() === 500,
    );
    await dialog.getByRole('button', { name: 'Journalfør og sett på vent' }).click();

    const classifyResponse = await classifyResponsePromise;
    expect(classifyResponse.status()).toBe(200);
    expect(classifyResponse.fromServiceWorker()).toBe(true);
    expect(classifyResponse.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(classifyResponse.request().postDataJSON()).toMatchObject({
        journalpostId: JOURNALPOST_ID,
        brukerIdent: SØKER_ID,
        pleietrengendeIdent: PLEIETRENGENDES_ID,
        fagsakYtelseTypeKode: 'PPN',
        saksnummer: FAGSAK.fagsakId,
        periode: FAGSAK.gyldigPeriode,
    });
    expect(await classifyResponse.json()).toEqual({ saksnummer: FAGSAK.fagsakId });

    const firstVentResponse = await firstVentResponsePromise;
    expect(firstVentResponse.fromServiceWorker()).toBe(true);
    await expect(
        dialog.getByText('Det oppstod en feil når journalpost skulle settes på vent.', { exact: true }),
    ).toBeVisible();
    const retryButton = dialog.getByRole('button', { name: 'Sett på vent' });
    await expect(retryButton).toBeEnabled();
    await expect(dialog.getByRole('button', { name: 'Gå til LOS' })).toHaveCount(0);
    expect(mutations).toEqual([`POST ${MOTTAK_PATH}`, `POST ${VENT_PATH}`]);
    expect(events.filter((event) => event.path === MOTTAK_PATH || event.path === VENT_PATH)).toEqual([
        { kind: 'request', method: 'POST', path: MOTTAK_PATH },
        { kind: 'response', method: 'POST', path: MOTTAK_PATH, status: 200 },
        { kind: 'request', method: 'POST', path: VENT_PATH },
        { kind: 'response', method: 'POST', path: VENT_PATH, status: 500 },
    ]);

    const retryResponsePromise = page.waitForResponse(
        (response) => isResponse(response, 'POST', VENT_PATH) && response.status() === 200,
    );
    await retryButton.click();
    const retryResponse = await retryResponsePromise;
    expect(retryResponse.fromServiceWorker()).toBe(true);
    expect(retryResponse.headers()['content-type']).toBeUndefined();
    await expect(dialog.getByRole('button', { name: 'Sett på vent' })).toHaveCount(0);
    const goToLos = dialog.getByRole('button', { name: 'Gå til LOS' });
    await expect(goToLos).toBeEnabled();
    expect(mutations).toEqual([`POST ${MOTTAK_PATH}`, `POST ${VENT_PATH}`, `POST ${VENT_PATH}`]);
    expect(events.filter((event) => event.path === MOTTAK_PATH || event.path === VENT_PATH)).toEqual([
        { kind: 'request', method: 'POST', path: MOTTAK_PATH },
        { kind: 'response', method: 'POST', path: MOTTAK_PATH, status: 200 },
        { kind: 'request', method: 'POST', path: VENT_PATH },
        { kind: 'response', method: 'POST', path: VENT_PATH, status: 500 },
        { kind: 'request', method: 'POST', path: VENT_PATH },
        { kind: 'response', method: 'POST', path: VENT_PATH, status: 200 },
    ]);
    expect(closeRequests).toEqual([]);

    const localLosUrl = await page.evaluate(() => {
        const appWindow = window as Window & { appSettings?: Record<string, string | undefined> };
        return appWindow.appSettings?.K9_LOS_URL;
    });
    if (!localLosUrl) throw new Error('Den lokale LOS-adressen mangler i appinnstillingene.');
    expect(new URL(localLosUrl).origin).toBe('http://localhost:8080');
    expect(new URL(localLosUrl).pathname).toBe('/');
    const losNavigation = page.waitForURL(localLosUrl);
    await goToLos.click();
    await losNavigation;
    expect(page.url()).toBe(new URL(localLosUrl).href);
});

test('journalfører PLS med Fortsett og åpner automatisk opprettet søknad', async ({ page }) => {
    const { mutations, closeRequests, events } = recordMutations(page);
    await openPilsJournalpost(page);
    await selectPpnCase(page);
    await installFortsettHandlers(page);

    await page.locator('[data-test-id="journalførOgFortsett"]').click();
    const dialog = page.locator('[data-test-id="klassifiserModal"]');
    const info = dialog.locator('[data-test-id="klassifiseringInfo"]');
    await expect(info.getByText('Sakstype:', { exact: true })).toBeVisible();
    await expect(info.getByText('Pleiepenger i livets sluttfase', { exact: true })).toBeVisible();
    await expect(info.getByText('Søkers ID:', { exact: true })).toBeVisible();
    await expect(info.getByText(SØKER_ID, { exact: true })).toBeVisible();
    await expect(info.getByText('Pleietrengendes ID:', { exact: true })).toBeVisible();
    await expect(info.getByText(PLEIETRENGENDES_ID, { exact: true })).toBeVisible();
    await expect(info.getByText('Saksnummer:', { exact: true })).toBeVisible();
    await expect(info.getByText(FAGSAK.fagsakId, { exact: true })).toBeVisible();
    await expect(info.getByText('Periode:', { exact: true })).toBeVisible();
    await expect(info).toContainText('15.04.2024');

    const classifyResponsePromise = page.waitForResponse((response) =>
        isResponse(response, 'POST', MOTTAK_PATH),
    );
    const refreshResponsePromise = page.waitForResponse((response) =>
        isResponse(response, 'GET', JOURNALPOST_PATH),
    );
    await dialog.getByRole('button', { name: 'Journalfør journalposten' }).click();

    const classifyResponse = await classifyResponsePromise;
    expect(classifyResponse.status()).toBe(200);
    expect(classifyResponse.fromServiceWorker()).toBe(true);
    expect(classifyResponse.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(classifyResponse.request().postDataJSON()).toMatchObject({
        journalpostId: JOURNALPOST_ID,
        brukerIdent: SØKER_ID,
        pleietrengendeIdent: PLEIETRENGENDES_ID,
        fagsakYtelseTypeKode: 'PPN',
        saksnummer: FAGSAK.fagsakId,
        periode: FAGSAK.gyldigPeriode,
    });
    expect(await classifyResponse.json()).toEqual({ saksnummer: FAGSAK.fagsakId });
    expect(mutations).toEqual([`POST ${MOTTAK_PATH}`]);

    const refreshResponse = await refreshResponsePromise;
    expect(refreshResponse.status()).toBe(200);
    expect(refreshResponse.fromServiceWorker()).toBe(true);
    expect(await refreshResponse.json()).toEqual({
        ...journalpostFixture,
        erFerdigstilt: true,
        journalpostStatus: 'JOURNALFOERT',
        sak: {
            ...journalpostFixture.sak,
            fagsakId: FAGSAK.fagsakId,
            sakstype: 'PPN',
            gyldigPeriode: FAGSAK.gyldigPeriode,
            pleietrengendeIdent: PLEIETRENGENDES_ID,
            reservertSaksnummer: false,
        },
    });
    const classificationResponseIndex = events.findIndex(
        (event) =>
            event.kind === 'response' &&
            event.method === 'POST' &&
            event.path === MOTTAK_PATH &&
            event.status === 200,
    );
    const refreshRequestIndex = events.findIndex(
        (event, index) =>
            index > classificationResponseIndex &&
            event.kind === 'request' &&
            event.method === 'GET' &&
            event.path === JOURNALPOST_PATH,
    );
    expect(classificationResponseIndex).toBeGreaterThanOrEqual(0);
    expect(refreshRequestIndex).toBeGreaterThan(classificationResponseIndex);

    await expect(page).toHaveURL(
        (url) => url.pathname === `/journalpost/${JOURNALPOST_ID}/pleiepenger-i-livets-sluttfase/`,
    );
    const panel = page.locator('.journalpostpanel');
    for (const [label, value] of [
        ['Journalpostnummer:', JOURNALPOST_ID],
        ['Søkers ID:', SØKER_ID],
        ['Sakstype:', 'Pleiepenger i livets sluttfase'],
        ['Pleietrengendes ID:', PLEIETRENGENDES_ID],
        ['Saksnummer:', FAGSAK.fagsakId],
    ]) {
        const field = panel.getByText(label, { exact: true });
        await expect(field).toBeVisible();
        await expect(field.locator('..').getByText(value, { exact: true })).toBeVisible();
    }
    await expect(page.locator('[data-test-id="alertJournalført"]')).toContainText(
        'Journalposten er journalført. Sakstype, søker og saksnummer er lagret til journalpost.',
    );

    const registerChoice = page.getByRole('radio', { name: 'Registrere opplysninger til k9-sak', exact: true });
    await expect(registerChoice).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Send brev og lukk oppgave i LOS', exact: true })).toBeVisible();
    const confirmButton = page.getByRole('button', { name: 'Bekreft', exact: true });
    await expect(confirmButton).toBeDisabled();
    await registerChoice.check();
    await expect(confirmButton).toBeEnabled();
    expect(mutations).toEqual([`POST ${MOTTAK_PATH}`]);

    const lookupResponsePromise = page.waitForResponse((response) =>
        isResponse(response, 'GET', PLS_LOOKUP_PATH),
    );
    const createResponsePromise = page.waitForResponse((response) =>
        isResponse(response, 'POST', PLS_CREATE_PATH),
    );
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
        journalpostId: JOURNALPOST_ID,
        norskIdent: SØKER_ID,
        pleietrengendeIdent: PLEIETRENGENDES_ID,
        k9saksnummer: FAGSAK.fagsakId,
    });
    expect(events.filter((event) => event.path === PLS_LOOKUP_PATH || event.path === PLS_CREATE_PATH)).toEqual([
        { kind: 'request', method: 'GET', path: PLS_LOOKUP_PATH },
        { kind: 'response', method: 'GET', path: PLS_LOOKUP_PATH, status: 200 },
        { kind: 'request', method: 'POST', path: PLS_CREATE_PATH },
        { kind: 'response', method: 'POST', path: PLS_CREATE_PATH, status: 201 },
    ]);
    const { soeknadId } = await createResponse.json();
    expect(soeknadId).toEqual(expect.any(String));
    expect(soeknadId).not.toBe('');
    await expect(page).toHaveURL(
        (url) =>
            url.pathname ===
            `/journalpost/${JOURNALPOST_ID}/pleiepenger-i-livets-sluttfase/skjema/${soeknadId}/`,
    );
    await expect(page.locator('[data-test-id="PILSPunchForm"]')).toBeVisible();
    expect(mutations).toEqual([`POST ${MOTTAK_PATH}`, `POST ${PLS_CREATE_PATH}`]);
    expect(closeRequests).toEqual([]);
});
