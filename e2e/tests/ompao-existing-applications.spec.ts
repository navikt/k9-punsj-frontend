import { expect, test, type Page, type Response } from '@playwright/test';

import fagsaker from '../../src/mocks/fixtures/fagsaker.json' with { type: 'json' };
import jpOMPAO303 from '../../src/mocks/fixtures/jpOMPAO303.json' with { type: 'json' };
import { ApiPath } from '../../src/app/apiConfig';

const JOURNALPOST_ID = jpOMPAO303.journalpostId;
const SØKER_ID = jpOMPAO303.norskIdent;
const BARN_ID = '24420167209';
const ANNEN_JOURNALPOST_ID = '200';
const ANNEN_BARN_ID = '24420167210';
const SAK_ID = fagsaker[15].fagsakId;
const ANNEN_SAK_ID = fagsaker[14].fagsakId;
const SØKNAD_ID = '9356c863-ab88-41eb-89ec-3ca8cd555537';
const MOTTAKELSESDATO = '12.10.2020';
const OPPSTARTSDATO = '01.06.2023';
const ROOT_PATH = `/journalpost/${JOURNALPOST_ID}/omsorgspenger-alene-om-omsorgen`;

type Application = {
    soeknadId: string;
    soekerId: string;
    mottattDato: string;
    klokkeslett: string;
    barn: { norskIdent: string; foedselsdato: string | null };
    journalposter: string[];
    k9saksnummer: string;
    periode: { fom: string | null; tom: string | null };
    metadata: { signatur: string };
    harInfoSomIkkeKanPunsjes: boolean;
    harMedisinskeOpplysninger: boolean;
};

type ApplicationRequest = {
    method: string;
    path: string;
    body?: unknown;
};

type NetworkEvent = {
    kind: 'request' | 'response';
    method: string;
    path: string;
};

const isApiResponse = (response: Response, method: string, path: string) =>
    response.request().method() === method && new URL(response.url()).pathname === path;

const applicationPath = (applicationId: string) => ApiPath.OMP_AO_SOKNAD_GET.replace('{id}', applicationId);

const observeApplicationRequests = (page: Page) => {
    const requests: ApplicationRequest[] = [];
    const formPathPrefix = ApiPath.OMP_AO_SOKNAD_GET.split('{id}')[0];
    const trackedPaths = new Set([
        ApiPath.OMP_AO_SOKNAD_CREATE,
        ApiPath.OMP_AO_SOKNAD_VALIDER,
        ApiPath.OMP_AO_SOKNAD_SUBMIT,
    ]);

    page.on('request', (request) => {
        const path = new URL(request.url()).pathname;
        if (trackedPaths.has(path) || path.startsWith(formPathPrefix)) {
            requests.push({
                method: request.method(),
                path,
                ...(request.method() === 'POST' ? { body: request.postDataJSON() } : {}),
            });
        }
    });

    return requests;
};

const observeNetworkEvents = (page: Page) => {
    const events: NetworkEvent[] = [];
    const observedPaths = new Set([
        ApiPath.OMP_AO_EKSISTERENDE_SOKNADER_FIND,
        ApiPath.OMP_AO_SOKNAD_CREATE,
    ]);

    page.on('request', (request) => {
        const path = new URL(request.url()).pathname;
        if (observedPaths.has(path)) events.push({ kind: 'request', method: request.method(), path });
    });
    page.on('response', (response) => {
        const path = new URL(response.url()).pathname;
        if (observedPaths.has(path)) {
            events.push({ kind: 'response', method: response.request().method(), path });
        }
    });

    return events;
};

const createApplication = (
    applicationId: string,
    journalpostId: string,
    childId = BARN_ID,
    caseId = SAK_ID,
    startDate: string | null = '2023-06-01',
): Application => ({
    soeknadId: applicationId,
    soekerId: SØKER_ID,
    mottattDato: '2020-10-12',
    klokkeslett: '12:53',
    barn: { norskIdent: childId, foedselsdato: null },
    journalposter: [journalpostId],
    k9saksnummer: caseId,
    periode: { fom: startDate, tom: null },
    metadata: { signatur: '' },
    harInfoSomIkkeKanPunsjes: false,
    harMedisinskeOpplysninger: false,
});

const installClassificationHandlers = async (page: Page) => {
    const classifiedJournalpost = {
        ...jpOMPAO303,
        erFerdigstilt: true,
        journalpostStatus: 'JOURNALFOERT',
        sak: {
            ...jpOMPAO303.sak,
            fagsakId: SAK_ID,
            sakstype: 'OMP_AO',
            pleietrengendeIdent: BARN_ID,
            reservertSaksnummer: false,
        },
    };

    await page.evaluate(
        ({ journalpostPath, mottakPath, source, classifiedJournalpost: classified, saksnummer }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');

            let classificationSucceeded = false;
            msw.worker.use(
                msw.http.post(mottakPath, () => {
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
            source: jpOMPAO303,
            classifiedJournalpost,
            saksnummer: SAK_ID,
        },
    );
};

const openJournalpost = async (page: Page) => {
    const path = ApiPath.JOURNALPOST_GET.replace('{journalpostId}', JOURNALPOST_ID);
    const responsePromise = page.waitForResponse((response) => isApiResponse(response, 'GET', path));
    await page.goto(`/journalpost/${JOURNALPOST_ID}`);

    const response = await responsePromise;
    expect(response.status()).toBe(201);
    expect(response.fromServiceWorker()).toBe(true);
    expect(await response.json()).toEqual(jpOMPAO303);
};

const reachRegistrationChoice = async (page: Page) => {
    await openJournalpost(page);
    await page.getByRole('radio', { name: 'Ja', exact: true }).check();
    await page.getByLabel('Velg fagsak').selectOption(SAK_ID);
    await installClassificationHandlers(page);

    const classifyResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'POST', ApiPath.JOURNALPOST_MOTTAK),
    );
    const journalpostPath = ApiPath.JOURNALPOST_GET.replace('{journalpostId}', JOURNALPOST_ID);
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

    const refreshResponse = await refreshResponsePromise;
    expect(refreshResponse.status()).toBe(200);
    expect(refreshResponse.fromServiceWorker()).toBe(true);
    expect(await refreshResponse.json()).toMatchObject({
        journalpostId: JOURNALPOST_ID,
        norskIdent: SØKER_ID,
        erFerdigstilt: true,
        sak: {
            fagsakId: SAK_ID,
            sakstype: 'OMP_AO',
            pleietrengendeIdent: BARN_ID,
        },
    });

    await expect(page).toHaveURL((url) => url.pathname === `${ROOT_PATH}/`);
    const registrationRadio = page.getByRole('radio', {
        name: 'Registrer søknad - alene om omsorgen',
        exact: true,
    });
    await registrationRadio.check();
    const confirmButton = page.getByRole('button', { name: 'Bekreft', exact: true });
    await expect(confirmButton).toBeEnabled();
    return confirmButton;
};

const installListAndFormResponses = async (
    page: Page,
    applications: Application[],
    formApplications: Application[],
    createResponse?: Application,
) => {
    await page.evaluate(
        ({
            lookupPath,
            createPath,
            formPathPrefix,
            applications: listApplications,
            formApplications: formResponses,
            createApplication: creationResponse,
            applicantId,
        }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');

            const handlers = [
                msw.http.get(lookupPath, () =>
                    msw.HttpResponse.json({
                        søker: applicantId,
                        fagsakTypeKode: 'OMP_AO',
                        søknader: listApplications,
                    }),
                ),
                msw.http.get(`${formPathPrefix}:id`, ({ params }) => {
                    const application = formResponses.find((item) => item.soeknadId === String(params.id));
                    if (!application) return;
                    return msw.HttpResponse.json(application);
                }),
            ];

            if (creationResponse) {
                handlers.push(
                    msw.http.post(createPath, () => msw.HttpResponse.json(creationResponse, { status: 201 })),
                );
            }

            msw.worker.use(...handlers);
        },
        {
            lookupPath: ApiPath.OMP_AO_EKSISTERENDE_SOKNADER_FIND,
            createPath: ApiPath.OMP_AO_SOKNAD_CREATE,
            formPathPrefix: ApiPath.OMP_AO_SOKNAD_GET.split('{id}')[0],
            applications,
            formApplications,
            createApplication: createResponse,
            applicantId: SØKER_ID,
        },
    );
};

const expectListResponse = async (responsePromise: Promise<Response>, applications: Application[]) => {
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    expect(response.fromServiceWorker()).toBe(true);
    expect(response.request().method()).toBe('GET');
    expect(new URL(response.url()).pathname).toBe(ApiPath.OMP_AO_EKSISTERENDE_SOKNADER_FIND);
    expect(response.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(await response.json()).toEqual({
        søker: SØKER_ID,
        fagsakTypeKode: 'OMP_AO',
        søknader: applications,
    });
};

const expectApplicationResponse = async (responsePromise: Promise<Response>, application: Application) => {
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    expect(response.fromServiceWorker()).toBe(true);
    expect(response.request().method()).toBe('GET');
    expect(new URL(response.url()).pathname).toBe(applicationPath(application.soeknadId));
    expect(response.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(await response.json()).toEqual(application);
};

const expectJournalpostPanel = async (page: Page) => {
    const panel = page.locator('.journalpostpanel');
    for (const [label, value] of [
        ['Journalpostnummer:', JOURNALPOST_ID],
        ['Søkers ID:', SØKER_ID],
        ['Barnets ID:', BARN_ID],
        ['Saksnummer:', SAK_ID],
    ]) {
        const field = panel.getByText(label, { exact: true });
        await expect(field).toBeVisible();
        await expect(field.locator('..').getByText(value, { exact: true })).toBeVisible();
    }
};

const expectVisibleForm = async (page: Page, applicationId: string, startDate: string) => {
    await expect(page).toHaveURL(
        (url) =>
            url.pathname === `${ROOT_PATH}/skjema/${applicationId}/`,
    );
    await expect(page.getByTestId('mottattDato')).toHaveValue(MOTTAKELSESDATO);
    await expect(page.getByLabel('Mottatt klokkeslett')).toHaveValue('12:53');
    await expect(page.getByLabel('Søker er alene om omsorgen fra og med')).toHaveValue(startDate);
};

const expectNoListStageWrites = (requests: ApplicationRequest[]) => {
    const writePaths = new Set([
        ApiPath.OMP_AO_SOKNAD_CREATE,
        ApiPath.OMP_AO_SOKNAD_VALIDER,
        ApiPath.OMP_AO_SOKNAD_SUBMIT,
    ]);
    expect(requests.filter(({ method, path }) => method === 'POST' && writePaths.has(path))).toEqual([]);
};

const expectNoValidationOrSubmission = (requests: ApplicationRequest[]) => {
    const validationAndSubmitPaths = new Set([
        ApiPath.OMP_AO_SOKNAD_VALIDER,
        ApiPath.OMP_AO_SOKNAD_SUBMIT,
    ]);
    expect(
        requests.filter(
            ({ method, path }) => method === 'POST' && validationAndSubmitPaths.has(path),
        ),
    ).toEqual([]);
};

test('viser eksisterende OMPAO-søknader, avbryter og fortsetter på en kompatibel søknad', async ({ page }) => {
    const requests = observeApplicationRequests(page);
    const compatible = createApplication(SØKNAD_ID, JOURNALPOST_ID);
    const differentCase = createApplication('ompao-different-case-930301', ANNEN_JOURNALPOST_ID, BARN_ID, ANNEN_SAK_ID);
    const differentChild = createApplication(
        'ompao-different-child-930301',
        ANNEN_JOURNALPOST_ID,
        ANNEN_BARN_ID,
    );
    const applications = [compatible, differentCase, differentChild];
    const confirmButton = await reachRegistrationChoice(page);
    await installListAndFormResponses(page, applications, [compatible]);

    const listResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', ApiPath.OMP_AO_EKSISTERENDE_SOKNADER_FIND),
    );
    await confirmButton.click();
    await expectListResponse(listResponsePromise, applications);
    await expectJournalpostPanel(page);

    const table = page.getByRole('table');
    const rows = table.getByRole('row');
    await expect(rows).toHaveCount(4);
    const compatibleRow = rows.nth(1);
    await expect(compatibleRow.getByRole('cell').nth(0)).toHaveText(MOTTAKELSESDATO);
    await expect(compatibleRow.getByRole('cell').nth(1)).toHaveText(BARN_ID);
    await expect(compatibleRow.getByRole('cell').nth(3)).toHaveText(JOURNALPOST_ID);
    await expect(compatibleRow.getByRole('cell').nth(4)).toHaveText(SAK_ID);
    await expect(compatibleRow.getByRole('cell').nth(5)).toHaveText(OPPSTARTSDATO);
    await expect(compatibleRow.getByRole('button', { name: 'Fortsett', exact: true })).toBeEnabled();

    const differentCaseRow = rows.nth(2);
    await expect(differentCaseRow.getByRole('cell').nth(4)).toHaveText(ANNEN_SAK_ID);
    await expect(differentCaseRow.getByRole('button', { name: 'Fortsett', exact: true })).toBeDisabled();
    const differentChildRow = rows.nth(3);
    await expect(differentChildRow.getByRole('cell').nth(1)).toHaveText(ANNEN_BARN_ID);
    await expect(differentChildRow.getByRole('button', { name: 'Fortsett', exact: true })).toBeDisabled();
    await expect(page.getByRole('button', { name: /start ny registrering/i })).toHaveCount(0);

    const confirmation = page.getByTestId('erdusikkermodal');
    await compatibleRow.getByRole('button', { name: 'Fortsett', exact: true }).click();
    await expect(confirmation).toBeVisible();
    await confirmation.getByRole('button', { name: 'Avbryt', exact: true }).click();
    await expect(confirmation).toBeHidden();
    await expect(table).toBeVisible();
    expect(
        requests.filter(
            ({ method, path }) => method === 'GET' && path === applicationPath(compatible.soeknadId),
        ),
    ).toEqual([]);
    expectNoListStageWrites(requests);

    await compatibleRow.getByRole('button', { name: 'Fortsett', exact: true }).click();
    const applicationResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', applicationPath(compatible.soeknadId)),
    );
    await confirmation.getByRole('button', { name: 'Fortsett', exact: true }).click();
    await expectApplicationResponse(applicationResponsePromise, compatible);
    await expectVisibleForm(page, compatible.soeknadId, OPPSTARTSDATO);
    expect(requests.filter(({ method, path }) => method === 'POST' && path === ApiPath.OMP_AO_SOKNAD_CREATE)).toEqual(
        [],
    );
    expectNoValidationOrSubmission(requests);
});

test('starter manuell OMPAO-registrering fra en liste med eksisterende søknader', async ({ page }) => {
    const requests = observeApplicationRequests(page);
    const existing = createApplication('ompao-existing-930301', ANNEN_JOURNALPOST_ID);
    const created = createApplication(SØKNAD_ID, JOURNALPOST_ID, BARN_ID, SAK_ID, null);
    const confirmButton = await reachRegistrationChoice(page);
    await installListAndFormResponses(page, [existing], [created], created);

    const listResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', ApiPath.OMP_AO_EKSISTERENDE_SOKNADER_FIND),
    );
    await confirmButton.click();
    await expectListResponse(listResponsePromise, [existing]);
    await expectJournalpostPanel(page);

    const createPath = ApiPath.OMP_AO_SOKNAD_CREATE;
    expect(requests.filter(({ method, path }) => method === 'POST' && path === createPath)).toEqual([]);
    const startNewButton = page.getByRole('button', { name: /start ny registrering/i });
    await expect(startNewButton).toBeEnabled();

    const createResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'POST', createPath),
    );
    const applicationResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', applicationPath(SØKNAD_ID)),
    );
    await startNewButton.click();

    const createResponse = await createResponsePromise;
    expect(createResponse.status()).toBe(201);
    expect(createResponse.fromServiceWorker()).toBe(true);
    expect(createResponse.request().method()).toBe('POST');
    expect(new URL(createResponse.url()).pathname).toBe(createPath);
    expect(createResponse.request().postDataJSON()).toEqual({
        journalpostId: JOURNALPOST_ID,
        norskIdent: SØKER_ID,
        barnIdent: BARN_ID,
        k9saksnummer: SAK_ID,
    });
    expect(await createResponse.json()).toEqual(created);

    await expectApplicationResponse(applicationResponsePromise, created);
    await expectVisibleForm(page, SØKNAD_ID, '');
    expect(requests.filter(({ method, path }) => method === 'POST' && path === createPath)).toHaveLength(1);
    expectNoValidationOrSubmission(requests);
});

test('går tilbake fra OMPAO-søknadslisten uten å opprette en søknad', async ({ page }) => {
    const requests = observeApplicationRequests(page);
    const existing = createApplication('ompao-back-existing-930301', ANNEN_JOURNALPOST_ID);
    const confirmButton = await reachRegistrationChoice(page);
    await installListAndFormResponses(page, [existing], []);

    const listResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', ApiPath.OMP_AO_EKSISTERENDE_SOKNADER_FIND),
    );
    await confirmButton.click();
    await expectListResponse(listResponsePromise, [existing]);
    await expectJournalpostPanel(page);
    expectNoListStageWrites(requests);

    await page.getByRole('button', { name: 'Tilbake', exact: true }).click();
    await expect(page).toHaveURL((url) => url.pathname === `${ROOT_PATH}/`);
    await expect(page.getByRole('radio', { name: 'Registrer søknad - alene om omsorgen' })).toBeChecked();
    await expectJournalpostPanel(page);
    expectNoListStageWrites(requests);
    expect(
        requests.filter(
            ({ method, path }) => method === 'GET' && path === applicationPath(existing.soeknadId),
        ),
    ).toEqual([]);
});

test('oppretter OMPAO-søknad automatisk når listen er tom', async ({ page }) => {
    const requests = observeApplicationRequests(page);
    const events = observeNetworkEvents(page);
    const created = createApplication(SØKNAD_ID, JOURNALPOST_ID, BARN_ID, SAK_ID, null);
    const confirmButton = await reachRegistrationChoice(page);
    await installListAndFormResponses(page, [], [created], created);

    const listResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', ApiPath.OMP_AO_EKSISTERENDE_SOKNADER_FIND),
    );
    const createResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'POST', ApiPath.OMP_AO_SOKNAD_CREATE),
    );
    const applicationResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', applicationPath(SØKNAD_ID)),
    );
    await confirmButton.click();

    await expectListResponse(listResponsePromise, []);
    const createResponse = await createResponsePromise;
    expect(createResponse.status()).toBe(201);
    expect(createResponse.fromServiceWorker()).toBe(true);
    expect(createResponse.request().method()).toBe('POST');
    expect(new URL(createResponse.url()).pathname).toBe(ApiPath.OMP_AO_SOKNAD_CREATE);
    expect(createResponse.request().postDataJSON()).toEqual({
        journalpostId: JOURNALPOST_ID,
        norskIdent: SØKER_ID,
        barnIdent: BARN_ID,
        k9saksnummer: SAK_ID,
    });
    expect(await createResponse.json()).toEqual(created);

    await expectApplicationResponse(applicationResponsePromise, created);
    await expectVisibleForm(page, SØKNAD_ID, '');
    const listResponseIndex = events.findIndex(
        ({ kind, method, path }) =>
            kind === 'response' && method === 'GET' && path === ApiPath.OMP_AO_EKSISTERENDE_SOKNADER_FIND,
    );
    const createRequestIndex = events.findIndex(
        ({ kind, method, path }) =>
            kind === 'request' && method === 'POST' && path === ApiPath.OMP_AO_SOKNAD_CREATE,
    );
    expect(listResponseIndex).toBeGreaterThanOrEqual(0);
    expect(createRequestIndex).toBeGreaterThan(listResponseIndex);
    expect(requests.filter(({ method, path }) => method === 'POST' && path === ApiPath.OMP_AO_SOKNAD_CREATE)).toHaveLength(
        1,
    );
    expectNoValidationOrSubmission(requests);
});
