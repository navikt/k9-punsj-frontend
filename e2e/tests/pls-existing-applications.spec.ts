import { expect, test, type Page, type Response } from '@playwright/test';

import fagsaker from '../../cypress/fixtures/fagsaker.json' with { type: 'json' };
import jpPILS301 from '../../cypress/fixtures/jpPILS301.json' with { type: 'json' };
import pilsSoknad from '../../cypress/fixtures/pilsSoknad.json' with { type: 'json' };
import { ApiPath } from '../../src/app/apiConfig';

const JOURNALPOST_ID = jpPILS301.journalpostId;
const SØKER_ID = jpPILS301.norskIdent;
const PLEIETRENGENDES_ID = fagsaker[5].pleietrengende!.identitetsnummer;
const ANNEN_PLEIETRENGENDES_ID = '24420167210';
const SAK_ID = fagsaker[5].fagsakId;
const ANNEN_SAK_ID = fagsaker[6].fagsakId;
const ANNEN_JOURNALPOST_ID = '930398';
const MANUELL_SØKNAD_ID = 'pls-manual-create-930301';
const MOTTAKELSESDATO = '12.10.2020';
const SØKNADSPERIODE = '08.11.2021 - 11.11.2021';
const ROOT_PATH = `/journalpost/${JOURNALPOST_ID}/pleiepenger-i-livets-sluttfase`;

type Application = Omit<
    typeof pilsSoknad,
    'soeknadId' | 'soekerId' | 'journalposter' | 'mottattDato' | 'soeknadsperiode' | 'pleietrengende' | 'k9saksnummer'
> & {
    soeknadId: string;
    soekerId: string;
    journalposter: string[];
    mottattDato: string;
    soeknadsperiode: { fom: string; tom: string }[];
    pleietrengende: { norskIdent: string; foedselsdato: null };
    k9saksnummer: string;
};

type ApplicationRequest = {
    method: string;
    path: string;
    applicantId?: string;
    body?: unknown;
};

const isApiResponse = (response: Response, method: string, path: string) =>
    response.request().method() === method && new URL(response.url()).pathname === path;

const applicationPath = (applicationId: string) => ApiPath.PLS_SOKNAD_GET.replace('{id}', applicationId);

const observeApplicationRequests = (page: Page) => {
    const requests: ApplicationRequest[] = [];
    const formPathPrefix = ApiPath.PLS_SOKNAD_GET.split('{id}')[0];
    const trackedPaths = new Set([
        ApiPath.PLS_EKSISTERENDE_SOKNADER_FIND,
        ApiPath.PLS_SOKNAD_CREATE,
        ApiPath.PLS_SOKNAD_VALIDER,
        ApiPath.PLS_SOKNAD_SUBMIT,
    ]);

    page.on('request', (request) => {
        const path = new URL(request.url()).pathname;
        if (trackedPaths.has(path) || path.startsWith(formPathPrefix)) {
            requests.push({
                method: request.method(),
                path,
                ...(path === ApiPath.PLS_EKSISTERENDE_SOKNADER_FIND
                    ? { applicantId: request.headers()['x-nav-norskident'] }
                    : {}),
                ...(request.method() === 'POST' ? { body: request.postDataJSON() } : {}),
            });
        }
    });

    return requests;
};

const createApplication = (
    applicationId: string,
    journalpostId: string,
    caseId = SAK_ID,
    childId = PLEIETRENGENDES_ID,
): Application => ({
    ...pilsSoknad,
    soeknadId: applicationId,
    soekerId: SØKER_ID,
    mottattDato: '2020-10-12',
    pleietrengende: { ...pilsSoknad.pleietrengende, norskIdent: childId },
    journalposter: [journalpostId],
    soeknadsperiode: [{ fom: '2021-11-08', tom: '2021-11-11' }],
    k9saksnummer: caseId,
});

const installClassificationHandlers = async (page: Page) => {
    const classifiedJournalpost = {
        ...jpPILS301,
        erFerdigstilt: true,
        journalpostStatus: 'JOURNALFOERT',
        sak: {
            ...jpPILS301.sak,
            fagsakId: SAK_ID,
            sakstype: 'PPN',
            gyldigPeriode: fagsaker[5].gyldigPeriode,
            pleietrengendeIdent: PLEIETRENGENDES_ID,
            reservertSaksnummer: false,
        },
    };

    await page.evaluate(
        ({ journalpostPath, mottakPath, journalpostId, saksnummer, source, classified }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');

            let classificationSucceeded = false;
            msw.worker.use(
                msw.http.post(mottakPath, async ({ request }) => {
                    const body = await request.json();
                    if (!body || typeof body !== 'object' || !('journalpostId' in body)) return;
                    if (body.journalpostId !== journalpostId) return;
                    classificationSucceeded = true;
                    return msw.HttpResponse.json({ saksnummer }, { status: 200 });
                }),
                msw.http.get(journalpostPath, () =>
                    msw.HttpResponse.json(classificationSucceeded ? classified : source, {
                        status: classificationSucceeded ? 200 : 201,
                    }),
                ),
            );
        },
        {
            journalpostPath: ApiPath.JOURNALPOST_GET.replace('{journalpostId}', JOURNALPOST_ID),
            mottakPath: ApiPath.JOURNALPOST_MOTTAK,
            journalpostId: JOURNALPOST_ID,
            saksnummer: SAK_ID,
            source: jpPILS301,
            classified: classifiedJournalpost,
        },
    );
};

const reachRegistrationChoice = async (page: Page) => {
    const journalpostPath = ApiPath.JOURNALPOST_GET.replace('{journalpostId}', JOURNALPOST_ID);
    const journalpostResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', journalpostPath),
    );
    await page.goto(`/journalpost/${JOURNALPOST_ID}`);

    const journalpostResponse = await journalpostResponsePromise;
    expect(journalpostResponse.status()).toBe(201);
    expect(journalpostResponse.fromServiceWorker()).toBe(true);
    expect(await journalpostResponse.json()).toEqual(jpPILS301);

    await page.getByRole('radio', { name: 'Ja', exact: true }).check();
    await page.getByLabel('Velg fagsak').selectOption(SAK_ID);
    await installClassificationHandlers(page);

    const classifyResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'POST', ApiPath.JOURNALPOST_MOTTAK),
    );
    const refreshResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', journalpostPath),
    );
    await page.locator('[data-test-id="journalførOgFortsett"]').click();

    const dialog = page.locator('[data-test-id="klassifiserModal"]');
    await expect(dialog.getByText('Saksnummer:', { exact: true })).toBeVisible();
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
        saksnummer: SAK_ID,
    });

    const refreshResponse = await refreshResponsePromise;
    expect(refreshResponse.status()).toBe(200);
    expect(refreshResponse.fromServiceWorker()).toBe(true);
    expect(await refreshResponse.json()).toMatchObject({
        journalpostId: JOURNALPOST_ID,
        norskIdent: SØKER_ID,
        erFerdigstilt: true,
        sak: {
            fagsakId: SAK_ID,
            sakstype: 'PPN',
            pleietrengendeIdent: PLEIETRENGENDES_ID,
        },
    });

    await expect(page).toHaveURL((url) => url.pathname === `${ROOT_PATH}/`);
    const registrationChoice = page.getByRole('radio', {
        name: 'Registrere opplysninger til k9-sak',
        exact: true,
    });
    await registrationChoice.check();
    const confirmButton = page.getByRole('button', { name: 'Bekreft', exact: true });
    await expect(confirmButton).toBeEnabled();
    return confirmButton;
};

const installListAndFormResponses = async (
    page: Page,
    applications: Application[],
    formApplications: Application[],
    createdApplicationId?: string,
) => {
    await page.evaluate(
        ({ lookupPath, createPath, formPathPrefix, listApplications, formResponses, createdId, applicantId }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');

            const handlers = [
                msw.http.get(lookupPath, () =>
                    msw.HttpResponse.json({
                        søker: applicantId,
                        fagsakTypeKode: 'PPN',
                        søknader: listApplications,
                    }),
                ),
                ...formResponses.map((application) =>
                    msw.http.get(`${formPathPrefix}${application.soeknadId}`, () =>
                        msw.HttpResponse.json(application),
                    ),
                ),
            ];

            if (createdId) {
                handlers.push(
                    msw.http.post(createPath, () =>
                        msw.HttpResponse.json({ soeknadId: createdId }, { status: 201 }),
                    ),
                );
            }

            msw.worker.use(...handlers);
        },
        {
            lookupPath: ApiPath.PLS_EKSISTERENDE_SOKNADER_FIND,
            createPath: ApiPath.PLS_SOKNAD_CREATE,
            formPathPrefix: ApiPath.PLS_SOKNAD_GET.split('{id}')[0],
            listApplications: applications,
            formResponses: formApplications,
            createdId: createdApplicationId,
            applicantId: SØKER_ID,
        },
    );
};

const expectListResponse = async (responsePromise: Promise<Response>, applications: Application[]) => {
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    expect(response.fromServiceWorker()).toBe(true);
    expect(response.request().method()).toBe('GET');
    expect(new URL(response.url()).pathname).toBe(ApiPath.PLS_EKSISTERENDE_SOKNADER_FIND);
    expect(response.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(await response.json()).toEqual({
        søker: SØKER_ID,
        fagsakTypeKode: 'PPN',
        søknader: applications,
    });
};

const expectJournalpostPanel = async (page: Page) => {
    const panel = page.locator('.journalpostpanel');
    for (const [label, value] of [
        ['Journalpostnummer:', JOURNALPOST_ID],
        ['Søkers ID:', SØKER_ID],
        ['Sakstype:', 'Pleiepenger i livets sluttfase'],
        ['Pleietrengendes ID:', PLEIETRENGENDES_ID],
        ['Saksnummer:', SAK_ID],
    ]) {
        const field = panel.getByText(label, { exact: true });
        await expect(field).toBeVisible();
        await expect(field.locator('..').getByText(value, { exact: true })).toBeVisible();
    }
};

const expectVisibleForm = async (page: Page, applicationId: string) => {
    await expect(page).toHaveURL((url) => url.pathname === `${ROOT_PATH}/skjema/${applicationId}/`);
    await expect(page.locator('[data-test-id="PILSPunchForm"]')).toBeVisible();
    await expect(page.getByLabel('Mottatt dato:')).toHaveValue(MOTTAKELSESDATO);
    await expect(page.getByLabel(/Mottatt klokkeslett/)).toHaveValue('12:53');
};

const expectNoListStageWrites = (requests: ApplicationRequest[]) => {
    const writePaths = new Set([
        ApiPath.PLS_SOKNAD_CREATE,
        ApiPath.PLS_SOKNAD_VALIDER,
        ApiPath.PLS_SOKNAD_SUBMIT,
    ]);
    expect(requests.filter(({ method, path }) => method === 'POST' && writePaths.has(path))).toEqual([]);
};

const expectNoValidationOrSubmission = (requests: ApplicationRequest[]) => {
    const paths = new Set([ApiPath.PLS_SOKNAD_VALIDER, ApiPath.PLS_SOKNAD_SUBMIT]);
    expect(requests.filter(({ method, path }) => method === 'POST' && paths.has(path))).toEqual([]);
};

test('viser eksisterende PLS-søknader, avbryter og fortsetter på en kompatibel søknad', async ({ page }) => {
    const requests = observeApplicationRequests(page);
    const compatible = createApplication('pls-resume-compatible-930301', JOURNALPOST_ID);
    const differentCase = createApplication(
        'pls-resume-different-case-930301',
        ANNEN_JOURNALPOST_ID,
        ANNEN_SAK_ID,
    );
    const differentChild = createApplication(
        'pls-resume-different-child-930301',
        ANNEN_JOURNALPOST_ID,
        SAK_ID,
        ANNEN_PLEIETRENGENDES_ID,
    );
    const applications = [compatible, differentCase, differentChild];
    const confirmButton = await reachRegistrationChoice(page);
    await installListAndFormResponses(page, applications, [compatible]);

    const listResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', ApiPath.PLS_EKSISTERENDE_SOKNADER_FIND),
    );
    await confirmButton.click();
    await expectListResponse(listResponsePromise, applications);
    await expectJournalpostPanel(page);

    const table = page.getByRole('table');
    const rows = table.getByRole('row');
    await expect(rows).toHaveCount(4);
    const compatibleRow = rows.nth(1);
    await expect(compatibleRow.getByRole('cell').nth(0)).toHaveText(MOTTAKELSESDATO);
    await expect(compatibleRow.getByRole('cell').nth(1)).toHaveText(PLEIETRENGENDES_ID);
    await expect(compatibleRow.getByRole('cell').nth(3)).toHaveText(JOURNALPOST_ID);
    await expect(compatibleRow.getByRole('cell').nth(4)).toHaveText(SAK_ID);
    await expect(compatibleRow.getByRole('cell').nth(5)).toHaveText(SØKNADSPERIODE);
    await expect(compatibleRow.getByRole('button', { name: 'Fortsett', exact: true })).toBeEnabled();

    const differentCaseRow = rows.nth(2);
    await expect(differentCaseRow.getByRole('cell').nth(4)).toHaveText(ANNEN_SAK_ID);
    await expect(differentCaseRow.getByRole('button', { name: 'Fortsett', exact: true })).toBeDisabled();
    const differentChildRow = rows.nth(3);
    await expect(differentChildRow.getByRole('cell').nth(1)).toHaveText(ANNEN_PLEIETRENGENDES_ID);
    await expect(differentChildRow.getByRole('button', { name: 'Fortsett', exact: true })).toBeDisabled();
    await expect(page.getByRole('button', { name: /start ny registrering/i })).toHaveCount(0);

    const confirmation = page.getByTestId('erdusikkermodal');
    await compatibleRow.getByRole('button', { name: 'Fortsett', exact: true }).click();
    await expect(confirmation).toBeVisible();
    await confirmation.getByRole('button', { name: 'Avbryt', exact: true }).click();
    await expect(confirmation).toBeHidden();
    await expect(table).toBeVisible();
    expect(
        requests.filter(({ method, path }) => method === 'GET' && path === applicationPath(compatible.soeknadId)),
    ).toEqual([]);
    expectNoListStageWrites(requests);

    await compatibleRow.getByRole('button', { name: 'Fortsett', exact: true }).click();
    const applicationResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', applicationPath(compatible.soeknadId)),
    );
    await confirmation.getByRole('button', { name: 'Fortsett', exact: true }).click();
    const applicationResponse = await applicationResponsePromise;
    expect(applicationResponse.status()).toBe(200);
    expect(applicationResponse.fromServiceWorker()).toBe(true);
    expect(applicationResponse.request().method()).toBe('GET');
    expect(new URL(applicationResponse.url()).pathname).toBe(applicationPath(compatible.soeknadId));
    expect(await applicationResponse.json()).toEqual(compatible);
    await expectVisibleForm(page, compatible.soeknadId);
    expect(requests.filter(({ method, path }) => method === 'POST' && path === ApiPath.PLS_SOKNAD_CREATE)).toEqual(
        [],
    );
    expectNoValidationOrSubmission(requests);
});

test('starter manuell PLS-registrering fra en liste med eksisterende søknader', async ({ page }) => {
    const requests = observeApplicationRequests(page);
    const existing = createApplication('pls-manual-existing-930301', ANNEN_JOURNALPOST_ID);
    const created = createApplication(MANUELL_SØKNAD_ID, JOURNALPOST_ID);
    const applications = [existing];
    const confirmButton = await reachRegistrationChoice(page);
    await installListAndFormResponses(page, applications, [created], MANUELL_SØKNAD_ID);

    const listResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', ApiPath.PLS_EKSISTERENDE_SOKNADER_FIND),
    );
    await confirmButton.click();
    await expectListResponse(listResponsePromise, applications);
    await expectJournalpostPanel(page);

    expect(requests.filter(({ method, path }) => method === 'POST' && path === ApiPath.PLS_SOKNAD_CREATE)).toEqual(
        [],
    );
    const startNewButton = page.getByRole('button', { name: /start ny registrering/i });
    await expect(startNewButton).toBeEnabled();
    const createResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'POST', ApiPath.PLS_SOKNAD_CREATE),
    );
    const applicationResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', applicationPath(MANUELL_SØKNAD_ID)),
    );
    await startNewButton.click();

    const createResponse = await createResponsePromise;
    expect(createResponse.status()).toBe(201);
    expect(createResponse.fromServiceWorker()).toBe(true);
    expect(createResponse.request().method()).toBe('POST');
    expect(new URL(createResponse.url()).pathname).toBe(ApiPath.PLS_SOKNAD_CREATE);
    expect(createResponse.request().postDataJSON()).toEqual({
        journalpostId: JOURNALPOST_ID,
        norskIdent: SØKER_ID,
        pleietrengendeIdent: PLEIETRENGENDES_ID,
        k9saksnummer: SAK_ID,
    });
    expect(await createResponse.json()).toEqual({ soeknadId: MANUELL_SØKNAD_ID });

    const applicationResponse = await applicationResponsePromise;
    expect(applicationResponse.status()).toBe(200);
    expect(applicationResponse.fromServiceWorker()).toBe(true);
    expect(applicationResponse.request().method()).toBe('GET');
    expect(new URL(applicationResponse.url()).pathname).toBe(applicationPath(MANUELL_SØKNAD_ID));
    expect(await applicationResponse.json()).toEqual(created);
    await expectVisibleForm(page, MANUELL_SØKNAD_ID);

    expect(requests.filter(({ method, path }) => method === 'POST' && path === ApiPath.PLS_SOKNAD_CREATE)).toHaveLength(
        1,
    );
    expectNoValidationOrSubmission(requests);
});

test('går tilbake fra PLS-søknadslisten uten å opprette en søknad', async ({ page }) => {
    const requests = observeApplicationRequests(page);
    const existing = createApplication('pls-back-existing-930301', ANNEN_JOURNALPOST_ID);
    const applications = [existing];
    const confirmButton = await reachRegistrationChoice(page);
    await installListAndFormResponses(page, applications, []);

    const listResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', ApiPath.PLS_EKSISTERENDE_SOKNADER_FIND),
    );
    await confirmButton.click();
    await expectListResponse(listResponsePromise, applications);
    await expectJournalpostPanel(page);
    expectNoListStageWrites(requests);

    await page.getByRole('button', { name: 'Tilbake', exact: true }).click();
    await expect(page).toHaveURL((url) => url.pathname === `${ROOT_PATH}/`);
    await expectJournalpostPanel(page);
    expectNoListStageWrites(requests);
    expect(requests.filter(({ method, path }) => method === 'GET' && path.startsWith(ApiPath.PLS_SOKNAD_GET.split('{id}')[0]))).toEqual(
        [],
    );
});
