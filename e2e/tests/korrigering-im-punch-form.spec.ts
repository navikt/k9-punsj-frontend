import { expect, test, type Page, type Response } from '@playwright/test';

import fagsaker from '../../cypress/fixtures/fagsaker.json' with { type: 'json' };
import journalpost from '../../cypress/fixtures/journalpost.json' with { type: 'json' };
import { ApiPath } from '../../src/app/apiConfig';

const JOURNALPOST_ID = journalpost.journalpostId;
const SØKER_ID = journalpost.norskIdent;
const SAK_ID = '1DMUDFB';
const SØKNAD_ID = '6bce0c72-e4b2-44d1-ae8c-9100bce2f4d0';
const BEHANDLINGSÅR = '2024';
const ARBEIDSGIVER_ID = '979312059';
const ARBEIDSFORHOLD_ID = 'arbeidsforhold-2024-1';
const MOTTATT_DATO = '2024-11-08';
const MOTTATT_TID = '15:00';
const TREKK_FOM = '2024-11-01';
const TREKK_TOM = '2024-11-02';
const JOURNALPOST_PATH = ApiPath.JOURNALPOST_GET.replace('{journalpostId}', JOURNALPOST_ID);
const BEHANDLINGSÅR_PATH = ApiPath.JOURNALPOST_SETT_BEHANDLINGSÅR.replace(
    '{journalpostId}',
    JOURNALPOST_ID,
);
const APPLICATION_PATH = ApiPath.OMS_SOKNAD_GET.replace('{id}', SØKNAD_ID);

type Correction = {
    soeknadId: string;
    soekerId: string;
    mottattDato: string;
    klokkeslett: string;
    journalposter: string[];
    organisasjonsnummer: string;
    arbeidsforholdId: string | null;
    fravaersperioder: {
        periode: { fom: string; tom: string };
        faktiskTidPrDag: string | null;
    }[];
};

type RequestRecord = {
    method: string;
    path: string;
    search: string;
    headers: Record<string, string>;
    body?: unknown;
};

type NetworkEvent = RequestRecord & {
    kind: 'request' | 'response';
    status?: number;
};

const initialApplication: Correction = {
    soeknadId: SØKNAD_ID,
    soekerId: SØKER_ID,
    mottattDato: '',
    klokkeslett: '',
    journalposter: [JOURNALPOST_ID],
    organisasjonsnummer: '',
    arbeidsforholdId: null,
    fravaersperioder: [],
};

const expectedCorrection = (withAbsence: boolean): Correction => ({
    ...initialApplication,
    mottattDato: MOTTATT_DATO,
    klokkeslett: MOTTATT_TID,
    organisasjonsnummer: ARBEIDSGIVER_ID,
    arbeidsforholdId: ARBEIDSFORHOLD_ID,
    fravaersperioder: withAbsence
        ? [
              {
                  periode: { fom: TREKK_FOM, tom: TREKK_TOM },
                  faktiskTidPrDag: '0',
              },
          ]
        : [],
});

const isApiResponse = (response: Response, method: string, path: string) =>
    response.request().method() === method && new URL(response.url()).pathname === path;

const observeNetwork = (page: Page) => {
    const records: NetworkEvent[] = [];
    const trackedPaths = new Set([
        BEHANDLINGSÅR_PATH,
        ApiPath.JOURNALPOST_MOTTAK,
        ApiPath.HENT_FAGSAK_PÅ_IDENT,
        ApiPath.FINN_ARBEIDSGIVERE,
        ApiPath.OMS_FINN_ARBEIDSFORHOLD,
        ApiPath.OMS_SOKNAD_CREATE,
        ApiPath.OMS_SOKNAD_UPDATE,
        ApiPath.OMS_SOKNAD_VALIDER,
        ApiPath.OMS_SOKNAD_SUBMIT,
    ]);
    const applicationPathPrefix = ApiPath.OMS_SOKNAD_GET.split('{id}')[0];

    page.on('request', (request) => {
        const url = new URL(request.url());
        if (url.pathname !== JOURNALPOST_PATH && !trackedPaths.has(url.pathname) && !url.pathname.startsWith(applicationPathPrefix)) {
            return;
        }

        records.push({
            kind: 'request',
            method: request.method(),
            path: url.pathname,
            search: url.search,
            headers: request.headers(),
            ...(['POST', 'PUT'].includes(request.method()) ? { body: request.postDataJSON() } : {}),
        });
    });
    page.on('response', (response) => {
        const request = response.request();
        const url = new URL(response.url());
        if (url.pathname !== JOURNALPOST_PATH && !trackedPaths.has(url.pathname) && !url.pathname.startsWith(applicationPathPrefix)) {
            return;
        }

        records.push({
            kind: 'response',
            method: request.method(),
            path: url.pathname,
            search: url.search,
            headers: request.headers(),
            status: response.status(),
            ...(['POST', 'PUT'].includes(request.method()) ? { body: request.postDataJSON() } : {}),
        });
    });

    return records;
};

const installScenarioHandlers = async (page: Page, failFirstValidation: boolean) => {
    const matchingCase = fagsaker.find((item) => item.fagsakId === SAK_ID);
    if (!matchingCase) throw new Error(`Testfagsaken ${SAK_ID} mangler.`);

    const classifiedJournalpost = {
        ...journalpost,
        erFerdigstilt: true,
        journalpostStatus: 'JOURNALFOERT',
        sak: {
            ...journalpost.sak,
            fagsakId: SAK_ID,
            sakstype: 'OMP',
            behandlingsÅr: Number(BEHANDLINGSÅR),
            reservertSaksnummer: false,
        },
    };

    await page.evaluate(
        ({
            journalpostPath,
            sourceJournalpost,
            classifiedJp,
            casePath,
            fagsak,
            behandlingsårPath,
            mottakPath,
            organizationsPath,
            employmentPath,
            createPath,
            formPathPrefix,
            updatePath,
            validationPath,
            submitPath,
            application,
            applicantId,
            caseId,
            journalpostId,
            employerId,
            employmentId,
            shouldFailFirstValidation,
        }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');

            let classificationSucceeded = false;
            let savedApplication = application;
            let validationShouldFail = shouldFailFirstValidation;
            window.addEventListener(
                'korrigering-im-validation-retry',
                () => {
                    validationShouldFail = false;
                },
                { once: true },
            );
            const k9Response = (correction: typeof application, storedJournalposts: string[]) => {
                const dailyAbsences = correction.fravaersperioder.flatMap(({ periode, faktiskTidPrDag }) => {
                    if (!faktiskTidPrDag) return [];

                    const days: string[] = [];
                    const current = new Date(`${periode.fom}T00:00:00.000Z`);
                    const end = new Date(`${periode.tom}T00:00:00.000Z`);
                    while (current <= end) {
                        const day = current.toISOString().slice(0, 10);
                        days.push(day);
                        current.setUTCDate(current.getUTCDate() + 1);
                    }

                    return days.map((day) => ({
                        periode: `${day}/${day}`,
                        duration: 'PT0S',
                        årsak: null,
                        søknadÅrsak: null,
                        aktivitetFravær: ['ARBEIDSTAKER'],
                        arbeidsforholdId: correction.arbeidsforholdId,
                        arbeidsgiverOrgNr: correction.organisasjonsnummer,
                    }));
                });

                return {
                    søknadId: correction.soeknadId,
                    versjon: '1.0.0',
                    mottattDato: `${correction.mottattDato}T14:00:00.000Z`,
                    søker: { norskIdentitetsnummer: correction.soekerId },
                    ytelse: {
                        type: 'OMP_UT',
                        fosterbarn: null,
                        aktivitet: null,
                        fraværsperioder: null,
                        fraværsperioderKorrigeringIm: dailyAbsences,
                        bosteder: null,
                        utenlandsopphold: null,
                    },
                    språk: 'nb',
                    journalposter: storedJournalposts.map((id) => ({
                        inneholderInfomasjonSomIkkeKanPunsjes: null,
                        inneholderInformasjonSomIkkeKanPunsjes: null,
                        inneholderMedisinskeOpplysninger: null,
                        journalpostId: id,
                    })),
                    begrunnelseForInnsending: { tekst: null },
                };
            };

            msw.worker.use(
                msw.http.get(journalpostPath, () =>
                    msw.HttpResponse.json(classificationSucceeded ? classifiedJp : sourceJournalpost, {
                        status: classificationSucceeded ? 200 : 201,
                    }),
                ),
                msw.http.get(casePath, ({ request }) => {
                    if (request.headers.get('X-Nav-NorskIdent') !== applicantId) return;
                    return msw.HttpResponse.json([fagsak], { status: 200 });
                }),
                msw.http.post(behandlingsårPath, () =>
                    new msw.HttpResponse(null, { status: 200 }),
                ),
                msw.http.post(mottakPath, async ({ request }) => {
                    const body = await request.json();
                    if (
                        !body ||
                        typeof body !== 'object' ||
                        !('journalpostId' in body) ||
                        body.journalpostId !== journalpostId
                    ) {
                        return;
                    }
                    classificationSucceeded = true;
                    return msw.HttpResponse.json({ saksnummer: caseId }, { status: 200 });
                }),
                msw.http.get(organizationsPath, () =>
                    msw.HttpResponse.json(
                        { organisasjoner: [{ organisasjonsnummer: employerId, navn: 'Testarbeidsgiver' }] },
                        { status: 200 },
                    ),
                ),
                msw.http.post(employmentPath, () =>
                    msw.HttpResponse.json(
                        [{ orgNummerEllerAktørID: employerId, arbeidsforholdId: [employmentId] }],
                        { status: 200 },
                    ),
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
                        !('k9saksnummer' in body) ||
                        body.k9saksnummer !== caseId
                    ) {
                        return msw.HttpResponse.json({ error: 'Ugyldig opprettingsforespørsel' }, { status: 400 });
                    }
                    return msw.HttpResponse.json(application, { status: 201 });
                }),
                msw.http.get(`${formPathPrefix}:id`, ({ params, request }) => {
                    if (
                        String(params.id) !== application.soeknadId ||
                        request.headers.get('X-Nav-NorskIdent') !== applicantId
                    ) {
                        return msw.HttpResponse.json({ error: 'Søknaden finnes ikke' }, { status: 404 });
                    }
                    return msw.HttpResponse.json(savedApplication, { status: 200 });
                }),
                msw.http.put(updatePath, async ({ request }) => {
                    savedApplication = (await request.json()) as typeof application;
                    return msw.HttpResponse.json(savedApplication, { status: 200 });
                }),
                msw.http.post(validationPath, async ({ request }) => {
                    const correction = (await request.json()) as typeof application;
                    if (correction.fravaersperioder.length === 0) {
                        return msw.HttpResponse.json(
                            {
                                søknadIdDto: application.soeknadId,
                                feil: [
                                    {
                                        felt: 'søknad',
                                        feilkode: 'uventetMappingfeil',
                                        feilmelding:
                                            'Må ha fravær fra enten søker eller fra fraværskorrigering av inntektsmelding',
                                    },
                                ],
                            },
                            { status: 400 },
                        );
                    }
                    if (validationShouldFail) {
                        return msw.HttpResponse.json(
                            {
                                søknadIdDto: application.soeknadId,
                                feil: [
                                    {
                                        felt: 'søknad',
                                        feilkode: 'uventetMappingfeil',
                                        feilmelding: 'Midlertidig valideringsfeil. Prøv igjen.',
                                    },
                                ],
                            },
                            { status: 400 },
                        );
                    }
                    return msw.HttpResponse.json(
                        k9Response(correction, savedApplication.journalposter),
                        { status: 202 },
                    );
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
                    return msw.HttpResponse.json(
                        k9Response(savedApplication, savedApplication.journalposter),
                        { status: 202 },
                    );
                }),
            );
        },
        {
            journalpostPath: JOURNALPOST_PATH,
            sourceJournalpost: journalpost,
            classifiedJp: classifiedJournalpost,
            casePath: ApiPath.HENT_FAGSAK_PÅ_IDENT,
            fagsak: matchingCase,
            behandlingsårPath: BEHANDLINGSÅR_PATH,
            mottakPath: ApiPath.JOURNALPOST_MOTTAK,
            organizationsPath: ApiPath.FINN_ARBEIDSGIVERE,
            employmentPath: ApiPath.OMS_FINN_ARBEIDSFORHOLD,
            createPath: ApiPath.OMS_SOKNAD_CREATE,
            formPathPrefix: ApiPath.OMS_SOKNAD_GET.split('{id}')[0],
            updatePath: ApiPath.OMS_SOKNAD_UPDATE,
            validationPath: ApiPath.OMS_SOKNAD_VALIDER,
            submitPath: ApiPath.OMS_SOKNAD_SUBMIT,
            application: initialApplication,
            applicantId: SØKER_ID,
            caseId: SAK_ID,
            journalpostId: JOURNALPOST_ID,
            employerId: ARBEIDSGIVER_ID,
            employmentId: ARBEIDSFORHOLD_ID,
            shouldFailFirstValidation: failFirstValidation,
        },
    );
};

const openCorrectionForm = async (page: Page, failFirstValidation = false) => {
    const journalpostResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', JOURNALPOST_PATH),
    );
    await page.goto(`/journalpost/${JOURNALPOST_ID}`);
    const journalpostResponse = await journalpostResponsePromise;
    expect(journalpostResponse.status()).toBe(200);
    expect(journalpostResponse.fromServiceWorker()).toBe(true);
    expect(await journalpostResponse.json()).toEqual(journalpost);

    await installScenarioHandlers(page, failFirstValidation);
    await page.getByRole('radio', { name: 'Omsorgspenger/omsorgsdager', exact: true }).check();
    await page
        .getByRole('radio', { name: 'Korrigering av inntektsmelding omsorgspenger AG', exact: true })
        .check();

    const fagsakResponsePromise = page.waitForResponse(
        (response) =>
            isApiResponse(response, 'GET', ApiPath.HENT_FAGSAK_PÅ_IDENT) &&
            response.request().headers()['x-nav-norskident'] === SØKER_ID,
    );
    await page.getByRole('radio', { name: 'Ja', exact: true }).check();
    const fagsakResponse = await fagsakResponsePromise;
    expect(fagsakResponse.status()).toBe(200);
    expect(fagsakResponse.fromServiceWorker()).toBe(true);
    expect(await fagsakResponse.json()).toEqual([fagsaker.find((item) => item.fagsakId === SAK_ID)]);

    await page.getByLabel('Velg fagsak').selectOption(SAK_ID);
    await expect(page.getByLabel('Velg fagsak')).toHaveValue(SAK_ID);
    await expect(page.locator('[data-test-id="journalførOgFortsett"]')).toBeEnabled();
    await page.locator('[data-test-id="journalførOgFortsett"]').click();

    const classificationDialog = page.locator('[data-test-id="klassifiserModal"]');
    await expect(classificationDialog.getByText('Saksnummer:', { exact: true })).toBeVisible();

    let classificationResponded = false;
    const behandlingsårResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'POST', BEHANDLINGSÅR_PATH),
    );
    const classificationResponsePromise = page.waitForResponse((response) => {
        if (!isApiResponse(response, 'POST', ApiPath.JOURNALPOST_MOTTAK)) return false;
        classificationResponded = true;
        return true;
    });
    const refreshRequestPromise = page.waitForRequest(
        (request) =>
            classificationResponded &&
            request.method() === 'GET' &&
            new URL(request.url()).pathname === JOURNALPOST_PATH,
    );
    const createResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'POST', ApiPath.OMS_SOKNAD_CREATE),
    );
    const applicationResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', APPLICATION_PATH),
    );

    await classificationDialog.getByRole('button', { name: 'Journalfør journalposten' }).click();

    const behandlingsårResponse = await behandlingsårResponsePromise;
    expect(behandlingsårResponse.status()).toBe(200);
    expect(behandlingsårResponse.fromServiceWorker()).toBe(true);
    expect(behandlingsårResponse.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(behandlingsårResponse.request().postDataJSON()).toEqual({ behandlingsAar: 2024 });

    const classificationResponse = await classificationResponsePromise;
    expect(classificationResponse.status()).toBe(200);
    expect(classificationResponse.fromServiceWorker()).toBe(true);
    expect(classificationResponse.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(classificationResponse.request().postDataJSON()).toMatchObject({
        journalpostId: JOURNALPOST_ID,
        brukerIdent: SØKER_ID,
        fagsakYtelseTypeKode: 'OMP',
        saksnummer: SAK_ID,
    });
    expect(await classificationResponse.json()).toEqual({ saksnummer: SAK_ID });

    const refreshResponse = await (await refreshRequestPromise).response();
    if (!refreshResponse) throw new Error('Oppfrisking av journalposten mangler svar.');
    expect(refreshResponse.status()).toBe(200);
    expect(refreshResponse.fromServiceWorker()).toBe(true);
    expect(await refreshResponse.json()).toMatchObject({
        journalpostId: JOURNALPOST_ID,
        norskIdent: SØKER_ID,
        erFerdigstilt: true,
        sak: { fagsakId: SAK_ID, sakstype: 'OMP', behandlingsÅr: 2024 },
    });

    await page
        .getByRole('radio', { name: 'Korrigere/trekke refusjonskrav omsorgspenger', exact: true })
        .check();
    await page.getByRole('button', { name: 'Bekreft', exact: true }).click();

    const createResponse = await createResponsePromise;
    expect(createResponse.status()).toBe(201);
    expect(createResponse.fromServiceWorker()).toBe(true);
    expect(createResponse.request().postDataJSON()).toEqual({
        journalpostId: JOURNALPOST_ID,
        norskIdent: SØKER_ID,
        k9saksnummer: SAK_ID,
    });
    expect(await createResponse.json()).toEqual(initialApplication);

    const applicationResponse = await applicationResponsePromise;
    expect(applicationResponse.status()).toBe(200);
    expect(applicationResponse.fromServiceWorker()).toBe(true);
    expect(applicationResponse.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(await applicationResponse.json()).toEqual(initialApplication);

    await expect(page).toHaveURL((url) => url.pathname.endsWith(`/korrigering-av-inntektsmelding/${SØKNAD_ID}/`));
    await expect(page.getByRole('heading', { name: 'Korrigering av inntektsmelding' })).toBeVisible();

    return { events: observeNetwork(page) };
};

const fillRequiredCorrectionFields = async (page: Page, withAbsence: boolean) => {
    const expected = expectedCorrection(withAbsence);
    const saveResponses: Response[] = [];
    page.on('response', (response) => {
        if (isApiResponse(response, 'PUT', ApiPath.OMS_SOKNAD_UPDATE)) saveResponses.push(response);
    });

    const receivedDate = page.getByLabel('Dato', { exact: true });
    await receivedDate.fill('08.11.2024');
    await receivedDate.press('Tab');
    await page.getByLabel('Tidspunkt', { exact: true }).fill(MOTTATT_TID);

    const employerResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', ApiPath.FINN_ARBEIDSGIVERE),
    );
    const employmentResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'POST', ApiPath.OMS_FINN_ARBEIDSFORHOLD),
    );
    await page.getByLabel('Årstallet korrigeringen gjelder for', { exact: true }).fill(BEHANDLINGSÅR);
    const employerResponse = await employerResponsePromise;
    expect(employerResponse.status()).toBe(200);
    expect(employerResponse.fromServiceWorker()).toBe(true);
    expect(employerResponse.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    const employerUrl = new URL(employerResponse.url());
    expect(employerUrl.searchParams.get('inkluderAvsluttetArbeidsforhold')).toBe('true');
    expect(employerUrl.searchParams.get('fom')).toBe(`${BEHANDLINGSÅR}-01-01`);
    expect(employerUrl.searchParams.get('tom')).toBe(`${BEHANDLINGSÅR}-12-31`);
    expect(await employerResponse.json()).toEqual({
        organisasjoner: [{ organisasjonsnummer: ARBEIDSGIVER_ID, navn: 'Testarbeidsgiver' }],
    });

    const employmentResponse = await employmentResponsePromise;
    expect(employmentResponse.status()).toBe(200);
    expect(employmentResponse.fromServiceWorker()).toBe(true);
    expect(employmentResponse.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(employmentResponse.request().postDataJSON()).toEqual({
        brukerIdent: SØKER_ID,
        periodeDto: { fom: `${BEHANDLINGSÅR}-01-01`, tom: `${BEHANDLINGSÅR}-01-01` },
    });
    expect(await employmentResponse.json()).toEqual([
        { orgNummerEllerAktørID: ARBEIDSGIVER_ID, arbeidsforholdId: [ARBEIDSFORHOLD_ID] },
    ]);

    await page.getByLabel('Velg virksomhet', { exact: true }).selectOption(ARBEIDSGIVER_ID);
    await page.getByLabel('Velg arbeidsforholdID', { exact: true }).selectOption(ARBEIDSFORHOLD_ID);

    if (withAbsence) {
        await page.getByRole('checkbox', { name: 'Trekk dager eller perioder med fravær' }).check();
        const from = page.getByLabel('Fra og med', { exact: true });
        await from.fill('01.11.2024');
        await from.press('Tab');
        const to = page.getByLabel('Til og med', { exact: true });
        await to.fill('02.11.2024');
        await to.press('Tab');
    }

    const hasExpectedBody = (response: Response) => {
        const body = response.request().postDataJSON() as Correction;
        return Object.entries(expected).every(
            ([key, value]) => JSON.stringify(body[key as keyof Correction]) === JSON.stringify(value),
        );
    };
    await expect.poll(() => saveResponses.some(hasExpectedBody)).toBe(true);
    const saveResponse = saveResponses.find(hasExpectedBody);
    if (!saveResponse) throw new Error('Lagringsforespørselen med korrigeringsverdiene mangler.');
    expect(saveResponse.status()).toBe(200);
    expect(saveResponse.fromServiceWorker()).toBe(true);
    expect(saveResponse.request().headers()).not.toHaveProperty('x-nav-norskident');
    expect(saveResponse.request().postDataJSON()).toEqual(expected);
    expect(await saveResponse.json()).toEqual(expected);
    return { expected, saveResponse };
};

const expectValidationRequest = (response: Response, expected: Correction) => {
    expect(response.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(response.request().postDataJSON()).toEqual(expected);
};

test('lagrer, validerer, bekrefter og sender korrigering av inntektsmelding', async ({ page }) => {
    const { events } = await openCorrectionForm(page);
    const { expected, saveResponse } = await fillRequiredCorrectionFields(page, true);

    const validationResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'POST', ApiPath.OMS_SOKNAD_VALIDER),
    );
    await page.getByRole('button', { name: 'Send inn', exact: true }).click();
    const validationResponse = await validationResponsePromise;
    expect(validationResponse.status()).toBe(202);
    expect(validationResponse.fromServiceWorker()).toBe(true);
    expectValidationRequest(validationResponse, expected);

    const validationReceipt = await validationResponse.json();
    expect(validationReceipt).toEqual({
        søknadId: SØKNAD_ID,
        versjon: '1.0.0',
        mottattDato: '2024-11-08T14:00:00.000Z',
        søker: { norskIdentitetsnummer: SØKER_ID },
        ytelse: {
            type: 'OMP_UT',
            fosterbarn: null,
            aktivitet: null,
            fraværsperioder: null,
            fraværsperioderKorrigeringIm: [
                {
                    periode: '2024-11-01/2024-11-01',
                    duration: 'PT0S',
                    årsak: null,
                    søknadÅrsak: null,
                    aktivitetFravær: ['ARBEIDSTAKER'],
                    arbeidsforholdId: ARBEIDSFORHOLD_ID,
                    arbeidsgiverOrgNr: ARBEIDSGIVER_ID,
                },
                {
                    periode: '2024-11-02/2024-11-02',
                    duration: 'PT0S',
                    årsak: null,
                    søknadÅrsak: null,
                    aktivitetFravær: ['ARBEIDSTAKER'],
                    arbeidsforholdId: ARBEIDSFORHOLD_ID,
                    arbeidsgiverOrgNr: ARBEIDSGIVER_ID,
                },
            ],
            bosteder: null,
            utenlandsopphold: null,
        },
        språk: 'nb',
        journalposter: [
            {
                inneholderInfomasjonSomIkkeKanPunsjes: null,
                inneholderInformasjonSomIkkeKanPunsjes: null,
                inneholderMedisinskeOpplysninger: null,
                journalpostId: JOURNALPOST_ID,
            },
        ],
        begrunnelseForInnsending: { tekst: null },
    });
    expect(validationResponse.request().postDataJSON()).toEqual(saveResponse.request().postDataJSON());

    const review = page.getByRole('dialog', { name: 'validertSoknadModal' });
    await expect(review).toBeVisible();
    await expect(review).toContainText('08.11.2024');
    await expect(review).toContainText(ARBEIDSGIVER_ID);
    await expect(review).toContainText(ARBEIDSFORHOLD_ID);
    await expect(review).toContainText('01.11.2024 - 02.11.2024');
    expect(events.filter(({ kind, method, path }) => kind === 'request' && method === 'POST' && path === ApiPath.OMS_SOKNAD_SUBMIT)).toEqual([]);

    await review.getByRole('button', { name: 'Videre', exact: true }).click();
    const confirmation = page.getByRole('dialog', { name: 'modalerdusikkersendinn' });
    await expect(confirmation).toBeVisible();
    expect(events.filter(({ kind, method, path }) => kind === 'request' && method === 'POST' && path === ApiPath.OMS_SOKNAD_SUBMIT)).toEqual([]);

    const submitResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'POST', ApiPath.OMS_SOKNAD_SUBMIT),
    );
    await confirmation.getByRole('button', { name: 'Send inn', exact: true }).click();
    const submitResponse = await submitResponsePromise;
    expect(submitResponse.status()).toBe(202);
    expect(submitResponse.fromServiceWorker()).toBe(true);
    expect(submitResponse.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(submitResponse.request().postDataJSON()).toEqual({
        norskIdent: SØKER_ID,
        soeknadId: SØKNAD_ID,
    });
    expect(await submitResponse.json()).toEqual(validationReceipt);
    expect(
        events.filter(({ kind, method, path }) => kind === 'request' && method === 'POST' && path === ApiPath.OMS_SOKNAD_SUBMIT),
    ).toHaveLength(1);

    await expect(
        page.getByText(
            'Opplysningene er sendt til behandling. Vær oppmerksom på at det kan ta litt tid før opplysningene er synlige på behandlingen i K9-sak.',
        ),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Oppsummering' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tilbake til LOS' })).toBeVisible();
    await expect(page.getByText('08.11.2024')).toBeVisible();
    await expect(page.getByText('01.11.2024 - 02.11.2024')).toBeVisible();
});

test('viser backendvalidering når fraværsperioder mangler uten å sende', async ({ page }) => {
    const { events } = await openCorrectionForm(page);
    const { expected } = await fillRequiredCorrectionFields(page, false);

    const validationResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'POST', ApiPath.OMS_SOKNAD_VALIDER),
    );
    await page.getByRole('button', { name: 'Send inn', exact: true }).click();
    const validationResponse = await validationResponsePromise;
    expect(validationResponse.status()).toBe(400);
    expect(validationResponse.fromServiceWorker()).toBe(true);
    expectValidationRequest(validationResponse, expected);
    expect(await validationResponse.json()).toEqual({
        søknadIdDto: SØKNAD_ID,
        feil: [
            {
                felt: 'søknad',
                feilkode: 'uventetMappingfeil',
                feilmelding: 'Må ha fravær fra enten søker eller fra fraværskorrigering av inntektsmelding',
            },
        ],
    });

    await expect(
        page.getByText('Må ha fravær fra enten søker eller fra fraværskorrigering av inntektsmelding', {
            exact: true,
        }),
    ).toBeVisible();
    await expect(page.getByLabel('Dato', { exact: true })).toHaveValue('08.11.2024');
    await expect(page.getByLabel('Velg virksomhet', { exact: true })).toHaveValue(ARBEIDSGIVER_ID);
    await expect(page.getByLabel('Velg arbeidsforholdID', { exact: true })).toHaveValue(ARBEIDSFORHOLD_ID);
    expect(
        events.filter(({ kind, method, path }) => kind === 'request' && method === 'POST' && path === ApiPath.OMS_SOKNAD_SUBMIT),
    ).toEqual([]);
});

test('beholder verdiene og kan prøve valideringen på nytt etter backendfeil', async ({ page }) => {
    const { events } = await openCorrectionForm(page, true);
    const { expected } = await fillRequiredCorrectionFields(page, true);

    const firstValidationResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'POST', ApiPath.OMS_SOKNAD_VALIDER),
    );
    await page.getByRole('button', { name: 'Send inn', exact: true }).click();
    const firstValidationResponse = await firstValidationResponsePromise;
    expect(firstValidationResponse.status()).toBe(400);
    expect(firstValidationResponse.fromServiceWorker()).toBe(true);
    expectValidationRequest(firstValidationResponse, expected);
    expect(await firstValidationResponse.json()).toEqual({
        søknadIdDto: SØKNAD_ID,
        feil: [
            {
                felt: 'søknad',
                feilkode: 'uventetMappingfeil',
                feilmelding: 'Midlertidig valideringsfeil. Prøv igjen.',
            },
        ],
    });

    await expect(page.getByText('Midlertidig valideringsfeil. Prøv igjen.', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Dato', { exact: true })).toHaveValue('08.11.2024');
    await expect(page.getByLabel('Tidspunkt', { exact: true })).toHaveValue(MOTTATT_TID);
    await expect(page.getByLabel('Velg virksomhet', { exact: true })).toHaveValue(ARBEIDSGIVER_ID);
    await expect(page.getByLabel('Velg arbeidsforholdID', { exact: true })).toHaveValue(ARBEIDSFORHOLD_ID);
    await expect(page.getByLabel('Fra og med', { exact: true })).toHaveValue('01.11.2024');
    await expect(page.getByLabel('Til og med', { exact: true })).toHaveValue('02.11.2024');
    expect(
        events.filter(({ kind, method, path }) => kind === 'request' && method === 'POST' && path === ApiPath.OMS_SOKNAD_SUBMIT),
    ).toEqual([]);

    const retryValidationResponsePromise = page.waitForResponse(
        (response) =>
            isApiResponse(response, 'POST', ApiPath.OMS_SOKNAD_VALIDER) &&
            response.status() === 202,
    );
    await page.evaluate(() => window.dispatchEvent(new Event('korrigering-im-validation-retry')));
    await page.getByRole('button', { name: 'Send inn', exact: true }).click();
    const retryValidationResponse = await retryValidationResponsePromise;
    expect(retryValidationResponse.status()).toBe(202);
    expect(retryValidationResponse.fromServiceWorker()).toBe(true);
    expectValidationRequest(retryValidationResponse, expected);

    const review = page.getByRole('dialog', { name: 'validertSoknadModal' });
    await expect(review).toBeVisible();
    await expect(review).toContainText(ARBEIDSGIVER_ID);
    await expect(review).toContainText('01.11.2024 - 02.11.2024');
    expect(
        events.filter(({ kind, method, path }) => kind === 'request' && method === 'POST' && path === ApiPath.OMS_SOKNAD_SUBMIT),
    ).toEqual([]);
});
