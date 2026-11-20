import { expect, test, type Page, type Request, type Response } from '@playwright/test';

import { ApiPath } from '../../src/app/apiConfig';

const JOURNALPOST_ID = '200';
const APPLICATION_ID = '9356c863-ab88-41eb-89ec-3ca8cd555537';
const APPLICANT_ID = '17420373147';
const CHILD_ID = '24420167209';
const APPLICATION_PATH = ApiPath.OMP_AO_SOKNAD_GET.replace('{id}', APPLICATION_ID);
const APPLICATION_ROUTE = `/journalpost/${JOURNALPOST_ID}/omsorgspenger-alene-om-omsorgen/skjema/${APPLICATION_ID}/`;

type OMPAOFormDto = {
    soeknadId: string;
    soekerId: string;
    mottattDato: string;
    klokkeslett: string;
    journalposter: string[];
    barn: { norskIdent: string; foedselsdato: string | null };
    periode: { fom: string };
    metadata: { signatur: string };
    harInfoSomIkkeKanPunsjes: boolean;
    harMedisinskeOpplysninger: boolean;
};

type SaveGate = {
    holdNextUpdate: boolean;
    updateStarted: boolean;
    releaseUpdate?: () => void;
};

type OmpaoTestWindow = Window & { __ompaoSaveGate?: SaveGate };

const INITIAL_APPLICATION: OMPAOFormDto = {
    soeknadId: APPLICATION_ID,
    soekerId: APPLICANT_ID,
    mottattDato: '2020-10-12',
    klokkeslett: '12:53',
    journalposter: [JOURNALPOST_ID],
    barn: { norskIdent: CHILD_ID, foedselsdato: null },
    periode: { fom: '' },
    metadata: { signatur: '' },
    harInfoSomIkkeKanPunsjes: false,
    harMedisinskeOpplysninger: false,
};

const isResponse = (response: Response, method: string, path: string) =>
    response.request().method() === method && new URL(response.url()).pathname === path;

const isRequest = (request: Request, method: string, path: string) =>
    request.method() === method && new URL(request.url()).pathname === path;

const expectFormPayload = (payload: unknown, editedDate: string) => {
    expect(payload).toMatchObject({
        soeknadId: APPLICATION_ID,
        soekerId: APPLICANT_ID,
        mottattDato: '2020-10-12',
        klokkeslett: '12:53',
        journalposter: [JOURNALPOST_ID],
        barn: { norskIdent: CHILD_ID },
        periode: { fom: editedDate },
        metadata: { signatur: 'ikkeRelevant' },
        harInfoSomIkkeKanPunsjes: false,
        harMedisinskeOpplysninger: false,
    });
    expect(payload).not.toHaveProperty('norskIdent');
};

const expectReceipt = (receipt: unknown, editedDate: string) => {
    expect(receipt).toMatchObject({
        søknadId: APPLICATION_ID,
        mottattDato: '2020-10-12T10:53:00.000Z',
        søker: { norskIdentitetsnummer: APPLICANT_ID },
        ytelse: {
            type: 'OMP_UTV_AO',
            barn: { norskIdentitetsnummer: CHILD_ID },
            periode: `${editedDate}/..`,
        },
        journalposter: [
            {
                journalpostId: JOURNALPOST_ID,
                inneholderInformasjonSomIkkeKanPunsjes: false,
                inneholderMedisinskeOpplysninger: false,
            },
        ],
    });
};

const validDate = () => {
    const year = new Date().getFullYear() - 1;
    return {
        input: `01.10.${year}`,
        iso: `${year}-10-01`,
    };
};

async function openApplication(page: Page) {
    const responsePromise = page.waitForResponse((response) =>
        isResponse(response, 'GET', APPLICATION_PATH),
    );
    await page.goto(APPLICATION_ROUTE);
    const response = await responsePromise;

    expect(response.status()).toBe(200);
    expect(response.fromServiceWorker()).toBe(true);
    expect(await response.json()).toMatchObject({
        soeknadId: APPLICATION_ID,
        soekerId: APPLICANT_ID,
        mottattDato: '2020-10-12',
        klokkeslett: '12:53',
        journalposter: [JOURNALPOST_ID],
        barn: { norskIdent: CHILD_ID },
        periode: { fom: null },
        metadata: { signatur: '' },
        harInfoSomIkkeKanPunsjes: false,
        harMedisinskeOpplysninger: false,
    });
}

async function installMutationHandlers(page: Page, validationError = false) {
    await page.evaluate(
        ({
            updatePath,
            validationPath,
            submitPath,
            applicationId,
            initialApplication,
            shouldReturnValidationError,
        }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');

            let savedApplication = initialApplication;
            const gate: SaveGate = { holdNextUpdate: false, updateStarted: false };
            (window as OmpaoTestWindow).__ompaoSaveGate = gate;

            const receiptFor = (application: OMPAOFormDto) => ({
                søknadId: application.soeknadId,
                versjon: '1.0.0',
                mottattDato: `${application.mottattDato}T10:53:00.000Z`,
                søker: { norskIdentitetsnummer: application.soekerId },
                ytelse: {
                    type: 'OMP_UTV_AO',
                    barn: {
                        norskIdentitetsnummer: application.barn.norskIdent,
                        foedselsdato: application.barn.foedselsdato ?? '',
                    },
                    periode: `${application.periode.fom}/..`,
                },
                språk: 'nb',
                journalposter: application.journalposter.map((journalpostId) => ({
                    journalpostId,
                    inneholderInformasjonSomIkkeKanPunsjes: application.harInfoSomIkkeKanPunsjes,
                    inneholderMedisinskeOpplysninger: application.harMedisinskeOpplysninger,
                })),
                begrunnelseForInnsending: { tekst: null },
            });

            msw.worker.use(
                msw.http.put(updatePath, async ({ request }) => {
                    const application = (await request.json()) as OMPAOFormDto;
                    if (gate.holdNextUpdate) {
                        gate.holdNextUpdate = false;
                        gate.updateStarted = true;
                        await new Promise<void>((resolve) => {
                            gate.releaseUpdate = resolve;
                        });
                    }
                    savedApplication = application;
                    return msw.HttpResponse.json(savedApplication, { status: 200 });
                }),
                msw.http.post(validationPath, async ({ request }) => {
                    const application = (await request.json()) as OMPAOFormDto;
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
            updatePath: ApiPath.OMP_AO_SOKNAD_UPDATE,
            validationPath: ApiPath.OMP_AO_SOKNAD_VALIDER,
            submitPath: ApiPath.OMP_AO_SOKNAD_SUBMIT,
            applicationId: APPLICATION_ID,
            initialApplication: INITIAL_APPLICATION,
            shouldReturnValidationError: validationError,
        },
    );
}

test('sender inn OMPAO-søknaden og viser kvitteringen', async ({ page }) => {
    const date = validDate();
    const submitBodies: Record<string, unknown>[] = [];
    let confirming = false;
    let eventOrder = 0;
    let finalSaveResponseOrder = 0;
    let submitRequestOrder = 0;

    page.on('request', (request) => {
        if (isRequest(request, 'POST', ApiPath.OMP_AO_SOKNAD_SUBMIT)) {
            submitBodies.push(request.postDataJSON());
            submitRequestOrder = ++eventOrder;
        }
    });
    page.on('response', (response) => {
        if (
            confirming &&
            isResponse(response, 'PUT', ApiPath.OMP_AO_SOKNAD_UPDATE) &&
            response.request().postDataJSON().periode?.fom === date.iso
        ) {
            finalSaveResponseOrder = ++eventOrder;
            confirming = false;
        }
    });

    await openApplication(page);
    await installMutationHandlers(page);

    const dateInput = page.getByLabel('Søker er alene om omsorgen fra og med');
    const editedSavePromise = page.waitForResponse(
        (response) =>
            isResponse(response, 'PUT', ApiPath.OMP_AO_SOKNAD_UPDATE) &&
            response.request().postDataJSON().periode?.fom === date.iso,
    );
    await page.getByRole('radio', { name: 'Ikke relevant' }).check();
    await dateInput.fill(date.input);
    await dateInput.press('Tab');

    const editedSave = await editedSavePromise;
    expect(editedSave.status()).toBe(200);
    expect(editedSave.fromServiceWorker()).toBe(true);
    expectFormPayload(editedSave.request().postDataJSON(), date.iso);
    expect(await editedSave.json()).toMatchObject({ periode: { fom: date.iso } });

    const previewValidationPromise = page.waitForResponse((response) =>
        isResponse(response, 'POST', ApiPath.OMP_AO_SOKNAD_VALIDER),
    );
    await page.getByRole('button', { name: 'Send inn', exact: true }).click();
    const previewValidation = await previewValidationPromise;
    expect(previewValidation.status()).toBe(202);
    expect(previewValidation.fromServiceWorker()).toBe(true);
    expectFormPayload(previewValidation.request().postDataJSON(), date.iso);
    expectReceipt(await previewValidation.json(), date.iso);

    const preview = page.getByTestId('validertOMPAOSoknadModal');
    await expect(preview).toBeVisible();
    await expect(preview).toContainText(CHILD_ID);
    await expect(preview).toContainText(date.input);
    expect(submitBodies).toHaveLength(0);
    await page.getByRole('button', { name: 'Videre', exact: true }).click();

    const confirmation = page.getByTestId('erdusikkermodal');
    await expect(confirmation).toBeVisible();
    expect(submitBodies).toHaveLength(0);
    const finalValidationPromise = page.waitForResponse((response) =>
        isResponse(response, 'POST', ApiPath.OMP_AO_SOKNAD_VALIDER),
    );
    const finalSaveRequestPromise = page.waitForRequest(
        (request) =>
            isRequest(request, 'PUT', ApiPath.OMP_AO_SOKNAD_UPDATE) &&
            request.postDataJSON().periode?.fom === date.iso,
    );
    const finalSaveResponsePromise = page.waitForResponse(
        (response) =>
            isResponse(response, 'PUT', ApiPath.OMP_AO_SOKNAD_UPDATE) &&
            response.request().postDataJSON().periode?.fom === date.iso,
    );
    const submitResponsePromise = page.waitForResponse((response) =>
        isResponse(response, 'POST', ApiPath.OMP_AO_SOKNAD_SUBMIT),
    );

    await page.evaluate(() => {
        const gate = (window as OmpaoTestWindow).__ompaoSaveGate;
        if (!gate) throw new Error('Lagringsporten er ikke tilgjengelig.');
        gate.holdNextUpdate = true;
    });
    confirming = true;
    await confirmation.getByRole('button', { name: 'Send inn', exact: true }).click();

    const finalValidation = await finalValidationPromise;
    expect(finalValidation.status()).toBe(202);
    expectFormPayload(finalValidation.request().postDataJSON(), date.iso);
    await expect(page.getByTestId('validertOMPAOSoknadModal')).toHaveCount(0);
    const finalSaveRequest = await finalSaveRequestPromise;
    expectFormPayload(finalSaveRequest.postDataJSON(), date.iso);

    await page.waitForFunction(() => (window as OmpaoTestWindow).__ompaoSaveGate?.updateStarted);
    expect(submitBodies).toHaveLength(0);

    await page.evaluate(() => {
        const gate = (window as OmpaoTestWindow).__ompaoSaveGate;
        if (!gate?.releaseUpdate) throw new Error('Den pågående lagringen kan ikke frigis.');
        gate.releaseUpdate();
    });

    const finalSave = await finalSaveResponsePromise;
    expect(finalSave.status()).toBe(200);
    expect(finalSave.fromServiceWorker()).toBe(true);
    expectFormPayload(finalSave.request().postDataJSON(), date.iso);
    const submission = await submitResponsePromise;
    expect(submission.status()).toBe(202);
    expect(submission.fromServiceWorker()).toBe(true);
    expect(submission.request().postDataJSON()).toEqual({
        norskIdent: APPLICANT_ID,
        soeknadId: APPLICATION_ID,
    });
    expect(await submission.request().allHeaders()).toMatchObject({
        'x-nav-norskident': APPLICANT_ID,
    });
    expectReceipt(await submission.json(), date.iso);
    expect(submitBodies).toEqual([{ norskIdent: APPLICANT_ID, soeknadId: APPLICATION_ID }]);
    expect(finalSaveResponseOrder).toBeGreaterThan(0);
    expect(submitRequestOrder).toBeGreaterThan(finalSaveResponseOrder);

    await expect(
        page.getByText(
            'Opplysningene er sendt til behandling. Vær oppmerksom på at det kan ta litt tid før opplysningene er synlige på behandlingen i K9-sak.',
        ),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Oppsummering' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tilbake til LOS' })).toBeVisible();
    await expect(page.getByText(`Alene om omsorgen fra og med: ${date.input}`)).toBeVisible();
    await expect(page.getByText(`Barnets identitetsnummer: ${CHILD_ID}`)).toBeVisible();
});

test('viser klientfeil når signatur og startdato mangler', async ({ page }) => {
    const submitRequests: Request[] = [];
    page.on('request', (request) => {
        if (isRequest(request, 'POST', ApiPath.OMP_AO_SOKNAD_SUBMIT)) submitRequests.push(request);
    });

    await openApplication(page);
    await installMutationHandlers(page);

    const validationResponsePromise = page.waitForResponse((response) =>
        isResponse(response, 'POST', ApiPath.OMP_AO_SOKNAD_VALIDER),
    );
    await page.getByRole('button', { name: 'Send inn', exact: true }).click();
    const validationResponse = await validationResponsePromise;
    expect(validationResponse.status()).toBe(202);

    await expect(
        page.getByText('Du må fikse disse feilene før du kan sende inn punsjemeldingen.'),
    ).toBeVisible();
    const errorSummary = page.getByRole('list');
    await expect(errorSummary.getByText('Signatur er et påkrevd felt.')).toBeVisible();
    await expect(errorSummary.getByText(/Søker er alene om omsorgen fra og med/)).toBeVisible();
    await expect(page.getByTestId('validertOMPAOSoknadModal')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Videre', exact: true })).toHaveCount(0);
    await expect(page.getByTestId('erdusikkermodal')).toHaveCount(0);
    expect(submitRequests).toHaveLength(0);
});

test('viser backendfeil uten å åpne preview eller sende inn', async ({ page }) => {
    const date = validDate();
    const submitRequests: Request[] = [];
    page.on('request', (request) => {
        if (isRequest(request, 'POST', ApiPath.OMP_AO_SOKNAD_SUBMIT)) submitRequests.push(request);
    });

    await openApplication(page);
    await installMutationHandlers(page, true);

    await page.getByRole('radio', { name: 'Ikke relevant' }).check();
    const dateInput = page.getByLabel('Søker er alene om omsorgen fra og med');
    await dateInput.fill(date.input);
    await dateInput.press('Tab');

    const validationResponsePromise = page.waitForResponse((response) =>
        isResponse(response, 'POST', ApiPath.OMP_AO_SOKNAD_VALIDER),
    );
    await page.getByRole('button', { name: 'Send inn', exact: true }).click();
    const validationResponse = await validationResponsePromise;
    expect(validationResponse.status()).toBe(400);
    expect(validationResponse.fromServiceWorker()).toBe(true);
    expectFormPayload(validationResponse.request().postDataJSON(), date.iso);
    expect(await validationResponse.json()).toMatchObject({
        feil: [
            {
                felt: 'feil',
                feilkode: 'generiskFeil',
                feilmelding: 'Hei, det har oppstått en helt generisk feil. Med vennlig hilsen backend',
            },
        ],
    });

    await expect(
        page.getByText('feil: Hei, det har oppstått en helt generisk feil. Med vennlig hilsen backend'),
    ).toBeVisible();
    await expect(page.getByTestId('validertOMPAOSoknadModal')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Videre', exact: true })).toHaveCount(0);
    await expect(page.getByTestId('erdusikkermodal')).toHaveCount(0);
    expect(submitRequests).toHaveLength(0);
});
