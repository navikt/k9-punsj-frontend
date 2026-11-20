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
