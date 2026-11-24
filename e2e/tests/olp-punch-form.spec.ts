import { expect, test, type Page, type Response } from '@playwright/test';

import journalpostFixture from '../../cypress/fixtures/jpPILS301.json' with { type: 'json' };
import olpSoknad from '../../cypress/fixtures/olp/olpSoknad.json' with { type: 'json' };
import { ApiPath } from '../../src/app/apiConfig';

const JOURNALPOST_ID = journalpostFixture.journalpostId;
const SØKER_ID = journalpostFixture.norskIdent;
const BARN_ID = olpSoknad.barn.norskIdent;
const SAK_ID = '1OLP930301';
const SUCCESS_SØKNAD_ID = 'olp-form-success-930301';
const REJECTION_SØKNAD_ID = 'olp-form-rejection-930301';
const MOTTAKELSESDATO = '2025-03-20';
const KLOKKESLETT = '14:15';
const KURS_FOM = '2025-03-10';
const KURS_TOM = '2025-03-14';
const KURSHOLDER = 'Testinstitusjon for OLP';
const INSTITUSJON_UUID = '0194352b-1c08-7c5e-a7f0-123456789abc';
const EXISTING_K9_PERIODS = [{ fom: '2024-06-01', tom: '2024-06-02' }];
const ROOT_PATH = `/journalpost/${JOURNALPOST_ID}/opplaeringspenger`;

type Period = { fom: string; tom: string };

type Application = {
    [field: string]: unknown;
    soeknadId: string;
    soekerId: string;
    mottattDato: string;
    klokkeslett: string;
    barn: { norskIdent: string | null; foedselsdato: string | null } | null;
    journalposter: string[];
    soeknadsperiode: Period[] | null;
    k9saksnummer?: string | null;
};

type ObservedRequest = {
    method: string;
    path: string;
    applicantId?: string;
    body?: unknown;
};

type Scenario = {
    initialApplication: Application;
    rejectValidation: boolean;
};

const journalpost = journalpostFixture;

const OLP_CASE = {
    fagsakId: SAK_ID,
    sakstype: 'OLP',
    reservert: false,
    pleietrengende: {
        navn: 'TESTBARN',
        identitetsnummer: BARN_ID,
        fødselsdato: '2017-09-11',
    },
    gyldigPeriode: { fom: '2024-01-01', tom: '2026-12-31' },
    relatertPerson: null,
};

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

const institusjoner = [{ uuid: INSTITUSJON_UUID, navn: KURSHOLDER }];

const applicationPath = (applicationId: string) => ApiPath.OLP_SOKNAD_GET.replace('{id}', applicationId);

const isApiResponse = (response: Response, method: string, path: string) =>
    response.request().method() === method && new URL(response.url()).pathname === path;

const createInitialApplication = (applicationId: string): Application => ({
    soeknadId: applicationId,
    soekerId: SØKER_ID,
    mottattDato: MOTTAKELSESDATO,
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

const observeApplicationRequests = (page: Page) => {
    const requests: ObservedRequest[] = [];
    const trackedPaths = new Set([
        ApiPath.JOURNALPOST_GET.replace('{journalpostId}', JOURNALPOST_ID),
        ApiPath.HENT_FAGSAK_PÅ_IDENT,
        ApiPath.JOURNALPOST_MOTTAK,
        ApiPath.OLP_EKSISTERENDE_SOKNADER_FIND,
        ApiPath.OLP_SOKNAD_CREATE,
        ApiPath.OLP_SOKNAD_UPDATE,
        ApiPath.OLP_SOKNAD_VALIDER,
        ApiPath.OLP_SOKNAD_SUBMIT,
        ApiPath.SAKER_PERIODER,
        ApiPath.OLP_INSTITUSJONER,
    ]);
    const formPathPrefix = ApiPath.OLP_SOKNAD_GET.split('{id}')[0];

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

const installScenarioHandlers = async (page: Page, scenario: Scenario) => {
    await page.evaluate(
        ({
            paths,
            sourceJournalpost,
            classifiedJournalpost,
            fagsak,
            listResponse,
            initialApplication,
            existingK9Periods,
            institutionList,
            shouldRejectValidation,
            applicantId,
            childId,
            caseId,
            journalpostId,
        }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');

            let classificationSucceeded = false;
            let applicationEntityCaseNumber: string | undefined;
            let savedApplication: Application | undefined;
            const backendValidationError = {
                søknadIdDto: initialApplication.soeknadId,
                feil: [
                    {
                        felt: 'ytelse.kurs.kursperioder[0].periode',
                        feilkode: 'SYNTHETIC_KURS_PERIOD_REJECTION',
                        feilmelding: 'Syntetisk backendavslag for OLP-validering.',
                    },
                ],
            };

            const buildK9Receipt = (draft: Application, storedJournalposts: string[]) => {
                const kursPerioder = (draft.kurs as { kursperioder: { periode: Period }[] }).kursperioder.map(
                    ({ periode }) => `${periode.fom}/${periode.tom}`,
                );
                const kursholder = (draft.kurs as { kursHolder: { holder: string; institusjonsUuid: string } })
                    .kursHolder;
                const barn = draft.barn;
                if (!barn?.norskIdent) throw new Error('Barnets identitet mangler i lagret OLP-utkast.');

                return {
                    søknadId: draft.soeknadId,
                    versjon: '1.0.0',
                    mottattDato: `${draft.mottattDato}T${draft.klokkeslett}:00+01:00`,
                    søker: { norskIdentitetsnummer: draft.soekerId },
                    språk: 'nb',
                    ytelse: {
                        type: 'OPPLAERINGSPENGER',
                        barn: { norskIdentitetsnummer: barn.norskIdent, fødselsdato: null },
                        søknadsperiode: kursPerioder,
                        trekkKravPerioder: [],
                        opptjeningAktivitet: { selvstendigNæringsdrivende: [], frilanser: null },
                        arbeidstid: {
                            arbeidstakerList: [],
                            frilanserArbeidstidInfo: null,
                            selvstendigNæringsdrivendeArbeidstidInfo: { perioder: {} },
                        },
                        bosteder: { perioder: {}, perioderSomSkalSlettes: {} },
                        utenlandsopphold: { perioder: {}, perioderSomSkalSlettes: {} },
                        lovbestemtFerie: { perioder: {} },
                        uttak: {
                            perioder: Object.fromEntries(
                                kursPerioder.map((periode) => [
                                    periode,
                                    { timerPleieAvBarnetPerDag: 'PT7H30M' },
                                ]),
                            ),
                        },
                        dataBruktTilUtledning: null,
                        omsorg: { relasjonTilBarnet: 'Far', beskrivelseAvOmsorgsrollen: '' },
                        kurs: {
                            kursholder: {
                                navn: kursholder.holder,
                                institusjonsidentifikator: kursholder.institusjonsUuid,
                            },
                            kursperioder: kursPerioder,
                            reise: { reisedager: [], reisedagerBeskrivelse: '' },
                        },
                    },
                    journalposter: storedJournalposts.map((storedJournalpostId) => ({
                        journalpostId: storedJournalpostId,
                        inneholderInfomasjonSomIkkeKanPunsjes: null,
                        inneholderInformasjonSomIkkeKanPunsjes: null,
                        inneholderMedisinskeOpplysninger: null,
                    })),
                    begrunnelseForInnsending: { tekst: '' },
                    kildesystem: 'punsj',
                };
            };

            msw.worker.use(
                msw.http.get(paths.journalpost, () =>
                    msw.HttpResponse.json(classificationSucceeded ? classifiedJournalpost : sourceJournalpost, {
                        status: classificationSucceeded ? 200 : 201,
                    }),
                ),
                msw.http.get(paths.cases, () => msw.HttpResponse.json([fagsak])),
                msw.http.post(paths.classify, () => {
                    classificationSucceeded = true;
                    return msw.HttpResponse.json({ saksnummer: fagsak.fagsakId }, { status: 200 });
                }),
                msw.http.get(paths.list, () =>
                    msw.HttpResponse.json({
                        søker: applicantId,
                        fagsakTypeKode: 'OLP',
                        søknader: listResponse,
                    }),
                ),
                msw.http.post(paths.create, async ({ request }) => {
                    const body = await request.json();
                    if (
                        !body ||
                        typeof body !== 'object' ||
                        !('journalpostId' in body) ||
                        body.journalpostId !== journalpostId ||
                        !('norskIdent' in body) ||
                        body.norskIdent !== applicantId ||
                        !('pleietrengendeId' in body) ||
                        body.pleietrengendeId !== childId ||
                        !('k9saksnummer' in body) ||
                        body.k9saksnummer !== caseId
                    ) {
                        return msw.HttpResponse.json({ feil: 'Ugyldig OLP-opprettingspayload' }, { status: 400 });
                    }
                    applicationEntityCaseNumber = caseId;
                    savedApplication = initialApplication;
                    return msw.HttpResponse.json(initialApplication, { status: 201 });
                }),
                msw.http.get(`${paths.form}:id`, ({ params }) => {
                    if (
                        String(params.id) !== initialApplication.soeknadId ||
                        !savedApplication
                    ) {
                        return msw.HttpResponse.json({ feil: 'Søknaden finnes ikke' }, { status: 404 });
                    }
                    return msw.HttpResponse.json(savedApplication, { status: 200 });
                }),
                msw.http.post(paths.periods, ({ request }) => {
                    if (
                        !applicationEntityCaseNumber ||
                        new URL(request.url).searchParams.get('saksnummer') !== applicationEntityCaseNumber
                    ) {
                        return msw.HttpResponse.json({ feil: 'Ukjent K9-saksnummer' }, { status: 400 });
                    }
                    return msw.HttpResponse.json(existingK9Periods, { status: 200 });
                }),
                msw.http.get(paths.institutions, () => msw.HttpResponse.json(institutionList, { status: 200 })),
                msw.http.put(paths.update, async ({ request }) => {
                    const body = (await request.json()) as Application;
                    if (body.soeknadId !== initialApplication.soeknadId || !applicationEntityCaseNumber) {
                        return msw.HttpResponse.json({ feil: 'Søknaden finnes ikke' }, { status: 404 });
                    }
                    savedApplication = { ...body, k9saksnummer: null };
                    return msw.HttpResponse.json(body, { status: 200 });
                }),
                msw.http.post(paths.validate, async ({ request }) => {
                    const incoming = (await request.json()) as Application;
                    if (shouldRejectValidation) {
                        return msw.HttpResponse.json(backendValidationError, { status: 400 });
                    }
                    if (!savedApplication || !applicationEntityCaseNumber) {
                        return msw.HttpResponse.json({ feil: 'Søknaden finnes ikke' }, { status: 400 });
                    }
                    const incomingCoursePeriods = (
                        incoming.kurs as { kursperioder: { periode: Period }[] }
                    ).kursperioder;
                    const overlapsExistingK9Period = incomingCoursePeriods.some(({ periode }) =>
                        existingK9Periods.some(
                            (existingPeriod) =>
                                periode.fom <= existingPeriod.tom && existingPeriod.fom <= periode.tom,
                        ),
                    );
                    if (overlapsExistingK9Period) {
                        return msw.HttpResponse.json(
                            {
                                søknadIdDto: incoming.soeknadId,
                                feil: [
                                    {
                                        felt: 'ytelse.kurs.kursperioder[0].periode',
                                        feilkode: 'SYNTHETIC_EXISTING_K9_PERIOD_CONFLICT',
                                        feilmelding: 'Syntetisk avslag for overlappende K9-periode.',
                                    },
                                ],
                            },
                            { status: 400 },
                        );
                    }
                    const receipt = buildK9Receipt(incoming, savedApplication.journalposter);
                    savedApplication = {
                        ...incoming,
                        k9saksnummer: null,
                    };
                    return msw.HttpResponse.json(receipt, { status: 202 });
                }),
                msw.http.post(paths.send, async ({ request }) => {
                    const body = await request.json();
                    if (
                        !savedApplication ||
                        !applicationEntityCaseNumber ||
                        !body ||
                        typeof body !== 'object' ||
                        !('soeknadId' in body) ||
                        body.soeknadId !== savedApplication.soeknadId ||
                        !('norskIdent' in body) ||
                        body.norskIdent !== savedApplication.soekerId ||
                        request.headers.get('X-Nav-NorskIdent') !== savedApplication.soekerId
                    ) {
                        return msw.HttpResponse.json({ feil: 'Lagret søknad finnes ikke' }, { status: 404 });
                    }
                    return msw.HttpResponse.json(
                        buildK9Receipt(savedApplication, savedApplication.journalposter),
                        { status: 202 },
                    );
                }),
            );
        },
        {
            paths: {
                journalpost: ApiPath.JOURNALPOST_GET.replace('{journalpostId}', JOURNALPOST_ID),
                cases: ApiPath.HENT_FAGSAK_PÅ_IDENT,
                classify: ApiPath.JOURNALPOST_MOTTAK,
                list: ApiPath.OLP_EKSISTERENDE_SOKNADER_FIND,
                create: ApiPath.OLP_SOKNAD_CREATE,
                form: ApiPath.OLP_SOKNAD_GET.split('{id}')[0],
                periods: ApiPath.SAKER_PERIODER,
                institutions: ApiPath.OLP_INSTITUSJONER,
                update: ApiPath.OLP_SOKNAD_UPDATE,
                validate: ApiPath.OLP_SOKNAD_VALIDER,
                send: ApiPath.OLP_SOKNAD_SUBMIT,
            },
            sourceJournalpost: journalpost,
            classifiedJournalpost: journalpostEtterJournalføring,
            fagsak: OLP_CASE,
            listResponse: [],
            initialApplication: scenario.initialApplication,
            existingK9Periods: EXISTING_K9_PERIODS,
            institutionList: institusjoner,
            shouldRejectValidation: scenario.rejectValidation,
            applicantId: SØKER_ID,
            childId: BARN_ID,
            caseId: SAK_ID,
            journalpostId: JOURNALPOST_ID,
        },
    );
};

const expectResponse = async (promise: Promise<Response>, status: number) => {
    const response = await promise;
    expect(response.status()).toBe(status);
    expect(response.fromServiceWorker()).toBe(true);
    return response;
};

const openDraftThroughUI = async (page: Page, scenario: Scenario) => {
    const requests = observeApplicationRequests(page);
    const sourceResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', ApiPath.JOURNALPOST_GET.replace('{journalpostId}', JOURNALPOST_ID)),
    );
    await page.goto(`/journalpost/${JOURNALPOST_ID}`);
    const sourceResponse = await expectResponse(sourceResponsePromise, 201);
    expect(await sourceResponse.json()).toEqual(journalpost);
    await installScenarioHandlers(page, scenario);

    const casesResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', ApiPath.HENT_FAGSAK_PÅ_IDENT),
    );
    await page.getByRole('radio', { name: 'Opplæringspenger', exact: true }).check();
    await page.getByRole('radio', { name: 'Ja', exact: true }).check();
    const casesResponse = await expectResponse(casesResponsePromise, 200);
    expect(casesResponse.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(await casesResponse.json()).toEqual([OLP_CASE]);
    await page.getByLabel('Velg fagsak').selectOption(SAK_ID);
    await page.locator('[data-test-id="journalførOgFortsett"]').click();

    const classificationDialog = page.locator('[data-test-id="klassifiserModal"]');
    let classificationResponded = false;
    const classificationResponsePromise = page.waitForResponse((response) => {
        if (!isApiResponse(response, 'POST', ApiPath.JOURNALPOST_MOTTAK)) return false;
        classificationResponded = true;
        return true;
    });
    const refreshedJournalpostRequestPromise = page.waitForRequest(
        (request) =>
            classificationResponded &&
            request.method() === 'GET' &&
            new URL(request.url()).pathname === ApiPath.JOURNALPOST_GET.replace(
                '{journalpostId}',
                JOURNALPOST_ID,
            ),
    );
    await classificationDialog.getByRole('button', { name: 'Journalfør journalposten' }).click();
    const classificationResponse = await expectResponse(classificationResponsePromise, 200);
    expect(classificationResponse.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(classificationResponse.request().postDataJSON()).toMatchObject({
        journalpostId: JOURNALPOST_ID,
        brukerIdent: SØKER_ID,
        pleietrengendeIdent: BARN_ID,
        fagsakYtelseTypeKode: 'OLP',
        saksnummer: SAK_ID,
    });
    const refreshedJournalpostResponse = await (await refreshedJournalpostRequestPromise).response();
    if (!refreshedJournalpostResponse) throw new Error('Oppfrisking av journalposten mangler svar.');
    const refreshed = await expectResponse(Promise.resolve(refreshedJournalpostResponse), 200);
    expect(await refreshed.json()).toEqual(journalpostEtterJournalføring);
    await expect(page).toHaveURL((url) => url.pathname === `${ROOT_PATH}/`);

    await page.getByRole('radio', { name: 'Registrere opplysninger til K9', exact: true }).check();
    const listResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', ApiPath.OLP_EKSISTERENDE_SOKNADER_FIND),
    );
    const createResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'POST', ApiPath.OLP_SOKNAD_CREATE),
    );
    const formResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', applicationPath(scenario.initialApplication.soeknadId)),
    );
    const periodsResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'POST', ApiPath.SAKER_PERIODER),
    );
    await page.getByRole('button', { name: 'Bekreft', exact: true }).click();

    const listResponse = await expectResponse(listResponsePromise, 200);
    expect(listResponse.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(await listResponse.json()).toEqual({
        søker: SØKER_ID,
        fagsakTypeKode: 'OLP',
        søknader: [],
    });
    const createResponse = await expectResponse(createResponsePromise, 201);
    expect(createResponse.request().postDataJSON()).toEqual({
        journalpostId: JOURNALPOST_ID,
        norskIdent: SØKER_ID,
        pleietrengendeId: BARN_ID,
        k9saksnummer: SAK_ID,
    });
    expect(await createResponse.json()).toEqual(scenario.initialApplication);
    const formResponse = await expectResponse(formResponsePromise, 200);
    expect(formResponse.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(await formResponse.json()).toEqual(scenario.initialApplication);
    await expect(page).toHaveURL(
        (url) => url.pathname === `${ROOT_PATH}/skjema/${scenario.initialApplication.soeknadId}/`,
    );
    await expect(page.getByLabel('Mottatt dato')).toHaveValue('20.03.2025');

    const periodsResponse = await expectResponse(periodsResponsePromise, 200);
    expect(periodsResponse.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(new URL(periodsResponse.url()).searchParams.get('saksnummer')).toBe(SAK_ID);
    expect(await periodsResponse.json()).toEqual(EXISTING_K9_PERIODS);

    return requests;
};

const fillForm = async (page: Page, applicationId: string) => {
    await page.getByLabel('Mottatt dato').fill('20.03.2025');
    await page.getByLabel('Mottatt klokkeslett').fill(KLOKKESLETT);

    const institutionsResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', ApiPath.OLP_INSTITUSJONER),
    );
    await page.getByRole('button', { name: 'Legg til nytt institusjonsopphold' }).click();
    const institutionsResponse = await expectResponse(institutionsResponsePromise, 200);
    expect(await institutionsResponse.json()).toEqual(institusjoner);

    const institution = page.getByRole('combobox', {
        name: 'På hvilken helseinstitusjon eller kompetansesenter foregår opplæringen?',
    });
    await institution.fill(KURSHOLDER);
    await page.getByRole('option', { name: KURSHOLDER, exact: true }).click();

    const course = page.getByRole('heading', { name: 'Søknadsperiode og institusjon' }).locator('..');
    await course.getByLabel('Fra og med', { exact: true }).fill('10.03.2025');
    const endDate = course.getByLabel('Til og med', { exact: true });
    await endDate.fill('14.03.2025');

    const savedResponsePromise = page.waitForResponse((response) => {
        if (!isApiResponse(response, 'PUT', ApiPath.OLP_SOKNAD_UPDATE)) return false;
        const body = response.request().postDataJSON();
        return (
            body?.mottattDato === MOTTAKELSESDATO &&
            body?.klokkeslett === KLOKKESLETT &&
            body?.kurs?.kursHolder?.holder === KURSHOLDER &&
            body?.kurs?.kursperioder?.[0]?.periode?.fom === KURS_FOM &&
            body?.kurs?.kursperioder?.[0]?.periode?.tom === KURS_TOM
        );
    });
    await endDate.press('Tab');

    const savedResponse = await expectResponse(savedResponsePromise, 200);
    expect(savedResponse.request().headers()['x-nav-norskident']).toBeUndefined();
    const savedDraft = savedResponse.request().postDataJSON();
    expect(savedDraft).toMatchObject({
        soeknadId: applicationId,
        soekerId: SØKER_ID,
        mottattDato: MOTTAKELSESDATO,
        klokkeslett: KLOKKESLETT,
        barn: { norskIdent: BARN_ID },
        journalposter: [JOURNALPOST_ID],
        kurs: {
            kursHolder: { holder: KURSHOLDER, institusjonsUuid: INSTITUSJON_UUID },
            kursperioder: [{ periode: { fom: KURS_FOM, tom: KURS_TOM } }],
        },
    });
    expect(await savedResponse.json()).toEqual(savedDraft);
    return savedDraft as Application;
};

const readStoredDraft = async (page: Page, applicationId: string) => {
    const path = applicationPath(applicationId);
    const responsePromise = page.waitForResponse((response) => isApiResponse(response, 'GET', path));
    await page.evaluate(async (url) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Lesing av lagret OLP-utkast feilet: ${response.status}`);
        await response.json();
    }, path);
    return (await expectResponse(responsePromise, 200)).json();
};

const expectedStoredDto = (draft: Application) => ({ ...draft, k9saksnummer: null });

const validateThroughUI = async (page: Page, applicationId: string, status: number) => {
    const validationResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'POST', ApiPath.OLP_SOKNAD_VALIDER),
    );
    await page.getByRole('button', { name: 'Send inn', exact: true }).click();
    const validationResponse = await expectResponse(validationResponsePromise, status);
    expect(validationResponse.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(validationResponse.request().postDataJSON()).toMatchObject({
        soeknadId: applicationId,
        soekerId: SØKER_ID,
        mottattDato: MOTTAKELSESDATO,
        klokkeslett: KLOKKESLETT,
        barn: { norskIdent: BARN_ID },
        journalposter: [JOURNALPOST_ID],
        kurs: {
            kursHolder: { holder: KURSHOLDER, institusjonsUuid: INSTITUSJON_UUID },
            kursperioder: [{ periode: { fom: KURS_FOM, tom: KURS_TOM } }],
        },
    });
    return validationResponse;
};

const expectNoSend = (requests: ObservedRequest[]) => {
    expect(
        requests.filter(
            ({ method, path }) => method === 'POST' && path === ApiPath.OLP_SOKNAD_SUBMIT,
        ),
    ).toEqual([]);
};

test('lagrer, validerer og sender OLP-søknaden etter bekreftelse', async ({ page }) => {
    const initialApplication = createInitialApplication(SUCCESS_SØKNAD_ID);
    const requests = await openDraftThroughUI(page, { initialApplication, rejectValidation: false });

    const savedDraft = await fillForm(page, SUCCESS_SØKNAD_ID);
    expect(initialApplication.barn).toEqual({ norskIdent: null, foedselsdato: null });
    expect(savedDraft.barn).toEqual({ norskIdent: BARN_ID, foedselsdato: '' });
    expect(await readStoredDraft(page, SUCCESS_SØKNAD_ID)).toEqual(expectedStoredDto(savedDraft));
    expect(
        requests.filter(({ method, path }) => method === 'POST' && path === ApiPath.OLP_SOKNAD_VALIDER),
    ).toEqual([]);
    expectNoSend(requests);

    const validationResponse = await validateThroughUI(page, SUCCESS_SØKNAD_ID, 202);
    const validationDraft = validationResponse.request().postDataJSON();
    expect(validationDraft).toMatchObject({
        soeknadId: SUCCESS_SØKNAD_ID,
        soekerId: SØKER_ID,
        barn: { norskIdent: BARN_ID },
        journalposter: [JOURNALPOST_ID],
        mottattDato: MOTTAKELSESDATO,
        klokkeslett: KLOKKESLETT,
        kurs: {
            kursHolder: { holder: KURSHOLDER, institusjonsUuid: INSTITUSJON_UUID },
            kursperioder: [{ periode: { fom: KURS_FOM, tom: KURS_TOM } }],
        },
    });
    expect(await readStoredDraft(page, SUCCESS_SØKNAD_ID)).toEqual(expectedStoredDto(validationDraft));
    const validationReceipt = await validationResponse.json();
    expect(validationReceipt).toMatchObject({
        søknadId: SUCCESS_SØKNAD_ID,
        versjon: '1.0.0',
        mottattDato: `${MOTTAKELSESDATO}T${KLOKKESLETT}:00+01:00`,
        søker: { norskIdentitetsnummer: SØKER_ID },
        ytelse: {
            type: 'OPPLAERINGSPENGER',
            barn: { norskIdentitetsnummer: BARN_ID, fødselsdato: null },
            søknadsperiode: [`${KURS_FOM}/${KURS_TOM}`],
            kurs: {
                kursholder: { navn: KURSHOLDER, institusjonsidentifikator: INSTITUSJON_UUID },
                kursperioder: [`${KURS_FOM}/${KURS_TOM}`],
            },
            uttak: {
                perioder: { [`${KURS_FOM}/${KURS_TOM}`]: { timerPleieAvBarnetPerDag: 'PT7H30M' } },
            },
        },
        journalposter: [
            {
                journalpostId: JOURNALPOST_ID,
                inneholderMedisinskeOpplysninger: null,
            },
        ],
        kildesystem: 'punsj',
    });

    const review = page.getByRole('dialog', { name: 'Oppsummering', exact: true });
    await expect(review).toBeVisible();
    await expect(review).toContainText(KURSHOLDER);
    await expect(review).toContainText('10.03.2025 - 14.03.2025');
    expectNoSend(requests);

    await review.getByRole('button', { name: 'Videre', exact: true }).click();
    const confirmation = page.getByRole('dialog', { name: 'erdusikkermodal' });
    await expect(confirmation).toBeVisible();
    expectNoSend(requests);

    const sendResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'POST', ApiPath.OLP_SOKNAD_SUBMIT),
    );
    await confirmation.getByRole('button', { name: 'Send inn', exact: true }).click();
    const sendResponse = await expectResponse(sendResponsePromise, 202);
    expect(sendResponse.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(sendResponse.request().postDataJSON()).toEqual({
        norskIdent: SØKER_ID,
        soeknadId: SUCCESS_SØKNAD_ID,
    });
    expect(await sendResponse.json()).toEqual(validationReceipt);
    await expect(page.getByText(/^Opplysningene er sendt til behandling\./)).toBeVisible();
    await expect(page.getByText(KURSHOLDER, { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tilbake til LOS', exact: true })).toBeVisible();
    expect(
        requests.filter(
            ({ method, path }) => method === 'POST' && path === ApiPath.OLP_SOKNAD_SUBMIT,
        ),
    ).toHaveLength(1);
});

test('viser OLP-avslag fra backend og beholder utkastet uten å sende', async ({ page }) => {
    const initialApplication = createInitialApplication(REJECTION_SØKNAD_ID);
    const requests = await openDraftThroughUI(page, { initialApplication, rejectValidation: true });
    const savedDraft = await fillForm(page, REJECTION_SØKNAD_ID);
    expect(await readStoredDraft(page, REJECTION_SØKNAD_ID)).toEqual(expectedStoredDto(savedDraft));
    expect(
        requests.filter(({ method, path }) => method === 'POST' && path === ApiPath.OLP_SOKNAD_VALIDER),
    ).toEqual([]);
    expectNoSend(requests);

    const validationResponse = await validateThroughUI(page, REJECTION_SØKNAD_ID, 400);
    const rejection = await validationResponse.json();
    expect(rejection).toEqual({
        søknadIdDto: REJECTION_SØKNAD_ID,
        feil: [
            {
                felt: 'ytelse.kurs.kursperioder[0].periode',
                feilkode: 'SYNTHETIC_KURS_PERIOD_REJECTION',
                feilmelding: 'Syntetisk backendavslag for OLP-validering.',
            },
        ],
    });
    expect(await readStoredDraft(page, REJECTION_SØKNAD_ID)).toEqual(expectedStoredDto(savedDraft));
    await expect(
        page.getByRole('heading', {
            name: 'Du må fikse disse feilene før du kan sende inn punsjemeldingen.',
        }),
    ).toBeVisible();
    await expect(page.getByText('Syntetisk backendavslag for OLP-validering.', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Mottatt dato')).toHaveValue('20.03.2025');
    await expect(page.getByLabel('Mottatt klokkeslett')).toHaveValue(KLOKKESLETT);
    await expect(page.getByText(KURSHOLDER, { exact: true }).first()).toBeVisible();
    const course = page.getByRole('heading', { name: 'Søknadsperiode og institusjon' }).locator('..');
    await expect(course.getByLabel('Fra og med', { exact: true })).toHaveValue('10.03.2025');
    await expect(course.getByLabel('Til og med', { exact: true })).toHaveValue('14.03.2025');
    await expect(page.getByRole('dialog', { name: 'Oppsummering', exact: true })).toHaveCount(0);
    await expect(page.getByRole('dialog', { name: 'erdusikkermodal' })).toHaveCount(0);
    expectNoSend(requests);
});
