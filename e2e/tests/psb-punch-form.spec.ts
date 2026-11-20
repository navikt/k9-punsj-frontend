import { expect, test } from '@playwright/test';

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

const isResponse = (response: import('@playwright/test').Response, method: string, path: string) =>
    response.request().method() === method && new URL(response.url()).pathname === path;
const isRequest = (request: import('@playwright/test').Request, method: string, path: string) =>
    request.method() === method && new URL(request.url()).pathname === path;

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
