import { expect, test, type Page, type Response } from '@playwright/test';

import pleiepengerSoknadSomKanSendesInn from '../../cypress/fixtures/pleiepengerSoknadSomKanSendesInn.json' with {
    type: 'json',
};
import { ApiPath } from '../../src/app/apiConfig';
import { FORDELING_PSB_SCENARIOS } from '../../src/mocks/fordelingPsbTestScenarioIds';

const JOURNALPOST_ID = FORDELING_PSB_SCENARIOS.classify;
const SØKER_ID = '17420373147';
const SAK_ID = '1DQBDDC';
const BARN_ID = '24420167209';
const ANNEN_BARN_ID = '24420167210';
const MANUELL_SØKNAD_ID = 'psb-manual-create-930301';
const ANNEN_JOURNALPOST_ID = '930398';
const SØKNADSPERIODE = '08.11.2021 - 11.11.2021';
const MOTTAKELSESDATO = '12.10.2024';

type Application = typeof pleiepengerSoknadSomKanSendesInn;
type ExistingApplicationRequest = {
    method: string;
    path: string;
    body?: unknown;
};

const isApiResponse = (response: Response, method: string, path: string) =>
    response.request().method() === method && new URL(response.url()).pathname === path;

const applicationPath = (applicationId: string) => ApiPath.PSB_SOKNAD_GET.replace('{id}', applicationId);

const observeApplicationRequests = (page: Page) => {
    const requests: ExistingApplicationRequest[] = [];
    const formPathPrefix = ApiPath.PSB_SOKNAD_GET.split('{id}')[0];
    const trackedPaths = new Set([
        ApiPath.PSB_SOKNAD_CREATE,
        ApiPath.PSB_SOKNAD_VALIDER,
        ApiPath.PSB_SOKNAD_SUBMIT,
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

const createApplication = (
    applicationId: string,
    journalpostId: string,
    caseId = SAK_ID,
    childId = BARN_ID,
): Application => ({
    ...pleiepengerSoknadSomKanSendesInn,
    soeknadId: applicationId,
    soekerId: SØKER_ID,
    barn: { norskIdent: childId, foedselsdato: null },
    journalposter: [journalpostId],
    k9saksnummer: caseId,
});

const openPsbJournalpost = async (page: Page) => {
    const journalpostPath = ApiPath.JOURNALPOST_GET.replace('{journalpostId}', JOURNALPOST_ID);
    const journalpostResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', journalpostPath),
    );
    await page.goto(`/journalpost/${JOURNALPOST_ID}`);

    const journalpostResponse = await journalpostResponsePromise;
    expect(journalpostResponse.status()).toBe(200);
    expect(journalpostResponse.fromServiceWorker()).toBe(true);
    expect(await journalpostResponse.json()).toMatchObject({
        journalpostId: JOURNALPOST_ID,
        erFerdigstilt: false,
        sak: { sakstype: 'PSB', fagsakId: null },
    });
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

const reachRegistrationChoice = async (page: Page) => {
    await openPsbJournalpost(page);
    await page.getByRole('radio', { name: 'Ja' }).check();
    await page.getByLabel('Velg fagsak').selectOption(SAK_ID);

    const classifyResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'POST', ApiPath.JOURNALPOST_MOTTAK),
    );
    await page.locator('[data-test-id="journalførOgFortsett"]').click();
    const dialog = page.locator('[data-test-id="klassifiserModal"]');
    await expect(dialog.getByText('Saksnummer:', { exact: true })).toBeVisible();

    const journalpostPath = ApiPath.JOURNALPOST_GET.replace('{journalpostId}', JOURNALPOST_ID);
    const refreshResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', journalpostPath),
    );
    await dialog.getByRole('button', { name: 'Journalfør journalposten' }).click();
    const classifyResponse = await classifyResponsePromise;
    expect(classifyResponse.status()).toBe(200);
    expect(classifyResponse.fromServiceWorker()).toBe(true);

    const refreshResponse = await refreshResponsePromise;
    expect(refreshResponse.status()).toBe(200);
    expect(refreshResponse.fromServiceWorker()).toBe(true);
    await expect(page.getByRole('radio', { name: 'Registrere opplysninger til K9' })).toBeVisible();
    await page.getByRole('radio', { name: 'Registrere opplysninger til K9' }).check();
    const confirmButton = page.getByRole('button', { name: 'Bekreft' });
    await expect(confirmButton).toBeEnabled();
    return confirmButton;
};

const installListAndFormResponses = async (
    page: Page,
    applications: Application[],
    formApplications: Application[],
    createResponse?: { applicationId: string },
) => {
    await page.evaluate(
        ({
            lookupPath,
            createPath,
            formPathPrefix,
            applications: listApplications,
            formApplications: formResponses,
            createResponse: creationResponse,
        }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');

            const handlers = [
                msw.http.get(lookupPath, () =>
                    msw.HttpResponse.json({
                        søker: '17420373147',
                        fagsakTypeKode: 'PSB',
                        søknader: listApplications,
                    }),
                ),
                ...formResponses.map((application) =>
                    msw.http.get(`${formPathPrefix}${application.soeknadId}`, () =>
                        msw.HttpResponse.json(application),
                    ),
                ),
            ];

            if (creationResponse) {
                handlers.push(
                    msw.http.post(createPath, () =>
                        msw.HttpResponse.json({ soeknadId: creationResponse.applicationId }, { status: 201 }),
                    ),
                );
            }

            msw.worker.use(...handlers);
        },
        {
            lookupPath: ApiPath.PSB_EKSISTERENDE_SOKNADER_FIND,
            createPath: ApiPath.PSB_SOKNAD_CREATE,
            formPathPrefix: ApiPath.PSB_SOKNAD_GET.split('{id}')[0],
            applications,
            formApplications,
            createResponse,
        },
    );
};

const expectListResponse = async (responsePromise: Promise<Response>, applications: Application[]) => {
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    expect(response.fromServiceWorker()).toBe(true);
    expect(response.request().method()).toBe('GET');
    expect(new URL(response.url()).pathname).toBe(ApiPath.PSB_EKSISTERENDE_SOKNADER_FIND);
    expect(response.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(await response.json()).toEqual({
        søker: SØKER_ID,
        fagsakTypeKode: 'PSB',
        søknader: applications,
    });
};

const expectNoListStageWrites = (requests: ExistingApplicationRequest[]) => {
    const writePaths = new Set([
        ApiPath.PSB_SOKNAD_CREATE,
        ApiPath.PSB_SOKNAD_VALIDER,
        ApiPath.PSB_SOKNAD_SUBMIT,
    ]);
    expect(requests.filter(({ method, path }) => method === 'POST' && writePaths.has(path))).toEqual([]);
};

test('viser eksisterende PSB-søknader, avbryter og fortsetter på en kompatibel søknad', async ({ page }) => {
    const requests = observeApplicationRequests(page);
    const compatible = createApplication('psb-resume-compatible-930301', JOURNALPOST_ID);
    const otherCase = createApplication('psb-resume-other-case-930301', ANNEN_JOURNALPOST_ID, '10002Fi');
    const otherChild = createApplication(
        'psb-resume-other-child-930301',
        ANNEN_JOURNALPOST_ID,
        SAK_ID,
        ANNEN_BARN_ID,
    );
    const applications = [compatible, otherCase, otherChild];
    const confirmButton = await reachRegistrationChoice(page);
    await installListAndFormResponses(page, applications, [compatible]);

    const listResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', ApiPath.PSB_EKSISTERENDE_SOKNADER_FIND),
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
    await expect(compatibleRow.getByRole('cell').nth(5)).toHaveText(SØKNADSPERIODE);
    await expect(compatibleRow.getByRole('button', { name: 'Fortsett', exact: true })).toBeEnabled();

    const differentCaseRow = rows.nth(2);
    await expect(differentCaseRow.getByRole('cell').nth(4)).toHaveText('10002Fi');
    await expect(differentCaseRow.getByRole('button', { name: 'Fortsett', exact: true })).toBeDisabled();
    const differentChildRow = rows.nth(3);
    await expect(differentChildRow.getByRole('cell').nth(1)).toHaveText(ANNEN_BARN_ID);
    await expect(differentChildRow.getByRole('button', { name: 'Fortsett', exact: true })).toBeDisabled();
    await expect(page.getByRole('button', { name: /start ny registrering/i })).toHaveCount(0);

    await compatibleRow.getByRole('button', { name: 'Fortsett', exact: true }).click();
    const confirmation = page.getByTestId('erdusikkermodal');
    await expect(confirmation).toBeVisible();
    await expect(confirmation).toContainText('Er du sikker på at du vil fortsette på denne søknaden?');
    await confirmation.getByRole('button', { name: 'Avbryt', exact: true }).click();
    await expect(confirmation).toBeHidden();
    await expect(table).toBeVisible();
    expect(requests.filter(({ method, path }) => method === 'GET' && path === applicationPath(compatible.soeknadId))).toEqual(
        [],
    );
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
    await expect(page).toHaveURL(
        (url) => url.pathname === `/journalpost/${JOURNALPOST_ID}/pleiepenger-sykt-barn/skjema/${compatible.soeknadId}/`,
    );
    await expect(page.getByTestId('PSBPunchForm')).toBeVisible();
    await expect(page.getByTestId('mottattDato')).toHaveValue(MOTTAKELSESDATO);
    expect(requests.filter(({ method, path }) => method === 'POST' && path === ApiPath.PSB_SOKNAD_CREATE)).toEqual([]);
    expectNoListStageWrites(requests);
});

test('starter manuell PSB-registrering fra en liste med eksisterende søknader', async ({ page }) => {
    const requests = observeApplicationRequests(page);
    const existing = createApplication('psb-manual-existing-930301', ANNEN_JOURNALPOST_ID);
    const created = createApplication(MANUELL_SØKNAD_ID, JOURNALPOST_ID);
    const applications = [existing];
    const confirmButton = await reachRegistrationChoice(page);
    await installListAndFormResponses(page, applications, [created], {
        applicationId: MANUELL_SØKNAD_ID,
    });

    const listResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', ApiPath.PSB_EKSISTERENDE_SOKNADER_FIND),
    );
    await confirmButton.click();
    await expectListResponse(listResponsePromise, applications);
    await expectJournalpostPanel(page);

    const createPath = ApiPath.PSB_SOKNAD_CREATE;
    const createRequestsBeforeClick = requests.filter(({ method, path }) => method === 'POST' && path === createPath);
    expect(createRequestsBeforeClick).toEqual([]);
    const startNewButton = page.getByRole('button', { name: /start ny registrering/i });
    await expect(startNewButton).toBeEnabled();
    const createResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'POST', createPath),
    );
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
        pleietrengendeIdent: BARN_ID,
        k9saksnummer: SAK_ID,
    });
    expect(await createResponse.json()).toEqual({ soeknadId: MANUELL_SØKNAD_ID });

    const applicationResponse = await applicationResponsePromise;
    expect(applicationResponse.status()).toBe(200);
    expect(applicationResponse.fromServiceWorker()).toBe(true);
    expect(applicationResponse.request().method()).toBe('GET');
    expect(new URL(applicationResponse.url()).pathname).toBe(applicationPath(MANUELL_SØKNAD_ID));
    expect(await applicationResponse.json()).toEqual(created);
    await expect(page).toHaveURL(
        (url) => url.pathname === `/journalpost/${JOURNALPOST_ID}/pleiepenger-sykt-barn/skjema/${MANUELL_SØKNAD_ID}/`,
    );
    await expect(page.getByTestId('PSBPunchForm')).toBeVisible();
    await expect(page.getByTestId('mottattDato')).toHaveValue(MOTTAKELSESDATO);

    expect(requests.filter(({ method, path }) => method === 'POST' && path === createPath)).toHaveLength(1);
    expect(requests.filter(({ method, path }) => method === 'POST' && path === ApiPath.PSB_SOKNAD_VALIDER)).toEqual(
        [],
    );
    expect(requests.filter(({ method, path }) => method === 'POST' && path === ApiPath.PSB_SOKNAD_SUBMIT)).toEqual(
        [],
    );
});

test('går tilbake fra eksisterende PSB-søknader til journalposten', async ({ page }) => {
    const requests = observeApplicationRequests(page);
    const existing = createApplication('psb-back-existing-930301', ANNEN_JOURNALPOST_ID);
    const applications = [existing];
    const confirmButton = await reachRegistrationChoice(page);
    await installListAndFormResponses(page, applications, []);

    const listResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', ApiPath.PSB_EKSISTERENDE_SOKNADER_FIND),
    );
    await confirmButton.click();
    await expectListResponse(listResponsePromise, applications);
    await expectJournalpostPanel(page);
    expectNoListStageWrites(requests);

    await page.getByRole('button', { name: 'Tilbake', exact: true }).click();
    await expect(page).toHaveURL(
        (url) => url.pathname === `/journalpost/${JOURNALPOST_ID}/pleiepenger-sykt-barn/`,
    );
    await expectJournalpostPanel(page);
    expectNoListStageWrites(requests);
    expect(requests.filter(({ method, path }) => method === 'GET' && path === applicationPath(existing.soeknadId))).toEqual(
        [],
    );
});
