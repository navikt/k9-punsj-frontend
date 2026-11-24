import { expect, test, type Page, type Response } from '@playwright/test';

import fagsaker from '../../cypress/fixtures/fagsaker.json' with { type: 'json' };
import jpOMPUT305 from '../../cypress/fixtures/jpOMPUT305.json' with { type: 'json' };
import { ApiPath } from '../../src/app/apiConfig';

const JOURNALPOST_ID = jpOMPUT305.journalpostId;
const SØKER_ID = jpOMPUT305.norskIdent;
const ANNEN_JOURNALPOST_ID = '200';
const OMP_CASE = fagsaker.find((fagsak) => fagsak.fagsakId === '1DQBM7V');
const ANNEN_OMP_CASE = fagsaker.find((fagsak) => fagsak.fagsakId === '1DMUDFB');

if (!OMP_CASE || !ANNEN_OMP_CASE) {
    throw new Error('Testdata må inneholde de reserverte og ordinære OMP-sakene.');
}

const CASE_ID = OMP_CASE.fagsakId;
const ANNEN_CASE_ID = ANNEN_OMP_CASE.fagsakId;
const ROOT_PATH = `/journalpost/${JOURNALPOST_ID}/omsorgspenger-utbetaling`;
const MOTTAKELSESDATO = '12.10.2020';
const MOTTAKELSESDATO_ISO = '2020-10-12';
const KLOKKESLETT = '12:53';
const INFO_AVAILABLE =
    'Det finnes en eller flere påbegynte registreringer på denne søkeren. Velg om du vil fortsette på en påbegynt innsending til k9, eller om du vil starte ny registrering. Du kan se tidligere journalposter ved å klikke på lenker under dokumenter. Du kan ikke fortsette på registreringer som har ulike fagsak.';
const INFO_CURRENT_JOURNALPOST =
    'Det er allerede startet en registrering på denne journalposten. Trykk fortsett for å fullføre innsendingen til K9';

type CaseMetadata = {
    fagsakId: string;
    sakstype: string;
    reservert: boolean;
    behandlingsår: string;
    gyldigPeriode: { fom: string; tom: string };
};

type Application = {
    soeknadId: string;
    soekerId: string;
    k9saksnummer: string;
    mottattDato: string;
    klokkeslett: string;
    barn: [];
    journalposter: string[];
    bosteder: [];
    utenlandsopphold: [];
    opptjeningAktivitet: null;
    fravaersperioder: [];
    harInfoSomIkkeKanPunsjes: boolean;
    harMedisinskeOpplysninger: boolean;
    metadata: {
        signatur: string;
        eksisterendeFagsak: CaseMetadata;
    };
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

const journalpostPath = ApiPath.JOURNALPOST_GET.replace('{journalpostId}', JOURNALPOST_ID);
const treatmentYearPath = ApiPath.JOURNALPOST_SETT_BEHANDLINGSÅR.replace(
    '{journalpostId}',
    JOURNALPOST_ID,
);
const applicationPath = (applicationId: string) => ApiPath.OMP_UT_SOKNAD_GET.replace('{id}', applicationId);

const observeApplicationRequests = (page: Page) => {
    const requests: ApplicationRequest[] = [];
    const formPathPrefix = ApiPath.OMP_UT_SOKNAD_GET.split('{id}')[0];
    const trackedPaths = new Set([
        ApiPath.OMP_UT_SOKNAD_CREATE,
        ApiPath.OMP_UT_SOKNAD_VALIDER,
        ApiPath.OMP_UT_SOKNAD_SUBMIT,
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

const observeMapAndCreateEvents = (page: Page) => {
    const events: NetworkEvent[] = [];
    const paths = new Set([ApiPath.OMP_UT_EKSISTERENDE_SOKNADER_FIND, ApiPath.OMP_UT_SOKNAD_CREATE]);

    page.on('request', (request) => {
        const path = new URL(request.url()).pathname;
        if (paths.has(path)) events.push({ kind: 'request', method: request.method(), path });
    });
    page.on('response', (response) => {
        const path = new URL(response.url()).pathname;
        if (paths.has(path)) {
            events.push({ kind: 'response', method: response.request().method(), path });
        }
    });

    return events;
};

const createCaseMetadata = (caseId: string, treatmentYear: string): CaseMetadata => ({
    fagsakId: caseId,
    sakstype: 'OMP',
    reservert: caseId === CASE_ID,
    behandlingsår: treatmentYear,
    gyldigPeriode: {
        fom: `${treatmentYear}-01-01`,
        tom: `${treatmentYear}-12-31`,
    },
});

const createApplication = (
    applicationId: string,
    journalposter: string[],
    caseId: string,
    treatmentYear: string,
    directCaseId = caseId,
): Application => ({
    soeknadId: applicationId,
    soekerId: SØKER_ID,
    k9saksnummer: directCaseId,
    mottattDato: MOTTAKELSESDATO_ISO,
    klokkeslett: KLOKKESLETT,
    barn: [],
    journalposter,
    bosteder: [],
    utenlandsopphold: [],
    opptjeningAktivitet: null,
    fravaersperioder: [],
    harInfoSomIkkeKanPunsjes: false,
    harMedisinskeOpplysninger: false,
    metadata: {
        signatur: '',
        eksisterendeFagsak: createCaseMetadata(caseId, treatmentYear),
    },
});

const installCaseLookupHandler = async (page: Page) => {
    await page.evaluate(
        ({ casesPath, applicantId, reservedCase, ordinaryCase }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');

            msw.worker.use(
                msw.http.get(casesPath, ({ request }) => {
                    if (request.headers.get('X-Nav-NorskIdent') !== applicantId) return;
                    const treatmentYear = String(new Date().getFullYear());
                    const reservedCaseWithoutYear = Object.fromEntries(
                        Object.entries(reservedCase).filter(([key]) => key !== 'behandlingsår'),
                    );
                    return msw.HttpResponse.json([
                        {
                            ...reservedCaseWithoutYear,
                            gyldigPeriode: {
                                fom: `${treatmentYear}-01-01`,
                                tom: `${treatmentYear}-12-31`,
                            },
                        },
                        ordinaryCase,
                    ]);
                }),
            );
        },
        {
            casesPath: ApiPath.HENT_FAGSAK_PÅ_IDENT,
            applicantId: SØKER_ID,
            reservedCase: OMP_CASE,
            ordinaryCase: ANNEN_OMP_CASE,
        },
    );
};

const installClassificationHandlers = async (page: Page, treatmentYear: string) => {
    const period = {
        fom: `${treatmentYear}-01-01`,
        tom: `${treatmentYear}-12-31`,
    };
    const classifiedJournalpost = {
        ...jpOMPUT305,
        erFerdigstilt: true,
        journalpostStatus: 'JOURNALFOERT',
        sak: {
            ...jpOMPUT305.sak,
            fagsakId: CASE_ID,
            sakstype: 'OMP',
            behandlingsÅr: Number(treatmentYear),
            reservertSaksnummer: true,
        },
    };

    await page.evaluate(
        ({
            journalpostRequestPath,
            yearRequestPath,
            mottakPath,
            sourceJournalpost,
            classified,
            saksnummer,
            applicantId,
        }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');

            let classificationSucceeded = false;
            msw.worker.use(
                msw.http.post(yearRequestPath, ({ request }) => {
                    if (request.headers.get('X-Nav-NorskIdent') !== applicantId) return;
                    return new msw.HttpResponse(null, { status: 200 });
                }),
                msw.http.post(mottakPath, () => {
                    classificationSucceeded = true;
                    return msw.HttpResponse.json({ saksnummer }, { status: 200 });
                }),
                msw.http.get(journalpostRequestPath, () =>
                    msw.HttpResponse.json(classificationSucceeded ? classified : sourceJournalpost, {
                        status: classificationSucceeded ? 200 : 201,
                    }),
                ),
            );
        },
        {
            journalpostRequestPath: journalpostPath,
            yearRequestPath: treatmentYearPath,
            mottakPath: ApiPath.JOURNALPOST_MOTTAK,
            sourceJournalpost: jpOMPUT305,
            classified: classifiedJournalpost,
            saksnummer: CASE_ID,
            applicantId: SØKER_ID,
        },
    );

    return { classifiedJournalpost, period };
};

const openJournalpost = async (page: Page) => {
    const responsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', journalpostPath),
    );
    await page.goto(`/journalpost/${JOURNALPOST_ID}`);

    const response = await responsePromise;
    expect(response.status()).toBe(201);
    expect(response.fromServiceWorker()).toBe(true);
    expect(await response.json()).toEqual(jpOMPUT305);
};

const waitForApplicantResponse = (page: Page, path: string) =>
    page.waitForResponse(
        (response) =>
            isApiResponse(response, 'GET', path) &&
            response.request().headers()['x-nav-norskident'] === SØKER_ID,
    );

const reachRegistrationChoice = async (page: Page) => {
    await openJournalpost(page);
    await installCaseLookupHandler(page);

    await page.getByRole('radio', { name: 'Omsorgspenger/omsorgsdager', exact: true }).check();
    await page
        .getByRole('radio', {
            name: 'Omsorgspenger: direkte utbetaling av omsorgspenger',
            exact: true,
        })
        .check();

    const caseLookupPromise = waitForApplicantResponse(page, ApiPath.HENT_FAGSAK_PÅ_IDENT);
    await page.getByRole('radio', { name: 'Ja', exact: true }).check();
    const caseLookup = await caseLookupPromise;
    expect(caseLookup.status()).toBe(200);
    expect(caseLookup.fromServiceWorker()).toBe(true);
    const caseLookupBody = await caseLookup.json();
    expect(caseLookupBody).toMatchObject([
        { fagsakId: CASE_ID, sakstype: 'OMP', reservert: true },
        { fagsakId: ANNEN_CASE_ID, sakstype: 'OMP' },
    ]);
    expect(caseLookupBody[0]).not.toHaveProperty('behandlingsår');

    await page.getByLabel('Velg fagsak').selectOption(CASE_ID);
    const yearSelect = page.getByLabel('Hvilket år gjelder dokumentet?');
    await expect(yearSelect).toBeVisible();
    const yearOption = yearSelect.locator('option').nth(1);
    await expect(yearOption).toBeEnabled();
    const treatmentYear = await yearOption.getAttribute('value');
    if (!treatmentYear) throw new Error('Et aktivt behandlingsår mangler i valgene.');
    await yearSelect.selectOption(treatmentYear);
    await expect(yearSelect).toHaveValue(treatmentYear);
    expect(caseLookupBody[0]).toMatchObject({
        fagsakId: CASE_ID,
        gyldigPeriode: {
            fom: `${treatmentYear}-01-01`,
            tom: `${treatmentYear}-12-31`,
        },
    });

    const { classifiedJournalpost, period } = await installClassificationHandlers(page, treatmentYear);
    const yearResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'POST', treatmentYearPath),
    );
    let classificationResponded = false;
    const classificationResponsePromise = page.waitForResponse((response) => {
        if (!isApiResponse(response, 'POST', ApiPath.JOURNALPOST_MOTTAK)) return false;
        classificationResponded = true;
        return true;
    });
    const refreshRequestPromise = page.waitForRequest((request) =>
        classificationResponded &&
        request.method() === 'GET' &&
        new URL(request.url()).pathname === journalpostPath,
    );
    await page.locator('[data-test-id="journalførOgFortsett"]').click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Saksnummer:', { exact: true })).toBeVisible();
    await dialog.getByRole('button', { name: 'Journalfør journalposten' }).click();

    const yearResponse = await yearResponsePromise;
    expect(yearResponse.status()).toBe(200);
    expect(yearResponse.fromServiceWorker()).toBe(true);
    expect(yearResponse.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(yearResponse.request().postDataJSON()).toEqual({ behandlingsAar: treatmentYear });

    const classificationResponse = await classificationResponsePromise;
    expect(classificationResponse.status()).toBe(200);
    expect(classificationResponse.fromServiceWorker()).toBe(true);
    expect(classificationResponse.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(classificationResponse.request().postDataJSON()).toMatchObject({
        journalpostId: JOURNALPOST_ID,
        brukerIdent: SØKER_ID,
        fagsakYtelseTypeKode: 'OMP',
        saksnummer: CASE_ID,
        periode: period,
    });
    expect(await classificationResponse.json()).toEqual({ saksnummer: CASE_ID });

    const refreshResponse = await (await refreshRequestPromise).response();
    if (!refreshResponse) throw new Error('Oppfrisking av journalposten mangler svar.');
    expect(refreshResponse.status()).toBe(200);
    expect(refreshResponse.fromServiceWorker()).toBe(true);
    expect(await refreshResponse.json()).toEqual(classifiedJournalpost);

    await expect(page).toHaveURL((url) => url.pathname === `${ROOT_PATH}/`);
    const registrationRadio = page.getByRole('radio', {
        name: 'Registrer søknad - direkte utbetaling omsorgspenger',
        exact: true,
    });
    await registrationRadio.check();
    await expect(registrationRadio).toBeChecked();
    const confirmButton = page.getByRole('button', { name: 'Bekreft', exact: true });
    await expect(confirmButton).toBeEnabled();

    return { confirmButton, treatmentYear };
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
            listApplications,
            formResponses,
            creationResponse,
            applicantId,
        }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');

            const handlers = [
                msw.http.get(lookupPath, ({ request }) => {
                    if (request.headers.get('X-Nav-NorskIdent') !== applicantId) return;
                    return msw.HttpResponse.json({
                        søker: applicantId,
                        fagsakTypeKode: 'OMP',
                        søknader: listApplications,
                    });
                }),
                msw.http.get(`${formPathPrefix}:id`, ({ params, request }) => {
                    if (request.headers.get('X-Nav-NorskIdent') !== applicantId) return;
                    const application = formResponses.find((item) => item.soeknadId === String(params.id));
                    if (!application) {
                        return msw.HttpResponse.json({ message: 'Ukjent test-søknad.' }, { status: 500 });
                    }
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
            lookupPath: ApiPath.OMP_UT_EKSISTERENDE_SOKNADER_FIND,
            createPath: ApiPath.OMP_UT_SOKNAD_CREATE,
            formPathPrefix: ApiPath.OMP_UT_SOKNAD_GET.split('{id}')[0],
            listApplications: applications,
            formResponses: formApplications,
            creationResponse: createResponse,
            applicantId: SØKER_ID,
        },
    );
};

const expectListResponse = async (responsePromise: Promise<Response>, applications: Application[]) => {
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    expect(response.fromServiceWorker()).toBe(true);
    expect(response.request().method()).toBe('GET');
    expect(new URL(response.url()).pathname).toBe(ApiPath.OMP_UT_EKSISTERENDE_SOKNADER_FIND);
    expect(response.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(await response.json()).toEqual({
        søker: SØKER_ID,
        fagsakTypeKode: 'OMP',
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
        ['Saksnummer:', `${CASE_ID} (reservert)`],
    ]) {
        const field = panel.getByText(label, { exact: true });
        await expect(field).toBeVisible();
        await expect(field.locator('..').getByText(value, { exact: true })).toBeVisible();
    }
};

const expectVisibleForm = async (page: Page, applicationId: string) => {
    await expect(page).toHaveURL((url) => url.pathname === `${ROOT_PATH}/skjema/${applicationId}/`);
    await expect(page.getByLabel('Mottatt dato:', { exact: true })).toHaveValue(MOTTAKELSESDATO);
    await expect(page.getByLabel('Mottatt klokkeslett', { exact: true })).toHaveValue(KLOKKESLETT);
};

const expectNoListStageWrites = (requests: ApplicationRequest[]) => {
    const writePaths = new Set([
        ApiPath.OMP_UT_SOKNAD_CREATE,
        ApiPath.OMP_UT_SOKNAD_VALIDER,
        ApiPath.OMP_UT_SOKNAD_SUBMIT,
    ]);
    expect(requests.filter(({ method, path }) => method === 'POST' && writePaths.has(path))).toEqual([]);
};

const expectNoValidationOrSubmission = (requests: ApplicationRequest[]) => {
    const paths = new Set([ApiPath.OMP_UT_SOKNAD_VALIDER, ApiPath.OMP_UT_SOKNAD_SUBMIT]);
    expect(requests.filter(({ method, path }) => method === 'POST' && paths.has(path))).toEqual([]);
};

const expectCreateResponse = async (responsePromise: Promise<Response>, application: Application) => {
    const response = await responsePromise;
    expect(response.status()).toBe(201);
    expect(response.fromServiceWorker()).toBe(true);
    expect(response.request().method()).toBe('POST');
    expect(new URL(response.url()).pathname).toBe(ApiPath.OMP_UT_SOKNAD_CREATE);
    expect(response.request().postDataJSON()).toEqual({
        journalpostId: JOURNALPOST_ID,
        norskIdent: SØKER_ID,
        k9saksnummer: CASE_ID,
    });
    expect(response.request().headers()).not.toHaveProperty('x-nav-norskident');
    expect(await response.json()).toEqual(application);
};

test('viser eksisterende OMPUT-søknader, avbryter og fortsetter på en kompatibel søknad', async ({ page }) => {
    const requests = observeApplicationRequests(page);
    const { confirmButton, treatmentYear } = await reachRegistrationChoice(page);
    const compatible = createApplication('omput-current-journalpost-930501', [JOURNALPOST_ID], CASE_ID, treatmentYear);
    const legacyFallback = createApplication(
        'omput-legacy-case-930502',
        [ANNEN_JOURNALPOST_ID],
        CASE_ID,
        treatmentYear,
        '',
    );
    const differentCase = createApplication(
        'omput-different-case-930503',
        [ANNEN_JOURNALPOST_ID],
        ANNEN_CASE_ID,
        treatmentYear,
    );
    const applications = [compatible, legacyFallback, differentCase];
    await installListAndFormResponses(page, applications, [compatible]);

    const listResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', ApiPath.OMP_UT_EKSISTERENDE_SOKNADER_FIND),
    );
    await confirmButton.click();
    await expectListResponse(listResponsePromise, applications);
    await expectJournalpostPanel(page);

    const table = page.getByRole('table');
    const rows = table.getByRole('row');
    await expect(rows).toHaveCount(4);
    const compatibleRow = rows.nth(1);
    await expect(compatibleRow.getByRole('cell').nth(0)).toHaveText(MOTTAKELSESDATO);
    await expect(compatibleRow.getByRole('cell').nth(2)).toHaveText(JOURNALPOST_ID);
    await expect(compatibleRow.getByRole('cell').nth(3)).toHaveText(CASE_ID);
    await expect(compatibleRow.getByRole('cell').nth(4)).toHaveText(treatmentYear);
    await expect(compatibleRow.getByRole('button', { name: 'Fortsett', exact: true })).toBeEnabled();

    const fallbackRow = rows.nth(2);
    await expect(fallbackRow.getByRole('cell').nth(2)).toHaveText(ANNEN_JOURNALPOST_ID);
    await expect(fallbackRow.getByRole('cell').nth(3)).toHaveText(CASE_ID);
    await expect(fallbackRow.getByRole('cell').nth(4)).toHaveText(treatmentYear);
    await expect(fallbackRow.getByRole('button', { name: 'Fortsett', exact: true })).toBeEnabled();

    const differentCaseRow = rows.nth(3);
    await expect(differentCaseRow.getByRole('cell').nth(3)).toHaveText(ANNEN_CASE_ID);
    await expect(differentCaseRow.getByRole('button', { name: 'Fortsett', exact: true })).toBeDisabled();
    await expect(page.getByRole('button', { name: /start ny registrering/i })).toHaveCount(0);
    await expect(page.getByText(INFO_CURRENT_JOURNALPOST, { exact: true })).toBeVisible();

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
    await expectVisibleForm(page, compatible.soeknadId);
    expect(requests.filter(({ method, path }) => method === 'POST' && path === ApiPath.OMP_UT_SOKNAD_CREATE)).toEqual(
        [],
    );
    expectNoValidationOrSubmission(requests);
});

test('starter manuell OMPUT-registrering fra en liste med eksisterende søknader', async ({ page }) => {
    const requests = observeApplicationRequests(page);
    const { confirmButton, treatmentYear } = await reachRegistrationChoice(page);
    const existing = createApplication(
        'omput-existing-930504',
        [ANNEN_JOURNALPOST_ID],
        CASE_ID,
        treatmentYear,
    );
    const created = createApplication(
        'omput-created-manually-930505',
        [JOURNALPOST_ID],
        CASE_ID,
        treatmentYear,
    );
    await installListAndFormResponses(page, [existing], [created], created);

    const listResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', ApiPath.OMP_UT_EKSISTERENDE_SOKNADER_FIND),
    );
    await confirmButton.click();
    await expectListResponse(listResponsePromise, [existing]);
    await expectJournalpostPanel(page);

    const createPath = ApiPath.OMP_UT_SOKNAD_CREATE;
    expect(requests.filter(({ method, path }) => method === 'POST' && path === createPath)).toEqual([]);
    const startNewButton = page.getByRole('button', { name: /start ny registrering/i });
    await expect(startNewButton).toBeEnabled();
    await expect(page.getByText(INFO_AVAILABLE, { exact: true })).toBeVisible();

    const createResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'POST', createPath),
    );
    const applicationResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', applicationPath(created.soeknadId)),
    );
    await startNewButton.click();

    await expectCreateResponse(createResponsePromise, created);
    await expectApplicationResponse(applicationResponsePromise, created);
    await expectVisibleForm(page, created.soeknadId);
    expect(requests.filter(({ method, path }) => method === 'POST' && path === createPath)).toHaveLength(1);
    expectNoValidationOrSubmission(requests);
});

test('går tilbake fra OMPUT-søknadslisten uten å opprette en søknad', async ({ page }) => {
    const requests = observeApplicationRequests(page);
    const { confirmButton, treatmentYear } = await reachRegistrationChoice(page);
    const existing = createApplication(
        'omput-back-existing-930506',
        [ANNEN_JOURNALPOST_ID],
        CASE_ID,
        treatmentYear,
    );
    await installListAndFormResponses(page, [existing], []);

    const listResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', ApiPath.OMP_UT_EKSISTERENDE_SOKNADER_FIND),
    );
    await confirmButton.click();
    await expectListResponse(listResponsePromise, [existing]);
    await expectJournalpostPanel(page);
    expectNoListStageWrites(requests);

    await page.getByRole('button', { name: 'Tilbake', exact: true }).click();
    await expect(page).toHaveURL((url) => url.pathname === `${ROOT_PATH}/`);
    await expect(
        page.getByRole('radio', {
            name: 'Registrer søknad - direkte utbetaling omsorgspenger',
            exact: true,
        }),
    ).toBeChecked();
    await expectJournalpostPanel(page);
    expectNoListStageWrites(requests);
    expect(
        requests.filter(
            ({ method, path }) => method === 'GET' && path === applicationPath(existing.soeknadId),
        ),
    ).toEqual([]);
});

test('oppretter OMPUT-søknad automatisk når listen er tom', async ({ page }) => {
    const requests = observeApplicationRequests(page);
    const events = observeMapAndCreateEvents(page);
    const { confirmButton, treatmentYear } = await reachRegistrationChoice(page);
    const created = createApplication(
        'omput-created-empty-930507',
        [JOURNALPOST_ID],
        CASE_ID,
        treatmentYear,
    );
    await installListAndFormResponses(page, [], [created], created);

    const listResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', ApiPath.OMP_UT_EKSISTERENDE_SOKNADER_FIND),
    );
    const createResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'POST', ApiPath.OMP_UT_SOKNAD_CREATE),
    );
    const applicationResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', applicationPath(created.soeknadId)),
    );
    await confirmButton.click();

    await expectListResponse(listResponsePromise, []);
    await expectCreateResponse(createResponsePromise, created);
    await expectApplicationResponse(applicationResponsePromise, created);
    await expectVisibleForm(page, created.soeknadId);

    const listResponseIndex = events.findIndex(
        ({ kind, method, path }) =>
            kind === 'response' && method === 'GET' && path === ApiPath.OMP_UT_EKSISTERENDE_SOKNADER_FIND,
    );
    const createRequestIndex = events.findIndex(
        ({ kind, method, path }) =>
            kind === 'request' && method === 'POST' && path === ApiPath.OMP_UT_SOKNAD_CREATE,
    );
    expect(listResponseIndex).toBeGreaterThanOrEqual(0);
    expect(createRequestIndex).toBeGreaterThan(listResponseIndex);
    expect(requests.filter(({ method, path }) => method === 'POST' && path === ApiPath.OMP_UT_SOKNAD_CREATE)).toHaveLength(
        1,
    );
    expectNoValidationOrSubmission(requests);
});
