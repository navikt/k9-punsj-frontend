import { expect, test, type Locator, type Page, type Request, type Response } from '@playwright/test';

import { ApiPath } from '../../src/app/apiConfig';

const JOURNALPOST_ID = '200';
const APPLICANT_ID = '17420373147';
const CASE_ID = '1DMU93M';
const NEW_APPLICATION_ID = '75aa2113-81f4-4c0d-b9a2-467d4a0b76be';
const CORRECTION_APPLICATION_ID = '35d01229-6f69-4282-86f0-c7e0842c4ac9';
const EMPLOYER_ORG_NUMBER = '979312059';
const SELF_EMPLOYED_ORG_NUMBER = '974761076';
const ABSENCE_START = '2022-10-01';
const ABSENCE_END = '2022-10-10';
const GENERIC_BACKEND_ERROR =
    'Hei, det har oppstått en helt generisk feil. Med vennlig hilsen backend';
const EXISTING_PERIODS = [
    { fom: '2022-09-01', tom: '2022-09-02' },
    { fom: '2022-09-05', tom: '2022-09-09' },
    { fom: '2022-09-12', tom: '2022-09-16' },
    { fom: '2022-09-19', tom: '2022-09-23' },
    { fom: '2022-09-26', tom: '2022-09-29' },
];

type Activity = 'arbeidstaker' | 'frilanser' | 'selvstendig';
type FormKind = 'ny' | 'korrigering';

type Scenario = {
    title: string;
    activity: Activity;
    kind: FormKind;
};

type OMPUTFravaersperiode = {
    aktivitetsFravær: string;
    organisasjonsnummer: string;
    fraværÅrsak: string;
    søknadÅrsak: string;
    periode: { fom: string; tom: string };
    faktiskTidPrDag: string;
    normalArbeidstidPrDag: string;
};

type OMPUTPayload = {
    soeknadId: string;
    soekerId: string;
    mottattDato: string;
    journalposter: string[];
    opptjeningAktivitet?: unknown;
    fravaersperioder?: OMPUTFravaersperiode[];
    metadata?: {
        signatur?: string;
        medlemskap?: string;
        utenlandsopphold?: string;
        harSoekerDekketOmsorgsdager?: string;
    };
    erKorrigering?: boolean;
};

type SaveGate = {
    holdNextSave: boolean;
    saveStarted: boolean;
    releaseSave?: () => void;
};

type OMPUTTestWindow = Window & { __omputSaveGate?: SaveGate };

const scenarios: Scenario[] = [
    { title: 'sender inn ny søknad for arbeidstaker', kind: 'ny', activity: 'arbeidstaker' },
    { title: 'sender inn ny søknad for frilanser', kind: 'ny', activity: 'frilanser' },
    {
        title: 'sender inn ny søknad for selvstendig næringsdrivende',
        kind: 'ny',
        activity: 'selvstendig',
    },
    { title: 'sender inn korrigering for arbeidstaker', kind: 'korrigering', activity: 'arbeidstaker' },
    { title: 'sender inn korrigering for frilanser', kind: 'korrigering', activity: 'frilanser' },
    {
        title: 'sender inn korrigering for selvstendig næringsdrivende',
        kind: 'korrigering',
        activity: 'selvstendig',
    },
];

const isResponse = (response: Response, method: string, path: string) =>
    response.request().method() === method && new URL(response.url()).pathname === path;

const isRequest = (request: Request, method: string, path: string) =>
    request.method() === method && new URL(request.url()).pathname === path;

const applicationIdFor = (kind: FormKind) =>
    kind === 'ny' ? NEW_APPLICATION_ID : CORRECTION_APPLICATION_ID;

const applicationPathFor = (kind: FormKind) =>
    ApiPath.OMP_UT_SOKNAD_GET.replace('{id}', applicationIdFor(kind));

const applicationRouteFor = (kind: FormKind) =>
    `/journalpost/${JOURNALPOST_ID}/omsorgspenger-utbetaling/skjema/${applicationIdFor(kind)}`;

const expectedActivity = (scenario: Scenario) => {
    const selfEmployedCorrection = {
        organisasjonsnummer: scenario.activity === 'selvstendig' ? SELF_EMPLOYED_ORG_NUMBER : '',
        info: {
            registrertIUtlandet: false,
            landkode: '',
            periode:
                scenario.activity === 'selvstendig'
                    ? { fom: '2015-10-01', tom: '' }
                    : { fom: '', tom: '' },
            virksomhetstyper: scenario.activity === 'selvstendig' ? ['Fiske'] : [],
        },
    };

    switch (scenario.activity) {
        case 'arbeidstaker':
            return {
                arbeidstaker: [{ organisasjonsnummer: EMPLOYER_ORG_NUMBER }],
                ...(scenario.kind === 'korrigering'
                    ? { selvstendigNaeringsdrivende: selfEmployedCorrection }
                    : {}),
            };
        case 'frilanser':
            return {
                frilanser: {
                    startdato: '2019-01-01',
                    sluttdato: ABSENCE_END,
                    jobberFortsattSomFrilans: false,
                },
                ...(scenario.kind === 'korrigering'
                    ? { selvstendigNaeringsdrivende: selfEmployedCorrection }
                    : {}),
            };
        case 'selvstendig':
            return {
                selvstendigNaeringsdrivende:
                    scenario.kind === 'korrigering'
                        ? selfEmployedCorrection
                        : {
                              virksomhetNavn: 'Bobbys Burger',
                              organisasjonsnummer: SELF_EMPLOYED_ORG_NUMBER,
                              info: {
                                  periode: { fom: '2015-10-01', tom: '' },
                                  virksomhetstyper: ['Fiske'],
                                  erFiskerPåBladB: true,
                                  landkode: '',
                                  regnskapsførerNavn: 'Geir-Per Enoksen',
                                  regnskapsførerTlf: '97476107',
                                  harSøkerRegnskapsfører: true,
                                  registrertIUtlandet: false,
                                  bruttoInntekt: '',
                                  erNyoppstartet: false,
                                  erVarigEndring: false,
                                  endringInntekt: '',
                                  endringDato: '',
                                  endringBegrunnelse: '',
                              },
                          },
            };
    }
};

const expectedPayload = (scenario: Scenario) => {
    const correction = scenario.kind === 'korrigering';
    const activityCode = {
        arbeidstaker: 'ARBEIDSTAKER',
        frilanser: 'FRILANSER',
        selvstendig: 'SELVSTENDIG_VIRKSOMHET',
    }[scenario.activity];
    const organizationNumber =
        scenario.activity === 'arbeidstaker'
            ? EMPLOYER_ORG_NUMBER
            : scenario.activity === 'selvstendig'
              ? SELF_EMPLOYED_ORG_NUMBER
              : '';

    return {
        soeknadId: applicationIdFor(scenario.kind),
        soekerId: APPLICANT_ID,
        k9saksnummer: CASE_ID,
        mottattDato: '2020-10-12',
        klokkeslett: '12:53',
        journalposter: [JOURNALPOST_ID],
        barn: [],
        erKorrigering: correction,
        harInfoSomIkkeKanPunsjes: false,
        harMedisinskeOpplysninger: false,
        metadata: {
            arbeidsforhold: {
                arbeidstaker: scenario.activity === 'arbeidstaker',
                selvstendigNaeringsdrivende: scenario.activity === 'selvstendig',
                frilanser: scenario.activity === 'frilanser',
            },
            signatur: correction ? '' : 'ikkeRelevant',
            medlemskap: correction ? '' : 'ikkeOpplyst',
            utenlandsopphold: correction ? '' : 'ikkeOpplyst',
            harSoekerDekketOmsorgsdager:
                !correction && scenario.activity !== 'arbeidstaker' ? 'ja' : '',
        },
        opptjeningAktivitet: expectedActivity(scenario),
        fravaersperioder: [
            {
                aktivitetsFravær: activityCode,
                organisasjonsnummer: organizationNumber,
                fraværÅrsak: 'ORDINÆRT_FRAVÆR',
                søknadÅrsak: scenario.activity === 'arbeidstaker' ? 'KONFLIKT_MED_ARBEIDSGIVER' : '',
                periode: { fom: ABSENCE_START, tom: ABSENCE_END },
                faktiskTidPrDag: '7',
                normalArbeidstidPrDag: '7',
            },
        ],
        ...(correction ? {} : { bosteder: [], utenlandsopphold: [] }),
    };
};

const expectPayload = (payload: OMPUTPayload, scenario: Scenario) => {
    const expected = expectedPayload(scenario);
    expect(payload).toMatchObject(expected);
    expect(payload.fravaersperioder).toEqual(expected.fravaersperioder);
    expect(payload.opptjeningAktivitet).toEqual(expected.opptjeningAktivitet);

    if (scenario.kind === 'korrigering') {
        expect(payload).not.toHaveProperty('bosteder');
        expect(payload).not.toHaveProperty('utenlandsopphold');
    }
};

const isCompleteApplicationPayload = (payload: OMPUTPayload, scenario: Scenario) => {
    const expected = expectedPayload(scenario);
    const expectedPeriod = expected.fravaersperioder[0];
    const editedPeriod = payload.fravaersperioder?.find(
        (period) =>
            period.aktivitetsFravær === expectedPeriod.aktivitetsFravær &&
            period.organisasjonsnummer === expectedPeriod.organisasjonsnummer &&
            period.periode.fom === ABSENCE_START &&
            period.periode.tom === ABSENCE_END &&
            period.faktiskTidPrDag === '7' &&
            period.normalArbeidstidPrDag === '7',
    );
    return (
        payload.soeknadId === expected.soeknadId &&
        payload.erKorrigering === (scenario.kind === 'korrigering') &&
        payload.metadata?.signatur === expected.metadata.signatur &&
        payload.metadata?.medlemskap === expected.metadata.medlemskap &&
        payload.metadata?.utenlandsopphold === expected.metadata.utenlandsopphold &&
        !!editedPeriod
    );
};

const expectApplicantHeader = async (request: Request) => {
    expect(await request.allHeaders()).toMatchObject({ 'x-nav-norskident': APPLICANT_ID });
};

async function openApplication(page: Page, kind: FormKind) {
    const applicationPath = applicationPathFor(kind);
    const applicationResponsePromise = page.waitForResponse((response) =>
        isResponse(response, 'GET', applicationPath),
    );
    const periodsResponsePromise = page.waitForResponse(
        (response) =>
            isResponse(response, 'POST', ApiPath.SAKER_PERIODER) &&
            new URL(response.url()).searchParams.get('saksnummer') === CASE_ID,
    );

    await page.goto(applicationRouteFor(kind));
    const [applicationResponse, periodsResponse] = await Promise.all([
        applicationResponsePromise,
        periodsResponsePromise,
    ]);

    expect(applicationResponse.status()).toBe(200);
    expect(applicationResponse.fromServiceWorker()).toBe(true);
    expect(applicationResponse.request().method()).toBe('GET');
    expect(await applicationResponse.json()).toMatchObject({
        soeknadId: applicationIdFor(kind),
        soekerId: APPLICANT_ID,
        k9saksnummer: CASE_ID,
        mottattDato: '2020-10-12',
        klokkeslett: '12:53',
        journalposter: [JOURNALPOST_ID],
    });

    expect(periodsResponse.status()).toBe(200);
    expect(periodsResponse.fromServiceWorker()).toBe(true);
    expect(periodsResponse.request().method()).toBe('POST');
    await expectApplicantHeader(periodsResponse.request());
    expect(new URL(periodsResponse.url()).searchParams.get('saksnummer')).toBe(CASE_ID);
    expect(await periodsResponse.json()).toEqual(kind === 'korrigering' ? EXISTING_PERIODS : []);

    return applicationResponse;
}

async function installMutationHandlers(page: Page, kind: FormKind, validationError = false) {
    await page.evaluate(
        ({
            updatePath,
            validationPath,
            submitPath,
            applicationId,
            applicantId,
            journalpostId,
            genericBackendError,
            shouldReturnValidationError,
        }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');

            let savedApplication: OMPUTPayload = {
                soeknadId: applicationId,
                soekerId: applicantId,
                mottattDato: '2020-10-12',
                journalposter: [journalpostId],
            };
            const gate: SaveGate = { holdNextSave: false, saveStarted: false };
            (window as OMPUTTestWindow).__omputSaveGate = gate;

            const receiptFor = (application: OMPUTPayload) => ({
                søknadId: application.soeknadId,
                versjon: '1.1.0',
                mottattDato: `${application.mottattDato}T10:53:00.000Z`,
                søker: { norskIdentitetsnummer: application.soekerId },
                ytelse: {
                    type: 'OMP_UT',
                    fosterbarn: [],
                    aktivitet: {},
                    fraværsperioder: (application.fravaersperioder || []).map((period) => ({
                        periode: `${period.periode.fom}/${period.periode.tom}`,
                        duration: 'PT7H30M',
                        delvisFravær: {
                            normalarbeidstid: 'PT7H',
                            fravær: 'PT7H',
                        },
                        årsak: period.fraværÅrsak,
                        søknadÅrsak: period.søknadÅrsak,
                        aktivitetFravær: [period.aktivitetsFravær],
                        arbeidsforholdId: null,
                        arbeidsgiverOrgNr: period.organisasjonsnummer || null,
                    })),
                    fraværsperioderKorrigeringIm: null,
                    bosteder: null,
                    utenlandsopphold: null,
                },
                språk: 'nb',
                journalposter: application.journalposter.map((receiptJournalpostId) => ({
                    inneholderInfomasjonSomIkkeKanPunsjes: null,
                    inneholderInformasjonSomIkkeKanPunsjes: false,
                    inneholderMedisinskeOpplysninger: false,
                    journalpostId: receiptJournalpostId,
                })),
                begrunnelseForInnsending: { tekst: null },
            });

            msw.worker.use(
                msw.http.put(updatePath, async ({ request }) => {
                    const application = (await request.json()) as OMPUTPayload;
                    if (gate.holdNextSave) {
                        gate.holdNextSave = false;
                        gate.saveStarted = true;
                        await new Promise<void>((resolve) => {
                            gate.releaseSave = resolve;
                        });
                    }
                    savedApplication = application;
                    return msw.HttpResponse.json(savedApplication, { status: 200 });
                }),
                msw.http.post(validationPath, async ({ request }) => {
                    const application = (await request.json()) as OMPUTPayload;
                    if (shouldReturnValidationError) {
                        return msw.HttpResponse.json(
                            {
                                feil: [
                                    {
                                        felt: 'feil',
                                        feilkode: 'generiskFeil',
                                        feilmelding: genericBackendError,
                                    },
                                ],
                                søknadIdDto: applicationId,
                            },
                            { status: 400 },
                        );
                    }
                    return msw.HttpResponse.json(receiptFor(application), { status: 202 });
                }),
                msw.http.post(submitPath, () =>
                    msw.HttpResponse.json(receiptFor(savedApplication), { status: 202 }),
                ),
            );
        },
        {
            updatePath: ApiPath.OMP_UT_SOKNAD_UPDATE,
            validationPath: ApiPath.OMP_UT_SOKNAD_VALIDER,
            submitPath: ApiPath.OMP_UT_SOKNAD_SUBMIT,
            applicationId: applicationIdFor(kind),
            applicantId: APPLICANT_ID,
            journalpostId: JOURNALPOST_ID,
            genericBackendError: GENERIC_BACKEND_ERROR,
            shouldReturnValidationError: validationError,
        },
    );
}

async function fillValidForm(page: Page, scenario: Scenario) {
    if (scenario.kind === 'korrigering') {
        await expect(page.getByRole('heading', { name: 'Eksisterende perioder' })).toBeVisible();
        await expect(page.getByText(/01\.09\.2022/)).toBeVisible();
        await page.getByRole('radio', { name: 'Korrigering', exact: true }).check();
        await expect(
            page.getByText('Hvis søker er under 18 år må søknad være signert av forelder/verge/fullmektig'),
        ).toHaveCount(0);
        await expect(page.getByRole('heading', { name: 'Medlemskap' })).toHaveCount(0);
        await expect(page.getByRole('heading', { name: 'Utenlandsopphold' })).toHaveCount(0);
    }

    if (scenario.activity === 'arbeidstaker') {
        await page.getByLabel('Arbeidstaker', { exact: true }).check();
        await page.getByLabel('Organisasjon', { exact: true }).selectOption(EMPLOYER_ORG_NUMBER);
        await page.getByLabel('Søknadsårsak').selectOption('KONFLIKT_MED_ARBEIDSGIVER');
    } else if (scenario.activity === 'frilanser') {
        await page.getByLabel('Frilanser', { exact: true }).check();
        if (scenario.kind === 'korrigering') {
            await expect(
                page.getByRole('radiogroup', { name: 'Har søker dekket 10 omsorgsdager?' }),
            ).toHaveCount(0);
        }
        if (scenario.kind === 'ny') {
            await page
                .getByRole('radiogroup', { name: 'Har søker dekket 10 omsorgsdager?' })
                .getByRole('radio', { name: 'Ja' })
                .check();
        }
        await page.getByLabel('Når startet søker som frilanser?').fill('01.01.2019');
        await page.getByLabel('Når startet søker som frilanser?').press('Tab');
        await page
            .getByRole('radiogroup', { name: 'Jobber søker fortsatt som frilanser?' })
            .getByRole('radio', { name: 'Nei' })
            .check();
        await page.getByLabel('Når sluttet søker som frilanser?').fill('10.10.2022');
        await page.getByLabel('Når sluttet søker som frilanser?').press('Tab');
    } else {
        await page.getByLabel('Selvstendig næringsdrivende', { exact: true }).check();
        if (scenario.kind === 'korrigering') {
            await expect(
                page.getByRole('radiogroup', { name: 'Har søker dekket 10 omsorgsdager?' }),
            ).toHaveCount(0);
        }
        if (scenario.kind === 'ny') {
            await page
                .getByRole('radiogroup', { name: 'Har søker dekket 10 omsorgsdager?' })
                .getByRole('radio', { name: 'Ja' })
                .check();
        }
        await page.getByRole('radio', { name: 'Fiske', exact: true }).check();
        if (scenario.kind === 'korrigering') {
            await expect(page.getByRole('radiogroup', { name: 'Er søker fisker på blad B?' })).toHaveCount(0);
            await expect(page.getByLabel('Hva heter virksomheten?')).toHaveCount(0);
            await expect(page.getByRole('radiogroup', { name: 'Har søker regnskapsfører?' })).toHaveCount(0);
            await expect(page.getByLabel('Navn på regnskapsfører')).toHaveCount(0);
            await expect(page.getByLabel('Telefonnummer til regnskapsfører')).toHaveCount(0);
        }
        if (scenario.kind === 'ny') {
            await page
                .getByRole('radiogroup', { name: 'Er søker fisker på blad B?' })
                .getByRole('radio', { name: 'Ja' })
                .check();
            await page.getByLabel('Hva heter virksomheten?').fill('Bobbys Burger');
        }
        await page.getByLabel('Organisasjonsnummer', { exact: true }).fill(SELF_EMPLOYED_ORG_NUMBER);
        if (scenario.kind === 'ny') {
            await page
                .getByRole('radiogroup', { name: 'Har søker regnskapsfører?' })
                .getByRole('radio', { name: 'Ja' })
                .check();
            await page.getByLabel('Navn på regnskapsfører').fill('Geir-Per Enoksen');
            await page.getByLabel('Telefonnummer til regnskapsfører').fill('97476107');
        }
        const businessStart = page.getByLabel('Startdato');
        await businessStart.fill('01.10.2015');
        await businessStart.press('Tab');
    }

    await page.getByLabel('Fraværsårsak').selectOption('ORDINÆRT_FRAVÆR');
    const absenceStart = page.getByLabel('Fra og med').last();
    await absenceStart.fill('01.10.2022');
    await absenceStart.press('Tab');
    const absenceEnd = page.getByLabel('Til og med').last();
    await absenceEnd.fill('10.10.2022');
    await absenceEnd.press('Tab');
    await page.getByLabel('Normal arbeidstid per dag').fill('7');
    await page.getByLabel('Timer fravær per dag').fill('7');

    if (scenario.kind === 'ny') {
        await page.getByRole('radio', { name: 'Ikke relevant', exact: true }).check();
        await page
            .getByRole('radiogroup', { name: /Har søker bodd i utlandet/ })
            .getByRole('radio', { name: 'Ikke opplyst' })
            .check();
        await page
            .getByRole('radiogroup', { name: 'Skal søker reise til utlandet i perioden det søkes for?' })
            .getByRole('radio', { name: 'Ikke opplyst' })
            .check();
    }
}

function waitForEditedSave(page: Page, scenario: Scenario) {
    return page.waitForResponse(
        (response) =>
            isResponse(response, 'PUT', ApiPath.OMP_UT_SOKNAD_UPDATE) &&
            isCompleteApplicationPayload(response.request().postDataJSON() as OMPUTPayload, scenario),
    );
}

async function expectEditedSave(save: Response, scenario: Scenario) {
    expect(save.status()).toBe(200);
    expect(save.fromServiceWorker()).toBe(true);
    const payload = save.request().postDataJSON() as OMPUTPayload;
    expect(payload).toMatchObject({
        soeknadId: applicationIdFor(scenario.kind),
        soekerId: APPLICANT_ID,
        erKorrigering: scenario.kind === 'korrigering',
        fravaersperioder: expect.arrayContaining([expectedPayload(scenario).fravaersperioder[0]]),
    });
    expect(await save.json()).toEqual(save.request().postDataJSON());
    return save;
}

async function expectReceiptValues(receipt: Locator, scenario: Scenario) {
    const expectedActivityTitle =
        scenario.activity === 'arbeidstaker'
            ? 'Arbeidstaker'
            : scenario.activity === 'frilanser'
              ? 'Frilanser'
              : 'Selvstendig';
    await expect(receipt).toContainText(expectedActivityTitle);
    await expect(receipt).toContainText('01.10.2022');
    await expect(receipt).toContainText('10.10.2022');
    await expect(receipt).toContainText(/Normal arbeidstid per dag:\s*7/);
    await expect(receipt).toContainText(/Timer fravær per dag:\s*7/);
    if (scenario.activity === 'arbeidstaker') {
        await expect(receipt).toContainText(EMPLOYER_ORG_NUMBER);
        await expect(receipt).toContainText('Bestridelse');
    }
    if (scenario.activity === 'selvstendig') {
        await expect(receipt).toContainText(SELF_EMPLOYED_ORG_NUMBER);
    }
}

async function submitSuccessfulScenario(page: Page, scenario: Scenario) {
    const submitRequests: Request[] = [];
    let confirming = false;
    let eventOrder = 0;
    let finalSaveResponseOrder = 0;
    let submitRequestOrder = 0;

    page.on('request', (request) => {
        if (isRequest(request, 'POST', ApiPath.OMP_UT_SOKNAD_SUBMIT)) {
            submitRequests.push(request);
            submitRequestOrder = ++eventOrder;
        }
    });
    page.on('response', (response) => {
        if (
            confirming &&
            isResponse(response, 'PUT', ApiPath.OMP_UT_SOKNAD_UPDATE) &&
            isCompleteApplicationPayload(
                response.request().postDataJSON() as OMPUTPayload,
                scenario,
            )
        ) {
            finalSaveResponseOrder = ++eventOrder;
            confirming = false;
        }
    });

    await openApplication(page, scenario.kind);
    await installMutationHandlers(page, scenario.kind);
    const editedSavePromise = waitForEditedSave(page, scenario);
    await fillValidForm(page, scenario);

    const editedSave = await expectEditedSave(await editedSavePromise, scenario);
    expect(editedSave.request().method()).toBe('PUT');

    const previewValidationPromise = page.waitForResponse((response) =>
        isResponse(response, 'POST', ApiPath.OMP_UT_SOKNAD_VALIDER),
    );
    await page.getByRole('button', { name: 'Send inn', exact: true }).click();
    const previewValidation = await previewValidationPromise;
    expect(previewValidation.status()).toBe(202);
    expect(previewValidation.fromServiceWorker()).toBe(true);
    await expectApplicantHeader(previewValidation.request());
    expectPayload(previewValidation.request().postDataJSON() as OMPUTPayload, scenario);
    expect(await previewValidation.json()).toMatchObject({
        søknadId: applicationIdFor(scenario.kind),
        mottattDato: '2020-10-12T10:53:00.000Z',
        søker: { norskIdentitetsnummer: APPLICANT_ID },
        ytelse: {
            type: 'OMP_UT',
            fraværsperioder: [
                {
                    periode: `${ABSENCE_START}/${ABSENCE_END}`,
                    duration: 'PT7H30M',
                    delvisFravær: { normalarbeidstid: 'PT7H', fravær: 'PT7H' },
                    årsak: 'ORDINÆRT_FRAVÆR',
                },
            ],
        },
    });

    const preview = page.getByTestId('validertOMPUTSoknadModal');
    await expect(preview).toBeVisible();
    await expectReceiptValues(preview, scenario);
    expect(submitRequests).toHaveLength(0);

    await page.getByRole('button', { name: 'Videre', exact: true }).click();
    const confirmation = page.getByTestId('erdusikkermodal');
    await expect(confirmation).toBeVisible();
    expect(submitRequests).toHaveLength(0);

    const finalValidationPromise = page.waitForResponse((response) =>
        isResponse(response, 'POST', ApiPath.OMP_UT_SOKNAD_VALIDER),
    );
    const finalSaveRequestPromise = page.waitForRequest(
        (request) =>
            isRequest(request, 'PUT', ApiPath.OMP_UT_SOKNAD_UPDATE) &&
            isCompleteApplicationPayload(request.postDataJSON() as OMPUTPayload, scenario),
    );
    const finalSaveResponsePromise = page.waitForResponse(
        (response) =>
            isResponse(response, 'PUT', ApiPath.OMP_UT_SOKNAD_UPDATE) &&
            isCompleteApplicationPayload(response.request().postDataJSON() as OMPUTPayload, scenario),
    );
    const submitResponsePromise = page.waitForResponse((response) =>
        isResponse(response, 'POST', ApiPath.OMP_UT_SOKNAD_SUBMIT),
    );

    await page.evaluate(() => {
        const gate = (window as OMPUTTestWindow).__omputSaveGate;
        if (!gate) throw new Error('Lagringsporten er ikke tilgjengelig.');
        gate.holdNextSave = true;
    });
    confirming = true;
    await confirmation.getByRole('button', { name: 'Send inn', exact: true }).click();

    const finalValidation = await finalValidationPromise;
    expect(finalValidation.status()).toBe(202);
    expect(finalValidation.fromServiceWorker()).toBe(true);
    await expectApplicantHeader(finalValidation.request());
    expectPayload(finalValidation.request().postDataJSON() as OMPUTPayload, scenario);
    const finalSaveRequest = await finalSaveRequestPromise;
    expect(finalSaveRequest.method()).toBe('PUT');
    expectPayload(finalSaveRequest.postDataJSON() as OMPUTPayload, scenario);

    await page.waitForFunction(() => (window as OMPUTTestWindow).__omputSaveGate?.saveStarted);
    expect(submitRequests).toHaveLength(0);

    await page.evaluate(() => {
        const gate = (window as OMPUTTestWindow).__omputSaveGate;
        if (!gate?.releaseSave) throw new Error('Den pågående lagringen kan ikke frigis.');
        gate.releaseSave();
    });

    const finalSave = await finalSaveResponsePromise;
    expect(finalSave.status()).toBe(200);
    expect(finalSave.fromServiceWorker()).toBe(true);
    expectPayload(finalSave.request().postDataJSON() as OMPUTPayload, scenario);
    expect(await finalSave.json()).toEqual(finalSave.request().postDataJSON());

    const submission = await submitResponsePromise;
    expect(submission.status()).toBe(202);
    expect(submission.fromServiceWorker()).toBe(true);
    await expectApplicantHeader(submission.request());
    expect(submission.request().postDataJSON()).toEqual({
        norskIdent: APPLICANT_ID,
        soeknadId: applicationIdFor(scenario.kind),
    });
    expect(await submission.json()).toMatchObject({
        søknadId: applicationIdFor(scenario.kind),
        mottattDato: '2020-10-12T10:53:00.000Z',
        søker: { norskIdentitetsnummer: APPLICANT_ID },
        ytelse: { type: 'OMP_UT' },
    });
    expect(submitRequests).toHaveLength(1);
    expect(finalSaveResponseOrder).toBeGreaterThan(0);
    expect(submitRequestOrder).toBeGreaterThan(finalSaveResponseOrder);

    await expect(
        page.getByText(
            'Opplysningene er sendt til behandling. Vær oppmerksom på at det kan ta litt tid før opplysningene er synlige på behandlingen i K9-sak.',
        ),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Oppsummering' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tilbake til LOS' })).toBeVisible();
    await expect(page.getByText(/Fraværsperiode:.*01\.10\.2022.*10\.10\.2022/)).toBeVisible();
    await expect(page.getByText(/Normal arbeidstid per dag:.*7 timer/)).toBeVisible();
    await expect(page.getByText(/Timer fravær per dag:.*7 timer/)).toBeVisible();
}

for (const scenario of scenarios) {
    test(scenario.title, async ({ page }) => {
        await submitSuccessfulScenario(page, scenario);
    });
}

test('stanser innsending ved klientvalidering uten forhåndsvisning', async ({ page }) => {
    const submitRequests: Request[] = [];
    page.on('request', (request) => {
        if (isRequest(request, 'POST', ApiPath.OMP_UT_SOKNAD_SUBMIT)) submitRequests.push(request);
    });

    await openApplication(page, 'ny');
    await installMutationHandlers(page, 'ny');

    const validationResponsePromise = page.waitForResponse((response) =>
        isResponse(response, 'POST', ApiPath.OMP_UT_SOKNAD_VALIDER),
    );
    await page.getByRole('button', { name: 'Send inn', exact: true }).click();
    const validationResponse = await validationResponsePromise;
    expect(validationResponse.status()).toBe(202);
    expect(validationResponse.fromServiceWorker()).toBe(true);
    await expectApplicantHeader(validationResponse.request());
    expect(validationResponse.request().postDataJSON()).toMatchObject({
        soeknadId: NEW_APPLICATION_ID,
        soekerId: APPLICANT_ID,
        journalposter: [JOURNALPOST_ID],
    });

    await expect(
        page.getByText('Du må fikse disse feilene før du kan sende inn punsjemeldingen.'),
    ).toBeVisible();
    await expect(page.getByTestId('validertOMPUTSoknadModal')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Videre', exact: true })).toHaveCount(0);
    await expect(page.getByTestId('erdusikkermodal')).toHaveCount(0);
    expect(submitRequests).toHaveLength(0);
});

test('viser backendvalideringsfeil uten forhåndsvisning eller innsending', async ({ page }) => {
    const scenario: Scenario = { title: '', kind: 'ny', activity: 'arbeidstaker' };
    const submitRequests: Request[] = [];
    page.on('request', (request) => {
        if (isRequest(request, 'POST', ApiPath.OMP_UT_SOKNAD_SUBMIT)) submitRequests.push(request);
    });

    await openApplication(page, 'ny');
    await installMutationHandlers(page, 'ny', true);
    const editedSavePromise = waitForEditedSave(page, scenario);
    await fillValidForm(page, scenario);
    await expectEditedSave(await editedSavePromise, scenario);

    const validationResponsePromise = page.waitForResponse((response) =>
        isResponse(response, 'POST', ApiPath.OMP_UT_SOKNAD_VALIDER),
    );
    await page.getByRole('button', { name: 'Send inn', exact: true }).click();
    const validationResponse = await validationResponsePromise;
    expect(validationResponse.status()).toBe(400);
    expect(validationResponse.fromServiceWorker()).toBe(true);
    await expectApplicantHeader(validationResponse.request());
    expectPayload(validationResponse.request().postDataJSON() as OMPUTPayload, scenario);
    expect(await validationResponse.json()).toMatchObject({
        feil: [{ felt: 'feil', feilkode: 'generiskFeil', feilmelding: GENERIC_BACKEND_ERROR }],
    });

    await expect(page.getByText(`feil: ${GENERIC_BACKEND_ERROR}`)).toBeVisible();
    await expect(page.getByTestId('validertOMPUTSoknadModal')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Videre', exact: true })).toHaveCount(0);
    await expect(page.getByTestId('erdusikkermodal')).toHaveCount(0);
    expect(submitRequests).toHaveLength(0);
});
