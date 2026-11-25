import { expect, test, type Page, type Response } from '@playwright/test';

import fagsaker from '../../src/mocks/fixtures/fagsaker.json' with { type: 'json' };
import jpOMPMA304 from '../../src/mocks/fixtures/jpOMPMA304.json' with { type: 'json' };
import { ApiPath } from '../../src/app/apiConfig';

const JOURNALPOST_ID = jpOMPMA304.journalpostId;
const SØKER_ID = jpOMPMA304.norskIdent;
const ANNEN_PART_ID = fagsaker[18].relatertPerson!.identitetsnummer;
const ANNEN_PART_AVVIK_ID = '07827599802';
const ANNEN_JOURNALPOST_ID = '930304';
const SAK_ID = fagsaker[18].fagsakId;
const ANNEN_SAK_ID = fagsaker[19].fagsakId;
const MANUELL_SØKNAD_ID = 'ompma-manual-create-930304';
const TOM_MAPPE_SØKNAD_ID = 'ompma-empty-create-930304';
const MOTTAKELSESDATO = '12.10.2020';
const FRA_DATO = '03.05.2023';
const TIL_DATO = '18.05.2023';
const ROOT_PATH = `/journalpost/${JOURNALPOST_ID}/omsorgspenger-midlertidig-alene`;

type Application = {
    soeknadId: string;
    soekerId: string;
    mottattDato: string;
    klokkeslett: string;
    barn: { norskIdent: string; foedselsdato: string | null }[];
    annenForelder: {
        norskIdent: string;
        situasjonType: string | null;
        situasjonBeskrivelse: string | null;
        periode: { fom: string | null; tom: string | null } | null;
    };
    journalposter: string[];
    k9saksnummer: string;
    harInfoSomIkkeKanPunsjes: boolean | null;
    harMedisinskeOpplysninger: boolean | null;
    metadata: null;
};

type ApplicationRequest = {
    method: string;
    path: string;
    applicantId?: string;
    body?: unknown;
};

type NetworkEvent = {
    kind: 'request' | 'response';
    method: string;
    path: string;
    status?: number;
};

const isApiResponse = (response: Response, method: string, path: string) =>
    response.request().method() === method && new URL(response.url()).pathname === path;

const applicationPath = (applicationId: string) => ApiPath.OMP_MA_SOKNAD_GET.replace('{id}', applicationId);

const observeApplicationRequests = (page: Page) => {
    const requests: ApplicationRequest[] = [];
    const formPathPrefix = ApiPath.OMP_MA_SOKNAD_GET.split('{id}')[0];
    const trackedPaths = new Set([
        ApiPath.OMP_MA_EKSISTERENDE_SOKNADER_FIND,
        ApiPath.OMP_MA_SOKNAD_CREATE,
        ApiPath.OMP_MA_SOKNAD_UPDATE,
        ApiPath.OMP_MA_SOKNAD_VALIDER,
        ApiPath.OMP_MA_SOKNAD_SUBMIT,
    ]);

    page.on('request', (request) => {
        const path = new URL(request.url()).pathname;
        if (trackedPaths.has(path) || path.startsWith(formPathPrefix)) {
            const applicantId = request.headers()['x-nav-norskident'];
            requests.push({
                method: request.method(),
                path,
                ...(applicantId ? { applicantId } : {}),
                ...(request.method() === 'POST' || request.method() === 'PUT'
                    ? { body: request.postDataJSON() }
                    : {}),
            });
        }
    });

    return requests;
};

const observeNetworkEvents = (page: Page) => {
    const events: NetworkEvent[] = [];
    const observedPaths = new Set([
        ApiPath.OMP_MA_EKSISTERENDE_SOKNADER_FIND,
        ApiPath.OMP_MA_SOKNAD_CREATE,
    ]);

    page.on('request', (request) => {
        const path = new URL(request.url()).pathname;
        if (observedPaths.has(path)) events.push({ kind: 'request', method: request.method(), path });
    });
    page.on('response', (response) => {
        const path = new URL(response.url()).pathname;
        if (observedPaths.has(path)) {
            events.push({
                kind: 'response',
                method: response.request().method(),
                path,
                status: response.status(),
            });
        }
    });

    return events;
};

const createApplication = (
    applicationId: string,
    journalpostId: string,
    caseId = SAK_ID,
    otherParentId = ANNEN_PART_ID,
    isDraft = false,
): Application => ({
    soeknadId: applicationId,
    soekerId: SØKER_ID,
    mottattDato: '2020-10-12',
    klokkeslett: '12:53',
    barn: [],
    annenForelder: {
        norskIdent: otherParentId,
        situasjonType: isDraft ? null : 'SYKDOM',
        situasjonBeskrivelse: isDraft ? null : 'Midlertidig alvorlig sykdom',
        periode: isDraft ? null : { fom: '2023-05-03', tom: '2023-05-18' },
    },
    journalposter: [journalpostId],
    k9saksnummer: caseId,
    harInfoSomIkkeKanPunsjes: isDraft ? null : false,
    harMedisinskeOpplysninger: isDraft ? null : false,
    metadata: null,
});

const openJournalpost = async (page: Page) => {
    const path = ApiPath.JOURNALPOST_GET.replace('{journalpostId}', JOURNALPOST_ID);
    const responsePromise = page.waitForResponse((response) => isApiResponse(response, 'GET', path));
    await page.goto(`/journalpost/${JOURNALPOST_ID}`);

    const response = await responsePromise;
    expect(response.status()).toBe(201);
    expect(response.fromServiceWorker()).toBe(true);
    expect(await response.json()).toEqual(jpOMPMA304);
};

const installClassificationHandlers = async (page: Page) => {
    const classifiedJournalpost = {
        ...jpOMPMA304,
        erFerdigstilt: true,
        journalpostStatus: 'JOURNALFOERT',
        sak: {
            ...jpOMPMA304.sak,
            fagsakId: SAK_ID,
            sakstype: 'OMP_MA',
            relatertPersonIdent: ANNEN_PART_ID,
            reservertSaksnummer: false,
        },
    };

    await page.evaluate(
        ({ journalpostPath, mottakPath, source, classified, saksnummer }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');

            let classificationSucceeded = false;
            msw.worker.use(
                msw.http.post(mottakPath, async ({ request }) => {
                    const body = await request.json();
                    if (!body || typeof body !== 'object' || !('journalpostId' in body)) return;
                    if (body.journalpostId !== source.journalpostId) return;
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
            source: jpOMPMA304,
            classified: classifiedJournalpost,
            saksnummer: SAK_ID,
        },
    );
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
    expect(classifyResponse.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(classifyResponse.request().postDataJSON()).toMatchObject({
        journalpostId: JOURNALPOST_ID,
        brukerIdent: SØKER_ID,
        relatertPersonIdent: ANNEN_PART_ID,
        fagsakYtelseTypeKode: 'OMP_MA',
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
            sakstype: 'OMP_MA',
            relatertPersonIdent: ANNEN_PART_ID,
        },
    });

    await expect(page).toHaveURL((url) => url.pathname === `${ROOT_PATH}/`);
    const registrationChoice = page.getByRole('radio', {
        name: 'Registrer søknad - ekstra omsorgsdager',
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
    createdApplication?: Application,
) => {
    await page.evaluate(
        ({ lookupPath, createPath, formPathPrefix, listApplications, formResponses, created, applicantId }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');

            const handlers = [
                msw.http.get(lookupPath, () =>
                    msw.HttpResponse.json({
                        søker: applicantId,
                        fagsakTypeKode: 'OMP_MA',
                        søknader: listApplications,
                    }),
                ),
                msw.http.get(`${formPathPrefix}:id`, ({ params }) => {
                    const application = formResponses.find((item) => item.soeknadId === String(params.id));
                    if (!application) return;
                    return msw.HttpResponse.json(application);
                }),
            ];

            if (created) {
                handlers.push(
                    msw.http.post(createPath, () => msw.HttpResponse.json(created, { status: 201 })),
                );
            }

            msw.worker.use(...handlers);
        },
        {
            lookupPath: ApiPath.OMP_MA_EKSISTERENDE_SOKNADER_FIND,
            createPath: ApiPath.OMP_MA_SOKNAD_CREATE,
            formPathPrefix: ApiPath.OMP_MA_SOKNAD_GET.split('{id}')[0],
            listApplications: applications,
            formResponses: formApplications,
            created: createdApplication,
            applicantId: SØKER_ID,
        },
    );
};

const expectListResponse = async (responsePromise: Promise<Response>, applications: Application[]) => {
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    expect(response.fromServiceWorker()).toBe(true);
    expect(response.request().method()).toBe('GET');
    expect(new URL(response.url()).pathname).toBe(ApiPath.OMP_MA_EKSISTERENDE_SOKNADER_FIND);
    expect(response.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(await response.json()).toEqual({
        søker: SØKER_ID,
        fagsakTypeKode: 'OMP_MA',
        søknader: applications,
    });
};

const expectApplicationResponse = async (responsePromise: Promise<Response>, application: Application) => {
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    expect(response.fromServiceWorker()).toBe(true);
    expect(response.request().method()).toBe('GET');
    expect(new URL(response.url()).pathname).toBe(applicationPath(application.soeknadId));
    expect(await response.json()).toEqual(application);
};

const expectJournalpostPanel = async (page: Page) => {
    const panel = page.locator('.journalpostpanel');
    for (const [label, value] of [
        ['Journalpostnummer:', JOURNALPOST_ID],
        ['Søkers ID:', SØKER_ID],
        ['Annen part ID:', ANNEN_PART_ID],
        ['Saksnummer:', SAK_ID],
    ]) {
        const field = panel.getByText(label, { exact: true });
        await expect(field).toBeVisible();
        await expect(field.locator('..').getByText(value, { exact: true })).toBeVisible();
    }
};

const expectVisibleForm = async (page: Page, application: Application) => {
    await expect(page).toHaveURL(
        (url) => url.pathname === `${ROOT_PATH}/skjema/${application.soeknadId}/`,
    );
    await expect(page.getByLabel('Mottatt dato:')).toHaveValue(MOTTAKELSESDATO);
    await expect(page.getByLabel('Mottatt klokkeslett')).toHaveValue('12:53');
    const otherParentSection = page.getByRole('heading', { name: 'Annen forelder', exact: true }).locator('..');
    await expect(otherParentSection.getByText(application.annenForelder.norskIdent, { exact: true })).toBeVisible();

    if (application.annenForelder.situasjonType) {
        await expect(page.getByLabel('Hva er situasjonen til den andre forelderen?')).toHaveValue(
            application.annenForelder.situasjonType,
        );
        await expect(page.getByLabel('Beskrivelse av situasjonen')).toHaveValue(
            application.annenForelder.situasjonBeskrivelse!,
        );
        await expect(page.getByLabel('Fra og med', { exact: true })).toHaveValue(FRA_DATO);
        await expect(page.getByLabel('Til og med', { exact: true })).toHaveValue(TIL_DATO);
    }
};

const expectNoListStageWrites = (requests: ApplicationRequest[]) => {
    const writePaths = new Set([
        ApiPath.OMP_MA_SOKNAD_CREATE,
        ApiPath.OMP_MA_SOKNAD_UPDATE,
        ApiPath.OMP_MA_SOKNAD_VALIDER,
        ApiPath.OMP_MA_SOKNAD_SUBMIT,
    ]);
    expect(
        requests.filter(({ method, path }) => (method === 'POST' || method === 'PUT') && writePaths.has(path)),
    ).toEqual([]);
};

const expectNoDraftGet = (requests: ApplicationRequest[]) => {
    const draftPathPrefix = ApiPath.OMP_MA_SOKNAD_GET.split('{id}')[0];
    expect(
        requests.filter(({ method, path }) => method === 'GET' && path.startsWith(draftPathPrefix)),
    ).toEqual([]);
};

const expectNoValidationOrSubmission = (requests: ApplicationRequest[]) => {
    const paths = new Set([ApiPath.OMP_MA_SOKNAD_VALIDER, ApiPath.OMP_MA_SOKNAD_SUBMIT]);
    expect(requests.filter(({ method, path }) => method === 'POST' && paths.has(path))).toEqual([]);
};

test('viser eksisterende OMPMA-søknader, avbryter og fortsetter på en kompatibel søknad', async ({ page }) => {
    const requests = observeApplicationRequests(page);
    const compatible = createApplication('ompma-resume-compatible-930304', JOURNALPOST_ID);
    const differentCase = createApplication(
        'ompma-resume-different-case-930304',
        ANNEN_JOURNALPOST_ID,
        ANNEN_SAK_ID,
    );
    const differentOtherParent = createApplication(
        'ompma-resume-different-parent-930304',
        ANNEN_JOURNALPOST_ID,
        SAK_ID,
        ANNEN_PART_AVVIK_ID,
    );
    const applications = [compatible, differentCase, differentOtherParent];
    const confirmButton = await reachRegistrationChoice(page);
    await installListAndFormResponses(page, applications, [compatible]);

    const listResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', ApiPath.OMP_MA_EKSISTERENDE_SOKNADER_FIND),
    );
    await confirmButton.click();
    await expectListResponse(listResponsePromise, applications);
    await expectJournalpostPanel(page);

    const table = page.getByRole('table');
    const rows = table.getByRole('row');
    await expect(rows).toHaveCount(4);
    const compatibleRow = rows.nth(1);
    await expect(compatibleRow.getByRole('cell').nth(0)).toHaveText(MOTTAKELSESDATO);
    await expect(compatibleRow.getByRole('cell').nth(1)).toHaveText(ANNEN_PART_ID);
    await expect(compatibleRow.getByRole('cell').nth(3)).toHaveText(JOURNALPOST_ID);
    await expect(compatibleRow.getByRole('cell').nth(4)).toHaveText(SAK_ID);
    await expect(compatibleRow.getByRole('cell').nth(5)).toContainText(FRA_DATO);
    await expect(compatibleRow.getByRole('cell').nth(5)).toContainText(TIL_DATO);
    await expect(compatibleRow.getByRole('button', { name: 'Fortsett', exact: true })).toBeEnabled();

    const differentCaseRow = rows.nth(2);
    await expect(differentCaseRow.getByRole('cell').nth(4)).toHaveText(ANNEN_SAK_ID);
    await expect(differentCaseRow.getByRole('button', { name: 'Fortsett', exact: true })).toBeDisabled();
    const differentOtherParentRow = rows.nth(3);
    await expect(differentOtherParentRow.getByRole('cell').nth(1)).toHaveText(ANNEN_PART_AVVIK_ID);
    await expect(differentOtherParentRow.getByRole('button', { name: 'Fortsett', exact: true })).toBeDisabled();
    await expect(page.getByRole('button', { name: /start ny registrering/i })).toHaveCount(0);

    const confirmation = page.getByTestId('erdusikkermodal');
    await compatibleRow.getByRole('button', { name: 'Fortsett', exact: true }).click();
    await expect(confirmation).toBeVisible();
    await confirmation.getByRole('button', { name: 'Avbryt', exact: true }).click();
    await expect(confirmation).toBeHidden();
    await expect(table).toBeVisible();
    expectNoDraftGet(requests);
    expectNoListStageWrites(requests);

    await compatibleRow.getByRole('button', { name: 'Fortsett', exact: true }).click();
    const applicationResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', applicationPath(compatible.soeknadId)),
    );
    await confirmation.getByRole('button', { name: 'Fortsett', exact: true }).click();
    await expectApplicationResponse(applicationResponsePromise, compatible);
    await expectVisibleForm(page, compatible);
    expect(requests.filter(({ method, path }) => method === 'POST' && path === ApiPath.OMP_MA_SOKNAD_CREATE)).toEqual(
        [],
    );
    expectNoValidationOrSubmission(requests);
});

test('starter manuell OMPMA-registrering fra en liste med eksisterende søknader', async ({ page }) => {
    const requests = observeApplicationRequests(page);
    const existing = createApplication('ompma-manual-existing-930304', ANNEN_JOURNALPOST_ID);
    const created = createApplication(MANUELL_SØKNAD_ID, JOURNALPOST_ID, SAK_ID, ANNEN_PART_ID, true);
    const confirmButton = await reachRegistrationChoice(page);
    await installListAndFormResponses(page, [existing], [created], created);

    const listResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', ApiPath.OMP_MA_EKSISTERENDE_SOKNADER_FIND),
    );
    await confirmButton.click();
    await expectListResponse(listResponsePromise, [existing]);
    await expectJournalpostPanel(page);

    const createPath = ApiPath.OMP_MA_SOKNAD_CREATE;
    expect(requests.filter(({ method, path }) => method === 'POST' && path === createPath)).toEqual([]);
    const startNewButton = page.getByRole('button', { name: /start ny registrering/i });
    await expect(startNewButton).toBeEnabled();

    const createResponsePromise = page.waitForResponse((response) => isApiResponse(response, 'POST', createPath));
    const applicationResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', applicationPath(MANUELL_SØKNAD_ID)),
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
        annenPart: ANNEN_PART_ID,
        barn: [],
        k9saksnummer: SAK_ID,
    });
    expect(await createResponse.json()).toEqual(created);

    await expectApplicationResponse(applicationResponsePromise, created);
    await expectVisibleForm(page, created);
    expect(requests.filter(({ method, path }) => method === 'POST' && path === createPath)).toHaveLength(1);
    expectNoValidationOrSubmission(requests);
});

test('går tilbake fra OMPMA-søknadslisten uten å opprette en søknad', async ({ page }) => {
    const requests = observeApplicationRequests(page);
    const existing = createApplication('ompma-back-existing-930304', ANNEN_JOURNALPOST_ID);
    const confirmButton = await reachRegistrationChoice(page);
    await installListAndFormResponses(page, [existing], []);

    const listResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', ApiPath.OMP_MA_EKSISTERENDE_SOKNADER_FIND),
    );
    await confirmButton.click();
    await expectListResponse(listResponsePromise, [existing]);
    await expectJournalpostPanel(page);
    expectNoListStageWrites(requests);

    await page.getByRole('button', { name: 'Tilbake', exact: true }).click();
    await expect(page).toHaveURL((url) => url.pathname === `${ROOT_PATH}/`);
    await expect(page.getByRole('radio', { name: 'Registrer søknad - ekstra omsorgsdager' })).toBeChecked();
    await expectJournalpostPanel(page);
    expectNoListStageWrites(requests);
    expectNoDraftGet(requests);
});

test('oppretter OMPMA-søknad automatisk når listen er tom', async ({ page }) => {
    const requests = observeApplicationRequests(page);
    const events = observeNetworkEvents(page);
    const created = createApplication(TOM_MAPPE_SØKNAD_ID, JOURNALPOST_ID, SAK_ID, ANNEN_PART_ID, true);
    const confirmButton = await reachRegistrationChoice(page);
    await installListAndFormResponses(page, [], [created], created);

    const listResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', ApiPath.OMP_MA_EKSISTERENDE_SOKNADER_FIND),
    );
    const createResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'POST', ApiPath.OMP_MA_SOKNAD_CREATE),
    );
    const applicationResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', applicationPath(TOM_MAPPE_SØKNAD_ID)),
    );
    await confirmButton.click();

    await expectListResponse(listResponsePromise, []);
    const createResponse = await createResponsePromise;
    expect(createResponse.status()).toBe(201);
    expect(createResponse.fromServiceWorker()).toBe(true);
    expect(createResponse.request().method()).toBe('POST');
    expect(new URL(createResponse.url()).pathname).toBe(ApiPath.OMP_MA_SOKNAD_CREATE);
    expect(createResponse.request().postDataJSON()).toEqual({
        journalpostId: JOURNALPOST_ID,
        norskIdent: SØKER_ID,
        annenPart: ANNEN_PART_ID,
        barn: [],
        k9saksnummer: SAK_ID,
    });
    expect(await createResponse.json()).toEqual(created);

    await expectApplicationResponse(applicationResponsePromise, created);
    await expectVisibleForm(page, created);
    const listSuccessIndex = events.findIndex(
        ({ kind, method, path, status }) =>
            kind === 'response' &&
            method === 'GET' &&
            path === ApiPath.OMP_MA_EKSISTERENDE_SOKNADER_FIND &&
            status === 200,
    );
    const createRequestIndex = events.findIndex(
        ({ kind, method, path }) =>
            kind === 'request' && method === 'POST' && path === ApiPath.OMP_MA_SOKNAD_CREATE,
    );
    expect(listSuccessIndex).toBeGreaterThanOrEqual(0);
    expect(createRequestIndex).toBeGreaterThan(listSuccessIndex);
    expect(requests.filter(({ method, path }) => method === 'POST' && path === ApiPath.OMP_MA_SOKNAD_CREATE)).toHaveLength(
        1,
    );
    expectNoValidationOrSubmission(requests);
});
