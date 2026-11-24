import { expect, test, type Page, type Response } from '@playwright/test';

import fagsaker from '../../cypress/fixtures/fagsaker.json' with { type: 'json' };
import jpPILS301 from '../../cypress/fixtures/jpPILS301.json' with { type: 'json' };
import olpSoknad from '../../cypress/fixtures/olp/olpSoknad.json' with { type: 'json' };
import { ApiPath } from '../../src/app/apiConfig';

const JOURNALPOST_ID = jpPILS301.journalpostId;
const ANNEN_JOURNALPOST_ID = '930302';
const SØKER_ID = jpPILS301.norskIdent;
const BARN_ID = olpSoknad.barn.norskIdent;
const ANNEN_BARN_ID = fagsaker[2].pleietrengende!.identitetsnummer;
const SAK_ID = '1OLP930301';
const ANNEN_SAK_ID = '1OLP930302';
const MANUELL_SØKNAD_ID = 'olp-manual-create-930301';
const TOM_MAPPE_SØKNAD_ID = 'olp-empty-create-930301';
const MOTTAKELSESDATO = '08.12.2025';
const ROOT_PATH = `/journalpost/${JOURNALPOST_ID}/opplaeringspenger`;

type Application = {
    [field: string]: unknown;
    soeknadId: string;
    soekerId: string;
    mottattDato: string;
    barn: { norskIdent: string | null; foedselsdato: string | null } | null;
    journalposter: string[];
    klokkeslett: string;
    bosteder: unknown[] | null;
    lovbestemtFerie: unknown[] | null;
    k9saksnummer: string;
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

type Scenario = {
    applications: Application[];
    formApplications: Application[];
    createdApplication?: Application;
};

const OLP_CASE = {
    fagsakId: SAK_ID,
    sakstype: 'OLP',
    reservert: false,
    pleietrengende: {
        navn: 'TESTBARN',
        identitetsnummer: BARN_ID,
        fødselsdato: '2017-09-11',
    },
    gyldigPeriode: { fom: '2025-01-01', tom: '2026-12-31' },
    relatertPerson: null,
};

const journalpost = jpPILS301;

const journalpostEtterJournalføring = {
    ...journalpost,
    erFerdigstilt: true,
    journalpostStatus: 'JOURNALFOERT',
    sak: {
        ...journalpost.sak,
        fagsakId: SAK_ID,
        sakstype: 'OLP',
        gyldigPeriode: OLP_CASE.gyldigPeriode,
        pleietrengendeIdent: BARN_ID,
    },
};

const isApiResponse = (response: Response, method: string, path: string) =>
    response.request().method() === method && new URL(response.url()).pathname === path;

const applicationPath = (applicationId: string) => ApiPath.OLP_SOKNAD_GET.replace('{id}', applicationId);

const observeApplicationRequests = (page: Page) => {
    const requests: ApplicationRequest[] = [];
    const formPathPrefix = ApiPath.OLP_SOKNAD_GET.split('{id}')[0];
    const trackedPaths = new Set([
        ApiPath.JOURNALPOST_GET.replace('{journalpostId}', JOURNALPOST_ID),
        ApiPath.HENT_FAGSAK_PÅ_IDENT,
        ApiPath.JOURNALPOST_MOTTAK,
        ApiPath.OLP_EKSISTERENDE_SOKNADER_FIND,
        ApiPath.OLP_SOKNAD_CREATE,
        ApiPath.OLP_SOKNAD_UPDATE,
        ApiPath.OLP_SOKNAD_VALIDER,
        ApiPath.OLP_SOKNAD_SUBMIT,
    ]);

    page.on('request', (request) => {
        const path = new URL(request.url()).pathname;
        if (trackedPaths.has(path) || path.startsWith(formPathPrefix)) {
            requests.push({
                method: request.method(),
                path,
                ...(path === ApiPath.OLP_EKSISTERENDE_SOKNADER_FIND
                    ? { applicantId: request.headers()['x-nav-norskident'] }
                    : {}),
                ...(request.method() === 'POST' || request.method() === 'PUT'
                    ? { body: request.postDataJSON() }
                    : {}),
            });
        }
    });

    return requests;
};

const observeListAndCreateEvents = (page: Page) => {
    const events: NetworkEvent[] = [];
    const paths = new Set([ApiPath.OLP_EKSISTERENDE_SOKNADER_FIND, ApiPath.OLP_SOKNAD_CREATE]);

    page.on('request', (request) => {
        const path = new URL(request.url()).pathname;
        if (paths.has(path)) events.push({ kind: 'request', method: request.method(), path });
    });
    page.on('response', (response) => {
        const path = new URL(response.url()).pathname;
        if (paths.has(path)) {
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

const createExistingApplication = (
    applicationId: string,
    journalpostId: string,
    caseId = SAK_ID,
    childId = BARN_ID,
): Application => ({
    ...olpSoknad,
    soeknadId: applicationId,
    soekerId: SØKER_ID,
    mottattDato: '2025-12-08',
    barn: { ...olpSoknad.barn, norskIdent: childId },
    journalposter: [journalpostId],
    k9saksnummer: caseId,
});

const createCreatedApplication = (applicationId: string): Application => ({
    soeknadId: applicationId,
    soekerId: SØKER_ID,
    mottattDato: '2025-12-08',
    klokkeslett: '13:36',
    barn: { norskIdent: null, foedselsdato: null },
    journalposter: [JOURNALPOST_ID],
    soeknadsperiode: null,
    trekkKravPerioder: [],
    opptjeningAktivitet: null,
    soknadsinfo: null,
    bosteder: null,
    utenlandsopphold: [],
    lovbestemtFerie: null,
    arbeidstid: null,
    uttak: null,
    omsorg: null,
    kurs: null,
    begrunnelseForInnsending: null,
    metadata: null,
    k9saksnummer: SAK_ID,
});

const installScenarioHandlers = async (page: Page, scenario: Scenario) => {
    await page.evaluate(
        ({
            journalpostPath,
            fagsakPath,
            mottakPath,
            listPath,
            createPath,
            formPathPrefix,
            scenarioData,
            applicantId,
            sourceJp,
            classifiedJp,
            fagsak,
        }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');

            let classificationSucceeded = false;
            const handlers = [
                msw.http.get(journalpostPath, () =>
                    msw.HttpResponse.json(classificationSucceeded ? classifiedJp : sourceJp, {
                        status: classificationSucceeded ? 200 : 201,
                    }),
                ),
                msw.http.get(fagsakPath, () => msw.HttpResponse.json([fagsak])),
                msw.http.post(mottakPath, async ({ request }) => {
                    const body = await request.json();
                    if (!body || typeof body !== 'object' || !('journalpostId' in body)) return;
                    if (body.journalpostId !== sourceJp.journalpostId) return;
                    classificationSucceeded = true;
                    return msw.HttpResponse.json({ saksnummer: fagsak.fagsakId }, { status: 200 });
                }),
                msw.http.get(listPath, () =>
                    msw.HttpResponse.json({
                        søker: applicantId,
                        fagsakTypeKode: 'OLP',
                        søknader: scenarioData.applications,
                    }),
                ),
                msw.http.get(`${formPathPrefix}:id`, ({ params }) => {
                    const application = scenarioData.formApplications.find(
                        (item) => item.soeknadId === String(params.id),
                    );
                    if (!application) return;
                    return msw.HttpResponse.json(application);
                }),
                msw.http.post(createPath, () => {
                    if (!scenarioData.createdApplication) return;
                    return msw.HttpResponse.json(scenarioData.createdApplication, { status: 201 });
                }),
            ];
            msw.worker.use(...handlers);
        },
        {
            journalpostPath: ApiPath.JOURNALPOST_GET.replace('{journalpostId}', JOURNALPOST_ID),
            fagsakPath: ApiPath.HENT_FAGSAK_PÅ_IDENT,
            mottakPath: ApiPath.JOURNALPOST_MOTTAK,
            listPath: ApiPath.OLP_EKSISTERENDE_SOKNADER_FIND,
            createPath: ApiPath.OLP_SOKNAD_CREATE,
            formPathPrefix: ApiPath.OLP_SOKNAD_GET.split('{id}')[0],
            scenarioData: scenario,
            applicantId: SØKER_ID,
            sourceJp: journalpost,
            classifiedJp: journalpostEtterJournalføring,
            fagsak: OLP_CASE,
        },
    );
};

const expectJournalpostPanel = async (page: Page, childLabel = 'Pleietrengendes ID:') => {
    const panel = page.locator('.journalpostpanel');
    for (const [label, value] of [
        ['Journalpostnummer:', JOURNALPOST_ID],
        ['Søkers ID:', SØKER_ID],
        [childLabel, BARN_ID],
        ['Saksnummer:', SAK_ID],
    ]) {
        const field = panel.getByText(label, { exact: true });
        await expect(field).toBeVisible();
        await expect(field.locator('..').getByText(value, { exact: true })).toBeVisible();
    }
};

const reachRegistrationChoice = async (page: Page, scenario: Scenario) => {
    const requests = observeApplicationRequests(page);
    const journalpostPath = ApiPath.JOURNALPOST_GET.replace('{journalpostId}', JOURNALPOST_ID);
    const journalpostResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', journalpostPath),
    );
    await page.goto(`/journalpost/${JOURNALPOST_ID}`);
    const journalpostResponse = await journalpostResponsePromise;
    expect(journalpostResponse.status()).toBe(201);
    expect(journalpostResponse.fromServiceWorker()).toBe(true);
    expect(await journalpostResponse.json()).toEqual(journalpost);
    await installScenarioHandlers(page, scenario);

    const fagsakResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', ApiPath.HENT_FAGSAK_PÅ_IDENT),
    );
    await page.getByRole('radio', { name: 'Opplæringspenger', exact: true }).check();
    await page.getByRole('radio', { name: 'Ja', exact: true }).check();
    const fagsakResponse = await fagsakResponsePromise;
    expect(fagsakResponse.status()).toBe(200);
    expect(fagsakResponse.fromServiceWorker()).toBe(true);
    expect(fagsakResponse.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(await fagsakResponse.json()).toEqual([OLP_CASE]);

    await page.getByLabel('Velg fagsak').selectOption(SAK_ID);
    await expectJournalpostPanel(page);
    await page.locator('[data-test-id="journalførOgFortsett"]').click();

    const dialog = page.locator('[data-test-id="klassifiserModal"]');
    await expect(dialog.getByText('Saksnummer:', { exact: true })).toBeVisible();
    let classificationResponded = false;
    const classifyResponsePromise = page.waitForResponse((response) => {
        if (!isApiResponse(response, 'POST', ApiPath.JOURNALPOST_MOTTAK)) return false;
        classificationResponded = true;
        return true;
    });
    const refreshRequestPromise = page.waitForRequest((request) =>
        classificationResponded &&
        request.method() === 'GET' &&
        new URL(request.url()).pathname === journalpostPath,
    );
    await dialog.getByRole('button', { name: 'Journalfør journalposten' }).click();

    const classifyResponse = await classifyResponsePromise;
    expect(classifyResponse.status()).toBe(200);
    expect(classifyResponse.fromServiceWorker()).toBe(true);
    expect(classifyResponse.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(classifyResponse.request().postDataJSON()).toMatchObject({
        journalpostId: JOURNALPOST_ID,
        brukerIdent: SØKER_ID,
        pleietrengendeIdent: BARN_ID,
        fagsakYtelseTypeKode: 'OLP',
        saksnummer: SAK_ID,
    });

    const refreshResponse = await (await refreshRequestPromise).response();
    if (!refreshResponse) throw new Error('Oppfrisking av journalposten mangler svar.');
    expect(refreshResponse.status()).toBe(200);
    expect(refreshResponse.fromServiceWorker()).toBe(true);
    expect(await refreshResponse.json()).toEqual(journalpostEtterJournalføring);
    await expect(page).toHaveURL((url) => url.pathname === `${ROOT_PATH}/`);
    await page.getByRole('radio', { name: 'Registrere opplysninger til K9', exact: true }).check();
    const confirmButton = page.getByRole('button', { name: 'Bekreft', exact: true });
    await expect(confirmButton).toBeEnabled();

    return { confirmButton, requests };
};

const expectListResponse = async (responsePromise: Promise<Response>, applications: Application[]) => {
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    expect(response.fromServiceWorker()).toBe(true);
    expect(response.request().method()).toBe('GET');
    expect(new URL(response.url()).pathname).toBe(ApiPath.OLP_EKSISTERENDE_SOKNADER_FIND);
    expect(response.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(await response.json()).toEqual({
        søker: SØKER_ID,
        fagsakTypeKode: 'OLP',
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

const expectCreateResponse = async (responsePromise: Promise<Response>, application: Application) => {
    const response = await responsePromise;
    expect(response.status()).toBe(201);
    expect(response.fromServiceWorker()).toBe(true);
    expect(response.request().method()).toBe('POST');
    expect(new URL(response.url()).pathname).toBe(ApiPath.OLP_SOKNAD_CREATE);
    expect(await response.json()).toEqual(application);
};

const expectVisibleForm = async (page: Page, application: Application) => {
    await expect(page).toHaveURL(
        (url) => url.pathname === `${ROOT_PATH}/skjema/${application.soeknadId}/`,
    );
    await expect(page.getByLabel('Mottatt dato')).toHaveValue(MOTTAKELSESDATO);
    await expect(page.getByLabel(/Mottatt klokkeslett/)).toHaveValue(application.klokkeslett);
};

const expectNoApplicationWrites = (requests: ApplicationRequest[]) => {
    const writePaths = new Set([
        ApiPath.OLP_SOKNAD_CREATE,
        ApiPath.OLP_SOKNAD_UPDATE,
        ApiPath.OLP_SOKNAD_VALIDER,
        ApiPath.OLP_SOKNAD_SUBMIT,
    ]);
    expect(requests.filter(({ method, path }) => (method === 'POST' || method === 'PUT') && writePaths.has(path))).toEqual(
        [],
    );
};

const expectNoApplicationDraftGet = (requests: ApplicationRequest[]) => {
    const formPathPrefix = ApiPath.OLP_SOKNAD_GET.split('{id}')[0];
    expect(
        requests.filter(({ method, path }) => method === 'GET' && path.startsWith(formPathPrefix)),
    ).toEqual([]);
};

const expectCreateRequest = (requests: ApplicationRequest[]) => {
    const createRequests = requests.filter(
        ({ method, path }) => method === 'POST' && path === ApiPath.OLP_SOKNAD_CREATE,
    );
    expect(createRequests).toHaveLength(1);
    expect(createRequests[0].body).toEqual({
        journalpostId: JOURNALPOST_ID,
        norskIdent: SØKER_ID,
        pleietrengendeId: BARN_ID,
        k9saksnummer: SAK_ID,
    });
    expect(createRequests[0].body).not.toHaveProperty('soeknadId');
};

const expectLookupBeforeCreate = (events: NetworkEvent[]) => {
    const lookupResponseIndex = events.findIndex(
        ({ kind, method, path, status }) =>
            kind === 'response' &&
            method === 'GET' &&
            path === ApiPath.OLP_EKSISTERENDE_SOKNADER_FIND &&
            status === 200,
    );
    const createRequestIndex = events.findIndex(
        ({ kind, method, path }) =>
            kind === 'request' && method === 'POST' && path === ApiPath.OLP_SOKNAD_CREATE,
    );
    expect(lookupResponseIndex).toBeGreaterThanOrEqual(0);
    expect(createRequestIndex).toBeGreaterThan(lookupResponseIndex);
};

test('viser OLP-søknader, avbryter videreføring og åpner valgt søknad', async ({ page }) => {
    const compatible = createExistingApplication('olp-resume-compatible-930301', JOURNALPOST_ID);
    const otherCase = createExistingApplication('olp-resume-other-case-930301', ANNEN_JOURNALPOST_ID, ANNEN_SAK_ID);
    const otherChild = createExistingApplication(
        'olp-resume-other-child-930301',
        ANNEN_JOURNALPOST_ID,
        SAK_ID,
        ANNEN_BARN_ID,
    );
    const applications = [compatible, otherCase, otherChild];
    const { confirmButton, requests } = await reachRegistrationChoice(page, {
        applications,
        formApplications: [compatible],
    });

    const listResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', ApiPath.OLP_EKSISTERENDE_SOKNADER_FIND),
    );
    await confirmButton.click();
    await expectListResponse(listResponsePromise, applications);
    await expectJournalpostPanel(page, 'Barnets ID:');

    const rows = page.getByRole('table').getByRole('row');
    await expect(rows).toHaveCount(4);
    const compatibleRow = rows.nth(1);
    await expect(compatibleRow.getByRole('cell').nth(0)).toHaveText(MOTTAKELSESDATO);
    await expect(compatibleRow.getByRole('cell').nth(1)).toHaveText(SØKER_ID);
    await expect(compatibleRow.getByRole('cell').nth(2)).toHaveText(JOURNALPOST_ID);
    await expect(compatibleRow.getByRole('button')).toBeEnabled();
    await expect(rows.nth(2).getByRole('button')).toBeEnabled();
    await expect(rows.nth(3).getByRole('button')).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Start ny registrering', exact: true })).toHaveCount(0);
    expectNoApplicationWrites(requests);

    await compatibleRow.getByRole('button').click();
    const cancelDialog = page.getByRole('dialog');
    await expect(cancelDialog).toBeVisible();
    await cancelDialog.getByRole('button', { name: 'Avbryt', exact: true }).click();
    await expect(cancelDialog).toBeHidden();
    expectNoApplicationDraftGet(requests);
    expectNoApplicationWrites(requests);

    await compatibleRow.getByRole('button').click();
    const formResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', applicationPath(compatible.soeknadId)),
    );
    await page.getByRole('dialog').getByRole('button', { name: 'Fortsett', exact: true }).click();
    await expectApplicationResponse(formResponsePromise, compatible);
    await expectVisibleForm(page, compatible);
    expect(requests.filter(({ method, path }) => method === 'GET' && path === applicationPath(compatible.soeknadId))).toHaveLength(
        1,
    );
    expectNoApplicationWrites(requests);
});

test('starter OLP-registrering manuelt fra en liste med søknader', async ({ page }) => {
    const listedApplication = createExistingApplication('olp-listed-930301', ANNEN_JOURNALPOST_ID);
    const createdApplication = createCreatedApplication(MANUELL_SØKNAD_ID);
    const applications = [listedApplication];
    const { confirmButton, requests } = await reachRegistrationChoice(page, {
        applications,
        formApplications: [createdApplication],
        createdApplication,
    });
    const events = observeListAndCreateEvents(page);

    const listResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', ApiPath.OLP_EKSISTERENDE_SOKNADER_FIND),
    );
    await confirmButton.click();
    await expectListResponse(listResponsePromise, applications);
    await expect(page.getByRole('button', { name: 'Start ny registrering', exact: true })).toBeEnabled();
    expect(requests.filter(({ method, path }) => method === 'POST' && path === ApiPath.OLP_SOKNAD_CREATE)).toEqual([]);

    const createResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'POST', ApiPath.OLP_SOKNAD_CREATE),
    );
    const formResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', applicationPath(MANUELL_SØKNAD_ID)),
    );
    await page.getByRole('button', { name: 'Start ny registrering', exact: true }).click();
    await expectCreateResponse(createResponsePromise, createdApplication);
    expectCreateRequest(requests);
    await expectApplicationResponse(formResponsePromise, createdApplication);
    await expectVisibleForm(page, createdApplication);
    expect(events.filter(({ kind, method, path }) => kind === 'request' && method === 'POST' && path === ApiPath.OLP_SOKNAD_CREATE))
        .toHaveLength(1);
});

test('går tilbake fra OLP-søknadslisten uten å opprette en søknad', async ({ page }) => {
    const listedApplication = createExistingApplication('olp-back-listed-930301', ANNEN_JOURNALPOST_ID);
    const { confirmButton, requests } = await reachRegistrationChoice(page, {
        applications: [listedApplication],
        formApplications: [],
    });
    const listResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', ApiPath.OLP_EKSISTERENDE_SOKNADER_FIND),
    );
    await confirmButton.click();
    await expectListResponse(listResponsePromise, [listedApplication]);
    await expectJournalpostPanel(page, 'Barnets ID:');

    await page.getByRole('button', { name: 'Tilbake', exact: true }).click();
    await expect(page).toHaveURL((url) => url.pathname === `${ROOT_PATH}/`);
    await expect(page.getByRole('radio', { name: 'Registrere opplysninger til K9', exact: true })).toBeChecked();
    await expectJournalpostPanel(page, 'Barnets ID:');
    expectNoApplicationDraftGet(requests);
    expectNoApplicationWrites(requests);
});

test('oppretter OLP-søknad automatisk etter et vellykket tomt listeoppslag', async ({ page }) => {
    const createdApplication = createCreatedApplication(TOM_MAPPE_SØKNAD_ID);
    const { confirmButton, requests } = await reachRegistrationChoice(page, {
        applications: [],
        formApplications: [createdApplication],
        createdApplication,
    });
    const events = observeListAndCreateEvents(page);

    const listResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', ApiPath.OLP_EKSISTERENDE_SOKNADER_FIND),
    );
    const createResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'POST', ApiPath.OLP_SOKNAD_CREATE),
    );
    const formResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', applicationPath(TOM_MAPPE_SØKNAD_ID)),
    );
    await confirmButton.click();
    await expectListResponse(listResponsePromise, []);
    await expectCreateResponse(createResponsePromise, createdApplication);
    expectCreateRequest(requests);
    expectLookupBeforeCreate(events);
    await expectApplicationResponse(formResponsePromise, createdApplication);
    await expectVisibleForm(page, createdApplication);
});
