import { expect, test, type Request } from '@playwright/test';

import pleiepengerSoknadSomKanSendesInn from '../../cypress/fixtures/pleiepengerSoknadSomKanSendesInn.json' with {
    type: 'json',
};
import pleiepengerSoknadValidering from '../../cypress/fixtures/pleiepengerSoknadValidering.json' with { type: 'json' };
import { ApiPath } from '../../src/app/apiConfig';

const JOURNALPOST_ID = '200';
const SØKNAD_ID = pleiepengerSoknadSomKanSendesInn.soeknadId;
const SØKER_ID = pleiepengerSoknadSomKanSendesInn.soekerId;
const OPPRINNELIG_DATO = '12.10.2024';
const REDIGERT_DATO = '14.03.2020';
const REDIGERT_DATO_ISO = '2020-03-14';
const FEIL_DATO = '15.03.2020';
const FEIL_DATO_ISO = '2020-03-15';
const GJENOPPRETTET_KLOKKESLETT = '13:15';

const isResponse = (response: import('@playwright/test').Response, method: string, path: string) =>
    response.request().method() === method && new URL(response.url()).pathname === path;
const isRequest = (request: import('@playwright/test').Request, method: string, path: string) =>
    request.method() === method && new URL(request.url()).pathname === path;

const expectApplicantHeader = async (request: Request) => {
    expect(await request.allHeaders()).toMatchObject({ 'x-nav-norskident': SØKER_ID });
};

test('lagrer og sender inn endret mottaksdato i PSB-skjemaet', async ({ page }) => {
    const applicationPath = ApiPath.PSB_SOKNAD_GET.replace('{id}', SØKNAD_ID);
    const submitRequests: Record<string, unknown>[] = [];
    page.on('request', (request) => {
        if (isRequest(request, 'POST', ApiPath.PSB_SOKNAD_SUBMIT)) {
            submitRequests.push(request.postDataJSON());
        }
    });

    const applicationResponsePromise = page.waitForResponse((response) =>
        isResponse(response, 'GET', applicationPath),
    );
    await page.goto(`/journalpost/${JOURNALPOST_ID}/pleiepenger-sykt-barn/skjema/${SØKNAD_ID}`);
    const applicationResponse = await applicationResponsePromise;
    expect(applicationResponse.status()).toBe(200);
    expect(applicationResponse.fromServiceWorker()).toBe(true);
    expect(await applicationResponse.json()).toEqual(pleiepengerSoknadSomKanSendesInn);

    const receivedDate = page.getByTestId('mottattDato');
    await expect(receivedDate).toHaveValue(OPPRINNELIG_DATO);
    await page.evaluate(
        ({ updatePath, validationPath, submitPath, application, validation }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');

            let savedApplication = application;
            const validationResponse = (mottattDato: string) => ({
                ...validation,
                mottattDato: `${mottattDato}T10:53:00.000Z`,
            });

            msw.worker.use(
                msw.http.put(updatePath, async ({ request }) => {
                    savedApplication = (await request.json()) as typeof application;
                    return msw.HttpResponse.json(savedApplication, { status: 200 });
                }),
                msw.http.post(validationPath, async ({ request }) => {
                    savedApplication = (await request.json()) as typeof application;
                    return msw.HttpResponse.json(validationResponse(savedApplication.mottattDato), { status: 202 });
                }),
                msw.http.post(submitPath, () =>
                    msw.HttpResponse.json(validationResponse(savedApplication.mottattDato), { status: 202 }),
                ),
            );
        },
        {
            updatePath: ApiPath.PSB_SOKNAD_UPDATE,
            validationPath: ApiPath.PSB_SOKNAD_VALIDER,
            submitPath: ApiPath.PSB_SOKNAD_SUBMIT,
            application: pleiepengerSoknadSomKanSendesInn,
            validation: pleiepengerSoknadValidering,
        },
    );

    const editedSavePromise = page.waitForResponse(
        (response) =>
            isResponse(response, 'PUT', ApiPath.PSB_SOKNAD_UPDATE) &&
            response.request().postDataJSON().soeknadId === SØKNAD_ID &&
            response.request().postDataJSON().mottattDato === REDIGERT_DATO_ISO,
    );
    await receivedDate.fill(REDIGERT_DATO);
    await receivedDate.press('Tab');
    const editedSave = await editedSavePromise;
    expect(editedSave.status()).toBe(200);
    expect(editedSave.fromServiceWorker()).toBe(true);
    expect(editedSave.request().postDataJSON()).toMatchObject({
        soeknadId: SØKNAD_ID,
        mottattDato: REDIGERT_DATO_ISO,
    });
    expect(await editedSave.json()).toMatchObject({
        soeknadId: SØKNAD_ID,
        mottattDato: REDIGERT_DATO_ISO,
    });
    await expect(receivedDate).toHaveValue(REDIGERT_DATO);

    const validationResponsePromise = page.waitForResponse((response) =>
        isResponse(response, 'POST', ApiPath.PSB_SOKNAD_VALIDER),
    );
    await page.getByRole('button', { name: /send inn/i }).click();
    const validationResponse = await validationResponsePromise;
    expect(validationResponse.status()).toBe(202);
    expect(validationResponse.fromServiceWorker()).toBe(true);
    expect(validationResponse.request().postDataJSON()).toMatchObject({
        soeknadId: SØKNAD_ID,
        mottattDato: REDIGERT_DATO_ISO,
    });
    expect(await validationResponse.json()).toMatchObject({
        søknadId: SØKNAD_ID,
        mottattDato: `${REDIGERT_DATO_ISO}T10:53:00.000Z`,
    });

    await page.getByRole('button', { name: /videre/i }).click();
    const confirmation = page.getByTestId('erdusikkermodal');
    await expect(confirmation).toBeVisible();
    const submissionResponsePromise = page.waitForResponse((response) =>
        isResponse(response, 'POST', ApiPath.PSB_SOKNAD_SUBMIT),
    );
    await confirmation.getByRole('button', { name: /send inn/i }).click();
    const submissionResponse = await submissionResponsePromise;
    expect(submissionResponse.status()).toBe(202);
    expect(submissionResponse.fromServiceWorker()).toBe(true);
    expect(submissionResponse.request().postDataJSON()).toEqual({
        norskIdent: SØKER_ID,
        soeknadId: SØKNAD_ID,
    });
    expect(await submissionResponse.json()).toMatchObject({
        søknadId: SØKNAD_ID,
        mottattDato: `${REDIGERT_DATO_ISO}T10:53:00.000Z`,
    });
    expect(submitRequests).toEqual([{ norskIdent: SØKER_ID, soeknadId: SØKNAD_ID }]);

    await expect(
        page.getByText(
            'Opplysningene er sendt til behandling. Vær oppmerksom på at det kan ta litt tid før opplysningene er synlige på behandlingen i K9-sak.',
        ),
    ).toBeVisible();
    await expect(page.getByText('Oppsummering', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /tilbake til los/i })).toBeVisible();
    await expect(page.getByTestId('mottakelsesdato')).toContainText(REDIGERT_DATO);
});

test('sender inn PSB-søknaden på nytt etter midlertidig sendefeil', async ({ page }) => {
    const applicationPath = ApiPath.PSB_SOKNAD_GET.replace('{id}', SØKNAD_ID);
    const submitRequests: Request[] = [];
    page.on('request', (request) => {
        if (isRequest(request, 'POST', ApiPath.PSB_SOKNAD_SUBMIT)) submitRequests.push(request);
    });

    const applicationResponsePromise = page.waitForResponse((response) =>
        isResponse(response, 'GET', applicationPath),
    );
    await page.goto(`/journalpost/${JOURNALPOST_ID}/pleiepenger-sykt-barn/skjema/${SØKNAD_ID}`);
    const applicationResponse = await applicationResponsePromise;
    expect(applicationResponse.status()).toBe(200);
    expect(applicationResponse.fromServiceWorker()).toBe(true);
    expect(await applicationResponse.json()).toEqual(pleiepengerSoknadSomKanSendesInn);

    await page.evaluate(
        ({ updatePath, validationPath, submitPath, application, validation, applicationId, applicantId }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');

            let savedApplication = application;
            let submitAttempts = 0;
            const receiptFor = (mottattDato: string) => ({
                ...validation,
                søknadId: applicationId,
                mottattDato: `${mottattDato}T10:53:00.000Z`,
            });

            msw.worker.use(
                msw.http.put(updatePath, async ({ request }) => {
                    savedApplication = (await request.json()) as typeof application;
                    return msw.HttpResponse.json(savedApplication, { status: 200 });
                }),
                msw.http.post(validationPath, async ({ request }) => {
                    savedApplication = (await request.json()) as typeof application;
                    return msw.HttpResponse.json(receiptFor(savedApplication.mottattDato), { status: 202 });
                }),
                msw.http.post(submitPath, async ({ request }) => {
                    const submission = (await request.json()) as { norskIdent?: string; soeknadId?: string };
                    if (
                        request.headers.get('X-Nav-NorskIdent') !== applicantId ||
                        submission.norskIdent !== applicantId ||
                        submission.soeknadId !== applicationId
                    ) {
                        return msw.HttpResponse.json({ title: 'Not Found', status: 404 }, { status: 404 });
                    }

                    submitAttempts += 1;
                    if (submitAttempts === 1) {
                        return msw.HttpResponse.json(
                            {
                                type: '/problem-details/innsending-feil',
                                title: 'Feil ved innsending av søknad',
                                status: 500,
                                detail: 'Midlertidig feil. Prøv igjen.',
                            },
                            { status: 500 },
                        );
                    }

                    return msw.HttpResponse.json(receiptFor(savedApplication.mottattDato), { status: 202 });
                }),
            );
        },
        {
            updatePath: ApiPath.PSB_SOKNAD_UPDATE,
            validationPath: ApiPath.PSB_SOKNAD_VALIDER,
            submitPath: ApiPath.PSB_SOKNAD_SUBMIT,
            application: pleiepengerSoknadSomKanSendesInn,
            validation: pleiepengerSoknadValidering,
            applicationId: SØKNAD_ID,
            applicantId: SØKER_ID,
        },
    );

    const receivedDate = page.getByTestId('mottattDato');
    await expect(receivedDate).toHaveValue(OPPRINNELIG_DATO);
    const editedSavePromise = page.waitForResponse(
        (response) =>
            isResponse(response, 'PUT', ApiPath.PSB_SOKNAD_UPDATE) &&
            response.request().postDataJSON().soeknadId === SØKNAD_ID &&
            response.request().postDataJSON().mottattDato === REDIGERT_DATO_ISO,
    );
    await receivedDate.fill(REDIGERT_DATO);
    await receivedDate.press('Tab');
    const editedSave = await editedSavePromise;
    expect(editedSave.status()).toBe(200);
    expect(editedSave.fromServiceWorker()).toBe(true);
    expect(editedSave.request().postDataJSON()).toMatchObject({
        soeknadId: SØKNAD_ID,
        mottattDato: REDIGERT_DATO_ISO,
    });

    const firstValidationPromise = page.waitForResponse((response) =>
        isResponse(response, 'POST', ApiPath.PSB_SOKNAD_VALIDER),
    );
    await page.getByRole('button', { name: /send inn/i }).click();
    const firstValidation = await firstValidationPromise;
    expect(firstValidation.status()).toBe(202);
    expect(firstValidation.fromServiceWorker()).toBe(true);
    expect(firstValidation.request().postDataJSON()).toMatchObject({
        soeknadId: SØKNAD_ID,
        mottattDato: REDIGERT_DATO_ISO,
    });
    expect(await firstValidation.json()).toMatchObject({
        søknadId: SØKNAD_ID,
        mottattDato: `${REDIGERT_DATO_ISO}T10:53:00.000Z`,
    });
    await expect(page.getByTestId('validertSoknadModal')).toBeVisible();
    await expect(page.getByTestId('mottattDato')).toHaveValue(REDIGERT_DATO);

    await page.getByRole('button', { name: /videre/i }).click();
    const firstConfirmation = page.getByTestId('erdusikkermodal');
    await expect(firstConfirmation).toBeVisible();
    expect(submitRequests).toHaveLength(0);

    const failedSubmitPromise = page.waitForResponse((response) =>
        isResponse(response, 'POST', ApiPath.PSB_SOKNAD_SUBMIT),
    );
    await firstConfirmation.getByRole('button', { name: /send inn/i }).click();
    const failedSubmit = await failedSubmitPromise;
    expect(failedSubmit.status()).toBe(500);
    expect(failedSubmit.fromServiceWorker()).toBe(true);
    await expectApplicantHeader(failedSubmit.request());
    expect(failedSubmit.request().postDataJSON()).toEqual({
        norskIdent: SØKER_ID,
        soeknadId: SØKNAD_ID,
    });
    expect(await failedSubmit.json()).toMatchObject({
        type: '/problem-details/innsending-feil',
        title: 'Feil ved innsending av søknad',
        status: 500,
        detail: 'Midlertidig feil. Prøv igjen.',
    });
    await expect(page.getByText('Midlertidig feil. Prøv igjen.', { exact: true })).toBeVisible();
    await expect(receivedDate).toHaveValue(REDIGERT_DATO);
    await expect(page.getByTestId('erdusikkermodal')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Oppsummering' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /tilbake til los/i })).toHaveCount(0);
    await expect(
        page.getByText(
            'Opplysningene er sendt til behandling. Vær oppmerksom på at det kan ta litt tid før opplysningene er synlige på behandlingen i K9-sak.',
        ),
    ).toHaveCount(0);

    const retryValidationPromise = page.waitForResponse((response) =>
        isResponse(response, 'POST', ApiPath.PSB_SOKNAD_VALIDER),
    );
    await page.getByRole('button', { name: /send inn/i }).click();
    const retryValidation = await retryValidationPromise;
    expect(retryValidation.status()).toBe(202);
    expect(retryValidation.fromServiceWorker()).toBe(true);
    expect(retryValidation.request().postDataJSON()).toMatchObject({
        soeknadId: SØKNAD_ID,
        mottattDato: REDIGERT_DATO_ISO,
    });
    await expect(page.getByTestId('validertSoknadModal')).toBeVisible();

    await page.getByRole('button', { name: /videre/i }).click();
    const retryConfirmation = page.getByTestId('erdusikkermodal');
    await expect(retryConfirmation).toBeVisible();
    expect(submitRequests).toHaveLength(1);

    const recoveredSubmitPromise = page.waitForResponse((response) =>
        isResponse(response, 'POST', ApiPath.PSB_SOKNAD_SUBMIT),
    );
    await retryConfirmation.getByRole('button', { name: /send inn/i }).click();
    const recoveredSubmit = await recoveredSubmitPromise;
    expect(recoveredSubmit.status()).toBe(202);
    expect(recoveredSubmit.fromServiceWorker()).toBe(true);
    await expectApplicantHeader(recoveredSubmit.request());
    expect(recoveredSubmit.request().postDataJSON()).toEqual(failedSubmit.request().postDataJSON());
    expect(await recoveredSubmit.json()).toMatchObject({
        søknadId: SØKNAD_ID,
        mottattDato: `${REDIGERT_DATO_ISO}T10:53:00.000Z`,
    });

    expect(submitRequests).toHaveLength(2);
    expect(submitRequests.map((request) => new URL(request.url()).pathname)).toEqual([
        ApiPath.PSB_SOKNAD_SUBMIT,
        ApiPath.PSB_SOKNAD_SUBMIT,
    ]);
    expect(submitRequests.map((request) => request.postDataJSON())).toEqual([
        { norskIdent: SØKER_ID, soeknadId: SØKNAD_ID },
        { norskIdent: SØKER_ID, soeknadId: SØKNAD_ID },
    ]);
    await Promise.all(submitRequests.map(expectApplicantHeader));

    await expect(
        page.getByText(
            'Opplysningene er sendt til behandling. Vær oppmerksom på at det kan ta litt tid før opplysningene er synlige på behandlingen i K9-sak.',
        ),
    ).toBeVisible();
    await expect(page.getByText('Oppsummering', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /tilbake til los/i })).toBeVisible();
    await expect(page.getByTestId('mottakelsesdato')).toContainText(REDIGERT_DATO);
});

test('beholder PSB-endringer ved lagringsfeil og lagrer dem ved neste endring', async ({ page }) => {
    const applicationPath = ApiPath.PSB_SOKNAD_GET.replace('{id}', SØKNAD_ID);
    const submissionRequests: string[] = [];
    page.on('request', (request) => {
        const path = new URL(request.url()).pathname;
        if (
            request.method() === 'POST' &&
            (path === ApiPath.PSB_SOKNAD_VALIDER || path === ApiPath.PSB_SOKNAD_SUBMIT)
        ) {
            submissionRequests.push(`${request.method()} ${path}`);
        }
    });

    const applicationResponsePromise = page.waitForResponse((response) =>
        isResponse(response, 'GET', applicationPath),
    );
    await page.goto(`/journalpost/${JOURNALPOST_ID}/pleiepenger-sykt-barn/skjema/${SØKNAD_ID}`);
    const applicationResponse = await applicationResponsePromise;
    expect(applicationResponse.status()).toBe(200);
    expect(applicationResponse.fromServiceWorker()).toBe(true);
    expect(await applicationResponse.json()).toEqual(pleiepengerSoknadSomKanSendesInn);
    const receivedDate = page.getByTestId('mottattDato');
    const receivedTime = page.getByLabel('Mottatt klokkeslett');
    await expect(receivedDate).toHaveValue(OPPRINNELIG_DATO);
    await expect(receivedTime).toHaveValue('12:53');

    await page.evaluate(
        ({ updatePath, applicationPath: getPath, applicationId, initialApplication, failedDate }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');

            let savedApplication = initialApplication;
            let failureReturned = false;
            msw.worker.use(
                msw.http.put(updatePath, async ({ request }) => {
                    const application = (await request.json()) as typeof initialApplication;
                    if (application.soeknadId !== applicationId) {
                        return msw.HttpResponse.json({ feil: 'Ugyldig søknads-ID' }, { status: 400 });
                    }
                    if (!failureReturned && application.mottattDato === failedDate) {
                        failureReturned = true;
                        return msw.HttpResponse.json({ feil: 'Syntetisk lagringsfeil' }, { status: 500 });
                    }
                    savedApplication = application;
                    return msw.HttpResponse.json(savedApplication, { status: 200 });
                }),
                msw.http.get(getPath, () => msw.HttpResponse.json(savedApplication, { status: 200 })),
            );
        },
        {
            updatePath: ApiPath.PSB_SOKNAD_UPDATE,
            applicationPath,
            applicationId: SØKNAD_ID,
            initialApplication: pleiepengerSoknadSomKanSendesInn,
            failedDate: FEIL_DATO_ISO,
        },
    );

    const readSavedApplication = async () => {
        const responsePromise = page.waitForResponse((response) =>
            isResponse(response, 'GET', applicationPath),
        );
        await page.evaluate(async ({ path, applicantId }) => {
            const response = await fetch(path, { headers: { 'X-Nav-NorskIdent': applicantId } });
            if (!response.ok) throw new Error(`Lesing av lagret PSB-utkast feilet: ${response.status}`);
            await response.json();
        }, { path: applicationPath, applicantId: SØKER_ID });
        const response = await responsePromise;
        expect(response.status()).toBe(200);
        expect(response.fromServiceWorker()).toBe(true);
        return response.json();
    };

    expect(await readSavedApplication()).toEqual(pleiepengerSoknadSomKanSendesInn);

    const failedSavePromise = page.waitForResponse(
        (response) =>
            isResponse(response, 'PUT', ApiPath.PSB_SOKNAD_UPDATE) &&
            response.request().postDataJSON().soeknadId === SØKNAD_ID &&
            response.request().postDataJSON().mottattDato === FEIL_DATO_ISO,
    );
    await receivedDate.fill(FEIL_DATO);
    await receivedDate.press('Tab');

    const failedSave = await failedSavePromise;
    expect(failedSave.status()).toBe(500);
    expect(failedSave.fromServiceWorker()).toBe(true);
    expect(failedSave.request().method()).toBe('PUT');
    expect(new URL(failedSave.url()).pathname).toBe(ApiPath.PSB_SOKNAD_UPDATE);
    expect(failedSave.request().postDataJSON()).toMatchObject({
        soeknadId: SØKNAD_ID,
        soekerId: SØKER_ID,
        mottattDato: FEIL_DATO_ISO,
        klokkeslett: '12:53',
        journalposter: [JOURNALPOST_ID],
    });
    await expect(page.getByText('Det oppsto en feil under lagring av endringer.', { exact: true })).toBeVisible();
    await expect(page.getByText('Lagring feilet', { exact: true })).toBeVisible();
    await expect(receivedDate).toHaveValue(FEIL_DATO);
    await expect(receivedTime).toHaveValue('12:53');
    expect(await readSavedApplication()).toEqual(pleiepengerSoknadSomKanSendesInn);

    const recoveredSavePromise = page.waitForResponse(
        (response) =>
            isResponse(response, 'PUT', ApiPath.PSB_SOKNAD_UPDATE) &&
            response.request().postDataJSON().soeknadId === SØKNAD_ID &&
            response.request().postDataJSON().klokkeslett === GJENOPPRETTET_KLOKKESLETT,
    );
    await receivedTime.fill(GJENOPPRETTET_KLOKKESLETT);
    await receivedDate.click();

    const recoveredSave = await recoveredSavePromise;
    expect(recoveredSave.status()).toBe(200);
    expect(recoveredSave.fromServiceWorker()).toBe(true);
    expect(recoveredSave.request().method()).toBe('PUT');
    expect(new URL(recoveredSave.url()).pathname).toBe(ApiPath.PSB_SOKNAD_UPDATE);
    const recoveredPayload = recoveredSave.request().postDataJSON();
    expect(await recoveredSave.json()).toEqual(recoveredPayload);
    await expect(receivedDate).toHaveValue(FEIL_DATO);
    await expect(receivedTime).toHaveValue(GJENOPPRETTET_KLOKKESLETT);
    await expect(page.getByText('Det oppsto en feil under lagring av endringer.', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Lagring feilet', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Lagret', { exact: true })).toBeVisible();
    const recoveredDraft = await readSavedApplication();
    expect(recoveredDraft).toEqual(recoveredPayload);
    expect(submissionRequests).toEqual([]);
    expect(recoveredPayload).toMatchObject({
        soeknadId: SØKNAD_ID,
        soekerId: SØKER_ID,
        mottattDato: FEIL_DATO_ISO,
        klokkeslett: GJENOPPRETTET_KLOKKESLETT,
        journalposter: [JOURNALPOST_ID],
    });
});

test('viser valideringsfeil når frilanserens sluttdato er før startdato', async ({ page }) => {
    await page.goto(`/journalpost/${JOURNALPOST_ID}/pleiepenger-sykt-barn/skjema/${SØKNAD_ID}`);
    await page.getByRole('button', { name: /Arbeidsforhold og arbeidstid i søknadsperioden/i }).click();
    await page.getByLabel('Frilanser').check();

    const startDate = page.getByLabel('Når startet søker som frilanser?');
    const endDate = page.getByLabel('Når sluttet søker som frilanser?');
    await startDate.fill('10.10.2022');
    await startDate.press('Tab');
    await endDate.fill('01.10.2022');
    await endDate.press('Tab');

    await expect(endDate).toHaveValue('01.10.2022');
    await expect(endDate).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText('Sluttdato kan ikke være før startdato.')).toBeVisible();
});

test('registrerer arbeidstid for lengre perioder og konverterer tidsformat', async ({ page }) => {
    await page.goto(`/journalpost/${JOURNALPOST_ID}/pleiepenger-sykt-barn/skjema/${SØKNAD_ID}`);

    const applicationPeriods = page.getByTestId('søknadsperioder');
    await applicationPeriods.getByRole('button', { name: /Legg til ny periode/i }).click();
    const applicationStartDate = applicationPeriods.getByLabel('Fra og med').nth(1);
    await applicationStartDate.fill('20.11.2021');
    await applicationStartDate.press('Tab');
    const applicationEndDate = applicationPeriods.getByLabel('Til og med').nth(1);
    await applicationEndDate.fill('25.11.2021');
    await applicationEndDate.press('Tab');

    await page.getByRole('button', { name: /Arbeidsforhold og arbeidstid i søknadsperioden/i }).click();
    await page.getByLabel('Arbeidstaker').check();
    await page.getByRole('button', { name: /Registrer arbeidstid for en lengre periode/i }).click();

    const periodList = page.locator('[data-test-id="arbeidstid-periode-liste"]');
    const firstStartDate = periodList.getByLabel('Fra og med').first();
    await firstStartDate.fill('08.11.2021');
    await firstStartDate.press('Tab');
    const firstEndDate = periodList.getByLabel('Til og med').first();
    await firstEndDate.fill('11.11.2021');
    await firstEndDate.press('Tab');

    await periodList.getByLabel('Timer').nth(0).fill('7');
    await periodList.getByLabel('Minutter').nth(0).fill('30');
    await periodList.getByLabel('Timer').nth(1).fill('2');
    await page.getByRole('radio', { name: /Desimaltall/i }).click();
    await expect(page.getByLabel('Normal arbeidstid')).toHaveValue('7.5');
    await expect(page.getByLabel('Faktisk arbeidstid')).toHaveValue('2');

    await page.getByLabel('Normal arbeidstid').fill('5.75');
    await page.getByLabel('Faktisk arbeidstid').fill('4');
    await page.getByRole('radio', { name: /Timer og minutter/i }).click();
    await expect(periodList.getByLabel('Timer').nth(0)).toHaveValue('5');
    await expect(periodList.getByLabel('Minutter').nth(0)).toHaveValue('45');
    await expect(periodList.getByLabel('Timer').nth(1)).toHaveValue('4');

    await periodList.getByRole('button', { name: /Legg til ny periode/i }).click();
    const secondStartDate = periodList.getByLabel('Fra og med').nth(1);
    await secondStartDate.fill('20.11.2021');
    await secondStartDate.press('Tab');
    const secondEndDate = periodList.getByLabel('Til og med').nth(1);
    await secondEndDate.fill('25.11.2021');
    await secondEndDate.press('Tab');
    await periodList.getByLabel('Timer').nth(2).fill('7');
    await periodList.getByLabel('Timer').nth(3).fill('2');

    await periodList.getByRole('button', { name: 'Lagre', exact: true }).click();
    await page.getByRole('button', { name: /Vis mer/i }).click();
    await expect(page.getByText('10 dager registrert')).toBeVisible();
    await page.getByRole('button', { name: /Vis mer/i }).last().click();

    for (const date of ['08', '09', '10', '11']) {
        const calendarDay = page.getByTestId(`calendar-grid-date-2021-11-${date}`);
        await expect(calendarDay).toContainText('4 t');
        await expect(calendarDay).toContainText('5 t 45 min');
    }

    for (const date of ['20', '21', '22', '23', '24', '25']) {
        const calendarDay = page.getByTestId(`calendar-grid-date-2021-11-${date}`);
        await expect(calendarDay).toContainText('2 t');
        await expect(calendarDay).toContainText('7 t');
    }
});
