import { expect, test, type Page, type Response } from '@playwright/test';

import fagsaker from '../../cypress/fixtures/fagsaker.json' with { type: 'json' };
import jpOMPMA304 from '../../cypress/fixtures/jpOMPMA304.json' with { type: 'json' };
import { ApiPath } from '../../src/app/apiConfig';

const JOURNALPOST_ID = jpOMPMA304.journalpostId;
const SØKER_ID = jpOMPMA304.norskIdent;
const ANNEN_PART_ID = fagsaker[18].relatertPerson!.identitetsnummer;
const SAK_ID = fagsaker[18].fagsakId;
const SØKNAD_ID = 'ompma-form-930304';
const BARN_ID = '18410162721';
const SITUASJONSBESKRIVELSE = 'Den andre forelderen er fengslet.';
const FRA_DATO = '01.01.2020';
const TIL_DATO = '10.10.2020';
const FRA_DATO_ISO = '2020-01-01';
const TIL_DATO_ISO = '2020-10-10';
const ROOT_PATH = `/journalpost/${JOURNALPOST_ID}/omsorgspenger-midlertidig-alene`;
const APPLICATION_PATH = ApiPath.OMP_MA_SOKNAD_GET.replace('{id}', SØKNAD_ID);

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
        periode: {
            fom: string | null;
            tom: string | null;
            tilOgMedErIkkeOppgitt?: boolean;
        } | null;
    };
    journalposter: string[];
    k9saksnummer: string;
    harInfoSomIkkeKanPunsjes: boolean | null;
    harMedisinskeOpplysninger: boolean | null;
    metadata: null;
};

type ApplicationRequestBody = {
    soeknadId: string;
    soekerId: string;
    mottattDato: string;
    klokkeslett: string;
    barn: {
        norskIdent: string;
        foedselsdato?: string;
        navn?: string;
        låsIdentitetsnummer?: boolean;
    }[];
    annenForelder: Application['annenForelder'];
    journalposter: string[];
    harInfoSomIkkeKanPunsjes: boolean;
    harMedisinskeOpplysninger: boolean;
};

type TrackedRequest = {
    method: string;
    path: string;
    body?: unknown;
    applicantId?: string;
};

type MutationEvent = {
    kind: 'request' | 'response';
    method: string;
    path: string;
    status?: number;
    body?: unknown;
};

const isApiResponse = (response: Response, method: string, path: string) =>
    response.request().method() === method && new URL(response.url()).pathname === path;

const createDraft = (): Application => ({
    soeknadId: SØKNAD_ID,
    soekerId: SØKER_ID,
    mottattDato: '2020-10-12',
    klokkeslett: '12:53',
    barn: [],
    annenForelder: {
        norskIdent: ANNEN_PART_ID,
        situasjonType: null,
        situasjonBeskrivelse: null,
        periode: null,
    },
    journalposter: [JOURNALPOST_ID],
    k9saksnummer: SAK_ID,
    harInfoSomIkkeKanPunsjes: null,
    harMedisinskeOpplysninger: null,
    metadata: null,
});

const meaningfulApplicationValues = (application: ApplicationRequestBody) => ({
    soeknadId: application.soeknadId,
    soekerId: application.soekerId,
    mottattDato: application.mottattDato,
    klokkeslett: application.klokkeslett,
    barn: application.barn.map(({ norskIdent }) => norskIdent),
    annenForelder: application.annenForelder,
    journalposter: application.journalposter,
    harInfoSomIkkeKanPunsjes: application.harInfoSomIkkeKanPunsjes,
    harMedisinskeOpplysninger: application.harMedisinskeOpplysninger,
});

const observeRequests = (page: Page) => {
    const requests: TrackedRequest[] = [];
    const trackedPaths = new Set([
        ApiPath.OMP_MA_EKSISTERENDE_SOKNADER_FIND,
        ApiPath.OMP_MA_SOKNAD_CREATE,
        ApiPath.OMP_MA_SOKNAD_UPDATE,
        ApiPath.OMP_MA_SOKNAD_VALIDER,
        ApiPath.OMP_MA_SOKNAD_SUBMIT,
    ]);
    const formPathPrefix = ApiPath.OMP_MA_SOKNAD_GET.split('{id}')[0];

    page.on('request', (request) => {
        const path = new URL(request.url()).pathname;
        if (trackedPaths.has(path) || path.startsWith(formPathPrefix)) {
            requests.push({
                method: request.method(),
                path,
                ...(request.headers()['x-nav-norskident']
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

const observeMutationEvents = (page: Page) => {
    const events: MutationEvent[] = [];
    const paths = new Set([
        ApiPath.OMP_MA_SOKNAD_UPDATE,
        ApiPath.OMP_MA_SOKNAD_VALIDER,
        ApiPath.OMP_MA_SOKNAD_SUBMIT,
    ]);

    page.on('request', (request) => {
        const path = new URL(request.url()).pathname;
        if (paths.has(path)) {
            events.push({
                kind: 'request',
                method: request.method(),
                path,
                body: request.postDataJSON(),
            });
        }
    });
    page.on('response', (response) => {
        const path = new URL(response.url()).pathname;
        if (paths.has(path)) {
            events.push({
                kind: 'response',
                method: response.request().method(),
                path,
                status: response.status(),
                body: response.request().postDataJSON(),
            });
        }
    });

    return events;
};

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

    const journalpostPath = ApiPath.JOURNALPOST_GET.replace('{journalpostId}', JOURNALPOST_ID);
    await page.locator('[data-test-id="journalførOgFortsett"]').click();

    const dialog = page.locator('[data-test-id="klassifiserModal"]');
    await expect(dialog.getByText('Saksnummer:', { exact: true })).toBeVisible();
    let classificationResponded = false;
    const classifyResponsePromise = page.waitForResponse((response) => {
        if (!isApiResponse(response, 'POST', ApiPath.JOURNALPOST_MOTTAK)) return false;
        classificationResponded = true;
        return true;
    });
    const refreshRequestPromise = page.waitForRequest(
        (request) =>
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
        relatertPersonIdent: ANNEN_PART_ID,
        fagsakYtelseTypeKode: 'OMP_MA',
        saksnummer: SAK_ID,
    });

    const refreshResponse = await (await refreshRequestPromise).response();
    if (!refreshResponse) throw new Error('Oppfrisking av journalposten mangler svar.');
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

const installDraftHandlers = async (page: Page, backendValidationError = false) => {
    const initialDraft = createDraft();

    await page.evaluate(
        ({
            lookupPath,
            createPath,
            formPathPrefix,
            updatePath,
            validationPath,
            submitPath,
            barnPath,
            application,
            applicantId,
            otherParentId,
            journalpostId,
            caseId,
            childId,
            shouldReturnValidationError,
        }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');

            let savedApplication = application;
            const k9Response = (draft: typeof application) => ({
                søknadId: draft.soeknadId,
                versjon: '1.0.0',
                mottattDato: `${draft.mottattDato}T10:53:00.000Z`,
                søker: { norskIdentitetsnummer: draft.soekerId },
                ytelse: {
                    type: 'OMP_UTV_MA',
                    barn: draft.barn.map((child) => ({
                        norskIdentitetsnummer: child.norskIdent,
                        fødselsdato: child.foedselsdato ?? '',
                    })),
                    annenForelder: {
                        norskIdentitetsnummer: draft.annenForelder.norskIdent,
                        situasjon: draft.annenForelder.situasjonType,
                        situasjonBeskrivelse: draft.annenForelder.situasjonBeskrivelse,
                        periode: `${draft.annenForelder.periode?.fom}/${draft.annenForelder.periode?.tom}`,
                        begrunnelse: null,
                    },
                },
                språk: 'nb',
                journalposter: draft.journalposter.map((id) => ({
                    inneholderInformasjonSomIkkeKanPunsjes: draft.harInfoSomIkkeKanPunsjes,
                    inneholderMedisinskeOpplysninger: draft.harMedisinskeOpplysninger,
                    journalpostId: id,
                })),
                begrunnelseForInnsending: { tekst: null },
                kildesystem: null,
            });

            msw.worker.use(
                msw.http.get(lookupPath, () =>
                    msw.HttpResponse.json({
                        søker: applicantId,
                        fagsakTypeKode: 'OMP_MA',
                        søknader: [],
                    }),
                ),
                msw.http.post(createPath, async ({ request }) => {
                    const body = await request.json();
                    if (
                        !body ||
                        typeof body !== 'object' ||
                        !('journalpostId' in body) ||
                        body.journalpostId !== journalpostId ||
                        !('norskIdent' in body) ||
                        body.norskIdent !== applicantId ||
                        !('annenPart' in body) ||
                        body.annenPart !== otherParentId ||
                        !('k9saksnummer' in body) ||
                        body.k9saksnummer !== caseId
                    ) {
                        return msw.HttpResponse.json({ error: 'Ugyldig opprettingsforespørsel' }, { status: 400 });
                    }
                    return msw.HttpResponse.json(application, { status: 201 });
                }),
                msw.http.get(`${formPathPrefix}:id`, ({ params }) =>
                    String(params.id) === application.soeknadId
                        ? msw.HttpResponse.json(application, { status: 200 })
                        : msw.HttpResponse.json({ error: 'Søknaden finnes ikke' }, { status: 404 }),
                ),
                msw.http.get(barnPath, () =>
                    msw.HttpResponse.json(
                        {
                            barn: [
                                {
                                    fornavn: 'Geir-Paco',
                                    etternavn: 'Gundersen',
                                    identitetsnummer: childId,
                                },
                            ],
                        },
                        { status: 200 },
                    ),
                ),
                msw.http.put(updatePath, async ({ request }) => {
                    const updatedApplication = (await request.json()) as typeof application;
                    if (updatedApplication.soeknadId !== application.soeknadId) {
                        return msw.HttpResponse.json({ error: 'Søknads-ID stemmer ikke' }, { status: 400 });
                    }
                    savedApplication = updatedApplication;
                    return msw.HttpResponse.json(savedApplication, { status: 200 });
                }),
                msw.http.post(validationPath, async ({ request }) => {
                    const validatedApplication = (await request.json()) as typeof application;
                    if (shouldReturnValidationError) {
                        return msw.HttpResponse.json(
                            {
                                feil: [
                                    {
                                        felt: 'feil',
                                        feilkode: 'generiskFeil',
                                        feilmelding:
                                            'Hei, det har oppstått en helt generisk feil. Med vennlig hilsen backend',
                                    },
                                ],
                                søknadIdDto: application.soeknadId,
                            },
                            { status: 400 },
                        );
                    }
                    return msw.HttpResponse.json(k9Response(validatedApplication), { status: 202 });
                }),
                msw.http.post(submitPath, async ({ request }) => {
                    const body = await request.json();
                    if (
                        !body ||
                        typeof body !== 'object' ||
                        !('soeknadId' in body) ||
                        body.soeknadId !== savedApplication.soeknadId ||
                        !('norskIdent' in body) ||
                        body.norskIdent !== savedApplication.soekerId
                    ) {
                        return msw.HttpResponse.json({ error: 'Lagret søknad finnes ikke' }, { status: 404 });
                    }
                    return msw.HttpResponse.json(k9Response(savedApplication), { status: 202 });
                }),
            );
        },
        {
            lookupPath: ApiPath.OMP_MA_EKSISTERENDE_SOKNADER_FIND,
            createPath: ApiPath.OMP_MA_SOKNAD_CREATE,
            formPathPrefix: ApiPath.OMP_MA_SOKNAD_GET.split('{id}')[0],
            updatePath: ApiPath.OMP_MA_SOKNAD_UPDATE,
            validationPath: ApiPath.OMP_MA_SOKNAD_VALIDER,
            submitPath: ApiPath.OMP_MA_SOKNAD_SUBMIT,
            barnPath: ApiPath.BARN_GET,
            application: initialDraft,
            applicantId: SØKER_ID,
            otherParentId: ANNEN_PART_ID,
            journalpostId: JOURNALPOST_ID,
            caseId: SAK_ID,
            childId: BARN_ID,
            shouldReturnValidationError: backendValidationError,
        },
    );
};

const openDraftThroughUI = async (page: Page, backendValidationError = false) => {
    const confirmButton = await reachRegistrationChoice(page);
    await installDraftHandlers(page, backendValidationError);

    const lookupResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', ApiPath.OMP_MA_EKSISTERENDE_SOKNADER_FIND),
    );
    const createResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'POST', ApiPath.OMP_MA_SOKNAD_CREATE),
    );
    const formResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', APPLICATION_PATH),
    );
    const childrenResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', ApiPath.BARN_GET),
    );
    await confirmButton.click();

    const lookupResponse = await lookupResponsePromise;
    expect(lookupResponse.status()).toBe(200);
    expect(lookupResponse.fromServiceWorker()).toBe(true);
    expect(await lookupResponse.json()).toEqual({
        søker: SØKER_ID,
        fagsakTypeKode: 'OMP_MA',
        søknader: [],
    });

    const createResponse = await createResponsePromise;
    expect(createResponse.status()).toBe(201);
    expect(createResponse.fromServiceWorker()).toBe(true);
    expect(createResponse.request().postDataJSON()).toEqual({
        journalpostId: JOURNALPOST_ID,
        norskIdent: SØKER_ID,
        annenPart: ANNEN_PART_ID,
        barn: [],
        k9saksnummer: SAK_ID,
    });
    expect(await createResponse.json()).toEqual(createDraft());

    const formResponse = await formResponsePromise;
    expect(formResponse.status()).toBe(200);
    expect(formResponse.fromServiceWorker()).toBe(true);
    expect(await formResponse.json()).toEqual(createDraft());

    const childrenResponse = await childrenResponsePromise;
    expect(childrenResponse.status()).toBe(200);
    expect(childrenResponse.fromServiceWorker()).toBe(true);
    expect(await childrenResponse.json()).toMatchObject({
        barn: [{ identitetsnummer: BARN_ID }],
    });

    await expect(page).toHaveURL(
        (url) => url.pathname === `${ROOT_PATH}/skjema/${SØKNAD_ID}/`,
    );
    await expect(page.getByLabel('Hva er situasjonen til den andre forelderen?')).toBeVisible();
    await expect(page.getByLabel('Identitetsnummer')).toHaveValue(BARN_ID);
};

const fillForm = async (page: Page) => {
    await page.getByRole('radio', { name: 'Ikke relevant', exact: true }).check();
    await page.getByLabel('Dokumentet inneholder medisinske opplysninger').check();
    await page.getByLabel('Hva er situasjonen til den andre forelderen?').selectOption('FENGSEL');
    await page.getByLabel('Beskrivelse av situasjonen').fill(SITUASJONSBESKRIVELSE);
    await page.getByLabel('Fra og med', { exact: true }).fill(FRA_DATO);

    const finalSavePromise = page.waitForResponse(
        (response) =>
            isApiResponse(response, 'PUT', ApiPath.OMP_MA_SOKNAD_UPDATE) &&
            response.request().postDataJSON().annenForelder?.periode?.fom === FRA_DATO_ISO &&
            response.request().postDataJSON().annenForelder?.periode?.tom === TIL_DATO_ISO &&
            response.request().postDataJSON().harMedisinskeOpplysninger === true,
    );
    await page.getByLabel('Til og med', { exact: true }).fill(TIL_DATO);
    await page.getByLabel('Til og med', { exact: true }).press('Tab');

    const saveResponse = await finalSavePromise;
    expect(saveResponse.status()).toBe(200);
    expect(saveResponse.fromServiceWorker()).toBe(true);
    return saveResponse;
};

test('viser klientfeil for manglende situasjon, beskrivelse og periode uten å validere eller sende', async ({
    page,
}) => {
    const requests = observeRequests(page);
    await openDraftThroughUI(page);

    await page.getByRole('button', { name: 'Send inn', exact: true }).click();

    const errors = page.getByRole('list');
    await expect(errors.getByText('Situasjonstype er et påkrevd felt.')).toBeVisible();
    await expect(errors.getByText('Situasjonsbeskrivelse er et påkrevd felt.')).toBeVisible();
    await expect(errors.getByText('Fra og med er et påkrevd felt.')).toBeVisible();
    await expect(errors.getByText('Til og med er et påkrevd felt.')).toBeVisible();
    await expect(page).toHaveURL((url) => url.pathname === `${ROOT_PATH}/skjema/${SØKNAD_ID}/`);
    expect(
        requests.filter(
            ({ method, path }) =>
                method === 'POST' &&
                [ApiPath.OMP_MA_SOKNAD_VALIDER, ApiPath.OMP_MA_SOKNAD_SUBMIT].includes(path),
        ),
    ).toEqual([]);
});

test('viser backendens SøknadFeil og beholder skjemaverdiene uten å sende', async ({ page }) => {
    const requests = observeRequests(page);
    await openDraftThroughUI(page, true);

    const saveResponse = await fillForm(page);
    const savedValues = saveResponse.request().postDataJSON() as ApplicationRequestBody;
    expect(savedValues).toMatchObject({
        soeknadId: SØKNAD_ID,
        soekerId: SØKER_ID,
        journalposter: [JOURNALPOST_ID],
        barn: [{ norskIdent: BARN_ID }],
        annenForelder: {
            norskIdent: ANNEN_PART_ID,
            situasjonType: 'FENGSEL',
            situasjonBeskrivelse: SITUASJONSBESKRIVELSE,
            periode: {
                fom: FRA_DATO_ISO,
                tom: TIL_DATO_ISO,
            },
        },
        harMedisinskeOpplysninger: true,
    });

    const validationResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'POST', ApiPath.OMP_MA_SOKNAD_VALIDER),
    );
    await page.getByRole('button', { name: 'Send inn', exact: true }).click();
    const validationResponse = await validationResponsePromise;
    expect(validationResponse.status()).toBe(400);
    expect(validationResponse.fromServiceWorker()).toBe(true);
    expect(
        meaningfulApplicationValues(validationResponse.request().postDataJSON() as ApplicationRequestBody),
    ).toEqual(meaningfulApplicationValues(savedValues));
    expect(await validationResponse.json()).toEqual({
        feil: [
            {
                felt: 'feil',
                feilkode: 'generiskFeil',
                feilmelding: 'Hei, det har oppstått en helt generisk feil. Med vennlig hilsen backend',
            },
        ],
        søknadIdDto: SØKNAD_ID,
    });

    await expect(
        page.getByText('Hei, det har oppstått en helt generisk feil. Med vennlig hilsen backend', { exact: true }),
    ).toBeVisible();
    await expect(page.getByLabel('Hva er situasjonen til den andre forelderen?')).toHaveValue('FENGSEL');
    await expect(page.getByLabel('Beskrivelse av situasjonen')).toHaveValue(SITUASJONSBESKRIVELSE);
    await expect(page.getByLabel('Fra og med', { exact: true })).toHaveValue(FRA_DATO);
    await expect(page.getByLabel('Til og med', { exact: true })).toHaveValue(TIL_DATO);
    await expect(page.getByLabel('Dokumentet inneholder medisinske opplysninger')).toBeChecked();
    await expect(page.getByRole('dialog', { name: 'validertSoknadModal' })).toHaveCount(0);
    await expect(page.locator('[data-test-id="erdusikkermodal"]')).toHaveCount(0);
    expect(
        requests.filter(({ method, path }) => method === 'POST' && path === ApiPath.OMP_MA_SOKNAD_SUBMIT),
    ).toEqual([]);
});

test('lagrer, validerer, bekrefter og sender OMPMA-søknaden med kvittering', async ({ page }) => {
    const requests = observeRequests(page);
    const events = observeMutationEvents(page);
    await openDraftThroughUI(page);

    const saveResponse = await fillForm(page);
    expect(saveResponse.request().postDataJSON()).toMatchObject({
        soeknadId: SØKNAD_ID,
        soekerId: SØKER_ID,
        mottattDato: '2020-10-12',
        klokkeslett: '12:53',
        journalposter: [JOURNALPOST_ID],
        barn: [{ norskIdent: BARN_ID, foedselsdato: '' }],
        annenForelder: {
            norskIdent: ANNEN_PART_ID,
            situasjonType: 'FENGSEL',
            situasjonBeskrivelse: SITUASJONSBESKRIVELSE,
            periode: {
                fom: FRA_DATO_ISO,
                tom: TIL_DATO_ISO,
                tilOgMedErIkkeOppgitt: false,
            },
        },
        harInfoSomIkkeKanPunsjes: false,
        harMedisinskeOpplysninger: true,
    });
    expect(await saveResponse.json()).toEqual(saveResponse.request().postDataJSON());

    const validationResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'POST', ApiPath.OMP_MA_SOKNAD_VALIDER),
    );
    await page.getByRole('button', { name: 'Send inn', exact: true }).click();
    const validationResponse = await validationResponsePromise;
    expect(validationResponse.status()).toBe(202);
    expect(validationResponse.fromServiceWorker()).toBe(true);
    const validatedValues = validationResponse.request().postDataJSON() as ApplicationRequestBody;
    const savedValues = saveResponse.request().postDataJSON() as ApplicationRequestBody;
    expect(meaningfulApplicationValues(validatedValues)).toEqual(meaningfulApplicationValues(savedValues));

    const validationReceipt = await validationResponse.json();
    expect(validationReceipt).toMatchObject({
        søknadId: SØKNAD_ID,
        søker: { norskIdentitetsnummer: SØKER_ID },
        ytelse: {
            type: 'OMP_UTV_MA',
            barn: [{ norskIdentitetsnummer: BARN_ID }],
            annenForelder: {
                norskIdentitetsnummer: ANNEN_PART_ID,
                situasjon: 'FENGSEL',
                situasjonBeskrivelse: SITUASJONSBESKRIVELSE,
                periode: `${FRA_DATO_ISO}/${TIL_DATO_ISO}`,
            },
        },
        journalposter: [
            {
                journalpostId: JOURNALPOST_ID,
                inneholderInformasjonSomIkkeKanPunsjes: false,
                inneholderMedisinskeOpplysninger: true,
            },
        ],
    });

    const preview = page.getByRole('dialog', { name: 'validertSoknadModal' });
    await expect(preview).toBeVisible();
    await expect(preview).toContainText(BARN_ID);
    await expect(preview).toContainText('Fengsel');
    await expect(preview).toContainText(SITUASJONSBESKRIVELSE);
    await expect(preview).toContainText(FRA_DATO);
    await expect(preview).toContainText(TIL_DATO);
    await expect(preview).toContainText('Ja');
    expect(
        requests.filter(({ method, path }) => method === 'POST' && path === ApiPath.OMP_MA_SOKNAD_SUBMIT),
    ).toEqual([]);

    await preview.getByRole('button', { name: 'Videre', exact: true }).click();
    const confirmation = page.getByRole('dialog', { name: 'erdusikkermodal' });
    await expect(confirmation).toBeVisible();
    expect(
        requests.filter(({ method, path }) => method === 'POST' && path === ApiPath.OMP_MA_SOKNAD_SUBMIT),
    ).toEqual([]);

    const submitResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'POST', ApiPath.OMP_MA_SOKNAD_SUBMIT),
    );
    await confirmation.getByRole('button', { name: 'Send inn', exact: true }).click();
    const submitResponse = await submitResponsePromise;
    expect(submitResponse.status()).toBe(202);
    expect(submitResponse.fromServiceWorker()).toBe(true);
    expect(submitResponse.request().postDataJSON()).toEqual({
        norskIdent: SØKER_ID,
        soeknadId: SØKNAD_ID,
    });
    expect(await submitResponse.request().allHeaders()).toMatchObject({
        'x-nav-norskident': SØKER_ID,
    });
    expect(await submitResponse.json()).toEqual(validationReceipt);

    const completedSaveIndex = events.findIndex(
        ({ kind, method, path, status, body }) =>
            kind === 'response' &&
            method === 'PUT' &&
            path === ApiPath.OMP_MA_SOKNAD_UPDATE &&
            status === 200 &&
            JSON.stringify(meaningfulApplicationValues(body as ApplicationRequestBody)) ===
                JSON.stringify(meaningfulApplicationValues(validatedValues)),
    );
    const validationResponseIndex = events.findIndex(
        ({ kind, method, path, status }) =>
            kind === 'response' &&
            method === 'POST' &&
            path === ApiPath.OMP_MA_SOKNAD_VALIDER &&
            status === 202,
    );
    const submitRequestIndex = events.findIndex(
        ({ kind, method, path }) =>
            kind === 'request' && method === 'POST' && path === ApiPath.OMP_MA_SOKNAD_SUBMIT,
    );
    expect(completedSaveIndex).toBeGreaterThanOrEqual(0);
    expect(validationResponseIndex).toBeGreaterThan(completedSaveIndex);
    expect(submitRequestIndex).toBeGreaterThan(validationResponseIndex);
    expect(
        requests.filter(({ method, path }) => method === 'POST' && path === ApiPath.OMP_MA_SOKNAD_VALIDER),
    ).toHaveLength(1);
    expect(
        requests.filter(({ method, path }) => method === 'POST' && path === ApiPath.OMP_MA_SOKNAD_SUBMIT),
    ).toHaveLength(1);

    await expect(
        page.getByText(
            'Opplysningene er sendt til behandling. Vær oppmerksom på at det kan ta litt tid før opplysningene er synlige på behandlingen i K9-sak.',
        ),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Oppsummering' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tilbake til LOS' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Barn', exact: true }).locator('..')).toContainText(BARN_ID);
    await expect(page.getByText(/Den andre forelderen er fengslet/)).toBeVisible();
});
